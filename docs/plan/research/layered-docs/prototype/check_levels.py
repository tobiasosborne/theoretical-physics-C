#!/usr/bin/env python3
"""Invariant checks for a two-build (full / lehramt) layered document.

Usage: python3 check_levels.py full.log full.aux lehramt.log lehramt.aux
Exit status 0 iff
  C1  neither log contains a TeX error ('!' line) or an undefined reference/citation;
  C2  every label defined in the lehramt build has the same number in the full build
      (core numbering is identical in both editions).
Prototype written 2026-10-09 for docs/plan/research/layered-docs/REPORT.md, section 5.
"""
import re, sys

def log_problems(path):
    txt = open(path, encoding="utf-8", errors="replace").read()
    errs = [l for l in txt.splitlines() if l.startswith("!")]
    undef = re.findall(r"(?:Reference|Citation) `[^']*' on page \d+ undefined", txt)
    return errs, undef

def labels(path):
    txt = open(path, encoding="utf-8", errors="replace").read()
    return dict(re.findall(r"\\newlabel\{([^}]*)\}\{\{([^}]*)\}", txt))

full_log, full_aux, core_log, core_aux = sys.argv[1:5]
bad = 0
for name, log in (("full", full_log), ("lehramt", core_log)):
    errs, undef = log_problems(log)
    for e in errs + undef:
        print(f"C1 {name}: {e}"); bad += 1
full, core = labels(full_aux), labels(core_aux)
for k, v in core.items():
    if full.get(k) != v:
        print(f"C2 label {k}: lehramt={v} full={full.get(k)}"); bad += 1
print(f"checked {len(core)} core labels; {bad} problem(s)")
sys.exit(1 if bad else 0)
