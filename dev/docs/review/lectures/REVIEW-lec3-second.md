| Finding | Review | Verdict | Snapshot file:line | Note |
|---|---|---|---|---|
| Infinite sums incorrectly called series | Voice | CLOSED | `de.tex:1084`, `de.tex:1100` | Series and expansion theorem now explicitly use countable index sets; convergence is in norm. |
| Retrospective “In der Vorlesung sage ich” | Voice | CLOSED | `de.tex:1082` | Replaced by the directly spoken assumption, supported by v04. |
| Standard-product restriction for bras, norms and canonical basis | Voice | CLOSED† | `de.tex:639`, `de.tex:727`, `de.tex:756`, `de.tex:768`, `de.tex:1051` | Restrictions are explicit; the weighted example correctly supplies its own representing row. Current D81 agrees. |
| Unexplained completeness and unrestricted shortcut | Voice | CLOSED† | `de.tex:897`, `de.tex:910` | Current D14 explains completeness. The shortcut is restricted to the stated calculations in \(\mathbb C^n\); the infinite-dimensional caveat is explicit. |
| “Previously only one example” contradicts preceding Vertiefungen | Voice | CLOSED | `de.tex:713` | Now refers specifically to the product previously used on \(\mathbb C^n\). |
| Repeated Schwarz proof in Fundament | Voice | CLOSED | `de.tex:1294`, `de.tex:1308` | Replaced by the correct specialization; prerequisites updated and the additional \(\ell^2\) limiting argument retained. |
| Arbitrary-index vector sum lacks interpretation | Math B | CLOSED† | `de.tex:1100`, `de.tex:1107`, `de.tex:1121` | Vector-series statements are countable and specify norm convergence. Current D86 supplies the partial-sum definition. |
| Unsupported energy-bound example | Math B | CLOSED | `de.tex:861` | Removed; the remaining general application agrees with `vl03.tex:164`. |
| Unqualified instruction to ignore completeness | Math B | CLOSED | `de.tex:910` | Finite-dimensional shortcut and its limits are now stated together. |
| Abstract bra identified with entrywise conjugate transpose | Math B | CLOSED† | `de.tex:641`, `de.tex:756` | Bra defined by its action for another product; weighted row is correct. |
| Two completeness notions said to have “nothing” to do with each other | Math B | CLOSED BUT NEW PROBLEM | `de.tex:936` | Mathematical overstatement removed; the replacement contains an awkward German comparison below. |
| Norm described as a complex number | Math B | CLOSED | `de.tex:1228` | Correctly distinguishes complex inner product from nonnegative real norm. |
| M-0023 diagnosis omits missing “nonzero” | Migration C | CLOSED† | `de.tex:1192`, `de.tex:1194` | Normalized output is clearly the basis; current `M-0023.json:32` explicitly diagnoses the missing qualification. |
| M-0024 proposed repair retains incorrect word order | Migration C | CLOSED† | — | Current `M-0024.json:37` ends correctly with “\(n=2\) beträgt”. This remains a record for the deferred operator section. |
| Animated contribution falsely labelled \(v^\dagger v\) | Demos | CLOSED | `c03.demo.raeume.ts:105` | Running contribution and complete kernel value now have separate labels. |
| Kreuz default differs from still’s product example | Demos | CLOSED | `c03.demo.kreuz.ts:56`, `c03.demo.kreuz.ts:87` | Default now produces \(-2i\); figure (a)’s vector remains available through its separately labelled preset. |

“Voice” means `docs/review/lectures/REVIEW-lec3.md`; “Math B” and “Migration C” mean the corresponding sections of `evidence/derivations/c03/REVIEW-lec3.md`.

Chapter and demo locations refer to the supplied frozen snapshot: [de.tex](/tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/00d917e2-5a44-4403-b05d-6be593ec8a4c/scratchpad/lec3-second/snap/de.tex), [en.tex](/tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/00d917e2-5a44-4403-b05d-6be593ec8a4c/scratchpad/lec3-second/snap/en.tex), [Räume](/tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/00d917e2-5a44-4403-b05d-6be593ec8a4c/scratchpad/lec3-second/snap/c03.demo.raeume.ts), [Kreuz](/tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/00d917e2-5a44-4403-b05d-6be593ec8a4c/scratchpad/lec3-second/snap/c03.demo.kreuz.ts).

† Definition-dependent and record-only closures are conditional: the snapshot contains definition calls, but no frozen registry bodies or migration JSON. I inspected their current repository versions.

| Severity | File:line | The problem | Corrected text or required action | Evidence |
|---|---|---|---|---|
| GERMAN | [de.tex:937](/tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/00d917e2-5a44-4403-b05d-6be593ec8a4c/scratchpad/lec3-second/snap/de.tex:937) | “ein anderer Begriff von Vollständigkeit als die des Hilbertraums” awkwardly compares a *Begriff* with the space’s *Vollständigkeit*. | “Verwirrenderweise heißt auch die zweite Eigenschaft Vollständigkeit. Damit ist etwas anderes gemeint als mit der Vollständigkeit des Hilbertraums aus Abschnitt ….” | The replacement’s comparison is uneven; `en.tex:801` expresses the intended distinction clearly. D14 concerns convergence in the space; D85 concerns the orthonormal system. |

**Checked and found correct:**

- Read the complete requested German sections and c03.v4. The symmetry, Schwarz, triangle, finite-expansion and Gram–Schmidt proofs are valid. Zero outputs, normalization and the condition for obtaining a basis remain correctly qualified. No new mathematical error found.
- The finite calculations remain independent of c03.v4 and the Fundament proofs. The weighted-product repair, countable expansion theorem, maximality argument and \(\ell^2\) example are consistent with the inspected definitions and Fundament passages.
- TJO’s voice survives: direct address, “für immer und ewig”, the practical motivation and the favourite-Hilbert-space example agree with the script and clean transcripts. No newly unsupported personal remark or physics claim found.
- Earlier accepted repairs M-0017 through M-0022 remain consistent with the inspected passages and current definitions.
- Executed the snapshot demo code with DOM stubs against the actual kernel. At \(u=0.25\), Räume labels the running value `0.25` separately from \(v^\dagger v=1\). Kreuz’s default terms sum to \(-2i\), matching still (b); its separately labelled figure-(a) preset yields \(3+i\).
- **English parity:** no substantive divergence at these DE/EN starts: bra convention `635/551`; product transition `712/616`; weighted bra `756/655`; standard norm `768/665`; completeness shortcut `908/780`; completeness terminology `936/801`; countable expansion `1100/945`; real-valued norm `1228/1060`.
- `python3 -B evidence/derivations/c03/check_c03.py --verify` returned **`ALL OK`** for its encoded calculations.

**COULD NOT CHECK:**

- Registry bodies and migration records as they existed when the snapshot was created.
- Independent revalidation of the first review’s Reed–Simon page images and provenance hashes.
- Rendered print/browser layout and complete interactive demo behaviour.