"""Original procedural sound design. No samples or third-party music."""
import math, wave
from pathlib import Path
import numpy as np

RATE=48000
OUT=Path('video/assets/audio')
OUT.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(17)

def save(name, samples):
    samples=np.clip(samples,-.95,.95)
    stereo=np.column_stack([samples,samples])
    with wave.open(str(OUT/name),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(RATE)
        w.writeframes((stereo*32767).astype('<i2').tobytes())

duration=20.834
music=np.zeros(math.ceil(duration*RATE))
beat=60/106
def add(start,signal):
    offset=int(start*RATE);end=min(len(music),offset+len(signal))
    if offset<end:music[offset:end]+=signal[:end-offset]

# Soft original A minor / F / C / G motif, restrained retail pulse.
roots=[110,87.307,130.813,97.999]
for i in range(math.ceil(duration/beat)):
    root=roots[(i//8)%4]
    t=np.arange(int(.42*RATE))/RATE
    bass=(np.sin(2*np.pi*root*t)+.2*np.sin(4*np.pi*root*t))*np.exp(-t*11)
    add(i*beat,.028*bass)
    note=root*(2 if i%4 in [0,3] else 3)
    pluck=np.sin(2*np.pi*note*t)*np.exp(-t*15)*(1-np.exp(-t*300))
    add(i*beat+beat/2,.014*pluck)
    if i%2==0:
        kt=np.arange(int(.15*RATE))/RATE
        phase=2*np.pi*(48*kt+35*.018*(1-np.exp(-kt/.018)))
        add(i*beat,.015*np.sin(phase)*np.exp(-kt*28))
    ht=np.arange(int(.045*RATE))/RATE
    noise=rng.normal(0,1,len(ht));noise=np.concatenate([[0],np.diff(noise)])
    add(i*beat+beat/2,.0016*noise*np.exp(-ht*90))
time=np.arange(len(music))/RATE
fade=np.minimum(1,time/.7)*np.clip((duration-time)/.8,0,1)
# Lower bed under speech, slight lift only during existing breaths.
duck=np.full(len(music),.45)
for a,b in [(0,1.65),(11.5,13.1),(15.6,17.5),(20.1,20.834)]:
    mask=(time>=a)&(time<b);duck[mask]=.8
save('original-bed.wav',music*fade*duck)

t=np.arange(int(.24*RATE))/RATE
phase=2*np.pi*(330*t+900*.035*(1-np.exp(-t/.035)))
save('soft-hit.wav',.075*np.sin(phase)*np.exp(-t*24)*(1-np.exp(-t*700)))
t=np.arange(int(.32*RATE))/RATE
noise=rng.normal(0,1,len(t));smooth=np.convolve(noise,np.ones(13)/13,mode='same')
save('air-swipe.wav',smooth*.06*np.sin(np.pi*t/.32)**2)
t=np.arange(int(.34*RATE))/RATE
save('cta-chime.wav',.052*(np.sin(2*np.pi*880*t)+.5*np.sin(2*np.pi*1320*t))*np.exp(-t*13)*(1-np.exp(-t*500)))
print('Generated original bed and three original SFX.')
