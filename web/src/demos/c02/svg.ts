// Small SVG helpers for the C2 demos (strings in, elements out). No physics.
export const NS = 'http://www.w3.org/2000/svg';
export function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number> = {}): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}
export const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const f = (x: number): string => (Math.round(x * 100) / 100).toString();

/** A label part: plain text, a mathematical letter (italic, maths face) or a subscript. */
export type Part = string | { m: string } | { sub: string };
export const m = (t: string): Part => ({ m: t });
export const sub = (t: string): Part => ({ sub: t });

export function text(x: number, y: number, parts: Part[] | string, opts: { anchor?: 'start' | 'middle' | 'end'; cls?: string } = {}): string {
  const ps = typeof parts === 'string' ? [parts] : parts;
  let out = '', lowered = false;
  for (const p of ps) {
    const isSub = typeof p !== 'string' && 'sub' in p;
    const dy = isSub && !lowered ? ' dy="0.28em"' : !isSub && lowered ? ' dy="-0.28em"' : '';
    lowered = isSub;
    if (typeof p === 'string') out += `<tspan${dy}>${esc(p)}</tspan>`;
    else if ('m' in p) out += `<tspan class="m"${dy}>${esc(p.m)}</tspan>`;
    else out += `<tspan font-size="78%"${dy}>${esc(p.sub)}</tspan>`;
  }
  return `<text x="${f(x)}" y="${f(y)}" text-anchor="${opts.anchor ?? 'start'}"${opts.cls ? ` class="${opts.cls}"` : ''} xml:space="preserve">${out}</text>`;
}
export const line = (x1: number, y1: number, x2: number, y2: number, cls: string): string =>
  `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="${cls}"/>`;
export const circle = (x: number, y: number, r: number, cls: string, extra = ''): string => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" class="${cls}"${extra}/>`;
export const poly = (pts: Array<[number, number]>, cls: string, closed = true): string =>
  `<${closed ? 'polygon' : 'polyline'} points="${pts.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}" class="${cls}"/>`;
/** a square standing on a corner: the marker of an effect (states are circles) */
export const diamond = (x: number, y: number, r: number, cls: string): string => poly([[x, y - r], [x + r, y], [x, y + r], [x - r, y]], cls);

/** Five-pointed star from its formula: vertices at angles -90 + 36 k degrees, radii R and R sin 18 / sin 54 alternately. */
export function starPath(R: number): string {
  const r = (R * Math.sin(Math.PI / 10)) / Math.sin((3 * Math.PI) / 10);
  let d = '';
  for (let k = 0; k < 10; k++) {
    const t = -Math.PI / 2 + (k * Math.PI) / 5, q = k % 2 ? r : R;
    d += `${k ? 'L' : 'M'}${f(q * Math.cos(t))} ${f(q * Math.sin(t))}`;
  }
  return `${d}Z`;
}
export function starsHtml(n: number, of = 3): string {
  let s = '';
  for (let i = 0; i < of; i++) s += `<svg viewBox="-11 -11 22 22" aria-hidden="true"><path d="${starPath(10)}" class="${i < n ? 'on' : 'off'}"/></svg>`;
  return `<span class="c02-stars">${s}</span>`;
}

/** The part of the line {p + t d} inside the rectangle [x0,x1] x [y0,y1], or null. */
export function clipLine(p: [number, number], d: [number, number], x0: number, x1: number, y0: number, y1: number): [[number, number], [number, number]] | null {
  let t0 = -Infinity, t1 = Infinity;
  const slab = (pp: number, dd: number, lo: number, hi: number): boolean => {
    if (Math.abs(dd) < 1e-12) return pp >= lo && pp <= hi;
    const a = (lo - pp) / dd, b = (hi - pp) / dd;
    t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
    return true;
  };
  if (!slab(p[0], d[0], x0, x1) || !slab(p[1], d[1], y0, y1) || t0 >= t1) return null;
  return [[p[0] + t0 * d[0], p[1] + t0 * d[1]], [p[0] + t1 * d[0], p[1] + t1 * d[1]]];
}
