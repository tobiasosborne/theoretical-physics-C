// c03.demo.komplex: a complex-valued function on the line needs a third dimension (figure
// c03.fig.komplex, Vertiefung c03.v2). three.js on WebGL 2, stage roles.
//
// WHAT IS DRAWN. The curve x -> (x, Re f(x), Im f(x)) in the space R x C, for f(x) = m(x) e^(ikx)
// with a modulus m from the chapter: g(x) = e^(-x^2/2) (the still: k = 2), h(x) = 1/sqrt(1+|x|) or
// the constant 1, and the reader's k. As in the still: thin circles of radius |f(x)| in the planes
// x = -1, 0, 1, hairline spokes from the axis to the curve, and Re f alone, dashed, in the plane
// Im f = 0. On request Im f alone, dotted, in the plane Re f = 0. The inset shows |f(x)|^2, which
// does not depend on k because |e^(ikx)| = 1 (c03.ex.gauss), and the value of its integral.
// PLAY: the camera turns through four views: oblique (the still), from the front (only Re f is
// seen: the usual drawing), from above (only Im f), along the axis (the values f(x) in the complex
// plane, at distance |f(x)| from the centre). A marked point runs along the curve with the readout
// x, f(x) and |f(x)|. Dragging turns the scene.
//
// Every number shown is an input (k) or computed by web/src/kernels/hilbert.ts (phased, modulus,
// phasedAbs2, phasedPartial). Drawing choices (not physics): the x range [-3, 3] of the still,
// sample counts, camera path and timing.
import { BufferGeometry, Color, Float32BufferAttribute, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, OrthographicCamera, REVISION, Scene, SphereGeometry, Vector2, Vector3 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { createRenderer } from '../demo/three';
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { modulus, phased, phasedAbs2, phasedPartial, type Modulus } from '../kernels/hilbert';
import { choice, complexText, div, ensureStyle, fix, num, svgEl, toggle } from './c03/common';
import { pathD } from './c03/plot';

export const meta: DemoMeta = { animated: true, aspect: 1.6, webgl2: true };

const X0 = -3, X1 = 3;                 // the range of the still
const SAMPLES = 480;                   // points of the curve
const K_MAX = 6;
// camera views [azimuth, elevation] in radians and the tour: hold, move, hold, ... (seconds)
type View = 'oblique' | 'front' | 'top' | 'axis';
// [azimuth, elevation, zoom]: a parallel projection, as in the still, so that the front view shows Re f exactly
const VIEWS: Record<View, [number, number, number]> = { oblique: [-0.5, 0.42, 1], front: [0, 0.0, 1], top: [0, Math.PI / 2 - 0.02, 1], axis: [Math.PI / 2 - 0.001, 0.0, 1.55] };
const TOUR: View[] = ['oblique', 'front', 'top', 'axis'];
const HOLD = 3.2, MOVE = 2.0;
const RUN = 9, RUN_X0 = 0.6;          // the marked point runs once along [-3, 3] in RUN seconds, from x = RUN_X0
const HALF_H = 2.5, DIST = 15;       // half-height of the view in world units at zoom 1
const LOOK = [0.1, 0, 0.12] as const;

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const s3 = createRenderer(stage, ctx);
  const { renderer } = s3;
  const inset = svgEl('svg', { 'aria-hidden': 'true' });
  inset.style.position = 'absolute';
  const layer = div('c03-layer c03-stage-ink');
  stage.append(inset, layer);
  const head = div('c03-tag', layer), tags = div('', layer);

  // ── state ───────────────────────────────────────────────────────────────────────────────
  let kind: Modulus = (['gauss', 'power', 'one'] as const).includes(ctx.params.f as Modulus) ? (ctx.params.f as Modulus) : 'gauss';
  let k = Number(ctx.params.k ?? '2');
  if (!Number.isFinite(k)) k = 2;
  let showRe = ctx.params.re !== '0', showIm = ctx.params.im === '1';
  let az0 = 0, el0 = 0;            // the reader's turn, added to the tour
  let width = 1, height = 1;
  const startView: View = (TOUR as string[]).includes(ctx.params.view ?? '') ? (ctx.params.view as View) : 'oblique';

  // ── scene ───────────────────────────────────────────────────────────────────────────────
  const scene = new Scene();
  const camera = new OrthographicCamera(-HALF_H * 1.6, HALF_H * 1.6, HALF_H, -HALF_H, 0.1, 200);
  camera.up.set(0, 0, 1);
  const lm = (dashed = false) => new LineMaterial({ linewidth: 2, worldUnits: false, dashed, dashSize: 0.12, gapSize: 0.08, transparent: true });
  const curveMat = lm(), reMat = lm(true), imMat = lm(true), axisMat = lm(), circMat = lm();
  const spokeMat = new LineBasicMaterial({ transparent: true });
  const mkLine = (mat: LineMaterial) => { const l = new Line2(new LineGeometry(), mat); l.frustumCulled = false; scene.add(l); return l; };
  const curve = mkLine(curveMat), reLine = mkLine(reMat), imLine = mkLine(imMat);
  const axes = [mkLine(axisMat), mkLine(axisMat), mkLine(axisMat)];
  const circles = [mkLine(circMat), mkLine(circMat), mkLine(circMat)];
  const spokes = new LineSegments(new BufferGeometry(), spokeMat);
  scene.add(spokes);
  const markMat = lm();
  const markSpoke = mkLine(markMat);
  const dotMat = new MeshBasicMaterial();
  const dot = new Mesh(new SphereGeometry(0.075, 20, 12), dotMat);
  scene.add(dot);
  const setPts = (l: Line2, pts: number[]) => { l.geometry.dispose(); const g = new LineGeometry(); g.setPositions(pts); l.geometry = g; l.computeLineDistances(); };
  // world: (x, Im f, Re f), z up
  setPts(axes[0], [-3.4, 0, 0, 3.6, 0, 0]);
  setPts(axes[1], [0, 0, -1.25, 0, 0, 1.45]);
  setPts(axes[2], [0, -1.3, 0, 0, 1.6, 0]);

  let built = '';
  const build = () => {
    const id = `${kind}|${k}`;
    if (id === built) return;
    built = id;
    const c: number[] = [], re: number[] = [], im: number[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const x = X0 + ((X1 - X0) * i) / SAMPLES;
      const f = phased(kind, k, x);
      c.push(x, f[1], f[0]); re.push(x, 0, f[0]); im.push(x, f[1], 0);
    }
    setPts(curve, c); setPts(reLine, re); setPts(imLine, im);
    [-1, 0, 1].forEach((xc, i) => {
      const r = modulus(kind, xc), pts: number[] = [];
      for (let t = 0; t <= 96; t++) { const a = (2 * Math.PI * t) / 96; pts.push(xc, r * Math.sin(a), r * Math.cos(a)); }
      setPts(circles[i], pts);
    });
    const sp: number[] = [];
    for (let i = 0; i <= 16; i++) { const x = -2 + 0.25 * i; const f = phased(kind, k, x); sp.push(x, 0, 0, x, f[1], f[0]); }
    spokes.geometry.dispose();
    spokes.geometry = new BufferGeometry();
    spokes.geometry.setAttribute('position', new Float32BufferAttribute(sp, 3));
  };

  const paint = () => {
    const t = ctx.tokens;
    renderer.setClearColor(new Color(t.color('stage')), 1);
    curveMat.color.set(t.color('stage-state')); curveMat.linewidth = t.stroke('state');
    reMat.color.set(t.color('stage-effect')); reMat.linewidth = t.stroke('effect');
    const d = t.dash('effect');
    reMat.dashSize = 0.03 * d[0]; reMat.gapSize = 0.03 * (d[1] ?? d[0]);
    imMat.color.set(t.color('stage-effect')); imMat.linewidth = t.stroke('effect'); imMat.dashSize = 0.03; imMat.gapSize = 0.07;
    axisMat.color.set(t.color('stage-ink')); axisMat.linewidth = t.stroke('thin');
    circMat.color.set(t.color('stage-rule')); circMat.linewidth = t.stroke('thin');
    spokeMat.color.set(t.color('stage-rule'));
    markMat.color.set(t.color('stage-state')); markMat.linewidth = t.stroke('regular');
    dotMat.color.set(t.color('stage-state'));
  };
  paint();

  // ── controls ────────────────────────────────────────────────────────────────────────────
  ctx.ui.slider({
    label: ctx.text('Wellenzahl k im Phasenfaktor e^(ikx)', 'wave number k in the phase factor e^(ikx)'),
    labelHtml: '<math><mi>k</mi></math>' + ctx.text(' in ', ' in ') + '<math><msup><mi>e</mi><mrow><mi>i</mi><mi>k</mi><mi>x</mi></mrow></msup></math>',
    min: 0, max: K_MAX, step: 0.05, value: k, primary: true,
    format: (v) => fix(ctx, v, 2),
    onInput: (v) => { k = v; },
  });
  choice<Modulus>(ctx, ctx.text('Betrag', 'modulus'), [
    { value: 'gauss', html: '<math><msup><mi>e</mi><mrow><mo>−</mo><msup><mi>x</mi><mn>2</mn></msup><mo>/</mo><mn>2</mn></mrow></msup></math>', title: ctx.text('Betrag e^(−x²/2), wie in der Abbildung', 'modulus e^(−x²/2), as in the figure') },
    { value: 'power', html: '<math><mn>1</mn><mo>/</mo><msqrt><mn>1</mn><mo>+</mo><mo>|</mo><mi>x</mi><mo>|</mo></msqrt></math>', title: ctx.text('Betrag 1/√(1+|x|)', 'modulus 1/√(1+|x|)') },
    { value: 'one', html: '<math><mn>1</mn></math>', title: ctx.text('Betrag 1: f = e^(ikx)', 'modulus 1: f = e^(ikx)') },
  ], kind, (v) => { kind = v; });
  toggle(ctx, ctx.text('Re f allein (gestrichelt)', 'Re f alone (dashed)'), null, showRe, (on) => { showRe = on; });
  toggle(ctx, ctx.text('Im f allein (gepunktet)', 'Im f alone (dotted)'), null, showIm, (on) => { showIm = on; });
  ctx.ui.button(ctx.text('Blick zurücksetzen', 'reset view'), () => { az0 = 0; el0 = 0; });

  // drag to turn
  let drag: { x: number; y: number; az: number; el: number } | null = null;
  const onDown = (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY, az: az0, el: el0 }; stage.setPointerCapture(e.pointerId); };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    az0 = drag.az - (e.clientX - drag.x) * 0.008;
    el0 = Math.max(-1.4, Math.min(1.4, drag.el + (e.clientY - drag.y) * 0.008));
    ctx.invalidate();
  };
  const onUp = () => { drag = null; };
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onUp);
  stage.style.touchAction = 'pan-y';
  stage.style.cursor = 'grab';

  // ── the tour ────────────────────────────────────────────────────────────────────────────
  const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2);
  const startIdx = TOUR.indexOf(startView);
  const tourAt = (time: number): { az: number; el: number; zoom: number; view: View | null } => {
    const cyc = TOUR.length * (HOLD + MOVE);
    let tt = time % cyc;
    let i = startIdx;
    for (let n = 0; n < TOUR.length; n++) {
      const a = VIEWS[TOUR[i]];
      if (tt < HOLD) return { az: a[0], el: a[1], zoom: a[2], view: TOUR[i] };
      tt -= HOLD;
      const j = (i + 1) % TOUR.length;
      if (tt < MOVE) {
        const u = ease(tt / MOVE), b = VIEWS[TOUR[j]];
        return { az: a[0] + (b[0] - a[0]) * u, el: a[1] + (b[1] - a[1]) * u, zoom: a[2] + (b[2] - a[2]) * u, view: null };
      }
      tt -= MOVE;
      i = j;
    }
    const a = VIEWS[startView];
    return { az: a[0], el: a[1], zoom: a[2], view: startView };
  };

  // ── overlay ─────────────────────────────────────────────────────────────────────────────
  const v3 = new Vector3();
  const o3 = new Vector3();
  const tag = (x: number, y: number, z: number, html: string, cls = '', dx = 0, dy = 0, avoidOrigin = 0) => {
    v3.set(x, y, z).project(camera);
    if (v3.z < -1 || v3.z > 1) return;
    if (avoidOrigin > 0) {
      // an axis seen end-on: its label would sit on the origin
      o3.set(0, 0, 0).project(camera);
      if (Math.hypot((v3.x - o3.x) * width / 2, (v3.y - o3.y) * height / 2) < avoidOrigin) return;
    }
    const d = div(`c03-tag ${cls}`, tags);
    d.innerHTML = html;
    d.style.transform = `translate(${(((v3.x + 1) / 2) * width + dx).toFixed(1)}px, ${(((1 - v3.y) / 2) * height + dy).toFixed(1)}px) translate(-50%, -50%)`;
  };
  const fHtml = () => {
    const mHtml = kind === 'gauss' ? '<msup><mi>e</mi><mrow><mo>−</mo><msup><mi>x</mi><mn>2</mn></msup><mo>/</mo><mn>2</mn></mrow></msup>'
      : kind === 'power' ? '<mfrac><mn>1</mn><msqrt><mn>1</mn><mo>+</mo><mo>|</mo><mi>x</mi><mo>|</mo></msqrt></mfrac>' : '';
    return `<math><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>=</mo>${mHtml}<msup><mi>e</mi><mrow><mi>i</mi><mn>${num(ctx, k, 2)}</mn><mi>x</mi></mrow></msup></math>`;
  };
  const viewText = (v: View | null) => {
    switch (v) {
      case 'front': return ctx.text('Von vorn: Man sieht nur Re f, die gewohnte Zeichnung. Im f steckt in der Tiefe.', 'From the front: only Re f is seen, the usual drawing. Im f is hidden in the depth.');
      case 'top': return ctx.text('Von oben: Man sieht nur Im f.', 'From above: only Im f is seen.');
      case 'axis': return ctx.text('Entlang der x-Achse: die Werte f(x) als Punkte der komplexen Ebene, im Abstand |f(x)| von der Mitte.', 'Along the x axis: the values f(x) as points of the complex plane, at distance |f(x)| from the centre.');
      case 'oblique': return ctx.text('Schräg: Zu jedem x gehört ein Punkt der komplexen Ebene, die senkrecht auf der x-Achse steht.', 'Oblique: each x carries a point of the complex plane standing perpendicular to the x axis.');
      default: return '';
    }
  };

  const drawInset = () => {
    inset.replaceChildren();
    const t = ctx.tokens;
    const fs = Math.min(t.font('label').sizePx, width / 40);
    const w = Math.min(width * 0.3, 22 * fs), h = w * 0.5;
    inset.setAttribute('viewBox', `0 0 ${w} ${h}`);
    inset.style.width = `${w}px`; inset.style.height = `${h}px`;
    inset.style.left = 'auto'; inset.style.top = 'auto';
    inset.style.right = `${0.6 * fs}px`; inset.style.bottom = `${0.6 * fs}px`;
    const ink = t.color('stage-ink'), st = t.color('stage-state');
    const mL = 0.5 * fs, mB = 1.4 * fs, mT = 2.6 * fs;
    const px = (x: number) => mL + ((x - X0) / (X1 - X0)) * (w - 2 * mL), py = (y: number) => h - mB - y * (h - mB - mT);
    const xs = Array.from({ length: 121 }, (_, i) => X0 + ((X1 - X0) * i) / 120);
    const pts = xs.map((x) => [px(x), py(phasedAbs2(kind, x))] as [number, number]);
    inset.append(svgEl('rect', { x: 0, y: 0, width: w, height: h, fill: t.color('stage'), 'fill-opacity': 0.85, stroke: t.color('stage-rule'), 'stroke-width': t.stroke('hair') }));
    inset.append(svgEl('path', { d: `${pathD(pts)} L ${px(X1)} ${py(0)} L ${px(X0)} ${py(0)} Z`, fill: st, 'fill-opacity': 0.22, stroke: 'none' }));
    inset.append(svgEl('path', { d: pathD(pts), fill: 'none', stroke: st, 'stroke-width': t.stroke('regular') }));
    inset.append(svgEl('line', { x1: mL, y1: py(0), x2: w - mL, y2: py(0), stroke: ink, 'stroke-width': t.stroke('thin') }));
    for (const x of [-2, 0, 2]) {
      inset.append(svgEl('line', { x1: px(x), y1: py(0), x2: px(x), y2: py(0) + 0.3 * fs, stroke: ink, 'stroke-width': t.stroke('hair') }));
      const e = svgEl('text', { x: px(x), y: py(0) + 1.15 * fs, 'text-anchor': 'middle', fill: ink, 'font-size': 0.8 * fs });
      e.style.fontFamily = 'var(--tpc-family-label)'; e.textContent = num(ctx, x, 0); inset.append(e);
    }
    const total = phasedPartial(kind, Infinity);
    const cap = div('c03-tag', tags);
    cap.style.fontSize = `${0.9 * fs}px`;
    cap.style.transform = `translate(${(width - 0.6 * fs - w + 0.5 * fs).toFixed(1)}px, ${(height - 0.6 * fs - h + 0.3 * fs).toFixed(1)}px)`;
    cap.innerHTML = `<math><msup><mrow><mo>|</mo><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>|</mo></mrow><mn>2</mn></msup></math>`
      + ctx.text(' hängt nicht von k ab;', ' does not depend on k;') + '<br>'
      + `<math><msubsup><mo>∫</mo><mrow><mo>−</mo><mi>∞</mi></mrow><mi>∞</mi></msubsup><msup><mrow><mo>|</mo><mi>f</mi><mo>|</mo></mrow><mn>2</mn></msup><mi>d</mi><mi>x</mi><mo>=</mo></math> `
      + (Number.isFinite(total) ? `<math><msqrt><mi>π</mi></msqrt></math> = ${num(ctx, total, 4)}` : `∞ ${ctx.text('(nicht quadratintegrierbar)', '(not square integrable)')}`);
  };

  let lastView: View | null = startView;
  return {
    render(_frame, time) {
      build();
      const tour = tourAt(time);
      const az = tour.az + az0, el = Math.max(-1.55, Math.min(1.55, tour.el + el0));
      const ce = Math.cos(el);
      // the camera looks at a fixed point from the direction (az, el); up is the Re axis
      camera.position.set(LOOK[0] + DIST * Math.sin(az) * ce, LOOK[1] - DIST * Math.cos(az) * ce, LOOK[2] + DIST * Math.sin(el));
      camera.up.set(-Math.sin(el) * Math.sin(az), Math.sin(el) * Math.cos(az), Math.cos(el));
      camera.lookAt(LOOK[0], LOOK[1], LOOK[2]);
      camera.zoom = tour.zoom;
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      reLine.visible = showRe; imLine.visible = showIm;
      const res = new Vector2(width, height);
      for (const m of [curveMat, reMat, imMat, axisMat, circMat, markMat]) m.resolution.copy(res);
      // the marked point
      const run = RUN_X0 - X0 + ((X1 - X0) * time) / RUN;
      const xm = X0 + (run - (X1 - X0) * Math.floor(run / (X1 - X0)));
      const fm = phased(kind, k, xm);
      dot.position.set(xm, fm[1], fm[0]);
      setPts(markSpoke, [xm, 0, 0, xm, fm[1], fm[0]]);
      renderer.render(scene, camera);

      tags.replaceChildren();
      const t = ctx.tokens;
      const fs = Math.min(t.font('label').sizePx, width / 40);
      layer.style.fontSize = `${fs}px`;
      const mi = (c: string) => `<math><mi>${c}</mi></math>`;
      tag(3.85, 0, 0, mi('x'), '', 0, 0, 2 * fs);
      tag(0, 0, 1.62, '<math><mo>Re</mo><mi>f</mi></math>', '', 0, 0, 2 * fs);
      tag(0, 1.85, 0, '<math><mo>Im</mo><mi>f</mi></math>', '', 0, 0, 2 * fs);
      if (tour.view !== 'axis') { const fl = phased(kind, k, -2.1); tag(-2.1, fl[1], fl[0], fHtml(), '', -0.5 * fs, -1.8 * fs); }
      tag(xm, fm[1], fm[0], `x = ${fix(ctx, xm, 2)}: f(x) = ${complexText(ctx, fm, 2)}, |f(x)| = ${fix(ctx, modulus(kind, xm), 2)}`, 'c03-readout', 0, -1.3 * fs);
      head.style.transform = `translate(${(0.6 * fs).toFixed(1)}px, ${(0.5 * fs).toFixed(1)}px)`;
      head.style.whiteSpace = 'normal'; head.style.width = `${(width * 0.62).toFixed(0)}px`;
      const v = tour.view && az0 === 0 && el0 === 0 ? tour.view : null;
      head.innerHTML = `${fHtml()}${ctx.text(', k = ', ', k = ')}${num(ctx, k, 2)}<br><span style="opacity: 0.8">${viewText(v)}</span>`;
      if (v !== lastView && v) ctx.announce(viewText(v));
      lastView = v;
      drawInset();
    },
    resize(w, h) {
      width = w; height = h;
      renderer.setSize(w, h, false);
      camera.left = (-HALF_H * w) / h; camera.right = (HALF_H * w) / h; camera.top = HALF_H; camera.bottom = -HALF_H;
      camera.updateProjectionMatrix();
    },
    tokensChanged: paint,
    info: () => ({ ...s3.info(), three: REVISION, f: kind, k, re: showRe, im: showIm }),
    destroy() {
      stage.removeEventListener('pointerdown', onDown); stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp); stage.removeEventListener('pointercancel', onUp);
      for (const l of [curve, reLine, imLine, markSpoke, ...axes, ...circles]) l.geometry.dispose();
      for (const m of [curveMat, reMat, imMat, axisMat, circMat, markMat]) m.dispose();
      dot.geometry.dispose(); dotMat.dispose();
      spokes.geometry.dispose(); spokeMat.dispose();
      renderer.dispose();
      s3.canvas.remove(); layer.remove(); inset.remove();
    },
  };
}
