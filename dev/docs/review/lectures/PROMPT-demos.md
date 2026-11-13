You are the independent reviewer of the interactive web demos for chapters c00, c01 and c03 of the course "Theoretische Physik C" (Tobias J. Osborne). Repository root: the current directory. You did not write any of it. You write nothing in the repository; scratch goes under /tmp. You may run `bash web/run.sh test` and the Julia golden checks with `--check`. Do not run builds that write into `build/` or into the repository.

BUDGET: one bounded review. Read and compute for at most half of your session, then write. Items you cannot finish are marked COULD NOT CHECK. Your final message is the full review and nothing else. No time or effort estimates; state no number you did not compute or read from a file (name the file or command).

THE FILES:
- Brief: `docs/review/lectures/DEMO-BRIEF.md`. Binding rules: `web/README.md` sections 4-6.
- Demos: `web/src/demos/c00.*`, `c00/`, `c01.*`, `c01/` (if present), `c03.*`, `c03/`.
- Kernels: `web/src/kernels/planck.ts`, `photo.ts`, `c00cavity.ts`, `prob.ts` (and any `prob*`/`c01*`), `hilbert.ts`.
- Golden tests: `web/tests/kernels/*.test.ts`, `web/tests/golden/*.json`.
- Julia references: `numerics/src/c00_reference.jl`, `numerics/generate/c00_golden.jl`, `numerics/generate/hilbert_golden.jl`, and the c01/prob reference under `numerics/` or `web/tests/golden/reference/`.
- The chapters: `content/{c00-theorie,c01-wahrscheinlichkeit,c03-hilbertraum}/de.tex` around each `\demo{...}`, and the figure files the demos replace.

TASKS, in priority order:
A. Physics and mathematics of every kernel: correct formulas, units, conventions, edge cases (x -> 0 in the Planck ratio; below threshold in the photoelectric kernel; corner reflections in the cavity; exact rationals in prob; s <= 1/2 and the bounds in hilbert).
B. Independence of the golden values: does each Julia reference compute independently of the TS kernel, or does it copy its formulas so that a shared error would pass? Do the tests test the kernel, not a copy of it? Is the stated tolerance justified?
C. Does each demo teach what the text says, with no claims beyond the text? Any number shown that is not an input or kernel output? Sampling shown as exact? Convergence rates claimed without proof? Pay attention to labels: names of curves, axis units, and what is called a "bound" versus a "limit".
D. Does the demo's default state agree with its still figure and the chapter's examples?
E. Rule violations: physics in demo files, nondeterminism (Date, Math.random, performance.now, requestAnimationFrame in a demo or kernel), literal colours or fonts, global listeners or IDs.

OUTPUT: a findings table with these columns:
- severity: WRONG, UNSUPPORTED, MISLEADING, RULE or MINOR;
- file:line;
- the problem;
- the fix;
- your evidence.

Order the table by severity, so that a repair agent can work from the table alone. Then a short list of what you verified, and what you COULD NOT CHECK. Keep it to findings that matter to students or to correctness.
