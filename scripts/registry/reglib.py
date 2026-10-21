"""Shared code of the registry generator and checker (standard library only).

The authored inputs are registry/{notation,definitions,conventions,translation}.json
and registry/allowed-tex.json. Source keys resolve through sources/<key>/source.json
(see source_table); the text-mode macro list is docs/authoring/contract.json. Everything under registry/generated/ and
registry/COLLISIONS.md is produced by generate() and must never be edited by hand.
"""
import hashlib
import json
import pathlib
import re

REPO = pathlib.Path(__file__).resolve().parent.parent.parent
INPUTS = ["notation.json", "definitions.json", "conventions.json", "translation.json"]
CHAPTERS = {f"C{i}" for i in range(22)}
DEPTH_RANK = {"kern": 0, "vertiefung": 1, "fundament": 2}
DEPTH_NAMES = {"kern": ("Kern", "Core"), "vertiefung": ("Vertiefung", "Deeper"),
               "fundament": ("Fundament", "Foundations")}
BLESSED = "blessed-provisional"


# ----------------------------------------------------------------- loading

def load_json(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def load_registry(root):
    """Return (data, raw_bytes) for the four authored files under root/registry."""
    reg = pathlib.Path(root) / "registry"
    data, raw = {}, {}
    for name in INPUTS:
        p = reg / name
        raw[name] = p.read_bytes()
        data[name] = json.loads(raw[name].decode("utf-8"))
    return data, raw


def load_allowed(root):
    p = pathlib.Path(root) / "registry" / "allowed-tex.json"
    if not p.exists():
        p = REPO / "registry" / "allowed-tex.json"
    return load_json(p)


def load_contract():
    """The authoring contract, always the repository's (it owns the text-mode language)."""
    return load_json(REPO / "docs" / "authoring" / "contract.json")


# ------------------------------------------------------------ source keys
# A source key in the registry is the name of a registered source: a directory
# sources/<key>/ with a source.json (owner: the evidence package).  Title, kind and
# file paths are read from that record; the registry keeps no second table.  The
# only other keys admitted are the pseudo-keys declared in translation.json under
# `not_a_source` (the plan, the pre-inventory, notes): they are not sources.

def sources_dir(root):
    """root/sources when the root has one (fixtures bring their own), else the repository's."""
    d = pathlib.Path(root) / "sources"
    return d if d.is_dir() else REPO / "sources"


def source_table(root, tran):
    """Return (table, problems).  table: key -> {registered, title, kind, record, files, path}.

    kind of a registered source: 'text' when it has a member of role text (quotes are
    checked against the file), else 'page-image' (a scan; the reading is the reviewer's).
    files maps the member path as written in a locus to the file on disk."""
    table, problems = {}, []
    sdir = sources_dir(root)
    for rec in sorted(sdir.glob("*/source.json")):
        key = rec.parent.name
        try:
            src = load_json(rec)
            files = [f for f in src["files"] if isinstance(f.get("path"), str)]
            if src["key"] != key:
                raise ValueError(f"key '{src['key']}' is not the directory name")
            title = ", ".join(src.get("authors", [])) + ": " + src["title"]
            if src.get("year"):
                title += f" ({src['year']})"
        except (OSError, ValueError, KeyError, TypeError) as exc:
            problems.append(f"sources/{key}/source.json is unusable ({exc})")
            continue
        table[key] = {"registered": True, "title": title,
                      "kind": "text" if any(f.get("role") == "text" for f in files) else "page-image",
                      "record": f"sources/{key}/source.json",
                      "files": {f["path"]: (sdir / f["path"], f.get("role")) for f in files}}
    for key, info in tran.get("not_a_source", {}).items():
        if key in table:
            problems.append(f"pseudo-key '{key}' in translation.json not_a_source is also a "
                            f"registered source (sources/{key}/source.json)")
            continue
        table[key] = dict(info, registered=False)
    return table, problems


def member_of(info, name):
    """Resolve the file named in a locus to (path on disk, role) or None.

    Registered source: the unique member whose recorded path is `name` or ends in
    '/name' (loci are written relative to the source's own tree).  Pseudo-key with a
    path: that directory joined with the name."""
    if info.get("registered"):
        hits = [v for k, v in info["files"].items() if k == name or k.endswith("/" + name)]
        return hits[0] if len(hits) == 1 else None
    if info.get("path"):
        return (REPO / info["path"] / name, "text")
    return None


def cited_keys(data):
    """Every source key the registry names, in order of first use."""
    keys = []
    def add(k):
        if k and k not in keys:
            keys.append(k)
    for name, lst in (("notation.json", "symbols"), ("definitions.json", "definitions"),
                      ("conventions.json", "conventions")):
        for item in data[name][lst]:
            if isinstance(item.get("origin"), dict):
                add(item["origin"].get("source"))
            for s in item.get("sources", []):
                add(s.get("source"))
    for r in data["translation.json"]["rows"]:
        add(r.get("source"))
    return keys


def input_hashes(raw):
    return {name: hashlib.sha256(raw[name]).hexdigest() for name in INPUTS}


# ------------------------------------------------- minimal schema validator

def validate(instance, schema, path="$", defs=None):
    """Validate against the subset of JSON Schema used in registry/schema/.

    Supported keywords: type, enum, pattern, minLength, minItems, required,
    properties, additionalProperties (boolean), items, $ref (to #/$defs/NAME).
    Returns a list of error strings.
    """
    if defs is None:
        defs = schema.get("$defs", {})
    errs = []
    if "$ref" in schema:
        name = schema["$ref"].rsplit("/", 1)[-1]
        return validate(instance, defs[name], path, defs)
    types = schema.get("type")
    if types is not None:
        if isinstance(types, str):
            types = [types]
        ok = False
        for t in types:
            if t == "object" and isinstance(instance, dict): ok = True
            elif t == "array" and isinstance(instance, list): ok = True
            elif t == "string" and isinstance(instance, str): ok = True
            elif t == "boolean" and isinstance(instance, bool): ok = True
            elif t == "integer" and isinstance(instance, int) and not isinstance(instance, bool): ok = True
            elif t == "null" and instance is None: ok = True
        if not ok:
            return [f"{path}: expected {'/'.join(types)}, got {type(instance).__name__}"]
    if "enum" in schema and instance not in schema["enum"]:
        errs.append(f"{path}: {instance!r} is not one of {schema['enum']}")
    if isinstance(instance, str):
        if "pattern" in schema and not re.search(schema["pattern"], instance):
            errs.append(f"{path}: {instance!r} does not match /{schema['pattern']}/")
        if len(instance) < schema.get("minLength", 0):
            errs.append(f"{path}: string shorter than {schema['minLength']}")
    if isinstance(instance, list):
        if len(instance) < schema.get("minItems", 0):
            errs.append(f"{path}: fewer than {schema['minItems']} items")
        if "items" in schema:
            for i, item in enumerate(instance):
                errs += validate(item, schema["items"], f"{path}[{i}]", defs)
    if isinstance(instance, dict):
        for key in schema.get("required", []):
            if key not in instance:
                errs.append(f"{path}: missing required field '{key}'")
        props = schema.get("properties", {})
        for key, val in instance.items():
            if key in props:
                errs += validate(val, props[key], f"{path}.{key}", defs)
            elif schema.get("additionalProperties") is False:
                errs.append(f"{path}: unknown field '{key}'")
    return errs


# ----------------------------------------------------------- TeX utilities

def strip_comments(tex):
    return re.sub(r"(?<!\\)%.*", "", tex)


def control_words(tex):
    """Control words (without backslash) used in a TeX string, comments removed."""
    return re.findall(r"\\([A-Za-z@]+)", strip_comments(tex))


def legacy_macros(root):
    """Macros defined by latex/tpc-macros.sty: name -> (nargs, expansion)."""
    p = pathlib.Path(root) / "latex" / "tpc-macros.sty"
    if not p.exists():
        p = REPO / "latex" / "tpc-macros.sty"
    out = {}
    if not p.exists():
        return out
    for line in strip_comments(p.read_text(encoding="utf-8")).splitlines():
        m = re.match(r"\s*\\newcommand\{\\([A-Za-z]+)\}(?:\[(\d)\])?(?:\[[^\]]*\])?\{(.*)\}\s*$", line)
        if m:
            out[m.group(1)] = (int(m.group(2) or 0), m.group(3))
            continue
        m = re.match(r"\s*\\DeclareMathOperator\*?\{\\([A-Za-z]+)\}\{(.*)\}\s*$", line)
        if m:
            out[m.group(1)] = (0, "\\operatorname{" + m.group(2) + "}")
    return out


def norm_tex(s):
    return re.sub(r"\s+", "", s)


def instance_tex(sym):
    """The symbol's expansion with its example arguments substituted."""
    tex = sym["tex"]
    out = tex["expansion"]
    for i, arg in enumerate(tex.get("arg_examples", []), start=1):
        out = out.replace(f"#{i}", "{" + arg + "}")
    return out


def usage_tex(sym):
    """How the macro is written in content, with the example arguments."""
    tex = sym["tex"]
    return "\\" + tex["macro"] + "".join("{" + a + "}" for a in tex.get("arg_examples", []))


# ------------------------------------------------------- TeX -> MathML

GREEK = {"alpha": "α", "beta": "β", "gamma": "γ", "delta": "δ", "epsilon": "ϵ", "varepsilon": "ε",
         "zeta": "ζ", "eta": "η", "theta": "θ", "kappa": "κ", "lambda": "λ", "mu": "μ", "nu": "ν",
         "xi": "ξ", "pi": "π", "rho": "ρ", "sigma": "σ", "tau": "τ", "phi": "ϕ", "varphi": "φ",
         "chi": "χ", "psi": "ψ", "omega": "ω", "Gamma": "Γ", "Delta": "Δ", "Theta": "Θ",
         "Lambda": "Λ", "Xi": "Ξ", "Pi": "Π", "Sigma": "Σ", "Phi": "Φ", "Psi": "Ψ", "Omega": "Ω",
         "hbar": "ℏ", "ell": "ℓ", "infty": "∞"}
UPRIGHT_GREEK = set("ΓΔΘΛΞΠΣΦΨΩ∞")
OPS = {"langle": "⟨", "rangle": "⟩", "mid": "|", "dagger": "†", "otimes": "⊗", "oplus": "⊕",
       "pm": "±", "leq": "≤", "geq": "≥", "cdot": "⋅", "lvert": "|", "rvert": "|", "lVert": "‖", "rVert": "‖", "lbrace": "{",
       "rbrace": "}", "{": "{", "}": "}", "dot": "˙", "tilde": "~", "in": "∈"}
ACCENTS = {"hat": "^", "widehat": "^", "tilde": "~", "bar": "¯", "dot": "˙"}
SCRIPT_EXC = {"B": "ℬ", "E": "ℰ", "F": "ℱ", "H": "ℋ", "I": "ℐ", "L": "ℒ", "M": "ℳ", "R": "ℛ"}
BB_EXC = {"C": "ℂ", "H": "ℍ", "N": "ℕ", "P": "ℙ", "Q": "ℚ", "R": "ℝ", "Z": "ℤ"}


class MathMLError(ValueError):
    pass


def _alpha(ch, style):
    if style == "cal":
        if ch in SCRIPT_EXC: return SCRIPT_EXC[ch]
        if "A" <= ch <= "Z": return chr(0x1D49C + ord(ch) - 65)
    elif style == "bb":
        if ch in BB_EXC: return BB_EXC[ch]
        if "A" <= ch <= "Z": return chr(0x1D538 + ord(ch) - 65)
        if "0" <= ch <= "9": return chr(0x1D7D8 + ord(ch) - 48)
    elif style == "bold":
        if "A" <= ch <= "Z": return chr(0x1D468 + ord(ch) - 65)
        if "a" <= ch <= "z": return chr(0x1D482 + ord(ch) - 97)
    elif style == "sf":
        if "A" <= ch <= "Z": return chr(0x1D5A0 + ord(ch) - 65)
        if "a" <= ch <= "z": return chr(0x1D5BA + ord(ch) - 97)
    raise MathMLError(f"no {style} form of {ch!r}")


def _tokens(tex):
    return re.findall(r"\\[A-Za-z]+|\\.|[{}^_]|[^\s\\{}^_]", tex)


def _esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def tex_to_mathml(tex):
    """Convert the constrained TeX subset used in symbol expansions to MathML.

    Unsupported constructs raise MathMLError; they are never dropped silently.
    """
    toks = _tokens(tex)
    pos = 0

    def group(style):
        """Parse one argument: a braced group or a single token."""
        nonlocal pos
        if pos >= len(toks):
            raise MathMLError("missing argument")
        if toks[pos] == "{":
            pos += 1
            items = seq(style, "}")
            pos += 1
            return items
        return [atom(style)]

    def row(items):
        return items[0] if len(items) == 1 else "<mrow>" + "".join(items) + "</mrow>"

    def atom(style):
        nonlocal pos
        t = toks[pos]
        pos += 1
        if t == "{":
            items = seq(style, "}")
            pos += 1
            return row(items)
        if t.startswith("\\"):
            name = t[1:]
            if name in ("mathcal", "mathbb", "boldsymbol", "mathbf", "mathsf", "mathrm", "operatorname", "text"):
                sub = {"mathcal": "cal", "mathbb": "bb", "boldsymbol": "bold", "mathbf": "bold",
                       "mathsf": "sf", "mathrm": "op", "operatorname": "op", "text": "op"}[name]
                if sub == "op":
                    if toks[pos] != "{":
                        raise MathMLError("\\operatorname needs braces")
                    pos += 1
                    word = ""
                    while toks[pos] != "}":
                        word += toks[pos]
                        pos += 1
                    pos += 1
                    return f'<mi mathvariant="normal">{_esc(word)}</mi>'
                return row(group(sub))
            if name in ACCENTS:
                base = row(group(style))
                return f'<mover accent="true">{base}<mo>{ACCENTS[name]}</mo></mover>'
            if name in GREEK:
                ch = GREEK[name]
                if ch in UPRIGHT_GREEK or name in ("hbar",):
                    return f'<mi mathvariant="normal">{ch}</mi>'
                return f"<mi>{ch}</mi>"
            if name in OPS:
                return f"<mo>{_esc(OPS[name])}</mo>"
            if name in (",", "!", ";", "quad"):
                return "<mspace/>"
            if name in ("left", "right"):
                return atom(style)
            if name in ("ln", "log", "exp", "min", "max"):
                return f'<mi mathvariant="normal">{name}</mi>'
            raise MathMLError(f"unsupported TeX command \\{name}")
        if t.isalpha():
            if style == "rm":
                return f'<mi mathvariant="normal">{t}</mi>'
            if style in ("cal", "bb", "bold", "sf"):
                return f"<mi>{_alpha(t, style)}</mi>"
            return f"<mi>{t}</mi>"
        if t.isdigit():
            if style == "bb":
                return f"<mn>{_alpha(t, style)}</mn>"
            return f"<mn>{t}</mn>"
        if t in "()[]|,+-*/=:;.<>":
            return f"<mo>{_esc(t)}</mo>"
        raise MathMLError(f"unsupported token {t!r}")

    def seq(style, stop):
        nonlocal pos
        items = []
        while pos < len(toks) and toks[pos] != stop:
            if toks[pos] in "^_":
                if not items:
                    items.append("<mrow/>")
                base = items.pop()
                if base == "<mo>)</mo>":
                    # the script belongs to the whole bracketed expression,
                    # including the function symbol in front of it
                    depth, i = 1, len(items) - 1
                    while i >= 0 and depth:
                        depth += {"<mo>)</mo>": 1, "<mo>(</mo>": -1}.get(items[i], 0)
                        i -= 1
                    if depth:
                        raise MathMLError("unbalanced parentheses")
                    start = max(i, 0)
                    base = "<mrow>" + "".join(items[start:]) + base + "</mrow>"
                    del items[start:]
                sub = sup = None
                while pos < len(toks) and toks[pos] in "^_":
                    which = toks[pos]
                    pos += 1
                    arg = row(group(style))
                    if which == "_":
                        sub = arg
                    else:
                        sup = arg
                if sub is not None and sup is not None:
                    items.append(f"<msubsup>{base}{sub}{sup}</msubsup>")
                elif sub is not None:
                    items.append(f"<msub>{base}{sub}</msub>")
                else:
                    items.append(f"<msup>{base}{sup}</msup>")
            else:
                items.append(atom(style))
        if stop and pos >= len(toks):
            raise MathMLError("unbalanced braces")
        return items

    items = seq(None, None)
    return "<math>" + row(items) + "</math>"


# --------------------------------------------------------------- generation

def _header(hashes, comment):
    lines = ["GENERATED by scripts/registry/gen_registry.py. Do not edit.",
             "Inputs (sha256):"]
    lines += [f"  registry/{n} {hashes[n]}" for n in INPUTS]
    return "".join(f"{comment} {line}\n" for line in lines)


def _md_header(hashes):
    return "<!--\n" + _header(hashes, "    ").rstrip("\n") + "\n-->\n\n"


def _md(s):
    return str(s).replace("|", "\\|").replace("\n", " ")


def _src_text(sources):
    parts = []
    for s in sources:
        mark = "verified" if s.get("verified") else "NOT verified"
        parts.append(f"{s['source']}, {s.get('locus', '(no locus)')} [{mark}]")
    return "; ".join(parts)


def gen_sty(data, hashes, legacy):
    out = ["\\NeedsTeXFormat{LaTeX2e}\n",
           "\\ProvidesPackage{tpc-notation}[2026/10/11 generated notation macros of Theoretische Physik C]\n",
           _header(hashes, "%"),
           "% One macro per registered symbol. A macro that tpc-macros.sty already defines\n"
           "% with the same expansion is emitted with \\providecommand, so both packages load\n"
           "% in either order. Every other macro uses \\newcommand: a name clash is an error.\n"
           "% The host must load amsmath and provide \\mathbb and \\mathcal (tpc-style.sty does\n"
           "% both). amsmath is not required here: tpc-style.sty loads mathspec, which refuses\n"
           "% any later \\RequirePackage{amsmath}.\n"]
    for sym in data["notation.json"]["symbols"]:
        tex = sym["tex"]
        note = f"% {sym['symbol_id']} [{sym['status']}] {sym['name_en']}"
        if tex.get("builtin"):
            out.append(f"{note}: \\{tex['macro']} is a LaTeX kernel/amsmath command, not redefined\n")
            continue
        cmd = "\\providecommand" if tex["macro"] in legacy else "\\newcommand"
        nargs = f"[{tex['args']}]" if tex["args"] else ""
        out.append(f"{note}\n{cmd}{{\\{tex['macro']}}}{nargs}{{{tex['expansion']}}}\n")
    out.append("\\endinput\n")
    return "".join(out)


def gen_defs_tex(data, hashes):
    out = [_header(hashes, "%"),
           "% One declaration per definition, in the interface of latex/tpc-course.sty:\n"
           "%   \\tpcdeclaredef{ID}{depth}{Titel}{Title}{deutscher Text}{English text}\n"
           "% tpc-course.sty turns \\tpcdef{D17} into a numbered definition in the current\n"
           "% language and checks the depth. The \\providecommand lines below are a plain\n"
           "% fallback so that this file also works without tpc-course.sty: there\n"
           "% \\tpcdef{D17} prints the name in bold and the body, in the language chosen by\n"
           "% \\tpcifenglish (German when that macro is absent). An unknown ID is an error.\n"
           "\\makeatletter\n"
           "\\providecommand{\\tpcifenglish}[2]{#2}\n"
           "\\providecommand{\\tpcdeclaredef}[6]{%\n"
           "  \\@namedef{tpcdef@depth@#1}{#2}%\n"
           "  \\long\\@namedef{tpcdef@title@#1}{\\tpcifenglish{#4}{#3}}%\n"
           "  \\long\\@namedef{tpcdef@body@#1}{\\tpcifenglish{#6}{#5}}}\n"
           "\\providecommand{\\tpcdef}[1]{%\n"
           "  \\@ifundefined{tpcdef@body@#1}%\n"
           "    {\\PackageError{tpc-definitions}{Definition `#1' is not in the registry}{See registry/definitions.json.}}%\n"
           "    {\\par\\noindent\\textbf{Definition #1 (\\@nameuse{tpcdef@title@#1}).} \\@nameuse{tpcdef@body@#1}\\par}}\n"
           "\\makeatother\n"]
    for d in data["definitions.json"]["definitions"]:
        out.append(f"% {d['id']} [{d['status']}]\n"
                   f"\\tpcdeclaredef{{{d['id']}}}{{{d['depth']}}}{{{d['name_de']}}}{{{d['name_en']}}}%\n"
                   f"  {{{d['body_de']}}}%\n  {{{d['body_en']}}}\n")
    out.append("\\endinput\n")
    return "".join(out)


def gen_notation_web(data, hashes):
    syms = []
    for s in data["notation.json"]["symbols"]:
        syms.append({"symbol_id": s["symbol_id"], "macro": s["tex"]["macro"], "args": s["tex"]["args"],
                     "expansion": s["tex"]["expansion"], "tex": instance_tex(s), "usage": usage_tex(s),
                     "unicode": s["unicode"], "mathml": s["mathml"],
                     "name": {"de": s["name_de"], "en": s["name_en"]},
                     "meaning": {"de": s["meaning_de"], "en": s["meaning_en"]},
                     "depth": s["depth"], "first_fixed_in": s["first_fixed_in"], "status": s["status"],
                     "verified": any(x.get("verified") for x in s["sources"])})
    doc = {"_generated": {"by": "scripts/registry/gen_registry.py", "inputs_sha256": hashes},
           "schema_version": data["notation.json"]["schema_version"], "symbols": syms}
    return json.dumps(doc, ensure_ascii=False, indent=1) + "\n"


def gen_definitions_web(data, hashes):
    defs = []
    for d in data["definitions.json"]["definitions"]:
        defs.append({"id": d["id"], "name": {"de": d["name_de"], "en": d["name_en"]},
                     "body": {"de": d["body_de"], "en": d["body_en"]}, "symbol_ids": d["symbol_ids"],
                     "depth": d["depth"], "origin": d["origin"]["type"], "choices": d["choices"],
                     "status": d["status"], "first_fixed_in": d["first_fixed_in"],
                     "needs_check": bool(d.get("needs_check"))})
    doc = {"_generated": {"by": "scripts/registry/gen_registry.py", "inputs_sha256": hashes},
           "schema_version": data["definitions.json"]["schema_version"], "definitions": defs}
    return json.dumps(doc, ensure_ascii=False, indent=1) + "\n"


def gen_notation_md(data, hashes, legacy):
    syms = data["notation.json"]["symbols"]
    out = [_md_header(hashes), "# Notation / Notation\n\n",
           "Status `blessed-provisional`: checked against a local source and usable in the smoke "
           "chapters; TJO has not yet blessed it. `proposed`: seeded from the pre-inventory, not "
           "checked. `collision-open`: see `registry/COLLISIONS.md`.\n\n",
           "| Symbol | Macro | DE | EN | Bedeutung / meaning | Depth | First fixed | Status | Sources |\n",
           "|---|---|---|---|---|---|---|---|---|\n"]
    for s in syms:
        out.append(f"| {_md(s['unicode'])} | `{_md(usage_tex(s))}` | {_md(s['name_de'])} | {_md(s['name_en'])} | "
                   f"{_md(s['meaning_de'])} / {_md(s['meaning_en'])} | {s['depth']} | {s['first_fixed_in']} | "
                   f"{s['status']} | {_md(_src_text(s['sources']))} |\n")
    out.append("\n## Relation to `latex/tpc-macros.sty`\n\n")
    same = [s for s in syms if s["tex"]["macro"] in legacy and not s["tex"].get("builtin")]
    out.append("Emitted with `\\providecommand` (same name and same expansion as the legacy macro): "
               + (", ".join(f"`\\{s['tex']['macro']}`" for s in same) or "none") + ".\n\n")
    out.append("Legacy macros with a canonical macro of a different name:\n\n")
    out.append("| Legacy macro | Canonical macro | Symbol | Note |\n|---|---|---|---|\n")
    for s in syms:
        for a in s.get("legacy_aliases", []):
            if a["macro"] != s["tex"]["macro"]:
                out.append(f"| `\\{a['macro']}` | `\\{s['tex']['macro']}` | {s['symbol_id']} | {_md(a.get('note', ''))} |\n")
    out.append("\n## Conventions / Konventionen\n\n| ID | DE | EN | Statement | Fixed in | Status | Sources |\n|---|---|---|---|---|---|---|\n")
    for c in data["conventions.json"]["conventions"]:
        chk = " **needs check: " + _md(c.get("check", "")) + "**" if c.get("needs_check") else ""
        out.append(f"| {c['id']} | {_md(c['name_de'])} | {_md(c['name_en'])} | {_md(c['statement_en'])}{chk} | "
                   f"{c['fixed_in']} | {c['status']} | {_md(_src_text(c['sources']))} |\n")
    return "".join(out)


def gen_definitions_md(data, hashes):
    out = [_md_header(hashes), "# Definitionen / Definitions\n\n",
           "Numbers are never reused or renumbered. A body marked *needs check* is not yet "
           "verified against a source page; it must not be cited as settled.\n\n"]
    for d in data["definitions.json"]["definitions"]:
        o = d["origin"]
        where = o.get("brief_pointer") or f"{o.get('source', '')}, {o.get('locus', '')}"
        out.append(f"## {d['id']}. {d['name_de']} / {d['name_en']}\n\n")
        out.append(f"- depth: {d['depth']}; first fixed in: {d['first_fixed_in']}; status: {d['status']}\n")
        out.append(f"- origin: {o['type']} ({where})\n")
        if d["choices"]:
            out.append(f"- choices: {', '.join(d['choices'])}\n")
        out.append(f"- symbols: {', '.join(d['symbol_ids']) or 'none'}\n")
        out.append(f"- sources: {_src_text(d['sources'])}\n")
        if d.get("needs_check"):
            out.append(f"- **needs check**: {d.get('check', '')}\n")
        if d.get("gap_tjo"):
            out.append(f"- **GAP-TJO**: {d['gap_tjo']}\n")
        out.append(f"\nDE: {d['body_de']}\n\nEN: {d['body_en']}\n\n")
    return "".join(out)


def gen_translation_md(data, hashes, root):
    tr = data["translation.json"]
    table, _ = source_table(root, tr)
    cited = cited_keys(data)
    out = [_md_header(hashes), "# Übersetzungstabelle der Quellen / Source translation guide\n\n",
           "A row is a typed correspondence, not a search-and-replace rule. Rows exist only for "
           "tokens that were read at the stated locus.\n\n## Sources\n\n"
           "A source key is the name of a registered source, `sources/<key>/source.json`; title "
           "and kind below are read from that record. Listed: the registered sources that the "
           "registry cites.\n\n| Key | Title | Kind | Record |\n|---|---|---|---|\n"]
    for key in sorted(k for k in cited if table.get(k, {}).get("registered")):
        s = table[key]
        out.append(f"| {key} | {_md(s['title'])} | {s['kind']} | `{s['record']}` |\n")
    out.append("\n## Not sources\n\nPseudo-keys declared in `registry/translation.json` under "
               "`not_a_source`: project documents and notes that an entry may point to. They "
               "are not registered sources and no provenance row can name them.\n\n"
               "| Key | What it is | Kind | Path |\n|---|---|---|---|\n")
    for key, s in tr.get("not_a_source", {}).items():
        out.append(f"| {key} | {_md(s['title'])} | {s['kind']} | `{s.get('path', '')}` |\n")
    by = {}
    for r in tr["rows"]:
        by.setdefault(r["source"], []).append(r)
    for key in sorted(by):
        out.append(f"\n## {key}\n\n| ID | Source token | Meaning in the source | Canonical | Mapping and conditions | Locus | Quote |\n|---|---|---|---|---|---|---|\n")
        for r in by[key]:
            out.append(f"| {r['id']} | `{_md(r['source_token'])}` | {_md(r['source_meaning'])} | "
                       f"{', '.join(r['canonical']) or '(none)'} | {_md(r['mapping'])} | {_md(r['locus'])} | "
                       f"`{_md(r['quote'])}` |\n")
    return "".join(out)


def gen_collisions_md(data, hashes):
    out = [_md_header(hashes), "# Open notation collisions, for TJO\n\n",
           "Each collision is recorded in `registry/notation.json` (`collisions`). Nothing here is "
           "settled. Where a smoke chapter needs a symbol now, one meaning is marked "
           "`blessed-provisional`; that is a working choice, not a decision.\n\n"]
    sym = {s["symbol_id"]: s for s in data["notation.json"]["symbols"]}
    for c in data["notation.json"].get("collisions", []):
        out.append(f"## {c['id']}: `{c['token']}`\n\n")
        out.append("| Meaning | Symbol ID | Rendered now as | Status |\n|---|---|---|---|\n")
        for sid in c["symbol_ids"]:
            s = sym[sid]
            out.append(f"| {_md(s['name_de'])} / {_md(s['name_en'])} | {sid} | {_md(s['unicode'])} | {s['status']} |\n")
        out.append(f"\nConflict: {c['conflict']}\n\nProposed resolution: {c['proposal']}\n\nReason: {c['reason']}\n\n")
        if c.get("provisional"):
            out.append(f"Provisional for the smokes: {c['provisional']}\n\n")
    return "".join(out)


def generate(data, raw, root):
    """Return {relative path: text} for every generated file."""
    hashes = input_hashes(raw)
    legacy = legacy_macros(root)
    g = "registry/generated/"
    return {
        g + "tpc-notation.sty": gen_sty(data, hashes, legacy),
        g + "tpc-definitions.tex": gen_defs_tex(data, hashes),
        g + "notation.web.json": gen_notation_web(data, hashes),
        g + "definitions.web.json": gen_definitions_web(data, hashes),
        g + "NOTATION.md": gen_notation_md(data, hashes, legacy),
        g + "DEFINITIONS.md": gen_definitions_md(data, hashes),
        g + "TRANSLATION.md": gen_translation_md(data, hashes, root),
        "registry/COLLISIONS.md": gen_collisions_md(data, hashes),
    }
