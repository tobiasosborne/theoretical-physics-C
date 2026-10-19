Applied M-0001 and M-0002 to the German lecture first, then identically to the English lecture, on 2026-10-12. Only lines 85 and 94 changed in either lecture; a byte comparison against the original files confirms exactly the two recorded replacements. The Bohr-radius value and all wording are unchanged. M-0003, M-0004 and M-0005 remain `recorded` and are byte-for-byte unchanged. No commit or push was performed, and no Git command modified the tree; Git was used only to read historical payloads with `git show`.

Structure, Parity, Enrichment and Figures passed; both lecture builds passed; all 70 evidence red cases were caught. The applied migrations and both script snapshot keys have no findings. Contracts failed in four gates. The remaining public-receipt freshness failure includes this task’s intended metadata changes, so I cannot honestly describe every Contracts failure as unrelated. The details and remaining inconsistencies are recorded below.

Exact change at `latex/lectures/de/vl16.tex:85` and `latex/lectures/en/lec16.tex:85`. Both editions have the identical before/after line, including the original indentation and trailing alignment text.

Before:

```latex
		L_2^s(x) &= -\frac{x^2}{2}-(s+2)x + \frac{1}{2}(s+1)(s+2) \\
```

After:

```latex
		L_2^s(x) &= \frac{x^2}{2}-(s+2)x + \frac{1}{2}(s+1)(s+2) \\
```

Exact change at `latex/lectures/de/vl16.tex:94` and `latex/lectures/en/lec16.tex:94`. Both editions have the identical before/after line, including the original indentation and trailing alignment text.

Before:

```latex
	\psi_{21\pm1}(r,\theta,\phi) &= \frac{1}{8\sqrt{2\pi}}\left(\frac{Z}{a_0}\right)^{\frac{3}{2}}\frac{Zr}{a_0}e^{-\frac{Zr}{2a_0}}\sin(\theta)e^{\pm i\phi} &\quad & 2\text{p} \quad (m=\pm1). \\
```

After:

```latex
	\psi_{21\pm1}(r,\theta,\phi) &= \mp\frac{1}{8\sqrt{\pi}}\left(\frac{Z}{a_0}\right)^{\frac{3}{2}}\frac{Zr}{a_0}e^{-\frac{Zr}{2a_0}}\sin(\theta)e^{\pm i\phi} &\quad & 2\text{p} \quad (m=\pm1). \\
```

The corrected `\mp` pairs with the unchanged `\pm` in the exponent: the coefficient is negative for m = +1 and positive for m = -1. This agrees with `latex/lectures/de/vl14.tex:149`:

```latex
	\text{Y}^1_1(\theta,\phi) &= -\sqrt{\frac{3}{8\pi}}\sin(\theta)e^{i\phi}.
```

The lecture-16 `ENRICHMENT_EXCEPTIONS` reason now contains separate justifications for the Laguerre correction and the wavefunction correction, each citing `evidence/derivations/c11/DERIVATION.md` section 6 and its migration record. Its existing `math_edited` allowance changed from 1 to 3, retaining the earlier Unicode-minus exception. The two changes are also independently confirmed in `evidence/derivations/c11/REVIEW.md` section B4.

Independent SymPy verification follows. Here `lam = Z/a_0 > 0`; the norm integral includes the full spherical volume element. The polynomial uses the finite-sum convention in DERIVATION.md Result 3.1, with degree k = 2 and parameter s.

```python
import sympy as sp

x, s = sp.symbols('x s')
r, lam = sp.symbols('r lam', positive=True)
theta, phi = sp.symbols('theta phi', real=True)
L = x**2/2 - (s + 2)*x + (s + 1)*(s + 2)/2
finite_sum = sum((-1)**j*sp.binomial(s + 2, 2 - j)*x**j/sp.factorial(j)
                 for j in range(3))
residual = sp.expand(x*sp.diff(L, x, 2) + (s + 1 - x)*sp.diff(L, x) + 2*L)
difference = sp.simplify(sp.expand_func(L - finite_sum))
print('Laguerre equation residual:', residual)
print('Laguerre finite-sum difference:', difference)
assert residual == difference == 0
for m in (1, -1):
    psi = -m/(8*sp.sqrt(sp.pi))*lam**sp.Rational(3, 2)*(lam*r)*sp.exp(-lam*r/2)*sp.sin(theta)*sp.exp(m*sp.I*phi)
    density = sp.simplify(sp.conjugate(psi)*psi*r**2*sp.sin(theta))
    norm = sp.integrate(density, (r, 0, sp.oo), (theta, 0, sp.pi), (phi, 0, 2*sp.pi))
    print(f'psi_21,{m:+d} norm squared:', norm)
    assert norm == 1
```

Output:

```text
Laguerre equation residual: 0
Laguerre finite-sum difference: 0
psi_21,+1 norm squared: 1
psi_21,-1 norm squared: 1
```

The applied-migration mechanism preserves the historical record and validates the destination separately:

- `evidence/schema/migration.schema.json` accepts `status: "applied"`, defines `applied_date`, and defines the paired per-destination fields `applied_file_sha256` and `applied_source_key`. Its conditional schema requires an application date and at least one applied destination.
- M-0001 and M-0002 now have `status: "applied"` and `applied_date: "2026-10-12"`. Their German and English destinations name `tpc-script-v0.2.1` and the final file hashes. All original legacy fields—including `old_text`, `new_text`, line numbers and pre-change hashes—are preserved. The archived v0.1 destinations have no application fields and remain unchanged. Each record additionally cites the derivation and independent-review sections.
- The checker enforces the date and destination requirements explicitly because its local JSON Schema validator implements a subset of the standard. It verifies the old text and historical hash, then the current destination hash, membership in the named source, and `new_text` on the recorded destination line. A replacement occurring elsewhere in the file fails.
- Changes to `scripts/evidence/check_evidence.py` were local patches to Registry payload access, manifest/text-quote reads, migration checking and its call site. The file was re-read immediately before each edit; it was never rewritten wholesale. Concurrent repairs elsewhere in that file were preserved.

The original snapshot remains `tpc-script-v0.2`, at commit `88996cf14ba45e2c89474d2896f76711ea3d959d`. Its two superseded lecture members now have distinct manifest names:

```text
tpc-script-v0.2/git/latex/lectures/de/vl16.tex
tpc-script-v0.2/git/latex/lectures/en/lec16.tex
```

`retrieval.git_members` in its source.json maps those manifest names to the original repository paths. The checker reads them using `git show <recorded-commit>:<repository-path>` and verifies their original hashes; no historical payload files were materialised. The other snapshot members, hashes and metadata retain their previous meaning. Historical migration checks can resolve an old file/hash pair to these registered Git members, so M-0004 still verifies against its original lecture-16 payload without applying its Bohr-radius correction.

The partial successor `tpc-script-v0.2.1` registers only the two corrected working-tree files, with its own source.json and rights.json. Its metadata identifies the parent commit without claiming a new commit exists. In MANIFEST.sha256, each affected old entry became a historical entry plus a current entry; all other manifest lines are unchanged. The resulting hashes are:

| Edition | Historical SHA-256 | Applied SHA-256 |
|---|---|---|
| German | `ee5a38ebbc2b30ba85fd76ba198131b6a7cfdab2835ba25e352861e123b7128c` | `cc8ff7310b9a50105ffd55b6a46edc8c4187e9b592cc8ad2ad9a64016993afb1` |
| English | `314189855e5cb713dbf5f8ecc21a010adb1b5ecd1dafe1e97281271f6d531a8d` | `06a697435e0f8e37bdbd8275ea5c02a9334094776bf3958b763f9b3fb8d34d77` |

Registry citations to the affected lecture members were repointed from `tpc-script-v0.2` to `tpc-script-v0.2.1`. Their quoted lines are unchanged by the formula corrections. This keeps them readable and verified by the existing registry checker, which reads working-tree member files and does not resolve historical Git payloads. Exactly 44 source-key fields changed across 35 rows; every other row field, quote, locus and meaning is unchanged. The rows are:

`registry/notation.json` (all loci below refer to `lectures/de/vl16.tex`):

```text
sym.hbar: 57
sym.orbital-quantum-number: 78
sym.magnetic-quantum-number: 78
sym.principal-quantum-number: 55
sym.laguerre: 45
sym.bohr-radius: 57
sym.rydberg-energy: 53
sym.reduced-mass: 29
sym.electron-mass: 29
sym.proton-mass: 29
sym.radial-coordinate: 22
sym.nuclear-charge: 22
sym.elementary-charge: 22
sym.vacuum-permittivity: 22
sym.potential: 22
sym.radial-function: 45
sym.hydrogen-eigenfunction: 76
sym.energy-level: 53
sym.effective-potential: 12
```

`registry/definitions.json` (all loci below refer to `lectures/de/vl16.tex`):

```text
D60: 22
D62: 29
D63: origin 57; PLAN.md section 1.3; 57
D64: origin 53 at n = 1, Z = 1; 53
D65: origin 55, 78; 55; 78; 78
D66: origin 45-49; 45; 49
D68: 83-84
D69: origin 76; PLAN.md section 1.3; 76
D71: 12
```

`registry/conventions.json` (all loci below refer to `lectures/de/vl16.tex`):

```text
CONV-UNITS: 57
CONV-A0: 57
CONV-LAGUERRE: 45; 83-84
```

`registry/translation.json` (all loci below refer to `lectures/de/vl16.tex`):

```text
TR-TPC-08: 29
TR-TPC-12: 57
TR-TPC-13: 45
TR-TPC-15: 35
```

`evidence/provenance.json` required no repoint and was not edited: no provenance member cites either changed lecture file. P-0011 mentions these files in its `supports` description but cites the unchanged CODATA member; its meaning and hash are unaffected. `python3 scripts/registry/gen_registry.py` regenerated the eight derived registry outputs. The registry gate ends with:

```text
check_registry: 140 symbols, 74 definitions, 13 conventions, 52 translation rows, 10 content file(s); 0 error(s)
```

The generated red corpus now includes `migration-applied-text-moved`: the applied record has a valid date, source membership and hashes, but its new text is on line 3 while the destination is line 2. The checker rejects it specifically for the misplaced new text. The prior `migration-applied-status` case was necessarily updated to test missing application details, since `applied` is now supported. Regeneration also refreshed nine fixture receipts binding the checker/schema hashes. It did not refresh the repository’s private receipt.

Every repository file touched by this task is listed here, including generated outputs. Scratch scripts and logs are under `/tmp/vl16-migration` and are not repository changes.

```text
latex/lectures/de/vl16.tex
latex/lectures/en/lec16.tex
scripts/check_enrichment.py
evidence/migrations/M-0001.json
evidence/migrations/M-0002.json
evidence/schema/migration.schema.json
scripts/evidence/check_evidence.py
scripts/evidence/make_red_corpus.py
sources/tpc-script-v0.2/source.json
sources/tpc-script-v0.2.1/source.json
sources/tpc-script-v0.2.1/rights.json
sources/MANIFEST.sha256
registry/notation.json
registry/definitions.json
registry/conventions.json
registry/translation.json
docs/plan/phase0/review/REPORT-migration-vl16.md
```

Regenerated registry files:

```text
registry/generated/tpc-notation.sty
registry/generated/tpc-definitions.tex
registry/generated/notation.web.json
registry/generated/definitions.web.json
registry/generated/NOTATION.md
registry/generated/DEFINITIONS.md
registry/generated/TRANSLATION.md
registry/COLLISIONS.md
```

Existing generated red-fixture files changed by regeneration:

```text
tests/red/evidence/_base/evidence/receipts/private-check.json
tests/red/evidence/failed-receipt-public/evidence/receipts/private-check.json
tests/red/evidence/migration-applied-status/case.json
tests/red/evidence/numerics-attestation-public/evidence/receipts/private-check.json
tests/red/evidence/public-tracked-quote-altered/evidence/receipts/private-check.json
tests/red/evidence/stale-derivation-public/evidence/receipts/private-check.json
tests/red/evidence/stale-input-public/evidence/receipts/private-check.json
tests/red/evidence/stale-receipt-manifest-public/evidence/receipts/private-check.json
tests/red/evidence/stale-receipt-public/evidence/receipts/private-check.json
tests/red/evidence/stale-script-public/evidence/receipts/private-check.json
```

New case: all of the following files were created under `tests/red/evidence/migration-applied-text-moved/`:

```text
case.json
content/c98-red/de.tex
content/c98-red/en.tex
evidence/claims.json
evidence/derivations/d.md
evidence/gaps.json
evidence/migrations/M-0001.json
evidence/provenance.json
evidence/receipts/reviews/R-0001.json
legacy/old.tex
numerics/check.py
numerics/input.txt
registry/definitions.json
sources/MANIFEST.sha256
sources/fake-brief/brief.md
sources/fake-brief/rights.json
sources/fake-brief/source.json
sources/fake-notes/notes.txt
sources/fake-notes/rights.json
sources/fake-notes/source.json
sources/fake-scan/rights.json
sources/fake-scan/scan.bin
sources/fake-scan/scan.txt
sources/fake-scan/source.json
sources/fake-script/rights.json
sources/fake-script/source.json
```

Requested gate results follow. ANSI colour escapes have been removed from the captured output.

`./ci.sh --fast` — exit 1. The four required stages passed:

```text
✓ structure consistent
✓ editions in parity
✓ v0.1 content preserved
✓ all 22 figure(s) compile
✓ figures included and language-switched
```

Last lines:

```text
      web: FAILED: 5 of 7 stage(s)
  red corpus: tokens                 ok   13 red case(s), 0 problem(s)
  red corpus: registry               ok   14 red case(s), 0 problem(s)
  red corpus: evidence               ok   70 red case(s), 0 problem(s)
✗ 4 contract gate(s) failed

══════════════════════════════════════════════════════════
CI FAILED — 1 of 5 stage(s) failed
```

`bash scripts/check_lecture.sh 16 de` — exit 0; final line:

```text
ok    vl16.tex: 3 page(s)
```

`bash scripts/check_lecture.sh 16 en` — exit 0; final line:

```text
ok    lec16.tex: 3 page(s)
```

`python3 scripts/evidence/check_evidence.py --private` — exit 1 due to 21 findings outside the migration/snapshot changes. There is no migration, manifest, source-registry or quote finding on M-0001, M-0002, `tpc-script-v0.2` or `tpc-script-v0.2.1`. Last lines:

```text
sources 14; manifest entries hashed 144, skipped (private payload, public mode) 0
claims 230 (source-quoted 19, source-backed 24, derived 119, numerically-checked 47, author-stipulated 21); awaiting content 6; chapters with content: c00 c01 c02 c11 c99
provenance rows 138: text quotes verified 128, text quotes skipped (private payload, public mode) 0
page-image quotes: 10 not machine-verified (scan hash and page range checked; the reading rests on the reviewer)
numerical checks: run 36, not run 11
gaps 26; migration records 12

FAILED: 21 finding(s)
```

A separate invocation of the checker’s registry, manifest and migration functions confirms the complete snapshot/migration portion independently:

```text
Snapshot and migration checks: 144 manifest members, 12 migration records, 0 findings
```

`python3 scripts/check_red.py --gate evidence` — exit 0. Relevant caught cases and last lines:

```text
caught  tests/red/evidence/migration-applied-status
caught  tests/red/evidence/migration-applied-text-moved
caught  tests/red/evidence/unregistered-source-key
caught  tests/red/evidence/window-too-wide

70 red case(s), 0 problem(s)
```

The four failing Contracts gates and their actual failure locations are:

- Design-content lint: `web/src/demo/harness.ts:26` and `web/src/kernels/prob.ts:109` have incomplete lint-waiver reasons; `web/src/demo/tokens.ts:41` has a font shorthand literal. These files were not changed by this task.
- Private evidence: P-0050 through P-0059 lack the reviewer/receipt fields required by the concurrently repaired checker, and 11 C02 numerical commands use shell composition. Neither set concerns the lecture formulas, applied records or script snapshot bindings.
- Public evidence: the same 21 findings, 47 missing numerical execution attestations and 38 stale receipt inputs: 106 findings in total. This includes expected freshness failures for this task’s changed migrations, schema, checker and source records.
- Web build/static gates: `EPERM` when Node/tsx attempts to listen on `/tmp/tsx-1000/800.pipe`; the captured final stage failure is `pages: ids, links, external, demos`, and the nested web gate reports 5 of 7 stages failed. No web file was changed by this task.

The complete private-evidence failure lines are:

```text
FAIL [review] provenance.json:P-0050: a page-image quote is not machine-verifiable: it needs a reviewer and a review_receipt
FAIL [review] provenance.json:P-0051: a page-image quote is not machine-verifiable: it needs a reviewer and a review_receipt
FAIL [review] provenance.json:P-0052: a page-image quote is not machine-verifiable: it needs a reviewer and a review_receipt
FAIL [review] provenance.json:P-0053: a page-image quote is not machine-verifiable: it needs a reviewer and a review_receipt
FAIL [review] provenance.json:P-0054: a page-image quote is not machine-verifiable: it needs a reviewer and a review_receipt
FAIL [review] provenance.json:P-0055: a page-image quote is not machine-verifiable: it needs a reviewer and a review_receipt
FAIL [review] provenance.json:P-0056: a page-image quote is not machine-verifiable: it needs a reviewer and a review_receipt
FAIL [review] provenance.json:P-0057: a page-image quote is not machine-verifiable: it needs a reviewer and a review_receipt
FAIL [review] provenance.json:P-0058: a page-image quote is not machine-verifiable: it needs a reviewer and a review_receipt
FAIL [review] provenance.json:P-0059: a page-image quote is not machine-verifiable: it needs a reviewer and a review_receipt
FAIL [numerics] claims.json:c02.cl.level-b1: command must directly invoke the declared script 'evidence/derivations/c02/check_gpt.py' with arguments (no shell composition)
FAIL [numerics] claims.json:c02.cl.level-b2: command must directly invoke the declared script 'evidence/derivations/c02/check_gpt.py' with arguments (no shell composition)
FAIL [numerics] claims.json:c02.cl.level-s1: command must directly invoke the declared script 'evidence/derivations/c02/check_gpt.py' with arguments (no shell composition)
FAIL [numerics] claims.json:c02.cl.level-s2: command must directly invoke the declared script 'evidence/derivations/c02/check_gpt.py' with arguments (no shell composition)
FAIL [numerics] claims.json:c02.cl.level-q1: command must directly invoke the declared script 'evidence/derivations/c02/check_gpt.py' with arguments (no shell composition)
FAIL [numerics] claims.json:c02.cl.level-q2: command must directly invoke the declared script 'evidence/derivations/c02/check_gpt.py' with arguments (no shell composition)
FAIL [numerics] claims.json:c02.cl.level-p1: command must directly invoke the declared script 'evidence/derivations/c02/check_gpt.py' with arguments (no shell composition)
FAIL [numerics] claims.json:c02.cl.level-h1: command must directly invoke the declared script 'evidence/derivations/c02/check_gpt.py' with arguments (no shell composition)
FAIL [numerics] claims.json:c02.cl.level-c1: command must directly invoke the declared script 'evidence/derivations/c02/check_gpt.py' with arguments (no shell composition)
FAIL [numerics] claims.json:c02.cl.level-c2: command must directly invoke the declared script 'evidence/derivations/c02/check_gpt.py' with arguments (no shell composition)
FAIL [numerics] claims.json:c02.cl.level-c3: command must directly invoke the declared script 'evidence/derivations/c02/check_gpt.py' with arguments (no shell composition)
```

The public receipt’s stale-input lines are listed explicitly so the remaining freshness issue is reviewable:

```text
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: checker:scripts/evidence/check_evidence.py changed since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/c99-fixture/DERIVATION.md added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/claims.json changed since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/derivations/c01/DERIVATION.md added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/derivations/c02/ADDENDUM-chapter.md added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/derivations/c02/DERIVATION.md added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/derivations/c02/check_gpt.py added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/derivations/c11/DERIVATION.md added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/derivations/c11/REVIEW.md added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/gaps.json changed since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/migrations/M-0001.json changed since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/migrations/M-0002.json changed since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/migrations/M-0006.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/migrations/M-0007.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/migrations/M-0008.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/migrations/M-0009.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/migrations/M-0010.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/migrations/M-0011.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/migrations/M-0012.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/provenance.json changed since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/receipts/reviews/R-0050.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/receipts/reviews/R-0051.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/receipts/reviews/R-0052.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/receipts/reviews/R-0053.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/receipts/reviews/R-0054.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/receipts/reviews/R-0055.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/receipts/reviews/R-0056.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/receipts/reviews/R-0057.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/receipts/reviews/R-0058.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: evidence/receipts/reviews/R-0059.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: schema:claims.schema.json changed since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: schema:migration.schema.json changed since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: schema:review.schema.json changed since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: scripts/c11/c11_numerics.py added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: sources/MANIFEST.sha256 changed since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: sources/tpc-script-v0.2.1/rights.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: sources/tpc-script-v0.2.1/source.json added since the private check
FAIL [receipt] evidence/receipts/private-check.json: stale receipt: sources/tpc-script-v0.2/source.json changed since the private check
```

Remaining inconsistencies: the repository-wide private evidence gate is not green, so its public receipt cannot truthfully be regenerated as a passing attestation. The checker correctly leaves it stale; refreshing it requires a successful full private run after the separate review/numerical repairs. Therefore the requested assertion that none of the Contracts failures concerns this task’s changes is not satisfied for receipt freshness. The corrected formulas, historical and applied migration checks, and old/new snapshot hashes are consistent and verified. Existing registry diagnostic prose calling the inherited lines 85/94 defective was retained verbatim, as required by the source-key-only repoint: those are historical diagnoses of v0.2, not new verdicts on the corrected v0.2.1 formulas.
