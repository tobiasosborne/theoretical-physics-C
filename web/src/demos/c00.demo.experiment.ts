// c00.demo.experiment: every experiment in three stages (figure c00.fig.experiment,
// section c00.s2). Play: a marker runs through preparation, run and measurement to the
// outcome; the stage it is in is highlighted and its sentence from the chapter is shown.
// The button "combine" draws the first two stages as one more complicated preparation, as
// the chapter does next. A scheme: no physics, no numbers. 2D, SVG on the plate.
// Roles as in the figure: preparation in the state role (solid), run in the dynamics role
// (heavier), measurement in the effect role (dashed). Words are the chapter's.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { descBox, ease, ensureStyle, onDrag, pen, setDesc, stageSvg, toggle } from './c00/common';

export const meta: DemoMeta = { animated: true, aspect: 2.9, surface: 'plate' };

const DWELL = 3;            // seconds per stage: a drawing choice
const MOVE = 0.9;           // seconds the marker takes along an arrow: a drawing choice
const MERGE = 0.8;          // seconds of the combine transition: a drawing choice

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = stageSvg(stage);
  const desc = descBox(stage);
  const t = ctx.text;
  const NAMES = [t('Präparation', 'preparation'), t('Durchführung', 'run'), t('Messung', 'measurement'), t('Ergebnis', 'outcome')];
  const SENT = [
    t('Etwas wird hergerichtet: der Würfel, im Labor etwa ein Lichtstrahl.', 'Something is set up: the die, in the laboratory for instance a beam of light.'),
    t('Das Experiment läuft; wir machen etwas mit dem, was präpariert wurde.', 'The experiment runs; we do something with what was prepared.'),
    t('Am Ende schauen wir hin und erhalten eines der möglichen Ergebnisse.', 'At the end we look and obtain one of the possible outcomes.'),
    t('Für den Theoretiker sehen alle Experimente der Physik gleich aus: präparieren, durchführen, messen.', 'To the theorist all experiments in physics look the same: prepare, run, measure.'),
  ];
  const MERGED = [
    t('Die ersten beiden Schritte lassen sich zu einer komplizierteren Präparation zusammenfassen.', 'The first two steps can be combined into one more complicated preparation.'),
    t('Ein gezinkter Würfel ist nichts anderes als ein normaler Würfel, an dem man vorher etwas gemacht hat. Wo man die Grenze zieht, ist Geschmackssache.', 'A loaded die is nothing but an ordinary die to which something was done beforehand. Where one draws the line is a matter of taste.'),
  ];

  // ── state ─────────────────────────────────────────────────────
  let now = 0;
  let offset = 0;                                   // stage(time) = floor((time + offset)/DWELL) mod 4
  let merged = ctx.params.merged === '1';
  let tMerge = -1e9;                                // time of the last combine toggle
  const phaseAt = (time: number) => { const c = 4 * DWELL; return (((time + offset) % c) + c) % c; };
  const stageAt = (time: number) => Math.floor(phaseAt(time) / DWELL);
  // the primary control scrubs the sequence: v in [0, 4) is the position in units of one stage
  const slider = ctx.ui.slider({
    label: t('Ablauf: Schritt', 'sequence: step'), min: 0, max: 3.75, step: 0.25, value: 0.5, primary: true,
    format: (v) => NAMES[Math.min(3, Math.floor(v))],
    onInput: (v) => { offset = v * DWELL - now; const i = Math.min(3, Math.floor(v)); ctx.announce(`${NAMES[i]}: ${SENT[i]}`); },
  });
  offset = (ctx.params.step ? Math.min(4, Math.max(1, Number(ctx.params.step))) - 0.5 : 0.5) * DWELL;
  toggle(ctx, t('erste zwei Schritte zusammenfassen', 'combine the first two steps'), merged, (on) => { merged = on; tMerge = now; });

  // clicking a box selects its stage
  let boxes: Array<[number, number]> = [];          // x-ranges in px of the four targets
  let band = [0, 0];
  onDrag(svg, (x, y, first) => {
    if (!first || y < band[0] || y > band[1]) return false;
    const i = boxes.findIndex(([a, b]) => x >= a && x <= b);
    if (i < 0) return false;
    offset = (i + 0.3) * DWELL - now; ctx.invalidate();
    ctx.announce(`${NAMES[i]}: ${SENT[i]}`);
    return true;
  });

  const paint = () => {
    const P = pen(svg, stage, ctx.tokens, 52);
    const { k, W, H, fs } = P;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted');
    P.rect(0, 0, W, H, { fill: k.color('plate') });
    // figure coordinates (cm): boxes [0,2.9], [3.8,6.7], [7.6,10.5], outcome from 11.45; height 1.3
    const descH = 4.6 * fs;
    const sc = Math.min((W - 2 * fs) / 13.4, (H - descH - 3.4 * fs) / 2.0);
    const ox = (W - 13.4 * sc) / 2, oy = 1.9 * fs + 1.42 * sc;
    const X = (x: number) => ox + x * sc, Y = (y: number) => oy - y * sc;
    const s = stageAt(now), ph = phaseAt(now) - s * DWELL;
    // merge factor: eased while the clock runs; when the clock stands still the new state shows at once
    const mT = now === tMerge ? 1 : ease((now - tMerge) / MERGE);
    const m = merged ? mT : 1 - mT;
    const roles = [
      { stroke: k.color('state'), w: k.stroke('state'), dash: '' },
      { stroke: k.color('dynamics'), w: k.stroke('dynamics'), dash: '' },
      { stroke: k.color('effect'), w: k.stroke('effect'), dash: k.dash('effect').join(' ') },
    ];
    const bx: Array<[number, number]> = [[0, 2.9], [3.8, 6.7], [7.6, 10.5]];
    const active = (i: number) => (s === i) || (m > 0.5 && i <= 1 && s <= 1);
    // combined preparation box (fades in) around stages 1 and 2
    if (m > 0) {
      P.rect(X(-0.12), Y(1.42), (6.94) * sc, 1.54 * sc, { fill: s <= 1 ? k.color('grey-1') : 'none', 'fill-opacity': (m).toFixed(3), stroke: roles[0].stroke, 'stroke-width': roles[0].w, 'stroke-opacity': m.toFixed(3) });
    }
    for (let i = 0; i < 3; i++) {
      const [a, b] = bx[i];
      const fade = i <= 1 ? 1 - 0.75 * m : 1;
      const on = active(i);
      if (on && !(i <= 1 && m > 0.5)) P.rect(X(a), Y(1.3), (b - a) * sc, 1.3 * sc, { fill: k.color('grey-1') });
      P.rect(X(a), Y(1.3), (b - a) * sc, 1.3 * sc, { fill: 'none', stroke: roles[i].stroke, 'stroke-width': roles[i].w * (on ? 1.5 : 1), 'stroke-opacity': fade.toFixed(3), ...(roles[i].dash ? { 'stroke-dasharray': roles[i].dash } : {}) });
      P.text(X((a + b) / 2), Y(0.65) - 0.25 * fs, String(i + 1), { anchor: 'middle', weight: on ? '600' : '400', fill: ink });
      P.text(X((a + b) / 2), Y(0.65) + 1.0 * fs, NAMES[i], { anchor: 'middle', weight: on ? '600' : '400' });
    }
    if (m > 0.02) P.text(X(3.35), Y(1.42) - 0.45 * fs, t('eine kompliziertere Präparation', 'one more complicated preparation'), { anchor: 'middle', weight: '600', fill: ink });
    const arrow = (x0: number, x1: number, op = 1) => {
      P.line(X(x0), Y(0.65), X(x1) - 0.5 * fs, Y(0.65), ink, k.stroke('thin'), { 'stroke-opacity': op.toFixed(3) });
      P.path(`M${X(x1)} ${Y(0.65)} l${-0.7 * fs} ${-0.32 * fs} l0 ${0.64 * fs} z`, { fill: ink, 'fill-opacity': op.toFixed(3) });
    };
    arrow(2.9, 3.8, 1 - 0.8 * m); arrow(6.7, 7.6); arrow(10.5, 11.4);
    if (s === 3) P.rect(X(11.3), Y(1.15), 2.0 * sc, 1.0 * sc, { fill: k.color('grey-1'), stroke: ink, 'stroke-width': k.stroke('regular'), rx: 0.15 * sc });
    P.text(X(11.45), Y(0.65) + 0.35 * fs, NAMES[3], { anchor: 'start', weight: s === 3 ? '600' : '400' });
    // brace of the figure: stages 1 and 2 together are one preparation (fades out when drawn combined)
    const bop = (1 - m).toFixed(3);
    P.path(`M${X(0)} ${Y(-0.25)} L${X(0)} ${Y(-0.45)} L${X(6.7)} ${Y(-0.45)} L${X(6.7)} ${Y(-0.25)}`, { fill: 'none', stroke: muted, 'stroke-width': k.stroke('hair'), 'stroke-opacity': bop });
    P.text(X(3.35), Y(-0.5) + 1.0 * fs, t('zusammen: eine kompliziertere Präparation', 'together: one more complicated preparation'), { anchor: 'middle', fill: muted, size: 0.92 * fs }).setAttribute('opacity', bop);

    // progress through the stage: a bar fills along the bottom of the active box; then a dot runs along the arrow
    const rest = DWELL - MOVE;
    const fill = Math.min(1, ph / rest);
    const tgt: Array<[number, number, string]> = m > 0.5
      ? [[-0.12, 6.82, roles[0].stroke], [-0.12, 6.82, roles[0].stroke], [7.6, 10.5, roles[2].stroke], [11.35, 13.25, ink]]
      : [[0, 2.9, roles[0].stroke], [3.8, 6.7, roles[1].stroke], [7.6, 10.5, roles[2].stroke], [11.35, 13.25, ink]];
    const [ta, tb, tc] = tgt[s];
    const barY = s === 3 ? Y(0.2) : Y(0.17);
    P.line(X(ta + 0.25), barY, X(ta + 0.25 + fill * (tb - ta - 0.5)), barY, tc, k.stroke('state'), { 'stroke-linecap': 'round' });
    const arrows: Array<[number, number]> = [[2.9, 3.8], [6.7, 7.6], [10.5, 11.4]];
    if (s < 3 && ph > rest && !(m > 0.5 && s === 0)) {
      const [xa, xb] = arrows[s];
      P.circle(X(xa + ease((ph - rest) / MOVE) * (xb - xa)), Y(0.65), 0.32 * fs, { fill: ink });
    }
    boxes = [[X(0), X(2.9)], [X(3.8), X(6.7)], [X(7.6), X(10.5)], [X(11.35), X(13.25)]];
    band = [Y(1.5), Y(-0.2)];

    const lines = m > 0.5 && s <= 1 ? MERGED : [SENT[s]];
    const head = m > 0.5 && s <= 1 ? `1 + 2  ${t('Präparation', 'preparation')}` : `${s < 3 ? `${s + 1}  ` : ''}${NAMES[s]}`;
    setDesc(desc, Math.min(fs * 1.05, 18), head, lines, t('Klicken Sie auf einen Schritt, oder spielen Sie den Ablauf ab.', 'Click a step, or play the sequence.'));
    slider.set(phaseAt(now) / DWELL);
  };

  return {
    render(_frame, time) { now = time; paint(); },
    resize: () => paint(),
    tokensChanged: () => paint(),
    destroy() { svg.remove(); desc.remove(); },
    info: () => ({ stage: stageAt(now) + 1, merged }),
  };
}
