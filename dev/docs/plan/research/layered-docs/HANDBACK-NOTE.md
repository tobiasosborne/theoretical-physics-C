LAYERED-DOCS lane: finished, with one problem about where the files are.

**Delivery problem.** The harness refused to let this subagent write `.md` files ("Subagents should return findings as text, not write report files"). I did not get around that by writing through Bash. So `REPORT.md` and `EXAMPLES.md` are **not on disk**. Their full contents are below, between the `===== FILE` markers. Please save them unchanged to:
- `docs/plan/research/layered-docs/REPORT.md` (about 440 lines)
- `docs/plan/research/layered-docs/EXAMPLES.md`

**What is on disk.** Everything is under `/home/tobias/Projects/theoretical-physics-C/docs/plan/research/layered-docs/prototype/` and nothing outside the lane directory was touched:
- `levels.sty`
- `body.tex`
- `full.tex`
- `lehramt.tex`
- `check_levels.py`

The prototype builds the full edition and a Lehramt-only edition from one source, then runs a check on both. I tested it with XeLaTeX (TeX Live 2023):
- **Correct document:** both builds have 0 errors and 0 undefined references, and the Lehramt equations keep the same numbers in both builds. The checker exits 0.
- **Planted mistake** (Lehramt text pointing into a deep block with a plain `\ref`): the checker exits 1.

**Main findings:**
- **MTW, checked against the local djvu.** They mark the *core* pages, with a grey-outlined "1" in the outer upper corner and a grey bar in the contents. Every switch to Track 2 carries a margin "dependency statement". "Track-1 summary boxes" let a reader skip the rest of a chapter.
- **Knuth, checked against `texbook.tex`.** Dangerous-bend paragraphs are set in 9 pt, with a two-line hanging indent and two grades (single and double bend). They are framed as a warning ("don't read the paragraph unless you need to").
- **Learner control helps little on its own.** A meta-analysis finds almost no effect (g = 0.05). Readers with little prior knowledge do worse with choice-heavy hypertext, and better with a hierarchical structure, typed links and one-line previews of where a link goes. So the Lehramt route must be a complete linear default, and the deep material must be detours that come back to it.
- **Design proposal.**
  - Three depths: Kern (running text), Vertiefung (inline blocks), Fundament (an appendix per chapter).
  - Depth is marked by a margin rule and a run-in label, not by a background tint or smaller type. Tint already means Merksatz and aside boxes in this repo's style file.
  - Deep blocks number their own equations, so Lehramt numbering is the same in every edition.
  - Each detour has a one-line preview, a dependency statement and a "Zurück zum Kern" line.
  - "Honest simplification" rule: Lehramt text may narrow its scope but must never be false as stated.
  - CI checks C1-C8: C1 and C2 are prototyped, C3-C8 are specified.
- **Naming clash.** Do not call the rigour axis "zoom". The brief already uses "zoom" for the physics axis (GPT → single systems → … → thermodynamics). Use "Tiefe / depth" instead.
- **Reuse.** `../generalrelativity/web/gr-filter.lua` already turns foldable LaTeX environments into collapsible HTML blocks (`<details>`), so the web side needs only one new entry.
- **Not verified, and marked [UNVERIFIED] in the report:**
  - Griffiths, Sakurai and Ballentine star conventions
  - Landau-Lifshitz small print
  - Penrose's difficulty icons
  - The Concrete Mathematics exercise classes
  - German-textbook "Vertiefung" typography
  - PDF-layer support in viewers other than pdf.js
  - Whether browser find-in-page opens closed `<details>` blocks
  - Wolfram's long-form posts and Sanderson's companion sites (not researched in the timebox)

The open questions for TJO are in the last section of the report.

