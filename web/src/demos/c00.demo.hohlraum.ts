// c00.demo.hohlraum: a black body as a box with a small hole (figure c00.fig.hohlraum,
// equation c00.eq.reflexion). Play: a ray enters through the hole and is reflected at the
// walls by the law of reflection. The wall throws back the fraction r of the energy at each
// reflection and swallows the rest, so after n reflections the fraction r^n is left; the
// ray is drawn with that brightness. The chart on the right records r^n for every
// reflection, up to the reflection at which the ray finds the hole again. Sliders: r, and
// the direction of the entering ray (the figure's direction is the default). 2D, SVG on
// the plate.
//
// Every number shown is an input (r, the direction) or is computed by
// web/src/kernels/c00cavity.ts (the path, the count of reflections, r^n). The demo says
// nothing about the radiation the walls give off themselves: the chapter says this
// calculation does not either, and that it needs the assumption of thermal equilibrium.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { cavityPath, FIGURE_GEOMETRY, incomingPoint, outgoingPoint, pointAt, remaining, type CavityGeometry, type CavityPath } from '../kernels/c00cavity';
import { ensureStyle, fix, noteBelow, pen, sci, stageSvg, supInt } from './c00/common';

export const meta: DemoMeta = { animated: true, aspect: 1.9, surface: 'plate' };

const NMAX = 400;          // reflections followed at most: a drawing choice
const SPEED = 6;           // cm of path per second, at least: a drawing choice
const MAXTIME = 30;        // a path longer than SPEED * MAXTIME is run faster: a drawing choice
const HOLD = 3;            // seconds the end is held before the run repeats: a drawing choice
const TAIL = 3;            // segments behind the head drawn bright: a drawing choice

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = stageSvg(stage);

  // ── state ─────────────────────────────────────────────────────
  let r = Math.min(0.99, Math.max(0, Number(ctx.params.r ?? '0.9')));
  let slope = Math.min(1.5, Math.max(0.05, Number(ctx.params.slope ?? String(FIGURE_GEOMETRY.slope))));
  let geom: CavityGeometry = { ...FIGURE_GEOMETRY, slope };
  let path: CavityPath = cavityPath(geom, NMAX);
  let now = 0;
  const total = () => path.lengths[path.lengths.length - 1];
  const speed = () => Math.max(SPEED, total() / MAXTIME);
  const cycle = () => total() / speed() + HOLD;
  // progress p in [0, 1] of the run: p(time) = ((time + offset) mod cycle) / (total / speed), clamped
  let offset = Number(ctx.params.p ?? '0') * (total() / speed());
  const runTime = (time: number) => { const c = cycle(); return (((time + offset) % c) + c) % c; };
  const progressAt = (time: number) => Math.min(1, (runTime(time) * speed()) / total());

  // ── controls ──────────────────────────────────────────────────
  const rM = '<math><mi>r</mi></math>';
  ctx.ui.slider({
    label: ctx.text('Bruchteil r, den die Wand bei jeder Reflexion zurückwirft', 'fraction r the wall throws back at each reflection'), labelHtml: rM,
    min: 0, max: 0.99, step: 0.01, value: r, primary: true,
    format: (v) => fix(ctx, v, 2),
    onInput: (v) => { r = v; },
  });
  const progress = ctx.ui.slider({
    label: ctx.text('Weg des Strahls', 'path of the ray'),
    min: 0, max: 1, step: 0.001, value: progressAt(0),
    format: (v) => ctx.text(`${pointAt(path, v * total()).reflections} Refl.`, `${pointAt(path, v * total()).reflections} refl.`),
    onInput: (v) => { offset = v * (total() / speed()) - now; },
  });
  ctx.ui.slider({
    label: ctx.text('Richtung des eintretenden Strahls (Steigung)', 'direction of the entering ray (slope)'),
    min: 0.05, max: 1.5, step: 0.01, value: slope,
    format: (v) => fix(ctx, v, 2),
    onInput: (v) => {
      const p = progressAt(now);
      slope = v; geom = { ...FIGURE_GEOMETRY, slope }; path = cavityPath(geom, NMAX);
      offset = p * (total() / speed()) - now;
      ctx.announce(path.exited
        ? ctx.text(`Der Strahl findet das Loch nach ${path.reflections} Reflexionen wieder.`, `The ray finds the hole again after ${path.reflections} reflections.`)
        : ctx.text(`Nach ${path.reflections} Reflexionen hat der Strahl das Loch nicht wiedergefunden.`, `After ${path.reflections} reflections the ray has not found the hole again.`));
    },
  });
  const outN = ctx.ui.readout(ctx.text('Reflexionen bisher', 'reflections so far'), '<math><mi>n</mi></math>');
  const outR = ctx.ui.readout(ctx.text('übriger Bruchteil der Energie', 'fraction of the energy left'), '<math><msup><mi>r</mi><mi>n</mi></msup></math>');
  const outExit = ctx.ui.readout(ctx.text('am Loch', 'at the hole'));
  noteBelow(ctx, ctx.text(
    'Gezeichnet ist nur der eintretende Strahl; seine Helligkeit ist rⁿ. An einer Ecke trifft er zwei Wände zugleich: zwei Reflexionen. Was die Wände selbst abstrahlen, zeigt das Bild nicht: Darüber sagt diese Rechnung nichts, dafür braucht man die Annahme des thermischen Gleichgewichts.',
    'Only the entering ray is drawn; its brightness is rⁿ. At a corner it meets two walls at once: two reflections. What the walls radiate themselves is not shown: this calculation says nothing about it, which needs the assumption of thermal equilibrium.'));

  const paint = () => {
    const P = pen(svg, stage, ctx.tokens, 46);
    const { k, W, H, fs } = P;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), dyn = k.color('dynamics'), q1 = k.color('q1');
    P.rect(0, 0, W, H, { fill: k.color('plate') });
    const p = progressAt(now);
    progress.set(p);
    const Lnow = p * total();
    const head = pointAt(path, Lnow);
    const atEnd = p >= 1;
    const n = head.reflections;

    // ── cavity ──────────────────────────────────────────────────
    const xMinCm = -2.4, xMaxCm = 4.3, yMinCm = -0.25, yMaxCm = 2.65;
    const left = 0.8 * fs, right = 0.6 * W, top = 1.2 * fs, bottom = H - 2.6 * fs;
    const sc = Math.min((right - left) / (xMaxCm - xMinCm), (bottom - top) / (yMaxCm - yMinCm));
    const ox = left - xMinCm * sc + ((right - left) - (xMaxCm - xMinCm) * sc) / 2;
    const oy = bottom + yMinCm * sc;
    const X = (x: number) => ox + x * sc, Y = (y: number) => oy - y * sc;
    const { width: a, height: b, holeLo, holeHi } = geom;
    P.rect(X(-0.18), Y(b + 0.18), (a + 0.36) * sc, (b + 0.36) * sc, { fill: k.color('bath') });
    P.rect(X(0), Y(b), a * sc, b * sc, { fill: k.color('plate') });
    P.rect(X(-0.2), Y(holeHi), 0.21 * sc, (holeHi - holeLo) * sc, { fill: k.color('plate') });
    P.path(`M${X(-0.18)} ${Y(holeLo)} L${X(-0.18)} ${Y(-0.18)} L${X(a + 0.18)} ${Y(-0.18)} L${X(a + 0.18)} ${Y(b + 0.18)} L${X(-0.18)} ${Y(b + 0.18)} L${X(-0.18)} ${Y(holeHi)}`,
      { fill: 'none', stroke: k.color('bath-edge'), 'stroke-width': k.stroke('bath'), 'stroke-dasharray': k.dash('bath').join(' ') });
    P.path(`M${X(0)} ${Y(holeLo)} L${X(0)} ${Y(0)} L${X(a)} ${Y(0)} L${X(a)} ${Y(b)} L${X(0)} ${Y(b)} L${X(0)} ${Y(holeHi)}`, { fill: 'none', stroke: ink, 'stroke-width': k.stroke('thin') });
    P.text(X(a / 2), Y(-0.18) + 1.5 * fs, ctx.text('Wände mit Temperatur *T*', 'walls at temperature *T*'), { anchor: 'middle', fill: muted });
    P.line(X(-0.1), Y(holeHi + 0.04), X(-0.7), Y(1.9), ink, k.stroke('hair'));
    P.text(X(-0.72), Y(1.95), ctx.text('Loch', 'hole'), { anchor: 'end' });

    // incoming ray, full brightness
    const [ix, iy] = incomingPoint(geom, 1.75);
    P.line(X(ix), Y(iy), X(0), Y(geom.entryY), dyn, k.stroke('dynamics'), { 'stroke-linecap': 'round' });
    const [mx, my] = incomingPoint(geom, 0.9);
    const ang = (Math.atan2(-(geom.entryY - my), -mx) * 180) / Math.PI;
    P.path(`M0 0 l${-0.75 * fs} ${-0.35 * fs} l0 ${0.7 * fs} z`, { fill: dyn, transform: `translate(${X(mx)} ${Y(my)}) rotate(${ang})` });
    P.text(X(ix) - 1.2 * fs, Y(iy) + 1.4 * fs, ctx.text('einfallende Strahlung', 'incident radiation'), { anchor: 'start' });

    // path so far: a hairline for the geometry, the last segments bright with r^n
    const seg = head.segment;
    const pts = path.points;
    const trace: Array<[number, number]> = [];
    for (let i = 0; i <= seg; i++) trace.push([X(pts[i][0]), Y(pts[i][1])]);
    trace.push([X(head.x), Y(head.y)]);
    P.path(P.poly(trace), { fill: 'none', stroke: k.color('grey-3'), 'stroke-width': k.stroke('hair') });
    let before = 0;
    const cum: number[] = [];
    for (let i = 0; i < pts.length; i++) { before += path.contacts[i]; cum.push(before); }
    for (let i = Math.max(0, seg - TAIL); i <= seg; i++) {
      const end = i === seg ? [head.x, head.y] : pts[i + 1];
      const frac = remaining(r, cum[i]);
      const age = seg - i;                         // older segments of the tail thin out: a drawing choice
      const w = k.stroke('dynamics') * (1 - 0.18 * age);
      P.line(X(pts[i][0]), Y(pts[i][1]), X(end[0]), Y(end[1]), dyn, w, { 'stroke-opacity': frac.toFixed(4), 'stroke-linecap': 'round' });
    }
    const fracNow = remaining(r, n);
    if (!(atEnd && path.exited)) {
      P.circle(X(head.x), Y(head.y), 0.5 * fs, { fill: 'none', stroke: muted, 'stroke-width': k.stroke('hair') });
      P.circle(X(head.x), Y(head.y), 0.3 * fs, { fill: dyn, 'fill-opacity': fracNow.toFixed(4) });
    }
    if (path.exited) {
      const N = path.reflections, out = remaining(r, N);
      const tEnd = runTime(now) - total() / speed();
      if (tEnd >= 0) {
        const d = Math.min(1.6, tEnd * speed());
        const [qx, qy] = outgoingPoint(path, d);
        const last = pts[pts.length - 1];
        P.line(X(last[0]), Y(last[1]), X(qx), Y(qy), dyn, k.stroke('dynamics'), { 'stroke-opacity': out.toFixed(4), 'stroke-linecap': 'round' });
        P.circle(X(qx), Y(qy), 0.5 * fs, { fill: 'none', stroke: muted, 'stroke-width': k.stroke('hair') });
        P.text(X(-0.4), Y(-0.18) + 1.5 * fs, ctx.text(`hinaus: *r*^{${N}} = ${sci(ctx, out, 2)}`, `out: *r*^{${N}} = ${sci(ctx, out, 2)}`), { anchor: 'end', weight: '600' });
      }
    }

    // ── chart of r^n ────────────────────────────────────────────
    const N = path.reflections;
    const cx0 = 0.6 * W + 4.2 * fs, cx1 = W - 1.4 * fs, cy1 = 2.6 * fs, cy0 = H - 3.0 * fs;
    const CX = (m: number) => cx0 + (m / Math.max(1, N + 1)) * (cx1 - cx0);
    const CY = (v: number) => cy0 - v * (cy0 - cy1);
    P.line(cx0, cy0, cx1, cy0, ink, k.stroke('thin'));
    P.line(cx0, cy0, cx0, cy1 - 0.4 * fs, ink, k.stroke('thin'));
    for (const [v, s] of [[0, '0'], [0.5, '½'], [1, '1']] as Array<[number, string]>) {
      P.line(cx0 - 0.35 * fs, CY(v), cx0, CY(v), ink, k.stroke('hair'));
      P.text(cx0 - 0.5 * fs, CY(v) + 0.35 * fs, s, { anchor: 'end' });
    }
    P.text(cx0 - 0.5 * fs, cy1 - 1.0 * fs, '*r*^*n*', { anchor: 'start' });
    P.text((cx0 + cx1) / 2, cy0 + 2.5 * fs, ctx.text('Reflexionen *n*', 'reflections *n*'), { anchor: 'middle' });
    const step = N <= 12 ? 1 : N <= 60 ? 10 : N <= 150 ? 25 : 100;
    for (let m = 0; m <= N; m += step) P.text(CX(m + 0.5), cy0 + 1.25 * fs, String(m), { anchor: 'middle', fill: muted });
    const bw = (cx1 - cx0) / Math.max(1, N + 1);
    if (bw >= 2.2) {
      for (let m = 0; m <= N; m++) {
        const v = remaining(r, m);
        const done = m <= n;
        P.rect(CX(m) + 0.12 * bw, CY(v), 0.76 * bw, cy0 - CY(v), done ? { fill: q1 } : { fill: 'none', stroke: k.color('grey-3'), 'stroke-width': k.stroke('hair') });
      }
    } else {
      const area = (upTo: number) => {
        const pts2: Array<[number, number]> = [[CX(0), cy0]];
        for (let m = 0; m <= upTo; m++) { pts2.push([CX(m), CY(remaining(r, m))]); pts2.push([CX(m + 1), CY(remaining(r, m))]); }
        pts2.push([CX(upTo + 1), cy0]);
        return `${P.poly(pts2)} Z`;
      };
      P.path(area(N), { fill: 'none', stroke: k.color('grey-3'), 'stroke-width': k.stroke('hair') });
      P.path(area(Math.min(n, N)), { fill: q1, stroke: 'none' });
    }
    const mark = Math.min(n, N);
    P.line(CX(mark + 0.5), cy1, CX(mark + 0.5), cy0, ink, k.stroke('hair'), { 'stroke-dasharray': '2 2' });
    const lbl = `*r*^{${mark}} = ${mark === 0 ? '1' : sci(ctx, remaining(r, mark), 3)}`;
    P.text(Math.min(CX(mark + 0.5) + 0.5 * fs, cx1), cy1 + 0.2 * fs, lbl, { anchor: CX(mark + 0.5) > (cx0 + cx1) / 2 ? 'end' : 'start', weight: '600' });
    // where the ray finds the hole again (or where the walk stops)
    P.line(CX(N + 0.5), cy0, CX(N + 0.5), cy0 - 2.2 * fs, muted, k.stroke('hair'));
    P.text(CX(N + 0.5), cy0 - 2.5 * fs, path.exited ? ctx.text('Loch', 'hole') : ctx.text('Ende', 'end'), { anchor: 'end', fill: muted, size: 0.9 * fs });

    outN.set(`= ${n}`);
    outR.set(`= ${n === 0 ? '1' : sci(ctx, fracNow, 3)}`);
    outExit.set(path.exited
      ? ctx.text(`nach ${N} Reflexionen; hinaus geht r${supInt(N)} = ${sci(ctx, remaining(r, N), 3)}`, `after ${N} reflections; r${supInt(N)} = ${sci(ctx, remaining(r, N), 3)} goes out`)
      : ctx.text(`nicht innerhalb von ${N} Reflexionen`, `not within ${N} reflections`));
  };

  return {
    render(_frame, time) { now = time; paint(); },
    resize: () => paint(),
    tokensChanged: () => paint(),
    destroy() { svg.remove(); },
    info: () => {
      const h = pointAt(path, progressAt(now) * total());
      return { r, slope, reflectionsToHole: path.exited ? path.reflections : -1, n: h.reflections, remaining: remaining(r, h.reflections) };
    },
  };
}
