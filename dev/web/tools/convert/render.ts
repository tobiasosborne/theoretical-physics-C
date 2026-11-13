// ChapterIR -> HTML page. Reads nothing but the IR and the site description.
import type { Lang } from './env.ts';
import type { Block, ChapterIR, Claim, Inline } from './ir.ts';

export interface FigureFile { src: string; width: number; height: number; variants: string[] }

export interface SiteInfo {
  pkg: number;
  ground: 'light' | 'dark';
  /** chapters on the site, in order */
  chapters: Array<{ id: string; number: string; title: Record<Lang, string> }>;
  /** figure ID -> file under assets/figures/<variant>/, for this language */
  figures: Map<string, FigureFile>;
  /** demo IDs with a built bundle and standalone page */
  demoBundles: Set<string>;
  packages: Array<{ pkg: number; title: string; productionReady: boolean }>;
}

const W: Record<string, Record<Lang, string>> = {
  course: { de: 'Theoretische Physik C', en: 'Theoretical Physics C' },
  chapter: { de: 'Kapitel', en: 'Chapter' },
  contents: { de: 'Inhalt', en: 'Contents' },
  theorem: { de: 'Theorem', en: 'Theorem' },
  lemma: { de: 'Lemma', en: 'Lemma' },
  proposition: { de: 'Proposition', en: 'Proposition' },
  corollary: { de: 'Korollar', en: 'Corollary' },
  example: { de: 'Beispiel', en: 'Example' },
  exercise: { de: 'Übung', en: 'Exercise' },
  solution: { de: 'Lösung', en: 'Solution' },
  remark: { de: 'Bemerkung', en: 'Remark' },
  proof: { de: 'Beweis', en: 'Proof' },
  definition: { de: 'Definition', en: 'Definition' },
  intuition: { de: 'Physikalische Anschauung', en: 'Physical intuition' },
  historical: { de: 'Historische Notiz', en: 'Historical note' },
  figure: { de: 'Abbildung', en: 'Figure' },
  table: { de: 'Tabelle', en: 'Table' },
  vertiefung: { de: 'Vertiefung', en: 'Deeper' },
  fundament: { de: 'Fundament', en: 'Foundations' },
  kern: { de: 'Kern', en: 'Core' },
  wozu: { de: 'Wozu', en: 'Why' },
  voraussetzung: { de: 'Voraussetzung', en: 'Requires' },
  back: { de: 'Zurück zum Kern', en: 'Back to the core' },
  fromLong: { de: 'Hierher verweist', en: 'Signposted from' },
  appendix: { de: 'Fundament zu Kapitel', en: 'Foundations for Chapter' },
  open: { de: 'öffnen', en: 'open' },
  close: { de: 'schließen', en: 'close' },
  depth: { de: 'Tiefe', en: 'Depth' },
  depthKern: { de: 'Kern', en: 'Core' },
  depthV: { de: 'Kern + Vertiefung', en: 'Core + Deeper' },
  depthAll: { de: 'Alles', en: 'Everything' },
  design: { de: 'Gestaltung', en: 'Design' },
  pkg: { de: 'Paket', en: 'Package' },
  ground: { de: 'Grund', en: 'Ground' },
  light: { de: 'hell', en: 'light' },
  dark: { de: 'dunkel', en: 'dark' },
  experimental: { de: 'experimentell', en: 'experimental' },
  language: { de: 'Sprache', en: 'Language' },
  external: { de: 'Verweis in ein Kapitel, das nicht Teil dieser Ausgabe ist', en: 'reference into a chapter that is not part of this build' },
  demoNote: { de: 'Interaktiv. Ohne Skript oder WebGL bleibt das Standbild stehen.', en: 'Interactive. Without scripting or WebGL the still remains.' },
  standalone: { de: 'Einzeldatei für die Nutzung ohne Netz', en: 'Single file for offline use' },
  chapters: { de: 'Kapitel', en: 'Chapters' },
  toDefinition: { de: 'Zur Definition', en: 'Go to the definition' },
  toBlock: { de: 'Zum Block', en: 'Go to the block' },
};
export const word = (k: string, lang: Lang): string => W[k][lang];

export const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

class Renderer {
  lang: Lang;
  constructor(private ir: ChapterIR, private site: SiteInfo) { this.lang = ir.lang; }
  w(k: string): string { return word(k, this.lang); }

  private href(target: string, chapter: string): string {
    return chapter === this.ir.id ? `#${esc(target)}` : `../${chapter}/index.html#${esc(target)}`;
  }

  inl(nodes: Inline[]): string {
    let s = '';
    for (const n of nodes) {
      switch (n.t) {
        case 'text': s += esc(n.text); break;
        case 'emph': s += `<em>${this.inl(n.children)}</em>`; break;
        case 'strong': s += `<strong>${this.inl(n.children)}</strong>`; break;
        case 'math': s += n.mathml; break;
        case 'num': s += `<span class="tpc-num"${n.claim ? ` data-claim="${esc(n.claim)}"` : ''}>${n.mathml}</span>`; break;
        case 'ref': {
          const txt = n.kind === 'eqref' ? `(${esc(n.number ?? '')})` : esc(n.number ?? '');
          if (n.external || n.number === null) {
            s += `<span class="tpc-extref" title="${esc(this.w('external'))}">[${esc(n.target)}]</span>`;
          } else {
            s += `<a class="tpc-ref" href="${this.href(n.target, n.chapter)}">${txt}</a>`;
          }
          break;
        }
        case 'zoomref': {
          const d = n.depth === 'fundament' ? 'f' : 'v';
          const idAttr = n.anchor ? ` id="${esc(n.anchor)}"` : '';
          s += `<a class="tpc-zoomref tpc-zoomref-${d} tpc-margin"${idAttr} href="#${esc(n.target)}" data-lead="${esc(n.lead)}">`
            + `<span class="tpc-glyph tpc-glyph-${d}" aria-hidden="true"></span>`
            + `<span class="tpc-zoomref-text">${esc(this.w(n.depth))} ${esc(n.number)}</span></a>`;
          break;
        }
        case 'defref': {
          const txt = `${this.w('definition')} ${esc(n.number ?? `[${n.id}]`)}`;
          if (n.external || n.number === null) {
            s += `<span class="tpc-defref tpc-defref-ext" data-def="${esc(n.id)}" tabindex="0">${this.w('definition')} <span class="tpc-extref">[${esc(n.id)}]</span></span>`;
          } else {
            s += `<a class="tpc-defref" href="${esc(this.defHref(n.id))}" data-def="${esc(n.id)}">${txt}</a>`;
          }
          break;
        }
        case 'srcref': s += `<span class="tpc-srcref">[<code>${esc(n.key)}</code>, ${this.inl(n.locus)}]</span>`; break;
      }
    }
    return s;
  }

  defHomes = new Map<string, string>();
  /** units set like a theorem (statement in italics): contract.json, theorem_like */
  theoremLike: string[] = ['theorem', 'lemma', 'proposition', 'corollary'];
  private defHref(id: string): string {
    const home = this.defHomes.get(id);
    return home && home !== this.ir.id ? `../${home}/index.html#${id}` : `#${id}`;
  }

  private claimNote(c: Claim | null): string {
    if (!c) return '';
    const data = ` data-claim="${esc(c.id)}" data-status="${esc(c.status)}"${c.presentation ? ` data-presentation="${esc(c.presentation)}"` : ''}`;
    if (!c.tag) return `<span class="tpc-claim-anchor"${data}></span>`;
    return `<span class="tpc-claim tpc-margin"${data}>${esc(c.tag)}</span>`;
  }

  /** Blocks with a run-in head: the head goes into the first paragraph when there is one. */
  private runIn(head: string, children: Block[], tail = ''): string {
    // the end mark of a proof goes into its last paragraph when there is one
    const last = children[children.length - 1];
    const tailIn = tail !== '' && last !== undefined && last.t === 'para';
    const para = (b: Block, pre: string, post: string) =>
      b.t === 'para' ? `<p${b.cont && !pre ? ' class="tpc-cont"' : ''}>${pre}${this.inl(b.children)}${post}</p>` : this.block(b);
    const parts = children.map((b, i) => para(b, i === 0 && b.t === 'para' ? head : '', tailIn && i === children.length - 1 ? tail : ''));
    const first = children[0];
    const lead = first && first.t === 'para' ? '' : `<p>${head}</p>`;
    return lead + parts.join('\n') + (tail !== '' && !tailIn ? `<p class="tpc-qed-line">${tail}</p>` : '');
  }

  blocks(bs: Block[]): string { return bs.map((b) => this.block(b)).join('\n'); }

  block(b: Block): string {
    switch (b.t) {
      case 'heading': {
        const h = `h${b.level}`;
        return `<${h} id="${esc(b.id)}"><span class="tpc-secno">${esc(b.number)}</span>${this.inl(b.title)}</${h}>`;
      }
      case 'para':
        return `<p${b.cont ? ' class="tpc-cont"' : ''}>${this.inl(b.children)}</p>`;
      case 'display': {
        const isAlign = b.env.startsWith('align');
        const id = !isAlign && b.rows[0]?.id ? ` id="${esc(b.rows[0].id!)}"` : '';
        const claims = b.rows.filter((r) => r.claim);
        const data = claims.map((r) => `${r.claim!.id}:${r.claim!.status}`).join(' ');
        const tagged = claims.filter((r) => r.claim!.tag);
        // evidence tags stand in the margin beside the display, as in print; with several
        // rows each tag names its equation number
        const notes = tagged.length
          ? `<p class="tpc-eq-claims">${tagged.map((r) => `<span class="tpc-claim">${b.rows.length > 1 ? `(${esc(r.number ?? '')})\u00A0` : ''}${esc(r.claim!.tag!)}</span>`).join('')}</p>`
          : '';
        return `<div class="tpc-eqwrap"><div class="tpc-eq tpc-eq-${esc(b.env.replace('*', 'star'))}"${id}${data ? ` data-claims="${esc(data)}"` : ''}>${b.mathml}</div>${notes}</div>`;
      }
      case 'unit': {
        const plain = this.theoremLike.includes(b.env);
        const label = `${this.w(b.env)}${b.number ? ` ${esc(b.number)}` : ''}`;
        const name = b.name ? ` <span class="tpc-unit-name">(${this.inl(b.name)})</span>` : '';
        const head = `<span class="tpc-unit-head"><span class="tpc-unit-label">${label}</span>${name}.</span>${this.claimNote(b.claim)}`;
        const qed = b.env === 'proof' || b.env === 'solution' ? '<span class="tpc-qed" aria-hidden="true">□</span>' : '';
        const cls = `tpc-unit tpc-unit-${b.env}${plain ? ' tpc-unit-plain' : ''}`;
        return `<div class="${cls}"${b.id ? ` id="${esc(b.id)}"` : ''}>${this.runIn(head, b.children, qed)}</div>`;
      }
      case 'definition': {
        const head = `<span class="tpc-unit-head"><span class="tpc-unit-label">${this.w('definition')} ${esc(b.number)}</span> <span class="tpc-unit-name">(${this.inl(b.name)})</span>.</span>`;
        return `<div class="tpc-unit tpc-unit-definition" id="${esc(b.id)}" data-depth="${esc(b.depth)}">${this.runIn(head, b.children)}</div>`;
      }
      case 'box': {
        const title = b.title ? this.inl(b.title) : (b.env === 'intuition' || b.env === 'historical') ? esc(this.w(b.env)) : '';
        return `<aside class="tpc-box tpc-box-${b.env}">${title ? `<p class="tpc-box-title">${title}</p>` : ''}${this.blocks(b.children)}</aside>`;
      }
      case 'list': {
        if (b.env === 'description') {
          return `<dl>${b.items.map((it) => `<dt>${this.inl(it.label ?? [])}</dt><dd>${this.blocks(it.children)}</dd>`).join('')}</dl>`;
        }
        const tag = b.env === 'enumerate' ? 'ol' : 'ul';
        return `<${tag}>${b.items.map((it) => `<li>${it.label ? `<strong>${this.inl(it.label)}</strong> ` : ''}${this.blocks(it.children)}</li>`).join('')}</${tag}>`;
      }
      case 'depth': return this.depthBlock(b);
      case 'figure': return this.figure(b);
      case 'table': {
        const rows: string[] = [];
        let pending: string[] = [];
        for (const r of b.rows) {
          if ('rule' in r) {
            if (r.rule === 'bottom' && rows.length) {
              rows[rows.length - 1] = rows[rows.length - 1].replace('<tr class="', '<tr class="tpc-rule-bottom ');
            } else pending.push(`tpc-rule-${r.rule}`);
            continue;
          }
          rows.push(`<tr class="${pending.join(' ')}">${r.cells.map((c, i) => `<td class="tpc-${b.colspec[i]}">${this.inl(c)}</td>`).join('')}</tr>`);
          pending = [];
        }
        return `<figure class="tpc-table" id="${esc(b.id)}"><figcaption><span class="tpc-caplabel">${this.w('table')} ${esc(b.number)}.</span>${this.inl(b.caption)}</figcaption>`
          + `<div class="tpc-table-scroll"><table><tbody>${rows.join('')}</tbody></table></div></figure>`;
      }
    }
  }

  private depthBlock(b: Extract<Block, { t: 'depth' }>): string {
    const d = b.kind === 'fundament' ? 'f' : 'v';
    const from = b.kind === 'fundament' && b.from
      ? `<p class="tpc-depth-from"><span class="tpc-depth-key">${this.w('fromLong')}</span> <a class="tpc-ref" href="#${esc(b.from.anchor)}">${esc(b.from.text)}</a>.</p>`
      : '';
    const back = (cls: string, key: string) => `<p class="tpc-depth-line ${cls}">${key} ${this.inl(b.zurueck)}</p>`;
    return `<details class="tpc-depth tpc-depth-${d}" id="${esc(b.id)}" data-depth="${b.kind}">`
      + `<summary>`
      + `<span class="tpc-depth-toggle" aria-hidden="true"><span class="tpc-when-closed">${this.w('open')}</span><span class="tpc-when-open">${this.w('close')}</span></span>`
      + `<p class="tpc-depth-headline"><span class="tpc-depth-label">${this.w(b.kind)} ${esc(b.number)}</span><span class="tpc-depth-sep" aria-hidden="true">·</span><span class="tpc-depth-title">${this.inl(b.titel)}</span></p>`
      + `<p class="tpc-depth-line"><span class="tpc-depth-key">${this.w('wozu')}:</span> ${this.inl(b.wozu)}</p>`
      + `<p class="tpc-depth-line"><span class="tpc-depth-key">${this.w('voraussetzung')}:</span> ${this.inl(b.voraussetzung)}</p>`
      + back('tpc-depth-back tpc-when-closed', `<span class="tpc-depth-label">${this.w('back')}.</span>`)
      + `</summary>`
      + `<div class="tpc-depth-body">${from}${this.blocks(b.children)}`
      + back('tpc-depth-return', `<button type="button" class="tpc-depth-close">${this.w('back')}.</button>`)
      + `</div></details>`;
  }

  private figure(b: Extract<Block, { t: 'figure' }>): string {
    const f = this.site.figures.get(b.id);
    if (!f) throw new Error(`figure ${b.id}: no SVG was built`);
    const img = (cls: string) => `<img class="${cls}" src="../../assets/figures/${f.src}" width="${f.width}" height="${f.height}" alt="${esc(b.alt)}"`
      + ` data-fig="${esc(b.id)}.${this.lang}.svg" data-variants="${esc(f.variants.join(' '))}" loading="lazy" decoding="async">`;
    let inner: string;
    let note = '';
    if (b.demo) {
      const meta = this.ir.demos.find((x) => x.id === b.demo)!;
      inner = `<div class="tpc-demo" id="${esc(b.demo)}" data-demo="${esc(b.demo)}" data-lang="${this.lang}" data-kind="${esc(meta.kind)}" data-title="${esc(meta.title)}">${img('tpc-demo-poster')}</div>`;
      note = `<p class="tpc-demo-note">${esc(this.w('demoNote'))} <a href="../../standalone/${esc(b.demo)}.${this.lang}.html">${esc(this.w('standalone'))}</a></p>`;
    } else {
      inner = img('tpc-still');
    }
    return `<figure class="tpc-figure" id="${esc(b.id)}"><div class="tpc-plate">${inner}</div>${note}`
      + `<figcaption><span class="tpc-caplabel">${this.w('figure')} ${esc(b.number)}.</span>${this.inl(b.caption)}</figcaption></figure>`;
  }

  private toc(): string {
    const items: string[] = [];
    let sub: string[] = [];
    let open = false;
    const closeSec = () => {
      if (!open) return;
      items[items.length - 1] += (sub.length ? `<ol>${sub.join('')}</ol>` : '') + '</li>';
      sub = []; open = false;
    };
    const depthItem = (b: Extract<Block, { t: 'depth' }>) => {
      const d = b.kind === 'fundament' ? 'f' : 'v';
      return `<li><a href="#${esc(b.id)}"><span class="tpc-glyph tpc-glyph-${d}" aria-hidden="true"></span><span class="tpc-secno">${this.w(b.kind)} ${esc(b.number)}</span>${this.inl(b.titel)}</a></li>`;
    };
    const fund: string[] = [];
    for (const b of this.ir.children) {
      if (b.t === 'heading' && b.level === 2) {
        closeSec();
        items.push(`<li><a href="#${esc(b.id)}"><span class="tpc-secno">${esc(b.number)}</span>${this.inl(b.title)}</a>`);
        open = true;
      } else if (b.t === 'heading') {
        sub.push(`<li><a href="#${esc(b.id)}"><span class="tpc-secno">${esc(b.number)}</span>${this.inl(b.title)}</a></li>`);
      } else if (b.t === 'depth' && b.kind === 'vertiefung') {
        (open ? sub : items).push(depthItem(b));
      } else if (b.t === 'depth') fund.push(depthItem(b));
    }
    closeSec();
    if (fund.length) {
      items.push(`<li><a href="#tpc-appendix-${this.ir.id}">${this.w('appendix')} ${esc(this.ir.number)}</a><ol>${fund.join('')}</ol></li>`);
    }
    return `<nav class="tpc-toc" aria-label="${this.w('contents')}"><ol>${items.join('')}</ol></nav>`;
  }

  private topbar(): string {
    const other: Lang = this.lang === 'de' ? 'en' : 'de';
    const seg = (name: string, legend: string, opts: Array<[string, string, boolean]>) =>
      `<fieldset class="tpc-seg tpc-needs-js" data-control="${name}"><legend class="tpc-visually-hidden">${legend}</legend>`
      + opts.map(([v, l, on]) => `<label><input type="radio" name="tpc-${name}" value="${v}"${on ? ' checked' : ''}>${l}</label>`).join('') + '</fieldset>';
    const langs = `<span class="tpc-langs" role="group" aria-label="${this.w('language')}">`
      + (['de', 'en'] as Lang[]).map((l) => l === this.lang
        ? `<span aria-current="true" lang="${l}">${l.toUpperCase()}</span>`
        : `<a class="tpc-langlink" href="../../${other}/${this.ir.id}/index.html" hreflang="${l}" lang="${l}">${l.toUpperCase()}</a>`).join('')
      + '</span>';
    const pk = this.site.packages.map((p) => [String(p.pkg), `${p.pkg}${p.productionReady ? '' : '*'}`, p.pkg === this.site.pkg] as [string, string, boolean]);
    const hasExp = this.site.packages.some((p) => !p.productionReady);
    const design = `<details class="tpc-design tpc-needs-js"><summary>${this.w('design')}</summary><div class="tpc-design-panel">`
      + `<span class="tpc-design-name">${this.w('pkg')}</span>${seg('pkg', this.w('pkg'), pk)}`
      + `<span class="tpc-design-name">${this.w('ground')}</span>${seg('ground', this.w('ground'), [['light', this.w('light'), this.site.ground === 'light'], ['dark', this.w('dark'), this.site.ground === 'dark']])}`
      + (hasExp ? `<span class="tpc-design-name">* ${this.w('experimental')}</span>` : '')
      + `</div></details>`;
    return `<header class="tpc-topbar"><a class="tpc-home" href="../index.html">${this.w('course')}</a><div class="tpc-controls">`
      + seg('depth', this.w('depth'), [['kern', this.w('depthKern'), true], ['vertiefung', this.w('depthV'), false], ['alles', this.w('depthAll'), false]])
      + langs + design + `</div></header>`;
  }

  private popups(): string {
    const parts = this.ir.definitions.map((d) => {
      const head = `<strong>${this.w('definition')}${d.number ? ` ${esc(d.number)}` : ''}</strong> (${this.inl(d.name)}). `;
      const first = d.children[0];
      const body = first && first.t === 'para'
        ? `<p>${head}${this.inl(first.children)}</p>${this.blocks(d.children.slice(1))}`
        : `<p>${head}</p>${this.blocks(d.children)}`;
      return `<template data-def="${esc(d.id)}">${body}</template>`;
    });
    return `<div id="tpc-popup-sources" hidden>${parts.join('')}</div>`;
  }

  page(): string {
    const ir = this.ir;
    const kern: Block[] = [];
    const fund: Block[] = [];
    for (const b of ir.children) (b.t === 'depth' && b.kind === 'fundament' ? fund : kern).push(b);
    const appendix = fund.length
      ? `<section class="tpc-appendix" aria-labelledby="tpc-appendix-${ir.id}"><h2 id="tpc-appendix-${ir.id}">${this.w('appendix')} ${esc(ir.number)}</h2>${this.blocks(fund)}</section>`
      : '';
    const strings = { toDefinition: this.w('toDefinition'), toBlock: this.w('toBlock') };
    return `<!doctype html>
<html lang="${this.lang}" data-tpc-pkg="${this.site.pkg}" data-tpc-ground="${this.site.ground}" data-tpc-assets="../../assets" data-tpc-chapter="${ir.id}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(ir.number)} ${esc(ir.titlePlain)} · ${this.w('course')}</title>
<meta name="generator" content="tpc web converter; mathematics: ${esc(ir.converter)}">
<link rel="stylesheet" href="../../assets/fonts/fonts.css">
<link rel="stylesheet" id="tpc-tokens" href="../../assets/tokens/pkg${this.site.pkg}-${this.site.ground}.css">
<link rel="stylesheet" href="../../assets/site.css">
<script defer src="../../assets/site.js"></script>
</head>
<body data-strings="${esc(JSON.stringify(strings))}">
${this.topbar()}
<main class="tpc-page">
<article class="tpc-chapter">
<header class="tpc-chapter-head" id="${ir.id}"><p class="tpc-kicker">${this.w('chapter')} ${esc(ir.number)}</p><h1>${this.inl(ir.title)}</h1></header>
${this.toc()}
${this.blocks(kern)}
${appendix}
</article>
</main>
<footer class="tpc-foot">${this.w('course')} · ${this.w('chapter')} ${esc(ir.number)}</footer>
${this.popups()}
</body>
</html>
`;
  }
}

export function renderChapter(ir: ChapterIR, site: SiteInfo, defHomes: Map<string, string>, theoremLike?: string[]): string {
  const r = new Renderer(ir, site);
  r.defHomes = defHomes;
  if (theoremLike) r.theoremLike = theoremLike;
  return r.page();
}

export function renderIndex(lang: Lang, site: SiteInfo): string {
  const items = site.chapters.map((c) => `<li><a href="${c.id}/index.html"><span class="tpc-secno">${esc(c.number)}</span>${esc(c.title[lang])}</a></li>`).join('');
  const other: Lang = lang === 'de' ? 'en' : 'de';
  return `<!doctype html>
<html lang="${lang}" data-tpc-pkg="${site.pkg}" data-tpc-ground="${site.ground}" data-tpc-assets="../assets">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${word('course', lang)}</title>
<link rel="stylesheet" href="../assets/fonts/fonts.css">
<link rel="stylesheet" id="tpc-tokens" href="../assets/tokens/pkg${site.pkg}-${site.ground}.css">
<link rel="stylesheet" href="../assets/site.css">
<script defer src="../assets/site.js"></script>
</head>
<body>
<header class="tpc-topbar"><a class="tpc-home" href="index.html">${word('course', lang)}</a><div class="tpc-controls"><span class="tpc-langs"><a class="tpc-langlink" href="../${other}/index.html" hreflang="${other}" lang="${other}">${other.toUpperCase()}</a></span></div></header>
<main class="tpc-page"><article class="tpc-chapter">
<header class="tpc-chapter-head"><h1>${word('course', lang)}</h1></header>
<h2>${word('chapters', lang)}</h2>
<ol class="tpc-index-list">${items}</ol>
</article></main>
</body>
</html>
`;
}
