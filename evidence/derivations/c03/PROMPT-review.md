You are an independent reviewer (second model family) for a physics course repository at
/home/tobias/Projects/theoretical-physics-C. Do NOT modify any file in that repository. Work
only in your current directory (a scratch directory). Be concise and concrete.

Task A — page-image provenance (mandatory, per row).
The file rows.json in your current directory lists provenance rows P-0140..P-0150. Each quotes
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
    /home/tobias/Projects/theoretical-physics-C/evidence/claims.json, chapter text in
    content/c03-hilbertraum/de.tex) within the scope stated in the claim row.
Report a verdict PASS or FAIL per row with a one-line reason.

Task B — mathematics review of chapter c03 (mandatory).
Read content/c03-hilbertraum/de.tex (German; en.tex is its translation),
evidence/derivations/c03/DERIVATION.md and registry definitions D75-D80 in
registry/definitions.json. Check every displayed equation, every proposition/lemma/theorem and
its proof, every example and exercise solution, and every figure caption against the figure
source in content/c03-hilbertraum/figures/*.tex. List each error or unsupported statement
with file:line, what is wrong, and the fix. Also flag: statements of physics or mathematics in
running prose that carry no support; places where Kern text (outside vertiefung/fundament
environments) depends on depth material; any mismatch between de.tex and en.tex in meaning.
You may run python3 evidence/derivations/c03/check_c03.py (read-only).

Output: write your full report as Markdown to REVIEW-c03.md in your current directory, with
sections "A. Provenance rows" (a table: id, sha ok, page ok, quote ok, supports claim,
verdict) and "B. Mathematics and text" (numbered findings, severity high/medium/low), and a
final line "OVERALL: PASS" or "OVERALL: FAIL" for section A alone.
