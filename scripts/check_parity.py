#!/usr/bin/env python3
"""
check_parity.py — Enforce structural parity between the German and English
editions of the Theoretische Physik C lecture notes.

The German edition (``latex/lectures/de/vlNN.tex``) leads; the English one
(``latex/lectures/en/lecNN.tex``) follows.  Prose differs between them by
definition, so comparing words is pointless.  What *must* agree is the
part of a lecture that carries no language:

  files        every vlNN has a lecNN and vice versa
  sections     same sequence of \\section / \\subsection / \\subsubsection
  maths        same display equations, compared symbol by symbol after
               stripping \\text{...} (which is legitimately translated)
  environments same sequence of theorem-like environments, under the
               German/English name pairs declared in ENV_PAIRS
  labels       same \\label set, so \\ref targets resolve in both editions
  refs         same \\ref / \\eqref / \\cite keys
  figures      same \\input{figures/...} set
  eqboxes      same number of highlighted key equations
  language     no untranslated German left in an English file

Exit status is 0 when every check passes, 1 otherwise, so this drops
straight into ./ci.sh or a git hook.

Usage:
    scripts/check_parity.py                 # check everything
    scripts/check_parity.py --only 3 7      # check selected lectures
    scripts/check_parity.py --json          # machine-readable report
    scripts/check_parity.py --quiet         # only report failures
"""

import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DE_DIR = ROOT / "latex" / "lectures" / "de"
EN_DIR = ROOT / "latex" / "lectures" / "en"

# German environment name → English environment name.  tpc-style.sty
# defines both spellings as the same environment, so a lecture may use
# either; parity is checked against the canonical English name.
ENV_PAIRS = {
    "beispiel": "example",
    "übung": "exercise",
    "uebung": "exercise",
    "lösung": "solution",
    "loesung": "solution",
}

# Display-maths environments whose content must match across editions.
MATH_ENVS = [
    "equation", "equation*", "align", "align*", "gather", "gather*",
    "multline", "multline*", "eqnarray", "flalign", "flalign*",
]

# Theorem-like environments whose sequence must match.
THEOREM_ENVS = {
    "theorem", "lemma", "proposition", "corollary", "definition",
    "example", "exercise", "solution", "remark", "note", "notation",
    "prototypedefinition", "physicalintuition", "conjecture",
    "beispiel", "übung", "uebung", "lösung", "loesung", "proof",
}

# Words that should never survive into an English source file.  Chosen to
# be unambiguous: no German word here is also an English word, and none
# appears inside a LaTeX control sequence we use.  Words that *are* also
# ordinary English ("also", "die", "hat", "man", "operator", "was") were
# dropped from this list: the comparison is case-insensitive, so they fire
# on correct English prose — "operator" alone appears twenty times in a
# faithful translation of a lecture on operators.
GERMAN_MARKERS = {
    "und", "oder", "nicht", "sind", "wird", "werden", "durch", "eine",
    "einen", "einem", "einer", "sich", "auch", "noch", "schon", "aber",
    "dass", "diese", "dieser", "dieses", "wenn", "dann", "somit",
    "wobei", "damit", "haben", "kann", "können", "müssen", "muss",
    "soll", "sollen", "sehr", "immer", "nur", "wie", "wir",
    "es", "der", "das", "den", "dem", "des", "für",
    "mit", "von", "zum", "zur", "bei", "aus", "nach", "über", "unter",
    "zwischen", "gleichung", "vorlesung", "beispiel", "übung", "lösung",
    "wahrscheinlichkeit", "zustand", "zustände", "wellenfunktion",
}


# ══════════════════════════════════════════════════════════════
#  Parsing
# ══════════════════════════════════════════════════════════════

def strip_comments(text):
    """Remove LaTeX comments, keeping escaped \\% intact."""
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


def sections(text):
    """Return [(level, title)] in document order."""
    pat = re.compile(r"\\(section|subsection|subsubsection)\*?\{")
    found = []
    for m in pat.finditer(text):
        title = balanced(text, m.end() - 1)
        found.append((m.group(1), normalise_title(title)))
    return found


def balanced(text, open_idx):
    """Return the content of the {...} group starting at open_idx."""
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
                return text[start:i]
        i += 1
    return text[start:]


def normalise_title(t):
    """Section titles are translated, so compare only their shape."""
    t = re.sub(r"\\[a-zA-Z]+\s*", " ", t)
    t = re.sub(r"[{}$,.:;`'\"()\[\]]", " ", t)
    return " ".join(t.split()).lower()


def math_blocks(text):
    """Return normalised display-maths bodies in document order."""
    blocks = []
    for env in MATH_ENVS:
        esc = re.escape(env)
        for m in re.finditer(
            r"\\begin\{" + esc + r"\}(.*?)\\end\{" + esc + r"\}", text, re.S
        ):
            blocks.append((m.start(), env.rstrip("*"), normalise_math(m.group(1))))
    # \[ ... \] display maths
    for m in re.finditer(r"\\\[(.*?)\\\]", text, re.S):
        blocks.append((m.start(), "equation", normalise_math(m.group(1))))
    blocks.sort(key=lambda b: b[0])
    return [(env, body) for _, env, body in blocks]


TEXTLIKE = re.compile(
    r"\\(?:text|textrm|textit|mbox|intertext|shortintertext)\s*\{"
)


def strip_textlike(s):
    """Replace every \\text{...} and friend by \\text{}, braces balanced."""
    out, i, n = [], 0, len(s)
    while True:
        m = TEXTLIKE.search(s, i)
        if not m:
            out.append(s[i:])
            return "".join(out)
        out.append(s[i:m.start()])
        out.append(r"\text{}")
        j, depth = m.end() - 1, 0          # j indexes the opening brace
        while j < n:
            c = s[j]
            if c == "\\":
                j += 2
                continue
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    j += 1
                    break
            j += 1
        i = j


def textlike_bodies(s):
    """Return the arguments of every \\text{...} and friend, braces balanced."""
    bodies, i, n = [], 0, len(s)
    while True:
        m = TEXTLIKE.search(s, i)
        if not m:
            return bodies
        j, depth, start = m.end() - 1, 0, m.end()
        while j < n:
            c = s[j]
            if c == "\\":
                j += 2
                continue
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    bodies.append(s[start:j])
                    j += 1
                    break
            j += 1
        i = j


def normalise_math(s):
    """
    Reduce a maths body to what must be identical across languages.

    \\text{...} and friends hold prose ("und" vs "and") and \\label{...}
    holds a name that need not match character for character, so both are
    replaced by a placeholder rather than compared.

    The argument of \\text{...} is matched with balanced braces, because a
    case label such as \\text{für $|x|<\\frac{L}{2}$} carries maths inside
    the prose; matching only up to the first brace would leave the German
    word in place and fail an honestly translated equation.
    """
    s = strip_textlike(s)
    s = re.sub(r"\\label\s*\{[^{}]*\}", "", s)
    s = re.sub(r"%.*", "", s)
    s = re.sub(r"\s+", "", s)
    return s


def environments(text):
    """Return the sequence of theorem-like environments, English-normalised."""
    seq = []
    for m in re.finditer(r"\\begin\{([a-zA-ZäöüÄÖÜß*]+)\}", text):
        name = m.group(1)
        if name in THEOREM_ENVS:
            seq.append(ENV_PAIRS.get(name, name))
    return seq


def labels(text):
    return sorted(set(re.findall(r"\\label\s*\{([^{}]*)\}", text)))


def refs(text):
    out = set()
    for macro in ("ref", "eqref", "pageref", "cite", "autoref"):
        out |= set(re.findall(r"\\" + macro + r"\s*\{([^{}]*)\}", text))
    return sorted(out)


def figure_inputs(text):
    return sorted(set(re.findall(r"\\input\s*\{(figures/[^{}]*)\}", text)))


def count_eqbox(text):
    return len(re.findall(r"\\eqbox\b", text))


def prose_only(text):
    """Text with maths, macro names and macro arguments removed."""
    text = re.sub(r"\$\$.*?\$\$", " ", text, flags=re.S)
    text = re.sub(r"\$[^$]*\$", " ", text)
    for env in MATH_ENVS:
        esc = re.escape(env)
        text = re.sub(r"\\begin\{" + esc + r"\}.*?\\end\{" + esc + r"\}",
                      " ", text, flags=re.S)
    text = re.sub(r"\\begin\{tikzpicture\}.*?\\end\{tikzpicture\}", " ", text, flags=re.S)
    text = re.sub(r"\\(label|ref|eqref|cite|input|includegraphics|url)\s*\{[^{}]*\}",
                  " ", text)
    text = re.sub(r"\\[a-zA-Z]+", " ", text)
    text = re.sub(r"[{}\[\]\\&_^~#]", " ", text)
    return text


# ══════════════════════════════════════════════════════════════
#  Comparison
# ══════════════════════════════════════════════════════════════

def seq_diff(a, b, label_a="de", label_b="en", limit=4):
    """Describe the first few places two sequences part company."""
    msgs = []
    for i in range(max(len(a), len(b))):
        x = a[i] if i < len(a) else None
        y = b[i] if i < len(b) else None
        if x != y:
            msgs.append(f"#{i + 1}: {label_a}={x!r} {label_b}={y!r}")
            if len(msgs) >= limit:
                break
    return msgs


def check_lecture(n, de_path, en_path):
    """Run every check for one lecture, returning a result dict."""
    res = {"lecture": n, "de": de_path.name, "en": en_path.name,
           "failures": [], "warnings": [], "stats": {}}

    def fail(check, detail):
        res["failures"].append({"check": check, "detail": detail})

    def warn(check, detail):
        res["warnings"].append({"check": check, "detail": detail})

    if not de_path.exists():
        fail("files", f"missing German source {de_path.name}")
        return res
    if not en_path.exists():
        fail("files", f"missing English source {en_path.name}")
        return res

    de = strip_comments(de_path.read_text(encoding="utf-8"))
    en = strip_comments(en_path.read_text(encoding="utf-8"))

    # ── sections ──────────────────────────────────────────────
    ds, es = sections(de), sections(en)
    dl, el = [lv for lv, _ in ds], [lv for lv, _ in es]
    res["stats"]["sections"] = f"{len(ds)}/{len(es)}"
    if dl != el:
        fail("sections",
             f"sectioning differs ({len(ds)} de vs {len(es)} en): "
             + "; ".join(seq_diff(dl, el)))

    # ── display maths ─────────────────────────────────────────
    dm, em = math_blocks(de), math_blocks(en)
    res["stats"]["math"] = f"{len(dm)}/{len(em)}"
    if len(dm) != len(em):
        fail("maths",
             f"{len(dm)} display equations in de, {len(em)} in en")
    else:
        bad = [i for i, (d, e) in enumerate(zip(dm, em)) if d != e]
        if bad:
            det = []
            for i in bad[:3]:
                det.append(f"#{i + 1} ({dm[i][0]}): "
                           f"de={dm[i][1][:70]!r} en={em[i][1][:70]!r}")
            fail("maths",
                 f"{len(bad)} equation(s) differ: " + " | ".join(det))

    # ── theorem environments ──────────────────────────────────
    de_env, en_env = environments(de), environments(en)
    res["stats"]["envs"] = f"{len(de_env)}/{len(en_env)}"
    if de_env != en_env:
        fail("environments",
             f"environment sequence differs: " + "; ".join(seq_diff(de_env, en_env)))

    # ── labels and references ─────────────────────────────────
    dlab, elab = labels(de), labels(en)
    res["stats"]["labels"] = f"{len(dlab)}/{len(elab)}"
    if dlab != elab:
        only_de = sorted(set(dlab) - set(elab))
        only_en = sorted(set(elab) - set(dlab))
        bits = []
        if only_de:
            bits.append(f"only in de: {', '.join(only_de[:5])}")
        if only_en:
            bits.append(f"only in en: {', '.join(only_en[:5])}")
        fail("labels", "; ".join(bits))

    dref, eref = refs(de), refs(en)
    if dref != eref:
        only_de = sorted(set(dref) - set(eref))
        only_en = sorted(set(eref) - set(dref))
        bits = []
        if only_de:
            bits.append(f"only in de: {', '.join(only_de[:5])}")
        if only_en:
            bits.append(f"only in en: {', '.join(only_en[:5])}")
        fail("references", "; ".join(bits))

    # ── figures ───────────────────────────────────────────────
    dfig, efig = figure_inputs(de), figure_inputs(en)
    res["stats"]["figures"] = f"{len(dfig)}/{len(efig)}"
    if dfig != efig:
        fail("figures",
             f"de={dfig} en={efig}")

    # ── highlighted key equations ─────────────────────────────
    db, eb = count_eqbox(de), count_eqbox(en)
    res["stats"]["eqbox"] = f"{db}/{eb}"
    if db != eb:
        fail("eqbox", f"{db} \\eqbox in de, {eb} in en")

    # ── untranslated German ───────────────────────────────────
    # prose_only() strips display maths wholesale, which would hide the
    # \text{...} labels inside it — and those are prose that has to be
    # translated ("für" vs "for").  Harvest them and scan them too.
    en_prose = prose_only(en) + " " + prose_only(" ".join(textlike_bodies(en)))
    words = re.findall(r"[A-Za-zÄÖÜäöüß]+", en_prose.lower())
    hits = {}
    for w in words:
        if w in GERMAN_MARKERS:
            hits[w] = hits.get(w, 0) + 1
    if hits:
        top = sorted(hits.items(), key=lambda kv: -kv[1])[:6]
        detail = ", ".join(f"{w}×{c}" for w, c in top)
        total = sum(hits.values())
        # A couple of stray hits are usually a quoted German term; a run
        # of them means a paragraph never got translated.
        if total >= 5:
            fail("language", f"{total} German word(s) in the English source: {detail}")
        else:
            warn("language", f"{total} possible German word(s): {detail}")

    # ── relative length ───────────────────────────────────────
    dw = len(prose_only(de).split())
    ew = len(prose_only(en).split())
    res["stats"]["words"] = f"{dw}/{ew}"
    if dw > 0:
        ratio = ew / dw
        # English runs a little shorter than German; far outside that band
        # means content was dropped or padded.
        if not 0.70 <= ratio <= 1.45:
            warn("length",
                 f"English prose is {ratio:.2f}× the German ({dw} vs {ew} words)")

    return res


# ══════════════════════════════════════════════════════════════
#  Reporting
# ══════════════════════════════════════════════════════════════

GREEN, RED, YELLOW, BLUE, BOLD, NC = (
    "\033[0;32m", "\033[0;31m", "\033[0;33m", "\033[0;34m", "\033[1m", "\033[0m"
)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", nargs="*", type=int, help="lecture numbers to check")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    ap.add_argument("--quiet", action="store_true", help="only show failures")
    args = ap.parse_args()

    de_files = sorted(DE_DIR.glob("vl[0-9][0-9].tex"))
    if not de_files:
        sys.exit(f"error: no German lectures found in {DE_DIR}")

    numbers = [int(p.stem[2:]) for p in de_files]
    if args.only:
        numbers = [n for n in numbers if n in set(args.only)]

    results = []
    for n in numbers:
        results.append(
            check_lecture(n, DE_DIR / f"vl{n:02d}.tex", EN_DIR / f"lec{n:02d}.tex")
        )

    # Orphaned English lectures with no German counterpart
    en_numbers = {int(p.stem[3:]) for p in EN_DIR.glob("lec[0-9][0-9].tex")}
    orphans = sorted(en_numbers - set(int(p.stem[2:]) for p in de_files))
    for n in orphans:
        results.append({
            "lecture": n, "de": f"vl{n:02d}.tex", "en": f"lec{n:02d}.tex",
            "failures": [{"check": "files",
                          "detail": "English lecture has no German counterpart"}],
            "warnings": [], "stats": {},
        })

    n_fail = sum(1 for r in results if r["failures"])
    n_warn = sum(1 for r in results if r["warnings"])

    if args.json:
        print(json.dumps({
            "lectures": len(results),
            "failed": n_fail,
            "warned": n_warn,
            "results": results,
        }, ensure_ascii=False, indent=2))
        return 1 if n_fail else 0

    print(f"{BOLD}Parity: German (leading) vs English{NC}")
    print(f"{'lec':>4}  {'sections':>9} {'maths':>9} {'envs':>7} "
          f"{'labels':>8} {'figs':>6} {'words':>13}   status")
    print("─" * 78)

    for r in results:
        s = r["stats"]
        status = (f"{RED}FAIL{NC}" if r["failures"]
                  else f"{YELLOW}warn{NC}" if r["warnings"]
                  else f"{GREEN}ok{NC}")
        if args.quiet and not r["failures"]:
            continue
        print(f"{r['lecture']:>4}  {s.get('sections', '-'):>9} "
              f"{s.get('math', '-'):>9} {s.get('envs', '-'):>7} "
              f"{s.get('labels', '-'):>8} {s.get('figures', '-'):>6} "
              f"{s.get('words', '-'):>13}   {status}")
        for f in r["failures"]:
            print(f"        {RED}✗{NC} {f['check']}: {f['detail']}")
        for w in r["warnings"]:
            print(f"        {YELLOW}!{NC} {w['check']}: {w['detail']}")

    print("─" * 78)
    if n_fail:
        print(f"{RED}{BOLD}{n_fail} lecture(s) out of parity{NC}"
              f"{f', {n_warn} with warnings' if n_warn else ''}")
        return 1
    print(f"{GREEN}{BOLD}All {len(results)} lecture(s) in parity{NC}"
          f"{f' ({n_warn} with warnings)' if n_warn else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
