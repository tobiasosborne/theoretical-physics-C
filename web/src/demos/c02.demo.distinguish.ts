// c02.demo.distinguish: the game "Unterscheiden" / "Distinguish".
//
// A level gives two preparations omega_1, omega_2 with priors pi_1, pi_2 in a theory. The
// player builds the two-outcome measurement {e, 1_K - e} by moving e inside E(K) and
// commits it. Three things are stated separately (docs/plan/PLAN.md section 13.1, A10):
//   the physical quantity   P(e) = pi_1 e(omega_1) + pi_2 (1 - e(omega_2)), exact
//                           (kernel gpt, score; DERIVATION.md section 4.1)
//   the proven optimum      P_opt of the level, shown only after the commit, with the
//                           scores of all candidates that prove it (kernel gpt, optimum;
//                           sections 4.2 to 4.4)
//   the reward              stars from P and P_opt by c02/reward.ts: a design choice
// Levels: web/src/kernels/gpt.levels.json (generated from the derivation); each is verified
// by the kernel when the game starts.
//
// No timer, no streak, nothing moves by itself. Progress (the result of the first commit
// per level, the extreme effects found) is kept in memory only and is lost on reload: no
// decision on persistence has been made.
//
// Keys on the figure: arrows move e one lattice step (bit: left/right tilt the graph,
// up/down shift it; qubit: to the neighbouring direction or length); + and - change b;
// X jumps to the nearest extreme effect already found; Z or Backspace undoes a step;
// Enter commits; N goes to the next level.
//
// Deterministic mode (?frame=n, optionally &level=k): no interaction; frame n shows step n
// of a walk from the uninformative effect (constant 1/2) to the optimal extreme effect,
// which is reached and committed after WALK seconds of frames. For stills and capture.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import {
  cmpSurd, effectsEqual, effectToJSON, evaluate, guessScore, isExtremeEffect, LEVELS, optimum, score, sharpEffect, surdSub, surdToJSON, surdToNumber,
  unitEffect, verifyLevel, zeroEffect, type Effect, type Level, type Optimum, type Surd, type Theory,
} from '../kernels/gpt';
import { fmtBoth, fmtRat, fmtSurd, fmtVec } from './c02/format';
import { BallModel, BitModel, DIRECTIONS, GRID, makeEffectModel, NDIR, sectionFor, statePoint, type EffectModel } from './c02/model';
import { EPanel, KPanel, UNIT_LABEL, type ExtremeMark } from './c02/panels';
import { ONE_STAR_GAP, stars, TWO_STAR_GAP, type Stars } from './c02/reward';
import { m, starsHtml, sub, type Part } from './c02/svg';
import { AXIS, dragEffect, effectSliderSpecs, effectToView, h, isControl, keyAction, keyEffect, makeRoot, mi, readouts, setReadout, sliderRow, sliderText, type SliderRow } from './c02/ui';

export const meta: DemoMeta = { animated: false, aspect: 1.2, surface: 'plate' };

const WALK = 3;       // seconds of frames from the start to the optimum in deterministic mode; a presentation choice

interface Play {
  level: Level;
  theory: Theory;
  axes: readonly [number, number];
  model: EffectModel;
  history: number[][];
  opt: Optimum;
  /** the first commit: the result that counts */
  record: { P: Surd; stars: Stars; effect: Effect } | null;
}

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const T = ctx.text;
  const K = ctx.symbol('sym.state-space'), E = ctx.symbol('sym.effect-algebra'), U = ctx.symbol('sym.unit-effect');
  const root = makeRoot(stage, ctx, T('Spiel: Unterscheiden', 'Game: Distinguish'));

  // every level is checked against the kernel before the game starts: states in K, optimal
  // effects in E(K) and extreme, stored optimum equal to the computed one
  for (const l of LEVELS) verifyLevel(l);
  const makePlay = (level: Level): Play => {
    const axes = sectionFor(level.theory, level.problem.omega1, level.problem.omega2);
    return { level, theory: level.theory, axes, model: makeEffectModel(level.theory, axes), history: [], opt: optimum(level.theory, level.problem), record: null };
  };
  let plays: Play[] = LEVELS.map(makePlay);
  /** extreme effects the player has reached, per theory (keys: JSON of the effect; qubit: 'sharp' for any (1/2, n/2)) */
  let found = new Map<string, Set<string>>();
  const want = Number(ctx.params.level ?? '1');
  let cur = Number.isInteger(want) && want >= 1 && want <= plays.length ? want - 1 : 0;

  const extremeKey = (t: Theory, e: Effect): string => (t.kind === 'ball' && e.kind === 'ball' && e.w.some((x) => x.n !== 0n) ? 'sharp' : JSON.stringify(effectToJSON(e)));
  const foundSet = (t: Theory): Set<string> => { let s = found.get(t.id); if (!s) { s = new Set(); found.set(t.id, s); } return s; };
  const noteExtreme = (p: Play): void => { const e = p.model.effect(); if (isExtremeEffect(p.theory, e)) foundSet(p.theory).add(extremeKey(p.theory, e)); };
  /** every change of the effect by the player goes through here: undo history and discoveries */
  const act = (fn: (p: Play) => void): void => {
    const p = plays[cur];
    const before = p.model.state();
    fn(p);
    const after = p.model.state();
    if (after.some((v, i) => v !== before[i])) { p.history.push(before); noteExtreme(p); }
    if (!ctx.deterministic) paint(0);      // the controls show the new value at once
    ctx.invalidate();
  };
  const undo = (): void => { const p = plays[cur]; const s = p.history.pop(); if (s) { p.model.restore(s); ctx.invalidate(); } };
  const recordFor = (p: Play): NonNullable<Play['record']> => {
    const e = p.model.effect();
    const P = score(p.theory, e, p.level.problem);
    return { P, stars: stars(P, p.level.pOpt), effect: e };
  };
  const commit = (): void => {
    const p = plays[cur];
    if (p.record) return;
    p.record = recordFor(p);
    const P = p.record.P;
    ctx.announce(T(`Festgelegt. Erfolgswahrscheinlichkeit ${fmtSurd(P)}. Bewiesenes Optimum ${fmtSurd(p.level.pOpt)}. ${p.record.stars} von 3 Sternen.`,
      `Committed. Success probability ${fmtSurd(P)}. Proven optimum ${fmtSurd(p.level.pOpt)}. ${p.record.stars} of 3 stars.`));
    ctx.invalidate();
  };
  const go = (i: number): void => { if (i >= 0 && i < plays.length) { cur = i; rebuildSliders(); ctx.invalidate(); } };
  /** the extreme effects of the current theory that can be jumped to: the ones found, and after the commit the optimal ones */
  const reachable = (p: Play): Effect[] => {
    const out: Effect[] = [];
    const fs = foundSet(p.theory);
    const add = (e: Effect) => { if (!out.some((x) => effectsEqual(x, e))) out.push(e); };
    if (p.theory.kind === 'polytope') { for (const f of p.theory.effectVertices) { const e: Effect = { kind: 'vector', f }; if (fs.has(extremeKey(p.theory, e))) add(e); } }
    else {
      for (const e of [zeroEffect(p.theory), unitEffect(p.theory)]) if (fs.has(extremeKey(p.theory, e))) add(e);
      if (fs.has('sharp')) { const bm = p.model as BallModel; const d = DIRECTIONS[bm.dir]; add(sharpEffect(bm.embed({ n: BigInt(d[0]), d: 1n }, { n: BigInt(d[1]), d: 1n }))); }
    }
    if (p.record) for (const e of p.level.optimal) add(e);
    return out;
  };
  const snapNearest = (): void => act((p) => {
    const here = p.model.view();
    let best: Effect | null = null, bd = Infinity;
    for (const e of reachable(p)) {
      const v = effectToView(p.theory, e, p.axes);
      const d = Math.hypot(v.b - here.b, v.a[0] - here.a[0], v.a[1] - here.a[1]);
      if (d > 1e-9 && d < bd) { bd = d; best = e; }
    }
    if (best) p.model.setEffect(best);
  });

  // ── page ─────────────────────────────────────────────────────────────────────────────
  const head = h('div', { class: 'c02-head' });
  const title = h('h3', { class: 'c02-title', 'data-c02': 'title' });
  const levelBar = h('div', { class: 'c02-levels', role: 'group', 'aria-label': T('Stufen', 'levels') });
  const levelButtons = plays.map((_, i) => {
    const b = h('button', { type: 'button', 'data-level': String(i + 1) });
    b.addEventListener('click', () => go(i));
    levelBar.append(b);
    return b;
  });
  head.append(title, levelBar);
  const task = h('p', { 'data-c02': 'task' });

  const figs = h('div', { class: 'c02-figs' });
  const figK = h('figure', { class: 'c02-fig' }), figE = h('figure', { class: 'c02-fig' });
  const capK = h('figcaption'), capE = h('figcaption');
  figs.append(figK, figE);
  const onDrag = (handle: string, x: number, y: number) => act((p) => { dragEffect(p.model, handle, x, y); });
  const kPanel = new KPanel(figK, onDrag, T('Zustandsraum K mit den beiden Präparationen und dem Effekt f', 'state space K with the two preparations and the effect f'));
  const ePanel = new EPanel(figE, onDrag, T('Effektmenge E(K) mit dem Effekt f als Punkt', 'effect set E(K) with the effect f as a point'));
  figK.append(capK); figE.append(capE);

  const cols = h('div', { class: 'c02-cols' });
  const colL = h('div', { class: 'c02-col' }), colR = h('div', { class: 'c02-col', 'data-c02': 'result' });
  cols.append(colL, colR);
  colL.append(h('h3', {}, `${T('Deine Messung', 'Your measurement')} {${mi('f')}, ${U.mathml} − ${mi('f')}}`));
  const sliderHost = h('div');
  colL.append(sliderHost);
  const out = readouts(colL, [
    { key: 'e', labelHtml: `${mi('f')} =` },
    { key: 'e1', labelHtml: `${mi('f')}(${mi('x', '1')}) =` },
    { key: 'e2', labelHtml: `${mi('f')}(${mi('x', '2')}) =` },
    { key: 'P', labelHtml: `${mi('P')}(${mi('f')}) =`, strong: true },
  ]);
  const formula = h('p', { class: 'c02-muted' }, `${mi('P')}(${mi('f')}) = ${mi('λ', '1')} ${mi('f')}(${mi('x', '1')}) + ${mi('λ', '2')} (1 − ${mi('f')}(${mi('x', '2')})): ${T('die Wahrscheinlichkeit, richtig zu raten.', 'the probability of guessing right.')}`);
  colL.append(formula);
  const buttons = h('div', { class: 'c02-row' });
  const bCommit = h('button', { type: 'button', class: 'c02-primary', 'data-c02': 'commit' });
  const bUndo = h('button', { type: 'button', 'data-c02': 'undo' }, T('Schritt zurück', 'Undo step'));
  const bSnap = h('button', { type: 'button', 'data-c02': 'snap' }, T('Zum nächsten gefundenen Extremaleffekt', 'To the nearest extreme effect found'));
  bCommit.addEventListener('click', commit); bUndo.addEventListener('click', undo); bSnap.addEventListener('click', snapNearest);
  buttons.append(bCommit, bUndo, bSnap);
  colL.append(buttons);

  const rules = h('details', { class: 'c02-box', 'data-c02': 'rules' });
  const reset = h('button', { type: 'button', 'data-c02': 'reset' }, T('Fortschritt löschen', 'Clear progress'));
  reset.addEventListener('click', () => { plays = LEVELS.map(makePlay); found = new Map(); rebuildSliders(); ctx.invalidate(); });
  rules.innerHTML = `<summary>${T('Regeln, Wertung, Bedienung', 'Rules, reward, controls')}</summary><ul>`
    + `<li><b>${T('Aufgabe', 'Task')}.</b> ${T('Eine Stufe gibt zwei Präparationen', 'A level gives two preparations')} ${mi('x', '1')}, ${mi('x', '2')} ${T('mit Wahrscheinlichkeiten', 'with probabilities')} ${mi('λ', '1')}, ${mi('λ', '2')}. ${T('Du wählst einen Effekt', 'You choose an effect')} ${mi('f')} ${T('in', 'in')} ${E.mathml}. ${T('Gemessen wird', 'The measurement is')} {${mi('f')}, ${U.mathml} − ${mi('f')}}; ${T('beim Ausgang', 'on the outcome')} ${mi('f')} ${T('wird', 'the guess is')} ${mi('x', '1')}${T(' geraten, sonst', ', otherwise')} ${mi('x', '2')}.</li>`
    + `<li><b>${T('Physikalische Größe', 'Physical quantity')}.</b> ${T('Die Erfolgswahrscheinlichkeit', 'The success probability')} ${mi('P')}(${mi('f')}) = ${mi('λ', '1')} ${mi('f')}(${mi('x', '1')}) + ${mi('λ', '2')} (1 − ${mi('f')}(${mi('x', '2')})). ${T('Sie wird exakt angezeigt.', 'It is shown exactly.')}</li>`
    + `<li><b>${T('Bewiesenes Optimum', 'Proven optimum')}.</b> ${mi('P', 'opt')} ${T('ist das Maximum von', 'is the maximum of')} ${mi('P')} ${T('über', 'over')} ${E.mathml}. ${T('Es wird von einem Extremaleffekt angenommen: bei Bit und Quadrat-Bit genügt der Vergleich der endlich vielen Extremaleffekte, beim Qubit gilt', 'It is attained at an extreme effect: for the bit and the square bit it suffices to compare the finitely many extreme effects, for the qubit')} ${mi('P', 'opt')} = (1 + max(|${mi('λ', '1')} − ${mi('λ', '2')}|, |${mi('λ', '1')}${mi('x', '1')} − ${mi('λ', '2')}${mi('x', '2')}|))/2. ${T('Es wird erst nach dem Festlegen gezeigt, mit den Werten aller Kandidaten.', 'It is shown only after the commit, with the values of all candidates.')}</li>`
    + `<li><b>${T('Wertung', 'Reward')}.</b> ${T('Drei Sterne für', 'Three stars for')} ${mi('P')} = ${mi('P', 'opt')} ${T('(exakter Vergleich), zwei für', '(exact comparison), two for')} ${mi('P', 'opt')} − ${mi('P')} ≤ ${fmtRat(TWO_STAR_GAP)}, ${T('einer für', 'one for')} ${mi('P', 'opt')} − ${mi('P')} ≤ ${fmtRat(ONE_STAR_GAP)}. <span data-c02="reward-status">${T(`Die Sterne und die Schwellen ${fmtRat(TWO_STAR_GAP)} und ${fmtRat(ONE_STAR_GAP)} sind eine Entwurfsentscheidung, ungeprüft, keine Physik.`, `The stars and the thresholds ${fmtRat(TWO_STAR_GAP)} and ${fmtRat(ONE_STAR_GAP)} are a design choice, unvalidated, not physics.`)}</span> ${T('Gewertet wird das erste Festlegen je Stufe; danach kannst du mit sichtbarer Lösung weiter probieren.', 'The first commit per level counts; afterwards you can go on trying with the solution visible.')}</li>`
    + `<li><b>${T('Bedienung', 'Controls')}.</b> ${T('Ziehe die Raute: links den Anstieg von', 'Drag the diamond: on the left the slope of')} ${mi('f')}${T(', rechts seine Höhe', ', on the right its height')} ${mi('b')} ${T('(beim Bit beides). Tasten auf der Figur', '(for the bit both). Keys on the figure')}: <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> ${T('ein Rasterschritt', 'one lattice step')}, <kbd>+</kbd> <kbd>−</kbd> ${T('ändern', 'change')} ${mi('b')}, <kbd>X</kbd> ${T('springt zum nächsten schon gefundenen Extremaleffekt', 'jumps to the nearest extreme effect already found')}, <kbd>Z</kbd> ${T('nimmt einen Schritt zurück', 'undoes a step')}, <kbd>Enter</kbd> ${T('legt fest', 'commits')}, <kbd>N</kbd> ${T('nächste Stufe', 'next level')}.</li>`
    + `<li><b>${T('Raster', 'Lattice')}.</b> ${T(`Die Regler rasten in Schritten von 1/${GRID}; Qubit-Richtungen sind ganzzahlige Vektoren mit Einträgen bis ${NDIR}. Das ist eine Entwurfsentscheidung, damit exakt gerechnet wird: angezeigt werden exakte Brüche und symbolische Wurzeln, daneben ausdrücklich mit ≈ markierte dezimale Näherungen; die optimalen Effekte der Stufen liegen auf dem Raster.`, `The controls move in steps of 1/${GRID}; qubit directions are integer vectors with entries up to ${NDIR}. This is a design choice that keeps the arithmetic exact: what is shown are exact fractions and symbolic roots, together with decimal approximations explicitly marked by ≈; the optimal effects of the levels lie on the lattice.`)}</li>`
    + `<li><b>Qubit.</b> ${T('Gezeichnet ist der Schnitt der Zustandskugel des Qubits durch beide Zustände. Ein Anteil von', 'The picture is the section of the qubit state ball through both states. A part of')} ${mi('a')} ${T('senkrecht zum Schnitt ändert', 'perpendicular to the section changes neither')} ${mi('f')}(${mi('x', '1')}) ${T('und', 'nor')} ${mi('f')}(${mi('x', '2')})${T(' nicht, verbraucht aber von', ', but uses up some of')} |${mi('a')}| ≤ min(${mi('b')}, 1 − ${mi('b')}); ${T('er ist hier null.', 'here it is zero.')}</li>`
    + `<li><b>${T('Fortschritt', 'Progress')}.</b> ${T('Er steht nur im Speicher dieser Seite und ist nach dem Neuladen weg.', 'It is kept in the memory of this page only and is gone after a reload.')} <span data-slot="reset"></span></li>`
    + '</ul>';
  rules.querySelector('[data-slot="reset"]')!.append(reset);
  root.append(head, task, figs, cols, rules);

  let sliders: Array<{ key: string; row: SliderRow }> = [];
  function rebuildSliders(): void {
    sliderHost.textContent = '';
    const model = plays[cur].model;
    sliders = effectSliderSpecs(ctx, model).map((sp) => ({ key: sp.key, row: sliderRow(sliderHost, sp.labelHtml, sp.aria, (v) => act((p) => p.model.setSlider(sp.key, v))) }));
  }
  rebuildSliders();

  // TODO(harness): see c02.demo.explorer.ts (the arrow keys are read here, not by a "primary" slider)
  stage.addEventListener('keydown', (ev) => {
    if (ev.target !== stage) ev.stopImmediatePropagation();
    if (isControl(ev.target) || ctx.deterministic || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const handle = (ev.target as Element).closest?.('[data-handle]')?.getAttribute('data-handle') ?? 'effect';
    const k = keyAction(ev);
    if (k) act((p) => keyEffect(p.model, handle, k));
    else if (ev.key === 'Enter') commit();
    else if (ev.key === 'x' || ev.key === 'X') snapNearest();
    else if (ev.key === 'z' || ev.key === 'Z' || ev.key === 'Backspace') undo();
    else if (ev.key === 'n' || ev.key === 'N') go(cur + 1);
    else return;
    ev.preventDefault();
  });

  // ── texts ────────────────────────────────────────────────────────────────────────────
  const theoryName = (t: Theory) => ({ classical_bit: T('klassisches Bit', 'classical bit'), square_bit: T('Quadrat-Bit', 'square bit'), qubit_ball: 'Qubit' } as Record<string, string>)[t.id];
  /** the coordinates of an effect: (q0, q1) for the bit, (b; a) otherwise */
  const coords = (t: Theory, e: Effect): string => {
    if (e.kind === 'vector') return t.kind === 'polytope' && t.chart === 'probability' ? fmtVec(e.f) : `(${fmtRat(e.f[0])}; ${fmtRat(e.f[1])}, ${fmtRat(e.f[2])})`;
    if (e.w.every((x) => x.n === 0n)) return `(${fmtRat(e.b)}; 0)`;
    return `(${fmtRat(e.b)}; ${e.m === 1n ? '' : `\u221A${e.m} \u00B7 `}${fmtVec(e.w)})`;
  };
  const effectHtml = (t: Theory, e: Effect): string => (effectsEqual(e, unitEffect(t)) ? U.mathml : effectsEqual(e, zeroEffect(t)) ? '0' : coords(t, e));
  const lesson = (id: string, p: Play): string => {
    const sharp = p.opt.candidates.length > 2 ? fmtSurd(p.opt.candidates[2].P) : '';
    switch (id) {
      case 'B1': return T('Die beiden reinen Zustände des Bits sind sicher unterscheidbar: ein Extremaleffekt hat auf dem einen den Wert 1 und auf dem anderen den Wert 0.',
        'The two pure states of the bit are perfectly distinguishable: an extreme effect takes the value 1 on one and 0 on the other.');
      case 'B2': return T('Derselbe Extremaleffekt bleibt optimal, aber die beiden gemischten Zustände überlappen: mehr als 3/4 erreicht kein Effekt in E(K).',
        'The same extreme effect stays optimal, but the two mixed states overlap: no effect in E(K) achieves more than 3/4.');
      case 'S1': return T('Im Quadrat-Bit trennt ein Extremaleffekt die beiden Zustände sicher: seine Niveaulinien f = 0 und f = 1 sind zwei gegenüberliegende Kanten von K.',
        'In the square bit an extreme effect separates the two states perfectly: its level lines f = 0 and f = 1 are two opposite edges of K.');
      case 'S2': return T('Gleichstand: zwei Extremaleffekte erreichen das Optimum, und jede Mischung der beiden auch (die dicke Kante rechts). Ein Extremaleffekt nimmt das Optimum an; nicht jeder optimale Effekt ist extremal.',
        'A tie: two extreme effects attain the optimum, and so does every mixture of the two (the heavy edge on the right). Some extreme effect attains the optimum; not every optimal effect is extreme.');
      case 'Q1': return T('Zwei verschiedene reine Zustände, und doch ist das Optimum kleiner als 1: in der Kugel sind bei gleichen Gewichten nur gegenüberliegende reine Zustände sicher unterscheidbar. Der optimale Effekt zeigt entlang x₁ − x₂, nicht entlang x₁.',
        'Two different pure states, and yet the optimum is below 1: in the ball, with equal priors, only antipodal pure states are perfectly distinguishable. The optimal effect points along x₁ − x₂, not along x₁.');
      case 'Q2': return T(`Hier ist Raten optimal: der Einseffekt (immer x₁ raten) erreicht λ₁ = ${fmtRat(guessScore(p.level.problem))}; der beste Effekt mit zwei Niveaulinien am Rand der Kugel erreicht nur ${sharp}. Die Zustände sind verschieden, aber messen hilft hier nicht.`,
        `Here guessing is optimal: the unit effect (always guess x₁) achieves λ₁ = ${fmtRat(guessScore(p.level.problem))}; the best effect with two level lines touching the ball achieves only ${sharp}. The states differ, but measuring does not help here.`);
      default: return '';
    }
  };

  function resultHtml(p: Play): string {
    if (!p.record) {
      return `<h3>${T('Bewiesenes Optimum', 'Proven optimum')}</h3><p class="c02-muted">${T('Es wird gezeigt, sobald du festgelegt hast, zusammen mit dem Grund.', 'It is shown once you have committed, together with the reason.')}</p>`;
    }
    const r = p.record;
    const sameRoot = r.P.y.n === 0n || p.level.pOpt.y.n === 0n || r.P.m === p.level.pOpt.m;
    const gap = cmpSurd(r.P, p.level.pOpt) === 0 ? '0' : sameRoot ? fmtBoth(surdSub(p.level.pOpt, r.P), ctx.lang)
      : `≈ ${(surdToNumber(p.level.pOpt) - surdToNumber(r.P)).toLocaleString(ctx.lang, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
    let rows = '';
    for (const c of p.opt.candidates) {
      const best = cmpSurd(c.P, p.opt.pOpt) === 0;
      rows += `<tr${best ? ' class="c02-best"' : ''}><td>${effectHtml(p.theory, c.effect)}</td><td>${fmtBoth(c.P, ctx.lang)}</td><td>${best ? T('Optimum', 'optimum') : ''}</td></tr>`;
    }
    const why = p.opt.method === 'vertices'
      ? T(`Beweis: P ist affin in f, also wird das Maximum an einem Extremaleffekt angenommen. Das sind alle ${p.opt.candidates.length}:`, `Proof: P is affine in f, so the maximum is attained at an extreme effect. These are all ${p.opt.candidates.length}:`)
      : T(`Beweis: bei festem b ist der beste Vektor a parallel zu v = λ₁x₁ − λ₂x₂; übrig bleiben die Kandidaten 0, der Einseffekt und (1/2; v/(2|v|)). Hier ist λ₁ − λ₂ = ${fmtRat(p.opt.ball!.delta)} und |v| = ${fmtSurd(p.opt.ball!.L)}.`,
        `Proof: for fixed b the best vector a is parallel to v = λ₁x₁ − λ₂x₂; what remains are the candidates 0, the unit effect and (1/2; v/(2|v|)). Here λ₁ − λ₂ = ${fmtRat(p.opt.ball!.delta)} and |v| = ${fmtSurd(p.opt.ball!.L)}.`);
    return `<h3>${T('Bewiesenes Optimum', 'Proven optimum')}</h3>`
      + `<dl class="c02-read"><dt>${mi('P', 'opt')} =</dt><dd class="c02-key" data-c02="Popt" data-exact='${JSON.stringify(surdToJSON(p.level.pOpt))}'>${fmtBoth(p.level.pOpt, ctx.lang)}</dd>`
      + `<dt>${T('festgelegt', 'committed')}: ${mi('P')} =</dt><dd data-c02="Pcommitted" data-exact='${JSON.stringify(surdToJSON(r.P))}'>${fmtBoth(r.P, ctx.lang)}</dd>`
      + `<dt>${mi('P', 'opt')} − ${mi('P')} =</dt><dd data-c02="gap">${gap}</dd>`
      + `<dt>${T('Wertung', 'Reward')}</dt><dd data-c02="stars" data-stars="${r.stars}">${starsHtml(r.stars)} <span class="c02-muted">${T(`${r.stars} von 3 (Entwurfsentscheidung, siehe Regeln)`, `${r.stars} of 3 (a design choice, see the rules)`)}</span></dd></dl>`
      + `<p>${why}</p><table><thead><tr><th>${mi('f')}</th><th>${mi('P')}(${mi('f')})</th><th></th></tr></thead><tbody>${rows}</tbody></table>`
      + `<p>${lesson(p.level.id, p)}</p>`
      + `<p class="c02-muted" data-c02="derivation" title="${p.level.derivation}">${T(`Herleitung: evidence/derivations/c02/DERIVATION.md, Abschnitt 5.1, Zeile ${p.level.id}; Methode: Abschnitt ${p.opt.method === 'vertices' ? '4.3' : '4.4'}; Gegenprüfung: REVIEW.md, B3.`, `Derivation: evidence/derivations/c02/DERIVATION.md, section 5.1, row ${p.level.id}; method: section ${p.opt.method === 'vertices' ? '4.3' : '4.4'}; independent check: REVIEW.md, B3.`)}</p>`
      + `<div class="c02-row"><button type="button" data-c02="next"${cur + 1 < plays.length ? '' : ' disabled'}>${T('Nächste Stufe', 'Next level')}</button></div>`;
  }
  colR.addEventListener('click', (ev) => { if ((ev.target as Element).closest('[data-c02="next"]')) go(cur + 1); });

  let lastResult = '';
  function paint(frame: number): void {
    const p = plays[cur], t = p.theory, lv = p.level;
    if (ctx.deterministic) {
      // the walk: from (1/2; 0) to the first optimal extreme effect, committed at its end
      const tau = Math.min(1, frame / (WALK * ctx.fps));
      const target = effectToView(t, lv.optimal[0], p.axes);
      p.model.restore(makeEffectModel(t, p.axes).state());
      p.record = null;
      if (tau >= 1) { if (!p.model.setEffect(lv.optimal[0])) throw new Error(`level ${lv.id}: the optimal effect is not on the lattice of the controls`); p.record = recordFor(p); }
      else p.model.setNear(0.5 + tau * (target.b - 0.5), tau * target.a[0], tau * target.a[1]);
    }
    const e = p.model.effect();
    const view = p.model.view();
    const e1 = evaluate(t, e, lv.problem.omega1), e2 = evaluate(t, e, lv.problem.omega2);
    const P = score(t, e, lv.problem);
    if (cmpSurd(P, lv.pOpt) > 0) throw new Error(`level ${lv.id}: an effect of the controls scores above the proven optimum`);

    title.textContent = T(`Stufe ${cur + 1} von ${plays.length}: ${theoryName(t)}`, `Level ${cur + 1} of ${plays.length}: ${theoryName(t)}`);
    levelButtons.forEach((b, i) => {
      b.setAttribute('aria-current', String(i === cur));
      const rec = plays[i].record;
      const html = `<span>${i + 1}</span>${rec ? starsHtml(rec.stars) : ''}`;
      if (b.innerHTML !== html) b.innerHTML = html;
      b.setAttribute('aria-label', T(`Stufe ${i + 1}`, `Level ${i + 1}`) + (rec ? T(`, ${rec.stars} von 3 Sternen`, `, ${rec.stars} of 3 stars`) : ''));
    });
    const prior = (x: typeof lv.problem.pi1) => fmtRat(x);
    const taskHtml = `${T('Präpariert wird', 'The preparation is')} ${mi('x', '1')} = ${fmtVec(lv.problem.omega1)} ${T('mit Wahrscheinlichkeit', 'with probability')} ${mi('λ', '1')} = ${prior(lv.problem.pi1)}, `
      + `${T('sonst', 'otherwise')} ${mi('x', '2')} = ${fmtVec(lv.problem.omega2)} (${mi('λ', '2')} = ${prior(lv.problem.pi2)}). `
      + `${T('Wähle', 'Choose')} ${mi('f')} ${T('in', 'in')} ${E.mathml} ${T('so, dass', 'such that')} ${mi('P')}(${mi('f')}) ${T('möglichst groß wird, und lege fest.', 'is as large as possible, and commit.')}`;
    if (task.innerHTML !== taskHtml) { task.innerHTML = taskHtml; }

    for (const sl of sliders) { const d = p.model.sliders().find((x) => x.key === sl.key)!; sl.row.set({ ...d, text: sliderText(d) }); }
    setReadout(out.e, (p.model instanceof BitModel ? '(q₀, q₁) = ' : '(b; a) = ') + coords(t, e), effectToJSON(e));
    setReadout(out.e1, fmtBoth(e1, ctx.lang), surdToJSON(e1));
    setReadout(out.e2, fmtBoth(e2, ctx.lang), surdToJSON(e2));
    setReadout(out.P, fmtBoth(P, ctx.lang), surdToJSON(P));
    bCommit.textContent = p.record ? T('Festgelegt', 'Committed') : T('Festlegen', 'Commit');
    bCommit.disabled = p.record !== null;
    bUndo.disabled = p.history.length === 0;
    const here = p.model.view();
    bSnap.disabled = !reachable(p).some((x) => { const v = effectToView(t, x, p.axes); return Math.hypot(v.b - here.b, v.a[0] - here.a[0], v.a[1] - here.a[1]) > 1e-9; });
    const res = resultHtml(p);
    if (res !== lastResult) { colR.innerHTML = res; lastResult = res; }

    // pictures
    const committed = p.record !== null;
    const ax = t.kind === 'ball' ? [AXIS[p.axes[0]], AXIS[p.axes[1]]] : ['x', 'y'];
    const w1: Part[] = [m('x'), sub('1')], w2: Part[] = [m('x'), sub('2')];
    const optView = committed ? effectToView(t, lv.optimal[0], p.axes) : null;
    kPanel.draw({
      theory: t, effect: view, ghost: optView, live: !ctx.deterministic, axisNames: [[m('r'), sub(ax[0])], [m('r'), sub(ax[1])]], ends: ['(0, 1)', '(1, 0)'],
      states: [{ p: statePoint(t, lv.problem.omega1, p.axes), label: w1, style: 'filled' }, { p: statePoint(t, lv.problem.omega2, p.axes), label: w2, style: 'open' }],
      segment: null,
      aria: {
        a: T('Anstieg a des Effekts: Pfeiltasten verschieben ihn', 'slope a of the effect: the arrow keys move it'),
        q0: T('Wert q0 des Effekts über dem reinen Zustand (1, 0): Pfeil auf und ab', 'value q0 of the effect over the pure state (1, 0): arrow up and down'),
        q1: T('Wert q1 des Effekts über dem reinen Zustand (0, 1): Pfeil auf und ab', 'value q1 of the effect over the pure state (0, 1): arrow up and down'),
      },
    });
    const fs = foundSet(t);
    const isOpt = (x: Effect) => committed && lv.optimal.some((o) => effectsEqual(o, x));
    const marks: ExtremeMark[] = [];
    const picks: Effect[] = [];
    const push = (x: Effect, known: boolean) => {
      marks.push({ ...effectToView(t, x, p.axes), state: isOpt(x) ? 'optimal' : known ? 'found' : 'plain', id: picks.length });
      picks.push(x);
    };
    if (t.kind === 'polytope') for (const f of t.effectVertices) { const x: Effect = { kind: 'vector', f }; push(x, fs.has(extremeKey(t, x))); }
    else {
      for (const x of [zeroEffect(t), unitEffect(t)]) push(x, fs.has(extremeKey(t, x)));
      if (committed) for (const o of lv.optimal) if (!picks.some((x) => effectsEqual(x, o))) push(o, true);
    }
    const optMarks = marks.filter((x) => x.state === 'optimal');
    const side: [Part[], Part[]] = t.kind === 'polytope' && t.chart === 'probability' ? [['(0, 1)'], ['(1, 0)']] : [[m('a'), sub(ax[0])], [m('a'), sub(ax[1])]];
    ePanel.draw({
      theory: t, effect: view, extremes: marks, optimalEdge: t.kind === 'polytope' && optMarks.length === 2 ? [optMarks[0], optMarks[1]] : null,
      live: !ctx.deterministic, unitLabel: UNIT_LABEL, sideLabels: side,
      aria: T('Effekt f in E(K): Pfeil auf und ab ändert b', 'effect f in E(K): arrow up and down changes b'),
    }, (id) => act((q) => { q.model.setEffect(picks[id]); }));
    const star = committed ? ` ${T('Dünn durchgezogen: der optimale Effekt', 'Thin solid: the optimal effect')} ${mi('f')}*.` : '';
    capK.innerHTML = t.kind === 'polytope' && t.chart === 'probability'
      ? `${K.mathml}: ${T('die Strecke unten. Gestrichelt der Graph von', 'the segment below. Dashed, the graph of')} ${mi('f')}; ${T('die Punkte darauf sind', 'the points on it are')} ${mi('f')}(${mi('x', '1')}), ${mi('f')}(${mi('x', '2')}).${star}`
      : `${K.mathml}${t.kind === 'ball' ? T(`: Schnitt der Zustandskugel des Qubits, (${ax[0]}, ${ax[1]})-Ebene`, `: section of the qubit state ball, (${ax[0]}, ${ax[1]}) plane`) : ''}. ${T('Gestrichelt: Niveaulinien', 'Dashed: level lines')} ${mi('f')} = 0, 1/4, 1/2, 3/4, 1.${star}`;
    capE.innerHTML = `${E.mathml} ${T('zwischen 0 und', 'between 0 and')} ${U.mathml}; ${T('Höhe', 'height')} ${mi('b')}. `
      + (committed ? T('Umringt: optimale Extremaleffekte.', 'Ringed: optimal extreme effects.') : T('Gefüllte Punkte: Extremaleffekte, die du schon erreicht hast.', 'Filled dots: extreme effects you have already reached.'));
    root.dataset.level = lv.id;
    root.dataset.committed = String(committed);
    root.dataset.rev = String(Number(root.dataset.rev ?? '0') + 1);
  }

  return {
    render(frame) { paint(frame); },
    destroy() { root.remove(); },
    info() {
      const p = plays[cur];
      return { level: p.level.id, theory: p.theory.id, P: fmtSurd(score(p.theory, p.model.effect(), p.level.problem)), committed: p.record !== null };
    },
  };
}
