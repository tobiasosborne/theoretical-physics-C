// The cone view of c02.demo.explorer (three.js, WebGL 2), on the stage with stage-* roles.
//
// Left: the cone of unnormalised states A(K)^{*+} with K as its section at height one
// (DERIVATION.md section 1.10; hazard 6.3 for the naming). Right: the cone of positive
// affine functions A(K)^+ with E(K) = {f : 0 <= f <= 1_K} inside it (sections 1.7, 1.13).
//
// Drawing frame (height up, the drawing coordinates of model.ts across):
//   bit     states (p0 + p1; p0 - p1): the cone R_+^2 of section 3.2 is {t >= |X|};
//           functions (b; a) = ((q0+q1)/2; (q0-q1)/2): q0, q1 >= 0 is {b >= |a|}. Both flat.
//   square  states {t >= max(|X|, |Y|)}, functions {s >= |A| + |B|}  (section 3.3)
//   qubit   the section r_perp = 0, a_perp = 0 of the four-dimensional cones
//           {t >= |R|} and {b >= |a|} of section 3.5: two circular cones. It is a
//           three-dimensional section and is labelled as one.
// The scene is a function of update(data) and the two view angles; nothing animates.
import {
  BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Group, Line, LineBasicMaterial, LineDashedMaterial, LineSegments, Mesh,
  MeshBasicMaterial, OctahedronGeometry, PerspectiveCamera, Scene, SphereGeometry, SRGBColorSpace, Vector3,
} from 'three';
import { createRenderer, type Stage3D } from '../../demo/three';
import type { DemoContext } from '../../demo/types';
import type { EffectView } from './model';

export type ConeKind = 'bit' | 'square' | 'ball';
export interface ConeData {
  kind: ConeKind;
  omega: [number, number];
  omega2: [number, number];
  mixture: [number, number];
  effect: EffectView;
  labels: { stateCone: string; functionCone: string; K: string; E: string; unit: string; omega: string; e: string };
}

type P2 = [number, number];
const circlePts = (r: number, n = 72): P2[] => Array.from({ length: n }, (_, i) => [r * Math.cos((2 * Math.PI * i) / n), r * Math.sin((2 * Math.PI * i) / n)] as P2);
/** section of the state cone at height 1 (= K) and of the function cone at height 1 */
function bases(kind: ConeKind): { K: P2[]; F: P2[]; closed: boolean } {
  if (kind === 'bit') return { K: [[-1, 0], [1, 0]], F: [[-1, 0], [1, 0]], closed: false };
  if (kind === 'square') return { K: [[1, 1], [-1, 1], [-1, -1], [1, -1]], F: [[1, 0], [0, 1], [-1, 0], [0, -1]], closed: true };
  return { K: circlePts(1), F: circlePts(1), closed: true };
}
// scene axes: height -> y, drawing x -> x, drawing y -> -z
const v3 = (h: number, p: P2): [number, number, number] => [p[0], h, -p[1]];

const TOP = 1.15;     // the cones are drawn up to this height (they are unbounded); a drawing choice
const SEP = 1.95;     // half the distance between the two cones in the scene; a drawing choice

export class ConeView {
  private readonly s3: Stage3D;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(30, 2, 0.1, 100);
  private readonly left = new Group();
  private readonly right = new Group();
  private readonly labels: HTMLElement;
  private readonly spans: Array<{ el: HTMLSpanElement; at: Vector3; group: Group }> = [];
  private kind: ConeKind | null = null;
  private data: ConeData | null = null;
  private dynamic: Array<{ dispose(): void }> = [];
  private readonly dyn = new Group();
  private readonly dynR = new Group();
  az = 0.6; elev = 0.32;
  private mats: { state: LineBasicMaterial; effect: LineDashedMaterial; effectSolid: LineBasicMaterial; ink: LineBasicMaterial; rule: LineBasicMaterial; stateFace: MeshBasicMaterial; effectFace: MeshBasicMaterial; eFace: MeshBasicMaterial; statePt: MeshBasicMaterial; effectPt: MeshBasicMaterial };

  constructor(private readonly host: HTMLElement, private readonly ctx: DemoContext) {
    this.s3 = createRenderer(host, ctx);          // throws DemoUnsupported without WebGL 2
    this.labels = document.createElement('div');
    this.labels.className = 'c02-3d-labels';
    this.labels.setAttribute('aria-hidden', 'true');
    host.append(this.labels);
    this.left.position.x = -SEP; this.right.position.x = SEP;
    this.left.add(this.dyn); this.right.add(this.dynR);
    this.scene.add(this.left, this.right);
    this.mats = {
      state: new LineBasicMaterial(), effect: new LineDashedMaterial({ dashSize: 0.07, gapSize: 0.035 }), effectSolid: new LineBasicMaterial(),
      ink: new LineBasicMaterial(), rule: new LineBasicMaterial(),
      stateFace: new MeshBasicMaterial({ side: DoubleSide, transparent: true, opacity: 0.1, depthWrite: false }),
      effectFace: new MeshBasicMaterial({ side: DoubleSide, transparent: true, opacity: 0.08, depthWrite: false }),
      eFace: new MeshBasicMaterial({ side: DoubleSide, transparent: true, opacity: 0.28, depthWrite: false }),
      statePt: new MeshBasicMaterial(), effectPt: new MeshBasicMaterial(),
    };
    this.tokens();
  }

  tokens(): void {
    const k = this.ctx.tokens;
    const c = (name: string) => { const [r, g, b] = k.rgb(name); return new Color().setRGB(r, g, b, SRGBColorSpace); };
    this.s3.renderer.setClearColor(c('stage'), 1);
    this.mats.state.color = c('stage-state'); this.mats.stateFace.color = c('stage-state'); this.mats.statePt.color = c('stage-state');
    this.mats.effect.color = c('stage-effect'); this.mats.effectSolid.color = c('stage-effect'); this.mats.effectFace.color = c('stage-effect');
    this.mats.eFace.color = c('stage-effect'); this.mats.effectPt.color = c('stage-effect');
    this.mats.ink.color = c('stage-ink'); this.mats.rule.color = c('stage-rule');
  }

  private lines(pts: number[], mat: LineBasicMaterial | LineDashedMaterial, loop = false): Line | LineSegments {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pts, 3));
    const l = loop ? new Line(g, mat) : new LineSegments(g, mat);
    if (mat instanceof LineDashedMaterial) l.computeLineDistances();
    return l;
  }
  private fan(apex: [number, number, number], rim: Array<[number, number, number]>, closed: boolean, mat: MeshBasicMaterial): Mesh {
    const pos: number[] = [];
    const n = rim.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) pos.push(...apex, ...rim[i], ...rim[(i + 1) % n]);
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pos, 3));
    return new Mesh(g, mat);
  }
  private outline(h: number, base: P2[], scale: number, closed: boolean): number[] {
    const pts: number[] = [];
    const n = base.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) pts.push(...v3(h, [base[i][0] * scale, base[i][1] * scale]), ...v3(h, [base[(i + 1) % n][0] * scale, base[(i + 1) % n][1] * scale]));
    return pts;
  }
  private label(html: string, at: [number, number, number], group: Group): void {
    const el = document.createElement('span');
    el.innerHTML = html;
    this.labels.append(el);
    this.spans.push({ el, at: new Vector3(...at), group });
  }

  private build(d: ConeData): void {
    for (const g of [this.left, this.right]) for (const o of [...g.children]) if (o !== this.dyn && o !== this.dynR) { g.remove(o); ((o as Mesh).geometry as BufferGeometry | undefined)?.dispose(); }
    this.labels.textContent = ''; this.spans.length = 0;
    const { K, F, closed } = bases(d.kind);
    const rays = d.kind === 'ball' ? K.map((_, i) => i).filter((i) => i % 6 === 0) : K.map((_, i) => i);      // a round cone: twelve generators
    const apex: [number, number, number] = [0, 0, 0];
    // state cone with K at height one
    this.left.add(this.fan(apex, K.map((p) => v3(TOP, [p[0] * TOP, p[1] * TOP])), closed, this.mats.stateFace));
    const rayPts: number[] = [];
    for (const i of rays) rayPts.push(0, 0, 0, ...v3(TOP, [K[i][0] * TOP, K[i][1] * TOP]));
    this.left.add(this.lines(rayPts, this.mats.state));
    this.left.add(this.lines(this.outline(1, K, 1, closed), this.mats.ink));
    this.left.add(this.lines([0, 0, 0, 0, TOP, 0], this.mats.rule));
    // function cone with E(K) between 0 and the unit
    this.right.add(this.fan(apex, F.map((p) => v3(TOP, [p[0] * TOP, p[1] * TOP])), closed, this.mats.effectFace));
    const fr: number[] = [];
    const fRays = d.kind === 'ball' ? F.map((_, i) => i).filter((i) => i % 6 === 0) : F.map((_, i) => i);
    for (const i of fRays) fr.push(0, 0, 0, ...v3(TOP, [F[i][0] * TOP, F[i][1] * TOP]));
    this.right.add(this.lines(fr, this.mats.effect));
    const eq = F.map((p) => v3(0.5, [p[0] * 0.5, p[1] * 0.5]));
    this.right.add(this.fan([0, 0, 0], eq, closed, this.mats.eFace), this.fan([0, 1, 0], eq, closed, this.mats.eFace));
    this.right.add(this.lines(this.outline(0.5, F, 0.5, closed), this.mats.ink));
    const up: number[] = [];
    for (const i of fRays) up.push(0, 1, 0, ...eq[i], 0, 0, 0, ...eq[i]);
    this.right.add(this.lines(up, d.kind === 'ball' ? this.mats.rule : this.mats.ink));
    this.right.add(this.lines([0, 0, 0, 0, TOP, 0], this.mats.rule));
    const L = d.labels;
    const far = d.kind === 'bit' ? [1.12, 0] as P2 : d.kind === 'square' ? [1.1, -1.1] as P2 : [0.85, -0.85] as P2;
    this.label(L.K, v3(1, far), this.left);
    this.label(L.stateCone, [0, TOP + 0.22, 0], this.left);
    this.label(L.functionCone, [0, TOP + 0.22, 0], this.right);
    this.label(L.unit, [0.14, 1.06, 0], this.right);
    this.label('0', [0, -0.13, 0], this.left);
    this.label('0', [0, -0.13, 0], this.right);
    this.label(L.E, v3(0.5, d.kind === 'bit' ? [0.78, 0] : [0.62, -0.5]), this.right);
    this.label(L.omega, [0, 0, 0], this.left);      // moved in update
    this.label(L.e, [0, 0, 0], this.right);
  }

  update(d: ConeData): void {
    if (d.kind !== this.kind) { this.build(d); this.kind = d.kind; }
    this.data = d;
    for (const x of this.dynamic) x.dispose();
    this.dynamic = [];
    this.dyn.clear(); this.dynR.clear();
    const sphere = (at: [number, number, number], r: number, mat: MeshBasicMaterial, g: Group, octa = false) => {
      const geo = octa ? new OctahedronGeometry(r) : new SphereGeometry(r, 16, 12);
      const me = new Mesh(geo, mat); me.position.set(...at); g.add(me); this.dynamic.push(geo);
    };
    const add = (o: Line | LineSegments, g: Group) => { g.add(o); this.dynamic.push(o.geometry); };
    const w = v3(1, d.omega), w2 = v3(1, d.omega2), mx = v3(1, d.mixture);
    add(this.lines([0, 0, 0, w[0] * TOP, TOP, w[2] * TOP], this.mats.state), this.dyn);     // the ray through omega
    add(this.lines([...w, ...w2], this.mats.state), this.dyn);
    sphere(w, 0.045, this.mats.statePt, this.dyn); sphere(w2, 0.03, this.mats.statePt, this.dyn); sphere(mx, 0.024, this.mats.statePt, this.dyn);
    const e = v3(d.effect.b, d.effect.a);
    add(this.lines([0, d.effect.b, 0, ...e], this.mats.effectSolid), this.dynR);
    sphere(e, 0.055, this.mats.effectPt, this.dynR, true);
    this.spans[this.spans.length - 2].at.set(w[0] + 0.12, w[1] + 0.1, w[2]);
    this.spans[this.spans.length - 1].at.set(e[0] + 0.13, e[1] + 0.08, e[2]);
  }

  render(): void {
    const r = this.host.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    this.s3.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // the whole scene (width 2 (SEP + TOP), height TOP) must fit: distance from the horizontal field of view
    const halfW = SEP + TOP * Math.SQRT2 + 0.1;        // the corner of the square section at height TOP, at any turn
    const fovY = (this.camera.fov * Math.PI) / 180;
    const dist = Math.max(halfW / (Math.tan(fovY / 2) * this.camera.aspect), (TOP * 0.5 + 0.75) / Math.tan(fovY / 2)) * 1.02;
    const cy = TOP * 0.5 + 0.08;
    this.camera.position.set(0, cy + dist * Math.sin(this.elev), dist * Math.cos(this.elev));
    this.camera.lookAt(0, cy, 0);
    this.camera.updateProjectionMatrix();
    // the two cones turn about their own axes (the same angle), so they stay side by side
    this.left.rotation.y = this.az; this.right.rotation.y = this.az;
    this.scene.updateMatrixWorld(true);
    this.s3.renderer.render(this.scene, this.camera);
    const v = new Vector3();
    for (const s of this.spans) {
      v.copy(s.at).applyMatrix4(s.group.matrixWorld).project(this.camera);
      s.el.style.left = `${((v.x + 1) / 2) * 100}%`;
      s.el.style.top = `${((1 - v.y) / 2) * 100}%`;
    }
  }
  turn(daz: number, del: number): void {
    this.az += daz;
    this.elev = Math.max(0.05, Math.min(1.2, this.elev + del));
  }
  info(): Record<string, string | number | boolean> { return this.s3.info(); }
  dispose(): void {
    for (const x of this.dynamic) x.dispose();
    this.s3.renderer.dispose();
    this.s3.canvas.remove(); this.labels.remove();
  }
}
