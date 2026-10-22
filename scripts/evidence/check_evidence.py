#!/usr/bin/env python3
"""Evidence gate: source registry, claims ledger, provenance ledger, gap list,
migration records, and the claim tags in content.

Usage:
  python3 scripts/evidence/check_evidence.py [--root DIR] [--content DIR]
                                             [--private | --public] [--run-numerics]

Layout under --root (default: the repository):
  sources/MANIFEST.sha256            "sha256  path" lines, path relative to sources/
  sources/<key>/source.json, rights.json
  evidence/claims.json provenance.json gaps.json
  evidence/migrations/M-NNNN.json
  evidence/receipts/private-check.json, evidence/receipts/reviews/<id>.json
  content/cNN-slug/de.tex, en.tex    (or --content DIR)
  registry/definitions.json          (optional; content/*/fixture/definitions.json too)
The JSON Schemas are always read from evidence/schema/ beside this script, never
from --root, so a fixture cannot weaken them.  The same holds for the list of
theorem-like units (theorem, lemma, proposition, corollary), which is read from
docs/authoring/contract.json (theorem_like) of this repository: the authoring
contract owns it, and scripts/course/check_levels.py reads the same list.

Modes.  A source is "private" (payload gitignored: books, the arXiv source) or
"tracked" (in git: the brief, the script snapshots).
  --private  everything: every manifest hash, every text quote, every migration
             record; on success writes evidence/receipts/private-check.json with
             the hashes of the ledgers, the manifest, the source records, the
             schemas, this script, referenced derivations and computation inputs;
             every numerical command runs and its per-claim result is recorded.
  --public   skips what needs a private payload (its hash, quotes read from it)
             and instead fails unless that receipt exists, records a passing
             private run, and carries hashes equal to the current files.
             Tracked sources are still hashed and their quotes still verified.
Default: private if any private payload file is on disk, else public.  In
private mode a missing payload is a failure, never a skip.

Rules (failure class in brackets; each has a planted case in tests/red/evidence):
  [schema]            every ledger file and record validates; no duplicate JSON key
  [duplicate-id]      IDs are unique per ledger
  [evidence-status]   evidence is one of source-quoted, source-backed, derived,
                      numerically-checked, author-stipulated; anything else
                      (e.g. stated-without-proof) is refused: gaps.json is the place
  [unknown-claim]     every \\claim{id} in content is a ledger row
  [unused-claim]      every ledger row of a chapter that has content is tagged
                      exactly once in de.tex and once in en.tex by \\claim; a row
                      of kind value is tagged by \\num[id] instead, at least once
                      per language
  [number]            every numeral in de.tex / en.tex is supported (see below)
  [claim-mismatch]    the tag is \\claim[presentation]{id}{status}; evidence,
                      presentation and depth declared in content equal the
                      ledger's; a theorem-like unit is tagged with a row of
                      that kind and vice versa; the id carries the chapter's
                      prefix; a tagged row has both statements; a ledger row
                      has a presentation only if its kind is theorem-like
  [content]           every directory under content/ is cNN-slug, one per chapter
  [unit-without-claim] every theorem, lemma, proposition, corollary carries a \\claim
  [K3]                a Kern claim has a non-empty scope
  [srcref]            \\srcref{key}{locus} in content: the key is a registered
                      source, and some claim tagged in the same file has a
                      provenance row from that source
  [no-provenance]     source-quoted / source-backed need a provenance row from a
                      source that is not an author stipulation; author-stipulated
                      needs one from a source of kind author-stipulation
  [link]              claim.provenance_ids and provenance.claim_ids agree
  [unregistered-source] a provenance row names a key with no sources/<key>/source.json
  [member]            the member is a file of that source and in the manifest, and
                      the row's member_sha256 equals the manifest's
  [locus]             text: a line window of at most 30 lines inside the member;
                      page-image: a page range inside the scan
  [quote]             text: the quote occurs wholly and contiguously inside the
                      stated line window of the hashed member; only runs of
                      whitespace are normalised
  [ocr]               a text quote from an OCR/extracted text layer is refused:
                      books are read from the page image
  [review]            a page-image row has a reviewer and a review receipt that
                      covers it; a claim's review receipt, if given, exists
  [derivation]        derived: the derivation file exists under evidence/ and has
                      the anchor
  [numerics]          numerically-checked: the script exists and the command invokes
                      it directly; in private mode it runs and its last line equals the
                      expected value within the tolerance
  [definition]        definition_ids exist in the definitions registry
  [migration]         the legacy file's hash and the old text at the stated line
                      still match (a record goes stale loudly; a changed live file
                      is read from its historical snapshot member in Git); an
                      applied destination is a hashed member of its source with
                      new_text on the legacy line (in place), applied_text on
                      applied_line (a rewritten file, script v0.3), or, with
                      applied_removed, old_text nowhere in it (passage removed)
  [registry]          source.json / rights.json present and valid; source.json
                      and manifest agree; no manifest entry without a source
  [manifest]          the file's current sha256 equals the manifest's
  [receipt]           public mode: receipt present, passing, and fresh

Numbers (COORDINATION.md section 1 rule 10).  A numeral is supported when
  (a) it is written \\num[claim-id]{value}{unit} and the claim's evidence is
      derived, numerically-checked, source-quoted or source-backed (the rules
      above then demand the derivation, the script, or the provenance locus); or
  (b) it stands, bare or as \\num{value}{unit}, inside a display environment
      (equation, align) that carries a \\claim with such evidence, or inside a
      theorem-like unit whose \\claim has such evidence.
  author-stipulated never supports a number.  Anything else fails [number].
What counts as a numeral (lexical; comments removed; the arguments of \\label,
\\ref, \\eqref, \\pageref, \\zoomref, \\tpcdef, \\defref, \\demo, \\claim,
\\srcref, \\begin and \\end are names and are not read):
  - a decimal: 13.6, 0{,}529, and 0,529 in running text;
  - scientific notation: 1.6e-19, 6 \\times 10^{..}, 6 \\cdot 10^{..}, 10^{-10};
  - a percentage: 50 \\%;
  - an integer with a unit: in mathematics an integer followed by an upright
    group (13\\,\\mathrm{eV}, 300\\ \\text{K}); in running text an integer, a
    space and a unit symbol of the list UNITS (300 K, 5 eV).
Exempt, and why:
  - bare integers without a unit (indices, exponents, matrix entries, small
    counting integers, 2 \\times 2, n = 1, case numbers): they are structure,
    and a lexer cannot tell a counted 3 from a measured 3.  A physical value
    that happens to be a bare integer (137, a quantum number given as data) is
    therefore NOT caught; the reviewer must ask for \\num there;
  - in mathematics, digits separated by a plain comma, (0,1), and an integer
    followed by an italic letter, 2A: a pair and a product, not a numeral;
  - a numeral glued to a letter, an underscore or a dot (IDs, c11.s2.1, x_{11}
    is two integers anyway);
  - figure files, chapter.json and the ledgers: not scanned here.  A value
    drawn in a figure comes from the formula or the data file of that figure
    (authoring contract section 8) and is the figure review's.
The check does not establish that the claim is about this number, nor that the
value printed equals the value derived, computed or quoted: the reviewer's.

What this checker cannot establish, and a reviewer must:
  - that a quote entails the claim it is filed under, or that the quote was not
    cut out of a context that reverses it;
  - that the hypotheses and scope of the source match those of the course claim
    (K3 checks that a scope is written down, not that it is right);
  - that a page-image quote is what the page shows: the checker verifies the
    scan's hash and the page range and counts such rows as "not machine-verified";
  - that a derivation is correct: it checks that the file and anchor exist;
  - that a numerical check tests the right quantity;
  - that an author stipulation says what TJO meant beyond the quoted words;
  - that prose outside theorem-like units carries a \\claim where it should;
  - that a \\srcref stands in the unit of the claim whose provenance row it
    reflects, and that the locus printed is the row's locus (the check is per
    file and per source key only);
  - that source.json metadata (title, edition, rights) is true;
  - that a receipt or a review receipt was produced by the run or the person it
    names: both are plain files (public mode trusts the private receipt's hashes).
Numerical commands run by default in private mode; public mode requires their
per-claim successful attestations. --run-numerics also executes them in public mode.
Exit status 1 on any failure, 0 otherwise.
"""
import argparse
import datetime
import hashlib
import json
import math
import shlex
import pathlib
import platform
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve()
REPO = HERE.parent.parent.parent
SCHEMA_DIR = REPO / "evidence" / "schema"

EVIDENCE = ("source-quoted", "source-backed", "derived", "numerically-checked",
            "author-stipulated")
CONTRACT = REPO / "docs" / "authoring" / "contract.json"
with open(CONTRACT, encoding="utf-8") as _fh:
    THEOREM_LIKE = tuple(json.load(_fh)["theorem_like"])
DEPTH_ENVS = ("vertiefung", "fundament")
MAX_WINDOW = 30
GAP_HINT = ("a statement without a local source, a derivation or a numerical check "
            "stays out of the material and belongs in evidence/gaps.json")

FAILS = []


def fail(cls, where, msg):
    FAILS.append(cls)
    print(f"FAIL [{cls}] {where}: {msg}")


# ------------------------------------------------------------------ helpers

def sha256_file(path, _cache={}):
    key = str(path)
    if key not in _cache:
        h = hashlib.sha256()
        with open(path, "rb") as fh:
            for block in iter(lambda: fh.read(1 << 20), b""):
                h.update(block)
        _cache[key] = h.hexdigest()
    return _cache[key]


def norm_ws(s):
    """The only normalisation applied to quotes: runs of whitespace become one space."""
    return " ".join(s.split())


def _no_dup_keys(pairs):
    d = {}
    for k, v in pairs:
        if k in d:
            raise ValueError(f"duplicate key '{k}'")
        d[k] = v
    return d


def load_json(path, where):
    """Return the parsed file or None (after reporting)."""
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh, object_pairs_hook=_no_dup_keys)
    except FileNotFoundError:
        fail("schema", where, "file is missing")
    except (ValueError, UnicodeDecodeError) as exc:
        fail("schema", where, f"not valid JSON ({exc})")
    return None


def validate(inst, schema, path, defs):
    """Subset of JSON Schema: type, enum, pattern, minLength, minimum, minItems,
    required, properties, additionalProperties (false), items, $ref (#/$defs/X)."""
    if "$ref" in schema:
        return validate(inst, defs[schema["$ref"].rsplit("/", 1)[-1]], path, defs)
    errs = []
    types = schema.get("type")
    if types is not None:
        types = [types] if isinstance(types, str) else types
        isnum = isinstance(inst, (int, float)) and not isinstance(inst, bool)
        ok = any((t == "object" and isinstance(inst, dict))
                 or (t == "array" and isinstance(inst, list))
                 or (t == "string" and isinstance(inst, str))
                 or (t == "boolean" and isinstance(inst, bool))
                 or (t == "integer" and isinstance(inst, int) and not isinstance(inst, bool))
                 or (t == "number" and isnum)
                 or (t == "null" and inst is None) for t in types)
        if not ok:
            return [f"{path}: expected {'/'.join(types)}, got {type(inst).__name__}"]
    if "enum" in schema and inst not in schema["enum"]:
        errs.append(f"{path}: {inst!r} is not one of {schema['enum']}")
    if isinstance(inst, str):
        if "pattern" in schema and not re.search(schema["pattern"], inst):
            errs.append(f"{path}: {inst!r} does not match /{schema['pattern']}/")
        if len(inst.strip()) < schema.get("minLength", 0):
            errs.append(f"{path}: string shorter than {schema['minLength']}")
    if isinstance(inst, (int, float)) and not isinstance(inst, bool):
        if "minimum" in schema and inst < schema["minimum"]:
            errs.append(f"{path}: {inst} is below the minimum {schema['minimum']}")
    if isinstance(inst, list):
        if len(inst) < schema.get("minItems", 0):
            errs.append(f"{path}: fewer than {schema['minItems']} items")
        if "items" in schema:
            for i, item in enumerate(inst):
                errs += validate(item, schema["items"], f"{path}[{i}]", defs)
    if isinstance(inst, dict):
        for key in schema.get("required", []):
            if key not in inst:
                errs.append(f"{path}: missing required field '{key}'")
        props = schema.get("properties", {})
        for key, val in inst.items():
            if key in props:
                errs += validate(val, props[key], f"{path}.{key}", defs)
            elif schema.get("additionalProperties") is False:
                errs.append(f"{path}: unknown field '{key}'")
    return errs


def schema_of(name):
    with open(SCHEMA_DIR / name, encoding="utf-8") as fh:
        return json.load(fh)


def check_record(rec, schema, defname, where, skip=()):
    """Validate one record; report; return True if it is usable."""
    errs = validate(rec, schema["$defs"][defname], where, schema["$defs"])
    errs = [e for e in errs if not any(s in e for s in skip)]
    for e in errs:
        fail("schema", where, e)
    return not errs


def load_ledger(path, where, list_key, schema_name, defname, id_skip=None):
    """Load {schema_version, <list_key>: [...]}; return the valid records."""
    data = load_json(path, where)
    if data is None:
        return []
    schema = schema_of(schema_name)
    if (not isinstance(data, dict) or data.get("schema_version") != 1
            or not isinstance(data.get(list_key), list)
            or set(data) - {"schema_version", list_key, "note"}):
        fail("schema", where, f"expected an object with schema_version 1 and a list '{list_key}'")
        return []
    good, seen = [], set()
    for i, rec in enumerate(data[list_key]):
        rid = rec.get("id") if isinstance(rec, dict) else None
        w = f"{where}:{rid if isinstance(rid, str) else '#%d' % i}"
        skip = id_skip(rec, w) if id_skip else ()
        ok = check_record(rec, schema, defname, w, skip) and not skip
        if isinstance(rid, str):
            if rid in seen:
                fail("duplicate-id", where, f"ID '{rid}' occurs more than once")
                ok = False
            seen.add(rid)
        if ok:
            good.append(rec)
    return good


def inside(root, rel):
    """Resolve rel under root; None if it escapes root."""
    p = (root / rel).resolve()
    try:
        p.relative_to(root)
    except ValueError:
        return None
    return p


# ----------------------------------------------------------- source registry

class Registry:
    def __init__(self):
        self.manifest = {}      # manifest path -> sha256
        self.sources = {}       # key -> source.json
        self.owner = {}         # manifest path -> (key, file record)
        self.bad = set()        # manifest paths whose current bytes are not the manifest's
        self.unchecked = set()  # manifest paths not hashed in this mode

    def path(self, root, mpath):
        return inside(root, pathlib.Path("sources") / mpath)

    def git_target(self, mpath):
        """Historical snapshot members have distinct manifest names and Git payloads."""
        owner = self.owner.get(mpath)
        if owner is None:
            return None
        src = self.sources[owner[0]]
        member = src.get("retrieval", {}).get("git_members", {}).get(mpath)
        if member is None:
            return None
        commit = src.get("identifiers", {}).get("git_commit", "")
        if (src["kind"] != "script-snapshot" or src["storage"] != "tracked"
                or not re.fullmatch(r"[0-9a-f]{40}", commit)
                or not isinstance(member, str) or member.startswith("/")
                or ".." in pathlib.PurePosixPath(member).parts):
            raise OSError("invalid Git snapshot member or commit")
        return commit, member

    def payload(self, root, mpath):
        target = self.git_target(mpath)
        if target is None:
            return self.path(root, mpath).read_bytes()
        proc = subprocess.run(["git", "-C", str(root), "show", f"{target[0]}:{target[1]}"],
                              capture_output=True)
        if proc.returncode:
            raise OSError("historical snapshot payload is unavailable from Git")
        return proc.stdout

    def historical_payload(self, root, file, digest):
        for mpath in self.owner:
            if self.manifest.get(mpath) != digest:
                continue
            target = self.git_target(mpath)
            if target is not None and target[1] == file:
                return self.payload(root, mpath)
        return None


def load_registry(root):
    reg = Registry()
    mfile = root / "sources" / "MANIFEST.sha256"
    try:
        lines = mfile.read_text(encoding="utf-8").splitlines()
    except (FileNotFoundError, UnicodeDecodeError):
        fail("registry", "sources/MANIFEST.sha256", "manifest is missing or unreadable")
        lines = []
    for n, line in enumerate(lines, 1):
        if not line.strip():
            continue
        m = re.fullmatch(r"([0-9a-f]{64})  (\S.*)", line)
        if not m:
            fail("registry", f"sources/MANIFEST.sha256:{n}", "not a 'sha256  path' line")
            continue
        if m.group(2) in reg.manifest:
            fail("registry", f"sources/MANIFEST.sha256:{n}", f"path '{m.group(2)}' listed twice")
        if reg.path(root, m.group(2)) is None:
            fail("registry", f"sources/MANIFEST.sha256:{n}", "path leaves the root")
            continue
        reg.manifest[m.group(2)] = m.group(1)

    sschema, rschema = schema_of("source.schema.json"), schema_of("rights.schema.json")
    sdir = root / "sources"
    for d in sorted(p for p in sdir.iterdir() if p.is_dir()) if sdir.is_dir() else []:
        w = f"sources/{d.name}/source.json"
        if not (d / "source.json").exists():
            fail("registry", f"sources/{d.name}", "directory without source.json")
            continue
        src = load_json(d / "source.json", w)
        if src is None or not check_record(src, sschema, "source", w):
            continue
        if src["key"] != d.name:
            fail("registry", w, f"key '{src['key']}' is not the directory name")
            continue
        rights = load_json(d / "rights.json", f"sources/{d.name}/rights.json")
        if rights is None or not check_record(rights, rschema, "rights",
                                              f"sources/{d.name}/rights.json"):
            continue
        if rights["key"] != d.name:
            fail("registry", f"sources/{d.name}/rights.json", "key is not the directory name")
        reg.sources[d.name] = src
        for f in src["files"]:
            if f["path"] in reg.owner:
                fail("registry", w, f"file '{f['path']}' also belongs to source "
                     f"'{reg.owner[f['path']][0]}'")
            reg.owner[f["path"]] = (d.name, f)
            if f["path"] not in reg.manifest:
                fail("registry", w, f"file '{f['path']}' is not in the manifest")
            elif reg.manifest[f["path"]] != f["sha256"]:
                fail("registry", w, f"sha256 of '{f['path']}' differs from the manifest")
    for mpath in reg.manifest:
        if mpath not in reg.owner:
            fail("registry", "sources/MANIFEST.sha256",
                 f"entry '{mpath}' belongs to no registered source")
    return reg


def private_payload_present(root, reg):
    for mpath, (key, _f) in reg.owner.items():
        if reg.sources[key]["storage"] == "private":
            p = reg.path(root, mpath)
            if p is not None and p.exists():
                return True
    return False


def check_manifest(root, reg, private):
    checked = skipped = 0
    for mpath, digest in reg.manifest.items():
        key = reg.owner.get(mpath, (None,))[0]
        storage = reg.sources[key]["storage"] if key else "private"
        if storage == "private" and not private:
            skipped += 1
            reg.unchecked.add(mpath)
            continue
        p = reg.path(root, mpath)
        try:
            historical = reg.git_target(mpath) is not None
            actual = hashlib.sha256(reg.payload(root, mpath)).hexdigest() if historical else None
        except OSError as exc:
            fail("manifest", f"sources/{mpath}", str(exc))
            reg.bad.add(mpath)
            checked += 1
            continue
        if not historical and not p.is_file():
            fail("manifest", f"sources/{mpath}", "payload file is missing")
            reg.bad.add(mpath)
        elif (actual if historical else sha256_file(p)) != digest:
            fail("manifest", f"sources/{mpath}",
                 "stale manifest hash: the file's sha256 is not the manifest's")
            reg.bad.add(mpath)
        checked += 1
    return checked, skipped


# ------------------------------------------------------------------ ledgers

def claim_evidence_skip(rec, where):
    """Report an inadmissible evidence value with the specific message."""
    if isinstance(rec, dict) and "evidence" in rec and rec["evidence"] not in EVIDENCE:
        fail("evidence-status", where,
             f"'{rec['evidence']}' is not an evidence status ({', '.join(EVIDENCE)}); {GAP_HINT}")
        return (".evidence:",)
    return ()


def review_receipt_ok(root, rid, covered, where, provenance=None):
    p = root / "evidence" / "receipts" / "reviews" / f"{rid}.json"
    if not re.fullmatch(r"R-[0-9]{4}", rid or "") or not p.is_file():
        fail("review", where, f"review receipt '{rid}' does not exist under "
             "evidence/receipts/reviews/")
        return
    rec = load_json(p, f"evidence/receipts/reviews/{rid}.json")
    if rec is None or not check_record(rec, schema_of("review.schema.json"), "review",
                                       f"evidence/receipts/reviews/{rid}.json"):
        return
    if rec["id"] != rid:
        fail("review", where, f"review receipt file {rid}.json carries id '{rec['id']}'")
    if covered not in rec["covers"]:
        fail("review", where, f"review receipt {rid} does not cover '{covered}'")
    if provenance is not None:
        if rec["reviewer"] != provenance["reviewer"]:
            fail("review", where, f"review receipt {rid} reviewer does not equal the provenance reviewer")
        bindings = [b for b in rec["bindings"] if b["provenance_id"] == covered]
        expected = {"provenance_id": covered, "member_sha256": provenance["member_sha256"],
                    "quote_sha256": hashlib.sha256(provenance["quote"].encode("utf-8")).hexdigest()}
        if bindings != [expected]:
            fail("review", where, f"review receipt {rid} lacks the exact provenance/member/quote binding for '{covered}'")
    if rec["verdict"] != "pass":
        fail("review", where, f"review receipt {rid} has verdict '{rec['verdict']}'")


def check_provenance_row(root, reg, row, private, stats):
    w = f"provenance.json:{row['id']}"
    key = row["source_key"]
    if key not in reg.sources:
        fail("unregistered-source", w, f"source key '{key}' has no valid "
             f"sources/{key}/source.json and rights.json")
        return
    member = row["member"]
    owner = reg.owner.get(member)
    if owner is None or owner[0] != key or member not in reg.manifest:
        fail("member", w, f"member '{member}' is not a manifest file of source '{key}'")
        return
    frec = owner[1]
    if row["member_sha256"] != reg.manifest[member]:
        fail("member", w, f"member_sha256 is not the manifest hash of '{member}'")
        return
    loc = row["locus"]
    readable = member not in reg.unchecked and member not in reg.bad

    if row["read_from"] == "page-image":
        if frec["role"] != "scan" or "pages" not in frec:
            fail("locus", w, f"read_from page-image needs a scan with a page count; "
                 f"'{member}' has role '{frec['role']}'")
            return
        first = loc.get("page_index")
        last = loc.get("page_index_end", first)
        if (not isinstance(first, int) or not isinstance(last, int)
                or not 1 <= first <= last <= frec["pages"] or not loc.get("printed_page")):
            fail("locus", w, f"page-image locus needs page_index (and optional page_index_end) "
                 f"within 1..{frec['pages']} and printed_page")
            return
        if not (row.get("reviewer") or "").strip() or not row.get("review_receipt"):
            fail("review", w, "a page-image quote is not machine-verifiable: it needs a "
                 "reviewer and a review_receipt")
        else:
            review_receipt_ok(root, row["review_receipt"], row["id"], w, row)
        stats["page_image"] += 1
        return

    # read_from == "text"
    if frec["role"] != "text":
        fail("ocr", w, f"'{member}' has role '{frec['role']}': a book's text layer is for "
             "finding the page only; quote from the page image (read_from page-image, "
             "member = the scan)")
        return
    a, b = loc.get("line_start"), loc.get("line_end")
    if not isinstance(a, int) or not isinstance(b, int) or not 1 <= a <= b:
        fail("locus", w, "text locus needs line_start <= line_end (1-based, inclusive)")
        return
    if b - a + 1 > MAX_WINDOW:
        fail("locus", w, f"line window {a}-{b} is wider than {MAX_WINDOW} lines")
        return
    if not readable:
        if member in reg.unchecked:
            stats["text_skipped"] += 1
        else:
            fail("quote", w, f"cannot verify: '{member}' is missing or not the hashed file")
        return
    try:
        text = reg.payload(root, member).decode("utf-8")
    except UnicodeDecodeError:
        fail("quote", w, f"'{member}' is not UTF-8 text")
        return
    lines = text.split("\n")
    if b > len(lines):
        fail("locus", w, f"line window {a}-{b} is outside '{member}' ({len(lines)} lines)")
        return
    quote = norm_ws(row["quote"])
    if quote in norm_ws("\n".join(lines[a - 1:b])):
        stats["text_verified"] += 1
    elif quote in norm_ws(text):
        fail("quote", w, f"quote outside the stated window: it occurs in '{member}' "
             f"but not within lines {a}-{b}")
    else:
        fail("quote", w, f"quote not found: no whole, contiguous match in '{member}' "
             f"lines {a}-{b} (nor anywhere else in the member)")


def md_anchors(text):
    out = set(re.findall(r"<a\s+(?:id|name)=\"([^\"]+)\"", text))
    for m in re.finditer(r"^#{1,6}\s+(.*?)\s*#*\s*$", text, re.M):
        slug = re.sub(r"[^\w\- ]", "", m.group(1).strip().lower()).replace(" ", "-")
        out.add(slug)
    return out


def definition_ids(root, content):
    ids = set()
    paths = [root / "registry" / "definitions.json"]
    paths += sorted(content.glob("*/fixture/definitions.json")) if content.is_dir() else []
    for p in paths:
        if p.is_file():
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
                ids |= {d["id"] for d in data["definitions"]}
            except (ValueError, KeyError, TypeError):
                fail("definition", str(p.relative_to(root)), "unreadable definitions file")
    return ids


def numeric_argv(root, num, where):
    """Accept a direct script invocation, never shell composition or interpreter code."""
    try:
        argv = shlex.split(num["command"])
    except ValueError:
        argv = []
    script = inside(root, num["script"])
    # Interpreter options are deliberately excluded: -c/-m/-e can merely mention
    # the script while running unrelated code. Script arguments follow its path.
    interpreter = bool(argv and re.fullmatch(r"(?:python(?:[0-9]+(?:\.[0-9]+)*)?|julia|bash|sh|node)",
                                             pathlib.Path(argv[0]).name))
    index = 1 if interpreter else 0
    candidate = inside(root, argv[index]) if len(argv) > index else None
    if (script is None or candidate != script or
            any(a in ("&&", "||", ";", "|", ">", ">>", "<", "&") for a in argv)):
        fail("numerics", where, "command must directly invoke the declared script "
             f"'{num['script']}' with arguments (no shell composition)")
        return None
    return argv


def run_numeric(root, claim, where, argv):
    num = claim["numerics"]
    try:
        proc = subprocess.run(argv, cwd=root, capture_output=True, text=True, timeout=600)
    except (subprocess.TimeoutExpired, OSError) as exc:
        fail("numerics", where, f"command could not run: {exc}")
        return None
    out = [ln for ln in proc.stdout.splitlines() if ln.strip()]
    try:
        value = float(out[-1])
    except (IndexError, ValueError):
        fail("numerics", where, f"command exit {proc.returncode}; its last output line "
             "is not a number")
        return None
    if (proc.returncode != 0 or not math.isfinite(value) or
            not abs(value - num["expected"]) <= num["tolerance"]):
        fail("numerics", where, f"numerical check failed: got {value!r} (exit "
             f"{proc.returncode}), expected {num['expected']!r} within {num['tolerance']!r}")
        return None
    return {"result": "pass", "script": num["script"], "command": num["command"],
            "value": value, "expected": num["expected"], "tolerance": num["tolerance"],
            "exit_status": proc.returncode}


def check_claims(root, content, reg, claims, prov, args, stats):
    prov_by_id = {p["id"]: p for p in prov}
    claim_ids = {c["id"] for c in claims}
    defs = None
    for p in prov:
        for cid in p["claim_ids"]:
            c = next((c for c in claims if c["id"] == cid), None)
            if c is None:
                if cid not in stats["all_claim_ids"]:
                    fail("link", f"provenance.json:{p['id']}", f"claim '{cid}' is not in the ledger")
            elif p["id"] not in c["provenance_ids"]:
                fail("link", f"provenance.json:{p['id']}",
                     f"names claim '{cid}', which does not list it in provenance_ids")
    for c in claims:
        w = f"claims.json:{c['id']}"
        if c["presentation"] and c["kind"] not in THEOREM_LIKE:
            fail("claim-mismatch", w, f"presentation '{c['presentation']}' on a row of kind "
                 f"'{c['kind']}': a presentation is admitted only for theorem-like units "
                 f"({', '.join(THEOREM_LIKE)})")
        if c["depth"] == "kern" and not (c.get("scope") or "").strip():
            fail("K3", w, "Kern claim without scope: state the hypotheses and the "
                 "domain of validity")
        kinds = []
        for pid in c["provenance_ids"]:
            p = prov_by_id.get(pid)
            if p is None:
                if pid not in stats["all_prov_ids"]:
                    fail("link", w, f"provenance row '{pid}' does not exist")
                continue
            if c["id"] not in p["claim_ids"]:
                fail("link", w, f"lists '{pid}', whose claim_ids do not name this claim")
            src = reg.sources.get(p["source_key"])
            if src is not None:
                kinds.append(src["kind"])
        ev = c["evidence"]
        if ev in ("source-quoted", "source-backed") and not any(
                k != "author-stipulation" for k in kinds):
            fail("no-provenance", w, f"{ev} claim without a provenance row from a "
                 "registered source")
        if ev == "author-stipulated" and "author-stipulation" not in kinds:
            fail("no-provenance", w, "author-stipulated claim without a provenance row "
                 "quoting a source of kind author-stipulation (the brief)")
        if ev == "derived":
            d = c.get("derivation") or ""
            path, _, anchor = d.partition("#")
            p = inside(root, path) if path else None
            if not anchor or ".." in path or p is None or not p.is_file():
                fail("derivation", w, f"derived claim needs 'derivation': an existing "
                     f"evidence/...md#anchor (got '{d}')")
            elif anchor not in md_anchors(p.read_text(encoding="utf-8")):
                fail("derivation", w, f"anchor '#{anchor}' not found in {path}")
        if ev == "numerically-checked":
            num = c.get("numerics")
            p = inside(root, num["script"]) if num else None
            if p is None or not p.is_file():
                fail("numerics", w, "numerically-checked claim needs 'numerics' with an "
                     "existing script")
            else:
                argv = numeric_argv(root, num, w)
                for dep in num.get("inputs", []):
                    dp = inside(root, dep)
                    if dp is None or not dp.is_file():
                        fail("numerics", w, f"declared computation input '{dep}' is missing or outside root")
                if argv is not None and args.run_numerics:
                    result = run_numeric(root, c, w, argv)
                    stats["numerics_run"] += 1
                    if result is not None:
                        stats["numerics_results"][c["id"]] = result
                else:
                    stats["numerics_not_run"] += 1
        if c["definition_ids"]:
            if defs is None:
                defs = definition_ids(root, content)
            for did in c["definition_ids"]:
                if did not in defs:
                    fail("definition", w, f"definition '{did}' is not in the definitions registry")
        if c.get("review_receipt"):
            review_receipt_ok(root, c["review_receipt"], c["id"], w)
    return claim_ids


# ------------------------------------------------------------------ content

DISPLAY_ENVS = ("equation", "equation*", "align", "align*")
# evidence that supports a numeric value (COORDINATION.md section 1 rule 10)
NUMBER_EVIDENCE = ("derived", "numerically-checked", "source-quoted", "source-backed")
# unit symbols recognised after an integer in running text (in mathematics a unit
# is recognised by its upright setting, \mathrm{..} or \text{..}, not by this list)
UNITS = ("eV|meV|keV|MeV|GeV|TeV|J|kJ|K|mK|kg|g|mg|m|cm|mm|nm|pm|fm|km|Å|s|ms|ns|ps|fs|"
         "Hz|kHz|MHz|GHz|THz|T|mT|V|mV|kV|A|mA|C|W|kW|N|Pa|hPa|bar|mol|rad|u|°C|°")
_G = r"\{((?:[^{}]|\{[^{}]*\})*)\}"       # one braced group, one level of nesting
_NB = r"(?<![A-Za-z0-9_.])"               # not glued to a name, an ID or another number
TOKEN = re.compile(
    r"\\(?P<be>begin|end)\s*\{(?P<env>[^}]*)\}"
    r"|\\claim\s*(?:\[(?P<pres>[^\]]*)\])?\s*\{(?P<cid>[^}]*)\}\s*\{(?P<status>[^}]*)\}"
    r"|(?P<badclaim>\\claim(?![A-Za-z]))"
    r"|\\srcref\s*\{(?P<srckey>[^}]*)\}\s*(?:\{[^}]*\})?"
    r"|\\num(?![A-Za-z])\s*(?:\[(?P<numid>[^\]]*)\])?\s*(?:" + _G.replace("(", "(?P<numval>", 1)
    + r"\s*" + _G.replace("(", "(?P<numunit>", 1) + r")?"
    r"|\\(?:label|ref|eqref|pageref|zoomref|tpcdef|defref|demo)\s*\{[^}]*\}"
    r"|(?P<num>" + _NB + r"(?:"
    r"\d+(?:\.\d+|\{,\}\d+)(?:[eE][-+]?\d+)?"                  # 13.6   0{,}529   1.6e-19
    r"|\d+[eE][-+]?\d+"                                          # 3e8
    r"|\d+\s*(?:\\times|\\cdot)\s*10\s*\^"                       # 6 \times 10^
    r"|10\s*\^\s*\{?\s*[-+]?\d"                                  # 10^{-10}
    r"|\d+\s*(?:\\,|~)?\s*\\%"                                   # 50 \%
    r"|\d+\s*(?:\\[,;:! ]|~)?\s*\\(?:mathrm|text|textrm)\s*\{"   # 13\,\mathrm{eV}
    r"))"
    r"|(?P<textnum>" + _NB + r"(?:\d+,\d+(?![\d,])"              # 0,529 (running text only)
    r"|\d+(?:\s|~|\\,)+(?:" + UNITS + r")(?![A-Za-z])))"         # 300 K (running text only)
    r"|(?P<dollar>\$)"
    r"|\\[^A-Za-z]")                                             # \$ \% \\ and friends


def text_contexts(text):
    spans = []
    for m in re.finditer(r"\\(?:text|textrm)\s*\{", text):
        depth, end = 1, m.end()
        while end < len(text) and depth:
            if text[end] == "\\":
                end += 2
                continue
            depth += (text[end] == "{") - (text[end] == "}")
            end += 1
        spans.append((m.end(), end - 1))
    return spans


def scan_tex(path, where, srcrefs=None, numbers=None):
    """Return [(id, status, presentation|None, depth, unit|None, line)]; report units
    without claim.  \\srcref keys are appended to srcrefs as (key, line).  Numerals are
    appended to numbers as (text, line, claim id of \\num or None, [(claim id, status)
    of the display and the theorem-like units around it]); the last list is complete
    only when the file has been read to the end."""
    # a % starts a comment unless an odd number of backslashes precedes it
    text = re.sub(r"(?<!\\)((?:\\\\)*)%.*", r"\1", path.read_text(encoding="utf-8"))
    text_spans = text_contexts(text)
    uses, stack, inline = [], [], False
    pos = 0
    while True:
        m = TOKEN.search(text, pos)
        if not m:
            break
        pos = m.end()
        line = text.count("\n", 0, m.start()) + 1
        g = m.groupdict()
        if g["be"] == "begin":
            stack.append({"name": g["env"], "line": line, "claimed": False, "claims": []})
        elif g["be"] == "end":
            if not stack or stack[-1]["name"] != g["env"]:
                fail("claim-mismatch", f"{where}:{line}", f"\\end{{{g['env']}}} does not "
                     "close the open environment; cannot attribute claims")
                return uses
            top = stack.pop()
            if top["name"] in THEOREM_LIKE and not top["claimed"]:
                fail("unit-without-claim", f"{where}:{top['line']}",
                     f"{top['name']} without \\claim: every theorem-like unit carries one; {GAP_HINT}")
        elif g["srckey"] is not None:
            if srcrefs is not None:
                srcrefs.append((g["srckey"].strip(), line))
        elif g["badclaim"] is not None:
            fail("claim-mismatch", f"{where}:{line}", "malformed \\claim: expected "
                 "\\claim[presentation]{id}{evidence}")
        elif g["cid"] is not None:
            names = [f["name"] for f in stack]
            depth = next((d for d in ("fundament", "vertiefung") if d in names), "kern")
            unit = stack[-1]["name"] if stack and stack[-1]["name"] in THEOREM_LIKE else None
            if unit:
                stack[-1]["claimed"] = True
            if stack:
                stack[-1]["claims"].append((g["cid"].strip(), g["status"].strip()))
            uses.append((g["cid"].strip(), g["status"].strip(),
                         (g["pres"] or "").strip() or None, depth, unit, line))
        elif g["dollar"]:
            inline = not inline
        elif m.group(0).startswith("\\num") and g["num"] is None and g["textnum"] is None:
            if g["numval"] is None or g["numunit"] is None or not g["numval"].strip():
                fail("number", f"{where}:{line}", "malformed \\num: expected "
                     "\\num[claim-id]{value}{unit} (the unit may be empty)")
            elif numbers is not None:
                numbers.append((g["numval"].strip(), line, (g["numid"] or "").strip() or None,
                                _cover(stack), True))
        elif g["num"] is not None or g["textnum"] is not None:
            in_math = inline or any(f["name"] in DISPLAY_ENVS for f in stack)
            if (g["textnum"] is not None and in_math and
                    not any(a <= m.start() < b for a, b in text_spans)):
                # (0,1) is a pair of integers and 2 A is twice A; not numerals
                pos = m.start() + 1
                continue
            if numbers is not None:
                numbers.append((" ".join(m.group(0).split()), line, None, _cover(stack), False))
    return uses


def _cover(stack):
    """The claim lists (live references) that can cover a numeral at this place: the
    innermost display environment and every enclosing theorem-like unit."""
    frames = [f for f in stack if f["name"] in THEOREM_LIKE]
    if stack and stack[-1]["name"] in DISPLAY_ENVS:
        frames.append(stack[-1])
    return [f["claims"] for f in frames]


def check_content(root, content, claims, stats, reg, prov):
    by_id = {c["id"]: c for c in claims}
    prov_keys = {}      # claim id -> source keys of its provenance rows
    for p in prov:
        for cid in p["claim_ids"]:
            prov_keys.setdefault(cid, set()).add(p["source_key"])
    chapters = {}
    for d in sorted(content.iterdir()) if content.is_dir() else []:
        m = re.match(r"(c[0-9]{2})-", d.name)
        if not d.is_dir():
            continue
        if not m or m.group(1) in chapters:
            fail("content", d.name, "content directory is not named cNN-slug, or its chapter "
                 "number is taken twice; its claims cannot be attributed")
            continue
        chapters[m.group(1)] = d
    for chap, d in chapters.items():
        used = {}
        for lang in ("de", "en"):
            f = d / f"{lang}.tex"
            where = f"{d.name}/{lang}.tex"
            used.setdefault(lang, {})
            used.setdefault("num:" + lang, {})
            if not f.is_file():
                fail("unused-claim", where, "content file is missing")
                continue
            seen = used.setdefault(lang, {})
            srcrefs, numbers = [], []
            uses = scan_tex(f, where, srcrefs, numbers)
            numrefs = used.setdefault("num:" + lang, {})
            for shown, line, nid, cover, tagged in numbers:
                w = f"{where}:{line}"
                if nid is not None:
                    numrefs[nid] = numrefs.get(nid, 0) + 1
                    if nid not in stats["all_claim_ids"]:
                        fail("unknown-claim", w, f"\\num[{nid}]: not a row of evidence/claims.json")
                        continue
                    cands = [(nid, None)]
                else:
                    cands = [c for lst in cover for c in lst]
                ok = False
                for cid, status in cands:
                    ev = by_id[cid]["evidence"] if cid in by_id else status
                    ok = ok or ev in NUMBER_EVIDENCE
                if ok:
                    continue
                if nid is not None:
                    fail("number", w, f"\\num[{nid}]{{{shown}}}: the claim's evidence is not one of "
                         f"{', '.join(NUMBER_EVIDENCE)}; a stipulation does not support a number")
                elif tagged:
                    fail("number", w, f"\\num{{{shown}}} without a claim id stands outside a "
                         "display or theorem-like unit whose \\claim supports it; "
                         "write \\num[claim-id]{value}{unit}")
                else:
                    fail("number", w, f"underived number '{shown}': a numeric value needs support "
                         "(derived, numerically-checked, or a source locus); tag it "
                         "\\num[claim-id]{value}{unit}, or put it in a display or theorem-like "
                         "unit whose \\claim has such evidence")
            backed = set().union(*[prov_keys.get(u[0], set()) for u in uses]) if uses else set()
            for key, line in srcrefs:
                if key not in reg.sources:
                    fail("srcref", f"{where}:{line}", f"\\srcref{{{key}}}: source key has no "
                         f"valid sources/{key}/source.json and rights.json")
                elif key not in backed:
                    fail("srcref", f"{where}:{line}", f"\\srcref{{{key}}}: no claim tagged in "
                         "this file has a provenance row from that source; a source "
                         "reference in content reflects a provenance row")
            for cid, status, pres, depth, unit, line in uses:
                w = f"{where}:{line}"
                seen[cid] = seen.get(cid, 0) + 1
                if status not in EVIDENCE:
                    fail("evidence-status", w, f"\\claim{{{cid}}}: '{status}' is not an "
                         f"evidence status ({', '.join(EVIDENCE)}); {GAP_HINT}")
                    continue
                if cid not in stats["all_claim_ids"]:
                    fail("unknown-claim", w, f"\\claim{{{cid}}} is not a row of evidence/claims.json")
                    continue
                c = by_id.get(cid)
                if c is None:
                    continue    # the row exists but is invalid; already reported
                if not cid.startswith(chap + "."):
                    fail("claim-mismatch", w, f"claim '{cid}' does not carry the chapter prefix '{chap}'")
                if not (c["statement_de"] or "").strip() or not (c["statement_en"] or "").strip():
                    fail("claim-mismatch", w, f"\\claim{{{cid}}}: a row tagged in content needs "
                         "statement_de and statement_en")
                kind = c["kind"] if c["kind"] in THEOREM_LIKE else None
                for what, here, ledger in (("evidence", status, c["evidence"]),
                                           ("presentation", pres, c["presentation"]),
                                           ("depth", depth, c["depth"]),
                                           ("theorem-like unit", unit, kind)):
                    if here != ledger:
                        fail("claim-mismatch", w, f"\\claim{{{cid}}}: {what} in content is "
                             f"'{here}', the ledger says '{ledger}'")
        for c in claims:
            if c["id"].startswith(chap + "."):
                for lang in ("de", "en"):
                    n = used.get(lang, {}).get(c["id"], 0)
                    if c["kind"] == "value":
                        # a value has no label to hang a \claim on: \num[id] tags it
                        k = used.get("num:" + lang, {}).get(c["id"], 0)
                        if n > 1 or n + k < 1:
                            fail("unused-claim", f"claims.json:{c['id']}",
                                 f"a row of kind value is tagged by \\num[{c['id']}]{{..}}{{..}} at "
                                 f"least once per language (or by one \\claim); found {k} \\num "
                                 f"and {n} \\claim in {d.name}/{lang}.tex")
                        continue
                    if n != 1:
                        fail("unused-claim", f"claims.json:{c['id']}",
                             f"tagged {n} time(s) in {d.name}/{lang}.tex; a ledger row of a "
                             "chapter with content is tagged exactly once per language")
    stats["chapters"] = sorted(chapters)
    stats["awaiting_content"] = sum(1 for c in claims if c["id"][:3] not in chapters)


# --------------------------------------------------------------- migrations

def check_migrations(root, prov_ids, reg):
    mdir = root / "evidence" / "migrations"
    schema = schema_of("migration.schema.json")
    n = 0
    for f in sorted(mdir.glob("*.json")) if mdir.is_dir() else []:
        w = f"migrations/{f.name}"
        rec = load_json(f, w)
        if rec is None or not check_record(rec, schema, "migration", w):
            continue
        n += 1
        if rec["id"] != f.stem:
            fail("duplicate-id", w, f"id '{rec['id']}' is not the file name")
        for pid in rec["evidence"]["provenance_ids"]:
            if pid not in prov_ids:
                fail("link", w, f"provenance row '{pid}' does not exist")
        applied = rec["status"] == "applied"
        if applied:
            try:
                datetime.date.fromisoformat(rec.get("applied_date", ""))
            except ValueError:
                fail("migration", w, "applied record needs a valid applied_date")
            if not any("applied_file_sha256" in loc for loc in rec["legacy"]):
                fail("migration", w, "applied record needs at least one applied destination")
        elif "applied_date" in rec:
            fail("migration", w, "recorded migration cannot have an applied_date")
        for loc in rec["legacy"]:
            lw = f"{w}:{loc['file']}:{loc['line']}"
            p = inside(root, loc["file"])
            if p is None or not p.is_file():
                fail("migration", lw, "stale migration record: legacy file is missing")
                continue
            payload = p.read_bytes()
            if hashlib.sha256(payload).hexdigest() != loc["file_sha256"]:
                try:
                    payload = reg.historical_payload(root, loc["file"], loc["file_sha256"])
                except OSError:
                    payload = None
            if payload is None or hashlib.sha256(payload).hexdigest() != loc["file_sha256"]:
                fail("migration", lw, "stale migration record: the legacy file's sha256 "
                     "is no longer the recorded one")
                continue
            lines = payload.decode("utf-8").split("\n")
            if loc["line"] > len(lines) or norm_ws(loc["old_text"]) not in norm_ws(lines[loc["line"] - 1]):
                fail("migration", lw, "stale migration record: old_text is not on the stated line")
            if not ({"applied_file_sha256", "applied_source_key"} & loc.keys()):
                if {"applied_line", "applied_text", "applied_removed"} & loc.keys():
                    fail("migration", lw, "applied_line, applied_text or applied_removed "
                         "without an applied destination (applied_file_sha256, "
                         "applied_source_key)")
                continue
            if not applied:
                fail("migration", lw, "recorded migration cannot have an applied destination")
                continue
            digest = loc.get("applied_file_sha256")
            key = loc.get("applied_source_key")
            if digest is None or key is None:
                fail("migration", lw, "applied destination needs a file hash and source key")
                continue
            if sha256_file(p) != digest:
                fail("migration", lw, "stale applied record: destination file's sha256 differs")
            if not any(owner[0] == key and reg.path(root, member) == p
                       and reg.manifest.get(member) == digest
                       for member, owner in reg.owner.items()):
                fail("migration", lw, "applied destination is not a hashed member of its source")
            # In place (v0.2.1): new_text on the legacy line.  Rewritten destination
            # (script v0.3): applied_text, the corrected wording as written, on applied_line;
            # or applied_removed: the defective passage is gone, old_text occurs nowhere.
            text = p.read_text(encoding="utf-8")
            if loc.get("applied_removed"):
                if {"applied_line", "applied_text"} & loc.keys():
                    fail("migration", lw, "applied_removed excludes applied_line and applied_text")
                elif norm_ws(loc["old_text"]) in norm_ws(text):
                    fail("migration", lw, "stale applied record: applied_removed, but old_text "
                         "is still in the destination")
                continue
            lines = text.split("\n")
            want = loc.get("applied_text", loc["new_text"])
            at = loc.get("applied_line", loc["line"])
            what = "applied_text" if "applied_text" in loc else "new_text"
            if (not want or at > len(lines)
                    or norm_ws(want) not in norm_ws(lines[at - 1])):
                fail("migration", lw, f"stale applied record: {what} is not on the stated line")
    return n


# ------------------------------------------------------------------ receipt

def receipt_inputs(root):
    """Bind ledgers, source records, reviews, derivations, scripts and declared inputs."""
    files = [root / "evidence" / n for n in ("claims.json", "provenance.json", "gaps.json")]
    files += sorted((root / "evidence" / "migrations").glob("*.json"))
    files += sorted((root / "evidence" / "receipts" / "reviews").glob("*.json"))
    files += [root / "sources" / "MANIFEST.sha256"]
    files += sorted((root / "sources").glob("*/source.json"))
    files += sorted((root / "sources").glob("*/rights.json"))
    # Read raw rows here so malformed rows cannot hide referenced dependencies.
    try:
        rows = json.loads((root / "evidence" / "claims.json").read_text())["claims"]
    except (OSError, ValueError, KeyError):
        rows = []
    for row in rows:
        if not isinstance(row, dict):
            continue
        deriv = row.get("derivation")
        if isinstance(deriv, str):
            dp = inside(root, deriv.partition("#")[0])
            if dp is not None:
                files.append(dp)
        num = row.get("numerics")
        if isinstance(num, dict):
            inputs = num.get("inputs", [])
            for name in [num.get("script")] + (inputs if isinstance(inputs, list) else []):
                dp = inside(root, name) if isinstance(name, str) else None
                if dp is not None:
                    files.append(dp)
    out = {str(f.relative_to(root)): sha256_file(f) for f in files if f.is_file()}
    out["checker:scripts/evidence/check_evidence.py"] = sha256_file(HERE)
    for f in sorted(SCHEMA_DIR.glob("*.json")):
        out[f"schema:{f.name}"] = sha256_file(f)
    return out


def check_receipt(root, claims):
    w = "evidence/receipts/private-check.json"
    p = root / "evidence" / "receipts" / "private-check.json"
    if not p.is_file():
        fail("receipt", w, "missing receipt: run the private check where the sources are")
        return
    rec = load_json(p, w)
    if not isinstance(rec, dict) or rec.get("mode") != "private" or rec.get("result") != "pass" \
            or not isinstance(rec.get("inputs"), dict):
        fail("receipt", w, "receipt does not record a passing private run")
        return
    results = rec.get("numerics_results", {})
    for claim in claims:
        if claim["evidence"] != "numerically-checked" or not claim.get("numerics"):
            continue
        num = claim["numerics"]
        result = results.get(claim["id"]) if isinstance(results, dict) else None
        if (rec.get("numerics_run") is not True or not isinstance(result, dict) or
                result.get("result") != "pass" or result.get("exit_status") != 0 or
                any(result.get(k) != num[k] for k in ("script", "command", "expected", "tolerance")) or
                not isinstance(result.get("value"), (int, float)) or
                not math.isfinite(result["value"]) or
                not abs(result["value"] - num["expected"]) <= num["tolerance"]):
            fail("receipt", w, f"numerical claim '{claim['id']}' lacks a successful execution attestation")
    now = receipt_inputs(root)
    for name in sorted(set(now) | set(rec["inputs"])):
        if now.get(name) != rec["inputs"].get(name):
            state = ("changed" if name in now and name in rec["inputs"]
                     else "added" if name in now else "removed")
            fail("receipt", w, f"stale receipt: {name} {state} since the private check")


def write_receipt(root, stats, numerics_run):
    p = root / "evidence" / "receipts" / "private-check.json"
    body = {
        "mode": "private", "result": "pass",
        "inputs": receipt_inputs(root),
        "counts": {k: stats[k] for k in sorted(stats) if isinstance(stats[k], int)},
        "numerics_run": numerics_run,
        "numerics_results": stats["numerics_results"],
        "tools": {"python": platform.python_version(), "hash": "sha256 (hashlib)"},
    }
    if p.is_file():
        try:
            old = json.loads(p.read_text(encoding="utf-8"))
            if {k: old.get(k) for k in body} == body:
                print(f"receipt current: {p.relative_to(root)} (dated {old.get('date')})")
                return
        except ValueError:
            pass
    body["date"] = datetime.date.today().isoformat()
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(body, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"receipt written: {p.relative_to(root)}")


# --------------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--root", default=str(REPO))
    ap.add_argument("--content")
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--private", action="store_true")
    mode.add_argument("--public", action="store_true")
    ap.add_argument("--run-numerics", action="store_true")
    args = ap.parse_args()
    root = pathlib.Path(args.root).resolve()
    content = pathlib.Path(args.content).resolve() if args.content else root / "content"

    reg = load_registry(root)
    private = args.private or (not args.public and private_payload_present(root, reg))
    print(f"evidence check: root {root}, mode {'private' if private else 'public'}")

    args.run_numerics = private or args.run_numerics
    stats = {"numerics_results": {}, "page_image": 0, "text_verified": 0, "text_skipped": 0,
             "numerics_run": 0, "numerics_not_run": 0}
    stats["manifest_checked"], stats["manifest_skipped"] = check_manifest(root, reg, private)

    def raw_ids(name, key):
        try:
            data = json.loads((root / "evidence" / name).read_text(encoding="utf-8"))
            return {r["id"] for r in data[key] if isinstance(r, dict) and isinstance(r.get("id"), str)}
        except (OSError, ValueError, KeyError, TypeError):
            return set()
    stats["all_claim_ids"] = raw_ids("claims.json", "claims")
    stats["all_prov_ids"] = raw_ids("provenance.json", "provenance")

    ev = root / "evidence"
    claims = load_ledger(ev / "claims.json", "claims.json", "claims", "claims.schema.json",
                         "claim", claim_evidence_skip)
    prov = load_ledger(ev / "provenance.json", "provenance.json", "provenance",
                       "provenance.schema.json", "provenance")
    gaps = load_ledger(ev / "gaps.json", "gaps.json", "gaps", "gaps.schema.json", "gap")

    for row in prov:
        check_provenance_row(root, reg, row, private, stats)
    check_claims(root, content, reg, claims, prov, args, stats)
    check_content(root, content, claims, stats, reg, prov)
    n_mig = check_migrations(root, stats["all_prov_ids"], reg)
    if not private:
        check_receipt(root, claims)

    by_ev = {e: sum(1 for c in claims if c["evidence"] == e) for e in EVIDENCE}
    stats.update(claims=len(claims), provenance=len(prov), gaps=len(gaps),
                 migrations=n_mig, sources=len(reg.sources))
    print(f"sources {len(reg.sources)}; manifest entries hashed {stats['manifest_checked']}, "
          f"skipped (private payload, public mode) {stats['manifest_skipped']}")
    print(f"claims {len(claims)} (" + ", ".join(f"{e} {n}" for e, n in by_ev.items()) + ")"
          f"; awaiting content {stats['awaiting_content']}; chapters with content: "
          f"{' '.join(stats['chapters']) or 'none'}")
    print(f"provenance rows {len(prov)}: text quotes verified {stats['text_verified']}, "
          f"text quotes skipped (private payload, public mode) {stats['text_skipped']}")
    print(f"page-image quotes: {stats['page_image']} not machine-verified "
          "(scan hash and page range checked; the reading rests on the reviewer)")
    print(f"numerical checks: run {stats['numerics_run']}, not run {stats['numerics_not_run']}"
          + ("" if args.run_numerics else " (public: receipt required)"))
    print(f"gaps {len(gaps)}; migration records {n_mig}")
    if FAILS:
        print(f"\nFAILED: {len(FAILS)} finding(s)")
        return 1
    if private:
        write_receipt(root, stats, args.run_numerics)
    print("\nevidence check passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
