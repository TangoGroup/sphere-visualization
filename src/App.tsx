import { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import SphereWaveform from './components/SphereWaveform';
import { ControlSidebar } from './components/ControlSidebar';
import { useConfigStore } from './stores/configStore';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

function Scene({ volume, vertexCount, pointSize, shellCount, freezeTime, advanceCount, useAnalytic, pulseSize, enableSpin, enablePulse, spinSpeed, pulseSpeed, spinAxisX, spinAxisY }: { 
  volume: number; 
  vertexCount: number; 
  pointSize: number; 
  shellCount: number; 
  freezeTime: boolean; 
  advanceCount: number; 
  useAnalytic: boolean; 
  pulseSize: number; 
  enableSpin: boolean; 
  enablePulse: boolean; 
  spinSpeed: number; 
  pulseSpeed: number;
  spinAxisX: number;
  spinAxisY: number;
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
          useAnalytic={useAnalytic}
          pulseSize={pulseSize}
          enableSpin={enableSpin}
          enablePulse={enablePulse}
          spinSpeed={spinSpeed}
          pulseSpeed={pulseSpeed}
          spinAxisX={spinAxisX}
          spinAxisY={spinAxisY}
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
              useAnalytic={config.useAnalytic}
              pulseSize={config.pulseSize}
              enableSpin={config.enableSpin}
              enablePulse={config.enablePulse}
              spinSpeed={config.spinSpeed}
              pulseSpeed={config.pulseSpeed}
              spinAxisX={config.spinAxisX}
              spinAxisY={config.spinAxisY}
            />
          </Canvas>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
