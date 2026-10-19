// Print numbers. The web page shows the numbers of the print full edition; they are read
// from the .aux of the build in build/course/, never recounted. A missing, failed or stale
// print build is an error: the caller is told to rebuild print first.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Cursor, isCs, tokenize, type Tok } from './tex.ts';
import type { ChapterMeta, Lang, Paths } from './env.ts';

export class NumberingError extends Error {}

export interface AuxLabel { number: string; page: string; anchor: string }

export interface PrintNumbers {
  labels: Map<string, AuxLabel>;
  auxFile: string;
  recordFile: string;
  finished: string;
  builtChapters: string[];   // chapter IDs in the print build
}

const sha256 = (file: string) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function flat(toks: Tok[]): string {
  let s = '';
  for (const t of toks) {
    if (t.k === 'char') s += t.ch === '~' ? ' ' : (t.ch === '{' || t.ch === '}') ? '' : t.ch;
    else if (t.k === 'space') s += ' ';
    else if (t.k === 'sym' && t.name === ' ') s += ' ';
    else if (t.k === 'cs') s += '';
  }
  return s.trim();
}

export function parseAux(file: string): Map<string, AuxLabel> {
  const toks = tokenize(fs.readFileSync(file, 'utf8'), file, { atLetter: true });
  const cur = new Cursor(toks, { file, line: 0, col: 0 });
  const labels = new Map<string, AuxLabel>();
  while (!cur.eof()) {
    const t = cur.next()!;
    if (!isCs(t, 'newlabel')) continue;
    const id = flat(cur.group('\\newlabel'));
    const body = new Cursor(cur.group('\\newlabel'), t.pos);
    const parts: string[] = [];
    for (;;) {
      body.skipBlank();
      if (body.eof()) break;
      const p = body.peek()!;
      if (p.k === 'char' && p.ch === '{') parts.push(flat(body.group('\\newlabel field')));
      else { body.next(); }
    }
    // labels written by the class itself (tocindent...) have one field only
    if (parts.length >= 2) labels.set(id, { number: parts[0], page: parts[1], anchor: parts[3] ?? '' });
  }
  return labels;
}

/**
 * The label map of the full edition in `lang`, after checking that the build exists,
 * succeeded, contains the chapters, and was made from the sources as they are now.
 */
export function loadPrintNumbers(paths: Paths, lang: Lang, chapters: ChapterMeta[]): PrintNumbers {
  const job = `tpc-${lang}-full`;
  const work = path.join(paths.courseBuild, job);
  const recordFile = path.join(work, 'build.json');
  const auxFile = path.join(work, `${job}.aux`);
  const hint = `run: bash scripts/course/build_course.sh --chapters ${chapters.map((c) => c.id).join(',')} --all-editions`;
  if (!fs.existsSync(recordFile)) {
    throw new NumberingError(`numbering: print build record missing: ${recordFile} (${hint})`);
  }
  const rec = JSON.parse(fs.readFileSync(recordFile, 'utf8')) as {
    lang: string; edition: string; chapters: string[]; xelatex_exit_status: number; finished: string;
    sources: Record<string, string>;
  };
  if (rec.edition !== 'full' || rec.lang !== lang) {
    throw new NumberingError(`numbering: ${recordFile} is the record of edition=${rec.edition} lang=${rec.lang}, expected full/${lang}`);
  }
  if (rec.xelatex_exit_status !== 0) {
    throw new NumberingError(`numbering: the print build ${job} failed (xelatex exit ${rec.xelatex_exit_status}); its numbers are not used (${hint})`);
  }
  for (const ch of chapters) {
    if (!rec.chapters.includes(ch.dir)) {
      throw new NumberingError(`numbering: chapter ${ch.dir} is not in the print build ${job} (it has: ${rec.chapters.join(', ')}) (${hint})`);
    }
  }
  // staleness: every recorded source of these chapters, and every recorded style file
  const stale: string[] = [];
  const wantDirs = new Set(chapters.map((c) => c.dir));
  const seenChapterFiles = new Set<string>();
  for (const [key, hash] of Object.entries(rec.sources)) {
    let file: string;
    if (key.startsWith('content/')) {
      const rest = key.slice('content/'.length);
      const dir = rest.split('/')[0];
      if (!wantDirs.has(dir)) continue;
      file = path.join(paths.content, rest);
      seenChapterFiles.add(rest);
    } else {
      file = path.join(paths.root, key);
    }
    if (!fs.existsSync(file)) stale.push(`${key} (recorded in the print build, now missing)`);
    else if (sha256(file) !== hash) stale.push(`${key} (changed since the print build of ${rec.finished})`);
  }
  for (const ch of chapters) {
    for (const f of [`${ch.dir}/${lang}.tex`, `${ch.dir}/chapter.json`]) {
      if (!seenChapterFiles.has(f)) stale.push(`content/${f} (not recorded in the print build)`);
    }
  }
  if (stale.length) {
    throw new NumberingError(`numbering: print build ${job} is stale, its .aux is not used:\n  ` + stale.join('\n  ') + `\n  ${hint}`);
  }
  if (!fs.existsSync(auxFile)) {
    throw new NumberingError(`numbering: .aux missing: ${auxFile} (${hint})`);
  }
  const labels = parseAux(auxFile);
  if (labels.size === 0) throw new NumberingError(`numbering: ${auxFile} contains no labels (${hint})`);
  return { labels, auxFile, recordFile, finished: rec.finished, builtChapters: rec.chapters.map((d) => d.slice(0, 3)) };
}
