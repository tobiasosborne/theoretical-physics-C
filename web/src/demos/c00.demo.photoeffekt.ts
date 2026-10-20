// c00.demo.photoeffekt: the photoelectric relation in the one-photon model (figure
// c00.fig.photoeffekt, equations c00.eq.photoeffekt and c00.eq.schwelle). Left: light quanta
// of frequency nu reach a plate of fixed material with binding energy W; above the
// threshold W/h each quantum gives its energy to one electron, which leaves; below it no
// electron leaves. A strip below shows the speeds of the electrons in flight and the bound
// v_max. Right: the two lines E_kin,max = h nu - W of the figure for W_1 and W_2 = 8/5 W_1,
// with the operating point. The intensity slider changes how many quanta arrive per second,
// and nothing else: v_max stays where it is. 2D, SVG on the plate.
//
// Every number shown is an input (nu, the material, the intensity, W_1) or is computed by
// web/src/kernels/photo.ts. The model fixes only W' >= W for an electron that gets out; for
// the picture W' is drawn between W and h nu with ctx.random() (said below the stage).
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import { beta, emits, emittedSpeed, frequencyOfReduced, kineticMax, maxSpeed, photonEnergy, reducedKineticMax, thresholdFrequency } from '../kernels/photo';
import { choice, ensureStyle, fix, noteBelow, onDrag, pen, sig, stageSvg, svgEl } from './c00/common';

export const meta: DemoMeta = { animated: true, aspect: 1.9, surface: 'plate' };

const XMAX = 3.75, YMIN = -1.75, YMAX = 2.75;   // plot window in h nu/W_1 and E/W_1: the figure's, raised to show h nu = XHI W_1
const XLO = 0.2, XHI = 3.6;                      // slider range of h nu/W_1: a drawing choice
const W2_OVER_W1 = 8 / 5;                        // the figure's ratio, "chosen for the picture"
const FLY = 0.9;                                 // seconds a quantum takes from the lamp to the plate: a drawing choice
const LIFE = 1.5;                                // seconds an electron is followed: a drawing choice
const TABLE = 512;                               // random numbers per quantum, drawn once at mount

type Mat = 'w1' | 'w2';

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = stageSvg(stage);
  const uid = `c00f-${Math.floor(ctx.random() * 1e9)}`;
  const W1 = Number(ctx.params.w1) > 0 ? Number(ctx.params.w1) : 2;     // W_1 in eV: chosen for the numbers
  const rnd = Array.from({ length: TABLE }, () => [ctx.random(), ctx.random(), ctx.random(), ctx.random()]);

  // ── state ─────────────────────────────────────────────────────
  let xr = Math.min(XHI, Math.max(XLO, Number(ctx.params.x ?? '2')));   // h nu / W_1
  let mat: Mat = ctx.params.material === 'w2' ? 'w2' : 'w1';
  let rate = Math.min(15, Math.max(1, Number(ctx.params.rate ?? '5')));  // quanta per second of animation
  let now = 0;
  let phi0 = 0, t0 = 0;                    // quantum count phi(t) = phi0 + rate (t - t0)
  const phi = (t: number) => phi0 + rate * (t - t0);
  const wOf = (m: Mat) => (m === 'w1' ? 1 : W2_OVER_W1);
  const W = () => wOf(mat) * W1;           // binding energy of the chosen material, eV
  const nu = () => frequencyOfReduced(xr, W1);
  let lastEmits = emits(nu(), W());

  // ── controls ──────────────────────────────────────────────────
  const nuM = '<math><mi>ν</mi></math>';
  const slider = ctx.ui.slider({
    label: ctx.text('Frequenz ν des Lichts', 'frequency ν of the light'), labelHtml: nuM,
    min: XLO, max: XHI, step: 0.005, value: xr, primary: true,
    format: (v) => `${fix(ctx, frequencyOfReduced(v, W1) / 1e12, 0)} THz`,
    onInput: (v) => { xr = v; say(); },
  });
  choice<Mat>(ctx, ctx.text('Material', 'material'), [
    { value: 'w1', label: ctx.text('Material 1: W₁', 'material 1: W₁'), title: ctx.text(`Bindungsenergie W₁ = ${fix(ctx, W1, 2)} eV`, `binding energy W₁ = ${fix(ctx, W1, 2)} eV`) },
    { value: 'w2', label: ctx.text('Material 2: W₂ = 8/5 W₁', 'material 2: W₂ = 8/5 W₁'), title: ctx.text(`Bindungsenergie W₂ = ${fix(ctx, W2_OVER_W1 * W1, 2)} eV`, `binding energy W₂ = ${fix(ctx, W2_OVER_W1 * W1, 2)} eV`) },
  ], mat, (m) => { mat = m; say(); ctx.invalidate(); });
  ctx.ui.slider({
    label: ctx.text('Intensität: Lichtquanten pro Sekunde im Bild', 'intensity: light quanta per second in the picture'),
    min: 1, max: 15, step: 1, value: rate,
    format: (v) => `${v} /s`,
    onInput: (v) => { phi0 = phi(now); t0 = now; rate = v; },
  });
  const mi = (s: string) => `<math><mi>${s}</mi></math>`;
  const outE = ctx.ui.readout(ctx.text('Energie hν eines Lichtquants', 'energy hν of one light quantum'), `<math><mi>h</mi><mi>ν</mi></math>`);
  const outW = ctx.ui.readout(ctx.text('Bindungsenergie W des Materials', 'binding energy W of the material'), mi('W'));
  const outTh = ctx.ui.readout(ctx.text('Schwellenfrequenz W/h', 'threshold frequency W/h'), `<math><mi>W</mi><mo>/</mo><mi>h</mi></math>`);
  const outK = ctx.ui.readout(ctx.text('größte kinetische Energie', 'largest kinetic energy'), `<math><msub><mi>E</mi><mi>kin,max</mi></msub></math>`);
  const outV = ctx.ui.readout(ctx.text('größte Geschwindigkeit', 'largest speed'), `<math><msub><mi>v</mi><mi>max</mi></msub></math>`);
  noteBelow(ctx, ctx.text(
    `Modell: Ein Lichtquant gibt seine Energie hν an ein einzelnes Elektron ab; um herauszukommen, braucht das Elektron eine Energie W′ ≥ W. Für das Bild ist W′ zufällig zwischen W und hν gewählt, denn das Modell legt nur diese Schranke fest. Die Intensität ändert hier nur, wie viele Lichtquanten pro Sekunde ankommen. W₁ = ${fix(ctx, W1, 2)} eV ist für die Zahlen gewählt. Die Frequenz lässt sich im rechten Feld ziehen.`,
    `Model: a light quantum gives its energy hν to a single electron; to get out, the electron needs an energy W′ ≥ W. For the picture W′ is chosen at random between W and hν, since the model fixes only this bound. Here the intensity changes only how many light quanta arrive per second. W₁ = ${fix(ctx, W1, 2)} eV is chosen for the numbers. The frequency can be dragged in the right panel.`));

  const say = () => {
    const e = emits(nu(), W());
    if (e !== lastEmits) {
      ctx.announce(e
        ? ctx.text('Oberhalb der Schwelle: Elektronen werden ausgelöst.', 'Above the threshold: electrons are released.')
        : ctx.text('Unterhalb der Schwelle W/h: kein Elektron.', 'Below the threshold W/h: no electron.'));
      lastEmits = e;
    }
  };

  let geo = { px0: 0, px1: 1, py0: 1, py1: 0 };
  onDrag(svg, (x, y) => {
    const g = geo;
    if (x < g.px0 - 10 || x > g.px1 + 10 || y < g.py1 - 20 || y > g.py0 + 30) return false;
    xr = Math.min(XHI, Math.max(XLO, ((x - g.px0) / (g.px1 - g.px0)) * XMAX));
    slider.set(xr); say(); ctx.invalidate();
    return true;
  });

  const paint = () => {
    const P = pen(svg, stage, ctx.tokens, 46);
    const { k, W: Wpx, H, fs } = P;
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), dyn = k.color('dynamics');
    const q1 = k.color('q1'), q3 = k.color('q3');
    P.rect(0, 0, Wpx, H, { fill: k.color('plate') });
    const defs = svgEl('defs', {}, svg);

    // ── scene ───────────────────────────────────────────────────
    const sx0 = 0.6 * fs, sx1 = 0.45 * Wpx, sy0 = 0.4 * fs;
    const plateY = 0.62 * H, plateH = 1.1 * fs;
    const clip = svgEl('clipPath', { id: `${uid}-s` }, defs); svgEl('rect', { x: sx0, y: sy0, width: sx1 - sx0, height: plateY - sy0 }, clip);
    const lamp: [number, number] = [sx0 + 1.6 * fs, sy0 + 1.6 * fs];
    const pa = sx0 + 0.32 * (sx1 - sx0), pb = sx1 - 1.2 * fs;           // where quanta land on the plate
    P.rect(sx0 + 0.8 * fs, plateY, sx1 - sx0 - 1.6 * fs, plateH, { fill: k.color('grey-2'), stroke: ink, 'stroke-width': k.stroke('thin') });
    P.text((sx0 + sx1) / 2, plateY + plateH + 1.15 * fs, mat === 'w1' ? ctx.text('Material 1, Bindungsenergie *W*_1', 'material 1, binding energy *W*_1') : ctx.text('Material 2, Bindungsenergie *W*_2', 'material 2, binding energy *W*_2'), { anchor: 'middle', fill: muted });
    P.path(`M${lamp[0] - 1.1 * fs} ${lamp[1] - 0.2 * fs} a${1.1 * fs} ${1.1 * fs} 0 0 0 ${2.2 * fs} 0 z`, { fill: k.color('grey-1'), stroke: ink, 'stroke-width': k.stroke('thin'), transform: `rotate(-38 ${lamp[0]} ${lamp[1]})` });
    P.text(lamp[0] + 1.6 * fs, lamp[1] - 0.6 * fs, ctx.text('Licht der Frequenz *ν*', 'light of frequency *ν*'), { anchor: 'start', fill: muted });

    const gq = P.g({ 'clip-path': `url(#${uid}-s)` });
    const nuHz = nu(), Wev = W();
    const on = emits(nuHz, Wev);
    // drawing speed scale: the fastest electron the slider allows (h nu = XHI W_1, material 1) crosses ~0.5 H in LIFE seconds
    const vRef = maxSpeed(frequencyOfReduced(XHI, W1), W1);
    const pxPerMps = (0.5 * H) / (LIFE * vRef);
    const lam = (2.4 * fs) / xr;                      // drawn wavelength proportional to 1/nu: a drawing choice
    const kFirst = Math.ceil(phi(now - FLY - LIFE)), kLast = Math.floor(phi(now));
    const flying: number[] = [];
    for (let q = kFirst; q <= kLast; q++) {
      const r = rnd[((q % TABLE) + TABLE) % TABLE];
      const tq = t0 + (q - phi0) / rate;               // emission time of quantum q
      const age = now - tq;
      if (age < 0) continue;
      const hit: [number, number] = [pa + r[0] * (pb - pa), plateY];
      if (age < FLY) {
        const f = age / FLY;
        const cx = lamp[0] + f * (hit[0] - lamp[0]), cy = lamp[1] + f * (hit[1] - lamp[1]);
        const dx = hit[0] - lamp[0], dy = hit[1] - lamp[1], len = Math.hypot(dx, dy);
        const ux = dx / len, uy = dy / len;
        const half = 1.7 * fs, amp = 0.42 * fs;
        const pts: Array<[number, number]> = [];
        for (let i = 0; i <= 48; i++) {
          const u = -half + (2 * half * i) / 48;
          const env = Math.exp(-((u / (0.6 * half)) ** 2));
          const a = amp * env * Math.sin((2 * Math.PI * u) / lam);
          pts.push([cx + u * ux - a * uy, cy + u * uy + a * ux]);
        }
        P.path(P.poly(pts), { fill: 'none', stroke: dyn, 'stroke-width': k.stroke('regular'), 'stroke-linecap': 'round' }, gq);
      } else {
        const te = age - FLY;                          // time since the quantum reached the plate
        if (te < 0.35) P.circle(hit[0], hit[1], (0.3 + 1.6 * te) * fs, { fill: 'none', stroke: dyn, 'stroke-width': k.stroke('thin'), 'stroke-opacity': (1 - te / 0.35).toFixed(3) }, gq);
        if (on && te < LIFE) {
          const v = emittedSpeed(nuHz, Wev, r[1]);
          const ang = (r[2] - 0.5) * (100 * Math.PI) / 180;
          const d = v * pxPerMps * te;
          const ex = hit[0] + d * Math.sin(ang), ey = hit[1] - d * Math.cos(ang);
          const fade = te > LIFE - 0.4 ? (LIFE - te) / 0.4 : 1;
          const tail = Math.min(d, v * pxPerMps * 0.12);
          P.line(ex - tail * Math.sin(ang), ey + tail * Math.cos(ang), ex, ey, muted, k.stroke('thin'), { 'stroke-opacity': fade.toFixed(3), 'stroke-linecap': 'round' }, gq);
          P.circle(ex, ey, 0.26 * fs, { fill: ink, 'fill-opacity': fade.toFixed(3) }, gq);
          flying.push(v, r[3], fade);
        }
      }
    }

    // speed strip
    const vy = H - 1.6 * fs, vx0 = sx0 + 2.4 * fs, vx1 = sx1 - 1.0 * fs;
    const vAxis = vRef * 1.04;
    const VX = (v: number) => vx0 + (v / vAxis) * (vx1 - vx0);
    P.line(vx0, vy, vx1, vy, ink, k.stroke('thin'));
    P.text(vx0 - 0.5 * fs, vy + 0.35 * fs, '*v*', { anchor: 'end' });
    P.text(vx0, vy + 1.3 * fs, '0', { anchor: 'middle', fill: muted, size: 0.9 * fs });
    for (let i = 0; i < flying.length; i += 3) {
      P.circle(VX(flying[i]), vy - (0.5 + 1.6 * flying[i + 1]) * fs, 0.2 * fs, { fill: ink, 'fill-opacity': flying[i + 2].toFixed(3) });
    }
    if (on) {
      const vm = maxSpeed(nuHz, Wev);
      P.line(VX(vm), vy + 0.3 * fs, VX(vm), vy - 2.6 * fs, ink, k.stroke('state'));
      P.text(VX(vm), vy + 1.3 * fs, `*v*_{max} = ${fix(ctx, vm / 1000, 0)} km/s`, { anchor: VX(vm) > vx1 - 6 * fs ? 'end' : 'middle', weight: '600', size: 0.9 * fs });
    } else {
      P.text((vx0 + vx1) / 2, vy - 1.0 * fs, ctx.text('*ν* < *W*/*h*: kein Elektron', '*ν* < *W*/*h*: no electron'), { anchor: 'middle', weight: '600' });
    }

    // ── plot (the figure) ───────────────────────────────────────
    const px0 = 0.53 * Wpx + 3.2 * fs, px1 = Wpx - 2.4 * fs, py1 = 1.6 * fs, py0 = H - 2.4 * fs;
    geo = { px0, px1, py0, py1 };
    const X = (x: number) => px0 + (x / XMAX) * (px1 - px0);
    const Y = (y: number) => py1 + ((YMAX - y) / (YMAX - YMIN)) * (py0 - py1);
    P.line(X(0), Y(0), X(XMAX), Y(0), ink, k.stroke('thin'));
    P.path(`M${X(XMAX)} ${Y(0)} l${-0.6 * fs} ${-0.3 * fs} l0 ${0.6 * fs} z`, { fill: ink });
    P.line(X(0), Y(YMIN), X(0), Y(YMAX), ink, k.stroke('thin'));
    P.path(`M${X(0)} ${Y(YMAX)} l${-0.3 * fs} ${0.6 * fs} l${0.6 * fs} 0 z`, { fill: ink });
    P.text(X(XMAX) + 0.3 * fs, Y(0) + 0.35 * fs, '*ν*', { anchor: 'start' });
    P.text(X(0), Y(YMAX) - 0.5 * fs, '*E*_{kin,max}', { anchor: 'middle' });
    P.text(X(0) - 0.4 * fs, Y(0) + 0.35 * fs, '0', { anchor: 'end' });
    const lines: Array<{ m: Mat; w: number; stroke: string; dash?: string; label: string }> = [
      { m: 'w1', w: 1, stroke: q1, label: '*W*_1' },
      { m: 'w2', w: W2_OVER_W1, stroke: q3, dash: '5 2', label: '*W*_2' },
    ];
    for (const L of lines) {
      const active = L.m === mat;
      P.line(X(0), Y(reducedKineticMax(0, L.w)), X(L.w), Y(0), muted, k.stroke('hair'), { 'stroke-dasharray': '1 2.5' });
      P.line(X(L.w), Y(0), X(XHI), Y(reducedKineticMax(XHI, L.w)), L.stroke, active ? k.stroke('state') : k.stroke('thin'), { ...(L.dash ? { 'stroke-dasharray': L.dash } : {}), 'stroke-opacity': active ? '1' : '0.55' });
      P.circle(X(L.w), Y(0), 0.16 * fs, { fill: ink });
      P.circle(X(0), Y(-L.w), 0.13 * fs, { fill: ink });
      P.text(X(0) - 0.4 * fs, Y(-L.w) + 0.35 * fs, `−${L.label}`, { anchor: 'end' });
      P.text(X(L.w) + (L.m === 'w2' ? 0.35 * fs : 0), Y(0) + 1.3 * fs, `${L.label}/*h*`, { anchor: 'middle' });
      P.text(X(XHI) + 0.3 * fs, Y(reducedKineticMax(XHI, L.w)) + 0.35 * fs, L.label, { anchor: 'start', weight: active ? '600' : '400' });
    }
    // the slope triangle of the figure on line 1
    const ta = 1.9, tb = 2.5;
    P.path(`M${X(ta)} ${Y(reducedKineticMax(ta, 1))} L${X(ta)} ${Y(reducedKineticMax(tb, 1))} L${X(tb)} ${Y(reducedKineticMax(tb, 1))}`, { fill: 'none', stroke: muted, 'stroke-width': k.stroke('hair') });
    P.text((X(ta) + X(tb)) / 2, Y(reducedKineticMax(tb, 1)) - 0.35 * fs, '*ν*′ − *ν*', { anchor: 'middle', fill: muted, size: 0.9 * fs });
    P.text(X(ta) - 0.3 * fs, Y(reducedKineticMax((ta + tb) / 2, 1)) + 0.35 * fs, '*h*(*ν*′ − *ν*)', { anchor: 'end', fill: muted, size: 0.9 * fs });
    // operating point
    const w = wOf(mat);
    P.line(X(xr), Y(YMIN), X(xr), Y(YMAX), ink, k.stroke('hair'));
    P.path(`M${X(xr)} ${Y(YMIN) - 0.1 * fs} l${-0.45 * fs} ${0.75 * fs} l${0.9 * fs} 0 z`, { fill: ink });
    if (on) {
      const yk = reducedKineticMax(xr, w);
      P.line(X(xr), Y(0), X(xr), Y(yk), lines[mat === 'w1' ? 0 : 1].stroke, k.stroke('effect'));
      P.circle(X(xr), Y(yk), 0.32 * fs, { fill: lines[mat === 'w1' ? 0 : 1].stroke });
      P.text(X(xr) + 0.6 * fs, Y(yk) + 1.2 * fs, `${fix(ctx, kineticMax(nuHz, Wev), 2)} eV`, { anchor: 'start', weight: '600' });
    } else {
      P.circle(X(xr), Y(0), 0.32 * fs, { fill: k.color('plate'), stroke: ink, 'stroke-width': k.stroke('regular') });
      P.text(X(xr) + 0.5 * fs, Y(YMAX) + 1.2 * fs, ctx.text('keine Elektronen', 'no electrons'), { anchor: 'start', weight: '600' });
    }

    // readouts
    outE.set(`= ${fix(ctx, photonEnergy(nuHz), 3)} eV  (ν = ${fix(ctx, nuHz / 1e12, 1)} THz)`);
    outW.set(`= ${fix(ctx, Wev, 3)} eV`);
    outTh.set(`= ${fix(ctx, thresholdFrequency(Wev) / 1e12, 1)} THz`);
    if (on) {
      const vm = maxSpeed(nuHz, Wev);
      outK.set(`= ${fix(ctx, kineticMax(nuHz, Wev), 3)} eV`);
      outV.set(`= ${fix(ctx, vm / 1000, 0)} km/s  (v/c = ${sig(ctx, beta(vm), 2)})`);
    } else {
      outK.set(ctx.text('— (ν < W/h: kein Elektron)', '— (ν < W/h: no electron)'));
      outV.set('—');
    }
  };

  return {
    render(_frame, time) { now = time; paint(); },
    resize: () => paint(),
    tokensChanged: () => paint(),
    destroy() { svg.remove(); },
    info: () => ({ material: mat, W_eV: W(), nuHz: nu(), emits: emits(nu(), W()), vmax: emits(nu(), W()) ? maxSpeed(nu(), W()) : 0, rate }),
  };
}
