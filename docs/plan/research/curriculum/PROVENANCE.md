<!-- ROLE: hashes and locations of every local source the curriculum lane read (2026-10-09).
     Paths abbreviated: ~ = /home/tobias; SCR = /tmp/claude-1000/-home-tobias-Projects-theoretical-physics-C/235a3d3d-d7d4-4e21-a935-01a7e791a128/scratchpad -->

# Provenance (curriculum lane)

| source | path | sha256 | licence note |
|---|---|---|---|
| Plavala arXiv:2103.07469v2 source tarball | `~/Downloads/arXiv-2103.07469v2.tar.gz` | 67548d09b2acc74f680a77a099d23ceb5a10e7980d883b0f57843e1e2ca8ec64 | arXiv non-exclusive distribution licence 1.0; unpacked copy in `plavala-src/` must not be committed to a public repo |
| Plavala `basic_v3.tex` | `plavala-src/basic_v3.tex` | ab317d371c85b9f8b3b823300f6746b3947d0e1674e546332a6dd200d72905ec | as above |
| Plavala `what_v4.tex` (axioms S1-S5) | `plavala-src/what_v4.tex` | a0ed7741d8087e4c79e29e268be88815c91adcfe7bb17fdd6baea7bb2032d151 | as above |
| Plavala `channels_v3.tex` | `plavala-src/channels_v3.tex` | 132155e8a544faeb0dad92f422f14f3e54a748d6a4ba22b3f55b510d4399c3b0 | as above |
| Plavala `QT_v3.tex` | `plavala-src/QT_v3.tex` | 41033a5a93a34d1e30021ac15c9675d1aadf2de61c16b724ee405b27c53d6ab1 | as above |
| Plavala `tensor_v3.tex` | `plavala-src/tensor_v3.tex` | 4d576b54d9173847ada1fb78873a0764d041871e885869cf850d651edb3d111b | as above |
| Plavala `CT_v3.tex` | `plavala-src/CT_v3.tex` | d3ce102f7848dd31ff9236730896b0ffa0039a8ecf5ff2b1f9996c46aba6a33f | as above |
| Astwood notes | `SCR/gh/advancedquantum/Source Files/advancedquantum.tex` | 0e88fd13da42e60c6def5b9cac28999090602879cb207c830c58903f616a74ce | repo has no LICENSE file |
| Teschl GSM 157, 2nd ed. PDF (downloaded 2026-10-09 from mat.univie.ac.at) | `SCR/teschl/schroe2.pdf` | ee2cfd1c9fdc41ef5a585ef8e9657dc632f92b557aeb9c052afe5164a02a2917 | personal online use only; not copied into the repo |
| Hammerer Theo C student notes (scan) | `archive/third-party/Script_TheoC_VorlesungProfHammerer_Feb2020.pdf` | c107fa1b784103d47d878c1630852fa85f273f24f6f200d33cee2be59c7cd61d | third party |
| Wilming many-body lecture notes | `~/Downloads/many-body-notes-current-upload.4.pdf` | 4dfef908cba021c5d8be86365f5df086723babb339547b8b576e3d311791a27b | "do not distribute" |
| Earlier Theo C script PDF | `~/Downloads/TheoretischePhysikC.pdf` | 0f60c2f5c51a9b63a4da2245aeb898954c5b5457c2c018ecd902ddabc46c4d81 | TJO's own |
| This repo | commit 8bfab6557978385dd7439e10086ffe509840bcd1 | (git) | AGPL-3.0-or-later |

## Verified claims (how)

- Teschl: Thm 5.3 (Stone, `U(t)=exp(-itA)`), Thm 6.4 (Kato-Rellich), Thm 8.2 (uncertainty for
  `ψ ∈ D(AB)∩D(BA)`), (7.3) Fourier `(2π)^{-n/2}∫e^{-ipx}f`, §10.2 (`H = -Δ - γ/|x|`, `D = H^2(R^3)`),
  Thm 10.9 (boundary condition `lim_{r→0}(f - r f') = 0` iff `l = 0`; limit point at 0 iff `l > 0`),
  Thm 10.11 (factorisation): read in `pdftotext -layout` output of `schroe2.pdf`.
- vl16.tex line 85 (`L_2^s`) and line 94 (`ψ_{21±1}`): checked with a pure-Python script
  (`checks/vl16_hydrogen_check.py`, run with `python3 -I`): exact `L_2^{1.3}(0.7) = 1.73`, script formula gives `1.24`; corrected formula `1.73`.
  Norm squared of the script's `ψ_{21±1}` = 0.5; with prefactor `1/(8√π)` it is 1.0.
- vl22.tex line 25: stationarity of `-k tr ρ ln ρ + β tr ρH` gives `-k(ln ρ + 1) + βH = 0`, i.e.
  `ρ ∝ e^{+βH/k}`; the script's next equation `ln ρ + βH + ln Z = 0` needs the multiplier `-kβ`.
- Bibliographic facts in REPORT.md section 3 without [UNVERIFIED] were checked by web search on
  2026-10-09 (arXiv abstract pages, AMS, NIST, publisher listings).
- Plavala: "Archimedean" occurs 0 times in the unpacked source (`grep -i archimed`); axiom S5
  (finite dimension) is in `what_v4.tex`.
