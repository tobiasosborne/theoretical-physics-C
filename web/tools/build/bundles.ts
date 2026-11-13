// Bundles, built with Vite's JS API, each a single IIFE file (so pages work from file://):
//   assets/site.js + site.css       page runtime
//   assets/demos/<id>.js            one per demo: harness + web/src/demos/<id>.ts
// A bundle is rebuilt only when a file under web/src/ or web/vendor/ is newer than it.
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import { VENDOR, WEB } from '../paths.ts';

export function demoSource(id: string): string { return path.join(WEB, 'src/demos', `${id}.ts`); }

function newestMtime(dir: string): number {
  let t = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    t = Math.max(t, e.isDirectory() ? newestMtime(p) : fs.statSync(p).mtimeMs);
  }
  return t;
}
let sourcesMtime = 0;
function fresh(out: string): boolean {
  if (!sourcesMtime) {
    sourcesMtime = Math.max(newestMtime(path.join(WEB, 'src')), newestMtime(VENDOR),
      fs.statSync(path.join(WEB, 'package-lock.json')).mtimeMs);
  }
  return fs.existsSync(out) && fs.statSync(out).mtimeMs > sourcesMtime;
}

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
  if (fresh(path.join(assetsDir, 'site.js')) && fresh(path.join(assetsDir, 'site.css'))) return false;
  await build({
    ...common(gen),
    build: {
      outDir: assetsDir, emptyOutDir: false, target: 'es2022', minify: true, sourcemap: false,
      lib: { entry: path.join(WEB, 'src/site/main.ts'), formats: ['iife'], name: 'tpcSite', fileName: () => 'site.js', cssFileName: 'site' },
    },
  });
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
  return true;
}
