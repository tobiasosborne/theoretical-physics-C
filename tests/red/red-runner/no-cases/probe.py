"""Exercise the actual runner in an isolated tree with one planted runner defect."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
ROOT = Path(__file__).resolve().parents[4]
mode = sys.argv[1]
with tempfile.TemporaryDirectory(prefix='tpc-runner-red-') as scratch:
    d = Path(scratch)
    (d / 'scripts').mkdir()
    shutil.copyfile(ROOT / 'scripts/check_red.py', d / 'scripts/check_red.py')
    spec = {'gate':'fixture','what':'runner fixture','cmd':"python3 -c \"import sys; print('fixture-specific diagnostic'); sys.exit(1)\"",'expect_exit_nonzero':True,'expect_output_regex':'fixture-specific diagnostic'}
    if mode == 'missing-key': del spec['what']
    if mode == 'empty-regex': spec['expect_output_regex'] = 'x*'
    if mode == 'generic-regex': spec['expect_output_regex'] = 'error'
    if mode == 'exit-expectation': spec['expect_exit_nonzero'] = False
    if mode == 'traceback': spec['cmd'] = "python3 -c \"raise RuntimeError('fixture-specific diagnostic')\""
    if mode == 'missing-file': spec['cmd'] = 'python3 fixture-specific-diagnostic-missing.py'; spec['expect_output_regex'] = 'fixture-specific-diagnostic-missing.py'
    if mode != 'no-cases':
        case = d / 'tests/red/fixture/one'; case.mkdir(parents=True)
        (case / 'case.json').write_text(json.dumps(spec))
    p = subprocess.run([sys.executable,str(d / 'scripts/check_red.py'),'--gate','fixture'], cwd=d)
    sys.exit(p.returncode)
