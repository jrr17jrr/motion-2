"""Review the complete V4 stream, compare matched source moments, validate preservation."""
import subprocess,io,wave,json,hashlib,math
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent.parent;O=R/'.cache/v4-review';O.mkdir(parents=True,exist_ok=True)
F=R/'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe';P=F.with_name('ffprobe.exe');V=R/'out/otica-descontao-motion-v4.mp4'
segments=[(48,156),(169,346),(398,480),(527,623)]
def source(t):
    f=t*30;cursor=0
    for a,b in segments:
        if f<cursor+b-a:return (a+f-cursor)/30
        cursor+=b-a
    return 622/30
def frames(path,width=180,height=320):
    raw=subprocess.check_output([str(F),'-v','error','-i',str(path),'-an','-vf',f'scale={width}:{height}','-pix_fmt','rgb24','-c:v','rawvideo','-f','image2pipe','pipe:1'])
    return np.frombuffer(raw,dtype=np.uint8).reshape(-1,height,width,3)
v4=frames(V);v3=frames(R/'out/otica-descontao-motion-v3.mp4');ref=frames(R/'referencias/ref.mp4')
def contact(indices,name,cols=8):
    canvas=Image.new('RGB',(cols*180,350*math.ceil(len(indices)/cols)),'#191919');d=ImageDraw.Draw(canvas)
    for j,n in enumerate(indices):
        x=j%cols*180;y=j//cols*350;canvas.paste(Image.fromarray(v4[n]),(x,y));d.text((x+4,y+326),f'{n/30:.2f}s / src {source(n/30):.2f}',fill='white')
    canvas.save(O/name)
# Continuous chronological coverage, eight samples per second, with ALL frames decoded.
for p in range(3):contact(list(range(p*160,min((p+1)*160,len(v4)),4)),f'full-{p}.jpg')
times=[.23,.8,1.13,1.90,2.75,3.55,3.85,4.8,5.9,6.50,7.6,8.85,9.5,10.5,11.3,12.35,12.9,13.55,14.4,15.35]
contact([min(len(v4)-1,round(t*30)) for t in times],'contact.png',5)
for n in [22,60,196,321,410,459]:
    data=subprocess.check_output([str(F),'-v','error','-ss',str(n/30),'-i',str(V),'-frames:v','1','-c:v','png','-f','image2pipe','pipe:1'])
    (O/f'frame-{n}.png').write_bytes(data)
compare=[.8,1.9,6.5,10.5,13.55,15.35]
c=Image.new('RGB',(6*180,3*350),'#191919');d=ImageDraw.Draw(c)
reft=[.53,2.13,8.53,13.33,26.13,29.07]
for j,t in enumerate(compare):
    for row,(a,n,label) in enumerate([(ref,round(reft[j]*30),'REF'),(v3,round(source(t)*30),'V3'),(v4,round(t*30),'V4')]):
        n=min(n,len(a)-1);c.paste(Image.fromarray(a[n]),(j*180,row*350));d.text((j*180+5,row*350+326),f'{label} {n/30:.2f}s',fill='white')
c.save(R/'out/otica-descontao-ref-v3-v4-comparison.png')
contact([n for boundary in [108,285,367] for n in range(boundary-6,boundary+9,2)],'cuts.png',8)
probe=json.loads(subprocess.check_output([str(P),'-v','error','-show_format','-show_streams','-of','json',str(V)]))
raw=subprocess.check_output([str(F),'-v','error','-i',str(V),'-vn','-c:a','pcm_s16le','-f','wav','pipe:1'])
with wave.open(io.BytesIO(raw)) as w:pcm=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,w.getnchannels()).astype(float)/32768;sr=w.getframerate()
with wave.open(str(R/'video/assets/v4/voice.wav')) as w:voice=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2).astype(float)/32768
correlations={};a=voice.mean(axis=1)[::48];b=pcm.mean(axis=1)[::48]
for lag in range(-20,21):
    x=a[max(0,-lag):];y=b[max(0,lag):];n=min(len(x),len(y));correlations[lag]=float(np.corrcoef(x[:n],y[:n])[0,1])
best=max(correlations,key=correlations.get)
subprocess.run([str(F),'-v','error','-i',str(V),'-c:v','libx264','-preset','ultrafast','-c:a','aac','-f','null','-'],check=True)
l=subprocess.run([str(F),'-v','info','-i',str(V),'-vn','-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-c:a','pcm_s16le','-f','null','-'],capture_output=True,text=True,check=True)
last=l.stderr.rfind('{');loud=json.loads(l.stderr[last:l.stderr.find('}',last)+1])
hashes=json.loads((R/'.cache/v4-analysis/preservation.json').read_text())
preserved={p:hashlib.sha256((R/p).read_bytes()).hexdigest()==h for p,h in hashes.items()}
assert all(preserved.values()),preserved
assert hashlib.sha256((R/'logonova.png').read_bytes()).digest()==hashlib.sha256((R/'video/assets/v4/logonova.png').read_bytes()).digest()
means=v4.mean(axis=(1,2,3))
report={'probe':probe,'decodedFrames':len(v4),'blackFrames':int((means<8).sum()),'audio':{'sampleRate':sr,'rms':float(np.sqrt(np.mean(pcm**2))),'peak':float(np.abs(pcm).max()),'clippedSamples':int((np.abs(pcm)>=.999).sum()),'voiceOffsetMs':best,'voiceCorrelation':correlations[best],'loudness':loud},'preservation':preserved,'logoCopyIdentical':True,'fullDecode':'passed','music':json.loads((R/'video/assets/v4/timeline.json').read_text())}
(O/'report.json').write_text(json.dumps(report,indent=2));(R/'out/otica-descontao-v4-technical-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k!='probe'},indent=2))
