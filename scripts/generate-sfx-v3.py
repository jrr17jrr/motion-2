"""Procedural original V3 camera / wipe / typography sound cues."""
import numpy as np,wave
from pathlib import Path
SR=48000;out=Path('video/assets/v3/audio');out.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(73)
def save(name,v):
 with wave.open(str(out/name),'wb') as w:
  w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR)
  w.writeframes((np.column_stack([v,v])*.999*32767).clip(-32767,32767).astype('<i2').tobytes())
t=np.arange(int(.38*SR))/SR
noise=rng.normal(0,1,len(t));air=np.convolve(noise,np.ones(11)/11,mode='same')
env=np.sin(np.pi*t/.38)**2
save('whip.wav',.16*air*env+.025*np.sin(2*np.pi*(100*t+140*t*t))*env)
t=np.arange(int(.22*SR))/SR
phase=2*np.pi*(52*t+110*.026*(1-np.exp(-t/.026)))
save('punch.wav',.14*np.sin(phase)*np.exp(-t*24)*(1-np.exp(-t*800)))
t=np.arange(int(.13*SR))/SR
save('type-pop.wav',.065*np.sin(2*np.pi*(660*t-700*t*t))*np.exp(-t*42)*(1-np.exp(-t*800)))
t=np.arange(int(.65*SR))/SR
air=np.convolve(rng.normal(0,1,len(t)),np.ones(9)/9,mode='same')
save('riser.wav',.065*air*(t/.65)**2*np.clip((.65-t)/.06,0,1))
t=np.arange(int(.42*SR))/SR
save('resolve.wav',.07*(np.sin(2*np.pi*659.25*t)+.4*np.sin(2*np.pi*987.77*t))*np.exp(-t*10)*(1-np.exp(-t*450)))
print('V3 original SFX generated.')
