#!/usr/bin/env python3
"""Formula gate of chapter C11 (hydrogen): the printed closed formulas are right.

Usage:
  python3 scripts/c11/check_c11_formulas.py [--content DIR] [--only ID,ID] [--quiet]

DIR is the chapter directory with de.tex, en.tex and formulas.json
(default: content/c11-wasserstoff).  Exit status 1 if any check fails; each
failure is one line "<CLASS> <id>: <what>".

What is gated. A display row (an unstarred `equation`, or one row of an
unstarred `align`) is
"of this kind" when its left-hand side is exactly one of

    \\Ylm{l}{m}(...)     \\Rnl{n}{l}(...)     \\psinlm{n}{l}{m}(...)     \\Lag{k}{alpha}(...)

with numeric indices (m may be written \\pm m; the upper index of \\Lag may be
a symbol) applied to an argument list.  Relations between such functions
(\\psinlm{2}{1}{-1} = -\\overline{...}), definitions with symbolic indices and
integrals are not of this kind. Starred displays, CDFs and registry-inserted
\\tpcdef bodies are outside discovery. Every display of this kind in de.tex and
en.tex must be listed in formulas.json, and every listed formula is checked:

  [unlisted]   a display of this kind whose equation ID is not in formulas.json,
               or which has no \\label at all
  [missing]    a listed ID that is not a display in de.tex or en.tex
  [tex]        the listed TeX is not byte-identical to the display with that
               ID (the row without its \\label, its \\claim and the row
               separator, stripped of surrounding white space), in each language
  [indices]    kind or quantum numbers of the entry differ from the left-hand side
  [mismatch]   TeX/expression mismatch: the right-hand side of the TeX, read by
               the parser below, is not the listed SymPy expression
  [laguerre]   a Laguerre polynomial differs from its defining sum (registry
               definition D68) or does not solve x L'' + (alpha+1-x) L' + k L = 0
  [harmonic]   a spherical harmonic is not normalised on the sphere, or differs
               from the formula of registry definition D67
  [radial]     a radial function is not normalised (integral of R^2 r^2), does
               not solve the radial equation with E_n, or differs from the
               formula of registry definition D66
  [norm]       a wave function is not normalised; the message gives the norm squared
  [orthogonal] two listed radial functions of equal l, two listed harmonics, or
               two listed wave functions of different (n, l, m) are not orthogonal
  [schroedinger] a wave function does not solve
               -Lap psi - (2Z/(a r)) psi = -(Z/(n a))^2 psi   (H_rel psi = E_n psi
               divided by hbar^2/(2 mu); a = a_mu), computed with the Cartesian
               Laplacian, so that the check does not rest on the separation in
               spherical coordinates
  [product]    a wave function differs from the reference R_nl Y_lm of D66/D67,
               including when --only filters out the radial/harmonic entries
  [condon-shortley] psi_{n,l,-m} is not (-1)^m conj(psi_{n,l,m}), or the same for
               the harmonics: the Condon-Shortley convention of D67

All integrals and identities are evaluated with SymPy in exact arithmetic; no
floating-point tolerance is used.

Variable conventions of the SymPy expressions in formulas.json:
  r, theta, phi   spherical coordinates of the relative coordinate (r > 0)
  Z               nuclear charge number (positive)
  a               the Bohr radius a_mu WITH THE REDUCED MASS (positive)
  x, alpha        argument and upper index of a Laguerre polynomial
  pi, I, exp, sin, cos, sqrt, conjugate as in SymPy
An entry written with \\pm in TeX carries one expression per sign:
"expr": {"+": "...", "-": "..."}, the upper and the lower signs.

The TeX parser reads the small language in which these displays are written:
\\frac, \\sqrt, ^, e^{...}, \\cos, \\sin (with a power), \\pi, i, \\pm, \\mp,
numbers, parentheses, juxtaposition as product, a/b for division,
\\Znuc -> Z, \\rad -> r, \\aRed -> a, \\theta, \\phi, \\alpha, x.  Anything
else is reported as [mismatch] "cannot read".

What this gate cannot establish: that the formulas listed are the ones the
text means to print (it compares what is printed with what is listed and
checks both); the physics of the model; anything about displays that are not
of this kind (moments, distribution functions, energies).
"""
import argparse
import json
import pathlib
import re
import sys

import sympy as sp

ROOT = pathlib.Path(__file__).resolve().parents[2]
DEFAULT = ROOT / "content" / "c11-wasserstoff"

r, Z, a = sp.symbols("r Z a", positive=True)
theta, phi = sp.symbols("theta phi", real=True)
x, alpha = sp.symbols("x alpha", positive=True)
X1, X2, X3 = sp.symbols("X1 X2 X3", real=True)
LOCALS = {"r": r, "Z": Z, "a": a, "theta": theta, "phi": phi, "x": x, "alpha": alpha,
          "pi": sp.pi, "I": sp.I, "exp": sp.exp, "sin": sp.sin, "cos": sp.cos,
          "sqrt": sp.sqrt, "conjugate": sp.conjugate}

failures = []


def fail(cls, where, what):
    failures.append(f"[{cls}] {where}: {what}")


# ---------------------------------------------------------------- TeX side

def strip_comments(text):
    return re.sub(r"(?<!\\)%.*", "", text)


def displays(text):
    """Return [(label or None, body)] for rows of unstarred equation/align only."""
    out = []
    text = strip_comments(text)
    for m in re.finditer(r"\\begin\{(equation|align)\}(.*?)\\end\{\1\}", text, re.S):
        body = m.group(2)
        rows = [body] if m.group(1) == "equation" else split_rows(body)
        for row in rows:
            lab = re.search(r"\\label\{([^}]*)\}", row)
            row = re.sub(r"\\label\{[^}]*\}", "", row)
            row = re.sub(r"\\claim(\[[^\]]*\])?\{[^}]*\}\{[^}]*\}", "", row)
            row = re.sub(r"\\notag", "", row)
            out.append((lab.group(1) if lab else None, row.strip()))
    return out


def split_rows(body):
    """Split an align body at the row separators that are not inside an inner environment."""
    rows, depth, cur, i = [], 0, "", 0
    while i < len(body):
        if body.startswith("\\begin{", i):
            depth += 1
        elif body.startswith("\\end{", i):
            depth -= 1
        if depth == 0 and body.startswith("\\\\", i):
            rows.append(cur)
            cur = ""
            i += 2
            continue
        cur += body[i]
        i += 1
    rows.append(cur)
    return rows


IDX = r"\{\s*(\\pm\s*)?(-?\d+)\s*\}"
LHS = {
    "harmonic": re.compile(r"^\\Ylm\{\s*(\d+)\s*\}" + IDX + r"\s*\(.*\)$", re.S),
    "radial": re.compile(r"^\\Rnl\{\s*(\d+)\s*\}\{\s*(\d+)\s*\}\s*\(.*\)$", re.S),
    "wavefunction": re.compile(r"^\\psinlm\{\s*(\d+)\s*\}\{\s*(\d+)\s*\}" + IDX + r"\s*\(.*\)$", re.S),
    "laguerre": re.compile(r"^\\Lag\{\s*(\d+)\s*\}\{([^{}]*)\}\s*\(.*\)$", re.S),
}


def classify(body):
    """(kind, indices) if the row is of the gated kind, else None."""
    if "=" not in body:
        return None
    lhs = body.split("=", 1)[0].replace("&", "").strip()
    for kind, rx in LHS.items():
        m = rx.match(lhs)
        if not m:
            continue
        if kind == "harmonic":
            return kind, {"l": int(m.group(1)), "pm": bool(m.group(2)), "m": int(m.group(3))}
        if kind == "radial":
            return kind, {"n": int(m.group(1)), "l": int(m.group(2))}
        if kind == "wavefunction":
            return kind, {"n": int(m.group(1)), "l": int(m.group(2)), "pm": bool(m.group(3)),
                          "m": int(m.group(4))}
        return kind, {"k": int(m.group(1)), "alpha": m.group(2).strip()}
    return None


class CannotRead(Exception):
    pass


SYMBOLS = {"\\Znuc": Z, "\\rad": r, "\\aRed": a, "\\theta": theta, "\\phi": phi,
           "\\pi": sp.pi, "\\alpha": alpha, "x": x, "i": sp.I}
DROP = {"\\left", "\\right", "\\bigl", "\\bigr", "\\Bigl", "\\Bigr", "\\biggl", "\\biggr",
        "\\,", "\\;", "\\!", "\\ ", "\\quad", "\\qquad", "&"}


def tex_to_sympy(tex, sign):
    """Read the right-hand side of a gated display.  sign = +1 for the upper, -1 for the lower signs."""
    toks = [t for t in re.findall(r"\\[A-Za-z]+|\\.|\d+|[A-Za-z]|[{}()^_+\-/=,.]", tex) if t not in DROP]
    while toks and toks[-1] in (".", ","):
        toks.pop()
    pos = 0

    def peek():
        return toks[pos] if pos < len(toks) else None

    def take(expected=None):
        nonlocal pos
        if pos >= len(toks) or (expected is not None and toks[pos] != expected):
            raise CannotRead(f"expected {expected!r} at token {pos} ({peek()!r})")
        pos += 1
        return toks[pos - 1]

    def expr():
        t = peek()
        s = 1
        if t in ("+", "-", "\\pm", "\\mp"):
            take()
            s = {"+": 1, "-": -1, "\\pm": sign, "\\mp": -sign}[t]
        val = s * term()
        while peek() in ("+", "-", "\\pm", "\\mp"):
            t = take()
            val = val + {"+": 1, "-": -1, "\\pm": sign, "\\mp": -sign}[t] * term()
        return val

    def starts_factor(t):
        return t is not None and (t in ("(", "{", "\\frac", "\\sqrt", "\\cos", "\\sin", "e")
                                  or t in SYMBOLS or t.isdigit())

    def term():
        val = factor()
        while True:
            t = peek()
            if t == "/":
                take()
                val = val / factor()
            elif starts_factor(t):
                val = val * factor()
            else:
                return val

    def group():
        take("{")
        v = expr()
        take("}")
        return v

    def exponent():
        take("^")
        if peek() == "{":
            return group()
        t = take()
        if t.isdigit():
            return sp.Integer(t)
        if t in SYMBOLS:
            return SYMBOLS[t]
        raise CannotRead(f"exponent {t!r}")

    def factor():
        t = take()
        if t.isdigit():
            base = sp.Integer(t)
        elif t == "(":
            base = expr()
            take(")")
        elif t == "{":
            base = expr()
            take("}")
        elif t == "\\frac":
            num = group()
            base = num / group()
        elif t == "\\sqrt":
            base = sp.sqrt(group())
        elif t in ("\\cos", "\\sin"):
            fn = sp.cos if t == "\\cos" else sp.sin
            power = exponent() if peek() == "^" else 1
            return fn(factor()) ** power
        elif t == "e":
            if peek() != "^":
                raise CannotRead("the letter e without an exponent")
            return sp.exp(exponent())
        elif t in SYMBOLS:
            base = SYMBOLS[t]
        else:
            raise CannotRead(f"token {t!r}")
        if peek() == "^":
            base = base ** exponent()
        return base

    val = expr()
    if pos != len(toks):
        raise CannotRead(f"left over from token {pos}: {' '.join(toks[pos:pos + 6])}")
    return val


def is_zero(e):
    e = sp.simplify(sp.expand(e, complex=False))
    if e == 0:
        return True
    return sp.simplify(sp.expand_complex(e)) == 0


# ---------------------------------------------------------------- reference formulas

def laguerre_sum(k, al, var):
    """Registry definition D68."""
    return sum((-1) ** i * sp.expand_func(sp.binomial(k + al, k - i)) * var ** i / sp.factorial(i)
               for i in range(k + 1))


def radial_reference(n, l):
    """Registry definition D66 with kappa = Z/(n a)."""
    kappa = Z / (n * a)
    norm = sp.sqrt(sp.factorial(n - l - 1) * (2 * kappa) ** 3 / (2 * n * sp.factorial(n + l)))
    return norm * (2 * kappa * r) ** l * sp.exp(-kappa * r) * laguerre_sum(n - l - 1, 2 * l + 1, 2 * kappa * r)


def harmonic_reference(l, m):
    """Registry definition D67 (Condon-Shortley), including the rule for negative m."""
    t = sp.Symbol("t")
    mm = abs(m)
    legendre = sp.diff((t ** 2 - 1) ** l, t, l) / (2 ** l * sp.factorial(l))
    assoc = (1 - t ** 2) ** sp.Rational(mm, 2) * sp.diff(legendre, t, mm)
    y = ((-1) ** mm * sp.sqrt(sp.Rational(2 * l + 1, 4) / sp.pi * sp.factorial(l - mm) / sp.factorial(l + mm))
         * assoc.subs(t, sp.cos(theta)) * sp.exp(sp.I * mm * phi))
    y = y.subs(sp.sqrt(1 - sp.cos(theta) ** 2), sp.sin(theta))
    y = sp.simplify(y.replace(lambda e: e.is_Pow and e.base == 1 - sp.cos(theta) ** 2,
                              lambda e: sp.sin(theta) ** (2 * e.exp)))
    return y if m >= 0 else (-1) ** mm * sp.conjugate(y)


def sphere(f):
    return sp.integrate(sp.integrate(sp.expand(sp.expand_complex(f) * sp.sin(theta)), (phi, 0, 2 * sp.pi)),
                        (theta, 0, sp.pi))


def inner_angular(f, g):
    return sp.simplify(sphere(sp.conjugate(f) * g))


def inner_radial(f, g):
    return sp.simplify(sp.integrate(sp.expand(f * g * r ** 2), (r, 0, sp.oo)))


def split_wave(psi):
    """psi = (function of r) * (function of the angles); return both factors."""
    psi = sp.expand(psi, power_exp=True, mul=False, multinomial=False, power_base=False,
                    log=False, basic=False)
    if psi.is_Add:
        psi = sp.factor_terms(psi)
    rad, ang = sp.Integer(1), sp.Integer(1)
    for f in sp.Mul.make_args(psi):
        if f.has(theta) or f.has(phi):
            if f.has(r):
                return None
            ang *= f
        else:
            rad *= f
    return rad, ang


def to_cartesian(psi):
    rho = sp.sqrt(X1 ** 2 + X2 ** 2)
    rr = sp.sqrt(X1 ** 2 + X2 ** 2 + X3 ** 2)
    psi = sp.expand(psi, power_exp=True)

    def phase(e):
        k = sp.simplify(e.args[0] / (sp.I * phi))
        return ((X1 + sp.I * X2) / rho) ** k if k > 0 else ((X1 - sp.I * X2) / rho) ** (-k)

    psi = psi.replace(lambda e: e.func == sp.exp and e.args[0].has(phi), phase)
    return psi.subs({sp.sin(theta): rho / rr, sp.cos(theta): X3 / rr}).subs(r, rr)


def schroedinger_residual(psi, n):
    f = to_cartesian(psi)
    rr = sp.sqrt(X1 ** 2 + X2 ** 2 + X3 ** 2)
    lap = sum(sp.diff(f, v, 2) for v in (X1, X2, X3))
    res = -lap - 2 * Z / (a * rr) * f + (Z / (n * a)) ** 2 * f
    return sp.simplify(res / f) if f != 0 else sp.simplify(res)


# ---------------------------------------------------------------- the gate

def expr_variants(entry):
    """[(sign, m or None, SymPy expression)]"""
    e = entry["expr"]
    out = []
    if isinstance(e, dict):
        for key, sgn in (("+", 1), ("-", -1)):
            out.append((sgn, sp.sympify(e[key], locals=LOCALS)))
    else:
        out.append((1, sp.sympify(e, locals=LOCALS)))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--content", default=str(DEFAULT))
    ap.add_argument("--quiet", action="store_true")
    ap.add_argument("--only", default="",
                    help="comma list of equation IDs: run the mathematical checks for these "
                         "formulas only (listing, TeX identity and TeX/expression checks still "
                         "cover every formula; wavefunctions still check reference products; "
                         "orthogonality then only among the named ones)")
    args = ap.parse_args()
    only = {s for s in args.only.split(",") if s}
    cdir = pathlib.Path(args.content)
    if not cdir.is_absolute():
        cdir = ROOT / cdir
    try:
        data = json.loads((cdir / "formulas.json").read_text(encoding="utf-8"))
        tex = {lang: displays((cdir / f"{lang}.tex").read_text(encoding="utf-8")) for lang in ("de", "en")}
    except (OSError, ValueError) as exc:
        print(f"check_c11_formulas: cannot read the chapter in {cdir}: {exc}")
        return 1
    entries = data["formulas"]
    listed = {}
    for e in entries:
        if e["id"] in listed:
            fail("missing", e["id"], "listed twice in formulas.json")
        listed[e["id"]] = e

    # completeness and byte identity -------------------------------------------------
    for lang, rows in tex.items():
        by_id = {}
        for label, body in rows:
            kind = classify(body)
            if label is not None:
                by_id[label] = body
            if kind is None:
                continue
            if label is None:
                fail("unlisted", f"{lang}.tex", f"a display of kind {kind[0]} has no \\label: {body[:60]!r}")
            elif label not in listed:
                fail("unlisted", label, f"{lang}.tex displays a {kind[0]} formula that formulas.json does not list")
        for fid, e in listed.items():
            if fid not in by_id:
                fail("missing", fid, f"listed in formulas.json but not a display in {lang}.tex")
            elif by_id[fid] != e["tex"]:
                fail("tex", fid, f"the listed TeX is not byte-identical to the display in {lang}.tex")

    # each entry: indices, TeX against expression --------------------------------------
    funcs = {"laguerre": {}, "harmonic": {}, "radial": {}, "wavefunction": {}}
    for e in entries:
        fid, kind = e["id"], e["kind"]
        c = classify(e["tex"])
        if c is None or c[0] != kind:
            fail("indices", fid, f"the TeX is not a display of kind {kind} (see the rule in the docstring)")
            continue
        idx = c[1]
        want = {k: e.get(k) for k in idx if k not in ("pm",)}
        got = {k: v for k, v in idx.items() if k != "pm"}
        if kind == "laguerre":
            want["alpha"], got["alpha"] = str(e.get("alpha")), {"\\alpha": "alpha"}.get(idx["alpha"], idx["alpha"])
        if want != got:
            fail("indices", fid, f"formulas.json says {want}, the left-hand side says {got}")
            continue
        variants = expr_variants(e)
        if bool(idx.get("pm", False)) != (len(variants) == 2):
            fail("indices", fid, "a display with \\pm needs \"expr\": {\"+\": ..., \"-\": ...}, and only such a display")
            continue
        rhs = e["tex"].split("=", 1)[1]
        for sgn, val in variants:
            try:
                parsed = tex_to_sympy(rhs, sgn)
            except CannotRead as exc:
                fail("mismatch", fid, f"TeX/expression mismatch: cannot read the TeX ({exc})")
                continue
            if not is_zero(parsed - val):
                which = "" if len(variants) == 1 else (" (upper signs)" if sgn == 1 else " (lower signs)")
                fail("mismatch", fid, f"TeX/expression mismatch{which}: the TeX reads {sp.sstr(sp.simplify(parsed))}, "
                                      f"formulas.json has {sp.sstr(sp.simplify(val))}")
            if only and fid not in only:
                continue
            if kind == "laguerre":
                funcs[kind][(idx["k"],)] = (fid, val)
            elif kind == "harmonic":
                funcs[kind][(idx["l"], sgn * idx["m"])] = (fid, val)
            elif kind == "radial":
                funcs[kind][(idx["n"], idx["l"])] = (fid, val)
            else:
                funcs[kind][(idx["n"], idx["l"], sgn * idx["m"])] = (fid, val)

    # Laguerre -------------------------------------------------------------------------
    for (k,), (fid, L) in sorted(funcs["laguerre"].items()):
        ref = laguerre_sum(k, alpha, x)
        if not is_zero(L - ref):
            fail("laguerre", fid, f"L_{k}^(alpha) does not equal its defining sum (D68): printed minus "
                                  f"correct = {sp.sstr(sp.expand(L - ref))}")
        ode = x * sp.diff(L, x, 2) + (alpha + 1 - x) * sp.diff(L, x) + k * L
        if not is_zero(ode):
            fail("laguerre", fid, f"L_{k}^(alpha) does not solve x L'' + (alpha+1-x) L' + k L = 0: "
                                  f"residual {sp.sstr(sp.expand(ode))}")

    # harmonics --------------------------------------------------------------------------
    H = funcs["harmonic"]
    for (l, m), (fid, Y) in sorted(H.items()):
        nrm = inner_angular(Y, Y)
        if nrm != 1:
            fail("harmonic", fid, f"Y_{l}^{m} is not normalised on the sphere: norm squared is {sp.sstr(nrm)}")
        if not is_zero(Y - harmonic_reference(l, m)):
            fail("harmonic", fid, f"Y_{l}^{m} differs from the formula of definition D67")
        if m > 0 and (l, -m) in H and not is_zero(H[(l, -m)][1] - (-1) ** m * sp.conjugate(Y)):
            fail("condon-shortley", fid, f"Y_{l}^{{-{m}}} is not (-1)^{m} conj(Y_{l}^{m}): the "
                                         "Condon-Shortley convention of D67 is violated")
    keys = sorted(H)
    for i, p in enumerate(keys):
        for q in keys[i + 1:]:
            v = inner_angular(H[p][1], H[q][1])
            if v != 0:
                fail("orthogonal", f"{H[p][0]} / {H[q][0]}", f"harmonics {p} and {q} are not orthogonal: {sp.sstr(v)}")

    # radial functions ---------------------------------------------------------------------
    R = funcs["radial"]
    for (n, l), (fid, f) in sorted(R.items()):
        nrm = inner_radial(f, f)
        if nrm != 1:
            fail("radial", fid, f"R_{n}{l} is not normalised: integral of R^2 r^2 is {sp.sstr(nrm)}")
        res = -sp.diff(r ** 2 * sp.diff(f, r), r) / r ** 2 + (l * (l + 1) / r ** 2 - 2 * Z / (a * r)) * f \
            + (Z / (n * a)) ** 2 * f
        if not is_zero(res):
            fail("radial", fid, f"R_{n}{l} does not solve the radial equation with E_{n}")
        if not is_zero(f - radial_reference(n, l)):
            fail("radial", fid, f"R_{n}{l} differs from the formula of definition D66")
    keys = sorted(R)
    for i, p in enumerate(keys):
        for q in keys[i + 1:]:
            if p[1] == q[1]:
                v = inner_radial(R[p][1], R[q][1])
                if v != 0:
                    fail("orthogonal", f"{R[p][0]} / {R[q][0]}",
                         f"radial functions {p} and {q} (equal l) are not orthogonal: {sp.sstr(v)}")

    # wave functions -------------------------------------------------------------------------
    W = funcs["wavefunction"]
    parts = {}
    for (n, l, m), (fid, psi) in sorted(W.items()):
        sw = split_wave(psi)
        if sw is None:
            fail("norm", fid, "cannot split the wave function into a radial and an angular factor")
            continue
        parts[(n, l, m)] = sw
        nrm = sp.simplify(inner_radial(sw[0], sw[0]) * inner_angular(sw[1], sw[1]))
        if nrm != 1:
            fail("norm", fid, f"psi_{n}{l}{m} is not normalised: norm squared is {sp.sstr(nrm)}")
        res = schroedinger_residual(psi, n)
        if res != 0:
            fail("schroedinger", fid, f"psi_{n}{l}{m} does not solve the relative Schroedinger equation "
                                      f"with E_{n}: residual/psi = {sp.sstr(res)}")
        if not is_zero(psi - radial_reference(n, l) * harmonic_reference(l, m)):
            fail("product", fid, f"psi_{n}{l}{m} differs from the reference R_{n}{l} times "
                                 f"Y_{l}^{{{m}}} (D66/D67)")
        if m > 0 and (n, l, -m) in W and not is_zero(W[(n, l, -m)][1] - (-1) ** m * sp.conjugate(psi)):
            fail("condon-shortley", fid, f"psi_{n},{l},-{m} is not (-1)^{m} conj(psi_{n},{l},{m}): the "
                                         "Condon-Shortley convention of D67 is violated")
    keys = sorted(parts)
    pairs = 0
    for i, p in enumerate(keys):
        for q in keys[i + 1:]:
            pairs += 1
            ang = inner_angular(parts[p][1], parts[q][1])
            v = 0 if ang == 0 else sp.simplify(ang * inner_radial(parts[p][0], parts[q][0]))
            if v != 0:
                fail("orthogonal", f"{W[p][0]} / {W[q][0]}",
                     f"wave functions {p} and {q} are not orthogonal: {sp.sstr(v)}")

    if not args.quiet:
        print(f"check_c11_formulas: {cdir.relative_to(ROOT) if cdir.is_relative_to(ROOT) else cdir}: "
              f"{len(entries)} listed formulas "
              f"({len(funcs['laguerre'])} Laguerre polynomials, {len(H)} spherical harmonics, "
              f"{len(R)} radial functions, {len(W)} wave functions, {pairs} wave-function pairs); "
              f"{sum(1 for rows in tex.values() for _, b in rows if classify(b))} displays of this kind in de.tex and en.tex")
    for f in failures:
        print(f)
    print(f"check_c11_formulas: {len(failures)} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
