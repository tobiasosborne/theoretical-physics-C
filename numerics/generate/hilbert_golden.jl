# Writes the golden values of the kernel web/src/kernels/hilbert.ts (chapter c03, demos
# c03.demo.kreuz, c03.demo.partialsummen, c03.demo.komplex, c03.demo.partialintegrale,
# c03.demo.raeume):
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
# - cos, sin and exp in BigFloat.
# Values are written as the nearest double in shortest round-trip form.
#
# TOLERANCES (stated in the file, per class): each is an UNVALIDATED CHOICE placed above the
# largest deviation measured when the kernel was written (web/tests/kernels/hilbert.test.ts prints
# the measured maxima) and far below anything the demos display (at most 4 decimals).
module HilbertGolden
using Printf

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
    "eval": {"abs": 1e-15, "rel": 1e-14, "note": "closed-form evaluation; unvalidated choice above the measured maximum deviation"}
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
