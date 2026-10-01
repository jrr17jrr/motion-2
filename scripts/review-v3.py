"""Full V3 decoding/audio checks plus V2/V3 visual comparison and motion strips."""
import subprocess,json,math,wave,io
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np

ROOT=Path(__file__).resolve().parent.parent
FF=ROOT/'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'
PROBE=FF.with_name('ffprobe.exe')
VIDEO=ROOT/'out/otica-descontao-motion-v3.mp4'
V2=ROOT/'out/otica-descontao-motion-v2.mp4'
OUT=ROOT/'.cache/v3-final-review';OUT.mkdir(parents=True,exist_ok=True)

def extract(video,t,name):
    target=OUT/f'{name}.png'
    if not target.exists():
        subprocess.run([str(FF),'-v','error','-ss',str(t),'-i',str(video),'-frames:v','1','-n',str(target)],check=True)
    return Image.open(target).convert('RGB')

def sheet(times,name,columns=6):
    rows=math.ceil(len(times)/columns)
    canvas=Image.new('RGB',(360*columns,680*rows),'#1c2921');draw=ImageDraw.Draw(canvas)
    for i,t in enumerate(times):
        im=extract(VIDEO,t,f'v3-{t:.3f}');x=(i%columns)*360;y=(i//columns)*680
        canvas.paste(im.resize((360,640)),(x,y));draw.text((x+12,y+648),f'V3 / {t:.3f}s',fill='white')
    canvas.save(OUT/name)

times=[0,.17,.5,1.83,2.37,2.87,3.7,4.65,5.82,6.8,8.9,9.65,10.7,12.2,13.7,14.7,15.5,16.9,17.65,18.4,18.9,19.75,20.4,20.7]
sheet(times,'contact.png')
compare=[2.37,3.7,9.65,14.7,18.9,20.7]
canvas=Image.new('RGB',(360*6,680*2),'#1c2921');draw=ImageDraw.Draw(canvas)
for i,t in enumerate(compare):
    for row,(vid,label) in enumerate([(V2,'V2'),(VIDEO,'V3')]):
        im=extract(vid,t,f'{label.lower()}-{t:.3f}')
        canvas.paste(im.resize((360,640)),(i*360,row*680));draw.text((i*360+12,row*680+648),f'{label} / {t:.2f}s',fill='white')
canvas.save(ROOT/'out/otica-descontao-v2-v3-comparison.png')
sheet([0,.10,.20,.40,.8,1.8,2.10,2.20,2.55,2.70,2.90,3.0],'opening.png')
sheet([5.63,5.73,5.83,5.93,6.03,6.13,13.30,13.40,13.50,13.60,13.70,13.80,17.30,17.43,17.56,17.70,17.83,18.0],'transitions.png')

probe=json.loads(subprocess.check_output([str(PROBE),'-v','error','-show_streams','-show_format','-of','json',str(VIDEO)]))
audio=subprocess.check_output([str(FF),'-v','error','-i',str(VIDEO),'-vn','-c:a','pcm_s16le','-f','wav','pipe:1'])
with wave.open(io.BytesIO(audio)) as w:
    data=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
    audio_report={'sampleRate':w.getframerate(),'channels':w.getnchannels(),'rms':float(np.sqrt(np.mean(data**2))),'peak':float(np.max(np.abs(data))),'clippedSamples':int(np.sum(np.abs(data)>=.999))}
with wave.open(str(ROOT/'video/assets/audio/voice-normalized.wav')) as w:
    reference=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2).mean(axis=1)/32768
mixed=data.reshape(-1,2).mean(axis=1);ref=reference[::48];mix=mixed[::48]
correlations={}
for lag in range(-20,21):
    a=ref[max(0,-lag):];b=mix[max(0,lag):];length=min(len(a),len(b))
    correlations[lag]=float(np.corrcoef(a[:length],b[:length])[0,1])
best=max(correlations,key=correlations.get)
audio_report.update(voiceAlignmentOffsetMs=best,voiceCorrelation=correlations[best])
pixels=subprocess.check_output([str(FF),'-v','error','-i',str(VIDEO),'-an','-vf','scale=32:56','-pix_fmt','rgb24','-c:v','rawvideo','-f','image2pipe','pipe:1'])
frames=np.frombuffer(pixels,dtype=np.uint8).reshape(-1,56,32,3);means=frames.mean(axis=(1,2,3))
black_report={'decodedFrames':len(frames),'blackFramesBelowMean8':int(np.sum(means<8)),'minimumMeanBrightness':float(means.min())}
subprocess.run([str(FF),'-v','error','-i',str(VIDEO),'-c:v','libx264','-preset','ultrafast','-c:a','aac','-f','null','-'],check=True)
result=subprocess.run([str(FF),'-v','info','-i',str(VIDEO),'-vn','-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-c:a','pcm_s16le','-f','null','-'],capture_output=True,text=True,check=True)
stderr=result.stderr;last=stderr.rfind('{');end=stderr.find('}',last)
audio_report['loudness']=json.loads(stderr[last:end+1])
report={'probe':probe,'audio':audio_report,'blackFrames':black_report,'representativeFrames':times,'decodeCheck':'passed'}
(OUT/'technical-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({'duration':probe['format']['duration'],'size':probe['format']['size'],'audio':audio_report,'blackFrames':black_report,'decodeCheck':'passed'},indent=2))
