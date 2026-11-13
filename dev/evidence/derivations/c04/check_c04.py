#!/usr/bin/env python3
"""Exact re-computation of the explicit identities of chapter C4 (vl06 material).

Usage: python3 evidence/derivations/c04/check_c04.py
Prints one line per check and 'ALL OK' last; exit status 1 on any failure.
Uses sympy for exact complex arithmetic.
"""
import sys
import sympy as sp

I = sp.I
M = sp.Matrix
fails = []


def check(name, cond):
    ok = bool(cond)
    print(("ok   " if ok else "FAIL ") + name)
    if not ok:
        fails.append(name)


def herm(X):
    return X.conjugate().T


def tr(X):
    return sp.simplify(sum(X[k, k] for k in range(X.shape[0])))


def is_zero(X):
    return all(sp.simplify(e) == 0 for e in X)


def psd(X):
    """All eigenvalues of the Hermitian matrix X are >= 0 (numerically, 30 digits)."""
    return all(sp.re(sp.N(ev, 30)) >= -1e-25 and abs(sp.im(sp.N(ev, 30))) < 1e-20 for ev in X.eigenvals())


# ---------------------------------------------------------------- c04.cl.funktionale
# omega(A) = tr(R A) for a fixed density matrix R; rebuild R from omega(|x><y|) as in the proof
R = M([[sp.Rational(1, 2), sp.Rational(1, 4) - I / 8, 0],
       [sp.Rational(1, 4) + I / 8, sp.Rational(1, 3), I / 10],
       [0, -I / 10, sp.Rational(1, 6)]])
check("c04.cl.funktionale  test matrix is a density operator (Hermitian, trace 1, eigenvalues >= 0)",
      is_zero(R - herm(R)) and tr(R) == 1 and psd(R))
can = [M([1, 0, 0]), M([0, 1, 0]), M([0, 0, 1])]
omega = lambda A: tr(R * A)
Rb = M(3, 3, lambda y, x: omega(can[x] * herm(can[y])))
check("c04.cl.funktionale  <y|rho|x> := omega(|x><y|) recovers rho", is_zero(Rb - R))
A = M([[1, 2 + I, 0], [-I, 3, 1], [4, 0, -2]])
check("c04.cl.funktionale  omega(A) = sum_xy <x|A|y> omega(|x><y|)",
      sp.simplify(omega(A) - sum(A[x, y] * omega(can[x] * herm(can[y])) for x in range(3) for y in range(3))) == 0)

# ---------------------------------------------------------------- c04.cl.rein
psi = M([1, I, 1 - I]) / 2
P = psi * herm(psi)
check("c04.cl.rein  |psi><psi| with ||psi|| = 1 has trace 1, P^2 = P", tr(P) == 1 and is_zero(P * P - P))
mix = sp.Rational(3, 4) * can[0] * herm(can[0]) + sp.Rational(1, 4) * can[1] * herm(can[1])
check("c04.cl.rein  diag(3/4, 1/4, 0) is a proper mixture: rank 2", mix.rank() == 2)

# ---------------------------------------------------------------- qubit states and the ball
p, xr, xi = sp.symbols('p x_r x_i', real=True)
x = xr + I * xi
rho = M([[p, x], [sp.conjugate(x), 1 - p]])
lam = sp.symbols('lambda')
check("c04.cl.eigenwerte  det(rho - lambda) = lambda^2 - lambda + p(1-p) - |x|^2",
      sp.expand((rho - lam * sp.eye(2)).det() - (lam ** 2 - lam + p * (1 - p) - (xr ** 2 + xi ** 2))) == 0)
check("c04.cl.qubit-zustaende  p(1-p) - |x|^2 = 1/4 - ((p - 1/2)^2 + |x|^2)",
      sp.expand(p * (1 - p) - (xr ** 2 + xi ** 2) - (sp.Rational(1, 4) - ((p - sp.Rational(1, 2)) ** 2 + xr ** 2 + xi ** 2))) == 0)
rx, ry, rz = sp.symbols('r_x r_y r_z', real=True)
sx, sy, sz = M([[0, 1], [1, 0]]), M([[0, -I], [I, 0]]), M([[1, 0], [0, -1]])
bloch = (sp.eye(2) + rx * sx + ry * sy + rz * sz) / 2
sub = {p: (1 + rz) / 2, xr: rx / 2, xi: -ry / 2}
check("c04.cl.qubit-zustaende  r_z = 2p - 1, x = (r_x - i r_y)/2 gives rho(r) of c02.eq.bloch",
      is_zero(rho.subs(sub) - bloch))
check("c04.cl.qubit-zustaende  (p - 1/2)^2 + |x|^2 = |r|^2/4",
      sp.expand(((p - sp.Rational(1, 2)) ** 2 + xr ** 2 + xi ** 2).subs(sub) - (rx ** 2 + ry ** 2 + rz ** 2) / 4) == 0)

# ---------------------------------------------------------------- effects, Born rule, measurements
F0 = M([[1, 0], [0, 0]])
check("c04.cl.z-messung  F = |0><0| projector, I - F = |1><1|",
      is_zero(F0 * F0 - F0) and is_zero(sp.eye(2) - F0 - M([[0, 0], [0, 1]])))
check("c04.cl.born  rho F = ((p,0),(x*,0)), tr(rho F) = p",
      is_zero(rho * F0 - M([[p, 0], [sp.conjugate(x), 0]])) and sp.simplify(tr(rho * F0) - p) == 0)
ph = M([sp.Rational(3, 5), 4 * I / 5])
Fg = M([[sp.Rational(1, 2), I / 4], [-I / 4, sp.Rational(1, 3)]])
check("c04.cl.born-rein  tr(|psi><psi|F) = <psi|F|psi>", sp.simplify(tr(ph * herm(ph) * Fg) - (herm(ph) * Fg * ph)[0]) == 0)
q = sp.symbols('q', positive=True)
Fq = q * F0
check("c04.cl.wirkungsgrad  tr(rho q|0><0|) = q p, F^2 - F = (q^2 - q)|0><0|",
      sp.simplify(tr(rho * Fq) - q * p) == 0 and is_zero(Fq * Fq - (q ** 2 - q) * F0 - Fq))
Fx = [M([[sp.Rational(1, 2), 0], [0, 0]]), M([[sp.Rational(1, 4), I / 8], [-I / 8, sp.Rational(1, 4)]])]
Fx.append(sp.eye(2) - Fx[0] - Fx[1])
check("c04.cl.verteilung  a three-outcome POVM: each F_x >= 0, sum = I, probabilities sum to 1",
      all(psd(Fk) for Fk in Fx)
      and sp.simplify(sum(tr(rho * Fk) for Fk in Fx) - 1) == 0)
vals = [-1, 0, 2]
Aobs = sum((v * Fk for v, Fk in zip(vals, Fx)), sp.zeros(2, 2))
check("c04.cl.erwartung  sum_x x tr(rho F_x) = tr(rho A), A Hermitian",
      sp.simplify(sum(v * tr(rho * Fk) for v, Fk in zip(vals, Fx)) - tr(rho * Aobs)) == 0 and is_zero(Aobs - herm(Aobs)))
# c04.cl.pvm on the operator A of c03.ex.drei
A3 = M([[0, 1, 0], [1, 0, 1], [0, 1, 0]])
evs = {}
for val, mult, vecs in A3.eigenvects():
    Q = sp.zeros(3, 3)
    for v in sp.GramSchmidt(vecs, True):
        Q += v * herm(v)
    evs[val] = sp.simplify(Q)
check("c04.cl.pvm  eigenprojectors of A: sum = I, P_l P_m = 0, sum l P_l = A",
      is_zero(sum(evs.values(), sp.zeros(3, 3)) - sp.eye(3))
      and all(is_zero(evs[a] * evs[b]) for a in evs for b in evs if a != b)
      and is_zero(sum((a * Q for a, Q in evs.items()), sp.zeros(3, 3)) - A3))

# ---------------------------------------------------------------- dynamics
t, eps, hb, r, phi = sp.symbols('t epsilon hbar r varphi', real=True)
s = eps * t / hb
U = sp.cos(s) * sp.eye(2) - I * sp.sin(s) * sx
check("c04.cl.dynamik  <A>(t) = tr(U rho U^dag A) = tr(rho U^dag A U) (checked for a generic 2x2 A)", sp.simplify(tr(U * rho * herm(U) * Fg) - tr(rho * herm(U) * Fg * U)) == 0)
check("c04.cl.dynamik-zulaessig  U unitary, U rho U^dag has trace 1", is_zero(sp.simplify(herm(U) * U - sp.eye(2))) and sp.simplify(tr(U * rho * herm(U)) - 1) == 0)
check("c04.cl.qubit-dynamik  |<0|U_t|0>|^2 = cos^2(eps t/hbar)", sp.simplify(sp.expand(U[0, 0] * sp.conjugate(U[0, 0])) - sp.cos(s) ** 2) == 0)
rho_c = M([[sp.Rational(1, 2) + r * sp.cos(phi), I * r * sp.sin(phi)], [-I * r * sp.sin(phi), sp.Rational(1, 2) - r * sp.cos(phi)]])
rt = (U * rho_c * herm(U)).applyfunc(sp.simplify)
check("c04.cl.qubit-dynamik  p_t - 1/2 = r cos(phi + 2 eps t/hbar), x_t = i r sin(phi + 2 eps t/hbar)",
      sp.simplify(sp.expand_trig(rt[0, 0] - sp.Rational(1, 2) - r * sp.cos(phi + 2 * s))) == 0
      and sp.simplify(sp.expand_trig(rt[0, 1] - I * r * sp.sin(phi + 2 * s))) == 0)
check("c04.cl.qubit-dynamik  figure: r = 3/10, phi = 70 deg gives (p, Im x) = (0.6026, 0.2819)",
      abs(float(sp.Rational(1, 2) + sp.Rational(3, 10) * sp.cos(sp.rad(70))) - 0.6026) < 5e-5
      and abs(float(sp.Rational(3, 10) * sp.sin(sp.rad(70))) - 0.2819) < 5e-5)

# ---------------------------------------------------------------- c04.cl.singulaer (finite truncation sanity)
# For F of finite rank on C^N with N larger than the rank, some unit v has F v = 0 and ||(cI + F)v|| = |c|.
Ff = M([[1, 2, 0, 0, 0], [0, 1, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]])
ker = Ff.nullspace()
check("c04.cl.singulaer  finite-rank F on C^5 (rank 2) has a 3-dimensional kernel", len(ker) == 3)

print("ALL OK" if not fails else f"{len(fails)} FAILED")
sys.exit(1 if fails else 0)
