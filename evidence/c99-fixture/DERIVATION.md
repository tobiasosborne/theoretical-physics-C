<!-- ROLE: derivation record for the derived claims of the contract-test chapter c99.
     Physics-free; integer 2x2 matrices only. Written by the Phase 0 evidence package.
     Claims point here as evidence/c99-fixture/DERIVATION.md#<anchor>; the anchors are the
     headings below. UPDATE POLICY: change together with evidence/claims.json. -->

# c99: derivations for the contract-test chapter

Premises: the stipulations S1-S3 of `STIPULATIONS.md` (A = (1 2; 0 1), B = (1 0; 3 1),
M(t) = (1 t; 0 1), f(t) = |t| by cases), the row-times-column rule for the product of
two 2x2 matrices, and the definitions T1 (trace) and T2 (commutator) of the chapter's
fixture registry. Matrices are written row by row, (a b; c d).

## products

AB = (1*1+2*3  1*0+2*1; 0*1+1*3  0*0+1*1) = (7 2; 3 1).
BA = (1*1+0*0  1*2+0*1; 3*1+1*0  3*2+1*1) = (1 2; 3 7).
The upper-left entries are 7 and 1, so AB != BA.
(Claims c99.cl.2, c99.cl.3, c99.cl.4.)

## mean-entry

The four entries of AB = (7 2; 3 1) sum to 7 + 2 + 3 + 1 = 13; divided by their number, 4,
that is 13/4 = 3.25 exactly (3 * 4 = 12, remainder 1, 1/4 = 0.25). (Claim c99.cl.19.)

## traces

By T1, tr(AB) = 7 + 1 = 8 and tr(BA) = 1 + 7 = 8. (Claim c99.cl.5.)

## trace-of-a-product

Let X, Y have entries x_jk, y_jk. The diagonal entries of the products are
(XY)_11 = x_11 y_11 + x_12 y_21, (XY)_22 = x_21 y_12 + x_22 y_22,
(YX)_11 = y_11 x_11 + y_12 x_21, (YX)_22 = y_21 x_12 + y_22 x_22.
Hence tr(XY) = x_11 y_11 + x_12 y_21 + x_21 y_12 + x_22 y_22, and tr(YX) is the sum of
the same four products of integers in another order. So tr(XY) = tr(YX) for all 2x2
matrices with entries in a commutative ring.
(Claims c99.cl.6, c99.cl.7, c99.cl.8, c99.cl.9.)

## commutator

By T2 and the section "products", [A, B] = AB - BA = (7-1  2-2; 3-3  1-7) = (6 0; 0 -6),
and its trace is 6 - 6 = 0. (Claim c99.cl.10.)

## shears

M(s)M(t) = (1*1+s*0  1*t+s*1; 0*1+1*0  0*t+1*1) = (1 s+t; 0 1) = M(s+t).
Induction on n >= 1 for M(t)^n = M(nt): n = 1 is trivial; if M(t)^n = M(nt) then
M(t)^(n+1) = M(nt)M(t) = M(nt + t) = M((n+1)t) by the product formula with s = nt.
(Claims c99.cl.12, c99.cl.13.)
Shears commute: M(s)M(t) = M(s+t) = M(t+s) = M(t)M(s), by the product formula used twice
and s + t = t + s for integers. (Claim c99.cl.18.)

## absolute-value

If t >= 0 then f(t) = t >= 0 and f(t)^2 = t^2. If t < 0 then f(t) = -t > 0 and
f(t)^2 = (-t)^2 = t^2. (Claim c99.cl.15.)

## group

From "shears": M(0)M(t) = M(0+t) = M(t) and M(t)M(-t) = M(t-t) = M(0); the same with the
factors exchanged because s + t = t + s. (Claim c99.cl.16.)

## trace-linear

For an integer c, tr(X + cY) = (x_11 + c y_11) + (x_22 + c y_22) = tr X + c tr Y by T1.
(Claim c99.cl.17.)
