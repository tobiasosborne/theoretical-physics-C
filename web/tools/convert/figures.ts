// Figures: each tpcfigure's TeX file -> PDF through latex/course/figure-standalone.tex (the
// route its header documents) -> SVG with pdftocairo. One SVG per figure, language and
// design variant (pkgN-ground), cached by the hash of everything that goes in.
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Lang, Paths } from './env.ts';
import { scanHtml } from './htmlscan.ts';

export interface BuiltFigure { svg: string; widthPt: number; heightPt: number }

const STYLE_INPUTS = ['latex/course/figure-standalone.tex', 'latex/tpc-course.sty', 'latex/tpc-levels.sty', 'latex/tpc-design.sty',
  'latex/tpc-style.sty', 'latex/tpc-macros.sty', 'latex/tpc-tikz-templates.sty', 'registry/generated/tpc-notation.sty'];

export function svgSize(svgFile: string): { widthPt: number; heightPt: number } {
  const head = fs.readFileSync(svgFile, 'utf8').slice(0, 4000);
  const root = scanHtml(head).tags.find((t) => t.name === 'svg');
  if (!root) throw new Error(`${svgFile}: no <svg> element`);
  const num = (v: string | undefined) => {
    const x = Number.parseFloat(v ?? '');
    if (!Number.isFinite(x) || x <= 0) throw new Error(`${svgFile}: <svg> has no usable width/height`);
    return x;
  };
  return { widthPt: num(root.attrs.width), heightPt: num(root.attrs.height) };
}

export function buildFigure(paths: Paths, texFileAbs: string, id: string, lang: Lang, pkg: number, ground: string, outDir: string): BuiltFigure {
  const variant = `pkg${pkg}-${ground}`;
  const work = path.join(paths.out, 'figures-work', variant);
  fs.mkdirSync(work, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });
  const job = `${id}-${lang}`;
  const svg = path.join(outDir, `${id}.${lang}.svg`);
  const h = crypto.createHash('sha256');
  h.update(`${id}|${lang}|${variant}|`);
  h.update(fs.readFileSync(texFileAbs));
  for (const f of STYLE_INPUTS) {
    const p = path.join(paths.root, f);
    if (fs.existsSync(p)) h.update(fs.readFileSync(p));
  }
  const tok = path.join(paths.design, variant, 'tpc-tokens.sty');
  if (!fs.existsSync(tok)) throw new Error(`figure ${id}: ${tok} missing (run python3 design/build_tokens.py --all)`);
  h.update(fs.readFileSync(tok));
  const key = h.digest('hex');
  const keyFile = path.join(work, `${job}.sha256`);
  if (fs.existsSync(svg) && fs.existsSync(keyFile) && fs.readFileSync(keyFile, 'utf8') === key) {
    return { svg, ...svgSize(svg) };
  }
  const R = paths.root;
  const texinputs = `.:${R}/latex/course:${R}/latex:${R}/registry/generated:${paths.design}/${variant}:${paths.design}:`;
  const cmd = `\\def\\tpclang{${lang}}\\def\\tpcpkg{${pkg}}\\def\\tpcground{${ground}}\\def\\tpcfigurefile{${texFileAbs}}\\input{figure-standalone.tex}`;
  try {
    execFileSync('xelatex', ['-interaction=nonstopmode', '-halt-on-error', '-file-line-error', `-output-directory=${work}`, `-jobname=${job}`, cmd],
      { cwd: path.join(R, 'latex'), env: { ...process.env, TEXINPUTS: texinputs, max_print_line: '10000' }, stdio: 'pipe' });
  } catch (e) {
    const log = path.join(work, `${job}.log`);
    const lines = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').split('\n').filter((l) => /^!|:\d+: /.test(l)).slice(0, 6).join('\n  ') : String(e);
    throw new Error(`figure ${id} (${lang}, ${variant}): xelatex failed (${log})\n  ${lines}`);
  }
  const pdf = path.join(work, `${job}.pdf`);
  execFileSync('pdftocairo', ['-svg', pdf, svg], { stdio: 'pipe' });
  fs.writeFileSync(keyFile, key);
  return { svg, ...svgSize(svg) };
}
