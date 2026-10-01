import {installWhisperCpp, downloadWhisperModel, transcribe} from '@remotion/install-whisper-cpp';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';

mkdirSync('.cache', {recursive:true});
const folder=resolve('.cache/whisper');
await installWhisperCpp({to:folder,version:'1.5.5'});
await downloadWhisperModel({model:'small',folder});
if(!existsSync('.cache/source-audio.wav')) execFileSync(resolve('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe'), ['-v','error','-i','video/0.mp4','-vn','-ar','16000','-ac','1','-c:a','pcm_s16le','-n','.cache/source-audio.wav']);
const result=await transcribe({whisperPath:folder,whisperCppVersion:'1.5.5',model:'small',inputPath:resolve('.cache/source-audio.wav'),language:'pt',tokenLevelTimestamps:true,additionalArgs:['-t','4']});
writeFileSync('.cache/transcription.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result.transcription,null,2));
