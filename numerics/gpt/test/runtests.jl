# julia --project=numerics/gpt numerics/gpt/test/runtests.jl
#
# 1. The exact-number tools of the reference module.
# 2. evidence/derivations/c02/golden.json (the reviewed authority, not modified here) is
#    reproduced for the three first-release theories and the six first-release levels:
#    exact strings exactly, 17-digit strings as the 17-digit form of the nearest double. The test
#    fails if a leaf of those parts of the file is not covered by a comparison.
# 3. The closed forms of DERIVATION.md section 4.3 against the vertex enumeration, and the
#    ball formula of section 4.4 against the spectral form of REVIEW.md B4 and against an
#    exhaustive exact search over a lattice of effects.
# 4. The effect-set formulas of sections 3.2 and 3.3 against the vertex inequalities.
# 5. The precision hazard of REVIEW.md: the rounded effect of Q1 is outside E(K).
# 6. web/tests/golden/gpt.json and web/src/kernels/gpt.levels.json are reproduced byte for byte.
using Test
include(joinpath(@__DIR__, "..", "generate.jl"))
using .GPTReference
const Gen = GPTGenerate
const R = GPTReference

const G, SHA = Gen.load_authority()
const T = Dict(id => Gen.theory_from(G, id) for id in Gen.FIRST_RELEASE)
const BIT, SQ, QB = T["classical_bit"], T["square_bit"], T["qubit_ball"]
const FIRST_LEVELS = [(i, lv) for (i, lv) in enumerate(G["levels"]) if lv["theory"] in Gen.FIRST_RELEASE]

# coverage of the first-release part of the authority: every leaf must be compared
leaves(v, path, out) = v isa Dict ? foreach(k -> leaves(v[k], "$path/$k", out), keys(v)) :
                       v isa Vector ? foreach(i -> leaves(v[i], "$path/$(i - 1)", out), eachindex(v)) : push!(out, path)
const ALL = Set{String}()
for id in Gen.FIRST_RELEASE; leaves(G["theories"][id], "/theories/$id", ALL); end
for (i, lv) in FIRST_LEVELS; leaves(lv, "/levels/$(i - 1)", ALL); end
const COVERED = Set{String}()
cover(path) = (path in ALL || error("no such leaf in the authority: $path"); push!(COVERED, path); true)
"exact strings are compared exactly, decimal strings as the 17-digit form of the nearest double"
function same(mine::Surd, s::AbstractString)
    isexactrat(s) ? (mine.y == 0 && mine.x == parseq(s)) : agrees17(value(mine), s)
end

@testset "exact numbers" begin
    @test sqrtq(Q(1 // 2)) == (Q(1 // 2), big(2))
    @test sqrtq(Q(5 // 8)) == (Q(1 // 4), big(10))
    @test sqrtq(Q(9 // 4)) == (Q(3 // 2), big(1))
    @test Surd(1, 2, 12) == Surd(1, 4, 3)
    @test Surd(1, 2, 9) == Surd(7)
    @test parse_exact_expr("sqrt(2)/4 + 1/2") == Surd(1 // 2, 1 // 4, 2)
    @test parse_exact_expr("11/8 - 7*sqrt(5)/40") == Surd(11 // 8, -7 // 40, 5)
    @test parse_exact_expr("3/4") == Surd(3 // 4)
    xs = [Surd(a // 7, b // 5, m) for a in -3:3 for b in -2:2 for m in (2, 3, 5, 6)]
    bad = 0
    for a in xs, b in xs
        d = value(a) - value(b)
        s = a == b ? 0 : d > 0 ? 1 : -1
        bad += cmp_surd(a, b) != s
    end
    @test bad == 0
    @test agrees17(value(Surd(1 // 2, 1 // 4, 2)), "0.85355339059327373")
    @test !agrees17(value(Surd(1 // 2, 1 // 4, 2)), "0.85355339059327383")
end

@testset "authority: the three theories" begin
    for (T0, n) in ((BIT, 4), (SQ, 6))
        t = G["theories"][T0.id]; base = "/theories/$(T0.id)"
        V = effect_vertices(T0)
        @test length(V) == n
        gold = Set(parseq.(v) for v in t["E_vertices"])
        @test Set(V) == gold
        for (i, v) in enumerate(t["E_vertices"]), j in eachindex(v); cover("$base/E_vertices/$(i - 1)/$(j - 1)"); end
        @test [parseq.(v) for v in t["K_vertices"]] == T0.verts
        for (i, v) in enumerate(t["K_vertices"]), j in eachindex(v); cover("$base/K_vertices/$(i - 1)/$(j - 1)"); end
        # every vertex of E(K) maps every vertex of K into [0, 1]; zero and unit are among them
        @test all(0 <= evaluate(T0, f, x).x <= 1 for f in V for x in T0.verts)
        @test R.zero_effect(T0) in V && R.unit_effect(T0) in V
        @test all(evaluate(T0, R.unit_effect(T0), x) == Surd(1) for x in T0.verts)
        @test all(in_K(T0, x) for x in T0.verts)
        @test t["priority"] == "first-release"; cover("$base/priority")
        @test (T0.homogeneous ? startswith(t["coordinates"], "state r; effect (b,a)") : startswith(t["coordinates"], "probabilities")); cover("$base/coordinates")
    end
    # self-duality of the state cone in the standard pairing (sections 3.2, 3.3)
    # bit: C = R_+^2; f is in the dual iff f is nonnegative on both generating rays
    grid = [Q(k // 2) for k in -4:4]
    @test all((f1 >= 0 && f2 >= 0) == all(R.dot([f1, f2], x) >= 0 for x in BIT.verts) for f1 in grid for f2 in grid)
    @test G["theories"]["classical_bit"]["state_cone_self_dual_standard"] === true; cover("/theories/classical_bit/state_cone_self_dual_standard")
    # square: the dual of C = {t >= max(|X|,|Y|)} is {s >= |A|+|B|}; (1,1,1) is in C and not in the dual
    @test all((s >= abs(A) + abs(B)) == all(R.dot([s, A, B], vcat(Q(1), x)) >= 0 for x in SQ.verts) for s in grid for A in grid for B in grid)
    wit = Q[1, 1, 1]
    @test wit[1] >= max(abs(wit[2]), abs(wit[3])) && !(wit[1] >= abs(wit[2]) + abs(wit[3]))
    @test G["theories"]["square_bit"]["state_cone_self_dual_standard"] === false; cover("/theories/square_bit/state_cone_self_dual_standard")

    # qubit ball: parametric families of section 3.5
    t = G["theories"]["qubit_ball"]; base = "/theories/qubit_ball"
    @test t["K_vertices"] === nothing && t["E_vertices"] === nothing; cover("$base/K_vertices"); cover("$base/E_vertices")
    iso = [parseq.(v) for v in t["E_extreme_family"]["isolated"]]
    @test iso == [Q[0, 0, 0, 0], Q[1, 0, 0, 0]]
    @test R.zero_effect(QB) == BallEffect(iso[1][1], iso[1][2:end], 1) && R.unit_effect(QB) == BallEffect(iso[2][1], iso[2][2:end], 1)
    for i in 0:1, j in 0:3; cover("$base/E_extreme_family/isolated/$i/$j"); end
    @test t["E_extreme_family"]["point"] == "(1/2,n/2)" && t["E_extreme_family"]["parameter"] == "n in R^3, n.n=1"
    @test t["K_extreme_family"]["point"] == "n" && t["K_extreme_family"]["parameter"] == "n in R^3, n.n=1"
    @test t["E_set"] == "norm(a) <= min(b,1-b)" && t["K_set"] == "r.r <= 1"
    for d in Gen.DIRS
        e = sharp_effect(d)
        @test e.b == 1 // 2 && e.m * R.dot(e.w, e.w) == 1 // 4      # the point (1/2, n/2), |n| = 1
        @test in_E(QB, e)
        c, m = sqrtq(R.dot(d, d))
        if m == 1                                                    # n = d/|d| is rational: e(n) = 1, e(-n) = 0
            n = d ./ c
            @test in_K(QB, n) && R.dot(n, n) == 1
            @test evaluate(QB, e, n) == Surd(1) && evaluate(QB, e, -n) == Surd(0)
        end
        # on every rational pure state the value is in [0, 1]
        @test all(cmp_surd(evaluate(QB, e, x), Surd(0)) >= 0 && cmp_surd(evaluate(QB, e, x), Surd(1)) <= 0 for x in Gen.UNIT)
    end
    @test all(R.dot(x, x) == 1 for x in Gen.UNIT)
    for k in ("E_extreme_family/point", "E_extreme_family/parameter", "K_extreme_family/point", "K_extreme_family/parameter", "E_set", "K_set"); cover("$base/$k"); end
    @test t["priority"] == "first-release"; cover("$base/priority")
    @test startswith(t["coordinates"], "state r; effect (b,a)"); cover("$base/coordinates")
    # Lorentz cone L4 = {t >= |R|}: self-dual in the standard pairing (section 3.5), sampled on a rational grid:
    # (s, A) pairs nonnegatively with every (1, n), n in UNIT, whenever s >= |A|; and (1, -A/|A|) refutes s < |A|
    g3 = [Q(k // 2) for k in -2:2]
    ok = true
    for s in g3, a1 in g3, a2 in g3, a3 in g3
        A = [a1, a2, a3]; inside = s >= 0 && s^2 >= R.dot(A, A)
        if inside
            ok &= all(s + R.dot(A, x) >= 0 for x in Gen.UNIT)
        else
            c, m = sqrtq(R.dot(A, A))                               # pairing with (1, -A/|A|): s - |A| = s - c sqrt(m)
            ok &= (R.dot(A, A) == 0 ? s < 0 : cmp_surd(Surd(s, -c, m), Surd(0)) < 0)
        end
    end
    @test ok
    @test t["state_cone_self_dual_standard"] === true; cover("$base/state_cone_self_dual_standard")
end

@testset "authority: the six first-release levels" begin
    @test [lv["id"] for (_, lv) in FIRST_LEVELS] == ["B1", "B2", "S1", "S2", "Q1", "Q2"]
    for (i, lv) in FIRST_LEVELS
        base = "/levels/$(i - 1)"; t = T[lv["theory"]]
        w1 = parseq.(lv["omega_1"]); w2 = parseq.(lv["omega_2"]); p1, p2 = parseq.(lv["priors"])
        for (k, v) in (("omega_1", w1), ("omega_2", w2), ("priors", [p1, p2])), j in eachindex(v); cover("$base/$k/$(j - 1)"); end
        cover("$base/id"); cover("$base/theory")
        @test in_K(t, w1) && in_K(t, w2) && p1 + p2 == 1 && p1 >= 0 && p2 >= 0
        S = solve_level(t, w1, w2, p1, p2)
        @test same(S.P, lv["P_opt"]); cover("$base/P_opt")
        @test parse_exact_expr(lv["P_opt_exact"]) == S.P; cover("$base/P_opt_exact")
        # the effect the authority names is one of the optimal extreme effects found here
        ge = lv["optimal_effect"]
        if t isa Polytope
            @test parseq.(ge) in S.optimal
            @test lv["number_of_optimal_extreme_effects"].text == string(length(S.optimal)); cover("$base/number_of_optimal_extreme_effects")
        else
            @test !haskey(lv, "number_of_optimal_extreme_effects")
            @test any(e -> same(Surd(e.b), ge[1]) && all(same(Surd(0, e.w[j], e.m), ge[j+1]) for j in 1:3), S.optimal)
        end
        for j in eachindex(ge); cover("$base/optimal_effect/$(j - 1)"); end
        @test all(e -> in_E(t, e) && score(t, e, w1, w2, p1, p2) == S.P, S.optimal)
        @test !S.all_optimal
        cover("$base/note")
        note = lv["note"]
        if lv["id"] == "B1" || lv["id"] == "S1"
            @test note == "perfect" && S.P == Surd(1)
        elseif lv["id"] == "B2"
            @test note == "overlapping" && S.P == Surd(3 // 4)
        elseif lv["id"] == "S2"
            @test note == "tie with (1/2,0,1/2)" && Set(S.optimal) == Set([Q[1//2, 1//2, 0], Q[1//2, 0, 1//2]])
            mid = Q[1//2, 1//4, 1//4]                               # hazard 6.5: the whole segment is optimal
            @test in_E(t, mid) && score(t, mid, w1, w2, p1, p2) == S.P && !(mid in effect_vertices(t))
        elseif lv["id"] == "Q1"
            @test note == "non-antipodal pure states" && S.P == Surd(1 // 2, 1 // 4, 2) && cmp_surd(S.P, Surd(1)) < 0
            @test R.dot(w1, w1) == 1 && R.dot(w2, w2) == 1 && S.optimal == [BallEffect(1 // 2, Q[1//4, -1//4, 0], 2)]
        elseif lv["id"] == "Q2"
            @test note == "always guess state 1" && S.P == Surd(9 // 10) && S.optimal == [R.unit_effect(t)] && S.P.x == max(p1, p2)
            # REVIEW.md B3: the best rank-one effect gives 5/8
            @test score(t, sharp_effect(Q[0, 0, 1]), w1, w2, p1, p2) == Surd(5 // 8)
        end
        # section 4.1: guessing baselines and bounds
        @test score(t, R.zero_effect(t), w1, w2, p1, p2) == Surd(p2) && score(t, R.unit_effect(t), w1, w2, p1, p2) == Surd(p1)
        @test cmp_surd(S.P, Surd(max(p1, p2))) >= 0 && cmp_surd(S.P, Surd(1)) <= 0
    end
    missing = setdiff(ALL, COVERED)
    isempty(missing) || println("uncovered leaves of the authority: ", sort(collect(missing)))
    @test isempty(missing)
end

@testset "closed forms of section 4.3 against the vertex enumeration" begin
    pri = [Q(k // 4) for k in 0:4]
    bitstates = [Q[k // 4, 1 - k // 4] for k in 0:4]
    n = 0; bad = 0
    for w1 in bitstates, w2 in bitstates, p1 in pri
        S = solve_level(BIT, w1, w2, p1, 1 - p1); n += 1
        bad += S.P != Surd(classical_closed_form(w1, w2, p1, 1 - p1))
    end
    sqstates = [Q[a // 2, b // 2] for a in -2:2 for b in -2:2]
    for w1 in sqstates, w2 in sqstates, p1 in pri
        S = solve_level(SQ, w1, w2, p1, 1 - p1); n += 1
        bad += S.P != Surd(square_closed_form(w1, w2, p1, 1 - p1))
    end
    println("section 4.3: $n instances compared exactly")
    @test bad == 0
end

@testset "ball: section 4.4 against REVIEW B4 and an exhaustive lattice search" begin
    pri = [Q(k // 4) for k in 0:4]
    g = [Q(k // 2) for k in -2:2]
    states = [Q[a, b, c] for a in g for b in g for c in g if a^2 + b^2 + c^2 <= 1]
    n = 0; bad = 0
    for r1 in states, r2 in states, p1 in pri
        S = solve_level(QB, r1, r2, p1, 1 - p1); n += 1
        bad += S.P != spectral_optimum(r1, r2, p1, 1 - p1)
        bad += !all(e -> in_E(QB, e) && score(QB, e, r1, r2, p1, 1 - p1) == S.P, S.optimal)
    end
    println("section 4.4 against the spectral form: $n instances compared exactly")
    @test bad == 0
    # exhaustive: no effect (b, s d/|d|) with d an integer vector of entries -3..3 and b, s multiples of 1/10
    # beats P_opt, and the maximum over the lattice is attained only on the optimal set (when it is on the lattice)
    dirs = unique([(c = gcd(a, gcd(b, d)); Q[a // c, b // c, d // c]) for a in -3:3 for b in -3:3 for d in -3:3 if (a, b, d) != (0, 0, 0)])
    lattice = BallEffect[]
    for kb in 0:10
        b = Q(kb // 10)
        push!(lattice, BallEffect(b, Q[0, 0, 0], 1))
        for ks in 1:10
            s = Q(ks // 10); s <= min(b, 1 - b) || continue
            for d in dirs
                c, m = sqrtq(R.dot(d, d)); push!(lattice, BallEffect(b, (s / (c * m)) .* d, m))
            end
        end
    end
    @test all(e -> in_E(QB, e), lattice)
    inst = [(Q[1, 0, 0], Q[0, 1, 0], Q(1 // 2)), (Q[0, 0, 1//4], Q[0, 0, -1//4], Q(9 // 10)), (Q[0, 0, 1//3], Q[0, 0, -1], Q(3 // 4)),
            (Q[1//2, 0, 1//2], Q[0, 1//3, 0], Q(2 // 3)), (Q[0, 0, 1], Q[0, 0, -1], Q(1 // 2))]
    for (r1, r2, p1) in inst
        S = solve_level(QB, r1, r2, p1, 1 - p1)
        above = 0; equal = BallEffect[]
        for e in lattice
            c = cmp_surd(score(QB, e, r1, r2, p1, 1 - p1), S.P)
            above += c > 0
            c == 0 && push!(equal, e)
        end
        @test above == 0
        @test all(e -> e in equal, [o for o in S.optimal if o in lattice])
        # every lattice effect that attains P_opt is a convex combination of the optimal extreme effects:
        # for a single optimal extreme effect that means it is that effect
        length(S.optimal) == 1 && @test all(==(S.optimal[1]), equal)
    end
    println("lattice search: $(length(lattice)) effects, $(length(inst)) instances")
end

@testset "effect sets of sections 3.2 and 3.3 against the vertex inequalities" begin
    g = [Q(k // 8) for k in -2:10]
    @test all(in_E(BIT, Q[a, b]) == (0 <= a <= 1 && 0 <= b <= 1) for a in g for b in g)
    ga = [Q(k // 8) for k in -6:6]
    @test all(in_E(SQ, Q[b, x, y]) == (abs(x) + abs(y) <= min(b, 1 - b)) for b in g for x in ga for y in ga)
    # section 3.3: every effect is the stated convex combination of the six extreme effects
    ok = true
    for b in g, x in ga, y in ga
        in_E(SQ, Q[b, x, y]) || continue
        qq = abs(x) + abs(y)
        comb = (b - qq) .* Q[1, 0, 0] .+ (2 * abs(x)) .* Q[1//2, sign(x) // 2, 0] .+ (2 * abs(y)) .* Q[1//2, 0, sign(y) // 2]
        ok &= comb == Q[b, x, y] && b - qq >= 0 && 1 - b - qq >= 0
    end
    @test ok
end

@testset "REVIEW hazard: rounded boundary effects are outside E(K) if read as exact" begin
    lv = first(lv for (_, lv) in FIRST_LEVELS if lv["id"] == "Q1")
    dec(s) = isexactrat(s) ? parseq(s) : (p = split(s, "."); sg = startswith(s, "-") ? -1 : 1; sg * (parse(BigInt, lstrip(p[1], '-')) + parse(BigInt, p[2]) // big(10)^length(p[2])))
    e = dec.(lv["optimal_effect"])
    excess = R.dot(e[2:end], e[2:end]) - 1 // 4
    @test excess == big(196572699899009641) // (5 * big(10)^33)          # the value REVIEW.md states
    @test !in_E(QB, BallEffect(e[1], e[2:end], 1))
    @test in_E(QB, sharp_effect(Q[1, -1, 0]))                            # the exact form is inside
end

@testset "generated files are reproduced" begin
    golden, levels = Gen.build()
    @test isfile(Gen.GOLDEN_FILE) && read(Gen.GOLDEN_FILE, String) == golden
    @test isfile(Gen.LEVELS_FILE) && read(Gen.LEVELS_FILE, String) == levels
    @test occursin(SHA, golden) && occursin(SHA, levels)
end
