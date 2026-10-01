import {Easing, interpolate, spring} from 'remotion';

export const COLORS={orange:'#FF791B',green:'#075532',white:'#FFFDF6',ink:'#073E29'};
export const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const frameAt=(t:number)=>Math.round(t*30);
export const tween=(f:number,a:number,b:number,x:number,y:number)=>interpolate(f,[a,b],[x,y],{...clamp,easing:Easing.inOut(Easing.cubic)});
export const bounce=(f:number,start:number,damping=15)=>spring({frame:f-start,fps:30,config:{damping,stiffness:170,mass:.75}});

// Each camera action is attached to a spoken onset or the existing shot change.
const keys=[
 {f:0,s:1.17,x:0,y:0}, {f:9,s:1.035,x:0,y:0}, {f:48,s:1.07,x:0,y:0},
 {f:53,s:1.07,x:0,y:0}, {f:57,s:1.155,x:-24,y:12}, {f:62,s:1.125,x:-18,y:8},
 {f:64,s:1.125,x:-18,y:8}, {f:68,s:1.17,x:-40,y:20}, {f:75,s:1.14,x:-30,y:12},
 {f:77,s:1.14,x:-30,y:12}, {f:82,s:1.09,x:70,y:0}, {f:101,s:1.10,x:70,y:0},
 {f:103,s:1.10,x:70,y:0}, {f:107,s:1.18,x:25,y:12}, {f:115,s:1.13,x:28,y:6},
 {f:148,s:1.16,x:10,y:10}, {f:160,s:1.16,x:10,y:10},
 {f:172,s:1.05,x:120,y:0}, {f:188,s:1.08,x:130,y:0},
 {f:244,s:1.08,x:130,y:0}, {f:251,s:1.14,x:150,y:7}, {f:259,s:1.11,x:140,y:5},
 {f:265,s:1.155,x:158,y:8}, {f:278,s:1.12,x:148,y:4}, {f:326,s:1.135,x:148,y:4},
 {f:348,s:1.0,x:0,y:0}, {f:400,s:1.025,x:0,y:0},
 {f:408,s:1.085,x:66,y:-30}, {f:429,s:1.10,x:70,y:-30},
 {f:433,s:1.16,x:96,y:-36}, {f:446,s:1.115,x:83,y:-31},
 {f:472,s:1.13,x:80,y:-20}, {f:493,s:1.0,x:0,y:0},
 {f:512,s:1.02,x:0,y:0}, {f:523,s:1.05,x:0,y:0},
];

export const cameraAt=(f:number)=>{
 let a=keys[0],b=keys[keys.length-1];
 for(let i=0;i<keys.length-1;i++)if(f>=keys[i].f&&f<=keys[i+1].f){a=keys[i];b=keys[i+1];break;}
 if(f>=keys[keys.length-1].f)a=b=keys[keys.length-1];
 const s=a.f===b.f?a.s:tween(f,a.f,b.f,a.s,b.s);
 const px=a.f===b.f?a.x:tween(f,a.f,b.f,a.x,b.x);
 const py=a.f===b.f?a.y:tween(f,a.f,b.f,a.y,b.y);
 const focusY=f<348?650:950;
 const cta=tween(f,522,540,0,1);
 const lerp=(x:number,y:number)=>x+(y-x)*cta;
 return {scale:lerp(s,.60),x:lerp(540*(1-s)+px,350),y:lerp(focusY*(1-s)+py,150),cta};
};

export const blurWindows=[
 [0,12],[52,61],[63,71],[77,85],[103,115],[169,186],[246,254],
 [259,268],[400,410],[428,439],[520,541],[555,565],[584,596],
];
export const hasFastMotion=(f:number)=>blurWindows.some(([a,b])=>f>=a&&f<=b);
