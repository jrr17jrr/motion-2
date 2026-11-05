"""Procedural SFX kit for the Plano Visionario edit.

Everything is synthesised here (sines + filtered noise): no third-party samples,
so there is no licensing issue. Output: video/assets/pv/sfx/*.wav, 48 kHz stereo.
Levels are normalised conservatively; final gain is set per event in src/pv/timeline.ts.
"""
from pathlib import Path
import wave
import numpy as np

R = Path(__file__).resolve().parents[1]
OUT = R / 'video/assets/pv/sfx'
OUT.mkdir(parents=True, exist_ok=True)
SR = 48000
rng = np.random.default_rng(697)


def t(sec):
    return np.arange(int(sec * SR)) / SR


def lowpass(x, a):
    # one-pole low-pass, a in (0,1): smaller = darker
    y = np.empty_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y


def bandsweep(n, f0, f1, q=0.5):
    """Noise through a state-variable band-pass whose centre sweeps f0 -> f1."""
    x = rng.normal(0, 1, n); f = np.geomspace(f0, f1, n)
    low = band = 0.0; y = np.empty(n)
    for i in range(n):
        g = 2 * np.sin(np.pi * f[i] / SR)
        high = x[i] - low - q * band
        band += g * high; low += g * band; y[i] = band
    return y


def save(name, mono, pan_wobble=0.0, peak=0.5):
    mono = mono / (np.max(np.abs(mono)) + 1e-12) * peak
    n = len(mono); fade = min(n, int(0.004 * SR))
    mono[-fade:] *= np.linspace(1, 0, fade)
    l = mono * (1 - pan_wobble * np.linspace(-1, 1, n))
    r = mono * (1 + pan_wobble * np.linspace(-1, 1, n))
    pcm = (np.clip(np.column_stack([l, r]), -1, 1) * 32767).astype('<i2')
    with wave.open(str(OUT / f'{name}.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print(f'{name:14s} {n / SR * 1000:6.0f} ms  peak@{np.argmax(np.abs(mono)) / SR * 1000:5.1f} ms')


def env(u, attack, decay):
    return (1 - np.exp(-u / attack)) * np.exp(-u / decay)


# Soft pop: short pitched blip with a gentle downward glide.
u = t(0.14)
ph = 2 * np.pi * (620 * u - 900 * u * u)
save('pop-soft', (np.sin(ph) + .25 * np.sin(2 * ph)) * env(u, .0015, .03), peak=.42)

# Pop variant (lower, rounder) to avoid repetition.
ph = 2 * np.pi * (430 * u - 500 * u * u)
save('pop-round', (np.sin(ph) + .15 * np.sin(3 * ph)) * env(u, .002, .038), peak=.42)

# Short whoosh: swept band-passed noise, swelling then decaying.
u = t(0.32)
w = bandsweep(len(u), 450, 3800, .7) * np.sin(np.pi * np.clip(u / .32, 0, 1)) ** 1.6
save('whoosh-short', w, pan_wobble=.35, peak=.40)

# Reverse-ish swoosh for exits (descending sweep).
w = bandsweep(len(u), 3200, 380, .7) * np.sin(np.pi * np.clip(u / .32, 0, 1)) ** 2.2
save('whoosh-down', w, pan_wobble=-.3, peak=.36)

# Small price tick/impact: tight low thump + bright click.
u = t(0.30)
ph = 2 * np.pi * (140 * u + 160 * .02 * (1 - np.exp(-u / .02)))
thump = np.sin(ph) * env(u, .001, .06)
click = lowpass(rng.normal(0, 1, len(u)), .5) * env(u, .0003, .006)
tone = np.sin(2 * np.pi * 1250 * u) * env(u, .0006, .025)
save('price-hit', thump + .35 * click + .22 * tone, peak=.50)

# Count-up ticker for the 1.150 build (fast tiny clicks, accelerating then landing).
dur = 0.55; u = t(dur); tick = np.zeros(len(u))
times = np.cumsum(np.geomspace(.06, .028, 14)); times = times[times < dur - .03]
for k, s in enumerate(times):
    i = int(s * SR); n = int(.018 * SR); v = t(.018)
    tick[i:i + n] += np.sin(2 * np.pi * (1800 + 60 * k) * v)[: len(tick) - i] * env(v, .0003, .004)[: len(tick) - i]
save('count-tick', tick, peak=.22)

# Slash / cut for striking 1.150: very fast high sweep + metallic ring tail.
u = t(0.36)
sl = bandsweep(len(u), 1500, 9000, .35) * env(u, .002, .05)
ring = (np.sin(2 * np.pi * 3100 * u) + .5 * np.sin(2 * np.pi * 4730 * u)) * env(u, .001, .07)
save('slash', sl + .18 * ring, pan_wobble=.5, peak=.40)

# Big impact for 697: sub drop + body + transient + airy shimmer tail.
u = t(0.9)
ph = 2 * np.pi * (55 * u + 110 * .045 * (1 - np.exp(-u / .045)))
sub = np.sin(ph) * env(u, .002, .22)
body = np.sin(2 * np.pi * 190 * u) * env(u, .001, .05)
trans = lowpass(rng.normal(0, 1, len(u)), .35) * env(u, .0004, .012)
pres = np.sin(2 * np.pi * 900 * u) * env(u, .001, .05)  # audible on phone speakers
shimmer = bandsweep(len(u), 6000, 7000, .3) * env(u, .02, .25)
save('impact-big', sub + .5 * body + .45 * trans + .25 * pres + .08 * shimmer, peak=.62)

# Soft rising "air" before the bonus / CTA.
u = t(0.5)
rise = bandsweep(len(u), 300, 2600, .8) * (u / .5) ** 2 * np.exp(-np.maximum(0, u - .45) / .01)
save('rise-air', rise, peak=.28)

# Gentle two-note chime for the WhatsApp CTA.
u = t(0.8)
c = np.zeros(len(u))
for start, f in [(0, 1046.5), (.09, 1568.0)]:
    v = np.clip(u - start, 0, None)
    c += (np.sin(2 * np.pi * f * v) + .2 * np.sin(4 * np.pi * f * v)) * env(v, .002, .18) * (u >= start)
save('chime', c, peak=.30)
