# Brief: script v0.3, chapters 1 and 2 as the kernel of the new course

## TJO's request (2026-10-22, verbatim)

> i want to update the main script.
> "https://tobiasosborne.github.io/theoretical-physics-C/pdf/TheoretischePhysikC.pdf" I want
> to keep it (deprecated), but update it to the new course. The *important* thing is that the
> web course and the new script is really great but totally overwhelming. The "full" or main
> script is a good opportunity to keep *just* the most important kernel of the course. To this
> end can you work over chapter 1 and 2 and improve them and synch them with the new content.
> The point is to *not* increaes page count, or info desnity. On the contrary, plesae use the
> opportunity to tighten the script and use the new design.

## What that means here

- "The main script" is `latex/TheoretischePhysikC.tex` (German, leads) and
  `latex/TheoreticalPhysicsC.tex` (English), lectures `latex/lectures/de/vlNN.tex` and
  `latex/lectures/en/lecNN.tex`. Published by `scripts/publish_pages.sh` (built `--cmfonts`,
  open fonts only) at `pdf/TheoretischePhysikC.pdf` and `pdf/TheoreticalPhysicsC.pdf`.
- "Chapter 1 and 2" are `vl01`/`lec01` ("Die Geburt der Quantenmechanik": Vorgeschichte,
  Wahrscheinlichkeit) and `vl02`/`lec02` (Hilbertraum). Chapters 3 to 22 stay as they are in
  content (they get the new design only).
- "The new content" is the new course, already written, reviewed and ground-truthed:
  `content/c00-theorie/`, `content/c01-wahrscheinlichkeit/` (both from vl01) and the vl02 part
  of `content/c03-hilbertraum/` (sections c03.s1 to c03.s3; c03.s4 onward came from vl03 and
  belongs to script chapter 3, which is out of scope). The migration maps
  `evidence/migrations/maps/vl01-map.json` and `vl02-map.json` say where every v0.2 item went.
  Registry: `registry/notation.json`, `registry/definitions.json`,
  `registry/generated/NOTATION.md`, `DEFINITIONS.md`, `registry/COLLISIONS.md`.
- "The kernel": the Kern level of those chapters, condensed further. Vertiefung and Fundament
  material does not enter the script; at most one sentence points to the web course for it.
- "Deprecated": the script stays published but is no longer the main text. Its title page
  says, in one line per language, that it is the compact kernel and that the full course is
  the web course (https://tobiasosborne.github.io/theoretical-physics-C/).

## Budgets (hard)

Baseline, script v0.2 as built today (German, current style): chapter 1 = vl01, 2366 words,
pages 2 to 7; chapter 2 = vl02, 766 words, pages 8 to 10.

- Words: chapter 1 at most 2000, chapter 2 at most 650 (German; English in parity). Count
  with `texcount -1 -sum` or the same `wc -w` used above, and state which.
- Pages: in the final build with the new design, chapter 1 plus chapter 2 together take no
  more pages than today (9). Fewer is better.
- Density: no more display equations, definitions or examples than v0.2 has per chapter.
  Tightening means fewer, clearer items, not smaller type or crammed pages.

## Rules (project rules, binding)

1. **No new physics or mathematics claims.** Every statement in the new chapters 1 and 2 must
   be one the new course already makes in its Kern (or v0.2 already makes and the new course
   keeps). Record the correspondence: `docs/plan/script-v0.3/sync-ch1.md` /
   `sync-ch2.md`, one row per paragraph, equation, definition, example and figure of the new
   text: new item -> source ID in content/ (section, definition, claim `c0N.cl.*`) or v0.2
   line. Corrections already recorded in migration records (`evidence/migrations/M-*.json`,
   e.g. M-0013 to M-0016 for vl02) are applied, and the record's status is updated only by the
   evidence lane (tell it which ones you applied, in your NOTES).
2. **Notation and definitions** follow the registry. Where the new course's notation differs
   from what chapters 3 to 22 of the script use (see `registry/COLLISIONS.md`), use the new
   course's notation in chapters 1 and 2 and list the seam in your NOTES; do not touch vl03+.
3. **German leads.** Write `vlNN.tex` first, then `lecNN.tex` as its translation in strict
   parity: `python3 scripts/check_parity.py` must pass (same sectioning, display maths symbol
   for symbol, environments, labels, references, figures). TJO's voice: plain, direct,
   operationalist, no emoji, no em dashes in prose.
4. Use only environments and macros of `latex/tpc-style.sty` and `latex/tpc-macros.sty` (and
   registry notation macros that both masters provide). The design lane switches both masters
   to the new design; it keeps those environments working.
5. Figures: one file per figure serving both editions (`\tpcifenglish{EN}{DE}`), geometry
   from formulas. You may drop a figure or replace it by an adaptation of a new-course figure
   (`content/*/figures/`), if it builds in the script and passes `scripts/check_figures.py`
   (or the check is updated by the evidence lane on your request).
6. Lanes: design, ch1, ch2, evidence. Each lane edits only its own files (listed in its task).
   Need something from another lane's files? Write it in your NOTES and in your final report;
   the coordinator relays. Do not commit. Do not run `git` commands that change state.
7. Test: `scripts/check_lecture.sh N de|en` compiles one lecture in a temp dir (safe in
   parallel). Look at the PDF pages you produce (render with `pdftoppm -r 60 -png` and Read
   the PNGs). Final gate (coordinator): `./ci.sh`.
8. Write `docs/plan/script-v0.3/NOTES-<lane>.md`: what changed, budgets met (numbers), what
   was cut and why, open questions for TJO, requests to other lanes.
