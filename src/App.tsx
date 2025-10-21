import { useMemo, Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import SphereWaveform from './components/SphereWaveform';
import { ControlSidebar } from './components/ControlSidebar';
import { useConfigStore } from './stores/configStore';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import AnimationSidebar from '@/components/AnimationSidebar';
import { useAnimationStore } from '@/stores/animationStore';
import { useMicAnalyzer } from '@/hooks/useMicAnalyzer';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Easing util (matches component eases)
type AnimEase =
  | 'linear'
  | 'power1.in' | 'power1.out' | 'power1.inOut'
  | 'power2.in' | 'power2.out' | 'power2.inOut'
  | 'power3.in' | 'power3.out' | 'power3.inOut'
  | 'power4.in' | 'power4.out' | 'power4.inOut'
  | 'sine.in' | 'sine.out' | 'sine.inOut'
  | 'expo.in' | 'expo.out' | 'expo.inOut'
  | 'back.in' | 'back.out' | 'back.inOut'
  | 'elastic.in' | 'elastic.out' | 'elastic.inOut'
  | 'bounce.in' | 'bounce.out' | 'bounce.inOut';

function getEaser(name: AnimEase | undefined): (t: number) => number {
  switch (name) {
    case 'linear': return (t: number) => t;
    case 'power1.in': return (t: number) => t * t;
    case 'power1.out': return (t: number) => 1 - Math.pow(1 - t, 2);
    case 'power1.inOut': return (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    case 'power2.in': return (t: number) => t * t * t;
    case 'power2.out': return (t: number) => 1 - Math.pow(1 - t, 3);
    case 'power2.inOut': return (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    case 'power3.in': return (t: number) => t * t * t * t;
    case 'power3.out': return (t: number) => 1 - Math.pow(1 - t, 4);
    case 'power3.inOut': return (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
    case 'power4.in': return (t: number) => t * t * t * t * t;
    case 'power4.out': return (t: number) => 1 - Math.pow(1 - t, 5);
    case 'power4.inOut': return (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2);
    case 'sine.in': return (t: number) => 1 - Math.cos((t * Math.PI) / 2);
    case 'sine.out': return (t: number) => Math.sin((t * Math.PI) / 2);
    case 'sine.inOut': return (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
    case 'expo.in': return (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1)));
    case 'expo.out': return (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    case 'expo.inOut': return (t: number) => {
      if (t === 0 || t === 1) return t;
      return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
    };
    case 'back.in': return (t: number) => 2.7 * t * t * t - 1.7 * t * t;
    case 'back.out': return (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
    case 'back.inOut': return (t: number) => {
      const c1 = 1.70158; const c2 = c1 * 1.525;
      return t < 0.5 ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
    };
    case 'elastic.in': return (t: number) => { const c4 = (2 * Math.PI) / 3; return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4); };
    case 'elastic.out': return (t: number) => { const c4 = (2 * Math.PI) / 3; return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1; };
    case 'elastic.inOut': return (t: number) => { const c5 = (2 * Math.PI) / 4.5; return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2 : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1; };
    case 'bounce.in': return (t: number) => 1 - getEaser('bounce.out')(1 - t);
    case 'bounce.out': return (t: number) => { const n1 = 7.5625; const d1 = 2.75; if (t < 1 / d1) { return n1 * t * t; } else if (t < 2 / d1) { return n1 * (t -= 1.5 / d1) * t + 0.75; } else if (t < 2.5 / d1) { return n1 * (t -= 2.25 / d1) * t + 0.9375; } else { return n1 * (t -= 2.625 / d1) * t + 0.984375; } };
    case 'bounce.inOut': return (t: number) => t < 0.5 ? (1 - getEaser('bounce.out')(1 - 2 * t)) / 2 : (1 + getEaser('bounce.out')(2 * t - 1)) / 2;
    default: return (t: number) => t;
  }
}

type AnimatableNumericKey =
  | 'pointSize' | 'size' | 'opacity'
  | 'rotationX' | 'rotationY' | 'rotationZ'
  | 'randomishAmount' | 'pulseSize'
  | 'sineAmount'
  | 'rippleAmount'
  | 'surfaceRippleAmount'
  | 'spinSpeed' | 'spinAxisX' | 'spinAxisY'
  | 'maskRadius' | 'maskFeather'
  | 'gradientAngle' | 'sizeRandomness'
  | 'glowStrength' | 'glowRadiusFactor'
  | 'arcSpawnRate' | 'arcDuration' | 'arcSpeed' | 'arcSpanDeg' | 'arcThickness' | 'arcFeather' | 'arcBrightness' | 'arcAltitude';

type AnimatableColorKey = 'pointColor' | 'gradientColor2' | 'glowColor';

function Scene({ volume, vertexCount, pointSize, shellCount, freezeTime, advanceCount, randomishAmount, sineAmount, pulseSize, spinSpeed, spinAxisX, spinAxisY, maskRadius, maskFeather, maskInvert, sineSpeed, sineScale, randomishSpeed, pointColor, glowColor, glowStrength, glowRadiusFactor, sizeRandomness, backgroundTheme, rippleAmount, rippleSpeed, rippleScale, surfaceRippleAmount, surfaceRippleSpeed, surfaceRippleScale, arcMaxCount, arcSpawnRate, arcDuration, arcSpeed, arcSpanDeg, arcThickness, arcFeather, arcBrightness, arcAltitude, size, opacity, rotationX, rotationY, rotationZ, micEnvelope, randomishMicModAmount, sineMicModAmount, rippleMicModAmount, surfaceRippleMicModAmount, gradientColor2, gradientAngle, morph }: { 
  volume: number; 
  vertexCount: number; 
  pointSize: number; 
  shellCount: number; 
  freezeTime: boolean; 
  advanceCount: number; 
  randomishAmount: number;
  sineAmount: number;
  pulseSize: number; 
  spinSpeed: number; 
  spinAxisX: number;
  spinAxisY: number;
  maskRadius: number;
  maskFeather: number;
  maskInvert: boolean;
  sineSpeed: number;
  sineScale: number;
  randomishSpeed: number;
  pointColor: string;
  glowColor: string;
  glowStrength: number;
  glowRadiusFactor: number;
  sizeRandomness: number;
  backgroundTheme: 'dark' | 'light';
  rippleAmount: number;
  rippleSpeed: number;
  rippleScale: number;
  surfaceRippleAmount: number;
  surfaceRippleSpeed: number;
  surfaceRippleScale: number;
  arcMaxCount: number;
  arcSpawnRate: number;
  arcDuration: number;
  arcSpeed: number;
  arcSpanDeg: number;
  arcThickness: number;
  arcFeather: number;
  arcBrightness: number;
  arcAltitude: number;
  size: number;
  opacity: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  micEnvelope: number;
  randomishMicModAmount: number;
  sineMicModAmount: number;
  rippleMicModAmount: number;
  surfaceRippleMicModAmount: number;
  gradientColor2: string;
  gradientAngle: number;
  morph?: {
    enabled?: boolean;
    progress?: number;
    to?: Partial<any>;
  };
}) {
  const bg = useMemo(() => new THREE.Color(backgroundTheme === 'dark' ? '#0b0f13' : '#ffffff'), [backgroundTheme]);
  const blendingMode = backgroundTheme === 'light' ? 'normal' : 'additive' as const;
  const pc = (pointColor || '').trim().toLowerCase();
  const isWhite = pc === '#ffffff' || pc === '#fff';
  // Only substitute on light bg when gradient is disabled, to respect white in gradients
  const displayPointColor = backgroundTheme === 'light' && isWhite ? '#0b0f13' : pointColor;
  return (
    <>
      <color attach="background" args={[bg]} />
      <ambientLight intensity={0.3} />
      <Suspense fallback={null}>
        <SphereWaveform
          vertexCount={vertexCount}
          volume={volume}
          pointSize={pointSize}
          shellCount={shellCount}
          freezeTime={freezeTime}
          advanceCount={advanceCount}
          size={size}
          opacity={opacity}
          rotationX={rotationX}
          rotationY={rotationY}
          rotationZ={rotationZ}
          randomishAmount={randomishAmount}
          sineAmount={sineAmount}
          pulseSize={pulseSize}
          spinSpeed={spinSpeed}
          randomishSpeed={randomishSpeed}
          spinAxisX={spinAxisX}
          spinAxisY={spinAxisY}
          maskRadius={maskRadius}
          maskFeather={maskFeather}
          maskInvert={maskInvert}
          sineSpeed={sineSpeed}
          sineScale={sineScale}
          pointColor={displayPointColor}
          gradientColor2={gradientColor2}
          gradientAngle={gradientAngle}
          glowColor={glowColor}
          glowStrength={glowStrength}
          glowRadiusFactor={glowRadiusFactor}
          sizeRandomness={sizeRandomness}
          blendingMode={blendingMode}
          
          rippleAmount={rippleAmount}
          rippleSpeed={rippleSpeed}
          rippleScale={rippleScale}
          surfaceRippleAmount={surfaceRippleAmount}
          surfaceRippleSpeed={surfaceRippleSpeed}
          surfaceRippleScale={surfaceRippleScale}
          arcMaxCount={arcMaxCount}
          arcSpawnRate={arcSpawnRate}
          arcDuration={arcDuration}
          arcSpeed={arcSpeed}
          arcSpanDeg={arcSpanDeg}
          arcThickness={arcThickness}
          arcFeather={arcFeather}
          arcBrightness={arcBrightness}
          arcAltitude={arcAltitude}
          micEnvelope={micEnvelope}
          randomishMicModAmount={randomishMicModAmount}
          sineMicModAmount={sineMicModAmount}
          rippleMicModAmount={rippleMicModAmount}
          surfaceRippleMicModAmount={surfaceRippleMicModAmount}
          morph={morph}
        />
      </Suspense>
    </>
  );
}

function App() {
  const { config, setConfig } = useConfigStore();
  const mic = useMicAnalyzer({ smoothingTimeConstant: 0.85, fftSize: 1024 });
  const ensureDefaultAnimation = useAnimationStore(s => s.ensureDefaultAnimation);
  const { playRequestId, animations } = useAnimationStore();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  // Morph driver state: progress and target (B-lane)
  const [morphState, setMorphState] = useState<{ enabled: boolean; progress: number; to: Partial<typeof config> | null }>({ enabled: false, progress: 0, to: null });
  const animRafRef = useRef<number | null>(null);
  const animStartRef = useRef<number>(0);
  const animDurRef = useRef<number>(600); // ms
  const animEaseFnRef = useRef<(t: number) => number>((t: number) => t);
  const targetCfgRef = useRef<Partial<typeof config> | null>(null);

  useEffect(() => { ensureDefaultAnimation(); }, [ensureDefaultAnimation]);

  // Map a config to the visual state: disabled -> amount 0, keep mask/gradient/enabled arcs toggles
  function toVisual(cfg: typeof config): Record<string, number | string> {
    // Map toggles -> values: disabled treated as 0 (or neutral)
    return {
      pointSize: cfg.pointSize,
      size: cfg.size,
      opacity: cfg.opacity,
      rotationX: cfg.rotationX,
      rotationY: cfg.rotationY,
      rotationZ: cfg.rotationZ,
      randomishAmount: cfg.enableRandomishNoise ? cfg.randomishAmount : 0,
      pulseSize: cfg.pulseSize,
      sineAmount: cfg.enableSineNoise ? cfg.sineAmount : 0,
      rippleAmount: cfg.enableRippleNoise ? cfg.rippleAmount : 0,
      surfaceRippleAmount: cfg.enableSurfaceRipple ? cfg.surfaceRippleAmount : 0,
      spinSpeed: cfg.enableSpin ? cfg.spinSpeed : 0,
      spinAxisX: cfg.enableSpin ? cfg.spinAxisX : 0,
      spinAxisY: cfg.enableSpin ? cfg.spinAxisY : 0,
      maskRadius: cfg.maskEnabled ? cfg.maskRadius : 0,
      maskFeather: cfg.maskEnabled ? cfg.maskFeather : 0,
      gradientAngle: cfg.enableGradient ? cfg.gradientAngle : 0,
      sizeRandomness: cfg.sizeRandomness,
      glowStrength: cfg.glowStrength,
      glowRadiusFactor: cfg.glowRadiusFactor,
      arcSpawnRate: cfg.enableArcs ? cfg.arcSpawnRate : 0,
      arcDuration: cfg.enableArcs ? cfg.arcDuration : 0,
      arcSpeed: cfg.enableArcs ? cfg.arcSpeed : 0,
      arcSpanDeg: cfg.enableArcs ? cfg.arcSpanDeg : 0,
      arcThickness: cfg.enableArcs ? cfg.arcThickness : 0,
      arcFeather: cfg.enableArcs ? cfg.arcFeather : 0,
      arcBrightness: cfg.enableArcs ? cfg.arcBrightness : 0,
      arcAltitude: cfg.enableArcs ? cfg.arcAltitude : 0,
      pointColor: cfg.pointColor,
      gradientColor2: cfg.gradientColor2,
      glowColor: cfg.glowColor,
    };
  }

  // Handle animation playback by driving morph (A-lane = live config, B-lane = target)
  useEffect(() => {
    if (!playRequestId) return;
    const anim = animations.find(a => a.id === playRequestId);
    if (!anim) return;

    const mergedTargetCfg = { ...config, ...anim.to } as typeof config;
    targetCfgRef.current = mergedTargetCfg;
    animDurRef.current = Math.max(0, (anim.duration ?? 0.6) * 1000);
    animEaseFnRef.current = getEaser(anim.ease as AnimEase);
    animStartRef.current = performance.now();

    if (animRafRef.current) cancelAnimationFrame(animRafRef.current);

    const tick = () => {
      const now = performance.now();
      const t = animDurRef.current === 0 ? 1 : Math.min(1, (now - animStartRef.current) / animDurRef.current);
      const te = animEaseFnRef.current(t);
      setMorphState({ enabled: true, progress: te, to: targetCfgRef.current });
      if (t < 1) {
        animRafRef.current = requestAnimationFrame(tick);
      } else {
        // Commit final target to UI state so we stay at B after morph
        if (targetCfgRef.current) {
          setConfig(targetCfgRef.current as typeof config);
        }
        useAnimationStore.getState().clearPlayRequest();
        setMorphState({ enabled: false, progress: 0, to: null });
        animRafRef.current = null;
      }
    };
    animRafRef.current = requestAnimationFrame(tick);

    return () => { if (animRafRef.current) cancelAnimationFrame(animRafRef.current); };
  }, [playRequestId, animations]);

  useEffect(() => {
    if (config.micEnabled) {
      mic.start();
    } else {
      mic.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.micEnabled]);

  // Apply additional UI smoothing as EMA on top of analyzer's base smoothing
  const micSmoothed = mic.volume; // analyzer already applies baseline smoothing
  const micEnvelope = config.micEnabled ? Math.min(1, config.micVolume * micSmoothed) : 0;
  const globalMicFactor = config.micEnabled && config.micAffectsGlobal
    ? Math.min(11, config.micVolume * micSmoothed)
    : 1;
  const effectiveVolume = Math.min(1, globalMicFactor * config.volume);

  return (
    <SidebarProvider>
      <ControlSidebar />
      <SidebarInset>
        <div className="flex-1 h-screen relative">
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 60 }}>
            <Scene
              volume={effectiveVolume}
              micEnvelope={micEnvelope}
              randomishMicModAmount={config.randomishMicModAmount}
              sineMicModAmount={config.sineMicModAmount}
              rippleMicModAmount={config.rippleMicModAmount}
              surfaceRippleMicModAmount={config.surfaceRippleMicModAmount}
              // gradient enable is internal now (value-driven)
              gradientColor2={config.gradientColor2}
              gradientAngle={config.gradientAngle}
              vertexCount={config.vertexCount}
              pointSize={config.pointSize}
              shellCount={config.shellCount}
              freezeTime={config.freezeTime}
              advanceCount={config.advanceCount}
              size={config.size}
              opacity={config.opacity}
              rotationX={config.rotationX}
              rotationY={config.rotationY}
              rotationZ={config.rotationZ}
              randomishAmount={config.randomishAmount}
              sineAmount={config.sineAmount}
              pulseSize={config.pulseSize}
              spinSpeed={config.spinSpeed}
              randomishSpeed={config.randomishSpeed}
              spinAxisX={config.spinAxisX}
              spinAxisY={config.spinAxisY}
              // mask should reflect live UI immediately; use config directly
              maskRadius={config.maskRadius}
              maskFeather={config.maskFeather}
              maskInvert={config.maskInvert}
              sineSpeed={config.sineSpeed}
              sineScale={config.sineScale}
              pointColor={config.pointColor}
              glowColor={config.glowColor}
              glowStrength={config.glowStrength}
              glowRadiusFactor={config.glowRadiusFactor}
              sizeRandomness={config.sizeRandomness}
              backgroundTheme={config.backgroundTheme}
              // ripple enable is internal now (value-driven)
              rippleAmount={config.rippleAmount}
              rippleSpeed={config.rippleSpeed}
              rippleScale={config.rippleScale}
              // surface ripple enable is internal now (value-driven)
              surfaceRippleAmount={config.surfaceRippleAmount}
              surfaceRippleSpeed={config.surfaceRippleSpeed}
              surfaceRippleScale={config.surfaceRippleScale}
              // arcs enable is internal now (value-driven)
              arcMaxCount={config.arcMaxCount}
              arcSpawnRate={config.arcSpawnRate}
              arcDuration={config.arcDuration}
              arcSpeed={config.arcSpeed}
              arcSpanDeg={config.arcSpanDeg}
              arcThickness={config.arcThickness}
              arcFeather={config.arcFeather}
              arcBrightness={config.arcBrightness}
              arcAltitude={config.arcAltitude}
              morph={{ enabled: morphState.enabled, progress: morphState.progress, to: morphState.to || undefined }}
            />
            <EffectComposer>
              <Bloom
                intensity={Math.max(0, config.glowStrength) * 1.5}
                luminanceThreshold={0.0}
                luminanceSmoothing={0.0}
                radius={Math.max(0.05, Math.min(0.5, config.glowRadiusFactor) * 2.0)}
              />
            </EffectComposer>
            <OrbitControls ref={controlsRef} enablePan={false} enableDamping dampingFactor={0.08} />
          </Canvas>
          <div className="absolute left-3 top-3 z-20">
            <Button size="sm" variant="outline" onClick={() => controlsRef.current?.reset()}>
              Reset View
            </Button>
          </div>
        </div>
        <AnimationSidebar />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
