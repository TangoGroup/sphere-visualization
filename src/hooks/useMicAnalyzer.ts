import { useCallback, useEffect, useRef, useState } from 'react';

export interface MicAnalyzerOptions {
  smoothingTimeConstant?: number;
  fftSize?: number; // must be power of two, e.g., 512, 1024
}

export interface MicAnalyzer {
  volume: number; // 0..1
  isActive: boolean;
  error?: string;
  start: () => Promise<void>;
  stop: () => void;
}

export function useMicAnalyzer(options: MicAnalyzerOptions = {}): MicAnalyzer {
  const { smoothingTimeConstant = 0.8, fftSize = 1024 } = options;

  const [volume, setVolume] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
  }, []);

  const lastVolumeRef = useRef<number>(0);
  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.fftSize;
    const timeDomainData = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(timeDomainData);

    // Compute RMS
    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i += 1) {
      const v = (timeDomainData[i] - 128) / 128; // -1..1
      sumSquares += v * v;
    }
    const rms = Math.sqrt(sumSquares / bufferLength); // 0..~1

    // Apply soft scaling to 0..1
    const normalized = Math.min(1, rms * 1.6);
    // Exponential moving average for stability (visual smoothing)
    const alpha = 0.35; // UI can additionally smooth via config.micSmoothing; this is baseline
    const smoothed = lastVolumeRef.current * (1 - alpha) + normalized * alpha;
    lastVolumeRef.current = smoothed;
    setVolume(smoothed);

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    try {
      if (isActive) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const AC: typeof AudioContext = window.AudioContext ?? window.webkitAudioContext!;
      const audioContext = new AC();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = smoothingTimeConstant;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      source.connect(analyser);
      setIsActive(true);
      setError(undefined);
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown microphone error';
      setError(message);
      cleanup();
    }
  }, [cleanup, fftSize, isActive, smoothingTimeConstant, tick]);

  const stop = useCallback(() => {
    cleanup();
  }, [cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  return { volume, isActive, error, start, stop };
}
