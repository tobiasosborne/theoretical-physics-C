import { describe, expect, it } from 'vitest';
import { scanHtml } from '../../tools/convert/htmlscan';
import { TexError, tokenize } from '../../tools/convert/tex';

describe('tokenizer', () => {
  it('records line and column', () => {
    const t = tokenize('a\n  \\foo{b}', 'f.tex');
    const cs = t.find((x) => x.k === 'cs')!;
    expect(cs.pos).toEqual({ file: 'f.tex', line: 2, col: 3 });
  });
  it('a blank line is a paragraph break; a comment line is not', () => {
    expect(tokenize('a\n\nb', 'f').map((x) => x.k)).toEqual(['char', 'par', 'char']);
    expect(tokenize('a\n% c\nb', 'f').map((x) => x.k)).toEqual(['char', 'space', 'char']);
    expect(tokenize('a % c\n\nb', 'f').map((x) => x.k)).toEqual(['char', 'par', 'char']);
  });
  it('skips blanks after a control word, keeps the paragraph break', () => {
    expect(tokenize('\\foo  b', 'f').map((x) => x.k)).toEqual(['cs', 'char']);
    expect(tokenize('\\foo\n\nb', 'f').map((x) => x.k)).toEqual(['cs', 'par', 'char']);
  });
  it('reads control symbols', () => {
    const t = tokenize('\\\\ \\, \\%', 'f').filter((x) => x.k === 'sym').map((x) => (x as { name: string }).name);
    expect(t).toEqual(['\\', ',', '%']);
  });
  it('fails on a backslash at the end of the file', () => {
    expect(() => tokenize('a\\', 'f')).toThrow(TexError);
  });
});

describe('HTML scanner', () => {
  it('reads tags, attributes with either quote, and skips script text', () => {
    const s = scanHtml(`<!doctype html><a href="#x" id='a'>t</a><script>if (a < b) { "<a id=no>" }</script><p id=p>`);
    expect(s.tags.map((t) => t.name)).toEqual(['a', 'script', 'p']);
    expect(s.tags[0].attrs).toEqual({ href: '#x', id: 'a' });
    expect(s.tags[2].attrs.id).toBe('p');
  });
});
