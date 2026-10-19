#!/usr/bin/env python3
"""Fail on package-specific colour or font literals in content.

    python3 design/lint_content.py [paths ...]      default: content/ web/src/

Content takes type and colour from token names only (design/README.md). This lint rejects:
  TeX   \\definecolor, \\color[model]{...}, \\textcolor[model]{...}, \\pagecolor[...], {HTML}{RRGGBB},
        \\setmainfont \\setsansfont \\setmonofont \\setmathfont \\fontspec \\newfontfamily \\newfontface
  web   hex colours (#rgb, #rgba, #rrggbb, #rrggbbaa), 0xRRGGBB numeric colours,
        rgb() rgba() hsl() hsla() hwb() lab() lch() oklab() oklch() color(),
        named CSS colours, font-family and font shorthand outside var(--tpc-...)
  both  the names of the package faces (STIX Two, Libertinus, Iosevka, Whitney, Times LT,
        Baskerville, MathTime, Inter as a quoted family)
Token files are exempt: tokens.css, tokens.glsl, tokens.json, tpc-tokens.sty, *.tokens.json.
A line containing `tpc-lint: allow(<nonempty reason>)` is waived.
Package-grid lengths are not checked: formula geometry and design lengths need
reviewer classification; this lexer does not establish that distinction.
Exit 1 and print file:line: rule for every hit.
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
EXEMPT = {"tokens.css", "tokens.glsl", "tokens.json", "tpc-tokens.sty"}
TEX = {".tex", ".sty", ".cls", ".tikz"}
WEB = {".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".html", ".htm", ".svg", ".vue", ".svelte",
       ".glsl", ".vert", ".frag", ".json", ".md", ".mdx"}

FONT_NAMES = r"STIX\s?Two|Libertinus|Iosevka|Whitney|Times LT|Baskerville|MathTime|mtpro2|[\"']Inter[\"']"
CSS_COLOURS = set("""aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond
blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk
crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta
darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray
darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick
floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey
honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon
lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink
lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow
lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple
mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue
mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue
purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna
silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato
turquoise violet wheat white whitesmoke yellow yellowgreen""".split())
NAMED_COLOUR = re.compile(r"(?<![\w-])(?:" + "|".join(sorted(CSS_COLOURS)) + r")(?![\w-])", re.I)
COLOUR_DECL = re.compile(r"(?<![\w-])(?:color|background(?:-color)?|border(?:-(?:top|right|bottom|left))?(?:-color)?|outline(?:-color)?|(?:box|text)-shadow|fill|stroke)\s*:\s*([^;{}]+)", re.I)
RULES_TEX = [
    ("literal colour definition (\\definecolor)", re.compile(r"\\(?:definecolor|providecolor|definecolorset)\b")),
    ("literal colour (\\color[model])", re.compile(r"\\(?:color|textcolor|pagecolor|colorbox|fcolorbox)\s*\[")),
    ("literal colour ({HTML}{...})", re.compile(r"\{(?:HTML|rgb|RGB|cmyk|gray|hsb)\}\s*\{")),
    ("hex colour", re.compile(r"(?<![\w&])#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b")),
    ("font selection (fontspec)", re.compile(
        r"\\(?:setmainfont|setsansfont|setmonofont|setmathfont|setromanfont|fontspec|newfontfamily|newfontface|"
        r"setmathrm|setmathsf|setmathtt|defaultfontfeatures)\b")),
    ("package font name", re.compile(FONT_NAMES)),
    ("literal colour mix", re.compile(r"\b(?:" + "|".join(sorted(CSS_COLOURS | {"Gray", "Red", "Blue", "Green"})) + r")!\d*", re.I)),
]
RULES_WEB = [
    ("hex colour", re.compile(r"(?<![\w&/])#(?:[0-9A-Fa-f]{8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3,4})\b(?![\w-])")),
    ("numeric colour (0xRRGGBB)", re.compile(r"\b0x[0-9A-Fa-f]{6}\b")),
    ("CSS colour function", re.compile(r"\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(\s*(?:[-\d.]|from\b|srgb\b|display-p3\b)")),
    ("font shorthand literal", re.compile(r"\bfont\s*:(?!\s*(?:var\(--tpc-|inherit\b|initial\b|unset\b|revert\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*=>|\{))[^;]+", re.I)),
    ("font-family literal", re.compile(r"font-family\s*:(?!\s*(?:var\(--tpc-|inherit|initial|unset))[^;]+")),
    ("fontFamily literal", re.compile(r"fontFamily\s*[:=]\s*[\"'`](?!var\(--tpc-)")),
    ("package font name", re.compile(FONT_NAMES)),
]


def exempt(path):
    return path.name in EXEMPT or path.name.endswith(".tokens.json")


def lint_file(path):
    ext = path.suffix.lower()
    rules = RULES_TEX if ext in TEX else RULES_WEB if ext in WEB else None
    if rules is None or exempt(path):
        return []
    hits = []
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return []
    waived = set()
    for n, line in enumerate(text.splitlines(), 1):
        if "tpc-lint: allow" in line:
            if re.search(r"tpc-lint: allow\([^()]*\S[^()]*\)", line):
                waived.add(n)
                continue
            hits.append((path, n, "lint waiver needs allow(<reason>)", "tpc-lint: allow"))
        for name, rx in rules:
            m = rx.search(line)
            if m:
                hits.append((path, n, name, m.group(0).strip()))
    if ext in WEB:
        # Scan declaration values across line breaks. Named colours in prose or
        # selectors are not colour declarations; token identifiers are preserved.
        clean = re.sub(r"/\*.*?\*/|<!--.*?-->", lambda m: "".join("\n" if c == "\n" else " " for c in m.group()), text, flags=re.S)
        for decl in COLOUR_DECL.finditer(clean):
            for m in NAMED_COLOUR.finditer(decl.group(1)):
                n = clean.count("\n", 0, decl.start(1) + m.start()) + 1
                if n not in waived:
                    hits.append((path, n, "named CSS colour", m.group()))
    return hits


def main(argv):
    paths = [pathlib.Path(a) for a in argv] or [ROOT / "content", ROOT / "web" / "src"]
    files = []
    for p in paths:
        if p.is_dir():
            files += sorted(f for f in p.rglob("*") if f.is_file() and "node_modules" not in f.parts)
        elif p.is_file():
            files.append(p)
        elif argv:
            print(f"lint_content: no such path {p}")
            return 2
    hits = [h for f in files for h in lint_file(f)]
    for path, n, name, what in hits:
        try:
            shown = path.resolve().relative_to(ROOT)
        except ValueError:
            shown = path
        print(f"{shown}:{n}: literal in content: {name}: {what}")
    print(f"lint_content: {len(files)} file(s), {len(hits)} literal(s)")
    return 1 if hits else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
