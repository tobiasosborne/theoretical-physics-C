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
**c03.cl.gs-beispiel** (Kern, example c03.ex.gram-schmidt). $\Phi_1=(1,0)$, $\Phi_2=(1,1)$.
$\Psi_1=\Phi_1$ (empty sum). $\langle\Psi_1|\Phi_2\rangle=1$, $\|\Psi_1\|^2=1$,
$\Psi_2=(1,1)-(1,0)=(0,1)$; norms $1$. $\langle\Phi_1|\psi\rangle=\psi_1$,
$\langle\Phi_2|\psi\rangle=\psi_1+\psi_2$; both zero gives $\psi=0$.

<a id="c03.cl.gs-null"></a>
**c03.cl.gs-null** (Kern, exercise c03.exc.gram-schmidt). $\Phi_3=(1,-1)$,
$\langle\Psi_1|\Phi_3\rangle=1$, $\langle\Psi_2|\Phi_3\rangle=-1$, norms $1$:
$\Psi_3=(1,-1)-1\cdot(1,0)-(-1)\cdot(0,1)=(0,0)$. $2\Phi_1-\Phi_2=(2-1,0-1)=(1,-1)=\Phi_3$.

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
