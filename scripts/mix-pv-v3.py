"""Plano Visionario V3 — reinforced sound design, mixed offline.

Why offline: Remotion sums <Audio> layers with no limiter, so louder effects would
risk clipping. Here every effect is peak-normalised, placed sample-accurately on its
animation frame, gain-staged per event, lightly ducked under strong syllables and
the master goes through a look-ahead peak limiter (only engages on SFX peaks).

Sources
  voice  : original narration, PCM from the untouched .mov (.cache/pv/audio-full.wav)
           -> there is NO music bed in the original (gaps are -41..-51 dBFS room tone),
              so nothing to duck there.
  synth  : video/assets/pv/sfx-v2/*.wav (procedural kit from V2, re-gained)
  real   : video/assets/pv/v3/cash-register-cc0.wav  (Freesound #209578 by Zott820, CC0)
           video/assets/pv/v3/coins-cc0.wav          (Freesound #154410 by lucaslara, CC0)
Outputs: video/assets/pv/v3/master-v3.wav (+ sfx-stem-v3.wav for QA) and mix-report-v3.json
"""
import json, subprocess, wave
from pathlib import Path
import numpy as np

R = Path(__file__).resolve().parents[1]
FF = R / 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'
KIT = R / 'video/assets/pv/sfx-v2'
V3 = R / 'video/assets/pv/v3'
V3.mkdir(parents=True, exist_ok=True)
SR = 48000
FPS = 30
DUR_FRAMES = 1123
N = int(DUR_FRAMES / FPS * SR)


def read(p):
    with wave.open(str(p)) as w:
        assert w.getframerate() == SR, p
        ch = w.getnchannels()
        a = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(np.float64) / 32768
    a = a.reshape(-1, ch)
    return np.repeat(a, 2, axis=1) if ch == 1 else a


def write(p, a):
    with wave.open(str(p), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(a, -1, 1) * 32767).round().astype('<i2').tobytes())


def to48k(src, dst, extra=()):
    subprocess.run([str(FF), '-v', 'error', '-y', '-i', str(src), *extra, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', str(dst)], check=True)


def norm(a, peak_db=-1.0):
    return a / (np.max(np.abs(a)) + 1e-12) * 10 ** (peak_db / 20)


def fade(a, fin=0.0, fout=0.0):
    a = a.copy()
    if fin:
        n = int(fin * SR); a[:n] *= np.linspace(0, 1, n)[:, None]
    if fout:
        n = int(fout * SR); a[-n:] *= np.linspace(1, 0, n)[:, None] ** 2
    return a


# ------------------------------------------------------------------ sources
cache = R / '.cache/pv'
voice_wav = cache / 'voice-48k.wav'
if not voice_wav.exists():
    to48k(cache / 'audio-full.wav', voice_wav)
voice = read(voice_wav)[:N]
voice = np.pad(voice, ((0, max(0, N - len(voice))), (0, 0)))

# Real cash register (CC0). Anatomy measured on its spectrogram:
#   0.05–0.35 s mechanical drawer/key noise ("CHA"), 0.37 s bell strike ("CHING",
#   inharmonic partials 1.5/4.4/5.5/7.1/8/10 kHz), 0.62 s second metallic tick, tail to ~2 s.
# Trimmed to start at 0.22 s: a short "cha" (~0.15 s, the tail of the drawer burst) right before the bell.
cash_src = cache / 'downloads/freesound-209578/209578_2558531-hq.ogg'
coins_src = cache / 'downloads/freesound-154410/154410_2592491-hq.ogg'
# The 48 kHz copies are committed; re-derive them only if the downloaded previews exist.
for src, dst in [(cash_src, 'cash-register-cc0.wav'), (coins_src, 'coins-cc0.wav')]:
    if src.exists() and not (V3 / dst).exists():
        to48k(src, V3 / dst)
cash_full = read(V3 / 'cash-register-cc0.wav')
CASH_TRIM = 0.22
cash = fade(cash_full[int(CASH_TRIM * SR):int(2.30 * SR)], 0.004, 0.45)
CASH_BELL = 0.37 - CASH_TRIM  # bell onset inside the trimmed clip (s)
# gentle high-pass (~150 Hz) – the drawer rumble is useless on phones and eats headroom
X = np.fft.rfft(cash, axis=0); f = np.fft.rfftfreq(len(cash), 1 / SR); X[f < 150] *= (f[f < 150] / 150)[:, None] ** 2
cash = norm(np.fft.irfft(X, len(cash), axis=0))
# The 'CHA' (drawer noise) sits over the first syllable of 'seiscentos': -12 dB there,
# ramping back to full level right at the bell ('CHING'), which lands in a speech gap.
cha_n = int(CASH_BELL * SR)
x = np.linspace(0, 1, cha_n)
cash[:cha_n] *= (10 ** (-12 * (1 - x ** 4) / 20))[:, None]  # holds -12 dB, recovers only in the last ~25 % before the bell
coins_full = read(V3 / 'coins-cc0.wav')
coins = norm(fade(coins_full[int(1.72 * SR):int(2.20 * SR)], 0.003, 0.15))

kit = {p.stem: norm(read(p)) for p in KIT.glob('*.wav')}
manifest = json.loads((KIT / 'manifest.json').read_text())


def peak_s(name):
    return manifest[name]['peakMs'] / 1000


# fast swipe for the strike: title-swoosh played 2.2x faster (higher, tighter)
sw = kit['title-swoosh']; idx = np.arange(0, len(sw) - 1, 2.2)
swipe = norm(np.stack([np.interp(idx, np.arange(len(sw)), sw[:, c]) for c in range(2)], axis=1))
swipe_peak = int(np.argmax(np.abs(swipe[:, 0]))) / SR
kit['strike-swipe'] = swipe; manifest['strike-swipe'] = {'peakMs': swipe_peak * 1000}
kit['cash'] = cash; manifest['cash'] = {'peakMs': CASH_BELL * 1000}   # schedule by the bell
kit['coins'] = coins; manifest['coins'] = {'peakMs': 0}

# ------------------------------------------------------------------ schedule
# (name, frame where its audible peak lands, gain dB on the -1 dBFS-normalised file, why)
# Frames are the animation frames of PlanoVisionario.tsx (see src/pv/sfx-v2.ts for derivations).
EVENTS = [
    ('hook-hit', 46, -4.0, 'MAIS CLIENTES entra'),
    ('title-swoosh', 132, -8.0, 'PLANO VISIONÁRIO entra'),
    ('title-pop', 150, -11.0, 'linha ciano sob o título'),
    ('bonus-swoosh', 242, -16.0, 'rótulo SITE PROFISSIONAL (wipe)'),
    ('price-blip', 301, -21.0, 'R$ 250'),
    ('bonus-swoosh', 359, -14.0, 'rótulo TRÁFEGO PAGO (wipe)'),
    ('price-click', 386, -7.0, 'R$ 500'),
    ('bonus-swoosh', 435, -16.0, 'rótulo GESTÃO DE INSTAGRAM (wipe)'),
    ('price-pop', 513, -8.5, 'R$ 400'),
    ('count-roll', None, -9.0, 'contagem 0 → 1.150 (frames 591–630)'),
    ('count-land', 630, -5.5, 'chega em R$ 1.150'),
    ('strike-slash', 647, -5.5, 'linha vermelha corta o 1.150'),
    ('strike-swipe', 647, -6.5, 'swipe rápido do corte'),
    ('exit-swoosh', 673, -15.0, '1.150 sai'),
    ('offer-rise', 717, -17.0, 'subida para o 697'),
    ('offer-impact', 718, -15.0, 'peso na entrada do 697'),
    ('cash', 725, -3.5, 'R$ 697 — CHA (subida) + CHING (pico do pop, respiro da fala)'),
    ('coins', 731, -10.0, 'R$ 697 — tilintar de moedas (respiro da fala)'),
    ('bonus-sparkle', 811, -13.5, 'PRIMEIRO MÊS'),
    ('bonus-swoosh', 852, -12.5, 'MOTION DESIGN'),
    ('bonus-pop', 919, -4.0, 'NOSSA MODELO'),
    ('price-pop', 954, -11.0, 'escolhe!'),
    ('cta-rise', 1076, -11.0, 'CHAME entra'),
    ('cta-hit', 1088, -6.0, 'WHATSAPP — destaque final'),
]

# per-frame voice level (dB re. its peak) for ducking
level = np.array(json.load(open(R / 'src/pv/voice-level.json')))
lv_s = np.convolve(level, np.ones(5) / 5, mode='same')
duck_curve = np.interp(np.arange(N) / SR * FPS, np.arange(len(lv_s)), lv_s)
# strong syllable (>= -8 dB) -> -3 dB on the effect ; <= -22 dB -> untouched
duck_gain = 10 ** (-3 * np.clip((duck_curve + 22) / 14, 0, 1) / 20)

sfx = np.zeros((N, 2)); report = []
for name, frame, gdb, why in EVENTS:
    clip = kit[name]
    start = 591 / FPS if name == 'count-roll' else frame / FPS - manifest[name]['peakMs'] / 1000
    i = int(round(start * SR)); j = min(N, i + len(clip))
    seg = clip[:j - i] * 10 ** (gdb / 20) * duck_gain[i:j, None]
    sfx[i:j] += seg
    report.append({'sfx': name, 'peakFrame': frame if frame is not None else 'start 591', 'gain_dB': gdb, 'why': why,
                   'startSec': round(start, 4)})

# ------------------------------------------------------------------ master + look-ahead limiter
mix = voice + sfx
CEIL = 10 ** (-1.5 / 20)
look = int(0.003 * SR); rel = np.exp(-1 / (0.08 * SR))
peak = np.max(np.abs(mix), axis=1)
# required gain per sample, made look-ahead by a running max over the window
need = np.minimum(1, CEIL / np.maximum(peak, 1e-9))
from numpy.lib.stride_tricks import sliding_window_view
padded = np.r_[need, np.ones(look)]
need_la = sliding_window_view(padded, look + 1).min(axis=1)[:N]
g = np.empty(N); cur = 1.0
for k in range(N):  # instant attack (already look-ahead), smooth release
    t = need_la[k]
    cur = t if t < cur else min(t, 1 - (1 - cur) * rel)
    g[k] = cur
master = mix * g[:, None]
gr_db = 20 * np.log10(g.min())
write(V3 / 'master-v3.wav', master)
write(cache / 'renders/sfx-stem-v3.wav', sfx * g[:, None])
write(cache / 'renders/voice-48k-aligned.wav', voice)

out = {
    'events': report,
    'limiter': {'ceiling_dBFS': -1.5, 'maxGainReduction_dB': round(gr_db, 2),
                'samplesLimited': int(np.sum(g < 0.999)), 'msLimited': round(np.sum(g < 0.999) / SR * 1000, 1)},
    'master': {'peak_dBFS': round(20 * np.log10(np.max(np.abs(master))), 2), 'clipped': int(np.sum(np.abs(master) >= 0.999))},
    'sources': {
        'cash-register-cc0.wav': 'Freesound #209578 "Cash Register Purchase" by Zott820 — CC0 1.0 (https://freesound.org/people/Zott820/sounds/209578/), HQ preview',
        'coins-cc0.wav': 'Freesound #154410 "Coins Dropping_1-2.aif" by lucaslara — CC0 1.0 (https://freesound.org/people/lucaslara/sounds/154410/), HQ preview',
    },
}
json.dump(out, open(V3 / 'mix-report-v3.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(json.dumps(out['limiter']), json.dumps(out['master']))
