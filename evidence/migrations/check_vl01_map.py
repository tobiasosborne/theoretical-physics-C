#!/usr/bin/env python3
"""Check that every item of the first lecture has an entry in evidence/migrations/maps/vl01-map.json.

(The map is in the subdirectory maps/ because scripts/evidence/check_evidence.py validates every
*.json directly under evidence/migrations/ as a migration record.)

Usage:  python3 evidence/migrations/check_vl01_map.py [--list] [--map FILE] [--tex FILE]

Smoke A (chapters C0 and C1) is a migration of latex/lectures/de/vl01.tex.  This script parses
that file and fails unless the map accounts for every item it finds.  Items, each identified
by "<kind>@<line>" (line = the 1-based line of vl01.tex where the item starts):

  section      \\section, \\subsection, \\subsubsection
  equation     \\begin{equation} and \\begin{equation*}  (display equations)
  environment  every other \\begin{...} except the layout wrapper `center` and the
               inner-mathematics environments `split` and `cases`
               (itemize, enumerate, beispiel, übung, greybox, historical, tcolorbox)
  figure       \\input{figures/...}
  item         every \\item of a list
  text         every paragraph of running text: a line that begins prose after a blank
               line, after a heading or after the end of an environment or display

It also fails when
  - the map has an entry for an item that the parse does not find (a stale map),
  - the sha256 of vl01.tex differs from the one recorded in the map,
  - an entry has no status (kept | deferred | dropped), a kept entry names no destination,
    a deferred or dropped entry gives no reason,
  - a destination ID is not a label, figure, table, depth block or claim ID present in
    content/c00-*/de.tex or content/c01-*/de.tex (or a registry definition D<n> transcluded
    there),
  - a migration record named by an entry does not exist.
Exit status 1 on any failure, 0 otherwise.  --list prints the parsed items and exits.
"""
import argparse, hashlib, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SKIP_ENV = {"center", "split", "cases"}
EQ_ENV = {"equation", "equation*"}


def parse(tex):
    items = []
    depth_eq = 0
    para_open = False       # inside a paragraph of running text
    for n, raw in enumerate(tex.split("\n"), 1):
        line = raw.strip()
        if not line or line.startswith("%"):
            para_open = False
            continue
        structural = False
        m = re.match(r"\\(section|subsection|subsubsection)\{", line)
        if m:
            items.append(("section", n, line))
            para_open = False
            continue
        for b in re.finditer(r"\\begin\{([^}]+)\}", line):
            env = b.group(1)
            if env in EQ_ENV:
                items.append(("equation", n, env))
                depth_eq += 1
                structural = True
            elif env not in SKIP_ENV:
                items.append(("environment", n, env))
                structural = structural or line.startswith("\\begin")
            else:
                structural = structural or line.startswith("\\begin")
        ends_eq = len(re.findall(r"\\end\{(equation\*?)\}", line))
        if re.match(r"\\input\{figures/", line):
            items.append(("figure", n, line))
            para_open = False
            continue
        if re.match(r"\\item\b", line):
            items.append(("item", n, line[:60]))
            para_open = True
            depth_eq -= ends_eq
            continue
        in_eq_before = depth_eq - (1 if structural and any(b.group(1) in EQ_ENV for b in re.finditer(r"\\begin\{([^}]+)\}", line)) else 0)
        depth_eq -= ends_eq
        if in_eq_before > 0 or structural or re.match(r"\\(end|begin|parbox)\b", line):
            # inside or delimiting a display or an environment: not the start of prose;
            # a \parbox line that carries a tcolorbox is covered by its environment item
            para_open = False
            continue
        if not para_open:
            items.append(("text", n, line[:60]))
            para_open = True
    return items


def content_ids():
    ids = set()
    for d in sorted((ROOT / "content").glob("c0[01]-*")):
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
    ap.add_argument("--map", default=str(ROOT / "evidence/migrations/maps/vl01-map.json"))
    ap.add_argument("--tex", default=str(ROOT / "latex/lectures/de/vl01.tex"))
    a = ap.parse_args()
    texp = pathlib.Path(a.tex)
    tex = texp.read_text(encoding="utf-8")
    items = parse(tex)
    if a.list:
        for kind, n, what in items:
            print(f"{kind}@{n}\t{what}")
        return 0
    fails = []
    mp = json.loads(pathlib.Path(a.map).read_text(encoding="utf-8"))
    sha = hashlib.sha256(texp.read_bytes()).hexdigest()
    if mp.get("legacy_sha256") != sha:
        fails.append(f"stale map: vl01.tex has sha256 {sha}, the map records {mp.get('legacy_sha256')}")
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
            fails.append(f"stale entry: {key} is not an item of vl01.tex")
    ids = content_ids()
    for key, e in entries.items():
        st = e.get("status")
        if st not in ("kept", "deferred", "dropped"):
            fails.append(f"{key}: status must be kept, deferred or dropped")
            continue
        if st == "kept":
            if not e.get("destination"):
                fails.append(f"{key}: kept without a destination")
            for d in e.get("destination", []):
                if d not in ids:
                    fails.append(f"{key}: destination '{d}' is not an ID of chapters c00/c01")
        else:
            if not e.get("reason"):
                fails.append(f"{key}: {st} without a reason")
            if st == "deferred" and not e.get("deferred_to"):
                fails.append(f"{key}: deferred without deferred_to")
        for m in e.get("migration", []):
            if not (ROOT / "evidence/migrations" / f"{m}.json").is_file():
                fails.append(f"{key}: migration record {m} does not exist")
    by = {"kept": 0, "deferred": 0, "dropped": 0}
    for e in entries.values():
        if e.get("status") in by:
            by[e["status"]] += 1
    for f in fails:
        print("vl01-map:", f)
    partly = mp.get("partly_deferred", [])
    for p in partly:
        if p.get("item") not in entries or not p.get("deferred_to") or not p.get("reason"):
            fails.append(f"partly_deferred: bad entry {p.get('item')}")
            print("vl01-map:", fails[-1])
    print(f"check_vl01_map: {len(items)} item(s) in vl01.tex, {len(entries)} map entr(ies): "
          f"{by['kept']} kept (of which {len(partly)} with a part deferred), {by['deferred']} deferred, "
          f"{by['dropped']} dropped; {len(fails)} failure(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
