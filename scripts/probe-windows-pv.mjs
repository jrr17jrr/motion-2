// Timing cross-check: transcribe short isolated windows of the narration so we can
// see which words really fall inside each window (independent of whisper's
// token timestamps). Usage: node scripts/probe-windows-pv.mjs "a-b,a-b,..." (seconds)
import {transcribe} from '@remotion/install-whisper-cpp';
import {execFileSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

const ff = resolve('node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const folder = resolve('.cache/whisper');
mkdirSync('.cache/pv/win', {recursive: true});
const wins = process.argv[2].split(',').map((x) => x.split('-').map(Number));
for (const [a, b] of wins) {
	const out = resolve(`.cache/pv/win/${a}-${b}.wav`);
	// 0.4 s of silence each side helps whisper with very short clips
	execFileSync(ff, ['-v', 'error', '-y', '-ss', String(a), '-to', String(b), '-i', resolve('.cache/pv/audio16k.wav'),
		'-af', 'adelay=400,apad=pad_dur=0.4', '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', out]);
	const r = await transcribe({whisperPath: folder, whisperCppVersion: '1.5.5', model: process.argv[3] ?? 'medium', inputPath: out, language: 'pt', additionalArgs: ['-t', '6']});
	console.log(`${a.toFixed(2)}-${b.toFixed(2)}: ${r.transcription.map((s) => s.text).join(' ').trim()}`);
}
