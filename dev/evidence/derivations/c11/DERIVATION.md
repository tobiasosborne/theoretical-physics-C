# C11: hydrogen derivation and verification record

Scope: the nonrelativistic, spinless, two point-particle Coulomb model in SI units. Hydrogen means \(Z=1\); keeping \(Z>0\) symbolic also describes this model for a point nucleus of charge \(Ze\) and the chosen nuclear mass. The only lecture inspected is `latex/lectures/de/vl16.tex`, lines 1–98. The book formulas were read from the rendered image of `sources/reed-simon-3/reed-simon-3.djvu`, DjVu page 62, printed page 55, §XI.4; no book text layer was used. Constants come exclusively from `sources/codata-2022/allascii.txt`.

Each numbered result below states its evidence type. “Checked” means an assertion implemented in `check_hydrogen.py`; a finite range of checks is identified explicitly and is not a proof of completeness. Angular separation is the stated prerequisite from the angular momentum chapter. No spectral completeness theorem is proved here.

## 1. Two-body reduction

**Result 1.1 — derived; independently symbolically checked by `check_coordinates`.** Start on
\[
\mathcal H=L^2(\mathbb R^3_{r_e})\otimes L^2(\mathbb R^3_{r_p})=L^2(\mathbb R^6),\qquad
H=-\frac{\hbar^2}{2m_e}\Delta_e-\frac{\hbar^2}{2m_p}\Delta_p+V(r_e-r_p),\quad
V(r)=-\frac{Ze^2}{4\pi\epsilon_0|r|}.
\]
The potential is the model definition, also displayed in vl16, line 22. Choose
\[
M=m_e+m_p,\quad \mu=\frac{m_em_p}{M},\quad
R=\frac{m_er_e+m_pr_p}{M},\quad r=r_e-r_p.
\]
Since \(r_e=r_p+r\), substitution into \(MR=m_er_e+m_pr_p\) gives
\[
r_p=R-\frac{m_e}{M}r,\qquad r_e=R+\frac{m_p}{M}r.
\]
For each Cartesian component the forward matrix is
\[
A=\begin{pmatrix}m_e/M&m_p/M\\1&-1\end{pmatrix},\qquad
\det A=-\frac{m_e+m_p}{M}=-1.
\]
Thus the six-dimensional determinant is \((-1)^3=-1\), and its **absolute Jacobian is 1**. The signed determinant is not \(+1\). With
\[
(W\Psi)(R,r)=\Psi\left(R+\frac{m_p}{M}r,R-\frac{m_e}{M}r\right),
\]
change of variables gives \(\|W\Psi\|_2^2=\|\Psi\|_2^2\); the inverse substitution exists, so \(W\) is unitary.

For a smooth function \(f(R,r)\), the chain rule gives, component by component,
\[
\nabla_e=\frac{m_e}{M}\nabla_R+\nabla_r,\qquad
\nabla_p=\frac{m_p}{M}\nabla_R-\nabla_r,
\]
and hence
\[
\begin{aligned}
\Delta_e&=\frac{m_e^2}{M^2}\Delta_R+\Delta_r+\frac{2m_e}{M}\nabla_R\!\cdot\!\nabla_r,\\
\Delta_p&=\frac{m_p^2}{M^2}\Delta_R+\Delta_r-\frac{2m_p}{M}\nabla_R\!\cdot\!\nabla_r.
\end{aligned}
\]
The mixed coefficient in \(\Delta_e/m_e+\Delta_p/m_p\) is \(2/M-2/M=0\); the other coefficients are
\[
\frac{m_e+m_p}{M^2}=\frac1M,\qquad
\frac1{m_e}+\frac1{m_p}=\frac1\mu.
\]
Consequently,
\[
WHW^{-1}=
\underbrace{-\frac{\hbar^2}{2M}\Delta_R}_{H_{\rm cm}}\otimes1
+1\otimes\underbrace{\left[-\frac{\hbar^2}{2\mu}\Delta_r+V(r)\right]}_{H_{\rm rel}}.
\]
This calculation is an identity of differential expressions on smooth compactly supported functions, with the Coulomb multiplication interpreted almost everywhere; one may initially avoid the collision set \(r=0\). It does not itself identify a closed operator domain or prove self-adjointness.

**Result 1.2 — source-quoted comparison, with the Coulomb hypothesis derived.** Reed–Simon III, §XI.4, printed p. 55 (DjVu p. 62), displays the following sequence:

| Rendered book statement | Translation into this document |
|---|---|
| \(\widetilde H_0=-(2\mu_1)^{-1}\Delta_1-(2\mu_2)^{-1}\Delta_2\) | \(\mu_1=m_e,\ \mu_2=m_p\); restore \(\hbar^2\). |
| \(\widetilde H=\widetilde H_0+V(r_1-r_2)\) | \(r_1=r_e,\ r_2=r_p\); same potential argument. |
| \(R=(\mu_1+\mu_2)^{-1}(\mu_1r_1+\mu_2r_2),\ r_{12}=r_1-r_2\) | Exactly our \(R,r\), including the sign. |
| \((Uf)(x,y)=f((\mu_1+\mu_2)^{-1}(\mu_1x+\mu_2y),x-y)\) | This is forward-coordinate pullback; our \(W\) uses the inverse substitution, so \(U=W^{-1}\) when these function spaces are identified by their coordinate labels. |
| \(m^{-1}=\mu_1^{-1}+\mu_2^{-1}\), followed by “Problem 40” | Their \(m\) is our reduced mass \(\mu\); Result 1.1 supplies the omitted calculation. |
| Displayed kinetic coefficients \(-[2(\mu_1+\mu_2)]^{-1}\Delta_R\), \(-(2m)^{-1}\Delta_{r_{12}}\) | Exactly \(-\hbar^2\Delta_R/(2M)\) and \(-\hbar^2\Delta_r/(2\mu)\) after restoring units. |
| \(h_0\otimes I+I\otimes H\), with \(h_0=-[2\mu_1+2\mu_2]^{-1}\Delta\), \(H=-(2m)^{-1}\Delta+V\) | The same centre-of-mass/internal tensor decomposition. |

The book writes the conjugation as \(U\widetilde H U^{-1}\) and names its transformed coordinate operators \(R,r_{12}\). Our old-to-new wavefunction convention writes \(WHW^{-1}\) with ordinary derivatives in the explicit new variables. Literally, the displayed composition maps satisfy \(U=W^{-1}\), so our conjugation is \(U^{-1}H_{\rm old}U\). The page's displayed conjugation and forward pullback therefore cannot both be transplanted literally into this explicit old-to-new representation. We use the independently derived map \(W\); the book's displayed mass coefficients and potential agree with the result. This direction caveat is separate from the relative-coordinate sign, which agrees exactly.

The page invokes Kato's theorem (its Theorem X.16) under \(V\in L^2(\mathbb R^3)+L^\infty(\mathbb R^3)\). For Coulomb, split at any radius \(b>0\): the inner piece has squared integral proportional to \(4\pi\int_0^b dr<\infty\); the outer piece is bounded by \(Ze^2/(4\pi\epsilon_0b)\). The hypothesis is therefore satisfied. The printed page calls the operator self-adjoint on \(C_0^\infty(\mathbb R^6)\); here this is cited as the assertion of essential self-adjointness of that initial restriction and self-adjointness of its closure, not a claim that the unclosed restriction is already self-adjoint. The theorem itself and the closed domain were not independently checked.

**Result 1.3 — derived from 1.1.** The bound-state function \(\psi_{n\ell m}\) is a function of the **relative coordinate**. The centre of mass evolves freely. The relative reduction is exact in this model; replacing \(\mu\) by \(m_e\) is the infinite-nuclear-mass approximation.

## 1b. Centre of mass and the meaning of a cloud

**Result 1b.1 — derived; numerical check by `check_cloud_convolution`.** Let \(\Phi,\psi\) each have norm one and set
\[
\Psi(x_e,x_p)=\Phi(R)\psi(r),\qquad
a=\frac{m_e}{M},\quad b=\frac{m_p}{M},\quad a+b=1,
\quad f(R)=|\Phi(R)|^2,\quad g(r)=|\psi(r)|^2.
\]
At fixed electron position \(x_e=x\), write \(r=x-x_p\), so \(d^3x_p=d^3r\) and \(R=x-br\). Then
\[
\rho_e(x)=\int f(x-br)g(r)\,d^3r
=\int f(R)\,b^{-3}g\left(\frac{x-R}{b}\right)d^3R
=(f*g_b)(x),\quad g_b(y)=b^{-3}g(y/b).
\]
The second substitution is \(R=x-br\), with absolute Jacobian \(b^3\). At fixed proton position \(x_p=x\), \(r=x_e-x\), \(R=x+ar\); thus
\[
\rho_p(x)=\int f(x+ar)g(r)\,d^3r
=\int f(R)\,a^{-3}g\left(\frac{R-x}{a}\right)d^3R
=(f*\widetilde g_a)(x),\quad \widetilde g_a(y)=a^{-3}g(-y/a).
\]
The proton includes reflection; it can be omitted for the definite-parity states considered here because their densities are even. Both marginal densities integrate to one by change of variables and the separate normalisations.

If \(f\) tends to \(\delta(R-R_0)\) as an approximate identity, the electron density tends to
\[
\left(\frac{M}{m_p}\right)^3
\left|\psi\left(\frac{M}{m_p}(x-R_0)\right)\right|^2,
\]
and the proton density to \((M/m_e)^3|\psi((M/m_e)(R_0-x))|^2\). These limits are distributional, and pointwise wherever the limiting density is continuous. This limit is a sequence of COM packets, not a normalisable delta-function state. As \(m_p\to\infty\), \(b\to1,\ a\to0,\ \mu\to m_e\), so \(\rho_e\to f*g\) and \(\rho_p\to f\) in the corresponding approximate-identity sense. Combining this with a localised COM gives the usual density \(g(x-R_0)\) and a pointlike nuclear marginal.

The numerical test uses \(Z=1\), lengths in \(a_\mu\),
\[
g(r)=\pi^{-1}e^{-2|r|},\quad
f(R)=(\pi\sigma^2)^{-3/2}e^{-|R|^2/\sigma^2},\quad \sigma=0.7,
\]
and the CODATA mass ratio. It compares the original laboratory \(x_p\) integral with the rescaled convolution at \(|x|=1\). Both are three-dimensional spherical volume integrals, with the azimuthal integral evaluated exactly as \(2\pi\) by axial symmetry and numerical quadrature over radius and polar cosine. Each gives
\[
\rho_e(|x|=a_\mu)=0.037922550162930973\,a_\mu^{-3}.
\]
At 22 working decimal places their relative difference is \(2.2\times10^{-23}\), at the working-precision floor; the enforced acceptance tolerance is \(10^{-14}\). Agreement of quadratures is a numerical check, not a certified quadrature-error bound.

**Result 1b.2 — derived by Fourier transformation.** Define the unitary Fourier transform with kernel \((2\pi)^{-3/2}e^{-ik\cdot R}\). Integration by parts sends \(-\Delta\Phi\) to \(|k|^2\widehat\Phi\). An \(L^2\) eigenfunction at eigenvalue \(\lambda\) would satisfy
\[
(|k|^2-\lambda)\widehat\Phi(k)=0\quad\text{almost everywhere}.
\]
For \(\lambda<0\) the factor never vanishes; for \(\lambda\ge0\) its zero set is a sphere (or a point), a set of three-dimensional measure zero. An \(L^2\) function supported there is zero. Thus \(-\Delta\) has no \(L^2\) eigenfunctions, and a normalised \(\Phi\) must be a free wave packet, not a plane-wave eigenstate. A nonzero plane wave has constant modulus, so its squared integral over \(\mathbb R^3\) diverges.

For packets with finite position and momentum second moments, the free evolution in Fourier space is multiplication by \(e^{-i\hbar|k|^2t/(2M)}\). Differentiating this factor gives \(R(t)=R(0)+tP/M\). Subtracting means and squaring yields
\[
\operatorname{Var}R(t)=\operatorname{Var}R(0)
+\frac{t}{M}\langle\delta R\cdot\delta P+\delta P\cdot\delta R\rangle
+\frac{t^2}{M^2}\operatorname{Var}P.
\]
Here each variance is the sum over the three components. A nonzero \(L^2\) packet cannot have zero momentum variance, since that would concentrate its Fourier transform at one point. It therefore spreads at large \(|t|\); it need not widen monotonically because the covariance can initially focus it. No finite-variance claim is made for packets lacking those moments. In contrast \(\psi(t)=e^{-iE_nt/\hbar}\psi(0)\), so its relative density is time-independent. Laboratory marginal densities inherit the COM motion and dispersal.

Dispersal can also be stated without a second-moment assumption: probability in every fixed bounded spatial region tends to zero as \(|t|\to\infty\). To see this, start with a smooth rapidly decreasing packet. Fourier inversion has kernel
\[
K_t(z)=(2\pi)^{-3}\lim_{\varepsilon\downarrow0}
\int e^{-(\varepsilon+i\hbar t/(2M))|k|^2+ik\cdot z}\,d^3k.
\]
For \(\operatorname{Re}A>0\), the one-dimensional Gaussian integral obeys
\[
I(A,z)=\int e^{-Ak^2+ikz}\,dk,\qquad
\partial_z I=-\frac{z}{2A}I,\qquad I(A,0)=\sqrt{\frac{\pi}{A}}.
\]
The derivative identity follows by integrating the \(k\)-derivative of the integrand; the zero-argument Gaussian integral follows by squaring and polar integration for real \(A>0\), then analytic continuation. Hence \(I(A,z)=\sqrt{\pi/A}e^{-z^2/(4A)}\). Applying this in three coordinates and taking the damped limit gives, for \(t\ne0\),
\[
K_t(z)=\left(\frac{M}{2\pi i\hbar t}\right)^{3/2}
e^{iM|z|^2/(2\hbar t)},\qquad
|K_t(z)|=\left(\frac{M}{2\pi\hbar|t|}\right)^{3/2}.
\]
The complex power is fixed by the preceding damped limit. Thus
\[
\|\Phi_t\|_\infty\le
\left(\frac{M}{2\pi\hbar|t|}\right)^{3/2}\|\Phi_0\|_1.
\]
For arbitrary \(L^2\) initial data, choose a smooth rapidly decreasing \(g\) with \(\|\Phi_0-g\|_2<\epsilon\). Fourier multiplication preserves the \(L^2\) norm. For a bounded region \(B\), the triangle inequality therefore gives
\[
\|1_B\Phi_t\|_2\le\epsilon+
|B|^{1/2}\left(\frac{M}{2\pi\hbar|t|}\right)^{3/2}\|g\|_1.
\]
First let \(|t|\to\infty\), then \(\epsilon\downarrow0\). This proves the stated local dispersal for every normalised COM packet. It does not assert pointwise decay or monotonic widening of an arbitrary density.

**Result 1b.3 — derived.** On a factorised state with finite energy expectation,
\[
\langle H\rangle=\frac{\hbar^2}{2M}\int|\nabla\Phi|^2d^3R+E_n.
\]
The first term follows by integration by parts; \(E_n\) is an internal level, not the total energy of a normalised freely moving atom. Generalised states with COM momentum \(P\) have formal total energy \(P^2/(2M)+E_n\).

## 2. Relative radial problem

**Result 2.1 — derived after the stipulated angular separation; checked by `check_radial_equation`.** Write \(\psi=R(r)Y_\ell^m\), with angular eigenvalue \(\ell(\ell+1)\), and \(u=rR\). Since
\[
\frac1{r^2}\frac d{dr}\left(r^2\frac d{dr}\frac ur\right)=\frac{u''}{r},
\]
the relative equation becomes
\[
\left[-\frac{\hbar^2}{2\mu}\frac{d^2}{dr^2}
+\frac{\hbar^2\ell(\ell+1)}{2\mu r^2}
-\frac{Ze^2}{4\pi\epsilon_0r}\right]u=Eu.
\]
The bound radial functions below are regular at the origin, \(u(0)=0\), decay at infinity, and obey \(\int_0^\infty|u|^2dr=1\).

**Result 2.2 — definitions and algebraic derivation; checked by `check_constants` and `check_radial_equation`.** Choose
\[
a_\mu=\frac{4\pi\epsilon_0\hbar^2}{\mu e^2},\qquad
a_0=\frac{4\pi\epsilon_0\hbar^2}{m_e e^2}.
\]
Dividing these definitions and substituting \(\mu\) gives
\[
a_\mu=a_0\frac{m_e}{\mu}=a_0\left(1+\frac{m_e}{m_p}\right).
\]
For \(E<0\), set \(\kappa=\sqrt{-2\mu E}/\hbar\), \(s=2\kappa r\), and \(u=s^{\ell+1}e^{-s/2}v(s)\). Differentiation and cancellation give
\[
sv''+(2\ell+2-s)v'+\left(\frac{Z}{\kappa a_\mu}-\ell-1\right)v=0.
\]
Writing \(v=\sum_jc_js^j\) gives
\[
c_{j+1}=\frac{j-k}{(j+1)(j+2\ell+2)}c_j,\qquad
k=\frac{Z}{\kappa a_\mu}-\ell-1.
\]
The polynomial choice terminates for \(k=n-\ell-1\in\{0,1,\ldots\}\). Therefore this bound-state family has
\[
\kappa_n=\frac{Z}{na_\mu},\qquad
E_n=-\frac{\hbar^2Z^2}{2\mu a_\mu^2n^2}
=-\frac{Z^2e^2}{8\pi\epsilon_0a_\mu n^2}.
\]
This constructs solutions with \(n\ge1\), \(0\le\ell\le n-1\), \(-\ell\le m\le\ell\). It is not an independent proof that all negative-energy eigenstates have been exhausted. Within this family, \(E_n\) is independent of \(\ell,m\), has multiplicity \(\sum_{\ell=0}^{n-1}(2\ell+1)=n^2\) excluding spin, and approaches \(0\) from below as \(n\to\infty\).

## 3. Laguerre convention and radial normalisation

**Result 3.1 — explicit convention; numerically-checked by `check_laguerre`.** Choose the associated Laguerre convention used by SymPy's `assoc_laguerre`:
\[
L_k^{(\alpha)}(s)=\sum_{j=0}^k(-1)^j\binom{k+\alpha}{k-j}\frac{s^j}{j!},\qquad
L_k^{(\alpha)}(0)=\binom{k+\alpha}{k}.
\]
For the radial problem \(k=n-\ell-1\), \(\alpha=2\ell+1\). Ratios of successive finite-sum coefficients give the recurrence in Result 2.2, so the polynomial solves \(sL''+(\alpha+1-s)L'+kL=0\).

**Result 3.2 — derived normalisation; exact checks for every \(n\le6\) by `check_radial_normalization`.** In this convention,
\[
R_{n\ell}(r)=N_{n\ell}(2\kappa_nr)^\ell e^{-\kappa_nr}
L_{n-\ell-1}^{(2\ell+1)}(2\kappa_nr),\qquad
N_{n\ell}=\sqrt{\frac{(n-\ell-1)!(2\kappa_n)^3}{2n(n+\ell)!}}.
\]
To prove the general normalisation, the finite sum also gives the Rodrigues identity
\[
L_k^{(\alpha)}(s)=\frac{s^{-\alpha}e^s}{k!}
\frac{d^k}{ds^k}\left(e^{-s}s^{k+\alpha}\right).
\]
Leibniz expansion recovers each coefficient in Result 3.1. Integrating by parts \(k\) times against a polynomial of degree less than \(k\) proves orthogonality under the weight \(s^\alpha e^{-s}\). Against \(L_k\), whose leading coefficient is \((-1)^k/k!\), the same integrations give
\[
\int_0^\infty s^\alpha e^{-s}(L_k^{(\alpha)}(s))^2ds=\frac{(k+\alpha)!}{k!}.
\]
Boundary terms vanish for the integer \(\alpha\ge1\) used here. Coefficient comparison in the finite sums gives
\[
sL_k^{(\alpha)}=(2k+\alpha+1)L_k^{(\alpha)}
-(k+1)L_{k+1}^{(\alpha)}-(k+\alpha)L_{k-1}^{(\alpha)},
\]
with \(L_{-1}=0\). Multiplication by \(L_k\) and weighted integration removes the cross terms, leaving
\[
\int_0^\infty s^{\alpha+1}e^{-s}(L_k^{(\alpha)})^2ds
=(2k+\alpha+1)\frac{(k+\alpha)!}{k!}
=\frac{2n(n+\ell)!}{(n-\ell-1)!}.
\]
Finally \(r^2dr=s^2ds/(2\kappa_n)^3\), so multiplication by \(N_{n\ell}^2/(2\kappa_n)^3\) gives one. The prefactor in vl16, line 45, is therefore correct with this convention. All 21 pairs \(1\le n\le6\), \(0\le\ell<n\) are checked by exact direct integration. All ten pairs with \(n\le4\) are checked by symbolic substitution into the radial equation. Scaling \(x=Zr/a_\mu\) makes these checks valid for arbitrary positive \(Z,a_\mu\).

## 4. Spherical harmonics through ℓ = 2

**Result 4.1 — explicit Condon–Shortley choice; numerically-checked formulas and orthonormality by `check_spherical_harmonics`.** Define \(t=\cos\theta\),
\[
P_\ell(t)=\frac1{2^\ell\ell!}\frac{d^\ell}{dt^\ell}(t^2-1)^\ell,
\]
and, for \(m\ge0\),
\[
Y_\ell^m=(-1)^m\sqrt{\frac{2\ell+1}{4\pi}\frac{(\ell-m)!}{(\ell+m)!}}
(1-t^2)^{m/2}\frac{d^mP_\ell}{dt^m}e^{im\phi},\qquad
Y_\ell^{-m}=(-1)^m\overline{Y_\ell^m}.
\]
The phase is a choice, not an inferred physical fact. The resulting explicit formulas are
\[
\begin{aligned}
Y_0^0&=\frac1{\sqrt{4\pi}},\\
Y_1^0&=\sqrt{\frac3{4\pi}}\cos\theta,&
Y_1^{\pm1}&=\mp\sqrt{\frac3{8\pi}}\sin\theta\,e^{\pm i\phi},\\
Y_2^0&=\sqrt{\frac5{16\pi}}(3\cos^2\theta-1),&
Y_2^{\pm1}&=\mp\sqrt{\frac{15}{8\pi}}\sin\theta\cos\theta\,e^{\pm i\phi},\\
Y_2^{\pm2}&=\sqrt{\frac{15}{32\pi}}\sin^2\theta\,e^{\pm2i\phi}.
\end{aligned}
\]
For all 81 pairs among these nine functions the script evaluates
\[
\int_0^{2\pi}\int_{-1}^{1}\overline{Y_\ell^m}Y_{\ell'}^{m'}\,dt\,d\phi
=\delta_{\ell\ell'}\delta_{mm'}.
\]
It also checks their definitions and angular differential equations exactly.

## 5. All wavefunctions with n ≤ 3

**Result 5.1 — numerically-checked by `check_wavefunctions` and `check_radial_normalization`.** Put \(x=Zr/a_\mu\), \(A=(Z/a_\mu)^{3/2}\). Every following formula includes the common factor \(A\). Paired signs label the upper/lower \(m\) values, respectively:
\[
\begin{aligned}
\psi_{100}/A&=\pi^{-1/2}e^{-x},\\
\psi_{200}/A&=\frac{(2-x)e^{-x/2}}{4\sqrt{2\pi}},\\
\psi_{210}/A&=\frac{xe^{-x/2}\cos\theta}{4\sqrt{2\pi}},\\
\psi_{21,\pm1}/A&=\mp\frac{xe^{-x/2}\sin\theta\,e^{\pm i\phi}}{8\sqrt\pi},\\
\psi_{300}/A&=\frac{(27-18x+2x^2)e^{-x/3}}{81\sqrt{3\pi}},\\
\psi_{310}/A&=\frac{2x(6-x)e^{-x/3}\cos\theta}{81\sqrt{2\pi}},\\
\psi_{31,\pm1}/A&=\mp\frac{x(6-x)e^{-x/3}\sin\theta\,e^{\pm i\phi}}{81\sqrt\pi},\\
\psi_{320}/A&=\frac{x^2e^{-x/3}(3\cos^2\theta-1)}{81\sqrt{6\pi}},\\
\psi_{32,\pm1}/A&=\mp\frac{x^2e^{-x/3}\sin\theta\cos\theta\,e^{\pm i\phi}}{81\sqrt\pi},\\
\psi_{32,\pm2}/A&=\frac{x^2e^{-x/3}\sin^2\theta\,e^{\pm2i\phi}}{162\sqrt\pi}.
\end{aligned}
\]
These ten rows enumerate fourteen states. The script compares each to the general \(R_{n\ell}Y_\ell^m\) formula and checks its exact full norm. The radial dimensionless forms \(R/A\), useful for a renderer, are
\[
2e^{-x},\quad \frac{(2-x)e^{-x/2}}{2\sqrt2},\quad
\frac{xe^{-x/2}}{2\sqrt6},\quad
\frac{2(27-18x+2x^2)e^{-x/3}}{81\sqrt3},\quad
\frac{4x(6-x)e^{-x/3}}{81\sqrt6},\quad
\frac{4x^2e^{-x/3}}{81\sqrt{30}},
\]
in the order \(1s,2s,2p,3s,3p,3d\).

## 6. Verdict on vl16.tex, lines 40–98

**Result 6.1 — numerically-checked with exact arithmetic by `check_lecture_formulas`; constant comparison by `check_constants`.** “CORRECT” below means correct in the explicitly introduced fixed-proton approximation, using \(m_e,a_0\). To present the exact two-body internal problem, replace \(m_e\) by \(\mu\) and \(a_0\) by \(a_\mu\) consistently.

| Lines | Verdict | Evidence and corrected form where needed |
|---|---|---|
| 41: radial equation | CORRECT for fixed proton | Result 2.1 with \(\mu\to m_e\); use \(\mu\) for finite nuclear mass. |
| 45: \(R_{n\ell}\) and prefactor | CORRECT | Result 3.2; exact norms through \(n=6\), exact radial residuals through \(n=4\). |
| 49: both expressions for \(\kappa\) | CORRECT for fixed proton | Result 2.2 with \(\mu\to m_e,a_\mu\to a_0\). |
| 53: \(E_n\) | CORRECT for fixed proton | \((Ze)^2=Z^2e^2\), so this equals Result 2.2 in that limit. |
| 57: defining expression for \(a_0\) | CORRECT | Definition in Result 2.2. |
| 57: numerical \(a_0\) | WRONG as CODATA 2022 data | Replace by \(5.29177210544(82)\times10^{-11}\,\mathrm m\), CODATA line 61. The printed central value exceeds it by exactly \(3.59\times10^{-20}\,\mathrm m\), more than four quoted 2022 standard uncertainties. No attribution of the old value to another adjustment is asserted. |
| 63: photon-energy expression | CORRECT as an internal energy difference | \(\Delta E=E_n-E_{n'}>0\) for \(n>n'\). Equating it exactly to a laboratory photon energy additionally neglects recoil; the Coulomb Hamiltonian itself has no radiation field or emission rates. |
| 76: \(\psi=RY\) | CORRECT for relative-coordinate separation | Results 2.1, 4.1, 5.1. It is not the complete laboratory two-body wavefunction without \(\Phi(R)\). |
| 83: \(L_0^s=1\) | CORRECT | Exact finite sum in Result 3.1. |
| 84: \(L_1^s=-x+s+1\) | CORRECT | Exact finite sum in Result 3.1. |
| 85: \(L_2^s\) | WRONG | \(L_2^{(s)}=+x^2/2-(s+2)x+(s+1)(s+2)/2\). Printed minus sign gives printed-minus-correct \(=-x^2\). |
| 91: \(\psi_{100}\) | CORRECT | Equals Result 5.1 in the fixed-proton limit, norm 1. |
| 92: \(\psi_{200}\) | CORRECT | Equals Result 5.1 in that limit, norm 1. |
| 93: \(\psi_{210}\) | CORRECT | Equals Result 5.1 in that limit, norm 1. |
| 94: \(\psi_{21,\pm1}\) | WRONG | Correct CS expression is \(\mp (Z/a_0)^{3/2}xe^{-x/2}\sin\theta e^{\pm i\phi}/(8\sqrt\pi)\), \(x=Zr/a_0\). Each printed state has norm squared \(1/2\), independent of the phase choice. |

The two reported defects are independently confirmed by polynomial subtraction and full-norm integration, respectively. At line 94 the missing factor \(\sqrt2\) in magnitude is a physical normalisation error; the additional CS sign for \(m=+1\) is convention-dependent. A nonzero scalar multiple still solves the eigenvalue equation, so substitution alone would miss this normalisation error.

The displayed quantum-number ranges at line 78 agree with the constructed family. Its degeneracy and accumulation at zero are derived in Result 2.2. The degeneracy excludes spin and corrections beyond this model. Lines 69–72 refer to an uninspected figure; no verdict is given on its arrows. For the alpha lines alone the energy ratio is \((3/4)/(5/36)=27/5=5.4\), so “roughly four times” is not a precise alpha-line statement. Orbital density \(|\psi|^2\) does not determine a complex phase: multiplying by \(e^{i\chi(r)}\) leaves that density unchanged. A laboratory “cloud” must specify the COM state as in §1b; mass difference alone does not fix its size. The historical/astronomical claim in lines 30–32 was not checked.

## 7. Moments, radial CDF, and probability surfaces

**Result 7.1 — derived for the constructed family; exact direct-integration checks through \(n=4\) by `check_moments`.** In \(x=Zr/a_\mu\), let \(f_{n\ell}(x)=R_{n\ell}(r)/(Z/a_\mu)^{3/2}\), \(u(x)=xf_{n\ell}(x)\), \(L=\ell(\ell+1)\), \(I_s=\int_0^\infty x^su(x)^2dx\), and \(B_s=\int_0^\infty x^s(u')^2dx\). The dimensionless equation is \(u''=(L/x^2-2/x+1/n^2)u\). Integration by parts first against \(x^su\) and then against \(x^{s+1}u'\) gives
\[
B_s=\left[\frac{s(s-1)}2-L\right]I_{s-2}+2I_{s-1}-\frac{I_s}{n^2},
\]
\[
(s+1)B_s=L(s-1)I_{s-2}-2sI_{s-1}+\frac{s+1}{n^2}I_s.
\]
Elimination yields
\[
s\left[\frac{s^2-1}4-L\right]I_{s-2}+(2s+1)I_{s-1}-\frac{s+1}{n^2}I_s=0.
\]
Boundary terms vanish for the present \(u\sim x^{\ell+1}\) at zero and exponential decay at infinity for \(s=0,1,2\). Taking those three values successively with \(I_0=1\) gives
\[
\boxed{\langle r\rangle=\frac{a_\mu}{2Z}[3n^2-\ell(\ell+1)]},\quad
\boxed{\langle r^2\rangle=\frac{a_\mu^2n^2}{2Z^2}[5n^2+1-3\ell(\ell+1)]},\quad
\boxed{\langle1/r\rangle=\frac{Z}{a_\mu n^2}}.
\]
They are independent of \(m\) because every angular norm is one. The script directly integrates all three moments for the ten radial pairs with \(n\le4\).

**Result 7.2 — derived finite-sum construction; exact checks by `check_cdf`.** Define
\[
F_{n\ell}(r)=\int_0^r s^2|R_{n\ell}(s)|^2ds,
\qquad x=Zr/a_\mu.
\]
If \(x^2(R/A)^2=e^{-\beta x}\sum_jd_jx^j\), \(\beta=2/n\), repeated integration by parts gives
\[
\int_x^\infty y^je^{-\beta y}dy
=e^{-\beta x}\frac{j!}{\beta^{j+1}}\sum_{h=0}^j\frac{(\beta x)^h}{h!}.
\]
Thus \(F_{n\ell}=1-e^{-2x/n}Q_{n\ell}(x)\), where
\[
Q_{n\ell}=\sum_jd_j\frac{j!}{(2/n)^{j+1}}\sum_{h=0}^j\frac{(2x/n)^h}{h!}.
\]
The six expanded tail polynomials are
\[
\begin{aligned}
Q_{10}&=1+2x+2x^2,\\
Q_{20}&=1+x+\frac{x^2}{2}+\frac{x^4}{8},\\
Q_{21}&=1+x+\frac{x^2}{2}+\frac{x^3}{6}+\frac{x^4}{24},\\
Q_{30}&=1+\frac{2x}{3}+\frac{2x^2}{9}
+\frac{4x^4}{81}-\frac{8x^5}{729}+\frac{8x^6}{6561},\\
Q_{31}&=1+\frac{2x}{3}+\frac{2x^2}{9}+\frac{4x^3}{81}
+\frac{2x^4}{243}-\frac{4x^5}{2187}+\frac{4x^6}{6561},\\
Q_{32}&=1+\frac{2x}{3}+\frac{2x^2}{9}+\frac{4x^3}{81}
+\frac{2x^4}{243}+\frac{4x^5}{3645}+\frac{4x^6}{32805}.
\end{aligned}
\]
Together with \(F=1-e^{-2x/n}Q\), these are closed-form CDFs for all radial states through \(n=3\). The checks differentiate every CDF back to \(r^2|R|^2\), check \(F(0)=0\), and check \(F(\infty)=1\).

**Result 7.3 — explicit renderer conventions, derived meaning.** A spherical enclosed-probability radius \(r_p\) is defined by \(F_{n\ell}(r_p)=p\), \(0<p<1\). It encloses probability \(p\) for every \(m\), even for angularly anisotropic states; the sphere need not be a density isosurface. For a density isosurface instead choose a threshold \(c_p\) with
\[
\int_{\{|\psi|^2\ge c_p\}}|\psi|^2\,d^3r=p,
\]
and display the boundary of that region. The region can have multiple components or radial shells. These are two distinct conventions; do not label a fixed density threshold as a specified probability without integrating it. For a \(1s\) state the density decreases strictly with radius, so the two conventions coincide. Laboratory surfaces require the marginals of §1b, not just the relative density.

## 8. CODATA inputs and numerical predictions

**Result 8.1 — source-quoted inputs; numerical arithmetic checked by `check_constants`.** The following are literal input lines of `sources/codata-2022/allascii.txt`; the columns are value, standard uncertainty, and unit:

```text
61: Bohr radius                                                 5.291 772 105 44 e-11    0.000 000 000 82 e-11    m
107: electron mass                                               9.109 383 7139 e-31      0.000 000 0028 e-31      kg
117: electron-proton mass ratio                                  5.446 170 214 889 e-4    0.000 000 000 094 e-4
124: electron volt                                               1.602 176 634 e-19       (exact)                  J
132: elementary charge                                           1.602 176 634 e-19       (exact)                  C
271: Planck constant                                             6.626 070 15 e-34        (exact)                  J Hz^-1
288: proton mass                                                 1.672 621 925 95 e-27    0.000 000 000 52 e-27    kg
304: reduced Planck constant                                     1.054 571 817... e-34    (exact)                  J s
309: Rydberg constant                                            10 973 731.568 157       0.000 012                m^-1
311: Rydberg constant times hc in eV                             13.605 693 122 990       0.000 000 000 015        eV
312: Rydberg constant times hc in J                              2.179 872 361 1030 e-18  0.000 000 000 0024 e-18  J
330: speed of light in vacuum                                    299 792 458              (exact)                  m s^-1
360: vacuum electric permittivity                                8.854 187 8188 e-12      0.000 000 0014 e-12      F m^-1
```

The script uses exact decimal rationals for tabulated finite central values and \(\hbar=h/(2\pi)\); it does not truncate the ellipsis in line 304. The directly tabulated ratio is preferred to dividing two individually rounded masses. Likewise the tabulated \(a_0\) and Rydberg constant retain the precision of the adjusted derived constants. The primitive \(m_e,\epsilon_0,h,e\) reconstruction is a consistency check at their quoted uncertainty scale, not a way to recover additional significant digits.

**Result 8.2 — derived conversion and numerical check by `check_constants`.** For \(Z=1\), put \(q=m_e/m_p\), \(\eta=\mu/m_e=1/(1+q)\), and define the infinite-mass energy magnitude \(\mathcal R=hcR_\infty\). The identity of this Rydberg-energy conversion with the primitive Coulomb expression is checked against lines 311–312 and the primitive inputs. Then
\[
E_1(m_e)=-\mathcal R,\quad E_1(\mu)=-\eta\mathcal R,\quad
a_\mu=a_0(1+q).
\]
For an internal transition \(n\to n'\), the adopted vacuum wavelength convention is \(\lambda=hc/(E_n-E_{n'})\), hence
\[
\lambda_{\mathrm{Ly}\alpha}=\frac{1+q}{R_\infty(1-1/4)}
=\frac{4(1+q)}{3R_\infty},\qquad
\lambda_{\mathrm{Ba}\alpha}=\frac{1+q}{R_\infty(1/4-1/9)}
=\frac{36(1+q)}{5R_\infty}.
\]
The names designate the \(2\to1\) and \(3\to2\) transitions here. Central values rounded to the input precision are:

| Quantity | Central value | Input-limited uncertainty scale |
|---|---:|---:|
| \(m_e/m_p\) | \(5.446170214889\times10^{-4}\) | \(9.4\times10^{-15}\) |
| \(\mu/m_e\) | \(0.999455679424762\) | \(9.4\times10^{-15}\) |
| \(a_0\) | \(5.29177210544\times10^{-11}\,\mathrm m\) | \(8.2\times10^{-21}\,\mathrm m\) |
| \(a_\mu\) | \(5.29465409460\times10^{-11}\,\mathrm m\) | \(8.21\times10^{-21}\,\mathrm m\) |
| \(E_1(m_e)\) | \(-13.605693122991\,\mathrm{eV}\) | \(1.49\times10^{-11}\,\mathrm{eV}\) |
| \(E_1(m_e)\) | \(-2.179872361103\times10^{-18}\,\mathrm J\) | \(2.39\times10^{-30}\,\mathrm J\) |
| \(E_1(\mu)\) | \(-13.598287264283\,\mathrm{eV}\) | \(1.50\times10^{-11}\,\mathrm{eV}\) |
| \(E_1(\mu)\) | \(-2.178685811725\times10^{-18}\,\mathrm J\) | \(2.41\times10^{-30}\,\mathrm J\) |
| Lyman-alpha vacuum | \(121.5684456173\,\mathrm{nm}\) | \(1.35\times10^{-10}\,\mathrm{nm}\) |
| Balmer-alpha vacuum | \(656.4696063332\,\mathrm{nm}\) | \(7.25\times10^{-10}\,\mathrm{nm}\) |

The positive Rydberg energy is \(\mathcal R=|E_1(m_e)|\). For quoted inputs, the uncertainty scale is their tabulated standard uncertainty. For derived outputs it is the conservative first-order scale \(\sum_i|\partial f/\partial c_i|u(c_i)\), rounded upward in this table, rather than an asserted propagated standard uncertainty. This upper-bounds the first-order standard deviation for any input correlations by the triangle inequality. The CODATA covariance matrix was not inspected. The derived central values use \(hcR_\infty\); their last digits can differ from the independently rounded energy entries in the input table while agreeing within their quoted uncertainties. Golden values retain 17 significant digits for arithmetic reproducibility, not 17 digits of physical accuracy.

Fine structure, Lamb shift, finite nuclear size, spin, external fields, radiative dynamics, and photon recoil are not included. The wavelengths are the spinless Coulomb internal-gap convention, not predictions at the accuracy of the real resolved spectral lines. Spectral-line names do not imply that transition selection rules or emission probabilities have been established by this Hamiltonian.

## 9. Permitted chapter statements and unchecked scope

**Result 9.1 — evidence register.** Chapter statements supported by this record are:

| Statement the chapter may use | Evidence type and locus |
|---|---|
| Hamiltonian, Coulomb model, SI definitions | `source-quoted`: vl16 line 22; `derived`: §§1, 2 after adopting that model. |
| Inverse coordinates, unit Jacobian, unitary map, reduced mass, exact kinetic separation | `derived`: §1.1; `numerically-checked`: `check_coordinates` (exact symbolic arithmetic). |
| Reed–Simon uses the same relative-coordinate sign, masses \(\mu_i\), reduced mass \(m\), and tensor decomposition | `source-quoted`: §XI.4, printed p. 55 / DjVu p. 62, displayed formulas and Problem 40 reference. |
| Coulomb satisfies the book's \(L^2+L^\infty\) hypothesis | `derived`: §1.2. |
| Essential self-adjointness of the initial Coulomb operator, as separately asserted by the book | `source-quoted`: the Kato/Theorem X.16 paragraph on that same rendered page; domain caveat in §1.2. |
| The relative state is not by itself the laboratory electron cloud | `derived`: §§1.3, 1b.1. |
| Electron/proton marginals, rescaling factors, reflection, and localisation/infinite-mass limits | `derived`: §1b.1; `numerically-checked`: `check_cloud_convolution` for the specified 1s/Gaussian example. |
| No \(L^2\) COM eigenfunction; every packet disperses locally, with a variance formula when the moments exist | `derived`: §1b.2. |
| Stationary relative density and additive internal/COM energy | `derived`: §§1b.2–1b.3. |
| Radial equation, \(a_\mu,a_0\), \(\kappa_n,E_n\), polynomial family and quantum numbers | `derived`: §2; `numerically-checked`: `check_radial_equation`, `check_constants`. |
| Independence of \(\ell,m\), spinless \(n^2\) count and accumulation at zero for this family | `derived`: §2.2. |
| Laguerre convention, finite sum, ODE and radial prefactor | `derived`: §3; `numerically-checked`: `check_laguerre`, `check_radial_normalization`. |
| CS harmonics through ℓ=2 and their orthonormality | `numerically-checked`: `check_spherical_harmonics`, against the explicit choice in §4. |
| Fourteen explicit wavefunctions through n=3 and all their norms | `numerically-checked`: `check_wavefunctions`; formulas in §5. |
| Every lecture formula verdict and both reported defects | `numerically-checked`: `check_lecture_formulas`, `check_constants`; ledger in §6. |
| General moments and finite radial CDF expressions | `derived`: §7; `numerically-checked`: `check_moments`, `check_cdf`. |
| Enclosed-probability spheres and integrated-probability density isosurfaces are different choices | `derived`: §7.3 from the density integrals there. |
| Physical inputs and their tabulated uncertainties | `source-quoted`: CODATA 2022 local lines listed in §8.1. |
| Reduced-mass constants, energy magnitudes and signs, and adopted vacuum wavelengths | `derived`: §8.2; `numerically-checked`: `check_constants`. |
| Density does not determine phase; the line-94 amplitude error is separate from a phase choice | `derived`: §6; `numerically-checked`: `check_lecture_formulas`. |

**Result 9.2 — NOT CHECKED / not claimed.** No independent check was made of the Kato theorem, its full hypotheses/domain theorem, spectral completeness or absence of additional bound states, the angular separation theorem beyond the stipulated prerequisite, spin/fine structure/Lamb shift/nuclear structure, radiative transition rates or selection rules, photon recoil, any referenced figure, historical distance measurements, astronomical line interpretation, CODATA covariance matrices, arbitrary-state cloud quadrature beyond the specified example, or numerical density-isosurface meshes. No claim that every normalised packet has finite second moments or widens monotonically is made. No general \(n>6\) direct norm integration, \(n>4\) radial residual/moment integration, or ℓ>2 harmonic check is claimed; the derivations explicitly state their general scope.

**Result 9.3 — numerically-checked reproducibility status.** The exact and numerical checks have passed, and regeneration has been checked against the stored `golden.json`. Required verification command:

```bash
python3 evidence/derivations/c11/check_hydrogen.py --verify
```

The final `golden.json` uses \(Z=1\), \(r/a_\mu\in\{0.5,1,2,5,10\}\), dimensionless \(a_\mu^{3/2}R\), and moment units \(a_\mu,a_\mu^2,a_\mu^{-1}\). Exact constants are stored as symbolic strings; decimal samples have 17 significant digits. The checker exits nonzero on any failed identity or a mismatch with the stored golden file.
