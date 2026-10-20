// A line of SVG text from segments, for labels that mix words and mathematics (H_N in 30
// series, P_N[|H_N - q| >= eps]): ['t', words] in the label face, ['m', symbols] in the maths
// face (letters as Unicode mathematical italic, see it() in kit.ts), ['s', subscript] in the
// maths face, smaller and lowered. Drawing only; no numbers are made here.
import type { DemoContext } from '../../demo/types';
import type { Layer, Plate } from './kit';

export type Seg = ['t' | 'm' | 's', string];
export interface RichOpts { anchor?: 'start' | 'middle' | 'end'; size?: number; fill?: string; layer?: Layer; weight?: string }

const SUB = 0.72;      // size of a subscript relative to the line
const DROP = 0.32;     // its drop, in em of the line

/** the advance width of the segments at `size` */
export function richWidth(plate: Plate, segs: Seg[], size: number): number {
  return segs.reduce((w, [k, t]) => w + plate.measure(t, k === 's' ? size * SUB : size, undefined, k !== 't'), 0);
}

/** draw the segments at (x, y); returns the width */
export function rich(plate: Plate, ctx: DemoContext, key: string, x: number, y: number, segs: Seg[], o: RichOpts = {}): number {
  const size = o.size ?? plate.fs;
  const e = plate.node(key, 'text', o.layer ?? 'labels');
  e.setAttribute('text-anchor', o.anchor ?? 'middle');
  e.setAttribute('font-size', String(size));
  e.setAttribute('fill', o.fill ?? ctx.tokens.color('plate-ink'));
  e.setAttribute('font-weight', o.weight ?? 'normal');
  e.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
  let low = false;
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const html = segs.map(([kind, t]) => {
    // dy is in em of the tspan itself: a subscript's em is SUB of the line's
    const dy = kind === 's' ? (low ? '' : ` dy="${(DROP / SUB).toFixed(3)}em"`) : (low ? ` dy="-${DROP}em"` : '');
    low = kind === 's';
    return `<tspan${kind === 't' ? '' : ' class="c01-m"'}${kind === 's' ? ` font-size="${SUB * 100}%"` : ''}${dy}>${esc(t)}</tspan>`;
  }).join('');
  if (e.dataset.h !== html) { e.innerHTML = html; e.dataset.h = html; }
  return richWidth(plate, segs, size);
}
