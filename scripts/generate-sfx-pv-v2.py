"""Plano Visionario V2 — richer procedural SFX kit (no third-party samples).

Designed for phone speakers: every sound carries energy in the 1–5 kHz band, where
small speakers reproduce well; sub-bass only adds weight on headphones.
Output: video/assets/pv/sfx-v2/*.wav (48 kHz stereo). Prints duration + peak offset,
which src/pv/sfx-v2.ts uses to land each audible peak on its animation frame.
"""
from pathlib import Path
import json, wave
import numpy as np

R = Path(__file__).resolve().parents[1]
OUT = R / 'video/assets/pv/sfx-v2'
OUT.mkdir(parents=True, exist_ok=True)
SR = 48000
rng = np.random.default_rng(2026)
meta = {}


def t(sec):
    return np.arange(int(sec * SR)) / SR


def env(u, attack, decay):
    return (1 - np.exp(-u / attack)) * np.exp(-u / decay)


def svf(x, f, q=0.6, mode='band'):
    """State-variable filter with per-sample (or constant) cutoff."""
    f = np.broadcast_to(np.asarray(f, dtype=float), x.shape)
    low = band = 0.0; y = np.empty_like(x)
    for i in range(len(x)):
        g = 2 * np.sin(np.pi * min(f[i], SR / 6) / SR)
        high = x[i] - low - q * band
        band += g * high; low += g * band
        y[i] = band if mode == 'band' else (low if mode == 'low' else high)
    return y


def noise(n):
    return rng.normal(0, 1, n)


def place(dst, src, at):
    i = int(at * SR); n = min(len(src), len(dst) - i)
    if n > 0:
        dst[i:i + n] += src[:n]


def save(name, mono, width=0.0, peak=0.5):
    """width: small decorrelation between L/R for a less 'mono-pin' feel."""
    mono = mono / (np.max(np.abs(mono)) + 1e-12) * peak
    n = len(mono); fade = min(n, int(0.006 * SR))
    mono[-fade:] *= np.linspace(1, 0, fade)
    d = int(0.00035 * SR)
    side = np.r_[np.zeros(d), mono[:-d]] if width else mono
    l = mono * (1 - width * .5) + side * width * .5
    r = mono * (1 - width * .5) - side * width * .5 + mono * width * .5
    st = np.column_stack([l, r]); st /= max(1, np.max(np.abs(st)) / peak)
    with wave.open(str(OUT / f'{name}.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype('<i2').tobytes())
    pk = float(np.argmax(np.abs(mono)) / SR * 1000)
    meta[name] = {'ms': round(n / SR * 1000), 'peakMs': round(pk, 1)}
    print(f'{name:16s} {n / SR * 1000:6.0f} ms  peak@{pk:6.1f} ms')


# ---------------------------------------------------------------- hook hit
u = t(0.45)
ph = 2 * np.pi * (85 * u + 140 * .03 * (1 - np.exp(-u / .03)))
body = np.sin(ph) * env(u, .0015, .09)
knock = np.sin(2 * np.pi * 420 * u) * env(u, .0008, .035)
pres = np.sin(2 * np.pi * 1150 * u) * env(u, .0008, .03)
snap = svf(noise(len(u)), 3500, .9) * env(u, .0003, .008)
tail = svf(noise(len(u)), 2200, .5) * env(u, .01, .12) * .25
# mids/presence weighted up so the hit is felt on phone speakers, not only on headphones
save('hook-hit', .6 * body + .8 * knock + .9 * pres + .75 * snap + 1.4 * tail, width=.3, peak=.55)

# ---------------------------------------------------------------- title swoosh + landing pop
u = t(0.42)
sweep = np.geomspace(600, 5200, len(u))
sw = svf(noise(len(u)), sweep, .55) * np.sin(np.pi * np.clip(u / .42, 0, 1)) ** 2.4
save('title-swoosh', sw, width=.6, peak=.45)

u = t(0.18)
ph = 2 * np.pi * (880 * u - 1500 * u * u)
pop = (np.sin(ph) + .3 * np.sin(2 * ph)) * env(u, .0012, .035)
click = svf(noise(len(u)), 4500, .7) * env(u, .0002, .004)
save('title-pop', pop + .4 * click, peak=.5)

# ---------------------------------------------------------------- price sounds (one per price)
# 250: digital "blip up" (two quick rising notes)
u = t(0.22); b = np.zeros(len(u))
for start, f0, f1 in [(0, 900, 1250), (.06, 1350, 1800)]:
    v = t(.09); ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, len(v))) / SR
    place(b, (np.sin(ph) + .2 * np.sign(np.sin(ph))) * env(v, .001, .03), start)
save('price-blip', b, peak=.42)

# 500: crisp double click (UI tap)
u = t(0.16); c = np.zeros(len(u))
for start, f in [(0, 2400), (.045, 3000)]:
    v = t(.03)
    place(c, svf(noise(len(v)), f, .4) * env(v, .0002, .005) + .6 * np.sin(2 * np.pi * f * .5 * v) * env(v, .0004, .01), start)
save('price-click', c, peak=.42)

# 400: rounded pop with a small sparkle on top
u = t(0.25)
ph = 2 * np.pi * (520 * u - 700 * u * u)
p4 = (np.sin(ph) + .25 * np.sin(2 * ph)) * env(u, .0015, .045)
sp = np.sin(2 * np.pi * 2650 * u) * env(u, .002, .05) * .35
save('price-pop', p4 + sp, peak=.45)

# ---------------------------------------------------------------- 1.150 count-up roll (synced to the count)
# Count runs frames 591 -> 630 (1.3 s) with ease-out: ticks get *slower* towards the end,
# exactly like the digits. Pitch climbs as the value climbs.
dur = 1.34; u = t(dur); roll = np.zeros(len(u))
count_len = 1.30
# value(t) = 1 - (1 - t/T)^3 ; one tick every ~ 1/24 of the value
vals = np.linspace(0, 1, 25)[1:]
times = count_len * (1 - (1 - vals) ** (1 / 3))
for k, s in enumerate(times):
    v = t(.022); f = 1500 + 1100 * vals[k]
    tick = np.sin(2 * np.pi * f * v) * env(v, .0003, .005) + .4 * svf(noise(len(v)), 5000, .6) * env(v, .0002, .002)
    place(roll, tick * (.55 + .45 * vals[k]), s)
save('count-roll', roll, peak=.32)

# discreet landing impact for 1.150
u = t(0.4)
ph = 2 * np.pi * (110 * u + 120 * .025 * (1 - np.exp(-u / .025)))
land = np.sin(ph) * env(u, .001, .07) + .4 * np.sin(2 * np.pi * 950 * u) * env(u, .0008, .03) \
    + .35 * svf(noise(len(u)), 2800, .8) * env(u, .0003, .01)
save('count-land', land, peak=.5)

# ---------------------------------------------------------------- strike: sharper, more perceptible slash
u = t(0.42)
sweep = np.geomspace(1800, 9000, len(u))
sl = svf(noise(len(u)), sweep, .3) * env(u, .0015, .045)
zing = (np.sin(2 * np.pi * 2900 * u) + .6 * np.sin(2 * np.pi * 4380 * u) + .3 * np.sin(2 * np.pi * 6100 * u)) * env(u, .0008, .09)
cut_body = np.sin(2 * np.pi * 600 * u) * env(u, .0005, .02)
save('strike-slash', sl + .28 * zing + .35 * cut_body, width=.7, peak=.5)

# old price leaves
u = t(0.34)
sweep = np.geomspace(3400, 500, len(u))
save('exit-swoosh', svf(noise(len(u)), sweep, .6) * np.sin(np.pi * np.clip(u / .34, 0, 1)) ** 2, width=.6, peak=.38)

# ---------------------------------------------------------------- 697: modern "ka-ching" + coins
# Layer 1: register mechanism "ka" (short damped mechanical clack)
u = t(1.6); kc = np.zeros(len(u))
v = t(.06)
clack = svf(noise(len(v)), 1800, .9) * env(v, .0003, .012) + .5 * np.sin(2 * np.pi * 320 * v) * env(v, .0005, .015)
place(kc, clack * .8, 0.0)
place(kc, clack * .5, 0.035)
# Layer 2: bright bell "ching" (inharmonic partials, like a small register bell)
v = t(1.4)
bell_f = [2093, 2093 * 2.76, 2093 * 5.40, 2093 * 1.51]
bell_a = [1.0, .45, .18, .35]
bell_d = [.45, .22, .10, .30]
bell = sum(a * np.sin(2 * np.pi * f * v + k) * env(v, .0006, d) for k, (f, a, d) in enumerate(zip(bell_f, bell_a, bell_d)))
bell *= 1 + .08 * np.sin(2 * np.pi * 6 * v)  # gentle tremolo shimmer
place(kc, bell * .9, 0.075)
# Layer 3: coins — a few tiny metallic clinks scattered after the bell
for s in np.sort(rng.uniform(.12, .55, 9)):
    v = t(.12); f = rng.uniform(3800, 6800)
    clink = (np.sin(2 * np.pi * f * v) + .5 * np.sin(2 * np.pi * f * 1.47 * v)) * env(v, .0003, .025)
    place(kc, clink * rng.uniform(.12, .28), s)
save('cash-register', kc, width=.5, peak=.55)
meta['cash-register']['bellMs'] = 75

# soft low "weight" under the 697 entrance (felt on headphones, harmless on phones)
u = t(0.6)
ph = 2 * np.pi * (60 * u + 90 * .05 * (1 - np.exp(-u / .05)))
w697 = np.sin(ph) * env(u, .003, .18) + .35 * np.sin(2 * np.pi * 820 * u) * env(u, .001, .04) \
    + .3 * svf(noise(len(u)), 2500, .7) * env(u, .0004, .012)
save('offer-impact', w697, peak=.5)

# rising whoosh that leads into the 697 (peak at the end = arrival)
u = t(0.5)
sweep = np.geomspace(500, 4800, len(u))
lead = svf(noise(len(u)), sweep, .55) * (u / .5) ** 2.2 * np.exp(-np.maximum(0, u - .46) / .01)
save('offer-rise', lead, width=.6, peak=.42)

# ---------------------------------------------------------------- bonus
u = t(0.7)  # gift sparkle: quick arpeggio of soft bells
sp = np.zeros(len(u))
for k, f in enumerate([1568, 2093, 2637, 3136]):
    v = t(.45); place(sp, (np.sin(2 * np.pi * f * v) + .2 * np.sin(4 * np.pi * f * v)) * env(v, .001, .12) * (1 - k * .12), k * .045)
save('bonus-sparkle', sp, width=.5, peak=.38)

u = t(0.16)
ph = 2 * np.pi * (700 * u - 1100 * u * u)
save('bonus-pop', (np.sin(ph) + .25 * np.sin(2 * ph)) * env(u, .0012, .03) + .3 * svf(noise(len(u)), 4200, .7) * env(u, .0002, .004), peak=.45)

u = t(0.36)
sweep = np.geomspace(700, 4200, len(u))
save('bonus-swoosh', svf(noise(len(u)), sweep, .6) * np.sin(np.pi * np.clip(u / .36, 0, 1)) ** 2, width=.6, peak=.4)

# ---------------------------------------------------------------- CTA
u = t(0.6)
sweep = np.geomspace(400, 3000, len(u))
save('cta-rise', svf(noise(len(u)), sweep, .7) * (u / .6) ** 2 * np.exp(-np.maximum(0, u - .56) / .012), width=.5, peak=.32)

u = t(0.9)
hit = np.sin(2 * np.pi * (95 * u + 100 * .03 * (1 - np.exp(-u / .03)))) * env(u, .0015, .1) \
    + .45 * np.sin(2 * np.pi * 1050 * u) * env(u, .0008, .035) + .4 * svf(noise(len(u)), 3200, .8) * env(u, .0003, .008)
ch = np.zeros(len(u))
for s, f in [(.03, 1318.5), (.11, 1975.5)]:
    v = t(.7); place(ch, (np.sin(2 * np.pi * f * v) + .2 * np.sin(4 * np.pi * f * v)) * env(v, .002, .2), s)
save('cta-hit', hit + .5 * ch, width=.4, peak=.5)

json.dump(meta, open(OUT / 'manifest.json', 'w'), indent=1)
