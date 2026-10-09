<!-- ROLE: three mocked-up page sketches showing one concept (the Born rule, postulate P4) at the
     three depths proposed in REPORT.md section 5, in print and on the web.
     Authored 2026-10-09 by the layered-docs lane. Text-only mock-ups; layout, fonts and colours are
     placeholders for the design-package lanes. Physics statements here are this lane's drafts and
     must be ground-truthed against the sources named in each sketch before use.
     UPDATE POLICY: lane-owned. -->

# Page sketches: the Born rule at three depths

Notation follows `docs/plan/BRIEF.md` (detector / effect `E`, state `rho`); the current script
`latex/lectures/de/vl06.tex` uses `F` for the detector. The blessed notation database decides.
Margin content is shown right of `|`. `[fig]` marks a figure slot.

## Sketch 1: Kern (Lehramt route), print page

```
 6.4  Die Born-Regel                                                  |
                                                                      |
 Ein Präparierverfahren liefert den Zustand rho, ein Detektor wird    |
 durch eine Matrix E mit 0 <= E <= 1 beschrieben. Die Wahrschein-     |
 lichkeit, dass der Detektor anspricht, ist                           |
                                                                      |
        p = tr(rho E).                                    (6.14)      |
                                                                      |
 Für einen reinen Zustand rho = |psi><psi| wird daraus                | Tiefe: 6.V2,
        p = <psi|E|psi>.                                  (6.15)      | S. 118
                                                                      |
 [fig] Bloch-Kugel: Zustand r (Pfeil), Detektorrichtung n (Pfeil),    |
       Projektion r.n markiert; Skala p = (1 + r.n)/2 von 0 bis 1.    |
                                                                      |
 Beispiel (Qubit). rho = (1 + r.sigma)/2 mit |r| <= 1, und ein        |
 Detektor E = (1 + n.sigma)/2 mit |n| = 1. Dann                       |
        p = tr(rho E) = (1 + r.n)/2.                      (6.16)      |
 Für |0> (r = e_z) und den Detektor |+><+| (n = e_x) ist p = 1/2.     |
 Ein Detektor E = 1/2 * 1 ("Münzwurf-Detektor") spricht in jedem      |
 Zustand mit p = 1/2 an: nicht jeder Detektor ist ein Projektor.      |
                                                                      |
 Merksatz (existing yellow box): Zustand und Detektor zusammen        |
 ergeben eine Zahl zwischen 0 und 1, und das ist alles, was die       |
 Theorie vorhersagt.                                                  |
                                                                      |
 Gültigkeitsbereich: hier für endlichdimensionale Hilbert-Räume;      | Fundament: 6.F1,
 unendliche Dimension in Vertiefung 6.V2.                             | S. 131
```

Notes. The Kern statement is restricted in scope ("endlichdimensional") and true as stated (rule K3).
Equation numbers (6.14)-(6.16) are identical in the core-only PDF (rule K4). The signposts sit in the
margin and are the only references downward (rule K2). Physics check: for
`rho = (1 + r.sigma)/2`, `E = (1 + n.sigma)/2`, `tr(rho E) = (1/4) tr(1 + r.sigma + n.sigma +
(r.sigma)(n.sigma)) = (1/4)(2 + 2 r.n) = (1 + r.n)/2`, using `tr sigma_i = 0` and
`tr(sigma_i sigma_j) = 2 delta_ij`.

Web, same content: the page reads exactly as above. The two margin signposts become inline links with
a preview of the lead sentence. The Bloch-sphere figure becomes the interactive demo (drag `r` and
`n`, read off `p`), with the static figure as the no-JavaScript fallback.

## Sketch 2: Vertiefung block, print and web

Print (continues the page after Sketch 1, after the example and the Merksatz):

```
 ┃ Vertiefung 6.V2 · Born-Regel in unendlicher Dimension              |
 ┃ Wozu: Ortsmessungen, Teilchen im Kasten und Wasserstoff leben in   |
 ┃ unendlichdimensionalen Räumen; hier steht, warum (6.14) dort       |
 ┃ weiter gilt.                                                       |
 ┃ Voraussetzung: Kern 6.1-6.4. Nicht nötig für Kapitel 7-8.          |
 ┃                                                                    |
 ┃ Ein Zustand ist ein positiver Spurklasse-Operator rho mit          |
 ┃ tr rho = 1, ein Effekt ein beschränkter Operator E mit             |
 ┃ 0 <= E <= 1. Da die Spurklasse ein Ideal in B(H) ist, ist rho E    |
 ┃ Spurklasse und p = tr(rho E) wohldefiniert. Es gilt 0 <= p <= 1:   |
 ┃     tr(rho E) = tr(rho^{1/2} E rho^{1/2}) >= 0,                    |
 ┃     tr(rho (1 - E)) >= 0.                            (6.V4)        |
 ┃ Für eine Familie von Effekten {E_k} mit sum_k E_k = 1 (POVM) ist   |
 ┃ sum_k p_k = 1.                                                     |
 ┃ Beispiel: Ortsmessung auf L^2(R), E_Delta = Multiplikation mit der |
 ┃ Indikatorfunktion von Delta; p = int_Delta |psi(x)|^2 dx. (6.V5)   | Fundament: 6.F1
 ┃                                                                    | (warum genau diese
 ┃ Zurück zum Kern. Die Formel p = tr(rho E) bleibt dieselbe; neu ist | Form?), S. 131
 ┃ nur, dass "Matrix" durch "Spurklasse-Operator" ersetzt wird.       |
```

(`┃` is the 1.5 pt outer-margin rule; body size and body font, no tint.)

Notes. Separate counter (6.V4, 6.V5), so Kern numbers do not shift. Terse register (McNamara &
Kintsch, REPORT.md section 4). No re-explanation of (6.14) (expertise reversal). One onward pointer
only. Physics check: positivity uses cyclicity of the trace with trace-class `rho^{1/2} E rho^{1/2}`;
the POVM sum for countably many outcomes needs `sum E_k = 1` in the weak or strong operator topology
and normality of `E -> tr(rho E)`. Ground truth: a functional-analysis text (Reed-Simon or Teschl;
not on disk per CONTEXT.md).

Web:

```
  6.4 Die Born-Regel
  ... (Kern text as in Sketch 1) ...

  [>] Vertiefung 6.V2 · Born-Regel in unendlicher Dimension
      Wozu: Ortsmessungen ... warum (6.14) dort weiter gilt.      [Tag: 06V2]
      ---------------------------------------------------- (closed by default)

  Depth selector, top of page:  ( Kern )  ( Kern + Vertiefung )  ( Alles )
```

`<details id="06V2"><summary>` holds the label and lead line; the body is the print text. URL
`.../kapitel06.html#06V2` opens it. Printing the web page opens all blocks.

## Sketch 3: Fundament item, print and web

Print (appendix at the end of chapter 6; outer upper page corner carries the marker "F"):

```
                                                                  [F]
 Anhang F zu Kapitel 6
 F1  Die Born-Regel als Paarung von Zustand und Effekt
     aus Kern 6.4 (S. 116) und Vertiefung 6.V2 (S. 118)
     Voraussetzung: 6.V2; geordnete Vektorräume (F0).
     Nicht nötig für die Kapitel 7-12.

 Allgemeine probabilistische Theorie (nach Plavala, arXiv:2103.07469):
 Eine Theorie liefert einen Zustandsraum K (kompakt, konvex) und
 Effekte e: K -> [0,1] (affin). Die einzige Vorhersage ist e(omega).
 Die affinen Funktionen auf K bilden einen Ordnungseinheitsraum mit
 der Konstanten 1 als Ordnungseinheit.                        (6.F1)

 Quantenmechanik als Spezialfall: A = B(H)_sa mit Ordnungseinheit 1.
 Zustände sind positive lineare Funktionale omega mit omega(1) = 1;
 Effekte sind E mit 0 <= E <= 1; die Born-Regel ist die Auswertung
       p = omega(E).                                         (6.F2)
 Normale Zustände entsprechen eins zu eins den Dichteoperatoren über
 omega(E) = tr(rho E); in unendlicher Dimension gibt es zusätzlich
 nicht-normale (singuläre) Zustände.

 Satz 6.F3 (Busch 2003). Ist mu eine Abbildung der Effekte nach
 [0,1] mit mu(1) = 1 und mu(sum_k E_k) = sum_k mu(E_k), sobald
 sum_k E_k <= 1, und ist H separabel, so gibt es einen Dichte-
 operator rho mit mu(E) = tr(rho E). (Gilt auch für dim H = 2.)
       Beweis: ...

 Zurück zum Kern: Die Born-Regel ist keine Zusatzannahme, sondern die
 einzige Art, Zustand und Detektor zu einer Wahrscheinlichkeit zu
 verbinden, die mit dem Mischen von Präparationen verträglich ist.
                                              -> zurück zu 6.4, S. 116
```

Notes. Counter `F` (6.F1-6.F3). Every item starts with a back-link and a dependency statement and
ends with a return pointer that carries a page number, so it works on paper. Physics statements to
ground-truth before use:
- the GPT definitions: Plavala, arXiv:2103.07469 (tarball on disk, not yet registered in this repo);
- normal states correspond to density operators: Bratteli-Robinson Vol. 1 (not on disk; theorem
  number to be checked);
- Busch's theorem: doi:10.1103/PhysRevLett.91.120403 (the exact hypotheses, including
  sigma-additivity and separability, must be quoted from the paper).

Web: rendered at the end of the chapter page under "Fundament" (or on a linked page
`kapitel06-fundament.html`), with id `06F1`. Kern signposts link to it with a hover or tap preview of
the lead line. A "zurück zu 6.4" link returns to the anchor, and the browser back button also works
because the link is a plain fragment. In the depth selector, "Alles" shows Fundament items inline at
their signposts instead of at the chapter end.

## What the three sketches share

| Property | Kern | Vertiefung | Fundament |
|---|---|---|---|
| Position | running text | after the Kern result and example | chapter appendix |
| Marker (print) | none | outer margin rule + run-in label | corner "F" + run-in label |
| Marker (web) | none | `<details>`, closed | end-of-page section or linked page |
| Lead / Wozu line | n/a | yes | yes |
| Dependency statement | n/a | yes | yes |
| Return line | n/a | "Zurück zum Kern" | "Zurück zum Kern" + page link |
| Numbering | (6.14) | (6.V4) | (6.F2) |
| Register | every step written out | terse | terse, with proofs |
| In the core-only PDF | yes | no | no |
