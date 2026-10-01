import subprocess,io,json,hashlib,wave
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent.parent
F=R/'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'
O=R/'.cache/v4-analysis';O.mkdir(parents=True,exist_ok=True)
protected=['video/0.mp4','out/technical-test.mp4','out/otica-descontao-motion-v2.mp4','out/otica-descontao-motion-v3.mp4','referencias/ref.mp4','logonova.png','video/assets/brand/logo.png']
(O/'preservation.json').write_text(json.dumps({p:hashlib.sha256((R/p).read_bytes()).hexdigest() for p in protected},indent=2))
# Decode every frame, keeping a continuous full-duration visual stream for analysis.
raw=subprocess.check_output([str(F),'-v','error','-i',str(R/'referencias/ref.mp4'),'-an','-vf','scale=180:320','-pix_fmt','rgb24','-c:v','rawvideo','-f','image2pipe','pipe:1'])
a=np.frombuffer(raw,dtype=np.uint8).reshape(-1,320,180,3)
d=np.abs(a[1:].astype(float)-a[:-1]).mean(axis=(1,2,3))
for page in range(4):
    indices=list(range(page*240,min((page+1)*240,len(a)),8))
    im=Image.new('RGB',(180*6,350*5),'#171717');draw=ImageDraw.Draw(im)
    for j,n in enumerate(indices):
        x=(j%6)*180;y=(j//6)*350;im.paste(Image.fromarray(a[n]),(x,y));draw.text((x+5,y+326),f'{n/30:.2f}s',fill='white')
    im.save(O/f'reference-{page}.jpg')
peaks=[(i+1,float(v)) for i,v in enumerate(d) if v>20]
audio=subprocess.check_output([str(F),'-v','error','-i',str(R/'referencias/ref.mp4'),'-vn','-c:a','pcm_s16le','-f','wav','pipe:1'])
(O/'reference-audio.wav').write_bytes(audio)
with wave.open(io.BytesIO(audio)) as w:
    pcm=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,w.getnchannels()).astype(float)/32768
    sr=w.getframerate()
report={'framesAnalyzed':len(a),'duration':len(a)/30,'visualChangeCandidates':[(round(n/30,3),round(v,2)) for n,v in peaks],'audioRms':float(np.sqrt(np.mean(pcm**2))),'audioPeak':float(np.abs(pcm).max())}
(O/'reference-analysis.json').write_text(json.dumps(report,indent=2))
logo=Image.open(R/'logonova.png');print('logo',logo.size,logo.mode,logo.getextrema()[-1]);print(json.dumps(report,indent=2))
