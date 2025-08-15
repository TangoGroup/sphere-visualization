import { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import SphereWaveform from './components/SphereWaveform';
import { ControlSidebar } from './components/ControlSidebar';
import { useConfigStore } from './stores/configStore';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useMicAnalyzer } from '@/hooks/useMicAnalyzer';
import { useEffect } from 'react';

function Scene({ volume, vertexCount, pointSize, shellCount, freezeTime, advanceCount, enableRandomishNoise, randomishAmount, enableSineNoise, sineAmount, pulseSize, enableSpin, spinSpeed, spinAxisX, spinAxisY, maskEnabled, maskRadius, maskFeather, maskInvert, sineSpeed, sineScale, randomishSpeed, pointColor, enableRippleNoise, rippleAmount, rippleSpeed, rippleScale, enableSurfaceRipple, surfaceRippleAmount, surfaceRippleSpeed, surfaceRippleScale, enableArcs, arcMaxCount, arcSpawnRate, arcDuration, arcSpeed, arcSpanDeg, arcThickness, arcFeather, arcBrightness, arcAltitude }: { 
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
}) {
  const bg = useMemo(() => new THREE.Color('#0b0f13'), []);
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
          pointColor={pointColor}
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
        />
      </Suspense>
      <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} />
    </>
  );
}

function App() {
  const { config } = useConfigStore();
  const mic = useMicAnalyzer({ smoothingTimeConstant: 0.85, fftSize: 1024 });

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
  const micWithGain = config.micEnabled ? Math.min(11, config.micVolume * micSmoothed) : 1;
  const effectiveVolume = Math.min(1, micWithGain * config.volume);

  return (
    <SidebarProvider>
      <ControlSidebar />
      <SidebarInset>
        <div className="flex-1 h-screen">
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 60 }}>
            <Scene
              volume={effectiveVolume}
              vertexCount={config.vertexCount}
              pointSize={config.pointSize}
              shellCount={config.shellCount}
              freezeTime={config.freezeTime}
              advanceCount={config.advanceCount}
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
          </Canvas>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
