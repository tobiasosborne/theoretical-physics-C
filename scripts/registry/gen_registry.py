#!/usr/bin/env python3
"""Generate every derived registry file from the four authored JSON files.

Writes registry/generated/{tpc-notation.sty, tpc-definitions.tex, notation.web.json,
definitions.web.json, NOTATION.md, DEFINITIONS.md, TRANSLATION.md} and
registry/COLLISIONS.md. Output is deterministic (no timestamps) and each file
records the sha256 of its inputs, so check_registry.py can detect stale files by
regenerating in memory and comparing.

Usage: python3 scripts/registry/gen_registry.py [--root DIR] [--fix-mathml]

--fix-mathml rewrites the `mathml` field of every symbol in notation.json from
its TeX expansion (the MathML is derived, never authored by hand).
"""
import argparse
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import reglib  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=str(reglib.REPO))
    ap.add_argument("--fix-mathml", action="store_true")
    args = ap.parse_args()
    root = pathlib.Path(args.root)
    if args.fix_mathml:
        p = root / "registry" / "notation.json"
        doc = reglib.load_json(p)
        for s in doc["symbols"]:
            s["mathml"] = reglib.tex_to_mathml(reglib.instance_tex(s))
        p.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    data, raw = reglib.load_registry(root)
    files = reglib.generate(data, raw, root)
    for rel, text in files.items():
        out = root / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
    print(f"gen_registry: wrote {len(files)} files under {root / 'registry'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
