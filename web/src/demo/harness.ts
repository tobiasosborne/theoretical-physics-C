// Demo harness: frame, controls, clock, deterministic mode, token and label access.
// A demo module (web/src/demos/<id>.ts) only draws; everything around it is here.
import labels from '@gen/labels.json';
import video from '@gen/video.json';
import css from './demo.css?inline';
import { readTokens } from './tokens';
import { DemoUnsupported, type DemoContext, type DemoInstance, type DemoModule, type DemoUI, type Lang, type MountOptions, type MountedDemo, type SymbolLabel } from './types';

/** Frames per second of the demo clock and of captured video: tokens.json, video.fps. */
export const FPS: number = video.fps;

type LabelTable = Record<string, { de: string; en: string; unicode: string; mathml: string }>;

function ensureStyle(): void {
  if (document.querySelector('style[data-tpcd]')) return;
  const st = document.createElement('style');
  st.dataset.tpcd = '';
  st.textContent = css;
  document.head.append(st);
}

/** mulberry32: a small seeded generator, so that random demos replay exactly */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0; // tpc-lint: allow(mulberry32 state increment, not a colour)
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let uid = 0;

export function mountDemo(id: string, mod: DemoModule, host: HTMLElement, opts: MountOptions): MountedDemo {
  ensureStyle();
  const lang: Lang = opts.lang;
  const query = new URLSearchParams(location.search);
  const params: Record<string, string> = { ...(opts.params ?? {}) };
  if (host.dataset.params) Object.assign(params, JSON.parse(host.dataset.params) as Record<string, string>);
  const addressed = opts.standalone === true || query.get('demo') === id;
  if (addressed) query.forEach((v, k) => { params[k] = v; });
  const deterministic = addressed && query.has('frame');
  const seed = Number(params.seed ?? '1') || 1;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const meta = mod.meta ?? {};
  const n = ++uid;

  const frameEl = document.createElement('div');
  frameEl.className = 'tpcd';
  frameEl.dataset.demoId = id;
  const stage = document.createElement('div');
  stage.className = meta.surface === 'plate' ? 'tpcd-stage tpcd-plate' : 'tpcd-stage';
  stage.tabIndex = 0;
  stage.setAttribute('role', 'img');
  if (opts.title) stage.setAttribute('aria-label', opts.title);
  const controls = document.createElement('div');
  controls.className = 'tpcd-controls';
  const status = document.createElement('div');
  status.className = 'tpcd-status';
  status.setAttribute('aria-live', 'polite');
  frameEl.append(stage, controls, status);

  // stage size: ?stage=WxH fixes it (frame capture); otherwise the aspect ratio of the demo
  const fixed = (params.stage ?? '').split('x').map(Number);
  if (fixed.length === 2 && fixed.every((x) => Number.isFinite(x) && x > 0)) {
    frameEl.classList.add('tpcd-capture');
    stage.style.width = `${fixed[0]}px`;
    stage.style.height = `${fixed[1]}px`;
  } else {
    stage.style.aspectRatio = String(meta.aspect ?? 16 / 9);
  }

  let primary: { step: number; min: number; max: number; get: () => number; set: (v: number) => void } | null = null;
  let dirty = true;
  let raf = 0;
  let playing = false;
  let time = 0;
  let last = 0;
  let instance: DemoInstance | null = null;
  let visible = true;

  const draw = () => {
    dirty = false;
    instance?.render(Math.round(time * FPS), time);
  };
  const tick = (now: number) => {
    raf = 0;
    if (playing && visible && !document.hidden) {
      time += Math.min(0.1, (now - last) / 1000);
      last = now;
      dirty = true;
    }
    if (dirty) draw();
    if (playing && visible) schedule();
  };
  const schedule = () => {
    if (deterministic || raf) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const invalidate = () => { dirty = true; if (deterministic) draw(); else schedule(); };

  const ui: DemoUI = {
    slider(spec) {
      const wrap = document.createElement('label');
      wrap.className = 'tpcd-control';
      const name = document.createElement('span');
      if (spec.labelHtml) name.innerHTML = spec.labelHtml; else name.textContent = spec.label;
      const input = document.createElement('input');
      input.type = 'range';
      input.min = String(spec.min); input.max = String(spec.max); input.step = String(spec.step); input.value = String(spec.value);
      input.setAttribute('aria-label', spec.label);
      const out = document.createElement('output');
      const fmt = spec.format ?? ((v: number) => String(v));
      out.textContent = fmt(spec.value);
      const apply = (v: number, fire: boolean) => {
        const c = Math.min(spec.max, Math.max(spec.min, v));
        input.value = String(c);
        out.textContent = fmt(c);
        input.setAttribute('aria-valuetext', fmt(c));
        if (fire) { spec.onInput(c); invalidate(); }
      };
      input.addEventListener('input', () => apply(Number(input.value), true));
      wrap.append(name, input, out);
      controls.append(wrap);
      const h = { get value() { return Number(input.value); }, set: (v: number) => apply(v, false) };
      if (spec.primary) primary = { step: spec.step, min: spec.min, max: spec.max, get: () => Number(input.value), set: (v) => apply(v, true) };
      return h;
    },
    button(label, onClick) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', () => { onClick(); invalidate(); });
      controls.append(b);
      return b;
    },
    readout(label, labelHtml) {
      const wrap = document.createElement('span');
      wrap.className = 'tpcd-readout';
      const name = document.createElement('span');
      if (labelHtml) name.innerHTML = labelHtml; else name.textContent = label;
      const out = document.createElement('output');
      out.id = `tpcd-out-${n}-${controls.childElementCount}`;
      wrap.append(name, out);
      controls.append(wrap);
      return { set: (text: string) => { out.textContent = text; } };
    },
  };

  const table = labels as LabelTable;
  const ctx: DemoContext = {
    id, lang, params,
    tokens: readTokens(frameEl),
    text: (de, en) => (lang === 'en' ? en : de),
    symbol(symbolId): SymbolLabel {
      const s = table[symbolId];
      if (!s) throw new Error(`demo ${id}: symbol '${symbolId}' is not in the notation registry`);
      return { name: s[lang], unicode: s.unicode, mathml: s.mathml };
    },
    ui, reducedMotion, deterministic, seed,
    random: rng(seed),
    fps: FPS,
    invalidate,
    announce: (text) => { status.textContent = text; },
  };

  host.append(frameEl);
  try {
    instance = mod.mount(stage, ctx);
  } catch (e) {
    frameEl.remove();
    throw e;
  }

  let playButton: HTMLButtonElement | null = null;
  const setPlaying = (p: boolean) => {
    playing = p;
    if (playButton) {
      playButton.textContent = p ? ctx.text('Anhalten', 'Pause') : ctx.text('Abspielen', 'Play');
      playButton.setAttribute('aria-pressed', String(p));
    }
    if (p) schedule();
  };
  if (meta.animated && !deterministic) {
    playButton = ui.button('', () => setPlaying(!playing));
    controls.prepend(playButton);
    setPlaying(false);
  }

  stage.addEventListener('keydown', (ev) => {
    if (primary && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight' || ev.key === 'ArrowDown' || ev.key === 'ArrowUp')) {
      const dir = ev.key === 'ArrowLeft' || ev.key === 'ArrowDown' ? -1 : 1;
      primary.set(primary.get() + dir * primary.step);
      ev.preventDefault();
    } else if (meta.animated && !deterministic && (ev.key === ' ' || ev.key === 'Enter')) {
      setPlaying(!playing);
      ev.preventDefault();
    }
  });

  const ro = new ResizeObserver(() => {
    const r = stage.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) { instance?.resize?.(r.width, r.height); invalidate(); }
  });
  ro.observe(stage);
  const io = new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); if (visible) schedule(); });
  io.observe(stage);
  const onDesign = () => { instance?.tokensChanged?.(); invalidate(); };
  document.addEventListener('tpc:design', onDesign);

  {
    const r = stage.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) instance.resize?.(r.width, r.height);
  }
  if (deterministic) {
    time = (Number(params.frame ?? '0') || 0) / FPS;
    draw();
  } else {
    schedule();
  }

  const mounted: MountedDemo = {
    id, fps: FPS, deterministic,
    async renderFrame(frame: number) {
      time = frame / FPS;
      const r = stage.getBoundingClientRect();
      instance?.resize?.(r.width, r.height);
      draw();
    },
    info: () => ({ id, lang, pkg: ctx.tokens.pkg, ground: ctx.tokens.ground, ...(instance?.info?.() ?? {}) }),
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      document.removeEventListener('tpc:design', onDesign);
      instance?.destroy?.();
      frameEl.remove();
    },
  };
  if (addressed) window.__tpcDemo = mounted;
  return mounted;
}

/** Called by the generated entry of each demo bundle (web/tools/build: demo entries). */
export function registerDemo(id: string, mod: DemoModule): void {
  if (typeof mod.mount !== 'function') throw new Error(`demo ${id}: the module does not export mount(stage, ctx)`);
  const reg = (window.__tpcDemos ??= {});
  reg[id] = { id, mountInto: (host, opts) => mountDemo(id, mod, host, opts) };
  document.dispatchEvent(new CustomEvent('tpc:demo-registered', { detail: { id } }));
}

export { DemoUnsupported };
