// Shared parts of the chapter-c00 demos: SVG elements, labels with sub- and superscripts,
// number formats in the page language, button groups and a note paragraph below the stage.
// No physics here: every number a demo shows comes from its kernel or is its input.
import type { DemoContext, Tokens } from '../../demo/types';

const NS = 'http://www.w3.org/2000/svg';

/** one stylesheet for the c00 demos; token names only (design/README.md) */
export function ensureStyle(): void {
  if (document.querySelector('style[data-tpcd-c00]')) return;
  const st = document.createElement('style');
  st.dataset.tpcdC00 = '';
  st.textContent = `
.tpcd button.c00-on { border-color: var(--tpc-ink); border-width: var(--tpc-stroke-box); font-weight: 600; }
.c00-group { display: inline-flex; flex-wrap: wrap; gap: 0.25em; align-items: center; }
.c00-note { margin: 0; flex: 1 1 100%; color: var(--tpc-ink-muted); max-width: 48rem; }
.c00-stage-svg { touch-action: none; }
.c00-hit { cursor: pointer; }
.c00-drag { cursor: ew-resize; }
.c00-desc { position: absolute; left: 0.8em; right: 0.8em; bottom: 0.5em; color: var(--tpc-plate-ink); font-family: var(--tpc-family-label); line-height: var(--tpc-leading-label); pointer-events: none; }
.c00-desc b { font-weight: 600; }
.c00-desc .c00-muted { color: var(--tpc-plate-muted); }
`;
  document.head.append(st);
}

export type Attrs = Record<string, string | number>;
export function svgEl<K extends keyof SVGElementTagNameMap>(name: K, attrs: Attrs = {}, parent?: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  parent?.append(e);
  return e;
}

/** an SVG filling the stage, with a viewBox in CSS px of the stage */
export function stageSvg(stage: HTMLElement): SVGSVGElement {
  const svg = svgEl('svg', { 'aria-hidden': 'true', class: 'c00-stage-svg' });
  svg.style.position = 'absolute';
  svg.style.inset = '0';
  svg.style.width = '100%';
  svg.style.height = '100%';
  stage.append(svg);
  return svg;
}

/** drawing primitives bound to one SVG and the current tokens */
export interface Pen {
  k: Tokens; W: number; H: number; fs: number;
  g(attrs?: Attrs, parent?: Element): SVGGElement;
  line(x1: number, y1: number, x2: number, y2: number, stroke: string, w: number, extra?: Attrs, parent?: Element): SVGLineElement;
  path(d: string, attrs: Attrs, parent?: Element): SVGPathElement;
  rect(x: number, y: number, w: number, h: number, attrs: Attrs, parent?: Element): SVGRectElement;
  circle(cx: number, cy: number, r: number, attrs: Attrs, parent?: Element): SVGCircleElement;
  /** a label; markup: `_x` or `_{..}` subscript, `^x` or `^{..}` superscript, `*..*` italic (mathematical letters) */
  text(x: number, y: number, markup: string, opts?: { anchor?: 'start' | 'middle' | 'end'; fill?: string; size?: number; weight?: string; parent?: Element; italic?: boolean }): SVGTextElement;
  /** a polyline through points, as a path string */
  poly(pts: Array<[number, number]>): string;
}

export function pen(svg: SVGSVGElement, stage: HTMLElement, k: Tokens, fsDivisor: number): Pen {
  const box = stage.getBoundingClientRect();
  const W = Math.max(200, box.width), H = Math.max(120, box.height);
  const font = k.font('label');
  const fs = Math.max(9, Math.min(font.sizePx, W / fsDivisor));
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.replaceChildren();
  const add = <E extends Element>(e: E, parent?: Element) => { (parent ?? svg).append(e); return e; };
  const P: Pen = {
    k, W, H, fs,
    g: (attrs = {}, parent) => add(svgEl('g', attrs), parent),
    line: (x1, y1, x2, y2, stroke, w, extra = {}, parent) => add(svgEl('line', { x1, y1, x2, y2, stroke, 'stroke-width': w, ...extra }), parent),
    path: (d, attrs, parent) => add(svgEl('path', { d, ...attrs }), parent),
    rect: (x, y, w, h, attrs, parent) => add(svgEl('rect', { x, y, width: Math.max(0, w), height: Math.max(0, h), ...attrs }), parent),
    circle: (cx, cy, r, attrs, parent) => add(svgEl('circle', { cx, cy, r, ...attrs }), parent),
    text: (x, y, markup, opts = {}) => {
      const size = opts.size ?? fs;
      const t = svgEl('text', { x, y, 'text-anchor': opts.anchor ?? 'start', fill: opts.fill ?? k.color('plate-ink'), 'font-size': size });
      t.style.fontFamily = font.family;
      if (opts.weight) t.setAttribute('font-weight', opts.weight);
      richInto(t, markup, size, opts.italic ?? false);
      return add(t, opts.parent);
    },
    poly: (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' '),
  };
  return P;
}

/** fill a <text> with tspans for the small markup of Pen.text */
function richInto(t: SVGTextElement, markup: string, size: number, italic0: boolean): void {
  let italic = italic0;
  let shift = 0;            // current baseline offset in px (positive = down)
  let i = 0;
  const push = (s: string, kind: 'n' | 'sub' | 'sup') => {
    if (!s) return;
    const target = kind === 'sub' ? 0.3 * size : kind === 'sup' ? -0.38 * size : 0;
    const sp = svgEl('tspan', {});
    if (target !== shift) { sp.setAttribute('dy', String(target - shift)); shift = target; }
    if (kind !== 'n') sp.setAttribute('font-size', String(0.72 * size));
    if (italic) sp.setAttribute('font-style', 'italic');
    sp.textContent = s;
    t.append(sp);
  };
  let buf = '';
  const flush = () => { push(buf, 'n'); buf = ''; };
  while (i < markup.length) {
    const c = markup[i];
    if (c === '*') { flush(); italic = !italic; i++; continue; }
    if ((c === '_' || c === '^') && i + 1 < markup.length) {
      flush();
      let arg: string;
      if (markup[i + 1] === '{') { const j = markup.indexOf('}', i + 2); arg = markup.slice(i + 2, j < 0 ? undefined : j); i = j < 0 ? markup.length : j + 1; }
      else if (markup[i + 1] === '*') { const j = markup.indexOf('*', i + 2); arg = markup.slice(i + 1, j < 0 ? undefined : j + 1); i = j < 0 ? markup.length : j + 1; }
      else { arg = markup[i + 1]; i += 2; }
      // sub/superscripts are upright unless marked italic inside
      const keep = italic;
      const parts = arg.split('*');
      parts.forEach((p, q) => { italic = q % 2 === 1; push(p, c === '_' ? 'sub' : 'sup'); });
      italic = keep;
      continue;
    }
    buf += c; i++;
  }
  flush();
  if (shift !== 0) { const sp = svgEl('tspan', { dy: String(-shift) }); sp.textContent = '​'; t.append(sp); }
}

// ── numbers in the page language ──────────────────────────────────
export function fix(ctx: DemoContext, v: number, digits: number): string {
  return v.toLocaleString(ctx.lang, { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false }).replace('-', '−');
}
export function sig(ctx: DemoContext, v: number, digits: number): string {
  return v.toLocaleString(ctx.lang, { minimumSignificantDigits: digits, maximumSignificantDigits: digits, useGrouping: false }).replace('-', '−');
}
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
/** an integer as Unicode superscript digits, e.g. 60 -> ⁶⁰ */
export function supInt(n: number): string { return [...String(n)].map((c) => SUP[c] ?? c).join(''); }
/** mantissa · 10^e in Unicode, e.g. 6,626 · 10⁻³⁴ */
export function sci(ctx: DemoContext, v: number, digits: number): string {
  if (v === 0) return '0';
  let e = Math.floor(Math.log10(Math.abs(v)));
  let m = v / 10 ** e;
  if (Math.abs(Number(m.toPrecision(digits))) >= 10) { e += 1; m = v / 10 ** e; }
  if (e === 0) return sig(ctx, v, digits);
  return `${sig(ctx, m, digits)} · 10${[...String(e)].map((c) => SUP[c] ?? c).join('')}`;
}

// ── controls ──────────────────────────────────────────────────────
/** a group of buttons of which one is on (aria-pressed), built with ctx.ui.button so that keyboard and focus work */
export function choice<T extends string>(ctx: DemoContext, groupLabel: string, options: ReadonlyArray<{ value: T; label: string; title: string }>, initial: T, onChange: (v: T) => void): { set(v: T): void } {
  const buttons = new Map<T, HTMLButtonElement>();
  let group: HTMLSpanElement | null = null;
  const paint = (v: T) => buttons.forEach((b, key) => {
    b.setAttribute('aria-pressed', String(key === v));
    b.classList.toggle('c00-on', key === v);
    const o = options.find((x) => x.value === key)!;
    b.textContent = `${key === v ? '● ' : '○ '}${o.label}`;
  });
  for (const o of options) {
    const b = ctx.ui.button(o.label, () => { paint(o.value); onChange(o.value); ctx.announce(o.title); });
    b.setAttribute('aria-label', o.title);
    b.title = o.title;
    if (!group) {
      group = document.createElement('span');
      group.className = 'c00-group';
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', groupLabel);
      b.replaceWith(group);
    }
    group.append(b);
    buttons.set(o.value, b);
  }
  paint(initial);
  return { set: paint };
}
/** an on/off button (aria-pressed) */
export function toggle(ctx: DemoContext, label: string, initial: boolean, onChange: (on: boolean) => void): { set(on: boolean): void } {
  let on = initial;
  const paint = () => { b.setAttribute('aria-pressed', String(on)); b.classList.toggle('c00-on', on); b.textContent = `${on ? '☑ ' : '☐ '}${label}`; };
  const b = ctx.ui.button(label, () => { on = !on; paint(); onChange(on); ctx.announce(`${label}: ${on ? ctx.text('ein', 'on') : ctx.text('aus', 'off')}`); });
  paint();
  return { set(v) { on = v; paint(); } };
}
/** a paragraph of running text in the controls area, below the stage */
export function noteBelow(ctx: DemoContext, text: string): HTMLParagraphElement {
  // TODO(harness): DemoUI has no element for running text; a button's place is taken.
  const anchor = ctx.ui.button('', () => {});
  const p = document.createElement('p');
  p.className = 'c00-note';
  p.textContent = text;
  anchor.replaceWith(p);
  return p;
}

/** a block of running text over the bottom of the stage (wraps; words only, set with textContent) */
export function descBox(stage: HTMLElement): HTMLDivElement {
  const d = document.createElement('div');
  d.className = 'c00-desc';
  d.setAttribute('aria-hidden', 'true');
  stage.append(d);
  return d;
}
/** fill a descBox: a bold head and plain lines */
export function setDesc(d: HTMLDivElement, fsPx: number, head: string, lines: string[], muted?: string): void {
  d.style.fontSize = `${fsPx}px`;
  d.replaceChildren();
  const p = document.createElement('div');
  const b = document.createElement('b'); b.textContent = head;
  p.append(b);
  for (const l of lines) { p.append(document.createElement('br'), document.createTextNode(l)); }
  d.append(p);
  if (muted) { const m = document.createElement('div'); m.className = 'c00-muted'; m.textContent = muted; d.append(m); }
}

/** pointer position in stage px, from a pointer event on the SVG */
export function stagePoint(svg: SVGSVGElement, ev: PointerEvent): [number, number] {
  const r = svg.getBoundingClientRect();
  return [ev.clientX - r.left, ev.clientY - r.top];
}
/** press-and-drag on the SVG: onPoint(x, y, first) for the press and every move while pressed */
export function onDrag(svg: SVGSVGElement, onPoint: (x: number, y: number, first: boolean) => boolean): () => void {
  let active = -1;
  const down = (ev: PointerEvent) => {
    const [x, y] = stagePoint(svg, ev);
    if (!onPoint(x, y, true)) return;
    active = ev.pointerId;
    svg.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  };
  const move = (ev: PointerEvent) => { if (ev.pointerId !== active) return; const [x, y] = stagePoint(svg, ev); onPoint(x, y, false); };
  const up = (ev: PointerEvent) => { if (ev.pointerId === active) active = -1; };
  svg.addEventListener('pointerdown', down);
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerup', up);
  svg.addEventListener('pointercancel', up);
  return () => {
    svg.removeEventListener('pointerdown', down); svg.removeEventListener('pointermove', move);
    svg.removeEventListener('pointerup', up); svg.removeEventListener('pointercancel', up);
  };
}

/** smooth step on [0, 1] (drawing easing) */
export const ease = (u: number): number => { const v = Math.min(1, Math.max(0, u)); return v * v * (3 - 2 * v); };
