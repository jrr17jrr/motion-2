// Word-level transcription of the Plano Visionario narration (whisper.cpp via Remotion).
// Input: .cache/pv/audio16k.wav (extracted from the original .mov with FFmpeg).
import {installWhisperCpp, downloadWhisperModel, transcribe} from '@remotion/install-whisper-cpp';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const folder = resolve('.cache/whisper');
const model = process.argv[2] ?? 'medium';
await installWhisperCpp({to: folder, version: '1.5.5'});
await downloadWhisperModel({model, folder});
const result = await transcribe({
	whisperPath: folder,
	whisperCppVersion: '1.5.5',
	model,
	inputPath: resolve('.cache/pv/audio16k.wav'),
	language: 'pt',
	tokenLevelTimestamps: true,
	splitOnWord: true,
	additionalArgs: ['-t', '6'],
});
writeFileSync(`.cache/pv/transcription-${model}.json`, JSON.stringify(result, null, 2));
for (const seg of result.transcription) {
	console.log(seg.offsets.from, seg.offsets.to, seg.text);
}
