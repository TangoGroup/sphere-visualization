import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import SphereWaveform from './components/SphereWaveform';
import type { WaveState } from './components/SphereWaveform';
import { useMicAnalyzer } from './hooks/useMicAnalyzer';

function Scene({ state, volume, testMode, smoothing, vertexCount, pointSize }: { state: WaveState; volume: number; testMode: boolean; smoothing: number; vertexCount: number; pointSize: number }) {
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
          testMode={testMode}
          radius={1}
          pointSize={pointSize}
          color={["#fff", "#fff"]}
          smoothing={smoothing}
        />
      </Suspense>
      <OrbitControls enablePan={false} enableDamping dampingFactor={0.08} />
    </>
  );
}

function App() {
  const [mode, setMode] = useState<WaveState>('thinking');
  const [testMode, setTestMode] = useState<boolean>(true);
  const [sliderVolume, setSliderVolume] = useState<number>(0);
  const [smoothing, setSmoothing] = useState<number>(0.9);
  const [vertexCount, setVertexCount] = useState<number>(100);
  const [pointSize, setPointSize] = useState<number>(0.02);

  const mic = useMicAnalyzer({ smoothingTimeConstant: 0.85, fftSize: 1024 });

  const effectiveVolume = testMode ? 0 : mic.isActive ? mic.volume : sliderVolume;

  return (
    <div className="app-root">
      <div className="ui" style={{ gap: 12, flexWrap: 'wrap' }}>
        <div className="row" style={{ gap: 6 }}>
          <label>State</label>
          <div className="row" style={{ gap: 6 }}>
            {(['thinking', 'listening', 'talking'] as WaveState[]).map((s) => (
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
          <label>Point size</label>
          <input
            type="range"
            min={0.002}
            max={0.1}
            step={0.002}
            value={pointSize}
            onChange={(e) => setPointSize(parseFloat(e.target.value))}
            style={{ width: 200 }}
            title="Visual size factor (pixels), smaller values = smaller points"
          />
          <span style={{ width: 64, textAlign: 'right' }}>{pointSize.toFixed(3)}</span>
        </div>
        <div className="row">
          <label>Test</label>
          <input
            type="checkbox"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
            title="When on, volume is simulated and overrides external volume"
          />
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button
            onClick={async () => {
              if (!mic.isActive) {
                setTestMode(false);
                await mic.start();
              } else {
                mic.stop();
              }
            }}
          >
            {mic.isActive ? 'Stop Mic' : 'Start Mic'}
          </button>
          {mic.error && <span style={{ color: '#fca5a5' }}>{mic.error}</span>}
        </div>
        {!testMode && !mic.isActive && (
          <div className="row">
            <label>Volume</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={sliderVolume}
              onChange={(e) => setSliderVolume(parseFloat(e.target.value))}
              style={{ width: 160 }}
            />
            <span style={{ width: 40, textAlign: 'right' }}>{sliderVolume.toFixed(2)}</span>
          </div>
        )}
        <div className="row">
          <label>Smoothing</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={smoothing}
            onChange={(e) => setSmoothing(parseFloat(e.target.value))}
            style={{ width: 160 }}
            title="Higher values respond slower but move smoother"
          />
          <span style={{ width: 40, textAlign: 'right' }}>{smoothing.toFixed(2)}</span>
        </div>
      </div>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 60 }}>
        <Scene
          state={mode}
          volume={effectiveVolume}
          testMode={testMode}
          smoothing={smoothing}
          vertexCount={vertexCount}
          pointSize={pointSize}
        />
      </Canvas>
    </div>
  );
}

export default App;
