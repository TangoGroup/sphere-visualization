import { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import SphereWaveform from './components/SphereWaveform';
import { ControlSidebar } from './components/ControlSidebar';
import { useConfigStore } from './stores/configStore';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

function Scene({ volume, vertexCount, pointSize, shellCount, freezeTime, advanceCount, enableRandomishNoise, randomishAmount, enableSineNoise, sineAmount, pulseSize, enableSpin, spinSpeed, spinAxisX, spinAxisY, maskEnabled, maskRadius, maskFeather, maskInvert, sineSpeed, sineScale, randomishSpeed }: { 
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
        />
      </Suspense>
      <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} />
    </>
  );
}

function App() {
  const { config } = useConfigStore();

  return (
    <SidebarProvider>
      <ControlSidebar />
      <SidebarInset>
        <div className="flex-1 h-screen">
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 60 }}>
            <Scene
              volume={config.volume}
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
              randomishSpeed={config.randomishSpeed}
            />
          </Canvas>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
