You are an independent reviewer (second model family) for a physics course repository at
/home/tobias/Projects/theoretical-physics-C. Do NOT modify any file in that repository. Work
only under /tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/00d917e2-5a44-4403-b05d-6be593ec8a4c/scratchpad/codex-math4 (a scratch directory; render page images there, or in memory if the sandbox
refuses writes). Be concise and concrete. No time or effort estimates; state no number you did
not compute or read from a file.

Context. Chapter C3 (content/c03-hilbertraum/de.tex, English twin en.tex) was extended on
2026-10-29 by Lecture 4 (operators, from latex/lectures/de/vl04.tex as of git HEAD, plus the
vl03 subsection "Operatoren"): new Kern sections c03.s8 (with c03.s8.1), c03.s9, c03.s10,
c03.s11 (with c03.s11.1), c03.s12, the Vertiefungen c03.v5 and c03.v6, and the figure
content/c03-hilbertraum/figures/spektren.tex. Frozen copies of de.tex and en.tex are in the
scratch directory; cite their line numbers. TJO's decisions: docs/plan/lec34/BRIEF.md (hats on
operators, not on states, Pauli matrices or the identity; hazards H3.1 and H3.2).

Task A - page-image provenance (mandatory, per row).
/tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/00d917e2-5a44-4403-b05d-6be593ec8a4c/scratchpad/codex-math4/rows.json lists provenance rows P-0318..P-0328, quoting Reed-Simon, Methods of Modern
Mathematical Physics I (1980), scan sources/reed-simon-1/reed-simon-1.djvu at DjVu page
locus.page_index (1-based). For every row:
 1. Independently verify the scan's sha256 equals member_sha256 (sha256sum).
 2. Render the page yourself: ddjvu -format=pnm -page=<page_index> -scale=150 <djvu> pN.pnm
    and READ THE IMAGE (not the djvutxt text layer).
 3. Check that the printed page number equals locus.printed_page and that the quote is a
    faithful transcription of text on that page.
 4. Check that the quote supports the claim it is filed under (claim_ids; claims in
    evidence/claims.json) within the scope stated in the claim row.
Verdict PASS or FAIL per row with a one-line reason.

Task B - mathematics review of the new sections (mandatory).
Read de.tex from \section{Operatoren} (label c03.s8) to the line "% ── Fundament", the
"Lecture 4" part of evidence/derivations/c03/DERIVATION.md, definitions D17, D18, D20,
D87-D94 in registry/definitions.json, CONV-HAT in registry/conventions.json, and
figures/spektren.tex (its header states the generating formulas). Check every displayed
equation, proposition and proof (existence/uniqueness of the adjoint; Hermitian/positive;
isometry vs unitary, including the finite-dimensional rank argument; Hellinger-Toeplitz and
symmetric vs self-adjoint in c03.v5; the right shift in c03.v6), every example and exercise,
every definition body, and the figure against its source (exact eigenvalues: 0, ±√2; 1, 0, 0;
the cube roots of -i). Flag: unsupported mathematics in prose; Kern text depending on depth
material; finite-dimensional statements without that hypothesis or vice versa; statements that
call vectors "the states" (H3.2); "hermitesch = selbstadjungiert" without scope (H3.1);
de/en mismatch (spot-check eight places). You may run
`python3 evidence/derivations/c03/check_c03.py --verify` (read-only).

Task C - vl04 defects (short). docs/plan/lec34/NOTES-author.md section 3 and
docs/plan/script-v0.3/NOTES-ch4.md list defects of vl04.tex (HEAD). For each: is the old text
at the cited line of git HEAD's latex/lectures/de/vl04.tex (use git show HEAD:...), and is
the diagnosis right?

OUTPUT. Section A: table row id, verdict, reason. Section B: findings table severity (WRONG,
UNSUPPORTED, SCOPE, MISMATCH, MINOR), file:line, problem, fix, evidence, ordered by severity.
Section C: one line per defect. Then what you checked and found correct and what you COULD
NOT CHECK. Your final message is the full review and nothing else.
