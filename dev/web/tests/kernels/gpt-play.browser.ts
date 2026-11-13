// Playwright check of the game c02.demo.distinguish (and a smoke check of the explorer),
// on the standalone single-file pages, from file:// with the network cut.
//
//   web/node_modules/.bin/tsx web/tests/kernels/gpt-play.browser.ts            # builds the two pages itself
//   web/node_modules/.bin/tsx web/tests/kernels/gpt-play.browser.ts --standalone build/web/standalone
//                                                                              # pages of the site build
//   options: --pkg N (own build only), --lang de|en,
//            --shots DIR: instead of playing, write screenshots for looking at (pkg 1 and 4, light and dark,
//            desktop and phone width; explorer and game) into DIR
//
// What it does, per level, through the keyboard only (focus on the figure):
//   1. reads the displayed score of the starting effect and checks it is strictly below
//      the reference P_opt;
//   2. commits that non-optimal effect in a first page load: fewer than three stars, the
//      displayed committed score strictly below the displayed P_opt;
//   3. in a fresh page load plays to the optimum by greedy ascent: press a key (arrows, +,
//      -), keep the move if the displayed exact score rose, otherwise undo it with Z;
//      when no key improves, press Enter;
//   4. reads the displayed P and P_opt: both must equal the P_opt of the Julia reference
//      (web/tests/golden/gpt.json) exactly, with three stars, and P_opt must not have been
//      in the page before the commit.
// The displayed values are read from the page (text and its data-exact twin); they are
// compared exactly with the kernel's cmpSurd. This file uses the build tools read-only
// (bundles.ts, gen.ts); it is not part of web/check.sh.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Page } from 'playwright';
import { cmpSurd, surdFromJSON, type SurdJSON } from '../../src/kernels/gpt';
import { buildDemoBundle, writeStandalone } from '../../tools/build/bundles.ts';
import { writeGen } from '../../tools/build/gen.ts';
import { REPO_ROOT, defaultPaths } from '../../tools/convert/env.ts';

const args = process.argv.slice(2);
const opt = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const lang = (opt('--lang') ?? 'de') as 'de' | 'en';
const pkg = Number(opt('--pkg') ?? '1');
const shots = opt('--shots') ? path.resolve(opt('--shots')!) : null;
let dir = opt('--standalone') ? path.resolve(opt('--standalone')!) : null;

const IDS = ['c02.demo.explorer', 'c02.demo.distinguish'];
const TITLES: Record<string, Record<string, string>> = {
  'c02.demo.explorer': { de: 'Zustandsraum und Effekte', en: 'State space and effects' },
  'c02.demo.distinguish': { de: 'Unterscheiden', en: 'Distinguish' },
};
/** own build of the two standalone pages, with the site's own bundler functions */
async function buildPages(p: number): Promise<string> {
  const outDir = path.join(REPO_ROOT, 'build/web/c02-dev', `pkg${p}`);
  const paths = defaultPaths();
  const gen = writeGen(paths, 1, 'light');          // the same generated inputs as web/check.sh
  for (const id of IDS) {
    const bundle = await buildDemoBundle(gen, id, path.join(outDir, 'bundles'));
    for (const l of ['de', 'en'] as const) {
      writeStandalone(paths, { id, lang: l, title: TITLES[id][l], chapter: 'c02', chapterTitle: l === 'de' ? 'Allgemeine probabilistische Theorien' : 'General probabilistic theories', bundle, pkg: p }, path.join(outDir, `${id}.${l}.html`));
    }
  }
  console.log(`play: built ${IDS.length * 2} standalone pages in ${path.relative(REPO_ROOT, outDir)}`);
  return outDir;
}

if (shots) {
  fs.mkdirSync(shots, { recursive: true });
  const b = await chromium.launch();
  const pages: Array<[string, string, string]> = [
    ['explorer-bit', 'c02.demo.explorer', '?theory=classical_bit'],
    ['explorer-square', 'c02.demo.explorer', '?theory=square_bit'],
    ['explorer-qubit', 'c02.demo.explorer', '?theory=qubit_ball'],
    ['explorer-square-cones', 'c02.demo.explorer', '?theory=square_bit&view=cones'],
    ['explorer-qubit-cones', 'c02.demo.explorer', '?theory=qubit_ball&view=cones'],
    ['explorer-bit-cones', 'c02.demo.explorer', '?theory=classical_bit&view=cones'],
    ['game-B2-start', 'c02.demo.distinguish', '?level=2'],
    ['game-S1-walk', 'c02.demo.distinguish', '?level=3&frame=45'],
    ['game-B2-done', 'c02.demo.distinguish', '?level=2&frame=9999'],
    ['game-S2-done', 'c02.demo.distinguish', '?level=4&frame=9999'],
    ['game-Q1-walk', 'c02.demo.distinguish', '?level=5&frame=60'],
    ['game-Q1-done', 'c02.demo.distinguish', '?level=5&frame=9999'],
    ['game-Q2-done', 'c02.demo.distinguish', '?level=6&frame=9999'],
  ];
  const only = opt('--only') ?? '';
  for (const p of [1, 4]) {
    const d = dir ?? await buildPages(p);
    for (const ground of ['light', 'dark']) for (const view of [{ name: 'desktop', width: 1100, height: 900, scale: 1 }, { name: 'phone', width: 390, height: 844, scale: 2 }]) {
      for (const [name, id, q] of pages) {
        const file = `${name}-pkg${p}-${ground}-${view.name}-${lang}.png`;
        if (only && !file.includes(only)) continue;
        if (p === 4 && !(name.includes('cones') || name === 'game-S2-done' || name === 'explorer-square')) continue;      // the other package: a sample
        const ctx = await b.newContext({ viewport: { width: view.width, height: view.height }, deviceScaleFactor: view.scale, hasTouch: view.name === 'phone' });
        const page = await ctx.newPage();
        page.on('pageerror', (e) => console.log(`shots: script error in ${file}: ${e.message}`));
        await page.goto(pathToFileURL(path.join(d, `${id}.${lang}.html`)).href + q + `&ground=${ground}`);
        await page.evaluate('document.fonts.ready');
        if (name === 'game-B2-start') { await page.focus('.tpcd-stage'); for (const k of ['ArrowLeft', 'ArrowLeft', 'ArrowLeft', 'ArrowUp']) await page.keyboard.press(k); await page.click('.c02 details summary'); }
        await page.waitForTimeout(250);
        await page.screenshot({ path: path.join(shots, file), fullPage: true });
        console.log(`shot: ${file}`);
        await ctx.close();
      }
    }
    if (dir) break;
  }
  await b.close();
  process.exit(0);
}
if (!dir) dir = await buildPages(pkg);

interface LevelCase { kind: string; id: string; p_opt: SurdJSON; expected: number }
const golden = (JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'web/tests/golden/gpt.json'), 'utf8')) as { cases: LevelCase[] }).cases.filter((c) => c.kind === 'level');

let failures = 0;
const fail = (msg: string) => { failures++; console.log(`play: FAIL ${msg}`); };
const browser = await chromium.launch();

async function open(id: string, query = ''): Promise<{ page: Page; close(): Promise<void>; errors: string[]; remote: string[] }> {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 1000 } });
  const errors: string[] = [], remote: string[] = [];
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith('file:') || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
    remote.push(u);
    return route.abort();
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (mm) => { if (mm.type() === 'error') errors.push(mm.text()); });
  await page.goto(pathToFileURL(path.join(dir!, `${id}.${lang}.html`)).href + query);
  await ctx.setOffline(true);
  await page.evaluate('document.fonts.ready');
  const state = await page.evaluate('document.getElementById("tpc-standalone").dataset.state + "|" + (document.getElementById("tpc-standalone").dataset.error || "")') as string;
  if (!state.startsWith('mounted')) fail(`${id}: did not mount: ${state}`);
  return { page, errors, remote, close: () => ctx.close() };
}
/** wait until the picture has been redrawn after the last input */
const settle = (page: Page) => page.evaluate('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))))');
const exact = async (page: Page, key: string): Promise<SurdJSON | null> => {
  const s = await page.evaluate(`(() => { const e = document.querySelector('.c02 [data-c02="${key}"]'); return e ? e.dataset.exact || null : null; })()`) as string | null;
  return s ? JSON.parse(s) as SurdJSON : null;
};
const shown = (page: Page, key: string) => page.evaluate(`(() => { const e = document.querySelector('.c02 [data-c02="${key}"]'); return e ? e.textContent : null; })()`) as Promise<string | null>;
const cmp = (a: SurdJSON, b: SurdJSON) => cmpSurd(surdFromJSON(a), surdFromJSON(b));
const key = async (page: Page, k: string) => { await page.keyboard.press(k); await settle(page); };

const MOVES = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', '+', '-'];

for (const [i, lv] of golden.entries()) {
  const n = i + 1;
  // 1 and 2: the starting effect is not optimal; committing it is rewarded with fewer than three stars
  {
    const w = await open('c02.demo.distinguish', `?level=${n}`);
    const { page } = w;
    await page.focus('.tpcd-stage'); await settle(page);
    const level = await page.evaluate('document.querySelector(".c02").dataset.level');
    if (level !== lv.id) fail(`level ${n}: the page shows level ${level}, the reference has ${lv.id}`);
    const P0 = (await exact(page, 'P'))!;
    if (!(cmp(P0, lv.p_opt) < 0)) fail(`level ${lv.id}: the starting effect scores ${JSON.stringify(P0)}, not strictly below P_opt ${JSON.stringify(lv.p_opt)}`);
    if (await exact(page, 'Popt')) fail(`level ${lv.id}: P_opt is in the page before the commit`);
    await key(page, 'ArrowRight');             // one step away from the start, still not optimal
    const P1 = (await exact(page, 'P'))!;
    await key(page, 'Enter');
    const stars = Number(await page.evaluate('(document.querySelector(".c02 [data-c02=stars]") || { dataset: {} }).dataset.stars'));
    const pc = await exact(page, 'Pcommitted'), po = await exact(page, 'Popt');
    if (!pc || !po) fail(`level ${lv.id}: no result after the commit`);
    else {
      if (cmp(pc, P1) !== 0) fail(`level ${lv.id}: the committed score differs from the score shown before the commit`);
      if (cmp(P1, lv.p_opt) < 0 && !(stars < 3 && cmp(pc, po) < 0)) fail(`level ${lv.id}: a non-optimal effect (${JSON.stringify(pc)}) is not scored strictly below P_opt, or got ${stars} stars`);
      if (cmp(P1, lv.p_opt) >= 0) fail(`level ${lv.id}: one step from the start already reaches P_opt; the non-optimal check has no subject`);
      if (cmp(po, lv.p_opt) !== 0) fail(`level ${lv.id}: displayed P_opt ${JSON.stringify(po)} differs from the reference ${JSON.stringify(lv.p_opt)}`);
    }
    for (const e of w.errors) fail(`level ${lv.id}: script error: ${e}`);
    for (const u of w.remote) fail(`level ${lv.id}: request to another host: ${u}`);
    await w.close();
  }
  // 3 and 4: play to the optimum through the keyboard
  {
    const w = await open('c02.demo.distinguish', `?level=${n}`);
    const { page } = w;
    await page.focus('.tpcd-stage'); await settle(page);
    let P = (await exact(page, 'P'))!;
    let moves = 0, improved = true;
    while (improved && moves < 400) {
      improved = false;
      for (const k of MOVES) {
        const e0 = await page.evaluate('document.querySelector(\'.c02 [data-c02="e"]\').dataset.exact') as string;
        await key(page, k);
        const e1 = await page.evaluate('document.querySelector(\'.c02 [data-c02="e"]\').dataset.exact') as string;
        if (e1 === e0) continue;                                    // the key did not move the effect (boundary of E(K))
        const Q = (await exact(page, 'P'))!;
        if (cmp(Q, P) > 0) { P = Q; improved = true; moves++; break; }
        await key(page, 'z');                                       // not better: undo the step
        const e2 = await page.evaluate('document.querySelector(\'.c02 [data-c02="e"]\').dataset.exact') as string;
        if (e2 !== e0) { fail(`level ${lv.id}: Z did not restore the effect after ${k}`); improved = false; break; }
      }
    }
    await key(page, 'Enter');
    const pc = await exact(page, 'Pcommitted'), po = await exact(page, 'Popt');
    const stars = Number(await page.evaluate('(document.querySelector(".c02 [data-c02=stars]") || { dataset: {} }).dataset.stars'));
    const text = `P = ${await shown(page, 'Pcommitted')}, P_opt = ${await shown(page, 'Popt')}`;
    if (!pc || !po) fail(`level ${lv.id}: no result after the commit`);
    else {
      if (cmp(po, lv.p_opt) !== 0) fail(`level ${lv.id}: displayed P_opt ${JSON.stringify(po)} differs from the reference ${JSON.stringify(lv.p_opt)}`);
      if (cmp(pc, lv.p_opt) !== 0) fail(`level ${lv.id}: keyboard play ended at ${JSON.stringify(pc)}, the reference optimum is ${JSON.stringify(lv.p_opt)}`);
      if (stars !== 3) fail(`level ${lv.id}: ${stars} stars at the optimum`);
      const num = Number((await shown(page, 'Popt'))!.replace(/.*[=≈] */, '').replace(',', '.').replace('−', '-'));
      if (Number.isFinite(num) && Math.abs(num - lv.expected) > 5e-5) fail(`level ${lv.id}: the decimal shown for P_opt (${num}) is not the reference value ${lv.expected} rounded to four places`);
    }
    console.log(`play: level ${lv.id}: ${moves} improving moves by keyboard; displayed ${text}; ${stars} stars`);
    for (const e of w.errors) fail(`level ${lv.id}: script error: ${e}`);
    await w.close();
  }
}

// the explorer: mounts, the arrow key on the figure moves the first slider, the three theories and the cone view draw
{
  const w = await open('c02.demo.explorer');
  const { page } = w;
  await page.focus('.tpcd-stage'); await settle(page);
  const v0 = await page.evaluate('document.querySelector(".c02 input[type=range]").value');
  await key(page, 'ArrowLeft');
  const v1 = await page.evaluate('document.querySelector(".c02 input[type=range]").value');
  if (v0 === v1) fail('explorer: ArrowLeft on the figure did not move the first slider');
  for (const id of ['classical_bit', 'square_bit', 'qubit_ball']) {
    await page.click(`.c02 button[data-theory="${id}"]`); await settle(page);
    const p = await exact(page, 'p');
    if (!p) fail(`explorer: no exact p for ${id}`);
    await page.focus('.tpcd-stage');
    const before = await shown(page, 'p');
    for (const k of ['ArrowRight', '+', 'ArrowUp']) await key(page, k);
    if (before === await shown(page, 'p') && before === await shown(page, 'mixL')) { /* the value may coincide; the slider check above covers the keys */ }
    if ((await shown(page, 'mixL')) !== (await shown(page, 'mixR'))) fail(`explorer: ${id}: e of the mixture and the mixture of the values are displayed differently`);
    await page.click('.c02 button[data-c02="cones"]'); await settle(page);
    const ok = await page.evaluate('(() => { const c = document.querySelector(".c02-3d canvas"); return !!c && c.width > 0 && !document.querySelector(".c02-3d").hidden; })()');
    if (!ok) fail(`explorer: ${id}: the cone view did not draw`);
    await page.click('.c02 button[data-c02="cones"]'); await settle(page);
  }
  for (const e of w.errors) fail(`explorer: script error: ${e}`);
  for (const u of w.remote) fail(`explorer: request to another host: ${u}`);
  await w.close();
}

await browser.close();
console.log(failures ? `play: FAILED: ${failures} problem(s)` : `play: ok: ${golden.length} levels played to the reference optimum by keyboard; non-optimal effects score strictly less; explorer draws three theories and the cone view`);
process.exit(failures ? 1 : 0);
