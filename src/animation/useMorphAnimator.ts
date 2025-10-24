import { useCallback, useEffect, useRef, useState } from 'react';
import type { SphereWaveformProps } from '../components/SphereWaveform';
import { getEaser, type AnimEase } from './easing';

export type WaveformConfig = Omit<SphereWaveformProps, 'transition' | 'morph'>;

export type AnimSpec = {
  to: Partial<WaveformConfig>;
  duration: number; // seconds
  ease?: AnimEase;
};

export function interpolateConfig(
  from: WaveformConfig,
  to: Partial<WaveformConfig>,
  t: number
): WaveformConfig {
  const out: any = { ...from };
  const mixNum = (a: number, b: number) => a + (b - a) * t;
  const maybe = <T,>(v: T | undefined, fallback: T): T => (v === undefined ? fallback : v);

  const numericKeys: Array<keyof WaveformConfig> = [
    'vertexCount','volume','radius','pointSize','shellCount','seed','size','opacity',
    'rotationX','rotationY','rotationZ',
    'randomishAmount','randomishSpeed','pulseSize',
    'rippleAmount','rippleSpeed','rippleScale',
    'surfaceRippleAmount','surfaceRippleSpeed','surfaceRippleScale',
    'spinSpeed','spinAxisX','spinAxisY',
    'maskRadius','maskFeather',
    'sineAmount','sineSpeed','sineScale',
    'glowStrength','glowRadiusFactor','sizeRandomness',
    'arcMaxCount','arcSpawnRate','arcDuration','arcSpeed','arcSpanDeg','arcThickness','arcFeather','arcBrightness','arcAltitude',
    'advanceCount','advanceAmount',
  ];

  for (const key of numericKeys) {
    const a = from[key] as unknown as number;
    const b = maybe(to[key] as unknown as number | undefined, a);
    if (typeof a === 'number' && typeof b === 'number') out[key] = mixNum(a, b);
  }

  const colorKeys: Array<keyof WaveformConfig> = ['pointColor','glowColor','gradientColor2'];
  for (const key of colorKeys) {
    const a = from[key] as unknown as string | undefined;
    const b = (to[key] as unknown as string | undefined) ?? a;
    if (typeof a === 'string' && typeof b === 'string') {
      try {
        // Keep output as hex string for UI friendliness
        const ca = new (window as any).THREE.Color(a);
        const cb = new (window as any).THREE.Color(b);
        const cm = ca.clone().lerp(cb, t);
        out[key] = `#${cm.getHexString()}`;
      } catch {
        out[key] = t < 0.5 ? a : b;
      }
    }
  }

  // Booleans are always-on; keep existing values (zero=off policy)
  out.enableRandomishNoise = true;
  out.enableSineNoise = true;
  out.enableRippleNoise = true;
  out.enableSurfaceRipple = true;
  out.enableSpin = true;
  out.enableGradient = true;
  out.enableArcs = true;
  out.maskEnabled = true;

  // Non-animative flags
  out.freezeTime = from.freezeTime;
  out.advanceCount = from.advanceCount;
  out.advanceAmount = from.advanceAmount;
  out.maskInvert = from.maskInvert;
  out.blendingMode = from.blendingMode;

  return out as WaveformConfig;
}

export function useMorphAnimator(opts?: {
  ease?: AnimEase;
  onStart?: () => void;
  onUpdate?: (progress: number) => void;
  onComplete?: (final: WaveformConfig) => void;
}) {
  const easeFnRef = useRef<(t: number) => number>(getEaser(opts?.ease ?? 'power2.inOut'));
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const durRef = useRef<number>(0);
  const fromRef = useRef<WaveformConfig | null>(null);
  const toRef = useRef<Partial<WaveformConfig> | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toState, setToState] = useState<Partial<WaveformConfig> | undefined>(undefined);

  useEffect(() => {
    easeFnRef.current = getEaser(opts?.ease ?? 'power2.inOut');
  }, [opts?.ease]);

  const cancel = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setEnabled(false);
  }, []);

  const play = useCallback((anim: AnimSpec, from: WaveformConfig) => {
    cancel();
    fromRef.current = { ...from };
    toRef.current = { ...anim.to };
    durRef.current = Math.max(0, anim.duration) * 1000;
    easeFnRef.current = getEaser(anim.ease ?? opts?.ease ?? 'power2.inOut');

    setToState(anim.to);
    setEnabled(true);
    setProgress(0);
    opts?.onStart?.();

    startRef.current = performance.now();
    const tick = () => {
      const now = performance.now();
      const t = durRef.current === 0 ? 1 : Math.min(1, (now - startRef.current) / durRef.current);
      const te = easeFnRef.current(t);
      setProgress(te);
      opts?.onUpdate?.(te);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        setEnabled(false);
        const final = interpolateConfig(fromRef.current!, toRef.current!, 1);
        opts?.onComplete?.(final);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [cancel, opts]);

  const morph = enabled
    ? { enabled: true, progress, to: toState }
    : { enabled: false, progress: 0 };

  return { morph, play, cancel, playing: enabled, progress } as const;
}

export class MorphController {
  private easeFn: (t: number) => number;
  private raf: number | null = null;
  private start = 0;
  private durMs = 0;
  private from!: WaveformConfig;
  private to!: Partial<WaveformConfig>;

  constructor(ease: AnimEase = 'power2.inOut') {
    this.easeFn = getEaser(ease);
  }

  cancel() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  async play(anim: AnimSpec, from: WaveformConfig, onProgress: (p: number, to: Partial<WaveformConfig>) => void): Promise<WaveformConfig> {
    this.cancel();
    this.from = { ...from };
    this.to = { ...anim.to };
    this.durMs = Math.max(0, anim.duration) * 1000;
    this.easeFn = getEaser(anim.ease ?? 'power2.inOut');
    this.start = performance.now();

    return new Promise<WaveformConfig>((resolve) => {
      const tick = () => {
        const now = performance.now();
        const t = this.durMs === 0 ? 1 : Math.min(1, (now - this.start) / this.durMs);
        const te = this.easeFn(t);
        onProgress(te, this.to);
        if (t < 1) {
          this.raf = requestAnimationFrame(tick);
        } else {
          this.raf = null;
          resolve(interpolateConfig(this.from, this.to, 1));
        }
      };
      this.raf = requestAnimationFrame(tick);
    });
  }
}


