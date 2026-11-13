<!-- ROLE: brief for the interactive demo c03.demo.spektren, 2026-10-29. UPDATE POLICY: coordinator only. -->

# Brief: demo `c03.demo.spektren`

## Goal

Lectures 3 and 4 live in course chapter C3 (`content/c03-hilbertraum/`). Every C3 figure has an
interactive demo except `c03.fig.spektren` (section c03.s12, file `figures/spektren.tex`): operator
classes recognised by where their eigenvalues lie. Build its demo, `c03.demo.spektren`, with the
static figure as its still, by the same recipe as `c03.demo.vollst` (HANDOFF.md entry 2026-10-21):
TS demo module + kernel functions in `web/src/kernels/hilbert.ts` + golden values from
`numerics/generate/hilbert_golden.jl` (independent of the kernel by construction) + tests in
`web/tests/kernels/hilbert.test.ts` + `\demo{c03.demo.spektren}` in de.tex/en.tex + the asset in
`chapter.json`.

## What the demo should teach (design is yours; this is the coordinator's sketch)

The point of c03.s12: the class of an operator decides where its eigenvalues can lie (Hermitian:
real axis; positive: half-axis lambda >= 0; projector: {0, 1}; unitary: unit circle; normal: no
constraint). A strong design lets the reader pick an operator (the chapter's A, B, C of
c03.ex.drei first; then a few others, e.g. small one-parameter families that move continuously
between classes, and a non-normal example) and see at once (1) which class tests it passes
(Â† = Â, ⟨ψ|Âψ⟩ ≥ 0, Â² = Â, Â†Â = 𝕀, Â†Â = ÂÂ†), each computed, and (2) its eigenvalues in the
complex plane against the loci of panel (a). Moving a parameter should show eigenvalues leaving a
locus exactly when the operator leaves the class. Keep it honest: the loci are necessary
conditions; say nothing the chapter does not (eigenvalues are introduced informally in s12; the
formal definition comes later with vl05). Normal operators: no constraint on location. Do not
overclaim (e.g. "real eigenvalues ⇒ Hermitian" is false; a non-normal example with real
eigenvalues makes that point if you want it).

Look at existing demos first (`web/src/demos/c03.demo.vollst.ts`, `c03.demo.kreuz.ts`,
`web/src/demos/c03/common.ts`, `plot.ts`, `web/src/demo/harness.ts`, `types.ts`, `tokens.ts`,
`web/README.md`, `web/CAPTURE-NOTES.md`) and reuse their idiom, tokens and harness. Hue must not
carry meaning alone (shape and dash, as in the still). Bilingual de/en strings. Phone width works.

## Conventions

Hats on operators (`registry/conventions.json` CONV-HAT): not on states, Pauli matrices, ket-bras
or the identity. TJO's voice: plain, direct; no em dashes in prose; German leads.
Authoring contract: `docs/authoring/CONTRACT.md`. Figure/demo text claims nothing that is not in
the chapter or in `evidence/claims.json`.

## Ownership (yours; nobody else edits these now)

`web/src/demos/c03.demo.spektren.ts`, `web/src/demos/c03/**`, `web/src/kernels/hilbert.ts`,
`web/tests/kernels/hilbert.test.ts`, `web/tests/golden/hilbert.json`,
`numerics/generate/hilbert_golden.jl`, `content/c03-hilbertraum/**`, `tests/red/**` only if a gate
needs a new red case, `docs/plan/lec34/NOTES-demo.md` (your notes: design choices, what you
measured, open questions). If you need anything else changed, write it under "Requests" in your
NOTES and say so in your report.

## Builds and gates (shared machine)

Environment: `export NVM_DIR=$HOME/.nvm; . $NVM_DIR/nvm.sh; export PATH=$HOME/.juliaup/bin:$PATH`.
- Golden: `julia --project=numerics numerics/generate/hilbert_golden.jl` then `--check`.
- Kernel tests: `cd web && npx vitest run tests/kernels/hilbert.test.ts`.
- Course: `bash scripts/course/build_course.sh --chapters c03 --all-editions --out build/lane-demo`,
  then `python3 scripts/course/check_levels.py --chapters c03 --build build/lane-demo`.
- Web, the full check including browser gates:
  `bash web/check.sh --chapters c03 --course-build build/lane-demo --out build/lane-demo-web`
  (use `--fast` while iterating; the final run without it).
- Registry/lint if you touch chapter text: `python3 scripts/registry/check_registry.py`, and the
  content lint the course build runs.
- Never run `./ci.sh`. Never write into the default build dirs. Do not commit.
- Look at your demo: take screenshots (Playwright is installed under web/) at desktop and phone
  width, in light and dark, and check them yourself before reporting.
