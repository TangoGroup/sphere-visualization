export interface FibonacciSphereResult {
  positions: Float32Array;
  seeds: Float32Array;
}

export function generateFibonacciSpherePoints(
  vertexCount: number,
  radius: number,
  seed: number = 1
): FibonacciSphereResult {
  const phi = (1 + Math.sqrt(5)) / 2;
  const goldenAngle = (2 - phi) * (2 * Math.PI);

  const positions = new Float32Array(vertexCount * 3);
  const seeds = new Float32Array(vertexCount);

  for (let i = 0; i < vertexCount; i += 1) {
    const t = i + 0.5;
    const y = 1 - (t / vertexCount) * 2; // y from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * t;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    positions[i * 3 + 0] = x * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = z * radius;

    // simple LCG-based pseudo-random per-vertex seed but deterministic by index and seed param
    const pr = lcg(i + 1, seed);
    seeds[i] = pr;
  }

  return { positions, seeds };
}

function lcg(index: number, seed: number): number {
  // Deterministic [0,1) based on index and seed
  const a = 1664525;
  const c = 1013904223;
  let state = (seed ^ (index * 2654435761)) >>> 0;
  state = (Math.imul(a, state) + c) >>> 0;
  return (state & 0xffffffff) / 0x100000000;
}
