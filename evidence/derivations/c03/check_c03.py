#!/usr/bin/env python3
"""Exact re-computation of the explicit numbers of chapter C3 (vl02 material).

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
print("ALL OK" if not fails else f"{len(fails)} FAILED")
sys.exit(1 if fails else 0)
