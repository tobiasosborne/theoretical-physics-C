// c01.demo.simplex: the set of all weights on X = {1, 2, 3} as the triangle in R^3 with the
// point weights p_1, p_2, p_3 as corners (figure c01.fig.simplex, proposition c01.prop.simplex,
// Vertiefung c01.v1). three.js on WebGL 2, stage roles.
//
// Coordinates are the weights themselves: the point of the scene at (x, y, z) is the weight
// with p(1) = x, p(2) = y, p(3) = z; the axes are p(1), p(2), p(3). Weights satisfy
// x + y + z = 1 and x, y, z >= 0: they fill the triangle with corners e_1, e_2, e_3, the point
// weights (c01.eq.punktgewicht). The reader drags the point p in the triangle (it snaps to the
// lattice of multiples of 1/24, kernel nearestWeight) and turns the scene by dragging elsewhere.
// Each corner p_a carries a halo whose size grows with p(a): the numbers p(a) are at once the
// probabilities of the outcomes and the mixing weights of the corners, p = sum_a p(a) p_a
// (c01.eq.zerlegung). With "n = 2" the point is confined to the edge p(3) = 0: the segment
// between p_1 = (1, 0) and p_2 = (0, 1) in the plane of p(1), p(2), figure c01.fig.simplex (a).
// The view "as in the figure" looks along (1, 1, 1): there the triangle is equilateral, with
// p_1 at the lower left, p_2 at the lower right and p_3 on top, as in figure (b).
//
// Every number shown is a coordinate the reader set (an exact multiple of 1/24) or computed by
// web/src/kernels/prob.ts (nearestWeight, renormalise, weights, pointWeightIndex). The halo
// sizes, the camera and the turntable of the clock are drawing choices.
// Parameters: n = 2 | 3, p = a1,a2,a3 (numerators over 24), view = space | figure.
import {
  BufferGeometry, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute, Group, LineDashedMaterial, LineSegments, Mesh, MeshBasicMaterial,
  PerspectiveCamera, Plane, Quaternion, Raycaster, RingGeometry, CircleGeometry, Scene, SphereGeometry, SRGBColorSpace, Vector2, Vector3, ConeGeometry,
} from 'three';
import { createRenderer } from '../demo/three';
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { frac, nearestWeight, pointWeightIndex, renormalise, weights } from '../kernels/prob';
import { choice, ensureStyle, fq, mq, note } from './c01/kit';

export const meta: DemoMeta = { animated: true, aspect: 1.45, surface: 'stage', webgl2: true };

const D = 24;                 // the lattice of weights the point snaps to: multiples of 1/24
const AXIS = 1.32;            // length of the drawn axes (the corners are at 1)
const FOV = 26;               // vertical field of view in degrees: a drawing choice
const DIST = 5.4;             // camera distance from the target
const TURN = 36;              // seconds for one turn of the turntable while the clock runs
const VIEWS = {
  space: { az: 0.36, el: 0.32 },
  figure: { az: Math.PI / 4, el: Math.asin(1 / Math.sqrt(3)) },      // along (1, 1, 1)
  edge: { az: -Math.PI / 2, el: Math.PI / 2 - 1e-4 },                // down the p(3) axis
};

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const T = ctx.text;
  const P = ctx.symbol('sym.probability-weight');
  const pInner = P.mathml.replace(/^<math[^>]*>/, '').replace(/<\/math>$/, '');
  const pSub = (a: number) => `<math><msub>${pInner}<mn>${a}</mn></msub></math>`;
  const pOf = (a: number) => `<math>${pInner}<mo>(</mo><mn>${a}</mn><mo>)</mo></math>`;

  const s3 = createRenderer(stage, ctx);           // throws DemoUnsupported without WebGL 2: the still stays
  const { renderer } = s3;
  const layer = document.createElement('div');
  layer.className = 'c01-layer';
  layer.setAttribute('aria-hidden', 'true');
  const tags = document.createElement('div');
  const head = document.createElement('div');
  head.className = 'c01-head';
  layer.append(tags, head);
  stage.append(layer);

  // ── state ─────────────────────────────────────────────────────
  let n: 2 | 3 = ctx.params.n === '2' ? 2 : 3;
  const parsed = (ctx.params.p ?? '').split(',').map(Number);
  // one point per n, at the figure's values: (1/2, 1/3, 1/6) for three outcomes, (1/4, 3/4) for two
  const given = parsed.length === 3 && parsed.every((x) => Number.isInteger(x) && x >= 0) && parsed.reduce((s, x) => s + x, 0) === D ? parsed : null;
  const kept: Record<2 | 3, number[]> = { 3: [12, 8, 4], 2: [6, 18, 0] };
  if (given) kept[given[2] === 0 && n === 2 ? 2 : 3] = given;
  let a: number[] = kept[n].slice();
  let view = ctx.params.view === 'figure' ? VIEWS.figure : n === 2 ? VIEWS.edge : VIEWS.space;
  let az0 = view.az, el0 = view.el;
  let now = 0;
  let width = 1, height = 1;
  let a0 = a.slice();

  // ── scene ─────────────────────────────────────────────────────
  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1.45, 0.1, 50);
  camera.up.set(0, 0, 1);
  const mats = {
    ink: new MeshBasicMaterial(), state: new MeshBasicMaterial(), stateFace: new MeshBasicMaterial({ transparent: true, opacity: 0.16, side: DoubleSide, depthWrite: false }),
    halo: new MeshBasicMaterial({ transparent: true, opacity: 0.22, side: DoubleSide, depthWrite: false }), stage: new MeshBasicMaterial({ side: DoubleSide }),
    edgeFace: new MeshBasicMaterial({ transparent: true, opacity: 0.5, side: DoubleSide, depthWrite: false }),
    guide: new LineDashedMaterial({ dashSize: 0.035, gapSize: 0.025, transparent: true, opacity: 0.8 }),
    rule: new MeshBasicMaterial(),
  };
  const E = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
  const tube = (p: Vector3, q: Vector3, r: number, m: MeshBasicMaterial) => {
    const len = p.distanceTo(q);
    const g = new CylinderGeometry(r, r, len, 10, 1, false);
    const mesh = new Mesh(g, m);
    mesh.position.copy(p).add(q).multiplyScalar(0.5);
    mesh.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), q.clone().sub(p).normalize()));
    return mesh;
  };
  const statics = new Group();
  scene.add(statics);
  // axes p(1), p(2), p(3) with arrow heads and a tick at 1
  const axes = E.map((e) => {
    const g = new Group();
    g.add(tube(new Vector3(), e.clone().multiplyScalar(AXIS), 0.0045, mats.ink));
    const cone = new Mesh(new ConeGeometry(0.022, 0.07, 14), mats.ink);
    cone.position.copy(e).multiplyScalar(AXIS + 0.02);
    cone.quaternion.copy(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), e));
    g.add(cone);
    statics.add(g);
    return g;
  });
  // the triangle of weights and its edges
  const faceGeo = new BufferGeometry();
  faceGeo.setAttribute('position', new Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1], 3));
  const face = new Mesh(faceGeo, mats.stateFace);
  statics.add(face);
  const edges = [0, 1, 2].map((i) => tube(E[i], E[(i + 1) % 3], 0.0075, mats.state));
  edges.forEach((e) => statics.add(e));
  const edge12Heavy = tube(E[0], E[1], 0.016, mats.state);
  statics.add(edge12Heavy);
  // corners (point weights): filled discs in print, spheres here, with halos
  const corners = E.map((e) => { const m = new Mesh(new SphereGeometry(0.034, 24, 16), mats.state); m.position.copy(e); statics.add(m); return m; });
  const halos = E.map((e) => { const m = new Mesh(new CircleGeometry(1, 48), mats.halo); m.position.copy(e); scene.add(m); return m; });
  // the centroid (1/3, 1/3, 1/3), marked as in the figure
  const centroid = new Group();
  const cRing = new Mesh(new RingGeometry(0.022, 0.03, 40), mats.state);
  centroid.add(cRing);
  centroid.position.set(1 / 3, 1 / 3, 1 / 3);
  scene.add(centroid);
  // the point p: an open circle (a proper mixture), drawn facing the camera
  const point = new Group();
  const ring = new Mesh(new RingGeometry(0.036, 0.052, 48), mats.state);
  const hole = new Mesh(new CircleGeometry(0.036, 48), mats.stage);
  hole.position.z = -0.001;
  point.add(hole, ring);
  scene.add(point);
  // dashed guides from p to its coordinates
  const guideGeo = new BufferGeometry();
  guideGeo.setAttribute('position', new Float32BufferAttribute(new Float32Array(3 * 2 * 4), 3));
  const guides = new LineSegments(guideGeo, mats.guide);
  scene.add(guides);

  const tokens = () => {
    const k = ctx.tokens;
    const c = (name: string) => { const [r, g, b] = k.rgb(name); return new Color().setRGB(r, g, b, SRGBColorSpace); };
    renderer.setClearColor(c('stage'), 1);
    mats.ink.color = c('stage-ink'); mats.rule.color = c('stage-rule');
    mats.state.color = c('stage-state'); mats.stateFace.color = c('stage-state'); mats.halo.color = c('stage-state'); mats.edgeFace.color = c('stage-state');
    mats.stage.color = c('stage'); mats.guide.color = c('stage-ink');
  };
  tokens();

  // ── controls ──────────────────────────────────────────────────
  const say = () => {
    const p = weights(a);
    ctx.announce(`p = (${p.slice(0, n).map(fq).join(', ')})`);
  };
  const nChoice = choice(ctx, [T('zwei Ergebnisse', 'two outcomes'), T('drei Ergebnisse', 'three outcomes')], n === 2 ? 0 : 1, (i) => setN(i === 0 ? 2 : 3));
  const s1 = ctx.ui.slider({
    label: T('p(1) in 24steln; die anderen Werte teilen sich den Rest', 'p(1) in 24ths; the other values share the rest'),
    labelHtml: pOf(1), min: 0, max: D, step: 1, value: a[0], primary: true, format: (v) => fq(frac(v, D)),
    onInput: (v) => { a = n === 2 ? [v, D - v, 0] : renormalise(a, 0, v); sync(); say(); },
  });
  const s2 = ctx.ui.slider({
    label: T('p(2) in 24steln; die anderen Werte teilen sich den Rest', 'p(2) in 24ths; the other values share the rest'),
    labelHtml: pOf(2), min: 0, max: D, step: 1, value: a[1], format: (v) => fq(frac(v, D)),
    onInput: (v) => { a = n === 2 ? [D - v, v, 0] : renormalise(a, 1, v); sync(); say(); },
  });
  ctx.ui.button(T('Ansicht wie in der Abbildung', 'view as in the figure'), () => { view = n === 2 ? VIEWS.edge : VIEWS.figure; az0 = view.az; el0 = view.el; });
  ctx.ui.button(T('räumliche Ansicht', 'view in space'), () => { view = VIEWS.space; az0 = view.az; el0 = view.el; });
  const outP = ctx.ui.readout(T('Gewicht p', 'weight p'), `${P.mathml}<math><mo>=</mo></math>`);
  const caption = note(ctx);
  const sync = () => { s1.set(a[0]); s2.set(a[1]); };
  const setN = (m: 2 | 3) => {
    kept[n] = a.slice();
    n = m;
    a = kept[n].slice();
    view = n === 2 ? VIEWS.edge : VIEWS.space;
    az0 = view.az; el0 = view.el;
    sync(); say(); ctx.invalidate();
  };

  // ── pointer: drag the point, or turn the scene ───────────────
  const ray = new Raycaster();
  const ndc = new Vector2();
  const plane3 = new Plane(new Vector3(1, 1, 1).normalize(), -1 / Math.sqrt(3));
  const plane2 = new Plane(new Vector3(0, 0, 1), 0);
  const hit = new Vector3();
  const pointerHit = (ev: PointerEvent): number[] | null => {
    const r = s3.canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (!ray.ray.intersectPlane(n === 2 ? plane2 : plane3, hit)) return null;
    return n === 2 ? [hit.x, hit.y, 0] : [hit.x, hit.y, hit.z];
  };
  let drag: { mode: 'point' | 'turn'; x: number; y: number; az: number; el: number } | null = null;
  const onDown = (ev: PointerEvent) => {
    const h = pointerHit(ev);
    const inside = h && h.every((v) => v > -0.12) && (n === 3 || Math.abs(h[0] + h[1] - 1) < 0.15);
    drag = { mode: inside ? 'point' : 'turn', x: ev.clientX, y: ev.clientY, az: az0, el: el0 };
    if (inside) { a0 = a.slice(); movePoint(h!); }
    stage.setPointerCapture(ev.pointerId);
    ev.preventDefault();
  };
  const movePoint = (h: number[]) => {
    const b = n === 2 ? nearestWeight([h[0] - h[1] + 1, h[1] - h[0] + 1, 0], D) : nearestWeight(h, D);
    if (b.some((x, i) => x !== a[i])) { a = b; sync(); ctx.invalidate(); }
  };
  const onMove = (ev: PointerEvent) => {
    if (!drag) return;
    if (drag.mode === 'point') { const h = pointerHit(ev); if (h) movePoint(h); return; }
    az0 = drag.az - (ev.clientX - drag.x) * 0.009;
    el0 = Math.max(-0.25, Math.min(Math.PI / 2 - 1e-4, drag.el + (ev.clientY - drag.y) * 0.009));
    ctx.invalidate();
  };
  const onUp = () => { if (drag?.mode === 'point' && a.some((x, i) => x !== a0[i])) say(); drag = null; };
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onUp);
  stage.style.touchAction = 'none';

  // ── drawing ───────────────────────────────────────────────────
  const v3 = new Vector3();
  const place = (x: number, y: number, z: number, html: string, cls = '', dx = 0, dy = 0) => {
    v3.set(x, y, z).project(camera);
    if (v3.z < -1 || v3.z > 1) return;
    const d = document.createElement('div');
    d.className = `c01-tag ${cls}`;
    d.innerHTML = html;
    d.style.left = `${((v3.x + 1) / 2) * width + dx}px`;
    d.style.top = `${((1 - v3.y) / 2) * height + dy}px`;
    tags.append(d);
  };
  const toScreen = (p: Vector3) => { v3.copy(p).project(camera); return [((v3.x + 1) / 2) * width, ((1 - v3.y) / 2) * height]; };

  const draw = (time: number) => {
    const p = weights(a);
    const v = p.map((q) => Number(q.num) / Number(q.den));
    const corner = pointWeightIndex(a);
    // camera: orbit about the middle of the drawn object; the clock turns it (turntable)
    const target = n === 2 ? new Vector3(0.5, 0.5, 0) : new Vector3(0.4, 0.4, 0.62);
    const az = az0 + (2 * Math.PI * time) / TURN, el = el0;
    camera.position.set(target.x + DIST * Math.cos(el) * Math.cos(az), target.y + DIST * Math.cos(el) * Math.sin(az), target.z + DIST * Math.sin(el));
    camera.lookAt(target);
    camera.updateMatrixWorld();

    // objects of the current n
    face.visible = n === 3;
    edges[1].visible = n === 3; edges[2].visible = n === 3;
    edges[0].visible = n === 3;
    edge12Heavy.visible = n === 2;
    corners[2].visible = n === 3;
    axes[2].visible = n === 3;
    centroid.visible = n === 3 && !(a[0] === 8 && a[1] === 8);
    centroid.quaternion.copy(camera.quaternion);
    // halos: radius grows with p(a) (area proportional to p(a)); a lit corner is the point weight itself
    for (let i = 0; i < 3; i++) {
      const on = i < n && v[i] > 0;
      halos[i].visible = on;
      const r = 0.05 + 0.13 * Math.sqrt(v[i]);
      halos[i].scale.setScalar(r);
      halos[i].quaternion.copy(camera.quaternion);
      corners[i].scale.setScalar(corner === i ? 1.7 : 1);
    }
    point.visible = corner < 0;
    point.position.set(v[0], v[1], v[2]);
    point.quaternion.copy(camera.quaternion);
    // guides: p -> (p1, p2, 0) -> the p(1) and p(2) axes; p -> the p(3) axis
    const g = guideGeo.getAttribute('position') as Float32BufferAttribute;
    const segs: number[][] = n === 3
      ? [[v[0], v[1], v[2], v[0], v[1], 0], [v[0], v[1], 0, v[0], 0, 0], [v[0], v[1], 0, 0, v[1], 0], [v[0], v[1], v[2], 0, 0, v[2]]]
      : [[v[0], v[1], 0, v[0], 0, 0], [v[0], v[1], 0, 0, v[1], 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
    segs.forEach((s, i) => { for (let j = 0; j < 6; j++) (g.array as Float32Array)[6 * i + j] = s[j]; });
    g.needsUpdate = true;
    guides.computeLineDistances();
    // looking (nearly) along (1, 1, 1) the axes run into the middle of the triangle: the guides and
    // the coordinates on the axes would only clutter it; the corner weights carry the numbers there
    const along = n === 3 && camera.position.clone().sub(target).normalize().dot(new Vector3(1, 1, 1).normalize()) > 0.96;
    guides.visible = corner < 0 && !along;
    renderer.render(scene, camera);

    // labels
    tags.replaceChildren();
    const k = ctx.tokens;
    const fs = Math.max(10, Math.min(k.font('label').sizePx, width / 34));
    const narrow = width < 480;           // on a phone the corner weights and the centroid label are left to the formula above
    layer.style.fontSize = `${fs}px`;
    for (let i = 0; i < n; i++) place(E[i].x * (AXIS + 0.24), E[i].y * (AXIS + 0.24), E[i].z * (AXIS + 0.24), pOf(i + 1));
    // corners: p_a and its mixing weight p(a)
    for (let i = 0; i < n; i++) {
      const [sx, sy] = toScreen(E[i]);
      const [ox, oy] = toScreen(new Vector3(0.36, 0.36, n === 3 ? 0.3 : 0));
      const dx = sx - ox, dy = sy - oy, l = Math.hypot(dx, dy) || 1;
      place(E[i].x, E[i].y, E[i].z, `${pSub(i + 1)}${v[i] > 0 && corner < 0 && !narrow ? `<span class="c01-muted"> · </span>${mq(p[i])}` : ''}`, corner === i ? 'c01-strong' : '', (dx / l) * 3.3 * fs, (dy / l) * 2.2 * fs);
    }
    // coordinates on the axes
    // a coordinate is written beside its axis, on the side away from the triangle
    const [mx, my] = toScreen(target);
    const tick = (i: number) => {
      if (!(v[i] > 0 && v[i] < 1)) return;
      const e = E[i].clone().multiplyScalar(v[i]);
      const [ox, oy] = toScreen(new Vector3()), [ex, ey] = toScreen(E[i]), [tx, ty] = toScreen(e);
      let nx = -(ey - oy), ny = ex - ox;
      const l = Math.hypot(nx, ny) || 1;
      nx /= l; ny /= l;
      if (nx * (mx - tx) + ny * (my - ty) > 0) { nx = -nx; ny = -ny; }
      place(e.x, e.y, e.z, mq(p[i]), 'c01-muted', nx * 1.3 * fs, ny * 1.3 * fs);
    };
    if (!along) { tick(0); tick(1); if (n === 3) tick(2); }
    if (corner < 0) place(v[0], v[1], v[2], `${P.mathml}`, 'c01-strong', 1.5 * fs, -1.2 * fs);
    if (centroid.visible && !narrow) place(1 / 3, 1 / 3, 1 / 3, `(${mq(frac(1, 3))}, ${mq(frac(1, 3))}, ${mq(frac(1, 3))})`, 'c01-muted', 0, -2.0 * fs);

    const coords = `(${p.slice(0, n).map(mq).join(', ')})`;
    const decomposition = p.slice(0, n).map((q, i) => (q.num > 0n ? `${q.den === 1n ? '' : mq(q)}${pSub(i + 1)}` : '')).filter((t) => t).join('<math><mo>+</mo></math>');
    const status = corner >= 0
      ? T(`Ecke: das Punktgewicht ${pSub(corner + 1)}, keine echte Mischung.`, `Corner: the point weight ${pSub(corner + 1)}, not a proper mixture.`)
      : p.slice(0, n).filter((q) => q.num > 0n).length === 2 && n === 3
        ? T('Auf einer Kante: eine Mischung zweier Punktgewichte.', 'On an edge: a mixture of two point weights.')
        : n === 3 ? T('Im Inneren: eine Mischung aller drei Punktgewichte.', 'Inside: a mixture of all three point weights.')
          : T('Auf der Strecke: eine Mischung der beiden Punktgewichte.', 'On the segment: a mixture of the two point weights.');
    head.innerHTML = `${P.mathml}<math><mo>=</mo></math>${decomposition}`;
    outP.set(`(${p.slice(0, n).map(fq).join(', ')})`);
    caption.innerHTML = `${status} ${T(
      `Die Koordinaten ${coords} von ${P.mathml} sind zugleich die Wahrscheinlichkeiten der Ergebnisse und die Mischungsgewichte der Ecken (Halos). Ziehen Sie den Punkt im ${n === 3 ? 'Dreieck' : 'Segment'}; ziehen Sie daneben, um die Szene zu drehen.`,
      `The coordinates ${coords} of ${P.mathml} are at once the probabilities of the outcomes and the mixing weights of the corners (halos). Drag the point in the ${n === 3 ? 'triangle' : 'segment'}; drag beside it to turn the scene.`)}`;
  };

  return {
    render(_frame, time) { now = time; draw(time); },
    resize(w, h) {
      width = w; height = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    tokensChanged() { tokens(); },
    info: () => ({ ...s3.info(), n, weight: a.slice(0, n).join(','), denominator: D, corner: pointWeightIndex(a) + 1, time: now }),
    destroy() {
      stage.removeEventListener('pointerdown', onDown); stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp); stage.removeEventListener('pointercancel', onUp);
      scene.traverse((o) => { const m = o as Mesh; m.geometry?.dispose(); });
      Object.values(mats).forEach((m) => m.dispose());
      renderer.dispose();
      s3.canvas.remove(); layer.remove();
    },
  };
}
