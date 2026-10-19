// Page runtime. The page is complete without it (Kern open, blocks are <details>, links are
// links); this adds: opening a closed block when a link leads into it, the depth selector,
// the design switcher, popups for definitions and signposts, the language link that keeps
// the anchor, and lazy mounting of demos.
import './style.css';
import '@gen/temml.css';
import type { Lang } from '../demo/types';

const root = document.documentElement;
root.classList.add('tpc-js');
const assets = root.dataset.tpcAssets ?? '../../assets';
const store = {
  get(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string): void { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};
const query = new URLSearchParams(location.search);

// ── design: package and ground ──────────────────────────────
const tokenLink = document.getElementById('tpc-tokens') as HTMLLinkElement | null;
const buildDesign = { pkg: root.dataset.tpcPkg ?? '1', ground: root.dataset.tpcGround ?? 'light' };

function applyDesign(pkg: string, ground: string, remember: boolean): void {
  if (!['1', '2', '3', '4', '5'].includes(pkg) || !['light', 'dark'].includes(ground)) return;
  const variant = `pkg${pkg}-${ground}`;
  const done = () => document.dispatchEvent(new CustomEvent('tpc:design', { detail: { pkg, ground } }));
  root.dataset.tpcPkg = pkg;
  root.dataset.tpcGround = ground;
  for (const img of document.querySelectorAll<HTMLImageElement>('img[data-fig]')) {
    const have = (img.dataset.variants ?? '').split(' ');
    const use = have.includes(variant) ? variant : `pkg${buildDesign.pkg}-${buildDesign.ground}`;
    const src = `${assets}/figures/${use}/${img.dataset.fig}`;
    if (img.getAttribute('src') !== src) img.setAttribute('src', src);
    // a still built for another variant is shown as it is; say so for the checks
    img.dataset.variant = use;
  }
  if (tokenLink) {
    const href = `${assets}/tokens/${variant}.css`;
    if (tokenLink.getAttribute('href') !== href) {
      tokenLink.addEventListener('load', done, { once: true });
      tokenLink.setAttribute('href', href);
    } else done();
  }
  for (const name of ['pkg', 'ground'] as const) {
    const v = name === 'pkg' ? pkg : ground;
    const input = document.querySelector<HTMLInputElement>(`input[name="tpc-${name}"][value="${v}"]`);
    if (input) input.checked = true;
  }
  if (remember) { store.set('tpc.pkg', pkg); store.set('tpc.ground', ground); }
}

{
  const pkg = query.get('pkg') ?? store.get('tpc.pkg') ?? buildDesign.pkg;
  const ground = query.get('ground') ?? store.get('tpc.ground') ?? buildDesign.ground;
  if (pkg !== buildDesign.pkg || ground !== buildDesign.ground) applyDesign(pkg, ground, false);
  for (const input of document.querySelectorAll<HTMLInputElement>('input[name="tpc-pkg"], input[name="tpc-ground"]')) {
    input.addEventListener('change', () => {
      const p = document.querySelector<HTMLInputElement>('input[name="tpc-pkg"]:checked')?.value ?? buildDesign.pkg;
      const g = document.querySelector<HTMLInputElement>('input[name="tpc-ground"]:checked')?.value ?? buildDesign.ground;
      applyDesign(p, g, true);
    });
  }
}

// ── depth ───────────────────────────────────────────────────
const blocks = () => [...document.querySelectorAll<HTMLDetailsElement>('details.tpc-depth')];

function setDepth(mode: string, remember: boolean): void {
  for (const d of blocks()) {
    const kind = d.dataset.depth;
    d.open = mode === 'alles' || (mode === 'vertiefung' && kind === 'vertiefung');
  }
  root.dataset.tpcDepth = mode;
  const input = document.querySelector<HTMLInputElement>(`input[name="tpc-depth"][value="${mode}"]`);
  if (input) input.checked = true;
  if (remember) store.set('tpc.depth', mode);
}

{
  const mode = query.get('depth') ?? store.get('tpc.depth') ?? 'kern';
  if (mode !== 'kern') setDepth(mode, false);
  for (const input of document.querySelectorAll<HTMLInputElement>('input[name="tpc-depth"]')) {
    input.addEventListener('change', () => { if (input.checked) setDepth(input.value, true); });
  }
  for (const d of blocks()) {
    d.addEventListener('toggle', () => {
      if (d.open) return;
      // collapsing returns the reader to the head of the block
      const r = d.getBoundingClientRect();
      if (r.top < 0) d.scrollIntoView({ block: 'start' });
    });
    d.querySelector<HTMLButtonElement>('.tpc-depth-close')?.addEventListener('click', () => {
      d.open = false;
      d.querySelector('summary')?.focus();
    });
  }
  addEventListener('beforeprint', () => { for (const d of blocks()) d.open = true; });
}

// ── links into closed blocks ────────────────────────────────
function reveal(id: string, flash: boolean): boolean {
  const target = document.getElementById(id);
  if (!target) return false;
  for (let e: Element | null = target; e; e = e.parentElement) {
    if (e instanceof HTMLDetailsElement && !e.open) {
      // the block itself is the target of a signpost: open it too
      e.open = true;
    }
  }
  target.scrollIntoView({ block: target.tagName === 'DETAILS' ? 'start' : 'center' });
  if (flash) {
    target.classList.remove('tpc-flash');
    void (target as HTMLElement).getBoundingClientRect();
    target.classList.add('tpc-flash');
  }
  return true;
}

function fragmentOf(a: HTMLAnchorElement): string | null {
  const href = a.getAttribute('href') ?? '';
  return href.startsWith('#') && href.length > 1 ? decodeURIComponent(href.slice(1)) : null;
}

document.addEventListener('click', (ev) => {
  const a = (ev.target as Element | null)?.closest?.('a');
  if (!(a instanceof HTMLAnchorElement)) return;
  if (a.classList.contains('tpc-langlink')) {
    const id = location.hash ? decodeURIComponent(location.hash.slice(1)) : nearestId();
    if (id) a.href = a.href.split('#')[0] + '#' + encodeURIComponent(id);
    return;
  }
  const id = fragmentOf(a);
  if (id === null) return;
  if ((a.classList.contains('tpc-defref') || a.classList.contains('tpc-zoomref')) && coarse() && !a.dataset.armed) {
    // touch: the first tap shows the popup, the link inside it leads on
    ev.preventDefault();
    showPopup(a, true);
    return;
  }
  if (reveal(id, true)) {
    ev.preventDefault();
    history.pushState(null, '', '#' + encodeURIComponent(id));
    hidePopup();
  }
});
addEventListener('hashchange', () => { if (location.hash) reveal(decodeURIComponent(location.hash.slice(1)), true); });
addEventListener('popstate', () => { if (location.hash) reveal(decodeURIComponent(location.hash.slice(1)), false); });
if (location.hash) requestAnimationFrame(() => reveal(decodeURIComponent(location.hash.slice(1)), true));

/** The last element with an id above the top third of the viewport: the reader's place. */
function nearestId(): string | null {
  let best: string | null = null;
  const limit = innerHeight / 3;
  for (const e of document.querySelectorAll<HTMLElement>('main [id]')) {
    if (e.id.startsWith('tpc-') || e.closest('details:not([open]) > :not(summary)')) continue;
    const r = e.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    if (r.top <= limit) best = e.id; else break;
  }
  return best;
}

// ── popups: definitions and signpost leads ──────────────────
const coarse = () => matchMedia('(hover: none)').matches;
let popup: HTMLElement | null = null;
let popupFor: Element | null = null;
const strings = JSON.parse(document.body.dataset.strings ?? '{}') as Record<string, string>;

function hidePopup(): void {
  popup?.remove();
  popup = null;
  popupFor?.removeAttribute('aria-describedby');
  popupFor = null;
}

function showPopup(a: HTMLElement, withLink: boolean): void {
  if (popupFor === a) return;
  hidePopup();
  const box = document.createElement('div');
  box.className = 'tpc-popup';
  box.id = 'tpc-popup';
  box.setAttribute('role', 'tooltip');
  const def = a.dataset.def;
  if (def) {
    const tpl = document.querySelector<HTMLTemplateElement>(`#tpc-popup-sources template[data-def="${def}"]`);
    if (!tpl) return;
    box.append(tpl.content.cloneNode(true));
  } else if (a.dataset.lead) {
    const p = document.createElement('p');
    p.textContent = a.dataset.lead;
    box.append(p);
  } else return;
  if (withLink && a instanceof HTMLAnchorElement) {
    const go = document.createElement('a');
    go.className = 'tpc-popup-more';
    go.href = a.getAttribute('href') ?? '#';
    go.dataset.armed = '1';
    go.textContent = (def ? strings.toDefinition : strings.toBlock) ?? '→';
    box.append(go);
  }
  document.body.append(box);
  const r = a.getBoundingClientRect();
  const w = box.offsetWidth;
  const left = Math.max(8, Math.min(scrollX + r.left, scrollX + innerWidth - w - 8));
  box.style.left = `${left}px`;
  const below = scrollY + r.bottom + 6;
  box.style.top = r.bottom + box.offsetHeight + 12 > innerHeight && r.top > box.offsetHeight + 12
    ? `${scrollY + r.top - box.offsetHeight - 6}px` : `${below}px`;
  a.setAttribute('aria-describedby', box.id);
  popup = box;
  popupFor = a;
}

for (const a of document.querySelectorAll<HTMLElement>('.tpc-defref[data-def], .tpc-zoomref[data-lead]')) {
  a.addEventListener('mouseenter', () => { if (!coarse()) showPopup(a, false); });
  a.addEventListener('mouseleave', () => { if (!coarse()) hidePopup(); });
  a.addEventListener('focus', () => showPopup(a, false));
  a.addEventListener('blur', () => { if (!coarse()) hidePopup(); });
}
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') hidePopup(); });
document.addEventListener('pointerdown', (ev) => {
  if (popup && !popup.contains(ev.target as Node) && popupFor !== ev.target && !popupFor?.contains(ev.target as Node)) hidePopup();
});

// ── demos ───────────────────────────────────────────────────
const loading = new Map<string, Promise<void>>();

function loadDemoScript(id: string): Promise<void> {
  let p = loading.get(id);
  if (!p) {
    p = new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `${assets}/demos/${id}.js`;
      s.addEventListener('load', () => resolve());
      s.addEventListener('error', () => reject(new Error(`demo ${id}: ${s.src} did not load`)));
      document.head.append(s);
    });
    loading.set(id, p);
  }
  return p;
}

async function mountDemo(host: HTMLElement): Promise<void> {
  const id = host.dataset.demo!;
  if (host.dataset.state) return;
  host.dataset.state = 'loading';
  try {
    await loadDemoScript(id);
    const reg = window.__tpcDemos?.[id];
    if (!reg) throw new Error(`demo ${id}: the bundle did not register it`);
    reg.mountInto(host, { lang: (host.dataset.lang ?? root.lang) as Lang, title: host.dataset.title });
    host.dataset.state = 'mounted';
  } catch (e) {
    // the still stays as the fallback
    host.dataset.state = 'failed';
    host.dataset.error = (e as Error).message;
    console.warn(e);
  }
}

{
  const hosts = [...document.querySelectorAll<HTMLElement>('.tpc-demo[data-demo]')];
  const only = query.get('demo');
  if ('IntersectionObserver' in window && !query.has('frame')) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); void mountDemo(e.target as HTMLElement); }
    }, { rootMargin: '300px' });
    for (const h of hosts) io.observe(h);
  } else {
    for (const h of hosts) if (!only || h.dataset.demo === only) void mountDemo(h);
  }
}
