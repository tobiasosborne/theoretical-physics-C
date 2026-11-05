References use these file pairs; EN/DE numbers below are line numbers:

- **C3:** [content/c03-hilbertraum/en.tex](/home/tobias/.t3/worktrees/theoretical-physics-C/t3-cb8ffde3/content/c03-hilbertraum/en.tex), [de.tex](/home/tobias/.t3/worktrees/theoretical-physics-C/t3-cb8ffde3/content/c03-hilbertraum/de.tex).
- **C4:** [content/c04-quantentheorie/en.tex](/home/tobias/.t3/worktrees/theoretical-physics-C/t3-cb8ffde3/content/c04-quantentheorie/en.tex), [de.tex](/home/tobias/.t3/worktrees/theoretical-physics-C/t3-cb8ffde3/content/c04-quantentheorie/de.tex).
- **L5:** [latex/lectures/en/lec05.tex](/home/tobias/.t3/worktrees/theoretical-physics-C/t3-cb8ffde3/latex/lectures/en/lec05.tex), [de/vl05.tex](/home/tobias/.t3/worktrees/theoretical-physics-C/t3-cb8ffde3/latex/lectures/de/vl05.tex).
- **L6:** [latex/lectures/en/lec06.tex](/home/tobias/.t3/worktrees/theoretical-physics-C/t3-cb8ffde3/latex/lectures/en/lec06.tex), [de/vl06.tex](/home/tobias/.t3/worktrees/theoretical-physics-C/t3-cb8ffde3/latex/lectures/de/vl06.tex).

The translation findings are:

1. **MINOR · fidelity — C3 EN 1795–1796 / DE 2099–2101.**  
   “That comes up” can modify “operator”; the German says that the assigned number occurs frequently. Replace the opening sentence with:

   ```tex
   One more number belongs to the toolkit: it is assigned to every operator and comes up in quantum mechanics all the time.
   ```

2. **MINOR · fidelity — C4 EN 377 / DE 378.**  
   The example title changes *frequency* into *probability*. Replace `Detection probability of the Z measurement` with `Detection frequency of the Z measurement`.

3. **MINOR · terminology — C3 EN 1796 / DE 2100; L5 EN 9 / DE 9.**  
   “Matrix calculus” is a misleading translation of *Matrizenrechnung* here. Replace `matrix calculus` with `matrix algebra`.

4. **MINOR · terminology — C4 EN 211, 227 / DE 216, 231; L6 EN 32 / DE 32.**  
   *Echte Mischungen* means nontrivial convex mixtures here. “Proper mixture” introduces an unnecessary competing technical term. Replace `proper mixtures` with `nontrivial mixtures`, and `a proper mixture` with `a nontrivial mixture`.

5. **MINOR · terminology — C4 EN 446–447 / DE 447–448.**  
   “A real sum” is not clear mathematical English. Replace the sentence with:

   ```tex
   $\op{A}$ is Hermitian because it is a linear combination of Hermitian operators with real coefficients.
   ```

6. **MINOR · English — C3 EN 1869–1870 / DE 2175–2176; L5 EN 27 / DE 27.**  
   Matrices themselves are not “laborious”. Replace `general matrices are laborious` with `general matrices are cumbersome to work with`, preserving the initial capital in L5.

7. **MINOR · English — C3 EN 2043–2049 / DE 2350–2356; L5 EN 73 / DE 73.**  
   “Figure … draws” and repeated “Drawn is” reproduce German syntax. At these locations, replace:

   - `draws this example` with `shows this example`;
   - every `Drawn is` with `The figure shows`;
   - in L5, `the unit circle of $\mathbb{R}^2$` with `the unit circle in $\mathbb{R}^2$`.

8. **MINOR · English — C4 EN 84 / DE 86; L6 EN 21 / DE 21.**  
   A Hilbert-space assignment is not “said by experiment”. Replace:

   - C4: `is said not by the theory but by experiment` with `is determined by experiment, not by the theory`;
   - L6: `is said by experiment` with `is determined by experiment`.

9. **MINOR · English — C4 EN 160–161 / DE 164–165; EN 211–212 / DE 216.**  
   Both “is said by” constructions are calques. Replace the respective passages with:

   ```tex
   The following theorem of Bratteli and Robinson identifies the states that arise in this way; here a state is called
   ```

   and:

   ```tex
   The following proposition identifies which of them are pure, that is, which cannot be written as nontrivial mixtures (\defref{D4}).
   ```

   The second replacement also incorporates finding 4.

10. **MINOR · English — C4 EN 604 / DE 608–609; L6 EN 108 / DE 108.**  
    Replace the shared clause `What happens to the system after a measurement is not said by P0 to P5 either` with:

    ```tex
    P0 to P5 do not say what happens to the system after a measurement either
    ```

11. **MINOR · English — C4 EN 143 / DE 146–147.**  
    “Here is which states …” is ungrammatical. Replace that sentence with:

    ```tex
    This block identifies the states represented by density operators and gives a state that is not represented by one.
    ```

12. **MINOR · English — C3 EN 2018–2019 / DE 2325–2326; L5 EN 60 / DE 60.**  
    The eigenvector calculation contains an objectless “Inserting”; the script retains German inversion. Replace:

    - C3: `Inserting gives the eigenvectors, normalised:` with `Substituting these eigenvalues gives the normalised eigenvectors:`;
    - L5: `From $\det(\pauli{x} - \lambda\mathbb{I}) = \lambda^2 - 1$ follow the eigenvalues` with `From $\det(\pauli{x} - \lambda\mathbb{I}) = \lambda^2 - 1$ we obtain the eigenvalues`.

13. **MINOR · English — C3 EN 2103–2105 / DE 2410–2412.**  
    “Eigenvectors … will meet us” and “What … is what … says” are awkward calques. Replace the two sentences with:

    ```tex
    We will meet such ``improper eigenvectors'', which do not lie in the Hilbert space, again in Chapter~5, for position and momentum. The general spectral theorem tells us what takes the place of the eigenbasis.
    ```

14. **MINOR · English — C3 EN 2113–2114 / DE 2420–2421.**  
    “All \(g\) that \(U\) obtains” obscures the domain condition. Replace the sentence ending with:

    ```tex
    for every $g$ in the image under $\op{U}$ of the domain of $\op{A}$.
    ```

15. **MINOR · English — C3 EN 2192–2194 / DE 2501–2503; L5 EN 84 / DE 84.**  
    “Number series” is a calque, and the C3 sentence lacks a clear verb for the action on an eigenvector. Replace C3’s explanation with:

    ```tex
    because by part~1 of the proposition every partial sum of the series is a polynomial in $\op{\Ham}$ and therefore acts on $\ket{\phi_x}$ as the corresponding partial sum of the convergent scalar series for $e^{-i t E_x/\hbar}$.
    ```

    In L5, replace `number series` with `scalar series`.

16. **MINOR · English — C3 EN 2212–2214 / DE 2521–2522.**  
    “Sorts by” and “stand in front of” are literal translations. Replace:

    - `if one sorts by these two kinds of terms` with `if we collect these two kinds of terms`;
    - `stand in front of` with `are the coefficients of`.

17. **MINOR · English — L5 EN 80 / DE 80.**  
    “Agrees with substituting” is incomplete, and “be Hermitian, in Lecture 6 the Hamiltonian” lacks a clear grammatical connection. Replace:

    - `this agrees with substituting` with `this agrees with substituting the operator into the polynomial`;
    - the sentence beginning “The most important case” with:

    ```tex
    The most important case: let $\op{\Ham} = \sum_x E_x\ketbra{\phi_x}{\phi_x}$ be Hermitian and let $t$ be real. In Lecture~6, $\op{\Ham}$ will be the Hamiltonian with energies $E_x$.
    ```

    Retain the following `Then`.

18. **MINOR · English — C4 EN 532–534 / DE 535–537.**  
    “First into the space … there multiply … and back” retains German elliptical syntax. Replace the text after the colon with:

    ```tex
    first use the unitary operator $\op{V}$ from the theorem to map into $\Ltwo{M}$, then multiply by the function $e^{-ita(m)/\hbar}$ of modulus $1$, and map back with $\op{V}\adj$.
    ```

19. **NIT · voice — C3 EN 1869–1872 / DE 2175–2178; L5 EN 27 / DE 27.**  
    Repeated impersonal “one” makes these introductory passages unnecessarily formal. Replace:

    - `Many calculations require that one \emph{diagonalise} an operator.` with `For many calculations we have to \emph{diagonalise} an operator.`;
    - `one always diagonalises one particular operator` with `we always diagonalise one particular operator`;
    - L5’s `That is why one often has to \emph{diagonalise} operators.` with `That is why we often have to \emph{diagonalise} operators.`

20. **NIT · English — C4 EN 61 / DE 61; L6 EN 16 / DE 16.**  
    Replace `each more special than the one before` with `each more specialised than the one before`.

21. **NIT · English — L6 EN 26 / DE 26.**  
    Replace `to the identity operator the one` with `to the identity operator the number one`.

22. **NIT · English — C3 EN 2223 / DE 2532; C4 EN 567 / DE 571; L6 EN 97 / DE 97.**  
    The duration expressions retain German articles. Replace `evolves in the time $t$` with `evolves over a time $t$`, and both occurrences of `after the time $t$` with `after a time $t$`.

For the postulates, **P0 and P2–P5 match TJO’s original wording**, allowing the specified mathematical notation. P1’s words also match, apart from the shared marker omission below. Both script glosses are acceptable: “general probabilistic theory” matches C2’s terminology, and the explanation of `$\BdOp{\Hil}$` is correct under the script’s explicit finite-dimensional restriction. Neither changes a postulate box.

One shared source issue is already present in the German and is **not counted as a translation finding**:

- **NIT · fidelity — C4 DE 75 / EN 73; L6 DE 19 / EN 19.** P1 omits the original `(*)` pointer from `statement_en` and `BRIEF.md:51`. Thus it is not strictly verbatim. Restore `Hilbert space (*)` in the course’s English branch and `Hilbert space $\Hil$ (*)` in the script, with the corresponding source marker and note restored in both editions. The original note is: `(*) Many-body QM is an extension of this axiom, and introduces the tensor operation, direct sum.` No further German defect was noticed.

No BLOCKER or MAJOR mathematical mistranslation was found. The English needs the local fidelity corrections and a prose pass addressing the recurring calques above before sign-off. Operator hats and British spelling show no additional deviations in the reviewed passages; the postulates require only resolution of the shared P1 marker omission.