# Reference implementation for the kernel web/src/kernels/hydrogen.ts (chapter C11).
#
# Independent of evidence/derivations/c11/check_hydrogen.py (Python/SymPy) and of the
# TypeScript kernel: nothing is imported from either, and the functions here are built
# from the GENERAL formulas of evidence/derivations/c11/DERIVATION.md (Results 3.1, 3.2,
# 4.1, 7.1, 7.2, 1b.1), whereas the kernel uses the expanded closed forms of Results 5.1
# and 7.2. Agreement of the two is therefore a check of both.
#
# Conventions (DERIVATION.md): Z = 1; lengths in a_mu = a_0 (1 + m_e/m_p), x = r / a_mu;
# R in a_mu^(-3/2), psi in a_mu^(-3/2), densities in a_mu^(-3); Condon-Shortley phases.
#
# Arithmetic: polynomials have coefficients in Rational{BigInt}; norms, moments, CDF tail
# polynomials, orthogonality and the radial equation are checked exactly. Transcendental
# values (exp, sqrt, pi) are evaluated in BigFloat at 256 bits.
module Hydrogen

export Q, Poly, laguerre, radial_poly, radial_norm2, R, radial_density_poly, tail_poly,
       cdf, radial_density, moment, legendre, ylm_parts, ylm, psi, psi_real,
       theta_density_poly, theta_cdf_poly, quantile_radius, gauss_legendre,
       i0_scaled, i2_scaled, i0_series, i2_series, i0_closed, i2_closed, quad_gl, lab_harmonic, lab_direct_axis, lab_direct_3d,
       peval, pmul, padd, pscale, pderiv, pint, pcompose_linear, radial_roots, radial_maxima

const Q = Rational{BigInt}
const Poly = Vector{Q}          # p[i] is the coefficient of x^(i-1)

setprecision(BigFloat, 256)

# ── exact polynomial arithmetic ─────────────────────────────────────────────────────────
ptrim(p::Poly) = (q = copy(p); while length(q) > 1 && q[end] == 0; pop!(q); end; q)
function padd(a::Poly, b::Poly)
    n = max(length(a), length(b)); c = zeros(Q, n)
    c[1:length(a)] .+= a; c[1:length(b)] .+= b
    ptrim(c)
end
pscale(a::Poly, s) = ptrim(Q(s) .* a)
function pmul(a::Poly, b::Poly)
    c = zeros(Q, length(a) + length(b) - 1)
    for i in eachindex(a), j in eachindex(b); c[i + j - 1] += a[i] * b[j]; end
    ptrim(c)
end
pderiv(a::Poly) = length(a) == 1 ? Q[0] : ptrim(Q[(i - 1) * a[i] for i in 2:length(a)])
pint(a::Poly) = ptrim(vcat(Q[0], Q[a[i] // i for i in eachindex(a)]))     # antiderivative, zero at 0
"p(c x)"
pcompose_linear(a::Poly, c) = ptrim(Q[a[i] * Q(c)^(i - 1) for i in eachindex(a)])
function peval(a::Poly, x)
    s = zero(x) + a[end]
    for i in length(a)-1:-1:1; s = s * x + a[i]; end
    s
end
fact(n::Integer) = factorial(big(n))

# ── Result 3.1: associated Laguerre polynomial, finite sum ──────────────────────────────
"L_k^(alpha)(s) = sum_j (-1)^j binom(k+alpha, k-j) s^j / j!"
laguerre(k::Integer, alpha::Integer) = Q[(-1)^j * binomial(big(k + alpha), big(k - j)) // fact(j) for j in 0:k]

# ── Result 3.2: R_nl(x) = sqrt(N2) P(x) exp(-x/n), x = r/a_mu, kappa_n = 1/n ────────────
"P(x) = (2x/n)^l L_{n-l-1}^{(2l+1)}(2x/n)"
function radial_poly(n::Integer, l::Integer)
    @assert n >= 1 && 0 <= l < n
    L = pcompose_linear(laguerre(n - l - 1, 2l + 1), 2 // n)
    mono = zeros(Q, l + 1); mono[end] = (2 // big(n))^l
    pmul(mono, L)
end
"N_nl^2 a_mu^3 = (n-l-1)! (2/n)^3 / (2n (n+l)!)"
radial_norm2(n::Integer, l::Integer) = fact(n - l - 1) * (2 // big(n))^3 // (2n * fact(n + l))

"R_nl(x) in a_mu^(-3/2), BigFloat"
R(n, l, x) = sqrt(BigFloat(radial_norm2(n, l))) * peval(radial_poly(n, l), BigFloat(x)) * exp(-BigFloat(x) / n)

"D(x) with x^2 R^2 = D(x) exp(-2x/n)"
radial_density_poly(n, l) = pscale(pmul(Q[0, 0, 1], pmul(radial_poly(n, l), radial_poly(n, l))), radial_norm2(n, l))
radial_density(n, l, x) = peval(radial_density_poly(n, l), BigFloat(x)) * exp(-2 * BigFloat(x) / n)

"int_0^inf x^s x^2 R^2 dx, exact: sum_j d_j (j+s)! / beta^(j+s+1), beta = 2/n (needs j+s >= 0)"
function moment(n, l, s::Integer)
    d = radial_density_poly(n, l); beta = 2 // big(n)
    sum(d[j + 1] == 0 ? Q(0) : d[j + 1] * fact(j + s) // beta^(j + s + 1) for j in 0:length(d)-1)
end

# ── Result 7.2: F = 1 - exp(-2x/n) Q(x) ─────────────────────────────────────────────────
"Q_nl(x) = sum_j d_j j!/beta^(j+1) sum_{h<=j} (beta x)^h / h!"
function tail_poly(n, l)
    d = radial_density_poly(n, l); beta = 2 // big(n)
    q = Q[0]
    for j in 0:length(d)-1
        d[j + 1] == 0 && continue
        inner = Q[beta^h // fact(h) for h in 0:j]
        q = padd(q, pscale(inner, d[j + 1] * fact(j) // beta^(j + 1)))
    end
    q
end
cdf(n, l, x) = 1 - exp(-2 * BigFloat(x) / n) * peval(tail_poly(n, l), BigFloat(x))

"x with F_nl(x) = p: bisection on the closed-form CDF in BigFloat, to 2^-200 relative width"
function quantile_radius(n, l, p)
    p = BigFloat(p); @assert 0 < p < 1
    lo = BigFloat(0); hi = BigFloat(n * n)
    while cdf(n, l, hi) < p; hi *= 2; end
    while hi - lo > hi * BigFloat(2)^(-200)
        mid = (lo + hi) / 2
        cdf(n, l, mid) < p ? (lo = mid) : (hi = mid)
    end
    (lo + hi) / 2
end

"real roots of a polynomial in (a, b) by sign changes on a grid of `steps` cells and bisection (BigFloat)"
function roots_in(p::Poly, a, b; steps = 20000)
    xs = [BigFloat(a) + (BigFloat(b) - a) * i / steps for i in 0:steps]
    out = BigFloat[]
    for i in 1:steps
        fa = peval(p, xs[i]); fb = peval(p, xs[i + 1])
        if fa == 0 && i > 1
            push!(out, xs[i])
        elseif fa * fb < 0
            lo, hi = xs[i], xs[i + 1]
            for _ in 1:400
                mid = (lo + hi) / 2
                peval(p, lo) * peval(p, mid) <= 0 ? (hi = mid) : (lo = mid)
            end
            push!(out, (lo + hi) / 2)
        end
    end
    out
end
"nodes of R_nl at x > 0"
radial_roots(n, l) = roots_in(radial_poly(n, l), big"1e-9", 60 * n)
"local maxima of x^2 R^2 = D exp(-beta x): zeros of D' - beta D where the sign goes + to -; returns (x, value) sorted by value, largest first"
function radial_maxima(n, l)
    d = radial_density_poly(n, l)
    g = padd(pderiv(d), pscale(d, -2 // big(n)))
    xs = roots_in(g, big"1e-9", 60 * n)
    mx = [(x, radial_density(n, l, x)) for x in xs if peval(g, x - big"1e-6") > 0 && peval(g, x + big"1e-6") < 0]
    sort(mx; by = t -> -t[2])
end

# ── Result 4.1: spherical harmonics, Condon-Shortley ────────────────────────────────────
"P_l(t) = 1/(2^l l!) d^l/dt^l (t^2-1)^l"
function legendre(l::Integer)
    p = Q[1]
    for _ in 1:l; p = pmul(p, Q[-1, 0, 1]); end
    for _ in 1:l; p = pderiv(p); end
    pscale(p, 1 // (big(2)^l * fact(l)))
end
"""
Y_l^m = sign * sqrt(c2pi / pi) * (1 - t^2)^(|m|/2) * p(t) * exp(i m phi), t = cos(theta).
For m >= 0 the sign is (-1)^m; Y_l^{-m} = (-1)^m conj(Y_l^m), so for m < 0 the sign is +1.
Returns (sign, c2pi, p, |m|).
"""
function ylm_parts(l::Integer, m::Integer)
    @assert l >= 0 && abs(m) <= l
    am = abs(m)
    p = legendre(l)
    for _ in 1:am; p = pderiv(p); end
    c2pi = Q(2l + 1) // 4 * fact(l - am) // fact(l + am)
    sign = m > 0 ? (-1)^m : 1
    (sign, c2pi, p, am)
end
function ylm(l, m, theta, phi)
    sign, c2pi, p, am = ylm_parts(l, m)
    t = cos(BigFloat(theta)); st = sin(BigFloat(theta))
    mag = sign * sqrt(BigFloat(c2pi) / BigFloat(pi)) * st^am * peval(p, t)
    mag * cis(m * BigFloat(phi))
end
"density of t = cos(theta) under |Y_l^m|^2 dOmega: h(t) = 2 c2pi (1-t^2)^|m| p(t)^2 (phi integrated: factor 2 pi / pi)"
function theta_density_poly(l, m)
    _, c2pi, p, am = ylm_parts(l, m)
    w = Q[1]
    for _ in 1:am; w = pmul(w, Q[1, 0, -1]); end
    pscale(pmul(w, pmul(p, p)), 2 * c2pi)
end
"H(t) = int_{-1}^t h, as a polynomial"
function theta_cdf_poly(l, m)
    a = pint(theta_density_poly(l, m))
    padd(a, Q[-peval(a, Q(-1))])
end

"psi_nlm at spherical coordinates (x = r/a_mu, theta, phi), in a_mu^(-3/2)"
psi(n, l, m, x, theta, phi) = R(n, l, x) * ylm(l, m, theta, phi)

"""
The real 2p combinations as DECLARED superpositions (they are not m-eigenstates):
  p_x = (psi_{n,1,-1} - psi_{n,1,+1}) / sqrt 2,   p_y = i (psi_{n,1,-1} + psi_{n,1,+1}) / sqrt 2.
With Result 4.1, Y_1^{-1} - Y_1^{+1} = sqrt(3/(8 pi)) sin(theta) (e^{-i phi} + e^{i phi}), so
p_x has angular factor sqrt(3/(4 pi)) sin(theta) cos(phi) = sqrt(3/(4 pi)) x/r, and likewise
p_y has sqrt(3/(4 pi)) sin(theta) sin(phi) = sqrt(3/(4 pi)) y/r.
"""
function psi_real(n, which::Symbol, x, theta, phi)
    a = psi(n, 1, -1, x, theta, phi); b = psi(n, 1, 1, x, theta, phi)
    which === :px ? (a - b) / sqrt(BigFloat(2)) :
    which === :py ? im * (a + b) / sqrt(BigFloat(2)) : error("unknown real orbital $which")
end

# ── Gauss-Legendre rule (verified by its exactness in the tests, not by its formula) ────
"nodes and weights on [-1, 1]; Newton on P_n evaluated by the three-term recurrence"
function gauss_legendre(n::Integer)
    xs = BigFloat[]; ws = BigFloat[]
    for i in 1:n
        x = cos(BigFloat(pi) * (i - big"0.25") / (n + big"0.5"))
        dp = BigFloat(0)
        for _ in 1:200
            p0 = BigFloat(1); p1 = x
            for k in 2:n
                p0, p1 = p1, ((2k - 1) * x * p1 - (k - 1) * p0) / k
            end
            dp = n * (x * p1 - p0) / (x^2 - 1)
            dx = p1 / dp
            x -= dx
            abs(dx) < big"1e-70" && break
        end
        push!(xs, x); push!(ws, 2 / ((1 - x^2) * dp^2))
    end
    xs, ws
end
"composite Gauss-Legendre on [a, b] with `panels` equal panels of `order` nodes"
function quad_gl(f, a, b; panels = 8, order = 40, rule = gauss_legendre(order))
    xs, ws = rule
    a = BigFloat(a); b = BigFloat(b); h = (b - a) / panels
    s = BigFloat(0)
    for k in 0:panels-1
        c = a + h * (k + big"0.5")
        for i in eachindex(xs); s += ws[i] * f(c + h / 2 * xs[i]); end
    end
    s * h / 2
end

# ── Result 1b.1: laboratory electron density for a Gaussian centre-of-mass packet ───────
#
# f(R) = (pi sigma^2)^(-3/2) exp(-|R|^2 / sigma^2),  rho_e(x) = int f(x - b r) g(r) d^3r,
# b = m_p / M = 1 / (1 + q), q = m_e / m_p.
#
# For a relative density g(r) = R_nl(r)^2 / (4 pi) * (1 + c P_2(rhat . e)) (c = 0 for s
# states, c = 2 for |Y_1^0|^2 about its axis e, c = -1 for |Y_1^{+-1}|^2; these follow from
# Result 4.1: 3 t^2 = 1 + 2 P_2(t), (3/2)(1 - t^2) = 1 - P_2(t)):
#
#   |x - b r|^2 = x^2 + b^2 r^2 - 2 b x r (n . rhat),  n = x/|x|,  z := 2 b x r / sigma^2,
#   int dOmega exp(z n.rhat)                 = 2 pi int_-1^1 e^{zt} dt          = 4 pi i_0(z),
#   int dOmega exp(z n.rhat) P_2(rhat . e)   = 2 pi int_-1^1 e^{zt} P_2(t) dt P_2(n . e)
#                                            = 4 pi i_2(z) P_2(n . e).
# The second line: T_ij := int dOmega K(n.rhat) rhat_i rhat_j is a symmetric tensor built
# from n alone, so T_ij = A delta_ij + B n_i n_j; trace: 3A + B = 2 pi int K; contraction
# with n n: A + B = 2 pi int K t^2. Hence int K P_2(rhat.e) = (3/2)(A + B (n.e)^2) - (3A+B)/2
# = B P_2(n.e) with B = 2 pi int K (3t^2-1)/2 dt.
#   i_0(z) = sinh z / z,   i_2(z) = (1/2) int_-1^1 e^{zt} P_2(t) dt = sinh z/z - 3 cosh z/z^2 + 3 sinh z/z^3
# (from int t^2 e^{zt} dt = d^2/dz^2 (2 sinh z / z)).
#
#   rho_e(x) = A_0(|x|) + c A_2(|x|) P_2(n . e),
#   A_L(x)   = (pi sigma^2)^(-3/2) int_0^inf r^2 R_nl(r)^2 exp(-(x - b r)^2 / sigma^2) [e^{-z} i_L(z)] dr.
#
# Here the series are used for i_L (independent of the closed forms the kernel uses):
#   e^{zt} = sum z^k t^k / k!,  (1/2) int t^k dt = 1/(k+1) (k even),  (1/2) int t^k P_2 dt = k/((k+1)(k+3)) (k even).
function i0_series(z::BigFloat)
    z == 0 && return BigFloat(1)
    s = BigFloat(0); term = BigFloat(1); k = 0
    while true
        add = term / (k + 1); s += add
        (abs(add) < abs(s) * big"1e-70" && k > 2) && break
        k += 2; term *= z * z / (k * (k - 1))
    end
    s * exp(-z)
end
function i2_series(z::BigFloat)
    z == 0 && return BigFloat(0)
    s = BigFloat(0); term = z * z / 2; k = 2
    while true
        add = term * k / ((k + 1) * (k + 3)); s += add
        (abs(add) < abs(s) * big"1e-70" && k > 4) && break
        k += 2; term *= z * z / (k * (k - 1))
    end
    s * exp(-z)
end
"e^{-z} i_0(z) and e^{-z} i_2(z) from the closed forms (accurate in BigFloat for z not small)"
i0_closed(z::BigFloat) = (1 - exp(-2z)) / (2z)
i2_closed(z::BigFloat) = (1 - exp(-2z)) / (2z) * (1 + 3 / z^2) - 3 * (1 + exp(-2z)) / (2 * z^2)
"series up to z = 30 (all terms positive, no cancellation), closed form above (the series would need about e z terms)"
i0_scaled(z::BigFloat) = z <= 30 ? i0_series(z) : i0_closed(z)
i2_scaled(z::BigFloat) = z <= 30 ? i2_series(z) : i2_closed(z)
"A_L(x), L in (0, 2), for the radial function (n, l); lengths in a_mu"
function lab_harmonic(n, l, L, sigma, b, x; rule = gauss_legendre(40))
    sigma = BigFloat(sigma); b = BigFloat(b); x = BigFloat(x)
    iL = L == 0 ? i0_scaled : L == 2 ? i2_scaled : error("L must be 0 or 2")
    f(r) = (z = 2 * b * x * r / sigma^2; radial_density(n, l, r) * exp(-(x - b * r)^2 / sigma^2) * iL(z))
    # the Gaussian window is centred at r = x/b with width sigma/b; split there
    c = x / b; w = 14 * sigma / b
    # outside |r - c| <= w the integrand is below exp(-196) of its peak value
    cuts = sort(unique([max(BigFloat(0), c - w), c, c + w]))
    s = BigFloat(0)
    for i in 1:length(cuts)-1
        s += quad_gl(f, cuts[i], cuts[i + 1]; panels = 10, rule)
    end
    s / (BigFloat(pi) * sigma^2)^(big"1.5")
end
"""
Direct check of the same density without the harmonic reduction: the point x lies ON the
axis e (n . e = 1), so the integrand is symmetric about that axis and
  rho_e = (pi sigma^2)^(-3/2) int_0^inf r^2 dr int_-1^1 dt 2 pi exp(-(x^2 + b^2 r^2 - 2 b x r t)/sigma^2) R^2/(4 pi) (1 + c P_2(t)).
"""
function lab_direct_axis(n, l, c, sigma, b, x; rule = gauss_legendre(40), rmax = 60)
    sigma = BigFloat(sigma); b = BigFloat(b); x = BigFloat(x)
    inner(r) = quad_gl(t -> exp(-(x^2 + b^2 * r^2 - 2 * b * x * r * t) / sigma^2) * (1 + c * (3 * t^2 - 1) / 2), -1, 1; panels = 6, rule)
    f(r) = radial_density(n, l, r) * inner(r) / 2
    quad_gl(f, 0, rmax; panels = 30, rule) / (BigFloat(pi) * sigma^2)^(big"1.5")
end
"""
Direct three-dimensional check at a point PERPENDICULAR to the axis (n . e = 0): spherical
coordinates of r about e, x along the first axis,
  |x - b r|^2 = x^2 + b^2 r^2 - 2 b x r sqrt(1-t^2) cos(phi).
Double precision, composite Gauss-Legendre in r (over the window |r - x/b| <= 7 sigma/b,
outside of which the Gaussian factor is below exp(-49)), t and phi: a check of the
harmonic reduction by a method that does not use it, not a high-precision value.
"""
function lab_direct_3d(n, l, c, sigma, b, x; order = 24)
    sigma = Float64(sigma); b = Float64(b); x = Float64(x)
    xs, ws = gauss_legendre(order); xs = Float64.(xs); ws = Float64.(ws)
    function q(f, lo, hi, panels)
        h = (hi - lo) / panels; s = 0.0
        for k in 0:panels-1
            mid = lo + h * (k + 0.5)
            for i in eachindex(xs); s += ws[i] * f(mid + h / 2 * xs[i]); end
        end
        s * h / 2
    end
    P = Float64.(radial_density_poly(n, l))
    dens(r) = evalpoly(r, P) * exp(-2r / n)
    function fr(r)
        ft(t) = (1 + c * (3 * t^2 - 1) / 2) *
                q(ph -> exp(-(x^2 + b^2 * r^2 - 2 * b * x * r * sqrt(1 - t^2) * cos(ph)) / sigma^2), -pi, pi, 16)
        dens(r) / (4pi) * q(ft, -1.0, 1.0, 12)
    end
    q(fr, max(0.0, x / b - 7 * sigma / b), x / b + 7 * sigma / b, 8) / (pi * sigma^2)^1.5
end

end # module
