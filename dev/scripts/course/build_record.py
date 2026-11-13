#!/usr/bin/env python3
"""Write the build record build.json for one edition (called by build_course.sh).

The record is what lets check_levels.py refuse a build that is missing,
failed or stale: it holds the compiler's exit status and the sha256 of
every source file that went into the build: the chapter directories, the
style files latex/tpc-*.sty, the masters latex/course/*.tex, everything
under registry/generated/ (notation macros, definition texts) and the
token directory design/build/pkgN-<ground>/ of the build's flags.  A
change of the registry or of the tokens therefore marks the build stale.
"""
import argparse
import datetime
import hashlib
import json
import pathlib


def source_files(root: pathlib.Path, content: pathlib.Path, chapters, flags=None):
    """flags: the record's {"pkg", "ground", ...}; None hashes no token directory."""
    files = []
    for ch in chapters:
        files += [p for p in (content / ch).rglob("*") if p.is_file()]
    files += sorted((root / "latex").glob("tpc-*.sty"))
    files += sorted((root / "latex" / "course").glob("*.tex"))
    files += [p for p in (root / "registry" / "generated").rglob("*") if p.is_file()]
    if flags:
        tokens = root / "design" / "build" / f"pkg{flags.get('pkg')}-{flags.get('ground')}"
        files += [p for p in tokens.rglob("*") if p.is_file()]
    return sorted(set(files))


def sha256(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def hashes(root, content, chapters, flags=None):
    out = {}
    for p in source_files(root, content, chapters, flags):
        try:
            key = "content/" + str(p.relative_to(content))
        except ValueError:
            key = str(p.relative_to(root))
        out[key] = sha256(p)
    return out


def main():
    ap = argparse.ArgumentParser()
    for name in ("root", "content", "work", "job", "lang", "edition", "chapters",
                 "partial", "exit-status", "passes", "pkg", "ground", "math", "fonts"):
        ap.add_argument("--" + name, required=True)
    a = ap.parse_args()
    root, content, work = map(pathlib.Path, (a.root, a.content, a.work))
    chapters = [c for c in a.chapters.split(",") if c]
    log = work / f"{a.job}.log"
    flags = {"pkg": a.pkg, "ground": a.ground, "math": a.math, "fonts": a.fonts}
    record = {
        "job": a.job, "lang": a.lang, "edition": a.edition,
        "chapters": chapters, "partial": a.partial == "1",
        "flags": flags,
        "xelatex_exit_status": int(a.exit_status), "passes": int(a.passes),
        "finished": datetime.datetime.now().isoformat(timespec="seconds"),
        "log_sha256": sha256(log) if log.is_file() else None,
        "aux_sha256": sha256(work / f"{a.job}.aux") if (work / f"{a.job}.aux").is_file() else None,
        "sources": hashes(root, content, chapters, flags),
    }
    (work / "build.json").write_text(json.dumps(record, indent=1) + "\n")


if __name__ == "__main__":
    main()
