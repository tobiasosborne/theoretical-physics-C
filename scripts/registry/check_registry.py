#!/usr/bin/env python3
"""Gate for the notation, definitions, conventions and translation registries.

Usage:
    python3 scripts/registry/check_registry.py [--root DIR] [--no-generated] [--tex PATH ...] [--private | --public]

--private       default: absent verified quote members fail as not verified in this run.
--public        absent members are reported as not verified in this run; no private
                quote verification is claimed.
--root DIR      directory that contains registry/ (and optionally content/);
                default: the repository root. Schemas always come from the
                repository's registry/schema/.
--no-generated  skip the stale-export check (for fixtures without registry/generated/).
--tex PATH ...  TeX files to check; default: ROOT/content/*/{de,en}.tex (chapter
                text; figures/ and fixture/ are not chapter text). A chapter directory
                with fixture/tpc-definitions.tex may cite the stand-in IDs declared
                there, provided they are not of the form D<number>.

What it fails on (each class prints its own message prefix):
  schema                 a file violates its JSON Schema
  duplicate symbol       two symbols with the same symbol_id
  duplicate macro        two symbols with the same TeX macro
  duplicate definition   two definitions with the same ID
  duplicate id           two conventions, collisions or translation rows with the same ID
  token clash            two blessed symbols with the same canonical token, or two
                         symbols with the same token that do not share a recorded collision
  legacy clash           a macro that latex/tpc-macros.sty defines with another expansion
  unknown symbol         a definition, collision or translation row names a symbol that does not exist
  unresolved             first_fixed_in / fixed_in, convention or collision does not resolve
  unregistered source    a source key that is neither a registered source
                         (sources/<key>/source.json) nor a pseudo-key declared in
                         translation.json under not_a_source; a pseudo-key that shadows
                         a registered source; a verified locus that names no member
                         file of its source
  allow-list conflict    a control word that registry/allowed-tex.json allows although
                         docs/authoring/contract.json owns it (text_macros,
                         math_text_switch) or forbids it (forbidden_everywhere)
  verified without locus verified: true without a locus or without a method (`how`)
  quote not found        a verified quote is not at the stated lines of a text source
                         that is present on disk
  not verified in this run a verified quote member is absent (fails in private mode)
  unverified blessing    a blessed-provisional entry without any verified source
  mathml drift           a symbol's mathml differs from the rendering of its expansion
  unregistered macro     a definition body or a content file uses a control word that is
                         neither a registry macro, nor in registry/allowed-tex.json
                         (mathematics), nor a text macro of the authoring contract
  undeclared symbol      a definition body uses a registry macro whose symbol is not in symbol_ids
  seed coverage          a pre-inventory row has no record (when `preinventory` is declared)
  stale generated file   a file under registry/generated/ (or registry/COLLISIONS.md)
                         differs from a fresh in-memory generation
In content files additionally:
  local macro definition \\newcommand, \\renewcommand, \\providecommand, \\def, \\let,
                         \\DeclareMathOperator, \\newenvironment inside content
  restated definition    a definition environment authored in content (\\tpcdef{D..} of
                         tpc-course.sty opens the environment itself), or the same
                         definition transcluded twice in one file
  proposed definition    a \\tpcdef transcludes a definition with status proposed
  unknown definition     \\tpcdef / \\tpcdefname / \\defref to an ID that does not exist
  depth violation        a definition cited in a shallower context than its own depth
                         (running text is Kern; environments `vertiefung`, `fundament`)

Two allow-lists, one owner each. docs/authoring/contract.json owns the text-mode
language (structure, environments, text macros, the forbidden list) and is enforced by
scripts/course/check_levels.py. registry/allowed-tex.json owns the commands of
mathematics that need no registry entry. This checker scans a file without knowing
the mode, so it admits the contract's text macros as well; it reads them from
contract.json and keeps no copy. Sources: title, kind and paths of a source come from
sources/<key>/source.json, never from a table in the registry.

What it cannot detect:
  * A definition restated in prose outside a definition environment, or a symbol
    given a second meaning in a sentence. Review has to catch disguised redefinitions.
  * A raw letter used with the wrong meaning (writing K, F or U directly instead of
    the semantic macro): single letters are not control words.
  * Whether a source quote supports the entry it is attached to, and anything about
    quotes from page images; those are the reviewer's.
  * Renumbering of definitions between two versions of definitions.json (needs history).
  * TeX that hides macros from a lexer (\\csname, catcode changes, verbatim).
The content scan is lexical, not a TeX parser.
"""
import argparse
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import reglib  # noqa: E402

DEF_CMDS = ("newcommand", "renewcommand", "providecommand", "def", "gdef", "edef", "xdef", "let",
            "DeclareMathOperator", "DeclareRobustCommand", "newenvironment", "renewenvironment")
CITE_CMDS = ("tpcdef", "tpcdefname", "defref")


class Report:
    def __init__(self, private=True):
        self.private = private
        self.errors = []
        self.notes = []

    def err(self, kind, msg):
        self.errors.append(f"{kind}: {msg}")


def dupes(items):
    seen, out = set(), []
    for x in items:
        if x in seen and x not in out:
            out.append(x)
        seen.add(x)
    return out


def check_sources(rep, owner, sources, src_table, root):
    for s in sources:
        key = s["source"]
        if key not in src_table:
            rep.err("unregistered source", f"{owner}: source key '{key}' has no sources/{key}/source.json "
                                           "and is not a pseudo-key of translation.json not_a_source")
            continue
        if not s.get("verified"):
            continue
        if not s.get("locus", "").strip():
            rep.err("verified without locus", f"{owner}: source '{key}' is marked verified but has no locus")
            continue
        if not s.get("how", "").strip():
            rep.err("verified without locus", f"{owner}: source '{key}' is marked verified but does not say how")
        info = src_table[key]
        if info.get("kind") == "note":
            rep.err("verified without locus", f"{owner}: source '{key}' is a note, not a source; it cannot be verified")
        if info.get("kind") != "text":
            continue
        if not s.get("quote", "").strip():
            rep.err("verified without locus", f"{owner}: verified text source '{key}' without a quote")
            continue
        check_quote(rep, owner, key, s["locus"], s["quote"], info, root)


def check_quote(rep, owner, key, locus, quote, info, root):
    m = re.match(r"^(\S+?\.[A-Za-z]+)(?::(\d+)(?:-(\d+))?)?", locus)
    if not m:
        rep.err("verified without locus", f"{owner}: locus '{locus}' of text source '{key}' does not name a file")
        return
    member = reglib.member_of(info, m.group(1))
    if member is None:
        rep.err("unregistered source", f"{owner}: locus '{locus}': '{m.group(1)}' is not a member file of "
                                       f"source '{key}' ({info.get('record', 'not_a_source')})")
        return
    path, role = member
    if role != "text":
        rep.err("verified without locus", f"{owner}: {key} {locus}: member has role '{role}'; a quote is "
                                          "checked against a text member only (books are read from the page image)")
        return
    if not path.exists():
        message = f"{owner}: verified quote source member is absent: {key}/{m.group(1)} ({locus})"
        if rep.private:
            rep.err("not verified in this run", message)
        else:
            rep.notes.append(message)
        return
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    if m.group(2):
        a, b = int(m.group(2)), int(m.group(3) or m.group(2))
        if b > len(lines):
            rep.err("quote not found", f"{owner}: {key} {locus}: line beyond end of file")
            return
        text = " ".join(lines[a - 1:b])
    else:
        text = " ".join(lines)
    if re.sub(r"\s+", " ", quote).strip() not in re.sub(r"\s+", " ", text):
        rep.err("quote not found", f"{owner}: quote is not at {key} {locus}: {quote[:70]!r}")


def check_registry(rep, root, data, allowed):
    nota, defs = data["notation.json"], data["definitions.json"]
    conv, tran = data["conventions.json"], data["translation.json"]
    syms, dlist = nota["symbols"], defs["definitions"]
    schema_dir = reglib.REPO / "registry" / "schema"
    for name in reglib.INPUTS:
        schema = reglib.load_json(schema_dir / (name.replace(".json", "") + ".schema.json"))
        for e in reglib.validate(data[name], schema)[:40]:
            rep.err("schema", f"{name} {e}")
    for e in reglib.validate(allowed, reglib.load_json(schema_dir / "allowed-tex.schema.json")):
        rep.err("schema", f"allowed-tex.json {e}")
    if rep.errors:
        return None

    for x in dupes(s["symbol_id"] for s in syms):
        rep.err("duplicate symbol", f"symbol_id '{x}' occurs more than once")
    for x in dupes(s["tex"]["macro"] for s in syms):
        rep.err("duplicate macro", f"macro \\{x} is the canonical macro of more than one symbol")
    for x in dupes(d["id"] for d in dlist):
        rep.err("duplicate definition", f"definition ID '{x}' occurs more than once")
    for label, items in (("convention", conv["conventions"]), ("collision", nota.get("collisions", [])),
                         ("translation row", tran["rows"])):
        for x in dupes(i["id"] for i in items):
            rep.err("duplicate id", f"{label} '{x}' occurs more than once")

    sym_by_id = {s["symbol_id"]: s for s in syms}
    def_by_id = {d["id"]: d for d in dlist}
    conv_ids = {c["id"] for c in conv["conventions"]}
    coll = {c["id"]: c for c in nota.get("collisions", [])}
    src_table, problems = reglib.source_table(root, tran)
    for msg in problems:
        rep.err("unregistered source", msg)
    legacy = reglib.legacy_macros(root)

    def resolves(ref):
        return ref in def_by_id or ref in reglib.CHAPTERS

    # symbols
    by_token = {}
    for s in syms:
        sid, tex = s["symbol_id"], s["tex"]
        by_token.setdefault(s["canonical_token"], []).append(s)
        if not resolves(s["first_fixed_in"]):
            rep.err("unresolved", f"{sid}: first_fixed_in '{s['first_fixed_in']}' is neither a definition ID nor a chapter C0..C21")
        for c in s.get("conventions", []):
            if c not in conv_ids:
                rep.err("unresolved", f"{sid}: convention '{c}' does not exist")
        for c in s.get("collisions", []):
            if c not in coll:
                rep.err("unresolved", f"{sid}: collision '{c}' does not exist")
            elif sid not in coll[c]["symbol_ids"]:
                rep.err("unresolved", f"{sid}: not listed in collision '{c}'")
        if s["status"] == "collision-open" and not s.get("collisions"):
            rep.err("unresolved", f"{sid}: status collision-open without a collision ID")
        if s["status"] == reglib.BLESSED and not any(x.get("verified") for x in s["sources"]):
            rep.err("unverified blessing", f"{sid}: blessed-provisional without a verified source")
        check_sources(rep, sid, s["sources"], src_table, root)
        n_ex = len(tex.get("arg_examples", []))
        n_hash = max([int(n) for n in re.findall(r"#(\d)", tex["expansion"])] or [0])
        if tex["args"] != n_ex or n_hash != tex["args"]:
            rep.err("schema", f"{sid}: args={tex['args']} but {n_ex} example arguments and #{n_hash} in the expansion")
        try:
            want = reglib.tex_to_mathml(reglib.instance_tex(s))
            if want != s["mathml"]:
                rep.err("mathml drift", f"{sid}: mathml is not the rendering of the expansion (run gen_registry.py --fix-mathml)")
        except reglib.MathMLError as exc:
            rep.err("mathml drift", f"{sid}: expansion cannot be rendered: {exc}")
        if tex["macro"] in legacy and not tex.get("builtin"):
            nargs, exp = legacy[tex["macro"]]
            if nargs != tex["args"] or reglib.norm_tex(exp) != reglib.norm_tex(tex["expansion"]):
                rep.err("legacy clash", f"{sid}: \\{tex['macro']} is defined by tpc-macros.sty as '{exp}', "
                                        f"not '{tex['expansion']}'; use a different macro name")
    for token, group in by_token.items():
        if len(group) < 2:
            continue
        ids = ", ".join(s["symbol_id"] for s in group)
        blessed = [s for s in group if s["status"] == reglib.BLESSED]
        if len(blessed) > 1:
            rep.err("token clash", f"two blessed symbols share the canonical token '{token}': "
                                   + ", ".join(s["symbol_id"] for s in blessed))
        shared = set.intersection(*[set(s.get("collisions", [])) for s in group])
        if not shared:
            rep.err("token clash", f"symbols {ids} share the token '{token}' without a common recorded collision")
    for c in coll.values():
        for sid in c["symbol_ids"]:
            if sid not in sym_by_id:
                rep.err("unknown symbol", f"collision {c['id']} names '{sid}'")

    # definitions
    macro_to_sym = {s["tex"]["macro"]: s["symbol_id"] for s in syms}
    allow = set()
    for words in allowed["allowed"].values():
        allow.update(words)
    prefixes = tuple(allowed["allowed_prefixes"])
    # the text-mode language belongs to the authoring contract
    contract = reglib.load_contract()
    text_owned = set(contract["text_macros"]) | set(contract["math_text_switch"])
    forbidden = set(contract["forbidden_everywhere"])
    for w in sorted(allow):
        if w in text_owned:
            rep.err("allow-list conflict", f"\\{w} is in registry/allowed-tex.json but is owned by "
                                           "docs/authoring/contract.json (text macro); remove it here")
        elif w in forbidden:
            rep.err("allow-list conflict", f"\\{w} is in registry/allowed-tex.json but "
                                           "docs/authoring/contract.json forbids it in content")
    for w in sorted(text_owned | forbidden):
        if prefixes and w.startswith(prefixes):
            rep.err("allow-list conflict", f"allowed_prefixes admits \\{w}, which "
                                           "docs/authoring/contract.json owns or forbids")
    allow |= text_owned

    def macro_problem(word):
        if word in macro_to_sym or word in allow or word.startswith(prefixes):
            return None
        owners = sorted(s["tex"]["macro"] for s in syms
                        if not s["tex"].get("builtin") and word in reglib.control_words(s["tex"]["expansion"]))
        if owners:
            return (f"raw \\{word} is owned by the registry; use the semantic macro ("
                    + ", ".join("\\" + o for o in owners[:4]) + ")")
        return (f"\\{word} is neither a registry macro, nor in allowed-tex.json, "
                "nor a text macro of the authoring contract")

    for d in dlist:
        did = d["id"]
        for sid in d["symbol_ids"]:
            if sid not in sym_by_id:
                rep.err("unknown symbol", f"{did}: symbol_ids names '{sid}', which is not in notation.json")
        if not resolves(d["first_fixed_in"]):
            rep.err("unresolved", f"{did}: first_fixed_in '{d['first_fixed_in']}' does not resolve")
        o = d["origin"]
        if o["type"] == "source-adapted" and not (o.get("source") and o.get("locus")):
            rep.err("unresolved", f"{did}: origin source-adapted needs source and locus")
        if o["type"] == "source-adapted" and o.get("source") not in src_table:
            rep.err("unregistered source", f"{did}: origin source '{o.get('source')}' has no "
                                           "sources/<key>/source.json and is not a pseudo-key")
        if o["type"] == "author-stipulated" and not o.get("brief_pointer"):
            rep.err("unresolved", f"{did}: origin author-stipulated needs brief_pointer")
        for c in d["choices"]:
            if c.startswith("CONV-") and c not in conv_ids:
                rep.err("unresolved", f"{did}: choice '{c}' is not a convention")
        if d["status"] == reglib.BLESSED and not any(x.get("verified") for x in d["sources"]):
            rep.err("unverified blessing", f"{did}: blessed-provisional without a verified source")
        check_sources(rep, did, d["sources"], src_table, root)
        for lang in ("de", "en"):
            body = d["body_" + lang]
            odd = sorted({ch for ch in d["name_" + lang] + body if ord(ch) > 0x24F and ch not in "–—‘’“”„"})
            if odd:
                rep.err("schema", f"{did} name/body_{lang}: characters {''.join(odd)!r} are not safe in every text font; write them in TeX")
            for w in sorted(set(reglib.control_words(body))):
                p = macro_problem(w)
                if p:
                    rep.err("unregistered macro", f"{did} body_{lang}: {p}")
                elif w in macro_to_sym and macro_to_sym[w] not in d["symbol_ids"]:
                    rep.err("undeclared symbol", f"{did} body_{lang}: uses \\{w} but symbol_ids lacks {macro_to_sym[w]}")
            for ref in re.findall(r"\\(?:tpcdef|tpcdefname|defref)\{([^}]*)\}", body):
                if ref not in def_by_id:
                    rep.err("unknown definition", f"{did} body_{lang}: cites '{ref}'")
            if body.count("{") != body.count("}") or body.count("$") % 2:
                rep.err("schema", f"{did} body_{lang}: unbalanced braces or dollar signs")

    # conventions and translation
    for c in conv["conventions"]:
        if not resolves(c["fixed_in"]):
            rep.err("unresolved", f"{c['id']}: fixed_in '{c['fixed_in']}' does not resolve")
        if c["status"] == reglib.BLESSED and not any(x.get("verified") for x in c["sources"]):
            rep.err("unverified blessing", f"{c['id']}: blessed-provisional without a verified source")
        check_sources(rep, c["id"], c["sources"], src_table, root)
    for r in tran["rows"]:
        for ref in r["canonical"]:
            if ref not in sym_by_id and ref not in def_by_id:
                rep.err("unknown symbol", f"{r['id']}: canonical target '{ref}' does not exist")
        check_sources(rep, r["id"], [r], src_table, root)

    # seed coverage
    n = nota.get("preinventory", {}).get("symbol_rows", 0)
    missing = sorted(set(range(1, n + 1)) - {s.get("preinventory_row") for s in syms})
    if missing:
        rep.err("seed coverage", f"pre-inventory symbol rows without a record: {missing}")
    n = defs.get("preinventory", {}).get("definition_rows", 0)
    missing = sorted(set(range(1, n + 1)) - {d.get("preinventory_row") for d in dlist})
    if missing:
        rep.err("seed coverage", f"pre-inventory definition rows without a record: {missing}")
    return {"def_by_id": def_by_id, "macro_problem": macro_problem, "def_envs": allowed["definition_environments"]}


def check_generated(rep, root, data, raw):
    for rel, want in reglib.generate(data, raw, root).items():
        p = pathlib.Path(root) / rel
        if not p.exists():
            rep.err("stale generated file", f"{rel} is missing (run scripts/registry/gen_registry.py)")
        elif p.read_text(encoding="utf-8") != want:
            rep.err("stale generated file", f"{rel} differs from a fresh generation (run scripts/registry/gen_registry.py)")


def line_of(text, pos):
    return text.count("\n", 0, pos) + 1


def check_tex(rep, path, ctx, show):
    raw = path.read_text(encoding="utf-8")
    # blank comments but keep line structure
    text = "\n".join(re.sub(r"(?<!\\)%.*", "", ln) for ln in raw.splitlines())
    where = lambda pos: f"{show}:{line_of(text, pos)}"

    for m in re.finditer(r"\\(" + "|".join(DEF_CMDS) + r")(?![A-Za-z@])", text):
        rep.err("local macro definition", f"{where(m.start())}: \\{m.group(1)} in content; macros come from the registry")

    # arguments that are names, not mathematics, are removed before the macro scan
    scan = re.sub(r"\\(begin|end|label|ref|eqref|pageref|cite|input|include|includegraphics|url|tpcdef|tpcdefname|defref)"
                  r"(\[[^\]]*\])?\{[^}]*\}", lambda m: "\\" + m.group(1) + " " * (len(m.group(0)) - len(m.group(1)) - 1), text)
    seen = set()
    for m in re.finditer(r"\\([A-Za-z@]+)", scan):
        w = m.group(1)
        if w in DEF_CMDS or w in seen:
            continue
        p = ctx["macro_problem"](w)
        if p:
            seen.add(w)
            rep.err("unregistered macro", f"{where(m.start())}: {p}")

    for env in ctx["def_envs"]:
        for m in re.finditer(r"\\begin\{" + re.escape(env) + r"\}", text):
            rep.err("restated definition", f"{where(m.start())}: {env} environment authored in content; a definition is "
                                           "written once in registry/definitions.json and transcluded with \\tpcdef{D..}")

    # a test chapter may bring its own stand-in definitions (IDs that are not D<number>)
    local = {}
    fixture = path.parent / "fixture" / "tpc-definitions.tex"
    if fixture.exists():
        for m in re.finditer(r"\\tpcdeclaredef\{([^}]*)\}\{([^}]*)\}", fixture.read_text(encoding="utf-8")):
            if not re.fullmatch(r"D\d+", m.group(1)) and m.group(2) in reglib.DEPTH_RANK:
                local[m.group(1)] = {"depth": m.group(2)}
    shown = set()
    stack = []
    for m in re.finditer(r"\\(begin|end)\{(vertiefung|fundament)\}|\\(tpcdef|tpcdefname|defref)\{([^}]*)\}", text):
        if m.group(1) == "begin":
            stack.append(m.group(2))
        elif m.group(1) == "end":
            if stack and stack[-1] == m.group(2):
                stack.pop()
            else:
                rep.err("depth violation", f"{where(m.start())}: \\end{{{m.group(2)}}} without matching \\begin")
        else:
            ref = m.group(4)
            d = ctx["def_by_id"].get(ref) or local.get(ref)
            if m.group(3) == "tpcdef":
                if ref in shown:
                    rep.err("restated definition", f"{where(m.start())}: \\tpcdef{{{ref}}} transcluded a second time in this file; cite it with \\defref")
                shown.add(ref)
            if d is None:
                rep.err("unknown definition", f"{where(m.start())}: \\{m.group(3)}{{{ref}}} names no definition")
                continue
            if m.group(3) == "tpcdef" and d.get("status") == "proposed":
                rep.err("proposed definition", f"{where(m.start())}: \\tpcdef{{{ref}}} cannot transclude a definition with status 'proposed'")
            here = max([reglib.DEPTH_RANK[e] for e in stack] or [0])
            if reglib.DEPTH_RANK[d["depth"]] > here:
                names = {v: k for k, v in reglib.DEPTH_RANK.items()}
                rep.err("depth violation", f"{where(m.start())}: {names[here].capitalize()} text cites {ref}, "
                                           f"a {d['depth'].capitalize()} definition")
    if stack:
        rep.err("depth violation", f"{show}: unclosed environment {stack[-1]}")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--root", default=str(reglib.REPO))
    ap.add_argument("--no-generated", action="store_true")
    ap.add_argument("--tex", nargs="*")
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--private", action="store_true")
    mode.add_argument("--public", action="store_true")
    args = ap.parse_args()
    root = pathlib.Path(args.root).resolve()
    rep = Report(private=not args.public)
    try:
        data, raw = reglib.load_registry(root)
        allowed = reglib.load_allowed(root)
    except (OSError, ValueError) as exc:
        print(f"check_registry: cannot load the registry under {root}: {exc}")
        return 1
    ctx = check_registry(rep, root, data, allowed)
    files = []
    if ctx is not None:
        if not args.no_generated:
            check_generated(rep, root, data, raw)
        files = [pathlib.Path(p) for p in args.tex] if args.tex is not None else sorted(
            list((root / "content").glob("*/de.tex")) + list((root / "content").glob("*/en.tex")))
        for f in files:
            f = f if f.is_absolute() else (pathlib.Path.cwd() / f)
            try:
                show = str(f.resolve().relative_to(root))
            except ValueError:
                show = str(f)
            check_tex(rep, f, ctx, show)
    for e in rep.errors:
        print(e)
    for note in sorted(set(rep.notes)):
        print(f"note: not verified in this run: {note}")
    nota, defs = data["notation.json"]["symbols"], data["definitions.json"]["definitions"]
    print(f"check_registry: {len(nota)} symbols, {len(defs)} definitions, "
          f"{len(data['conventions.json']['conventions'])} conventions, {len(data['translation.json']['rows'])} translation rows, "
          f"{len(files)} content file(s); {len(rep.errors)} error(s)")
    return 1 if rep.errors else 0


if __name__ == "__main__":
    sys.exit(main())
