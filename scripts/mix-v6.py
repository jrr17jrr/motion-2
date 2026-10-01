"""Mix exact visual cue timestamps into a peak-safe, deterministic master."""
from pathlib import Path
import json,wave,numpy as np
R=Path(__file__).resolve().parent.parent;O=R/'video/assets/v6';SR=48000
def read(path):
 with wave.open(str(path)) as w:
  assert w.getframerate()==SR and w.getnchannels()==2
  return np.frombuffer(w.readframes(w.getnframes()),'<i2').reshape(-1,2).astype(float)/32768
voice=read(O/'voice.wav');music=read(O/'music.wav');effects=np.zeros_like(voice)
manifest=json.loads((O/'cue-manifest.json').read_text());events=[]
for c in manifest['cues']:
 data=read(O/'sfx'/f"{c['file']}.wav")*c['volume'];start=c['frame']*1600;n=min(len(data),len(voice)-start)
 effects[start:start+n]+=data[:n]
 localVoice=voice[start:start+n]
 events.append({**c,'effectPeak':float(np.abs(data).max()),'effectRms':float(np.sqrt(np.mean(data**2))),'localVoiceRms':float(np.sqrt(np.mean(localVoice**2)))})
mix=voice+music+effects;peak=float(np.abs(mix).max());gain=min(1,.88/peak);mix*=gain
# Fade only after speech and CTA have finished, with no repeated media frames.
mix[-9600:]*=np.linspace(1,0,9600)[:,None]
with wave.open(str(O/'master.wav'),'wb') as w:
 w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype('<i2').tobytes())
report={'preMasterPeak':peak,'masterGain':gain,'masterPeak':float(np.abs(mix).max()),'samples':len(mix),'durationSeconds':len(mix)/SR,'sfxEvents':events,'method':'waveform/level validation; no listening claim'}
(O/'mix-report.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='sfxEvents'},indent=2))
