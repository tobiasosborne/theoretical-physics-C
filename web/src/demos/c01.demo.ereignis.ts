// c01.demo.ereignis: outcome sets and events (figure c01.fig.ereignis, definition D53: the
// subsets S of the outcome set X are the events). (a) One die, X = {1, ..., 6}: the reader
// clicks cells to put them into S or take them out; default S = {2, 4, 6}, "the number is
// even" (c01.ex.wuerfel). (b) Two dice (exercise c01.exc.zwei-wuerfel): X is the set of the
// 36 pairs (x1, x2); the slider s sets S = {x1 + x2 = s} (default 7, as in the figure), the
// button "Pasch" sets S = {x1 = x2}, and clicking or dragging over the points builds any
// other event. Members of S are marked by squares, as in the figure.
//
// At this point of the chapter there are no probabilities: the demo shows sets and their
// sizes only. Every set and size shown is an input or comes from web/src/kernels/prob.ts
// (diceSumEvent, diceDoublesEvent). Parameters: s = 2..12, mode = sum | pasch.
//
// Keys on the stage: the arrows move a cursor over the 36 points of (b), Enter or Space puts
// the point into S or takes it out.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { diceDoublesEvent, diceSumEvent } from '../kernels/prob';
import { Plate, it, note, pointer } from './c01/kit';
import { rich, type Seg } from './c01/segments';

export const meta: DemoMeta = { animated: true, aspect: 1.7, surface: 'plate' };

const STEP = 0.7;   // seconds per step of the sum while the clock runs: a presentation choice

type Mode = 'sum' | 'pasch' | 'custom';
type Target = { panel: 'a'; i: number } | { panel: 'b'; x1: number; x2: number } | null;
const code = (x1: number, x2: number) => 10 * x1 + x2;

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const plate = new Plate(stage, ctx);
  const T = ctx.text;
  const X = ctx.symbol('sym.outcome-set');

  // ── state ─────────────────────────────────────────────────────
  const s0 = Number(ctx.params.s ?? '7');
  let s = Number.isInteger(s0) && s0 >= 2 && s0 <= 12 ? s0 : 7;
  let mode: Mode = ctx.params.mode === 'pasch' ? 'pasch' : 'sum';
  // play sweeps s = 2..12 and back: u runs round 0..19 and s = 2 + (u <= 10 ? u : 20 - u)
  let u = s - 2;
  let lastStep = 0;                                   // clock step of the last render
  const sOf = (v: number) => 2 + (v <= 10 ? v : 20 - v);
  let one = new Set<number>([2, 4, 6]);               // S for one die (faces 1..6)
  let two = new Set<number>();                        // S for two dice, codes 10 x1 + x2 (mode custom)
  let hover: Target = null;
  let cursor = { x1: 1, x2: 6 };
  let focused = false;
  let paintTo = true;                                  // what a drag over points sets them to
  let geom = { ax: 0, ay: 0, cell: 0, gL: 0, gB: 0, g: 0 };

  const kernelEvent = (): Array<[number, number]> => (mode === 'pasch' ? diceDoublesEvent() : diceSumEvent(s));
  const twoSet = (): Set<number> => (mode === 'custom' ? two : new Set(kernelEvent().map(([a, b]) => code(a, b))));
  const twoSize = (): number => (mode === 'custom' ? two.size : kernelEvent().length);
  const setOne = (i: number, on: boolean) => { const n = new Set(one); if (on) n.add(i); else n.delete(i); one = n; marks(); };
  const setTwo = (x1: number, x2: number, on: boolean) => {
    const n = new Set(twoSet());
    if (on) n.add(code(x1, x2)); else n.delete(code(x1, x2));
    two = n; mode = 'custom';
  };

  // ── controls ──────────────────────────────────────────────────
  const faceButtons = [1, 2, 3, 4, 5, 6].map((i) => {
    const b = ctx.ui.button(String(i), () => { setOne(i, !one.has(i)); say(); });
    b.setAttribute('aria-label', T(`Augenzahl ${i} in S`, `number ${i} in S`));
    return b;
  });
  const marks = () => faceButtons.forEach((b, k) => {
    const on = one.has(k + 1);
    b.setAttribute('aria-pressed', String(on));
    b.classList.toggle('c01-pressed', on);
    b.textContent = `${on ? '■' : '□'} ${k + 1}`;
  });
  marks();
  const slider = ctx.ui.slider({
    label: T('Augensumme s: S ist das Ereignis x1 + x2 = s', 'sum s: S is the event x1 + x2 = s'),
    labelHtml: '<math><msub><mi>x</mi><mn>1</mn></msub><mo>+</mo><msub><mi>x</mi><mn>2</mn></msub><mo>=</mo></math>',
    min: 2, max: 12, step: 1, value: s, primary: true,
    onInput: (v) => { u = u > 10 ? (20 - (v - 2)) % 20 : v - 2; s = v; mode = 'sum'; say(); },
  });
  ctx.ui.button(T('Pasch', 'doubles'), () => { mode = 'pasch'; say(); });
  ctx.ui.button(T('S leeren', 'empty S'), () => { two = new Set(); mode = 'custom'; say(); });
  const outA = ctx.ui.readout(T('Ereignis S beim Würfel', 'event S for one die'), T('(a)', '(a)'));
  const outB = ctx.ui.readout(T('Anzahl der Paare in S bei zwei Würfeln', 'number of pairs in S for two dice'), T('(b)', '(b)'));
  const caption = note(ctx);
  caption.innerHTML = T(
    'Ein Ereignis ist eine Teilmenge der Ergebnismenge. Klicken Sie Felder oder Punkte an, um sie in <math><mi>S</mi></math> aufzunehmen oder herauszunehmen; über die Punkte darf man auch ziehen. Tasten auf dem Bild: Pfeile ändern die Augensumme, Umschalt+Pfeile bewegen den Rahmen in (b), Eingabe oder Leertaste schaltet den Punkt um. Abspielen lässt <math><mi>s</mi></math> von 2 bis 12 und zurück laufen.',
    'An event is a subset of the outcome set. Click cells or points to put them into <math><mi>S</mi></math> or take them out; you may also drag over the points. Keys on the picture: the arrows change the sum, Shift+arrows move the frame in (b), Enter or Space toggles the point. Play sweeps <math><mi>s</mi></math> from 2 to 12 and back.');

  const setText = (xs: number[]) => (xs.length === 0 ? '∅' : `{${xs.join(', ')}}`);
  const say = () => {
    const xs = [...one].sort((p, q) => p - q);
    ctx.announce(T(`Ein Würfel: S = ${setText(xs)}. Zwei Würfel: ${twoSize()} von 36 Paaren in S.`,
      `One die: S = ${setText(xs)}. Two dice: ${twoSize()} of 36 pairs in S.`));
  };

  // ── pointer ───────────────────────────────────────────────────
  const targetAt = (x: number, y: number): Target => {
    const { ax, ay, cell, gL, gB, g } = geom;
    if (y >= ay && y <= ay + cell && x >= ax && x <= ax + 6 * cell) return { panel: 'a', i: Math.min(5, Math.floor((x - ax) / cell)) + 1 };
    const x1 = Math.round((x - gL) / g + 0.5), x2 = Math.round((gB - y) / g + 0.5);
    if (x1 >= 1 && x1 <= 6 && x2 >= 1 && x2 <= 6) return { panel: 'b', x1, x2 };
    return null;
  };
  const same = (p: Target, q: Target) => JSON.stringify(p) === JSON.stringify(q);
  let lastPainted: Target = null;
  const dragging = pointer(plate.svg, {
    down: (x, y) => {
      const t = targetAt(x, y);
      if (!t) return false;
      if (t.panel === 'a') { paintTo = !one.has(t.i); setOne(t.i, paintTo); }
      else { paintTo = !twoSet().has(code(t.x1, t.x2)); setTwo(t.x1, t.x2, paintTo); cursor = { x1: t.x1, x2: t.x2 }; }
      lastPainted = t; hover = t;
      ctx.invalidate();
      return true;
    },
    move: (x, y) => {
      const t = targetAt(x, y);
      if (!t || same(t, lastPainted) || t.panel !== lastPainted?.panel) return;
      if (t.panel === 'a') setOne(t.i, paintTo); else setTwo(t.x1, t.x2, paintTo);
      lastPainted = t; hover = t;
      ctx.invalidate();
    },
    up: () => { lastPainted = null; say(); ctx.invalidate(); },
    hover: (x, y) => { const t = targetAt(x, y); if (!same(t, hover)) { hover = t; ctx.invalidate(); } },
    leave: () => { if (hover) { hover = null; ctx.invalidate(); } },
  });
  stage.addEventListener('focus', () => { focused = true; ctx.invalidate(); });
  stage.addEventListener('blur', () => { focused = false; ctx.invalidate(); });
  stage.addEventListener('keydown', (ev) => {
    const d: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    // plain arrows move the sum slider (the harness's primary control); with Shift they move the frame in (b)
    if (d[ev.key] && ev.shiftKey) {
      cursor = { x1: Math.min(6, Math.max(1, cursor.x1 + d[ev.key][0])), x2: Math.min(6, Math.max(1, cursor.x2 + d[ev.key][1])) };
      ctx.announce(`(${cursor.x1}, ${cursor.x2}), ${twoSet().has(code(cursor.x1, cursor.x2)) ? T('in S', 'in S') : T('nicht in S', 'not in S')}`);
    } else if (ev.key === 'Enter' || ev.key === ' ') {
      const on = !twoSet().has(code(cursor.x1, cursor.x2));
      setTwo(cursor.x1, cursor.x2, on);
      say();
    } else return;
    ev.preventDefault();
    ctx.invalidate();
  });

  // ── drawing ───────────────────────────────────────────────────
  const paint = (ease: boolean) => {
    const fs = plate.begin(ease);
    const k = ctx.tokens;
    const { W, H } = plate;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), rule = k.color('plate-rule'), state = k.color('state'), bg = k.color('plate');

    // (a) one die
    const cell = Math.min((W * 0.43 - 1.6 * fs) / 6, 3.3 * fs);
    const ax = 0.9 * fs + Math.max(0, (W * 0.43 - 1.6 * fs - 6 * cell) / 2), ay = H * 0.42 - cell / 2;
    const S1 = [...one].sort((p, q) => p - q);
    for (let i = 1; i <= 6; i++) {
      const x = ax + (i - 1) * cell;
      const inS = one.has(i);
      const hov = hover?.panel === 'a' && hover.i === i;
      const hatch = plate.rect(`a-hatch-${i}`, x, ay, cell, cell, { fill: plate.hatchFill }, 'data');
      hatch.style.opacity = inS ? '1' : '0';
      plate.rect(`a-cell-${i}`, x, ay, cell, cell, { fill: 'none', stroke: ink, 'stroke-width': k.stroke(hov ? 'state' : 'thin') }, 'marks');
      plate.rect(`a-lbg-${i}`, x + cell / 2 - 0.5 * fs, ay + cell / 2 - 0.62 * fs, fs, 1.24 * fs, { fill: bg }, 'marks', false);
      plate.text(`a-lab-${i}`, x + cell / 2, ay + cell / 2, String(i), { baseline: 'middle', weight: inS ? '600' : 'normal' });
      plate.rect(`a-hit-${i}`, x, ay, cell, cell, { fill: 'transparent', class: 'c01-hit' }, 'handles', false);
    }
    const acx = ax + 3 * cell;
    plate.text('a-X', acx, ay - 0.8 * fs, `${it(X.unicode)} = {1, …, 6}`, { math: true });
    // a bracket under the members of S, from the first to the last
    if (S1.length > 0) {
      const bx0 = ax + (S1[0] - 1) * cell + 0.5 * cell, bx1 = ax + (S1[S1.length - 1] - 1) * cell + 0.5 * cell;
      const by = ay + cell + 0.35 * fs;
      plate.path('a-bracket', [[bx0, by], [bx0, by + 0.45 * fs], [bx1, by + 0.45 * fs], [bx1, by]], { stroke: muted, 'stroke-width': k.stroke('thin') }, 'grid');
      for (const i of S1) plate.circle(`a-tick-${i}`, ax + (i - 0.5) * cell, by, Math.max(1.4, 0.12 * fs), { fill: muted }, 'grid');
    }
    plate.text('a-S', acx, ay + cell + 2.3 * fs, `${it('S')} = ${setText(S1)}`, { math: true });
    const named = S1.join() === '2,4,6' ? T('„die Augenzahl ist gerade“', '“the number is even”')
      : S1.length === 6 ? `${it('S')} = ${it(X.unicode)}` : S1.length === 0 ? T('das leere Ereignis', 'the empty event') : '';
    plate.text('a-named', acx, ay + cell + 3.6 * fs, named, { fill: muted, size: fs * 0.95, math: S1.length === 6 });
    plate.text('a-size', acx, ay + cell + 4.9 * fs, `|${it('S')}| = ${S1.length}`, { math: true });
    plate.text('a-title', acx, H - 0.6 * fs, T('(a) ein Würfel', '(a) one die'), { fill: muted });

    // (b) two dice: points (x1, x2), x1 to the right, x2 up
    const gL = W * 0.5 + 2.2 * fs, gB = H - 3.1 * fs;
    const g = Math.min((W - gL - 0.9 * fs) / 6.15, (gB - 3.2 * fs) / 6.2);
    geom = { ax, ay, cell, gL, gB, g };
    const PX = (x1: number) => gL + (x1 - 0.5) * g, PY = (x2: number) => gB - (x2 - 0.5) * g;
    const set2 = twoSet();
    const hb = hover?.panel === 'b' ? hover : null;
    // guide lines of the hovered point to its two coordinates
    if (hb) {
      plate.line('b-gx', PX(hb.x1), PY(hb.x2), PX(hb.x1), gB + 0.1 * g, rule, k.stroke('regular'), {}, 'back', false);
      plate.line('b-gy', gL - 0.35 * fs, PY(hb.x2), PX(hb.x1), PY(hb.x2), rule, k.stroke('regular'), {}, 'back', false);
    }
    for (let x = 1; x <= 6; x++) {
      plate.text(`b-x1-${x}`, PX(x), gB + 0.95 * fs, String(x), { weight: hb?.x1 === x ? '600' : 'normal', baseline: 'middle' });
      plate.text(`b-x2-${x}`, gL - 0.9 * fs, PY(x), String(x), { weight: hb?.x2 === x ? '600' : 'normal', baseline: 'middle', anchor: 'end' });
    }
    plate.text('b-x1-name', PX(6) + 0.55 * g, gB + 0.95 * fs, `${it('x')}₁`, { math: true, anchor: 'start', baseline: 'middle' });
    plate.text('b-x2-name', gL - 0.9 * fs, PY(6) - 0.75 * g, `${it('x')}₂`, { math: true, anchor: 'end', baseline: 'middle' });

    // the line x1 + x2 = s (or x1 = x2) through the members of a named event
    const ext = 0.42;
    let d0: [number, number], d1: [number, number];
    if (mode === 'pasch') { d0 = [1 - ext, 1 - ext]; d1 = [6 + ext, 6 + ext]; }
    else { const lo = Math.max(1, s - 6), hi = Math.min(6, s - 1); d0 = [lo - ext, s - lo + ext]; d1 = [hi + ext, s - hi - ext]; }
    const diag = plate.path('b-diag', [[PX(d0[0]), PY(d0[1])], [PX(d1[0]), PY(d1[1])]], { stroke: muted, 'stroke-width': k.stroke('thin'), 'stroke-dasharray': k.dash('effect').join(' ') }, 'grid');
    diag.style.opacity = mode === 'custom' ? '0' : '1';

    const half = 0.24 * g;
    if (mode === 'custom') {
      for (const c of set2) {
        const x1 = Math.floor(c / 10), x2 = c % 10;
        plate.rect(`b-sq-${c}`, PX(x1) - half, PY(x2) - half, 2 * half, 2 * half, { fill: bg, stroke: state, 'stroke-width': k.stroke('state') }, 'data', false);
      }
    } else {
      // six squares, one per column x1: when s changes, each slides along its column
      for (let x1 = 1; x1 <= 6; x1++) {
        const x2raw = mode === 'pasch' ? x1 : s - x1;
        const x2 = Math.min(6, Math.max(1, x2raw));
        const sq = plate.rect(`b-slot-${x1}`, PX(x1) - half, PY(x2) - half, 2 * half, 2 * half, { fill: bg, stroke: state, 'stroke-width': k.stroke('state') }, 'data');
        sq.style.opacity = x2raw === x2 ? '1' : '0';
      }
    }
    for (let x1 = 1; x1 <= 6; x1++) for (let x2 = 1; x2 <= 6; x2++) {
      plate.circle(`b-pt-${x1}${x2}`, PX(x1), PY(x2), Math.max(1.5, 0.1 * fs) * (set2.has(code(x1, x2)) ? 1.15 : 1), { fill: ink }, 'marks', false);
    }
    if (focused) plate.rect('b-cursor', PX(cursor.x1) - 0.42 * g, PY(cursor.x2) - 0.42 * g, 0.84 * g, 0.84 * g, { fill: 'none', stroke: ink, 'stroke-width': k.stroke('regular'), 'stroke-dasharray': '2 2', rx: 2 }, 'handles');
    plate.rect('b-hit', PX(1) - 0.5 * g, PY(6) - 0.5 * g, 6 * g, 6 * g, { fill: 'transparent', class: 'c01-hit' }, 'handles', false);

    const bcx = PX(3.5);
    const head: Seg[] = mode === 'sum' ? [['m', it(`S: x₁ + x₂ = ${s}`)]] : mode === 'pasch' ? [['m', it('S: x₁ = x₂')]]
      : [['m', it('S')], ['t', T(': eigene Auswahl', ': chosen by hand')]];
    rich(plate, ctx, 'b-head', bcx, 1.25 * fs, head);
    rich(plate, ctx, 'b-title', bcx, H - 0.6 * fs, [['t', T('(b) zwei Würfel: |', '(b) two dice: |')], ['m', it(X.unicode)], ['t', '| = 36, |'], ['m', it('S')], ['t', `| = ${set2.size}`]], { fill: muted });

    if (hover?.panel === 'a') {
      plate.tip(ax + (hover.i - 0.5) * cell, ay, [`${hover.i} ${one.has(hover.i) ? '∈' : '∉'} S`]);
    } else if (hb) {
      plate.tip(PX(hb.x1), PY(hb.x2), [`(x₁, x₂) = (${hb.x1}, ${hb.x2})`, `x₁ + x₂ = ${hb.x1 + hb.x2}`, set2.has(code(hb.x1, hb.x2)) ? T('in S', 'in S') : T('nicht in S', 'not in S')]);
    }
    plate.end();

    outA.set(`S = ${setText(S1)}, |S| = ${S1.length}`);
    outB.set(`|S| = ${twoSize()} ${T('von', 'of')} 36`);
    slider.set(s);
  };

  return {
    render(_frame, time) {
      // the clock moves s one step every STEP seconds from the reader's current state (frame 0 is the figure)
      const st = Math.floor(time / STEP);
      if (st !== lastStep) {
        u = (((u + st - lastStep) % 20) + 20) % 20;
        s = sOf(u); mode = 'sum';
        lastStep = st;
      }
      // the steps are jumps between states, so they are eased like a slider move
      paint(!ctx.deterministic && !ctx.reducedMotion && !dragging());
    },
    destroy() { plate.svg.remove(); },
    info: () => ({ one: [...one].sort((p, q) => p - q).join(','), mode, s, size: twoSize() }),
  };
}
