#!/usr/bin/env python3
"""
fetch_transcripts.py — Download YouTube auto-captions for the Theoretische
Physik C lecture playlist and normalise them into a stable on-disk format.

The course videos are in German; YouTube's original-language ASR track is
``de-orig``.  For each video we write three files into ``transcripts/raw/``:

    vNN_<videoid>.json3   the raw YouTube caption payload, verbatim
    vNN_<videoid>.json    normalised {title, video_id, url, transcript:[...]}
    vNN_<videoid>.txt     human-readable "[mm:ss.cc] text" lines

The .txt form is what the transcript-cleaning agents read; the .json keeps
machine-usable timings so a claim in the script can be traced back to the
moment in the lecture it came from.

Usage:
    scripts/fetch_transcripts.py                 # fetch everything missing
    scripts/fetch_transcripts.py --force         # re-download everything
    scripts/fetch_transcripts.py --only 3 7 12   # fetch selected indices
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "transcripts" / "raw"
PLAYLIST = "https://www.youtube.com/playlist?list=PLDfPUNusx1Epw58nW3Acp7VI-PqXCkQXf"
SUB_LANG = "de-orig"

# Prefer a locally vendored yt-dlp (the distro package is too old for the
# current YouTube playlist API); fall back to whatever is on PATH.
VENDORED = ROOT / "_work" / "bin" / "yt-dlp"
YTDLP = str(VENDORED) if VENDORED.exists() else "yt-dlp"


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def playlist_entries():
    """Return [{index, id, title, duration}] in playlist order."""
    out = run([YTDLP, "--flat-playlist", "-J", PLAYLIST]).stdout
    data = json.loads(out)
    entries = data.get("entries") or []
    if not entries:
        sys.exit("error: playlist returned no entries — is yt-dlp current?")
    return [
        {
            "index": i,
            "id": e["id"],
            "title": e.get("title", ""),
            "duration": int(e.get("duration") or 0),
        }
        for i, e in enumerate(entries, start=1)
    ]


def fmt_ts(seconds):
    """Format seconds as mm:ss.cc, matching the GR notes' transcript style."""
    m, s = divmod(seconds, 60)
    return f"{int(m):02d}:{s:05.2f}"


def parse_json3(payload):
    """Flatten YouTube's json3 caption events into [{start,duration,text}]."""
    cues = []
    for ev in payload.get("events", []):
        segs = ev.get("segs")
        if not segs:
            continue
        text = "".join(seg.get("utf8", "") for seg in segs).strip()
        # json3 emits bare-newline events as spacing; drop them
        if not text:
            continue
        cues.append(
            {
                "start": round(ev.get("tStartMs", 0) / 1000, 2),
                "duration": round(ev.get("dDurationMs", 0) / 1000, 2),
                "text": text,
            }
        )
    return cues


def fetch(entry, force=False):
    idx, vid = entry["index"], entry["id"]
    stem = f"v{idx:02d}_{vid}"
    j3 = RAW / f"{stem}.json3"
    out_json = RAW / f"{stem}.json"
    out_txt = RAW / f"{stem}.txt"

    if out_txt.exists() and not force:
        return "skip", stem, len(out_txt.read_text(encoding="utf-8").splitlines())

    if not j3.exists() or force:
        run(
            [
                YTDLP, "--skip-download", "--write-auto-subs",
                "--sub-langs", SUB_LANG, "--sub-format", "json3",
                "--no-warnings", "-q",
                "-o", str(RAW / f"{stem}.%(ext)s"),
                f"https://www.youtube.com/watch?v={vid}",
            ]
        )
        # yt-dlp writes <stem>.<lang>.json3; normalise the name
        produced = RAW / f"{stem}.{SUB_LANG}.json3"
        if produced.exists():
            produced.replace(j3)

    if not j3.exists():
        return "FAIL", stem, 0

    cues = parse_json3(json.loads(j3.read_text(encoding="utf-8")))

    out_json.write_text(
        json.dumps(
            {
                "index": idx,
                "title": entry["title"],
                "video_id": vid,
                "url": f"https://www.youtube.com/watch?v={vid}",
                "duration_s": entry["duration"],
                "language": SUB_LANG,
                "transcript": cues,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    header = [
        f"# {entry['title']}",
        f"# YouTube: https://www.youtube.com/watch?v={vid}",
        f"# Auto-generated German transcript ({SUB_LANG}), "
        f"{entry['duration'] // 60} min",
        "",
    ]
    body = [f"[{fmt_ts(c['start'])}] {c['text']}" for c in cues]
    out_txt.write_text("\n".join(header + body) + "\n", encoding="utf-8")

    return "ok", stem, len(cues)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--force", action="store_true", help="re-download everything")
    ap.add_argument("--only", nargs="*", type=int, help="playlist indices to fetch")
    args = ap.parse_args()

    RAW.mkdir(parents=True, exist_ok=True)
    entries = playlist_entries()
    if args.only:
        entries = [e for e in entries if e["index"] in set(args.only)]

    print(f"{len(entries)} video(s) to process\n")
    manifest = []
    for e in entries:
        status, stem, n = fetch(e, force=args.force)
        print(f"  [{status:4}] {stem}  {n:5d} cues  {e['title']}")
        manifest.append({**e, "stem": stem, "cues": n, "status": status})

    (RAW / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    failed = [m for m in manifest if m["status"] == "FAIL"]
    print(f"\nwrote {RAW/'manifest.json'}")
    if failed:
        sys.exit(f"error: {len(failed)} video(s) failed: "
                 + ", ".join(m["stem"] for m in failed))


if __name__ == "__main__":
    main()
