"""Non-destructive audio assembly and original commercial pulse for V4."""
import wave,json,math,shutil
from pathlib import Path
import numpy as np
R=Path(__file__).resolve().parent.parent;O=R/'video/assets/v4';O.mkdir(parents=True,exist_ok=True)
segments=[(48,156),(169,346),(398,480),(527,623)]
SR=48000
with wave.open(str(R/'video/assets/audio/voice-normalized.wav')) as w:
    assert w.getframerate()==SR
    v=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2).astype(float)/32768
parts=[]
for a,b in segments:
    p=v[a*1600:b*1600].copy();r=240
    p[:r]*=np.linspace(0,1,r)[:,None];p[-r:]*=np.linspace(1,0,r)[:,None];parts.append(p)
voice=np.concatenate(parts);N=len(voice);t=np.arange(N)/SR
def save(path,pcm):
    with wave.open(str(path),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(pcm,-.96,.96)*32767).astype('<i2').tobytes())
save(O/'voice.wav',voice)
music=np.zeros((N,2));rng=np.random.default_rng(404)
beat=.5 # 120 BPM; 2/3 s phrase boundaries also drive custom accents.
def add(time,signal,pan=0):
    i=int(time*SR);n=min(len(signal),N-i)
    if n>0:music[i:i+n,0]+=signal[:n]*(1-pan*.3);music[i:i+n,1]+=signal[:n]*(1+pan*.3)
roots=[110,87.307,130.813,97.999]
for j in range(math.ceil(N/SR/beat)):
    root=roots[(j//8)%4]
    u=np.arange(int(.38*SR))/SR
    bass=(np.sin(2*np.pi*root*u)+.16*np.sin(4*np.pi*root*u))*np.exp(-u*10)*(1-np.exp(-u*500))
    add(j*beat,.095*bass)
    u=np.arange(int(.16*SR))/SR
    kick=np.sin(2*np.pi*(48*u+45*.025*(1-np.exp(-u/.025))))*np.exp(-u*27)
    add(j*beat,.06*kick)
    if j%2:
        sn=rng.normal(0,1,len(u));sn=np.convolve(sn,np.ones(5)/5,mode='same')
        add(j*beat,.034*sn*np.exp(-u*35))
    for k in range(2):
        u=np.arange(int(.035*SR))/SR;hat=rng.normal(0,1,len(u));hat=np.r_[0,np.diff(hat)]
        add(j*beat+k*.25,.0035*hat*np.exp(-u*100),(-1)**k)
    u=np.arange(int(.33*SR))/SR
    ratio=[4,5,6,5][j%4];freq=root*ratio
    pluck=(np.sin(2*np.pi*freq*u)+.22*np.sin(4*np.pi*freq*u))*np.exp(-u*14)*(1-np.exp(-u*400))
    add(j*beat+.25,.025*pluck,(-1)**j*.7)
# Original light harmonic support, stereo decorrelation without external samples.
for bar in range(4):
    start=bar*4;root=roots[bar];u=np.arange(int(min(4,N/SR-start)*SR))/SR
    if len(u):
        chord=sum(np.sin(2*np.pi*root*r*u) for r in [2,2.378414,2.996614])/3
        add(start,.019*chord*np.sin(np.pi*np.minimum(u/4,1))**2)
# Speech envelope drives ducking, including retained breaths.
mono=voice.mean(axis=1);win=960
env=np.sqrt(np.convolve(mono[::48]**2,np.ones(20)/20,mode='same'))
duck=np.interp(np.arange(N),np.arange(len(env))*48,np.clip(.70-env*3.2,.32,.70))
fade=np.minimum(1,t/.08)*np.minimum(1,(N/SR-t)/.20)
music*=duck[:,None]*fade[:,None]
save(O/'music.wav',music)
shutil.copyfile(R/'logonova.png',O/'logonova.png')
cursor=0;report=[]
for a,b in segments:
    report.append({'sourceStart':a/30,'sourceEnd':b/30,'outputStart':cursor/30,'frames':b-a});cursor+=b-a
(O/'timeline.json').write_text(json.dumps({'segments':report,'durationFrames':cursor,'fps':30,'musicBpm':120,'musicOrigin':'original procedural composition; no third-party samples','voiceRms':float(np.sqrt(np.mean(voice**2))),'musicRms':float(np.sqrt(np.mean(music**2))),'musicRelativeDb':float(20*np.log10(np.sqrt(np.mean(music**2))/np.sqrt(np.mean(voice**2))))},indent=2))
print((O/'timeline.json').read_text())
