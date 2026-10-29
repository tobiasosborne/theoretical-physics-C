<!-- ROLE: derivations behind every claim typed `derived` in chapter C3 (vl02 material).
     Authored by the chapter author (agent, 2026-10-20). The mathematics is elementary and the
     same agent wrote text and derivation; check_c03.py beside this file re-computes every
     explicit number with exact arithmetic (sympy). Each item carries the claim ID of
     evidence/claims.json as its anchor. UPDATE POLICY: change together with
     content/c03-hilbertraum and the ledger. -->

# Derivations for C3 (Lecture 2: complex vectors, inner product, l^2, L^2(R))

Conventions. $\mathbb{C}^n$, entrywise operations (D75); $v^\dagger w=\sum_j v_j^*w_j$ (D76);
$\ell^2$ (D77); $L^2(\mathbb{R})$ (D78, D80). For complex numbers: $(zw)^*=z^*w^*$,
$(z+w)^*=z^*+w^*$, $(z^*)^*=z$, $z^*z=|z|^2=(\operatorname{Re}z)^2+(\operatorname{Im}z)^2\ge0$,
$|zw|=|z||w|$, $\operatorname{Re}z\le|z|$. Real analysis used where stated: a monotone bounded
sequence of reals converges; an absolutely convergent series (improper integral) of complex
numbers (functions) converges; limits are linear and commute with conjugation and with
continuous functions; $\mathbb{R}$ is complete (Reed-Simon I p. 6, P-0149).

<a id="c03.cl.c2"></a>
**c03.cl.c2** (Kern, example c03.ex.c2). $v=(1+i,1-i)$, $w=(1,-1)$. $v+w=(2+i,\,-i)$.
$iv=(i+i^2,\,i-i^2)=(-1+i,\,1+i)$ since $i^2=-1$.

<a id="c03.cl.selbst"></a>
**c03.cl.selbst** (Kern, c03.eq.selbst). $v^\dagger v=\sum_j v_j^*v_j=\sum_j|v_j|^2$, a sum of
real numbers $\ge0$.

<a id="c03.cl.ohne-stern"></a>
**c03.cl.ohne-stern** (Kern, example). $v=(1,i)$: $\sum_j v_jv_j=1+i^2=0$;
$v^\dagger v=1\cdot1+(-i)(i)=1-i^2=2$.

<a id="c03.cl.vw"></a>
**c03.cl.vw** (Kern, example c03.ex.skalarprodukt). $v^\dagger=(1-i,\,1+i)$;
$v^\dagger w=(1-i)\cdot1+(1+i)(-1)=-2i$. $w^\dagger=(1,-1)$ (real entries);
$w^\dagger v=(1+i)-(1-i)=2i=(-2i)^*$.

<a id="c03.cl.skalarprodukt"></a>
**c03.cl.skalarprodukt** (Kern, proposition c03.prop.skalarprodukt). (1)
$(v^\dagger w)^*=\sum_j(v_j^*w_j)^*=\sum_jv_jw_j^*=\sum_jw_j^*v_j=w^\dagger v$. (2) distribute the
finite sum. (3) $(\alpha v+\beta u)_j^*=\alpha^*v_j^*+\beta^*u_j^*$, then (2). (4)
c03.cl.selbst; a finite sum of nonnegative reals vanishes iff every term vanishes, and
$|v_j|^2=0$ iff $v_j=0$.

<a id="c03.cl.rechnen"></a>
**c03.cl.rechnen** (Kern, exercise). $v=(i,2)$, $w=(1,i)$. $3v=(3i,6)$, $v+w=(1+i,2+i)$,
$v^\dagger=(-i,2)$, $w^\dagger=(1,-i)$. $v^\dagger w=-i\cdot1+2\cdot i=i$;
$w^\dagger v=1\cdot i+(-i)\cdot2=-i=i^*$; $v^\dagger v=(-i)(i)+4=1+4=5$.

<a id="c03.cl.einsen"></a>
**c03.cl.einsen** (Vertiefung, example c03.ex.einsen). $\sum_{j\le N}|1|^2=N$, unbounded.

<a id="c03.cl.elltwo"></a>
**c03.cl.elltwo** (Vertiefung, proposition c03.prop.elltwo).
*Inequalities (c03.eq.ab).* $0\le(|a|-|b|)^2=|a|^2+|b|^2-2|a||b|$ gives
$|a^*b|=|a||b|\le\tfrac12|a|^2+\tfrac12|b|^2$.
$|a+b|^2=(a+b)^*(a+b)=|a|^2+|b|^2+a^*b+b^*a=|a|^2+|b|^2+2\operatorname{Re}(a^*b)
\le|a|^2+|b|^2+2|a||b|\le2|a|^2+2|b|^2$.
(1) $\sum_j|av_j|^2=|a|^2\sum_j|v_j|^2<\infty$. Partial sums of $\sum|v_j+w_j|^2$ are
nondecreasing and $\le2v^\dagger v+2w^\dagger w$; they converge. (2) Partial sums of
$\sum|v_j^*w_j|$ are nondecreasing and $\le\tfrac12v^\dagger v+\tfrac12w^\dagger w$; absolute
convergence implies convergence. (3) Rules 1-3 of c03.cl.skalarprodukt hold for every
partial sum (a computation in $\mathbb{C}^N$); pass to the limit using linearity of limits and
continuity of conjugation. Rule 4: $v^\dagger v\ge0$ as a limit of nonnegative partial sums;
if $v^\dagger v=0$, every partial sum (nondecreasing, $\le$ the limit, $\ge0$) is 0, so every
$v_j=0$.

<a id="c03.cl.rate"></a>
**c03.cl.rate** (Vertiefung, example c03.ex.rate, c03.eq.rate). For $j\ge2$:
$1/j^2\le1/((j-1)j)=1/(j-1)-1/j$; the sum over $j=2..N$ telescopes to $1-1/N$, so
$\sum_{j=1}^N1/j^2\le2-1/N<2$; the partial sums are nondecreasing and bounded, so
$v=(1/j)\in\ell^2$. For $u_j=1/\sqrt j$: $|u_j|^2=1/j$. Since $1/x$ is decreasing,
$1/j\ge\int_j^{j+1}dx/x$; summing, $\sum_{j=1}^N1/j\ge\int_1^{N+1}dx/x=\ln(N+1)\to\infty$.
$u_j\to0$ is clear. The text says only that the partial sums grow beyond all bounds, at
least like $\ln(N+1)$. Used in Fundament c03.f3: for $v_j=1/j\in\ell^2$ the sum
$\sum_j j|v_j|^2=\sum_j1/j$ diverges by the same bound. (Figure c03.fig.partialsummen plots the exact partial sums; check_c03.py
verifies both bounds for $N=1..25$.)

<a id="c03.cl.ltwo"></a>
**c03.cl.ltwo** (Vertiefung, proposition c03.prop.ltwo). Hypothesis of the block: $f,g$
piecewise continuous, integrals improper Riemann integrals. Products and sums of piecewise
continuous functions are piecewise continuous, so all integrands are integrable on $[-X,X]$.
Insert $a=f(x)$, $b=g(x)$ into c03.eq.ab pointwise; integrate over $[-X,X]$ (monotonicity of
the integral): $\int_{-X}^X|f+g|^2\le2\langle f|f\rangle+2\langle g|g\rangle$ and
$\int_{-X}^X|f^*g|\le\tfrac12\langle f|f\rangle+\tfrac12\langle g|g\rangle$. Integrals of
nonnegative functions over $[-X,X]$ are nondecreasing in $X$ and bounded, hence converge as
$X\to\infty$ (and the bound c03.eq.ltwo holds in the limit). Absolute convergence of the
improper integral of $f^*g$ implies convergence (real and imaginary parts separately).
$|af|^2=|a|^2|f|^2$. Rules 1-3 hold for the integrand at every point and the integral is
linear and commutes with conjugation. $\langle f|f\rangle=\int|f|^2\ge0$. Rule 4 is NOT
claimed (see c03.cl.punkt).

<a id="c03.cl.eins"></a>
**c03.cl.eins** (Vertiefung, c03.eq.eins). $\int_{-X}^X1\,dx=2X\to\infty$.

<a id="c03.cl.gauss"></a>
**c03.cl.gauss** (Vertiefung, example c03.ex.gauss). $|e^{2ix}|^2=\cos^22x+\sin^22x=1$, so
$|e^{-x^2/2}e^{2ix}|^2=e^{-x^2}$. Uses: $\int_{-\infty}^\infty e^{-y^2/2}dy=\sqrt{2\pi}$ (c01,
claim c01.cl.gauss-norm, derived there). Substitution $x=y/\sqrt2$, $dx=dy/\sqrt2$:
$\int e^{-x^2}dx=\int e^{-y^2/2}dy/\sqrt2=\sqrt{2\pi}/\sqrt2=\sqrt\pi$. For
$h=1/\sqrt{1+|x|}$: $|h|^2=1/(1+|x|)$ is even, so
$\int_{-X}^X=2\int_0^Xdx/(1+x)=2\ln(1+X)\to\infty$, while $h(x)\to0$ as $|x|\to\infty$.

<a id="c03.cl.cs"></a>
**c03.cl.cs** (Fundament, lemma c03.lem.cs; proof-linked). The inner product $v^\dagger w$ of
$\mathbb{C}^n$ (D76) satisfies the conditions (i)-(iii) of D82: they are rules 2 to 4 of
c03.cl.skalarprodukt (linearity in the second factor and antilinearity in the first, which
contain additivity and pulling out numbers with the star in the first argument; positivity). Its norm (D83) is $\|v\|=\sqrt{v^\dagger v}$. So c03.cl.schwarz
applies: $|v^\dagger w|\le\sqrt{v^\dagger v}\sqrt{w^\dagger w}$; both sides are nonnegative
reals, and squaring gives $|v^\dagger w|^2\le(v^\dagger v)(w^\dagger w)$. Reed-Simon I p. 38
(P-0144) state the same inequality for every inner product space with a proof via Bessel's
inequality. (Until the repair after docs/review/lectures/REVIEW-lec3.md, row MINOR at
de.tex:1255, the chapter repeated the proof of c03.cl.schwarz in column notation here.)

<a id="c03.cl.cs-elltwo"></a>
**c03.cl.cs-elltwo** (Fundament, proposition c03.prop.cs-elltwo). For each $N$, the lemma in
$\mathbb{C}^N$ applied to $(v_1..v_N)$, $(w_1..w_N)$:
$|\sum_{j\le N}v_j^*w_j|^2\le\sum_{j\le N}|v_j|^2\sum_{j\le N}|w_j|^2\le(v^\dagger v)(w^\dagger w)$.
The left side tends to $|v^\dagger w|^2$ (series converges by c03.cl.elltwo; $z\mapsto|z|^2$
continuous); a limit of numbers $\le C$ is $\le C$.

<a id="c03.cl.punkt"></a>
**c03.cl.punkt** (Fundament, example c03.ex.punkt). $f=\chi_{\{0\}}$ is piecewise continuous
(one point of discontinuity). On every $[-X,X]$, $|f|^2$ is nonzero only at $x=0$, which
lies in at most two subintervals of a partition; every Riemann sum is therefore at most
$2\cdot$(mesh) and tends to 0, so the integral is 0. Hence $\langle f|f\rangle=0$ while
$f\ne0$.

<a id="c03.cl.klassen"></a>
**c03.cl.klassen** (Fundament, c03.eq.klassen). Uses Reed-Simon I p. 17 (P-0146): for
integrable $F,G$, "$F=G$ a.e." is the same as $\int|F-G|=0$. Take $F=|f-g|^2$ (integrable
because $f-g$ is square-integrable: c03.cl.ltwo, whose pointwise inequalities hold verbatim
for measurable functions and the Lebesgue integral) and $G=0$:
$\int|f-g|^2=0\iff|f-g|^2=0$ a.e. $\iff f=g$ a.e. $\iff f\sim g$ (D80).
Consequences used in the text: if $n\sim0$ then $|n^*g|=|n||g|=0$ a.e., so
$\int|n^*g|=0$ by the same statement and $|\langle n|g\rangle|\le\int|n^*g|=0$; hence the
inner product does not depend on representatives (expand
$\langle f+n|g+m\rangle$ with $n,m\sim0$). Rule 4 for classes: $\langle f|f\rangle=\int|f|^2=0$
gives $f\sim0$ by the displayed equivalence with $g=0$.

<a id="c03.cl.cn-vollstaendig"></a>
**c03.cl.cn-vollstaendig** (Fundament, proposition). For each $j$:
$|v^{(m)}_j-v^{(k)}_j|^2\le\sum_l|v^{(m)}_l-v^{(k)}_l|^2=d(v^{(m)},v^{(k)})^2$ (c03.eq.komponente).
$|\operatorname{Re}z|,|\operatorname{Im}z|\le|z|$, so real and imaginary parts of the $j$-th
entries are Cauchy sequences in $\mathbb{R}$; $\mathbb{R}$ is complete (Reed-Simon I p. 6, P-0149), so they
converge; let $v_j$ be the complex limit. Then
$d(v^{(m)},v)^2=\sum_{j=1}^n|v^{(m)}_j-v_j|^2$ is a sum of $n$ terms each tending to 0.

<a id="c03.cl.endlich"></a>
**c03.cl.endlich** (Fundament, example c03.ex.endlich). $F$ (finitely many nonzero entries) is
closed under sums and multiples (union of two finite supports is finite) and lies in
$\ell^2$. $v^{(N)}=(1,\tfrac12,..,\tfrac1N,0,..)$. For $M>N$:
$d(v^{(M)},v^{(N)})^2=\sum_{j=N+1}^M1/j^2\le\sum_{j=N+1}^M(1/(j-1)-1/j)=1/N-1/M<1/N$
(here $j\ge2$). Given $\varepsilon$ choose $N_0>1/\varepsilon^2$: Cauchy. If $u\in F$ were a
limit, then for each $j$: $|v^{(N)}_j-u_j|\le d(v^{(N)},u)\to0$ (single term of the sum),
and $v^{(N)}_j=1/j$ for $N\ge j$, so $u_j=1/j\ne0$ for all $j$: $u\notin F$. In $\ell^2$ the
vector $v=(1/j)$ (c03.cl.rate) satisfies $d(v,v^{(N)})^2=\sum_{j>N}1/j^2
=\lim_M(\sum_{j=N+1}^M1/j^2)\le1/N$, so $d\le1/\sqrt N\to0$. Density of finitely supported
sequences in $\ell_p$: Reed-Simon I p. 69 (P-0150), quoted, not used in the derivation.

## What is quoted, not derived

- c03.cl.stetig (source-quoted, P-0147, P-0148): Reed-Simon I pp. 17-18 for $L^1$; the chapter
  applies it to classes of square-integrable functions, where the equivalence relation
  (a.e. equality, D80) is the same. Scope note in the ledger.
- c03.cl.vollstaendig (source-quoted, P-0141, P-0142, P-0143): $\ell_p$ is a Banach space
  (p. 69, case $p=2$, norm $(\sum|a_n|^2)^{1/2}=\sqrt{v^\dagger v}$); Riesz-Fisher, $L^p(X,d\mu)$
  complete (p. 68, case $p=2$, $X=\mathbb{R}$, Lebesgue measure); $L^2(\mathbb{R}^n,d\mu)$ is a
  Hilbert space (p. 40).
- c03.cl.drei-raeume (source-backed, P-0151): the assignment of the three spaces to three
  systems is the author's, as stated in the script vl02.tex:139 and in lecture video v03
  [37:39]. It now stands in Vertiefung c03.v3. The script's example 'etwa einem Photon in
  einer Glasfaser' is not used and not claimed (G-0033 (e)).

## Lecture 3: Dirac notation, inner products, Hilbert space, bases (vl03 material)

Added by the chapter author (agent, 2026-10-21). Conventions as above; in addition: kets and
bras in $\mathbb{C}^n$ (D81), the general inner product with axioms (i) additivity in each
argument, (ii) $\langle\phi|z\psi\rangle=z\langle\phi|\psi\rangle$,
$\langle z\phi|\psi\rangle=z^*\langle\phi|\psi\rangle$, (iii) positivity (D82); norm (D83);
orthogonal, orthonormal, Kronecker delta (D84); basis with finite index set (D85); orthonormal
basis for any index set (D86). From (i) and (ii) by induction:
$\langle\sum_ja_j\phi_j|\sum_kb_k\psi_k\rangle=\sum_{j,k}a_j^*b_k\langle\phi_j|\psi_k\rangle$
for finite sums ("sesquilinearity"). check_c03.py recomputes every explicit number below with
exact arithmetic (sympy).

<a id="c03.cl.kets"></a>
**c03.cl.kets** (Kern, example c03.ex.kets). $e_0=(1,0)$, $e_1=(0,1)$;
$\tfrac1{\sqrt2}e_0\pm\tfrac1{\sqrt2}e_1=(\tfrac1{\sqrt2},\pm\tfrac1{\sqrt2})=\tfrac1{\sqrt2}(1,\pm1)$
by entrywise operations (D75).

<a id="c03.cl.braket"></a>
**c03.cl.braket** (Kern, example c03.ex.braket). $(e_0)^\dagger=(1,0)$ (real entries);
$(1,0)\cdot(\tfrac1{\sqrt2},\tfrac1{\sqrt2})^T=\tfrac1{\sqrt2}$.

<a id="c03.cl.bra-regel"></a>
**c03.cl.bra-regel** (Kern, c03.eq.bra-regel). The $j$-th entry of $\alpha v+\beta w$ is
$\alpha v_j+\beta w_j$; the dagger (D76) conjugates entries and turns the column into a row:
$(\alpha v_j+\beta w_j)^*=\alpha^*v_j^*+\beta^*w_j^*$, which is the $j$-th entry of the row
$\alpha^*v^\dagger+\beta^*w^\dagger=\alpha^*\langle v|+\beta^*\langle w|$ (D81).

<a id="c03.cl.dirac"></a>
**c03.cl.dirac** (Kern, example c03.ex.dirac). $v=(1,i)=e_0+ie_1$, $w=(1,1)=e_0+e_1$. By
c03.cl.bra-regel, $\langle v|=\langle e_0|-i\langle e_1|$ ($i^*=-i$). Row times column is
bilinear in (row, column), so
$\langle v|w\rangle=\langle e_0|e_0\rangle+\langle e_0|e_1\rangle-i\langle e_1|e_0\rangle-i\langle e_1|e_1\rangle$.
With $\langle e_j|e_k\rangle=\delta_{jk}$ (computed entrywise) this is $1+0-0-i=1-i$. Directly:
$v^\dagger=(1,-i)$, $(1,-i)(1,1)^T=1-i$.

<a id="c03.cl.warum-stern"></a>
**c03.cl.warum-stern** (Kern, c03.eq.warum-stern). Suppose an assignment $(\phi,\psi)\mapsto B(\phi,\psi)$
satisfies (i), positivity (iii) and $B(z\phi,\psi)=zB(\phi,\psi)$, $B(\phi,z\psi)=zB(\phi,\psi)$.
Then $B(i\psi,i\psi)=i\cdot i\,B(\psi,\psi)=-B(\psi,\psi)$. Positivity gives
$B(i\psi,i\psi)\ge0$ and $B(\psi,\psi)\ge0$, so $B(\psi,\psi)=0$ for every $\psi$; positivity
(only $\psi=0$ has $B(\psi,\psi)=0$) fails for any $\psi\neq0$, which exists in any nonzero space.

<a id="c03.cl.gewichtet"></a>
**c03.cl.gewichtet** (Kern, example c03.ex.gewichtet). $B_c(v,w)=v_1^*w_1+c\,v_2^*w_2$, $c>0$
real. (i): each term is additive in $v$ and in $w$. (ii): $B_c(v,zw)=zB_c(v,w)$;
$B_c(zv,w)=(zv_1)^*w_1+c(zv_2)^*w_2=z^*B_c(v,w)$. (iii): $B_c(v,v)=|v_1|^2+c|v_2|^2\ge0$, and it
is $0$ iff $|v_1|^2=0$ and $c|v_2|^2=0$, i.e. iff $v=0$ (since $c>0$). $c=1$ gives $v^\dagger w$
(D76). $B_c(e_1,e_1)=c$, so $c\ne c'$ gives $B_c\ne B_{c'}$; the map $c\mapsto B_c$ is injective
on $(0,\infty)$, an infinite set. Bra (D81 for another inner product: the map
$w\mapsto B_c(v,w)$): $B_c(v,w)=v_1^*w_1+(c\,v_2^*)w_2$ is the row $(v_1^*,\ c\,v_2^*)$ times
the column $w$. It equals $v^\dagger=(v_1^*,v_2^*)$ iff $c\,v_2^*=v_2^*$, i.e. iff $c=1$ or
$v_2=0$. check_c03.py verifies the row product symbolically.

<a id="c03.cl.symmetrie"></a>
**c03.cl.symmetrie** (Kern, proposition c03.prop.symmetrie). By (iii), $\langle\xi|\xi\rangle$
is a real number for every $\xi$. Let $a=\langle\phi|\psi\rangle$, $b=\langle\psi|\phi\rangle$.
By (i), $\langle\phi+\psi|\phi+\psi\rangle=\langle\phi|\phi\rangle+\langle\phi|\psi\rangle+\langle\psi|\phi\rangle+\langle\psi|\psi\rangle$,
so $a+b\in\mathbb{R}$. Replace $\psi$ by $i\psi$: by (ii) $\langle\phi|i\psi\rangle=ia$,
$\langle i\psi|\phi\rangle=i^*b=-ib$, $\langle i\psi|i\psi\rangle=i^*i\langle\psi|\psi\rangle=\langle\psi|\psi\rangle$;
the same expansion gives $ia-ib=i(a-b)\in\mathbb{R}$, so $a-b\in i\mathbb{R}$. Write
$a=a_1+ia_2$, $b=b_1+ib_2$: $a_2+b_2=0$ and $a_1-b_1=0$, so $b=a_1-ia_2=a^*$. Reed-Simon take
this as axiom (iv) (P-0152); the derivation shows (i)-(iii) imply it, so both definitions
define the same objects.

<a id="c03.cl.schwarz"></a>
**c03.cl.schwarz** (Kern, proposition c03.prop.schwarz). If $\psi=0$: $\langle\phi|0\rangle=0$
by (ii) with $z=0$, and $\|0\|=0$. Otherwise $\|\psi\|^2>0$ by (iii). $c=\langle\psi|\phi\rangle/\|\psi\|^2$,
$c^*=\langle\phi|\psi\rangle/\|\psi\|^2$ (c03.cl.symmetrie), $\xi=\phi-c\psi$. Sesquilinearity:
$\langle\xi|\xi\rangle=\|\phi\|^2-c\langle\phi|\psi\rangle-c^*\langle\psi|\phi\rangle+c^*c\|\psi\|^2$.
Each of $c\langle\phi|\psi\rangle$, $c^*\langle\psi|\phi\rangle$, $c^*c\|\psi\|^2$ equals
$|\langle\phi|\psi\rangle|^2/\|\psi\|^2$ (use $\langle\psi|\phi\rangle\langle\phi|\psi\rangle=|\langle\phi|\psi\rangle|^2$).
So $0\le\langle\xi|\xi\rangle=\|\phi\|^2-|\langle\phi|\psi\rangle|^2/\|\psi\|^2$; multiply by
$\|\psi\|^2>0$ and take square roots of nonnegative reals. c03.cl.cs is the special case
$\mathbb{C}^n$ with $v^\dagger w$.

<a id="c03.cl.dreieck"></a>
**c03.cl.dreieck** (Kern, proposition c03.prop.dreieck). $\|\phi+\psi\|^2=\|\phi\|^2+\|\psi\|^2+\langle\phi|\psi\rangle+\langle\psi|\phi\rangle$
by (i); the last two terms are $z+z^*=2\operatorname{Re}z$ with $z=\langle\phi|\psi\rangle$
(c03.cl.symmetrie). $\operatorname{Re}z\le|z|\le\|\phi\|\|\psi\|$ (c03.cl.schwarz). Hence
$\|\phi+\psi\|^2\le(\|\phi\|+\|\psi\|)^2$; both sides of $\|\phi+\psi\|\le\|\phi\|+\|\psi\|$ are
$\ge0$. Induction on $N$: $\|\sum_{j\le N}\psi_j\|\le\|\sum_{j<N}\psi_j\|+\|\psi_N\|\le\sum_{j\le N}\|\psi_j\|$.

<a id="c03.cl.orthogonal"></a>
**c03.cl.orthogonal** (Kern, example c03.ex.orthogonal). $e_\pm=\tfrac1{\sqrt2}(1,\pm1)$, real.
$\langle e_+|e_-\rangle=\tfrac12(1\cdot1+1\cdot(-1))=0$; $\|e_\pm\|^2=\tfrac12(1+1)=1$;
$\langle e_0|e_1\rangle=1\cdot0+0\cdot1=0$; $\|e_0\|^2=\|e_1\|^2=1$.

<a id="c03.cl.basis"></a>
**c03.cl.basis** (Kern, example c03.ex.basis). Orthonormality: c03.cl.orthogonal and
$\langle e_1|e_0\rangle=\langle e_0|e_1\rangle^*=0$. Every $\psi=(\psi_1,\psi_2)$ equals
$\alpha e_0+\beta e_1$ with $\alpha=\psi_1$, $\beta=\psi_2$. Left side:
$\|\psi\|^2=(\alpha^*\langle e_0|+\beta^*\langle e_1|)(\alpha|e_0\rangle+\beta|e_1\rangle)=|\alpha|^2+|\beta|^2$
(c03.cl.bra-regel, orthonormality). Right side: $\langle e_0|\psi\rangle=\alpha$,
$\langle e_1|\psi\rangle=\beta$. Second basis: $\langle e_\pm|=\tfrac1{\sqrt2}(\langle e_0|\pm\langle e_1|)$,
so $\langle e_\pm|\psi\rangle=(\alpha\pm\beta)/\sqrt2$, and
$|\alpha+\beta|^2+|\alpha-\beta|^2=2|\alpha|^2+2|\beta|^2$ (expand: the cross terms
$\pm2\operatorname{Re}(\alpha^*\beta)$ cancel); times $\tfrac12$ gives $|\alpha|^2+|\beta|^2$.
check_c03.py verifies the identity symbolically.

<a id="c03.cl.entwicklung"></a>
**c03.cl.entwicklung** (Kern, proposition c03.prop.entwicklung). $X$ finite, $c_j=\langle\phi_j|\Psi\rangle$,
$\xi=\Psi-\sum_jc_j\phi_j$. $\langle\phi_k|\xi\rangle=c_k-\sum_jc_j\delta_{kj}=0$. By (ii) in
the first argument, $\langle\xi|\xi\rangle=\langle\Psi|\xi\rangle-\sum_jc_j^*\langle\phi_j|\xi\rangle=\langle\Psi|\xi\rangle$.
$\langle\Psi|\phi_j\rangle=\langle\phi_j|\Psi\rangle^*=c_j^*$ (c03.cl.symmetrie), so
$\langle\Psi|\xi\rangle=\|\Psi\|^2-\sum_jc_jc_j^*=\|\Psi\|^2-\sum_j|c_j|^2=0$ by completeness
(D85). By (iii), $\xi=0$. Converse: if $\Psi=\sum_jc_j\phi_j$ then
$\|\Psi\|^2=\sum_{j,k}c_j^*c_k\delta_{jk}=\sum_j|c_j|^2$, and the coefficients are
$\langle\phi_k|\Psi\rangle=\sum_jc_j\delta_{kj}=c_k$.

<a id="c03.cl.zwei-basen"></a>
**c03.cl.zwei-basen** (Kern, example c03.ex.zwei-basen, figure c03.fig.vollst).
$\Psi=(2,1)/\sqrt5$, $\|\Psi\|^2=(4+1)/5=1$. $c_0=2/\sqrt5$, $c_1=1/\sqrt5$, $|c_0|^2=4/5$,
$|c_1|^2=1/5$. $c_\pm=\tfrac1{\sqrt2}(2\pm1)/\sqrt5=(2\pm1)/\sqrt{10}$: $|c_+|^2=9/10$,
$|c_-|^2=1/10$. Sums $1$. Figure coordinates: $c_0e_0=(2/\sqrt5,0)\approx(0.894427,0)$,
$c_1e_1=(0,1/\sqrt5)\approx(0,0.447214)$, $c_+e_+=\tfrac{3}{\sqrt{20}}(1,1)\approx(0.670820,0.670820)$,
$c_-e_-=\tfrac1{\sqrt{20}}(1,-1)\approx(0.223607,-0.223607)$; $c_+e_++c_-e_-=c_0e_0+c_1e_1=\Psi$
(c03.cl.entwicklung). check_c03.py recomputes the fractions exactly and the six printed
decimals to within $5\cdot10^{-7}$.

<a id="c03.cl.kanonisch"></a>
**c03.cl.kanonisch** (Kern, c03.eq.kanonisch). $u_j$ has entries $\delta_{jl}$, real.
$\langle u_j|u_k\rangle=\sum_l\delta_{jl}\delta_{kl}=\delta_{jk}$;
$\langle u_j|\psi\rangle=\sum_l\delta_{jl}\psi_l=\psi_j$; $\sum_j|\psi_j|^2=\|\psi\|^2$
(c03.cl.selbst, D83). So $\{u_j\}$ is orthonormal and complete (D85).

<a id="c03.cl.gram-schmidt"></a>
**c03.cl.gram-schmidt** (Kern, proposition c03.prop.gram-schmidt). Notation: $S_n$ = set of
$k<n$ with $\Psi_k\ne0$; the sum in c03.eq.gram-schmidt runs over $S_n$.
(1) Induction on $n$. Assume $\Psi_1,\dots,\Psi_{n-1}$ pairwise orthogonal. For $j<n$,
$j\in S_n$: $\langle\Psi_j|\Psi_n\rangle=\langle\Psi_j|\Phi_n\rangle-\sum_{k\in S_n}\langle\Psi_j|\Psi_k\rangle\langle\Psi_k|\Phi_n\rangle/\|\Psi_k\|^2$
(linearity in the second argument), and $\langle\Psi_j|\Psi_k\rangle=\delta_{jk}\|\Psi_j\|^2$ for
$j,k\in S_n$, so the sum is $\langle\Psi_j|\Phi_n\rangle$ and the difference is $0$. For
$\Psi_j=0$, $\langle0|\Psi_n\rangle=0$ by (ii) with $z=0$. By c03.cl.symmetrie also
$\langle\Psi_n|\Psi_j\rangle=0$.
(2) Induction on $m$: $\Phi_m=\Psi_m+\sum_{k\in S_m}(\ldots)\Psi_k$ is a combination of
$\Psi_k$, $k\le m$; $\Psi_m=\Phi_m-\sum_{k\in S_m}(\ldots)\Psi_k$ and each $\Psi_k$, $k<m$, is a
combination of $\Phi_l$, $l\le k$, by the hypothesis.
(3) $\|z\psi\|^2=\langle z\psi|z\psi\rangle=z^*z\|\psi\|^2$ by (ii), so $\|\Psi_n/\|\Psi_n\|\|=1$;
orthogonality from (1) and (ii).
(4) Let $\xi_1,\dots,\xi_M$ be the vectors of (3), $r=\psi-\sum_m\langle\xi_m|\psi\rangle\xi_m$.
As in c03.cl.entwicklung, $\langle\xi_m|r\rangle=0$. Each $\Psi_k$ is $0$ or $\|\Psi_k\|\xi_m$
for some $m$, so $\langle\Psi_k|r\rangle=0$; each $\Phi_n=\sum_ka_{nk}\Psi_k$ by (2), so
$\langle\Phi_n|r\rangle=\sum_ka_{nk}^*\langle\Psi_k|r\rangle=0$. By hypothesis $r=0$, so every
$\psi$ is expanded in the $\xi_m$ with coefficients $\langle\xi_m|\psi\rangle$; by the converse in
c03.cl.entwicklung the system is complete, hence a basis (D85; the index set is finite).
Relation to Reed-Simon I p. 46 (P-0155, P-0156): for independent $u_n=\Phi_n$, all $\Psi_k\ne0$
(by (2), $\Psi_k=0$ would make $\Phi_k$ a combination of $\Phi_l$, $l<k$), and with
$v_k=\Psi_k/\|\Psi_k\|$ one has $\Psi_k\langle\Psi_k|\Phi_n\rangle/\|\Psi_k\|^2=v_k\langle v_k|\Phi_n\rangle$,
so $\Psi_n=w_n$ of Reed-Simon and $v_n=w_n/\|w_n\|$.

<a id="c03.cl.gs-beispiel"></a>
**c03.cl.gs-beispiel** (Kern, example c03.ex.gram-schmidt). $\Phi_1=(2,0)$, $\Phi_2=(1,1)$
(script v0.3, vl03.tex:120-136; the lecture used $(1,0)$). $\Psi_1=\Phi_1$ (empty sum).
$\langle\Psi_1|\Phi_2\rangle=2\cdot1+0\cdot1=2$, $\|\Psi_1\|^2=4$,
$\Psi_2=(1,1)-(2,0)\cdot\tfrac24=(0,1)$. Norms $\|\Psi_1\|=2$, $\|\Psi_2\|=1$;
$\Psi_1/2=(1,0)=e_0$, $\Psi_2=e_1$. $\langle\Phi_1|\psi\rangle=2\psi_1$,
$\langle\Phi_2|\psi\rangle=\psi_1+\psi_2$; both zero gives $\psi=0$.

<a id="c03.cl.gs-null"></a>
**c03.cl.gs-null** (Kern, exercise c03.exc.gram-schmidt). $\Phi_3=(1,-1)$,
$\langle\Psi_1|\Phi_3\rangle=2$, $\|\Psi_1\|^2=4$, $\langle\Psi_2|\Phi_3\rangle=-1$,
$\|\Psi_2\|^2=1$: $\Psi_3=(1,-1)-(2,0)\cdot\tfrac24-(0,1)\cdot\tfrac{-1}{1}=(0,0)$.
$\Phi_1-\Phi_2=(2-1,0-1)=(1,-1)=\Phi_3$.

<a id="c03.cl.maximal"></a>
**c03.cl.maximal** (Vertiefung, proposition c03.prop.maximal). $X$ countable (finite or
enumerated $1,2,3,\dots$; restriction after docs/review/lectures/REVIEW-lec3.md, row WRONG at
de.tex:1048). Sums of nonnegative numbers over $X$ as in D86 (supremum of finite partial sums). If $\{\phi_j\}$ is an orthonormal basis
(maximal, D86, P-0161), then $\|\psi\|^2=\sum_j|\langle\phi_j|\psi\rangle|^2$ by Theorem II.6
(c03.cl.parseval, P-0158, P-0159); for nonnegative terms, convergence independent of order to
a limit $L$ means that the finite partial sums are $\le L$ and come arbitrarily close to $L$,
i.e. $L$ is their supremum. If it is not maximal, there is an orthonormal $S'\supsetneq\{\phi_j\}$;
take $\xi\in S'\setminus\{\phi_j\}$: $\|\xi\|=1$, $\langle\phi_j|\xi\rangle=0$ for all $j$, every
finite partial sum is $0$, the supremum is $0\ne1=\|\xi\|^2$. For finite $X$ the supremum is
the finite sum, and the condition is D85.

<a id="c03.cl.elltwo-basis"></a>
**c03.cl.elltwo-basis** (Vertiefung, example c03.ex.elltwo-basis). $u_k\in\ell^2$ (one nonzero
entry). $u_j^\dagger u_k=\sum_l\delta_{jl}\delta_{kl}=\delta_{jk}$; $u_k^\dagger v=v_k$ (a single
term of the absolutely convergent series, c03.cl.elltwo). $\sum_k|v_k|^2=v^\dagger v$ (D77); the
partial sums over $\{1..N\}$ are monotone, so their limit is the supremum over finite subsets
(every finite subset lies in some $\{1..N\}$). $\ell^2$ is complete (c03.cl.vollstaendig), so a
Hilbert space; c03.cl.maximal gives the basis property. Directly:
$v-\sum_{k\le N}v_ku_k=(0,\dots,0,v_{N+1},v_{N+2},\dots)$ with squared norm
$\sum_{k>N}|v_k|^2=v^\dagger v-\sum_{k\le N}|v_k|^2\to0$.

<a id="c03.cl.phinull"></a>
**c03.cl.phinull** (Vertiefung, c03.eq.phinull). $\phi_0(x)=\pi^{-1/4}e^{-x^2/2}$ (real):
$|\phi_0|^2=\pi^{-1/2}e^{-x^2}$; $\int e^{-x^2}dx=\sqrt\pi$ (c03.cl.gauss); product $1$.

### Lecture 3: what is quoted, not derived

- c03.cl.existenz (source-quoted, P-0157): Reed-Simon I Theorem II.5, p. 44 (proof via Zorn's
  lemma, pp. 44-45).
- c03.cl.parseval (source-quoted, P-0158, P-0159, P-0160): Reed-Simon I Theorem II.6, p. 45,
  stated there for an arbitrary index set $A$; the chapter states the special case of a
  countable index set (repair after docs/review/lectures/REVIEW-lec3.md, row WRONG at
  de.tex:1048, and evidence/derivations/c03/REVIEW-lec3.md, section B, row WRONG). Then the
  sum is a series of vectors (D86), and "converges ... to y in $\mathcal{H}$" (P-0159) is
  convergence in the norm of $\mathcal{H}$, which is a normed space (Theorem II.2, P-0154).
  Reed-Simon's inner product is linear in the second argument (p. 36 (iii)), as in the course,
  so $(x_\alpha,y)$ reads $\langle\phi_j|\Psi\rangle$ without change.
- c03.cl.hermite (source-quoted, P-0162, P-0163, P-0164): Reed-Simon I section V.3, p. 142,
  Lemma 3 and the definition of $\phi_0$; the proof is deferred there to problems of
  Chapters IX and X. The chapter adds only the derived normalisation c03.cl.phinull.

## Lecture 4: operators (vl04 material, with the vl03 subsection on operators)

Added by the chapter author (lane A, 2026-10-29). Conventions as above. In addition: an operator
is a linear map $A:\mathcal H\to\mathcal H$ (D87); "finite-dimensional" means that
$\mathcal H$ has a basis $\{\phi_x\}_{x\in X}$ with finite $X$ (D85), so the expansion
$\psi=\sum_x\langle\phi_x|\psi\rangle\phi_x$ holds (c03.cl.entwicklung); the adjoint is the
operator with $\langle A^\dagger\phi|\psi\rangle=\langle\phi|A\psi\rangle$ (D17). Conjugating
this with conjugate symmetry (c03.cl.symmetrie) gives (C): $\langle\psi|A^\dagger\phi\rangle=\langle A\psi|\phi\rangle$.
check_c03.py recomputes every explicit matrix, number and eigenvalue below with exact
arithmetic (sympy), and checks the general identities symbolically for generic $3\times3$
(and $2\times2$) complex matrices.

<a id="c03.cl.matrix"></a>
**c03.cl.matrix** (Kern, example c03.ex.matrix). $(A\psi)_j=\sum_k a_{jk}\psi_k$, so
$(A(\psi+\chi))_j=\sum_ka_{jk}(\psi_k+\chi_k)=(A\psi)_j+(A\chi)_j$ and
$(A(\alpha\psi))_j=\alpha(A\psi)_j$: D87. Conversely, for a linear $A$ on $\mathbb C^n$ and the
canonical columns $u_k$: $\psi=\sum_k\psi_ku_k$, so $A\psi=\sum_k\psi_kAu_k$, i.e. $A\psi$ is the
matrix with columns $Au_k$ applied to $\psi$.

<a id="c03.cl.adjungiert"></a>
**c03.cl.adjungiert** (Kern, proposition c03.prop.adjungiert). Uniqueness: if $B,B'$ both
satisfy the defining equation, $\langle B\phi-B'\phi|\psi\rangle=0$ for all $\psi$ by additivity
(D82 (i)); with $\psi=B\phi-B'\phi$ this is $\|B\phi-B'\phi\|^2=0$, so $B\phi=B'\phi$ by
positivity. Existence: $B\phi:=\sum_x\langle A\phi_x|\phi\rangle\phi_x$ is linear in $\phi$
(D82 (i), (ii) in the second argument). Then, by (ii) in the first argument and conjugate
symmetry, $\langle B\phi|\psi\rangle=\sum_x\langle A\phi_x|\phi\rangle^*\langle\phi_x|\psi\rangle=\sum_x\langle\phi|A\phi_x\rangle\langle\phi_x|\psi\rangle=\langle\phi|A\sum_x\langle\phi_x|\psi\rangle\phi_x\rangle=\langle\phi|A\psi\rangle$
(linearity of $A$ and of the inner product in the second argument; expansion formula).

<a id="c03.cl.adj-matrix"></a>
**c03.cl.adj-matrix** (Kern, c03.eq.adj-matrix). In $\mathbb C^n$ with
$\langle v|w\rangle=\sum_jv_j^*w_j$:
$\langle\phi|A\psi\rangle=\sum_{j,k}\phi_j^*a_{jk}\psi_k=\sum_k(\sum_ja_{jk}^*\phi_j)^*\psi_k=\langle\tilde A\phi|\psi\rangle$
with $\tilde A_{kj}=a_{jk}^*$; by uniqueness (c03.cl.adjungiert) $A^\dagger=\tilde A$, the
conjugate transpose. Weighted product $\langle v|w\rangle_c=v_1^*w_1+c\,v_2^*w_2$ ($c>0$ real),
$A=\begin{pmatrix}0&1\\0&0\end{pmatrix}$, $B=\begin{pmatrix}0&0\\1/c&0\end{pmatrix}$: $Bv=(0,v_1/c)$,
$\langle Bv|w\rangle_c=c\,(v_1/c)^*w_2=v_1^*w_2$; $Aw=(w_2,0)$,
$\langle v|Aw\rangle_c=v_1^*w_2$. Equal for all $v,w$, so $B$ is the adjoint for
$\langle\cdot|\cdot\rangle_c$; $B\neq A^T{}^*=\begin{pmatrix}0&0\\1&0\end{pmatrix}$ for $c\neq1$
(check_c03.py checks this symbolically in $c$).

<a id="c03.cl.produkt"></a>
**c03.cl.produkt** (Kern, c03.eq.produkt). $(AB)\psi:=A(B\psi)$ is linear (composition of linear
maps), so an operator. For matrices, $(A(B\psi))_j=\sum_ka_{jk}\sum_lb_{kl}\psi_l=\sum_l(\sum_ka_{jk}b_{kl})\psi_l$:
the matrix product (prerequisite: linear algebra; TJO 2026-10-29: standard linear algebra
accepted as prerequisite). With $E=\begin{pmatrix}0&1\\0&0\end{pmatrix}$,
$F=\begin{pmatrix}0&0\\1&0\end{pmatrix}$: $EF=\begin{pmatrix}1&0\\0&0\end{pmatrix}$,
$FE=\begin{pmatrix}0&0\\0&1\end{pmatrix}\neq EF$ (check_c03.py).

<a id="c03.cl.adj-regeln"></a>
**c03.cl.adj-regeln** (Kern, proposition c03.prop.adj-regeln). By uniqueness it suffices to show
that the right-hand side satisfies the defining equation. Sum: additivity in the first argument.
$(zA)^\dagger$: $\langle z^*A^\dagger\phi|\psi\rangle=(z^*)^*\langle A^\dagger\phi|\psi\rangle=z\langle\phi|A\psi\rangle=\langle\phi|zA\psi\rangle$.
Product: $\langle B^\dagger A^\dagger\phi|\psi\rangle=\langle A^\dagger\phi|B\psi\rangle=\langle\phi|AB\psi\rangle$.
Double adjoint: $\langle A\phi|\psi\rangle=\langle\psi|A\phi\rangle^*=\langle A^\dagger\psi|\phi\rangle^*=\langle\phi|A^\dagger\psi\rangle$,
so $A$ satisfies the defining equation of $(A^\dagger)^\dagger$.

<a id="c03.cl.positiv"></a>
**c03.cl.positiv** (Kern, proposition c03.prop.positiv). (1) $\Rightarrow$: $\langle\psi|A\psi\rangle=\langle A\psi|\psi\rangle=\langle\psi|A\psi\rangle^*$
for $A=A^\dagger$ (defining equation with $\phi=\psi$; conjugate symmetry). $\Leftarrow$: let
$D=A-A^\dagger$; by (C) $\langle\psi|A^\dagger\psi\rangle=\langle A\psi|\psi\rangle=\langle\psi|A\psi\rangle^*$,
so $\langle\psi|D\psi\rangle=r-r^*=0$ for real $r=\langle\psi|A\psi\rangle$. Sesquilinearity:
$\langle\phi+\xi|D(\phi+\xi)\rangle=\langle\phi|D\phi\rangle+\langle\phi|D\xi\rangle+\langle\xi|D\phi\rangle+\langle\xi|D\xi\rangle$,
so $\langle\phi|D\xi\rangle+\langle\xi|D\phi\rangle=0$; and
$\langle\phi+i\xi|D(\phi+i\xi)\rangle=\langle\phi|D\phi\rangle+i\langle\phi|D\xi\rangle-i\langle\xi|D\phi\rangle+\langle\xi|D\xi\rangle$
($(-i)(i)=1$), so $i\langle\phi|D\xi\rangle-i\langle\xi|D\phi\rangle=0$. Dividing by $i$ and
adding: $2\langle\phi|D\xi\rangle=0$; with $\phi=D\xi$ positivity gives $D\xi=0$. The step uses
complex scalars ($i$). (2) $\langle\psi|A\psi\rangle\ge0$ is real; apply (1). (3)
$\langle\psi|B^\dagger B\psi\rangle=\langle B\psi|B\psi\rangle\ge0$ by (C) with $A\to B$,
$\phi\to B\psi$. (4) $P=P^2=P^\dagger P$ since $P=P^\dagger$; apply (3). Context row P-0330:
the author's proof of the uncertainty relation (archive v0.1 Vorlesungen9.tex:21, unchanged in
vl09.tex:25) uses exactly (3) for $A+i\lambda B$ in place of $B$ (written $C^\dagger C$ there, $\widehat D^\dagger\widehat D$ in the chapter).

<a id="c03.cl.isometrie"></a>
**c03.cl.isometrie** (Kern, proposition c03.prop.isometrie). (1) By (C) with $A\to V$,
$\langle V\phi|\chi\rangle=\langle\phi|V^\dagger\chi\rangle$; with $\chi=V\psi$,
$\langle V\phi|V\psi\rangle=\langle\phi|V^\dagger V\psi\rangle$. If equal to
$\langle\phi|\psi\rangle$ for all $\phi$: $\langle\phi|(V^\dagger V-\mathbb I)\psi\rangle=0$, take
$\phi=(V^\dagger V-\mathbb I)\psi$, positivity. (2) $V\psi=0\Rightarrow\|\psi\|^2=\langle V\psi|V\psi\rangle=0$
by (1): $\ker V=\{0\}$. Prerequisite (linear algebra, rank-nullity theorem; TJO 2026-10-29:
standard linear algebra accepted as prerequisite): a linear map of a finite-dimensional vector
space into itself with trivial kernel is surjective. So every vector is
$V\psi$, and $VV^\dagger(V\psi)=V(V^\dagger V)\psi=V\psi$: $VV^\dagger=\mathbb I$. (3)
$A^\dagger A=AA=AA^\dagger$ for $A=A^\dagger$; $U^\dagger U=\mathbb I=UU^\dagger$. Positive
operators and projectors are Hermitian (c03.cl.positiv), isometries unitary by (2).

<a id="c03.cl.wirkung"></a>
**c03.cl.wirkung** (Kern, c03.eq.wirkung). Expansion of $\Psi$, linearity of $A$ (numbers
commute with $A$), expansion of each $A\phi_y=\sum_x\langle\phi_x|A\phi_y\rangle\phi_x$, and
reordering of the finite double sum. Both sums run independently over $X$.

<a id="c03.cl.adj-elemente"></a>
**c03.cl.adj-elemente** (Kern, c03.eq.adj-elemente). $[A^\dagger]_{xy}=\langle\phi_x|A^\dagger\phi_y\rangle=\langle A\phi_x|\phi_y\rangle$
by (C), $=\langle\phi_y|A\phi_x\rangle^*=[A]_{yx}^*$ by conjugate symmetry. Valid for any inner
product and any orthonormal basis with finite index set. P-0326 (Reed-Simon I p. 187) quotes the
self-adjoint special case for $\mathbb C^n$.

<a id="c03.cl.bra-op"></a>
**c03.cl.bra-op** (Kern, c03.eq.bra-op). $\mathbb C$ with $\langle a|b\rangle=a^*b$ satisfies
D82 ($\mathbb C^1$). $K:\mathbb C\to\mathcal H$, $Kz=z\Psi$, linear. Candidate
$L:\mathcal H\to\mathbb C$, $L\Phi=\langle\Psi|\Phi\rangle$ (linear in $\Phi$). For all
$\Phi,z$: $\langle L\Phi|z\rangle_{\mathbb C}=\langle\Psi|\Phi\rangle^*z=\langle\Phi|\Psi\rangle z=\langle\Phi|z\Psi\rangle=\langle\Phi|Kz\rangle$,
the defining equation of $K^\dagger$ (the D17 equation applied to a map between two Hilbert
spaces). Uniqueness as in c03.cl.adjungiert (the argument uses only positivity in $\mathbb C$).
Composition: $\langle\Phi|(|\Psi\rangle z)=z\langle\Phi|\Psi\rangle$.

<a id="c03.cl.ketbra"></a>
**c03.cl.ketbra** (Kern, proposition c03.prop.ketbra). $(|\Psi\rangle\langle\Phi|)\xi=\langle\Phi|\xi\rangle\Psi$
(D94). Adjoint: $\langle\zeta|(|\Psi\rangle\langle\Phi|)\xi\rangle=\langle\Phi|\xi\rangle\langle\zeta|\Psi\rangle$;
$\langle(|\Phi\rangle\langle\Psi|)\zeta|\xi\rangle=\langle\langle\Psi|\zeta\rangle\Phi|\xi\rangle=\langle\Psi|\zeta\rangle^*\langle\Phi|\xi\rangle=\langle\zeta|\Psi\rangle\langle\Phi|\xi\rangle$;
equal, so by uniqueness $(|\Psi\rangle\langle\Phi|)^\dagger=|\Phi\rangle\langle\Psi|$.
$\sum_x|x\rangle\langle x|\Psi=\sum_x\langle x|\Psi\rangle x=\Psi$ (expansion) $=\mathbb I\Psi$.
$\sum_{x,y}\langle x|A|y\rangle|x\rangle\langle y|\Psi=\sum_{x,y}x\,[A]_{xy}\langle y|\Psi\rangle=A\Psi$ (c03.cl.wirkung).

<a id="c03.cl.drei"></a>
**c03.cl.drei** (Kern, example c03.ex.drei). $A^T=A$ real, $B^T=B$ real, so $A^\dagger=A$,
$B^\dagger=B$ (c03.cl.adj-matrix). $(B^2)_{jk}=\sum_l\tfrac13\cdot\tfrac13=\tfrac13$, so
$B^2=B$; positive by c03.cl.positiv (4). $A\psi$ for $\psi=(\tfrac12,-\tfrac1{\sqrt2},\tfrac12)$:
$(-\tfrac1{\sqrt2},\tfrac12+\tfrac12,-\tfrac1{\sqrt2})=(-\tfrac1{\sqrt2},1,-\tfrac1{\sqrt2})$;
$\langle\psi|A\psi\rangle=-\tfrac1{2\sqrt2}-\tfrac1{\sqrt2}-\tfrac1{2\sqrt2}=-\tfrac2{\sqrt2}=-\sqrt2<0$.
$C^\dagger$ = conjugate transpose $=\begin{pmatrix}0&0&-1\\1&0&0\\0&-i&0\end{pmatrix}$;
$C^\dagger C=\mathbb I$ and $CC^\dagger=\mathbb I$ entrywise. $\langle x|B|y\rangle=B_{xy}=\tfrac13$.
Ket-bra form: $C|0\rangle$ = first column $=(0,0,-1)=-|2\rangle$, $C|1\rangle=(1,0,0)=|0\rangle$,
$C|2\rangle=(0,i,0)=i|1\rangle$; the ket-bra sum gives the same on each basis vector by
$\langle x|y\rangle=\delta_{xy}$, hence on every vector by linearity.

<a id="c03.cl.c-ketbra"></a>
**c03.cl.c-ketbra** (Kern, exercise c03.exc.ketbra). $C^\dagger=(|0\rangle\langle1|)^\dagger+(i|1\rangle\langle2|)^\dagger-(|2\rangle\langle0|)^\dagger=|1\rangle\langle0|-i|2\rangle\langle1|-|0\rangle\langle2|$
(c03.cl.adj-regeln, c03.cl.ketbra). $|a\rangle\langle b|\,|c\rangle\langle d|=\langle b|c\rangle|a\rangle\langle d|$.
Of the nine products only those with $b=c$ survive: $|1\rangle\langle0|0\rangle\langle1|=|1\rangle\langle1|$,
$(-i)(i)|2\rangle\langle1|1\rangle\langle2|=|2\rangle\langle2|$,
$(-1)(-1)|0\rangle\langle2|2\rangle\langle0|=|0\rangle\langle0|$. Sum $=\mathbb I$ (c03.cl.ketbra).

<a id="c03.cl.orte"></a>
**c03.cl.orte** (Kern, c03.eq.orte). $Av=\lambda v$, $v\neq0$, normalise $\|v\|=1$
($A(v/\|v\|)=\lambda v/\|v\|$). Then $\langle v|Av\rangle=\lambda\langle v|v\rangle=\lambda$.
Hermitian: real by c03.cl.positiv (1). Positive: $\lambda\ge0$ by definition. Projector:
$\lambda^2v=A^2v=Av=\lambda v$, $v\neq0$, so $\lambda^2=\lambda$. Isometry ($A^\dagger A=\mathbb I$,
includes unitary): $|\lambda|=\|\lambda v\|=\|Av\|=\|v\|=1$ by c03.cl.isometrie (1). No
normality is used. Normal without constraint: $(\lambda\mathbb I)^\dagger(\lambda\mathbb I)=|\lambda|^2\mathbb I=(\lambda\mathbb I)(\lambda\mathbb I)^\dagger$
and $(\lambda\mathbb I)v=\lambda v$.

<a id="c03.cl.spektren"></a>
**c03.cl.spektren** (Kern, c03.eq.spektren). $A(1,\pm\sqrt2,1)=(\pm\sqrt2,2,\pm\sqrt2)=\pm\sqrt2(1,\pm\sqrt2,1)$,
$A(1,0,-1)=(0,0,0)$. $B(1,1,1)=(1,1,1)$, $B(1,-1,0)=0$. $C(1,\lambda,-i\lambda^2)=(\lambda,i(-i\lambda^2),-1)=(\lambda,\lambda^2,-1)$
and $\lambda(1,\lambda,-i\lambda^2)=(\lambda,\lambda^2,-i\lambda^3)$; equal iff $-i\lambda^3=-1$, i.e.
$\lambda^3=-i$ (multiply by $i$). Solutions: $\lambda=e^{i\theta}$ with $3\theta\equiv-\pi/2$
(mod $2\pi$): $\theta=-\pi/6,\ \pi/2,\ 7\pi/6$, i.e. $e^{-i\pi/6}$, $i$, $e^{7i\pi/6}$.
No others: characteristic polynomials $\det(A-\lambda)=-\lambda(\lambda^2-2)$,
$\det(B-\lambda)=-\lambda^2(\lambda-1)$, $\det(C-\lambda)=-(\lambda^3+i)$ (check_c03.py); an
eigenvalue $\lambda$ makes $A-\lambda$ non-injective, hence $\det(A-\lambda)=0$. Prerequisite
(linear algebra: the eigenvalues are the roots of $\det(A-\lambda\mathbb I)$; TJO 2026-10-29:
standard linear algebra accepted as prerequisite).
$\psi=(\tfrac12,-\tfrac1{\sqrt2},\tfrac12)=\tfrac12(1,-\sqrt2,1)$, $\|\psi\|^2=\tfrac14+\tfrac12+\tfrac14=1$:
the normalised eigenvector for $-\sqrt2$, so $\langle\psi|A\psi\rangle=-\sqrt2$ (c03.cl.drei).

<a id="c03.cl.beschraenkt"></a>
**c03.cl.beschraenkt** (Vertiefung c03.v5, c03.eq.beschraenkt). $(A\psi)_j=\sum_ka_{jk}\psi_k=\langle r_j|\psi\rangle$
with $r_j=(a_{j1}^*,\dots,a_{jn}^*)$. Schwarz (c03.cl.schwarz) for the inner product of
$\mathbb C^n$: $|(A\psi)_j|^2\le\|r_j\|^2\|\psi\|^2=\sum_k|a_{jk}|^2\|\psi\|^2$. Sum over $j$:
$\|A\psi\|^2\le(\sum_{j,k}|a_{jk}|^2)\|\psi\|^2$; $C=(\sum_{j,k}|a_{jk}|^2)^{1/2}$ in the sense of
P-0318.

<a id="c03.cl.unbeschraenkt"></a>
**c03.cl.unbeschraenkt** (Vertiefung c03.v5, example c03.ex.unbeschraenkt). $(Mu_k)_j=j\delta_{jk}=k\delta_{jk}$,
so $Mu_k=ku_k$, $\|Mu_k\|=k=k\|u_k\|$; a bound $C$ would need $C\ge k$ for every $k$. $v_j=1/j$
is in $\ell^2$ (c03.cl.rate); $(Mv)_j=1$ for all $j$, the all-ones vector, not in $\ell^2$
(c03.cl.einsen). For $\sum_jj^2|v_j|^2<\infty$, $Mv\in\ell^2$ and
$\sum_j|v_j^*\,jv_j|=\sum_jj|v_j|^2\le\sum_jj^2|v_j|^2<\infty$ (termwise, $j\le j^2$), so
$\langle v|Mv\rangle=\sum_jj|v_j|^2$ is finite. For $v_j=1/j$, $\sum_jj|v_j|^2=\sum_j1/j$
diverges (c03.cl.rate).

<a id="c03.cl.elemente-unendlich"></a>
**c03.cl.elemente-unendlich** (Vertiefung c03.v5, c03.eq.elemente-unendlich). $T$ linear on all
of $\ell^2$ with $\|Tw\|\le C\|w\|$. $v_N=\sum_{k\le N}v_ku_k$; $\|v-v_N\|^2=\sum_{k>N}|v_k|^2\to0$
(tail of a convergent series; c03.cl.elltwo-basis). Linearity: $Tv_N=\sum_{k\le N}v_kTu_k$, whose
$j$-th entry is $u_j^\dagger(Tv_N)=\sum_{k\le N}[T]_{jk}v_k$. Boundedness:
$\|Tv-Tv_N\|=\|T(v-v_N)\|\le C\|v-v_N\|\to0$. Schwarz with $\|u_j\|=1$:
$|u_j^\dagger(Tv)-u_j^\dagger(Tv_N)|\le\|Tv-Tv_N\|\to0$. So the series
$\sum_k[T]_{jk}v_k$ converges to $(Tv)_j$ for every $j$, and $Tv$ (a vector of $\ell^2$, hence
fixed by its entries) is determined by the numbers $[T]_{jk}$ and $v$. Counterexample without
boundedness: $M$ on $F$ (finitely supported sequences) and on
$D_{\max}=\{v:\sum_jj^2|v_j|^2<\infty\}$; both contain every $u_k$, $Mu_k=ku_k$, so
$[M]_{jk}=u_j^\dagger(ku_k)=k\delta_{jk}=j\delta_{jk}$ on both; $F\neq D_{\max}$ (e.g. $v_j=1/j^2$:
$\sum_jj^2|v_j|^2=\sum_j1/j^2<\infty$, infinitely many nonzero entries), so the two operators
differ (different domains).

<a id="c03.cl.ganz"></a>
**c03.cl.ganz** (Vertiefung c03.v5, proposition c03.prop.symmetrisch). Symmetric:
$D(T)\subset D(T^*)$ and $T=T^*$ on $D(T)$ (P-0322). With $D(T)=\mathcal H$:
$\mathcal H=D(T)\subset D(T^*)\subset\mathcal H$, so $D(T^*)=D(T)$ and $T=T^*$, self-adjoint
(P-0324). In finite dimension every operator is defined on all of $\mathcal H$ (D87) and a
Hermitian operator satisfies $\langle A\phi|\psi\rangle=\langle\phi|A\psi\rangle$ for all
$\phi,\psi$, which is the equivalent form of symmetric (P-0323).

<a id="c03.cl.shift"></a>
**c03.cl.shift** (Vertiefung c03.v6, example c03.ex.shift). $(Sv)_1=0$, $(Sv)_{j+1}=v_j$.
$\sum_j(Sv)_j^*(Sw)_j=\sum_{j\ge1}v_j^*w_j$ (same terms, shifted), so $\|Sv\|=\|v\|$, $Sv\in\ell^2$,
and $\langle Sv|Sw\rangle=\langle v|w\rangle$. $L w=(w_2,w_3,\dots)$ is in $\ell^2$ (a tail of a
convergent series) and $\langle Lw|v\rangle=\sum_kw_{k+1}^*v_k=\sum_{j\ge2}w_j^*(Sv)_j=\langle w|Sv\rangle$
(absolutely convergent by c03.cl.elltwo), so $L=S^\dagger$ (uniqueness as in c03.cl.adjungiert).
$LSv=v$: $S^\dagger S=\mathbb I$. $SLu_1=S0=0\neq u_1$: $SS^\dagger\neq\mathbb I$, so $S$ is
not unitary and, since $S^\dagger S=\mathbb I\neq SS^\dagger$, not normal. $\ker S=\{0\}$ and $u_1$
is not in the range (first entry of $Sv$ is $0$). P-0327, P-0328: Reed-Simon I p. 197.

### Lecture 4: what is quoted, not derived

- c03.cl.rollen (source-backed, P-0329): the roles of the classes, vl04.tex:69 of the author's
  script (also v04 [72:57]-[73:45]); "with a normalisation" from D22.
- c03.cl.hellinger-toeplitz (source-quoted, P-0319, P-0320, P-0321): Reed-Simon I, section III.5,
  Corollary, p. 84 (proof via the closed graph theorem), and the remarks on p. 84 and p. 249.
  Reed-Simon's inner product is linear in the second argument, as in the course; the condition
  $(x,Ay)=(Ax,y)$ for all $x,y$ reads $\langle\phi|T\psi\rangle=\langle T\phi|\psi\rangle$.
- c03.cl.symmetrisch (source-quoted, P-0322 to P-0325): Reed-Simon I, section VIII.2,
  pp. 255-256, definitions of symmetric (or Hermitian) and self-adjoint, and the remark on the
  spectral theorem and the unitary groups.
- Page-image rows P-0318 to P-0328 were read from the rendered pages by the chapter author;
  an independent page-image review receipt is still to be made.
