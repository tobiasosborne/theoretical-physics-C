// c99.demo.scherung-b: the unit square and its image under (x, y) -> (x, s x + y), drawn as
// two thin slabs in a three.js scene on WebGL 2 (contract-test chapter, figure
// c99.fig.scherung-b). Physics-free. This is also the scene the frame capture uses to show
// that headless WebGL 2 works (web/CAPTURE-NOTES.md).
import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Group, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, PerspectiveCamera, REVISION, Scene } from 'three';
import { createRenderer } from '../demo/three';
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { imageOfUnitSquare, shearMatrixY, UNIT_SQUARE, type Vec2 } from '../kernels/shear';

export const meta: DemoMeta = { animated: true, aspect: 16 / 9, webgl2: true };

const THICK = 0.18;   // slab thickness along z, a drawing choice without mathematical meaning

/** positions of a slab over the quadrilateral q (4 corners, counter-clockwise), z in [0, THICK] */
function slab(q: readonly Vec2[]): { faces: number[]; edges: number[] } {
  const v = (i: number, top: boolean): [number, number, number] => [q[i][0], q[i][1], top ? THICK : 0];
  const faces: number[] = [];
  const tri = (a: number[], b: number[], c: number[]) => faces.push(...a, ...b, ...c);
  tri(v(0, true), v(1, true), v(2, true)); tri(v(0, true), v(2, true), v(3, true));
  tri(v(0, false), v(2, false), v(1, false)); tri(v(0, false), v(3, false), v(2, false));
  const edges: number[] = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    tri(v(i, false), v(j, false), v(j, true)); tri(v(i, false), v(j, true), v(i, true));
    edges.push(...v(i, true), ...v(j, true), ...v(i, false), ...v(j, false), ...v(i, false), ...v(i, true));
  }
  return { faces, edges };
}

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  const s3 = createRenderer(stage, ctx);
  const { renderer } = s3;
  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 16 / 9, 0.1, 100);
  const group = new Group();
  scene.add(group);

  const imageMat = new MeshBasicMaterial({ side: DoubleSide });
  const imageEdgeMat = new LineBasicMaterial();
  const squareEdgeMat = new LineBasicMaterial();
  const axisMat = new LineBasicMaterial();
  const imageGeo = new BufferGeometry();
  const imageEdgeGeo = new BufferGeometry();
  const squareEdgeGeo = new BufferGeometry();
  squareEdgeGeo.setAttribute('position', new Float32BufferAttribute(slab(UNIT_SQUARE).edges, 3));
  const axisGeo = new BufferGeometry();
  axisGeo.setAttribute('position', new Float32BufferAttribute([-0.6, 0, 0, 2.2, 0, 0, 0, -0.3, 0, 0, 4.4, 0], 3));
  group.add(new LineSegments(axisGeo, axisMat), new Mesh(imageGeo, imageMat), new LineSegments(imageEdgeGeo, imageEdgeMat), new LineSegments(squareEdgeGeo, squareEdgeMat));
  // centre of the drawing window of the print figure: x in [-0.6, 2.2], y in [-0.3, 4.4]
  group.position.set(-0.8, -2.05, 0);

  const paint = () => {
    const k = ctx.tokens;
    renderer.setClearColor(new Color(k.color('stage')), 1);
    imageMat.color.set(k.color('stage-state'));
    imageEdgeMat.color.set(k.color('stage-ink'));
    squareEdgeMat.color.set(k.color('stage-dynamics'));
    axisMat.color.set(k.color('stage-rule'));
  };
  paint();

  let s = Number(ctx.params.s ?? '3');
  const fmt = (v: number) => v.toLocaleString(ctx.lang, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = (v: number) => v.toLocaleString(ctx.lang, { maximumFractionDigits: 2 });
  ctx.ui.slider({
    label: ctx.text('Parameter s der Scherung', 'parameter s of the shear'),
    labelHtml: '<math><mi>s</mi></math>',
    min: 0, max: 3, step: 0.25, value: s, primary: true, format: fmt,
    onInput: (v) => { s = v; },
  });
  const cornerOut = ctx.ui.readout(ctx.text('Bild der Ecke (1, 1)', 'image of the corner (1, 1)'));

  return {
    render(_frame, time) {
      const q = imageOfUnitSquare(shearMatrixY(s));
      const g = slab(q);
      imageGeo.setAttribute('position', new Float32BufferAttribute(g.faces, 3));
      imageEdgeGeo.setAttribute('position', new Float32BufferAttribute(g.edges, 3));
      // the camera looks down on the slabs from a fixed elevation and swings about the
      // vertical axis with period 8 s
      const az = 0.35 + 0.45 * Math.sin((2 * Math.PI * time) / 8);
      const dist = 9.5;
      camera.position.set(dist * Math.sin(az), 2.4, dist * Math.cos(az));
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      cornerOut.set(`(${num(q[2][0])}; ${num(q[2][1])})`);
    },
    resize(w, h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    tokensChanged: paint,
    info: () => ({ ...s3.info(), three: REVISION, triangles: renderer.info.render.triangles }),
    destroy() {
      for (const g of [imageGeo, imageEdgeGeo, squareEdgeGeo, axisGeo]) g.dispose();
      for (const m of [imageMat, imageEdgeMat, squareEdgeMat, axisMat]) m.dispose();
      renderer.dispose();
      s3.canvas.remove();
    },
  };
}
