## dot-sphere-waveform

Sphere-based waveform renderer for React + three.js. GPU-driven effects (noise, ripple, spin) with dual-lane shader morphing for seamless transitions.

### Install

```bash
npm install dot-sphere-waveform three @react-three/fiber @react-three/drei
```

Peer deps: `react`, `react-dom`, `three`, `@react-three/fiber`, `@react-three/drei`.

### Usage (controlled config + headless animator)

```tsx
import { Canvas } from '@react-three/fiber';
import { SphereWaveform, useMorphAnimator, type WaveformConfig } from 'dot-sphere-waveform';

function Example() {
  const [config, setConfig] = useState<WaveformConfig>({
    volume: 0,
    radius: 1,
    pointSize: 0.04,
    shellCount: 1,
    size: 1,
    opacity: 1,
    rotationX: 0, rotationY: 0, rotationZ: 0,
    randomishAmount: 0.6, randomishSpeed: 1.8, pulseSize: 0.8,
    sineAmount: 0.3, sineSpeed: 1.7, sineScale: 1.0,
    rippleAmount: 0.0, rippleSpeed: 1.5, rippleScale: 3.0,
    surfaceRippleAmount: 0.0, surfaceRippleSpeed: 1.5, surfaceRippleScale: 3.0,
    spinSpeed: 0.35, spinAxisX: 0, spinAxisY: 0,
    maskRadius: 0, maskFeather: 0, maskInvert: false,
    pointColor: '#ffffff', gradientColor2: '#ffffff', gradientAngle: 0,
    glowColor: '#ffffff', glowStrength: 0, glowRadiusFactor: 0,
    sizeRandomness: 0,
    arcMaxCount: 4, arcSpawnRate: 0.25, arcDuration: 4, arcSpeed: 1.5, arcSpanDeg: 60, arcThickness: 0.06, arcFeather: 0.04, arcBrightness: 1, arcAltitude: 0.02,
    seed: 1,
    freezeTime: false, advanceCount: 0, advanceAmount: 1/60,
    blendingMode: 'normal',
    micEnvelope: 0, randomishMicModAmount: 0, sineMicModAmount: 0, rippleMicModAmount: 0, surfaceRippleMicModAmount: 0,
  });

  const { morph, play } = useMorphAnimator({
    ease: 'power2.inOut',
    onComplete: (final) => setConfig(final),
  });

  function toPresetB() {
    play({ duration: 1.0, to: { sineAmount: 0.8, rippleAmount: 0.25, maskRadius: 0.3 } }, config);
  }

  return (
    <>
      <button onClick={toPresetB}>Animate</button>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <SphereWaveform {...config} morph={morph} />
      </Canvas>
    </>
  );
}
```

### API

- `SphereWaveform(props)`
  - Renderer-only; all effects are value-driven (0 = off). Pass `morph={{enabled,progress,to}}` for dual-lane blending.
- `useMorphAnimator({ ease?, onStart?, onUpdate?, onComplete? })`
  - Returns `{ morph, play(anim, from), cancel, playing, progress }`
- `MorphController`
  - imperative alternative for non-React environments
- `interpolateConfig(from, to, t)`
  - pure config interpolation util (for UI previews)

#### Mic props
- `micEnvelope` (number 0..1): mic-driven modulation value
- `randomishMicModAmount`, `sineMicModAmount`, `rippleMicModAmount`, `surfaceRippleMicModAmount` (0..1): per-effect modulation depth from `micEnvelope`

### Microphone input

You provide a normalized `micEnvelope` (0..1). Minimal example hook:

```tsx
function useMicEnvelope(smoothing = 0.85) {
  const [env, setEnv] = useState(0);
  useEffect(() => {
    let ctx: AudioContext | null = null, analyser: AnalyserNode | null = null, src: MediaStreamAudioSourceNode | null = null, raf = 0;
    let data: Float32Array;
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = smoothing;
      src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      data = new Float32Array(analyser.fftSize);
      const tick = () => {
        analyser!.getFloatTimeDomainData(data);
        let rms = 0; for (let i = 0; i < data.length; i++) rms += data[i] * data[i];
        rms = Math.sqrt(rms / data.length);
        const v = Math.min(1, rms * 4); // simple gain
        setEnv((e) => e + (v - e) * 0.2); // light EMA
        raf = requestAnimationFrame(tick);
      };
      tick();
    })();
    return () => { if (raf) cancelAnimationFrame(raf); src?.disconnect(); analyser?.disconnect(); ctx?.close(); };
  }, [smoothing]);
  return env;
}

// Usage
const micEnvelope = useMicEnvelope();
<SphereWaveform {...config} micEnvelope={micEnvelope} />
```

### Notes

- Phase continuity handled in-shader via dual-lane morph; avoid interpolating speeds/scales on CPU.
- Keep a single source of truth: commit target config in `onComplete`.
- All toggles are treated as on; set amounts to 0 to disable.
