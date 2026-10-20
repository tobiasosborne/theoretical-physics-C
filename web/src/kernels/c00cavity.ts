// Kernel of the demo c00.demo.hohlraum: a ray in a box with a small hole, reflected at the
// walls, and the fraction r^n of its energy left after n reflections (chapter c00, figure
// c00.fig.hohlraum, equation c00.eq.reflexion). Pure functions: no DOM, no clock.
// Reference implementation and golden values: numerics/src/c00_reference.jl via
// numerics/generate/c00_golden.jl -> web/tests/golden/c00cavity.json (exact rationals and a
// sorted merge of all wall crossings; this file walks the crossings one by one in doubles).
//
// Geometry (the header of content/c00-theorie/figures/hohlraum.tex). The box is
// [0, width] x [0, height] (cm), the hole is the part holeLo < y < holeHi of the left wall.
// The ray enters through (0, entryY) with direction (1, slope). Specular reflection: at a
// horizontal wall the y-component of the direction changes sign, at a vertical wall the
// x-component. In the unfolded plane the ray is the straight line (t, entryY + slope t),
// t >= 0; it meets a vertical wall at t = width m and a horizontal wall where
// entryY + slope t = height j. Folding maps the line back into the box.
// Corner. When both walls are met at the same t (within CORNER_EPS cm) the ray meets a
// corner; for a right-angle corner the rays passing just beside it on either side continue
// the same way, reversed in both components, and the corner counts as two contacts.
// Exit. A left-wall impact strictly inside the hole ends the path; it is listed with 0
// contacts. The fraction of the entering energy left after n contacts is r^n.

export interface CavityGeometry { width: number; height: number; holeLo: number; holeHi: number; entryY: number; slope: number }
export interface CavityPath {
  /** entry point, then every impact; the last point is the exit when exited */
  points: Array<[number, number]>;
  /** wall contacts at each point: 0 at the entry and the exit, 1 at a wall, 2 at a corner */
  contacts: number[];
  /** path length from the entry point, cm */
  lengths: number[];
  /** the ray found the hole again */
  exited: boolean;
  /** total number of reflections (sum of contacts) */
  reflections: number;
}

/** the geometry of figure c00.fig.hohlraum */
export const FIGURE_GEOMETRY: CavityGeometry = { width: 4, height: 2.4, holeLo: 1.1, holeHi: 1.3, entryY: 1.2, slope: 0.62 };
/** two crossings closer than this (cm, in the unfolded parameter t) are one corner hit */
export const CORNER_EPS = 1e-9;

function check(g: CavityGeometry): void {
  const ok = g.width > 0 && g.height > 0 && g.holeLo >= 0 && g.holeLo < g.holeHi && g.holeHi <= g.height
    && g.entryY > g.holeLo && g.entryY < g.holeHi && Number.isFinite(g.slope);
  if (!ok) throw new Error('c00cavity: the geometry is not a box with a hole in its left wall and the entry in the hole');
}

/** walk the ray until it leaves through the hole or the contacts reach maxReflections */
export function cavityPath(g: CavityGeometry, maxReflections: number): CavityPath {
  check(g);
  if (!(Number.isInteger(maxReflections) && maxReflections >= 1)) throw new Error('c00cavity: maxReflections must be a positive integer');
  const { width: a, height: b, holeLo, holeHi, entryY: y0, slope: s } = g;
  const speed = Math.hypot(1, s);
  const points: Array<[number, number]> = [[0, y0]];
  const contacts = [0];
  const lengths = [0];
  const fold = (v: number, w: number) => { const r = ((v % (2 * w)) + 2 * w) % (2 * w); return r > w ? 2 * w - r : r; };
  let m = 1;                                   // next vertical wall: t = a m
  const dir = s > 0 ? 1 : -1;
  let j = s > 0 ? Math.floor(y0 / b) + 1 : Math.ceil(y0 / b) - 1; // next horizontal wall: y = b j
  const tH = () => (s === 0 ? Infinity : (b * j - y0) / s);
  let total = 0;
  let exited = false;
  while (total < maxReflections) {
    const tv = a * m, th = tH();
    let t: number, x: number, y: number, k: number;
    if (Math.abs(tv - th) <= CORNER_EPS) {
      t = tv; x = m % 2 === 1 ? a : 0; y = ((j % 2) + 2) % 2 === 1 ? b : 0; k = 2; m += 1; j += dir;
    } else if (tv < th) {
      t = tv; x = m % 2 === 1 ? a : 0; y = fold(y0 + s * t, b); k = 1; m += 1;
    } else {
      t = th; x = fold(t, a); y = ((j % 2) + 2) % 2 === 1 ? b : 0; k = 1; j += dir;
    }
    if (k === 1 && x === 0 && y > holeLo && y < holeHi) {
      points.push([x, y]); contacts.push(0); lengths.push(t * speed); exited = true; break;
    }
    total += k;
    points.push([x, y]); contacts.push(k); lengths.push(t * speed);
  }
  return { points, contacts, lengths, exited, reflections: total };
}

/** the point at path length L along the path (clamped to its ends), and the contacts before it */
export function pointAt(p: CavityPath, L: number): { x: number; y: number; segment: number; reflections: number } {
  const n = p.points.length;
  if (L <= 0) return { x: p.points[0][0], y: p.points[0][1], segment: 0, reflections: 0 };
  let i = 1;
  while (i < n - 1 && p.lengths[i] < L) i++;
  const L0 = p.lengths[i - 1], L1 = p.lengths[i];
  const f = L1 > L0 ? Math.min(1, Math.max(0, (L - L0) / (L1 - L0))) : 1;
  const [x0, y0] = p.points[i - 1], [x1, y1] = p.points[i];
  let before = 0;
  for (let q = 0; q < i; q++) before += p.contacts[q];
  return { x: x0 + f * (x1 - x0), y: y0 + f * (y1 - y0), segment: i - 1, reflections: f >= 1 ? before + p.contacts[i] : before };
}

/** the point at distance d before the entry point (0, entryY), on the incoming ray */
export function incomingPoint(g: CavityGeometry, d: number): [number, number] {
  const u = d / Math.hypot(1, g.slope);
  return [-u, g.entryY - g.slope * u];
}
/** the point at distance d beyond the exit point, on the outgoing ray (direction of the last segment) */
export function outgoingPoint(p: CavityPath, d: number): [number, number] {
  const n = p.points.length;
  const [x0, y0] = p.points[n - 2], [x1, y1] = p.points[n - 1];
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  return [x1 + (d * (x1 - x0)) / len, y1 + (d * (y1 - y0)) / len];
}

/** r^n, the fraction of the entering energy left after n reflections (c00.eq.reflexion), 0 <= r < 1 */
export function remaining(r: number, n: number): number {
  if (!(r >= 0 && r < 1)) throw new Error('c00cavity: r must lie in [0, 1)');
  if (!(Number.isInteger(n) && n >= 0)) throw new Error('c00cavity: n must be a non-negative integer');
  return r ** n;
}
