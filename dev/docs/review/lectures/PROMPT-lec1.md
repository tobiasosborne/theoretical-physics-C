You are the independent reviewer of Lecture 1 of the course "Theoretische Physik C" by Tobias J. Osborne (TJO). He gives this lecture this week. Lecture 1 is the chapters C0 (`content/c00-theorie/`) and C1 (`content/c01-wahrscheinlichkeit/`), revised from his old script lecture `latex/lectures/de/vl01.tex` and his recorded lectures. You did not write any of it. Repository root: the current directory. You write nothing in the repository; scratch goes under /tmp. Do not run builds or generators that write into the repository.

BUDGET: one bounded review. Read and compute for at most half of your session, then write. Items you cannot finish are marked COULD NOT CHECK. Your final message is the full review and nothing else. No time or effort estimates; state no number you did not compute or read from a file (name the file or command).

Two questions matter, in this order:

1. AUTHENTICITY OF VOICE. The German text must read as TJO's own voice, not generic textbook German. His voice is in `latex/lectures/de/vl01.tex`, `archive/skript-2022/Vorlesungen1.tex`, and his spoken lectures `transcripts/clean/v01.md` and `transcripts/clean/v02.md` (up to about 75:00; these are ASR transcripts of middling quality). The revision cites transcript timestamps such as "v01 [18:44]" in comments or the ledger.
   - Spot-check at least twelve passages that claim to come from vl01 or a transcript: is the wording really there at that locus, and is the meaning kept?
   - Flag passages that put words in his mouth: first-person remarks, opinions or anecdotes with no locus in his script or transcripts.
   - Flag passages where his sentence was replaced by blander or stiffer prose although his own sentence was correct.
   - Flag German that is wrong or unidiomatic.

2. CORRECTNESS. Read `content/c00-theorie/de.tex` and `content/c01-wahrscheinlichkeit/de.tex` in full. Then check:
   - Every formula, worked example, proof and number is true as stated, with its hypotheses. Recompute every worked number exactly, in particular the example on X = {1,2,3} with weights (1/2, 1/4, 1/4), its table of 8 events, and E[f] for f = (-1, 0, +1).
   - The new derivations in `evidence/derivations/c01/DERIVATION.md` and the claims `c00.cl.reflexion`, `c01.cl.drei-ergebnisse`, `c01.cl.drehimpuls` in `evidence/claims.json`.
   - The photoelectric bound 0 <= (1/2) m v^2 = h nu - W' <= h nu - W and its stated premise.
   - The historical dates and attributions. The author doubts three that are printed as in the old script: Planck 1899, Franck-Hertz around 1911, Davisson-Germer 1929. State the correct ones, marked "reviewer's own knowledge, no local source" unless you find a local source under `sources/`.
   - The CODATA constants against `sources/codata-2022/allascii.txt`.
   - Kern honesty: reading only the Kern text, is anything false as stated, or true only under an unstated hypothesis?
   - Spot-check parity of the English edition `en.tex` at five places per chapter.

Rules the text must follow (`docs/plan/phase0/COORDINATION.md` sections 1 and 8; `docs/plan/BRIEF.md`): no physics statement from memory (each is quoted from a local source, derived in the repository, or numerically checked); the author's framing is his stipulation and must not be extended.

OUTPUT: a findings table with these columns:
- severity: WRONG, UNSUPPORTED, VOICE, GERMAN, SCOPE, MISMATCH or MINOR;
- file:line;
- the problem;
- the corrected text or required action;
- your evidence.

Order the table by severity, so that a repair agent can work from the table alone. Then a short list of what you checked and found correct, and what you COULD NOT CHECK. Keep it concise: only findings that would matter in front of students or to TJO.
