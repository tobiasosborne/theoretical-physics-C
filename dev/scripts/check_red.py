#!/usr/bin/env python3
"""Run the red corpus: every planted failure must be caught by its gate.

A case is a directory tests/red/<gate>/<case>/ with a case.json (see
docs/plan/phase0/COORDINATION.md section 4). The case passes when its command
has the exit status specified by expect_exit_nonzero and its combined output
matches a specific expect_output_regex. Unexpected tracebacks and missing files
are BROKEN, not caught. Optional expect_traceback/expect_missing_file booleans
permit cases explicitly testing those failures. A gate
that lets a planted defect through makes this script exit 1.

Usage: python3 scripts/check_red.py [--gate NAME] [--list] [--require GATE ...]
"""
import argparse
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent


def validate_case(spec, gate):
    required = {"gate", "what", "cmd", "expect_exit_nonzero", "expect_output_regex"}
    optional = {"expect_traceback", "expect_missing_file"}
    if not isinstance(spec, dict) or not required <= spec.keys():
        raise ValueError("missing required case keys: " + ", ".join(sorted(required - spec.keys()) if isinstance(spec, dict) else required))
    if spec.keys() - required - optional:
        raise ValueError("unknown case keys: " + ", ".join(sorted(spec.keys() - required - optional)))
    for key in ("gate", "what", "cmd", "expect_output_regex"):
        if not isinstance(spec[key], str) or not spec[key].strip():
            raise ValueError(f"{key} must be a nonempty string")
    if spec["gate"] != gate:
        raise ValueError(f"gate {spec['gate']!r} does not equal directory gate {gate!r}")
    for key in ("expect_exit_nonzero", *optional):
        if key in spec and type(spec[key]) is not bool:
            raise ValueError(f"{key} must be a boolean")
    try:
        rx = re.compile(spec["expect_output_regex"], re.S)
    except re.error as exc:
        raise ValueError(f"invalid expect_output_regex: {exc}") from exc
    if rx.search("") or any(rx.search(word) for word in ("error", "Error", "ERROR", "fail", "FAIL", "failed", "Traceback", "No such file")):
        raise ValueError("expect_output_regex matches empty output or a generic failure word alone")
    return rx


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--gate")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--require", nargs="*", default=[],
                    help="gates that must have at least one case")
    ap.add_argument("--timeout", type=int, default=600)
    args = ap.parse_args()

    cases = sorted((ROOT / "tests" / "red").glob("*/*/case.json"))
    if args.gate:
        cases = [c for c in cases if c.parent.parent.name == args.gate]
    bad = 0
    seen = set()
    for cj in cases:
        rel = cj.parent.relative_to(ROOT)
        try:
            spec = json.loads(cj.read_text())
            rx = validate_case(spec, cj.parent.parent.name)
            cmd = spec["cmd"]
        except (OSError, ValueError, KeyError, TypeError) as exc:
            print(f"BROKEN  {rel}: case.json unusable ({exc})")
            bad += 1
            continue
        seen.add(cj.parent.parent.name)
        if args.list:
            print(f"{rel}: {spec.get('what', '')}")
            continue
        try:
            proc = subprocess.run(cmd, shell=True, cwd=ROOT, capture_output=True,
                                  text=True, timeout=args.timeout)
            out = proc.stdout + proc.stderr
            code = proc.returncode
        except (subprocess.TimeoutExpired, OSError) as exc:
            print(f"BROKEN  {rel}: command could not complete ({exc})")
            bad += 1
            continue
        broken = []
        if "Traceback (most recent call last):" in out and not spec.get("expect_traceback", False):
            broken.append("unexpected Python traceback")
        if re.search(r"no such file", out, re.I) and not spec.get("expect_missing_file", False):
            broken.append("unexpected No such file")
        if broken:
            bad += 1
            print(f"BROKEN  {rel}: {'; '.join(broken)}")
            print("        " + "\n        ".join(out.strip().splitlines()[-6:]))
            continue
        problems = []
        if (code != 0) != spec["expect_exit_nonzero"]:
            problems.append(f"gate exited {code}; expect_exit_nonzero={spec['expect_exit_nonzero']}")
        if not rx.search(out):
            problems.append(f"output does not match /{spec['expect_output_regex']}/")
        if problems:
            bad += 1
            print(f"MISSED  {rel}: {'; '.join(problems)}")
            print("        " + "\n        ".join(out.strip().splitlines()[-6:]))
        else:
            print(f"caught  {rel}")
    for gate in sorted(set(args.require) | ({args.gate} if args.gate else set())):
        if gate not in seen:
            bad += 1
            print(f"NO CASE gate '{gate}' has no red fixture")
    if args.list:
        return 1 if bad else 0
    print(f"\n{len(cases)} red case(s), {bad} problem(s)")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
