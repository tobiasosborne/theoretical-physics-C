# Writes the golden values of the chapter-c00 kernels:
#
#   julia --project=numerics numerics/generate/c00_golden.jl            # write the three files
#   julia --project=numerics numerics/generate/c00_golden.jl --check    # exit 1 unless all three are reproduced
#   julia --project=numerics numerics/generate/c00_golden.jl --check --dir PATH   # check files in another directory
#
#   web/tests/golden/planck.json      kernel web/src/kernels/planck.ts     (demo c00.demo.planck)
#   web/tests/golden/photo.json       kernel web/src/kernels/photo.ts      (demo c00.demo.photoeffekt)
#   web/tests/golden/c00cavity.json   kernel web/src/kernels/c00cavity.ts  (demo c00.demo.hohlraum)
#
# Values come from numerics/src/c00_reference.jl (BigFloat at 256 bits; the cavity in exact
# Rational{BigInt}); constants from sources/codata-2022/allascii.txt. Every value is written
# as the nearest double in shortest round-trip form; inputs are doubles, and the reference
# converts each input double exactly (the cavity inputs are decimal strings, read as exact
# rationals: the kernel receives the nearest doubles).
#
# TOLERANCES. The reference values are correct to the last digit of a double. The tolerances
# are what the double-precision kernels are held to. Each is an UNVALIDATED CHOICE (no
# rounding-error bound is derived for the kernels), set above the deviations measured when
# the kernels were written (the tests print the measured maxima) and far below anything a
# picture or a readout of four digits can resolve.
include(joinpath(@__DIR__, "..", "src", "c00_reference.jl"))
module C00Golden
using ..C00Reference
using ..C00Reference: C, H, KB, CL, E, ME, Q, B
using Printf

const DEFAULT_DIR = normpath(joinpath(@__DIR__, "..", "..", "web", "tests", "golden"))

num(x::Real) = (y = Float64(x isa Rational ? BigFloat(x) : x); isfinite(y) || error("non-finite value"); y == 0 ? "0" : repr(y))
arr(v) = "[" * join((x isa AbstractVector || x isa Tuple ? arr(x) : num(x) for x in v), ", ") * "]"
iarr(v) = "[" * join(string.(v), ", ") * "]"
const IMPL = "Julia $(VERSION), BigFloat at $(precision(BigFloat)) bits and Rational{BigInt}, standard library only"
const SRC = "sources/codata-2022/allascii.txt"
cline(name) = C[name].line

function constants_case(names, keys)
    """{"fn": "constants", "tol": "constants", "names": [$(join(("\"$k\"" for k in keys), ", "))], "codata_lines": $(iarr([cline(n) for n in names])), "expected": $(arr([C[n].value for n in names]))}"""
end

# ── planck.json ───────────────────────────────────────────────────
function planck()
    cases = String[]; add(s) = push!(cases, "    " * s)
    add(constants_case(["Planck constant", "Boltzmann constant", "speed of light in vacuum"], ["h_J_s", "k_B_J_per_K", "c_m_per_s"]))
    XS = [1e-12, 1e-8, 1e-4, 0.01, 0.1, 0.5, 1.0, 2.0, 2.8214393721220787, 5.0, 10.0, 30.0, 100.0, 500.0]
    add("""{"fn": "ratio", "tol": "eval", "x": $(arr(XS)), "expected": $(arr([ratio(x) for x in XS]))}""")
    add("""{"fn": "ratio", "tol": "eval", "x": [0], "expected": [1], "note": "the limit at x = 0"}""")
    add("""{"fn": "lowerBound", "tol": "eval", "x": $(arr(XS)), "expected": $(arr([lower_bound(x) for x in XS]))}""")
    add("""{"fn": "upperBound", "tol": "eval", "x": $(arr(XS)), "expected": $(arr([upper_bound(x) for x in XS]))}""")
    SS = [0.01, 0.25, 1.0, 1.45, 2.8214393721220787, 4.0, 7.2]
    for tau in [1.0, 5 / 6, 2 / 3, 0.25, 1.5]
        add("""{"fn": "reducedU", "tol": "eval", "tau": $(num(tau)), "s": $(arr(SS)), "expected": $(arr([reduced_u(s, tau) for s in SS]))}""")
        add("""{"fn": "reducedUkl", "tol": "eval", "tau": $(num(tau)), "s": $(arr(SS)), "expected": $(arr([reduced_ukl(s, tau) for s in SS]))}""")
    end
    NUS = [1e11, 1e12, 1e13, 1e14, 3.5e14, 1e15, 3e15]
    for T in [300.0, 4000.0, 6000.0]
        add("""{"fn": "exponentX", "tol": "eval", "T": $(num(T)), "nu": $(arr(NUS)), "expected": $(arr([x_of(nu, T) for nu in NUS]))}""")
        add("""{"fn": "spectralDensity", "tol": "eval", "T": $(num(T)), "nu": $(arr(NUS)), "expected": $(arr([u_si(nu, T) for nu in NUS]))}""")
        add("""{"fn": "limitingForm", "tol": "eval", "T": $(num(T)), "nu": $(arr(NUS)), "expected": $(arr([ukl_si(nu, T) for nu in NUS]))}""")
    end
    add("""{"fn": "u0", "tol": "eval", "T0": [300, 6000], "expected": $(arr([u0_si(300.0), u0_si(6000.0)]))}""")
    xp = peak_x()
    add("""{"fn": "peakX", "tol": "eval", "what": "positive root of 3 (1 - exp(-x)) = x", "expected": $(num(xp))}""")
    add("""{"fn": "peakValue", "tol": "eval", "what": "x^3 / (exp(x) - 1) at x = peakX", "expected": $(num(xp^3 / expm1(xp)))}""")
    TS = [300.0, 4000.0, 5000.0, 6000.0]
    add("""{"fn": "peakFrequency", "tol": "eval", "what": "peakX k_B T / h in Hz", "T": $(arr(TS)), "expected": $(arr([xp * B(KB) * B(T) / B(H) for T in TS]))}""")
    """{
  "kernel": "planck",
  "reference": {"implementation": "$IMPL", "script": "numerics/generate/c00_golden.jl", "module": "numerics/src/c00_reference.jl", "constants": "$SRC"},
  "conventions": {"u": "spectral energy density per frequency, J s m^-3 (c00.eq.planck)", "u_kl": "limiting form, J s m^-3 (c00.eq.grenzform)", "x": "h nu / (k_B T)", "reduced": "s = h nu/(k_B T_0), tau = T/T_0, u/u_0 and u_kl/u_0 with u_0 = 8 pi (k_B T_0)^3/(h^2 c^3) (figure c00.fig.planck)"},
  "tolerance": {"abs": 1e-300, "rel": 1e-13, "note": "default class 'eval'; unvalidated choice, see 'tolerances'"},
  "tolerances": {
    "eval": {"abs": 1e-300, "rel": 1e-13, "note": "closed forms with expm1 and powers in double precision; unvalidated choice above the measured maximum deviation"},
    "constants": {"rel": 0, "abs": 0, "note": "the kernel's constants are the CODATA values as written in allascii.txt; the nearest double must match exactly"}
  },
  "cases": [
$(join(cases, ",\n"))
  ]
}
"""
end

# ── photo.json ────────────────────────────────────────────────────
function photo()
    cases = String[]; add(s) = push!(cases, "    " * s)
    add(constants_case(["Planck constant", "elementary charge", "electron mass", "speed of light in vacuum"], ["h_J_s", "e_C", "m_e_kg", "c_m_per_s"]))
    WS = [1.0, 2.0, 3.2, 4.5, 5.0]
    add("""{"fn": "thresholdFrequency", "tol": "eval", "W_eV": $(arr(WS)), "expected": $(arr([threshold_Hz(w) for w in WS]))}""")
    NUS = [1e14, 4e14, 4.835978e14, 5e14, 7.737e14, 1e15, 2e15, 4e15]
    for w in [2.0, 3.2]
        add("""{"fn": "kineticMax", "tol": "eval", "W_eV": $(num(w)), "nu": $(arr(NUS)), "expected": $(arr([kin_max_eV(nu, w) for nu in NUS]))}""")
        above = [nu for nu in NUS if kin_max_eV(nu, w) >= 0]
        add("""{"fn": "maxSpeed", "tol": "eval", "W_eV": $(num(w)), "nu": $(arr(above)), "expected": $(arr([v_max(nu, w) for nu in above]))}""")
    end
    ES = [0.0, 1e-3, 0.5, 1.0, 2.5, 13.6]
    add("""{"fn": "speedOfEnergy", "tol": "eval", "E_eV": $(arr(ES)), "expected": $(arr([speed_of_eV(e) for e in ES]))}""")
    """{
  "kernel": "photo",
  "reference": {"implementation": "$IMPL", "script": "numerics/generate/c00_golden.jl", "module": "numerics/src/c00_reference.jl", "constants": "$SRC"},
  "conventions": {"relation": "E_kin,max = (1/2) m_e v_max^2 = h nu - W for nu >= W/h (c00.eq.photoeffekt, c00.eq.schwelle); nonrelativistic kinetic energy", "units": "nu in Hz, energies in eV (1 eV = e J), speeds in m/s"},
  "tolerance": {"abs": 1e-300, "rel": 1e-13, "note": "default class 'eval'; unvalidated choice, see 'tolerances'"},
  "tolerances": {
    "eval": {"abs": 1e-13, "rel": 1e-13, "note": "products, quotients and a square root in double precision; the abs part covers h nu/e - W near the threshold, where the difference cancels; unvalidated choice above the measured maximum deviation"},
    "constants": {"rel": 0, "abs": 0, "note": "the kernel's constants are the CODATA values as written in allascii.txt; the nearest double must match exactly"}
  },
  "cases": [
$(join(cases, ",\n"))
  ]
}
"""
end

# ── c00cavity.json ────────────────────────────────────────────────
function cavity()
    cases = String[]; add(s) = push!(cases, "    " * s)
    d(s) = C00Reference.decimal_rational(s)
    geoms = [
        ("figure", "0.62", 400), ("half", "0.5", 400), ("three-quarters", "0.75", 400), ("steep", "1.25", 400),
        ("flat", "0.3", 400), ("one", "1", 400), ("down", "-0.62", 400), ("level", "0", 400), ("long", "0.07", 120),
    ]
    for (name, s, nmax) in geoms
        p = cavity_path(d("4"), d("2.4"), d("1.1"), d("1.3"), d("1.2"), d(s), nmax)
        add("""{"fn": "cavityPath", "name": "$name", "width": 4, "height": 2.4, "holeLo": 1.1, "holeHi": 1.3, "entryY": 1.2, "slope": $s, "maxReflections": $nmax, """ *
            """"expected": {"points": $(arr([[x, y] for (x, y) in p.points])), "contacts": $(iarr(p.contacts)), "lengths": $(arr(p.lengths)), "exited": $(p.exited), "reflections": $(sum(p.contacts))}}""")
    end
    RS = [0.0, 0.5, 0.8, 0.9, 0.99]; NS = [0, 1, 2, 10, 60, 400]
    add("""{"fn": "remaining", "tol": "eval", "r": $(arr(RS)), "n": $(iarr(NS)), "expected": $(arr([[B(r)^n for n in NS] for r in RS]))}""")
    """{
  "kernel": "c00cavity",
  "reference": {"implementation": "$IMPL", "script": "numerics/generate/c00_golden.jl", "module": "numerics/src/c00_reference.jl"},
  "conventions": {"geometry": "box [0, width] x [0, height] in cm, hole in the left wall with holeLo < y < holeHi; the ray enters at (0, entryY) with direction (1, slope); figure c00.fig.hohlraum", "reflection": "specular; a corner (both walls at once) counts as two contacts and reverses both components", "exit": "a left-wall impact strictly inside the hole ends the path; it has 0 contacts", "lengths": "path length from the entry point, cm", "remaining": "r^n (c00.eq.reflexion)"},
  "tolerance": {"abs": 1e-10, "rel": 1e-13, "note": "positions and lengths in cm; contacts, reflections and the exit flag must agree exactly; unvalidated choice above the measured maximum deviation"},
  "tolerances": {
    "eval": {"abs": 1e-300, "rel": 1e-13, "note": "r^n in double precision; unvalidated choice"}
  },
  "cases": [
$(join(cases, ",\n"))
  ]
}
"""
end

function main(args)
    dir = DEFAULT_DIR
    i = findfirst(==("--dir"), args)
    i === nothing || (dir = abspath(args[i + 1]))
    files = [("planck.json", planck()), ("photo.json", photo()), ("c00cavity.json", cavity())]
    status = 0
    for (name, text) in files
        file = joinpath(dir, name)
        if "--check" in args
            if !isfile(file)
                println("c00 golden: FAIL golden file missing: $file"); status = 1; continue
            end
            if read(file, String) != text
                ours = split(text, '\n'); theirs = split(read(file, String), '\n')
                k = findfirst(j -> j > length(ours) || j > length(theirs) || ours[j] != theirs[j], 1:max(length(ours), length(theirs)))
                println("c00 golden: FAIL $file is not reproduced by the reference; first difference at line $k")
                status = 1; continue
            end
            println("c00 golden: ok: $(relpath(file)) is reproduced byte for byte")
        else
            mkpath(dir); write(file, text)
            println("c00 golden: wrote $(relpath(file)) ($(count(==('\n'), text)) lines)")
        end
    end
    status
end
end # module

if abspath(PROGRAM_FILE) == @__FILE__
    exit(C00Golden.main(ARGS))
end
