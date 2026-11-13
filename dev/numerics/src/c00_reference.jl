# Reference implementations for the kernels of chapter c00 (Was eine physikalische Theorie
# liefert): web/src/kernels/planck.ts, photo.ts and c00cavity.ts. Standard library only.
#
# Arithmetic. Constants are exact rationals read from sources/codata-2022/allascii.txt with
# numerics/src/Codata.jl (parse_codata_line); the formulas are evaluated in BigFloat at 256
# bits (Planck, photoelectric) or in exact Rational{BigInt} arithmetic (cavity geometry).
# The TypeScript kernels use doubles and, where it matters, other methods (Newton instead of
# bisection for the maximum; incremental wall crossings instead of a sorted merge for the
# cavity), so agreement is a check and not a copy.
#
# Formulas (content/c00-theorie/de.tex):
#   c00.eq.planck      u(nu, T)    = 8 pi h nu^3 / c^3 / (exp(h nu/(k_B T)) - 1)
#   c00.eq.grenzform   u_kl(nu, T) = 8 pi nu^2 k_B T / c^3,  u / u_kl = x / (exp(x) - 1),  x = h nu/(k_B T)
#   c00.eq.schranken   exp(-x) <= x/(exp(x) - 1) <= 1/(1 + x/2)
#   figure c00.fig.planck (a): s = h nu/(k_B T_0), u_0 = 8 pi (k_B T_0)^3/(h^2 c^3),
#                      u/u_0 = s^3/(exp(s T_0/T) - 1),  u_kl/u_0 = s^2 T/T_0
#   maximum of u in nu at fixed T: x_peak is the positive root of 3 (1 - exp(-x)) = x
#   c00.eq.photoeffekt E_kin,max = (1/2) m_e v_max^2 = h nu - W   (nu >= W/h, c00.eq.schwelle)
#   c00.eq.reflexion   fraction left after n reflections: r^n
#   figure c00.fig.hohlraum: box [0, a] x [0, b], hole in the left wall (y_lo, y_hi), a ray
#                      enters at (0, y_0) with direction (1, s); specular reflection.
module C00Reference

include(joinpath(@__DIR__, "Codata.jl"))
using .Codata: parse_codata_line, decimal_rational, CODATA_FILE

export constants, ratio, lower_bound, upper_bound, u_si, ukl_si, x_of, reduced_u, reduced_ukl, u0_si,
       peak_x, v_max, kin_max_eV, threshold_Hz, speed_of_eV, cavity_path

const Q = Rational{BigInt}

# CODATA 2022 lines used here (allascii.txt); the name in the file is checked
const LINES = Dict("Boltzmann constant" => 62, "electron mass" => 107, "elementary charge" => 132,
                   "Planck constant" => 271, "speed of light in vacuum" => 330)

"name => (value, uncertainty, unit, line, source line) for the five constants, exact rationals"
function constants(file = CODATA_FILE)
    lines = readlines(file)
    d = Dict{String,Any}()
    for (name, n) in LINES
        p = parse_codata_line(lines[n])
        p.name == name || error("allascii.txt line $n is \"$(p.name)\", expected \"$name\"")
        d[name] = (value = p.value, uncertainty = p.uncertainty, unit = p.unit, line = n, source_line = lines[n])
    end
    d
end

const C = constants()
const H = C["Planck constant"].value
const KB = C["Boltzmann constant"].value
const CL = C["speed of light in vacuum"].value
const E = C["elementary charge"].value
const ME = C["electron mass"].value
B(x) = BigFloat(x)

# ── Planck ─────────────────────────────────────────────────────────
"x / (exp(x) - 1) for x > 0; the value 1 at x = 0 is the limit"
ratio(x) = (x = B(x); iszero(x) ? one(x) : x / expm1(x))
lower_bound(x) = exp(-B(x))
upper_bound(x) = 1 / (1 + B(x) / 2)
x_of(nu, T) = B(H) * B(nu) / (B(KB) * B(T))
u_si(nu, T) = 8 * B(pi) * B(H) * B(nu)^3 / B(CL)^3 / expm1(x_of(nu, T))
ukl_si(nu, T) = 8 * B(pi) * B(nu)^2 * B(KB) * B(T) / B(CL)^3
reduced_u(s, tau) = B(s)^3 / expm1(B(s) / B(tau))
reduced_ukl(s, tau) = B(s)^2 * B(tau)
u0_si(T0) = 8 * B(pi) * (B(KB) * B(T0))^3 / (B(H)^2 * B(CL)^3)

"positive root of 3 (1 - exp(-x)) = x, by bisection on [2, 3] (f(2) < 0 < f(3) for f = x - 3 (1 - e^-x))"
function peak_x()
    f(x) = x - 3 * (1 - exp(-x))
    lo, hi = B(2), B(3)
    f(lo) < 0 < f(hi) || error("peak_x: no sign change")
    for _ in 1:400
        mid = (lo + hi) / 2
        f(mid) < 0 ? (lo = mid) : (hi = mid)
    end
    (lo + hi) / 2
end

# ── photoelectric relation ─────────────────────────────────────────
threshold_Hz(W_eV) = B(W_eV) * B(E) / B(H)
kin_max_eV(nu, W_eV) = B(H) * B(nu) / B(E) - B(W_eV)
speed_of_eV(Ek_eV) = sqrt(2 * B(Ek_eV) * B(E) / B(ME))
function v_max(nu, W_eV)
    k = kin_max_eV(nu, W_eV)
    k >= 0 || error("v_max: below the threshold")
    sqrt(2 * k * B(E) / B(ME))
end

# ── cavity ─────────────────────────────────────────────────────────
"""
Impacts of the ray on the walls, exact. The unfolded ray is (t, y_0 + s t), t >= 0. It meets
a vertical wall where t = a m (m = 1, 2, ...) and a horizontal wall where y_0 + s t = b j.
All crossings with t up to a bound are listed and sorted; equal t (both walls at once) is a
corner, two contacts, continued by reflection at both walls. Folding gives the box position.
A left-wall impact strictly inside the hole (y_lo < y < y_hi) ends the path: the ray leaves.
Stops after the first impact at which the number of contacts reaches nmax.
Returns (points, contacts, cumulative path lengths, exited).
"""
function cavity_path(a::Q, b::Q, ylo::Q, yhi::Q, y0::Q, s::Q, nmax::Int)
    fold(v, w) = (r = mod(v, 2w); r > w ? 2w - r : r)
    pts = Tuple{Q,Q}[(0 // 1, y0)]; contacts = Int[0]; ts = Q[0]
    total = 0; exited = false
    tmax = Q(a)     # grow the window until the path ends inside it
    while true
        cross = Dict{Q,Int}()   # t => number of walls met at t
        m = 1
        while a * m <= tmax; cross[a * m] = get(cross, a * m, 0) + 1; m += 1; end
        if s != 0
            jlo = Int(floor(min(y0, y0 + s * tmax) / b)); jhi = Int(ceil(max(y0, y0 + s * tmax) / b))
            for j in jlo:jhi
                t = (b * j - y0) / s
                (t > 0 && t <= tmax) && (cross[t] = get(cross, t, 0) + 1)
            end
        end
        tlist = sort(collect(keys(cross)))
        pts = Tuple{Q,Q}[(0 // 1, y0)]; contacts = Int[0]; ts = Q[0]; total = 0; exited = false
        done = false
        for t in tlist
            x = fold(t, a); y = fold(y0 + s * t, b)
            k = cross[t]
            if k == 1 && x == 0 && ylo < y < yhi
                push!(pts, (x, y)); push!(contacts, 0); push!(ts, t); exited = true; done = true; break
            end
            total += k
            push!(pts, (x, y)); push!(contacts, k); push!(ts, t)
            if total >= nmax; done = true; break; end
        end
        done && break
        tmax *= 2
    end
    speed = sqrt(B(1) + B(s)^2)
    (points = pts, contacts = contacts, lengths = [B(t) * speed for t in ts], exited = exited)
end

end # module
