import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { generateFibonacciSpherePoints } from '../utils/fibonacciSphere';

// Removed WaveState - using individual toggles instead

export interface SphereWaveformProps {
  vertexCount?: number;
  volume: number; // 0..1
  radius?: number; // default 1
  pointSize?: number; // default 0.04 logical px
  shellCount?: number; // default 1, number of nested spheres
  seed?: number; // layout randomness
  freezeTime?: boolean; // debug: freeze time progression
  advanceCount?: number; // debug: increments to step time forward manually
  advanceAmount?: number; // seconds to advance per count (default 1/60)
  // Composable noise toggles
  enableRandomishNoise?: boolean;
  randomishAmount?: number; // 0..1
  enableSineNoise?: boolean;
  sineAmount?: number; // 0..1
  randomishSpeed?: number; // time multiplier for randomish noise
  pulseSize?: number; // 0..1, controls amplitude of pulse state
  // Ripple noise specific controls
  enableRippleNoise?: boolean;
  rippleAmount?: number; // 0..1
  rippleSpeed?: number; // 0.1..10
  rippleScale?: number; // cycles across surface
  // New toggle-based controls
  enableSpin?: boolean;
  spinSpeed?: number;
  // Spin axis controls
  spinAxisX?: number;
  spinAxisY?: number;
  // Screen-space circular gradient mask controls
  maskEnabled?: boolean;
  // In [0,1], relative to half of the smaller screen dimension (0.5 ~ quarter of min dimension radius)
  maskRadius?: number;
  // In [0,1], feather width relative to half of the smaller screen dimension
  maskFeather?: number;
  // If true, keeps outside and occludes inside
  maskInvert?: boolean;
  // Sine noise specific controls
  sineSpeed?: number; // temporal frequency multiplier
  sineScale?: number; // scales aSeed phase contribution
  // Appearance
  pointColor?: string; // hex
}

interface Uniforms {
  uTime: { value: number };
  uVolume: { value: number };
  uRadius: { value: number };
  uPointSize: { value: number };
  uPixelRatio: { value: number };
  uViewportWidth: { value: number };
  uViewportHeight: { value: number };
  uFov: { value: number }; // radians
  uEnableRandomish: { value: number };
  uRandomishAmount: { value: number };
  uEnableSine: { value: number };
  uSineAmount: { value: number };
  uRandomishSpeed: { value: number };
  uPulseSize: { value: number };
  // Ripple uniforms
  uEnableRipple: { value: number };
  uRippleAmount: { value: number };
  uRippleSpeed: { value: number };
  uRippleScale: { value: number };
  // New toggle-based uniforms
  uEnableSpin: { value: number };
  uSpinSpeed: { value: number };
  // Spin axis uniforms
  uSpinAxisX: { value: number };
  uSpinAxisY: { value: number };
  // Screen-space mask uniforms
  uMaskEnabled: { value: number };
  uMaskRadiusPx: { value: number };
  uMaskFeatherPx: { value: number };
  uMaskInvert: { value: number };
  // Sine noise uniforms
  uSineSpeed: { value: number };
  uSineScale: { value: number };
  // Appearance
  uColor: { value: THREE.Color };
}

const vertexShader = /* glsl */ `
precision highp float;
attribute float aSeed;

uniform float uTime;
uniform float uVolume;
uniform float uRadius;
uniform float uPointSize;
uniform float uPixelRatio;
uniform float uViewportWidth;
uniform float uViewportHeight;
uniform float uFov;
uniform int uEnableRandomish;
uniform float uRandomishAmount;
uniform int uEnableSine;
uniform float uSineAmount;
uniform float uRandomishSpeed;
uniform float uSineSpeed;
uniform float uSineScale;
uniform float uPulseSize;
uniform int uEnableRipple;
uniform float uRippleAmount;
uniform float uRippleSpeed;
uniform float uRippleScale;
// New toggle-based uniforms
uniform int uEnableSpin;
uniform float uSpinSpeed;
// Spin axis uniforms
uniform float uSpinAxisX;
uniform float uSpinAxisY;

varying vec2 vNdc;

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

  // Spin rotates around custom axis when enabled
  if (uEnableSpin > 0) {
    float spinAngle = uTime * uSpinSpeed;
    
    // Convert axis angles to a normalized rotation axis vector
    // We'll use the axis angles to define the rotation axis
    float xRad = radians(uSpinAxisX);
    float yRad = radians(uSpinAxisY);
    
    // Create a rotation axis from the angles
    // This creates a unit vector pointing in the direction of the rotation axis
    vec3 axis = normalize(vec3(
      sin(yRad),
      sin(xRad),
      cos(xRad) * cos(yRad)
    ));
    
    // Rodrigues' rotation formula to rotate around the custom axis
    float c = cos(spinAngle);
    float s = sin(spinAngle);
    float omc = 1.0 - c; // one minus cosine
    
    // Rotation matrix for rotation around arbitrary axis
    mat3 R = mat3(
      axis.x * axis.x * omc + c,
      axis.x * axis.y * omc - axis.z * s,
      axis.x * axis.z * omc + axis.y * s,
      axis.y * axis.x * omc + axis.z * s,
      axis.y * axis.y * omc + c,
      axis.y * axis.z * omc - axis.x * s,
      axis.z * axis.x * omc - axis.y * s,
      axis.z * axis.y * omc + axis.x * s,
      axis.z * axis.z * omc + c
    );
    
    // Apply the rotation
    base = R * base;
  }

  // Base time
  float t = uTime * 0.4;
  
  float nRandomish = 0.0;
  if (uEnableRandomish > 0) {
    float spatialScale = mix(0.5, 10.0, uPulseSize);
    float tR = t * uRandomishSpeed;
    vec3 p = base * spatialScale + vec3(aSeed * 0.1, aSeed * 0.2, tR);
    nRandomish = (smoothNoise(p) * 2.0 - 1.0) * uRandomishAmount;
  }
  float nSine = 0.0;
  if (uEnableSine > 0) {
    nSine = sin(t * uSineSpeed + aSeed * 6.2831853 * uSineScale) * uSineAmount;
  }
  // Ripple along surface: use base.xy (screen-space-like) waves
  float nRipple = 0.0;
  if (uEnableRipple > 0) {
    float tR = t * uRippleSpeed;
    // Project to tangent-ish plane using normalized base.xy
    vec2 uv = normalize(base.xy) * uRippleScale;
    float wave = sin(uv.x + tR) * sin(uv.y + tR);
    nRipple = wave * uRippleAmount;
  }
  float n = nRandomish + nSine + nRipple;

  // Map n in [-1,1] to multiplicative radius: 1 + n*volume
  float radialFactor = 1.0 + n * clamp(uVolume, 0.0, 1.0);
  radialFactor = clamp(radialFactor, 0.0, 2.5);
  vec3 displaced = base * (uRadius * radialFactor);

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vNdc = gl_Position.xy / gl_Position.w;

  // FOV-correct perspective size attenuation
  float scale = uViewportHeight / (2.0 * tan(uFov * 0.5));
  float size = uPointSize * uPixelRatio * scale / -mvPosition.z;
  gl_PointSize = clamp(size, 0.0, 2048.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
uniform float uViewportWidth;
uniform float uViewportHeight;
uniform int uMaskEnabled;
uniform float uMaskRadiusPx;
uniform float uMaskFeatherPx;
uniform int uMaskInvert;
uniform vec3 uColor;
varying vec2 vNdc;
void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  float alpha = smoothstep(1.0, 0.8, r2);
  if (uMaskEnabled > 0) {
    // Compute pixel-space distance from screen center using NDC of the point
    // NDC [-1,1] maps to pixels via width/2 and height/2 scaling
    vec2 deltaPx = vec2(vNdc.x * 0.5 * uViewportWidth, vNdc.y * 0.5 * uViewportHeight);
    float distPx = length(deltaPx);
    float inside = 1.0 - smoothstep(uMaskRadiusPx, uMaskRadiusPx + max(0.0001, uMaskFeatherPx), distPx);
    float mask = (uMaskInvert > 0) ? (1.0 - inside) : inside;
    alpha *= clamp(mask, 0.0, 1.0);
  }
  gl_FragColor = vec4(uColor, alpha);
}
`;

// Removed getMode function - using toggles instead

export function SphereWaveform({
  vertexCount = 400,
  volume,
  radius = 1,
  pointSize = 0.04,
  shellCount = 1,
  seed = 1,
  freezeTime = false,
  advanceCount = 0,
  advanceAmount = 1 / 60,
  enableRandomishNoise = true,
  randomishAmount = 1,
  enableSineNoise = false,
  sineAmount = 0,
  pulseSize = 1,
  enableSpin = false,
  spinSpeed = 0.35,
  randomishSpeed = 1.8,
  enableRippleNoise = false,
  rippleAmount = 0.0,
  rippleSpeed = 1.5,
  rippleScale = 3.0,
  spinAxisX = 0,
  spinAxisY = 0,
  maskEnabled = false,
  maskRadius = 0.5,
  maskFeather = 0.2,
  maskInvert = false,
  sineSpeed = 1.7,
  sineScale = 1.0,
  pointColor = '#ffffff',
}: SphereWaveformProps) {
  const uniformsRef = useRef<Uniforms[] | null>(null);
  const prevNowRef = useRef<number | null>(null);
  const timeAccRef = useRef<number>(0);
  const lastAdvanceRef = useRef<number>(advanceCount);

  const { positions, seeds } = useMemo(
    () => generateFibonacciSpherePoints(vertexCount, radius, seed),
    [vertexCount, radius, seed]
  );

  // Lazily create uniforms per shell and keep array length in sync without
  // replacing existing objects (to avoid freezing on shell changes).
  if (uniformsRef.current === null) {
    uniformsRef.current = []
  }
  {
    const count = Math.max(1, Math.floor(shellCount))
    const arr = uniformsRef.current
    // Grow
    for (let i = arr.length; i < count; i++) {
      arr.push({
        uTime: { value: 0 },
        uVolume: { value: 0 },
        uRadius: { value: radius * (i === 0 ? 1 : 1 + i * 0.2) },
        uPointSize: { value: pointSize },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uViewportWidth: { value: window.innerWidth },
        uViewportHeight: { value: window.innerHeight },
        uFov: { value: (60 * Math.PI) / 180 },
        uEnableRandomish: { value: enableRandomishNoise ? 1 : 0 },
        uRandomishAmount: { value: randomishAmount },
        uEnableSine: { value: enableSineNoise ? 1 : 0 },
        uSineAmount: { value: sineAmount },
        uRandomishSpeed: { value: randomishSpeed },
        uPulseSize: { value: pulseSize },
        uEnableRipple: { value: enableRippleNoise ? 1 : 0 },
        uRippleAmount: { value: rippleAmount },
        uRippleSpeed: { value: rippleSpeed },
        uRippleScale: { value: rippleScale },
        uEnableSpin: { value: enableSpin ? 1 : 0 },
        uSpinSpeed: { value: spinSpeed },
        uSpinAxisX: { value: spinAxisX },
        uSpinAxisY: { value: spinAxisY },
        uMaskEnabled: { value: maskEnabled ? 1 : 0 },
        uMaskRadiusPx: { value: 0 },
        uMaskFeatherPx: { value: 0 },
        uMaskInvert: { value: maskInvert ? 1 : 0 },
        uSineSpeed: { value: sineSpeed },
        uSineScale: { value: sineScale },
        uColor: { value: new THREE.Color(pointColor) },
      })
    }
    // Shrink
    if (arr.length > count) {
      arr.length = count
    }
  }

  useFrame((stateFrame) => {
    const uniformsArray = uniformsRef.current!;
    const now = stateFrame.clock.getElapsedTime();
    if (prevNowRef.current === null) {
      prevNowRef.current = now;
      timeAccRef.current = now;
      lastAdvanceRef.current = advanceCount;
    }
    const dt = Math.max(0, now - prevNowRef.current);
    prevNowRef.current = now;

    if (freezeTime) {
      if (advanceCount !== lastAdvanceRef.current) {
        const diff = advanceCount - lastAdvanceRef.current;
        timeAccRef.current += diff * advanceAmount;
        lastAdvanceRef.current = advanceCount;
      }
    } else {
      timeAccRef.current += dt;
      lastAdvanceRef.current = advanceCount;
    }

    for (let i = 0; i < uniformsArray.length; i++) {
      const u = uniformsArray[i];
      u.uTime.value = timeAccRef.current;
      u.uRadius.value = radius * (1 + i * 0.2);
      u.uPointSize.value = pointSize;
      u.uViewportWidth.value = stateFrame.size.width;
      u.uViewportHeight.value = stateFrame.size.height;
      const cam = stateFrame.camera as THREE.PerspectiveCamera;
      if (cam && typeof (cam as any).fov === 'number') {
        u.uFov.value = (cam.fov * Math.PI) / 180;
      }
      u.uVolume.value = THREE.MathUtils.clamp(volume, 0, 1);
      u.uEnableRandomish.value = enableRandomishNoise ? 1 : 0;
      u.uRandomishAmount.value = THREE.MathUtils.clamp(randomishAmount, 0, 1);
      u.uEnableSine.value = enableSineNoise ? 1 : 0;
      u.uSineAmount.value = THREE.MathUtils.clamp(sineAmount, 0, 1);
      u.uRandomishSpeed.value = randomishSpeed;
      u.uPulseSize.value = THREE.MathUtils.clamp(pulseSize, 0, 1);
      // Ripple
      u.uEnableRipple.value = enableRippleNoise ? 1 : 0;
      u.uRippleAmount.value = THREE.MathUtils.clamp(rippleAmount, 0, 1);
      u.uRippleSpeed.value = rippleSpeed;
      u.uRippleScale.value = rippleScale;
      u.uEnableSpin.value = enableSpin ? 1 : 0;
      u.uSpinSpeed.value = spinSpeed;
      u.uSpinAxisX.value = spinAxisX;
      u.uSpinAxisY.value = spinAxisY;
      // Screen-space mask updates
      u.uMaskEnabled.value = maskEnabled ? 1 : 0;
      u.uMaskInvert.value = maskInvert ? 1 : 0;
      const minHalf = Math.min(stateFrame.size.width, stateFrame.size.height) * 0.5;
      u.uMaskRadiusPx.value = THREE.MathUtils.clamp(maskRadius, 0, 1) * minHalf;
      u.uMaskFeatherPx.value = THREE.MathUtils.clamp(maskFeather, 0, 1) * minHalf;
      // Sine noise
      u.uSineSpeed.value = sineSpeed;
      u.uSineScale.value = sineScale;
      // Color
      u.uColor.value.set(pointColor);
    }
  });

  return (
    <>
      {uniformsRef.current!.map((u, i) => (
        <points key={`points-${i}`} renderOrder={i}>
          <bufferGeometry key={`${vertexCount}-${radius}-${seed}-${i}`}>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
          </bufferGeometry>
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={u as unknown as { [key: string]: THREE.IUniform }}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </>
  );
}

export default SphereWaveform;
