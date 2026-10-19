# Reference implementation for the kernel web/src/kernels/shear.ts (contract-test chapter,
# physics-free). Writes the golden values the TypeScript kernel is compared with:
#
#   julia web/tests/golden/reference/shear.jl > web/tests/golden/shear.json
#
# Exact rational arithmetic; the values written are exact decimal fractions (all parameters
# are multiples of 1/4), so the tolerance of the comparison is 0 apart from floating-point
# rounding in the TypeScript kernel.
using Printf

shear_x(t) = [1//1 t; 0//1 1//1]          # M(t): (x, y) -> (x + t y, y)
shear_y(s) = [1//1 0//1; s 1//1]          # (x, y) -> (x, s x + y)
const SQUARE = [[0//1, 0//1], [1//1, 0//1], [1//1, 1//1], [0//1, 1//1]]

num(x) = @sprintf("%.6f", Float64(x))
vec(v) = "[" * join(num.(v), ", ") * "]"
mat(m) = "[[" * num(m[1, 1]) * ", " * num(m[1, 2]) * "], [" * num(m[2, 1]) * ", " * num(m[2, 2]) * "]]"

cases = String[]
for t in (-3//1, -5//4, 0//1, 1//4, 2//1, 3//1)
    m = shear_x(t)
    push!(cases, """    {"fn": "imageOfUnitSquare", "matrix": "shearMatrixX", "param": $(num(t)), "expected": [$(join([vec(m * p) for p in SQUARE], ", "))]}""")
    push!(cases, """    {"fn": "trace", "matrix": "shearMatrixX", "param": $(num(t)), "expected": $(num(m[1, 1] + m[2, 2]))}""")
end
for s in (0//1, 3//4, 3//1)
    m = shear_y(s)
    push!(cases, """    {"fn": "imageOfUnitSquare", "matrix": "shearMatrixY", "param": $(num(s)), "expected": [$(join([vec(m * p) for p in SQUARE], ", "))]}""")
end
for (s, t) in ((2//1, 3//1), (-1//4, 5//4), (3//1, -3//1))
    push!(cases, """    {"fn": "multiply", "matrix": "shearMatrixX", "param": [$(num(s)), $(num(t))], "expected": $(mat(shear_x(s) * shear_x(t)))}""")
end

println("""{
  "kernel": "shear",
  "reference": {"implementation": "Julia $(VERSION), exact rationals", "script": "web/tests/golden/reference/shear.jl"},
  "tolerance": {"abs": 1e-12, "note": "inputs and outputs are exact binary fractions; 1e-12 is an unvalidated choice that only has to exceed double rounding"},
  "cases": [
$(join(cases, ",\n"))
  ]
}""")
