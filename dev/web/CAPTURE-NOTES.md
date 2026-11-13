<!-- ROLE: record of the headless WebGL / frame-capture test (review item C9). Owner: web
     work package. UPDATE POLICY: replace the measurements when the test is re-run; every
     number here is a measurement with its command, none is an estimate. -->

# Frame capture: headless WebGL 2 works on this machine

Question (REVIEW.md, C9): can the tested three.js scene be rendered frame by frame in a
headless browser, with a real WebGL 2 context? Answer: yes, with the software rasteriser
and with the GPU. Evidence below; measured 2026-10-11.

## What was run

```
bash scripts/course/build_course.sh --chapters c99 --all-editions
bash web/check.sh --chapters c99
bash web/run.sh capture --demo c99.demo.scherung-b --gl swiftshader --frames 90
bash web/run.sh capture --demo c99.demo.scherung-b --gl gl-egl      --frames 90
bash web/run.sh capture --demo c99.demo.scherung-b --gl vulkan      --frames 90
bash web/run.sh capture --demo c99.demo.scherung   --frames 30      # 2D (SVG) demo, same route
```

The scene is `web/src/demos/c99.demo.scherung-b.ts`: a three.js r186 scene (two slabs, line
segments, a perspective camera that swings), drawn by `THREE.WebGLRenderer` on a context
obtained with `canvas.getContext('webgl2')`; no 2D-canvas fallback exists in the code. The
capture opens the standalone single file `build/web/standalone/c99.demo.scherung-b.de.html`
through `file://` with every non-`file:` request aborted, in deterministic mode
(`?seed=1&frame=0&stage=1920x1080`), calls `window.__tpcDemo.renderFrame(n)` for each frame
and takes a viewport screenshot. Frame size 1920x1080 and 30 frames per second come from
`design/build/pkg1-light/tokens.json` (`video`).

Machine: Intel Raptor Lake-P, Iris Xe Graphics (`lspci`), Mesa; Playwright 1.64.0 with its
Chromium headless shell 156.0.8078.4; ffmpeg 6.1.1.

## Results (from `build/web/capture/<demo>-<gl>/capture.json`)

| `--gl` | Chromium flags | renderer string (`WEBGL_debug_renderer_info`) | context | render, ms/frame | screenshot, ms/frame | 90 frames, ms | ffmpeg, ms | mp4 bytes |
|---|---|---|---|---|---|---|---|---|
| `swiftshader` | `--use-angle=swiftshader --enable-unsafe-swiftshader` | ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver) | WebGL 2.0 (OpenGL ES 3.0 Chromium) | 4.11 | 115.44 | 11339 | 1760 | 164081 |
| `gl-egl` | `--use-gl=angle --use-angle=gl-egl --ignore-gpu-blocklist` | ANGLE (Intel, Mesa Intel(R) Iris(R) Xe Graphics (RPL-U), OpenGL ES 3.2) | WebGL 2.0 (OpenGL ES 3.0 Chromium) | 2.68 | 72.26 | 6992 | 1407 | 159185 |
| `vulkan` | `--use-angle=vulkan --enable-features=Vulkan --ignore-gpu-blocklist` | ANGLE (Intel, Vulkan 1.4.318 (Intel(R) Iris(R) Xe Graphics (RPL-U) (0x0000A7A1)), Intel open-source Mesa driver) | WebGL 2.0 (OpenGL ES 3.0 Chromium) | 2.52 | 89.02 | 8472 | 1470 | 157906 |

One run each; the timings vary between runs (an earlier run of the same commands gave
screenshot times of 135.89, 110.23 and 90.85 ms/frame). In every run:

- the demo mounted, `renderer.capabilities.isWebGL2` was true, drawing buffer 1920x1080;
- the WebGL canvas, read back in the page, showed 20 or 21 distinct colours on a sample of
  its pixels (a blank canvas shows one), and the frames were looked at
  (`frames/frame-00045.png`: the two slabs on the light stage; the same with `--ground dark`
  on the dark stage, with the dark-ground token colours);
- frame 0 rendered again after the other 89 frames gave a byte-identical PNG (deterministic);
- 61 of the 90 PNGs are distinct: the camera path is a sine that turns around at frame 60,
  so frames 60+k and 60-k are the same picture;
- ffmpeg (libx264, yuv420p, crf 18) produced an mp4 that `ffprobe -count_frames` reads back
  as 90 frames, 1920x1080, 30/1.

Without any flag the headless shell also gives a WebGL 2 context (the SwiftShader renderer
string above); the flags are passed anyway so that the choice is explicit.

## What this does and does not show

Shown: context creation, shader compilation and drawing of a three.js scene, readback
through screenshots, exact repetition of a frame, mp4 assembly, at 1920x1080.

Not tested here: floating-point render targets and float readback, volume textures, 4K
frames, long runs, a scene of the size of the hydrogen views, other machines and CI
runners (the `gl-egl` and `vulkan` rows need this machine's GPU; `swiftshader` needs none),
Firefox. Pixel equality between the three back ends was not compared and is not expected.
The screenshot, not the scene, dominates the time per frame in all three rows.
