<!-- ROLE: facts about the repo, the sibling repos, and the machine that every planning lane
     may rely on. Authored by the orchestrator on 2026-10-09. Lanes must not edit it. -->

# Context for the planning lanes

## This repo (`/home/tobias/Projects/theoretical-physics-C`)

- Bilingual (German leads, English follows) XeLaTeX lecture notes, 22 lectures (`latex/lectures/de/vl01-vl22.tex`, `latex/lectures/en/lec01-lec22.tex`), 84 pages German. Topics: birth of QM and probability (vl01), Hilbert space, operators (vl02-05), postulates (vl06), particle in 1D, Schroedinger equation, Fourier (vl07-08), uncertainty (vl09), spreading wavepacket (vl10), box, oscillator, finite well (vl11-13), angular momentum, central potential, hydrogen (vl14-16), spin (vl17), identical particles (vl18), entropy, microcanonical, temperature, canonical (vl19-22).
- `HANDOFF.md` and `README.md` at the repo root describe the build (`build.sh`, `ci.sh`), the parity checker (`scripts/check_parity.py`), the enrichment checker (`scripts/check_enrichment.py`), and the figure conventions (`_work/figure-plan.md`, reference figure `latex/figures/fig_vl11_kasten.tex`).
- 22 TikZ figures, one per lecture, geometry from formulas, bilingual via `\tpcifenglish{}{}`.
- Transcripts of the 25 lecture videos reconstructed in `transcripts/clean/v01-v25.md`; `transcripts/MAPPING.md` maps videos to lectures.
- Archive of the original v0.1 script in `archive/skript-2022/`; student corrections in `archive/corrections/`.
- Style files: `latex/tpc-style.sty` (Times LT Std + Whitney + MTPro2; `--cmfonts` fallback), `latex/tpc-macros.sty`, `latex/tpc-tikz-templates.sty`.

## Sibling repos worth reading

- `../generalrelativity`: the template this repo was modelled on. Julia simulations (`scripts/sim_*.jl`) produce `.dat` files consumed by pgfplots figures; a pandoc web pipeline (`web/preprocess.py`, `web/gr-filter.lua`, `web/postprocess.py`, `web/template.html`, MathJax 3) renders lectures to `docs/*.html` with interactive widgets (`web/widgets/`, three.js demos such as `docs/geodesic-bump.html`). Its `HANDOFF.md` documents the whole pipeline. An addendum there was adversarially verified with the `af` tool (`proofs/lecA1/`).
- `../rk`: the research-automation tool and its CLAUDE.md define the rigour standard TJO wants: red-green tests, red corpus first, bytes-not-memory provenance (every external fact is a quote verified inside a local hashed source), typed and derived claim status, reviewer != author, one review round plus one repair wave, bounded processes, no emoji, concrete numbers, docs move with content. Skill `rk-light` (`../rk/skills/rk-light/SKILL.md`) is the light-weight protocol: BRIEF / STATE / CONVENTIONS / CLAIMS / PROVENANCE / DEAD-ROUTES ledgers, `sources/<key>/` with sha256 manifests.
- `../arithmetic-quantum-mechanics`: a worked example of a blessed `notation.md` (one table, every symbol once, "first fixed in") and `definitions.md` (numbered `Dn`, never renumbered, every choice named inside the definition; a property asserted inside a definition is a claim and lives in the claims ledger).
- `../mathfonts`: TJO's own Baskerville companion math font project (v0.140), with a verification protocol for type design. Relevant to the print design discussion.
- `../physics-visualisations`: a Three.js scientific visualisation project with an acceptance-gate culture (field data from solvers, labelled extrusions, numbered gates).

## Sources on disk (verified 2026-10-09)

- Plavala, "General probabilistic theories: an introduction", arXiv:2103.07469v2 LaTeX source: `~/Downloads/arXiv-2103.07469v2.tar.gz` (not yet registered in this repo).
- The v0.1 and v0.2 Theo C script (this repo).
- TJO's handwritten notes "Symmetries and quantum mechanics" exist only as a reMarkable document (`../remarkable-stuff/raw/Teaching/Symmetries and quantum mechanics.rmdoc`); not yet transcribed.
- TJO's advanced quantum theory course (summer 2016, 18 video lectures of about 80 minutes each, playlist https://www.youtube.com/playlist?list=PLDfPUNusx1Eo60qx3Od2KLUL4b7VDPo9F). Notes were written by a student, Michael Astwood (https://github.com/mastwood/advancedquantum, 55-page PDF, one 1487-line LaTeX file); a shallow clone is at `/tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/235a3d3d-d7d4-4e21-a935-01a7e791a128/scratchpad/gh/advancedquantum/`. Sections: Introductions; Relative Space and Quantization; Fock Space; Canonical (Anti)-Commutation Relations; Examples of Multi-Particle Systems; Scattering Theory; Symmetries and Wigner's Theorem. This is the "Bratteli-Robinson plus my extras" source for the Fock-space part. Student notes, not TJO's own text: treat as a secondary source that must be checked against the videos and against Bratteli-Robinson.
- Other TJO repos, shallow-cloned to the same scratchpad `gh/` directory: `presentations` (STYLE_GUIDE.md and DESIGN_DATA.md, a style guide distilled from 15 years of TJO's talks: two design systems, typography, colour palettes), `mathtime-otf` (MathTime Pro 2 to OpenType-math conversion for Typst/LuaTeX, PRD stage), `quantumcomputing` (3 lectures, pandoc web pipeline, interactive Bloch sphere / Grover / Solovay-Kitaev pages at https://tobiasosborne.github.io/quantumcomputing/), `quantum-noise-and-decoherence` (lecture notes).
- NOT on disk (as far as a filename search shows): Bratteli-Robinson vols 1-2, B. Simon's hydrogen/self-adjointness material (Reed-Simon), Ludwig's Foundations, the Busch-Lahti-Werner uncertainty papers, Teschl, Hall, Wigner/Bargmann. TJO's advanced QM course notes (Bratteli-Robinson plus extras) have not been located; the plan must ask for them.
- `~/Downloads` has 111 PDFs, unsorted.

## Toolchain on the machine

- XeLaTeX with Times LT Std, Whitney, MTPro2, LucimaTX installed (the GR and TPC fonts). Also installed: Baskerville 10/120 Pro, EB Garamond, Bitstream Charter, Inter, Linux Libertine, Iosevka, GFS Baskerville.
- Typst (`~/.local/bin/typst`), Julia (juliaup), Node 24, Bun, Python 3, ffmpeg. No Manim, no Blender found on PATH.
- `codex exec` (codex-cli 0.162) with default model gpt-6.1-sol at xhigh reasoning; used for independent reviews.
- Playwright has been used in `../generalrelativity` for web checks.

## Rules for every lane

1. Write only inside your own directory `docs/plan/research/<lane>/`. Touch nothing else in this repo or any sibling repo.
2. Main deliverable: `docs/plan/research/<lane>/REPORT.md`. Keep it under roughly 600 lines; put long tables or appendices in extra files in the same directory.
3. Every external fact (a book, paper, tool, library, design precedent) carries a reference: URL, DOI, arXiv id, or a local path. Mark anything you could not verify as `[UNVERIFIED]`. Never invent citations.
4. No emoji, no marketing prose. Concrete numbers and names. Write like SQLite documentation.
5. End with two sections: `## Recommendations` (ranked, with the trade-off stated) and `## Open questions for TJO` (decisions only he can make).
6. Do not spawn further subagents unless your brief says so.
7. Timebox: aim to finish within about 60-90 minutes of work; depth over breadth, but cover the brief fully.
