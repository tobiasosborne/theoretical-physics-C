// Playwright check and screenshots of the three hydrogen views, on their standalone pages:
//
//   web/node_modules/.bin/tsx web/video/c11-views-check.ts [--standalone build/web/standalone] [--gl swiftshader]
//        [--shots build/web/c11-shots] [--tag pkg1]
//
// For each view, language de, on light and on dark ground, from file:// with the network cut:
//   mounts; draws something (more than two colours on the stage); the deterministic frame
//   repeats exactly (frame 12, frame 40, frame 12 again: first and third identical, second
//   different); a keyboard arrow on the stage moves the primary control (interactive mode);
//   no script error; no request to another host.
// With --shots it also writes screenshots: desktop (1280 wide) and phone (390 wide), light and
// dark, of the page in interactive mode, for looking at them.
// Exit status 1 on any failure; each failure is one line "c11-views: FAIL ...".
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Browser } from 'playwright';
import { REPO_ROOT } from '../tools/convert/env.ts';

const args = process.argv.slice(2);
const opt = (n: string, d: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const dir = path.resolve(opt('--standalone', path.join(REPO_ROOT, 'build/web/standalone')));
const shots = opt('--shots', '');
const tag = opt('--tag', 'pkg1');
const gl = opt('--gl', 'swiftshader');
const query = opt('--query', '');
const only = opt('--only', '');
const shotsOnly = args.includes('--shots-only');   // screenshots for looking at, without the checks
const GL: Record<string, string[]> = {
  swiftshader: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  'gl-egl': ['--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist'],
  vulkan: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'],
};
const IDS = ['c11.demo.cloud', 'c11.demo.radial', 'c11.demo.phase'].filter((i) => !only || i === only);
let failures = 0;
const fail = (m: string) => { failures++; console.log(`c11-views: FAIL ${m}`); };

async function open(browser: Browser, file: string, q: string, viewport: { width: number; height: number }, scale = 1) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale });
  const remote: string[] = [], errors: string[] = [];
  await ctx.route('**/*', (r) => { const u = r.request().url(); if (u.startsWith('file:') || u.startsWith('data:') || u.startsWith('blob:')) return r.continue(); remote.push(u); return r.abort(); });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(pathToFileURL(file).href + q);
  await page.evaluate('document.fonts.ready');
  return { ctx, page, remote, errors };
}
const sha = (b: Buffer) => crypto.createHash('sha256').update(b).digest('hex');

const browser = await chromium.launch({ args: GL[gl] });
try {
  for (const id of IDS) {
    const file = path.join(dir, `${id}.de.html`);
    if (!fs.existsSync(file)) { fail(`${path.relative(REPO_ROOT, file)} is missing (build the site, or run web/video/c11-standalone.ts)`); continue; }
    for (const ground of ['light', 'dark']) {
      const what = `${id} on ${ground} ground`;
      if (!shotsOnly) {
      // deterministic mode
      const w = await open(browser, file, `?seed=1&frame=12&ground=${ground}${query}`, { width: 900, height: 700 });
      await w.ctx.setOffline(true);
      const st = await w.page.evaluate('(() => { const e = document.getElementById("tpc-standalone"); return { state: e.dataset.state || "", error: e.dataset.error || "", det: !!(window.__tpcDemo && window.__tpcDemo.deterministic), ground: document.documentElement.dataset.tpcGround }; })()') as { state: string; error: string; det: boolean; ground: string };
      if (st.state !== 'mounted') { fail(`${what}: did not mount: ${st.error}`); await w.ctx.close(); continue; }
      if (st.ground !== ground) fail(`${what}: the page is on ${st.ground} ground`);
      if (!st.det) fail(`${what}: deterministic mode is off`);
      const frame = async (n: number) => { await w.page.evaluate(`window.__tpcDemo.renderFrame(${n})`); return w.page.locator('.tpcd-stage').screenshot(); };
      const a = await frame(12), b = await frame(40), c = await frame(12);
      if (sha(a) !== sha(c)) fail(`${what}: deterministic frame does not repeat: frame 12 rendered twice gives different pictures`);
      if (sha(a) === sha(b)) fail(`${what}: frames 12 and 40 are the same picture`);
      // something is drawn: count colours of the stage screenshot, decoded in the page
      const colours = await w.page.evaluate(async (b64) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const k = document.createElement('canvas'); k.width = img.width; k.height = img.height;
        const g = k.getContext('2d')!; g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, k.width, k.height).data; const seen = new Set<number>();
        for (let i = 0; i < d.length; i += 4 * 7) seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
        return seen.size;
      }, a.toString('base64'));
      if (colours < 3) fail(`${what}: the stage shows ${colours} colour(s): nothing was drawn`);
      const info = await w.page.evaluate('window.__tpcDemo.info()') as Record<string, unknown>;
      for (const u of w.remote) fail(`${what}: request to another host: ${u}`);
      for (const e of w.errors) fail(`${what}: script error: ${e}`);
      await w.ctx.close();

      // interactive mode: keyboard on the stage moves the primary control
      const v = await open(browser, file, `?ground=${ground}${query}`, { width: 900, height: 700 });
      const v0 = await v.page.evaluate('document.querySelector(".tpcd input[type=range]").value');
      await v.page.focus('.tpcd-stage');
      await v.page.keyboard.press('ArrowLeft');
      const v1 = await v.page.evaluate('document.querySelector(".tpcd input[type=range]").value');
      if (v0 === v1) fail(`${what}: ArrowLeft on the stage did not move the primary control`);
      const focusable = await v.page.evaluate('document.querySelectorAll(".tpcd button, .tpcd input").length') as number;
      for (const e of v.errors) fail(`${what}: script error (interactive): ${e}`);
      await v.ctx.close();
      console.log(`c11-views: ok ${what}: mounted, ${colours} colours sampled, frame 12 repeats (sha256 ${sha(a).slice(0, 12)}), ${focusable} keyboard controls${info.renderer ? `, renderer "${info.renderer}"` : ''}`);

      }
      if (shots) {
        fs.mkdirSync(shots, { recursive: true });
        for (const vp of [{ name: 'desktop', width: 1280, height: 900, scale: 1 }, { name: 'phone', width: 390, height: 844, scale: 2 }]) {
          const s = await open(browser, file, `?ground=${ground}${query}`, { width: vp.width, height: vp.height }, vp.scale);
          await s.page.waitForTimeout(400);
          const name = `${id}-${tag}-${ground}-${vp.name}.png`;
          await s.page.screenshot({ path: path.join(shots, name), fullPage: true });
          console.log(`c11-views: shot ${path.relative(REPO_ROOT, path.join(shots, name))}`);
          await s.ctx.close();
        }
      }
    }
  }
} finally {
  await browser.close();
}
console.log(failures ? `c11-views: FAILED: ${failures} problem(s)` : `c11-views: ok: ${IDS.length} views, light and dark ground, deterministic frames repeat exactly`);
process.exit(failures ? 1 : 0);
