#!/usr/bin/env python3
"""Reproducible numbers and exact checks behind the claims of chapter C11.

Usage:  python3 scripts/c11/c11_numerics.py <check>

Every check prints explanatory lines and, as its LAST line, one number; this is
the form scripts/evidence/check_evidence.py --run-numerics expects (the last
output line is compared with `expected` of the claim).  Exit status 1 if an
internal assertion fails.

Values (CODATA 2022 inputs read from sources/codata-2022/allascii.txt; formulas of
evidence/derivations/c11/DERIVATION.md Result 8.2; arithmetic with mpmath at 40
digits).  Each value is also compared with evidence/derivations/c11/golden.json
(17 significant digits), and the uncertainty scale printed in the chapter is
checked to be the golden scale rounded up:
  q            m_e/m_p                                   (line "electron-proton mass ratio")
  mu-ratio     mu/m_e = 1/(1 + q)
  a0           a_0 in m                                  (line "Bohr radius")
  amu          a_mu = a_0 (1 + q) in m
  e1-mu        E_1 with the reduced mass in eV: -h c R_inf/((1 + q) e)
  e1-me        E_1 with the electron mass in eV: -h c R_inf/e
  lyman        vacuum wavelength of 2 -> 1 in nm: 4 (1 + q)/(3 R_inf)
  balmer       vacuum wavelength of 3 -> 2 in nm: 36 (1 + q)/(5 R_inf)
  wolke        rho_e at |x| = a_mu for the 1s relative density and a Gaussian
               centre-of-mass packet of width 7/10 a_mu (DERIVATION.md Result 1b.1),
               in units of a_mu^-3, by the one-dimensional integral of REVIEW.md B2

Exact checks (SymPy; the number printed is the count of failed identities, so 0 is a pass):
  winkel       Lap(R(r) Y_l^m) = (R'' + 2R'/r - l(l+1) R/r^2) Y_l^m for l = 0, 1, 2, all m,
               arbitrary R, with the Cartesian Laplacian
  maximum      the only zero of d/dx (4 x^2 exp(-2x)) for x > 0 is x = 1 and it is a maximum
               (prints the position, 1)
  formulas [IDs]  scripts/c11/check_c11_formulas.py on the chapter (norms, orthogonality,
               Schroedinger equation, Condon-Shortley relation, Laguerre sum and equation,
               TeX against expression); prints its number of failures.  With a comma list
               of equation IDs the mathematical checks are restricted to those formulas
               (option --only of the gate)
  hydrogen FN  run the function FN of evidence/derivations/c11/check_hydrogen.py
               (check_coordinates, check_laguerre, check_radial_normalization,
               check_radial_equation, check_spherical_harmonics, check_wavefunctions,
               check_moments, check_cdf, check_constants, check_cloud_convolution);
               prints 1 if it raises nothing
"""
import importlib.util
import json
import pathlib
import sys

import mpmath as mp

ROOT = pathlib.Path(__file__).resolve().parents[2]
CODATA = ROOT / "sources" / "codata-2022" / "allascii.txt"
DERIV = ROOT / "evidence" / "derivations" / "c11"
mp.mp.dps = 40

# uncertainty scales as printed in the chapter (table c11.tab.ergebnisse), in the unit of the value
PRINTED_SCALE = {"mu-ratio": "9.4e-15", "amu": "8.21e-21", "e1-mu": "1.50e-11", "e1-me": "1.49e-11",
                 "lyman": "1.35e-10", "balmer": "7.25e-10"}
GOLDEN_KEY = {"q": ("m_e_over_m_p", 1), "mu-ratio": ("mu_over_m_e", 1), "a0": ("a_0", 1), "amu": ("a_mu", 1),
              "e1-mu": ("E_1_mu_eV", 1), "e1-me": ("E_1_m_e_eV", 1),
              "lyman": ("Lyman_alpha_vacuum", mp.mpf(10) ** 9), "balmer": ("Balmer_alpha_vacuum", mp.mpf(10) ** 9)}


def require(cond, msg):
    if not cond:
        print(f"c11_numerics: FAILED: {msg}")
        sys.exit(1)


def codata(name):
    """(value, standard uncertainty) of the line whose first column is exactly `name`."""
    for line in CODATA.read_text(encoding="utf-8").splitlines():
        if line[:60].rstrip() == name:
            value = line[60:85].replace(" ", "").replace("...", "")
            unc = line[85:110].replace(" ", "")
            return mp.mpf(value), (mp.mpf(0) if unc == "(exact)" else mp.mpf(unc))
    require(False, f"CODATA line '{name}' not found")


def value(which):
    q, _ = codata("electron-proton mass ratio")
    a0, _ = codata("Bohr radius")
    rinf, _ = codata("Rydberg constant")
    h, _ = codata("Planck constant")
    c, _ = codata("speed of light in vacuum")
    e, _ = codata("elementary charge")
    table = {
        "q": q,
        "mu-ratio": 1 / (1 + q),
        "a0": a0,
        "amu": a0 * (1 + q),
        "e1-mu": -h * c * rinf / ((1 + q) * e),
        "e1-me": -h * c * rinf / e,
        "lyman": 4 * (1 + q) / (3 * rinf) * 10 ** 9,
        "balmer": 36 * (1 + q) / (5 * rinf) * 10 ** 9,
    }
    v = table[which]
    golden = json.loads((DERIV / "golden.json").read_text(encoding="utf-8"))["constants"]
    key, factor = GOLDEN_KEY[which]
    g = mp.mpf(golden[key]["value"]) * factor
    require(abs(v / g - 1) < mp.mpf("1e-15"), f"{which} = {mp.nstr(v, 20)} differs from golden.json {mp.nstr(g, 20)}")
    print(f"{which}: {mp.nstr(v, 20)}  (golden.json {key}: {golden[key]['value']} {golden[key]['unit']})")
    if which in PRINTED_SCALE:
        scale = mp.mpf(golden[key]["first_order_uncertainty_scale_upper_bound"]) * factor
        printed = mp.mpf(PRINTED_SCALE[which])
        require(scale <= printed < scale * mp.mpf("1.02"),
                f"printed uncertainty scale {PRINTED_SCALE[which]} is not golden {mp.nstr(scale, 6)} rounded up")
        print(f"uncertainty scale: golden {mp.nstr(scale, 6)}, printed (rounded up) {PRINTED_SCALE[which]}")
    return v


def wolke():
    q, _ = codata("electron-proton mass ratio")
    b = 1 / (1 + q)
    s = mp.mpf(7) / 10
    xx = mp.mpf(1)
    pref = (mp.pi * s ** 2) ** mp.mpf("-1.5")
    f = lambda t: t * mp.e ** (-2 * t) * (mp.e ** (-((xx - b * t) / s) ** 2) - mp.e ** (-((xx + b * t) / s) ** 2))
    v = s ** 2 / (b * xx) * pref * mp.quad(f, [0, xx / b, xx / b + 3, xx / b + 10, mp.inf])
    require(abs(v / mp.mpf("0.037922550162930973") - 1) < mp.mpf("1e-15"),
            "rho_e(1) differs from DERIVATION.md Result 1b.1")
    print("rho_e(a_mu) a_mu^3 for sigma = 7/10 a_mu (DERIVATION.md Result 1b.1: 0.037922550162930973)")
    return v


def winkel():
    import sympy as sp
    X1, X2, X3 = sp.symbols("X1 X2 X3", real=True)
    rr = sp.sqrt(X1 ** 2 + X2 ** 2 + X3 ** 2)
    rs = sp.Symbol("r", positive=True)
    R = sp.Function("R")
    # Cartesian forms of r^l Y_l^m up to constant factors (constants do not matter for the identity)
    solid = {(0, 0): 1, (1, 0): X3, (1, 1): X1 + sp.I * X2, (1, -1): X1 - sp.I * X2,
             (2, 0): 3 * X3 ** 2 - rr ** 2, (2, 1): X3 * (X1 + sp.I * X2), (2, -1): X3 * (X1 - sp.I * X2),
             (2, 2): (X1 + sp.I * X2) ** 2, (2, -2): (X1 - sp.I * X2) ** 2}
    bad = 0
    for (l, m), poly in solid.items():
        Y = poly / rr ** l
        f = R(rr) * Y
        lap = sum(sp.diff(f, v, 2) for v in (X1, X2, X3))
        radial = (sp.diff(R(rs), rs, 2) + 2 * sp.diff(R(rs), rs) / rs - l * (l + 1) * R(rs) / rs ** 2)
        lap_r = lap.subs(rr, rs).doit()
        res = sp.simplify((lap_r - radial * Y.subs(rr, rs)).subs(X3 ** 2, rs ** 2 - X1 ** 2 - X2 ** 2))
        res = sp.simplify(sp.expand(res).subs(X3 ** 2, rs ** 2 - X1 ** 2 - X2 ** 2))
        ok = res == 0
        print(f"l = {l}, m = {m:+d}: residual {'0' if ok else sp.sstr(res)}")
        bad += 0 if ok else 1
    return bad


def maximum():
    import sympy as sp
    x = sp.Symbol("x", positive=True)
    P = 4 * x ** 2 * sp.exp(-2 * x)
    zeros = sp.solve(sp.diff(P, x), x)
    require(zeros == [1], f"zeros of P_10' for x > 0: {zeros}")
    require(sp.diff(P, x, 2).subs(x, 1) < 0, "x = 1 is not a maximum")
    print("d/dx (4 x^2 exp(-2x)) = 0 for x > 0 only at x = 1; second derivative there is negative")
    return zeros[0]


def formulas(only=None):
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
    import check_c11_formulas as gate
    sys.argv = ["check_c11_formulas.py"] + (["--only", only] if only else [])
    gate.main()
    return len(gate.failures)


def hydrogen(fn):
    spec = importlib.util.spec_from_file_location("check_hydrogen", DERIV / "check_hydrogen.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    if fn in ("check_constants", "check_cloud_convolution"):
        getattr(mod, fn)(mod.read_codata())
    elif fn == "check_wavefunctions":
        mod.check_wavefunctions(mod.check_spherical_harmonics())
    else:
        require(fn in ("check_coordinates", "check_laguerre", "check_radial_normalization",
                       "check_radial_equation", "check_spherical_harmonics", "check_moments", "check_cdf"),
                f"unknown function {fn}")
        getattr(mod, fn)()
    print(f"evidence/derivations/c11/check_hydrogen.py: {fn} raised nothing")
    return 1


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    which = sys.argv[1]
    if which in GOLDEN_KEY:
        v = value(which)
    elif which == "wolke":
        v = wolke()
    elif which == "winkel":
        v = winkel()
    elif which == "maximum":
        v = maximum()
    elif which == "formulas":
        v = formulas(sys.argv[2] if len(sys.argv) > 2 else None)
    elif which == "hydrogen" and len(sys.argv) == 3:
        v = hydrogen(sys.argv[2])
    else:
        print(__doc__)
        return 2
    print(mp.nstr(mp.mpf(v), 17) if not isinstance(v, int) else v)
    return 0


if __name__ == "__main__":
    sys.exit(main())
