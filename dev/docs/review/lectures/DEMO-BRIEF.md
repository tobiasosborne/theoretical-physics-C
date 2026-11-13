# Brief: interactive demos for lectures 1 and 2 (C0, C1, C3)

TJO, 2026-10-20, after seeing the chapter web pages: "The webpages are great. But there are
plenty of opportunities to create more interactive/animated demos. Basically any single plot
should be made more magical and interactive."

## Goal

Every figure of chapters c00, c01 and c03 gets an interactive or animated web demo that
replaces it on the chapter page. The TikZ figure stays as the still: it is what print shows,
and what the page shows without JavaScript or WebGL 2. A demo should make the reader *do*
something that teaches the point of its figure:
- drag a point, a bar or a weight;
- move a slider and watch a curve morph smoothly;
- press play and see a process unfold, such as rays bouncing in the cavity, partial sums
  creeping up, or frequencies converging;
- turn a 3D object where the third dimension is real content, such as a complex-valued
  function over the line, or the probability simplex for three outcomes.

"Magical" means fluid, responsive, beautiful and immediately legible. It does not mean
decoration. Animate state changes with easing, not jumps. Use direct manipulation on the
stage, with a keyboard-accessible slider for each draggable quantity. Use hover readouts.
Use the design tokens so the demo looks right in every package and on light and dark ground.

## What exists and is binding

- `web/README.md` sections 4-6: the demo interface, the seven rules, golden tests.
  `web/src/demo/types.ts` is the authority.
- In particular:
  - no physics or mathematics in the demo file; it goes in a pure kernel in
    `web/src/kernels/<name>.ts`, with a golden test whose values come from an independent
    reference implementation (Julia, under `numerics/`; see how `hydrogen`, `gpt` and
    `prob` do it);
  - `render(frame, time)` is deterministic;
  - only `ctx.random()`;
  - colours and fonts only from `ctx.tokens`;
  - every number shown is an input or computed by the kernel;
  - words via `ctx.text` or `ctx.symbol`.
- Precedents to copy:
  - `web/src/demos/c01.demo.haeufigkeit.ts` (2D plate demo, prob kernel);
  - `web/src/demos/c11.demo.*` and `web/src/demo/three.ts` (3D stage demos);
  - `web/src/demos/c02.demo.explorer.ts`;
  - how a demo is declared in `content/<ch>/chapter.json` (`kind: demo`, `still: <figure id>`)
    and placed with `\demo{id}` inside its figure. See `docs/authoring/CONTRACT.md` for
    `\demo`, and check how the PDF treats it.
- Ideas catalogue: `docs/plan/research/demos-games-video/IDEAS.md` and `REPORT.md`. Their
  chapter numbering is the lane's own, not the course's; search by topic (probability,
  Planck, photoelectric, simplex, Hilbert space). Section 3.0 "correctness-first" rules
  apply.
- The figures' own headers state their generating formulas. The demo must agree with the
  figure and the chapter text: same conventions, same symbols, same parameter values at its
  default state.
- `design/README.md` for token roles (plate roles for 2D, stage roles for 3D).

## Gates for your chapter(s)

Build print first into your own directory, then the web:
`bash scripts/course/build_course.sh --chapters <ids> --all-editions --out build/<name>`,
`bash web/check.sh --chapters <ids> --course-build build/<name> --out build/<name>-web`.

Then run:
- `bash web/run.sh test` (golden tests);
- `python3 design/lint_content.py`;
- `python3 scripts/course/check_levels.py --chapters <ids> --build build/<name>`;
- `python3 scripts/registry/check_registry.py`.

Never use the default `build/course/` or `build/web/`. Then LOOK at every demo yourself:
- shoot it with `bash web/run.sh shots --site build/<name>-web/site --chapter <ch> --out <scratch>`;
- for animated demos, capture a few deterministic frames via the standalone page
  (`?seed=1&frame=N`).

Check pkg 1 light and pkg 4 dark. Fix what looks wrong.

## Coexistence (three agents in one working tree)

- Agent c00 owns `content/c00-theorie/`, `web/src/demos/c00.*`, and kernels/tests/numerics
  files named `planck*`, `photo*` or `c00*`.
- Agent c01 owns `content/c01-wahrscheinlichkeit/`, `web/src/demos/c01.*`,
  `web/src/kernels/prob.ts` and its tests and reference, plus new files named `prob*` or
  `c01*`.
- Agent c03 owns `content/c03-hilbertraum/`, `web/src/demos/c03.*`, and new files named
  `hilbert*`, `complex*` or `c03*`.
- Do not edit shared harness code in `web/src/demo/`, `web/src/site/` or `web/tools/`. If
  you truly need a harness change, make the smallest additive change and name it in your
  report. Better still, work around it inside your demo.
- Shared JSON (`registry/*.json`, `evidence/*.json`): only targeted Edit-tool insertions,
  re-read right before. Do not edit `ci.sh`. Report the commands that regenerate and check
  your golden files, and the coordinator wires them in.
- Do not commit.

## Report back (concise)

- One line per demo: id; what the reader does; what it teaches; kernel and golden file.
- Gate results, with commands.
- Anything you could not make correct or beautiful, and any harness change.
