# NOTES, lane evidence (lectures 3 and 4)

Nothing committed. 2026-10-29.

## Changed files
1. Ch1-2 bookkeeping (commit b1fd537):
   - `sources/tpc-script-v0.3/source.json`: `identifiers.git_commit` = b1fd5372efd21be97795d2abe955a55491be54df; route and notes rewritten (committed; pin_snapshot now refuses this source, by design; later edits follow the vl16 rule). Pin check before the change: 0 stale.
   - `evidence/migrations/M-0009,10,11,12,13,14,15,16,50,51.json`: the "uncommitted working tree ... commit still to be made" sentence in `evidence.notes` replaced by "committed in b1fd537 and registered as tpc-script-v0.3".
2. Lectures 3 and 4 prepared:
   - `sources/tpc-script-v0.2/source.json`, `sources/MANIFEST.sha256`: vl03, vl04, lec03, lec04 are now Git members `tpc-script-v0.2/git/latex/lectures/...` (hashes unchanged). Verified first: sha256 identical at 90fe735, at HEAD and in the working tree (nobody had modified them; last touching commit cafa7d1). Notes field says so.
   - `evidence/migrations/maps/vl03-map.json`: `legacy_source`, `legacy_member`, note sentence. `check_vl03_map.py` already read through `snapshot.legacy_payload` (no edit needed).
   - `scripts/check_enrichment.py`: `MIGRATED_LECTURES[3]`. Lecture 4 is not added (no map yet).
   - Registry/gaps loci "lectures/de/vl03.tex:N" of tpc-script-v0.2 resolve to the Git members automatically (check_registry: 0 errors).
3. `evidence/gaps.json` G-0072: TJO's answers (a)-(e), D14, dated 2026-10-29, appended to `notes`. Status stays `open` (schema allows only open/closed); (a) and (b) are applied by lane A, close after the second review confirms them.
4. `evidence/receipts/private-check.json` regenerated.

I did not edit claims.json or provenance.json.

## Gates (last lines)
- check_evidence --private: `evidence check passed` (receipt written)
- check_evidence --public: `evidence check passed`
- check_vl01_map: 111 items, 0 failures; vl02: 65, 0; vl03: 130 items, 116 kept, 14 deferred, 0 failures
- check_enrichment: `All 22 lecture(s) preserved v0.1 (7 with warnings)`
- check_red --gate evidence: 73 cases, 0 problems; enrichment: 1, 0; migration-maps: 2, 0
- check_registry: 0 errors

## Open
- Receipt reflects the working tree while other lanes edit; rerun `check_evidence.py --private` after they finish (claims/provenance rows added by lane A are checked then).
- When script ch3 is rewritten: its applied records need `tpc-script-v0.3` entries (new key, since v0.3 is committed): register the new vl03/lec03 under e.g. tpc-script-v0.3.1 or as a successor, then `pin_snapshot.py` on it before its commit. Lecture 4: add Git members already done; its map (vl04-map.json, checker) and MIGRATED_LECTURES[4] remain for Wave 2.
- M-0017..M-0024 destinations in vl03 (if any are to be marked applied) need the same applied_line/applied_text mechanism; not touched.

## Requests
- Lane S: any edit of the four lecture files is now safe for the v0.2 gates (they read Git). The v0.3 snapshot registers only ch1-2 files.

## Wave 2 (2026-10-29)

Nothing committed.
- `evidence/migrations/maps/vl04-map.json` (90 items of the v0.2 vl04, all kept; added_spoken/added_author) and `check_vl04_map.py` (copy of the vl03 checker); `ci.sh` line after vl03; `MIGRATED_LECTURES[4]` in `scripts/check_enrichment.py`. vl03-map items 116-129 (14 items) changed deferred -> kept (the checker allows it): destinations c03.s8, D87, c03.ex.matrix, c03.eq.matrix.
- New records M-0052..M-0063 (vl04 defects, union of lane A and lane S, applied; helper script in the lane scratchpad `mk_records.py`, reruns against the live files): H3.2 (0052), spelling/grammar (0053), adjoint matrix scope (0054), missing \rangle (0055), expansion inserted twice (0056), infinite-dimension overclaim (0057, removed), chi for Psi (0058), unsourced photon model (0059, removed), A for C (0060), eigenvalue implication without normality (0061), undecorated vector (0062), isometry/normal wording (0063). M-0005 and M-0024 applied (M-0024 gained a vl04:8 locus applied at vl04:9; its vl03 loci are applied by removal, the passages moved). M-0017..M-0023 applied against the frozen ch3 (M-0023 at vl03:122).
- Correction from the review (section C): the M-0024 slips are at HEAD vl03:256, 260, 271; v0.2 vl04:8 has "Sei H einen Hilbertraum" too (verified in the Git member), and NOTES-ch4 cites "line 9" for what is the new line 9 / old line 8.
- New snapshot `sources/tpc-script-v0.3.1` (vl03, lec03, vl04, lec04 working-tree members, supersedes v0.3, errata = the 22 records above). vl03/lec03 pinned (frozen); vl04/lec04 were pinned at 07:5x and have since been rewritten (ch4 repair wave): the manifest hashes and all chapter-4 applied_* fields are stale until ch4 is frozen. To refresh: check that each applied_line/applied_text still holds (edit `mk_records.py` lines if they moved), rerun it and the M-0005/M-0024 edits, then `pin_snapshot.py tpc-script-v0.3.1`, then `check_evidence.py --private`.
- gaps: G-0072 closed; G-0073 (photon remark), G-0074 (Observablen vs scharfe Observablen), G-0075 (hat-exception wording), G-0077 (ch4 cuts: positiv/nicht negativ, matrix sentence, ket-bra paragraph) open; G-0076 (rank-nullity, eigenvalues as prerequisites) created and closed by TJO's decision.
- R-0153 written (P-0318..P-0328, loci and member hash compared with the review table first); the 11 rows now carry reviewer and review_receipt R-0153.
- Gates: vl01/02/03/04 maps 0 failures; check_enrichment all 22; check_red evidence/enrichment/migration-maps 0 problems. check_evidence --private: the only findings are the stale vl04/lec04 hashes and chapter-4 applied records (50); the private receipt is NOT yet refreshed.

### Final freeze (2026-10-29)
All four lecture files frozen; `pin_snapshot.py tpc-script-v0.3.1` pinned them. Applied lines re-derived against the frozen files (M-0005 at vl04:51; other vl04 records shifted by one line; applied_text re-extracted with the files' math spacing, since the normalisation changed `=0` to `= 0`; M-0056, M-0061, M-0063 reworded to the new text). check_evidence --private and --public pass; receipt refreshed. Not committed; the snapshot's identifiers.git_commit is to be set in the commit that introduces it.
