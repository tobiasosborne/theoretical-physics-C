# Reference implementation for chapter C2 (general probabilistic theories), independent of
# the TypeScript kernel web/src/kernels/gpt.ts. Exact arithmetic throughout:
# Rational{BigInt}, and numbers x + y*sqrt(m) (m a squarefree integer) where the qubit
# needs a square root.
#
# The only source of mathematics is evidence/derivations/c02/DERIVATION.md (with REVIEW.md);
# section numbers below refer to it. The input data (state vertices, level states and
# priors) are read from evidence/derivations/c02/golden.json, the authority, which this
# code never writes.
#
#   polytope effects   section 3.1: E(K) = {f : 0 <= H_i . f <= 1}, vertices = feasible
#                      solutions of full-rank sets of active bounds (enumerated by hand)
#   classical bit      section 3.2, probability coordinates, rows H_i = the vertices
#   square bit         section 3.3, rows H_i = (1, v_i)
#   qubit              sections 3.4, 3.5: K = unit ball, E = {(b, a): |a| <= min(b, 1-b)}
#   score              section 4.1: P(e) = pi_1 e(omega_1) + pi_2 (1 - e(omega_2))
#   optimum            section 4.3 (finite maximum over effect vertices), section 4.4
#                      (ball: (1 + max(|delta|, L))/2), cross-checked with the spectral
#                      form of REVIEW.md B4
module GPTReference
using Printf

export Q, Surd, parseq, isexactrat, ratstr, sqrtq, value, cmp_surd, parsejson,
       Polytope, Ball, BallEffect, effect_vertices, evaluate, in_E, in_K, score,
       solve_level, LevelResult, sharp_effect, spectral_optimum, parse_exact_expr,
       agrees17, classical_closed_form, square_closed_form

const Q = Rational{BigInt}

# ── exact numbers ───────────────────────────────────────────────────────────────────────
isexactrat(s::AbstractString) = occursin(r"^-?\d+(/\d+)?$", strip(s))
function parseq(s::AbstractString)::Q
    t = strip(s)
    isexactrat(t) || error("not an exact rational string: $s")
    p = split(t, "/")
    length(p) == 1 ? Q(parse(BigInt, p[1])) : parse(BigInt, p[1]) // parse(BigInt, p[2])
end
ratstr(x::Q) = denominator(x) == 1 ? string(numerator(x)) : string(numerator(x), "/", denominator(x))

"n = c^2 m with m squarefree (trial division; the numbers here are small)"
function squarepart(n::BigInt)
    n > 0 || error("squarepart needs a positive integer")
    c = big(1); m = big(1); p = big(2)
    while p * p <= n
        e = 0
        while n % p == 0; n ÷= p; e += 1; end
        c *= p^(e ÷ 2)
        isodd(e) && (m *= p)
        p += 1
    end
    (c, m * n)
end

"sqrt(r) = c*sqrt(m) for a rational r >= 0, m squarefree"
function sqrtq(r::Q)
    r >= 0 || error("square root of a negative rational")
    r == 0 && return (Q(0), big(1))
    c, m = squarepart(numerator(r) * denominator(r))      # sqrt(n/d) = sqrt(n d)/d
    (c // denominator(r), m)
end

"x + y*sqrt(m); canonical: m squarefree and >= 2 when y != 0, otherwise y = 0 and m = 1"
struct Surd
    x::Q; y::Q; m::BigInt
    function Surd(x, y, m)
        x = Q(x); y = Q(y); m = BigInt(m)
        (y == 0 || m == 1) && return new(x + (m == 1 ? y : Q(0)), Q(0), big(1))
        m >= 2 || error("radicand must be a positive integer")
        c, mm = squarepart(m)
        mm == 1 ? new(x + y * c, Q(0), big(1)) : new(x, y * c, mm)
    end
end
Surd(x) = Surd(x, 0, 1)
Base.:(==)(a::Surd, b::Surd) = a.x == b.x && a.y == b.y && a.m == b.m
Base.hash(a::Surd, h::UInt) = hash((a.x, a.y, a.m), h)
function Base.:+(a::Surd, b::Surd)
    a.y == 0 && return Surd(a.x + b.x, b.y, b.m)
    b.y == 0 && return Surd(a.x + b.x, a.y, a.m)
    a.m == b.m || error("sum of square roots of different radicands is not needed here")
    Surd(a.x + b.x, a.y + b.y, a.m)
end
Base.:*(c::Q, a::Surd) = Surd(c * a.x, c * a.y, a.m)
Base.:-(a::Surd) = Surd(-a.x, -a.y, a.m)
Base.:-(a::Surd, b::Surd) = a + (-b)
value(a::Surd) = setprecision(BigFloat, 256) do; BigFloat(a.x) + BigFloat(a.y) * sqrt(BigFloat(a.m)); end

"sign of A + B*sqrt(m), decided in rationals"
function sign1(A::Q, B::Q, m::BigInt)
    B == 0 && return Int(sign(A))
    A == 0 && return Int(sign(B))
    sign(A) == sign(B) && return Int(sign(A))
    Int(sign(A)) * Int(sign(A^2 - B^2 * m))      # A and B*sqrt(m) of opposite sign: compare squares
end
"sign of a - b, decided in rationals (two squarings at most)"
function cmp_surd(a::Surd, b::Surd)
    dx = a.x - b.x
    (a.y == 0 || b.y == 0 || a.m == b.m) && return a.y == 0 ? sign1(dx, -b.y, b.m) : b.y == 0 ? sign1(dx, a.y, a.m) : sign1(dx, a.y - b.y, a.m)
    su = sign1(dx, a.y, a.m)            # U = dx + a.y sqrt(a.m)
    sv = Int(sign(b.y))                 # V = b.y sqrt(b.m)
    su != sv && return su > sv ? 1 : -1
    su == 0 && return 0
    d = sign1(dx^2 + a.y^2 * a.m - b.y^2 * b.m, 2 * dx * a.y, a.m)     # sign of U^2 - V^2
    su > 0 ? d : -d
end

"""
The decimal strings of the authority are the nearest double of the exact value printed with
17 significant digits (found by comparison: for Q1 the exact value is 0.853553390593273762...,
the authority has 0.85355339059327373, which is the 17-digit form of the nearest double).
The comparison is therefore: nearest double of my exact value, printed with %.17g, equals
the string.
"""
agrees17(mine::BigFloat, s::AbstractString) = (@sprintf("%.17g", Float64(mine)) == strip(s))

"SymPy-style exact strings of the authority file: sums of rationals and k*sqrt(n)/d terms"
function parse_exact_expr(s::AbstractString)::Surd
    acc = Surd(0)
    t = replace(strip(s), " " => "")
    startswith(t, r"[+-]") || (t = "+" * t)
    for mt in eachmatch(r"([+-])([^+-]+)", t)
        sg = mt.captures[1] == "-" ? Q(-1) : Q(1)
        term = mt.captures[2]
        r = match(r"^(?:(\d+)\*)?sqrt\((\d+)\)(?:/(\d+))?$", term)
        if r !== nothing
            k = r.captures[1] === nothing ? big(1) : parse(BigInt, r.captures[1])
            d = r.captures[3] === nothing ? big(1) : parse(BigInt, r.captures[3])
            acc = acc + Surd(0, sg * (k // d), parse(BigInt, r.captures[2]))
        else
            acc = acc + Surd(sg * parseq(term))
        end
    end
    acc
end

# ── a small JSON reader (numbers are kept as their source text) ─────────────────────────
struct JNum; text::String; end
mutable struct JSt; s::String; i::Int; end
jpeek(st) = st.i <= ncodeunits(st.s) ? st.s[st.i] : '\0'
jskip(st) = (while st.i <= ncodeunits(st.s) && st.s[st.i] in (' ', '\n', '\t', '\r'); st.i += 1; end)
jexpect(st, c) = (jpeek(st) == c || error("JSON: expected '$c' at byte $(st.i)"); st.i = nextind(st.s, st.i))
function jstr(st)
    jexpect(st, '"'); io = IOBuffer()
    while true
        c = jpeek(st); st.i = nextind(st.s, st.i)
        c == '"' && break
        if c == '\\'
            e = jpeek(st); st.i = nextind(st.s, st.i)
            if e == 'u'
                print(io, Char(parse(UInt16, st.s[st.i:st.i+3]; base = 16))); st.i += 4
            else
                print(io, e == 'n' ? '\n' : e == 't' ? '\t' : e == 'r' ? '\r' : e)
            end
        else
            print(io, c)
        end
    end
    String(take!(io))
end
function jvalue(st)
    jskip(st); c = jpeek(st)
    if c == '{'
        jexpect(st, '{'); d = Dict{String,Any}(); jskip(st)
        jpeek(st) == '}' && (jexpect(st, '}'); return d)
        while true
            jskip(st); k = jstr(st); jskip(st); jexpect(st, ':'); d[k] = jvalue(st); jskip(st)
            if jpeek(st) == ','; jexpect(st, ','); else; jexpect(st, '}'); return d; end
        end
    elseif c == '['
        jexpect(st, '['); a = Any[]; jskip(st)
        jpeek(st) == ']' && (jexpect(st, ']'); return a)
        while true
            push!(a, jvalue(st)); jskip(st)
            if jpeek(st) == ','; jexpect(st, ','); else; jexpect(st, ']'); return a; end
        end
    elseif c == '"'
        return jstr(st)
    elseif startswith(SubString(st.s, st.i), "true"); st.i += 4; return true
    elseif startswith(SubString(st.s, st.i), "false"); st.i += 5; return false
    elseif startswith(SubString(st.s, st.i), "null"); st.i += 4; return nothing
    else
        j = st.i
        while st.i <= ncodeunits(st.s) && (isdigit(st.s[st.i]) || st.s[st.i] in ('-', '+', '.', 'e', 'E')); st.i += 1; end
        st.i > j || error("JSON: unexpected character at byte $(st.i)")
        return JNum(st.s[j:st.i-1])
    end
end
function parsejson(s::AbstractString)
    st = JSt(String(s), 1); v = jvalue(st); jskip(st)
    st.i > ncodeunits(st.s) || error("JSON: trailing text at byte $(st.i)")
    v
end

# ── theories ────────────────────────────────────────────────────────────────────────────
"K = conv(verts). An effect is a vector f with value f . h(x); rows = h(vertex)."
struct Polytope
    id::String
    homogeneous::Bool            # true: h(r) = (1, r) (section 3.3); false: h(p) = p (section 3.2)
    verts::Vector{Vector{Q}}
end
"K = unit ball of R^dim (sections 3.4, 3.5, 3.9); an effect is (b, a) with a = sqrt(m) * w"
struct Ball
    id::String
    dim::Int
end
struct BallEffect
    b::Q; w::Vector{Q}; m::BigInt
    function BallEffect(b, w, m)
        w = Q.(w); m = BigInt(m)
        all(==(0), w) && return new(Q(b), w, big(1))
        c, mm = squarepart(m)
        new(Q(b), c .* w, mm)
    end
end
Base.:(==)(e::BallEffect, f::BallEffect) = e.b == f.b && e.w == f.w && e.m == f.m
Base.hash(e::BallEffect, h::UInt) = hash((e.b, e.w, e.m), h)

hom(T::Polytope, x::Vector{Q}) = T.homogeneous ? vcat(Q(1), x) : x
rows(T::Polytope) = [hom(T, v) for v in T.verts]
dot(a, b) = sum(a .* b; init = Q(0))

"exact Gaussian elimination; nothing if the matrix is singular"
function solve(A::Vector{Vector{Q}}, rhs::Vector{Q})
    n = length(A)
    M = [vcat(A[i], rhs[i]) for i in 1:n]
    for c in 1:n
        p = findfirst(r -> M[r][c] != 0, c:n)
        p === nothing && return nothing
        p += c - 1
        M[c], M[p] = M[p], M[c]
        M[c] = M[c] ./ M[c][c]
        for r in 1:n
            r == c && continue
            M[r][c] != 0 && (M[r] = M[r] .- M[r][c] .* M[c])
        end
    end
    [M[i][n+1] for i in 1:n]
end

subsets(v, k) = k == 0 ? [eltype(v)[]] : length(v) < k ? Vector{eltype(v)}[] :
    vcat([vcat(v[1], s) for s in subsets(v[2:end], k - 1)], subsets(v[2:end], k))

"all vertices of E(K) (section 3.1): every full-rank choice of D active bounds, kept if feasible"
function effect_vertices(T::Polytope)
    H = rows(T); D = length(H[1])
    cons = [(i, Q(val)) for i in eachindex(H) for val in (0, 1)]
    found = Set{Vector{Q}}()
    for S in subsets(cons, D)
        length(unique(first.(S))) == D || continue          # the same row at 0 and at 1 is inconsistent
        f = solve([H[i] for (i, _) in S], [val for (_, val) in S])
        f === nothing && continue
        all(h -> 0 <= dot(h, f) <= 1, H) && push!(found, f)
    end
    sort!(collect(found))
end

evaluate(T::Polytope, f::Vector{Q}, x::Vector{Q}) = Surd(dot(f, hom(T, x)))
evaluate(::Ball, e::BallEffect, r::Vector{Q}) = Surd(e.b, dot(e.w, r), e.m)

"membership in E(K): the defining inequalities on the vertices (section 3.1) / the ball formula (section 3.4)"
in_E(T::Polytope, f::Vector{Q}) = all(h -> 0 <= dot(h, f) <= 1, rows(T))
in_E(::Ball, e::BallEffect) = 0 <= e.b <= 1 && e.m * dot(e.w, e.w) <= min(e.b, 1 - e.b)^2

"membership in K, typed from the sets of sections 3.2, 3.3, 3.4 (not through the effects)"
function in_K(T::Polytope, x::Vector{Q})
    T.id == "classical_bit" && return all(>=(0), x) && sum(x) == 1
    T.id == "square_bit" && return all(c -> -1 <= c <= 1, x)
    error("in_K: no explicit description for $(T.id)")
end
in_K(T::Ball, r::Vector{Q}) = length(r) == T.dim && dot(r, r) <= 1

"P(e) = pi_1 e(omega_1) + pi_2 (1 - e(omega_2))  (section 4.1)"
score(T, e, w1, w2, p1::Q, p2::Q) = p1 * evaluate(T, e, w1) + p2 * (Surd(1) - evaluate(T, e, w2))

unit_effect(T::Polytope) = T.homogeneous ? vcat(Q(1), zeros(Q, length(T.verts[1]))) : ones(Q, length(T.verts[1]))
zero_effect(T::Polytope) = zeros(Q, length(unit_effect(T)))
unit_effect(T::Ball) = BallEffect(1, zeros(Q, T.dim), 1)
zero_effect(T::Ball) = BallEffect(0, zeros(Q, T.dim), 1)

"the extreme effect (1/2, n/2) with n = v/|v| (section 3.5), v a nonzero rational vector"
function sharp_effect(v::Vector{Q})
    c, m = sqrtq(dot(v, v))                 # |v| = c sqrt(m);  v/(2|v|) = sqrt(m) * v/(2 c m)
    BallEffect(1 // 2, v ./ (2 * c * m), m)
end

struct LevelResult
    P::Surd
    optimal::Vector{Any}          # all optimal extreme effects (finite list); see all_optimal
    all_optimal::Bool             # every effect has the same score (section 4.4, L = delta = 0)
    vertex_scores::Vector{Any}    # polytopes: (vertex, score) for every vertex of E(K)
end

"section 4.3: the maximum of the affine score is attained on a vertex of E(K)"
function solve_level(T::Polytope, w1, w2, p1::Q, p2::Q)
    V = effect_vertices(T)
    sc = [score(T, f, w1, w2, p1, p2).x for f in V]
    best = maximum(sc)
    opt = Any[V[i] for i in eachindex(V) if sc[i] == best]
    LevelResult(Surd(best), opt, length(opt) == length(V), Any[(V[i], Surd(sc[i])) for i in eachindex(V)])
end

"section 4.4: P_opt = (1 + max(|delta|, L))/2 with delta = pi_1 - pi_2, L = |pi_1 r_1 - pi_2 r_2|"
function solve_level(T::Ball, r1, r2, p1::Q, p2::Q)
    delta = p1 - p2
    v = p1 .* r1 .- p2 .* r2
    L2 = dot(v, v)
    c, m = sqrtq(L2)
    if delta^2 > L2                                   # |delta| > L: a constant effect
        return LevelResult(Surd((1 + abs(delta)) / 2), Any[delta > 0 ? unit_effect(T) : zero_effect(T)], false, Any[])
    elseif delta^2 == L2
        L2 == 0 && return LevelResult(Surd(1 // 2), Any[zero_effect(T), unit_effect(T)], true, Any[])
        return LevelResult(Surd((1 + abs(delta)) / 2), Any[delta > 0 ? unit_effect(T) : zero_effect(T), sharp_effect(v)], false, Any[])
    else
        return LevelResult(Surd(1 // 2, c / 2, m), Any[sharp_effect(v)], false, Any[])
    end
end

"REVIEW.md B4: P_opt = pi_2 + sum of the positive eigenvalues of D, eigenvalues (delta +- L)/2"
function spectral_optimum(r1, r2, p1::Q, p2::Q)
    delta = p1 - p2
    v = p1 .* r1 .- p2 .* r2
    c, m = sqrtq(dot(v, v))
    lam = (Surd(delta / 2, c / 2, m), Surd(delta / 2, -c / 2, m))
    P = Surd(p2)
    for l in lam
        cmp_surd(l, Surd(0)) > 0 && (P = P + l)
    end
    P
end

"section 4.3, classical simplex: sum_i max(pi_1 p_1i, pi_2 p_2i)"
classical_closed_form(w1, w2, p1::Q, p2::Q) = sum(max.(p1 .* w1, p2 .* w2))
"section 4.3, first-release square: (1 + max(|delta|, |v_x|, |v_y|))/2"
function square_closed_form(w1, w2, p1::Q, p2::Q)
    v = p1 .* w1 .- p2 .* w2
    (1 + max(abs(p1 - p2), abs(v[1]), abs(v[2]))) / 2
end

end # module
