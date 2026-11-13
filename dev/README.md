# dev/: the larger course project, parked

This directory holds the "ultimate quantum mechanics course" project: chapters
with three depths (Kern, Vertiefung, Fundament), four print editions, a
notation and definition registry, an evidence trail for every claim, Julia
reference numerics and a red corpus for the gates. It was moved here on
2026-11-13 so that the lecture notes of the running course (the top level of
the repository) can be changed and published in minutes.

**State: parked, not maintained.** The last commit at which everything here
was at the top level and the full CI passed is tagged
`course-parked-2026-11-13`. To work on the course again, start from that tag
or repair the paths here.

What is known to be broken by the move:

- Every script here locates the repository root relative to itself and expects
  `latex/`, `web/` and the directories of this folder side by side at that
  root. `ci.sh`, `scripts/course/build_course.sh`, `scripts/registry/reglib.py`
  and `web/tools/convert/env.ts` are the main ones.
- The style files stayed in `/latex` (the lecture notes use them);
  `latex/course/` (course master, standalone figure wrapper) is here.
- The chapter converter and its gates are in `web/` here; the demos, kernels
  and their tests stayed in `/web`, where the lecture pages use them.
- The migration maps under `evidence/migrations/` pin line numbers in
  `/latex/lectures/`, which now change freely.

What the lecture notes took from here, as copies that are no longer
regenerated: the design tokens of package 1 (`/latex/tokens/`,
`/web/vendor/tokens/`), the generated notation and definition macros
(`/latex/tpc-notation.sty`, `/latex/tpc-definitions.tex`,
`/web/vendor/notation.web.json`), and the still image of every demo
(`/web/assets/stills/`). A change to the registry or the tokens here does not
reach the lecture notes until those copies are refreshed by hand.

`HANDOFF.md` is the project log up to 2026-10-29, written when everything was
at the top level; read its paths accordingly. `docs/plan/PLAN.md` is the plan.
