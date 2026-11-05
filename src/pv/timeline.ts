// Plano Visionario — timing source of truth.
//
// Word onsets (ms) come from whisper.cpp word-level transcription of the real
// narration (scripts/transcribe-pv.mjs, model "medium"). The "small" model ran
// up to ~450 ms late between 12 s and 25 s; isolated-window transcriptions
// (scripts/probe-windows-pv.mjs) confirmed the medium timings, e.g. "você paga
// seiscentos…" lies entirely before 23.95 s and "por quatrocentos" after 17.05 s. The spoken text wins over the
// written script wherever they differ (e.g. "você conta com", "chame no WhatsApp").
//
// Original cuts/transitions measured by frame difference (scripts/analyze-pv.py):
// ~5.6s, 12.1s, 14.63s, 19.0s, 21.6s, 26.1s, 29.33s, 32.4s. They live inside the
// source video and are never touched; zooms are reset under those cuts.

export const FPS = 30;
export const SOURCE_FRAMES = 1123; // 37.454 s @ 30 fps (nb_frames of the original)
export const DURATION = SOURCE_FRAMES;
export const SOURCE = 'plano-visionario-work/source-sdr.mp4';

export const ms = (t: number) => Math.round((t * FPS) / 1000);
/** Captions appear a hair before the syllable, as in broadcast subtitling. */
export const LEAD = 2;

export type Size = 'sm' | 'md' | 'lg' | 'xl';
export type Word = {t: string; at: number}; // at = ms
export type Line = {size: Size; words: Word[]; color?: 'white' | 'cyan'; upper?: boolean};
export type Variant = 'rise' | 'blur' | 'wipe' | 'title';
export type Card = {
	id: string;
	lines: Line[];
	variant: Variant;
	/** optional explicit end (ms); default = start of next card */
	until?: number;
	/** vertical centre of the block in px (1920 tall frame) */
	y?: number;
};

const w = (t: string, at: number): Word => ({t, at});

// ---------- caption cards (one hierarchy on screen at a time) ----------
export const cards: Card[] = [
	{id: 'empresario', variant: 'rise', lines: [{size: 'lg', words: [w('Empresário,', 200)]}]},
	{
		id: 'mais-clientes',
		variant: 'blur',
		lines: [
			{size: 'sm', words: [w('quer', 810), w('atrair', 1120)]},
			{size: 'xl', color: 'cyan', upper: true, words: [w('mais', 1560), w('clientes', 1860)]},
		],
	},
	{
		id: 'empresa',
		variant: 'rise',
		lines: [
			{size: 'sm', words: [w('para', 2460), w('sua', 2760)]},
			{size: 'lg', words: [w('empresa?', 3000)]},
		],
		until: 3700,
	},
	{
		id: 'plano',
		variant: 'title',
		lines: [
			{size: 'sm', words: [w('Conheça', 3780), w('o', 4410)]},
			{size: 'xl', color: 'cyan', upper: true, words: [w('Plano', 4430), w('Visionário', 4890)]},
		],
	},
	{
		id: 'separadamente',
		variant: 'wipe',
		lines: [
			{size: 'sm', words: [w('Contratando', 5620)]},
			{size: 'lg', words: [w('separadamente,', 6330)]},
		],
	},
	{id: 'conta-com', variant: 'rise', lines: [{size: 'md', words: [w('você', 7310), w('conta', 7590), w('com o', 7900)]}]},
];

// ---------- service price cards ----------
export type PriceAnim = 'rise' | 'mask' | 'pop';
export type Service = {
	id: string;
	label: Word[]; // cyan label, appears word by word
	sub?: Word[]; // small detail line
	priceAt: number; // ms of "R$"
	value: string;
	perMonth: boolean;
	perMonthAt?: number;
	anim: PriceAnim;
	start: number;
	end: number;
};
export const services: Service[] = [
	{
		id: 'site',
		label: [w('Site', 8130), w('profissional', 8360)],
		sub: [w('a partir de', 9320)],
		priceAt: 10000,
		value: '250',
		perMonth: false,
		anim: 'rise',
		start: 8130,
		end: 12040,
	},
	{
		id: 'trafego',
		label: [w('Tráfego', 12040), w('pago', 12480)],
		priceAt: 12870,
		value: '500',
		perMonth: true,
		perMonthAt: 13920,
		anim: 'mask',
		start: 12040,
		end: 14580,
	},
	{
		id: 'instagram',
		label: [w('Gestão de', 14580), w('Instagram', 15130)],
		sub: [w('com 2 posts', 15690), w('semanais', 16430)],
		priceAt: 17090,
		value: '400',
		perMonth: true,
		perMonthAt: 18260,
		anim: 'pop',
		start: 14580,
		end: 18980,
	},
];

// ---------- the comparison (most important block) ----------
export const compare = {
	introStart: 18980, // "Tudo isso soma"
	intro: [w('Tudo', 18980), w('isso', 19250), w('soma', 19520)],
	oldAt: 19780, // "R$" — 1.150 starts counting
	oldCountEnd: 21000, // lands while "...cinquenta" is spoken
	strikeAt: 21540, // "Mas"
	oldExit: 22300,
	mas: [w('Mas', 21540), w('no', 21770)],
	plano: [w('Plano', 21950), w('Visionário,', 22300)],
	vocePaga: [w('você', 23290), w('paga', 23670)],
	newAt: 23970, // "R$" of 697
	newCountEnd: 24600,
	perMonthAt: 25410, // "mensais"
	newShrink: 26060, // "E ainda ganha" starts: 697 steps up, stays as a badge
	newExit: 27700,
};

export const bonus: Card[] = [
	{
		id: 'ainda-ganha',
		variant: 'rise',
		lines: [{size: 'md', words: [w('E', 26060), w('ainda', 26130), w('ganha,', 26490)]}],
	},
	{
		id: 'primeiro-mes',
		variant: 'blur',
		lines: [
			{size: 'sm', words: [w('no', 26840)]},
			{size: 'xl', color: 'cyan', upper: true, words: [w('primeiro', 27070), w('mês', 27530)]},
		],
	},
	{
		id: 'motion',
		variant: 'wipe',
		lines: [
			{size: 'sm', words: [w('um', 27850), w('vídeo', 28000)]},
			{size: 'xl', color: 'cyan', upper: true, words: [w('Motion', 28420), w('Design', 28850)]},
		],
		until: 29370,
	},
	{
		id: 'ou-se-preferir',
		variant: 'rise',
		lines: [{size: 'md', words: [w('ou,', 29370), w('se', 29600), w('preferir,', 29730)]}],
	},
	{
		id: 'modelo',
		variant: 'blur',
		lines: [
			{size: 'sm', words: [w('com a', 30490)]},
			{size: 'xl', color: 'cyan', upper: true, words: [w('nossa', 30680), w('modelo', 30940)]},
		],
	},
	{
		id: 'escolhe',
		variant: 'rise',
		lines: [
			{size: 'sm', words: [w('Você', 31560)]},
			{size: 'lg', words: [w('escolhe!', 31860)]},
		],
		until: 32450,
	},
	{id: 'aproveitar', variant: 'rise', lines: [{size: 'lg', words: [w('Quer', 32480), w('aproveitar?', 32740)]}]},
	{
		id: 'clique',
		variant: 'wipe',
		lines: [
			{size: 'sm', words: [w('Clique', 33480), w('no', 33790)]},
			{size: 'lg', words: [w('link', 33890), w('abaixo,', 34110)]},
		],
	},
	{
		id: 'bio',
		variant: 'rise',
		lines: [
			{size: 'sm', words: [w('acesse', 34460), w('o', 34840), w('nosso', 34890)]},
			{size: 'lg', words: [w('link', 35210), w('na', 35460), w('bio', 35580)]},
		],
	},
];

export const cta = {
	start: 35890, // "e chame"
	words: [w('e', 35890), w('chame', 35940), w('no', 36230), w('WhatsApp', 36300)],
};

// ---------- camera: only three gentle pushes ----------
// [startFrame, peakFrame, holdUntilFrame, releaseFrame, scale, originY%]
export type Push = {from: number; peak: number; hold: number; release: number; scale: number; originY: number};
export const pushes: Push[] = [
	// hook "mais clientes": eased in, released under the original transition at ~5.6 s
	{from: 40, peak: 100, hold: 150, release: 170, scale: 1.04, originY: 32},
	// "Tudo isso soma 1.150": reset exactly on the original cut at 21.6 s (frame 648)
	{from: 572, peak: 640, hold: 647, release: 648, scale: 1.03, originY: 34},
	// R$ 697: reset on the original cut at 26.1 s (frame 783)
	{from: 714, peak: 752, hold: 782, release: 783, scale: 1.045, originY: 34},
];

// ---------- sound effects (sparse; voice stays in front) ----------
// at = frame where the *audible peak* should land; offset = peak offset of the file (frames)
export type Sfx = {file: string; at: number; volume: number};
const peakOffset: Record<string, number> = {
	'pop-soft': 0,
	'pop-round': 0,
	'whoosh-short': 5,
	'whoosh-down': 6,
	'price-hit': 0,
	'count-tick': 0,
	slash: 0,
	'impact-big': 0,
	'rise-air': 13,
	chime: 3,
};
const s = (file: string, atMs: number, volume: number): Sfx => ({file, at: ms(atMs) - peakOffset[file], volume});
export const sfx: Sfx[] = [
	s('pop-soft', 1560, 0.14), // MAIS CLIENTES
	s('whoosh-short', 4430, 0.17), // PLANO VISIONÁRIO
	s('price-hit', services[0].priceAt + 30, 0.12), // R$ 250
	s('whoosh-short', services[1].priceAt, 0.15), // R$ 500
	s('pop-round', services[2].priceAt + 30, 0.12), // R$ 400
	s('price-hit', compare.oldAt + 30, 0.14), // R$ 1.150 lands on screen
	s('count-tick', compare.oldAt + 80, 0.1), // count-up texture
	s('slash', compare.strikeAt + 70, 0.26), // strike line
	s('whoosh-down', compare.oldExit, 0.12), // old price leaves
	s('whoosh-short', compare.newAt - 30, 0.15), // 697 swoosh in
	s('impact-big', compare.newAt + 100, 0.2), // 697 impact, on the spring's landing
	s('pop-soft', 27070, 0.09), // PRIMEIRO MÊS
	s('whoosh-short', 28420, 0.13), // MOTION DESIGN
	s('pop-round', 30680, 0.12), // NOSSA MODELO
	s('chime', 36300, 0.19), // CHAME NO WHATSAPP
];

export const toFrame = (atMs: number) => Math.max(0, ms(atMs) - LEAD);
