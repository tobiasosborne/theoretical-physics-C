<!-- ROLE: brief for bringing lectures 5 and 6 to the new level (German first), 2026-11-04.
     UPDATE POLICY: the coordinator only. -->

# Brief: lectures 5 and 6, German script and German web course

## TJO's request (2026-11-04)

> i want to work on the next pair of lectures. lecture 5 and 6 i believe. our primary target is
> the main german skript and the corresponding webpage. i want to work tightly scoped here, i
> don't want this to blow out into multiple agents and multihour build times. Do use codex
> subagents (sol 6.1 xhigh is best, esp for analytic checks), and occasional muse wonder full for
> review. [...] the english versions should follow afterward.

## TJO's decisions (2026-11-04)

- **D-POS. The position basis is deferred.** vl05's subsection "Position-Basis" (⟨x|, |x⟩,
  δ(x−y) on L²(ℝ)) goes neither into C3 nor into script chapter 5, apart from a one-line
  forward pointer. The vl05 migration map marks its items `deferred` to C5 / script chapter 7
  (vl07 has the |x⟩⟨x| warning), as vl03's Operatoren subsection was deferred to vl04.
- **D-C4. New chapter C4, Kern plus hazard blocks.** vl06 becomes
  `content/c04-quantentheorie/`: the postulates P1-P5 in finite dimension with the qubit
  examples, plus depth blocks only where a correctness hazard needs one (H4.1 normal versus
  singular states; H4.3 self-adjoint Hamiltonian for unitary dynamics). Gleason/Busch, Naimark,
  instruments and complete positivity are later.
- **D-EVID. Evidence: what the gates need, inline.** Registry rows for new definitions, ledger
  rows for every `\claim`, derivations with a check script, provenance rows behind every
  `\srcref`, one migration map per lecture, migration records for the defects found. No
  separate evidence or registry lanes; no new page-image receipts unless a claim needs one.
- **D-DE. German first.** `vl05.tex`, `vl06.tex`, `content/c03-hilbertraum/de.tex`,
  `content/c04-*/de.tex`. English (`lec05`, `lec06`, the `en.tex` files) follows in a later
  round. Until then the parity gates (`check_parity.py`, check_levels K6/M1) are red for these
  files by design. **Nothing is pushed to master in between**: a push deploys the student site.

- **D-WORTLAUT (2026-11-06).** The postulates P1 to P5 are printed in the wording of script v0.2
  (`git show 90fe735d:latex/lectures/de/vl06.tex`, lines 22, 36, 64, 82-83, 126-128; English
  `lec06.tex`), in the script and in the course, both languages, with the course's symbols (hats,
  `\Hil`, `F`, `psi`). The brief's telegraphic lines (docs/plan/BRIEF.md:51-55) are not printed; P0
  stays. TJO: "I really dont like the new wording. About this I am very particular." Two slips of
  v0.2 were normalised: "heisst" to "heißt" (P3) and "an gemäß" to "an einem gemäß" (P4).

Standing decisions that apply unchanged: D-HAT (hats on operators; none on 𝕀, states, Pauli
matrices, ket-bras), D-BUDGET-FLEX (budgets are guides; exceptions stated with reasons; no
counting hacks), the script-v0.3 rules 1-8 (`docs/plan/script-v0.3/BRIEF.md`), the authoring
contract (`docs/authoring/CONTRACT.md`).

## Scope

1. **Course C3, from vl05** (new Kern sections after c03.s12, before the Fundament blocks):
   c03.s13 Spur; c03.s14 Eigenwerte und Diagonalisierung (the formal eigenvalue definition that
   c03.s12 promises; spectral decomposition; the qubit example with the Hadamard matrix; the
   ellipse figure from `fig_vl05_diagonal`); c03.s15 Funktionen von Operatoren (functional
   calculus, e^{-itĤ/ħ}). One Vertiefung for hazard H3.3 (infinite dimension: a Hermitian
   operator without eigenvectors; the spectral theorem in its general form).
2. **Course C4, from vl06**, as above.
3. **Script chapter 5** (`vl05.tex`): the Kern of c03.s13-s15, condensed, hats on, no position
   basis. Sync table `docs/plan/script-v0.3/sync-ch5.md`, notes `NOTES-ch5.md`.
4. **Script chapter 6** (`vl06.tex`): the Kern of C4, condensed, hats on. `sync-ch6.md`,
   `NOTES-ch6.md`. The hat seam moves from chapter 4/5 to chapter 6/7 (the seam sentence in
   `vl04.tex` is updated).
5. Figures are stills first. Interactive demos for the new figures are a separate, later step
   if TJO wants them.

Budgets (guides): v0.2 vl05 1835 words, vl06 2153 words (`wc -w`), displays and examples no
more than v0.2; chapters 5+6 no more pages in the German master than today.

## Correctness hazards (docs/plan/research/curriculum/REPORT.md)

- H3.3 "every Hermitian operator is diagonalisable": finite dimension only.
- H3.2 states are density operators, not vectors (vl06 says so; keep it).
- H4.1 in infinite dimension the density operators are the normal states; singular states on
  B(H) exist (Bratteli-Robinson I).
- H4.3 Postulat 5: for unbounded Ĥ, symmetric is not enough; self-adjoint (Stone).
- H4.4 "observables are Hermitian operators" is the PVM special case.

## Process

- One author (the coordinator) writes. Codex gpt-6.1-sol xhigh: analytic checks of the new
  derivations, and one review per chapter. Muse Wonder Full: one student's-eye review at the end.
- Gates, scoped: registry, evidence (private), `check_levels --chapters c03,c04` lint and the
  German course builds, the c03/c04 web check, the German master. Not the full `./ci.sh`.
- Builds go to `build/lec56-*`, never the default output directories.
