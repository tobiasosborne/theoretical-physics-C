You are the independent reviewer of Lecture 2 of the course "Theoretische Physik C" by Tobias J. Osborne (TJO). He gives this lecture this week. Lecture 2 is the new chapter C3, `content/c03-hilbertraum/`, written from his old script lecture `latex/lectures/de/vl02.tex` and his recorded lectures. You did not write any of it. Repository root: the current directory. You write nothing in the repository; scratch goes under /tmp. Do not run builds or generators that write into the repository. You may run `python3 evidence/derivations/c03/check_c03.py`.

A first codex pass has already checked the Reed-Simon quotes and the mathematics; see `evidence/derivations/c03/REVIEW.md`. Do not redo that pass line by line. Your main job is the voice. For correctness, look only for what that pass missed.

BUDGET: one bounded review. Read and compute for at most half of your session, then write. Items you cannot finish are marked COULD NOT CHECK. Your final message is the full review and nothing else. No time or effort estimates; state no number you did not compute or read from a file (name the file or command).

1. AUTHENTICITY OF VOICE (the main question). The German text must read as TJO's own voice, not generic textbook German. His voice is in:
   - `latex/lectures/de/vl02.tex`;
   - the archived script under `archive/skript-2022/` (find the vl02 counterpart);
   - his spoken lectures `transcripts/clean/v02.md` (from about 75:00) and `transcripts/clean/v03.md` (up to about 43:00, plus anything later that the chapter cites, such as v03 88:21). These are ASR transcripts of middling quality; raw versions are in `transcripts/raw/`.

   The chapter cites timestamps such as "v03 12:59" in comments, in the ledger, and in `evidence/migrations/maps/vl02-map.json`. Then:
   - Spot-check at least fifteen passages that claim to come from vl02 or a transcript: is the wording really there at that locus, and is the meaning kept?
   - Flag every first-person remark, opinion, or anecdote that has no locus in his script or transcripts. Examples are "an der Tafel schreibe ich ...", "arbeite ich jeden Tag mit ...", and "Warum komplex, wissen wir nicht".
   - Flag passages where his correct sentence was replaced by blander or stiffer prose.
   - Flag German that is wrong or unidiomatic.
   - Judge whether the chapter as a whole sounds like the same lecturer as vl02 and the transcripts.

2. CORRECTNESS. Read `content/c03-hilbertraum/de.tex` in full. Then check:
   - Is anything false as stated, or true only under an unstated hypothesis? Pay most attention to the Kern text read on its own, since Kern must be finite-dimensional and self-contained (decision D4 in `docs/plan/PLAN.md` section 1.3).
   - The four rules of the inner product and their proof; the worked examples (-2i, 2i, v = (1, i)); the l^2 rate example and its bounds; the L^2 examples (f = 1, the Gaussian, 1/sqrt(1+|x|)); the equivalence-class and completeness blocks.
   - Is each space correctly assigned to its physical system ("Drei Räume, drei Systeme")?
   - The migration records `evidence/migrations/M-0013.json` .. `M-0016.json`: is the old text at the cited place, and is the diagnosis right?
   - Spot-check parity of the English edition `en.tex` at eight places.

Rules the text must follow (`docs/plan/phase0/COORDINATION.md` sections 1 and 8; `docs/plan/BRIEF.md`): no physics or mathematics statement from memory (each is quoted from a local source, derived in the repository, or numerically checked); the author's framing is his stipulation and must not be extended.

OUTPUT: a findings table with these columns:
- severity: WRONG, UNSUPPORTED, VOICE, GERMAN, SCOPE, MISMATCH or MINOR;
- file:line;
- the problem;
- the corrected text or required action;
- your evidence.

Order the table by severity, so that a repair agent can work from the table alone. Then a short list of what you checked and found correct, and what you COULD NOT CHECK. Keep it concise: only findings that would matter in front of students or to TJO.
