
<!-- ROLE: every design precedent found by the design-research lane, as one table.
     Authored 2026-10-09. Companion to REPORT.md. UPDATE POLICY: append rows; mark unverified cells. -->

# Design landscape: precedents

| Name | Medium | Year | What it does well | What to steal | URL |
|---|---|---|---|---|---|
| Distill journal + template | Web journal | 2016-2021 | Named layout grid with gutter for marginalia; hover citations/footnotes | `l-body`/`l-gutter` grid; lesson that per-article craft does not scale | https://distill.pub/guide/ ; https://distill.pub/2021/distill-hiatus/ |
| Hohman et al., Communicating with Interactive Articles | Web article (review) | 2020 | Synthesises learning, journalism, vis research into 5 affordances | Checklist for every HTML chapter | https://doi.org/10.23915/distill.00028 |
| Bartosz Ciechanowski essays | Web essays | 2019-2024 | Dozens of small reader-controlled physical simulations per essay | Figure density; reader-controlled state; no scrolljacking | https://ciechanow.ski/archives/ |
| Bret Victor, Explorable Explanations | Essay | 2011 | Reactive documents, explorable examples, contextual info | The vocabulary and goals of the web lane | https://worrydream.com/ExplorableExplanations/ |
| explorabl.es hub | Web index | ongoing | Curated catalogue of explorables | Benchmark set for demos | https://explorabl.es/ |
| Parable of the Polygons (Case, Hart) | Web explorable | 2014 | Guided steps then sandbox; warm hand-drawn style | Guided-then-free structure | https://en.wikipedia.org/wiki/Parable_of_the_Polygons |
| The Evolution of Trust (Case) | Web game/explorable | 2017 [UNVERIFIED year] | Game theory in about 30 min, no points | Short complete arcs per concept | https://en.wikipedia.org/wiki/Nicky_Case |
| Quantum Country (Matuschak, Nielsen) | Web book + SRS | 2019 | 112 embedded review prompts, spaced e-mail review | Embedded retrieval practice for Lehramt readers | https://quantum.country/ |
| Living Papers (Heer et al.) | Toolkit | 2023 | One source to interactive web, PDF and API | Single-source architecture | https://idl.uw.edu/living-papers-paper |
| gwern.net | Website | ongoing | Sidenotes, recursive popups, collapses, monochrome, dark mode; "semantic zoom" | Zoom-in-place UI for chapters | https://gwern.net/design |
| Stacks project / Kerodon (Gerby) | LaTeX-to-web | 2018- | Permanent tags for every numbered item | Stable tags for definitions DB and cross-media links | https://pbelmans.ncag.info/blog/2018/10/17/kerodon/ |
| Observable Plot / Notebooks 2.0 | Library / notebooks | 2021 / 2025 | Concise grammar of marks; open notebook format | Reactive runtime for demos | https://observablehq.com/plot/ ; https://observablehq.com/blog/previewing-notebooks-2 |
| The Pudding | Visual essays | 2017- | Long shelf life topics; explicit kill process | Editorial gate for demo ideas | https://pudding.cool/process/pivot-continue-down/ |
| Our World in Data Grapher | Chart engine | 2016-; redesign 2023 | JSON-configured charts, every chart ships data, consistent controls | "Every figure ships its data" | https://ourworldindata.org/owid-grapher |
| Quanta Magazine graphics | Magazine | 2014- | Internal graphics style guide; storytelling over literalism | Style guide plus scientific standards | https://sketchfab.com/blogs/community/science-spotlight-quanta-magazine |
| Nature research figure guide | Journal practice | current | Editable vectors so editors impose house style | Redraw step into one house style | https://research-figure-guide.nature.com/ |
| Stripe Press (Hamming edition etc.) | Print books | 2018- | Redrawn figures (70+ in Hamming); per-book identity in press system | Redraw inherited figures; identity system | https://press.stripe.com/ |
| Tufte, Seeing with Fresh Eyes | Book | 2020 | Graphical sentences, content-responsive typography | Word-sized inline graphics | https://edwardtufte.com/tufte/seeing-with-fresh-eyes |
| Needham, Visual Complex Analysis (25th ed.) | Book | 2023 | 501 diagrams with self-contained captions | Caption carries the argument | https://global.oup.com/ [UNVERIFIED exact page] |
| Needham, Visual Differential Geometry and Forms | Book | 2021 | 235 hand-drawn geometric diagrams | Geometry-first exposition | https://press.princeton.edu/ [UNVERIFIED exact page] |
| Kosara, The Scrollytelling Scourge | Critique | 2016 | Names brittleness and scroll-control problems | Rule: scroll never drives state | https://eagereyes.org/blog/2016/the-scrollytelling-scourge |
| OpenType 1.8 variable fonts | Font tech | 2016 | Weight/width/optical size in one file | Medium-specific weights from one font | https://typenetwork.com/articles/atypi-warsaw-2016-day-2-part-i-the-return-of-the-multiple-master |
| Oklab / OKLCH | Colour space | 2020; CSS 2023 | Perceptually uniform lightness, chroma, hue | Token authoring space | https://bottosson.github.io/posts/oklab/ |
| Viridis family | Colour map | 2015 | Uniform, CVD-safe, greyscale-monotone | Default sequential map | https://bids.github.io/colormap/ [UNVERIFIED URL] |
| Crameri Scientific Colour Maps | Colour maps + paper | 2020 | Evidence-based guide against rainbow maps | Diverging/cyclic maps (phases of wavefunctions) | https://doi.org/10.1038/s41467-020-19160-7 |
| Paul Tol schemes | Palettes | 2021 (3.2) | CVD-safe; high-contrast set stepped in lightness | Greyscale-safe role colours | https://pypi.org/project/tol-colors/ |
| Okabe-Ito CUD palette | Palette | 2008 | 8 colours distinguishable for common CVD | Categorical fallback | https://jfly.uni-koeln.de/color/ |
| Chameleon (dark-mode vis) | Research | 2025 | Shows inversion/background-only darkening fail | Dark mode as separate token mode | https://arxiv.org/abs/2512.00516 |
| EU data-vis guide, dark mode | Guide | current | Concrete dark-mode recolouring rules | Rules for dark token mode | https://data.europa.eu/apps/data-visualisation-guide/dark-mode |
| WCAG 2.2 | Standard | 2023 | Contrast thresholds 4.5:1 / 3:1 | CI contrast checks | https://www.w3.org/TR/WCAG22/ |
| Apple Liquid Glass | Design system | 2025 | Cautionary: translucency hurts legibility | Opaque plates behind text over 3D | https://pxlnv.com/blog/on-liquid-glass/ |
| Material 3 Expressive | Design system | 2025 | Component states, tonal palettes (vendor research) | Slider/toggle/focus specs | https://chromeunboxed.com/google-leaks-the-reason-and-process-behind-their-new-material-3-expressive-design-language |
| Khan Academy Wonder Blocks | Design system | 2018-; refresh 2025 | Consolidated 50+ button styles; rebuilt semantic colour | Semantic tokens, governance | https://designsystems.com/about-wonder-blocks-khan-academys-design-system-and-the-story-behind-it |
| DTCG format 2025.10 | Token spec | 2025 | Vendor-neutral tokens with theming, OKLCH | The cross-media palette mechanism | https://www.designtokens.org/ |
| MathTime Professional 2 | Math font (Type 1) | 2000s [UNVERIFIED year] | Times-matched math with script optical sizes | Print baseline (current) | https://pctex.com/mtpro2.html |
| STIX Two | Text + math OTF | 2016-2025 | Times-derived, OFL, works in TeX/Typst/MathJax/MathML | Cross-media math font | https://github.com/stipub/stixfonts |
| Minion Math | Math OTF | 2009- | 5 optical sizes x 4 weights matched to Minion | Premium print alternative | https://luc.devroye.org/fonts-46519.html |
| Lucida Bright Math OT | Math OTF | 2012-2023 | Large x-height, Demi math weight | Screen-robust alternative | https://tug.org/store/lucida/lucidaot.pdf |
| Libertinus Math | Math OTF | 2016- | Coherent free family | Light screen-friendly option | https://github.com/alerque/libertinus |
| New Computer Modern Math | Math OTF | 2019- | Most complete coverage | Coverage fallback | https://ctan.org/pkg/newcomputermodern |
| Garamond Math / Erewhon / Kp / Fira Math | Math OTF | 2018-2023 | Free matched math for Garamond, Utopia, Palatino, Fira | Package variants | https://doi.org/10.47397/tb/44-2/tb137vieth-otmath |
| Vieth, updated survey of OpenType math fonts | TUGboat article | 2023 | Complete census of OTF math fonts | Font-choice evidence | https://tug.org/TUGboat/tb44-2/tb137vieth-otmath.pdf |
| Hagen & Sundqvist LMTX math series | TUGboat articles | 2022-2025 | Frontier of math micro/macro typography | Quality criteria for proofs | https://tug.org/TUGboat/tb44-2/tb137sundqvist-otmath.pdf |
| Typst 0.14 / 0.15 | Typesetter | 2025 / 2026 | Knuth-Plass, tagged PDF, MathML HTML, variable fonts | Single-source print + web pilot | https://typst.app/blog/2026/typst-0.15 |
| MathML Core in Chromium | Browser | 2023 | Native math with any OpenType MATH font | Print-faithful web math | https://mathml.igalia.com/news/2023/01/10/mathml-in-chromium-project-is-completed/ |
| Temml | Library | 2021- | LaTeX to MathML, font-agnostic | Server-side math rendering | https://temml.org/ |
| MathJax 4 | Library | 2025 [UNVERIFIED release date] | 11 fonts incl. STIX2 | Fallback renderer | https://docs.mathjax.org/en/v4.0/output/fonts.html |
| KaTeX | Library | 2014- | Fast | Not usable: single fixed font | https://katex.org/ |
| arXiv HTML (LaTeXML) | Web papers | 2023- | Accessible HTML from LaTeX | Accessibility baseline | https://blog.arxiv.org/2023/12/21/accessibility-update-arxiv-now-offers-papers-in-html-format |
| microtype / Hàn Thế Thành thesis | TeX package / thesis | 2000- | Protrusion and expansion | Enable protrusion now | https://tug.org/TUGboat/tb21-4/tb69beet.pdf |
| Knuth-Plass algorithm | Paper | 1981 | Total-fit paragraph breaking | Required in any engine | https://doi.org/10.1002/spe.4380111102 |
| Butterick, Practical Typography | Web book | ongoing | Measurable rules (45-90 chars) | Measure, spacing rules | https://practicaltypography.com/ |
| Bringhurst, Elements of Typographic Style v4.3 | Book | 2019 | Classical book typography | Measure, scale, page proportions | [UNVERIFIED publisher page] |
| Hochuli, Detail in Typography | Book | 2008 | Micro-spacing as a system | Inline math spacing | https://hyphenpress.co.uk/ |
| Higham, ISO typesetting post | Blog | 2016 | Upright e, i, d practice and macros | Macro set | https://nhigham.com/2016/01/28/typesetting-mathematics-according-to-the-iso-standard/ |
| Beccari, ISO 31/XI in LaTeX | TUGboat | 1997 | Physics vs math typesetting differences | Upright operators, spacing | https://tug.org/TUGboat/tb18-1/tb54becc.pdf |
| Doumont, Trees, Maps, and Theorems | Book | 2009 | Message-first communication | Caption-as-message | https://www.tug.org/books/reviews/tb103reviews-doumont.html |
| Wong, WSJ Guide to Information Graphics | Book | 2010 [UNVERIFIED] | Practical chart rules | Direct labels, sparse colour | [UNVERIFIED URL] |
| Wilke, Fundamentals of Data Visualization | Book | 2019 | Proportional ink, redundant coding | Figure rules | https://clauswilke.com/dataviz/ |
| Healy, Data Visualization | Book | 2018 | Why graphs succeed or fail | Figure critique practice | https://socviz.co/ |
| Nature Methods Points of View | Column | 2010- | Short evidence-based figure advice | Colour coding, layout rules | https://communities.springernature.com/posts/data-visualization-a-view-of-every-points-of-view-column |
| Penrose | Diagram system | 2020 | Diagrams from math notation + style | Computed, style-separated diagrams | https://penrose.cs.cmu.edu/siggraph20 |
| Feynman Lectures online | Web book | 2013- | HTML5 + MathJax + SVG figures of a classic | Web edition of a canonical text | https://www.feynmanlectures.caltech.edu/info/flp.html |
| Cham & Whiteson books | Illustrated books | 2017, 2021 | Cartoon register that de-intimidates | Light register for Lehramt asides | https://www.penguinrandomhouse.com/books/625525/frequently-asked-questions-about-the-universe-by-jorge-cham-and-daniel-whiteson/ |
| 3Blue1Brown / manim | Video + library | 2015- | Colour per object, formula morphs, TeX math | Cross-media colour identity | https://github.com/3b1b/manim |
| Kurzgesagt | Video | 2013- | Per-video published source sheet | Source sheet per video (rigour) | https://kurzgesagt.org/youtube/ |
| Primer (Justin Helps) | Video | 2018- | Simulation-driven explanation (Blender, then Unity) | Videos from the simulation code | https://github.com/Helpsypoo/primerpython |
| Sebastian Lague, Coding Adventures | Video | 2019- | Code and result side by side | Show the computation | [UNVERIFIED channel URL] |
| Acerola | Video | 2022- | Graphics-programming rigour, colour explainer | Colour/tonemapping awareness | https://www.realtimerendering.com/blog/2024/08/ |
| Motion Canvas | Animation library | 2022- | TypeScript, voice-over sync | Shared TS stack for web and video | https://motioncanvas.io/docs |
| Veritasium | Video | 2011- | Real experiments, interviews | Live demonstrations | [UNVERIFIED channel URL] |
| MinutePhysics | Video | 2011- | Hand-drawn whiteboard register | Low-fi register for short clips | [UNVERIFIED channel URL] |
| Eugene Khutoryansky | Video | 2010s | Ambitious 3D | Negative example: unmotivated camera/decoration | https://rettacs.org/?p=3084 |
| Zachtronics (Exapunks zines) | Games + print | 2015-2022 | Formal-system puzzles; printable manuals; solution histograms | Game plus printed field manual | https://www.zachtronics.com/zachtronics-museum |
| The Witness | Game | 2016 | Teaching rules without text | Puzzle sequencing | https://en.wikipedia.org/wiki/The_Witness_(2016_video_game) |
| Baba Is You | Game | 2019 | Rules as manipulable objects | Make axioms tangible pieces | https://en.wikipedia.org/wiki/Baba_Is_You |
| Quantum Game with Photons | Web game | 2016; v2 2020 | Correct quantum optics, real experiments as levels | Physically exact puzzles | https://quantumgame.io/ |
| Hello Quantum | Mobile game | 2018 | Two-qubit states as visual grid | Minimal-move puzzles | https://www.unibas.ch/de/Aktuell/News/Uni-Research/Hallo-Quanten-Basler-Physiker-entwickelt-Spiele-App-mit-IBM.html |
| Quantum Odyssey | PC game | 2025 | Circuits runnable on IBM hardware; certificate | Export to real formalism | https://store.steampowered.com/app/2802710/ [UNVERIFIED URL form] |
| Quantum Moves | Citizen-science game | 2012- | Atom transport as liquid-in-well | Caution: claims retracted [UNVERIFIED] | https://en.wikipedia.org/wiki/Quantum_Moves |
| A Slower Speed of Light | Game | 2012 | Correct relativistic rendering of a labelled counterfactual | Label counterfactual physics | https://en.wikipedia.org/wiki/A_Slower_Speed_of_Light |
| Outer Wilds | Game | 2019 | Simulated solar system as level design | Physics as the level | https://vice.com/en/article/how-outer-wilds-developers-mobius-digital-made-space-physics-fun |
| Universe Sandbox | Simulator | 2008- [UNVERIFIED] | Interactive N-body and climate | Sandbox mode | https://universesandbox.com/ [UNVERIFIED] |
| Brilliant.org | Learning app | 2012- | Immediate-feedback interactives | Feedback states | https://brilliant.org/ |
| Duolingo | Learning app | 2011- | Strong brand system | Negative reference for tone (streaks, mascots) | https://www.creativebloq.com/news/feather-bold |
| Mayer, Multimedia Learning 3rd ed. | Book | 2020/2021 | 15 evidence-based principles | Design rules for every medium | https://assets.cambridge.org/97813166/38088/frontmatter/9781316638088_frontmatter.pdf |
| Ainsworth, DeFT | Paper | 2006 | Conditions for multiple representations | Cross-media identity rule | https://doi.org/10.1016/j.learninstruc.2006.03.001 |
| Schneider et al., signalling meta-analysis | Paper | 2018 | 103 studies on signalling | Cueing of essentials | https://doi.org/10.1016/j.edurev.2017.11.001 [UNVERIFIED DOI] |
| DIN 1338 | Standard | 2011 | German formula setting | Upright constants | https://www.dinmedia.de/de/norm/din-1338/137504292 |
| ISO 80000-2 | Standard | 2019 | Mathematical signs and typefaces | Upright d, e, i | https://www.iso.org/standard/64973.html [UNVERIFIED URL] |
| TJO presentation style guide | Internal | 2009-2025 | Whitney-teal identity, one idea per slide | Identity and commandments | scratchpad gh/presentations/STYLE_GUIDE.md |
| TJO Baskerville Companion Math | Internal font | 2026 | Measured, protocol-verified type design | Possible bespoke package | ../mathfonts/README.md |

