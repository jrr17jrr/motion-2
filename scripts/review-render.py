"""Extract representative final-render frames and check decoded audio."""
import subprocess,json,math,wave,io
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np

ROOT=Path(__file__).resolve().parent.parent
FF=ROOT/'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'
PROBE=FF.with_name('ffprobe.exe')
VIDEO=ROOT/'out/otica-descontao-motion-v2.mp4'
OUT=ROOT/'.cache/final-review'
OUT.mkdir(parents=True,exist_ok=True)
probe=json.loads(subprocess.check_output([str(PROBE),'-v','error','-show_streams','-show_format','-of','json',str(VIDEO)]))
times=[0,.8,1.9,2.35,2.85,3.8,4.7,6.8,8.9,9.55,10.7,12.2,14.5,15.6,17.2,18.7,19.9,20.7]
canvas=Image.new('RGB',(360*6,680*3),'#222')
draw=ImageDraw.Draw(canvas)
for i,t in enumerate(times):
    target=OUT/f'frame-{t:.2f}.png'
    if not target.exists():
        subprocess.run([str(FF),'-v','error','-ss',str(t),'-i',str(VIDEO),'-frames:v','1','-n',str(target)],check=True)
    im=Image.open(target).convert('RGB')
    thumb=im.resize((360,640))
    x=(i%6)*360;y=(i//6)*680
    canvas.paste(thumb,(x,y));draw.text((x+12,y+647),f'{t:.2f}s',fill='white')
canvas.save(OUT/'contact.png')
audio=subprocess.check_output([str(FF),'-v','error','-i',str(VIDEO),'-vn','-c:a','pcm_s16le','-f','wav','pipe:1'])
with wave.open(io.BytesIO(audio)) as w:
    data=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
    audio_report={'sampleRate':w.getframerate(),'channels':w.getnchannels(),'rms':float(np.sqrt(np.mean(data**2))),'peak':float(np.max(np.abs(data))),'clippedSamples':int(np.sum(np.abs(data)>=.999))}
with wave.open(str(ROOT/'video/assets/audio/voice-normalized.wav')) as w:
    reference=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2).mean(axis=1)/32768
mixed=data.reshape(-1,2).mean(axis=1)
ref=reference[::48];mix=mixed[::48]
correlations={}
for lag in range(-20,21):
    a=ref[max(0,-lag):];b=mix[max(0,lag):];length=min(len(a),len(b))
    correlations[lag]=float(np.corrcoef(a[:length],b[:length])[0,1])
best=max(correlations,key=correlations.get)
audio_report['voiceAlignmentOffsetMs']=best
audio_report['voiceCorrelation']=correlations[best]
pixels=subprocess.check_output([str(FF),'-v','error','-i',str(VIDEO),'-an','-vf','scale=32:56','-pix_fmt','rgb24','-c:v','rawvideo','-f','image2pipe','pipe:1'])
frames=np.frombuffer(pixels,dtype=np.uint8).reshape(-1,56,32,3)
means=frames.mean(axis=(1,2,3))
black_report={'decodedFrames':len(frames),'blackFramesBelowMean8':int(np.sum(means<8)),'minimumMeanBrightness':float(means.min())}
subprocess.run([str(FF),'-v','error','-i',str(VIDEO),'-c:v','libx264','-preset','ultrafast','-c:a','aac','-f','null','-'],check=True)
report={'probe':probe,'audio':audio_report,'blackFrames':black_report,'representativeFrames':times,'decodeCheck':'passed'}
(OUT/'technical-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps({'duration':probe['format']['duration'],'size':probe['format']['size'],'audio':audio_report,'blackFrames':black_report,'decodeCheck':'passed'},indent=2))
