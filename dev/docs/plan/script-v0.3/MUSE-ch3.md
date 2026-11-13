<!-- Second opinion by muse (muse exec, reasoning effort high) on a frozen snapshot of script chapter 3, 2026-10-29. Line numbers refer to that snapshot. Independent of the codex review. -->

**1. Where the student gets stuck**

- [vl03.tex](vl03.tex:7): chapter 2 knew only columns in $\mathbb C^n$; now $V$ is any complex vector space. No bridge. Insert: “Zunächst ist $V=\mathbb C^n$; abstrakte Räume folgen in 3.2.”
- [vl03.tex](vl03.tex:24) defines $\bra v$ as the conjugated row; the last sentence of line 29 then says it generally is not. The student memorizes the row and is contradicted before general inner products exist. Delete that sentence here; move it to line 55 after the weighted example.
- [vl03.tex](vl03.tex:42): $\ket v=\ket{e_0}+i\ket{e_1}$ appears without its column $(1,i)$. The check in line 49 therefore cannot be followed without backwards decoding. Add the two columns, as v0.2 did, and shorten line 52.
- [vl03.tex](vl03.tex:99): a basis is defined by the Parseval identity (101), not by “every vector is built from these axes”. One preceding sentence would ground it: “Anschaulich sind Basisvektoren senkrechte Einheitsachsen; (101) ist der rechnerische Test dafür.” Line 111 then hides the expansion of $\braket\xi\xi$.
- [vl03.tex](vl03.tex:105): for $\ket{e_\pm}$, neither $\|\ket{e_\pm}\|=1$ nor $|\alpha+\beta|^2+|\alpha-\beta|^2=2(|\alpha|^2+|\beta|^2)$ is shown. This is exactly the complex-number step Lehramt students miss. Put that one identity in; cut the canonical-basis sentence in the same paragraph.
- [vl03.tex](vl03.tex:115): $c_j$ is undefined and the $c_\pm$ are never calculated in the text. Define $c_j=\braket{\phi_j}{\Psi}$ at line 111, where it belongs.
- [vl03.tex](vl03.tex:119): Gram–Schmidt suddenly writes the number on the right, $\ket{\Psi_k}\,\braket{\Psi_k}{\Phi_n}/\|\Psi_k\|^2$, against all earlier usage, and reuses $n$ already used for dimension. The web course explains this; the kernel dropped the explanation. Add “$\ket{\Psi_k}z=z\ket{\Psi_k}$” after (119). The example at 124–135 also never performs the normalization $\ket{\Psi_n}/\|\Psi_n\|$, because both results accidentally have norm 1. Change $\ket{\Phi_1}$ to $(2,0)$ at no extra length.

**2. Kernel or not?**

Not essential at this level: the weighted inner product and general-bra hedge (29, 55), never used again; the formal Cauchy definition (93–96), immediately declared ignorable in $\mathbb C^n$; the abstract Gram–Schmidt basis criterion (121, 135, 138), a quarter of the chapter for a procedure later lectures rarely execute; the historical box (31–33) if space is needed.

Missing essentials: *normiert* and why norm 1 matters; line 55 promises probabilities, line 115 has weights summing to 1, but $|c_j|^2$ is never tied to a normalized state or probability. Also missing: coefficients as coordinates and an explicit basis change in prose; any Hilbert-space example beyond $\mathbb C^n$, although chapter 2, line 57, promised functions for a particle—one clause naming $\int f^*g$ would connect to wavefunctions. The removed operator opening leaves Dirac notation without its main payoff until chapter 4 is rewritten.

**3. Against v0.2: shorter and cleaner, pedagogically mixed**

Improvements: (i) v0.2 errors at lines 134, 189, 195 and 216 are fixed at new lines 58, 101, 109 and 121; displays fall from about 32 to 14 without denser pages. (ii) Scope hedges are now correct: Hilbert-space shortcut restricted to $\mathbb C^n$ (96, against v0.2 line 180), finite index sets (99), Gram–Schmidt does not automatically give a basis (121, 138).

Losses: (i) Worked column arithmetic was compressed away: $\ket{e_+}$ and $\ket{e_-}$ separately in v0.2 lines 25–42 become one $\pm$ display (17–18); the matrix bra-ket example (v0.2 lines 78–87) becomes inline arithmetic (29). (ii) “Operatoren” (v0.2 lines 253–278) is gone. As a standalone chapter following the present chapter 4, that is a real gap, not tidiness.

**4. Mathematically false or misleading**

- Line 93: $\|\psi_m-\psi_k\|\to0$ “für $m,k\to\infty$” is not a defined Cauchy condition; it needs “for every tolerance, eventually all pairs”.
- Line 39: an infinite-dimensional vector can be specified completely, e.g. as a sequence or function; only a finite column cannot list it.
- Line 62 uses $\braket\psi\psi\ge0$ for a complex number without stating this first forces it to be real; line 65 then states the linearity contradiction so elliptically that the contradiction with definiteness is not visible.
- Line 81: “mit dem Gedanken ihres Beweises” refers to a Schwarz proof the script never gives; the uncertainty claim is therefore an unbacked forward assertion here.
- Lines 113–115: $\mathbb C^2$ is pictured as a real rectangle without the web course’s qualification that all coefficients here are real. Students will identify $\mathbb C^2$ with the plane.

**5. German**

It reads as compressed textbook German, not a lecturer. Stiff cases: line 29, “$\bra v$ die Zuordnung, die jedem Ket … zuordnet”; line 39, “dann ist das der Weg, effizient zu rechnen”; line 83, “wobei $j$ eine Indexmenge $X$ durchläuft”; line 103, the tautological Vollständigkeit warning; line 115, “Von der Basis unabhängig bleibt nicht die Aufteilung, sondern …”; line 121, “Steht nur der Nullvektor auf allen … senkrecht, so …”. Lines 93 and 105 pack a definition and five claims into single blocks. Only line 52 addresses students directly, and “eine Liebe … entdecken” sounds forced rather than spoken.
