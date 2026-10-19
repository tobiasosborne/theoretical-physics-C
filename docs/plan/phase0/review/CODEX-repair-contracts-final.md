# Phase 0a contracts repair wave

All twelve requested mechanical repairs are complete. All 26 targeted review probes now exit 1 with specific diagnostics. The whole red corpus caught 165 cases; two browser cases could not reach their checks because the sandbox denied Chromium launch. Existing content and ledger failures remain for their owners below. No commit, push or git mutation was performed.

The review reproducer was extracted exactly as instructed to `/tmp/tpc-contract-review/probe.py`. Its baseline output is `/tmp/tpc-contract-review/before.log`; repaired results are in `/tmp/tpc-contract-review/after.log` and the individual `*.result.json` files. Evidence probes were repeated after the final checker change. The reproducer driver continues after failures; the table reports each checker’s exit, not the driver’s exit.

## Repairs, in work-list order

1. **Numerical execution and attestation.** In `scripts/evidence/check_evidence.py`, `numeric_argv` requires direct invocation of the declared script with arguments; `run_numeric` executes an argument vector without a shell and checks finite output and exit status. `main` executes numerics by default in private mode. `write_receipt` records `numerics_results` per claim; `check_receipt` requires matching successful attestations in public mode. The review’s `true` and `echo 2` probes fail `[numerics] command must directly invoke the declared script`. New cases under `tests/red/evidence/`: `numerics-true`, `numerics-echo`, `numerics-default-execution`, `numerics-attestation-public`.

2. **Receipt dependencies.** `receipt_inputs` in the evidence checker hashes every referenced derivation file, numerical script and declared `numerics.inputs` file. `check_claims` rejects missing or escaping computation inputs. `evidence/schema/claims.schema.json` admits the optional input-path list. The derivation/script mutation probes fail `[receipt] stale receipt` naming the changed dependency. New evidence cases: `stale-derivation-public`, `stale-script-public`, `stale-input-public`.

3. **Integer with unit inside mathematical text.** `text_contexts` and `scan_tex` in the evidence checker retain text-group context inside mathematics. `$\text{300 K}$` fails `[number] underived number '300 K'`. New evidence case: `math-text-integer-unit`.

4. **Bound page-image reviews.** `evidence/schema/review.schema.json` retains `covers`, `method`, `notes` and the existing fields, and requires `bindings` entries containing `provenance_id`, `member_sha256` and `quote_sha256`. The quote hash is SHA256 of its exact UTF-8 bytes. `review_receipt_ok` compares those fields and the reviewer with the provenance row; `check_provenance_row` supplies that row. The forged review probe fails `[schema] missing required field 'bindings'`; independent red cases also exercise reviewer and quote-hash mismatches. New evidence cases: `review-missing-bindings`, `review-wrong-reviewer`, `review-wrong-quote-hash`. Existing reviewer receipts were not edited by this repair wave; their migration status is listed below.

5. **Build identity and binding.** `scripts/course/build_record.py:main` records `aux_sha256` alongside the log hash. `scripts/course/check_levels.py:read_build` validates job, language, edition, the ordered chapter list, requested flags, aux/log hashes, compiler-input master and injected chapter/content/flag definitions, output job and the token inventory’s presence in the source hashes. `main` accepts and forwards design flags. `c-master` fails `B0 build identity`, with additional specific identity/inventory findings. New cases under `tests/red/levels/`: `build-identity`, `build-aux-binding`, `build-log-binding`, `build-flags`, `build-chapters`, `build-master`, `build-token-inventory`. Their shared `build-identity/probe.py` also has a passing green control.

6. **Parity and recursive number lint.** `normalize_display` and `check_display` preserve the content of text groups; `check_builds` compares corresponding Kern label number fields across DE/EN. `scan` recursively checks both number arguments in their mathematical modes, including the upright unit. The probes fail `M1 display equation differs`, `K4 de/en: Kern label ...` and `L2 '\ref' inside mathematics`. New levels cases: `display-text-space`, `kern-language-number`, `num-deep-reference`. The review’s numbering fixture also lacks the newly required build binding; the new numbering red case uses valid bindings and isolates K4.

7. **Checker-owned contrast exemption and threshold messages.** `design/build_tokens.py:measure` exempts only `bath` and `stage-bath`; token metadata cannot exempt other essential graphics. It rejects waivers without a nonempty reason. `threshold_description`, `threshold_line` and `main` print threshold status and basis/locus in failures, waiver warnings and every run’s summary. No token value or threshold changed. `d-fill` fails `stroke-contrast dynamics/plate`; `d-waiver` fails `waiver ... needs a nonempty reason`. New cases under `tests/red/tokens/`: `fill-metadata-bypass`, `waiver-without-reason`. A reasoned-waiver green control still passes and prints the threshold’s status/locus.

8. **Literal lint and waiver reasons.** `design/lint_content.py:lint_file` scans declaration values for named CSS colours; `RULES_WEB` checks font shorthand and `RULES_TEX` checks literal named colour mixes. A line waiver requires `tpc-lint: allow(<reason>)`. Function-valued TypeScript properties are not CSS font shorthand; this avoids misclassifying the existing `font: (role) => ...` token accessor. The probes fail `named CSS colour`, `font shorthand literal`, `literal colour mix` and `lint waiver needs allow(<reason>)`. New token cases: `named-css-colour`, `font-shorthand`, `tikz-colour-mix`, `bare-lint-waiver`. Package-grid lengths were deliberately not implemented; the checker docstring and `docs/authoring/CONTRACT.md` state that limit.

9. **Static web resources.** `web/tools/checks/static.ts:cssUrls` scans URL/import syntax case-insensitively and decodes CSS escapes. The external-resource loop checks style attributes and rejects URL schemes/non-local script sources. The probes fail `external resource in <style>`, `external resource in style attribute` and `non-local script source`. New cases under `tests/red/web/`: `css-uppercase-url`, `css-style-attribute`, `data-script-source`.

10. **Red-runner attribution.** `scripts/check_red.py:validate_case` checks required keys, types, gate identity and regex validity/specificity. `main` honours both boolean exit expectations, fails absent requested gates, and reports unexpected Python tracebacks or “No such file” as `BROKEN`. Explicit `expect_traceback`/`expect_missing_file` fields support cases testing those failures. The probes now fail `NO CASE` or `BROKEN ... generic failure word alone`. New cases under `tests/red/red-runner/`: `no-cases`, `missing-key`, `empty-regex`, `generic-regex`, `exit-expectation`, `traceback`, `missing-file`. All evidence fixtures were regenerated through `scripts/evidence/make_red_corpus.py`; concurrent migration-checker changes were preserved. Existing web cases now invoke the same TypeScript entry points through `node --import`, avoiding the denied tsx CLI IPC socket. `h-cdn` asserts the new script-source diagnostic. Three existing C11 kernel cases select the relevant existing Vitest test, retaining their defect-specific regexes. The full-corpus result is reported below, including the browser exclusions.

11. **Both converter branches.** `web/tools/convert/parse.ts:Parser.inlineCs` validates the unused branch with a separate parser, preserving the rendered branch’s references, definitions and formula count. `web/tools/convert/mathconv.ts:textArg` validates both branch arguments before selection. `e-unselected` fails `\madeup is not in the contract`. New web cases: `unselected-language-branch`, `unselected-math-text-branch`. A valid unused mathematical branch passes and contributes no rendered formulas.

12. **Definition eligibility and absent verified sources.** `scripts/registry/check_registry.py:check_tex` rejects `\tpcdef` for status `proposed`. `check_quote` reports an absent verified member as `not verified in this run`; `main` defaults to private mode, where that is an error, with explicit `--public` reporting it without claiming verification. The probes fail `proposed definition` and `not verified in this run`. New cases under `tests/red/registry/`: `proposed-definition`, `absent-verified-quote`. Rendered-symbol collisions and first-use ordering remain open.

`docs/authoring/CONTRACT.md` and checker docstrings now distinguish mechanical checks from reviewer obligations, including the number lexer’s boundary, proof availability, claimless prose, registry history and runtime network independence.

## Review reproducer results

Run from the repository root: `python3 /tmp/tpc-contract-review/probe.py <probe arguments below>`.

| Probe | Before: checker exit | After: checker exit and specific diagnostic |
|---|---:|---|
| `a-true` | 0 | 1 — `[numerics] command must directly invoke the declared script` |
| `a-true-run` | 1 | 1 — `[numerics] command must directly invoke the declared script` |
| `a-echo-run` | 0 | 1 — `[numerics] command must directly invoke the declared script` |
| `a-receipt-derivation` | 0 | 1 — `[receipt] stale receipt: evidence/derivations/d.md changed` |
| `a-receipt-script` | 0 | 1 — `[receipt] stale receipt: numerics/check.py changed` |
| `a-num-text-unit` | 0 | 1 — `[number] underived number '300 K'` |
| `a-fake-review` | 0 | 1 — `[schema] missing required field 'bindings'` |
| `c-master` | 0 | 1 — `B0 build identity: job is 'unrelated', expected 'tpc-de-full'` |
| `c-text-parity` | 0 | 1 — `M1 display equation differs from EN` |
| `c-english-numbers` | 0 | 1 — `K4 de/en: Kern label 'c99.eq.core' is numbered '99.1' in DE and '99.17' in EN` |
| `c-num-ref` | 0 | 1 — `L2 '\ref' inside mathematics` |
| `d-fill` | 0 | 1 — `stroke-contrast dynamics/plate = 2.981, needs >= 3.0 (quoted; WCAG 2.2 SC 1.4.11)` |
| `d-waiver` | 0 | 1 — `waiver 'fabricated-waiver-0' needs a nonempty reason` |
| `d-lint-named` | 0 | 1 — `named CSS colour: red` |
| `d-lint-font` | 0 | 1 — `font shorthand literal: font: 12px Arial` |
| `d-lint-mix` | 0 | 1 — `literal colour mix: blue!50` |
| `d-lint-waiver` | 0 | 1 — `lint waiver needs allow(<reason>)` |
| `e-css-upper` | 0 | 1 — `external resource in <style>: https://example.org/x.png` |
| `e-css-attr` | 0 | 1 — `external resource in style attribute: https://example.org/x.png` |
| `e-data-script` | 0 | 1 — `non-local script source: data:text/javascript` |
| `f-empty` | 0 | 1 — `NO CASE gate 'tokens' has no red fixture` |
| `f-broad` | 0 | 1 — `BROKEN: expect_output_regex matches empty output or a generic failure word alone` |
| `f-error` | 0 | 1 — `BROKEN: expect_output_regex matches empty output or a generic failure word alone` |
| `e-unselected` | 0 | 1 — `\madeup is not in the contract` |
| `b-proposed` | 0 | 1 — `proposed definition: \tpcdef{D1} cannot transclude status 'proposed'` |
| `b-quote-missing` | 0 | 1 — `not verified in this run: verified quote source member is absent: fixture-book/notes.txt` |

`a-true-run` already failed before the repair for nonnumeric output; it now fails before execution because its declared script is unused. Receipt-preparation runs for both freshness probes pass with numerical execution. The deliberately excluded `d-lint-length` still exits 0; this is the documented package-grid limit, not a repaired probe.

## Existing failures, grouped by owner and cause

The following list covers every finding from the final requested gate runs. No affected content, registry row, ledger row or reviewer receipt was edited by this repair wave.

**C02 content/evidence owners — direct numerical invocation.** Both private and public evidence checks report the following at `evidence/claims.json`. These eleven existing commands do invoke the checker, then use shell redirection/composition and interpreter code to read the stored value. The new direct-script rule excludes this legitimate existing pattern as well as the review’s bypasses; no exception was added. Owners need a script/argument interface that emits the checked value.

```text
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

**C11 content and page-review owners — unlinked page-image reviews.** Both evidence modes report these `evidence/provenance.json` rows:

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
```

At the schema extension, every existing receipt below needed `bindings` added. The independent reviewer supplied those fields during this wave; at final inspection all ten have a binding entry. This repair wave did not edit them. The provenance rows still lack their reviewer/receipt links, causing the findings above.

| Existing review receipt | Covered provenance row | Final field status |
|---|---|---|
| `evidence/receipts/reviews/R-0050.json` | `P-0050` | Binding added independently by reviewer |
| `evidence/receipts/reviews/R-0051.json` | `P-0051` | Binding added independently by reviewer |
| `evidence/receipts/reviews/R-0052.json` | `P-0052` | Binding added independently by reviewer |
| `evidence/receipts/reviews/R-0053.json` | `P-0053` | Binding added independently by reviewer |
| `evidence/receipts/reviews/R-0054.json` | `P-0054` | Binding added independently by reviewer |
| `evidence/receipts/reviews/R-0055.json` | `P-0055` | Binding added independently by reviewer |
| `evidence/receipts/reviews/R-0056.json` | `P-0056` | Binding added independently by reviewer |
| `evidence/receipts/reviews/R-0057.json` | `P-0057` | Binding added independently by reviewer |
| `evidence/receipts/reviews/R-0058.json` | `P-0058` | Binding added independently by reviewer |
| `evidence/receipts/reviews/R-0059.json` | `P-0059` | Binding added independently by reviewer |

**C11 registry/content owners — proposed definition at use.** The registry gate reports:

```text
proposed definition: content/c11-wasserstoff/de.tex:577: \tpcdef{D64} cannot transclude a definition with status 'proposed'
proposed definition: content/c11-wasserstoff/en.tex:563: \tpcdef{D64} cannot transclude a definition with status 'proposed'
```

**Web owners — unexplained lint escapes.** The literal gate reports:

```text
web/src/demo/harness.ts:26: literal in content: lint waiver needs allow(<reason>): tpc-lint: allow
web/src/kernels/prob.ts:109: literal in content: lint waiver needs allow(<reason>): tpc-lint: allow
```

**Evidence receipt owner, with C02/C11 dependencies — absent numerical attestations.** Public mode reports at `evidence/receipts/private-check.json`, for every claim below: `numerical claim '<claim-id>' lacks a successful execution attestation`.

```text
c02.cl.level-b1
c02.cl.level-b2
c02.cl.level-s1
c02.cl.level-s2
c02.cl.level-q1
c02.cl.level-q2
c02.cl.level-p1
c02.cl.level-h1
c02.cl.level-c1
c02.cl.level-c2
c02.cl.level-c3
c11.cl.mu-ratio
c11.cl.wolke
c11.cl.winkel
c11.cl.amu
c11.cl.e1-mu
c11.cl.e1-me
c11.cl.lag0
c11.cl.lag1
c11.cl.lag2
c11.cl.y00
c11.cl.y10
c11.cl.y1pm
c11.cl.r10
c11.cl.r20
c11.cl.r21
c11.cl.psi100
c11.cl.psi200
c11.cl.psi210
c11.cl.psi21pm
c11.cl.y20
c11.cl.y2pm1
c11.cl.y2pm2
c11.cl.r30
c11.cl.r31
c11.cl.r32
c11.cl.psi300
c11.cl.psi310
c11.cl.psi31pm
c11.cl.psi320
c11.cl.psi32pm1
c11.cl.psi32pm2
c11.cl.orthonormal
c11.cl.cs
c11.cl.lyman
c11.cl.balmer
c11.cl.maximum
```

**Evidence receipt owner — stale input bindings.** Public mode reports the following at `evidence/receipts/private-check.json`. Each path names its affected input field; ledger and migration changes include other owners’ existing work as well as the new checker/schema/dependency bindings. Private mode still fails, so the checker did not replace the repository receipt with a passing attestation.

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

No other findings were reported by the requested registry, evidence, levels, token or literal runs. Levels lint and token checking pass. The private evidence run executed 36 numerical rows successfully and refused the eleven composed commands; it exited 1 without writing a new receipt.

## Final verification

`python3 scripts/check_red.py` ran the whole corpus, with unbuffered output enabled. Exit 1: 167 cases, 165 caught, two problems. Both remaining cases are **not verified**, not caught:

- `tests/red/web/d-block-count`
- `tests/red/web/d-link-into-closed-block`

Chromium failed before either C7 diagnostic with `sandbox_host_linux.cc:41 ... shutdown: Operation not permitted (1)`. Their defect-specific expectations remain unchanged. All Julia and kernel cases reached and matched their intended diagnostics, including `c11-render/golden-not-reproduced` and `radius-from-R2`.

Last lines:

```text
caught  tests/red/web/unselected-language-branch
caught  tests/red/web/unselected-math-text-branch

167 red case(s), 2 problem(s)
```

`python3 scripts/registry/check_registry.py` — exit 1; last lines:

```text
proposed definition: content/c11-wasserstoff/de.tex:577: \tpcdef{D64} cannot transclude a definition with status 'proposed'
proposed definition: content/c11-wasserstoff/en.tex:563: \tpcdef{D64} cannot transclude a definition with status 'proposed'
check_registry: 140 symbols, 74 definitions, 13 conventions, 52 translation rows, 10 content file(s); 2 error(s)
```

`python3 scripts/evidence/check_evidence.py --private` — exit 1; last lines:

```text
page-image quotes: 10 not machine-verified (scan hash and page range checked; the reading rests on the reviewer)
numerical checks: run 36, not run 11
gaps 26; migration records 12

FAILED: 21 finding(s)
```

`python3 scripts/evidence/check_evidence.py --public` — exit 1; last lines:

```text
page-image quotes: 10 not machine-verified (scan hash and page range checked; the reading rests on the reviewer)
numerical checks: run 0, not run 47 (public: receipt required)
gaps 26; migration records 12

FAILED: 106 finding(s)
```

`python3 scripts/course/check_levels.py --with-test-chapter --lint-only` — exit 0; last lines:

```text
check_levels: 5 chapter(s) [c00-theorie, c01-wahrscheinlichkeit, c02-gpt, c11-wasserstoff, c99-contract-test], lint only: 0 finding(s)
```

`python3 design/build_tokens.py --check` — exit 0; last lines:

```text
thresholds: text-contrast >= 4.5 (quoted; WCAG 2.2 SC 1.4.3 Contrast (Minimum), https://www.w3.org/TR/WCAG22/#contrast-minimum (not on disk); applied to large text too, which is a project choice); stroke-contrast >= 3.0 (quoted; WCAG 2.2 SC 1.4.11 Non-text Contrast, https://www.w3.org/TR/WCAG22/#non-text-contrast (not on disk); no exemption for thick strokes, which is a project choice); grey-gap >= 0.15 (unvalidated choice; OKLCH L gap proposed by the research lanes (PLAN S8) without validation); ladder-step >= 0.1 (unvalidated choice; OKLCH L step chosen by the tokens author); cvd-deutan, cvd-protan >= 0.1 (unvalidated choice; OKLab distance under simulated deutan/protan vision, chosen by the tokens author)
tokens: 5 package(s) x 2 ground(s), 1170 measurements, 0 failure(s), 0 waived, 0 stale file(s)
```

`python3 design/lint_content.py` — exit 1; last lines:

```text
web/src/demo/harness.ts:26: literal in content: lint waiver needs allow(<reason>): tpc-lint: allow
web/src/kernels/prob.ts:109: literal in content: lint waiver needs allow(<reason>): tpc-lint: allow
lint_content: 112 file(s), 2 literal(s)
```

Additional validation: Python syntax checks and `node web/node_modules/typescript/bin/tsc --noEmit -p web/tsconfig.json` passed. The evidence green base passes private/default execution and public attestation checks. The synthetic build, red-runner, reasoned-waiver, token-CSS and valid-unused-branch green controls pass. Logs are under `/tmp/tpc-contract-review/`.

## Deliberately not repaired

Quote entailment, derivation relevance, claimless prose, proof availability, page-image transcription authenticity, stipulation meaning and own-script authority remain reviewer/policy obligations under COORDINATION section 8. Package-grid lengths are not linted, as explicitly requested. Registry rendered-symbol collisions, first-use ordering, raw semantic-symbol ownership and historical body/status review invalidation remain open. Converter aux substitution and PDF authenticity/binding beyond the requested aux/log record checks were not expanded into this wave. Full browser/runtime independence could not be established in the sandbox; full `ci.sh` was not run or edited.

No gate was weakened to admit the existing failures. This wave stops after these repairs, red cases, reproducer proofs and verification.