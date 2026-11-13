"""Synthetic build records isolate each binding check; no PDF authenticity claim."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / 'scripts/course'))
import build_record
mode = sys.argv[1]
flags = {'pkg': '1', 'ground': 'light', 'math': 'stix', 'fonts': 'open'}
with tempfile.TemporaryDirectory(prefix='tpc-build-red-') as scratch:
    d = Path(scratch)
    c = d / 'content/c99-probe'
    c.mkdir(parents=True)
    src = r'\chapter{Probe}\label{c99}' + '\n' + r'\begin{equation}\label{c99.eq.core}a=b\end{equation}' + '\n'
    for lang in ('de', 'en'):
        (c / f'{lang}.tex').write_text(src)
    (c / 'chapter.json').write_text(json.dumps({'id':'c99','slug':'probe','title':{'de':'Probe','en':'Probe'},'effective_theory':{'de':'Probe','en':'Probe'},'zoom_scale':'none','prerequisites':[],'assets':[],'test_fixture':True}))
    for lang in ('de', 'en'):
        for edition in ('full', 'kern'):
            job = f'tpc-{lang}-{edition}'
            w = d / 'build' / job
            w.mkdir(parents=True)
            defs = {'tpcchapterlist':'c99-probe', 'tpccontentroot':str(d / 'content'), **{'tpc'+k:v for k,v in flags.items()}}
            master = f'course-{lang}-{edition}.tex'
            if mode == 'build-master' and job == 'tpc-de-full':
                master = 'unrelated.tex'
            log = '**' + ''.join('\\def\\'+k+'{'+v+'}' for k,v in defs.items()) + '\\input{'+master+'}\nOutput written on '+job+'.pdf (1 page).\n'
            (w / f'{job}.log').write_text(log)
            number = '99.17' if mode == 'kern-language-number' and lang == 'en' else '99.1'
            aux = '\\newlabel{c99}{{99}{1}{}{a}{}}\n\\newlabel{c99.eq.core}{{'+number+'}{1}{}{b}{}}\n'
            (w / f'{job}.aux').write_text(aux)
            rec = {'job':job, 'lang':lang, 'edition':edition, 'flags':flags, 'chapters':['c99-probe'], 'xelatex_exit_status':0, 'log_sha256':build_record.sha256(w/f'{job}.log'), 'aux_sha256':build_record.sha256(w/f'{job}.aux'), 'sources':build_record.hashes(ROOT,d/'content',['c99-probe'],flags)}
            if job == 'tpc-de-full':
                if mode == 'build-identity': rec['job'] = 'unrelated'
                if mode == 'build-flags': rec['flags'] = None
                if mode == 'build-chapters': rec['chapters'] = []
                if mode == 'build-token-inventory': del rec['sources']['design/build/pkg1-light/tokens.json']
                if mode == 'build-aux-binding': (w/f'{job}.aux').write_text(aux+'\n')
                if mode == 'build-log-binding': (w/f'{job}.log').write_text(log+'\n')
            (w/'build.json').write_text(json.dumps(rec))
    p = subprocess.run([sys.executable, str(ROOT/'scripts/course/check_levels.py'),'--chapters','c99','--content',str(d/'content'),'--build',str(d/'build')])
    sys.exit(p.returncode)
