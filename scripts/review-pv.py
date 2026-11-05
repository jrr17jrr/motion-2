"""Review a Plano Visionario render.

usage: python scripts/review-pv.py <render.mp4> [frame,frame,...]

1. Contact sheet of chosen frames (with face/safe-zone guides) -> <render>-sheet.jpg
2. Black / frozen frame scan over the whole render.
3. Cut preservation: frame-difference curve of render vs. working copy.
4. Audio: correlation with the original voice and peak / RMS levels.
"""
import json, subprocess, sys, wave
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

R = Path(__file__).resolve().parents[1]
FF = R / 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'
SRC = R / 'video/plano-visionario-work/source-sdr.mp4'
render = Path(sys.argv[1]).resolve()
work = R / '.cache/pv/review' / render.stem
work.mkdir(parents=True, exist_ok=True)
frames_wanted = [int(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 else []


def dump(video, folder, scale):
    folder.mkdir(exist_ok=True)
    for p in folder.glob('*.jpg'):
        p.unlink()
    subprocess.run([str(FF), '-v', 'error', '-i', str(video), '-vf', f'scale={scale}', '-q:v', '3',
                    str(folder / '%05d.jpg')], check=True)
    return sorted(folder.glob('*.jpg'))


report = {}
small = dump(render, work / 'small', '90:160')
arr = np.stack([np.asarray(Image.open(p).convert('L'), dtype=np.float32) for p in small])
report['frames'] = len(arr)
mean = arr.mean(axis=(1, 2))
report['blackFrames'] = [int(i) for i in np.where(mean < 12)[0]]
diff = np.r_[0, np.abs(np.diff(arr, axis=0)).mean(axis=(1, 2))]
report['frozenRuns>=6'] = []
run = 0
for i, d in enumerate(diff):
    run = run + 1 if d < 0.15 else 0
    if run == 6:
        report['frozenRuns>=6'].append(i - 5)

src_small = sorted((R / '.cache/pv/tiny').glob('*.png'))
if src_small:
    s = np.stack([np.asarray(Image.open(p).convert('L'), dtype=np.float32) for p in src_small])
    sd = np.r_[0, np.abs(np.diff(s, axis=0)).mean(axis=(1, 2))]
    n = min(len(sd), len(diff))
    cuts = [i for i in range(n) if sd[i] > 20]
    report['sourceCuts'] = cuts
    report['renderDiffAtSourceCuts'] = {i: round(float(diff[i]), 1) for i in cuts}
    report['cutsPreserved'] = all(diff[i] > 10 for i in cuts)

# audio
wav = work / 'audio.wav'
subprocess.run([str(FF), '-v', 'error', '-y', '-i', str(render), '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', str(wav)], check=True)
with wave.open(str(wav)) as w:
    a = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32) / 32768
with wave.open(str(R / '.cache/pv/audio16k.wav')) as w:
    o = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float32) / 32768
n = min(len(a), len(o))
best = max(range(-800, 801, 16), key=lambda k: float(np.dot(a[max(0, k):n + min(0, k)], o[max(0, -k):n - max(0, k)])))
report['audio'] = {
    'durationRender': round(len(a) / 16000, 3),
    'durationSource': round(len(o) / 16000, 3),
    'bestLagMs': best / 16,
    'corrWithOriginal': round(float(np.corrcoef(a[:n], o[:n])[0, 1]), 4),
    'peakDbfs': round(float(20 * np.log10(np.max(np.abs(a)) + 1e-9)), 2),
    'peakOriginalDbfs': round(float(20 * np.log10(np.max(np.abs(o)) + 1e-9)), 2),
    'rmsDbfs': round(float(20 * np.log10(np.sqrt(np.mean(a ** 2)) + 1e-9)), 2),
    'rmsOriginalDbfs': round(float(20 * np.log10(np.sqrt(np.mean(o ** 2)) + 1e-9)), 2),
}
# residual = what was added (SFX); its level vs voice, per 100 ms window
res = a[:n] - o[:n]
win = 1600
rv = [20 * np.log10(np.sqrt(np.mean(o[i:i + win] ** 2)) + 1e-9) for i in range(0, n - win, win)]
rr = [20 * np.log10(np.sqrt(np.mean(res[i:i + win] ** 2)) + 1e-9) for i in range(0, n - win, win)]
loud = [(i / 10, round(float(r - v), 1)) for i, (v, r) in enumerate(zip(rv, rr)) if r - v > -12]
report['audio']['sfxWindowsAboveMinus12dBvsVoice'] = loud

if frames_wanted:
    big = dump(render, work / 'big', '360:640')
    cols = min(6, len(frames_wanted)); rows = (len(frames_wanted) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * 360, rows * 640), 'black'); d = ImageDraw.Draw(sheet)
    for k, fr in enumerate(frames_wanted):
        if fr >= len(big):
            continue
        x, y = (k % cols) * 360, (k // cols) * 640
        sheet.paste(Image.open(big[fr]), (x, y))
        for gy, col in [(780, (255, 200, 0)), (1248, (255, 0, 255)), (1536, (255, 0, 0))]:
            d.line([x, y + gy / 3, x + 360, y + gy / 3], fill=col)
        d.rectangle([x, y, x + 120, y + 18], fill='black')
        d.text((x + 4, y + 3), f'f{fr} {fr / 30:.2f}s', fill='yellow')
    out = render.with_name(render.stem + '-sheet.jpg')
    sheet.save(out, quality=88)
    report['sheet'] = str(out)

print(json.dumps(report, indent=1, ensure_ascii=False))
json.dump(report, open(work / 'report.json', 'w'), indent=1)
