// c03.demo.spektren: operator classes recognised by where their eigenvalues lie (figure
// c03.fig.spektren, Kern section c03.s12: c03.eq.orte, c03.ex.drei, c03.eq.spektren). 2D, SVG and
// HTML on the plate.
//
// THE POINT. If an operator belongs to a class, the defining equation of the class carries over to
// each eigenvalue (c03.eq.orte): Hermitian on the real axis, positive on the half-axis lambda >= 0,
// projector in the points 0 and 1, unitary on the unit circle; normality alone constrains nothing.
// The reader picks an operator and moves its parameter; the demo computes (1) the class tests and
// (2) the eigenvalues, and shows both side by side. A class whose test holds always has its
// eigenvalues on its locus; an eigenvalue off a locus rules the class out; and eigenvalues on a
// locus do NOT make the class (the two operators on C^2): the loci are necessary conditions only.
//
// LEFT: the complex plane with the loci drawn as in the still (real axis solid, role q1;
// half-axis a broad strip, q2; the points 0 and 1 filled dots, q3; unit circle dashed, q4). A locus
// is drawn strong when the operator belongs to its class, faint otherwise. The eigenvalues are
// markers (shapes as in the still: A discs, B rings, C diamonds; the two C^2 operators squares and
// triangles), with their values; small dots trace where the eigenvalues go over the whole range
// of the parameter. RIGHT: the matrix of the operator, and one row per class: its test with
// the computed relation (= or the crossed sign), whether it holds, and whether every eigenvalue
// is on the locus. Hover or tap a row: its locus is drawn thick, eigenvalues off it get a ring,
// and the line below gives the numbers of the test (largest modulus of an entry of the matrix that
// must vanish; for positivity the smallest <psi|O psi> over unit psi with the psi that attains
// it, or a psi with <psi|O psi> not real). Hover or tap an eigenvalue: an eigenvector with
// O|v> = lambda|v>, the informal definition of c03.s12. KEYBOARD: the class names and the
// eigenvalues are focusable buttons; focus shows the same readout as hover (and announces it),
// Enter or Space pins it as a tap does. PLAY sweeps the parameter back and forth.
//
// OPERATORS (web/src/kernels/hilbert.ts, SPEKTREN): A + s 1, s B, r C with A, B, C of c03.eq.abc
// (defaults s = 0, s = 1, r = 1: the still), M(t) = |0><1| + t|1><0| and Q(t) = |0><0| + t|0><1| on
// C^2. Every parameter runs over an interval of length 2 in steps of 0.01.
//
// Every number shown is an input (the operator, the parameter) or computed by the kernel
// (spektrenOperator, eigenvalues, eigenvector, classReport, onLocus, expectation). Default state:
// the operator A of the still, s = 0: eigenvalues -sqrt 2, 0, sqrt 2; Hermitian and normal.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import {
  CLASS_KEYS, SPEKTREN, SPEKTREN_STEPS, classReport, distinct, eigenvalues, eigenvector, expectation, onLocus, spektrenOperator, spektrenParam, spektrenStep,
  type ClassKey, type ClassReport, type Complex, type Mat, type SpektrenKey,
} from '../kernels/hilbert';
import { captionBelow, choice, complexMathml, complexText, div, ensureStyle, fix, inner, m, num, place, setAttrs, svgEl, withDagger } from './c03/common';

export const meta: DemoMeta = { animated: true, aspect: 1.9, surface: 'plate' };

const KEYS: readonly SpektrenKey[] = ['A', 'B', 'C', 'M', 'Q'];
const LOCI: readonly ClassKey[] = ['herm', 'pos', 'proj', 'unit'];
const RATE = 25;               // parameter steps per second while playing: a drawing choice
const NARROW = 600;            // below this stage width (CSS px) the panels are stacked: a drawing choice
const DEFAULT: Record<SpektrenKey, number> = { A: 0, B: 1, C: 1, M: 0.25, Q: 1 };
type Shape = 'disc' | 'ring' | 'diamond' | 'square' | 'triangle';
const SHAPE: Record<SpektrenKey, Shape> = { A: 'disc', B: 'ring', C: 'diamond', M: 'square', Q: 'triangle' };
type Hot = { kind: 'row'; cls: ClassKey } | { kind: 'eig'; i: number } | null;

const STYLE = `
.c03-sp-block { position: absolute; left: 0; top: 0; color: var(--tpc-plate-ink); }
.c03-sp-table { display: grid; grid-template-columns: auto auto auto auto auto; column-gap: 0.75em; align-items: center; white-space: nowrap; pointer-events: auto; }
.c03-sp-table > div { padding: 0.16em 0; }
.c03-sp-head { color: var(--tpc-plate-muted); font-size: 0.86em; align-self: end; }
.c03-sp-cell { cursor: default; }
.c03-sp-hot { font-weight: 600; }
.c03-sp-yes { font-weight: 600; }
.c03-sp-no { color: var(--tpc-plate-muted); }
.c03-sp-glyph { display: block; width: 1.9em; height: 1em; overflow: visible; }
.c03-sp-title { white-space: nowrap; }
.c03-sp-detail { text-align: center; white-space: normal; }
.c03-sp-detail .c03-sp-hint { color: var(--tpc-plate-muted); }
.c03-sp-focus:focus { outline: none; }
.c03-sp-focus:focus-visible { outline: 2px solid var(--tpc-plate-ink); outline-offset: 2px; border-radius: 0.2em; }
.c03-sp-eig { position: absolute; left: 0; top: 0; border-radius: 50%; pointer-events: none; }
`;
function ensureLocalStyle(): void {
  if (document.querySelector('style[data-tpcd-c03-spektren]')) return;
  const st = document.createElement('style');
  st.dataset.tpcdC03Spektren = '';
  st.textContent = STYLE;
  document.head.append(st);
}

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  ensureLocalStyle();
  const svg = svgEl('svg', { 'aria-hidden': 'true' });
  const layer = div('c03-layer');
  stage.append(svg, layer);
  const capture = Boolean(ctx.params.stage);
  const T = (de: string, en: string) => ctx.text(de, en);
  // The stage holds focusable controls (the rows of the table, the eigenvalues), so it is a named
  // group rather than an image: an image would hide them from assistive technology.
  stage.setAttribute('role', 'group');

  // ── MathML pieces from the registry ──────────────────────────────────────────────────────
  const hatOf = (letter: string) => inner(ctx.symbol('sym.operator-hat').mathml).replace('<mi>A</mi>', `<mi>${letter}</mi>`);
  const O = hatOf('O'), Od = withDagger(ctx, O);
  const ID = inner(ctx.symbol('sym.identity').mathml);
  const ketbra = (a: string, b: string) => tight(inner(ctx.symbol('sym.ketbra').mathml))
    .replace('<mi mathvariant="normal">Ψ</mi>', `<mn>${a}</mn>`).replace('<mi mathvariant="normal">Φ</mi>', `<mn>${b}</mn>`);
  const FENCE = (c: string) => `<mo lspace="0em" rspace="0em" stretchy="false">${c}</mo>`;
  const tight = (x: string) => x.replace(/<mo>([|⟨⟩])<\/mo>/g, (_, c: string) => FENCE(c)).replace(/<mspace\/>/g, '');
  const NORM = `<mrow>${FENCE('‖')}<mi>ψ</mi>${FENCE('‖')}</mrow>`;
  const braO = `<mrow>${FENCE('⟨')}<mi>ψ</mi>${FENCE('|')}${O}<mi>ψ</mi>${FENCE('⟩')}</mrow>`;
  const space = (n: number) => `<msup><mi>ℂ</mi><mn>${n}</mn></msup>`;
  const FORMULA: Record<SpektrenKey, string> = {
    A: `${hatOf('A')}<mo>+</mo><mi>s</mi>${ID}`,
    B: `<mi>s</mi>${hatOf('B')}`,
    C: `<mi>r</mi>${hatOf('C')}`,
    M: `${ketbra('0', '1')}<mo>+</mo><mi>t</mi>${ketbra('1', '0')}`,
    Q: `${ketbra('0', '0')}<mo>+</mo><mi>t</mi>${ketbra('0', '1')}`,
  };
  const PLAIN: Record<SpektrenKey, string> = { A: 'Â + s𝕀', B: 's B̂', C: 'r Ĉ', M: '|0⟩⟨1| + t|1⟩⟨0|', Q: '|0⟩⟨0| + t|0⟩⟨1|' };
  const CLASS_NAME: Record<ClassKey, string> = {
    herm: T('hermitesch', 'Hermitian'), pos: T('positiv', 'positive'), proj: T('Projektor', 'projector'), unit: T('unitär', 'unitary'), normal: T('normal', 'normal'),
  };

  // ── state ───────────────────────────────────────────────────────────────────────────────
  let key: SpektrenKey = (KEYS as readonly string[]).includes(ctx.params.op ?? '') ? (ctx.params.op as SpektrenKey) : 'A';
  const k0 = (k: SpektrenKey, p?: string) => {
    const want = p !== undefined && Number.isFinite(Number(p)) ? Number(p) : DEFAULT[k];
    return Math.max(0, Math.min(SPEKTREN_STEPS, spektrenStep(k, want)));
  };
  // shown step = triangle wave of (offset + RATE * time); the reader's choices set the offset
  let now = 0;
  let kOff = k0(key, ctx.params.p);
  const tri = (x: number) => { const P = 2 * SPEKTREN_STEPS, y = ((x % P) + P) % P; return Math.round(y <= SPEKTREN_STEPS ? y : P - y); };
  const shownK = () => tri(kOff + RATE * now);
  const setK = (k: number) => { kOff = k - RATE * now; };
  let hover: Hot = null, pinned: Hot = null, focused: Hot = null;
  const hot = (): Hot => hover ?? focused ?? pinned;

  // ── controls ────────────────────────────────────────────────────────────────────────────
  choice<SpektrenKey>(ctx, T('Operator', 'operator'), KEYS.map((k) => ({
    value: k,
    html: m(FORMULA[k]),
    title: k === 'A' ? T('Â + s𝕀 auf ℂ³, mit Â aus dem Beispiel (s = 0)', 'Â + s𝕀 on ℂ³, with Â of the example (s = 0)')
      : k === 'B' ? T('s B̂ auf ℂ³, mit B̂ aus dem Beispiel (s = 1)', 's B̂ on ℂ³, with B̂ of the example (s = 1)')
      : k === 'C' ? T('r Ĉ auf ℂ³, mit Ĉ aus dem Beispiel (r = 1)', 'r Ĉ on ℂ³, with Ĉ of the example (r = 1)')
      : T(`${PLAIN[k]} auf ℂ²`, `${PLAIN[k]} on ℂ²`),
  })), key, (k) => {
    key = k; pinned = null; hover = null;
    setK(k0(k));
    slider.set(shownK());
    trailKey = '';
  });
  const fmtParam = (k: number) => `${SPEKTREN[key].param} = ${num(ctx, spektrenParam(key, k), 2)}`;
  const slider = ctx.ui.slider({
    label: T('Parameter des Operators (s, r oder t)', 'parameter of the operator (s, r or t)'),
    labelHtml: T('Parameter', 'parameter'),
    min: 0, max: SPEKTREN_STEPS, step: 1, value: shownK(), primary: true,
    format: (k) => fmtParam(k),
    onInput: (k) => { setK(k); },
  });
  const caption = captionBelow(ctx);

  // ── persistent drawing ──────────────────────────────────────────────────────────────────
  const gStatic = svgEl('g', {}, svg);
  const gLoci = svgEl('g', {}, svg);
  const locusG: Record<string, SVGGElement> = {};
  for (const c of LOCI) locusG[c] = svgEl('g', {}, gLoci);
  const strip = svgEl('rect', {}, locusG.pos);
  const realLine = svgEl('line', {}, locusG.herm);
  const circle = svgEl('circle', { fill: 'none' }, locusG.unit);
  const dots = [0, 1].map(() => svgEl('circle', {}, locusG.proj));
  const trail = svgEl('path', { fill: 'none', 'stroke-linecap': 'round' }, svg);
  const gMarks = svgEl('g', {}, svg);
  const marks = [0, 1, 2].map(() => {
    const g = svgEl('g', {}, gMarks);
    const ring = svgEl('circle', { cx: 0, cy: 0, fill: 'none', 'stroke-dasharray': '2.5 2' }, g);
    const shape = svgEl('path', {}, g);
    return { g, ring, shape };
  });
  const gLabels = svgEl('g', {}, svg);
  const labels = [0, 1, 2].map(() => { const t = svgEl('text', {}, gLabels); t.style.fontFamily = 'var(--tpc-family-label)'; return t; });

  const titleA = div('c03-tag c03-sp-title', layer), titleB = div('c03-tag c03-sp-title', layer);
  const matrixEl = div('c03-sp-block', layer);
  const tableEl = div('c03-sp-block c03-sp-table', layer);
  const detail = div('c03-sp-block c03-sp-detail', layer);

  // table cells, built once
  const cells: Record<ClassKey, { glyph: HTMLDivElement; name: HTMLDivElement; test: HTMLDivElement; holds: HTMLDivElement; locus: HTMLDivElement; svg: SVGSVGElement }> = {} as never;
  for (const h of [T('Klasse', 'class'), T('Bedingung', 'condition'), T('erfüllt', 'holds'), T('Eigenwerte<br>am Ort', 'eigenvalues<br>on the locus')]) {
    const d = div('c03-sp-head', tableEl); d.innerHTML = h;
    if (!d.previousElementSibling) d.style.gridColumn = '1 / span 2';   // the first header spans glyph and name
  }
  for (const c of CLASS_KEYS) {
    const mk = () => { const d = div('c03-sp-cell', tableEl); d.dataset.row = c; return d; };
    const glyph = mk(), name = mk(), test = mk(), holds = mk(), locus = mk();
    const gs = svgEl('svg', { class: 'c03-sp-glyph', viewBox: '0 0 19 10', 'aria-hidden': 'true' }, glyph);
    name.textContent = CLASS_NAME[c];
    name.classList.add('c03-sp-focus');
    setAttrs(name, { tabindex: 0, role: 'button', 'aria-pressed': 'false' });
    cells[c] = { glyph, name, test, holds, locus, svg: gs };
  }
  // keyboard targets of the eigenvalues, laid over the markers (the pointer is handled by the stage)
  const eigTargets = [0, 1, 2].map(() => {
    const d = div('c03-sp-eig c03-sp-focus', layer);
    setAttrs(d, { tabindex: 0, role: 'button', 'aria-pressed': 'false' });
    return d;
  });

  // ── geometry ────────────────────────────────────────────────────────────────────────────
  let geo = { W: 1, H: 1, fs: 12, k: 1, x0: 0, y0: 0, narrow: false };
  // the window of the plane, per operator: every eigenvalue over the whole range of the parameter,
  // the unit circle, and room for the labels (a drawing choice; the scale is the same in both directions)
  const windows = new Map<SpektrenKey, { re0: number; re1: number; im0: number; im1: number; trail: Complex[] }>();
  const windowOf = (k: SpektrenKey) => {
    let w = windows.get(k);
    if (w) return w;
    const trail: Complex[] = [];
    for (let s = 0; s <= SPEKTREN_STEPS; s += 2) trail.push(...distinct(eigenvalues(spektrenOperator(k, spektrenParam(k, s)))));
    const re = trail.map((z) => z[0]), im = trail.map((z) => z[1]);
    w = { re0: Math.min(-1, ...re) - 0.55, re1: Math.max(1, ...re) + 0.6, im0: Math.min(-1, ...im) - 0.5, im1: Math.max(1, ...im) + 0.5, trail };
    windows.set(k, w);
    return w;
  };
  let win = windowOf(key);
  const toP = (z: Complex): [number, number] => [geo.x0 + geo.k * (z[0] - win.re0), geo.y0 + geo.k * (win.im1 - z[1])];

  // ── the model, from the kernel ──────────────────────────────────────────────────────────
  let model = { p: 0, a: [] as Mat, ev: [] as Complex[], evd: [] as Complex[], rep: null as unknown as ClassReport, loci: {} as Record<ClassKey, boolean> };
  const compute = () => {
    const p = spektrenParam(key, shownK());
    const a = spektrenOperator(key, p);
    const ev = eigenvalues(a);
    const rep = classReport(a);
    const loci = {} as Record<ClassKey, boolean>;
    for (const c of CLASS_KEYS) loci[c] = ev.every((z) => onLocus(c, z));
    model = { p, a, ev, evd: distinct(ev), rep, loci };
  };
  // the trail: the eigenvalues at every second step of the parameter (cached per operator and size)
  let trailKey = '';
  const drawTrail = () => {
    const tk = [key, geo.W, geo.H, geo.k].join('|');
    if (tk === trailKey) return;
    trailKey = tk;
    trail.setAttribute('d', win.trail.map((z) => { const [x, y] = toP(z); return `M ${x.toFixed(1)} ${y.toFixed(1)} h 0.01`; }).join(' '));
  };

  const vecText = (v: readonly Complex[]) => `(${v.map((z) => complexText(ctx, z, 3)).join(ctx.lang === 'de' ? '; ' : ', ')})`;
  const rel = (ok: boolean) => `<mo>${ok ? '=' : '≠'}</mo>`;
  const yes = (el: HTMLElement, ok: boolean | null) => {
    el.textContent = ok === null ? '–' : ok ? T('ja', 'yes') : T('nein', 'no');
    el.classList.toggle('c03-sp-yes', ok === true);
    el.classList.toggle('c03-sp-no', ok !== true);
  };

  const fillHtml = () => {
    const r = model.rep, eq = r.equal, fs = geo.fs;
    const font = `${fs.toFixed(2)}px`;
    for (const el of [titleA, titleB, matrixEl, tableEl, detail]) el.style.fontSize = font;
    titleA.textContent = T('Eigenwerte von Ô und die Orte der Klassen', 'Eigenvalues of Ô and the loci of the classes');
    titleB.textContent = T('Die Klassentests, berechnet', 'The class tests, computed');
    // the matrix
    const rows = model.a.map((row) => `<mtr>${row.map((z) => `<mtd>${complexMathml(ctx, z, 3)}</mtd>`).join('')}</mtr>`).join('');
    const mat = `<mrow><mo>(</mo><mtable columnspacing="0.8em" rowspacing="0.25em">${rows}</mtable><mo>)</mo></mrow>`;
    matrixEl.innerHTML = m(`${O}<mo>=</mo>${FORMULA[key]}<mo>=</mo>${mat}`) + T(' auf ', ' on ') + m(space(SPEKTREN[key].dim)) + `, ${fmtParam(shownK())}`;
    // the rows
    const h = hot();
    for (const c of CLASS_KEYS) {
      const cl = cells[c];
      let test = '';
      if (c === 'herm') test = `${Od}${rel(eq.herm)}${O}`;
      else if (c === 'pos') test = eq.herm
        ? `<msub><mi>min</mi><mrow>${NORM}<mo>=</mo><mn>1</mn></mrow></msub><mspace width="0.17em"/>${braO}<mo>=</mo><mn>${num(ctx, r.minRe.value, 3)}</mn>`
        : `<msub><mi>max</mi><mrow>${NORM}<mo>=</mo><mn>1</mn></mrow></msub><mspace width="0.17em"/><mo>|</mo><mi>Im</mi><mspace width="0.17em"/>${braO}<mo>|</mo><mo>=</mo><mn>${num(ctx, r.maxIm.value, 3)}</mn>`;
      else if (c === 'proj') test = eq.herm && eq.square ? `<msup>${O}<mn>2</mn></msup><mo>=</mo>${Od}<mo>=</mo>${O}` : `<msup>${O}<mn>2</mn></msup>${rel(eq.square)}${O}<mo>,</mo><mspace width="0.4em"/>${Od}${rel(eq.herm)}${O}`;
      else if (c === 'unit') test = eq.unitL && eq.unitR ? `${Od}${O}<mo>=</mo>${O}${Od}<mo>=</mo>${ID}` : !eq.unitL ? `${Od}${O}<mo>≠</mo>${ID}` : `${O}${Od}<mo>≠</mo>${ID}`;
      else test = `${Od}${O}${rel(eq.normal)}${O}${Od}`;
      cl.test.innerHTML = m(test);
      yes(cl.holds, r.member[c]);
      yes(cl.locus, c === 'normal' ? null : model.loci[c]);
      const isHot = h?.kind === 'row' && h.cls === c;
      for (const e of [cl.glyph, cl.name, cl.test, cl.holds, cl.locus]) e.classList.toggle('c03-sp-hot', isHot);
      const yn = (b: boolean) => (b ? T('ja', 'yes') : T('nein', 'no'));
      cl.name.setAttribute('aria-label', `${CLASS_NAME[c]}: ${T('erfüllt', 'holds')} ${yn(r.member[c])}` + (c === 'normal' ? '' : `, ${T('Eigenwerte am Ort', 'eigenvalues on the locus')} ${yn(model.loci[c])}`) + `. ${T('Rechnung zeigen', 'show the computation')}`);
      cl.name.setAttribute('aria-pressed', String(pinned?.kind === 'row' && pinned.cls === c));
    }
    // the line below: the numbers of the selected row or eigenvalue, otherwise the eigenvalues
    const res = (x: number) => fix(ctx, x, 3);
    const big = T('größter Betrag eines Eintrags', 'largest modulus of an entry');
    let html = '';
    if (h?.kind === 'row') {
      const c = h.cls;
      if (c === 'herm') html = `${m(`${Od}<mo>−</mo>${O}`)}: ${big} ${res(r.residual.herm)}`;
      else if (c === 'proj') html = `${m(`<msup>${O}<mn>2</mn></msup><mo>−</mo>${O}`)}: ${res(r.residual.square)}, ${m(`${Od}<mo>−</mo>${O}`)}: ${res(r.residual.herm)} (${big})`;
      else if (c === 'unit') html = `${m(`${Od}${O}<mo>−</mo>${ID}`)}: ${res(r.residual.unitL)}, ${m(`${O}${Od}<mo>−</mo>${ID}`)}: ${res(r.residual.unitR)} (${big})`;
      else if (c === 'normal') html = `${m(`${Od}${O}<mo>−</mo>${O}${Od}`)}: ${big} ${res(r.residual.normal)}`;
      else if (eq.herm) {
        const e = expectation(model.a, r.minRe.psi);
        html = T(`kleinster Wert von ${m(braO)} für ${m(`${NORM}<mo>=</mo><mn>1</mn>`)}: ${num(ctx, e[0], 3)}, bei |ψ⟩ = ${vecText(r.minRe.psi)}`,
          `smallest value of ${m(braO)} for ${m(`${NORM}<mo>=</mo><mn>1</mn>`)}: ${num(ctx, e[0], 3)}, at |ψ⟩ = ${vecText(r.minRe.psi)}`);
      } else {
        const e = expectation(model.a, r.maxIm.psi);
        html = T(`${m(braO)} = ${complexText(ctx, e, 3)} ist nicht reell, bei |ψ⟩ = ${vecText(r.maxIm.psi)}; ein positiver Operator ist hermitesch`,
          `${m(braO)} = ${complexText(ctx, e, 3)} is not real, at |ψ⟩ = ${vecText(r.maxIm.psi)}; a positive operator is Hermitian`);
      }
    } else if (h?.kind === 'eig' && model.evd[h.i]) {
      const z = model.evd[h.i], v = eigenvector(model.a, z);
      html = `λ = ${complexText(ctx, z, 3)}: ${m(`${O}<mo>|</mo><mi>v</mi><mo>⟩</mo><mo>=</mo><mi>λ</mi><mo>|</mo><mi>v</mi><mo>⟩</mo>`)} ${T('für', 'for')} |v⟩ = ${vecText(v)}`;
    } else {
      html = `${T('Eigenwerte von', 'eigenvalues of')} ${m(O)}: ${model.evd.map((z) => complexText(ctx, z, 3)).join(' · ')}`
        + (capture ? '' : ` <span class="c03-sp-hint">${T('(Zeile oder Eigenwert berühren: die Rechnung)', '(touch a row or an eigenvalue: the computation)')}</span>`);
    }
    detail.innerHTML = html;
  };

  const layout = () => {
    let box = stage.getBoundingClientRect();
    const narrow = !capture && box.width > 0 && box.width < NARROW;
    const W = Math.max(240, box.width);
    const fs = Math.min(ctx.tokens.font('label').sizePx, narrow ? W / 28 : W / 54);
    geo.fs = fs; geo.narrow = narrow; geo.W = W;
    fillHtml();
    const mw = matrixEl.offsetWidth, mh = matrixEl.offsetHeight;
    const tw = tableEl.offsetWidth, th = tableEl.offsetHeight;
    const colW = Math.max(mw, tw);
    const titleH = 2.0 * fs;
    win = windowOf(key);
    const wW = win.re1 - win.re0, wH = win.im1 - win.im0;
    if (narrow) {
      // a box of fixed shape, so that the stage keeps its height when the operator changes
      const pw = W - 1.6 * fs, ph = pw / 1.15, k = Math.min(pw / wW, ph / wH);
      detail.style.width = `${(W - 2 * fs).toFixed(0)}px`;
      const dh = detail.offsetHeight;
      const yB = titleH + ph + 0.8 * fs;
      const yM = yB + titleH, yT = yM + mh + 0.6 * fs, yD = yT + th + 0.8 * fs;
      const H = yD + dh + 0.8 * fs;
      const want = (W / H).toFixed(4);
      if (stage.style.aspectRatio !== want) { stage.style.aspectRatio = want; box = stage.getBoundingClientRect(); }
      geo = { W, H: Math.max(box.height, 200), fs, k, x0: (W - k * wW) / 2, y0: titleH + (ph - k * wH) / 2, narrow };
      place(titleA, `translate(${(0.8 * fs).toFixed(1)}px, ${(0.5 * fs).toFixed(1)}px)`);
      place(titleB, `translate(${(0.8 * fs).toFixed(1)}px, ${(yB + 0.4 * fs).toFixed(1)}px)`);
      place(matrixEl, `translate(${Math.max(0.8 * fs, (W - mw) / 2).toFixed(1)}px, ${yM.toFixed(1)}px)`);
      place(tableEl, `translate(${Math.max(0.5 * fs, (W - tw) / 2).toFixed(1)}px, ${yT.toFixed(1)}px)`);
      place(detail, `translate(${fs.toFixed(1)}px, ${yD.toFixed(1)}px)`);
    } else {
      if (!capture && stage.style.aspectRatio !== String(meta.aspect)) { stage.style.aspectRatio = String(meta.aspect); box = stage.getBoundingClientRect(); }
      const H = Math.max(200, box.height);
      detail.style.width = `${(W - 3 * fs).toFixed(0)}px`;
      const dh = detail.offsetHeight;
      const gap = 2.2 * fs;
      const availW = W - colW - gap - 2 * fs, availH = H - titleH - dh - 1.2 * fs;
      // a box of fixed size, so that the table stays in place when the operator changes
      const k = Math.max(20, Math.min(availW / wW, availH / wH));
      const left = fs;
      geo = { W, H, fs, k, x0: left + (availW - k * wW) / 2, y0: titleH + (availH - k * wH) / 2, narrow };
      const xr = left + availW + gap;
      const yM = titleH + 0.2 * fs, yT = yM + mh + 0.8 * fs;
      place(titleA, `translate(${left.toFixed(1)}px, ${(0.5 * fs).toFixed(1)}px)`);
      place(titleB, `translate(${xr.toFixed(1)}px, ${(0.5 * fs).toFixed(1)}px)`);
      place(matrixEl, `translate(${xr.toFixed(1)}px, ${yM.toFixed(1)}px)`);
      place(tableEl, `translate(${xr.toFixed(1)}px, ${yT.toFixed(1)}px)`);
      place(detail, `translate(${(1.5 * fs).toFixed(1)}px, ${(H - dh - 0.5 * fs).toFixed(1)}px)`);
    }
    svg.setAttribute('viewBox', `0 0 ${geo.W} ${geo.H}`);
  };

  let staticKey = '';
  const drawStatic = () => {
    const t = ctx.tokens, fs = geo.fs, ink = t.color('plate-ink'), muted = t.color('plate-muted');
    gStatic.replaceChildren();
    const [ax0, ay] = toP([win.re0, 0]), [ax1] = toP([win.re1, 0]), [axx, ay0] = toP([0, win.im0]), [, ay1] = toP([0, win.im1]);
    const head = (x: number, y: number, dx: number, dy: number) => {
      const s = 0.45 * fs;
      svgEl('path', { d: `M ${x} ${y} L ${x - dx * s - dy * s * 0.42} ${y - dy * s + dx * s * 0.42} L ${x - dx * s + dy * s * 0.42} ${y - dy * s - dx * s * 0.42} Z`, fill: ink }, gStatic);
    };
    svgEl('line', { x1: ax0, y1: ay, x2: ax1, y2: ay, stroke: ink, 'stroke-width': t.stroke('thin') }, gStatic); head(ax1, ay, 1, 0);
    svgEl('line', { x1: axx, y1: ay0, x2: axx, y2: ay1, stroke: ink, 'stroke-width': t.stroke('thin') }, gStatic); head(axx, ay1, 0, -1);
    const lab = (x: number, y: number, s: string, anchor: string, fill = ink, size = 0.95) => {
      const e = svgEl('text', { x, y, 'text-anchor': anchor, fill, 'font-size': size * fs, stroke: t.color('plate'), 'stroke-width': 0.28 * fs, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }, gStatic);
      e.style.fontFamily = 'var(--tpc-family-label)';
      e.textContent = s;
      return e;
    };
    lab(ax1, ay - 0.5 * fs, 'Re λ', 'end');
    lab(axx + 0.45 * fs, ay1 + 0.9 * fs, 'Im λ', 'start');
    // ticks: integers on both axes
    for (let n = Math.ceil(win.re0); n <= Math.floor(win.re1 - 0.3); n++) {
      if (n === 0) continue;
      const [x] = toP([n, 0]);
      svgEl('line', { x1: x, y1: ay - 0.22 * fs, x2: x, y2: ay + 0.22 * fs, stroke: ink, 'stroke-width': t.stroke('thin') }, gStatic);
      lab(x, ay + 2.15 * fs, num(ctx, n, 0), 'middle', muted, 0.82).dataset.tick = String(n);
    }
    for (let n = Math.ceil(win.im0 + 0.2); n <= Math.floor(win.im1 - 0.3); n++) {
      if (n === 0) continue;
      const [, y] = toP([0, n]);
      svgEl('line', { x1: axx - 0.22 * fs, y1: y, x2: axx + 0.22 * fs, y2: y, stroke: ink, 'stroke-width': t.stroke('thin') }, gStatic);
      lab(axx - 0.45 * fs, y + 0.32 * fs, complexText(ctx, [0, n], 0), 'end', muted, 0.82);
    }
    // the loci (c03.eq.orte), geometry from the formulas as in the still
    const [ox, oy] = toP([0, 0]), [x1] = toP([1, 0]), [xe] = toP([win.re1 - 0.2, 0]), [xs] = toP([win.re0 + 0.1, 0]);
    setAttrs(strip, { x: ox, y: oy - 0.1 * geo.k, width: xe - ox, height: 0.2 * geo.k, fill: t.color('q2'), 'fill-opacity': 0.4 });
    setAttrs(realLine, { x1: xs, y1: oy, x2: xe, y2: oy, stroke: t.color('q1') });
    setAttrs(circle, { cx: ox, cy: oy, r: geo.k, stroke: t.color('q4'), 'stroke-dasharray': '6 4' });
    setAttrs(dots[0], { cx: ox, cy: oy, fill: t.color('q3') });
    setAttrs(dots[1], { cx: x1, cy: oy, fill: t.color('q3') });
    setAttrs(trail, { stroke: muted, 'stroke-width': 0.22 * fs, 'stroke-opacity': 0.75 });
    // the glyphs of the table: the same marks in small
    for (const c of CLASS_KEYS) {
      const g = cells[c].svg;
      g.replaceChildren();
      if (c === 'herm') svgEl('line', { x1: 1, y1: 5, x2: 18, y2: 5, stroke: t.color('q1'), 'stroke-width': 1.6 }, g);
      if (c === 'pos') { svgEl('rect', { x: 1, y: 3, width: 17, height: 4, fill: t.color('q2'), 'fill-opacity': 0.45 }, g); svgEl('line', { x1: 1, y1: 5, x2: 18, y2: 5, stroke: t.color('q1'), 'stroke-width': 0.8 }, g); }
      if (c === 'proj') { svgEl('circle', { cx: 5, cy: 5, r: 2.4, fill: t.color('q3') }, g); svgEl('circle', { cx: 14, cy: 5, r: 2.4, fill: t.color('q3') }, g); }
      if (c === 'unit') svgEl('circle', { cx: 9.5, cy: 5, r: 4.2, fill: 'none', stroke: t.color('q4'), 'stroke-width': 1.3, 'stroke-dasharray': '2.2 1.6' }, g);
    }
  };

  const shapePath = (s: Shape, r: number) => {
    if (s === 'disc' || s === 'ring') return `M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`;
    if (s === 'diamond') { const q = 1.25 * r; return `M 0 ${-q} L ${q} 0 L 0 ${q} L ${-q} 0 Z`; }
    if (s === 'square') { const q = 0.9 * r; return `M ${-q} ${-q} H ${q} V ${q} H ${-q} Z`; }
    const q = 1.2 * r; return `M 0 ${-q} L ${0.9 * q} ${0.62 * q} L ${-0.9 * q} ${0.62 * q} Z`;
  };

  const paint = () => {
    compute();
    layout();
    const t = ctx.tokens, fs = geo.fs;
    const ink = t.color('plate-ink'), plate = t.color('plate'), state = t.color('state');
    const sk = [key, geo.W, geo.H, geo.k, geo.x0, geo.y0, t.pkg, t.ground].join('|');
    if (sk !== staticKey) { staticKey = sk; trailKey = ''; drawStatic(); }
    drawTrail();
    const h = hot();
    const hotCls = h?.kind === 'row' ? h.cls : null;
    // loci: strong when the operator is in the class, faint otherwise; thick when its row is selected
    for (const c of LOCI) {
      locusG[c].style.opacity = model.rep.member[c] ? '1' : '0.28';
      const w = t.stroke(hotCls === c ? 'state' : 'regular');
      if (c === 'herm') realLine.setAttribute('stroke-width', String(w));
      if (c === 'unit') circle.setAttribute('stroke-width', String(w));
      if (c === 'proj') dots.forEach((d) => d.setAttribute('r', String((hotCls === c ? 0.42 : 0.3) * fs)));
      if (c === 'pos') { strip.setAttribute('stroke', hotCls === c ? t.color('q1') : 'none'); strip.setAttribute('stroke-width', String(t.stroke('thin'))); }
    }
    // the eigenvalues
    const shape = SHAPE[key], r = 0.42 * fs;
    const evd = model.evd;
    const ticksHidden = new Set<number>();
    const boxes: Array<{ i: number; cx: number; cy: number; w: number; h: number; ux: number; uy: number; anchor: string; text: string; on: boolean }> = [];
    marks.forEach((mk, i) => {
      const z = evd[i];
      mk.g.style.display = z ? '' : 'none';
      if (!z) return;
      const [x, y] = toP(z);
      place(mk.g, `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`);
      const on = h?.kind === 'eig' && h.i === i;
      setAttrs(mk.shape, {
        d: shapePath(shape, on ? 1.25 * r : r),
        fill: shape === 'ring' ? plate : state, stroke: shape === 'ring' ? state : plate, 'stroke-width': shape === 'ring' ? t.stroke('state') : t.stroke('thin'),
      });
      const off = hotCls !== null && hotCls !== 'normal' && !onLocus(hotCls, z);
      setAttrs(mk.ring, { r: 1.05 * fs, stroke: ink, 'stroke-width': t.stroke('thin') });
      mk.ring.style.display = off ? '' : 'none';
      // the value beside it: real ones (on the real axis within LOCUS_TOL) alternately below and
      // above the axis, the others radially outward; overlapping labels are pushed apart below
      const real = onLocus('herm', z);
      let anchor = 'middle', ux = 0, uy = 0;
      if (real) {
        const nth = evd.slice(0, i).filter((w) => onLocus('herm', w)).length;
        uy = nth % 2 === 0 ? -1 : 1;
        for (let n = Math.ceil(win.re0); n <= win.re1; n++) if (Math.abs(toP([n, 0])[0] - x) < 2.2 * fs) ticksHidden.add(n);
      } else {
        const d = Math.hypot(z[0], z[1]);
        ux = z[0] / d; uy = z[1] / d;
        anchor = ux > 0.3 ? 'start' : ux < -0.3 ? 'end' : 'middle';
      }
      const text = complexText(ctx, z, Math.hypot(z[0], z[1]) < 0.1 ? 3 : real ? 3 : 2);
      const w = 0.53 * 0.95 * fs * [...text].length;
      // centre of the label box at distance 1.4 fs (real: 1.45 fs below, 1.45 fs above)
      const cx = x + ux * 1.4 * fs + (anchor === 'start' ? w / 2 : anchor === 'end' ? -w / 2 : 0);
      const cy = y - uy * 1.4 * fs;
      boxes.push({ i, cx, cy, w, h: 1.05 * fs, ux, uy, anchor, text, on });
      // the keyboard target over the marker
      const tg = eigTargets[i];
      tg.style.width = tg.style.height = `${(1.9 * fs).toFixed(1)}px`;
      place(tg, `translate(${(x - 0.95 * fs).toFixed(1)}px, ${(y - 0.95 * fs).toFixed(1)}px)`);
      tg.setAttribute('aria-label', `${T('Eigenwert', 'eigenvalue')} λ = ${complexText(ctx, z, 3)}. ${T('Eigenvektor zeigen', 'show an eigenvector')}`);
      tg.setAttribute('aria-pressed', String(pinned?.kind === 'eig' && pinned.i === i));
    });
    eigTargets.forEach((tg, i) => { tg.style.display = evd[i] ? '' : 'none'; });
    // separate overlapping labels: move the later one further out along its own direction
    for (let pass = 0; pass < 8; pass++) {
      let moved = false;
      for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) {
        const p = boxes[a], q = boxes[b];
        if (Math.abs(p.cx - q.cx) < (p.w + q.w) / 2 + 0.2 * fs && Math.abs(p.cy - q.cy) < (p.h + q.h) / 2) {
          const dx = q.ux, dy = q.uy === 0 && q.ux === 0 ? 1 : q.uy;
          const len = Math.hypot(dx, dy) || 1;
          q.cx += (dx / len) * 0.6 * fs; q.cy -= (dy / len) * 0.6 * fs;
          moved = true;
        }
      }
      if (!moved) break;
    }
    for (const bx of boxes) {
      const lx = bx.anchor === 'start' ? bx.cx - bx.w / 2 : bx.anchor === 'end' ? bx.cx + bx.w / 2 : bx.cx;
      setAttrs(labels[bx.i], { x: lx, y: bx.cy + 0.35 * fs, 'text-anchor': bx.anchor, fill: ink, 'font-size': 0.95 * fs, 'font-weight': bx.on ? '600' : '400', stroke: plate, 'stroke-width': 0.3 * fs, 'stroke-linejoin': 'round', 'paint-order': 'stroke' });
      labels[bx.i].textContent = bx.text;
    }
    labels.forEach((l, i) => { l.style.display = evd[i] ? '' : 'none'; });
    gStatic.querySelectorAll<SVGTextElement>('text[data-tick]').forEach((e) => { e.style.display = ticksHidden.has(Number(e.dataset.tick)) ? 'none' : ''; });

    // the caption below the stage: what the tests say about the eigenvalues
    const member = LOCI.filter((c) => model.rep.member[c]);
    const excluded = LOCI.filter((c) => !model.loci[c]);
    const notSufficient = LOCI.filter((c) => model.loci[c] && !model.rep.member[c]);
    const list = (cs: readonly ClassKey[]) => cs.map((c) => CLASS_NAME[c]).join(', ');
    const parts: string[] = [];
    if (member.length) parts.push(T(`In der Klasse, die Eigenwerte also am Ort: ${list(member)}.`, `In the class, so the eigenvalues are on its locus: ${list(member)}.`));
    if (model.rep.member.normal) parts.push(T('Ô ist normal; die Normalität allein schränkt die Eigenwerte nicht ein.', 'Ô is normal; normality alone does not constrain the eigenvalues.'));
    else if (!member.length) parts.push(T('Ô liegt in keiner der fünf Klassen.', 'Ô is in none of the five classes.'));
    else parts.push(T('Ô ist nicht normal.', 'Ô is not normal.'));
    if (excluded.length) parts.push(T(`Nicht in der Klasse, weil ein Eigenwert abseits ihres Ortes liegt: ${list(excluded)}.`, `Not in the class, because an eigenvalue lies off its locus: ${list(excluded)}.`));
    if (notSufficient.length) parts.push(T(`Alle Eigenwerte am Ort, aber nicht in der Klasse: ${list(notSufficient)}. Der Ort ist nur eine notwendige Bedingung.`, `All eigenvalues on the locus, but not in the class: ${list(notSufficient)}. The locus is only a necessary condition.`));
    parts.push(T('Kräftig gezeichnet sind die Orte der Klassen, zu denen Ô gehört.', 'The loci of the classes Ô belongs to are drawn strong.'));
    caption.textContent = parts.join(' ');
    slider.set(shownK());
    const fk = JSON.stringify(focused);
    if (focused && fk !== announcedFocus) ctx.announce(detail.textContent ?? '');
    announcedFocus = fk;
  };
  let announcedFocus = 'null';

  // ── pointer: rows of the table and eigenvalues ──────────────────────────────────────────
  const sameHot = (a: Hot, b: Hot) => JSON.stringify(a) === JSON.stringify(b);
  const rowOf = (e: Event): Hot => {
    const el = (e.target as Element | null)?.closest?.('[data-row]') as HTMLElement | null;
    return el ? { kind: 'row', cls: el.dataset.row as ClassKey } : null;
  };
  const onRowOver = (e: PointerEvent) => { const h = rowOf(e); if (!sameHot(h, hover)) { hover = h; ctx.invalidate(); } };
  const onRowLeave = () => { if (hover) { hover = null; ctx.invalidate(); } };
  const onRowClick = (e: MouseEvent) => {
    const h = rowOf(e);
    pinned = sameHot(h, pinned) ? null : h;
    if (h?.kind === 'row') ctx.announce(`${CLASS_NAME[h.cls]}: ${model.rep.member[h.cls] ? T('erfüllt', 'holds') : T('nicht erfüllt', 'does not hold')}`);
    ctx.invalidate();
  };
  tableEl.addEventListener('pointerover', onRowOver);
  tableEl.addEventListener('pointerleave', onRowLeave);
  tableEl.addEventListener('click', onRowClick);
  const local = (e: PointerEvent) => { const b = stage.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top] as const; };
  const pickEig = (x: number, y: number): Hot => {
    let best = -1, bd = 1.3 * geo.fs;
    model.evd.forEach((z, i) => { const [px, py] = toP(z); const d = Math.hypot(px - x, py - y); if (d < bd) { bd = d; best = i; } });
    return best >= 0 ? { kind: 'eig', i: best } : null;
  };
  const onMove = (e: PointerEvent) => {
    if ((e.target as Element | null)?.closest?.('[data-row]')) return;
    const [x, y] = local(e);
    const h = pickEig(x, y);
    stage.style.cursor = h ? 'pointer' : '';
    if (!sameHot(h, hover)) { hover = h; ctx.invalidate(); }
  };
  const onDown = (e: PointerEvent) => {
    if ((e.target as Element | null)?.closest?.('[data-row]')) return;
    const [x, y] = local(e);
    const h = pickEig(x, y);
    pinned = h && !sameHot(h, pinned) ? h : null;
    if (h?.kind === 'eig') ctx.announce(`λ = ${complexText(ctx, model.evd[h.i], 3)}`);
    ctx.invalidate();
  };
  const onLeave = () => { if (hover) { hover = null; ctx.invalidate(); } };
  // keyboard: focus shows the readout as hover does; Enter or Space pins it as a tap does
  const targetHot = (el: Element | null): Hot => {
    if (!el) return null;
    const row = (el as HTMLElement).dataset?.row;
    if (row) return { kind: 'row', cls: row as ClassKey };
    const i = eigTargets.indexOf(el as HTMLDivElement);
    return i >= 0 ? { kind: 'eig', i } : null;
  };
  const onFocusIn = (e: FocusEvent) => { const h = targetHot(e.target as Element); if (!sameHot(h, focused)) { focused = h; ctx.invalidate(); } };
  const onFocusOut = () => { if (focused) { focused = null; ctx.invalidate(); } };
  const onKey = (e: KeyboardEvent) => {
    const h = targetHot(e.target as Element);
    if (!h || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault(); e.stopPropagation();          // not the play toggle of the stage
    pinned = sameHot(h, pinned) ? null : h;
    ctx.invalidate();
  };
  layer.addEventListener('focusin', onFocusIn);
  layer.addEventListener('focusout', onFocusOut);
  layer.addEventListener('keydown', onKey);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointerleave', onLeave);

  return {
    render(_frame, time) {
      now = time;
      paint();
    },
    resize() { staticKey = ''; paint(); },
    tokensChanged() { staticKey = ''; paint(); },
    destroy() {
      tableEl.removeEventListener('pointerover', onRowOver); tableEl.removeEventListener('pointerleave', onRowLeave); tableEl.removeEventListener('click', onRowClick);
      stage.removeEventListener('pointermove', onMove); stage.removeEventListener('pointerdown', onDown); stage.removeEventListener('pointerleave', onLeave);
      layer.removeEventListener('focusin', onFocusIn); layer.removeEventListener('focusout', onFocusOut); layer.removeEventListener('keydown', onKey);
      svg.remove(); layer.remove();
    },
    info: () => ({
      op: key, p: model.p,
      eigenvalues: JSON.stringify(model.evd),
      member: JSON.stringify(model.rep?.member ?? {}),
      loci: JSON.stringify(model.loci),
    }),
  };
}
