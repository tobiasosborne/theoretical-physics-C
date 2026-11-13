// Screenshots of built pages, for looking at them:
//   tsx tools/shots/shot.ts --out build/web/shots [--site build/web/site] [--chapter c99] [--lang de]
// Writes desktop and phone shots for pkg 1 light, pkg 4 dark, pkg 5 light, with the depth
// blocks closed and open.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { REPO_ROOT } from '../convert/env.ts';

const args = process.argv.slice(2);
const opt = (n: string, d: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const site = path.resolve(opt('--site', path.join(REPO_ROOT, 'build/web/site')));
const out = path.resolve(opt('--out', path.join(REPO_ROOT, 'build/web/shots')));
const chapter = opt('--chapter', 'c99');
const lang = opt('--lang', 'de');
const only = opt('--only', '');
fs.mkdirSync(out, { recursive: true });

const combos = [['1', 'light'], ['4', 'dark'], ['5', 'light']];
const views = [{ name: 'desktop', width: 1280, height: 900, scale: 1 }, { name: 'phone', width: 390, height: 844, scale: 2 }];
const browser = await chromium.launch();
for (const [pkg, ground] of combos) {
  for (const v of views) {
    for (const depth of ['kern', 'alles']) {
      const name = `${chapter}-${lang}-pkg${pkg}-${ground}-${v.name}-${depth}`;
      if (only && !name.includes(only)) continue;
      const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.scale, hasTouch: v.name === 'phone' });
      const page = await ctx.newPage();
      const url = pathToFileURL(path.join(site, lang, chapter, 'index.html')).href + `?pkg=${pkg}&ground=${ground}&depth=${depth}`;
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      // scroll through once so that lazy stills and demos are in place
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        scrollTo(0, 0);
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
      console.log(`shot: ${name}.png`);
      await ctx.close();
    }
  }
}
await browser.close();
