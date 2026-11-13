// Standalone pages of the three hydrogen views WITHOUT the chapter build, for development,
// screenshots and the video:
//
//   web/node_modules/.bin/tsx web/video/c11-standalone.ts [--pkg 1] [--out build/web/c11-dev/standalone]
//        [--params '{"tour":"c11-hydrogen"}'] [--only c11.demo.cloud]
//
// Uses the build's own functions (web/tools/build: writeGen, buildDemoBundle, writeStandalone),
// so the pages are what `bash web/run.sh build --chapters c11` writes to build/web/standalone/,
// for the package given. --params adds data-params to the mount element: the harness reads
// it (web/src/demo/harness.ts), and the capture tool has no option to pass parameters.
import fs from 'node:fs';
import path from 'node:path';
import { buildDemoBundle, writeStandalone } from '../tools/build/bundles.ts';
import { writeGen } from '../tools/build/gen.ts';
import { REPO_ROOT, defaultPaths } from '../tools/convert/env.ts';

const args = process.argv.slice(2);
const opt = (n: string, d: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const pkg = Number(opt('--pkg', '1'));
const out = path.resolve(opt('--out', path.join(REPO_ROOT, 'build/web/c11-dev/standalone')));
const params = opt('--params', '');
const only = opt('--only', '');

const TITLES: Record<string, { de: string; en: string }> = {
  'c11.demo.cloud': { de: 'Die Wolke der Relativkoordinate', en: 'The cloud of the relative coordinate' },
  'c11.demo.radial': { de: 'Radiale Aufenthaltsdichte und Knoten', en: 'Radial probability density and nodes' },
  'c11.demo.phase': { de: 'Phasenschnitt durch die Zustände mit n ≤ 2', en: 'Phase slice through the states with n ≤ 2' },
};
// titles of the chapter, if it declares the demos
const chapterJson = path.join(REPO_ROOT, 'content/c11-wasserstoff/chapter.json');
let chapterTitle = { de: 'Das Wasserstoffatom', en: 'The hydrogen atom' };
if (fs.existsSync(chapterJson)) {
  const ch = JSON.parse(fs.readFileSync(chapterJson, 'utf8')) as { title: { de: string; en: string }; assets: Array<{ id: string; title?: { de: string; en: string } }> };
  chapterTitle = ch.title;
  for (const a of ch.assets) if (a.title && TITLES[a.id]) TITLES[a.id] = a.title;
}

const paths = defaultPaths();
const gen = writeGen(paths, pkg, 'light');
const bundles = path.join(out, '..', 'bundles');
fs.mkdirSync(bundles, { recursive: true });
for (const id of Object.keys(TITLES)) {
  if (only && id !== only) continue;
  const bundle = await buildDemoBundle(gen, id, bundles);
  for (const lang of ['de', 'en'] as const) {
    const file = path.join(out, `${id}.${lang}.html`);
    const r = writeStandalone(paths, { id, lang, title: TITLES[id][lang], chapter: 'c11', chapterTitle: chapterTitle[lang], bundle, pkg }, file);
    if (params) {
      JSON.parse(params);
      const html = fs.readFileSync(file, 'utf8');
      const marker = `<div id="tpc-standalone" class="tpc-demo" data-demo="${id}">`;
      if (!html.includes(marker)) throw new Error(`c11-standalone: mount element not found in ${file}`);
      fs.writeFileSync(file, html.replace(marker, marker.replace('>', ` data-params='${params.replace(/'/g, '&#39;')}'>`)));
    }
    console.log(`c11-standalone: ${path.relative(REPO_ROOT, file)} (pkg ${pkg}, ${r.bytes} bytes)`);
  }
}
