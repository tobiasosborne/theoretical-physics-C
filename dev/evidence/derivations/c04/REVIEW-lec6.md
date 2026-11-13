# Unabhängige Prüfung C4 / Vorlesung 6

Stand: 2026-11-04. Prüfer: Codex gpt-6.1-sol, mathematische Einzelprüfung.
Nur dieser Bericht wird geschrieben; kein Build, kein `ci.sh`, keine Änderungen an C3.
Geprüfte Leitfassung: `content/c04-quantentheorie/de.tex`, SHA-256
`2d00df453ea104cdf4c60139d059e57f056060ae985c31a3d211c6770a8e1154`.
Der alte Vorlesungstext wurde zusätzlich aus dem registrierten Snapshot
`90fe735d7ca7bf14dfdf0d056ec874e9bc265490:latex/lectures/de/vl06.tex` gelesen:
Die Arbeitskopie von `vl06.tex` wurde während der Prüfung parallel überarbeitet.

## A. Page images

Alle sechs `member_sha256` stimmen sowohl mit `sources/MANIFEST.sha256` als auch mit
dem unabhängig berechneten Datei-Hash überein:

- BR I PDF: `b81856071260df71a8ab80fe91edcbaabdf245d0e183ce19f3cb04027ef34ce7`.
- RS I DjVu: `a9eb38970c669d4c315cba20580bc996eb024623af036c6c6d51bab1fdba9e36`.

PDF-Seiten 63 und 90 wurden mit `pdftoppm` bei 110 dpi, DjVu-Seiten 89, 279 und 282
mit `ddjvu -format=pnm -scale=150` gerendert und als Bilder gelesen, nicht als
Textschicht. Abgleich: Zeichen und Formeln einschließlich Quantoren, Indizes und
Interpunktion; lediglich Satz-/Zeilenumbrüche und LaTeX-Darstellung normalisiert.

| Row | Bildindex → Druckseite | Transkription / Belegumfang | Verdict |
|---|---|---|---|
| P-0334 | BR 63 → 49 | Proposition 2.3.11 einschließlich des Quadrats in `ω(E_α²)` stimmt. Mit dem konstanten approximativen Einselement `E_α = I` folgt für beschränkte Funktionale Positivität genau aus `‖ω‖ = ω(I)`; positive Funktionale sind automatisch beschränkt. Trägt die Normierungsprosa in `de.tex:159` und den Positivitätsschritt von `c04.cl.singulaer`, `de.tex:188`. | CONFIRMED |
| P-0335 | BR 90 → 76 | Definition 2.4.20 stimmt: wachsende, nach oben beschränkte **Netze** positiver Operatoren, nicht nur Folgen. Trägt die Normalitätsdefinition in `de.tex:165` und `c04.cl.normal`. | CONFIRMED |
| P-0336 | BR 90 → 76 | Theorem 2.4.21, (1)–(3), stimmt. Ein normaler Zustand auf einer konkret auf H wirkenden von-Neumann-Algebra besitzt die angegebene Darstellung durch einen Dichteoperator auf H; für B(H) ist dies genau der behauptete Satz. Auch `de.tex:175` ist damit gedeckt. Keine unzulässige Behauptung, ρ müsse bei einer allgemeinen Unteralgebra selbst in dieser liegen. | CONFIRMED |
| P-0337 | RS 89 → 77 | Corollary 1 stimmt einschließlich beider Dualraumnormen. Verlangt keine Abgeschlossenheit von Y; erlaubt die in `c04.cl.singulaer` benötigte normgleiche Fortsetzung des komplex-linearen Funktionals. Trägt `de.tex:186`. | CONFIRMED |
| P-0338 | RS 279 → 265 | VIII.7, Einleitung und (a),(b), stimmen. Auf **demselben Bild** stehen auch (c),(d): starke Ableitung auf D(A), und umgekehrt Existenz dieser Ableitung nur auf D(A). Daher ist die Eindeutigkeitsbegründung in `de.tex:536` richtig, obwohl (c),(d) nicht im gespeicherten Zitat stehen. Der Absatz über der Aussage trägt die Warnung vor direkter Verwendung der Potenzreihe in `de.tex:525`. | CONFIRMED |
| P-0339 | RS 282 → 266 | VIII.8 stimmt einschließlich der Existenz eines selbstadjungierten A. Trägt die Umkehrung von `c04.cl.stone` und den Verweis in `de.tex:540`. Die nicht benachbarten Bildindizes sind richtig; Druckseite 266 ist tatsächlich Bild 282. | CONFIRMED |

Die Aussagen der Quellen bleiben innerhalb des angefragten Belegumfangs
`c04.cl.normal`, `c04.cl.singulaer`, `c04.cl.stone`. Keine Zitatkorrektur erforderlich.

## B. Mathematics

Alle 24 Ledger-IDs kommen genau einmal als Claim im deutschen Kapitel vor.
P0–P5 werden ausschließlich als Autorvorgaben geprüft, nicht als zu beweisende Sätze.
Ihre deutschen Fassungen sind inhaltlich treue Übersetzungen von
`docs/plan/BRIEF.md:50`; die folgenden fünf Zeilen liefern P1–P5.
Der Wechsel E → `\op{\EffOp}` = F ist die ausdrücklich erlaubte Notationsentscheidung,
keine inhaltliche Abweichung.

- **c04.cl.p0 — CONFIRMED.** `de.tex:66`: Vorhersagen als Wahrscheinlichkeiten ist treu übersetzt; keine zusätzliche mathematische Behauptung im Postulat.
- **c04.cl.p1 — CONFIRMED.** `de.tex:73`: System → Hilbertraum und die GPT-Klammer sind treu übersetzt. Der nicht wiederholte Sternverweis wird in `de.tex:87` durch die Ankündigung des Tensorprodukts inhaltlich aufgegriffen. `L²(R³)` ist dabei das Beispiel eines spinlosen Teilchens, nicht eines Teilchens mit zusätzlichen inneren Freiheitsgraden.
- **c04.cl.p2 — CONFIRMED.** `de.tex:94`: Positivität, Linearität, Normierung, Spurklassenfall und Extremalpunkte sind erhalten. Kern und Vertiefung unterscheiden tatsächlich zwischen allen Zuständen auf B(H) und den normalen Zuständen; kein falscher Rückschluss von der endlichen auf die unendliche Dimension.
- **c04.cl.p3 — CONFIRMED.** `de.tex:287`: Inhaltstreue Übersetzung. `de.tex:303` konkretisiert das verkürzte Wort „Dual“ als affine Funktionen mit Werten in [0,1], nicht als gesamten unbeschränkten Vektorraumdual. Die Proposition beweist die mathematische Darstellung, nicht experimentelle Realisierbarkeit; D12 bleibt eine physikalische Annahme.
- **c04.cl.p4 — CONFIRMED.** `de.tex:354`: Wahrscheinlichkeit des Ansprechens und Einschränkung auf einen als Dichteoperator gegebenen Zustand sind erhalten; D26 stimmt damit überein.
- **c04.cl.p5 — CONFIRMED.** `de.tex:461`: Inhaltstreue Übersetzung. Die zusätzliche Hamilton-Dynamik wird in `de.tex:548` ausdrücklich nicht aus P0–P4 abgeleitet. Die überbreite physikalische Rahmung muss dennoch korrigiert werden; siehe C.
- **c04.cl.funktionale — CONFIRMED.** `de.tex:114`, `DERIVATION.md:12`: Die vertauschten Matrixindizes sind richtig: `ρ_yx = ω(|x><y|)`. Die Spuridentität gilt für jeden komplexen Operator; positive quadratische Formen geben Positivität und Hermitizität von ρ, `ω(I)=1` gibt Spur eins, die Matrixeinheiten geben Eindeutigkeit. Die Rückrichtung benutzt eine zulässige positive Spektralzerlegung. Auch „Norm 1 = ω(I)=1“ ist richtig: Für positives ω gilt `‖ω‖=ω(I)`; der direkte endlichdimensionale Beweis steht in `DERIVATION.md:23`.
- **c04.cl.normal — CONFIRMED.** `de.tex:170`: Genau die durch P-0335/P-0336 belegte Äquivalenz. Die im Block eingeführte positive Spurklasse mit Spur eins ist der richtige Dichteoperatorbegriff; Normierung ist enthalten. Ein Beweis wird korrekt nicht versprochen.
- **c04.cl.singulaer — CONFIRMED.** `de.tex:179`, `DERIVATION.md:135`: `cI+F=c'I+F'` erzwingt `c=c'`, weil I nicht endlichen Rang hat; damit ist ω₀ wohldefiniert und komplex-linear. Ein normierter Vektor in ker F gibt `|c|≤‖cI+F‖`; I gibt die umgekehrte Normabschätzung und somit Norm eins. Normgleiche komplexe Hahn–Banach-Fortsetzung plus BR 2.3.11 gibt einen positiven normierten Zustand. Alle Rang-eins-Projektoren haben Wert null, während ein repräsentierender Dichteoperator deshalb Spur null hätte: korrekter Widerspruch. Durch Stetigkeit verschwindet ω sogar auf allen kompakten Operatoren. Kein Vektorzustand auf diesem H und keine endliche/abzählbare Wahrscheinlichkeitsmischung solcher Zustände; die Wortwahl zur Nichtkonstruktivität präzisieren, siehe C.
- **c04.cl.rein — CONFIRMED.** `de.tex:216`, `DERIVATION.md:27`: Beide Richtungen sind bewiesen. Bei mindestens zwei positiven Eigenwerten kann ein Summand von der normierten Restmischung getrennt werden; diese Zustände sind verschieden. In der Rückrichtung zwingt Positivität jedes ρᵢ auf den eindimensionalen Träger von ψ; Spur eins fixiert den Faktor. Phasenäquivalenz und Normierung sind richtig.
- **c04.cl.qubit-zustaende — CONFIRMED.** `de.tex:252`: Für hermitesche 2×2-Matrizen mit Spur eins ist Nichtnegativität beider Eigenwerte äquivalent zu nichtnegativer Determinante. Kugelzentrum `(p, Re x, Im x)=(1/2,0,0)`, Radius 1/2, Bloch-Vorzeichen `x=(r_x−i r_y)/2` und Rand = reine Zustände stimmen mit C2 überein.
- **c04.cl.eigenwerte — CONFIRMED.** `de.tex:273`: Charakteristisches Polynom, Wurzeln, Summe eins und Produktargument sind richtig; der Radikand ist `(p−1/2)²+|x|²≥0`.
- **c04.cl.effekte — CONFIRMED.** `de.tex:310`, `DERIVATION.md:59`: Teil 1 testet die beiden positiven quadratischen Formen richtig. In Teil 2 hat ein von null verschiedener positiver Operator positive Spur; Affinität beweist die Additivität von g auf dem positiven Kegel. `P−Q=P'−Q'` beweist Wahlunabhängigkeit, daraus folgt reelle Linearität auf hermiteschen Operatoren. Die eindeutige Zerlegung `A=A₁+iA₂` liefert eine komplex-lineare Fortsetzung. Reelle Werte auf hermiteschen Operatoren erzwingen über die nichtentartete Spurpaarung `F=F†`; Teil 1 gibt `0≤F≤I`. Eindeutigkeit folgt schon daraus, dass jede weitere Darstellung auf positiven Operatoren mit g übereinstimmen und damit dieselbe lineare Fortsetzung haben muss. Keine zusätzliche Stetigkeitsannahme nötig.
- **c04.cl.z-messung — CONFIRMED.** `de.tex:340`: Beide komplementären Rang-eins-Projektoren sind positiv und summieren sich zu I. Die mathematische Aussage stimmt; die Drehimpulsprosa siehe C.
- **c04.cl.born-rein — CONFIRMED.** `de.tex:366`: Zulässige rechteckige Zyklizität zwischen H und C, wie in `c03.prop.spur` Teil 3. Die innere Spur ist die Spur eines Operators auf C, also gerade der Skalar; keine illegale Multiplikation unpassender Matrizen.
- **c04.cl.born — CONFIRMED.** `de.tex:373`: Matrixprodukt und Wahrscheinlichkeit p sind richtig. Diagonaleinträge werden relativ zur jeweils gewählten ONB als Wahrscheinlichkeiten gelesen.
- **c04.cl.verteilung — CONFIRMED.** `de.tex:391`: Positivität folgt aus der Effektproposition, Normierung aus Linearität und der **endlichen** POVM-Summe I. Die Teilmengenoperatoren und Einbeziehung eines Fehlschlags sind konsistent mit D9/D24.
- **c04.cl.wirkungsgrad — ISSUE (MAJOR, Modellbeschreibung).** `de.tex:401`: Die Rechnung **für das gewählte** `F=q|0><0|` ist vollständig richtig: Eigenwerte q,0, Trefferwahrscheinlichkeit qp, kein Projektor bei `0<q<1`. Die vorausgehende Eigenschaft „meldet |0> mit Wahrscheinlichkeit q“ bestimmt F jedoch nicht: Auch `F=qI` hat diese Eigenschaft, meldet aber |1> ebenfalls mit q. **Korrektur:** Zusätzlich „ohne Fehlalarme: im Zustand |1> niemals ein Treffer“ annehmen oder schreiben: „Als Modell eines ineffizienten Z-Detektors wählen wir …“. Die Herleitung beweist die Rechnung, nicht die fehlende Modellannahme.
- **c04.cl.erwartung — CONFIRMED.** `de.tex:411`: Endliche Summe und reelle Ergebniswerte ergeben die Spurformel und Hermitizität. Der erste Moment wird nicht mit der ganzen allgemeinen POVM gleichgesetzt; die nachfolgende Einschränkung auf PVMs ist richtig.
- **c04.cl.pvm — CONFIRMED.** `de.tex:419`: Aus der Summe positiver Normquadrate folgt paarweise Orthogonalität ohne sie vorauszusetzen. Die beiden Inklusionen der Eigenräume und das Fehlen weiterer Eigenwerte folgen aus der vollständigen Projektorzerlegung. Die Umkehrung über Eigenraumprojektoren bzw. Indikatorfunktionen ist basisunabhängig. Kleine Nullvektor-Formulierung siehe C.
- **c04.cl.dynamik — CONFIRMED (Identität).** `de.tex:477`: Die angegebene Gleichheit ist Zyklizität der Spur; für hermitesches H ist das vorausgesetzte Uₜ in endlicher Dimension unitär. Die empirische Wahl dieser Zeitentwicklung ist nicht aus Zyklizität ableitbar und wird mathematisch auch nicht so bewiesen; die physikalische Geltungsbereichskorrektur steht in C.
- **c04.cl.dynamik-zulaessig — CONFIRMED.** `de.tex:492`: Positivität, Spur eins, Komplementpositivität, Affinität und Erhaltung der Rang-eins-Zustände sind bewiesen. Die inverse Abbildung ist Konjugation mit U†. Dies ist tatsächlich eine reversible Zustandssymmetrie, nicht bloß irgendein Kanal.
- **c04.cl.stone — CONFIRMED.** `de.tex:529`: Aussage und starke, nicht normstetige, Topologie stimmen mit RS VIII.7/VIII.8 überein. VIII.7(c),(d) bestimmen **sowohl** D(A) **als auch** `Aψ=(1/i) dU(t)ψ/dt|₀`; das ist eine korrekte Eindeutigkeitsbegründung für den Generator der gegebenen Gruppe. `A=−H/ℏ` hat das richtige Vorzeichen. Eine nur symmetrische echte Einschränkung ist nicht selbst dieser Generator; eine selbstadjungierte Fortsetzung/Abschließung wäre ein anderer Operator.
- **c04.cl.qubit-dynamik — CONFIRMED.** `de.tex:555`: Rabi-Formel und Kreisgleichung sind richtig, insbesondere das **Pluszeichen** `φ+2εt/ℏ`. In `(p, Im x)` dreht der Zustand für `ε,t>0` gegen den Uhrzeigersinn; in Bloch-Koordinaten ist `r_y=−2 Im x`, also kein Vorzeichenwiderspruch. Beide Pfeilbögen in `figures/messung.tex:36` und `figures/messung.tex:40` laufen in dieser Richtung. Für den gepunkteten Zustand ergeben `r=3/10, φ=70°` die gerundeten Werte `(0.6026,0.2819)`. Beide Diagramme, die Wertebereiche `[0,1]`, `[0.2,0.8]`, das konstante Signal 1/2, Kreisradius/Amplitude und die Zeitachse `εt/ℏ` stimmen mit der Bildunterschrift überein. Geometrie aus dem TikZ-Code geprüft, kein Layout-Build ausgeführt.

Ausgeführt: `python3 -B evidence/derivations/c04/check_c04.py`.
Ergebnis: **22 Prüfungen erfolgreich, Exitstatus 0, letzte Zeile `ALL OK`.**
Der Test ersetzt nicht die obigen allgemeinen Beweise: insbesondere Affinfortsetzung,
Hahn–Banach/Normalität/Stone wurden von Hand bzw. an den Quellen geprüft;
`psd()` im Skript verwendet numerische Eigenwerttests, keine allgemeine exakte Positivitätsentscheidung.

## C. Other findings

Alle `de.tex`-Angaben in dieser Tabelle beziehen sich auf
`content/c04-quantentheorie/de.tex`; die übrigen Pfade sind repo-relativ.

| Severity | Location | Finding | Fix |
|---|---|---|---|
| MAJOR | `content/c04-quantentheorie/de.tex:203` | H3.2 wird zunächst richtig behandelt, anschließend aber Reinheit mit Abgeschlossenheit verknüpft und die Nichtexistenz reiner Zustände durch elektromagnetische Kopplung nahegelegt. Ein isoliertes System kann z.B. in I/2 präpariert sein; eine Wechselwirkung erzwingt nicht für jeden Zustand Verschränkung oder Gemischtheit. Aus P2 folgt diese Prosa nicht. | Ab `de.tex:206`: „Normierte Vektoren beschreiben reine Zustände. Auch idealisiert abgeschlossene Systeme können gemischt präpariert sein. Wechselwirkungen mit einer Umgebung können zu gemischten Zuständen des betrachteten Teilsystems führen; gemischte Zustände sind deshalb unverzichtbar.“ Absolute Nichtexistenzbehauptung streichen. |
| MAJOR | `content/c04-quantentheorie/de.tex:457`; `content/c04-quantentheorie/de.tex:473`; `content/c04-quantentheorie/de.tex:486` | „Jede Systemsorte“, relative Zeit allein und reversible Hamilton-Dynamik sind zu allgemein. Reproduzierbarkeit allein impliziert keine Zeittranslationsinvarianz; reproduzierbar angetriebene Systeme können H(t) haben. Offene Systeme können nichtunitäre, irreversible reduzierte Dynamik zeigen. Auch die algebraische Gleichwertigkeit der Bilder impliziert nicht Zeittranslationsinvarianz. Das kollidiert besonders mit dem Absatz über reale offene Systeme. | P5 als Autorwortlaut belassen. Davor/danach ausdrücklich: „Wir spezifizieren hier die reversible Dynamik eines idealisiert abgeschlossenen, autonomen Systems mit zeitunabhängigem Hamiltonoperator.“ Zeittranslationsinvarianz als zusätzliche Modellannahme, nicht als Folge bloßer Reproduzierbarkeit, ausweisen. Bei den Bildern sagen, dass sie dieselben Wahrscheinlichkeiten liefern; „nur relative Zeit“ auf dieses autonome Modell beschränken. |
| MAJOR | `content/c04-quantentheorie/de.tex:401` | Wirkungsgrad q für den Eingang |0> allein identifiziert den Effektoperator nicht; Gegenbeispiel qI. | Fehlalarmfreiheit bei |1> hinzufügen oder F ausdrücklich als gewähltes Modell einführen; siehe `c04.cl.wirkungsgrad` in B. |
| MINOR | `content/c04-quantentheorie/de.tex:348` | „ob der Drehimpuls in die z-Richtung zeigt“ klingt wie ein gleichzeitiger scharfer räumlicher Drehimpulsvektor; außerdem ist die physikalische Identifikation der Rechenbasis modellabhängig. | „Für einen Spin 1/2 und die Wahl von |0> als Zustand mit S_z=+ℏ/2 fragt dieser Detektor, ob die z-Komponente den Wert +ℏ/2 liefert.“ Allgemeine Qubits nicht mit realem Drehimpuls identifizieren. |
| MINOR | `content/c04-quantentheorie/de.tex:195` | Die gemeinte Aussage zu Vektorzuständen/Mischungen ist im gegebenen H richtig. „Er ist nicht konstruktiv“ schreibt jedoch einem Zustand eine Eigenschaft der Existenzbegründung zu; eine Darstellung als Vektorzustand in einer anderen Darstellung der Algebra wird durch das Beispiel nicht ausgeschlossen. | „Er ist kein Vektorzustand auf diesem Hilbertraum und keine endliche oder abzählbare Wahrscheinlichkeitsmischung solcher Zustände. Diese Existenzbegründung ist nicht konstruktiv: Die Hahn–Banach-Fortsetzung wird nicht explizit angegeben.“ Insbesondere nicht mit schwach-* Grenzwerten von Mischungen verwechseln. |
| MINOR | `content/c04-quantentheorie/de.tex:489` | Die „beiden Seiten“ von (c04.eq.dynamik) sind Zahlen, kein Zustand und kein Detektor. „Nur dann“ sollte die ganze Familie Uₜ meinen, nicht einen zufällig einzelnen Zeitpunkt. | „Hermitizität gewährleistet, dass Uₜ für alle t unitär ist. Dann sind ρₜ und Uₜ†FUₜ wieder ein Zustand bzw. ein Effektoperator.“ Die anschließende Proposition unverändert lassen. |
| MINOR | `content/c04-quantentheorie/de.tex:437` | „Jeder Vektor im Bild … ist Eigenvektor“ schließt den Nullvektor ein, entgegen D96. Der Beweisgedanke ist trotzdem richtig. | „Jeder von null verschiedene Vektor im Bild …“ schreiben. |
| MINOR | `content/c04-quantentheorie/chapter.json:9` | „P1 bis P5 … sind keine neuen Prinzipien“ verdeckt gegenüber dem GPT-Rahmen die Auswahl einer speziellen Theorie und besonders die zusätzliche Dynamikannahme; `de.tex:548` erklärt diese zutreffend als nicht aus P0–P4 beweisbar. | Beide Sprachfelder sinngemäß: „P1–P4 spezifizieren die quantenmechanischen Zustände, Effekte und Wahrscheinlichkeiten im GPT-Rahmen; P5 ergänzt die reversible unitäre Zeitentwicklung.“ |

Weitere Konsistenzprüfung ohne Beanstandung:

- D22/D24/D26 sind im endlichdimensionalen Kern mit D2/D3/D4/D9 vereinbar; D95–D98 liefern die tatsächlich benutzten Spur-, Eigenraum- und Funktionalkalkülbegriffe. D22 behauptet im Kontext des Kerns nicht, alle unendlichdimensionalen Zustände seien Dichteoperatoren.
- H4.1 und H4.3 sind in den beiden Vertiefungen fachlich richtig abgesichert; H4.4 wird ausdrücklich auf den PVM-Spezialfall beschränkt. Der Text behauptet nicht, ein allgemeiner POVM-Erwartungsoperator bestimme schon die Messung.
- Alle 51 expliziten `\ref`/`\eqref`/`\zoomref`-Ziele sind im deutschen Bestand vorhanden. Beide Zoomverweise stehen direkt am Wort; kein unerlaubter Kernverweis auf einen Vertiefungsinhalt. Die vorausgesetzten C3-Blöcke enthalten die benötigten Begriffe.
- Hüte auf Operatoren, keine auf ρ, I, Ket-Bras oder Pauli-Matrizen; F/ω/B(H)-Makros entsprechen den genannten Konventionen. Die offene Buchstabenkollision F/E wird nicht als Fehler gewertet.
- Zahlen in Formeln und Bildunterschrift sind abgeleitete Radien/Wahrscheinlichkeiten oder offen gewählte Beispiele. Die TikZ-Rundungen sind konsistent. Kein unbelegter numerischer Physikwert gefunden. Sprachliche Unebenheiten der Postulatsübersetzungen ändern deren Sinn nicht.
- `chapter.json` hat konsistente ID, Voraussetzungen und den vorhandenen Figureneintrag; Ausnahme ist der oben genannte inhaltliche Metadatensatz. Die bewusst aufgeschobene englische Fassung wird nicht als Reviewfehler gewertet.

## Summary

**Kein BLOCKER; 3 MAJOR, 5 MINOR.** Alle sechs Quellenbilder und Hashbindungen sind
bestätigt; keine fehlerhafte Transkription. Alle 18 mathematischen Claims besitzen
korrekte Operatorrechnungen bzw. Sätze; bei `c04.cl.wirkungsgrad` fehlt jedoch eine
physikalische Modellannahme in der Formulierung des Beispiels. Die beiden weiteren
MAJOR-Befunde betreffen Reinheit/Abgeschlossenheit und den zu weit gefassten Anspruch
reversibler autonomer Dynamik, nicht die bewiesenen Funktional-, Extremalitäts-,
Effekt-, PVM- oder Stone-Aussagen. P0–P5 sind treu übersetzt. Das angeforderte Skript
endet mit **ALL OK**. Empfehlung: die drei MAJOR-Passagen vor Freigabe korrigieren;
die übrigen Änderungen sind lokal und klein.
