# CODATA 2022 inputs for C11, read from the registered source file
# sources/codata-2022/allascii.txt (PLAN section 14 item 9) as exact decimal rationals, and
# the derived constants of DERIVATION.md Result 8.2. No constant is typed in here.
module Codata

export decimal_rational, parse_codata_line, read_codata, derived_constants, CODATA_FILE, CODATA_LINES

const Q = Rational{BigInt}
const CODATA_FILE = normpath(joinpath(@__DIR__, "..", "..", "sources", "codata-2022", "allascii.txt"))

"line numbers quoted in DERIVATION.md Result 8.1"
const CODATA_LINES = Dict(
    "Bohr radius" => 61, "electron mass" => 107, "electron-proton mass ratio" => 117,
    "electron volt" => 124, "elementary charge" => 132, "Planck constant" => 271,
    "proton mass" => 288, "Rydberg constant" => 309, "Rydberg constant times hc in eV" => 311,
    "Rydberg constant times hc in J" => 312, "speed of light in vacuum" => 330,
    "vacuum electric permittivity" => 360)

"exact rational of a decimal string such as \"5.29177210544e-11\" or \"299792458\""
function decimal_rational(s::AbstractString)
    t = replace(strip(s), " " => "")
    m = match(r"^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$", t)
    m === nothing && error("not a decimal number: $s")
    sign = m.captures[1] == "-" ? -1 : 1
    ip = something(m.captures[2], ""); fp = something(m.captures[3], "")
    ex = m.captures[4] === nothing ? 0 : parse(Int, m.captures[4])
    digits = parse(BigInt, isempty(ip * fp) ? "0" : ip * fp)
    sign * digits * (big(10) // 1)^(ex - length(fp))
end

"(name, value, standard uncertainty, unit) of one line of allascii.txt; (exact) gives uncertainty 0"
function parse_codata_line(line::AbstractString)
    f = split(strip(line), r"\s{2,}")
    length(f) >= 3 || error("not a CODATA table line: $line")
    occursin("...", f[2]) && error("truncated value (ellipsis) is not used: $line")
    unc = strip(f[3]) == "(exact)" ? Q(0) : decimal_rational(f[3])
    (name = String(f[1]), value = decimal_rational(f[2]), uncertainty = unc, unit = length(f) >= 4 ? String(f[4]) : "")
end

function read_codata(file = CODATA_FILE)
    lines = readlines(file)
    Dict(name => (; parse_codata_line(lines[n])..., line = n, source_line = lines[n]) for (name, n) in CODATA_LINES)
end

"""
Result 8.2: q = m_e/m_p (tabulated ratio), eta = 1/(1+q), a_mu = a_0 (1+q), E_1(m_e) = -h c R_inf,
E_1(mu) = -eta h c R_inf, lambda(Ly alpha) = 4(1+q)/(3 R_inf), lambda(Ba alpha) = 36(1+q)/(5 R_inf).
Each entry: (value, first-order uncertainty scale sum_i |df/dc_i| u(c_i), unit), exact rationals.
`c` maps names to (value, uncertainty).
"""
function derived_constants(c)
    q, uq = c["electron-proton mass ratio"].value, c["electron-proton mass ratio"].uncertainty
    a0, ua0 = c["Bohr radius"].value, c["Bohr radius"].uncertainty
    Rinf, uR = c["Rydberg constant"].value, c["Rydberg constant"].uncertainty
    h = c["Planck constant"].value; cl = c["speed of light in vacuum"].value; e = c["elementary charge"].value
    eta = 1 // (1 + q); ueta = uq // (1 + q)^2
    Ry = h * cl * Rinf; uRy = h * cl * uR
    Dict(
        "m_e_over_m_p" => (q, uq, "1"),
        "mu_over_m_e" => (eta, ueta, "1"),
        "a_0" => (a0, ua0, "m"),
        "a_mu" => (a0 * (1 + q), (1 + q) * ua0 + a0 * uq, "m"),
        "E_1_m_e_J" => (-Ry, uRy, "J"),
        "E_1_m_e_eV" => (-Ry // e, uRy // e, "eV"),
        "E_1_mu_J" => (-eta * Ry, eta * uRy + Ry * ueta, "J"),
        "E_1_mu_eV" => (-eta * Ry // e, (eta * uRy + Ry * ueta) // e, "eV"),
        "Lyman_alpha_vacuum" => (4 * (1 + q) // (3 * Rinf), 4 // (3 * Rinf) * uq + 4 * (1 + q) // (3 * Rinf^2) * uR, "m"),
        "Balmer_alpha_vacuum" => (36 * (1 + q) // (5 * Rinf), 36 // (5 * Rinf) * uq + 36 * (1 + q) // (5 * Rinf^2) * uR, "m"),
    )
end

end # module
