"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const p=require("react"),ct=require("three"),ft=require("@react-three/fiber");function pt(o){const e=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(o){for(const i in o)if(i!=="default"){const u=Object.getOwnPropertyDescriptor(o,i);Object.defineProperty(e,i,u.get?u:{enumerable:!0,get:()=>o[i]})}}return e.default=o,Object.freeze(e)}const l=pt(ct);var ea={exports:{}},_e={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var xa;function dt(){if(xa)return _e;xa=1;var o=Symbol.for("react.transitional.element"),e=Symbol.for("react.fragment");function i(u,m,S){var B=null;if(S!==void 0&&(B=""+S),m.key!==void 0&&(B=""+m.key),"key"in m){S={};for(var v in m)v!=="key"&&(S[v]=m[v])}else S=m;return m=S.ref,{$$typeof:o,type:u,key:B,ref:m!==void 0?m:null,props:S}}return _e.Fragment=e,_e.jsx=i,_e.jsxs=i,_e}var Fe={};/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Ma;function mt(){return Ma||(Ma=1,process.env.NODE_ENV!=="production"&&function(){function o(a){if(a==null)return null;if(typeof a=="function")return a.$$typeof===He?null:a.displayName||a.name||null;if(typeof a=="string")return a;switch(a){case T:return"Fragment";case z:return"Profiler";case H:return"StrictMode";case Q:return"Suspense";case pe:return"SuspenseList";case oe:return"Activity"}if(typeof a=="object")switch(typeof a.tag=="number"&&console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."),a.$$typeof){case ne:return"Portal";case fe:return(a.displayName||"Context")+".Provider";case I:return(a._context.displayName||"Context")+".Consumer";case D:var s=a.render;return a=a.displayName,a||(a=s.displayName||s.name||"",a=a!==""?"ForwardRef("+a+")":"ForwardRef"),a;case j:return s=a.displayName||null,s!==null?s:o(a.type)||"Memo";case q:s=a._payload,a=a._init;try{return o(a(s))}catch{}}return null}function e(a){return""+a}function i(a){try{e(a);var s=!1}catch{s=!0}if(s){s=console;var f=s.error,R=typeof Symbol=="function"&&Symbol.toStringTag&&a[Symbol.toStringTag]||a.constructor.name||"Object";return f.call(s,"The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",R),e(a)}}function u(a){if(a===T)return"<>";if(typeof a=="object"&&a!==null&&a.$$typeof===q)return"<...>";try{var s=o(a);return s?"<"+s+">":"<...>"}catch{return"<...>"}}function m(){var a=Y.A;return a===null?null:a.getOwner()}function S(){return Error("react-stack-top-frame")}function B(a){if(ie.call(a,"key")){var s=Object.getOwnPropertyDescriptor(a,"key").get;if(s&&s.isReactWarning)return!1}return a.key!==void 0}function v(a,s){function f(){L||(L=!0,console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",s))}f.isReactWarning=!0,Object.defineProperty(a,"key",{get:f,configurable:!0})}function h(){var a=o(this.type);return Oe[a]||(Oe[a]=!0,console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.")),a=this.props.ref,a!==void 0?a:null}function c(a,s,f,R,P,b,we,$){return f=b.ref,a={$$typeof:g,type:a,key:s,props:b,_owner:P},(f!==void 0?f:null)!==null?Object.defineProperty(a,"ref",{enumerable:!1,get:h}):Object.defineProperty(a,"ref",{enumerable:!1,value:null}),a._store={},Object.defineProperty(a._store,"validated",{configurable:!1,enumerable:!1,writable:!0,value:0}),Object.defineProperty(a,"_debugInfo",{configurable:!1,enumerable:!1,writable:!0,value:null}),Object.defineProperty(a,"_debugStack",{configurable:!1,enumerable:!1,writable:!0,value:we}),Object.defineProperty(a,"_debugTask",{configurable:!1,enumerable:!1,writable:!0,value:$}),Object.freeze&&(Object.freeze(a.props),Object.freeze(a)),a}function M(a,s,f,R,P,b,we,$){var x=s.children;if(x!==void 0)if(R)if(de(x)){for(R=0;R<x.length;R++)E(x[R]);Object.freeze&&Object.freeze(x)}else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");else E(x);if(ie.call(s,"key")){x=o(a);var U=Object.keys(s).filter(function(qe){return qe!=="key"});R=0<U.length?"{key: someKey, "+U.join(": ..., ")+": ...}":"{key: someKey}",Me[x+R]||(U=0<U.length?"{"+U.join(": ..., ")+": ...}":"{}",console.error(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,R,x,U,x),Me[x+R]=!0)}if(x=null,f!==void 0&&(i(f),x=""+f),B(s)&&(i(s.key),x=""+s.key),"key"in s){f={};for(var be in s)be!=="key"&&(f[be]=s[be])}else f=s;return x&&v(f,typeof a=="function"?a.displayName||a.name||"Unknown":a),c(a,x,b,P,m(),f,we,$)}function E(a){typeof a=="object"&&a!==null&&a.$$typeof===g&&a._store&&(a._store.validated=1)}var w=p,g=Symbol.for("react.transitional.element"),ne=Symbol.for("react.portal"),T=Symbol.for("react.fragment"),H=Symbol.for("react.strict_mode"),z=Symbol.for("react.profiler"),I=Symbol.for("react.consumer"),fe=Symbol.for("react.context"),D=Symbol.for("react.forward_ref"),Q=Symbol.for("react.suspense"),pe=Symbol.for("react.suspense_list"),j=Symbol.for("react.memo"),q=Symbol.for("react.lazy"),oe=Symbol.for("react.activity"),He=Symbol.for("react.client.reference"),Y=w.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,ie=Object.prototype.hasOwnProperty,de=Array.isArray,X=console.createTask?console.createTask:function(){return null};w={react_stack_bottom_frame:function(a){return a()}};var L,Oe={},ue=w.react_stack_bottom_frame.bind(w,S)(),le=X(u(S)),Me={};Fe.Fragment=T,Fe.jsx=function(a,s,f,R,P){var b=1e4>Y.recentlyCreatedOwnerStacks++;return M(a,s,f,!1,R,P,b?Error("react-stack-top-frame"):ue,b?X(u(a)):le)},Fe.jsxs=function(a,s,f,R,P){var b=1e4>Y.recentlyCreatedOwnerStacks++;return M(a,s,f,!0,R,P,b?Error("react-stack-top-frame"):ue,b?X(u(a)):le)}}()),Fe}process.env.NODE_ENV==="production"?ea.exports=dt():ea.exports=mt();var ce=ea.exports;function ht(o,e,i=1){const u=Math.max(1,Math.floor(Number.isFinite(o)?o:1)),m=Number.isFinite(e)?e:1,B=(2-(1+Math.sqrt(5))/2)*(2*Math.PI),v=new Float32Array(u*3),h=new Float32Array(u);for(let c=0;c<u;c+=1){const M=c+.5,E=1-M/Math.max(1,u)*2,w=Math.min(1,Math.max(-1,E)),g=Math.sqrt(Math.max(0,1-w*w)),ne=B*M,T=Math.cos(ne)*g,H=Math.sin(ne)*g;v[c*3+0]=T*m,v[c*3+1]=w*m,v[c*3+2]=H*m;const z=vt(c+1,i);h[c]=z}return{positions:v,seeds:h}}function vt(o,e){let m=(e^o*2654435761)>>>0;return m=Math.imul(1664525,m)+1013904223>>>0,(m&4294967295)/4294967296}const At=`
precision highp float;
attribute float aSeed;

uniform float uTime;
uniform float uVolume;
uniform float uRadius;
uniform float uRadius2;
uniform float uPointSize;
uniform float uPointSize2;
uniform float uPixelRatio;
uniform float uViewportWidth;
uniform float uViewportHeight;
uniform float uFov;
uniform float uShellPhase;
uniform float uSizeRandomness;
uniform float uGlowRadiusFactor;
uniform float uGlowRadiusFactor2;
// softness removed
uniform int uEnableRandomish;
uniform float uRandomishAmount;
uniform float uRandomishAmount2;
uniform int uEnableSine;
uniform float uSineAmount;
uniform float uSineAmount2;
uniform float uRandomishSpeed;
uniform float uRandomishSpeed2;
uniform float uSineSpeed;
uniform float uSineScale;
uniform float uSineSpeed2;
uniform float uSineScale2;
uniform float uPulseSize;
uniform float uPulseSize2;
uniform int uEnableRipple;
uniform float uRippleAmount;
uniform float uRippleAmount2;
uniform float uRippleSpeed;
uniform float uRippleSpeed2;
uniform float uRippleScale;
uniform float uRippleScale2;
uniform int uEnableSurfaceRipple;
uniform float uSurfaceRippleAmount;
uniform float uSurfaceRippleAmount2;
uniform float uSurfaceRippleSpeed;
uniform float uSurfaceRippleSpeed2;
uniform float uSurfaceRippleScale;
uniform float uSurfaceRippleScale2;
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
uniform float uSpinSpeed2;
// Spin axis uniforms
uniform float uSpinAxisX;
uniform float uSpinAxisY;
uniform float uSpinAxisX2;
uniform float uSpinAxisY2;
// Gradient coloring
uniform int uEnableGradient;
uniform float uGradientAngle; // radians
uniform float uMorphProgress; // 0..1

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
  vec3 baseA = initialBase;
  vec3 baseB = initialBase;

  // Spin rotates around custom axis when enabled
  if (uEnableSpin > 0) {
    float spinAngleA = uTime * uSpinSpeed;
    float spinAngleB = uTime * uSpinSpeed2;
    
    // Convert axis angles to a normalized rotation axis vector
    // We'll use the axis angles to define the rotation axis
    float xRadA = radians(uSpinAxisX);
    float yRadA = radians(uSpinAxisY);
    float xRadB = radians(uSpinAxisX2);
    float yRadB = radians(uSpinAxisY2);
    
    // Create a rotation axis from the angles
    // This creates a unit vector pointing in the direction of the rotation axis
    vec3 axisA = normalize(vec3(
      sin(yRadA),
      sin(xRadA),
      cos(xRadA) * cos(yRadA)
    ));
    vec3 axisB = normalize(vec3(
      sin(yRadB),
      sin(xRadB),
      cos(xRadB) * cos(yRadB)
    ));
    
    // Rodrigues' rotation formula to rotate around the custom axis
    float cA = cos(spinAngleA);
    float sA = sin(spinAngleA);
    float omcA = 1.0 - cA; // one minus cosine
    float cB = cos(spinAngleB);
    float sB = sin(spinAngleB);
    float omcB = 1.0 - cB; // one minus cosine
    
    // Rotation matrix for rotation around arbitrary axis
    mat3 RA = mat3(
      axisA.x * axisA.x * omcA + cA,
      axisA.x * axisA.y * omcA - axisA.z * sA,
      axisA.x * axisA.z * omcA + axisA.y * sA,
      axisA.y * axisA.x * omcA + axisA.z * sA,
      axisA.y * axisA.y * omcA + cA,
      axisA.y * axisA.z * omcA - axisA.x * sA,
      axisA.z * axisA.x * omcA - axisA.y * sA,
      axisA.z * axisA.y * omcA + axisA.x * sA,
      axisA.z * axisA.z * omcA + cA
    );
    mat3 RB = mat3(
      axisB.x * axisB.x * omcB + cB,
      axisB.x * axisB.y * omcB - axisB.z * sB,
      axisB.x * axisB.z * omcB + axisB.y * sB,
      axisB.y * axisB.x * omcB + axisB.z * sB,
      axisB.y * axisB.y * omcB + cB,
      axisB.y * axisB.z * omcB - axisB.x * sB,
      axisB.z * axisB.x * omcB - axisB.y * sB,
      axisB.z * axisB.y * omcB + axisB.x * sB,
      axisB.z * axisB.z * omcB + cB
    );
    
    // Apply the rotation
    baseA = RA * baseA;
    baseB = RB * baseB;
  }

  // Base time
  float t = uTime * 0.4 + uShellPhase;
  
  float nRandomish = 0.0;
  if (uEnableRandomish > 0) {
    float spatialScale = mix(0.5, 10.0, uPulseSize);
    float tR = t * uRandomishSpeed;
    vec3 p = baseA * spatialScale + vec3(aSeed * 0.1, aSeed * 0.2, tR);
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
    float longitude = atan(baseA.y, baseA.x); // [-pi, pi]
    float wave = sin(longitude * uRippleScale - tR);
    nRipple = wave * uRippleAmount;
  }
  // Surface ripple displacement along tangent directions (keeps radius ~constant)
  vec3 tangentDisplaced = vec3(0.0);
  if (uEnableSurfaceRipple > 0) {
    vec3 N = normalize(baseA);
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
    vec3 surf = normalize(baseA + offset);
    tangentDisplaced = surf - baseA;
  }
  float n = nRandomish + nSine + nRipple;

  // Map n in [-1,1] to multiplicative radius: 1 + n*volume
  float radialFactorA = 1.0 + n * clamp(uVolume, 0.0, 1.0);
  radialFactorA = clamp(radialFactorA, 0.0, 2.5);
  vec3 displacedA = (baseA + tangentDisplaced) * (uRadius * radialFactorA);

  // Lane B
  float nRandomishB = 0.0;
  float nSineB = 0.0;
  float nRippleB = 0.0;
  vec3 tangentDisplacedB = vec3(0.0);
  if (uEnableRandomish > 0) {
    float spatialScaleB = mix(0.5, 10.0, uPulseSize2);
    float tRB = t * uRandomishSpeed2;
    vec3 pB = baseB * spatialScaleB + vec3(aSeed * 0.1, aSeed * 0.2, tRB);
    nRandomishB = (smoothNoise(pB) * 2.0 - 1.0) * uRandomishAmount2;
  }
  if (uEnableSine > 0) {
    nSineB = sin(t * uSineSpeed2 + aSeed * 6.2831853 * uSineScale2) * uSineAmount2;
  }
  if (uEnableRipple > 0) {
    float tRB = t * uRippleSpeed2;
    float longitudeB = atan(baseB.y, baseB.x);
    float waveB = sin(longitudeB * uRippleScale2 - tRB);
    nRippleB = waveB * uRippleAmount2;
  }
  if (uEnableSurfaceRipple > 0) {
    vec3 N2 = normalize(baseB);
    float angle2 = acos(clamp(dot(N2, normalize(uSurfaceCenter)), -1.0, 1.0));
    float phase2 = angle2 * uSurfaceRippleScale2 - t * uSurfaceRippleSpeed2;
    float wave2 = sin(phase2);
    vec3 toCenterTangent2 = normalize(uSurfaceCenter - dot(uSurfaceCenter, N2) * N2);
    if (!all(greaterThan(abs(toCenterTangent2), vec3(1e-6)))) {
      vec3 alt2 = vec3(1.0, 0.0, 0.0);
      toCenterTangent2 = normalize(cross(N2, cross(alt2, N2)));
    }
    vec3 offset2 = toCenterTangent2 * (wave2 * uSurfaceRippleAmount2 * 0.25);
    vec3 surf2 = normalize(baseB + offset2);
    tangentDisplacedB = surf2 - baseB;
  }
  float nB = nRandomishB + nSineB + nRippleB;
  float radialFactorB = 1.0 + nB * clamp(uVolume, 0.0, 1.0);
  radialFactorB = clamp(radialFactorB, 0.0, 2.5);
  vec3 displacedB = (baseB + tangentDisplacedB) * (uRadius2 * radialFactorB);

  float s = clamp(uMorphProgress, 0.0, 1.0);
  // Spherical interpolation between lane directions to avoid passing through the origin
  vec3 dirA = normalize(baseA + tangentDisplaced);
  vec3 dirB = normalize(baseB + tangentDisplacedB);
  float dotAB = clamp(dot(dirA, dirB), -1.0, 1.0);
  float theta = acos(dotAB);
  vec3 dir;
  if (theta < 1e-4) {
    dir = dirA;
  } else {
    float sinTheta = sin(theta);
    float wA = sin((1.0 - s) * theta) / sinTheta;
    float wB = sin(s * theta) / sinTheta;
    dir = normalize(wA * dirA + wB * dirB);
  }
  float radiusMix = mix(uRadius * radialFactorA, uRadius2 * radialFactorB, s);
  vec3 displaced = dir * radiusMix;
  vec3 base = dir;

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
  float pointSizeMix = mix(uPointSize, uPointSize2, s);
  float glowMix = mix(uGlowRadiusFactor, uGlowRadiusFactor2, s);
  float basePx = (pointSizeMix * sizeFactor) * uPixelRatio * scale / -mvPosition.z;
  float haloPx = max(0.0, glowMix) * basePx;
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
`,St=`
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
`;function We(o){switch(o){case"linear":return e=>e;case"power1.in":return e=>e*e;case"power1.out":return e=>1-Math.pow(1-e,2);case"power1.inOut":return e=>e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2;case"power2.in":return e=>e*e*e;case"power2.out":return e=>1-Math.pow(1-e,3);case"power2.inOut":return e=>e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2;case"power3.in":return e=>e*e*e*e;case"power3.out":return e=>1-Math.pow(1-e,4);case"power3.inOut":return e=>e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2;case"power4.in":return e=>e*e*e*e*e;case"power4.out":return e=>1-Math.pow(1-e,5);case"power4.inOut":return e=>e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2;case"sine.in":return e=>1-Math.cos(e*Math.PI/2);case"sine.out":return e=>Math.sin(e*Math.PI/2);case"sine.inOut":return e=>-(Math.cos(Math.PI*e)-1)/2;case"expo.in":return e=>e===0?0:Math.pow(2,10*(e-1));case"expo.out":return e=>e===1?1:1-Math.pow(2,-10*e);case"expo.inOut":return e=>e===0||e===1?e:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2;case"back.in":return e=>2.7*e*e*e-1.7*e*e;case"back.out":return e=>1+2.7*Math.pow(e-1,3)+1.7*Math.pow(e-1,2);case"back.inOut":return e=>{const u=2.5949095;return e<.5?Math.pow(2*e,2)*((u+1)*2*e-u)/2:(Math.pow(2*e-2,2)*((u+1)*(e*2-2)+u)+2)/2};case"elastic.in":return e=>{const i=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*i)};case"elastic.out":return e=>{const i=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*i)+1};case"elastic.inOut":return e=>{const i=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*i))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*i)/2+1};case"bounce.in":return e=>1-We("bounce.out")(1-e);case"bounce.out":return e=>e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375;case"bounce.inOut":return e=>e<.5?(1-We("bounce.out")(1-2*e))/2:(1+We("bounce.out")(2*e-1))/2;default:return e=>e}}function Rt({vertexCount:o=400,volume:e,radius:i=1,pointSize:u=.04,shellCount:m=1,seed:S=1,freezeTime:B=!1,advanceCount:v=0,advanceAmount:h=1/60,size:c=1,opacity:M=1,rotationX:E=0,rotationY:w=0,rotationZ:g=0,enableRandomishNoise:ne=!0,randomishAmount:T=1,enableSineNoise:H=!1,sineAmount:z=0,pulseSize:I=1,enableSpin:fe=!1,spinSpeed:D=.35,randomishSpeed:Q=1.8,enableRippleNoise:pe=!1,rippleAmount:j=0,rippleSpeed:q=1.5,rippleScale:oe=3,enableSurfaceRipple:He=!1,surfaceRippleAmount:Y=0,surfaceRippleSpeed:ie=1.5,surfaceRippleScale:de=3,spinAxisX:X=0,spinAxisY:L=0,maskEnabled:Oe=!1,maskRadius:ue=.5,maskFeather:le=.2,maskInvert:Me=!1,sineSpeed:a=1.7,sineScale:s=1,pointColor:f="#ffffff",glowColor:R="#ffffff",glowStrength:P=0,glowRadiusFactor:b=0,enableGradient:we=!1,gradientColor2:$="#ffffff",gradientAngle:x=0,sizeRandomness:U=0,enableArcs:be=!1,arcMaxCount:qe=4,arcSpawnRate:ge=.25,arcDuration:Ve=4,arcSpeed:Ce=1.5,arcSpanDeg:Ie=60,arcThickness:je=.06,arcFeather:Ue=.04,arcBrightness:Ge=1,arcAltitude:ye=.02,micEnvelope:wa=0,randomishMicModAmount:ta=0,sineMicModAmount:ra=0,rippleMicModAmount:na=0,surfaceRippleMicModAmount:oa=0,transition:A,morph:J}){const me=p.useRef(null),Be=p.useRef(null),De=p.useRef(null),he=p.useRef(0),Ee=p.useRef(v),ba=p.useRef([]),ua=["radius","pointSize","size","opacity","rotationX","rotationY","rotationZ","randomishAmount","pulseSize","sineAmount","rippleAmount","surfaceRippleAmount","spinSpeed","spinAxisX","spinAxisY","maskRadius","maskFeather","gradientAngle","sizeRandomness","glowStrength","glowRadiusFactor","arcSpawnRate","arcDuration","arcSpeed","arcSpanDeg","arcThickness","arcFeather","arcBrightness","arcAltitude","pointColor","gradientColor2","glowColor"],N=p.useRef(null),Te=p.useRef(null),ve=p.useRef(null),Ae=p.useRef(!1),la=p.useRef(0),Ye=p.useRef(.6),ia=p.useRef(y=>y),Le=p.useRef(void 0),Je=p.useRef(void 0),Pe=p.useRef(null);p.useEffect(()=>{const y=(A==null?void 0:A.enabled)===!0,_=(A==null?void 0:A.duration)??.6,F=We((A==null?void 0:A.ease)??"power2.inOut");Le.current=A==null?void 0:A.onStart,Je.current=A==null?void 0:A.onComplete,Ye.current=Math.max(0,_),ia.current=F;const O={radius:i,pointSize:u,size:c,opacity:M,rotationX:E,rotationY:w,rotationZ:g,randomishAmount:T,pulseSize:I,sineAmount:z,rippleAmount:j,surfaceRippleAmount:Y,spinSpeed:D,spinAxisX:X,spinAxisY:L,maskRadius:ue,maskFeather:le,gradientAngle:x,sizeRandomness:U,glowStrength:P,glowRadiusFactor:b,arcSpawnRate:ge,arcDuration:Ve,arcSpeed:Ce,arcSpanDeg:Ie,arcThickness:je,arcFeather:Ue,arcBrightness:Ge,arcAltitude:ye,pointColor:f,gradientColor2:$,glowColor:R};if(!N.current){const Z={radius:i,pointSize:u,size:c,opacity:M,rotationX:E,rotationY:w,rotationZ:g,randomishAmount:T,pulseSize:I,sineAmount:z,rippleAmount:j,surfaceRippleAmount:Y,spinSpeed:D,spinAxisX:X,spinAxisY:L,maskRadius:ue,maskFeather:le,gradientAngle:x,sizeRandomness:U,glowStrength:P,glowRadiusFactor:b,arcSpawnRate:ge,arcDuration:Ve,arcSpeed:Ce,arcSpanDeg:Ie,arcThickness:je,arcFeather:Ue,arcBrightness:Ge,arcAltitude:ye,pointColor:f,gradientColor2:$,glowColor:R};console.log("=== INITIALIZING currentValuesRef ==="),console.log("currentVisualState:",Z),N.current={...Z},Te.current={...Z},ve.current={...Z},Ae.current=!1,console.log("currentValuesRef.current after init:",N.current),console.log("=== END INIT ===");return}let k=!1;if(Pe.current)for(const Z of ua){const ee=Pe.current[Z],ae=O[Z];if(typeof ee=="number"&&typeof ae=="number"){if(Math.abs(ee-ae)>1e-9){k=!0;break}}else if(typeof ee=="string"&&typeof ae=="string"&&ee!==ae){k=!0;break}}else k=!0;if(!k){Pe.current={...O};return}if(!y||Ye.current===0){console.log("=== SNAPPING VALUES (NO TRANSITION) ==="),console.log("enabled:",y,"duration:",Ye.current),console.log("transition:",A),console.log("currentValuesRef.current BEFORE snap:",N.current),console.log("currentProps (target):",O),N.current={...O},ve.current={...O},Pe.current={...O},Ae.current=!1,console.log("currentValuesRef.current AFTER snap:",N.current),console.log("=== END SNAP ===");return}console.log("=== STARTING TRANSITION ==="),console.log("currentValuesRef.current BEFORE transition start:",N.current),console.log("currentProps (target):",O),Te.current={...N.current},ve.current={...O},Pe.current={...O},la.current=performance.now(),Ae.current=!0,console.log("startValuesRef.current:",Te.current),console.log("targetValuesRef.current:",ve.current),console.log("=== END TRANSITION START ===");try{Le.current&&Le.current()}catch{}},[A==null?void 0:A.enabled,A==null?void 0:A.duration,A==null?void 0:A.ease,i,u,c,M,E,w,g,T,I,z,j,Y,D,X,L,ue,le,x,U,P,b,ge,Ve,Ce,Ie,je,Ue,Ge,ye,f,$,R]);const{positions:ga,seeds:ya}=p.useMemo(()=>ht(o,i,S),[o,i,S]);Be.current===null&&(Be.current=[]);{const y=Math.max(1,Math.floor(m)),_=Be.current;for(let F=_.length;F<y;F++)_.push({uTime:{value:0},uVolume:{value:0},uRadius:{value:i*(F===0?1:1+F*.2)},uRadius2:{value:i*(F===0?1:1+F*.2)},uPointSize:{value:u},uPointSize2:{value:u},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uViewportWidth:{value:window.innerWidth},uViewportHeight:{value:window.innerHeight},uFov:{value:60*Math.PI/180},uShellPhase:{value:0},uSizeRandomness:{value:U},uEnableRandomish:{value:ne?1:0},uRandomishAmount:{value:T},uRandomishAmount2:{value:T},uEnableSine:{value:H?1:0},uSineAmount:{value:z},uSineAmount2:{value:z},uRandomishSpeed:{value:Q},uRandomishSpeed2:{value:Q},uPulseSize:{value:I},uPulseSize2:{value:I},uOpacity:{value:M},uGlowRadiusFactor:{value:b},uExpandHalo:{value:1},uGlowRadiusFactor2:{value:b},uEnableRipple:{value:pe?1:0},uRippleAmount:{value:j},uRippleAmount2:{value:j},uRippleSpeed:{value:q},uRippleSpeed2:{value:q},uRippleScale:{value:oe},uRippleScale2:{value:oe},uEnableSurfaceRipple:{value:He?1:0},uSurfaceRippleAmount:{value:Y},uSurfaceRippleAmount2:{value:Y},uSurfaceRippleSpeed:{value:ie},uSurfaceRippleSpeed2:{value:ie},uSurfaceRippleScale:{value:de},uSurfaceRippleScale2:{value:de},uSurfaceCenter:{value:new l.Vector3(0,0,1)},uEnableSpin:{value:fe?1:0},uSpinSpeed:{value:D},uSpinSpeed2:{value:D},uSpinAxisX:{value:X},uSpinAxisY:{value:L},uSpinAxisX2:{value:X},uSpinAxisY2:{value:L},uMaskEnabled:{value:Oe?1:0},uMaskRadiusPx:{value:0},uMaskFeatherPx:{value:0},uMaskInvert:{value:Me?1:0},uMaskCenterNdc:{value:new l.Vector2(0,0)},uSineSpeed:{value:a},uSineScale:{value:s},uSineSpeed2:{value:a},uSineScale2:{value:s},uColor:{value:new l.Color(f)},uColor2:{value:new l.Color($)},uEnableGradient:{value:we?1:0},uGradientAngle:{value:0},uGlowColor:{value:new l.Color(R)},uGlowStrength:{value:P},uMorphProgress:{value:0},uArcsActive:{value:0},uArcCenters:{value:new Float32Array(8*3)},uArcTangents:{value:new Float32Array(8*3)},uArcT0:{value:new Float32Array(8)},uArcDur:{value:new Float32Array(8)},uArcSpeed:{value:new Float32Array(8)},uArcSpan:{value:new Float32Array(8)},uArcThick:{value:new Float32Array(8)},uArcFeather:{value:new Float32Array(8)},uArcBright:{value:new Float32Array(8)},uArcAltitude:{value:ye}});_.length>y&&(_.length=y)}return ft.useFrame(y=>{const _=Be.current,F=y.clock.getElapsedTime();De.current===null&&(De.current=F,he.current=F,Ee.current=v);const O=Math.max(0,F-De.current);if(De.current=F,B){if(v!==Ee.current){const d=v-Ee.current;he.current+=d*h,Ee.current=v}}else he.current+=O,Ee.current=v;const k=ba.current;for(let d=k.length-1;d>=0;d--)he.current-k[d].t0>k[d].duration&&k.splice(d,1);const Z=Math.min(8,Math.max(0,Math.floor(qe)));if(be&&ge>0&&k.length<Z&&O>0){let d=ge*O,t=Math.floor(d);const V=d-t;Math.random()<V&&(t+=1);for(let G=0;G<t&&k.length<Z;G++){const C=Math.random(),te=Math.random(),K=2*Math.PI*C,W=2*te-1,Re=Math.sqrt(Math.max(0,1-W*W)),ke=Re*Math.cos(K),ze=Re*Math.sin(K),$e=W,xe=new l.Vector3(ke,ze,$e).normalize(),Ne=new l.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize();let se=new l.Vector3().crossVectors(xe,Ne);se.lengthSq()<1e-6&&(se=new l.Vector3().crossVectors(xe,new l.Vector3(1,0,0))),se.normalize(),k.push({center:xe,tangent:se,t0:he.current,duration:Ve,speed:Ce,span:Math.max(0,Ie)*Math.PI/180,thickness:Math.max(0,je),feather:Math.max(1e-4,Ue),brightness:Math.max(0,Ge)})}}const ee=new Float32Array(8*3),ae=new Float32Array(8*3),sa=new Float32Array(8),ca=new Float32Array(8),fa=new Float32Array(8),pa=new Float32Array(8),da=new Float32Array(8),ma=new Float32Array(8),ha=new Float32Array(8),va=Math.min(k.length,8);for(let d=0;d<va;d++){const t=k[d],V=d*3;ee[V+0]=t.center.x,ee[V+1]=t.center.y,ee[V+2]=t.center.z,ae[V+0]=t.tangent.x,ae[V+1]=t.tangent.y,ae[V+2]=t.tangent.z,sa[d]=t.t0,ca[d]=t.duration,fa[d]=t.speed,pa[d]=t.span,da[d]=t.thickness,ma[d]=t.feather,ha[d]=t.brightness}if(Ae.current&&N.current&&Te.current&&ve.current){const t=performance.now()-la.current,V=Ye.current*1e3,G=Math.min(1,V===0?1:t/V),C=ia.current(G);for(const te of ua){const K=Te.current[te],W=ve.current[te];if(typeof K=="number"&&typeof W=="number")N.current[te]=K+(W-K)*C;else if(typeof K=="string"&&typeof W=="string")try{const Re=new l.Color(K),ke=new l.Color(W),ze=Re.clone().lerp(ke,C);N.current[te]=`#${ze.getHexString()}`}catch{N.current[te]=W}}if(G>=1){Ae.current=!1;try{Je.current&&Je.current()}catch{}}}const r=Ae.current?N.current:null,Ba=(r==null?void 0:r.radius)??i,Ea=(r==null?void 0:r.pointSize)??u,Ze=(r==null?void 0:r.size)??c,Ta=(r==null?void 0:r.opacity)??M,Pa=(r==null?void 0:r.rotationX)??E,ka=(r==null?void 0:r.rotationY)??w,za=(r==null?void 0:r.rotationZ)??g,Na=(r==null?void 0:r.randomishAmount)??T,_a=Q,Fa=(r==null?void 0:r.pulseSize)??I,Oa=(r==null?void 0:r.sineAmount)??z,Va=a,Ca=s,Ia=(r==null?void 0:r.rippleAmount)??j,ja=q,Ua=oe,Ga=(r==null?void 0:r.surfaceRippleAmount)??Y,Da=ie,Ya=de,Xa=(r==null?void 0:r.spinSpeed)??D,$a=(r==null?void 0:r.spinAxisX)??X,Wa=(r==null?void 0:r.spinAxisY)??L,Ke=ue,Qe=le,Ha=(r==null?void 0:r.gradientAngle)??x,qa=(r==null?void 0:r.sizeRandomness)??U,La=(r==null?void 0:r.glowStrength)??P,Ja=(r==null?void 0:r.glowRadiusFactor)??b,Za=(r==null?void 0:r.arcAltitude)??ye,Ka=(r==null?void 0:r.pointColor)??f,Qa=(r==null?void 0:r.gradientColor2)??$,et=(r==null?void 0:r.glowColor)??R;me.current&&(me.current.scale.set(Ze,Ze,Ze),me.current.rotation.set(l.MathUtils.degToRad(Pa),l.MathUtils.degToRad(ka),l.MathUtils.degToRad(za)));const Xe=!!(J!=null&&J.enabled),Se=l.MathUtils.clamp((J==null?void 0:J.progress)??0,0,1),n=Xe&&(J!=null&&J.to)?J.to:void 0;for(let d=0;d<_.length;d++){const t=_[d];t.uTime.value=he.current,t.uRadius.value=Ba*(1+d*.2);const V=(n==null?void 0:n.radius)??i;t.uRadius2.value=V*(1+d*.2),t.uPointSize.value=Ea,t.uPointSize2.value=(n==null?void 0:n.pointSize)??u,t.uViewportWidth.value=y.size.width,t.uViewportHeight.value=y.size.height;const G=y.camera;G&&typeof G.fov=="number"&&(t.uFov.value=G.fov*Math.PI/180),t.uVolume.value=l.MathUtils.clamp(e,0,1),t.uEnableRandomish.value=1;const C=l.MathUtils.clamp(wa,0,1),te=l.MathUtils.clamp((Na??0)+C*l.MathUtils.clamp(ta??0,0,1),0,1);t.uRandomishAmount.value=te;const K=l.MathUtils.clamp((((n==null?void 0:n.randomishAmount)??T)||0)+C*l.MathUtils.clamp(ta??0,0,1),0,1);t.uRandomishAmount2.value=K,t.uEnableSine.value=1;const W=l.MathUtils.clamp((Oa??0)+C*l.MathUtils.clamp(ra??0,0,1),0,1);t.uSineAmount.value=W;const Re=l.MathUtils.clamp((((n==null?void 0:n.sineAmount)??z)||0)+C*l.MathUtils.clamp(ra??0,0,1),0,1);t.uSineAmount2.value=Re,t.uRandomishSpeed.value=_a,t.uRandomishSpeed2.value=(n==null?void 0:n.randomishSpeed)??Q,t.uPulseSize.value=l.MathUtils.clamp(Fa,0,1),t.uPulseSize2.value=l.MathUtils.clamp((n==null?void 0:n.pulseSize)??I,0,1),t.uOpacity.value=l.MathUtils.clamp(Ta,0,1),t.uSizeRandomness.value=l.MathUtils.clamp(qa,0,1),t.uEnableRipple.value=1,t.uRippleAmount.value=l.MathUtils.clamp((Ia??0)+C*l.MathUtils.clamp(na??0,0,1),0,1),t.uRippleSpeed.value=ja,t.uRippleScale.value=Ua,t.uRippleAmount2.value=l.MathUtils.clamp((((n==null?void 0:n.rippleAmount)??j)||0)+C*l.MathUtils.clamp(na??0,0,1),0,1),t.uRippleSpeed2.value=(n==null?void 0:n.rippleSpeed)??q,t.uRippleScale2.value=(n==null?void 0:n.rippleScale)??oe,t.uEnableSurfaceRipple.value=1,t.uSurfaceRippleAmount.value=l.MathUtils.clamp((Ga??0)+C*l.MathUtils.clamp(oa??0,0,1),0,1),t.uSurfaceRippleSpeed.value=Da,t.uSurfaceRippleScale.value=Ya,t.uSurfaceRippleAmount2.value=l.MathUtils.clamp((((n==null?void 0:n.surfaceRippleAmount)??Y)||0)+C*l.MathUtils.clamp(oa??0,0,1),0,1),t.uSurfaceRippleSpeed2.value=(n==null?void 0:n.surfaceRippleSpeed)??ie,t.uSurfaceRippleScale2.value=(n==null?void 0:n.surfaceRippleScale)??de,t.uEnableSpin.value=1,t.uSpinSpeed.value=Xa,t.uSpinSpeed2.value=(n==null?void 0:n.spinSpeed)??D,t.uSpinAxisX.value=$a,t.uSpinAxisY.value=Wa,t.uSpinAxisX2.value=(n==null?void 0:n.spinAxisX)??X,t.uSpinAxisY2.value=(n==null?void 0:n.spinAxisY)??L;const ke=l.MathUtils.clamp((n==null?void 0:n.maskRadius)??ue,0,1),ze=l.MathUtils.clamp((n==null?void 0:n.maskFeather)??le,0,1),$e=Xe?l.MathUtils.clamp(Ke,0,1)+(ke-l.MathUtils.clamp(Ke,0,1))*Se:l.MathUtils.clamp(Ke,0,1),xe=Xe?l.MathUtils.clamp(Qe,0,1)+(ze-l.MathUtils.clamp(Qe,0,1))*Se:l.MathUtils.clamp(Qe,0,1);t.uMaskEnabled.value=$e>0||xe>0?1:0,t.uMaskInvert.value=Me?1:0;const Ne=new l.Vector3;me.current?me.current.getWorldPosition(Ne):Ne.set(0,0,0);const se=Ne.clone().project(G);t.uMaskCenterNdc.value.set(se.x,se.y);const Aa=Math.min(y.size.width,y.size.height)*.5;t.uMaskRadiusPx.value=$e*Aa*(1/Math.max(.001,G.zoom)),t.uMaskFeatherPx.value=xe*Aa*(1/Math.max(.001,G.zoom)),t.uSineSpeed.value=Va,t.uSineScale.value=Ca,t.uSineSpeed2.value=(n==null?void 0:n.sineSpeed)??a,t.uSineScale2.value=(n==null?void 0:n.sineScale)??s;{const tt=new l.Color(Ka),rt=new l.Color(((n==null?void 0:n.pointColor)??f)||f),nt=tt.clone().lerp(rt,Se);t.uColor.value.copy(nt);const ot=new l.Color(Qa),ut=new l.Color(((n==null?void 0:n.gradientColor2)??$)||$),lt=ot.clone().lerp(ut,Se);t.uColor2.value.copy(lt),t.uEnableGradient.value=1;const Ra=Ha,it=(n==null?void 0:n.gradientAngle)??x,st=Ra+(it-Ra)*Se;t.uGradientAngle.value=l.MathUtils.degToRad(st)}t.uGlowColor.value.set(et),t.uGlowStrength.value=l.MathUtils.clamp(La,0,3),t.uGlowRadiusFactor.value=Math.max(0,Ja),t.uGlowRadiusFactor2.value=Math.max(0,(n==null?void 0:n.glowRadiusFactor)??b),t.uMorphProgress.value=Xe?Se:0;const Sa=Math.sin((S+d*17.23)*12.9898)*43758.5453,at=1;t.uShellPhase.value=(Sa-Math.floor(Sa))*at,t.uArcsActive.value=va,t.uArcCenters.value.set(ee),t.uArcTangents.value.set(ae),t.uArcT0.value.set(sa),t.uArcDur.value.set(ca),t.uArcSpeed.value.set(fa),t.uArcSpan.value.set(pa),t.uArcThick.value.set(da),t.uArcFeather.value.set(ma),t.uArcBright.value.set(ha),t.uArcAltitude.value=Za}}),ce.jsx("group",{ref:me,scale:[c,c,c],rotation:[l.MathUtils.degToRad(E),l.MathUtils.degToRad(w),l.MathUtils.degToRad(g)],children:Be.current.map((y,_)=>ce.jsx("group",{renderOrder:_,children:ce.jsxs("points",{children:[ce.jsxs("bufferGeometry",{children:[ce.jsx("bufferAttribute",{attach:"attributes-position",args:[ga,3]}),ce.jsx("bufferAttribute",{attach:"attributes-aSeed",args:[ya,1]})]},`${o}-${i}-${S}-${_}`),ce.jsx("shaderMaterial",{vertexShader:At,fragmentShader:St,uniforms:y,transparent:!0,depthWrite:!1,depthTest:!0,alphaTest:.001,premultipliedAlpha:!1,blending:l.NormalBlending})]})},`shell-${_}`))})}function re(o){switch(o){case"linear":return e=>e;case"power1.in":return e=>e*e;case"power1.out":return e=>1-Math.pow(1-e,2);case"power1.inOut":return e=>e<.5?2*e*e:1-Math.pow(-2*e+2,2)/2;case"power2.in":return e=>e*e*e;case"power2.out":return e=>1-Math.pow(1-e,3);case"power2.inOut":return e=>e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2;case"power3.in":return e=>e*e*e*e;case"power3.out":return e=>1-Math.pow(1-e,4);case"power3.inOut":return e=>e<.5?8*e*e*e*e:1-Math.pow(-2*e+2,4)/2;case"power4.in":return e=>e*e*e*e*e;case"power4.out":return e=>1-Math.pow(1-e,5);case"power4.inOut":return e=>e<.5?16*e*e*e*e*e:1-Math.pow(-2*e+2,5)/2;case"sine.in":return e=>1-Math.cos(e*Math.PI/2);case"sine.out":return e=>Math.sin(e*Math.PI/2);case"sine.inOut":return e=>-(Math.cos(Math.PI*e)-1)/2;case"expo.in":return e=>e===0?0:Math.pow(2,10*(e-1));case"expo.out":return e=>e===1?1:1-Math.pow(2,-10*e);case"expo.inOut":return e=>e===0||e===1?e:e<.5?Math.pow(2,20*e-10)/2:(2-Math.pow(2,-20*e+10))/2;case"back.in":return e=>2.7*e*e*e-1.7*e*e;case"back.out":return e=>1+2.7*Math.pow(e-1,3)+1.7*Math.pow(e-1,2);case"back.inOut":return e=>{const u=2.5949095;return e<.5?Math.pow(2*e,2)*((u+1)*2*e-u)/2:(Math.pow(2*e-2,2)*((u+1)*(e*2-2)+u)+2)/2};case"elastic.in":return e=>{const i=2*Math.PI/3;return e===0?0:e===1?1:-Math.pow(2,10*e-10)*Math.sin((e*10-10.75)*i)};case"elastic.out":return e=>{const i=2*Math.PI/3;return e===0?0:e===1?1:Math.pow(2,-10*e)*Math.sin((e*10-.75)*i)+1};case"elastic.inOut":return e=>{const i=2*Math.PI/4.5;return e===0?0:e===1?1:e<.5?-(Math.pow(2,20*e-10)*Math.sin((20*e-11.125)*i))/2:Math.pow(2,-20*e+10)*Math.sin((20*e-11.125)*i)/2+1};case"bounce.in":return e=>1-re("bounce.out")(1-e);case"bounce.out":return e=>e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375;case"bounce.inOut":return e=>e<.5?(1-re("bounce.out")(1-2*e))/2:(1+re("bounce.out")(2*e-1))/2;default:return e=>e}}function aa(o,e,i){const u={...o},m=(h,c)=>h+(c-h)*i,S=(h,c)=>h===void 0?c:h,B=["vertexCount","volume","radius","pointSize","shellCount","seed","size","opacity","rotationX","rotationY","rotationZ","randomishAmount","randomishSpeed","pulseSize","rippleAmount","rippleSpeed","rippleScale","surfaceRippleAmount","surfaceRippleSpeed","surfaceRippleScale","spinSpeed","spinAxisX","spinAxisY","maskRadius","maskFeather","sineAmount","sineSpeed","sineScale","glowStrength","glowRadiusFactor","sizeRandomness","arcMaxCount","arcSpawnRate","arcDuration","arcSpeed","arcSpanDeg","arcThickness","arcFeather","arcBrightness","arcAltitude","advanceCount","advanceAmount"];for(const h of B){const c=o[h],M=S(e[h],c);typeof c=="number"&&typeof M=="number"&&(u[h]=m(c,M))}const v=["pointColor","glowColor","gradientColor2"];for(const h of v){const c=o[h],M=e[h]??c;if(typeof c=="string"&&typeof M=="string")try{const E=new window.THREE.Color(c),w=new window.THREE.Color(M),g=E.clone().lerp(w,i);u[h]=`#${g.getHexString()}`}catch{u[h]=i<.5?c:M}}return u.enableRandomishNoise=!0,u.enableSineNoise=!0,u.enableRippleNoise=!0,u.enableSurfaceRipple=!0,u.enableSpin=!0,u.enableGradient=!0,u.enableArcs=!0,u.maskEnabled=!0,u.freezeTime=o.freezeTime,u.advanceCount=o.advanceCount,u.advanceAmount=o.advanceAmount,u.maskInvert=o.maskInvert,u.blendingMode=o.blendingMode,u}function xt(o){const e=p.useRef(re((o==null?void 0:o.ease)??"power2.inOut")),i=p.useRef(null),u=p.useRef(0),m=p.useRef(0),S=p.useRef(null),B=p.useRef(null),[v,h]=p.useState(!1),[c,M]=p.useState(0),[E,w]=p.useState(void 0);p.useEffect(()=>{e.current=re((o==null?void 0:o.ease)??"power2.inOut")},[o==null?void 0:o.ease]);const g=p.useCallback(()=>{i.current&&cancelAnimationFrame(i.current),i.current=null,h(!1)},[]),ne=p.useCallback((H,z)=>{var fe;g(),S.current={...z},B.current={...H.to},m.current=Math.max(0,H.duration)*1e3,e.current=re(H.ease??(o==null?void 0:o.ease)??"power2.inOut"),w(H.to),h(!0),M(0),(fe=o==null?void 0:o.onStart)==null||fe.call(o),u.current=performance.now();const I=()=>{var j,q;const D=performance.now(),Q=m.current===0?1:Math.min(1,(D-u.current)/m.current),pe=e.current(Q);if(M(pe),(j=o==null?void 0:o.onUpdate)==null||j.call(o,pe),Q<1)i.current=requestAnimationFrame(I);else{i.current=null,h(!1);const oe=aa(S.current,B.current,1);(q=o==null?void 0:o.onComplete)==null||q.call(o,oe)}};i.current=requestAnimationFrame(I)},[g,o]);return{morph:v?{enabled:!0,progress:c,to:E}:{enabled:!1,progress:0},play:ne,cancel:g,playing:v,progress:c}}class Mt{constructor(e="power2.inOut"){this.raf=null,this.start=0,this.durMs=0,this.easeFn=re(e)}cancel(){this.raf&&cancelAnimationFrame(this.raf),this.raf=null}async play(e,i,u){return this.cancel(),this.from={...i},this.to={...e.to},this.durMs=Math.max(0,e.duration)*1e3,this.easeFn=re(e.ease??"power2.inOut"),this.start=performance.now(),new Promise(m=>{const S=()=>{const B=performance.now(),v=this.durMs===0?1:Math.min(1,(B-this.start)/this.durMs),h=this.easeFn(v);u(h,this.to),v<1?this.raf=requestAnimationFrame(S):(this.raf=null,m(aa(this.from,this.to,1)))};this.raf=requestAnimationFrame(S)})}}exports.MorphController=Mt;exports.SphereWaveform=Rt;exports.getEaser=re;exports.interpolateConfig=aa;exports.useMorphAnimator=xt;
//# sourceMappingURL=index.cjs.map
