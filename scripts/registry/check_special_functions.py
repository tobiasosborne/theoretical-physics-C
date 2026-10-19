#!/usr/bin/env python3
"""Exact-arithmetic check of the special-function conventions recorded in
registry/conventions.json (CONV-LAGUERRE) and of the radial normalisation
quoted in definition D66 from latex/lectures/de/vl16.tex:45.

It checks, with fractions only (no floating point):
  1. the explicit sum L_k^{(a)}(x) = sum_i (-1)^i binom(k+a, k-i) x^i / i!
     gives L_0 = 1, L_1 = -x + a + 1, L_2 = x^2/2 - (a+2)x + (a+1)(a+2)/2;
  2. orthogonality int_0^inf x^a e^{-x} L_j L_k dx = delta_jk (k+a)!/k!;
  3. with rho = 2 kappa r, the radial function
        R_nl = sqrt((n-l-1)! (2 kappa)^3 / (2n (n+l)!)) rho^l e^{-rho/2} L_{n-l-1}^{(2l+1)}(rho)
     has norm one, int_0^inf R_nl(r)^2 r^2 dr = 1, for every 1 <= n <= 6, 0 <= l < n.

This is an independent sanity check by the implementer. It does not replace
the reviewer's derivation; the registry entries stay needs_check until then.
Exit status 0 when all checks pass.
"""
import sys
from fractions import Fraction as Fr
from math import comb, factorial


def laguerre(k, a):
    """Coefficient list (ascending powers) of L_k^{(a)}, integer a >= 0."""
    return [Fr((-1) ** i * comb(k + a, k - i), factorial(i)) for i in range(k + 1)]


def mul(p, q):
    out = [Fr(0)] * (len(p) + len(q) - 1)
    for i, x in enumerate(p):
        for j, y in enumerate(q):
            out[i + j] += x * y
    return out


def gamma_int(p, shift):
    """int_0^inf x^shift e^{-x} p(x) dx, exactly."""
    return sum(c * factorial(i + shift) for i, c in enumerate(p))


def main():
    bad = 0
    for a in range(0, 8):
        want = {0: [Fr(1)], 1: [Fr(a + 1), Fr(-1)],
                2: [Fr((a + 1) * (a + 2), 2), Fr(-(a + 2)), Fr(1, 2)]}
        for k, w in want.items():
            if laguerre(k, a) != w:
                bad += 1
                print(f"FAIL low-order polynomial k={k} a={a}")
        for j in range(6):
            for k in range(6):
                v = gamma_int(mul(laguerre(j, a), laguerre(k, a)), a)
                w = Fr(factorial(k + a), factorial(k)) if j == k else 0
                if v != w:
                    bad += 1
                    print(f"FAIL orthogonality j={j} k={k} a={a}: {v}")
    for n in range(1, 7):
        for l in range(n):
            L = laguerre(n - l - 1, 2 * l + 1)
            # int R^2 r^2 dr = (n-l-1)!/(2n (n+l)!) * int rho^{2l+2} e^{-rho} L^2 d rho
            v = Fr(factorial(n - l - 1), 2 * n * factorial(n + l)) * gamma_int(mul(L, L), 2 * l + 2)
            if v != 1:
                bad += 1
                print(f"FAIL radial norm n={n} l={l}: {v}")
    print("special-function checks:", "FAILED" if bad else "all passed "
          "(Laguerre low orders, orthogonality a=0..7 j,k=0..5, radial norm n=1..6)")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
