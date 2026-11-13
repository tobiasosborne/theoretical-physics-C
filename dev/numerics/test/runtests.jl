# julia --project=numerics numerics/test/runtests.jl
#
# 1. Exact checks of the reference module (norms, radial equation, CDFs, moments, harmonics).
# 2. Every value of evidence/derivations/c11/golden.json (the reviewed authority, not
#    modified here) is recomputed independently and compared at the precision the file
#    states (17 significant digits; exact strings are compared exactly or evaluated).
#    The test fails if any leaf of that file is not covered by a comparison.
# 3. The laboratory density of DERIVATION.md Result 1b.1 by three routes.
# 4. web/tests/golden/hydrogen.json is reproduced byte for byte by the generator.
using Test, Printf
include(joinpath(@__DIR__, "..", "generate", "hydrogen_golden.jl"))
include(joinpath(@__DIR__, "..", "src", "MiniJSON.jl"))
using .Hydrogen, .Codata, .MiniJSON

const ROOT = normpath(joinpath(@__DIR__, "..", ".."))
const AUTHORITY = joinpath(ROOT, "evidence", "derivations", "c11", "golden.json")
const G = parsejson(read(AUTHORITY, String))

# ── coverage of the authority file: every leaf must be compared ─────────────────────────
leaves(v, path, out) = v isa Dict ? foreach(k -> leaves(v[k], "$path/$k", out), keys(v)) :
                       v isa Vector ? foreach(i -> leaves(v[i], "$path/$(i - 1)", out), eachindex(v)) : push!(out, path)
const ALL_LEAVES = (o = Set{String}(); leaves(G, "", o); o)
const COVERED = Set{String}()
cover(path) = (path in ALL_LEAVES || error("no such leaf in golden.json: $path"); push!(COVERED, path); true)

"|mine - golden| is at most half a unit of the 17th significant digit of the golden string"
function agrees17(mine, s::AbstractString)
    g = parse(BigFloat, s); mine = BigFloat(mine)
    g == 0 && return abs(mine) < big"1e-60"
    e = floor(Int, log10(abs(g)))
    abs(mine - g) <= big"0.5" * BigFloat(10)^(e - 16) * (1 + big"1e-30")
end
rational(s::AbstractString) = (p = split(s, "/"); length(p) == 1 ? parse(BigInt, p[1]) // 1 : parse(BigInt, p[1]) // parse(BigInt, p[2]))

# ── a small evaluator for the SymPy strings of golden.json: numbers, x, + - * / **, sqrt, exp ─
mutable struct Ex; s::String; i::Int; x::BigFloat; end
pk(e) = e.i <= length(e.s) ? e.s[e.i] : '\0'
function ex_sum(e)
    v = ex_prod(e)
    while pk(e) in ('+', '-'); c = pk(e); e.i += 1; w = ex_prod(e); v = c == '+' ? v + w : v - w; end
    v
end
function ex_prod(e)
    v = ex_unary(e)
    while pk(e) in ('*', '/') && !(pk(e) == '*' && e.i < length(e.s) && e.s[e.i + 1] == '*')
        c = pk(e); e.i += 1; w = ex_unary(e); v = c == '*' ? v * w : v / w
    end
    v
end
ex_unary(e) = pk(e) == '-' ? (e.i += 1; -ex_unary(e)) : ex_pow(e)      # -x**2 is -(x**2)
function ex_pow(e)
    b = ex_atom(e)
    if pk(e) == '*' && e.i < length(e.s) && e.s[e.i + 1] == '*'
        e.i += 2; return b^ex_unary(e)
    end
    b
end
function ex_atom(e)
    c = pk(e)
    if c == '('; e.i += 1; v = ex_sum(e); pk(e) == ')' || error("expected )"); e.i += 1; return v
    elseif c == 'x'; e.i += 1; return e.x
    elseif isletter(c)
        j = e.i; while isletter(pk(e)); e.i += 1; end
        name = e.s[j:e.i-1]; pk(e) == '(' || error("expected ( after $name"); e.i += 1
        v = ex_sum(e); e.i += 1
        return name == "sqrt" ? sqrt(v) : name == "exp" ? exp(v) : error("unknown function $name")
    else
        j = e.i; while isdigit(pk(e)) || pk(e) == '.'; e.i += 1; end
        j < e.i || error("unexpected '$c' in expression $(e.s)")
        return parse(BigFloat, e.s[j:e.i-1])
    end
end
function sympy(s::AbstractString, x = 0)
    e = Ex(replace(s, " " => ""), 1, BigFloat(x)); v = ex_sum(e)
    e.i > length(e.s) || error("trailing text in expression $s"); v
end

const NL3 = [(n, l) for n in 1:3 for l in 0:n-1]
close60(a, b) = abs(a - b) <= big"1e-60" * max(1, abs(b))

@testset "hydrogen reference" begin

@testset "evaluator of the SymPy strings" begin
    @test sympy("-x**2", 3) == -9
    @test close60(sympy("sqrt(2)*(2 - x)*exp(-x/2)/4", 1), sqrt(big"2") * exp(-big"0.5") / 4)
    @test sympy("-(2*x**2 + 2*x + 1)*exp(-2*x) + 1", 0) == 0
end

@testset "Gauss-Legendre rule is exact to degree 2n-1" begin
    for n in (8, 24, 40)
        xs, ws = gauss_legendre(n)
        @test length(unique(round.(xs; digits = 40))) == n
        @test all(abs(sum(ws .* xs .^ k) - (iseven(k) ? big"2" / (k + 1) : 0)) < big"1e-60" for k in 0:2n-1)
    end
end

@testset "Result 3.2: 21 exact radial norms, n <= 6" begin
    pairs = [(n, l) for n in 1:6 for l in 0:n-1]
    @test length(pairs) == 21
    @test all(moment(n, l, 0) == 1 for (n, l) in pairs)
    @test G["checks"]["radial_norms_exact"].text == "21" && cover("/checks/radial_norms_exact")
end

@testset "Result 2.1: 10 exact radial equations, n <= 4" begin
    pairs = [(n, l) for n in 1:4 for l in 0:n-1]
    for (n, l) in pairs
        P = radial_poly(n, l); P1 = pderiv(P); P2 = pderiv(P1)
        # x^2 times [ -f'' - (2/x) f' + (l(l+1)/x^2 - 2/x + 1/n^2) f ] / exp(-x/n), f = P exp(-x/n)
        res = padd(padd(pscale(pmul(Q[0, 0, 1], padd(padd(P2, pscale(P1, -2 // n)), pscale(P, 1 // n^2))), -1),
                        pscale(pmul(Q[0, 1], padd(P1, pscale(P, -1 // n))), -2)),
                   pmul(Q[l * (l + 1), -2, 1 // big(n)^2], P))
        @test res == Q[0]
    end
    @test G["checks"]["radial_equations_exact"].text == string(length(pairs)) && cover("/checks/radial_equations_exact")
end

@testset "Result 7.1: 30 exact moments, n <= 4" begin
    cnt = 0
    for n in 1:4, l in 0:n-1
        @test moment(n, l, 1) == (3n^2 - l * (l + 1)) // 2
        @test moment(n, l, 2) == big(n)^2 * (5n^2 + 1 - 3l * (l + 1)) // 2
        @test moment(n, l, -1) == 1 // big(n)^2
        cnt += 3
    end
    @test G["checks"]["moments_exact"].text == string(cnt) && cover("/checks/moments_exact")
end

@testset "Result 7.2: 6 exact CDFs, n <= 3" begin
    for (n, l) in NL3
        Qp = tail_poly(n, l)
        # d/dx [1 - exp(-beta x) Q] = exp(-beta x) (beta Q - Q') must equal D exp(-beta x)
        @test padd(pscale(Qp, 2 // n), pscale(pderiv(Qp), -1)) == radial_density_poly(n, l)
        @test Qp[1] == 1                      # F(0) = 0; F(inf) = 1 holds by the form of F
    end
    @test tail_poly(1, 0) == Q[1, 2, 2]
    @test tail_poly(2, 0) == Q[1, 1, 1 // 2, 0, 1 // 8]
    @test tail_poly(2, 1) == Q[1, 1, 1 // 2, 1 // 6, 1 // 24]
    @test tail_poly(3, 0) == Q[1, 2 // 3, 2 // 9, 0, 4 // 81, -8 // 729, 8 // 6561]
    @test tail_poly(3, 1) == Q[1, 2 // 3, 2 // 9, 4 // 81, 2 // 243, -4 // 2187, 4 // 6561]
    @test tail_poly(3, 2) == Q[1, 2 // 3, 2 // 9, 4 // 81, 2 // 243, 4 // 3645, 4 // 32805]
    @test G["checks"]["radial_cdfs_exact"].text == string(length(NL3)) && cover("/checks/radial_cdfs_exact")
end

@testset "Result 4.1: 81 exact inner products of the harmonics, l <= 2" begin
    lm = [(l, m) for l in 0:2 for m in -l:l]
    cnt = 0
    for (l, m) in lm, (l2, m2) in lm
        cnt += 1
        if m != m2
            # int_0^{2 pi} exp(i (m2 - m) phi) dphi = 0 exactly
            @test true
        else
            s1, c1, p1, am = ylm_parts(l, m); s2, c2, p2, _ = ylm_parts(l2, m2)
            w = Q[1]; for _ in 1:am; w = pmul(w, Q[1, 0, -1]); end
            a = pint(pmul(w, pmul(p1, p2)))
            integral = peval(a, Q(1)) - peval(a, Q(-1))          # int_-1^1 (1-t^2)^|m| p1 p2 dt
            # <Y|Y'> = s1 s2 sqrt(c1 c2) / pi * 2 pi * integral
            if (l, m) == (l2, m2)
                @test s1 * s2 * 2 * c1 * integral == 1
            else
                @test integral == 0
            end
        end
    end
    @test G["checks"]["spherical_harmonic_inner_products_exact"].text == string(cnt) && cover("/checks/spherical_harmonic_inner_products_exact")
    # the explicit formulas of Result 4.1, including the Condon-Shortley signs
    th, ph = big"0.83", big"2.1"; st, ct = sin(th), cos(th); pi_ = BigFloat(pi)
    @test close60(ylm(0, 0, th, ph), 1 / sqrt(4pi_))
    @test close60(ylm(1, 0, th, ph), sqrt(3 / (4pi_)) * ct)
    @test close60(ylm(1, 1, th, ph), -sqrt(3 / (8pi_)) * st * cis(ph))
    @test close60(ylm(1, -1, th, ph), sqrt(3 / (8pi_)) * st * cis(-ph))
    @test close60(ylm(2, 0, th, ph), sqrt(5 / (16pi_)) * (3ct^2 - 1))
    @test close60(ylm(2, 1, th, ph), -sqrt(15 / (8pi_)) * st * ct * cis(ph))
    @test close60(ylm(2, -1, th, ph), sqrt(15 / (8pi_)) * st * ct * cis(-ph))
    @test close60(ylm(2, 2, th, ph), sqrt(15 / (32pi_)) * st^2 * cis(2ph))
    @test close60(ylm(2, -2, th, ph), sqrt(15 / (32pi_)) * st^2 * cis(-2ph))
    @test real(ylm(1, 1, big"1.0", 0)) < 0 < real(ylm(1, -1, big"1.0", 0))
    # theta sampling densities are normalised and their CDFs end at 1
    for l in 0:2, m in 0:l
        @test peval(theta_cdf_poly(l, m), Q(1)) == 1 && peval(theta_cdf_poly(l, m), Q(-1)) == 0
        @test pderiv(theta_cdf_poly(l, m)) == theta_density_poly(l, m)
    end
end

@testset "Result 5.1: 14 exact norms, n <= 3; explicit forms" begin
    states = [(n, l, m) for (n, l) in NL3 for m in -l:l]
    @test length(states) == 14
    for (n, l, m) in states
        s, c, p, am = ylm_parts(l, m)
        w = Q[1]; for _ in 1:am; w = pmul(w, Q[1, 0, -1]); end
        a = pint(pmul(w, pmul(p, p)))
        @test moment(n, l, 0) * 2 * c * (peval(a, Q(1)) - peval(a, Q(-1))) == 1
    end
    @test G["checks"]["explicit_wavefunction_norms_exact"].text == "14" && cover("/checks/explicit_wavefunction_norms_exact")
    x, th, ph = big"1.7", big"0.83", big"2.1"; pi_ = BigFloat(pi)
    @test close60(psi(1, 0, 0, x, th, ph), exp(-x) / sqrt(pi_))
    @test close60(psi(2, 0, 0, x, th, ph), (2 - x) * exp(-x / 2) / (4 * sqrt(2pi_)))
    @test close60(psi(2, 1, 0, x, th, ph), x * exp(-x / 2) * cos(th) / (4 * sqrt(2pi_)))
    @test close60(psi(2, 1, 1, x, th, ph), -x * exp(-x / 2) * sin(th) * cis(ph) / (8 * sqrt(pi_)))
    @test close60(psi(2, 1, -1, x, th, ph), x * exp(-x / 2) * sin(th) * cis(-ph) / (8 * sqrt(pi_)))
    @test close60(psi(3, 0, 0, x, th, ph), (27 - 18x + 2x^2) * exp(-x / 3) / (81 * sqrt(3pi_)))
    @test close60(psi(3, 2, -2, x, th, ph), x^2 * exp(-x / 3) * sin(th)^2 * cis(-2ph) / (162 * sqrt(pi_)))
    # declared real combinations: real, and proportional to x/r and y/r
    px = psi_real(2, :px, x, th, ph); py = psi_real(2, :py, x, th, ph)
    @test abs(imag(px)) < big"1e-60" && abs(imag(py)) < big"1e-60"
    @test close60(real(px), x * exp(-x / 2) * sin(th) * cos(ph) / (4 * sqrt(2pi_)))
    @test close60(real(py), x * exp(-x / 2) * sin(th) * sin(ph) / (4 * sqrt(2pi_)))
end

@testset "authority golden.json: lecture defects" begin
    d = G["checks"]["lecture_defects"]
    # vl16 line 85 as printed: L_2^s = -x^2/2 - (s+2) x + (s+1)(s+2)/2; correct: Result 3.1
    for s in 0:8
        printed = Q[(s + 1) * (s + 2) // 2, -(s + 2), -1 // 2]
        @test padd(printed, pscale(laguerre(2, s), -1)) == Q[0, 0, -1]
    end
    @test d["line_85_printed_minus_correct"] == "-x**2" && cover("/checks/lecture_defects/line_85_printed_minus_correct")
    # vl16 line 94 as printed: coefficient 1/(8 sqrt(2 pi)) for both signs of m; correct: -+ 1/(8 sqrt(pi)).
    # |psi|^2 integrates to (printed/correct)^2 times the exact norm 1.
    printed2 = 1 // (64 * 2); correct2 = 1 // 64               # squares, without the common 1/pi
    @test printed2 // correct2 == rational(d["line_94_printed_norm_squared"]) && cover("/checks/lecture_defects/line_94_printed_norm_squared")
    ratio = sqrt(BigFloat(printed2 // correct2))
    @test close60(ratio, sympy(d["line_94_printed_over_CS_m_minus_1"])) && cover("/checks/lecture_defects/line_94_printed_over_CS_m_minus_1")
    @test close60(-ratio, sympy(d["line_94_printed_over_CS_m_plus_1"])) && cover("/checks/lecture_defects/line_94_printed_over_CS_m_plus_1")
    # vl16 line 57 as printed: 5.29177210903e-11 m
    c = read_codata()
    @test decimal_rational("5.29177210903e-11") - c["Bohr radius"].value == decimal_rational(G["checks"]["lecture_line_57_bohr_radius_minus_codata_2022_m"]) &&
          cover("/checks/lecture_line_57_bohr_radius_minus_codata_2022_m")
end

@testset "authority golden.json: CODATA inputs" begin
    @test isfile(CODATA_FILE)
    c = read_codata()
    @test Set(keys(G["codata_inputs"])) == Set(keys(c))
    for (name, e) in G["codata_inputs"]
        base = "/codata_inputs/$name"
        mine = c[name]
        @test e["line"].text == string(mine.line) && cover("$base/line")
        @test rstrip(e["source_line"]) == rstrip(mine.source_line) && cover("$base/source_line")
        @test rational(e["value_exact_decimal"]) == mine.value && cover("$base/value_exact_decimal")
        @test rational(e["standard_uncertainty_exact_decimal"]) == mine.uncertainty && cover("$base/standard_uncertainty_exact_decimal")
        @test e["unit"] == mine.unit && cover("$base/unit")
    end
end

@testset "authority golden.json: derived constants" begin
    dc = derived_constants(read_codata())
    @test Set(keys(G["constants"])) == Set(keys(dc))
    for (name, e) in G["constants"]
        v, u, unit = dc[name]
        @test agrees17(v, e["value"]) && cover("/constants/$name/value")
        @test agrees17(u, e["first_order_uncertainty_scale_upper_bound"]) && cover("/constants/$name/first_order_uncertainty_scale_upper_bound")
        @test e["unit"] == unit && cover("/constants/$name/unit")
    end
end

@testset "authority golden.json: radial functions, CDFs, moments, samples" begin
    @test length(G["radial"]) == 6
    for (i, e) in enumerate(G["radial"])
        base = "/radial/$(i - 1)"
        n = parse(Int, e["n"].text); l = parse(Int, e["l"].text)
        @test (n, l) == NL3[i] && cover("$base/n") && cover("$base/l")
        probes = parse.(BigFloat, ["0", "0.3", "1", "2", "3.7", "9", "21.5"])
        @test all(close60(sympy(e["R_exact"], x), R(n, l, x)) for x in probes) && cover("$base/R_exact")
        @test all(abs(sympy(e["cdf_exact"], x) - cdf(n, l, x)) < big"1e-60" for x in probes) && cover("$base/cdf_exact")
        # the definition string states R = N (2r/(n a_mu))^l exp(-r/(n a_mu)) L: N a_mu^(3/2) = sqrt(radial_norm2)
        @test occursin("N_nl*(2r/(n*a_mu))^l*exp(-r/(n*a_mu))*L", e["normalization_constant_definition"]) && cover("$base/normalization_constant_definition")
        @test close60(sympy(e["normalization_constant_exact"]), sqrt(BigFloat(radial_norm2(n, l)))) && cover("$base/normalization_constant_exact")
        for (key, s) in (("r_over_a_mu", 1), ("r_squared_over_a_mu_squared", 2), ("inverse_r_times_a_mu", -1))
            @test rational(e["moments_exact"][key]) == moment(n, l, s) && cover("$base/moments_exact/$key")
            @test agrees17(moment(n, l, s), e["moments"][key]) && cover("$base/moments/$key")
        end
        for (j, smp) in enumerate(e["samples"])
            x = BigFloat(smp["r_over_a_mu"])
            @test x in big.([0.5, 1, 2, 5, 10]) && cover("$base/samples/$(j - 1)/r_over_a_mu")
            @test agrees17(R(n, l, x), smp["R_times_a_mu_to_3_over_2"]) && cover("$base/samples/$(j - 1)/R_times_a_mu_to_3_over_2")
            @test agrees17(cdf(n, l, x), smp["cdf"]) && cover("$base/samples/$(j - 1)/cdf")
        end
    end
end

@testset "authority golden.json: metadata and complete coverage" begin
    @test G["schema_version"].text == "1" && cover("/schema_version")
    @test G["precision"]["decimal_significant_digits"].text == "17" && cover("/precision/decimal_significant_digits")
    @test G["precision"]["exact_string_syntax"] == "SymPy; x=r/a_mu" && cover("/precision/exact_string_syntax")
    @test occursin("CODATA", G["precision"]["physical_accuracy"]) && cover("/precision/physical_accuracy")
    @test occursin("Z=1", G["model"]) && occursin("reduced electron-proton mass", G["model"]) && cover("/model")
    @test G["units"]["R"] == "a_mu^(-3/2)" && cover("/units/R")
    @test G["units"]["r"] == "a_mu" && cover("/units/r")
    @test G["units"]["r_squared"] == "a_mu^2" && cover("/units/r_squared")
    @test G["units"]["inverse_r"] == "a_mu^(-1)" && cover("/units/inverse_r")
end

@testset "Result 1b.1: laboratory electron density, three routes" begin
    c = read_codata(); q = BigFloat(c["electron-proton mass ratio"].value)
    b = 1 / (1 + q); sigma = big"0.7"; x = big"1"
    rule = gauss_legendre(40)
    harmonic = lab_harmonic(1, 0, 0, sigma, b, x; rule)                 # x_p integral, angles done analytically
    direct = lab_direct_axis(1, 0, 0, sigma, b, x; rule)                # x_p integral, radius and polar cosine
    # the convolution form (f * g_b)(x) = int f(R) b^-3 g((x - R)/b) d^3R with g = exp(-2|r|)/pi:
    # with s = |R| and d = |x - R|, int_-1^1 exp(-2 d / b) dt = (1/(x s)) int_{|x-s|}^{x+s} d exp(-k d) dd, k = 2/b,
    # and int d exp(-k d) dd = -exp(-k d) (d/k + 1/k^2). The integrand has a kink at s = x: split there.
    k = 2 / b
    prim(d) = -exp(-k * d) * (d / k + 1 / k^2)
    f(s) = s * exp(-s^2 / sigma^2) * (prim(x + s) - prim(abs(x - s))) / x
    conv = 2 * (BigFloat(pi) * sigma^2)^(-big"1.5") / b^3 *
           (quad_gl(f, 0, x; panels = 12, rule) + quad_gl(f, x, x + 14 * sigma; panels = 24, rule))
    reference = big"0.03792255016293097334857020846"     # REVIEW.md B2, 50-digit independent quadrature
    tol = parse(BigFloat, G["checks"]["cloud_convolution_relative_tolerance"])
    @test tol == big"1e-14" && cover("/checks/cloud_convolution_relative_tolerance")
    @test abs(harmonic - conv) / conv < tol
    @test abs(direct - conv) / conv < tol
    @test agrees17(harmonic, "0.037922550162930973")       # DERIVATION.md Result 1b.1
    @test abs(harmonic - reference) / reference < big"1e-27"
    @printf("  rho_e(|x| = a_mu), 1s, sigma = 0.7 a_mu, CODATA mass ratio: %.28f a_mu^-3\n", harmonic)
    @printf("  relative differences: harmonic vs convolution %.2e, direct vs convolution %.2e\n",
            abs(harmonic - conv) / conv, abs(direct - conv) / conv)

    # the P_2 reduction: on the axis (P_2 = 1) and perpendicular to it (P_2 = -1/2)
    worst_axis = big"0"; worst_perp = big"0"
    for (bb, sg, xx) in ((b, big"0.7", big"1.5"), (big"0.5", big"2", big"4"), (big"0.8", big"0.3", big"3"))
        a0 = lab_harmonic(2, 1, 0, sg, bb, xx; rule); a2 = lab_harmonic(2, 1, 2, sg, bb, xx; rule)
        for cc in (2, -1)
            d = lab_direct_axis(2, 1, cc, sg, bb, xx; rule)
            worst_axis = max(worst_axis, abs(a0 + cc * a2 - d) / d)
        end
        d3 = lab_direct_3d(2, 1, 2, sg, bb, xx)
        worst_perp = max(worst_perp, abs(a0 + 2 * a2 * (-big"0.5") - d3) / d3)
    end
    @printf("  2p: harmonic reduction vs direct quadrature, largest relative difference: on axis %.2e, perpendicular (3D) %.2e\n", worst_axis, worst_perp)
    @test worst_axis < big"1e-14"      # same level as the authority's cloud tolerance
    @test worst_perp < big"1e-10"      # unvalidated choice: the 3D check runs in double precision
    # series and closed forms of the scaled i_0, i_2 agree where both are accurate
    @test all(abs(i0_series(z) - i0_closed(z)) < big"1e-60" for z in parse.(BigFloat, ["1", "7.5", "29"]))
    @test all(abs(i2_series(z) - i2_closed(z)) < big"1e-55" for z in parse.(BigFloat, ["1", "7.5", "29"]))
    # the laboratory density is normalised: int 4 pi x^2 A_0 dx = 1 (numerical)
    for (n, l, sg, bb) in ((1, 0, big"0.7", b), (2, 1, big"2", big"0.5"))
        tot = quad_gl(xx -> 4 * BigFloat(pi) * xx^2 * lab_harmonic(n, l, 0, sg, bb, xx; rule), 0, 60; panels = 20, rule = gauss_legendre(16))
        @printf("  int 4 pi x^2 A_0 dx - 1 = %.2e (n = %d, l = %d)\n", tot - 1, n, l)
        @test abs(tot - 1) < big"1e-12"     # unvalidated choice
    end
end

@testset "quantiles invert the closed-form CDF" begin
    @test all(abs(cdf(n, l, quantile_radius(n, l, p)) - p) < big"1e-55" for (n, l) in NL3 for p in (big"0.01", big"0.5", big"0.9", big"0.999"))
    @test radial_roots(2, 0) ≈ [big"2"] && radial_roots(1, 0) == BigFloat[] && radial_roots(3, 1) ≈ [big"6"]
    @test radial_maxima(1, 0)[1][1] ≈ 1 && radial_maxima(2, 1)[1][1] ≈ 4 && radial_maxima(2, 0)[1][1] ≈ 3 + sqrt(big"5")
    # the kernel's bisection uses that the radial density never exceeds 1/a_mu for n <= 3
    largest = maximum(Float64(radial_maxima(n, l)[1][2]) for (n, l) in NL3)
    @printf("  largest value of x^2 R^2 for n <= 3: %.6f / a_mu\n", largest)
    @test largest < 0.6
end

@testset "web/tests/golden/hydrogen.json is reproduced" begin
    @test HydrogenGolden.main(["--check"]) == 0
end

@testset "every leaf of the authority golden.json was compared" begin
    missing_leaves = sort(collect(setdiff(ALL_LEAVES, COVERED)))
    isempty(missing_leaves) || println("  not compared: ", join(missing_leaves, ", "))
    @test isempty(missing_leaves)
    println("  authority golden.json: $(length(COVERED)) of $(length(ALL_LEAVES)) leaf values compared")
end

end
