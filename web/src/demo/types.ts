// The demo interface. web/README.md documents it; this file is the authority.

export type Lang = 'de' | 'en';
export type RGB = readonly [number, number, number];

/** Design tokens as the page currently shows them (they change with the design switcher). */
export interface Tokens {
  readonly pkg: number;
  readonly ground: 'light' | 'dark';
  /** CSS colour of a token, e.g. color('stage-state'). Names: design/README.md, without the tpc- prefix. */
  color(name: string): string;
  /** sRGB components in 0..1 */
  rgb(name: string): RGB;
  /** linear-light components in 0..1 (for shader uniforms) */
  linear(name: string): RGB;
  /** stroke width in CSS px: 'hair' | 'thin' | 'regular' | 'state' | 'effect' | 'dynamics' | 'bath' | 'box' ... */
  stroke(name: string): number;
  /** dash pattern in CSS px: 'effect' | 'bath' */
  dash(name: string): number[];
  /** CSS font shorthand parts of a type role: 'body' | 'small' | 'label' | 'mono' ... */
  font(role: string): { family: string; sizePx: number; weight: string; style: string };
}

export interface SymbolLabel { name: string; unicode: string; mathml: string }

export interface SliderSpec {
  label: string;              // plain text, already in the page language (use ctx.text or ctx.symbol)
  labelHtml?: string;         // optional richer label (MathML from ctx.symbol(...).mathml)
  min: number; max: number; step: number; value: number;
  format?: (v: number) => string;
  /** the slider the arrow keys on the stage move */
  primary?: boolean;
  onInput: (v: number) => void;
}
export interface SliderHandle { readonly value: number; set(v: number): void }
export interface ReadoutHandle { set(text: string): void }

export interface DemoUI {
  slider(spec: SliderSpec): SliderHandle;
  button(label: string, onClick: () => void): HTMLButtonElement;
  readout(label: string, labelHtml?: string): ReadoutHandle;
}

export interface DemoContext {
  readonly id: string;
  readonly lang: Lang;
  readonly tokens: Tokens;
  /** string parameters: data-params of the embedding element, overridden by the URL query */
  readonly params: Readonly<Record<string, string>>;
  /** pick the string of the page language */
  text(de: string, en: string): string;
  /** name and rendering of a registry symbol, by symbol ID (registry/notation.json) */
  symbol(symbolId: string): SymbolLabel;
  readonly ui: DemoUI;
  /** the user asked for reduced motion: nothing moves unless a control is used */
  readonly reducedMotion: boolean;
  /** deterministic mode (?frame=..): no clock, no requestAnimationFrame; frames are rendered on request */
  readonly deterministic: boolean;
  readonly seed: number;
  /** seeded pseudo-random numbers in [0, 1): the only source of randomness a demo may use */
  random(): number;
  readonly fps: number;
  /** ask for a re-render after a state change */
  invalidate(): void;
  /** announce a result to assistive technology (aria-live) */
  announce(text: string): void;
}

export interface DemoInstance {
  /**
   * Draw the state at animation time `time` = frame / fps (seconds). Must be a pure function
   * of (frame, the demo's own state, tokens): the same call draws the same picture.
   */
  render(frame: number, time: number): void;
  /** stage size changed (CSS px) */
  resize?(width: number, height: number): void;
  /** design tokens changed (package or ground switched) */
  tokensChanged?(): void;
  destroy?(): void;
  /** facts recorded by the frame capture (e.g. the WebGL renderer string) */
  info?(): Record<string, string | number | boolean>;
}

export interface DemoMeta {
  /** the demo has a time axis: the harness adds play/pause and steps frames */
  animated?: boolean;
  /** stage aspect ratio width / height (default 16 / 9) */
  aspect?: number;
  /**
   * the surface the demo draws on (design/README.md, "Three surfaces"): 'plate' for 2D
   * drawings with plate roles (light on both grounds), 'stage' for 3D scenes with stage-*
   * roles (default)
   */
  surface?: 'plate' | 'stage';
  /** needs WebGL 2: without it the still stays */
  webgl2?: boolean;
}

/** What web/src/demos/<id>.ts exports. */
export interface DemoModule {
  meta?: DemoMeta;
  mount(stage: HTMLElement, ctx: DemoContext): DemoInstance;
}

/** Thrown by mount when the demo cannot run here (no WebGL 2): the still stays. */
export class DemoUnsupported extends Error {}

export interface MountOptions { lang: Lang; title?: string; standalone?: boolean; params?: Record<string, string> }

export interface MountedDemo {
  readonly id: string;
  readonly fps: number;
  readonly deterministic: boolean;
  renderFrame(frame: number): Promise<void>;
  info(): Record<string, string | number | boolean>;
  destroy(): void;
}

export interface RegisteredDemo { id: string; mountInto(host: HTMLElement, opts: MountOptions): MountedDemo }

declare global {
  interface Window {
    __tpcDemos?: Record<string, RegisteredDemo>;
    /** the demo of a standalone page or of ?demo=<id>, for frame capture */
    __tpcDemo?: MountedDemo;
  }
}
