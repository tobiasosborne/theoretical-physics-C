<!-- ROLE: the fixed template every design package must follow, so packages are comparable.
     Authored by the orchestrator 2026-10-09. -->

# Design package template

Each package is one file `PKG-<n>-<slug>.md` with exactly these sections, in this order.

1. **Name and one-paragraph philosophy.** What it optimises for, what it refuses to do, its lineage (named precedents from LANDSCAPE.md).
2. **Math-font decision.** Which of the three options from the design-research report it takes (STIX Two everywhere / Times+MTPro2 print with STIX Two screen / mathtime-otf), and the consequence for print-screen match.
3. **Typography.** Print: text face, math face, sans for labels, mono; sizes in pt for body, small, footnote, captions, display headings; leading; column measure in characters and mm; page size and margins in mm; the sidenote/margin system. Web: the same roles as CSS font stacks with the exact font files or Google Fonts names, the type scale as CSS custom properties, line length. Games and video: the one or two faces used for HUD, labels and titles. Every face must either be installed on this machine (see sources-inventory/REPORT.md toolchain table) or be free, or carry a stated licence cost.
4. **Colour.** The role palette as a DTCG-style token table: role name, OKLCH value, hex, for the four modes print-light, screen-light, screen-dark, video. At most 3-4 data roles with OKLCH lightness at least 0.15 apart (greyscale budget, see design-research/palette-measurements.md), plus ink, paper, rule, accent, link. The physics-role assignment (which colour means state, effect/measurement, dynamics/energy, environment/bath, quantum number ladders). Show the WCAG contrast of link and body on paper.
5. **Layout grid.** Print page anatomy with a diagram in text; the web page grid (body column, gutter, full-bleed) and how a three.js demo and a game embed sit in it; how the two tracks (gentle / zoom-in) are marked in print and on the web, using the layered-docs report when available.
6. **Figure style.** Line weights in pt, marker sizes, axis style, hatching for forbidden regions, label placement rules, how colour carries meaning (quantum number, temperature, time), the caption rule. One TikZ preamble sketch (10-30 lines) showing the style applied, consistent with latex/tpc-tikz-templates.sty conventions.
7. **Interactive components.** Buttons, sliders, readouts, toggles, the "zoom" affordance, focus states, dark mode; the look of a three.js scene (background, lighting, axis gizmo, label rendering); what the HUD of a game looks like; one CSS snippet (20-40 lines) of tokens and one component.
8. **Video style.** Aspect ratio, background mode, camera conventions, title cards, lower thirds, how equations appear, how the colour roles map to 3D materials; how a video still can be reused as a print figure (or why it cannot).
9. **Bilingual rules.** Quotation marks, decimal separator, hyphenation, upright or italic d/e/i, how language-switching tokens appear.
10. **Coherence proof.** One concept (the Born rule or the hydrogen 2p orbital) shown in words as it would appear in print, on the web page, inside a demo, in a game HUD and in a video frame, so a reviewer can judge whether the five media look like one family.
11. **Costs and risks.** Licence costs in EUR where known, build complexity, what the current repo must change, what could go wrong.
12. **Verdict.** For whom this package is the right choice, in two sentences.

Keep each package under 300 lines. No emoji. Cite precedents by URL.
