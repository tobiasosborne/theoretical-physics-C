r"""Single source of colour truth for PKG-4 and PKG-5 (design-packages-B lane, 2026-10-09).

Each package's palette is authored ONCE below in OKLCH, per mode. This script
  1. converts OKLCH -> sRGB hex (Ottosson 2020 matrices, https://bottosson.github.io/posts/oklab/),
     reducing chroma until the colour is inside the sRGB gamut;
  2. writes a DTCG-2025.10-style token file  pkgN.tokens.json  (colour $value objects with
     colorSpace/components/hex; modes as sibling groups; see README note in the package files);
  3. emits the per-target palettes:  pkgN-tokens.sty (xcolor \definecolor),  pkgN-tokens.css
     (custom properties, light + dark via prefers-color-scheme),  pkgN-tokens.glsl (vec3 consts,
     linear-sRGB for three.js shaders);
  4. measures WCAG 2.2 contrast against paper, OKLab lightness steps (greyscale proxy), and
     min pairwise OKLab distance under Machado-Oliveira-Fernandes 2009 severity-1 deutan/protan
     simulation (same matrices as ../design-research/palette_cvd_check.py), and writes
     pkgN-measurements.md.
Run:  python3 -I build_tokens.py   (no third-party packages)
"""
import math, itertools, json, os
HERE = os.path.dirname(os.path.abspath(__file__))

def oklch_to_lin(L, C, h):
    a, b = C*math.cos(math.radians(h)), C*math.sin(math.radians(h))
    l_ = L + 0.3963377774*a + 0.2158037573*b
    m_ = L - 0.1055613458*a - 0.0638541728*b
    s_ = L - 0.0894841775*a - 1.2914855480*b
    l, m, s = l_**3, m_**3, s_**3
    return [ 4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
            -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
            -0.0041960863*l - 0.7034186147*m + 1.7076147010*s]

def in_gamut(rgb, eps=1e-4): return all(-eps <= x <= 1+eps for x in rgb)

def fit(L, C, h):
    c = C
    while c > 0 and not in_gamut(oklch_to_lin(L, c, h)): c -= 0.002
    return L, max(c, 0), h

def enc(x):
    x = min(max(x, 0.0), 1.0)
    return 12.92*x if x <= 0.0031308 else 1.055*x**(1/2.4) - 0.055
def to_hex(lin): return '#' + ''.join(f'{round(enc(x)*255):02X}' for x in lin)
def s2l(c):
    c /= 255; return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
def hex_lin(h): h = h.lstrip('#'); return [s2l(int(h[i:i+2], 16)) for i in (0, 2, 4)]
def lum(lin): return 0.2126*lin[0] + 0.7152*lin[1] + 0.0722*lin[2]
def contrast(h1, h2):
    a, b = sorted([lum(hex_lin(h1)), lum(hex_lin(h2))], reverse=True)
    return (a+0.05)/(b+0.05)
def oklab(lin):
    r, g, b = [min(max(x, 0), 1) for x in lin]
    l = 0.4122214708*r+0.5363325363*g+0.0514459929*b
    m = 0.2119034982*r+0.6806995451*g+0.1073969566*b
    s = 0.0883024619*r+0.2817188376*g+0.6299787005*b
    l, m, s = [x**(1/3) for x in (l, m, s)]
    return (0.2104542553*l+0.7936177850*m-0.0040720468*s,
            1.9779984951*l-2.4285922050*m+0.4505937099*s,
            0.0259040371*l+0.7827717662*m-0.8086757660*s)
CVD = {'deutan': [[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
       'protan': [[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]]}
def sim(lin, k): m = CVD[k]; return [sum(m[i][j]*lin[j] for j in range(3)) for i in range(3)]

MODES = ['print-light', 'screen-light', 'screen-dark', 'video']
DATA_ROLES = ['state', 'effect', 'dynamics', 'environment']

# ------------------------------------------------------------------ palettes (the only hand-authored numbers)
# (L, C, h) per mode, in the order print-light, screen-light, screen-dark, video
PKG = {
 'pkg4': {
  'title': 'PKG-4 Tokens first, dark-ground video',
  'roles': {
   'paper':       [(1.000,0.000,0),   (0.985,0.004,230), (0.195,0.012,240), (0.165,0.014,240)],
   'paper-alt':   [(0.965,0.006,230), (0.955,0.008,230), (0.240,0.014,240), (0.215,0.016,240)],
   'ink':         [(0.210,0.020,245), (0.230,0.020,245), (0.920,0.008,230), (0.950,0.006,230)],
   'ink-muted':   [(0.470,0.015,245), (0.480,0.015,245), (0.740,0.012,230), (0.760,0.010,230)],
   'rule':        [(0.820,0.010,240), (0.840,0.010,240), (0.380,0.014,240), (0.360,0.014,240)],
   'accent':      [(0.450,0.065,236), (0.450,0.065,236), (0.780,0.090,222), (0.800,0.095,222)],
   'link':        [(0.460,0.100,232), (0.460,0.100,232), (0.800,0.100,218), (0.820,0.100,218)],
   'state':       [(0.350,0.090,240), (0.350,0.090,240), (0.800,0.110,226), (0.820,0.120,226)],
   'dynamics':    [(0.505,0.170,22),  (0.505,0.170,22),  (0.700,0.160,24),  (0.720,0.170,24)],
   'effect':      [(0.660,0.140,72),  (0.660,0.140,72),  (0.870,0.140,86),  (0.880,0.150,86)],
   'environment': [(0.840,0.008,90),  (0.840,0.008,90),  (0.420,0.010,240), (0.400,0.010,240)],
  }},
 'pkg5': {
  'title': 'PKG-5 Explorable textbook (one scene, three views)',
  'roles': {
   # figure ground is light in ALL modes ('plate'); only the page chrome goes dark in screen-dark
   'paper':       [(1.000,0.000,0),   (0.990,0.003,90),  (0.205,0.006,90),  (0.982,0.004,90)],
   'plate':       [(1.000,0.000,0),   (0.990,0.003,90),  (0.975,0.004,90),  (0.982,0.004,90)],
   'ink':         [(0.200,0.000,0),   (0.220,0.004,90),  (0.910,0.006,90),  (0.200,0.000,0)],
   'ink-muted':   [(0.480,0.006,90),  (0.490,0.006,90),  (0.720,0.006,90),  (0.480,0.006,90)],
   'rule':        [(0.820,0.004,90),  (0.840,0.004,90),  (0.400,0.006,90),  (0.820,0.004,90)],
   'accent':      [(0.200,0.000,0),   (0.220,0.004,90),  (0.910,0.006,90),  (0.200,0.000,0)],
   'link':        [(0.300,0.010,90),  (0.300,0.010,90),  (0.860,0.010,90),  (0.300,0.010,90)],
   'state':       [(0.360,0.110,245), (0.360,0.110,245), (0.360,0.110,245), (0.360,0.110,245)],
   'effect':      [(0.515,0.110,165), (0.515,0.110,165), (0.515,0.110,165), (0.515,0.110,165)],
   'dynamics':    [(0.665,0.150,58),  (0.665,0.150,58),  (0.665,0.150,58),  (0.665,0.150,58)],
   'environment': [(0.840,0.006,90),  (0.840,0.006,90),  (0.840,0.006,90),  (0.840,0.006,90)],
  }},
}

def build(key, spec):
    out = {'$extensions': {'org.tpc.note': 'DTCG 2025.10 colour values (https://www.designtokens.org/); the four modes are sibling groups under each role, not the 2025.10 resolver syntax'},
           '$description': spec['title'] + ' -- generated by build_tokens.py; edit the OKLCH source there',
           'color': {}}
    table = {}
    for role, vals in spec['roles'].items():
        out['color'][role] = {}
        for mode, (L, C, h) in zip(MODES, vals):
            L, C, h = fit(L, C, h)
            lin = oklch_to_lin(L, C, h); hx = to_hex(lin)
            table[(role, mode)] = (L, C, h, hx)
            out['color'][role][mode] = {'$type': 'color', '$value': {
                'colorSpace': 'oklch', 'components': [round(L, 3), round(C, 3), round(h, 1)], 'hex': hx}}
    json.dump(out, open(os.path.join(HERE, f'{key}.tokens.json'), 'w'), indent=1)

    # --- .sty (print-light only, plus video names for figures that must match video)
    sty = [f'% {key}-tokens.sty -- GENERATED by build_tokens.py from {key}.tokens.json. Do not edit.']
    for role in spec['roles']:
        for mode, pre in (('print-light', 'tpc'), ('video', 'tpcvid')):
            hx = table[(role, mode)][3]
            sty.append(f'\\definecolor{{{pre}-{role}}}{{HTML}}{{{hx[1:]}}}')
    open(os.path.join(HERE, f'{key}-tokens.sty'), 'w').write('\n'.join(sty) + '\n')

    # --- .css (screen-light default, screen-dark under prefers-color-scheme, video as a class)
    def block(mode):
        return '\n'.join(f'  --c-{r}: {table[(r,mode)][3]}; /* oklch({table[(r,mode)][0]:.3f} {table[(r,mode)][1]:.3f} {table[(r,mode)][2]:.0f}) */'
                         for r in spec['roles'])
    css = (f'/* {key}-tokens.css -- GENERATED by build_tokens.py. Do not edit. */\n'
           f':root {{\n{block("screen-light")}\n}}\n'
           f'@media (prefers-color-scheme: dark) {{\n:root:not([data-theme="light"]) {{\n{block("screen-dark")}\n}}\n}}\n'
           f':root[data-theme="dark"] {{\n{block("screen-dark")}\n}}\n'
           f'.mode-video {{\n{block("video")}\n}}\n'
           f'@media print {{\n:root {{\n{block("print-light")}\n}}\n}}\n')
    open(os.path.join(HERE, f'{key}-tokens.css'), 'w').write(css)

    # --- .glsl (linear sRGB, for three.js ShaderMaterial; video mode = the 3D scene mode for pkg4)
    gl_mode = 'video'
    glsl = [f'// {key}-tokens.glsl -- GENERATED by build_tokens.py (mode {gl_mode}, linear sRGB). Do not edit.']
    for r in spec['roles']:
        lin = oklch_to_lin(*table[(r, gl_mode)][:3])
        glsl.append(f'const vec3 C_{r.upper().replace("-","_")} = vec3({lin[0]:.4f}, {max(lin[1],0):.4f}, {max(lin[2],0):.4f});')
    open(os.path.join(HERE, f'{key}-tokens.glsl'), 'w').write('\n'.join(glsl) + '\n')

    # --- measurements
    md = [f'<!-- GENERATED by build_tokens.py on each run; do not hand-edit. -->', f'# {spec["title"]}: token measurements', '']
    md.append('| role | mode | OKLCH (L C h) | hex | contrast vs paper |')
    md.append('|---|---|---|---|---|')
    for role in spec['roles']:
        for mode in MODES:
            L, C, h, hx = table[(role, mode)]
            paper = table[('plate' if (key == 'pkg5' and role in DATA_ROLES) else 'paper', mode)][3] if 'plate' in spec['roles'] else table[('paper', mode)][3]
            md.append(f'| {role} | {mode} | {L:.3f} {C:.3f} {h:.0f} | `{hx}` | {contrast(hx, paper):.2f} |')
    md += ['', '| mode | data-role L values | min dL (greyscale proxy) | min dE_OK normal | deutan | protan |', '|---|---|---|---|---|---|']
    for mode in MODES:
        hexes = {r: table[(r, mode)][3] for r in DATA_ROLES}
        Ls = {r: oklab(hex_lin(h))[0] for r, h in hexes.items()}
        dL = min(abs(Ls[a]-Ls[b]) for a, b in itertools.combinations(Ls, 2))
        res = {}
        for k in ('normal', 'deutan', 'protan'):
            labs = {r: oklab(hex_lin(h) if k == 'normal' else sim(hex_lin(h), k)) for r, h in hexes.items()}
            res[k] = min(math.dist(labs[a], labs[b]) for a, b in itertools.combinations(labs, 2))
        md.append(f'| {mode} | ' + ', '.join(f'{r} {Ls[r]:.2f}' for r in DATA_ROLES) +
                  f' | {dL:.3f} | {res["normal"]:.3f} | {res["deutan"]:.3f} | {res["protan"]:.3f} |')
    open(os.path.join(HERE, f'{key}-measurements.md'), 'w').write('\n'.join(md) + '\n')
    return table

if __name__ == '__main__':
    for k, s in PKG.items():
        t = build(k, s)
        print(k)
        for mode in MODES:
            p = t[('paper', mode)][3]
            print(' ', mode, ' '.join(f"{r}={t[(r,mode)][3]}({contrast(t[(r,mode)][3], p):.2f})" for r in ['ink','link','accent','state','dynamics','effect','environment']))
