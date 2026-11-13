<!-- ROLE: lane A (author of chapter C3, lecture 4), 2026-10-29. Owner: lane A. -->
# NOTES-author (lane A): lecture 4 into C3

KERN-DE READY: c03.s8, c03.s8.1, c03.s9, c03.s10, c03.s11, c03.s11.1, c03.s12 (German text in content/c03-hilbertraum/de.tex; \tpcdef D87, D88, D17, D18, D20, D89, D90, D91, D92, D93, D94; claim IDs fixed, see the section list below)

Note after that line: the equation label `c03.eq.eins` in proposition c03.prop.ketbra was renamed
to `c03.eq.ketbra` (it collided with the existing `c03.eq.eins` of example c03.ex.eins, lint ID
duplicate). No section, unit or claim ID changed after the line. The auxiliary operator in the
proof of c03.prop.positiv and in the G-0072 (b) paragraph is now $\op{D}$ (was $\op{C}$, which is
the unitary of c03.ex.drei).

## 1. Section list (de.tex / en.tex, inserted before the Fundament blocks)

| ID | Title (de) | Depth | \tpcdef | Units, claims |
|---|---|---|---|---|
| c03.s8 | Operatoren | Kern | D87 | c03.ex.matrix (c03.cl.matrix, eq c03.eq.matrix) |
| c03.s8.1 | Einsoperator, Nulloperator und der Hut | Kern | D88 | merksatz Notation (CONV-HAT with TJO's revised exceptions) |
| c03.s9 | Der adjungierte Operator | Kern | D17 | c03.prop.adjungiert (c03.cl.adjungiert), c03.eq.adj-matrix (c03.cl.adj-matrix), c03.prop.adj-regeln (c03.cl.adj-regeln) |
| c03.s10 | Klassen von Operatoren | Kern | D18, D20, D89, D90, D91, D92 | c03.eq.rollen (c03.cl.rollen, source-backed), c03.prop.positiv (c03.cl.positiv), c03.prop.isometrie (c03.cl.isometrie) |
| c03.v5 | Beschränkte und unbeschränkte Operatoren | Vertiefung (in c03.s10) | none (cites D19) | c03.eq.beschraenkt (c03.cl.beschraenkt), c03.ex.unbeschraenkt (c03.cl.unbeschraenkt), c03.thm.hellinger-toeplitz (c03.cl.hellinger-toeplitz, source-quoted, proof-omitted), c03.eq.symmetrisch (c03.cl.symmetrisch, source-quoted), c03.prop.symmetrisch (c03.cl.ganz) |
| c03.v6 | Isometrisch, aber nicht unitär | Vertiefung (in c03.s10) | none | c03.ex.shift (c03.cl.shift) |
| c03.s11 | Matrixelemente und Ket-Bras | Kern | D93 | c03.eq.wirkung (c03.cl.wirkung), c03.eq.adj-elemente (c03.cl.adj-elemente) |
| c03.s11.1 | Kets und Bras als Operatoren | Kern | D94 | c03.eq.ket-op, c03.eq.bra-op (c03.cl.bra-op), c03.prop.ketbra (c03.cl.ketbra, eq c03.eq.ketbra) |
| c03.s12 | Drei Operatoren auf C^3 | Kern | none | c03.ex.drei (c03.cl.drei), c03.exc.ketbra (c03.cl.c-ketbra), c03.eq.orte (c03.cl.orte), c03.eq.spektren (c03.cl.spektren), figure c03.fig.spektren |

H3.1: Kern sentence in c03.s10 ("Für die Operatoren des Kerns ... dasselbe"), proof in
c03.prop.symmetrisch (Vertiefung c03.v5), authority Reed-Simon I pp. 84, 187, 249, 255, 256
(P-0319..P-0326). H3.2: no sentence calls a vector a state; vl04:5 / vl03:254 dropped.
G-0072 (a): c03.s4 after c03.ex.kets, `% Stimme: v03 [49:20]-[49:46]`. G-0072 (b): c03.s5
sentence rewritten (Gedanke des Beweises, eq c03.eq.schwarz-beweis, pointer to c03.s10); picked
up in c03.s10 after c03.prop.positiv with (Â + iλB̂)†(Â + iλB̂) and D̂†D̂, backed by P-0330
(v0.1 Vorlesungen9.tex:21 = vl09.tex:25). Second-review GERMAN fix in c03.s7 applied (DE only).
Hats: every operator in c03 carries \op; \Id bare; no states or Pauli matrices occur in c03.
Figure c03.fig.spektren registered in chapter.json; no \demo (Wave 2).

## 2. vl04 item -> destination (for lane E's vl04 map)

Line numbers are those of latex/lectures/de/vl04.tex in the v0.2 snapshot
(sha256 e10cd13b...). "kept" = content migrated (possibly reworded); "dropped" with reason.

| vl04 line | kind | status | destination | note |
|---|---|---|---|---|
| 3 | section | kept | c03.s8 | "Vorlesung: Operatoren" becomes sections c03.s8-c03.s12 |
| 5 | text | kept (partly) / dropped (first clause) | c03.s8, c03.s8.1 | "Die Vektoren ... beschreiben die Zustände" dropped (H3.2); "die Operatoren seine Observablen" -> c03.eq.rollen; "zwei Operatoren, die trivial ... unentbehrlich" -> c03.s8.1 |
| 7-23 | definition env, text, equations 10, 14, pmatrix 15 | kept | D88 | identity operator, unit matrix (registry body) |
| 25-29 | text, equation 26 | kept | D88 | null operator \Nul |
| 29 (second half) | text | kept | c03.s8.1 | notation problem -> D88 body and c03.s8.1 paragraph |
| 31-33 | merksatz, text 32 | kept | c03.s8.1 merksatz; CONV-HAT | exceptions per D-HAT (identity, states, Pauli) |
| 35-38 | text, equation 36 | kept | D17 | adjoint definition |
| 39 | text | kept | c03.s9, c03.prop.adjungiert, c03.eq.adj-matrix | "tatsächlich eine Definition" -> existence and uniqueness proof; matrix form scoped to the inner product of c03.s2 |
| 40-52 | equation, pmatrix 41, 46 | kept | c03.eq.adj-matrix | display kept (A† written as matrix†) |
| 54-58 | text, align 55 | kept | D17 (rules), c03.prop.adj-regeln (proof, eq c03.eq.adj-regeln) | |
| 60-68 | text, enumerate 61, items 62-67 | kept | D18, D20, D89, D90, D91, D92 | |
| 69 | text | kept | c03.eq.rollen (roles), c03.prop.isometrie (normal superclass; isometries normal only in finite dimension), c03.v6 | P-0329 quotes it |
| 70 | text | kept with correction | c03.s10 H3.1 paragraph, D18, c03.v5, c03.prop.positiv part 1 | "Synonym: selbstadjungiert" only for everywhere-defined operators (M-0005) |
| 71-73 | equation, text | kept | D18 body, c03.prop.positiv part 1 | |
| 74-77 | text, equation 75 | kept | D20, c03.prop.positiv parts 2, 3 | |
| 78 | text | kept | D20 body ("nicht negativ") | |
| 79 | text | kept | c03.prop.positiv part 4, c03.prop.isometrie part 1, D89, D90 | |
| 81-84 | text, equation 82 | kept | D93 | |
| 85-88 | text, equation 86 (eq:completenessA) | kept | c03.eq.wirkung, D93 | derivation from v05 [02:45]-[09:36] |
| 89 | text | kept, softened | c03.s11 paragraph after c03.eq.wirkung | "trägt auch im unendlich-dimensionalen Fall" -> sums become series whose convergence must be checked |
| 90-94 | text, equation 91 | kept | c03.eq.adj-elemente, D17 | |
| 96-100 | text, equation 97 | kept | c03.s11.1, c03.eq.ket-op | vector written bold \vb{\Psi} (bare Ψ would be a number by the merksatz) |
| 100-107 | text, equations 101, 105 | kept | c03.eq.bra-op | |
| 108-112 | text, equation 109 | kept | c03.s11.1 (unlabelled display) | |
| 114-122 | text, equations 116, 120 | kept with correction | D94 | line 121 defect, see section 3 |
| 124-129 | text, equation 126 | kept | c03.prop.ketbra, c03.eq.ketbra, paragraph after it | |
| 130-132 | equation 130 | kept | D93 body, last sentence of c03.s11.1 | |
| 134-204 | beispiel, text, equations 136, 153, 157, 175, 200, pmatrices | kept | c03.ex.drei (eq c03.eq.abc, c03.eq.nicht-positiv, c03.eq.c-unitaer, c03.eq.c-ketbra) | |
| 156 (second sentence) | text | dropped | (none) | "Modell für Messungen der Photonenzahl in Glasfasernetzwerken": no source on disk; new gap (section 4) |
| 205 | input figure | kept | c03.fig.spektren (content/c03-hilbertraum/figures/spektren.tex) | adapted to course conventions |
| 207 | text | kept | c03.s12 paragraph, c03.eq.orte, c03.eq.spektren, figure caption | eigenvalue informal (D-SPEKTREN); "für normale Operatoren" made precise: holds for each class without normality |

vl03 items deferred to Lecture 4 (vl03-map.json items 116-129, vl03.tex:253-277, M-0024):

| vl03 item | destination |
|---|---|
| section@253 | c03.s8 |
| text@254 | c03.s8 (first paragraph, without "Die Vektoren beschreiben die Zustände", H3.2) |
| text@256, equation@257, text@260, equation@261, text@264, equation@265, text@268 | D87 (M-0024 corrections "ein Hilbertraum", "Das heißt") |
| environment@270 (beispiel), text@271, equation@272, environment@273, text@277 | c03.ex.matrix, eq c03.eq.matrix (M-0024 "Operatoren", "dass die Dimension ... n = 2 beträgt") |

Spoken additions (v04 from 46:45, v05 to 51:57), each with `% Stimme:` in de.tex: v04 [46:54]-[48:01]
(why "Operator"), [50:08] (Abbildung mit diesen Eigenschaften), [54:21]-[54:57] (Tabelle,
Excel), [58:08]-[59:14] (Hut), [61:13]-[64:33] (Kreuz = transponieren + konjugieren),
[64:36]-[66:31], [69:11], [72:57]-[73:45] (roles), [74:27]-[76:31], [75:09] (sehr hilfreich),
[77:45]-[81:55] (nirgends eine Matrix), [88:51] (getrennt summiert); v05 [02:45]-[09:36]
(two routes, Zahlen vertauschen mit Operatoren), [10:15]-[11:30] (Operator bekannt), [11:35]-[25:40]
(Ket frisst Zahl, Bra frisst Vektor, Hauptnachricht), [26:42]-[31:00], [31:30]-[39:07]
(hilfreichste Gleichung, Eins gleich Eins), [39:54]-[49:13] (C in Ket-Bra form; Matrizen oder
Ket-Bras), [49:40]-[51:07] (exercise hint -> c03.exc.ketbra). Author additions: c03.prop.adjungiert,
c03.prop.positiv part 1 converse, c03.prop.isometrie part 2 proof, weighted-product adjoint in
c03.s9, c03.eq.orte proof without normality, eigenvectors in c03.s12, Vertiefungen c03.v5, c03.v6.
Not adopted: v04 [59:45]-[60:00] (Hüte später weglassen; contradicts D-HAT); v04 [67:15]-[68:39]
2x2 example (entries not recoverable from ASR); v05 [28:33] handwriting remark; v04 [85:02]
photon remark.

## 3. vl04 defects for migration records (lane E)

| vl04 line | wrong | correct | evidence |
|---|---|---|---|
| 5 | "Die Vektoren des Hilbertraums beschreiben die Zustände eines Systems" | states are density operators (positive, trace 1); a vector gives a pure state only via its projector | H3.2 (BRIEF), D22; c03.s1 already says so |
| 8 | "Sei $\mathcal{H}$ einen Hilbertraum." | "Sei $\mathcal{H}$ ein Hilbertraum." | grammar (as M-0024 for vl03:256) |
| 13 | "endlich dimensional" | "endlichdimensional" | spelling |
| 39 | "Daher, im dem endlich-dimensionalen Fall wird die adjungierte Matrix wie folgt dargestellt" | "Daher wird im endlichdimensionalen Fall, mit dem Standardskalarprodukt, die adjungierte Matrix wie folgt dargestellt" | grammar; scope: c03.cl.adj-matrix (weighted product gives ((0,0),(1/c,0)), check_c03.py) |
| 70 | "(Synonym: selbstadjugierte Operatoren)" | typo "selbstadjungierte"; and only for everywhere-defined (in particular finite-dimensional) operators | M-0005; Reed-Simon I p. 255 (P-0322, P-0324); c03.cl.ganz |
| 81 | "$\{|\phi_x\}_{x\in X}$" | "$\{|\phi_x\rangle\}_{x\in X}$" | missing \rangle |
| 85 | "Wegen der Linearität von A ist dann" | "Wegen der Linearität von A und der Entwicklungsformel ist dann" | the formula inserts the expansion twice (vl04:89 itself; c03.cl.wirkung) |
| 89 | "genau deshalb trägt sie auch im unendlich-dimensionalen Fall" | overreach: in infinite dimension the sums are series whose convergence (and the operator's domain) must be checked | c03.v5, D16/D19 |
| 121 | "$|\Psi\rangle\langle \Phi|\chi\rangle = \langle\Phi|\chi\rangle |\Psi\rangle, \quad \forall \Psi\in \mathcal{H}$" | quantifier over $\chi$: "$\forall \chi \in \mathcal{H}$"; write the left side $(|\Psi\rangle\langle\Phi|)|\chi\rangle$ (lane G: bra-ket bracket missing) | D94 body; found by lane G, confirmed by lane A |
| 156 | "Die Matrix $B$ is auch positiv, und bildet einen Projektor." | "Die Matrix $B$ ist auch positiv und ein Projektor." | typo "is"; comma |
| 156 | "dieser hier dient als Modell für Messungen der Photonenzahl in Glasfasernetzwerken" | no source on disk; dropped | COORDINATION rule 1; new gap |
| 174 | "Die Matrix $C$ stellt einen Unitärmatrix dar" | "Die Matrix $C$ ist unitär" | grammar (einen/eine) |
| 199 | "können wir $A$ wie folgt darstellen:" | "können wir $C$ wie folgt darstellen:" | the display is C (vl04:201); check_c03.py "C = |0><1| + i|1><2| - |2><0|" |
| 207 | "für normale Operatoren überträgt sich die definierende Gleichung wörtlich auf jeden Eigenwert" | MINOR: holds for every operator of the class, normality not needed; normality matters only for the converse (spectral theorem) | c03.cl.orte derivation |

English lec04.tex: not checked line by line by lane A (lane S owns it); the German lines above are
the loci.

## 4. New gaps for TJO

- G-new-1 (vl04:156, v04 [85:02]): the projector B as "Modell für Messungen der Photonenzahl in
  Glasfasernetzwerken": no source on disk; left out of c03.ex.drei (compare G-0033 (e), photon in
  a fibre).
- G-new-2 (c03.eq.rollen): the roles display keeps the script's "hermitesch -> Observablen" and
  "positiv -> Zustände" (with "mit einer Normierung, Kapitel 4" added after D22). Whether C4,
  which works with effects/POVMs and sharp observables (D24, D25), wants "Observablen" here or
  "scharfe Observablen" is TJO's call.
- G-new-3 (merksatz in c03.s8.1): the wording of the hat exceptions (identity; states and Pauli
  matrices "die erst später vorkommen") is the author's, after TJO's revised D-HAT.
- G-new-4: c03.prop.isometrie part 2 and "weitere gibt es nicht" in c03.s12 rely on linear algebra
  (rank-nullity theorem; eigenvalue => det(A - λ) = 0) as a prerequisite, not derived in the repo
  and with no source on disk. TJO: acceptable as a stated prerequisite from linear algebra?
- G-0072 (a), (b): applied; the gap can close when a review confirms the text.

## 5. Requests to other lanes

- Lane E: (1) build vl04-map.json from section 2 and migration records from section 3; (2) an
  independent page-image review receipt for P-0318 to P-0328 (Reed-Simon I djvu page_index 18,
  98, 199, 209, 261, 267, 268; I read every one from the rendered image, ddjvu -scale=150;
  until then check_evidence fails [review] on these 11 rows); (3) refresh the private-check
  receipt after (2) (public mode is stale on claims.json, provenance.json, DERIVATION.md);
  (4) gap rows for section 4; G-0072 note that (a), (b) are applied.
- Lane G: none required. FYI the chapter uses \op{M} (multiplication by j on l^2), \op{S} (right
  shift), \op{T} (generic, Reed-Simon), \op{D} (auxiliary) without registry symbols; the registry
  gate passes.
- Lane S (script ch4 condensed from this Kern): the H3.1 sentence, the H3.2 drop and the vl04:199
  A->C fix apply to vl04.tex too.
- Coordinator: P-0329 quotes vl04.tex via the v0.2 snapshot member; if lane S rewrites vl04.tex,
  the [quote] check reads the historical member, so the row should stay valid; please confirm in
  the full run.

## 6. Repair wave after evidence/derivations/c03/REVIEW-lec4.md, section B (2026-10-29)

| Finding | Repair (de and en in parity) |
|---|---|
| WRONG de 1319/1354 (no matrices in infinite dimension) | c03.s8: "keine endliche Matrix mehr"; the infinite-table analogy qualified by chosen basis, convergence of series and restricted domains (pointer to c03.s11 and Chapter 5) |
| SCOPE D17 | body now opens with "Sei H ein endlichdimensionaler Hilbertraum"; existence, uniqueness, matrix form and rules stated for that case; the infinite-dimensional case described separately (domains, D19); registry regenerated |
| SCOPE de 1533 and D18 | Kern sentence in c03.s10 keeps the synonym for finite dimension only and points to c03.v5 for operators defined on part of the space; D18 body is finite-dimensional with the synonym and no D16/D19 terminology; c03.v5 now says "In diesem Sprachgebrauch heißt hermitesch also dasselbe wie symmetrisch", weaker than self-adjoint, and that the difference comes from the restricted domain (c03.prop.symmetrisch) |
| SCOPE de 1577 | "Dass unbeschränkte symmetrische Operatoren nicht auf dem ganzen Raum definiert sein können"; c03.v5 wozu likewise |
| SCOPE de 1603 | "Unter den symmetrischen Operatoren gilt der Spektralsatz nur für die selbstadjungierten"; the generator statement kept (one-parameter unitary groups); claim c03.cl.symmetrisch statement updated |
| SCOPE de 1776/1779 | c03.s11: matrix elements determine the operator in finite dimension; in infinite dimension only under hypotheses (bounded, everywhere defined), with a zoomref to c03.v5; new paragraph in c03.v5 with c03.eq.elemente-unendlich (claim c03.cl.elemente-unendlich, derived, DERIVATION.md and check_c03.py) and the counterexample M on finitely supported sequences versus its maximal domain |
| UNSUPPORTED de 1695/2018 | text unchanged; recorded as a question for TJO (section 4, G-new-4: rank-nullity in c03.prop.isometrie part 2; determinant criterion for "weitere gibt es nicht" in c03.s12). TJO question: may these two linear-algebra facts be used as stated prerequisites, or must the chapter prove them / cite a source? |

TJO answered finding 7 (2026-10-29): standard linear algebra is accepted as a declared
prerequisite (rank-nullity; eigenvalues are the roots of det(Â − λ𝕀)). Recorded as prerequisite
notes in DERIVATION.md at c03.cl.isometrie and c03.cl.spektren and in the notes of both claim
rows; the claims stay `derived`; no proofs added. G-new-4 is answered.

Additions for lane S (2026-10-29): (a) c03.eq.rollen now reads "Projektor: Ja-Nein-Messungen
(Ereignis oder kein Ereignis)" / "yes-no measurements (event or no event)" (vl04:69, P-0329);
the following sentence "Ein Projektor beschreibt also eine Ja-Nein-Frage" was removed as
redundant; claim c03.cl.rollen statement updated. (b) Operator product in c03.s9 before the rules:
"Das Produkt ÂB̂ ist die Hintereinanderausführung: erst B̂, dann Â ... im Allgemeinen ist
ÂB̂ ≠ B̂Â", with display c03.eq.produkt and derived claim c03.cl.produkt. The sentence "In
unendlich vielen Dimensionen sind es verschiedene Begriffe" is no longer in c03 (removed in the
repair of finding 3; lane S probably read the frozen copy).
