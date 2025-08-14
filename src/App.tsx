import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import SphereWaveform from './components/SphereWaveform';
import type { WaveState } from './components/SphereWaveform';
import { useMicAnalyzer } from './hooks/useMicAnalyzer';

function Scene({ state, volume, vertexCount, freezeTime, advanceCount, useAnalytic, pulseSize }: { state: WaveState; volume: number; vertexCount: number; freezeTime: boolean; advanceCount: number; useAnalytic: boolean; pulseSize: number }) {
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
          freezeTime={freezeTime}
          advanceCount={advanceCount}
          useAnalytic={useAnalytic}
          pulseSize={pulseSize}
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
  const [micEnabled, setMicEnabled] = useState<boolean>(false);
  const mic = useMicAnalyzer({ smoothingTimeConstant: 0.85, fftSize: 1024 });
  const [freezeTime, setFreezeTime] = useState<boolean>(false);
  const [advanceCount, setAdvanceCount] = useState<number>(0);
  const [useAnalytic, setUseAnalytic] = useState<boolean>(false);
  const [pulseSize, setPulseSize] = useState<number>(1);
  
  const effectiveVolume = Math.min(1, sliderVolume + (micEnabled && mic.isActive ? mic.volume : 0));

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
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <label>Debug time</label>
          <label className="row" style={{ gap: 6 }}>
            <input type="checkbox" checked={freezeTime} onChange={(e) => setFreezeTime(e.target.checked)} /> freeze
          </label>
          <button onClick={() => setAdvanceCount((c) => c + 1)} disabled={!freezeTime} title="Advance time by 1/60s">
            step
          </button>
          <label className="row" style={{ gap: 6 }}>
            <input type="checkbox" checked={useAnalytic} onChange={(e) => setUseAnalytic(e.target.checked)} /> analytic
          </label>
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
        <div className="row" style={{ gap: 8 }}>
          <label>Microphone</label>
          <input
            type="checkbox"
            checked={micEnabled}
            onChange={async (e) => {
              const enabled = e.target.checked;
              setMicEnabled(enabled);
              if (enabled) {
                await mic.start();
              } else {
                mic.stop();
              }
            }}
            title="Enable microphone input; volume slider is additive"
          />
          {micEnabled && !mic.isActive && mic.error && (
            <span style={{ color: '#fca5a5' }}>{mic.error}</span>
          )}
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
        <div className="row">
          <label>Pulse size</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={pulseSize}
            onChange={(e) => setPulseSize(parseFloat(e.target.value))}
            style={{ width: 200 }}
            title="Pattern size for pulse state (0 = large patterns, 1 = very small patterns)"
          />
          <span style={{ width: 64, textAlign: 'right' }}>{pulseSize.toFixed(2)}</span>
        </div>
      </div>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 60 }}>
        <Scene
          state={mode}
          volume={effectiveVolume}
          vertexCount={vertexCount}
          freezeTime={freezeTime}
          advanceCount={advanceCount}
          useAnalytic={useAnalytic}
          pulseSize={pulseSize}
        />
      </Canvas>
    </div>
  );
}

export default App;
