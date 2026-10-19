// The cyclic phase map of the hydrogen views (web/src/demos/c11/oklch.ts), built from the
// design tokens of every package and ground: conversion against the token compiler's own
// values, periodicity, gamut, and the MEASURED lightness variation and step uniformity
// after rounding to 8 bits. The thresholds are unvalidated choices; the measured values are
// printed. No claim is made beyond "uniform in OKLab": no viewing study backs the map.
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { allHueChroma, decode, linearToOklab, makePhaseMap, oklchToLinear, type RGB } from '../../src/demos/c11/oklch';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const builds = fs.readdirSync(path.join(REPO, 'design/build')).filter((d) => /^pkg\d-(light|dark)$/.test(d)).sort();
type Tok = { hex: string; oklch: [number, number, number]; linear: [number, number, number] };
const load = (b: string) => (JSON.parse(fs.readFileSync(path.join(REPO, 'design/build', b, 'tokens.json'), 'utf8')) as { color: Record<string, Tok> }).color;
const hexRgb = (h: string): RGB => [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16) / 255) as unknown as RGB;
const lab8 = (b: readonly number[]) => linearToOklab(b.map((v) => decode(v / 255)) as unknown as RGB);

const L_VARIATION_MAX = 0.01;    // unvalidated choice
const STEP_RATIO_MAX = 1.25;     // unvalidated choice; the measured ratios (1.10 to 1.18) are the 8-bit rounding of steps of about 0.025

describe('OKLab conversion against the token compiler (design/build/*/tokens.json)', () => {
  it('reproduces the tokens: linear values, and OKLCH within the rounding of a hex colour', () => {
    let worst = 0;
    for (const b of builds) for (const [name, t] of Object.entries(load(b))) {
      const lin = hexRgb(t.hex).map(decode);
      lin.forEach((v, i) => expect(Math.abs(v - t.linear[i]), `${b} ${name} linear`).toBeLessThan(1e-5));
      const [L, C, h] = t.oklch;
      const back = linearToOklab(oklchToLinear(L, C, h).map((x) => Math.min(1, Math.max(0, x))) as unknown as RGB);
      const mine = linearToOklab(lin as unknown as RGB);
      const d = Math.hypot(mine[0] - back[0], mine[1] - back[1], mine[2] - back[2]);
      worst = Math.max(worst, d);
    }
    console.log(`phase map: largest OKLab distance between a token's hex and its recorded OKLCH: ${worst.toExponential(2)} (8-bit rounding of the hex)`);
    expect(worst).toBeLessThan(0.006);   // unvalidated choice above the rounding of one 8-bit step
  });
});

describe('cyclic phase map from tokens', () => {
  for (const b of builds) for (const [ground, anchor] of [['plate', 'state'], ['stage', 'stage-state']] as const) {
    it(`${b}, ${ground} / ${anchor}`, () => {
      const c = load(b);
      const map = makePhaseMap(hexRgb(c[ground].hex), hexRgb(c[anchor].hex));
      // |psi| = 0 is the ground colour, exactly
      expect(map.bytes(1.234, 0)).toEqual(hexRgb(c[ground].hex).map((v) => Math.round(255 * v)));
      // periodic
      for (const p of [0, 0.7, 2.1, -3]) expect(map.bytes(p)).toEqual(map.bytes(p + 2 * Math.PI));
      // inside sRGB before clamping, for every strength and hue
      let minC = 1, maxC = 0;
      for (let s = 0; s <= 1.0001; s += 0.05) for (let d = 0; d < 360; d += 2) {
        const lin = map.raw((d * Math.PI) / 180, s);
        minC = Math.min(minC, ...lin); maxC = Math.max(maxC, ...lin);
      }
      // 1e-6: the published OKLab matrices are rounded to ten digits, so white maps to 1 + 7e-8
      expect(minC).toBeGreaterThanOrEqual(-1e-6);
      expect(maxC).toBeLessThanOrEqual(1 + 1e-6);
      // lightness of full strength over the cycle, after 8-bit rounding
      let lo = 1, hi = 0;
      for (let d = 0; d < 360; d++) { const L = lab8(map.bytes((d * Math.PI) / 180))[0]; lo = Math.min(lo, L); hi = Math.max(hi, L); }
      // OKLab distance of 24 equal phase steps of 15 degrees
      const steps: number[] = [];
      for (let k = 0; k < 24; k++) {
        const p = lab8(map.bytes((k * Math.PI) / 12)), q = lab8(map.bytes(((k + 1) * Math.PI) / 12));
        steps.push(Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]));
      }
      const ratio = Math.max(...steps) / Math.min(...steps);
      const contrast = Math.abs(map.L - map.ground[0]);
      console.log(`phase map ${b} ${ground}/${anchor}: L = ${map.L.toFixed(4)}, C = ${map.C.toFixed(4)} (all-hue limit ${allHueChroma(map.L).toFixed(4)}), hue of phase 0 = ${map.hue0.toFixed(1)} deg; `
        + `lightness over the cycle ${lo.toFixed(4)}..${hi.toFixed(4)} (variation ${(hi - lo).toExponential(2)}); 15-degree steps ${Math.min(...steps).toFixed(5)}..${Math.max(...steps).toFixed(5)} (ratio ${ratio.toFixed(3)}); `
        + `lightness distance to the ground ${contrast.toFixed(3)}; opposite phases differ by ${(2 * map.C).toFixed(3)} in OKLab`);
      expect(hi - lo).toBeLessThan(L_VARIATION_MAX);
      expect(ratio).toBeLessThan(STEP_RATIO_MAX);
      expect(contrast).toBeGreaterThan(0.3);   // unvalidated choice: full strength must stand off the ground
    });
  }
});
