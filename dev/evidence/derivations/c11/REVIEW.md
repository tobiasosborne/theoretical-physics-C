# Independent review of C11

The requested physics and numerical checks agree with the derivation. Two qualifications matter: the initial `golden.json` did not reproduce, and the evidence register overstates what the automated lecture checks establish. The golden file changed during this review and its later version matches the generator. CFKS also contains a printed mixed-term sign error; it does not affect the two-body case.

I wrote only this review. All renders, independent scripts, logs, and a later input snapshot are under `/tmp`. The review began on 2026-10-11 at 11:05 UTC. Book formulas below were read from rendered DjVu page images; the permitted text layers were used only to locate pages.

## A. Source audit

### A1. Reed–Simon III, §XI.4

**DjVu page 62, printed page 55.** These are transcriptions of the relevant displays or sentence, not formulas inferred from OCR:

| Item | Transcription |
|---|---|
| Coordinates | \(\mathbf R=(\mu_1+\mu_2)^{-1}(\mu_1\mathbf r_1+\mu_2\mathbf r_2),\quad\mathbf r_{12}=\mathbf r_1-\mathbf r_2.\) |
| Unitary | \((Uf)(\mathbf x,\mathbf y)=f((\mu_1+\mu_2)^{-1}(\mu_1\mathbf x+\mu_2\mathbf y),\mathbf x-\mathbf y).\) |
| Transformed interacting Hamiltonian | \(U\widetilde H U^{-1}=-\frac{1}{2(\mu_1+\mu_2)}\Delta_R-\frac{1}{2m}\Delta_{r_{12}}+V(\mathbf r_{12}).\) |
| Reduced mass and problem reference | \(m^{-1}=\mu_1^{-1}+\mu_2^{-1}\quad\text{(Problem 40)}.\) |
| Tensor decomposition | \(U\widetilde H_0U^{-1}=h_0\otimes I+I\otimes H_0,\quad U\widetilde HU^{-1}=h_0\otimes I+I\otimes H.\) |
| Factor Hamiltonians | \(h_0=-[2\mu_1+2\mu_2]^{-1}\Delta,\quad H_0=-(2m)^{-1}\Delta,\quad H=-(2m)^{-1}\Delta+V(\mathbf r).\) |
| Self-adjointness sentence | “Thus Kato's theorem (Theorem X.16) shows that \(\widetilde H\) is self-adjoint on \(C_0^\infty(\mathbb R^6)\).” |

The page assumes \(V\in L^2(\mathbb R^3)+L^\infty(\mathbb R^3)\). Its tensor formulas are initially stated on \(\widetilde D=C_0^\infty(\mathbb R^3)\otimes C_0^\infty(\mathbb R^3)\subset C_0^\infty(\mathbb R^6)\). It gives a parenthetical **reference** to Problem 40; this page does not state that problem or supply its proof.

**Comparison with §1:** the mass translation \(\mu_1=m_e,\mu_2=m_p,m=\mu\), relative-coordinate sign, and restoration of \(\hbar^2\) are correct. The derivation does not attribute its Coulomb splitting, SI constants, convolution, or closed-domain calculation to this page. It correctly identifies that the printed self-adjointness wording needs interpretation as essential self-adjointness of the initial restriction.

Its direction caveat is also justified. With the document's explicitly labelled old and new function spaces, the printed pullback is \(U=W^{-1}\), whereas the old-to-new transformation is \(WH_{\rm old}W^{-1}\). Literal forward pullback conjugation sends multiplication by \(V(r_1-r_2)\) to multiplication by the difference of the two pulled-back coordinates, not simply the second one. Thus the page's pullback and displayed conjugation cannot both be copied into that explicit representation without resolving this convention discrepancy. The independently derived \(W\), rather than an unqualified transplantation of the book's \(U\), is safe to use.

### A2. Reed–Simon II, X.15 and X.16

**Theorem X.15: DjVu page 175, printed page 165.** The hypothesis is real-valued \(V\in L^2(\mathbb R^3)+L^\infty(\mathbb R^3)\). The conclusion is transcribed as:

> “Then \(-\Delta+V(x)\) is essentially self-adjoint on \(C_0^\infty(\mathbb R^3)\) and self-adjoint on \(D(-\Delta)\).”

Here \(D(-\Delta)=H^2(\mathbb R^3)\) for the self-adjoint free Laplacian.

**Theorem X.16: DjVu page 176, printed page 166.** Its exact hypotheses are a finite collection \(\{V_k\}_{k=1}^m\) of real-valued measurable functions, each in \(L^2(\mathbb R^3)+L^\infty(\mathbb R^3)\); \(V_k(y_k)\) acts by multiplication on \(L^2(\mathbb R^{3n})\), with \(y_k\) chosen to be three coordinates of \(\mathbb R^{3n}\). Its conclusion is:

\[
-\Delta+\sum_{k=1}^m V_k(y_k)
\quad\text{is essentially self-adjoint on }C_0^\infty(\mathbb R^{3n}),
\]

where \(\Delta\) is the Laplacian on \(\mathbb R^{3n}\). The proof on the same image permits rotation of the chosen coordinate triple and proves infinitesimal relative boundedness with respect to \(-\Delta\). Unlike X.15, the **statement** of X.16 does not explicitly name the self-adjoint closure's domain. Its displayed relative-bound estimate and the invoked Kato–Rellich theorem identify that domain as \(D(-\Delta)=H^2(\mathbb R^{3n})\).

For \(V(r)=-c/|r|\), \(c>0\), splitting at \(|r|=b\) gives

\[
\int_{|r|<b}|V|^2\,d^3r=4\pi c^2b,
\qquad \|V1_{|r|\ge b}\|_\infty\le c/b.
\]

Thus **X.15 directly gives** essential self-adjointness on \(C_0^\infty(\mathbb R^3)\) and self-adjointness on \(H^2(\mathbb R^3)\) for the relative operator, after dividing by its positive kinetic coefficient. X.16 also includes this case with \(n=1\), but its explicit conclusion is the core statement.

For the two-body operator, **X.16 is the appropriate higher-dimensional theorem**, after a mass scaling and rotation. In units \(\hbar=1\), put \(x_i=\sqrt{2m_i}\,r_i\); the kinetic energy becomes \(-\Delta_x\). The three components of

\[
z=\frac{x_1/\sqrt{2m_1}-x_2/\sqrt{2m_2}}
{\sqrt{1/(2m_1)+1/(2m_2)}}
\]

are an orthonormal coordinate triple, and \(r_1-r_2=\gamma z\), where \(\gamma=\sqrt{1/(2m_1)+1/(2m_2)}\). The rescaled potential still belongs to the three-dimensional \(L^2+L^\infty\) class. Restoring \(\hbar\) merely changes the positive scaling. The two-body operator is essentially self-adjoint on \(C_0^\infty(\mathbb R^6)\); its closure has domain \(H^2(\mathbb R^6)\), equivalently the domain of the original positive, constant-coefficient kinetic operator. This latter domain follows from the proof's relative-bound argument. X.15 alone is not a six-dimensional theorem, and the pair potential must not be treated as an \(L^2(\mathbb R^6)\) function.

### A3. CFKS, §3.2

**DjVu page 40 is printed page 29; DjVu page 41 is printed page 30.** The offset was established by rendering, not assumed from Reed–Simon. Page 29 defines the mass-weighted centre of mass and its zero-centre-of-mass space \(X\). Page 30 chooses atomic coordinates \(y_i:=x_i-x_N\), \(i=1,\ldots,N-1\). All three requested equations are on **DjVu page 41 / printed page 30**:

\[
\widetilde H_0=
\left(-\frac1{2M}\Delta_R\right)\otimes1_{L^2(X)}
+1_{L^2(\mathbb R^\mu)}\otimes H_0.\tag{3.6}
\]

\[
H_0=-\sum_{i=1}^{N-1}\frac1{2\mu_i}\Delta_{y_i}
+\sum_{i<j}\frac1{m_N}\nabla_{y_i}\cdot\nabla_{y_j},
\qquad \frac1{\mu_i}:=\frac1{m_i}+\frac1{m_N}.\tag{3.7, as printed}
\]

\[
\widetilde H=-\left(\frac1{2M}\Delta_R\right)\otimes1+1\otimes H,
\qquad H=H_0+V.\tag{3.8}
\]

Here the book's \(\mu\) in \(\mathbb R^\mu\) denotes spatial dimension, not reduced mass. For \(N=2\), there is one atomic coordinate, no mixed-term sum, and \(\mu_1\) is exactly the two-body reduced mass. **“The N-body version in atomic coordinates” accurately describes this material**, although (3.6) and (3.8) apply to more general internal coordinates too.

**Source error:** the plus sign in the mixed term of printed (3.7) is wrong for the printed \(y_i=x_i-x_N\) and ordinary gradients. My independent three-particle calculation gives an internal inverse-mass matrix with off-diagonal entry \(+1/m_N\); multiplication by the kinetic prefactor \(-1/2\) makes the differential mixed term

\[
-\sum_{i<j}\frac1{m_N}\nabla_{y_i}\cdot\nabla_{y_j}.
\]

The transcription above preserves the source's plus sign; a chapter should use the corrected minus sign. This discrepancy disappears for \(N=2\).

## B. Independent calculations and executable audit

### B1. Kinetic transformation by canonical momenta

I used the Fourier phase, rather than the document's chain-rule calculation. Substitution in \(p_e\cdot r_e+p_p\cdot r_p\) gives

\[
P=p_e+p_p,\qquad p=\frac{m_p p_e-m_e p_p}{M},
\qquad p_e=\frac{m_e}{M}P+p,\quad p_p=\frac{m_p}{M}P-p.
\]

Direct expansion, independently simplified symbolically, gives zero residual in

\[
\frac{|p_e|^2}{2m_e}+\frac{|p_p|^2}{2m_p}
=\frac{|P|^2}{2M}+\frac{|p|^2}{2\mu},
\qquad \mu=\frac{m_em_p}{M}.
\]

Quantisation yields the claimed separated kinetic operator. The coordinate substitution has absolute determinant one, so no wavefunction amplitude factor is needed. Result 1.1 agrees, including its distinction between the differential calculation and operator-domain justification.

### B2. Laboratory electron density

For a factorised state, \(R\) and \(r\) are independent random vectors with densities \(f=|\Phi|^2\) and \(g=|\psi|^2\). Since \(X_e=R+br\), \(b=m_p/M\), their characteristic functions multiply as \(\chi_f(k)\chi_g(bk)\). Consequently my marginal formula is

\[
\rho_e(x)=\int f(R)\,b^{-3}g((x-R)/b)\,d^3R=(f*g_b)(x),
\qquad g_b(y)=b^{-3}g(y/b).
\]

Similarly \(X_p=R-ar\), \(a=m_e/M\), gives \(\rho_p=f*\widetilde g_a\), with \(\widetilde g_a(y)=a^{-3}g(-y/a)\). This agrees with §1b, including the reflection and both scaling factors. Its normalisation and stated localisation/infinite-mass limits are correct for the hydrogen densities considered.

For the specified 1s density and Gaussian COM packet, I integrated the angles analytically and used **one-dimensional Gauss–Legendre quadrature**, rather than the script's nested radius/cosine quadratures. In dimensionless lengths and for \(x>0\), the integrand was

\[
\rho_e(x)=\frac{\sigma^2}{bx}(\pi\sigma^2)^{-3/2}
\int_0^\infty r e^{-2r}
\left[e^{-(x-br)^2/\sigma^2}-e^{-(x+br)^2/\sigma^2}\right]dr.
\]

At \(\sigma=0.7\), \(x=1\), and the CODATA mass ratio, 50-digit working arithmetic gave

\[
\rho_e(1)=0.03792255016293097334857020846\,a_\mu^{-3}.
\]

This agrees with every digit printed in Result 1b.1. A separate double-precision QUADPACK integration gave \(0.03792255016293098\). Neither calculation is a certified quadrature-error bound.

I also checked the Fourier support argument, variance expansion, free kernel, and density approximation argument in 1b.2. They correctly establish absence of COM eigenfunctions, the conditional variance formula, and local dispersal for arbitrary \(L^2\) COM packets. The energy formula in 1b.3 is correct with its finite-energy qualification.

### B3. Norms, phases, and radial equations

Put \(x=Zr/a_\mu\), \(A=(Z/a_\mu)^{3/2}\). I directly integrated these three full wavefunctions with measure \(x^2\sin\theta\,dx\,d\theta\,d\phi\):

\[
\psi_{21,+1}/A=-\frac{x e^{-x/2}\sin\theta e^{i\phi}}{8\sqrt\pi},
\qquad
\psi_{21,-1}/A=+\frac{x e^{-x/2}\sin\theta e^{-i\phi}}{8\sqrt\pi},
\]

\[
\psi_{300}/A=\frac{(27-18x+2x^2)e^{-x/3}}{81\sqrt{3\pi}}.
\]

All three norms were **exactly one**. For either 2p state, angular integration leaves \(x^2e^{-x}/24\); the remaining norm is \(\int_0^\infty x^4e^{-x}dx/24=1\). The signs obey \(\psi_{21,-1}=-\overline{\psi_{21,+1}}\), as required by the stated Condon–Shortley convention.

My independently written radial functions

\[
f_{31}=\frac{4x(6-x)e^{-x/3}}{81\sqrt6},\qquad
f_{32}=\frac{4x^2e^{-x/3}}{81\sqrt{30}}
\]

both have norm one and give exactly zero in

\[
-\frac1{x^2}(x^2 f')'
+\left[\frac{\ell(\ell+1)}{x^2}-\frac2x+\frac19\right]f.
\]

They agree with the document. I checked the remaining displayed wavefunctions by their radial/angular factors and inspected the general normalisation proof. No additional wavefunction error was found.

### B4. Independent verdict on vl16.tex, lines 40–98

I read the actual permitted lecture lines. The incorrect displayed expressions are:

| Line | Independent finding and correction |
|---|---|
| 85 | The leading Laguerre coefficient must be positive: \(L_2^{(s)}(x)=x^2/2-(s+2)x+(s+1)(s+2)/2\). Independent differentiation of the Rodrigues expression gives this polynomial. Printed minus correct is \(-x^2\). |
| 94 | Each printed \(m=\pm1\) state has full norm squared \(1/2\). Replace its coefficient by \(\mp1/(8\sqrt\pi)\) in the stated CS convention. The missing magnitude factor is \(\sqrt2\); the phase choice is a separate matter. |
| 57, numerical value only | It is not the CODATA 2022 central value. The current input is \(5.29177210544(82)\times10^{-11}\,\mathrm m\). The difference is \(3.59\times10^{-20}\,\mathrm m\), or 4.378 of the 2022 standard uncertainties. This establishes outdated numerical data relative to the specified adjustment, not an error in the defining formula. |

The other displayed formulas in this range agree in the fixed-proton model: the radial equation, general radial prefactor, both expressions for \(\kappa\), \(E_n\), the definition of \(a_0\), the separated \(RY\) expression, \(L_0,L_1\), and the first three explicit states. For the finite-mass internal problem, \(m_e,a_0\) must consistently become \(\mu,a_\mu\). The photon energy is an internal gap under the stated neglect of recoil/radiation dynamics.

This agrees with the mathematical verdict in §6. For alpha transitions the Lyman/Balmer energy ratio is \(27/5=5.4\). The referenced figure was not read, so its complete arrow comparison is **COULD NOT CHECK**. The earlier introduction of the fixed-proton approximation is also **COULD NOT CHECK** within the permitted lecture range.

### B5. CODATA recomputation and precision

I parsed the CODATA file independently with a whitespace-field parser and used 65-digit decimal arithmetic, without importing the supplied checker. Every literal input quoted in §8.1 agrees with the file, including uncertainties and the ellipsis on \(\hbar\). I used exact \(h,c,e\), the directly tabulated mass ratio and Bohr radius, and \(hcR_\infty\).

| Quantity | Independent central value | Independent first-order uncertainty scale |
|---|---:|---:|
| \(m_e/m_p\) | \(5.446170214889\times10^{-4}\) | \(9.4\times10^{-15}\) |
| \(\mu/m_e\) | \(0.99945567942476152\) | \(9.38976955826347\times10^{-15}\) |
| \(a_0\), m | \(5.29177210544\times10^{-11}\) | \(8.2\times10^{-21}\) |
| \(a_\mu\), m | \(5.2946540946024628\times10^{-11}\) | \(8.20496328615412\times10^{-21}\) |
| \(E_1(m_e)\), eV | \(-13.605693122990514\) | \(1.48781038119840\times10^{-11}\) |
| \(E_1(m_e)\), J | \(-2.1798723611029889\times10^{-18}\) | \(2.38373502857871\times10^{-30}\) |
| \(E_1(\mu)\), eV | \(-13.598287264283289\) | \(1.49977596770640\times10^{-11}\) |
| \(E_1(\mu)\), J | \(-2.1786858117254469\times10^{-18}\) | \(2.40290601169393\times10^{-30}\) |
| Lyman-alpha vacuum, nm | \(121.56844561726744\) | \(1.34079704027939\times10^{-10}\) |
| Balmer-alpha vacuum, nm | \(656.46960633324418\) | \(7.24030401750871\times10^{-10}\) |

**Every central value in §8.2 agrees at all its printed digits. Every constant and uncertainty-scale string in `golden.json` agrees at all 17 significant digits.** The document's rounded uncertainty scales are indeed rounded upward from the absolute-derivative sums. The sum provides a conservative first-order standard-deviation bound without assuming independence of CODATA inputs. A rigorous interval bound or a propagated uncertainty using the actual covariance matrix is not established.

As additional independent consistency checks, primitive reconstruction gave \(a_0=5.2917721054434598\times10^{-11}\,\mathrm m\) and Rydberg energy \(2.1798723610991734\times10^{-18}\,\mathrm J\). Their deviations from the adopted adjusted constants are compatible with the primitive-input uncertainty scales. The directly tabulated and mass-division values of \(m_e/m_p\) differ by \(1.2457\times10^{-15}\), also compatible. The independently rounded Rydberg-energy entries differ from \(hcR_\infty\) by only \(1.1065\times10^{-32}\,\mathrm J\) and \(-5.1376\times10^{-13}\,\mathrm{eV}\).

The tabulated uncertainties support the precision claimed in §8 when its distinction between arithmetic reproducibility and physical accuracy is retained. They do **not** support treating the 17-digit golden strings as 17 physically determined digits. The wavelengths are the stipulated Coulomb internal-gap values, with the model exclusions already listed in the document.

I also independently integrated the six radial functions through \(n=3\). Their \((\langle x\rangle,\langle x^2\rangle,\langle1/x\rangle)\) values were, in the document's order:

\[
(3/2,3,1),\ (6,42,1/4),\ (5,30,1/4),\
(27/2,207,1/9),\ (25/2,180,1/9),\ (21/2,126,1/9).
\]

All six printed CDF polynomials differentiate to the corresponding radial densities. All 60 stored radial/CDF sample values agree at their final rounded digit. The general moment recurrence and Laguerre normalisation derivation also pass algebraic inspection.

### B6. Supplied verifier: results and limitations

The first execution of

```bash
python3 evidence/derivations/c11/check_hydrogen.py --verify
```

**exited with status 1**. Its complete short output, also its output tail, was:

```text
Exact symbolic checks passed.
Cloud quadrature: 0.037922550162930973 0.037922550162930973 relative error 2.1812e-23
Traceback (most recent call last):
  File "/home/tobias/Projects/theoretical-physics-C/evidence/derivations/c11/check_hydrogen.py", line 588, in <module>
    main()
  File "/home/tobias/Projects/theoretical-physics-C/evidence/derivations/c11/check_hydrogen.py", line 572, in main
    require(OUTPUT.read_bytes() == serialized, "golden.json byte mismatch")
  File "/home/tobias/Projects/theoretical-physics-C/evidence/derivations/c11/check_hydrogen.py", line 28, in require
    raise AssertionError(message)
AssertionError: golden.json byte mismatch
```

The initially read golden file lacked the six decimal `moments` objects and stored sample radii as strings (`"1/2"`, `"1"`, etc.). The generator emits those objects and numeric radii (`0.5`, `1.0`, etc.). This was a schema/serialization discrepancy, not a failure of the preceding mathematical assertions.

**Input changed during the review:** `golden.json` was subsequently replaced, with recorded modification time 11:10:28 UTC. I did not write it. A later read contained the decimal moments and numeric radii and matched a generator output created only under `/tmp`. The later file's SHA256 is `9ab77fae62332e3413f5639910a891b0a1f8847dfc9d635e9b2f0321c8d60c17`. The derivation and checker hashes at that snapshot were, respectively, `61e8adafe5a9ea7343cc1fd5e4327483cdeb2e8160368ca426a9f214a9202a25` and `9da5ec1a6c1c601cad89b528ec436962f4de8144bc82f22f6c720f393b676b2f`.

The second execution of the same required command **exited with status 0** and printed `golden.json reproduced byte-for-byte.` Its SHA256 matched the later file above. Its output tail was:

```text
Constants (central value; first-order uncertainty scale upper bound):
m_e_over_m_p 5.4461702148890000e-4 1 9.4000000000000000e-15
mu_over_m_e 0.99945567942476152 1 9.3897695582634697e-15
a_0 5.2917721054400000e-11 m 8.2000000000000000e-21
a_mu 5.2946540946024628e-11 m 8.2049632861541203e-21
E_1_m_e_J -2.1798723611029889e-18 J 2.3837350285787144e-30
E_1_m_e_eV -13.605693122990514 eV 1.4878103811984031e-11
E_1_mu_J -2.1786858117254469e-18 J 2.4029060116939271e-30
E_1_mu_eV -13.598287264283289 eV 1.4997759677063965e-11
Lyman_alpha_vacuum 1.2156844561726744e-7 m 1.3407970402793910e-19
Balmer_alpha_vacuum 6.5646960633324418e-7 m 7.2403040175087116e-19
```

The code audit found meaningful tests and important limits:

- Exact radial norms, radial-equation residuals, angular definitions/eigenvalues/orthonormality, explicit full norms, moment comparisons, and CDF derivatives genuinely test mathematical constraints. Their finite ranges agree with the document; most use exact symbolic arithmetic, not floating tolerances.
- The checker reads CODATA and the golden file. It **does not read `DERIVATION.md` or `vl16.tex`**. It cannot detect a disagreement introduced into either document unless its hardcoded copies are changed too.
- The “lecture lines 91–93” comparisons subtract duplicate literal expressions from matching expressions in `explicit`; their agreement is predetermined by those copies. The fixed rational alpha-gap ratio assertion likewise cannot fail because of lecture content. These are not independent checks of the source file.
- The wavelength/internal-gap assertions compare quantities assembled from the same \(q,R_\infty,h,c\) definitions. They establish algebraic consistency, not independent physical validation. The primitive-constant comparisons, in contrast, use separately rounded inputs and are useful consistency checks.
- The cloud tolerance \(10^{-14}\) at 22 working digits is reasonable for a consistency test. Agreement of two integrals does not bound their common error. My different quadrature supplies additional evidence for the displayed number.
- The uncertainty-scale consistency tolerances are appropriate for rounded CODATA inputs, but cannot establish extra physical significant digits. Byte comparison with generated golden data checks serialization drift; it is not independent validation of the generating formulas.
- No tests establish operator self-adjointness, spectral completeness, arbitrary-packet dispersal, recoil, or every interpretive qualification in the lecture ledger. Those require mathematical argument or source inspection.

## C. Verdict on every numbered result

“AGREE” refers to the stated mathematical result within its declared model and scope. The two disagreements below concern evidence/reproducibility claims, not a newly discovered hydrogen wavefunction error.

| Result | Verdict | Evidence or correction |
|---|---|---|
| 1.1 | AGREE | Independent canonical-momentum calculation; unit absolute Jacobian and correct inverse coordinates. |
| 1.2 | AGREE | Page-image transcriptions, sign/mass translation, and pullback caveat agree. A2 supplies the previously unchecked theorem/domain distinction. |
| 1.3 | AGREE | Relative coordinate and infinite-nuclear-mass interpretation follow from the separated operator. |
| 1b.1 | AGREE | Independent characteristic-function derivation and different quadrature, including scaling and reflection. |
| 1b.2 | AGREE | Fourier support, finite-moment variance, and local-dispersal arguments checked. |
| 1b.3 | AGREE | Additive COM/internal expectation with the stated finite-energy condition. |
| 2.1 | AGREE | Correct radial operator, regular constructed solutions, and normalisation measure. |
| 2.2 | AGREE | Correct scale, polynomial condition, energies and family count; no completeness proof is claimed. |
| 3.1 | AGREE | Finite-sum convention, recurrence and Laguerre equation agree. |
| 3.2 | AGREE | Rodrigues/orthogonality proof and prefactor agree; the executed exact checks cover the stated finite ranges. |
| 4.1 | AGREE | Correct CS harmonics and conjugation signs; exact checks cover all nine functions and 81 pairs. |
| 5.1 | AGREE | Fourteen correctly normalised states; independent full norms for three and radial checks for 3p/3d. |
| 6.1 | AGREE | Independent reading confirms the formula ledger, including the two analytic defects and outdated numerical Bohr radius. Evidence-attribution qualification is below. |
| 7.1 | AGREE | Recurrence algebra and independently integrated moments agree. |
| 7.2 | AGREE | All six expanded CDFs pass independent differentiation and stored numerical-sample comparison. |
| 7.3 | AGREE | Enclosed-probability spheres and density-threshold regions have the stated distinct meanings. |
| 8.1 | AGREE | All quoted CODATA rows, values, uncertainties and units agree. |
| 8.2 | AGREE | Independent decimal computation agrees at every displayed digit; precision qualifications and conservative scales are appropriate. |
| 9.1 | DISAGREE | **Evidence attribution:** “Every lecture formula verdict” is not established by `check_lecture_formulas`/`check_constants`. Correct statement: the ledger combines manual lecture inspection and interpretation with finite exact tests of hardcoded formulas. B6 demonstrates the duplicate comparisons and absent source reads. Its mathematical chapter statements otherwise agree. |
| 9.2 | AGREE | Appropriate exclusions and finite-check limits. This review adds the theorem audit but does not supply the excluded physical/completeness results. |
| 9.3 | DISAGREE | **Initial reproducibility claim:** the first required command exited 1. Correct statement: the initially supplied golden file did not reproduce; only the later replaced file matches the current generator. B6 records both states and the later file hash. |

A chapter author may safely take:

- The exact two-body reduction using the explicitly defined \(W\), reduced mass, relative wavefunctions, normalisation, moments and CDFs.
- The laboratory marginal convolutions and the distinction between a relative orbital and a freely moving atom's laboratory cloud.
- The corrected lecture Laguerre polynomial and 2p amplitudes, and CODATA-based model numbers with their stated uncertainty/model limits.
- The self-adjointness statements with the precise core/domain distinctions in A2.

A chapter author should not take:

- The initial reproducibility claim, or the evidence register's assertion that the automated functions establish every lecture verdict.
- An unqualified literal transplantation of Reed–Simon's printed pullback/conjugation, or CFKS (3.7)'s printed plus sign for atomic-coordinate differential mixed terms.
- Completeness of the Coulomb spectrum, resolved physical spectral-line accuracy, radiation/selection rules, or a laboratory cloud independent of the COM state.

**COULD NOT CHECK / outside the permitted or established scope:** the referenced figure and its full arrow comparison; lecture material outside lines 40–98, including the earlier fixed-proton introduction; the actual statement of Problem 40; historical/astronomical claims and provenance of the old Bohr-radius adjustment; CODATA covariances; completeness beyond the constructed family; omitted physical corrections and emission dynamics; arbitrary-state numerical cloud/isosurface computations and certified quadrature bounds. All specifically requested A/B source, formula, numerical and executable checks were completed, subject to the recorded change of input.
