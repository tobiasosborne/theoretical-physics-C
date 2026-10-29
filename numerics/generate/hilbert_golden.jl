# Writes the golden values of the kernel web/src/kernels/hilbert.ts (chapter c03, demos
# c03.demo.kreuz, c03.demo.partialsummen, c03.demo.komplex, c03.demo.partialintegrale,
# c03.demo.raeume, c03.demo.vollst, c03.demo.spektren):
#
#   julia --project=numerics numerics/generate/hilbert_golden.jl            # write web/tests/golden/hilbert.json
#   julia --project=numerics numerics/generate/hilbert_golden.jl --check    # exit 1 unless that file is reproduced
#   julia --project=numerics numerics/generate/hilbert_golden.jl --check --file PATH
#
# Standard library only. INDEPENDENT OF THE KERNEL, by construction:
# - complex arithmetic exactly, in Complex{Rational{BigInt}} (the kernel: doubles);
# - partial sums S_N(s) = sum_{j<=N} j^(-2s) by direct summation of every term in BigFloat
#   (the kernel: 64 terms plus an Euler-Maclaurin tail);
# - the limit sum_j j^(-2s) by Borwein's alternating-series algorithm for the eta function,
#   zeta(sigma) = eta(sigma)/(1 - 2^(1-sigma)) (P. Borwein, "An efficient algorithm for the Riemann
#   zeta function", CMS Conf. Proc. 27 (2000), Algorithm 2; error below 3/(3+sqrt 8)^n/|1-2^(1-sigma)|
#   for real sigma > 1 [bound as stated in that paper, UNVERIFIED here: the paper is not on disk];
#   cross-checked below against pi^2/6 and pi^4/90 and against the direct partial sums plus the
#   integral tail bound);
# - erf by its alternating Taylor series in BigFloat at 512 bits (the kernel: a series of positive
#   terms below 3 and a continued fraction for erfc above);
# - the closed forms of the bounds and of int (1+|x|)^(-2s) in BigFloat (the kernel: expm1/log1p);
# - cos, sin and exp in BigFloat;
# - the completeness cases (c03.demo.vollst): for the real plane the coefficients by the ANGLE
#   DIFFERENCE formulas c_0 = cos(alpha - theta), c_1 = sin(theta - alpha) in BigFloat (the kernel
#   forms the inner products of the columns), and exact Rational arithmetic for a complex basis;
# - the operator classes and eigenvalues (c03.demo.spektren): the matrices typed again from
#   c03.eq.abc and the definitions of the families, in Complex{Rational{BigInt}} at the exact binary
#   value of the parameter; the class residuals exactly (the kernel: doubles); the eigenvalues by
#   CLOSED FORMS derived by hand for each family (the kernel: shifted QR on the matrix), and for
#   close eigenvalues Newton roots of the exact characteristic polynomial at 512 bits; checked in selfcheck() against the exact characteristic polynomial
#   (Leibniz determinant in BigFloat) and against LAPACK (LinearAlgebra.eigvals, a standard
#   library); the extreme values of <psi|H psi> for Hermitian H as the smallest and largest root of
#   the exact characteristic polynomial, by Viete's trigonometric formula for a cubic with real
#   roots (the kernel: Jacobi rotations), also checked against LAPACK.
# Values are written as the nearest double in shortest round-trip form.
#
# TOLERANCES (stated in the file, per class): each is an UNVALIDATED CHOICE placed above the
# largest deviation measured when the kernel was written (web/tests/kernels/hilbert.test.ts prints
# the measured maxima) and far below anything the demos display (at most 4 decimals).
module HilbertGolden
using Printf
using LinearAlgebra: eigvals, Hermitian   # selfcheck only: LAPACK as a cross-check of the closed forms

const DEFAULT_FILE = normpath(joinpath(@__DIR__, "..", "..", "web", "tests", "golden", "hilbert.json"))

num(x::Real) = (y = Float64(x); isfinite(y) || error("non-finite value"); y == 0 ? "0" : repr(y))
numinf(x::Real) = isinf(x) ? "\"Infinity\"" : num(x)
cnum(z) = "[" * num(real(z)) * ", " * num(imag(z)) * "]"
arr(v) = "[" * join((x isa AbstractVector ? arr(x) : x isa Complex ? cnum(x) : num(x) for x in v), ", ") * "]"

const Q = Complex{Rational{BigInt}}
q(re, im) = Q(Rational{BigInt}(re), Rational{BigInt}(im))
qc(p) = q(rationalize(BigInt, p[1]), rationalize(BigInt, p[2]))

# ── exact complex arithmetic ──────────────────────────────────────────────────────────────
dag(v) = conj.(v)
terms(v, w) = [conj(v[j]) * w[j] for j in eachindex(v)]
plain(v, w) = [v[j] * w[j] for j in eachindex(v)]
running(t) = cumsum(t)

# vectors as lists of [re, im]; the chapter's examples first, then a few others (half-integers,
# so that the double-precision kernel is exact as well)
const VECTORS = [
    ("c03.eq.vw", [[1, 1], [1, -1]], [[1, 0], [-1, 0]]),                 # v = (1+i, 1-i), w = (1, -1): v^dag w = -2i
    ("c03.eq.wv", [[1, 0], [-1, 0]], [[1, 1], [1, -1]]),                 # w^dag v = 2i
    ("c03.ex.ohne-stern", [[1, 0], [0, 1]], [[1, 0], [0, 1]]),           # v = (1, i): v^dag v = 2, v^T v = 0
    ("c03.exc.rechnen vw", [[0, 1], [2, 0]], [[1, 0], [0, 1]]),          # v = (i, 2), w = (1, i): i
    ("c03.exc.rechnen wv", [[1, 0], [0, 1]], [[0, 1], [2, 0]]),          # -i
    ("c03.exc.rechnen vv", [[0, 1], [2, 0]], [[0, 1], [2, 0]]),          # 5
    ("c03.fig.kreuz (a) with w = (1,-1)", [[2, 1], [-1, 2]], [[1, 0], [-1, 0]]),
    ("half-integers", [[0.5, -2.5], [-3, 1.5]], [[-1.5, 0.5], [2.5, 3]]),
    ("three entries", [[1.5, 0], [0, -0.5], [-2, 2]], [[1, 1], [-0.5, 3], [2.5, -1]]),
]

# ── l^2: partial sums by direct summation ─────────────────────────────────────────────────
const S_VALUES = [0.0, 0.25, 0.5, 0.6, 0.75, 1.0, 1.25, 1.5]
const N_VALUES = [1, 2, 3, 5, 10, 25, 63, 64, 65, 100, 1000, 12345, 1_000_000]
function direct_partial_sums(s, Ns)
    setprecision(BigFloat, 128) do
        sigma = 2 * BigFloat(s)
        out = BigFloat[]
        acc = big(0.0)
        k = 1
        for j in 1:maximum(Ns)
            acc += exp(-sigma * log(BigFloat(j)))
            while k <= length(Ns) && Ns[k] == j
                push!(out, acc); k += 1
            end
        end
        out
    end
end

# Borwein, Algorithm 2: d_k = n sum_{i=0}^{k} (n+i-1)! 4^i / ((n-i)! (2i)!)
function zeta_borwein(sigma::BigFloat; n = 140)
    d = Vector{Rational{BigInt}}(undef, n + 1)
    acc = Rational{BigInt}(0)
    for i in 0:n
        acc += Rational{BigInt}(factorial(big(n + i - 1)) * big(4)^i, factorial(big(n - i)) * factorial(big(2i)))
        d[i + 1] = n * acc
    end
    dn = BigFloat(d[n + 1])
    s = big(0.0)
    for k in 0:n-1
        s += (-1)^k * (BigFloat(d[k + 1]) - dn) / BigFloat(k + 1)^sigma
    end
    -s / (dn * (1 - BigFloat(2)^(1 - sigma)))
end
zeta_ref(s) = setprecision(() -> zeta_borwein(2 * BigFloat(s)), BigFloat, 512)

ref_upper(s, N) = setprecision(BigFloat, 256) do
    a = 1 - 2 * BigFloat(s)
    a == 0 ? 1 + log(BigFloat(N)) : 1 + (BigFloat(N)^a - 1) / a
end
ref_lower(s, N) = setprecision(BigFloat, 256) do
    a = 1 - 2 * BigFloat(s)
    a == 0 ? log(BigFloat(N + 1)) : (BigFloat(N + 1)^a - 1) / a
end
ref_upper_limit(s) = 2s > 1 ? setprecision(() -> 2 * BigFloat(s) / (2 * BigFloat(s) - 1), BigFloat, 256) : Inf

# ── L^2 ───────────────────────────────────────────────────────────────────────────────────
function erf_taylor(x::Real)
    setprecision(BigFloat, 512) do
        X = BigFloat(x)
        term = X; s = X; n = 0
        while true
            n += 1
            term *= -X^2 / n                       # (-1)^n x^(2n+1)/n!
            t = term / (2n + 1)
            s += t
            abs(t) < big"1e-80" && n > 2 && break
        end
        2 / sqrt(BigFloat(pi)) * s
    end
end
gauss_partial(X) = setprecision(() -> sqrt(BigFloat(pi)) * erf_taylor(X), BigFloat, 512)
gauss_cumulative(x) = setprecision(() -> sqrt(BigFloat(pi)) / 2 * (1 + erf_taylor(x)), BigFloat, 512)
power_partial(s, X) = setprecision(BigFloat, 256) do
    a = 1 - 2 * BigFloat(s)
    L = 1 + BigFloat(X)
    a == 0 ? 2 * log(L) : 2 * (L^a - 1) / a
end
power_limit(s) = 2s > 1 ? setprecision(() -> 2 / (2 * BigFloat(s) - 1), BigFloat, 256) : Inf

const ERF_X = [0.0, 1e-8, 0.1, 0.5, 1.0, 1.5, 2.0, 2.5, 2.9, 2.999, 3.0, 3.001, 3.5, 4.0, 4.3, 5.0, 6.0]
const CUM_X = [-6.0, -4.0, -3.0, -2.6, -1.0, -0.25, 0.0, 0.5, 1.3, 2.6, 4.0]
const POWER_S = [0.0, 0.25, 0.5, 0.75, 1.0, 1.5]
const POWER_X = [0.0, 0.1, 1.0, 2.6, 4.3, 1000.0, 1e6]

modulus(kind, x) = setprecision(BigFloat, 256) do
    X = BigFloat(x)
    kind == "gauss" ? exp(-X^2 / 2) : kind == "power" ? 1 / sqrt(1 + abs(X)) : big(1.0)
end
phased(kind, k, x) = setprecision(BigFloat, 256) do
    m = modulus(kind, x); a = BigFloat(k) * BigFloat(x)
    Complex(m * cos(a), m * sin(a))
end
const PHASE_X = [-3.0, -2.25, -1.0, -0.1, 0.0, 0.7, 1.0, 2.0, 3.0]

# ── completeness: one unit vector in a rotated basis ──────────────────────────────────────
const VOLL_ALPHA_THETA = [
    (atan(0.5), pi / 4),                # the figure: Psi = (2, 1)/sqrt 5 in e_0, e_1 and e_+-
    (atan(0.5), 0.0), (0.0, 0.0), (0.0, 1.0), (1.0, atan(0.5)), (2.5, -0.7),
    (4.0, 3.0), (-1.2, 0.3), (6.0, 6.0), (pi / 2, pi / 4),
]
function vollst_ref(alpha, theta)
    setprecision(BigFloat, 256) do
        a = BigFloat(alpha); t = BigFloat(theta)
        psi = [Complex(cos(a), big(0.0)), Complex(sin(a), big(0.0))]
        basis = [[Complex(cos(t), big(0.0)), Complex(sin(t), big(0.0))],
                 [Complex(sin(t), big(0.0)), Complex(-cos(t), big(0.0))]]
        c = [Complex(cos(a - t), big(0.0)), Complex(sin(t - a), big(0.0))]
        parts = [[c[j] * basis[j][k] for k in 1:2] for j in 1:2]
        (psi = psi, basis = basis, c = c, w = [abs2(x) for x in c], parts = parts)
    end
end
# complex orthonormal basis with rational entries: phi_0 = (3/5, 4i/5), phi_1 = (4i/5, 3/5)
const CBASIS = [[[0.6, 0.0], [0.0, 0.8]], [[0.0, 0.8], [0.6, 0.0]]]
const CPSIS = [[[1.0, 0.0], [0.0, 0.0]], [[0.5, 0.5], [0.5, -0.5]], [[0.0, 0.6], [-0.8, 0.0]], [[0.25, -0.5], [1.5, 2.0]]]
exact_expansion(basis, psi) = [sum(conj(qc(phi[k])) * qc(psi[k]) for k in 1:length(psi)) for phi in basis]


# ── operator classes and their eigenvalues (c03.demo.spektren) ─────────────────────────────
# The families of the demo, typed from c03.eq.abc: A + s 1, s B, r C on C^3, and
# M(t) = |0><1| + t |1><0|, Q(t) = |0><0| + t |0><1| on C^2. Entries exact, at the exact binary value
# of the parameter (the double the kernel receives).
const QC = Complex{Rational{BigInt}}
exactq(x::Float64) = Rational{BigInt}(x)
function spek_matrix(key, p)
    P = exactq(p); z(a, b = 0) = QC(a, b)
    key == "A" && return QC[z(P) z(1) z(0); z(1) z(P) z(1); z(0) z(1) z(P)]
    key == "B" && return fill(z(P / 3), 3, 3)
    key == "C" && return QC[z(0) z(P) z(0); z(0) z(0) z(0, P); z(-P) z(0) z(0)]
    key == "M" && return QC[z(0) z(1); z(P) z(0)]
    key == "Q" && return QC[z(1) z(P); z(0) z(0)]
    error("unknown family $key")
end
madj(a) = permutedims(conj.(a))
mmul(a, b) = [sum(a[j, l] * b[l, k] for l in 1:size(a, 2)) for j in 1:size(a, 1), k in 1:size(b, 2)]
meye(n) = [j == k ? QC(1) : QC(0) for j in 1:n, k in 1:n]
bigabs(z) = sqrt(BigFloat(real(z))^2 + BigFloat(imag(z))^2)
maxabs(a) = maximum(bigabs.(a))

# eigenvalues by closed forms (derived by hand; selfcheck tests them):
#   A + s 1: s - sqrt 2, s, s + sqrt 2 (c03.eq.spektren shifted by s)
#   s B: 0, 0, s (B has rank one and trace 1)
#   r C: r e^(-i pi/6), r i, r e^(7 i pi/6) (r^3 times the roots of lambda^3 = -i)
#   M(t): +-sqrt t for t >= 0, +-i sqrt(-t) for t < 0 (lambda^2 = t)
#   Q(t): 0, 1 (upper triangular)
function spek_eigs(key, p)
    setprecision(BigFloat, 256) do
        P = BigFloat(exactq(p)); r2 = sqrt(BigFloat(2))
        c(x, y = big(0.0)) = Complex{BigFloat}(x, y)
        e(t) = c(cos(t), sin(t))
        v = key == "A" ? [c(P - r2), c(P), c(P + r2)] :
            key == "B" ? [c(0), c(0), c(P)] :
            key == "C" ? [P * e(-BigFloat(pi) / 6), P * c(0, 1), P * e(7 * BigFloat(pi) / 6)] :
            key == "M" ? (P >= 0 ? [c(-sqrt(P)), c(sqrt(P))] : [c(0, -sqrt(-P)), c(0, sqrt(-P))]) :
            key == "Q" ? [c(0), c(1)] : error("unknown family $key")
        sortc(v)
    end
end
# the kernel's order: by real part (ties within 1e-9), then by imaginary part
sortc(v) = sort(v, lt = (a, b) -> abs(real(a) - real(b)) > 1e-9 ? real(a) < real(b) : imag(a) < imag(b))

# det(lambda 1 - A) by the Leibniz formula, in Complex{BigFloat}
function leibniz_charpoly_at(a, lam)
    n = size(a, 1)
    m = [Complex{BigFloat}(j == k ? lam : 0) - Complex{BigFloat}(BigFloat(real(a[j, k])), BigFloat(imag(a[j, k]))) for j in 1:n, k in 1:n]
    perms(v) = length(v) <= 1 ? [v] : [[x; q] for x in v for q in perms(filter(!=(x), v))]
    sgnp(q) = (-1)^sum(count(j -> q[j] < q[i], i+1:length(q)) for i in 1:length(q))
    sum(sgnp(q) * prod(m[i, q[i]] for i in 1:n) for q in perms(collect(1:n)))
end

# eigenvalues of a Hermitian matrix with exact entries: the exact characteristic polynomial
# (real rational coefficients), roots by the quadratic formula (n = 2) or by Viete's
# trigonometric formula for a cubic with three real roots (n = 3), in BigFloat; sorted ascending
function herm_eigs(h)
    n = size(h, 1)
    tr = sum(h[j, j] for j in 1:n)
    minor(i, j) = h[i, i] * h[j, j] - h[i, j] * h[j, i]
    setprecision(BigFloat, 256) do
        if n == 2
            T = real(tr); D = minor(1, 2)
            imag(tr) == 0 && imag(D) == 0 || error("Hermitian char poly not real")
            disc = BigFloat(T^2 - 4 * real(D))
            disc >= 0 || error("Hermitian 2x2 with complex roots")
            return sort([(BigFloat(T) - sqrt(disc)) / 2, (BigFloat(T) + sqrt(disc)) / 2])
        end
        n == 3 || error("only n = 2, 3")
        M = minor(1, 2) + minor(1, 3) + minor(2, 3)
        det = h[1,1] * (h[2,2] * h[3,3] - h[2,3] * h[3,2]) - h[1,2] * (h[2,1] * h[3,3] - h[2,3] * h[3,1]) + h[1,3] * (h[2,1] * h[3,2] - h[2,2] * h[3,1])
        all(imag(x) == 0 for x in (tr, M, det)) || error("Hermitian char poly not real")
        # lambda^3 + a lambda^2 + b lambda + c with a = -tr, b = M, c = -det; lambda = t - a/3
        a = -real(tr); b = real(M); cc = -real(det)
        p = b - a^2 / 3; q = 2 * a^3 / 27 - a * b / 3 + cc
        shift = -BigFloat(a) / 3
        if p == 0
            q == 0 || error("Hermitian cubic with p = 0 and q != 0")
            return [shift, shift, shift]
        end
        p < 0 || error("Hermitian cubic with p > 0")
        m = 2 * sqrt(-BigFloat(p) / 3)
        # arg = (3q/(2p)) sqrt(-3/p); its square -27 q^2/(4 p^3) is rational, so a double root
        # (arg = +-1) is found exactly and acos does not lose half the digits near +-1
        a2 = -27 * q^2 / (4 * p^3)
        a2 <= 1 || error("Hermitian cubic with complex roots")
        arg = sign(q) * sign(p) * sqrt(BigFloat(a2))
        th = acos(arg) / 3
        # values below the working precision are zero (B: the double eigenvalue 0)
        sort([(x = shift + m * cos(th - 2 * BigFloat(pi) * k / 3); abs(x) < big"1e-60" ? zero(x) : x) for k in 0:2])
    end
end
herm_part(a) = (a + madj(a)) / 2
antiherm_part(a) = (a - madj(a)) / QC(0, 2)

const SPEK_PARAMS = [
    ("A", [-0.3, 0.0, 0.5, 1.41, 1.42, 1.7]),
    ("B", [-0.5, -0.1, 0.0, 0.5, 1.0, 1.5]),
    ("C", [0.0, 0.25, 0.5, 1.0, 1.37, 2.0]),
    ("M", [-1.0, -0.5, -0.01, 0.0, 0.25, 0.5, 1.0]),
    ("Q", [0.0, 0.01, 0.5, 1.0, 2.0]),
]
const LOCUS_EPS = big"1e-40"
function on_locus(cls, z)
    cls == "herm" && return abs(imag(z)) <= LOCUS_EPS
    cls == "pos" && return abs(imag(z)) <= LOCUS_EPS && real(z) >= -LOCUS_EPS
    cls == "proj" && return abs(z) <= LOCUS_EPS || abs(z - 1) <= LOCUS_EPS
    cls == "unit" && return abs(abs(z) - 1) <= LOCUS_EPS
    true
end
const CLASSES = ["herm", "pos", "proj", "unit", "normal"]
function spek_ref(key, p)
    a = spek_matrix(key, p); n = size(a, 1); d = madj(a); one = meye(n)
    res = setprecision(BigFloat, 256) do
        [maxabs(d - a), maxabs(mmul(a, a) - a), maxabs(mmul(d, a) - one), maxabs(mmul(a, d) - one), maxabs(mmul(d, a) - mmul(a, d))]
    end
    herm = d == a
    re = herm_eigs(herm_part(a)); im = herm_eigs(antiherm_part(a))
    member = Dict(
        "herm" => herm,
        "pos" => herm && re[1] >= -LOCUS_EPS,
        "proj" => herm && mmul(a, a) == a,
        "unit" => mmul(d, a) == one && mmul(a, d) == one,
        "normal" => mmul(d, a) == mmul(a, d),
    )
    ev = spek_eigs(key, p)
    loci = [all(on_locus(c, z) for z in ev) for c in CLASSES]
    (a = a, res = res, member = [member[c] for c in CLASSES], loci = loci, ev = ev, minre = re[1], maxim = max(abs(im[1]), abs(im[end])))
end
# Hermitian matrices with eigenvalues known by construction: [[2, 1-i], [1+i, 3]] has 1 and 4;
# [[1, i, 0], [-i, 1, 0], [0, 0, -1/2]] has 0, 2 and -1/2; B (1, 0, 0); sigma_x (-1, 1)
const HERM_CASES = [
    ("2x2 with eigenvalues 1, 4", [[[2, 0], [1, -1]], [[1, 1], [3, 0]]], [1, 4]),
    ("3x3 with eigenvalues -1/2, 0, 2", [[[1, 0], [0, 1], [0, 0]], [[0, -1], [1, 0], [0, 0]], [[0, 0], [0, 0], [-0.5, 0]]], [-0.5, 2]),
    ("sigma_x", [[[0, 0], [1, 0]], [[1, 0], [0, 0]]], [-1, 1]),
]
qmat(rows) = [qc(rows[j][k]) for j in eachindex(rows), k in eachindex(rows[1])]

# Close but distinct eigenvalues (the kernel: shifted QR on the matrix). The reference: the
# characteristic polynomial of the EXACT rational value of the double matrix the kernel receives
# (trace, principal minors, determinant in Complex{Rational{BigInt}}), its roots by Newton steps in
# BigFloat at 512 bits from the intended values. With exact coefficients and 512 bits, roots 1e-6
# apart are resolved to far below double precision. selfcheck() compares with LAPACK.
function exact_charpoly(a)     # monic, low to high
    n = size(a, 1)
    tr = sum(a[j, j] for j in 1:n)
    minor(i, j) = a[i, i] * a[j, j] - a[i, j] * a[j, i]
    n == 2 && return [minor(1, 2), -tr, QC(1)]
    det = a[1,1] * (a[2,2] * a[3,3] - a[2,3] * a[3,2]) - a[1,2] * (a[2,1] * a[3,3] - a[2,3] * a[3,1]) + a[1,3] * (a[2,1] * a[3,2] - a[2,2] * a[3,1])
    [-det, minor(1, 2) + minor(1, 3) + minor(2, 3), -tr, QC(1)]
end
function newton_roots(a, starts)
    setprecision(BigFloat, 512) do
        c = [Complex{BigFloat}(BigFloat(real(x)), BigFloat(imag(x))) for x in exact_charpoly(a)]
        dc = [k * c[k + 1] for k in 1:length(c)-1]
        ev(q, z) = foldr((x, acc) -> acc * z + x, q; init = zero(z))
        map(starts) do z0
            z = Complex{BigFloat}(z0)
            for _ in 1:200
                step = ev(c, z) / ev(dc, z)
                z -= step
                abs(step) < big"1e-140" && break
            end
            z
        end
    end
end
# the double matrix (nearest doubles to an exact construction), as rows of [re, im]
dbl(a) = [[[Float64(real(a[j, k])), Float64(imag(a[j, k]))] for k in 1:size(a, 2)] for j in 1:size(a, 1)]
undbl(rows) = [QC(Rational{BigInt}(rows[j][k][1]), Rational{BigInt}(rows[j][k][2])) for j in eachindex(rows), k in eachindex(rows[1])]
function close_root_cases()
    e = Rational{BigInt}(1e-6)                     # the double 1e-6, exactly
    D3 = QC[0 0 0; 0 e 0; 0 0 1]
    R12 = QC[3//5 -4//5 0; 4//5 3//5 0; 0 0 1]; R23 = QC[1 0 0; 0 5//13 -12//13; 0 12//13 5//13]
    R = R12 * R23
    U = QC[3//5 4im//5; 4im//5 3//5]
    cases = [
        ("diag(0, 1e-6, 1)", D3, [0, 1e-6, 1]),
        ("diag(1, 1 + 1e-6)", QC[1 0; 0 1+e], [1, 1 + 1e-6]),
        ("triangular, not normal: 1, 1 + 1e-6, -1", QC[1 2 0; 0 1+e 3; 0 0 -1], [1, 1 + 1e-6, -1]),
        ("diag(i, (1 + 1e-6) i, -1)", QC[im 0 0; 0 (1+e)*im 0; 0 0 -1], [im, (1 + 1e-6)im, -1]),
        ("rotated diag(0, 1e-6, 1), real symmetric", R * D3 * permutedims(R), [0, 1e-6, 1]),
        ("U diag(1, 1 + 1e-6) U^dagger, complex Hermitian", U * QC[1 0; 0 1+e] * madj(U), [1, 1 + 1e-6]),
    ]
    map(cases) do (name, a, starts)
        rows = dbl(a)
        (name = name, rows = rows, ev = sortc(newton_roots(undbl(rows), starts)))
    end
end

# ── self-checks of the reference (not written to the file) ───────────────────────────────────
function selfcheck()
    setprecision(BigFloat, 512) do
        z2 = zeta_ref(1.0); z4 = zeta_ref(2.0)
        abs(z2 - BigFloat(pi)^2 / 6) < big"1e-60" || error("Borwein zeta(2) disagrees with pi^2/6")
        abs(z4 - BigFloat(pi)^4 / 90) < big"1e-60" || error("Borwein zeta(4) disagrees with pi^4/90")
        # direct partial sum plus the integral bounds of the tail must bracket the limit
        for s in S_VALUES
            2s > 1 || continue
            N = 1_000_000
            SN = direct_partial_sums(s, [N])[1]
            a = 2 * BigFloat(s) - 1
            lo = SN + BigFloat(N + 1)^(-a) / a         # sum_{j>N} j^(-2s) >= int_{N+1}^inf
            hi = SN + BigFloat(N)^(-a) / a             # <= int_N^inf
            z = zeta_ref(s)
            lo <= z <= hi || error("zeta($(2s)) outside the bracket of the direct sum: $lo <= $z <= $hi")
        end
        # exact sums of the chapter's examples (c03.eq.rate): sum 1/j^2 and H_N, N <= 25
        for N in 1:25
            r2 = sum(1 // big(j)^2 for j in 1:N); h = sum(1 // big(j) for j in 1:N)
            d2 = direct_partial_sums(1.0, [N])[1]; dh = direct_partial_sums(0.5, [N])[1]
            abs(d2 - BigFloat(r2)) < big"1e-30" || error("direct sum 1/j^2 at N = $N")
            abs(dh - BigFloat(h)) < big"1e-30" || error("direct sum 1/j at N = $N")
            N >= 2 && !(r2 <= 2 - 1 // big(N)) && error("bound 2 - 1/N fails at N = $N")
        end
        # the series erf against the continued-fraction-free identity erf(x) + erfc(x) = 1 is not
        # available without erfc; check two known values instead (DLMF 7.2 table values are not on disk):
        # erf is odd and increasing, and sqrt(pi) erf(6) is within 1e-16 of sqrt(pi)
        abs(gauss_partial(6.0) - sqrt(BigFloat(pi))) < big"1e-16" || error("sqrt(pi) erf(6)")
        all(diff([erf_taylor(x) for x in ERF_X]) .>= 0) || error("erf not increasing")
        # c03.demo.spektren: the closed forms are roots of the exact characteristic polynomial and
        # agree with LAPACK; the Viete roots of Hermitian matrices agree with LAPACK and with the
        # cases constructed by hand
        for (key, ps) in SPEK_PARAMS, p in ps
            a = spek_matrix(key, p)
            ev = spek_eigs(key, p)
            for z in ev
                abs(leibniz_charpoly_at(a, z)) < big"1e-60" || error("closed-form eigenvalue $z of $key($p) is not a root of det(lambda - A)")
            end
            lap = sortc(eigvals(ComplexF64.(Float64.(real.(a)) .+ im .* Float64.(imag.(a)))))
            maximum(abs.(ComplexF64.(ev) .- lap)) < 1e-6 || error("closed forms of $key($p) disagree with LAPACK: $ev vs $lap")
            for part in (herm_part(a), antiherm_part(a))
                hv = herm_eigs(part)
                lh = eigvals(Hermitian(ComplexF64.(Float64.(real.(part)) .+ im .* Float64.(imag.(part)))))
                maximum(abs.(Float64.(hv) .- lh)) < 1e-12 || error("Viete roots of a part of $key($p) disagree with LAPACK")
            end
        end
        for cc in close_root_cases()
            a = undbl(cc.rows)
            lap = sortc(eigvals(ComplexF64.(Float64.(real.(a)) .+ im .* Float64.(imag.(a)))))
            maximum(abs.(ComplexF64.(cc.ev) .- lap)) < 1e-12 || error("close roots of $(cc.name) disagree with LAPACK: $(cc.ev) vs $lap")
            for z in cc.ev
                abs(leibniz_charpoly_at(a, z)) < big"1e-90" || error("close root $z of $(cc.name) is not a root of det(lambda - A)")
            end
            minimum(abs(cc.ev[i] - cc.ev[j]) for i in eachindex(cc.ev) for j in eachindex(cc.ev) if i < j) > 5e-7 || error("close roots of $(cc.name) not separated")
        end
        for (name, rows, mm) in HERM_CASES
            hv = herm_eigs(qmat(rows))
            abs(hv[1] - mm[1]) < big"1e-60" && abs(hv[end] - mm[2]) < big"1e-60" || error("Viete roots of $name: $hv")
        end
    end
    true
end

function build()
    selfcheck()
    cases = String[]
    add(s) = push!(cases, "    " * s)
    for (name, v, w) in VECTORS
        V = [qc(p) for p in v]; W = [qc(p) for p in w]
        add("""{"fn": "dagger", "tol": "exact", "name": "$name", "v": $(arr(v)), "expected": $(arr(dag(V)))}""")
        add("""{"fn": "innerTerms", "tol": "exact", "name": "$name", "v": $(arr(v)), "w": $(arr(w)), "expected": $(arr(terms(V, W)))}""")
        add("""{"fn": "runningSums", "tol": "exact", "name": "$name", "v": $(arr(v)), "w": $(arr(w)), "expected": $(arr(running(terms(V, W))))}""")
        add("""{"fn": "inner", "tol": "exact", "name": "$name", "v": $(arr(v)), "w": $(arr(w)), "expected": $(cnum(sum(terms(V, W))))}""")
        add("""{"fn": "plainTerms", "tol": "exact", "name": "$name", "v": $(arr(v)), "w": $(arr(w)), "expected": $(arr(plain(V, W)))}""")
    end
    for theta in (0.0, 0.3, 1.0, 2.5, -1.2, 4.0)
        ph = setprecision(() -> Complex(cos(BigFloat(theta)), sin(BigFloat(theta))), BigFloat, 256)
        add("""{"fn": "phaseFactor", "tol": "eval", "theta": $(num(theta)), "expected": $(cnum(ph))}""")
        v = VECTORS[1][2]; w = VECTORS[7][2]
        V = [setprecision(() -> Complex(BigFloat(p[1]), BigFloat(p[2])), BigFloat, 256) for p in v]
        W = [setprecision(() -> Complex(BigFloat(p[1]), BigFloat(p[2])), BigFloat, 256) for p in w]
        add("""{"fn": "scaleVec", "tol": "eval", "theta": $(num(theta)), "v": $(arr(v)), "expected": $(arr([ph * x for x in V]))}""")
        # rule 3 of c03.prop.skalarprodukt with alpha = e^(i theta): (alpha v)^dag w = alpha^* v^dag w
        add("""{"fn": "innerScaledFirst", "tol": "eval", "theta": $(num(theta)), "v": $(arr(v)), "w": $(arr(w)), "expected": $(cnum(conj(ph) * sum(conj(V[j]) * W[j] for j in eachindex(V))))}""")
    end
    for (alpha, theta) in VOLL_ALPHA_THETA
        r = vollst_ref(alpha, theta)
        add("""{"fn": "expansion", "tol": "eval", "name": "real plane", "alpha": $(num(alpha)), "theta": $(num(theta)), "expected": $(arr(r.c))}""")
        add("""{"fn": "weights", "tol": "eval", "name": "real plane", "alpha": $(num(alpha)), "theta": $(num(theta)), "expected": $(arr(r.w))}""")
        add("""{"fn": "components", "tol": "eval", "name": "real plane", "alpha": $(num(alpha)), "theta": $(num(theta)), "expected": $(arr(r.parts))}""")
        add("""{"fn": "reassemble", "tol": "eval", "name": "real plane", "alpha": $(num(alpha)), "theta": $(num(theta)), "expected": $(arr(r.psi))}""")
        add("""{"fn": "totalWeight", "tol": "eval", "name": "real plane", "alpha": $(num(alpha)), "theta": $(num(theta)), "expected": $(num(setprecision(() -> sum(r.w), BigFloat, 256)))}""")
    end
    for (i, psi) in enumerate(CPSIS)
        c = exact_expansion(CBASIS, psi)
        add("""{"fn": "expansionExplicit", "tol": "eval", "name": "complex basis $i", "basis": $(arr(CBASIS)), "psi": $(arr(psi)), "expected": $(arr(c))}""")
        add("""{"fn": "weightsExplicit", "tol": "eval", "name": "complex basis $i", "basis": $(arr(CBASIS)), "psi": $(arr(psi)), "expected": $(arr([abs2(x) for x in c]))}""")
    end
    for (key, ps) in SPEK_PARAMS, p in ps
        r = spek_ref(key, p)
        tolm = key == "B" ? "eval" : "exact"
        add("""{"fn": "spektrenOperator", "tol": "$tolm", "op": "$key", "p": $(num(p)), "expected": $(arr([[r.a[j, k] for k in 1:size(r.a, 2)] for j in 1:size(r.a, 1)]))}""")
        add("""{"fn": "spektrenEigenvalues", "tol": "eig", "op": "$key", "p": $(num(p)), "expected": $(arr(r.ev))}""")
        add("""{"fn": "spektrenResiduals", "tol": "residual", "op": "$key", "p": $(num(p)), "expected": $(arr(r.res))}""")
        add("""{"fn": "spektrenClasses", "tol": "exact", "op": "$key", "p": $(num(p)), "expected": $(arr([b ? 1 : 0 for b in r.member]))}""")
        add("""{"fn": "spektrenLoci", "tol": "exact", "op": "$key", "p": $(num(p)), "expected": $(arr([b ? 1 : 0 for b in r.loci]))}""")
        add("""{"fn": "spektrenMinRe", "tol": "eig", "op": "$key", "p": $(num(p)), "expected": $(num(r.minre))}""")
        add("""{"fn": "spektrenMaxIm", "tol": "eig", "op": "$key", "p": $(num(p)), "expected": $(num(r.maxim))}""")
    end
    for cc in close_root_cases()
        add("""{"fn": "eigenvaluesExplicit", "tol": "eig", "name": "$(cc.name)", "m": $(arr(cc.rows)), "expected": $(arr(cc.ev))}""")
    end
    for (name, rows, mm) in HERM_CASES
        hv = herm_eigs(qmat(rows))
        add("""{"fn": "hermitianExtremes", "tol": "eig", "name": "$name", "m": $(arr(rows)), "expected": $(arr([hv[1], hv[end]]))}""")
    end
    for s in S_VALUES
        add("""{"fn": "partialSum", "tol": "sum", "s": $(num(s)), "N": $(arr(N_VALUES)), "expected": $(arr(direct_partial_sums(s, N_VALUES)))}""")
        add("""{"fn": "sumUpperBound", "tol": "sum", "s": $(num(s)), "N": $(arr(N_VALUES)), "expected": $(arr([ref_upper(s, N) for N in N_VALUES]))}""")
        add("""{"fn": "sumLowerBound", "tol": "sum", "s": $(num(s)), "N": $(arr(N_VALUES)), "expected": $(arr([ref_lower(s, N) for N in N_VALUES]))}""")
        add("""{"fn": "sumUpperBoundLimit", "tol": "sum", "s": $(num(s)), "expected": $(numinf(ref_upper_limit(s)))}""")
        add("""{"fn": "sumLimit", "tol": "sum", "s": $(num(s)), "expected": $(2s > 1 ? num(zeta_ref(s)) : "\"Infinity\"")}""")
    end
    for s in [0.51, 0.55, 3.0]
        add("""{"fn": "sumLimit", "tol": "sum", "s": $(num(s)), "expected": $(num(zeta_ref(s)))}""")
    end
    add("""{"fn": "erf", "tol": "erf", "x": $(arr(ERF_X)), "expected": $(arr([erf_taylor(x) for x in ERF_X]))}""")
    add("""{"fn": "erf", "tol": "erf", "x": $(arr(-ERF_X)), "expected": $(arr([-erf_taylor(x) for x in ERF_X]))}""")
    add("""{"fn": "gaussPartial", "tol": "erf", "X": $(arr(ERF_X)), "expected": $(arr([gauss_partial(x) for x in ERF_X]))}""")
    add("""{"fn": "gaussCumulative", "tol": "erf", "x": $(arr(CUM_X)), "expected": $(arr([gauss_cumulative(x) for x in CUM_X]))}""")
    add("""{"fn": "gaussLimit", "tol": "erf", "expected": $(num(setprecision(() -> sqrt(BigFloat(pi)), BigFloat, 256)))}""")
    for s in POWER_S
        add("""{"fn": "powerPartial", "tol": "sum", "s": $(num(s)), "X": $(arr(POWER_X)), "expected": $(arr([power_partial(s, X) for X in POWER_X]))}""")
        add("""{"fn": "powerLimit", "tol": "sum", "s": $(num(s)), "expected": $(numinf(power_limit(s)))}""")
        add("""{"fn": "powerAbs2", "tol": "eval", "s": $(num(s)), "x": $(arr(PHASE_X)), "expected": $(arr([setprecision(() -> (1 + abs(BigFloat(x)))^(-2 * BigFloat(s)), BigFloat, 256) for x in PHASE_X]))}""")
    end
    for kind in ("gauss", "power", "one"), k in (0.0, 2.0, 3.5)
        add("""{"fn": "phased", "tol": "eval", "kind": "$kind", "k": $(num(k)), "x": $(arr(PHASE_X)), "expected": $(arr([phased(kind, k, x) for x in PHASE_X]))}""")
    end
    for kind in ("gauss", "power", "one")
        add("""{"fn": "phasedAbs2", "tol": "eval", "kind": "$kind", "x": $(arr(PHASE_X)), "expected": $(arr([modulus(kind, x)^2 for x in PHASE_X]))}""")
    end

    """{
  "kernel": "hilbert",
  "reference": {"implementation": "Julia $(VERSION), Complex{Rational{BigInt}} and BigFloat (128 to 512 bits), standard library only", "script": "numerics/generate/hilbert_golden.jl"},
  "conventions": {"complex": "[re, im]", "inner product": "v^dagger w = sum_j conj(v_j) w_j, antilinear in the first factor (c03.prop.skalarprodukt)", "l2 family": "v_j = j^(-s), |v_j|^2 = j^(-2s)", "L2 family": "f_s(x) = (1+|x|)^(-s)", "Infinity": "the string \\"Infinity\\": no finite limit"},
  "tolerance": {"abs": 1e-13, "rel": 1e-13, "note": "default; the class of each case is its 'tol', see 'tolerances'"},
  "tolerances": {
    "exact": {"abs": 0, "note": "sums and products of half-integers are exact in double precision; exact equality"},
    "sum": {"abs": 1e-13, "rel": 1e-13, "note": "partial sums (direct below 65 terms, Euler-Maclaurin beyond), bounds and limits in double precision; unvalidated choice above the measured maximum deviation"},
    "erf": {"abs": 1e-14, "note": "erf and the Gaussian areas in double precision; unvalidated choice above the measured maximum deviation"},
    "eval": {"abs": 1e-15, "rel": 1e-14, "note": "closed-form evaluation; unvalidated choice above the measured maximum deviation"},
    "residual": {"abs": 1e-14, "rel": 1e-14, "note": "largest modulus of an entry of a product of two 3x3 matrices minus a third, in double precision (B has the inexact entries s/3); unvalidated choice above the measured maximum deviation"},
    "eig": {"abs": 1e-13, "note": "eigenvalues (shifted QR) and extreme values of <psi|H psi> (Jacobi rotations) in double precision; unvalidated choice above the measured maximum deviation"}
  },
  "cases": [
$(join(cases, ",\n"))
  ]
}
"""
end

function main(args)
    file = DEFAULT_FILE
    i = findfirst(==("--file"), args)
    i === nothing || (file = abspath(args[i + 1]))
    text = build()
    if "--check" in args
        if !isfile(file)
            println("hilbert golden: FAIL golden file missing: $file"); return 1
        end
        if read(file, String) != text
            ours = split(text, '\n'); theirs = split(read(file, String), '\n')
            k = findfirst(i -> i > length(ours) || i > length(theirs) || ours[i] != theirs[i], 1:max(length(ours), length(theirs)))
            println("hilbert golden: FAIL golden file not reproduced by Julia: $file differs from the reference output at line $k")
            println("  reference: ", first(get(ours, k, "(end of output)"), 160))
            println("  file:      ", first(get(theirs, k, "(end of file)"), 160))
            return 1
        end
        println("hilbert golden: ok: $(relpath(file)) is reproduced byte for byte ($(count(==('\n'), text)) lines)")
        return 0
    end
    mkpath(dirname(file)); write(file, text)
    println("hilbert golden: wrote $(relpath(file)) ($(count(==('\n'), text)) lines)")
    0
end
end # module

if abspath(PROGRAM_FILE) == @__FILE__
    exit(HilbertGolden.main(ARGS))
end
