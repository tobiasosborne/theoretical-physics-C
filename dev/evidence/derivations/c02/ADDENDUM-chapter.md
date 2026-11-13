<!-- ROLE: ADDENDUM to evidence/derivations/c02/DERIVATION.md (repair wave after the Tier A
     review docs/plan/phase0/review/REVIEW-smoke-C.md, 2026-10-12).
     It is the checkable home of derivations that chapter c02 prints (content/c02-gpt/de.tex,
     en.tex) and that DERIVATION.md does not contain in that form. DERIVATION.md, REVIEW.md,
     golden.json and check_gpt.py are unchanged.
     STATUS: not covered by evidence/derivations/c02/REVIEW.md (which reviewed DERIVATION.md
     only). The arguments of A2, A3, A4 are the ones the Tier A review confirms in its section
     "Chapter mathematics and Kern honesty"; A1 and A5 are the arguments the review lists as
     checked there ("the finite-mixture induction"; "Every pair of distinct square corners
     differs in a coordinate ..."). No statement here is new mathematics beyond the chapter. -->

# C02 — Addendum: derivations printed in the chapter

Notation is the chapter's: states $x$, effects $f$, priors $\lambda_1,\lambda_2$. DERIVATION.md
writes $\omega_i$, $e$, $\pi_i$ for the same things. "§" refers to DERIVATION.md in this
directory. Each section names the ledger row it supports and the place in `de.tex` where the
argument is printed.

<a id="a1-finite-mixtures"></a>
## A1. Affine functions on finite mixtures

Supports `c02.cl.mehrfach` (equation `c02.eq.mehrfach`, block c02.v1).

**Statement.** Let $K$ be convex and let $f\colon K\to\mathbb R$ satisfy
$f(\lambda x+(1-\lambda)y)=\lambda f(x)+(1-\lambda)f(y)$ for all $x,y\in K$, $\lambda\in[0,1]$.
Then for every $k\geq1$, all $x_1,\dots,x_k\in K$ and all $\lambda_i\geq0$ with
$\sum_i\lambda_i=1$:

$$f\Bigl(\sum_{i=1}^k\lambda_ix_i\Bigr)=\sum_{i=1}^k\lambda_if(x_i).\qquad(\ast_k)$$

**Proof, by induction on $k$.**

1. $k=1$: then $\lambda_1=1$ and both sides are $f(x_1)$.
2. $k=2$: $(\ast_2)$ is the hypothesis with $\lambda=\lambda_1$, $1-\lambda=\lambda_2$.
3. Step from $k-1$ to $k$, for $k\geq3$. Assume $(\ast_{k-1})$ and that every convex
   combination of $k-1$ points of $K$ lies in $K$ (for two points this is convexity; the
   step below proves it for $k$ points as well).
   - Case $\lambda_k=1$. Then $\lambda_i=0$ for $i<k$, since the weights are nonnegative and
     sum to one. Both sides of $(\ast_k)$ are $f(x_k)$.
   - Case $\lambda_k<1$. Put $\mu_i=\lambda_i/(1-\lambda_k)$ for $i<k$. Then $\mu_i\geq0$ and
     $\sum_{i<k}\mu_i=(1-\lambda_k)/(1-\lambda_k)=1$. So $y=\sum_{i<k}\mu_ix_i$ is a convex
     combination of $k-1$ points, hence $y\in K$, and
     $$\sum_{i=1}^k\lambda_ix_i=(1-\lambda_k)\,y+\lambda_k\,x_k ,$$
     because $(1-\lambda_k)\mu_i=\lambda_i$. The right-hand side is a convex combination of two
     points of $K$, so it lies in $K$, and the hypothesis gives
     $f\bigl(\sum_i\lambda_ix_i\bigr)=(1-\lambda_k)f(y)+\lambda_kf(x_k)$. By $(\ast_{k-1})$,
     $f(y)=\sum_{i<k}\mu_if(x_i)$. Multiplying by $1-\lambda_k$ and using
     $(1-\lambda_k)\mu_i=\lambda_i$ again gives $(\ast_k)$.

Relation to DERIVATION.md: §3.1 uses the statement for the vertices of a polytope ("An affine
value on a mixture is the same mixture of its vertex values") without writing the induction.

<a id="a2-centred-bit"></a>
## A2. The classical bit in the centred coordinate

Supports `c02.cl.bit-zentriert` (equation `c02.eq.bit-zentriert`, section c02.s4.1).

**Input (§3.2, `c02.cl.bit-effekte`).** On
$K_2=\{(p_0,p_1):p_i\geq0,\ p_0+p_1=1\}$ every effect is $f(p_0,p_1)=q_0p_0+q_1p_1$ with
$q_i=f(s_i)$, and such a function is an effect exactly when $0\leq q_0\leq1$ and
$0\leq q_1\leq1$.

**Step 1, the coordinate.** Put $r=p_0-p_1$. With $p_0+p_1=1$ this gives
$p_0=\tfrac12(1+r)$ and $p_1=\tfrac12(1-r)$. The map $(p_0,p_1)\mapsto r$ is affine and
invertible between $K_2$ and $[-1,1]$: $p_0\in[0,1]$ exactly when $r=2p_0-1\in[-1,1]$. The
pure states are $s_0\mapsto r=1$ and $s_1\mapsto r=-1$.

**Step 2, the effect.** Substituting,

$$q_0\,\tfrac12(1+r)+q_1\,\tfrac12(1-r)=\tfrac12(q_0+q_1)+\tfrac12(q_0-q_1)\,r .$$

So $f(r)=b+a\,r$ with $b=\tfrac12(q_0+q_1)$ and $a=\tfrac12(q_0-q_1)$. Conversely
$q_0=b+a$ (the value at $r=1$) and $q_1=b-a$ (the value at $r=-1$); the map
$(q_0,q_1)\mapsto(b,a)$ is linear and invertible.

**Step 3, the inequality.** The four conditions on $(q_0,q_1)$ become

- $q_0\geq0$: $b+a\geq0$, that is $a\geq-b$;
- $q_1\geq0$: $b-a\geq0$, that is $a\leq b$;
- $q_0\leq1$: $b+a\leq1$, that is $a\leq1-b$;
- $q_1\leq1$: $b-a\leq1$, that is $a\geq-(1-b)$.

The first two together say $|a|\leq b$, the last two together say $|a|\leq1-b$. Hence
$0\leq q_0,q_1\leq1$ exactly when $|a|\leq\min(b,1-b)$, boundaries included. In particular
$\min(b,1-b)\geq0$, so $b\in[0,1]$.

**Check on one point.** $(q_0,q_1)=(\tfrac34,\tfrac14)$ gives $b=\tfrac12$, $a=\tfrac14$,
and $|a|=\tfrac14\leq\tfrac12$.

Relation to DERIVATION.md: §3.2 has the probability coordinates and the reduced coordinate
$x=p_1$, not the centred coordinate $r$.

<a id="a3-centred-bit-cones"></a>
## A3. The two cones of the classical bit in the centred coordinate

Supports `c02.cl.kegel-bit` (equation `c02.eq.kegel-bit`, block c02.v2).

**Coordinates (as in block c02.v2).** The state $r\in[-1,1]$ is the vector $(1,r)$; the affine
function $b+a\,r$ is the vector $(b,a)$; the pairing of $(b,a)$ with $(t,R)$ is $b\,t+a\,R$,
which for $(t,R)=(1,r)$ is the value $b+a\,r$.

**State cone.** By §1.10 (`c02.cl.basis`) the positive functionals are the vectors
$t\,(1,r)$ with $t\geq0$ and $r\in[-1,1]$. Claim:
$\{t\,(1,r):t\geq0,\ |r|\leq1\}=\{(t,R):t\geq|R|\}$.

- "$\subseteq$": $R=t\,r$ gives $|R|=t\,|r|\leq t$.
- "$\supseteq$": let $t\geq|R|$. If $t>0$, put $r=R/t$; then $|r|\leq1$ and $(t,R)=t\,(1,r)$.
  If $t=0$, then $R=0$ and $(0,0)=0\cdot(1,r)$ for any $r$.

**Function cone.** $b+a\,r\geq0$ for all $r\in[-1,1]$ exactly when the smaller of the two
endpoint values $b+a$, $b-a$ is nonnegative (an affine function on an interval takes its
least value at an endpoint). The smaller one is $b-|a|$. So
$A(K_2)^+=\{(b,a):b\geq|a|\}$.

**Equality.** Both sets are $\{(u,w)\in\mathbb R^2:u\geq|w|\}$. This is an equality of sets in
these coordinates with this pairing, nothing more.

**Agreement with §3.2.** There the state cone is the orthant $P_0,P_1\geq0$ with pairing
$q_0P_0+q_1P_1$. Put $t=P_0+P_1$, $R=P_0-P_1$, so $P_0=\tfrac12(t+R)$,
$P_1=\tfrac12(t-R)$. Then $P_0,P_1\geq0$ exactly when $t\geq|R|$, and with $q_0=b+a$,
$q_1=b-a$ from A2,

$$q_0P_0+q_1P_1=\tfrac12(b+a)(t+R)+\tfrac12(b-a)(t-R)=b\,t+a\,R .$$

<a id="a4-uniform-optimum"></a>
## A4. The optimum in the three theories: uniform proof and the centred bit form

Supports `c02.cl.optimum` (proposition `c02.prop.optimum`, section c02.s6), the parts that
§§4.3–4.4 do not contain: the bit formula in the centred coordinate and the single proof for
all three theories. The square and ball formulas themselves are also derived in §4.3 and §4.4
by enumeration of vertices and by the argument below respectively.

**Inputs.**

- Score in coordinates (`c02.cl.erfolg-koordinaten`, §4.4 first line): with
  $f(\vec r)=b+\vec a\cdot\vec r$,
  $$P(f)=\lambda_1(b+\vec a\cdot\vec r_1)+\lambda_2(1-b-\vec a\cdot\vec r_2)
  =\lambda_2+\delta\,b+\vec v\cdot\vec a,\qquad
  \delta=\lambda_1-\lambda_2,\ \ \vec v=\lambda_1\vec r_1-\lambda_2\vec r_2 .$$
- Effect sets: $(b,\vec a)$ is an effect exactly when $N(\vec a)\leq m(b)$, where
  $m(b)=\min(b,1-b)$ and $N(a)=|a|$ for the bit (A2), $N(\vec a)=|a_x|+|a_y|$ for the square
  bit (§3.3), $N(\vec a)=\|\vec a\|_2$ for the qubit (§3.5). In each case this forces
  $b\in[0,1]$.

**Step 1: fixed $b\in[0,1]$, maximise $\vec v\cdot\vec a$ over $N(\vec a)\leq m$, $m=m(b)$.**
The maximum is $m\,L$ with $L$ as follows.

- Bit, $L=|v|$. Bound: $v\,a\leq|v|\,|a|\leq|v|\,m$. Attained at $a=m$ if $v\geq0$ and at
  $a=-m$ if $v<0$.
- Square bit, $L=\max(|v_x|,|v_y|)$. Bound:
  $\vec v\cdot\vec a\leq|v_x||a_x|+|v_y||a_y|\leq L\,(|a_x|+|a_y|)\leq L\,m$. Attained by
  putting all of $m$ on a coordinate $j$ with $|v_j|=L$: $a_j=m$ if $v_j\geq0$, $a_j=-m$ if
  $v_j<0$, the other coordinate zero.
- Qubit, $L=\|\vec v\|_2$. Bound (Cauchy–Schwarz):
  $\vec v\cdot\vec a\leq\|\vec v\|_2\|\vec a\|_2\leq L\,m$. Attained at
  $\vec a=m\,\vec v/L$ if $L>0$. If $L=0$, then $\vec v\cdot\vec a=0=m\,L$ for every $\vec a$;
  no division is needed.

**Step 2: maximise $g(b)=\lambda_2+\delta\,b+L\,m(b)$ over $b\in[0,1]$.**
On $[0,\tfrac12]$, $g(b)=\lambda_2+(\delta+L)\,b$; on $[\tfrac12,1]$,
$g(b)=\lambda_2+L+(\delta-L)\,b$. Each piece is affine in $b$, and an affine function on an
interval takes its largest value at an endpoint. So the maximum of $g$ is the largest of

- $g(0)=\lambda_2$,
- $g(\tfrac12)=\lambda_2+\tfrac12\delta+\tfrac12L=\tfrac12(1+L)$, because
  $\lambda_2+\tfrac12(\lambda_1-\lambda_2)=\tfrac12(\lambda_1+\lambda_2)=\tfrac12$,
- $g(1)=\lambda_2+\delta=\lambda_1$.

From $\lambda_1+\lambda_2=1$: $\lambda_1=\tfrac12(1+\delta)$ and
$\lambda_2=\tfrac12(1-\delta)$, so $\max(\lambda_1,\lambda_2)=\tfrac12(1+|\delta|)$. Hence

$$P_{\rm opt}=\max_{b}\ \max_{N(\vec a)\leq m(b)}P=\tfrac12\bigl(1+\max(|\delta|,L)\bigr).$$

The priors may be zero: nothing above divides by a prior.

**Step 3: the bit in probability coordinates.** With $x_1=(p_0,p_1)$, $x_2=(p'_0,p'_1)$ and
$f=q_0p_0+q_1p_1$,
$$P=\lambda_1(q_0p_0+q_1p_1)+\lambda_2(1-q_0p'_0-q_1p'_1)=\lambda_2+d_0q_0+d_1q_1,\qquad
d_i=\lambda_1p_i-\lambda_2p'_i .$$
Over $(q_0,q_1)\in[0,1]^2$ the maximum is $\lambda_2+\max(d_0,0)+\max(d_1,0)$ ($q_i=1$ where
$d_i>0$, $q_i=0$ otherwise). Since $\lambda_2=\lambda_2p'_0+\lambda_2p'_1$ and
$\lambda_2p'_i+\max(d_i,0)=\max(\lambda_1p_i,\lambda_2p'_i)$, this is
$\max(\lambda_1p_0,\lambda_2p'_0)+\max(\lambda_1p_1,\lambda_2p'_1)$ (the formula of §4.3).

**Step 4: the two bit formulas agree.** $d_0+d_1=\lambda_1-\lambda_2=\delta$ and
$d_0-d_1=\lambda_1(p_0-p_1)-\lambda_2(p'_0-p'_1)=\lambda_1r_1-\lambda_2r_2=v$. With
$\max(d,0)=\tfrac12(d+|d|)$ and $\lambda_2=\tfrac12(1-\delta)$, the value of Step 3 is
$\tfrac12(1-\delta)+\tfrac12(\delta+|d_0|+|d_1|)=\tfrac12(1+|d_0|+|d_1|)$. For real $s,t$,
$|s|+|t|=\max(|s+t|,|s-t|)$: if $s\,t\geq0$ then $|s+t|=|s|+|t|\geq|s-t|$, and if $s\,t<0$ then
$|s-t|=|s|+|t|\geq|s+t|$. With $s=d_0$, $t=d_1$: $|d_0|+|d_1|=\max(|\delta|,|v|)$. So Step 3
equals $\tfrac12(1+\max(|\delta|,|v|))$, the result of Step 2 for the bit.

<a id="a5-pure-states-of-bit-and-square"></a>
## A5. Distinct pure states of the bit and of the square bit

Supports part (1) of `c02.cl.rein` (corollary `c02.cor.rein`, section c02.s6). Parts (2) and
(3) of that corollary are §6.2 (antipodal criterion in the ball, from §4.4) and §5.1 (level
Q1).

"Perfectly distinguishable" means: there is an effect $f$ with $f(x_1)=1$ and $f(x_2)=0$
(§4.1; `c02.cl.perfekt`).

- **Bit.** The pure states are $s_0=(1,0)$ and $s_1=(0,1)$ (§3.2). For $x_1=s_0$, $x_2=s_1$
  the effect $(q_0,q_1)=(1,0)$ has $f(s_0)=1$, $f(s_1)=0$. For $x_1=s_1$, $x_2=s_0$ take
  $(q_0,q_1)=(0,1)$. Both are effects, since $[0,1]^2$ is the effect set.
- **Square bit.** The pure states are the four corners $s\in\{-1,1\}^2$ of $[-1,1]^2$ (§3.3).
  Let $s\neq s'$ be two corners. They differ in some coordinate $j\in\{x,y\}$; both entries
  are $\pm1$, so $s'_j=-s_j$. Take $f(\vec r)=\tfrac12(1+s_j\,r_j)$, which is $f_j^{+}$ for
  $s_j=1$ and $f_j^{-}$ for $s_j=-1$, an effect by §3.3. Then
  $f(s)=\tfrac12(1+s_j^2)=1$ and $f(s')=\tfrac12(1-s_j^2)=0$.

This argument uses that the corners have coordinates $\pm1$; it is not a statement about
other polygons (§6.2, level H1).
