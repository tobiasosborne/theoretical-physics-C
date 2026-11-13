#!/usr/bin/env python3
"""Colour tokens for design packages PKG-1..3 (design-packages-A lane, 2026-10-09).

Authoring space is OKLCH (Ottosson, https://bottosson.github.io/posts/oklab/).  Each role is
given per mode (print-light, screen-light, screen-dark, video).  The script gamut-maps to sRGB by
chroma reduction at fixed L and h, prints hex values, WCAG 2.2 contrast against the mode's paper
(https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio), the minimum OKLab lightness gap between the
data roles (greyscale budget, palette-measurements.md) and the minimum pairwise OKLab distance under
Machado et al. (2009) severity-100 deutan/protan simulation (matrices as in
design-research/palette_cvd_check.py).

Run:  python3 -I tokens.py > tokens-tables.md      (also writes tokens-pkg{1,2,3}.json, DTCG-style)
"""
import json, math, itertools, os, sys

def s2l(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def l2s(c):
    c = min(max(c, 0.0), 1.0)
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
def hex2lin(h):
    h = h.lstrip('#'); return [s2l(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)]
def lin2hex(rgb):
    return '#' + ''.join(f'{round(l2s(x) * 255):02X}' for x in rgb)
def lin2oklab(rgb):
    r, g, b = [min(max(x, 0), 1) for x in rgb]
    l = 0.4122214708*r + 0.5363325363*g + 0.0514459929*b
    m = 0.2119034982*r + 0.6806995451*g + 0.1073969566*b
    s = 0.0883024619*r + 0.2817188376*g + 0.6299787005*b
    l, m, s = [x ** (1 / 3) for x in (l, m, s)]
    return (0.2104542553*l + 0.7936177850*m - 0.0040720468*s,
            1.9779984951*l - 2.4285922050*m + 0.4505937099*s,
            0.0259040371*l + 0.7827717662*m - 0.8086757660*s)
def oklch2lin(L, C, h):
    a, b = C * math.cos(math.radians(h)), C * math.sin(math.radians(h))
    l_ = L + 0.3963377774*a + 0.2158037573*b
    m_ = L - 0.1055613458*a - 0.0638541728*b
    s_ = L - 0.0894841775*a - 1.2914855480*b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    return [4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
            -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
            -0.0041960863*l - 0.7034186147*m + 1.7076147010*s]
def in_gamut(rgb, eps=1e-6):
    return all(-eps <= x <= 1 + eps for x in rgb)
def resolve(spec):
    """spec is (L, C, h) or a hex string. Returns (L, C, h, hex, clipped)."""
    if isinstance(spec, str):
        L, a, b = lin2oklab(hex2lin(spec))
        return L, math.hypot(a, b), math.degrees(math.atan2(b, a)) % 360, spec.upper(), False
    L, C, h = spec
    if in_gamut(oklch2lin(L, C, h)):
        return L, C, h, lin2hex(oklch2lin(L, C, h)), False
    lo, hi = 0.0, C
    for _ in range(40):
        mid = (lo + hi) / 2
        if in_gamut(oklch2lin(L, mid, h)): lo = mid
        else: hi = mid
    return L, lo, h, lin2hex(oklch2lin(L, lo, h)), True
def lum(hexv):
    r, g, b = hex2lin(hexv); return 0.2126*r + 0.7152*g + 0.0722*b
def contrast(h1, h2):
    a, b = sorted([lum(h1), lum(h2)], reverse=True); return (a + 0.05) / (b + 0.05)
CVD = {'deutan': [[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
       'protan': [[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]]}
def sim(rgb, k):
    m = CVD[k]; return [sum(m[i][j]*rgb[j] for j in range(3)) for i in range(3)]

MODES = ['print-light', 'screen-light', 'screen-dark', 'video']
DATA = ['state', 'effect', 'energy']          # the greyscale-budgeted data roles

# ---------------------------------------------------------------- PKG-1: Whitney teal, re-stepped
P1 = {
 'ink':      {'print-light': '#000000', 'screen-light': (0.22, 0.012, 240), 'screen-dark': (0.93, 0.008, 230), 'video': (0.95, 0.006, 230)},
 'paper':    {'print-light': '#FFFFFF', 'screen-light': (0.990, 0.003, 100), 'screen-dark': (0.20, 0.014, 240), 'video': (0.155, 0.014, 240)},
 'rule':     {'print-light': (0.80, 0.0, 0), 'screen-light': (0.86, 0.006, 240), 'screen-dark': (0.36, 0.014, 240), 'video': (0.34, 0.014, 240)},
 'accent':   {'print-light': (0.45, 0.065, 238), 'screen-light': (0.45, 0.065, 238), 'screen-dark': (0.80, 0.075, 228), 'video': (0.82, 0.08, 225)},
 'link':     {'print-light': (0.47, 0.10, 232), 'screen-light': (0.47, 0.10, 232), 'screen-dark': (0.80, 0.10, 225), 'video': (0.82, 0.10, 225)},
 'state':    {'print-light': (0.36, 0.085, 245), 'screen-light': (0.38, 0.09, 245), 'screen-dark': (0.80, 0.09, 235), 'video': (0.80, 0.10, 232)},
 'effect':   {'print-light': (0.56, 0.12, 160), 'screen-light': (0.56, 0.12, 160), 'screen-dark': (0.72, 0.14, 162), 'video': (0.74, 0.15, 162)},
 'energy':   {'print-light': (0.76, 0.14, 75), 'screen-light': (0.74, 0.15, 72), 'screen-dark': (0.86, 0.15, 82), 'video': (0.88, 0.16, 85)},
 'environment': {'print-light': (0.62, 0.008, 90), 'screen-light': (0.62, 0.008, 90), 'screen-dark': (0.58, 0.008, 90), 'video': (0.56, 0.008, 90)},
 'highlight':{'print-light': (0.955, 0.055, 95), 'screen-light': (0.955, 0.055, 95), 'screen-dark': (0.30, 0.045, 95), 'video': (0.28, 0.04, 95)},
 'track2':   {'print-light': (0.965, 0.008, 230), 'screen-light': (0.965, 0.010, 230), 'screen-dark': (0.24, 0.016, 240), 'video': (0.20, 0.016, 240)},
}
P1_LADDER = [(0.30, 0.075, 245), (0.46, 0.10, 238), (0.62, 0.10, 228), (0.78, 0.085, 215)]
P1_LADDER_DARK = [(0.90, 0.06, 215), (0.76, 0.09, 225), (0.62, 0.10, 232), (0.48, 0.09, 240)]

# ---------------------------------------------------------------- PKG-2: rubricated book (Baskerville)
P2 = {
 'ink':      {'print-light': '#000000', 'screen-light': (0.24, 0.014, 60), 'screen-dark': (0.92, 0.012, 85), 'video': (0.94, 0.012, 85)},
 'paper':    {'print-light': '#FFFFFF', 'screen-light': (0.975, 0.012, 88), 'screen-dark': (0.21, 0.010, 60), 'video': '#141C26'},  # video ground = TJO 'Quantum Algorithms 2022' deck accent1
 'rule':     {'print-light': (0.78, 0.0, 0), 'screen-light': (0.84, 0.014, 80), 'screen-dark': (0.37, 0.012, 60), 'video': (0.34, 0.012, 60)},
 'accent':   {'print-light': (0.50, 0.15, 30), 'screen-light': (0.50, 0.15, 30), 'screen-dark': (0.74, 0.13, 35), 'video': (0.76, 0.14, 35)},
 'link':     {'print-light': (0.42, 0.09, 255), 'screen-light': (0.42, 0.09, 255), 'screen-dark': (0.80, 0.08, 250), 'video': (0.82, 0.08, 250)},
 'state':    {'print-light': (0.38, 0.10, 262), 'screen-light': (0.38, 0.10, 262), 'screen-dark': (0.78, 0.09, 258), 'video': (0.80, 0.10, 258)},
 'effect':   {'print-light': (0.56, 0.15, 30), 'screen-light': (0.56, 0.15, 30), 'screen-dark': (0.70, 0.15, 30), 'video': (0.72, 0.16, 30)},
 'energy':   {'print-light': (0.76, 0.13, 80), 'screen-light': (0.74, 0.13, 78), 'screen-dark': (0.86, 0.13, 85), 'video': (0.88, 0.14, 85)},
 'environment': {'print-light': (0.62, 0.015, 70), 'screen-light': (0.62, 0.015, 70), 'screen-dark': (0.58, 0.012, 70), 'video': (0.56, 0.012, 70)},
 'highlight':{'print-light': (0.950, 0.040, 88), 'screen-light': (0.935, 0.045, 88), 'screen-dark': (0.30, 0.035, 80), 'video': '#F2DC9B'},  # video gold = same deck accent3
 'track2':   {'print-light': (0.960, 0.010, 80), 'screen-light': (0.950, 0.014, 85), 'screen-dark': (0.25, 0.012, 60), 'video': (0.26, 0.025, 255)},
}
P2_LADDER = [(0.30, 0.09, 265), (0.46, 0.11, 262), (0.62, 0.10, 255), (0.78, 0.08, 245)]
P2_LADDER_DARK = [(0.90, 0.06, 245), (0.76, 0.09, 255), (0.62, 0.11, 260), (0.48, 0.11, 265)]

# ---------------------------------------------------------------- PKG-3: lab notebook (Tol high-contrast)
P3 = {
 'ink':      {'print-light': '#000000', 'screen-light': '#111111', 'screen-dark': (0.93, 0.0, 0), 'video': (0.95, 0.0, 0)},
 'paper':    {'print-light': '#FFFFFF', 'screen-light': '#FFFFFF', 'screen-dark': (0.19, 0.0, 0), 'video': (0.15, 0.0, 0)},
 'rule':     {'print-light': (0.80, 0.0, 0), 'screen-light': (0.85, 0.0, 0), 'screen-dark': (0.36, 0.0, 0), 'video': (0.34, 0.0, 0)},
 'accent':   {'print-light': '#004488', 'screen-light': '#004488', 'screen-dark': (0.78, 0.09, 250), 'video': (0.80, 0.10, 250)},
 'link':     {'print-light': '#004488', 'screen-light': '#004488', 'screen-dark': (0.78, 0.09, 250), 'video': (0.80, 0.10, 250)},
 'state':    {'print-light': '#004488', 'screen-light': '#004488', 'screen-dark': (0.78, 0.09, 250), 'video': (0.80, 0.10, 250)},
 'effect':   {'print-light': '#BB5566', 'screen-light': '#BB5566', 'screen-dark': (0.70, 0.13, 12), 'video': (0.72, 0.14, 12)},
 'energy':   {'print-light': '#DDAA33', 'screen-light': '#DDAA33', 'screen-dark': (0.84, 0.14, 84), 'video': (0.86, 0.15, 84)},
 'environment': {'print-light': '#000000', 'screen-light': '#111111', 'screen-dark': (0.93, 0.0, 0), 'video': (0.95, 0.0, 0)},
 'highlight':{'print-light': (0.955, 0.045, 90), 'screen-light': (0.955, 0.045, 90), 'screen-dark': (0.29, 0.04, 90), 'video': (0.27, 0.04, 90)},
 'track2':   {'print-light': (0.965, 0.0, 0), 'screen-light': (0.965, 0.0, 0), 'screen-dark': (0.24, 0.0, 0), 'video': (0.20, 0.0, 0)},
}
P3_LADDER = ['#002244', (0.46, 0.12, 252), (0.62, 0.11, 245), (0.78, 0.08, 235)]
P3_LADDER_DARK = [(0.90, 0.06, 235), (0.76, 0.09, 245), (0.62, 0.11, 250), (0.48, 0.12, 255)]

PKGS = {'PKG-1': (P1, P1_LADDER), 'PKG-2': (P2, P2_LADDER), 'PKG-3': (P3, P3_LADDER)}
DARK = {'PKG-1': P1_LADDER_DARK, 'PKG-2': P2_LADDER_DARK, 'PKG-3': P3_LADDER_DARK}

def table(name, pal, ladder):
    out = [f'### {name}', '', '| role | ' + ' | '.join(MODES) + ' |', '|---|' + '---|' * len(MODES)]
    res = {}
    for role, modes in pal.items():
        cells = []
        for m in MODES:
            L, C, h, hx, clipped = resolve(modes[m]); res[(role, m)] = hx
            cells.append(f'oklch({L:.3f} {C:.3f} {h:.0f}) `{hx}`' + (' (C clipped)' if clipped else ''))
        out.append(f'| {role} | ' + ' | '.join(cells) + ' |')
    out.append('')
    lad = [resolve(s) for s in ladder]
    out.append('Quantum-number ladder (print-light, n = 1..4): ' + ', '.join(f'oklch({L:.2f} {C:.3f} {h:.0f}) `{hx}`' for L, C, h, hx, _ in lad))
    out.append('')
    out.append('| check | ' + ' | '.join(MODES) + ' |'); out.append('|---|' + '---|' * len(MODES))
    rows = {'ink on paper': [], 'link on paper': [], 'accent on paper': [], 'min data role on paper': [],
            'ink on track2 tint': [], 'min dL data roles': [], 'min dE_OK deutan': [], 'min dE_OK protan': []}
    for m in MODES:
        p = res[('paper', m)]
        rows['ink on paper'].append(f"{contrast(res[('ink', m)], p):.1f}:1")
        rows['link on paper'].append(f"{contrast(res[('link', m)], p):.1f}:1")
        rows['accent on paper'].append(f"{contrast(res[('accent', m)], p):.1f}:1")
        worst = min(DATA, key=lambda r: contrast(res[(r, m)], p))
        rows['min data role on paper'].append(f"{contrast(res[(worst, m)], p):.1f}:1 ({worst})")
        rows['ink on track2 tint'].append(f"{contrast(res[('ink', m)], res[('track2', m)]):.1f}:1")
        Ls = {r: lin2oklab(hex2lin(res[(r, m)]))[0] for r in DATA}
        pair = min(itertools.combinations(DATA, 2), key=lambda q: abs(Ls[q[0]] - Ls[q[1]]))
        rows['min dL data roles'].append(f"{abs(Ls[pair[0]] - Ls[pair[1]]):.2f} ({pair[0]}/{pair[1]})")
        for k in ('deutan', 'protan'):
            labs = {r: lin2oklab(sim(hex2lin(res[(r, m)]), k)) for r in DATA}
            rows[f'min dE_OK {k}'].append(f"{min(math.dist(labs[a], labs[b]) for a, b in itertools.combinations(DATA, 2)):.3f}")
    for k, v in rows.items():
        out.append(f'| {k} | ' + ' | '.join(v) + ' |')
    dk = [resolve(x) for x in DARK[name]]
    out.append('Ladder, screen-dark and video (n = 1..4, n = 1 lightest): ' + ', '.join(f'oklch({L:.2f} {C:.3f} {h:.0f}) `{hx}`' for L, C, h, hx, _ in dk))
    out.append('')
    lL = [x[0] for x in lad]
    out.append('')
    out.append(f'Ladder min dL: {min(b - a for a, b in zip(lL, lL[1:])):.2f}.')
    out.append('')
    return '\n'.join(out), res, lad

def dtcg(name, pal, ladder):
    doc = {'$description': f'{name} colour tokens, authored in OKLCH; generated by tokens.py', 'color': {}}
    for role, modes in pal.items():
        L, C, h, hx, _ = resolve(modes['print-light'])
        ent = {'$type': 'color', '$value': {'colorSpace': 'oklch', 'components': [round(L, 3), round(C, 3), round(h, 1)], 'hex': hx},
               '$extensions': {'modes': {}}}
        for m in MODES:
            L, C, h, hx, _ = resolve(modes[m])
            ent['$extensions']['modes'][m] = {'colorSpace': 'oklch', 'components': [round(L, 3), round(C, 3), round(h, 1)], 'hex': hx}
        doc['color'][role] = ent
    lt = [resolve(s) for s in ladder]; dk = [resolve(s) for s in DARK[name]]
    def v(x): return {'colorSpace': 'oklch', 'components': [round(x[0], 3), round(x[1], 3), round(x[2], 1)], 'hex': x[3]}
    doc['color']['ladder'] = {f'n{i+1}': {'$type': 'color', '$value': v(lt[i]), '$extensions': {'modes': {
        'print-light': v(lt[i]), 'screen-light': v(lt[i]), 'screen-dark': v(dk[i]), 'video': v(dk[i])}}} for i in range(4)}
    return doc

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    print('<!-- GENERATED by tokens.py; do not hand-edit. -->\n\n# Token tables for PKG-1..3\n')
    for name, (pal, lad) in PKGS.items():
        txt, _, _ = table(name, pal, lad); print(txt)
        with open(os.path.join(here, f'tokens-{name.lower()}.json'), 'w') as f:
            json.dump(dtcg(name, pal, lad), f, indent=1)
