## dot-sphere-waveform: NPM package plan

### Goals
- Export a reusable `SphereWaveform` React component.
- Export typed config/types and effect prop types.
- Export microphone utilities (`useMicAnalyzer`).
- Keep current demo app intact; add library build that consumers can install.

### Package structure (single repo, package-first)
- Keep current app at root as demo/playground.
- Create `src/lib/` for public package source (no demo-only code, no Zustand persistence, no Tailwind/shadcn UI).
- Create `src/lib/index.ts` as the package entry.
- Reuse rendering logic from `src/components/SphereWaveform.tsx` by moving it (or extracting) into `src/lib/SphereWaveform.tsx` with stable props.
- Extract shared types from `src/stores/configStore.ts` into `src/lib/types.ts` (no storage, only types/interfaces and constants).
- Keep `src/hooks/useMicAnalyzer.ts` and re-export from the package.

### Build & publish
- Add a separate library build using tsup or tsup+rollup: ESM + CJS + types.
- Mark `peerDependencies`: `react`, `react-dom`, `three`, `@react-three/fiber`, optionally `@react-three/drei`.
- `dependencies`: minimal runtime-only (ideally none).
- Generate `.d.ts` via TypeScript or tsup.
- Side effects: false (ensure shaders are in strings; OK).

### Public API
- Component: `SphereWaveform(props: SphereWaveformProps)`.
- Hooks: `useMicAnalyzer(options?: MicAnalyzerOptions)`.
- Types: `SphereWaveformProps`, `MicAnalyzerOptions`, `MicAnalyzer`, selected config enums/constants.
- Utilities: `generateFibonacciSpherePoints` if useful to consumers.

### Animations (package feature)
- Auto-transition on prop change; no imperative API required.
- Keep defaults non-invasive (disabled by default).

API surface:
```ts
type AnimEase =
  | 'linear'
  | 'power1.in' | 'power1.out' | 'power1.inOut'
  | 'power2.in' | 'power2.out' | 'power2.inOut'
  | 'power3.in' | 'power3.out' | 'power3.inOut'
  | 'sine.in' | 'sine.out' | 'sine.inOut'
  | 'expo.in' | 'expo.out' | 'expo.inOut';

type TransitionOptions = {
  enabled?: boolean;      // default false
  mode?: 'lerp';          // start with 'lerp'; consider 'spring' later
  duration?: number;      // seconds, default 0.6
  ease?: AnimEase;        // default 'power2.inOut'
  onStart?: () => void;
  onComplete?: () => void;
};

type SphereWaveformProps = {
  // existing props...
  transition?: TransitionOptions;
};
```

Behavior:
- Detect changed props on render; for animatable keys (numbers, hex colors) tween from previous to next using one shared `duration/ease`.
- Non-animatable keys snap.
- Color tween: parse to `THREE.Color`, lerp, emit hex strings.
- Interruptions: restart from current animated value; call `onStart/onComplete` accordingly.

Implementation:
- Internal `requestAnimationFrame` driver + `d3-ease` (already a dep). No extra runtime dependency.
- Keep animation state per-prop internally; commit interpolated values via React state and pass to uniforms each frame.
- Later extension: optional `'spring'` with small, dependency-free solver or a tiny lib if needed.

Library choice:
- Avoid heavy deps (`framer-motion`, `gsap`, `react-spring`) due to bundle/peer complexity and R3F integration quirks.
- `d3-ease` gives high-quality easings; rAF-based tween is ~50–100 LOC and fully tree-shakable.

### Consumer usage
```tsx
import { Canvas } from '@react-three/fiber';
import { SphereWaveform, useMicAnalyzer } from 'dot-sphere-waveform';

function Example() {
  const { volume, start } = useMicAnalyzer();
  useEffect(() => { start(); }, [start]);
  return (
    <Canvas>
      <SphereWaveform volume={volume} />
    </Canvas>
  );
}
```

### Demo app preservation
- Keep existing demo app with Zustand store and control UI.
- Wire demo to import from local package output during development (path alias) to dogfood the package API.

### Steps
1) Create `src/lib/` and move/extract: component, types, hooks, utils.
2) Add `src/lib/index.ts` exports and preserve backward-compat in app via aliases.
3) Add build tooling (tsup) config and scripts; set package fields (`exports`, `types`, `files`).
4) Define peer deps, set `sideEffects: false`.
5) Smoke-test in demo consuming built output.
6) Prepare README (install, usage, API, peer deps).
7) Publish under new package name (unmark private).

### Versioning & stability
- Start at 0.1.0, semver. Document breaking changes.
- Props match current `SphereWaveformProps`; defaults non-invasive.

### Open questions
- Should demo live in packages/app using a monorepo (Turborepo)? Optional; start simple.
- Do we export config migrations? Likely no; keep store private to demo.

