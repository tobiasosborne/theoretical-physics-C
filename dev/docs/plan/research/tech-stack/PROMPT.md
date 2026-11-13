You are an independent technical architect reviewing a plan for a large teaching-material project. Read, in this order:
1. docs/plan/BRIEF.md (the requirements, written by the course author TJO)
2. docs/plan/CONTEXT.md (facts about this repo, sibling repos, sources, toolchain)
3. HANDOFF.md and README.md of this repo; build.sh, ci.sh, scripts/check_parity.py
4. ../generalrelativity/HANDOFF.md and its web/ pipeline (preprocess.py, gr-filter.lua, postprocess.py, template.html) and one widget under web/widgets/
5. ../rk/CLAUDE.md (the rigour culture) and ../rk/skills/rk-light/SKILL.md

Your lane: TECHNICAL ARCHITECTURE. Produce a report (Markdown, under 600 lines, no emoji, concrete, SQLite-documentation tone) answering:

A. Single-source authoring. The project needs ONE source of truth that produces (1) a comprehensive print PDF with multi-track / zoom-level marking, (2) one HTML page per chapter with expandable detail, interactive three.js demos and games embedded, (3) exports for video scripts. Compare at least: XeLaTeX/LuaLaTeX with a pandoc web pipeline (the existing GR approach); Typst (installed; note TJO's own mathtime-otf project); MyST/Jupyter Book; Quarto; a custom Markdown+LaTeX-math pipeline (the author has an fmd Markdown-to-MathML tool); a TypeScript-first pipeline (MDX/Astro/Svelte) with LaTeX generated from it. For each: fidelity of print typography (Times + MathTime is the author's preference), bilingual German/English support, ability to tag content by track/zoom level and render it differently per target, maintainability by LLM agents, CI checkability (parity checks like scripts/check_parity.py), risk. Give a recommendation and a fallback.

B. Web stack for demos and games: three.js vs. WebGPU-native, TypeScript, bundling (Vite), state, math rendering (MathJax 3 vs KaTeX vs native MathML via Temml), offline-first single-file HTML artifacts vs. a site, testing demos with Playwright, numerical kernels in the browser (WebAssembly from Julia/Rust/C vs. hand-written TS) and how to guarantee the physics is exactly right (e.g. hydrogen orbital densities computed from the exact wavefunctions with a verified reference implementation, not approximated).

C. Video pipeline: options for 3D renders and explanatory videos (Manim, Blender with Python scripting, three.js offscreen rendering with headless Chromium plus ffmpeg, Remotion, Motion Canvas). Which fit a correctness-first workflow where the same verified numerical data drives figure, demo and video? Note what is installed (ffmpeg yes; Manim, Blender no).

D. Numerical ground truth: a layered design where Julia (installed, used in ../generalrelativity) computes reference data with tests, and TikZ/pgfplots, the browser, and the video renderer all consume the same data or the same verified formulas. Propose the data formats, the directory layout, and the checks (hash manifests, golden values, cross-implementation comparison TS vs Julia).

E. CI and gates: extend the existing ci.sh culture (structure, parity, enrichment, figures, build) to the new artifacts: every demo has a correctness test, every figure a formula-provenance header, every page a one-picture-per-page check, broken-link and MathJax-render checks, bilingual parity for web.

F. Effort and sequencing: a phased plan (phase 0 infrastructure, then content) with rough sizes, what to build first to de-risk, and what to throw away from the existing repo versus keep.

End with "## Recommendations" (ranked, trade-offs stated) and "## Open questions for TJO". Cite tools by URL; mark anything unverified as [UNVERIFIED]. Do not modify any files.
