# C02 — General probabilistic theories and “Distinguish”

Evidence for the Kern text and the first game. Source: the user-designated TeX of Plavala, *General probabilistic theories: an introduction*, arXiv:2103.07469v2. Source filenames below are relative to `docs/plan/research/curriculum/plavala-src/`; each quoted sentence or formula is an exact substring of its indicated physical line. Quotes retain the source's TeX macros. The course framing in `docs/plan/BRIEF.md:44–55` is the author's stipulation, not an assertion proved by Plavala.

Evidence labels mean **source-quoted**, **derived** in the numbered result, or **numerically-checked** by the named function in `check_gpt.py`. The checker also performs exact rational and symbolic checks; “numerically-checked” in the register is the requested machine-evidence category, not a claim that all arithmetic is floating point. All examples adopt no restriction on effects and permit their complementary two-outcome measurements.

Only the permitted source and planning files were read. `basic_v3.tex` was read in full. The bit, square and qubit were implemented and checked, including six levels, before adding the extras. The only repository outputs are this document, `golden.json`, and `check_gpt.py`.

## 1. Definitions for the Kern text

**1.1 [source-quoted] State space, including the finite-dimensional assumption.**

> `basic_v3.tex:4` — ``We will denote by $V$ a real, finite-dimensional vector space and we will denote by $K \subset V$ a compact, convex set, i.e., a state space.``

His symbols are $V$ and $K$. Real scalars, finite dimension, convexity and compactness are hypotheses here. Work on the affine hull of $K$ when its ambient representation has redundant coordinates. For normalisation arguments below we take $K$ nonempty; the quoted sentence does not explicitly state nonemptiness, and all our examples satisfy it.

**1.2 [source-quoted] Convex combinations as mixtures.**

> `basic_v3.tex:13` — ``We say that $x$ is a \emph{mixture} of $y,z \in K$ if there is $\lambda \in [0,1]$ such that $x = \lambda y + (1-\lambda)z$.``

The states belong to $K$ and the weight is in $[0,1]$. Operational preparation of such a mixture is a separate assumption, detailed in §2.

**1.3 [source-quoted] Pure states are extreme points.**

> `basic_v3.tex:9` — ``We say that $x$ is an \emph{extreme point} of $K$, or equivalently that $x$ is a \emph{pure state}, if for every $y,z \in K$ and $\lambda \in (0,1)$ such that $x = \lambda y + (1-\lambda)z$ we have $x = y = z$.``

The preceding hypothesis is $x\in K$. The source symbol for the set of pure states is $\operatorname{ext}(K)$.

**1.4 [source-quoted] Effects and $E(K)$.**

> `basic_v3.tex:57` — ``$E(K)$ is the set of all affine functions $f: K \to [0,1]$, i.e.,``

The inequalities hold for every $x\in K$; the affine identity holds for every pair of states and every mixing weight in $[0,1]$. The game writes $e$ where Plavala writes $f$. Mathematical membership in $E(K)$ and experimental availability are separated by §1.12.

**1.5 [source-quoted] Unit effect.**

> `basic_v3.tex:70` — ``$1_K \in E(K)$ is the constant function given as $1_K(x) = 1$ for all $x \in K$.``

The game's $u$ means precisely this $1_K$.

**1.6 [source-quoted] Real affine function space $A(K)$.**

> `basic_v3.tex:78` — ``A(K) &= \{ f: K \to \RR : f(\lambda x + (1-\lambda)y) = \lambda f(x) + (1-\lambda)f(y), \forall x,y \in K, \forall \lambda \in [0,1] \}, \\``

The alignment characters and final line break are part of the quoted formula. Values are real rather than necessarily probabilities.

**1.7 [source-quoted] Cone of positive affine functions $A(K)^+$.**

> `basic_v3.tex:79` — ``A(K)^+ &= \{ f \in A(K) : f(x) \geq 0, \forall x \in K \}.``

These are functions on states. They need not be bounded above by one.

**1.8a [source-quoted] Dual vector space $A(K)^*$.**

> `basic_v3.tex:154` — ``Let $A(K)^*$ denote the dual vector space to $A(K)$, that is, let $A(K)^*$ be the vector space of all linear functionals on $A(K)$.``

**1.8b [source-quoted] Positive dual cone $A(K)^{*+}$.**

> `basic_v3.tex:158` — ``A(K)^{*+} = \{ \psi \in A(K)^* : \<\psi, f\> \geq 0, \forall f \in A(K)^+ \},``

The condition tests all positive affine functions. Evaluation of a functional on its argument is a pairing between the dual space in §1.8a and $A(K)$; making it an inner product on one space would require an additional identification between those spaces.

**1.9 [source-quoted; derived] Embedding by evaluation.**

> `basic_v3.tex:174` — ``\< x, f \> = f(x).``

For fixed $x$, evaluation is linear in $f$, and nonnegative on $A(K)^+$. It maps $x$ into $A(K)^{*+}$ with $\langle x,1_K\rangle=1$. Distinct states are separated by an affine coordinate function: a differing coordinate can be shifted and rescaled into $[0,1]$ using its finite range on compact $K$. Thus the embedding is injective. It preserves mixtures by the affine identity.

**1.10 [source-quoted; derived] Normalised base of the state cone.**

> `basic_v3.tex:181` — ``K = \{ \varphi \in A(K)^{*+} : \< \varphi, 1_K \> = 1 \}``

The theorem says “up to an isomorphism”; §1.9 specifies it. If positive $\psi$ satisfies $\psi(1_K)=0$, the bounds $-M1_K\leq f\leq M1_K$ from §1.15 force $\psi(f)=0$ for all $f$, so $\psi=0$. Every nonzero positive $\psi$ therefore has $t=\psi(1_K)>0$ and $\psi/t\in K$ by the quoted theorem. Consequently

$$A(K)^{*+}=\{t\,\operatorname{ev}_x:t\geq0,\ x\in K\}.$$

For nonzero $\psi$ both $t$ and $x$ are unique. At zero, $t=0$ but $x$ is arbitrary. In our affine coordinates evaluation is $(1,r)$ and an effect is $(b,a)$ with pairing $b+a\cdot r$. Plavala's representation in `basic_v3.tex:195–242` puts the added coordinate last; moving it first is only a coordinate permutation. Probability coordinates for a simplex already incorporate normalisation through $\sum_i p_i=1$.

**1.11 [source-quoted; derived; source gap] Measurements.**

> `basic_v3.tex:133` — ``For every $f \in E(K)$ there is $f^\perp \in E(K)$ such that $f + f^\perp = 1_K$.``

Thus $f^\perp=1_K-f$, and a two-outcome measurement has probabilities $f(x)$ and $1-f(x)$. For a finite list $f_1,\ldots,f_m$, require $f_i\in E(K)$ and $\sum_i f_i=1_K$. Then $p_i=f_i(x)\geq0$ and $\sum_i p_i=1$ for every state. Conversely, affine outcome probabilities normalised on every state have exactly these properties. This supplies the finite-outcome convention the chapter needs, assuming all such collections are allowed.

**Gap:** the exact general finite-measurement definition is not given in the permitted files. `QT_v3.tex:70` refers to a measurements proposition elsewhere; that reference does not provide its wording. The no-restriction statement about individual yes/no questions does not by itself establish availability of every multi-outcome collection; this additional convention is explicit here.

**1.12 [source-quoted] No-restriction hypothesis.**

> `basic_v3.tex:531` — ``So far we have assumed that every effect from $E(K)$ corresponds to a well-defined `yes'-`no' question that, at least in principle, can be experimentally performed.``

The next sentence names this assumption the no-restriction hypothesis. Restricted theories instead specify an allowed subset $E\subset E(K)$; the source's restrictions discussion is `basic_v3.tex:530–545`. The calculations below optimise over the full mathematical $E(K)$.

**1.13 [source-quoted; derived] Effects as an order interval.**

> `basic_v3.tex:118` — ``E(K) = \{ f \in A(K) : 0 \leq f \leq 1_K \}.``

The order is pointwise: $f\geq g$ means $f(x)-g(x)\geq0$ for every $x\in K$. By §1.10 every positive state functional is $t\operatorname{ev}_x$ with $t\geq0$. Therefore $f\in A(K)^+$ is equivalent to $\langle\psi,f\rangle\geq0$ for every $\psi\in A(K)^{*+}$: testing normalised evaluations gives necessity, and multiplying their nonnegative values by $t$ gives sufficiency. Thus $A(K)^+$ is the positive dual of the state cone under this pairing.

**1.14 [source-quoted] Order unit, with its hypotheses.**

> `basic_v3.tex:141` — ``Let $f \in A(K)^+$ be an element such that for every $g \in A(K)$ there is $\mu \in \Rp$ such that $g \leq \mu f$.``

The following sentence calls $f$ an order unit of $A(K)^+$. Notice both $f\in A(K)^+$ and $\mu\geq0$.

**1.15 [source-quoted; derived] The unit effect is an order unit.**

> `basic_v3.tex:145` — ``$1_K$ is the order unit of $A(K)^+$.``

An affine function has the finite coefficient expression $g(r)=b+a\cdot r$ (the affine-basis argument is in §1.19), and $|g(r)-g(r')|\leq\sum_i|a_i|\,|r_i-r'_i|$ proves continuity. Compactness gives $M=\max_{x\in K}|g(x)|<\infty$, so $-M1_K\leq g\leq M1_K$. This proves the stated property without requiring a possibly negative maximum as the nonnegative coefficient.

**1.16 [source-quoted; derived] Positive function cone hypotheses.**

> `basic_v3.tex:92` — ``$A(K)^+$ is a convex, closed (in the Euclidean topology), pointed and generating cone.``

Pointed means $C\cap(-C)=\{0\}$; generating means $\operatorname{span}C=A(K)$. For this cone, pointedness also follows because $f\geq0$ and $-f\geq0$ imply $f(x)=0$ everywhere. Generating follows from $g=(g+M1_K)-M1_K$ using §1.15. Convexity and closedness follow from the defining linear inequalities.

**1.17 [source-quoted; derived] Spanning and conic generation.**

> `basic_v3.tex:81` — ``Then $A(K) = \linspan(E(K))$ and $A(K)^+ = \cone(E(K))$, i.e., $A(K)$ is the smallest vector space containing $E(K)$ and $A(K)^+$ is the smallest cone in $A(K)$ that contains $E(K)$.``

For a nonzero positive $f$, put $M=\max_K f>0$ and $f/M\in E(K)$; treat $f=0$ separately. Every affine function is a difference of positive ones by §1.15. These observations derive both equalities.

**1.18 [source-quoted] State cone hypotheses.**

> `basic_v3.tex:162` — ``$A(K)^{*+}$ is a convex, closed, pointed and generating cone.``

These properties are stated for the finite-dimensional framework of §1.1. The cone is the unnormalised-state cone of §1.10, whereas §1.16 concerns functions on states.

**1.19 [derived] $E(K)$ is finite-dimensional, convex and compact.** Choose an affine basis of the affine hull from points of $K$. An affine function is determined by its values there: an affine relation with negative coefficients can be rearranged into equality of two convex combinations, so its values obey that relation. Those basis values lie in $[0,1]$ for an effect. The invertible finite evaluation map therefore bounds its coefficients. Every condition $0\leq f(x)\leq1$ is closed and convex in those coefficients; their intersection is closed, bounded and convex. In a finite-dimensional Euclidean space this is compact. Equivalently, the bounded coefficient cube has convergent subsequences, and the closed inequalities retain their limits.

## 2. Why effects must be affine

**2.1 [source-quoted] Plavala's consistency requirement.**

> `basic_v3.tex:55` — ``We will require that we get the same result whether we mix the state or whether we mix the probabilities.``

The argument's locus is `basic_v3.tex:15,53,55–65`.

**2.2 [source-quoted] His preparation assumption.**

> `basic_v3.tex:15` — ``From now on we will assume that one can prepare a mixture using the aforementioned construction.``

The construction runs the experiment $N$ times, preparing $x$ in $\lambda N$ runs and $y$ in $(1-\lambda)N$ runs, explicitly assuming these counts are whole numbers. Information about how the mixture was prepared is treated as additional classical information rather than a new averaged state.

**2.3 [source-quoted; derived] Result and operational assumption.**

> `basic_v3.tex:63` — ``f(\lambda x + (1-\lambda) y) = \lambda f(x) + (1-\lambda) f(y)``

The contribution to the yes frequency from the $x$ runs is $\lambda f(x)$; the disjoint $y$ runs contribute $(1-\lambda)f(y)$. Adding them gives the right-hand side. Assigning the same probability to the prepared averaged state gives the left-hand side. The source requires the identity for all $x,y\in K$ and all $\lambda\in[0,1]$, beyond the finite integer-count illustration.

The operational assumptions are that the randomised preparations are available and that probabilities depend on the averaged preparation state, consistently across its preparation decompositions. Convexity by itself does not require an arbitrary response function to be affine. No statistical independence between separate runs is added to Plavala's argument.

## 3. Worked theories with coordinates and effects

**3.1 [derived; numerically-checked: `exact_effect_vertices`, `check_exact_polytope`, `numerical_effect_vertices`] Polytope recipe.** For $K=\operatorname{conv}\{v_i\}\subset\mathbb R^d$ in full affine dimension, write

$$e(r)=b+a\cdot r,\qquad H_i=(1,v_i).$$

An affine value on a mixture is the same mixture of its vertex values. Therefore

$$E(K)=\{(b,a):0\leq H_i(b,a)\leq1\text{ for every }i\}.$$

These are exactly $2\,|\operatorname{ext}K|$ half-space constraints. A feasible effect is a vertex exactly when its active constraint normals span $\mathbb R^{d+1}$. If they do not, choose a nonzero common null direction; sufficiently small perturbations in both signs preserve the finitely many remaining strict inequalities, so the effect is not extreme. If they do span, any convex decomposition must saturate those same bounds in both parts, which are consequently equal to the unique solution. Enumerating every full-rank set of $d+1$ active constraints is therefore exhaustive. In simplex probability coordinates the evaluation rows are the probability vertices themselves, without adding a redundant constant coordinate.

**3.2 [source-quoted; derived; numerically-checked: `check_primary_geometry`] Classical bit — first release.**

> `CT_v3.tex:61` — ``Let $n=2$, then the pure states are usually denoted $s_0$ and $s_1$, $S_2$ is isomorphic to the interval $[0,1]$ and the state space corresponds to a classical bit.``

Use probability coordinates

$$K_2=\{(p_0,p_1):p_i\geq0,\ p_0+p_1=1\},\qquad\operatorname{ext}K_2=\{(1,0),(0,1)\}.$$

Affineness gives $e(p)=q_0p_0+q_1p_1$, with $q_i=e(s_i)$. Thus

$$E(K_2)=[0,1]^2,\qquad\operatorname{ext}E(K_2)=\{(0,0),(0,1),(1,0),(1,1)\}.$$

A coordinate strictly between zero and one admits two opposite small perturbations. Conversely, a convex decomposition of a zero/one vector must have exactly the same zero/one value in each coordinate. This proves the extreme-effect list. The unit is $(1,1)$.

The state cone is $C=\mathbb R_+^2$: every nonzero positive vector normalises by its coordinate sum. Its Euclidean dual is itself, because testing on the two coordinate rays requires both dual coordinates nonnegative, which is also sufficient. In the reduced state coordinate $x=p_1\in[0,1]$, the same effect is $q_0+(q_1-q_0)x$; the effect square is a cube of endpoint values, not a square of arbitrary slope/intercept bounds.

**3.3 [source-quoted; derived; numerically-checked: `check_primary_geometry`] Square bit (“gbit”, boxworld) — first release.**

> `boxworld_v3.tex:91` — ``E(S) = \conv( \{ 0, f_x, 1_S - f_x, f_y, 1_S - f_y, 1_S \} ).``

Choose the square with four points $(0,0),(1,0),(0,1),(1,1)$. The invertible affine change $r=2x-(1,1)$ gives

$$K_\square=[-1,1]^2,\qquad\operatorname{ext}K_\square=\{(-1,-1),(-1,1),(1,-1),(1,1)\}.$$

For $e(r)=b+a_xr_x+a_yr_y$, the smallest and largest vertex values are $b-|a_x|-|a_y|$ and $b+|a_x|+|a_y|$. Therefore

$$E(K_\square)=\{(b,a_x,a_y):|a_x|+|a_y|\leq\min(b,1-b)\}.$$

Its complete extreme-effect list is

$$0=(0,0,0),\quad u=(1,0,0),\quad X_\pm=(1/2,\pm1/2,0),\quad Y_\pm=(1/2,0,\pm1/2).$$

For completeness put $q=|a_x|+|a_y|$. Every effect is the convex combination with weights $b-q$ on $u$, $2|a_x|$ on $X_{\operatorname{sign}(a_x)}$, $2|a_y|$ on $Y_{\operatorname{sign}(a_y)}$, and $1-b-q$ on $0$; terms of zero weight are omitted. The four axis effects are extreme because their zero and one values on opposite edges uniquely determine their three coefficients. The apices are extreme because their constant extreme probabilities fix every value.

The state cone and its Euclidean dual are

$$C_\square=\{(t,X,Y):t\geq\max(|X|,|Y|)\},\qquad C_\square^*=\{(s,A,B):s\geq|A|+|B|\}.$$

The second inequality follows by minimising $s+Ar_x+Br_y$ over the four state vertices. These cones are **not** equal: $(1,1,1)$ belongs to the first and fails the second. The name “gbit” comes from the game specification (`IDEAS.md:104`); Plavala calls the example boxworld.

**3.4 [source-quoted; derived; numerically-checked: `check_qubit_matrix_algebra`, `check_weighted_ball_samples`] Qubit matrices and the Bloch ball — first release.**

> `QT_v3.tex:11` — ``\dens(\Ha) = \{ \rho \in \bound_H^+(\Ha) : \Tr(\rho) = 1 \}.``

Specialise this model to $2\times2$ matrices. Define

$$I=\begin{pmatrix}1&0\\0&1\end{pmatrix},\quad
\sigma_x=\begin{pmatrix}0&1\\1&0\end{pmatrix},\quad
\sigma_y=\begin{pmatrix}0&-i\\i&0\end{pmatrix},\quad
\sigma_z=\begin{pmatrix}1&0\\0&-1\end{pmatrix}.$$

Direct multiplication gives $\sigma_j^2=I$, $\sigma_j\sigma_k+\sigma_k\sigma_j=0$ for $j\ne k$, $\operatorname{tr}\sigma_j=0$, and $\operatorname{tr}(\sigma_j\sigma_k)=2\delta_{jk}$. Expanding the square consequently gives

$$(r\cdot\sigma)^2=\|r\|_2^2I.$$

A Hermitian matrix with diagonal entries $\alpha,\beta$ and upper-right entry $u-iv$ has the unique expansion $bI+a\cdot\sigma$ with $b=(\alpha+\beta)/2$, $a=(u,v,(\alpha-\beta)/2)$. Trace one therefore gives exactly

$$\rho(r)=\frac{I+r\cdot\sigma}{2}
=\frac12\begin{pmatrix}1+r_z&r_x-ir_y\\r_x+ir_y&1-r_z\end{pmatrix}.$$

The determinant of $\lambda I-\rho$ is $(\lambda-1/2)^2-\|r\|_2^2/4$, so the eigenvalues are $(1\pm\|r\|_2)/2$. For a Hermitian $2\times2$ matrix, distinct eigenvectors are orthogonal since $\langle w,Hv\rangle=\langle Hw,v\rangle$; they can be normalised into a basis. In the repeated-eigenvalue case here the vector coefficient vanishes and the matrix is scalar. Its quadratic form is thus a sum of eigenvalues times nonnegative squared coordinates. Positivity is equivalent to nonnegative eigenvalues. Hence

$$K_{\rm qubit}=\{r\in\mathbb R^3:\|r\|_2\leq1\}.$$

For an effect matrix

$$E=bI+a\cdot\sigma=\begin{pmatrix}b+a_z&a_x-ia_y\\a_x+ia_y&b-a_z\end{pmatrix},$$

its eigenvalues are $b\pm\|a\|_2$. The requirements $E\geq0$ and $I-E\geq0$ are therefore equivalent to

$$E(K_{\rm qubit})=\{(b,a):\|a\|_2\leq\min(b,1-b)\}.$$

Finally, the trace identities already multiplied out give

$$e(r)=\operatorname{tr}(\rho(r)E)=b+a\cdot r.$$

Every affine probability function has these coefficients and this unique matrix, so the correspondence works in both directions. Here $e_0=b$ and $\mathbf e=a$ in the question's notation. The unit matrix $I$ corresponds to $u=(1,0,0,0)$.

**3.5 [derived; numerically-checked: `check_qubit_matrix_algebra`, `check_ball_cones_and_extremes`] Qubit extreme states, extreme effects and self-duality — first release.** The inequality

$$|x\cdot y|\leq\|x\|_2\|y\|_2$$

follows by expanding $\|x-\lambda y\|_2^2\geq0$ and choosing $\lambda=(x\cdot y)/\|y\|_2^2$; the zero-vector case is immediate. This also supplies the equality conditions used below.

If $\|r\|_2=1$, taking the scalar product with $r$ in a convex decomposition forces both parts to have scalar product one and hence to equal $r$. If $\|r\|_2=q<1$, write $r=q n$ for a unit $n$ (choose any $n$ at zero) and

$$r=\frac{1+q}{2}n+\frac{1-q}{2}(-n).$$

Thus the sphere, and only the sphere, is the set of extreme states. On the sphere, $\rho^2=\rho$ and its eigenvalues are $1,0$, so these states are rank-one projectors.

The complete extreme-effect set is

$$\operatorname{ext}E(K_{\rm qubit})=\{0,u\}\ \cup\ \{(1/2,n/2):\|n\|_2=1\}.$$

To prove completeness, put $q=\|a\|_2$. For $q>0$ set $n=a/q$ and decompose

$$(b,a)=(b-q)u+2q(1/2,n/2)+(1-b-q)0.$$

All weights are nonnegative and sum to one. For $q=0$ use $(b,0)=bu+(1-b)0$. At an equatorial point $(1/2,n/2)$, every effect satisfies $n\cdot a\leq\|a\|_2\leq b$ and $n\cdot a\leq1-b$. Equality in the average forces each component of a convex decomposition to have $b=1/2$ and $a=n/2$; hence the point is extreme. The apices are extreme since $0\leq b\leq1$ and $a=0$ at $b=0,1$. This proves the list, including the two trivial effects that must not be omitted.

The unnormalised-state cone is

$$L_4=\{(t,R):t\geq\|R\|_2\}.$$

Indeed $(tI+R\cdot\sigma)/2$ has eigenvalues $(t\pm\|R\|_2)/2$. Its standard Euclidean dual is itself: if $s\geq\|A\|_2$, then $st+A\cdot R\geq st-\|A\|_2\|R\|_2\geq0$. If $s<\|A\|_2$ with $A\ne0$, the cone vector $(1,-A/\|A\|_2)$ has negative pairing; if $A=0$ and $s<0$, use $(1,0)$. This proves both inclusions. In operator coefficients the Hilbert–Schmidt pairing is $\operatorname{tr}[(bI+a\cdot\sigma)(cI+d\cdot\sigma)]=2(bc+a\cdot d)$, a positive scalar multiple of the Euclidean pairing, and gives the same self-duality conclusion.

### Extras — added after the first-release checks passed

**3.6 [source-quoted; derived; numerically-checked: `check_extra_geometry`] Classical trit (triangle).**

> `CT_v3.tex:112` — ``For $n=3$, the pure states are denoted $s_1, s_2, s_3$ and $S_3$ is a triangle.``

Use $K_3=\{p\in\mathbb R^3:p_i\geq0,\sum_i p_i=1\}$ with vertices $(1,0,0),(0,1,0),(0,0,1)$. The affine effect is $e(p)=\sum_i q_i p_i$, so

$$E(K_3)=[0,1]^3,\qquad\operatorname{ext}E(K_3)=\{(0,0,0),(0,0,1),(0,1,0),(0,1,1),(1,0,0),(1,0,1),(1,1,0),(1,1,1)\}.$$

The bit's coordinate perturbation proof proves this list as well. The state cone is $\mathbb R_+^3$, self-dual by testing the three coordinate rays. In the reduced coordinates $(x,y)=(p_2,p_3)$ the same effect is $q_1+(q_2-q_1)x+(q_3-q_1)y$. This is an affine image of the cube, not an axis-aligned cube in slope/intercept coordinates.

**3.7 [derived; numerically-checked for $n=3,\ldots,8$: `polygon_expressions`, `check_extra_geometry`] Regular polygon models.** These are explicit constructions within §1's framework; no identification with an external polygon-model paper or its normalisation is asserted. Choose unit circumradius, $n\geq3$, and define

$$\theta_k=\frac{2\pi k}{n},\quad v_k=(\cos\theta_k,\sin\theta_k),\quad K_n=\operatorname{conv}\{v_k:k=0,\ldots,n-1\},\quad c_n=\cos(\pi/n).$$

All $v_k$ are extreme by the unit-sphere scalar-product argument of §3.5. With $m_j=(\cos((2j+1)\pi/n),\sin((2j+1)\pi/n))$, each edge from $v_j$ to $v_{j+1}$ lies on $m_j\cdot r=c_n$, and every vertex is on its inner side. Adjacent edge lines intersect at the listed vertices, so $K_n$ also has the inequalities $m_j\cdot r\leq c_n$.

The effects are explicitly

$$E(K_n)=\{(b,a):0\leq b+a\cdot v_k\leq1\text{ for all }k\}.$$

For **odd** $n$, its complete vertex list is $0,u$ and, for each $k$,

$$F_k=\left(\frac{c_n}{1+c_n},\frac{v_k}{1+c_n}\right),\qquad
u-F_k=\left(\frac1{1+c_n},-\frac{v_k}{1+c_n}\right).$$

Here $u=(1,0,0)$; the displayed complement means the unit minus $F_k$. For **even** $n$, the complete list is $0,u$ and

$$G_j=\left(\frac12,\frac{m_j}{2c_n}\right),\qquad j=0,\ldots,n-1.$$

To derive these lists, a nonconstant extreme effect in three coefficient dimensions needs three independent saturated bounds by §3.1. A line meets the circle in at most two points, so three vertices cannot all lie on one level line. Two active vertices must therefore lie on one supporting edge and at least one on the opposite parallel support. The edge normal is $m_j$. For odd $n$ the opposite support meets a single vertex: in the direction of that vertex the minimum scalar product is $-c_n$ and the maximum is $1$, giving $F_k$ and its complement. For even $n$ the opposite support is a parallel edge, with minimum $-c_n$ and maximum $c_n$, giving $G_j$. Their active normals have full rank, so all listed effects are extreme. The only constant extremes are $0,u$. This also proves the formulas for general $n$, rather than extrapolating the finite computation.

The counts checked independently are:

| $n$ | State vertices | Effect vertices | Parity |
|---:|---:|---:|---|
| 3 | 3 | 8 | odd |
| 4 | 4 | 6 | even |
| 5 | 5 | 12 | odd |
| 6 | 6 | 8 | even |
| 7 | 7 | 16 | odd |
| 8 | 8 | 10 | even |

The regular triangle is affinely equivalent to the probability-coordinate trit: the map $p\mapsto\sum_{k=0}^2p_{k+1}v_k$ takes the simplex onto it and is invertible on the normalisation plane because the three vertices are not collinear. The unit regular square is the diamond with vertices $(1,0),(0,1),(-1,0),(0,-1)$; it differs in coordinates from the first-release square of §3.3.

**3.8 [derived; numerically-checked for $n=3,\ldots,8$: `check_polygon_duality`] Polygon state-cone self-duality, including the radius convention.** Allow a circumradius $R>0$ and let $C_{n,R}=\{t(1,Rr):t\geq0,r\in K_n\}=\{\sum_k\lambda_k(1,Rv_k):\lambda_k\geq0\}$. This is the full convex state cone, including positive sums of different vertex rays. Its dual is

$$C_{n,R}^*=\{(s,a):s+R a\cdot v_k\geq0\text{ for every }k\}.$$

The sum of the $v_k$ is zero: this is the real and imaginary part of $\sum_{k=0}^{n-1}z^k=(1-z^n)/(1-z)=0$ for $z=e^{2\pi i/n}\ne1$. Thus $s\geq0$ in the dual, and at $s=0$ all the scalar products vanish, forcing $a=0$. Normalise each nonzero dual ray to $s=1$. For $a\ne0$, a vertex lies within angle $\pi/n$ of $-a$, so its inequality forces $\|a\|_2\leq1/(Rc_n)$. The slice is therefore bounded and closed, and the finite active-constraint vertex argument applies.

An extreme point of that slice has two independent active inequalities. Their line is a support of $K_n$ containing the corresponding vertices, so they are adjacent. Solving $1+Ra\cdot v_j=1+Ra\cdot v_{j+1}=0$ gives the complete dual-slice vertex list

$$a_j=-\frac{m_j}{R c_n}.$$

It has radius $1/(Rc_n)$ and angles $\theta_j+\pi/n+\pi$. Hence:

- At the **unit radius used in `golden.json`**, no finite $n\geq3$ is self-dual in the standard inner product: the dual-slice radius is $1/c_n>1$.
- For **odd** $n$, the angle shift is $(n+1)/2$ whole vertex steps. The ray directions coincide, and the two cones are equal exactly when $R=1/(Rc_n)$, namely $R=\sqrt{\sec(\pi/n)}$.
- For **even** $n$, the shift is a half vertex step modulo whole steps. The ray directions differ for every radius, so the cones are not equal in this standard inner product. At $R=\sqrt{\sec(\pi/n)}$ they have matching slice radii but still a rotation offset.

The computation checks the ray formula independently by cross products of neighbouring state rays and checks equality of the scaled ray sets:

| $n$ | Standard self-dual at $R=1$ | Standard self-dual at $R=\sqrt{\sec(\pi/n)}$ |
|---:|:---:|:---:|
| 3 | no | yes |
| 4 | no | no |
| 5 | no | yes |
| 6 | no | no |
| 7 | no | yes |
| 8 | no | no |

A rotation and radial scaling give a linear cone isomorphism in every case: with $\tau=\pi+\pi/n$, the invertible map $(s,a)\mapsto(s,R^2c_n\operatorname{Rot}_{-\tau}a)$ sends each dual ray $(1,a_j)$ to $(1,Rv_j)$ and therefore sends their positive sums onto $C_{n,R}$. An isomorphism is not equality in the specified inner product. No claim about all alternative inner products for even polygons is made. The probability-coordinate trit's self-duality in §3.6 and the unit regular triangle's failure here concern different inner products under a nonorthogonal coordinate change.

**3.9 [derived; numerically-checked: `check_ball_cones_and_extremes`, `check_levels`] Disc.** Define $K_D=\{r\in\mathbb R^2:\|r\|_2\leq1\}$. Minimising and maximising $a\cdot r$ gives $-\|a\|_2$ and $\|a\|_2$: the inequality is proved in §3.5, and equality is attained at $r=\pm a/\|a\|_2$ when $a\ne0$. Therefore

$$E(K_D)=\{(b,a_x,a_y):\sqrt{a_x^2+a_y^2}\leq\min(b,1-b)\}.$$

Its extreme states are $(\cos\theta,\sin\theta)$, $0\leq\theta<2\pi$. Its extreme effects are $0,u$ and $(1/2,\cos\theta/2,\sin\theta/2)$, with the same completeness and extremality proof as §3.5 in two components. Its state cone is $L_3=\{(t,X,Y):t\geq\sqrt{X^2+Y^2}\}$.

For an explicit self-duality derivation, if $s\geq\sqrt{A^2+B^2}$ then $st+AX+BY\geq st-\sqrt{A^2+B^2}\sqrt{X^2+Y^2}\geq0$ on $L_3$. If $s<\sqrt{A^2+B^2}$, pair with $(1,-(A,B)/\sqrt{A^2+B^2})$ to get a negative result; for $(A,B)=0,s<0$ use $(1,0,0)$. Thus $L_3^*=L_3$ in the standard inner product, with no numerical extrapolation needed.

**3.10 [derived; numerically-checked: `generate_all`] Stored geometry and precision.** `golden.json` lists every state and effect vertex for the bit, square, trit and regular polygons $n=3,\ldots,8$. Rational coordinates are exact rational strings; other coordinates are strings with 17 significant digits, generated from 60-digit evaluation of the explicit expressions above. Regular $n=4$ is additionally enumerated with exact rational arithmetic. Double-precision independent enumeration uses feasibility tolerance $10^{-14}$ and vertex matching tolerance $10^{-12}$; the constructed polygon effects are also tested on all vertices at 60 digits with tolerance $10^{-50}$.

A disc or ball has infinitely many extreme states and effects, so a finite vertex list cannot represent it. For these two entries, `K_vertices` and `E_vertices` are `null`; exact parametric families and the isolated effects $0,u$ are stored instead. This is an explicit necessary interpretation of the requested “vertex list”, not a discretisation. The cone and effect tests use 10,000 deterministic samples in each of dimensions two and three as supplementary checks; the general results are proved above.

## 4. The mathematics of “Distinguish”

**4.1 [source-quoted; derived; numerically-checked: `check_levels`] Score and hypotheses.**

> `basic_v3.tex:508` — ``p_{\text{succ}}(f) = \lambda \<x_0, f\> + (1-\lambda)(1-\<x_1,f\>).``

Let $\omega_1,\omega_2\in K$, $\pi_i\geq0$, and $\pi_1+\pi_2=1$. Measure $\{e,1_K-e\}$ and guess state 1 on the first outcome and state 2 on the second. The two disjoint correct-guess probabilities add to

$$P(e)=\pi_1e(\omega_1)+\pi_2(1-e(\omega_2)).$$

This is affine in $e$. Always guessing state 2 means $e=0$ and scores $\pi_2$; always guessing state 1 means $e=u$ and scores $\pi_1$. Hence $\max(\pi_1,\pi_2)\leq P_{\rm opt}\leq1$. If both priors are positive, $P=1$ is equivalent to $e(\omega_1)=1$ and $e(\omega_2)=0$, since $1-P=\pi_1(1-e(\omega_1))+\pi_2e(\omega_2)$ is a sum of nonnegative terms. With a zero prior, a perfect score need not distinguish anything.

**4.2 [source-quoted; derived] Some extreme effect attains the maximum: two-line proof.**

> `basic_v3.tex:31` — ``Let $K$ be a state space and let $\ext(K)$ be the set of pure states of $K$ then $K = \conv( \ext(K) )$.``

By §1.19 the continuous affine $P$ has a maximiser on compact $E(K)$; apply the quoted result to that compact convex set and express the maximiser as a convex combination of extreme effects.
Affineness makes its score the same convex combination of their scores, so at least one component is an extreme effect with that maximal score.

This is an existence statement, not a statement that every maximiser is extreme.

**4.3 [derived; numerically-checked: `check_levels`] Finite maximum for polytopes and two primary closed forms.** If the effect vertices are $e^{(1)},\ldots,e^{(M)}$, then

$$P_{\rm opt}=\max_{1\leq j\leq M}\left[\pi_1e^{(j)}(\omega_1)+\pi_2(1-e^{(j)}(\omega_2))\right].$$

For a classical simplex, put $d_i=\pi_1p_{1i}-\pi_2p_{2i}$. Independent choices $q_i\in[0,1]$ maximise $\pi_2+\sum_i d_iq_i$ by $q_i=1$ for positive $d_i$ and $q_i=0$ for negative $d_i$ (either endpoint at zero). Thus

$$P_{\rm opt}^{\rm classical}=\sum_i\max(\pi_1p_{1i},\pi_2p_{2i})=\frac{1+\sum_i|d_i|}{2},$$

using $\max(a,b)=(a+b+|a-b|)/2$ and the two normalisations.

For the first-release square set $\delta=\pi_1-\pi_2$ and $v=\pi_1r_1-\pi_2r_2$. The scores at the four axis effects are $(1\pm v_x)/2$ and $(1\pm v_y)/2$, and the apices score $(1\pm\delta)/2$. Therefore

$$P_{\rm opt}^{\square}=\frac{1+\max(|\delta|,|v_x|,|v_y|)}2.$$

**4.4 [derived; numerically-checked: `check_levels`] Closed form for the disc and ball.** In either dimension let

$$\delta=\pi_1-\pi_2,\quad v=\pi_1r_1-\pi_2r_2,\quad L=\|v\|_2.$$

Then $P=\pi_2+\delta b+v\cdot a$. At fixed $b$, the maximum scalar-product contribution is $L\min(b,1-b)$, attained with $a$ parallel to $v$; if $L=0$ the contribution is zero. This yields two linear pieces in $b$: $\delta b+Lb$ for $0\leq b\leq1/2$ and $\delta b+L(1-b)$ for $1/2\leq b\leq1$. Their maximum is at $b=0,1/2$, or $1$. The corresponding full scores are $\pi_2$, $(1+L)/2$, and $\pi_1$, so

$$\boxed{P_{\rm opt}^{D,B}=\frac{1+\max(|\delta|,L)}2.}$$

An optimal extreme effect is $u$ when $\delta\geq L$, $0$ when $-\delta\geq L$, and $(1/2,v/(2L))$ when $L\geq|\delta|$ and $L>0$. At equality these choices tie where applicable. If $L=\delta=0$, every effect has score $1/2$. For equal priors this simplifies to $P_{\rm opt}=1/2+\|r_1-r_2\|_2/4$.

**4.5 [derived; numerically-checked: `check_qubit_matrix_algebra`, `check_levels`, `check_weighted_ball_samples`] Direct $2\times2$ trace-norm identity.** The weighted matrix difference is

$$D=\pi_1\rho_1-\pi_2\rho_2=\frac{\delta I+v\cdot\sigma}{2}.$$

Its characteristic determinant is $(\lambda-\delta/2)^2-L^2/4$, so its eigenvalues are $(\delta+L)/2$ and $(\delta-L)/2$. Define the trace norm of this Hermitian matrix as the sum of the absolute eigenvalues. Directly,

$$\|D\|_1=\frac{|\delta+L|+|\delta-L|}{2}=\max(|\delta|,L).$$

For $\delta\geq L$ the sum is $2\delta$; for $\delta\leq-L$ it is $-2\delta$; for $-L\leq\delta\leq L$ it is $2L$. Substitution into §4.4 proves

$$\boxed{P_{\rm opt}=\frac{1+\|\pi_1\rho_1-\pi_2\rho_2\|_1}{2}.}$$

This is a direct derivation, with independent eigenvalue calculations for the levels and 200 additional rational-input cases. “Helstrom value” may be used only as a label: no separate source on disk for that name was checked.

**4.6 [derived; numerically-checked: `check_cross_theory_claim`, levels C1–C3 in `check_levels`] A precise version of the cross-theory claim.** `IDEAS.md:112` has no specified coordinate identification for “the same pair”. The following valid version uses a common plane: the **unit diamond square** $K_4$ of §3.7, the **unit regular pentagon** $K_5$ with vertex $(1,0)$, and the **unit disc**. Take

$$\omega_1=(1,0),\qquad\omega_2=(-3/4,1/4),\qquad\pi_1=\pi_2=1/2.$$

Both points belong to all three spaces. The second point lies on the diamond edge $x-y=-1$, strictly inside the disc because its squared norm is $5/8$, and strictly inside the pentagon: all five $c_5-m_j\cdot\omega_2$ are positive, as checked directly at 60 digits. The first point is a vertex of both polygons.

In the square, $e=(1+x-y)/2$ is an extreme effect and gives $e(\omega_1)=1,e(\omega_2)=0$, hence $P_{\rm opt}=1$. In the pentagon put $c=c_5=(1+\sqrt5)/4$. The best extreme effect is $e=(c+x)/(1+c)$ and the finite vertex maximum gives

$$P_{\rm opt}^{K_5}=\frac12+\frac7{8(1+c)}=\frac{55-7\sqrt5}{40}<1.$$

Strictness also follows without optimisation: a nonconstant affine effect cannot take its minimum zero at an interior state. Indeed, a small perturbation in the negative gradient direction would make it negative. In the disc,

$$\|\omega_1-\omega_2\|_2=\frac{5\sqrt2}{4},\qquad P_{\rm opt}^D=\frac{8+5\sqrt2}{16}<1.$$

For an analytic check of the pentagon maximum, the objective direction is $(7/4,-1/4)$; among the ten nontrivial effect directions $\pm v_k$, its largest scalar product is $7/4$ at $v_0=(1,0)$. The closest competitor in the lower half-plane is $-v_2=(c,-\sin(\pi/5))$, giving $(7c+\sin(\pi/5))/4<7/4$; the other directions have still smaller scalar products. The checker evaluates the whole finite list and an independent LP, so no direction is omitted.

To represent this same square level in the first-release square, use $r=(x+y,x-y)$. The two square states then become $(1,1)$ and $(-1/2,-1)$ and the effect becomes $(1+r_y)/2$. This transformation applies to the square's chart; it does not preserve Euclidean lengths in the other theories.

**4.7 [derived] Why the comparison needs that qualification.** With the **axis-aligned first-release square** $[-1,1]^2$ and **unit disc** in the same coordinates, no common pair with positive priors can be perfect in the square and imperfect in the disc. A square extreme maximiser must be an axis effect for a perfect score, so one coordinate of the two states is $+1$ and $-1$. Disc membership forces their other coordinate to be zero. They are antipodal unit points, perfectly distinguished in the disc by the same effect. Thus the informal claim is true for the explicitly chosen diamond comparison, but it is not invariant under unspecified choices of scale and coordinates.

## 5. Concrete game levels

**5.1 [derived; numerically-checked: `level_specs_primary`, `check_levels`] First-release levels.** Classical states and effects use probability coordinates; square and ball effects are $(b,a)$. Each row states exact data. All priors below sum to one.

| ID | Theory | $\omega_1$ | $\omega_2$ | $(\pi_1,\pi_2)$ | Exact $P_{\rm opt}$ | One optimal extreme effect |
|---|---|---|---|---|---|---|
| B1 | classical bit | $(1,0)$ | $(0,1)$ | $(1/2,1/2)$ | $1$ | $(1,0)$ |
| B2 | classical bit | $(3/4,1/4)$ | $(1/4,3/4)$ | $(1/2,1/2)$ | $3/4$ | $(1,0)$ |
| S1 | square bit | $(1,0)$ | $(-1,0)$ | $(1/2,1/2)$ | $1$ | $(1/2,1/2,0)$ |
| S2 | square bit | $(1,1)$ | $(-1,-1)$ | $(1/2,1/2)$ | $1$ | $(1/2,1/2,0)$ |
| Q1 | qubit ball | $(1,0,0)$ | $(0,1,0)$ | $(1/2,1/2)$ | $(2+\sqrt2)/4$ | $(1/2,\sqrt2/4,-\sqrt2/4,0)$ |
| Q2 | qubit ball | $(0,0,1/4)$ | $(0,0,-1/4)$ | $(9/10,1/10)$ | $9/10$ | $u=(1,0,0,0)$ |

B2 follows from endpoint values $3/4,1/4$. S2 has exactly two optimal extreme effects: the displayed $X_+$ and $Y_+=(1/2,0,1/2)$; both give one and zero on the two states. Their convex combinations also win. In Q1, $\delta=0$ and $L=\sqrt2/2$. In Q2, $\delta=4/5$ and $L=1/4$, so the constant measurement is optimal even though the states differ. This is the requested input-independent guess: always choose state 1, not a random equal-probability guess.

**5.2 [derived; numerically-checked: `level_specs_extra`, `check_levels`] Extra levels covering triangle, pentagon, hexagon and disc.** Let

$$c=\frac{1+\sqrt5}{4},\quad s=\frac{\sqrt{10-2\sqrt5}}4,\quad h=\frac{\sqrt5-1}{4},\quad j=\frac{\sqrt{10+2\sqrt5}}4.$$

These are respectively $\cos(\pi/5),\sin(\pi/5),\cos(2\pi/5),\sin(2\pi/5)$ as obtained from the explicit polygon coordinates and checked by SymPy evaluation. All extra priors are $(1/2,1/2)$.

| ID | Theory | $\omega_1$ | $\omega_2$ | Exact $P_{\rm opt}$ | One optimal extreme effect |
|---|---|---|---|---|---|
| T1 | triangle / classical trit | $(1,0,0)$ | $(0,1,0)$ | $1$ | $(1,0,0)$ |
| P1 | unit pentagon | $(1,0)$ | $(h,j)$ | $c$ | $(1/(1+c),c/(1+c),-s/(1+c))$ |
| H1 | unit hexagon | $(1,0)$ | $(-1/2,\sqrt3/2)$ | $1$ | $(1/2,1/2,-\sqrt3/6)$ |
| D1 | disc | $(1,0)$ | $(0,1)$ | $(2+\sqrt2)/4$ | $(1/2,\sqrt2/4,-\sqrt2/4)$ |
| C1 | unit diamond square | $(1,0)$ | $(-3/4,1/4)$ | $1$ | $(1/2,1/2,-1/2)$ |
| C2 | unit pentagon | $(1,0)$ | $(-3/4,1/4)$ | $(55-7\sqrt5)/40$ | $(c/(1+c),1/(1+c),0)$ |
| C3 | disc | $(1,0)$ | $(-3/4,1/4)$ | $(8+5\sqrt2)/16$ | $(1/2,7\sqrt2/20,-\sqrt2/20)$ |

T1 also ties with the distinct extreme effect $(1,0,1)$. In P1 the adjacent pure states are not perfectly distinguishable: their exact optimum is $c<1$. H1 supplies a contrasting non-antipodal perfect pair; its effect evaluates to one and zero directly. C1–C3 implement §4.6. Every row is checked for state membership, effect membership and extremality, attainment of its stated score, and optimality over the complete effect list or ball formula. Polygon/simplex optima are independently compared with SciPy LPs on the state-vertex inequalities; disc/ball optima are compared with the reduced $(b,\|a\|)$ LP and direct $2\times2$ eigenvalue calculations.

## 6. Hazards for the chapter author

**6.1 [derived, from §§1.8,1.12–1.13] “Effects are the dual of states.”** The dual of the state cone $A(K)^{*+}$ is the positive function cone $A(K)^+$ under the pairing of §1.13; effects are the order interval $[0,u]$ in that function cone. A general dual vector can give negative values or values above one. Operationally using every function in that interval additionally requires no restriction on effects. In a restricted theory, the full-$E(K)$ optimum is an upper bound, not automatically an attainable score.

**6.2 [derived; numerically-checked: Q1, D1 in `check_levels`] “Distinct pure states are perfectly distinguishable.”** False. The two unit coordinate directions of Q1 and D1 are pure and have $P_{\rm opt}=(2+\sqrt2)/4<1$. For positive priors the correct criterion is existence of an allowed effect taking values one and zero (§4.1). In a unit ball with equal priors perfection requires distance two; since $\|r_1-r_2\|^2=\|r_1\|^2+\|r_2\|^2-2r_1\cdot r_2\leq4$, equality requires unit norms and scalar product $-1$, hence antipodal states. This ball statement must not be transferred to polygons; H1 is a counterexample.

**6.3 [derived, from §§1.7–1.10] Reversing the two cones.** $A(K)^+$ is the cone of positive affine functions. $A(K)^{*+}$ is the cone of unnormalised states. In the demo's height-one view, $K$ sits in the latter. The notation “$K$ at height one, its cone $A^+$” in `IDEAS.md:104` needs this correction.

**6.4 [derived; numerically-checked: `check_polygon_duality`] “Odd polygons are self-dual.”** Add the inner product and normalisation. Unit-radius odd polygons are not self-dual in our standard inner product. The radius $\sqrt{\sec(\pi/n)}$ makes the odd models self-dual. Even polygons retain the angular offset. A cone isomorphism is a different assertion from literal equality with its Euclidean dual.

**6.5 [derived; numerically-checked: S2 in `check_levels`] “The optimum sits on an extreme point.”** Say “an extreme point attains the optimum”. S2 has a whole optimal segment, including nonextreme effects. If the two states and priors are equal, $P\equiv1/2$ on all effects.

**6.6 [derived, from §§1.9–1.10,3.2–3.4] “Effects are linear functions on the plotted state coordinates.”** They are affine there. They become linear on homogeneous state vectors $(1,r)$ through $(b,a)\cdot(1,r)$. Forgetting the constant coefficient discards the unit effect and invalidates biased-prior optimisation. In probability coordinates the constant is encoded by $\sum_i p_i=1$.

**6.7 [derived, from §1.11; source gap] “A measurement is one element of the dual space.”** An individual outcome effect is a scalar functional; the finite measurement is a collection summing to $u$. The permitted source files do not supply a general instruments definition. Do not use the brief's dual-language shorthand as a checked classification of instruments or dynamics.

**6.8 [derived, from §4.1] “Score one proves the pair is distinguishable.”** Require both priors positive. At $\pi_1=1$, $e=u$ scores one for every pair, including identical states. Likewise an “orthogonal-looking” drawing has no invariant operational meaning without specified coordinates and allowed effects (§§4.6–4.7).

**6.9 [source-quoted; derived; numerically-checked: `check_hazard_counterexamples`] Pointwise maxima need not be effects, even classically.**

> `basic_v3.tex:124` — ``In some cases, for example if $f \geq g$ or in the case of the classical theory presented in Section \ref{sec:CT}, $h_M$ is an affine function.``

The unqualified classical part of this sentence is false for its pointwise $h_M(x)=\max(f(x),g(x))$. On the bit choose $f(p)=p_0$ and $g(p)=p_1$. The maximum is one at both pure states but $1/2$ at their midpoint, whereas an affine interpolation would give one. The correct classical lattice maximum is obtained by taking the maximum of the endpoint coefficients and then extending affinely; here that produces $u$, not the pointwise maximum. Endpointwise order is equivalent to pointwise order because all state values are convex combinations of endpoint values, so this coefficient maximum is the least upper bound in the affine-effect order. If $f\geq g$ pointwise, the pointwise maximum is indeed $f$. This source wording is flagged rather than silently reused.

**6.10 [derived, from §§1.10,1.15,1.17] Zero and sign exceptions in elementary proofs.** A base point is unique only on a nonzero cone ray. Normalising a positive functional by $\psi(u)$ needs $\psi\ne0$; normalising a positive function by $\max_K f$ needs $f\ne0$. For an order-unit upper bound whose scalar must be nonnegative, choose $\max(0,\max_K g)$ or $\max_K|g|$. These corrections address the zero divisions in `basic_v3.tex:84,374`, the zero uniqueness wording in `basic_v3.tex:376`, and the possible sign issue in `basic_v3.tex:148`.

## 7. Chapter claim register, gaps and unchecked work

**7.1 [derived] Exhaustive licence for the chapter's mathematical claims.** The following register includes definitions, hypotheses, general conclusions and worked-model claims. Proof details are in the cited numbered results; computational labels license the specified finite checks, not unproved extrapolation. No additional physical universality claim follows from this document.

| Claim the chapter may make | Type | Support |
|---|---|---|
| The adopted $K$ is compact and convex in a real finite-dimensional space | source-quoted | §1.1; `basic_v3.tex:4` |
| Convex combinations represent mixtures, with weights in $[0,1]$ | source-quoted | §1.2; `basic_v3.tex:13` |
| Pure states mean extreme points | source-quoted | §1.3; `basic_v3.tex:9` |
| $E(K)$ consists of affine $[0,1]$-valued functions | source-quoted | §1.4; `basic_v3.tex:57` |
| $1_K$ is the constant-one effect | source-quoted | §1.5; `basic_v3.tex:70` |
| $A(K)$ and $A(K)^+$ have the displayed definitions | source-quoted | §§1.6–1.7; `basic_v3.tex:78–79` |
| $A(K)^*$ consists of linear functionals on $A(K)$ | source-quoted | §1.8a; `basic_v3.tex:154` |
| $A(K)^{*+}$ consists of functionals positive on $A(K)^+$ | source-quoted | §1.8b; `basic_v3.tex:158` |
| Evaluation embeds states in the positive dual cone | derived | §1.9, with the evaluation formula quoted at `basic_v3.tex:174` |
| Normalised positive dual functionals recover $K$, up to the evaluation isomorphism | source-quoted | §1.10; `basic_v3.tex:181` |
| Every nonzero positive dual functional has a unique normalised base point | derived | §1.10 |
| Every effect has the complement $1_K-f$ | source-quoted | §1.11; `basic_v3.tex:133` |
| Finite normalised affine outcome lists give finite measurement probabilities, with availability stipulated | derived | §1.11 |
| Full operational effect availability is the no-restriction hypothesis | source-quoted | §1.12; `basic_v3.tex:531` and its following naming sentence |
| $E(K)$ is the order interval $[0,1_K]$ | source-quoted | §1.13; `basic_v3.tex:118` |
| The dual of the state cone is the positive function cone under evaluation pairing | derived | §1.13 |
| The order unit has the displayed domination property and $1_K$ is one | source-quoted | §§1.14–1.15; `basic_v3.tex:141,145` |
| Both positive cones are convex, closed, pointed and generating in this framework | source-quoted | §§1.16,1.18; `basic_v3.tex:92,162` |
| $E(K)$ spans $A(K)$ and generates $A(K)^+$ | source-quoted | §1.17; `basic_v3.tex:81` |
| $E(K)$ is a finite-dimensional compact convex set | derived | §1.19 |
| Availability of mixed preparations and probability consistency require affinity | derived | §2; source sentences at `basic_v3.tex:15,55` and formula at `basic_v3.tex:63` |
| Vertex bounds suffice for a polytope; full-rank active bounds characterise its effect vertices | derived | §3.1 |
| The bit has the stated probability simplex and four cube effects; its probability-coordinate cone is self-dual | derived | §3.2 |
| The bit and square vertex lists agree with exhaustive rational enumeration | numerically-checked | `check_primary_geometry`, `check_exact_polytope` |
| The square has the stated six effects and unequal state/dual cones | derived | §3.3; source effect hull at `boxworld_v3.tex:91` |
| $2\times2$ density matrices give the Bloch ball, the displayed effect set and trace pairing | derived | §3.4; source density definition at `QT_v3.tex:11` |
| The Pauli products, characteristic determinants, projector identity and trace pairing hold symbolically | numerically-checked | `check_qubit_matrix_algebra` |
| Ball pure states form the sphere; extreme effects are $0,u$ and the equator; the state cone is self-dual | derived | §3.5 |
| The extra trit has the displayed simplex, cube effects and orthant cone | derived | §3.6; source triangle description at `CT_v3.tex:112` |
| The trit's eight effects agree with exhaustive rational enumeration | numerically-checked | `check_extra_geometry` |
| The explicitly normalised regular polygons have the displayed odd/even effect formulas | derived | §3.7 |
| The polygon vertices, effect counts and feasibility agree for $n=3,\ldots,8$ | numerically-checked | `check_extra_geometry`, `numerical_effect_vertices` |
| Polygon cone dual rays have the displayed radius and angle, with the stated odd/even equality conditions | derived | §3.8 |
| Unit and rescaled polygon self-duality agree with the parity table for $n=3,\ldots,8$ | numerically-checked | `check_polygon_duality` |
| The disc has the stated extreme families and a standard self-dual cone | derived | §3.9 |
| Supplementary ball/disc cone and effect samples satisfy the derived bounds | numerically-checked | `check_ball_cones_and_extremes` |
| The two-outcome score is $\pi_1e(\omega_1)+\pi_2(1-e(\omega_2))$ | source-quoted | §4.1; `basic_v3.tex:508` after the stated notation change |
| Guessing baselines, score bounds and the positive-prior perfection criterion hold | derived | §4.1 |
| An extreme effect attains an affine maximum over $E(K)$ | derived | §4.2, using `basic_v3.tex:31` |
| Polytopes use a finite effect-vertex maximum; classical and square closed forms hold | derived | §4.3 |
| Disc/ball optimisation gives $(1+\max(|\delta|,\|v\|_2))/2$ with the listed optimal effects | derived | §4.4 |
| Direct qubit matrix algebra gives the displayed trace-norm formula | derived | §4.5 |
| Matrix and reduced-cone optimisation checks agree on the specified levels and supplementary cases | numerically-checked | `check_levels`, `check_weighted_ball_samples` |
| The specified diamond/pentagon/disc comparison pair has the three stated scores | derived | §4.6 |
| That pair belongs to all three sets, with strict pentagon/disc interior for its second state | numerically-checked | `check_cross_theory_claim`, `check_levels` |
| The same claim cannot hold for a common pair in the axis-aligned square and unit disc | derived | §4.7 |
| The 13 concrete levels have feasible optimal extreme effects and the stated scores, including ties and a constant guess | numerically-checked | §5; `check_levels` |
| The corrected duality, purity, cone, affinity, measurement and prior qualifications hold | derived | §§6.1–6.8 |
| Pointwise maxima can fail affinity even on a classical bit | derived | §6.9; source sentence audited at `basic_v3.tex:124` |
| The pointwise-maximum counterexample has the stated endpoint and midpoint values | numerically-checked | `check_hazard_counterexamples` |
| Zero normalisation and nonnegative order-unit coefficients require the stated exceptions | derived | §6.10 |

**7.2 Gaps for the author.**

- **Course stipulations:** keep `BRIEF.md:44–55`, items 0–4 and its P0–P5, as the author's framing: preparations/dynamics/measurement, probabilistic theories including deterministic ones, preparation/state and dual language, Archimedean order-unit language, and incremental specialisation. This derivation does not expand those stipulations into physical theorems.
- **Archimedean terminology:** “Archimedean order unit space” was not found in the permitted Plavala files. The source gives the finite-dimensional order-unit construction. A definition, supporting source, and the scope of the brief's universal assertion remain needed; this document supplies neither from memory.
- **Measurements and instruments:** obtain the actual general measurements definition if a Plavala wording is wanted. The finite-list probability argument is derived here; arbitrary multi-outcome availability is an explicit convention. Instruments and dynamics are not supplied by an effect-space definition.
- **Infinite-dimensional quantum claims:** the brief's positive-functional/norm-one and trace-class language cannot be grounded in this finite-dimensional source construction without additional evidence. The present matrix derivation covers the qubit only.
- **Polygon attribution:** the models here have explicitly chosen circumradii. Identification with the external “[JGBB]” models in the demo specification has not been checked and should not be asserted from this document.
- **Source wording needing correction:** do not reuse the classical pointwise-maximum claim in `basic_v3.tex:124`; retain the zero/sign qualifications in §6.10 when adapting the elementary source proofs.
- **Demo/game wording:** label the state cone $A(K)^{*+}$, say “some extreme optimum”, and specify the diamond coordinate comparison before claiming a square/pentagon/disc distinction.
- **Infinite extreme sets:** disc and ball entries use parametric families because literal finite vertex lists do not exist.

**7.3 What was NOT CHECKED.** The source's external references and arXiv version metadata were not independently retrieved; the task-designated TeX was used. No general survey of errors in Plavala's remaining propositions was performed. No infinite-dimensional theorem, tensor product, composite gbit, quantum dynamics, instrument, three-state discrimination game, or general multi-outcome implementation was checked. Polygon computations stop at $n=8$; the explicit formulas and parity statements beyond that are proved in §§3.7–3.8 but not numerically enumerated here. No Julia/JuMP/HiGHS reference comparison, in-browser LP, UI dragging, star thresholds, or graphics implementation was checked. No independent source for the “Helstrom” name was checked.

**7.4 [numerically-checked: `generate_all`, `check_source_quotes`] Reproduction.** Run

```bash
python3 evidence/derivations/c02/check_gpt.py --verify
```

It first rechecks the three first-release theories and six primary levels, then reconstructs the extras, all 13 level inputs and answers, polygon parity, source-quote loci, symbolic matrix identities, independent LPs, and supplementary cone/spectral cases. It regenerates canonical JSON in memory and requires byte-for-byte equality with `golden.json`; any failed identity, infeasible level, wrong optimum, bad quote, missing golden file, or stored-data difference gives a nonzero exit. `--write` performs the same derivations and checks and writes only the owned `golden.json`. No repository cache or extra output file is needed.

Observed verification: **PASS — 11 theory entries, 13 levels**, including all source quotes, rational/symbolic identities and independent LP checks. A separate negative check appended a byte to the stored golden file, confirmed that `--verify` exited nonzero for the difference, and restored the original bytes.
