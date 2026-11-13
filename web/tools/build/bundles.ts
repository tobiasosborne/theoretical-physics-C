// Bundles, built with Vite's JS API, each a single IIFE file (so pages work from file://):
//   assets/site.js + site.css       page runtime
//   assets/demos/<id>.js            one per demo: harness + web/src/demos/<id>.ts
// A bundle is rebuilt only when the content of web/src/, web/vendor/ or the lock file has
// changed since it was built (a stamp file beside it carries the hash), so a restored CI
// cache counts.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import { VENDOR, WEB } from '../paths.ts';

export function demoSource(id: string): string { return path.join(WEB, 'src/demos', `${id}.ts`); }

/** One hash over everything a bundle can depend on: web/src, web/vendor, the lock file. */
function hashDir(dir: string, h: crypto.Hash): void {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((x, y) => (x.name < y.name ? -1 : 1))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) hashDir(p, h);
    else { h.update(e.name); h.update(fs.readFileSync(p)); }
  }
}
let sources = '';
function sourcesHash(): string {
  if (!sources) {
    const h = crypto.createHash('sha256');
    hashDir(path.join(WEB, 'src'), h);
    hashDir(VENDOR, h);
    h.update(fs.readFileSync(path.join(WEB, 'package-lock.json')));
    sources = h.digest('hex');
  }
  return sources;
}
/** A bundle is fresh when it exists and its stamp carries the hash of the current sources. */
function fresh(out: string): boolean {
  const stamp = `${out}.sha256`;
  return fs.existsSync(out) && fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf8') === sourcesHash();
}
function stamp(out: string): void { fs.writeFileSync(`${out}.sha256`, sourcesHash()); }

function common(gen: string) {
  return {
    configFile: false as const,
    root: WEB,
    logLevel: 'warn' as const,
    publicDir: false as const,
    resolve: { alias: { '@gen': gen } },
  };
}

/** Returns true when the bundle was rebuilt. */
export async function buildSiteBundle(gen: string, assetsDir: string): Promise<boolean> {
  if (fresh(path.join(assetsDir, 'site.js')) && fs.existsSync(path.join(assetsDir, 'site.css'))) return false;
  await build({
    ...common(gen),
    build: {
      outDir: assetsDir, emptyOutDir: false, target: 'es2022', minify: true, sourcemap: false,
      lib: { entry: path.join(WEB, 'src/site/main.ts'), formats: ['iife'], name: 'tpcSite', fileName: () => 'site.js', cssFileName: 'site' },
    },
  });
  stamp(path.join(assetsDir, 'site.js'));
  return true;
}

/** Returns true when the bundle was rebuilt. */
export async function buildDemoBundle(gen: string, id: string, outDir: string): Promise<boolean> {
  const src = demoSource(id);
  if (!fs.existsSync(src)) throw new Error(`demo ${id} is not registered: ${path.relative(path.dirname(WEB), src)} does not exist`);
  if (fresh(path.join(outDir, `${id}.js`))) return false;
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
  stamp(path.join(outDir, `${id}.js`));
  return true;
}
