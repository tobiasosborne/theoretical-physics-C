<!-- ROLE: shared brief for bringing lectures 3 and 4 to the new level (course C3 and script v0.3),
     2026-10-29. Every lane reads this first. UPDATE POLICY: the coordinator only. -->

# Brief: lectures 3 and 4, course and script

## Goal

1. **Course.** Lecture 4 (`latex/lectures/de/vl04.tex`, "Operatoren") migrates into chapter C3
   (`content/c03-hilbertraum/`) as new Kern sections `c03.s8`, `c03.s9`, ... (after `c03.s7`, before
   the Fundament blocks), with Vertiefung/Fundament blocks as needed, together with the 14 vl03 items
   deferred to it (`evidence/migrations/maps/vl03-map.json` items 116-129, the vl03 subsection
   "Operatoren", M-0024). Same recipe as lecture 3 (HANDOFF.md, entry 2026-10-21).
2. **Script v0.3.** Script chapters 3 and 4 (`vl03`/`lec03`, `vl04`/`lec04`) get the treatment
   chapters 1 and 2 got (`docs/plan/script-v0.3/BRIEF.md`; its rules 1-8 apply here unchanged, with
   "chapters 3 and 4" for "chapters 1 and 2"): the Kern of the course, condensed, in the new design.
3. **Lecture 3 closed.** Second review of the repaired C3 prose, TJO's answers to G-0072 applied.

## TJO's decisions (2026-10-29)

- **D-HAT. Hats on all operators, throughout** (course and script): `\op{A}` (registry
  `sym.operator-hat`, now to be blessed). Exception, by the coordinator, not objected to: the
  identity stays `\mathbb{I}` (`sym.identity`) without a hat. **Revised by TJO the same day: no
  hats on states (density operators ρ, also a pure state written as an operator) and none on the
  Pauli matrices σ.** Projectors, unitaries, Hamiltonians, effects, observables: hatted.
  **Also no hats on ket-bras** |a⟩⟨b| (TJO, same day: "definitely no hats for bra kets"). Existing chapters (c02 where it has Hilbert-space
  operators, c03, c11) are swept. Script chapters 5-22 are NOT touched now (known seam at ch4/ch5).
- **D-BUDGET-FLEX (TJO, 2026-10-29, overrides "hard" below).** The budgets are guides, not
  targets: "Understanding is our goal, not some arbitrary number." Exceeding a budget is allowed
  when the text gains understanding by it; every exception is stated in the lane's NOTES with its
  reason (what the extra words buy). Never meet a budget by a hack (source-whitespace compaction,
  moving prose into displays or macros, counting tricks): such changes are reverted.
- **D-BUDGET.** `wc -w` on the .tex source is binding (also report `texcount -1 -sum`):
  ch3 (vl03) at most **1370** words, ch4 (vl04) at most **1190** (German; English in parity);
  ch3 + ch4 together no more pages than today in the full master (pp. 10-18, 9 pages); no more
  display equations or examples than v0.2 (vl03: 34 displays, 5 examples; vl04: 24 displays,
  1 example); definitions counted semantically with an inventory table from the start (lesson of
  ch1-2: REVIEW.md "KERNEL").
- **D-SPEKTREN.** The vl04 spectra figure (`latex/figures/fig_vl04_spektren.tex`) and its paragraph
  are NOT deferred: they go into C3 with vl04, eigenvalues explained informally the way vl04:207
  does it; the formal eigenvalue definition comes later with vl05 into the same chapter. The figure
  becomes the demo `c03.demo.spektren` (Wave 2).
- **G-0072, TJO takes the coordinator's recommendations:** (a) put the |e_±> remark (v03
  [49:20]-[49:46]) back into c03.s4 as TJO's own forward pointer, transcript as evidence; (b) keep
  "Cauchy-Schwarz steckt hinter der Unschärferelation", phrased so that the later uncertainty proof
  (positivity of (Â + iλB̂)†(Â + iλB̂)) visibly picks it up; (c) the dropped dimension count stays
  dropped; (d) "Gram-Schmidt liefert immer eine Basis" stays not adopted; (e) the Kern/Vertiefung
  split for bases stands. **D14** body with the explanation of "vollständig" is accepted.

## Correctness hazards to handle (docs/plan/research/curriculum/REPORT.md)

- H3.1 / M-0005: vl04:70 "hermitesch (Synonym: selbstadjungiert)". True for bounded operators
  (in particular every operator on a finite-dimensional space); in infinite dimension symmetric and
  self-adjoint differ (domains). Kern: finite dimension, say so. The distinction goes to a
  Vertiefung or Fundament block. Authority: Reed-Simon I (VI, VIII) / II, page images in `sources/`.
- H3.2: vl04:5 "Die Vektoren des Hilbertraums beschreiben die Zustände" contradicts the course
  (states are density operators, C4). Do not repeat it.

## Lanes and file ownership (no lane edits another lane's files; nobody commits)

| Lane | Agent | Owns |
|---|---|---|
| E evidence | Sonnet | `sources/**`, `evidence/**` (claims, provenance, gaps, migrations, maps, receipts), `scripts/evidence/**`, `scripts/check_enrichment.py` |
| R2 review | codex | nothing; writes its report through `-o` |
| G registry | Sonnet | `registry/**`, `scripts/registry/**` |
| A author C3 | Opus | `content/c03-hilbertraum/**`, `evidence/derivations/c03/**`, `docs/plan/lec34/NOTES-author.md` |
| H hat sweep | Sonnet | `content/c02-gpt/**`, `content/c11-wasserstoff/**`, `scripts/c11/**`, `scripts/c02/**`, `docs/plan/lec34/NOTES-hats.md` |
| S script ch3 / ch4 | Opus | `latex/lectures/de/vl03.tex`, `vl04.tex`, `latex/lectures/en/lec03.tex`, `lec04.tex`, `latex/figures/fig_vl03_*`, `fig_vl04_*`, `docs/plan/script-v0.3/sync-ch3.md`, `sync-ch4.md`, `NOTES-ch3.md`, `NOTES-ch4.md` |

Need a change in a file you do not own? Write it under "Requests" in your NOTES file and say so in
your final report; the coordinator relays.

## Builds (shared machine; never the default output dirs)

- Course: `bash scripts/course/build_course.sh --chapters c03 --all-editions --out build/lane-<X>`,
  then `python3 scripts/course/check_levels.py --chapters c03 --build build/lane-<X>`.
- Web: `bash web/check.sh --chapters c03 --fast --course-build build/lane-<X> --out build/lane-<X>-web`.
- Script master (pages): compile with `xelatex -output-directory=<your scratch dir>`, never into
  `latex/` itself. `scripts/check_lecture.sh` still builds in the old style: not for page counts.
- Do NOT run `./ci.sh` (full or fast). The coordinator runs the gates.
- Environment for node/julia: `export NVM_DIR=$HOME/.nvm; . $NVM_DIR/nvm.sh; export PATH=$HOME/.juliaup/bin:$PATH`.

## Voice

TJO's: plain, direct, operationalist; no emoji; no em dashes in prose. German leads; English is its
translation in strict parity (`scripts/check_parity.py` for the script, check_levels K6/M1 for the
course).
