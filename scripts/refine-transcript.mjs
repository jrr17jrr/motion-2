import {downloadWhisperModel,transcribe} from '@remotion/install-whisper-cpp';
import {resolve} from 'node:path';
import {writeFileSync} from 'node:fs';
const folder=resolve('.cache/whisper');
await downloadWhisperModel({model:'medium',folder});
const result=await transcribe({whisperPath:folder,whisperCppVersion:'1.5.5',model:'medium',inputPath:resolve('.cache/source-audio.wav'),language:'pt',tokenLevelTimestamps:true,additionalArgs:['-t','4'],printOutput:false});
writeFileSync('.cache/transcription-medium.json',JSON.stringify(result,null,2));
console.log(result.transcription.map(x=>x.text).join(''));
