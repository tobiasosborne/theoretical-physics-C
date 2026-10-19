# Writes the golden values of the kernel web/src/kernels/hydrogen.ts:
#
#   julia --project=numerics numerics/generate/hydrogen_golden.jl            # write web/tests/golden/hydrogen.json
#   julia --project=numerics numerics/generate/hydrogen_golden.jl --check    # exit 1 unless that file is reproduced
#   julia --project=numerics numerics/generate/hydrogen_golden.jl --check --file PATH   # check another file
#
# Values come from numerics/src/Hydrogen.jl (exact rationals, BigFloat at 256 bits) and are
# written as the nearest double in shortest round-trip form. Constants are computed from
# sources/codata-2022/allascii.txt (numerics/src/Codata.jl).
#
# TOLERANCES. The reference values are correct to the last digit of a double. The
# tolerances below are what the double-precision kernel is held to. Each is an UNVALIDATED
# CHOICE (no error bound is derived for the kernel's rounding), placed above the largest
# deviation measured when the kernel was written (web/tests/kernels/hydrogen.test.ts prints
# the measured maxima) and far below anything a picture or a statistical test can resolve.
include(joinpath(@__DIR__, "..", "src", "Hydrogen.jl"))
include(joinpath(@__DIR__, "..", "src", "Codata.jl"))
module HydrogenGolden
using ..Hydrogen, ..Codata
using Printf

const DEFAULT_FILE = normpath(joinpath(@__DIR__, "..", "..", "web", "tests", "golden", "hydrogen.json"))

num(x::Real) = (y = Float64(x); isfinite(y) || error("non-finite value"); y == 0 ? "0" : repr(y))
num(x::Complex) = "[" * num(real(x)) * ", " * num(imag(x)) * "]"
arr(v) = "[" * join((x isa AbstractVector || x isa Tuple ? arr(x) : num(x) for x in v), ", ") * "]"
rat(q::Rational) = denominator(q) == 1 ? string(numerator(q)) : string(numerator(q), "/", denominator(q))

const NL = [(1, 0), (2, 0), (2, 1), (3, 0), (3, 1), (3, 2)]
# radii in a_mu (exact doubles): origin, small, near the nodes of 2s (2), 3p (6), across the maxima, far tail
const XS = [0.0, 0.0625, 0.25, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.25, 6.0, 8.0, 10.0, 13.5, 20.0, 30.0, 45.0]
const PS = [1e-6, 0.001, 0.01, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99, 0.999, 0.999999]
const ANGLES = [(0.3, 0.7), (1.1, 2.5), (2.0, 4.0), (Float64(pi) / 2, 0.0), (2.8, 5.9), (0.0, 1.0)]
const POINTS = [(0.3, -0.4, 0.5), (1.0, 2.0, -2.0), (-3.0, 0.5, 4.0), (0.0, 0.0, 2.5), (5.0, -7.0, 1.0), (-0.25, 0.0, 0.0), (0.0, 6.0, 0.0)]
const LAB_X = [0.0, 0.0625, 0.5, 1.0, 2.0, 4.0, 7.0, 12.0]
const LAB_SIGMA = [0.3, 0.7, 2.0]

function spherical(p)
    x, y, z = BigFloat.(p)
    r = sqrt(x^2 + y^2 + z^2)
    (r, acos(z / r), atan(y, x))
end

function build()
    codata = read_codata()
    dc = derived_constants(codata)
    q = dc["m_e_over_m_p"][1]
    hbar = codata["Planck constant"].value / (2 * BigFloat(pi))
    rule = gauss_legendre(40)
    cases = String[]
    add(s) = push!(cases, "    " * s)

    for (n, l) in NL
        add("""{"fn": "R", "tol": "eval", "n": $n, "l": $l, "x": $(arr(XS)), "expected": $(arr([R(n, l, x) for x in XS]))}""")
        add("""{"fn": "radialDensity", "tol": "eval", "n": $n, "l": $l, "x": $(arr(XS)), "expected": $(arr([radial_density(n, l, x) for x in XS]))}""")
        add("""{"fn": "radialCdf", "tol": "cdf", "n": $n, "l": $l, "x": $(arr(XS)), "expected": $(arr([cdf(n, l, x) for x in XS]))}""")
        add("""{"fn": "tailPolynomial", "tol": "eval", "n": $n, "l": $l, "exact": [$(join(("\"" * rat(c) * "\"" for c in tail_poly(n, l)), ", "))], "expected": $(arr(tail_poly(n, l)))}""")
        add("""{"fn": "radialQuantile", "tol": "quantile", "n": $n, "l": $l, "p": $(arr(PS)), "expected": $(arr([quantile_radius(n, l, p) for p in PS]))}""")
        add("""{"fn": "radialNodes", "tol": "eval", "n": $n, "l": $l, "expected": $(arr(radial_roots(n, l)))}""")
        mx = radial_maxima(n, l)
        add("""{"fn": "mostProbableRadius", "tol": "eval", "n": $n, "l": $l, "expected": $(num(mx[1][1])), "all_local_maxima": $(arr([m[1] for m in mx]))}""")
        m1, m2, mi = moment(n, l, 1), moment(n, l, 2), moment(n, l, -1)
        add("""{"fn": "moments", "tol": "eval", "n": $n, "l": $l, "order": ["<r>/a_mu", "<r^2>/a_mu^2", "<1/r> a_mu"], "exact": ["$(rat(m1))", "$(rat(m2))", "$(rat(mi))"], "expected": $(arr([m1, m2, mi])), """ *
            """"variance_exact": ["$(rat(m2 - m1^2))", "$(rat(moment(n, l, 4) - m2^2))", "$(rat(moment(n, l, -2) - mi^2))"], "variance": $(arr([m2 - m1^2, moment(n, l, 4) - m2^2, moment(n, l, -2) - mi^2]))}""")
    end
    for l in 0:2, m in -l:l
        add("""{"fn": "ylm", "tol": "eval", "l": $l, "m": $m, "angles": $(arr(ANGLES)), "expected": $(arr([ylm(l, m, a...) for a in ANGLES]))}""")
    end
    for l in 0:2, m in 0:l
        add("""{"fn": "thetaDensityCoefficients", "tol": "eval", "l": $l, "m": $m, "expected": $(arr(theta_density_poly(l, m)))}""")
        add("""{"fn": "thetaCdfCoefficients", "tol": "eval", "l": $l, "m": $m, "expected": $(arr(theta_cdf_poly(l, m)))}""")
    end
    for (n, l) in NL, m in -l:l
        add("""{"fn": "psi", "tol": "eval", "n": $n, "l": $l, "m": $m, "points": $(arr(POINTS)), "expected": $(arr([psi(n, l, m, spherical(p)...) for p in POINTS]))}""")
    end
    for l in 0:0, n in 1:3
        add("""{"fn": "psi", "tol": "eval", "n": $n, "l": 0, "m": 0, "points": [[0, 0, 0]], "expected": $(arr([R(n, 0, 0) * ylm(0, 0, 0, 0)]))}""")
    end
    for (key, sym) in (("2px", :px), ("2py", :py))
        add("""{"fn": "psiState", "tol": "eval", "state": "$key", "points": $(arr(POINTS)), "expected": $(arr([psi_real(2, sym, spherical(p)...) for p in POINTS]))}""")
    end
    # laboratory electron density: A_0 and A_2 of rho_e = A_0 + c A_2 P_2 (Hydrogen.jl, "Result 1b.1")
    for (n, l) in [(1, 0), (2, 0), (2, 1)], sigma in LAB_SIGMA, (qname, qq) in (("codata", q), ("0.25", 1 // 4), ("1", 1 // 1))
        b = 1 / (1 + BigFloat(qq))
        a0 = [lab_harmonic(n, l, 0, sigma, b, x; rule) for x in LAB_X]
        a2 = [lab_harmonic(n, l, 2, sigma, b, x; rule) for x in LAB_X]
        add("""{"fn": "labHarmonics", "tol": "lab", "n": $n, "l": $l, "sigma": $(num(sigma)), "mass_ratio": "$qname", "q": $(num(qq)), "x": $(arr(LAB_X)), "expected": $(arr([a0, a2]))}""")
    end
    cnames = ["m_e_over_m_p", "mu_over_m_e", "a_0", "a_mu", "E_1_m_e_eV", "E_1_mu_eV", "E_1_m_e_J", "E_1_mu_J"]
    add("""{"fn": "constants", "tol": "constants", "names": [$(join(("\"$c\"" for c in cnames), ", "))], "expected": $(arr([dc[c][1] for c in cnames]))}""")
    add("""{"fn": "timeUnit", "tol": "constants", "what": "hbar / |E_1(mu)| in s, hbar = h / (2 pi)", "expected": $(num(hbar / abs(BigFloat(dc["E_1_mu_J"][1]))))}""")

    """{
  "kernel": "hydrogen",
  "reference": {"implementation": "Julia $(VERSION), Rational{BigInt} and BigFloat at $(precision(BigFloat)) bits", "script": "numerics/generate/hydrogen_golden.jl", "module": "numerics/src/Hydrogen.jl", "constants": "sources/codata-2022/allascii.txt"},
  "conventions": {"Z": 1, "length": "a_mu = a_0 (1 + m_e/m_p)", "R": "a_mu^(-3/2)", "psi": "a_mu^(-3/2)", "density": "a_mu^(-3)", "phase": "Condon-Shortley, DERIVATION.md Result 4.1", "energy": "reduced mass mu"},
  "tolerance": {"abs": 1e-13, "rel": 1e-12, "note": "default class 'eval'; unvalidated choice, see 'tolerances'"},
  "tolerances": {
    "eval": {"abs": 1e-13, "rel": 1e-12, "note": "closed-form evaluation in double precision; unvalidated choice above the measured maximum deviation"},
    "cdf": {"abs": 1e-13, "note": "F = 1 - exp(-2x/n) Q(x) loses relative accuracy by cancellation at small x; the absolute error is what a sampler sees; unvalidated choice"},
    "quantile": {"rel": 1e-9, "abs": 1e-9, "note": "radius with F(x) = p; the kernel stops its bisection at |F(x) - p| <= 1e-12 (its stated residual bound), and dx = dF / F'(x) is larger where the density is small; unvalidated choice"},
    "lab": {"abs": 1e-12, "rel": 1e-8, "note": "one-dimensional composite Simpson quadrature in the kernel; unvalidated choice above the measured maximum deviation"},
    "constants": {"rel": 1e-14, "note": "products of CODATA central values in double precision; unvalidated choice"}
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
            println("hydrogen golden: FAIL golden file missing: $file"); return 1
        end
        if read(file, String) != text
            ours = split(text, '\n'); theirs = split(read(file, String), '\n')
            k = findfirst(i -> i > length(ours) || i > length(theirs) || ours[i] != theirs[i], 1:max(length(ours), length(theirs)))
            println("hydrogen golden: FAIL golden file not reproduced by Julia: $file differs from the reference output at line $k")
            println("  reference: ", first(get(ours, k, "(end of output)"), 160))
            println("  file:      ", first(get(theirs, k, "(end of file)"), 160))
            return 1
        end
        println("hydrogen golden: ok: $(relpath(file)) is reproduced byte for byte ($(count(==('\n'), text)) lines)")
        return 0
    end
    mkpath(dirname(file)); write(file, text)
    println("hydrogen golden: wrote $(relpath(file)) ($(count(==('\n'), text)) lines)")
    0
end
end # module

if abspath(PROGRAM_FILE) == @__FILE__
    exit(HydrogenGolden.main(ARGS))
end
