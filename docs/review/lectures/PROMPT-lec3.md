You are the independent reviewer of Lecture 3 of the course "Theoretische Physik C" by Tobias J. Osborne (TJO). He gives this lecture this week. Lecture 3 is the extension of chapter C3, `content/c03-hilbertraum/`, by the new Kern sections c03.s4 (Dirac-Notation), c03.s5 (Skalarprodukte), c03.s6 (Hilbertraum), c03.s7 (Basen, with c03.s7.1 Gram-Schmidt) and the Vertiefung c03.v4, written from his old script lecture `latex/lectures/de/vl03.tex` and his recorded lectures. The earlier sections c03.s1-s3 (Lecture 2) were reviewed already (`docs/review/lectures/REVIEW-lec2.md`); do not review them again. You did not write any of it. Repository root: the current directory. You write nothing in the repository; scratch goes under /tmp. Do not run builds or generators that write into the repository. You may run `python3 evidence/derivations/c03/check_c03.py`.

A separate codex pass is checking the Reed-Simon quotes and the mathematics of the new sections. Do not redo that pass line by line. Your main job is the voice. For correctness, look only for what such a pass would miss.

BUDGET: one bounded review. Read and compute for at most half of your session, then write. Items you cannot finish are marked COULD NOT CHECK. Your final message is the full review and nothing else. No time or effort estimates; state no number you did not compute or read from a file (name the file or command).

1. AUTHENTICITY OF VOICE (the main question). The German text must read as TJO's own voice, not generic textbook German. His voice is in:
   - `latex/lectures/de/vl03.tex`;
   - the archived script `archive/skript-2022/Vorlesungen3.tex`;
   - his spoken lectures `transcripts/clean/v03.md` (from about 43:50 to the end) and `transcripts/clean/v04.md` (up to about 46:45, where operators start). These are ASR transcripts of middling quality; raw timestamped versions are in `transcripts/raw/`.

   The chapter cites timestamps such as "v04 12:47" in `% Stimme:` comments, in the ledger, and in `evidence/migrations/maps/vl03-map.json` (lists `added_spoken` and `added_author`). Then:
   - Spot-check at least fifteen passages of the new sections that claim to come from vl03 or a transcript: is the wording really there at that locus, and is the meaning kept?
   - Flag every first-person remark, opinion, or anecdote that has no locus in his script or transcripts.
   - Flag passages where his correct sentence was replaced by blander or stiffer prose.
   - Flag German that is wrong or unidiomatic.
   - Judge whether the new sections sound like the same lecturer as vl03, the transcripts and sections c03.s1-s3.

2. CORRECTNESS. Read the new sections of `content/c03-hilbertraum/de.tex` in full (from `\section{Dirac-Notation}` to the line `% ── Fundament`). Then check:
   - Is anything false as stated, or true only under an unstated hypothesis? Pay most attention to the Kern text read on its own, since Kern must be finite-dimensional and self-contained (decision D4 in `docs/plan/PLAN.md` section 1.3); in particular whether the general inner-product axioms, the Hilbert-space definition D14 and the basis definition D85 are stated so that a reader with only C^n in hand is not misled.
   - Does the chapter now say the same thing twice (sections c03.s2 and c03.s5 both treat the inner product; c03.f1 and c03.s5 both treat Schwarz)? Is the second treatment a deliberate step up, or a duplicate?
   - The migration records `evidence/migrations/M-0017.json` .. `M-0024.json`: is the diagnosis right, and is the corrected statement what the chapter prints?
   - Spot-check parity of the English edition `en.tex` at eight places in the new sections.

Rules the text must follow (`docs/plan/phase0/COORDINATION.md` sections 1 and 8; `docs/plan/BRIEF.md`): no physics or mathematics statement from memory (each is quoted from a local source, derived in the repository, or numerically checked); the author's framing is his stipulation and must not be extended.

OUTPUT: a findings table with these columns:
- severity: WRONG, UNSUPPORTED, VOICE, GERMAN, SCOPE, MISMATCH or MINOR;
- file:line;
- the problem;
- the corrected text or required action;
- your evidence.

Order the table by severity, so that a repair agent can work from the table alone. Then a short list of what you checked and found correct, and what you COULD NOT CHECK. Keep it concise: only findings that would matter in front of students or to TJO.
