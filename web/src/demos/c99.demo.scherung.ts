// c99.demo.scherung: the unit square and its image under M(t) (contract-test chapter,
// figure c99.fig.scherung). Physics-free. 2D, drawn as SVG on the plate.
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { imageOfUnitSquare, shearMatrixX, trace, UNIT_SQUARE, type Vec2 } from '../kernels/shear';

export const meta: DemoMeta = { animated: true, aspect: 2.4, surface: 'plate' };

const NS = 'http://www.w3.org/2000/svg';
// drawing window in the coordinates of the figure; y up
const X0 = -3.6, X1 = 4.6, Y0 = -0.45, Y1 = 1.55;

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `${X0} ${-Y1} ${X1 - X0} ${Y1 - Y0}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('aria-hidden', 'true');
  const el = (name: string, attrs: Record<string, string | number>) => {
    const e = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    return e;
  };
  const defs = el('defs', {});
  const pattern = el('pattern', { id: `tpcd-hatch-${ctx.id.replace(/\W/g, '-')}`, width: 0.09, height: 0.09, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-45)' });
  const hatchLine = el('line', { x1: 0, y1: 0, x2: 0, y2: 0.09 });
  pattern.append(hatchLine);
  defs.append(pattern);
  const background = el('rect', { x: X0, y: -Y1, width: X1 - X0, height: Y1 - Y0 });
  const axisX = el('line', { x1: X0, y1: 0, x2: X1, y2: 0 });
  const axisY = el('line', { x1: 0, y1: -Y0, x2: 0, y2: -Y1 });
  const image = el('polygon', {});
  const square = el('polygon', { points: UNIT_SQUARE.map((p) => `${p[0]},${-p[1]}`).join(' '), fill: 'none' });
  const corner = el('text', { 'text-anchor': 'middle' });
  svg.append(defs, background, axisX, axisY, image, square, corner);
  stage.append(svg);

  // t(time) = 3 sin(2 pi time / PERIOD + phase): a sweep between -3 and 3 that passes through
  // the chosen value at the moment it is chosen. The picture is a function of (time, phase).
  const PERIOD = 8;
  const clamp = (v: number) => Math.max(-3, Math.min(3, v));
  const phaseFor = (v: number, time: number) => Math.asin(clamp(v) / 3) - (2 * Math.PI * time) / PERIOD;
  let now = 0;
  let phase = phaseFor(Number(ctx.params.t ?? '2'), 0);
  const fmt = (v: number) => v.toLocaleString(ctx.lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = (v: number) => v.toLocaleString(ctx.lang, { maximumFractionDigits: 2 });
  const slider = ctx.ui.slider({
    label: ctx.text('Parameter t der Scherung M(t)', 'parameter t of the shear M(t)'),
    labelHtml: '<math><mi>t</mi></math>',
    min: -3, max: 3, step: 0.25, value: clamp(Number(ctx.params.t ?? '2')), primary: true, format: fmt,
    onInput: (v) => { phase = phaseFor(v, now); },
  });
  const tr = ctx.symbol('sym.trace');
  const traceOut = ctx.ui.readout(tr.name, `${tr.name} ${tr.mathml}`);
  const cornerOut = ctx.ui.readout(ctx.text('Bild der Ecke (1, 1)', 'image of the corner (1, 1)'));

  const px = () => (X1 - X0) / Math.max(1, stage.getBoundingClientRect().width);
  const style = () => {
    const k = ctx.tokens;
    const u = px();
    background.setAttribute('fill', k.color('plate'));
    for (const a of [axisX, axisY]) { a.setAttribute('stroke', k.color('plate-rule')); a.setAttribute('stroke-width', String(k.stroke('thin') * u)); }
    hatchLine.setAttribute('stroke', k.color('plate-rule'));
    hatchLine.setAttribute('stroke-width', String(k.stroke('thin') * u));
    image.setAttribute('fill', `url(#${pattern.id})`);
    image.setAttribute('stroke', k.color('state'));
    image.setAttribute('stroke-width', String(k.stroke('state') * u));
    image.setAttribute('stroke-linejoin', 'round');
    square.setAttribute('stroke', k.color('plate-ink'));
    square.setAttribute('stroke-width', String(k.stroke('regular') * u));
    square.setAttribute('stroke-dasharray', k.dash('effect').map((d) => d * u).join(' '));
    const f = k.font('label');
    corner.setAttribute('fill', k.color('plate-ink'));
    corner.setAttribute('font-family', f.family);
    corner.setAttribute('font-size', String(f.sizePx * u));
  };

  return {
    render(_frame, time) {
      now = time;
      const t = 3 * Math.sin((2 * Math.PI * time) / PERIOD + phase);
      slider.set(Math.round(t * 1e6) / 1e6);
      style();
      const m = shearMatrixX(t);
      const pts: Vec2[] = imageOfUnitSquare(m);
      image.setAttribute('points', pts.map((p) => `${p[0]},${-p[1]}`).join(' '));
      const c = pts[2];
      corner.setAttribute('x', String(c[0]));
      corner.setAttribute('y', String(-c[1] - 0.09));
      corner.textContent = `(${num(c[0])}; ${num(c[1])})`;
      traceOut.set(`= ${num(trace(m))}`);
      cornerOut.set(`(${num(c[0])}; ${num(c[1])})`);
    },
    tokensChanged: style,
    destroy() { svg.remove(); },
  };
}
