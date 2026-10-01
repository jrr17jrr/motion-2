"""Temporal presenter mattes derived from the intact source. RVM ONNX CPU."""
import sys,subprocess,time,json
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/'.cache/python-v3'))
import numpy as np
import onnxruntime as ort
from PIL import Image

FF=ROOT/'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'
OUT=ROOT/'video/assets/v3/mattes'
OUT.mkdir(parents=True,exist_ok=True)
options=ort.SessionOptions();options.intra_op_num_threads=4;options.inter_op_num_threads=1
session=ort.InferenceSession(str(ROOT/'.cache/models/rvm_mobilenetv3_fp32.onnx'),options,providers=['CPUExecutionProvider'])
rec=[np.zeros((1,1,1,1),dtype=np.float32) for _ in range(4)]
process=subprocess.Popen([str(FF),'-v','error','-i',str(ROOT/'video/0.mp4'),'-an','-r','30','-t','11.7','-pix_fmt','rgb24','-c:v','rawvideo','-f','image2pipe','pipe:1'],stdout=subprocess.PIPE)
size=720*1280*3;index=0;start=time.time();written=[]
def read_exact(count):
    buf=bytearray()
    while len(buf)<count:
        block=process.stdout.read(count-len(buf))
        if not block:return None
        buf.extend(block)
    return bytes(buf)
while True:
    raw=read_exact(size)
    if raw is None:break
    rgb=np.frombuffer(raw,dtype=np.uint8).reshape(1280,720,3)
    # Reset temporal states at the existing camera cut; never bridge unrelated shots.
    if index==171:rec=[np.zeros((1,1,1,1),dtype=np.float32) for _ in range(4)]
    src=np.transpose(rgb.astype(np.float32)/255,(2,0,1))[None]
    _,alpha,*rec=session.run(None,dict(src=src,r1i=rec[0],r2i=rec[1],r3i=rec[2],r4i=rec[3],downsample_ratio=np.array([.375],np.float32)))
    if 47<=index<=167 or 247<=index<=342:
        a=np.clip(alpha[0,0]*255,0,255).astype(np.uint8)
        rgba=np.dstack([rgb,a])
        path=OUT/f'presenter-{index:04d}.webp'
        Image.fromarray(rgba).save(path,format='WEBP',quality=94,method=3)
        written.append(index)
        if index in [63,82,103,134,266,290,315]:
            preview=Image.new('RGB',(720,1280),'#F57928');preview.paste(Image.fromarray(rgba),(0,0),Image.fromarray(a))
            preview.save(ROOT/f'.cache/matte-test-{index}.png')
    if index%30==0:print(f'Matte frame {index}, elapsed {time.time()-start:.1f}s',flush=True)
    index+=1
process.wait()
if process.returncode:raise RuntimeError('FFmpeg extraction failed')
(ROOT/'video/assets/v3/matte-manifest.json').write_text(json.dumps({'fps':30,'frames':written,'source':'video/0.mp4','model':'RVM MobileNetV3 FP32','downsampleRatio':.375},indent=2))
print(f'Wrote {len(written)} temporal mattes.',flush=True)
