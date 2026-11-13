// Build the lecture site:  tsx web/tools/lecture/build.ts [--out build/site] [--no-figures]
//                                                       [--lectures 7,8]
// (--lectures builds only those pages, for work on a single lecture; references into
// other lectures then show as (?).)
//
// One page per lecture and language, straight from the lecture files of the script:
//   <out>/<lang>/vlNN/index.html   the lecture
//   <out>/<lang>/index.html        the list of lectures
//   <out>/assets/                  site.js, site.css, tokens, fonts, figures, stills, demos
//   <out>/site.json                what was built
//
// It needs no LaTeX run of the script: equation, section and example numbers are counted
// by the parser. The figures come from scripts/build_figures.py --svg (cached).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { buildDemoBundle, buildSiteBundle } from '../build/bundles.ts';
import { writeGen } from '../build/gen.ts';
import { LANGS, LATEX, ROOT, VENDOR, WEB, type Lang } from '../paths.ts';
import { esc, parseLecture, resolveRefs, stripComments, styleMacros, type LabelInfo, type LectureCtx, type TocEntry } from './parse.ts';

const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const OUT = path.resolve(opt('--out') ?? path.join(ROOT, 'build/site'));
const N = 22;
const ONLY = opt('--lectures')?.split(',').map(Number) ?? null;
const wanted = (n: number) => !ONLY || ONLY.includes(n);
const slug = (n: number) => `vl${String(n).padStart(2, '0')}`;
const lectureFile = (lang: Lang, n: number) =>
  path.join(LATEX, 'lectures', lang, `${lang === 'de' ? 'vl' : 'lec'}${String(n).padStart(2, '0')}.tex`);

const W: Record<string, Record<Lang, string>> = {
  course: { de: 'Theoretische Physik C', en: 'Theoretical Physics C' },
  lecture: { de: 'Vorlesung', en: 'Lecture' },
  lectures: { de: 'Vorlesungen', en: 'Lectures' },
  contents: { de: 'Inhalt', en: 'Contents' },
  prev: { de: 'Zurück', en: 'Previous' },
  next: { de: 'Weiter', en: 'Next' },
  all: { de: 'Alle Vorlesungen', en: 'All lectures' },
  pdf: { de: 'Skript als PDF', en: 'Notes as PDF' },
  videos: { de: 'Vorlesungsvideos', en: 'Lecture videos (in German)' },
  interactive: { de: 'interaktiv', en: 'interactive' },
  language: { de: 'Sprache', en: 'Language' },
  intro: {
    de: 'Das Skript zur Vorlesung, eine Seite pro Vorlesung, mit interaktiven Abbildungen.',
    en: 'The lecture notes, one page per lecture, with interactive figures.',
  },
};
const PDF: Record<Lang, string> = { de: 'TheoretischePhysikC.pdf', en: 'TheoreticalPhysicsC.pdf' };
const PLAYLIST = 'https://youtube.com/playlist?list=PLDfPUNusx1Epw58nW3Acp7VI-PqXCkQXf';
// the chapter pages of the earlier web course, redirected to the lecture that covers them
const OLD_CHAPTERS: Record<string, number> = { c00: 1, c01: 1, c02: 6, c03: 2, c04: 6, c11: 16 };

function svgSize(file: string, pxPerPt: number): { width: number; height: number } {
  const head = fs.readFileSync(file, 'utf8').slice(0, 600);
  const w = /\bwidth="([0-9.]+)(pt)?"/.exec(head), h = /\bheight="([0-9.]+)(pt)?"/.exec(head);
  if (!w || !h) throw new Error(`${file}: no width and height on the <svg> element`);
  return { width: Math.round(Number(w[1]) * pxPerPt), height: Math.round(Number(h[1]) * pxPerPt) };
}

/** What scripts/build_figures.py --svg wrote for a figure: the image file and its size. */
function figureMeta(lang: Lang, name: string, pxPerPt: number): { file: string; width: number; height: number } {
  const f = path.join(ROOT, 'build/figures', `open-${lang}`, 'figures', `${name}.json`);
  if (!fs.existsSync(f)) throw new Error(`figure ${name} [${lang}] has not been built (scripts/build_figures.py --svg)`);
  const m = JSON.parse(fs.readFileSync(f, 'utf8')) as { file: string; width: number; height: number };
  return { file: m.file, width: Math.round(m.width * pxPerPt), height: Math.round(m.height * pxPerPt) };
}

function copyIfNewer(from: string, to: string): void {
  if (fs.existsSync(to) && fs.statSync(to).mtimeMs >= fs.statSync(from).mtimeMs) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

interface Lecture { n: number; lang: Lang; title: string; html: string; toc: TocEntry[]; demos: string[]; figures: string[]; file: string }

function head(lang: Lang, title: string, assets: string): string {
  return `<!doctype html>
<html lang="${lang}" data-tpc-pkg="1" data-tpc-ground="light" data-tpc-assets="${assets}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="${assets}/fonts/fonts.css">
<link rel="stylesheet" id="tpc-tokens" href="${assets}/tokens/pkg1-light.css">
<link rel="stylesheet" href="${assets}/site.css">
<script defer src="${assets}/site.js"></script>
</head>`;
}

function topbar(lang: Lang, home: string, otherHref: string, pdfHref: string): string {
  const other: Lang = lang === 'de' ? 'en' : 'de';
  const langs = `<span class="tpc-langs" role="group" aria-label="${W.language[lang]}">`
    + (['de', 'en'] as Lang[]).map((l) => (l === lang
      ? `<span aria-current="true" lang="${l}">${l.toUpperCase()}</span>`
      : `<a class="tpc-langlink" href="${otherHref}" hreflang="${other}" lang="${other}">${l.toUpperCase()}</a>`)).join('')
    + '</span>';
  return `<header class="tpc-topbar"><a class="tpc-home" href="${home}">${W.course[lang]}</a>`
    + `<div class="tpc-controls"><a class="tpc-pdflink" href="${pdfHref}">PDF</a>${langs}</div></header>`;
}

function lecturePage(l: Lecture, titles: Map<number, string>): string {
  const lang = l.lang;
  const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');
  const nav = (cls: string) => {
    const prev = titles.has(l.n - 1) ? `<a class="tpc-prev" rel="prev" href="../${slug(l.n - 1)}/index.html"><span class="tpc-navdir">← ${W.prev[lang]}</span><span class="tpc-navtitle">${l.n - 1}. ${titles.get(l.n - 1)}</span></a>` : '<span></span>';
    const next = titles.has(l.n + 1) ? `<a class="tpc-next" rel="next" href="../${slug(l.n + 1)}/index.html"><span class="tpc-navdir">${W.next[lang]} →</span><span class="tpc-navtitle">${l.n + 1}. ${titles.get(l.n + 1)}</span></a>` : '<span></span>';
    return `<nav class="tpc-lecnav ${cls}" aria-label="${W.lectures[lang]}">${prev}<a class="tpc-up" href="../index.html">${W.all[lang]}</a>${next}</nav>`;
  };
  const tocItems = l.toc.filter((t) => t.level === 2);
  const toc = tocItems.length >= 2
    ? `<nav class="tpc-toc" aria-label="${W.contents[lang]}"><ol>${tocItems.map((t) => `<li><a href="#${t.id}">${t.number ? `<span class="tpc-secno">${t.number}</span>` : ''}${t.html}</a></li>`).join('')}</ol></nav>`
    : '';
  const other: Lang = lang === 'de' ? 'en' : 'de';
  return `${head(lang, `${l.n}. ${esc(stripTags(l.title))} · ${W.course[lang]}`, '../../assets')}
<body>
${topbar(lang, '../index.html', `../../${other}/${slug(l.n)}/index.html`, `../../../pdf/${PDF[lang]}`)}
<main class="tpc-page">
<article class="tpc-chapter tpc-lecture">
<header class="tpc-chapter-head"><p class="tpc-kicker">${W.lecture[lang]} ${l.n}</p><h1>${l.title}</h1></header>
${toc}
${l.html}
</article>
${nav('tpc-lecnav-foot')}
</main>
<footer class="tpc-foot">${W.course[lang]} · ${W.lecture[lang]} ${l.n} · <a href="../../../pdf/${PDF[lang]}">${W.pdf[lang]}</a></footer>
</body>
</html>
`;
}

function indexPage(lang: Lang, lectures: Lecture[]): string {
  const other: Lang = lang === 'de' ? 'en' : 'de';
  const items = lectures.map((l) => {
    const demos = l.demos.length ? `<span class="tpc-index-demos">${l.demos.length} ${W.interactive[lang]}</span>` : '';
    return `<li><a href="${slug(l.n)}/index.html"><span class="tpc-secno">${l.n}</span><span class="tpc-index-title">${l.title}</span>${demos}</a></li>`;
  }).join('');
  return `${head(lang, W.course[lang], '../assets')}
<body>
${topbar(lang, 'index.html', `../${other}/index.html`, `../../pdf/${PDF[lang]}`)}
<main class="tpc-page"><article class="tpc-chapter tpc-lecture-index">
<header class="tpc-chapter-head"><h1>${W.course[lang]}</h1></header>
<p>${W.intro[lang]} <a href="../../pdf/${PDF[lang]}">${W.pdf[lang]}</a> · <a href="${PLAYLIST}">${W.videos[lang]}</a></p>
<h2>${W.lectures[lang]}</h2>
<ol class="tpc-index-list">${items}</ol>
</article></main>
</body>
</html>
`;
}

const redirect = (to: string, lang: Lang) =>
  `<!doctype html>\n<html lang="${lang}"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}"><title>${W.course[lang]}</title></head>`
  + `<body><p><a href="${to}">${W.course[lang]}</a></p></body></html>\n`;

async function main(): Promise<void> {
  const t0 = Date.now();
  if (!args.includes('--no-figures')) {
    const r = spawnSync('python3', [path.join(ROOT, 'scripts/build_figures.py'), '--svg'], { stdio: 'inherit' });
    if (r.status !== 0) throw new Error('scripts/build_figures.py failed');
  }

  const macros: Record<string, string> = {};
  for (const f of ['tpc-macros.sty', 'tpc-notation.sty']) styleMacros(stripComments(fs.readFileSync(path.join(LATEX, f), 'utf8')), macros);
  macros['\\eqbox'] = '\\class{tpc-eqbox}{#1}';
  macros['\\hdots'] = '\\cdots';

  const catalog = JSON.parse(fs.readFileSync(path.join(WEB, 'src/demos/catalog.json'), 'utf8')) as LectureCtx['demoCatalog'];
  const tokens = JSON.parse(fs.readFileSync(path.join(VENDOR, 'tokens/pkg1-light.json'), 'utf8')) as { type: { body: { size_pt: number; web_rem: number } } };
  const pxPerPt = (tokens.type.body.web_rem * 16) / tokens.type.body.size_pt;

  // 1. parse
  const lectures: Lecture[] = [];
  const labels: Record<Lang, Map<string, LabelInfo>> = { de: new Map(), en: new Map() };
  const errors: string[] = [];
  for (const lang of LANGS) for (let n = 1; n <= N; n++) {
    if (!wanted(n)) continue;
    const file = lectureFile(lang, n);
    const ctx: LectureCtx = {
      lang, n, file: path.relative(ROOT, file), src: stripComments(fs.readFileSync(file, 'utf8')), macros, demoCatalog: catalog,
      figureSize: (name) => figureMeta(lang, name, pxPerPt),
      stillSize: (id) => svgSize(path.join(WEB, 'assets/stills', `${id}.${lang}.svg`), pxPerPt),
      title: '', labels: labels[lang], toc: [], figures: [], demos: [], replaced: [], counters: {}, webonly: 0,
    };
    try {
      const html = parseLecture(ctx);
      if (!ctx.title) throw new Error(`${ctx.file}: no \\section{...} with the lecture title`);
      lectures.push({ n, lang, title: ctx.title, html, toc: ctx.toc, demos: ctx.demos, figures: ctx.figures, file: ctx.file });
    } catch (e) { errors.push((e as Error).message); }
  }
  if (errors.length) { for (const e of errors) console.error(`site: FAIL ${e}`); process.exit(1); }
  for (const l of lectures) l.html = resolveRefs(l.html, l.n, l.file, labels[l.lang], slug, ONLY !== null);

  // 2. the two editions must place the same demos and figures in the same order
  for (let n = 1; n <= N; n++) {
    if (!wanted(n)) continue;
    const de = lectures.find((l) => l.lang === 'de' && l.n === n)!, en = lectures.find((l) => l.lang === 'en' && l.n === n)!;
    for (const k of ['demos', 'figures'] as const) {
      if (de[k].join() !== en[k].join()) throw new Error(`lecture ${n}: ${k} differ between the editions: de [${de[k].join(', ')}], en [${en[k].join(', ')}]`);
    }
  }

  // 3. assets
  const assets = path.join(OUT, 'assets');
  fs.mkdirSync(assets, { recursive: true });
  const gen = writeGen();
  let rebuilt = (await buildSiteBundle(gen, assets)) ? 1 : 0;
  const demoIds = [...new Set(lectures.flatMap((l) => l.demos))].sort();
  for (const id of demoIds) if (await buildDemoBundle(gen, id, path.join(assets, 'demos'))) rebuilt++;
  for (const g of ['light', 'dark']) copyIfNewer(path.join(VENDOR, `tokens/pkg1-${g}.css`), path.join(assets, 'tokens', `pkg1-${g}.css`));
  for (const f of fs.readdirSync(path.join(WEB, 'assets/fonts'))) {
    const from = path.join(WEB, 'assets/fonts', f);
    if (fs.statSync(from).isFile()) copyIfNewer(from, path.join(assets, 'fonts', f));
    else fs.cpSync(from, path.join(assets, 'fonts', f), { recursive: true });
  }
  for (const l of lectures) {
    for (const name of l.figures) {
      const file = figureMeta(l.lang, name, 1).file;
      copyIfNewer(path.join(ROOT, 'build/figures', `open-${l.lang}`, 'figures', file), path.join(assets, 'figures', l.lang, file));
    }
    for (const id of l.demos) copyIfNewer(path.join(WEB, 'assets/stills', `${id}.${l.lang}.svg`), path.join(assets, 'stills', `${id}.${l.lang}.svg`));
  }

  // 4. pages
  for (const lang of LANGS) {
    const ls = lectures.filter((l) => l.lang === lang);
    const titles = new Map(ls.map((l) => [l.n, l.title]));
    for (const l of ls) {
      const dir = path.join(OUT, lang, slug(l.n));
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), lecturePage(l, titles));
    }
    fs.writeFileSync(path.join(OUT, lang, 'index.html'), indexPage(lang, ls));
    for (const [old, n] of Object.entries(OLD_CHAPTERS)) {
      fs.mkdirSync(path.join(OUT, lang, old), { recursive: true });
      fs.writeFileSync(path.join(OUT, lang, old, 'index.html'), redirect(`../${slug(n)}/index.html`, lang));
    }
  }
  fs.writeFileSync(path.join(OUT, 'index.html'), redirect('de/index.html', 'de'));
  fs.writeFileSync(path.join(OUT, 'site.json'), JSON.stringify({
    lectures: lectures.map((l) => ({ n: l.n, lang: l.lang, title: l.title.replace(/<[^>]+>/g, ''), demos: l.demos, figures: l.figures })),
    demos: demoIds,
  }, null, 1));

  const placed = lectures.filter((l) => l.lang === 'de').reduce((a, l) => a + l.demos.length, 0);
  console.log(`site: ok ${lectures.length / LANGS.length} lectures x ${LANGS.length} languages, ${placed} demo placements (${demoIds.length} demos), ${rebuilt} bundle(s) rebuilt, ${((Date.now() - t0) / 1000).toFixed(1)} s -> ${path.relative(ROOT, OUT)}`);
}

main().catch((e) => { console.error(`site: FAIL ${(e as Error).message}`); process.exit(1); });
