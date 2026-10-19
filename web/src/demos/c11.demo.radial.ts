// c11.demo.radial: the radial function R_nl, the radial probability density
// P_nl = r^2 R_nl^2 and its distribution function F_nl for 1s, 2s, 2p, with the nodes, the
// mean distance <r> and the most probable distance marked, and a probe radius r that shows
// F_nl(r) as the area under P_nl. 2D, drawn as SVG on the plate.
//
// Every number shown is computed by web/src/kernels/hydrogen.ts (DERIVATION.md Results 5.1,
// 7.1, 7.2). Lengths are in a_mu (reduced mass); the lower tick row shows a_0 (infinite
// nuclear mass) at its true position a_0 = a_mu / (1 + m_e/m_p).
import type { DemoContext, DemoInstance, DemoMeta } from '../demo/types';
import {
  aMuMetres, A_0_M, M_E_OVER_M_P, massFractions, mostProbableRadius, radialCdf, radialDensity, radialDensityMaxima,
  radialMoments, radialNodes, radialR,
} from '../kernels/hydrogen';
import { captionBelow, choice, div, ensureStyle, fix, mn, mo, msup, qty, row, svgEl, sym, symbolWith } from './c11/common';

export const meta: DemoMeta = { animated: true, aspect: 1.3, surface: 'plate' };

type Key = '1s' | '2s' | '2p';
const NL: Record<Key, [number, number]> = { '1s': [1, 0], '2s': [2, 0], '2p': [2, 1] };
/** drawing window in a_mu and tick step: a drawing choice */
const XMAX: Record<Key, number> = { '1s': 8, '2s': 24, '2p': 24 };
const XTICK: Record<Key, number> = { '1s': 1, '2s': 4, '2p': 4 };
const SAMPLES = 480;       // points per curve: a drawing choice
const PERIOD = 12;         // seconds for one sweep of the probe radius out and back: a drawing choice

export function mount(stage: HTMLElement, ctx: DemoContext): DemoInstance {
  ensureStyle();
  const svg = svgEl('svg', { 'aria-hidden': 'true' });
  const layer = div('c11-layer c11-plate-ink');
  stage.append(svg, layer);

  let key: Key = (['1s', '2s', '2p'] as Key[]).includes(ctx.params.state as Key) ? (ctx.params.state as Key) : '2s';
  let now = 0;
  const clampR = (v: number) => Math.max(0, Math.min(XMAX[key], v));
  // r(time) = xmax (1 - cos(2 pi time / PERIOD + phase)) / 2: a sweep that passes through the chosen radius when it is chosen
  const phaseFor = (r: number, time: number) => Math.acos(1 - (2 * clampR(r)) / XMAX[key]) - (2 * Math.PI * time) / PERIOD;
  let probe = Number(ctx.params.r ?? '4');
  let phase = phaseFor(probe, 0);

  const sLabel = (k: Key) => `${NL[k][0]}${NL[k][1] === 0 ? 's' : 'p'}`;
  choice<Key>(ctx, ctx.text('Zustand', 'state'), (['1s', '2s', '2p'] as Key[]).map((k) => ({
    value: k, html: sLabel(k),
    title: ctx.text(`Zustand ${sLabel(k)}: n = ${NL[k][0]}, ℓ = ${NL[k][1]}`, `state ${sLabel(k)}: n = ${NL[k][0]}, ℓ = ${NL[k][1]}`),
  })), key, (k) => { const f = probe / XMAX[key]; key = k; probe = f * XMAX[key]; phase = phaseFor(probe, now); slider.set(100 * f); });
  const rSym = ctx.symbol('sym.radial-coordinate');
  // the slider runs over the drawing window in per cent, so that it keeps its meaning when the window changes with the state
  const slider = ctx.ui.slider({
    label: ctx.text('Prüfradius r, in Prozent des gezeigten Bereichs', 'probe radius r, in per cent of the range shown'),
    labelHtml: `${rSym.mathml}`,
    min: 0, max: 100, step: 1, value: (100 * probe) / XMAX[key], primary: true,
    format: (v) => `${fix(ctx, (v / 100) * XMAX[key], 2)} ${ctx.symbol('sym.bohr-radius-reduced').unicode}`,
    onInput: (v) => { probe = (v / 100) * XMAX[key]; phase = phaseFor(probe, now); },
  });
  const caption = captionBelow(ctx);

  const aMu = sym(ctx, 'sym.bohr-radius-reduced'), a0 = sym(ctx, 'sym.bohr-radius');

  const draw = () => {
    const k = ctx.tokens;
    const box = stage.getBoundingClientRect();
    const W = Math.max(120, box.width), H = Math.max(120, box.height);
    const f = k.font('label');
    const fs = Math.min(f.sizePx, W / 30);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.replaceChildren();
    layer.replaceChildren();
    layer.style.fontSize = `${fs}px`;
    const [n, l] = NL[key];
    const xmax = XMAX[key];
    const mL = 3.6 * fs, mR = 0.9 * fs, mT = 0.5 * fs, mB = 4.0 * fs, gap = 0.9 * fs;
    const ph = (H - mT - mB - 2 * gap) / 3;
    const X = (x: number) => mL + (x / xmax) * (W - mL - mR);
    const top = (i: number) => mT + i * (ph + gap);
    const ink = k.color('plate-ink'), muted = k.color('plate-muted'), rule = k.color('plate-rule'), state = k.color('state'), effect = k.color('effect');
    const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, w: number, dash?: number[]) => {
      const e = svgEl('line', { x1, y1, x2, y2, stroke, 'stroke-width': w });
      if (dash) e.setAttribute('stroke-dasharray', dash.join(' '));
      svg.append(e); return e;
    };
    const text = (x: number, y: number, s: string, anchor = 'middle', fill = ink) => {
      const e = svgEl('text', { x, y, 'text-anchor': anchor, fill, 'font-size': fs * 0.9 });
      e.style.fontFamily = 'var(--tpc-family-label)';
      e.textContent = s; svg.append(e); return e;
    };
    const tag = (x: number, y: number, html: string, cls = '', align: 'left' | 'center' | 'right' = 'left') => {
      const d = div(`c11-tag ${cls}`, layer);
      d.innerHTML = html;
      d.style.left = `${x}px`; d.style.top = `${y}px`;
      d.style.transform = `translate(${align === 'left' ? '0' : align === 'center' ? '-50%' : '-100%'}, -50%)`;
      return d;
    };
    svg.append(svgEl('rect', { x: 0, y: 0, width: W, height: H, fill: k.color('plate') }));

    const xs = Array.from({ length: SAMPLES + 1 }, (_, i) => (xmax * i) / SAMPLES);
    const nodes = radialNodes(n, l);
    const mom = radialMoments(n, l);
    const rMost = mostProbableRadius(n, l);
    const maxima = radialDensityMaxima(n, l);
    const pMax = radialDensity(n, l, rMost);
    const rVals = xs.map((x) => radialR(n, l, x));
    const rLo = Math.min(0, ...rVals), rHi = Math.max(...rVals);
    const R_nl = symbolWith(ctx, 'sym.radial-function', { n: String(n), 'ℓ': String(l) }).mathml;
    const P_nl = symbolWith(ctx, 'sym.radial-density', { n: String(n), 'ℓ': String(l) }).mathml;
    const F_nl = symbolWith(ctx, 'sym.radial-distribution', { n: String(n), 'ℓ': String(l) }).mathml;
    const unitPow = (p: string) => msup(aMu, mn(p));

    const panels: Array<{ lo: number; hi: number; fn: (x: number) => number; title: string; ticks: number[] }> = [
      { lo: rLo * 1.15, hi: rHi * 1.08, fn: (x) => radialR(n, l, x), title: row(R_nl, mo('·'), unitPow('3/2')), ticks: [0, rHi] },
      { lo: 0, hi: pMax * 1.18, fn: (x) => radialDensity(n, l, x), title: row(P_nl, mo('='), msup(rSym.mathml, mn('2')), msup(R_nl, mn('2')), mo('·'), aMu), ticks: [0, pMax] },
      { lo: 0, hi: 1.08, fn: (x) => radialCdf(n, l, x), title: row(F_nl, mo('('), rSym.mathml, mo(')')), ticks: [0, 0.5, 1] },
    ];
    const r = clampR(probe);
    panels.forEach((p, i) => {
      const y0 = top(i), y1 = y0 + ph;
      const Y = (v: number) => y1 - ((v - p.lo) / (p.hi - p.lo)) * ph;
      // frame: left axis and zero line
      line(mL, y0, mL, y1, rule, k.stroke('thin'));
      line(mL, Y(0), W - mR, Y(0), rule, k.stroke('thin'));
      for (const t of p.ticks) {
        line(mL - 0.3 * fs, Y(t), mL, Y(t), ink, k.stroke('thin'));
        text(mL - 0.5 * fs, Y(t) + 0.32 * fs, t === 0 ? '0' : fix(ctx, t, t === 1 || t === 0.5 ? 1 : 3), 'end', muted);
      }
      // markers below the curve
      if (i === 1) {
        // area under P up to the probe radius: its size is F(r)
        let d = `M ${X(0)} ${Y(0)}`;
        for (const x of xs) { if (x > r) break; d += ` L ${X(x)} ${Y(p.fn(x))}`; }
        d += ` L ${X(r)} ${Y(p.fn(r))} L ${X(r)} ${Y(0)} Z`;
        svg.append(svgEl('path', { d, fill: state, 'fill-opacity': 0.16, stroke: 'none' }));
        // mean distance and most probable distance
        if (mom.r <= xmax) {
          line(X(mom.r), y0 + 0.45 * ph, X(mom.r), y1, muted, k.stroke('thin'));
          tag(X(mom.r) + 0.3 * fs, y0 + 0.45 * ph + 0.7 * fs, row(mo('⟨'), rSym.mathml, mo('⟩')), 'c11-muted-plate');
        }
        for (const m of maxima) line(X(m), Y(p.fn(m)), X(m), y1, muted, k.stroke('hair'));
        tag(X(rMost) - 1.2 * fs, Y(pMax) - 0.75 * fs, ctx.text('Maximum', 'maximum') + ' ' + row(rSym.mathml, mo('='), qty(fix(ctx, rMost, rMost % 1 ? 3 : 0), aMu)), 'c11-muted-plate', 'left');
      }
      // the curve
      let d = '';
      xs.forEach((x, j) => { d += `${j ? ' L' : 'M'} ${X(x).toFixed(2)} ${Y(p.fn(x)).toFixed(2)}`; });
      svg.append(svgEl('path', { d, fill: 'none', stroke: state, 'stroke-width': k.stroke('state'), 'stroke-linejoin': 'round' }));
      // nodes: R = 0, P = 0, F has a horizontal tangent
      for (const z of nodes) {
        svg.append(svgEl('circle', { cx: X(z), cy: Y(p.fn(z)), r: 0.32 * fs, fill: k.color('plate'), stroke: ink, 'stroke-width': k.stroke('regular') }));
        if (i === 0) tag(X(z) + 0.5 * fs, Y(0) - 0.8 * fs, `${ctx.text('Knoten', 'node')} ${row(rSym.mathml, mo('='), qty(fix(ctx, z, 0), aMu))}`, 'c11-muted-plate');
      }
      // probe radius (effect role: dashed)
      line(X(r), y0, X(r), y1, effect, k.stroke('effect'), k.dash('effect'));
      if (i === 2) {
        const F = p.fn(r);
        line(mL, Y(F), X(r), Y(F), effect, k.stroke('effect'), k.dash('effect'));
        svg.append(svgEl('circle', { cx: X(r), cy: Y(F), r: 0.3 * fs, fill: effect }));
        tag(r > 0.6 * xmax ? X(r) - 0.5 * fs : X(r) + 0.5 * fs, Math.min(y1 - 0.8 * fs, Y(F) + 0.9 * fs), row(F_nl, mo('('), rSym.mathml, mo(')'), mo('='), mn(fix(ctx, F, 3))), '', r > 0.6 * xmax ? 'right' : 'left');
      }
      tag(W - mR - 0.2 * fs, i === 2 ? y1 - 0.9 * fs : y0 + 0.7 * fs, p.title, '', 'right');
    });

    // length axis: upper row a_mu, lower row a_0 at its true position
    const yAxis = H - mB + 0.7 * fs;
    line(mL, yAxis, W - mR, yAxis, ink, k.stroke('thin'));
    const q = M_E_OVER_M_P;
    for (let t = 0; t <= xmax + 1e-9; t += XTICK[key]) {
      line(X(t), yAxis, X(t), yAxis - 0.35 * fs, ink, k.stroke('thin'));
      text(X(t), yAxis - 0.55 * fs + 1.5 * fs, String(t), 'middle', ink);
      const x0 = t / (1 + q);                 // t a_0 = t a_mu / (1 + q)
      line(X(x0), yAxis + 1.3 * fs, X(x0), yAxis + 1.65 * fs, muted, k.stroke('thin'));
    }
    line(mL, yAxis + 1.3 * fs, W - mR, yAxis + 1.3 * fs, muted, k.stroke('hair'));
    tag(mL - 0.4 * fs, yAxis + 0.75 * fs, row(rSym.mathml, mo('/'), aMu), '', 'right');
    tag(mL - 0.4 * fs, yAxis + 1.9 * fs, row(rSym.mathml, mo('/'), a0), 'c11-muted-plate', 'right');
    const f1 = massFractions(q);
    tag(mL + 0.2 * fs, yAxis + 2.45 * fs,
      ctx.text('untere Striche: Vielfache von ', 'lower ticks: multiples of ') + a0 + '; '
      + row(aMu, mo('='), qty(fix(ctx, f1.aMuOverA0, 6), a0)), 'c11-muted-plate');

    // caption generated from the state
    const pm = (m: number) => fix(ctx, m * 1e12, 4);
    caption.innerHTML = ctx.text(
      `Zustand ${sLabel(key)} (n = ${n}, ℓ = ${l}), Z = 1. Abstand ${rSym.mathml} zwischen Elektron und Proton, nicht Abstand zu einem festen Punkt. `
      + `Prüfradius ${row(rSym.mathml, mo('='), qty(fix(ctx, r, 2), aMu))} = ${fix(ctx, r * f1.aMuOverA0, 4)} ${a0} = ${fix(ctx, r * aMuMetres() * 1e12, 2)} pm: `
      + `Mit Wahrscheinlichkeit ${fix(ctx, radialCdf(n, l, r), 3)} ist der Abstand kleiner (getönte Fläche). `
      + `Mittlerer Abstand ${row(mo('⟨'), rSym.mathml, mo('⟩'), mo('='), qty(fix(ctx, mom.r, mom.r % 1 ? 1 : 0), aMu))}, wahrscheinlichster Abstand ${qty(fix(ctx, rMost, rMost % 1 ? 3 : 0), aMu)}. `
      + `Längeneinheit ${aMu} = ${pm(aMuMetres())} pm (reduzierte Masse); ${a0} = ${pm(A_0_M)} pm (unendlich schwerer Kern; CODATA 2022).`,
      `State ${sLabel(key)} (n = ${n}, ℓ = ${l}), Z = 1. Distance ${rSym.mathml} between electron and proton, not the distance to a fixed point. `
      + `Probe radius ${row(rSym.mathml, mo('='), qty(fix(ctx, r, 2), aMu))} = ${fix(ctx, r * f1.aMuOverA0, 4)} ${a0} = ${fix(ctx, r * aMuMetres() * 1e12, 2)} pm: `
      + `with probability ${fix(ctx, radialCdf(n, l, r), 3)} the distance is smaller (tinted area). `
      + `Mean distance ${row(mo('⟨'), rSym.mathml, mo('⟩'), mo('='), qty(fix(ctx, mom.r, mom.r % 1 ? 1 : 0), aMu))}, most probable distance ${qty(fix(ctx, rMost, rMost % 1 ? 3 : 0), aMu)}. `
      + `Unit of length ${aMu} = ${pm(aMuMetres())} pm (reduced mass); ${a0} = ${pm(A_0_M)} pm (infinite nuclear mass; CODATA 2022).`);
  };

  return {
    render(_frame, time) {
      now = time;
      probe = (XMAX[key] * (1 - Math.cos((2 * Math.PI * time) / PERIOD + phase))) / 2;
      slider.set(Math.round((100 * probe) / XMAX[key] * 1e6) / 1e6);
      draw();
    },
    info: () => ({ state: key, probe_a_mu: probe, F: radialCdf(NL[key][0], NL[key][1], probe) }),
    destroy() { svg.remove(); layer.remove(); },
  };
}
