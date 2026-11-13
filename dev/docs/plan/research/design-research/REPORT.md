
<!-- ROLE: design-research lane report for the Theo C upgrade. Maps the 2020-2026 landscape of
     information design, mathematical typography, figure, game and video design, and bilingual
     typesetting, so that the design-packages lane can build 3-5 coherent packages.
     Authored by the design-research lane (Claude, Opus) on 2026-10-09.
     Companion files: LANDSCAPE.md (every precedent as a table), palette-measurements.md
     (+ palette_colours.py, palette_cvd_check.py), specimens/ (six text+math font specimens).
     UPDATE POLICY: append dated corrections; do not silently rewrite claims. -->

# Design research: presenting complex physics in print, web, games and video (2020-2026)

## 0. Scope, method, and what was produced locally

Question from the brief (`docs/plan/BRIEF.md`): physics and mathematics are "typeset like crap", design "has stayed in the 1900s", Tufte is the only known name; what has changed in the last five years, and how can one design be coherent across a print PDF, HTML chapters with three.js, HTML games and 3D videos, in German and English, surviving greyscale printing?

Method. Web searches and page fetches on 2026-10-09 (every external fact carries a URL or DOI); reading of TJO's own design record (`presentations/STYLE_GUIDE.md`, `DESIGN_DATA.md` in the scratchpad clone; `../mathfonts/README.md` and `research/report.typ`; `mathtime-otf/PRD.md`); and three local experiments whose outputs sit next to this file:

- `specimens/`: the same German physics paragraph and two display equations set in six text+math pairings with XeLaTeX (A Times LT Std + MTPro2, the current build; B STIX Two; C TeX Gyre Termes; D Libertinus; E Baskerville 10 Pro + TJO's Baskerville Companion Math v0.140; F Minion Pro + STIX Two Math as a deliberate mismatch). Sheets: `specimens/abc.png`, `specimens/def.png`. The E PDF is not kept because the prototype font is local-only (`../mathfonts/README.md`); rebuild from `e.tex`.
- `palette-measurements.md`: OKLCH lightness, WCAG contrast and simulated colour-vision-deficiency separability of the current notes' palette, TJO's slide palette, Okabe-Ito, Paul Tol and manim.
- Repo facts measured: the German PDF sets about 85-95 characters per line (12 pt amsart on A4 with 2.5 cm margins; `pdftotext` of pp. 10-14, median full line 91 characters); `latex/tpc-macros.sty` defines `\dd` as upright d but the German lectures use it 0 times and write italic `\,dx` 18 times and italic `e^{i...}` 35 times; `microtype` is not loaded.

Three names in the brief could not be found: "Rolf Hobbs" (no information designer of that name; searches return Rob Waller, founder of Information Design Journal, https://en.wikipedia.org/wiki/Rob_Waller); "Lauren Hayward" as a visualisation designer (a physicist of that name works on machine learning for many-body physics at Perimeter Institute [UNVERIFIED]; no design body of work found); "Lumini's games" (nothing found). They are recorded here so that nobody cites them.

## Summary

1. Tufte is not the frontier. The real changes since 2019 are infrastructural: native MathML in every browser (Chrome 109, January 2023), perceptual colour spaces in CSS (OKLCH, all major browsers since 2023), variable fonts, a stable design-token format (DTCG 2025.10, October 2025), Typst (Knuth-Plass line breaking, tagged PDF in 0.14, MathML HTML export in 0.15, June 2026), single-source documents that emit PDF and interactive web (Living Papers, UIST 2023), and semantic-zoom reading interfaces (gwern.net popups, Distill gutters, Quantum Country's embedded review).
2. The single strongest design constraint is the math font. Times + MathTime Pro 2 is Type 1, cannot reach the web or Typst, and web embedding is not covered by anything read here; STIX Two (free, Times-derived by Tiro Typeworks) is the only Times-family candidate that works identically in XeLaTeX, LuaLaTeX, Typst, MathJax 4 and native MathML.
3. Greyscale survival is a lightness budget, not a palette choice: no 6-7 hue palette survives grey; only 3-4 lightness-stepped roles do. Everything else needs redundant encoding.
4. Pedagogical evidence (Mayer's coherence and signalling principles; a signalling meta-analysis over 103 studies; Ainsworth's DeFT) favours fewer, labelled, colour-consistent figures over decoration in every medium.

## 1. Post-Tufte information design, 2020-2026

### 1.1 Interactive essays and their institutions

- **Distill** (distill.pub, 2016-2021). A journal plus an HTML template with a named layout grid (`l-body`, `l-middle`, `l-page`, `l-screen`, `l-gutter` for marginalia, outset and side variants), hover citations and hover footnotes (https://distill.pub/guide/). Hiatus from 2021-07-02: "Running Distill as a journal creates a great deal of structural friction"; "Distill is volunteer run and these frictions have caused our team to struggle with burnout"; early articles cost editors 50 or more hours of mentoring and diagram design each (https://distill.pub/2021/distill-hiatus/). Lesson: the format was not the failure; the per-article design labour was. A course with 22+ chapters must make the design system do the work (templates, tokens, components), not per-chapter craft.
- **Hohman, Conlen, Heer, Chau, "Communicating with Interactive Articles"**, Distill 2020, doi:10.23915/distill.00028. Five affordances: connecting people and data, making systems playful, prompting self-reflection, personalising reading, reducing cognitive load. The best single literature review for the web lane.
- **Bartosz Ciechanowski** (https://ciechanow.ski/archives/). 20 essays 2014-2024, 15 since 2019 (Gears, Cameras and Lenses, Internal Combustion Engine, Naval Architecture, Curves and Surfaces, GPS, Mechanical Watch, Sound, Bicycle, Airfoil, Moon). Pattern [author's observation]: dozens of small hand-built WebGL/canvas figures inline with prose, each with one or two reader controls, no scrolljacking, muted palette, every figure driven by the underlying physical model. Steal: many small live figures; figure state controlled by the reader, never by scroll.
- **Explorable explanations**. Bret Victor's essay (2011-03-10, https://worrydream.com/ExplorableExplanations/) defined reactive documents, explorable examples and contextual information. Hub: https://explorabl.es/. Canonical example: Nicky Case and Vi Hart, *Parable of the Polygons* (2014, https://en.wikipedia.org/wiki/Parable_of_the_Polygons).
- **Quantum Country** (Matuschak and Nielsen, 2019, https://quantum.country/): linear-algebra-level quantum computing primer with 112 review questions embedded in the text and spaced-repetition e-mails afterwards (https://notes.andymatuschak.org/Mnemonic_medium). The closest precedent to this course in subject and audience; steal the embedded-review mechanism.
- **Living Papers** (Heer, Conlen, Devireddy, Nguyen, Horowitz, UIST 2023, doi:10.1145/3586183.3606791, https://idl.uw.edu/living-papers-paper). One Markdown source with components emits an interactive web article, a static PDF via LaTeX, and an API. Research proof that "canonical PDF plus rich HTML from one source" is tractable.
- **gwern.net** (https://gwern.net/design). Sidenotes instead of footnotes, recursive link popups, collapsed-by-default sections, abstracts, a deliberately monochrome palette with small caps and drop caps, light/dark/auto; the site calls it semantic zoom. The most developed existing answer to the brief's "zoom in by clicking" on the web.
- **Gerby / Stacks project / Kerodon** (https://pbelmans.ncag.info/blog/2018/10/17/kerodon/). LaTeX to website with permanent tags for every numbered item; Mathlib can cite Kerodon tags. Steal: permanent language-independent tags for definitions (matches the brief's notation/definitions database).
- **Observable**: Observable Plot (layered marks and scales, https://observablehq.com/plot/) and Notebooks 2.0 technology preview (July 2025: open file format Notebook Kit, desktop editor; https://observablehq.com/blog/previewing-notebooks-2, https://macwright.com/2025/07/31/observable-notebooks-2). Living Papers reuses Observable's reactive JavaScript dialect.
- **The Pudding** (https://pudding.cool/process/pivot-continue-down/): visual essays chosen for multi-year shelf life, built in days to months, explicit kill process for ideas.
- **Our World in Data Grapher** (https://ourworldindata.org/owid-grapher): one chart engine driven by JSON configuration, every chart downloadable as SVG/PNG/CSV and embeddable; 2023 redesign fixed control placement per view (https://ourworldindata.org/redesigning-our-interactive-data-visualizations). Code now source-available, not freely licensed. Steal: every figure ships its data.
- **Quanta Magazine**: art director Olena Shmahalo since 2014; aim is "storytelling and sparking interest", not literal depiction (https://sketchfab.com/blogs/community/science-spotlight-quanta-magazine); a graphics editor maintains an internal infographics style guide (https://spd.org/job-board/graphics-editor-quanta-magazine). No public redesign document found.
- **Nature**: no 2020s "figure redesign" found. The research figure guide requires editable vector art so editors can restyle figures into house style (https://research-figure-guide.nature.com/); Nature Reviews redraws all figures (https://www.bsas.org.uk/assets/files/natrev-artworkguide_PS.pdf). The relevant practice: one house style imposed on all figures by a redraw step.

### 1.2 Books

- **Stripe Press** (https://press.stripe.com/): lists Working in Public, The Dream Machine, Poor Charlie's Almanack (abridged 2023 edition, ed. Kaufman, 384 pp. [UNVERIFIED page count, bookseller listing]), and Hamming's *The Art of Doing Science and Engineering* with "more than 70 redrawn graphs and charts" and a Bret Victor foreword. Stripe's job advert: the team gives "each publication its physical and visual form: covers, layouts, materials, as well as defining identity systems" (https://jobs.generalcatalyst.com/companies/stripe/jobs/38364114-editorial-designer-stripe-press). No designer interview or colophon with typeface names found; physical details (cloth, ribbons) [UNVERIFIED]. Steal: redraw every inherited figure into one system; per-book identity inside a press-wide system.
- **Tufte, late work**: *Seeing with Fresh Eyes: Meaning, Space, Data, Truth* (Graphics Press 2020, 176 pp., https://edwardtufte.com/tufte/seeing-with-fresh-eyes): "content-responsive typography", "graphical sentences", annotations on local grids. The useful late idea is the sentence with embedded graphics, not page layout.
- **Tristan Needham**: *Visual Complex Analysis*, 25th anniversary edition (OUP 2023; 501 diagrams with new self-contained captions; foreword by Penrose) and *Visual Differential Geometry and Forms* (Princeton 2021, 235 hand-drawn diagrams). Steal: the caption carries the geometric argument.

### 1.3 Scrollytelling and its critics

Kosara, "The Scrollytelling Scourge" (2016, https://eagereyes.org/blog/2016/the-scrollytelling-scourge): awkward, brittle, assumes readers prefer scrolling to stepping. Jeremy Keith on readers who cannot bear such pieces (https://adactio.com/links/tags/scrolling). Experts list "scrolljacking", missing affordances and a non-intuitive scroll-to-animation link (arXiv:2411.18049). A 2026 CHI study: better engagement and lower cognitive load, no comprehension gain (arXiv:2603.04367). Verdict: scroll may reveal, never control; use explicit steppers and reader-controlled sliders.

### 1.4 Type technology

Variable fonts: OpenType 1.8, announced jointly by Adobe, Apple, Google and Microsoft at ATypI Warsaw, 2016-09-14 (https://typenetwork.com/articles/atypi-warsaw-2016-day-2-part-i-the-return-of-the-multiple-master). STIX Two Text ships as variable fonts (local `stix2-otf` README). Typst 0.15 maps weight/width/size to variation axes automatically (https://typst.app/blog/2026/typst-0.15). Use: one file serves print weights, screen weights and dark-mode weight compensation [UNVERIFIED practitioner convention that text on dark grounds is set lighter].

### 1.5 Colour

- OKLab/OKLCH (Ottosson, 2020-12-23, https://bottosson.github.io/posts/oklab/: "Oklab is able to predict perceived lightness, chroma and hue well"). CSS `oklch()` in Chrome 111, Firefox 113, Safari 15.4 (https://developer.chrome.com/docs/css-ui/access-colors-spaces). Author all tokens in OKLCH: equal lightness steps are what greyscale survival needs.
- Perceptually uniform maps: viridis family (Smith and van der Walt, SciPy 2015; matplotlib default from 2.0; https://bids.github.io/colormap/ [UNVERIFIED URL]); Crameri, Shephard, Heron, "The misuse of colour in science communication", *Nat. Commun.* 11, 5444 (2020), doi:10.1038/s41467-020-19160-7, Scientific Colour Maps doi:10.5281/zenodo.1243862; Paul Tol, SRON/EPS/TN/09-002 issue 3.2 (2021), hex values verified from the `tol-colors` PyPI package; Okabe-Ito Colour Universal Design (https://jfly.uni-koeln.de/color/).
- Measured on the current notes (`palette-measurements.md`): `cgblue` #007CA5, `birrenred` #C4392F, `birrengreen` #3D7A55 all at OKLCH L = 0.53-0.55, so they print as one grey; link colour `munsell` #008FA8 has 3.82:1 on white (fails WCAG AA for text). No 6-7 colour categorical palette survives greyscale (each has a pair with dL <= 0.01); Tol high-contrast (L 0.39/0.58/0.77) does; under deuteranopia min pairwise dE_OK falls to 0.076-0.089 for 6-7 colour sets vs 0.213 for Tol high-contrast.
- Dark mode: inverting distorts colour semantics; darkening only the background loses contrast (Chameleon, arXiv:2512.00516). The EU data-visualisation guide prescribes recolouring text and grids and reversing sequential scales (https://data.europa.eu/apps/data-visualisation-guide/dark-mode). Dark mode is a second rendering of the same tokens, not a filter.

### 1.6 Accessibility

WCAG 2.2 (W3C Recommendation, October 2023): 4.5:1 body text, 3:1 large text and non-text graphics needed for understanding (SC 1.4.3, 1.4.11; https://www.w3.org/TR/WCAG22/). WCAG 3 is a Working Draft (March 2026, https://www.w3.org/TR/wcag3) and not citable as a standard; APCA is in no adopted standard. CVD simulation: Machado, Oliveira, Fernandes (2009) matrices as implemented in colorspacious (https://github.com/njsmith/colorspacious). Typst 0.14 (2025-10-24) produces tagged PDF by default, opt-in PDF/UA-1 (https://typst.app/blog/2025/typst-0.14). arXiv HTML via LaTeXML since 2023-12-18; only 30 % of assistive-technology users could access all the research they needed (https://blog.arxiv.org/2023/12/21/accessibility-update-arxiv-now-offers-papers-in-html-format).

### 1.7 Design systems and tokens

- Apple HIG / Liquid Glass (WWDC 2025): translucent controls drew sustained legibility criticism; Apple added a "Tinted" option in iOS 26.1 betas (https://pxlnv.com/blog/on-liquid-glass/; https://gulfnews.com/technology/companies/apple-yields-tinted-control-in-ios-261-beta-4-tones-down-liquid-glass-after-backlash-1.500315176). Lesson: never put text over moving 3D content without an opaque or tinted plate.
- Material 3 Expressive (2025): Google claims 46 studies, over 18,000 participants preferring "expressive" colour, shape, size, motion, containment (https://chromeunboxed.com/google-leaks-the-reason-and-process-behind-their-new-material-3-expressive-design-language); vendor research, not peer reviewed. Useful only for interactive components and its tonal-palette approach to light/dark variants.
- Khan Academy Wonder Blocks: built after finding over 50 kinds of buttons and links and more than 50 type styles; colour system rebuilt because teams misused semantic tokens (https://designsystems.com/about-wonder-blocks-khan-academys-design-system-and-the-story-behind-it; https://blog.khanacademy.org/how-we-rebuilt-khan-academys-color-system-from-the-ground-up).
- Design Tokens Community Group format 2025.10 (first stable, 2025-10-28, https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/): JSON with typed values, aliases, theming (light/dark/high-contrast without duplicating files), colour in any CSS Color 4 space including OKLCH. A Community Group report, not on the W3C standards track (https://www.designtokens.org/faq/). Mechanism for one palette across media: one `tokens.json` compiled by a small script (or Style Dictionary [UNVERIFIED current DTCG support]) to `tpc-tokens.sty` (`\definecolor`, TikZ styles), CSS custom properties, a TS/GLSL module for three.js, a Typst dictionary, a manim/Motion Canvas palette module and a Blender colour script. Store OKLCH source values; convert per target.

### 1.8 What is genuinely new since about 2020 (answer to the brief)

(a) Native MathML everywhere (2023) and MathML export from Typst (2026): screen math can use the print font. (b) OKLCH in CSS (2023) and themed token formats (2025): one palette, many renderings. (c) Single-source PDF+web toolchains (Living Papers 2023; Typst HTML). (d) Semantic-zoom reading (gwern.net; Distill gutters; Stacks tags). (e) Learning-science-informed media: embedded spaced repetition (Quantum Country), reader-controlled live figures (Ciechanowski). (f) Diagram synthesis from notation (Penrose, ACM TOG 39(4) art. 144, SIGGRAPH 2020, https://penrose.cs.cmu.edu/siggraph20). (g) Accessible-by-default PDF (Typst 0.14) and arXiv HTML. None is a new aesthetic; they are plumbing that lets one aesthetic survive all media. The aesthetic is still best taken from classical book typography (Bringhurst, Hochuli) plus Tufte's density and Doumont's message-first structure.

## 2. Mathematical typography

### 2.1 The OpenType MATH landscape

Vieth, "An updated survey of OpenType math fonts", TUGboat 44:2 (2023) 213-225, doi:10.47397/tb/44-2/tb137vieth-otmath (fetched; sha256 74adcfb93ae64b29e7eebabb1bbf2fcde78a4460ce47a42043e1b31670bc8936): more than 20 OpenType math fonts, more than 30 faces. Table 1: Cambria Math (2007, Microsoft/Tiro), Asana (2008), XITS (2010; obsolete), STIX Two Math (2016; 2.13 in 2021; v2.14 tagged April 2025, https://github.com/stipub/stixfonts/releases/tag/v2.14), Latin Modern Math (2011), TeX Gyre Termes/Pagella/Bonum/Schola/DejaVu Math (2012-2015), Lucida Bright Math (2012; 1.901 in 2023; commercial via TUG), Libertinus Math (2016, Hosny), Garamond Math (2018, Zhao), Erewhon Math (2019, Flipo; Utopia), XCharter Math (2022), KpFonts OTF (2020, Flipo; URW Palladio-derived), GFS Neohellenic Math, Fira Math (2018, Zeng), Noto Math (MATH table from 2023), New Computer Modern Math (2019, Tsolomitis; "the most complete math fonts, even more complete than STIX fonts"), Concrete and Euler Math (2022). Bold math weights only in XITS, Lucida, Erewhon, XCharter, Kp, New CM; STIX Two Math is regular only (Vieth Table 2). Not in that table: Minion Math (Küster/typoma, 2009; 4 weights x 5 optical sizes; commercial; MATH table from 2011 per the designer, https://luc.devroye.org/fonts-46519.html) and MathTime Pro 2 (Spivak; Type 1; three design sizes; Lite free, Complete 68 fonts commercial; https://pctex.com/mtpro2.html).

On this machine (`kpsewhich`, `fc-list`): STIX Two Text/Math, Libertinus, Fira Math, Garamond Math, XITS, KpMath, TeX Gyre Termes Math, New CM Math, Latin Modern Math, Minion Pro (text only), Times LT Std, Whitney, MTPro2 (Type 1), `lucimatx` (Lucida Type 1 math support; no Lucida text OTF found). Typst 0.14.2; upstream 0.15.

### 2.2 What the specimens show

- A (Times LT Std + MTPro2, current). Best-integrated Times math; upright e, i, d sit naturally. The five-formula display line overflows the 138 mm specimen measure where B, C, D, F fit: MTPro2 sets wider.
- B (STIX Two). Larger x-height, slightly darker than A; text and math visibly one family. Closest OpenType look-alike to A.
- C (TeX Gyre Termes). Weakest: loose inline subscripts, small upright-looking integral, a calligraphic H foreign to Times.
- D (Libertinus). Coherent, lighter, good on screen; not Times.
- E (Baskerville 10 Pro + Companion Math v0.140). Italic capitals Z and N appear as swash forms in math (partition function Z; N in the direct-sum limit). Baskerville italic caps need non-swash math variants before this can carry physics.
- F (Minion Pro + STIX Two Math). Mismatch obvious (math italic heavier and larger than text): text and math must be designed together.

### 2.3 Times + MathTime and its strongest competitors

TJO's preference is well founded for print: MathTime was "widely adopted by academic publishers such as Elsevier, the American Physical Society, the Mathematical Association of America, and Springer" (https://en.wikipedia.org/wiki/MathTime), has true script optical sizes, and specimen A shows its integration. Outside print: Type 1 only (no Typst, MathJax, MathML); web embedding rights [UNVERIFIED, licence not read]; `mathtime-otf` is at PRD stage after an earlier conversion judged "not a trustworthy pipeline" (`mathtime-otf/PRD.md`). Competitors ranked for this project:

1. **STIX Two Text + Math** (OFL; Tiro Typeworks for the STI Pub companies AMS, AIP, APS, ACS, IEEE, Elsevier). Tiro: addresses "inherent deficiencies in the Times New Roman model" while "the essential 'Times-ness' remains" (local `stix2-otf` README). Same font in XeLaTeX/LuaLaTeX (`unicode-math`), Typst, MathJax 4 (`mathjax-stix2`, https://docs.mathjax.org/en/v4.0/output/fonts.html), Temml/native MathML (https://temml.org/), variable text fonts. Weaknesses: no bold math, no script optical sizes, darker and wider than Times LT. Only competitor satisfying "coherent across media" with zero licence work.
2. **Minion Pro + Minion Math** (commercial). Most complete optical-size system matched to its text face; Minion Pro is installed. Weaknesses: price (about 700 EUR per licence in 2012 [UNVERIFIED current]), web licensing, disputed MATH conformance in 2012.
3. **Lucida Bright + Lucida Bright Math OT** (Bigelow & Holmes, TUG, 2012; v1.901 2023; Demi math weight). Large x-height, built for screen and low-resolution print; Hagen and Sundqvist patched its math axis, sizes and extensibles (TUGboat 43:3, https://tug.org/TUGboat/tb43-3/tb135hagen-lucida.pdf). Weaknesses: commercial, technical rather than bookish.

Free Times fallback for print only: `newtxmath` (installed); not OpenType, so same web problem as MTPro2.

### 2.4 Engines: XeTeX, LuaTeX, Typst

- Knuth-Plass total-fit line breaking (Knuth and Plass, *Softw. Pract. Exp.* 11 (1981) 1119-1184, doi:10.1002/spe.4380111102). Typst implements it (`crates/typst-layout/src/inline/linebreak.rs`: "Performs line breaking in optimized Knuth-Plass style"); default for justified text, with costs for hyphenation, runts, widows, orphans and default punctuation overhang (https://typst.app/docs/reference/model/par/, https://typst.app/docs/reference/text/text/).
- Microtypography (Hàn Thế Thành, TUGboat 21:4, 2000): the local `microtype` manual says protrusion works in pdfTeX, LuaTeX and XeTeX; font expansion only pdfTeX and LuaTeX. The current XeLaTeX build loads neither; `microtype` under XeLaTeX buys protrusion now at no cost; LuaLaTeX buys expansion.
- XeTeX treats OpenType math "in a manner similar to traditional TeX fonts"; LuaTeX follows the "unfortunately somewhat vague" spec more closely (Sundqvist and Hagen, "Standardizing OpenType math fonts", TUGboat 44:2 (2023) 226-232). Their LMTX series (TUGboat 43-46: math spacing classes, formula breaking, italic corrections, a multi-pass Knuth-Plass in 46:1) is the frontier of math quality, but ConTeXt-only.
- Typst: LWN (September 2025, https://lwn.net/Articles/1037577/) found math "nearly indistinguishable" from LaTeX; page-layout refinements weaker [secondary, user discussion]. 0.14: tagged PDF, PDF/UA-1. 0.15 (2026-06-15): MathML in experimental HTML export, multi-file bundle export, variable fonts. Needs OpenType MATH fonts, so MTPro2 is excluded until `mathtime-otf` succeeds; `../mathfonts` already proofs in Typst.

### 2.5 Mathematics on the web, faithful to print

- Native MathML Core: Chrome/Edge 109 (2023-01-10, Igalia, https://mathml.igalia.com/news/2023/01/10/mathml-in-chromium-project-is-completed/); Firefox and Safari already rendered MathML. Font via CSS (`font-family: math`, `@font-face` with any OpenType MATH WOFF2), so the web can use the print font. Rendering still "varies somewhat" between browsers (Typst 0.15 post).
- Temml (Ron Kok, MIT, https://temml.org/): LaTeX to MathML, offers Latin Modern, Asana, STIX Two, Libertinus, Noto Sans or any local math font.
- MathJax 4: eleven fonts including `mathjax-stix2`; default `mathjax-newcm`. New fonts need conversion.
- KaTeX: one bundled CM-like font, no supported font switching (https://yingtongli.me/blog/2022/09/24/katex-custom-fonts.html). Excluded.
- Recommendation: pre-render server-side (Temml or MathJax 4 in Node, or Typst MathML) to static MathML with the print OpenType MATH font; MathJax 4 CHTML as fallback. The GR sibling's client-side MathJax 3 (`../generalrelativity/web/template.html`) ties the web to the CM look and cannot match a Times book.

### 2.6 Rules for setting equations

- Measure: Butterick 45-90 characters including spaces (https://practicaltypography.com/line-length.html); Bringhurst, *Elements of Typographic Style* v4.3 (2019), 45-75, 66 ideal [UNVERIFIED page]. The current German PDF (about 85-95) is at the upper limit; a wide outer margin (Tufte/Distill gutter) gives about 70 characters plus room for sidenotes and zoom pointers.
- Hochuli, *Detail in Typography* (Hyphen Press 2008; Éditions B42 2015): word space, letter space and leading as one system; inline math spacing must match text spacing.
- Higham (https://nhigham.com/2016/01/28/typesetting-mathematics-according-to-the-iso-standard/): the Princeton Companion to Applied Mathematics set e, i and d upright; macros `\eu`, `\iu`, `\du` after Beccari, TUGboat 18:1 (1997) 39-48 (https://tug.org/TUGboat/tb18-1/tb54becc.pdf).
- Tao's advice (https://terrytao.wordpress.com/advice-on-writing-papers/) covers notation ("Use good notation"), not typography: supports the notation database, not a font choice.
- Dirac notation through macros only (already in `tpc-macros.sty`); number only referenced equations; put the verbal reading of a key equation in the margin (signalling, 3.3).

## 3. Scientific figure design beyond Tufte

### 3.1 Sources

- Doumont, *Trees, Maps, and Theorems* (Principiae 2009; review https://www.tug.org/books/reviews/tb103reviews-doumont.html): message first; the caption states the conclusion; deliberate redundancy between text and figure; maximise signal-to-noise.
- Dona M. Wong, *The Wall Street Journal Guide to Information Graphics* (Norton, 2010 [UNVERIFIED year]): direct labels, sparing colour, one message per chart.
- Wilke, *Fundamentals of Data Visualization* (O'Reilly 2019; free manuscript, https://clauswilke.com/dataviz/): proportional ink, direct labelling, redundant coding.
- Healy, *Data Visualization: A Practical Introduction* (Princeton 2018, https://socviz.co/).
- Nature Methods "Points of View" (Bang Wong, Krzywinski et al., from August 2010; 38 columns collected to 2015; https://communities.springernature.com/posts/data-visualization-a-view-of-every-points-of-view-column).
- Physics: Needham (1.2); Feynman Lectures online (HTML5, MathJax, SVG figures, https://www.feynmanlectures.caltech.edu/info/flp.html); Cham and Whiteson, *We Have No Idea* (2017 UK/2018 US) and *Frequently Asked Questions about the Universe* (Riverhead 2021): cartoon register that de-intimidates; MinutePhysics (hand-drawn whiteboard register; channel URL [UNVERIFIED]).
- Penrose (Ye, Ni, Krieger, Ma'ayan, Wise, Aldrich, Sunshine, Crane; ACM TOG 39(4) 144, 2020): diagrams by constrained optimisation from math-like statements plus reusable style. A figure computed from the definition cannot drift from it (the repo already computes TikZ geometry from formulas).

### 3.2 3Blue1Brown and manim

From https://github.com/3b1b/manim `manimlib/default_config.yml`: background #333333 (videos use near-black), stroke #DDDDDD, named palette with five tints per hue (BLUE_C #58C4DD, TEAL_C #5CD0B3, GREEN_C #83C167, YELLOW_C #FFFF00, GOLD_C #F0AC5F, RED_C #FC6255, GREY_BROWN #736357); every formula rendered by TeX via configurable templates (`tex_templates.yml`, including XeLaTeX/fontspec). Grammar [author's analysis, no published guide found]: one colour per mathematical object, held across scenes and across formula and picture; transformations as continuous morphs of the formula; dark ground so colour carries identity; little on-screen text. Measured: these colours have 1.07-2.99:1 contrast on white (except GREY_BROWN), so a 3b1b palette cannot be printed unchanged; print and video need the same hues at different lightness (OKLCH token modes).

### 3.3 Learning research

- Mayer, *Multimedia Learning*, 3rd ed. (Cambridge 2020/2021; 15 principles, over 200 experiments; https://assets.cambridge.org/97813166/38088/frontmatter/9781316638088_frontmatter.pdf): coherence, signalling, spatial and temporal contiguity, redundancy, segmenting, pre-training.
- Schneider, Beege, Nebel, Rey, *Educ. Res. Rev.* 23 (2018) 1-24: signalling meta-analysis, 103 studies, N = 12,201 [pooled effect size not retrieved, UNVERIFIED]. Richter, Scheiter, Eitel, *Educ. Res. Rev.* 17 (2016): signalling text-picture relations r = 0.17, stronger for low prior knowledge (the Lehramt profile).
- Ainsworth, DeFT, *Learning and Instruction* 16 (2006) 183-198, doi:10.1016/j.learninstruc.2006.03.001: multiple representations help only when translation between them is supported. Rule: same object, same colour, symbol and name in formula, figure, demo, game, video.
- Dual coding (Paivio, *Mental Representations*, OUP 1986 [UNVERIFIED edition]): basis for "one picture per page".
- Mayer's redundancy principle agrees with TJO's first commandment ("You can READ or LISTEN, not both!", `STYLE_GUIDE.md` 1).

## 4. Games and interactive UI without kitsch

### 4.1 Precedents

- Zachtronics (TIS-100, Shenzhen I/O, Opus Magnum, Exapunks; closed voluntarily 2022 after Last Call BBS, https://en.wikipedia.org/wiki/Zachtronics). The game is a real formal system; the manual is a printable document the player must read (Exapunks' *Trash World News* zines: PDF in-game, 40-page 5.5 x 8.5 in print-on-demand, https://www.lulu.com/shop/zachtronics-/trash-world-news-issue-2/paperback/product-pgyr97.html; physical items archived at https://www.zachtronics.com/zachtronics-museum). Solution histograms instead of badges. Strongest precedent for a game sharing an artefact with a print book.
- The Witness (2016), Baba Is You (2019): teach a rule system without text by sequencing puzzles; Baba makes rules movable objects (https://en.wikipedia.org/wiki/The_Witness_(2016_video_game), https://en.wikipedia.org/wiki/Baba_Is_You).
- Nicky Case (https://en.wikipedia.org/wiki/Nicky_Case): *The Evolution of Trust* (about 30 minutes, iterated prisoner's dilemma), *Parable of the Polygons* (with Vi Hart, 2014): sandbox after guided steps, no points.
- Quantum Game with Photons (Migdał et al.; v1 2016; v2 beta 2020-04-03; CQT support; open source; https://quantumgame.io/); Quantum Flytrap Virtual Lab (https://quantumflytrap.com/).
- Hello Quantum (IBM with James Wootton, Basel, 2018; https://www.unibas.ch/de/Aktuell/News/Uni-Research/Hallo-Quanten-Basler-Physiker-entwickelt-Spiele-App-mit-IBM.html): two-qubit states as circles, gates as moves, minimum-move puzzles.
- Quantum Odyssey (Quarks Interactive, PC 2025-01-30; circuits exportable to IBM hardware; DigiQ-endorsed certificate; https://store.steampowered.com/app/2802710/ [UNVERIFIED URL form]).
- Quantum Moves (ScienceAtHome, Aarhus; https://en.wikipedia.org/wiki/Quantum_Moves; associated Nature paper reported retracted in 2020 [UNVERIFIED against the journal]).
- A Slower Speed of Light (MIT Game Lab 2012, OpenRelativity; https://en.wikipedia.org/wiki/A_Slower_Speed_of_Light): correct simulation of a labelled counterfactual world.
- Outer Wilds (Mobius 2019): real-time simulated solar system as level design (https://vice.com/en/article/how-outer-wilds-developers-mobius-digital-made-space-physics-fun).
- Brilliant.org: "interactives" with immediate feedback (job descriptions, e.g. https://builtinvancouver.org/job/product-designer-learning-interactives/6717133); no public design system.
- Duolingo: Feather Bold typeface (Johnson Banks, Fontsmith; https://www.creativebloq.com/news/feather-bold), one saturated action colour, streak mechanics: the tonal reference for what to avoid.

### 4.2 What distinguishes the good ones

1. The game's rules are the subject's rules; the score is a physical quantity (fidelity, probability, entropy). 2. Teaching by puzzle sequencing, not text. 3. Sandbox after guided levels. 4. Peer comparison via solution histograms, not streaks. 5. Counterfactual physics labelled. 6. Visual restraint: limited palette, strong typography, no mascots in the content area.

### 4.3 Sharing tokens with the print book

Same token file (1.7); the book's text face for prose and the book's sans for controls; game pieces use the role colours of the corresponding mathematical objects; every game ships a printable field manual in the book's layout (Exapunks pattern); the book margin carries a short link to the matching level; win conditions stated as the book's equation (e.g. Born probability above a threshold).

## 5. Video design

- 3Blue1Brown (manim, 3.2); Veritasium (live experiment plus interview); Kurzgesagt (flat vector, saturated; a published source sheet per video, https://kurzgesagt.org/youtube/); Primer (Justin Helps; Blender-driven `primerpython`, archived 2025-02-07 for a Unity toolchain, https://github.com/Helpsypoo/primerpython); Sebastian Lague (Coding Adventures, Unity; code and result share the screen; channel URL [UNVERIFIED]); Acerola (Garrett Gunnell, graphics programmer; "Your Colors Suck (it's not your fault)", https://www.realtimerendering.com/blog/2024/08/); Motion Canvas (aarthificial; TypeScript, voice-over synced, https://motioncanvas.io/docs): same TS and tokens as the web demos can render video.
- Eugene Khutoryansky: fully 3D animated physics, surreal staging, classical-music bed (https://rettacs.org/?p=3084). Problem in Mayer's terms is coherence: decorative scenery, recurring human avatars and continuous camera motion carry no information and compete with the physics [author's assessment; no published critique found]. Lesson: camera motion and set dressing must be motivated by the explanation.
- Conventions for coherence with the book: (1) math in video typeset by the book's engine and fonts (manim XeLaTeX templates, or Typst SVG); (2) role colours are the book's tokens in video-dark mode, each object keeps its colour across media; (3) fixed labelled axes and visible scale in every 3D shot; camera moves only between explanatory viewpoints at constant angular speed; (4) physically correct data: orbital clouds are volume renders of |psi_nlm|^2 from the same code as the book figure, perceptually uniform colour maps documented on a caption card; (5) titles in the book's sans; no on-screen sentence duplicates narration; (6) each video ends on a still that is the book's figure.
- Tooling: no Blender or Manim on this machine (`docs/plan/CONTEXT.md`); Motion Canvas or three.js offline rendering reuse the web stack; Blender gives the best volumetrics for orbitals.

## 6. Bilingual typography (German leads, English follows)

- Quotes: German „…“ (or inward-pointing »…«), English “…”, never straight quotes (https://web.pdx.edu/~fischerw/courses/320_420/docs/0076-0100/0095_typokurz_regeln.pdf; https://www.debian.org/international/german/rules). The lectures use the TeX ligature `,,...``` (77 occurrences, 14 files): correct output under `Ligatures=TeX` but language-blind; `csquotes` `\enquote` switches automatically.
- Decimal comma in German, point in English; digit grouping by thin space (DIN 5008/Duden; dot as thousands separator only for money). `siunitx` with per-language locale or `icomma`; Typst `lang`/`region`. Applies equally to figure axes, demo readouts and video captions.
- Hyphenation: German compounds need `ngerman` patterns and tolerate more hyphens at a 66-character measure. German runs longer than English [UNVERIFIED typical 10-30 %]: layouts need slack; the parity checker could compare per-chapter length.
- Blackletter only as the mathematical Fraktur alphabet (su(2), so(3)); never as a text face.
- DIN 1338 (2011-03, current, https://www.dinmedia.de/de/norm/din-1338/137504292): Table 1 sets π, e and i upright and notes math literature often uses italic (extract: https://tu-dresden.de/ing/elektrotechnik/ifa/ressourcen/dateien/richtlinie_wiss_arbeiten/auszug_din_1338.pdf). ISO 80000-2:2019 replaces 2009: differential d, e, i and π upright; j alternative in electrical engineering (secondary summary https://journals.rudn.ru/miph/article/view/51918; standard paywalled).
- Conflicts with physics habit: italic d universal in physics textbooks; italic e collides with elementary charge e (hydrogen chapter has e^2/(4 pi eps0 r) and e^{-iHt/hbar}); i as unit vs index; upright descriptive subscripts (E_kin) vs italic variable ones (E_n). `\dd` exists but is unused. Recommendation: ISO/DIN upright d, e, i via `\dd`, `\eu`, `\iu` everywhere, recorded in the notation database.

## Principles

1. One source of truth per decision: colour, type scale, spacing, role assignment in one DTCG 2025.10 token file compiled to every target. Source: DTCG (1.7); Khan Wonder Blocks.
2. Each mathematical object has one identity across media: symbol, name, colour, glyph. Source: Ainsworth DeFT (2006); 3b1b grammar (3.2).
3. Greyscale is designed: at most 3-4 colour roles at least 0.15 apart in OKLCH lightness; everything else redundantly coded. Source: `palette-measurements.md`; Wilke; Tol high-contrast.
4. Author colour in OKLCH; ship per-medium modes (print light, screen light, screen dark, video dark), never inverted images. Source: Ottosson (2020); EU dark-mode guide; Chameleon.
5. The math font decides the system: an OpenType MATH font usable in TeX, Typst and MathML, or accept that web and video will not match print. Source: 2.3-2.5.
6. Text column about 66 characters; a wide outer margin for sidenotes, small figures and zoom links. Source: Bringhurst; Butterick; Tufte; Distill `l-gutter`; gwern.net.
7. Zoom is a typographic layer, not a separate document: summary level expands in place (web) or points to a marked deeper track (print). Source: gwern.net; Stacks tags; MTW tracks (brief).
8. Every figure states its message as a sentence in its caption and can be read without the text. Source: Doumont; Needham VCA (2023).
9. Signal the essential, remove the rest: no decoration, avatars, or motion without meaning. Source: Mayer; Schneider et al. (2018); TJO commandment 5.
10. Words next to what they describe: direct labels, margin annotations beside equations. Source: Mayer spatial contiguity; Wilke.
11. The reader controls state; scrolling never drives a figure. Source: Kosara (2016); arXiv:2411.18049; Ciechanowski.
12. Figures are computed from the physics, and the computation is shared by book, demo, game and video. Source: brief; Penrose; OWID.
13. Games are formal systems scored by a physical quantity, with a printable manual in the book's layout. Source: Zachtronics; Quantum Game with Photons.
14. Narration and on-screen text never duplicate. Source: Mayer redundancy; TJO "READ or LISTEN".
15. Language is a parameter of every artefact, including figures, readouts and captions. Source: DIN 1338, DIN 5008, ISO 80000-2.
16. Accessibility is a build output: tagged PDF, MathML, WCAG 2.2 contrast checked in CI. Source: WCAG 2.2; Typst 0.14; arXiv HTML.
17. Classical typographic quality in every medium: Knuth-Plass breaking, protrusion, real small caps, correct quotes. Source: Knuth-Plass (1981); Hàn Thế Thành (2000); Hochuli (2008).

## Recommendations

Ranked by impact on coherence; trade-off stated.

1. Build a DTCG token file before any package is designed (roles: ink, paper, rule, accent, plus 3-4 physics roles such as state, effect/measurement, dynamics/energy, environment; each with print-light, screen-light, screen-dark, video-dark modes in OKLCH; type scale; spacing) and a compiler to `.sty`, CSS, TS/GLSL, Typst, manim/Motion Canvas, Blender. Trade-off: a day of tooling before visible output; the only way 3-5 packages stay comparable and switchable.
2. Make the math-font decision explicit and test it in all four media before content work: (a) STIX Two everywhere (zero licence risk, Typst and MathML today; darker and wider than Times + MTPro2, no bold math); (b) Times + MTPro2 in print, STIX Two on screen (best print, visible PDF/web mismatch); (c) finish `mathtime-otf` and clear the licence for web (best of both, open-ended, legal question). Each design package should be specified against one of these.
3. Redesign the role palette for greyscale: replace `cgblue`/`birrenred`/`birrengreen` (same lightness) with a lightness-stepped set (Tol high-contrast is the verified baseline; TJO's teal family can be re-stepped in OKLCH to keep his identity); link colour to at least 4.5:1. Trade-off: fewer colours per figure; existing TikZ figures need redundant encoding.
4. Adopt a wide-margin page (about 66-character column; outer margin for sidenotes, zoom pointers, small multiples) in print, the same grid on the web (`l-body`/`l-gutter`). Trade-off: more pages; fewer page turns per concept.
5. Encode zoom as a typographic layer: print uses marked Track-2 blocks plus margin pointers to permanent tags (Stacks pattern); web expands in place with popups/collapses. Trade-off: every concept needs a stable tag and a summary paragraph; doubles as the definitions-database spine.
6. Web math as pre-rendered MathML with the print math font (Temml or MathJax 4 server-side, or Typst 0.15), MathJax 4 as fallback; retire client-side MathJax 3 from the GR pipeline. Trade-off: small browser differences; needs an OpenType MATH font (rec. 2).
7. Upright d, e, i via macros everywhere, plus `csquotes`, `siunitx` locale switching and `microtype` (protrusion under XeLaTeX now; expansion if LuaLaTeX). Trade-off: mechanical pass over 22 lectures; departs from common physics habit.
8. One rendering stack for demos and video (three.js offline renders, Motion Canvas for 2D), Blender only for volumetric orbitals, all reading shared physics code and tokens. Trade-off: less cinematic; guarantees identical data across media.
9. Games as Zachtronics-style formal puzzles with printable manuals, scored by physical quantities. Trade-off: less mass appeal than Duolingo mechanics; matches tone and correctness.
10. Pilot Typst for one chapter alongside XeLaTeX (tagged PDF, Knuth-Plass, MathML HTML from one source). Trade-off: no MTPro2 in Typst; TikZ would need replacing (CeTZ [UNVERIFIED maturity]).

## Open questions for TJO

1. Math font: exact print/screen match with STIX Two everywhere, or MathTime in print and STIX Two on screen, or finish `mathtime-otf` and check the PCTeX licence for web use?
2. Identity: keep the Whitney-teal identity of your talks (`STYLE_GUIDE.md` System A), re-stepped for greyscale, or start from a neutral scientific palette? Is Whitney licensed for web embedding (commercial Hoefler&Co face [UNVERIFIED terms])?
3. Track structure in print: marked Track-2 blocks inline, a separate appendix volume, or margin pointers into an online deeper layer (which would make the PDF not self-contained, against brief item 1)?
4. Upright d, e, i throughout, including German lectures where students' other courses use italic?
5. Typst as primary print engine if a one-chapter pilot passes, or XeLaTeX/LuaLaTeX fixed?
6. Dark mode for web and games; dark-ground (3b1b) or light-ground (book-like) videos? Decides whether video stills can be print figures.
7. Games: formal puzzle only, or also light narrative/character elements for Lehramt students who will use them with pupils?
8. Baskerville Companion Math: a candidate for one design package (needs non-swash italic capitals, specimen E), or a separate project?

---

## Correction note, 2026-10-11

Added by the Phase 0 coordinator from the codex review (`../review/REVIEW.md`, sections B and G;
path relative to `docs/plan/research/`). The text above is left as written, as evidence of the
campaign; where it conflicts with this note, the note governs.

- Line 22: BRIEF.md does not name the three designers attributed to it.
- Lines 27, 106: STIX Two is the specimens' preferred Times-family face, not technically unique; MathJax 4 ships a Termes face.
