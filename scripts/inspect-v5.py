import json,hashlib,subprocess,wave
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent.parent;O=R/'.cache/v5-analysis';O.mkdir(exist_ok=True)
protected=[str(p.relative_to(R)).replace('\\','/') for p in (R/'video').rglob('*') if p.is_file()]+['logonova.png','referencias/ref.mp4']+[str(p.relative_to(R)).replace('\\','/') for p in (R/'out').glob('*.mp4')]
(O/'preservation.json').write_text(json.dumps({p:hashlib.sha256((R/p).read_bytes()).hexdigest() for p in protected},indent=2))
F=R/'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'
raw=subprocess.check_output([str(F),'-v','error','-ss','10','-i',str(R/'video/0.mp4'),'-t','3.6','-an','-vf','scale=180:320','-pix_fmt','rgb24','-c:v','rawvideo','-f','image2pipe','pipe:1'])
a=np.frombuffer(raw,dtype=np.uint8).reshape(-1,320,180,3)
c=Image.new('RGB',(180*8,350*5),'#191919');d=ImageDraw.Draw(c)
for j,n in enumerate(range(0,len(a),3)):
 x=j%8*180;y=j//8*350;c.paste(Image.fromarray(a[n]),(x,y));d.text((x+4,y+325),f'{10+n/30:.2f}s',fill='white')
c.save(O/'source-question-entry.jpg')
with wave.open(str(R/'video/assets/audio/voice-normalized.wav')) as w:
 sr=w.getframerate();v=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2).mean(axis=1)/32768
rows=[]
for t in np.arange(10.2,13.5,.1):
 x=v[round(t*sr):round((t+.1)*sr)];rows.append((round(float(t),2),round(float(np.sqrt(np.mean(x*x))),4)))
print(rows)
