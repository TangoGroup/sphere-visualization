import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import SphereWaveform from './components/SphereWaveform';
import type { WaveState } from './components/SphereWaveform';

function Scene({ state, volume, vertexCount }: { state: WaveState; volume: number; vertexCount: number }) {
  const bg = useMemo(() => new THREE.Color('#0b0f13'), []);
  return (
    <>
      <color attach="background" args={[bg]} />
      <ambientLight intensity={0.3} />
      <Suspense fallback={null}>
        <SphereWaveform
          vertexCount={vertexCount}
          state={state}
          volume={volume}
        />
      </Suspense>
      <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} />
    </>
  );
}

function App() {
  const [mode, setMode] = useState<WaveState>('spin');
  const [sliderVolume, setSliderVolume] = useState<number>(0);
  const [vertexCount, setVertexCount] = useState<number>(400);
  
  const effectiveVolume = sliderVolume;

  return (
    <div className="app-root">
      <div className="ui" style={{ gap: 12, flexWrap: 'wrap' }}>
        <div className="row" style={{ gap: 6 }}>
          <label>State</label>
          <div className="row" style={{ gap: 6 }}>
            {(['spin', 'pulse'] as WaveState[]).map((s) => (
              <button
                key={s}
                onClick={() => setMode(s)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: mode === s ? 'rgba(56,189,248,0.2)' : 'rgba(0,0,0,0.25)',
                  color: '#e5e7eb',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="row">
          <label>Vertices</label>
          <input
            type="range"
            min={50}
            max={8000}
            step={50}
            value={vertexCount}
            onChange={(e) => setVertexCount(parseInt(e.target.value, 10))}
            style={{ width: 200 }}
            title="Number of points on the sphere"
          />
          <span style={{ width: 64, textAlign: 'right' }}>{vertexCount}</span>
        </div>
        <div className="row">
          <label>Volume</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={sliderVolume}
            onChange={(e) => setSliderVolume(parseFloat(e.target.value))}
            style={{ width: 200 }}
            title="0..1 amplitude mapped to multiplicative radius"
          />
          <span style={{ width: 64, textAlign: 'right' }}>{sliderVolume.toFixed(2)}</span>
        </div>
      </div>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 60 }}>
        <Scene
          state={mode}
          volume={effectiveVolume}
          vertexCount={vertexCount}
        />
      </Canvas>
    </div>
  );
}

export default App;
