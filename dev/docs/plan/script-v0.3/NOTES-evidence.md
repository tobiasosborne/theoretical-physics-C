# NOTES, lane evidence (script v0.3)

Goal: every evidence gate keeps pointing at the immutable v0.2 text of lectures 1 and 2 while
the live `vl01.tex`, `vl02.tex`, `lec01.tex`, `lec02.tex` become script v0.3 (PLAN.md S11:
migration records replace the enrichment rule; v0.1 and v0.2 stay immutable evidence).
Nothing is committed.

## What changed

### 1. v0.2 lectures 1 and 2 are historical Git members of `tpc-script-v0.2`

The same rule that already served `vl16`/`lec16` since 2026-10-12.

- `sources/tpc-script-v0.2/source.json`: the four members `../latex/lectures/{de/vl01,de/vl02,en/lec01,en/lec02}.tex`
  are renamed `tpc-script-v0.2/git/latex/lectures/...` and listed in `retrieval.git_members`; the
  checkers read them with `git show 90fe735:<path>` (`identifiers.git_commit`, unchanged). Hashes
  unchanged. Verified before the move: the four files have byte-identical sha256 at `90fe735`, at
  `0aadd54` (HEAD) and in the working tree of 2026-10-22 morning (`8f4516eb…`, `0acb89f3…`,
  `b0ccc8af…`, `0686c025…`). The notes field says so.
- `sources/MANIFEST.sha256`: the four lines are renamed the same way (same hashes).
- `evidence/provenance.json`: the 72 rows whose `member` was one of the four live paths now name
  the Git member (`member_sha256`, loci and quotes unchanged). They verify against the v0.2 bytes.
- Migration records with v0.2 legacy loci (M-0009..M-0016, M-0050, M-0051) needed no change:
  `check_evidence.py` already falls back to a historical Git member when the live file's hash
  differs.

### 2. Map checkers read the v0.2 snapshot

- `scripts/evidence/snapshot.py` (new): reads a member of a registered snapshot (Git member or
  file), and returns it only if its bytes hash to the sha256 that both source.json and the manifest
  record. Anything else raises: a tampered record, manifest, commit or object fails closed.
- `evidence/migrations/maps/vl01-map.json`, `vl02-map.json`: new fields `legacy_source`
  (`tpc-script-v0.2`) and `legacy_member` (`tpc-script-v0.2/git/latex/lectures/de/vl0N.tex`);
  `legacy_file` and `legacy_sha256` unchanged. The `note` now says that line numbers and items are
  v0.2's. It also says that `fig_vl01_planck.tex` and `fig_vl02_raeume.tex`, which the entries name,
  were deleted in v0.3 and are read at the commit.
- `evidence/migrations/check_vl0{1,2,3}_map.py`: the legacy text comes from
  `snapshot.legacy_payload` (the member named in the map, else the live `legacy_file`; vl03 has no
  member yet and still reads the live file). The sha256 check against the map remains. New `--root`
  (fixtures) option. `--tex` is now an explicit test override.

### 3. Registry loci resolve against v0.2

`scripts/registry/reglib.py` and `check_registry.py` (registry package, touched because rule 2
needs it): a locus such as `lectures/de/vl01.tex:108` of `tpc-script-v0.2` resolves to the Git
member and is read with `git show`, and the bytes must hash to the source.json record. A new error
kind, `snapshot member`, covers an unavailable or wrongly hashed payload. Before this change, moving
the members made `check_registry.py` report 33 "member is absent" errors. After it, all quotes are
verified, with 0 errors. No registry data changed.

### 4. `check_enrichment.py`: migrated lectures

`MIGRATED_LECTURES = {1, 2}`, each with its v0.2 snapshot member, map checker and map. For these
two lectures, and only these, two checks replace the v0.1 rule:
(a) the v0.1 comparison runs against the v0.2 snapshot text (so "v0.2 kept everything v0.1 had"
stays checked, with the existing exception for lecture 1);
(b) the lecture's migration-map checker must pass.
The live v0.3 file is not compared with v0.1. All other lectures are checked as before. For the
red corpus only, `--migration-map N=FILE` replaces the map. With the old rule, the live drafts fail
(lecture 1: 16 equations, 3 headings and one example lost; lecture 2: 12 equations lost). With the
new rule both pass.

### 5. Applied destinations in a rewritten file

`check_evidence.py` previously required an applied record's `new_text` on the legacy line of the
destination. That fits an in-place fix (v0.2.1) but not a rewrite. New optional fields per
destination, in `evidence/schema/migration.schema.json`:

- `applied_line` + `applied_text`: the corrected wording as written in the destination, on that line.
- `applied_removed: true`: the defective passage is gone. `old_text` must occur nowhere in the
  destination. It excludes the two fields above.

The fields are refused without `applied_file_sha256`/`applied_source_key`. The checker docstring is
updated.

### 6. Successor snapshot `tpc-script-v0.3` and record statuses

- `sources/tpc-script-v0.3/{source.json,rights.json}` (new) registers the four live v0.3 files with
  their current hashes. It carries `parent_git_commit` 0aadd54 and no `git_commit`: the commit is
  still to be made, as the `notes` say. `errata` lists the ten applied records.
- `scripts/evidence/pin_snapshot.py` (new): after any later edit of a v0.3 lecture, run
  `python3 scripts/evidence/pin_snapshot.py tpc-script-v0.3`. It re-hashes the members into
  source.json, the manifest and the `applied_file_sha256` of the applied destinations. `--check`
  reports stale hashes without writing. It refuses a source that records a `git_commit`. It changes
  hashes only. Whether the corrected wording is still on its line is still checked by
  `check_evidence.py`; simulation round 5 shows this.
- Status `recorded` → `applied`, `applied_date` 2026-10-22, each with a note that names the lane
  and says the commit is still to be made. Only the v0.2 entries carry destinations; v0.1 entries
  carry none (M-0001 precedent). The source for each status is NOTES-ch1.md and NOTES-ch2.md:

| Record | How (destination lines in vl0N.tex / lec0N.tex) |
|---|---|
| M-0009 | applied_text, line 90 (de, en) |
| M-0010 | applied_text, line 125 (determinism Merksatz). "As the course realised it": the record's literal new_text is not printed, see the record note |
| M-0011 | applied_text, line 112 |
| M-0012 | title line 4; "Konstante" line 12; "Beobachung" removed |
| M-0013 | removed (de, en) |
| M-0014 | applied_text, line 57 (four v0.2 loci) |
| M-0015 | removed (de, en) |
| M-0016 | line 57 (two de slips), line 34 (dagger, de and en) |
| M-0050 | applied_text, lines 12, 20, 25, 28 (de, en) |
| M-0051 | lines 20, 27 (de, en); the v0.2:28 and v0.2:72 passages removed |

M-0006, M-0007, M-0008 (v0.1 only) stay `recorded`: there is nothing to apply in v0.2 or v0.3.
M-0017 and later records (vl03 and beyond) are out of scope and unchanged.

### 7. Deleted figures

`fig_vl01_planck.tex` (ch1) and `fig_vl02_raeume.tex` (ch2) are deleted in the working tree. Both
are byte-identical at 90fe735 and HEAD. No gate resolves them. The map entries `figure@49` and
`figure@131` quote the v0.2 `\input` line, which the snapshot serves. G-0024's `raised_in` is not
resolved by any checker. Its notes now say that its latex/ loci are v0.2 and how to read them. I
did not add the figure files to the snapshot: `tpc-script-v0.2` registers only `latex/lectures/`,
and G-0024 (a) states that the figure file is not a registered source. All other `raised_in` loci
into vl01/vl02 in `evidence/gaps.json` are likewise v0.2 line numbers (unchecked, left as they are).

### 8. Red corpus and ci.sh

- `tests/red/registry/git-member-quote-altered`, `git-member-snapshot-tampered` (hand-built; a
  green control passed with 0 errors).
- `tests/red/migration-maps/snapshot-tampered` (the record serves vl02 from c5d953e),
  `map-hash-differs`.
- `tests/red/enrichment/migrated-map-incomplete` (lecture 2's map lacks `equation@9`).
- `scripts/evidence/make_red_corpus.py`: new cases `migration-applied-rewritten-line`,
  `migration-applied-removed-still-present`, `git-member-tampered`. The corpus is regenerated:
  apart from the three new cases, only the receipts' checker and schema hashes and their date
  changed.
- `ci.sh`: header and stage label of the enrichment stage; the new red gates `enrichment` and
  `migration-maps` run in `--fast` and are in the full run's `--require` list.
- `evidence/receipts/private-check.json`: regenerated from the final state (private run, 47
  numerical checks run, pass).

## Gate results (main working tree, final state, 2026-10-22)

All pass with the lanes' v0.3 files in place:
`check_vl01_map` (111 items, 0 failures), `check_vl02_map` (65, 0), `check_vl03_map` (130, 0),
`check_enrichment` (22 lectures; 1 and 2 via snapshot + map), `check_registry` (0 errors),
`check_evidence --private` (pass, receipt written) and `--public` (pass),
`check_red` (176 cases, 0 problems).

Final status at 07:23. The v0.3 files are pinned at their 07:17 versions
(`pin_snapshot.py --check`: 0 stale). `check_evidence --private` passes and wrote the receipt, and
`--public` passes. Any later edit of the four lecture files makes the evidence gate fail until
re-pinned (see "What remains").

`./ci.sh --fast` (main tree, 07:20): Structure, Parity, Enrichment and Figures pass. In Contracts,
the registry, the three map checkers, every red-corpus gate (tokens 13, registry 18, evidence 73,
enrichment 1, migration-maps 2), the golden values and the course lint pass. Three gates failed:

- claims/provenance (private and public): the lanes revised all four lecture files at 07:17 (after
  their review) and so after my pin. The 41 findings were "destination file's sha256 differs".
  This is the gate working. I re-pinned with `pin_snapshot.py`. Every applied_text/removed check
  still held on the revised text, and only the receipt was stale. I then reran the private check
  (see the final status below).
- web build: "print build tpc-de-full is stale ... latex/tpc-course.sty changed" (design lane's
  file). It needs `bash scripts/course/build_course.sh --chapters c00,c01,c02,c03,c11
  --all-editions` and is not caused by this lane.

### Simulation (scratch copy of the repo without build/, script in my scratchpad: `simulate.sh`)

| Round | Live files / tamper | Map checkers | Enrichment | Registry | Evidence (public, non-receipt findings) |
|---|---|---|---|---|---|
| 1 | lane drafts of vl01/vl02/lec01/lec02 | pass | pass | 0 errors | 0 |
| 2 | vl01/lec01 gutted to a stub | pass | pass (old rule: fails lectures 1 and 2) | 0 errors | v0.3 snapshot stale, as it should be (v0.2 gates unaffected) |
| 3 | v0.2 record serves its Git members from c5d953e | both fail | fails 1 and 2 | 33 errors | 124 (stale manifest hash of the Git members) |
| 4 | vl01 snapshot hash edited in source.json and manifest alike | vl01 fails | fails 1 | 18 errors | stale manifest hash of the vl01 member |
| 5 | v0.3 vl02 edited after pinning, then re-pinned | | | | re-pin does not bless it: "M-0014 ... applied_text is not on the stated line" |

In the copy, `ci.sh --fast` failed only in the web stage. That stage needs prebuilt bundles under
build/, which the copy left out.

## What remains after the content lanes land

1. If any v0.3 lecture file changes again before the commit, run
   `python3 scripts/evidence/pin_snapshot.py tpc-script-v0.3`, then
   `python3 scripts/evidence/check_evidence.py --private` (it refreshes the receipt). If an
   applied record then fails ("applied_text is not on the stated line"), fix its `applied_line` or
   `applied_text` in the record. Do not weaken the check.
2. After the commit: write the commit hash into `sources/tpc-script-v0.3/source.json` as
   `identifiers.git_commit` (pin_snapshot then refuses it, by design). Change the `notes`/`route`
   sentence "not yet committed" and the "commit is still to be made" sentence in the ten records'
   `evidence.notes`. Rerun `check_evidence.py --private`.
3. Later edits of v0.3 lectures after that commit follow the vl16 rule: move the changed members to
   `tpc-script-v0.3/git/...` Git members and register the new files under a new key.
4. vl03 (M-0017..) is untouched. When script chapter 3 is rewritten, the same three steps apply:
   Git members in `tpc-script-v0.2`, `legacy_source`/`legacy_member` in `vl03-map.json`, and an
   entry in `MIGRATED_LECTURES`.

## Open questions for TJO / coordinator

1. "Applied by removal" (M-0013, M-0015, parts of M-0012 and M-0051): I count deleting a defective
   passage from the script as applying its correction (checked: `old_text` is gone). Alternatively
   these could stay `recorded` with a note. Say if you prefer that.
2. M-0010 is marked applied although the printed wording is the course's, not the record's
   `new_text` (ch1's reasoning: REVIEW-lec1 removed the last sentence). The record keeps both.
3. `scripts/registry/` belongs to the registry package; I changed `reglib.py`/`check_registry.py`
   because rule 2 (loci resolve against v0.2) requires it. The registry owner should review.
