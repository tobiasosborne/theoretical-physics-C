// Exact numbers as text for the C2 demos. No DOM.
import { ratToNumber, surdToNumber, type Rat, type Surd, type Vec } from '../../kernels/gpt';

const MINUS = '−';

export function fmtRat(r: Rat): string {
  const n = r.n < 0n ? -r.n : r.n;
  return (r.n < 0n ? MINUS : '') + (r.d === 1n ? `${n}` : `${n}/${r.d}`);
}
/** y*sqrt(m) without sign: "√2/4", "3√5/20", "2√3" */
function root(y: Rat, m: bigint): string {
  const n = y.n < 0n ? -y.n : y.n;
  return `${n === 1n ? '' : n}√${m}${y.d === 1n ? '' : `/${y.d}`}`;
}
/** the exact value: "3/4", "1/2 + √2/4", "−√2/4" */
export function fmtSurd(s: Surd): string {
  if (s.y.n === 0n) return fmtRat(s.x);
  if (s.x.n === 0n) return (s.y.n < 0n ? MINUS : '') + root(s.y, s.m);
  return `${fmtRat(s.x)} ${s.y.n < 0n ? MINUS : '+'} ${root(s.y, s.m)}`;
}
export const fmtVec = (v: Vec): string => `(${v.map(fmtRat).join(', ')})`;

/** a rational whose decimal expansion ends within `places` digits */
function terminates(r: Rat, places: number): boolean {
  return (10n ** BigInt(places) * r.n) % r.d === 0n;
}
/**
 * The decimal form beside an exact value, for orientation only: "= 0,75" when the
 * expansion ends within four places, otherwise "≈ 0,8536" (rounded to four places, a
 * presentation choice). Integers and 1/2 need none.
 */
export function fmtDecimal(s: Surd, lang: 'de' | 'en'): string {
  const rational = s.y.n === 0n;
  if (rational && s.x.d <= 2n) return '';
  const exact = rational && terminates(s.x, 4);
  const v = rational ? ratToNumber(s.x) : surdToNumber(s);
  const text = v.toLocaleString(lang, exact ? { maximumFractionDigits: 4 } : { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  return `${exact ? '=' : '≈'} ${text.replace('-', MINUS)}`;
}
export function fmtBoth(s: Surd, lang: 'de' | 'en'): string {
  const d = fmtDecimal(s, lang);
  return d ? `${fmtSurd(s)} ${d}` : fmtSurd(s);
}
