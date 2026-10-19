#!/usr/bin/env python3
"""One command per numerically-checked claim of chapter C2 (game levels).

Usage: python3 scripts/c02/c02_numerics.py level <ID>

Runs evidence/derivations/c02/check_gpt.py --verify (which recomputes every
level optimum over the extreme effects or by the ball formula and compares
with golden.json; it exits nonzero on any disagreement), then prints the
stored optimum P_opt of level <ID> as the last output line. The evidence
checker compares that line with the claim's expected value.

What this does not establish: see evidence/derivations/c02/REVIEW.md, B7.
"""
import json
import pathlib
import subprocess
import sys
from fractions import Fraction

ROOT = pathlib.Path(__file__).resolve().parents[2]
CHECK = ROOT / "evidence/derivations/c02/check_gpt.py"
GOLDEN = ROOT / "evidence/derivations/c02/golden.json"


def main() -> int:
    if len(sys.argv) != 3 or sys.argv[1] != "level":
        print(__doc__)
        return 2
    proc = subprocess.run([sys.executable, str(CHECK), "--verify"],
                          capture_output=True, text=True)
    if proc.returncode != 0:
        print(proc.stdout + proc.stderr)
        print("check_gpt.py --verify failed")
        return 1
    levels = [l for l in json.loads(GOLDEN.read_text())["levels"]
              if l["id"] == sys.argv[2]]
    if len(levels) != 1:
        print(f"level {sys.argv[2]!r} not found exactly once in golden.json")
        return 1
    print(float(Fraction(levels[0]["P_opt"])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
