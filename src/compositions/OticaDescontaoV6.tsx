import React from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,interpolate,staticFile,useCurrentFrame} from 'remotion';
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {segments,footageDuration,duration,mappedWords,wordFrame as w} from '../v6/timeline';
import {cameraStyle,transitionStyle,fast,textSpring,springPeak,cues,clamp,logoStart,phoneStart} from '../v6/direction';

const orange='#FF791B',white='#FFFDF6';
type Group={a:number;b:number;lines:number[][];main:number;top:number;size:number;depth?:boolean;align?:'left'|'center'|'right';x?:number;width?:number};
// ONE semantic group is mounted at a time: this is the caption AND the kinetic
// typography. There is deliberately no independent lower-caption component.
const groups:Group[]=[
 {a:0,b:1,lines:[[0],[1]],main:1,top:1060,size:142},
 {a:2,b:4,lines:[[2],[3,4]],main:2,top:1080,size:112},
 {a:5,b:9,lines:[[5],[6,7,8],[9]],main:5,top:1050,size:140},
 {a:10,b:14,lines:[[10,11,12],[13],[14]],main:14,top:1050,size:94},
 {a:15,b:16,lines:[[15],[16]],main:16,top:1110,size:93},
 {a:17,b:18,lines:[[17],[18]],main:18,top:1055,size:118,align:'left',x:95,width:875},
 {a:19,b:21,lines:[[19,20],[21]],main:20,top:1140,size:77},
 {a:22,b:24,lines:[[22,23],[24]],main:24,top:1100,size:92,align:'right',x:310,width:650},
 {a:25,b:26,lines:[[25],[26]],main:26,top:1250,size:102},
 {a:27,b:30,lines:[[27],[28,29,30]],main:27,top:1290,size:130},
 {a:31,b:33,lines:[[31,32],[33]],main:33,top:1130,size:101},
 {a:34,b:35,lines:[[34],[35]],main:35,top:1130,size:111},
 {a:36,b:39,lines:[[36,37],[38,39]],main:37,top:1130,size:80},
 {a:40,b:40,lines:[[40]],main:40,top:1290,size:95},
];
const activeGroup=(f:number)=>groups.find((g,i)=>f>=w(g.a)&&f<(i===groups.length-1?duration:w(groups[i+1].a)));
const Source=()=>{let cursor=0;return <>
 {segments.map((s,i)=>{const from=cursor;cursor+=s.end-s.start;return <Sequence key={i} from={from} durationInFrames={s.end-s.start}><OffthreadVideo muted src={staticFile('0.mp4')} trimBefore={s.start} style={{width:'100%',height:'100%',objectFit:'cover'}}/></Sequence>;})}
 </>;};
const Typography=()=>{
 const f=useCurrentFrame(),g=activeGroup(f);if(!g)return null;
 const next=groups[groups.indexOf(g)+1];const end=next?w(next.a):duration+20;
 const exit=interpolate(f,[end-3,end],[0,1],clamp);
 return <div data-v5-primary-text="true" style={{position:'absolute',left:g.x??90,top:g.a===40?interpolate(f,[footageDuration-5,footageDuration+8],[1290,1030],clamp):g.top,width:g.width??900,textAlign:g.align??'center',color:white,fontStyle:g.depth?'normal':'italic',fontWeight:650,lineHeight:1.01,letterSpacing:-2,filter:'drop-shadow(0 3px 4px #0008)',opacity:1-exit}}>
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
const BrandAndContact=()=>{
 const f=useCurrentFrame(),lp=textSpring(f,logoStart),pp=textSpring(f,phoneStart);
 const outro=interpolate(f,[footageDuration-5,footageDuration+8],[0,1],clamp);
 return <>
 {f>=logoStart&&<div style={{position:'absolute',left:interpolate(outro,[0,1],[255,145]),top:interpolate(outro,[0,1],[55,490]),width:interpolate(outro,[0,1],[570,790]),height:interpolate(outro,[0,1],[285,395]),opacity:Math.min(1,lp*3),transform:`translateY(${(1-lp)*-30}px) scale(${.88+.12*lp})`,clipPath:`inset(${Math.max(0,1-lp)*100}% 0 0 0)`}}><Img src={staticFile('assets/v6/logonova.png')} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>}
 {f>=phoneStart&&<div style={{position:'absolute',left:100,top:interpolate(outro,[0,1],[1575,1215]),width:880,height:110,display:'flex',alignItems:'center',justifyContent:'center',gap:24,opacity:Math.min(1,pp*3),transform:`translateX(${(1-pp)*80}px)`,filter:outro<.5?'drop-shadow(0 3px 3px #0009)':undefined}}>
  <Img src={staticFile('assets/v6/whatsapp-official.svg')} style={{width:92,height:92,objectFit:'contain',transform:`scale(${.6+.4*pp})`}}/>
  <span style={{color:outro<.15?white:'#252525',fontSize:72,letterSpacing:-2,fontWeight:750,whiteSpace:'nowrap'}}>(21) 99648-0818</span>
 </div>}
 </>;
};
const Visual=()=>{
 const f=useCurrentFrame();const outro=interpolate(f,[footageDuration-5,footageDuration],[0,1],clamp);
 return <AbsoluteFill style={{overflow:'hidden',background:'#F7F4ED'}}>
  {f<footageDuration&&<AbsoluteFill style={{opacity:1-outro,transform:`scale(${1+outro*.05})`,filter:`blur(${outro*5}px)`}}>
   <AbsoluteFill style={transitionStyle(f)}><div style={cameraStyle(f)}><Source/></div></AbsoluteFill>
   <AbsoluteFill style={{background:'linear-gradient(180deg,#00000005 0%,transparent 50%,#00000088 100%)'}}/>
  </AbsoluteFill>}
  <Typography/><BrandAndContact/>
 </AbsoluteFill>;
};
export const OticaDescontaoV6=()=>{
 const f=useCurrentFrame();return <AbsoluteFill style={{fontFamily:'Manrope,Arial,sans-serif'}}>
 <style>{`@font-face{font-family:Manrope;src:url('${staticFile('assets/fonts/Manrope.ttf')}') format('truetype');font-weight:200 800;font-display:block;}*{box-sizing:border-box;}`}</style>
 <HtmlInCanvasMotionBlur width={1080} height={1920} samples={fast(f)?5:1} shutterAngle={180} disabled={!fast(f)}><Visual/></HtmlInCanvasMotionBlur>

 <Audio src={staticFile('assets/v6/master.wav')}/>
 </AbsoluteFill>;
};
