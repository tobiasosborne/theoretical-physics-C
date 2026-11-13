# NOTES-ch6: script chapter 6 (vl06), German, 2026-11-04

Brief: `docs/plan/lec56/BRIEF.md`. Sync table: `sync-ch6.md`. English (`lec06.tex`) follows later.

## What changed
- Chapter 6 is the condensed Kern of the new chapter C4. The five boxed postulates of v0.2 are
  replaced by TJO's P1-P5 (docs/plan/BRIEF.md:51-55), P0 inline. **The German wording of P0-P5
  is a translation by the chapter author, not TJO's** (same text as content/c04 and the ledger
  `statement_de`; GAP-TJO).
- New, from the course: positive normalised functionals = density operators (proof idea in one
  sentence), pure states = rank-one projectors as extreme points, "Dual des Zustandsraums"
  explained, the efficiency detector as a measurement that is not projection-valued, PVM ↔
  Hermitian operator, unitary dynamics preserves states and detectors.
- The U_t computation for H = εσ_x moved to chapter 5; here the measurement (cos² formula) and the
  figure. Figure fig_vl06_messung: time axis εt/ħ, hats on F and U_t.
- Review corrections (codex REVIEW-lec6 MAJOR 1-3): the closed-systems sentence made precise; the
  reversible dynamics stated as that of a closed system with time-independent H (relative time
  is an assumption); the efficiency detector never fires on |1⟩.

## Budgets (guides)
- Words: 1866 after the muse repairs (v0.2: 2153). Displays: 8 (v0.2: 19). Examples: 3 (v0.2: 4). Definitions: 1
  (Dichteoperator) plus the four postulate boxes. Pages: not measured yet (no TeX).

## Migration records
M-0069 (P5 Hermiticity / self-adjointness), M-0070 (energy unit), M-0071 (typos), M-0072 (H4.1).

## For TJO
1. The German wording of P0-P5 (yours to write).
2. The closed-systems sentence was sharpened after review: your v0.2 text said "Reine Zustände
   beschreiben geschlossene Systeme, und die gibt es in der Physik nicht"; the reviewer objected
   that a closed system can be mixed and an interacting one need not be. New: "Ein System, das mit
   seiner Umgebung wechselwirkt, ist im Allgemeinen nicht in einem reinen Zustand, und völlig
   isolierte Systeme gibt es in der Physik nicht ...".
3. "Observable" for the family F(S) (v0.2) is not used; open gap G-0074.
4. Whether the no-restriction hypothesis is part of P3 (G-0011) stays open.

## Reviews
- codex: `evidence/derivations/c04/REVIEW-lec6.md` (0 blocker, 3 major, 5 minor; all applied).
- muse: `MUSE-ch5-6.md`. Applied: glosses for "Norm 1", "Spurklassenfall", extreme points, λ in
  [0,1], phase equivalence, the |⟨φ|ψ⟩|² form of the Born rule, "Z" from σ_z, diagonal entries as
  probabilities only in the measured basis, x as outcome vs index, POVM spelled out, 0 < q < 1,
  P5 marked as a postulate and "Dynamik sind Symmetrien" glossed, trace and both inequalities for
  UρU^†, the factor 2 in 2εt/ħ, no state-update rule in P0-P5.
- For TJO (your voice, not changed): muse objects to "Klassisch ist eine Wahrscheinlichkeit stets
  Ausdruck fehlender Information" (mixtures are preparation ignorance in QM too) and to "das
  elektromagnetische Feld koppelt immer an" as an empirical fact (neutral particles). Also
  suggested, not applied for length: one coherence example where the off-diagonal x matters
  (detector |φ_0⟩⟨φ_0|).
