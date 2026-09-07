# Zuordnung Vorlesungsvideos ↔ Skript-Vorlesungen

**Kurs:** Theoretische Physik C (Quantenmechanik & Statistische Physik), Tobias J. Osborne
**Stand:** 2026-09-07 · 25 Videos ↔ 22 Skript-Vorlesungen (`vl01`–`vl22`)

## Wie diese Zuordnung zustande kam

Grundlage sind drei unabhängige Quellen, die gegeneinander geprüft wurden:

1. **Die Selbstmeldungen der 25 Transkript-Agenten** (`covers`-Blöcke) — brauchbar,
   aber teils unscharf bei den Rändern: mehrere Agenten haben denselben
   Skript-Abschnitt als „Grossteil“ reklamiert, weil sie Rückblick und
   Neubehandlung nicht getrennt haben.
2. **Die `## Ablauf`-Tabellen in `transcripts/clean/vNN.md`**, in denen jeder
   Zeitmarke ein Skript-Abschnitt zugeordnet ist. Das ist die belastbarste
   Quelle: sie zeigt nicht nur *ob*, sondern *wie viel* eines Videos auf eine
   Skript-Vorlesung entfällt. Aus ihr wurde die Primärzuordnung abgeleitet.
3. **Die Skript-Quellen `latex/lectures/de/vlNN.tex`** selbst, herangezogen bei
   jedem Konflikt (insbesondere für `vl07`/`vl08`, `vl09`, `vl18`).

**Verfahren.** Pro Video wurden die Ablauf-Zeilen nach Skript-Tag ausgezählt.
Die Skript-Vorlesung mit dem grössten zusammenhängenden Block wurde zur
*Primärzuordnung*; kurze Rückblicke, Vorgriffe und Werkzeug-Rückgriffe wurden
als *Sekundärbezüge* geführt und zählen **nicht** für die Monotonie. Damit ist
die Primärkette streng monoton: kein späteres Video zeigt primär auf eine
frühere Skript-Vorlesung.

### Aufgelöste Konflikte

| Konflikt | Auflösung |
|---|---|
| **v08 und v09 melden beide `vl07` „Grossteil“** | `vl07` (946 W) ist über beide Videos verteilt. v08 (ab 44:00) baut das Teilchen in 1D über die Postulate 1–4 bis `p(x)=|Ψ(x)|²` auf; v09 (00:00–62:00) bringt Ortsoperator, Impulsoperator und Hamiltonoperator. Beide Hälften sind echte Erstbehandlung, keine Wiederholung. |
| **v10, v11 und v12 melden alle `vl08`** | v10 ist die eigentliche `vl08`-Vorlesung (21 von 24 Ablauf-Zeilen). v11 schliesst sie ab: §Die Quantisierungsregeln endet im `.tex` mit den kanonischen Vertauschungsrelationen, und genau die werden in v11 (00:00–49:00) hergeleitet. v12 behandelt die Impulsbasis **erneut** — Osborne sagt bei 60:01 ausdrücklich, er finde seinen Tafelweg besser als den Skripttext. Das ist Neuherleitung, nicht Neustoff; Primär für v12 bleibt `vl10`. |
| **v11 vs. v12 bei `vl09`** | `vl09` (324 W) wird in v11 ab 49:58 vollständig behandelt. v12 bringt nur die Korrektur „λ muss reell sein“ (00:00–01:00). Primär: v11. |
| **v18 meldet `vl17` „kurz“** | Vorgriff (halbzahlige ℓ treten beim Bahndrehimpuls nicht auf), kein Stoffvorzug. `vl17` wird in v20 behandelt. Keine Monotonieverletzung. |
| **v24 meldet `vl17` „teilweise“** | Rückgriff auf das Tensorprodukt — und zugleich eine *Lückenfüllung*: `vl17.tex` enthält den Hamiltonoperator zusammengesetzter Systeme `H₁⊗I + I⊗H₂` überhaupt nicht, v24 leitet ihn her. Als Sekundärbezug geführt, aber als Anreicherungsziel für `vl17` vorgemerkt. |
| **v23 meldet `vl20` „kurz“** | Schluss-Ausblick auf das mikrokanonische Ensemble. Vorwärtsverweis. |
| **v06 meldet nur `vl05`** | Bestätigt: 14 von 21 Ablauf-Zeilen sind `vl05`, der Rest Rückblick auf `vl04`. `vl05` läuft von v05 (ab 56:00, Position-Basis + Spur) bis v06 (Diagonalisierung, Eigenwerte, Funktionalkalkül). |
| **v19 deckt zwei Skript-Vorlesungen ab** | `vl15` (401 W) und `vl16` (335 W) sind zusammen kürzer als eine normale Skript-Vorlesung und werden in einem Video abgehandelt. Kein Fehler, sondern eine Folge der dünnen Skripttexte. Analog v24 für `vl20`+`vl21`. |
| **„Statistische Physik“ ohne eigene Skript-Vorlesung** | Falscher Alarm: `vl18.tex` enthält ein unnummeriertes `\section*{Statistische Physik}` nach Postulat 6. v22 deckt genau diesen Anhang ab. |

---

## Tabelle 1 — Video → Skript

| Video | Titel | Skript-Vorlesung(en) | Abdeckung | Konfidenz |
|---|---|---|---|---|
| **v01** | Die Geburt der QM, Wahrscheinlichkeitstheorie | `vl01` | Anfang–Mitte (Vorgeschichte, Wahrscheinlichkeit, Stichprobenräume bis Erwartungswert) | hoch |
| **v02** | Probability Theory | `vl01` → `vl02` | `vl01` Ende (Maße, Momente, Varianz); `vl02` Anfang (komplexe Vektorräume, ℂⁿ) | hoch |
| **v03** | Hilbertraum | `vl02` → `vl03` | `vl02` Rest (Kreuz-Operation, Skalarprodukt, ℓ², L²(ℝ)); `vl03` Anfang (Dirac-Notation, Skalarprodukt-Axiome, Hilbertraum) | hoch |
| **v04** | Basis, Operators | `vl03` → `vl04` | `vl03` Ende (Schwarz, Basis, Gram-Schmidt, Operatoren); `vl04` Grossteil (Adjungierte, sechs Operatorklassen, Matrixelemente) | hoch |
| **v05** | Operatoren, Positions-Basis, Spur | `vl04` → `vl05` | `vl04` Ende (Bra-Ket als Operatoren, Ket-Bra, Beispiel 4.1); `vl05` Anfang (Position-Basis, Spur) | hoch |
| **v06** | Diagonalization, Eigenvalue, Eigenvector, Functional Calculus | `vl05` | `vl05` Ende — vollständig (Diagonalisierung, Eigenwert/Eigenvektor, Funktionalkalkül) | hoch |
| **v07** | Die Postulate der QM | `vl06` | Grossteil (Einleitung, Postulate 1–5) | hoch |
| **v08** | Quantisierung | `vl06` → `vl07` | `vl06` Ende (Observable/POVM, `F(S)`, Heisenberg-/Schrödingerbild, Schlussabsatz); `vl07` erste Hälfte (Quantisierung als inverses Problem, Teilchen in 1D, `p(x)=|Ψ|²`) | hoch |
| **v09** | Die Schrödingergleichung | `vl07` → `vl08` | `vl07` zweite Hälfte (Ortsoperator, Impulsoperator, `H=p²/2m`); `vl08` Anfang (Schrödingergleichung, Fourier-Transformation) | hoch |
| **v10** | Die Schrödingergleichung (Lösung) | `vl08` | Grossteil (Lösung für das freie Teilchen, Impuls-Raum, Impulsstatistik, Teilchen in 3D, Quantisierungsregeln) | hoch |
| **v11** | Unschärfe | `vl08` → `vl09` | `vl08` Ende (kanonische Vertauschungsrelationen, Kommutator); `vl09` vollständig | hoch |
| **v12** | Zerfliessen des Wellenpakets | `vl10` (+ `vl08` Neuherleitung) | `vl09` Korrektur (λ ∈ ℝ); `vl08` §Impuls-Raum systematisch neu; `vl10` Anfang (Heisenbergbild, `x̂(t)`, abgebrochen) | hoch |
| **v13** | Teilchen im Kasten | `vl10` → `vl11` | `vl10` Ende (`x̂(t)=x̂(0)+p̂ₓt/m`, klassischer Limes); `vl11` Grossteil (Modell, Randbedingungen, `Eₙ`) | hoch |
| **v14** | Harmonischer Oszillator | `vl11` → `vl12` | `vl11` Ende (Eigenfunktionen, `U_t`, 3D-Separation); `vl12` Anfang (Leiteroperatoren, `H=ħω(a†a+½)`, `a|φ₀⟩=0`) | hoch |
| **v15** | Harmonischer Oszillator 2 | `vl12` | Grossteil (Grundzustand, Kommutatoren, Eigenwertleiter, Matrizen, Hermite-Polynome) | hoch |
| **v16** | Endlich hoher Potentialtopf | `vl12` → `vl13` | `vl12` Ende (Dynamik, Periodizität, Heisenbergbild); `vl13` Grossteil (Potential, κ und q, gerade/ungerade Lösungen, Anschlussbedingungen) | hoch |
| **v17** | Endlich hoher Potentialtopf & Drehimpuls | `vl13` → `vl14` | `vl13` Ende (transzendente Gleichungen, graphische Lösung, gebundene Zustände); `vl14` Anfang (Bahndrehimpuls, Matrixelemente, `[L²,L_j]=0`) | hoch |
| **v18** | Drehimpuls | `vl14` | Grossteil/Ende (Beweis der Kommutatoren, `|ℓ,m⟩`, Kugelkoordinaten, Kugelflächenfunktionen) | hoch |
| **v19** | Zentralpotential und Wasserstoffatom | `vl15` + `vl16` | beide vollständig | hoch |
| **v20** | Spin und zusammengesetzte Systeme | `vl17` | vollständig (Spin, Pauli-Matrizen, Tensorprodukt, Rechenregeln) | hoch |
| **v21** | Identical Particles | `vl18` | Anfang (Identische Teilchen, Permutationen, `U_π`, `H^{⊗N}_±`, Postulat 6) | hoch |
| **v22** | Statistische Physik | `vl18` → `vl19` | `vl18` Ende (§Statistische Physik: Mikro-/Makrozustand, Ensemble, Grundannahme); `vl19` Anfang (Motivation, Definition von `S(ρ)`) | hoch |
| **v23** | Entropie | `vl19` | Rest — damit vollständig (log(ρ), Rechenbeispiele, reiner und vollständig gemischter Zustand) | hoch |
| **v24** | Das mikrokanonische Ensemble | `vl20` + `vl21` | beide vollständig | hoch |
| **v25** | Kanonisches Ensemble | `vl22` | vollständig (kanonisches Ensemble, Zustandssumme, Hauptsätze) | hoch |

---

## Tabelle 2 — Skript → Video

Spalte „Abbildung“ = wie gut der `.tex`-Text den Vortrag wiedergibt.
*Faktor* = zugeordnete Videowörter / Skriptwörter (Kursmittel ≈ 5,9).

| Skript | Thema | Video(s) | Faktor | Abbildung |
|---|---|---|---|---|
| `vl01` | Die Geburt der Quantenmechanik | **v01**, v02 (bis 75:00) | 4,5 | **gut.** Der historische Teil ist ausführlich; es fehlen v.a. Rahmung (Drei-Schritt-Modell des Experiments) und didaktische Kommentare. |
| `vl02` | Hilbertraum | v02 (ab 75:00), **v03** (bis 43:00) | 4,6 | **mittel.** ℓ² fehlt als Begriff komplett (Osborne sagt das selbst); ebenso das Skalarprodukt auf L²(ℝ) und die Zuordnung der drei Räume zu drei physikalischen Systemen. |
| `vl03` | Hilbertraum, Basis, Operatoren | v03 (ab 43:00), **v04** (bis 48:00) | 5,4 | **mittel.** Vollständigkeitsrelation fehlt als eigenständige, benannte Formel; Gram-Schmidt ohne Beispiel. |
| `vl04` | Operatoren | v04 (ab 48:00), **v05** (bis 56:00) | 4,6 | **gut.** Nulloperator, Hut-Notation und die physikalische Deutung der Operatorklassen fehlen. |
| `vl05` | Position-Basis, Spur, Diagonalisierung | v05 (ab 56:00), **v06** | 6,3 | **dünn.** Die gesamte Rückrichtung (Eigenvektoren → unitäre Matrix), der Orthogonalitätsbeweis und das Qubit-Beispiel fehlen. |
| `vl06` | Postulate der Quantenmechanik | **v07**, v08 (bis 44:00) | 5,1 | **gut**, aber ohne Beispiele: kein allgemeiner Qubit-Zustand, keine POVM-Beispiele, Hermitezität von `Ĥ` fehlt in Postulat 5 (Osborne merkt das selbst an). |
| `vl07` | „Quantisierung“ | v08 (ab 44:00), **v09** (bis 62:00) | 5,8 | **mittel.** Die Warnung zu `|x⟩⟨x|` steht, die zugehörige Rechnung nicht. |
| `vl08` | Die Schrödingergleichung | v09 (ab 62:00), **v10**, v11 (bis 49:00), v12 (Neufassung) | 6,6 | **mittel.** Längstes Skriptkapitel, aber über vier Videos verteilt; Fourier-Konventionen und die Normierungsbedingung in 3D fehlen. |
| `vl09` | Unschärfe | **v11** (ab 49:58), v12 (Korrektur) | 7,4 | **sehr dünn** (324 W). Interpretation nur positiv formuliert, ohne die im Video zentrale Zurückweisung der „erst x, dann p“-Lesart. |
| `vl10` | Zerfliessen des Wellenpakets | v12 (ab 43:00), **v13** (bis 51:00) | 6,3 | **dünn.** Rechnet in der Impulsdarstellung; der Vortrag baut sie erst über dreifaches Eins-Einschieben auf und nennt das ausdrücklich die bessere Darstellung. |
| `vl11` | Teilchen im Kasten | v13 (ab 51:00), **v14** (bis 52:00) | 4,6 | **gut.** Es fehlen Motivation (Quantenpunkt, Resonator) und die Einordnung der Eigenzustände als Idealisierung. |
| `vl12` | Harmonischer Oszillator | v14 (ab 52:00), **v15**, v16 (bis 40:00) | 5,2 | **gut.** Leibniz-Regel für Kommutatoren und die Warnung zu `e^{A+B}` fehlen; beides wird im Vortrag gebraucht. |
| `vl13` | Endlich hoher Potentialtopf | v16 (ab 40:00), **v17** (bis 42:00) | 7,6 | **dünn.** Stetigkeit/Differenzierbarkeit werden ohne Begründung angenommen; Streuzustände und die Deutung von α fehlen. |
| `vl14` | Drehimpuls | v17 (ab 42:00), **v18** | 8,0 | **sehr dünn.** Die Konstruktion über Leiteroperatoren `L_±` und der Beweis des Lemmas über kommutierende Operatoren fehlen ganz. |
| `vl15` | Zentralpotential | **v19** (bis 64:00) | 6,4 | **dünn.** Noether-Zusammenhang und die Begründung, *warum* Separationsansätze funktionieren, fehlen. |
| `vl16` | Das Coulombpotential (Wasserstoffatom) | **v19** (ab 64:00) | 4,9 | **sehr dünn in absoluten Zahlen** (335 W). Termschema, Spektroskopie und die Frobenius-Methode fehlen. |
| `vl17` | Spin | **v20**, v24 (Ergänzung) | 4,7 | **mittel.** Stern-Gerlach fehlt; gravierender: der Hamiltonoperator zusammengesetzter Systeme `H₁⊗I+I⊗H₂` fehlt, obwohl `vl21` ihn voraussetzt. Verschränkung und EPR-Zustand kommen nicht vor. |
| `vl18` | Identische Teilchen + §Statistische Physik | **v21**, **v22** (bis 65:00) | 6,4 | **mittel.** Kein einziges konkretes Beispiel (Permutationsdiagramme, Drei-Qubit-Matrix, Singulett); das Argument über die globale Phase fehlt. |
| `vl19` | Entropie | v22 (ab 65:00), **v23** | 6,6 | **dünn.** Die Warnung „log(ρ) ist nicht der eintragsweise Logarithmus“ fehlt, ebenso unitäre Invarianz und Additivität — letztere wird in `vl21` benutzt. |
| `vl20` | Mikrokanonisches Ensemble | **v24** (bis 45:00) | 5,6 | **dünn.** Kein Zahlenbeispiel; die Begründung, warum Maximum-Entropie in der QM besser passt als Abzählen, fehlt. |
| `vl21` | Temperatur | **v24** (ab 45:00) | 8,2 | **sehr dünn** (152 W, kürzeste Vorlesung des Skripts). Maximiert `w(E₁)` statt der Entropie; die Diagonalisierung von `H₁⊗I+I⊗H₂` fehlt vollständig. |
| `vl22` | Kanonisches Ensemble | **v25** | 8,4 | **sehr dünn** (höchster Faktor). Lagrange-Multiplikatoren nur beim Namen genannt; Nebenbedingungen `tr(ρ)=1`, `ρ≥0` fehlen; 3. Hauptsatz ohne die im Vortrag genannten Ausnahmen. |

---

## Stoff ohne Skript-Entsprechung

Material, das im Vortrag substantiell vorkommt und im Skript gar nicht steht.
Sortiert nach Art; „(vNN)“ nennt das Quellvideo.

### Konzeptionelle Rahmung (durchgehend)
- **Drei-Schritt-Modell jedes Experiments** — Präparation → Durchführung → Messung, mit der Zuordnung „Präparationen = Wahrscheinlichkeitsfunktionen, Experimente = Abbildungen zwischen ihnen, Messungen = Funktionen“. Taucht in v01, v02, v07, v11 wieder auf und ist der rote Faden des Kurses. (v01, v02)
- **Klassische vs. quantenmechanische Wahrscheinlichkeit** — klassisch stets fehlende Information, quantenmechanisch fundamental. Motiviert das gesamte Postulatsystem. (v07)
- **Erkenntnistheoretischer Status der Postulate** — „wir verstehen die QM sehr wohl, können die Postulate aber nicht begründen“; Äquivalenz verschiedener Postulatsammlungen. (v07)
- **Mathematisch möglich ≠ physikalisch realisiert** — längster Exkurs des Spin-Kapitels. (v20)
- **Thermodynamik ist nicht fundamental**, sondern eine grobkörnige Folgerung der Quantenmechanik. (v25)

### Fehlende Beweise und Rechnungen
- Rückrichtung der Diagonalisierung: `U = Σ_j |j⟩⟨φ_j|` samt Unitaritätsbeweis; Orthogonalität der Eigenvektoren; reelle Eigenwerte. (v06)
- Vollständig durchgerechnetes Gram-Schmidt-Beispiel in ℂ². (v04)
- Qubit-Diagonalisierung mit der Hadamard-Matrix, zweimal vorgeführt (prüfen vs. finden). (v06)
- Beweis, dass `ρ = Σ_j p_j ρ_j` ein Dichteoperator ist (Spur eins, Positivität). (v23)
- Beweis des Lemmas „kommutierende hermitesche Operatoren haben gemeinsame Eigenvektoren“ — `vl15` behauptet es nur. (v18)
- Vollständiger Beweis von `[L², L₁] = 0` mit der Kommutator-Produktregel. (v17)
- Leibniz-Regel für Kommutatoren `[AB,C] = A[B,C] + [A,C]B`. (v15)
- `e^{A+B} = e^A e^B` nur bei `[A,B] = 0` — elf Minuten Vorlesungszeit, im Skript stillschweigend benutzt. (v16)
- Diagonalisierung von `H₁⊗I + I⊗H₂`: Eigenvektoren `|E_j⟩⊗|E_k⟩`, Eigenwerte `E_j + E_k`. (v24)
- Lagrange-Multiplikatoren von Grund auf am Beispiel `f(x,y)` mit `g(x,y)=0`. (v25)

### Fehlende Warnungen und Fehlerquellen
- `δ(0) = ∞`: alleinstehende Ket-Bra-Kombinationen sind verboten, im Integral harmlos. (v05, v09)
- `log(ρ)` ist **nicht** der eintragsweise Logarithmus der Matrixeinträge. (v23)
- `H = H₁⊗I + I⊗H₂`, **nicht** `H₁⊗H₂` — explizit als naheliegender Fehler markiert. (v20, v24)
- Vollständigkeit einer Basis ≠ Vollständigkeit des Hilbertraums. (v04)
- „positiv“ vs. „nicht negativ“; „eindimensionaler Projektor“ meint den Rang. (v04, v07)
- Die Unschärferelation sagt **nichts** über sukzessive Messungen am selben System — „quasi alle Autoren sagen es falsch“, ausdrücklich als Prüfungsstoff markiert. (v11)
- Ein Makrozustand ist kein Quantenzustand. (v22)
- Der 3. Hauptsatz hat Ausnahmen (Glas, Eiskristalle, Spingläser mit Restentropie). (v25)

### Physikalische Bilder und Anwendungen
- Hohlraum mit kleinem Loch; Photoeffekt am Tafelbild; Stern-Gerlach als Grundlage der Qubits. (v01, v20)
- ℂ² = Qubit, ℓ² = harmonischer Oszillator, L²(ℝ) = Teilchen in 1D; Photon in der Glasfaser. (v03)
- Schrödingergleichung = Wärmeleitungsgleichung mit `i`; Fourier-Transformierte = Spektrum im Tonstudio. (v09)
- Ortsdetektor als Kamera mit Pixelgitter; Streuexperiment im Collider mit Detektorkugel. (v11)
- Dekohärenz-Erklärung des Nicht-Zerfliessens: das elektromagnetische Feld fragt fortlaufend „bist du da?“. (v12)
- Quantenpunkt und Hohlraumresonator als Realisierung des Kastens; Optomechanik (Nanotrommeln) für den Oszillator. (v13, v14)
- LHC-Analogie zum Potentialtopf; gebundene Zustände sind neue Teilchen. (v16)
- Anyonen, Flachland, Quanten-Hall-Systeme als Konsequenz des Fallenlassens der Eindeutigkeit. (v18)
- Wasserstofflinien zur Entfernungsbestimmung von Galaxien; Satz von Noether; Termschema mit Häufungspunkt bei `E=0`. (v19)
- EPR-Zustand `(|↑↑⟩+|↓↓⟩)/√2`; Verschränkung als das, was das Tensorprodukt zusätzlich liefert. (v20)
- Das elektromagnetische Feld im Hörsaal als Wärmebad; Entropie als Kompressionsgrenze. (v22, v25)

### Nicht anzureichern
Organisatorisches aus v01 (Fehlerprämien, Prüfungsmodalitäten, Literaturhaltung) und
die optionale Ferienübung auf echter Quantenhardware (v20) gehören nicht ins Skript.
Der Hinweis „in jeder mündlichen Prüfung wird nach der wichtigsten Aussage über
die QM gefragt“ (v01) und die Prüfungsansage zur Unschärfe-Interpretation (v11)
sind dagegen als Merkboxen brauchbar.

---

## Vorlesungen mit dünnem Skript

Rangliste nach Anreicherungsgewinn. Kriterien: Faktor (Videowörter je Skriptwort,
Kursmittel ≈ 5,9), absolute Skriptlänge und Zahl inhaltlicher — nicht bloss
rhetorischer — Lücken.

### Priorität 1 — hier bringt Anreicherung am meisten

| Skript | W | Faktor | Warum |
|---|---|---|---|
| **`vl21` Temperatur** | 152 | 8,2 | Kürzeste Vorlesung des Skripts. Setzt die Diagonalisierung von `H₁⊗I+I⊗H₂` und die Additivität der Entropie voraus, von denen keine irgendwo im Skript steht. v24 liefert beides fertig. |
| **`vl22` Kanonisches Ensemble** | 484 | **8,4** | Höchster Faktor des Kurses. Lagrange-Multiplikatoren nur beim Namen genannt; die versteckten Nebenbedingungen `tr(ρ)=1` und `ρ≥0` fehlen, obwohl der Term `log(Z)·I` in der Stationaritätsgleichung genau aus ihnen kommt. v25 hat den vollständigen Exkurs. |
| **`vl14` Drehimpuls** | 555 | 8,0 | Die Eigenwerte `ħ²ℓ(ℓ+1)` und `ħm` stehen als „man kann beweisen“ da. v18 liefert die Konstruktion über `L_± = L_x ± iL_y` und den Beweis des Lemmas über kommutierende Operatoren, das `vl15` benutzt. |
| **`vl13` Endlich hoher Potentialtopf** | 561 | 7,6 | Stetigkeit und Differenzierbarkeit werden kommentarlos angenommen. v16/v17 begründen beides physikalisch (endlicher Erwartungswert der kinetischen Energie) und liefern die Deutung von α sowie die Streuzustände mit `E>0`. |
| **`vl09` Unschärfe** | 324 | 7,4 | Der Beweis ist knapp korrekt, aber `λ ∈ ℝ` bleibt unbegründet (v12 liefert den Grund), und die Interpretation ist nur positiv formuliert. Die im Vortrag zentrale, ausdrücklich prüfungsrelevante Zurückweisung der Fehldeutung fehlt. |

### Priorität 2 — deutliche, aber lokal begrenzte Lücken

| Skript | W | Faktor | Warum |
|---|---|---|---|
| **`vl19` Entropie** | 444 | 6,6 | Die Warnung zum eintragsweisen Logarithmus, die unitäre Invarianz und die Additivität fehlen — letztere wird in `vl21` gebraucht. v23 hat ein vollständig durchgerechnetes nicht-diagonales Beispiel. |
| **`vl15` Zentralpotential** | 401 | 6,4 | Der Separationsansatz fällt vom Himmel. v19 erklärt, warum er genau bei vorliegender Symmetrie funktioniert (Noether, kommutierende Observablen als unabhängige Teilsysteme). |
| **`vl18` Identische Teilchen** | 908 | 6,4 | Kein einziges konkretes Beispiel. v21 liefert Permutationsdiagramme, die 8×8-Matrix von `U_{θ₁₂}` für drei Qubits und das Argument über die globale Phase, das erst erklärt, warum Fermionen zulässig sind. |
| **`vl08` Die Schrödingergleichung** | 1453 | 6,6 | Absolut das längste Kapitel, aber über vier Videos verteilt. Lücken: Fourier-Konventionen (erklärt den rätselhaften `1/(2π)`-Vorfaktor), fehlende Normierungsbedingung im 3D-Fall, Ursprung des Kommutators in der Leibniz-Regel. |
| **`vl05` Position-Basis, Spur, Diagonalisierung** | 1041 | 6,3 | Die Rückrichtung der Diagonalisierung fehlt ganz — Osborne sagt das im Video ausdrücklich. Dazu Orthogonalitätsbeweis, Normierung und das Qubit-Beispiel. |
| **`vl10` Zerfliessen des Wellenpakets** | 567 | 6,3 | Rechnet direkt in der Impulsdarstellung; `i ħ ∂/∂pₓ` wird benutzt, ohne je hergeleitet zu werden. v12/v13 liefern die Herleitung und den systematischen Weg über die Vollständigkeitsrelation, den Osborne dem Skripttext vorzieht. |
| **`vl17` Spin** | 789 | 4,7 | Trotz niedrigem Faktor hoch priorisiert: der Hamiltonoperator zusammengesetzter Systeme fehlt, obwohl `vl21` ihn braucht. Ausserdem keine Verschränkung, kein EPR-Zustand, kein Stern-Gerlach. |
| **`vl20` Mikrokanonisches Ensemble** | 380 | 5,6 | Kein Zahlenbeispiel (v24 hat ein fertiges mit `d=3`); die Begründung, warum Maximum-Entropie in der QM dem Abzählen überlegen ist, fehlt. |

### Priorität 3 — gut abgebildet, punktuelle Ergänzungen
`vl01`, `vl02`, `vl03`, `vl04`, `vl06`, `vl07`, `vl11`, `vl12`, `vl16`.
Hier fehlen vor allem Motivation, Beispiele und Warnungen, nicht Substanz.
Ausnahme innerhalb der Gruppe: **`vl16`** ist mit 335 Wörtern absolut sehr kurz
(Termschema, Spektroskopie und Frobenius-Methode fehlen), und **`vl02`** hat mit
dem fehlenden ℓ² eine echte inhaltliche Lücke, die Osborne im Video selbst benennt.
