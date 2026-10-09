You are a hostile but fair reviewer of a planning campaign. The course author (TJO) wants a major upgrade of his quantum-mechanics-to-thermodynamics course into a layered print PDF, HTML chapters with three.js demos, HTML games and 3D videos, all physically correct and ground-truthed. Nine research lanes have reported. Your job is to find what is wrong, missing, contradictory or overclaimed BEFORE the orchestrator assembles the final plan.

Read, in this order:
1. docs/plan/BRIEF.md (the author's requirements; the authority)
2. docs/plan/CONTEXT.md
3. docs/plan/research/sources-inventory/REPORT.md
4. docs/plan/research/curriculum/REPORT.md and notation-preinventory.md
5. docs/plan/research/layered-docs/REPORT.md (and skim prototype/levels.sty, check_levels.py)
6. docs/plan/research/design-research/REPORT.md and palette-measurements.md
7. docs/plan/research/design-packages-A/REPORT.md and its PKG-*.md files
8. docs/plan/research/design-packages-B/REPORT.md and its PKG-*.md files
9. docs/plan/research/demos-games-video/REPORT.md (IDEAS.md only where you need to check a specific claim)
10. docs/plan/research/tech-stack/REPORT.md
11. docs/plan/research/rigour-process/REPORT.md

Then write a review (Markdown, under 400 lines, no emoji) with these sections:

A. Contradictions between lanes. Where two reports recommend incompatible things (e.g. authoring system, math font, number of depth levels, web math rendering, video stack, finite- vs infinite-dimensional GPT), state both positions, say which is better supported by evidence in the reports, and what decision the author must make.

B. Physics and mathematics claims to verify. The lanes claim several defects in the existing script (vl16 Laguerre sign and 2p normalisation, vl22 canonical Lagrangian sign, vl04 Hermitian/self-adjoint, vl19 k_B value) and several errors in the Astwood Fock-space notes. Independently verify each claim you can (read latex/lectures/de/vl16.tex lines 80-100, vl22.tex lines 20-30, vl04.tex line 70, vl19.tex line 21, and the Astwood file at /tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/235a3d3d-d7d4-4e21-a935-01a7e791a128/scratchpad/gh/advancedquantum/Source Files/advancedquantum.tex at the lines the curriculum report cites in hazards H14.x). Compute where needed; you may run python3. Also check the curriculum lane's two framework claims: that Plavala's framework is finite-dimensional by axiom and never uses "Archimedean" (grep docs/plan/research/curriculum/plavala-src/), and that "positive linear functionals on B(H) of norm 1" is a strictly larger set than the density operators in infinite dimension. State for each: CONFIRMED / REFUTED / COULD NOT CHECK, with the evidence.

C. Overclaims and unverified load-bearing facts. List every place a lane's recommendation rests on something marked [UNVERIFIED] or on no citation, where being wrong would change the plan (licence terms of MTPro2 and Whitney for web use, Typst MathML export status, browser MathML Core support, Playwright headless WebGL, CoolProp WASM availability, etc.).

D. Gaps. What the brief asks for that no lane covers, or covers too thinly: e.g. the student's point of view and classroom use by Lehramt students, assessment/exercises, accessibility, hosting and offline distribution, the German/English translation workflow for the new chapters, how the 25 existing video transcripts are reused, what happens to the existing 22 lectures and the parity CI during the transition, legal review of the Astwood notes, time and money budget realism.

E. Effort realism. The demos lane estimates 254-335 agent-days for 105 ideas plus 55-80 for engines; the curriculum lane estimates 545 printed pages. Assess whether these are plausible for an agent-driven build with one human reviewer, and propose the cut that makes a first release achievable (which chapters, which flagships, which packages).

F. Ranked list of the 10 decisions the author must make first, each with the lane evidence for the options and your recommendation.

G. A short list of corrections the orchestrator should make to the lane reports before they are used (factual errors you found, with file and line).

Be specific: cite file paths and line numbers. Do not modify any files.
