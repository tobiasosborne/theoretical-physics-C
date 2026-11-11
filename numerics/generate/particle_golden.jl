# Writes the golden values of the kernel web/src/kernels/particle.ts (chapter c05, demos
# c05.demo.zerfliessen and c05.demo.detektor):
#
#   julia --project=numerics numerics/generate/particle_golden.jl            # write web/tests/golden/particle.json
#   julia --project=numerics numerics/generate/particle_golden.jl --check    # exit 1 unless that file is reproduced
#
# Standard library only. INDEPENDENT OF THE KERNEL'S CLOSED FORMS, by construction:
# - Psi(x,t) of the free packet by trapezoidal quadrature in BigFloat of c05.eq.freieloesung,
#   Psi(x,t) = (2 pi)^(-1/2) int PsiT(k) exp(i (k x - k^2 t)) dk, with the weights PsiT(k) themselves
#   obtained by trapezoidal quadrature of c05.eq.phik from the initial packet (the kernel: the closed
#   forms D1 and D2 of docs/plan/lec78/DEMOS.md). The integrands are smooth and decay like Gaussians,
#   so the trapezoidal rule converges geometrically; selfcheck() halves the step and compares.
# - sigma_t by the second moment of the position density computed in MOMENTUM space, x = i d/dk on
#   phi(k) = PsiT(k) exp(-i k^2 t) (PsiT in the closed form D1, itself checked against the quadrature
#   of c05.eq.phik), with a central difference for the derivative (the kernel: the
#   closed form sigma sqrt(1 + t^2/sigma^4)); checked against sqrt(5)/2, sqrt(17)/2, sqrt(5) at the
#   crossing times of the three packets of c05.fig.fourier.
# - interval probabilities by Romberg integration of |Psi|^2 formed from the COMPLEX Psi, carrier
#   included (the kernel: erfc tails, or Gauss-Legendre on a narrow strip).
# Units as in the kernel: lengths sigma0, wave numbers 1/sigma0, times tau0 = 2 m sigma0^2/hbar.
#
# TOLERANCE: abs 1e-12, rel 1e-10, an UNVALIDATED CHOICE above double rounding of the closed forms
# and far below the at most four decimals the demos display.
module ParticleGolden
using Printf

const DEFAULT_FILE = normpath(joinpath(@__DIR__, "..", "..", "web", "tests", "golden", "particle.json"))
const PREC = 128

num(x::Real) = (y = Float64(x); isfinite(y) || error("non-finite value"); y == 0 ? "0" : repr(y))
cnum(z) = "[" * num(real(z)) * ", " * num(imag(z)) * "]"

big_(x) = BigFloat(x)
const B = BigFloat

# initial packet (lecture 7 exercise): (2 pi sigma^2)^(-1/4) exp(-(x-a)^2/(4 sigma^2)) exp(i k0 x)
psi0(x, σ, a, k0) = (2 * B(pi) * σ^2)^(-B(1) / 4) * exp(-(x - a)^2 / (4σ^2)) * cis(k0 * x)

trap(f, lo, hi, n) = (h = (hi - lo) / n; h * (sum(f(lo + j * h) for j in 1:n-1) + (f(lo) + f(hi)) / 2))

# PsiT(k) by quadrature of c05.eq.phik over x in [a - L, a + L]
function psiT(k, σ, a, k0; n = 400)
    L = 14 * σ
    trap(x -> psi0(x, σ, a, k0) * cis(-k * x), a - L, a + L, n) / sqrt(2 * B(pi))
end

# Psi(x,t) by quadrature of c05.eq.freieloesung; the weights on a fixed k grid
struct Weights; ks::Vector{BigFloat}; w::Vector{Complex{BigFloat}}; h::BigFloat end
function weights(σ, a, k0; n = 1200)
    L = 13 / σ
    lo = k0 - L; h = 2L / n
    ks = [lo + j * h for j in 0:n]
    Weights(ks, [psiT(k, σ, a, k0) for k in ks], h)
end
function freepsi(W::Weights, x, t)
    s = zero(Complex{BigFloat})
    n = length(W.ks)
    for j in 1:n
        f = W.w[j] * cis(W.ks[j] * x - W.ks[j]^2 * t)
        s += (j == 1 || j == n) ? f / 2 : f
    end
    s * W.h / sqrt(2 * B(pi))
end

# PsiT in closed form (D1 of DEMOS.md; the momentumPhi cases check it against psiT at t = 0)
psiT_closed(k, σ, a, k0) = (2σ^2 / B(pi))^(B(1) / 4) * exp(-σ^2 * (k - k0)^2) * cis(-(k - k0) * a)

# second moment of |Psi(x,t)|^2 from phi(k) = PsiT(k) exp(-i k^2 t), x = i d/dk (k grid, central differences)
function width_from_momentum(σ, a, k0, t; n = 800)
    L = 12 / σ
    hd = B(10)^-12
    φ(k) = psiT_closed(k, σ, a, k0) * cis(-k^2 * t)
    dφ(k) = (φ(k + hd) - φ(k - hd)) / (2hd)
    m1 = real(trap(k -> conj(φ(k)) * im * dφ(k), k0 - L, k0 + L, n))
    m2 = trap(k -> abs2(dφ(k)), k0 - L, k0 + L, n)
    sqrt(m2 - m1^2), m1
end

# Romberg on [lo, hi]
function romberg(f, lo, hi; levels = 16)
    R = Vector{BigFloat}(undef, levels)
    h = hi - lo
    R[1] = h * (f(lo) + f(hi)) / 2
    prev = copy(R)
    for i in 2:levels
        h /= 2
        Rn = Vector{BigFloat}(undef, i)
        Rn[1] = prev[1] / 2 + h * sum(f(lo + (2j - 1) * h) for j in 1:2^(i - 2))
        for m in 2:i
            Rn[m] = Rn[m-1] + (Rn[m-1] - prev[m-1]) / (B(4)^(m - 1) - 1)
        end
        prev = Rn
        if i > 6 && abs(Rn[i] - Rn[i-1]) < B(10)^-40
            return Rn[i]
        end
    end
    prev[end]
end

gauss_state(x, k) = psi0(x, B(1), B(0), k)
box_state(x, k) = abs(x) <= 1 ? cis(k * x) / sqrt(B(2)) : zero(Complex{BigFloat})

function cases()
    out = String[]
    # ── free packet: Psi, |Psi|^2 ──
    for σr in (1 // 2, 1, 2), (ar, k0r) in ((0, 0), (-1, 3 // 4), (1 // 2, -1))
        σ, a, k0 = B(σr), B(ar), B(k0r)
        W = weights(σ, a, k0)
        for tr in (0, 1 // 2, 1, 2)
            t = B(tr)
            st = σ * sqrt(1 + t^2 / σ^4)     # only to place the sample points
            c = a + 2k0 * t
            for x in (c, c + st, c - st, c + 3st, c - 3st, c + 5st)
                ψ = freepsi(W, x, t)
                push!(out, @sprintf("    {\"fn\": \"freePsi\", \"x\": %s, \"t\": %s, \"sigma\": %s, \"a\": %s, \"k0\": %s, \"expected\": %s}",
                    num(x), num(t), num(σ), num(a), num(k0), cnum(ψ)))
                push!(out, @sprintf("    {\"fn\": \"freeDensity\", \"x\": %s, \"t\": %s, \"sigma\": %s, \"a\": %s, \"k0\": %s, \"expected\": %s}",
                    num(x), num(t), num(σ), num(a), num(k0), num(abs2(ψ))))
            end
        end
        # momentum wave function at t = 0, 1
        for tr in (0, 1), u in (k0, k0 + 1 / (2σ), k0 - 1 / σ, k0 + 2 / σ)
            t = B(tr)
            φ = psiT(u, σ, a, k0) * cis(-u^2 * t)
            push!(out, @sprintf("    {\"fn\": \"momentumPhi\", \"u\": %s, \"t\": %s, \"sigma\": %s, \"a\": %s, \"k0\": %s, \"expected\": %s}",
                num(u), num(t), num(σ), num(a), num(k0), cnum(φ)))
            push!(out, @sprintf("    {\"fn\": \"momentumDensity\", \"u\": %s, \"sigma\": %s, \"k0\": %s, \"expected\": %s}",
                num(u), num(σ), num(k0), num(abs2(φ))))
        end
    end
    # ── widths at the crossing times (sigma1 sigma2 tau0): sqrt5/2, sqrt17/2, sqrt5 ──
    for (σr, tr) in ((1 // 2, 1 // 2), (1, 1 // 2), (1 // 2, 1), (2, 1), (1, 2), (2, 2), (1 // 2, 2), (1, 0), (1, 1))
        σ, t = B(σr), B(tr)
        w, _ = width_from_momentum(σ, B(0), B(0), t)
        push!(out, @sprintf("    {\"fn\": \"spreadWidth\", \"sigma\": %s, \"t\": %s, \"expected\": %s}", num(σ), num(t), num(w)))
    end
    # ── detector ──
    for k in (0, 3, 6)
        P = romberg(x -> abs2(gauss_state(x, B(k))), B(-0.5), B(1.5))
        push!(out, @sprintf("    {\"fn\": \"intervalProbability\", \"state\": \"gauss\", \"k\": %d, \"a\": -0.5, \"b\": 1.5, \"expected\": %s}", k, num(P)))
    end
    P = romberg(x -> abs2(gauss_state(x, B(3))), B(-1.9), B(-1.7))
    push!(out, "    {\"fn\": \"intervalProbability\", \"state\": \"gauss\", \"k\": 3, \"a\": -1.9, \"b\": -1.7, \"expected\": $(num(P))}")
    for e in 1:6
        ε = B(10)^-e
        c = B(-1.8)
        P = romberg(x -> abs2(gauss_state(x, B(3))), c - ε / 2, c + ε / 2)
        push!(out, @sprintf("    {\"fn\": \"stripRatio\", \"state\": \"gauss\", \"c\": -1.8, \"eps\": %s, \"expected\": %s}", num(ε), num(P / ε)))
    end
    push!(out, "    {\"fn\": \"stateDensity\", \"state\": \"gauss\", \"x\": -1.8, \"expected\": $(num(abs2(gauss_state(B(-1.8), B(3)))))}")
    for (a, b) in ((-0.5, 1.5), (0.9, 1.1), (-3, 3), (1.2, 2))
        lo, hi = max(B(a), B(-1)), min(B(b), B(1))   # integrate between the jumps at +-1
        Pexact = hi > lo ? romberg(x -> abs2(box_state(x, B(3))), lo, hi) : B(0)
        push!(out, @sprintf("    {\"fn\": \"intervalProbability\", \"state\": \"box\", \"k\": 3, \"a\": %s, \"b\": %s, \"expected\": %s}", num(a), num(b), num(Pexact)))
    end
    out
end

function selfcheck()
    setprecision(BigFloat, PREC) do
        σ, a, k0 = B(1) / 2, B(-1), B(3) / 4
        x, t = B(1.3), B(1)
        ψ1 = freepsi(weights(σ, a, k0; n = 1200), x, t)
        ψ2 = freepsi(weights(σ, a, k0; n = 2400), x, t)
        abs(ψ1 - ψ2) < B(10)^-25 || error("selfcheck: quadrature of the free packet not converged: $(Float64(abs(ψ1 - ψ2)))")
        for (σr, tr, w) in ((1 // 2, 1 // 2, sqrt(B(5)) / 2), (1 // 2, 1, sqrt(B(17)) / 2), (1, 2, sqrt(B(5))), (2, 2, sqrt(B(5))))
            got, m1 = width_from_momentum(B(σr), B(0), B(0), B(tr))
            abs(got - w) < B(10)^-15 || error("selfcheck: width at sigma=$σr t=$tr is $(Float64(got)), expected $(Float64(w))")
            abs(m1) < B(10)^-15 || error("selfcheck: mean position not zero")
        end
        P = romberg(x -> abs2(gauss_state(x, B(6))), B(-0.5), B(1.5))
        abs(P - B("0.624655260005155")) < B(10)^-14 || error("selfcheck: P[-0.5,1.5] = $(Float64(P))")
    end
end

function document()
    body = setprecision(() -> cases(), BigFloat, PREC)
    """{
  "kernel": "particle",
  "reference": {"implementation": "Julia $(VERSION), BigFloat ($(PREC) bits) quadrature", "script": "numerics/generate/particle_golden.jl"},
  "tolerance": {"abs": 1e-12, "rel": 1e-10, "note": "an unvalidated choice above double rounding of the kernel's closed forms and far below the four decimals the demos display"},
  "cases": [
$(join(body, ",\n"))
  ]
}
"""
end

function main(args)
    selfcheck()
    file = DEFAULT_FILE
    i = findfirst(==("--file"), args)
    i === nothing || (file = args[i+1])
    doc = document()
    if "--check" in args
        old = isfile(file) ? read(file, String) : ""
        if old != doc
            println(stderr, "particle_golden: $(file) is not reproduced by this script")
            exit(1)
        end
        println("particle_golden: $(file) reproduced")
    else
        write(file, doc)
        println("particle_golden: wrote $(file)")
    end
end

end # module

ParticleGolden.main(ARGS)
