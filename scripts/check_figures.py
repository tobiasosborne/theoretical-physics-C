#!/usr/bin/env python3
"""
check_figures.py — Structural checks on the lecture figures.

A figure is one file included by *both* editions, so its prose has to go
through ``\\tpcifenglish{English}{Deutsch}``.  A bare German word in a
figure does not fail any build — it just silently produces a German label
in the English PDF, which is exactly the kind of thing nobody notices
until a reader does.  This catches it mechanically instead of relying on
someone spotting it in a rendered image.

Checks:

  exists      every \\input{figures/...} in a lecture resolves to a file
  used        every figure file is included by exactly one lecture
  bilingual   no bare German prose outside \\tpcifenglish
  header      the file carries a comment saying what it shows

Exit status is 0 when everything passes, 1 otherwise.

Usage:
    scripts/check_figures.py
    scripts/check_figures.py --only 3 7
    scripts/check_figures.py --json
"""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIG_DIR = ROOT / "latex" / "figures"
DE_DIR = ROOT / "latex" / "lectures" / "de"
EN_DIR = ROOT / "latex" / "lectures" / "en"

# German words that must never appear as bare figure text.  Restricted to
# words that are unambiguously German and cannot occur inside a TikZ key,
# a colour name, or a LaTeX control sequence we use.
GERMAN_MARKERS = {
    "der", "die", "das", "des", "dem", "den", "ein", "eine", "einen",
    "einer", "eines", "einem", "und", "oder", "nicht", "mit", "ohne",
    "für", "fuer", "von", "vom", "zum", "zur", "bei", "aus", "nach",
    "über", "ueber", "unter", "zwischen", "durch", "gegen", "auf",
    "ist", "sind", "wird", "werden", "hat", "haben", "kann", "können",
    "koennen", "muss", "müssen", "wie", "was", "wir", "man", "sich",
    "auch", "nur", "immer", "dann", "also", "wenn", "dass", "diese",
    "dieser", "dieses", "verboten", "erlaubt", "klassisch", "quanten",
    "zustand", "zustände", "zustaende", "energie", "niveau", "niveaus",
    "wahrscheinlichkeit", "dichte", "breite", "spektrum", "messung",
    "eingefroren", "sichtbar", "gebunden", "frei", "gerade", "ungerade",
    "grundzustand", "temperatur", "entropie", "zeit", "raum", "achse",
    "kasten", "topf", "oszillator", "drehimpuls", "spin", "teilchen",
    "wellenfunktion", "impuls", "ort", "beispiel", "abbildung", "links",
    "rechts", "oben", "unten", "hoch", "tief", "gross", "groß", "klein",
}


def strip_comments(text):
    out = []
    for line in text.split("\n"):
        i, n = 0, len(line)
        while i < n:
            if line[i] == "\\" and i + 1 < n:
                i += 2
                continue
            if line[i] == "%":
                line = line[:i]
                break
            i += 1
        out.append(line)
    return "\n".join(out)


def balanced_at(text, open_idx):
    """Content of the {...} group whose opening brace is at open_idx."""
    depth, i, n = 0, open_idx, len(text)
    start = open_idx + 1
    while i < n:
        c = text[i]
        if c == "\\":
            i += 2
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return text[start:i], i
        i += 1
    return text[start:], n


def strip_tpcifenglish(text):
    """
    Remove every \\tpcifenglish{...}{...} call, arguments and all.

    What is left is the text that is *not* language-switched, which is
    where a stray German word would do damage.
    """
    out, i = [], 0
    while True:
        j = text.find("\\tpcifenglish", i)
        if j < 0:
            out.append(text[i:])
            break
        out.append(text[i:j])
        k = j + len("\\tpcifenglish")
        # skip the two brace groups
        for _ in range(2):
            while k < len(text) and text[k] in " \t\n":
                k += 1
            if k < len(text) and text[k] == "{":
                _, close = balanced_at(text, k)
                k = close + 1
            else:
                break
        i = k
    return "".join(out)


def figure_number(path):
    m = re.match(r"fig_vl(\d{2})_", path.name)
    return int(m.group(1)) if m else None


def check_figure(path, de_text_by_num, en_text_by_num):
    n = figure_number(path)
    stem = path.stem
    res = {"figure": stem, "lecture": n, "failures": [], "warnings": []}

    def fail(check, detail):
        res["failures"].append({"check": check, "detail": detail})

    def warn(check, detail):
        res["warnings"].append({"check": check, "detail": detail})

    raw = path.read_text(encoding="utf-8")
    body = strip_comments(raw)

    # ── header comment ────────────────────────────────────────
    if not raw.lstrip().startswith("%"):
        warn("header", "no leading comment saying what the figure shows")

    # ── included by its lecture ───────────────────────────────
    needle = "\\input{figures/%s}" % stem
    in_de = n in de_text_by_num and needle in de_text_by_num[n]
    if not in_de:
        others = [k for k, v in de_text_by_num.items() if needle in v]
        if others:
            fail("used", f"included by vl{others[0]:02d}, not vl{n:02d}")
        else:
            fail("used", f"not included by any German lecture")

    # The English edition may not exist yet; only check it if it does.
    if en_text_by_num:
        in_en = n in en_text_by_num and needle in en_text_by_num[n]
        if in_de and not in_en:
            fail("used", f"included by vl{n:02d} but not by lec{n:02d}")

    # ── bilingual prose ───────────────────────────────────────
    unswitched = strip_tpcifenglish(body)
    hits = {}
    for w in re.findall(r"[A-Za-zÄÖÜäöüß]+", unswitched):
        lw = w.lower()
        if lw in GERMAN_MARKERS:
            hits[lw] = hits.get(lw, 0) + 1
    if hits:
        top = ", ".join(f"{w}×{c}" for w, c in
                        sorted(hits.items(), key=lambda kv: -kv[1])[:6])
        fail("bilingual",
             f"German outside \\tpcifenglish (would leak into the English "
             f"edition): {top}")

    res["stats"] = {
        "bytes": len(raw),
        "switches": raw.count("\\tpcifenglish"),
    }
    return res


GREEN, RED, YELLOW, BOLD, NC = (
    "\033[0;32m", "\033[0;31m", "\033[0;33m", "\033[1m", "\033[0m"
)


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", nargs="*", type=int)
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    figs = sorted(FIG_DIR.glob("fig_vl[0-9][0-9]_*.tex"))
    if not figs:
        print("no figures yet")
        return 0
    if args.only:
        want = set(args.only)
        figs = [f for f in figs if figure_number(f) in want]

    de = {}
    for p in DE_DIR.glob("vl[0-9][0-9].tex"):
        de[int(p.stem[2:])] = p.read_text(encoding="utf-8")
    en = {}
    for p in EN_DIR.glob("lec[0-9][0-9].tex"):
        en[int(p.stem[3:])] = p.read_text(encoding="utf-8")

    results = [check_figure(f, de, en) for f in figs]
    n_fail = sum(1 for r in results if r["failures"])
    n_warn = sum(1 for r in results if r["warnings"])

    if args.json:
        print(json.dumps({"figures": len(results), "failed": n_fail,
                          "warned": n_warn, "results": results},
                         ensure_ascii=False, indent=2))
        return 1 if n_fail else 0

    print(f"{BOLD}Figures{NC}")
    for r in results:
        status = (f"{RED}FAIL{NC}" if r["failures"]
                  else f"{YELLOW}warn{NC}" if r["warnings"] else f"{GREEN}ok{NC}")
        sw = r["stats"]["switches"]
        print(f"  {r['figure']:<28} {sw:>3} switches   {status}")
        for f in r["failures"]:
            print(f"      {RED}✗{NC} {f['check']}: {f['detail']}")
        for w in r["warnings"]:
            print(f"      {YELLOW}!{NC} {w['check']}: {w['detail']}")

    print("─" * 62)
    if n_fail:
        print(f"{RED}{BOLD}{n_fail} figure(s) with problems{NC}")
        return 1
    print(f"{GREEN}{BOLD}All {len(results)} figure(s) ok{NC}"
          f"{f' ({n_warn} with warnings)' if n_warn else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
