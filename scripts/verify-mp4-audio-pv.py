"""Verify the audio actually exported in the Plano Visionario MP4s.

usage: python scripts/verify-mp4-audio-pv.py   (expects decoded wavs in .cache/pv)
  - BS.1770-4 integrated loudness (K-weighting + gating) and 4x true peak, V1/V2/V3
  - V3 MP4 vs master-v3.wav: alignment + correlation (is the master really in the file?)
  - cash register: cross-correlation of the CC0 sample against the V3 MP4 residual
    (MP4 - narration) to find where it plays, and the bell partials around 24.17 s
    in V2 vs V3.
"""
import json, wave
from pathlib import Path
import numpy as np

R = Path(__file__).resolve().parents[1]
C = R / '.cache/pv'
SR = 48000


def load(p):
    with wave.open(str(p)) as w:
        assert w.getframerate() == SR, p
        a = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float64) / 32768
        return a.reshape(-1, w.getnchannels())


def biquad(x, b, a):
    y = np.zeros_like(x); x1 = x2 = y1 = y2 = 0.0
    b0, b1, b2 = b; _, a1, a2 = a
    for i, v in enumerate(x):
        o = b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1, y2, y1 = x1, v, y1, o; y[i] = o
    return y


def lufs(st):
    # BS.1770-4 K-weighting coefficients at 48 kHz
    pre = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585])
    rlb = ([1.0, -2.0, 1.0], [1, -1.99004745483398, 0.99007225036621])
    z = [biquad(biquad(st[:, c], *pre), *rlb) for c in range(st.shape[1])]
    blk, hop = int(.4 * SR), int(.1 * SR)
    ms = np.array([sum(np.mean(zc[i:i + blk] ** 2) for zc in z) for i in range(0, len(z[0]) - blk, hop)])
    L = -0.691 + 10 * np.log10(ms + 1e-12)
    g = ms[L > -70]; rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g2 = ms[(L > -70) & (L > rel)]
    return -0.691 + 10 * np.log10(g2.mean())


def true_peak(st):
    out = -200.0
    for c in range(st.shape[1]):
        ch = st[:, c]
        for i in range(0, len(ch), SR):
            seg = ch[i:i + SR + 64]
            up = np.fft.irfft(np.fft.rfft(seg), len(seg) * 4) * 4
            out = max(out, 20 * np.log10(np.max(np.abs(up)) + 1e-12))
    return out


rep = {}
dec = {'v1': C / 'v1-decoded.wav', 'v2': C / 'v2-decoded.wav', 'v3': C / 'v3-decoded.wav'}
A = {k: load(p) for k, p in dec.items()}
for k, a in A.items():
    rep[k] = {'LUFS_integrated': round(lufs(a), 2), 'truePeak_dBTP': round(true_peak(a), 2),
              'samplePeak_dBFS': round(20 * np.log10(np.max(np.abs(a))), 2), 'clipped': int(np.sum(np.abs(a) >= 0.999)),
              'duration_s': round(len(a) / SR, 3)}

master = load(R / 'video/assets/pv/v3/master-v3.wav').mean(axis=1)
v3 = A['v3'].mean(axis=1); n = min(len(master), len(v3))
lags = range(-960, 961, 8)
best = max(lags, key=lambda k: float(np.dot(v3[max(0, k):n + min(0, k)], master[max(0, -k):n - max(0, k)])))
rep['v3_vs_master'] = {'lag_samples': best, 'corr': round(float(np.corrcoef(v3[:n], master[:n])[0, 1]), 5)}

# cash register: where does it play in the exported V3?
voice = load(C / 'renders/voice-48k-aligned.wav').mean(axis=1)
res = v3[:n] - voice[:n]
cash = load(R / 'video/assets/pv/v3/cash-register-cc0.wav').mean(axis=1)
bell = cash[int(0.37 * SR):int(0.90 * SR)]  # bell strike + first half second of ring
w0, w1 = int(22.5 * SR), int(26.5 * SR)
seg = res[w0:w1]
cc = np.correlate(seg, bell, mode='valid')
norm = np.sqrt(np.convolve(seg ** 2, np.ones(len(bell)), mode='valid')) * np.linalg.norm(bell) + 1e-12
ncc = cc / norm
k = int(np.argmax(ncc))
rep['cash_register_in_v3_mp4'] = {'bellFoundAt_s': round((w0 + k) / SR, 3), 'bellFoundAt_frame': round((w0 + k) / SR * 30, 2),
                                  'expectedBellFrame': 725, 'normalisedCrossCorrelation': round(float(ncc[k]), 3)}


def band_energy(x, t0, t1, freqs):
    s = x[int(t0 * SR):int(t1 * SR)]
    F = np.abs(np.fft.rfft(s * np.hanning(len(s)))); f = np.fft.rfftfreq(len(s), 1 / SR)
    return {int(fq): round(float(20 * np.log10(F[(f > fq - 40) & (f < fq + 40)].max() + 1e-9)), 1) for fq in freqs}


partials = [1524, 4463, 5502, 7144, 7970]
rep['bell_partials_24.17-24.60s_dB'] = {'v2': band_energy(A['v2'].mean(axis=1), 24.17, 24.6, partials),
                                        'v3': band_energy(v3, 24.17, 24.6, partials)}
print(json.dumps(rep, indent=1))
json.dump(rep, open(C / 'renders/verify-mp4-audio.json', 'w'), indent=1)
