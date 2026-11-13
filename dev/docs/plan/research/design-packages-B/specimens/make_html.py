"""Paste the generated token CSS into each HTML template (design-packages-B). Run: python3 -I make_html.py"""
import os
H = os.path.dirname(os.path.abspath(__file__))
for k in ('pkg4', 'pkg5'):
    t = os.path.join(H, f'{k}.template.html')
    if not os.path.exists(t): continue
    css = open(os.path.join(H, '..', 'tokens', f'{k}-tokens.css')).read()
    html = open(t).read().replace('/*TOKENS*/', css)
    if '/*SCENE*/' in html:
        sv = open(os.path.join(H, 'scene', 'scene_2pz.svg.txt')).read().split('\n', 1)
        html = html.replace('/*VIEWBOX*/', sv[0]).replace('/*SCENE*/', sv[1])
    open(os.path.join(H, f'{k}.html'), 'w').write(html)
    print('wrote', k + '.html')
