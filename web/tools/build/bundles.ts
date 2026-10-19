// Bundles, built with Vite's JS API, each a single IIFE file (so pages work from file://):
//   assets/site.js + site.css       page runtime
//   assets/demos/<id>.js            one per demo: harness + web/src/demos/<id>.ts
// and the standalone single-file page of each demo and language.
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import type { Lang, Paths } from '../convert/env.ts';

export const WEB = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');

export function demoSource(id: string): string { return path.join(WEB, 'src/demos', `${id}.ts`); }

function common(gen: string) {
  return {
    configFile: false as const,
    root: WEB,
    logLevel: 'warn' as const,
    publicDir: false as const,
    resolve: { alias: { '@gen': gen } },
  };
}

export async function buildSiteBundle(gen: string, assetsDir: string): Promise<void> {
  await build({
    ...common(gen),
    build: {
      outDir: assetsDir, emptyOutDir: false, target: 'es2022', minify: true, sourcemap: false,
      lib: { entry: path.join(WEB, 'src/site/main.ts'), formats: ['iife'], name: 'tpcSite', fileName: () => 'site.js', cssFileName: 'site' },
    },
  });
}

export async function buildDemoBundle(gen: string, id: string, outDir: string): Promise<string> {
  const src = demoSource(id);
  if (!fs.existsSync(src)) throw new Error(`demo ${id} is not registered: ${path.relative(path.dirname(WEB), src)} does not exist`);
  const entries = path.join(gen, 'entries');
  fs.mkdirSync(entries, { recursive: true });
  const entry = path.join(entries, `${id}.ts`);
  fs.writeFileSync(entry,
    `// GENERATED entry of the demo bundle ${id}\n`
    + `import * as mod from ${JSON.stringify(src)};\n`
    + `import { registerDemo } from ${JSON.stringify(path.join(WEB, 'src/demo/harness.ts'))};\n`
    + `registerDemo(${JSON.stringify(id)}, mod);\n`);
  await build({
    ...common(gen),
    build: {
      outDir, emptyOutDir: false, target: 'es2022', minify: true, sourcemap: false,
      lib: { entry, formats: ['iife'], name: 'tpcDemo_' + id.replace(/\W/g, '_'), fileName: () => `${id}.js` },
    },
  });
  return path.join(outDir, `${id}.js`);
}

interface FontManifest { families: Record<string, { family: string; faces: Array<{ file: string; weight: number; style: string }> }> }

/** @font-face rules with the font files inlined, for the families and weights given. */
function inlineFonts(want: Array<{ family: string; weights: number[] }>): { css: string; used: string[] } {
  const dir = path.join(WEB, 'assets/fonts');
  const mf = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8')) as FontManifest;
  let css = '';
  const used: string[] = [];
  for (const w of want) {
    const fam = Object.values(mf.families).find((f) => f.family === w.family);
    if (!fam) continue;   // a family that is not bundled (no licence file): the stack falls through
    for (const face of fam.faces) {
      if (face.style !== 'normal' || !w.weights.includes(face.weight)) continue;
      const b64 = fs.readFileSync(path.join(dir, face.file)).toString('base64');
      css += `@font-face{font-family:"${fam.family}";font-weight:${face.weight};font-style:normal;src:url(data:font/woff2;base64,${b64}) format("woff2");}\n`;
      used.push(face.file);
    }
  }
  return { css, used };
}

export interface StandaloneSpec { id: string; lang: Lang; title: string; chapter: string; chapterTitle: string; bundle: string; pkg: number }

export function writeStandalone(paths: Paths, spec: StandaloneSpec, outFile: string): { bytes: number; fonts: string[] } {
  const tok = (g: string) => fs.readFileSync(path.join(paths.design, `pkg${spec.pkg}-${g}`, 'tokens.css'), 'utf8');
  const tokens = JSON.parse(fs.readFileSync(path.join(paths.design, `pkg${spec.pkg}-light`, 'tokens.json'), 'utf8')) as { font: Record<string, { css: string[] }> };
  const fonts = inlineFonts([
    { family: tokens.font.sans.css[0], weights: [400, 600] },
    { family: tokens.font.math.css[0], weights: [400] },
  ]);
  const js = fs.readFileSync(spec.bundle, 'utf8').replace(/<\/script/gi, '<\\/script');
  const css = fs.readFileSync(path.join(WEB, 'src/demo/standalone.css'), 'utf8');
  const note = spec.lang === 'de'
    ? `Theoretische Physik C · Kapitel ${spec.chapter.slice(1)}: ${spec.chapterTitle}. Einzeldatei, läuft ohne Netz.`
    : `Theoretical Physics C · Chapter ${spec.chapter.slice(1)}: ${spec.chapterTitle}. Single file, runs without a network.`;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const html = `<!doctype html>
<html lang="${spec.lang}" data-tpc-pkg="${spec.pkg}" data-tpc-ground="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(spec.title)}</title>
<style>${fonts.css}</style>
<style>${tok('light')}</style>
<style>${tok('dark')}</style>
<style>${css}</style>
</head>
<body>
<main><h1>${esc(spec.title)}</h1><div id="tpc-standalone" class="tpc-demo" data-demo="${esc(spec.id)}"></div><p class="tpc-standalone-note">${esc(note)}</p></main>
<script>(function(){var q=new URLSearchParams(location.search);var g=q.get("ground");if(g==="dark"||g==="light")document.documentElement.dataset.tpcGround=g;if(q.has("stage"))document.documentElement.classList.add("tpc-capture");})();</script>
<script>${js}</script>
<script>(function(){var h=document.getElementById("tpc-standalone");try{window.__tpcDemos[${JSON.stringify(spec.id)}].mountInto(h,{lang:${JSON.stringify(spec.lang)},standalone:true,title:${JSON.stringify(spec.title)}});h.dataset.state="mounted";}catch(e){h.dataset.state="failed";h.dataset.error=String(e&&e.message||e);h.textContent=String(e&&e.message||e);}})();</script>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html);
  return { bytes: Buffer.byteLength(html), fonts: fonts.used };
}
