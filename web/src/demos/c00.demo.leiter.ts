// c00.demo.leiter: the ladder of theories of the course (figure c00.fig.leiter, sentences
// c00.eq.leiter and c00.eq.effektiv). Click or hover a rung, or play: the ladder is climbed
// from the microscopic bottom to the macroscopic top. For the chosen rung the demo says what
// the chapter says: it is an effective theory of the rung below, an approximation to the
// physics underneath, reached by "zooming out" (once: "zoom out and lose information").
// A scheme: no physics, no numbers. Labels are the figure's; the full name of rung 6 is the
// caption's. 2D, SVG on the plate.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { descBox, ease, ensureStyle, onDrag, pen, setDesc, stageSvg, stagePoint } from './c00/common';

export const meta: DemoMeta = { animated: true, aspect: 1.45, surface: 'plate' };

const DWELL = 3.2;          // seconds per rung while playing: a drawing choice
const SLIDE = 0.7;          // seconds the highlight takes to the next rung: a drawing choice

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = stageSvg(stage);
  const desc = descBox(stage);
  const t = ctx.text;
  const RUNG = [
    t('Grundtheorie der Physik (GPT = allgemeine probabilistische Theorie)', 'fundamental theory of physics (GPT = general probabilistic theory)'),
    t('QM einzelner Systeme', 'QM of single systems'),
    t('viele Teilchen', 'many particles'),
    t('unbestimmte Teilchenzahl (Fockraum)', 'indefinite number of particles (Fock space)'),
    t('statistische Mechanik: Ensembles, Grundhypothese der statistischen Mechanik', 'stat mech: ensembles, fundamental hypothesis of stat mech'),
    t('Thermodynamik', 'thermodynamics'),
  ];
  const FULL6 = t('Thermodynamik als die ultimative effektive Theorie der gesamten Physik auf makroskopischer Skala', 'thermodynamics as the ultimate effective theory of all physics at the macroscale');
  const ZOOM = t('herauszoomen', 'zoom out'), ZOOMLOSE = t('herauszoomen und Information verlieren', 'zoom out and lose info');
  const stepWord = (k: number) => (k === 5 ? ZOOMLOSE : ZOOM);   // the arrow into rung k from rung k-1 (k = 2..6, 1-based; the figure: 4 -> 5 loses info)

  // ── state ─────────────────────────────────────────────────────
  let now = 0;
  let offset = 0;                     // rung(time) = floor((time + offset)/DWELL) mod 6, 0-based
  let hover = -1;
  let tPick = -1e9, pickFrom = 0;     // a click starts a slide from the old rung
  const phaseAt = (time: number) => { const c = 6 * DWELL; return (((time + offset) % c) + c) % c; };
  const rungAt = (time: number) => Math.floor(phaseAt(time) / DWELL);
  const pick = (i: number) => {
    pickFrom = rungAt(now); tPick = now;
    offset = (i + 0.4) * DWELL - now;
    ctx.announce(sentence(i));
  };
  const sentence = (i: number) => i === 0
    ? t(`Stufe 1: ${RUNG[0]}. Der Kurs beginnt hier: Kapitel 1 und 2 behandeln Stufe 1.`, `Stage 1: ${RUNG[0]}. The course begins here: Chapters 1 and 2 treat stage 1.`)
    : t(`Stufe ${i + 1} ist eine effektive Theorie von Stufe ${i}: eine Näherung an die grundlegende Physik darunter.`, `Stage ${i + 1} is an effective theory of stage ${i}: an approximation to the fundamental underlying physics.`);
  // the primary control scrubs the climb: v in [0, 6) is the position in units of one rung
  const slider = ctx.ui.slider({
    label: t('Stufe der Leiter', 'stage of the ladder'), min: 0, max: 5.75, step: 0.25, value: 0.5, primary: true,
    format: (v) => String(Math.min(6, Math.floor(v) + 1)),
    onInput: (v) => { const i = Math.min(5, Math.floor(v)); if (i !== rungAt(now)) { pickFrom = rungAt(now); tPick = now; } offset = v * DWELL - now; ctx.announce(sentence(i)); },
  });
  offset = (ctx.params.stage ? Math.min(6, Math.max(1, Number(ctx.params.stage))) - 0.5 : 0.5) * DWELL;

  let rungY: Array<[number, number]> = [];
  let xr = [0, 0];
  const which = (x: number, y: number) => (x < xr[0] || x > xr[1] ? -1 : rungY.findIndex(([a, b]) => y >= a && y <= b));
  onDrag(svg, (x, y, first) => {
    if (!first) return false;
    const i = which(x, y);
    if (i < 0) return false;
    pick(i); ctx.invalidate();
    return true;
  });
  svg.addEventListener('pointermove', (ev) => {
    const [x, y] = stagePoint(svg, ev);
    const i = which(x, y);
    if (i !== hover) { hover = i; svg.style.cursor = i >= 0 ? 'pointer' : ''; ctx.invalidate(); }
  });
  svg.addEventListener('pointerleave', () => { if (hover !== -1) { hover = -1; ctx.invalidate(); } });

  const paint = () => {
    const P = pen(svg, stage, ctx.tokens, 44);
    const { k, W, H, fs } = P;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), q1 = k.color('q1');
    P.rect(0, 0, W, H, { fill: k.color('plate') });
    // figure coordinates (cm): rung j (0..5) is the box [0, 11.2] x [1.25 j, 1.25 j + 0.75]
    const ladderH = 0.7 * H;
    const sc = Math.min((W - 4.5 * fs) / 11.6, (ladderH - 1.0 * fs) / 7.0);
    const ox = 2.6 * fs + (W - 4.5 * fs - 11.6 * sc) / 2, oy = 0.6 * fs + 7.0 * sc;
    const X = (x: number) => ox + x * sc, Y = (y: number) => oy - y * sc;
    const cur = rungAt(now);
    // highlight position: slides from the previous rung (playing: the one below; after a click: the old one)
    const ph = phaseAt(now) - cur * DWELL;
    const picking = now - tPick < SLIDE && now !== tPick;
    const prev = picking ? pickFrom : Math.max(0, cur - 1);
    const u = now === tPick ? 1 : picking ? ease((now - tPick) / SLIDE) : ease(ph / SLIDE);
    const yHi = (1 - u) * (1.25 * prev) + u * (1.25 * cur);
    const below = cur - 1;

    // rung below the chosen one: lightly marked; the chosen one: a sliding highlight
    if (below >= 0) P.rect(X(0), Y(1.25 * below + 0.75), 11.2 * sc, 0.75 * sc, { fill: k.color('grey-1') });
    P.rect(X(-0.08), Y(yHi + 0.83), 11.36 * sc, 0.91 * sc, { fill: k.color('grey-2'), stroke: q1, 'stroke-width': k.stroke('regular') });
    rungY = [];
    for (let j = 0; j < 6; j++) {
      const y0 = 1.25 * j;
      const on = j === cur, hv = j === hover;
      if (!on) P.rect(X(0), Y(y0 + 0.75), 11.2 * sc, 0.75 * sc, { fill: 'none', stroke: ink, 'stroke-width': hv ? k.stroke('regular') : k.stroke('thin') });
      P.line(X(0.76), Y(y0), X(0.76), Y(y0 + 0.75), k.color('plate-rule'), k.stroke('hair'));
      P.text(X(0.38), Y(y0 + 0.375) + 0.35 * fs, String(j + 1), { anchor: 'middle', weight: on ? '600' : '400' });
      P.text(X(0.9), Y(y0 + 0.375) + 0.35 * fs, RUNG[j], { anchor: 'start', weight: on ? '600' : '400' });
      rungY.push([Y(y0 + 0.75) - 2, Y(y0) + 2]);
    }
    xr = [X(0), X(11.2)];
    // the five arrows "zoom out"; the one into the chosen rung is heavy
    for (let j = 1; j < 6; j++) {
      const ya = 1.25 * (j - 1) + 0.75, yb = 1.25 * j;
      const on = j === cur;
      P.line(X(5.6), Y(ya), X(5.6), Y(yb) + 0.55 * fs, on ? q1 : ink, on ? k.stroke('state') : k.stroke('thin'));
      P.path(`M${X(5.6)} ${Y(yb)} l${-0.32 * fs} ${0.65 * fs} l${0.64 * fs} 0 z`, { fill: on ? q1 : ink });
      P.text(X(5.75), Y((ya + yb) / 2) + 0.33 * fs, stepWord(j + 1), { anchor: 'start', size: 0.92 * fs, weight: on ? '600' : '400', fill: on ? ink : muted });
    }
    // a marker climbs the next arrow while the chosen rung is shown: the next step out
    if (cur < 5) {
      const ya = 1.25 * cur + 0.75, yb = 1.25 * (cur + 1);
      const f = Math.min(1, Math.max(0, (ph - SLIDE) / (DWELL - SLIDE)));
      P.circle(X(5.6), Y(ya + ease(f) * (yb - ya)), 0.3 * fs, { fill: q1 });
    }
    // the side axis: microscopic at the bottom, macroscopic at the top
    const sx = X(-0.35);
    P.line(sx, Y(2.6), sx, Y(4.4) + 0.5 * fs, ink, k.stroke('hair'));
    P.path(`M${sx} ${Y(4.4)} l${-0.28 * fs} ${0.55 * fs} l${0.56 * fs} 0 z`, { fill: ink });
    P.text(0, 0, t('mikroskopisch', 'microscopic'), { anchor: 'start', fill: muted, size: 0.92 * fs }).setAttribute('transform', `translate(${sx + 0.3 * fs} ${Y(0)}) rotate(-90)`);
    P.text(0, 0, t('makroskopisch', 'macroscopic'), { anchor: 'end', fill: muted, size: 0.92 * fs }).setAttribute('transform', `translate(${sx + 0.3 * fs} ${Y(7.0)}) rotate(-90)`);

    // what the chapter says about the chosen rung
    const head = `${t('Stufe', 'Stage')} ${cur + 1}: ${cur === 5 ? FULL6 : RUNG[cur]}`;
    const lines = cur === 0
      ? [t('Die unterste Stufe. Der Kurs beginnt hier: Kapitel 1 und 2 behandeln Stufe 1.', 'The bottom stage. The course begins here: Chapters 1 and 2 treat stage 1.')]
      : [
        t(`Eine effektive Theorie von Stufe ${cur} (${RUNG[cur - 1]}): eine Näherung an die grundlegende Physik darunter.`, `An effective theory of stage ${cur} (${RUNG[cur - 1]}): an approximation to the fundamental underlying physics.`),
        t(`Der Schritt von Stufe ${cur} hierher: ${stepWord(cur + 1)}.`, `The step from stage ${cur} to here: ${stepWord(cur + 1)}.`),
      ];
    setDesc(desc, Math.min(fs * 1.05, 18), head, lines, t('Was „herauszoomen“ bei einem bestimmten Schritt bedeutet, ist Gegenstand des Kapitels, das diesen Schritt geht.', 'What “zooming out” means at a particular step is the subject of the chapter that takes that step.'));
    slider.set(phaseAt(now) / DWELL);
  };

  return {
    render(_frame, time) { now = time; paint(); },
    resize: () => paint(),
    tokensChanged: () => paint(),
    destroy() { svg.remove(); desc.remove(); },
    info: () => ({ stage: rungAt(now) + 1 }),
  };
}
