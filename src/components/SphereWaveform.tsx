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
}

const vertexShader = /* glsl */ `
attribute float aSeed;

uniform float uTime;
uniform float uVolume;
uniform float uRadius;
uniform float uPointSize;
uniform float uPixelRatio;
uniform float uViewportHeight;
uniform float uFov;
uniform int uMode; // 0 spin, 1 pulse

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
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
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
  // Spatially coherent noise domain with small per-vertex seed offset
  vec3 seedV = vec3(aSeed * 17.0, aSeed * 29.0, aSeed * 37.0);
  vec3 domain = base * 1.1 + seedV + vec3(0.0, 0.0, t);
  float n = snoise(domain); // [-1, 1]

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
}: SphereWaveformProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniformsRef = useRef<Uniforms | null>(null);

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
    };
  }

  useFrame((stateFrame) => {
    const u = uniformsRef.current!;
    const time = stateFrame.clock.getElapsedTime();
    u.uTime.value = time;
    u.uMode.value = getMode(state);
    u.uRadius.value = radius;
    u.uPointSize.value = pointSize;
    u.uViewportHeight.value = stateFrame.size.height;
    const cam = stateFrame.camera as THREE.PerspectiveCamera;
    if (cam && typeof (cam as any).fov === 'number') {
      u.uFov.value = (cam.fov * Math.PI) / 180;
    }
    u.uVolume.value = THREE.MathUtils.clamp(volume, 0, 1);
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
