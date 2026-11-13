// Corpus gate (static half):  tsx tools/corpus/main.ts --chapters c99 [--content DIR] [--out FILE.json]
// Exit 1 and one line per formula that does not convert or converts with a fault.
import fs from 'node:fs';
import path from 'node:path';
import { defaultPaths, findChapters, loadEnv } from '../convert/env.ts';
import { TexError } from '../convert/tex.ts';
import { MATH_CONVERTER } from '../convert/mathconv.ts';
import { collectCorpus, summarize } from './corpus.ts';

const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
try {
  const paths = defaultPaths({ content: opt('--content'), out: opt('--out-dir') });
  const env = loadEnv(paths);
  const want = opt('--chapters');
  const metas = findChapters(paths, want ? want.split(',') : null);
  const entries = collectCorpus(env, metas);
  const bad = entries.filter((e) => e.problems.length);
  for (const e of bad) console.log(`corpus: FAIL ${e.origin}: ${e.src ? `$${e.src}$: ` : ''}${e.problems.join('; ')}`);
  const out = opt('--out');
  if (out) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify({ converter: MATH_CONVERTER, chapters: metas.map((m) => m.id), entries }, null, 1));
  }
  console.log(`corpus: ${MATH_CONVERTER}: ${summarize(entries)}: ${bad.length} failed`);
  process.exit(bad.length ? 1 : 0);
} catch (e) {
  if (e instanceof TexError) { console.error(`corpus: FAIL ${e.message}`); process.exit(1); }
  console.error(`corpus: FAIL ${(e as Error).message}`);
  process.exit(1);
}
