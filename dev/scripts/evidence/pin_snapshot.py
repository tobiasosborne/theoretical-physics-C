#!/usr/bin/env python3
"""Re-hash the members of an uncommitted working-tree snapshot (e.g. tpc-script-v0.3).

  python3 scripts/evidence/pin_snapshot.py tpc-script-v0.3            # re-pin, print changes
  python3 scripts/evidence/pin_snapshot.py tpc-script-v0.3 --add ../latex/lectures/de/vl01.tex
  python3 scripts/evidence/pin_snapshot.py tpc-script-v0.3 --check    # exit 1 if a hash is stale

A successor snapshot of the script (script v0.3 rewrites lectures 1 and 2) registers the live
lecture files while they are still being edited.  After the last edit, and before the commit,
this script writes the files' current sha256 into sources/<key>/source.json, into
sources/MANIFEST.sha256, and into applied_file_sha256 of every migration-record destination that
names this source key and file.  It changes hashes only: whether each applied destination still
carries its corrected wording (applied_text on applied_line, or old_text absent for
applied_removed) is checked afterwards by scripts/evidence/check_evidence.py, which must then be
run in private mode to refresh the receipt.

Refuses a source that records a Git commit (identifiers.git_commit): a committed snapshot is
immutable; changed files get a new key.
"""
import argparse
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent.parent


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def dump(path, data, raw):
    tail = raw[len(raw.rstrip("\n")):]
    path.write_text(json.dumps(data, indent=1, ensure_ascii=False) + tail, encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("key")
    ap.add_argument("--add", action="append", default=[], metavar="MEMBER",
                    help="register a further text member (path relative to sources/)")
    ap.add_argument("--check", action="store_true", help="report stale hashes, change nothing")
    a = ap.parse_args()
    sp = ROOT / "sources" / a.key / "source.json"
    raw = sp.read_text(encoding="utf-8")
    src = json.loads(raw)
    if src.get("identifiers", {}).get("git_commit"):
        sys.exit(f"{a.key} records a Git commit; a committed snapshot is immutable")
    for m in a.add:
        if any(f["path"] == m for f in src["files"]):
            sys.exit(f"{m} is already a member of {a.key}")
        if not (ROOT / "sources" / m).resolve().is_file():
            sys.exit(f"{m}: no such file under sources/")
        src["files"].append({"path": m, "role": "text", "media_type": "text/x-tex",
                             "sha256": "0" * 64})
    mp = ROOT / "sources" / "MANIFEST.sha256"
    manifest = mp.read_text(encoding="utf-8")
    changes, new_hash = [], {}
    for f in src["files"]:
        p = (ROOT / "sources" / f["path"]).resolve()
        h = sha(p)
        new_hash[str(p.relative_to(ROOT))] = h
        if f["sha256"] != h:
            changes.append(f"{f['path']}: {f['sha256'][:12]} -> {h[:12]}")
            f["sha256"] = h
        line = re.search(r"^[0-9a-f]{64}  " + re.escape(f["path"]) + "$", manifest, re.M)
        if line is None:
            manifest = manifest.rstrip("\n") + f"\n{h}  {f['path']}\n"
            changes.append(f"MANIFEST: added {f['path']}")
        elif not line.group(0).startswith(h):
            manifest = manifest.replace(line.group(0), f"{h}  {f['path']}")
    recs = []
    for rp in sorted((ROOT / "evidence" / "migrations").glob("M-*.json")):
        rraw = rp.read_text(encoding="utf-8")
        rec = json.loads(rraw)
        touched = False
        for loc in rec.get("legacy", []):
            h = new_hash.get(loc.get("file"))
            if loc.get("applied_source_key") == a.key and h and loc.get("applied_file_sha256") != h:
                changes.append(f"{rp.name} {loc['file']}:{loc['line']}: applied_file_sha256 -> {h[:12]}")
                loc["applied_file_sha256"] = h
                touched = True
        if touched:
            recs.append((rp, rec, rraw))
    for c in changes:
        print(c)
    if a.check:
        print(f"pin_snapshot: {len(changes)} stale hash(es) in {a.key}")
        return 1 if changes else 0
    dump(sp, src, raw)
    mp.write_text(manifest, encoding="utf-8")
    for rp, rec, rraw in recs:
        dump(rp, rec, rraw)
    print(f"pin_snapshot: {len(changes)} change(s) written; now run "
          "python3 scripts/evidence/check_evidence.py --private")
    return 0


if __name__ == "__main__":
    sys.exit(main())
