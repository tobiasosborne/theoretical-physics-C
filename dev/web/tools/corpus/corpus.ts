// The formula corpus (review items A5, A6): every inline and display formula of the chapters
// given, every usage line of the notation registry, every formula in a registry definition,
// and a few named probes. Each must convert without error and without unknown-macro output.
import { Cursor, TexError, tokenize } from '../convert/tex.ts';
import { definitionsFor, LANGS, type ChapterMeta, type Env } from '../convert/env.ts';
import { convertTex, scanMath } from '../convert/mathconv.ts';
import { definitionHomes, parseChapter, parseFragment } from '../convert/parse.ts';
import type { FormulaRecord } from '../convert/ir.ts';
import { esc } from '../convert/render.ts';

export interface CorpusEntry {
  origin: string;
  kind: 'chapter' | 'registry-usage' | 'definition' | 'probe';
  display: boolean;
  src: string;
  tex: string;
  mathml: string;
  problems: string[];
  probe?: string;
}

/** Named probes: the explicit tests of the gate read them by name (vitest and browser). */
export const PROBES: Array<{ name: string; src: string }> = [
  { name: 'tr-space', src: '\\tr X' },
  { name: 'tr-paren', src: '\\tr(XY)' },
  { name: 'tr-sum', src: '\\tr X + c\\,\\tr Y' },
  { name: 'bold-registry', src: '\\posRel' },
  { name: 'bold-symbol', src: '\\boldsymbol{r}' },
  { name: 'bold-upright', src: '\\mathbf{R}' },
  { name: 'bold-greek', src: '\\boldsymbol{\\alpha}' },
  { name: 'plain-r', src: 'r' },
];

/**
 * Convert one inline formula given as a string. `registryData`: the string is a usage line
 * of the registry itself; its control words are registry data and are not held to
 * registry/allowed-tex.json (some usage lines show a registry-owned glyph such as \\ell as
 * an argument), but the result must still convert.
 */
export function convertSnippet(env: Env, src: string, origin: string, registryData = false): { tex: string; mathml: string; problems: string[] } {
  const toks = tokenize(src + '$', origin).map((t) => (registryData && t.k === 'cs' && !env.macros.has(t.name) ? { ...t, trusted: true } : t));
  const cur = new Cursor(toks, { file: origin, line: 1, col: 1 });
  try {
    const m = scanMath(cur, env, 'de', { kind: 'dollar' }, { file: origin, line: 1, col: 1 });
    const conv = convertTex(m.rows[0].tex, false);
    return { tex: m.rows[0].tex, mathml: conv.mathml, problems: conv.problems };
  } catch (e) {
    if (e instanceof TexError) return { tex: '', mathml: '', problems: [e.message] };
    throw e;
  }
}

export function collectCorpus(env: Env, metas: ChapterMeta[]): CorpusEntry[] {
  const out: CorpusEntry[] = [];
  const seen = new Set<string>();
  const add = (kind: CorpusEntry['kind'], recs: FormulaRecord[]) => {
    for (const r of recs) {
      const key = `${r.display ? 'D' : 'I'}|${r.tex}|${r.problems.join('|')}`;
      if (r.problems.length === 0 && seen.has(key)) continue;
      seen.add(key);
      out.push({ origin: `${r.loc.file}:${r.loc.line}`, kind, display: r.display, src: r.src, tex: r.tex, mathml: r.mathml, problems: r.problems });
    }
  };
  const homes = definitionHomes(env, metas);
  for (const meta of metas) {
    for (const lang of LANGS) {
      const formulas: FormulaRecord[] = [];
      parseChapter(env, meta, lang, { numbers: null, siteChapters: new Set(metas.map((m) => m.id)), definitionHome: homes, formulas, lenientMath: true });
      add('chapter', formulas);
    }
  }
  for (const s of env.symbols) {
    const c = convertSnippet(env, s.usage, `registry/notation.json#${s.symbol_id}`, true);
    out.push({ origin: `registry/notation.json#${s.symbol_id}`, kind: 'registry-usage', display: false, src: s.usage, ...c });
  }
  const defs = new Map(env.definitions);
  for (const meta of metas) for (const [k, v] of definitionsFor(env, meta)) defs.set(k, v);
  for (const d of defs.values()) {
    for (const lang of LANGS) {
      const formulas: FormulaRecord[] = [];
      try {
        parseFragment(env, d.body[lang], d.origin, lang, formulas);
      } catch (e) {
        if (!(e instanceof TexError)) throw e;
        out.push({ origin: `${d.origin} (${lang})`, kind: 'definition', display: false, src: '', tex: '', mathml: '', problems: [`definition body is outside the contract: ${e.message}`] });
        continue;
      }
      add('definition', formulas.map((f) => ({ ...f, loc: { file: `${d.origin} (${d.id}, ${lang})`, line: f.loc.line } })));
    }
  }
  for (const p of PROBES) {
    const c = convertSnippet(env, p.src, `probe:${p.name}`);
    out.push({ origin: `probe:${p.name}`, kind: 'probe', display: false, src: p.src, ...c, probe: p.name });
  }
  return out;
}

export function corpusPage(entries: CorpusEntry[], assets: string, pkg: number, ground: string): string {
  const rows = entries.map((e, i) =>
    `<div class="tpc-corpus-item" data-n="${i}" data-kind="${e.kind}"${e.probe ? ` data-probe="${esc(e.probe)}"` : ''} data-origin="${esc(e.origin)}" data-src="${esc(e.src)}">`
    + (e.display ? `<div class="tpc-eq">${e.mathml}</div>` : `<p>${e.mathml}</p>`) + `</div>`).join('\n');
  return `<!doctype html>
<html lang="de" data-tpc-pkg="${pkg}" data-tpc-ground="${ground}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Formula corpus</title>
<link rel="stylesheet" href="${assets}/fonts/fonts.css">
<link rel="stylesheet" id="tpc-tokens" href="${assets}/tokens/pkg${pkg}-${ground}.css">
<link rel="stylesheet" href="${assets}/site.css">
</head>
<body>
<main class="tpc-page"><article class="tpc-chapter">
<h1>Formula corpus: ${entries.length} formulas</h1>
${rows}
</article></main>
</body>
</html>
`;
}

export function summarize(entries: CorpusEntry[]): string {
  const by = (k: CorpusEntry['kind']) => entries.filter((e) => e.kind === k).length;
  return `${entries.length} formulas (${entries.filter((e) => e.display).length} display, ${entries.filter((e) => !e.display).length} inline; `
    + `${by('chapter')} from chapters, ${by('registry-usage')} registry usage lines, ${by('definition')} from definitions, ${by('probe')} probes)`;
}
