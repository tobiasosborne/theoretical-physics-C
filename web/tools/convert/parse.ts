// Recursive parser for the authoring contract (docs/authoring/CONTRACT.md) -> ChapterIR.
// The language is closed: every control word, control symbol and environment is looked up in
// docs/authoring/contract.json, and anything else is a TexError with file:line. Nothing is
// passed through. Both language branches are validated before rendering the selected one.
import fs from 'node:fs';
import path from 'node:path';
import { Cursor, TexError, isChar, isCs, tokenize, toksToPlain, trimToks, type Pos, type Tok } from './tex.ts';
import { definitionsFor, relToRoot, type ChapterMeta, type Definition, type Env, type Lang } from './env.ts';
import { MATH_CONVERTER, convertTex, decorateDisplay, displayTex, nodeText, readClaim, readNumClaim, scanMath, type ClaimSpec, type MathEnd, type MathRow } from './mathconv.ts';
import type { PrintNumbers } from './aux.ts';
import type { Block, ChapterIR, Claim, DisplayRow, FormulaRecord, Inline, Loc } from './ir.ts';

export interface ParseOptions {
  /** print numbers; null = structure only (numbers come out as null) */
  numbers: PrintNumbers | null;
  /** chapter IDs that get a page in this site build (targets of cross-chapter links) */
  siteChapters: Set<string>;
  /** definition ID -> chapter ID that transcludes it, for the chapters of this site build */
  definitionHome: Map<string, string>;
  /** every formula met is appended here */
  formulas?: FormulaRecord[];
  /** corpus mode: a formula that fails is recorded and skipped instead of ending the parse */
  lenientMath?: boolean;
}

const CLAIM_TAGS: Record<string, Record<Lang, string>> = {
  'proof-omitted': { de: 'ohne Beweis', en: 'without proof' },
  'proof-linked': { de: 'Beweis ausgelagert', en: 'proof elsewhere' },
  derived: { de: 'hergeleitet', en: 'derived' },
};

/** The tag print shows for a claim (tpc-course.sty, section CLAIMS); null = nothing. */
export function claimTag(status: string, presentation: string | null, lang: Lang): string | null {
  if (presentation && CLAIM_TAGS[presentation]) return CLAIM_TAGS[presentation][lang];
  if (status === 'derived') return CLAIM_TAGS.derived[lang];
  return null;
}

export function plainText(nodes: Inline[]): string {
  let s = '';
  for (const n of nodes) {
    switch (n.t) {
      case 'text': s += n.text; break;
      case 'emph': case 'strong': s += plainText(n.children); break;
      case 'math': case 'num': s += n.plain; break;
      case 'ref': s += n.kind === 'eqref' ? `(${n.number ?? n.target})` : (n.number ?? `[${n.target}]`); break;
      case 'zoomref': break;
      case 'defref': s += `Definition ${n.number ?? n.id}`; break;
      case 'srcref': s += `[${n.key}, ${plainText(n.locus)}]`; break;
    }
  }
  return s.replace(/\s+/g, ' ').trim();
}

function normalize(nodes: Inline[]): Inline[] {
  // merge adjacent text, collapse blanks, trim both ends
  const out: Inline[] = [];
  for (const n of nodes) {
    const l = out[out.length - 1];
    if (n.t === 'text' && l && l.t === 'text') l.text += n.text;
    else out.push(n.t === 'text' ? { ...n } : n);
  }
  for (const n of out) if (n.t === 'text') n.text = n.text.replace(/[ \t\n]+/g, ' ');
  const first = out[0];
  if (first && first.t === 'text') first.text = first.text.replace(/^ +/, '');
  const last = out[out.length - 1];
  if (last && last.t === 'text') last.text = last.text.replace(/ +$/, '');
  return out.filter((n) => !(n.t === 'text' && n.text === ''));
}

const TEXT_SYMBOLS: Record<string, string> = {
  ',': ' ', ';': ' ', ':': ' ', '!': '', ' ': ' ',
  '%': '%', '&': '&', '$': '$', '#': '#', '_': '_', '{': '{', '}': '}', '-': '­',
};

type Depth = 'kern' | 'vertiefung' | 'fundament';

class Parser {
  cur: Cursor;
  ids: string[] = [];
  private seen = new Map<string, Pos>();
  private depth: Depth = 'kern';
  private nest = 0;                       // > 0 inside any environment
  private seenFundament = false;
  private zoomSeen = new Set<string>();
  private zoomNodes: Array<Extract<Inline, { t: 'zoomref' }>> = [];
  private refs: Array<{ target: string; pos: Pos }> = [];
  private defs: Map<string, Definition>;
  private usedDefs = new Map<string, { id: string; number: string | null; name: Inline[]; children: Block[] }>();
  private parsingDefinition = false;
  external = new Set<string>();
  counts = { vertiefung: 0, fundament: 0, figures: 0, demos: 0, formulas: 0 };
  demos: ChapterIR['demos'] = [];
  private leads = new Map<string, string>();
  private symbols: Set<string>;

  constructor(private env: Env, private meta: ChapterMeta, private lang: Lang, private file: string,
              toks: Tok[], private opts: ParseOptions) {
    this.cur = new Cursor(toks, { file, line: 0, col: 0 });
    this.defs = definitionsFor(env, meta);
    this.symbols = new Set(env.contract.control_symbols.map((s) => s.slice(1)));
  }

  // ── helpers ─────────────────────────────────────────────────
  private loc(p: Pos): Loc { return { file: p.file, line: p.line }; }

  private grammar(kind: string, id: string): boolean {
    return new RegExp(this.env.contract.id_grammar[kind]).test(id);
  }

  private declare(id: string, pos: Pos): void {
    const prev = this.seen.get(id);
    if (prev) throw new TexError(pos, `ID '${id}' is used twice (first at line ${prev.line})`);
    this.seen.set(id, pos);
    this.ids.push(id);
  }

  private ownId(id: string, pos: Pos): void {
    if (!id.startsWith(this.meta.id + '.') && id !== this.meta.id) {
      throw new TexError(pos, `ID '${id}' does not carry the chapter prefix ${this.meta.id}`);
    }
  }

  private number(id: string, pos: Pos): string | null {
    const nums = this.opts.numbers;
    if (!nums) return null;
    const l = nums.labels.get(id);
    if (!l) {
      throw new TexError(pos, `label '${id}' has no number in ${nums.auxFile}: the print build does not match this source (rebuild print)`, 'numbering');
    }
    return l.number;
  }

  private withCursor<T>(toks: Tok[], at: Pos, f: () => T): T {
    const saved = this.cur;
    this.cur = new Cursor(toks.slice(), at);
    try { return f(); } finally { this.cur = saved; }
  }

  private labelAfter(what: string, at: Pos): { id: string; pos: Pos } | null {
    const t = this.cur.peek();
    if (!t || !isCs(t, 'label')) return null;
    this.cur.next();
    return { id: toksToPlain(this.cur.group('\\label'), '\\label', t.pos), pos: t.pos };
  }

  private claimAfter(): ClaimSpec | null {
    const t = this.cur.peek();
    if (!t || !isCs(t, 'claim')) return null;
    this.cur.next();
    return readClaim(this.cur, this.env, t.pos);
  }

  private claim(c: ClaimSpec | null): Claim | null {
    if (!c) return null;
    this.ownId(c.id, c.pos);
    this.declare(c.id, c.pos);
    return { id: c.id, status: c.status, presentation: c.presentation, tag: claimTag(c.status, c.presentation, this.lang) };
  }

  // ── mathematics ─────────────────────────────────────────────
  private math(end: MathEnd, start: Pos): { rows: MathRow[]; src: string; numClaims: string[] } | { failed: string } {
    const cur = this.cur;
    if (!this.opts.lenientMath) return scanMath(cur, this.env, this.lang, end, start);
    const tail = cur.toks.length - this.terminatorEnd(end, start);
    try {
      return scanMath(cur, this.env, this.lang, end, start);
    } catch (e) {
      if (!(e instanceof TexError)) throw e;
      cur.i = cur.toks.length - tail;
      return { failed: e.message };
    }
  }

  /** Index just after the terminator of the mathematics that starts at the cursor. */
  private terminatorEnd(end: MathEnd, start: Pos): number {
    const toks = this.cur.toks;
    let depth = 0;
    for (let i = this.cur.i; i < toks.length; i++) {
      const t = toks[i];
      if (isChar(t, '{')) depth++;
      else if (isChar(t, '}')) depth--;
      if (end.kind === 'dollar' && isChar(t, '$') && depth <= 0) return i + 1;
      if (end.kind === 'env' && isCs(t, 'end')) {
        const c = new Cursor(toks.slice(i + 1, i + 40), t.pos);
        try {
          if (toksToPlain(c.group('\\end'), '\\end', t.pos) === end.name) return i + 1 + c.i;
        } catch { /* not this one */ }
      }
    }
    throw new TexError(start, end.kind === 'dollar' ? "'$' is never closed" : `\\begin{${end.name}} is never closed`);
  }

  private record(r: FormulaRecord): void {
    this.counts.formulas++;
    this.opts.formulas?.push(r);
  }

  private inlineMath(start: Pos): Inline {
    const m = this.math({ kind: 'dollar' }, start);
    const loc = this.loc(start);
    if ('failed' in m) {
      this.record({ loc, display: false, env: null, src: '', tex: '', mathml: '', problems: [m.failed] });
      return { t: 'math', src: '', tex: '', mathml: '', plain: '', loc };
    }
    const tex = m.rows[0].tex;
    if (tex === '') throw new TexError(start, 'empty mathematics $$ (display mathematics is written with equation or align)');
    const conv = convertTex(tex, false);
    this.record({ loc, display: false, env: null, src: m.src, tex, mathml: conv.mathml, problems: conv.problems });
    if (conv.problems.length && !this.opts.lenientMath) {
      throw new TexError(start, `formula $${m.src}$ does not convert: ${conv.problems.join('; ')}`, 'math');
    }
    return { t: 'math', src: m.src, tex, mathml: conv.mathml, plain: nodeText(conv.tree), loc, ...(m.numClaims.length ? { numClaims: m.numClaims } : {}) };
  }

  /** \\num[claim-id]{value}{unit} in text: set as mathematics, as print does. */
  private numNode(at: Pos): Inline {
    const cur = this.cur;
    const claim = readNumClaim(cur, this.env, at);
    const value = cur.group('\\num value');
    const unit = cur.group('\\num unit');
    // re-read "\num{value}{unit}" through the mathematics scanner, which knows \num
    const toks: Tok[] = [{ k: 'cs', name: 'num', pos: at }, { k: 'char', ch: '{', pos: at }, ...value, { k: 'char', ch: '}', pos: at },
      { k: 'char', ch: '{', pos: at }, ...unit, { k: 'char', ch: '}', pos: at }, { k: 'char', ch: '$', pos: at }];
    const loc = this.loc(at);
    const node = this.withCursor(toks, at, () => this.inlineMath(at));
    if (node.t !== 'math') throw new TexError(at, '\\num: internal error');
    return { t: 'num', claim, tex: node.tex, mathml: node.mathml, plain: node.plain, loc };
  }

  private display(envName: string, start: Pos): Block {
    const numbered = !envName.endsWith('*');
    const loc = this.loc(start);
    const m = this.math({ kind: 'env', name: envName }, start);
    if ('failed' in m) {
      this.record({ loc, display: true, env: envName, src: '', tex: '', mathml: '', problems: [m.failed] });
      return { t: 'display', env: envName, rows: [], src: '', tex: '', mathml: '', loc };
    }
    const isAlign = envName.startsWith('align');
    const rows: DisplayRow[] = [];
    for (const r of m.rows) {
      if (!numbered) {
        if (r.label) throw new TexError(r.label.pos, `\\label in the unnumbered display ${envName}`);
        if (r.notag) throw new TexError(start, `\\notag in the unnumbered display ${envName}`);
      } else if (isAlign) {
        if (!r.label && !r.notag) throw new TexError(start, 'align: every row carries a \\label or \\notag (contract section 5)');
        if (r.label && r.notag) throw new TexError(r.label.pos, 'align row with both \\label and \\notag');
      } else {
        if (!r.label) throw new TexError(start, 'a numbered display carries a \\label (contract section 5)');
        if (r.notag) throw new TexError(start, '\\notag in equation (use equation*)');
      }
      if (r.label) {
        if (!this.grammar('typed', r.label.id) || !r.label.id.includes('.eq.')) {
          throw new TexError(r.label.pos, `'${r.label.id}' is not an equation ID (cNN.eq.slug)`);
        }
        this.ownId(r.label.id, r.label.pos);
        this.declare(r.label.id, r.label.pos);
      }
      const number = r.label ? this.number(r.label.id, r.label.pos) : null;
      rows.push({ id: r.label?.id ?? null, number, claim: this.claim(r.claim) });
    }
    const numOf = new Map(m.rows.map((r, i) => [r, rows[i]]));
    const tex = displayTex(envName, m.rows, (r) => {
      const row = numOf.get(r)!;
      return row.id ? (row.number ?? '?') : null;
    });
    const conv = convertTex(tex, true);
    this.record({ loc, display: true, env: envName, src: m.src, tex, mathml: conv.mathml, problems: conv.problems });
    if (conv.problems.length) {
      if (!this.opts.lenientMath) throw new TexError(start, `display does not convert: ${conv.problems.join('; ')}`, 'math');
      return { t: 'display', env: envName, rows, src: m.src, tex, mathml: '', loc };
    }
    decorateDisplay(conv.tree, rows.map((r) => ({ id: r.id, number: r.number, claimTag: r.claim?.tag ?? null })), isAlign);
    return { t: 'display', env: envName, rows, src: m.src, tex, mathml: conv.tree.toMarkup(), loc, ...(m.numClaims.length ? { numClaims: m.numClaims } : {}) };
  }

  // ── inline ──────────────────────────────────────────────────
  private inlineGroup(toks: Tok[], at: Pos, what: string): Inline[] {
    return this.withCursor(trimToks(toks), at, () => {
      const out: Inline[] = [];
      while (!this.cur.eof()) {
        const t = this.cur.peek()!;
        if (t.k === 'par') throw new TexError(t.pos, `blank line inside ${what}`);
        if (isCs(t, 'begin') || isCs(t, 'end')) throw new TexError(t.pos, `environment inside ${what}`);
        out.push(...this.inline());
      }
      return normalize(out);
    });
  }

  private refNode(kind: 'ref' | 'eqref' | 'pageref', at: Pos): Inline {
    const target = toksToPlain(this.cur.group('\\' + kind), '\\' + kind, at);
    const g = this.env.contract.id_grammar;
    const isDef = new RegExp(g.definition).test(target);
    const ok = isDef || ['chapter', 'section', 'subsection', 'vertiefung', 'fundament', 'typed'].some((k) => new RegExp(g[k]).test(target));
    if (!ok) throw new TexError(at, `\\${kind}{${target}}: not an ID of the contract`);
    const chapter = isDef ? (this.opts.definitionHome.get(target) ?? '') : target.slice(0, 3);
    const own = chapter === this.meta.id;
    if (own) this.refs.push({ target, pos: at });
    const onSite = own || this.opts.siteChapters.has(chapter);
    const number = this.opts.numbers ? (this.opts.numbers.labels.get(target)?.number ?? null) : null;
    if (!own && !isDef && !this.meta.prerequisites.includes(chapter)) {
      throw new TexError(at, `\\${kind}{${target}} points into chapter ${chapter}, which is not in "prerequisites" of chapter.json`);
    }
    const external = !onSite || (this.opts.numbers !== null && number === null && !own);
    if (external) this.external.add(target);
    if (own && this.opts.numbers && number === null) {
      throw new TexError(at, `\\${kind}{${target}}: no such label in the print build (${this.opts.numbers.auxFile})`, 'numbering');
    }
    return { t: 'ref', kind, target, number, external, chapter };
  }

  private inline(): Inline[] {
    const cur = this.cur;
    const t = cur.next()!;
    switch (t.k) {
      case 'space': return [{ t: 'text', text: ' ' }];
      case 'par': throw new TexError(t.pos, 'unexpected blank line');
      case 'char': {
        if (t.ch === '$') return [this.inlineMath(t.pos)];
        if (t.ch === '~') return [{ t: 'text', text: ' ' }];
        if (t.ch === '-' && isChar(cur.peek(), '-')) {
          cur.next();
          if (isChar(cur.peek(), '-')) { cur.next(); return [{ t: 'text', text: '—' }]; }
          return [{ t: 'text', text: '–' }];
        }
        if ('{}&#^_\\'.includes(t.ch)) {
          throw new TexError(t.pos, `'${t.ch}' in text is not in the contract${t.ch === '{' || t.ch === '}' ? ' (no bare groups)' : ''}`);
        }
        return [{ t: 'text', text: t.ch }];
      }
      case 'sym': {
        if (t.name === '\\') throw new TexError(t.pos, '\\\\ in text (allowed only in mathematics and in tabular)');
        if (!this.symbols.has(t.name) || !(t.name in TEXT_SYMBOLS)) {
          throw new TexError(t.pos, `control symbol \\${t.name} is not in the contract${t.name === '[' || t.name === '(' ? ' (display mathematics is written with equation or align, inline with $...$)' : ''}`);
        }
        return [{ t: 'text', text: TEXT_SYMBOLS[t.name] }];
      }
      case 'cs': return this.inlineCs(t);
    }
  }

  private inlineCs(t: Extract<Tok, { k: 'cs' }>): Inline[] {
    const cur = this.cur;
    const name = t.name;
    switch (name) {
      case 'emph': return [{ t: 'emph', children: this.inlineGroup(cur.group('\\emph'), t.pos, '\\emph') }];
      case 'textbf': return [{ t: 'strong', children: this.inlineGroup(cur.group('\\textbf'), t.pos, '\\textbf') }];
      case 'dots': case 'ldots': return [{ t: 'text', text: '…' }];
      case 'num':
        if (!this.env.contract.text_macros.includes('num')) break;
        return [this.numNode(t.pos)];
      case 'ref': case 'eqref': case 'pageref': return [this.refNode(name, t.pos)];
      case 'tpcifenglish': {
        const en = cur.group('\\tpcifenglish');
        const de = cur.group('\\tpcifenglish');
        // A separate parser validates the unused branch without adding its references,
        // definitions or formulas to the rendered chapter. Nested branches are checked too.
        const unusedLang = this.lang === 'en' ? 'de' : 'en';
        const validator = new Parser(this.env, this.meta, unusedLang, this.file, [],
          { ...this.opts, formulas: undefined, lenientMath: false });
        validator.depth = this.depth;
        validator.nest = this.nest;
        validator.parsingDefinition = this.parsingDefinition;
        validator.inlineGroup(unusedLang === 'en' ? en : de, t.pos, '\\tpcifenglish');
        return this.inlineGroup(this.lang === 'en' ? en : de, t.pos, '\\tpcifenglish');
      }
      case 'zoomref': {
        const target = toksToPlain(cur.group('\\zoomref'), '\\zoomref', t.pos);
        const isV = this.grammar('vertiefung', target);
        const isF = this.grammar('fundament', target);
        if (!isV && !isF) throw new TexError(t.pos, `\\zoomref{${target}}: not the ID of a depth block (cNN.vK or cNN.fK)`);
        if (this.depth === 'fundament') throw new TexError(t.pos, '\\zoomref inside a Fundament block');
        if (this.depth === 'vertiefung' && !isF) throw new TexError(t.pos, '\\zoomref inside a Vertiefung may point only to a Fundament block');
        this.ownId(target, t.pos);
        this.refs.push({ target, pos: t.pos });
        let anchor: string | null = null;
        if (!this.zoomSeen.has(target)) {
          this.zoomSeen.add(target);
          anchor = `zoomfrom:${target}`;
          this.declare(anchor, t.pos);
        }
        const node: Extract<Inline, { t: 'zoomref' }> = {
          t: 'zoomref', target, number: this.number(target, t.pos) ?? '?', depth: isF ? 'fundament' : 'vertiefung', anchor, lead: '',
        };
        this.zoomNodes.push(node);
        return [node];
      }
      case 'defref': {
        const id = toksToPlain(cur.group('\\defref'), '\\defref', t.pos);
        const def = this.defs.get(id);
        if (!def) throw new TexError(t.pos, `\\defref{${id}}: no such definition in the registry`);
        if (this.depth === 'kern' && def.depth !== 'kern' && !this.parsingDefinition) {
          throw new TexError(t.pos, `\\defref{${id}}: Kern text cites a definition of depth ${def.depth} (K1)`);
        }
        const home = this.opts.definitionHome.get(id) ?? '';
        const own = home === this.meta.id;
        const number = this.opts.numbers ? (this.opts.numbers.labels.get(id)?.number ?? null) : null;
        const external = !(own || this.opts.siteChapters.has(home)) || (this.opts.numbers !== null && number === null);
        if (external) this.external.add(id);
        if (own) this.refs.push({ target: id, pos: t.pos });
        this.useDefinition(def, number);
        return [{ t: 'defref', id, number, external }];
      }
      case 'srcref': {
        const key = toksToPlain(cur.group('\\srcref'), '\\srcref key', t.pos);
        if (this.env.contract.source_key && !new RegExp(this.env.contract.source_key).test(key)) {
          throw new TexError(t.pos, `\\srcref{${key}}: not a source key (${this.env.contract.source_key})`);
        }
        const locus = this.inlineGroup(cur.group('\\srcref'), t.pos, '\\srcref');
        if (locus.length === 0) throw new TexError(t.pos, `\\srcref{${key}}{}: empty locus`);
        return [{ t: 'srcref', key, locus }];
      }
      case 'label':
        throw new TexError(t.pos, '\\label must come directly after the construct it names (contract section 2)');
      case 'claim':
        throw new TexError(t.pos, '\\claim must come directly after the \\label of the unit or equation it is about');
    }
    if (this.env.forbidden.has(name)) throw new TexError(t.pos, `\\${name} is forbidden in content files (contract section 10)`);
    if (this.env.contract.text_macros.includes(name)) throw new TexError(t.pos, `\\${name} is not allowed at this place`);
    if (this.env.macros.has(name) || this.env.mathAllowed.has(name)) {
      throw new TexError(t.pos, `\\${name} is a mathematics macro used in text (write $\\${name}$)`);
    }
    throw new TexError(t.pos, `\\${name} is not in the contract`);
  }

  private useDefinition(def: Definition, number: string | null): void {
    if (this.usedDefs.has(def.id)) return;
    // reserve first: a definition body may cite itself or others
    const entry = { id: def.id, number, name: [] as Inline[], children: [] as Block[] };
    this.usedDefs.set(def.id, entry);
    const body = this.definitionBody(def);
    entry.name = body.name;
    entry.children = body.children;
  }

  private definitionBody(def: Definition): { name: Inline[]; children: Block[] } {
    const at: Pos = { file: def.origin, line: 0, col: 0 };
    const savedIds = this.ids; const savedSeen = this.seen; const savedNest = this.nest; const savedDef = this.parsingDefinition;
    // a transcluded body declares no IDs of its own
    this.ids = []; this.seen = new Map(); this.nest = 1; this.parsingDefinition = true;
    try {
      const name = this.inlineGroup(def.nameToks[this.lang], at, 'a definition title');
      const children = this.withCursor(def.body[this.lang], at, () => this.blocks(null, {}));
      return { name, children };
    } finally {
      this.ids = savedIds; this.seen = savedSeen; this.nest = savedNest; this.parsingDefinition = savedDef;
    }
  }

  // ── blocks ──────────────────────────────────────────────────
  blocks(end: string | null, o: { items?: boolean }): Block[] {
    const cur = this.cur;
    const out: Block[] = [];
    let inl: Inline[] = [];
    let cont = false;
    let afterDisplay = false;
    const flush = () => {
      const c = normalize(inl);
      if (c.length) out.push({ t: 'para', cont, children: c });
      inl = []; cont = false;
    };
    const top = this.nest === 0;
    for (;;) {
      const t = cur.peek();
      if (!t) {
        if (end) throw new TexError(cur.endPos, `\\begin{${end}} is never closed`);
        flush();
        return out;
      }
      if (t.k === 'par') { cur.next(); flush(); afterDisplay = false; continue; }
      if (isCs(t, 'end')) {
        cur.next();
        const name = toksToPlain(cur.group('\\end'), '\\end', t.pos);
        if (name !== end) throw new TexError(t.pos, end ? `\\end{${name}} closes \\begin{${end}}` : `\\end{${name}} without \\begin`);
        flush();
        return out;
      }
      if (isCs(t, 'item')) {
        if (!o.items) throw new TexError(t.pos, '\\item outside a list');
        flush();
        return out;
      }
      if (top && this.seenFundament && !(isCs(t, 'begin')) && t.k !== 'space') {
        throw new TexError(t.pos, 'text after a Fundament block: Fundament blocks stand at the end of the chapter file (contract section 6)');
      }
      if (isCs(t, 'begin')) {
        cur.next();
        const name = toksToPlain(cur.group('\\begin'), '\\begin', t.pos);
        if (top && this.seenFundament && name !== 'fundament') {
          throw new TexError(t.pos, `\\begin{${name}} after a Fundament block: Fundament blocks stand at the end of the chapter file`);
        }
        if (this.env.contract.display_math.includes(name)) {
          flush();
          out.push(this.display(name, t.pos));
          afterDisplay = true;
          continue;
        }
        flush();
        afterDisplay = false;
        out.push(this.environment(name, t.pos));
        continue;
      }
      if (isCs(t, 'section') || isCs(t, 'subsection')) {
        const kind = isCs(t, 'section') ? 'section' : 'subsection';
        if (!top) throw new TexError(t.pos, `\\${kind} inside an environment`);
        cur.next();
        flush(); afterDisplay = false;
        out.push(this.heading(kind, t.pos));
        continue;
      }
      if (isCs(t, 'chapter')) throw new TexError(t.pos, '\\chapter is the first thing in the file, once');
      if (isCs(t, 'tpcdef')) {
        cur.next();
        flush(); afterDisplay = false;
        out.push(this.definition(t.pos));
        continue;
      }
      const nodes = this.inline();
      if (afterDisplay && inl.length === 0 && nodes.some((n) => !(n.t === 'text' && n.text.trim() === ''))) { cont = true; afterDisplay = false; }
      inl.push(...nodes);
    }
  }

  private heading(kind: 'section' | 'subsection', at: Pos): Block {
    if (this.depth !== 'kern') throw new TexError(at, `\\${kind} inside a depth block`);
    const title = this.inlineGroup(this.cur.group('\\' + kind), at, 'a heading');
    const lab = this.labelAfter(kind, at);
    if (!lab) throw new TexError(at, `\\${kind} without \\label (contract section 2)`);
    if (!this.grammar(kind, lab.id)) throw new TexError(lab.pos, `'${lab.id}' is not a ${kind} ID`);
    this.ownId(lab.id, lab.pos);
    this.declare(lab.id, lab.pos);
    return { t: 'heading', level: kind === 'section' ? 2 : 3, id: lab.id, number: this.number(lab.id, lab.pos) ?? '?', title, loc: this.loc(at) };
  }

  private definition(at: Pos): Block {
    const id = toksToPlain(this.cur.group('\\tpcdef'), '\\tpcdef', at);
    const def = this.defs.get(id);
    if (!def) throw new TexError(at, `\\tpcdef{${id}}: definition '${id}' is not in the registry`);
    if (def.depth !== this.depth) {
      throw new TexError(at, `\\tpcdef{${id}}: the definition has depth ${def.depth} but is transcluded at depth ${this.depth}`);
    }
    this.declare(id, at);
    const number = this.number(id, at);
    const body = this.definitionBody(def);
    if (!this.usedDefs.has(id)) this.usedDefs.set(id, { id, number, name: body.name, children: body.children });
    return { t: 'definition', id, number: number ?? '?', depth: def.depth, name: body.name, children: body.children, loc: this.loc(at) };
  }

  private nested<T>(f: () => T): T {
    this.nest++;
    try { return f(); } finally { this.nest--; }
  }

  private environment(name: string, at: Pos): Block {
    const c = this.env.contract;
    if (name in c.numbered_units || c.unnumbered_units.includes(name)) return this.unit(name, at);
    if (c.boxes.includes(name)) return this.box(name, at);
    if (c.lists.includes(name)) return this.list(name as 'itemize' | 'enumerate' | 'description', at);
    if (name in c.depth_blocks) return this.depthBlock(name as 'vertiefung' | 'fundament', at);
    if (name === 'tpcfigure') return this.figure(at);
    if (name === 'tpctable') return this.table(at);
    if (c.table_envs.includes(name)) throw new TexError(at, `\\begin{${name}} outside tpctable`);
    if (c.inner_math.includes(name)) throw new TexError(at, `\\begin{${name}} outside mathematics`);
    if (c.forbidden_environments_named.includes(name)) {
      throw new TexError(at, `environment '${name}' is forbidden in content files (contract section 10)`);
    }
    throw new TexError(at, `environment '${name}' is not in the contract`);
  }

  private unit(name: string, at: Pos): Block {
    const c = this.env.contract;
    const numbered = name in c.numbered_units;
    const opt = this.cur.optional(`\\begin{${name}}`);
    const title = opt ? this.inlineGroup(opt, at, 'a unit name') : null;
    const lab = this.labelAfter(name, at);
    let id: string | null = null;
    let number: string | null = null;
    if (numbered) {
      if (!lab) throw new TexError(at, `\\begin{${name}} without \\label: a numbered unit carries one (contract section 2)`);
      const kind = c.numbered_units[name];
      if (!this.grammar('typed', lab.id) || lab.id.split('.')[1] !== kind) {
        throw new TexError(lab.pos, `'${lab.id}' is not a ${name} ID (cNN.${kind}.slug)`);
      }
      this.ownId(lab.id, lab.pos);
      this.declare(lab.id, lab.pos);
      id = lab.id;
      number = this.number(lab.id, lab.pos);
    } else if (lab) {
      throw new TexError(lab.pos, `\\label on the unnumbered unit ${name}`);
    }
    const claim = this.claimAfter();
    if (claim && !numbered) throw new TexError(claim.pos, `\\claim on the unnumbered unit ${name}`);
    const theoremLike = c.theorem_like;
    if (theoremLike) {
      if (theoremLike.includes(name) && !claim) throw new TexError(at, `\\begin{${name}}: a theorem-like unit carries exactly one \\claim directly after its \\label (contract section 4)`);
      if (claim && claim.presentation !== null && !theoremLike.includes(name)) throw new TexError(claim.pos, `\\claim[${claim.presentation}]: a presentation is admitted only on a theorem-like unit, not on ${name}`);
    }
    const cl = this.claim(claim);
    const children = this.nested(() => this.blocks(name, {}));
    return { t: 'unit', env: name, numbered, id, number, name: title, claim: cl, children, loc: this.loc(at) };
  }

  private box(name: string, at: Pos): Block {
    const opt = this.cur.optional(`\\begin{${name}}`);
    const title = opt ? this.inlineGroup(opt, at, 'a box title') : null;
    const children = this.nested(() => this.blocks(name, {}));
    return { t: 'box', env: name, title, children, loc: this.loc(at) };
  }

  private list(name: 'itemize' | 'enumerate' | 'description', at: Pos): Block {
    const cur = this.cur;
    const items: Array<{ label: Inline[] | null; children: Block[] }> = [];
    return this.nested(() => {
      cur.skipBlank();
      for (;;) {
        const t = cur.peek();
        if (!t) throw new TexError(at, `\\begin{${name}} is never closed`);
        if (isCs(t, 'end')) {
          cur.next();
          const n = toksToPlain(cur.group('\\end'), '\\end', t.pos);
          if (n !== name) throw new TexError(t.pos, `\\end{${n}} closes \\begin{${name}}`);
          break;
        }
        if (!isCs(t, 'item')) throw new TexError(t.pos, `text before the first \\item of ${name}`);
        cur.next();
        const opt = cur.optional('\\item');
        if (name === 'description' && !opt) throw new TexError(t.pos, 'description: \\item needs a label, \\item[...]');
        const label = opt ? this.inlineGroup(opt, t.pos, 'an item label') : null;
        const children = this.blocks(name, { items: true });
        items.push({ label, children });
        // blocks() consumed \end{name} if it met it: detect by looking back
        const prev = cur.toks[cur.i - 1];
        if (!isCs(cur.peek(), 'item') && isChar(prev, '}')) break;
      }
      if (items.length === 0) throw new TexError(at, `${name} without \\item`);
      return { t: 'list', env: name, items };
    });
  }

  private depthBlock(kind: 'vertiefung' | 'fundament', at: Pos): Block {
    if (this.nest > 0) throw new TexError(at, `${kind} inside another environment (contract section 6)`);
    if (this.depth !== 'kern') throw new TexError(at, 'nested depth block: a block may not contain another one');
    const opt = this.cur.optional(`\\begin{${kind}}`);
    if (!opt) throw new TexError(at, `\\begin{${kind}} without its keys [id=..., titel=..., wozu=..., voraussetzung=..., zurueck=...]`);
    const keys = this.keyvals(opt, at);
    const want = this.env.contract.depth_keys;
    for (const k of keys.keys()) if (!want.includes(k)) throw new TexError(at, `${kind}: unknown key '${k}' (keys: ${want.join(', ')})`);
    for (const k of want) if (!keys.has(k) || trimToks(keys.get(k)!).length === 0) throw new TexError(at, `${kind}: missing key '${k}' (all five keys are mandatory)`);
    const id = toksToPlain(keys.get('id')!, 'depth block id', at);
    if (!this.grammar(kind, id)) throw new TexError(at, `'${id}' is not a ${kind} ID (cNN.${this.env.contract.depth_blocks[kind]}K)`);
    this.ownId(id, at);
    this.declare(id, at);
    if (kind === 'fundament') this.seenFundament = true;
    this.counts[kind]++;
    this.depth = kind;
    try {
      const part = (k: string) => this.inlineGroup(keys.get(k)!, at, `key ${k}`);
      const titel = part('titel'); const wozu = part('wozu'); const voraussetzung = part('voraussetzung'); const zurueck = part('zurueck');
      this.leads.set(id, plainText(wozu));
      const children = this.nested(() => this.blocks(kind, {}));
      let from: { text: string; anchor: string } | null = null;
      const zf = this.opts.numbers?.labels.get(`zoomfrom:${id}`);
      if (zf) from = { text: zf.number, anchor: `zoomfrom:${id}` };
      return { t: 'depth', kind, id, number: this.number(id, at) ?? '?', titel, wozu, voraussetzung, zurueck, from, children, loc: this.loc(at) };
    } finally {
      this.depth = 'kern';
    }
  }

  /** key=value list: split at top-level commas; a value in braces loses the braces. */
  private keyvals(toks: Tok[], at: Pos): Map<string, Tok[]> {
    const parts: Tok[][] = [[]];
    let depth = 0;
    for (const t of toks) {
      if (isChar(t, '{')) depth++;
      else if (isChar(t, '}')) depth--;
      if (isChar(t, ',') && depth === 0) parts.push([]);
      else parts[parts.length - 1].push(t);
    }
    const m = new Map<string, Tok[]>();
    for (const p of parts) {
      const q = trimToks(p);
      if (q.length === 0) continue;
      const eq = q.findIndex((t) => isChar(t, '='));
      if (eq < 0) throw new TexError(q[0].pos, 'depth block keys: expected key=value');
      const key = toksToPlain(q.slice(0, eq), 'key name', q[0].pos);
      let val = trimToks(q.slice(eq + 1));
      if (val.length >= 2 && isChar(val[0], '{')) {
        // strip one pair of braces if it encloses the whole value
        let d = 0; let whole = true;
        for (let i = 0; i < val.length; i++) {
          if (isChar(val[i], '{')) d++;
          else if (isChar(val[i], '}')) { d--; if (d === 0 && i < val.length - 1) { whole = false; break; } }
        }
        if (whole) val = val.slice(1, -1);
      }
      if (m.has(key)) throw new TexError(q[0].pos, `depth block key '${key}' given twice`);
      m.set(key, val);
    }
    return m;
  }

  private figure(at: Pos): Block {
    const cur = this.cur;
    const id = toksToPlain(cur.group('\\begin{tpcfigure}'), 'figure ID', at);
    if (!this.grammar('typed', id) || id.split('.')[1] !== 'fig') throw new TexError(at, `'${id}' is not a figure ID (cNN.fig.slug)`);
    this.ownId(id, at);
    this.declare(id, at);
    const asset = this.meta.assets.find((a) => a.id === id);
    if (!asset || asset.kind !== 'figure') throw new TexError(at, `figure ${id} is not declared in chapter.json (assets, kind "figure")`);
    const rel = asset.file ?? `figures/${id.split('.').slice(2).join('.')}.tex`;
    const file = path.join(this.meta.absDir, rel);
    if (!fs.existsSync(file)) throw new TexError(at, `figure ${id}: file ${rel} not found in ${this.meta.dir}`);
    let demo: string | null = null;
    let caption: Inline[] | null = null;
    for (;;) {
      cur.skipBlank();
      const t = cur.next();
      if (!t) throw new TexError(at, '\\begin{tpcfigure} is never closed');
      if (isCs(t, 'end')) {
        const n = toksToPlain(cur.group('\\end'), '\\end', t.pos);
        if (n !== 'tpcfigure') throw new TexError(t.pos, `\\end{${n}} closes \\begin{tpcfigure}`);
        break;
      }
      if (isCs(t, 'demo')) {
        if (demo) throw new TexError(t.pos, 'tpcfigure: at most one \\demo');
        demo = toksToPlain(cur.group('\\demo'), '\\demo', t.pos);
        if (!this.grammar('typed', demo) || demo.split('.')[1] !== 'demo') throw new TexError(t.pos, `'${demo}' is not a demo ID (cNN.demo.slug)`);
        const d = this.meta.assets.find((a) => a.id === demo);
        if (!d || (d.kind !== 'demo' && d.kind !== 'game')) throw new TexError(t.pos, `demo ${demo} is not declared in chapter.json (assets, kind "demo" or "game")`);
        if (d.still !== id) throw new TexError(t.pos, `demo ${demo}: chapter.json says its still is ${d.still}, the text puts it into ${id}`);
        this.ownId(demo, t.pos);
        this.declare(demo, t.pos);
        this.demos.push({ id: demo, still: id, kind: d.kind, title: d.title?.[this.lang] ?? demo });
        this.counts.demos++;
        continue;
      }
      if (isCs(t, 'caption')) {
        if (caption) throw new TexError(t.pos, 'tpcfigure: exactly one \\caption');
        caption = this.inlineGroup(cur.group('\\caption'), t.pos, 'a caption');
        continue;
      }
      throw new TexError(t.pos, 'tpcfigure contains only \\demo{...} and \\caption{...}; the picture is the file in figures/ (contract section 8)');
    }
    if (!caption) throw new TexError(at, 'tpcfigure without \\caption');
    this.counts.figures++;
    return { t: 'figure', id, number: this.number(id, at) ?? '?', file: relToRoot(this.env.paths, file), demo, caption, alt: plainText(caption), loc: this.loc(at) };
  }

  private table(at: Pos): Block {
    const cur = this.cur;
    const id = toksToPlain(cur.group('\\begin{tpctable}'), 'table ID', at);
    if (!this.grammar('typed', id) || id.split('.')[1] !== 'tab') throw new TexError(at, `'${id}' is not a table ID (cNN.tab.slug)`);
    this.ownId(id, at);
    this.declare(id, at);
    const asset = this.meta.assets.find((a) => a.id === id);
    if (!asset || asset.kind !== 'table') throw new TexError(at, `table ${id} is not declared in chapter.json (assets, kind "table")`);
    let caption: Inline[] | null = null;
    let colspec: string[] | null = null;
    const rows: Array<{ rule: 'top' | 'mid' | 'bottom' } | { cells: Inline[][] }> = [];
    for (;;) {
      cur.skipBlank();
      const t = cur.next();
      if (!t) throw new TexError(at, '\\begin{tpctable} is never closed');
      if (isCs(t, 'end')) {
        const n = toksToPlain(cur.group('\\end'), '\\end', t.pos);
        if (n !== 'tpctable') throw new TexError(t.pos, `\\end{${n}} closes \\begin{tpctable}`);
        break;
      }
      if (isCs(t, 'caption')) {
        if (caption) throw new TexError(t.pos, 'tpctable: exactly one \\caption');
        caption = this.inlineGroup(cur.group('\\caption'), t.pos, 'a caption');
        continue;
      }
      if (isCs(t, 'begin')) {
        const n = toksToPlain(cur.group('\\begin'), '\\begin', t.pos);
        if (!this.env.contract.table_envs.includes(n)) throw new TexError(t.pos, `tpctable contains \\caption and one tabular, not '${n}'`);
        if (colspec) throw new TexError(t.pos, 'tpctable: one tabular');
        const spec = toksToPlain(cur.group('\\begin{tabular}'), 'column specification', t.pos).replace(/\s+/g, '');
        if (!/^[lcr]+$/.test(spec)) throw new TexError(t.pos, `tabular column specification '${spec}': only l, c, r are in the contract`);
        colspec = [...spec];
        this.tabularRows(n, colspec.length, rows, t.pos);
        continue;
      }
      throw new TexError(t.pos, 'tpctable contains only \\caption{...} and a tabular');
    }
    if (!caption) throw new TexError(at, 'tpctable without \\caption');
    if (!colspec) throw new TexError(at, 'tpctable without tabular');
    return { t: 'table', id, number: this.number(id, at) ?? '?', caption, colspec, rows, loc: this.loc(at) };
  }

  private tabularRows(envName: string, ncol: number, rows: Array<{ rule: 'top' | 'mid' | 'bottom' } | { cells: Inline[][] }>, at: Pos): void {
    const cur = this.cur;
    let cells: Tok[][] = [[]];
    let depth = 0;
    let inMath = false;
    const closeRow = (pos: Pos, explicit: boolean) => {
      const empty = cells.length === 1 && trimToks(cells[0]).length === 0;
      if (empty && !explicit) { cells = [[]]; return; }
      if (cells.length !== ncol) throw new TexError(pos, `tabular row has ${cells.length} cell(s), the column specification has ${ncol}`);
      rows.push({ cells: cells.map((c) => this.inlineGroup(c, pos, 'a table cell')) });
      cells = [[]];
    };
    const rules: Record<string, 'top' | 'mid' | 'bottom'> = { toprule: 'top', midrule: 'mid', bottomrule: 'bottom' };
    for (;;) {
      const t = cur.next();
      if (!t) throw new TexError(at, `\\begin{${envName}} is never closed`);
      if (isChar(t, '{')) depth++;
      else if (isChar(t, '}')) depth--;
      else if (isChar(t, '$') && depth === 0) inMath = !inMath;
      if (depth === 0 && !inMath) {
        if (isCs(t, 'end')) {
          const n = toksToPlain(cur.group('\\end'), '\\end', t.pos);
          if (n !== envName) throw new TexError(t.pos, `\\end{${n}} closes \\begin{${envName}}`);
          closeRow(t.pos, false);
          return;
        }
        if (t.k === 'cs' && t.name in rules) {
          if (trimToks(cells[0]).length || cells.length > 1) throw new TexError(t.pos, `\\${t.name} in the middle of a row`);
          rows.push({ rule: rules[t.name] });
          continue;
        }
        if (isChar(t, '&')) { cells.push([]); continue; }
        if (t.k === 'sym' && t.name === '\\') { closeRow(t.pos, true); continue; }
        if (t.k === 'par') continue;
      }
      cells[cells.length - 1].push(t);
    }
  }

  fragment(): void {
    this.nest = 1;
    this.parsingDefinition = true;
    this.blocks(null, {});
  }

  // ── chapter ─────────────────────────────────────────────────
  chapter(): ChapterIR {
    const cur = this.cur;
    cur.skipBlank();
    const t = cur.next();
    if (!t || !isCs(t, 'chapter')) throw new TexError(t?.pos ?? cur.endPos, 'a chapter file starts with \\chapter{Titel}\\label{cNN}');
    const title = this.inlineGroup(cur.group('\\chapter'), t.pos, 'the chapter title');
    const lab = this.labelAfter('chapter', t.pos);
    if (!lab || lab.id !== this.meta.id) throw new TexError(lab?.pos ?? t.pos, `\\chapter must be followed by \\label{${this.meta.id}}`);
    this.declare(lab.id, lab.pos);
    const titlePlain = plainText(title);
    if (this.meta.title?.[this.lang] !== undefined && this.meta.title[this.lang] !== titlePlain) {
      throw new TexError(t.pos, `chapter title ${JSON.stringify(titlePlain)} differs from chapter.json title.${this.lang} ${JSON.stringify(this.meta.title[this.lang])}`);
    }
    const number = this.number(lab.id, lab.pos) ?? String(Number(this.meta.id.slice(1)));
    const children = this.blocks(null, {});
    for (const r of this.refs) {
      if (!this.seen.has(r.target)) throw new TexError(r.pos, `reference to '${r.target}', which this chapter does not define`);
    }
    for (const z of this.zoomNodes) z.lead = this.leads.get(z.target) ?? '';
    // every demo and figure of chapter.json is used, and nothing else (contract section 11)
    for (const a of this.meta.assets) {
      if ((a.kind === 'figure' || a.kind === 'table' || a.kind === 'demo' || a.kind === 'game') && !this.seen.has(a.id)) {
        throw new TexError(t.pos, `chapter.json declares ${a.kind} ${a.id}, which ${this.lang}.tex does not use`);
      }
    }
    const nums = this.opts.numbers;
    return {
      schema: 1, id: this.meta.id, dir: this.meta.dir, lang: this.lang, number, title, titlePlain,
      converter: MATH_CONVERTER,
      print: nums ? { aux: relToRoot(this.env.paths, nums.auxFile), finished: nums.finished } : null,
      ids: this.ids, counts: this.counts, demos: this.demos,
      definitions: [...this.usedDefs.values()],
      externalRefs: [...this.external].sort(),
      children,
    };
  }
}

export function parseChapter(env: Env, meta: ChapterMeta, lang: Lang, opts: ParseOptions): ChapterIR {
  const abs = path.join(meta.absDir, `${lang}.tex`);
  if (!fs.existsSync(abs)) throw new Error(`${abs}: missing`);
  const file = relToRoot(env.paths, abs);
  const toks = tokenize(fs.readFileSync(abs, 'utf8'), file);
  const p = new Parser(env, meta, lang, file, toks, opts);
  const ir = p.chapter();
  if (opts.numbers) {
    // the other direction: every label the print build has for this chapter exists in the source
    const mine = new Set(ir.ids);
    for (const id of opts.numbers.labels.keys()) {
      if (id.startsWith(meta.id + '.') && !mine.has(id)) {
        throw new TexError({ file, line: 1, col: 1 }, `the print build has label '${id}', which ${file} no longer defines: stale print build`, 'numbering');
      }
    }
  }
  return ir;
}

/**
 * Parse a detached piece of content (a registry definition body) for its formulas only.
 * Used by the formula corpus; IDs and numbers play no role.
 */
export function parseFragment(env: Env, toks: Tok[], origin: string, lang: Lang, formulas: FormulaRecord[]): void {
  const meta: ChapterMeta = { id: 'c00', slug: 'fragment', dir: 'c00-fragment', absDir: env.paths.content, title: { de: '', en: '' }, prerequisites: [], assets: [] };
  const p = new Parser(env, meta, lang, origin, toks.slice(), { numbers: null, siteChapters: new Set(), definitionHome: new Map(), formulas, lenientMath: true });
  p.fragment();
}

/** Chapter that transcludes each definition (\tpcdef), by token scan of the chapter files. */
export function definitionHomes(env: Env, metas: ChapterMeta[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const meta of metas) {
    const abs = path.join(meta.absDir, 'de.tex');
    const cur = new Cursor(tokenize(fs.readFileSync(abs, 'utf8'), abs), { file: abs, line: 0, col: 0 });
    while (!cur.eof()) {
      const t = cur.next()!;
      if (isCs(t, 'tpcdef')) m.set(toksToPlain(cur.group('\\tpcdef'), '\\tpcdef', t.pos), meta.id);
    }
  }
  return m;
}

/** Number of depth blocks in a source file, counted on tokens (independent of the parser). */
export function countDepthBlocks(file: string): { vertiefung: number; fundament: number } {
  const cur = new Cursor(tokenize(fs.readFileSync(file, 'utf8'), file), { file, line: 0, col: 0 });
  const c = { vertiefung: 0, fundament: 0 };
  while (!cur.eof()) {
    const t = cur.next()!;
    if (!isCs(t, 'begin')) continue;
    let name = '';
    try { name = toksToPlain(cur.group('\\begin'), '\\begin', t.pos); } catch { continue; }
    if (name === 'vertiefung' || name === 'fundament') c[name]++;
  }
  return c;
}
