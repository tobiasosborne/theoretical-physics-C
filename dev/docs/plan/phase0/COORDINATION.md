<!-- ROLE: working contract between the Phase 0 coordinator and its subagents (2026-10-11).
     Authored by the coordinator. Every Phase 0 brief points here. UPDATE POLICY: coordinator only. -->

# Phase 0 coordination contract

Authority, in order: `docs/plan/BRIEF.md` (TJO, verbatim), `docs/plan/PLAN.md` section 1.3
(TJO's decisions of 2026-10-11), the rest of `PLAN.md`, the lane reports under
`docs/plan/research/<lane>/REPORT.md`. `HANDOFF.md` section "Conventions worth keeping" binds.

## 1. Rules that bind every agent

1. **Ground truth.** No physics or mathematics statement enters the material from memory. It
   is (a) quoted from a local source with a locus, or (b) derived in the repository and typed
   `derived`, or (c) numerically checked with a reproducible script. A statement that would
   need a source that is not on disk (Ludwig, Busch-Lahti-Werner, Callen, Lieb-Yngvason,
   Bargmann) stays OUT of the material and becomes a row in `evidence/gaps.json` for TJO.
   "Stated without proof" is a presentation choice for a sourced statement, never an
   evidence status (amended 2026-10-11 after the codex review, A1).
2. **Book formulas come from the page image.** The DjVu and PDF text layers garble formulas.
   A formula taken from a book is read from the rendered page
   (`ddjvu -format=pnm -page=N file.djvu out.pnm`, or `pdftoppm` for PDFs), never from `.txt`.
   The `.txt` is for finding the page only. Render into your scratch directory, not the repo.
3. **TJO's framing is his stipulation.** Operationalism, postulates P0-P5, "quantisation is a
   fallacy", his deviations from Ludwig-Werner: recorded as `author-stipulated` with a pointer
   to `BRIEF.md`, never invented or elaborated. Where the brief does not say, leave a marked
   gap (`% GAP-TJO: ...` in TeX, `"gap_tjo": "..."` in JSON) and list it in your return.
4. **German leads; English follows in parity.** Figure geometry comes from the formula. Figure
   prose goes through `\tpcifenglish{English}{Deutsch}`.
5. **Never write into a tracked path:** anything under `sources/*/`, the Plavala source
   (`docs/plan/research/curriculum/plavala-src/`), Hammerer's script (`archive/third-party/`),
   or any commercial font file (MTPro2, Times LT Std, Whitney, Baskerville 10 Pro, Companion
   Math). Do not copy long passages of copyrighted text into the repo: a provenance quote is
   one sentence or one formula. Commercial fonts are local-print only; every package has an
   open-source fallback (STIX Two, Inter, Libertinus, Iosevka) used by web and CI builds.
6. **The existing script keeps building.** `./ci.sh --fast` must stay green. Do not edit
   `latex/lectures/**`, `latex/Theoretische*.tex`, `latex/TheoreticalPhysicsC.tex`,
   `latex/tpc-style.sty`, `latex/tpc-macros.sty`, `latex/figures/**`, `archive/**`,
   `transcripts/**` unless your brief names the file. v0.1/v0.2 are evidence; changes go
   through migration records (`evidence/migrations/`), not silent edits.
7. **Do not commit, push, create a remote, stash, reset or publish.** Leave work in the working
   tree. Other agents share this tree: touch only the files your brief says you own. Do not
   edit `ci.sh`, `build.sh`, `HANDOFF.md`, `docs/plan/PLAN.md`, `.gitignore`; tell the
   coordinator what to add.
8. **No emoji. Plain, concrete prose.** No Fable subagents; do not spawn subagents at all
   unless your brief allows it.
9. **Report honestly.** Say what you ran and what it printed. Mark what you did not verify.
   A gate that you could not make pass is reported as failing, with the output.

10. **Numbers (TJO, 2026-10-11: "numbers, especially pertaining to time, are untrusted. no
    number is admitted unless there is a physics derivation. estimates are nonsense.").**
    No estimates of any kind, anywhere: durations, effort, future page counts, costs,
    capacities, percentages nobody derived. Nobody estimates TJO's time. In course material
    and ledgers every numeric value carries its derivation (`derived`), the reproducible
    computation that produced it (`numerically-checked`, with the script), or its source
    locus (CODATA values, SI defining constants); the claims checker enforces this. A design
    threshold is measured by a script in the repository, or quoted from a standard with a
    locus, or marked "unvalidated choice". You may report measurements you actually took
    (tests run, pages of a built PDF, hashes) with the command that produced them. Your
    return contains no time or effort estimates.

## 2. Repository layout for the new course

The existing script (`latex/lectures`, `latex/Theor*.tex`) is untouched and keeps its CI.
The new course lives beside it.

```
design/                      token source, compiler, measurements        (owner: tokens)
  tokens/base.tokens.json    shared roles (DTCG, OKLCH)
  tokens/pkg{1..5}.tokens.json
  build_tokens.py            -> design/build/<pkg>-<ground>/{tpc-tokens.sty,tokens.css,tokens.glsl,tokens.json}
latex/tpc-design.sty         loader: \usepackage[pkg=1,ground=light,math=stix,fonts=open]{tpc-design}
registry/                    notation.json definitions.json conventions.json translation.json (owner: registry)
  schema/                    JSON Schemas
  generated/                 tpc-notation.sty, notation.web.json, definitions.web.json, NOTATION.md, DEFINITIONS.md
sources/MANIFEST.sha256      tracked hashes (exists)
sources/<key>/source.json    tracked metadata; sources/<key>/rights.json tracked rights record
sources/<key>/*              everything else (payload, extracted text) gitignored  (owner: evidence)
evidence/                    claims.json provenance.json migrations/      (owner: evidence)
content/                     the new course, one directory per chapter    (owner: per smoke)
  cNN-<slug>/de.tex en.tex figures/ chapter.json
latex/tpc-levels.sty         depth system                                 (owner: levels)
latex/tpc-course.sty         course style on top of tpc-style             (owner: levels)
latex/course/                masters for the four editions                 (owner: levels)
numerics/                    Julia reference project and golden data       (owner: per smoke subdir)
web/                         TypeScript/Vite site, converter, demos        (owner: web)
scripts/<area>/              checkers and generators, one subdirectory per owner
tests/red/<gate>/<case>/     red corpus (see section 4)
build/                       all generated output not needed by LaTeX; gitignored by the coordinator
```

## 3. Flags (one vocabulary everywhere)

| Flag | Values | Default |
|---|---|---|
| `pkg` | `1` `2` `3` `4` `5` | `1` |
| `ground` | `light` `dark` | `light` |
| `math` | `mtpro2` `stix` | `stix` in CI and web; `mtpro2` only in local print when the font is installed |
| `fonts` | `local` `open` | `open` (commercial faces only with `local`) |
| `edition` | `full` `kern` | `full` |
| `lang` | `de` `en` | `de` |

Content never contains a package-specific value: no literal colour, font name or length that
belongs to a package. Content uses token names only.

Depth names: Kern / Vertiefung / Fundament (EN Core / Deeper / Foundations).

## 4. Red corpus contract

Every gate has at least one planted failure. A red case is a directory
`tests/red/<gate>/<case>/` containing whatever fixture files the gate needs, plus
`case.json`:

```json
{ "gate": "registry",
  "what": "one sentence: the defect that is planted",
  "cmd": "python3 scripts/registry/check_registry.py --root tests/red/registry/duplicate-symbol",
  "expect_exit_nonzero": true,
  "expect_output_regex": "duplicate symbol" }
```

`cmd` runs from the repository root. The runner `scripts/check_red.py` (coordinator's) runs
every case and fails unless the command exits nonzero AND its combined output matches the
regex. So every checker must (a) accept a root or explicit input paths so it can be pointed
at a fixture, (b) print a specific message per failure class, (c) exit nonzero on failure.
Each gate also needs its green command, which the coordinator puts into `ci.sh`.

## 5. Evidence statuses (one vocabulary)

Evidence: `source-quoted`, `source-backed`, `derived`, `numerically-checked`,
`author-stipulated`. No other value is admitted. Presentation (separate field):
`proof-included`, `proof-omitted`, `proof-linked`. Depth: `kern`, `vertiefung`, `fundament`.

## 6. What every agent returns

- Files created or changed (paths).
- The exact gate commands, and their output when you ran them last.
- Decisions you made that TJO or the coordinator should confirm.
- Gaps left for TJO.
- What you did not verify.

## 7. Amendments after the codex plan review (2026-10-11)

- Scope of the smokes is the review's R0 cut; see `PLAN.md` section 14 for scope, depth-marking
  invariants, font precedence, the build matrix and the D4 bridge.
- Lane reports carry errata: whenever you use a lane report, also read
  `docs/plan/research/review/REVIEW.md` section G.
- Checks that need private sources (quote verification, manifest hashes) run locally only and
  write a receipt under `evidence/receipts/`; public CI checks the receipt's freshness.

## 8. What the gates do and do not establish (added 2026-10-12 after the contracts review)

The independent review `docs/plan/phase0/review/REVIEW-contracts.md` found that sections 1
and 4 above promised more than the gates enforce. The honest boundary is:

- **Mechanical:** ledger and registry bookkeeping (IDs, statuses, schemas, links), verbatim
  presence of text quotes at their loci in hashed sources, existence of derivation files and
  anchors, execution of numerical checks, structural depth and parity checks on the built
  editions, token measurements, literal lint, converter fail-closed parsing, the red corpus.
- **Not mechanical, a reviewer's obligation on every unit:** that a quote in its context and
  with its hypotheses entails the claim; that a derivation derives the claim it is cited for;
  that a numerical check computes the number printed; that a page-image transcription matches
  the page; that a translation of an author stipulation preserves its meaning; that running
  prose outside theorem-like units and tagged numbers asserts nothing unsupported; that Kern
  prose does not depend on depth material by words; that a proof marked as included is
  available in the edition. Rule 1 (ground truth) and rule 10 (numbers) bind authors in full;
  the gates catch only the lexical and structural part of a violation.
- **Numbers rule, lexical boundary:** the evidence gate recognises decimals, scientific
  notation, percentages and integers with units in text and mathematics. Fractions, number
  words, values in figure files and JSON metadata, and whether a `\num` points at the claim
  about that very value are not checked mechanically and belong to the reviewer.
- **Open policy question for TJO:** whether a physics fact may be admitted as `source-backed`
  when its only source is his own earlier script (the registered snapshot). Until he decides,
  such claims are admitted with the scope note "as stated in the author's lecture notes; no
  external source checked" and are listed for him.
