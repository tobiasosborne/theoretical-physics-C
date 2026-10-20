// Kernel of the demo c00.demo.photoeffekt: the photoelectric relation in the one-photon
// model (chapter c00, figure c00.fig.photoeffekt). Pure functions: no DOM, no clock.
// Reference implementation and golden values: numerics/src/c00_reference.jl via
// numerics/generate/c00_golden.jl -> web/tests/golden/photo.json.
//
// Model (content/c00-theorie/de.tex, c00.eq.photoeffekt and c00.eq.schwelle). Fixed
// material with binding energy W. One light quantum of energy h nu gives its energy to one
// electron; to get out, that electron spends an energy W' >= W. An electron that gets out
// keeps 0 <= (1/2) m_e v^2 = h nu - W' <= h nu - W, so
//   E_kin,max = (1/2) m_e v_max^2 = h nu - W,   and electrons leave only for nu >= W/h.
// The kinetic energy is nonrelativistic, (1/2) m_e v^2, which presupposes v << c; the
// kernel reports v/c so that the premise can be read off.
// The model fixes only the bound W' >= W, not how W' is distributed; emittedSpeed takes the
// demo's choice of W' as an input.
// Units: nu in Hz, energies in eV (1 eV = e J), speeds in m/s.

// ── constants: CODATA 2022, sources/codata-2022/allascii.txt ──
/** h in J/Hz (exact), line 271 "Planck constant" */
export const H_J_S = 6.62607015e-34;
/** e in C (exact), line 132 "elementary charge"; 1 eV = e J */
export const E_C = 1.602176634e-19;
/** m_e in kg, line 107 "electron mass" (central value) */
export const M_E_KG = 9.1093837139e-31;
/** c in m/s (exact), line 330 */
export const C_M_PER_S = 299792458;

/** h nu in eV */
export function photonEnergy(nuHz: number): number { return (H_J_S * nuHz) / E_C; }
/** threshold frequency W/h in Hz */
export function thresholdFrequency(W_eV: number): number {
  if (!(W_eV > 0)) throw new Error('photo: the binding energy must be positive');
  return (W_eV * E_C) / H_J_S;
}
/** h nu - W in eV: E_kin,max for nu >= W/h; negative below the threshold, where no electron leaves */
export function kineticMax(nuHz: number, W_eV: number): number { return (H_J_S * nuHz) / E_C - W_eV; }
/** does a single light quantum of frequency nu release an electron: nu >= W/h (c00.eq.schwelle) */
export function emits(nuHz: number, W_eV: number): boolean { return kineticMax(nuHz, W_eV) >= 0; }
/** speed in m/s of an electron of kinetic energy E (eV), from E = (1/2) m_e v^2 */
export function speedOfEnergy(E_eV: number): number {
  if (!(E_eV >= 0)) throw new Error('photo: the kinetic energy must not be negative');
  return Math.sqrt((2 * E_eV * E_C) / M_E_KG);
}
/** v_max in m/s for nu >= W/h */
export function maxSpeed(nuHz: number, W_eV: number): number {
  const k = kineticMax(nuHz, W_eV);
  if (k < 0) throw new Error('photo: below the threshold no electron leaves');
  return speedOfEnergy(k);
}
/**
 * Speed in m/s of an electron that spends W' = W + f (h nu - W) to get out, f in [0, 1]
 * (f = 0: the fastest electron, W' = W). f is the demo's choice; the model does not fix it.
 */
export function emittedSpeed(nuHz: number, W_eV: number, f: number): number {
  if (!(f >= 0 && f <= 1)) throw new Error('photo: f must lie in [0, 1]');
  const k = kineticMax(nuHz, W_eV);
  if (k < 0) throw new Error('photo: below the threshold no electron leaves');
  return speedOfEnergy((1 - f) * k);
}
/** v / c */
export function beta(v: number): number { return v / C_M_PER_S; }

/** figure units: horizontal h nu / W_1, vertical E / W_1. The line E/W_1 = x - w for the binding energy w = W/W_1 */
export function reducedKineticMax(x: number, w: number): number { return x - w; }
/** h nu / W_1 -> nu in Hz */
export function frequencyOfReduced(x: number, W1_eV: number): number { return (x * W1_eV * E_C) / H_J_S; }
