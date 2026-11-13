// Runs inside the page (plain JavaScript, injected by tools/checks/browser.ts).
window.__tpcCheck = {
  /** C7: visible links that point into the content of a closed block, signposts excepted. */
  linksIntoClosed() {
    const bad = [];
    const closedContent = (el) => {
      for (let e = el; e; e = e.parentElement) {
        const p = e.parentElement;
        if (p && p.tagName === 'DETAILS' && !p.open && e.tagName !== 'SUMMARY') return p;
      }
      return null;
    };
    for (const a of document.querySelectorAll('a[href^="#"]')) {
      if (closedContent(a)) continue;                         // the link itself is not visible
      if (a.getClientRects().length === 0) continue;
      const id = decodeURIComponent(a.getAttribute('href').slice(1));
      const target = document.getElementById(id);
      if (!target) continue;
      const block = closedContent(target);
      if (block && !a.classList.contains('tpc-zoomref')) {
        bad.push({ text: a.textContent.trim().slice(0, 40), href: a.getAttribute('href'), block: block.id });
      }
    }
    return bad;
  },
  depthBlocks() {
    const d = [...document.querySelectorAll('details.tpc-depth')];
    return { vertiefung: d.filter((x) => x.dataset.depth === 'vertiefung').length, fundament: d.filter((x) => x.dataset.depth === 'fundament').length, open: d.filter((x) => x.open).length };
  },
  /** Mathematics: error elements and boxes of size zero. */
  mathFaults() {
    const faults = [];
    const invisible = /^[⁡⁢⁣⁤​\s]*$/;
    document.querySelectorAll('merror, .temml-error').forEach((e) => faults.push({ what: 'merror', where: where(e) }));
    function where(e) {
      const item = e.closest('[data-origin]');
      return item ? item.dataset.origin + '  ' + item.dataset.src : (e.closest('[id]') || {}).id || '';
    }
    for (const m of document.querySelectorAll('math')) {
      if (m.closest('details:not([open]) > :not(summary)') || m.closest('template') || m.closest('[hidden]')) continue;
      // not displayed on purpose (the return line shown only while the block is closed)
      let hiddenByStyle = false;
      for (let e = m.parentElement; e; e = e.parentElement) if (getComputedStyle(e).display === 'none') { hiddenByStyle = true; break; }
      if (hiddenByStyle) continue;
      const r = m.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) { faults.push({ what: 'zero-size <math> ' + Math.round(r.width) + 'x' + Math.round(r.height), where: where(m) }); continue; }
      for (const t of m.querySelectorAll('mi, mn, mo, mtext')) {
        if (invisible.test(t.textContent)) continue;
        const b = t.getBoundingClientRect();
        if (b.width <= 0 || b.height <= 0) faults.push({ what: 'zero-size <' + t.tagName.toLowerCase() + '> ' + JSON.stringify(t.textContent), where: where(m) });
      }
    }
    return { count: document.querySelectorAll('math').length, faults };
  },
  /** Horizontal gap, in em of the formula, between the operator named and the next token. */
  operatorGap(probe, opText) {
    const m = document.querySelector('[data-probe="' + probe + '"] math');
    if (!m) return null;
    const toks = [...m.querySelectorAll('mi, mn, mo, mtext')].filter((t) => t.getBoundingClientRect().width > 0);
    const i = toks.findIndex((t) => t.textContent === opText);
    if (i < 0 || !toks[i + 1]) return null;
    const em = parseFloat(getComputedStyle(m).fontSize);
    return (toks[i + 1].getBoundingClientRect().left - toks[i].getBoundingClientRect().right) / em;
  },
  probeText(probe) {
    const m = document.querySelector('[data-probe="' + probe + '"] math');
    if (!m) return null;
    const t = m.querySelector('mi');
    const r = t.getBoundingClientRect();
    return { tag: t.tagName.toLowerCase(), codepoints: [...t.textContent].map((c) => c.codePointAt(0).toString(16)), mathvariant: t.getAttribute('mathvariant'), width: r.width, height: r.height };
  },
  mathFont() {
    const m = document.querySelector('math');
    const fam = getComputedStyle(m).fontFamily;
    const first = fam.split(',')[0].trim().replace(/^["']|["']$/g, '');
    return { family: fam, first, loaded: document.fonts.check('16px "' + first + '"'), faces: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/["']/g, '')) };
  },
};
