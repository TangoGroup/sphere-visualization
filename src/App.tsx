import { useMemo, Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import SphereWaveform, { type TransitionOptions } from './components/SphereWaveform';
import { ControlSidebar } from './components/ControlSidebar';
import { useConfigStore } from './stores/configStore';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import AnimationSidebar from '@/components/AnimationSidebar';
import { useAnimationStore } from '@/stores/animationStore';
import { useMicAnalyzer } from '@/hooks/useMicAnalyzer';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function Scene({ volume, vertexCount, pointSize, shellCount, freezeTime, advanceCount, enableRandomishNoise, randomishAmount, enableSineNoise, sineAmount, pulseSize, enableSpin, spinSpeed, spinAxisX, spinAxisY, maskEnabled, maskRadius, maskFeather, maskInvert, sineSpeed, sineScale, randomishSpeed, pointColor, glowColor, glowStrength, glowRadiusFactor, sizeRandomness, backgroundTheme, enableRippleNoise, rippleAmount, rippleSpeed, rippleScale, enableSurfaceRipple, surfaceRippleAmount, surfaceRippleSpeed, surfaceRippleScale, enableArcs, arcMaxCount, arcSpawnRate, arcDuration, arcSpeed, arcSpanDeg, arcThickness, arcFeather, arcBrightness, arcAltitude, size, opacity, rotationX, rotationY, rotationZ, micEnvelope, randomishMicModAmount, sineMicModAmount, rippleMicModAmount, surfaceRippleMicModAmount, enableGradient, gradientColor2, gradientAngle, transition }: { 
  volume: number; 
  vertexCount: number; 
  pointSize: number; 
  shellCount: number; 
  freezeTime: boolean; 
  advanceCount: number; 
  enableRandomishNoise: boolean;
  randomishAmount: number;
  enableSineNoise: boolean;
  sineAmount: number;
  pulseSize: number; 
  enableSpin: boolean; 
  spinSpeed: number; 
  spinAxisX: number;
  spinAxisY: number;
  maskEnabled: boolean;
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
  enableRippleNoise: boolean;
  rippleAmount: number;
  rippleSpeed: number;
  rippleScale: number;
  enableSurfaceRipple: boolean;
  surfaceRippleAmount: number;
  surfaceRippleSpeed: number;
  surfaceRippleScale: number;
  enableArcs: boolean;
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
  enableGradient: boolean;
  gradientColor2: string;
  gradientAngle: number;
  transition?: TransitionOptions;
}) {
  const bg = useMemo(() => new THREE.Color(backgroundTheme === 'dark' ? '#0b0f13' : '#ffffff'), [backgroundTheme]);
  const blendingMode = backgroundTheme === 'light' ? 'normal' : 'additive' as const;
  const pc = (pointColor || '').trim().toLowerCase();
  const isWhite = pc === '#ffffff' || pc === '#fff';
  // Only substitute on light bg when gradient is disabled, to respect white in gradients
  const displayPointColor = backgroundTheme === 'light' && isWhite && !enableGradient ? '#0b0f13' : pointColor;
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
          enableRandomishNoise={enableRandomishNoise}
          randomishAmount={randomishAmount}
          enableSineNoise={enableSineNoise}
          sineAmount={sineAmount}
          pulseSize={pulseSize}
          enableSpin={enableSpin}
          spinSpeed={spinSpeed}
          randomishSpeed={randomishSpeed}
          spinAxisX={spinAxisX}
          spinAxisY={spinAxisY}
          maskEnabled={maskEnabled}
          maskRadius={maskRadius}
          maskFeather={maskFeather}
          maskInvert={maskInvert}
          sineSpeed={sineSpeed}
          sineScale={sineScale}
          pointColor={displayPointColor}
          enableGradient={enableGradient}
          gradientColor2={gradientColor2}
          gradientAngle={gradientAngle}
          glowColor={glowColor}
          glowStrength={glowStrength}
          glowRadiusFactor={glowRadiusFactor}
          sizeRandomness={sizeRandomness}
          blendingMode={blendingMode}
          
          enableRippleNoise={enableRippleNoise}
          rippleAmount={rippleAmount}
          rippleSpeed={rippleSpeed}
          rippleScale={rippleScale}
          enableSurfaceRipple={enableSurfaceRipple}
          surfaceRippleAmount={surfaceRippleAmount}
          surfaceRippleSpeed={surfaceRippleSpeed}
          surfaceRippleScale={surfaceRippleScale}
          enableArcs={enableArcs}
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
          transition={transition}
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
  const [transition, setTransition] = useState<TransitionOptions>({ enabled: false });

  useEffect(() => { ensureDefaultAnimation(); }, [ensureDefaultAnimation]);

  // Handle animation playback via auto-transition
  useEffect(() => {
    if (!playRequestId) {
      setTransition({ enabled: false });
      return;
    }
    
    const anim = animations.find(a => a.id === playRequestId);
    if (!anim) {
      setTransition({ enabled: false });
      return;
    }

    // Map animation definition to transition options
    const transitionOptions: TransitionOptions = {
      enabled: true,
      duration: anim.duration,
      ease: anim.ease as any, // Full compatibility with saved animations
      onStart: () => {
        // Apply target config when transition actually starts
        // This ensures we transition from current visual state, not target state
        setConfig(anim.to);
      },
      onComplete: () => {
        // Clear the play request when animation completes
        useAnimationStore.getState().clearPlayRequest();
      }
    };

    setTransition(transitionOptions);
  }, [playRequestId, animations, setConfig]);

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
              enableGradient={config.enableGradient}
              gradientColor2={config.gradientColor2}
              gradientAngle={config.gradientAngle}
              transition={transition}
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
              enableRandomishNoise={config.enableRandomishNoise}
              randomishAmount={config.randomishAmount}
              enableSineNoise={config.enableSineNoise}
              sineAmount={config.sineAmount}
              pulseSize={config.pulseSize}
              enableSpin={config.enableSpin}
              spinSpeed={config.spinSpeed}
              randomishSpeed={config.randomishSpeed}
              spinAxisX={config.spinAxisX}
              spinAxisY={config.spinAxisY}
              maskEnabled={config.maskEnabled}
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
              enableRippleNoise={config.enableRippleNoise}
              rippleAmount={config.rippleAmount}
              rippleSpeed={config.rippleSpeed}
              rippleScale={config.rippleScale}
              enableSurfaceRipple={config.enableSurfaceRipple}
              surfaceRippleAmount={config.surfaceRippleAmount}
              surfaceRippleSpeed={config.surfaceRippleSpeed}
              surfaceRippleScale={config.surfaceRippleScale}
              enableArcs={config.enableArcs}
              arcMaxCount={config.arcMaxCount}
              arcSpawnRate={config.arcSpawnRate}
              arcDuration={config.arcDuration}
              arcSpeed={config.arcSpeed}
              arcSpanDeg={config.arcSpanDeg}
              arcThickness={config.arcThickness}
              arcFeather={config.arcFeather}
              arcBrightness={config.arcBrightness}
              arcAltitude={config.arcAltitude}
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
