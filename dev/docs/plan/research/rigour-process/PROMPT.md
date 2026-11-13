You are designing the CORRECTNESS AND RIGOUR PROCESS for a large teaching-material project. Read, in this order:
1. docs/plan/BRIEF.md (requirements by the course author TJO; note the sections "Rigour" and "Not negotiable")
2. docs/plan/CONTEXT.md
3. ../rk/CLAUDE.md, ../rk/skills/rk-light/SKILL.md, ../rk/docs/gate-contracts.md (skim), ../rk/skills/rk-light/references/lessons.md if present
4. ../arithmetic-quantum-mechanics/notation.md, definitions.md, CLAUDE.md, PRD.md (a worked example of a notation DB, definitions DB and claims DAG under those laws)
5. This repo's scripts/check_enrichment.py and scripts/check_parity.py and HANDOFF.md (how ground-truthing against the archived v0.1 script is done today)

Your lane: RIGOUR PROCESS. Teaching material is not a research campaign: most statements are textbook facts, but the author demands that every statement be ground-truthed against a local copy of a source (TeX, PDF, book), that every figure/demo/game/video be physically correct, and that notation and definitions be consistent across a PDF, dozens of HTML pages, games and videos, in two languages. Design the process. Produce a report (Markdown, under 600 lines, no emoji, SQLite-documentation tone) with:

A. Source registry: how sources are registered (sources/<key>/ with sha256 manifest, TeX preferred over PDF, page/line windows), licensing and what may be stored in the repo versus gitignored, and a triage of the sources the brief names (Plavala arXiv:2103.07469, Bratteli-Robinson, B. Simon / Reed-Simon on hydrogen self-adjointness, Busch-Lahti-Werner on uncertainty, Ludwig, Wigner/Bargmann, the author's own scripts and videos) by availability and by what each is the authority for.

B. Notation database and definitions database: schema (what fields; one symbol once; "first fixed in"; German/English names; LaTeX macro, Unicode, MathML/KaTeX rendering, three.js label), how the PDF, the web pages and the demos all consume the SAME database (generated macro files, generated JSON for the web), how a translation guide between sources' notations is structured (e.g. Plavala's cone notation vs. the Theo C script vs. Bratteli-Robinson), and the checker that fails the build when a symbol is used that is not in the database or a definition is restated.

C. Claims and provenance for teaching text: a typed status for every theorem-like unit (quoted from source / derived in-repo / numerically checked / stated without proof for the Lehramt track), a PROVENANCE ledger with byte-verified quotes, and a derived "zoom level" annotation; how to handle the author's own deviations from the sources (e.g. his operationalist framing, the incremental postulates P0-P5) so that they are marked as the author's stipulations and not as cited facts.

D. Figure, demo, game and video correctness: a gate design. Every figure has a formula-provenance header (already the convention here); every interactive demo has a golden-value test against an independent reference implementation (Julia); every game's scoring rule is a theorem or a computed quantity with a test; every video frame sequence is generated from the same verified data. Specify what "correct" means for a hydrogen-orbital cloud render (which density, which normalisation, which sampling, what tolerance) as a worked example of a gate specification.

E. Review cadence adapted from rk: reviewer != author, one review round plus one repair wave per milestone, codex gpt-6.1 as second model family, Opus/Sonnet as implementers, what is Tier A (physics correctness, notation DB, definitions) vs Tier B vs Tier C for this project.

F. Bilingual discipline: how German-leads-English-follows is enforced for the new artifacts, extending scripts/check_parity.py.

G. The minimal viable version of all this (what must exist before the first new chapter is written) and what can come later.

End with "## Recommendations" (ranked) and "## Open questions for TJO". Do not modify any files.
