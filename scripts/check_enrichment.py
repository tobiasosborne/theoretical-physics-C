#!/usr/bin/env python3
"""
check_enrichment.py — Verify that the v0.2 German lectures still contain
everything v0.1 did.

Enrichment folds lecture commentary into the written notes.  It is meant to
*add*: motivation, intuition, historical context, connective prose.  It must
never quietly drop a derivation, renumber an equation or break a
cross-reference — those are the things students actually rely on.

So this compares each ``latex/lectures/de/vlNN.tex`` against the archived
original ``archive/skript-2022/VorlesungenN.tex`` and checks:

  maths    every display equation of v0.1 survives, symbol for symbol
  labels   every \\label of v0.1 survives, spelled the same
  sections every \\section / \\subsection heading of v0.1 survives
  envs     no theorem-like environment of v0.1 was dropped
  growth   the lecture grew, but stayed within --max-growth.  The default
           allows a little over twice the original prose: several lectures
           started at only a few hundred words, and each also gains a
           sentence or two introducing its figure, so a tight ratio would
           punish exactly the lectures that needed the most help.

Deliberate departures are recorded in ENRICHMENT_EXCEPTIONS below, each
with the reason, so a fix made on purpose does not read as a regression.

Migrated lectures (MIGRATED_LECTURES below; PLAN.md S11: explicit migration
records replace the enrichment rule) are no longer enrichments of v0.1: their
live file is script v0.3, rewritten from the new course.  For these, and only
these, the check is replaced by two others:

  snapshot the comparison above runs against the immutable v0.2 text of the
           lecture (a Git member of the registered snapshot tpc-script-v0.2,
           read through scripts/evidence/snapshot.py and checked against its
           recorded sha256), so "v0.2 kept everything v0.1 had" stays checked
  map      the lecture's migration map is complete: its checker
           (evidence/migrations/check_vlNN_map.py) passes, i.e. every item of
           the v0.2 text has a status and a destination or a reason

The live v0.3 file is then not compared with v0.1.  Every other lecture is
checked exactly as before.

Exit status is 0 when every lecture passes, 1 otherwise.

Usage:
    scripts/check_enrichment.py
    scripts/check_enrichment.py --only 12
    scripts/check_enrichment.py --max-growth 2.2
    scripts/check_enrichment.py --json
    scripts/check_enrichment.py --only 2 --migration-map 2=FILE   (red corpus)
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
V02_DIR = ROOT / "latex" / "lectures" / "de"
V01_DIR = ROOT / "archive" / "skript-2022"
sys.path.insert(0, str(ROOT / "scripts" / "evidence"))
import snapshot  # noqa: E402  (scripts/evidence/snapshot.py)

# Lectures whose live file is script v0.3 (docs/plan/script-v0.3/BRIEF.md): rewritten
# from the new course and governed by migration records and maps, not by the v0.1
# enrichment rule (PLAN.md S11).  Keyed by lecture number.  "snapshot" is the v0.2 text
# (source key, member) that the v0.1 comparison now reads; "map_check" and "map" are the
# migration-map checker and map that must pass for the live file.  Add a lecture here
# only when its v0.2 text is a Git member of tpc-script-v0.2 and its map is complete.
MIGRATED_LECTURES = {
    1: {"snapshot": ("tpc-script-v0.2", "tpc-script-v0.2/git/latex/lectures/de/vl01.tex"),
        "map_check": "evidence/migrations/check_vl01_map.py",
        "map": "evidence/migrations/maps/vl01-map.json",
        "since": "script v0.3, 2026-10-22 (docs/plan/script-v0.3/NOTES-evidence.md)"},
    2: {"snapshot": ("tpc-script-v0.2", "tpc-script-v0.2/git/latex/lectures/de/vl02.tex"),
        "map_check": "evidence/migrations/check_vl02_map.py",
        "map": "evidence/migrations/maps/vl02-map.json",
        "since": "script v0.3, 2026-10-22 (docs/plan/script-v0.3/NOTES-evidence.md)"},
    3: {"snapshot": ("tpc-script-v0.2", "tpc-script-v0.2/git/latex/lectures/de/vl03.tex"),
        "map_check": "evidence/migrations/check_vl03_map.py",
        "map": "evidence/migrations/maps/vl03-map.json",
        "since": "script v0.3, 2026-10-29 (docs/plan/lec34/NOTES-evidence.md)"},
    4: {"snapshot": ("tpc-script-v0.2", "tpc-script-v0.2/git/latex/lectures/de/vl04.tex"),
        "map_check": "evidence/migrations/check_vl04_map.py",
        "map": "evidence/migrations/maps/vl04-map.json",
        "since": "script v0.3, 2026-10-29 (docs/plan/lec34/NOTES-evidence.md)"},
}

# Departures from v0.1 that are intentional.  Keyed by lecture number;
# each entry lists label renames and dropped/edited maths with a reason.
ENRICHMENT_EXCEPTIONS = {
    1: {
        "reason": "in the photoelectric-effect box the velocity carried the same "
                  "symbol \\nu as the frequency (E_el = 1/2 m nu^2 = h nu - W); "
                  "the kinetic term now reads 1/2 m v^2, which is what Osborne "
                  "says at the board (v01, Tafelrechnungen)",
        "labels_renamed": {},
        "math_edited": 1,
    },
    11: {
        "reason": "literal Unicode Ψ replaced by \\Psi (no glyph in the maths font); "
                  "literal Unicode − replaced by -; the kinetic term of the "
                  "stationary Schrödinger equation corrected from d/dx to "
                  "d²/dx² — v0.1 had the first derivative, which contradicts "
                  "the μ² that the very next line obtains by substitution "
                  "(Osborne corrects the same slip at the board, v13 [70:10])",
        "labels_renamed": {},
        "math_edited": 1,
    },
    12: {
        "reason": "stray \\\\ before \\end{align} removed (arithmetic overflow); "
                  "Hermite polynomials H_1, H_2 restated in z, the variable they "
                  "are defined in, instead of x; the ground-state ODE gained the "
                  "missing factor x — v0.1 had dphi_0/dx = -(m omega/hbar) phi_0, "
                  "which follows neither from <x|a|phi_0> = 0 nor from the solution "
                  "N exp(-(m omega/hbar) x²/2) printed on the very next line "
                  "(Osborne flags the same slip at the board, v15 [08:11]); "
                  "literal Unicode ∈ replaced by \\in and literal Unicode − by -",
        "labels_renamed": {},
        "math_edited": 2,
    },
    13: {
        "reason": "the kinetic term of the stationary Schrödinger equation in the "
                  "position representation corrected from d/dx to d²/dx² — v0.1 "
                  "had the first derivative, contradicting the very next display, "
                  "which solves the same equation with d²/dx² (Osborne writes the "
                  "second derivative at the board, v16 [54:40])",
        "labels_renamed": {},
        "math_edited": 1,
    },
    14: {
        "reason": "in both intermediate lines of the [L_1,L_2] computation the "
                  "last term read z² d²/(dx dz); the product rule gives "
                  "z² d²/(dx dy) — that is what Osborne writes at the board "
                  "(v18, Tafelrechnungen), and the term cancels in the "
                  "difference, so the commutator itself was never affected",
        "labels_renamed": {},
        "math_edited": 2,
    },
    16: {
        "reason": "literal Unicode − in the Bohr-radius value replaced by - "
                  "(no glyph guarantee in the maths font; the same substitution "
                  "was already recorded for vl11 and vl12); "
                  "L_2^s leading term corrected from -x²/2 to +x²/2 "
                  "(evidence/derivations/c11/DERIVATION.md section 6; "
                  "evidence/migrations/M-0001.json); "
                  "psi_{21,+-1} normalisation and Condon-Shortley signs corrected "
                  "to coefficients -/+ 1/(8 sqrt(pi)), consistent with vl14:149 "
                  "(evidence/derivations/c11/DERIVATION.md section 6; "
                  "evidence/migrations/M-0002.json)",
        "labels_renamed": {},
        "math_edited": 3,
    },
    17: {
        "reason": "the second \\label{eq:amcr} (spin commutators) renamed to "
                  "eq:amcr-spin; it duplicated the orbital one, so the \\ref "
                  "meant for the orbital relations resolved to the wrong equation",
        "labels_renamed": {"eq:amcr": "eq:amcr-spin"},
        "math_edited": 0,
    },
    22: {
        "reason": "sign of the mean energy from the partition function corrected: "
                  "v0.1 had <H> = sum_j E_j e^{-beta E_j}/Z = (1/Z) dZ/dbeta, but "
                  "Z = sum_j e^{-beta E_j} gives dZ/dbeta = -sum_j E_j e^{-beta E_j}, "
                  "so the printed chain equated a quantity with its own negative; "
                  "it now reads -(1/Z) dZ/dbeta = -d/dbeta log(Z) "
                  "(the transcript flags the same slip, v25 [48:28], Unsichere Stellen)",
        "labels_renamed": {},
        "math_edited": 1,
    },
}

MATH_ENVS = [
    "equation", "equation*", "align", "align*", "gather", "gather*",
    "multline", "multline*", "eqnarray", "flalign", "flalign*",
]

THEOREM_ENVS = {
    "theorem", "lemma", "proposition", "corollary", "definition",
    "example", "exercise", "solution", "remark", "note",
    "beispiel", "übung", "uebung", "lösung", "loesung", "proof",
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


def normalise_math(s):
    """Reduce a maths body to a whitespace- and label-insensitive form."""
    s = re.sub(r"\\label\s*\{[^{}]*\}", "", s)
    s = re.sub(r"%.*", "", s)
    s = re.sub(r"\s+", "", s)
    return s


def math_bodies(text):
    out = []
    for env in MATH_ENVS:
        esc = re.escape(env)
        for m in re.finditer(
            r"\\begin\{" + esc + r"\}(.*?)\\end\{" + esc + r"\}", text, re.S
        ):
            out.append(normalise_math(m.group(1)))
    for m in re.finditer(r"\\\[(.*?)\\\]", text, re.S):
        out.append(normalise_math(m.group(1)))
    return out


def labels(text):
    return set(re.findall(r"\\label\s*\{([^{}]*)\}", text))


def headings(text):
    out = []
    for m in re.finditer(r"\\(section|subsection|subsubsection)\*?\{([^{}]*)\}", text):
        title = re.sub(r"\s+", " ", m.group(2)).strip()
        out.append((m.group(1), title))
    return out


def env_counts(text):
    counts = {}
    for m in re.finditer(r"\\begin\{([a-zA-ZäöüÄÖÜß*]+)\}", text):
        name = m.group(1)
        if name in THEOREM_ENVS:
            counts[name] = counts.get(name, 0) + 1
    return counts


def prose_words(text):
    text = re.sub(r"\$[^$]*\$", " ", text)
    for env in MATH_ENVS:
        esc = re.escape(env)
        text = re.sub(r"\\begin\{" + esc + r"\}.*?\\end\{" + esc + r"\}",
                      " ", text, flags=re.S)
    text = re.sub(r"\\[a-zA-Z]+", " ", text)
    text = re.sub(r"[{}\[\]\\&_^~#]", " ", text)
    return len(text.split())


def check_migration_map(n, mig, map_override, fail):
    """Run the lecture's migration-map checker; a failure of the map fails the lecture."""
    cmd = [sys.executable, str(ROOT / mig["map_check"]),
           "--map", str(map_override or ROOT / mig["map"])]
    proc = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    lines = (proc.stdout + proc.stderr).strip().splitlines()
    if proc.returncode != 0:
        detail = "; ".join(lines[-4:]) if lines else "no output"
        fail("migration-map", f"lecture {n} is migrated (v0.3) but its migration map "
                              f"is not complete: {detail}")
    return lines[-1] if lines else ""


def check_one(n, max_growth, map_override=None):
    v01_path = V01_DIR / f"Vorlesungen{n}.tex"
    v02_path = V02_DIR / f"vl{n:02d}.tex"
    mig = MIGRATED_LECTURES.get(n)
    res = {"lecture": n, "failures": [], "warnings": [], "stats": {}}

    def fail(check, detail):
        res["failures"].append({"check": check, "detail": detail})

    def warn(check, detail):
        res["warnings"].append({"check": check, "detail": detail})

    if not v01_path.exists():
        fail("files", f"missing original {v01_path.name}")
        return res
    if not v02_path.exists():
        fail("files", f"missing current {v02_path.name}")
        return res

    old = strip_comments(v01_path.read_text(encoding="utf-8"))
    if mig:
        # v0.3: compare v0.1 with the immutable v0.2 text, and require the map.
        res["migrated"] = mig["since"]
        try:
            v02 = snapshot.member_bytes(ROOT, *mig["snapshot"]).decode("utf-8")
        except snapshot.SnapshotError as exc:
            fail("snapshot", f"v0.2 text of lecture {n} unavailable: {exc}")
            return res
        res["stats"]["map"] = check_migration_map(n, mig, map_override, fail)
        new = strip_comments(v02)
    else:
        new = strip_comments(v02_path.read_text(encoding="utf-8"))
    exc = ENRICHMENT_EXCEPTIONS.get(n, {})

    # ── maths preserved ───────────────────────────────────────
    old_math, new_math = math_bodies(old), math_bodies(new)
    new_set = set(new_math)
    missing = [m for m in old_math if m not in new_set]
    allowed = exc.get("math_edited", 0)
    res["stats"]["math"] = f"{len(old_math)}→{len(new_math)}"
    if len(missing) > allowed:
        sample = "; ".join(m[:60] for m in missing[:3])
        fail("maths",
             f"{len(missing)} v0.1 equation(s) no longer present "
             f"({allowed} allowed by exception): {sample}")
    elif missing:
        warn("maths",
             f"{len(missing)} equation(s) edited as recorded: {exc.get('reason', '')}")

    # ── labels preserved ──────────────────────────────────────
    old_lab, new_lab = labels(old), labels(new)
    renamed = exc.get("labels_renamed", {})
    lost = set()
    for lab in old_lab - new_lab:
        target = renamed.get(lab)
        if target and target in new_lab:
            continue
        lost.add(lab)
    res["stats"]["labels"] = f"{len(old_lab)}→{len(new_lab)}"
    if lost:
        fail("labels", f"lost: {', '.join(sorted(lost))}")

    # ── headings preserved ────────────────────────────────────
    old_head, new_head = headings(old), headings(new)
    new_titles = {t for _, t in new_head}
    lost_head = [t for _, t in old_head if t not in new_titles]
    res["stats"]["sections"] = f"{len(old_head)}→{len(new_head)}"
    if lost_head:
        fail("sections", f"heading(s) lost: {'; '.join(lost_head[:3])}")

    # ── environments not dropped ──────────────────────────────
    oc, nc = env_counts(old), env_counts(new)
    dropped = {k: (v, nc.get(k, 0)) for k, v in oc.items() if nc.get(k, 0) < v}
    res["stats"]["envs"] = f"{sum(oc.values())}→{sum(nc.values())}"
    if dropped:
        fail("environments",
             "; ".join(f"{k}: {a}→{b}" for k, (a, b) in dropped.items()))

    # ── growth within bounds ──────────────────────────────────
    ow, nw = prose_words(old), prose_words(new)
    res["stats"]["words"] = f"{ow}→{nw}"
    if ow > 0:
        growth = nw / ow
        res["stats"]["growth"] = f"{growth:.2f}×"
        if growth < 1.0:
            fail("growth", f"lecture shrank to {growth:.2f}× the original")
        elif growth > max_growth:
            fail("growth",
                 f"grew to {growth:.2f}× the original, over the {max_growth}× "
                 f"limit — enrichment was meant to be light")
        elif growth < 1.05:
            warn("growth", f"barely changed ({growth:.2f}×)")

    return res


GREEN, RED, YELLOW, BOLD, NC = (
    "\033[0;32m", "\033[0;31m", "\033[0;33m", "\033[1m", "\033[0m"
)


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", nargs="*", type=int)
    ap.add_argument("--max-growth", type=float, default=2.2,
                    help="largest allowed v0.2/v0.1 prose ratio (default 2.2)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--migration-map", action="append", default=[], metavar="N=FILE",
                    help="check migrated lecture N against FILE instead of its map "
                         "(red corpus only)")
    args = ap.parse_args()
    overrides = {}
    for spec in args.migration_map:
        num, _, path = spec.partition("=")
        if not num.isdigit() or int(num) not in MIGRATED_LECTURES or not path:
            sys.exit(f"error: --migration-map {spec!r}: N must be a migrated lecture "
                     f"({sorted(MIGRATED_LECTURES)}) and FILE nonempty")
        overrides[int(num)] = Path(path).resolve()

    numbers = sorted(int(p.stem[2:]) for p in V02_DIR.glob("vl[0-9][0-9].tex"))
    if args.only:
        numbers = [n for n in numbers if n in set(args.only)]
    if not numbers:
        sys.exit(f"error: no lectures found in {V02_DIR}")

    results = [check_one(n, args.max_growth, overrides.get(n)) for n in numbers]
    n_fail = sum(1 for r in results if r["failures"])
    n_warn = sum(1 for r in results if r["warnings"])

    if args.json:
        print(json.dumps({"lectures": len(results), "failed": n_fail,
                          "warned": n_warn, "results": results},
                         ensure_ascii=False, indent=2))
        return 1 if n_fail else 0

    print(f"{BOLD}Enrichment: v0.2 against archived v0.1{NC}"
          f" (lectures {', '.join(map(str, sorted(MIGRATED_LECTURES)))}: v0.2 snapshot"
          f" against v0.1, live v0.3 file governed by its migration map)")
    print(f"{'vl':>3}  {'maths':>11} {'labels':>9} {'sections':>10} "
          f"{'envs':>9} {'words':>13} {'growth':>7}   status")
    print("─" * 82)
    for r in results:
        s = r["stats"]
        status = (f"{RED}FAIL{NC}" if r["failures"]
                  else f"{YELLOW}warn{NC}" if r["warnings"] else f"{GREEN}ok{NC}")
        print(f"{r['lecture']:>3}  {s.get('math', '-'):>11} {s.get('labels', '-'):>9} "
              f"{s.get('sections', '-'):>10} {s.get('envs', '-'):>9} "
              f"{s.get('words', '-'):>13} {s.get('growth', '-'):>7}   {status}")
        if r.get("migrated"):
            print(f"      migrated: v0.2 snapshot compared; {s.get('map', '')}")
        for f in r["failures"]:
            print(f"      {RED}✗{NC} {f['check']}: {f['detail']}")
        for w in r["warnings"]:
            print(f"      {YELLOW}!{NC} {w['check']}: {w['detail']}")

    print("─" * 82)
    if n_fail:
        print(f"{RED}{BOLD}{n_fail} lecture(s) lost content or have an incomplete "
              f"migration map{NC}")
        return 1
    print(f"{GREEN}{BOLD}All {len(results)} lecture(s) preserved v0.1{NC}"
          f"{f' ({n_warn} with warnings)' if n_warn else ''}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
