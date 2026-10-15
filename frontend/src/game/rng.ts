// Deterministic seeded RNG (mulberry32). The whole simulation is reproducible
// from (seed, rngState); both are persisted so a reload continues identically.

export interface Rng {
  state: number;
}

export function makeSeed(): number {
  return (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1;
}

// Returns the next float in [0, 1) and the advanced state.
export function nextFloat(state: number): { value: number; state: number } {
  let t = (state + 0x6d2b79f5) >>> 0;
  let x = t;
  x = Math.imul(x ^ (x >>> 15), x | 1);
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
  const value = ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  return { value, state: t };
}

// Integer in [min, max] inclusive.
export function nextInt(
  state: number,
  min: number,
  max: number,
): { value: number; state: number } {
  const r = nextFloat(state);
  const span = max - min + 1;
  return { value: min + Math.floor(r.value * span), state: r.state };
}
