// Kernel of the contract-test demos: shears of the plane. Pure functions, no DOM, no clock.
// Physics-free (chapter c99). Reference implementation and golden values:
// web/tests/golden/reference/shear.jl -> web/tests/golden/shear.json.
//
// Conventions: a point is [x, y]; a matrix is [[a, b], [c, d]] acting on column vectors,
// (x, y) -> (a x + b y, c x + d y), as in content/c99-contract-test (equation c99.eq.matrizen).

export type Vec2 = readonly [number, number];
export type Mat2 = readonly [Vec2, Vec2];

/** M(t) = [[1, t], [0, 1]]  (c99.eq.scherung): (x, y) -> (x + t y, y) */
export function shearMatrixX(t: number): Mat2 {
  return [[1, t], [0, 1]];
}

/** [[1, 0], [s, 1]]: (x, y) -> (x, s x + y); s = 3 is the matrix B of c99.eq.matrizen */
export function shearMatrixY(s: number): Mat2 {
  return [[1, 0], [s, 1]];
}

export function apply(m: Mat2, p: Vec2): Vec2 {
  return [m[0][0] * p[0] + m[0][1] * p[1], m[1][0] * p[0] + m[1][1] * p[1]];
}

export function multiply(a: Mat2, b: Mat2): Mat2 {
  return [
    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
  ];
}

export function trace(m: Mat2): number {
  return m[0][0] + m[1][1];
}

/** Corners (0,0), (1,0), (1,1), (0,1) of the unit square, in this order. */
export const UNIT_SQUARE: readonly Vec2[] = [[0, 0], [1, 0], [1, 1], [0, 1]];

/** Images of the four corners of the unit square, in the order of UNIT_SQUARE. */
export function imageOfUnitSquare(m: Mat2): Vec2[] {
  return UNIT_SQUARE.map((p) => apply(m, p));
}
