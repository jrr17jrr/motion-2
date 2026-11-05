import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Easing,
	Img,
	OffthreadVideo,
	Sequence,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {
	Card,
	Line,
	Service,
	Size,
	bonus,
	cards,
	compare,
	cta,
	ms,
	pushes,
	services,
	sfx,
	toFrame,
	SOURCE,
	Variant,
} from '../pv/timeline';

// Palette requested for the Plano Visionario edit.
export const WHITE = '#FFFFFF';
export const CYAN = '#00E1FF';
export const RED = '#FF555D';
export const GREEN = '#36E58D';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SHADOW = '0 3px 12px rgba(0,0,0,.42), 0 1px 3px rgba(0,0,0,.55)';
const MAX_W = 930;

// Vertical anchors (1920-tall frame). The model's face sits between y≈380 and
// y≈780 in every shot, and Reels/Meta UI covers the bottom ≈ 20 %. Text lives
// on the torso, below the chin.
const Y_CAPTION = 1110;
const Y_PRICE = 965;
const Y_UNDER = 1175;

const BASE: Record<Size, number> = {sm: 60, md: 96, lg: 114, xl: 136};
// Denser shadow for coloured prices: red/green over the burgundy blouse needs it.
const PRICE_SHADOW = '0 4px 14px rgba(0,0,0,.6), 0 0 30px rgba(0,0,0,.35), 0 1px 3px rgba(0,0,0,.7)';
const fit = (text: string, size: number, upper?: boolean) => {
	const est = text.length * size * (upper ? 0.74 : 0.6);
	return est > MAX_W ? Math.floor((size * MAX_W) / est) : size;
};

const ease = (f: number, a: number, b: number, from = 0, to = 1, e = Easing.out(Easing.cubic)) =>
	interpolate(f, [a, b], [from, to], {...clamp, easing: e});

// ------------------------------------------------------------------ words
const WordView: React.FC<{text: string; appear: number; size: number; variant: Variant; key_: boolean; color: string; upper?: boolean}> = ({
	text,
	appear,
	size,
	variant,
	key_,
	color,
	upper,
}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const age = f - appear;
	const visible = age >= 0;
	const p = spring({frame: age, fps, config: {damping: 200, stiffness: 220, mass: 0.6}});
	// key words get a little overshoot ("ligeiramente mais forte")
	const pop = key_ ? spring({frame: age, fps, config: {damping: 13, stiffness: 190, mass: 0.7}}) : p;
	let transform = '';
	let filter = '';
	let clipPath: string | undefined;
	let letterSpacing = upper ? '-0.01em' : '-0.025em';
	if (variant === 'rise') transform = `translateY(${(1 - p) * 26}px)`;
	if (variant === 'blur') filter = `blur(${(1 - p) * 9}px)`;
	if (variant === 'wipe') {
		clipPath = `inset(-20% ${(1 - p) * 100}% -20% -5%)`;
		transform = `translateX(${(1 - p) * -18}px)`;
	}
	if (variant === 'title') {
		filter = `blur(${(1 - p) * 12}px)`;
		if (key_) letterSpacing = `${interpolate(p, [0, 1], [0.22, -0.01])}em`;
	}
	if (key_) transform += ` scale(${0.78 + 0.22 * pop})`;
	else transform += ` scale(${0.94 + 0.06 * p})`;
	return (
		<span
			style={{
				display: 'inline-block',
				margin: `0 ${size * 0.13}px`,
				fontSize: size,
				color,
				opacity: visible ? Math.min(1, p * 2.2) : 0,
				transform,
				transformOrigin: '50% 75%',
				filter: filter || undefined,
				clipPath,
				letterSpacing,
				textTransform: upper ? 'uppercase' : undefined,
				whiteSpace: 'nowrap',
			}}
		>
			{text}
		</span>
	);
};

const LineView: React.FC<{line: Line; variant: Variant}> = ({line, variant}) => {
	const text = line.words.map((x) => x.t).join(' ');
	const size = fit(text, BASE[line.size], line.upper);
	const key_ = line.size === 'xl' || line.color === 'cyan';
	return (
		<div style={{lineHeight: 1.02, fontWeight: line.size === 'sm' ? 700 : 800, marginBottom: line.size === 'sm' ? 4 : 0}}>
			{line.words.map((wd, i) => (
				<WordView
					key={i}
					text={wd.t}
					appear={toFrame(wd.at)}
					size={size}
					variant={variant}
					key_={key_}
					color={line.color === 'cyan' ? CYAN : WHITE}
					upper={line.upper}
				/>
			))}
		</div>
	);
};

/** Shared exit: quick lift + blur so groups hand over smoothly. */
const exitStyle = (f: number, end: number): React.CSSProperties => {
	const x = ease(f, end - 4, end, 0, 1, Easing.in(Easing.quad));
	return {opacity: 1 - x, transform: `translateY(${-14 * x}px)`, filter: x > 0 ? `blur(${x * 5}px)` : undefined};
};

const CardView: React.FC<{card: Card; end: number}> = ({card, end}) => {
	const f = useCurrentFrame();
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				top: card.y ?? Y_CAPTION,
				textAlign: 'center',
				transform: 'translateY(-50%)',
			}}
		>
			<div style={exitStyle(f, end)}>
				{card.lines.map((l, i) => (
					<LineView key={i} line={l} variant={card.variant} />
				))}
				{card.variant === 'title' ? <TitleRule card={card} /> : null}
			</div>
		</div>
	);
};

/** Thin cyan rule drawn under "PLANO VISIONÁRIO" once the title has landed. */
const TitleRule: React.FC<{card: Card}> = ({card}) => {
	const f = useCurrentFrame();
	const last = card.lines[card.lines.length - 1].words.slice(-1)[0];
	const a = toFrame(last.at) + 4;
	const p = ease(f, a, a + 10);
	return (
		<div
			style={{
				margin: '14px auto 0',
				height: 6,
				width: 380,
				borderRadius: 3,
				background: CYAN,
				boxShadow: '0 0 14px rgba(0,225,255,.55)',
				transform: `scaleX(${p})`,
				opacity: p,
			}}
		/>
	);
};

// ------------------------------------------------------------------ prices
const Money: React.FC<{value: React.ReactNode; size: number; color: string; suffix?: React.ReactNode; glow?: string}> = ({
	value,
	size,
	color,
	suffix,
	glow,
}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'flex-start',
			color,
			fontWeight: 800,
			lineHeight: 0.92,
			textShadow: glow ? `${PRICE_SHADOW}, ${glow}` : PRICE_SHADOW,
			fontVariantNumeric: 'tabular-nums',
			whiteSpace: 'nowrap',
		}}
	>
		<span style={{fontSize: size * 0.4, marginTop: size * 0.1, marginRight: size * 0.06, letterSpacing: '-0.02em'}}>R$</span>
		<span style={{fontSize: size, letterSpacing: '-0.045em'}}>{value}</span>
		{suffix}
	</div>
);

const PerMonth: React.FC<{size: number; appear: number; color: string}> = ({size, appear, color}) => {
	const f = useCurrentFrame();
	const p = ease(f, appear, appear + 7);
	return (
		<span
			style={{
				fontSize: size * 0.34,
				alignSelf: 'flex-end',
				marginBottom: size * 0.1,
				marginLeft: size * 0.05,
				color,
				opacity: p,
				transform: `translateX(${(1 - p) * -16}px)`,
				display: 'inline-block',
				letterSpacing: '-0.02em',
			}}
		>
			/mês
		</span>
	);
};

const ServiceCard: React.FC<{svc: Service}> = ({svc}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const end = ms(svc.end) - 1;
	const priceF = toFrame(svc.priceAt);
	const age = f - priceF;
	const SIZE = 168;
	let priceStyle: React.CSSProperties = {};
	let wrapStyle: React.CSSProperties = {};
	if (svc.anim === 'rise') {
		// from below, soft scale
		const p = spring({frame: age, fps, config: {damping: 16, stiffness: 150, mass: 0.8}});
		priceStyle = {transform: `translateY(${(1 - p) * 110}px) scale(${0.82 + 0.18 * p})`, opacity: age < 0 ? 0 : Math.min(1, p * 2)};
	} else if (svc.anim === 'mask') {
		// emerges from behind an invisible baseline
		const p = spring({frame: age, fps, config: {damping: 200, stiffness: 170, mass: 0.7}});
		wrapStyle = {clipPath: 'inset(-10% -20% 0 -20%)'};
		priceStyle = {transform: `translateY(${(1 - p) * 105}%)`, opacity: age < 0 ? 0 : 1};
	} else {
		// pop with blur, slight overshoot
		const p = spring({frame: age, fps, config: {damping: 11, stiffness: 200, mass: 0.6}});
		priceStyle = {transform: `scale(${0.55 + 0.45 * p})`, filter: `blur(${Math.max(0, 1 - p) * 10}px)`, opacity: age < 0 ? 0 : Math.min(1, p * 2)};
	}
	const label: Line = {size: 'lg', color: 'cyan', upper: true, words: svc.label};
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: Y_CAPTION - 40, transform: 'translateY(-50%)', textAlign: 'center'}}>
			<div style={exitStyle(f, end)}>
				<LineView line={{...label, size: 'md'}} variant="wipe" />
				{svc.sub ? <LineView line={{size: 'sm', words: svc.sub}} variant="rise" /> : null}
				<div style={{...wrapStyle, marginTop: 10, display: 'inline-block', paddingTop: 6}}>
					<div style={{...priceStyle, transformOrigin: '50% 80%'}}>
						<Money
							value={svc.value}
							size={SIZE}
							color={WHITE}
							suffix={svc.perMonth ? <PerMonth size={SIZE} appear={toFrame(svc.perMonthAt ?? svc.priceAt)} color={WHITE} /> : null}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ comparison
const brl = (n: number) => n.toLocaleString('pt-BR');

/** Counts up while reserving the final width so the layout never jitters. */
const Counter: React.FC<{target: number; from: number; to: number}> = ({target, from, to}) => {
	const f = useCurrentFrame();
	const v = Math.round(ease(f, from, to, 0, target, Easing.out(Easing.cubic)));
	return (
		<span style={{position: 'relative', display: 'inline-block'}}>
			<span style={{visibility: 'hidden'}}>{brl(target)}</span>
			<span style={{position: 'absolute', right: 0, top: 0}}>{brl(v)}</span>
		</span>
	);
};

const OldPrice: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const a = toFrame(compare.oldAt);
	const strike = ms(compare.strikeAt);
	const exit = ms(compare.oldExit);
	if (f < a || f > exit + 12) return null;
	const p = spring({frame: f - a, fps, config: {damping: 15, stiffness: 160, mass: 0.75}});
	const s = ease(f, strike, strike + 5, 0, 1, Easing.out(Easing.exp));
	// tiny recoil on the strike, then a fast elegant exit
	const recoil = f >= strike ? Math.sin((f - strike) * 1.9) * Math.exp(-(f - strike) / 3) * 6 : 0;
	const x = ease(f, exit, exit + 10, 0, 1, Easing.in(Easing.cubic));
	const SIZE = 176;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				top: Y_PRICE,
				transform: `translateY(-50%) translateY(${(1 - p) * 120 - x * 60}px) scale(${(0.82 + 0.18 * p) * (1 - 0.12 * x)})`,
				opacity: Math.min(1, p * 2) * (1 - x),
				filter: x > 0 ? `blur(${x * 10}px)` : undefined,
				textAlign: 'center',
			}}
		>
			<div style={{position: 'relative', display: 'inline-block', transform: `translateX(${recoil}px)`}}>
				<div style={{opacity: 1 - 0.28 * s}}>
					<Money value={<Counter target={1150} from={a} to={ms(compare.oldCountEnd)} />} size={SIZE} color={RED} />
				</div>
				{/* the cut */}
				<div
					style={{
						position: 'absolute',
						left: '-6%',
						right: '-6%',
						top: '47%',
						height: 12,
						borderRadius: 6,
						background: RED,
						boxShadow: '0 0 18px rgba(255,85,93,.75), 0 2px 6px rgba(0,0,0,.5)',
						transform: `rotate(-7deg) scaleX(${s})`,
						transformOrigin: '0% 50%',
						opacity: s > 0 ? 1 : 0,
					}}
				/>
			</div>
		</div>
	);
};

const NewPrice: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const a = toFrame(compare.newAt);
	const shrink = ms(compare.newShrink);
	const exit = ms(compare.newExit);
	if (f < a || f > exit + 10) return null;
	const p = spring({frame: f - a, fps, config: {damping: 12, stiffness: 150, mass: 0.8}});
	const k = ease(f, shrink, shrink + 12, 0, 1, Easing.inOut(Easing.cubic));
	const x = ease(f, exit, exit + 8, 0, 1, Easing.in(Easing.cubic));
	// subtle breathing glow while it's the hero
	const glowA = 0.32 + 0.1 * Math.sin((f - a) / 6);
	const SIZE = 236;
	const y = interpolate(k, [0, 1], [1040, 905]);
	const scale = (0.7 + 0.3 * p) * interpolate(k, [0, 1], [1, 0.6]) * (1 - 0.08 * x);
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				top: y,
				textAlign: 'center',
				transform: `translateY(-50%) translateY(${(1 - p) * 170 - x * 30}px) scale(${scale})`,
				transformOrigin: '50% 60%',
				opacity: Math.min(1, p * 2.5) * (1 - x),
				filter: x > 0 ? `blur(${x * 8}px)` : undefined,
			}}
		>
			<div
				style={{
					display: 'inline-flex',
					alignItems: 'flex-start',
					color: GREEN,
					fontWeight: 800,
					lineHeight: 0.92,
					whiteSpace: 'nowrap',
					textShadow: `${PRICE_SHADOW}, 0 0 40px rgba(54,229,141,${glowA})`,
					fontVariantNumeric: 'tabular-nums',
				}}
			>
				<span style={{fontSize: SIZE * 0.4, marginTop: SIZE * 0.1, marginRight: SIZE * 0.06}}>R$</span>
				<span style={{fontSize: SIZE, letterSpacing: '-0.045em'}}>
					<Counter target={697} from={a} to={ms(compare.newCountEnd)} />
				</span>
				<PerMonth size={SIZE} appear={toFrame(compare.perMonthAt)} color={GREEN} />
			</div>
		</div>
	);
};

// Caption cards that belong to the comparison block.
const compareCards: Card[] = [
	{id: 'tudo-isso', variant: 'rise', y: Y_PRICE, lines: [{size: 'lg', words: compare.intro}], until: compare.oldAt},
	{
		id: 'mas-no-plano',
		variant: 'blur',
		y: Y_UNDER,
		lines: [
			{size: 'sm', words: compare.mas},
			{size: 'lg', color: 'cyan', upper: true, words: compare.plano},
		],
	},
	{id: 'voce-paga', variant: 'rise', y: Y_UNDER, lines: [{size: 'md', words: compare.vocePaga}], until: compare.newAt},
];

// ------------------------------------------------------------------ CTA
const CTA: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const [e, chame, no, wa] = cta.words;
	const start = toFrame(e.at);
	if (f < start) return null;
	const waF = toFrame(wa.at);
	const settled = f - (waF + 10);
	const pulse = settled > 0 ? 1 + 0.028 * Math.sin((settled / 22) * Math.PI * 2) * Math.min(1, settled / 10) : 1;
	const icon = spring({frame: f - waF, fps, config: {damping: 12, stiffness: 180, mass: 0.6}});
	const line1: Line = {size: 'lg', color: 'cyan', upper: true, words: [chame, no]};
	return (
		// The connective "e" is spoken but not shown: the CTA reads as one clean phrase.
		<div style={{position: 'absolute', left: 0, right: 0, top: Y_CAPTION - 20, transform: 'translateY(-50%)', textAlign: 'center'}}>
			<div style={{transform: `scale(${pulse})`, transformOrigin: '50% 50%'}}>
				<LineView line={line1} variant="blur" />
				<div style={{display: 'inline-flex', alignItems: 'center', gap: 18}}>
					<Img
						src={staticFile('assets/v6/whatsapp-official.svg')}
						style={{
							width: 96,
							height: 96,
							opacity: f >= waF ? Math.min(1, icon * 2) : 0,
							transform: `scale(${0.5 + 0.5 * icon})`,
							filter: 'drop-shadow(0 3px 8px rgba(0,0,0,.45))',
						}}
					/>
					<LineView line={{size: 'xl', color: 'cyan', upper: true, words: [wa]}} variant="blur" />
				</div>
			</div>
		</div>
	);
};

// ------------------------------------------------------------------ camera
const cameraScale = (f: number) => {
	for (const p of pushes) {
		if (f < p.from || f >= p.release) continue;
		const up = interpolate(f, [p.from, p.peak], [1, p.scale], {...clamp, easing: Easing.inOut(Easing.sin)});
		if (f <= p.hold) return {scale: up, originY: p.originY};
		const down = interpolate(f, [p.hold, p.release], [p.scale, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
		return {scale: down, originY: p.originY};
	}
	return {scale: 1, originY: 50};
};

// ------------------------------------------------------------------ root
const allCards = [...cards, ...compareCards, ...bonus]
	.map((c) => ({c, start: toFrame(c.lines[0].words[0].at)}))
	.sort((a, b) => a.start - b.start);

const firstServiceStart = toFrame(services[0].start);

/**
 * `soundtrack` replaces the V1 SFX layer (used by the V2 sound-design variant).
 * `muteSource` exists only for QA stems (SFX-only bounce). With no props this
 * renders exactly the V1 edit.
 */
export const PlanoVisionario: React.FC<{soundtrack?: React.ReactNode; muteSource?: boolean}> = ({soundtrack, muteSource}) => {
	const f = useCurrentFrame();
	const cam = cameraScale(f);
	return (
		<AbsoluteFill style={{background: '#000', fontFamily: 'Manrope, Arial, sans-serif'}}>
			<style>{`@font-face{font-family:Manrope;src:url('${staticFile('assets/fonts/Manrope.ttf')}') format('truetype');font-weight:200 800;font-display:block;}*{box-sizing:border-box;}`}</style>
			<AbsoluteFill style={{transform: `scale(${cam.scale})`, transformOrigin: `50% ${cam.originY}%`}}>
				{/* the original edit: image + voice + its own cuts/transitions, untouched */}
				<OffthreadVideo src={staticFile(SOURCE)} muted={muteSource} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			{/* very light lower shade for legibility over bright pavement */}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 45%, rgba(0,0,0,.10) 62%, rgba(0,0,0,.22) 100%)'}} />

			<AbsoluteFill style={{textShadow: SHADOW}}>
				{allCards.map(({c, start}, i) => {
					const next = allCards[i + 1];
					let end = c.until !== undefined ? ms(c.until) : next ? next.start : 999999;
					if (c.id === 'conta-com') end = firstServiceStart;
					if (next && end > next.start) end = next.start;
					if (c.id === 'bio') end = toFrame(cta.start);
					return (
						<Sequence key={c.id} from={start} durationInFrames={Math.max(1, end - start)} layout="none">
							<SeqCard card={c} start={start} end={end} />
						</Sequence>
					);
				})}
				{services.map((svc) => (
					<Sequence key={svc.id} from={toFrame(svc.start)} durationInFrames={ms(svc.end) - toFrame(svc.start)} layout="none">
						<SeqService svc={svc} start={toFrame(svc.start)} />
					</Sequence>
				))}
				<OldPrice />
				<NewPrice />
				<CTA />
			</AbsoluteFill>

			{soundtrack ??
				sfx.map((e, i) => (
					<Sequence key={i} from={Math.max(0, e.at)} layout="none">
						<Audio src={staticFile(`assets/pv/sfx/${e.file}.wav`)} volume={e.volume} />
					</Sequence>
				))}
		</AbsoluteFill>
	);
};

// Sequences shift the frame; these wrappers hand absolute-time children the
// global frame back by offsetting with the sequence start.
const Shift: React.FC<{by: number; children: React.ReactNode}> = ({by, children}) => (
	<Sequence from={-by} layout="none">
		{children}
	</Sequence>
);
const SeqCard: React.FC<{card: Card; start: number; end: number}> = ({card, start, end}) => (
	<Shift by={start}>
		<CardView card={card} end={end} />
	</Shift>
);
const SeqService: React.FC<{svc: Service; start: number}> = ({svc, start}) => (
	<Shift by={start}>
		<ServiceCard svc={svc} />
	</Shift>
);
