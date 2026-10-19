# Writes, from the authority evidence/derivations/c02/golden.json and the reference module:
#
#   web/tests/golden/gpt.json          golden values for the kernel web/src/kernels/gpt.ts
#   web/src/kernels/gpt.levels.json    the level list of the game "Distinguish" (data of the kernel)
#
#   julia --project=numerics/gpt numerics/gpt/generate.jl            # write both
#   julia --project=numerics/gpt numerics/gpt/generate.jl --check    # exit 1 unless both are reproduced
#
# Level inputs (states, priors) are copied from the authority as exact rational strings;
# every derived value (effect vertices, P_opt, optimal effects, scores) is computed here in
# exact arithmetic and compared with the authority by test/runtests.jl. Nothing is retyped
# from rounded decimals.
#
# ENCODING. A rational is the string "n" or "n/d". A number x + y*sqrt(m) is
# {"x", "y", "m"} (m squarefree; y = "0", m = "1" for a rational). A polytope effect is
# {"f": [...]} in the coordinates of DERIVATION.md sections 3.2 and 3.3; a ball effect is
# {"b", "w": [...], "m"} and means (b, a) with a = sqrt(m) * w. "expected" is the nearest
# double of the exact value, for the convention of web/tests/golden.ts.
include(joinpath(@__DIR__, "src", "GPTReference.jl"))
module GPTGenerate
using ..GPTReference
using SHA

const ROOT = normpath(joinpath(@__DIR__, "..", ".."))
const AUTHORITY = joinpath(ROOT, "evidence", "derivations", "c02", "golden.json")
const GOLDEN_FILE = joinpath(ROOT, "web", "tests", "golden", "gpt.json")
const LEVELS_FILE = joinpath(ROOT, "web", "src", "kernels", "gpt.levels.json")
const FIRST_RELEASE = ["classical_bit", "square_bit", "qubit_ball"]

# ── JSON writing (ordered) ──────────────────────────────────────────────────────────────
const Obj = Vector{Pair{String,Any}}
obj(ps...) = Obj(collect(Pair{String,Any}, ps))
jesc(s) = "\"" * replace(s, "\\" => "\\\\", "\"" => "\\\"", "\n" => "\\n") * "\""
struct Raw; s::String; end
js(x::Raw) = x.s
js(x::AbstractString) = jesc(x)
js(x::Bool) = x ? "true" : "false"
js(x::Integer) = string(x)
js(::Nothing) = "null"
js(x::Q) = jesc(ratstr(x))
js(x::Obj) = "{" * join((jesc(k) * ": " * js(v) for (k, v) in x), ", ") * "}"
js(x::AbstractVector) = "[" * join(js.(x), ", ") * "]"
js(x::Surd) = js(obj("x" => x.x, "y" => x.y, "m" => string(x.m)))
js(e::BallEffect) = js(obj("b" => e.b, "w" => e.w, "m" => string(e.m)))
function num(x::Surd)
    v = value(x)
    (abs(x.x) <= 1 && abs(v - x.x) <= 1 && abs(v) <= 1) || error("value outside the range the stated tolerance is derived for: $(x)")
    y = Float64(v)
    Raw(y == 0 ? "0" : repr(y))
end
eff(f::Vector{Q}) = obj("f" => f)
eff(e::BallEffect) = e

# ── the authority ───────────────────────────────────────────────────────────────────────
function load_authority()
    bytes = read(AUTHORITY)
    (parsejson(String(copy(bytes))), bytes2hex(sha256(bytes)))
end

function theory_from(G, id)
    t = G["theories"][id]
    if t["K_vertices"] === nothing
        id == "qubit_ball" || error("unexpected ball theory $id")
        return Ball(id, 3)
    end
    verts = [parseq.(v) for v in t["K_vertices"]]
    homogeneous = startswith(t["coordinates"], "state r")          # "state r; effect (b,a), e(r)=b+a.r"
    homogeneous || startswith(t["coordinates"], "probabilities") || error("unknown coordinates of $id")
    Polytope(id, homogeneous, verts)
end

const REFS = Dict(
    "classical_bit" => "DERIVATION.md section 3.2 (states, effects), section 4.3 (finite maximum over the vertices of E(K))",
    "square_bit" => "DERIVATION.md section 3.3 (states, effects), section 4.3 (finite maximum over the vertices of E(K))",
    "qubit_ball" => "DERIVATION.md sections 3.4, 3.5 (states, effects), section 4.4 (closed form), section 4.5 (trace norm)")

# rational unit vectors and rational directions used for the qubit cases
const UNIT = [Q[1, 0, 0], Q[-1, 0, 0], Q[0, 1, 0], Q[0, 0, 1], Q[0, 0, -1], Q[3//5, 4//5, 0], Q[2//3, 2//3, 1//3], Q[-2//7, 3//7, 6//7]]
const DIRS = [Q[1, 0, 0], Q[0, 0, 1], Q[3, 4, 0], Q[2, 2, 1], Q[1, -1, 0], Q[1, 1, 1], Q[1, 2, 3], Q[-2, 1, 0]]
const TINY = Q(1) // Q(big(10)^30)

function build()
    G, sha = load_authority()
    T = Dict(id => theory_from(G, id) for id in FIRST_RELEASE)
    cases = Any[]

    # theories
    for id in FIRST_RELEASE
        t = T[id]
        if t isa Polytope
            push!(cases, obj("kind" => "theory", "theory" => id, "state_vertices" => t.verts,
                "effect_vertices" => [eff(f) for f in effect_vertices(t)],
                "zero" => eff(GPTReference.zero_effect(t)), "unit" => eff(GPTReference.unit_effect(t))))
        else
            push!(cases, obj("kind" => "theory", "theory" => id, "dim" => t.dim,
                "zero" => eff(GPTReference.zero_effect(t)), "unit" => eff(GPTReference.unit_effect(t)),
                "sharp" => [obj("direction" => d, "effect" => sharp_effect(d)) for d in DIRS]))
        end
    end

    # every extreme effect on every pure state (qubit: the two isolated effects and the sharp
    # effects of DIRS on the rational pure states UNIT and on +-d/|d| where that is rational)
    for id in FIRST_RELEASE
        t = T[id]
        if t isa Polytope
            for f in effect_vertices(t), x in t.verts
                v = evaluate(t, f, x)
                push!(cases, obj("kind" => "extreme_on_pure", "theory" => id, "effect" => eff(f), "state" => x, "value" => v, "expected" => num(v)))
            end
        else
            es = vcat([GPTReference.zero_effect(t), GPTReference.unit_effect(t)], sharp_effect.(DIRS))
            for e in es, x in UNIT
                v = evaluate(t, e, x)
                push!(cases, obj("kind" => "extreme_on_pure", "theory" => id, "effect" => eff(e), "state" => x, "value" => v, "expected" => num(v)))
            end
        end
    end

    # membership in E(K): boundary points are inside, a step of 10^-30 outside is outside
    bit, sq, qb = T["classical_bit"], T["square_bit"], T["qubit_ball"]
    half = Q(1 // 2); quarter = Q(1 // 4)
    for f in vcat(effect_vertices(bit), [Q[1//2, 1//2], Q[1//3, 7//8], Q[1 + TINY, 0], Q[-TINY, 1//2], Q[3//2, 1//2], Q[1//2, 1 + TINY]])
        push!(cases, obj("kind" => "membership_effect", "theory" => bit.id, "effect" => eff(f), "inside" => in_E(bit, f)))
    end
    for f in vcat(effect_vertices(sq), [Q[1//2, 1//4, 1//4], Q[1//2, 1//4, 1//4 + TINY], Q[1//2, 1//2, 1//2], Q[1//2, 1//2, -1//2],
                  Q[1//4, 1//4, 0], Q[1//4, 1//8, 1//8 + TINY], Q[3//4, 1//4, 0], Q[3//4, -1//8, 1//8], Q[3//4, 1//4, 1//1000],
                  Q[-1//10, 0, 0], Q[11//10, 0, 0], Q[1//2, 0, 0], Q[1//2, 51//100, 0], Q[9//10, 1//20, -1//20], Q[9//10, 1//20, -1//20 - TINY]])
        push!(cases, obj("kind" => "membership_effect", "theory" => sq.id, "effect" => eff(f), "inside" => in_E(sq, f)))
    end
    ball_effects = vcat([GPTReference.zero_effect(qb), GPTReference.unit_effect(qb)], sharp_effect.(DIRS), [
        BallEffect(half, Q[3//10, 2//5, 0], 1), BallEffect(half, Q[3//10, 2//5, 1//100], 1),
        BallEffect(half, Q[1//4 + TINY, -1//4, 0], 2), BallEffect(half, Q[1//4, -1//4, 0], 2),
        BallEffect(quarter, Q[1//4, 0, 0], 1), BallEffect(quarter, Q[0, 0, 1//4 + TINY], 1),
        BallEffect(0, Q[TINY, 0, 0], 1), BallEffect(-1 // 10, Q[0, 0, 0], 1), BallEffect(11 // 10, Q[0, 0, 0], 1),
        BallEffect(3 // 4, Q[1//8, 0, 0], 3), BallEffect(3 // 4, Q[1//8, 1//8, 0], 3),
        BallEffect(3 // 4, Q[0, 1//4, 0], 1), BallEffect(3 // 4, Q[0, 1//4, TINY], 1), BallEffect(half, Q[0, 0, 0], 1)])
    for e in ball_effects
        push!(cases, obj("kind" => "membership_effect", "theory" => qb.id, "effect" => eff(e), "inside" => in_E(qb, e)))
    end

    # membership in K
    for x in [Q[1, 0], Q[0, 1], Q[1//2, 1//2], Q[3//4, 1//4], Q[1//2, 1//3], Q[-1//10, 11//10], Q[1 + TINY, -TINY]]
        push!(cases, obj("kind" => "membership_state", "theory" => bit.id, "state" => x, "inside" => in_K(bit, x)))
    end
    for x in [Q[1, 1], Q[-1, 1], Q[0, 0], Q[1, 0], Q[1, 1 + TINY], Q[-1 - TINY, 0], Q[1//2, -3//4], Q[2, 0]]
        push!(cases, obj("kind" => "membership_state", "theory" => sq.id, "state" => x, "inside" => in_K(sq, x)))
    end
    for x in vcat(UNIT, [Q[0, 0, 0], Q[0, 0, 1//4], Q[2//3, 2//3, 1//3 + TINY], Q[1, TINY, 0], Q[1//2, 1//2, 1//2], Q[3//5, 4//5, 1//100]])
        push!(cases, obj("kind" => "membership_state", "theory" => qb.id, "state" => x, "inside" => in_K(qb, x)))
    end

    # levels of the first release, in the order of the authority
    levels = Any[]
    probes = Dict(
        "classical_bit" => [Q[1//2, 1//2], Q[3//4, 1//5], Q[1//10, 9//10], Q[1, 1//2]],
        "square_bit" => [Q[1//2, 1//4, 1//4], Q[1//2, 3//10, -1//5], Q[7//10, 1//10, 1//5], Q[1//4, -1//4, 0], Q[2//5, 1//5, 1//10]],
        "qubit_ball" => [BallEffect(half, Q[1//2, 0, 0], 1), BallEffect(half, Q[0, 0, 1//2], 1), BallEffect(half, Q[3//10, 2//5, 0], 1),
                         sharp_effect(Q[2, -1, 0]), sharp_effect(Q[1, 1, 1]), BallEffect(9 // 10, Q[0, 0, 1//10], 1), BallEffect(7 // 10, Q[1//10, -1//5, 1//10], 1),
                         BallEffect(2 // 5, Q[1//5, -1//5, 0], 2)])
    for lv in G["levels"]
        lv["theory"] in FIRST_RELEASE || continue
        t = T[lv["theory"]]
        w1 = parseq.(lv["omega_1"]); w2 = parseq.(lv["omega_2"]); p1, p2 = parseq.(lv["priors"])
        (in_K(t, w1) && in_K(t, w2)) || error("level $(lv["id"]): a state is not in K")
        (p1 >= 0 && p2 >= 0 && p1 + p2 == 1) || error("level $(lv["id"]): priors")
        R = solve_level(t, w1, w2, p1, p2)
        all(e -> in_E(t, e), R.optimal) || error("level $(lv["id"]): an optimal effect is not in E(K)")
        all(e -> score(t, e, w1, w2, p1, p2) == R.P, R.optimal) || error("level $(lv["id"]): an optimal effect does not attain P_opt")
        common = Pair{String,Any}["id" => lv["id"], "theory" => t.id, "omega_1" => w1, "omega_2" => w2, "priors" => [p1, p2],
            "p_opt" => R.P, "optimal_extreme_effects" => [eff(e) for e in R.optimal], "all_effects_optimal" => R.all_optimal]
        push!(levels, Obj(vcat(common, Pair{String,Any}[
            "derivation" => "evidence/derivations/c02/DERIVATION.md section 5.1, row $(lv["id"]); $(REFS[t.id]); independent check: REVIEW.md B3",
            "note" => lv["note"]])))
        push!(cases, Obj(vcat(Pair{String,Any}["kind" => "level"], common, Pair{String,Any}[
            "expected" => num(R.P), "guess" => max(p1, p2),
            "vertex_scores" => [obj("effect" => eff(f), "P" => s) for (f, s) in R.vertex_scores]])))
        es = t isa Polytope ? vcat(effect_vertices(t), probes[t.id]) : vcat(Any[GPTReference.zero_effect(t), GPTReference.unit_effect(t)], probes[t.id])
        for e in es
            in_E(t, e) || error("probe effect outside E(K)")
            e1 = evaluate(t, e, w1); e2 = evaluate(t, e, w2); P = score(t, e, w1, w2, p1, p2)
            cmp_surd(P, R.P) <= 0 || error("level $(lv["id"]): a probe effect beats P_opt")
            push!(cases, obj("kind" => "score", "level" => lv["id"], "theory" => t.id, "omega_1" => w1, "omega_2" => w2, "priors" => [p1, p2],
                "effect" => eff(e), "e1" => e1, "e2" => e2, "P" => P, "expected" => num(P)))
        end
    end

    # further optimisation instances (not levels): ties and degenerate cases of section 4.4
    # (the explicit cases of REVIEW.md B4 among them), and generic polytope instances
    extra = Any[
        (qb, Q[0, 0, 1//3], Q[0, 0, -1], Q(3 // 4), "REVIEW.md B4: tie between the unit effect and a sharp effect"),
        (qb, Q[0, 0, -1], Q[0, 0, 1//3], Q(1 // 4), "REVIEW.md B4 reversed: tie between the zero effect and a sharp effect"),
        (qb, Q[1//2, 0, 1//4], Q[1//2, 0, 1//4], Q(1 // 2), "identical states, equal priors: every effect scores 1/2"),
        (qb, Q[0, 0, 1], Q[0, 0, -1], Q(1 // 2), "antipodal pure states"),
        (qb, Q[3//5, 4//5, 0], Q[0, 0, 1//2], Q(1), "prior 1 on a pure state: tie between the unit effect and a sharp effect"),
        (qb, Q[1//2, 0, 0], Q[0, 0, 1//2], Q(0), "prior 0 on state 1, mixed state 2: the zero effect"),
        (qb, Q[1//2, 0, 1//2], Q[0, 1//3, 0], Q(2 // 3), "generic, unequal priors"),
        (qb, Q[1, 0, 0], Q[3//5, 4//5, 0], Q(1 // 2), "two pure states"),
        (qb, Q[0, 0, 1//4], Q[0, 0, -1//4], Q(1 // 2), "the states of Q2 with equal priors"),
        (bit, Q[3//4, 1//4], Q[1//4, 3//4], Q(1 // 3), "bit, unequal priors"),
        (bit, Q[1//2, 1//2], Q[1//2, 1//2], Q(1 // 2), "bit, identical states, equal priors"),
        (bit, Q[1, 0], Q[2//3, 1//3], Q(1 // 4), "bit, the zero effect is optimal"),
        (sq, Q[1, 0], Q[0, 1], Q(1 // 2), "square bit, midpoints of adjacent edges"),
        (sq, Q[1, 1], Q[1, -1], Q(1 // 2), "square bit, adjacent vertices"),
        (sq, Q[1//2, 1//4], Q[-1//4, 0], Q(2 // 5), "square bit, generic"),
        (sq, Q[0, 0], Q[1//2, 1//2], Q(9 // 10), "square bit, the unit effect is optimal"),
        (sq, Q[1//3, -1//3], Q[1//3, -1//3], Q(1 // 2), "square bit, identical states, equal priors")]
    for (t, w1, w2, p1, what) in extra
        p2 = 1 - p1
        (in_K(t, w1) && in_K(t, w2)) || error("optimum case: a state is not in K")
        R = solve_level(t, w1, w2, p1, p2)
        push!(cases, obj("kind" => "optimum", "what" => what, "theory" => t.id, "omega_1" => w1, "omega_2" => w2, "priors" => [p1, p2],
            "p_opt" => R.P, "expected" => num(R.P), "optimal_extreme_effects" => [eff(e) for e in R.optimal], "all_effects_optimal" => R.all_optimal))
    end

    lines = ["    " * js(c) for c in cases]
    golden = """{
  "kernel": "gpt",
  "reference": {"implementation": "Julia $(VERSION), Rational{BigInt} and x + y*sqrt(m); effect vertices by hand-written exact enumeration", "script": "numerics/gpt/generate.jl", "authority": "evidence/derivations/c02/golden.json", "authority_sha256": "$sha"},
  "tolerance": {"abs": 1e-15, "note": "derived: the kernel evaluates x + y*sqrt(m) in doubles with two divisions, a square root, a product and a sum, each correctly rounded (relative error at most 2^-53); with |x| <= 1, |y*sqrt(m)| <= 1 and a result of modulus at most 1 (asserted by the generator for every value written) its error is at most 5 * 2^-53 = 5.6e-16; 'expected' is the nearest double of the exact value (error at most 2^-54); 1e-15 exceeds the sum. Exact values are compared as strings, without tolerance."},
  "encoding": "rational: \\"n\\" or \\"n/d\\"; number: {x, y, m} = x + y*sqrt(m); polytope effect: {f}; ball effect: {b, w, m} = (b, sqrt(m)*w)",
  "cases": [
$(join(lines, ",\n"))
  ]
}
"""
    levelstext = """{
  "generated_by": "numerics/gpt/generate.jl (do not edit by hand)",
  "authority": "evidence/derivations/c02/golden.json",
  "authority_sha256": "$sha",
  "encoding": "rational: \\"n\\" or \\"n/d\\"; number: {x, y, m} = x + y*sqrt(m); polytope effect: {f}; ball effect: {b, w, m} = (b, sqrt(m)*w)",
  "levels": [
$(join(["    " * js(l) for l in levels], ",\n"))
  ]
}
"""
    (golden, levelstext)
end

function main(args)
    golden, levels = build()
    if "--check" in args
        bad = 0
        for (file, text) in ((GOLDEN_FILE, golden), (LEVELS_FILE, levels))
            if !isfile(file) || read(file, String) != text
                println("gpt reference: NOT REPRODUCED: ", relpath(file, ROOT)); bad += 1
            else
                println("gpt reference: reproduced ", relpath(file, ROOT))
            end
        end
        exit(bad == 0 ? 0 : 1)
    end
    write(GOLDEN_FILE, golden); write(LEVELS_FILE, levels)
    println("wrote ", relpath(GOLDEN_FILE, ROOT), " and ", relpath(LEVELS_FILE, ROOT))
end

end # module
abspath(PROGRAM_FILE) == @__FILE__() && GPTGenerate.main(ARGS)
