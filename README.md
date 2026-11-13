# Theoretische Physik C

Lecture notes for the one-semester course *Theoretische Physik C* (quantum
mechanics and statistical physics) at the Leibniz Universität Hannover,
in **German** and **English**.

## Für Studierende · For students

Nichts muss installiert oder kompiliert werden. Alles unten funktioniert im
Browser des Handys. **Startseite mit allen Links:**
**<https://tobiasosborne.github.io/theoretical-physics-C/>**

Nothing needs to be installed or compiled. Everything below works in a phone's
browser. **One page with every link:**
**<https://tobiasosborne.github.io/theoretical-physics-C/>**

| | Deutsch | English |
|---|---|---|
| **Skript im Browser** · the notes in the browser, one page per lecture, interactive figures | [Vorlesungen lesen](https://tobiasosborne.github.io/theoretical-physics-C/web/de/index.html) | [read the lectures](https://tobiasosborne.github.io/theoretical-physics-C/web/en/index.html) |
| **Skript, alle 22 Vorlesungen (PDF)** · the complete notes | [TheoretischePhysikC.pdf](https://tobiasosborne.github.io/theoretical-physics-C/pdf/TheoretischePhysikC.pdf) | [TheoreticalPhysicsC.pdf](https://tobiasosborne.github.io/theoretical-physics-C/pdf/TheoreticalPhysicsC.pdf) |
| **Vorlesungsvideos** · lecture videos | [YouTube-Playlist](https://youtube.com/playlist?list=PLDfPUNusx1Epw58nW3Acp7VI-PqXCkQXf) | (auf Deutsch · in German) |

Die Seiten im Browser und das PDF haben denselben Text und dieselben
Gleichungsnummern; die Seiten im Browser enthalten zusätzlich interaktive
Abbildungen. The pages in the browser and the PDF carry the same text and the
same equation numbers; the pages add interactive figures.

Everything below this line is for people who want to build or change the
notes themselves.

---

22 lectures: from the birth of quantum mechanics and probability theory,
through Hilbert space, operators, the postulates, the Schrödinger equation,
the standard solvable potentials, angular momentum, spin, the hydrogen atom
and identical particles, to entropy and the microcanonical and canonical
ensembles.

The notes are paired with a [lecture video series][playlist] — 25 recordings
of roughly 90 minutes each. The commentary in those lectures, which was never
written down, is folded back into the notes.

[playlist]: https://youtube.com/playlist?list=PLDfPUNusx1Epw58nW3Acp7VI-PqXCkQXf

## Contents

| VL | Topic |
|----|-------|
| 1  | Die Geburt der Quantenmechanik; Wahrscheinlichkeit, Stichprobenräume, Momente |
| 2  | Hilbertraum: komplexe Vektorräume, Kreuz-Operation, Skalarprodukt |
| 3  | Hilbertraum, Basis, Operatoren |
| 4  | Operatoren |
| 5  | Positions-Basis, Spur, Diagonalisierung, Eigenwerte, Funktionalkalkül |
| 6  | Die Postulate der Quantenmechanik |
| 7  | „Quantisierung“: ein Teilchen in einer Dimension |
| 8  | Die Schrödingergleichung; Fourier-Transformation, Impulsraum |
| 9  | Unschärfe |
| 10 | Zerfließen des Wellenpakets |
| 11 | Teilchen im Kasten |
| 12 | Harmonischer Oszillator |
| 13 | Endlich hoher Potentialtopf |
| 14 | Drehimpuls |
| 15 | Zentralpotential, Separation der Variablen |
| 16 | Das Coulombpotential (Wasserstoffatom) |
| 17 | Spin |
| 18 | Identische Teilchen |
| 19 | Entropie |
| 20 | Mikrokanonisches Ensemble |
| 21 | Temperatur |
| 22 | Kanonisches Ensemble |

## Repository layout

```
latex/
  TheoretischePhysikC.tex     German master: the leading edition
  TheoreticalPhysicsC.tex     English master
  lectures/de/vl01–vl22.tex   German lectures  } the single source of the PDF
  lectures/en/lec01–lec22.tex English lectures } and of the web pages
  figures/                    TikZ figures, one file each, both languages
  tpc-*.sty, tokens/          style, macros, design tokens

web/
  tools/lecture/              lecture file -> web page (parser and site build)
  src/demos/, src/kernels/    the interactive figures and their physics
  src/demos/catalog.json      every demo: id, kind, title
  assets/stills/              the poster of each demo
  tests/                      unit tests of the kernels against reference values

scripts/
  build_figures.py            compile each figure once, cached (PDF and web image)
  check_parity.py             German ↔ English structural parity
  check_figures.py            figure inclusion and language switching
  publish_pages.sh            assemble the students' site in build/pages/
  pages/index.html            its landing page
  fetch_transcripts.py        download and normalise the video captions

build.sh                      both PDFs
check.sh                      everything worth checking before a push
.github/workflows/pages.yml   builds and deploys the students' site on a push to master

transcripts/                  reconstructed records of the 25 lecture videos
archive/                      the v0.1 script as it was taught
dev/                          the larger course project, parked (see dev/README.md)
```

## Working on a lecture

```bash
(cd web && npm ci)            # once
./build.sh                    # both PDFs (about ten seconds once the figures are cached)
bash web/run.sh build         # the web pages -> build/site/  (a few seconds)
bash web/run.sh serve         # look at them on http://127.0.0.1:8000/de/
./check.sh                    # parity, figures, PDFs, site: run before a push
git push                      # GitHub rebuilds and publishes the students' site
```

`./build.sh --local-fonts` uses the commercial print faces where they are
installed; those PDFs are never published. `./build.sh --help` lists the rest.

The figures are the slow part of LaTeX here (two minutes a pass if drawn inside
the document), so `scripts/build_figures.py` compiles each one once and both
the PDF and the web pages use the result. A figure is recompiled when its file
or a style file changes.

### Web-only material

The web pages are made from the same lecture files as the PDF. Two constructs
appear on the web only and leave no trace in print:

```latex
\webdemo{c03.demo.komplex}{Caption: what is shown, what to move.}

\webdemo[fig_vl03_vollst]{c03.demo.vollst}{...}   % takes the place of that static figure on the web

\begin{webonly}
Extra prose for the web page. Unnumbered displays only, so that the equation
numbers of the web page and of the PDF stay the same.
\end{webonly}
```

Demo ids are the file names in `web/src/demos/`. The web build stops with file
and line on any LaTeX construct it does not know; the list of what it knows is
`web/tools/lecture/parse.ts`.

## The two editions

The **German edition is the leading one**. Content changes are made there
first and then carried across to the English edition. Prose differs between
the two by definition, but everything that carries no language must agree, and
`./check.sh` enforces it: the same lectures, sectioning, display equations
(symbol for symbol), theorem-like environments, labels, references, figures,
key-equation boxes and demos, and no German left in an English source.

## Transcripts

`scripts/fetch_transcripts.py` downloads YouTube's original-language
(`de-orig`) automatic captions for all 25 lecture videos and writes a
timestamped transcript per video. Those raw captions are heavily garbled on
technical vocabulary, so `transcripts/clean/` holds a reconstruction of each
lecture: what was said, section by section, with the commentary that never
made it into the written notes marked out separately.

```bash
scripts/fetch_transcripts.py            # fetch what is missing
scripts/fetch_transcripts.py --force    # re-download everything
```

## Versions

- **v0.1**: the script as it was taught, preserved in `archive/skript-2022/`.
- **v0.2**: v0.1 with the lecture commentary folded in, one figure per lecture,
  and an English edition alongside.
- **v0.3** (current): lectures 1 to 6 rewritten as a compact kernel; lectures 7
  to 22 as in v0.2; one web page per lecture with interactive figures.

## The larger project in `dev/`

`dev/` holds a second, more ambitious project: a complete new quantum
mechanics course with layered depth, a notation registry and an evidence
trail for every claim. It is parked while the current lecture has priority;
`dev/README.md` says where it stands.

## Licence

GNU Affero General Public License v3.0 or later (see `LICENSE`). Third-party
material referenced by the course (textbooks, other lecturers' notes, commercial
fonts) is not part of the repository and is not covered by this licence.
