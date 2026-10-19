// c11.demo.cloud: the cloud of the relative coordinate for the states with n <= 2.
//
// WHAT IS DRAWN. N points, each an independent exact sample of the relative position
// r = r_e - r_p from |psi(r)|^2 d^3r (kernel: sampleRelative, inverse-CDF sampling of the
// radius from the closed-form distribution function and of the angles from |Y|^2). Every
// point has the same weight; the density of points is the probability density. Nothing is
// truncated: there is no cut-off radius. A slab |y| <= d (front view) or |z| <= d (top view)
// can be cut out to look inside; the points in it are the samples that fell into it.
// The laboratory mode shows instead exact samples of the electron position r_e = R + (m_p/M) r
// and of the proton position r_p = R - (m_e/M) r for a Gaussian centre-of-mass packet
// (DERIVATION.md Result 1b.1), and an inset with the two densities along a line.
//
// RENDERING CHOICES (drawing, not physics): see POINTS, POINT_PX, ALPHA, FADE below.
// three.js on WebGL 2; colours and type from tokens only; phase colours from the cyclic map
// of ./c11/oklch.ts.
import {
  BufferGeometry, Color, Float32BufferAttribute, Group, LineBasicMaterial, LineDashedMaterial, LineSegments, NormalBlending, PerspectiveCamera,
  Points, REVISION, Scene, ShaderMaterial, Vector3,
} from 'three';
import storyboard from '../../video/c11-hydrogen.storyboard.json';
import { createRenderer } from '../demo/three';
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import {
  enclosedProbabilityRadius, laboratoryPositions, lineProfiles, M_E_OVER_M_P, makeRng, massFractions, phase as argOf, psiState, radialNodes,
  radialQuantile, sampleCentreOfMass, sampleRelative, STATE_KEYS, STATES, type StateKey,
} from '../kernels/hydrogen';
import { abs2, captionBelow, choice, div, ensureStyle, fix, mn, mo, row, sci, stateText, svgEl, sym, toggle } from './c11/common';
import { makePhaseMap, type PhaseMap } from './c11/oklch';

export const meta: DemoMeta = { animated: true, aspect: 1.5, webgl2: true };

// ── drawing choices (none of them is a physical quantity) ────────────────────────────────
/** number of sampled positions per state */
const POINTS = 120000;
/** proton positions drawn in the laboratory mode */
const PROTON_POINTS = 8000;
/** point diameter in CSS px at the distance of the origin, per 100 px of stage height, and its lower limit in px */
const POINT_PX = 0.36, POINT_MIN_PX = 1.5;
/** opacity of one point at the front of the scene */
const ALPHA = 0.45;
/** depth cue: at the far end of the scene a point keeps this fraction of its opacity and is mixed this far towards the stage colour */
const FADE_ALPHA = 0.45, FADE_COLOUR = 0.5;
/** enclosed probability of the overlay sphere (DERIVATION.md Result 7.3) */
const SPHERE_P = 0.9;
/** largest slab half-thickness of the slider, in a_mu; at this value the whole cloud is shown */
const CUT_ALL = 16;
/** camera: vertical field of view in degrees, distance in units of the scene radius, swing of the azimuth and its period in s */
const FOV = 30, DIST = 3.9, SWING = 0.5, SWING_PERIOD = 16;

type View = 'front' | 'top';
interface Scene_ {
  id: string; seconds: number; state: StateKey; view: View; cut: number | null | [number, number]; sphere: boolean; phase: boolean; lab: boolean;
  sigma?: number | [number, number]; mass_factor?: number; az: [number, number]; el: [number, number];
}
const lerp = (v: number | [number, number], u: number): number => (Array.isArray(v) ? v[0] + (v[1] - v[0]) * u : v);

const VERT = `
attribute vec3 aColor;
uniform float uCut; uniform int uAxis; uniform float uPx; uniform float uMinPx; uniform float uDist; uniform float uRadius;
varying vec3 vColor; varying float vFar;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  float along = uAxis == 1 ? position.y : position.z;
  float shown = step(abs(along), uCut);
  vFar = clamp((depth - (uDist - uRadius)) / (2.0 * uRadius), 0.0, 1.0);
  vColor = aColor;
  gl_PointSize = shown * max(uMinPx, uPx * uDist / depth);
  if (shown < 0.5) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
}`;
const FRAG = `
precision highp float;
uniform vec3 uStage; uniform float uAlpha; uniform float uFadeAlpha; uniform float uFadeColour;
varying vec3 vColor; varying float vFar;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float edge = 1.0 - smoothstep(0.32, 0.5, d);
  vec3 c = mix(vColor, uStage, uFadeColour * vFar);
  gl_FragColor = vec4(c, uAlpha * edge * mix(1.0, uFadeAlpha, vFar));
}`;

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const s3 = createRenderer(stage, ctx);
  const { renderer } = s3;
  const capture = Boolean(ctx.params.stage);
  const layer = div('c11-layer c11-stage-ink');
  const inset = svgEl('svg', { 'aria-hidden': 'true' });
  inset.style.position = 'absolute';
  stage.append(inset, layer);
  const head = div('c11-head', layer), foot = div('c11-foot', layer), tags = div('', layer);

  // ── state ──────────────────────────────────────────────────────────────────────────────
  const tour = ctx.params.tour === storyboard.id ? (storyboard.scenes as unknown as Scene_[]) : null;
  let key: StateKey = STATE_KEYS.includes(ctx.params.state as StateKey) ? (ctx.params.state as StateKey) : '2p0';
  let view: View = ctx.params.view === 'top' ? 'top' : 'front';
  let cut = Number(ctx.params.cut ?? '1.5');
  let sphere = ctx.params.sphere === '1';
  let phaseOn = ctx.params.phase === '1';
  let lab = ctx.params.lab === '1';
  let sigma = Number(ctx.params.sigma ?? '1');
  let massLog = Number(ctx.params.masslog ?? '0');       // log10 of the factor on m_e/m_p
  let az0 = 0, el0 = view === 'top' ? 1.15 : 0.3;        // set by dragging
  let width = 1, height = 1;
  const MASS_LOG_MAX = Math.log10(1 / M_E_OVER_M_P);     // factor at which m_e/m_p = 1
  const massRatio = () => M_E_OVER_M_P * 10 ** massLog;

  // one seed per state from the harness generator, drawn in a fixed order, so that the sample
  // of a state does not depend on the order in which states are visited
  const seeds = new Map<StateKey, number>(STATE_KEYS.map((k) => [k, Math.floor(ctx.random() * 4294967296)]));
  interface Sample { relative: Float32Array; centre: Float32Array; phase: Float32Array }
  const samples = new Map<StateKey, Sample>();
  const sampleOf = (k: StateKey): Sample => {
    let s = samples.get(k);
    if (!s) {
      const rand = makeRng(seeds.get(k)!);
      const relative = new Float32Array(3 * POINTS), centre = new Float32Array(3 * POINTS), ph = new Float32Array(POINTS);
      for (let i = 0; i < POINTS; i++) {
        const r = sampleRelative(k, rand);
        relative.set(r, 3 * i);
        ph[i] = argOf(psiState(k, r[0], r[1], r[2]));
      }
      for (let i = 0; i < POINTS; i++) centre.set(sampleCentreOfMass(1, rand), 3 * i);
      s = { relative, centre, phase: ph };
      samples.set(k, s);
    }
    return s;
  };

  // ── scene ──────────────────────────────────────────────────────────────────────────────
  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1.5, 0.1, 2000);
  camera.up.set(0, 0, 1);
  const geo = new BufferGeometry();
  const posAttr = new Float32BufferAttribute(new Float32Array(3 * (POINTS + PROTON_POINTS)), 3);
  const colAttr = new Float32BufferAttribute(new Float32Array(3 * (POINTS + PROTON_POINTS)), 3);
  geo.setAttribute('position', posAttr);
  geo.setAttribute('aColor', colAttr);
  const mat = new ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false, blending: NormalBlending,
    uniforms: {
      uCut: { value: 1 }, uAxis: { value: 1 }, uPx: { value: 2 }, uMinPx: { value: 1.5 }, uDist: { value: 10 }, uRadius: { value: 5 },
      uStage: { value: new Vector3() }, uAlpha: { value: ALPHA }, uFadeAlpha: { value: FADE_ALPHA }, uFadeColour: { value: FADE_COLOUR },
    },
  });
  const points = new Points(geo, mat);
  points.frustumCulled = false;
  const axisMat = new LineBasicMaterial();
  const sphereMat = new LineDashedMaterial({ dashSize: 0.3, gapSize: 0.2 });
  const axes = new LineSegments(new BufferGeometry(), axisMat);
  const sphereLines = new LineSegments(new BufferGeometry(), sphereMat);
  const group = new Group();
  group.add(axes, sphereLines, points);
  scene.add(group);

  let map: PhaseMap = makePhaseMap(ctx.tokens.rgb('stage'), ctx.tokens.rgb('stage-state'));
  let built = '';          // what the buffers currently hold
  let radius = 5;          // scene radius in a_mu
  let tick = 1;
  let shownCount = 0;
  let first = 0;           // index of the first electron (or relative) position in the buffer

  const circle = (r: number, plane: 0 | 1 | 2, out: number[]) => {
    const M = 96;
    for (let i = 0; i < M; i++) {
      const a = (2 * Math.PI * i) / M, b = (2 * Math.PI * (i + 1)) / M;
      const p = (t: number) => (plane === 0 ? [0, r * Math.cos(t), r * Math.sin(t)] : plane === 1 ? [r * Math.cos(t), 0, r * Math.sin(t)] : [r * Math.cos(t), r * Math.sin(t), 0]);
      out.push(...p(a), ...p(b));
    }
  };

  const build = () => {
    const s = STATES[key];
    const q = massRatio();
    const id = [key, lab ? `lab:${sigma}:${massLog}` : 'rel', phaseOn, ctx.tokens.pkg, ctx.tokens.ground].join('|');
    if (id === built) return;
    built = id;
    const smp = sampleOf(key);
    const pos = posAttr.array as Float32Array, col = colAttr.array as Float32Array;
    const stateRgb = ctx.tokens.rgb('stage-state'), inkRgb = ctx.tokens.rgb('stage-ink');
    if (lab) {
      // proton positions first, so that they lie under the electron positions: the kernel writes
      // r_p = sigma R - a r for the first PROTON_POINTS samples and r_e = sigma R + b r for all
      laboratoryPositions(smp.centre, smp.relative, sigma, q, pos.subarray(3 * PROTON_POINTS), pos.subarray(0, 3 * PROTON_POINTS), POINTS);
      for (let i = 0; i < PROTON_POINTS; i++) col.set(inkRgb, 3 * i);
      for (let i = 0; i < POINTS; i++) col.set(stateRgb, 3 * (PROTON_POINTS + i));
      first = PROTON_POINTS;
      geo.setDrawRange(0, POINTS + PROTON_POINTS);
    } else {
      pos.set(smp.relative);
      if (phaseOn) for (let i = 0; i < POINTS; i++) col.set(map.srgb(smp.phase[i], 1), 3 * i);
      else for (let i = 0; i < POINTS; i++) col.set(stateRgb, 3 * i);
      first = 0;
      geo.setDrawRange(0, POINTS);
    }
    posAttr.needsUpdate = true; colAttr.needsUpdate = true;

    // scene radius: the sphere that encloses 99 % of the relative coordinate, widened by the packet in the laboratory mode
    const r99 = radialQuantile(s.n, s.l, 0.99);
    radius = lab ? r99 * massFractions(q).b + 2 * sigma : r99;
    tick = radius <= 6 ? 1 : 5;
    const L = radius;
    const ax: number[] = [-L, 0, 0, L, 0, 0, 0, -L, 0, 0, L, 0, 0, 0, -L, 0, 0, L];
    const h = 0.012 * radius * 3;
    const T = Math.floor((0.93 * L) / tick) * tick;
    for (let t = -T; t <= T; t += tick) {
      if (t === 0) continue;
      ax.push(t, 0, -h, t, 0, h, 0, t, -h, 0, t, h, -h, 0, t, h, 0, t);
    }
    axes.geometry.dispose();
    axes.geometry = new BufferGeometry();
    axes.geometry.setAttribute('position', new Float32BufferAttribute(ax, 3));
    const sp: number[] = [];
    if (!lab) {
      const rp = enclosedProbabilityRadius(s.n, s.l, SPHERE_P);
      circle(rp, 0, sp); circle(rp, 1, sp); circle(rp, 2, sp);
    }
    sphereLines.geometry.dispose();
    sphereLines.geometry = new BufferGeometry();
    sphereLines.geometry.setAttribute('position', new Float32BufferAttribute(sp, 3));
    sphereLines.computeLineDistances();
    sphereMat.dashSize = 0.035 * radius; sphereMat.gapSize = 0.025 * radius;
  };

  const paint = () => {
    const k = ctx.tokens;
    renderer.setClearColor(new Color(k.color('stage')), 1);
    axisMat.color.set(k.color('stage-rule'));
    sphereMat.color.set(k.color('stage-effect'));
    (mat.uniforms.uStage.value as Vector3).set(...k.rgb('stage'));
    map = makePhaseMap(k.rgb('stage'), k.rgb('stage-state'));
    built = '';
  };
  paint();

  // ── controls ───────────────────────────────────────────────────────────────────────────
  const aMuU = ctx.symbol('sym.bohr-radius-reduced').unicode;
  const cutText = (v: number) => (v >= CUT_ALL ? ctx.text('alles', 'all') : `${fix(ctx, v, 2)} ${aMuU}`);
  if (!tour) {
    choice<StateKey>(ctx, ctx.text('Zustand', 'state'), STATE_KEYS.map((k) => ({
      value: k, html: stateText(ctx, k).shortHtml, title: ctx.text(`Zustand ${stateText(ctx, k).short}`, `state ${stateText(ctx, k).short}`),
    })), key, (k) => { key = k; });
    ctx.ui.slider({
      label: ctx.text('halbe Dicke der gezeigten Schicht', 'half-thickness of the slab shown'),
      labelHtml: ctx.text('Schicht', 'slab'),
      min: 0.25, max: CUT_ALL, step: 0.25, value: Math.min(CUT_ALL, cut), primary: true, format: cutText,
      onInput: (v) => { cut = v; },
    });
    choice<View>(ctx, ctx.text('Blickrichtung', 'viewing direction'), [
      { value: 'front', html: ctx.text('von vorn', 'front'), title: ctx.text('Blick entlang der y-Achse; Schicht |y| ≤ d', 'view along the y axis; slab |y| ≤ d') },
      { value: 'top', html: ctx.text('von oben', 'top'), title: ctx.text('Blick von schräg oben; Schicht |z| ≤ d', 'view from above at an angle; slab |z| ≤ d') },
    ], view, (v) => { view = v; az0 = 0; el0 = v === 'top' ? 1.15 : 0.3; });
    toggle(ctx, ctx.text('Phase als Farbe', 'phase as colour'), phaseOn, (on) => { phaseOn = on; });
    toggle(ctx, ctx.text(`Kugel ${Math.round(100 * SPHERE_P)} %`, `sphere ${Math.round(100 * SPHERE_P)} %`), sphere, (on) => { sphere = on; });
    toggle(ctx, ctx.text('Labor: Elektron und Proton', 'laboratory: electron and proton'), lab, (on) => { lab = on; });
    ctx.ui.slider({
      label: ctx.text('Labor: Breite sigma des Schwerpunktpakets in a_mu', 'laboratory: width sigma of the centre-of-mass packet in a_mu'),
      labelHtml: ctx.text('Labor: ', 'laboratory: ') + '<math><mi>σ</mi></math>',
      min: 0.1, max: 4, step: 0.1, value: sigma, format: (v) => `${fix(ctx, v, 1)} ${aMuU}`,
      onInput: (v) => { sigma = v; },
    });
    ctx.ui.slider({
      label: ctx.text('Labor: Faktor auf das Massenverhältnis m_e/m_p (1 = CODATA; größer ist nicht physikalisch)', 'laboratory: factor on the mass ratio m_e/m_p (1 = CODATA; larger is not physical)'),
      labelHtml: ctx.text('Labor: ', 'laboratory: ') + row(sym(ctx, 'sym.electron-mass'), mo('/'), sym(ctx, 'sym.proton-mass')) + ' ×',
      min: 0, max: MASS_LOG_MAX, step: MASS_LOG_MAX / 40, value: massLog,
      format: (v) => (v === 0 ? '1 (CODATA 2022)' : `${v < 1 ? fix(ctx, 10 ** v, 2) : String(Math.round(10 ** v))} ${ctx.text('(nicht physikalisch)', '(not physical)')}`),
      onInput: (v) => { massLog = v; },
    });
  }
  const caption = tour ? null : captionBelow(ctx);

  // drag to turn (mouse, touch, pen); the keyboard has the two viewing directions
  let drag: { x: number; y: number; az: number; el: number } | null = null;
  const onDown = (e: PointerEvent) => { if (tour) return; drag = { x: e.clientX, y: e.clientY, az: az0, el: el0 }; stage.setPointerCapture(e.pointerId); };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    az0 = drag.az - (e.clientX - drag.x) * 0.008;
    el0 = Math.max(-1.5, Math.min(1.5, drag.el + (e.clientY - drag.y) * 0.008));
    ctx.invalidate();
  };
  const onUp = () => { drag = null; };
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onUp);
  stage.style.touchAction = 'pan-y';

  // ── inset: densities along a line (laboratory mode) ────────────────────────────────────
  let insetKey = '';
  let insetRect: { x0: number; y0: number; x1: number; y1: number } | null = null;
  let insetData: { xs: number[]; relative: number[]; laboratory: number[] } | null = null;
  const drawInset = () => {
    inset.replaceChildren();
    insetRect = null;
    if (!lab) { inset.style.display = 'none'; return; }
    inset.style.display = 'block';
    const k = ctx.tokens;
    const fs = capture ? height / 42 : Math.min(k.font('label').sizePx, width / 34);
    const w = Math.min(width * (capture ? 0.3 : 0.36), 30 * fs), h = w * 0.62;
    insetRect = { x0: width - 0.6 * fs - w, y0: (capture ? 4.2 : 3.4) * fs, x1: width, y1: (capture ? 4.2 : 3.4) * fs + h };
    inset.style.right = `${0.6 * fs}px`; inset.style.top = `${capture ? 4.2 * fs : 3.4 * fs}px`;
    inset.style.width = `${w}px`; inset.style.height = `${h}px`; inset.style.left = 'auto'; inset.style.bottom = 'auto';
    inset.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const s = STATES[key], q = massRatio();
    const id = `${key}|${sigma}|${massLog}`;
    const X = Math.ceil(radius);
    if (id !== insetKey || !insetData) {
      const xs = Array.from({ length: 121 }, (_, i) => -X + (2 * X * i) / 120);
      insetData = { xs, ...lineProfiles(key, sigma, q, 1, xs) };
      insetKey = id;
    }
    const d = insetData;
    const ymax = Math.max(...d.relative, ...d.laboratory);
    const mL = 0.4 * fs, mB = 1.5 * fs, mT = 2.6 * fs;
    const px = (x: number) => mL + ((x + X) / (2 * X)) * (w - 2 * mL), py = (y: number) => h - mB - (y / ymax) * (h - mB - mT);
    const path = (ys: number[]) => ys.map((y, i) => `${i ? 'L' : 'M'} ${px(d.xs[i]).toFixed(1)} ${py(y).toFixed(1)}`).join(' ');
    inset.append(svgEl('rect', { x: 0, y: 0, width: w, height: h, fill: k.color('stage'), 'fill-opacity': 0.82, stroke: k.color('stage-rule'), 'stroke-width': k.stroke('hair') }));
    inset.append(svgEl('line', { x1: mL, y1: py(0), x2: w - mL, y2: py(0), stroke: k.color('stage-rule'), 'stroke-width': k.stroke('thin') }));
    for (let t = -Math.floor(X / tick) * tick; t <= X; t += tick) {
      inset.append(svgEl('line', { x1: px(t), y1: py(0), x2: px(t), y2: py(0) + 0.3 * fs, stroke: k.color('stage-ink'), 'stroke-width': k.stroke('thin') }));
      const e = svgEl('text', { x: px(t), y: py(0) + 1.2 * fs, 'text-anchor': 'middle', fill: k.color('stage-ink'), 'font-size': 0.8 * fs });
      e.style.fontFamily = 'var(--tpc-family-label)'; e.textContent = String(t).replace('-', '−'); inset.append(e);
    }
    inset.append(svgEl('path', { d: path(d.relative), fill: 'none', stroke: k.color('stage-ink'), 'stroke-width': k.stroke('thin') }));
    inset.append(svgEl('path', { d: path(d.laboratory), fill: 'none', stroke: k.color('stage-state'), 'stroke-width': k.stroke('state') }));
    const axisName = s.c2 === 0 ? ctx.text('einer Geraden durch die Mitte', 'a line through the centre') : ctx.text(`der ${'xyz'[s.axis.indexOf(1)]}-Achse`, `the ${'xyz'[s.axis.indexOf(1)]} axis`);
    const t = div('c11-tag', tags);
    t.style.transform = 'none'; t.style.whiteSpace = 'normal';
    t.style.right = `${0.6 * fs + 0.3 * fs}px`; t.style.top = `${(capture ? 4.2 : 3.4) * fs + 0.15 * fs}px`; t.style.width = `${w - 0.6 * fs}px`; t.style.textAlign = 'left'; t.style.fontSize = '0.82em'; t.style.lineHeight = '1.2';
    t.innerHTML = ctx.text(`Dichte entlang ${axisName}: dünn `, `density along ${axisName}: thin `) + abs2('<math><mi>ψ</mi></math>') + ctx.text(', dick ', ', thick ') + sym(ctx, 'sym.electron-density');
  };

  // ── text ───────────────────────────────────────────────────────────────────────────────
  const rSym = sym(ctx, 'sym.relative-coordinate'), reSym = sym(ctx, 'sym.electron-position'), rpSym = sym(ctx, 'sym.proton-position');
  const aMu = sym(ctx, 'sym.bohr-radius-reduced'), a0 = sym(ctx, 'sym.bohr-radius');
  const writeText = () => {
    const s = STATES[key], st = stateText(ctx, key), q = massRatio(), f = massFractions(q);
    const slabAxis = view === 'top' ? 'z' : 'y';
    const slab = cut >= CUT_ALL
      ? ctx.text(`Gezeigt sind alle ${POINTS.toLocaleString(ctx.lang)} Punkte.`, `All ${POINTS.toLocaleString(ctx.lang)} points are shown.`)
      : ctx.text(`Gezeigt ist die Schicht |${slabAxis}| ≤ ${fix(ctx, cut, 2)} ${aMu}: ${shownCount.toLocaleString(ctx.lang)} von ${POINTS.toLocaleString(ctx.lang)} Punkten.`,
        `Shown is the slab |${slabAxis}| ≤ ${fix(ctx, cut, 2)} ${aMu}: ${shownCount.toLocaleString(ctx.lang)} of ${POINTS.toLocaleString(ctx.lang)} points.`);
    const massNote = massLog === 0
      ? `${row(sym(ctx, 'sym.electron-mass'), mo('/'), sym(ctx, 'sym.proton-mass'), mo('='))} ${sci(ctx, q, 4)} (CODATA 2022)`
      : `<span class="c11-warn">${row(sym(ctx, 'sym.electron-mass'), mo('/'), sym(ctx, 'sym.proton-mass'), mo('='))} ${fix(ctx, q, q < 0.01 ? 4 : 3)}: ${ctx.text('nicht physikalisch, zur Anschauung überhöht', 'not physical, exaggerated for illustration')}</span>`;
    let headHtml: string, body: string;
    if (!lab) {
      headHtml = `<b>${st.shortHtml}</b> &nbsp; ${abs2(row(st.psi, mo('('), rSym, mo(')')))} &nbsp; ${row(rSym, mo('='), reSym, mo('−'), rpSym)}`
        + ctx.text(' &nbsp; Relativkoordinate', ' &nbsp; relative coordinate');
      body = ctx.text(
        `Zustand ${st.shortHtml}: ${st.psi}${s.m === null ? ' (Überlagerung, kein Eigenzustand von L̂₃)' : ` (${st.quantum})`}, Z = 1. Jeder Punkt ist eine Stichprobe aus der Dichte ${abs2(row('<math><mi>ψ</mi></math>', mo('('), rSym, mo(')')))} der Relativkoordinate ${row(rSym, mo('='), reSym, mo('−'), rpSym)}: des Abstandsvektors vom Proton zum Elektron. `
        + `Das ist nicht die Dichte des Elektrons um einen festen Punkt im Labor. Achsen in ${aMu} = ${fix(ctx, f.aMuOverA0, 6)} ${a0} (reduzierte Masse). ${slab}`,
        `State ${st.shortHtml}: ${st.psi}${s.m === null ? ' (superposition, not an eigenstate of L̂₃)' : ` (${st.quantum})`}, Z = 1. Each point is a sample from the density ${abs2(row('<math><mi>ψ</mi></math>', mo('('), rSym, mo(')')))} of the relative coordinate ${row(rSym, mo('='), reSym, mo('−'), rpSym)}: the vector from the proton to the electron. `
        + `This is not the density of the electron about a fixed point in the laboratory. Axes in ${aMu} = ${fix(ctx, f.aMuOverA0, 6)} ${a0} (reduced mass). ${slab}`);
      if (sphere) {
        const rp = enclosedProbabilityRadius(s.n, s.l, SPHERE_P);
        body += ctx.text(
          ` Gestrichelt: Die Kugel mit Radius ${fix(ctx, rp, 3)} ${aMu} schließt ${Math.round(100 * SPHERE_P)} % der Wahrscheinlichkeit ein; sie ist im Allgemeinen keine Fläche gleicher Dichte.`,
          ` Dashed: the sphere of radius ${fix(ctx, rp, 3)} ${aMu} encloses ${Math.round(100 * SPHERE_P)} % of the probability; in general it is not a surface of constant density.`);
      }
      if (phaseOn) body += ctx.text(` Farbe: Phase ${row('<math><mi>arg</mi></math>', '<math><mi>ψ</mi></math>')} am Ort des Punkts (zyklische Farbskala); gleiche Dichte, verschiedene Phase.`,
        ` Colour: phase ${row('<math><mi>arg</mi></math>', '<math><mi>ψ</mi></math>')} at the point (cyclic colour scale); same density, different phase.`);
      const nodes = radialNodes(s.n, s.l);
      if (nodes.length) body += ctx.text(` Knotenkugel bei ${row('<math><mi>r</mi></math>', mo('='), mn(fix(ctx, nodes[0], 0)), aMu)}.`, ` Nodal sphere at ${row('<math><mi>r</mi></math>', mo('='), mn(fix(ctx, nodes[0], 0)), aMu)}.`);
    } else {
      headHtml = ctx.text('<b>Labor</b> &nbsp; ', '<b>Laboratory</b> &nbsp; ') + `${sym(ctx, 'sym.electron-density')} ${ctx.text('Elektron (Farbe)', 'electron (colour)')}, ${sym(ctx, 'sym.proton-density')} ${ctx.text('Proton (neutral)', 'proton (neutral)')} &nbsp; ${st.shortHtml}, σ = ${fix(ctx, sigma, tour ? 2 : 1)} ${aMu}`;
      body = ctx.text(
        `Labor, Zustand ${st.shortHtml}: Der Schwerpunkt ${sym(ctx, 'sym.centre-of-mass-coordinate')} ist ein Gauß-Paket der Breite σ = ${fix(ctx, sigma, 1)} ${aMu} (gewählt, nicht gemessen). Farbige Punkte: Stichproben des Elektronenorts ${row(reSym, mo('='), sym(ctx, 'sym.centre-of-mass-coordinate'), mo('+'), mn(fix(ctx, f.b, 4)), rSym)}; neutrale Punkte: des Protonenorts ${row(rpSym, mo('='), sym(ctx, 'sym.centre-of-mass-coordinate'), mo('−'), mn(fix(ctx, f.a, 4)), rSym)}. `
        + `Die Dichte des Elektrons ist ρ_e = f * g_b: das Schwerpunktpaket f = |Φ|² gefaltet mit der skalierten Kopie g_b(y) = b⁻³g(y/b) der Relativdichte g = |ψ|², b = m_p/M; Knoten der Relativdichte füllen sich. ${massNote}. Achsen in ${aMu} = ${fix(ctx, f.aMuOverA0, massLog === 0 ? 6 : 3)} ${a0}. ${slab}`,
        `Laboratory, state ${st.shortHtml}: the centre of mass ${sym(ctx, 'sym.centre-of-mass-coordinate')} is a Gaussian packet of width σ = ${fix(ctx, sigma, 1)} ${aMu} (chosen, not measured). Coloured points: samples of the electron position ${row(reSym, mo('='), sym(ctx, 'sym.centre-of-mass-coordinate'), mo('+'), mn(fix(ctx, f.b, 4)), rSym)}; neutral points: of the proton position ${row(rpSym, mo('='), sym(ctx, 'sym.centre-of-mass-coordinate'), mo('−'), mn(fix(ctx, f.a, 4)), rSym)}. `
        + `The density of the electron is ρ_e = f * g_b: the centre-of-mass packet f = |Φ|² convolved with the scaled copy g_b(y) = b⁻³g(y/b) of the relative density g = |ψ|², b = m_p/M; nodes of the relative density fill in. ${massNote}. Axes in ${aMu} = ${fix(ctx, f.aMuOverA0, massLog === 0 ? 6 : 3)} ${a0}. ${slab}`);
    }
    // in a captured frame: one line under the picture instead of the paragraph (the narration is the WebVTT track)
    const parts: string[] = [];
    if (lab) {
      parts.push(ctx.text(`Schwerpunkt: Gauß-Paket, σ = ${fix(ctx, sigma, 2)} ${aMu}`, `centre of mass: Gaussian packet, σ = ${fix(ctx, sigma, 2)} ${aMu}`));
      parts.push(massNote);
    } else {
      parts.push(ctx.text(`${POINTS.toLocaleString(ctx.lang)} Stichproben`, `${POINTS.toLocaleString(ctx.lang)} samples`));
      if (sphere) parts.push(ctx.text(`gestrichelt: Kugel mit ${Math.round(100 * SPHERE_P)} % Wahrscheinlichkeit, Radius ${fix(ctx, enclosedProbabilityRadius(s.n, s.l, SPHERE_P), 3)} ${aMu}`,
        `dashed: sphere with ${Math.round(100 * SPHERE_P)} % probability, radius ${fix(ctx, enclosedProbabilityRadius(s.n, s.l, SPHERE_P), 3)} ${aMu}`));
      if (phaseOn) parts.push(ctx.text('Farbe: Phase ', 'colour: phase ') + row('<math><mi>arg</mi></math>', '<math><mi>ψ</mi></math>'));
    }
    if (cut < CUT_ALL) parts.push(ctx.text(`Schicht |${slabAxis}| ≤ ${fix(ctx, cut, 2)} ${aMu}`, `slab |${slabAxis}| ≤ ${fix(ctx, cut, 2)} ${aMu}`));
    parts.push(ctx.text(`Längen in ${aMu} (reduzierte Masse)`, `lengths in ${aMu} (reduced mass)`));
    if (!lab && (capture || width >= 720)) headHtml += ctx.text(': nicht der Ort des Elektrons im Labor', ': not the position of the electron in the laboratory');
    head.innerHTML = headHtml;
    if (caption) caption.innerHTML = body;
    foot.innerHTML = capture ? parts.join(' &nbsp;·&nbsp; ') : '';
  };

  const applyTour = (frame: number) => {
    if (!tour) return { az: 0, el: 0 };
    let f = frame, i = 0;
    while (i < tour.length - 1 && f >= Math.round(tour[i].seconds * ctx.fps)) { f -= Math.round(tour[i].seconds * ctx.fps); i++; }
    const sc = tour[i];
    const n = Math.round(sc.seconds * ctx.fps);
    const u = Math.min(1, n > 1 ? f / (n - 1) : 0);
    key = sc.state; view = sc.view; sphere = sc.sphere; phaseOn = sc.phase; lab = sc.lab;
    cut = sc.cut === null ? CUT_ALL : lerp(sc.cut, u);
    // the packet width is rounded to 1/50 a_mu so that a frame is a function of the frame number alone
    sigma = sc.sigma === undefined ? sigma : Math.round(lerp(sc.sigma, u) * 50) / 50;
    massLog = Math.log10(sc.mass_factor ?? 1);
    return { az: lerp(sc.az, u), el: lerp(sc.el, u) };
  };

  const v3 = new Vector3();
  const place = (x: number, y: number, z: number, html: string, cls = '') => {
    v3.set(x, y, z).project(camera);
    if (v3.z < -1 || v3.z > 1) return;
    const sx = ((v3.x + 1) / 2) * width, sy = ((1 - v3.y) / 2) * height;
    if (insetRect && sx > insetRect.x0 - 20 && sx < insetRect.x1 && sy > insetRect.y0 - 10 && sy < insetRect.y1 + 10) return;   // not over the inset
    const d = div(`c11-tag ${cls}`, tags);
    d.innerHTML = html;
    d.style.left = `${((v3.x + 1) / 2) * width}px`;
    d.style.top = `${((1 - v3.y) / 2) * height}px`;
  };

  return {
    render(frame, time) {
      const cam = tour ? applyTour(frame) : { az: az0 + SWING * Math.sin((2 * Math.PI * time) / SWING_PERIOD), el: el0 };
      build();
      const dist = DIST * radius;
      const ce = Math.cos(cam.el);
      camera.position.set(dist * Math.sin(cam.az) * ce, -dist * Math.cos(cam.az) * ce, dist * Math.sin(cam.el));
      camera.near = dist * 0.05; camera.far = dist * 4;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      const u = mat.uniforms;
      const dpr = renderer.getPixelRatio();
      u.uCut.value = cut >= CUT_ALL ? 1e9 : cut;
      u.uAxis.value = view === 'top' ? 2 : 1;
      // on a small stage the point cannot shrink below POINT_MIN_PX; its opacity is reduced by the
      // ratio of the areas instead, so that the amount of ink per sample stays the same
      const ideal = (POINT_PX * height) / 100;
      u.uPx.value = Math.max(POINT_MIN_PX, ideal) * dpr;
      u.uMinPx.value = POINT_MIN_PX * dpr;
      u.uAlpha.value = ALPHA * Math.min(1, (ideal / POINT_MIN_PX) ** 2);
      u.uDist.value = dist; u.uRadius.value = radius;
      sphereLines.visible = sphere && !lab;
      renderer.render(scene, camera);

      // count of the points in the slab (the number the caption states)
      const pos = posAttr.array as Float32Array;
      const ax = view === 'top' ? 2 : 1;
      shownCount = 0;
      if (cut < CUT_ALL) { for (let i = first; i < first + POINTS; i++) if (Math.abs(pos[3 * i + ax]) <= cut) shownCount++; } else shownCount = POINTS;

      tags.replaceChildren();
      const fs = Math.min(ctx.tokens.font('label').sizePx, width / 34);
      layer.style.fontSize = `${capture ? height / 42 : fs}px`;
      drawInset();
      const L = radius;
      const mi = (c: string) => `<math><mi>${c}</mi></math>`;
      const unit = aMu;
      // axis names at the positive ends (the y label is dropped while that axis points at the viewer and its end sits over the cloud)
      place(L * 0.97, 0, 0.08 * radius, row(mi('x'), mo('/'), unit));
      if (Math.abs(Math.sin(cam.az)) * Math.cos(cam.el) > 0.25 || Math.abs(Math.sin(cam.el)) > 0.6) place(0, L * 0.97, 0.08 * radius, row(mi('y'), mo('/'), unit));
      place(0.12 * radius, 0, L * 0.86, row(mi('z'), mo('/'), unit));
      for (let t = tick; t <= 0.8 * L; t += tick) {
        place(t, 0, -0.07 * radius, String(t), 'c11-muted-stage');
        place(-0.07 * radius, 0, t, String(t), 'c11-muted-stage');
      }
      writeText();
    },
    resize(w, h) {
      width = w; height = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    tokensChanged: paint,
    info: () => ({
      ...s3.info(), three: REVISION, state: key, points: POINTS, shown: shownCount, cut_a_mu: cut >= CUT_ALL ? 'all' : cut, view, laboratory: lab,
      sigma_a_mu: sigma, mass_ratio: massRatio(), phase_colour: phaseOn, tour: tour ? storyboard.id : '',
    }),
    destroy() {
      stage.removeEventListener('pointerdown', onDown); stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp); stage.removeEventListener('pointercancel', onUp);
      geo.dispose(); axes.geometry.dispose(); sphereLines.geometry.dispose();
      mat.dispose(); axisMat.dispose(); sphereMat.dispose();
      renderer.dispose();
      s3.canvas.remove(); layer.remove(); inset.remove();
    },
  };
}
