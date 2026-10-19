#!/usr/bin/env python3
"""Depth-system and authoring-contract gate for the new course.

Usage:
  python3 scripts/course/check_levels.py [--chapters c00,c11] [--with-test-chapter]
        [--content DIR] [--build DIR] [--langs de,en]
        [--run-build] [--lint-only] [--no-lint] [--registry FILE]
        [--sources DIR]

Two halves.  The LINT reads content/cNN-slug/{de,en}.tex and chapter.json with
a small scanner (comments, groups, environments, math mode; no regex over
TeX structure).  The BUILD half reads the logs, .aux files and build records
that scripts/course/build_course.sh leaves under --build.

Every finding is one line "<CHECK> <where>: <what>".  Checks:

  B0  build evidence present and fresh: build.json, log and aux exist, are
      non-empty, the log belongs to the record, the compiler exited 0, the
      sources hash as they did when the build ran (chapter files, styles,
      masters, registry/generated/**, design/build/pkgN-<ground>/**)
  C1  every edition: zero TeX errors ('!' lines and file:line: errors), zero
      undefined references or citations, no duplicate labels
  CEN label census: the labels the sources promise are exactly the labels in
      the .aux, for the Kern and the full edition
  K4  (C2) every label of the Kern edition has the same number in the full one
  K2  a plain \\ref / \\eqref / \\pageref from Kern text into a depth block
      (statically from the sources, and as an undefined reference of the Kern
      build whose target exists in the full build)
  C3  every depth block has id, titel, wozu, voraussetzung, zurueck; no depth
      block inside a depth block; Fundament blocks stand at the end
  C4  every signpost resolves to a depth block; every Fundament block is
      reachable from a Kern signpost (directly or through a signposted
      Vertiefung); the full .aux has its back-link anchor
  K6  (C8) DE and EN: same sequence of depth blocks, IDs and environments,
      and more generally the same sequence of every identified construct (PAR)
  M1  display equations are identical in DE and EN
  ID  grammar, uniqueness, chapter prefix, kind matches the construct,
      every numbered unit / equation / section carries its ID
  L1  forbidden construct;  L2  construct outside the closed list
  CL  \\claim[presentation]{id}{status} well-formed and attached directly
      after a \\label; every theorem-like unit (theorem, lemma, proposition,
      corollary) carries exactly one on its own label; a presentation only
      on the claim of a theorem-like unit; no claim ID twice in a file
  NU  \\num[claim-id]{value}{unit} in text mode: two arguments, a non-empty
      value, a well-formed claim ID (in mathematics the macro is read by
      the evidence gate only, which owns the rule that every numeral in
      content is supported: check_evidence.py, [number])
  SR  \\srcref{key}{locus}: the key is a registered source, that is
      sources/<key>/source.json exists (--sources DIR), and the locus is
      not empty
  JS  chapter.json
  K1  Kern transcludes and cites only definitions of depth kern, and a
      definition is transcluded at its own depth (definitions registry)
  K5  figure files carry no references; Kern exercises are Kern text and so
      fall under K1 and K2
  C6  pages per edition (reported, not gated)

Division of labour with scripts/evidence/check_evidence.py.  This gate
checks the shape of a \\claim and where it stands, from the sources alone.
The evidence gate owns everything that needs the ledger: that the ID is a
row of evidence/claims.json, that status, presentation and depth written
in content equal the row, that a theorem-like unit is tagged with a row of
that kind, that each row is tagged exactly once per language, K3 (a Kern
claim has a scope), and that a \\srcref key is the source of a provenance
row of a claim tagged in the same file.  Both gates read the claim as
\\claim[presentation]{id}{status} and take the list of theorem-like units
from contract.json (theorem_like); both require a claim in each of them.
Exit status 1 if any finding, else 0.
"""
import argparse
import json
import pathlib
import re
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
import build_record  # noqa: E402

CONTRACT = json.loads((ROOT / "docs" / "authoring" / "contract.json").read_text())
G = {k: re.compile(v) for k, v in CONTRACT["id_grammar"].items()}
NUMBERED = CONTRACT["numbered_units"]
THEOREM_LIKE = set(CONTRACT["theorem_like"])
SOURCE_KEY = re.compile(CONTRACT["source_key"])
SOURCES_DIR = ROOT / "sources"   # --sources
DEPTH_ENVS = CONTRACT["depth_blocks"]
FIG_ENVS = CONTRACT["figure_envs"]
DISPLAY = set(CONTRACT["display_math"])
INNER = set(CONTRACT["inner_math"])
TEXT_ENVS = (set(NUMBERED) | set(CONTRACT["unnumbered_units"]) | set(CONTRACT["boxes"])
             | set(CONTRACT["lists"]) | set(DEPTH_ENVS) | set(FIG_ENVS)
             | set(CONTRACT["table_envs"]))
TEXT_MACROS = set(CONTRACT["text_macros"])
FORBIDDEN = set(CONTRACT["forbidden_everywhere"])
CONTROL_SYMBOLS = set(CONTRACT["control_symbols"])
STATUSES = set(CONTRACT["evidence_statuses"])
PRESENTATIONS = set(CONTRACT["presentations"])
TEST_CHAPTERS = set(CONTRACT["test_chapters"])
DEPTH_NAME = {"K": "kern", "V": "vertiefung", "F": "fundament"}

findings = []
notes = []


def fail(check, where, what):
    findings.append(f"{check} {where}: {what}")


# ══════════════════════════════════════════════════════════════
#  Scanner
# ══════════════════════════════════════════════════════════════
def strip_comments(src: str) -> str:
    """Remove % comments, keeping line structure."""
    out = []
    for line in src.split("\n"):
        i, n = 0, len(line)
        while i < n:
            if line[i] == "\\":
                i += 2
                continue
            if line[i] == "%":
                line = line[:i]
                break
            i += 1
        out.append(line)
    return "\n".join(out)


def read_balanced(s, i, open_ch, close_ch):
    """s[i] == open_ch.  Return (content, index after the closing char).
    Braces always nest; for [ ] the bracket closes at brace depth 0."""
    assert s[i] == open_ch
    depth_brace = 0
    j = i + 1
    start = j
    while j < len(s):
        c = s[j]
        if c == "\\":
            j += 2
            continue
        if open_ch == "{":
            if c == "{":
                depth_brace += 1
            elif c == "}":
                if depth_brace == 0:
                    return s[start:j], j + 1
                depth_brace -= 1
        else:
            if c == "{":
                depth_brace += 1
            elif c == "}":
                depth_brace -= 1
            elif c == close_ch and depth_brace == 0:
                return s[start:j], j + 1
        j += 1
    return None, len(s)


def skip_ws(s, i):
    while i < len(s) and s[i].isspace():
        i += 1
    return i


def split_keys(arg: str):
    """key=value list with brace-aware commas."""
    parts, depth, cur = [], 0, ""
    i = 0
    while i < len(arg):
        c = arg[i]
        if c == "\\":
            cur += arg[i:i + 2]
            i += 2
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
        if c == "," and depth == 0:
            parts.append(cur)
            cur = ""
        else:
            cur += c
        i += 1
    if cur.strip():
        parts.append(cur)
    keys = {}
    for part in parts:
        if "=" not in part:
            keys[part.strip()] = ""
            continue
        k, v = part.split("=", 1)
        v = v.strip()
        if v.startswith("{") and v.endswith("}"):
            v = v[1:-1]
        keys[k.strip()] = v
    return keys


TOKEN = re.compile(r"\\begin\s*\{([^}]*)\}|\\end\s*\{([^}]*)\}|\\([A-Za-z@]+)\*?|\\(.)|(\$\$?)|([{}])",
                   re.S)


class Chapter:
    """Everything the scanner learns from one language file."""

    def __init__(self, path, chap_id, lang):
        self.path, self.chap, self.lang = path, chap_id, lang
        self.labels = []      # (id, line, depth, kind, block)
        self.refs = []        # (macro, id, line, depth)
        self.zoomrefs = []    # (id, line, depth, block)
        self.blocks = []      # (env, id, line, keys)
        self.claims = []      # (id, status, presentation, line)
        self.demos = []       # (id, figure id, line)
        self.figures = []     # (env, id, line, depth)
        self.defs = []        # (macro, id, line, depth)
        self.srcrefs = []     # (key, locus, line)
        self.sequence = []    # parity fingerprint
        self.equations = []   # (env, normalised body, line)
        self.titles = {}      # 'chapter' -> title text

    def where(self, line):
        return f"{self.path}:{line}"


def scan(ch: Chapter, text: str, line0: int, depth: str, block, top: bool, math_mode=False):
    """Scan `text`.  depth is K, V or F; block is the enclosing depth-block ID.
    top is True for the file itself (False for titles, key values)."""
    stack = []            # frames: dict(kind, name, math, line, start)
    pos = 0
    expect_label = None   # (kind, line) set by a construct that needs its ID next
    last_label_end = -1
    labelled_unit = None  # the unit frame named by the most recent text-mode \label
    pending_text = False  # the next '{' opens a text group inside math
    fundament_seen = False
    kern_after_f_reported = False

    def line_of(p):
        return line0 + text.count("\n", 0, p)

    def in_math():
        for f in reversed(stack):
            if f["math"] is not None:
                return f["math"]
        return math_mode

    def cur_depth():
        for f in reversed(stack):
            if f["kind"] == "env" and f["name"] in DEPTH_ENVS:
                return f["depth"], f["block"]
        return depth, block

    def env_names():
        return [f["name"] for f in stack if f["kind"] == "env"]

    def display_frame():
        for f in reversed(stack):
            if f["kind"] == "env" and f["name"] in DISPLAY:
                return f
        return None

    def check_id(kind_wanted, ident, line):
        """Grammar, prefix and kind of an ID that a construct of kind_wanted carries."""
        w = ch.where(line)
        if kind_wanted in ("chapter", "section", "subsection", "vertiefung", "fundament"):
            if not G[kind_wanted].match(ident):
                fail("ID", w, f"malformed id '{ident}' for a {kind_wanted} "
                     f"(grammar {G[kind_wanted].pattern})")
                return
        elif kind_wanted == "definition":
            if not G["definition"].match(ident):
                fail("ID", w, f"malformed definition id '{ident}'")
            return
        else:
            m = G["typed"].match(ident)
            if not m:
                fail("ID", w, f"malformed id '{ident}' (grammar {G['typed'].pattern})")
                return
            if m.group(1) != kind_wanted:
                fail("ID", w, f"id '{ident}' has kind '{m.group(1)}' but names a '{kind_wanted}'")
        if not ident.startswith(ch.chap + ".") and ident != ch.chap:
            fail("ID", w, f"id '{ident}' does not carry the chapter prefix '{ch.chap}'")

    def read_group(p, what, line):
        p = skip_ws(text, p)
        if p >= len(text) or text[p] != "{":
            fail("L2", ch.where(line), f"{what}: missing {{argument}}")
            return None, p
        return read_balanced(text, p, "{", "}")

    while True:
        m = TOKEN.search(text, pos)
        between = text[pos:m.start()] if m else text[pos:]
        # plain text between tokens
        if between.strip():
            if expect_label:
                fail("ID", ch.where(expect_label[1]),
                     f"{expect_label[2]} has no \\label directly after it")
                expect_label = None
            d, _ = cur_depth()
            if top and fundament_seen and d == "K" and not stack and not kern_after_f_reported:
                fail("C3", ch.where(line_of(pos + len(between) - len(between.lstrip()))),
                     "Kern text after the first fundament block "
                     "(Fundament blocks stand at the end of the chapter)")
                kern_after_f_reported = True
        if not m:
            break
        pos = m.end()
        line = line_of(m.start())
        w = ch.where(line)
        begin, end, macro, symbol, dollar, brace = m.groups()

        if (top and fundament_seen and not stack and not kern_after_f_reported
                and cur_depth()[0] == "K"
                and not (begin is not None and begin.strip() == "fundament")):
            fail("C3", w, "Kern text after the first fundament block "
                 "(Fundament blocks stand at the end of the chapter)")
            kern_after_f_reported = True

        if expect_label and not (macro == "label"):
            fail("ID", ch.where(expect_label[1]),
                 f"{expect_label[2]} has no \\label directly after it")
            expect_label = None

        # ── groups ────────────────────────────────────────────
        if brace == "{":
            stack.append({"kind": "group", "name": None, "line": line,
                          "math": False if pending_text else None})
            pending_text = False
            continue
        pending_text = False
        if brace == "}":
            if stack and stack[-1]["kind"] == "group":
                stack.pop()
            else:
                fail("L2", w, "unbalanced '}'")
            continue

        # ── inline math ───────────────────────────────────────
        if dollar:
            if dollar == "$$":
                fail("L1", w, "forbidden construct '$$' (use equation*)")
                continue
            if stack and stack[-1]["kind"] == "dollar":
                stack.pop()
            else:
                stack.append({"kind": "dollar", "name": None, "math": True, "line": line})
            continue

        # ── control symbols ───────────────────────────────────
        if symbol is not None:
            tok = "\\" + symbol
            if tok in ("\\[", "\\]", "\\(", "\\)"):
                fail("L1", w, f"forbidden construct '{tok}' (use $...$ or equation*)")
            elif tok == "\\\\":
                names = env_names()
                if not in_math() and "tabular" not in names:
                    fail("L1", w, "forbidden construct '\\\\' in running text")
            elif tok not in CONTROL_SYMBOLS and not in_math():
                fail("L2", w, f"control symbol '{tok}' is not in the contract")
            continue

        # ── environments ──────────────────────────────────────
        if begin is not None:
            name = begin.strip()
            math = in_math()
            frame = {"kind": "env", "name": name, "math": None, "line": line,
                     "start": pos, "depth": None, "block": None}
            names = env_names()
            if name in DISPLAY:
                if math:
                    fail("L2", w, f"display environment '{name}' inside mathematics")
                frame["math"] = True
            elif name in INNER:
                if not math:
                    fail("L2", w, f"environment '{name}' outside mathematics")
            elif name in TEXT_ENVS:
                if math:
                    fail("L2", w, f"environment '{name}' inside mathematics")
            elif name in CONTRACT["forbidden_environments_named"]:
                fail("L1", w, f"forbidden construct: environment '{name}'")
            else:
                fail("L2", w, f"environment '{name}' is not in the contract")

            if name in DEPTH_ENVS:
                d_now, _ = cur_depth()
                letter = DEPTH_ENVS[name].upper()
                keys = {}
                p = skip_ws(text, pos)
                if p < len(text) and text[p] == "[":
                    arg, p2 = read_balanced(text, p, "[", "]")
                    if arg is None:
                        fail("C3", w, f"{name}: unterminated [keys]")
                    else:
                        keys = split_keys(arg)
                        pos = p2
                ident = keys.get("id", "")
                label = ident or "(no id)"
                if d_now != "K":
                    fail("C3", w, f"nested depth block: {name} '{label}' inside a depth block")
                elif names:
                    fail("C3", w, f"depth block '{label}' inside environment '{names[-1]}'")
                human = {"id": "id", "titel": "title (titel)", "wozu": "lead (wozu)",
                         "voraussetzung": "dependency statement (voraussetzung)",
                         "zurueck": "return line (zurueck)"}
                for k in CONTRACT["depth_keys"]:
                    if not keys.get(k, "").strip():
                        fail("C3", w, f"depth block {label}: missing {human[k]}")
                for k in keys:
                    if k not in CONTRACT["depth_keys"]:
                        fail("C3", w, f"depth block {label}: unknown key '{k}'")
                if ident:
                    check_id(name, ident, line)
                    ch.labels.append((ident, line, letter, name, ident))
                if name == "vertiefung" and fundament_seen:
                    fail("C3", w, f"vertiefung '{label}' after the first fundament block")
                if name == "fundament":
                    fundament_seen = True
                ch.blocks.append((name, ident, line, keys))
                ch.sequence.append(("depth", name, ident))
                frame["depth"], frame["block"] = letter, ident
                for k in ("titel", "wozu", "voraussetzung", "zurueck"):
                    if keys.get(k):
                        scan(ch, keys[k], line, letter, ident, False)
            elif name in FIG_ENVS:
                ident, pos2 = read_group(pos, f"\\begin{{{name}}}", line)
                d_now, _ = cur_depth()
                if ident is not None:
                    pos = pos2
                    check_id(FIG_ENVS[name], ident, line)
                    ch.labels.append((ident, line, d_now, name, cur_depth()[1]))
                    ch.figures.append((name, ident, line, d_now))
                    ch.sequence.append(("begin", name, ident))
                    frame["id"] = ident
                frame["captions"] = 0
            elif name in NUMBERED:
                p = skip_ws(text, pos)
                if p < len(text) and text[p] == "[":
                    title, p2 = read_balanced(text, p, "[", "]")
                    if title is not None:
                        scan(ch, title, line, *cur_depth(), False)
                        pos = p2
                expect_label = (NUMBERED[name], line, f"environment '{name}'")
                frame["unit"] = NUMBERED[name]
                frame["claims"] = 0
            elif name in CONTRACT["unnumbered_units"] or name in CONTRACT["boxes"]:
                p = skip_ws(text, pos)
                if p < len(text) and text[p] == "[":
                    title, p2 = read_balanced(text, p, "[", "]")
                    if title is not None:
                        scan(ch, title, line, *cur_depth(), False)
                        pos = p2
                ch.sequence.append(("begin", name, ""))
            elif name == "tabular":
                if "tpctable" not in names:
                    fail("L2", w, "tabular outside tpctable")
                _, pos = read_group(pos, "\\begin{tabular}", line)
                ch.sequence.append(("begin", name, ""))
            elif name in DISPLAY or name in CONTRACT["lists"]:
                if name in CONTRACT["lists"]:
                    ch.sequence.append(("begin", name, ""))
            stack.append(frame)
            continue

        if end is not None:
            name = end.strip()
            # close open groups/dollars up to the environment
            idx = None
            for k in range(len(stack) - 1, -1, -1):
                if stack[k]["kind"] == "env":
                    idx = k
                    break
            if idx is None or stack[idx]["name"] != name:
                open_name = stack[idx]["name"] if idx is not None else "nothing"
                fail("L2", w, f"\\end{{{name}}} closes '{open_name}'")
                if idx is not None and name in [f["name"] for f in stack if f["kind"] == "env"]:
                    while stack and not (stack[-1]["kind"] == "env" and stack[-1]["name"] == name):
                        stack.pop()
                    idx = len(stack) - 1
                else:
                    continue
            if idx != len(stack) - 1:
                fail("L2", w, f"unclosed group or $ inside environment '{name}'")
            frame = stack[idx]
            del stack[idx:]
            if name in DISPLAY:
                body = text[frame["start"]:m.start()]
                check_display(ch, name, body, frame["line"])
            if name in THEOREM_LIKE and frame.get("claims", 0) != 1:
                fail("CL", ch.where(frame["line"]),
                     f"{name} carries {frame.get('claims', 0)} \\claim(s) on its label: every "
                     "theorem-like unit carries exactly one (a statement without evidence "
                     "does not go into content)")
            if name in FIG_ENVS and frame.get("captions", 0) != 1:
                fail("L2", ch.where(frame["line"]),
                     f"{name} '{frame.get('id', '?')}' needs exactly one \\caption")
            continue

        # ── macros ────────────────────────────────────────────
        name = macro
        math = in_math()
        if name in FORBIDDEN or (name.startswith("if") and name not in ("iff",)):
            fail("L1", w, f"forbidden construct '\\{name}'")
            continue
        if math and name != "num":
            if name in CONTRACT["math_text_switch"]:
                pending_text = True
            elif name == "label":
                ident, pos = read_group(pos, "\\label", line)
                if ident is None:
                    continue
                last_label_end = pos
                labelled_unit = None
                d_now, b_now = cur_depth()
                if display_frame() is None:
                    fail("ID", w, f"\\label{{{ident}}} in inline mathematics")
                else:
                    check_id("eq", ident, line)
                    ch.labels.append((ident, line, d_now, "equation", b_now))
            elif name == "claim":
                # parsed with its display environment (check_display)
                if display_frame() is None:
                    fail("CL", w, "\\claim in inline mathematics")
            elif name in ("ref", "eqref", "pageref", "zoomref", "tpcdef", "defref", "srcref",
                          "chapter", "section", "subsection", "caption", "demo", "item"):
                fail("L2", w, f"'\\{name}' inside mathematics")
            continue

        if name not in TEXT_MACROS:
            fail("L2", w, f"macro '\\{name}' is not in the contract (text mode)")
            continue

        d_now, b_now = cur_depth()
        if name in ("chapter", "section", "subsection"):
            if stack:
                fail("L2", w, f"\\{name} inside an environment or group")
            if d_now != "K":
                fail("L2", w, f"\\{name} inside a depth block")
            title, pos = read_group(pos, f"\\{name}", line)
            if title is not None:
                if name == "chapter":
                    ch.titles["chapter"] = " ".join(title.split())
                scan(ch, title, line, d_now, b_now, False)
            expect_label = (name, line, f"\\{name}")
        elif name == "label":
            ident, pos = read_group(pos, "\\label", line)
            if ident is None:
                continue
            last_label_end = pos
            if expect_label:
                kind = expect_label[0]
                check_id(kind, ident, line)
                ch.labels.append((ident, line, d_now, kind, b_now))
                tag = "begin" if kind in NUMBERED.values() else "sectioning"
                env = next((e for e, k in NUMBERED.items() if k == kind), kind)
                ch.sequence.append((tag, env, ident))
                expect_label = None
                # the unit this label names: a \claim directly after it is the unit's
                labelled_unit = (stack[-1] if tag == "begin" and stack
                                 and stack[-1]["kind"] == "env" else None)
            else:
                labelled_unit = None
                fail("ID", w, f"\\label{{{ident}}} is not attached to a chapter, section, "
                     "numbered unit or equation")
        elif name in ("ref", "eqref", "pageref"):
            ident, pos = read_group(pos, f"\\{name}", line)
            if ident is not None:
                ch.refs.append((name, ident, line, d_now))
        elif name == "zoomref":
            ident, pos = read_group(pos, "\\zoomref", line)
            if ident is not None:
                ch.zoomrefs.append((ident, line, d_now, b_now))
                ch.sequence.append(("zoomref", "", ident))
        elif name in ("tpcdef", "defref"):
            ident, pos = read_group(pos, f"\\{name}", line)
            if ident is not None:
                check_id("definition", ident, line)
                ch.defs.append((name, ident, line, d_now))
                if name == "tpcdef":
                    if any(not (f["kind"] == "env" and f["name"] in DEPTH_ENVS) for f in stack):
                        fail("L2", w, "\\tpcdef inside an environment or group")
                    ch.labels.append((ident, line, d_now, "definition", b_now))
                    ch.sequence.append(("tpcdef", "", ident))
        elif name == "num":
            p = skip_ws(text, pos)
            nid = ""
            if p < len(text) and text[p] == "[":
                nid, p = read_balanced(text, p, "[", "]")
            value, p = read_group(p, "\\num", line)
            unit = None
            if value is not None:
                unit, p = read_group(p, "\\num", line)
            if value is not None and unit is not None:
                pos = p
                nid = (nid or "").strip()
                mm = G["typed"].match(nid) if nid else None
                if nid and (not mm or mm.group(1) != "cl"):
                    fail("NU", w, f"\\num[{nid}]: malformed claim id")
                if not value.strip():
                    fail("NU", w, "\\num: empty value")
                ch.sequence.append(("num", "", nid))
                scan(ch, value, line, d_now, b_now, False, True)
                scan(ch, unit, line, d_now, b_now, False, True)
        elif name == "srcref":
            key, pos = read_group(pos, "\\srcref", line)
            locus = None
            if key is not None:
                locus, pos = read_group(pos, "\\srcref", line)
            if key is not None and locus is not None:
                key = key.strip()
                if not SOURCE_KEY.match(key) or not (SOURCES_DIR / key / "source.json").is_file():
                    fail("SR", w, f"\\srcref{{{key}}}: not a registered source "
                         f"(no sources/{key}/source.json)")
                if not locus.strip():
                    fail("SR", w, f"\\srcref{{{key}}}: empty locus")
                ch.srcrefs.append((key, locus, line))
                ch.sequence.append(("srcref", "", key))
        elif name == "claim":
            p = skip_ws(text, pos)
            pres = ""
            if p < len(text) and text[p] == "[":
                pres, p = read_balanced(text, p, "[", "]")
            ident, p = read_group(p, "\\claim", line)
            status, p = read_group(p, "\\claim", line)
            attached = not (text[last_label_end:m.start()].strip() or last_label_end < 0)
            if not attached:
                fail("CL", w, f"\\claim{{{ident}}} is not attached: it must follow a \\label directly")
            unit = labelled_unit if attached else None
            if unit is not None and unit["name"] in THEOREM_LIKE:
                unit["claims"] = unit.get("claims", 0) + 1
            elif pres:
                fail("CL", w, f"claim {ident}: a presentation ('{pres}') is admitted only on the "
                     "claim of a theorem-like unit")
            pos = p
            record_claim(ch, ident, status, pres, line)
        elif name == "demo":
            ident, pos = read_group(pos, "\\demo", line)
            fig = next((f for f in reversed(stack)
                        if f["kind"] == "env" and f["name"] == "tpcfigure"), None)
            if fig is None:
                fail("L2", w, f"\\demo{{{ident}}} outside tpcfigure")
            elif ident is not None:
                check_id("demo", ident, line)
                if fig.get("demo"):
                    fail("L2", w, f"second \\demo in figure '{fig.get('id')}'")
                fig["demo"] = ident
                ch.demos.append((ident, fig.get("id"), line))
                ch.sequence.append(("demo", "", ident))
        elif name == "caption":
            fig = next((f for f in reversed(stack)
                        if f["kind"] == "env" and f["name"] in FIG_ENVS), None)
            if fig is None:
                fail("L2", w, "\\caption outside tpcfigure / tpctable")
            else:
                fig["captions"] = fig.get("captions", 0) + 1
        elif name == "item":
            if not any(n in CONTRACT["lists"] for n in env_names()):
                fail("L2", w, "\\item outside a list")
        elif name in ("toprule", "midrule", "bottomrule"):
            if "tabular" not in env_names():
                fail("L2", w, f"\\{name} outside tabular")

    if expect_label:
        fail("ID", ch.where(expect_label[1]), f"{expect_label[2]} has no \\label directly after it")
    for f in stack:
        if f["kind"] == "env":
            fail("L2", ch.where(f["line"]), f"environment '{f['name']}' is never closed")
        elif f["kind"] == "dollar":
            fail("L2", ch.where(f["line"]), "unclosed $")
        elif top:
            fail("L2", ch.where(f["line"]), "unclosed {")


def record_claim(ch, ident, status, pres, line):
    w = ch.where(line)
    if ident is None or status is None:
        return
    m = G["typed"].match(ident)
    if not m or m.group(1) != "cl":
        fail("CL", w, f"malformed claim id '{ident}'")
    elif not ident.startswith(ch.chap + "."):
        fail("CL", w, f"claim id '{ident}' does not carry the chapter prefix '{ch.chap}'")
    if status not in STATUSES:
        fail("CL", w, f"claim {ident}: '{status}' is not an evidence status "
             f"({', '.join(sorted(STATUSES))})")
    if pres and pres not in PRESENTATIONS:
        fail("CL", w, f"claim {ident}: '{pres}' is not a presentation "
             f"({', '.join(sorted(PRESENTATIONS))})")
    ch.claims.append((ident, status, pres or "", line))
    ch.sequence.append(("claim", status + "/" + (pres or ""), ident))


CLAIM_IN_MATH = re.compile(r"\\claim\s*(?:\[([^\]]*)\])?\s*\{([^}]*)\}\s*\{([^}]*)\}")
LABEL_THEN_CLAIM = re.compile(r"\\label\s*\{[^}]*\}\s*\\claim")


def split_rows(body: str):
    """Split a display body at top-level \\\\ (not inside groups or inner environments)."""
    rows, cur, depth, i = [], "", 0, 0
    while i < len(body):
        if body.startswith("\\begin", i):
            depth += 1
        elif body.startswith("\\end", i):
            depth -= 1
        c = body[i]
        if c == "\\" and i + 1 < len(body):
            if body[i + 1] == "\\" and depth == 0:
                rows.append(cur)
                cur = ""
                i += 2
                continue
            cur += body[i:i + 2]
            i += 2
            continue
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
        cur += c
        i += 1
    rows.append(cur)
    return rows


def normalize_display(body):
    """Ignore math spacing while preserving the bytes within text groups."""
    parts, pos = [], 0
    for m in re.finditer(r"\\(?:text|textrm)\s*\{", body):
        if m.start() < pos:
            continue
        parts.append(re.sub(r"\s+", "", body[pos:m.start()]))
        value, end = read_balanced(body, m.end() - 1, "{", "}")
        parts.append(body[m.start():end])
        pos = end
    parts.append(re.sub(r"\s+", "", body[pos:]))
    return "".join(parts)


def check_display(ch, env, body, line):
    """ID and claim rules for one display environment; record it for M1."""
    w = ch.where(line)
    starred = env.endswith("*")
    rows = split_rows(body) if env.startswith("align") else [body]
    for k, row in enumerate(rows, 1):
        n_label = len(re.findall(r"\\label\s*\{", row))
        has_notag = "\\notag" in row
        if starred:
            if n_label:
                fail("ID", w, f"\\label in unnumbered environment '{env}'")
        elif n_label == 0 and not has_notag:
            if row.strip() or len(rows) == 1:
                what = f"row {k} of '{env}'" if len(rows) > 1 else f"'{env}'"
                fail("ID", w, f"{what} is numbered but has no \\label (or \\notag)")
        elif n_label > 1:
            fail("ID", w, f"more than one \\label in one row of '{env}'")
        elif n_label and has_notag:
            fail("ID", w, f"\\label and \\notag in the same row of '{env}'")
    for m in CLAIM_IN_MATH.finditer(body):
        cl_line = line + body.count("\n", 0, m.start())
        before = body[:m.start()]
        if not re.search(r"\\label\s*\{[^}]*\}\s*$", before):
            fail("CL", ch.where(cl_line),
                 f"\\claim{{{m.group(2)}}} is not attached: it must follow a \\label directly")
        if m.group(1):
            fail("CL", ch.where(cl_line), f"claim {m.group(2)}: a presentation ('{m.group(1)}') "
                 "is admitted only on the claim of a theorem-like unit")
        record_claim(ch, m.group(2), m.group(3), m.group(1) or "", cl_line)
    ch.equations.append((env, normalize_display(body), line))
    ch.sequence.append(("display", env, ""))


def load_chapter_file(path: pathlib.Path, chap_id: str, lang: str, rel: str) -> Chapter:
    ch = Chapter(rel, chap_id, lang)
    scan(ch, strip_comments(path.read_text(encoding="utf-8")), 1, "K", None, True)
    return ch


# ══════════════════════════════════════════════════════════════
#  Lint over one chapter directory
# ══════════════════════════════════════════════════════════════
def duplicates(items):
    seen, dup = set(), []
    for x in items:
        if x in seen and x not in dup:
            dup.append(x)
        seen.add(x)
    return dup


def lint_chapter(cdir: pathlib.Path, content: pathlib.Path, registry):
    rel = lambda p: str(p.relative_to(content.parent) if content.parent in p.parents else p)
    m = re.match(r"^(c\d\d)-([a-z0-9]+(?:-[a-z0-9]+)*)$", cdir.name)
    if not m:
        fail("ID", rel(cdir), "chapter directory is not cNN-slug")
        return None
    chap = m.group(1)
    chapters = {}
    for lang in ("de", "en"):
        f = cdir / f"{lang}.tex"
        if not f.is_file():
            fail("K6", rel(cdir), f"{lang}.tex is missing")
            continue
        chapters[lang] = load_chapter_file(f, chap, lang, rel(f))

    for lang, ch in chapters.items():
        # the file starts with the chapter and its ID
        first = ch.sequence[0] if ch.sequence else None
        if first != ("sectioning", "chapter", chap):
            fail("ID", ch.path, f"the file must start with \\chapter{{...}}\\label{{{chap}}}")
        if sum(1 for s in ch.sequence if s[:2] == ("sectioning", "chapter")) > 1:
            fail("ID", ch.path, "more than one \\chapter")
        # uniqueness
        for ident in duplicates([l[0] for l in ch.labels]):
            lines = [str(l[1]) for l in ch.labels if l[0] == ident]
            fail("ID", ch.path, f"duplicate id '{ident}' (lines {', '.join(lines)})")
        for ident in duplicates([c[0] for c in ch.claims]):
            fail("ID", ch.path, f"duplicate claim id '{ident}'")
        for ident in duplicates([d[0] for d in ch.demos]):
            fail("ID", ch.path, f"duplicate demo id '{ident}'")

        label_depth = {l[0]: l[2] for l in ch.labels}
        label_kind = {l[0]: l[3] for l in ch.labels}
        block_ids = {b[1]: b[0] for b in ch.blocks if b[1]}

        # K2 static
        for macro, ident, line, d in ch.refs:
            if d == "K" and label_depth.get(ident, "K") != "K":
                fail("K2", ch.where(line),
                     f"Kern text uses \\{macro}{{{ident}}} into a "
                     f"{DEPTH_NAME[label_depth[ident]]} block (use \\zoomref to the block)")
            if ident.split(".")[0] == chap and ident not in label_depth:
                fail("ID", ch.where(line), f"\\{macro}{{{ident}}}: no such id in this chapter")
        # C4
        for ident, line, d, b in ch.zoomrefs:
            if ident not in block_ids:
                fail("C4", ch.where(line),
                     f"signpost \\zoomref{{{ident}}} does not resolve to a depth block of this chapter")
            elif d == "F":
                fail("C4", ch.where(line), "signpost inside a fundament block")
            elif d == "V" and block_ids[ident] != "fundament":
                fail("C4", ch.where(line),
                     f"signpost from a vertiefung block must point to a fundament block, not '{ident}'")
        kern_targets = {z[0] for z in ch.zoomrefs if z[2] == "K"}
        reachable = set(kern_targets)
        for ident, line, d, b in ch.zoomrefs:
            if d == "V" and b in kern_targets:
                reachable.add(ident)
        # a Vertiefung is inline, so it is reached by reading on; its onward
        # pointers count when the block itself sits in Kern text
        for ident, line, d, b in ch.zoomrefs:
            if d == "V":
                reachable.add(ident)
        for env, ident, line, keys in ch.blocks:
            if env == "fundament" and ident and ident not in reachable:
                fail("C4", ch.where(line),
                     f"fundament block '{ident}' is not reachable from any signpost")
            n = sum(1 for z in ch.zoomrefs if z[3] == ident)
            if env == "vertiefung" and n > 1:
                fail("C4", ch.where(line),
                     f"vertiefung block '{ident}' has {n} onward signposts (at most one)")
        # K1 / K5
        for macro, ident, line, d in ch.defs:
            if registry is None:
                continue
            if ident not in registry:
                fail("K1", ch.where(line), f"\\{macro}{{{ident}}}: not in the definitions registry")
                continue
            rdepth = registry[ident]
            if macro == "tpcdef" and rdepth != DEPTH_NAME[d]:
                fail("K1", ch.where(line),
                     f"definition {ident} has depth {rdepth} but is transcluded in {DEPTH_NAME[d]} text")
            elif macro == "defref" and d == "K" and rdepth != "kern":
                fail("K1", ch.where(line),
                     f"Kern text cites definition {ident} of depth {rdepth}")
        for ident in duplicates([d[1] for d in ch.defs if d[0] == "tpcdef"]):
            fail("K1", ch.path, f"definition {ident} is transcluded more than once")

    # ── DE / EN parity ────────────────────────────────────────
    if len(chapters) == 2:
        de, en = chapters["de"], chapters["en"]
        bd = [(b[0], b[1]) for b in de.blocks]
        be = [(b[0], b[1]) for b in en.blocks]
        if bd != be:
            k = next((i for i, (x, y) in enumerate(zip(bd, be)) if x != y), min(len(bd), len(be)))
            x = bd[k] if k < len(bd) else "(end)"
            y = be[k] if k < len(be) else "(end)"
            fail("K6", rel(cdir), f"depth-block sequence differs between DE and EN "
                 f"at position {k + 1}: de={x} en={y}")
        if de.sequence != en.sequence:
            k = next((i for i, (x, y) in enumerate(zip(de.sequence, en.sequence)) if x != y),
                     min(len(de.sequence), len(en.sequence)))
            x = de.sequence[k] if k < len(de.sequence) else "(end)"
            y = en.sequence[k] if k < len(en.sequence) else "(end)"
            fail("PAR", rel(cdir), f"structure differs between DE and EN at construct {k + 1}: "
                 f"de={x} en={y}")
        else:
            for (env, b1, l1), (_, b2, l2) in zip(de.equations, en.equations):
                if b1 != b2:
                    fail("M1", f"{de.path}:{l1}",
                         f"display equation differs from EN ({en.path}:{l2}); "
                         "write words as \\text{\\tpcifenglish{EN}{DE}}")

    # ── chapter.json ──────────────────────────────────────────
    cj = cdir / "chapter.json"
    meta = None
    if not cj.is_file():
        fail("JS", rel(cdir), "chapter.json is missing")
    else:
        try:
            meta = json.loads(cj.read_text(encoding="utf-8"))
        except ValueError as exc:
            fail("JS", rel(cj), f"not valid JSON ({exc})")
    if meta is not None:
        w = rel(cj)
        if meta.get("id") != chap:
            fail("JS", w, f"id is '{meta.get('id')}', directory says '{chap}'")
        if meta.get("slug") != m.group(2):
            fail("JS", w, f"slug is '{meta.get('slug')}', directory says '{m.group(2)}'")
        for field in ("title", "effective_theory"):
            v = meta.get(field)
            if not (isinstance(v, dict) and all(isinstance(v.get(l), str) and v[l].strip()
                                                for l in ("de", "en"))):
                fail("JS", w, f"'{field}' needs non-empty 'de' and 'en'")
        if meta.get("zoom_scale") not in CONTRACT["zoom_scales"]:
            fail("JS", w, f"zoom_scale '{meta.get('zoom_scale')}' is not one of "
                 f"{CONTRACT['zoom_scales']}")
        prereq = meta.get("prerequisites")
        if not isinstance(prereq, list) or any(not G["chapter"].match(str(p)) for p in prereq):
            fail("JS", w, "'prerequisites' must be a list of chapter ids")
            prereq = []
        if (cdir / "fixture").exists() and not (meta.get("test_fixture") and chap in TEST_CHAPTERS):
            fail("JS", w, "a fixture/ directory is allowed in test chapters only")
        assets = meta.get("assets")
        if not isinstance(assets, list):
            fail("JS", w, "'assets' must be a list")
            assets = []
        by_id = {}
        for a in assets:
            aid = a.get("id", "")
            if aid in by_id:
                fail("JS", w, f"duplicate asset id '{aid}'")
            by_id[aid] = a
            if a.get("kind") not in CONTRACT["asset_kinds"]:
                fail("JS", w, f"asset '{aid}': kind '{a.get('kind')}' is not one of "
                     f"{CONTRACT['asset_kinds']}")
            if not G["typed"].match(aid) or not aid.startswith(chap + "."):
                fail("JS", w, f"asset id '{aid}' is malformed or lacks the chapter prefix")
        for lang, ch in chapters.items():
            title = meta.get("title", {}).get(lang) if isinstance(meta.get("title"), dict) else None
            if title is not None and ch.titles.get("chapter") != title:
                fail("JS", w, f"title.{lang} '{title}' differs from \\chapter "
                     f"'{ch.titles.get('chapter')}' in {lang}.tex")
            used = {f[1]: f[0] for f in ch.figures}
            for ident, env in used.items():
                a = by_id.get(ident)
                want = "figure" if env == "tpcfigure" else "table"
                if a is None or a.get("kind") != want:
                    fail("JS", w, f"{want} '{ident}' ({lang}.tex) is not listed in assets")
                elif want == "figure":
                    slug = ident.split(".", 2)[2]
                    if a.get("file") != f"figures/{slug}.tex":
                        fail("JS", w, f"figure '{ident}': file must be 'figures/{slug}.tex'")
                    if not (cdir / "figures" / f"{slug}.tex").is_file():
                        fail("JS", w, f"figure '{ident}': figures/{slug}.tex does not exist")
            for ident, fig, line in ch.demos:
                a = by_id.get(ident)
                if a is None or a.get("kind") not in ("demo", "game"):
                    fail("JS", w, f"demo '{ident}' ({lang}.tex) is not listed in assets as demo or game")
                elif a.get("still") != fig:
                    fail("JS", w, f"demo '{ident}': still is '{a.get('still')}' but it is "
                         f"attached to figure '{fig}'")
            in_tex = set(used) | {d[0] for d in ch.demos}
            for aid, a in by_id.items():
                if a.get("kind") in ("figure", "table", "demo", "game") and aid not in in_tex:
                    fail("JS", w, f"asset '{aid}' is not used in {lang}.tex")
            for macro, ident, line, d in ch.refs:
                pre = ident.split(".")[0]
                if G["chapter"].match(pre) and pre != chap and pre not in prereq:
                    fail("JS", ch.where(line), f"\\{macro}{{{ident}}} leaves the chapter but "
                         f"'{pre}' is not in chapter.json prerequisites")

    # ── K5: figure files carry no references ──────────────────
    figdir = cdir / "figures"
    if figdir.is_dir():
        for f in sorted(figdir.glob("*.tex")):
            src = strip_comments(f.read_text(encoding="utf-8"))
            for mm in re.finditer(r"\\(ref|eqref|pageref|zoomref|defref|tpcdef|label|claim)\b", src):
                fail("K5", f"{rel(f)}:{src.count(chr(10), 0, mm.start()) + 1}",
                     f"figure file uses \\{mm.group(1)} (figures carry no references; "
                     "say it in the caption)")
    return chapters


def load_registry(path: pathlib.Path):
    """id -> depth from a definitions JSON (list, {'definitions': [...]}, or id-keyed dict)."""
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, dict) and isinstance(data.get("definitions"), list):
        data = data["definitions"]
    if isinstance(data, dict):
        data = [dict(v, id=k) for k, v in data.items() if isinstance(v, dict)]
    out = {}
    for row in data:
        if isinstance(row, dict) and "id" in row:
            out[row["id"]] = str(row.get("depth", "")).lower()
    return out


# ══════════════════════════════════════════════════════════════
#  Build half
# ══════════════════════════════════════════════════════════════
NEWLABEL = re.compile(r"\\newlabel\{([^}]*)\}\{\{((?:[^{}]|\{[^{}]*\})*)\}")
UNDEF = re.compile(r"LaTeX Warning: (Reference|Citation) `([^']*)' on page \d+ undefined")
ERRLINE = re.compile(r"^(?:!.*|\S+?:\d+: .*)$", re.M)


def read_build(build: pathlib.Path, lang, edition, chapter_dirs, content, flags=None):
    """Return dict(log, labels, pages) or None after reporting B0 findings."""
    job = f"tpc-{lang}-{edition}"
    work = build / job
    files = {k: work / f"{job}.{k}" for k in ("log", "aux")}
    rec_path = work / "build.json"
    ok = True
    for name, p in list(files.items()) + [("build.json", rec_path)]:
        if not p.is_file():
            fail("B0", job, f"{p.name} is missing under {work} (run build_course.sh)")
            ok = False
        elif p.stat().st_size == 0:
            fail("B0", job, f"{p.name} is empty")
            ok = False
    if not ok:
        return None
    try:
        rec = json.loads(rec_path.read_text())
    except ValueError:
        fail("B0", job, "build.json is not valid JSON")
        return None
    if not isinstance(rec, dict):
        fail("B0", job, "build.json must be an object")
        return None
    for field, expected in (("job", job), ("lang", lang), ("edition", edition)):
        if rec.get(field) != expected:
            fail("B0", job, f"build identity: {field} is {rec.get(field)!r}, expected {expected!r}")
            ok = False
    expected_flags = flags or {"pkg": "1", "ground": "light", "math": "stix", "fonts": "open"}
    if rec.get("flags") != expected_flags:
        fail("B0", job, f"build flags {rec.get('flags')!r} differ from requested {expected_flags!r}")
        ok = False
    if rec.get("aux_sha256") != build_record.sha256(files["aux"]):
        fail("B0", job, "the aux is not the aux of the recorded build (missing hash, stale or replaced)")
        ok = False
    log = files["log"].read_text(encoding="utf-8", errors="replace")
    if rec.get("log_sha256") != build_record.sha256(files["log"]):
        fail("B0", job, "the log is not the log of the recorded build (stale or replaced)")
        ok = False
    master = f"course-{lang}-{edition}.tex"
    if not re.search(r"^\*\*[^\n]*\\input\{" + re.escape(master) + r"\}", log, re.M):
        fail("B0", job, f"compiler input identity: log does not invoke {master}")
        ok = False
    for macro, value in [("tpcchapterlist", ",".join(chapter_dirs)),
                         ("tpccontentroot", str(content))] + [("tpc" + k, v) for k, v in expected_flags.items()]:
        if not re.search(r"^\*\*[^\n]*\\def\\" + macro + r"\{" + re.escape(value) + r"\}", log, re.M):
            fail("B0", job, f"compiler input identity: log does not set {macro} to {value!r}")
            ok = False
    if not re.search(r"Output written on (?:\S*/)?" + re.escape(job) + r"\.pdf\b", log):
        fail("B0", job, "the log records no output for the requested job")
        ok = False
    if rec.get("xelatex_exit_status") != 0:
        fail("B0", job, f"the compiler exited with status {rec.get('xelatex_exit_status')}")
        ok = False
    if rec.get("chapters") != chapter_dirs:
        fail("B0", job, f"the build covers chapters {rec.get('chapters')}, "
             f"the check was asked for {sorted(chapter_dirs)}")
        ok = False
    now = build_record.hashes(ROOT, content, chapter_dirs, expected_flags)
    then = rec.get("sources", {})
    if not isinstance(then, dict):
        fail("B0", job, "sources hash inventory must be an object")
        then = {}
    inventory = f"design/build/pkg{expected_flags['pkg']}-{expected_flags['ground']}/tokens.json"
    if inventory not in now or inventory not in then:
        fail("B0", job, f"required token inventory missing from hash list: {inventory}")
        ok = False
    changed = sorted(k for k in set(now) | set(then) if now.get(k) != then.get(k))
    if changed:
        fail("B0", job, f"stale build: {len(changed)} source file(s) changed since it ran "
             f"(first: {changed[0]})")
        ok = False
    for mm in ERRLINE.finditer(log):
        fail("C1", job, f"TeX error: {mm.group(0)[:160]}")
    for mm in UNDEF.finditer(log):
        pass  # reported by the caller, which knows whether it is K2
    for mm in re.finditer(r"LaTeX Warning: Label `([^']*)' multiply defined", log):
        fail("C1", job, f"label '{mm.group(1)}' multiply defined")
    labels = dict(NEWLABEL.findall(files["aux"].read_text(encoding="utf-8", errors="replace")))
    pages = re.findall(r"Output written on .*\((\d+) pages?", log)
    return {"job": job, "log": log, "labels": labels, "ok": ok,
            "undefined": sorted({mm.group(2) for mm in UNDEF.finditer(log)}),
            "pages": int(pages[-1]) if pages else None}


def check_builds(build, langs, chapter_dirs, content, parsed, flags=None):
    kern_by_lang = {}
    for lang in langs:
        full = read_build(build, lang, "full", chapter_dirs, content, flags)
        kern = read_build(build, lang, "kern", chapter_dirs, content, flags)
        if full is None or kern is None:
            continue
        kern_by_lang[lang] = kern
        for ident in full["undefined"]:
            fail("C1", full["job"], f"undefined reference '{ident}'")
        for ident in kern["undefined"]:
            if ident in full["labels"]:
                fail("K2", kern["job"], f"reference '{ident}' is undefined in the Kern build "
                     "but defined in the full build: Kern text refers into a depth block")
            else:
                fail("C1", kern["job"], f"undefined reference '{ident}'")
        # census: what the sources promise against what the .aux holds
        exp_kern, exp_full = set(), set()
        for cdir in chapter_dirs:
            ch = (parsed.get(cdir) or {}).get(lang)
            if ch is None:
                continue
            for ident, line, d, kind, b in ch.labels:
                exp_full.add(ident)
                if d == "K":
                    exp_kern.add(ident)
            for ident, line, d, b in ch.zoomrefs:
                exp_full.add("zoomfrom:" + ident)
        if parsed:
            for name, exp, got in (("Kern", exp_kern, set(kern["labels"])),
                                   ("full", exp_full, set(full["labels"]))):
                job = kern["job"] if name == "Kern" else full["job"]
                for ident in sorted(exp - got):
                    fail("CEN", job, f"label '{ident}' is in the sources but not in the {name} .aux")
                for ident in sorted(got - exp):
                    fail("CEN", job, f"label '{ident}' is in the {name} .aux but not expected "
                         "from the sources")
        # K4
        n = 0
        for ident, number in sorted(kern["labels"].items()):
            n += 1
            if ident not in full["labels"]:
                fail("K4", f"{lang}", f"label '{ident}' exists in the Kern edition only")
            elif full["labels"][ident] != number:
                fail("K4", f"{lang}", f"label '{ident}' is numbered {number} in the Kern edition "
                     f"and {full['labels'][ident]} in the full edition")
        # C4 on the build
        for cdir in chapter_dirs:
            ch = (parsed.get(cdir) or {}).get(lang)
            for env, ident, line, keys in (ch.blocks if ch else []):
                if env == "fundament" and ident and "zoomfrom:" + ident not in full["labels"]:
                    fail("C4", full["job"], f"fundament block '{ident}' has no back-link anchor "
                         "in the full .aux (no signpost points to it)")
        notes.append(f"C6 {lang}: full {full['pages']} pages, Kern {kern['pages']} pages; "
                     f"{n} Kern labels compared (K4)")

    if "de" in kern_by_lang and "en" in kern_by_lang:
        de, en = kern_by_lang["de"]["labels"], kern_by_lang["en"]["labels"]
        for ident in sorted(set(de) | set(en)):
            if de.get(ident) != en.get(ident):
                fail("K4", "de/en", f"Kern label '{ident}' is numbered {de.get(ident)!r} in DE and {en.get(ident)!r} in EN")


# ══════════════════════════════════════════════════════════════
def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--chapters", help="comma list of chapter ids (default: all but test chapters)")
    ap.add_argument("--with-test-chapter", action="store_true")
    ap.add_argument("--content", default=str(ROOT / "content"))
    ap.add_argument("--build", default=str(ROOT / "build" / "course"))
    ap.add_argument("--langs", default="de,en")
    ap.add_argument("--registry", default=str(ROOT / "registry" / "definitions.json"))
    ap.add_argument("--sources", default=str(ROOT / "sources"),
                    help="source registry: DIR/<key>/source.json (for \\srcref)")
    ap.add_argument("--run-build", action="store_true",
                    help="run build_course.sh for the chapters first")
    ap.add_argument("--lint-only", action="store_true", help="sources only, no build evidence")
    ap.add_argument("--no-lint", action="store_true",
                    help="build evidence only (the census still parses the sources)")
    for name, choices, default in (("pkg", ["1", "2", "3", "4", "5"], "1"),
                                   ("ground", ["light", "dark"], "light"),
                                   ("math", ["stix", "mtpro2"], "stix"),
                                   ("fonts", ["open", "local"], "open")):
        ap.add_argument("--" + name, choices=choices, default=default)
    args = ap.parse_args()
    flags = {k: getattr(args, k) for k in ("pkg", "ground", "math", "fonts")}

    global SOURCES_DIR
    SOURCES_DIR = pathlib.Path(args.sources).resolve()
    content = pathlib.Path(args.content).resolve()
    build = pathlib.Path(args.build).resolve()
    langs = [l for l in args.langs.split(",") if l]
    all_dirs = sorted(d.name for d in content.glob("c[0-9][0-9]-*") if d.is_dir())
    if args.chapters:
        want = args.chapters.split(",")
        dirs = [d for d in all_dirs if d.split("-")[0] in want]
        for w in want:
            if not any(d.split("-")[0] == w for d in dirs):
                print(f"B0 {content}: no chapter '{w}'")
                return 1
    else:
        dirs = [d for d in all_dirs
                if args.with_test_chapter or d.split("-")[0] not in TEST_CHAPTERS]
    if not dirs:
        print(f"check_levels: no chapters to check under {content}")
        return 1

    # definitions registry: the real one, plus test-chapter stand-ins
    registry = None
    reg_path = pathlib.Path(args.registry)
    if reg_path.is_file():
        registry = load_registry(reg_path)
    for d in dirs:
        fx = content / d / "fixture" / "definitions.json"
        if fx.is_file():
            registry = dict(registry or {})
            registry.update(load_registry(fx))
    if registry is None:
        notes.append(f"K1 HOOK: no definitions registry at {reg_path}; "
                     "definition depths were not checked")

    if args.run_build:
        cmd = ["bash", str(HERE / "build_course.sh"), "--content", str(content),
               "--out", str(build), "--chapters", ",".join(d.split("-")[0] for d in dirs),
               "--all-editions"]
        for k, v in flags.items():
            cmd += ["--" + k, v]
        if len(langs) == 1:
            cmd += ["--lang", langs[0]]
        proc = subprocess.run(cmd, capture_output=True, text=True)
        tail = (proc.stdout + proc.stderr).strip().splitlines()[-12:]
        print(f"build_course.sh exited {proc.returncode}")
        if proc.returncode != 0:
            print("  " + "\n  ".join(tail))

    before = len(findings)
    parsed = {}
    for d in dirs:
        parsed[d] = lint_chapter(content / d, content, registry) or {}
    if args.no_lint:
        del findings[before:]

    if not args.lint_only:
        check_builds(build, langs, dirs, content, parsed, flags)

    for f in findings:
        print(f)
    for n in notes:
        print(f"note: {n}")
    scope = "lint only" if args.lint_only else ("build only" if args.no_lint else "lint + build")
    print(f"check_levels: {len(dirs)} chapter(s) [{', '.join(dirs)}], {scope}: "
          f"{len(findings)} finding(s)")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
