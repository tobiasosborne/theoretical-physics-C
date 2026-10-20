# Reference implementation for the kernel web/src/kernels/prob.ts (chapter c01, demos
# c01.demo.*). Writes the golden values the TypeScript kernel is compared with, and the data
# of the still figure content/c01-wahrscheinlichkeit/figures/haeufigkeit.tex:
#
#   julia web/tests/golden/reference/prob.jl            writes web/tests/golden/prob.json
#                                                       and web/tests/golden/prob-density.json
#   julia web/tests/golden/reference/prob.jl --check    exit 1 unless both files are reproduced
#
# Standard library only. Independent of the kernel: exact arithmetic with Rational{BigInt}
# (the kernel uses integer sums of BigInt), the definitions E[f] = sum p f and
# Var[f] = E[(f - E[f])^2] written out as such (the kernel uses E[f^2] - E[f]^2), mixtures and
# the split of c01.eq.echte-mischung computed on rational vectors (the kernel works on integer
# numerators), events by bit masks (the kernel by recursion), the binomial weight from
# Base.binomial and rational powers, and the generator mulberry32 written with wrapping
# UInt32 arithmetic. The rounding rules (largest remainder) of renormalise and nearestWeight
# are definitions, not computations; they are restated here from their description.
# The densities of section c01.s4 are integrated numerically (Romberg, 256-bit BigFloat),
# where the kernel uses series, a continued fraction and closed forms.
#
# Conventions: outcomes are indices 0..n-1; a weight is given by integer numerators a[i]
# over the denominator D = sum(a); a measurement by integers f[i]. Every expected value in
# prob.json is an integer or a list of integers (numerator and denominator of a fraction in
# lowest terms, counts, outcomes, 32-bit words), or, under "exact", a fraction written as the
# string "num/den", so the comparison is exact: tolerance 0. prob-density.json holds
# floating-point values with the tolerance stated in it.

weight(a) = [big(x) // big(sum(a)) for x in a]

expectation(p, f) = sum(p[i] * f[i] for i in eachindex(p))

function variance(p, f)
    m = expectation(p, f)
    return sum(p[i] * (f[i] - m)^2 for i in eachindex(p))
end

probability(p, event) = isempty(event) ? big(0) // big(1) : sum(p[i + 1] for i in event)

# mulberry32 on UInt32; + and * wrap modulo 2^32
function generator(seed::Integer)
    s = UInt32(mod(seed, 2^32))
    return function ()
        s += 0x6d2b79f5
        t = (s ⊻ (s >> 15)) * (s | 0x00000001)
        t = (t + (t ⊻ (t >> 7)) * (t | 0x0000003d)) ⊻ t
        return t ⊻ (t >> 14)
    end
end

# rejection sampler: returns the outcomes (indices from 0) and the number of rejected words
function draw(a, seed, count)
    d = sum(a)
    limit = d * div(2^32, d)
    next = generator(seed)
    out = Int[]
    rejected = 0
    while length(out) < count
        w = Int(next())
        if w >= limit
            rejected += 1
            continue
        end
        r = mod(w, d)
        cum = 0
        for i in eachindex(a)
            cum += a[i]
            if r < cum
                push!(out, i - 1)
                break
            end
        end
    end
    return out, rejected
end

tally(outcomes, n, upto) = [count(==(i - 1), outcomes[1:upto]) for i in 1:n]

frac(q) = "[$(numerator(q)), $(denominator(q))]"
list(v) = "[" * join(string.(v), ", ") * "]"

const WEIGHTS = [
    ("fair-die", [1, 1, 1, 1, 1, 1], [1, 2, 3, 4, 5, 6]),
    ("loaded-die", [1, 2, 2, 2, 2, 3], [1, 2, 3, 4, 5, 6]),
    ("coin", [1, 1], [0, 1]),
    ("biased-coin", [1, 3], [0, 1]),
    ("point", [0, 0, 1, 0, 0, 0], [1, 2, 3, 4, 5, 6]),
    ("three", [1, 1, 1], [1, 4, 9]),
    ("signed", [3, 1, 4, 1, 5], [-2, 7, 0, -11, 3]),
]

cases = String[]
for (name, a, f) in WEIGHTS
    p = weight(a)
    push!(cases, """    {"fn": "expectation", "name": "$name", "a": $(list(a)), "f": $(list(f)), "expected": $(frac(expectation(p, f)))}""")
    push!(cases, """    {"fn": "variance", "name": "$name", "a": $(list(a)), "f": $(list(f)), "expected": $(frac(variance(p, f)))}""")
end
for (name, a, event) in (("fair-die", [1, 1, 1, 1, 1, 1], [1, 3, 5]), ("loaded-die", [1, 2, 2, 2, 2, 3], [1, 3, 5]),
                         ("loaded-die", [1, 2, 2, 2, 2, 3], Int[]), ("three", [1, 1, 1], [0, 1]), ("point", [0, 0, 1, 0, 0, 0], [2]))
    push!(cases, """    {"fn": "probability", "name": "$name", "a": $(list(a)), "event": $(list(event)), "expected": $(frac(probability(weight(a), event)))}""")
end
for seed in (1, 2, 12345, 4294967295)
    g = generator(seed)
    push!(cases, """    {"fn": "words", "seed": $seed, "count": 8, "expected": $(list([Int(g()) for _ in 1:8]))}""")
end
for (name, a, f, seed, total, cuts) in (
        ("loaded-die", [1, 2, 2, 2, 2, 3], [1, 2, 3, 4, 5, 6], 1, 1200, (12, 120, 1200)),
        ("fair-die", [1, 1, 1, 1, 1, 1], [1, 2, 3, 4, 5, 6], 1, 600, (6, 60, 600)),
        ("coin", [1, 1], [0, 1], 7, 400, (4, 40, 400)),
        ("point", [0, 0, 1, 0, 0, 0], [1, 2, 3, 4, 5, 6], 3, 50, (1, 50)))
    out, _ = draw(a, seed, total)
    push!(cases, """    {"fn": "sample", "name": "$name", "a": $(list(a)), "seed": $seed, "count": 40, "expected": $(list(out[1:40]))}""")
    push!(cases, """    {"fn": "prefixSums", "name": "$name", "a": $(list(a)), "f": $(list(f)), "seed": $seed, "count": 40, "expected": $(list(cumsum([f[i + 1] for i in out[1:40]])))}""")
    for n in cuts
        c = tally(out, length(a), n)
        h = weight(c)
        push!(cases, """    {"fn": "counts", "name": "$name", "a": $(list(a)), "seed": $seed, "count": $n, "expected": $(list(c))}""")
        push!(cases, """    {"fn": "sampleMean", "name": "$name", "a": $(list(a)), "f": $(list(f)), "seed": $seed, "count": $n, "expected": $(frac(expectation(h, f)))}""")
        push!(cases, """    {"fn": "sampleVariance", "name": "$name", "a": $(list(a)), "f": $(list(f)), "seed": $seed, "count": $n, "expected": $(frac(variance(h, f)))}""")
    end
end
# a denominator that does not divide 2^32 well, so that the rejection branch is taken:
# the smallest seed >= 1 for which at least one word is rejected among the first 3000 draws
let a = [1000003, 500000], total = 3000
    seed = 1
    while draw(a, seed, total)[2] == 0
        seed += 1
    end
    out, rejected = draw(a, seed, total)
    push!(cases, """    {"fn": "counts", "name": "rejection ($rejected word(s) rejected)", "a": $(list(a)), "seed": $seed, "count": $total, "expected": $(list(tally(out, 2, total)))}""")
    push!(cases, """    {"fn": "sample", "name": "rejection, last outcomes", "a": $(list(a)), "seed": $seed, "count": $total, "tail": 40, "expected": $(list(out[end-39:end]))}""")
end


# ── weights: changing, mixing, splitting (demos gewichte, erwartung, varianz, mischung, simplex)

# largest-remainder share of `total` among the indices idx in proportion to w (equal if all 0);
# ties go to the smaller index
function share(total, w, idx)
    ws = [w[j] for j in idx]
    W = sum(ws)
    if W == 0
        ws = ones(Int, length(idx)); W = length(idx)
    end
    exact = [big(total) * x // W for x in ws]
    fl = [Int(floor(x)) for x in exact]
    order = sortperm(collect(zip([-(exact[k] - fl[k]) for k in eachindex(idx)], idx)))
    for k in 1:(total - sum(fl))
        fl[order[k]] += 1
    end
    return Dict(idx[k] => fl[k] for k in eachindex(idx))
end

function renormalise(a, i, v)            # i is an index from 0
    d = sum(a)
    others = [j for j in 0:length(a)-1 if j != i]
    s = share(d - v, Dict(j => a[j + 1] for j in 0:length(a)-1), others)
    return [j == i ? v : s[j] for j in 0:length(a)-1]
end

function nearest_weight(x, d)
    y = [isfinite(v) && v > 0 ? v : 0.0 for v in x]
    t = [v * d / sum(y) for v in y]
    out = [Int(floor(v)) for v in t]
    order = sortperm(collect(zip([-(t[k] - out[k]) for k in eachindex(t)], eachindex(t))))
    for k in 1:(d - sum(out))
        out[order[k]] += 1
    end
    return out
end

# numerators of a list of rationals summing to 1 over their least common denominator
function over_lcd(w)
    L = lcm(denominator.(w))
    return [Int(x * L) for x in w]
end

mix(a, b, k, K) = over_lcd((k // K) .* weight(a) .+ (1 - k // K) .* weight(b))

pointweight(n, i) = [j == i ? big(1) // 1 : big(0) // 1 for j in 0:n-1]

function split(a, i, j)
    p = weight(a)
    e = min(p[i + 1], p[j + 1])
    q = p .+ e .* (pointweight(length(a), i) .- pointweight(length(a), j))
    r = p .- e .* (pointweight(length(a), i) .- pointweight(length(a), j))
    @assert q ./ 2 .+ r ./ 2 == p
    return [Int(x * sum(a)) for x in q], [Int(x * sum(a)) for x in r], e
end

function events(n)
    ev = [[j for j in 0:n-1 if (m >> j) & 1 == 1] for m in 0:(2^n - 1)]
    return sort(ev, lt = (s, t) -> length(s) != length(t) ? length(s) < length(t) : s < t)
end

# ── repetitions ──────────────────────────────────────────────────────────────────────────

binomweight(N, q) = [binomial(big(N), k) * q^k * (1 - q)^(N - k) for k in 0:N]

str(q) = "\"$(numerator(q))/$(denominator(q))\""
strs(v) = "[" * join(str.(v), ", ") * "]"

for (name, a, i, v) in (("loaded-24, raise 6", [2, 4, 4, 4, 4, 6], 5, 12), ("loaded-24, lower 6", [2, 4, 4, 4, 4, 6], 5, 0),
                        ("point-24, from 3", [0, 0, 24, 0, 0, 0], 2, 12), ("fair-24, all on 1", [4, 4, 4, 4, 4, 4], 0, 24),
                        ("uneven", [5, 0, 7, 1, 11], 3, 9), ("three", [12, 6, 6], 1, 1))
    @assert sum(renormalise(a, i, v)) == sum(a)
    push!(cases, """    {"fn": "renormalise", "name": "$name", "a": $(list(a)), "i": $i, "v": $v, "expected": $(list(renormalise(a, i, v)))}""")
end
for (x, d) in (([0.5, 0.3333, 0.1667], 24), ([-0.1, 0.5, 0.6], 12), ([0.2, 0.2, 0.6], 24), ([1.0, 0.0, 0.0], 24), ([0.31, 0.27, 0.42], 12), ([3.7, 1.1], 12))
    push!(cases, """    {"fn": "nearestWeight", "x": $(list(x)), "d": $d, "expected": $(list(nearest_weight(x, d)))}""")
end
for (name, a, b, k, K) in (("q, r of the figure, 1/2", [0, 2, 2, 2, 2, 4], [2, 2, 2, 2, 2, 2], 1, 2),
                           ("fair and point, 1/3", [1, 1, 1, 1, 1, 1], [0, 0, 1, 0, 0, 0], 1, 3),
                           ("loaded and fair, 5/12", [1, 2, 2, 2, 2, 3], [1, 1, 1, 1, 1, 1], 5, 12),
                           ("lambda 0", [1, 2], [3, 1], 0, 7), ("lambda 1", [1, 2], [3, 1], 7, 7))
    push!(cases, """    {"fn": "mixture", "name": "$name", "a": $(list(a)), "b": $(list(b)), "k": $k, "K": $K, "expected": $(list(mix(a, b, k, K)))}""")
end
for (name, a, i, j) in (("figure: a = 6, b = 1", [1, 2, 2, 2, 2, 3], 5, 0), ("a = 2, b = 6", [1, 2, 2, 2, 2, 3], 1, 5),
                        ("three", [2, 1, 1], 0, 2), ("fair", [1, 1, 1, 1, 1, 1], 3, 4))
    q, r, e = split(a, i, j)
    push!(cases, """    {"fn": "properSplit", "name": "$name", "a": $(list(a)), "i": $i, "j": $j, "expected": [$(list(q)), $(list(r)), [$(numerator(e)), $(denominator(e))]]}""")
end
for (name, a) in (("point on 3", [0, 0, 1, 0, 0, 0]), ("loaded", [1, 2, 2, 2, 2, 3]), ("point on 1", [5]), ("two", [0, 2, 0, 1]))
    p = weight(a)
    idx = count(>(0), p) == 1 ? findfirst(>(0), p) - 1 : -1
    push!(cases, """    {"fn": "pointWeightIndex", "name": "$name", "a": $(list(a)), "expected": $idx}""")
end
for (name, a, f, c) in (("fair about 7/2", [1, 1, 1, 1, 1, 1], [1, 2, 3, 4, 5, 6], 7 // 2), ("loaded about 7/2", [1, 2, 2, 2, 2, 3], [1, 2, 3, 4, 5, 6], 7 // 2),
                        ("loaded about 47/12", [1, 2, 2, 2, 2, 3], [1, 2, 3, 4, 5, 6], 47 // 12), ("three about 0", [2, 1, 1], [-1, 0, 1], 0 // 1))
    p = weight(a)
    m = sum(p[i] * (f[i] - c) for i in eachindex(p))
    push!(cases, """    {"fn": "moment", "name": "$name", "a": $(list(a)), "f": $(list(f)), "c": [$(numerator(c)), $(denominator(c))], "expected": $(frac(m))}""")
end
for (name, a, f) in (("fair", [1, 1, 1, 1, 1, 1], [1, 2, 3, 4, 5, 6]), ("half on 3 and 4", [0, 0, 1, 1, 0, 0], [1, 2, 3, 4, 5, 6]),
                     ("loaded", [1, 2, 2, 2, 2, 3], [1, 2, 3, 4, 5, 6]), ("three", [2, 1, 1], [-1, 0, 1]))
    p = weight(a)
    m = expectation(p, f)
    sq = [(f[i] - m)^2 for i in eachindex(f)]
    push!(cases, """    {"fn": "squaredDeviations", "name": "$name", "a": $(list(a)), "f": $(list(f)), "expected": [$(join(frac.(sq), ", "))]}""")
    push!(cases, """    {"fn": "varianceTerms", "name": "$name", "a": $(list(a)), "f": $(list(f)), "expected": [$(join(frac.(p .* sq), ", "))]}""")
end
for (name, a, event) in (("loaded, even", [1, 2, 2, 2, 2, 3], [1, 3, 5]), ("table, {2,3}", [2, 1, 1], [1, 2]), ("table, empty", [2, 1, 1], Int[]))
    p = weight(a)
    t = [i - 1 in event ? p[i] : big(0) // 1 for i in eachindex(p)]
    push!(cases, """    {"fn": "indicatorTerms", "name": "$name", "a": $(list(a)), "event": $(list(event)), "expected": [$(join(frac.(t), ", "))]}""")
end
for n in (0, 1, 3, 4)
    push!(cases, """    {"fn": "allEvents", "n": $n, "expected": [$(join(list.(events(n)), ", "))]}""")
end
for s in 1:13
    ev = [[x1, x2] for x1 in 1:6 for x2 in 1:6 if x1 + x2 == s]
    push!(cases, """    {"fn": "diceSumEvent", "s": $s, "expected": [$(join(list.(ev), ", "))]}""")
end
for (N, q) in ((4, 1 // 2), (16, 1 // 2), (64, 1 // 2), (10, 1 // 3), (7, 0 // 1), (5, 1 // 1), (40, 3 // 4))
    w = binomweight(N, big(q))
    @assert sum(w) == 1
    push!(cases, """    {"fn": "binomialWeight", "N": $N, "q": [$(numerator(q)), $(denominator(q))], "exact": $(strs(w))}""")
end
for (N, q, e) in ((4, 1 // 2, 1 // 4), (16, 1 // 2, 1 // 4), (64, 1 // 2, 1 // 4), (100, 1 // 2, 1 // 10), (30, 1 // 3, 1 // 6), (12, 1 // 4, 1 // 4), (1000, 1 // 2, 1 // 20))
    w = binomweight(N, big(q))
    dev = sum(w[k + 1] for k in 0:N if abs(k // N - q) >= e; init = big(0) // 1)
    cheb = q * (1 - q) / (N * e^2)
    coarse = 1 // (4 * N * e^2)
    vr = q * (1 - q) // N
    push!(cases, """    {"fn": "deviationProbability", "N": $N, "q": [$(numerator(q)), $(denominator(q))], "eps": [$(numerator(e)), $(denominator(e))], "exact": [$(str(dev))]}""")
    push!(cases, """    {"fn": "chebyshevBound", "N": $N, "q": [$(numerator(q)), $(denominator(q))], "eps": [$(numerator(e)), $(denominator(e))], "exact": [$(str(cheb))]}""")
    push!(cases, """    {"fn": "coarseBound", "N": $N, "eps": [$(numerator(e)), $(denominator(e))], "exact": [$(str(coarse))]}""")
    push!(cases, """    {"fn": "frequencyVariance", "N": $N, "q": [$(numerator(q)), $(denominator(q))], "exact": [$(str(vr))]}""")
end
for (a, event, seed, total) in (([1, 1], [1], 1, 60), ([1, 1], [1], 17, 60), ([3, 1], [1], 5, 60), ([1, 2, 2, 2, 2, 3], [1, 3, 5], 1, 60))
    out, _ = draw(a, seed, total)
    push!(cases, """    {"fn": "eventCounts", "a": $(list(a)), "event": $(list(event)), "seed": $seed, "count": $total, "expected": $(list(cumsum([x in event ? 1 : 0 for x in out])))}""")
end
for (L, a, b) in ((1 // 2, 0 // 1, 1 // 2), (1 // 2, -1 // 1, 1 // 1), (1 // 2, 1 // 4, 3 // 8), (1 // 2, 1 // 3, 1 // 3), (3 // 2, 1 // 2, 5 // 2), (1 // 2, 3 // 4, 1 // 1), (1 // 12, 0 // 1, 1 // 24))
    pr = max(0 // 1, min(b, L) - max(a, 0 // 1)) / L
    push!(cases, """    {"fn": "uniformInterval", "L": [$(numerator(L)), $(denominator(L))], "a": [$(numerator(a)), $(denominator(a))], "b": [$(numerator(b)), $(denominator(b))], "expected": $(frac(pr))}""")
end

# deviationTail (the same probability as deviationProbability, on larger N) and maxDeviation
for (N, q, e) in ((16, 1 // 2, 1 // 4), (64, 1 // 2, 1 // 4), (1000, 1 // 2, 1 // 4), (1000, 1 // 12, 1 // 24), (300, 5 // 6, 1 // 8), (9, 0 // 1, 1 // 2))
    w = binomweight(N, big(q))
    dev = sum(w[k + 1] for k in 0:N if abs(k // N - q) >= e; init = big(0) // 1)
    push!(cases, """    {"fn": "deviationTail", "N": $N, "q": [$(numerator(q)), $(denominator(q))], "eps": [$(numerator(e)), $(denominator(e))], "exact": [$(str(dev))]}""")
end
for (name, a, seed, n) in (("loaded-die", [1, 2, 2, 2, 2, 3], 1, 12), ("loaded-die", [1, 2, 2, 2, 2, 3], 1, 120), ("loaded-die", [1, 2, 2, 2, 2, 3], 1, 1200),
                           ("coin", [1, 1], 7, 40), ("point", [0, 0, 1, 0, 0, 0], 3, 50))
    out, _ = draw(a, seed, n)
    c = tally(out, length(a), n)
    m = maximum(abs.(weight(c) .- weight(a)))
    push!(cases, """    {"fn": "maxDeviation", "name": "$name", "a": $(list(a)), "seed": $seed, "count": $n, "expected": $(frac(m))}""")
end

for q in (0 // 1, 1 // 2, 1 // 3, 7 // 12, 1 // 1)
    push!(cases, """    {"fn": "indicatorVariance", "q": [$(numerator(q)), $(denominator(q))], "expected": $(frac(big(q) - big(q)^2))}""")
end

# ── densities (prob-density.json) ────────────────────────────────────────────────────────

setprecision(BigFloat, 256)

# Romberg integration of g over [a, b], extrapolated until two successive diagonal values
# agree to 1e-40 (at most 2^16 panels)
function romberg(g, a::BigFloat, b::BigFloat)
    h = b - a
    R = [h * (g(a) + g(b)) / 2]
    for level in 1:16
        h /= 2
        s = sum(g(a + (2k - 1) * h) for k in 1:2^(level - 1))
        row = [R[1] / 2 + h * s]
        for m in 1:level
            push!(row, row[m] + (row[m] - R[m]) / (big(4)^m - 1))
        end
        if level >= 4 && abs(row[end] - R[end]) < big(10)^-40
            return row[end]
        end
        R = row
    end
    error("romberg did not converge on [$a, $b]")
end

# the integral over [a, b] cut into pieces of length at most `piece`
function integrate(g, a, b; piece = big(1) / 2)
    a, b = BigFloat(a), BigFloat(b)
    total = big(0)
    x = a
    while x < b
        y = min(x + piece, b)
        total += romberg(g, x, y)
        x = y
    end
    return total
end

gauss(x) = exp(-x^2 / 2) / sqrt(2 * big(pi))
const CUT = 12   # the density is below 6e-33 beyond |x| = 12; the neglected tail is below 1e-33
clip(x) = x == Inf ? big(CUT) : x == -Inf ? big(-CUT) : big(x)

dcases = String[]
fl(x) = (y = Float64(x); y == 0 ? "0" : repr(y))
jnum(x) = x == Inf ? "\"Infinity\"" : x == -Inf ? "\"-Infinity\"" : repr(Float64(x))
for x in (0.0, 0.5, 1.0, 1.5, -2.25, 3.6, 7.0)
    push!(dcases, """    {"fn": "gaussDensity", "x": $(jnum(x)), "expected": $(fl(gauss(big(x))))}""")
end
for (a, b) in ((0.5, 1.5), (0.0, Inf), (-Inf, 0.0), (-Inf, Inf), (-1.0, 1.0), (-2.0, 2.0), (-3.0, 3.0), (1.0, Inf), (3.0, Inf), (2.4, 2.6),
               (3.5, 3.6), (-0.35, 0.05), (-4.0, -3.95), (0.7, 0.7), (-Inf, -1.8), (2.5, 6.0))
    push!(dcases, """    {"fn": "gaussInterval", "a": $(jnum(a)), "b": $(jnum(b)), "expected": $(fl(integrate(gauss, clip(a), clip(b))))}""")
end
for b in (1.0, 1.5, 2.0, 10.0, 100.0, 1.0e3, 1.0e6)
    # both integrals over [1, b] on geometric pieces [2^k, 2^(k+1)], each cut into quarters
    mass = big(0); mean = big(0); x = big(1)
    while x < b
        y = min(2x, BigFloat(b))
        mass += integrate(t -> 1 / t^2, x, y; piece = x / 4)
        mean += integrate(t -> 1 / t, x, y; piece = x / 4)
        x = y
    end
    push!(dcases, """    {"fn": "inverseSquarePartial", "b": $(jnum(b)), "expected": [$(fl(mass)), $(fl(mean))]}""")
end

# q(1 - q) as a polynomial in q (Var[chi_S] = E[chi_S^2] - E[chi_S]^2 = q - q^2)
for q in (0.0, 0.25, 0.3, 0.5, 0.9, 1.0)
    push!(dcases, """    {"fn": "indicatorVarianceValue", "x": $(jnum(q)), "expected": $(fl(big(q) - big(q)^2))}""")
end
# the uniform density as height 1/L on [0, L], from the rational L
for (L, x) in ((1 // 2, 0.25), (1 // 2, 0.5), (1 // 2, 0.51), (1 // 2, -0.1), (1 // 12, 0.05), (3 // 2, 1.2))
    h = (x >= 0 && x <= Float64(L)) ? 1 / big(L) : big(0)
    push!(dcases, """    {"fn": "uniformDensity", "L": [$(numerator(L)), $(denominator(L))], "x": $(jnum(x)), "expected": $(fl(h))}""")
end
# x p(x) for p = 1/x^2 on [1, infinity)
for x in (0.5, 1.0, 2.0, 7.5, 1.0e6)
    push!(dcases, """    {"fn": "inverseSquareMeanIntegrand", "x": $(jnum(x)), "expected": $(fl(x >= 1 ? big(x) * (1 / big(x)^2) : big(0)))}""")
end

const DENSITY_TOL = """{"abs": 1e-14, "note": "the kernel evaluates in double precision (series, continued fraction, Math.log); the reference integrates in 256-bit arithmetic to 1e-40 and rounds once to double. 1e-14 bounds the kernel's error for values of size at most 14 (ln 10^6); it is a stated accuracy, not a derived bound"}"""

prob_json = """{
  "kernel": "prob",
  "reference": {"implementation": "Julia $(VERSION), Rational{BigInt} and wrapping UInt32, standard library only", "script": "web/tests/golden/reference/prob.jl"},
  "tolerance": {"abs": 0, "note": "every compared quantity is an integer (numerator, denominator, count, outcome index, 32-bit word) below 2^53, or an exact fraction compared as the string num/den, so the comparison is exact equality"},
  "cases": [
$(join(cases, ",\n"))
  ]
}
"""
density_json = """{
  "kernel": "prob",
  "reference": {"implementation": "Julia $(VERSION), Romberg integration in 256-bit BigFloat, standard library only", "script": "web/tests/golden/reference/prob.jl"},
  "tolerance": $DENSITY_TOL,
  "cases": [
$(join(dcases, ",\n"))
  ]
}
"""

const GOLDEN = normpath(joinpath(@__DIR__, ".."))
files = [(joinpath(GOLDEN, "prob.json"), prob_json), (joinpath(GOLDEN, "prob-density.json"), density_json)]
function check(files)
    bad = false
    for (path, text) in files
        if !isfile(path) || read(path, String) != text
            println(stderr, "prob.jl: $path is not reproduced"); bad = true
        else
            println("prob.jl: $path reproduced")
        end
    end
    return bad
end
if "--check" in ARGS
    exit(check(files) ? 1 : 0)
else
    for (path, text) in files
        write(path, text); println("prob.jl: wrote $path")
    end
end
