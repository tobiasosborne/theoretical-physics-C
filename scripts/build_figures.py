#!/usr/bin/env python3
"""Compile every lecture figure once, in parallel, into build/figures/.

The 22 TikZ figures cost about two minutes per LaTeX pass when they are
drawn inside the script.  This compiles each figure on its own, in the
script's own preamble, to a tightly cropped PDF, and keeps it until the
figure or a style file changes.  build.sh then includes the PDFs, and the
web build turns the same PDFs into SVG.

    scripts/build_figures.py                 both languages, open fonts
    scripts/build_figures.py --lang de
    scripts/build_figures.py --fonts local   the commercial faces
    scripts/build_figures.py --svg           also write the web image beside each
                                             PDF (SVG, or PNG when the SVG is huge)
    scripts/build_figures.py --force

Output: build/figures/<fonts>-<lang>/figures/fig_vlNN_name.pdf (and .svg or
.png with a .json giving the file name and the size).
Exit code 1 if any figure fails.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LATEX = ROOT / "latex"
OUT = ROOT / "build" / "figures"

WRAPPER = r"""\documentclass[12pt,oneside,reqno]{amsart}
\usepackage[lang=%(lang)s,edition=full,layout=script,pkg=1,ground=light,
  math=%(math)s,fonts=%(fonts)s]{tpc-course}
\usepackage{tpc-tikz-templates}
\usepackage[active,tightpage,xetex]{preview}
\setlength\PreviewBorder{0pt}
\begin{document}
\begin{preview}\tpcscriptfigurebox{figures/%(name)s}\end{preview}
\end{document}
"""


def style_hash() -> str:
    h = hashlib.sha256()
    files = sorted(LATEX.glob("tpc-*.sty")) + sorted(LATEX.glob("tpc-*.tex"))
    files += sorted((LATEX / "tokens").rglob("*.sty"))
    for f in files:
        h.update(f.name.encode())
        h.update(f.read_bytes())
    h.update(WRAPPER.encode())
    return h.hexdigest()


SVG_LIMIT = 1_500_000   # bytes; a hatched region can turn 30 kB of PDF into 10 MB of SVG


def web_image(pdf: Path, outdir: Path, name: str, meta: Path) -> None:
    """The figure for the web: SVG, or a 220 dpi PNG when the SVG is huge.
    Writes <name>.json with the file name and the size in TeX points."""
    svg = outdir / f"{name}.svg"
    png = outdir / f"{name}.png"
    subprocess.run(["pdftocairo", "-svg", str(pdf), str(svg)], check=True)
    head = svg.read_text(errors="replace")[:600]
    width = float(re.search(r'\bwidth="([0-9.]+)', head).group(1))
    height = float(re.search(r'\bheight="([0-9.]+)', head).group(1))
    file = svg.name
    png.unlink(missing_ok=True)
    if svg.stat().st_size > SVG_LIMIT:
        subprocess.run(["pdftocairo", "-png", "-r", "220", "-singlefile",
                        str(pdf), str(outdir / name)], check=True)
        svg.unlink()
        file = png.name
    meta.write_text(json.dumps({"file": file, "width": width,
                                "height": height}) + "\n")


def build_one(fig: Path, lang: str, fonts: str, svg: bool, force: bool,
              style: str) -> tuple[str, str]:
    """Returns (status, message); status is 'cached', 'built' or 'FAILED'."""
    name = fig.stem
    outdir = OUT / f"{fonts}-{lang}" / "figures"
    outdir.mkdir(parents=True, exist_ok=True)
    pdf = outdir / f"{name}.pdf"
    stamp = outdir / f"{name}.sha256"
    key = hashlib.sha256(
        (style + lang + fonts).encode() + fig.read_bytes()).hexdigest()
    fresh = (not force and pdf.exists() and stamp.exists()
             and stamp.read_text().strip() == key)
    if not fresh:
        math = "mtpro2" if fonts == "local" else "stix"
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp) / "fig.tex").write_text(WRAPPER % dict(
                lang=lang, math=math, fonts=fonts, name=name))
            env = dict(os.environ, TEXINPUTS=f"{LATEX}:")
            run = subprocess.run(
                ["xelatex", "-interaction=nonstopmode", "-halt-on-error",
                 f"-output-directory={tmp}", f"{tmp}/fig.tex"],
                cwd=LATEX, env=env, capture_output=True, text=True,
                errors="replace")
            made = Path(tmp) / "fig.pdf"
            if run.returncode != 0 or not made.exists():
                lines = run.stdout.splitlines()
                at = next((i for i, l in enumerate(lines)
                           if l.startswith("!")), max(len(lines) - 8, 0))
                return "FAILED", f"{name} [{lang}]\n" + "\n".join(
                    "    " + l for l in lines[at:at + 8])
            shutil.copyfile(made, pdf)
        stamp.write_text(key + "\n")
    if svg:
        meta = outdir / f"{name}.json"
        if not fresh or not meta.exists():
            web_image(pdf, outdir, name, meta)
    return ("cached" if fresh else "built"), f"{name} [{lang}]"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--lang", choices=["de", "en"], action="append")
    ap.add_argument("--fonts", choices=["open", "local"], default="open")
    ap.add_argument("--svg", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--jobs", type=int, default=os.cpu_count() or 4)
    args = ap.parse_args()

    figs = sorted((LATEX / "figures").glob("fig_*.tex"))
    style = style_hash()
    jobs = [(f, lang) for lang in (args.lang or ["de", "en"]) for f in figs]
    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        results = list(pool.map(
            lambda j: build_one(j[0], j[1], args.fonts, args.svg, args.force,
                                style), jobs))
    built = sum(r[0] == "built" for r in results)
    failed = [r[1] for r in results if r[0] == "FAILED"]
    for msg in failed:
        print(f"FAILED {msg}", file=sys.stderr)
    print(f"figures: {len(results)} total, {built} compiled, "
          f"{len(results) - built - len(failed)} from cache, "
          f"{len(failed)} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
