<!-- ROLE: derivations behind the derived claims of chapter C4 (Lecture 6 material, 2026-11-04).
     Anchor = claim id. Numbers and identities re-computed by check_c04.py in this directory. -->

# Derivations for C4 (Lecture 6: the postulates)

Source text: `latex/lectures/de/vl06.tex` of script v0.2 (snapshot `tpc-script-v0.2`); spoken:
`transcripts/clean/v07.md`, `v08.md` to [44:00]. Postulates P0-P5: TJO's wording,
`docs/plan/BRIEF.md:50-55` (author-stipulated, not derived). Kern: finite-dimensional $H$;
results of C3 used by label (c03.prop.spur, c03.thm.spektral, c03.prop.funktion, c03.eq.orte,
c03.prop.positiv, c03.prop.ketbra). Standard linear algebra is a prerequisite (TJO 2026-10-29).

<a id="c04.cl.funktionale"></a>
**c04.cl.funktionale** (Kern, c04.prop.funktionale). ONB $\{|x\rangle\}$. Define $\rho$ by
$\langle y|\rho|x\rangle:=\omega(|x\rangle\langle y|)$. $A=\sum_{x,y}\langle x|A|y\rangle|x\rangle\langle y|$
(c03.prop.ketbra), linearity: $\omega(A)=\sum_{x,y}\langle x|A|y\rangle\langle y|\rho|x\rangle=\sum_x\langle x|A\rho|x\rangle
=\operatorname{tr}(A\rho)=\operatorname{tr}(\rho A)$ (c03.prop.spur (3)). Positivity: $|\psi\rangle\langle\psi|$ is
positive ($\langle\phi|\psi\rangle\langle\psi|\phi\rangle=|\langle\psi|\phi\rangle|^2$), so
$\langle\psi|\rho|\psi\rangle=\operatorname{tr}(\rho|\psi\rangle\langle\psi|)$ (c03.prop.spur (3)/(4)) $=\omega(|\psi\rangle\langle\psi|)\ge0$;
positive implies Hermitian (c03.prop.positiv). $\operatorname{tr}\rho=\operatorname{tr}(\rho\mathbb I)=\omega(\mathbb I)=1$.
Uniqueness: $\operatorname{tr}(\rho|x\rangle\langle y|)=\langle y|\rho|x\rangle$ fixes every matrix element.
Converse: linear; $\operatorname{tr}(\rho\mathbb I)=1$; positive $A=\sum a_x|\phi_x\rangle\langle\phi_x|$ with $a_x\ge0$
(c03.thm.spektral, c03.eq.orte) gives $\operatorname{tr}(\rho A)=\sum_xa_x\operatorname{tr}(\rho|\phi_x\rangle\langle\phi_x|)=\sum_xa_x\langle\phi_x|\rho|\phi_x\rangle\ge0$.
"Norm 1" = $\omega(\mathbb I)=1$ for positive $\omega$: BR I Prop. 2.3.11 with the approximate identity
$E\equiv\mathbb I$ (P-0334); in finite dimension also directly: $|\operatorname{tr}(\rho A)|\le\sum_xp_x|\langle\phi_x|A\phi_x\rangle|\le\|A\|$
with equality at $A=\mathbb I$.

<a id="c04.cl.rein"></a>
**c04.cl.rein** (Kern, c04.prop.rein). Spectral decomposition of $\rho$ (Hermitian: positive,
c03.prop.positiv; c03.thm.spektral): $\rho=\sum p_x|\phi_x\rangle\langle\phi_x|$, $p_x=\langle\phi_x|\rho\phi_x\rangle\ge0$
(c03.eq.orte), $\sum p_x=\operatorname{tr}\rho=1$ (c03.prop.diagonal (3)). Each $|\phi_x\rangle\langle\phi_x|$ is a density
operator ($\operatorname{tr}=\|\phi_x\|^2=1$). Two $p_x,p_y>0$: $\rho=p_x\sigma_1+(1-p_x)\sigma_2$ with
$\sigma_1=|\phi_x\rangle\langle\phi_x|$, $\sigma_2=(1-p_x)^{-1}\sum_{z\ne x}p_z|\phi_z\rangle\langle\phi_z|$, $\sigma_1\ne\sigma_2$
($\sigma_2\phi_x=0$), $0<p_x<1$: a proper mixture, not pure (D4). So pure $\Rightarrow$ one $p_x=1$,
$\rho=|\phi\rangle\langle\phi|$. Converse: $|\psi\rangle\langle\psi|=\lambda\rho_1+(1-\lambda)\rho_2$, $0<\lambda<1$; for
$\phi\perp\psi$: $0=\langle\phi|\psi\rangle\langle\psi|\phi\rangle=\lambda\langle\phi|\rho_1\phi\rangle+(1-\lambda)\langle\phi|\rho_2\phi\rangle$, both
terms $\ge0$, so both $0$. $\rho_1=\sum q_x|\xi_x\rangle\langle\xi_x|$: $\sum q_x|\langle\xi_x|\phi\rangle|^2=0$, so
$\langle\xi_x|\phi\rangle=0$ for $q_x>0$ and every $\phi\in\{\psi\}^\perp$; $\xi_x\in(\{\psi\}^\perp)^\perp=\operatorname{span}\psi$
(finite dimension: extend $\psi/\|\psi\|$ to an ONB and expand, c03.prop.entwicklung). So
$\rho_1=c|\psi\rangle\langle\psi|$, trace gives $c\|\psi\|^2=1$; with $\|\psi\|=1$, $\rho_1=|\psi\rangle\langle\psi|$; same for
$\rho_2$. Normalisation: $\operatorname{tr}(|\psi\rangle\langle\psi|)=\langle\psi|\psi\rangle$ (c03.eq.spur-ketbra). Phase:
$|e^{i\alpha}\psi\rangle\langle e^{i\alpha}\psi|=e^{i\alpha}e^{-i\alpha}|\psi\rangle\langle\psi|$. Rank remark: $|\psi\rangle\langle\psi|$ has
eigenvalue $1$ on $\psi$ and $0$ on $\psi^\perp$. Mixtures of density operators are density
operators (positivity and trace are preserved by convex combination).

<a id="c04.cl.qubit-zustaende"></a>
**c04.cl.qubit-zustaende** (Kern, c04.ex.qubit-zustaende). Positive $\Rightarrow$ Hermitian:
$\rho_{11},\rho_{22}$ real, $\rho_{21}=\rho_{12}^*$; $\rho_{00}=\langle0|\rho|0\rangle\ge0$, $\rho_{11}=1-p\ge0$. Hermitian $2\times2$
is positive iff both eigenvalues $\ge0$ (c03.eq.orte and spectral decomposition), iff trace
$\ge0$ and determinant $\ge0$; trace is $1$. $\det\rho=p(1-p)-|x|^2$; $p(1-p)=\tfrac14-(p-\tfrac12)^2$.
Bloch: c02.eq.bloch has $\rho_{00}=\tfrac12(1+r_z)$, $\rho_{01}=\tfrac12(r_x-ir_y)$; so $p=\tfrac12(1+r_z)$,
$x=\tfrac12(r_x-ir_y)$; $(p-\tfrac12)^2+|x|^2=\tfrac14(r_z^2+r_x^2+r_y^2)\le\tfrac14\iff\|r\|\le1$. Pure: rank one,
$\det=0$ (one eigenvalue 0, other 1) $\iff\|r\|=1$ (c02.prop.bloch (4)).

<a id="c04.cl.eigenwerte"></a>
**c04.cl.eigenwerte** (Kern, c04.exc.eigenwerte). $\det(\rho-\lambda)=(p-\lambda)(1-p-\lambda)-|x|^2
=\lambda^2-\lambda+p(1-p)-|x|^2$. Roots $\tfrac12\pm\sqrt{\tfrac14-p(1-p)+|x|^2}$ (discriminant
$\tfrac14-(p(1-p)-|x|^2)=(p-\tfrac12)^2+|x|^2\ge0$). Sum $1>0$, product $\det\rho$: both $\ge0\iff$ product $\ge0$.

<a id="c04.cl.effekte"></a>
**c04.cl.effekte** (Kern, c04.prop.effekte). (1) $\Rightarrow$: $\rho=|\psi\rangle\langle\psi|$, $\|\psi\|=1$:
$0\le\langle\psi|F\psi\rangle\le1$, so $\langle\psi|F\psi\rangle\ge0$ and $\langle\psi|(\mathbb I-F)\psi\rangle\ge0$ for unit, hence (scaling)
all $\psi$. $\Leftarrow$: c04.eq.mischung, $\operatorname{tr}(\rho F)=\sum p_x\langle\phi_x|F\phi_x\rangle$, each term in $[0,1]$,
weights sum to 1. (2) $g(P):=\operatorname{tr}(P)f(P/\operatorname{tr}P)$ for positive $P\ne0$, $g(0)=0$. Additive:
$P,Q\ne0$, $s=\operatorname{tr}P$, $u=\operatorname{tr}Q$: $(P+Q)/(s+u)=\frac{s}{s+u}\frac Ps+\frac u{s+u}\frac Qu$, affinity of $f$
(D2: affine on the convex set) gives $g(P+Q)=sf(P/s)+uf(Q/u)$; homogeneous for $c>0$ directly, $c=0$
trivially. Hermitian $A=A_+-A_-$ from the spectral decomposition (positive and negative eigenvalue
parts). Well-defined: $P-Q=P'-Q'\Rightarrow P+Q'=P'+Q\Rightarrow g(P)+g(Q')=g(P')+g(Q)$. Real-linear
on Hermitian operators (additivity and homogeneity transfer; $g(-A)=-g(A)$). Complex extension
$\omega(A)=g(A_1)+ig(A_2)$, $A_1=\frac12(A+A^\dagger)$, $A_2=\frac1{2i}(A-A^\dagger)$, Hermitian; $\omega(iA)$: $(iA)_1=-A_2$,
$(iA)_2=A_1$, so $\omega(iA)=-g(A_2)+ig(A_1)=i\omega(A)$: complex linear. As in c04.cl.funktionale there is a
unique $F$ with $\omega(A)=\operatorname{tr}(FA)$ (define $\langle y|F|x\rangle=\omega(|x\rangle\langle y|)$; the positivity
step is not used). $\omega$ real on Hermitian $A$ $\Rightarrow$ $\operatorname{tr}(FA)=\operatorname{tr}(F^\dagger A)$ for Hermitian $A$
(conjugate: $\overline{\operatorname{tr}(FA)}=\operatorname{tr}(A^\dagger F^\dagger)=\operatorname{tr}(F^\dagger A)$), every operator is $A_1+iA_2$, so
$F=F^\dagger$. On density operators $\omega(\rho)=g(\rho)=f(\rho)$ ($\operatorname{tr}\rho=1$). (1) gives $0\le F\le\mathbb I$.
Uniqueness: two such $F$ agree on all density operators, which span all operators (pure states
$|\psi\rangle\langle\psi|$ span by polarisation).

<a id="c04.cl.z-messung"></a>
**c04.cl.z-messung** (Kern). $|0\rangle\langle0|$ and $|1\rangle\langle1|$: $P^2=P=P^\dagger$; positive by c03.prop.positiv (4);
$\mathbb I-|0\rangle\langle0|=|1\rangle\langle1|$ by completeness.

<a id="c04.cl.born-rein"></a>
**c04.cl.born-rein** (Kern). c03.prop.spur (3) with $A=|\psi\rangle:\mathbb C\to H$, $B=\langle\psi|F:H\to\mathbb C$:
$\operatorname{tr}_H(|\psi\rangle\langle\psi|F)=\operatorname{tr}_{\mathbb C}(\langle\psi|F|\psi\rangle)=\langle\psi|F|\psi\rangle$.

<a id="c04.cl.born"></a>
**c04.cl.born** (Kern). $\begin{pmatrix}p&x\\x^*&1-p\end{pmatrix}\begin{pmatrix}1&0\\0&0\end{pmatrix}=\begin{pmatrix}p&0\\x^*&0\end{pmatrix}$, trace $p$.

<a id="c04.cl.verteilung"></a>
**c04.cl.verteilung** (Kern). Each $F_x$ is an effect operator, $\operatorname{tr}(\rho F_x)\in[0,1]$ by
c04.prop.effekte (1); linearity of the trace (c03.prop.spur (2)) and $\sum F_x=\mathbb I$.

<a id="c04.cl.wirkungsgrad"></a>
**c04.cl.wirkungsgrad** (Kern). $q|0\rangle\langle0|=\operatorname{diag}(q,0)$, eigenvalues $q,0\in[0,1]$, so $0\le F\le\mathbb I$
(positivity via spectral decomposition). $\mathbb I-F=\operatorname{diag}(1-q,1)$, sum $\mathbb I$. $\operatorname{tr}(\rho F)=qp$ (as
c04.cl.born). $F^2=q^2|0\rangle\langle0|\ne q|0\rangle\langle0|$ for $0<q<1$.

<a id="c04.cl.erwartung"></a>
**c04.cl.erwartung** (Kern). Linearity of the trace: $\sum_xx\operatorname{tr}(\rho F_x)=\operatorname{tr}(\rho\sum_xxF_x)$. $F_x$ Hermitian
(positive), $x$ real: $A^\dagger=\sum xF_x^\dagger=A$. Expectation value of the distribution
$x\mapsto\operatorname{tr}(\rho F_x)$ (D55, finite outcome set).

<a id="c04.cl.pvm"></a>
**c04.cl.pvm** (Kern, c04.prop.pvm). (1) $v=P_xv$: $\langle v|v\rangle=\sum_y\langle v|P_yv\rangle$ ($\sum P_y=\mathbb I$);
$\langle v|P_yv\rangle=\langle v|P_y^\dagger P_yv\rangle=\|P_yv\|^2$; the $y=x$ term is $\|v\|^2$; so $\sum_{y\ne x}\|P_yv\|^2=0$.
Any $P_xw$ is such a $v$ ($P_x^2=P_x$), so $P_yP_x=0$. $AP_x=\sum_yyP_yP_x=xP_x$: range of $P_x$ in the
eigenspace of $x$. Conversely $Aw=\lambda w$: $P_xAw=\sum_yyP_xP_yw=xP_xw$ (also $P_xP_y=(P_yP_x)^\dagger=0$),
so $(x-\lambda)P_xw=0$; for $x\ne\lambda$, $P_xw=0$; $w=\sum_xP_xw=P_\lambda w$ (and $w=0$ if $\lambda$ is no outcome).
So the eigenvalues are the $x$ with $P_x\ne0$ and the eigenspace of $x$ is the range of $P_x$.
(2) c03.thm.spektral; $P_\lambda=f_\lambda(A)$ with the indicator $f_\lambda$ (D98), basis-independent by
c03.prop.funktion (2); $P_\lambda^2=P_\lambda=P_\lambda^\dagger$ (c03.prop.funktion (1),(3), $f_\lambda^2=f_\lambda$ real);
$\sum_\lambda P_\lambda=\sum_x|\phi_x\rangle\langle\phi_x|=\mathbb I$; $\sum_\lambda\lambda P_\lambda=\sum_xa_x|\phi_x\rangle\langle\phi_x|=A$. Range of
$P_\lambda$ = eigenspace: $\supset$ by construction; $\subset$ by (1).

<a id="c04.cl.dynamik"></a>
**c04.cl.dynamik** (Kern). $\langle A\rangle(t)=\operatorname{tr}(U\rho U^\dagger A)=\operatorname{tr}(\rho U^\dagger AU)$: c03.prop.spur (3) with
$U$ and $\rho U^\dagger A$ as the two factors (any operator $A$, in particular an effect operator $F$). $U_t$ unitary for Hermitian $H$: c03.cl.zeitentwicklung.

<a id="c04.cl.dynamik-zulaessig"></a>
**c04.cl.dynamik-zulaessig** (Kern). $\langle\psi|U\rho U^\dagger\psi\rangle=\langle U^\dagger\psi|\rho\,U^\dagger\psi\rangle\ge0$ (D17);
$\operatorname{tr}(U\rho U^\dagger)=\operatorname{tr}(\rho U^\dagger U)=1$. $\langle\psi|U^\dagger FU\psi\rangle=\langle U\psi|FU\psi\rangle\ge0$;
$\mathbb I-U^\dagger FU=U^\dagger(\mathbb I-F)U$ ($U^\dagger U=\mathbb I$), same argument. Linear in $\rho$, so mixtures go to
mixtures with the same weights; $U|\psi\rangle\langle\psi|U^\dagger=|U\psi\rangle\langle U\psi|$ ((AB)^† rules) with
$\|U\psi\|=\|\psi\|$ (c03.prop.isometrie (1)). Invertible: $\rho\mapsto U^\dagger\rho U$ is the inverse.

<a id="c04.cl.qubit-dynamik"></a>
**c04.cl.qubit-dynamik** (Kern, c04.ex.qubit-dynamik). $U_t|0\rangle=\cos(s)|0\rangle-i\sin(s)|1\rangle$,
$s=\varepsilon t/\hbar$ (c03.eq.qubit-zeit). $\operatorname{tr}(\rho_t|0\rangle\langle0|)=|\langle0|U_t|0\rangle|^2=\cos^2s$
(c04.eq.born-rein with $\psi_t=U_t|0\rangle$). Circle: $\rho=\begin{pmatrix}p&x\\x^*&1-p\end{pmatrix}$ with
$p=\frac12+r\cos\varphi$, $x=ir\sin\varphi$ ($\operatorname{Re}x=0$). $U_t\rho U_t^\dagger$ computed in check_c04.py:
$p_t-\frac12=r\cos(\varphi+2s)$, $x_t=ir\sin(\varphi+2s)$. Geometric reading: Bloch vector
$(r_x,r_y,r_z)=(0,-2r\sin\varphi,2r\cos\varphi)$ rotates about the $x$ axis. Figure c04.fig.messung uses
$r=\frac12,\varphi=0$; $r=\frac3{10},\varphi=70^\circ$ ($(p,\operatorname{Im}x)=(0.6026,0.2819)$); $r=0$.

<a id="c04.cl.singulaer"></a>
**c04.cl.singulaer** (Vertiefung c04.v1, c04.ex.singulaer). $Y=\{c\mathbb I+F:F$ finite rank$\}$, a
subspace of $B(\ell^2)$. Well-defined: $c\mathbb I+F=c'\mathbb I+F'\Rightarrow(c-c')\mathbb I=F'-F$ has finite rank,
$\mathbb I$ has infinite rank on $\ell^2$, so $c=c'$. $F$ finite rank: $\ker F$ has finite codimension
(rank-nullity for the range), so it is infinite-dimensional and contains a unit vector $v$;
$\|(c\mathbb I+F)v\|=|c|\le\|c\mathbb I+F\|$. So $|\omega_0(T)|\le\|T\|$ on $Y$, and $\omega_0(\mathbb I)=1=\|\mathbb I\|$ gives
$\|\omega_0\|=1$. Hahn-Banach (RS I Cor. 1 to Thm III.6, p. 77, P-0337): $\omega\in B(\ell^2)^*$,
$\omega|_Y=\omega_0$, $\|\omega\|=1$. BR I Prop. 2.3.11 (P-0334) for the unital $C^*$-algebra $B(\ell^2)$ with
approximate identity $E_\alpha=\mathbb I$: $\|\omega\|=\omega(\mathbb I^2)=1$ and $\omega$ continuous $\Rightarrow$ positive. So
$\omega$ is a state. $|\psi\rangle\langle\psi|$ has rank $\le1$: $\omega(|\psi\rangle\langle\psi|)=\omega_0(0\cdot\mathbb I+|\psi\rangle\langle\psi|)=0$. If
$\omega(A)=\operatorname{tr}(\rho A)$ with a density operator: $\langle\phi_x|\rho\phi_x\rangle=\omega(|\phi_x\rangle\langle\phi_x|)=0$ for an ONB,
$\operatorname{tr}\rho=\sum_x0=0\neq1$. (The trace of a positive trace-class operator is the sum of the
diagonal in any ONB.) "Not a mixture of vector states": any countable mixture
$\sum p_k|\psi_k\rangle\langle\psi_k|$ is a density operator. "Not constructive": the existence rests on
Hahn-Banach (Zorn's lemma in the general proof); stated as commentary.

### What is quoted, not derived

- c04.cl.p0: TJO's stipulation, BRIEF.md:50 (author-stipulated). c04.cl.p1 to c04.cl.p5: TJO's
  postulates in the wording of script v0.2 (vl06.tex, lec06.tex; brief rows P-0005 to P-0009 and v0.2 quotes P-0340 to P-0349),
  author-stipulated; restored on 2026-11-06 (D-WORTLAUT).
- c04.cl.normal (source-quoted, P-0335, P-0336): Bratteli-Robinson I, Definition 2.4.20 and
  Theorem 2.4.21, p. 76.
- c04.cl.stone (source-quoted, P-0338, P-0339): Reed-Simon I, Theorem VIII.7 (a), (b), p. 265, and
  Theorem VIII.8, p. 266. "Determined by the group": VIII.7 (c), (d) on p. 265.
