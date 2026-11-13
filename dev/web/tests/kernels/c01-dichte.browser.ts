// Playwright check of c01.demo.dichte (review REVIEW-demos.md, row "WRONG dichte:59"): after the
// clock has moved the picture, every control must select exactly its stated value, infinite
// endpoints must stay infinite, and the controls must show what is drawn.
//
//   web/node_modules/.bin/tsx web/tests/kernels/c01-dichte.browser.ts --standalone build/c01demo-web/standalone
//
// The page is opened in deterministic mode at frame 30 (time 1 s at 30 fps), which is the state
// the reviewer reached with render(30, 1); then the controls are used and window.__tpcDemo.info()
// is read. Exit status 1 on the first failure. Not part of web/check.sh.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Page } from 'playwright';

const args = process.argv.slice(2);
const dir = path.resolve(args[args.indexOf('--standalone') + 1] ?? 'build/web/standalone');
const file = pathToFileURL(path.join(dir, 'c01.demo.dichte.de.html')).href;

type Info = Record<string, string | number | boolean>;
const info = (p: Page) => p.evaluate('window.__tpcDemo.info()') as Promise<Info>;
const slider = (p: Page, i: number, v: number) => p.$$eval('.tpcd-controls input[type=range]', (els, [k, x]) => {
  const e = els[k] as HTMLInputElement; e.value = String(x); e.dispatchEvent(new Event('input', { bubbles: true }));
}, [i, v] as [number, number]);
const button = (p: Page, text: string) => p.locator('.tpcd-controls button', { hasText: text }).first().click();
let failed = 0;
const expect = (what: string, got: unknown, want: unknown) => {
  const ok = typeof want === 'number' ? Math.abs(Number(got) - want) <= 1e-15 : got === want;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}: ${String(got)}${ok ? '' : ` (expected ${String(want)})`}`);
  if (!ok) failed++;
};

const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
await page.goto(`${file}?seed=1&frame=30`);
await page.waitForFunction('!!window.__tpcDemo');

let i = await info(page);
expect('the clock has moved the Gauss interval (frame 30)', i.a !== '0,50', true);
await button(page, '[0, ∞)');
i = await info(page);
expect('symmetry button after playback: a', i.a, '0,00');
expect('symmetry button after playback: b', i.b, '+∞');
expect('symmetry button after playback: P[[0, ∞)]', i.probability, 0.5);
await slider(page, 0, -4.05);
i = await info(page);
expect('a slider at its left end: a', i.a, '−∞');
expect('infinite endpoints stay: b', i.b, '+∞');
expect('P[(-∞, ∞)]', i.probability, 1);
await slider(page, 0, 1);
i = await info(page);
expect('a slider after playback selects 1: a', i.a, '1,00');

await button(page, 'gleichmäßige Dichte');
await slider(page, 2, 6);
i = await info(page);
expect('uniform length slider selects 6/12', i.L, '6/12');
expect('the interval still covers [0, L]', i.uniformInterval, '0/24,12/24');
await slider(page, 3, 3);
i = await info(page);
expect('uniform left endpoint slider selects 3/24', i.uniformInterval, '3/24,12/24');
await slider(page, 3, 20);
i = await info(page);
expect('the left endpoint stops at the right one (order as when dragging)', i.uniformInterval, '12/24,12/24');

// the uniform density while its length has been moved by the clock
await page.goto(`${file}?seed=1&frame=30&mode=uniform`);
await page.waitForFunction('!!window.__tpcDemo');
i = await info(page);
expect('the clock has moved L (frame 30, uniform)', i.L !== '6/12', true);
await slider(page, 2, 6);
i = await info(page);
expect('uniform length slider after playback selects 6/12', i.L, '6/12');

await browser.close();
if (failed) { console.log(`c01-dichte: ${failed} failure(s)`); process.exit(1); }
console.log('c01-dichte: ok');
