#!/usr/bin/env python3
"""Exact re-computation of the explicit numbers of chapter C3 (vl02 and vl03 material).

Usage: python3 evidence/derivations/c03/check_c03.py
Prints one line per check and 'ALL OK' last; exit status 1 on any failure.
Uses sympy for exact complex arithmetic, integrals and the bounds of c03.eq.rate.
"""
import sys
import sympy as sp

I = sp.I
fails = []


def check(name, cond):
    ok = bool(cond)
    print(("ok   " if ok else "FAIL ") + name)
    if not ok:
        fails.append(name)


def dag(v):
    return [sp.conjugate(x) for x in v]


def ip(v, w):
    return sp.expand(sum(a * b for a, b in zip(dag(v), w)))


v, w = [1 + I, 1 - I], [1, -1]
check("c03.cl.c2  v+w", [sp.expand(a + b) for a, b in zip(v, w)] == [2 + I, -I])
check("c03.cl.c2  i v", [sp.expand(I * a) for a in v] == [-1 + I, 1 + I])
check("c03.cl.vw  v^dag w = -2i", ip(v, w) == -2 * I)
check("c03.cl.vw  w^dag v = 2i", ip(w, v) == 2 * I)
u = [1, I]
check("c03.cl.ohne-stern  sum v_j v_j = 0", sp.expand(sum(x * x for x in u)) == 0)
check("c03.cl.ohne-stern  v^dag v = 2", ip(u, u) == 2)
a, b = [I, 2], [1, I]
check("c03.cl.rechnen  3v", [3 * x for x in a] == [3 * I, 6])
check("c03.cl.rechnen  v+w", [sp.expand(x + y) for x, y in zip(a, b)] == [1 + I, 2 + I])
check("c03.cl.rechnen  v^dag w = i", ip(a, b) == I)
check("c03.cl.rechnen  w^dag v = -i", ip(b, a) == -I)
check("c03.cl.rechnen  v^dag v = 5", ip(a, a) == 5)
# raeume (a): |(1 +- i)/2|^2 = 1/2
check("c03.fig.raeume  |(1+i)/2|^2 = 1/2", sp.simplify(sp.Abs((1 + I) / 2) ** 2) == sp.Rational(1, 2))
# c03.eq.rate, N = 2..25 (and N = 1 for the harmonic bound)
for N in range(1, 26):
    s2 = sum(sp.Rational(1, j * j) for j in range(1, N + 1))
    h = sum(sp.Rational(1, j) for j in range(1, N + 1))
    if N >= 2:
        check(f"c03.cl.rate  sum 1/j^2 <= 2 - 1/N < 2, N={N}", s2 <= 2 - sp.Rational(1, N) and 2 - sp.Rational(1, N) < 2)
    check(f"c03.cl.rate  H_N >= ln(N+1), N={N}", h >= sp.log(N + 1))
x, y, X = sp.symbols("x y X", positive=True)
check("c03.cl.gauss  int e^{-x^2} = sqrt(pi)", sp.integrate(sp.exp(-x ** 2), (x, -sp.oo, sp.oo)) == sp.sqrt(sp.pi))
check("c03.cl.gauss  int e^{-y^2/2} = sqrt(2 pi)", sp.integrate(sp.exp(-y ** 2 / 2), (y, -sp.oo, sp.oo)) == sp.sqrt(2 * sp.pi))
check("c03.cl.gauss  2 int_0^X dx/(1+x) = 2 ln(1+X)", sp.simplify(2 * sp.integrate(1 / (1 + x), (x, 0, X)) - 2 * sp.log(1 + X)) == 0)
check("c03.cl.eins  int_{-X}^{X} 1 = 2X", sp.integrate(1, (x, -X, X)) == 2 * X)
# c03.eq.endlich, telescoping identity for M > N >= 1
for N in range(1, 12):
    for M in range(N + 1, 15):
        lhs = sum(sp.Rational(1, j * j) for j in range(N + 1, M + 1))
        tel = sum(sp.Rational(1, j - 1) - sp.Rational(1, j) for j in range(N + 1, M + 1))
        if not (lhs <= tel and tel == sp.Rational(1, N) - sp.Rational(1, M)):
            check(f"c03.cl.endlich N={N} M={M}", False)
check("c03.cl.endlich  telescoping bound for 1 <= N < M < 15", True)
# ---------------------------------------------------------------- Lecture 3 (vl03)
r2 = sp.sqrt(2)
e0, e1 = [1, 0], [0, 1]
ep = [1 / r2, 1 / r2]
em = [1 / r2, -1 / r2]
check("c03.cl.kets  e_+ = (e_0 + e_1)/sqrt2 = (1,1)/sqrt2",
      [sp.simplify(a / r2 + b / r2 - c) for a, b, c in zip(e0, e1, ep)] == [0, 0])
check("c03.cl.kets  e_- = (e_0 - e_1)/sqrt2 = (1,-1)/sqrt2",
      [sp.simplify(a / r2 - b / r2 - c) for a, b, c in zip(e0, e1, em)] == [0, 0])
check("c03.cl.braket  <e_0|e_+> = 1/sqrt2", sp.simplify(ip(e0, ep) - 1 / r2) == 0)
al, be = sp.symbols("alpha beta")
vv, ww = sp.symbols("v1:3"), sp.symbols("w1:3")
lhs = [sp.conjugate(al * a + be * b) for a, b in zip(vv, ww)]
rhs = [sp.conjugate(al) * sp.conjugate(a) + sp.conjugate(be) * sp.conjugate(b) for a, b in zip(vv, ww)]
check("c03.cl.bra-regel  (a v + b w)^dag = a* v^dag + b* w^dag (symbolic, n=2)",
      all(sp.simplify(sp.expand(x - y)) == 0 for x, y in zip(lhs, rhs)))
v3, w3 = [1, I], [1, 1]
check("c03.cl.dirac  <v|w> = 1 - i (columns)", ip(v3, w3) == 1 - I)
bra_v = [1, -I]  # <e_0| - i <e_1| as a row
check("c03.cl.dirac  <v| = <e_0| - i<e_1|", [sp.conjugate(x) for x in v3] == bra_v)
check("c03.cl.dirac  four bra-kets 1 + 0 - 0 - i",
      sp.expand(ip(e0, e0) + ip(e0, e1) - I * ip(e1, e0) - I * ip(e1, e1)) == 1 - I)
psi = sp.Symbol("psi")
check("c03.cl.warum-stern  bilinear: B(i psi, i psi) = - B(psi, psi)", sp.expand(I * I * psi) == -psi)
c = sp.Symbol("c", positive=True)
Bc = lambda v, w: sp.conjugate(v[0]) * w[0] + c * sp.conjugate(v[1]) * w[1]
z = sp.Symbol("z")
check("c03.cl.gewichtet  B_c(zv, w) = z* B_c(v, w)",
      sp.simplify(sp.expand(Bc([z * vv[0], z * vv[1]], ww) - sp.conjugate(z) * Bc(vv, ww))) == 0)
u1, t1, u2, t2 = sp.symbols("u1 t1 u2 t2", real=True)
vr = [u1 + I * t1, u2 + I * t2]
check("c03.cl.gewichtet  B_c(v, v) = |v1|^2 + c|v2|^2 (real and imaginary parts)",
      sp.expand(Bc(vr, vr) - (u1 ** 2 + t1 ** 2 + c * (u2 ** 2 + t2 ** 2))) == 0)
check("c03.cl.gewichtet  B_c(e_1, e_1) = c", Bc(e1, e1) == c)
check("c03.cl.gewichtet  B_1 = v^dag w", sp.expand(Bc(vv, ww).subs(c, 1) - ip(list(vv), list(ww))) == 0)
row_c = [sp.conjugate(vv[0]), c * sp.conjugate(vv[1])]  # the bra <v| for B_c as a row
check("c03.cl.gewichtet  B_c(v, w) = (v1*, c v2*) w",
      sp.expand(Bc(vv, ww) - (row_c[0] * ww[0] + row_c[1] * ww[1])) == 0)
check("c03.cl.gewichtet  row (v1*, c v2*) - v^dag = (0, (c - 1) v2*)",
      sp.expand(row_c[1] - sp.conjugate(vv[1]) - (c - 1) * sp.conjugate(vv[1])) == 0)
check("c03.cl.orthogonal  <e_+|e_-> = 0", sp.simplify(ip(ep, em)) == 0)
check("c03.cl.orthogonal  ||e_+|| = ||e_-|| = 1", sp.simplify(ip(ep, ep)) == 1 and sp.simplify(ip(em, em)) == 1)
check("c03.cl.orthogonal  <e_0|e_1> = 0, norms 1", ip(e0, e1) == 0 and ip(e0, e0) == 1 and ip(e1, e1) == 1)
A, B = sp.symbols("A B")
psiv = [A, B]
check("c03.cl.basis  <e_+-|psi> = (alpha +- beta)/sqrt2",
      sp.simplify(ip(ep, psiv) - (A + B) / r2) == 0 and sp.simplify(ip(em, psiv) - (A - B) / r2) == 0)
x1, y1, x2, y2 = sp.symbols("x1 y1 x2 y2", real=True)
Al, Be = x1 + I * y1, x2 + I * y2
m2 = lambda q: sp.expand(q * sp.conjugate(q))
check("c03.cl.basis  (|a+b|^2 + |a-b|^2)/2 = |a|^2 + |b|^2",
      sp.simplify(sp.Rational(1, 2) * (m2(Al + Be) + m2(Al - Be)) - m2(Al) - m2(Be)) == 0)
check("c03.cl.basis  ||psi||^2 = |a|^2 + |b|^2 in basis e_0, e_1",
      sp.simplify(ip([Al, Be], [Al, Be]) - m2(Al) - m2(Be)) == 0)
Psi = [2 / sp.sqrt(5), 1 / sp.sqrt(5)]
c0, c1, cp, cm = ip(e0, Psi), ip(e1, Psi), ip(ep, Psi), ip(em, Psi)
check("c03.cl.zwei-basen  c_0 = 2/sqrt5, c_1 = 1/sqrt5",
      sp.simplify(c0 - 2 / sp.sqrt(5)) == 0 and sp.simplify(c1 - 1 / sp.sqrt(5)) == 0)
check("c03.cl.zwei-basen  c_+- = (2 +- 1)/sqrt10",
      sp.simplify(cp - 3 / sp.sqrt(10)) == 0 and sp.simplify(cm - 1 / sp.sqrt(10)) == 0)
w8 = [sp.nsimplify(sp.simplify(q ** 2)) for q in (c0, c1, cp, cm)]
check("c03.cl.zwei-basen  weights 4/5, 1/5, 9/10, 1/10",
      w8 == [sp.Rational(4, 5), sp.Rational(1, 5), sp.Rational(9, 10), sp.Rational(1, 10)])
check("c03.cl.zwei-basen  sums 1 = ||Psi||^2",
      w8[0] + w8[1] == 1 and w8[2] + w8[3] == 1 and sp.simplify(ip(Psi, Psi)) == 1)
comp = {"c0 e0": [c0 * x for x in e0], "c1 e1": [c1 * x for x in e1],
        "c+ e+": [cp * x for x in ep], "c- e-": [cm * x for x in em]}
printed = {"c0 e0": (0.894427, 0), "c1 e1": (0, 0.447214), "c+ e+": (0.670820, 0.670820),
           "c- e-": (0.223607, -0.223607)}
check("c03.fig.vollst  printed coordinates within 5e-7",
      all(abs(float(comp[k][i]) - printed[k][i]) < 5e-7 for k in comp for i in (0, 1)))
check("c03.fig.vollst  both rectangles have diagonal Psi",
      all(sp.simplify(comp["c0 e0"][i] + comp["c1 e1"][i] - Psi[i]) == 0
          and sp.simplify(comp["c+ e+"][i] + comp["c- e-"][i] - Psi[i]) == 0 for i in (0, 1)))
for n in range(1, 5):
    ps = sp.symbols(f"p1:{n + 1}")
    us = [[1 if l == j else 0 for l in range(n)] for j in range(n)]
    ok = all(ip(us[j], us[k]) == (1 if j == k else 0) for j in range(n) for k in range(n))
    ok = ok and sp.simplify(sum(m2(ip(u, list(ps))) for u in us) - ip(list(ps), list(ps))) == 0
    check(f"c03.cl.kanonisch  n={n}", ok)


def gram_schmidt(Phis):
    Psis = []
    for Ph in Phis:
        P = list(Ph)
        for Pk in Psis:
            nk = ip(Pk, Pk)
            if nk == 0:
                continue
            f = ip(Pk, Ph) / nk
            P = [sp.simplify(a - b * f) for a, b in zip(P, Pk)]
        Psis.append(P)
    return Psis


G = gram_schmidt([[1, 0], [1, 1]])
check("c03.cl.gs-beispiel  Psi_1 = (1,0), Psi_2 = (0,1)", G == [[1, 0], [0, 1]])
check("c03.cl.gs-beispiel  <Psi_1|Phi_2> = 1, ||Psi_1||^2 = 1", ip([1, 0], [1, 1]) == 1 and ip([1, 0], [1, 0]) == 1)
G3 = gram_schmidt([[1, 0], [1, 1], [1, -1]])
check("c03.cl.gs-null  Psi_3 = 0", G3[2] == [0, 0])
check("c03.cl.gs-null  <Psi_1|Phi_3> = 1, <Psi_2|Phi_3> = -1", ip([1, 0], [1, -1]) == 1 and ip([0, 1], [1, -1]) == -1)
check("c03.cl.gs-null  Phi_3 = 2 Phi_1 - Phi_2", [2 * 1 - 1, 2 * 0 - 1] == [1, -1])
# Gram-Schmidt property 1 on a complex example in C^3 with a dependent vector
Gc = gram_schmidt([[1, I, 0], [0, 1, 1], [1, 1 + I, 1], [2, 0, I]])
check("c03.cl.gram-schmidt  pairwise orthogonal (C^3, complex, dependent vector -> 0)",
      all(sp.simplify(ip(Gc[j], Gc[k])) == 0 for j in range(4) for k in range(4) if j < k)
      and Gc[2] == [0, 0, 0])
check("c03.cl.phinull  int pi^{-1/2} e^{-x^2} = 1",
      sp.simplify(sp.integrate(sp.pi ** sp.Rational(-1, 2) * sp.exp(-x ** 2), (x, -sp.oo, sp.oo))) == 1)
print("ALL OK" if not fails else f"{len(fails)} FAILED")
sys.exit(1 if fails else 0)
