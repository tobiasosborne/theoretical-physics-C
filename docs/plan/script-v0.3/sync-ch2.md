# sync-ch2: script chapter 2 (vl02 / lec02) -> new course

One row per item of the new `latex/lectures/de/vl02.tex` (German leads; `lec02.tex` is its line-for-line
translation and maps to the same sources in `content/c03-hilbertraum/en.tex`). "de.tex:N" means
`content/c03-hilbertraum/de.tex` line N as of 2026-10-22. "v0.2:N" means line N of the v0.2
`vl02.tex` (sha256 0acb89f3..., the file the migration map `evidence/migrations/maps/vl02-map.json`
was written against). Displays are numbered as they render, (1) to (6).

| # | new item (vl02.tex) | kind | source in the new course (Kern) | v0.2 | migration record |
|---|---|---|---|---|---|
| 1 | `\section{Vorlesung: Hilbertraum}` | section | chapter c03 (title "Werkzeugkasten Hilbertraum"; script title kept) | v0.2:3 | |
| 2 | "Um die Zustände ... Hilbertraum ... komplexe Vektorräume ... analog zum reellen Fall" | paragraph | c03 intro, de.tex:40-44 | v0.2:4 | |
| 3 | "Warum hier komplexe und nicht reelle Vektoren ... wissen wir nicht" | paragraph | c03 intro, de.tex:47-49 | v0.2:6 | |
| 4 | `\subsection{Komplexe Vektoren}` | subsection | c03.s1 | | |
| 5 | "Ein komplexer Vektor ... Spalte von n komplexen Zahlen, seinen Einträgen" | paragraph (inline definition) | D75 (transcluded in c03.s1, de.tex:63) | v0.2:8 | |
| 6 | (1) `v = (v_1, ..., v_n)^T` | display | D75 body | v0.2 eq@9 | |
| 7 | "Multiplikation mit einem Skalar ... Eintrag für Eintrag ... komplexer Vektorraum C^n ... Dimension" | paragraph (inline definitions) | D75 body | v0.2:15-34, 53, 57 (the two displays of the rules become one sentence) | |
| 8 | "Für den Vektorraum genügen diese beiden Regeln. Kreuz-Operation und Skalarprodukt ... Zusatzstruktur ... Hilbertraum" | paragraph (same) | c03.s1, de.tex:71-73 | v0.2:55 | |
| 9 | "Der einfachste Fall, C^1, ist langweilig ... C^2 ... die reinen Zustände eines Qubits" | paragraph | c03.s1, de.tex:76-83 (v03 [08:52]-[10:31]); "reinen": de.tex:81-83 (a vector describes a pure state; mixed states need density matrices); repair wave, REVIEW.md finding 3 | v0.2:139 (C^2 belongs to the qubit) | |
| 10 | Beispiel 2.1 (Rechnen in C^2) | example | c03.ex.c2, claim c03.cl.c2 | v0.2 beispiel@59 | |
| 11 | (2) `v = (1+i, 1-i)^T, w = (1, -1)^T` | display | c03.eq.c2-vektoren | v0.2 eq@68 | |
| 12 | (3) `v + w = (2+i, -i)^T, i v = (-1+i, 1+i)^T` | display | c03.eq.c2-rechnung (claim c03.cl.c2) | | |
| 13 | `\subsection{Kreuz-Operation und Skalarprodukt}` | subsection | c03.s2 | | |
| 14 | "Die Kreuz-Operation macht aus einem Spaltenvektor den Zeilenvektor ... Skalarprodukt ... Zeile mal Spalte, eine komplexe Zahl" | paragraph (inline definitions) | D76 (transcluded in c03.s2, de.tex:112); de.tex:105-110 | v0.2:35-51 | M-0016 (3) |
| 15 | (4) `v^dagger = (v_1^* ... v_n^*), v^dagger w = sum_j v_j^* w_j` | display | D76 body | v0.2 eq@36, eq@44 | M-0016 (3): bold v under the dagger |
| 16 | "Das Kreuz steht immer auf dem ersten Vektor." | sentence | D76 body (last sentence) | | |
| 17 | `\input{figures/fig_vl02_kreuz}` | figure | c03.fig.kreuz, panel (a) only (de.tex:114-123); same vector v = (2+i, -1+2i) | replaces v0.2 figure@131 (fig_vl02_raeume) | |
| 18 | "Die Abbildung zeigt ... spiegelt jeden Eintrag an der reellen Achse, hier für die Einträge 2+i und -1+2i" | sentence | c03.fig.kreuz caption (a), de.tex:116-119 | | |
| 19 | "Man müsste nicht konjugieren ... umlegen ... zahlt sich aus, sobald man einen Vektor mit sich selbst multipliziert. Weil v_j^* v_j = abs(v_j)^2 ..." | paragraph | c03.s2, de.tex:126-129 (v03 [04:40]) | | |
| 20 | (5) `v^dagger v = sum_j abs(v_j)^2 >= 0` | display | c03.eq.selbst, claim c03.cl.selbst | | |
| 21 | "Das Skalarprodukt eines Vektors mit sich selbst ist also reell und nie negativ." | sentence | c03.s2, de.tex:133 | | |
| 22 | "Ohne Konjugation ergäbe Zeile mal Spalte für den Vektor mit den Einträgen 1 und i die Zahl 1+i^2=0 ..." | sentence (condensed example) | c03.ex.ohne-stern, claim c03.cl.ohne-stern (de.tex:135-143) | | |
| 23 | Beispiel 2.2 (Skalarprodukt in C^2) | example | c03.ex.skalarprodukt, claim c03.cl.vw | v0.2 beispiel@59 (second half) | |
| 24 | (6) `v^dagger w = ... = -2i, w^dagger v = ... = 2i` | display | c03.eq.vw and c03.eq.wv (claim c03.cl.vw) | v0.2 eq@76 (first half) | |
| 25 | "Die Reihenfolge ist also wichtig; die beiden Ergebnisse sind zueinander komplex konjugiert." | sentence | c03.ex.skalarprodukt, de.tex:159-168 (v03 [12:59]-[15:28]) | | |
| 26 | `\subsection{Unendlich viele Einträge}` | subsection | c03.s3 | | |
| 27 | "An dieser Stelle könnte man endlichdimensionale Hilberträume schon definieren ... Felder ... unendlich viele Freiheitsgrade." | sentences | c03.s3, de.tex:230-234 | v0.2:85 | |
| 28 | "Man kann sich solche Vektoren als Spalten mit unendlich vielen Einträgen vorstellen" | clause | c03.s3, de.tex:241-242 (Kern bridge) | v0.2:85 | M-0016 (2): "Einträgen" |
| 29 | "oder als Funktionen, die jeder Stelle x der reellen Achse eine komplexe Zahl f(x) zuordnen; mit Funktionen beschreibt man etwa die reinen Zustände eines Teilchens ohne Spin in einer Dimension." | clause | c03.s3, de.tex:370-374 (Kern, outside the Vertiefung; "die reinen Zustände" de.tex:373; repair wave, REVIEW.md finding 3) | v0.2:114, 139 | M-0016 (1): functions map R to C, not the space |
| 30 | "Setzt man in den Formeln einfach n = infinity, so kann das Skalarprodukt divergieren; der Webkurs ... zeigt, wie man das repariert, indem man nur Spalten mit endlicher Summe der Betragsquadrate (den Raum l^2) und Funktionen mit endlichem Integral des Betragsquadrats zulässt." | the one pointer sentence (BRIEF) | c03.s3 bridge de.tex:240-242; c03.v1 `wozu` de.tex:246-249; D77; D78 (definition of quadratintegrierbar only; L^2(R) deliberately not named, see D78 notes and REVIEW-lec2 row 1); chapter.json `effective_theory` | v0.2:91-112, 114-121 (condensed) | M-0014 (the series is the naive generalisation and can diverge) |
| 31 | "Ein komplexer Vektorraum mit Skalarprodukt ist fast schon ein Hilbertraum; es fehlt noch ... die Vollständigkeit, und die ist in C^n immer erfüllt. Bevor wir den Hilbertraum in der nächsten Vorlesung definieren, brauchen wir eine Schreibweise ...: die Notation von Dirac." | paragraph (hand-over to vl03) | c03.s3, de.tex:538-543 (v03 [37:39], [39:46]-[42:02]) | | |

## v0.2 items not in the new chapter 2

All of these are Vertiefung (c03.v1, c03.v2, c03.v3) or Fundament (c03.f2) in the new course and stay
out of the script by the BRIEF; row 30 is the single pointer to them.

| v0.2 item | where it lives now |
|---|---|
| eq@18, eq@25 (componentwise scalar multiplication and addition displayed with columns) | condensed to one sentence (row 7); D75 |
| beispiel@59 first display (C^2 consists of all two-component vectors) eq@61 | folded into row 9 |
| text@85-96, eq@86, eq@92 (infinite columns, inner-product series, "n = infinity in allen Gleichungen") | c03.v1 (M-0014) |
| text@98-112, eq@99, eq@105, eq@109 (vector of ones, eqbox l^2 condition, l^2 named) | c03.ex.einsen, D77, c03.prop.elltwo (c03.v1) |
| text@114-121, eq@115, eq@119 (square-integrable functions, <f,g> called a scalar product) | D78, c03.prop.ltwo (c03.v2); repair in c03.f2 (M-0015) |
| beispiel@123, eq@125 (non-example f = 1) | c03.ex.eins (c03.v2) |
| figure@131 fig_vl02_raeume (partial sums, partial integrals) | c03.fig.partialsummen, c03.fig.partialintegrale (c03.v1, c03.v2); file deleted |
| text@133 (rate remark, "Norm ... logarithmisch") | c03.ex.rate, c03.ex.gauss (M-0013) |
| greybox@138 (three spaces, three systems; photon in a fibre) | c03.v3, c03.eq.drei-raeume; photon example open (G-0033 (e)) |
