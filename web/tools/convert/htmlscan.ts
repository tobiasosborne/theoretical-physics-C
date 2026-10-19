// A small tag scanner for HTML and SVG: start tags with their attributes, in document
// order, and the text of <style> elements. Enough for the static gates (IDs, links,
// external resources) and for reading the size of an SVG; it is a scanner with quote
// handling, not a pattern match over the whole file.

export interface Tag { name: string; attrs: Record<string, string>; offset: number; line: number }
export interface Scan { tags: Tag[]; styles: string[] }

export function scanHtml(src: string): Scan {
  const tags: Tag[] = [];
  const styles: string[] = [];
  let i = 0;
  const n = src.length;
  let line = 1;
  const adv = (to: number) => { for (; i < to; i++) if (src.charCodeAt(i) === 10) line++; };
  while (i < n) {
    const lt = src.indexOf('<', i);
    if (lt < 0) break;
    adv(lt);
    if (src.startsWith('<!--', i)) { const e = src.indexOf('-->', i + 4); adv(e < 0 ? n : e + 3); continue; }
    if (src[i + 1] === '!' || src[i + 1] === '?') { const e = src.indexOf('>', i); adv(e < 0 ? n : e + 1); continue; }
    if (src[i + 1] === '/') { const e = src.indexOf('>', i); adv(e < 0 ? n : e + 1); continue; }
    if (!/[A-Za-z]/.test(src[i + 1] ?? '')) { adv(i + 1); continue; }
    const start = i;
    const startLine = line;
    let j = i + 1;
    while (j < n && /[A-Za-z0-9:_-]/.test(src[j])) j++;
    const name = src.slice(i + 1, j).toLowerCase();
    const attrs: Record<string, string> = {};
    for (;;) {
      while (j < n && /\s/.test(src[j])) j++;
      if (j >= n || src[j] === '>') { j++; break; }
      if (src[j] === '/') { j++; continue; }
      let k = j;
      while (k < n && !/[\s=>/]/.test(src[k])) k++;
      const an = src.slice(j, k).toLowerCase();
      j = k;
      while (j < n && /\s/.test(src[j])) j++;
      let val = '';
      if (src[j] === '=') {
        j++;
        while (j < n && /\s/.test(src[j])) j++;
        const q = src[j];
        if (q === '"' || q === "'") {
          const e = src.indexOf(q, j + 1);
          val = src.slice(j + 1, e < 0 ? n : e);
          j = e < 0 ? n : e + 1;
        } else {
          k = j;
          while (k < n && !/[\s>]/.test(src[k])) k++;
          val = src.slice(j, k);
          j = k;
        }
      }
      if (an) attrs[an] = decode(val);
    }
    tags.push({ name, attrs, offset: start, line: startLine });
    adv(j);
    if (name === 'script' || name === 'style') {
      const close = src.toLowerCase().indexOf(`</${name}`, i);
      const end = close < 0 ? n : close;
      if (name === 'style') styles.push(src.slice(i, end));
      adv(end);
    }
  }
  return { tags, styles };
}

function decode(s: string): string {
  return s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}
