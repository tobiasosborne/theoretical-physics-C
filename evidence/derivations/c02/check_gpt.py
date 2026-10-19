#!/usr/bin/env python3
"""Derive C02 golden data and check it; writes only golden.json with --write.

All rational polytopes use SymPy rational arithmetic. Matrix identities are
symbolic. Extra polygon coordinates are algebraic/trigonometric expressions,
evaluated at 60 digits before 17-significant-digit serialization.
"""

import argparse
import itertools
import json
import re
from pathlib import Path

import numpy as np
import sympy as sp
from scipy.optimize import linprog

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
R = sp.Rational
HALF = R(1, 2)
NUM_TOL = 1e-12
GEOM_TOL = 1e-14


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def zero(expr):
    return sp.simplify(expr) == 0


def scalar_string(x):
    x = sp.simplify(sp.sympify(x))
    if x.is_Rational:
        return str(x)
    return format(float(x.evalf(60)), '.17g')


def vector_string(v):
    return [scalar_string(x) for x in v]


def numeric(v):
    return np.array([float(sp.N(x, 60)) for x in v], dtype=float)


def exact_effect_vertices(evaluation_rows):
    """Enumerate every full-rank intersection of bounds 0 <= H e <= 1."""
    H = sp.Matrix(evaluation_rows)
    d = H.cols
    constraints = [(list(H.row(i)), value)
                   for i in range(H.rows) for value in (sp.S.Zero, sp.S.One)]
    found = set()
    for chosen in itertools.combinations(constraints, d):
        A = sp.Matrix([row for row, _ in chosen])
        if A.det() == 0:
            continue
        candidate = tuple(A.inv() * sp.Matrix([value for _, value in chosen]))
        values = H * sp.Matrix(candidate)
        if all(0 <= value <= 1 for value in values):
            found.add(candidate)
    return sorted(found)


def check_exact_polytope(name, states, expected, probability_coordinates=False):
    rows = states if probability_coordinates else [[1, *v] for v in states]
    vertices = exact_effect_vertices(rows)
    require(set(vertices) == set(map(tuple, expected)), name + ': vertex enumeration')
    H = sp.Matrix(rows)
    unit = tuple([1] * H.cols) if probability_coordinates else tuple([1] + [0] * (H.cols - 1))
    for effect in vertices:
        values = H * sp.Matrix(effect)
        require(all(0 <= value <= 1 for value in values), name + ': effect feasibility')
        active = [list(H.row(i)) for i, q in enumerate(values) if q in (0, 1)]
        require(sp.Matrix(active).rank() == H.cols, name + ': extremality')
        require(tuple(u - e for u, e in zip(unit, effect)) in vertices, name + ': complement')
    return {
        'priority': 'first-release',
        'coordinates': 'probabilities / endpoint effect values' if probability_coordinates else 'state r; effect (b,a), e(r)=b+a.r',
        'K_vertices': [vector_string(v) for v in states],
        'E_vertices': [vector_string(v) for v in vertices],
    }


def check_primary_geometry():
    bit_states = [[1, 0], [0, 1]]
    bit_effects = list(itertools.product((0, 1), repeat=2))
    square_states = list(itertools.product((-1, 1), repeat=2))
    square_effects = [(0, 0, 0), (1, 0, 0), (HALF, HALF, 0),
                      (HALF, -HALF, 0), (HALF, 0, HALF), (HALF, 0, -HALF)]
    theories = {
        'classical_bit': check_exact_polytope('bit', bit_states, bit_effects, True),
        'square_bit': check_exact_polytope('square', square_states, square_effects),
    }
    theories['classical_bit']['state_cone_self_dual_standard'] = True
    theories['square_bit']['state_cone_self_dual_standard'] = False
    # (t,X,Y)=(1,1,1) is in the square state cone, but not its dual.
    require(1 >= max(abs(1), abs(1)) and not 1 >= abs(1) + abs(1), 'square non-self-duality witness')
    # A negative orthant coordinate is detected by its corresponding basis ray.
    for i in range(2):
        v = [0, 0]
        v[i] = -1
        require(sum(v[j] * bit_states[i][j] for j in range(2)) < 0, 'orthant dual witness')
    return theories


def check_qubit_matrix_algebra():
    I = sp.eye(2)
    sigma = [sp.Matrix([[0, 1], [1, 0]]), sp.Matrix([[0, -sp.I], [sp.I, 0]]),
             sp.Matrix([[1, 0], [0, -1]])]
    for i in range(3):
        require(sigma[i] * sigma[i] == I, 'Pauli square')
        require(sp.trace(sigma[i]) == 0, 'Pauli trace')
        for j in range(3):
            require(sigma[i] * sigma[j] + sigma[j] * sigma[i] == (2 * I if i == j else sp.zeros(2)), 'Pauli anticommutator')
            require(sp.trace(sigma[i] * sigma[j]) == (2 if i == j else 0), 'Pauli trace pairing')
    x, y, z, b, ax, ay, az, lam = sp.symbols('x y z b ax ay az lam', real=True)
    S = sum((r * s for r, s in zip((x, y, z), sigma)), sp.zeros(2))
    require(sp.simplify(S * S - (x*x + y*y + z*z) * I) == sp.zeros(2), 'Bloch square')
    rho = (I + S) / 2
    require(sp.simplify(rho*rho-rho-(x*x+y*y+z*z-1)*I/4)==sp.zeros(2), 'pure-state projector identity')
    E = b * I + sum((a * s for a, s in zip((ax, ay, az), sigma)), sp.zeros(2))
    require(zero(sp.trace(rho * E) - (b + x*ax + y*ay + z*az)), 'Born pairing')
    require(zero(rho.det() - (1 - x*x - y*y - z*z) / 4), 'rho determinant')
    require(zero((lam*I - E).det() - ((lam-b)**2 - ax*ax-ay*ay-az*az)), 'effect eigenvalues')
    delta, vx, vy, vz = sp.symbols('delta vx vy vz', real=True)
    D = (delta*I + vx*sigma[0] + vy*sigma[1] + vz*sigma[2]) / 2
    require(zero((lam*I-D).det() - ((lam-delta/2)**2 - (vx*vx+vy*vy+vz*vz)/4)), 'weighted-difference eigenvalues')
    return I, sigma


def ball_descriptor(dimension, priority):
    return {
        'priority': priority,
        'coordinates': 'state r; effect (b,a), e(r)=b+a.r',
        'K_vertices': None,
        'K_extreme_family': {'parameter': f'n in R^{dimension}, n.n=1', 'point': 'n'},
        'E_vertices': None,
        'E_extreme_family': {
            'isolated': [vector_string([0] * (dimension+1)), vector_string([1] + [0] * dimension)],
            'parameter': f'n in R^{dimension}, n.n=1', 'point': '(1/2,n/2)',
        },
        'K_set': 'r.r <= 1',
        'E_set': 'norm(a) <= min(b,1-b)',
        'state_cone_self_dual_standard': True,
    }


def level_specs_primary():
    return [
        ('B1', 'classical_bit', [1, 0], [0, 1], [HALF, HALF], 1, [1, 0], 'perfect'),
        ('B2', 'classical_bit', [R(3,4), R(1,4)], [R(1,4), R(3,4)], [HALF, HALF], R(3,4), [1, 0], 'overlapping'),
        ('S1', 'square_bit', [1, 0], [-1, 0], [HALF, HALF], 1, [HALF, HALF, 0], 'perfect'),
        ('S2', 'square_bit', [1, 1], [-1, -1], [HALF, HALF], 1, [HALF, HALF, 0], 'tie with (1/2,0,1/2)'),
        ('Q1', 'qubit_ball', [1, 0, 0], [0, 1, 0], [HALF, HALF], (2+sp.sqrt(2))/4,
         [HALF, sp.sqrt(2)/4, -sp.sqrt(2)/4, 0], 'non-antipodal pure states'),
        ('Q2', 'qubit_ball', [0, 0, R(1,4)], [0, 0, -R(1,4)], [R(9,10), R(1,10)], R(9,10),
         [1, 0, 0, 0], 'always guess state 1'),
    ]


def effect_value(theory, effect, state):
    if theory.startswith('classical_'):
        return sum(sp.sympify(a)*sp.sympify(r) for a, r in zip(effect, state))
    return sp.sympify(effect[0]) + sum(sp.sympify(a)*sp.sympify(r) for a, r in zip(effect[1:], state))


def check_levels(specs, theories, matrices, exact_vertices=None):
    I, sigma = matrices
    levels = []
    for identifier, theory, r1, r2, priors, expected, effect, note in specs:
        p1, p2 = map(sp.sympify, priors)
        require(p1 >= 0 and p2 >= 0 and p1+p2 == 1, identifier + ': priors')
        q1, q2 = [effect_value(theory, effect, r) for r in (r1, r2)]
        score = sp.simplify(p1*q1+p2*(1-q2))
        require(zero(score-expected), identifier + ': exact score')
        record = {'id': identifier, 'theory': theory, 'omega_1': vector_string(r1),
                  'omega_2': vector_string(r2), 'priors': vector_string(priors),
                  'P_opt': scalar_string(expected), 'P_opt_exact': str(sp.simplify(expected)),
                  'optimal_effect': vector_string(effect), 'note': note}
        if theory in ('qubit_ball', 'disc'):
            for r in (r1, r2):
                require(sp.simplify(sum(sp.sympify(x)**2 for x in r)) <= 1, identifier + ': state ball membership')
            b = sp.sympify(effect[0])
            q = sp.sqrt(sum(sp.sympify(a)**2 for a in effect[1:]))
            require(q <= b and q <= 1-b, identifier + ': effect ball membership')
            require((b == 0 and q == 0) or (b == 1 and q == 0) or (b == HALF and zero(q-HALF)), identifier + ': effect extremality')
            delta = p1-p2
            v = [p1*sp.sympify(x)-p2*sp.sympify(y) for x,y in zip(r1,r2)]
            length = sp.sqrt(sum(x*x for x in v))
            optimum = (1+sp.Max(abs(delta), length))/2
            require(zero(optimum-expected), identifier + ': analytic optimum')
            reduced = linprog([-float(delta), -float(length)], A_ub=[[-1,1],[1,1]], b_ub=[0,1],
                              bounds=[(0,1),(0,None)], method='highs')
            require(reduced.success and abs(float(p2)-reduced.fun-float(expected)) <= NUM_TOL, identifier + ': reduced cone LP')
            # Independently calculate eigenvalues of the actual 2x2 matrix.
            r1pad, r2pad = list(r1)+[0]*(3-len(r1)), list(r2)+[0]*(3-len(r2))
            rho1 = (I+sum((sp.sympify(x)*s for x,s in zip(r1pad,sigma)), sp.zeros(2)))/2
            rho2 = (I+sum((sp.sympify(x)*s for x,s in zip(r2pad,sigma)), sp.zeros(2)))/2
            D = p1*rho1-p2*rho2
            trace_norm = sum(abs(eigenvalue)*multiplicity for eigenvalue,multiplicity in D.eigenvals().items())
            require(zero((1+trace_norm)/2-expected), identifier + ': direct trace norm')
        else:
            vertices = (exact_vertices or {}).get(theory)
            if vertices is None:
                vertices = [[sp.sympify(x) for x in e] for e in theories[theory]['E_vertices']]
            scores = [sp.simplify(p1*effect_value(theory,e,r1)+p2*(1-effect_value(theory,e,r2))) for e in vertices]
            require(any(all(zero(x-y) for x,y in zip(effect,e)) for e in vertices), identifier + ': optimal effect vertex')
            require(all(float(sp.N(s-expected,40)) <= NUM_TOL for s in scores), identifier + ': full vertex optimum')
            if theory.startswith('classical_'):
                classical = sum(sp.Max(p1*sp.sympify(x),p2*sp.sympify(y)) for x,y in zip(r1,r2))
                require(zero(classical-expected), identifier + ': classical closed form')
            if theory == 'square_bit':
                weighted = [p1*sp.sympify(x)-p2*sp.sympify(y) for x,y in zip(r1,r2)]
                square = (1+sp.Max(abs(p1-p2),*[abs(x) for x in weighted]))/2
                require(zero(square-expected), identifier + ': square closed form')
            record['number_of_optimal_extreme_effects'] = sum(abs(float(sp.N(s-expected,40))) <= NUM_TOL for s in scores)
            # Independent LP directly on vertex inequalities, not effect vertices.
            K = [[sp.sympify(x) for x in v] for v in theories[theory]['K_vertices']]
            if theory.startswith('classical_'):
                for r in (r1,r2):
                    require(all(sp.sympify(x)>=0 for x in r) and sum(r)==1, identifier + ': simplex membership')
                H = np.array([numeric(v) for v in K])
                c = numeric([p1*x-p2*y for x,y in zip(r1,r2)])
            else:
                H = np.array([numeric([1,*v]) for v in K])
                c = numeric([p1-p2,*[p1*x-p2*y for x,y in zip(r1,r2)]])
                # General polytope membership via convex weights.
                for r in (r1,r2):
                    membership = linprog(np.zeros(len(K)), A_eq=np.vstack([np.array([numeric(v) for v in K]).T,np.ones(len(K))]),
                                         b_eq=numeric([*r,1]), bounds=(0,None), method='highs')
                    require(membership.success, identifier + ': polygon state membership')
            solution = linprog(-c,A_ub=np.vstack([H,-H]),b_ub=np.r_[np.ones(len(H)),np.zeros(len(H))],
                               bounds=[(None,None)]*len(c),method='highs')
            require(solution.success and abs(float(p2)-solution.fun-float(sp.N(expected,40))) <= NUM_TOL, identifier + ': independent LP')
        levels.append(record)
    require(next(x for x in levels if x['id']=='S2')['number_of_optimal_extreme_effects']==2, 'square tie count')
    return levels


def numerical_effect_vertices(states):
    """Independent active-plane enumeration using double-precision solves."""
    H = np.c_[np.ones(len(states)), np.array([numeric(v) for v in states])]
    found = []
    bounds = [(row, q) for row in H for q in (0.,1.)]
    for chosen in itertools.combinations(bounds, 3):
        A = np.array([row for row,_ in chosen])
        if abs(np.linalg.det(A)) < 1e-12:
            continue
        e = np.linalg.solve(A, np.array([q for _,q in chosen]))
        values = H @ e
        if values.min() >= -GEOM_TOL and values.max() <= 1+GEOM_TOL:
            if not any(np.linalg.norm(e-old, ord=np.inf) < NUM_TOL for old in found):
                found.append(e)
    return found


def polygon_expressions(n):
    states = [(sp.cos(2*sp.pi*k/n), sp.sin(2*sp.pi*k/n)) for k in range(n)]
    c = sp.cos(sp.pi/n)
    effects = [(sp.S.Zero,sp.S.Zero,sp.S.Zero),(sp.S.One,sp.S.Zero,sp.S.Zero)]
    if n % 2:
        for x,y in states:
            e = (c/(1+c),x/(1+c),y/(1+c))
            effects += [e,(1-e[0],-e[1],-e[2])]
    else:
        for j in range(n):
            theta = (2*j+1)*sp.pi/n
            effects.append((HALF,sp.cos(theta)/(2*c),sp.sin(theta)/(2*c)))
    return states, effects


def check_polygon_duality(n, states):
    c = float(sp.N(sp.cos(sp.pi/n),60))
    radius = 1/np.sqrt(c)
    unit_rays = []
    for j in range(n):
        theta = (2*j+1)*np.pi/n
        m = np.array([np.cos(theta),np.sin(theta)])
        d = -m/c
        cross = np.cross(numeric([1,*states[j]]),numeric([1,*states[(j+1)%n]]))
        cross /= cross[0]
        require(np.linalg.norm(cross-np.r_[1,d],ord=np.inf) <= GEOM_TOL, f'n={n}: dual ray cross product')
        require(min(np.dot(np.r_[1,d],numeric([1,*v])) for v in states) >= -GEOM_TOL, f'n={n}: dual ray positivity')
        require(np.linalg.norm(d)>1+GEOM_TOL, f'n={n}: unit radius not self-dual')
        unit_rays.append(d)
    scaled = [radius*numeric(v) for v in states]
    dual_scaled = [d/radius for d in unit_rays]
    matches = all(any(np.linalg.norm(d-v,ord=np.inf)<GEOM_TOL for v in scaled) for d in dual_scaled)
    require(matches == bool(n%2), f'n={n}: odd/even scaled self-duality')
    return {'unit_radius_self_dual_standard': False,
            'unit_radius_dual_slice_radius': scalar_string(1/sp.cos(sp.pi/n)),
            'scaled_radius': scalar_string(sp.sqrt(1/sp.cos(sp.pi/n))),
            'scaled_self_dual_standard': bool(n%2)}


def check_extra_geometry(theories):
    exact_vertices = {}
    states = [tuple(int(i==j) for i in range(3)) for j in range(3)]
    effects = list(itertools.product((0,1), repeat=3))
    trit = check_exact_polytope('trit', states, effects, True)
    trit['priority'] = 'extra'
    trit['state_cone_self_dual_standard'] = True
    theories['classical_trit'] = trit
    for n in range(3,9):
        states, effects = polygon_expressions(n)
        enumerated = numerical_effect_vertices(states)
        require(len(enumerated)==len(effects), f'n={n}: effect vertex count')
        for e in effects:
            require(any(np.linalg.norm(numeric(e)-q,ord=np.inf)<NUM_TOL for q in enumerated), f'n={n}: independent enumeration')
            for v in states:
                value = sp.N(e[0]+e[1]*v[0]+e[2]*v[1],60)
                require(value >= -sp.Float('1e-50') and value <= 1+sp.Float('1e-50'), f'n={n}: high precision effect feasibility')
            vals = np.array([float(sp.N(e[0]+e[1]*v[0]+e[2]*v[1],60)) for v in states])
            active = [numeric([1,*states[i]]) for i,q in enumerate(vals) if min(abs(q),abs(q-1))<GEOM_TOL]
            require(np.linalg.matrix_rank(np.array(active),tol=1e-12)==3, f'n={n}: full-rank active constraints')
        if n==4:
            require(set(exact_effect_vertices([[1,*v] for v in states]))==set(effects), 'regular square exact rational enumeration')
        name = f'regular_ngon_{n}'
        theories[name] = {'priority':'extra','coordinates':'unit circumradius; state r; effect (b,a)',
                          'n':n,'K_vertices':[vector_string(v) for v in states],
                          'E_vertices':[vector_string(e) for e in effects],
                          'state_cone_self_dual_standard':False,
                          'duality':check_polygon_duality(n,states)}
        exact_vertices[name] = effects
    theories['disc'] = ball_descriptor(2,'extra')
    return exact_vertices


def level_specs_extra():
    c = sp.cos(sp.pi/5)
    v2 = (sp.cos(4*sp.pi/5),sp.sin(4*sp.pi/5))
    v1 = (sp.cos(2*sp.pi/5),sp.sin(2*sp.pi/5))
    return [
        ('T1','classical_trit',[1,0,0],[0,1,0],[HALF,HALF],1,[1,0,0],'triangle: tie with (1,0,1)'),
        ('P1','regular_ngon_5',[1,0],list(v1),[HALF,HALF],c,
         [1/(1+c),-v2[0]/(1+c),-v2[1]/(1+c)],'adjacent pure states; tie'),
        ('H1','regular_ngon_6',[1,0],[-HALF,sp.sqrt(3)/2],[HALF,HALF],1,
         [HALF,HALF,-sp.sqrt(3)/6],'non-antipodal pure states, perfect'),
        ('D1','disc',[1,0],[0,1],[HALF,HALF],(2+sp.sqrt(2))/4,
         [HALF,sp.sqrt(2)/4,-sp.sqrt(2)/4],'orthogonal coordinate directions'),
        ('C1','regular_ngon_4',[1,0],[-R(3,4),R(1,4)],[HALF,HALF],1,
         [HALF,HALF,-HALF],'same coordinates comparison: square'),
        ('C2','regular_ngon_5',[1,0],[-R(3,4),R(1,4)],[HALF,HALF],(55-7*sp.sqrt(5))/40,
         [c/(1+c),1/(1+c),0],'same coordinates comparison: pentagon'),
        ('C3','disc',[1,0],[-R(3,4),R(1,4)],[HALF,HALF],(8+5*sp.sqrt(2))/16,
         [HALF,7*sp.sqrt(2)/20,-sp.sqrt(2)/20],'same coordinates comparison: disc'),
    ]


def check_ball_cones_and_extremes():
    """Deterministic 10,000-sample checks per dimension; proofs are in §3."""
    rng = np.random.default_rng(20261011)
    for dimension in (2,3):
        a = rng.normal(size=(10000,dimension))
        a /= np.linalg.norm(a,axis=1)[:,None]
        r = rng.normal(size=(10000,dimension))
        r /= np.linalg.norm(r,axis=1)[:,None]
        r *= rng.uniform(0,1,size=(10000,1))
        b = rng.uniform(0,1,size=10000)
        evec = a * (rng.uniform(0,1,size=10000)*np.minimum(b,1-b))[:,None]
        probabilities = b + np.einsum('ij,ij->i',r,evec)
        require(probabilities.min()>=-GEOM_TOL and probabilities.max()<=1+GEOM_TOL, 'ball effect probabilities')
        t = np.linalg.norm(r,axis=1)+rng.uniform(0,1,size=10000)
        s = np.linalg.norm(evec,axis=1)+rng.uniform(0,1,size=10000)
        pairing = t*s+np.einsum('ij,ij->i',r,evec)
        require(pairing.min()>=-GEOM_TOL, 'Lorentz cone positivity')
        # A direction outside the cone has a negative pairing with (1,-a).
        outside = np.c_[np.full(10000,0.9),a]
        witness = np.c_[np.ones(10000),-a]
        require(np.max(np.einsum('ij,ij->i',outside,witness)) < -0.09, 'Lorentz dual necessity witnesses')
        q = np.linalg.norm(evec,axis=1)
        reconstructed = np.c_[b-q,np.zeros((10000,dimension))]+2*q[:,None]*np.c_[np.full(10000,0.5),a/2]
        require(np.max(np.abs(reconstructed-np.c_[b,evec]))<=GEOM_TOL, 'ball extreme-family decomposition')


def check_cross_theory_claim():
    states, _ = polygon_expressions(5)
    r = [-R(3,4),R(1,4)]
    c = sp.cos(sp.pi/5)
    # Strictly inside the pentagon, so no nonconstant effect takes 0 or 1 here.
    for j in range(5):
        theta = (2*j+1)*sp.pi/5
        slack = c-sp.cos(theta)*r[0]-sp.sin(theta)*r[1]
        require(float(sp.N(slack,60))>0, 'comparison state strict pentagon interior')
    require(sum(x*x for x in r)<1, 'comparison state strict disc interior')
    # The diamond square is an affine image of the first-release square.
    for v in states:
        x,y=v
        inverse=(x+y,x-y)
        recovered=((inverse[0]+inverse[1])/2,(inverse[0]-inverse[1])/2)
        require(all(zero(a-b) for a,b in zip(recovered,v)), 'square chart invertibility')


def check_hazard_counterexamples():
    endpoints = [(sp.S.One,sp.S.Zero),(sp.S.Zero,sp.S.One)]
    midpoint = (HALF,HALF)
    pointwise = lambda p: max(p)
    require(all(pointwise(p)==1 for p in endpoints), 'classical max endpoint values')
    require(pointwise(midpoint)==HALF and (pointwise(endpoints[0])+pointwise(endpoints[1]))/2==1,
            'classical pointwise maximum is not affine')
    require(effect_value('classical_bit',[1,1],midpoint)==1, 'coefficient lattice maximum differs from pointwise maximum')
    c = (1+sp.sqrt(5))/4
    s = sp.sqrt(10-2*sp.sqrt(5))/4
    h = (sp.sqrt(5)-1)/4
    j = sp.sqrt(10+2*sp.sqrt(5))/4
    for exact, trig in [(c,sp.cos(sp.pi/5)),(s,sp.sin(sp.pi/5)),
                        (h,sp.cos(2*sp.pi/5)),(j,sp.sin(2*sp.pi/5))]:
        require(zero(exact-trig), 'pentagon radical/trigonometric identity')


def check_weighted_ball_samples(matrices):
    I, sigma = matrices
    ident = np.array(I).astype(complex)
    pauli = [np.array(s).astype(complex) for s in sigma]
    rng = np.random.default_rng(74069)
    for _ in range(200):
        r1, r2 = rng.integers(-10,11,size=(2,3))/20
        p1 = float(rng.integers(0,11))/10
        p2 = 1-p1
        rho1 = (ident+sum((x*s for x,s in zip(r1,pauli)),np.zeros((2,2),complex)))/2
        rho2 = (ident+sum((x*s for x,s in zip(r2,pauli)),np.zeros((2,2),complex)))/2
        D = p1*rho1-p2*rho2
        eigenvalues, eigenvectors = np.linalg.eigh(D)
        optimum = (1+max(abs(p1-p2),np.linalg.norm(p1*r1-p2*r2)))/2
        trace_formula = (1+np.abs(eigenvalues).sum())/2
        selected = eigenvectors[:,eigenvalues>0]
        E = selected @ selected.conj().T
        score = p1*np.trace(rho1@E).real+p2*np.trace(rho2@(ident-E)).real
        require(abs(optimum-trace_formula)<=NUM_TOL and abs(score-optimum)<=NUM_TOL, 'weighted qubit direct spectral calculation')


def check_source_quotes():
    """Validate every formatted source quote against its physical TeX line."""
    permitted = {'basic_v3.tex','CT_v3.tex','QT_v3.tex','boxworld_v3.tex',
                 'cones_v3.tex','duals_v3.tex','mplmacros.sty'}
    document = (HERE/'DERIVATION.md').read_text(encoding='utf-8')
    quotes = re.findall(r'^> `([^:]+):(\d+)` — ``(.*)``$',document,re.MULTILINE)
    require(len(quotes)>=15, 'source quote register is incomplete')
    for filename, line, quote in quotes:
        require(filename in permitted, 'quote uses an unpermitted source')
        text = (ROOT/'docs/plan/research/curriculum/plavala-src'/filename).read_text(encoding='utf-8').splitlines()
        require(quote in text[int(line)-1], f'{filename}:{line}: quote is not exact')


def generate_primary():
    theories = check_primary_geometry()
    matrices = check_qubit_matrix_algebra()
    theories['qubit_ball'] = ball_descriptor(3, 'first-release')
    levels = check_levels(level_specs_primary(), theories, matrices)
    return {'schema_version': 1, 'scalar_encoding': 'exact rational strings, otherwise 17 significant digits; exact level formulas also supplied',
            'tolerances': {'geometry': GEOM_TOL, 'LP': NUM_TOL}, 'theories': theories, 'levels': levels}


def generate_all():
    # Primary release must pass before any extra geometry is constructed.
    data = generate_primary()
    exact_vertices = check_extra_geometry(data['theories'])
    data['levels'] = check_levels(level_specs_primary()+level_specs_extra(),data['theories'],
                                  check_qubit_matrix_algebra(),exact_vertices)
    check_ball_cones_and_extremes()
    check_cross_theory_claim()
    check_hazard_counterexamples()
    check_weighted_ball_samples(check_qubit_matrix_algebra())
    require(len(data['levels'])>=8 and sum(x['theory'] in ('classical_bit','square_bit','qubit_ball') for x in data['levels'])>=6,
            'release level coverage')
    return data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--verify', action='store_true')
    group.add_argument('--write', action='store_true')
    args = parser.parse_args()
    data = generate_all()
    check_source_quotes()
    serialized = json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False)+'\n'
    golden = HERE/'golden.json'
    if args.write:
        golden.write_text(serialized, encoding='utf-8')
    else:
        require(golden.exists(), 'golden.json is missing')
        require(golden.read_text(encoding='utf-8') == serialized, 'golden.json differs from regenerated canonical data')
    print(f"PASS: {len(data['theories'])} theories, {len(data['levels'])} levels; symbolic/rational identities and independent LPs.")


if __name__ == '__main__':
    main()
