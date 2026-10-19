// c02.demo.explorer: a state space K and its effects E(K), for the classical bit, the
// square bit and the qubit. The reader moves two states and an effect f and reads the
// probability p = e(omega) as an exact number; the mixture of the two states shows that p
// is affine; the cone view (three.js) shows K at height one in the cone of unnormalised
// states beside the cone of positive affine functions with E(K) in it.
//
// Every number shown is computed by the kernel web/src/kernels/gpt.ts from the positions of
// the controls (exact rationals, square roots kept symbolic). Mathematics:
// evidence/derivations/c02/DERIVATION.md sections 1.2, 1.4, 1.10, 3.2 to 3.5.
//
// Clock: time moves the mixing weight lambda back and forth (a triangle wave on the
// lattice of the control); nothing else depends on time. Parameters: theory=classical_bit
// | square_bit | qubit_ball, view=cones.
//
// Keys on the stage: arrows move the effect one lattice step (bit: left/right tilt the
// graph, up/down shift it; qubit: to the neighbouring direction or length), + and - change
// b. A focused handle (state or effect) takes the arrows itself. In the cone view the
// arrows on the focused view turn it.
import { DemoUnsupported, type DemoContext, type DemoInstance, type DemoMeta } from '../demo/types';
import {
  evaluate, isExtremeEffect, mix, rat, surdAdd, surdEq, surdScale, rsub, ONE, surdToNumber, THEORIES,
  type Effect, type Surd, type Theory,
} from '../kernels/gpt';
import { ConeView } from './c02/cones';
import { fmtBoth, fmtRat, fmtSurd, fmtVec } from './c02/format';
import { BallModel, BitModel, DIRECTIONS, GRID, makeEffectModel, NDIR, StateModel, statePoint, type EffectModel } from './c02/model';
import { EPanel, KPanel, UNIT_LABEL, type ExtremeMark } from './c02/panels';
import { el, line, circle, m, text, type Part } from './c02/svg';
import { AXIS, dragEffect, effectSliderSpecs, effectToView, h, isControl, keyAction, keyEffect, makeRoot, mi, num, readouts, setReadout, sliderRow, sliderText, type SliderRow } from './c02/ui';

export const meta: DemoMeta = { animated: true, aspect: 1.2, surface: 'plate' };

const SECTION: readonly [number, number] = [0, 2];     // the qubit is drawn in the (x, z) section of the qubit state ball
const SWEEP = 4;                                        // seconds for lambda to run from 0 to 1; a presentation choice

interface TheoryState { theory: Theory; model: EffectModel; w: [StateModel, StateModel] }

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const T = ctx.text;
  const K = ctx.symbol('sym.state-space'), E = ctx.symbol('sym.effect-algebra'), U = ctx.symbol('sym.unit-effect');
  const CS = ctx.symbol('sym.dual-cone'), CF = ctx.symbol('sym.positive-cone');
  const root = makeRoot(stage, ctx, T('Zustandsraum und Effekte', 'State space and effects'));

  // ── state ────────────────────────────────────────────────────────────────────────────
  const start: Record<string, { e: number[]; w: Array<[number, number]> }> = {
    classical_bit: { e: [16, 4], w: [[-12, 0], [10, 0]] },
    square_bit: { e: [10, 6, 2], w: [[-12, 8], [14, 10]] },
    qubit_ball: { e: [10, 7, DIRECTIONS.findIndex((d) => d[0] === 1 && d[1] === 1)], w: [[12, -6], [-10, 2]] },
  };
  const states: TheoryState[] = THEORIES.map((theory) => {
    const model = makeEffectModel(theory, SECTION);
    model.restore(start[theory.id].e);
    const [a, b] = start[theory.id].w;
    return { theory, model, w: [new StateModel(theory, SECTION, a[0], a[1]), new StateModel(theory, SECTION, b[0], b[1])] };
  });
  let cur = Math.max(0, THEORIES.findIndex((t) => t.id === ctx.params.theory));
  let cones = ctx.params.view === 'cones';
  let cone: ConeView | null = null;
  let coneFailed = false;
  let now = 0;
  let phase = 0.5;                                        // lambda(now) = tri(phase + now / SWEEP)
  const tri = (u: number) => { const r = ((u % 2) + 2) % 2; return r <= 1 ? r : 2 - r; };
  const lambdaK = () => Math.round(tri(phase + now / SWEEP) * GRID);

  // ── page ─────────────────────────────────────────────────────────────────────────────
  const head = h('div', { class: 'c02-head', role: 'group', 'aria-label': T('Theorie', 'theory') });
  const names: Record<string, string> = { classical_bit: T('Klassisches Bit', 'Classical bit'), square_bit: T('Quadrat-Bit', 'Square bit'), qubit_ball: T('Qubit', 'Qubit') };
  const theoryButtons = THEORIES.map((t, i) => {
    const b = h('button', { type: 'button', 'data-theory': t.id }, names[t.id]);
    b.addEventListener('click', () => { cur = i; rebuildSliders(); ctx.invalidate(); });
    head.append(b);
    return b;
  });
  const coneButton = h('button', { type: 'button', 'data-c02': 'cones' }, T('Kegelansicht (3D)', 'Cone view (3D)'));
  coneButton.addEventListener('click', () => { cones = !cones; ctx.invalidate(); });
  head.append(coneButton);

  const figs = h('div', { class: 'c02-figs' });
  const figK = h('figure', { class: 'c02-fig' }), figE = h('figure', { class: 'c02-fig' });
  const capK = h('figcaption'), capE = h('figcaption');
  const box3 = h('div', { class: 'c02-3d', tabindex: '0', role: 'img', 'data-handle': 'view' });
  const cap3 = h('p', { class: 'c02-muted' });
  cap3.style.gridColumn = '1 / -1';
  figs.append(figK, figE, box3, cap3);

  const onDrag = (handle: string, x: number, y: number) => {
    const s = states[cur];
    if (!dragEffect(s.model, handle, x, y)) s.w[handle === 'w0' ? 0 : 1].drag(x, y);
    ctx.invalidate();
  };
  const kPanel = new KPanel(figK, onDrag, T('Zustandsraum K mit zwei Zuständen und dem Effekt f', 'state space K with two states and the effect f'));
  const ePanel = new EPanel(figE, onDrag, T('Effektmenge E(K) mit dem Effekt f als Punkt', 'effect set E(K) with the effect f as a point'));
  figK.append(capK); figE.append(capE);

  const cols = h('div', { class: 'c02-cols' });
  const colE = h('div', { class: 'c02-col' }), colS = h('div', { class: 'c02-col' });
  cols.append(colE, colS);
  colE.append(h('h3', {}, `${T('Effekt', 'Effect')} ${mi('f')}`));
  const sliderHost = h('div');
  colE.append(sliderHost);
  const outE = readouts(colE, [
    { key: 'e', labelHtml: `${mi('f')} =` },
    { key: 'status', labelHtml: T('Lage', 'position') },
    { key: 'shape', labelHtml: T('Gestalt', 'shape') },
  ]);
  colS.append(h('h3', {}, T('Zustände und Mischung', 'States and mixture')));
  const outS = readouts(colS, [
    { key: 'w0', labelHtml: `${mi('x')} =` },
    { key: 'p', labelHtml: `${mi('p')} = ${mi('f')}(${mi('x')}) =`, strong: true },
    { key: 'w1', labelHtml: `${mi('x')}′ =` },
    { key: 'p1', labelHtml: `${mi('f')}(${mi('x')}′) =` },
  ]);
  const lambdaRow = sliderRow(colS, `${mi('λ')}`, T('Mischungsgewicht lambda', 'mixing weight lambda'), (v) => { phase = v / GRID - now / SWEEP; ctx.invalidate(); });
  const outM = readouts(colS, [
    { key: 'mixL', labelHtml: `${mi('f')}(${mi('λ')}${mi('x')} + (1 − ${mi('λ')})${mi('x')}′) =`, strong: true },
    { key: 'mixR', labelHtml: `${mi('λ')} ${mi('f')}(${mi('x')}) + (1 − ${mi('λ')}) ${mi('f')}(${mi('x')}′) =` },
  ]);
  const plot = el('svg', { viewBox: '0 0 300 124', role: 'img', 'aria-label': T('p entlang der Mischung: eine Gerade', 'p along the mixture: a straight line') });
  plot.style.width = '100%'; plot.style.maxWidth = '22rem'; plot.style.display = 'block';
  colS.append(plot);

  const help = h('details', { class: 'c02-box' });
  help.innerHTML = `<summary>${T('Bedienung und Lesehilfe', 'How to use and read this')}</summary><ul>`
    + `<li>${T('Ziehe die Zustände (Kreise) in', 'Drag the states (circles) in')} ${K.mathml} ${T('und den Effekt (Raute): im linken Bild seinen Anstieg, im rechten seine Lage in', 'and the effect (diamond): on the left its slope, on the right its position in')} ${E.mathml}. ${T('Der Effekt bleibt in', 'The effect stays in')} ${E.mathml}: ${T('zwischen den Linien', 'between the lines')} ${mi('f')} = 0 ${T('und', 'and')} ${mi('f')} = 1 ${T('liegt ganz', 'lies all of')} ${K.mathml}.</li>`
    + `<li>${T('Tasten auf der Figur', 'Keys on the figure')}: <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> ${T('verschieben den Effekt um einen Rasterschritt (Bit: kippen und heben; Qubit: nächste Richtung oder Länge)', 'move the effect by one lattice step (bit: tilt and lift; qubit: next direction or length)')}, <kbd>+</kbd> <kbd>−</kbd> ${T('ändern', 'change')} ${mi('b')}. ${T('Ein angewählter Punkt nimmt die Pfeiltasten selbst. In der Kegelansicht drehen die Pfeiltasten die angewählte Ansicht.', 'A focused point takes the arrow keys itself. In the cone view the arrow keys turn the focused view.')}</li>`
    + `<li>${T(`Raster (Entwurfsentscheidung, keine Physik): alle Regler rasten in Schritten von 1/${GRID}; Qubit-Richtungen sind ganzzahlige Vektoren mit Einträgen bis ${NDIR}. Angezeigt werden exakte Brüche und symbolische Wurzeln, daneben ausdrücklich mit ≈ markierte dezimale Näherungen.`, `Lattice (a design choice, not physics): all controls move in steps of 1/${GRID}; qubit directions are integer vectors with entries up to ${NDIR}. What is shown are exact fractions and symbolic roots, together with decimal approximations explicitly marked by ≈.`)}</li>`
    + `<li>${T('Qubit: gezeichnet ist der Schnitt der Zustandskugel des Qubits mit der (x, z)-Ebene; Zustände und der Vektor a liegen in dieser Ebene. Die Niveauebenen von f stehen senkrecht auf ihr und erscheinen als Geraden.', 'Qubit: the picture is the section of the qubit state ball by the (x, z) plane; the states and the vector a lie in that plane. The level planes of f are perpendicular to it and appear as straight lines.')}</li>`
    + '</ul>';
  root.append(head, figs, cols, help);

  // effect sliders, rebuilt when the theory changes
  let sliders: Array<{ key: string; row: SliderRow }> = [];
  function rebuildSliders(): void {
    sliderHost.textContent = '';
    const model = states[cur].model;
    sliders = effectSliderSpecs(ctx, model).map((sp) => ({ key: sp.key, row: sliderRow(sliderHost, sp.labelHtml, sp.aria, (v) => { model.setSlider(sp.key, v); ctx.invalidate(); }) }));
  }
  rebuildSliders();

  // ── keys ─────────────────────────────────────────────────────────────────────────────
  // TODO(harness): the harness gives the arrow keys to one "primary" slider; a picture with
  // two-dimensional handles has to read them itself. Registered before the harness's own
  // listener, so stopImmediatePropagation keeps play/pause from firing on inner controls.
  stage.addEventListener('keydown', (ev) => {
    if (ev.target !== stage) ev.stopImmediatePropagation();
    if (isControl(ev.target)) return;
    const k = keyAction(ev);
    if (!k) return;
    const handle = (ev.target as Element).closest?.('[data-handle]')?.getAttribute('data-handle') ?? 'effect';
    const s = states[cur];
    if (handle === 'view') cone?.turn(-0.12 * k.dx, 0.08 * k.dy);
    else if (handle === 'w0' || handle === 'w1') { if (k.db === 0) s.w[handle === 'w0' ? 0 : 1].nudge(k.dx, k.dy); }
    else keyEffect(s.model, handle, k);
    ev.preventDefault();
    paint();              // the controls show the new value at once (a key press is followed by a read-out)
    ctx.invalidate();
  });
  let dragging: { x: number; y: number } | null = null;
  box3.addEventListener('pointerdown', (ev) => { box3.setPointerCapture(ev.pointerId); dragging = { x: ev.clientX, y: ev.clientY }; });
  box3.addEventListener('pointermove', (ev) => {
    if (!dragging || !box3.hasPointerCapture(ev.pointerId)) return;
    cone?.turn((ev.clientX - dragging.x) * 0.01, (ev.clientY - dragging.y) * 0.006);
    dragging = { x: ev.clientX, y: ev.clientY };
    ctx.invalidate();
  });
  box3.addEventListener('pointerup', () => { dragging = null; });

  // ── drawing ──────────────────────────────────────────────────────────────────────────
  const effectText = (model: EffectModel, e: Effect): string => {
    if (model instanceof BitModel && e.kind === 'vector') return `(q₀, q₁) = ${fmtVec(e.f)}`;
    if (e.kind === 'vector') return `(b; a) = (${fmtRat(e.f[0])}; ${fmtRat(e.f[1])}, ${fmtRat(e.f[2])})`;
    const bm = model as BallModel;
    const d = DIRECTIONS[bm.dir];
    const dirText = `(${d[0]}, ${d[1]})`.replace(/-/g, '−');
    return bm.ks === 0 ? `(b; a) = (${fmtRat(e.b)}; 0)` : `b = ${fmtRat(e.b)}, a = ${fmtRat(rat(bm.ks, GRID))} · ${dirText}/|${dirText}|`;
  };
  const shapeText = (t: Theory): string => {
    if (t.kind === 'ball') {
      return T('K: Kugel, reine Zustände auf der Sphäre. E(K): Doppelkegel über einer Kugel; extremal sind 0, der Einseffekt und die Sphäre in halber Höhe.',
        'K: ball, pure states on the sphere. E(K): double cone over a ball; extreme are 0, the unit effect and the sphere at half height.');
    }
    const nk = t.stateVertices.length, ne = t.effectVertices.length;
    return t.chart === 'probability'
      ? T(`K: Strecke, ${nk} reine Zustände. E(K): Quadrat, ${ne} Extremaleffekte.`, `K: segment, ${nk} pure states. E(K): square, ${ne} extreme effects.`)
      : T(`K: Quadrat, ${nk} reine Zustände. E(K): Doppelpyramide über einem Quadrat, ${ne} Extremaleffekte.`, `K: square, ${nk} pure states. E(K): double pyramid over a square, ${ne} extreme effects.`);
  };
  const coneKind = (t: Theory) => (t.kind === 'ball' ? 'ball' as const : t.chart === 'probability' ? 'bit' as const : 'square' as const);

  function paint(): void {
    const s = states[cur], t = s.theory, model = s.model;
    const e = model.effect();
    const view = model.view();
    const kl = lambdaK();
    const lambda = rat(kl, GRID);
    const w0 = s.w[0].vec(), w1 = s.w[1].vec();
    const p0: Surd = evaluate(t, e, w0), p1: Surd = evaluate(t, e, w1);
    const wm = mix(lambda, w0, w1);
    const pm = evaluate(t, e, wm);                                                       // e at the mixed state
    const pc = surdAdd(surdScale(lambda, p0), surdScale(rsub(ONE, lambda), p1));         // the mixture of the two values
    if (!surdEq(pm, pc)) throw new Error('c02 explorer: e is not affine on this mixture; the kernel is inconsistent');

    theoryButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === cur)));
    coneButton.setAttribute('aria-pressed', String(cones));
    for (const sl of sliders) { const d = model.sliders().find((x) => x.key === sl.key)!; sl.row.set({ ...d, text: sliderText(d) }); }
    lambdaRow.set({ min: 0, max: GRID, value: kl, text: fmtRat(lambda) });
    setReadout(outE.e, effectText(model, e));
    const extreme = isExtremeEffect(t, e);
    setReadout(outE.status, extreme ? T('Extremaleffekt', 'extreme effect') : T('in E(K), nicht extremal', 'in E(K), not extreme'), extreme);
    setReadout(outE.shape, shapeText(t));
    setReadout(outS.w0, fmtVec(w0)); setReadout(outS.w1, fmtVec(w1));
    setReadout(outS.p, fmtBoth(p0, ctx.lang), { x: fmtRat(p0.x), y: fmtRat(p0.y), m: `${p0.m}` });
    setReadout(outS.p1, fmtBoth(p1, ctx.lang));
    setReadout(outM.mixL, fmtBoth(pm, ctx.lang)); setReadout(outM.mixR, fmtBoth(pc, ctx.lang));

    // p along the mixture: the straight line from e(omega') at lambda = 0 to e(omega) at lambda = 1
    const X = (l: number) => 44 + 236 * l, Y = (p: number) => 92 - 78 * p;
    plot.innerHTML = line(X(0), Y(0), X(1), Y(0), 'rule') + line(X(0), Y(1), X(1), Y(1), 'rule') + line(X(0), Y(0), X(0), Y(1), 'rule') + line(X(1), Y(0), X(1), Y(1), 'rule')
      + text(X(0) - 8, Y(0) + 4, '0', { anchor: 'end', cls: 'mu' }) + text(X(0) - 8, Y(1) + 4, '1', { anchor: 'end', cls: 'mu' })
      + text(X(0), Y(0) + 20, [m('λ'), ' = 0: ', m('x'), '′'], { anchor: 'start', cls: 'mu' }) + text(X(1), Y(0) + 20, [m('λ'), ' = 1: ', m('x')], { anchor: 'end', cls: 'mu' })
      + text(X(0) - 8, Y(0.5) + 4, [m('p')], { anchor: 'end', cls: 'mu' })
      + line(X(0), Y(surdToNumber(p1)), X(1), Y(surdToNumber(p0)), 'ink')
      + circle(X(kl / GRID), Y(surdToNumber(pm)), 4, 's-pt');

    figK.hidden = cones; figE.hidden = cones; box3.hidden = !cones; cap3.hidden = !cones;
    const ax = t.kind === 'ball' ? [AXIS[SECTION[0]], AXIS[SECTION[1]]] : ['x', 'y'];
    const axisNames: [Part[], Part[]] = [[m('r'), { sub: ax[0] }], [m('r'), { sub: ax[1] }]];
    if (!cones) {
      const omega: Part[] = [m('x')], omega2: Part[] = [m('x'), '′'];
      kPanel.draw({
        theory: t, effect: view, ghost: null, live: true, axisNames, ends: ['(0, 1)', '(1, 0)'],
        states: [
          { p: s.w[0].point(), label: omega, style: 'filled', handle: 'w0', aria: T('Zustand x: Pfeiltasten verschieben ihn', 'state x: the arrow keys move it') },
          { p: s.w[1].point(), label: omega2, style: 'open', handle: 'w1', aria: T('Zustand x Strich: Pfeiltasten verschieben ihn', 'state x prime: the arrow keys move it') },
          { p: statePoint(t, wm, SECTION), label: [], style: 'small' },
        ],
        segment: [s.w[0].point(), s.w[1].point()],
        aria: {
          a: T('Anstieg a des Effekts: Pfeiltasten verschieben ihn', 'slope a of the effect: the arrow keys move it'),
          q0: T('Wert q0 des Effekts über dem reinen Zustand (1, 0): Pfeil auf und ab', 'value q0 of the effect over the pure state (1, 0): arrow up and down'),
          q1: T('Wert q1 des Effekts über dem reinen Zustand (0, 1): Pfeil auf und ab', 'value q1 of the effect over the pure state (0, 1): arrow up and down'),
        },
      });
      const extremes: ExtremeMark[] = t.kind === 'polytope'
        ? t.effectVertices.map((f, id) => ({ ...effectToView(t, { kind: 'vector', f }, SECTION), state: 'plain' as const, id }))
        : [{ b: 0, a: [0, 0], state: 'plain', id: 0 }, { b: 1, a: [0, 0], state: 'plain', id: 1 }];
      const side: [Part[], Part[]] = t.kind === 'polytope' && t.chart === 'probability' ? [['(0, 1)'], ['(1, 0)']]
        : t.kind === 'ball' ? [[m('a'), { sub: AXIS[SECTION[0]] }], [m('a'), { sub: AXIS[SECTION[1]] }]] : [[m('a'), { sub: 'x' }], [m('a'), { sub: 'y' }]];
      ePanel.draw({ theory: t, effect: view, extremes, optimalEdge: null, live: true, unitLabel: UNIT_LABEL, sideLabels: side,
        aria: T('Effekt f in E(K): Pfeil auf und ab ändert b', 'effect f in E(K): arrow up and down changes b') }, () => {});
      capK.innerHTML = t.kind === 'polytope' && t.chart === 'probability'
        ? `${K.name} ${K.mathml}: ${T('die Strecke unten. Darüber der Graph von', 'the segment below. Above it the graph of')} ${mi('f')}; ${T('seine Höhe über einem Zustand ist', 'its height over a state is')} ${mi('p')}.`
        : `${K.name} ${K.mathml}${t.kind === 'ball' ? T(' (Schnitt der Zustandskugel des Qubits)', ' (section of the qubit state ball)') : ''}. ${T('Gestrichelt: Niveaulinien', 'Dashed: level lines')} ${mi('f')} = 0, 1/4, 1/2, 3/4, 1. ${T('Die Raute sitzt bei', 'The diamond sits at')} 2${mi('a')}.`;
      capE.innerHTML = `${E.mathml} ${T('zwischen 0 und dem', 'between 0 and the')} ${U.name} ${U.mathml}. ${T('Höhe', 'Height')}: ${mi('b')}. ${T('Die dünne Linie in Effektfarbe: alle erlaubten', 'The thin line in the effect colour: all admissible')} ${mi('a')} ${T('zu diesem', 'for this')} ${mi('b')}.`;
    } else {
      if (!cone && !coneFailed) {
        try { cone = new ConeView(box3, ctx); } catch (err) {
          if (!(err instanceof DemoUnsupported)) throw err;
          coneFailed = true;
          box3.textContent = T('Die Kegelansicht braucht WebGL 2; dieser Browser bietet es nicht an.', 'The cone view needs WebGL 2, which this browser does not provide.');
        }
      }
      box3.setAttribute('aria-label', T('Kegelansicht: links der Kegel der unnormierten Zustände mit K in Höhe eins, rechts der Kegel der positiven affinen Funktionen mit E(K) zwischen 0 und dem Einseffekt. Pfeiltasten drehen.',
        'Cone view: on the left the cone of unnormalised states with K at height one, on the right the cone of positive affine functions with E(K) between 0 and the unit effect. The arrow keys turn it.'));
      cap3.innerHTML = `${T('Links', 'Left')}: ${CS.mathml}, ${T('der Kegel der unnormierten Zustände, mit', 'the cone of unnormalised states, with')} ${K.mathml} ${T('in Höhe eins', 'at height one')}. `
        + `${T('Rechts', 'Right')}: ${CF.mathml}, ${T('der Kegel der positiven affinen Funktionen, mit', 'the cone of positive affine functions, with')} ${E.mathml} ${T('zwischen 0 und', 'between 0 and')} ${U.mathml}. `
        + (t.kind === 'ball' ? T('Beim Qubit sind beide Kegel vierdimensional; gezeichnet ist ihr Schnitt mit der (x, z)-Ebene. ', 'For the qubit both cones are four-dimensional; the picture is their section by the (x, z) plane. ') : '')
        + T('Die Kegel reichen nach oben ins Unendliche und sind abgeschnitten gezeichnet. Ziehen dreht die Ansicht.', 'The cones extend upwards without bound and are drawn cut off. Drag to turn the view.');
      if (cone) {
        cone.update({ kind: coneKind(t), omega: s.w[0].point(), omega2: s.w[1].point(), mixture: statePoint(t, wm, SECTION), effect: view,
          labels: { stateCone: CS.mathml, functionCone: CF.mathml, K: K.mathml, E: E.mathml, unit: U.mathml, omega: mi('x'), e: mi('f') } });
        cone.render();
      }
    }
    root.dataset.theory = t.id;
    root.dataset.rev = String(Number(root.dataset.rev ?? '0') + 1);
  }

  return {
    render(_frame, time) { now = time; paint(); },
    tokensChanged() { cone?.tokens(); },
    destroy() { cone?.dispose(); root.remove(); },
    info() {
      const s = states[cur];
      return { theory: s.theory.id, lambda: fmtRat(rat(lambdaK(), GRID)), p: fmtSurd(evaluate(s.theory, s.model.effect(), s.w[0].vec())), cones, ...(cone ? cone.info() : {}) };
    },
  };
}
