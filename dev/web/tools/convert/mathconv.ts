// Mathematics: validate the source against the registry, expand registry macros, convert to
// MathML with Temml, and check the result.
//
// The content file may use, in mathematics: the macros of the notation registry, the legacy
// structural macros of tpc-macros.sty that registry/allowed-tex.json lists, the amsmath
// vocabulary of allowed-tex.json, and the contract's inner environments. Anything else is an
// error with file:line. Registry macros are expanded HERE, with the expansions of
// registry/generated/notation.web.json, so Temml only ever sees plain amsmath TeX and none of
// its own built-in macros (\ket, \comm, \R ...) can shadow a course definition.
import temml from 'temml';
import { Cursor, TexError, isChar, isCs, tokenize, toksToPlain, toksToTex, trimToks, type Pos, type Tok } from './tex.ts';
import type { Env, Lang, MacroDef } from './env.ts';

export interface ClaimSpec { id: string; status: string; presentation: string | null; pos: Pos }

export interface MathRow {
  tex: string;
  label: { id: string; pos: Pos } | null;
  claim: ClaimSpec | null;
  notag: boolean;
}

export interface ScannedMath { rows: MathRow[]; src: string; pos: Pos; numClaims: string[] }

export type MathEnd = { kind: 'dollar' } | { kind: 'env'; name: string };

const expansionCache = new Map<string, Tok[]>();

function expansionToks(def: MacroDef): Tok[] {
  let t = expansionCache.get(def.origin + ':' + def.name);
  if (!t) {
    t = tokenize(def.expansion, `<${def.origin}:\\${def.name}>`);
    expansionCache.set(def.origin + ':' + def.name, t);
  }
  return t;
}

export function readClaim(cur: Cursor, env: Env, at: Pos): ClaimSpec {
  const opt = cur.optional('\\claim');
  const presentation = opt ? toksToPlain(opt, '\\claim presentation', at) : null;
  const id = toksToPlain(cur.group('\\claim'), '\\claim ID', at);
  const status = toksToPlain(cur.group('\\claim'), '\\claim status', at);
  if (!new RegExp(env.contract.id_grammar.typed).test(id) || !id.includes('.cl.')) {
    throw new TexError(at, `\\claim: '${id}' is not a claim ID (cNN.cl.slug)`);
  }
  if (!env.contract.evidence_statuses.includes(status)) {
    throw new TexError(at, `\\claim: unknown evidence status '${status}' (one of: ${env.contract.evidence_statuses.join(', ')})`);
  }
  if (presentation !== null && !env.contract.presentations.includes(presentation)) {
    throw new TexError(at, `\\claim: unknown presentation '${presentation}' (one of: ${env.contract.presentations.join(', ')})`);
  }
  return { id, status, presentation, pos: at };
}

/** [claim-id] of \\num: the ID of a ledger row, or null when the option is absent. */
export function readNumClaim(cur: Cursor, env: Env, at: Pos): string | null {
  const opt = cur.optional('\\num');
  if (!opt) return null;
  const id = toksToPlain(opt, '\\num claim ID', at);
  if (!new RegExp(env.contract.id_grammar.typed).test(id) || !id.includes('.cl.')) {
    throw new TexError(at, `\\num[${id}]: not a claim ID (cNN.cl.slug)`);
  }
  return id;
}

class Scanner {
  rows: MathRow[] = [];
  numClaims: string[] = [];
  private out: string[] = [];
  private row: MathRow = { tex: '', label: null, claim: null, notag: false };
  private envStack: string[] = [];
  private depth = 0;
  private symbols: Set<string>;

  constructor(private cur: Cursor, private env: Env, private lang: Lang, private end: MathEnd,
              private display: boolean, private splitRows: boolean) {
    this.symbols = new Set(env.contract.control_symbols.map((s) => s.slice(1)));
  }

  private top(): boolean { return this.depth === 0 && this.envStack.length === 0; }

  private closeRow(): void {
    this.row.tex = this.out.join('').replace(/\s+/g, ' ').trim();
    this.rows.push(this.row);
    this.row = { tex: '', label: null, claim: null, notag: false };
    this.out = [];
  }

  run(start: Pos): void {
    const cur = this.cur;
    for (;;) {
      const t = cur.next();
      if (!t) {
        throw new TexError(start, this.end.kind === 'dollar' ? "'$' is never closed" : `\\begin{${this.end.name}} is never closed`);
      }
      if (this.end.kind === 'dollar' && isChar(t, '$') && this.top()) break;
      switch (t.k) {
        case 'par':
          throw new TexError(t.pos, 'blank line inside mathematics');
        case 'space':
          this.out.push(' ');
          break;
        case 'char':
          this.char(t);
          break;
        case 'sym':
          this.sym(t);
          break;
        case 'cs':
          if (t.name === 'end') {
            const name = toksToPlain(cur.group('\\end'), '\\end', t.pos);
            if (this.envStack.length === 0) {
              if (this.end.kind === 'env' && name === this.end.name && this.depth === 0) { this.closeRow(); return; }
              throw new TexError(t.pos, `\\end{${name}} does not match ${this.end.kind === 'env' ? `\\begin{${this.end.name}}` : "the open '$'"}`);
            }
            const open = this.envStack.pop();
            if (open !== name) throw new TexError(t.pos, `\\end{${name}} closes \\begin{${open}}`);
            this.out.push(`\\end{${name}}`);
            break;
          }
          this.cs(t);
          break;
      }
    }
    this.closeRow();
  }

  private char(t: Extract<Tok, { k: 'char' }>): void {
    switch (t.ch) {
      case '{': this.depth++; this.out.push('{'); return;
      case '}':
        if (this.depth === 0) throw new TexError(t.pos, "unbalanced '}' in mathematics");
        this.depth--; this.out.push('}'); return;
      case '$': throw new TexError(t.pos, "'$' inside mathematics (the contract has no '$$' and no nested '$')");
      case '#': throw new TexError(t.pos, "'#' in mathematics");
      default: this.out.push(t.ch);
    }
  }

  private sym(t: Extract<Tok, { k: 'sym' }>): void {
    if (!this.symbols.has(t.name) && !t.trusted) {
      throw new TexError(t.pos, `control symbol \\${t.name} is not in the contract`);
    }
    if (t.name === '\\') {
      if (isChar(this.cur.peek(), '[')) throw new TexError(t.pos, '\\\\[length] is manual layout: not in the contract');
      if (this.top()) {
        if (this.splitRows) { this.closeRow(); return; }
        throw new TexError(t.pos, this.display ? '\\\\ at the top level of a one-line display (use align)' : '\\\\ in inline mathematics');
      }
      this.out.push('\\\\ ');
      return;
    }
    this.out.push('\\' + t.name);
  }

  private cs(t: Extract<Tok, { k: 'cs' }>): void {
    const cur = this.cur;
    const { env } = this;
    const name = t.name;
    if (!t.trusted && env.forbidden.has(name)) {
      throw new TexError(t.pos, `\\${name} is forbidden in content files (contract section 10)`);
    }
    if (name === 'begin') {
      const en = toksToPlain(cur.group('\\begin'), '\\begin', t.pos);
      if (!env.contract.inner_math.includes(en)) {
        throw new TexError(t.pos, `environment '${en}' is not allowed inside mathematics (allowed: ${env.contract.inner_math.join(', ')})`);
      }
      this.envStack.push(en);
      this.out.push(`\\begin{${en}}`);
      return;
    }
    if (env.contract.math_text_switch.includes(name)) {
      this.out.push(`\\${name}{${this.textArg(cur.group('\\' + name), t.pos)}}`);
      return;
    }
    if (name === 'label' || name === 'claim' || name === 'notag') {
      if (!this.display) throw new TexError(t.pos, `\\${name} in inline mathematics`);
      if (!this.top()) throw new TexError(t.pos, `\\${name} must stand at the top level of the display`);
      if (name === 'label') {
        const id = toksToPlain(cur.group('\\label'), '\\label', t.pos);
        if (this.row.label) throw new TexError(t.pos, `second \\label in one display row (first: ${this.row.label.id})`);
        this.row.label = { id, pos: t.pos };
      } else if (name === 'claim') {
        if (this.row.claim) throw new TexError(t.pos, 'second \\claim in one display row');
        if (!this.row.label) throw new TexError(t.pos, '\\claim must follow the \\label of the row it is about');
        this.row.claim = readClaim(cur, env, t.pos);
      } else {
        this.row.notag = true;
      }
      return;
    }
    if (name === 'tpcifenglish') {
      throw new TexError(t.pos, '\\tpcifenglish in mathematics must stand inside \\text{...}');
    }
    if (name === 'num' && env.contract.text_macros.includes('num')) {
      // \num[claim-id]{value}{unit}: print sets  value \, \mathrm{unit}  (tpc-course.sty)
      const claim = readNumClaim(cur, env, t.pos);
      if (claim) this.numClaims.push(claim);
      const value = cur.group('\\num value');
      const unit = trimToks(cur.group('\\num unit'));
      if (trimToks(value).length === 0) throw new TexError(t.pos, '\\num with an empty value');
      const glue: Tok[] = unit.length
        ? [{ k: 'sym', name: ',', pos: t.pos, trusted: true }, { k: 'cs', name: 'mathrm', pos: t.pos, trusted: true }, { k: 'char', ch: '{', pos: t.pos }, ...unit, { k: 'char', ch: '}', pos: t.pos }]
        : [];
      cur.unshift([...value, ...glue]);
      return;
    }
    const def = env.macros.get(name);
    if (def && !(t.noexp && t.noexp.has(name))) {
      this.expand(def, t);
      return;
    }
    if (t.trusted || env.mathAllowed.has(name) || def) {
      this.out.push('\\' + name + ' ');
      return;
    }
    throw new TexError(t.pos, `\\${name} is not a registered macro (not in the notation registry, registry/allowed-tex.json or the legacy list of tpc-macros.sty)`, 'unregistered-macro');
  }

  private expand(def: MacroDef, t: Extract<Tok, { k: 'cs' }>): void {
    const cur = this.cur;
    const args: Tok[][] = [];
    let n = def.nargs;
    if (def.optDefault !== null) {
      const o = cur.optional('\\' + def.name);
      args.push(o ?? tokenize(def.optDefault, `<${def.origin}:\\${def.name}>`).map((x) => ({ ...x, pos: t.pos, trusted: true })));
      n -= 1;
    }
    for (let k = 0; k < n; k++) args.push(cur.arg(`\\${def.name} (argument ${k + 1} of ${def.nargs})`));
    const noexp = new Set(t.noexp ?? []);
    noexp.add(def.name);
    const body = expansionToks(def);
    const res: Tok[] = [];
    for (let i = 0; i < body.length; i++) {
      const b = body[i];
      const nx = body[i + 1];
      if (isChar(b, '#') && nx && nx.k === 'char' && nx.ch >= '1' && nx.ch <= '9') {
        const a = args[Number(nx.ch) - 1];
        if (!a) throw new TexError(t.pos, `\\${def.name}: expansion uses #${nx.ch} but the macro has ${def.nargs} argument(s)`);
        res.push(...a);
        i++;
        continue;
      }
      res.push({ ...b, pos: t.pos, trusted: true, noexp } as Tok);
    }
    cur.unshift(res);
  }

  /** Content of \text{...}: characters, control symbols, \tpcifenglish, nested $...$. */
  private textArg(toks: Tok[], at: Pos): string {
    const c = new Cursor(toks, at);
    let s = '';
    while (!c.eof()) {
      const t = c.next()!;
      if (t.k === 'par') throw new TexError(t.pos, 'blank line inside \\text');
      if (t.k === 'space') { s += ' '; continue; }
      if (t.k === 'char') {
        if (t.ch === '$') {
          const inner = scanMath(c, this.env, this.lang, { kind: 'dollar' }, t.pos);
          s += `$${inner.rows[0].tex}$`;
        } else if (t.ch === '~') s += ' ';
        else if (t.ch === '{' || t.ch === '}') throw new TexError(t.pos, 'braces inside \\text are not in the contract');
        else if (t.ch === '#' || t.ch === '&' || t.ch === '^' || t.ch === '_') throw new TexError(t.pos, `'${t.ch}' inside \\text`);
        else s += t.ch;
        continue;
      }
      if (t.k === 'sym') {
        if (!this.symbols.has(t.name) || t.name === '\\') throw new TexError(t.pos, `\\${t.name} inside \\text is not in the contract`);
        s += '\\' + t.name;
        continue;
      }
      if (t.name === 'tpcifenglish') {
        const en = c.group('\\tpcifenglish');
        const de = c.group('\\tpcifenglish');
        const enText = this.textArg(en, t.pos);
        const deText = this.textArg(de, t.pos);
        s += this.lang === 'en' ? enText : deText;
        continue;
      }
      if (t.name === 'dots' || t.name === 'ldots') { s += '…'; continue; }
      throw new TexError(t.pos, `\\${t.name} inside \\text is not in the contract (allowed: characters, \\tpcifenglish, $...$)`);
    }
    return s;
  }
}

/** Scan mathematics from the cursor (positioned after the opening '$' or \begin{env}) through its end. */
export function scanMath(cur: Cursor, env: Env, lang: Lang, end: MathEnd, start: Pos): ScannedMath {
  const display = end.kind === 'env';
  const split = end.kind === 'env' && (end.name === 'align' || end.name === 'align*');
  // source text as written, read off before expansion edits the token array in place
  const src = sourceText(cur.toks, cur.i, end);
  const sc = new Scanner(cur, env, lang, end, display, split);
  sc.run(start);
  return { rows: sc.rows, src, pos: start, numClaims: sc.numClaims };
}

function sourceText(toks: Tok[], from: number, end: MathEnd): string {
  let depth = 0;
  const out: Tok[] = [];
  for (let i = from; i < toks.length; i++) {
    const t = toks[i];
    if (isChar(t, '{')) depth++;
    else if (isChar(t, '}')) depth--;
    // a '$' inside \text{...} has depth > 0, so a '$' at depth 0 is the closing one
    if (end.kind === 'dollar' && isChar(t, '$') && depth === 0) break;
    if (end.kind === 'env' && isCs(t, 'end') && depth === 0) {
      let nm = '';
      for (let j = i + 1; j < toks.length && j <= i + end.name.length + 2; j++) {
        const x = toks[j];
        if (x.k === 'char') nm += x.ch;
      }
      if (nm === `{${end.name}}`) break;
    }
    out.push(t);
  }
  return toksToTex(out).replace(/\s+/g, ' ').trim();
}

// ── Temml ─────────────────────────────────────────────────────

export interface MNode {
  type?: string;
  attributes?: Record<string, string>;
  classes?: string[];
  style?: Record<string, unknown>;
  children?: MNode[];
  text?: string;
  toMarkup(): string;
}

type TemmlInternal = typeof temml & { __renderToMathMLTree(tex: string, opts: Record<string, unknown>): MNode };

export interface Converted { mathml: string; tree: MNode; problems: string[] }

export const MATH_CONVERTER = `temml ${temml.version}`;

const cssKey = (k: string) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());

export function walk(n: MNode, f: (n: MNode, parent: MNode | null) => void, parent: MNode | null = null): void {
  f(n, parent);
  for (const c of n.children ?? []) walk(c, f, n);
}

export function nodeText(n: MNode): string {
  let s = '';
  walk(n, (x) => { if (typeof x.text === 'string') s += x.text; });
  return s;
}

/** Faults of a converted formula: error nodes, raw macro names, bold as an attribute. */
export function checkTree(tree: MNode): string[] {
  const problems: string[] = [];
  walk(tree, (n) => {
    if (n.type === 'merror') problems.push('<merror> in the output');
    if (n.classes?.some((c) => c === 'temml-error')) problems.push('Temml error output');
    if (n.classes?.some((c) => c === 'tml-eqn')) problems.push('row would be numbered by a CSS counter (missing \\tag or \\notag)');
    if (typeof n.text === 'string' && n.text.includes('\\')) problems.push(`raw macro name in the output: ${JSON.stringify(n.text.slice(0, 40))}`);
    const mv = n.attributes?.mathvariant;
    if (mv && /bold/.test(mv)) problems.push(`mathvariant="${mv}" on <${n.type}> (MathML Core renders only "normal" on <mi>): bold must be a Unicode bold letter`);
    if (n.attributes?.mathcolor) problems.push('mathcolor in the output (literal colour)');
    const col = n.style?.color;
    if (typeof col === 'string' && col !== '') problems.push(`literal colour ${col} in the output`);
  });
  return [...new Set(problems)];
}

/** Drop the non-CSS entries Temml leaves in the style of padding cells (level, maxSize, ...). */
function cleanStyles(tree: MNode): void {
  walk(tree, (n) => {
    if (!n.style) return;
    for (const k of Object.keys(n.style)) {
      const v = n.style[k];
      if (typeof v !== 'string' || v === '' || k === 'level' || k === 'maxSize' || k === 'fontShape') delete n.style[k];
    }
  });
}

export function convertTex(tex: string, display: boolean): Converted {
  const t = temml as TemmlInternal;
  let tree: MNode;
  try {
    tree = t.__renderToMathMLTree(tex, { displayMode: display, throwOnError: true, annotate: false, trust: false, macros: {}, wrap: 'none' });
  } catch (e) {
    const msg = (e as Error).message.replace(/\s+/g, ' ').trim();
    return { mathml: '', tree: { toMarkup: () => '' }, problems: [`Temml: ${msg}`] };
  }
  const problems = checkTree(tree);
  cleanStyles(tree);
  return { mathml: tree.toMarkup(), tree, problems };
}

export interface DisplayRowOut { id: string | null; number: string | null; claimTag: string | null }

/** TeX for a whole display, with the print numbers as \tag. */
export function displayTex(envName: string, rows: MathRow[], numberOf: (row: MathRow) => string | null): string {
  if (envName === 'equation' || envName === 'equation*') {
    const num = numberOf(rows[0]);
    return rows[0].tex + (num ? ` \\tag{${num}}` : '');
  }
  const body = rows.map((r) => {
    const num = numberOf(r);
    return r.tex + (num ? ` \\tag{${num}}` : ' \\notag');
  }).join(' \\\\ ');
  return `\\begin{align}${body}\\end{align}`;
}

/** Give the rows of the outer table their HTML ids. */
export function decorateDisplay(tree: MNode, rows: DisplayRowOut[], idOnRows: boolean): void {
  let table: MNode | null = null;
  walk(tree, (n) => { if (!table && n.type === 'mtable') table = n; });
  if (!table) return;
  const trs = ((table as MNode).children ?? []).filter((c) => c.type === 'mtr');
  rows.forEach((r, i) => {
    const tr = trs[i];
    if (!tr) return;
    if (idOnRows && r.id) { tr.attributes = { ...(tr.attributes ?? {}), id: r.id }; }
  });
}
