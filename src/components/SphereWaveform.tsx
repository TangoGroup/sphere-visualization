import { useEffect, useMemo, useRef } from 'react';
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
  // Gradient coloring
  enableGradient?: boolean;
  gradientColor2?: string;
  gradientAngle?: number; // degrees 0..360
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
  // Modulation sources
  micEnvelope?: number; // 0..1
  randomishMicModAmount?: number; // 0..1
  sineMicModAmount?: number; // 0..1
  rippleMicModAmount?: number; // 0..1
  surfaceRippleMicModAmount?: number; // 0..1
  // Auto-transition of animatable props
  transition?: TransitionOptions;
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
  uShellPhase: { value: number };
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
  // Gradient
  uEnableGradient: { value: number };
  uColor2: { value: THREE.Color };
  uGradientAngle: { value: number };
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
uniform float uShellPhase;
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
// Gradient coloring
uniform int uEnableGradient;
uniform float uGradientAngle; // radians

varying vec2 vNdc;
varying float vArcBoost;
varying float vSizeRand;
varying float vCoreRadiusNorm;
varying float vGradT;

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
  vec3 initialBase = normalize(position);
  vec3 base = initialBase;

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
  float t = uTime * 0.4 + uShellPhase;
  
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
  // Compute gradient mix factor from original static position so color is stable
  if (uEnableGradient > 0) {
    float ang = uGradientAngle; // radians
    // 3D direction around Y axis (full great-circle variation)
    vec3 dir3 = normalize(vec3(cos(ang), 0.0, sin(ang)));
    float proj = dot(normalize(initialBase), dir3);
    vGradT = clamp(proj * 0.5 + 0.5, 0.0, 1.0);
  } else {
    vGradT = 0.0;
  }
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
uniform vec3 uColor2;
uniform int uEnableGradient;
uniform float uOpacity;
uniform vec3 uGlowColor;
uniform float uGlowStrength;
varying vec2 vNdc;
varying float vArcBoost;
varying float vSizeRand;
varying float vCoreRadiusNorm;
varying float vGradT;
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
  vec3 baseColor = (uEnableGradient > 0) ? mix(uColor, uColor2, clamp(vGradT, 0.0, 1.0)) : uColor;
  vec3 color = (baseColor + uGlowColor * emission * 0.4) * screenMask;
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

type AnimEase =
  | 'linear'
  | 'power1.in' | 'power1.out' | 'power1.inOut'
  | 'power2.in' | 'power2.out' | 'power2.inOut'
  | 'power3.in' | 'power3.out' | 'power3.inOut'
  | 'power4.in' | 'power4.out' | 'power4.inOut'
  | 'sine.in' | 'sine.out' | 'sine.inOut'
  | 'expo.in' | 'expo.out' | 'expo.inOut'
  | 'back.in' | 'back.out' | 'back.inOut'
  | 'elastic.in' | 'elastic.out' | 'elastic.inOut'
  | 'bounce.in' | 'bounce.out' | 'bounce.inOut';

export interface TransitionOptions {
  enabled?: boolean;
  mode?: 'lerp';
  duration?: number; // seconds
  ease?: AnimEase;
  onStart?: () => void;
  onComplete?: () => void;
}

function getEaser(name: AnimEase | undefined): (t: number) => number {
  switch (name) {
    case 'linear':
      return (t: number) => t;
    case 'power1.in':
      return (t: number) => t * t;
    case 'power1.out':
      return (t: number) => 1 - Math.pow(1 - t, 2);
    case 'power1.inOut':
      return (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    case 'power2.in':
      return (t: number) => t * t * t;
    case 'power2.out':
      return (t: number) => 1 - Math.pow(1 - t, 3);
    case 'power2.inOut':
      return (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    case 'power3.in':
      return (t: number) => t * t * t * t;
    case 'power3.out':
      return (t: number) => 1 - Math.pow(1 - t, 4);
    case 'power3.inOut':
      return (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
    case 'power4.in':
      return (t: number) => t * t * t * t * t;
    case 'power4.out':
      return (t: number) => 1 - Math.pow(1 - t, 5);
    case 'power4.inOut':
      return (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2);
    case 'sine.in':
      return (t: number) => 1 - Math.cos((t * Math.PI) / 2);
    case 'sine.out':
      return (t: number) => Math.sin((t * Math.PI) / 2);
    case 'sine.inOut':
      return (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
    case 'expo.in':
      return (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1)));
    case 'expo.out':
      return (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    case 'expo.inOut':
      return (t: number) => {
        if (t === 0 || t === 1) return t;
        return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
      };
    case 'back.in':
      return (t: number) => 2.7 * t * t * t - 1.7 * t * t;
    case 'back.out':
      return (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);
    case 'back.inOut':
      return (t: number) => {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return t < 0.5
          ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
          : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
      };
    case 'elastic.in':
      return (t: number) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
      };
    case 'elastic.out':
      return (t: number) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      };
    case 'elastic.inOut':
      return (t: number) => {
        const c5 = (2 * Math.PI) / 4.5;
        return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
          ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
      };
    case 'bounce.in':
      return (t: number) => 1 - getEaser('bounce.out')(1 - t);
    case 'bounce.out':
      return (t: number) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
      };
    case 'bounce.inOut':
      return (t: number) => t < 0.5
        ? (1 - getEaser('bounce.out')(1 - 2 * t)) / 2
        : (1 + getEaser('bounce.out')(2 * t - 1)) / 2;
    default:
      return (t: number) => t;
  }
}

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
  enableGradient = false,
  gradientColor2 = '#ffffff',
  gradientAngle = 0,
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
  // Modulation inputs (optional)
  micEnvelope = 0,
  randomishMicModAmount = 0,
  sineMicModAmount = 0,
  rippleMicModAmount = 0,
  surfaceRippleMicModAmount = 0,
  transition,
}: SphereWaveformProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const uniformsRef = useRef<Uniforms[] | null>(null);
  const prevNowRef = useRef<number | null>(null);
  const timeAccRef = useRef<number>(0);
  const lastAdvanceRef = useRef<number>(advanceCount);
  const arcsRef = useRef<Arc[]>([]);

  // Auto-transition state
  type NumericKey =
    | 'radius' | 'pointSize' | 'size' | 'opacity'
    | 'rotationX' | 'rotationY' | 'rotationZ'
    | 'randomishAmount' | 'randomishSpeed' | 'pulseSize'
    | 'sineAmount' | 'sineSpeed' | 'sineScale'
    | 'rippleAmount' | 'rippleSpeed' | 'rippleScale'
    | 'surfaceRippleAmount' | 'surfaceRippleSpeed' | 'surfaceRippleScale'
    | 'spinSpeed' | 'spinAxisX' | 'spinAxisY'
    | 'maskRadius' | 'maskFeather'
    | 'gradientAngle' | 'sizeRandomness'
    | 'glowStrength' | 'glowRadiusFactor'
    | 'arcSpawnRate' | 'arcDuration' | 'arcSpeed' | 'arcSpanDeg' | 'arcThickness' | 'arcFeather' | 'arcBrightness' | 'arcAltitude';

  type ColorKey = 'pointColor' | 'gradientColor2' | 'glowColor';

  const numericKeys: NumericKey[] = [
    'radius','pointSize','size','opacity',
    'rotationX','rotationY','rotationZ',
    'randomishAmount','randomishSpeed','pulseSize',
    'sineAmount','sineSpeed','sineScale',
    'rippleAmount','rippleSpeed','rippleScale',
    'surfaceRippleAmount','surfaceRippleSpeed','surfaceRippleScale',
    'spinSpeed','spinAxisX','spinAxisY',
    'maskRadius','maskFeather',
    'gradientAngle','sizeRandomness',
    'glowStrength','glowRadiusFactor',
    'arcSpawnRate','arcDuration','arcSpeed','arcSpanDeg','arcThickness','arcFeather','arcBrightness','arcAltitude',
  ];
  const colorKeys: ColorKey[] = ['pointColor','gradientColor2','glowColor'];

  const currentNumericRef = useRef<Record<NumericKey, number> | null>(null);
  const startNumericRef = useRef<Record<NumericKey, number> | null>(null);
  const targetNumericRef = useRef<Record<NumericKey, number> | null>(null);

  const currentColorRef = useRef<Record<ColorKey, THREE.Color> | null>(null);
  const startColorRef = useRef<Record<ColorKey, THREE.Color> | null>(null);
  const targetColorRef = useRef<Record<ColorKey, THREE.Color> | null>(null);

  const animActiveRef = useRef<boolean>(false);
  const animElapsedRef = useRef<number>(0);
  const animDurationRef = useRef<number>(0.6);
  const animEaseRef = useRef<(t: number) => number>((t: number) => t);
  const onStartRef = useRef<(() => void) | undefined>(undefined);
  const onCompleteRef = useRef<(() => void) | undefined>(undefined);

  // Initialize/handle prop changes → targets and (optionally) start tween
  useEffect(() => {
    const enabled = Boolean(transition?.enabled);
    const duration = (transition?.duration ?? 0.6);
    const ease = getEaser(transition?.ease ?? 'power2.inOut');
    onStartRef.current = transition?.onStart;
    onCompleteRef.current = transition?.onComplete;
    animDurationRef.current = Math.max(0, duration);
    animEaseRef.current = ease;

    const nextNumeric = {
      radius, pointSize, size, opacity,
      rotationX, rotationY, rotationZ,
      randomishAmount, randomishSpeed, pulseSize,
      sineAmount, sineSpeed, sineScale,
      rippleAmount, rippleSpeed, rippleScale,
      surfaceRippleAmount, surfaceRippleSpeed, surfaceRippleScale,
      spinSpeed, spinAxisX, spinAxisY,
      maskRadius, maskFeather,
      gradientAngle, sizeRandomness,
      glowStrength, glowRadiusFactor,
      arcSpawnRate, arcDuration, arcSpeed, arcSpanDeg, arcThickness, arcFeather, arcBrightness, arcAltitude,
    } as Record<NumericKey, number>;

    const nextColors: Record<ColorKey, THREE.Color> = {
      pointColor: new THREE.Color(pointColor),
      gradientColor2: new THREE.Color(gradientColor2),
      glowColor: new THREE.Color(glowColor),
    };

    if (!currentNumericRef.current || !currentColorRef.current) {
      currentNumericRef.current = { ...nextNumeric };
      currentColorRef.current = {
        pointColor: nextColors.pointColor.clone(),
        gradientColor2: nextColors.gradientColor2.clone(),
        glowColor: nextColors.glowColor.clone(),
      };
      startNumericRef.current = { ...nextNumeric };
      targetNumericRef.current = { ...nextNumeric };
      startColorRef.current = {
        pointColor: nextColors.pointColor.clone(),
        gradientColor2: nextColors.gradientColor2.clone(),
        glowColor: nextColors.glowColor.clone(),
      };
      targetColorRef.current = {
        pointColor: nextColors.pointColor.clone(),
        gradientColor2: nextColors.gradientColor2.clone(),
        glowColor: nextColors.glowColor.clone(),
      };
      animActiveRef.current = false;
      animElapsedRef.current = 0;
      return;
    }

    // Detect any change
    let changed = false;
    for (const k of numericKeys) {
      if (Math.abs(nextNumeric[k] - (targetNumericRef.current![k] ?? nextNumeric[k])) > 1e-9) { changed = true; break; }
    }
    if (!changed) {
      for (const k of colorKeys) {
        const a = nextColors[k];
        const b = targetColorRef.current![k];
        if (!a.equals(b)) { changed = true; break; }
      }
    }

    if (!changed) return;

    if (!enabled || animDurationRef.current === 0) {
      currentNumericRef.current = { ...nextNumeric };
      targetNumericRef.current = { ...nextNumeric };
      currentColorRef.current!.pointColor.copy(nextColors.pointColor);
      currentColorRef.current!.gradientColor2.copy(nextColors.gradientColor2);
      currentColorRef.current!.glowColor.copy(nextColors.glowColor);
      targetColorRef.current!.pointColor.copy(nextColors.pointColor);
      targetColorRef.current!.gradientColor2.copy(nextColors.gradientColor2);
      targetColorRef.current!.glowColor.copy(nextColors.glowColor);
      animActiveRef.current = false;
      animElapsedRef.current = 0;
      return;
    }

    // Start/restart tween from current → next
    startNumericRef.current = { ...currentNumericRef.current };
    targetNumericRef.current = { ...nextNumeric };
    startColorRef.current!.pointColor.copy(currentColorRef.current!.pointColor);
    startColorRef.current!.gradientColor2.copy(currentColorRef.current!.gradientColor2);
    startColorRef.current!.glowColor.copy(currentColorRef.current!.glowColor);
    targetColorRef.current!.pointColor.copy(nextColors.pointColor);
    targetColorRef.current!.gradientColor2.copy(nextColors.gradientColor2);
    targetColorRef.current!.glowColor.copy(nextColors.glowColor);
    animElapsedRef.current = 0;
    animActiveRef.current = true;
    try { onStartRef.current && onStartRef.current(); } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    transition?.enabled, transition?.duration, transition?.ease,
    radius, pointSize, size, opacity,
    rotationX, rotationY, rotationZ,
    randomishAmount, randomishSpeed, pulseSize,
    sineAmount, sineSpeed, sineScale,
    rippleAmount, rippleSpeed, rippleScale,
    surfaceRippleAmount, surfaceRippleSpeed, surfaceRippleScale,
    spinSpeed, spinAxisX, spinAxisY,
    maskRadius, maskFeather,
    gradientAngle, sizeRandomness,
    glowStrength, glowRadiusFactor,
    arcSpawnRate, arcDuration, arcSpeed, arcSpanDeg, arcThickness, arcFeather, arcBrightness, arcAltitude,
    pointColor, gradientColor2, glowColor,
  ]);

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
        uShellPhase: { value: 0 },
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
        uColor2: { value: new THREE.Color(gradientColor2) },
        uEnableGradient: { value: enableGradient ? 1 : 0 },
        uGradientAngle: { value: 0 },
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

    // Advance auto-transition
    if (animActiveRef.current && currentNumericRef.current && startNumericRef.current && targetNumericRef.current && currentColorRef.current && startColorRef.current && targetColorRef.current) {
      animElapsedRef.current += dt;
      const t = Math.min(1, animDurationRef.current > 0 ? animElapsedRef.current / animDurationRef.current : 1);
      const te = animEaseRef.current(t);
      for (const k of numericKeys) {
        const a = startNumericRef.current[k];
        const b = targetNumericRef.current[k];
        currentNumericRef.current[k] = a + (b - a) * te;
      }
      currentColorRef.current.pointColor.copy(startColorRef.current.pointColor).lerp(targetColorRef.current.pointColor, te);
      currentColorRef.current.gradientColor2.copy(startColorRef.current.gradientColor2).lerp(targetColorRef.current.gradientColor2, te);
      currentColorRef.current.glowColor.copy(startColorRef.current.glowColor).lerp(targetColorRef.current.glowColor, te);
      if (t >= 1) { animActiveRef.current = false; try { onCompleteRef.current && onCompleteRef.current(); } catch {} }
    }

    const anim = currentNumericRef.current;
    const animColors = currentColorRef.current;
    const radiusV = anim?.radius ?? radius;
    const pointSizeV = anim?.pointSize ?? pointSize;
    const sizeV = anim?.size ?? size;
    const opacityV = anim?.opacity ?? opacity;
    const rotationXV = anim?.rotationX ?? rotationX;
    const rotationYV = anim?.rotationY ?? rotationY;
    const rotationZV = anim?.rotationZ ?? rotationZ;
    const randomishAmountV = anim?.randomishAmount ?? randomishAmount;
    const randomishSpeedV = anim?.randomishSpeed ?? randomishSpeed;
    const pulseSizeV = anim?.pulseSize ?? pulseSize;
    const sineAmountV = anim?.sineAmount ?? sineAmount;
    const sineSpeedV = anim?.sineSpeed ?? sineSpeed;
    const sineScaleV = anim?.sineScale ?? sineScale;
    const rippleAmountV = anim?.rippleAmount ?? rippleAmount;
    const rippleSpeedV = anim?.rippleSpeed ?? rippleSpeed;
    const rippleScaleV = anim?.rippleScale ?? rippleScale;
    const surfaceRippleAmountV = anim?.surfaceRippleAmount ?? surfaceRippleAmount;
    const surfaceRippleSpeedV = anim?.surfaceRippleSpeed ?? surfaceRippleSpeed;
    const surfaceRippleScaleV = anim?.surfaceRippleScale ?? surfaceRippleScale;
    const spinSpeedV = anim?.spinSpeed ?? spinSpeed;
    const spinAxisXV = anim?.spinAxisX ?? spinAxisX;
    const spinAxisYV = anim?.spinAxisY ?? spinAxisY;
    const maskRadiusV = anim?.maskRadius ?? maskRadius;
    const maskFeatherV = anim?.maskFeather ?? maskFeather;
    const gradientAngleV = anim?.gradientAngle ?? gradientAngle;
    const sizeRandomnessV = anim?.sizeRandomness ?? sizeRandomness;
    const glowStrengthV = anim?.glowStrength ?? glowStrength;
    const glowRadiusFactorV = anim?.glowRadiusFactor ?? glowRadiusFactor;
    // Arc timeline params remain driven by internal stateful spawner; anim override not applied here.
    const arcAltitudeV = anim?.arcAltitude ?? arcAltitude;

    // Update group transform directly to avoid re-renders
    if (groupRef.current) {
      groupRef.current.scale.set(sizeV, sizeV, sizeV);
      groupRef.current.rotation.set(
        THREE.MathUtils.degToRad(rotationXV),
        THREE.MathUtils.degToRad(rotationYV),
        THREE.MathUtils.degToRad(rotationZV)
      );
    }

    for (let i = 0; i < uniformsArray.length; i++) {
      const u = uniformsArray[i];
      u.uTime.value = timeAccRef.current;
      u.uRadius.value = radiusV * (1 + i * 0.2);
      u.uPointSize.value = pointSizeV;
      u.uViewportWidth.value = stateFrame.size.width;
      u.uViewportHeight.value = stateFrame.size.height;
      const cam = stateFrame.camera as THREE.PerspectiveCamera;
      if (cam && typeof (cam as any).fov === 'number') {
        u.uFov.value = (cam.fov * Math.PI) / 180;
      }
      u.uVolume.value = THREE.MathUtils.clamp(volume, 0, 1);
      u.uEnableRandomish.value = enableRandomishNoise ? 1 : 0;
      const micEnv = THREE.MathUtils.clamp(micEnvelope, 0, 1);
      const randomishAmountFinal = THREE.MathUtils.clamp(
        (randomishAmountV ?? 0) + micEnv * THREE.MathUtils.clamp(randomishMicModAmount ?? 0, 0, 1),
        0,
        1
      );
      u.uRandomishAmount.value = randomishAmountFinal;
      u.uEnableSine.value = enableSineNoise ? 1 : 0;
      const sineAmountFinal = THREE.MathUtils.clamp(
        (sineAmountV ?? 0) + micEnv * THREE.MathUtils.clamp(sineMicModAmount ?? 0, 0, 1),
        0,
        1
      );
      u.uSineAmount.value = sineAmountFinal;
      u.uRandomishSpeed.value = randomishSpeedV;
      u.uPulseSize.value = THREE.MathUtils.clamp(pulseSizeV, 0, 1);
      u.uOpacity.value = THREE.MathUtils.clamp(opacityV, 0, 1);
      u.uSizeRandomness.value = THREE.MathUtils.clamp(sizeRandomnessV, 0, 1);
      // Ripple
      u.uEnableRipple.value = enableRippleNoise ? 1 : 0;
      u.uRippleAmount.value = THREE.MathUtils.clamp(
        (rippleAmountV ?? 0) + micEnv * THREE.MathUtils.clamp(rippleMicModAmount ?? 0, 0, 1),
        0,
        1
      );
      u.uRippleSpeed.value = rippleSpeedV;
      u.uRippleScale.value = rippleScaleV;
      // Surface ripple
      u.uEnableSurfaceRipple.value = enableSurfaceRipple ? 1 : 0;
      u.uSurfaceRippleAmount.value = THREE.MathUtils.clamp(
        (surfaceRippleAmountV ?? 0) + micEnv * THREE.MathUtils.clamp(surfaceRippleMicModAmount ?? 0, 0, 1),
        0,
        1
      );
      u.uSurfaceRippleSpeed.value = surfaceRippleSpeedV;
      u.uSurfaceRippleScale.value = surfaceRippleScaleV;
      u.uEnableSpin.value = enableSpin ? 1 : 0;
      u.uSpinSpeed.value = spinSpeedV;
      u.uSpinAxisX.value = spinAxisXV;
      u.uSpinAxisY.value = spinAxisYV;
      // Mask that follows sphere center in screen space, and scales with view
      u.uMaskEnabled.value = maskEnabled ? 1 : 0;
      u.uMaskInvert.value = maskInvert ? 1 : 0;
      const sphereCenter = new THREE.Vector3(0, 0, 0);
      const centerNdc = sphereCenter.clone().project(cam);
      u.uMaskCenterNdc.value.set(centerNdc.x, centerNdc.y);
      const minHalf = Math.min(stateFrame.size.width, stateFrame.size.height) * 0.5;
      // Map normalized maskRadius to pixels, adjusted by zoom (keeps scale roughly stable)
      u.uMaskRadiusPx.value = THREE.MathUtils.clamp(maskRadiusV, 0, 1) * minHalf * (1.0 / Math.max(1e-3, cam.zoom));
      u.uMaskFeatherPx.value = THREE.MathUtils.clamp(maskFeatherV, 0, 1) * minHalf * (1.0 / Math.max(1e-3, cam.zoom));
      // Sine noise
      u.uSineSpeed.value = sineSpeedV;
      u.uSineScale.value = sineScaleV;
      // Color
      if (animColors) {
        u.uColor.value.copy(animColors.pointColor);
        u.uColor2.value.copy(animColors.gradientColor2);
      } else {
        u.uColor.value.set(pointColor);
        u.uColor2.value.set(gradientColor2);
      }
      u.uEnableGradient.value = enableGradient ? 1 : 0;
      u.uGradientAngle.value = THREE.MathUtils.degToRad(gradientAngleV);
      if (animColors) {
        u.uGlowColor.value.copy(animColors.glowColor);
      } else {
        u.uGlowColor.value.set(glowColor);
      }
      u.uGlowStrength.value = THREE.MathUtils.clamp(glowStrengthV, 0, 3);
      u.uGlowRadiusFactor.value = Math.max(0, glowRadiusFactorV);
      // Per-shell phase: deterministic from base seed and shell index
      const phaseBase = Math.sin((seed + i * 17.23) * 12.9898) * 43758.5453;
      const jitter = 1.0; // read directly from config in App if needed; default 1 here
      u.uShellPhase.value = (phaseBase - Math.floor(phaseBase)) * jitter;
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
      u.uArcAltitude.value = arcAltitudeV;
    }
  });

  return (
    <group ref={groupRef} scale={[size, size, size]} rotation={[THREE.MathUtils.degToRad(rotationX), THREE.MathUtils.degToRad(rotationY), THREE.MathUtils.degToRad(rotationZ)]}>
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
