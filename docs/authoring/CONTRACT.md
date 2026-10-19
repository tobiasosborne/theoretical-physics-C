<!-- ROLE: the authoring contract of the new course (Phase 0a, package "levels", 2026-10-11).
     Binding for every file under content/. Machine-readable half: contract.json (same directory).
     Enforced by scripts/course/check_levels.py; exercised construct by construct in
     content/c99-contract-test/. Change this file, contract.json and the test chapter together. -->

# Authoring contract

One TeX source per chapter and language produces four print editions (full and Kern, German
and English) and, through one converter, the chapter HTML. That works only if content is
written in a small closed language. This file is that language. What is not listed here is
not allowed in a content file; the lint says so by name.

The macros live in `latex/tpc-course.sty` and `latex/tpc-levels.sty`. The lists the checker
and the converter read are in `docs/authoring/contract.json` (version 2).

**Who owns what.** This contract and `contract.json` own the text-mode language: structure,
environments, text macros, the forbidden list, IDs, claims, numbers, source references.
`registry/allowed-tex.json` owns the commands of mathematics that need no registry entry, and
the notation registry owns the symbols. No construct is in both lists; `check_registry.py`
fails on one that is ("allow-list conflict"). Three gates read a content file:

| Gate | Owns |
|---|---|
| `scripts/course/check_levels.py` | this contract: structure, IDs, depth, DE/EN parity, the shape and place of `\claim`, `\num`, `\srcref`, the builds |
| `scripts/registry/check_registry.py` | every control word is a registry macro, a mathematics command of `allowed-tex.json`, or a text macro of this contract; definitions and their depth |
| `scripts/evidence/check_evidence.py` | everything that needs the ledger: claim rows, status, presentation, depth, provenance, numbers |

## 1. A chapter is a directory

```
content/cNN-slug/
  de.tex          German, leading
  en.tex          English, same structure, same IDs
  chapter.json    metadata and asset list
  figures/        one .tex file per figure
```

`NN` is the chapter number and never changes. It is the printed number: c11 is Kapitel 11
whichever chapters are built with it. The master sets it; the file does not.

German leads. `en.tex` has the same constructs in the same order with the same IDs (check
K6 / PAR), and its display equations are character for character those of `de.tex`
(check M1). Prose is translated; structure and mathematics are not.

`c99-contract-test` is the fixture: physics-free, uses every construct below. It is built
only with `--chapters c99` or `--with-test-chapter`.

## 2. IDs

Every chapter, section, subsection, numbered unit, numbered equation, figure, table, depth
block, demo and claim has a stable ID. An ID is a name, not a position: it is given once and
kept when the text is reordered. IDs are unique per chapter file and carry the chapter prefix.

| Thing | Grammar | Example | How it is attached |
|---|---|---|---|
| chapter | `cNN` | `c11` | `\chapter{Titel}\label{c11}` |
| section | `cNN.sK` | `c11.s2` | `\section{Titel}\label{c11.s2}` |
| subsection | `cNN.sK.M` | `c11.s2.1` | `\subsection{Titel}\label{c11.s2.1}` |
| equation | `cNN.eq.slug` | `c11.eq.radial` | `\label{...}` inside the display |
| theorem, lemma, proposition, corollary | `cNN.thm.slug`, `.lem.`, `.prop.`, `.cor.` | `c11.thm.spectrum` | `\begin{theorem}[Name]\label{...}` |
| example, exercise | `cNN.ex.slug`, `cNN.exc.slug` | `c11.exc.virial` | same |
| figure, table | `cNN.fig.slug`, `cNN.tab.slug` | `c11.fig.cloud` | `\begin{tpcfigure}{c11.fig.cloud}` |
| Vertiefung, Fundament | `cNN.vK`, `cNN.fK` | `c11.v1`, `c11.f1` | key `id=` of the block |
| demo, game | `cNN.demo.slug` | `c11.demo.cloud` | `\demo{...}` inside the figure |
| claim | `cNN.cl.slug` | `c11.cl.3` | `\claim[presentation]{...}{status}` after the label; `\num[...]{value}{unit}` for a value |
| definition | `Dn` (registry) | `D17` | `\tpcdef{D17}` |

`slug` is lower-case letters, digits and single hyphens. The `\label` comes directly after
the construct it names; a numbered unit without one fails the lint. Unnumbered units
(`remark`, `proof`, `solution`, boxes, starred equations) take no label.

## 3. Structure

```
\chapter{Titel}\label{cNN}          first thing in the file, once
\section{Titel}\label{cNN.s1}
\subsection{Titel}\label{cNN.s1.1}
```

Nothing deeper than `\subsection`. Paragraphs are separated by blank lines. Comments are
free; a gap for TJO is `% GAP-TJO: ...`.

## 4. Environments (closed list)

| Kind | Environments | Notes |
|---|---|---|
| numbered units | `theorem` `lemma` `proposition` `corollary` `example` `exercise` | optional `[Name]`, then `\label` |
| unnumbered units | `remark` `proof` `solution` | |
| boxes (element types, tinted) | `merksatz` `intuition` `historical` `greybox` | optional `[Titel]` |
| lists | `itemize` `enumerate` `description` | `\item`, `\item[Fall 1.]` |
| depth blocks | `vertiefung` `fundament` | section 6 |
| figures and tables | `tpcfigure` `tpctable`, `tabular` inside `tpctable` | section 8 |
| display mathematics | `equation` `equation*` `align` `align*` | section 5 |
| inside mathematics | `aligned` `split` `cases` `matrix` `pmatrix` `bmatrix` `vmatrix` `smallmatrix` | |

The English environment names are used in both languages (`example`, not `beispiel`); the
printed word follows the build language. There is no `definition` environment in content:
definitions come from the registry (section 7).

**Theorem-like units** are `theorem`, `lemma`, `proposition` and `corollary` (list
`theorem_like` in `contract.json`). They share one number sequence, and each carries a
`\label` and, directly after it, exactly one `\claim` (section 9). A corollary is numbered
like the others ("Korollar 11.4"); the old script's unnumbered corollary does not exist here.

**Nested proofs.** A `proof` may contain a labelled `lemma` with its own `proof`; one level
of nesting. The inner lemma is numbered in the ordinary sequence.

**Proof by cases** is a `description` list inside the `proof`, one `\item[Fall n: ...]` per
case. A piecewise formula is a `cases` environment.

## 5. Mathematics

Inline: `$...$`. Display: the four environments above. `$$`, `\[`, `\(` are not used.

- A numbered display carries a `\label`. In `align` every row carries a `\label` or `\notag`.
- In mathematics every macro of amsmath, of `tpc-macros.sty` and of the notation registry
  (`registry/generated/tpc-notation.sty`) may be used; which symbols need a registry macro
  and which other commands are allowed in mathematics (`registry/allowed-tex.json`) is the
  registry lint's business, not this contract's. The forbidden list (section 10)
  applies in mathematics too.
- **Words inside mathematics** are written `\text{...}` and, because the display must be
  identical in both files, with both languages in place:
  `\text{\tpcifenglish{if}{falls}}`. `\text` is the only way from mathematics back to text.

## 6. Depth: Kern, Vertiefung, Fundament

Kern is the running text. It is complete on its own and reads correctly with every block
removed.

```
\begin{vertiefung}[id=c11.v1,
    titel={...},            run-in title
    wozu={...},             the lead: what the reader gains
    voraussetzung={...},    what it needs, and what does not need it
    zurueck={...}]          the return line, in Kern language
  ...
\end{vertiefung}
```

All five keys are mandatory, in both languages under the same German key names. `fundament`
takes the same keys.

- **Vertiefung** stands inline, after the Kern result it deepens.
- **Fundament** blocks are written at the end of the chapter file, after all Kern text, in
  the order they should print. Nothing is moved: the first one starts the appendix
  "Fundament zu Kapitel n". (Decision: source order = print order = web order.)
- No block inside a block. A block is not inside any other environment.
- **Numbering.** Inside a block, equations are (n.V1), (n.F1), figures and tables
  "Abbildung n.V1". The block itself and the theorem-like units and definitions inside
  blocks share one sequence per depth: Vertiefung n.V1, Lemma n.V2, Vertiefung n.V3. Kern
  label number fields agree between full and Kern and between DE and EN (check K4).
  Unlabelled counter states and page numbers are not compared by this gate.
- **Signposts.** `\zoomref{c11.v1}` is the only way Kern text points into depth; write it
  directly after the word, like a footnote mark: `kein Zufall\zoomref{c11.v1}.` In the Kern
  edition it prints nothing. At most one per paragraph. A Vertiefung may contain at most
  one, and only to a Fundament block.
- **No plain reference from Kern into a block.** `\ref`, `\eqref`, `\pageref` from Kern text
  to a label inside a block fail the gate (K2). From a block to Kern, and between blocks,
  they are fine.
- Every Fundament block must be signposted (C4); it prints the back-link by itself.

Print marking is fixed across design packages: body size on the full measure, a rule in the
left margin (one solid rule for Vertiefung, a double hairline for Fundament), run-in label,
lead, dependency, return line; no tint, no small type. Packages change only the rule's
colour and weight, the label's face, case and colour, and the spacing. `tpc-course.sty`
takes these from the tokens: `tpc-depth-v`, `tpc-depth-f`, `\tpcstrokedepthv`,
`\tpcstrokedepthf`, `\tpcfontdepth`, `\tpcspaces`.

## 7. Definitions and notation

A definition is written once, in `registry/definitions.json`, in both languages. Content
never restates it.

- `\tpcdef{D17}` prints definition D17 as a numbered definition at this place, with label
  `D17`. Exactly once in the course, on a line of its own, at the depth the registry gives
  it (a `kern` definition in Kern text, a `vertiefung` one inside a Vertiefung).
- `\defref{D17}` cites it ("Definition 6.3").
- Kern text transcludes and cites only definitions of depth `kern` (K1).

## 8. Figures, tables, demos

```
\begin{tpcfigure}{c11.fig.cloud}
  \demo{c11.demo.cloud}          optional, at most one
  \caption{...}                  exactly one
\end{tpcfigure}
```

- The picture is `figures/cloud.tex` (the last ID component). No TikZ and no
  `\includegraphics` in `de.tex` / `en.tex`.
- A figure file is one picture and is outside this contract's closed list: TikZ and
  pgfplots are free there. Its rules: geometry from the formula; prose through
  `\tpcifenglish{English}{Deutsch}`; colours by token name only, and only the roles of
  the plate (`tpc-plate-ink`, `tpc-plate-muted`, `tpc-plate-rule`, the data roles, the
  ladder, `tpc-grey-n`, or the TikZ styles `tpc axis`, `tpc state`, ... of `tpc-design`),
  never the ground roles `tpc-ink` and `tpc-rule`: on the dark ground a figure is set on
  the light plate; shape, dash and label carry the meaning, never hue alone; no `\ref`, `\label`, `\claim`,
  `\defref` (K5): say it in the caption.
- Figures do not float; they stand where the text uses them, also inside depth blocks.
  Several figures with demos may follow one another.
- Captions are ordinary content (references and mathematics allowed) and may be long.
- **Demo or game.** `\demo{ID}` says: this figure is the still of that interactive piece.
  Print shows the still, the caption and a line with the address and a QR placeholder; the
  web embeds the demo in place of the still. The demo is declared in `chapter.json`
  (`kind` `demo` or `game`, `still` = the figure ID). The print figure and caption must
  carry the physics on their own.
- Tables: `\begin{tpctable}{c11.tab.levels} \caption{...} \begin{tabular}{...} ... \end{tabular} \end{tpctable}`
  with `\toprule`, `\midrule`, `\bottomrule`.

## 9. References, claims, sources

- `\ref{ID}`, `\eqref{ID}`, `\pageref{ID}`. The noun is written by the author:
  `Theorem~\ref{c11.thm.spectrum}`, `Kapitel~\ref{c02}`.
- **Across chapters** the same macros are used with the other chapter's ID, and the other
  chapter is listed in `prerequisites` of `chapter.json`. In a build of some chapters only,
  such a reference prints the ID in brackets and is reported as external; in a build of the
  whole course it must resolve.
- **Claims.** The syntax is `\claim[presentation]{id}{status}`, directly after the `\label`
  of the unit or equation it is about (in `align`, after the row's label):
  `\claim{c11.cl.3}{derived}`, `\claim[proof-omitted]{c11.cl.4}{source-backed}`.
  - `status` is the evidence status, one of `source-quoted`, `source-backed`, `derived`,
    `numerically-checked`, `author-stipulated`; no other value exists, and a statement that
    has none of them does not go into content.
  - `presentation` is one of `proof-included`, `proof-omitted`, `proof-linked`. It is
    admitted only on the claim of a theorem-like unit and is written exactly when the ledger
    row has one. The gates compare this declaration with the ledger; proof
    availability in the checked edition remains a reviewer obligation.
  - Every theorem-like unit carries exactly one claim, on its own label. Equations and other
    labelled units carry one where they state something.
  - The ledger `evidence/claims.json` is the authority; the values in the source are a
    declared copy. Status, presentation and the depth of the place where the tag stands must
    equal the row; a theorem-like unit is tagged with a row of that kind; every row of a
    chapter that has content is tagged exactly once in `de.tex` and once in `en.tex`.
    `check_levels.py` checks shape and place; `check_evidence.py` compares the declarations
    and links with the ledger. A reviewer must check claimless running prose, quote
    entailment, derivation relevance and the meaning of stipulations.
  - Print: a small tag in the margin column for `proof-omitted` ("ohne Beweis"),
    `proof-linked` ("Beweis ausgelagert") and otherwise for `derived` ("hergeleitet");
    nothing for the rest.
- **Numbers.** Authors must support every numeric value in content: derived, computed by a
  reproducible script, or quoted from a source locus (a CODATA line, an SI defining
  constant). The macro is `\num[claim-id]{value}{unit}`, in text or in mathematics:
  `\num[c11.cl.7]{13.6}{eV}`, `$a_0 = \num[c11.cl.8]{0{,}529}{Å}$`, `\num[c02.cl.3]{0.25}{}`.
  - `claim-id` names the ledger row that supports the value. Its evidence must be `derived`,
    `numerically-checked`, `source-quoted` or `source-backed`; `author-stipulated` does not
    support a number. A row of kind `value` has no label to carry a `\claim`: it is tagged by
    its `\num[id]`, at least once per language. `\num[id]` may also point at the claim of an
    equation or unit stated elsewhere, any number of times.
  - Inside a display (`equation`, `align`) that carries such a `\claim`, or inside a
    theorem-like unit whose `\claim` is such, a number may stand bare or as
    `\num{value}{unit}` without the ID: the claim of the display or unit covers it. Use
    `\num` there too when the number has a unit.
  - Everywhere else (running text, proofs, examples, exercises, captions, boxes) a number
    recognised by the lexer without `\num[claim-id]` fails the evidence gate (`[number]`).
  - What the gate takes for a number: a decimal (`13.6`, `0{,}529`, in running text also
    `0,529`), scientific notation (`1.6e-19`, `6 \times 10^{-34}`, `10^{-10}`), a percentage,
    and an integer with a unit (in mathematics an integer followed by `\mathrm{..}` or
    `\text{..}`, including an integer and unit inside `\text{300 K}`; in running
    text an integer, a space and a unit symbol). Bare integers
    without a unit are exempt (indices, exponents, matrix entries, counts, `2 \times 2`); a
    physical value that is a bare integer is the author's and reviewer's to tag. The exact
    list is in the docstring of `scripts/evidence/check_evidence.py`.
  - Fractions, number words, figure files and JSON metadata are outside the evidence
    lexer. Alternate unit settings outside its documented patterns may also escape it.
    The gate checks the cited claim's evidence eligibility; a reviewer must establish
    that it supports this exact printed value.
  - `unit` may be empty; it is set upright. The value is written as it should print in that
    language (decimal comma `{,}` in German mathematics). Print shows value and unit only.
  - No estimates: a value nobody derived, computed or looked up does not go into content.
- **Sources.** `\srcref{key}{locus}`, for example `\srcref{reed-simon-3}{S. 55}`. `key` is the
  name of a registered source: a directory `sources/<key>/` with a `source.json` (there is no
  central registry file; the keys at present are the directory names under `sources/`).
  `locus` is free text in the language of the file. A source reference is not evidence; it
  shows the reader where a provenance row points. Enforced now: the key is registered and
  the locus is not empty (`check_levels.py`, SR); the same key at the same place in DE and
  EN (PAR); some claim tagged in the same file has a provenance row from that source
  (`check_evidence.py`, `[srcref]`). Review only, not enforced: that the reference stands in
  the unit of that claim and that the locus printed is the locus of the row.

## 10. Text macros, and what is forbidden

Allowed in text: `\emph`, `\textbf`, `\item`, `\dots`, `\ldots`, the macros of sections 3
to 9 (among them `\claim`, `\num`, `\srcref`), and the control symbols `\,` `\;` `\:` `\!` `\ ` `\%` `\&` `\$` `\#` `\_` `\{` `\}`
`\-`. `~` and `--` as usual. Quotation marks are typed as characters („…“, “…”). `\\` only
in mathematics and in `tabular`.

Forbidden everywhere in content files (lint L1; full list in `contract.json`):

- definitions and programming: `\def`, `\newcommand`, `\let`, `\if...`, `\csname`, counters;
- file inclusion: `\input`, `\include`, `\usepackage`;
- manual layout: `\vspace`, `\hspace`, `\noindent`, `\newpage`, `\par`, boxes, rules, font
  sizes and font switches, colours;
- pictures inline: `\tikz`, `tikzpicture`, `\includegraphics`, `figure`, `table`, `center`;
- `\tag`, `\nonumber`, `\footnote`, `\marginpar`, `\cite`, `\href`, `\url`;
- the old script's `definition`, `beispiel`, `uebung`, `\eqbox`, `\figbox`.

A text macro or environment that is neither listed nor forbidden fails as "not in the
contract" (lint L2). Extending the language means changing this file, `contract.json`, the
style and the test chapter in one step.

## 11. chapter.json

```json
{
  "id": "c11",
  "slug": "wasserstoff",
  "title": { "de": "...", "en": "..." },
  "effective_theory": { "de": "one sentence: which effective theory this chapter is", "en": "..." },
  "zoom_scale": "single-system",
  "prerequisites": ["c05", "c09"],
  "assets": [
    { "id": "c11.fig.cloud", "kind": "figure", "file": "figures/cloud.tex" },
    { "id": "c11.tab.levels", "kind": "table" },
    { "id": "c11.demo.cloud", "kind": "demo", "still": "c11.fig.cloud",
      "title": { "de": "...", "en": "..." } }
  ]
}
```

- `id` and `slug` equal the directory name; `title` equals the `\chapter` title of each file.
- `zoom_scale` (the physics axis, not depth): `gpt`, `single-system`, `many-particle`,
  `fock`, `statistical-mechanics`, `thermodynamics`.
- `prerequisites`: chapter IDs; every chapter referenced from the text must be listed.
- `assets`: every figure, table and demo used in the text, and nothing unused. `kind` is
  `figure`, `table`, `demo`, `game` or `video`. Further fields per kind (data files,
  hashes, video scripts) belong to the web and numerics owners.
- `test_fixture: true` and a `fixture/` directory exist in the test chapter only.

## 12. Page and palette

`tpc-course.sty` loads the old `tpc-style.sty` unchanged and, when `tpc-design` is present,
re-points its colour names at tokens (`cgblue` to `tpc-accent`, `munsell` to `tpc-link`,
`banana` to `tpc-highlight`, `isabelline` to `tpc-ground-alt`, `spacecadet` to `tpc-ink`,
`light-gray` to `tpc-rule`) and sets headings, boxes, captions, margin notes and depth
marks from the package's tokens. Authors use tokens for design colours, faces and lengths.
`design/lint_content.py` checks colour and font literals, including named CSS colours,
`font:` shorthand and xcolor/TikZ literal colour mixes. A line waiver must spell
`tpc-lint: allow(<reason>)` with a nonempty reason. Package-grid lengths are not
checked by this lexer: a reviewer distinguishes design dimensions from formula geometry.

One switch decides the page grid: the option `page` of `tpc-course` (`\tpcpage` in the
master, default `design`). `page=design` is the package's grid and body size
(`\tpcapplypage`): text measure `\tpcmeasure`, margin column `\tpcmarginwidth` for
signposts and claim tags. `page=fixed` is one grid for all packages (138 mm text, 33 mm
margin column, 12 pt). A package whose margin column is narrower than 30 mm is refused.

## 13. Build and gate

```
bash scripts/course/build_course.sh --all-editions            # four PDFs into build/course/
bash scripts/course/build_course.sh --chapters c11 --lang de --edition kern
bash scripts/course/build_course.sh --spot                    # other packages and dark ground
python3 scripts/course/check_levels.py                        # lint + build evidence
python3 scripts/course/check_levels.py --chapters c11 --lint-only
```

The gate refuses missing, empty, failed or stale builds: it compares the sha256 of every
source with the build record. Sources are the chapter directories, `latex/tpc-*.sty`,
`latex/course/*.tex`, `registry/generated/**` and the token directory
`design/build/pkgN-<ground>/` of the build, so a registry or token change makes a build
stale. Its checks and their codes are listed at the top of
`scripts/course/check_levels.py`.

Mechanical attestation boundaries: private evidence checks execute each numerical
script directly with arguments and record its result per claim. Public checks require
those successful results and hashes of referenced derivations, scripts and declared
`numerics.inputs` paths. Shell pipelines and interpreter code (`-c`, `-e`, `-m`) are
not numerical script invocations. Page-image review receipts require `bindings` entries
with `provenance_id`, `member_sha256` and `quote_sha256` (SHA256 of the exact UTF-8
quote), and their reviewer must equal the provenance row's reviewer. This checks
coverage, not the human review's authenticity or semantic correctness.

Registry checks refuse transclusion of proposed definitions. Missing verified quote
members fail in private mode (the default) and are explicitly reported as “not verified
in this run” in public mode. Rendered-symbol collisions, first-use order and historical
body/status review invalidation remain open.

The static web gate scans stylesheets, style elements and style attributes for external
CSS resources and requires local script sources without URL schemes. Runtime network
independence still requires the browser gate. Both converter language branches are
validated before selecting the rendered branch.
