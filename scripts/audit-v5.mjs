import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {stripTypeScriptTypes} from 'node:module';
import {pathToFileURL} from 'node:url';
const out=resolve('.cache/v5-analysis/compiled');
for(const name of ['src/media/captions.ts','src/v5/timeline.ts','src/v5/direction.ts']){
 const target=resolve(out,name.replace(/\.ts$/,'.mjs'));mkdirSync(dirname(target),{recursive:true});
 const code=stripTypeScriptTypes(readFileSync(name,'utf8')).replace(/from '(\.\.?\/[^']+)'/g,(_,path)=>`from '${path}.mjs'`);
 writeFileSync(target,code);
}
const direction=await import(pathToFileURL(resolve(out,'src/v5/direction.mjs')).href);
const timeline=await import(pathToFileURL(resolve(out,'src/v5/timeline.mjs')).href);
const audio=JSON.parse(readFileSync('video/assets/v5/audio-manifest.json','utf8'));
const cues=direction.cues.map(c=>{
 const file=audio.sfx.find(s=>s.file===c.file);
 return {...c,waveformPeakOffsetMs:file.peakOffsetMs,audioPeakFrame:c.frame+Math.floor(file.peakOffsetMs/1000*30)};
});
const impacts=direction.punches.map(p=>{
 const target=p.start+direction.springPeak;
 const c=cues.find(c=>c.frame===target&&/impact|pop/.test(c.file));
 if(!c||c.audioPeakFrame!==target)throw new Error(`Missing aligned impact at frame ${target}`);
 return {wordFrame:p.start,visualPeakFrame:target,audioPeakFrame:c.audioPeakFrame,file:c.file};
});
let maxScale=0,minScale=9;for(let f=0;f<timeline.duration;f++){const c=direction.camera(f);maxScale=Math.max(maxScale,c.scale);minScale=Math.min(minScale,c.scale);}
const report={springPeakOffsetFrames:direction.springPeak,impacts,cues,cameraScaleRange:[minScale,maxScale],phoneVisibleFrames:timeline.duration-timeline.wordFrame(35),durationFrames:timeline.duration};
writeFileSync('video/assets/v5/cue-manifest.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
