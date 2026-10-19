// Design tokens at run time: read from the CSS custom properties of the page
// (design/build/<pkg>-<ground>/tokens.css), so a demo follows the design switcher.
import type { RGB, Tokens } from './types';

function parseHex(v: string, name: string): RGB {
  const s = v.trim();
  const ok = s.length === 7 && s.startsWith('#') && [...s.slice(1)].every((c) => '0123456789abcdefABCDEF'.includes(c));
  if (!ok) throw new Error(`token --tpc-${name}: expected a six-digit hexadecimal colour, found ${JSON.stringify(v)}`);
  const n = Number.parseInt(s.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** sRGB transfer function, IEC 61966-2-1 */
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

export function readTokens(el: Element): Tokens {
  const root = document.documentElement;
  const cs = () => getComputedStyle(el);
  const prop = (p: string) => {
    const v = cs().getPropertyValue(p).trim();
    if (!v) throw new Error(`token ${p} is not defined on this page (is tokens.css loaded?)`);
    return v;
  };
  const px = (v: string, what: string) => {
    const x = Number.parseFloat(v);
    if (!Number.isFinite(x)) throw new Error(`token ${what}: not a length: ${v}`);
    if (v.endsWith('rem')) return x * Number.parseFloat(getComputedStyle(root).fontSize);
    return x;
  };
  return {
    get pkg() { return Number(root.dataset.tpcPkg ?? '1'); },
    get ground() { return root.dataset.tpcGround === 'dark' ? 'dark' : 'light'; },
    color: (name) => prop(`--tpc-${name}`),
    rgb: (name) => parseHex(prop(`--tpc-${name}`), name),
    linear: (name) => {
      const [r, g, b] = parseHex(prop(`--tpc-${name}`), name);
      return [toLinear(r), toLinear(g), toLinear(b)];
    },
    stroke: (name) => px(prop(`--tpc-stroke-${name}`), `stroke-${name}`),
    dash: (name) => prop(`--tpc-dash-${name}`).split(/[\s,]+/).map(Number),
    font: (role) => ({
      family: prop(`--tpc-family-${role}`),
      sizePx: px(prop(`--tpc-size-${role}`), `size-${role}`),
      weight: prop(`--tpc-weight-${role}`),
      style: prop(`--tpc-style-${role}`),
    }),
  };
}
