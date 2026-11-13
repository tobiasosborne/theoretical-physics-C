# NOTES-registry (lane G), 2026-10-29

## ID table for vl04 and the vl03 subsection "Operatoren" (decided before implementation)

Highest existing definition: D86. New definitions continue at D87. Existing placeholder rows D17, D18, D20 are
filled; D15 (bounded operator) and D21 (trace class) are NOT needed by vl04 and stay as they are.
Kern is finite-dimensional (PLAN 1.3 D4); infinite-dimensional scope goes to D16/D19 (Vertiefung, C5).

| Term (vl04 / vl03) | Definition ID | Symbol ID | Macro (renders) | Depth | Meaning |
|---|---|---|---|---|---|
| linear operator (vl03:253-277) | D87 new | none new (uses `sym.operator-hat`) | `\op{A}` | kern | linear map A: H -> H; in finite dimension a matrix |
| identity operator | D88 new (with null operator) | `sym.identity` (exists) | `\Id` = `\mathbb{I}`, no hat (exception) | kern | maps every vector to itself; unit matrix |
| null operator | D88 | `sym.null-operator` new | `\Nul` = `\widehat{0}` | kern | maps every vector to the zero vector; zero matrix |
| adjoint (Hermitian conjugate) | D17 existing, body written | `sym.adjoint` (exists) | `\adj` = `^{\dagger}` | kern | the operator with `<A†φ|ψ> = <φ|Aψ>`; conjugate transpose |
| Hermitian | D18 existing, body written | none | `\op{A}\adj = \op{A}` | kern | A† = A; equals self-adjoint in finite dimension (everywhere defined); unbounded case D19 |
| positive | D20 existing, body written | none | `<ψ|Aψ> >= 0` | kern | nonnegative expectation for all ψ; Hermitian automatically; "nicht negativ" caveat |
| projector | D89 new | none (generic letter, `\op{P}`) | `\op{P}` | kern | A² = A† = A; yes-no measurement |
| isometry | D90 new | none | `A†A = \Id` | kern | preserves inner product and norm |
| unitary | D91 new | `sym.unitary` (exists, unchanged) | `\op{\Uni}` | kern | A†A = AA† = \Id; dynamics |
| normal | D92 new | none | `A†A = AA†` | kern | commutes with its adjoint; superclass |
| matrix element / matrix representation | D93 new | `sym.matrix-element`, `sym.matrix-entry` new | `\melem{x}{\op{A}}{y}` = `<x|A|y>`; `\entry{\op{A}}{x}{y}` = `[A]_{xy}` | kern | numbers `<φ_x|Aφ_y>` fixing A relative to a basis |
| ket-bra / outer product | D94 new | `sym.ketbra` new | `\ketbra{\Psi}{\Phi}` = `|Ψ><Φ|` | kern | operator `χ -> <Φ|χ> Ψ`; with it `\Id = Σ |x><x|` |
| bra and ket as operators C->H, H->C | not a definition; stays D81 (extend note only) | exists | | kern | author's choice whether to keep the script's reading |
| hat convention (hats on operators, bar on vectors, bare = number) | convention CONV-HAT new | `sym.operator-hat` blessed | `\op{A}` = `\widehat{A}` | kern | D-HAT, TJO 2026-10-29; identity exempt |

Hazards: H3.1 handled in D18/D19 bodies (relationship explicit); H3.2 is the author's, not the registry's.

Decisions added while implementing: D17 is renamed "adjoint operator" (Kern scope; the unbounded case stays D19); D18 renamed "Hermitian operator";
D20 renamed "positive operator" (operator order not fixed, see open questions). D15 and D21 untouched. The projector and the other classes use the
generic letter with `\op{...}`; there is no `sym.projector`.

## Changes (all by gen_registry.py after editing the four JSON sources; nothing in registry/generated/ hand-edited)

- `sym.operator-hat`: proposed -> blessed-provisional, first_fixed_in D87, `gap_tjo` removed, decision D-HAT (TJO 2026-10-29) in `notes`, source vl04.tex:32 added.
  Rule recorded: a macro naming an operator *letter* (`\Uni`, `\Ham`, `\rhoDens`) stays bare, the hat is put at the point of use (`\op{\Uni}`, which c11 already does);
  macros that are operators by definition keep the hat in the expansion (`\xop`, `\pop`, new `\Nul`). I did not change any existing expansion, so c02/c11 render unchanged.
- New convention `CONV-HAT` (fixed in D87), identity exempt.
- Hat notes resolved: `legacy_aliases` notes of sym.density-operator (`\rhoop`), sym.hamiltonian (`\Hop`) and the sym.hamiltonian notes; COL-P ("or P if hats are dropped") and COL-S ("if hats survive") proposals rewritten to the hats-survive branch. sym.momentum-operator and sym.spin keep their own status (collision-open); I did not bless them. The notation-preinventory file is not in the repo (docs/plan/notation-preinventory.md absent), so no tracked hat question beyond the above.
- New symbols (blessed-provisional): `sym.null-operator` (`\Nul`), `sym.matrix-element` (`\melem`, 3 args), `sym.matrix-entry` (`\entry`, 3 args, `[A]_{xy}`), `sym.ketbra` (`\ketbra`, 2 args). `\melem` and `\ketbra` already existed in latex/tpc-macros.sty with the same expansion; they are now registry-owned and removed from registry/allowed-tex.json (hence the registry check passes with no clash). `\entry` and `\Nul` are new commands in registry/generated/tpc-notation.sty.
- Definitions: new D87-D94 (kern, first_fixed_in C3, blessed-provisional, origin source-adapted tpc-script-v0.2 with the vl04/vl03 locus); D17, D18, D20 filled (placeholder flags `needs_check`/`check` removed, status blessed-provisional). Every quote was matched against the line in vl04.tex/vl03.tex by script before writing; line numbers are as of the moment of writing (lane S may move lines in vl04.tex; the quotes stay searchable).
- H3.1: D18 states hermitian = symmetric = self-adjoint exactly for operators defined on all of H (so in finite dimension) and says that for restricted domains symmetric is weaker; D19 untouched. The derivation (dom T = H forces dom T = dom T-dagger from D19's definition) is in the D18 notes; I did NOT add a Reed-Simon page (no ddjvu on this machine, no page image re-read; I only reuse what D19 already records as read).
- D14: notes now record TJO's acceptance of the extended body (G-0072, 2026-10-29). The schema has `notes` but no history field.
- allowed-tex.json: `ketbra`, `melem` removed (registry owns them).

## Gate results

- `python3 scripts/registry/check_registry.py`: 149 symbols, 94 definitions, 14 conventions, 0 errors.
- `python3 scripts/registry/check_special_functions.py`: all passed.
- `python3 scripts/check_red.py --gate registry`: 18 red cases, 0 problems.
- Not run: ci.sh, course builds (not mine).

## Open questions for TJO

1. D20 name: the pre-inventory row was "positive operator, operator order". I fixed only "positive"; the order A >= B is not in lecture 4. Fix it in C4/C6 where first used?
2. "positiv definit" for the strict inequality is my word; the script only says "positiv waere die strikte Ungleichung". OK?
3. Bounded operators (D15) and the Reed-Simon locus for "bounded + symmetric = self-adjoint" (Hellinger-Toeplitz direction not needed here): leave D15 a placeholder until a chapter needs it?
4. sym.unitary letter U vs. D-HAT: kept bare with `\op{\Uni}` at use. Alternative: bake the hat into `\Uni`. I chose the first so that c11's existing `\op{\Uni}` does not get a double hat.

## Requests

- Author (lane A): use `\op{A}` for every operator, `\Id` bare, `\Nul`, `\melem{x}{\op{A}}{y}`, `\entry{\op{A}}{x}{y}`, `\ketbra{\Psi}{\Phi}`; transclude D87, D88, D17, D18, D20, D89-D94 (and D85 before D93/D94). Script defect: vl04.tex:121 quantifies "for all Psi" where chi is meant, and the equation misses the closing bracket of the bra-ket.
- Lane H (hats, c02/c11): macros for operator letters remain bare; hat goes at use. No registry expansion changed.
- Coordinator: the course sty regenerated (registry/generated/tpc-notation.sty); any consumer that checks a definitions or symbol count (docs, web check) may need the new totals (149 symbols, 94 definitions, 14 conventions).
