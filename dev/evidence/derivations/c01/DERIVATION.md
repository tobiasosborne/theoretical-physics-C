<!-- ROLE: derivations behind every claim typed `derived` in chapters C0 and C1 (Smoke A).
     Authored by the chapter author (agent, 2026-10-11): the mathematics is elementary and
     the same person wrote text and derivation; an independent codex review checks this file.
     Each item carries the claim ID of evidence/claims.json as its anchor. UPDATE POLICY:
     change together with content/c00-theorie, content/c01-wahrscheinlichkeit and the ledger. -->

# Derivations for C0 and C1

Conventions. A finite outcome set is $X$; a weight is $p\colon X\to\mathbb{R}$ with $p(x)\ge 0$
and $\sum_{x\in X}p(x)=1$ (D54); $P[S]=\sum_{x\in S}p(x)$ (D54); a measurement is a function
$f\colon X\to\mathbb{R}$ and $E[f]=\sum_{x}p(x)f(x)$ (D55); $\operatorname{Var}[f]=E[(f-E[f])^2]$
(D56); $\chi_S$ is the indicator function of $S\subset X$. All sums are finite sums of real
numbers, so they may be reordered and split freely. Nothing below uses a statement that is
not listed in its "Uses" line, apart from arithmetic of real numbers and, where stated,
elementary calculus (the exponential series, integrals of powers, substitution, integration
by parts, polar coordinates).

## Part A. Chapter 0

<a id="c00.cl.reflexion"></a>
**c00.cl.reflexion** (Kern, equation c00.eq.reflexion; added 2026-10-20). *Statement.* If
every reflection sends back the fixed fraction $r$ of the incident energy, $0\le r<1$, and
the wall takes up the rest, then after $n$ reflections the fraction $r^n$ of the energy of an
entering ray is left, and $r^n\to0$ as $n\to\infty$.
*Uses.* The stated premise only.
*Derivation.* By induction on $n$: before the first reflection the fraction is $1=r^0$; if
after $k$ reflections it is $r^k$, the $(k+1)$-st reflection sends back $r\cdot r^k=r^{k+1}$.
For $r=0$, $r^n=0$ for $n\ge1$. For $0<r<1$, $r^n=e^{-n\ln(1/r)}$ with $\ln(1/r)>0$, which
tends to $0$. *Scope.* No statement about emission by the walls, thermal equilibrium, the
number of reflections before the hole is reached, or a dependence of $r$ on frequency or
angle. The chapter states thermal equilibrium at a uniform wall temperature as a separate
premise for the emitted radiation; this derivation is not cited for emission (REVIEW-lec1).

<a id="c00.cl.grenzform"></a>
**c00.cl.grenzform** (Kern, equation c00.eq.grenzform). *Statement.* With
$u(\nu,T)=\dfrac{8\pi h\nu^3}{c^3}\dfrac{1}{e^{h\nu/(k_BT)}-1}$ (c00.eq.planck, taken from the
script) and the definition $u_{\rm kl}(\nu,T)=8\pi\nu^2k_BT/c^3$, for all $\nu>0$, $T>0$:
$u/u_{\rm kl}=x/(e^x-1)$ with $x=h\nu/(k_BT)$.
*Derivation.* $\dfrac{u}{u_{\rm kl}}=\dfrac{8\pi h\nu^3}{c^3(e^x-1)}\cdot\dfrac{c^3}{8\pi\nu^2k_BT}
=\dfrac{h\nu}{k_BT}\cdot\dfrac{1}{e^x-1}=\dfrac{x}{e^x-1}$.
*Remark on the text.* The sentence "for small $x$, $e^x-1$ is nearly $x$" motivates the
definition of $u_{\rm kl}$: replacing $e^x-1$ by $x$ in $u$ gives
$\dfrac{8\pi h\nu^3}{c^3}\cdot\dfrac{k_BT}{h\nu}=u_{\rm kl}$. That the ratio is close to 1 for
small $x$ and tends to 0 for large $x$ is c00.cl.schranken. The text retains this algebraic
limiting form only; identification with a classical prediction requires an author-supplied
source or wording (G-0024).

<a id="c00.cl.schranken"></a>
**c00.cl.schranken** (Vertiefung, c00.eq.schranken). *Statement.* For all $x>0$:
$e^{-x}\le \dfrac{x}{e^x-1}\le\dfrac{1}{1+x/2}$.
*Uses.* $e^x=\sum_{n\ge0}x^n/n!$, all terms positive for $x>0$.
*Derivation.* (i) $e^x-1=\sum_{n\ge1}x^n/n!\ge x+x^2/2=x(1+x/2)$ (dropping positive terms),
so $x/(e^x-1)\le 1/(1+x/2)$. (ii) $e^x-1=x\sum_{n\ge1}x^{n-1}/n!$ and $1/n!\le1/(n-1)!$ for
$n\ge1$, so $e^x-1\le x\sum_{n\ge1}x^{n-1}/(n-1)!=x\,e^x$, hence $x/(e^x-1)\ge e^{-x}$.
*Consequences stated in the text.* Both bounds tend to 1 as $x\to0^+$ (so the ratio does);
the upper bound is $<2/x\to0$ as $x\to\infty$. At $x=1$: $1/e\le 1/(e-1)\le 2/3$.

<a id="c00.cl.divergenz"></a>
**c00.cl.divergenz** (Vertiefung, c00.eq.divergenz). *Statement.*
$\int_0^{\nu_1}u_{\rm kl}\,d\nu=\dfrac{8\pi k_BT}{3c^3}\nu_1^3$, unbounded in $\nu_1$ for $T>0$.
*Derivation.* $\int_0^{\nu_1}\nu^2d\nu=\nu_1^3/3$; the prefactor $8\pi k_BT/c^3$ is positive.

<a id="c00.cl.gesamt"></a>
**c00.cl.gesamt** (Vertiefung, c00.eq.gesamt). *Statement.*
$\int_0^\infty u\,d\nu=\dfrac{8\pi(k_BT)^4}{h^3c^3}\int_0^\infty\dfrac{x^3}{e^x-1}dx$ and
$\int_0^\infty\dfrac{x^3}{e^x-1}dx\le\dfrac13+120$; hence the left side is finite and
proportional to $T^4$.
*Uses.* c00.cl.schranken (upper bound $x/(e^x-1)\le1$); exponential series.
*Derivation.* Substitution $\nu=xk_BT/h$, $d\nu=(k_BT/h)dx$:
$u\,d\nu=\dfrac{8\pi h}{c^3}\Bigl(\dfrac{k_BT}{h}\Bigr)^3\dfrac{x^3}{e^x-1}\cdot\dfrac{k_BT}{h}dx
=\dfrac{8\pi(k_BT)^4}{h^3c^3}\dfrac{x^3}{e^x-1}dx$. Bound: for $0<x\le1$,
$x^3/(e^x-1)=x^2\cdot x/(e^x-1)\le x^2$ and $\int_0^1x^2dx=1/3$. For $x\ge1$,
$e^x-1\ge x^5/5!=x^5/120$ (one positive term of the series), so $x^3/(e^x-1)\le120/x^2$ and
$\int_1^\infty120x^{-2}dx=120$. The integrand is positive and continuous on $(0,\infty)$ and
tends to 0 as $x\to0^+$ (it is $\le x^2$), so the integral exists and is a number independent
of $T$, $h$, $c$, $k_B$; it is positive. Therefore $\int_0^\infty u\,d\nu=\text{const}\cdot T^4$.
*Not derived.* The exact value of the integral is not supplied.

<a id="c00.cl.schwelle"></a>
**c00.cl.schwelle** (Kern, c00.eq.schwelle; extended 2026-10-20). *Statement.* Premises:
(i) one light quantum of energy $h\nu$ gives all its energy to a single electron;
(ii) to get out the electron must spend an energy $W'$, and $W$ is the smallest such energy,
so $W'\ge W$; (iii) energy conservation, kinetic energy $\tfrac12m_ev^2$ with $m_e>0$ and real
$v$. Then for an electron that is actually released $0\le\tfrac12m_ev^2=h\nu-W'\le h\nu-W$,
hence $\nu\ge W/h$; equality $\tfrac12m_ev^2=h\nu-W$ holds exactly for $W'=W$, so
c00.eq.photoeffekt, $E_{\rm kin,max}=\tfrac12m_ev_{\max}^2=h\nu-W$, is the maximum kinetic
energy at fixed material (fixed $W$) in this model; for $h\nu<W$ no electron is released by a single quantum.
*Derivation.* By (i) and (iii) the energy left after release is $h\nu-W'$, which is the
kinetic energy, so $\tfrac12m_ev^2=h\nu-W'$. It is $\ge0$ because $m_e>0$ and $v^2\ge0$.
By (ii), $-W'\le-W$, so $h\nu-W'\le h\nu-W$, with equality iff $W'=W$. From
$0\le h\nu-W'\le h\nu-W$ follows $h\nu\ge W$, and $h>0$ gives $\nu\ge W/h$. If
$h\nu<W\le W'$, then $h\nu-W'<0$ would be a negative kinetic energy, so no release by (i).
*Scope.* Only the one-quantum picture; no statement about several quanta acting together, the
distribution of $W'$, rates, or relativistic electrons.

## Part B. Chapter 1

<a id="c01.cl.zwei-wuerfel"></a>
**c01.cl.zwei-wuerfel.** The set of pairs $(x_1,x_2)$ with $x_1,x_2\in\{1,\dots,6\}$ has
$6\cdot6=36$ elements (6 choices of $x_2$ for each of the 6 choices of $x_1$).

<a id="c01.cl.gezinkt"></a>
**c01.cl.gezinkt.** $p=(1,2,2,2,2,3)/12$: all values $\ge0$; sum $(1+2+2+2+2+3)/12=12/12=1$.
$S=\{2,4,6\}$: fair die $P[S]=3\cdot\tfrac16=\tfrac12$; loaded die
$P[S]=(2+2+3)/12=\tfrac7{12}$.

<a id="c01.cl.wahrscheinlichkeit"></a>
**c01.cl.wahrscheinlichkeit** (c01.prop.wahrscheinlichkeit). (2) If $S_1,\dots,S_k$ are pairwise
disjoint, every $x\in\bigcup_jS_j$ lies in exactly one $S_j$, so
$\sum_{x\in\bigcup S_j}p(x)=\sum_j\sum_{x\in S_j}p(x)$. (1) $P[S]\ge0$ as a sum of non-negative
terms; $P[\emptyset]=0$ (empty sum); $P[X]=\sum_xp(x)=1$. (3) $S$ and $X\setminus S$ are
disjoint with union $X$: $P[S]+P[X\setminus S]=1$ by (2); with $P[X\setminus S]\ge0$ this gives
$P[S]\le1$. (4) $S\cup T=S\,\dot\cup\,(T\setminus S)$ and $T=(T\setminus S)\,\dot\cup\,(S\cap T)$,
so $P[S\cup T]=P[S]+P[T\setminus S]$ and $P[T\setminus S]=P[T]-P[S\cap T]$.

<a id="c01.cl.mischung"></a>
**c01.cl.mischung** (c01.eq.mischung). For weights $p,q$ and $0\le\lambda\le1$:
$\lambda p(x)+(1-\lambda)q(x)\ge0$ (products and sum of non-negative numbers) and
$\sum_x(\lambda p(x)+(1-\lambda)q(x))=\lambda+(1-\lambda)=1$.

<a id="c01.cl.augenzahl"></a>
**c01.cl.augenzahl.** $f(x)=x$. Fair: $E[f]=(1+2+3+4+5+6)/6=21/6=7/2$. Loaded:
$E[f]=(1\cdot1+2\cdot2+2\cdot3+2\cdot4+2\cdot5+3\cdot6)/12=(1+4+6+8+10+18)/12=47/12$.
Neither $7/2$ nor $47/12$ is in $\{1,\dots,6\}$.

<a id="c01.cl.haeufigkeit"></a>
**c01.cl.haeufigkeit** (c01.eq.haeufigkeit). For a list $x_1,\dots,x_N$ ($N$ a positive integer) let
$N(x)=\#\{i:x_i=x\}$. Then $N(x)\ge0$ and $\sum_xN(x)=N$ (each index $i$ is counted for exactly
one $x$). So $h_N=N(\cdot)/N$ satisfies $h_N\ge0$, $\sum_xh_N(x)=1$: a weight.

<a id="c01.cl.stichprobenmittel"></a>
**c01.cl.stichprobenmittel** (c01.eq.stichprobenmittel). Grouping the indices by their
outcome: $\sum_{i=1}^Nf(x_i)=\sum_x\sum_{i:x_i=x}f(x)=\sum_xN(x)f(x)$; divide by the positive
integer $N$.

<a id="c01.cl.erwartung"></a>
**c01.cl.erwartung** (c01.prop.erwartung). (1)
$\sum_xp(x)(\alpha f(x)+\gamma g(x))=\alpha\sum_xp(x)f(x)+\gamma\sum_xp(x)g(x)$. (2)
$\sum_xp(x)c=c\sum_xp(x)=c$. (3) By (1), $E[g]-E[f]=\sum_xp(x)(g(x)-f(x))\ge0$ when
$g(x)\ge f(x)$ for all $x$, since $p(x)\ge0$; the special case $f\ge0$ is (3) with the pair
$(0,f)$ and $E[0]=0$ from (2). (4) $m=\min f$, $M=\max f$ exist ($X$ finite, non-empty);
$m\le f\le M$ pointwise, so by (3) and (2) $m=E[m]\le E[f]\le E[M]=M$.

<a id="c01.cl.indikator"></a>
**c01.cl.indikator** (c01.eq.indikator).
$E[\chi_S]=\sum_xp(x)\chi_S(x)=\sum_{x\in S}p(x)\cdot1+\sum_{x\notin S}p(x)\cdot0=P[S]$.
With $S=\{x\}$: $P[\{x\}]=p(x)$, hence $E[f]=\sum_xP[\{x\}]f(x)$.

<a id="c01.cl.indikator-regeln"></a>
**c01.cl.indikator-regeln** (c01.eq.indikator-regeln). Pointwise: $\chi_S(x)\chi_T(x)=1$ iff
$\chi_S(x)=\chi_T(x)=1$ iff $x\in S\cap T$, else 0. $T=S$ gives $\chi_S^2=\chi_S$.
$1-\chi_S(x)$ is 0 on $S$ and 1 on $X\setminus S$.

<a id="c01.cl.werteverteilung"></a>
**c01.cl.werteverteilung** (c01.eq.werteverteilung). Let $v$ range over the finitely many
distinct values of $f$. At a point $x$, $\chi_{\{f=v\}}(x)=1$ for $v=f(x)$ and 0 for every
other $v$, so $\sum_vv\chi_{\{f=v\}}(x)=f(x)$. If $f(x)=0$, all weighted terms vanish,
while exactly one indicator still equals one. By linearity (c01.cl.erwartung) and
c01.cl.indikator, $E[f]=\sum_vvE[\chi_{\{f=v\}}]=\sum_vvP[\{f=v\}]$.

<a id="c01.cl.drei-ergebnisse"></a>
**c01.cl.drei-ergebnisse** (added 2026-10-20). $X=\{1,2,3\}$, $p=(\tfrac12,\tfrac14,\tfrac14)$:
all values $\ge0$, sum $\tfrac12+\tfrac14+\tfrac14=1$, so $p$ is a weight (D54). A set of $n$
elements has $2^n$ subsets (each element in or out); $2^3=8$: $\emptyset$, $\{1\}$, $\{2\}$,
$\{3\}$, $\{1,2\}$, $\{1,3\}$, $\{2,3\}$, $X$. $P[S]=\sum_{x\in S}p(x)$:
$P[\emptyset]=0$ (empty sum), $P[\{1\}]=\tfrac12$, $P[\{2\}]=P[\{3\}]=\tfrac14$,
$P[\{1,2\}]=\tfrac12+\tfrac14=\tfrac34$, $P[\{1,3\}]=\tfrac34$,
$P[\{2,3\}]=\tfrac14+\tfrac14=\tfrac12$, $P[X]=1$. The indicator values in the table are
$\chi_S(x)=1$ iff $x\in S$. By c01.cl.indikator, $P[S]=E[\chi_S]$. For $f=(-1,0,+1)$:
$E[f]=\tfrac12(-1)+\tfrac14\cdot0+\tfrac14(+1)=-\tfrac12+\tfrac14=-\tfrac14$.

<a id="c01.cl.drei"></a>
**c01.cl.drei.** $X=\{1,2,3\}$, $p=1/3$: $P[\{1,2\}]=2/3$; $E[x^2]=(1+4+9)/3=14/3$.

<a id="c01.cl.varianz"></a>
**c01.cl.varianz** (c01.prop.varianz). Write $m=E[f]$. (1) $(f-m)^2=f^2-2mf+m^2$; by
c01.cl.erwartung (1),(2): $E[(f-m)^2]=E[f^2]-2mE[f]+m^2=E[f^2]-m^2$. (2),(3)
$\operatorname{Var}[f]=\sum_xp(x)(f(x)-m)^2$ is a sum of non-negative terms; it vanishes iff
every term does, i.e. iff for every $x$: $p(x)=0$ or $f(x)=m$. (4)
$E[\alpha f+\gamma]=\alpha m+\gamma$, so $\alpha f+\gamma-E[\alpha f+\gamma]=\alpha(f-m)$ and
$E[\alpha^2(f-m)^2]=\alpha^2\operatorname{Var}[f]$.

<a id="c01.cl.wuerfel-varianz"></a>
**c01.cl.wuerfel-varianz.** Fair: $E[f^2]=(1+4+9+16+25+36)/6=91/6$;
$\operatorname{Var}=91/6-49/4=(182-147)/12=35/12$. Loaded:
$E[f^2]=(1+2\cdot4+2\cdot9+2\cdot16+2\cdot25+3\cdot36)/12=(1+8+18+32+50+108)/12=217/12$;
$\operatorname{Var}=217/12-(47/12)^2=(217\cdot12-47^2)/144=(2604-2209)/144=395/144$.
Figure c01.fig.varianz (b): $p(3)=p(4)=1/2$: $E[f]=7/2$, $E[f^2]=(9+16)/2=25/2$,
$\operatorname{Var}=25/2-49/4=1/4$.
*Independent check.* `web/tests/golden/reference/prob.jl` computes $7/2$, $35/12$, $47/12$,
$395/144$ from the definition $E[(f-E[f])^2]$ with exact rationals
(`web/tests/golden/prob.json`, cases `fair-die`, `loaded-die`).

<a id="c01.cl.muenze"></a>
**c01.cl.muenze.** $X=\{0,1\}$, $p(1)=q$, $p(0)=1-q$, $0\le q\le1$, $f(x)=x$:
$E[f]=0\cdot(1-q)+1\cdot q=q$; $f^2=f$ since $0^2=0$, $1^2=1$; by c01.cl.varianz (1)
$\operatorname{Var}[f]=q-q^2=q(1-q)$; and $\tfrac14-(q-\tfrac12)^2=\tfrac14-q^2+q-\tfrac14=q-q^2$.
So $\operatorname{Var}[f]\le\tfrac14$, and $q(1-q)=0$ iff $q\in\{0,1\}$.

<a id="c01.cl.var-indikator"></a>
**c01.cl.var-indikator** (c01.eq.var-indikator). $\chi_S^2=\chi_S$ (c01.cl.indikator-regeln),
$E[\chi_S]=P[S]$ (c01.cl.indikator), c01.cl.varianz (1):
$\operatorname{Var}[\chi_S]=P[S]-P[S]^2=P[S](1-P[S])$.

<a id="c01.cl.zerlegung"></a>
**c01.cl.zerlegung** (c01.eq.zerlegung). $p_a(x)=1$ if $x=a$, else 0 (c01.eq.punktgewicht);
$p_a\ge0$, $\sum_xp_a(x)=1$: a weight; $E_{p_a}[f]=f(a)$. Evaluate $\sum_ap(a)p_a$ at $x$: only
$a=x$ contributes, value $p(x)$. Uniqueness: if $p=\sum_ac_ap_a$, evaluation at $x$ gives
$p(x)=c_x$. (The coefficients $p(a)$ are $\ge0$ and sum to 1, so this is a mixture.)

<a id="c01.cl.punktgewicht"></a>
**c01.cl.punktgewicht** (c01.prop.punktgewicht). Statements: (1) $p=p_a$ for some $a$;
(2) $P[S]\in\{0,1\}$ for all $S$; (3) $\operatorname{Var}[f]=0$ for all $f$; (4) $p=\lambda
q+(1-\lambda)r$ with weights $q,r$, $0<\lambda<1$ implies $q=r=p$.
(1)⇒(2): $P[S]=\sum_{x\in S}p_a(x)=\chi_S(a)$. (2)⇒(1): $p(x)=P[\{x\}]\in\{0,1\}$ and
$\sum_xp(x)=1$ force exactly one value 1. (1)⇒(3): $E[f]=f(a)$ and $p(x)>0$ only for $x=a$,
where $f(x)=E[f]$; c01.cl.varianz (3). (3)⇒(2): $0=\operatorname{Var}[\chi_S]=P[S](1-P[S])$
(c01.cl.var-indikator). (1)⇒(4): for $x\ne a$, $0=\lambda q(x)+(1-\lambda)r(x)$ with
$\lambda,1-\lambda>0$ and $q(x),r(x)\ge0$ gives $q(x)=r(x)=0$; normalisation gives
$q(a)=r(a)=1$, so $q=r=p_a$. (4)⇒(1) by contraposition: if $p$ is not a point weight, at
least two outcomes $a\ne b$ have $p(a),p(b)>0$ (if only one outcome had positive weight,
normalisation would make $p$ a point weight). Let $\varepsilon=\min(p(a),p(b))>0$,
$q=p+\varepsilon(p_a-p_b)$, $r=p-\varepsilon(p_a-p_b)$. Sums: $1\pm\varepsilon(1-1)=1$.
Values: $q(a)=p(a)+\varepsilon>0$, $q(b)=p(b)-\varepsilon\ge0$, $r(a)=p(a)-\varepsilon\ge0$,
$r(b)=p(b)+\varepsilon>0$, all other values equal $p(x)\ge0$. $q(a)-r(a)=2\varepsilon\ne0$,
and $\tfrac12q+\tfrac12r=p$. So (4) fails for $p$. The chain (1)⇔(2), (1)⇒(3)⇒(2), (1)⇔(4)
closes the equivalence.
*Example of figure c01.fig.mischung.* $p=(1,2,2,2,2,3)/12$, $a=6$, $b=1$,
$\varepsilon=\min(3,1)/12=1/12$: $q=(0,2,2,2,2,4)/12$, $r=(2,2,2,2,2,2)/12$,
$\tfrac12(q+r)=(2,4,4,4,4,6)/24=p$.

<a id="c01.cl.simplex"></a>
**c01.cl.simplex** (c01.prop.simplex). With $X=\{1,\dots,n\}$, $p\leftrightarrow(p(1),\dots,p(n))
\in\mathbb{R}^n$, $p_a=e_a$ (standard basis vector). Mixtures $\sum_a\lambda_ap_a$ with
$\lambda_a\ge0$, $\sum\lambda_a=1$ are weights (values $\lambda_a\ge0$, sum 1); every weight is
one (c01.cl.zerlegung, $\lambda_a=p(a)$). $\sum_a\alpha_ae_a=(\alpha_1,\dots,\alpha_n)=0$ forces
all $\alpha_a=0$: the $e_a$ are linearly, hence affinely, independent.
Figure c01.fig.simplex: corners $v_1=(0,0)$, $v_2=(1,0)$, $v_3=(\tfrac12,\tfrac{\sqrt3}2)$;
$(\tfrac13,\tfrac13,\tfrac13)\mapsto(\tfrac12,\tfrac{\sqrt3}6)$;
$(\tfrac12,\tfrac13,\tfrac16)\mapsto(\tfrac13+\tfrac1{12},\tfrac{\sqrt3}{12})$.

<a id="c01.cl.tschebyscheff"></a>
**c01.cl.tschebyscheff** (c01.lem.tschebyscheff). On a finite outcome set $X$, let $p$ be
a weight and $f$ a real-valued measurement. $S=\{x:|f(x)-E[f]|\ge\varepsilon\}$,
$\varepsilon>0$. Pointwise $(f-E[f])^2\ge\varepsilon^2\chi_S$ (on $S$: left $\ge\varepsilon^2$,
right $=\varepsilon^2$; off $S$: left $\ge0$, right $=0$). Monotonicity and linearity
(c01.cl.erwartung), c01.cl.indikator: $\operatorname{Var}[f]\ge\varepsilon^2P[S]$.

<a id="c01.cl.produkt"></a>
**c01.cl.produkt** (c01.lem.produkt). For a weight $p$ on finite $X$ and a positive integer
$N$, set $p^{(N)}(x_1,\dots,x_N)=\prod_lp(x_l)$ on $X^N$. Measurements $g,w$ are real-valued;
the index $i$ lies in $\{1,\dots,N\}$, and the two-index identity requires distinct $i,j$
in that set.
Distributive law: $\sum_{(x_1,\dots,x_N)}\prod_lu_l(x_l)=\prod_l\sum_{x}u_l(x)$. With $u_l=p$:
total 1; values $\ge0$: a weight. With $u_i=pg$, others $p$: $E_N[g(x_i)]=E[g]\cdot1^{N-1}$.
With $u_i=pg$, $u_j=pw$ ($i\ne j$), others $p$: $E_N[g(x_i)w(x_j)]=E[g]E[w]$.

<a id="c01.cl.gesetz"></a>
**c01.cl.gesetz** (c01.thm.haeufigkeit). *Hypotheses.* $X$ is finite, $p$ a weight,
$S\subset X$, $N$ a positive integer and $\varepsilon>0$. The $N$ repetitions of the same
preparation are modelled by the product weight $p^{(N)}$ (an assumption, stated as such
in the text).
$H_N=\tfrac1N\sum_i\chi_S(x_i)$. By c01.cl.produkt and linearity $E_N[H_N]=\tfrac1N\cdot
N\,P[S]=P[S]$. Put $g=\chi_S-P[S]$: $E[g]=0$, $E[g^2]=\operatorname{Var}[\chi_S]$.
$H_N-E_N[H_N]=\tfrac1N\sum_ig(x_i)$, so
$\operatorname{Var}_N[H_N]=\tfrac1{N^2}\sum_{i,j}E_N[g(x_i)g(x_j)]
=\tfrac1{N^2}\bigl(\sum_iE[g^2]+\sum_{i\ne j}E[g]E[g]\bigr)=\tfrac1{N^2}N\operatorname{Var}[\chi_S]
=P[S](1-P[S])/N$ (c01.cl.var-indikator; the diagonal terms use c01.cl.produkt with the
measurement $g^2$). Chebyshev (c01.cl.tschebyscheff) for the measurement $H_N$ on the finite
set $X^N$ with weight $p^{(N)}$: $P_N[|H_N-P[S]|\ge\varepsilon]\le P[S](1-P[S])/(N\varepsilon^2)$;
$q(1-q)\le\tfrac14$ (c01.cl.muenze).
For fixed $\varepsilon>0$, the upper bound decreases with $N$; this does not prove
monotonic decrease of the actual deviation probability.
*Not claimed.* Almost-sure convergence, any statement about a single list, sharpness of the
bound.

<a id="c01.cl.binomial"></a>
**c01.cl.binomial** (c01.eq.binomial). $X=\{0,1\}$, $p(1)=q$, $p(0)=1-q$, $0\le q\le1$,
$S=\{1\}$; $N$ is a positive integer, $k\in\{0,\dots,N\}$, and the repetitions use the
product weight. The convention $t^0=1$ also for $t=0$ represents a product without
factors. A list with exactly
$k$ ones has weight $q^k(1-q)^{N-k}$. The number of such lists is the number of $k$-element
subsets of the $N$ positions, $\binom Nk$. $H_N=k/N$ exactly on these lists, so
$P_N[H_N=k/N]=\binom Nkq^k(1-q)^{N-k}$. For figure c01.fig.konzentration ($q=\tfrac12$):
$\binom N{m+1}/\binom Nm=(N-m)/(m+1)$, whence for $d\ge1$,
$\binom N{N/2\pm d}/\binom N{N/2}=\prod_{j=1}^d\dfrac{N/2-j+1}{N/2+j}$ ($N$ even).

<a id="c01.cl.gleich"></a>
**c01.cl.gleich** (c01.eq.gleich). $p=2$ on $[0,\tfrac12]$, 0 elsewhere: $p\ge0$,
$\int p=2\cdot\tfrac12=1$, and $p(x)=2>1$ there. For any density and any $a$:
$\int_a^ap(x)dx=0$.

<a id="c01.cl.gauss"></a>
**c01.cl.gauss** (c01.ex.gauss). *Uses.* c01.cl.gauss-norm ($\int_{-\infty}^\infty p=1$).
$p(-x)=p(x)$; substitution $x\to-x$ gives $\int_{-\infty}^0p=\int_0^\infty p$; the two add up to
1, so each is $\tfrac12$.

<a id="c01.cl.var-momente"></a>
**c01.cl.var-momente** (c01.eq.var-momente). *Hypothesis.* $M_1$ and $M_2$ exist (the
integrals $\int|x|p$ and $\int x^2p$ are finite). $(x-M_1)^2=x^2-2M_1x+M_1^2$; linearity of the
integral: $\int(x-M_1)^2p\,dx=M_2-2M_1\cdot M_1+M_1^2\cdot M_0=M_2-M_1^2$ with $M_0=1$.

<a id="c01.cl.kein-mittelwert"></a>
**c01.cl.kein-mittelwert** (c01.ex.kein-mittelwert). $p(x)=x^{-2}$ for $x\ge1$, else 0: $p\ge0$;
$\int_1^bx^{-2}dx=1-1/b\to1$; $\int_1^bx\cdot x^{-2}dx=\ln b\to\infty$ as $b\to\infty$. So $M_0=1$
and the integral defining $M_1$ diverges; $M_2$ ($\int_1^bdx=b-1$) diverges too.

<a id="c01.cl.gauss-norm"></a>
**c01.cl.gauss-norm** (Vertiefung, c01.eq.gauss-norm). $I=\int_{-\infty}^\infty e^{-x^2/2}dx$
exists: the integrand is continuous, positive, and for $|x|\ge1$, $x^2\ge|x|$ so
$e^{-x^2/2}\le e^{-|x|/2}$, which is integrable. $I^2=\iint e^{-(x^2+y^2)/2}dx\,dy$ (product of
two convergent integrals of positive functions) $=\int_0^{2\pi}\!\int_0^\infty
e^{-r^2/2}r\,dr\,d\varphi=2\pi[-e^{-r^2/2}]_0^\infty=2\pi$. $I>0$, so $I=\sqrt{2\pi}$.

<a id="c01.cl.gauss-momente"></a>
**c01.cl.gauss-momente** (Vertiefung, c01.eq.gauss-momente). $\int_0^\infty
xe^{-x^2/2}dx=[-e^{-x^2/2}]_0^\infty=1$ (finite), the integrand is odd, so $M_1=0$.
$M_2=\tfrac1{\sqrt{2\pi}}\int x\cdot xe^{-x^2/2}dx$; by parts with $u=x$,
$v'=xe^{-x^2/2}$, $v=-e^{-x^2/2}$: $[-xe^{-x^2/2}]_{-\infty}^\infty+\int e^{-x^2/2}dx
=0+\sqrt{2\pi}$, so $M_2=1$; $\operatorname{Var}=M_2-M_1^2=1$ (c01.cl.var-momente).
