# Independent Tier A review of Phase 0a contracts

**Verdict: the gates enforce substantial bookkeeping, but they do not make false or unsupported content fail mechanically.** There are enforcement holes beyond the semantic limitations that the evidence and registry docstrings acknowledge. The strongest defects are unexecuted numerical checks, incomplete receipt and build binding, incomplete number coverage, bypassable design rules, and a red runner that can accept unrelated failures.

Only this review file is retained as a repository edit. Fixtures, generated files, receipts and build outputs are under `/tmp/tpc-contract-review`. An import briefly created `scripts/course/__pycache__/check_levels.cpython-312.pyc`; that newly created file was removed, and the reproducer disables bytecode writes. Existing caches were left alone. No private evidence run or generator targeted the repository. No subagents were used.

The controlling requirements are COORDINATION.md's ground-truth rule, author-stipulation rule, protected-source rule, numbers rule, red-corpus contract and evidence vocabulary. GAP denotes an absent semantic or historical check, including an explicitly acknowledged limitation. OVERCLAIM denotes a stronger statement in the coordination/authoring documentation than the code supports. HOLE denotes an enforceable required check that can be bypassed. WRONG-REASON below identifies reviewer-planted red cases; I did not establish an existing corpus case accepted for the wrong reason.

## Findings, ordered by severity

The table's commands construct fresh fixtures and run the indicated checker. The executable fixture construction is embedded at the end of this file; extract it with this exact command, from the repository root:

```bash
python3 - <<'PY'
from pathlib import Path
s = Path('docs/plan/phase0/review/REVIEW-contracts.md').read_text()
p = Path('/tmp/tpc-contract-review/probe.py')
p.parent.mkdir(parents=True, exist_ok=True)
p.write_text(s.split('<!-- REPRODUCER-BEGIN -->\n```python\n', 1)[1].split('\n```\n<!-- REPRODUCER-END -->', 1)[0])
PY
```

Each row gives the file and line, exact reproduction, observed outcome and smallest repair. A pass means the named checker passed; it does not mean the full CI pipeline passed the fixture.

| Severity / class | File and line | Defect, exact reproduction and observed result | Smallest fix |
|---|---|---|---|
| High — HOLE | `scripts/evidence/check_evidence.py:621`, `scripts/evidence/check_evidence.py:915`, `ci.sh:271`, `ci.sh:273` | A `numerically-checked` ledger row can receive a passing private receipt without its computation running. `python3 /tmp/tpc-contract-review/probe.py a-true a-true-run a-echo-run`: `true` passes the default check; execution rejects it with `[numerics] ... its last output line is not a number`; `echo 2` passes even with execution, while the declared script is unused. CI never supplies `--run-numerics` to the evidence gate, and public mode ignores `numerics_run`. | Require successful execution before attesting a numerical row; require that attestation in public mode. Replace arbitrary shell commands with a checked script plus arguments, and bind its result/dependencies to the claim. Relevance of the computation still needs review. |
| High — HOLE | `scripts/evidence/check_evidence.py:892` | Receipt freshness omits referenced derivation files and numerical scripts. `python3 /tmp/tpc-contract-review/probe.py a-receipt-derivation a-receipt-script`: after a private pass, changing the derivation body while preserving its anchor, or replacing the computation with a crashing script, still passes public mode. | Add referenced derivations, scripts and declared computation inputs to `receipt_inputs`; invalidate the receipt on their changes. |
| High — HOLE | `scripts/course/check_levels.py:1024`, `scripts/course/check_levels.py:1037`, `scripts/course/check_levels.py:1050`; `scripts/course/build_record.py:58` | Build identity is not checked and aux bytes are not bound to the record. `python3 /tmp/tpc-contract-review/probe.py c-master`: records explicitly declaring another job/language/edition and logs naming an unrelated master pass when hashes and label census agree. Missing flags also omit the token directory from the hash inventory. | Validate required record fields, requested job/language/edition and flags; record and verify aux/PDF hashes and actual compiler input identity. Require a valid token inventory. This is record validation, not a demand for cryptographic authenticity of local builds. |
| High — HOLE | `design/lint_content.py:29`, `design/lint_content.py:39`, `design/lint_content.py:64` | The required token-only rule is bypassed by named CSS colours, CSS `font:` shorthand, TikZ colour mixes and package-grid lengths. `python3 /tmp/tpc-contract-review/probe.py d-lint-named d-lint-font d-lint-mix d-lint-length d-lint-waiver`: each passes. The last probe hides a hex literal with an unexplained `tpc-lint: allow` comment. | Check colour/font declarations and shorthand with a CSS parser; validate TikZ colour expressions and package-owned lengths. Replace arbitrary line suppression with a scoped exception record requiring a reason. Keep formula geometry distinct from design dimensions. |
| High — HOLE / OVERCLAIM | `design/build_tokens.py:325`, `design/build_tokens.py:326`; docstring at `design/build_tokens.py:41` | Essential graphics evade contrast checks by marking roles as fill. `python3 /tmp/tpc-contract-review/probe.py d-fill`: starts with the low-contrast dynamics red fixture, marks both dynamics roles `org.tpc.use=fill`, and passes without waivers. The code exempts every role declared fill; the docstring says only the bath fill is exempt. | Make exemption ownership explicit and immutable in the checker; exempt only the permitted bath fill, and check all essential stroke/boundary roles regardless of token metadata. Add a red case for misuse of `org.tpc.use`. |
| High — HOLE | `scripts/evidence/check_evidence.py:724`, `scripts/evidence/check_evidence.py:725` | An integer with a physical unit inside math-mode `\text{}` escapes the running-unit check. `python3 /tmp/tpc-contract-review/probe.py a-num-text-unit`: unsupported `$\text{300 K}$` passes because `textnum` is discarded whenever the scanner considers itself in mathematics. | Track `\text` groups as text contexts; apply the integer-with-unit rule there. Add a specific red case. |
| High — HOLE in static web gate | `web/tools/checks/static.ts:114`, `web/tools/checks/static.ts:141`, `web/tools/checks/static.ts:159` | Valid remote CSS resources evade the gate through uppercase `URL(...)` and HTML `style` attributes. `python3 /tmp/tpc-contract-review/probe.py e-css-upper e-css-attr`: both report that nothing loads from another host. | Parse CSS case-insensitively, including inline style attributes and escaped tokens. Retain browser request interception as an independent check. The full browser gate may catch these requests; this finding applies to static/fast checking. |
| High — HOLE in red coverage | `scripts/check_red.py:30`, `scripts/check_red.py:66`; `ci.sh:284` | An absent requested corpus is green unless `--require` is used. `python3 /tmp/tpc-contract-review/probe.py f-empty`: `--gate tokens` on an empty copied tree exits successfully and prints `0 red case(s), 0 problem(s)`. Fast CI requests selected gates without requiring their presence. | Fail when a requested gate has no cases; use `--require` in fast CI as well. |
| High — WRONG-REASON, reviewer-planted | `scripts/check_red.py:39`, `scripts/check_red.py:57`, `scripts/check_red.py:59` | A missing file or unrelated exception can count as a caught physics failure. `python3 /tmp/tpc-contract-review/probe.py f-broad f-error`: both print `caught` and pass. Their regexes are `.` and `error`; no relevant gate runs. The first case's `expect_exit_nonzero: false` is ignored. | Validate the complete case schema and require the documented boolean. Prefer structured checker failure codes plus fixture-specific loci; reject vacuous matchers. Require a repaired green control so that an unrelated environment failure cannot certify the planted defect. |
| Moderate — HOLE | `scripts/course/check_levels.py:754`, `scripts/course/check_levels.py:1058`, `scripts/course/check_levels.py:1092` | Display normalization drops meaningful spaces in `\text`, and numbering comparisons never cross languages. `python3 /tmp/tpc-contract-review/probe.py c-text-parity c-english-numbers`: changing `\text{ab}` to `\text{a b}` passes M1; DE and EN with different numbers pass K4 when each language's full/Kern pair agrees. The numbering probe uses correctly identified records and current source/token hashes. | Normalize mathematics while preserving text-mode content; compare corresponding Kern label numbers across DE and EN after each full/Kern comparison. |
| Moderate — HOLE in levels lint | `scripts/course/check_levels.py:586`, `scripts/course/check_levels.py:591`, `scripts/course/check_levels.py:594` | A plain reference inside a `\num` argument is consumed without recursive lint. `python3 /tmp/tpc-contract-review/probe.py c-num-ref`: a Kern `\num` whose unit contains a reference into Vertiefung passes levels lint. | Recursively lint value and unit arguments in their actual modes; reject references there if the contract forbids them. The converter rejects such a reference in mathematics, and a real Kern build may expose it as undefined; do not call this an all-pipeline bypass. |
| Moderate — OVERCLAIM / GAP | `docs/plan/phase0/COORDINATION.md:53`, `docs/authoring/CONTRACT.md:237`; `scripts/evidence/check_evidence.py:648`, `scripts/evidence/check_evidence.py:116` | The promise that every numeric value is mechanically supported is broader than the lexer. `python3 /tmp/tpc-contract-review/probe.py a-num-fraction a-num-words a-num-unit-macro a-num-figure a-num-json a-num-wrong-claim`: a fraction, number words, a differently set unit, figure/JSON values and a `\num` referring to the computation of another value all pass. | Document the exact mechanical boundary in the controlling contracts; extend scanning for supported physical-value syntax. Require typed value fields/claim IDs in figure data and metadata, and bind printed values to the supporting ledger value. Do not prohibit structural integers indiscriminately. |
| Moderate — GAP / OVERCLAIM | `docs/plan/phase0/COORDINATION.md:12`, `docs/authoring/CONTRACT.md:220`; `scripts/evidence/check_evidence.py:670`, `scripts/course/check_levels.py:491` | Claimless running physics prose has no gate. `python3 /tmp/tpc-contract-review/probe.py a-prose`: a false assertion about electron mass passes the evidence gate. Claim coverage is enforced for theorem-like units, not arbitrary prose, examples, proofs or remarks. | Establish explicit assertion units with claim IDs, or require a reviewed claim-coverage manifest for prose ranges. State this review obligation beside the broad ground-truth rule. |
| Moderate — GAP | `scripts/evidence/check_evidence.py:188`, `scripts/evidence/check_evidence.py:513`, `scripts/evidence/check_evidence.py:611`, `scripts/evidence/check_evidence.py:786` | Existence, lexical matching and evidence-status eligibility do not establish entailment. `python3 /tmp/tpc-contract-review/probe.py a-derived a-not a-whitespace a-window a-num-wrong-claim`: unrelated anchored material, a negated source context, collapsed formula boundaries, a generic quote window and an unrelated numeric claim ID pass. These are mostly admitted docstring limits. | Require independent semantic review bound to the exact claim, scope, derivation, quote context and printed value. Include formula boundaries and surrounding source context in the review artifact. |
| Moderate — GAP | `docs/plan/phase0/COORDINATION.md:23`; `scripts/evidence/check_evidence.py:603`, `scripts/evidence/check_evidence.py:426` | Stipulation meaning and page-review authenticity are unbound. `python3 /tmp/tpc-contract-review/probe.py a-stipulation a-fake-review`: a statement changes circle to square while quoting the unchanged fixture brief; a fabricated passing page review with a different reviewer from the provenance row passes. | Store the authorized source-language stipulation and approved translation/adaptation; compare or require reapproval on changes. Match reviewer identity and bind review coverage to row/member/quote hashes; keep reviewer-controlled attestations outside authors' editable authority. |
| Moderate — GAP, policy decision needed | `scripts/evidence/check_evidence.py:599`, `scripts/evidence/check_evidence.py:600` | Source-backed physics facts may cite the author's own script snapshot. `python3 /tmp/tpc-contract-review/probe.py a-own-script`: a physics claim backed by a registered `script-snapshot` passes; the only source-kind prohibition is `author-stipulation`. | Define which source classes are authoritative for new physics claims. If legacy snapshots are evidence of prior wording rather than authority, require an independent source/derivation for facts supported only by them. Ground-truth rule alone does not explicitly settle self-citation policy. |
| Moderate — GAP / OVERCLAIM | `docs/authoring/CONTRACT.md:152`, `docs/authoring/CONTRACT.md:223`; `scripts/course/check_levels.py:629` | Presentation is checked as a string, not against proof location or availability. `python3 /tmp/tpc-contract-review/probe.py c-proof c-words`: a Kern theorem marked `proof-included` with its only proof in Vertiefung passes; a Kern dependency on deeper material expressed in words also passes. | Add a proof ID/location and check its edition/depth availability; independently review prose dependencies. Clarify whether “proof-included” means the current edition or merely the full course. |
| Moderate — GAP / OVERCLAIM | `scripts/registry/check_registry.py:147`, `scripts/registry/check_registry.py:307`, `scripts/registry/reglib.py:543` | Removing a verified text source converts quote verification into a note; edited definition bodies retain verified/blessed status after regeneration. `python3 /tmp/tpc-contract-review/probe.py b-quote b-quote-missing b-body`: the present fabricated quote fails, the absent one passes, and a body edit without any review/version change passes after generation. | Bind registry verification to source and body hashes, using a fresh private receipt for absent public payloads. Invalidate verified status when body/meaning changes. Add a historical review/version check where immutability is promised. |
| Moderate — GAP | `scripts/registry/check_registry.py:204`, `scripts/registry/check_registry.py:274`, `scripts/registry/check_registry.py:407` | Semantic-symbol and definition eligibility checks are missing. `python3 /tmp/tpc-contract-review/probe.py b-raw b-same-render b-proposed b-late-fixed b-remark`: all pass. Raw `\alpha` remains allowed after a semantic macro owns it; distinct canonical tokens hide identical glyphs for different meanings; proposed definitions transclude; later fixation is accepted; prose restatement in a remark passes. | Check allow-list ownership before general allowance; compare normalized rendered glyphs and require collision records where meanings overlap; validate status at use and first-use ordering. Prose redefinition remains a review responsibility unless assertion/definition roles are explicit. |
| Low — OVERCLAIM in converter alone | `web/tools/convert/parse.ts:2`, `web/tools/convert/parse.ts:354`, `web/tools/convert/mathconv.ts:275` | The parser's “nothing is dropped” claim does not cover an unselected language branch. `python3 /tmp/tpc-contract-review/probe.py e-unselected`: each language file hides `\madeup` in the branch for the other language; parsing both files succeeds. | Validate both branches, then select the rendered branch. Levels/registry may independently reject that macro; this is a converter fail-closed defect, not a demonstrated full-CI escape. |
| Low — GAP in static web policy | `web/tools/checks/static.ts:73`, `web/tools/checks/static.ts:142`; `web/tools/checks/browser.ts:38` | `python3 /tmp/tpc-contract-review/probe.py e-data-script`: a `data:` script that attempts a remote fetch passes static checking. A data URL itself has no other host, so acceptance alone is not a violation of the host-only wording; remote execution is outside this static gate's coverage. | Decide whether scripts must be local bundled files; reject other script schemes if so. Keep request interception in full browser checks and document that fast checking cannot establish runtime network independence. |
| Low — MINOR / OVERCLAIM | `design/build_tokens.py:105`, `design/build_tokens.py:308`, `design/build_tokens.py:312`, `design/build_tokens.py:684` | Threshold provenance is not printed wherever a threshold appears. `python3 /tmp/tpc-contract-review/probe.py d-waiver`: waiver lines print thresholds without status/locus; the summary labels “quoted” but omits the standard's locus. Generation mode does not print that summary. Unexplained waivers are accepted and visibly warned, not hidden. | Format every threshold diagnostic from `THRESHOLDS`, including status and basis/locus; require waiver reason and authority. Preserve the honest distinction between a standard and an unvalidated choice. |

## Evidence probes

The fixture source and claim IDs come from `tests/red/evidence/_base`. Source-byte mutations update the copied manifest and source record, so quote probes are not accidentally failing a hash check. A private pass writes only the copied receipt.

| Requested planted class | Command argument to the embedded reproducer | Result |
|---|---|---|
| Derived claim, existing unrelated anchor | `a-derived` | Passed. Only file/anchor existence is checked. |
| Matching quote with preceding “not” outside its span | `a-not` | Passed. Context entailment is not checked. |
| Whitespace changes that collapse formula lines | `a-whitespace a-join-digits` | Replacing the formula newline with a space passed. Deleting the newline to join digits failed `[quote] quote not found`. The latter fixture uses a sufficiently long quote, avoiding a misleading minimum-length failure. This establishes normalization behavior, not correctness of the resulting mathematics. |
| Maximum quote window around generic phrase | `a-window a-we-have` | The generic `we have x.` in the permitted window passed. Literal `we have` failed `[schema] ... string shorter than 10`; this minimum length does not establish useful support. Window bound and minimum are measured from the executed checker/schema, not estimates. |
| Numerical command `true` | `a-true a-true-run a-echo-run` | Default passed; requested execution caught `true`; an output-only shell command passed requested execution. |
| Fraction, words, text, figure, caption, unit setting, integer/unit, JSON | `a-num-fraction a-num-words a-num-text a-num-text-unit a-num-figure a-num-caption a-num-unit-macro a-num-integer-unit a-num-json` | Fraction/words/figure/JSON/differently set unit and integer-unit inside `\text` passed. Decimal inside `\text`, decimal in caption, and running `300 K` failed `[number] underived number`. |
| `\num` with a claim about another value | `a-num-wrong-claim` | Passed. Eligibility is by evidence status; there is no value equality check. |
| Theorem claim from another chapter | `a-other-chapter` | Failed `[claim-mismatch] ... does not carry the chapter prefix`. |
| Altered stipulation statement | `a-stipulation` | Passed against an unchanged brief quote. This uses the fixture brief; semantic comparison against the actual TJO brief was not repeated. |
| Fabricated page review receipt | `a-fake-review` | Passed, including inconsistent reviewer names. |
| Source-backed physics claim citing own script class | `a-own-script` | Passed. Registered script snapshots are accepted source kinds. |
| Receipt from another ledger state | `a-receipt-ledger` | Failed `[receipt] stale receipt: evidence/claims.json changed since the private check`. A copied receipt is therefore not interchangeable across ledger bytes. |
| Physics assertion without a claim | `a-prose` | Passed. No prose-coverage gate exists. |

The “cannot establish” list at `scripts/evidence/check_evidence.py:122` accurately describes quote entailment/context, scope truth, page-image reading, derivation correctness, numerical relevance, stipulation interpretation, prose coverage, source-reference placement/locus, metadata truth and plain-file receipt authenticity. Those admitted limits explain most semantic passes. The omitted dependency hashes and unexecuted computations are additional defects; they are not merely inability to establish a proof's correctness. The docstring's numeral coverage is explicitly lexical, but the controlling coordination rule promises enforcement over content and ledgers more generally.

The quote-length rule does not enforce COORDINATION.md's protected-source requirement that a quote be one sentence or one formula: neither sentence count nor formula count is checked. The manifest checks current bytes against declared hashes, not an immutable earlier source state; changing payload, metadata and manifest together can redefine that baseline. Historical protected-path changes and missing migration records need a diff/history gate. This was established by code inspection; an actual protected-source/history mutation was not run.

## Registry and levels probes

All registry probes use the same small fixture with its original planted unknown macro removed. `b-generated` fails `stale generated file` after a hand edit. `b-header-only` fails after changing only displayed definition hashes: the gate regenerates expected files in memory and compares complete bytes. **I found no header-only bypass of the default registry staleness check.** `--no-generated` intentionally disables that check for fixtures and is not the CI invocation. Regeneration after a semantic input change is not itself a staleness bug; preservation of the old verification state is the missing review-invalidation check.

Identical rendering is not universally an error: disjoint contexts can deliberately overload a glyph. The problem is that collision detection uses author-supplied `canonical_token`, rather than rendering/context, so differently named tokens can evade collision accounting. `first_fixed_in` is checked only for resolution to a recognized chapter/definition; no first-use sequence is calculated. `b-late-fixed` fixes the symbol in `C21` while using it in `content/c02-probe/de.tex`; this passes despite the later fixation.

Levels results:

| Probe arguments | Result |
|---|---|
| `c-words c-proof` | Passed. Prose dependencies and proof availability are not established. |
| `c-macro-ref` | Failed K2 for the reference nested in `\emph`. |
| `c-num-ref` | Passed levels lint because the argument is skipped. |
| `c-figure-ref` | Failed K5, even for a figure file not used in the chapter. |
| `c-tag` | Failed L1 for `\tag`, including inside Vertiefung. |
| `c-master` | Passed inconsistent build identity and an unrelated master's log when the record binds that log. |
| `c-log-replace` | Failed B0 when log bytes changed without updating its record hash. |
| `c-aux-swap` | Failed CEN when full aux was copied into Kern and brought depth-only labels with it. |
| `c-english-numbers` | Passed different DE/EN numbers with agreeing full/Kern pairs and correctly identified records. |
| `c-text-parity` | Passed the meaningful whitespace change inside `\text`. |
| `c-cross-id` | Failed ID for a chapter-prefixed ID reused in another chapter. |
| `c-iffalse` | Failed L1 for `\iffalse` and `\fi`. |

K4 compares the **number field of every Kern label** against that language's full aux. Thus labelled equations, definitions/theorem-like units, figures, tables and headings are included; it is not restricted to equations. CEN checks the expected label census. Unlabelled counters, aux page fields, PDF page count equality and a comparison between languages are not included. Page counts are reported by C6, not gated. `latex/tpc-levels.sty:138` remaps equation, figure/table and registered unit counters in depth blocks; the checker verifies resulting labelled values rather than independently calculating those counters. DE and EN are both checked by default, but `--langs de` can intentionally restrict build checks. No claim of complete counter-state comparison is justified.

The build probes are synthetic record/aux fixtures, not claims that unrelated real PDFs rendered correctly. Actual build-based red cases for missing/empty/stale builds, a Kern reference into depth and different Kern numbering produced their intended diagnostics on the copied tree.

## Tokens, converter and web

`d-lint-oklch` failed `CSS colour function`; `d-stale` failed `stale ... differs from what the token files produce` after changing token JSON without rebuilding. Measurement thresholds are checker-owned, not mutable through token threshold fields. `d-waiver` passed with visible `WAIVED` warnings and `no reason given`. Therefore a contrast failure can be waived, but it was not silently hidden in the output. The exemption via `org.tpc.use=fill` is the separate, stronger bypass.

Unknown macros failed closed in tested mathematics (`e-math`), a square-root optional argument (`e-sqrt-optional`), a unit's optional title (`e-optional`), an item label (`e-item-optional`), a caption (`e-caption`) and a number value (`e-num-arg`). The unselected language branch (`e-unselected`) is a concrete exception to the parser's universal claim. These commands used Node's direct TypeScript loader because the `tsx` CLI's IPC listener was denied by the sandbox; it is the same parser/check code, not a substitute implementation.

`e-css-import` and `e-css-url` failed `external: FAIL ... external resource in <style>`. `e-css-upper` and `e-css-attr` passed valid remote-resource constructions. `e-data-script` passed; runtime fetching is outside static scanning and should be tested by the browser interception. `e-css-space` also passed, but whitespace between `url` and `(` is not established here as a valid loading CSS construct, so it is **not counted as a hole**.

Print numbers are read through `Parser.number` for display rows (`parse.ts:259`), headings (`parse.ts:524`), definitions (`parse.ts:535`), numbered units (`parse.ts:579`), depth blocks (`parse.ts:656`), figures (`parse.ts:739`), tables (`parse.ts:781`) and chapters (`parse.ts:843`). Numbered display rows are decorated from those values; unnumbered/starred displays intentionally have no number. I found no separate web equation recount for these kinds. `web/tools/convert/aux.ts:75` does check edition/language identity, unlike `check_levels.py`. However, that loader verifies recorded source hashes and label presence, not aux/log/PDF hashes; its assumption that the aux is from the validated build remains unbound. This latter observation is code inspection, not a full rendered-site substitution probe.

## Red corpus coverage and failure reasons

The following inventories use failure-code families extracted from the code and compare them with `expect_output_regex` in `tests/red/*/*/case.json`. Coverage means that at least one case specifically asserts the family's diagnostic; it does not mean every branch or semantic defect in that family is covered. The exact extraction command is:

```bash
python3 - <<'PY'
from pathlib import Path
import json, re
for gate, file, pattern in [
 ('evidence', 'scripts/evidence/check_evidence.py', r'fail\("([^"\n]+)"'),
 ('registry', 'scripts/registry/check_registry.py', r'rep.err\("([^"\n]+)"'),
 ('levels', 'scripts/course/check_levels.py', r'fail\("([^"\n]+)"')]:
 specs = [(p.parent.name, json.loads(p.read_text())) for p in Path('tests/red', gate).glob('*/case.json')]
 for code in sorted(set(re.findall(pattern, Path(file).read_text()))):
  needle = '\\[' + code + '\\]' if gate == 'evidence' else code + (' ' if gate == 'levels' else ':')
  print(gate, code, [name for name, spec in specs if needle in spec['expect_output_regex']])
PY
```

| Gate | Failure families with a specific red case | Failure families without a specific red case |
|---|---|---|
| Evidence | `schema`, `duplicate-id`, `evidence-status`, `unknown-claim`, `unused-claim`, `number`, `claim-mismatch`, `content`, `unit-without-claim`, `K3`, `srcref`, `no-provenance`, `link`, `unregistered-source`, `member`, `locus`, `quote`, `ocr`, `review`, `derivation`, `numerics`, `definition`, `migration`, `registry`, `manifest`, `receipt` | None at the diagnostic-family level. Missing semantic entailment, value binding, claimless prose, numerical execution policy, receipt dependency binding, forged reviews and alternate number syntax are not covered by those existing assertions. |
| Registry | `allow-list conflict`, `depth violation`, `duplicate definition`, `duplicate symbol`, `local macro definition`, `restated definition`, `stale generated file`, `token clash`, `unknown definition`, `unknown symbol`, `unregistered macro`, `unregistered source`, `unresolved`, `verified without locus` | `duplicate id`, `duplicate macro`, `legacy clash`, `mathml drift`, `quote not found`, `schema`, `seed coverage`, `undeclared symbol`, `unverified blessing`. Proposed use, rendering collisions, first-use order and body-review invalidation lack gates/cases. |
| Levels | `B0`, `C3`, `CL`, `ID`, `K1`, `K2`, `K4`, `K6`, `L1`, `SR` | `C1`, `C4`, `CEN`, `JS`, `K5`, `L2`, `M1`, `NU`, `PAR`. C6 is reporting, not a failure family. Identity, aux binding, language-number parity and proof availability lack targeted cases. |
| Token builder | `text-contrast`, `stroke-contrast`, `grey-gap`, `depth-label`, generated-file staleness | `ladder-step`, `cvd-deutan`, `cvd-protan`, unusable token inputs/no available packages, waiver validation and misuse of fill exemptions. |
| Literal lint | TeX colour definition/font selection, web hex colour | The other implemented literal rules have no specifically asserted case: model colour calls, model groups, font-name hits, numeric web colour, CSS functions and `font-family`/`fontFamily`. Named colours, shorthand fonts, TikZ mixes and package lengths are missing rules, not merely missing fixtures. |
| Converter / print numbering | Unknown/forbidden text construct, environment, control symbol, unregistered math macro; missing/stale print numbering | No specific red for unknown constructs inside optional arguments/captions, unselected branches, many structural/claim/asset/numbering branches, or aux substitution. The existing unregistered-math case runs the formula corpus, not every parser position. |
| Static web | `ids` order mismatch (`e-id-order`), `links` broken targets (`f-broken-link`), `external` CDN/style resources (`h-cdn`), `demos` unregistered declaration (`i-unregistered-demo`) | Duplicate/page-missing IDs, many resource/stylesheet branches, demo export/bundle presence, escaped/case-varied CSS and style attributes, empty page inventories, data-script policy. |
| Browser web | `c7` block census and closed-block links | `nav`, `corpus` rendering/font/spacing failures, `demos` mount/size/fallback/control failures, `standalone` presence/mount/determinism, and runtime resource/script errors have no specific browser red cases. |
| Additional chapter gates | `c11-formulas`: listed polynomial/sign/normalization/TeX/mismatch/unlisted-display defects. `c11-render`: golden reproduction, colour literal, harmonic sign, radial sampler and wavefunction normalization. `c02-game`: effect membership, score complement, solvability, optimum and colour literal. | Exhaustive internal branch coverage of these chapter-specific gates was outside this lighter contract review; see COULD NOT CHECK. |

Ran the existing cases on the copied tree with `python3 /tmp/tpc-contract-review/probe.py f-all` and inspected the matched diagnostic substrings. Evidence, registry, levels and token cases matched their intended diagnostics. The non-browser web parser/static cases also matched after invoking their TypeScript entry points directly with `node --import web/node_modules/tsx/dist/loader.mjs`; `g-golden-mismatch` matched through its normal test command. The initial CLI `EPERM` failures did **not** match those cases' specific regexes and therefore were not false catches.

The existing Julia golden-reproduction case failed for missing `sources/codata-2022/allascii.txt`, not its planted discrepancy, and its regex did not match. The radial-sampler case did not finish within the probe's subprocess bound; no result is claimed for that case. The browser red cases hit the launcher restriction before their intended checks. These are unsuccessful verifications, not existing wrong-reason passes. No existing corpus case was established as accepted for the wrong reason. The reviewer-created `f-broad` and `f-error` were accepted for demonstrably unrelated reasons.

The runner itself does not fail closed on malformed expectations: it does not validate `gate`, `what`, `expect_exit_nonzero` or regex specificity, uses shell commands, and tests only nonzero exit plus regex match. `--require` enforces the presence of case directories, not a working green command or correctly attributed failure. A specific matched message is better than a generic regex, but a repaired green control is still necessary to establish that the fixture isolates the intended defect.

## CI inclusion and skip behavior

`g-skips` and `g-crash` run the **unchanged Contracts function** extracted into the copied tree, with PATH wrappers that record scheduling and simulate one checker crash. They are control-flow probes, not claims that the real gates or all of `ci.sh` passed. Exact commands:

```bash
python3 /tmp/tpc-contract-review/probe.py g-skips g-crash g-node-missing g-julia-missing
```

The schedule passes while omitting private mode when the Reed–Simon scan is absent. It still calls public mode. That public substitution is documented and only meaningful with a fresh receipt; the receipt omissions above weaken it. The decision is based on that single scan's existence, not all private payloads.

A simulated checker crash causes the Contracts stage to fail. `run_gate` preserves nonzero status, and the `bad` accumulator propagates it; I found no Contracts-stage swallowing of checker crashes. Missing `node_modules` does not produce a silent skip: `web/check.sh:35` attempts `npm ci` and fails if installation fails; `g-node-missing` demonstrated this. The missing-Julia command fails; full CI also has an explicit Julia command in the golden-reproduction red case, whose specific regex does not accept a command-not-found error. Fast CI does not execute Julia, so absence of Julia cannot establish failure there.

Fast mode explicitly omits new-course PDF/K4 build checking, browser gates, and the levels/web/chapter red corpora. It still calls web conversion/build/static checking, which needs previously available print numbering; fast mode is not a source-only gate. `--parity` bypasses Contracts entirely by design (`ci.sh:304`). Neither mode should be described as all contracts having passed.

The following are not direct green CI commands:

- `python3 scripts/c11/check_c11_formulas.py` on actual chapter content. Its red fixtures run only in the full red corpus; they do not validate the current chapter's formulas.
- `julia --project=numerics numerics/test/runtests.jl` and `julia --project=numerics/gpt numerics/gpt/test/runtests.jl`.
- The Julia reference generators under `web/tests/golden/reference/`; web unit tests consume stored golden data.
- A dedicated Playwright gameplay/solution check. The included general browser gate checks demo mounting, a primary control and standalone behavior; it does not certify game scoring or completing a level. `rg --files scripts numerics web/tests | rg -i 'game|playwright|reference|runtests|check'` did not locate a separate gameplay checker in those paths. Its existence elsewhere was not established.

Python derivation `check_*.py --verify`, special-function conventions, stored web kernel golden tests, and the full generic browser gate **are** scheduled. Thus it would be wrong to report that numerical checking or browser checking is wholly absent; the omissions concern ledger commands, fresh Julia reference verification and game-specific behavior.

## What was sound, and COULD NOT CHECK

Sound in the executed scope: evidence schemas/status vocabulary, bidirectional provenance plumbing, foreign-chapter claim rejection, ordinary decimal/caption/unit number rejection, changed-ledger receipt rejection; registry full-byte generated-file comparison and present-file quote rejection; levels forbidden conditionals/tags, ordinary nested references, figure-reference ban, label prefix/census, changed-log rejection and the real build-based red diagnostics; token JSON staleness and ordinary OKLCH detection; converter failures in the tested math/optional/caption positions; ordinary inline CSS imports/URLs; and Contracts crash propagation/missing dependency errors. These are specific results, not a blanket certification.

COULD NOT CHECK:

- Actual commercial-book page-image contents or the authenticity of named human reviews. The gate explicitly delegates the reading to reviewers.
- Every clause of the evidence “cannot establish” list with an executable semantic oracle; metadata truth, all hypotheses/scope equivalences, and all source-reference placement/locus issues were inspected but not exhaustively planted.
- Semantic correctness of course derivations and numerical computations, actual TJO-brief translation equivalence, and the intended authoritative status of self-cited script snapshots.
- Exhaustive unknown-construct positions, CSS escape variants, runtime execution of the data-script probe, and full rendered-site aux substitution. The sampled positions and code-inspection findings are reported above.
- The existing browser red cases and dedicated game behavior, because the tested CLI paths encountered sandbox IPC restrictions; no browser result is claimed.
- The existing radial-sampler red case, because it did not complete within the probe bound. The Julia golden-reproduction check could not reach its intended discrepancy because the CODATA payload is absent.
- Entire unmodified `./ci.sh` end to end. CI scheduling/error propagation was probed separately; real contract fixtures were run separately. No end-to-end CI pass is claimed.
- Historical enforcement of protected-source edits, registry ID/body immutability, migration completeness, and exhaustive failure branches of the chapter-specific gates. Current-hash validation is not a substitute for these historical checks.

## Executable reproducer

The code below creates only `/tmp` fixtures and emits checker commands/results there. `f-all` runs case commands from the copied repository, so their generators/builds also target the copy. The script's printed exit status is the checker result; the driver itself continues so independent probes can be compared. Synthetic build records are intentionally fabricated test inputs, not PDF measurements. The subprocess timeout sentinel in the red manifest means “COULD NOT CHECK,” not a successful checker exit.

<!-- REPRODUCER-BEGIN -->
```python
from pathlib import Path
import sys, json, shutil, subprocess, hashlib, re, os
os.environ['PYTHONDONTWRITEBYTECODE']='1'
sys.dont_write_bytecode=True
R = Path.cwd().resolve()
T = Path('/tmp/tpc-contract-review')

def dump(p,d): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(json.dumps(d,indent=1,ensure_ascii=False)+'\n')
def get(p): return json.loads(p.read_text())
def copy(src,dst):
 if dst.exists(): shutil.rmtree(dst)
 shutil.copytree(src,dst,ignore=shutil.ignore_patterns('__pycache__'))
 return dst

def run(name,cmd,cwd=R):
 p=subprocess.run([str(x) for x in cmd],cwd=cwd,capture_output=True,text=True,timeout=55)
 (T/(name+'.log')).write_text(p.stdout+p.stderr)
 dump(T/(name+'.result.json'),{'command':[str(x) for x in cmd],'cwd':str(cwd),'exit':p.returncode,'output':p.stdout+p.stderr})
 print(name,'exit',p.returncode)
 print('\n'.join((p.stdout+p.stderr).splitlines()[-12:]))
 return p

def ev(name):
 d=copy(R/'tests/red/evidence/_base',T/name)
 return d,get(d/'evidence/claims.json'),get(d/'evidence/provenance.json')
def hash_member(d,member,prov):
 h=hashlib.sha256((d/'sources'/member).read_bytes()).hexdigest()
 p=d/'sources'/member.split('/')[0]/'source.json';s=get(p)
 for f in s['files']:
  if f['path']==member:f['sha256']=h
 dump(p,s)
 mf=d/'sources/MANIFEST.sha256'
 mf.write_text(re.sub(r'^[0-9a-f]{64}  '+re.escape(member)+r'$',h+'  '+member,mf.read_text(),flags=re.M))
 for p in prov['provenance']:
  if p['member']==member:p['member_sha256']=h

def evidence(name):
 d,c,p=ev(name); rows=c['claims']; prov=p['provenance'];tail='';opts=['--private']
 if name=='a-derived':(d/'evidence/derivations/d.md').write_text('# empty-heap\n\nThis section describes the colour of a circle.\n')
 if name=='a-not':
  f=d/'sources/fake-notes/notes.txt';f.write_text(f.read_text().replace(prov[0]['quote'],'not '+prov[0]['quote']));hash_member(d,'fake-notes/notes.txt',p)
 if name in ('a-whitespace','a-join-digits'):
  quote='a = 1\nb = 2' if name=='a-whitespace' else 'a very long formula = 1\n2'
  f=d/'sources/fake-notes/notes.txt';f.write_text(f.read_text().replace(prov[0]['quote'],quote));hash_member(d,'fake-notes/notes.txt',p)
  prov[0]['quote']=quote.replace('\n',' ' if name=='a-whitespace' else '')
  prov[0]['locus']={'line_start':5,'line_end':6}
 if name in ('a-window','a-we-have'):
  (d/'sources/fake-notes/notes.txt').write_text(('unrelated physics\n'*14)+'we have x.\n'+('unrelated physics\n'*15))
  hash_member(d,'fake-notes/notes.txt',p);prov[0]['quote']='we have x.' if name=='a-window' else 'we have';prov[0]['locus']={'line_start':1,'line_end':30}
 if name in ('a-true','a-true-run','a-echo-run'):
  rows[3]['numerics']['command']='echo 2' if name=='a-echo-run' else 'true'
  if name.endswith('run'):opts+=['--run-numerics']
 if name.startswith('a-num-'):
  tail={'fraction':r'$\frac{1}{8\sqrt{2\pi}}$', 'words':'ein halb', 'text':r'$\text{0.5}$', 'text-unit':r'$\text{300 K}$', 'unit-macro':r'$300\,\mathsf{K}$', 'integer-unit':'300 K', 'caption':r'\begin{tpcfigure}{c98.fig.test}\caption{0.5}\end{tpcfigure}', 'wrong-claim':r'\num[c98.cl.4]{999.5}{K}', 'figure':'','json':''}[name[6:]]
  if name=='a-num-figure':f=d/'content/c98-red/figures/test.tex';f.parent.mkdir();f.write_text('0.5 K')
  if name=='a-num-json':dump(d/'content/c98-red/chapter.json',{'value':0.5})
 if name=='a-other-chapter':
  rows[0]['id']='c97.cl.1';prov[0]['claim_ids']=['c97.cl.1']
  for f in (d/'content').glob('*/*.tex'):f.write_text(f.read_text().replace('c98.cl.1','c97.cl.1'))
 if name=='a-stipulation':rows[4]['statement_de']='S1. In diesem Kapitel wird ein Haufen als Quadrat gezeichnet.'; rows[4]['statement_en']='S1. In this chapter a heap is drawn as a square.'
 if name=='a-fake-review':
  prov[1]['reviewer']='Person who never reviewed';dump(d/'evidence/receipts/reviews/R-0001.json',{'id':'R-0001','reviewer':'Invented reviewer','date':'2026-10-12','covers':['P-0002'],'verdict':'pass'})
 if name=='a-own-script':
  s=get(d/'sources/fake-notes/source.json');s['kind']='script-snapshot';s['storage']='tracked';dump(d/'sources/fake-notes/source.json',s);rows[0]['evidence']='source-backed';rows[0]['statement_de']='Alle Elektronen sind masselos.'
  for f in (d/'content').glob('*/*.tex'):f.write_text(f.read_text().replace('c98.cl.1}{source-quoted}','c98.cl.1}{source-backed}'))
 if name=='a-prose':tail='Alle Elektronen sind masselos.'
 for f in (d/'content').glob('*/*.tex'):
  if tail:f.write_text(f.read_text()+'\n'+tail+'\n')
 dump(d/'evidence/claims.json',c);dump(d/'evidence/provenance.json',p)
 checker=[sys.executable,R/'scripts/evidence/check_evidence.py','--root',d]
 if name.startswith('a-receipt-'):
  run(name+'-prepare',checker+['--private'])
  if name=='a-receipt-ledger':c['claims'][0]['statement_de']='Changed state';dump(d/'evidence/claims.json',c)
  if name=='a-receipt-derivation':(d/'evidence/derivations/d.md').write_text('# empty-heap\nNow an unrelated derivation.\n')
  if name=='a-receipt-script':(d/'numerics/check.py').write_text('raise RuntimeError("broken computation")\n')
  opts=['--public']
 return run(name,checker+opts)

def registry(name):
 d=copy(R/'tests/red/registry/unregistered-symbol',T/name)
 (d/'content/c98-red/de.tex').write_text('$\\StSp$\n')
 n=get(d/'registry/notation.json');de=get(d/'registry/definitions.json')
 if name=='b-raw':
  n['symbols'][0]['tex']['expansion']=r'\alpha';n['symbols'][0]['mathml']='<math><mi>α</mi></math>';n['symbols'][0]['unicode']='α';n['symbols'][0]['canonical_token']=r'\alpha'
  (d/'content/c98-red/de.tex').write_text('$\\alpha$\n')
 if name=='b-same-render':
  n['symbols'][1]['tex']['expansion']='K';n['symbols'][1]['mathml']='<math><mi>K</mi></math>';n['symbols'][1]['unicode']='K';n['symbols'][1]['canonical_token']='different-semantic-token'
 if name in ('b-body','b-generated','b-header-only'):
  run(name+'-generate',[sys.executable,R/'scripts/registry/gen_registry.py','--root',d])
  if name in ('b-body','b-header-only'):
   de['definitions'][0]['body_de']='Ein beliebiger geänderter Körper $\\StSp$.';dump(d/'registry/definitions.json',de)
   if name=='b-body':run(name+'-regenerate',[sys.executable,R/'scripts/registry/gen_registry.py','--root',d])
   else:
    h=hashlib.sha256((d/'registry/definitions.json').read_bytes()).hexdigest()
    for f in (d/'registry/generated').iterdir():f.write_text(re.sub(r'(registry/definitions.json )[0-9a-f]{64}',r'\g<1>'+h,f.read_text()))
  if name=='b-generated':f=d/'registry/generated/NOTATION.md';f.write_text(f.read_text()+'Hand edit\n')
 if name in ('b-quote','b-quote-missing'):
  f=d/'sources/fixture-book/notes.txt';f.write_text('the quote is absent here\n')
  s=get(d/'sources/fixture-book/source.json');s['files']=[{'path':'fixture-book/notes.txt','role':'text','sha256':hashlib.sha256(f.read_bytes()).hexdigest()}];dump(d/'sources/fixture-book/source.json',s)
  for row in n['symbols']+de['definitions']:
   row['sources'][0].update(locus='notes.txt:1',quote='a fabricated source sentence')
  if name=='b-quote-missing':f.unlink()
 if name=='b-proposed':de['definitions'][0]['status']='proposed';(d/'content/c98-red/de.tex').write_text('\\tpcdef{D1}\n')
 if name=='b-remark':(d/'content/c98-red/de.tex').write_text('\\begin{remark}Ein Zustandsraum $\\StSp$.\\end{remark}\n')
 if name=='b-late-fixed':
  n['symbols'][0]['first_fixed_in']='C21';(d/'content/c98-red').rename(d/'content/c02-probe')
 dump(d/'registry/notation.json',n);dump(d/'registry/definitions.json',de)
 args=[] if name in ('b-body','b-generated','b-header-only') else ['--no-generated']
 return run(name,[sys.executable,R/'scripts/registry/check_registry.py','--root',d]+args)

def level(name):
 d=T/name
 if d.exists():shutil.rmtree(d)
 ch=d/'content/c99-probe';ch.mkdir(parents=True)
 base=r'\chapter{Probe}\label{c99}'+'\n'
 depth=r'\begin{vertiefung}[id=c99.v1,titel={T},wozu={W},voraussetzung={V},zurueck={Z}]'+'\n'+r'\begin{equation}\label{c99.eq.deep}a=b\end{equation}'+'\n'+r'\end{vertiefung}'+'\n'
 kern=r'\begin{equation}\label{c99.eq.core}a=b\end{equation}'+'\n'
 src=base+kern+depth
 if name=='c-words':src=base+'Der Kern benutzt das Ergebnis der folgenden Vertiefung.\n'+kern+depth
 if name=='c-macro-ref':src=base+r'\emph{Siehe \eqref{c99.eq.deep}.}'+'\n'+kern+depth
 if name=='c-num-ref':src=base+r'\num[c99.cl.1]{2}{\ref{c99.eq.deep}}'+'\n'+kern+depth
 if name=='c-figure-ref':f=ch/'figures/f.tex';f.parent.mkdir();f.write_text(r'\ref{c99.eq.deep}')
 if name=='c-tag':src=src.replace('a=b\\end{equation}','a=b\\tag{arbitrary}\\end{equation}')
 if name=='c-proof':src=base+r'\begin{theorem}\label{c99.thm.test}\claim[proof-included]{c99.cl.1}{derived}a=b\end{theorem}'+'\n'+depth.replace(r'\begin{equation}\label{c99.eq.deep}a=b\end{equation}',r'\begin{proof}a=b\end{proof}')
 if name=='c-iffalse':src=base+r'\iffalse'+kern+r'\fi'+depth
 for lang in ('de','en'):(ch/(lang+'.tex')).write_text(src)
 if name=='c-text-parity':
  (ch/'de.tex').write_text(src.replace('a=b',r'a=\text{ab}'))
  (ch/'en.tex').write_text(src.replace('a=b',r'a=\text{a b}'))
 dump(ch/'chapter.json',{'id':'c99','slug':'probe','title':{'de':'Probe','en':'Probe'},'effective_theory':{'de':'Probe','en':'Probe'},'zoom_scale':'none','prerequisites':[],'assets':[],'test_fixture':True})
 cmd=[sys.executable,R/'scripts/course/check_levels.py','--chapters','c99','--content',d/'content']
 if name in ('c-master','c-aux-swap','c-english-numbers','c-log-replace'):
  sys.dont_write_bytecode=True;sys.path.insert(0,str(R/'scripts/course'));import check_levels as cl, build_record as br
  dirs=['c99-probe'];parsed={dirs[0]:cl.lint_chapter(ch,d/'content',cl.load_registry(R/'registry/definitions.json'))}
  for lang in ('de','en'):
   for edition in ('full','kern'):
    job=f'tpc-{lang}-{edition}';w=d/'build'/job;w.mkdir(parents=True)
    log='This is an unrelated master\nOutput written on unrelated.pdf (7 pages).\n';(w/(job+'.log')).write_text(log)
    labels={l[0]: ('99.17' if lang=='en' else '99.1') for l in parsed[dirs[0]][lang].labels if edition=='full' or l[2]=='K'}
    (w/(job+'.aux')).write_text(''.join('\\newlabel{'+k+'}{{'+v+'}{7}{}{anchor}{}}\n' for k,v in labels.items()))
    flags=None if name=='c-master' else {'pkg':'1','ground':'light','math':'stix','fonts':'open'}
    dump(w/'build.json',{'job':'unrelated' if name=='c-master' else job,'lang':'xx' if name=='c-master' else lang,'edition':'other' if name=='c-master' else edition,'flags':flags,'chapters':dirs,'xelatex_exit_status':0,'log_sha256':br.sha256(w/(job+'.log')),'sources':br.hashes(R,d/'content',dirs,flags)})
  if name=='c-aux-swap':
   for lang in ('de','en'):
    full=d/'build'/f'tpc-{lang}-full'/f'tpc-{lang}-full.aux';kernf=d/'build'/f'tpc-{lang}-kern'/f'tpc-{lang}-kern.aux';shutil.copyfile(full,kernf)
  if name=='c-log-replace':f=d/'build/tpc-de-full/tpc-de-full.log';f.write_text('Output written on replacement.pdf (7 pages).\n')
  return run(name,cmd+['--build',d/'build'])
 if name=='c-cross-id':
  other=d/'content/c98-probe';copy(ch,other)
  for f in other.glob('*.tex'):f.write_text(f.read_text().replace(r'\label{c99}',r'\label{c98}').replace('c99.eq.core','c98.eq.core').replace('c99.v1','c98.v1'))
  m=get(other/'chapter.json');m['id']='c98';dump(other/'chapter.json',m);cmd[cmd.index('c99')]='c98,c99'
 return run(name,cmd+['--lint-only'])

def token(name):
 d=T/name;d.mkdir(exist_ok=True)
 if name.startswith('d-lint-'):
  tail=name[7:];ext='tex' if tail in ('mix','length') else 'css';f=d/('probe.'+ext)
  f.write_text({'named':'p {color: red}', 'oklch':'p {color: oklch(0.6 0.1 20)}', 'font':'p {font: 12px Arial}', 'mix':r'\begin{tikzpicture}\draw[blue!50] (0,0)--(1,1);\end{tikzpicture}', 'length':r'\begin{tikzpicture}[x=138mm]\end{tikzpicture}', 'waiver':'p {color: #123456} /* tpc-lint: allow */'}[tail])
  return run(name,[sys.executable,R/'design/lint_content.py',f])
 copy(R/'design/tokens',d/'tokens');copy(R/'design/build',d/'build')
 pkg=d/'tokens/pkg1.tokens.json';p=get(pkg)
 if name=='d-stale':p['$extensions']['org.tpc']['title']='changed without rebuilding'
 if name=='d-fill':
  p=get(R/'tests/red/tokens/stroke-just-below-3/tokens/pkg2.tokens.json');p['color']['dynamics'].setdefault('$extensions',{})['org.tpc.use']='fill';p['color'].setdefault('stage-dynamics',{'$type':'color','$value':'{color.dynamics}'}).setdefault('$extensions',{})['org.tpc.use']='fill';pkg=d/'tokens/pkg2.tokens.json'
 if name=='d-waiver':
  p=get(R/'tests/red/tokens/link-fails-aa/tokens/pkg1.tokens.json')
  p['$extensions']['org.tpc']['waivers']=[{'id':'fabricated-waiver-'+str(i),'check':'text-contrast','pair':pair,'ground':'light'} for i,pair in enumerate(['link/ground','link/ground-alt'])]
 dump(pkg,p)
 args=['--check','--out-dir',d/'build'] if name=='d-stale' else ['--measure']
 return run(name,[sys.executable,R/'design/build_tokens.py','--pkg','2' if name=='d-fill' else '1','--ground','light','--tokens-dir',d/'tokens']+args)

def web(name):
 d=T/name
 if d.exists():shutil.rmtree(d)
 d.mkdir()
 if name.startswith('e-css') or name=='e-data-script':
  s={'e-css-import':'<style>@import "https://example.org/x.css";</style>','e-css-url':'<style>p{background:url(https://example.org/x.png)}</style>','e-css-upper':'<style>p{background:URL(https://example.org/x.png)}</style>','e-css-attr':'<p style="background:url(https://example.org/x.png)">x</p>','e-css-space':'<style>p{background:url (https://example.org/x.png)}</style>','e-data-script':'<script src="data:text/javascript,fetch(\'https://example.org/x\')"></script>'}[name]
  (d/'index.html').write_text(s)
  return run(name,['node','--import',R/'web/node_modules/tsx/dist/loader.mjs',R/'web/tools/checks/static.ts','--only','external','--site',d])
 ch=d/'content/c98-probe';ch.mkdir(parents=True)
 src=r'\chapter{Probe}\label{c98}'+'\n'
 src+= {'e-math':r'$\madeup{x}$','e-optional':r'\begin{example}[\madeup{x}]\label{c98.ex.test}Text\end{example}','e-caption':r'\begin{tpcfigure}{c98.fig.test}\caption{\madeup{x}}\end{tpcfigure}','e-sqrt-optional':r'$\sqrt[\madeup{x}]{x}$','e-num-arg':r'\num[c98.cl.1]{\madeup{x}}{}','e-item-optional':r'\begin{enumerate}\item[\madeup{x}]Text\end{enumerate}', 'e-unselected':r'\tpcifenglish{\madeup{x}}{Valid}'}[name]
 for l in ('de','en'):(ch/(l+'.tex')).write_text((src.replace(r'\tpcifenglish{\madeup{x}}{Valid}',r'\tpcifenglish{Valid}{\madeup{x}}') if name=='e-unselected' and l=='en' else src)+'\n')
 assets=[]
 if name=='e-caption':(ch/'figures').mkdir();(ch/'figures/test.tex').write_text('test');assets=[{'id':'c98.fig.test','kind':'figure','file':'figures/test.tex'}]
 dump(ch/'chapter.json',{'id':'c98','slug':'probe','title':{'de':'Probe','en':'Probe'},'effective_theory':{'de':'Probe','en':'Probe'},'zoom_scale':'none','prerequisites':[],'assets':assets})
 return run(name,['node','--import',R/'web/node_modules/tsx/dist/loader.mjs',R/'web/tools/build/main.ts','--parse-only','--chapters','c98','--content',d/'content'])

def prepare_copy():
 d=T/'repo'
 if not d.exists():
  d.mkdir()
  for s in ('scripts','tests','design','registry','latex','numerics','evidence','content'):shutil.copytree(R/s,d/s,ignore=shutil.ignore_patterns('__pycache__'))
  shutil.copytree(R/'docs',d/'docs')
  shutil.copytree(R/'web',d/'web',ignore=shutil.ignore_patterns('node_modules'))
  (d/'web/node_modules').symlink_to(R/'web/node_modules',target_is_directory=True)
  shutil.copyfile(R/'ci.sh',d/'ci.sh')
 return d

def red(name):
 d=prepare_copy()
 if name=='f-broad':
  q=d/'tests/red/adversary/missing';dump(q/'case.json',{'gate':'adversary','what':'No physics defect is planted','cmd':'python3 missing-file.py','expect_exit_nonzero':False,'expect_output_regex':'.'})
  return run(name,[sys.executable,d/'scripts/check_red.py','--gate','adversary'],d)
 if name=='f-error':
  q=d/'tests/red/adversary/missing';dump(q/'case.json',{'gate':'adversary','what':'No physics defect is planted','cmd':'python3 -c "raise RuntimeError(\'unrelated error\')"','expect_exit_nonzero':True,'expect_output_regex':'error'})
  return run(name,[sys.executable,d/'scripts/check_red.py','--gate','adversary'],d)
 if name=='f-empty':
  x=T/'empty-red-root';x.mkdir(exist_ok=True);(x/'scripts').mkdir(exist_ok=True);shutil.copyfile(R/'scripts/check_red.py',x/'scripts/check_red.py')
  return run(name,[sys.executable,x/'scripts/check_red.py','--gate','tokens'],x)
 if name=='f-all':
  # Record each command and its precise regex match; all builds are in the copy.
  rows=[]
  for q in sorted((d/'tests/red').glob('*/*/case.json')):
   if q.parent.parent.name=='adversary':continue
   spec=get(q)
   try:p=subprocess.run(spec['cmd'],shell=True,cwd=d,text=True,capture_output=True,timeout=55);out=p.stdout+p.stderr;code=p.returncode
   except subprocess.TimeoutExpired:out='TIMEOUT';code=0
   m=re.search(spec['expect_output_regex'],out,re.S)
   row={'case':str(q.parent.relative_to(d)),'exit':code,'match':m.group() if m else None,'output':out};rows.append(row)
   dump(T/'red-results.json',rows)
   print(row['case'],'exit',code,'MATCH' if m else 'NO MATCH',flush=True)
  return

def ci(name):
 d=prepare_copy();s=(R/'ci.sh').read_text().split('echo -e "${BOLD}Theoretische Physik C — local CI${NC}"')[0]
 p=d/'ci-contract-probe.sh';p.write_text(s+'\nFAST=1\ncheck_contracts\nprintf "FAILED_STAGES=%s\\n" "$STAGES_FAILED"\n[[ "$STAGES_FAILED" -eq 0 ]]\n')
 b=T/'stubs';b.mkdir(exist_ok=True)
 (b/'python3').write_text('#!/bin/bash\nprintf "CALLED python3 %s\\n" "$*"\nif [[ "${TPC_CRASH:-}" == "1" && "$1" == "scripts/registry/check_registry.py" ]]; then echo "RuntimeError: unrelated crash"; exit 1; fi\nexit 0\n')
 (b/'bash').write_text('#!/bin/bash\nprintf "CALLED bash %s\\n" "$*"\nexit 0\n')
 for f in b.iterdir():f.chmod(0o755)
 env=dict(os.environ,PATH=str(b)+':'+os.environ['PATH'],TPC_CRASH='1' if name=='g-crash' else '0')
 if name in ('g-skips','g-crash'):
  p=subprocess.run(['/bin/bash',str(p)],cwd=d,env=env,capture_output=True,text=True)
 elif name=='g-node-missing':
  w=T/'missing-web';w.mkdir(exist_ok=True)
  for f in ('check.sh','run.sh'):shutil.copyfile(R/'web'/f,w/f)
  nb=T/'missing-bin';nb.mkdir(exist_ok=True);f=nb/'npm';f.write_text('#!/bin/sh\necho "npm unavailable"\nexit 127\n');f.chmod(0o755)
  p=subprocess.run(['/bin/bash',str(w/'check.sh'),'--fast'],cwd=d,env=dict(os.environ,PATH=str(nb)+':/usr/bin:/bin'),capture_output=True,text=True)
 elif name=='g-julia-missing':p=subprocess.run(['/bin/bash','-c','PATH=/usr/bin:/bin julia --project=numerics numerics/test/runtests.jl'],cwd=d,capture_output=True,text=True)
 else:raise ValueError(name)
 (T/(name+'.log')).write_text(p.stdout+p.stderr);print(name,'exit',p.returncode);print(p.stdout+p.stderr)

names = sys.argv[1:]
for name in names:
 if name.startswith('a-'):evidence(name)
 elif name.startswith('b-'):registry(name)
 elif name.startswith('c-'):level(name)
 elif name.startswith('d-'):token(name)
 elif name.startswith('e-'):web(name)
 elif name.startswith('f-'):red(name)
 elif name.startswith('g-'):ci(name)
 else:raise ValueError(name)
```
<!-- REPRODUCER-END -->