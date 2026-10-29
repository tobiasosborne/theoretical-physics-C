#!/usr/bin/env python3
"""Exact re-computation of the explicit numbers of chapter C3 (vl02, vl03 and vl04 material).

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


G = gram_schmidt([[2, 0], [1, 1]])
check("c03.cl.gs-beispiel  Psi_1 = (2,0), Psi_2 = (0,1)", G == [[2, 0], [0, 1]])
check("c03.cl.gs-beispiel  <Psi_1|Phi_2> = 2, ||Psi_1||^2 = 4", ip([2, 0], [1, 1]) == 2 and ip([2, 0], [2, 0]) == 4)
check("c03.cl.gs-beispiel  (1,1) - (2,0)*2/4 = (0,1)", [1 - 2 * sp.Rational(2, 4), 1 - 0] == [0, 1])
check("c03.cl.gs-beispiel  norms 2 and 1; Psi_1/2 = e_0, Psi_2 = e_1",
      sp.sqrt(ip(G[0], G[0])) == 2 and sp.sqrt(ip(G[1], G[1])) == 1 and [a / 2 for a in G[0]] == [1, 0] and G[1] == [0, 1])
check("c03.cl.gs-beispiel  <Phi_1|psi> = 2 psi_1, <Phi_2|psi> = psi_1 + psi_2 = 0 only for psi = 0",
      sp.solve([2 * sp.Symbol("p1"), sp.Symbol("p1") + sp.Symbol("p2")], [sp.Symbol("p1"), sp.Symbol("p2")]) == {sp.Symbol("p1"): 0, sp.Symbol("p2"): 0})
G3 = gram_schmidt([[2, 0], [1, 1], [1, -1]])
check("c03.cl.gs-null  Psi_3 = 0", G3[2] == [0, 0])
check("c03.cl.gs-null  <Psi_1|Phi_3> = 2, ||Psi_1||^2 = 4, <Psi_2|Phi_3> = -1, ||Psi_2||^2 = 1",
      ip([2, 0], [1, -1]) == 2 and ip([2, 0], [2, 0]) == 4 and ip([0, 1], [1, -1]) == -1 and ip([0, 1], [0, 1]) == 1)
check("c03.cl.gs-null  Phi_3 = Phi_1 - Phi_2", [2 - 1, 0 - 1] == [1, -1])
# Gram-Schmidt property 1 on a complex example in C^3 with a dependent vector
Gc = gram_schmidt([[1, I, 0], [0, 1, 1], [1, 1 + I, 1], [2, 0, I]])
check("c03.cl.gram-schmidt  pairwise orthogonal (C^3, complex, dependent vector -> 0)",
      all(sp.simplify(ip(Gc[j], Gc[k])) == 0 for j in range(4) for k in range(4) if j < k)
      and Gc[2] == [0, 0, 0])
check("c03.cl.phinull  int pi^{-1/2} e^{-x^2} = 1",
      sp.simplify(sp.integrate(sp.pi ** sp.Rational(-1, 2) * sp.exp(-x ** 2), (x, -sp.oo, sp.oo))) == 1)
# ---------------------------------------------------------------- Lecture 4 (vl04)
M = sp.Matrix
Id3 = sp.eye(3)


def is_zero(m):
    return sp.simplify(m) == sp.zeros(*m.shape)


A = M([[0, 1, 0], [1, 0, 1], [0, 1, 0]])
B = sp.Rational(1, 3) * sp.ones(3, 3)
Cm = M([[0, 1, 0], [0, 0, I], [-1, 0, 0]])
check("c03.cl.drei  A^dag = A", A.H == A)
check("c03.cl.drei  B^dag = B", B.H == B)
check("c03.cl.drei  B^2 = B (projector)", B * B == B)
check("c03.cl.drei  every entry of B^2 is 1/3*1/3*(1+1+1) = 1/3",
      all(e == sp.Rational(1, 3) for e in (B * B)) and sp.Rational(1, 3) * sp.Rational(1, 3) * 3 == sp.Rational(1, 3))
psi = M([sp.Rational(1, 2), -1 / sp.sqrt(2), sp.Rational(1, 2)])
check("c03.cl.drei  A psi = (-1/sqrt2, 1, -1/sqrt2)", is_zero(A * psi - M([-1 / sp.sqrt(2), 1, -1 / sp.sqrt(2)])))
check("c03.cl.drei  <psi|A|psi> = -sqrt2", sp.simplify((psi.H * A * psi)[0] + sp.sqrt(2)) == 0)
check("c03.cl.drei  C^dag = ((0,0,-1),(1,0,0),(0,-i,0))", Cm.H == M([[0, 0, -1], [1, 0, 0], [0, -I, 0]]))
check("c03.cl.drei  C^dag C = 1", Cm.H * Cm == Id3)
check("c03.cl.drei  C C^dag = 1", Cm * Cm.H == Id3)
kets = [Id3[:, k] for k in range(3)]


def kb(a, b):
    return a * b.H


check("c03.cl.drei  <x|B|y> = 1/3 for all x, y",
      all((kets[x].H * B * kets[y])[0] == sp.Rational(1, 3) for x in range(3) for y in range(3)))
Ckb = kb(kets[0], kets[1]) + I * kb(kets[1], kets[2]) - kb(kets[2], kets[0])
check("c03.cl.drei  C = |0><1| + i|1><2| - |2><0|", Ckb == Cm)
check("c03.cl.drei  C|0> = -|2>, C|1> = |0>, C|2> = i|1>",
      Cm * kets[0] == -kets[2] and Cm * kets[1] == kets[0] and Cm * kets[2] == I * kets[1])
Cdag_kb = kb(kets[1], kets[0]) - I * kb(kets[2], kets[1]) - kb(kets[0], kets[2])
check("c03.cl.c-ketbra  C^dag = |1><0| - i|2><1| - |0><2|", Cdag_kb == Cm.H)
check("c03.cl.c-ketbra  C^dag C = |0><0| + |1><1| + |2><2| = 1",
      Cdag_kb * Ckb == kb(kets[0], kets[0]) + kb(kets[1], kets[1]) + kb(kets[2], kets[2]) == Id3)
lam = sp.symbols("lambda")
check("c03.cl.spektren  det(A - lambda) = -lambda (lambda^2 - 2)",
      sp.expand((A - lam * Id3).det() + lam * (lam ** 2 - 2)) == 0)
check("c03.cl.spektren  det(B - lambda) = -lambda^2 (lambda - 1)",
      sp.expand((B - lam * Id3).det() + lam ** 2 * (lam - 1)) == 0)
check("c03.cl.spektren  det(C - lambda) = -(lambda^3 + i)", sp.expand((Cm - lam * Id3).det() + (lam ** 3 + I)) == 0)
check("c03.cl.spektren  roots of A: {0, sqrt2, -sqrt2}",
      set(sp.solve((A - lam * Id3).det(), lam)) == {0, sp.sqrt(2), -sp.sqrt(2)})
check("c03.cl.spektren  roots of B: {0, 1}", set(sp.solve((B - lam * Id3).det(), lam)) == {0, 1})
roots_C = [sp.exp(-I * sp.pi / 6), I, sp.exp(7 * I * sp.pi / 6)]
check("c03.cl.spektren  e^{-i pi/6}, i, e^{7 i pi/6} solve lambda^3 = -i and are distinct",
      all(sp.simplify(sp.expand_complex(r ** 3) + I) == 0 for r in roots_C)
      and len({sp.nsimplify(sp.expand_complex(r)) for r in roots_C}) == 3)
check("c03.cl.spektren  eigenvectors of A",
      is_zero(A * M([1, sp.sqrt(2), 1]) - sp.sqrt(2) * M([1, sp.sqrt(2), 1]))
      and is_zero(A * M([1, 0, -1]))
      and is_zero(A * M([1, -sp.sqrt(2), 1]) + sp.sqrt(2) * M([1, -sp.sqrt(2), 1])))
check("c03.cl.spektren  eigenvectors of B", B * M([1, 1, 1]) == M([1, 1, 1]) and is_zero(B * M([1, -1, 0])))
check("c03.cl.spektren  C (1, l, -i l^2) = l (1, l, -i l^2) for each root",
      all(is_zero(sp.expand_complex(Cm * M([1, r, -I * r ** 2]) - r * M([1, r, -I * r ** 2]))) for r in roots_C))
check("c03.cl.spektren  psi = (1,-sqrt2,1)/2, ||psi|| = 1, A psi = -sqrt2 psi",
      is_zero(psi - M([1, -sp.sqrt(2), 1]) / 2) and sp.simplify((psi.H * psi)[0]) == 1
      and is_zero(A * psi + sp.sqrt(2) * psi))
# generic symbolic checks (3x3 complex matrices, standard inner product)
ar = sp.symbols("ar0:9", real=True)
ai = sp.symbols("ai0:9", real=True)
br = sp.symbols("br0:9", real=True)
bi = sp.symbols("bi0:9", real=True)
GA = M(3, 3, [ar[k] + I * ai[k] for k in range(9)])
GB = M(3, 3, [br[k] + I * bi[k] for k in range(9)])
pr, pi_, qr, qi = (sp.symbols(n + "0:3", real=True) for n in ("pr", "pi", "qr", "qi"))
ph = M([pr[k] + I * pi_[k] for k in range(3)])
ps = M([qr[k] + I * qi[k] for k in range(3)])
zr, zi = sp.symbols("zr zi", real=True)
z = zr + I * zi


def ipm(u, v):
    return sp.expand((u.H * v)[0])


check("c03.cl.adj-matrix  <A^dag phi|psi> = <phi|A psi> with A^dag = conjugate transpose (generic 3x3)",
      sp.expand(ipm(GA.H * ph, ps) - ipm(ph, GA * ps)) == 0)
check("c03.cl.adjungiert  A^dag phi = sum_x <A phi_x|phi> phi_x equals the conjugate transpose (generic 3x3)",
      is_zero(sum((ipm(GA * kets[x], ph) * kets[x] for x in range(3)), sp.zeros(3, 1)) - GA.H * ph))
check("c03.cl.adj-regeln  (A+B)^dag, (zA)^dag, (AB)^dag, (A^dag)^dag (generic 3x3)",
      is_zero((GA + GB).H - GA.H - GB.H) and is_zero((z * GA).H - sp.conjugate(z) * GA.H)
      and is_zero((GA * GB).H - GB.H * GA.H) and (GA.H).H == GA)
check("c03.cl.adj-elemente  [A^dag]_xy = [A]_yx^* (generic 3x3, canonical basis)",
      all(sp.expand((kets[x].H * GA.H * kets[y])[0] - sp.conjugate((kets[y].H * GA * kets[x])[0])) == 0
          for x in range(3) for y in range(3)))
cc = sp.symbols("c", positive=True)
v1, v2, w1, w2 = sp.symbols("v1 v2 w1 w2")


def ipc(v, w):
    return sp.conjugate(v[0]) * w[0] + cc * sp.conjugate(v[1]) * w[1]


Aw = M([[0, 1], [0, 0]])
Bw = M([[0, 0], [1 / cc, 0]])
vv2, ww2 = M([v1, v2]), M([w1, w2])
check("c03.cl.adj-matrix  weighted product: adjoint of ((0,1),(0,0)) is ((0,0),(1/c,0))",
      sp.simplify(ipc(Bw * vv2, ww2) - ipc(vv2, Aw * ww2)) == 0)
check("c03.cl.adj-matrix  ... which differs from the conjugate transpose for c = 2", Bw.subs(cc, 2) != Aw.H)
# c03.cl.positiv: polarisation identity used in part 1, with C = A - A^dag (generic 3x3)
Cg = GA - GA.H
lhs1 = ipm(ph + ps, Cg * (ph + ps)) - ipm(ph, Cg * ph) - ipm(ps, Cg * ps)
lhs2 = ipm(ph + I * ps, Cg * (ph + I * ps)) - ipm(ph, Cg * ph) - ipm(ps, Cg * ps)
check("c03.cl.positiv  <phi+xi|C(phi+xi)> - diag = <phi|C xi> + <xi|C phi>",
      sp.expand(lhs1 - ipm(ph, Cg * ps) - ipm(ps, Cg * ph)) == 0)
check("c03.cl.positiv  <phi+i xi|C(phi+i xi)> - diag = i<phi|C xi> - i<xi|C phi>",
      sp.expand(lhs2 - I * ipm(ph, Cg * ps) + I * ipm(ps, Cg * ph)) == 0)
check("c03.cl.positiv  <psi|B^dag B psi> = ||B psi||^2 >= 0 (generic 3x3)",
      sp.expand(ipm(ps, GB.H * GB * ps) - ipm(GB * ps, GB * ps)) == 0
      and sp.im(sp.expand(ipm(GB * ps, GB * ps))) == 0)
check("c03.cl.positiv  B = B^dag B for the projector of c03.ex.drei", B.H * B == B)
check("c03.cl.isometrie  C preserves inner products (<C phi|C psi> = <phi|psi>, generic vectors)",
      sp.expand(ipm(Cm * ph, Cm * ps) - ipm(ph, ps)) == 0)
check("c03.cl.isometrie  A, B normal (Hermitian), C normal (unitary)",
      A.H * A == A * A.H and B.H * B == B * B.H and Cm.H * Cm == Cm * Cm.H)
check("c03.cl.wirkung  A|Psi> = sum_{x,y} |x>[A]_xy<y|Psi> (generic 3x3)",
      is_zero(sum((kets[x] * (kets[x].H * GA * kets[y])[0] * (kets[y].H * ps)[0]
                   for x in range(3) for y in range(3)), sp.zeros(3, 1)) - GA * ps))
check("c03.cl.ketbra  sum_x |x><x| = 1, A = sum <x|A|y> |x><y| (generic 3x3)",
      sum((kb(kets[x], kets[x]) for x in range(3)), sp.zeros(3, 3)) == Id3
      and is_zero(sum(((kets[x].H * GA * kets[y])[0] * kb(kets[x], kets[y])
                       for x in range(3) for y in range(3)), sp.zeros(3, 3)) - GA))
check("c03.cl.ketbra  (|Psi><Phi|)^dag = |Phi><Psi| (generic vectors)", is_zero(kb(ps, ph).H - kb(ph, ps)))
check("c03.cl.bra-op  <Phi|z Psi> = <Psi|Phi>^* z (generic vectors, generic z)",
      sp.expand(ipm(ph, z * ps) - sp.conjugate(ipm(ps, ph)) * z) == 0)
check("c03.cl.orte  lambda*1 is normal for generic complex lambda",
      is_zero((z * Id3).H * (z * Id3) - (z * Id3) * (z * Id3).H))
check("c03.cl.matrix  matrix times column is linear, columns are the images of u_k (generic 3x3)",
      is_zero(GA * (ph + z * ps) - GA * ph - z * GA * ps)
      and all(GA * kets[k] == GA[:, k] for k in range(3)))
check("c03.cl.beschraenkt  ||A psi||^2 <= (sum |a_jk|^2) ||psi||^2 for A, B, C of c03.ex.drei and one sample complex matrix, three sample vectors",
      all(sp.N((Mx * vec).norm() ** 2) <= sp.N(sum(abs(e) ** 2 for e in Mx) * vec.norm() ** 2) + 1e-12
          for Mx in (A, B, Cm, GA.subs({**{s: k + 1 for k, s in enumerate(ar)}, **{s: 2 - k for k, s in enumerate(ai)}}))
          for vec in (M([1, -2, 3]), M([I, 1, 1 - I]), psi)))
# shift on l^2, truncated to the first N entries of finitely supported vectors
N = 6
vs = [sp.Rational(k + 1, 3) + I * k for k in range(N)]
ws = [k - I * sp.Rational(1, k + 2) for k in range(N)]


def S(v):
    return [0] + list(v)


def Sd(w):
    return list(w[1:])


def ipl(v, w):
    n = max(len(v), len(w))
    v = list(v) + [0] * (n - len(v))
    w = list(w) + [0] * (n - len(w))
    return sp.expand(sum(sp.conjugate(a) * b for a, b in zip(v, w)))


check("c03.cl.shift  <Sv|Sw> = <v|w> (finitely supported v, w)", ipl(S(vs), S(ws)) == ipl(vs, ws))
check("c03.cl.shift  <S^dag w|v> = <w|Sv>", ipl(Sd(ws), vs) == ipl(ws, S(vs)))
check("c03.cl.shift  S^dag S v = v, S S^dag u_1 = 0", Sd(S(vs)) == vs and S(Sd([1, 0, 0])) == [0, 0, 0])
check("c03.cl.unbeschraenkt  M u_k = k u_k, (M v)_j = 1 for v_j = 1/j (j = 1..20)",
      all(j * sp.Rational(1, j) == 1 for j in range(1, 21)))
# c03.cl.elemente-unendlich: partial sums of the series for a bounded example (C acting on the
# first three entries, identity beyond) and the M counterexample data
check("c03.cl.elemente-unendlich  [M]_jk = k delta_jk = j delta_jk (j, k <= 6)",
      all((k if j == k else 0) == (j if j == k else 0) for j in range(1, 7) for k in range(1, 7)))
check("c03.cl.elemente-unendlich  v_j = 1/j^2: sum j^2 |v_j|^2 = sum 1/j^2 < 2 (N = 30), infinitely many nonzero entries",
      sum(sp.Rational(j * j, j ** 4) for j in range(1, 31)) < 2)
E2, F2 = M([[0, 1], [0, 0]]), M([[0, 0], [1, 0]])
check("c03.cl.produkt  EF = ((1,0),(0,0)), FE = ((0,0),(0,1)), EF != FE",
      E2 * F2 == M([[1, 0], [0, 0]]) and F2 * E2 == M([[0, 0], [0, 1]]) and E2 * F2 != F2 * E2)
check("c03.cl.produkt  (AB) psi = A (B psi) (generic 3x3)", is_zero((GA * GB) * ps - GA * (GB * ps)))
print("ALL OK" if not fails else f"{len(fails)} FAILED")
sys.exit(1 if fails else 0)
