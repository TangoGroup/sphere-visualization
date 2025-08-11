import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateFibonacciSpherePoints } from '../utils/fibonacciSphere';

export type WaveState = 'thinking' | 'listening' | 'talking';

export interface SphereWaveformProps {
  vertexCount?: number;
  state: WaveState;
  volume: number; // 0..1
  testMode?: boolean; // overrides external volume with internal noise
  radius?: number; // default 1
  pointSize?: number; // default 0.05 logical px
  color?: string | [string, string]; // solid or gradient between two colors
  seed?: number; // deterministic layout and per-vertex seeds
  smoothing?: number; // 0..1, higher is smoother (slower response)
  debug?: boolean;
}

interface Uniforms {
  uTime: { value: number };
  uPrevTime: { value: number };
  uVolume: { value: number };
  uAmplitude: { value: number };
  uFrequency: { value: number };
  uRadius: { value: number };
  uPointSize: { value: number };
  uPixelRatio: { value: number };
  uViewportHeight: { value: number };
  uFov: { value: number }; // radians
  uColorA: { value: THREE.Color };
  uColorB: { value: THREE.Color };
  uMode: { value: number }; // 0 thinking, 1 listening, 2 talking
  uSpinSpeed: { value: number };
  uRadiusScaleBase: { value: number };
  uRadiusScaleGain: { value: number };
  uSmooth: { value: number };
  uEnableRadial: { value: number };
  uEnableTangential: { value: number };
  uDebug: { value: number };
  uDebugThreshold: { value: number };
}

const vertexShader = /* glsl */ `
attribute float aSeed;

uniform float uTime;
uniform float uPrevTime;
uniform float uVolume;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uRadius;
uniform float uPointSize;
uniform float uPixelRatio;
uniform float uViewportHeight;
uniform float uFov;
uniform int uMode;
uniform float uSpinSpeed;
uniform float uRadiusScaleBase;
uniform float uRadiusScaleGain;
uniform float uSmooth;
uniform float uEnableRadial;
uniform float uEnableTangential;
uniform float uDebug;
uniform float uDebugThreshold;

varying float vMix;

// 3D Simplex Noise from Ashima Arts (public domain)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a1.xy,h.y);
  vec3 p2 = vec3(a0.zw,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  // Base on unit sphere
  vec3 base = normalize(position);

  // Thinking: spin around Z
  float spinAngle = uTime * uSpinSpeed;
  float c = cos(spinAngle);
  float s = sin(spinAngle);
  base.xy = mat2(c, -s, s, c) * base.xy;

  // Smoothing reduces noise speed (0 -> full speed, 1 -> much slower)
  float timeScale = mix(1.0, 0.3, clamp(uSmooth, 0.0, 1.0));
  float t = uTime * uFrequency * timeScale;
  float tp = uPrevTime * uFrequency * timeScale;

  // Smooth noise time to reduce phase jumps
  float t1 = t * 0.7;
  float t2 = t * 0.5 + aSeed * 0.1;
  float p1 = tp * 0.7;
  float p2 = tp * 0.5 + aSeed * 0.1;

  // Two low-frequency noise fields
  float n1 = snoise(base * 0.9 + vec3(aSeed * 17.0, aSeed * 29.0, aSeed * 37.0) + vec3(t1));
  float n2 = snoise(base * 1.2 + vec3(aSeed * 13.0, aSeed * 19.0, aSeed * 23.0) - vec3(t2));

  // Previous noise to estimate speed
  float pn1 = snoise(base * 0.9 + vec3(aSeed * 17.0, aSeed * 29.0, aSeed * 37.0) + vec3(p1));
  float pn2 = snoise(base * 1.2 + vec3(aSeed * 13.0, aSeed * 19.0, aSeed * 23.0) - vec3(p2));

  // Chaotic displacement amplitude driven by volume (kept small and smooth)
  float amp = uAmplitude * (0.6 + 0.4 * uVolume);

  // Radial displacement (small)
  float radial = n1 * amp * 0.35 * uEnableRadial;

  // Robust tangent basis using Frisvad's method to avoid pole flips
  vec3 n = normalize(base);
  vec3 b1, b2;
  if (n.z < -0.999999) {
    b1 = vec3(0.0, -1.0, 0.0);
    b2 = vec3(-1.0, 0.0, 0.0);
  } else {
    float a = 1.0 / (1.0 + n.z);
    float bb = -n.x * n.y * a;
    b1 = vec3(1.0 - n.x * n.x * a, bb, -n.x);
    b2 = vec3(bb, 1.0 - n.y * n.y * a, -n.y);
  }
  vec3 tangentialDisp = (b1 * n1 + b2 * n2) * amp * 0.35 * uEnableTangential;

  // State-driven radius scaling
  float radiusScale = clamp(uRadiusScaleBase + uRadiusScaleGain * uVolume, 0.4, 2.0);

  // Do not normalize the sum to avoid discontinuities
  vec3 displaced = base * (uRadius * radiusScale + radial) + tangentialDisp;

  // Mix factor for coloring
  float speed = abs(n1 - pn1) + abs(n2 - pn2);
  vMix = (uDebug > 0.5) ? smoothstep(uDebugThreshold, uDebugThreshold * 4.0, speed) : clamp(0.5 + 0.5 * n2, 0.0, 1.0);

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  vec4 clip = projectionMatrix * mvPosition;
  gl_Position = clip;

  // FOV-correct perspective size attenuation
  float scale = uViewportHeight / (2.0 * tan(uFov * 0.5));
  float size = uPointSize * uPixelRatio * scale / -mvPosition.z;
  gl_PointSize = clamp(size, 0.0, 2048.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
varying float vMix;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uDebug;

void main() {
  // Soft circular points
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  float alpha = smoothstep(1.0, 0.8, r2);
  vec3 color = (uDebug > 0.5) ? mix(vec3(0.1, 0.6, 0.2), vec3(1.0, 0.0, 0.0), vMix) : mix(uColorA, uColorB, vMix);
  gl_FragColor = vec4(color, alpha);
}
`;

function getStateParams(state: WaveState): { amplitude: number; frequency: number; mode: number; spinSpeed: number; radiusScaleBase: number; radiusScaleGain: number } {
  switch (state) {
    case 'thinking':
      return { amplitude: 0.15, frequency: 0.10, mode: 0, spinSpeed: 0.35, radiusScaleBase: 1.0, radiusScaleGain: 0.0 };
    case 'listening':
      return { amplitude: 0.35, frequency: 0.22, mode: 1, spinSpeed: 0.0, radiusScaleBase: 1.0, radiusScaleGain: -0.6 };
    case 'talking':
      return { amplitude: 0.6, frequency: 0.4, mode: 2, spinSpeed: 0.0, radiusScaleBase: 1.0, radiusScaleGain: 0.8 };
    default:
      return { amplitude: 0.5, frequency: 0.5, mode: 0, spinSpeed: 0.0, radiusScaleBase: 1.0, radiusScaleGain: 0.0 };
  }
}

export function SphereWaveform({
  vertexCount = 100,
  state,
  volume,
  testMode = false,
  radius = 1,
  pointSize = 0.05,
  color = ['#ffffff', '#ffffff'],
  seed = 1,
  smoothing = 0.9,
  debug = false,
}: SphereWaveformProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniformsRef = useRef<Uniforms | null>(null);
  const smoothedVolumeRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);

  const { positions, seeds } = useMemo(
    () => generateFibonacciSpherePoints(vertexCount, radius, seed),
    [vertexCount, radius, seed]
  );

  // Parameter interpolation refs
  const initialParams = useMemo(() => getStateParams(state), []);
  const paramRef = useRef({
    current: { ...initialParams },
    target: { ...initialParams },
  });

  useEffect(() => {
    const p = getStateParams(state);
    paramRef.current.target = { ...p };
  }, [state]);

  // Lazily create uniforms once
  if (uniformsRef.current === null) {
    const p = paramRef.current.current;
    uniformsRef.current = {
      uTime: { value: 0 },
      uPrevTime: { value: 0 },
      uVolume: { value: 0 },
      uAmplitude: { value: p.amplitude },
      uFrequency: { value: p.frequency },
      uRadius: { value: radius },
      uPointSize: { value: pointSize },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uViewportHeight: { value: window.innerHeight },
      uFov: { value: (60 * Math.PI) / 180 },
      uColorA: { value: new THREE.Color(Array.isArray(color) ? color[0] : color) },
      uColorB: { value: new THREE.Color(Array.isArray(color) ? (color[1] ?? color[0]) : color) },
      uMode: { value: 0 },
      uSpinSpeed: { value: p.spinSpeed },
      uRadiusScaleBase: { value: p.radiusScaleBase },
      uRadiusScaleGain: { value: p.radiusScaleGain },
      uSmooth: { value: smoothing },
      uEnableRadial: { value: 1 },
      uEnableTangential: { value: 1 },
      uDebug: { value: debug ? 1 : 0 },
      uDebugThreshold: { value: 0.02 },
    };
  }

  useEffect(() => {
    const u = uniformsRef.current!;
    u.uRadius.value = radius;
  }, [radius]);

  useEffect(() => {
    const u = uniformsRef.current!;
    u.uPointSize.value = pointSize;
  }, [pointSize]);

  useEffect(() => {
    const u = uniformsRef.current!;
    u.uSmooth.value = smoothing;
  }, [smoothing]);

  useEffect(() => {
    const u = uniformsRef.current!;
    u.uDebug.value = debug ? 1 : 0;
  }, [debug]);

  // Update colors by value, not reference
  const colorA = Array.isArray(color) ? color[0] : color;
  const colorB = Array.isArray(color) ? (color[1] ?? color[0]) : color;
  useEffect(() => {
    const u = uniformsRef.current!;
    u.uColorA.value.set(colorA);
  }, [colorA]);
  useEffect(() => {
    const u = uniformsRef.current!;
    u.uColorB.value.set(colorB);
  }, [colorB]);

  useFrame((stateFrame) => {
    const u = uniformsRef.current!;
    const time = stateFrame.clock.getElapsedTime();

    // Interpolate parameters smoothly
    const dt = stateFrame.clock.getDelta();
    const k = 6;
    const lerp = (a: number, b: number) => a + (1 - Math.exp(-k * dt)) * (b - a);

    paramRef.current.current.amplitude = lerp(paramRef.current.current.amplitude, paramRef.current.target.amplitude);
    paramRef.current.current.frequency = lerp(paramRef.current.current.frequency, paramRef.current.target.frequency);
    paramRef.current.current.spinSpeed = lerp(paramRef.current.current.spinSpeed, paramRef.current.target.spinSpeed);
    paramRef.current.current.radiusScaleBase = lerp(paramRef.current.current.radiusScaleBase, paramRef.current.target.radiusScaleBase);
    paramRef.current.current.radiusScaleGain = lerp(paramRef.current.current.radiusScaleGain, paramRef.current.target.radiusScaleGain);

    u.uAmplitude.value = paramRef.current.current.amplitude;
    u.uFrequency.value = paramRef.current.current.frequency;
    u.uSpinSpeed.value = paramRef.current.current.spinSpeed;
    u.uRadiusScaleBase.value = paramRef.current.current.radiusScaleBase;
    u.uRadiusScaleGain.value = paramRef.current.current.radiusScaleGain;

    u.uPrevTime.value = prevTimeRef.current;
    u.uTime.value = time;
    prevTimeRef.current = time;

    u.uViewportHeight.value = stateFrame.size.height;
    const cam = stateFrame.camera as THREE.PerspectiveCamera;
    if (cam && typeof (cam as any).fov === 'number') {
      u.uFov.value = (cam.fov * Math.PI) / 180;
    }

    const targetVol = testMode ? 0.5 + 0.5 * Math.sin(time * 1.5 + seed * 0.123) : THREE.MathUtils.clamp(volume, 0, 1);

    // Frame-rate independent smoothing for volume
    const strength = THREE.MathUtils.clamp(smoothing, 0, 1);
    const mixFactor = 1 - Math.exp(-strength * dt * 10);

    smoothedVolumeRef.current = THREE.MathUtils.lerp(smoothedVolumeRef.current, targetVol, mixFactor);
    u.uVolume.value = smoothedVolumeRef.current;
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
