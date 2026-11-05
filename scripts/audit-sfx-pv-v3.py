"""Compare effect audibility V2 vs V3 per event (loudest 50 ms of the effect vs. voice RMS
in a ±0.5 s context), full band and phone band (>700 Hz).

V2: .cache/pv/renders/PlanoVisionarioV2SfxStem.wav, voice = PlanoVisionarioV2.wav - stem
V3: .cache/pv/renders/sfx-stem-v3.wav, voice = voice-48k-aligned.wav (written by mix-pv-v3.py)
Optional argv[1]: decoded V3 MP4 wav -> also measures effect presence in the final file
(residual = decoded MP4 - voice).
"""
import json, sys, wave
from pathlib import Path
import numpy as np

R = Path(__file__).resolve().parents[1]
D = R / '.cache/pv/renders'
SR = 48000


def load(p):
    with wave.open(str(p)) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float64) / 32768
        return a.reshape(-1, w.getnchannels()).mean(axis=1)


v2m, v2s = load(D / 'PlanoVisionarioV2.wav'), load(D / 'PlanoVisionarioV2SfxStem.wav')
v3s, v3v = load(D / 'sfx-stem-v3.wav'), load(D / 'voice-48k-aligned.wav')
n = min(map(len, (v2m, v2s, v3s, v3v)))
v2v = v2m[:n] - v2s[:n]
mp4 = load(Path(sys.argv[1])) if len(sys.argv) > 1 else None


def hp(x, fc=700):
    X = np.fft.rfft(x); X[np.fft.rfftfreq(len(x), 1 / SR) < fc] = 0
    return np.fft.irfft(X, len(x))


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


def peak50(x, win=2400):
    c = np.convolve(x ** 2, np.ones(win) / win, mode='valid') if len(x) >= win else [np.mean(x ** 2)]
    return 10 * np.log10(np.max(c) + 1e-12)


rep = json.load(open(R / 'video/assets/pv/v3/mix-report-v3.json', encoding='utf-8'))
v2_frames = {'hook-hit': 46, 'title-swoosh': 132, 'title-pop': 150, 'price-blip': 301, 'price-click': 386,
             'price-pop': 513, 'count-roll': 605, 'count-land': 630, 'strike-slash': 647, 'exit-swoosh': 673,
             'offer-rise': 716, 'offer-impact': 718, 'cash': 736, 'bonus-sparkle': 811, 'bonus-swoosh': 852,
             'bonus-pop': 919, 'cta-rise': 1076, 'cta-hit': 1088}
rows = []
print(f"{'evento':14s} {'fr':>4} {'V2 cel':>7} {'V3 cel':>7} {'ganho':>6} {'V3 full':>8}" + (f"  {'MP4':>6}" if mp4 is not None else ''))
for e in rep['events']:
    name = e['sfx']; fr = e['peakFrame'] if isinstance(e['peakFrame'], int) else 605
    a = int(max(0, fr - 2) / 30 * SR); b = a + int(0.30 * SR); ca, cb = max(0, a - SR // 2), b + SR // 2
    v3 = peak50(hp(v3s[a:b])) - rms_db(hp(v3v[ca:cb]))
    v3f = peak50(v3s[a:b]) - rms_db(v3v[ca:cb])
    row = {'event': name, 'frame': fr, 'why': e['why'], 'v3_phone_dB': round(v3, 1), 'v3_full_dB': round(v3f, 1)}
    if name in v2_frames and abs(v2_frames[name] - fr) < 12 or (name == 'cash'):
        f2 = v2_frames.get(name, fr)
        a2 = int(max(0, f2 - 2) / 30 * SR); b2 = a2 + int(0.30 * SR)
        v2 = peak50(hp(v2s[a2:b2])) - rms_db(hp(v2v[max(0, a2 - SR // 2):b2 + SR // 2]))
        row['v2_phone_dB'] = round(v2, 1); row['gain_vs_v2_dB'] = round(v3 - v2, 1)
    if mp4 is not None:
        m = min(len(mp4), n); res = mp4[:m] - v3v[:m]
        row['mp4_phone_dB'] = round(peak50(hp(res[a:b])) - rms_db(hp(v3v[ca:cb])), 1)
    rows.append(row)
    print(f"{name:14s} {fr:4d} {row.get('v2_phone_dB', float('nan')):7.1f} {v3:7.1f} {row.get('gain_vs_v2_dB', float('nan')):6.1f} {v3f:8.1f}"
          + (f"  {row['mp4_phone_dB']:6.1f}" if mp4 is not None else ''))
gains = [r['gain_vs_v2_dB'] for r in rows if 'gain_vs_v2_dB' in r]
summary = {'meanGainVsV2_dB': round(float(np.mean(gains)), 1), 'minGainVsV2_dB': round(float(np.min(gains)), 1),
           'sfxEnergyShare_v2_%': round(100 * np.sum(v2s[:n] ** 2) / np.sum(v2m[:n] ** 2), 2),
           'sfxEnergyShare_v3_%': round(100 * np.sum(v3s[:n] ** 2) / np.sum((v3s[:n] + v3v[:n]) ** 2), 2)}
print(json.dumps(summary))
json.dump({'rows': rows, 'summary': summary}, open(D / 'sfx-audit-v3.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
