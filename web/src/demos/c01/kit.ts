// Shared drawing kit of the c01 demos (2D, SVG on the plate). No physics here: every number a
// demo shows comes from web/src/kernels/prob.ts; this file only draws, formats and handles the
// pointer.
//
// Retained drawing. A demo paints by key: plate.rect('bar-3', ...) returns the same element
// on every paint, and elements a paint does not touch are removed at plate.end(). Geometry is
// set both as an attribute and as the CSS geometry property (x, y, width, height, cx, cy, r,
// d, transform), so that, where the browser supports it, a CSS transition eases a state
// change instead of jumping. Easing is on only when plate.begin(true) is called: the demos
// pass false in deterministic mode, with reduced motion, while a pointer drags, and while the
// clock runs (then every frame is drawn anyway). render() therefore stays a function of its
// arguments, the demo state and the tokens; the transition is the browser's presentation of
// the change between two such pictures.
import type { DemoContext } from '../../demo/types';
import { toNumber, type Fraction } from '../../kernels/prob';

const NS = 'http://www.w3.org/2000/svg';
export const EASE_MS = 420;   // duration of an eased change: a presentation choice

export function ensureStyle(): void {
  if (document.querySelector('style[data-tpcd-c01]')) return;
  const st = document.createElement('style');
  st.dataset.tpcdC01 = '';
  st.textContent = `
.c01-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; user-select: none; -webkit-user-select: none; }
.c01-svg text { font-family: var(--tpc-family-label); white-space: pre; }
.c01-svg text.c01-m, .c01-svg tspan.c01-m { font-family: var(--tpc-font-math); }
.c01-svg .c01-hit { cursor: pointer; }
.c01-svg .c01-grab { cursor: grab; }
.c01-svg.c01-dragging, .c01-svg.c01-dragging * { cursor: grabbing; }
.c01-ease .c01-e { transition-property: x, y, width, height, cx, cy, r, d, transform, opacity, fill-opacity;
  transition-duration: ${EASE_MS}ms; transition-timing-function: cubic-bezier(0.22, 0.8, 0.24, 1); }
.tpcd .c01-pressed { border-color: var(--tpc-ink); border-width: var(--tpc-stroke-box); font-weight: 600; }
.c01-layer { position: absolute; inset: 0; pointer-events: none; font-family: var(--tpc-family-label); line-height: 1.2; color: var(--tpc-stage-ink); }
.c01-layer math { font-family: var(--tpc-font-math); font-size: 1.1em; }
.c01-tag { position: absolute; white-space: nowrap; transform: translate(-50%, -50%); }
.c01-tag.c01-muted { opacity: 0.75; }
.c01-tag.c01-strong { font-weight: 600; }
.c01-head { position: absolute; left: 0.7em; top: 0.5em; right: 0.7em; }
.c01-note { flex: 1 1 100%; margin: 0; color: var(--tpc-ink); max-width: 46rem; }
.c01-note math { font-family: var(--tpc-font-math); }
`;
  document.head.append(st);
}

type Attrs = Record<string, string | number>;
export type Layer = 'back' | 'grid' | 'data' | 'marks' | 'labels' | 'handles' | 'hover';
const LAYERS: Layer[] = ['back', 'grid', 'data', 'marks', 'labels', 'handles', 'hover'];

export interface TextOpts { anchor?: 'start' | 'middle' | 'end'; fill?: string; size?: number; math?: boolean; weight?: string; layer?: Layer; italic?: boolean; baseline?: 'middle' | 'auto' }

export class Plate {
  readonly svg: SVGSVGElement;
  readonly defs: SVGDefsElement;
  readonly hatch: string;
  W = 640; H = 360; fs = 13;
  private readonly layers = new Map<Layer, SVGGElement>();
  private readonly nodes = new Map<string, Element>();
  private touched: Map<Layer, string[]> = new Map();

  constructor(private readonly stage: HTMLElement, private readonly ctx: DemoContext) {
    ensureStyle();
    this.svg = document.createElementNS(NS, 'svg');
    this.svg.setAttribute('class', 'c01-svg');
    this.svg.setAttribute('aria-hidden', 'true');
    this.defs = document.createElementNS(NS, 'defs');
    this.svg.append(this.defs);
    for (const l of LAYERS) { const g = document.createElementNS(NS, 'g'); this.layers.set(l, g); this.svg.append(g); }
    stage.append(this.svg);
    this.hatch = `c01-hatch-${ctx.id.replace(/\W/g, '-')}-${Math.floor(ctx.random() * 1e9)}`;
  }

  /** start a paint; returns the label font size */
  begin(ease: boolean): number {
    const k = this.ctx.tokens;
    const box = this.stage.getBoundingClientRect();
    this.W = Math.max(200, box.width); this.H = Math.max(140, box.height);
    this.fs = Math.max(10, Math.min(k.font('label').sizePx, this.W / 36));
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`);
    this.svg.classList.toggle('c01-ease', ease);
    this.touched = new Map(LAYERS.map((l) => [l, []]));
    // hatch pattern in the bath-edge role, as tpc bath hatch of the print figures
    this.defs.replaceChildren();
    const pat = document.createElementNS(NS, 'pattern');
    for (const [a, v] of Object.entries({ id: this.hatch, width: 5, height: 5, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' })) pat.setAttribute(a, String(v));
    const ln = document.createElementNS(NS, 'line');
    for (const [a, v] of Object.entries({ x1: 0, y1: 0, x2: 0, y2: 5, stroke: k.color('bath-edge'), 'stroke-width': Math.max(0.8, k.stroke('thin') * 1.3) })) ln.setAttribute(a, String(v));
    pat.append(ln);
    this.defs.append(pat);
    this.rect('plate-bg', 0, 0, this.W, this.H, { fill: k.color('plate') }, 'back', false);
    return this.fs;
  }

  /** remove what this paint did not draw and keep the drawing order of the paint */
  end(): void {
    for (const l of LAYERS) {
      const g = this.layers.get(l)!;
      const want = [...new Set(this.touched.get(l)!)];
      const keep = new Set(want);
      for (const c of [...g.children]) {
        const key = (c as SVGElement).dataset.k!;
        if (!keep.has(key)) { c.remove(); this.nodes.delete(key); }
      }
      const kids = [...g.children].map((c) => (c as SVGElement).dataset.k);
      if (kids.length !== want.length || kids.some((k, i) => k !== want[i])) for (const key of want) g.append(this.nodes.get(key)!);
    }
  }

  get hatchFill(): string { return `url(#${this.hatch})`; }

  node<K extends keyof SVGElementTagNameMap>(key: string, tag: K, layer: Layer = 'data', ease = true): SVGElementTagNameMap[K] {
    let e = this.nodes.get(key) as SVGElementTagNameMap[K] | undefined;
    if (!e || e.tagName !== tag) {
      e?.remove();
      e = document.createElementNS(NS, tag);
      e.dataset.k = key;
      this.nodes.set(key, e);
      this.layers.get(layer)!.append(e);
    } else if (e.parentNode !== this.layers.get(layer)) {
      this.layers.get(layer)!.append(e);
    }
    e.classList.toggle('c01-e', ease);
    this.touched.get(layer)!.push(key);
    return e;
  }

  private set(e: Element, attrs: Attrs): void {
    for (const [a, v] of Object.entries(attrs)) {
      if (a === 'class') for (const c of String(v).split(/\s+/)) { if (c) e.classList.add(c); }
      else e.setAttribute(a, String(v));
    }
  }

  rect(key: string, x: number, y: number, w: number, h: number, attrs: Attrs = {}, layer: Layer = 'data', ease = true): SVGRectElement {
    const e = this.node(key, 'rect', layer, ease);
    const ww = Math.max(0, w), hh = Math.max(0, h);
    this.set(e, { x, y, width: ww, height: hh, ...attrs });
    e.style.setProperty('x', `${x}px`); e.style.setProperty('y', `${y}px`);
    e.style.setProperty('width', `${ww}px`); e.style.setProperty('height', `${hh}px`);
    return e;
  }

  circle(key: string, cx: number, cy: number, r: number, attrs: Attrs = {}, layer: Layer = 'marks', ease = true): SVGCircleElement {
    const e = this.node(key, 'circle', layer, ease);
    this.set(e, { cx, cy, r, ...attrs });
    e.style.setProperty('cx', `${cx}px`); e.style.setProperty('cy', `${cy}px`); e.style.setProperty('r', `${r}px`);
    return e;
  }

  /** a path from points; `closed` adds Z. Keep the number of points fixed for a smooth change. */
  path(key: string, pts: Array<[number, number]>, attrs: Attrs = {}, layer: Layer = 'data', closed = false, ease = true): SVGPathElement {
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ') + (closed ? ' Z' : '');
    return this.pathD(key, d, attrs, layer, ease);
  }

  pathD(key: string, d: string, attrs: Attrs = {}, layer: Layer = 'data', ease = true): SVGPathElement {
    const e = this.node(key, 'path', layer, ease);
    this.set(e, { d, fill: 'none', ...attrs });
    e.style.setProperty('d', `path("${d}")`);
    return e;
  }

  line(key: string, x1: number, y1: number, x2: number, y2: number, stroke: string, width: number, attrs: Attrs = {}, layer: Layer = 'grid', ease = true): SVGPathElement {
    return this.path(key, [[x1, y1], [x2, y2]], { stroke, 'stroke-width': width, ...attrs }, layer, false, ease);
  }

  text(key: string, x: number, y: number, s: string, o: TextOpts = {}): SVGTextElement {
    const k = this.ctx.tokens;
    const e = this.node(key, 'text', o.layer ?? 'labels');
    this.set(e, {
      x: 0, y: 0, 'text-anchor': o.anchor ?? 'middle', fill: o.fill ?? k.color('plate-ink'), 'font-size': o.size ?? this.fs,
      'font-weight': o.weight ?? 'normal', 'font-style': o.italic ? 'italic' : 'normal', 'dominant-baseline': o.baseline === 'middle' ? 'central' : 'auto',
    });
    e.classList.toggle('c01-m', !!o.math);
    e.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    if (e.textContent !== s) e.textContent = s;
    return e;
  }

  /**
   * A fraction as a small stacked label (numerator, bar, denominator) centred at (x, y); an
   * integer as plain text. `prefix` (e.g. "= ") is set before it, `suffix` after it.
   */
  fraction(key: string, x: number, y: number, q: Fraction, o: TextOpts & { prefix?: string; suffix?: string } = {}): number {
    const k = this.ctx.tokens;
    const size = o.size ?? this.fs;
    const fill = o.fill ?? k.color('plate-ink');
    const g = this.node(key, 'g', o.layer ?? 'labels');
    g.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    const neg = q.num < 0n;
    const n = (neg ? -q.num : q.num).toString(), d = q.den.toString();
    const s2 = size * 0.86;
    const pre = (o.prefix ?? '') + (neg ? '−' : '');
    const preW = pre ? this.measure(pre, size, o.weight) + 0.12 * size : 0;
    const sufW = o.suffix ? this.measure(o.suffix, size, o.weight) + 0.12 * size : 0;
    const fw = q.den === 1n ? this.measure(n, size, o.weight) : Math.max(this.measure(n, s2, o.weight), this.measure(d, s2, o.weight)) + 0.3 * size;
    const parts: string[] = [];
    const w = preW + fw + sufW;
    const anchor = o.anchor ?? 'middle';
    const x0 = anchor === 'middle' ? -w / 2 : anchor === 'end' ? -w : 0;
    const t = (tx: number, ty: number, s: string, sz: number, an = 'start') =>
      `<text x="${tx.toFixed(2)}" y="${ty.toFixed(2)}" font-size="${sz.toFixed(2)}" fill="${fill}" text-anchor="${an}" dominant-baseline="central"${o.weight ? ` font-weight="${o.weight}"` : ''}>${esc(s)}</text>`;
    if (pre) parts.push(t(x0, 0, pre, size));
    if (q.den === 1n) {
      parts.push(t(x0 + preW, 0, n, size));
    } else {
      const cx = x0 + preW + fw / 2;
      parts.push(t(cx, -0.5 * s2, n, s2, 'middle'), t(cx, 0.58 * s2, d, s2, 'middle'));
      parts.push(`<line x1="${(cx - fw / 2 + 0.06 * size).toFixed(2)}" x2="${(cx + fw / 2 - 0.06 * size).toFixed(2)}" y1="0" y2="0" stroke="${fill}" stroke-width="${Math.max(0.7, size / 16).toFixed(2)}"/>`);
    }
    if (o.suffix) parts.push(t(x0 + w - sufW, 0, o.suffix, size));
    const html = parts.join('');
    if ((g as SVGGElement).dataset.h !== html) { g.innerHTML = html; (g as SVGGElement).dataset.h = html; }
    return w;
  }

  /**
   * A label of words and maths pieces in a row, e.g. [['outcome ', false], ['x', true]]; maths
   * pieces are set in the maths face with it(). Returns the width.
   */
  mixed(key: string, x: number, y: number, parts: Array<[string, boolean]>, o: TextOpts = {}): number {
    const size = o.size ?? this.fs;
    const ws = parts.map(([t, m]) => this.measure(m ? it(t) : t, size, o.weight, m));
    const w = ws.reduce((p, q) => p + q, 0);
    const anchor = o.anchor ?? 'middle';
    let cx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    parts.forEach(([t, m], i) => { this.text(`${key}-${i}`, cx, y, m ? it(t) : t, { ...o, anchor: 'start', math: m }); cx += ws[i]; });
    return w;
  }

  private meter: SVGTextElement | null = null;
  /** the advance width of `s` in the label face (or the maths face) at `size`, measured; a guess if not laid out */
  measure(s: string, size: number, weight?: string, math = false): number {
    if (!this.meter) {
      this.meter = document.createElementNS(NS, 'text');
      this.meter.setAttribute('visibility', 'hidden');
      this.svg.append(this.meter);
    }
    const m = this.meter;
    m.setAttribute('font-size', String(size));
    m.setAttribute('font-weight', weight ?? 'normal');
    m.classList.toggle('c01-m', math);
    m.textContent = s;
    const w = m.getComputedTextLength();
    return w > 0 ? w : [...s].length * 0.55 * size;
  }

  /** a hover readout: a small box with lines of text near (x, y), kept inside the plate */
  tip(x: number, y: number, lines: string[]): void {
    const k = this.ctx.tokens;
    const fs = this.fs * 0.95;
    const w = Math.max(...lines.map((s) => this.measure(s, fs))) + 1.0 * fs;
    const h = lines.length * fs * 1.3 + 0.6 * fs;
    let bx = x + 0.9 * fs, by = y - h - 0.6 * fs;
    if (bx + w > this.W - 4) bx = x - w - 0.9 * fs;
    if (by < 4) by = y + 0.9 * fs;
    bx = Math.max(4, bx);
    this.rect('tip-box', bx, by, w, h, { fill: k.color('plate'), stroke: k.color('plate-muted'), 'stroke-width': k.stroke('thin'), rx: 3 }, 'hover', false);
    lines.forEach((s, i) => {
      const e = this.text(`tip-${i}`, bx + 0.5 * fs, by + 0.3 * fs + (i + 0.78) * fs * 1.3, s, { anchor: 'start', size: fs, layer: 'hover' });
      e.classList.remove('c01-e');
    });
  }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ── formats ─────────────────────────────────────────────────────────────────────────────

/**
 * Latin and Greek letters of `s` as Unicode mathematical italic (U+1D434 ff., U+1D6FC ff.; h is
 * U+210E), for symbols in SVG text set in the maths face (class c01-m): "λq" -> "𝜆𝑞".
 */
export function it(s: string): string {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (ch === 'h') out += 'ℎ';
    else if (c >= 0x61 && c <= 0x7a) out += String.fromCodePoint(0x1d44e + c - 0x61);
    else if (c >= 0x41 && c <= 0x5a) out += String.fromCodePoint(0x1d434 + c - 0x41);
    else if (c >= 0x3b1 && c <= 0x3c9) out += String.fromCodePoint(0x1d6fc + c - 0x3b1);
    else out += ch;
  }
  return out;
}

/** "7/12", "−1/4", "3" */
export function fq(q: Fraction): string {
  const neg = q.num < 0n;
  const n = neg ? -q.num : q.num;
  return `${neg ? '−' : ''}${n}${q.den === 1n ? '' : `/${q.den}`}`;
}
/** a decimal in the page language, with `digits` places, minus as U+2212 */
export function fdec(ctx: DemoContext, x: number, digits = 3): string {
  return x.toLocaleString(ctx.lang, { minimumFractionDigits: digits, maximumFractionDigits: digits }).replace('-', '−');
}
/** "7/12 ≈ 0,583" or "3" */
export function fboth(ctx: DemoContext, q: Fraction, digits = 3): string {
  return q.den === 1n ? fq(q) : `${fq(q)} ≈ ${fdec(ctx, toNumber(q), digits)}`;
}
/** MathML of a fraction */
export function mq(q: Fraction): string {
  const neg = q.num < 0n;
  const n = neg ? -q.num : q.num;
  const body = q.den === 1n ? `<mn>${n}</mn>` : `<mfrac><mn>${n}</mn><mn>${q.den}</mn></mfrac>`;
  return `<math>${neg ? '<mo>−</mo>' : ''}${body}</math>`;
}
/** a registry symbol followed by "[...]" as MathML, e.g. E[f] */
export function bracket(sym: string, inner: string): string {
  const i = sym.replace(/^<math[^>]*>/, '').replace(/<\/math>$/, '');
  return `<math><mrow>${i}<mo>[</mo>${inner}<mo>]</mo></mrow></math>`;
}

// ── controls ────────────────────────────────────────────────────────────────────────────

/** a row of buttons of which one is chosen: aria-pressed, a filled dot and a heavier frame (not colour alone) */
export function choice(ctx: DemoContext, labels: string[], current: number, onPick: (i: number) => void): { set(i: number): void } {
  let cur = current;
  const bs = labels.map((l, i) => ctx.ui.button(l, () => { cur = i; mark(); onPick(i); }));
  const mark = () => bs.forEach((b, i) => {
    b.setAttribute('aria-pressed', i === cur ? 'true' : 'false');
    b.classList.toggle('c01-pressed', i === cur);
    b.textContent = `${i === cur ? '● ' : '○ '}${labels[i]}`;
  });
  mark();
  return { set: (i: number) => { cur = i; mark(); } };
}

/** a paragraph under the controls for a short explanation (HTML with MathML) */
export function note(ctx: DemoContext): HTMLParagraphElement {
  // DemoUI has no element for running text; a button gives the place in the controls and is
  // replaced by the paragraph (as captionBelow of the c11 demos does).
  const anchor = ctx.ui.button('', () => {});
  const p = document.createElement('p');
  p.className = 'c01-note';
  anchor.replaceWith(p);
  return p;
}

// ── pointer ─────────────────────────────────────────────────────────────────────────────

export interface PointerHandlers {
  /** pointer pressed at (x, y) in plate coordinates; return true to start a drag */
  down?(x: number, y: number): boolean;
  move?(x: number, y: number): void;
  up?(): void;
  hover?(x: number, y: number): void;
  leave?(): void;
}

export function pointer(svg: SVGSVGElement, h: PointerHandlers): () => boolean {
  let dragging = false;
  const at = (ev: PointerEvent): [number, number] => { const r = svg.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  svg.addEventListener('pointerdown', (ev) => {
    const [x, y] = at(ev);
    if (h.down?.(x, y)) {
      dragging = true;
      svg.classList.add('c01-dragging');
      svg.setPointerCapture(ev.pointerId);
      ev.preventDefault();
    }
  });
  svg.addEventListener('pointermove', (ev) => {
    const [x, y] = at(ev);
    if (dragging) h.move?.(x, y); else h.hover?.(x, y);
  });
  const stop = () => { if (dragging) { dragging = false; svg.classList.remove('c01-dragging'); h.up?.(); } };
  svg.addEventListener('pointerup', stop);
  svg.addEventListener('pointercancel', stop);
  svg.addEventListener('pointerleave', () => { if (!dragging) h.leave?.(); });
  return () => dragging;
}
