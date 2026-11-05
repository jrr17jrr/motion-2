// Plano Visionario V2 — sound design only. Visuals/timings are V1's, untouched.
//
// Every event lands its *audible peak* (manifest peakMs) on the frame where the
// matching animation happens in PlanoVisionario.tsx (word appear frame =
// toFrame(word) ; prices = toFrame(priceAt) ; counters/strike from `compare`).
//
// Per-event gains are set individually. On top of that each effect is ducked
// while the narration is loud (voice-level.json = per-frame level of the original
// audio in dB re. its peak), so an effect landing on a stressed syllable is
// momentarily reduced instead of masking the word.
import {compare, ms, services, toFrame} from './timeline';
import voiceLevel from './voice-level.json';
import manifest from '../../video/assets/pv/sfx-v2/manifest.json';

export type SfxV2 = {file: keyof typeof manifest; from: number; volume: number; duck: number; why: string};

const peakFrames = (file: keyof typeof manifest) => Math.round((manifest[file].peakMs * 30) / 1000);
/** schedule `file` so its peak lands on frame `at` */
const at = (file: keyof typeof manifest, frame: number, volume: number, why: string, duck = 0.6): SfxV2 => ({
	file,
	from: frame - peakFrames(file),
	volume,
	duck,
	why,
});
/** schedule `file` to *start* on frame `frame` (used for the count roll, which follows the counter curve) */
const start = (file: keyof typeof manifest, frame: number, volume: number, why: string, duck = 0.6): SfxV2 => ({
	file,
	from: frame,
	volume,
	duck,
	why,
});

const maisF = toFrame(1560); // "MAIS" appears (frame 45)
const planoF = toFrame(4430); // "PLANO" appears (131)
const ruleF = toFrame(4890) + 4; // cyan rule under the title starts drawing (149)
const [site, trafego, insta] = services.map((s) => toFrame(s.priceAt)); // 298, 384, 511
const oldF = toFrame(compare.oldAt); // 1.150 appears + count starts (591)
const oldLand = ms(compare.oldCountEnd); // count reaches 1.150 (630)
const strikeF = ms(compare.strikeAt); // red line cuts (646 → 651)
const oldExitF = ms(compare.oldExit); // old price leaves (669 → 679)
const newF = toFrame(compare.newAt); // 697 enters (717)
const newLand = ms(compare.newCountEnd); // count reaches 697 (738)

export const sfxV2: SfxV2[] = [
	at('hook-hit', maisF + 1, 0.5, 'MAIS CLIENTES — pequeno impacto na entrada'),
	at('title-swoosh', planoF + 1, 0.36, 'PLANO VISIONÁRIO — swoosh na entrada do título'),
	at('title-pop', ruleF + 1, 0.3, 'PLANO VISIONÁRIO — pop quando a linha ciano é desenhada'),
	at('price-blip', site + 3, 0.11, 'R$ 250 — blip digital subindo'),
	at('price-click', trafego + 2, 0.6, 'R$ 500 — clique duplo'),
	at('price-pop', insta + 2, 0.55, 'R$ 400 — pop com brilho'),
	start('count-roll', oldF, 0.6, 'R$ 1.150 — ticks seguindo a curva da contagem'),
	at('count-land', oldLand, 0.5, 'R$ 1.150 — impacto discreto quando chega ao valor'),
	at('strike-slash', strikeF + 1, 0.6, 'R$ 1.150 riscado — corte mais perceptível', 0.75),
	at('exit-swoosh', oldExitF + 4, 0.3, 'R$ 1.150 sai'),
	at('offer-rise', newF, 0.28, 'R$ 697 — subida que leva à entrada'),
	at('offer-impact', newF + 1, 0.42, 'R$ 697 — peso na entrada'),
	// The bell ("ching") lands in the narration gap at frame 736, two frames before
	// the counter settles on 697 (frame 738): the payment "confirms" the offer.
	{...at('cash-register', newLand - 2, 0.4, 'R$ 697 — caixa registradora + moedas (destaque principal)', 0.8), from: newLand - 2 - Math.round((manifest['cash-register'].bellMs * 30) / 1000)},
	at('bonus-sparkle', toFrame(27070) + 1, 0.34, 'PRIMEIRO MÊS — brilho de presente'),
	at('bonus-swoosh', toFrame(28420) + 1, 0.3, 'MOTION DESIGN — swoosh'),
	at('bonus-pop', toFrame(30680) + 1, 0.6, 'NOSSA MODELO — pop'),
	at('cta-rise', toFrame(35940), 0.3, 'CHAME — entrada suave'),
	at('cta-hit', toFrame(36300) + 1, 0.48, 'WHATSAPP — impacto + chime final'),
];

const level = voiceLevel as number[];
/**
 * Volume curve for an event: base gain × duck(voice). Voice ≥ −8 dB re. peak →
 * gain × duck; voice ≤ −22 dB → full gain; linear in between.
 */
export const volumeFor = (e: SfxV2) => (f: number) => {
	const g = e.from + f;
	// ±2-frame average: avoids per-frame "zipper" steps on long tails
	let sum = 0;
	for (let d = -2; d <= 2; d++) sum += level[Math.min(level.length - 1, Math.max(0, g + d))] ?? -40;
	const v = sum / 5;
	const k = Math.min(1, Math.max(0, (v + 22) / 14));
	return e.volume * (1 - k * (1 - e.duck));
};
