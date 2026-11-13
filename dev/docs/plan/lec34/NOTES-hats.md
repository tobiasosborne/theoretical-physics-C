# NOTES-hats (lane H, 2026-10-29)

D-HAT applied in c11 and c02 with `\op{...}`. de.tex/en.tex changed in lockstep (same multiset of `\op` arguments, checked).

## Occurrences changed
| file | change | count (lines) |
|---|---|---|
| c11 de.tex / en.tex | `\HamTot`, `\HamCM`, `\HamRel`, `\Uni` -> `\op{\HamTot}` etc. | 27 / 27 lines |
| c11 figures | bereiche.tex (H_rel x4), ueberblick.tex (H_tot, H_cm, H_rel), zerlegung.tex (H_tot, U, H_cm, H_rel) -> `\op{H_{\mathrm{..}}}`, `\op{U}` | 3 files, 10 lines |
| c02 de.tex / en.tex | qubit density matrices `\rho` -> `\op{\rho}`; effect `\EffOp` -> `\op{\EffOp}`; trace-norm matrix `D` -> `\op{D}` | 24 / 24 lines (rho 16, EffOp 6, D 5 lines, overlapping) |
| c02 figures | none (only abstract GPT objects) | 0 |
| formulas.json, check_c11_formulas.py, scripts/c02 | none needed: gated rows are functions (Ylm, Rnl, psinlm, Lag), no operators | 0 |

No double hats: `\HamTot` etc. and `\EffOp`, `\Uni` are unhatted registry macros; only `\xop \pop \Lj \Lsq \Lpm \Sj \Jj \Nop \Field` carry a hat themselves and none is used in c02/c11.

## Judgement calls (no hat)
- `\Id` stays (D-HAT exception).
- `\Lap` (Laplacian, c11 text, Fundament block, D(-Lap)): differential expression / operator symbol Delta; hat on a Delta is not standard. Left unhatted. TJO to confirm. Related: sums such as `-\Lap + \Vpot`, `-\Lap + W` (c11 Fundament, "wesentlich selbstadjungiert") are operator expressions written without a hat; hatting would need `\op{-\Lap+\Vpot}`. Left, ask TJO.
- `\FT{\Phi}` (Fourier transform of a function): a function, not an operator.
- c11 radial equation `\Veff`, `\Vpot`, `u`, `\psi`, `\Phi`, `\Psi`: functions / multiplication potentials as numbers-valued functions. Left.
- c02 abstract GPT objects (states x, effects f, unit effect 1_K, `\EffAlg`, `\StSp`, affine functions): ordered-vector-space language, no hat. `f(r)=tr(rho F)` is a function: no hat.
- c02 Pauli matrices `\pauli{x}` = sigma_x: operators on C^2 but defined by registry macro `\pauli`; hatting needs a registry decision (see Requests). Left unhatted; the qubit equations therefore read `\op{\rho}(r) = 1/2 (Id + r.sigma)`.
- c02 tpcdef bodies (registry-inserted definitions, e.g. D2, D58) not touched (registry-owned).
- c11 captions/figure comments: only typeset labels changed, TeX comments left.

## Gates (build/lane-H)
- build_course c02,c11 all editions: ok (de-full 57 pp, de-kern 38, en-full 55; 0 errors, 0 undefined refs).
- check_levels: 0 findings.
- check_c11_formulas: 0 failures. make_faltung --check: up to date. lint_content: 0 literals.
- check_evidence --public: passed (no re-pin needed).
- check_registry: 4 errors, all in registry/notation.json (`mathml: ''` of symbols 147/148/...), registry/ is lane G's in-progress work, not from my files.
- web/check.sh: see final report / result appended below.

## Web (reported, not edited)
web/src/demos/c02.* and c11.* and kernels use only abstract GPT symbols (sym.state-space, effect-algebra, unit-effect) and densities/CDFs; no Hilbert-space operator labels found. Nothing inconsistent. c11.demo.cloud.ts uses sigma = Gaussian width, rho_e = electron density (functions): no hat.

## Requests
1. Lane G: decide `\pauli{#1}` (sigma_#1): hatted (`\widehat{\sigma}_{#1}`) or not; then c02 qubit section and c03 follow. Likewise decide whether `\HamTot/\HamCM/\HamRel/\Ham/\Uni/\EffOp/\rhoop` macros should themselves carry the hat (then `\op{..}` wrappers in c11/c02 must go to avoid double hats). Currently the registry notes `\rhoop`/`\Hop` as legacy-hatted.
2. TJO: Laplacian and `-\Lap+\Vpot` expressions (see above).

## Revision (TJO D-HAT revised, 2026-10-29)
States and Pauli matrices get NO hat; identity too. Effects, Hamiltonians, unitaries, trace-norm matrix D keep the hat.
- c02 de/en: all `\op{\rho}` reverted to `\rho` (16 lines each); de/en still identical in `\op` arguments (EffOp, D). c11: no hatted states (checked: no `\op{\rho}`, `\op{\psi}`, `\op{\Psi}`).
- Registry (lane G finished, so edited here): `registry/conventions.json` CONV-HAT statement_de/en and notes now list the exceptions identity, states, Pauli matrices (TJO 2026-10-29); `notation.json` sym.operator-hat notes revised likewise, sym.density-operator legacy `\rhoop` note corrected ("obsolete, states carry no hat"), sym.pauli-matrix got a note. sym.hamiltonian note already said hat at point of use. Regenerated with gen_registry.py.
- Earlier Requests 1 and 2 are settled by the coordinator (wrappers stay, Laplacian bare, Pauli bare).
- Gates after revision: check_registry 0 errors (the earlier 4 errors are gone); check_red --gate registry: 18 cases, 0 problems.
- After revision: course build ok, check_levels 0, lint_content 0, formulas 0 failures, web/check.sh --fast ok.

## Fourth exception: ket-bras (TJO 2026-10-29)
CONV-HAT (statements, notes), sym.operator-hat notes, sym.ketbra notes and D94 notes record: no hat on |a><b|. D94 body and the \ketbra expansion carry no hat. check_registry 0 errors; check_red --gate registry 18 cases, 0 problems. Grep of c02, c03, c11 for hatted ket-bras: none found.
