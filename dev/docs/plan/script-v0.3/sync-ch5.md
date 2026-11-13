# sync-ch5: script chapter 5 (vl05) -> new course

One row per item of the new `latex/lectures/de/vl05.tex` (German leads; `lec05.tex` follows in the
English round). Sources by course ID in `content/c03-hilbertraum/de.tex` (sections c03.s13-c03.s15,
registry D95-D98, claims `c03.cl.*`). "v0.2:N" = line N of the v0.2 `vl05.tex`
(`git show 90fe735d:latex/lectures/de/vl05.tex`; map `evidence/migrations/maps/vl05-map.json`).
Displays numbered as they render, (1)-(11).

| # | new item (vl05.tex) | kind | source in the course (Kern) | v0.2 | migration |
|---|---|---|---|---|---|
| 1 | `\section{Vorlesung: Spur, Diagonalisierung, Funktionalkalkül}` | section | c03.s13-c03.s15 | v0.2:3 | title without "Position-Basis" (D-POS) |
| 2 | "Mit dieser Vorlesung ist das mathematische Werkzeug ... vollständig. Die Positions-Basis ... kommt mit dem Teilchen auf der Geraden in Vorlesung 7." | paragraph | c03.s14 first sentence; D-POS forward pointer | v0.2:4-55 deferred | D-POS |
| 3 | `\subsection{Spur}` + "Aus der Matrizenrechnung kennen Sie ..." | subsection, sentence | c03.s13 | v0.2:57-58 | |
| 4 | Definition (Spur), display (1) | definition | D95 | v0.2:58-62 | |
| 5 | basis independence (inline computation) | sentence | c03.prop.spur (1), claim c03.cl.spur | (none) | |
| 6 | (2) `tr_2(AB) = ... = tr_1(BA)` with the gloss on the index; "den letzten Faktor nach vorn holen" | display, paragraph | c03.prop.spur (3), c03.eq.zyklisch; remark after the proposition | v0.2:63-66 | |
| 7 | (3) `tr(|Ψ><Φ|) = <Φ|Ψ>` via kets and bras as maps | display | c03.prop.spur (4), c03.eq.spur-ketbra | (none; for chapter 6) | |
| 8 | "Zum Beispiel ist der Projektor B ... tr(B) = 1" | sentence (condensed example) | c03.ex.spur, claim c03.cl.spur-beispiel | (none) | |
| 9 | "In unendlich vielen Dimensionen ... nicht jeder Operator eine Spur." | sentence | c03.s13 last paragraph | v0.2:66-70 (position-basis trace deferred) | D-POS |
| 10 | `\subsection{Eigenwerte und Diagonalisierung}` + motivation paragraph | subsection, paragraph | c03.s14 first paragraph | v0.2:72-73, 90 | |
| 11 | Definition (Eigenvektor, Eigenwert, Eigenraum; diagonal, diagonalisierbar) | definition | D96, D97 | v0.2:74-77, 83, 91-96 | M-0064, M-0065 |
| 12 | "Ein Eigenvektor ... fast nie die Norm 1 ... diagonaler Operator multipliziert jede Komponente ..." | paragraph | c03.s14 after D96; c03.eq.diagonal-wirkung | v0.2:78-81, 133 | |
| 13 | (4) `U = Σ |x><φ_x|`, (5) `UU^† = I`, (6) `UAU^† = Σ a_x|x><x|, A = Σ a_x|φ_x><φ_x|, tr A = Σ a_x` | displays | c03.prop.diagonal (2), (3); c03.eq.u-konstruktion, c03.eq.spektralzerlegung | v0.2:129-157 | |
| 14 | "Die zweite Gleichung heißt Spektralzerlegung. Ist umgekehrt U unitär ..." | sentences | c03.prop.diagonal (1) | v0.2:98-127 | M-0067 |
| 15 | non-diagonalisable matrix ((0,1),(0,0)); "In der Quantenmechanik haben wir Glück" | sentences | c03.s14 paragraph before c03.prop.eigen-hermitesch; c03.cl.spektral | v0.2:88 | |
| 16 | the trick, (7) `(a-b)<φ|ψ> = 0` | paragraph, display | c03.prop.eigen-hermitesch | v0.2:133-147 | |
| 17 | Merksatz (Spektralsatz), "Beweis im Webkurs" | box | c03.thm.spektral (proof in the course) | v0.2:88 | M-0066 |
| 18 | "Die endliche Dimension ist wesentlich ... der Webkurs zeigt ein Beispiel." | sentence | c03.v7 (pointer only) | v0.2:179 | M-0066 |
| 19 | Beispiel (Qubit, Hadamard), displays (8), (9) | example | c03.ex.hadamard | v0.2:159-172 | |
| 20 | figure `fig_vl05_diagonal` + paragraph | figure | c03.fig.diagonal (same geometry; labels to the new notation) | v0.2:175-177 | |
| 21 | `\subsection{Funktionalkalkül}` + "Weil diagonale Operatoren so gut wie Zahlen sind ..." | subsection | c03.s15 first paragraph | v0.2:181 | |
| 22 | Definition (f(A)) | definition | D98 | v0.2:189-197 | M-0067 |
| 23 | polynomial and basis independence sentence | sentence | c03.prop.funktion (1), (2) | (none) | |
| 24 | (10) `U_t = e^{-itH/ħ} = Σ e^{-itE_x/ħ}|φ_x><φ_x|`; the chain "reell, Phasen, unitär"; series | display, paragraph | c03.eq.zeitentwicklung, c03.prop.funktion (3), c03.eq.exp-reihe | v0.2:182-201 | M-0068 |
| 25 | Beispiel (H = εσ_x), eqbox (11) | example | c03.ex.qubit-zeit | vl06 v0.2:138-160 (moved from chapter 6) | M-0070 |
| 26 | Merksatz (Zeitentwicklung) | box | c03.s15 merksatz | v0.2:205-207 | |
