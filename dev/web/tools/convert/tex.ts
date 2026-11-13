// Tokenizer for the contract's TeX subset, and the token cursor the parsers share.
// Every token carries file, line and column; every failure is a TexError with that locus.

export interface Pos { file: string; line: number; col: number }

export type Tok =
  | ({ k: 'cs'; name: string } & TokExtra)      // control word: \name
  | ({ k: 'sym'; name: string } & TokExtra)     // control symbol: \, \\ \{ ...  (name = the character)
  | ({ k: 'char'; ch: string } & TokExtra)      // any other character, including { } [ ] $ & ~ ^ _ #
  | ({ k: 'space' } & TokExtra)
  | ({ k: 'par' } & TokExtra);

interface TokExtra {
  pos: Pos;
  /** macro names in whose expansion this token arose (mathematics only): not expanded again */
  noexp?: ReadonlySet<string>;
  /** token comes from a registry or style expansion, not from the content file */
  trusted?: boolean;
}

export class TexError extends Error {
  constructor(public pos: Pos, public detail: string, public code = 'contract') {
    super(`${pos.file}:${pos.line}:${pos.col}: ${detail}`);
  }
}

const isLetter = (c: string) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');

export function tokenize(src: string, file: string, opts: { atLetter?: boolean } = {}): Tok[] {
  const toks: Tok[] = [];
  let i = 0, line = 1, col = 1;
  let atLineStart = true;
  const n = src.length;
  const letter = (c: string) => isLetter(c) || (opts.atLetter === true && c === '@');
  const last = () => toks[toks.length - 1];
  const pushSpace = (pos: Pos) => {
    const l = last();
    if (l && (l.k === 'space' || l.k === 'par')) return;
    toks.push({ k: 'space', pos });
  };
  const pushPar = (pos: Pos) => {
    const l = last();
    if (l && l.k === 'par') return;
    if (l && l.k === 'space') toks.pop();
    toks.push({ k: 'par', pos });
  };
  const adv = () => {
    const c = src[i++];
    if (c === '\n') { line++; col = 1; } else col++;
    return c;
  };
  while (i < n) {
    const c = src[i];
    const pos: Pos = { file, line, col };
    if (atLineStart) {
      if (c === ' ' || c === '\t' || c === '\r') { adv(); continue; }
      if (c === '\n') { adv(); pushPar(pos); continue; }
      atLineStart = false;
    }
    if (c === '\n') { adv(); pushSpace(pos); atLineStart = true; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { adv(); pushSpace(pos); continue; }
    if (c === '%') {
      while (i < n && src[i] !== '\n') adv();
      if (i < n) adv();
      atLineStart = true;
      continue;
    }
    if (c === '\\') {
      adv();
      if (i >= n) throw new TexError(pos, 'backslash at end of file');
      const d = src[i];
      if (letter(d)) {
        let name = '';
        while (i < n && letter(src[i])) name += adv();
        toks.push({ k: 'cs', name, pos });
        // TeX skips blanks after a control word (a single line end counts as a blank).
        while (i < n && (src[i] === ' ' || src[i] === '\t' || src[i] === '\r')) adv();
        if (i < n && src[i] === '\n') {
          // look ahead: a blank line after the line end is still a paragraph break
          let j = i + 1;
          while (j < n && (src[j] === ' ' || src[j] === '\t' || src[j] === '\r')) j++;
          if (j < n && src[j] !== '\n') { adv(); atLineStart = true; }
        }
        continue;
      }
      adv();
      if (d === '\n') { toks.push({ k: 'sym', name: ' ', pos }); atLineStart = true; continue; }
      toks.push({ k: 'sym', name: d, pos });
      continue;
    }
    // one Unicode code point
    const cp = src.codePointAt(i)!;
    const ch = String.fromCodePoint(cp);
    for (let k = 0; k < ch.length; k++) adv();
    toks.push({ k: 'char', ch, pos });
  }
  return toks;
}

export const isChar = (t: Tok | undefined, ch: string): boolean => !!t && t.k === 'char' && t.ch === ch;
export const isCs = (t: Tok | undefined, name?: string): boolean =>
  !!t && t.k === 'cs' && (name === undefined || t.name === name);

export function tokText(t: Tok): string {
  switch (t.k) {
    case 'cs': return '\\' + t.name;
    case 'sym': return '\\' + t.name;
    case 'char': return t.ch;
    case 'space': return ' ';
    case 'par': return '\n\n';
  }
}

/** Source-like text of a token list (control words followed by a blank where needed). */
export function toksToTex(toks: readonly Tok[]): string {
  let out = '';
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    out += tokText(t);
    if (t.k === 'cs') {
      const nx = toks[i + 1];
      if (nx && nx.k === 'char' && isLetter(nx.ch)) out += ' ';
    }
  }
  return out;
}

/** Plain characters of a token list; fails on anything that is not a character. */
export function toksToPlain(toks: readonly Tok[], what: string, at: Pos): string {
  let s = '';
  for (const t of toks) {
    if (t.k === 'char') s += t.ch;
    else if (t.k === 'space') s += ' ';
    else throw new TexError(t.pos ?? at, `${what}: expected plain characters, found ${tokText(t).trim() || 'a paragraph break'}`);
  }
  return s.trim();
}

export class Cursor {
  i = 0;
  constructor(public toks: Tok[], public endPos: Pos) {}
  peek(o = 0): Tok | undefined { return this.toks[this.i + o]; }
  next(): Tok | undefined { return this.toks[this.i++]; }
  eof(): boolean { return this.i >= this.toks.length; }
  pos(): Pos { return this.toks[this.i]?.pos ?? this.endPos; }
  skipSpaces(): void { while (this.peek()?.k === 'space') this.i++; }
  skipBlank(): void { while (this.peek() && (this.peek()!.k === 'space' || this.peek()!.k === 'par')) this.i++; }
  /** Put tokens in front of the cursor (macro expansion). */
  unshift(toks: Tok[]): void { this.toks.splice(this.i, 0, ...toks); }

  /** Balanced {...}: returns the tokens between the braces. */
  group(what: string): Tok[] {
    this.skipSpaces();
    const open = this.next();
    if (!isChar(open, '{')) throw new TexError(open?.pos ?? this.endPos, `${what}: expected '{'`);
    const start = this.i;
    let depth = 1;
    while (!this.eof()) {
      const t = this.next()!;
      if (isChar(t, '{')) depth++;
      else if (isChar(t, '}')) { depth--; if (depth === 0) return this.toks.slice(start, this.i - 1); }
    }
    throw new TexError(open!.pos, `${what}: '{' is never closed`);
  }

  /** Optional [...] directly ahead (blanks allowed before it): tokens inside, or null. */
  optional(what: string): Tok[] | null {
    let j = this.i;
    while (this.toks[j]?.k === 'space') j++;
    if (!isChar(this.toks[j], '[')) return null;
    const open = this.toks[j];
    this.i = j + 1;
    const start = this.i;
    let depth = 0;
    while (!this.eof()) {
      const t = this.next()!;
      if (isChar(t, '{')) depth++;
      else if (isChar(t, '}')) depth--;
      else if (isChar(t, ']') && depth === 0) return this.toks.slice(start, this.i - 1);
    }
    throw new TexError(open.pos, `${what}: '[' is never closed`);
  }

  /** One undelimited macro argument: a brace group or a single token. */
  arg(what: string): Tok[] {
    this.skipSpaces();
    const t = this.peek();
    if (!t) throw new TexError(this.endPos, `${what}: missing argument`);
    if (isChar(t, '{')) return this.group(what);
    if (isChar(t, '}')) throw new TexError(t.pos, `${what}: missing argument`);
    this.i++;
    return [t];
  }
}

export function trimToks(toks: Tok[]): Tok[] {
  let a = 0, b = toks.length;
  while (a < b && (toks[a].k === 'space' || toks[a].k === 'par')) a++;
  while (b > a && (toks[b - 1].k === 'space' || toks[b - 1].k === 'par')) b--;
  return toks.slice(a, b);
}
