import {interpolate,spring} from 'remotion';
import {duration,footageDuration,wordFrame as w} from './timeline';
export const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const textSpring=(frame:number,start:number)=>spring({frame:frame-start,fps:30,config:{damping:14,stiffness:240,mass:.65}});
export const springPeak=(()=>{let best=0;for(let f=1;f<=18;f++)if(textSpring(f,0)>textSpring(best,0))best=f;return best;})();
export const cuts=[{frame:96,kind:'whip'},{frame:255,kind:'zoom'},{frame:330,kind:'whip'}] as const;
export const shots=[
 {frame:0,s:1.025,x:0,y:0},
 {frame:w(2),s:1.12,x:-38,y:24},
 {frame:w(5),s:1.07,x:-12,y:12},
 {frame:w(8),s:1.035,x:8,y:4},
 {frame:96,s:1.105,x:30,y:20},
 {frame:w(15),s:1.035,x:7,y:4},
 {frame:w(17),s:1.155,x:65,y:34},
 {frame:w(19),s:1.055,x:-20,y:8},
 {frame:w(22),s:1.13,x:-48,y:30},
 {frame:255,s:1.035,x:8,y:6},
 {frame:w(26),s:1.105,x:35,y:20},
 {frame:w(27),s:1.15,x:-48,y:35},
 {frame:330,s:1.035,x:8,y:5},
 {frame:w(35),s:1.075,x:-22,y:10},
 {frame:w(36),s:1.025,x:0,y:3},
 {frame:w(40),s:1.105,x:28,y:18},
];
export const punches=[
 {start:w(1),s:1.185,x:-35,y:35},
 {start:w(5),s:1.225,x:-42,y:40},
 {start:w(14),s:1.16,x:40,y:30},
 {start:w(18),s:1.225,x:78,y:42},
 {start:w(27),s:1.23,x:-70,y:40},
 {start:w(35),s:1.17,x:-38,y:25},
 {start:w(40),s:1.175,x:30,y:30},
];
export const camera=(f:number)=>{
 const shot=[...shots].reverse().find(k=>f>=k.frame)??shots[0];
 const next=shots.find(k=>k.frame>shot.frame)?.frame??footageDuration;
 const drift=Math.min(1,Math.max(0,(f-shot.frame)/Math.max(1,next-shot.frame)));
 let scale=shot.s+.018*drift,x=shot.x+6*drift,y=shot.y+5*drift;
 for(const p of punches){const age=f-p.start;if(age>=0&&age<18){const q=textSpring(f,p.start)*interpolate(age,[0,8,18],[1,1,0],clamp);scale+=(p.s-scale)*q;x+=(p.x-x)*q;y+=(p.y-y)*q;}}
 // Every crop remains filled; no black edges during lateral movement.
 x=Math.max(-(scale-1)*540+2,Math.min((scale-1)*540-2,x));
 y=Math.max(-(scale-1)*1920*.68+2,Math.min((scale-1)*1920*.32-2,y));
 return {scale,x,y};
};
export const cameraStyle=(f:number)=>{const c=camera(f);return {position:'absolute' as const,inset:0,transform:`translate(${c.x}px,${c.y}px) scale(${c.scale})`,transformOrigin:'50% 32%'};};
export const transitionStyle=(f:number)=>{
 const cut=cuts.find(c=>Math.abs(f-c.frame)<4);if(!cut)return {};
 const age=f-cut.frame,weight=1-Math.abs(age)/4;
 const sign=age<0?-1:1;
 return {transform:cut.kind==='whip'?`translateX(${sign*weight*62}px) scale(${1+weight*.14})`:`scale(${1+weight*.12})`,filter:`blur(${weight*9}px)`,transformOrigin:'50% 40%'};
};
export const fast=(f:number)=>punches.some(p=>f>=p.start&&f<p.start+11)||cuts.some(c=>Math.abs(f-c.frame)<4)||[w(2),w(17),w(22),w(26)].some(n=>f>=n&&f<n+5);
export const logoStart=w(40)+springPeak;
export const phoneStart=logoStart+4;
export const cues=[
 {frame:w(1)+springPeak,file:'impact-a',volume:1.0,reason:'óculos: shared text/camera overshoot'},
 {frame:w(2)+4,file:'slide-a',volume:.85,reason:'novos: side entry and crop switch; waveform peaks 3 frames later'},
 {frame:w(5)+springPeak,file:'impact-b',volume:1.0,reason:'menos: strongest opening punch'},
 {frame:93,file:'cut-air',volume:.95,reason:'frame 96 whip cut'},
 {frame:w(14)+springPeak,file:'pop-a',volume:.85,reason:'Descontão: word/camera spring peak'},
 {frame:w(18)+springPeak,file:'pop-b',volume:.90,reason:'estilos: left typography/right reframe'},
 {frame:w(24)+springPeak,file:'detail-pop',volume:.64,reason:'necessidade: compact overshoot'},
 {frame:253,file:'cut-air-b',volume:.90,reason:'frame 255 glasses entry zoom transition'},
 {frame:w(26)+3,file:'discover-swipe',volume:.70,reason:'descobrir: text slides as framing closes'},
 {frame:w(27)+springPeak,file:'impact-c',volume:.95,reason:'quanto: camera and typography peak'},
 {frame:322,file:'riser-short',volume:.70,reason:'8-frame preparation into CTA shot'},
 {frame:327,file:'cta-swipe',volume:.92,reason:'frame 330 directional cut into final speech'},
 {frame:w(35)+springPeak,file:'whatsapp-hit',volume:.78,reason:'WhatsApp word and camera scale peak'},
 {frame:w(40)+springPeak,file:'resolve-v6',volume:.85,reason:'orçamento: final word impact and logo appearance'},
 {frame:phoneStart+springPeak,file:'contact-pop',volume:.82,reason:'WhatsApp icon overshoot and number slide'},
 {frame:footageDuration-3,file:'outro-air',volume:.75,reason:'single exit of presenter into uninterrupted CTA'},
];
