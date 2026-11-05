"""Measure SFX audibility vs. voice for Plano Visionario V1/V2 (audio-only bounces).

Inputs (render with `remotion render ... --codec=wav`):
  .cache/pv/renders/PlanoVisionarioV2.wav          full V2 mix
  .cache/pv/renders/PlanoVisionarioV2SfxStem.wav   V2 effects only
  .cache/pv/renders/PlanoVisionarioV1SfxStem.wav   V1 effects only
voice = V2 mix - V2 stem (same render, linear sum).

Per event window (300 ms from the event peak frame - 2): effect level and voice level,
both full band and "phone band" (> 700 Hz, what small speakers reproduce).
"""
import json, re, sys, wave
from pathlib import Path
import numpy as np

R = Path(__file__).resolve().parents[1]
D = R / '.cache/pv/renders'


def load(p):
    with wave.open(str(p)) as w:
        sr = w.getframerate(); ch = w.getnchannels()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float64) / 32768
    return a.reshape(-1, ch), sr


mix, sr = load(D / 'PlanoVisionarioV2.wav')
s2, _ = load(D / 'PlanoVisionarioV2SfxStem.wav')
s1, _ = load(D / 'PlanoVisionarioV1SfxStem.wav')
n = min(len(mix), len(s2), len(s1)); mix, s2, s1 = mix[:n], s2[:n], s1[:n]
voice = mix - s2


def hp(x, fc=700):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / sr); X[f < fc] = 0
    return np.fft.irfft(X, len(x))


def db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)


def peak_win(x, win=int(0.05 * 48000)):
    # loudest 50 ms RMS inside x
    if len(x) < win:
        return db(x)
    c = np.convolve(x ** 2, np.ones(win) / win, mode='valid')
    return 10 * np.log10(np.max(c) + 1e-12)


# Audible-peak frame of each V2 event (= animation frame it is synced to, see src/pv/sfx-v2.ts)
events = [
    ('hook-hit', 46), ('title-swoosh', 132), ('title-pop', 150), ('price-blip', 301), ('price-click', 386),
    ('price-pop', 513), ('count-roll', 605), ('count-land', 630), ('strike-slash', 647), ('exit-swoosh', 673),
    ('offer-rise', 716), ('offer-impact', 718), ('cash-register', 736), ('bonus-sparkle', 811),
    ('bonus-swoosh', 852), ('bonus-pop', 919), ('cta-rise', 1076), ('cta-hit', 1088),
]
rows = []
for name, frm in events:
    a = int(max(0, frm - 2) / 30 * sr); b = a + int(0.30 * sr)
    e2 = s2[a:b].mean(axis=1); e1 = s1[a:b].mean(axis=1); v = voice[a:b].mean(axis=1)
    ve = voice[max(0, a - sr // 2): b + sr // 2].mean(axis=1)  # voice context ±0.5 s
    rows.append({
        'event': name, 'frame': frm,
        'v1_sfx_dB': round(peak_win(e1), 1), 'v2_sfx_dB': round(peak_win(e2), 1),
        'voice_ctx_dB': round(db(ve), 1),
        'v2_vs_voice_dB': round(peak_win(e2) - db(ve), 1),
        'v2_vs_voice_phone_dB': round(peak_win(hp(e2)) - db(hp(ve)), 1),
        'v1_vs_voice_phone_dB': round(peak_win(hp(e1)) - db(hp(ve)), 1),
    })

# oversampled (4x) true-peak estimate of the full mix
def true_peak(x):
    m = x.mean(axis=1) if x.ndim > 1 else x
    out = -200
    for ch in (x.T if x.ndim > 1 else [x]):
        for i in range(0, len(ch), sr * 2):
            seg = ch[i:i + sr * 2]
            if len(seg) < 16:
                continue
            X = np.fft.rfft(seg); up = np.fft.irfft(X, len(seg) * 4) * 4
            out = max(out, 20 * np.log10(np.max(np.abs(up)) + 1e-12))
    return out

report = {
    'events': rows,
    'mix': {
        'samplePeak_dBFS': round(20 * np.log10(np.max(np.abs(mix))), 2),
        'truePeak_dBTP_est': round(true_peak(mix), 2),
        'clippedSamples': int(np.sum(np.abs(mix) >= 0.999)),
        'rms_dBFS': round(db(mix.mean(axis=1)), 2),
        'voiceOnly_rms_dBFS': round(db(voice.mean(axis=1)), 2),
        'sfxV2_share_of_energy_%': round(100 * np.sum(s2 ** 2) / np.sum(mix ** 2), 2),
        'sfxV1_share_of_energy_%': round(100 * np.sum(s1 ** 2) / np.sum((voice + s1) ** 2), 2),
    },
}
print(f"{'event':16s} {'frame':>5} {'V1 fx':>7} {'V2 fx':>7} {'voice':>7} {'V2-voz':>7} {'V2-voz cel':>10} {'V1-voz cel':>10}")
for r in rows:
    print(f"{r['event']:16s} {r['frame']:5d} {r['v1_sfx_dB']:7.1f} {r['v2_sfx_dB']:7.1f} {r['voice_ctx_dB']:7.1f} {r['v2_vs_voice_dB']:7.1f} {r['v2_vs_voice_phone_dB']:10.1f} {r['v1_vs_voice_phone_dB']:10.1f}")
print(json.dumps(report['mix'], indent=1))
json.dump(report, open(D / 'sfx-audit-v2.json', 'w'), indent=1)
