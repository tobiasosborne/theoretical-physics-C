// Build the site:  tsx tools/build/main.ts --chapters c99 [options]
//
//   --chapters c00,c11        chapter IDs (default: every chapter except test chapters)
//   --pkg 1..5                design package of the pages          (default 1)
//   --ground light|dark       ground of the pages                  (default light)
//   --figure-variants LIST    extra figure builds for the run-time design switcher:
//                             "all", or e.g. pkg4-dark,pkg5-light  (default: none; the
//                             switcher then keeps the stills of the build's own variant)
//   --content DIR             content root                         (default content/)
//   --course-build DIR        print build with the .aux files      (default build/course/)
//   --out DIR                 output                               (default build/web/)
//   --parse-only              parse and convert the chapters, write nothing, need no .aux
//
// Output: <out>/ir/<chapter>.<lang>.json, <out>/site/<lang>/<chapter>/index.html,
// <out>/site/assets/, <out>/standalone/<demo>.<lang>.html, <out>/corpus/index.html,
// <out>/site.json (what was built; the gates read it).
import fs from 'node:fs';
import path from 'node:path';
import { NumberingError, loadPrintNumbers } from '../convert/aux.ts';
import { LANGS, defaultPaths, findChapters, loadEnv, type ChapterMeta, type Lang } from '../convert/env.ts';
import { buildFigure } from '../convert/figures.ts';
import type { Block, ChapterIR } from '../convert/ir.ts';
import { MATH_CONVERTER } from '../convert/mathconv.ts';
import { countDepthBlocks, definitionHomes, parseChapter } from '../convert/parse.ts';
import { renderChapter, renderIndex, type FigureFile, type SiteInfo } from '../convert/render.ts';
import { TexError } from '../convert/tex.ts';
import { collectCorpus, corpusPage, summarize } from '../corpus/corpus.ts';
import { WEB, buildDemoBundle, buildSiteBundle, demoSource, writeStandalone } from './bundles.ts';
import { writeGen } from './gen.ts';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const opt = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const known = ['--chapters', '--pkg', '--ground', '--figure-variants', '--content', '--course-build', '--out', '--parse-only'];
for (const a of args) if (a.startsWith('--') && !known.includes(a)) { console.error(`build: unknown option ${a}`); process.exit(2); }

function walkBlocks(bs: Block[], f: (b: Block) => void): void {
  for (const b of bs) {
    f(b);
    if ('children' in b && Array.isArray(b.children) && b.t !== 'para') walkBlocks(b.children as Block[], f);
    if (b.t === 'list') for (const it of b.items) walkBlocks(it.children, f);
  }
}

async function main(): Promise<number> {
  const paths = defaultPaths({ content: opt('--content'), courseBuild: opt('--course-build'), out: opt('--out') });
  const pkg = Number(opt('--pkg') ?? '1');
  const ground = (opt('--ground') ?? 'light') as 'light' | 'dark';
  if (![1, 2, 3, 4, 5].includes(pkg)) throw new Error(`--pkg must be 1..5 (got ${opt('--pkg')})`);
  if (!['light', 'dark'].includes(ground)) throw new Error(`--ground must be light or dark (got ${ground})`);
  const env = loadEnv(paths);
  const want = opt('--chapters');
  let metas = findChapters(paths, want ? want.split(',') : null);
  if (!want) metas = metas.filter((m) => !m.test_fixture);
  if (metas.length === 0) throw new Error('nothing to build (only test chapters exist; use --chapters c99)');
  const siteChapters = new Set(metas.map((m) => m.id));
  const homes = definitionHomes(env, metas);

  if (flag('--parse-only')) {
    for (const meta of metas) for (const lang of LANGS) {
      const ir = parseChapter(env, meta, lang, { numbers: null, siteChapters, definitionHome: homes });
      console.log(`parse: ok ${meta.dir}/${lang}.tex: ${ir.ids.length} IDs, ${ir.counts.formulas} formulas, ${ir.counts.vertiefung} Vertiefung, ${ir.counts.fundament} Fundament`);
    }
    return 0;
  }

  // 1. numbers of the print full edition (fails on a missing or stale build)
  const numbers = { de: loadPrintNumbers(paths, 'de', metas), en: loadPrintNumbers(paths, 'en', metas) };

  // 2. chapters -> IR
  const irs: ChapterIR[] = [];
  for (const meta of metas) for (const lang of LANGS) {
    irs.push(parseChapter(env, meta, lang, { numbers: numbers[lang], siteChapters, definitionHome: homes }));
  }
  const irDir = path.join(paths.out, 'ir');
  fs.mkdirSync(irDir, { recursive: true });
  for (const ir of irs) fs.writeFileSync(path.join(irDir, `${ir.id}.${ir.lang}.json`), JSON.stringify(ir, null, 1));

  // 3. demos declared by the chapters must be registered (web/src/demos/<id>.ts)
  const demoIds = [...new Set(metas.flatMap((m) => m.assets.filter((a) => a.kind === 'demo' || a.kind === 'game').map((a) => a.id)))];
  for (const id of demoIds) {
    if (!fs.existsSync(demoSource(id))) throw new Error(`demo ${id} is declared in chapter.json but not registered: web/src/demos/${id}.ts does not exist`);
  }

  // 4. bundles and static assets
  const site = path.join(paths.out, 'site');
  const assets = path.join(site, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  const gen = writeGen(paths, pkg, ground);
  await buildSiteBundle(gen, assets);
  const bundles = new Map<string, string>();
  for (const id of demoIds) bundles.set(id, await buildDemoBundle(gen, id, path.join(assets, 'demos')));
  fs.mkdirSync(path.join(assets, 'tokens'), { recursive: true });
  const packages: SiteInfo['packages'] = [];
  for (const p of [1, 2, 3, 4, 5]) {
    for (const g of ['light', 'dark']) {
      fs.copyFileSync(path.join(paths.design, `pkg${p}-${g}`, 'tokens.css'), path.join(assets, 'tokens', `pkg${p}-${g}.css`));
    }
    const tj = JSON.parse(fs.readFileSync(path.join(paths.design, `pkg${p}-light`, 'tokens.json'), 'utf8')) as { meta: { title: string; production_ready: boolean } };
    packages.push({ pkg: p, title: tj.meta.title, productionReady: tj.meta.production_ready });
  }
  fs.cpSync(path.join(WEB, 'assets/fonts'), path.join(assets, 'fonts'), { recursive: true });

  // 5. figures: TeX -> PDF -> SVG, for the build variant and the extra ones
  const own = `pkg${pkg}-${ground}`;
  const fv = opt('--figure-variants');
  const all = [1, 2, 3, 4, 5].flatMap((p) => ['light', 'dark'].map((g) => `pkg${p}-${g}`));
  const variants = [...new Set([own, ...(fv === 'all' ? all : fv ? fv.split(',') : [])])];
  for (const v of variants) if (!all.includes(v)) throw new Error(`--figure-variants: '${v}' is not pkgN-light|dark`);
  const tokens = JSON.parse(fs.readFileSync(path.join(paths.design, own, 'tokens.json'), 'utf8')) as { type: { body: { size_pt: number; web_rem: number } } };
  // a still is shown so that its body type has the size of the page's body type:
  // CSS px per TeX pt = (web body size in px) / (print body size in pt)
  const pxPerPt = (tokens.type.body.web_rem * 16) / tokens.type.body.size_pt;
  const figureMaps: Record<Lang, Map<string, FigureFile>> = { de: new Map(), en: new Map() };
  let nfig = 0;
  for (const ir of irs) {
    walkBlocks(ir.children, (b) => {
      if (b.t !== 'figure') return;
      const texAbs = path.join(paths.root, b.file);
      for (const v of variants) {
        const [, p, g] = /^pkg(\d)-(light|dark)$/.exec(v)!;
        const built = buildFigure(paths, fs.existsSync(texAbs) ? texAbs : b.file, b.id, ir.lang, Number(p), g, path.join(assets, 'figures', v));
        nfig++;
        if (v === own) {
          figureMaps[ir.lang].set(b.id, {
            src: `${own}/${b.id}.${ir.lang}.svg`, variants,
            width: Math.round(built.widthPt * pxPerPt), height: Math.round(built.heightPt * pxPerPt),
          });
        }
      }
    });
  }

  // 6. pages
  const chapters = metas.map((m) => ({ id: m.id, number: irs.find((i) => i.id === m.id && i.lang === 'de')!.number, title: m.title }));
  for (const lang of LANGS) {
    const info: SiteInfo = { pkg, ground, chapters, figures: figureMaps[lang], demoBundles: new Set(demoIds), packages };
    for (const ir of irs.filter((i) => i.lang === lang)) {
      const dir = path.join(site, lang, ir.id);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), renderChapter(ir, info, homes, env.contract.theorem_like));
    }
    fs.writeFileSync(path.join(site, lang, 'index.html'), renderIndex(lang, info));
  }
  fs.writeFileSync(path.join(site, 'index.html'),
    `<!doctype html>\n<html lang="de"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=de/index.html"><title>Theoretische Physik C</title></head>`
    + `<body><p><a href="de/index.html">Deutsch</a> · <a href="en/index.html" lang="en">English</a></p></body></html>\n`);

  // 7. standalone demo pages: one file each, everything inlined
  const standalone: Array<{ id: string; lang: Lang; file: string; bytes: number; fonts: string[] }> = [];
  for (const ir of irs) for (const d of ir.demos) {
    const file = path.join(paths.out, 'standalone', `${d.id}.${ir.lang}.html`);
    const r = writeStandalone(paths, { id: d.id, lang: ir.lang, title: d.title, chapter: ir.id, chapterTitle: ir.titlePlain, bundle: bundles.get(d.id)!, pkg }, file);
    // the copy inside the site is what the chapter page links to
    fs.mkdirSync(path.join(site, 'standalone'), { recursive: true });
    fs.copyFileSync(file, path.join(site, 'standalone', path.basename(file)));
    standalone.push({ id: d.id, lang: ir.lang, file: path.relative(paths.out, file), ...r });
  }

  // 8. corpus page for the browser half of the mathematics gate
  const corpus = collectCorpus(env, metas);
  const corpusDir = path.join(paths.out, 'corpus');
  fs.mkdirSync(corpusDir, { recursive: true });
  fs.writeFileSync(path.join(corpusDir, 'index.html'), corpusPage(corpus, '../site/assets', pkg, ground));
  fs.writeFileSync(path.join(corpusDir, 'corpus.json'), JSON.stringify({ converter: MATH_CONVERTER, entries: corpus }, null, 1));

  // 9. record
  const record = {
    built: new Date().toISOString(), pkg, ground, converter: MATH_CONVERTER, figureVariants: variants,
    content: path.relative(paths.root, paths.content),
    chapters: metas.map((m: ChapterMeta) => ({
      id: m.id, dir: m.dir,
      source: Object.fromEntries(LANGS.map((l) => [l, countDepthBlocks(path.join(m.absDir, `${l}.tex`))])),
      demos: m.assets.filter((a) => a.kind === 'demo' || a.kind === 'game').map((a) => a.id),
      externalRefs: irs.find((i) => i.id === m.id && i.lang === 'de')!.externalRefs,
    })),
    standalone,
    corpus: { formulas: corpus.length, failed: corpus.filter((c) => c.problems.length).length },
  };
  fs.writeFileSync(path.join(paths.out, 'site.json'), JSON.stringify(record, null, 1));

  for (const ir of irs) {
    console.log(`build: ok ${ir.id}.${ir.lang}: ${ir.ids.length} IDs, ${ir.counts.formulas} formulas, ${ir.counts.vertiefung}+${ir.counts.fundament} depth blocks, ${ir.counts.figures} figures, ${ir.counts.demos} demos`
      + (ir.externalRefs.length ? `, external references: ${ir.externalRefs.join(', ')}` : ''));
  }
  console.log(`build: ok ${nfig} figure SVGs (${variants.join(', ')}); ${demoIds.length} demo bundles; ${standalone.length} standalone pages; corpus ${summarize(corpus)}`);
  console.log(`build: ok site in ${path.relative(paths.root, site)} (pkg ${pkg}, ${ground}; mathematics: ${MATH_CONVERTER})`);
  return 0;
}

main().then((c) => process.exit(c), (e) => {
  if (e instanceof TexError) console.error(`build: FAIL ${e.message}`);
  else if (e instanceof NumberingError) console.error(`build: FAIL ${e.message}`);
  else console.error(`build: FAIL ${(e as Error).stack ?? e}`);
  process.exit(1);
});
