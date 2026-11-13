// Static gates on built pages (no browser):
//   tsx tools/checks/static.ts --site build/web/site [--standalone DIR] [--content DIR] [--chapters c99] [--only ids,links,external,demos]
//
//   ids       German and English page of a chapter have the same IDs in the same order
//   links     every internal link and every local resource of every page resolves
//   external  resources are local; script src must name a local file, with no URL scheme
//             Static scanning does not establish runtime network independence.
//   demos     every demo or game declared in a chapter.json is registered (web/src/demos/<id>.ts)
import fs from 'node:fs';
import path from 'node:path';
import { REPO_ROOT, defaultPaths, findChapters } from '../convert/env.ts';
import { scanHtml, type Scan } from '../convert/htmlscan.ts';
import { demoSource } from '../build/bundles.ts';

const args = process.argv.slice(2);
const opt = (n: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const site = path.resolve(opt('--site') ?? path.join(REPO_ROOT, 'build/web/site'));
const standalone = opt('--standalone') ? path.resolve(opt('--standalone')!) : null;
const only = (opt('--only') ?? 'ids,links,external,demos').split(',');
const chaptersArg = opt('--chapters');
let failures = 0;
const fail = (gate: string, msg: string) => { failures++; console.log(`${gate}: FAIL ${msg}`); };
const rel = (f: string) => path.relative(REPO_ROOT, f);

const cache = new Map<string, Scan>();
const scan = (file: string): Scan => {
  let s = cache.get(file);
  if (!s) { s = scanHtml(fs.readFileSync(file, 'utf8')); cache.set(file, s); }
  return s;
};
const idsOf = (file: string) => scan(file).tags.map((t) => t.attrs.id).filter((x): x is string => typeof x === 'string' && x !== '');

function htmlFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...htmlFiles(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out.sort();
}

const chapterIds = (): string[] => {
  if (chaptersArg) return chaptersArg.split(',');
  const de = path.join(site, 'de');
  return fs.existsSync(de) ? fs.readdirSync(de).filter((d) => /^c[0-9]{2}$/.test(d)).sort() : [];
};

// ── ids ───────────────────────────────────────────────────────
if (only.includes('ids')) {
  let n = 0;
  for (const ch of chapterIds()) {
    const files = ['de', 'en'].map((l) => path.join(site, l, ch, 'index.html'));
    const missing = files.filter((f) => !fs.existsSync(f));
    if (missing.length) { fail('ids', `${missing.map(rel).join(', ')}: page missing`); continue; }
    // IDs of the page chrome start with tpc-; everything else is content
    const [de, en] = files.map((f) => idsOf(f).filter((id) => !id.startsWith('tpc-')));
    n += de.length;
    const dupe = de.find((id, i) => de.indexOf(id) !== i);
    if (dupe) fail('ids', `${rel(files[0])}: ID '${dupe}' occurs twice`);
    const len = Math.max(de.length, en.length);
    for (let i = 0; i < len; i++) {
      if (de[i] !== en[i]) {
        fail('ids', `${ch}: German and English pages differ at position ${i + 1}: de has '${de[i] ?? '(nothing)'}', en has '${en[i] ?? '(nothing)'}' (same IDs in the same order are required)`);
        break;
      }
    }
  }
  if (!failures) console.log(`ids: ok: ${chapterIds().length} chapter(s), ${n} IDs, German and English in the same order`);
}

// ── links ─────────────────────────────────────────────────────
const isRemote = (u: string) => /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(u);
const hasScheme = (u: string) => /^[a-z][a-z0-9+.-]*:/i.test(u);

if (only.includes('links')) {
  const before = failures;
  let nlinks = 0;
  const pages = [...htmlFiles(site), ...(standalone ? htmlFiles(standalone) : [])];
  for (const file of pages) {
    const s = scan(file);
    const ids = new Set(idsOf(file));
    for (const t of s.tags) {
      const refs: Array<[string, string]> = [];
      if (t.name === 'a' && t.attrs.href !== undefined) refs.push(['href', t.attrs.href]);
      if ((t.name === 'img' || t.name === 'script' || t.name === 'source' || t.name === 'iframe') && t.attrs.src !== undefined) refs.push(['src', t.attrs.src]);
      if (t.name === 'link' && t.attrs.href !== undefined) refs.push(['href', t.attrs.href]);
      for (const [attr, raw] of refs) {
        nlinks++;
        if (isRemote(raw) || (hasScheme(raw) && !raw.startsWith('file:'))) continue;   // other hosts: gate "external"
        const [p, frag] = raw.split('#');
        const where = `${rel(file)}:${t.line}`;
        if (p === '' || p === undefined) {
          if (frag !== undefined && frag !== '' && !ids.has(decodeURIComponent(frag))) fail('links', `${where}: broken internal link ${attr}="${raw}": no element with id '${decodeURIComponent(frag)}' on the page`);
          continue;
        }
        const target = path.resolve(path.dirname(file), decodeURIComponent(p.split('?')[0]));
        if (!fs.existsSync(target)) { fail('links', `${where}: broken link ${attr}="${raw}": ${rel(target)} does not exist`); continue; }
        if (frag && target.endsWith('.html') && !new Set(idsOf(target)).has(decodeURIComponent(frag))) {
          fail('links', `${where}: broken link ${attr}="${raw}": no element with id '${decodeURIComponent(frag)}' in ${rel(target)}`);
        }
      }
    }
  }
  if (failures === before) console.log(`links: ok: ${pages.length} page(s), ${nlinks} links and resources resolve`);
}

// ── external resources ────────────────────────────────────────
function cssUrls(css: string): string[] {
  // Decode CSS escapes before case-insensitive scanning (including escaped url/schemes).
  const decoded = css.replace(/\\([0-9a-f]{1,6})(?:\r\n|[\t\n\r\f ])?|\\([^\n\r\f])/gi,
    (_, hex: string | undefined, char: string | undefined) => hex ? String.fromCodePoint(Math.min(parseInt(hex, 16), 0x10ffff) || 0xfffd) : char!);
  const clean = decoded.replace(/\/\*[\s\S]*?\*\//g, '');
  const out: string[] = [];
  const rx = /url\s*\(\s*(?:(["'])([\s\S]*?)\1|([^)]*))\s*\)|@import\s*(["'])([\s\S]*?)\4/gi;
  for (const m of clean.matchAll(rx)) out.push((m[2] ?? m[3] ?? m[5]).trim());
  return out;
}

if (only.includes('external')) {
  const before = failures;
  const pages = [...htmlFiles(site), ...(standalone ? htmlFiles(standalone) : [])];
  const cssSeen = new Set<string>();
  for (const file of pages) {
    const s = scan(file);
    for (const t of s.tags) {
      const where = `${rel(file)}:${t.line}`;
      const u = t.name === 'link' ? t.attrs.href : ['script', 'img', 'source', 'video', 'audio', 'iframe', 'embed', 'track'].includes(t.name) ? t.attrs.src : t.name === 'object' ? t.attrs.data : undefined;
      if (u !== undefined && t.name === 'script' && (isRemote(u.trim()) || hasScheme(u.trim()))) {
        fail('external', `${where}: non-local script source: ${u} (script src must name a bundled local file)`);
      } else if (u !== undefined && isRemote(u.trim())) {
        const what = t.name === 'script' ? 'script' : t.name === 'link' ? `link rel="${t.attrs.rel ?? ''}"` : t.name;
        fail('external', `${where}: external resource: <${what}> loads ${u} (everything is bundled locally: no CDN, no remote fonts)`);
      }
      if (t.attrs.style !== undefined) for (const cu of cssUrls(t.attrs.style)) {
        if (isRemote(cu)) fail('external', `${where}: external resource in style attribute: ${cu}`);
      }
      if (t.name === 'link' && (t.attrs.rel ?? '').includes('stylesheet') && u !== undefined && !isRemote(u) && !hasScheme(u)) {
        const cssFile = path.resolve(path.dirname(file), u.split('#')[0].split('?')[0]);
        if (fs.existsSync(cssFile) && !cssSeen.has(cssFile)) {
          cssSeen.add(cssFile);
          for (const cu of cssUrls(fs.readFileSync(cssFile, 'utf8'))) {
            if (isRemote(cu)) fail('external', `${rel(cssFile)}: external resource in stylesheet: ${cu}`);
            else if (!cu.startsWith('data:') && !cu.startsWith('#') && !fs.existsSync(path.resolve(path.dirname(cssFile), cu.split('#')[0].split('?')[0]))) {
              fail('external', `${rel(cssFile)}: stylesheet refers to ${cu}, which does not exist`);
            }
          }
        }
      }
    }
    for (const css of s.styles) for (const cu of cssUrls(css)) {
      if (isRemote(cu)) fail('external', `${rel(file)}: external resource in <style>: ${cu}`);
    }
  }
  if (failures === before) console.log(`external: ok: ${pages.length} page(s) and ${cssSeen.size} stylesheet(s) load nothing from another host`);
}

// ── demos ─────────────────────────────────────────────────────
if (only.includes('demos')) {
  const before = failures;
  try {
    const paths = defaultPaths({ content: opt('--content') });
    const metas = findChapters(paths, chaptersArg ? chaptersArg.split(',') : null);
    // registration is checked for every chapter, bundles only for the chapters the site
    // contains: without --chapters the build leaves out test chapters (tools/build/main.ts)
    const built = new Set(chapterIds());
    let n = 0;
    for (const m of metas) {
      for (const a of m.assets) {
        if (a.kind !== 'demo' && a.kind !== 'game') continue;
        n++;
        const src = demoSource(a.id);
        if (!fs.existsSync(src)) { fail('demos', `${m.dir}/chapter.json declares ${a.kind} ${a.id}, which is not registered: ${rel(src)} does not exist`); continue; }
        const text = fs.readFileSync(src, 'utf8');
        if (!text.includes('export function mount(') && !text.includes('export const mount')) fail('demos', `${rel(src)} does not export mount(stage, ctx)`);
        if (!opt('--content') && built.has(m.id)) {
          const bundle = path.join(site, 'assets/demos', `${a.id}.js`);
          if (!fs.existsSync(bundle)) fail('demos', `${a.id}: bundle ${rel(bundle)} was not built`);
        }
      }
    }
    if (failures === before) console.log(`demos: ok: ${n} declared demo(s) in ${metas.length} chapter(s), all registered`);
  } catch (e) {
    fail('demos', (e as Error).message);
  }
}

process.exit(failures ? 1 : 0);
