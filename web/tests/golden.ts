// Golden-test convention for kernels (web/README.md, "Golden tests").
// A golden file is JSON written by the reference implementation:
//   { "kernel": name, "reference": {implementation, script}, "tolerance": {"abs": a, "rel": r},
//     "cases": [ {..inputs.., "expected": number | number[] | number[][] } ] }
// GOLDEN_DIR points the tests at another directory (the red corpus uses it).
import fs from 'node:fs';
import path from 'node:path';

export interface Golden<C> { kernel: string; reference: { implementation: string; script: string }; tolerance: { abs?: number; rel?: number }; cases: C[] }

const DIR = process.env.GOLDEN_DIR ? path.resolve(process.env.GOLDEN_DIR) : path.join(path.dirname(new URL(import.meta.url).pathname), 'golden');

export function loadGolden<C>(name: string): Golden<C> {
  const file = path.join(DIR, `${name}.json`);
  if (!fs.existsSync(file)) throw new Error(`golden file missing: ${file} (run the reference script)`);
  const g = JSON.parse(fs.readFileSync(file, 'utf8')) as Golden<C>;
  if (g.tolerance?.abs === undefined && g.tolerance?.rel === undefined) throw new Error(`${file}: no tolerance stated`);
  return g;
}

type Nested = number | Nested[];

/** Compare a kernel result with the golden value within the stated tolerance; throws "golden mismatch". */
export function expectGolden(got: unknown, expected: Nested, tol: { abs?: number; rel?: number }, what: string): void {
  const walk = (g: unknown, e: Nested, at: string): void => {
    if (Array.isArray(e)) {
      if (!Array.isArray(g) || g.length !== e.length) throw new Error(`golden mismatch: ${what}${at}: shape differs (kernel ${JSON.stringify(g)}, reference ${JSON.stringify(e)})`);
      e.forEach((x, i) => walk(g[i], x, `${at}[${i}]`));
      return;
    }
    if (typeof g !== 'number' || !Number.isFinite(g)) throw new Error(`golden mismatch: ${what}${at}: kernel returned ${String(g)}, reference ${e}`);
    const bound = Math.max(tol.abs ?? 0, (tol.rel ?? 0) * Math.abs(e));
    if (Math.abs(g - e) > bound) {
      throw new Error(`golden mismatch: ${what}${at}: kernel ${g}, reference ${e}, difference ${Math.abs(g - e)} exceeds the stated tolerance ${bound}`);
    }
  };
  walk(got, expected, '');
}
