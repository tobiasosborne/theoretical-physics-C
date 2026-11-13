<!-- ROLE: lane D notes for the demo c03.demo.spektren, 2026-10-29. UPDATE POLICY: lane D (demo) writes; coordinator reads. -->

# Notes: demo `c03.demo.spektren`

## What it does

The still `c03.fig.spektren` is the fallback. The demo has two panels.

- **(a) Complex plane.** The four loci of `c03.eq.orte` are drawn as in the still: the real axis
  solid (q1), the half-axis a broad strip (q2), the points 0 and 1 filled dots (q3), the unit
  circle dashed (q4). A locus is drawn strong when the current operator Ô is in its class and
  faint otherwise. The eigenvalues are markers with their values next to them. The marker shapes
  follow the still (A discs, B rings, C diamonds), and the two ℂ² operators get squares and
  triangles; all markers use the `state` role. Small dots trace the eigenvalues over the whole
  range of the parameter, so the reader sees in advance where they will go.
- **(b) Tests.** The matrix of Ô with the current numbers, then one row per class: glyph (the
  locus mark in small, so the table is also the legend), name, the computed relation (`Ô† = Ô`
  or `Ô† ≠ Ô` and so on), "erfüllt" ja/nein, and "Eigenwerte am Ort" ja/nein (normal: "–").
- **Row hover or tap:** that row's locus is drawn thick, eigenvalues off it get a dashed ring,
  and the line below gives the numbers behind the test. For the algebraic tests that is the
  largest modulus of an entry of Ô†−Ô, Ô²−Ô, Ô†Ô−𝕀, ÔÔ†−𝕀 or Ô†Ô−ÔÔ†. For positivity it is the
  smallest ⟨ψ|Ôψ⟩ over ‖ψ‖ = 1 together with the ψ that attains it, or, for a non-Hermitian Ô, a
  ψ with ⟨ψ|Ôψ⟩ not real.
- **Eigenvalue hover or tap:** an eigenvector with Ô|v⟩ = λ|v⟩, the informal definition of
  c03.s12.
- **Caption below the stage**, generated from the computed state, with three kinds of sentence:
  "in the class, so on the locus: …"; "not in the class, because an eigenvalue lies off its
  locus: …"; "all eigenvalues on the locus, but not in the class: … The locus is only a
  necessary condition."
- **Controls:** Play sweeps the parameter back and forth, there is one operator choice
  (MathML buttons), and one slider (primary, so the arrow keys work).
- **Layout:** side by side on desktop, stacked below 600 px. The stacked stage computes its
  height from the measured blocks. The plane window is chosen per operator (from that
  operator's trail plus the unit circle) inside a box of fixed size, so the table and the stage
  height do not jump when the operator changes.

## Operators (kernel `SPEKTREN`, each parameter on [min, min+2] in steps of 0.01)

| Key | Ô | Range, default | Classes (verified over every grid point in vitest) | Eigenvalues |
|---|---|---|---|---|
| A | Â + s𝕀 (ℂ³) | s ∈ [−0.3, 1.7], 0 | Hermitian and normal always; positive iff s ≥ 1.42 (s ≥ √2); never projector or unitary | s−√2, s, s+√2 |
| B | s B̂ (ℂ³) | s ∈ [−0.5, 1.5], 1 | Hermitian and normal always; positive iff s ≥ 0; projector iff s ∈ {0, 1} | 0, 0, s |
| C | r Ĉ (ℂ³) | r ∈ [0, 2], 1 | normal always; unitary iff r = 1; r = 0 is the zero operator (Hermitian, positive, projector) | r·{e^{−iπ/6}, i, e^{7iπ/6}} |
| M | \|0⟩⟨1\| + t\|1⟩⟨0\| (ℂ²) | t ∈ [−1, 1], 0.25 | Hermitian iff t = 1; unitary and normal iff t = ±1; otherwise in no class | ±√t (real for t > 0 although not Hermitian), ±i√−t |
| Q | \|0⟩⟨0\| + t\|0⟩⟨1\| (ℂ²) | t ∈ [0, 2], 1 | Hermitian, positive, projector and normal only at t = 0; Q² = Q for every t | 0, 1 for every t |

The default state is A with s = 0, the operator of the still. Vitest checks that A, B, C at
their chapter values give the still's numbers, that the strings of `spektren.tex` are there,
that the positivity witness at s = 0 is the chapter's ψ = (1/2, −1/√2, 1/2) with ⟨ψ|Âψ⟩ = −√2
(c03.eq.nicht-positiv), and that the eigenvectors named in c03.s12 are eigenvectors and parallel
to the kernel's.

M and Q carry the "do not overclaim" points of the brief. For M, eigenvalues can be real
without the operator being Hermitian. For Q, eigenvalues can sit on the projector locus
without the operator being a projector. The sweep test asserts both halves: no grid point has
an operator in a class with an eigenvalue off that class's locus (c03.eq.orte), and some grid
points have every eigenvalue on a locus while the operator is not in the class.

## Mathematical honesty and choices

- **Positivity** is tested by its definition, through the minimum of ⟨ψ|Ôψ⟩ over unit ψ. For
  that the kernel uses Re⟨ψ|Ôψ⟩ = ⟨ψ|Hψ⟩ with H = (Ô+Ô†)/2 and Im⟨ψ|Ôψ⟩ = ⟨ψ|Kψ⟩ with
  K = (Ô−Ô†)/(2i). The extremes are found by Jacobi rotations on the real 2n×2n form, a code
  path separate from the eigenvalue solver. The ψ the demo shows is checked by evaluating
  ⟨ψ|Ôψ⟩ directly. The demo never says "eigenvalues ≥ 0 ⇒ positive" (spectral theorem, not in
  the chapter).
- **Unitary** is tested as both Ô†Ô = 𝕀 and ÔÔ† = 𝕀 (D91). In finite dimension one implies the
  other (c03.prop.isometrie), and the table shows Ô†Ô = 𝕀 as in c03.eq.orte.
- **Projector** means D89 (Ô² = Ô† = Ô), so the oblique Q is not a projector. The row shows both
  halves (`Ô² = Ô, Ô† ≠ Ô`).
- **Eigenvalues** (changed after the review, finding 3) come from the shifted QR algorithm on
  the matrix itself: Hessenberg form by Givens rotations, Wilkinson shifts and deflation. It is
  backward stable. Close but distinct eigenvalues stay apart: diag(0, 1e-6, 1) gives exactly 0,
  1e-6, 1, where the first version gave 5e-7 twice. Repeated eigenvalues (B, M(0), the zero
  operator) come out repeated, exactly so for triangular matrices. The characteristic
  polynomial is no longer used: rounding its coefficients moves two eigenvalues a distance d
  apart by about eps/d (this was measured, 2e-10 for diag(1, 1 + 1e-6)). The display shows
  distinct values only (within LOCUS_TOL), as the chapter does ("B: 1, 0").
- **Tolerances:** a class residual counts as zero below `CLASS_TOL` = 1e-12 × scale; a point
  counts as on a locus within `LOCUS_TOL` = 1e-9. Slider values hit the special points exactly
  (r = 1, t = ±1, s = 0, 1), so equality is exact up to double rounding.
- The demo makes no claim about the converse of c03.eq.orte for normal operators.

## Golden (independent of the kernel)

`numerics/generate/hilbert_golden.jl`, new cases `spektren*` and `hermitianExtremes`:

- **Matrices:** typed again from c03.eq.abc in Complex{Rational{BigInt}}, at the exact binary
  value of the parameter.
- **Class residuals:** computed exactly; the modulus is taken in BigFloat.
- **Close eigenvalues** (`eigenvaluesExplicit`, six cases, among them diagonal, triangular and
  non-normal, a rotated real symmetric and a complex Hermitian matrix, all with eigenvalues 1e-6
  apart). The reference takes the characteristic polynomial of the exact rational value of the
  double matrix and refines its roots by Newton steps at 512 bits. It is checked against LAPACK
  and the Leibniz determinant, and the roots must stay separated. Vitest also checks that
  repeated eigenvalues come out repeated and close ones stay distinct.
- **Eigenvalues:** closed forms derived by hand for each family. `selfcheck()` tests each one
  against the exact characteristic polynomial (Leibniz determinant in BigFloat,
  |p(λ)| < 1e-60) and against LAPACK (`LinearAlgebra.eigvals`, a standard library, within
  1e-6). A mutation test confirmed that the selfcheck catches a wrong closed form.
- **Hermitian extremes:** taken from the exact characteristic polynomial with real rational
  coefficients, solved by Viète's trigonometric formula. Its argument comes from the exact
  rational square, so double roots are not lost near acos(±1). They are checked against LAPACK
  and against matrices built by hand to have known eigenvalues.
- **Tolerance classes:** `residual` is abs 1e-14 (measured 4.4e-16). `eig` is abs 1e-13
  (measured 3.8e-14). Booleans for classes and loci are compared exactly.

## Review repairs (codex review `scratchpad/review-spektren/REVIEW.md`, six findings)

Status at wind-up (2026-10-29): all six are fixed, none is half done, and every gate was run
again afterwards. What stays open is listed at the end of this file.

1. **WRONG, positivity row without ‖ψ‖ = 1.** The cell now reads `min_{‖ψ‖=1} ⟨ψ|Ôψ⟩ = …` or
   `max_{‖ψ‖=1} |Im ⟨ψ|Ôψ⟩| = …`, in both languages.
2. **MISLEADING, "normal" listed under "in the class, so on its locus".** Location sentences
   are built from the four constrained classes only. A normal Ô gets its own sentence, in the
   chapter's words: "Ô ist normal; die Normalität allein schränkt die Eigenwerte nicht ein."
   A non-normal Ô gets "Ô ist nicht normal."
3. **NUMERICS, close roots merged.** The eigensolver is now QR (see above), with golden and
   vitest cases for close roots.
4. **MISMATCH, caption describes the still's panels.** The demo's panels no longer carry
   (a)/(b) labels. The caption (de and en, in parity) now begins "...; das Standbild hat zwei
   Teile." / "...; the still has two parts." It ends with one sentence on what the interactive
   version shows: loci and eigenvalues in one plane, for Â + s𝕀, sB̂, rĈ and two operators on
   ℂ², with a parameter to move and the computed class tests beside it. The prose before the
   figure ("hält in Teil (a) ... Teil (b)") is unchanged and refers to the figure, which the
   caption now names as the still.
5. **UX, keyboard.** The class names in the table and the eigenvalues (transparent targets
   over the markers) are focusable `role="button"` elements with an `aria-label` and
   `aria-pressed`. Focus shows the same readout as hover and announces it through the live
   region. Enter or Space pins it as a tap does, and stops propagation so that it does not
   toggle Play. Arrow keys still move the slider. The demo sets `role="group"` on its stage
   (the harness default `role="img"` would hide the controls from assistive technology); other
   demos are unaffected. The browser gate "keyboard control works" passes.
6. **UX, label overlap at small r.** Real-axis placement now uses the locus test
   (|Im λ| ≤ LOCUS_TOL). A collision pass pushes overlapping labels apart along their own
   direction, and values with |λ| < 0.1 get three decimals. At r = 0.01 the three labels are
   separate (screenshot `spektren-C001-*`). The range of rĈ still includes r = 0, untouched.

## Gates run (all pass)

```
julia --project=numerics numerics/generate/hilbert_golden.jl --check     ok, 434 lines byte for byte
cd web && npx vitest run tests/kernels/hilbert.test.ts                    437 passed
bash scripts/course/build_course.sh --chapters c03 --all-editions --out build/lane-demo   4 editions ok, 0 errors
python3 scripts/course/check_levels.py --chapters c03 --build build/lane-demo            0 findings
bash web/check.sh --chapters c03 --course-build build/lane-demo --out build/lane-demo-web  web: ok: 8 stage(s), browser gates included
python3 scripts/registry/check_registry.py                                0 errors
python3 scripts/check_parity.py; python3 evidence/migrations/check_vl04_map.py   ok (caption edit)
```
(After the review repairs every gate was run again with the same results.)

Screenshots are in `build/lane-demo-shots/` (script `shoot.mts`). They cover the chapter page,
DE and EN, light and dark, desktop 1280 and phone 390 (×2). States: the default A; M; Q (projector row pinned); B (positive row pinned); rĈ at
r = 0.01 (`C001`); A with the positive row focused from the keyboard (`Atab`); and rĈ at
r = 1.37 with an eigenvalue focused from the keyboard (`Ceig`). I looked at them: everything mounts, no console errors, and the plate
stays light on the dark ground as the design says.

## Open / for TJO or the coordinator

1. The Project.toml request is done: someone outside this lane updated the comment in
   `numerics/Project.toml` to name LinearAlgebra.
2. The label-collision pass is a heuristic: at r = 0.01 the three markers themselves still
   overlap, which is honest because they are 0.01 apart. A focus ring can partly cover a value
   label.
3. On the 620 px chapter column the plane is fairly small next to the table (most visibly for
   A, whose eigenvalues span from −1.7 to 3.1). It is readable; a wider figure measure would
   help if TJO wants it.
4. The family ranges are drawing choices (TJO may prefer others), especially A's
   s ∈ [−0.3, 1.7], where positivity only holds on [1.42, 1.7].
5. The zero operator at r = 0 in rĈ shows up as Hermitian, positive and a projector. That is
   true by D18/D20/D89 but might surprise a student. Narrow the range to r ≥ 0.1 if unwanted.
6. HANDOFF.md still lists the demo as "not built"; the coordinator should update it.
