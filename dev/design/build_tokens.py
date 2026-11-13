#!/usr/bin/env python3
r"""Compile the design tokens of Theoretische Physik C and measure them.

Source (hand-authored, DTCG format, colours in OKLCH):
    design/tokens/base.tokens.json      shared roles
    design/tokens/pkg{1..5}.tokens.json per-package faces, chrome, measure, overrides

Output, one directory per (package, ground), never edited by hand:
    design/build/pkg<N>-<ground>/tpc-tokens.sty   xcolor names, font and length macros
    design/build/pkg<N>-<ground>/tokens.css       custom properties
    design/build/pkg<N>-<ground>/tokens.glsl      linear-sRGB vec3 constants
    design/build/pkg<N>-<ground>/tokens.json      flat resolved values, with a `video` section

Usage:
    python3 design/build_tokens.py --all                 build all ten combinations
    python3 design/build_tokens.py --pkg 1 --ground dark build one
    python3 design/build_tokens.py --check               measurements + staleness (the gate)
    python3 design/build_tokens.py --measure             measurements only
    python3 design/build_tokens.py --table               measurements as a Markdown table
    options: --tokens-dir DIR  --base FILE  --out-dir DIR  (so fixtures can be pointed at it)

Measurements (thresholds live here, not in the token files, so a token edit cannot relax them).
Each threshold has a status: QUOTED from a standard with its locus, or UNVALIDATED CHOICE
(a number somebody picked; no measurement or study in this repository backs it, and it must
not be cited as a fact about legibility). The same table is printed by --table, and one line
of it on every run.
    text contrast   contrast ratio >= 4.5 for every text and link role on its surface.
                    QUOTED: WCAG 2.2, Success Criterion 1.4.3 Contrast (Minimum), Level AA:
                    "The visual presentation of text and images of text has a contrast ratio
                    of at least 4.5:1", https://www.w3.org/TR/WCAG22/#contrast-minimum (read
                    2026-10-11; the standard is not on disk). The criterion exempts large
                    text; this gate applies 4.5 to every text role (a project choice,
                    stricter than the standard).
    stroke contrast >= 3.0 for essential graphics: state, effect, dynamics, the boundary of a
                    bath region and every ladder rung, on plate and on stage.
                    QUOTED: WCAG 2.2, Success Criterion 1.4.11 Non-text Contrast, Level AA:
                    "a contrast ratio of at least 3:1 against adjacent color(s)" for "Parts of
                    graphics required to understand the content",
                    https://www.w3.org/TR/WCAG22/#non-text-contrast (read 2026-10-11; not on
                    disk). No exemption for thick strokes and 2.99 fails: project choices.
                    Only the bath fill is exempt, because a bath region is always bounded or
                    hatched in bath-edge.
    depth label     type.depth-label has the body size and leading (depth marking is invariant
                    across packages: body size, margin rule, run-in label, no tint, no small
                    type). Not a numeric threshold: an equality with the package's body size.
    greyscale gap   the four data roles pairwise >= 0.15 apart in OKLCH L.
                    UNVALIDATED CHOICE: proposed by the research lanes (PLAN S8) without a
                    validation; nothing shows that 0.15 is the gap at which two greys are
                    told apart in print.
    ladder step     consecutive rungs q1..q6 >= 0.10 apart in L and monotone.
                    UNVALIDATED CHOICE of the tokens author.
    CVD             min pairwise OKLab distance of the data roles >= 0.10 under the Machado,
                    Oliveira and Fernandes (2009) severity-1.0 deutan and protan matrices
                    (the matrices both package lanes and design-research/palette_cvd_check.py
                    used). UNVALIDATED CHOICE of the tokens author; the paper is not on disk
                    and gives no such threshold.
A failing measurement prints package, ground, role pair and value and makes the run exit 1.
A measurement that cannot pass may be waived by name in the package file
($extensions["org.tpc"].waivers); a waiver requires a nonempty reason and is printed as a warning on every run.

Colour math: OKLab/OKLCH after Ottosson (https://bottosson.github.io/posts/oklab/); out-of-gamut
colours are mapped to sRGB by reducing chroma at fixed L and h. No third-party packages.
"""
import argparse
import itertools
import json
import math
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
PKGS = [1, 2, 3, 4, 5]
GROUNDS = ["light", "dark"]
FILES = ["tpc-tokens.sty", "tokens.css", "tokens.glsl", "tokens.json"]

AA_TEXT = 4.5          # quoted: WCAG 2.2 SC 1.4.3 (see the module docstring)
AA_STROKE = 3.0        # quoted: WCAG 2.2 SC 1.4.11
MIN_DATA_DL = 0.15     # unvalidated choice (research lanes, PLAN S8)
MIN_LADDER_DL = 0.10   # unvalidated choice (tokens author)
MIN_CVD_DE = 0.10      # unvalidated choice (tokens author)

# check -> (threshold, status, basis); printed, so that no threshold reads as a fact
THRESHOLDS = [
    ("text-contrast", AA_TEXT, "quoted",
     "WCAG 2.2 SC 1.4.3 Contrast (Minimum), https://www.w3.org/TR/WCAG22/#contrast-minimum "
     "(not on disk); applied to large text too, which is a project choice"),
    ("stroke-contrast", AA_STROKE, "quoted",
     "WCAG 2.2 SC 1.4.11 Non-text Contrast, https://www.w3.org/TR/WCAG22/#non-text-contrast "
     "(not on disk); no exemption for thick strokes, which is a project choice"),
    ("grey-gap", MIN_DATA_DL, "unvalidated choice",
     "OKLCH L gap proposed by the research lanes (PLAN S8) without validation"),
    ("ladder-step", MIN_LADDER_DL, "unvalidated choice", "OKLCH L step chosen by the tokens author"),
    ("cvd-deutan, cvd-protan", MIN_CVD_DE, "unvalidated choice",
     "OKLab distance under simulated deutan/protan vision, chosen by the tokens author"),
]


def threshold_table():
    out = ["| check | threshold | status | basis |", "|---|---|---|---|"]
    out += [f"| {c} | >= {t} | {st} | {why} |" for c, t, st, why in THRESHOLDS]
    return "\n".join(out)


def threshold_line():
    return "thresholds: " + "; ".join(f"{c} >= {t} ({st}; {why})" for c, t, st, why in THRESHOLDS)

def threshold_description(check):
    _, value, status, basis = next(r for r in THRESHOLDS if check in r[0].split(", "))
    return f">= {value} ({status}; {basis})"


DATA = ["state", "effect", "dynamics", "bath"]
LADDER = [f"q{i}" for i in range(1, 7)]
# (role, surface) pairs that carry text: AA 4.5
TEXT_PAIRS = [
    ("ink", "ground"), ("ink", "ground-alt"), ("ink", "highlight"), ("ink-muted", "ground"),
    ("link", "ground"), ("link", "ground-alt"), ("accent", "ground"),
    ("depth-v", "ground"), ("depth-f", "ground"),
    ("plate-ink", "plate"), ("plate-muted", "plate"), ("stage-ink", "stage"),
]


# ----------------------------------------------------------------------------- colour math
def _s2l(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _l2s(c):
    c = min(max(c, 0.0), 1.0)
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


def hex2lin(h):
    h = h.lstrip("#")
    return [_s2l(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)]


def lin2hex(rgb):
    return "#" + "".join(f"{round(_l2s(x) * 255):02X}" for x in rgb)


def lin2oklab(rgb):
    r, g, b = [min(max(x, 0.0), 1.0) for x in rgb]
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l, m, s = [x ** (1 / 3) for x in (l, m, s)]
    return (0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s)


def oklch2lin(L, C, h):
    a, b = C * math.cos(math.radians(h)), C * math.sin(math.radians(h))
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
            -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
            -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s]


def _in_gamut(rgb, eps=1e-6):
    return all(-eps <= x <= 1 + eps for x in rgb)


def fit(L, C, h):
    """Reduce chroma at fixed L, h until the colour is inside sRGB."""
    if _in_gamut(oklch2lin(L, C, h)):
        return L, C, h
    lo, hi = 0.0, C
    for _ in range(40):
        mid = (lo + hi) / 2
        if _in_gamut(oklch2lin(L, mid, h)):
            lo = mid
        else:
            hi = mid
    return L, lo, h


def luminance(hexv):
    r, g, b = hex2lin(hexv)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(h1, h2):
    a, b = sorted([luminance(h1), luminance(h2)], reverse=True)
    return (a + 0.05) / (b + 0.05)


def okl(hexv):
    return lin2oklab(hex2lin(hexv))[0]


CVD = {"deutan": [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413],
                  [-0.011820, 0.042940, 0.968881]],
       "protan": [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216],
                  [-0.003882, -0.048116, 1.051998]]}


def cvd_lab(hexv, kind):
    m = CVD[kind]
    rgb = hex2lin(hexv)
    return lin2oklab([sum(m[i][j] * rgb[j] for j in range(3)) for i in range(3)])


# ----------------------------------------------------------------------------- token loading
class TokenError(Exception):
    pass


def load(tokens_dir, base_file, pkg):
    base = json.loads(pathlib.Path(base_file).read_text(encoding="utf-8"))
    pfile = pathlib.Path(tokens_dir) / f"pkg{pkg}.tokens.json"
    if not pfile.exists():
        raise TokenError(f"missing token file {pfile}")
    p = json.loads(pfile.read_text(encoding="utf-8"))
    doc = {}
    for group in ("color", "font", "type", "measure", "space", "stroke", "video"):
        merged = {k: v for k, v in base.get(group, {}).items() if not k.startswith("$")}
        for k, v in p.get(group, {}).items():
            if k.startswith("$"):
                continue
            if k in merged and group == "color":
                # a package colour replaces value and modes; description and use are inherited
                new = dict(v)
                new.setdefault("$description", merged[k].get("$description", ""))
                use = merged[k].get("$extensions", {}).get("org.tpc.use")
                if use:
                    new.setdefault("$extensions", {})
                    new["$extensions"] = dict(new["$extensions"])
                    new["$extensions"].setdefault("org.tpc.use", use)
                merged[k] = new
            else:
                merged[k] = v
        doc[group] = merged
    meta = dict(p.get("$extensions", {}).get("org.tpc", {}))
    meta.setdefault("pkg", pkg)
    meta.setdefault("title", f"PKG-{pkg}")
    meta.setdefault("production_ready", True)
    meta.setdefault("waivers", [])
    meta["description"] = p.get("$description", "")
    doc["meta"] = meta
    return doc


def resolve_colors(doc, chain):
    """chain: mode names tried in order, e.g. ['print', 'light']. 'light' is $value."""
    colors = doc["color"]
    follow_plate = doc["meta"].get("stage_follows_plate", False)
    out = {}

    def raw(name, seen):
        if name not in colors:
            raise TokenError(f"unknown colour token '{name}'")
        if name in seen:
            raise TokenError(f"alias cycle at '{name}'")
        tok = colors[name]
        modes = tok.get("$extensions", {}).get("org.tpc.modes", {})
        val = tok["$value"]
        for m in chain:
            if m == "light":
                break
            if m == "dark" and follow_plate and name.startswith("stage"):
                continue
            if m in modes:
                val = modes[m]
                break
        if isinstance(val, str):
            mt = re.fullmatch(r"\{color\.([a-z0-9-]+)\}", val)
            if not mt:
                raise TokenError(f"colour '{name}': bad alias {val!r}")
            return raw(mt.group(1), seen | {name})
        if val.get("colorSpace") != "oklch":
            raise TokenError(f"colour '{name}': colours are authored in OKLCH, got {val.get('colorSpace')!r}")
        return tuple(val["components"])

    for name in colors:
        L, C, h = fit(*raw(name, frozenset()))
        lin = [min(max(x, 0.0), 1.0) for x in oklch2lin(L, C, h)]
        out[name] = {"hex": lin2hex(lin), "oklch": [round(L, 4), round(C, 4), round(h, 1)],
                     "linear": [round(x, 5) for x in lin]}
    return out


def chains(ground):
    """Resolved palettes to emit and to measure for one ground: label -> mode chain."""
    if ground == "light":
        return {"light": ["light"], "light/print": ["print", "light"]}
    return {"dark": ["dark", "light"]}


# ----------------------------------------------------------------------------- measurements
def measure(doc, ground):
    """Return (rows, failures, warnings). rows: (palette, check, pair, value, threshold, status)."""
    rows, fails, warns = [], [], []
    pkg = doc["meta"]["pkg"]
    waivers = {}
    for w in doc["meta"].get("waivers", []):
        if not isinstance(w.get("reason"), str) or not w["reason"].strip():
            fails.append(f"FAIL    pkg{pkg} {ground}: waiver '{w.get('id')}' needs a nonempty reason")
        else:
            waivers[w["id"]] = w
    used = set()

    def record(label, check, pair, value, thr, ok):
        wid = f"{check}:{ground}:{pair}"
        status = "ok"
        if not ok:
            hit = next((w for w in waivers.values()
                        if w.get("check") == check and w.get("pair") == pair
                        and w.get("ground", ground) == ground), None)
            if hit:
                used.add(hit["id"])
                status = "waived"
                warns.append(f"WAIVED  pkg{pkg} {label}: {check} {pair} = {value:.3f} (needs {threshold_description(check)}); "
                             f"waiver '{hit['id']}': {hit.get('reason', 'no reason given')}")
            else:
                status = "FAIL"
                fails.append(f"FAIL    pkg{pkg} {label}: {check} {pair} = {value:.3f}, needs {threshold_description(check)}")
        rows.append((label, check, pair, value, thr, status))
        return wid

    for label, chain in chains(ground).items():
        c = {k: v["hex"] for k, v in resolve_colors(doc, chain).items()}
        for role, surf in TEXT_PAIRS:
            record(label, "text-contrast", f"{role}/{surf}", contrast(c[role], c[surf]), AA_TEXT,
                   contrast(c[role], c[surf]) >= AA_TEXT)
        for prefix, surf in (("", "plate"), ("stage-", "stage")):
            data = [prefix + r for r in DATA]
            # essential graphics: every data stroke, every ladder rung and the bath boundary
            for r in data + [prefix + "bath-edge"] + [prefix + q for q in LADDER]:
                # Exemption is checker-owned: metadata cannot exempt essential graphics.
                if r not in ("bath", "stage-bath"):
                    v = contrast(c[r], c[surf])
                    record(label, "stroke-contrast", f"{r}/{surf}", v, AA_STROKE, v >= AA_STROKE)
            for a, b in itertools.combinations(data, 2):
                v = abs(okl(c[a]) - okl(c[b]))
                record(label, "grey-gap", f"{a}/{b}", v, MIN_DATA_DL, v >= MIN_DATA_DL - 1e-9)
            lad = [okl(c[prefix + q]) for q in LADDER]
            steps = [b - a for a, b in zip(lad, lad[1:])]
            sign = 1 if steps[0] > 0 else -1
            for i, s in enumerate(steps):
                record(label, "ladder-step", f"{prefix}q{i + 1}/{prefix}q{i + 2}", sign * s, MIN_LADDER_DL,
                       sign * s >= MIN_LADDER_DL - 1e-9)
            for kind in CVD:
                labs = {r: cvd_lab(c[r], kind) for r in data}
                for a, b in itertools.combinations(data, 2):
                    v = math.dist(labs[a], labs[b])
                    record(label, f"cvd-{kind}", f"{a}/{b}", v, MIN_CVD_DE, v >= MIN_CVD_DE)
    body, dl = _typo(doc, "body"), _typo(doc, "depth-label")
    if (body["size_pt"], body["leading_pt"]) != (dl["size_pt"], dl["leading_pt"]):
        fails.append(f"FAIL    pkg{pkg} {ground}: depth-label {dl['size_pt']}/{dl['leading_pt']} pt is not the "
                     f"body size {body['size_pt']}/{body['leading_pt']} pt")
    for wid, w in waivers.items():
        if w.get("ground", ground) == ground and wid not in used:
            warns.append(f"NOTE    pkg{pkg} {ground}: waiver '{wid}' is not needed any more; remove it")
    return rows, fails, warns


def summary(rows):
    """Worst value per (palette, check): the numbers the report table shows."""
    out = {}
    for label, check, pair, value, thr, status in rows:
        key = (label, check)
        if key not in out or value < out[key][1]:
            out[key] = (pair, value, status)
    return out


# ----------------------------------------------------------------------------- emitters
def _num(x):
    s = f"{x:.4f}".rstrip("0").rstrip(".")
    return s if s else "0"


def _dim(tok):
    v = tok["$value"]
    return v["value"], v["unit"]


def _typo(doc, role):
    v = doc["type"][role]["$value"]
    fam = re.fullmatch(r"\{font\.(\w+)\}", v["fontFamily"]).group(1)
    size = v["fontSize"]["value"]
    return {"family": fam, "size_pt": size, "leading_pt": round(size * v["lineHeight"], 2),
            "weight": v.get("fontWeight", 400), "style": v.get("fontStyle", "normal"),
            "smallcaps": bool(doc["type"][role].get("$extensions", {}).get("org.tpc.smallcaps", False))}


TYPE_ROLES = ["body", "small", "label", "h1", "h2", "h3", "numeral", "mono", "depth-label"]
TYPE_TEX = {"body": "body", "small": "small", "label": "label", "h1": "hi", "h2": "hii", "h3": "hiii",
            "numeral": "numeral", "mono": "mono", "depth-label": "depth"}
SPACE_ROLES = ["xs", "s", "m", "l", "xl", "xxl"]
MEASURE_TEX = [("text", "tpcmeasure"), ("inner", "tpcmargininner"), ("gap", "tpcmargingap"),
               ("margin", "tpcmarginwidth"), ("top", "tpcmargintop"), ("bottom", "tpcmarginbottom"),
               ("plate-pad", "tpcplatepad")]
STROKE_TEX = [("hair", "tpcstrokehair"), ("thin", "tpcstrokethin"), ("regular", "tpcstrokeregular"),
              ("state", "tpcstrokestate"), ("effect", "tpcstrokeeffect"), ("dynamics", "tpcstrokedynamics"),
              ("bath", "tpcstrokebath"), ("depth-v", "tpcstrokedepthv"), ("depth-f", "tpcstrokedepthf"),
              ("box", "tpcstrokebox")]


def flat(doc, ground):
    """The fully resolved build: everything the emitters and other tools need."""
    screen = resolve_colors(doc, ["light"] if ground == "light" else ["dark", "light"])
    meta = doc["meta"]
    out = {"meta": {"generated_by": "design/build_tokens.py; do not edit", "pkg": meta["pkg"],
                    "ground": ground, "title": meta["title"],
                    "production_ready": meta["production_ready"],
                    "production_ready_reason": meta.get("production_ready_reason", ""),
                    "stage_follows_plate": bool(meta.get("stage_follows_plate", False)),
                    "waivers": meta.get("waivers", [])},
           "color": screen}
    if ground == "light":
        pr = resolve_colors(doc, ["print", "light"])
        out["print"] = {k: v for k, v in pr.items() if v["hex"] != screen[k]["hex"]}
    else:
        out["print"] = {}
    fonts = {}
    for role in ("serif", "sans", "mono", "math"):
        tok = doc["font"][role]
        tex = tok["$extensions"]["org.tpc.tex"]
        fonts[role] = {"css": tok["$value"], "open": tex["open"], "local": tex.get("local")}
    out["font"] = fonts
    body = _typo(doc, "body")
    web_body = _dim(doc["type"]["web-body"])[0]
    web_leading = doc["type"]["web-leading"]["$value"]
    out["type"] = {}
    for role in TYPE_ROLES:
        t = _typo(doc, role)
        t["web_rem"] = round(t["size_pt"] / body["size_pt"] * web_body, 4)
        t["line_height"] = round(t["leading_pt"] / t["size_pt"], 4)
        t["web_line_height"] = web_leading if role in ("body", "small", "depth-label") else t["line_height"]
        out["type"][role] = t
    out["space"] = {r: {"factor": doc["space"][r]["$value"],
                        "pt": round(doc["space"][r]["$value"] * body["leading_pt"], 3)} for r in SPACE_ROLES}
    out["measure"] = {k: {"value": _dim(v)[0], "unit": _dim(v)[1]} for k, v in doc["measure"].items()}
    m = out["measure"]
    m["figure"] = {"value": m["text"]["value"] + m["gap"]["value"] + m["margin"]["value"], "unit": "mm"}
    strokes = {}
    for k, v in doc["stroke"].items():
        if v["$type"] == "dimension":
            strokes[k] = {"pt": _dim(v)[0]}
        else:
            strokes[k] = {"dash_pt": [d["value"] for d in v["$value"]["dashArray"]]}
    out["stroke"] = strokes
    vid = {k: v["$value"] for k, v in doc["video"].items()}
    c = screen
    vid.update({"ground": c["stage"]["hex"], "ink": c["stage-ink"]["hex"], "rule": c["stage-rule"]["hex"],
                "state": c["stage-state"]["hex"], "effect": c["stage-effect"]["hex"],
                "dynamics": c["stage-dynamics"]["hex"], "bath": c["stage-bath"]["hex"],
                "ladder": [c[f"stage-q{i}"]["hex"] for i in range(1, 7)],
                "frame": c["ground"]["hex"], "frame_ink": c["ink"]["hex"], "accent": c["accent"]["hex"],
                "stills_are_print_figures": c["stage"]["hex"] == c["plate"]["hex"]})
    out["video"] = vid
    return out


def _fontcall(cmd, spec):
    opts = spec.get("options", "")
    return f"\\{cmd}{{{spec['font']}}}" + (f"[{opts}]" if opts else "")


def emit_sty(f):
    pkg, ground = f["meta"]["pkg"], f["meta"]["ground"]
    c = dict(f["color"])
    c.update(f["print"])
    L = [f"% tpc-tokens.sty  pkg{pkg}, ground={ground}",
         "% GENERATED by design/build_tokens.py from design/tokens/. Do not edit.",
         "% Loaded by latex/tpc-design.sty; names are documented in design/README.md.",
         f"\\def\\tpctokpkg{{{pkg}}}\\def\\tpctokground{{{ground}}}",
         f"\\def\\tpctoktitle{{{f['meta']['title']}}}",
         f"\\def\\tpctokproductionready{{{'1' if f['meta']['production_ready'] else '0'}}}",
         "% ---- colours (sRGB hex; OKLCH L C h in the comment)"]
    for name, v in c.items():
        o = v["oklch"]
        L.append(f"\\definecolor{{tpc-{name}}}{{HTML}}{{{v['hex'][1:]}}}% oklch({o[0]:.3f} {o[1]:.3f} {o[2]:.0f})")
    L.append("% ---- fonts: one complete fontspec call per role and font set, plus an existence probe")
    for role, cmd in (("serif", "setmainfont"), ("sans", "setsansfont"), ("mono", "setmonofont"),
                      ("math", "setmathfont")):
        spec = f["font"][role]
        L.append(f"\\def\\tpctok@{role}@open{{{_fontcall(cmd, spec['open'])}}}")
        L.append(f"\\def\\tpctok@{role}@open@probe{{{spec['open']['probe']}}}")
        loc = spec.get("local")
        if loc and loc.get("engine") == "mtpro2":
            L.append(f"\\def\\tpctok@{role}@local{{}}\\def\\tpctok@{role}@local@probe{{}}")
            L.append("\\def\\tpctok@mtpro{1}")
        elif loc:
            L.append(f"\\def\\tpctok@{role}@local{{{_fontcall(cmd, loc)}}}")
            L.append(f"\\def\\tpctok@{role}@local@probe{{{loc['probe']}}}")
        else:
            L.append(f"\\def\\tpctok@{role}@local{{}}\\def\\tpctok@{role}@local@probe{{}}")
    L.append("\\providecommand\\tpctok@mtpro{0}")
    serif_local = f["font"]["serif"].get("local")
    L.append(f"\\def\\tpctok@mathrm@local{{{serif_local['font'] if serif_local else ''}}}")
    L.append("% ---- type-scale roles: size/leading, family, weight, shape")
    fam = {"serif": "\\rmfamily", "sans": "\\sffamily", "mono": "\\ttfamily"}
    for role in TYPE_ROLES:
        t = f["type"][role]
        shape = ("\\bfseries" if t["weight"] >= 600 else "\\mdseries") + \
                ("\\itshape" if t["style"] == "italic" else ("\\scshape" if t["smallcaps"] else "\\upshape"))
        L.append(f"\\def\\tpcfont{TYPE_TEX[role]}{{\\fontsize{{{_num(t['size_pt'])}pt}}{{{_num(t['leading_pt'])}pt}}"
                 f"{fam[t['family']]}{shape}\\selectfont}}")
    b = f["type"]["body"]
    L.append(f"\\def\\tpcbodysize{{{_num(b['size_pt'])}pt}}\\def\\tpcbodyleading{{{_num(b['leading_pt'])}pt}}")
    L.append("% ---- lengths")
    for key, name in MEASURE_TEX:
        v = f["measure"][key]
        L.append(f"\\newlength\\{name}\\setlength\\{name}{{{_num(v['value'])}{v['unit']}}}")
    L.append(f"\\newlength\\tpcfigurewidth\\setlength\\tpcfigurewidth{{{_num(f['measure']['figure']['value'])}mm}}")
    for r in SPACE_ROLES:
        L.append(f"\\newlength\\tpcspace{r}\\setlength\\tpcspace{r}{{{_num(f['space'][r]['pt'])}pt}}")
    for key, name in STROKE_TEX:
        L.append(f"\\newlength\\{name}\\setlength\\{name}{{{_num(f['stroke'][key]['pt'])}pt}}")
    for key in ("effect", "bath"):
        on, off = f["stroke"][f"dash-{key}"]["dash_pt"]
        L.append(f"\\def\\tpcdash{key}{{on {_num(on)}pt off {_num(off)}pt}}")
    L.append("\\endinput")
    return "\n".join(L) + "\n"


def _cssfont(stack):
    generic = {"serif", "sans-serif", "monospace", "system-ui", "ui-monospace", "math"}
    return ", ".join(s if s in generic else f'"{s}"' for s in stack)


def emit_css(f):
    pkg, ground = f["meta"]["pkg"], f["meta"]["ground"]
    other = "dark" if ground == "light" else "light"
    L = [f"/* tokens.css  pkg{pkg}, ground={ground}",
         "   GENERATED by design/build_tokens.py from design/tokens/. Do not edit.",
         "   Names are documented in design/README.md. */",
         f':root:not([data-tpc-ground="{other}"]), [data-tpc-ground="{ground}"] {{',
         f"  color-scheme: {ground};"]
    for name, v in f["color"].items():
        o = v["oklch"]
        L.append(f"  --tpc-{name}: {v['hex']}; /* oklch({o[0]:.3f} {o[1]:.3f} {o[2]:.0f}) */")
    L.append("}")
    L.append(":root {")
    for role in ("serif", "sans", "mono", "math"):
        L.append(f"  --tpc-font-{role}: {_cssfont(f['font'][role]['css'])};")
    for role in TYPE_ROLES:
        t = f["type"][role]
        L.append(f"  --tpc-size-{role}: {_num(t['web_rem'])}rem;")
        L.append(f"  --tpc-leading-{role}: {_num(t['web_line_height'])};")
        L.append(f"  --tpc-family-{role}: var(--tpc-font-{t['family']});")
        L.append(f"  --tpc-weight-{role}: {t['weight']};")
        L.append(f"  --tpc-style-{role}: {t['style']};")
        L.append(f"  --tpc-caps-{role}: {'all-small-caps' if t['smallcaps'] else 'normal'};")
    lead = f["type"]["body"]["web_rem"] * f["type"]["body"]["web_line_height"]
    for r in SPACE_ROLES:
        L.append(f"  --tpc-space-{r}: {_num(f['space'][r]['factor'] * lead)}rem;")
    for key in ("web-text", "web-gap", "web-margin"):
        v = f["measure"][key]
        L.append(f"  --tpc-measure-{key[4:]}: {_num(v['value'])}{v['unit']};")
    for key, _ in STROKE_TEX:
        L.append(f"  --tpc-stroke-{key}: {_num(f['stroke'][key]['pt'] * 4 / 3)}px;")
    for key in ("effect", "bath"):
        on, off = f["stroke"][f"dash-{key}"]["dash_pt"]
        L.append(f"  --tpc-dash-{key}: {_num(on * 4 / 3)} {_num(off * 4 / 3)};")
    L.append("}")
    if ground == "light" and f["print"]:
        L.append("@media print {")
        L.append("  :root {")
        for name, v in f["print"].items():
            L.append(f"    --tpc-{name}: {v['hex']};")
        L.append("  }")
        L.append("}")
    return "\n".join(L) + "\n"


def emit_glsl(f):
    pkg, ground = f["meta"]["pkg"], f["meta"]["ground"]
    L = [f"// tokens.glsl  pkg{pkg}, ground={ground}",
         "// GENERATED by design/build_tokens.py from design/tokens/. Do not edit.",
         "// Linear-sRGB components (decode of the sRGB hex); convert to display space on output.",
         "// Clear colour of a 3D scene: TPC_STAGE. Draw with the TPC_STAGE_* roles."]
    for name, v in f["color"].items():
        r, g, b = v["linear"]
        L.append(f"const vec3 TPC_{name.upper().replace('-', '_')} = vec3({r:.5f}, {g:.5f}, {b:.5f}); // {v['hex']}")
    return "\n".join(L) + "\n"


def emit_json(f):
    return json.dumps(f, indent=1, ensure_ascii=False) + "\n"


def build(doc, ground):
    f = flat(doc, ground)
    # the linear components must be those of the emitted hex, so that every target agrees
    for sect in ("color", "print"):
        for v in f[sect].values():
            v["linear"] = [round(x, 5) for x in hex2lin(v["hex"])]
    return {"tpc-tokens.sty": emit_sty(f), "tokens.css": emit_css(f), "tokens.glsl": emit_glsl(f),
            "tokens.json": emit_json(f)}


# ----------------------------------------------------------------------------- driver
def table(all_rows):
    checks = [("text-contrast", "min text"), ("stroke-contrast", "min stroke"), ("grey-gap", "min dL data"),
              ("ladder-step", "min dL ladder"), ("cvd-deutan", "dE deutan"), ("cvd-protan", "dE protan")]
    out = ["| pkg | palette | " + " | ".join(n for _, n in checks) + " |",
           "|---|---|" + "---|" * len(checks)]
    for (pkg, label), rows in all_rows.items():
        s = summary(rows)
        cells = []
        for ck, _ in checks:
            pair, val, status = s[(label, ck)]
            unit = ":1" if "contrast" in ck else ""
            cells.append((f"{val:.2f}:1" if unit else f"{val:.3f}") + f" ({pair})" + ("" if status == "ok" else f" **{status}**"))
        out.append(f"| {pkg} | {label} | " + " | ".join(cells) + " |")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser(description="Compile and measure the TPC design tokens.")
    ap.add_argument("--pkg", type=int, choices=PKGS)
    ap.add_argument("--ground", choices=GROUNDS)
    ap.add_argument("--all", action="store_true", help="every package found in the tokens directory, both grounds")
    ap.add_argument("--check", action="store_true", help="measure, and verify the generated files are up to date")
    ap.add_argument("--measure", action="store_true", help="measure only; write nothing")
    ap.add_argument("--table", action="store_true", help="print the measurement table (Markdown)")
    ap.add_argument("--tokens-dir", default=str(HERE / "tokens"))
    ap.add_argument("--base", help="base token file (default: <tokens-dir>/base.tokens.json)")
    ap.add_argument("--out-dir", default=str(HERE / "build"))
    args = ap.parse_args()

    tdir = pathlib.Path(args.tokens_dir)
    base = pathlib.Path(args.base) if args.base else tdir / "base.tokens.json"
    out = pathlib.Path(args.out_dir)
    if args.pkg:
        pkgs = [args.pkg]
    else:
        pkgs = [n for n in PKGS if (tdir / f"pkg{n}.tokens.json").exists()]
    grounds = [args.ground] if args.ground else GROUNDS
    if not pkgs:
        print(f"no pkg*.tokens.json in {tdir}")
        return 1
    readonly = args.check or args.measure or args.table
    if not readonly and not (args.all or args.pkg):
        ap.print_help()
        return 2

    failures, warnings, stale, all_rows, written = [], [], [], {}, 0
    for pkg in pkgs:
        try:
            doc = load(tdir, base, pkg)
        except (TokenError, ValueError, KeyError, OSError) as exc:
            failures.append(f"FAIL    pkg{pkg}: token files unusable: {exc}")
            continue
        if not doc["meta"]["production_ready"]:
            warnings.append(f"NOTE    pkg{pkg}: production_ready is false: "
                            f"{doc['meta'].get('production_ready_reason', 'no reason given')}")
        for ground in grounds:
            try:
                rows, fails, warns = measure(doc, ground)
                files = build(doc, ground)
            except (TokenError, KeyError, AttributeError, TypeError) as exc:
                failures.append(f"FAIL    pkg{pkg} {ground}: token files unusable: {exc!r}")
                continue
            failures += fails
            warnings += warns
            for label in chains(ground):
                all_rows[(pkg, label)] = [r for r in rows if r[0] == label]
            d = out / f"pkg{pkg}-{ground}"
            if args.check:
                for name, text in files.items():
                    p = d / name
                    if not p.exists():
                        stale.append(f"stale   {p}: missing")
                    elif p.read_text(encoding="utf-8") != text:
                        stale.append(f"stale   {p}: differs from what the token files produce")
            elif not readonly:
                d.mkdir(parents=True, exist_ok=True)
                for name, text in files.items():
                    (d / name).write_text(text, encoding="utf-8")
                    written += 1

    if args.table:
        print(table(all_rows))
        print()
        print(threshold_table())
    for w in warnings:
        print(w)
    for s in stale:
        print(s)
    for f in failures:
        print(f)
    n_meas = sum(len(r) for r in all_rows.values())
    print(threshold_line())
    if readonly:
        print(f"tokens: {len(pkgs)} package(s) x {len(grounds)} ground(s), {n_meas} measurements, "
              f"{len(failures)} failure(s), {sum(1 for w in warnings if w.startswith('WAIVED'))} waived"
              + (f", {len(stale)} stale file(s)" if args.check else ""))
        if stale:
            print("run: python3 design/build_tokens.py --all")
    else:
        print(f"tokens: wrote {written} file(s) under {out}"
              + (f"; {len(failures)} measurement failure(s), see --check" if failures else ""))
    return 1 if (failures or stale) else 0


if __name__ == "__main__":
    sys.exit(main())
