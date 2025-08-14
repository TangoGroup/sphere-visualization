import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateFibonacciSpherePoints } from '../utils/fibonacciSphere';

export type WaveState = 'spin' | 'pulse';

export interface SphereWaveformProps {
  vertexCount?: number;
  state: WaveState;
  volume: number; // 0..1
  radius?: number; // default 1
  pointSize?: number; // default 0.04 logical px
  seed?: number; // layout randomness
  freezeTime?: boolean; // debug: freeze time progression
  advanceCount?: number; // debug: increments to step time forward manually
  advanceAmount?: number; // seconds to advance per count (default 1/60)
  useAnalytic?: boolean; // debug: use smooth analytic instead of noise
  pulseSize?: number; // 0..1, controls amplitude of pulse state
}

interface Uniforms {
  uTime: { value: number };
  uVolume: { value: number };
  uRadius: { value: number };
  uPointSize: { value: number };
  uPixelRatio: { value: number };
  uViewportHeight: { value: number };
  uFov: { value: number }; // radians
  uMode: { value: number }; // 0 spin, 1 pulse
  uUseAnalytic: { value: number };
  uPulseSize: { value: number };
}

const vertexShader = /* glsl */ `
precision highp float;
attribute float aSeed;

uniform float uTime;
uniform float uVolume;
uniform float uRadius;
uniform float uPointSize;
uniform float uPixelRatio;
uniform float uViewportHeight;
uniform float uFov;
uniform int uMode; // 0 spin, 1 pulse
uniform int uUseAnalytic;
uniform float uPulseSize;

// Simple hash function for deterministic pseudo-random values
float hash(float n) { return fract(sin(n) * 43758.5453); }
float hash(vec3 p) { return hash(dot(p, vec3(127.1, 311.7, 74.7))); }

// Smooth interpolation
float smoothNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f); // smoothstep
  
  float a = hash(i);
  float b = hash(i + vec3(1.0, 0.0, 0.0));
  float c = hash(i + vec3(0.0, 1.0, 0.0));
  float d = hash(i + vec3(1.0, 1.0, 0.0));
  float e = hash(i + vec3(0.0, 0.0, 1.0));
  float f1 = hash(i + vec3(1.0, 0.0, 1.0));
  float g = hash(i + vec3(0.0, 1.0, 1.0));
  float h = hash(i + vec3(1.0, 1.0, 1.0));
  
  return mix(
    mix(mix(a, b, f.x), mix(c, d, f.x), f.y),
    mix(mix(e, f1, f.x), mix(g, h, f.x), f.y),
    f.z
  );
}

void main() {
  vec3 base = normalize(position);

  // Spin rotates around Y; pulse leaves orientation but can modulate time speed
  float timeMul = (uMode == 1) ? 1.8 : 1.0;
  if (uMode == 0) {
    float spinAngle = uTime * 0.35;
    float c = cos(spinAngle);
    float s = sin(spinAngle);
    base.xz = mat2(c, -s, s, c) * base.xz;
  }

  float t = uTime * 0.4 * timeMul;
  
  float n;
  if (uUseAnalytic > 0) {
    n = sin(t * 1.7 + aSeed * 6.2831853);
  } else {
    // Faux noise based on position, time, and seed
    // pulseSize controls spatial frequency (pattern size)
    float spatialScale = mix(0.5, 10.0, uPulseSize); // 0.5 = large patterns, 10.0 = small patterns
    vec3 p = base * spatialScale + vec3(aSeed * 0.1, aSeed * 0.2, t);
    n = smoothNoise(p) * 2.0 - 1.0; // map [0,1] to [-1,1]
  }

  // Map n in [-1,1] to multiplicative radius: 1 + n*volume
  float radialFactor = 1.0 + n * clamp(uVolume, 0.0, 1.0);
  radialFactor = clamp(radialFactor, 0.0, 2.5);
  vec3 displaced = base * (uRadius * radialFactor);

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // FOV-correct perspective size attenuation
  float scale = uViewportHeight / (2.0 * tan(uFov * 0.5));
  float size = uPointSize * uPixelRatio * scale / -mvPosition.z;
  gl_PointSize = clamp(size, 0.0, 2048.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  float alpha = smoothstep(1.0, 0.8, r2);
  gl_FragColor = vec4(vec3(1.0), alpha);
}
`;

function getMode(state: WaveState): number {
  return state === 'spin' ? 0 : 1;
}

export function SphereWaveform({
  vertexCount = 400,
  state,
  volume,
  radius = 1,
  pointSize = 0.04,
  seed = 1,
  freezeTime = false,
  advanceCount = 0,
  advanceAmount = 1 / 60,
  useAnalytic = false,
  pulseSize = 1,
}: SphereWaveformProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniformsRef = useRef<Uniforms | null>(null);
  const prevNowRef = useRef<number | null>(null);
  const timeAccRef = useRef<number>(0);
  const lastAdvanceRef = useRef<number>(advanceCount);

  const { positions, seeds } = useMemo(
    () => generateFibonacciSpherePoints(vertexCount, radius, seed),
    [vertexCount, radius, seed]
  );

  // Lazily create uniforms once
  if (uniformsRef.current === null) {
    uniformsRef.current = {
      uTime: { value: 0 },
      uVolume: { value: 0 },
      uRadius: { value: radius },
      uPointSize: { value: pointSize },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uViewportHeight: { value: window.innerHeight },
      uFov: { value: (60 * Math.PI) / 180 },
      uMode: { value: getMode(state) },
      uUseAnalytic: { value: useAnalytic ? 1 : 0 },
      uPulseSize: { value: pulseSize },
    };
  }

  useFrame((stateFrame) => {
    const u = uniformsRef.current!;
    const now = stateFrame.clock.getElapsedTime();
    if (prevNowRef.current === null) {
      prevNowRef.current = now;
      timeAccRef.current = now;
      lastAdvanceRef.current = advanceCount;
    }
    const dt = Math.max(0, now - prevNowRef.current);
    prevNowRef.current = now;
    // Apply manual advances when frozen
    if (freezeTime) {
      if (advanceCount !== lastAdvanceRef.current) {
        const diff = advanceCount - lastAdvanceRef.current;
        timeAccRef.current += diff * advanceAmount;
        lastAdvanceRef.current = advanceCount;
      }
      u.uTime.value = timeAccRef.current;
    } else {
      timeAccRef.current += dt;
      u.uTime.value = timeAccRef.current;
      lastAdvanceRef.current = advanceCount;
    }
    u.uMode.value = getMode(state);
    u.uRadius.value = radius;
    u.uPointSize.value = pointSize;
    u.uViewportHeight.value = stateFrame.size.height;
    const cam = stateFrame.camera as THREE.PerspectiveCamera;
    if (cam && typeof (cam as any).fov === 'number') {
      u.uFov.value = (cam.fov * Math.PI) / 180;
    }
    u.uVolume.value = THREE.MathUtils.clamp(volume, 0, 1);
    u.uUseAnalytic.value = useAnalytic ? 1 : 0;
    u.uPulseSize.value = THREE.MathUtils.clamp(pulseSize, 0, 1);
  });

  return (
    <points>
      <bufferGeometry key={`${vertexCount}-${radius}-${seed}`}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniformsRef.current as unknown as { [key: string]: THREE.IUniform }}
        transparent
        depthWrite={false}
        depthTest
      />
    </points>
  );
}

export default SphereWaveform;
