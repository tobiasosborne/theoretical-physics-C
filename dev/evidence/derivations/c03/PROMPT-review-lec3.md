You are an independent reviewer (second model family) for a physics course repository at
/home/tobias/Projects/theoretical-physics-C. Do NOT modify any file in that repository. Work
only under /tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/acfb73c8-2445-4b36-b469-738337bed26f/scratchpad/codex-math/ (a scratch directory; render page images there). Be concise and concrete. No time or
effort estimates; state no number you did not compute or read from a file.

Context. Chapter C3 (content/c03-hilbertraum/de.tex, English twin en.tex) was extended on
2026-10-21 by Lecture 3: the new Kern sections c03.s4 (Dirac-Notation), c03.s5
(Skalarprodukte), c03.s6 (Hilbertraum), c03.s7 (Basen, with subsection c03.s7.1 Gram-Schmidt),
the Vertiefung c03.v4 and the figure content/c03-hilbertraum/figures/vollst.tex. Sections
c03.s1-s3, c03.v1-v3 and c03.f1-f3 were reviewed earlier (evidence/derivations/c03/REVIEW.md);
do not redo them except where the new text changed them (c03.f1 gained one sentence).

Task A - page-image provenance (mandatory, per row).
The file /tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/acfb73c8-2445-4b36-b469-738337bed26f/scratchpad/codex-math/rows.json lists provenance rows P-0152..P-0164. Each quotes
Reed-Simon, Methods of Modern Mathematical Physics I (1980), from the scan
/home/tobias/Projects/theoretical-physics-C/sources/reed-simon-1/reed-simon-1.djvu
at the DjVu page `locus.page_index` (1-based). For every row:
 1. Independently verify the scan's sha256 equals member_sha256 (sha256sum).
 2. Render the page yourself: ddjvu -format=pnm -page=<page_index> -scale=150 <djvu> pN.pnm
    (convert to png if useful) and READ THE IMAGE (not the djvutxt text layer).
 3. Check that the printed page number equals locus.printed_page and that the quote is a
    faithful transcription of text on that page (mathematics transcribed into TeX is fine;
    a bar for complex conjugation may be written \bar or \overline).
 4. Check that the quote supports the claim it is filed under (claim_ids; the claims are in
    evidence/claims.json, the chapter text in content/c03-hilbertraum/de.tex) within the
    scope stated in the claim row.
Report a verdict PASS or FAIL per row with a one-line reason.

Task B - mathematics review of the new sections (mandatory).
Read de.tex from \section{Dirac-Notation} (label c03.s4) to the line
"% ── Fundament", plus the one new sentence in c03.f1. Read the matching parts of
evidence/derivations/c03/DERIVATION.md (heading "Lecture 3"), the definitions D81-D86 and D14
in registry/definitions.json, the notation rows sym.ket, sym.bra, sym.norm,
sym.kronecker-delta in registry/notation.json, and the figure source figures/vollst.tex.
Check every displayed equation, every proposition and its proof, every example and exercise
solution, every definition body, and the figure caption against the figure source (the
header of vollst.tex states the generating formulas and numbers). List each error or
unsupported statement with file:line, what is wrong, and the fix. Also flag: statements of
mathematics in running prose that carry no support; places where Kern text (outside
vertiefung/fundament environments) depends on depth material; Kern statements that are true
only in finite dimension but stated without that hypothesis, or vice versa; any mismatch in
meaning between de.tex and en.tex in the new sections (spot-check at least eight places).
You may run `python3 evidence/derivations/c03/check_c03.py` (read-only).

Task C - migration records (short).
Read evidence/migrations/M-0017.json .. M-0024.json. For each: is the old text at the cited
line of latex/lectures/de/vl03.tex (and lec03.tex where an en entry exists), and is the
diagnosis right?

OUTPUT. Section A: a table with columns row id, verdict, reason. Section B: a findings table
with columns severity (WRONG, UNSUPPORTED, SCOPE, MISMATCH, MINOR), file:line, problem,
fix, evidence, ordered by severity. Section C: one line per record. Then a short list of what
you checked and found correct and what you COULD NOT CHECK. Your final message is the full
review and nothing else.
