# Unabhängiges mathematisches Review: C3, Lecture 5

Datum: 2026-11-04. Geprüft: c03.s13–c03.s15 einschließlich c03.v7,
D95–D98, alle 13 beauftragten Claim-Zeilen, die Lecture-5-Herleitungen und
-Checks sowie `figures/diagonal.tex`. Die Positions-Basis ist nicht Gegenstand
dieses Reviews. Der endlichdimensionale Kern ist ausdrücklich vereinbart
(`content/c03-hilbertraum/de.tex:501`, `content/c03-hilbertraum/de.tex:1330`).

## A. Page images

`sha256sum sources/reed-simon-1/reed-simon-1.djvu` ergibt
`a9eb38970c669d4c315cba20580bc996eb024623af036c6c6d51bab1fdba9e36`.
Das stimmt mit **allen drei** `member_sha256` überein.
Alle drei Seiten wurden mit dem beauftragten Befehl
`ddjvu -format=pnm -page=N -scale=150 sources/reed-simon-1/reed-simon-1.djvu /tmp/rs1-N.pnm`
gerendert, nach PNG konvertiert und als **Bilder** gelesen, nicht über die
Textschicht. Vergleich einschließlich Satznummern, Satzzeichen und Formeln;
LaTeX-Darstellung und druckbedingte Zeilenumbrüche sind normalisiert.

| row | page_index | printed page | transcription check | support check | verdict |
| --- | --- | --- | --- | --- | --- |
| P-0331 | 239 | 227 | Text und mathematisches H stimmen; VII.3 und sein Titel sind richtig transkribiert. | Die gespeicherte Quote nennt nur die Voraussetzungen des **beschränkten** Falls, nicht dessen Schluss. Im gelesenen Bild stehen anschließend die unitäre direkte-Summen-Darstellung und das Korollar mit endlichem Maß. Damit ist der beschränkte Spezialfall bestätigt; diese Zeile allein belegt nicht den unbeschränkten Satz. | **pass**, mit dieser beschränkten Belegreichweite; Gesamtbeleg zusammen mit P-0332/0333. |
| P-0332 | 272 | 260 | Wortlaut und Formeln von VIII.4 stimmen bis einschließlich „a unitary“; die Fortsetzung fehlt tatsächlich auf dieser Seite. | Selbstadjungiertheit, Separabilität, Definitionsbereich und endliches Maß sind belegt; die Aussage ist zusammen mit P-0333 zu lesen. | **pass**. |
| P-0333 | 273 | 261 | Fortsetzung stimmt, einschließlich reellwertigem, fast überall endlichem f, Domänenäquivalenz (a) und Multiplikationsformel (b). | Zusammen mit P-0332 genau der benötigte unbeschränkte Satz. U⁻¹ = U†; die Einschränkung auf g ∈ U[D(A)] stimmt in `de.tex` und Ledger. | **pass**. |

Der Kurs formuliert eine etwas schwächere Folgerung von VIII.4: Die genaue
Charakterisierung `U[D(A)] = {g ∈ L²(M,μ): ag ∈ L²(M,μ)}` aus (a) wird nicht
behauptet. Das ist kein falscher Satz und keine ungerechtfertigte Erweiterung
auf alle g. „Reelle Funktion“ kann durch Änderung auf einer Nullmenge aus dem
fast überall reellen/endlichen Repräsentanten gewonnen werden; Gleichheiten
in L² sind wie üblich fast überall zu verstehen.

## B. Mathematics

### c03.cl.spur — ISSUE

Die vier **Aussagen sind richtig**. Die beiden endlichen Summen beweisen die
Zyklizität auch für verschieden dimensionale Räume; nur AB und BA werden
gespurt, nicht die rechteckigen Abbildungen selbst. Die Basisunabhängigkeit
wird ohne Zirkelschluss bewiesen. Die Anwendung auf Ket: ℂ → H und Bra: H → ℂ
ist korrekt und bereits in c03.s11.1 vorbereitet. Falsch ist aber die
Beweisaussage, ℂ habe die **einzige** ONB 1
(`content/c03-hilbertraum/de.tex:2144`): Auch {−1} und {e^{iα}} sind ONBs.
Korrektur: „Auf ℂ wählen wir die Orthonormalbasis {1}; die Spur der
Multiplikation mit z ist z.“ Die entsprechende Formulierung in der
Herleitung ebenfalls präzisieren (F2).

### c03.cl.spur-beispiel — CONFIRMED

`content/c03-hilbertraum/de.tex:2155`: A hat drei verschwindende
Diagonaleinträge, B drei Einträge 1/3. Für u = (1,1,1)/√3 gilt B = |u⟩⟨u|
und ⟨u|u⟩ = 1. Rechnung, Herleitung und Ledger stimmen.

### c03.cl.diagonal-wirkung — CONFIRMED

`content/c03-hilbertraum/de.tex:2198`: Zweimalige Vollständigkeit und
⟨x|A|y⟩ = δ_xy a_x liefern die angegebene Summe. Einsetzen von Ψ = |y⟩
liefert A|y⟩ = a_y|y⟩. Keine zusätzliche Voraussetzung.

### c03.cl.diagonal — CONFIRMED

`content/c03-hilbertraum/de.tex:2210`: Beide Richtungen stimmen mit der
Konvention UAU†. Insbesondere werden **beide** Unitaritätsgleichungen für
U = Σ|x⟩⟨φ_x| gezeigt. U†|x⟩ sind die Eigenvektoren von A, nicht von UAU†
in der ursprünglichen Darstellung. Die Spektralzerlegung folgt durch
Gleichheit auf einer Basis, die Spur durch Basisunabhängigkeit; Eigenwerte
werden mit ihrer Vielfachheit gezählt.

### c03.cl.eigen-hermitesch — CONFIRMED

`content/c03-hilbertraum/de.tex:2266`: Reellheit folgt aus c03.eq.orte.
Die zweite Auswertung des Matrixelements liefert wegen Antilinearität im
ersten Argument zunächst a*⟨φ|ψ⟩, dann a⟨φ|ψ⟩. Daraus folgt bei a ≠ b
die Orthogonalität. Beweis und Ledger passen.

### c03.cl.spektral — CONFIRMED

`content/c03-hilbertraum/de.tex:2287`: Der Induktionsschritt ist tragfähig.
Normalität ergibt A†E ⊆ E. Mit AE ⊆ E sind sowohl A als auch A† auf E⊥
invariant; ihre Einschränkungen sind dort tatsächlich adjungiert und
vertauschen weiterhin. Die Einschränkung ist also normal, nicht bloß
invariant. Gram-Schmidt wird **innerhalb desselben Eigenraums** benutzt und
erhält deshalb die Eigenvektoreigenschaft. ONB-Ergänzung und die echt
kleinere Dimension sind zulässige lineare Algebra. Der triviale Fall
E⊥ = {0} sollte auch im gedruckten Beweis ausdrücklich abgefangen werden
(F3); die Herleitung tut dies bereits. Das Jordan-Beispiel ist korrekt.

### c03.cl.hadamard — CONFIRMED

`content/c03-hilbertraum/de.tex:2319`: Eigenwerte ±1, normierte
Eigenvektoren, U, vertauschte Reihenfolge und die Projektorzerlegung stimmen.
Auch `content/c03-hilbertraum/figures/diagonal.tex:21` passt mathematisch zu
Kommentar und Caption: A = [[2,1],[1,2]], linke Kurve
(2 cos t + sin t, cos t + 2 sin t), Hauptachsenenden
±(3/√2,3/√2) und ±(1/√2,−1/√2); rechts Halbachsen 3 und 1.
Die Pfeile sind die richtigen Matrixspalten bzw. Eigenvektorbilder; beide
Panels haben dieselbe Skalierung. U ist eine Spiegelung mit det U = −1,
keine Drehung. Es führt die **Kurve als Menge** über; die rechte
Parametrisierung entspricht einer Umparametrisierung t ↦ π/4 − t.
Die Hauptachsenbeschriftungen bezeichnen Eigengeraden, nicht zusätzliche
Einheitsvektorpfeile. Keine geometrische Korrektur nötig.

### c03.cl.ohne-eigen — CONFIRMED

`content/c03-hilbertraum/de.tex:2381`: S und S† sind auf ganz ℓ² definiert;
ihre Normabschätzungen geben ‖Tv‖ ≤ 2‖v‖. Die Adjungiertheitsrelation
liefert T† = T auf ganz ℓ², also hier auch Selbstadjungiertheit.
Ein Eigenwert wäre reell. Real- und Imaginärteil eines Eigenvektors liegen
wieder in ℓ² und lösen dieselbe reelle Gleichung; mindestens einer ist
nicht null. **v₀ = 0 ist die Randbedingung**, die aus der ersten
Koordinatengleichung kommt. Sie liefert Q₀ = v₁², während Einsetzen der
Rekursion Q_{j+1} = Q_j ergibt. Aus v_j → 0 folgt Q_j → 0, dann v₁ = 0 und
rekursiv v = 0. Es wird weder Positivität von Q noch |λ| ≤ 2 vorausgesetzt.

Die Sinusfolgen erfüllen die Rekursion und sind für 0 < θ < π nicht in ℓ²;
eine explizite untere Schranke steht in F9. Die weitere Multiplikationsaussage
ist ebenfalls richtig: Mit
`(Wv)(θ) = √(2/π) Σ_{j≥1} v_j sin(jθ)` (Konvergenz in L²(dθ))
ist W unitär, **wenn die Vollständigkeit der Fourier-Sinusbasis benutzt
wird**. Auf endlich getragenen Folgen gilt WT = M_{2cosθ}W durch die
Additionstheoreme, auf ganz ℓ² dann durch Dichtheit und Beschränktheit.
Die Fourier-Vollständigkeit ist ein zusätzlicher analytischer Satz, keine
bereits etablierte lineare Algebra; ihre Kennzeichnung/Quelle fehlt im
Block (F6). Das ist keine Lücke im vorhergehenden Kein-Eigenvektor-Beweis.

### c03.cl.spektral-allgemein — CONFIRMED

`content/c03-hilbertraum/de.tex:2414` und `evidence/claims.json:6086`
stimmen in Voraussetzungen, endlichem Maß, reeller Funktion und Domäne
überein. VIII.4 auf den gelesenen Bildern trägt die Aussage auch für
unbeschränkte selbstadjungierte Operatoren. Separabilität ist vorhanden;
„hermitesch“ allein bei beliebiger unbeschränkter Domäne wird hier gerade
nicht als Ersatzvoraussetzung benutzt. Siehe A zur Belegreichweite von VII.3
und zur schwächeren Domänenformulierung des Kurses.

### c03.cl.funktion — CONFIRMED

`content/c03-hilbertraum/de.tex:2446`: Im endlichdimensionalen Kern ist der
Beweis vollständig. Teil 1 berechnet Polynome in jeder gewählten Eigenbasis
direkt. Bei den **verschiedenen** λ_k sind alle Lagrange-Nenner ungleich
null; p(λ_k) = f(λ_k) liefert dann f(A) = p(A), unabhängig von Phasen,
Reihenfolge und Basiswechseln in entarteten Eigenräumen. Das setzt nicht
die zu beweisende Basisunabhängigkeit voraus. Punktweise Konjugation f*
ist ausdrücklich erklärt; Adjunktion, Hermitizität bei reellem f und beide
Unitaritätsgleichungen bei |f| = 1 stimmen. Der angekündigte
Zwei-Eigenbasen-Check ist allerdings kein solcher (F7).

### c03.cl.zeitentwicklung — CONFIRMED

`content/c03-hilbertraum/de.tex:2480`: Für hermitesches H, reelles t und
das reelle positive ħ sind alle E_x reell und |exp(−itE_x/ħ)| = 1.
D98 und Teil 3 der Proposition beweisen Unitarität und damit Normerhaltung.
Das Vorzeichen entspricht exp(−itH/ħ).

### c03.cl.exp-reihe — CONFIRMED

`content/c03-hilbertraum/de.tex:2491`: Die endlich vielen skalaren
Exponentialreihen konvergieren; deshalb konvergieren die Matrixeinträge
der Operatorreihe zum angegebenen U_t. Sogar die Operatornorm-Konvergenz
folgt direkt, da der maximale Fehler über die endlich vielen E_x gegen
null geht. Die Herleitung macht die Endlichkeit explizit; keine
unzulässige Anwendung auf einen unbeschränkten Operator.

### c03.cl.qubit-zeit — CONFIRMED

`content/c03-hilbertraum/de.tex:2502`: Zu H = εσ_x gehören +ε bei φ₀ und
−ε bei φ₁. Die Phasen und die Kombination
`cos(εt/ħ) I − i sin(εt/ħ) σ_x` stimmen mit beiden Herleitungen überein.
εt/ħ ist dimensionslos; die Potenzen enthalten ε^{2n} bzw. ε^{2n+1}.
Nur der nachfolgende Satz über die angebliche Besonderheit von σ_x ist
zu korrigieren (F8), nicht die Formel.

## C. Other findings

F2 erläutert den ISSUE-Eintrag aus B; die übrigen Befunde betreffen
Begleittext, explizite Randfälle oder die Beleg-/Checkqualität.

| severity | location | finding | fix |
| --- | --- | --- | --- |
| MAJOR | `content/c03-hilbertraum/de.tex:2262` | **F1.** „Die Operatoren, die [in der Quantenmechanik] vorkommen, lassen sich diagonalisieren“ ist auch in endlicher Dimension falsch. Das unmittelbar zuvor genannte N = |0⟩⟨1| ist selbst ein zulässiger Qubit-Absenkoperator. In unendlicher Dimension widerspricht die pauschale Formulierung zusätzlich c03.v7. | „Für endlichdimensionale Systeme sind insbesondere die hermiteschen Observablen und die unitären Zeitentwicklungsoperatoren diagonalisierbar.“ Nicht auf alle QM-Operatoren verallgemeinern. |
| MINOR | `content/c03-hilbertraum/de.tex:2144`; `evidence/derivations/c03/DERIVATION.md:617` | **F2.** ℂ hat nicht nur eine ONB. Die Herleitung spricht ebenfalls unpräzise vom „single ONB element 1“ statt einer gewählten Basis. | „Wir wählen die ONB {1} von ℂ; die Spur der Multiplikation mit z ist z.“ Der Rang-eins-Spurbeweis bleibt unverändert. |
| MINOR | `content/c03-hilbertraum/de.tex:2303` | **F3.** Die gedruckte Induktion nennt nur den Start n = 1, verwendet aber auch das Komplement der Dimension 0 (z.B. A = λI). Die Herleitung fängt diesen Fall in Zeile 674 bereits ab. | Ergänzen: „Ist E⊥ = {0}, sind wir fertig; andernfalls wenden wir die Induktionsannahme an.“ Alternativ mit n = 0 und leerer ONB starten. |
| MINOR | `content/c03-hilbertraum/de.tex:2443` | **F4.** Die Basisunabhängigkeit wird dem „ersten Teil“ zugeschrieben, steht aber in Teil 2. | „der zweite Teil der folgenden Proposition“. |
| MINOR | `registry/definitions.json:3779` | **F5.** D98 ist im vereinbarten Kern korrekt, nennt im Gegensatz zu D95/D97 aber selbst keine endliche Indexmenge. Als eigenständiger Registry-Text wäre es ohne Domäne falsch: A = diag(1/j) auf ℓ² und f(z) = 1/z führen zu diag(j), nicht zu einem überall definierten Operator. Die Claim-Zeile hat dagegen explizit endlichen Scope. | In `body_de` und `body_en` ausdrücklich „auf einem endlichdimensionalen Hilbertraum“ oder „mit endlicher Indexmenge“ aufnehmen. |
| MINOR | `content/c03-hilbertraum/de.tex:2425`; `evidence/derivations/c03/DERIVATION.md:712` | **F6.** Die konkrete unitäre Sinustransformation benutzt Fourier-Sinus-Vollständigkeit. Das ist kein früheres Kapitelresultat und keine der akzeptierten LA-Voraussetzungen. Nur die interne Herleitung benennt diesen analytischen Import; der allgemeine Spektralsatz allein identifiziert nicht diese spezielle Darstellung. | Im Block die Fourier-Sinusbasis als zusätzlich zitierten analytischen Satz markieren/belegen; möglichst W mit Faktor √(2/π), Lebesguemaß dθ und L²-Konvergenz angeben. Die Rechnung zunächst auf endlich getragenen Folgen, dann per Beschränktheit fortsetzen. |
| MINOR | `evidence/derivations/c03/check_c03.py:456` | **F7.** `fB_other` benutzt exakt dieselbe Eigenbasis wie `fB`: g₁ = (1,−1,0)/√2 und das dort per Gram-Schmidt gewonnene g₂ = (1,1,−2)/√6. Der Test „the same in two eigenbases“ prüft daher keinen Basiswechsel im entarteten Eigenraum. Der unabhängige Vergleich mit dem Lagrange-Polynom ist weiterhin sinnvoll. | Für `fB_other` z.B. h₁ = (g₁+g₂)/√2, h₂ = (g₁−g₂)/√2 verwenden und deren Orthonormalität/Eigenvektoreigenschaft prüfen. |
| MINOR | `content/c03-hilbertraum/de.tex:2517` | **F8.** Der Gerade/Ungerade-Trick ist keine Besonderheit von σ_x: Er gilt z.B. ebenso für σ_y, σ_z und jede Involution. Der anschließende Vergleich H² ≠ I ist mit dem gerade eingeführten dimensionsbehafteten H zusätzlich unglücklich; hier gilt H² = ε²I. | „Dieser Trick nutzt σ_x² = I; allgemein ist H² kein skalares Vielfaches von I.“ Alternativ die dimensionslose Matrix H/ε vergleichen. |
| MINOR | `evidence/derivations/c03/DERIVATION.md:709` | **F9.** Aus dem Nichtvorliegen gleichzeitiger Nullstellen allein folgt noch keine uniform positive Schranke über alle j. Der angegebene Schluss ist richtig, die Begründung lässt aber den Kompaktheits-/Trigonometrieschritt aus. | Explizit: sin²x + sin²(x+θ) = 1 − cos(2x+θ)cosθ ≥ 1 − |cosθ| > 0 für 0 < θ < π. Damit divergiert die Quadratsumme. |

Weitere Kontrollen ohne Befund:

- D95–D97 sind korrekt und entsprechen den gedruckten generierten Bodies.
  D95 kündigt Basisunabhängigkeit an, beweist sie anschließend aber ohne
  diese Voraussetzung zu benutzen. D97 definiert bewusst **unitäre**
  Diagonalisierbarkeit; seine Äquivalenz wird durch c03.prop.diagonal
  bewiesen. D96 schließt den Nullvektor als Eigenvektor aus und nimmt ihn
  ausdrücklich in den Eigenraum auf. D98 ist innerhalb des endlichen Scopes
  ebenfalls nicht zirkulär (siehe B und F5).
- Alle referenzierten Labels des neuen Materials sind vorhanden, einschließlich
  c03.ex.drei, c03.ex.shift, c03.v5, c03.v6, c03.prop.gram-schmidt,
  c03.prop.isometrie, c03.prop.ketbra, c03.eq.orte und c02.eq.pauli.
  Die Figur ist als `c03.fig.diagonal` auf die geprüfte TikZ-Datei registriert.
- Keine substantielle Abweichung zwischen den 13 Ledger-Statements und den
  zugehörigen Aussagen in `de.tex`; die Ledger-Scopes schützen den Kern vor
  unendlichen Summen und unbeschränkten Operatoren.
- Die Operatorhüte, die hutlose Identität, Pauli-Matrix und Ket-Bras sind im
  neuen Text und in der Figur konsistent mit den angegebenen Makros.

## Summary

- Seitenbilder: **3 pass, 0 fail**; Hash, Seitenindizes und gedruckte Seiten
  stimmen. P-0331 belegt nur den beschränkten Spezialfall im gelesenen
  Seitenkontext; P-0332/0333 gemeinsam tragen die allgemeine Aussage.
- Mathematik: **12 CONFIRMED, 1 ISSUE**. Alle 13 Claim-Aussagen sind im
  vereinbarten Scope wahr; der ISSUE ist die falsche ONB-Eindeutigkeitsaussage
  im Spurbeweis, nicht die Spuridentität.
- Befunde: **0 BLOCKER, 1 MAJOR, 8 MINOR** (9 eindeutig nummerierte Befunde;
  der ISSUE aus B ist als F2 mitgezählt, nicht zusätzlich).
- `python3 evidence/derivations/c03/check_c03.py` vollständig ausgeführt:
  **Exitcode 0, letzte Ausgabe `ALL OK`**. F7 bleibt trotz dieses grünen
  Ergebnisses bestehen. Kein Build und kein `./ci.sh` ausgeführt.
- **Noch nicht freigabefertig:** F1 muss eingeschränkt und F2 korrigiert
  werden; die weiteren konkreten Bereinigungen sind oben angegeben.
  Geschrieben wurde ausschließlich dieser Bericht; die Seitenbilddateien
  liegen wie beauftragt unter `/tmp`.
