// Shared page furniture of the two C2 demos: stylesheet, controls, labels, the mapping of
// handles and keys to the lattice models. No physics.
import {
  ratToNumber, vectorEffect, type Effect, type Theory, type Vec,
} from '../../kernels/gpt';
import type { DemoContext } from '../../demo/types';
import { fmtRat } from './format';
import { BallModel, BitModel, GRID, type EffectModel, type EffectView } from './model';
import css from './style.css?inline';

// TODO(harness): there is no hook for a demo's own stylesheet; it is injected here once.
export function ensureStyle(): void {
  if (document.querySelector('style[data-c02]')) return;
  const st = document.createElement('style');
  st.dataset.c02 = '';
  st.textContent = css;
  document.head.append(st);
}

/**
 * The root element of a C2 demo inside the harness stage.
 * TODO(harness): the stage has a fixed aspect ratio, role="img" and no slot for a demo's own
 * controls. These demos are a figure with controls and text in one plate, so the stage is
 * given the height of its content and the role "group" here (except for a fixed-size capture).
 */
export function makeRoot(stage: HTMLElement, ctx: DemoContext, label: string): HTMLDivElement {
  ensureStyle();
  const root = document.createElement('div');
  root.className = 'c02';
  root.lang = ctx.lang;
  if (!ctx.params.stage) { stage.style.aspectRatio = 'auto'; } else { root.style.height = '100%'; root.style.overflow = 'hidden'; }
  stage.setAttribute('role', 'group');
  if (!stage.getAttribute('aria-label')) stage.setAttribute('aria-label', label);
  stage.append(root);
  return root;
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, html = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (html) e.innerHTML = html;
  return e;
}

/** mathematical letters in running text */
export const mi = (t: string, subscript = ''): string => `<span class="c02-m">${t}</span>${subscript ? `<sub>${subscript}</sub>` : ''}`;
export const num = (t: string): string => `<span class="c02-num">${t}</span>`;

export interface SliderRow { set(d: { min: number; max: number; value: number; text: string }): void; input: HTMLInputElement }
export function sliderRow(parent: HTMLElement, labelHtml: string, aria: string, onInput: (v: number) => void): SliderRow {
  const wrap = h('label', { class: 'c02-slider' });
  const name = h('span', {}, labelHtml);
  const input = h('input', { type: 'range', step: '1', 'aria-label': aria });
  const out = h('output');
  input.addEventListener('input', () => onInput(Number(input.value)));
  wrap.append(name, input, out);
  parent.append(wrap);
  return {
    input,
    set(d) {
      input.min = String(d.min); input.max = String(d.max);
      if (input.value !== String(d.value)) input.value = String(d.value);
      out.textContent = d.text;
      input.setAttribute('aria-valuetext', d.text);
    },
  };
}

/** a definition list of read-outs; values carry data-c02="<key>" so that tests can find them */
export function readouts(parent: HTMLElement, rows: Array<{ key: string; labelHtml: string; strong?: boolean }>): Record<string, HTMLElement> {
  const dl = h('dl', { class: 'c02-read' });
  const out: Record<string, HTMLElement> = {};
  for (const r of rows) {
    const dt = h('dt', {}, r.labelHtml);
    const dd = h('dd', { 'data-c02': r.key });
    if (r.strong) dd.classList.add('c02-key');
    dl.append(dt, dd);
    out[r.key] = dd;
  }
  parent.append(dl);
  return out;
}
export function setReadout(el: HTMLElement, text: string, exact?: unknown): void {
  if (el.textContent !== text) el.textContent = text;
  if (exact !== undefined) el.dataset.exact = JSON.stringify(exact);
}

export const AXIS = ['x', 'y', 'z'];

/** labels and texts of the effect sliders of a model */
export function effectSliderSpecs(ctx: DemoContext, model: EffectModel): Array<{ key: string; labelHtml: string; aria: string }> {
  const T = ctx.text;
  if (model instanceof BitModel) {
    return [
      { key: 'q0', labelHtml: `${mi('q', '0')} = ${mi('f')}(1, 0)`, aria: T('q0, Wert des Effekts auf dem reinen Zustand (1, 0)', 'q0, value of the effect on the pure state (1, 0)') },
      { key: 'q1', labelHtml: `${mi('q', '1')} = ${mi('f')}(0, 1)`, aria: T('q1, Wert des Effekts auf dem reinen Zustand (0, 1)', 'q1, value of the effect on the pure state (0, 1)') },
    ];
  }
  if (model instanceof BallModel) {
    const [i, j] = model.axes;
    return [
      { key: 'dir', labelHtml: T('Richtung', 'direction'), aria: T(`Richtung von a in der Schnittebene (${AXIS[i]}, ${AXIS[j]})`, `direction of a in the section plane (${AXIS[i]}, ${AXIS[j]})`) },
      { key: 's', labelHtml: `|${mi('a')}|`, aria: T('Länge von a', 'length of a') },
      { key: 'b', labelHtml: mi('b'), aria: T('b, Wert des Effekts im Mittelpunkt', 'b, value of the effect at the centre') },
    ];
  }
  return [
    { key: 'ax', labelHtml: mi('a', 'x'), aria: T('a x, Anstieg des Effekts in x-Richtung', 'a x, slope of the effect in the x direction') },
    { key: 'ay', labelHtml: mi('a', 'y'), aria: T('a y, Anstieg des Effekts in y-Richtung', 'a y, slope of the effect in the y direction') },
    { key: 'b', labelHtml: mi('b'), aria: T('b, Wert des Effekts im Mittelpunkt', 'b, value of the effect at the centre') },
  ];
}
export function sliderText(d: { key: string; value: number; text: string }): string {
  return d.text || fmtRat(reduce(d.value, GRID));
}
function reduce(n: number, d: number): { n: bigint; d: bigint } {
  let a = Math.abs(n), b = d;
  while (b) { [a, b] = [b, a % b]; }
  const g = a || 1;
  return { n: BigInt(n / g), d: BigInt(d / g) };
}

/** drawing coordinates (b; a) of a kernel effect (model.ts, header) */
export function effectToView(t: Theory, e: Effect, axes: readonly [number, number]): EffectView {
  if (e.kind === 'vector') {
    const f = e.f.map(ratToNumber);
    return t.kind === 'polytope' && t.chart === 'probability' ? { b: (f[0] + f[1]) / 2, a: [(f[0] - f[1]) / 2, 0] } : { b: f[0], a: [f[1], f[2]] };
  }
  const r = Math.sqrt(Number(e.m));
  const w = e.w.map((x) => ratToNumber(x) * r);
  return { b: ratToNumber(e.b), a: [w[axes[0]], w[axes[1]]] };
}
export const vertexEffect = (f: Vec): Effect => vectorEffect(f);

/** a drag of a handle of the two pictures, applied to the effect model; true if it was an effect handle */
export function dragEffect(model: EffectModel, handle: string, x: number, y: number): boolean {
  if (handle === 'a') { model.dragA(x, y); return true; }
  if (handle === 'q0' || handle === 'q1') { (model as BitModel).setEnd(handle === 'q0' ? 0 : 1, y); return true; }
  if (handle === 'e') { if (model instanceof BitModel) model.setBA(y, x); else model.dragB(y); return true; }
  return false;
}

export interface KeyAction { dx: number; dy: number; db: number }
/** arrows: a lattice step in the picture; + and - (or PageUp, PageDown): a step of b */
export function keyAction(ev: KeyboardEvent): KeyAction | null {
  switch (ev.key) {
    case 'ArrowLeft': return { dx: -1, dy: 0, db: 0 };
    case 'ArrowRight': return { dx: 1, dy: 0, db: 0 };
    case 'ArrowUp': return { dx: 0, dy: 1, db: 0 };
    case 'ArrowDown': return { dx: 0, dy: -1, db: 0 };
    case '+': case '=': case 'PageUp': return { dx: 0, dy: 0, db: 1 };
    case '-': case '_': case 'PageDown': return { dx: 0, dy: 0, db: -1 };
    default: return null;
  }
}
/** apply a key to the effect; on the handle of the picture of E(K), up and down move b */
export function keyEffect(model: EffectModel, handle: string, k: KeyAction): void {
  if (k.db) model.nudgeB(k.db);
  else if (handle === 'e' && !(model instanceof BitModel) && k.dy) model.nudgeB(k.dy);
  else if (handle === 'q0' || handle === 'q1') {
    // an end of the bit's graph: up and down move this end alone
    const bm = model as BitModel;
    if (k.dy) bm.setSlider(handle, (handle === 'q0' ? bm.k0 : bm.k1) + k.dy); else bm.nudge(k.dx, 0);
  } else model.nudge(k.dx, k.dy);
}
export const isControl = (t: EventTarget | null): boolean => t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'BUTTON' || t.tagName === 'SUMMARY' || t.tagName === 'A');
