// The cyclic phase map of the hydrogen views, constructed in OKLCH from design tokens.
// Pure functions (no DOM); tested in web/tests/kernels/hydrogen-phasemap.test.ts, which also
// measures the lightness variation and the step uniformity of the map after 8-bit rounding.
//
// WHAT THE MAP IS. arg(psi) is an angle, so the map must be periodic; a perceptually uniform
// map makes equal phase differences look equally different and gives no phase a lightness
// of its own (lightness is reserved for |psi|). In OKLCH that is: constant lightness L,
// constant chroma C, hue angle = hue0 + arg(psi). Around such a circle the OKLab distance
// between two phases depends only on their difference (a chord of a circle), and the map
// closes on itself. How uniform it looks is the uniformity of OKLab; no claim beyond that.
//
// FROM TOKENS. The map has no colour literal. Its inputs are two tokens:
//   ground  the surface it is drawn on (plate or stage): |psi| = 0 is exactly this colour;
//   anchor  the state role on that surface (state or stage-state): it fixes hue0 (the colour of
//           phase 0 has the hue of the state role) and, with the ground, the lightness of
//           full strength, L_full = L_ground + FULL (L_anchor - L_ground).
// The chroma is the largest one that every hue reaches inside sRGB at L_full, times MARGIN.
// A colour of strength s in [0, 1] is the straight line in OKLab from the ground to the
// full-strength colour of that phase: lightness and chroma both grow linearly with s.
//
// OKLab matrices: design/build_tokens.py, functions lin2oklab and oklch2lin (the token
// compiler's own conversion; the test compares this file with the tokens it wrote).
// sRGB transfer function: web/src/demo/tokens.ts (IEC 61966-2-1), inverted here.

export type RGB = readonly [number, number, number];

/** fraction of the way from the ground lightness to the anchor lightness at full strength: an unvalidated choice */
export const FULL = 0.6;
/** safety factor on the all-hue chroma limit, so that 8-bit rounding stays inside sRGB: an unvalidated choice */
export const MARGIN = 0.97;

export function linearToOklab(rgb: RGB): [number, number, number] {
  const [r, g, b] = rgb.map((x) => Math.min(Math.max(x, 0), 1));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
export function oklabToLinear(L: number, a: number, b: number): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
export function oklchToLinear(L: number, C: number, hueDeg: number): [number, number, number] {
  const h = (hueDeg * Math.PI) / 180;
  return oklabToLinear(L, C * Math.cos(h), C * Math.sin(h));
}
/** inverse of the sRGB transfer function of web/src/demo/tokens.ts: c/12.92 below 0.04045, ((c + 0.055)/1.055)^2.4 above */
export const encode = (c: number): number => (c <= 0.04045 / 12.92 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
export const decode = (c: number): number => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
export const inGamut = (lin: RGB, eps = 0): boolean => lin.every((x) => x >= -eps && x <= 1 + eps);

/** the largest chroma that all hues (every whole degree) reach inside sRGB at lightness L, by bisection */
export function allHueChroma(L: number): number {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    let ok = true;
    for (let h = 0; h < 360 && ok; h++) ok = inGamut(oklchToLinear(L, mid, h));
    if (ok) lo = mid; else hi = mid;
  }
  return lo;
}

export interface PhaseMap {
  /** lightness and chroma at full strength, hue of phase 0 (degrees), OKLab of the ground */
  readonly L: number; readonly C: number; readonly hue0: number; readonly ground: readonly [number, number, number];
  /** linear-light components before clamping (for the gamut test) */
  raw(phase: number, s?: number): [number, number, number];
  /** sRGB components in 0..1 of the colour for a phase (radians) at strength s in [0, 1] */
  srgb(phase: number, s?: number): [number, number, number];
  /** the same as 8-bit values */
  bytes(phase: number, s?: number): [number, number, number];
  /** CSS colour string of the same colour */
  css(phase: number, s?: number): string;
}

/** Build the map from the sRGB components (0..1) of the ground token and of the anchor token. */
export function makePhaseMap(groundSrgb: RGB, anchorSrgb: RGB): PhaseMap {
  const g = linearToOklab(groundSrgb.map(decode) as unknown as RGB);
  const a = linearToOklab(anchorSrgb.map(decode) as unknown as RGB);
  const L = g[0] + FULL * (a[0] - g[0]);
  const C = MARGIN * allHueChroma(L);
  const hue0 = (Math.atan2(a[2], a[1]) * 180) / Math.PI;
  const raw = (phase: number, s = 1): [number, number, number] => {
    const h = ((hue0 + (phase * 180) / Math.PI) * Math.PI) / 180;
    const t = Math.min(1, Math.max(0, s));
    return oklabToLinear(g[0] + t * (L - g[0]), g[1] + t * (C * Math.cos(h) - g[1]), g[2] + t * (C * Math.sin(h) - g[2]));
  };
  const srgb = (phase: number, s = 1) => raw(phase, s).map((x) => encode(Math.min(1, Math.max(0, x)))) as [number, number, number];
  const bytes = (phase: number, s = 1) => srgb(phase, s).map((x) => Math.round(255 * x)) as [number, number, number];
  const css = (phase: number, s = 1) => '#' + bytes(phase, s).map((v) => v.toString(16).padStart(2, '0')).join('');
  return { L, C, hue0, ground: g, raw, srgb, bytes, css };
}
