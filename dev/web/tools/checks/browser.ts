// Browser gates (Playwright, headless Chromium), on the built site through file://, with
// every request that is not file: or data: counted as a failure:
//   tsx tools/checks/browser.ts [--site DIR] [--out DIR] [--content DIR] [--chapters c99] [--only c7,nav,corpus,demos,standalone]
//
//   c7          every block closed: no visible link into closed content except signposts;
//               number of depth blocks in the page = number in the source   (layered-docs C7)
//   nav         a link into a closed block opens it; the language link keeps the anchor;
//               the depth selector and the design switcher work
//   corpus      the formula corpus renders: no <merror>, no box of size zero, the maths font
//               is loaded, operator spacing and bold probes
//   demos       every demo on a chapter page mounts; keyboard moves its primary control
//   standalone  every standalone page works from file:// with the network cut, and the
//               deterministic mode (?seed=..&frame=..) draws the same picture twice
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { REPO_ROOT, defaultPaths, findChapters } from '../convert/env.ts';
import { countDepthBlocks } from '../convert/parse.ts';

const args = process.argv.slice(2);
const opt = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const out = path.resolve(opt('--out') ?? path.join(REPO_ROOT, 'build/web'));
const site = path.resolve(opt('--site') ?? path.join(out, 'site'));
const only = (opt('--only') ?? 'c7,nav,corpus,demos,standalone').split(',');
const INPAGE = path.join(path.dirname(new URL(import.meta.url).pathname), 'inpage.js');
let failures = 0;
const fail = (gate: string, msg: string) => { failures++; console.log(`${gate}: FAIL ${msg}`); };
const rel = (f: string) => path.relative(REPO_ROOT, f);

interface Watched { page: Page; ctx: BrowserContext; remote: string[]; errors: string[] }

async function open(browser: Browser, file: string, query = '', viewport = { width: 1280, height: 900 }): Promise<Watched> {
  const ctx = await browser.newContext({ viewport });
  const remote: string[] = [];
  const errors: string[] = [];
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (u.startsWith('file:') || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
    remote.push(u);
    return route.abort();
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(pathToFileURL(file).href + query);
  await page.addScriptTag({ path: INPAGE });
  await page.evaluate('document.fonts.ready');
  return { page, ctx, remote, errors };
}

function report(gate: string, w: Watched, file: string): void {
  for (const u of w.remote) fail(gate, `${rel(file)}: the page asked for a resource on another host: ${u}`);
  for (const e of w.errors) fail(gate, `${rel(file)}: script error: ${e}`);
}

const paths = defaultPaths({ content: opt('--content') });
const want = opt('--chapters');
const chapterIds = want ? want.split(',') : fs.readdirSync(path.join(site, 'de')).filter((d) => /^c[0-9]{2}$/.test(d)).sort();
const browser = await chromium.launch();

try {
  // ── c7 ──────────────────────────────────────────────────────
  if (only.includes('c7')) {
    const before = failures;
    const metas = findChapters(paths, chapterIds);
    let blocks = 0;
    for (const meta of metas) for (const lang of ['de', 'en'] as const) {
      const file = path.join(site, lang, meta.id, 'index.html');
      if (!fs.existsSync(file)) { fail('c7', `${rel(file)}: page missing`); continue; }
      const w = await open(browser, file);
      await w.page.evaluate('document.querySelectorAll("details.tpc-depth").forEach((d) => { d.open = false; })');
      const bad = await w.page.evaluate('window.__tpcCheck.linksIntoClosed()') as Array<{ text: string; href: string; block: string }>;
      for (const b of bad) fail('c7', `${rel(file)}: with every block closed, the visible link "${b.text}" (${b.href}) points into the closed block ${b.block}; only signposts (\\zoomref) may`);
      const got = await w.page.evaluate('window.__tpcCheck.depthBlocks()') as { vertiefung: number; fundament: number };
      const src = countDepthBlocks(path.join(meta.absDir, `${lang}.tex`));
      if (got.vertiefung !== src.vertiefung || got.fundament !== src.fundament) {
        fail('c7', `${rel(file)}: number of depth blocks differs: the page has ${got.vertiefung} Vertiefung + ${got.fundament} Fundament, the source ${meta.dir}/${lang}.tex has ${src.vertiefung} + ${src.fundament}`);
      }
      blocks += got.vertiefung + got.fundament;
      report('c7', w, file);
      await w.ctx.close();
    }
    if (failures === before) console.log(`c7: ok: ${metas.length} chapter(s) x 2 languages, ${blocks} depth blocks equal to the source, no visible link into closed content`);
  }

  // ── nav ─────────────────────────────────────────────────────
  if (only.includes('nav')) {
    const before = failures;
    let checks = 0;
    for (const ch of chapterIds) {
      const file = path.join(site, 'de', ch, 'index.html');
      const w = await open(browser, file);
      const p = w.page;
      // (1) a signpost opens its block
      const sign = await p.evaluate('(() => { const a = document.querySelector("a.tpc-zoomref"); return a ? a.getAttribute("href").slice(1) : null; })()') as string | null;
      if (sign) {
        await p.click(`a.tpc-zoomref[href="#${sign}"]`);
        const open1 = await p.evaluate(`document.getElementById(${JSON.stringify(sign)}).open`);
        if (!open1) fail('nav', `${rel(file)}: clicking the signpost to ${sign} did not open the block`);
        checks++;
      }
      // (2) a fragment that lies inside a closed block opens it
      const inner = await p.evaluate('(() => { document.querySelectorAll("details.tpc-depth").forEach((d) => { d.open = false; }); const e = document.querySelector("details.tpc-depth > .tpc-depth-body [id]"); return e ? e.id : null; })()') as string | null;
      if (inner) {
        await p.evaluate(`location.hash = ${JSON.stringify('#' + inner)}`);
        await p.waitForTimeout(100);
        const ok = await p.evaluate(`(() => { const e = document.getElementById(${JSON.stringify(inner)}); const d = e.closest("details"); const r = e.getBoundingClientRect(); return d.open && r.height > 0 && r.top >= 0 && r.top < innerHeight; })()`);
        if (!ok) fail('nav', `${rel(file)}: following #${inner} did not open the enclosing block and scroll to it`);
        checks++;
        // (3) the language link keeps the anchor
        await p.click('a.tpc-langlink');
        await p.waitForLoadState('load');
        const url = p.url();
        const found = await p.evaluate(`!!document.getElementById(${JSON.stringify(inner)})`);
        if (!url.includes('/en/') || decodeURIComponent(url.split('#')[1] ?? '') !== inner || !found) fail('nav', `${rel(file)}: the language link went to ${url}; expected the English page at #${inner}`);
        checks++;
        await p.goBack();
        await p.waitForLoadState('load');
      }
      // (4) depth selector
      await p.evaluate('localStorage.clear()');
      await p.goto(pathToFileURL(file).href);
      await p.addScriptTag({ path: INPAGE });
      const total = await p.evaluate('window.__tpcCheck.depthBlocks()') as { vertiefung: number; fundament: number; open: number };
      if (total.open !== 0) fail('nav', `${rel(file)}: ${total.open} block(s) open on first load; Kern is the default`);
      await p.click('label:has(input[name="tpc-depth"][value="vertiefung"])');
      const v = await p.evaluate('window.__tpcCheck.depthBlocks()') as { open: number };
      await p.click('label:has(input[name="tpc-depth"][value="alles"])');
      const a = await p.evaluate('window.__tpcCheck.depthBlocks()') as { open: number };
      if (v.open !== total.vertiefung || a.open !== total.vertiefung + total.fundament) {
        fail('nav', `${rel(file)}: depth selector: "Kern + Vertiefung" opened ${v.open} of ${total.vertiefung}, "Alles" opened ${a.open} of ${total.vertiefung + total.fundament}`);
      }
      checks++;
      // (5) design switcher: another package and ground change the token values on the page
      const ink0 = await p.evaluate('getComputedStyle(document.documentElement).getPropertyValue("--tpc-ground").trim()');
      await p.click('details.tpc-design > summary');
      await p.click('label:has(input[name="tpc-ground"][value="dark"])');
      await p.click('label:has(input[name="tpc-pkg"][value="4"])');
      await p.waitForFunction(`getComputedStyle(document.documentElement).getPropertyValue("--tpc-ground").trim() !== ${JSON.stringify(ink0)}`, null, { timeout: 5000 }).catch(() => undefined);
      const st = await p.evaluate('({ g: getComputedStyle(document.documentElement).getPropertyValue("--tpc-ground").trim(), pkg: document.documentElement.dataset.tpcPkg, ground: document.documentElement.dataset.tpcGround, href: document.getElementById("tpc-tokens").getAttribute("href") })') as { g: string; pkg: string; ground: string; href: string };
      if (st.g === ink0 || st.pkg !== '4' || st.ground !== 'dark' || !st.href.endsWith('pkg4-dark.css')) fail('nav', `${rel(file)}: design switcher did not switch to pkg 4 dark (${JSON.stringify(st)})`);
      checks++;
      report('nav', w, file);
      await w.ctx.close();
    }
    if (failures === before) console.log(`nav: ok: ${checks} checks (signpost opens block, fragment opens block, language link keeps anchor, depth selector, design switcher)`);
  }

  // ── corpus ──────────────────────────────────────────────────
  if (only.includes('corpus')) {
    const before = failures;
    const file = path.join(out, 'corpus/index.html');
    if (!fs.existsSync(file)) fail('corpus', `${rel(file)}: corpus page missing`);
    else {
      const w = await open(browser, file);
      const p = w.page;
      const font = await p.evaluate('window.__tpcCheck.mathFont()') as { family: string; first: string; loaded: boolean; faces: string[] };
      if (!font.faces.includes(font.first)) fail('corpus', `the mathematics font "${font.first}" was not loaded from the bundled files (loaded faces: ${font.faces.join(', ') || 'none'})`);
      const r = await p.evaluate('window.__tpcCheck.mathFaults()') as { count: number; faults: Array<{ what: string; where: string }> };
      for (const f of r.faults) fail('corpus', `${f.what}: ${f.where}`);
      // operator spacing: \tr X has a thin space after the operator, \tr(XY) has none.
      // Threshold 0.1 em between the two gaps: unvalidated choice (TeX's thin space is 1/6 em).
      const gs = await p.evaluate('window.__tpcCheck.operatorGap("tr-space", "tr")') as number | null;
      const gp = await p.evaluate('window.__tpcCheck.operatorGap("tr-paren", "tr")') as number | null;
      if (gs === null || gp === null) fail('corpus', 'operator spacing probes tr-space / tr-paren not found on the corpus page');
      else if (!(gs - gp >= 0.1)) fail('corpus', `operator spacing: gap after tr is ${gs.toFixed(3)} em before a letter and ${gp.toFixed(3)} em before a parenthesis; expected a thin space only before the letter`);
      const bold: Array<[string, string]> = [['bold-registry', '1d493'], ['bold-symbol', '1d493'], ['bold-upright', '1d411'], ['bold-greek', '1d736']];
      for (const [probe, cp] of bold) {
        const t = await p.evaluate(`window.__tpcCheck.probeText(${JSON.stringify(probe)})`) as { tag: string; codepoints: string[]; mathvariant: string | null; width: number } | null;
        if (!t) { fail('corpus', `bold probe ${probe} not found`); continue; }
        if (t.tag !== 'mi' || t.codepoints.join(',') !== cp || t.mathvariant !== null || !(t.width > 0)) {
          fail('corpus', `bold probe ${probe}: expected <mi> with the Unicode bold letter U+${cp.toUpperCase()} and no mathvariant; got <${t.tag}> U+${t.codepoints.join(',U+').toUpperCase()} mathvariant=${t.mathvariant} width=${t.width}`);
        }
      }
      report('corpus', w, file);
      if (failures === before) {
        console.log(`corpus: ok: ${r.count} <math> elements rendered in headless Chromium ${browser.version()}: no <merror>, no zero-size box; font "${font.first}" loaded; `
          + `gap after tr: ${gs!.toFixed(3)} em before a letter, ${gp!.toFixed(3)} em before a parenthesis; bold probes are Unicode bold letters`);
      }
      await w.ctx.close();
    }
    // the chapter pages too, with every block open
    for (const ch of chapterIds) for (const lang of ['de', 'en']) {
      const file2 = path.join(site, lang, ch, 'index.html');
      const w = await open(browser, file2, '?depth=alles');
      const r = await w.page.evaluate('window.__tpcCheck.mathFaults()') as { count: number; faults: Array<{ what: string; where: string }> };
      for (const f of r.faults) fail('corpus', `${rel(file2)}: ${f.what}: ${f.where}`);
      await w.ctx.close();
    }
  }

  // ── demos ───────────────────────────────────────────────────
  if (only.includes('demos')) {
    const before = failures;
    let n = 0;
    for (const ch of chapterIds) for (const lang of ['de', 'en']) {
      const file = path.join(site, lang, ch, 'index.html');
      const w = await open(browser, file, '?depth=alles');
      const p = w.page;
      const ids = await p.evaluate('[...document.querySelectorAll(".tpc-demo[data-demo]")].map((e) => e.dataset.demo)') as string[];
      for (const id of ids) {
        const sel = `.tpc-demo[data-demo="${id}"]`;
        await p.locator(sel).scrollIntoViewIfNeeded();
        try {
          await p.waitForFunction(`["mounted", "failed"].includes(document.querySelector(${JSON.stringify(sel)}).dataset.state)`, null, { timeout: 15000 });
        } catch { /* reported below */ }
        const st = await p.evaluate(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); const s = e.querySelector(".tpcd-stage"); const r = s ? s.getBoundingClientRect() : { width: 0, height: 0 }; return { state: e.dataset.state || "", error: e.dataset.error || "", w: r.width, h: r.height, poster: !!e.querySelector("img.tpc-demo-poster"), alt: (e.querySelector("img.tpc-demo-poster") || {}).alt || "" }; })()`) as { state: string; error: string; w: number; h: number; poster: boolean; alt: string };
        if (st.state !== 'mounted') { fail('demos', `${rel(file)}: demo ${id} did not mount (state "${st.state}"): ${st.error}`); continue; }
        if (!(st.w > 0 && st.h > 0)) fail('demos', `${rel(file)}: demo ${id}: stage has no size`);
        if (!st.poster || st.alt === '') fail('demos', `${rel(file)}: demo ${id}: the still with its alt text is not kept as the fallback`);
        // keyboard: an arrow key on the focused stage moves the primary control
        const v0 = await p.evaluate(`document.querySelector(${JSON.stringify(sel + ' input[type=range]')}).value`);
        await p.focus(`${sel} .tpcd-stage`);
        await p.keyboard.press('ArrowLeft');
        const v1 = await p.evaluate(`document.querySelector(${JSON.stringify(sel + ' input[type=range]')}).value`);
        if (v0 === v1) fail('demos', `${rel(file)}: demo ${id}: ArrowLeft on the stage did not move the primary control (value stays ${v0})`);
        n++;
      }
      report('demos', w, file);
      await w.ctx.close();
    }
    if (failures === before) console.log(`demos: ok: ${n} demo instance(s) mounted on chapter pages, keyboard control works, stills kept as fallback`);
  }

  // ── standalone ──────────────────────────────────────────────
  if (only.includes('standalone')) {
    const before = failures;
    const dir = path.join(out, 'standalone');
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.html') && chapterIds.some((c) => f.startsWith(c + '.'))).sort() : [];
    const expected = findChapters(paths, chapterIds).flatMap((m) => m.assets.filter((a) => a.kind === 'demo' || a.kind === 'game').flatMap((a) => [`${a.id}.de.html`, `${a.id}.en.html`]));
    for (const e of expected) if (!files.includes(e)) fail('standalone', `${rel(path.join(dir, e))}: standalone page missing`);
    for (const f of files) {
      const file = path.join(dir, f);
      const w = await open(browser, file, '?seed=1&frame=12', { width: 900, height: 700 });
      await w.ctx.setOffline(true);
      const p = w.page;
      const st = await p.evaluate('(() => { const e = document.getElementById("tpc-standalone"); return { state: e.dataset.state || "", error: e.dataset.error || "", det: !!(window.__tpcDemo && window.__tpcDemo.deterministic) }; })()') as { state: string; error: string; det: boolean };
      if (st.state !== 'mounted') { fail('standalone', `${rel(file)}: did not mount from file:// (${st.error})`); await w.ctx.close(); continue; }
      if (!st.det) fail('standalone', `${rel(file)}: ?seed=1&frame=12 did not switch on the deterministic mode`);
      const shot = async (frame: number) => {
        await p.evaluate(`window.__tpcDemo.renderFrame(${frame})`);
        return (await p.locator('.tpcd-stage').screenshot()).toString('base64');
      };
      const a = await shot(12); const b = await shot(40); const c = await shot(12);
      if (a !== c) fail('standalone', `${rel(file)}: deterministic mode: frame 12 rendered twice gives different pictures`);
      if (a === b) fail('standalone', `${rel(file)}: deterministic mode: frames 12 and 40 are the same picture (the frame parameter has no effect)`);
      report('standalone', w, file);
      await w.ctx.close();
    }
    if (failures === before) console.log(`standalone: ok: ${files.length} single-file page(s) mount from file:// with the network cut; deterministic frames repeat exactly`);
  }
} finally {
  await browser.close();
}
process.exit(failures ? 1 : 0);
