import math
def srgb2lin(c):
    c/=255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def hex2rgb(h): h=h.lstrip('#'); return [int(h[i:i+2],16) for i in (0,2,4)]
def lum(h):
    r,g,b=[srgb2lin(x) for x in hex2rgb(h)]; return 0.2126*r+0.7152*g+0.0722*b
def contrast(h1,h2):
    a,b=sorted([lum(h1),lum(h2)],reverse=True); return (a+0.05)/(b+0.05)
def oklch(h):
    r,g,b=[srgb2lin(x) for x in hex2rgb(h)]
    l=0.4122214708*r+0.5363325363*g+0.0514459929*b
    m=0.2119034982*r+0.6806995451*g+0.1073969566*b
    s=0.0883024619*r+0.2817188376*g+0.6299787005*b
    l,m,s=[x**(1/3) for x in (l,m,s)]
    L=0.2104542553*l+0.7936177850*m-0.0040720468*s
    A=1.9779984951*l-2.4285922050*m+0.4505937099*s
    B=0.0259040371*l+0.7827717662*m-0.8086757660*s
    C=math.hypot(A,B); H=math.degrees(math.atan2(B,A))%360
    return L,C,H
sets={
 'tpc-style.sty (current)':{'spacecadet':'#0D284C','munsell':'#008FA8','banana':'#FFD932','cgblue':'#007CA5','isabelline':'#EAEDEA','birrenred':'#C4392F','birrenorange':'#D97A2B','birrengreen':'#3D7A55','birrengray':'#8C8C84'},
 'TJO Whitney Teal (slides)':{'dk2':'#335B74','accent1':'#1CADE4','accent2':'#2683C6','accent3':'#27CED7','accent4':'#42BA97','accent5':'#3E8853'},
 'Okabe-Ito':{'orange':'#E69F00','skyblue':'#56B4E9','green':'#009E73','yellow':'#F0E442','blue':'#0072B2','vermillion':'#D55E00','purple':'#CC79A7'},
 'Tol high-contrast':{'blue':'#004488','yellow':'#DDAA33','red':'#BB5566'},
 'Tol bright':{'blue':'#4477AA','cyan':'#66CCEE','green':'#228833','yellow':'#CCBB44','red':'#EE6677','purple':'#AA3377','grey':'#BBBBBB'},
 'manim (3b1b) defaults':{'BLUE_C':'#58C4DD','TEAL_C':'#5CD0B3','GREEN_C':'#83C167','YELLOW_C':'#FFFF00','GOLD_C':'#F0AC5F','RED_C':'#FC6255','GREY_BROWN':'#736357','bg':'#333333'},
}
print('| set | name | hex | OKLCH L | C | h | contrast vs #FFFFFF | vs #111111 |')
print('|---|---|---|---|---|---|---|---|')
for s,d in sets.items():
    for n,h in d.items():
        L,C,H=oklch(h); print(f'| {s} | {n} | `{h}` | {L:.2f} | {C:.3f} | {H:.0f} | {contrast(h,"#FFFFFF"):.2f} | {contrast(h,"#111111"):.2f} |')
