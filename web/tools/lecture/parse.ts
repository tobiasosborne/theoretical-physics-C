// A lecture file (latex/lectures/de/vlNN.tex, en/lecNN.tex) -> HTML.
//
// The lecture files are the single source of the PDF script and of the web pages. This
// parser knows the constructs the lectures actually use and stops with file:line on
// anything else, so that a new construct is added here on purpose and never dropped
// silently. Web-only material in a lecture file:
//
//   \webdemo{c03.demo.vollst}{caption}     an interactive figure (nothing in print)
//   \webdemo[fig_vl03_vollst]{c03.demo.vollst}{caption}
//                                          the same, and on the web it takes the place of
//                                          the static figure fig_vl03_vollst of this lecture
//   \begin{webonly} ... \end{webonly}      prose and unnumbered displays for the web only
//
// Numbers (equations N.k, sections N.k, examples N.k ...) are counted here in the same way
// as LaTeX counts them; numbered displays inside webonly are refused, so the numbers of
// the web page and of the PDF agree.
import temml from 'temml';
import type { Lang } from '../paths.ts';

export interface LabelInfo { number: string; lecture: number; anchor: string }
export interface TocEntry { level: 2 | 3; id: string; number: string; html: string }

export interface LectureCtx {
  lang: Lang;
  n: number;
  file: string;
  src: string;
  macros: Record<string, string>;
  demoCatalog: Record<string, { kind: string; title: Record<Lang, string> }>;
  figureSize: (name: string) => { file: string; width: number; height: number };
  stillSize: (id: string) => { width: number; height: number };
  // results
  title: string;
  labels: Map<string, LabelInfo>;
  toc: TocEntry[];
  figures: string[];
  demos: string[];
  /** figures that a \\webdemo[fig_...] replaces on the web page */
  replaced: string[];
  counters: Record<string, number>;
  webonly: number;
}

const WORDS: Record<string, Record<Lang, string>> = {
  example: { de: 'Beispiel', en: 'Example' },
  exercise: { de: 'Übung', en: 'Exercise' },
  definition: { de: 'Definition', en: 'Definition' },
  theorem: { de: 'Satz', en: 'Theorem' },
  lemma: { de: 'Lemma', en: 'Lemma' },
  proposition: { de: 'Proposition', en: 'Proposition' },
  corollary: { de: 'Korollar', en: 'Corollary' },
  proof: { de: 'Beweis', en: 'Proof' },
  remark: { de: 'Bemerkung', en: 'Remark' },
  solution: { de: 'Lösung', en: 'Solution' },
  historical: { de: 'Historische Notiz', en: 'Historical note' },
  interactive: { de: 'Interaktiv', en: 'Interactive' },
  figureAlt: { de: 'Abbildung zur Vorlesung', en: 'Figure of lecture' },
};

// environment -> [kind, counter]; an empty counter means unnumbered
const UNITS: Record<string, [string, string]> = {
  beispiel: ['example', 'example'], example: ['example', 'example'],
  'übung': ['exercise', 'exercise'], uebung: ['exercise', 'exercise'], exercise: ['exercise', 'exercise'],
  definition: ['definition', 'definition'],
  theorem: ['theorem', 'theorem'], lemma: ['lemma', 'theorem'], proposition: ['proposition', 'theorem'],
  corollary: ['corollary', 'theorem'],
  proof: ['proof', ''], remark: ['remark', ''], solution: ['solution', ''],
  'lösung': ['solution', ''], loesung: ['solution', ''],
};
const BOXES = ['merksatz', 'greybox', 'intuition', 'historical'];
const DISPLAYS = ['equation', 'equation*', 'align', 'align*', 'gather', 'gather*'];

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Strip TeX comments. A comment-only line becomes the single character U+0003, which the
 * parser treats as white space: the line count stays (for error messages) and the line is
 * no paragraph break, as in TeX.
 */
export function stripComments(src: string): string {
  return src.split('\n').map((l) => (/^\s*%/.test(l) ? '\u0003' : l.replace(/(^|[^\\])%.*$/, '$1'))).join('\n');
}

/** Macros for Temml from \newcommand / \providecommand / \DeclareMathOperator lines of a style file. */
export function styleMacros(text: string, into: Record<string, string>): void {
  const re = /\\(newcommand|renewcommand|providecommand|DeclareMathOperator\*?)\s*\{?\\([A-Za-z]+)\}?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const kind = m[1], name = '\\' + m[2];
    let i = re.lastIndex;
    let optional = false;
    const mArgs = /^\s*\[(\d)\]/.exec(text.slice(i));
    if (mArgs) { i += mArgs[0].length; if (/^\s*\[/.test(text.slice(i))) optional = true; }
    while (text[i] === ' ') i++;
    if (text[i] !== '{' || optional) continue;
    let depth = 0, j = i;
    for (; j < text.length; j++) {
      if (text[j] === '\\') { j++; continue; }
      if (text[j] === '{') depth++;
      else if (text[j] === '}') { depth--; if (depth === 0) break; }
    }
    const body = text.slice(i + 1, j);
    if (kind === 'providecommand' && name in into) continue;
    into[name] = kind.startsWith('DeclareMathOperator')
      ? (kind.endsWith('*') ? `\\operatorname*{${body}}` : `\\operatorname{${body}}`)
      : body;
  }
}

class Fail extends Error {}

export class Parser {
  i = 0;
  constructor(readonly s: string, readonly ctx: LectureCtx, readonly base: number, private webonly = false) {}

  fail(msg: string, at = this.i): never {
    const line = this.ctx.src.slice(0, this.base + at).split('\n').length;
    throw new Fail(`${this.ctx.file}:${line}: ${msg}`);
  }
  private at(re: RegExp): RegExpExecArray | null {
    if (!re.sticky) throw new Error('sticky regex expected');
    re.lastIndex = this.i;
    return re.exec(this.s);
  }
  private sub(text: string, start: number, webonly = this.webonly): Parser {
    return new Parser(text, this.ctx, this.base + start, webonly);
  }
  private ws(): void { while (this.i < this.s.length && /[ \t\n\u0003]/.test(this.s[this.i])) this.i++; }

  /** {...} at the cursor (after white space): its content and where the content starts. */
  group(what: string): { text: string; start: number } {
    this.ws();
    if (this.s[this.i] !== '{') this.fail(`${what}: expected {`);
    let depth = 0, j = this.i;
    for (; j < this.s.length; j++) {
      const c = this.s[j];
      if (c === '\\') { j++; continue; }
      if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) break; }
    }
    if (j >= this.s.length) this.fail(`${what}: unbalanced braces`);
    const r = { text: this.s.slice(this.i + 1, j), start: this.i + 1 };
    this.i = j + 1;
    return r;
  }
  /** [...] at the cursor, if there is one (no white space skipped across a line end). */
  optional(): { text: string; start: number } | null {
    const m = this.at(/[ \t]*\[/y);
    if (!m) return null;
    let depth = 0, j = this.i + m[0].length;
    const start = j;
    for (; j < this.s.length; j++) {
      const c = this.s[j];
      if (c === '\\') { j++; continue; }
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === ']' && depth === 0) break;
    }
    if (j >= this.s.length) this.fail('unbalanced [');
    const r = { text: this.s.slice(start, j), start };
    this.i = j + 1;
    return r;
  }
  private envBody(name: string): { text: string; start: number } {
    const start = this.i;
    const open = `\\begin{${name}}`, close = `\\end{${name}}`;
    let depth = 1, j = this.i;
    while (depth > 0) {
      const a = this.s.indexOf(open, j), b = this.s.indexOf(close, j);
      if (b < 0) this.fail(`\\begin{${name}} without \\end{${name}}`, start);
      if (a >= 0 && a < b) { depth++; j = a + open.length; } else { depth--; j = b + close.length; }
    }
    this.i = j;
    return { text: this.s.slice(start, j - close.length), start };
  }

  // ── mathematics ────────────────────────────────────────────
  private quotes(tex: string): string {
    // German quotation marks typed as ,, and `` inside \text{...}
    return tex.replace(/,,/g, '„').replace(/``/g, '“');
  }
  math(tex: string, display: boolean, at: number): string {
    try {
      return temml.renderToString(this.quotes(tex.replace(/\u0003/g, '')), {
        displayMode: display, throwOnError: true, annotate: false, trust: true, wrap: 'none',
        macros: { ...this.ctx.macros },
      });
    } catch (e) {
      return this.fail(`mathematics: ${(e as Error).message.replace(/\s+/g, ' ')}`, at);
    }
  }
  private nextNumber(counter: string): string {
    this.ctx.counters[counter] = (this.ctx.counters[counter] ?? 0) + 1;
    return `${this.ctx.n}.${this.ctx.counters[counter]}`;
  }
  private display(env: string): string {
    const body = this.envBody(env);
    const star = env.endsWith('*');
    const multi = env.startsWith('align') || env.startsWith('gather');
    // rows of align/gather: split at \\ outside braces and inner environments
    const rows: string[] = [];
    if (multi) {
      let depth = 0, inner = 0, last = 0;
      const t = body.text;
      for (let j = 0; j < t.length; j++) {
        if (t.startsWith('\\begin{', j)) inner++;
        else if (t.startsWith('\\end{', j)) inner--;
        else if (t[j] === '\\' && t[j + 1] === '\\' && depth === 0 && inner === 0) {
          rows.push(t.slice(last, j));
          j += 2;
          const opt = /^\s*\[[^\]]*\]/.exec(t.slice(j));
          if (opt) j += opt[0].length;
          last = j; j--;
        } else if (t[j] === '\\') j++;
        else if (t[j] === '{') depth++;
        else if (t[j] === '}') depth--;
      }
      rows.push(t.slice(last));
      while (rows.length > 1 && rows[rows.length - 1].trim() === '') rows.pop();
    } else rows.push(body.text);

    let firstId = '';
    const outRows = rows.map((row) => {
      const labels: string[] = [];
      let tex = row.replace(/\\label\{([^}]*)\}/g, (_m, l: string) => { labels.push(l); return ''; });
      const unnumbered = star || /\\(notag|nonumber)\b/.test(tex);
      tex = tex.replace(/\\(notag|nonumber)\b/g, '');
      let number: string | null = null;
      if (!unnumbered) {
        if (this.webonly) this.fail(`a numbered display inside webonly would shift the equation numbers of the PDF; use ${env}*`, body.start);
        number = this.nextNumber('equation');
        const anchor = `eq-${number.replace('.', '-')}`;
        if (!firstId) firstId = anchor;
        for (const l of labels) this.ctx.labels.set(l, { number, lecture: this.ctx.n, anchor });
      } else if (labels.length) this.fail(`\\label{${labels[0]}} on an unnumbered display`, body.start);
      return { tex, number };
    });
    let tex: string;
    if (!multi) tex = outRows[0].tex + (outRows[0].number ? ` \\tag{${outRows[0].number}}` : '');
    else {
      const e = env.startsWith('align') ? 'align' : 'gather';
      tex = `\\begin{${e}}` + outRows.map((r) => r.tex + (r.number ? ` \\tag{${r.number}}` : ' \\notag')).join(' \\\\ ') + `\\end{${e}}`;
    }
    const cls = env.replace('*', 'star');
    return `<div class="tpc-eqwrap"><div class="tpc-eq tpc-eq-${cls}"${firstId ? ` id="${firstId}"` : ''}>${this.math(tex, true, body.start)}</div></div>`;
  }

  // ── inline ─────────────────────────────────────────────────
  inlineAll(): string {
    let out = '';
    while (this.i < this.s.length) out += this.inlineToken();
    return out;
  }
  private inlineArg(what: string): string {
    const g = this.group(what);
    return this.sub(g.text, g.start).inlineAll();
  }
  private inlineToken(): string {
    const s = this.s;
    const plain = this.at(/[^\\${}~,`'\-\n&<>"\u0003]+/y);
    if (plain) { this.i += plain[0].length; return plain[0]; }
    const c = s[this.i];
    if (c === '$') {
      const start = this.i + 1;
      let j = start;
      for (; j < s.length; j++) {
        // \text{... $x$ ...}: the mathematics inside the text group does not end this formula
        const text = /^\\(text|mbox|textrm|textnormal)\s*\{/.exec(s.slice(j, j + 14));
        if (text) {
          let depth = 0, k = j + text[0].length - 1;
          for (; k < s.length; k++) { if (s[k] === '\\') { k++; continue; } if (s[k] === '{') depth++; else if (s[k] === '}' && --depth === 0) break; }
          j = k; continue;
        }
        if (s[j] === '\\') { j++; continue; }
        if (s[j] === '$') break;
      }
      if (j >= s.length) this.fail('unclosed $', start - 1);
      this.i = j + 1;
      return this.math(s.slice(start, j), false, start);
    }
    if (c === '\\') {
      const w = this.at(/\\([A-Za-z]+)\*?[ \t]*/y);
      if (w) {
        const at = this.i;
        this.i += w[0].length;
        const name = w[1];
        switch (name) {
          case 'emph': case 'textit': return `<em>${this.inlineArg(name)}</em>`;
          case 'textbf': return `<strong>${this.inlineArg(name)}</strong>`;
          case 'textsc': case 'textrm': case 'textsf': case 'mbox': return this.inlineArg(name);
          case 'texttt': return `<code>${this.inlineArg(name)}</code>`;
          case 'ref': case 'eqref': {
            const l = this.group(name).text.trim();
            return `\u0000${name}:${l}\u0000`;
          }
          case 'label': {
            const l = this.group(name).text.trim();
            const last = this.ctx.toc[this.ctx.toc.length - 1];
            const anchor = `l-${l.replace(/[^A-Za-z0-9]+/g, '-')}`;
            this.ctx.labels.set(l, { number: last?.number ?? String(this.ctx.n), lecture: this.ctx.n, anchor });
            return `<span id="${anchor}"></span>`;
          }
          case 'footnote': return ` <span class="tpc-footnote">(${this.inlineArg(name).trim()})</span>`;
          case 'texorpdfstring': { const a = this.inlineArg(name); this.group(name); return a; }
          case 'tpcifenglish': {
            const a = this.inlineArg(name), b = this.inlineArg(name);
            return this.ctx.lang === 'en' ? a : b;
          }
          case 'url': { const u = this.group(name).text.trim(); return `<a href="${esc(u)}">${esc(u)}</a>`; }
          case 'href': { const u = this.group(name).text.trim(); return `<a href="${esc(u)}">${this.inlineArg(name)}</a>`; }
          case 'dots': case 'ldots': return '…';
          case 'quad': case 'qquad': return ' ';
          case 'S': return '§';
          case 'noindent': case 'par': case 'smallskip': case 'medskip': case 'bigskip': case 'centering':
          case 'empty': case 'hfill': case 'newpage': case 'clearpage': case 'relax': case 'normalsize': case 'small':
            return '';
          case 'vspace': case 'hspace': this.group(name); return '';
          default: return this.fail(`\\${name} in running text is not known to the web builder (web/tools/lecture/parse.ts)`, at);
        }
      }
      const sym = s[this.i + 1];
      this.i += 2;
      switch (sym) {
        case '\\': this.optional(); return '<br>';
        case ',': return ' ';
        case ' ': case '\n': return ' ';
        case '%': case '$': case '#': case '_': case '{': case '}': return sym;
        case '&': return '&amp;';
        case '-': case '/': return '';
        default: return this.fail(`\\${sym} in running text is not known to the web builder`, this.i - 2);
      }
    }
    this.i++;
    switch (c) {
      case '{': {
        const f = this.at(/\\(bf|bfseries|it|itshape|em)\b[ \t]*/y);
        if (!f) return '';
        this.i--;                                     // back onto the brace
        const g = this.group('group');
        const inner = this.sub(g.text.slice(f[0].length), g.start + f[0].length).inlineAll();
        return f[1].startsWith('bf') ? `<strong>${inner}</strong>` : `<em>${inner}</em>`;
      }
      case '}': return '';
      case '~': return ' ';
      case ',': if (s[this.i] === ',') { this.i++; return '„'; } return ',';
      case '`': if (s[this.i] === '`') { this.i++; return '“'; } return '‘';
      case "'": if (s[this.i] === "'") { this.i++; return this.ctx.lang === 'de' ? '“' : '”'; } return '’';
      case '-':
        if (s[this.i] === '-' && s[this.i + 1] === '-') { this.i += 2; return '—'; }
        if (s[this.i] === '-') { this.i++; return '–'; }
        return '-';
      case '\n': case '\u0003': return ' ';
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return esc(c);
    }
  }

  // ── blocks ─────────────────────────────────────────────────
  private heading(level: 1 | 2 | 3, starred: boolean): string {
    const g = this.group('heading');
    const html = this.sub(g.text, g.start).inlineAll().trim();
    if (level === 1 && !starred) {
      if (this.ctx.title) this.fail('a second \\section in one lecture file (use \\section* for an unnumbered part)');
      this.ctx.title = html.replace(/^(Vorlesung|Lecture):\s*/, '');
      return '';
    }
    let number = '';
    const lvl: 2 | 3 = level === 3 ? 3 : 2;
    if (!starred) {
      if (level === 2) { number = this.nextNumber('section'); this.ctx.counters.subsection = 0; }
      else number = `${this.ctx.n}.${this.ctx.counters.section ?? 0}.${(this.ctx.counters.subsection = (this.ctx.counters.subsection ?? 0) + 1)}`;
    }
    const id = number ? `s-${number.replace(/\./g, '-')}` : `s-x${this.ctx.toc.length + 1}`;
    this.ctx.toc.push({ level: lvl, id, number, html });
    return `<h${lvl} id="${id}">${number ? `<span class="tpc-secno">${number}</span>` : ''}${html}</h${lvl}>`;
  }
  private runIn(head: string, body: string, tail = ''): string {
    const m = /^<p( class="tpc-cont")?>/.exec(body);
    const merged = m ? `<p>${head} ${body.slice(m[0].length)}` : `<p>${head}</p>${body}`;
    if (!tail) return merged;
    return merged.endsWith('</p>') ? `${merged.slice(0, -4)}${tail}</p>` : `${merged}<p class="tpc-qed-line">${tail}</p>`;
  }
  private figure(name: string): string {
    const size = this.ctx.figureSize(name);
    this.ctx.figures.push(name);
    const alt = `${WORDS.figureAlt[this.ctx.lang]} ${this.ctx.n}`;
    return `<figure class="tpc-figure" id="fig-${esc(name)}"><div class="tpc-plate"><img class="tpc-still" src="../../assets/figures/${this.ctx.lang}/${esc(size.file)}"`
      + ` width="${size.width}" height="${size.height}" alt="${esc(alt)}" loading="lazy" decoding="async"></div></figure>`;
  }
  private demo(): string {
    const at = this.i;
    const replaces = this.optional();
    if (replaces) this.ctx.replaced.push(replaces.text.trim());
    const id = this.group('\\webdemo').text.trim();
    const cap = this.group('\\webdemo caption');
    const meta = this.ctx.demoCatalog[id];
    if (!meta) this.fail(`\\webdemo{${id}}: no such demo in web/src/demos/catalog.json`, at);
    if (this.ctx.demos.includes(id)) this.fail(`\\webdemo{${id}} twice in one lecture`, at);
    this.ctx.demos.push(id);
    const size = this.ctx.stillSize(id);
    const title = meta.title[this.ctx.lang];
    const caption = this.sub(cap.text, cap.start).inlineAll().trim();
    return `<figure class="tpc-figure tpc-figure-demo" id="demo-${esc(id)}"><div class="tpc-plate">`
      + `<div class="tpc-demo" id="${esc(id)}" data-demo="${esc(id)}" data-lang="${this.ctx.lang}" data-kind="${esc(meta.kind)}" data-title="${esc(title)}">`
      + `<img class="tpc-demo-poster" src="../../assets/stills/${esc(id)}.${this.ctx.lang}.svg" width="${size.width}" height="${size.height}" alt="${esc(title)}" loading="lazy" decoding="async"></div></div>`
      + `<figcaption><span class="tpc-caplabel">${WORDS.interactive[this.ctx.lang]}.</span> ${caption}</figcaption></figure>`;
  }
  private table(): string {
    const spec = this.group('tabular').text.replace(/[^lcr]/g, '').split('');
    const body = this.envBody('tabular');
    const rows: string[] = [];
    let pending: string[] = [];
    let offset = 0;
    for (const raw of body.text.split('\\\\')) {
      let row = raw;
      const start = body.start + offset;
      offset += raw.length + 2;
      row = row.replace(/\\(toprule|midrule|bottomrule|hline)\b/g, (_m, r: string) => {
        if (r === 'bottomrule' && rows.length) rows[rows.length - 1] = rows[rows.length - 1].replace('<tr class="', '<tr class="tpc-rule-bottom ');
        else pending.push(`tpc-rule-${r === 'toprule' ? 'top' : 'mid'}`);
        return '';
      }).replace(/\\rowcolor\{[^}]*\}/g, '');
      if (!row.trim()) continue;
      // cells: split at & outside mathematics
      const cells: string[] = [];
      let inMath = false, last = 0;
      for (let j = 0; j < row.length; j++) {
        if (row[j] === '\\') { j++; continue; }
        if (row[j] === '$') inMath = !inMath;
        else if (row[j] === '&' && !inMath) { cells.push(row.slice(last, j)); last = j + 1; }
      }
      cells.push(row.slice(last));
      rows.push(`<tr class="${pending.join(' ')}">${cells.map((cell, k) => `<td class="tpc-${spec[k] ?? 'l'}">${this.sub(cell, start).inlineAll().trim()}</td>`).join('')}</tr>`);
      pending = [];
    }
    return `<figure class="tpc-table"><div class="tpc-table-scroll"><table><tbody>${rows.join('')}</tbody></table></div></figure>`;
  }
  private list(env: string): string {
    this.optional();
    const tag = env === 'enumerate' ? 'ol' : 'ul';
    const items: string[] = [];
    const stop = new RegExp(`\\\\item\\b|\\\\end\\{${env}\\}`, 'y');
    for (;;) {
      this.ws();
      if (this.at(new RegExp(`\\\\end\\{${env}\\}`, 'y'))) { this.i += `\\end{${env}}`.length; break; }
      if (!this.at(/\\item\b/y)) this.fail(`in ${env}: expected \\item`);
      this.i += 5;
      const label = this.optional();
      const body = this.blocks(stop);
      const lab = label ? `<strong>${this.sub(label.text, label.start).inlineAll()}</strong> ` : '';
      items.push(`<li>${lab ? this.runIn(lab, body) : body}</li>`);
    }
    return `<${tag}>${items.join('')}</${tag}>`;
  }
  private environment(name: string): string {
    const lang = this.ctx.lang;
    if (DISPLAYS.includes(name)) return this.display(name);
    if (name in UNITS) {
      const [kind, counter] = UNITS[name];
      const opt = this.optional();
      const number = counter ? this.nextNumber(counter) : '';
      const body = this.envBody(name);
      const inner = this.sub(body.text, body.start).blocks();
      const nm = opt ? ` <span class="tpc-unit-name">(${this.sub(opt.text, opt.start).inlineAll()})</span>` : '';
      const head = `<span class="tpc-unit-head"><span class="tpc-unit-label">${WORDS[kind][lang]}${number ? ` ${number}` : ''}</span>${nm}.</span>`;
      const qed = kind === 'proof' || kind === 'solution' ? '<span class="tpc-qed" aria-hidden="true">□</span>' : '';
      const plain = ['theorem', 'lemma', 'proposition', 'corollary'].includes(kind) ? ' tpc-unit-plain' : '';
      return `<div class="tpc-unit tpc-unit-${kind}${plain}"${number ? ` id="${kind}-${number.replace('.', '-')}"` : ''}>${this.runIn(head, inner, qed)}</div>`;
    }
    if (BOXES.includes(name)) {
      const opt = this.optional();
      const body = this.envBody(name);
      const inner = this.sub(body.text, body.start).blocks();
      const title = opt ? this.sub(opt.text, opt.start).inlineAll() : name === 'historical' ? WORDS.historical[lang] : '';
      return `<aside class="tpc-box tpc-box-${name}">${title ? `<p class="tpc-box-title">${title}</p>` : ''}${inner}</aside>`;
    }
    switch (name) {
      case 'enumerate': case 'itemize': return this.list(name);
      case 'tabular': return this.table();
      case 'center': { const b = this.envBody(name); return this.sub(b.text, b.start).blocks(); }
      case 'tcolorbox': {
        this.optional();
        const b = this.envBody(name);
        return `<aside class="tpc-box tpc-box-postulat">${this.sub(b.text, b.start).blocks()}</aside>`;
      }
      case 'webonly': {
        const b = this.envBody(name);
        this.ctx.webonly++;
        return this.sub(b.text, b.start, true).blocks();
      }
      default: return this.fail(`\\begin{${name}} is not known to the web builder (web/tools/lecture/parse.ts)`);
    }
  }

  blocks(stop?: RegExp): string {
    let out = '', para = '', cont = false, nextCont = false;
    const flush = () => {
      if (para.trim()) out += `<p${cont ? ' class="tpc-cont"' : ''}>${para.trim()}</p>`;
      para = '';
    };
    const block = (html: string) => { flush(); out += html; nextCont = true; };
    while (this.i < this.s.length) {
      if (stop && this.at(stop)) break;
      const blank = this.at(/[ \t]*\n(?:[ \t]*\n)+/y);
      if (blank) { this.i += blank[0].length; flush(); nextCont = false; continue; }
      const begin = this.at(/\\begin\{([^}]+)\}/y);
      if (begin) { this.i += begin[0].length; block(this.environment(begin[1])); continue; }
      const end = this.at(/\\end\{([^}]+)\}/y);
      if (end) this.fail(`unexpected \\end{${end[1]}}`);
      const sec = this.at(/\\(section|subsection|subsubsection)(\*?)[ \t]*(?=\{)/y);
      if (sec) {
        this.i += sec[0].length;
        flush();
        out += this.heading(sec[1] === 'section' ? 1 : sec[1] === 'subsection' ? 2 : 3, sec[2] === '*');
        nextCont = false;
        continue;
      }
      const input = this.at(/\\input\{figures\/([A-Za-z0-9_]+)\}/y);
      if (input) { this.i += input[0].length; block(this.figure(input[1])); nextCont = false; continue; }
      if (this.at(/\\webdemo\b/y)) { this.i += 8; block(this.demo()); nextCont = false; continue; }
      const pb = this.at(/\\parbox\b/y);
      if (pb) {                                        // \parbox[c][5cm][c]{14cm}{...}: only its content
        this.i += pb[0].length;
        while (this.optional()) { /* position arguments */ }
        this.group('\\parbox width');
        continue;
      }
      if (this.at(/\\item\b/y)) this.fail('\\item outside a list');
      if (!para.trim()) {
        const lead = this.at(/[ \t\n\u0003]+/y);
        if (lead) { this.i += lead[0].length; continue; }
        cont = nextCont;
      }
      para += this.inlineToken();
    }
    flush();
    return out;
  }
}

export function parseLecture(ctx: LectureCtx): string {
  try {
    let html = new Parser(ctx.src, ctx, 0).blocks();
    for (const name of ctx.replaced) {
      const a = html.indexOf(`<figure class="tpc-figure" id="fig-${name}">`);
      if (a < 0) throw new Fail(`${ctx.file}: \\webdemo[${name}]: this lecture has no \\input{figures/${name}}`);
      html = html.slice(0, a) + html.slice(html.indexOf('</figure>', a) + 9);
    }
    return html;
  } catch (e) {
    if (e instanceof Fail) throw e;
    throw new Error(`${ctx.file}: ${(e as Error).stack}`);
  }
}

/** Replace the \ref placeholders once the labels of every lecture are known. */
export function resolveRefs(html: string, n: number, file: string, labels: Map<string, LabelInfo>, slug: (n: number) => string, lenient = false): string {
  return html.replace(/\u0000(ref|eqref):([^\u0000]*)\u0000/g, (_m, kind: string, label: string) => {
    const l = labels.get(label);
    if (!l) {
      if (lenient) return '<span class="tpc-ref">(?)</span>';
      throw new Error(`${file}: \\${kind}{${label}}: no such label in any lecture`);
    }
    const href = l.lecture === n ? `#${l.anchor}` : `../${slug(l.lecture)}/index.html#${l.anchor}`;
    const text = kind === 'eqref' ? `(${l.number})` : l.number;
    return `<a class="tpc-ref" href="${href}">${text}</a>`;
  });
}
