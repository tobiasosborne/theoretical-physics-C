<!-- ROLE: measured lightness, contrast and colour-vision-deficiency separability of candidate palettes.
     Produced by the design-research lane on 2026-10-09. Regenerate with:
       python3 -I palette_colours.py ; python3 -I palette_cvd_check.py
     UPDATE POLICY: regenerate, never hand-edit the tables. -->

# Palette measurements

Method. sRGB hex values are linearised (IEC 61966-2-1 transfer curve), converted to OKLab with the
matrices published by Ottosson (https://bottosson.github.io/posts/oklab/, 2020-12-23) and to WCAG 2.x
relative luminance (https://www.w3.org/TR/WCAG22/#dfn-relative-luminance). Colour-vision deficiency
is simulated with the Machado, Oliveira and Fernandes (2009) severity-100 matrices as shipped in
colorspacious (https://github.com/njsmith/colorspacious/blob/master/colorspacious/cvd.py), applied in
linear RGB. "dE_OK" is Euclidean distance in OKLab; 0.02 is roughly a just-noticeable difference
[UNVERIFIED rule of thumb]. "dL" is the OKLab lightness difference, used as a proxy for greyscale
printing (a real printer's grey conversion differs; treat dL < 0.10 as "indistinguishable in grey").

Sources of hex values: current notes `latex/tpc-style.sty`; TJO slides `presentations/DESIGN_DATA.md`;
Okabe-Ito from the CUD page (https://jfly.uni-koeln.de/color/); Paul Tol from the `tol-colors` PyPI
package `colors.json` (https://pypi.org/project/tol-colors/); manim from
https://github.com/3b1b/manim/blob/master/manimlib/default_config.yml.

## Per-colour values

| set | name | hex | OKLCH L | C | h | contrast vs #FFFFFF | vs #111111 |
|---|---|---|---|---|---|---|---|
| tpc-style.sty (current) | spacecadet | `#0D284C` | 0.28 | 0.074 | 257 | 14.74 | 1.28 |
| tpc-style.sty (current) | munsell | `#008FA8` | 0.60 | 0.106 | 216 | 3.82 | 4.94 |
| tpc-style.sty (current) | banana | `#FFD932` | 0.89 | 0.172 | 95 | 1.38 | 13.69 |
| tpc-style.sty (current) | cgblue | `#007CA5` | 0.55 | 0.110 | 230 | 4.74 | 3.98 |
| tpc-style.sty (current) | isabelline | `#EAEDEA` | 0.94 | 0.005 | 146 | 1.18 | 16.01 |
| tpc-style.sty (current) | birrenred | `#C4392F` | 0.55 | 0.177 | 28 | 5.29 | 3.57 |
| tpc-style.sty (current) | birrenorange | `#D97A2B` | 0.67 | 0.147 | 55 | 3.10 | 6.09 |
| tpc-style.sty (current) | birrengreen | `#3D7A55` | 0.53 | 0.087 | 155 | 5.11 | 3.70 |
| tpc-style.sty (current) | birrengray | `#8C8C84` | 0.64 | 0.012 | 107 | 3.39 | 5.57 |
| TJO Whitney Teal (slides) | dk2 | `#335B74` | 0.45 | 0.061 | 238 | 7.27 | 2.60 |
| TJO Whitney Teal (slides) | accent1 | `#1CADE4` | 0.70 | 0.136 | 231 | 2.58 | 7.33 |
| TJO Whitney Teal (slides) | accent2 | `#2683C6` | 0.59 | 0.132 | 245 | 4.08 | 4.63 |
| TJO Whitney Teal (slides) | accent3 | `#27CED7` | 0.78 | 0.126 | 201 | 1.93 | 9.80 |
| TJO Whitney Teal (slides) | accent4 | `#42BA97` | 0.71 | 0.119 | 170 | 2.41 | 7.82 |
| TJO Whitney Teal (slides) | accent5 | `#3E8853` | 0.57 | 0.110 | 151 | 4.33 | 4.36 |
| Okabe-Ito | orange | `#E69F00` | 0.75 | 0.158 | 77 | 2.25 | 8.38 |
| Okabe-Ito | skyblue | `#56B4E9` | 0.73 | 0.117 | 236 | 2.31 | 8.18 |
| Okabe-Ito | green | `#009E73` | 0.62 | 0.130 | 165 | 3.42 | 5.52 |
| Okabe-Ito | yellow | `#F0E442` | 0.90 | 0.172 | 105 | 1.32 | 14.28 |
| Okabe-Ito | blue | `#0072B2` | 0.53 | 0.131 | 244 | 5.19 | 3.64 |
| Okabe-Ito | vermillion | `#D55E00` | 0.62 | 0.170 | 48 | 3.87 | 4.88 |
| Okabe-Ito | purple | `#CC79A7` | 0.68 | 0.118 | 346 | 3.06 | 6.17 |
| Tol high-contrast | blue | `#004488` | 0.39 | 0.129 | 255 | 9.62 | 1.96 |
| Tol high-contrast | yellow | `#DDAA33` | 0.77 | 0.141 | 84 | 2.13 | 8.88 |
| Tol high-contrast | red | `#BB5566` | 0.58 | 0.132 | 12 | 4.56 | 4.14 |
| Tol bright | blue | `#4477AA` | 0.56 | 0.097 | 250 | 4.70 | 4.01 |
| Tol bright | cyan | `#66CCEE` | 0.80 | 0.106 | 222 | 1.84 | 10.28 |
| Tol bright | green | `#228833` | 0.55 | 0.153 | 146 | 4.53 | 4.17 |
| Tol bright | yellow | `#CCBB44` | 0.78 | 0.138 | 101 | 1.95 | 9.67 |
| Tol bright | red | `#EE6677` | 0.68 | 0.168 | 15 | 3.09 | 6.12 |
| Tol bright | purple | `#AA3377` | 0.52 | 0.169 | 349 | 6.09 | 3.10 |
| Tol bright | grey | `#BBBBBB` | 0.79 | 0.000 | 90 | 1.92 | 9.84 |
| manim (3b1b) defaults | BLUE_C | `#58C4DD` | 0.77 | 0.104 | 215 | 2.03 | 9.31 |
| manim (3b1b) defaults | TEAL_C | `#5CD0B3` | 0.78 | 0.114 | 174 | 1.89 | 10.01 |
| manim (3b1b) defaults | GREEN_C | `#83C167` | 0.75 | 0.138 | 137 | 2.15 | 8.80 |
| manim (3b1b) defaults | YELLOW_C | `#FFFF00` | 0.97 | 0.211 | 110 | 1.07 | 17.58 |
| manim (3b1b) defaults | GOLD_C | `#F0AC5F` | 0.79 | 0.123 | 68 | 1.95 | 9.69 |
| manim (3b1b) defaults | RED_C | `#FC6255` | 0.69 | 0.191 | 28 | 2.99 | 6.31 |
| manim (3b1b) defaults | GREY_BROWN | `#736357` | 0.51 | 0.028 | 59 | 5.75 | 3.28 |
| manim (3b1b) defaults | bg | `#333333` | 0.32 | 0.000 | 90 | 12.63 | 1.49 |

## Pairwise separability of each categorical set

| set | min dE_OK normal | min dE_OK deutan | min dE_OK protan | min dL (greyscale) | worst greyscale pair |
|---|---|---|---|---|---|
| tpc-style.sty figure colours | 0.123 | 0.076 | 0.092 | 0.001 | cgblue / birrenred |
| Okabe-Ito (7) | 0.156 | 0.076 | 0.096 | 0.002 | green / vermillion |
| Tol bright (6, no grey) | 0.180 | 0.083 | 0.089 | 0.005 | blue / green |
| Tol high-contrast (3) | 0.245 | 0.213 | 0.162 | 0.184 | yellow / red |
| Whitney Teal accents | 0.092 | 0.089 | 0.096 | 0.010 | accent1 / accent4 |

## Findings

1. In the current notes, `cgblue` (L 0.55), `birrenred` (L 0.55) and `birrengreen` (L 0.53) have the
   same lightness. In a greyscale print they are one grey. Any figure that distinguishes them by hue
   alone fails the brief's greyscale requirement.
2. `munsell` (#008FA8), the current link colour, has 3.82:1 contrast on white: below the WCAG 2.2
   1.4.3 AA threshold of 4.5:1 for body-size text.
3. No multi-hue categorical palette tested (Okabe-Ito, Tol bright, Whitney Teal) survives greyscale:
   each contains at least one pair with dL <= 0.01. Only a lightness-stepped set (Tol high-contrast,
   L = 0.39 / 0.58 / 0.77, plus black and white) survives greyscale, CVD and colour at once, and it
   has 3 colours. Consequence: the book can carry at most 3-4 colour-coded roles that must survive
   grey; everything else needs redundant encoding (line style, marker shape, direct label, hatching).
4. Under deuteranopia the minimum pairwise dE_OK of every 6-7 colour set falls to 0.076-0.089, versus
   0.213 for Tol high-contrast.
5. The manim defaults are designed for a dark (#333333 / black) background: on white they have
   contrast 1.07-2.99:1 except GREY_BROWN. A video palette therefore cannot be lifted unchanged into
   print; it must be a separate "dark" mode of the same tokens.
