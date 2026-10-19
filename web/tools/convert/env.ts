// What the converter reads besides the chapter files: the contract lists, the notation and
// definitions registry, the legacy macros of tpc-macros.sty, and the chapter directories.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Cursor, TexError, isChar, isCs, tokenize, toksToPlain, type Tok } from './tex.ts';

export type Lang = 'de' | 'en';
export const LANGS: Lang[] = ['de', 'en'];

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export interface Paths {
  root: string;
  content: string;       // content root
  courseBuild: string;   // build/course
  design: string;        // design/build
  out: string;           // build/web
}

export function defaultPaths(over: Partial<Paths> = {}): Paths {
  const root = over.root ?? REPO_ROOT;
  return {
    root,
    content: path.resolve(over.content ?? path.join(root, 'content')),
    courseBuild: path.resolve(over.courseBuild ?? path.join(root, 'build/course')),
    design: path.resolve(over.design ?? path.join(root, 'design/build')),
    out: path.resolve(over.out ?? path.join(root, 'build/web')),
  };
}

export interface Contract {
  id_grammar: Record<string, string>;
  numbered_units: Record<string, string>;
  unnumbered_units: string[];
  theorem_like?: string[];
  source_key?: string;
  boxes: string[];
  lists: string[];
  depth_blocks: Record<string, string>;
  depth_keys: string[];
  figure_envs: Record<string, string>;
  table_envs: string[];
  display_math: string[];
  inner_math: string[];
  text_macros: string[];
  control_symbols: string[];
  math_text_switch: string[];
  forbidden_everywhere: string[];
  forbidden_environments_named: string[];
  evidence_statuses: string[];
  presentations: string[];
  depths: string[];
  asset_kinds: string[];
}

export interface MacroDef {
  name: string;
  nargs: number;
  optDefault: string | null;   // default of a leading optional argument, if the macro has one
  expansion: string;
  origin: 'registry' | 'tpc-macros.sty';
  symbolId?: string;
}

export interface SymbolEntry {
  symbol_id: string; macro: string; args: number; expansion: string; usage: string;
  unicode: string; mathml: string; name: Record<Lang, string>; meaning: Record<Lang, string>;
  depth: string; status: string;
}

export interface Definition {
  id: string;
  depth: string;
  name: Record<Lang, string>;
  body: Record<Lang, Tok[]>;
  nameToks: Record<Lang, Tok[]>;
  origin: string;   // file the definition comes from
}

export interface ChapterMeta {
  id: string; slug: string; dir: string; absDir: string;
  title: Record<Lang, string>;
  effective_theory?: Record<Lang, string>;
  zoom_scale?: string;
  prerequisites: string[];
  assets: Array<{ id: string; kind: string; file?: string; still?: string; title?: Record<Lang, string> }>;
  test_fixture?: boolean;
}

export interface Env {
  paths: Paths;
  contract: Contract;
  symbols: SymbolEntry[];
  macros: Map<string, MacroDef>;
  /** control words content may write in mathematics without a registry entry */
  mathAllowed: Set<string>;
  forbidden: Set<string>;
  definitions: Map<string, Definition>;
}

function readJson<T>(file: string): T {
  if (!fs.existsSync(file)) throw new Error(`${file}: missing`);
  return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

/** \newcommand and \DeclareMathOperator declarations of a style file, by token scan. */
export function parseStyleMacros(file: string, only: Set<string>): MacroDef[] {
  const toks = tokenize(fs.readFileSync(file, 'utf8'), file, { atLetter: true });
  const cur = new Cursor(toks, { file, line: 0, col: 0 });
  const out: MacroDef[] = [];
  const tex = (ts: Tok[]) => {
    let s = '';
    for (let i = 0; i < ts.length; i++) {
      const t = ts[i];
      if (t.k === 'cs') {
        s += '\\' + t.name;
        const nx = ts[i + 1];
        if (nx && nx.k === 'char' && /[A-Za-z]/.test(nx.ch)) s += ' ';
      } else if (t.k === 'sym') s += '\\' + t.name;
      else if (t.k === 'char') s += t.ch;
      else s += ' ';
    }
    return s.trim();
  };
  while (!cur.eof()) {
    const t = cur.next()!;
    if (isCs(t, 'DeclareMathOperator')) {
      const star = isChar(cur.peek(), '*');
      if (star) cur.next();
      const nameToks = cur.group('\\DeclareMathOperator');
      const body = cur.group('\\DeclareMathOperator');
      const nm = nameToks.find((x) => x.k === 'cs');
      if (nm && nm.k === 'cs' && only.has(nm.name)) {
        out.push({ name: nm.name, nargs: 0, optDefault: null, origin: 'tpc-macros.sty',
          expansion: `\\operatorname${star ? '*' : ''}{${tex(body)}}` });
      }
    } else if (isCs(t, 'newcommand')) {
      if (!isChar(cur.peek(), '{')) continue;
      const nameToks = cur.group('\\newcommand');
      const nm = nameToks.find((x) => x.k === 'cs');
      let nargs = 0;
      let optDefault: string | null = null;
      const n = cur.optional('\\newcommand');
      if (n) {
        nargs = Number(toksToPlain(n, '\\newcommand argument count', t.pos));
        const d = cur.optional('\\newcommand');
        if (d) optDefault = tex(d);
      }
      if (!isChar(cur.peek(), '{')) continue;
      const body = cur.group('\\newcommand');
      if (nm && nm.k === 'cs' && only.has(nm.name)) {
        out.push({ name: nm.name, nargs, optDefault, origin: 'tpc-macros.sty', expansion: tex(body) });
      }
    }
  }
  return out;
}

/** \tpcdeclaredef{ID}{depth}{Titel}{Title}{DE}{EN} records of a fixture file. */
function parseFixtureDefinitions(file: string): Definition[] {
  const toks = tokenize(fs.readFileSync(file, 'utf8'), file);
  const cur = new Cursor(toks, { file, line: 0, col: 0 });
  const out: Definition[] = [];
  while (!cur.eof()) {
    const t = cur.next()!;
    if (t.k === 'space' || t.k === 'par') continue;
    if (!isCs(t, 'tpcdeclaredef')) throw new TexError(t.pos, 'fixture definitions file: only \\tpcdeclaredef records are allowed');
    const g = [0, 1, 2, 3, 4, 5].map(() => cur.group('\\tpcdeclaredef'));
    out.push({
      id: toksToPlain(g[0], 'definition ID', t.pos),
      depth: toksToPlain(g[1], 'definition depth', t.pos),
      name: { de: toksToPlain(g[2], 'definition title', t.pos), en: toksToPlain(g[3], 'definition title', t.pos) },
      nameToks: { de: g[2], en: g[3] },
      body: { de: g[4], en: g[5] },
      origin: file,
    });
  }
  return out;
}

export function loadEnv(paths: Paths): Env {
  const root = paths.root;
  const contract = readJson<Contract>(path.join(root, 'docs/authoring/contract.json'));
  const notation = readJson<{ symbols: SymbolEntry[] }>(path.join(root, 'registry/generated/notation.web.json'));
  const allowed = readJson<{ allowed: Record<string, string[]> }>(path.join(root, 'registry/allowed-tex.json'));
  const defs = readJson<{ definitions: Array<{ id: string; depth: string; name: Record<Lang, string>; body: Record<Lang, string> }> }>(
    path.join(root, 'registry/generated/definitions.web.json'));

  const forbidden = new Set(contract.forbidden_everywhere);
  const macros = new Map<string, MacroDef>();
  const legacyKey = Object.keys(allowed.allowed).find((k) => k.includes('tpc-macros.sty'));
  const legacyNames = new Set(legacyKey ? allowed.allowed[legacyKey] : []);
  for (const m of parseStyleMacros(path.join(root, 'latex/tpc-macros.sty'), legacyNames)) macros.set(m.name, m);
  const missingLegacy = [...legacyNames].filter((n) => !macros.has(n));
  if (missingLegacy.length) {
    throw new Error(`registry/allowed-tex.json lists legacy macros that latex/tpc-macros.sty does not define: ${missingLegacy.join(', ')}`);
  }
  // the registry wins over the legacy file (tpc-notation.sty is loaded after tpc-macros.sty)
  for (const s of notation.symbols) {
    macros.set(s.macro, { name: s.macro, nargs: s.args, optDefault: null, expansion: s.expansion, origin: 'registry', symbolId: s.symbol_id });
  }
  const mathAllowed = new Set<string>();
  for (const [cat, names] of Object.entries(allowed.allowed)) {
    if (cat === 'document structure' || cat.startsWith('course infrastructure') || cat.startsWith('tables')) continue;
    if (cat === legacyKey) continue;
    for (const n of names) if (!forbidden.has(n)) mathAllowed.add(n);
  }
  mathAllowed.add('notag');
  // \dots and \ldots are text macros of the contract and ordinary amsmath in mathematics
  for (const n of ['dots', 'ldots']) if (contract.text_macros.includes(n)) mathAllowed.add(n);

  const definitions = new Map<string, Definition>();
  for (const d of defs.definitions) {
    const origin = `registry/generated/definitions.web.json#${d.id}`;
    definitions.set(d.id, {
      id: d.id, depth: d.depth, name: d.name, origin,
      nameToks: { de: tokenize(d.name.de, origin), en: tokenize(d.name.en, origin) },
      body: { de: tokenize(d.body.de, origin), en: tokenize(d.body.en, origin) },
    });
  }
  return { paths, contract, symbols: notation.symbols, macros, mathAllowed, forbidden, definitions };
}

/** Chapter directories cNN-slug under the content root; `want` = chapter IDs or null for all. */
export function findChapters(paths: Paths, want: string[] | null): ChapterMeta[] {
  if (!fs.existsSync(paths.content)) throw new Error(`${paths.content}: content root missing`);
  const dirs = fs.readdirSync(paths.content).filter((d) => /^c[0-9]{2}-/.test(d) && fs.existsSync(path.join(paths.content, d, 'de.tex'))).sort();
  const metas: ChapterMeta[] = [];
  for (const dir of dirs) {
    const id = dir.slice(0, 3);
    if (want && !want.includes(id)) continue;
    const absDir = path.join(paths.content, dir);
    const cj = path.join(absDir, 'chapter.json');
    const meta = readJson<ChapterMeta>(cj);
    if (meta.id !== id) throw new Error(`${cj}: "id" is ${JSON.stringify(meta.id)} but the directory says ${id}`);
    metas.push({ ...meta, dir, absDir, prerequisites: meta.prerequisites ?? [], assets: meta.assets ?? [] });
  }
  if (want) {
    for (const id of want) if (!metas.some((m) => m.id === id)) throw new Error(`no chapter '${id}' under ${paths.content}`);
  }
  return metas;
}

/** Definitions visible to one chapter: the registry, plus the stand-in of a test fixture. */
export function definitionsFor(env: Env, ch: ChapterMeta): Map<string, Definition> {
  const fx = path.join(ch.absDir, 'fixture/tpc-definitions.tex');
  if (!ch.test_fixture || !fs.existsSync(fx)) return env.definitions;
  const m = new Map(env.definitions);
  for (const d of parseFixtureDefinitions(fx)) m.set(d.id, d);
  return m;
}

export function relToRoot(paths: Paths, file: string): string {
  const r = path.relative(paths.root, file);
  return r.startsWith('..') ? file : r;
}
