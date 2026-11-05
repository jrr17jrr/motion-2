"""Plano Visionario: audio envelope (pauses) + visual cut detection + contact sheet.

Reads only derived files in .cache/pv and the SDR working copy. Never touches the original.
"""
import json, struct, subprocess, sys, wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache' / 'pv'
FFMPEG = ROOT / 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'
SRC = ROOT / 'video/plano-visionario-work/source-sdr.mp4'

def envelope():
    with wave.open(str(CACHE / 'audio16k.wav')) as w:
        n = w.getnframes(); data = struct.unpack(f'<{n}h', w.readframes(n))
    hop = 160  # 10 ms
    rms = []
    for i in range(0, n - hop, hop):
        seg = data[i:i + hop]
        rms.append((sum(s * s for s in seg) / hop) ** .5)
    peak = max(rms)
    db = [20 * __import__('math').log10(max(r, 1) / peak) for r in rms]
    # pauses: runs below -38 dB longer than 60 ms
    pauses, start = [], None
    for i, d in enumerate(db):
        if d < -30:
            start = i if start is None else start
        else:
            if start is not None and i - start >= 6:
                pauses.append((start * 10, i * 10))
            start = None
    json.dump({'db10ms': [round(d, 1) for d in db], 'pauses': pauses}, open(CACHE / 'envelope.json', 'w'))
    for a, b in pauses:
        print(f'pause {a:6d}-{b:6d} ms  (frames {a*30/1000:6.1f}-{b*30/1000:6.1f})')

def cuts():
    # mean absolute luma difference between consecutive frames at 90x160
    # Remotion's bundled FFmpeg has no rawvideo muxer: dump tiny PNGs instead.
    from PIL import Image
    tmp = CACHE / 'tiny'; tmp.mkdir(exist_ok=True)
    if not any(tmp.iterdir()):
        subprocess.run([str(FFMPEG), '-v', 'error', '-i', str(SRC), '-vf', 'scale=90:160,format=gray',
                        str(tmp / '%05d.png')], check=True)
    sz = 90 * 160
    frames = [Image.open(p).convert('L').tobytes() for p in sorted(tmp.glob('*.png'))]
    diffs = [0.0] + [sum(abs(a - b) for a, b in zip(frames[i], frames[i - 1])) / sz for i in range(1, len(frames))]
    json.dump(diffs, open(CACHE / 'framediff.json', 'w'))
    print('frames', len(frames))
    for i, d in enumerate(diffs):
        if d > 12:
            print(f'cut? frame {i:4d} ({i/30:6.2f}s) diff {d:5.1f}')

if __name__ == '__main__':
    what = sys.argv[1:] or ['env', 'cuts']
    if 'env' in what: envelope()
    if 'cuts' in what: cuts()
