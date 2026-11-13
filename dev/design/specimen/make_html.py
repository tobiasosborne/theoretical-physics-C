#!/usr/bin/env python3
"""Write the HTML flag specimen for one (package, ground).

    python3 design/specimen/make_html.py <pkg> <ground> <out.html>

The page inlines design/build/pkg<N>-<ground>/tokens.css and uses nothing but its custom
properties: no colour, face or length is typed here. Fonts are referenced by name only
(local()); no font file is copied or embedded. Same content and geometry as specimen.tex:
r = 0.75 at 50 degrees, n = e_x, r.n = 0.482, p = 0.741; ladder E_n = n^2 E_1, n = 1..6.
"""
import math
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]


def figure():
    R = 78.0  # px per unit radius
    cx, cy = 110.0, 112.0
    rx, ry = cx + R * 0.75 * math.cos(math.radians(50)), cy - R * 0.75 * math.sin(math.radians(50))
    px = cx + R * 0.482
    a0, a1 = math.radians(58), math.radians(112)
    arc = (f"M {cx + R * 0.75 * math.cos(a0):.1f} {cy - R * 0.75 * math.sin(a0):.1f} "
           f"A {R * 0.75:.1f} {R * 0.75:.1f} 0 0 0 {cx + R * 0.75 * math.cos(a1):.1f} {cy - R * 0.75 * math.sin(a1):.1f}")
    s = [f'<svg class="plate" viewBox="0 0 400 224" role="img" aria-labelledby="figt">',
         '<title id="figt">Bloch-Kreis mit Zustand, Effekt und Projektion; Leiter der Niveaus n = 1 bis 6</title>',
         '<defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">'
         '<line x1="0" y1="0" x2="0" y2="5" class="hatch"/></pattern>'
         '<marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">'
         '<path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker></defs>',
         f'<path class="bath" fill-rule="evenodd" d="M {cx - R * 1.17:.1f} {cy} a {R * 1.17:.1f} {R * 1.17:.1f} 0 1 0 {2 * R * 1.17:.1f} 0 a {R * 1.17:.1f} {R * 1.17:.1f} 0 1 0 {-2 * R * 1.17:.1f} 0 z '
         f'M {cx - R:.1f} {cy} a {R} {R} 0 1 0 {2 * R} 0 a {R} {R} 0 1 0 {-2 * R} 0 z"/>',
         f'<path class="hatched" fill-rule="evenodd" d="M {cx - R * 1.17:.1f} {cy} a {R * 1.17:.1f} {R * 1.17:.1f} 0 1 0 {2 * R * 1.17:.1f} 0 a {R * 1.17:.1f} {R * 1.17:.1f} 0 1 0 {-2 * R * 1.17:.1f} 0 z '
         f'M {cx - R:.1f} {cy} a {R} {R} 0 1 0 {2 * R} 0 a {R} {R} 0 1 0 {-2 * R} 0 z"/>',
         f'<circle class="bathedge" cx="{cx}" cy="{cy}" r="{R * 1.17:.1f}"/>',
         f'<line class="axis" x1="{cx - R * 1.25:.1f}" y1="{cy}" x2="{cx + R * 1.36:.1f}" y2="{cy}" marker-end="url(#ah)"/>',
         f'<line class="axis" x1="{cx}" y1="{cy + R * 1.22:.1f}" x2="{cx}" y2="{cy - R * 1.34:.1f}" marker-end="url(#ah)"/>',
         f'<circle class="boundary" cx="{cx}" cy="{cy}" r="{R}"/>',
         f'<path class="dynamics" d="{arc}" marker-end="url(#ah)"/>',
         f'<line class="effect bar" x1="{cx}" y1="{cy}" x2="{px:.1f}" y2="{cy}"/>',
         f'<line class="effect" x1="{px:.1f}" y1="{cy}" x2="{cx + R:.1f}" y2="{cy}" marker-end="url(#ah)"/>',
         f'<line class="leader" x1="{rx:.1f}" y1="{ry:.1f}" x2="{px:.1f}" y2="{cy}"/>',
         f'<line class="state" x1="{cx}" y1="{cy}" x2="{rx:.1f}" y2="{ry:.1f}" marker-end="url(#ah)"/>',
         f'<text x="{rx + 7:.1f}" y="{ry + 2:.1f}"><tspan class="v">r</tspan></text>',
         f'<text x="{cx + R + 4:.1f}" y="{cy + 15:.1f}"><tspan class="v">n</tspan></text>',
         f'<text x="{cx + 6:.1f}" y="{cy + 16:.1f}"><tspan class="v">r</tspan>·<tspan class="v">n</tspan></text>',
         f'<text x="{cx - 8:.1f}" y="{cy - R * 0.80:.1f}" text-anchor="end"><tspan class="i">U</tspan><tspan class="sub" dy="3">t</tspan></text>',
         '<text x="8" y="16">(a)</text>',
         f'<text x="{cx + R * 0.72:.1f}" y="{cy + R * 0.98:.1f}">keine</text>',
         f'<text x="{cx + R * 0.72:.1f}" y="{cy + R * 0.98 + 13:.1f}">Zustände</text>']
    x0, y0, u = 262.0, 205.0, 4.9
    s.append(f'<text x="{x0 - 14}" y="16">(b)</text>')
    s.append(f'<line class="axis" x1="{x0}" y1="{y0 + 6}" x2="{x0}" y2="18" marker-end="url(#ah)"/>')
    s.append(f'<text x="{x0 + 7}" y="24"><tspan class="i">E</tspan></text>')
    for n in range(1, 7):
        y = y0 - u * n * n
        s.append(f'<line class="q q{n}" x1="{x0 + 16}" y1="{y:.1f}" x2="{x0 + 100}" y2="{y:.1f}"/>')
        s.append(f'<text x="{x0 + 106}" y="{y + 4:.1f}">{n}</text>')
    s.append(f'<line class="dynamics" x1="{x0 + 58}" y1="{y0 - u * 9:.1f}" x2="{x0 + 58}" y2="{y0 - u * 4 - 3:.1f}" marker-end="url(#ah)"/>')
    s.append("</svg>")
    return "\n".join(s)


def stage():
    s = ['<svg class="stage" viewBox="0 0 170 224" role="img" aria-labelledby="stt">',
         '<title id="stt">Dieselben Rollen auf der Bühne</title>',
         '<defs><pattern id="shatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">'
         '<line x1="0" y1="0" x2="0" y2="5" class="shatch"/></pattern></defs>',
         '<text x="10" y="22">(c) Bühne</text>']
    for cls, lab, y in (("s-state", "Zustand", 52), ("s-effect", "Effekt", 76), ("s-dynamics", "Dynamik", 100)):
        s.append(f'<line class="{cls}" x1="10" y1="{y}" x2="80" y2="{y}"/><text x="90" y="{y + 4}">{lab}</text>')
    s.append('<rect class="s-bath" x="10" y="117" width="70" height="16"/><rect class="shatched" x="10" y="117" width="70" height="16"/>'
             '<rect class="s-bathedge" x="10" y="117" width="70" height="16"/><text x="90" y="129">Bad</text>')
    for n in range(1, 7):
        s.append(f'<line class="sq sq{n}" x1="{10 + 25 * (n - 1)}" y1="170" x2="{10 + 25 * (n - 1) + 20}" y2="170"/>')
    s.append('<text x="10" y="192">Leiter n = 1, …, 6</text></svg>')
    return "\n".join(s)


CSS = r"""
@font-face { font-family: "STIX Two Text"; src: local("STIX Two Text"), local("STIXTwoText-Regular"); }
@font-face { font-family: "STIX Two Math"; src: local("STIX Two Math"), local("STIXTwoMath-Regular"); }
html { background: var(--tpc-ground); color: var(--tpc-ink); }
body { margin: 0; font-family: var(--tpc-family-body); font-size: var(--tpc-size-body);
  line-height: var(--tpc-leading-body); font-weight: var(--tpc-weight-body); }
main { display: grid; grid-template-columns: minmax(0, var(--tpc-measure-text)) var(--tpc-measure-margin);
  column-gap: var(--tpc-measure-gap); max-width: calc(var(--tpc-measure-text) + var(--tpc-measure-gap) + var(--tpc-measure-margin));
  margin: 0 auto; padding: var(--tpc-space-xl) var(--tpc-space-l); }
main > * { grid-column: 1; margin: 0; }
p + p { text-indent: var(--tpc-space-m); }
.kicker { font-family: var(--tpc-family-label); font-size: var(--tpc-size-label); color: var(--tpc-ink-muted); }
h1 { font-family: var(--tpc-family-h1); font-size: var(--tpc-size-h1); line-height: var(--tpc-leading-h1);
  font-weight: var(--tpc-weight-h1); font-style: var(--tpc-style-h1); color: var(--tpc-accent);
  margin: 0 0 var(--tpc-space-s); }
h1 .num { font-family: var(--tpc-family-numeral); font-size: var(--tpc-size-numeral); font-weight: var(--tpc-weight-numeral);
  font-style: var(--tpc-style-numeral); margin-right: var(--tpc-space-s); }
h2 { font-family: var(--tpc-family-h2); font-size: var(--tpc-size-h2); line-height: var(--tpc-leading-h2);
  font-weight: var(--tpc-weight-h2); font-style: var(--tpc-style-h2); font-variant-caps: var(--tpc-caps-h2);
  color: var(--tpc-accent); margin: var(--tpc-space-m) 0 var(--tpc-space-xs); }
a { color: var(--tpc-link); text-decoration: underline; text-underline-offset: 0.15em; }
.note { grid-column: 2; align-self: start; font-family: var(--tpc-family-label); font-size: var(--tpc-size-label);
  line-height: var(--tpc-leading-label); color: var(--tpc-ink-muted); }
.merksatz { background: var(--tpc-highlight); border-left: var(--tpc-stroke-box) solid var(--tpc-accent);
  padding: var(--tpc-space-xs) var(--tpc-space-s); margin: var(--tpc-space-s) 0; }
.merksatz b { font-family: var(--tpc-family-h3); font-weight: var(--tpc-weight-h3); font-style: var(--tpc-style-h3);
  color: var(--tpc-accent); margin-right: 1em; }
math { font-family: var(--tpc-font-math); }
math[display="block"] { margin: var(--tpc-space-s) 0; }
figure { grid-column: 1 / 3; display: flex; flex-wrap: wrap; gap: var(--tpc-space-s); align-items: stretch; margin: var(--tpc-space-s) 0 0; }
figcaption { flex-basis: 100%; max-width: var(--tpc-measure-text); font-size: var(--tpc-size-small);
  line-height: var(--tpc-leading-small); color: var(--tpc-ink-muted); }
figcaption b { font-family: var(--tpc-family-label); color: var(--tpc-ink); }
svg { height: 15rem; font-family: var(--tpc-family-label); font-size: 11px; }
svg.plate { background: var(--tpc-plate); fill: var(--tpc-plate-ink); }
svg.stage { background: var(--tpc-stage); fill: var(--tpc-stage-ink); }
svg line, svg path, svg circle, svg rect { fill: none; }
svg text { stroke: none; }
svg path.hatched { fill: url(#hatch); }
svg rect.shatched { fill: url(#shatch); }
svg marker path { fill: context-stroke; stroke: none; }
svg .v { font-family: var(--tpc-font-serif); font-weight: 700; font-style: italic; font-size: 13px; }
svg .i { font-family: var(--tpc-font-serif); font-style: italic; font-size: 13px; }
svg .sub { font-size: 9px; font-family: var(--tpc-font-serif); font-style: italic; }
.axis { stroke: var(--tpc-plate-ink); stroke-width: var(--tpc-stroke-thin); }
.boundary { stroke: var(--tpc-plate-ink); stroke-width: var(--tpc-stroke-regular); }
.leader { stroke: var(--tpc-plate-ink); stroke-width: var(--tpc-stroke-hair); stroke-dasharray: 2 2; }
.state { stroke: var(--tpc-state); stroke-width: var(--tpc-stroke-state); }
.effect { stroke: var(--tpc-effect); stroke-width: var(--tpc-stroke-effect); stroke-dasharray: var(--tpc-dash-effect); }
.effect.bar { stroke-width: 3px; stroke-dasharray: none; }
.dynamics { stroke: var(--tpc-dynamics); stroke-width: var(--tpc-stroke-dynamics); }
svg path.bath { fill: var(--tpc-bath); }
.hatch { stroke: var(--tpc-bath-edge); stroke-width: var(--tpc-stroke-regular); }
.bathedge { stroke: var(--tpc-bath-edge); stroke-width: var(--tpc-stroke-bath); stroke-dasharray: var(--tpc-dash-bath); }
.q { stroke-width: var(--tpc-stroke-state); }
.q1 { stroke: var(--tpc-q1); } .q2 { stroke: var(--tpc-q2); } .q3 { stroke: var(--tpc-q3); }
.q4 { stroke: var(--tpc-q4); } .q5 { stroke: var(--tpc-q5); } .q6 { stroke: var(--tpc-q6); }
.s-state { stroke: var(--tpc-stage-state); stroke-width: var(--tpc-stroke-state); }
.s-effect { stroke: var(--tpc-stage-effect); stroke-width: var(--tpc-stroke-effect); stroke-dasharray: var(--tpc-dash-effect); }
.s-dynamics { stroke: var(--tpc-stage-dynamics); stroke-width: var(--tpc-stroke-dynamics); }
svg rect.s-bath { fill: var(--tpc-stage-bath); }
.shatch { stroke: var(--tpc-stage-bath-edge); stroke-width: var(--tpc-stroke-regular); }
.s-bathedge { stroke: var(--tpc-stage-bath-edge); stroke-width: var(--tpc-stroke-bath); stroke-dasharray: var(--tpc-dash-bath); }
.sq { stroke-width: 4px; }
.sq1 { stroke: var(--tpc-stage-q1); } .sq2 { stroke: var(--tpc-stage-q2); } .sq3 { stroke: var(--tpc-stage-q3); }
.sq4 { stroke: var(--tpc-stage-q4); } .sq5 { stroke: var(--tpc-stage-q5); } .sq6 { stroke: var(--tpc-stage-q6); }
/* depth marking: body size, no tint, rule in the outer margin, run-in label */
.vertiefung { border-right: var(--tpc-stroke-depth-v) solid var(--tpc-depth-v); padding-right: var(--tpc-space-s);
  margin: var(--tpc-space-s) calc(-1 * var(--tpc-space-s)) var(--tpc-space-s) 0; }
.vertiefung .lab { font-family: var(--tpc-family-depth-label); font-weight: var(--tpc-weight-depth-label);
  font-style: var(--tpc-style-depth-label); font-variant-caps: var(--tpc-caps-depth-label); color: var(--tpc-depth-v); display: block; }
.vertiefung .back { color: var(--tpc-depth-v); }
.fundament { grid-column: 2; align-self: start; font-family: var(--tpc-family-label); font-size: var(--tpc-size-label);
  line-height: var(--tpc-leading-label); color: var(--tpc-depth-f); border-top: 3px double var(--tpc-depth-f);
  padding-top: var(--tpc-space-xs); margin-top: var(--tpc-space-s); }
footer { grid-column: 1 / 3; font-family: var(--tpc-family-mono); font-size: var(--tpc-size-mono); color: var(--tpc-ink-muted);
  margin-top: var(--tpc-space-xl); }
@media (max-width: 52rem) { main { display: block; } .note, .fundament { margin: var(--tpc-space-xs) 0; } }
"""

BODY = r"""<main>
<p class="kicker">Zoomstufe 1 – ein einzelnes Quantensystem</p>
<h1><span class="num">6</span>Die Bornsche Regel</h1>
<p>Eine physikalische Theorie liefert Daten für drei Dinge: Präparationen, Dynamik und Messungen. Eine Präparation
nennen wir „Zustand“; im Quantenfall beschreiben wir sie durch einen Dichteoperator
<math><mi>ρ</mi><mo>≥</mo><mn>0</mn></math> mit <math><mi>tr</mi><mspace width="0.17em"/><mi>ρ</mi><mo>=</mo><mn>1</mn></math>.
Ein Detektor, der „klick“ macht oder schweigt, wird durch einen Effekt <math><mi>E</mi></math> mit
<math><mn>0</mn><mo>≤</mo><mi>E</mi><mo>≤</mo><mn>𝟙</mn></math> beschrieben. Die Theorie sagt nur Wahrscheinlichkeiten voraus,
und zwar genau eine Zahl für jedes Paar aus Zustand und Effekt (siehe <a href="#d61">Definition D-6.1</a>).</p>
<aside class="note" style="grid-row: 3">Für ein Qubit ist jeder Dichteoperator von der Form
<math><mi>ρ</mi><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mo>(</mo><mn>𝟙</mn><mo>+</mo><mi>𝒓</mi><mo>·</mo><mi>𝝈</mi><mo>)</mo></math>
mit <math><mo>|</mo><mi>𝒓</mi><mo>|</mo><mo>≤</mo><mn>1</mn></math>. Reine Zustände liegen auf dem Rand.</aside>
<div class="merksatz"><b>Postulat P4</b>Wird ein System im Zustand <math><mi>ρ</mi></math> präpariert und mit dem Effekt
<math><mi>E</mi></math> getestet, so spricht der Detektor mit der Wahrscheinlichkeit
<math><mi>p</mi><mo>(</mo><mi>E</mi><mo>|</mo><mi>ρ</mi><mo>)</mo><mo>=</mo><mi>tr</mi><mo>(</mo><mi>ρ</mi><mi>E</mi><mo>)</mo></math> an.</div>
<p>Für ein Qubit lässt sich die Regel zeichnen (Abb. 6.1a). Mit dem Projektor
<math><mi>E</mi><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac><mo>(</mo><mn>𝟙</mn><mo>+</mo><mi>𝒏</mi><mo>·</mo><mi>𝝈</mi><mo>)</mo></math>,
<math><mo>|</mo><mi>𝒏</mi><mo>|</mo><mo>=</mo><mn>1</mn></math>, folgt</p>
<math display="block"><mi>tr</mi><mo>(</mo><mi>ρ</mi><mi>E</mi><mo>)</mo><mo>=</mo><mfrac><mn>1</mn><mn>2</mn></mfrac>
<mo>(</mo><mn>1</mn><mo>+</mo><mi>𝒓</mi><mo>·</mo><mi>𝒏</mi><mo>)</mo><mo>,</mo><mspace width="2em"/>
<mi>ρ</mi><mo>↦</mo><msub><mi>U</mi><mi>t</mi></msub><mi>ρ</mi><msubsup><mi>U</mi><mi>t</mi><mo>*</mo></msubsup><mo>,</mo><mspace width="1em"/>
<msub><mi>U</mi><mi>t</mi></msub><mo>=</mo><msup><mi mathvariant="normal">e</mi><mrow><mo>−</mo><mi mathvariant="normal">i</mi><mi>H</mi><mi>t</mi><mo>/</mo><mi>ℏ</mi></mrow></msup><mo>.</mo></math>
<p>Die Wahrscheinlichkeit ist also die Projektion des Bloch-Vektors auf die Richtung des Detektors, verschoben und
halbiert. Die Zeitentwicklung dreht den Vektor; sie ändert <math><mo>|</mo><mi>𝒓</mi><mo>|</mo></math> nicht.</p>
<figure>
__FIGURE__
__STAGE__
<figcaption><b>Abb. 6.1</b> <i>Die Wahrscheinlichkeit ist eine Projektion.</i> (a) Zustand <i><b>r</b></i>, Detektorrichtung
<i><b>n</b></i>, Projektion p = ½(1 + <i><b>r</b></i>·<i><b>n</b></i>) ≈ 0,74; außerhalb des Kreises liegen keine Zustände.
(b) Teilchen im Kasten, E<sub>n</sub> = n²E<sub>1</sub>, n = 1, …, 6. (c) Dieselben Rollen auf der Bühne für 3D und Video.</figcaption>
</figure>
<div class="vertiefung"><span class="lab">Vertiefung 6.V2 Zustände als Funktionale</span>
Voraussetzung: Kern 6.1. Allgemein ist ein Zustand ein positives, normiertes lineares Funktional
<math><mi>ω</mi></math> auf der Algebra <math><mi>ℬ</mi><mo>(</mo><mi>ℋ</mi><mo>)</mo></math>, also
<math><mi>ω</mi><mo>(</mo><msup><mi>A</mi><mo>*</mo></msup><mi>A</mi><mo>)</mo><mo>≥</mo><mn>0</mn></math> und
<math><mi>ω</mi><mo>(</mo><mn>𝟙</mn><mo>)</mo><mo>=</mo><mn>1</mn></math>. Die <em>normalen</em> Zustände sind genau die Funktionale
<math><mi>ω</mi><mo>(</mo><mi>A</mi><mo>)</mo><mo>=</mo><mi>tr</mi><mo>(</mo><mi>ρ</mi><mi>A</mi><mo>)</mo></math> mit einem Dichteoperator
<math><mi>ρ</mi></math> der Spurklasse. <span class="back">Zurück zum Kern:</span> im Folgenden genügen Dichteoperatoren.</div>
<aside class="fundament">Fundament 6.F1: Spurklasse und normale Zustände</aside>
<h2>Was diese Seite zeigt</h2>
<p>Schrift, Farbe und Maße dieser Seite stammen aus einer einzigen Tokendatei. Farbe trägt nur Physik: Zustand, Effekt,
Dynamik, Bad und die Leiter der Quantenzahlen.</p>
<footer>tokens.css: pkg=__PKG__ ground=__GROUND__ (web: open faces only)</footer>
</main>"""


def main():
    pkg, ground, out = sys.argv[1], sys.argv[2], pathlib.Path(sys.argv[3])
    tokens = (ROOT / "design" / "build" / f"pkg{pkg}-{ground}" / "tokens.css").read_text(encoding="utf-8")
    body = (BODY.replace("__FIGURE__", figure()).replace("__STAGE__", stage())
            .replace("__PKG__", pkg).replace("__GROUND__", ground))
    html = (f'<!doctype html>\n<html lang="de" data-tpc-ground="{ground}">\n<head>\n<meta charset="utf-8">\n'
            f'<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            f"<title>TPC Spezimen pkg{pkg} {ground}</title>\n"
            f"<style>\n{tokens}</style>\n<style>{CSS}</style>\n</head>\n<body>\n{body}\n</body>\n</html>\n")
    out.write_text(html, encoding="utf-8")


if __name__ == "__main__":
    main()
