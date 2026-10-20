// Plot helpers of the c03 demos (2D, SVG on the plate): scales, ticks, labels with a halo,
// pools of persistent elements (so that eased transitions can act on them), and the clock of
// the "press play and watch the partial sums grow" demos. No mathematics here.
import type { DemoContext } from '../../demo/types';
import { place, setAttrs, svgEl } from './common';

export type ScaleKind = 'lin' | 'log10' | 'log1p';
export interface Scale { (v: number): number; readonly kind: ScaleKind; readonly p0: number; readonly p1: number }
/** maps v in [v0, v1] to px in [p0, p1]: linear, in log10 v, or in sign(v) log10(1 + |v|) */
export function scale(kind: ScaleKind, v0: number, v1: number, p0: number, p1: number): Scale {
  const t = (v: number) => (kind === 'lin' ? v : kind === 'log10' ? Math.log10(v) : Math.sign(v) * Math.log10(1 + Math.abs(v)));
  const t0 = t(v0), t1 = t(v1);
  const f = ((v: number) => p0 + ((t(v) - t0) / (t1 - t0)) * (p1 - p0)) as Scale;
  return Object.assign(f, { kind, p0, p1 });
}

export const pathD = (pts: ReadonlyArray<readonly [number, number]>): string =>
  pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');

export interface TextOpts { anchor?: 'start' | 'middle' | 'end'; fill?: string; size?: number; weight?: string; halo?: boolean; italic?: boolean }
/** an SVG text in the label face, with a halo of the plate colour behind it */
export function label(ctx: DemoContext, parent: Element, x: number, y: number, s: string, fs: number, o: TextOpts = {}): SVGTextElement {
  const t = svgEl('text', {
    x, y, 'text-anchor': o.anchor ?? 'start', fill: o.fill ?? ctx.tokens.color('plate-ink'), 'font-size': (o.size ?? 1) * fs, 'font-weight': o.weight ?? '400',
  }, parent);
  if (o.halo !== false) setAttrs(t, { stroke: ctx.tokens.color('plate'), 'stroke-width': 0.28 * fs, 'stroke-linejoin': 'round', 'paint-order': 'stroke' });
  t.style.fontFamily = 'var(--tpc-family-label)';
  if (o.italic) t.style.fontStyle = 'italic';
  t.textContent = s;
  return t;
}

/** spread label positions (sorted by y) so that neighbours are at least `gap` apart, inside [lo, hi] */
export function spread(ys: number[], gap: number, lo: number, hi: number): number[] {
  const idx = ys.map((y, i) => [y, i] as const).sort((a, b) => a[0] - b[0]);
  const out = idx.map(([y]) => Math.max(lo, Math.min(hi, y)));
  for (let k = 1; k < out.length; k++) out[k] = Math.max(out[k], out[k - 1] + gap);
  for (let k = out.length - 1; k >= 0; k--) {
    if (out[k] > hi) out[k] = hi;
    if (k < out.length - 1 && out[k] > out[k + 1] - gap) out[k] = out[k + 1] - gap;
  }
  const res = new Array<number>(ys.length);
  idx.forEach(([, i], k) => { res[i] = out[k]; });
  return res;
}

/** a pool of persistent elements of one kind; get(i) creates on demand, hideFrom(n) hides the rest */
export function pool<K extends keyof SVGElementTagNameMap>(parent: Element, name: K, cls = 'c03-move'): { get(i: number): SVGElementTagNameMap[K]; hideFrom(n: number): void } {
  const items: SVGElementTagNameMap[K][] = [];
  return {
    get(i) {
      while (items.length <= i) items.push(svgEl(name, { class: cls }, parent));
      items[i].style.display = '';
      return items[i];
    },
    hideFrom(n) { for (let i = n; i < items.length; i++) items[i].style.display = 'none'; },
  };
}
/** a bar from (x - w/2, y0) up to height h (px, h > 0 upwards), placed by a transform of a unit square */
export function setBar(r: SVGRectElement, x: number, y0: number, w: number, h: number): void {
  setAttrs(r, { x: -0.5, y: -1, width: 1, height: 1, 'vector-effect': 'non-scaling-stroke' });
  place(r, `translate(${x.toFixed(2)}px, ${y0.toFixed(2)}px) scale(${Math.max(0.0001, w).toFixed(3)}, ${Math.max(0.0001, h).toFixed(3)})`);
}
/** a path whose d is also set as a CSS property, so that it eases where the browser supports it */
export function setPath(p: SVGPathElement, d: string): void {
  p.setAttribute('d', d);
  (p.style as CSSStyleDeclaration & { d?: string }).d = `path("${d}")`;
}

/**
 * The clock of a growth animation: the phase runs through [0, 1) with the play clock, the first
 * fraction GROW of a cycle is the growth u: 0 -> 1, the rest holds u = 1. The slider sets u.
 */
export function growthClock(periodSeconds: number, grow: number, initialU: number) {
  let offset = initialU >= 1 ? 0.999 : initialU * grow;
  let now = 0;
  const phase = (time: number) => { const p = time / periodSeconds + offset; return p - Math.floor(p); };
  return {
    u(time: number) { now = time; return Math.min(1, phase(time) / grow); },
    setU(u: number) { offset = (u >= 1 ? 0.999 : u * grow) - now / periodSeconds; },
    setPeriod(p: number) { const ph = phase(now); periodSeconds = p; offset = ph - now / p; },
  };
}
