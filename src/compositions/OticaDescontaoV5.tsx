import React from 'react';
import {AbsoluteFill,Audio,Freeze,Img,OffthreadVideo,Sequence,interpolate,spring,staticFile,useCurrentFrame} from 'remotion';
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {segments,footageDuration,holdFrames,duration,sourceAt,mappedWords,wordFrame as w} from '../v5/timeline';
import {cameraStyle,fast,textSpring,springPeak,cues,clamp} from '../v5/direction';

const orange='#FF791B',white='#FFFDF6';
type Group={a:number;b:number;lines:number[][];main:number;top:number;size:number;depth?:boolean;align?:'left'|'center';x?:number;width?:number};
// ONE semantic group is mounted at a time: this is the caption AND the kinetic
// typography. There is deliberately no independent lower-caption component.
const groups:Group[]=[
 {a:0,b:1,lines:[[0],[1]],main:1,top:330,size:178,depth:true,align:'left',x:70},
 {a:2,b:4,lines:[[2],[3,4]],main:2,top:1080,size:112},
 {a:5,b:9,lines:[[5],[6,7,8],[9]],main:5,top:1050,size:140},
 {a:10,b:14,lines:[[10,11,12],[13],[14]],main:14,top:1050,size:94},
 {a:15,b:16,lines:[[15],[16]],main:16,top:1110,size:93},
 {a:17,b:18,lines:[[17],[18]],main:18,top:1055,size:118,align:'left',x:95,width:875},
 {a:19,b:21,lines:[[19,20],[21]],main:20,top:1140,size:77},
 {a:22,b:24,lines:[[22,23],[24]],main:24,top:1110,size:94},
 {a:25,b:26,lines:[[25],[26]],main:26,top:1120,size:102},
 {a:27,b:30,lines:[[27],[28,29,30]],main:27,top:1060,size:138},
 {a:31,b:33,lines:[[31,32],[33]],main:33,top:1130,size:101},
 {a:34,b:35,lines:[[34],[35]],main:35,top:1130,size:111},
 {a:36,b:39,lines:[[36,37],[38,39]],main:37,top:1130,size:80},
 {a:40,b:40,lines:[[40]],main:40,top:1290,size:95},
];
const activeGroup=(f:number)=>groups.find((g,i)=>f>=w(g.a)&&f<(i===groups.length-1?duration:w(groups[i+1].a)));
const Source=()=>{let cursor=0;return <>
 {segments.map((s,i)=>{const from=cursor;cursor+=s.end-s.start;return <Sequence key={i} from={from} durationInFrames={s.end-s.start}><OffthreadVideo muted src={staticFile('0.mp4')} trimBefore={s.start} style={{width:'100%',height:'100%',objectFit:'cover'}}/></Sequence>;})}
 <Sequence from={footageDuration} durationInFrames={holdFrames}><Freeze frame={97}><OffthreadVideo muted src={staticFile('0.mp4')} trimBefore={525} style={{width:'100%',height:'100%',objectFit:'cover'}}/></Freeze></Sequence>
 </>;};
const Typography=()=>{
 const f=useCurrentFrame(),g=activeGroup(f);if(!g)return null;
 const next=groups[groups.indexOf(g)+1];const end=next?w(next.a):duration+20;
 const exit=interpolate(f,[end-3,end],[0,1],clamp);
 return <div data-v5-primary-text="true" style={{position:'absolute',left:g.x??90,top:g.top,width:g.width??900,textAlign:g.align??'center',color:white,fontStyle:g.depth?'normal':'italic',fontWeight:650,lineHeight:1.01,letterSpacing:-2,filter:'drop-shadow(0 3px 4px #0008)',opacity:1-exit}}>
 {g.lines.map((line,row)=><div key={row} style={{minHeight:line.includes(g.main)?g.size*1.04:58,marginBottom:3}}>{line.map(i=>{
  const word=mappedWords[i];if(f<word.start)return null;
  const age=f-word.start,p=textSpring(f,word.start),isMain=i===g.main;
  const slide=isMain&&[2,14,26,35].includes(i);
  const color=isMain&&[2,5,14,18,24,35,40].includes(i)?orange:white;
  const size=isMain?g.size:g.a===5&&row===2?72:55;
  return <span key={i} style={{display:'inline-block',margin:'0 7px',fontSize:size,fontWeight:isMain?800:600,color,letterSpacing:interpolate(age,[0,9],[isMain?2:0,isMain?-3:-1],clamp),opacity:Math.min(1,p*3),transform:`translate(${slide?(1-p)*-90:0}px,${!slide?(1-p)*25:0}px) rotate(${isMain&&!g.depth?(1-p)*-3:0}deg) scale(${isMain?.68+.32*p:.95+.05*p})`,transformOrigin:'50% 70%',filter:`blur(${Math.max(0,1-p)*(isMain?4:1.5)}px)`,clipPath:`inset(0 ${Math.max(0,1-p)*80}% -10% -10%)`}}>{word.text}</span>;
 })}</div>)}
 </div>;
};
const Depth=()=>{
 const f=useCurrentFrame(),g=activeGroup(f),s=Math.round(sourceAt(f));
 if(!g?.depth||s<47||s>167||f<w(1))return null;
 return <div style={{...cameraStyle(f),maskImage:'linear-gradient(to bottom,black 0%,black 31%,transparent 42%)',pointerEvents:'none'}}><Img src={staticFile(`assets/v3/mattes/presenter-${String(s).padStart(4,'0')}.webp`)} style={{width:'100%',height:'100%'}}/></div>;
};
const BrandAndContact=()=>{
 const f=useCurrentFrame(),logoStart=w(33),phoneStart=w(35),lp=textSpring(f,logoStart),pp=textSpring(f,phoneStart);
 return <>
 {f>=logoStart&&<div style={{position:'absolute',left:255,top:55,width:570,height:285,opacity:Math.min(1,lp*3),transform:`translateY(${(1-lp)*-30}px) scale(${.88+.12*lp})`,clipPath:`inset(${Math.max(0,1-lp)*100}% 0 0 0)`,filter:'drop-shadow(0 2px 2px #ffffff90)'}}><Img src={staticFile('assets/v5/logonova.png')} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>}
 {f>=phoneStart&&<div style={{position:'absolute',left:110,top:1575,width:860,height:110,display:'flex',alignItems:'center',justifyContent:'center',gap:28,opacity:Math.min(1,pp*3),transform:`translateX(${(1-pp)*70}px) scale(${.92+.08*pp})`,transformOrigin:'center',filter:'drop-shadow(0 3px 3px #0009)'}}>
  <Img src={staticFile('assets/v5/whatsapp-official.svg')} style={{width:92,height:92,objectFit:'contain'}}/>
  <span style={{color:white,fontSize:72,letterSpacing:-2,fontWeight:750,whiteSpace:'nowrap'}}>(21) 99648-0818</span>
 </div>}
 </>;
};
const Visual=()=>{
 const f=useCurrentFrame();const cut=[108,267,342].find(n=>Math.abs(f-n)<3);
 return <AbsoluteFill style={{overflow:'hidden',background:'#212522'}}>
  <div style={{...cameraStyle(f),filter:cut===undefined?undefined:`blur(${(3-Math.abs(f-cut))*.7}px)`}}><Source/></div>
  <AbsoluteFill style={{background:'linear-gradient(180deg,#00000010 0%,transparent 32%,transparent 53%,#00000099 100%)'}}/>
  <Typography/><BrandAndContact/>
 </AbsoluteFill>;
};
export const OticaDescontaoV5=()=>{
 const f=useCurrentFrame();return <AbsoluteFill style={{fontFamily:'Manrope,Arial,sans-serif'}}>
 <style>{`@font-face{font-family:Manrope;src:url('${staticFile('assets/fonts/Manrope.ttf')}') format('truetype');font-weight:200 800;font-display:block;}*{box-sizing:border-box;}`}</style>
 <HtmlInCanvasMotionBlur width={1080} height={1920} samples={fast(f)?5:1} shutterAngle={180} disabled={!fast(f)}><Visual/></HtmlInCanvasMotionBlur>
 <Depth/>
 <Audio src={staticFile('assets/v5/voice.wav')}/><Audio src={staticFile('assets/v5/music.wav')}/>
 {cues.map((cue,i)=><Sequence key={i} from={cue.frame} durationInFrames={cue.file==='riser-short'?8:15}><Audio src={staticFile(`assets/v5/sfx/${cue.file}.wav`)} volume={cue.volume}/></Sequence>)}
 </AbsoluteFill>;
};
