# sync-ch6: script chapter 6 (vl06) -> new course

One row per item of the new `latex/lectures/de/vl06.tex` (German leads; `lec06.tex` follows in the
English round). Sources by course ID in `content/c04-quantentheorie/de.tex`, registry D22, D24, D26,
claims `c04.cl.*`. The postulates P1-P5 are in the wording of v0.2 (D-WORTLAUT, 2026-11-06), with the course's
symbols. "v0.2:N" = line N of the v0.2 `vl06.tex`
(`git show 90fe735d:latex/lectures/de/vl06.tex`; map `evidence/migrations/maps/vl06-map.json`).

| # | new item (vl06.tex) | kind | source in the course (Kern) | v0.2 | migration |
|---|---|---|---|---|---|
| 1 | `\section{Vorlesung: Postulate der Quantenmechanik}` | section | c04 | v0.2:2 | |
| 2 | "Die Zahlen ... Bruch mit der klassischen Physik ..." | paragraph | c04 first paragraph | v0.2:3-6 | |
| 3 | repetition, procedure, preparation and measurement, three ingredients; "Webkurs, Kapitel 2" | paragraph | c04 second and third paragraphs | v0.2:8-13 | M-0071 |
| 4 | `\subsection{Die Postulate}`, greybox | subsection, box | c04.s1 greybox | v0.2:15-19 | |
| 5 | "Wir stellen die Postulate Schritt für Schritt auf ... P0" | sentence | c04.s1, c04.eq.p0 (P0 inline, not boxed) | (none) | |
| 6 | Merksatz [P1], v0.2 wording | box | c04.eq.p1 | v0.2:22 | |
| 7 | qubit, qudit, L²(ℝ³); "sagt das Experiment"; tensor product later; finite dimension | paragraph | c04.s1 paragraph after P1 | v0.2:24-34 | M-0071 |
| 8 | Merksatz [P2], v0.2 wording; "Wir sagen auch Dichteoperator" | box | c04.eq.p2, D22 | v0.2:36 | M-0072 |
| 9 | (removed 2026-11-06: the gloss of the brief's functional wording) | | | | |
| 10 | (removed 2026-11-06: the definition environment; P2 states the density matrix) | | | | |
| 11 | warning: states are operators; closed systems | paragraph | c04.s1.1 warning (H3.2) | v0.2:39 | |
| 12 | mixtures, spectral decomposition, pure states = |ψ><ψ|, normalisation, "eindimensional" | paragraph | c04.prop.rein and the paragraph after it | v0.2:41-45 | |
| 13 | Beispiel (Zustände eines Qubits), displays (1), (2) | example | c04.ex.qubit-zustaende | v0.2:47-57 | |
| 14 | Übung (eigenvalues) | exercise | c04.exc.eigenwerte | v0.2:59-61 | |
| 15 | Merksatz [P3], v0.2 wording + "Die Schreibweise ... erklärungsbedürftig"; "Dual des Zustandsraums" sentence | box, paragraph | c04.eq.p3, c04.s1.2, c04.prop.effekte (statement only) | v0.2:64-67 | |
| 16 | Merksatz [P4], v0.2 wording | box | c04.eq.p4, D26 | v0.2:82-83 | |
| 17 | (3) pure-state Born rule; "Gewohnheit ... welches Postulat" | display, sentence | c04.eq.born-rein; c04.s1.3 | v0.2:94-98 | |
| 18 | Beispiel (Z-Messung), display (4) | example | c04.ex.z-messung + c04.ex.born (merged) | v0.2:69-91 | |
| 19 | measurements with several outcomes, (5) `F_x ≥ 0, Σ F_x = I`; efficiency detector; projection-valued; (6) expectation value; PVM ↔ Hermitian; "Observablen ... Spezialfall" | paragraph, displays | D24, c04.eq.verteilung, c04.ex.wirkungsgrad (inline), c04.eq.erwartung, c04.prop.pvm | v0.2:100-119 | |
| 20 | `\subsection{Zeitentwicklung}` + relative time | subsection, paragraph | c04.s2 first paragraph | v0.2:121 | |
| 21 | "Mit P0 bis P4 wären wir im Prinzip fertig ... Hilfspostulat"; Merksatz [P5], v0.2 wording, with (7) `<A>(t) = tr(U ρ U^† A) = tr(ρ U^† A U)` inside the box | sentence, box, display | c04.s2, c04.eq.p5, c04.eq.dynamik | v0.2:123-130 | |
| 22 | "Diese Gleichung folgt einfach aus der Zyklizität ...", pictures | paragraph | c04.s2 | v0.2:132-134 | |
| 23 | "Im Postulat fehlt eine Voraussetzung, die wir hier nachtragen": H Hermitian; U preserves states and detectors; delayed measurement = other measurement, P5 compatible; "Dynamik ist eine Symmetrie"; H additional; self-adjoint in infinite dimension (Webkurs) | paragraph | c04.prop.dynamik, c04.s2 paragraph after it, c04.v2 (pointer) | v0.2:136 | M-0069 |
| 24 | Beispiel (Qubit unter der Z-Messung), display (8) | example | c04.ex.qubit-dynamik | v0.2:138-160 (U_t computation moved to chapter 5) | M-0070 |
| 25 | figure `fig_vl06_messung` + paragraph | figure | c04.fig.messung | v0.2:162-164 | M-0070 |
| 26 | "Eine bedeutende Lücke bleibt ..." | paragraph | c04.s2 last paragraph | v0.2:166 | |
