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
  // Global transform
  size?: number; // overall scene scale multiplier (default 1)
  opacity?: number; // 0..1 global alpha multiplier
  rotationX?: number; // degrees
  rotationY?: number; // degrees
  rotationZ?: number; // degrees
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
  enableSurfaceRipple?: boolean;
  surfaceRippleAmount?: number;
  surfaceRippleSpeed?: number;
  surfaceRippleScale?: number;
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
  glowColor?: string; // hex for glow
  glowStrength?: number; // 0..3
  glowRadiusFactor?: number; // per-side halo thickness as multiple of core radius
  // glowSoftness removed in v20
  // Point size randomness
  sizeRandomness?: number; // 0..1 mixes base size with random [0..2]
  // Arcs (great-circle segments)
  enableArcs?: boolean;
  arcMaxCount?: number;
  arcSpawnRate?: number;
  arcDuration?: number;
  arcSpeed?: number;
  arcSpanDeg?: number;
  arcThickness?: number;
  arcFeather?: number;
  arcBrightness?: number;
  arcAltitude?: number;
  // Rendering mode
  blendingMode?: 'additive' | 'normal';
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
  uOpacity: { value: number };
  // Size randomness
  uSizeRandomness: { value: number };
  // Halo expansion
  uGlowRadiusFactor: { value: number };
  // uGlowSoftness removed
  uExpandHalo: { value: number };
  // Ripple uniforms
  uEnableRipple: { value: number };
  uRippleAmount: { value: number };
  uRippleSpeed: { value: number };
  uRippleScale: { value: number };
  // Surface ripple (tangent displacement)
  uEnableSurfaceRipple: { value: number };
  uSurfaceRippleAmount: { value: number };
  uSurfaceRippleSpeed: { value: number };
  uSurfaceRippleScale: { value: number };
  uSurfaceCenter: { value: THREE.Vector3 };
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
  uMaskCenterNdc: { value: THREE.Vector2 };
  // Sine noise uniforms
  uSineSpeed: { value: number };
  uSineScale: { value: number };
  // Appearance
  uColor: { value: THREE.Color };
  uGlowColor: { value: THREE.Color };
  uGlowStrength: { value: number };
  // Arcs
  uArcsActive: { value: number };
  uArcCenters: { value: Float32Array };
  uArcTangents: { value: Float32Array };
  uArcT0: { value: Float32Array };
  uArcDur: { value: Float32Array };
  uArcSpeed: { value: Float32Array };
  uArcSpan: { value: Float32Array };
  uArcThick: { value: Float32Array };
  uArcFeather: { value: Float32Array };
  uArcBright: { value: Float32Array };
  uArcAltitude: { value: number };
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
uniform float uSizeRandomness;
uniform float uGlowRadiusFactor;
// softness removed
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
uniform int uEnableSurfaceRipple;
uniform float uSurfaceRippleAmount;
uniform float uSurfaceRippleSpeed;
uniform float uSurfaceRippleScale;
uniform vec3 uSurfaceCenter;
// Arcs
const int MAX_ARCS = 8;
uniform int uArcsActive;
uniform vec3 uArcCenters[MAX_ARCS];
uniform vec3 uArcTangents[MAX_ARCS];
uniform float uArcT0[MAX_ARCS];
uniform float uArcDur[MAX_ARCS];
uniform float uArcSpeed[MAX_ARCS];
uniform float uArcSpan[MAX_ARCS];
uniform float uArcThick[MAX_ARCS];
uniform float uArcFeather[MAX_ARCS];
uniform float uArcBright[MAX_ARCS];
uniform float uArcAltitude;
// New toggle-based uniforms
uniform int uEnableSpin;
uniform float uSpinSpeed;
// Spin axis uniforms
uniform float uSpinAxisX;
uniform float uSpinAxisY;

varying vec2 vNdc;
varying float vArcBoost;
varying float vSizeRand;
varying float vCoreRadiusNorm;

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
  // Ripple along surface: traveling wave around Z axis using longitude
  float nRipple = 0.0;
  if (uEnableRipple > 0) {
    float tR = t * uRippleSpeed;
    float longitude = atan(base.y, base.x); // [-pi, pi]
    float wave = sin(longitude * uRippleScale - tR);
    nRipple = wave * uRippleAmount;
  }
  // Surface ripple displacement along tangent directions (keeps radius ~constant)
  vec3 tangentDisplaced = vec3(0.0);
  if (uEnableSurfaceRipple > 0) {
    vec3 N = normalize(base);
    // Geodesic angle from moving center
    float angle = acos(clamp(dot(N, normalize(uSurfaceCenter)), -1.0, 1.0));
    float phase = angle * uSurfaceRippleScale - t * uSurfaceRippleSpeed;
    float wave = sin(phase);
    // Tangent direction towards center along the surface
    vec3 toCenterTangent = normalize(uSurfaceCenter - dot(uSurfaceCenter, N) * N);
    // In case of degeneracy near alignment, fall back to arbitrary tangent
    if (!all(greaterThan(abs(toCenterTangent), vec3(1e-6)))) {
      vec3 alt = vec3(1.0, 0.0, 0.0);
      toCenterTangent = normalize(cross(N, cross(alt, N)));
    }
    vec3 offset = toCenterTangent * (wave * uSurfaceRippleAmount * 0.25);
    vec3 surf = normalize(base + offset);
    tangentDisplaced = surf - base;
  }
  float n = nRandomish + nSine + nRipple;

  // Map n in [-1,1] to multiplicative radius: 1 + n*volume
  float radialFactor = 1.0 + n * clamp(uVolume, 0.0, 1.0);
  radialFactor = clamp(radialFactor, 0.0, 2.5);
  vec3 displaced = (base + tangentDisplaced) * (uRadius * radialFactor);

  // Arcs influence: accumulate alpha boost and small radial puff
  vArcBoost = 0.0;
  if (uArcsActive > 0) {
    for (int i = 0; i < MAX_ARCS; i++) {
      if (i >= uArcsActive) { continue; }
      float age = uTime - uArcT0[i];
      if (age < 0.0 || age > uArcDur[i]) { continue; }
      float tnorm = clamp(age / max(0.0001, uArcDur[i]), 0.0, 1.0);
      // Temporal fade in/out
      float fade = smoothstep(0.0, 0.2, tnorm) * (1.0 - smoothstep(0.8, 1.0, tnorm));
      // Great-circle param along arc
      vec3 C = normalize(uArcCenters[i]);
      vec3 T = normalize(uArcTangents[i]);
      vec3 B = cross(C, T);
      vec3 Np = normalize(base - dot(base, C) * C);
      float phi = atan(dot(Np, B), dot(Np, T));
      float phiHead = -tnorm * uArcSpeed[i];
      float halfSpan = uArcSpan[i] * 0.5;
      float centerDist = abs(atan(sin(phi - phiHead), cos(phi - phiHead)));
      float withinSpan = 1.0 - smoothstep(halfSpan, halfSpan + uArcFeather[i], centerDist);
      float planeDist = abs(dot(base, C));
      float withinThick = 1.0 - smoothstep(uArcThick[i], uArcThick[i] + uArcFeather[i], planeDist);
      // Altitude profile along arc length: 0 at ends, 1 at center
      float along = clamp(1.0 - centerDist / max(1e-4, halfSpan), 0.0, 1.0);
      float altShape = sin(along * 3.14159265); // 0..1..0
      float mask = withinSpan * withinThick * fade;
      if (mask > 0.0) {
        vArcBoost += mask * uArcBright[i];
        // Altitude measured in multiples of sphere radius (uRadius)
        displaced += base * (uArcAltitude * uRadius * altShape * withinThick * fade);
      }
    }
  }

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vNdc = gl_Position.xy / gl_Position.w;

  // FOV-correct perspective size attenuation
  float scale = uViewportHeight / (2.0 * tan(uFov * 0.5));
  // Per-vertex size randomness: [0..2] factor mixed by uSizeRandomness
  float rand01 = hash(aSeed);
  float sizeFactor = mix(1.0, rand01 * 2.0, clamp(uSizeRandomness, 0.0, 1.0));
  vSizeRand = sizeFactor;
  float basePx = (uPointSize * sizeFactor) * uPixelRatio * scale / -mvPosition.z;
  // Halo scales with core radius: thickness per side = factor * basePx
  float haloPx = max(0.0, uGlowRadiusFactor) * basePx;
  float expanded = basePx + 2.0 * haloPx;
  vCoreRadiusNorm = (expanded > 0.0) ? clamp(basePx / expanded, 0.0, 1.0) : 1.0;
  gl_PointSize = clamp(expanded, 0.0, 2048.0);
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
uniform vec2 uMaskCenterNdc;
uniform vec3 uColor;
uniform float uOpacity;
uniform vec3 uGlowColor;
uniform float uGlowStrength;
varying vec2 vNdc;
varying float vArcBoost;
varying float vSizeRand;
varying float vCoreRadiusNorm;
void main() {
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(uv, uv);
  float r = sqrt(r2);
  // Discard square sprite corners so depth writes don't clip as boxes
  if (r > 1.0) { discard; }
  // Core disc alpha with a thicker feather to avoid precision artifacts
  float alpha = 1.0 - smoothstep(vCoreRadiusNorm, vCoreRadiusNorm + 0.05, r);
  // Screen-space circular mask shared by color and alpha
  float screenMask = 1.0;
  if (uMaskEnabled > 0) {
    // Pixel-space distance to mask center (attached to sphere center in NDC)
    vec2 deltaPx = vec2((vNdc.x - uMaskCenterNdc.x) * 0.5 * uViewportWidth, (vNdc.y - uMaskCenterNdc.y) * 0.5 * uViewportHeight);
    float distPx = length(deltaPx);
    float inside = 1.0 - smoothstep(uMaskRadiusPx, uMaskRadiusPx + max(0.0001, uMaskFeatherPx), distPx);
    screenMask = (uMaskInvert > 0) ? (1.0 - inside) : inside;
    alpha *= clamp(screenMask, 0.0, 1.0);
  }
  alpha *= min(3.0, 1.0 + vArcBoost);
  alpha *= clamp(uOpacity, 0.0, 1.0);
  // Edge ring emission to tint bloom without altering core opacity
  float inner = vCoreRadiusNorm;
  float end = mix(inner, 1.0, 0.3);
  float ring = 1.0 - smoothstep(inner, end, r);
  float emission = ring * clamp(uGlowStrength, 0.0, 3.0);
  vec3 color = (uColor + uGlowColor * emission * 0.4) * screenMask;
  float outAlpha = alpha;
  gl_FragColor = vec4(color, outAlpha);
}
`;

// Removed getMode function - using toggles instead

type Arc = {
  center: THREE.Vector3;
  tangent: THREE.Vector3;
  t0: number;
  duration: number;
  speed: number;
  span: number;
  thickness: number;
  feather: number;
  brightness: number;
};

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
  size = 1,
  opacity = 1,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
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
  enableSurfaceRipple = false,
  surfaceRippleAmount = 0.0,
  surfaceRippleSpeed = 1.5,
  surfaceRippleScale = 3.0,
  spinAxisX = 0,
  spinAxisY = 0,
  maskEnabled = false,
  maskRadius = 0.5,
  maskFeather = 0.2,
  maskInvert = false,
  sineSpeed = 1.7,
  sineScale = 1.0,
  pointColor = '#ffffff',
  glowColor = '#ffffff',
  glowStrength = 0.0,
  glowRadiusFactor = 0,
  // softness removed
  sizeRandomness = 0.0,
  enableArcs = false,
  arcMaxCount = 4,
  arcSpawnRate = 0.25,
  arcDuration = 4.0,
  arcSpeed = 1.5,
  arcSpanDeg = 60,
  arcThickness = 0.06,
  arcFeather = 0.04,
  arcBrightness = 1.0,
  arcAltitude = 0.02,
  // blendingMode kept for API stability
}: SphereWaveformProps) {
  const uniformsRef = useRef<Uniforms[] | null>(null);
  const prevNowRef = useRef<number | null>(null);
  const timeAccRef = useRef<number>(0);
  const lastAdvanceRef = useRef<number>(advanceCount);
  const arcsRef = useRef<Arc[]>([]);

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
        uSizeRandomness: { value: sizeRandomness },
        uEnableRandomish: { value: enableRandomishNoise ? 1 : 0 },
        uRandomishAmount: { value: randomishAmount },
        uEnableSine: { value: enableSineNoise ? 1 : 0 },
        uSineAmount: { value: sineAmount },
        uRandomishSpeed: { value: randomishSpeed },
        uPulseSize: { value: pulseSize },
        uOpacity: { value: opacity },
        uEnableRipple: { value: enableRippleNoise ? 1 : 0 },
        uRippleAmount: { value: rippleAmount },
        uRippleSpeed: { value: rippleSpeed },
        uRippleScale: { value: rippleScale },
        uEnableSurfaceRipple: { value: enableSurfaceRipple ? 1 : 0 },
        uSurfaceRippleAmount: { value: surfaceRippleAmount },
        uSurfaceRippleSpeed: { value: surfaceRippleSpeed },
        uSurfaceRippleScale: { value: surfaceRippleScale },
        uSurfaceCenter: { value: new THREE.Vector3(0, 0, 1) },
        uEnableSpin: { value: enableSpin ? 1 : 0 },
        uSpinSpeed: { value: spinSpeed },
        uSpinAxisX: { value: spinAxisX },
        uSpinAxisY: { value: spinAxisY },
        uMaskEnabled: { value: maskEnabled ? 1 : 0 },
        uMaskRadiusPx: { value: 0 },
        uMaskFeatherPx: { value: 0 },
        uMaskInvert: { value: maskInvert ? 1 : 0 },
        uMaskCenterNdc: { value: new THREE.Vector2(0, 0) },
        uSineSpeed: { value: sineSpeed },
        uSineScale: { value: sineScale },
        uColor: { value: new THREE.Color(pointColor) },
        uGlowColor: { value: new THREE.Color(glowColor) },
        uGlowStrength: { value: glowStrength },
        uGlowRadiusFactor: { value: glowRadiusFactor },
        uExpandHalo: { value: 1 },
        uArcsActive: { value: 0 },
        uArcCenters: { value: new Float32Array(8 * 3) },
        uArcTangents: { value: new Float32Array(8 * 3) },
        uArcT0: { value: new Float32Array(8) },
        uArcDur: { value: new Float32Array(8) },
        uArcSpeed: { value: new Float32Array(8) },
        uArcSpan: { value: new Float32Array(8) },
        uArcThick: { value: new Float32Array(8) },
        uArcFeather: { value: new Float32Array(8) },
        uArcBright: { value: new Float32Array(8) },
        uArcAltitude: { value: arcAltitude },
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

    // Stateful random arc spawner
    const arcs = arcsRef.current;
    // Cull expired
    for (let i = arcs.length - 1; i >= 0; i--) {
      if (timeAccRef.current - arcs[i].t0 > arcs[i].duration) {
        arcs.splice(i, 1);
      }
    }
    const maxArcs = Math.min(8, Math.max(0, Math.floor(arcMaxCount)));
    if (enableArcs && arcSpawnRate > 0 && arcs.length < maxArcs && dt > 0) {
      let expected = arcSpawnRate * dt;
      let spawns = Math.floor(expected);
      const rem = expected - spawns;
      if (Math.random() < rem) spawns += 1;
      for (let s = 0; s < spawns && arcs.length < maxArcs; s++) {
        // Random center on unit sphere
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const z = 2 * v - 1;
        const r = Math.sqrt(Math.max(0, 1 - z * z));
        const cx = r * Math.cos(theta);
        const cy = r * Math.sin(theta);
        const cz = z;
        const center = new THREE.Vector3(cx, cy, cz).normalize();
        // Random direction orthogonal to center
        const rand = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        let tangent = new THREE.Vector3().crossVectors(center, rand);
        if (tangent.lengthSq() < 1e-6) {
          tangent = new THREE.Vector3().crossVectors(center, new THREE.Vector3(1, 0, 0));
        }
        tangent.normalize();
        arcs.push({
          center,
          tangent,
          t0: timeAccRef.current,
          duration: arcDuration,
          speed: arcSpeed,
          span: (Math.max(0, arcSpanDeg) * Math.PI) / 180,
          thickness: Math.max(0, arcThickness),
          feather: Math.max(0.0001, arcFeather),
          brightness: Math.max(0, arcBrightness),
        });
      }
    }

    // Pack arc uniforms
    const centers = new Float32Array(8 * 3);
    const tangents = new Float32Array(8 * 3);
    const t0 = new Float32Array(8);
    const dur = new Float32Array(8);
    const spd = new Float32Array(8);
    const span = new Float32Array(8);
    const thick = new Float32Array(8);
    const feath = new Float32Array(8);
    const bright = new Float32Array(8);
    const arcsActive = Math.min(arcs.length, 8);
    for (let i = 0; i < arcsActive; i++) {
      const a = arcs[i];
      const idx3 = i * 3;
      centers[idx3 + 0] = a.center.x; centers[idx3 + 1] = a.center.y; centers[idx3 + 2] = a.center.z;
      tangents[idx3 + 0] = a.tangent.x; tangents[idx3 + 1] = a.tangent.y; tangents[idx3 + 2] = a.tangent.z;
      t0[i] = a.t0;
      dur[i] = a.duration;
      spd[i] = a.speed;
      span[i] = a.span;
      thick[i] = a.thickness;
      feath[i] = a.feather;
      bright[i] = a.brightness;
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
      u.uOpacity.value = THREE.MathUtils.clamp(opacity, 0, 1);
      u.uSizeRandomness.value = THREE.MathUtils.clamp(sizeRandomness, 0, 1);
      // Ripple
      u.uEnableRipple.value = enableRippleNoise ? 1 : 0;
      u.uRippleAmount.value = THREE.MathUtils.clamp(rippleAmount, 0, 1);
      u.uRippleSpeed.value = rippleSpeed;
      u.uRippleScale.value = rippleScale;
      // Surface ripple
      u.uEnableSurfaceRipple.value = enableSurfaceRipple ? 1 : 0;
      u.uSurfaceRippleAmount.value = THREE.MathUtils.clamp(surfaceRippleAmount, 0, 1);
      u.uSurfaceRippleSpeed.value = surfaceRippleSpeed;
      u.uSurfaceRippleScale.value = surfaceRippleScale;
      u.uEnableSpin.value = enableSpin ? 1 : 0;
      u.uSpinSpeed.value = spinSpeed;
      u.uSpinAxisX.value = spinAxisX;
      u.uSpinAxisY.value = spinAxisY;
      // Mask that follows sphere center in screen space, and scales with view
      u.uMaskEnabled.value = maskEnabled ? 1 : 0;
      u.uMaskInvert.value = maskInvert ? 1 : 0;
      const sphereCenter = new THREE.Vector3(0, 0, 0);
      const centerNdc = sphereCenter.clone().project(cam);
      u.uMaskCenterNdc.value.set(centerNdc.x, centerNdc.y);
      const minHalf = Math.min(stateFrame.size.width, stateFrame.size.height) * 0.5;
      // Map normalized maskRadius to pixels, adjusted by zoom (keeps scale roughly stable)
      u.uMaskRadiusPx.value = THREE.MathUtils.clamp(maskRadius, 0, 1) * minHalf * (1.0 / Math.max(1e-3, cam.zoom));
      u.uMaskFeatherPx.value = THREE.MathUtils.clamp(maskFeather, 0, 1) * minHalf * (1.0 / Math.max(1e-3, cam.zoom));
      // Sine noise
      u.uSineSpeed.value = sineSpeed;
      u.uSineScale.value = sineScale;
      // Color
      u.uColor.value.set(pointColor);
      u.uGlowColor.value.set(glowColor);
      u.uGlowStrength.value = THREE.MathUtils.clamp(glowStrength, 0, 3);
      u.uGlowRadiusFactor.value = Math.max(0, glowRadiusFactor);
      // softness removed
      // Arcs
      u.uArcsActive.value = arcsActive;
      u.uArcCenters.value.set(centers);
      u.uArcTangents.value.set(tangents);
      u.uArcT0.value.set(t0);
      u.uArcDur.value.set(dur);
      u.uArcSpeed.value.set(spd);
      u.uArcSpan.value.set(span);
      u.uArcThick.value.set(thick);
      u.uArcFeather.value.set(feath);
      u.uArcBright.value.set(bright);
      u.uArcAltitude.value = arcAltitude;
    }
  });

  const rotX = THREE.MathUtils.degToRad(rotationX);
  const rotY = THREE.MathUtils.degToRad(rotationY);
  const rotZ = THREE.MathUtils.degToRad(rotationZ);

  return (
    <group scale={[size, size, size]} rotation={[rotX, rotY, rotZ]}>
      {uniformsRef.current!.map((u, i) => (
        <group key={`shell-${i}`} renderOrder={i}>
        {/* Single pass again: core only; bloom will provide glow */}
        <points>
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
            depthTest
            alphaTest={0.001}
            premultipliedAlpha={false}
            blending={THREE.NormalBlending}
          />
        </points>
        </group>
      ))}
    </group>
  );
}

export default SphereWaveform;
