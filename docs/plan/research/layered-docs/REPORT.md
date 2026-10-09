<!-- ROLE: research report of the LAYERED-DOCS lane: how one text can serve readers at several
     depths (Lehramt track vs full rigour), in print and on the web, and what this course should adopt.
     Authored 2026-10-09 by the layered-docs lane. Companion files: EXAMPLES.md (page sketches),
     prototype/ (a working two-build LaTeX skeleton plus its invariant checker).
     UPDATE POLICY: lane-owned; later lanes cite it, they do not edit it. -->

# Layered documents: one text, several depths

Question (from `docs/plan/BRIEF.md`): how have scientific authors made one text serve readers at
several depths, and what should Theoretische Physik C adopt so that a Lehramt track is complete at a
gentle level while any passage can be opened into full rigour (operator theory, self-adjointness,
GPT / order-unit spaces), with a canonical print PDF that contains everything and a web edition that
expands and collapses?

Conventions in this file. `[R n]` points into the reference list at the end. Facts read from a local
copy carry the path and a sha256 prefix. Anything not confirmed from a source is marked `[UNVERIFIED]`.

## Summary

1. The best-documented print precedent is MTW's two-track design. It works because of three devices,
   not one: a page-level marker (a grey-outlined "1" in the outer corner of Track-1 pages), explicit
   dependency statements in the margin at every switch, and Track-1 summary boxes that let a reader
   skip the rest of a chapter without losing the thread [R1].
2. Knuth's dangerous-bend paragraphs are the best-documented paragraph-level device. They mark one
   paragraph at a time, use two grades (single and double bend), set the marked paragraph in 9 pt
   with a two-line hanging indent, and are framed as a warning ("don't read the paragraph unless you
   need to") [R2].
3. On the web, the mature pattern is in-place expansion (Nelson's stretchtext [R14]) built from
   `<details>/<summary>` or an equivalent, plus a lead line per expandable block, plus stable
   per-block identifiers (Stacks Project tags [R18]). The sibling repo `../generalrelativity`
   already turns foldable LaTeX environments into `<details>` (`web/gr-filter.lua`, lines 37-68).
4. The evidence on learner control is sobering: a meta-analysis finds an overall effect of giving
   learners control of g = 0.05 [R27]. Low-prior-knowledge readers are hurt by choice-heavy,
   network-shaped hypertext and helped by hierarchical structure, few typed links and link previews
   [R28, R29, R31, R33]. So the Lehramt route must be a fully specified linear default, and the deep
   material must be detours that return, not a graph.
5. Proposal: three depths, only two of which appear in the running text. **Kern / Core** (the
   Lehramt route, complete on its own), **Vertiefung / Deeper** (inline blocks, marked by an outer
   margin rule and a run-in label), **Fundament / Foundations** (per-chapter appendices for the
   operator theory and GPT material, reached by margin signposts). Deep blocks number their own
   equations so that core numbering is identical in the canonical PDF and in a derived core-only PDF.
   A build that excludes the deep levels must compile with zero errors and zero undefined
   references; a working prototype of that check is in `prototype/` and passes on a green case and
   fails on a red case (section 5.7).
6. Do not call the depth axis "zoom". In the brief, "zoom" already names the physics axis
   (GPT -> single systems -> many particles -> Fock -> stat mech -> thermodynamics). Two different
   zooms in one course will confuse readers; call the depth axis "Tiefe / depth".

## 1. Print precedents

### 1.1 Misner, Thorne, Wheeler, *Gravitation* (1973): Track 1 and Track 2

Verified from the local copy
`../generalrelativity/Literature/Misner C.W., Thorne K.S., Wheeler J.A. - Gravitation (1973, Freeman).djvu`
(sha256 `42ed62c60fd329b1...`), text extracted with `djvutxt`.

- Preface, p. viii: "It supplies two tracks through the subject. The first track is focused on the
  key physical ideas. It assumes, as mathematical prerequisite, only vector analysis and simple
  partial-differential equations." [R1]
- Marking: "The Track-1 material is contained in those pages of the book that have a 1 outlined in
  gray in the upper outside corner, by which the eye of the reader can quickly pick out the Track-1
  sections. In the contents, the same purpose is served by a gray bar beside the section, box, or
  figure number." Note the polarity: MTW marks the *core* pages, not the advanced ones. [R1]
- Dependencies: "With a few exceptions, any Track-2 chapter can be understood by readers who have
  studied only the earlier Track-1 material. The exceptions are spelled out explicitly in
  'dependency statements' located at the beginning of each Track-2 chapter, or at each transition
  within a chapter from Track 1 to Track 2." [R1] In the body these are marginal notes, e.g. at
  §5.1: "The rest of this chapter is Track 2. It depends on no preceding Track-2 material. It is
  needed as preparation for Chapter 20 ..." and at Chapter 4: "This chapter is all Track 2. ... is
  not needed for the rest of the book." [R1]
- Exit summaries: "The essential features of the stress-energy tensor are summarized in Box 5.1 for
  the benefit of readers who want to rush on ... Such readers can proceed directly from Box 5.1 into
  Chapter 6 -- though by doing so, they close the door on several later portions of track two."
  Box 6.2 does the same for Chapter 6; Chapter 8 contains a "Track-1 overview" (§§8.4-8.7). [R1]
- Granularity: sections and whole chapters, not paragraphs. Separately, MTW has boxes "which can be
  omitted without loss of continuity" and margin notes that annotate the main text (Wikipedia
  summary [R3]).
- Reception: E. Goldstein's review praises the "pedagogic apparatus" ("separately marked tracks,
  boxes of various kinds, marginal comments"); Sean Carroll calls the book "written in an
  often-idiosyncratic way that you will either like or not"; d'Inverno finds it "somewhat verbose"
  and would not recommend it for a first course; the lead calls its coverage something that "may
  overwhelm a newcomer" (all as quoted in [R3]; the primary reviews were not read
  [UNVERIFIED beyond [R3]]). I found no study of whether readers actually followed the tracks.

Lesson for us: the corner marker gives peripheral-vision orientation at zero cost to the text block;
the margin dependency statement is what makes a switch safe; the exit box is what makes skipping
safe. All three are needed.

### 1.2 Knuth: dangerous bends (TeXbook, METAFONTbook)

Verified from `texbook.tex` (CTAN `systems/knuth/dist/tex/texbook.tex`, sha256 `747045b558d5da32...`,
downloaded to the lane scratchpad 2026-10-09) [R2]:

- Preface: when the sign "appears at the beginning of a paragraph, it warns of a 'dangerous bend' in
  the train of thought; don't read the paragraph unless you need to." Doubled signs: "everything
  that was said about single dangerous-bend signs goes double for these." Rationale: "people change
  as they grow accustomed to any powerful tool ... At every stage in the development you'll want a
  slightly different sort of manual ... By paying attention to the dangerous bend signs in this book
  you'll be better able to focus on the level that interests you at a particular time."
- Typography (Appendix E, macro `\d@nger`): `\medbreak` before and after, `\clubpenalty=10000`,
  `\hang\hangafter=-2` (two-line hanging indent holding the sign), and `\ninepoint` (the marked
  paragraph is set one size smaller than the 10 pt body). Exercises get the same treatment
  (`\dangerexercise`).
- Origin: Bourbaki's marginal sign for passages that "forewarn the reader against serious errors"
  (*Théorie des ensembles*, p. I-8, as quoted in [R4]). LaTeX access: `manfnt` provides `\dbend`
  (installed: `/usr/share/texlive/texmf-dist/tex/latex/manfnt/manfnt.sty`).

Lesson: paragraph granularity and two grades are right for a reference manual. The framing (danger,
"don't read") is wrong for a Lehramt audience that the brief describes as highly motivated; the
deep material should read as an invitation with a stated payoff, not a warning.

### 1.3 Other print precedents

| Work | Device | Status |
|---|---|---|
| Zee, *Einstein Gravity in a Nutshell* (2013) | Appendices attached to individual chapters hold the technical, peripheral or enrichment material: "the use of appendices represents my effort to appeal to a broad range of readers with enormously different levels of knowledge ... The reader should not feel obliged, upon first reading this book, to study all the appendices." Preface also gives a reading route ("try starting with part IV ... you could skip the somewhat heavier appendices in chapter V.6"). | Verified, local `../generalrelativity/Literature/A. Zee-Einstein gravity in a nutshell-...pdf` (sha256 `7a058fb85d4debb5...`), pp. xvi-xvii [R5] |
| Concrete Mathematics (Graham, Knuth, Patashnik) | Student "graffiti" in the margins, a second voice alongside the text. | Existence verified only from publisher copy [R6]; exercise classes (warmups, basics, homework, exam, bonus, research) [UNVERIFIED] |
| Bourbaki, *Éléments* | Strict linear order: chapters "assume as given the results established in previous chapters"; historical notes after chapters; "summaries of results" stated without proof. | [R7] (Wikipedia, secondary) |
| Landau-Lifshitz | Prefaces disclaim rigour: Vol. 3 (1958) "we do not aim at 'mathematical rigour' of exposition, which in theoretical physics often amounts to self-deception." | Verified from MacTutor extracts [R8]. Small-print paragraphs for supplementary material: [UNVERIFIED] (prefaces do not mention it). |
| Penrose, *The Road to Reality* | Exercises graded by difficulty from "very straight forward" to "not to be taken lightly". | [R9]; the icon set (smiley faces) [UNVERIFIED] |
| Spivak, *Calculus* | Problems marked with one or two asterisks for higher difficulty. | Forum-level source only [R10]; treat as [UNVERIFIED] |
| Stone & Goldbart, *Mathematics for Physics* | No track marking found (searched the course-hosted draft for "asterisk", "starred", "skip", "first reading"). Two kinds of end material ("exercises" = direct applications, "problems" = more thought). Relevant as a *model register*: Ch. 4 distinguishes "mere Hermiticity, or symmetry, and true self-adjointness" at a physicist's level. | Verified, course draft `courses.grainger.illinois.edu/phys509/bookmaster.pdf` (sha256 `a07c5bb3f5bba2b5...`) [R11] |
| Sussman & Wisdom, *SICM* | Not layered; it raises precision instead: notation must be unambiguous enough for a computer to interpret. A model for the Fundament level's notation, not for layering. | Secondary quotation of the preface [R12]; primary text not read |
| Nielsen & Chuang | Exercises interspersed in the text, end-of-chapter problems, "History and further reading" sections. Boxes exist; their stated role in the preface [UNVERIFIED]. | Review in [R13] |
| Griffiths / Sakurai / Ballentine starred sections | Could not verify any convention from a primary source in the timebox. | [UNVERIFIED] |
| Feynman Lectures | No depth layering. The HTML edition (MathJax, SVG figures; updated 2022 with deep-zoomable images) is a faithful web rendering of print. | [R15] |
| German textbooks | Nolting: Kontrollfragen and Übungsaufgaben "zur Vertiefung", solutions in the appendix, two-colour print [R16]. Fließbach: each chapter approximately one Doppelstunde (stated for the *Statistische Physik* volume) [R16b]. Bartelmann et al. (incl. Rebhan): forward-looking outlook sections and highlighted maths boxes [UNVERIFIED: publisher copy not retrieved]. A typographic "Vertiefung" convention for rigour layers in these books: not found [UNVERIFIED]. | [R16], [R16b] |

What these add to 1.1-1.2: Zee shows the appendix-per-chapter pattern for the deepest layer (it keeps
the running text clean, at the cost of a page flip). Bourbaki shows the value of a summary-of-results
layer. LL shows the opposite stance (one level, no rigour), which is the stance the Fundament level
argues against.

## 2. Hypertext precedents

| Precedent | Mechanism | Lesson for this course |
|---|---|---|
| Nelson, stretchtext (term c. 1967/1970) | Text that grows or shrinks in place, no branching; surrounding text remains as context [R14]. | The right mental model for Vertiefung blocks on the web: expand in place, never navigate away. |
| Victor, "Up and Down the Ladder of Abstraction" (Oct 2011) | Insight comes "in the transitions between" levels; "stepping down is as important as stepping up" [R19]. | Every deep block must step back down: a rejoin line that returns to the concrete core statement. |
| Victor, "Explorable Explanations" (Mar 2011) | Reactive documents and explorable examples woven into prose; criticises widgets that "dump the user in a sandbox" [R20]. | Interactive demos belong in the core text at the point of use, with a stated question, not in a separate gallery. |
| Matuschak & Nielsen, Quantum Country | Mnemonic medium: spaced-repetition prompts interleaved in narrative prose [R21, R22]; some sections are explicitly flagged as skippable ("the best section of the essay to skip") [R21]. | Depth layering and retrieval prompts are orthogonal; prompts should be attached to the core route. A plain-language "you may skip this" note is a layering device in its own right. |
| Olah & Carter, "Research Debt" (Distill, 22 Mar 2017) | "Research distillation is the opposite of research debt"; "Abstractions and notation are the user interface of research" [R23]. | Writing the Kern text is distillation, not dilution; it deserves the same review as the deep text. |
| gwern.net (design page, modified 2023-04-20) | Semantic zoom: "the hierarchy is made visible & malleable to allow reading at multiple levels"; abstract first; sidenotes in both margins with floating-footnote fallback; inline and block collapse; recursive popups; progressive enhancement ("JavaScript is not required for the core reading experience") [R24]. | Closest existing web realisation of what the brief asks for. Progressive enhancement is the right baseline: the page must read correctly with scripts off. |
| Tufte CSS (Liepmann) | Sidenotes and margin notes; on narrow screens margin content "is hidden until the user toggles them into view" [R25]. | Margin material needs a defined mobile fallback; decide it up front. |
| MyST / Jupyter Book | `:::{dropdown} Title` with `:open:`; renders as HTML `<details>`, works without JavaScript; synchronised tab sets (`:sync:`) [R26]. | Ready-made syntax for Vertiefung blocks if the web pipeline moves to MyST; PDF behaviour of dropdowns is not documented [R26]. |
| Quarto conditional content | `::: {.content-visible when-format="html"}`, `unless-format`, `when-meta` / `unless-meta`; profiles set metadata [R26b]. | Mechanism for per-format and per-edition content from one source. |
| Wikipedia summary style | Lead section, then article, then spun-off sub-articles; "different readers want varying amounts of detail, and this style permits them to choose" [R17]. | A three-level hierarchy that works at scale; each level is a complete text at its own resolution. |
| Stacks Project tags | Permanent 4-character tag per item; tags survive renumbering; removed results keep their tag with an explanation [R18]. | Every Kern section, Vertiefung block and Fundament item gets a permanent tag; web anchors and print cross-references use it. |
| nLab | Many pages open with an "Idea" section before the formal definition (e.g. "density matrix") [R18b]; not universal ("C-star-algebra" starts at "Definitions"). | Per-concept internal layering: idea, then definition, then properties. |
| Physics LibreTexts | Bookshelves plus campus "course shells" that "contain text remixes" [R18c]. | Remixing is a different problem (selecting chapters), not depth layering. |
| Immersive Linear Algebra (Ström, Åström, Akenine-Möller) | "The world's first linear algebra book with fully interactive figures" (self-description) [R18d]. | Precedent for a complete book whose figures are interactive; no depth layering. |
| Ciechanowski articles (2019-2024: Moon, Airfoil, Bicycle, Sound, Mechanical Watch, GPS, ...) | Long single-path articles with many interactive figures [R18e]. Layout details beyond the archive index not verified. | Model for the web chapter's figure density, not for layering. |
| Nicky Case (Parable of the Polygons 2014, with Vi Hart; The Evolution of Trust) | Game-like explorables [R18f]. | Belongs to the games lane; mention only for consistency. |
| Feynman Lectures website, 3Blue1Brown site | Web renderings of a linear text or video library; no depth layering found [R15, R18g]. | No layering lesson. |
| Wolfram long-form posts, Sanderson companion pages | Not researched in the timebox. | [UNVERIFIED] |

## 3. LaTeX and Typst mechanisms for multi-level print

### 3.1 Several PDFs from one source

- `versions` (v0.55, U. Lück) provides `\includeversion{X}` / `\excludeversion{X}` for environments
  named X; installed at `/usr/share/texlive/texmf-dist/tex/latex/versions/versions.sty` [R34].
  `comment` (same idea, older) and `optional` (2005/01/26 v2.2b) are also installed.
- `multiaudience` (installed) defines audiences with `\SetNewAudience`, `\DefCurrentAudience`,
  `\showto{audiences}{text}`, a `shownto` environment and audience-restricted sectioning
  (`Section`, `Subsection`, ...); see `texdoc multiaudience`.
- This repo already compiles two editions from one source with `\tpcifenglish{EN}{DE}`
  (`latex/tpc-style.sty`, line 274); a level switch is the same pattern on a second axis.
- Typst: `typst compile --input level=lehramt main.typ` exposes the value as `sys.inputs` (verified in
  the local `typst 0.14.2 --help`), so `#if sys.inputs.at("level", default: "full") == "full" [...]`
  gives the same two-build structure.

Pitfall found while prototyping (section 5.7): content excluded from a build is not compiled at all,
so a broken macro inside a deep block passes the core build silently. Both builds must run in CI.

### 3.2 Typographic devices compared

Cost is measured on the page: does it consume text width, break across pages cleanly, survive
greyscale printing, and stay distinguishable from the existing box types (`merksatz`, `greybox`,
`intuition`, `historical` in `latex/tpc-style.sty`, lines 222-256)?

| Device | Example | Page cost | Breaks cleanly | Greyscale | Conflicts here |
|---|---|---|---|---|---|
| Page-corner marker | MTW grey "1" [R1] | none in the text block | per page only, so blocks shorter than a page are not distinguishable | yes | none; needs fancyhdr or scrlayer and a page-level flag |
| Margin rule (vertical bar in outer margin) | change bars (`changebar` installed) | none in the text block | yes, continues across pages | yes | none |
| Margin icon at block start | Bourbaki / Knuth sign [R2, R4] | none if placed in the margin; Knuth uses a 2-line hanging indent | yes | yes | none |
| Background tint | tcolorbox `breakable` | approximately 16 pt of padding per box, plus page-break artefacts | acceptable with `breakable` | weak (light tints disappear) | high: tint already means "Merksatz" (banana) and "aside" (isabelline) |
| Smaller type | Knuth 9 pt [R2]; LL [UNVERIFIED] | saves space | yes | yes | sub- and superscripts in 7-8 pt maths become hard to read; signals "less important", which is the wrong message for rigour |
| Extra indentation | Knuth's hang | 1-2 em of width | yes | yes | competes with list and theorem indentation |
| Run-in label | "Vertiefung 6.V2 (Selbstadjungiertheit)." | one line | yes | yes | none |
| Appendix per chapter | Zee [R5] | none in the running text; a page flip for the reader | yes | yes | none |
| Footnote | | small; bottom of the same page | yes | yes | unsuitable for display maths or multi-paragraph proofs |
| Sidenote / margin note | tufte-latex 3.5.2 (last CTAN update 2015-06-23, no tagged-PDF support) [R35]; `sidenotes`, `marginnote`, `marginfix`, KOMA `scrlayer-notecolumn` installed | needs a wide outer margin (typically 45-55 mm on A4, reducing the text block) [UNVERIFIED as a typographic norm] | notes can collide and float away from their anchor | yes | fits a Tufte-style design package; poor for display maths |
| Endnote | | none locally; maximal split attention | yes | yes | not recommended for anything the reader should actually read |

### 3.3 Interactive PDF devices

- PDF layers (optional content groups) via `ocgx2` v0.60 (2024-09-16, A. Grahn; supports
  `(Xe)LaTeX -> (x)dvipdfmx` when `dvipdfmx` is passed as a class option) [R36]. A layer toggles
  visibility of content that has already been laid out, so a hidden layer leaves a blank of the same
  size; it cannot reflow the page. Viewer support is uneven: pdf.js has a layers panel (inferred from
  an integration-test plan in issue #18823 [R37]); support in Preview, Chrome's viewer, e-readers
  [UNVERIFIED]. Verdict: unsuitable for depth layering.
- Hyperlinked detours: a signpost links to the appendix item, and the appendix item links back
  (explicit back-link with page number). hyperref's `\Acrobatmenu{GoBack}{...}` exists
  (`hyperref.sty` line 4110), but viewer support for named actions is [UNVERIFIED]; an explicit
  back-link with `\pageref` works everywhere, including on paper.

## 4. Pedagogical evidence

All DOIs below were resolved against the Crossref API on 2026-10-09; quoted findings are from the
abstracts (OpenAlex, Consensus) unless stated.

- **Expertise reversal.** "Instructional techniques that are highly effective with inexperienced
  learners can lose their effectiveness and even have negative consequences when used with more
  experienced learners." Kalyuga, Ayres, Chandler, Sweller (2003) [R27a]; review Kalyuga (2007)
  [R27b]. Implication: deep blocks must not re-explain core material. They add; they do not
  paraphrase.
- **Text coherence and prior knowledge.** High-coherence text helped recall overall, but
  "high-knowledge readers performed better on the open-ended questions after reading the
  low-coherence text"; low-coherence text "requires more inference processes", which succeed for
  high-knowledge readers. McNamara & Kintsch (1996) [R30]. Implication: the Kern text should be
  high-coherence (every step written out); Vertiefung and Fundament may be terse. Two registers,
  on purpose.
- **Learner control.** Meta-analysis of 18 studies, 29 effects: "The overall effect of including
  learner control within educational technology was almost zero (g = 0.05)." Karich, Burns, Maki
  (2014) [R27]. Scheiter & Gerjets (2007) attribute the weak results to disorientation, distraction,
  cognitive overload and to moderators such as prior knowledge and self-regulation [R28]. Gerjets et
  al. (2009): high learner control helped only intuitive knowledge and greatly increased learning
  time [R28b]. Implication: offering a choice is not a benefit in itself. The default path must be
  complete and must not require choices.
- **Hypertext structure.** DeStefano & LeFevre (2007, review): "the increased demands of
  decision-making and visual processing in hypertext impaired reading performance"; readers with low
  working memory and low prior knowledge were usually disadvantaged, but benefited "if the hypertext
  structure was hierarchical and consistent with that of the knowledge domain"; "restricted access
  and visible link types were helpful" [R29]. Shin, Schallert, Savenye (1994): for low-prior-knowledge
  students limited access beat free access, and advisement prevented disorientation [R31]. Madrid,
  Van Oostendorp, Puerta Melguizo (2009): link suggestions improved learning; the number of links (3
  vs 8 per page) did not [R32]. Antonenko & Niederhauser (2010): "leads" (a brief summary of the
  linked node) reduced extraneous load and improved domain and structural knowledge [R33]. Zumbach &
  Mohraz (2008): non-linear presentation of narrative text increased cognitive load and decreased
  knowledge acquisition; for encyclopaedia-type text, linearity did not matter [R33b]. Dillon &
  Gabbard (1998): benefits of hypermedia are limited to tasks of repeated manipulation and search and
  are unevenly distributed across learners [R33c].
- **Seductive details.** Interesting but irrelevant adjuncts reduced recall of main ideas and
  transfer; placing them at the start of a passage made it worse, placing them at the end reduced the
  effect. Harp & Mayer (1998) [R34b]. A Vertiefung block is relevant, not seductive, but to a reader
  who does not need it, it behaves like one. Implication: put deep blocks *after* the core result and
  its example, never in the middle of a core derivation.
- **Signalling and segmenting.** Signalling meta-analysis: Schneider, Beege, Nebel, Rey (2018) [R38].
  Segmenting meta-analysis (56 investigations, 88 comparisons): small to medium effects on retention
  and transfer; learners with high prior knowledge benefited more in retention [R39]. Mayer (2017)
  reports median effect sizes of signalling d = 0.46, spatial contiguity d = 0.79, segmenting
  d = 0.70, coherence d = 0.70, and notes that some principles are stronger for low-knowledge
  learners [R40]. Noetel et al. (2021, 29 reviews, 1,189 studies): largest benefits for
  temporal/spatial contiguity and signalling; "good design was more important ... in system-paced
  environments (e.g., lectures) than self-paced ones (e.g., websites)" [R41]. Implication: mark
  switch points the same way every time (signalling), keep short deep material next to its anchor
  (contiguity), and move long deep material out of line (segmenting).
- **How many levels.** I found no study that varies the number of depth levels in a layered textbook
  and measures learning. The design precedents use two levels plus a base (Knuth: none, one bend, two
  bends [R2]; MTW: Track 1, Track 2, plus boxes [R1]) or three (Wikipedia: lead, article,
  sub-article [R17]). The evidence above argues for: few, consistently typed switch points; a
  hierarchical rather than networked structure; a preview line on every switch; no nesting.

Consequences for the design:

1. The Kern route is linear, complete and choice-free. Choice exists only as optional detours.
2. Detours are typed (at most two visible types in running text), visibly marked, previewed by a
   lead line, and close with a return line.
3. Detours are not nested. A Vertiefung block may point to a Fundament item; it may not contain
   another Vertiefung block.
4. Detours sit after the core result they deepen.
5. Deep text is additive and may be terse; it never repeats the core explanation.

## 5. Proposal

### 5.1 Two axes, two words

| Axis | What it is | Word (DE / EN) |
|---|---|---|
| Physics scale | GPT -> single systems -> many particles -> Fock -> stat mech -> thermodynamics; the order of the chapters | "Zoom" / "zoom" (TJO's existing usage) |
| Rigour depth | how much mathematics a passage assumes | "Tiefe" / "depth" |

Element types (Merksatz, Intuition, Historische Notiz, Beispiel, Aufgabe) are a third, independent
axis: any of them may occur at any depth. A depth is never signalled by a box type.

### 5.2 Three depths

| Depth | DE name | EN name | Audience | Placement | Numbering |
|---|---|---|---|---|---|
| 1 | **Kern** | **Core** | Lehramt; the default route | running text | (6.12), Def. 6.3 |
| 2 | **Vertiefung** | **Deeper** | BSc physics; curious Lehramt | inline blocks after the core result | (6.V3), Def. 6.V1 |
| 3 | **Fundament** | **Foundations** | readers who want proofs: domains, self-adjointness, Kato-Rellich, Wigner, order-unit spaces | appendix at the end of each chapter (Zee pattern) | (6.F2), Satz 6.F1 |

Alternative names considered: "Pfad A / Pfad B" (neutral but meaningless), "Track 1 / 2" (MTW
association, but "Track" is not German), "Lehramt / Fach" (labels people rather than content, and
the brief expects strong Lehramt students to cross over), "Strenge" (accurate for depth 3, but sounds
punitive). "Kern / Vertiefung / Fundament" use words German readers already know from textbooks, and
"Fundament" matches the brief's micro-to-macro picture: the GPT foundations sit underneath.

### 5.3 What must be true of the Kern route on its own

- K1 **Complete.** Every symbol, definition and result used in Kern text is introduced in Kern text.
  Checked through the definitions database: each `Dn` carries a `depth` field, and Kern prose may
  cite only `Dn` of depth Kern (lint, C5).
- K2 **No dangling references.** Kern text refers to deeper material only through `\tiefe{...}`
  signposts (called `\zoomref` in the prototype; rename on adoption), which render as margin
  signposts in the full edition and as nothing in the core-only edition. A plain `\ref` from Kern
  into Vertiefung or Fundament is a build failure (C1).
- K3 **Honest simplification.** A Kern statement may restrict its scope ("für endlichdimensionale
  Hilbert-Räume", "für die Potentiale dieses Kurses") but must never be false as stated. Example: Kern
  may say "in finite dimension every Hermitian matrix is diagonalisable with real eigenvalues"; it may
  not say "every Hermitian operator is an observable". This follows from the brief's non-negotiable
  correctness requirement, and it is a reviewer check: each Kern claim in the claims ledger carries
  its scope.
- K4 **Same numbers in both editions.** Kern equations, definitions and figures keep their numbers
  whether or not deep blocks are printed (separate counters for V and F, prototype in 5.7, check C2).
- K5 **Exercises and figures.** Kern exercises use only Kern material; the brief's "at least one
  picture per page" applies to the core-only build as well.
- K6 **Bilingual parity.** The German and English editions have the same sequence of depth blocks
  (extension of `scripts/check_parity.py`).

### 5.4 Print marking (canonical PDF)

- **Vertiefung block.** Run-in label in the sans-serif used for box titles
  ("**Vertiefung 6.V2** · Selbstadjungiertheit"), followed by one lead sentence saying what the reader
  gains ("Wozu: ...") and a dependency statement in the MTW style ("Voraussetzung: Kern 6.1-6.3;
  nicht nötig für Kapitel 7"). The block body is set at body size with a 1.5 pt vertical rule in the
  outer margin over its full length, continuing across page breaks. No background tint, no size
  reduction. A closing line "**Zurück zum Kern.** ..." states, in Kern language, what the reader takes
  back.
- **Fundament item.** Lives in "Anhang F zu Kapitel 6"; pages in a Fundament appendix carry a corner
  marker "F" in the MTW position (outer upper corner). Each item begins with a back-link "aus Kern 6.3
  (S. 112)" and a dependency statement.
- **Signposts in Kern text.** A margin note at the line where the deeper question arises, e.g.
  "Tiefe: 6.V2 S. 114" or "Fundament: 6.F1 S. 131", set in the marginal note style. At most one
  signpost per paragraph.
- **Table of contents.** Kern sections plain; Vertiefung blocks listed indented with the rule glyph;
  Fundament appendices listed per chapter (MTW's grey-bar idea [R1]).
- **Chapter opener.** A route map: Kern sections in sequence, Vertiefung blocks as side loops,
  Fundament items as a lower layer, with page numbers. One figure; it doubles as the "picture per page".
- Final sizes, colours and fonts belong to the design-package lanes; this lane fixes only which
  devices are used and what they mean.

### 5.5 Web marking

- Kern text is the page. Vertiefung blocks are `<details>` elements, closed by default, whose
  `<summary>` is the run-in label plus the lead sentence (a "lead" in the sense of [R33]). Blocks are
  inert HTML that works without JavaScript (as in MyST [R26] and gwern.net [R24]). The
  `../generalrelativity` filter already emits `<details class=... open?>` for foldable environments
  (`web/gr-filter.lua`, lines 52-58); a `vertiefung` entry with `foldable = true, open = false` is
  all that is needed.
- A depth selector at the top of each chapter page: "Kern" (all closed) / "Kern + Vertiefung" (all V
  open) / "Alles" (V open, F inline). It is stored per reader in `localStorage` (wrapped in
  try/catch), and the page is correct without it.
- Fundament items render at the end of the chapter page (or as a linked page per chapter) with a
  back-link to the anchor; signposts in Kern text are links with a hover or tap preview (gwern-style
  popup [R24]) that shows the lead sentence.
- Every block has a stable tag (Stacks-style [R18]) used as its HTML `id`. Opening a URL with that
  fragment opens the enclosing `<details>` (a toggle via the `open` attribute; the `toggle` event is
  standard [R42]). Whether browser find-in-page opens closed `<details>` automatically is
  browser-dependent [UNVERIFIED]; open all blocks during search via script as a fallback.
- `beforeprint` handler opens all blocks, so printing the web page gives the full content.
- Interactive demos sit in the Kern text at their point of use (Victor [R20]); a demo that needs
  operator theory to explain goes in a Vertiefung block, with a Kern-level caption.

### 5.6 Navigation without losing the thread

1. **Before the detour:** the Kern result is stated and illustrated first (Harp & Mayer [R34b]).
2. **At the door:** label, lead sentence ("Wozu"), dependency statement (MTW [R1]).
3. **Inside:** no nesting; at most one onward pointer to a Fundament item.
4. **At the exit:** "Zurück zum Kern" sentence, then the Kern text continues with the next
   paragraph. That paragraph must make sense to a reader who skipped the block (C3 checks that the
   exit line exists; a reviewer reads the Kern text with the block removed).
5. **On the web:** collapsing a block returns the scroll position to its summary line.
6. **In print:** page numbers on every signpost and back-link, so the route works on paper.

### 5.7 Build-system invariants, with a working prototype

Prototype in `prototype/`: `levels.sty` (about 15 lines; `versions` plus a separate `deepeq`
counter numbered `\thesection.V\arabic{deepeq}` and a `\zoomref` signpost macro; rename to `\tiefe`
when adopted), `body.tex`, `full.tex`, `lehramt.tex`, and `check_levels.py`. Results on 2026-10-09,
XeLaTeX from TeX Live 2023/Debian:

- Green case (`full` and `lehramt` built from the same `body.tex`): 0 errors, 0 undefined references
  in both; the 3 core labels have identical numbers in both builds (`eq:born` = 1, `eq:norm` = 2 in
  both, deep equation `1.V1` only in the full build). `check_levels.py` exits 0.
- Red case (a Kern sentence using `\ref` into a deep block): the core build reports
  "Reference `sec:born-tief' on page 1 undefined"; `check_levels.py` exits 1.
- Found while building it: a TeX error inside a deep block (missing `amsmath`) was invisible to the
  core build, because excluded content is never compiled. Hence C1 runs on both builds.

Checks proposed for `ci.sh` (C1-C2 prototyped, C3-C8 specified):

| Check | Statement | How |
|---|---|---|
| C1 | Full and core-only builds: zero TeX errors, zero undefined references or citations, in both languages (4 builds) | `check_levels.py` on the logs |
| C2 | Every label in the core-only build has the same number in the full build | compare `\newlabel` maps in the two `.aux` files |
| C3 | Every Vertiefung block has a label, a lead, a dependency statement and a "Zurück zum Kern" line; no Vertiefung inside Vertiefung | lint over the `.tex` sources |
| C4 | Every Fundament item has a back-link to at least one Kern signpost, and every signpost resolves | `.aux` scan (both directions) |
| C5 | Kern prose cites only definitions and notation entries of depth Kern | `\defref{Dn}` scan against the definitions DB `depth` column |
| C6 | Page budget: pages per depth per chapter reported (not gated) | count from the two PDFs |
| C7 | Web: with every `<details>` closed, no visible link points into closed content except signposts; with all open, the number of blocks equals the number in the PDF | Playwright, as used in `../generalrelativity` |
| C8 | DE and EN have the same sequence of depth blocks and the same tags | extension of `scripts/check_parity.py` |

The core-only PDF is a by-product of C1. Whether to distribute it is a separate decision (open
question 3).

## Recommendations

Ranked; each with its trade-off.

1. **Adopt three depths with two visible in running text: Kern (running text), Vertiefung (inline
   blocks), Fundament (per-chapter appendices).** Trade-off: a third level costs authoring and
   checking effort, and readers of Fundament must flip pages; in exchange the operator-theory and GPT
   material does not interrupt the Lehramt route, and short rigour notes (domain of an operator,
   trace-class condition) stay next to their anchor.
2. **Make the Kern route provably self-contained in CI (C1, C2 now; C3-C8 as the pipeline grows).**
   Trade-off: four builds instead of two (roughly doubles LaTeX time in `ci.sh`), and authors must use
   `\tiefe{}` instead of `\ref` for downward pointers; in exchange "complete and no dangling
   references" stops being a promise and becomes a test, in the red-green style of `../rk`.
3. **Mark depth with a margin rule plus a run-in label, not with tint or small type; keep tint for the
   existing element types.** Trade-off: a margin rule is quieter than a tinted box, so a skimming
   reader sees it less; in exchange depth and element type stay independent, the page works in
   greyscale, and rigorous text is not visually demoted.
4. **Separate equation and definition counters for V and F so that core numbering is identical in
   every edition.** Trade-off: mixed number styles (6.12, 6.V3, 6.F1) in the full PDF; in exchange
   lecture slides, exercise sheets and the core-only PDF can all cite (6.12) safely.
5. **Every switch carries lead, dependency statement and return line (MTW plus Victor), and detours
   come after the core result.** Trade-off: about three extra lines per block; in exchange the
   evidence-backed devices (signalling, leads, hierarchical structure, seductive-detail placement)
   are all built in.
6. **Adopt the honest-simplification rule (K3) and put each Kern claim's scope into the claims
   ledger.** Trade-off: Kern prose becomes slightly more hedged; in exchange no statement in the
   Lehramt route is ever contradicted by the deep route.
7. **Web: `<details>` per Vertiefung block, depth selector, stable tags, print-opens-all,
   progressive enhancement.** Trade-off: readers who never open blocks never see the depth; in
   exchange the Lehramt page is calm and the web and PDF share one block inventory (C7).
8. **Reserve "zoom" for the physics axis; call the rigour axis "Tiefe / depth".** Trade-off: departs
   from the brief's wording "zoom into more details"; in exchange students are never asked to
   "zoom in" in two different senses on the same page.
9. **Do not use PDF layers (OCG) or GoBack actions for depth.** Trade-off: the PDF is less
   "interactive"; in exchange it behaves the same in every viewer and on paper.

## Open questions for TJO

1. **Names.** "Kern / Vertiefung / Fundament" (EN "Core / Deeper / Foundations")? Or something more
   personal? And may the rigour axis be called "Tiefe" so that "zoom" stays with the physics axis?
2. **Where does each topic of the brief sit?** Proposed default: P0-P4 in finite dimension, qubit,
   box, oscillator, angular momentum algebra, hydrogen spectrum in Kern; trace class, unbounded
   operators and domains, spectral theorem, Stone's theorem, Wigner's theorem statement in Vertiefung;
   order-unit spaces (Plavala), self-adjointness of the hydrogen Hamiltonian (Kato-Rellich), proof of
   Wigner's theorem, Bratteli-Robinson Fock-space constructions in Fundament. Which items do you want
   the Lehramt students to meet in Kern even in a simplified form (for example, the GPT picture of
   state space and effects in two dimensions)?
3. **Distribute the core-only PDF?** It costs nothing once C1 runs. Risk: students may treat it as
   "the script" and never see the deep material. Options: canonical only; both; core-only on request.
4. **Exam scope.** Is Vertiefung examinable for BSc students and optional for Lehramt? Is Fundament
   never examinable? The answer decides how strictly C5 must be enforced.
5. **Two levels or three for the deep material?** Is Fundament as chapter appendices acceptable, or do
   you prefer MTW-style whole Track-2 chapters for the GPT and Fock-space material, which are long
   enough to be chapters in their own right?
6. **Tone of the deep markers.** Invitation ("Wozu: ...") as proposed, or Knuth-style warning? The
   proposal assumes invitation, given your description of the Lehramt cohort.
7. **Web default.** Should the web edition open in "Kern" (all closed) for everyone, or remember a
   reader's last setting?
8. **Element-type boxes.** May the existing `greybox` and `intuition` boxes be redesigned by the
   design lanes, given that depth will no longer use tint?

## References

Local sources (read 2026-10-09):

- [R1] Misner, Thorne, Wheeler, *Gravitation*, Freeman 1973. Local:
  `../generalrelativity/Literature/Misner C.W., Thorne K.S., Wheeler J.A. - Gravitation (1973, Freeman).djvu`,
  sha256 `42ed62c60fd329b1...`. Preface p. viii; Ch. 4 margin; §5.1; Box 5.1; Box 6.2; Ch. 8.
- [R2] D. E. Knuth, *The TeXbook*, source `texbook.tex` from CTAN
  `https://mirrors.ctan.org/systems/knuth/dist/tex/texbook.tex`, sha256 `747045b558d5da32...`;
  preface (source lines 200-251) and Appendix E macros (lines 23735-23745).
- [R5] A. Zee, *Einstein Gravity in a Nutshell*, Princeton UP 2013. Local:
  `../generalrelativity/Literature/A. Zee-Einstein gravity in a nutshell-Princeton University Press (2013).pdf`,
  sha256 `7a058fb85d4debb5...`; preface pp. xvi-xvii.
- [R11] M. Stone, P. Goldbart, *Mathematics for Physics*, course draft
  https://courses.grainger.illinois.edu/phys509/bookmaster.pdf (sha256 `a07c5bb3f5bba2b5...`);
  preface pp. vii-viii; Ch. 4.
- `../generalrelativity/web/gr-filter.lua` lines 37-68; `latex/tpc-style.sty` lines 222-274 (this repo).

Web sources (accessed 2026-10-09):

- [R3] Wikipedia, "Gravitation (book)", https://en.wikipedia.org/wiki/Gravitation_(book)
- [R4] Wikipedia, "Bourbaki dangerous bend symbol", https://en.wikipedia.org/wiki/Bourbaki_dangerous_bend_symbol ; TrueTeX, "The Dangerous Bend Sign", https://truetex.com/db.htm
- [R6] MIT Press Bookstore listing, *Concrete Mathematics* 2nd ed., https://mitpressbookstore.mit.edu/book/9780201558029
- [R7] Wikipedia, "Éléments de mathématique", https://en.wikipedia.org/wiki/%C3%89l%C3%A9ments_de_math%C3%A9matique
- [R8] MacTutor, "Landau and Lifshitz: Course of Theoretical Physics: Prefaces", https://mathshistory.st-andrews.ac.uk/Extras/Prefaces_Landau_Lifshitz/
- [R9] Wikipedia, "The Road to Reality", https://en.wikipedia.org/wiki/The_Road_to_Reality
- [R10] Physics Forums, "How many problems should I do in Spivak's Calculus?", https://www.physicsforums.com/threads/how-many-problems-should-i-do-in-spivaks-calculus.632514/
- [R12] arXiv:2407.08090 (quotes the SICM preface); SICM HTML edition https://groups.csail.mit.edu/mac/users/gjs/6946/sicm-html
- [R13] Review of Nielsen & Chuang, IACR book reviews, https://www.iacr.org/books/2013_ca_NielsenChuang_QuantumComputation.pdf
- [R14] Wikipedia, "Stretchtext", https://en.wikipedia.org/wiki/Stretchtext
- [R15] Caltech, "The Feynman Lectures on Physics" info page, https://www.feynmanlectures.caltech.edu/info/flp.html
- [R16] Springer, Nolting, *Grundkurs Theoretische Physik 5/1*, https://www.springer.com/book/9783540241195 ; [R16b] Fließbach, *Statistische Physik*, table of contents https://www.web7.webhosting.zimt.uni-siegen.de/pdf/stinh.pdf
- [R17] Wikipedia, "Writing better articles" (summary style) and "Manual of Style/Lead section", https://en.wikipedia.org/wiki/Wikipedia:Manual_of_Style/Lead_section
- [R18] The Stacks project, tags, https://stacks.math.columbia.edu/tags ; [R18b] nLab, "density matrix", https://ncatlab.org/nlab/show/density+matrix ; [R18c] Physics LibreTexts, https://phys.libretexts.org/ ; [R18d] Immersive Linear Algebra, http://immersivemath.com/ila/index.html ; [R18e] B. Ciechanowski, archives, https://ciechanow.ski/archives/ ; [R18f] Wikipedia, "Parable of the Polygons", https://en.wikipedia.org/wiki/Parable_of_the_Polygons ; [R18g] https://www.3blue1brown.com/
- [R19] B. Victor, "Up and Down the Ladder of Abstraction", Oct 2011, https://worrydream.com/LadderOfAbstraction/
- [R20] B. Victor, "Explorable Explanations", 10 Mar 2011, https://worrydream.com/ExplorableExplanations/
- [R21] A. Matuschak, M. Nielsen, "Quantum computing for the very curious", https://quantum.country/qcvc
- [R22] A. Matuschak, "Mnemonic medium" (working note), https://notes.andymatuschak.org/Mnemonic_medium
- [R23] C. Olah, S. Carter, "Research Debt", Distill, 22 Mar 2017, https://distill.pub/2017/research-debt/
- [R24] G. Branwen, "Design of This Website", modified 2023-04-20, https://gwern.net/design
- [R25] D. Liepmann, Tufte CSS, https://edwardtufte.github.io/tufte-css/
- [R26] MyST, "Dropdowns, Cards and Tabs", https://mystmd.org/guide/dropdowns-cards-and-tabs ; [R26b] Quarto, "Conditional Content", https://quarto.org/docs/authoring/conditional.html
- [R34] CTAN `versions` https://ctan.org/pkg/versions ; [R35] CTAN `tufte-latex` https://ctan.org/pkg/tufte-latex ; [R36] CTAN `ocgx2` https://ctan.org/pkg/ocgx2 and local `/usr/share/texlive/texmf-dist/doc/latex/ocgx2/README.txt.gz`
- [R37] pdf.js issue #18823, https://github.com/mozilla/pdf.js/issues/18823
- [R42] MDN, `<details>`, https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details

Papers (DOIs resolved via Crossref 2026-10-09):

- [R27] Karich, Burns, Maki (2014). Updated meta-analysis of learner control within educational technology. *Review of Educational Research* 84, 392-410. doi:10.3102/0034654314526064
- [R27a] Kalyuga, Ayres, Chandler, Sweller (2003). The expertise reversal effect. *Educational Psychologist* 38, 23-31. doi:10.1207/S15326985EP3801_4
- [R27b] Kalyuga (2007). Expertise reversal effect and its implications for learner-tailored instruction. *Educational Psychology Review* 19, 509-539. doi:10.1007/s10648-007-9054-3
- [R28] Scheiter, Gerjets (2007). Learner control in hypermedia environments. *Educational Psychology Review* 19, 285-307. doi:10.1007/s10648-007-9046-3
- [R28b] Gerjets, Scheiter, Opfermann, Hesse (2009). Learning with hypermedia: the influence of representational formats and different levels of learner control on performance and learning behavior. *Computers in Human Behavior* 25, 360-370. doi:10.1016/j.chb.2008.12.015
- [R29] DeStefano, LeFevre (2007). Cognitive load in hypertext reading: a review. *Computers in Human Behavior* 23, 1616-1641. doi:10.1016/j.chb.2005.08.012
- [R30] McNamara, Kintsch (1996). Learning from texts: effects of prior knowledge and text coherence. *Discourse Processes* 22, 247-288. doi:10.1080/01638539609544975
- [R31] Shin, Schallert, Savenye (1994). Effects of learner control, advisement, and prior knowledge on young students' learning in a hypertext environment. *ETR&D* 42, 33-46. doi:10.1007/BF02298169
- [R32] Madrid, Van Oostendorp, Puerta Melguizo (2009). The effects of the number of links and navigation support on cognitive load and learning with hypertext. *Computers in Human Behavior* 25, 66-75. doi:10.1016/j.chb.2008.06.005
- [R33] Antonenko, Niederhauser (2010). The influence of leads on cognitive load and learning in a hypertext environment. *Computers in Human Behavior* 26, 140-150. doi:10.1016/j.chb.2009.10.014
- [R33b] Zumbach, Mohraz (2008). Cognitive load in hypermedia reading comprehension: influence of text type and linearity. *Computers in Human Behavior* 24, 875-887. doi:10.1016/j.chb.2007.02.015
- [R33c] Dillon, Gabbard (1998). Hypermedia as an educational technology. *Review of Educational Research* 68, 322ff. doi:10.2307/1170600 (end page [UNVERIFIED])
- [R34b] Harp, Mayer (1998). How seductive details do their damage. *Journal of Educational Psychology* 90, 414-434. doi:10.1037/0022-0663.90.3.414
- [R38] Schneider, Beege, Nebel, Rey (2018). A meta-analysis of how signaling affects learning with media. *Educational Research Review* 23, 1-24. doi:10.1016/j.edurev.2017.11.001 (effect sizes not retrieved [UNVERIFIED])
- [R39] Rey, Beege, Nebel, Wirzberger, et al. (2019). A meta-analysis of the segmenting effect. *Educational Psychology Review* 31, 389-419. doi:10.1007/s10648-018-9456-4
- [R40] Mayer (2017). Using multimedia for e-learning. *Journal of Computer Assisted Learning* 33, 403-423. doi:10.1111/jcal.12197
- [R41] Noetel, Griffith, Delaney, Harris, et al. (2021/2022). Multimedia design for learning: an overview of reviews with meta-meta-analysis. *Review of Educational Research* 92, 413-454. doi:10.3102/00346543211052329
- Used in EXAMPLES.md: Busch (2003). Quantum states and generalized observables: a simple proof of Gleason's theorem. *Physical Review Letters* 91, 120403. doi:10.1103/PhysRevLett.91.120403 ; M. Plavala, "General probabilistic theories: an introduction", arXiv:2103.07469 (local tarball `~/Downloads/arXiv-2103.07469v2.tar.gz`, not read by this lane).
