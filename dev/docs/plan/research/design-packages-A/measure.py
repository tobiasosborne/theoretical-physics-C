"""Median characters per full body line of a specimen PDF (pdftotext, raw mode, no margin text).
Usage: python3 -I measure.py file.pdf  -- prints median/max over lines of >= 50 chars that end
without a hyphen-less short tail; margin notes are excluded by cropping to the text block (-x -W)."""
import subprocess, sys, statistics
pdf, x, w = sys.argv[1], sys.argv[2], sys.argv[3]
# crop in points at 72 dpi: -x left edge, -W width of the text block
txt = subprocess.run(['pdftotext', '-r', '72', '-x', x, '-y', '0', '-W', w, '-H', '842', pdf, '-'],
                     capture_output=True, text=True).stdout
lines = [l.rstrip() for l in txt.splitlines() if len(l.strip()) >= 55]
n = [len(l) for l in lines]
print(f'{pdf}: {len(n)} full lines, median {statistics.median(n)} chars, max {max(n)}')
