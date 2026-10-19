// Shared parts of the three hydrogen views (c11.demo.cloud, c11.demo.radial, c11.demo.phase):
// labels from the notation registry, the state selector, overlay elements, number formats.
// No physics here: every number comes from web/src/kernels/hydrogen.ts.
import type { DemoContext } from '../../demo/types';
import { STATES, type StateKey } from '../../kernels/hydrogen';

const NS = 'http://www.w3.org/2000/svg';

/** one stylesheet for the overlays of the c11 views; token names only (design/README.md) */
export function ensureStyle(): void {
  if (document.querySelector('style[data-tpcd-c11]')) return;
  const st = document.createElement('style');
  st.dataset.tpcdC11 = '';
  st.textContent = `
.c11-layer { position: absolute; inset: 0; pointer-events: none; font-family: var(--tpc-family-label); font-size: var(--tpc-size-label); line-height: var(--tpc-leading-label); }
.c11-layer math { font-family: var(--tpc-font-math); font-size: 1.08em; }
.c11-stage-ink { color: var(--tpc-stage-ink); }
.c11-plate-ink { color: var(--tpc-plate-ink); }
.c11-head { position: absolute; left: 0.6em; top: 0.4em; right: 0.6em; }
.c11-head b { font-weight: 600; }
.c11-foot { position: absolute; left: 0.6em; right: 0.6em; bottom: 0.4em; }
.c11-tag { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; }
.c11-muted-stage { color: var(--tpc-stage-ink); opacity: 0.72; }
.c11-muted-plate { color: var(--tpc-plate-muted); }
.c11-warn { font-weight: 600; }
.c11-caption { margin: 0; flex: 1 1 100%; color: var(--tpc-ink); max-width: 46rem; }
.c11-caption math { font-family: var(--tpc-font-math); }
.tpcd button.c11-on { border-color: var(--tpc-ink); border-width: var(--tpc-stroke-box); font-weight: 600; }
.c11-group { display: inline-flex; flex-wrap: wrap; gap: 0.25em; align-items: center; }
`;
  document.head.append(st);
}

export function svgEl<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number> = {}): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}
export function div(cls: string, parent?: Element): HTMLDivElement {
  const d = document.createElement('div');
  d.className = cls;
  parent?.append(d);
  return d;
}

/** MathML of a registry symbol without the outer <math> element, for composing */
function inner(mathml: string): string { return mathml.replace(/^<math[^>]*>/, '').replace(/<\/math>$/, ''); }

/**
 * A registry symbol with its generic indices replaced, e.g. sym.hydrogen-eigenfunction
 * (psi_{n l m}) with {n: '2', 'ℓ': '1', m: '0'} gives psi_{210}.
 * TODO(harness): ctx.symbol(id) returns the generic symbol only; a symbol with arguments
 * (the registry records `args`) would need ctx.symbol(id, args). Until then the indices are
 * substituted here in the MathML and Unicode strings of the registry entry.
 */
export function symbolWith(ctx: DemoContext, id: string, subst: Record<string, string>): { mathml: string; unicode: string; name: string } {
  const s = ctx.symbol(id);
  let mathml = s.mathml, unicode = s.unicode;
  for (const [k, v] of Object.entries(subst)) {
    const num = v.length > 0 && [...v].every((c) => '0123456789+-−'.includes(c));
    mathml = mathml.split(`<mi>${k}</mi>`).join(num ? `<mn>${v}</mn>` : `<mi>${v}</mi>`);
    unicode = unicode.split(k).join(v);
  }
  return { mathml, unicode, name: s.name };
}
export function sym(ctx: DemoContext, id: string): string { return ctx.symbol(id).mathml; }
/** several MathML fragments in one <math> row */
export function row(...parts: string[]): string { return `<math><mrow>${parts.map(inner).join('')}</mrow></math>`; }
export const mo = (s: string): string => `<math><mo>${s}</mo></math>`;
export const mn = (s: string): string => `<math><mn>${s}</mn></math>`;
export const mi = (s: string): string => `<math><mi>${s}</mi></math>`;
export const mtext = (s: string): string => `<math><mtext>${s}</mtext></math>`;
export const msub = (base: string, sub: string): string => `<math><msub>${inner(base)}${inner(sub)}</msub></math>`;
export const msup = (base: string, sup: string): string => `<math><msup>${inner(base)}${inner(sup)}</msup></math>`;
/** a number followed by a unit, with a thin space between */
export const qty = (value: string, unit: string): string => row(mn(value), '<math><mspace width="0.18em"></mspace></math>', unit);
export const abs2 = (x: string): string => `<math><mrow><msup><mrow><mo>|</mo>${inner(x)}<mo>|</mo></mrow><mn>2</mn></msup></mrow></math>`;

export interface StateText {
  /** short name: 1s, 2p with its index */
  short: string; shortHtml: string;
  /** psi with its quantum numbers, or the declared superposition */
  psi: string;
  /** quantum numbers in words */
  quantum: string;
}
const MINUS = '−';
export function stateText(ctx: DemoContext, key: StateKey): StateText {
  const s = STATES[key];
  const letter = s.l === 0 ? 's' : 'p';
  const idx: Record<StateKey, string> = { '1s': '', '2s': '', '2p0': '0', '2p+1': '+1', '2p-1': `${MINUS}1`, '2px': 'x', '2py': 'y' };
  const short = `${s.n}${letter}${idx[key] ? '_' + idx[key] : ''}`;
  const shortHtml = `${s.n}${letter}${idx[key] ? `<sub>${idx[key]}</sub>` : ''}`;
  const psiOf = (m: number) => symbolWith(ctx, 'sym.hydrogen-eigenfunction', { n: String(s.n), 'ℓ': String(s.l), m: m < 0 ? `${MINUS}${-m}` : String(m) }).mathml;
  const n = ctx.symbol('sym.principal-quantum-number').mathml, l = ctx.symbol('sym.orbital-quantum-number').mathml, m = ctx.symbol('sym.magnetic-quantum-number').mathml;
  let psi: string, quantum: string;
  if (s.m !== null) {
    psi = psiOf(s.m);
    quantum = row(n, mo('='), mn(String(s.n)), mo(','), l, mo('='), mn(String(s.l)), mo(','), m, mo('='), mn(s.m < 0 ? `${MINUS}${-s.m}` : String(s.m)));
  } else {
    // the declared superpositions of the kernel (STATES): not eigenstates of L_z
    const sqrt2 = '<math><msqrt><mn>2</mn></msqrt></math>';
    psi = key === '2px'
      ? row(mo('('), psiOf(-1), mo(MINUS), psiOf(1), mo(')'), mo('/'), sqrt2)
      : row(mi('i'), mo('('), psiOf(-1), mo('+'), psiOf(1), mo(')'), mo('/'), sqrt2);
    quantum = row(n, mo('='), mn(String(s.n)), mo(','), l, mo('='), mn(String(s.l)));
  }
  return { short, shortHtml, psi, quantum };
}

/** a number in the page language with a fixed number of decimals */
export function fix(ctx: DemoContext, v: number, digits: number): string {
  return v.toLocaleString(ctx.lang, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
/** a number with a given number of significant digits */
export function sig(ctx: DemoContext, v: number, digits: number): string {
  return v.toLocaleString(ctx.lang, { minimumSignificantDigits: digits, maximumSignificantDigits: digits });
}
/** mantissa times a power of ten, as MathML */
export function sci(ctx: DemoContext, v: number, digits: number): string {
  const e = Math.floor(Math.log10(Math.abs(v)));
  const m = v / 10 ** e;
  return row(mn(sig(ctx, m, digits)), mo('·'), `<math><msup><mn>10</mn><mn>${e < 0 ? MINUS + -e : e}</mn></msup></math>`);
}

/** a group of buttons of which one is on (aria-pressed), built with ctx.ui.button so that keyboard and focus work */
export function choice<T extends string>(ctx: DemoContext, groupLabel: string, options: ReadonlyArray<{ value: T; html: string; title: string }>, initial: T, onChange: (v: T) => void): { set(v: T): void } {
  const buttons = new Map<T, HTMLButtonElement>();
  let group: HTMLSpanElement | null = null;
  const paint = (v: T) => buttons.forEach((b, k) => { b.setAttribute('aria-pressed', String(k === v)); b.classList.toggle('c11-on', k === v); });
  for (const o of options) {
    const b = ctx.ui.button('', () => { paint(o.value); onChange(o.value); ctx.announce(o.title); });
    b.innerHTML = o.html;
    b.setAttribute('aria-label', o.title);
    b.title = o.title;
    if (!group) {
      group = document.createElement('span');
      group.className = 'c11-group';
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
export function toggle(ctx: DemoContext, label: string, initial: boolean, onChange: (on: boolean) => void): { set(on: boolean): void; readonly button: HTMLButtonElement } {
  let on = initial;
  const paint = () => { b.setAttribute('aria-pressed', String(on)); b.classList.toggle('c11-on', on); };
  const b = ctx.ui.button(label, () => { on = !on; paint(); onChange(on); ctx.announce(`${label}: ${on ? ctx.text('ein', 'on') : ctx.text('aus', 'off')}`); });
  paint();
  return { set(v) { on = v; paint(); }, button: b };
}
/** a paragraph below the stage, in the controls area (the caption generated from the state) */
export function captionBelow(ctx: DemoContext): HTMLParagraphElement {
  // ctx.ui.readout gives the place in the controls area; its wrapper is replaced by a paragraph.
  // TODO(harness): DemoUI has no element for running text below the stage.
  const anchor = ctx.ui.button('', () => {});
  const p = document.createElement('p');
  p.className = 'c11-caption';
  anchor.replaceWith(p);
  return p;
}
