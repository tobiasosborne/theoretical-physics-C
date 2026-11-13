# sync-ch4: script chapter 4 (vl04 / lec04) -> new course

One row per item of the new `latex/lectures/de/vl04.tex` (German leads; `lec04.tex` is its line-for-line
translation and maps to the same sources in `content/c03-hilbertraum/en.tex`). Sources by course ID
(section `c03.sN`, registry definition `Dnn`, claim `c03.cl.*`, label); lane A's German Kern of
c03.s8 to c03.s12 as of 2026-10-29 ("KERN-DE READY", Kern IDs fixed). Course line numbers are left out:
lane A is still editing the file. "v0.2:N" is line N of the v0.2 `vl04.tex` (snapshot `tpc-script-v0.2`;
copy in the lane's scratchpad); "vl03 v0.2:N" is the moved Operatoren subsection of the v0.2 `vl03.tex`
(map `evidence/migrations/maps/vl03-map.json` items 117-130, status deferred). There is no vl04
migration map yet. "vl04:N" is the new file. Displays are numbered as they render, (1) to (14). Rows changed in the repair wave of 2026-10-29 say so in the last column; line numbers are of the repaired file.

| # | new item (vl04.tex) | kind | source in the new course (Kern) | v0.2 | migration / defect |
|---|---|---|---|---|---|
| 1 | `\section{Vorlesung: Operatoren}` (vl04:4) | section | c03.s8 to c03.s12 | v0.2:3 | |
| 2 | `\subsection{Operatoren und der Hut}` (vl04:6) | subsection | c03.s8, c03.s8.1 | (none) | |
| 3 | "Das zweite Standbein der Theorie sind die Operatoren: Mit ihnen beschreibt die Quantenmechanik Zustände, Messungen und Dynamik." (vl04:7) | sentence | c03.s8 first paragraph ("Ihre Zustände, ihre Messungen und ihre Dynamik werden durch Operatoren beschrieben"; the H3.2 sentence is not carried) | vl03 v0.2:254; v0.2:5 | H3.2 (vectors are not "the states"; not repeated) |
| 4 | Definition (Operator) (vl04:8-15) | definition env | D87 | vl03 v0.2:256-268 | M-0024 ("Sei H ein Hilbertraum", "das heißt") |
| 5 | (1) linearity `Â(\|φ>+\|ψ>) = ..., Â(α\|φ>) = αÂ\|φ>` | display (in definition) | D87 | vl03 v0.2 eq@257, eq@261, eq@265 (three displays become one) | |
| 6 | "In dieser Vorlesung ist H endlichdimensional: Es hat eine Basis mit endlicher Indexmenge, wie C^n mit v^†w. Mit einer Basis ist ein Operator nichts anderes als eine n×n-Matrix; die Regeln für Matrix mal Spalte sind genau die beiden Bedingungen. Wenn Sie das Wort Operator hören, denken Sie an eine Tabelle. Ein Produkt wird von rechts nach links ausgeführt: ÂB̂ heißt erst B̂, dann Â." (vl04:17) | paragraph (hypothesis, condensed example, gloss) | c03.s8 (finite dimension in the Kern, decision D4); c03.ex.matrix, claim c03.cl.matrix (as prose); c03.s8 "denken Sie an eine Tabelle"; the product gloss: c03.s9, display c03.eq.produkt, claim c03.cl.produkt (lane A's Kern sentence on operator products, 2026-10-29) | vl03 v0.2 beispiel@270-277 (example environment dropped) | M-0024 ("operatoren", word order) applied by removal; repair wave: "wie C^n" (C^n is not a basis), product gloss |
| 7 | "Trivial, aber sehr nützlich sind der Einsoperator I ... und der Nulloperator 0̂ ...; im endlichdimensionalen Fall ... Einheitsmatrix und ... lauter Nullen. Einer hingeschriebenen Null sieht man nicht an, was gemeint ist. Wir vereinbaren deshalb:" (vl04:19) | paragraph (inline definitions: Einsoperator, Nulloperator) | c03.s8.1; D88 | v0.2:7-29 (definition environment, two displays and the n×n identity matrix become one sentence) | v0.2:9 "Sei H einen Hilbertraum" gone |
| 8 | Merksatz (Notation) (vl04:21-23): exceptions without a hat are the identity, the ket-bras, the states and the Pauli matrices | box | c03.s8.1 merksatz; D-HAT as revised by TJO 2026-10-29 (identity, states, Pauli matrices; ket-bras added the same day, BRIEF.md) | v0.2:31-33 | repair wave: ket-bras named |
| 8a | "Die Vorlesungen ab Vorlesung 5 sind noch in der alten Fassung und schreiben Operatoren oft ohne Hut." (vl04:24) | sentence (seam note) | none in the course (script-only fact: chapters 5-22 are not touched, BRIEF.md D-HAT); asked for by REVIEW-ch4 (MISMATCH vl04:22) | | repair wave |
| 9 | `\subsection{Der adjungierte Operator}` | subsection | c03.s9 | (none) | |
| 10 | "Die Kreuz-Operation übertragen wir jetzt auf Operatoren. Der adjungierte Operator Â^† ist durch die folgende Gleichung festgelegt:" | sentences (inline definition) | c03.s9 first paragraph; D17 | v0.2:35 | repair wave; re-review (PARTLY vl04:27-31): the lead-in is complete before the display |
| 11 | (2) `<Â^†φ\|ψ> = <φ\|Âψ> für alle \|φ>, \|ψ>` | display | D17 | v0.2 eq@36 | |
| 12 | "Er ist also nicht durch eine Rechenvorschrift bestimmt, sondern durch sein Verhalten unter dem Skalarprodukt. In endlicher Dimension gibt es genau einen solchen Operator." | sentences | D17 body; c03.prop.adjungiert, claim c03.cl.adjungiert (proof not carried) | v0.2:39 | re-review |
| 13 | "In C^n mit v^†w heißt das Kreuz: erst transponieren, dann alle Einträge komplex konjugieren. Wie der Bra hängt Â^† aber vom Skalarprodukt ab: Mit einem anderen Skalarprodukt gilt diese Regel für die Einträge in C^n im Allgemeinen nicht mehr." | sentences (hedge) | c03.eq.adj-matrix, claim c03.cl.adj-matrix (display not carried); c03.s9 paragraph after it ("Wie der Bra hängt der adjungierte Operator vom Skalarprodukt ab"; the 1/c counterexample not carried) | v0.2:39-52 | repair wave (MUSE §4 b): "for the entries in C^n", in contrast to row 29 |
| 14 | (3) the four rules of computation | display | D17 body; c03.prop.adj-regeln, claim c03.cl.adj-regeln | v0.2 align@55 | |
| 15 | `\subsection{Klassen von Operatoren}` | subsection | c03.s10 | (none) | |
| 16 | "Mit I und Â^† allein definieren wir sechs wichtige Klassen. Ein Operator Â heißt" + enumerate of six classes | list (six inline definitions) | D18, D20, D89, D90, D91, D92 (written with Â for all six, as v0.2) | v0.2:60-68 | |
| 17 | "Jede Klasse hat in der Quantenmechanik ihre eigene Rolle: Die hermiteschen Operatoren beschreiben die Observablen, die positiven, mit einer Normierung, die Zustände, die Projektoren Ja-Nein-Messungen (Ereignis oder kein Ereignis), und die isometrischen und unitären die Dynamik." | sentence | c03.eq.rollen, claim c03.cl.rollen ("Zustände (mit einer Normierung, Kapitel 4)"); for projectors TJO's ruling of 2026-10-29, now c03.eq.rollen word for word; and c03.s10 "Ein Projektor beschreibt also eine Ja-Nein-Frage: Ereignis oder kein Ereignis" | v0.2:69 ("Ereignis oder kein Ereignis") | repair wave: projector wording |
| 19 | "Hermitesche Operatoren heißen oft auch selbstadjungiert; in endlicher Dimension ist das dasselbe. Für Operatoren, die nur auf einem Teil des Raumes definiert sind, muss man symmetrisch und selbstadjungiert unterscheiden; das behandelt der Webkurs, ebenso die Isometrien in unendlich vielen Dimensionen, die nicht unitär sind." (vl04:51) | paragraph (the chapter's one web-course pointer) | Kern: c03.s10 ("Für die Operatoren des Kerns, die auf einem endlichdimensionalen Raum leben, ist das dasselbe"), D18; the pointer names only what Vertiefungen c03.v5 (symmetric vs self-adjoint, restricted domains) and c03.v6 (isometries) treat, without their claims; "symmetrisch" only named | v0.2:70; v0.2:69 end | M-0005 / H3.1; repair wave (codex WRONG); re-review (SCOPE vl04:51): the "whole space" claim (c03.v5 only) is no longer stated |
| 20 | "Â ist genau dann hermitesch, wenn <ψ\|Âψ> für jedes \|ψ> reell ist; deshalb ist jeder positive Operator hermitesch. Operatoren der Form B̂^†B̂ sind positiv, weil das Skalarprodukt eines Vektors mit sich selbst nie negativ ist:" | sentences | c03.prop.positiv parts 1-3, claim c03.cl.positiv (proofs not carried); the reason is the course's ("Das Skalarprodukt eines Vektors mit sich selbst ist nie negativ") | v0.2:70-74 | |
| 21 | (4) `<ψ\|B̂^†B̂ψ> = <B̂ψ\|B̂ψ> >= 0` | display | proof of c03.prop.positiv part 3; D20 body | v0.2 eq@75 | |
| 22 | "Wegen P̂ = P̂^†P̂ ist damit auch jeder Projektor P̂ positiv." | sentence | c03.prop.positiv part 4; D89 | v0.2:79 | |
| 23 | "Mit demselben Schritt beginnt der Beweis der Unschärferelation in Vorlesung 9." | sentence | c03.s10 paragraph after c03.prop.positiv (G-0072 (b); course "Kapitel 6" = script Vorlesung 9) | | repair wave: no longer an apposition |
| 24 | "Ein isometrischer Operator V̂ lässt das Skalarprodukt invariant, <V̂φ\|V̂ψ> = <φ\|ψ>. In endlicher Dimension ist jede Isometrie unitär, und hermitesche, positive und unitäre Operatoren, Projektoren und Isometrien sind normal." | sentences | c03.prop.isometrie parts 1-3 ("Sei H endlichdimensional"), claim c03.cl.isometrie; D90, D92 | v0.2:69, 79 | repair wave (MUSE §4 a): "Isometrien sind normal" now inside the finite-dimension sentence |
| 25 | `\subsection{Matrixelemente und Ket-Bras}` | subsection | c03.s11 | (none) | |
| 26 | "Sei {\|φ_x>} eine Basis von H mit endlicher Indexmenge. Die Matrixelemente von Â in dieser Basis sind die Zahlen [Â]_xy in" | sentences (inline definition: Matrixelemente) | D93 | v0.2:81 | v0.2:81 missing \rangle fixed; repair wave: defined before use |
| 27 | (5) `[Â]_xy = <φ_x\|Âφ_y>, Â\|Ψ> = Σ_{x,y} \|φ_x>[Â]_xy<φ_y\|Ψ>` | display | D93; c03.eq.wirkung, claim c03.cl.wirkung | v0.2 eq@82, eq@86 | |
| 28 | "dabei sagt y, welcher Basisvektor hineingeht (die Spalte), und x, welche Komponente herauskommt (die Zeile). Die zweite Gleichung folgt, wenn man die Entwicklung nach der Basis zweimal einsetzt; über x und y wird unabhängig summiert. Darin kommt keine Matrix vor ... sobald man seine Matrixelemente kennt." | sentences | D93 ("denn man setzt die Entwicklungsformel für Vektoren zweimal ein"); c03.s11 after c03.eq.wirkung; the row/column gloss reads off D93 ([Â]_xy = <φ_x\|Âφ_y>), asked for by MUSE §1 | v0.2:89 | repair wave: row/column clause |
| 29 | "Auch der adjungierte Operator lässt sich ablesen, [Â^†]_xy = [Â]_yx^*: Für Matrixelemente in einer Orthonormalbasis gilt transponieren und konjugieren bei jedem Skalarprodukt." | sentence | c03.eq.adj-elemente, claim c03.cl.adj-elemente; c03.s11 "in jeder Orthonormalbasis Transposition mit Komplexkonjugation, für jedes Skalarprodukt" | v0.2:90-94 | repair wave (MUSE §4 b) |
| 30 | "Kets und Bras kann man selbst als lineare Abbildungen lesen. Ab sofort ist das Ket \|Ψ> die Abbildung, die eine Zahl frisst und ein Vielfaches des Vektors Ψ produziert, für den es bisher stand. Die Definition des Adjungierten gilt ebenso für lineare Abbildungen zwischen zwei Hilberträumen, hier C mit dem Skalarprodukt a^*b und H. Der adjungierte Operator zum Ket ist der Bra; er frisst einen Vektor und produziert eine Zahl:" | sentences | c03.s11.1 (ket as a map; "Die Gleichung aus D17 definiert den adjungierten Operator wörtlich auch für eine lineare Abbildung von einem Hilbertraum in einen anderen ... C = C^1 ein Hilbertraum mit dem Skalarprodukt a^*b") | v0.2:96-100 | repair wave (REVIEW-ch4 MISMATCH vl04:66): the bridge restored; "einen subtilen Unterschied" dropped |
| 31 | (6) `\|Ψ>: C -> H, z -> zΨ; <Ψ\| = (\|Ψ>)^†: H -> C, Φ -> <Ψ\|Φ>` | display | c03.eq.ket-op, c03.eq.bra-op (claim c03.cl.bra-op) | v0.2 eq@97, eq@101, eq@105 | |
| 32 | "Bra mal Ket ist dann die Abbildung z -> <Φ\|Ψ>z. Wir unterscheiden sie nicht von der Zahl <Φ\|Ψ>; für das Rechnen ändert sich also nichts." | sentences | c03.s11.1 ("Für das Rechnen ändert sich nichts") | v0.2:108-112 | |
| 33 | "In der anderen Reihenfolge entsteht ein Operator auf H, das Ket-Bra" | sentence (inline definition: Ket-Bra) | c03.s11.1; D94 | v0.2:114-115 | |
| 34 | (7) `\|Ψ><Φ\| \|χ> = <Φ\|χ>\|Ψ> für alle \|χ>` | display | D94 | v0.2 eq@116, eq@120 | vl04.tex:121 quantifies "für alle Ψ" where χ is meant: fixed |
| 35 | "Ist die Basis aus dem Kontext klar, so trägt der Buchstabe φ keine Information mehr, und wir schreiben \|x> und <x\|. Damit werden die Entwicklungsformeln zu Operatorgleichungen:" | sentences | c03.s11.1 before c03.prop.ketbra; D93 last sentence | v0.2:124-125 | |
| 36 | (8) `(\|Ψ><Φ\|)^† = \|Φ><Ψ\|, I = Σ_x \|x><x\|, Â = Σ_{x,y} <x\|Â\|y> \|x><y\|` | display | c03.eq.ketbra, claim c03.cl.ketbra; D94 | v0.2 eq@126, eq@130 | |
| 37 | "Prüfen Sie sie, indem Sie beide Seiten auf einen beliebigen Vektor anwenden. Die Gleichung für I ist eine der hilfreichsten ... einschieben." | sentences | proof idea of c03.prop.ketbra; c03.s11.1 last paragraph | v0.2:129 | |
| 38 | `\subsection{Drei Operatoren auf C^3}` | subsection | c03.s12 | (none) | |
| 39 | Beispiel 4.1 (three operators) | example | c03.ex.drei, claim c03.cl.drei | v0.2 beispiel@134 | |
| 40 | (9) Â, B̂, Ĉ | display | c03.eq.abc | v0.2 eq@136 | |
| 41 | "Transponieren und Konjugieren gibt bei Â und B̂ dieselbe Matrix; beide sind hermitesch. Jeder Eintrag von B̂^2 ist (1+1+1)/9 = 1/3, also ist B̂ ein Projektor und damit positiv." | sentences | c03.ex.drei | v0.2:152-156, eq@153 (made prose) | v0.2:156 "is auch" and the photon-number model (no source; GAP-TJO in the course) not carried |
| 42 | "Â ist dagegen nicht positiv: Für \|ψ> mit den Einträgen 1/2, -1/sqrt2, 1/2 hat Â\|ψ> die Einträge -1/sqrt2, 1, -1/sqrt2, also ist" | sentence | c03.ex.drei | v0.2:156, 171-173 | |
| 43 | (10) `<ψ\|Â\|ψ> = (row)(column) = -sqrt2` | display | c03.eq.nicht-positiv (its second form) | v0.2 eq@157 | |
| 44 | "Ĉ ist unitär, denn" | sentence | c03.ex.drei | v0.2:174 | v0.2:174 "einen Unitärmatrix" gone |
| 45 | (11) `Ĉ^†Ĉ = I` as matrices | display | c03.eq.c-unitaer | v0.2 eq@175 | |
| 46 | "und ebenso ist ĈĈ^† = I. Mit der kanonischen Basis \|0>, \|1>, \|2> (die Spalten mit der 1 im ersten, zweiten, dritten Eintrag) ist" | sentences | c03.ex.drei | v0.2:192-199, 203 | v0.2:199 "können wir A ... darstellen" (C is meant): fixed |
| 47 | (12) `Ĉ = \|0><1\| + i\|1><2\| - \|2><0\|` | display | c03.eq.c-ketbra | v0.2 eq@200 | |
| 48 | "Was die drei Rechnungen gemeinsam haben, sieht man an den Eigenwerten. Ein Eigenwert von Â ist, informell gesagt, eine Zahl λ, für die Â einen Vektor \|v> != 0 einfach mit λ multipliziert ...; die genaue Definition kommt in der nächsten Vorlesung. Für jeden Eigenwert, den ein Operator hat, überträgt sich die definierende Gleichung seiner Klasse auf die Zahl λ:" | sentences | c03.s12 paragraph before c03.eq.orte (D-SPEKTREN) | v0.2:207 | v0.2:207 "für normale Operatoren" corrected; repair wave: "mit λ multipliziert", "den ein Operator hat" |
| 49 | (13) the four implications | display | c03.eq.orte, claim c03.cl.orte (the one-line reasons not carried) | v0.2:207 (inline, two of the four) | |
| 50 | "Das sind Einschränkungen für die Eigenwerte, die es gibt; die Umkehrung behaupten wir nicht. Die Normalität allein schränkt die Eigenwerte nicht ein. Die Eigenwerte der drei Beispieloperatoren sind" | sentences (hedges) | c03.eq.orte (one-way implications, "für jeden Eigenwert"); c03.s12 "Die Normalität allein schränkt die Eigenwerte nicht ein" (its λI witness dropped, REVIEW-ch4 KERNEL) | | repair wave (MUSE §4 d, REVIEW-ch4 KERNEL) |
| 51 | (14) eigenvalues: Â 0, ±sqrt2; B̂ 1, 0, 0; Ĉ e^{-iπ/6}, i, e^{7iπ/6} | display | c03.eq.spektren, claim c03.cl.spektren (B̂ with multiplicity, as det(λ-B̂) = λ^2(λ-1)) | v0.2 figure plate only | repair wave (MUSE §4 e): "1, 0, 0" |
| 52 | "und weitere gibt es nicht." | clause | c03.s12 | | |
| 53 | `\input{figures/fig_vl04_spektren}` | figure | c03.fig.spektren (D-SPEKTREN; the course figure `content/c03-hilbertraum/figures/spektren.tex` exists; the script keeps its own file, which already writes Â, B̂, Ĉ with hats) | v0.2 figure@205 | |
| 54 | "Teil (a) der Abbildung zeigt, wo die Eigenwerte einer Klasse liegen dürfen, Teil (b) die Eigenwerte von Â, B̂ und Ĉ. Dort liegt -sqrt2 links der Null; genau daran scheitert die Positivität von Â, denn \|ψ> von oben ist ein Eigenvektor der Norm eins zu diesem Eigenwert." | paragraph | c03.s12 last paragraph; c03.fig.spektren caption | v0.2:207 (second half; the em dashes gone) | |

## v0.2 items not in the new chapter 4

| v0.2 item | where it is now |
|---|---|
| v0.2:5 "Die Vektoren des Hilbertraums beschreiben die Zustände eines Systems ..." | dropped (H3.2); row 3 says what the course says |
| definition@8, eq@10, eq@14 (identity with the n×n matrix), eq@25 (zero operator) | condensed to row 7 (D88) |
| eq@40 (the n×n adjoint matrix) | c03.eq.adj-matrix, said in words (row 13) |
| list item "positiv" etc. with A for all classes | kept (row 16) |
| v0.2:69 roles; "normalen Operatoren bilden die Oberklasse" | rows 17, 24 |
| eq@71 `<ψ\|Aψ> in R` | made prose (row 20) |
| v0.2:79 "Isometrische Operatoren sind gerade die, die das Skalarprodukt und damit die Norm invariant lassen" | row 24 (the norm clause not carried) |
| v0.2:89 "genau deshalb trägt sie auch im unendlich-dimensionalen Fall" | not carried (the course weakens it to "die Summen werden Reihen, deren Konvergenz man prüfen muss"; the script makes no infinite-dimensional claim here) |
| eq@92 `[A]_xy -> [A]_yx^*` | inline (row 29) |
| eq@109, eq@105 | folded into rows 31-32 |
| eq@130 `[A]_xy = <x\|A\|y>` | in display (8) |
| v0.2:156 photon-number model | not carried (no source; GAP-TJO in the course) |
| eq@153 `A^† = A, B^† = B` | prose (row 41) |
| vl03 v0.2 beispiel@270 (2×2 matrix example) | prose (row 6); c03.ex.matrix |
| λI witness (c03.s12) | dropped in the repair wave (REVIEW-ch4 KERNEL: a second example) |
| Kern items of the course not carried | all proofs (c03.prop.adjungiert, .adj-regeln, .positiv, .isometrie, .ketbra); the Excel-table remark; the weighted-inner-product adjoint; the solution exercise c03.exc.ketbra; the eigenvectors of Â, B̂, Ĉ; "Man kann alles mit Matrizen machen oder alles mit Ket-Bras"; the "1/c" counterexample |
