// three.js on WebGL 2 for demos. Imported only by demos that draw in 3D, so that 2D demo
// bundles stay free of three.js.
import { WebGLRenderer } from 'three';
import { DemoUnsupported, type DemoContext } from './types';

export interface Stage3D { renderer: WebGLRenderer; canvas: HTMLCanvasElement; info(): Record<string, string | number | boolean> }

export function createRenderer(stage: HTMLElement, ctx: DemoContext): Stage3D {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl2', {
    antialias: true,
    alpha: false,
    // frame capture reads the canvas after the draw call returns
    preserveDrawingBuffer: ctx.deterministic,
  });
  if (!gl) throw new DemoUnsupported('WebGL 2 is not available');
  const renderer = new WebGLRenderer({ canvas, context: gl, antialias: true });
  // deterministic frames are rendered at one device pixel per CSS pixel
  renderer.setPixelRatio(ctx.deterministic ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  stage.append(canvas);
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const unmasked = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
  const vendor = dbg ? String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL)) : '';
  return {
    renderer, canvas,
    info: () => ({
      webgl: String(gl.getParameter(gl.VERSION)),
      glsl: String(gl.getParameter(gl.SHADING_LANGUAGE_VERSION)),
      renderer: unmasked || String(gl.getParameter(gl.RENDERER)),
      vendor: vendor || String(gl.getParameter(gl.VENDOR)),
      isWebGL2: renderer.capabilities.isWebGL2,
      maxTextureSize: Number(gl.getParameter(gl.MAX_TEXTURE_SIZE)),
      drawingBuffer: `${gl.drawingBufferWidth}x${gl.drawingBufferHeight}`,
    }),
  };
}
