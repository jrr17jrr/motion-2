import {interpolate,spring} from 'remotion';
import {duration,wordFrame as w} from './timeline';
export const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const textSpring=(frame:number,start:number)=>spring({frame:frame-start,fps:30,config:{damping:14,stiffness:240,mass:.65}});
// Peak frame derived from the actual spring, shared by camera and audio.
export const springPeak=(()=>{let best=0;for(let f=1;f<=18;f++)if(textSpring(f,0)>textSpring(best,0))best=f;return best;})();
export const punches=[{start:w(1),s:1.15,x:-20,y:30},{start:w(5),s:1.19,x:-32,y:45},{start:w(18),s:1.17,x:68,y:40},{start:w(27),s:1.18,x:-58,y:45},{start:w(35),s:1.14,x:22,y:28}];
const keys=[
 [0,1.045,0,0],[w(1)-1,1.07,-5,12],[w(2)+9,1.10,-8,20],
 [w(5)-1,1.09,-18,20],[w(6)+3,1.12,-15,22],[w(8),1.045,5,8],
 [107,1.075,8,15],[108,1.055,0,8],[w(14),1.11,22,25],[w(16),1.055,-10,10],
 [w(17),1.07,18,14],[w(19),1.10,38,23],[w(21),1.04,-15,8],
 [w(24),1.11,-28,24],[266,1.125,-30,25],[267,1.055,28,8],
 [w(26),1.095,10,16],[w(28)+6,1.115,-30,25],[341,1.12,-30,28],
 [342,1.045,0,5],[w(33),1.10,10,12],[w(36),1.09,15,12],[w(40)+6,1.04,0,5],[duration,1.075,0,15],
];
export const camera=(f:number)=>{
 const a=keys.map(k=>k[0]);let scale=interpolate(f,a,keys.map(k=>k[1]),clamp),x=interpolate(f,a,keys.map(k=>k[2]),clamp),y=interpolate(f,a,keys.map(k=>k[3]),clamp);
 for(const p of punches){const age=f-p.start;if(age>=0&&age<18){const q=textSpring(f,p.start)*interpolate(age,[0,8,18],[1,1,0],clamp);scale+=(p.s-scale)*q;x+=(p.x-x)*q;y+=(p.y-y)*q;}}
 return {scale,x,y};
};
export const cameraStyle=(f:number)=>{const c=camera(f);return {position:'absolute' as const,inset:0,transform:`translate(${c.x}px,${c.y}px) scale(${c.scale})`,transformOrigin:'50% 32%'};};
export const fast=(f:number)=>punches.some(p=>f>=p.start&&f<p.start+11)||[108,267,342].some(c=>Math.abs(f-c)<4);
export const cues=[
 {frame:w(1)+springPeak,file:'impact-a',volume:.65,reason:'óculos: text and camera spring peak'},
 {frame:w(2)+4,file:'slide-a',volume:.40,reason:'novos: lateral reveal peak on spring impact frame'},
 {frame:w(5)+springPeak,file:'impact-b',volume:.68,reason:'menos: main type and camera peak'},
 {frame:105,file:'cut-air',volume:.38,reason:'short cut bridge'},
 {frame:w(14)+4,file:'pop-a',volume:.36,reason:'Descontão: emphasis'},
 {frame:w(18)+springPeak,file:'pop-b',volume:.56,reason:'estilos: scale peak'},
 {frame:265,file:'cut-air-b',volume:.36,reason:'glasses scene enters already in action; audio peak on frame 267'},
 {frame:w(27)+springPeak,file:'impact-c',volume:.58,reason:'quanto: camera/text peak'},
 {frame:334,file:'riser-short',volume:.30,reason:'CTA preparation'},
 {frame:339,file:'cut-air',volume:.40,reason:'CTA cut/reframe: whoosh peak on frame 342'},
 {frame:w(33)+springPeak,file:'logo-pop',volume:.32,reason:'official logo spring'},
 {frame:w(35)+springPeak,file:'contact-pop',volume:.50,reason:'contact scale peak'},
 {frame:w(40)+springPeak,file:'resolve-v5',volume:.45,reason:'orçamento impact'},
];
