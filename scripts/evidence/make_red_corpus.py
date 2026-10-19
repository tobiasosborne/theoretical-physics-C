#!/usr/bin/env python3
"""Regenerate tests/red/evidence/: one green base and one planted defect per rule.

  python3 scripts/evidence/make_red_corpus.py

Every case directory is a complete, self-contained root for check_evidence.py:
the green base (tests/red/evidence/_base, no case.json, so check_red.py ignores
it) with exactly one mutation.  All text in the fixtures is made up for the
purpose (pebbles); no copyrighted source is quoted.  The script fails if the
base is not green in private and in public mode.

Rerun it after changing check_evidence.py or a schema: the receipts inside the
base and inside the public-mode cases bind the checker's and the schemas' hashes.
"""
import copy
import hashlib
import json
import pathlib
import shutil
import subprocess
import sys

REPO = pathlib.Path(__file__).resolve().parent.parent.parent
OUT = REPO / "tests" / "red" / "evidence"
CHECK = "python3 scripts/evidence/check_evidence.py"


def sha(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def J(obj):
    return json.dumps(obj, indent=1, ensure_ascii=False) + "\n"


# ------------------------------------------------------------- the green base

NOTES = """Fixture source: made-up notes on heaps of pebbles. Not a real publication.

Section 1. Counting.

For every heap of pebbles the count n satisfies n >= 0.
The count of two heaps put together is the sum of the two counts.

Section 2. Names.

A heap with no pebbles is called empty.
"""
OCR = "Fixture text layer of the fake scan. The count n satisfies n >= 0.\n"
SCAN = "FAKE SCAN: five imaginary pages of pebble drawings (fixture, not a book).\n"
BRIEF = "Fixture brief.\n\nS1. In this chapter a heap is drawn as a circle.\n"
LEGACY = "line one of the old text\nthe count is n > 0 for every heap\nline three\n"
DERIV = "# Fixture derivation\n\n## empty-heap\n\nA heap with no pebbles has count 0 by definition.\n"
NUMERIC = "print(1 + 1)\n"
DEFS = J({"definitions": [{"id": "D1", "depth": "kern"}]})


def tex(lang):
    de = lang == "de"
    return f"""% fixture chapter c98 ({lang}); made-up content
\\chapter{{{'Kiesel' if de else 'Pebbles'}}}\\label{{c98}}
\\section{{{'Haufen' if de else 'Heaps'}}}\\label{{c98.s1}}

\\begin{{theorem}}[{'Anzahl' if de else 'Count'}]\\label{{c98.thm.count}}\\claim[proof-omitted]{{c98.cl.1}}{{source-quoted}}
  {'Die Anzahl' if de else 'The count'} $n$ {'erfüllt' if de else 'satisfies'} $n \\geq 0$.
  \\srcref{{fake-notes}}{{{'Zeile' if de else 'line'} 5}}
  {'Zwei Haufen zu je einem Kiesel haben zusammen' if de else 'Two heaps of one pebble each have together'}
  \\num[c98.cl.4]{{2.0}}{{}} {'Kiesel' if de else 'pebbles'}.
\\end{{theorem}}

\\begin{{equation}}\\label{{c98.eq.sum}}\\claim{{c98.cl.4}}{{numerically-checked}}
  1 + 1 = 2
\\end{{equation}}

\\begin{{lemma}}[{'Leer' if de else 'Empty'}]\\label{{c98.lem.empty}}\\claim{{c98.cl.3}}{{derived}}
  {'Der leere Haufen hat Anzahl' if de else 'The empty heap has count'} $0$.
\\end{{lemma}}

\\begin{{equation}}\\label{{c98.eq.circle}}\\claim{{c98.cl.5}}{{author-stipulated}}
  \\bigcirc
\\end{{equation}}

\\begin{{vertiefung}}[id=c98.v1, titel={{T}}, wozu={{W}}, voraussetzung={{V}}, zurueck={{Z}}]
  \\begin{{equation}}\\label{{c98.eq.page}}\\claim{{c98.cl.2}}{{source-backed}}
    n \\geq 0
  \\end{{equation}}
\\end{{vertiefung}}
"""


def source(key, kind, storage, files):
    return J({"schema_version": 1, "key": key, "kind": kind, "storage": storage,
              "title": f"Fixture source {key}", "authors": ["nobody (fixture)"],
              "files": files, "rights_ref": "rights.json"})


def rights(key):
    return J({"schema_version": 1, "key": key, "holder": "this project", "status": "own-work",
              "redistribution": "allowed", "quotation": "free",
              "storage_policy": "tracked fixture", "basis": "made-up fixture text"})


def base():
    f = {}
    payload = {"fake-notes/notes.txt": NOTES, "fake-scan/scan.bin": SCAN,
               "fake-scan/scan.txt": OCR, "fake-brief/brief.md": BRIEF}
    f["sources/MANIFEST.sha256"] = "".join(f"{sha(t)}  {p}\n" for p, t in payload.items())
    for p, t in payload.items():
        f["sources/" + p] = t
    f["sources/fake-notes/source.json"] = source("fake-notes", "paper", "private", [
        {"path": "fake-notes/notes.txt", "role": "text", "sha256": sha(NOTES)}])
    f["sources/fake-scan/source.json"] = source("fake-scan", "book", "private", [
        {"path": "fake-scan/scan.bin", "role": "scan", "sha256": sha(SCAN), "pages": 5},
        {"path": "fake-scan/scan.txt", "role": "ocr-text", "sha256": sha(OCR)}])
    f["sources/fake-brief/source.json"] = source("fake-brief", "author-stipulation", "tracked", [
        {"path": "fake-brief/brief.md", "role": "text", "sha256": sha(BRIEF)}])
    for k in ("fake-notes", "fake-scan", "fake-brief"):
        f[f"sources/{k}/rights.json"] = rights(k)

    def claim(n, kind, depth, ev, pres=None, scope=None, prov=(), **kw):
        d = {"id": f"c98.cl.{n}", "kind": kind, "statement_de": "Fixture.",
             "statement_en": "Fixture.", "depth": depth, "evidence": ev, "presentation": pres,
             "scope": scope, "hypotheses": [], "provenance_ids": list(prov),
             "definition_ids": [], "review_receipt": None}
        d.update(kw)
        return d
    f["evidence/claims.json"] = J({"schema_version": 1, "claims": [
        claim(1, "theorem", "kern", "source-quoted", "proof-omitted", "heaps of pebbles",
              ["P-0001"], definition_ids=["D1"]),
        claim(2, "equation", "vertiefung", "source-backed", prov=["P-0002"]),
        claim(3, "lemma", "kern", "derived", scope="the empty heap",
              derivation="evidence/derivations/d.md#empty-heap"),
        claim(4, "equation", "kern", "numerically-checked", scope="integers",
              numerics={"script": "numerics/check.py", "command": "python3 numerics/check.py",
                        "expected": 2.0, "tolerance": 1e-12, "inputs": ["numerics/input.txt"]}),
        claim(5, "definition", "kern", "author-stipulated", scope="this fixture chapter",
              prov=["P-0003"]),
    ]})

    def prow(n, claims, key, member, text, locus, quote, read_from, reviewer=None, receipt=None):
        return {"id": f"P-000{n}", "claim_ids": claims, "source_key": key, "member": member,
                "member_sha256": sha(text), "locus": locus, "quote": quote,
                "read_from": read_from, "reviewer": reviewer, "review_receipt": receipt}
    f["evidence/provenance.json"] = J({"schema_version": 1, "provenance": [
        prow(1, ["c98.cl.1"], "fake-notes", "fake-notes/notes.txt", NOTES,
             {"line_start": 5, "line_end": 5},
             "For every heap of pebbles the count n satisfies n >= 0.", "text"),
        prow(2, ["c98.cl.2"], "fake-scan", "fake-scan/scan.bin", SCAN,
             {"page_index": 3, "printed_page": "1"}, "the count n satisfies n >= 0",
             "page-image", "fixture reviewer", "R-0001"),
        prow(3, ["c98.cl.5"], "fake-brief", "fake-brief/brief.md", BRIEF,
             {"line_start": 3, "line_end": 3},
             "S1. In this chapter a heap is drawn as a circle.", "text"),
    ]})
    f["evidence/gaps.json"] = J({"schema_version": 1, "gaps": [
        {"id": "G-0001", "what": "how many pebbles a real heap has", "needed_source":
         "a survey of heaps (not on disk)", "where": "c98", "raised_in": ["fixture"],
         "status": "open"}]})
    f["evidence/receipts/reviews/R-0001.json"] = J({
        "id": "R-0001", "reviewer": "fixture reviewer", "date": "2026-10-11",
        "covers": ["P-0002"], "verdict": "pass", "bindings": [{"provenance_id": "P-0002",
        "member_sha256": sha(SCAN), "quote_sha256": sha("the count n satisfies n >= 0")}]})
    f["evidence/migrations/M-0001.json"] = J({
        "schema_version": 1, "id": "M-0001", "status": "recorded",
        "title": "strict inequality in the old text",
        "legacy": [{"version": "v0.2-de", "file": "legacy/old.tex", "line": 2,
                    "file_sha256": sha(LEGACY), "old_text": "the count is n > 0",
                    "new_text": "the count is n >= 0"}],
        "reason": "the empty heap has count zero", "evidence": {
            "independent_check": "fixture", "provenance_ids": ["P-0001"]},
        "destination": "c98"})
    f["evidence/derivations/d.md"] = DERIV
    f["legacy/old.tex"] = LEGACY
    f["numerics/check.py"] = NUMERIC
    f["numerics/input.txt"] = "2\n"
    f["registry/definitions.json"] = DEFS
    f["content/c98-red/de.tex"] = tex("de")
    f["content/c98-red/en.tex"] = tex("en")
    return f


# ---------------------------------------------------------------- mutations

def edit(files, path, fn):
    """Apply fn to the parsed JSON file (in place) and store it back."""
    data = json.loads(files[path])
    fn(data)
    files[path] = J(data)


def row(data, rid):
    return next(r for r in data.get("claims", data.get("provenance")) if r["id"] == rid)


def sub(files, path, old, new, count=1):
    assert old in files[path], (path, old)
    files[path] = files[path].replace(old, new, count)


def both(files, old, new):
    for lang in ("de", "en"):
        sub(files, f"content/c98-red/{lang}.tex", old, new)


CLAIMS, PROV = "evidence/claims.json", "evidence/provenance.json"
CASES = []


def case(name, what, regex, flags="--private", receipt_before=False):
    def deco(fn):
        CASES.append((name, what, regex, flags, receipt_before, fn))
        return fn
    return deco


@case("altered-quote", "One word of a quote is changed (heap -> pile).",
      r"\[quote\] provenance\.json:P-0001: quote not found")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0001").update(
        quote="For every pile of pebbles the count n satisfies n >= 0."))


@case("inequality-reversed", "The inequality in a quote is reversed (>= becomes <=).",
      r"\[quote\] provenance\.json:P-0001: quote not found")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0001").update(
        quote="For every heap of pebbles the count n satisfies n <= 0."))


@case("quote-outside-window", "The quote exists in the member but not in the stated line window.",
      r"\[quote\] provenance\.json:P-0001: quote outside the stated window")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0001").update(locus={"line_start": 8, "line_end": 10}))


@case("quote-spliced", "A quote is spliced from two separate sentences (not contiguous).",
      r"\[quote\] provenance\.json:P-0001: quote not found")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0001").update(
        locus={"line_start": 5, "line_end": 10},
        quote="For every heap of pebbles the count n is called empty."))


@case("window-too-wide", "The line window is the whole file instead of a bounded locus.",
      r"\[locus\] provenance\.json:P-0001: line window 1-200 is wider than 30 lines")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0001").update(locus={"line_start": 1, "line_end": 200}))


@case("missing-provenance", "A source-quoted claim has no provenance row.",
      r"\[no-provenance\] claims\.json:c98\.cl\.1: source-quoted claim without a provenance row")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.1").update(provenance_ids=[]))
    edit(f, PROV, lambda d: row(d, "P-0001").update(claim_ids=[]))


@case("stated-without-proof", "A ledger row has evidence 'stated-without-proof'.",
      r"\[evidence-status\] claims\.json:c98\.cl\.1: 'stated-without-proof' is not an evidence "
      r"status.*belongs in evidence/gaps\.json")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.1").update(evidence="stated-without-proof"))


@case("content-stated-without-proof", "A \\claim tag in content declares 'stated-without-proof'.",
      r"\[evidence-status\] c98-red/de\.tex:5: .*'stated-without-proof' is not an evidence "
      r"status.*belongs in evidence/gaps\.json")
def _(f):
    both(f, "{c98.cl.1}{source-quoted}", "{c98.cl.1}{stated-without-proof}")


@case("kern-claim-without-scope", "A Kern claim has no scope (K3: the premise is missing).",
      r"\[K3\] claims\.json:c98\.cl\.1: Kern claim without scope")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.1").update(scope="  "))


@case("kern-claim-declared-vertiefung", "A claim tagged in Kern text is filed as Vertiefung "
      "in the ledger, which would dodge K3.",
      r"\[claim-mismatch\] c98-red/de\.tex:5: \\claim\{c98\.cl\.1\}: depth in content is 'kern', "
      r"the ledger says 'vertiefung'")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.1").update(depth="vertiefung", scope=None))


@case("claim-unknown-id", "Content tags a claim ID that is not in the ledger.",
      r"\[unknown-claim\] c98-red/de\.tex:\d+: \\claim\{c98\.cl\.77\} is not a row")
def _(f):
    both(f, "\\end{vertiefung}", "\\end{vertiefung}\n\n\\begin{equation}\\label{c98.eq.x}"
         "\\claim{c98.cl.77}{derived}\n  0 = 0\n\\end{equation}")


@case("unit-without-claim", "A proposition in content carries no \\claim.",
      r"\[unit-without-claim\] c98-red/de\.tex:\d+: proposition without \\claim")
def _(f):
    both(f, "\\end{vertiefung}", "\\end{vertiefung}\n\n\\begin{proposition}[X]"
         "\\label{c98.prop.x}\n  $0 = 0$.\n\\end{proposition}")


@case("corollary-without-claim", "A corollary (unnumbered, no label) carries no \\claim.",
      r"\[unit-without-claim\] c98-red/en\.tex:\d+: corollary without \\claim")
def _(f):
    both(f, "\\end{vertiefung}", "\\end{vertiefung}\n\n\\begin{corollary}\n  $0 = 0$.\n"
         "\\end{corollary}")


@case("claim-only-in-german", "A ledger row is tagged in de.tex but not in en.tex.",
      r"\[unused-claim\] claims\.json:c98\.cl\.3: tagged 0 time\(s\) in c98-red/en\.tex")
def _(f):
    sub(f, "content/c98-red/en.tex", "\\claim{c98.cl.3}{derived}", "")
    sub(f, "content/c98-red/en.tex", "\\begin{lemma}", "\\begin{remark}")
    sub(f, "content/c98-red/en.tex", "\\end{lemma}", "\\end{remark}")


@case("content-evidence-differs", "Content declares 'derived' for a claim the ledger "
      "holds as source-quoted.",
      r"\[claim-mismatch\] c98-red/de\.tex:5: \\claim\{c98\.cl\.1\}: evidence in content is "
      r"'derived', the ledger says 'source-quoted'")
def _(f):
    both(f, "{c98.cl.1}{source-quoted}", "{c98.cl.1}{derived}")


@case("content-presentation-differs", "Content drops the proof-omitted declaration of the ledger.",
      r"\[claim-mismatch\] c98-red/de\.tex:5: \\claim\{c98\.cl\.1\}: presentation in content is "
      r"'None', the ledger says 'proof-omitted'")
def _(f):
    both(f, "\\claim[proof-omitted]{c98.cl.1}", "\\claim{c98.cl.1}")


@case("stale-manifest-hash", "The fake source payload was edited after it was hashed.",
      r"\[manifest\] sources/fake-notes/notes\.txt: stale manifest hash")
def _(f):
    f["sources/fake-notes/notes.txt"] += "An added line.\n"


@case("payload-missing-private", "A private payload is absent in private mode.",
      r"\[manifest\] sources/fake-scan/scan\.bin: payload file is missing")
def _(f):
    del f["sources/fake-scan/scan.bin"]


@case("stale-migration-record", "The legacy file changed after the migration was recorded.",
      r"\[migration\] migrations/M-0001\.json:legacy/old\.tex:2: stale migration record: the "
      r"legacy file's sha256")
def _(f):
    sub(f, "legacy/old.tex", "n > 0", "n >= 0")


@case("migration-old-text-moved", "The recorded old text is not on the stated line.",
      r"\[migration\] migrations/M-0001\.json:legacy/old\.tex:3: stale migration record: "
      r"old_text is not on the stated line")
def _(f):
    edit(f, "evidence/migrations/M-0001.json", lambda d: d["legacy"][0].update(line=3))


@case("migration-applied-status", "An applied migration lacks its application date and destinations.",
      r"\[migration\] migrations/M-0001\.json: applied record needs a valid applied_date")
def _(f):
    edit(f, "evidence/migrations/M-0001.json", lambda d: d.update(status="applied"))


@case("migration-applied-text-moved", "An applied record's new text is present on another line.",
      r"\[migration\] migrations/M-0001\.json:legacy/old\.tex:2: stale applied record: "
      r"new_text is not on the stated line")
def _(f):
    text = LEGACY.replace("line three", "the count is n >= 0 for every heap")
    f["legacy/old.tex"] = text
    key = "fake-script"
    member = "../legacy/old.tex"
    f[f"sources/{key}/source.json"] = source(key, "script-snapshot", "tracked", [
        {"path": member, "role": "text", "sha256": sha(text)}])
    f[f"sources/{key}/rights.json"] = rights(key)
    f["sources/MANIFEST.sha256"] += f"{sha(text)}  {member}\n"
    def apply(d):
        d.update(status="applied", applied_date="2026-10-12")
        d["legacy"][0].update(file_sha256=sha(text), applied_file_sha256=sha(text),
                              applied_source_key=key)
    edit(f, "evidence/migrations/M-0001.json", apply)


@case("stale-receipt-public", "The claims ledger changed after the private run; public mode.",
      r"\[receipt\] .*stale receipt: evidence/claims\.json changed since the private check",
      "--public", receipt_before=True)
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.1").update(scope="heaps of pebbles and of sand"))


@case("stale-receipt-manifest-public", "The manifest changed after the private run; public mode.",
      r"\[receipt\] .*stale receipt: sources/MANIFEST\.sha256 changed since the private check",
      "--public", receipt_before=True)
def _(f):
    old = sha(NOTES)
    new = sha(NOTES + "x")
    sub(f, "sources/MANIFEST.sha256", old, new)
    sub(f, "sources/fake-notes/source.json", old, new)
    sub(f, PROV, old, new)


@case("missing-receipt-public", "Public mode without any receipt of a private run.",
      r"\[receipt\] .*missing receipt", "--public")
def _(f):
    pass


@case("failed-receipt-public", "The receipt does not record a passing private run.",
      r"\[receipt\] .*does not record a passing private run", "--public", receipt_before=True)
def _(f):
    edit(f, "evidence/receipts/private-check.json", lambda d: d.update(result="fail"))


@case("public-tracked-quote-altered", "Public mode still verifies quotes from tracked sources: "
      "a word of the stipulation quote is changed.",
      r"\[quote\] provenance\.json:P-0003: quote not found", "--public", receipt_before=True)
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0003").update(
        quote="S1. In this chapter a heap is drawn as a square."))


@case("unregistered-source-key", "A provenance row names a source key that is not registered.",
      r"\[unregistered-source\] provenance\.json:P-0001: source key 'ghost-book'")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0001").update(source_key="ghost-book"))


@case("source-without-rights", "A source directory has no rights.json.",
      r"\[schema\] sources/fake-notes/rights\.json: file is missing")
def _(f):
    del f["sources/fake-notes/rights.json"]


@case("member-of-other-source", "A provenance row names a member that belongs to another source.",
      r"\[member\] provenance\.json:P-0001: member 'fake-brief/brief\.md' is not a manifest file "
      r"of source 'fake-notes'")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0001").update(member="fake-brief/brief.md"))


@case("member-hash-differs", "A provenance row records another hash than the manifest's.",
      r"\[member\] provenance\.json:P-0001: member_sha256 is not the manifest hash")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0001").update(member_sha256="0" * 64))


@case("source-json-hash-differs", "source.json and the manifest disagree on a file's hash.",
      r"\[registry\] sources/fake-notes/source\.json: sha256 of 'fake-notes/notes\.txt' differs")
def _(f):
    edit(f, "sources/fake-notes/source.json", lambda d: d["files"][0].update(sha256="1" * 64))


@case("manifest-entry-unregistered", "The manifest lists a payload that no source.json registers.",
      r"\[registry\] sources/MANIFEST\.sha256: entry 'stray/book\.txt' belongs to no registered")
def _(f):
    f["sources/stray/book.txt"] = "stray\n"
    f["sources/MANIFEST.sha256"] += f"{sha('stray' + chr(10))}  stray/book.txt\n"


@case("quote-from-ocr-text", "A text quote is taken from a book's OCR text layer.",
      r"\[ocr\] provenance\.json:P-0002: 'fake-scan/scan\.txt' has role 'ocr-text'")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0002").update(
        member="fake-scan/scan.txt", member_sha256=sha(OCR), read_from="text",
        locus={"line_start": 1, "line_end": 1}))


@case("page-image-without-reviewer", "A page-image quote has no reviewer and no review receipt.",
      r"\[review\] provenance\.json:P-0002: a page-image quote is not machine-verifiable")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0002").update(reviewer=None, review_receipt=None))


@case("page-image-receipt-does-not-cover", "The review receipt of a page-image quote covers "
      "another row.",
      r"\[review\] provenance\.json:P-0002: review receipt R-0001 does not cover 'P-0002'")
def _(f):
    edit(f, "evidence/receipts/reviews/R-0001.json", lambda d: d.update(covers=["P-0009"]))


@case("page-out-of-range", "A page-image locus names a page the scan does not have.",
      r"\[locus\] provenance\.json:P-0002: page-image locus needs page_index")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0002").update(locus={"page_index": 99, "printed_page": "97"}))


@case("derivation-anchor-missing", "A derived claim points at an anchor the derivation lacks.",
      r"\[derivation\] claims\.json:c98\.cl\.3: anchor '#full-heap' not found")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.3").update(
        derivation="evidence/derivations/d.md#full-heap"))


@case("derivation-file-missing", "A derived claim points at a derivation file that does not exist.",
      r"\[derivation\] claims\.json:c98\.cl\.3: derived claim needs 'derivation'")
def _(f):
    del f["evidence/derivations/d.md"]


@case("numerics-script-missing", "A numerically-checked claim names a script that does not exist.",
      r"\[numerics\] claims\.json:c98\.cl\.4: numerically-checked claim needs 'numerics'")
def _(f):
    del f["numerics/check.py"]


@case("numerics-wrong-value", "The numerical script's result differs from the expected value.",
      r"\[numerics\] claims\.json:c98\.cl\.4: numerical check failed: got 2\.0",
      "--private --run-numerics")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.4")["numerics"].update(expected=3.0))


@case("stipulation-from-ordinary-source", "An author-stipulated claim is backed by a quote "
      "from a paper, not from the brief.",
      r"\[no-provenance\] claims\.json:c98\.cl\.5: author-stipulated claim without")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0003").update(
        source_key="fake-notes", member="fake-notes/notes.txt", member_sha256=sha(NOTES),
        locus={"line_start": 10, "line_end": 10},
        quote="A heap with no pebbles is called empty."))


@case("source-claim-backed-by-brief", "A source-backed claim is backed only by the brief.",
      r"\[no-provenance\] claims\.json:c98\.cl\.2: source-backed claim without")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.2").update(provenance_ids=["P-0003"]))
    edit(f, PROV, lambda d: (row(d, "P-0003").update(claim_ids=["c98.cl.5", "c98.cl.2"]),
                             row(d, "P-0002").update(claim_ids=[])))


@case("link-one-sided", "A provenance row names a claim that does not list it.",
      r"\[link\] provenance\.json:P-0001: names claim 'c98\.cl\.3', which does not list it")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0001").update(claim_ids=["c98.cl.1", "c98.cl.3"]))


@case("duplicate-claim-id", "Two ledger rows carry the same claim ID.",
      r"\[duplicate-id\] claims\.json: ID 'c98\.cl\.3' occurs more than once")
def _(f):
    edit(f, CLAIMS, lambda d: d["claims"].append(copy.deepcopy(row(d, "c98.cl.3"))))


@case("duplicate-json-key", "A claim record has the key 'evidence' twice (the last one wins "
      "in most parsers).",
      r"\[schema\] claims\.json: not valid JSON \(duplicate key 'evidence'\)")
def _(f):
    sub(f, CLAIMS, '"evidence": "source-quoted",',
        '"evidence": "stated-without-proof",\n   "evidence": "source-quoted",')


@case("unknown-definition-id", "A claim cites a definition ID that the registry does not have.",
      r"\[definition\] claims\.json:c98\.cl\.1: definition 'D999' is not in the definitions")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.1").update(definition_ids=["D999"]))


@case("schema-missing-field", "A provenance row lacks its locus.",
      r"\[schema\] provenance\.json:P-0001: .*missing required field 'locus'")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0001").pop("locus"))


@case("claim-in-comment", "The lemma's \\claim stands behind a line break and a comment sign "
      "(\\\\% ...), so TeX never sees it.",
      r"\[unit-without-claim\] c98-red/de\.tex:\d+: lemma without \\claim")
def _(f):
    both(f, "\\label{c98.lem.empty}\\claim{c98.cl.3}{derived}",
         "\\label{c98.lem.empty}\\\\% \\claim{c98.cl.3}{derived}")


@case("theorem-tagged-with-equation-row", "A theorem is tagged with a ledger row of kind equation.",
      r"\[claim-mismatch\] c98-red/de\.tex:5: \\claim\{c98\.cl\.1\}: theorem-like unit in "
      r"content is 'theorem', the ledger says 'None'")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.1").update(kind="equation"))


@case("tagged-row-without-statement", "A row tagged in content has no German statement.",
      r"\[claim-mismatch\] c98-red/de\.tex:5: \\claim\{c98\.cl\.1\}: a row tagged in content "
      r"needs statement_de")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.1").update(statement_de=None))


@case("content-dir-misnamed", "A content directory outside the cNN-slug naming holds an "
      "untagged theorem.",
      r"\[content\] extra-chapter: content directory is not named cNN-slug")
def _(f):
    f["content/extra-chapter/de.tex"] = "\\begin{theorem}\n  $1 = 2$.\n\\end{theorem}\n"
    f["content/extra-chapter/en.tex"] = f["content/extra-chapter/de.tex"]


@case("presentation-on-equation", "A ledger row of kind equation carries a presentation.",
      r"\[claim-mismatch\] claims\.json:c98\.cl\.4: presentation 'proof-omitted' on a row of "
      r"kind 'equation'")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.4").update(presentation="proof-omitted"))
    both(f, "\\claim{c98.cl.4}", "\\claim[proof-omitted]{c98.cl.4}")


@case("srcref-unregistered-key", "Content cites \\srcref with a key that is not a registered source.",
      r"\[srcref\] c98-red/de\.tex:\d+: \\srcref\{ghost-book\}: source key has no valid")
def _(f):
    both(f, "$n \\geq 0$.", "$n \\geq 0$ \\srcref{ghost-book}{p. 1}.")


@case("srcref-without-provenance-row", "Content cites \\srcref{fake-scan} in a file none of "
      "whose claims has a provenance row from that source (the row of c98.cl.2 is moved to "
      "fake-notes).",
      r"\[srcref\] c98-red/de\.tex:\d+: \\srcref\{fake-scan\}: no claim tagged in this file")
def _(f):
    both(f, "$n \\geq 0$.", "$n \\geq 0$ \\srcref{fake-scan}{p. 1}.")

    def move(d):
        row(d, "P-0002").update(source_key="fake-notes", member="fake-notes/notes.txt",
                                member_sha256=sha(NOTES), read_from="text",
                                locus={"line_start": 5, "line_end": 5},
                                quote="the count n satisfies n >= 0", reviewer=None,
                                review_receipt=None)
    edit(f, PROV, move)


@case("underived-number", "Running text outside any claimed unit states a decimal with a unit that no claim supports.",
      r"\[number\] c98-red/de\.tex:\d+: underived number '2\.5'")
def _(f):
    sub(f, "content/c98-red/de.tex", "\\end{theorem}\n", "\\end{theorem}\n\nEin Kiesel wiegt 2.5 g.\n")
    sub(f, "content/c98-red/en.tex", "\\end{theorem}\n", "\\end{theorem}\n\nA pebble weighs 2.5 g.\n")


@case("number-under-stipulation", "A \\num points at an author-stipulated claim; a stipulation "
      "does not support a number.",
      r"\[number\] c98-red/de\.tex:\d+: \\num\[c98\.cl\.5\]\{2\.0\}: the claim's evidence is not")
def _(f):
    both(f, "\\num[c98.cl.4]{2.0}{}", "\\num[c98.cl.5]{2.0}{}")


@case("number-in-stipulated-equation", "A decimal stands bare in a display whose only claim is "
      "author-stipulated.",
      r"\[number\] c98-red/de\.tex:\d+: underived number '0\.5'")
def _(f):
    both(f, "  \\bigcirc\n", "  \\bigcirc = 0.5\n")


@case("derivation-outside-evidence", "A derived claim points at a file reached through '..'.",
      r"\[derivation\] claims\.json:c98\.cl\.3: derived claim needs 'derivation'")
def _(f):
    f["notes.md"] = "## empty-heap\n"
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.3").update(derivation="evidence/../notes.md#empty-heap"))


@case("numerics-true", "A command does not invoke its declared script.",
      r"\[numerics\] claims\.json:c98\.cl\.4: command must directly invoke the declared script")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.4")["numerics"].update(command="true"))


@case("numerics-echo", "Output-only command does not invoke its declared script.",
      r"\[numerics\] claims\.json:c98\.cl\.4: command must directly invoke the declared script")
def _(f):
    edit(f, CLAIMS, lambda d: row(d, "c98.cl.4")["numerics"].update(command="echo 2"))


@case("numerics-default-execution", "Private mode must execute the numerical script by default.",
      r"\[numerics\] claims\.json:c98\.cl\.4: numerical check failed: got 3\.0")
def _(f):
    f["numerics/check.py"] = "print(3)\n"


@case("numerics-attestation-public", "Public mode requires each numerical claim's execution result.",
      r"\[receipt\].*numerical claim 'c98\.cl\.4' lacks a successful execution attestation",
      "--public", receipt_before=True)
def _(f):
    edit(f, "evidence/receipts/private-check.json", lambda d: d.update(numerics_results={}))


@case("stale-derivation-public", "A changed derivation invalidates the private receipt.",
      r"\[receipt\].*stale receipt: evidence/derivations/d\.md changed", "--public", receipt_before=True)
def _(f):
    f["evidence/derivations/d.md"] += "Changed body.\n"


@case("stale-script-public", "A changed computation invalidates the private receipt.",
      r"\[receipt\].*stale receipt: numerics/check\.py changed", "--public", receipt_before=True)
def _(f):
    f["numerics/check.py"] = "print(3)\n"


@case("stale-input-public", "A changed declared input invalidates the private receipt.",
      r"\[receipt\].*stale receipt: numerics/input\.txt changed", "--public", receipt_before=True)
def _(f):
    f["numerics/input.txt"] = "3\n"


@case("math-text-integer-unit", "An unsupported integer with a unit inside math text fails.",
      r"\[number\] c98-red/de\.tex:\d+: underived number '300 K'")
def _(f):
    f["content/c98-red/de.tex"] += "\n$\\text{300 K}$\n"


@case("review-missing-bindings", "A page review without hashes does not bind the reviewed row.",
      r"\[schema\] evidence/receipts/reviews/R-0001\.json: .*missing required field 'bindings'")
def _(f):
    edit(f, "evidence/receipts/reviews/R-0001.json", lambda d: d.pop("bindings"))


@case("review-wrong-reviewer", "A page receipt's reviewer differs from the row reviewer.",
      r"\[review\] provenance\.json:P-0002: review receipt R-0001 reviewer does not equal")
def _(f):
    edit(f, PROV, lambda d: row(d, "P-0002").update(reviewer="another reviewer"))


@case("review-wrong-quote-hash", "A page receipt must bind the exact quote bytes.",
      r"\[review\] provenance\.json:P-0002: review receipt R-0001 lacks the exact provenance/member/quote binding")
def _(f):
    edit(f, "evidence/receipts/reviews/R-0001.json", lambda d: d["bindings"][0].update(quote_sha256="0" * 64))


# --------------------------------------------------------------------- write

def write_tree(root, files):
    for rel, text in files.items():
        p = root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding="utf-8")


def run(root, flags):
    return subprocess.run(f"{CHECK} --root {root.relative_to(REPO)} {flags}", shell=True,
                          cwd=REPO, capture_output=True, text=True)


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    b = base()
    write_tree(OUT / "_base", b)
    for flags in ("--private --run-numerics", "--private", "--public"):
        proc = run(OUT / "_base", flags)
        if proc.returncode != 0:
            print(f"the base is not green with {flags}:\n{proc.stdout}{proc.stderr}")
            return 1
    receipt = (OUT / "_base" / "evidence" / "receipts" / "private-check.json").read_text()
    for name, what, regex, flags, receipt_before, fn in CASES:
        files = copy.deepcopy(b)
        if receipt_before:
            files["evidence/receipts/private-check.json"] = receipt
        fn(files)
        write_tree(OUT / name, files)
        (OUT / name / "case.json").write_text(J({
            "gate": "evidence", "what": what,
            "cmd": f"{CHECK} --root tests/red/evidence/{name} {flags}",
            "expect_exit_nonzero": True, "expect_output_regex": regex}), encoding="utf-8")
    print(f"wrote the green base and {len(CASES)} red cases under {OUT.relative_to(REPO)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
