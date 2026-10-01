import subprocess,io,wave,json,hashlib,math,re
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent.parent;O=R/'.cache/v5-review';O.mkdir(parents=True,exist_ok=True)
F=R/'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe';P=F.with_name('ffprobe.exe');V=R/'out/otica-descontao-motion-v5.mp4'
segments=[(48,156),(162,321),(390,465),(525,623)]
def source(t):
 f=t*30;cursor=0
 for a,b in segments:
  if f<cursor+b-a:return (a+f-cursor)/30
  cursor+=b-a
 return 622/30
def frames(path,width=180,height=320):
 raw=subprocess.check_output([str(F),'-v','error','-i',str(path),'-an','-vf',f'scale={width}:{height}','-pix_fmt','rgb24','-c:v','rawvideo','-f','image2pipe','pipe:1'])
 return np.frombuffer(raw,dtype=np.uint8).reshape(-1,height,width,3)
v5=frames(V);v4=frames(R/'out/otica-descontao-motion-v4.mp4');ref=frames(R/'referencias/ref.mp4')
def contact(indices,name,cols=8):
 c=Image.new('RGB',(cols*180,350*math.ceil(len(indices)/cols)),'#191919');d=ImageDraw.Draw(c)
 for j,n in enumerate(indices):
  x=j%cols*180;y=j//cols*350;c.paste(Image.fromarray(v5[n]),(x,y));d.text((x+4,y+326),f'{n/30:.2f}s / src {source(n/30):.2f}',fill='white')
 c.save(O/name)
for page in range(3):contact(list(range(page*160,min((page+1)*160,len(v5)),4)),f'full-{page}.jpg')
times=[.2,.6,1.,1.4,1.9,2.6,3.7,4.8,5.8,6.9,7.8,8.7,8.9,9.2,9.7,10.3,11.45,12.15,12.55,13.2,13.7,14.4,15.2,15.8]
contact([min(len(v5)-1,round(t*30)) for t in times],'contact.png',6)
contact([n for boundary in [108,267,342] for n in range(boundary-5,boundary+10)],'cuts-all-frames.png',9)
contact(list(range(0,90,3)),'opening.png',6)
for n in [18,35,59,90,147,210,250,268,310,380,412,468]:
 data=subprocess.check_output([str(F),'-v','error','-ss',str(n/30),'-i',str(V),'-frames:v','1','-c:v','png','-f','image2pipe','pipe:1']);(O/f'frame-{n}.png').write_bytes(data)
def previousTime(s):
 seg4=[(48,156),(169,346),(398,480),(527,623)];cursor=0
 for a,b in seg4:
  if a<=s*30<b:return (cursor+s*30-a)/30
  cursor+=b-a
 return min(15.4,s)
compare=[.6,1.9,6.9,9.7,12.55,15.6];reft=[.53,2.13,8.53,13.33,26.13,29.07]
c=Image.new('RGB',(6*180,3*350),'#191919');d=ImageDraw.Draw(c)
for j,t in enumerate(compare):
 for row,(a,n,label) in enumerate([(ref,round(reft[j]*30),'REF'),(v4,round(previousTime(source(t))*30),'V4'),(v5,round(t*30),'V5')]):
  n=min(n,len(a)-1);c.paste(Image.fromarray(a[n]),(j*180,row*350));d.text((j*180+5,row*350+326),f'{label} {n/30:.2f}s',fill='white')
c.save(R/'out/otica-descontao-ref-v4-v5-comparison.png')
probe=json.loads(subprocess.check_output([str(P),'-v','error','-show_format','-show_streams','-of','json',str(V)]))
raw=subprocess.check_output([str(F),'-v','error','-i',str(V),'-vn','-c:a','pcm_s16le','-f','wav','pipe:1'])
with wave.open(io.BytesIO(raw)) as w:pcm=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,w.getnchannels()).astype(float)/32768;sr=w.getframerate()
with wave.open(str(R/'video/assets/v5/voice.wav')) as w:voice=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2).astype(float)/32768
correlations={};a=voice.mean(axis=1)[::48];b=pcm.mean(axis=1)[::48]
for lag in range(-20,21):
 x=a[max(0,-lag):];y=b[max(0,lag):];n=min(len(x),len(y));correlations[lag]=float(np.corrcoef(x[:n],y[:n])[0,1])
best=max(correlations,key=correlations.get)
subprocess.run([str(F),'-v','error','-i',str(V),'-c:v','libx264','-preset','ultrafast','-c:a','aac','-f','null','-'],check=True)
l=subprocess.run([str(F),'-v','info','-i',str(V),'-vn','-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-c:a','pcm_s16le','-f','null','-'],capture_output=True,text=True,check=True)
last=l.stderr.rfind('{');loud=json.loads(l.stderr[last:l.stderr.find('}',last)+1])
hashes=json.loads((R/'.cache/v5-analysis/preservation.json').read_text());preserved={p:hashlib.sha256((R/p).read_bytes()).hexdigest()==h for p,h in hashes.items()};assert all(preserved.values())
logoIdentical=hashlib.sha256((R/'logonova.png').read_bytes()).digest()==hashlib.sha256((R/'video/assets/v5/logonova.png').read_bytes()).digest();assert logoIdentical
official=R/'.cache/v5-analysis/whatsapp-official/Brand Resource Center Page Downloads/01_Glyph/01_Digital RGB/03_SVG/Digital_Glyph_Green_RGB_2026.svg'
assert official.read_bytes()==(R/'video/assets/v5/whatsapp-official.svg').read_bytes()
means=v5.mean(axis=(1,2,3));manifest=json.loads((R/'video/assets/v5/audio-manifest.json').read_text())
solidBlack=int(((v5.max(axis=3)<12).mean(axis=(1,2))>.8).sum())
solidWhite=int(((v5.min(axis=3)>240).mean(axis=(1,2))>.8).sum())
report={'probe':probe,'decodedFrames':len(v5),'blackFrames':int((means<8).sum()),'nearlySolidBlackFrames':solidBlack,'nearlySolidWhiteFrames':solidWhite,'audio':{'sampleRate':sr,'rms':float(np.sqrt(np.mean(pcm**2))),'peak':float(np.abs(pcm).max()),'clippedSamples':int((np.abs(pcm)>=.999).sum()),'voiceOffsetMs':best,'voiceCorrelation':correlations[best],'loudness':loud},'protectedFiles':len(preserved),'allProtectedFilesUnchanged':all(preserved.values()),'preservation':preserved,'logoCopyIdentical':logoIdentical,'whatsappOfficialCopyIdentical':True,'fullDecode':'passed','audioManifest':manifest,'cueManifest':json.loads((R/'video/assets/v5/cue-manifest.json').read_text()),'phone':'(21) 99648-0818','phoneVisibleSeconds':(476-370)/30,'glassesSceneEntry':{'outputSeconds':267/30,'sourceSeconds':13.,'speechSourceOnset':13.09,'leadSeconds':.09},'reviewMethod':'continuous chronological frame sequences plus all frames of cut boundaries; audio validated technically, without audition'}
(O/'report.json').write_text(json.dumps(report,indent=2));(R/'out/otica-descontao-v5-technical-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k not in ['probe','preservation','audioManifest','cueManifest']},indent=2))
assert len(v5)==476 and report['blackFrames']==0 and solidBlack==0 and solidWhite==0,'Invalid blank frames: inspect the rendered stream'
