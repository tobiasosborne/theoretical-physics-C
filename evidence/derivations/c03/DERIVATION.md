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
**c03.cl.cs** (Fundament, lemma c03.lem.cs). If $w=0$ both sides vanish. Otherwise
$w^\dagger w>0$ (rule 4). Put $c=w^\dagger v/w^\dagger w$; by rule 1 and since $w^\dagger w$
is real, $c^*=v^\dagger w/w^\dagger w$. Let $u=v-cw$. By rule 3, $u^\dagger=v^\dagger-c^*w^\dagger$
(as a row), and by rule 2
$u^\dagger u=v^\dagger v-c\,v^\dagger w-c^*w^\dagger v+c^*c\,w^\dagger w$.
Each of the last three terms: $c\,v^\dagger w=(w^\dagger v)(v^\dagger w)/w^\dagger w
=|v^\dagger w|^2/w^\dagger w$ (rule 1: $w^\dagger v=(v^\dagger w)^*$);
$c^*w^\dagger v=(v^\dagger w)(w^\dagger v)/w^\dagger w=|v^\dagger w|^2/w^\dagger w$;
$c^*c\,w^\dagger w=|w^\dagger v|^2/w^\dagger w=|v^\dagger w|^2/w^\dagger w$. Sum:
$u^\dagger u=v^\dagger v-|v^\dagger w|^2/w^\dagger w\ge0$ (rule 4 for $u$); multiply by
$w^\dagger w>0$. Reed-Simon I p. 38 (P-0144) state the same inequality for every inner
product space with a proof via Bessel's inequality.

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
