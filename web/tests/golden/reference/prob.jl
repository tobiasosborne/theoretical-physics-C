# Reference implementation for the kernel web/src/kernels/prob.ts (chapter c01, demo
# c01.demo.haeufigkeit). Writes the golden values the TypeScript kernel is compared with,
# and the data of the still figure content/c01-wahrscheinlichkeit/figures/haeufigkeit.tex:
#
#   julia web/tests/golden/reference/prob.jl > web/tests/golden/prob.json
#
# Standard library only. Independent of the kernel: exact arithmetic with Rational{BigInt}
# (the kernel uses integer sums of BigInt), the definitions E[f] = sum p f and
# Var[f] = E[(f - E[f])^2] written out as such (the kernel uses E[f^2] - E[f]^2), and the
# generator mulberry32 written with wrapping UInt32 arithmetic.
#
# Conventions: outcomes are indices 0..n-1; a weight is given by integer numerators a[i]
# over the denominator D = sum(a); a measurement by integers f[i]. Every expected value is
# an integer or a list of integers (numerator and denominator of a fraction in lowest
# terms, counts, outcomes, 32-bit words), so the comparison is exact: tolerance 0.

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

println("""{
  "kernel": "prob",
  "reference": {"implementation": "Julia $(VERSION), Rational{BigInt} and wrapping UInt32, standard library only", "script": "web/tests/golden/reference/prob.jl"},
  "tolerance": {"abs": 0, "note": "every compared quantity is an integer (numerator, denominator, count, outcome index, 32-bit word) below 2^53, so the comparison is exact equality"},
  "cases": [
$(join(cases, ",\n"))
  ]
}""")
