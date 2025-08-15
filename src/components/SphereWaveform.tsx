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
  // Sine noise uniforms
  uSineSpeed: { value: number };
  uSineScale: { value: number };
  // Appearance
  uColor: { value: THREE.Color };
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
// New toggle-based uniforms
uniform int uEnableSpin;
uniform float uSpinSpeed;
// Spin axis uniforms
uniform float uSpinAxisX;
uniform float uSpinAxisY;

varying vec2 vNdc;
varying float vArcBoost;

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
      float mask = withinSpan * withinThick * fade;
      if (mask > 0.0) {
        vArcBoost += mask * uArcBright[i];
        displaced += base * (0.02 * mask);
      }
    }
  }

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
varying float vArcBoost;
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
  alpha *= min(3.0, 1.0 + vArcBoost);
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
  enableArcs = false,
  arcMaxCount = 4,
  arcSpawnRate = 0.25,
  arcDuration = 4.0,
  arcSpeed = 1.5,
  arcSpanDeg = 60,
  arcThickness = 0.06,
  arcFeather = 0.04,
  arcBrightness = 1.0,
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
        uSineSpeed: { value: sineSpeed },
        uSineScale: { value: sineScale },
        uColor: { value: new THREE.Color(pointColor) },
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

    // Build arc uniforms deterministically per frame (no extra state)
    const maxArcs = Math.min(8, Math.max(0, Math.floor(arcMaxCount)));
    let arcsActive = 0;
    const centers = new Float32Array(8 * 3);
    const tangents = new Float32Array(8 * 3);
    const t0 = new Float32Array(8);
    const dur = new Float32Array(8);
    const spd = new Float32Array(8);
    const span = new Float32Array(8);
    const thick = new Float32Array(8);
    const feath = new Float32Array(8);
    const bright = new Float32Array(8);
    if (enableArcs && arcSpawnRate > 0 && maxArcs > 0) {
      const seededCount = maxArcs;
      for (let iArc = 0; iArc < seededCount; iArc++) {
        const seed = iArc * 97;
        const localPhase = (timeAccRef.current * arcSpawnRate + seed * 0.01) % 1;
        const startTime = timeAccRef.current - localPhase * arcDuration;
        // Random-ish center and tangent (ensure orthogonal)
        const theta = (seed * 0.13) % (Math.PI * 2);
        const phi = ((seed * 0.37) % 1) * Math.PI - Math.PI / 2;
        const cx = Math.cos(theta) * Math.cos(phi);
        const cy = Math.sin(theta) * Math.cos(phi);
        const cz = Math.sin(phi);
        // Tangent: cross(center, up); fallback to X axis if near parallel
        const upx = 0, upy = 0, upz = 1;
        let tx = cy * upz - cz * upy;
        let ty = cz * upx - cx * upz;
        let tz = cx * upy - cy * upx;
        const tlen = Math.hypot(tx, ty, tz);
        if (tlen < 1e-5) { tx = 1; ty = 0; tz = 0; }
        const idx3 = iArc * 3;
        centers[idx3 + 0] = cx; centers[idx3 + 1] = cy; centers[idx3 + 2] = cz;
        tangents[idx3 + 0] = tx; tangents[idx3 + 1] = ty; tangents[idx3 + 2] = tz;
        t0[iArc] = startTime;
        dur[iArc] = arcDuration;
        spd[iArc] = arcSpeed;
        span[iArc] = (Math.max(0, arcSpanDeg) * Math.PI) / 180;
        thick[iArc] = Math.max(0, arcThickness);
        feath[iArc] = Math.max(0.0001, arcFeather);
        bright[iArc] = Math.max(0, arcBrightness);
      }
      arcsActive = Math.min(seededCount, maxArcs);
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
      // Surface ripple
      u.uEnableSurfaceRipple.value = enableSurfaceRipple ? 1 : 0;
      u.uSurfaceRippleAmount.value = THREE.MathUtils.clamp(surfaceRippleAmount, 0, 1);
      u.uSurfaceRippleSpeed.value = surfaceRippleSpeed;
      u.uSurfaceRippleScale.value = surfaceRippleScale;
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
