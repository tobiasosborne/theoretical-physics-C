// Frame capture: open a demo's standalone page in deterministic mode in headless Chromium,
// step frames, write PNGs, assemble an mp4 with ffmpeg.
//
//   tsx tools/capture/capture.ts --demo c99.demo.scherung-b [--lang de] [--frames 90] [--from 0]
//        [--size 1920x1080] [--ground light|dark] [--gl swiftshader|gl-egl|vulkan] [--seed 1]
//        [--out build/web/capture/<demo>-<gl>] [--standalone build/web/standalone]
//
// Frame size and rate default to the design tokens (tokens.json: video.width/height/fps,
// through build/web/gen/video.json). The picture of frame n is the demo's render(n, n / fps)
// and nothing else: no clock runs. Writes frames/frame-00000.png ..., <demo>.mp4 and
// capture.json (renderer string, flags, measured timings).
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { REPO_ROOT } from '../convert/env.ts';

const args = process.argv.slice(2);
const opt = (n: string, d?: string) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const demo = opt('--demo');
if (!demo) { console.error('capture: --demo <id> is required'); process.exit(2); }
const lang = opt('--lang', 'de')!;
const video = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'build/web/gen/video.json'), 'utf8')) as { width: number; height: number; fps: number };
const [width, height] = (opt('--size', `${video.width}x${video.height}`)!).split('x').map(Number);
const frames = Number(opt('--frames', String(3 * video.fps)));
const from = Number(opt('--from', '0'));
const ground = opt('--ground', 'light')!;
const gl = opt('--gl', 'swiftshader')!;
const seed = opt('--seed', '1')!;
const standalone = path.resolve(opt('--standalone', path.join(REPO_ROOT, 'build/web/standalone'))!);
const out = path.resolve(opt('--out', path.join(REPO_ROOT, 'build/web/capture', `${demo}-${gl}`))!);

const GL_FLAGS: Record<string, string[]> = {
  // software rasteriser shipped with Chromium: no GPU needed, the same on every machine
  swiftshader: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  // the machine's GPU through ANGLE on OpenGL ES / EGL
  'gl-egl': ['--use-gl=angle', '--use-angle=gl-egl', '--ignore-gpu-blocklist'],
  // the machine's GPU through ANGLE on Vulkan
  vulkan: ['--use-angle=vulkan', '--enable-features=Vulkan', '--ignore-gpu-blocklist'],
};
if (!GL_FLAGS[gl]) { console.error(`capture: --gl must be one of ${Object.keys(GL_FLAGS).join(', ')}`); process.exit(2); }

const page0 = path.join(standalone, `${demo}.${lang}.html`);
if (!fs.existsSync(page0)) { console.error(`capture: FAIL ${page0} missing (build the site first)`); process.exit(1); }
const framesDir = path.join(out, 'frames');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

const t0 = performance.now();
const browser = await chromium.launch({ args: GL_FLAGS[gl] });
const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
const remote: string[] = [];
await ctx.route('**/*', (r) => { const u = r.request().url(); if (u.startsWith('file:') || u.startsWith('data:')) return r.continue(); remote.push(u); return r.abort(); });
const page = await ctx.newPage();
const errors: string[] = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(pathToFileURL(page0).href + `?seed=${seed}&frame=${from}&stage=${width}x${height}&ground=${ground}`);
await page.evaluate('document.fonts.ready');
const state = await page.evaluate('(() => { const e = document.getElementById("tpc-standalone"); return { state: e.dataset.state || "", error: e.dataset.error || "" }; })()') as { state: string; error: string };
if (state.state !== 'mounted') {
  console.error(`capture: FAIL ${demo} did not mount in headless Chromium with ${GL_FLAGS[gl].join(' ')}: ${state.error}`);
  await browser.close();
  process.exit(1);
}
const info = await page.evaluate('window.__tpcDemo.info()') as Record<string, string | number | boolean>;
const tReady = performance.now();

const hashes: string[] = [];
let renderMs = 0, shotMs = 0;
let drawn: { canvas: boolean; distinct: number } | null = null;
for (let i = 0; i < frames; i++) {
  const n = from + i;
  const a = performance.now();
  await page.evaluate(`window.__tpcDemo.renderFrame(${n})`);
  const b = performance.now();
  const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width, height } });
  const c = performance.now();
  renderMs += b - a; shotMs += c - b;
  fs.writeFileSync(path.join(framesDir, `frame-${String(i).padStart(5, '0')}.png`), png);
  hashes.push(crypto.createHash('sha256').update(png).digest('hex'));
  if (i === 0) {
    // is something drawn? count the distinct colours of the WebGL canvas, read back in the page
    drawn = await page.evaluate(`(() => {
      const c = document.querySelector('.tpcd-stage canvas');
      if (!c) return { canvas: false, distinct: 0 };
      const k = document.createElement('canvas'); k.width = c.width; k.height = c.height;
      const g = k.getContext('2d'); g.drawImage(c, 0, 0);
      const d = g.getImageData(0, 0, k.width, k.height).data; const seen = new Set();
      for (let i = 0; i < d.length; i += 4 * 97) seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
      return { canvas: true, distinct: seen.size };
    })()`) as { canvas: boolean; distinct: number };
  }
}
// determinism: the first frame again, after all the others
await page.evaluate(`window.__tpcDemo.renderFrame(${from})`);
const again = crypto.createHash('sha256').update(await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width, height } })).digest('hex');
const version = browser.version();
await browser.close();
const tFrames = performance.now();

const problems: string[] = [];
if (remote.length) problems.push(`the page asked for remote resources: ${remote.join(', ')}`);
if (errors.length) problems.push(`script errors: ${errors.join('; ')}`);
if (again !== hashes[0]) problems.push('frame 0 rendered again after the run is not the same picture: not deterministic');
if (new Set(hashes).size < 2 && frames > 1) problems.push('all frames are the same picture');
if (drawn && drawn.canvas && drawn.distinct < 3) problems.push(`the WebGL canvas shows ${drawn.distinct} colour(s): nothing was drawn`);

const mp4 = path.join(out, `${demo}.mp4`);
const ff0 = performance.now();
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(video.fps), '-i', path.join(framesDir, 'frame-%05d.png'),
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', mp4], { stdio: 'inherit' });
const ff1 = performance.now();
const probe = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=nb_read_frames,width,height,r_frame_rate,codec_name', '-of', 'json', mp4]).toString();
const stream = (JSON.parse(probe) as { streams: Array<Record<string, string | number>> }).streams[0];
if (Number(stream.nb_read_frames) !== frames) problems.push(`the mp4 has ${stream.nb_read_frames} frames, ${frames} were written`);

const record = {
  demo, lang, ground, seed: Number(seed), frames, from, size: `${width}x${height}`, fps: video.fps,
  chromium: version, flags: GL_FLAGS[gl], gl,
  renderer: info,
  webglCanvas: drawn,
  distinctFrames: new Set(hashes).size,
  deterministic: again === hashes[0],
  measured_ms: {
    launch_and_load: Math.round(tReady - t0),
    render_per_frame: +(renderMs / frames).toFixed(2),
    screenshot_per_frame: +(shotMs / frames).toFixed(2),
    all_frames: Math.round(tFrames - tReady),
    ffmpeg: Math.round(ff1 - ff0),
  },
  mp4: { file: path.relative(REPO_ROOT, mp4), bytes: fs.statSync(mp4).size, ...stream },
  problems,
};
fs.writeFileSync(path.join(out, 'capture.json'), JSON.stringify(record, null, 1));
console.log(`capture: ${problems.length ? 'FAIL' : 'ok'} ${demo} ${width}x${height} x ${frames} frames, ${gl}: renderer "${info.renderer ?? '(no WebGL: 2D demo)'}"; `
  + `render ${record.measured_ms.render_per_frame} ms/frame, screenshot ${record.measured_ms.screenshot_per_frame} ms/frame; ${record.distinctFrames} distinct frames; `
  + `mp4 ${record.mp4.bytes} bytes, ${stream.nb_read_frames} frames -> ${path.relative(REPO_ROOT, mp4)}`);
for (const p of problems) console.log(`capture: FAIL ${p}`);
process.exit(problems.length ? 1 : 0);
