import math, itertools
def s2l(c):
    c/=255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def lin(h): h=h.lstrip('#'); return [s2l(int(h[i:i+2],16)) for i in (0,2,4)]
def oklab(rgb):
    r,g,b=[min(max(x,0),1) for x in rgb]
    l=0.4122214708*r+0.5363325363*g+0.0514459929*b
    m=0.2119034982*r+0.6806995451*g+0.1073969566*b
    s=0.0883024619*r+0.2817188376*g+0.6299787005*b
    l,m,s=[x**(1/3) for x in (l,m,s)]
    return (0.2104542553*l+0.7936177850*m-0.0040720468*s,
            1.9779984951*l-2.4285922050*m+0.4505937099*s,
            0.0259040371*l+0.7827717662*m-0.8086757660*s)
M={'deutan':[[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
   'protan':[[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]]}
def sim(rgb,k): m=M[k]; return [sum(m[i][j]*rgb[j] for j in range(3)) for i in range(3)]
def de(a,b): return math.dist(a,b)
sets={
 'tpc-style.sty figure colours':{'cgblue':'#007CA5','birrenred':'#C4392F','birrenorange':'#D97A2B','birrengreen':'#3D7A55','birrengray':'#8C8C84','spacecadet':'#0D284C'},
 'Okabe-Ito (7)':{'orange':'#E69F00','skyblue':'#56B4E9','green':'#009E73','yellow':'#F0E442','blue':'#0072B2','vermillion':'#D55E00','purple':'#CC79A7'},
 'Tol bright (6, no grey)':{'blue':'#4477AA','cyan':'#66CCEE','green':'#228833','yellow':'#CCBB44','red':'#EE6677','purple':'#AA3377'},
 'Tol high-contrast (3)':{'blue':'#004488','yellow':'#DDAA33','red':'#BB5566'},
 'Whitney Teal accents':{'dk2':'#335B74','accent1':'#1CADE4','accent2':'#2683C6','accent3':'#27CED7','accent4':'#42BA97','accent5':'#3E8853'},
}
print('| set | min dE_OK normal | min dE_OK deutan | min dE_OK protan | min dL (greyscale) | worst greyscale pair |')
print('|---|---|---|---|---|---|')
for s,d in sets.items():
    res={}
    for mode in ('normal','deutan','protan'):
        labs={n:oklab(lin(h) if mode=='normal' else sim(lin(h),mode)) for n,h in d.items()}
        res[mode]=min(de(labs[a],labs[b]) for a,b in itertools.combinations(labs,2))
    Ls={n:oklab(lin(h))[0] for n,h in d.items()}
    pair=min(itertools.combinations(Ls,2),key=lambda p:abs(Ls[p[0]]-Ls[p[1]]))
    print(f"| {s} | {res['normal']:.3f} | {res['deutan']:.3f} | {res['protan']:.3f} | {abs(Ls[pair[0]]-Ls[pair[1]]):.3f} | {pair[0]} / {pair[1]} |")
