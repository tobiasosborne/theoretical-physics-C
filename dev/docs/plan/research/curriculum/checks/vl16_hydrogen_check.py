import math
# generalized Laguerre via explicit sum: L_n^a(x)=sum_k (-1)^k C(n+a, n-k) x^k/k!
def gl(n,a,x):
    return sum((-1)**k*math.gamma(n+a+1)/(math.gamma(n-k+1)*math.gamma(a+k+1))*x**k/math.factorial(k) for k in range(n+1))
s=1.3; xv=0.7
print("exact L2^s:", gl(2,s,xv), " script formula:", -xv**2/2-(s+2)*xv+0.5*(s+1)*(s+2), " corrected (+x^2/2):", xv**2/2-(s+2)*xv+0.5*(s+1)*(s+2))
# norm of script psi_21±1 = 1/(8 sqrt(2 pi)) r e^{-r/2} sin(theta) e^{i phi}
# radial: int r^4 e^{-r} dr = 24; angular: int sin^3 = 4/3; phi: 2pi
n=(1/(64*2*math.pi))*24*(4/3)*2*math.pi
print("norm^2 script:",n," with 1/(8 sqrt(pi)):", n*2)
