"""Derived V5 audio. Originals and previous version assets remain untouched."""
import wave,json,math,shutil
from pathlib import Path
import numpy as np
R=Path(__file__).resolve().parent.parent;O=R/'video/assets/v5';(O/'sfx').mkdir(parents=True,exist_ok=True)
SR=48000;segments=[(48,156),(162,321),(390,465),(525,623)];hold=36
with wave.open(str(R/'video/assets/audio/voice-normalized.wav')) as w:
 assert w.getframerate()==SR
 original=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2).astype(float)/32768
parts=[]
for a,b in segments:
 p=original[a*1600:b*1600].copy();n=240;p[:n]*=np.linspace(0,1,n)[:,None];p[-n:]*=np.linspace(1,0,n)[:,None];parts.append(p)
voice=np.concatenate(parts+[np.zeros((hold*1600,2))]);N=len(voice);duration=N/SR
def save(path,pcm):
 if pcm.ndim==1:pcm=np.column_stack([pcm,pcm])
 with wave.open(str(path),'wb') as w:
  w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(pcm,-.95,.95)*32767).astype('<i2').tobytes())
save(O/'voice.wav',voice)
music=np.zeros((N,2));rng=np.random.default_rng(505)
def add(start,signal,pan=0):
 i=round(start*SR);n=min(len(signal),N-i)
 if n>0:music[i:i+n,0]+=signal[:n]*(1-pan*.3);music[i:i+n,1]+=signal[:n]*(1+pan*.3)
roots=[110,87.307,130.813,97.999];beat=.5
for j in range(math.ceil(duration/beat)):
 root=roots[(j//8)%4];u=np.arange(int(.38*SR))/SR
 bass=(np.sin(2*np.pi*root*u)+.16*np.sin(4*np.pi*root*u))*np.exp(-u*10)*(1-np.exp(-u*500));add(j*beat,.09*bass)
 u=np.arange(int(.16*SR))/SR;kick=np.sin(2*np.pi*(48*u+45*.025*(1-np.exp(-u/.025))))*np.exp(-u*27);add(j*beat,.055*kick)
 if j%2:add(j*beat,.031*np.convolve(rng.normal(0,1,len(u)),np.ones(5)/5,mode='same')*np.exp(-u*35))
 for k in range(2):
  u=np.arange(int(.035*SR))/SR;h=rng.normal(0,1,len(u));add(j*beat+k*.25,.003*np.r_[0,np.diff(h)]*np.exp(-u*100),(-1)**k)
 u=np.arange(int(.33*SR))/SR;freq=root*[4,5,6,5][j%4];pluck=(np.sin(2*np.pi*freq*u)+.22*np.sin(4*np.pi*freq*u))*np.exp(-u*14)*(1-np.exp(-u*400));add(j*beat+.25,.026*pluck,(-1)**j*.7)
for i,(a,b) in enumerate(segments):
 onset=sum(y-x for x,y in segments[:i])/30
 u=np.arange(int(.13*SR))/SR;accent=np.sin(2*np.pi*(65*u+25*.025*(1-np.exp(-u/.025))))*np.exp(-u*32)
 add(onset,.025*accent)
u=np.arange(N)/SR;env=np.sqrt(np.convolve(voice.mean(axis=1)[::48]**2,np.ones(20)/20,mode='same'))
duck=np.interp(np.arange(N),np.arange(len(env))*48,np.clip(.65-env*3.2,.30,.65));fade=np.minimum(1,u/.08)*np.minimum(1,(duration-u)/.4)
music*=1.35*duck[:,None]*fade[:,None];save(O/'music.wav',music)
shutil.copyfile(R/'logonova.png',O/'logonova.png')
metrics=[]
def fx(name,data):
 save(O/'sfx'/f'{name}.wav',data)
 peak=int(np.argmax(np.abs(data)));metrics.append({'file':name,'durationSeconds':len(data)/SR,'peakOffsetMs':round(peak/SR*1000,3)})
for name,freq,tau,gain in [('impact-a',105,.045,.16),('impact-b',70,.065,.17),('impact-c',135,.042,.13),('pop-a',520,.024,.075),('pop-b',370,.03,.11),('logo-pop',680,.025,.08),('contact-pop',440,.04,.095)]:
 t=np.arange(int(.26*SR))/SR;phase=2*np.pi*(freq*t+freq*.25*.015*(1-np.exp(-t/.015)))
 tone=(np.cos(phase)+.17*np.cos(phase*2.03))*np.exp(-t/tau)*(1-np.exp(-t*1800))
 fx(name,gain*tone)
for name,length,smoothing,gain in [('slide-a',.20,9,.10),('cut-air',.20,13,.09),('cut-air-b',.20,19,.075)]:
 t=np.arange(round(length*SR))/SR;noise=np.convolve(rng.normal(0,1,len(t)),np.ones(smoothing)/smoothing,mode='same')
 fx(name,gain*noise*np.sin(np.pi*t/length)**2)
t=np.arange(round(8/30*SR))/SR;noise=np.convolve(rng.normal(0,1,len(t)),np.ones(17)/17,mode='same');fx('riser-short',.055*noise*(t/t[-1])**2)
t=np.arange(int(.40*SR))/SR;fx('resolve-v5',.06*(np.cos(2*np.pi*660*t)+.35*np.cos(2*np.pi*990*t))*np.exp(-t*11)*(1-np.exp(-t*1800)))
# Measure dialogue/music ratio only while speech is active.
speech=env>.025;speechFull=np.interp(np.arange(N),np.arange(len(env))*48,speech.astype(float))>.5
ratio=20*np.log10(np.sqrt(np.mean(music[speechFull]**2))/np.sqrt(np.mean(voice[speechFull]**2)))
report={'segments':[{'start':a,'end':b,'outputStart':sum(y-x for x,y in segments[:i])} for i,(a,b) in enumerate(segments)],'footageFrames':sum(b-a for a,b in segments),'holdFrames':hold,'durationFrames':N//1600,'musicBpm':120,'musicOrigin':'original synthesis; no external samples','musicRelativeToVoiceDuringSpeechDb':float(ratio),'sfx':metrics}
(O/'audio-manifest.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
