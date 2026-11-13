# Theoretische Physik C: working rules

This file is the single source of workflow rules for the lecture notes. The
rules of the parked course project are `dev/CLAUDE.md`; they apply only to
work inside `dev/`.

## The project

Lecture notes for Theoretische Physik C by Tobias Osborne (TJO), for the
course he is giving now. German leads; English follows in strict parity. The
notes exist as a PDF and as one web page per lecture; both are made from the
same files.

- `latex/lectures/de/vlNN.tex`, `latex/lectures/en/lecNN.tex`: the 22
  lectures. Masters `latex/TheoretischePhysikC.tex` and
  `latex/TheoreticalPhysicsC.tex`. Figures `latex/figures/fig_vlNN_*.tex`, one
  file for both languages.
- `web/`: the builder of the lecture pages (`tools/lecture/`), the interactive
  demos (`src/demos/`, physics in `src/kernels/`), their posters
  (`assets/stills/`) and tests.
- `dev/`: the larger course project (chapters, registry, evidence, Julia
  references). Parked; not built, not checked, not published. See
  `dev/README.md`.

Lectures 1 to 8 are script v0.3 (operators with hats, `\op{A}`); lectures 9 to
22 are v0.2 text without hats. The seam is at lecture 8/9.

**Priority: material for the running lecture.** A change should reach the
students within minutes of being written.

## Rules for content

- **German first**, then English in parity (`scripts/check_parity.py`).
  Display maths is identical in both languages.
- **Ground truth.** No physics from memory. A formula from a book is read from
  the source, not recalled. A statement whose source is not at hand stays out
  and is raised with TJO.
- **No estimates.** Every number is derived, computed, or quoted from a source.
- **Hats on operators** (`\op{A}`) in rewritten lectures, not on the identity
  `\mathbb{I}`, states (density operators), Pauli matrices or ket-bras.
- **Figures**: one file serves both languages, prose through
  `\tpcifenglish{EN}{DE}`; geometry comes from the formula; colours by token
  name only.
- **Voice**: TJO's. Plain, direct, operationalist. Students are "Sie". No
  emoji, no em dashes in prose.
- **Web-only material** is written in the lecture file and prints nothing:
  `\webdemo{id}{caption}` for an interactive figure,
  `\webdemo[fig_...]{id}{caption}` when it takes the place of that static
  figure on the web, and `\begin{webonly} ... \end{webonly}` for extra prose
  (unnumbered displays only: the web page and the PDF keep the same equation
  numbers). A caption says what is shown, what to move and what to watch for,
  and nothing the demo does not do.
- **Never commit** a commercial font, `archive/third-party/`, or the ignored
  source payloads under `dev/sources/`. Published PDFs use open fonts only;
  the font gate in `scripts/publish_pages.sh` refuses anything else.

## Working on a lecture

1. Edit the German lecture, then the English one.
2. `./check.sh` (parity, figures, both PDFs, the web pages; well under a
   minute with warm caches). `./check.sh --fast` skips the PDFs.
3. Look at the result where it matters: `./build.sh` writes the PDFs,
   `bash web/run.sh build && bash web/run.sh serve` shows the pages.
4. Commit and push. Small commits, one logical change each. A push to master
   publishes to the students.

A new demo: the module `web/src/demos/<id>.ts` with its physics in
`web/src/kernels/`, an entry in `web/src/demos/catalog.json`, a poster
`web/assets/stills/<id>.{de,en}.svg`, a kernel test under `web/tests/kernels/`
(`./check.sh --tests`), and a `\webdemo` in the lecture, both languages.

The web builder knows the LaTeX the lectures use and stops with file and line
on anything else. Teach it a new construct in `web/tools/lecture/parse.ts`;
do not work around it in the lecture text.

Reviews, second opinions and budgets are TJO's call per lecture, not routine.

## Shipping and rollback

`.github/workflows/pages.yml` runs `scripts/publish_pages.sh` on every push to
master that touches `latex/`, `web/` or `scripts/` and deploys
https://tobiasosborne.github.io/theoretical-physics-C/. Bugs in a push are
accepted; the answer is a quick revert or a forward fix, not more gates.

- `git revert <sha>` and a push redeploy the site as it was.
- A Pages build that fails deploys nothing; the previous site stays live.

## Environment

- `export NVM_DIR=$HOME/.nvm; . $NVM_DIR/nvm.sh` puts node on the PATH in a
  non-interactive shell. `(cd web && npm ci)` once per checkout.
- TeX Live 2023 with XeLaTeX, poppler (`pdftocairo`, `pdffonts`).
- `./build.sh --local-fonts` uses the commercial print faces where installed;
  those PDFs stay local.
- `git pull` before starting: the repository is worked on from more than one
  machine.
