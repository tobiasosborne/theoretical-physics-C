// Mathematics gate, explicit tests (review items A5, A6): registry expansion, bold letters,
// operator spacing, rejection of unregistered macros. The browser half (rendered boxes) is
// in tools/checks/browser.ts.
import { describe, expect, it } from 'vitest';
import { defaultPaths, loadEnv } from '../../tools/convert/env';
import { checkTree, convertTex, displayTex, scanMath, walk, type MNode } from '../../tools/convert/mathconv';
import { Cursor, TexError, tokenize } from '../../tools/convert/tex';
import { convertSnippet } from '../../tools/corpus/corpus';

const env = loadEnv(defaultPaths());
const conv = (src: string) => convertSnippet(env, src, 'test');
const nodes = (tree: MNode, type: string) => { const out: MNode[] = []; walk(tree, (n) => { if (n.type === type) out.push(n); }); return out; };
const text = (n: MNode) => { let s = ''; walk(n, (x) => { if (typeof x.text === 'string') s += x.text; }); return s; };

describe('registry macros', () => {
  it('expands \\tr from the registry to an upright operator', () => {
    const c = conv('\\tr X');
    expect(c.problems).toEqual([]);
    expect(c.tex).toContain('\\operatorname');
    expect(c.mathml).toContain('<mi>tr</mi>');
  });
  it('expands arguments (\\comm{A}{B})', () => {
    const c = conv('\\comm{A}{B}');
    expect(c.problems).toEqual([]);
    expect(c.tex.replace(/\s+/g, '')).toBe('\\left[A,B\\right]');
  });
  it('expands a legacy macro of tpc-macros.sty with an optional argument (\\pd)', () => {
    expect(conv('\\pd{f}{x}').tex.replace(/\s+/g, '')).toBe('\\frac{\\partial^{}f}{\\partial{x}^{}}');
    expect(conv('\\pd[2]{f}{x}').tex.replace(/\s+/g, '')).toBe('\\frac{\\partial^{2}f}{\\partial{x}^{2}}');
  });
  it('does not loop on a macro whose expansion is its own name (\\hbar)', () => {
    expect(conv('\\hbar').problems).toEqual([]);
  });
  it('rejects an unregistered macro with its locus', () => {
    const c = conv('\\notinregistry x');
    expect(c.problems.join(' ')).toMatch(/test:1:1: \\notinregistry is not a registered macro/);
  });
  it('rejects forbidden macros in mathematics (\\tag)', () => {
    expect(conv('a \\tag{1}').problems.join(' ')).toMatch(/\\tag is forbidden/);
  });
  it('every registry macro has a usage line that converts', () => {
    const bad = env.symbols.map((s) => ({ s, c: convertSnippet(env, s.usage, s.symbol_id, true) })).filter((x) => x.c.problems.length);
    expect(bad.map((x) => `${x.s.symbol_id}: ${x.c.problems.join('; ')}`)).toEqual([]);
  });
});

describe('bold symbols are Unicode bold letters, not mathvariant on <mi>', () => {
  const cases: Array<[string, number]> = [
    ['\\boldsymbol{r}', 0x1d493],      // MATHEMATICAL BOLD ITALIC SMALL R
    ['\\posRel', 0x1d493],             // registry: \boldsymbol{r}
    ['\\vb{r}', 0x1d493],              // tpc-macros.sty: \boldsymbol{#1}
    ['\\mathbf{R}', 0x1d411],          // MATHEMATICAL BOLD CAPITAL R
    ['\\boldsymbol{\\alpha}', 0x1d736], // MATHEMATICAL BOLD ITALIC SMALL ALPHA
  ];
  for (const [src, cp] of cases) {
    it(src, () => {
      const c = conv(src);
      expect(c.problems).toEqual([]);
      const tree = convertTex(c.tex, false).tree;
      const mi = nodes(tree, 'mi');
      expect(mi.length).toBe(1);
      expect(text(mi[0]).codePointAt(0)).toBe(cp);
      expect(mi[0].attributes?.mathvariant).toBeUndefined();
    });
  }
  it('the checker reports mathvariant="bold" if it ever appears', () => {
    const fake: MNode = { type: 'mi', attributes: { mathvariant: 'bold' }, children: [], toMarkup: () => '' };
    expect(checkTree(fake).join(' ')).toMatch(/mathvariant="bold"/);
  });
});

describe('operator spacing (\\tr)', () => {
  const seq = (src: string) => {
    const out: string[] = [];
    walk(convertTex(conv(src).tex, false).tree, (n) => {
      if (n.type === 'mspace') out.push(`space:${n.attributes?.width}`);
      else if (n.type === 'mi' || n.type === 'mo' || n.type === 'mn') out.push(`${n.type}:${text(n)}`);
    });
    return out;
  };
  it('\\tr X: operator, function application, thin space, argument', () => {
    expect(seq('\\tr X')).toEqual(['mi:tr', 'mo:\u2061', 'space:0.1667em', 'mi:X']);
  });
  it('\\tr(XY): no space before the parenthesis', () => {
    expect(seq('\\tr(XY)').slice(0, 3)).toEqual(['mi:tr', 'mo:\u2061', 'mo:(']);
  });
});

describe('displays', () => {
  const scan = (src: string, envName: string) => {
    const toks = tokenize(src + `\\end{${envName}}`, 'test');
    return scanMath(new Cursor(toks, { file: 'test', line: 1, col: 1 }), env, 'en', { kind: 'env', name: envName }, { file: 'test', line: 1, col: 1 });
  };
  it('splits align rows only at the top level and keeps labels per row', () => {
    const m = scan('a &= \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix} \\label{c99.eq.a} \\\\ b &= c \\notag', 'align');
    expect(m.rows.length).toBe(2);
    expect(m.rows[0].label?.id).toBe('c99.eq.a');
    expect(m.rows[1].notag).toBe(true);
    const tex = displayTex('align', m.rows, (r) => (r.label ? '99.1' : null));
    const c = convertTex(tex, true);
    expect(c.problems).toEqual([]);
    expect(c.mathml).toContain('(99.1)');
  });
  it('resolves \\text{\\tpcifenglish{..}{..}} by language', () => {
    expect(scan('x \\text{\\tpcifenglish{if}{falls}}\\ t', 'equation*').rows[0].tex).toContain('\\text{if}');
  });
  it('rejects \\\\ at the top level of equation', () => {
    expect(() => scan('a \\\\ b', 'equation*')).toThrow(TexError);
  });
  it('rejects environments outside the contract inside mathematics', () => {
    expect(() => scan('\\begin{array}{c} a \\end{array}', 'equation*')).toThrow(/array.*not allowed inside mathematics/);
  });
});
