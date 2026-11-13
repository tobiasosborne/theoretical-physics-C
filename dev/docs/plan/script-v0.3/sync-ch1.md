# sync-ch1: script chapter 1 (vl01 / lec01) -> new course

One row per item of the new `latex/lectures/de/vl01.tex` (German leads; `lec01.tex` is its
paragraph-for-paragraph translation and maps to the same sources in `content/c00-theorie/en.tex`
and `content/c01-wahrscheinlichkeit/en.tex`). "c00:N" / "c01:N" means line N of
`content/c00-theorie/de.tex` / `content/c01-wahrscheinlichkeit/de.tex` as of 2026-10-22.
"v0.2:N" means line N of the v0.2 `vl01.tex` (sha256 8f4516eb..., the file the migration map
`evidence/migrations/maps/vl01-map.json` was written against). Numbered displays are
(1) to (12) as they render; the three displays of the history list are unnumbered, as in v0.2.

Every statement below is made in the Kern of C0 or C1, except where the row says "Vertiefung
c00.v2": those are the corrected names and years, which v0.2 already printed and the new course
keeps (corrected, M-0050) in its Vertiefung table c00.tab.jahre.

| # | new item (vl01.tex line) | kind | source in the new course | v0.2 | migration record |
|---|---|---|---|---|---|
| 1 | `\section{Vorlesung: Die Geburt der Quantenmechanik}` (4) | section | title of v0.2 with the grammar fixed; content = c00.s4 + c00.s1-s3 + c01 | v0.2:25 | M-0012 |
| 2 | "Quanten-Universum ... bis 1900 nicht bemerkt ... klassische Physik sehr gute Annäherung ... erklärungsbedürftig ... Güte der klassischen Näherung ... Dekohärenz, fortgeschrittene QM" (5) | paragraph | c00 opening, c00:33-44 (provenance of c00.cl.annahme) | v0.2:26 | |
| 3 | "Bemerkung zur Methode ... nicht mein Stil ... Bohrsches Atommodell nirgends" (7) | paragraph | c00 opening, c00:57-61 | v0.2:33 | |
| 4 | "Dieses Skript enthält nur den Kern; Herleitungen, Vertiefungen ... im Webkurs" (7) | sentence | not a physics claim: the one pointer to the web course allowed by BRIEF.md ("at most one sentence") | | |
| 5 | `\subsection{Warum eine neue Theorie nötig war}` (9) | subsection | c00.s4 | v0.2:32 ("Vorgeschichte") | |
| 6 | "Die Vorgeschichte ... Reihe von Beobachtungen ... in Frage stellten" (10) | paragraph | c00.s4, c00:79-80 | v0.2:35 | |
| 7 | item 1 heading "(Planck, 1900)" (12) | year | Vertiefung c00.v2, table c00.tab.jahre (c00:365), claim c00.cl.geschichte | v0.2:41 "(1899)" | M-0050 |
| 8 | "Ein Schwarzkörper reflektiert keine einfallende Strahlung, strahlt ... dennoch" (12) | sentence | c00.s4.1, c00:89-90 | v0.2:47 | |
| 9 | "Spektrum ... mit klassischer Physik nicht erklärbar ... Lichtquanten der Energie E = h nu" (12) | sentence (inline equation) | c00.s4.1, c00:122-127; claim c00.cl.lichtquant | v0.2:37 | M-0012 ("das richtige Spektrum") |
| 10 | "Planck ... Konstante h ursprünglich als ,,Hilfsgröße`` postuliert, um das Strahlungsgesetz herzuleiten" (12) | sentence | c00.s4.1, c00:128-129 | v0.2:37 | M-0012 ("Die Konstante") |
| 11 | display: `u(nu,T) d nu = 8 pi h nu^3/c^3 d nu/(e^{h nu/(k_B T)} - 1)` (14) | display (unnumbered) | c00.eq.planck, claim c00.cl.planck | v0.2 eq@38 (U(nu), k) | |
| 12 | "Energie pro Volumen im Frequenzintervall d nu, c, k_B ... im statistischen Teil selbst her" (16) | sentence | c00.s4.1, c00:129-138 | v0.2:37, 47 | |
| 13 | display (eqbox): `hbar = h/(2 pi)` with "vorwiegend die reduzierte Planck-Konstante" (16-18) | display (unnumbered) | c00.eq.hbar, claim c00.cl.hbar; sentence c00:142-143 | v0.2 eq@42, v0.2:41 | |
| 14 | item 2 heading "(Lenard; Einstein ab 1905)" (20) | names, year | Vertiefung c00.v2, table c00.tab.jahre (c00:366) | v0.2:55 "(Lenard, 1899; Einstein 1905)" | M-0050 |
| 15 | "Licht kann Elektronen auslösen. Bei festem Material ... maximale kinetische Energie ... Frequenz, nicht Intensität ... klassisch merkwürdig" (20) | paragraph | c00.s4.2, c00:245-249 | v0.2:55, 59 | M-0051 |
| 16 | "Gibt ein Lichtquant seine Energie an ein einzelnes Elektron ab" (20) | sentence | c00.s4.2, c00:249 ("Einphotonenmodell"), c00:260-261 | | M-0051 |
| 17 | display: `E_kin,max = 1/2 m_e v_max^2 = h nu - W` (22) | display (unnumbered) | c00.eq.photoeffekt, claim c00.cl.photoeffekt | v0.2 eq@56 (E_el, m, eqbox) | M-0051 |
| 18 | "Bindungsenergie W des Materials (nichtrelativistisch geschrieben)" (24) | sentence | c00.s4.2, c00:253-257 | v0.2:59 | M-0051 |
| 19 | "Unterhalb der Frequenz W/h löst in diesem Modell ein einzelnes Lichtquant kein Elektron aus" (24) | sentence | c00.eq.schwelle, claim c00.cl.schwelle, c00:270-272. Repair wave: the label "Schwellenfrequenz" is dropped (definition inventory, NOTES-ch1), the claim is unchanged | | |
| 20 | item 3: Liénard-Wiechert, Elektron müsste in den Kern stürzen; Linienspektren und Franck-Hertz deuten auf diskrete Energieniveaus (25) | list item | c00.s4.3 item 1, c00:297-305 (without "kontinuierlich über alle Frequenzen", dropped after REVIEW-smoke-A) | v0.2:60 | |
| 21 | "Franck-Hertz-Versuch (1914)" (25) | year | Vertiefung c00.v2, table c00.tab.jahre (c00:367) | v0.2:60 "(~1911)" | M-0050 |
| 22 | item 4 Compton: how energy and momentum are shared, light quanta h nu, p = h/lambda, conservation laws (26) | list item | c00.s4.3 item 2, c00:306-310; claim c00.cl.impuls (inline here, display in c00) | v0.2:61 | |
| 23 | item 5 Stern-Gerlach "(1922)", silver beam, two beams, fixed quantum number, finitely many values of the component, qubits (27) | list item | c00.s4.3 item 3, c00:311-317; year: table c00.tab.jahre (c00:368) | v0.2:62 | M-0051 |
| 24 | item 6 electron diffraction "(Davisson und Germer, 1927)", "Hinweis auf Welleneigenschaften", "de Broglie 1924 postuliert" (28) | list item | c00.s4.3 item 4, c00:318-319; years: table c00.tab.jahre (c00:369-370) | v0.2:63 "(1929)" | M-0050 |
| 25 | "Ich fasse die Befunde in zwei Sätzen zusammen." (30) | sentence | c00.s4.4, c00:409 | | |
| 26 | merksatz "Materie und Strahlung besitzen sowohl Wellen- als auch Teilcheneigenschaften." (32-34) | box | c00.eq.welle-teilchen, claim c00.cl.welle-teilchen | v0.2 box@66 | |
| 27 | merksatz "Die wichtigste Aussage über die QM": QM probabilistisch, Vorhersagen nur als Wahrscheinlichkeiten (36-38) | box | c00.eq.kernsatz, claim c00.cl.kernsatz; title from merksatz c00:434 | v0.2 box@79 | |
| 28 | "zweite Aussage übergeordnet ... schwammig ... präzise ... klassisch definitiv ... fehlende Information ... keine fundamentalen Wahrscheinlichkeiten" (40) | paragraph | c00.s4.4, c00:425-430 | v0.2:83 | M-0010 (realised as in c00/c01: the point-weight special case is row 61) |
| 29 | "Die statistische Deutung hat Born 1926 geliefert ... wichtigster Aspekt" (40) | sentence | c00.s4.4, c00:431-432 (Born); year: Vertiefung c00.v2, c00:381-383 | v0.2:72 | M-0051 (history of 1925/26 otherwise not carried) |
| 30 | "Nehmen Sie den Satz bitte mit: In jeder mündlichen Prüfung ..." (40) | sentence | merksatz c00:434-438 | v0.2:83 | |
| 31 | "Interpretation ... umstritten; einen Widerspruch ... gibt es nicht. Unsere Annahme ... korrekte Beschreibung des Universums" (42) | paragraph | c00.s4.4, c00:440-450; claim c00.cl.annahme | v0.2:87, 89 | |
| 32 | `\subsection{Was eine physikalische Theorie liefert}` (44) | subsection | chapter c00 title; sections c00.s1-s3 | | |
| 33 | "Grundsatz für jede physikalische Theorie: probabilistische Theorien ... Vorhersagen in Form von Wahrscheinlichkeiten" (45) | sentence | c00.s1, c00.eq.p0, claim c00.cl.p0 (author-stipulated); lead-in c00:459-460 | | |
| 34 | "Deterministische Theorien fasse ich als Teilmenge der probabilistischen auf" (45) | sentence | c00.eq.probabilistisch, claim c00.cl.probabilistisch | | |
| 35 | "Eine physikalische Theorie liefert Daten für Präparationen, Dynamik und Messung" (45) | sentence | c00.eq.liefert, claim c00.cl.liefert. Not identified with the three stages (REVIEW-lec1 SCOPE) | | |
| 36 | greybox "Jedes Experiment in drei Schritten": alle Experimente gleich; präpariert (Würfel, Lichtstrahl), durchgeführt, gemessen, ein Ergebnis (47-48) | box | c00.s2, c00.eq.drei-stadien, claim c00.cl.drei-stadien; enumerate c00:505-512 | v0.2 greybox@119 | |
| 37 | `\input{figures/fig_vl01_experiment}` (49) | figure | c00.fig.experiment (content/c00-theorie/figures/experiment.tex), redrawn in tpc-style colours; same content | replaces v0.2 figure@49 (fig_vl01_planck) | |
| 38 | "ersten beiden Schritte ... eine kompliziertere Präparation ... gezinkter Würfel ... Grenze Geschmackssache ... Präparation und Messung" (50) | paragraph | c00.s2, c00:524-528 | v0.2:126 | |
| 39 | "Reihenfolge ... vom Mikroskopischen zum Makroskopischen, QM einzelner Systeme, viele Teilchen, statistische Mechanik, Thermodynamik" (53) | sentence | c00.s3, c00.eq.leiter, claim c00.cl.leiter; stage names from c00.fig.leiter (a selection: GPT and Fock stages not named) | replaces v0.2:6-21 (topic list), as the map says | |
| 40 | "Auf jeder Stufe ... effektive Theorie der darunterliegenden ... Näherung" (53) | sentence | c00.eq.effektiv, claim c00.cl.effektiv | | |
| 41 | `\subsection{Wahrscheinlichkeit für Physiker}` (55) | subsection | chapter c01 | v0.2:93 ("Wahrscheinlichkeit") | |
| 42 | "Zahlen ... Wahrscheinlichkeiten ... nichts konzeptionell Neues ... Notation" (56) | paragraph | c01 opening, c01:29-34 | v0.2:94 | |
| 43 | "Sprache der Physik: Wahrscheinlichkeitsverteilung = Präparation (Zustand), Zufallsvariable = Messung" (56) | sentence | c01.eq.sprache, claim c01.cl.sprache; c01:48-49 | | |
| 44 | `\subsubsection{Ergebnisse und Präparationen}` (58) | subsubsection | c01.s1 | v0.2:97 | |
| 45 | "drei Dinge: Ergebnismenge, Präparation, Messung" (59) | sentence | c01 opening, c01:54-56 | | |
| 46 | "Ergebnismenge X (Stichprobenraum) ... alle möglichen Ergebnisse auflistet ... Teilmengen heißen Ereignisse" (59) | inline definition | D53 (transcluded c01:66); c01:63-64 | v0.2:98, 149-150 | |
| 47 | "Präparation ... Wahrscheinlichkeit p(x) für jedes Ergebnis ... ein Gewicht mit" (59) | inline definition | D54; c01:101-111 ("Gewicht") | v0.2:108 | |
| 48 | (1) `p(x) >= 0 und sum p(x) = 1` (61) | display | D54 body | v0.2 eq@115 | |
| 49 | "Wahrscheinlichkeit eines Ereignisses P[S] = sum_{x in S} p(x)" (63) | inline definition | D54 body | v0.2:154 | |
| 50 | Beispiel 1.1 (Würfel: X, event "gerade", fair p = 1/6, P[S] = 1/2) (65-67) | example | c01.ex.wuerfel (c01:70-77) and the fair part of c01.ex.gezinkt, claim c01.cl.gezinkt (c01:114, 122-123) | v0.2 beispiel@100, beispiel@110 | |
| 51 | Übung 1.1 (zwei Würfel; Anzahl der Elemente) (69-71) | exercise | c01.exc.zwei-wuerfel, claim c01.cl.zwei-wuerfel | v0.2 übung@104 | |
| 52 | (2) additivity for pairwise disjoint events (75) | display | c01.eq.additiv, proposition c01.prop.wahrscheinlichkeit part 2, claim c01.cl.wahrscheinlichkeit | v0.2 eq@159 | |
| 53 | "Disjunktheit wesentlich ... doppelt ... Maß, Wahrscheinlichkeitsmaß ... mehr Maßtheorie nicht" (77) | paragraph | c01.s1, c01:164-169 | v0.2:162 | |
| 54 | `\subsubsection{Messungen und Erwartungswert}` (79) | subsubsection | c01.s2 | | |
| 55 | "Messung (Observable, Zufallsvariable) ist eine Funktion f: X -> R ... Messwert, wenn sicher x vorliegt ... großzügig ... an die Präparation zwei" (80) | inline definition | D55 (transcluded c01:205); c01:209-213 | v0.2 eq@130, v0.2:133, 137 | |
| 56 | (3) eqbox `E[f] = sum p(x) f(x)` (82) | display | D55 body | v0.2 eq@138 | |
| 57 | "linear ... E[c] = c" (84) | sentence | proposition c01.prop.erwartung parts 1-2, claim c01.cl.erwartung | | |
| 58 | "Woher kommt die Formel? ... relative Häufigkeit h_N(x) = N(x)/N ... selbst ein Gewicht" (86) | paragraph | c01.s2.1, c01:245-258; claim c01.cl.haeufigkeit | v0.2:137 | M-0009 |
| 59 | (4) `(1/N) sum f(x_i) = sum h_N(x) f(x)` (88) | display | c01.eq.stichprobenmittel, claim c01.cl.stichprobenmittel | | M-0009 |
| 60 | "Bei vielen unabhängigen Wiederholungen ... nahe bei p(x) ... Deutung ... einzelne Messreihe kann abweichen" (90) | paragraph | c01.eq.lesart, claim c01.cl.lesart; c01:269-281 | v0.2:137 | M-0009 |
| 61 | `\subsubsection{Ja-Nein-Messungen}` (92) | subsubsection | c01.s2.3 | | |
| 62 | "wichtigsten Messungen ... 0 und 1 ... Detektoren ... Klick ... an diesen hängt die QM ... durch S bestimmt" (93) | paragraph | c01.s2.3, c01:329-334 | v0.2:142 | |
| 63 | (5) `chi_S(x) = 1 (x in S), 0 sonst` (95) | display | c01.eq.indikator-def, claim c01.cl.indikator-def | v0.2 eq@143 | |
| 64 | "Indikatorfunktion ... Halten Sie fest: Indikatorfunktionen sind Messungen" (97) | sentence | c01:342-344 | v0.2:149-150 | |
| 65 | (6) `E[chi_S] = sum p chi_S = sum_{x in S} p = P[S]` (99), label eq:indicatorfunction | display | c01.eq.indikator, claim c01.cl.indikator | v0.2 eq@153 | |
| 66 | "Wahrscheinlichkeiten besondere Erwartungswerte ... P legt alle Erwartungswerte fest, p(x) = P[{x}]" (101) | paragraph | c01:364-367 | v0.2:164-168 (display eq@165 becomes this sentence) | |
| 67 | Übung 1.2 (X = {1,2,3}, p = 1/3, P[{1,2}], E[x^2]) (103-105) | exercise | c01.exc.drei, claim c01.cl.drei | v0.2 übung@169 (its display "E[x^2] = ?" dropped) | |
| 68 | `\subsubsection{Varianz und Determinismus}` (107) | subsubsection | c01.s3 | | |
| 69 | "Erwartungswert sagt, wo ... Varianz, wie weit sie streuen" (108) | sentence | c01.s3, c01:496-497; D56 | | |
| 70 | (7) `Var[f] = E[(f - E f)^2] = E[f^2] - E[f]^2` (110) | display | D56 body; proposition c01.prop.varianz part 1, claim c01.cl.varianz | v0.2 eq@211 (stated there for P on R) | |
| 71 | "zweite Form aus der Linearität ... Summe von Zahlen >= 0 ... Var = 0 genau dann, wenn f(x) = E[f] für alle x mit p(x) > 0" (112) | paragraph | proposition c01.prop.varianz parts 2-3 and proof, c01:523-525 | v0.2:214 | M-0011 |
| 72 | "In der QM große Rolle ... Unschärferelation" (112) | sentence | c01.s3, c01:497-498 | v0.2:216 | |
| 73 | Beispiel 1.2 (fair die: E = 7/2, not a possible value; E[f^2] = 91/6; Var = 35/12) (114-116) | example | c01.ex.augenzahl, claim c01.cl.augenzahl (c01:216-226); c01.ex.wuerfel-varianz, claim c01.cl.wuerfel-varianz (c01:532-537) | v0.2 beispiel@134 | |
| 74 | (8) `Var[chi_S] = P[S](1 - P[S])` with `chi_S^2 = chi_S` (118-120) | display | c01.eq.var-indikator, claim c01.cl.var-indikator; chi_S^2 = chi_S from c01.eq.indikator-regeln | | |
| 75 | "verschwindet genau dann, wenn die Antwort feststeht" (122) | sentence | c01.fig.varianz caption (c), c01:575-577; c01.ex.muenze, c01:557-558 | | |
| 76 | "Ist p(a) = 1 für ein Ergebnis a, so ist E[f] = f(a) für jede Messung" (122) | sentence | c01:590-592 (the point weight "auf einen Punkt konzentriert", E[f] = f(a)); claim c01.cl.punktgewicht-def. Repair wave: the term "Punktgewicht" and the symbol p_a are no longer introduced (definition inventory, NOTES-ch1); on a finite set, p(a) = 1 is the same condition | | |
| 77 | merksatz "Determinismus ist ein Sonderfall": p(a) = 1 for an outcome a <=> all probabilities 0 or 1 <=> all variances 0; "Solche Präparationen nennen wir deterministisch"; definite classical predictions fit (124-126) | box | proposition c01.prop.punktgewicht parts 1-3 (part 1 "p ist ein Punktgewicht" written as p(a) = 1), claim c01.cl.punktgewicht; c01:654-658 | v0.2:83, 214 | M-0010, M-0011 |
| 78 | `\subsubsection{Kontinuierliche Ergebnisse}` (128) | subsubsection | c01.s4 | | |
| 79 | "X = R entscheidend ... Teilchen in einer Dimension ... nur Präparationen mit Wahrscheinlichkeitsdichte" (129) | paragraph | c01.s4, c01:876-885 | v0.2:176 | |
| 80 | (9) density block: `p >= 0, int p = 1, P[[a,b]] = int_a^b p, E[f] = int p f` (130-135), label eq:ctsprob | display | c01.eq.dichte, claim c01.cl.dichte; its two qualifications (a <= b; integrability of f) are stated in the sentence after the display, row 81 | v0.2 eq@179, eq@184 (two displays become one) | |
| 81 | "Dabei ist a <= b, und den Erwartungswert verwenden wir nur, sofern int p(x) abs(f(x)) dx < infinity ist. Gegenüber dem endlichen Fall ist also nur die Summe durch ein Integral ersetzt ... int P(dx) f(x) ... mag ich nicht, nur erkennen" (136) | sentence | c01:894-901 (a <= b at c01:894-895, integrability at c01:895-897; repair wave, REVIEW.md finding 1) | v0.2:182, 187 | |
| 82 | "Wichtig: p(x) keine Wahrscheinlichkeit ... Flächen ... Punkt Wahrscheinlichkeit 0 ... p(x) > 1 erlaubt" (136) | sentence | merksatz "Eine Dichte ist keine Wahrscheinlichkeit", c01:903-907 | | |
| 83 | Beispiel 1.3 (Gauß) (138-144) | example | c01.ex.gauss, claim c01.cl.gauss | v0.2 beispiel@189 | |
| 84 | (10) `p(x) = e^{-x^2/2}/sqrt(2 pi)` (141) | display | c01.eq.gauss | v0.2 eq@191 | |
| 85 | "normiert ... links oder rechts ... symmetric => int_0^inf p = 1/2 ... nur für symmetrische Dichten" (143) | sentence | c01:938-950, c01.eq.gauss-halb (inline here) | v0.2 eq@195 (split integral, dropped), v0.2:202 | |
| 86 | "Erwartungswerte der Koordinatenfunktion und ihrer Potenzen heißen Momente, sofern int abs(x)^n p endlich" (146) | inline definition | c01:954-957 | v0.2:204 | |
| 87 | (11) `M_n = int x^n p(x) dx` (148) | display | c01.eq.momente, claim c01.cl.momente | v0.2 eq@205 | |
| 88 | "Nur M_0 = 1, die Normierung, existiert immer; M_1 heißt, sofern es existiert, Mittelwert. Existieren M_1 und M_2, so ist die Varianz ..." (150) | sentence | c01:962-964 (M_0 = 1, Mittelwert), c01:976 ("Die Momente außer M_0 müssen nicht existieren"), c01:971-972 (hypothesis of c01.eq.var-momente: int abs(x) p and int x^2 p finite, which by the definition in row 86 is exactly "M_1 and M_2 exist"); repair wave, REVIEW.md finding 2. c01.cl.kein-mittelwert is the example, not printed here | v0.2:208, 210 | |
| 89 | (12) `Var[P] = int (x - M_1)^2 p dx = M_2 - M_1^2` (152) | display | c01.eq.var-momente, claim c01.cl.var-momente; D56 (Var[P]); stated under the hypothesis of row 88 | v0.2 eq@211 | |
| 90 | "Mittelwert und Varianz tragen dann dieselbe Information wie M_1, M_2" (154) | sentence | c01:973-974, inside the hypothesis c01:971-972 ("dann"; repair wave, REVIEW.md finding 2) | v0.2:216 | |
| 91 | "Für die hier betrachteten Modelle steht damit die Sprache bereit: Präparationen Gewichte oder Dichten, Messungen Funktionen, zusammen bei endlichen Integralen Erwartungswerte" (154) | sentence | c01 closing, c01:1033-1036 ("für die Modelle dieses Kapitels", "bei endlichen Integralen"); repair wave, REVIEW.md finding 4 | | |

## Notation (registry rendering, plain LaTeX in the script)

The script does not load `registry/generated/tpc-notation.sty`, so the registry macros are
written out with their registered renderings: `\Outcomes` = X, `\pw` = p, `\Prob` = `\mathbb{P}`,
`\Ex` = `\mathbb{E}` (tpc-macros also has `\Ex`), `\Var` = `\operatorname{Var}`, `\ind{S}` =
`\chi_S`, `\hPlanck` = h, `\clight` = c, `\Temp` = T, `\massE` = `m_{\mathrm{e}}`, `\kB` = `k_B`
(tpc-macros), `\dd` = d (tpc-macros). v0.2's `U(\nu)` is the course's `u(\nu, T)` (COL-U).

## v0.2 items not in the new chapter 1

Organisation and topic list (v0.2:4-21), textbook remark (v0.2:23), cloud quantum computers and
semester promise (v0.2:28), transition (v0.2:30), Planck figure and its caption (v0.2:49-53),
history 1925-1927 except Born 1926 (v0.2:72, 85), the German-originals box (v0.2:74-76), "best
model we have" (v0.2:87), "nächstes Ziel" (v0.2:91), the display `f: X -> R` (v0.2 eq@130, now
inline), `E[f] = sum P[{x}] f(x)` (v0.2 eq@165, now inline), the exercise display `E[x^2] = ?`
(v0.2 eq@171), `E[f] = int P(dx) f(x)` (v0.2 eq@179, now inline), the split Gauss integral
(v0.2 eq@195). Reasons in NOTES-ch1.md.
