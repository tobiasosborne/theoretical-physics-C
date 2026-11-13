#!/usr/bin/env python3
"""Generate pkg1.html, pkg2.html, pkg3.html: the print specimen's content with each package's CSS
tokens, native MathML (hand-written) and an inline SVG figure whose geometry matches fig-born.tex.
Fonts are referenced from local files (file://) and never embedded: Times, Whitney, Baskerville
10 Pro and the Companion Math prototype are licensed or private; see the package files.
Run: python3 -I make_html.py"""
import json, math, os
HERE = os.path.dirname(os.path.abspath(__file__))
TOK = {n: json.load(open(os.path.join(HERE, '..', f'tokens-pkg-{n}.json'))) for n in (1, 2, 3)}
STIX = 'file:///usr/share/texlive/texmf-dist/fonts/opentype/public/stix2-otf/'
WHIT = 'file:///usr/share/fonts/opentype/whitney/'
BASK = 'file:///usr/share/fonts/opentype/storm-baskerville/'
BCM = 'file:///home/tobias/Projects/mathfonts/build/BaskervilleCompanionMath-Regular.otf'

def ff(fam, url, w=400, s='normal'):
    return f"@font-face{{font-family:'{fam}';src:url('{url}') format('opentype');font-weight:{w};font-style:{s};font-display:swap}}"

FONTS = {
 1: [ff('PKG Text', STIX+'STIXTwoText-Regular.otf'), ff('PKG Text', STIX+'STIXTwoText-Italic.otf', 400, 'italic'),
     ff('PKG Text', STIX+'STIXTwoText-Bold.otf', 700), ff('PKG Math', STIX+'STIXTwoMath-Regular.otf'),
     ff('PKG Label', WHIT+'Whitney-Book.otf'), ff('PKG Label', WHIT+'Whitney-Semibold.otf', 600),
     ff('PKG Label', WHIT+'Whitney-BookItalic.otf', 400, 'italic')],
 2: [ff('PKG Text', BASK+'Baskerville10Pro.otf'), ff('PKG Text', BASK+'Baskerville10Pro-Italic.otf', 400, 'italic'),
     ff('PKG Text', BASK+'Baskerville10Pro-Bold.otf', 700), ff('PKG Math', BCM),
     ff('PKG Label', WHIT+'Whitney-Book.otf'), ff('PKG Label', WHIT+'Whitney-Semibold.otf', 600),
     ff('PKG Label', WHIT+'Whitney-BookItalic.otf', 400, 'italic')],
 3: [ff('PKG Text', STIX+'STIXTwoText-Regular.otf'), ff('PKG Text', STIX+'STIXTwoText-Italic.otf', 400, 'italic'),
     ff('PKG Text', STIX+'STIXTwoText-SemiBold.otf', 600), ff('PKG Text', STIX+'STIXTwoText-Bold.otf', 700),
     ff('PKG Math', STIX+'STIXTwoMath-Regular.otf'),
     ff('PKG Label', STIX+'STIXTwoText-Regular.otf'), ff('PKG Label', STIX+'STIXTwoText-SemiBold.otf', 600),
     ff('PKG Label', STIX+'STIXTwoText-Italic.otf', 400, 'italic')],
}
# Type scale and grid per package (rem = 16 px).  Fallback stacks name the free substitutes.
SCALE = {
 1: dict(text="'PKG Text','STIX Two Text','Times New Roman',serif", label="'PKG Label','Whitney','Source Sans 3','Inter',sans-serif",
         body='1.125rem', lh='1.55', small='0.9375rem', note='0.8125rem', h1='2.125rem', body_w='38rem', margin_w='15rem', gutter='2.25rem'),
 2: dict(text="'PKG Text','Baskerville 10 Pro','Libre Baskerville',Baskerville,serif", label="'PKG Label','Whitney','Source Sans 3',sans-serif",
         body='1.1875rem', lh='1.6', small='1rem', note='0.875rem', h1='2.375rem', body_w='39rem', margin_w='14rem', gutter='2.25rem'),
 3: dict(text="'PKG Text','STIX Two Text',serif", label="'PKG Label','STIX Two Text',serif",
         body='1.0625rem', lh='1.55', small='0.9375rem', note='0.8125rem', h1='2.125rem', body_w='36rem', margin_w='17rem', gutter='2.5rem'),
}
def modevars(n, mode):
    c = TOK[n]['color']
    out = [f"--c-{r}:{c[r]['$extensions']['modes'][mode]['hex']};" for r in c if r != 'ladder']
    out += [f"--c-ladder{i}:{c['ladder'][f'n{i}']['$extensions']['modes'][mode]['hex']};" for i in (1, 2, 3, 4)]
    return ''.join(out)

# ---------------------------------------------------------------- MathML snippets (hand-written)
def M(x, display=False):
    return f'<math display="block">{x}</math>' if display else f'<math>{x}</math>'
up = lambda s: f'<mi mathvariant="normal">{s}</mi>'
half = '<mfrac><mn>1</mn><mn>2</mn></mfrac>'
one = '<mi>𝟙</mi>'; rv = '<mi>𝒓</mi>'; nv = '<mi>𝒏</mi>'; sv = '<mi>𝝈</mi>'
rho_qubit = f'<mi>ρ</mi><mo>=</mo>{half}<mo stretchy="false">(</mo>{one}<mo>+</mo>{rv}<mo>⋅</mo>{sv}<mo stretchy="false">)</mo>'
E_qubit = f'<mi>E</mi><mo>=</mo>{half}<mo stretchy="false">(</mo>{one}<mo>+</mo>{nv}<mo>⋅</mo>{sv}<mo stretchy="false">)</mo>'
eq1 = M('<mrow><mi>p</mi><mo stretchy="false">(</mo><mi>E</mi><mo lspace="0.2em" rspace="0.2em">|</mo><mi>ρ</mi><mo stretchy="false">)</mo>'
        '<mo>=</mo><mi>tr</mi><mo stretchy="false">(</mo><mi>ρ</mi><mi>E</mi><mo stretchy="false">)</mo></mrow>', True)
eq2 = M('<mrow><mi>tr</mi><mo stretchy="false">(</mo><mi>ρ</mi><mi>E</mi><mo stretchy="false">)</mo><mo>=</mo>' + half +
        f'<mrow><mo stretchy="false">(</mo><mn>1</mn><mo>+</mo>{rv}<mo>⋅</mo>{nv}<mo stretchy="false">)</mo></mrow><mo>,</mo><mspace width="2em"/>'
        '<msub><mi>E</mi><mi>n</mi></msub><mo>=</mo><mrow><mo form="prefix">−</mo><mfrac><mrow><mi>μ</mi><msup><mi>e</mi><mn>4</mn></msup></mrow>'
        '<mrow><mn>2</mn><msup><mrow><mo stretchy="false">(</mo><mn>4</mn><mi>π</mi><msub><mi>ε</mi><mn>0</mn></msub><mo stretchy="false">)</mo></mrow><mn>2</mn></msup>'
        '<msup><mi>ℏ</mi><mn>2</mn></msup></mrow></mfrac><mfrac><mn>1</mn><msup><mi>n</mi><mn>2</mn></msup></mfrac></mrow><mo>≈</mo><mrow><mo form="prefix">−</mo>'
        '<mfrac><mrow><mn>13,6</mn><mspace width="0.17em"/>' + up('eV') + '</mrow><msup><mi>n</mi><mn>2</mn></msup></mfrac></mrow></mrow>', True)
evol = M(f'<mi>ρ</mi><mo>↦</mo><msub><mi>U</mi><mi>t</mi></msub><mspace width="0.1667em"/><mi>ρ</mi><mspace width="0.1667em"/><msubsup><mi>U</mi><mi>t</mi><mo>∗</mo></msubsup>')
Ut = M(f'<msub><mi>U</mi><mi>t</mi></msub><mo>=</mo><msup>{up("e")}<mrow><mo>−</mo>{up("i")}<mi>H</mi><mi>t</mi><mo>/</mo><mi>ℏ</mi></mrow></msup>')
absr = M(f'<mrow><mo stretchy="false" form="prefix">|</mo>{rv}<mo stretchy="false" form="postfix">|</mo></mrow>')

def svg_figure():
    # (a) Bloch disc: radius R px; r = 0.75 at 50 deg, n = e_x, r.n = 0.482, p = 0.741.
    R, cx, cy = 92, 128, 140
    rx, ry = cx + R*0.75*math.cos(math.radians(50)), cy - R*0.75*math.sin(math.radians(50))
    px = cx + R*0.482
    # (b) hydrogen, 26 px per eV above the break; n = 1 below a marked break.
    ox, oy, s = 420, 52, 26
    lv = {2: -3.40, 3: -1.511, 4: -0.85}
    ys = {k: oy - s*v for k, v in lv.items()}; y1 = 262
    hatch = ''.join(f'<line x1="{cx+R*math.cos(math.radians(a))}" y1="{cy-R*math.sin(math.radians(a))}" x2="{cx+(R+11)*math.cos(math.radians(a+6))}" y2="{cy-(R+11)*math.sin(math.radians(a+6))}"/>' for a in range(0, 360, 6))
    lad = ''.join(f'<line class="lad{k}" x1="{ox+14}" y1="{ys[k]:.1f}" x2="{ox+120}" y2="{ys[k]:.1f}"/>'
                  f'<text class="m" x="{ox+128}" y="{ys[k]+(4 if k != 4 else -1):.1f}"><tspan font-style="italic">n</tspan> = {k}</text>' for k in (2, 3, 4))
    return f'''<svg viewBox="0 0 640 300" role="img" aria-labelledby="figcap" class="fig">
 <g class="hatch">{hatch}</g>
 <line class="axis" x1="{cx-R-18}" y1="{cy}" x2="{cx+R+22}" y2="{cy}" marker-end="url(#ah)"/>
 <line class="axis" x1="{cx}" y1="{cy+R+16}" x2="{cx}" y2="{cy-R-22}" marker-end="url(#ah)"/>
 <circle class="boundary" cx="{cx}" cy="{cy}" r="{R}"/>
 <line class="effect" x1="{cx}" y1="{cy}" x2="{cx+R-4}" y2="{cy}" marker-end="url(#ahE)"/>
 <line class="effect thick" x1="{cx}" y1="{cy}" x2="{px:.1f}" y2="{cy}"/>
 <line class="proj" x1="{rx:.1f}" y1="{ry:.1f}" x2="{rx:.1f}" y2="{cy}"/>
 <line class="state" id="rvec" x1="{cx}" y1="{cy}" x2="{rx:.1f}" y2="{ry:.1f}" marker-end="url(#ahS)"/>
 <circle class="statefill" id="rdot" cx="{rx:.1f}" cy="{ry:.1f}" r="3.2"/>
 <text class="m b" id="rlab" x="{rx+6:.1f}" y="{ry-6:.1f}">r</text>
 <text class="m b" x="{cx+R+4}" y="{cy+16}">n</text>
 <text class="m" x="{cx+8}" y="{cy+17}"><tspan class="b">r</tspan>·<tspan class="b">n</tspan></text>
 <text class="t" x="{cx+R+14}" y="{cy+R-6}">reine</text><text class="t" x="{cx+R+14}" y="{cy+R+9}">Zustände</text>
 <line class="leader" x1="{cx+R+12}" y1="{cy+R-12}" x2="{cx+R*math.cos(math.radians(-40)):.1f}" y2="{cy+R*math.sin(math.radians(40)):.1f}"/>
 <text class="t" x="18" y="22">(a)</text><text class="t" x="{ox-60}" y="22">(b)</text>
 <line class="axis" x1="{ox}" y1="{oy+s*3.62}" x2="{ox}" y2="{oy-30}" marker-end="url(#ah)"/>
 <line class="axis" x1="{ox}" y1="{y1-26}" x2="{ox}" y2="{y1+12}"/>
 <path class="axis" d="M{ox-7},{oy+s*3.62+8} l14,-5 M{ox-7},{oy+s*3.62+15} l14,-5"/>
 <text class="m" x="{ox-6}" y="{oy-32}" text-anchor="end" font-style="italic">E</text>
 <text class="m" x="{ox-8}" y="{oy+4}" text-anchor="end">0</text>
 {lad}
 <line class="lad1" x1="{ox+14}" y1="{y1}" x2="{ox+120}" y2="{y1}"/>
 <text class="m" x="{ox+128}" y="{y1+4}"><tspan font-style="italic">n</tspan> = 1</text>
 <line class="energy" x1="{ox+45}" y1="{ys[3]+2:.1f}" x2="{ox+45}" y2="{ys[2]-7:.1f}" marker-end="url(#ahN)"/>
 <text class="m" x="{ox+53}" y="{(ys[2]+ys[3])/2+5:.1f}">1,89 eV</text>
 <text class="m" x="{ox-8}" y="{ys[2]+4:.1f}" text-anchor="end">−3,40 eV</text>
 <text class="m" x="{ox-8}" y="{y1+4}" text-anchor="end">−13,6 eV</text>
 <defs>
  <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" class="ah-ink"/></marker>
  <marker id="ahS" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,1 L10,5 L0,9 z" class="ah-state"/></marker>
  <marker id="ahE" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,1 L10,5 L0,9 z" class="ah-effect"/></marker>
  <marker id="ahN" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto"><path d="M0,1 L10,5 L0,9 z" class="ah-energy"/></marker>
 </defs>
</svg>'''

COMMON_CSS = r'''
*{box-sizing:border-box}
html{background:var(--c-paper);color:var(--c-ink)}
body{margin:0;font-family:var(--f-text);font-size:var(--fs-body);line-height:var(--lh);font-variant-numeric:var(--num,normal);
 hyphens:auto;-webkit-hyphens:auto;text-rendering:optimizeLegibility}
math{font-family:'PKG Math',math;font-size:1em}
math[display=block]{margin:.9em 0;overflow-x:auto;overflow-y:hidden;max-width:100%}
a{color:var(--c-link);text-underline-offset:.15em;text-decoration-thickness:1px}
a:focus-visible,button:focus-visible,input:focus-visible,summary:focus-visible{outline:2px solid var(--c-link);outline-offset:2px}
.page{display:grid;grid-template-columns:[full-start] minmax(1rem,1fr) [body-start] minmax(0,var(--body-w)) [body-end] var(--gutter) [margin-start] var(--margin-w) [margin-end] minmax(1rem,1fr) [full-end];padding:2.5rem 0 3rem}
.page>*{grid-column:body}
.wide{grid-column:body-start/margin-end}
p{margin:0}
p+p{text-indent:1.5em}
.sidenote,.marginblock{float:right;clear:right;width:var(--margin-w);margin-right:calc(-1*(var(--margin-w) + var(--gutter)));
 font-size:var(--fs-note);line-height:1.4;text-indent:0;margin-top:.2em}
.snref{font-size:.7em;vertical-align:super;line-height:0;color:var(--c-accent);font-family:var(--f-label)}
figure{margin:1.4rem 0}
.fig{width:100%;height:auto;display:block}
.fig text{font-size:14px;fill:var(--c-ink)}
.fig .t{font-family:var(--f-label);font-style:var(--fig-label-style,normal);font-size:13px}
.fig .m{font-family:'PKG Math',math}
.fig .b{font-weight:700;font-style:italic}
.fig .axis,.fig .leader{stroke:var(--c-ink);stroke-width:1;fill:none}
.fig .leader{stroke-width:.6}
.fig .boundary{stroke:var(--c-ink);stroke-width:1.4;fill:none}
.fig .hatch line{stroke:var(--c-hatch,var(--c-environment));stroke-width:.8}
.fig .state{stroke:var(--c-state);stroke-width:2}.fig .statefill{fill:var(--c-state)}
.fig .effect{stroke:var(--c-effect);stroke-width:2}.fig .effect.thick{stroke-width:4.5}
.fig .proj{stroke:var(--c-ink);stroke-width:.8;stroke-dasharray:3 3}
.fig .energy{stroke:var(--c-energy);stroke-width:3.4}
.fig .lad1{stroke:var(--c-ladder1);stroke-width:2.6}.fig .lad2{stroke:var(--c-ladder2);stroke-width:2.6}
.fig .lad3{stroke:var(--c-ladder3);stroke-width:2.6}.fig .lad4{stroke:var(--c-ladder4);stroke-width:2.6}
.ah-ink{fill:var(--c-ink)}.ah-state{fill:var(--c-state)}.ah-effect{fill:var(--c-effect)}.ah-energy{fill:var(--c-energy)}
figcaption{font-size:var(--fs-small);line-height:1.45}
.figlabel{font-family:var(--f-label);font-weight:600;margin-right:.6em}
/* control: one slider + live readout, shared component */
.control{display:flex;gap:1rem;align-items:center;font-family:var(--f-label);font-size:var(--fs-small);margin:.6rem 0 0}
.control input[type=range]{accent-color:var(--c-state);width:12rem}
.readout{font-variant-numeric:tabular-nums;min-width:7.5em;padding:.1em .5em;border:1px solid var(--c-rule);border-radius:3px}
details.zoom>summary{cursor:pointer;list-style:none}
details.zoom>summary::-webkit-details-marker{display:none}
@media (max-width:62rem){.page{grid-template-columns:1rem minmax(0,1fr) 1rem}.page>*,.wide,.chapno{grid-column:2;grid-row:auto}
 .sidenote,.marginblock{float:none;display:block;width:auto;margin:.6rem 0 .6rem 1.5rem}}
'''
PKG_CSS = {
 1: r'''
h1{font-family:var(--f-label);font-weight:600;font-size:var(--fs-h1);line-height:1.15;color:var(--c-accent);margin:0}
.chapno{grid-column:margin;grid-row:1;font-family:var(--f-label);font-weight:600;font-size:3rem;line-height:1;color:var(--c-accent)}
.kicker{font-family:var(--f-label);color:var(--c-accent);font-size:var(--fs-small);margin:.2rem 0 1.2rem}
.sidenote{font-family:var(--f-label)}
.postulate{border-left:3px solid var(--c-accent);padding:.15rem 0 .15rem 1.1rem;margin:1.3rem 0}
.postulate .head{font-family:var(--f-label);color:var(--c-accent);display:block;margin-bottom:.3rem}
.postulate .head b{font-weight:600;margin-right:.7em}
details.zoom{margin:1.4rem 0;position:relative}
details.zoom::after{content:"";position:absolute;top:0;bottom:0;right:calc(-1*var(--gutter) + .8rem);width:2px;background:var(--c-accent)}
details.zoom>summary{font-family:var(--f-label);font-weight:600;color:var(--c-accent)}
details.zoom>summary .sub{font-weight:400;margin-left:.4em}
details.zoom .dep{display:block;font-family:var(--f-label);font-size:var(--fs-note);color:var(--c-accent);margin:.1rem 0 .3rem}
details.zoom .ret{font-family:var(--f-label);font-weight:600;font-size:var(--fs-note);color:var(--c-accent)}
figcaption .lead{font-weight:700}
''',
 2: r'''
header{text-align:center;margin-bottom:1.2rem}
.chapno{font-variant:all-small-caps;letter-spacing:.08em;color:var(--c-accent);font-size:1.05rem}
h1{font-weight:400;font-size:var(--fs-h1);line-height:1.15;margin:.1rem 0}
.kicker{font-style:italic;font-size:var(--fs-small)}
.snref{font-family:var(--f-text)}
.postulate{border-top:1px solid var(--c-accent);border-bottom:1px solid var(--c-accent);padding:.6rem 0;margin:1.3rem 0}
.postulate .head{font-variant:all-small-caps;letter-spacing:.06em;color:var(--c-accent);margin-right:.5em}
details.zoom{margin:1.4rem 0;position:relative}
details.zoom::after{content:"";position:absolute;top:0;bottom:0;right:calc(-1*var(--gutter) + .8rem);width:1.5px;background:var(--c-accent)}
details.zoom>summary{display:inline}
details.zoom .lab,details.zoom .ret{font-variant:all-small-caps;letter-spacing:.06em;color:var(--c-accent)}
details.zoom .dep{font-style:italic;font-size:var(--fs-small)}
.figlabel{font-family:var(--f-text);font-weight:400;font-variant:small-caps}
figcaption .lead{font-style:italic}
''',
 3: r'''
h1{font-weight:400;font-style:italic;font-size:var(--fs-h1);line-height:1.15;margin:0}
.chapno{grid-column:margin;grid-row:1;font-size:2.6rem;line-height:1;color:var(--c-accent)}
.kicker{font-variant:all-small-caps;letter-spacing:.07em;margin:.2rem 0 1.2rem}
.snref{font-family:var(--f-text);color:var(--c-ink)}
.postulate{border:1px solid var(--c-ink);padding:.6rem .9rem;margin:1.3rem 0}
.postulate .head{font-weight:600;font-variant:all-small-caps;letter-spacing:.05em;margin-right:.5em}
.marginblock{background:var(--c-track2);padding:.6rem .7rem}
details.zoom>summary{font-weight:600;color:var(--c-accent);margin-bottom:.3rem}
details.zoom .dep{font-style:italic}details.zoom .ret{font-weight:600}
.figlabel{font-family:var(--f-text);font-weight:400;font-variant:small-caps}
figcaption .lead{font-style:italic}
.fig{--fig-label-style:italic}
''',
}

def html(n):
    sc = SCALE[n]; mode_light = 'screen-light'; mode_dark = 'screen-dark'
    num = 'oldstyle-nums' if n == 2 else 'normal'
    root = (f":root{{--f-text:{sc['text']};--f-label:{sc['label']};--fs-body:{sc['body']};--lh:{sc['lh']};--fs-small:{sc['small']};"
            f"--fs-note:{sc['note']};--fs-h1:{sc['h1']};--body-w:{sc['body_w']};--margin-w:{sc['margin_w']};--gutter:{sc['gutter']};--num:{num};"
            f"{modevars(n, mode_light)}}}\n"
            f"@media (prefers-color-scheme:dark){{:root:not([data-theme=light]){{{modevars(n, mode_dark)}}}}}\n"
            f":root[data-theme=dark]{{{modevars(n, mode_dark)}}}\n")
    title = {1: 'PKG-1 Times and MathTime', 2: 'PKG-2 Baskerville Companion', 3: 'PKG-3 Lab Notebook'}[n]
    if n == 2:
        head = '<header class="wide" style="grid-column:body"><div class="chapno">Vorlesung 6</div><h1>Die Bornsche Regel</h1><div class="kicker">Zoomstufe 1 – ein einzelnes Quantensystem</div></header>'
    else:
        head = '<div class="chapno">6</div><h1>Die Bornsche Regel</h1><div class="kicker">Zoomstufe 1 – ein einzelnes Quantensystem</div>'
    sn = (f'<span class="snref">1</span><span class="sidenote"><span class="snref">1</span> Für ein Qubit ist jeder Dichteoperator von der Form '
          f'{M(rho_qubit)} mit {M(absr[6:-7] + "<mo>≤</mo><mn>1</mn>")}. Reine Zustände liegen auf dem Rand, {M(absr[6:-7] + "<mo>=</mo><mn>1</mn>")}.</span>')
    zoom_body = (f'Allgemein ist ein Zustand ein positives, normiertes lineares Funktional {M("<mi>ω</mi>")} auf der Algebra '
                 f'{M("<mi>ℬ</mi><mo stretchy=false>(</mo><mi>ℋ</mi><mo stretchy=false>)</mo>")}, also '
                 f'{M("<mi>ω</mi><mo stretchy=false>(</mo><msup><mi>A</mi><mo>∗</mo></msup><mi>A</mi><mo stretchy=false>)</mo><mo>≥</mo><mn>0</mn>")} und '
                 f'{M("<mi>ω</mi><mo stretchy=false>(</mo>" + one + "<mo stretchy=false>)</mo><mo>=</mo><mn>1</mn>")}. Die <em>normalen</em> Zustände sind genau die Funktionale '
                 f'{M("<mi>ω</mi><mo stretchy=false>(</mo><mi>A</mi><mo stretchy=false>)</mo><mo>=</mo><mi>tr</mi><mo stretchy=false>(</mo><mi>ρ</mi><mi>A</mi><mo stretchy=false>)</mo>")} '
                 f'mit einem Dichteoperator {M("<mi>ρ</mi>")} der Spurklasse. Ist {M("<mi>dim</mi><mspace width=0.1667em /><mi>ℋ</mi><mo>=</mo><mi>∞</mi>")}, so gibt es auch singuläre Zustände. <span class="ret">Zurück zum Kern.</span> Im Folgenden genügen Dichteoperatoren.')
    dep = '<span class="dep">Voraussetzung: Kern 6.1. Gebraucht erst bei unendlich vielen Freiheitsgraden.</span> '
    if n == 1:
        zoom = (f'<details class="zoom" open id="tief-6.V2"><summary>Vertiefung 6.V2 <span class="sub">Zustände als Funktionale</span></summary>{dep}{zoom_body}</details>')
    elif n == 2:
        zoom = (f'<details class="zoom" open id="tief-6.V2"><summary><span class="lab">Vertiefung 6.V2</span> <i>Zustände als Funktionale.</i></summary>{dep}{zoom_body}</details>')
    else:
        zoom = (f'<details class="zoom marginblock" open id="tief-6.V2"><summary>Vertiefung 6.V2</summary><em>Zustände als Funktionale.</em> {dep}{zoom_body}</details>')
    post = (f'<div class="postulate" role="note"><span class="head"><b>Postulat P4</b>{"" if n != 1 else ""}</span>' if n == 1 else '<div class="postulate" role="note"><span class="head">Postulat P4</span>')
    post += ('Bornsche Regel</span>' if False else '')
    if n == 1:
        post = f'<div class="postulate" role="note"><span class="head"><b>Postulat P4</b>Bornsche Regel</span>'
    else:
        post = f'<div class="postulate" role="note"><span class="head">Postulat P4</span><em>Bornsche Regel.</em> '
    post += (f'Wird ein System im Zustand {M("<mi>ρ</mi>")} präpariert und mit dem Effekt {M("<mi>E</mi>")} getestet, so spricht der Detektor mit der Wahrscheinlichkeit'
             f'{eq1}an. Insbesondere gilt {M("<mn>0</mn><mo>≤</mo><mi>p</mi><mo>≤</mo><mn>1</mn>")}, und der triviale Effekt {M("<mi>E</mi><mo>=</mo>" + one)} spricht immer an.</div>')
    body = f'''{head}
<p>Eine physikalische Theorie liefert Daten für drei Dinge: Präparationen, Dynamik und Messungen. Eine Präparation nennen wir „Zustand“; im Quantenfall beschreiben wir sie durch einen Dichteoperator {M("<mi>ρ</mi><mo>≥</mo><mn>0</mn>")} mit {M("<mi>tr</mi><mspace width=0.1667em /><mi>ρ</mi><mo>=</mo><mn>1</mn>")}.{sn} Ein Detektor, der „klick“ macht oder schweigt, wird durch einen Effekt {M("<mi>E</mi>")} mit {M("<mn>0</mn><mo>≤</mo><mi>E</mi><mo>≤</mo>" + one)} beschrieben. Die Theorie sagt nur Wahrscheinlichkeiten voraus, und zwar genau eine Zahl für jedes Paar aus Zustand und Effekt.</p>
{post}
<p>Für ein Qubit lässt sich die Regel zeichnen (<a href="#fig6-1">Abb. 6.1</a>a). Mit {M(rho_qubit)} und dem Projektor {M(E_qubit)}, {M(absr[6:-7] + "<mo>=</mo><mn>1</mn>")}, folgt</p>
{eq2}
<p style="text-indent:0">Die Wahrscheinlichkeit ist also die Projektion des Bloch-Vektors auf die Richtung des Detektors, verschoben und halbiert. Die Zeitentwicklung {evol} mit {Ut} dreht den Vektor; sie ändert {absr} nicht.</p>
<figure id="fig6-1">{svg_figure()}
<div class="control"><label for="theta">Winkel von <b><i>r</i></b></label><input id="theta" type="range" min="0" max="180" value="50" step="1"><span class="readout" id="pout">p = 0,741</span></div>
<figcaption id="figcap"><span class="figlabel">Abb. 6.1</span><span class="lead">Die Wahrscheinlichkeit ist eine Projektion.</span> (a) Zustand <b><i>r</i></b> im Bloch-Kreis (Schnitt durch die Bloch-Kugel), Detektorrichtung <b><i>n</i></b>; die Projektion liefert {M("<mi>p</mi><mo>=</mo>" + half + "<mo stretchy=false>(</mo><mn>1</mn><mo>+</mo>" + rv + "<mo>⋅</mo>" + nv + "<mo stretchy=false>)</mo>")}. Außerhalb des Kreises liegen keine Zustände (schraffiert). (b) Wasserstoff: die Niveaus {M("<msub><mi>E</mi><mi>n</mi></msub>")} für {M("<mi>n</mi><mo>=</mo><mn>1</mn><mo>,</mo><mo>…</mo><mo>,</mo><mn>4</mn>")}; der Übergang 3 → 2 setzt 1,89 eV frei.</figcaption></figure>
{'<div>' if n == 3 else ''}{zoom}
<p>Messgeräte sind also Elemente des Dualraums: ein Effekt ordnet jedem Zustand eine Zahl zwischen 0 und 1 zu, linear in {M("<mi>ρ</mi>")}. Das ist der Grund, warum Mischungen von Präparationen zu Mischungen von Wahrscheinlichkeiten führen.</p>{'</div>' if n == 3 else ''}'''
    script = r'''<script>
try{if(location.hash==='#dark')document.documentElement.dataset.theme='dark';if(location.hash==='#light')document.documentElement.dataset.theme='light'}catch(e){}
(function(){var R=92,cx=128,cy=140,s=document.getElementById('theta'),o=document.getElementById('pout');
var v=document.getElementById('rvec'),d=document.getElementById('rdot'),l=document.getElementById('rlab'),pr=document.querySelector('.fig .proj'),th=document.querySelector('.fig .effect.thick');
function up(){var a=s.value*Math.PI/180,x=cx+R*.75*Math.cos(a),y=cy-R*.75*Math.sin(a),rn=.75*Math.cos(a),p=(1+rn)/2;
v.setAttribute('x2',x);v.setAttribute('y2',y);d.setAttribute('cx',x);d.setAttribute('cy',y);l.setAttribute('x',x+6);l.setAttribute('y',y-6);
pr.setAttribute('x1',x);pr.setAttribute('y1',y);pr.setAttribute('x2',x);th.setAttribute('x2',cx+R*rn);
o.textContent='p = '+p.toFixed(3).replace('.',',');}
s.addEventListener('input',up);up();})();
</script>'''
    return f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<!-- Generated by make_html.py (design-packages-A, 2026-10-09). Tokens from ../tokens-pkg-{n}.json (screen-light / screen-dark).
     Fonts are loaded from local files on this machine and are NOT embedded. -->
<style>
{''.join(FONTS[n])}
{root}{COMMON_CSS}{PKG_CSS[n]}@media (max-width:62rem){{.chapno{{grid-column:2;grid-row:auto}}.control{{flex-wrap:wrap}}}}
</style></head>
<body><main class="page">
{body}
</main>
{script}
</body></html>
'''

if __name__ == '__main__':
    for n in (1, 2, 3):
        with open(os.path.join(HERE, f'pkg{n}.html'), 'w') as f:
            f.write(html(n))
    print('ok')
