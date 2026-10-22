#!/usr/bin/env python3
"""Check that every item of the third lecture has an entry in evidence/migrations/maps/vl03-map.json.

Usage:  python3 evidence/migrations/check_vl03_map.py [--list] [--map FILE] [--tex FILE]

The third lecture (latex/lectures/de/vl03.tex) migrates into chapter C3
(content/c03-hilbertraum).  Items are parsed exactly as in check_vl01_map.py (whose parser this
script imports): sections, display equations, environments (including the pmatrix columns of
vl03), figure inputs, list items and paragraphs of running text, each as "<kind>@<line>".

Fails when an item has no entry, an entry names no item (stale map), the sha256 of vl03.tex
differs from the map's, an entry has no valid status, a kept entry names no destination or a
destination that is not an ID of content/c03-*/de.tex (label, figure/table ID, depth block,
claim, \\num ID, transcluded definition), a deferred or dropped entry gives no reason, or a
named migration record does not exist.  Exit status 1 on any failure.
"""
import argparse
import hashlib
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from check_vl01_map import parse  # noqa: E402

ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "evidence"))
import snapshot  # noqa: E402  (scripts/evidence/snapshot.py)


def content_ids():
    ids = set()
    for d in sorted((ROOT / "content").glob("c03-*")):
        tex = (d / "de.tex").read_text(encoding="utf-8")
        ids |= set(re.findall(r"\\label\{([^}]+)\}", tex))
        ids |= set(re.findall(r"\\begin\{tpc(?:figure|table)\}\{([^}]+)\}", tex))
        ids |= set(re.findall(r"\bid=(c\d\d\.[vf]\d+)", tex))
        ids |= set(re.findall(r"\\claim(?:\[[^\]]*\])?\{([^}]+)\}", tex))
        ids |= set(re.findall(r"\\num\[([^\]]+)\]", tex))
        ids |= set(re.findall(r"\\tpcdef\{([^}]+)\}", tex))
        ids |= set(re.findall(r"\\demo\{([^}]+)\}", tex))
    return ids


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--map", default=str(HERE / "maps/vl03-map.json"))
    ap.add_argument("--tex", help="parse this file instead of the map's legacy text "
                    "(testing only; the sha256 check against the map still applies)")
    ap.add_argument("--root", default=str(ROOT),
                    help="root whose sources/ serve the legacy snapshot (red-corpus fixtures)")
    a = ap.parse_args()
    fails = []
    mp = json.loads(pathlib.Path(a.map).read_text(encoding="utf-8"))
    # The legacy text is the immutable v0.2 payload: the snapshot member named in the map
    # (served from Git once the live file is rewritten), else the live legacy_file.
    try:
        if a.tex:
            payload, origin = pathlib.Path(a.tex).read_bytes(), a.tex
        else:
            payload, origin = snapshot.legacy_payload(pathlib.Path(a.root), mp)
    except (snapshot.SnapshotError, OSError) as exc:
        print(f"vl03-map: legacy text unavailable: {exc}")
        print("check_vl03_map: 1 failure(s)")
        return 1
    items = parse(payload.decode("utf-8"))
    if a.list:
        for kind, n, what in items:
            print(f"{kind}@{n}\t{what}")
        return 0
    sha = hashlib.sha256(payload).hexdigest()
    if mp.get("legacy_sha256") != sha:
        fails.append(f"stale map: vl03.tex ({origin}) has sha256 {sha}, the map records {mp.get('legacy_sha256')}")
    entries = {}
    for e in mp["items"]:
        if e["item"] in entries:
            fails.append(f"duplicate entry {e['item']}")
        entries[e["item"]] = e
    found = {f"{k}@{n}" for k, n, _ in items}
    for kind, n, what in items:
        if f"{kind}@{n}" not in entries:
            fails.append(f"no entry: {kind}@{n}  {what}")
    for key in entries:
        if key not in found:
            fails.append(f"stale entry: {key} is not an item of vl03.tex")
    ids = content_ids()
    by = {"kept": 0, "deferred": 0, "dropped": 0}
    for key, e in entries.items():
        st = e.get("status")
        if st not in by:
            fails.append(f"{key}: status must be kept, deferred or dropped")
            continue
        by[st] += 1
        if st == "kept":
            if not e.get("destination"):
                fails.append(f"{key}: kept without a destination")
            for d in e.get("destination", []):
                if d not in ids:
                    fails.append(f"{key}: destination '{d}' is not an ID of chapter c03")
        else:
            if not e.get("reason"):
                fails.append(f"{key}: {st} without a reason")
            if st == "deferred" and not e.get("deferred_to"):
                fails.append(f"{key}: deferred without deferred_to")
        for m in e.get("migration", []):
            if not (HERE / f"{m}.json").is_file():
                fails.append(f"{key}: migration record {m} does not exist")
    for f in fails:
        print("vl03-map:", f)
    print(f"check_vl03_map: {len(items)} item(s) in vl03.tex, {len(entries)} map entr(ies): "
          f"{by['kept']} kept, {by['deferred']} deferred, {by['dropped']} dropped; {len(fails)} failure(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
