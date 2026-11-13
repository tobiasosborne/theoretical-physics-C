#!/usr/bin/env python3
"""Exact C11 checks and deterministic golden-data generation.

Only the permitted CODATA source and our own golden output are read.
Run without flags to regenerate golden.json; --verify compares bytes without
writing. All checks run in both modes. No cache or scratch file is written.
"""
import argparse
import hashlib
import json
from pathlib import Path

import mpmath as mp
import sympy as sp


ROOT = Path(__file__).resolve().parents[3]
OUTPUT = Path(__file__).with_name("golden.json")
CODATA = ROOT / "sources/codata-2022/allascii.txt"
x = sp.Symbol("x", positive=True)
t = sp.Symbol("t", real=True)
phi = sp.Symbol("phi", real=True)
mp.mp.dps = 60


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def zero(expression, message):
    require(sp.simplify(expression) == 0, message)


def laguerre(k, alpha, variable=x):
    return sp.expand(sum(
        (-1)**j * sp.binomial(k + alpha, k - j) * variable**j
        / sp.factorial(j) for j in range(k + 1)
    ))


def radial(n, ell, variable=x):
    """a_mu^(3/2) R_nl for Z=1; variable=r/a_mu."""
    k = n - ell - 1
    beta = sp.Rational(2, n)
    prefactor = sp.sqrt(
        sp.factorial(k) * beta**3
        / (2*n*sp.factorial(n + ell))
    )
    return prefactor * (beta*variable)**ell * sp.exp(-variable/n) * laguerre(
        k, 2*ell+1, beta*variable
    )


def radial_integral(n, ell, power):
    # Integrate polynomial monomials against exp(-2x/n) with the exact
    # Gamma integral; this is direct integration, not a moment formula.
    beta = sp.Rational(2, n)
    polynomial = sp.Poly(sp.expand(
        radial(n, ell)**2 * sp.exp(beta*x) * x**(power+2)
    ), x)
    return sp.simplify(sum(
        coefficient * sp.factorial(degree[0]) / beta**(degree[0]+1)
        for degree, coefficient in polynomial.terms()
    ))


def cdf_polynomial(n, ell):
    beta = sp.Rational(2, n)
    density_poly = sp.Poly(sp.expand(
        x**2 * radial(n, ell)**2 * sp.exp(beta*x)
    ), x)
    tail_poly = 0
    for (j,), coefficient in density_poly.terms():
        tail_poly += coefficient * sp.factorial(j) / beta**(j+1) * sum(
            (beta*x)**h / sp.factorial(h) for h in range(j+1)
        )
    return sp.expand(tail_poly)


def cdf(n, ell):
    return 1 - sp.exp(-sp.Rational(2, n)*x)*cdf_polynomial(n, ell)


def angular_amplitudes():
    """Real amplitudes on -1 <= t <= 1, excluding exp(i m phi)."""
    return {
        (0, 0): 1/sp.sqrt(4*sp.pi),
        (1, 0): sp.sqrt(3/(4*sp.pi))*t,
        (1, 1): -sp.sqrt(3/(8*sp.pi))*sp.sqrt(1-t**2),
        (1, -1): sp.sqrt(3/(8*sp.pi))*sp.sqrt(1-t**2),
        (2, 0): sp.sqrt(5/(16*sp.pi))*(3*t**2-1),
        (2, 1): -sp.sqrt(15/(8*sp.pi))*t*sp.sqrt(1-t**2),
        (2, -1): sp.sqrt(15/(8*sp.pi))*t*sp.sqrt(1-t**2),
        (2, 2): sp.sqrt(15/(32*sp.pi))*(1-t**2),
        (2, -2): sp.sqrt(15/(32*sp.pi))*(1-t**2),
    }


def check_coordinates():
    me, proton = sp.symbols("me proton", positive=True)
    total = me + proton
    reduced = me*proton/total
    forward = sp.Matrix([[me/total, proton/total], [1, -1]])
    inverse = sp.Matrix([[1, proton/total], [1, -me/total]])
    require(sp.simplify(forward.det()) == -1, "coordinate determinant")
    require(sp.simplify(forward*inverse) == sp.eye(2), "inverse coordinates")
    zero((me/total)**2/me + (proton/total)**2/proton - 1/total,
         "COM kinetic coefficient")
    zero(1/me + 1/proton - 1/reduced, "relative kinetic coefficient")
    zero(2*(me/total)/me - 2*(proton/total)/proton,
         "mixed kinetic coefficient")
    kinetic_matrix = sp.diag(1/me, 1/proton)
    require(sp.simplify(forward*kinetic_matrix*forward.T)
            == sp.diag(1/total, 1/reduced), "old-to-new kinetic matrix")
    a, b, sigma = sp.symbols("a b sigma", positive=True)
    # Convolution substitutions and their signed 3D Jacobians.
    require((-b*sp.eye(3)).det() == -b**3, "electron marginal Jacobian")
    require((a*sp.eye(3)).det() == a**3, "proton marginal Jacobian")
    require(sp.integrate(
        4*sp.pi*x**2/(sp.pi*sigma**2)**sp.Rational(3, 2)
        * sp.exp(-x**2/sigma**2), (x, 0, sp.oo)
    ) == 1, "COM Gaussian density normalization")
    # Verify the transformed ODE before choosing a polynomial.
    s = sp.Symbol("s", positive=True)
    ell, gamma = sp.symbols("ell gamma")
    v = sp.Function("v")(s)
    u = s**(ell+1)*sp.exp(-s/2)*v
    residual = (sp.diff(u, s, 2)
                + (-sp.Rational(1, 4)+gamma/s-ell*(ell+1)/s**2)*u)
    expected = sp.diff(v, s, 2)+(2*(ell+1)/s-1)*sp.diff(v, s) + (
        gamma-ell-1
    )*v/s
    zero(residual/(s**(ell+1)*sp.exp(-s/2))-expected, "Laguerre ODE substitution")


def check_laguerre():
    alpha = sp.Symbol("alpha")
    for k in range(7):
        p = laguerre(k, alpha)
        zero(p - sp.assoc_laguerre(k, alpha, x), "Laguerre convention")
        zero(p.subs(x, 0)-sp.binomial(k+alpha, k), "Laguerre value at zero")
        zero(x*sp.diff(p, x, 2)+(alpha+1-x)*sp.diff(p, x)+k*p,
             "Laguerre ODE")
        previous = laguerre(k-1, alpha) if k else 0
        zero(x*p-(2*k+alpha+1)*p+(k+1)*laguerre(k+1, alpha)
             +(k+alpha)*previous, "Laguerre multiplication recurrence")
    for alpha_int in range(1, 8):
        for k in range(5):
            rodrigues = sp.exp(x)/x**alpha_int/sp.factorial(k)*sp.diff(
                sp.exp(-x)*x**(k+alpha_int), x, k
            )
            zero(rodrigues-laguerre(k, alpha_int), "Rodrigues convention")


def check_radial_normalization():
    for n in range(1, 7):
        for ell in range(n):
            require(radial_integral(n, ell, 0) == 1, f"R norm n={n}, l={ell}")


def check_radial_equation():
    for n in range(1, 5):
        for ell in range(n):
            u = x*radial(n, ell)
            zero(-sp.diff(u, x, 2)
                 + (ell*(ell+1)/x**2-2/x+sp.Rational(1, n*n))*u,
                 f"radial equation n={n}, l={ell}")
            require(sp.limit(u, x, 0, dir="+") == 0, "regular origin")
            require(sp.limit(u, x, sp.oo) == 0, "decay at infinity")


def check_spherical_harmonics():
    amplitudes = angular_amplitudes()
    for (ell, m), amplitude in amplitudes.items():
        mm = abs(m)
        legendre = sp.diff((t*t-1)**ell, t, ell)/(2**ell*sp.factorial(ell))
        definition = (-1)**mm * sp.sqrt(
            (2*ell+1)/(4*sp.pi)*sp.factorial(ell-mm)/sp.factorial(ell+mm)
        )*(1-t*t)**sp.Rational(mm, 2)*sp.diff(legendre, t, mm)
        if m < 0:
            definition *= (-1)**mm
        zero(amplitude-definition, "CS harmonic definition")
        zero(-sp.diff((1-t*t)*sp.diff(amplitude, t), t)
             + m*m/(1-t*t)*amplitude - ell*(ell+1)*amplitude,
             "angular eigenvalue")
    for (ell, m), first in amplitudes.items():
        for (other_ell, other_m), second in amplitudes.items():
            azimuth = sp.integrate(sp.exp(sp.I*(other_m-m)*phi),
                                   (phi, 0, 2*sp.pi))
            value = azimuth*sp.integrate(sp.simplify(first*second), (t, -1, 1))
            expected = int((ell, m) == (other_ell, other_m))
            zero(value-expected, "harmonic orthonormality")
    return amplitudes


def check_wavefunctions(amplitudes):
    explicit = {
        (1, 0, 0): sp.exp(-x)/sp.sqrt(sp.pi),
        (2, 0, 0): (2-x)*sp.exp(-x/2)/(4*sp.sqrt(2*sp.pi)),
        (2, 1, 0): x*sp.exp(-x/2)*t/(4*sp.sqrt(2*sp.pi)),
        (3, 0, 0): (27-18*x+2*x*x)*sp.exp(-x/3)/(81*sp.sqrt(3*sp.pi)),
        (3, 1, 0): 2*x*(6-x)*sp.exp(-x/3)*t/(81*sp.sqrt(2*sp.pi)),
        (3, 2, 0): x*x*sp.exp(-x/3)*(3*t*t-1)/(81*sp.sqrt(6*sp.pi)),
    }
    for m in (-1, 1):
        sign = -m
        explicit[(2, 1, m)] = sign*x*sp.exp(-x/2)*sp.sqrt(1-t*t)/(8*sp.sqrt(sp.pi))
        explicit[(3, 1, m)] = sign*x*(6-x)*sp.exp(-x/3)*sp.sqrt(1-t*t)/(81*sp.sqrt(sp.pi))
        explicit[(3, 2, m)] = sign*x*x*sp.exp(-x/3)*t*sp.sqrt(1-t*t)/(81*sp.sqrt(sp.pi))
    for m in (-2, 2):
        explicit[(3, 2, m)] = x*x*sp.exp(-x/3)*(1-t*t)/(162*sp.sqrt(sp.pi))
    require(len(explicit) == 14, "all fourteen states included")
    for (n, ell, m), expression in explicit.items():
        zero(expression - radial(n, ell)*amplitudes[(ell, m)],
             f"explicit wavefunction n={n}, l={ell}, m={m}")
        # Compute the full norm of the explicit expression, integrating the
        # angular factor first and then the radial monomials exactly.
        beta = sp.Rational(2, n)
        angular_integrated = 2*sp.pi*sp.integrate(
            sp.expand(expression**2*sp.exp(beta*x)), (t, -1, 1)
        )
        poly = sp.Poly(sp.expand(x*x*angular_integrated), x)
        full_norm = sum(c*sp.factorial(j[0])/beta**(j[0]+1)
                        for j, c in poly.terms())
        zero(full_norm-1, "full explicit wavefunction norm")
    return explicit


def check_lecture_formulas(explicit):
    alpha = sp.Symbol("s")
    zero(laguerre(0, alpha)-1, "lecture L0")
    zero(laguerre(1, alpha)-(-x+alpha+1), "lecture L1")
    printed_l2 = -x*x/2-(alpha+2)*x+(alpha+1)*(alpha+2)/2
    zero(printed_l2-laguerre(2, alpha)+x*x, "lecture L2 defect")
    printed_21 = x*sp.exp(-x/2)*sp.sqrt(1-t*t)/(8*sp.sqrt(2*sp.pi))
    printed_norm = sp.integrate(2*sp.pi*printed_21**2, (t, -1, 1))
    printed_norm = sp.integrate(x*x*printed_norm, (x, 0, sp.oo))
    require(printed_norm == sp.Rational(1, 2), "lecture line 94 defect")
    for m in (-1, 1):
        zero(printed_21/explicit[(2, 1, m)] + m/sp.sqrt(2),
             "lecture line 94 phase/amplitude ratio")
    me, eps0, hbar, charge, Z, n = sp.symbols(
        "me eps0 hbar charge Z n", positive=True
    )
    a0 = 4*sp.pi*eps0*hbar*hbar/(me*charge*charge)
    energy = -(Z*charge)**2/(4*sp.pi*eps0*a0*2*n*n)
    zero(energy + hbar*hbar*Z*Z/(2*me*a0*a0*n*n), "lecture energy")
    zero(sp.sqrt(2*me*(-energy))/hbar - Z/(n*a0), "lecture kappa")
    principal = sp.Symbol("n", integer=True, positive=True)
    index = sp.Symbol("ell", integer=True, nonnegative=True)
    zero(sp.summation(2*index+1, (index, 0, principal-1))-principal**2,
         "spinless degeneracy")
    require(sp.Rational(3, 4)/sp.Rational(5, 36) == sp.Rational(27, 5),
            "alpha-line gap ratio")
    printed_first_three = {
        (1, 0, 0): sp.exp(-x)/sp.sqrt(sp.pi),
        (2, 0, 0): (2-x)*sp.exp(-x/2)/(4*sp.sqrt(2*sp.pi)),
        (2, 1, 0): x*sp.exp(-x/2)*t/(4*sp.sqrt(2*sp.pi)),
    }
    for state, expression in printed_first_three.items():
        zero(expression-explicit[state], "lecture lines 91--93")
    return {"line_85_printed_minus_correct": "-x**2",
            "line_94_printed_norm_squared": "1/2",
            "line_94_printed_over_CS_m_plus_1": "-sqrt(2)/2",
            "line_94_printed_over_CS_m_minus_1": "sqrt(2)/2"}


def check_moments():
    for n in range(1, 5):
        for ell in range(n):
            expected = {
                1: sp.Rational(3*n*n-ell*(ell+1), 2),
                2: sp.Rational(n*n*(5*n*n+1-3*ell*(ell+1)), 2),
                -1: sp.Rational(1, n*n),
            }
            for power, value in expected.items():
                require(radial_integral(n, ell, power) == value,
                        f"moment n={n}, l={ell}, power={power}")
            # Check the derived hypervirial recurrence at s=0,1,2 by
            # independently integrated values, including I_-2.
            for s in range(3):
                residual = (
                    s*(sp.Rational(s*s-1, 4)-ell*(ell+1))
                    * radial_integral(n, ell, s-2)
                    +(2*s+1)*radial_integral(n, ell, s-1)
                    -sp.Rational(s+1, n*n)*radial_integral(n, ell, s)
                )
                zero(residual, "moment integration-by-parts recurrence")


def check_cdf():
    for n in range(1, 4):
        for ell in range(n):
            F = cdf(n, ell)
            zero(sp.diff(F, x)-x*x*radial(n, ell)**2, "CDF derivative")
            require(F.subs(x, 0) == 0, "CDF at zero")
            require(sp.limit(F, x, sp.oo) == 1, "CDF at infinity")


def read_codata():
    rows = {}
    for line_number, line in enumerate(CODATA.read_text().splitlines(), 1):
        name = line[:60].strip()
        if not name:
            continue
        value_text = line[60:85].replace(" ", "")
        uncertainty_text = line[85:110].replace(" ", "")
        # Do not use an ellipsis value as a finite exact decimal.
        if "..." in value_text:
            continue
        try:
            value = sp.Rational(value_text)
            uncertainty = (sp.Integer(0) if uncertainty_text == "(exact)"
                           else sp.Rational(uncertainty_text))
        except (ValueError, TypeError):
            continue
        rows[name] = {"value": value, "uncertainty": uncertainty,
                      "unit": line[110:].strip(), "line": line_number,
                      "text": line.rstrip()}
    return rows


def mval(expression):
    return mp.mpf(str(sp.N(expression, 65)))


def digits(expression):
    """Exactly 17 significant decimal digits, including trailing zeros."""
    return mp.nstr(mval(expression), 17, strip_zeros=False,
                   min_fixed=-4, max_fixed=7)


def check_constants(rows):
    def val(name):
        return rows[name]["value"]

    def unc(name):
        return rows[name]["uncertainty"]

    q = val("electron-proton mass ratio")
    eta = 1/(1+q)
    a0 = val("Bohr radius")
    lecture_a0 = sp.Rational("5.29177210903e-11")
    require(lecture_a0-a0 == sp.Rational("3.59e-20"),
            "lecture Bohr radius differs from CODATA 2022")
    require(lecture_a0-a0 > 4*unc("Bohr radius"),
            "lecture Bohr radius discrepancy exceeds four 2022 uncertainties")
    h = val("Planck constant")
    c = val("speed of light in vacuum")
    charge = val("elementary charge")
    electron_volt = val("electron volt")
    me = val("electron mass")
    proton = val("proton mass")
    eps0 = val("vacuum electric permittivity")
    Rinf = val("Rydberg constant")
    hbar = h/(2*sp.pi)
    primitive_a0 = 4*sp.pi*eps0*hbar**2/(me*charge**2)
    primitive_rydberg = hbar**2/(2*me*primitive_a0**2)
    mass_ratio_bound = q*(unc("electron mass")/me+unc("proton mass")/proton)
    require(abs(me/proton-q) <= mass_ratio_bound + unc("electron-proton mass ratio"),
            "tabulated mass ratio consistency")
    a0_bound = a0*(unc("vacuum electric permittivity")/eps0
                  +unc("electron mass")/me)+unc("Bohr radius")
    require(abs(mval(primitive_a0-a0)) <= mval(a0_bound), "Bohr-radius consistency")
    Renergy = h*c*Rinf
    # Symbolic connection between the primitive Hamiltonian and mass scaling.
    symbolic_mu, symbolic_me, symbolic_mp, symbolic_eps, symbolic_hbar, symbolic_e = (
        sp.symbols("mu me mp eps hbar e", positive=True)
    )
    symbolic_a0 = 4*sp.pi*symbolic_eps*symbolic_hbar**2/(symbolic_me*symbolic_e**2)
    symbolic_amu = 4*sp.pi*symbolic_eps*symbolic_hbar**2/(symbolic_mu*symbolic_e**2)
    symbolic_energy_inf = symbolic_hbar**2/(2*symbolic_me*symbolic_a0**2)
    symbolic_energy_mu = symbolic_hbar**2/(2*symbolic_mu*symbolic_amu**2)
    zero(symbolic_energy_mu/symbolic_energy_inf-symbolic_mu/symbolic_me,
         "reduced-mass energy scaling")
    zero((symbolic_me/symbolic_mu).subs(
        symbolic_mu, symbolic_me*symbolic_mp/(symbolic_me+symbolic_mp)
    )-(1+symbolic_me/symbolic_mp), "reduced-mass radius scaling")
    energy_bound = Renergy*(unc("electron mass")/me
                           +2*unc("vacuum electric permittivity")/eps0
                           +unc("Rydberg constant")/Rinf)
    require(abs(mval(primitive_rydberg-Renergy)) <= mval(energy_bound),
            "primitive Rydberg energy consistency")
    require(abs(Renergy-val("Rydberg constant times hc in J"))
            <= unc("Rydberg constant times hc in J") + h*c*unc("Rydberg constant"),
            "tabulated Rydberg energy in J")
    require(abs(Renergy/electron_volt-val("Rydberg constant times hc in eV"))
            <= unc("Rydberg constant times hc in eV")
            + h*c*unc("Rydberg constant")/electron_volt,
            "tabulated Rydberg energy in eV")
    require(charge == electron_volt, "exact numerical eV conversion")
    values = {
        "m_e_over_m_p": (q, "1"),
        "mu_over_m_e": (eta, "1"),
        "a_0": (a0, "m"),
        "a_mu": (a0*(1+q), "m"),
        "E_1_m_e_J": (-Renergy, "J"),
        "E_1_m_e_eV": (-Renergy/electron_volt, "eV"),
        "E_1_mu_J": (-eta*Renergy, "J"),
        "E_1_mu_eV": (-eta*Renergy/electron_volt, "eV"),
        "Lyman_alpha_vacuum": ((1+q)/(Rinf*sp.Rational(3, 4)), "m"),
        "Balmer_alpha_vacuum": ((1+q)/(Rinf*sp.Rational(5, 36)), "m"),
    }
    for name, fraction in (("Lyman_alpha_vacuum", sp.Rational(3, 4)),
                           ("Balmer_alpha_vacuum", sp.Rational(5, 36))):
        zero(h*c/values[name][0]-eta*Renergy*fraction,
             "vacuum wavelength/internal energy conversion")
    uq = unc("electron-proton mass ratio")
    ua0 = unc("Bohr radius")
    uR = unc("Rydberg constant")
    # Conservative first-order uncertainty scales: sum absolute derivative
    # contributions, so a covariance assumption is unnecessary.
    uncertainty_scales = {
        "m_e_over_m_p": uq,
        "mu_over_m_e": uq/(1+q)**2,
        "a_0": ua0,
        "a_mu": (1+q)*ua0+a0*uq,
        "E_1_m_e_J": h*c*uR,
        "E_1_m_e_eV": h*c*uR/electron_volt,
        "E_1_mu_J": eta*h*c*uR+Renergy*uq/(1+q)**2,
        "E_1_mu_eV": (eta*h*c*uR+Renergy*uq/(1+q)**2)/electron_volt,
        "Lyman_alpha_vacuum": sp.Rational(4, 3)*(uq/Rinf+(1+q)*uR/Rinf**2),
        "Balmer_alpha_vacuum": sp.Rational(36, 5)*(uq/Rinf+(1+q)*uR/Rinf**2),
    }
    return values, uncertainty_scales


def check_cloud_convolution(rows):
    """Original lab marginal vs convolution at |x_e|=a_mu.

    These are 3D spherical volume integrals; axial symmetry integrates the
    azimuth to 2*pi exactly, with numerical quadrature in radius and cosine.
    The lab integral uses x_p as its integration variable. The independent
    convolution uses R and includes the b^-3 rescaling.
    """
    with mp.workdps(22):
        q = mval(rows["electron-proton mass ratio"]["value"])
        a = q/(1+q)
        b = 1/(1+q)
        sigma = mp.mpf("0.7")
        position = mp.mpf(1)
        gaussian_norm = (mp.pi*sigma**2)**(-mp.mpf("1.5"))
        radial_norm = 1/mp.pi

        def lab_radial(s):
            def integrand(z):
                R2 = a*a*position**2+b*b*s*s+2*a*b*position*s*z
                r2 = position**2+s*s-2*position*s*z
                return mp.exp(-R2/sigma**2-2*mp.sqrt(max(mp.mpf(0), r2)))
            return s*s*mp.quad(integrand, [-1, 0, 1])

        def convolution_radial(s):
            def integrand(z):
                distance2 = position**2+s*s-2*position*s*z
                return mp.exp(-s*s/sigma**2-2*mp.sqrt(
                    max(mp.mpf(0), distance2)
                )/b)
            return s*s*mp.quad(integrand, [-1, 0, 1])

        # The last infinite tail is tiny, but is included rather than cut off.
        splits = [0, position, 2, 4, 8, mp.inf]
        lab = 2*mp.pi*gaussian_norm*radial_norm*mp.quad(lab_radial, splits)
        convolution = (2*mp.pi*gaussian_norm*radial_norm/b**3
                       *mp.quad(convolution_radial, splits))
        relative_error = abs(lab-convolution)/abs(convolution)
        require(relative_error < mp.mpf("1e-14"), "cloud convolution quadrature")
        print("Cloud quadrature:", mp.nstr(lab, 17), mp.nstr(convolution, 17),
              "relative error", mp.nstr(relative_error, 5))
        # Numerical quadrature is a validation only, not part of byte-stable
        # golden output. Exact symbolic/central-value data populate that file.


def make_golden(rows, values, uncertainties, lecture_checks):
    samples = [sp.Rational(1, 2), sp.Integer(1), sp.Integer(2),
               sp.Integer(5), sp.Integer(10)]
    radial_data = []
    for n in range(1, 4):
        for ell in range(n):
            beta = sp.Rational(2, n)
            N = sp.sqrt(sp.factorial(n-ell-1)*beta**3
                        / (2*n*sp.factorial(n+ell)))
            R = radial(n, ell)
            F = cdf(n, ell)
            radial_data.append({
                "n": n, "l": ell,
                "normalization_constant_exact": sp.sstr(N),
                "normalization_constant_definition":
                    "a_mu^(3/2) N_nl in R=N_nl*(2r/(n*a_mu))^l*exp(-r/(n*a_mu))*L",
                "R_exact": sp.sstr(R),
                "moments_exact": {
                    "r_over_a_mu": sp.sstr(radial_integral(n, ell, 1)),
                    "r_squared_over_a_mu_squared": sp.sstr(radial_integral(n, ell, 2)),
                    "inverse_r_times_a_mu": sp.sstr(radial_integral(n, ell, -1)),
                },
                "moments": {
                    "r_over_a_mu": digits(radial_integral(n, ell, 1)),
                    "r_squared_over_a_mu_squared": digits(radial_integral(n, ell, 2)),
                    "inverse_r_times_a_mu": digits(radial_integral(n, ell, -1)),
                },
                "cdf_exact": sp.sstr(F),
                "samples": [{
                    "r_over_a_mu": float(radius),
                    "R_times_a_mu_to_3_over_2": digits(R.subs(x, radius)),
                    "cdf": digits(F.subs(x, radius)),
                } for radius in samples],
            })
    used = [
        "Bohr radius", "electron mass", "electron-proton mass ratio",
        "electron volt", "elementary charge", "Planck constant", "proton mass",
        "Rydberg constant", "Rydberg constant times hc in eV",
        "Rydberg constant times hc in J", "speed of light in vacuum",
        "vacuum electric permittivity",
    ]
    return {
        "schema_version": 1,
        "model": "spinless nonrelativistic point-nucleus Coulomb; Z=1; reduced electron-proton mass",
        "precision": {
            "decimal_significant_digits": 17,
            "physical_accuracy": "limited by CODATA inputs and the stated Coulomb model",
            "exact_string_syntax": "SymPy; x=r/a_mu",
        },
        "units": {"R": "a_mu^(-3/2)", "r": "a_mu",
                  "r_squared": "a_mu^2", "inverse_r": "a_mu^(-1)"},
        "radial": radial_data,
        "constants": {
            name: {"value": digits(value), "unit": unit,
                   "first_order_uncertainty_scale_upper_bound": digits(uncertainties[name])}
            for name, (value, unit) in values.items()
        },
        "codata_inputs": {
            name: {"line": rows[name]["line"], "source_line": rows[name]["text"],
                   "value_exact_decimal": str(rows[name]["value"]),
                   "standard_uncertainty_exact_decimal": str(rows[name]["uncertainty"]),
                   "unit": rows[name]["unit"]}
            for name in used
        },
        "checks": {
            "radial_norms_exact": 21, "radial_equations_exact": 10,
            "spherical_harmonic_inner_products_exact": 81,
            "explicit_wavefunction_norms_exact": 14,
            "moments_exact": 30, "radial_cdfs_exact": 6,
            "lecture_defects": lecture_checks,
            "lecture_line_57_bohr_radius_minus_codata_2022_m": "3.59e-20",
            "cloud_convolution_relative_tolerance": "1e-14",
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify", action="store_true",
                        help="check identities and compare golden.json without writing")
    args = parser.parse_args()
    check_coordinates()
    check_laguerre()
    check_radial_normalization()
    check_radial_equation()
    amplitudes = check_spherical_harmonics()
    explicit = check_wavefunctions(amplitudes)
    lecture_checks = check_lecture_formulas(explicit)
    check_moments()
    check_cdf()
    rows = read_codata()
    values, uncertainties = check_constants(rows)
    print("Exact symbolic checks passed.")
    check_cloud_convolution(rows)
    data = make_golden(rows, values, uncertainties, lecture_checks)
    serialized = (json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False)
                  + "\n").encode("utf-8")
    if args.verify:
        require(OUTPUT.read_bytes() == serialized, "golden.json byte mismatch")
        print("golden.json reproduced byte-for-byte.")
    else:
        OUTPUT.write_bytes(serialized)
        print("golden.json regenerated.")
    print("SHA256", hashlib.sha256(serialized).hexdigest())
    print("CDF tail polynomials:")
    for n in range(1, 4):
        for ell in range(n):
            print(n, ell, sp.sstr(cdf_polynomial(n, ell)))
    print("Constants (central value; first-order uncertainty scale upper bound):")
    for name, (value, unit) in values.items():
        print(name, digits(value), unit, digits(uncertainties[name]))


if __name__ == "__main__":
    main()
