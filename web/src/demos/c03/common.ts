// Shared parts of the chapter c03 demos: element helpers, number formats, buttons with a
// pressed state, MathML composition, and the eased transitions of discrete state changes.
// No mathematics here: every number comes from web/src/kernels/hilbert.ts or is an input.
//
// EASING. The harness clock runs only while the reader plays an animation, so a discrete change
// (a preset, a toggle) cannot be eased by render(). The demos instead keep their SVG and HTML
// elements and place them with CSS transforms; while the class `c03-tween` is on the root, the
// browser eases from the old to the new transform. render() still writes one deterministic
// state. In deterministic mode (frame capture) and with reduced motion the class is never set.
import type { DemoContext } from '../../demo/types';

const NS = 'http://www.w3.org/2000/svg';

export function ensureStyle(): void {
  if (document.querySelector('style[data-tpcd-c03]')) return;
  const st = document.createElement('style');
  st.dataset.tpcdC03 = '';
  st.textContent = `
.c03-layer { position: absolute; inset: 0; pointer-events: none; font-family: var(--tpc-family-label); font-size: var(--tpc-size-label); line-height: var(--tpc-leading-label); color: var(--tpc-plate-ink); }
.c03-layer math { font-family: var(--tpc-font-math); font-size: 1.08em; }
.c03-stage-ink { color: var(--tpc-stage-ink); }
.c03-tag { position: absolute; left: 0; top: 0; white-space: nowrap; }
.c03-muted { color: var(--tpc-plate-muted); }
.c03-hot { font-weight: 600; }
.c03-readout { font-size: 0.88em; background: var(--tpc-stage); padding: 0 0.25em; border-radius: 0.2em; opacity: 0.92; }
.c03-tween .c03-move { transition: transform 520ms cubic-bezier(0.22, 0.7, 0.18, 1), opacity 320ms ease; }
.c03-tween .c03-fade { transition: transform 520ms cubic-bezier(0.22, 0.7, 0.18, 1), opacity 320ms ease; }
.tpcd button.c03-on { border-color: var(--tpc-ink); border-width: var(--tpc-stroke-box); font-weight: 600; }
.c03-group { display: inline-flex; flex-wrap: wrap; gap: 0.25em; align-items: center; }
.c03-caption { margin: 0; flex: 1 1 100%; color: var(--tpc-ink); max-width: 46rem; }
.c03-caption math { font-family: var(--tpc-font-math); }
.tpcd[data-demo-id="c03.demo.kreuz"] .tpcd-control input[type="range"] { width: 6.5rem; }
.tpcd[data-demo-id="c03.demo.kreuz"] .tpcd-control output { min-width: 2.4em; }
`;
  document.head.append(st);
}

export function svgEl<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number> = {}, parent?: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  parent?.append(e);
  return e;
}
export function setAttrs(e: Element, attrs: Record<string, string | number>): void {
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
}
export function div(cls: string, parent?: Element): HTMLDivElement {
  const d = document.createElement('div');
  d.className = cls;
  parent?.append(d);
  return d;
}
/** place an element by a CSS transform (eased while c03-tween is on an ancestor) */
export function place(e: HTMLElement | SVGElement, transform: string): void {
  if (e.style.transform !== transform) e.style.transform = transform;
}

// ── numbers ───────────────────────────────────────────────────────────────────────────────
export const MINUS = '−';
/** a number in the page language with at most `digits` decimals, trailing zeros dropped, proper minus */
export function num(ctx: DemoContext, v: number, digits = 2): string {
  const r = Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v;
  return r.toLocaleString(ctx.lang, { maximumFractionDigits: digits, useGrouping: false }).replace('-', MINUS);
}
/** a number with a fixed number of decimals */
export function fix(ctx: DemoContext, v: number, digits: number): string {
  return v.toLocaleString(ctx.lang, { minimumFractionDigits: digits, maximumFractionDigits: digits }).replace('-', MINUS);
}
/** an integer with the page's digit grouping */
export function int(ctx: DemoContext, v: number): string { return Math.round(v).toLocaleString(ctx.lang); }
/** a complex number a + bi as plain text: "2 − i", "−2i", "0" (parts rounded to `digits` decimals) */
export function complexText(ctx: DemoContext, z: readonly [number, number], digits = 2): string {
  const p = 10 ** digits;
  const round = (v: number) => { const x = Math.round(v * p) / p; return x === 0 ? 0 : x; };
  const re = round(z[0]), im = round(z[1]);
  const imAbs = Math.abs(im) === 1 ? '' : num(ctx, Math.abs(im), digits);
  if (im === 0) return num(ctx, re, digits);
  if (re === 0) return `${im < 0 ? MINUS : ''}${imAbs}i`;
  return `${num(ctx, re, digits)} ${im < 0 ? MINUS : '+'} ${imAbs}i`;
}
/** the same as MathML content (no outer <math>) */
export function complexMathml(ctx: DemoContext, z: readonly [number, number], digits = 2): string {
  const t = complexText(ctx, z, digits);
  return '<mrow>' + t.split(' ').map((p) => {
    if (p === '+' || p === MINUS) return `<mo>${p}</mo>`;
    const neg = p.startsWith(MINUS) ? `<mo>${MINUS}</mo>` : '';
    const q = p.replace(MINUS, '');
    if (q.endsWith('i')) return `${neg}${q.length > 1 ? `<mn>${q.slice(0, -1)}</mn>` : ''}<mi>i</mi>`;
    return `${neg}<mn>${q}</mn>`;
  }).join('') + '</mrow>';
}

// ── MathML ────────────────────────────────────────────────────────────────────────────────
/** inner MathML of a <math> element */
export function inner(mathml: string): string { return mathml.replace(/^<math[^>]*>/, '').replace(/<\/math>$/, ''); }
export const m = (content: string): string => `<math>${content}</math>`;
/** base with the registry's dagger (sym.adjoint), e.g. v^dagger */
export function withDagger(ctx: DemoContext, base: string): string {
  const d = inner(ctx.symbol('sym.adjoint').mathml);          // <msup><mrow/><mo>†</mo></msup>
  return d.replace('<mrow/>', `<mrow>${base}</mrow>`);
}
export const bold = (c: string): string => `<mi mathvariant="bold">${c}</mi>`;
export const sub = (base: string, index: string): string => `<msub>${base}<mn>${index}</mn></msub>`;
export const star = (base: string): string => `<msup>${base}<mo>*</mo></msup>`;

// ── controls ──────────────────────────────────────────────────────────────────────────────
/** a group of buttons of which one is on (aria-pressed) */
export function choice<T extends string>(ctx: DemoContext, groupLabel: string, options: ReadonlyArray<{ value: T; html: string; title: string }>, initial: T | null, onChange: (v: T) => void): { set(v: T | null): void } {
  const buttons = new Map<T, HTMLButtonElement>();
  let group: HTMLSpanElement | null = null;
  const paint = (v: T | null) => buttons.forEach((b, k) => { b.setAttribute('aria-pressed', String(k === v)); b.classList.toggle('c03-on', k === v); });
  for (const o of options) {
    const b = ctx.ui.button('', () => { paint(o.value); onChange(o.value); ctx.announce(o.title); });
    b.innerHTML = o.html;
    b.setAttribute('aria-label', o.title);
    b.title = o.title;
    if (!group) {
      group = document.createElement('span');
      group.className = 'c03-group';
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
export function toggle(ctx: DemoContext, label: string, html: string | null, initial: boolean, onChange: (on: boolean) => void): { set(on: boolean): void } {
  let on = initial;
  const b = ctx.ui.button(label, () => { on = !on; paint(); onChange(on); ctx.announce(`${label}: ${on ? ctx.text('ein', 'on') : ctx.text('aus', 'off')}`); });
  if (html) b.innerHTML = html;
  b.setAttribute('aria-label', label);
  const paint = () => { b.setAttribute('aria-pressed', String(on)); b.classList.toggle('c03-on', on); };
  paint();
  return { set(v) { on = v; paint(); } };
}
/** a paragraph below the stage, in the controls area (text generated from the state) */
export function captionBelow(ctx: DemoContext): HTMLParagraphElement {
  // TODO(harness): DemoUI has no element for running text below the stage; a button is
  // created for its place in the controls area and replaced by the paragraph (as in c11).
  const anchor = ctx.ui.button('', () => {});
  const p = document.createElement('p');
  p.className = 'c03-caption';
  anchor.replaceWith(p);
  return p;
}

/** easing switch: call tween() before a discrete change, still() when the reader drags */
export function tweener(ctx: DemoContext, root: Element): { tween(): void; still(): void } {
  const allowed = !ctx.deterministic && !ctx.reducedMotion;
  return {
    tween() { if (allowed) root.classList.add('c03-tween'); },
    still() { root.classList.remove('c03-tween'); },
  };
}

/** an arrow from (x0, y0) to (x1, y1) in px, built so that CSS transitions keep head and shaft together */
export interface Arrow { g: SVGGElement; shaft: SVGLineElement; head: SVGPathElement; set(x0: number, y0: number, x1: number, y1: number, headPx: number): void }
export function arrow(parent: Element, cls = ''): Arrow {
  const g = svgEl('g', { class: `c03-move ${cls}` }, parent);
  const sg = svgEl('g', { class: 'c03-move' }, g);
  const shaft = svgEl('line', { x1: 0, y1: 0, x2: 1, y2: 0, 'vector-effect': 'non-scaling-stroke' }, sg);
  const hg = svgEl('g', { class: 'c03-move' }, g);
  const head = svgEl('path', { d: 'M 0 0 L -1 -0.42 L -0.78 0 L -1 0.42 Z' }, hg);
  let angle = 0;
  return {
    g, shaft, head,
    set(x0, y0, x1, y1, headPx) {
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
      if (L > 1e-9) {
        const a = (Math.atan2(dy, dx) * 180) / Math.PI;
        angle += ((((a - angle) % 360) + 540) % 360) - 180;      // the nearest turn: no spin through 360 degrees
      }
      const hs = Math.min(headPx, L * 0.6);
      place(g, `translate(${x0.toFixed(2)}px, ${y0.toFixed(2)}px) rotate(${angle.toFixed(3)}deg)`);
      place(sg, `scale(${Math.max(0.0001, L - 0.7 * hs).toFixed(3)}, 1)`);
      place(hg, `translate(${L.toFixed(2)}px, 0px) scale(${Math.max(0.0001, hs).toFixed(3)})`);
    },
  };
}
