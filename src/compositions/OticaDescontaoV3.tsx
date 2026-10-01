import React from 'react';
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,interpolate,staticFile,useCurrentFrame} from 'remotion';
import {CaptionsV3} from '../v3/CaptionsV3';
import {KineticText} from '../v3/KineticText';
import {bounce,cameraAt,clamp,COLORS as C,frameAt,hasFastMotion,tween} from '../v3/motion';

const OpticalFrame=({color=C.orange,variant=0}:{color?:string;variant?:number})=> <svg viewBox="0 0 500 220" width="100%" height="100%" fill="none">
 <g stroke={color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
  {variant===1?<><circle cx="120" cy="112" r="80"/><circle cx="380" cy="112" r="80"/></>:<><rect x="30" y="45" width="185" height="143" rx={variant===2?26:60}/><rect x="285" y="45" width="185" height="143" rx={variant===2?26:60}/></>}
  <path d="M215 91Q250 65 285 91M30 70L10 52M470 70L490 52"/>
 </g>
</svg>;

const cameraStyle=(f:number):React.CSSProperties=>{
 const p=cameraAt(f);
 return {position:'absolute',left:0,top:0,width:1080,height:1920,transform:`translate(${p.x}px,${p.y}px) scale(${p.scale})`,transformOrigin:'0 0'};
};

const ForegroundPresenter=()=>{
 const f=useCurrentFrame();
 const first=f>=63&&f<=166,styles=f>=258&&f<=334;
 if(!first&&!styles)return null;
 const index=Math.round(f);
 const opacity=first?interpolate(f,[63,67,161,166],[0,1,1,0],clamp):interpolate(f,[258,262,330,334],[0,1,1,0],clamp);
 return <div style={{...cameraStyle(f),clipPath:'inset(0 0 47% 0)',opacity,pointerEvents:'none'}}>
   <Img src={staticFile(`assets/v3/mattes/presenter-${String(index).padStart(4,'0')}.webp`)} style={{width:'100%',height:'100%'}}/>
 </div>;
};

const DepthType=()=>{
 const f=useCurrentFrame();
 return <>
  <KineticText start={53} end={103} x={82} y={238} size={49} tracking={8} color={C.green}>SEUS</KineticText>
  <KineticText start={64} end={103} x={82} y={337} size={173} tracking={-9} color={C.white} width={900} direction="left" scaleFrom={.58}>ÓCULOS</KineticText>
  <KineticText start={103} end={164} x={82} y={294} size={210} tracking={-11} color={C.orange} width={900} direction="right" scaleFrom={.52}>MENOS</KineticText>
  {f>=64&&f<164&&<div style={{position:'absolute',left:420,top:300,width:510,height:230,opacity:.3,transform:`translateX(${tween(f,64,155,70,-20)}px) rotate(-11deg)`}}><OpticalFrame color={C.white}/></div>}
  <KineticText start={248} end={304} x={78} y={305} size={64} tracking={0} color={C.white} direction="left">DIFERENTES</KineticText>
  <KineticText start={260} end={307} x={82} y={390} size={170} tracking={-8} color={C.orange} direction="left" scaleFrom={.6}>ESTILOS</KineticText>
 </>;
};

const HookForeground=()=>{
 const f=useCurrentFrame();
 const p=bounce(f,77,13);
 return <>
  {f<35&&<div style={{position:'absolute',left:tween(f,0,29,-390,1180),top:540,width:660,height:300,transform:`rotate(${tween(f,0,28,-18,10)}deg) scale(${tween(f,0,25,1.4,.8)})`,opacity:interpolate(f,[0,3,20,30],[.75,.9,.7,0],clamp)}}><OpticalFrame color={C.orange}/></div>}
  {f>=77&&f<103&&<div style={{position:'absolute',left:83,top:1070,background:C.orange,padding:'8px 32px 15px',color:C.white,fontWeight:800,fontSize:99,letterSpacing:-4,transform:`translateX(${(1-p)*-330}px) rotate(-6deg) scale(${.68+.32*p})`,boxShadow:'9px 13px 0 #075532',clipPath:`inset(0 ${Math.max(0,1-p)*100}% 0 0)`}}>NOVOS<span style={{fontSize:68,marginLeft:15}}>↗</span></div>}
  <KineticText start={85} end={103} x={89} y={1219} size={40} color={C.white} tracking={1}>podem</KineticText>
  <KineticText start={103} end={164} x={83} y={1000} size={39} tracking={5} color={C.white} direction="left">PODEM CUSTAR</KineticText>
  {f>=103&&f<164&&<div style={{position:'absolute',left:78,top:1074,fontSize:170,color:C.orange,fontWeight:800,transform:`translate(${tween(f,103,112,100,0)}px,${tween(f,103,112,-50,0)}px) rotate(-8deg)`}}>↘</div>}
  <KineticText start={118} end={164} x={250} y={1101} size={49} tracking={-1} color={C.white}>do que você</KineticText>
  <KineticText start={133} end={164} x={250} y={1163} size={73} tracking={-3} color={C.white} scaleFrom={.72}>imagina.</KineticText>
 </>;
};

const StylesForeground=()=>{
 const f=useCurrentFrame();if(f<172||f>=350)return null;
 const entry=bounce(f,188,19);
 const exit=tween(f,337,350,1,0);
 const state=f<280?0:f<296?1:2;
 return <>
  {f>=198&&f<247&&<div style={{position:'absolute',left:78,top:228,width:245,height:245,transform:`translateY(${(1-entry)*40}px) scale(${.9+.1*entry})`,opacity:entry*exit,boxShadow:'0 20px 35px #001b2033'}}><Img src={staticFile('assets/brand/logo.png')} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>}
  <KineticText start={217} end={247} x={80} y={630} size={52} width={240} tracking={-2} color={C.white}>você</KineticText>
  <KineticText start={226} end={247} x={80} y={710} size={51} width={310} tracking={-2} color={C.orange}>encontra</KineticText>
  {f>=260&&f<307&&<div style={{position:'absolute',left:65,top:1010,width:320,height:146,transform:`rotateY(${tween(f,260,306,-22,22)}deg) rotate(-8deg)`,filter:'drop-shadow(0 9px 0 #ff791b25)',perspective:1000}}><OpticalFrame variant={state} color={state===1?C.white:C.orange}/></div>}
  {f>=260&&f<307&&<div style={{position:'absolute',left:80,top:1208,display:'flex',gap:12}}>{[0,1,2].map(n=><div key={n} style={{width:n===state?54:14,height:8,background:n===state?C.orange:C.white,opacity:n===state?1:.4}}/>)}</div>}
  <KineticText start={307} end={347} x={80} y={1080} size={36} color={C.white} tracking={6}>SUA</KineticText>
  <KineticText start={307} end={347} x={77} y={1150} size={78} color={C.orange} tracking={-4} direction="left">NECESSIDADE.</KineticText>
  {f>=307&&<div style={{position:'absolute',left:80,top:1260,width:tween(f,307,322,0,790),height:6,background:C.white,opacity:exit}}/>}
 </>;
};

const Question=()=>{
 const f=useCurrentFrame();if(f<401||f>=497)return null;
 return <>
  <KineticText start={401} end={495} x={80} y={238} size={53} tracking={3} color={C.green}>QUER</KineticText>
  <KineticText start={418} end={495} x={260} y={243} size={43} tracking={2} color={C.green} direction="right">descobrir</KineticText>
  <KineticText start={430} end={495} x={75} y={340} size={176} tracking={-10} color={C.green} direction="left" scaleFrom={.48}>QUANTO</KineticText>
  <KineticText start={439} end={495} x={78} y={551} size={77} tracking={-4} color={C.orange}>ficaria</KineticText>
  <KineticText start={455} end={495} x={336} y={551} size={78} tracking={-4} color={C.green} direction="right">o seu?</KineticText>
  {f>=455&&<div style={{position:'absolute',left:745,top:655,color:C.orange,fontSize:195,fontWeight:800,transform:`rotate(${tween(f,455,480,20,-6)}deg) scale(${.5+.5*bounce(f,455)})`,opacity:interpolate(f,[487,497],[1,0],clamp)}}>?</div>}
  <svg style={{position:'absolute',left:80,top:670,width:520,height:80}} viewBox="0 0 520 80"><path d="M0 15 Q130 65 280 20 T520 20" fill="none" stroke={C.orange} strokeWidth="5" strokeDasharray="550" strokeDashoffset={tween(f,439,460,550,0)}/></svg>
 </>;
};

const CTA=()=>{
 const f=useCurrentFrame();if(f<522)return null;
 const p=cameraAt(f).cta;
 const logoP=bounce(f,546,18);
 return <>
  <div style={{position:'absolute',left:78,top:195,width:212,height:6,background:C.orange,transform:`scaleX(${p})`,transformOrigin:'left'}}/>
  <KineticText start={533} x={78} y={290} size={77} width={290} tracking={-4} color={C.white} direction="left">CHAMA</KineticText>
  <KineticText start={539} x={80} y={388} size={42} width={270} tracking={1} color={C.orange}>A</KineticText>
  <KineticText start={544} x={77} y={456} size={77} width={290} tracking={-4} color={C.white} direction="left">GENTE</KineticText>
  {f>=546&&<div style={{position:'absolute',left:80,top:755,width:300,height:300,opacity:Math.min(1,logoP*2),transform:`translateY(${(1-logoP)*90}px) rotate(${(1-logoP)*-5}deg) scale(${.8+.2*logoP})`,transformOrigin:'center',clipPath:`inset(${Math.max(0,1-logoP)*100}% 0 0 0)`,boxShadow:'0 24px 55px #001b2038'}}><Img src={staticFile('assets/brand/logo.png')} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>}
  <KineticText start={547} x={83} y={1239} size={29} tracking={6} color={C.white}>NO</KineticText>
  <KineticText start={557} x={75} y={1300} size={119} width={850} tracking={-7} color={C.white} direction="left" scaleFrom={.68}>WhatsApp</KineticText>
  {f>=557&&<div style={{position:'absolute',left:820,top:1295,fontSize:123,color:C.orange,fontWeight:800,transform:`translate(${(1-bounce(f,557))*-80}px,${(1-bounce(f,557))*70}px) rotate(-7deg)`}}>↗</div>}
  <KineticText start={573} x={81} y={1463} size={29} tracking={5} color={C.white}>FAÇA O SEU</KineticText>
  <KineticText start={585} x={77} y={1520} size={80} tracking={-4} color={C.orange} direction="right" scaleFrom={.67}>ORÇAMENTO.</KineticText>
  <div style={{position:'absolute',left:80,top:1640,width:tween(f,585,607,0,830),height:6,background:C.orange}}/>
 </>;
};

const TransitionForeground=()=>{
 const f=useCurrentFrame();
 return <>
  {f>=168&&f<=185&&<div style={{position:'absolute',top:-250,left:tween(f,168,185,-1450,1900),width:1020,height:2420,background:C.green,transform:'skewX(-17deg)',borderRight:`80px solid ${C.orange}`,boxShadow:'-25px 0 50px #07553288'}}/>}
  {f>=399&&f<=414&&<div style={{position:'absolute',left:350,top:630,width:700,height:700,borderRadius:'50%',border:`${tween(f,399,406,0,80)}px solid ${C.orange}`,transform:`translate(-50%,-50%) scale(${tween(f,399,414,.12,5)})`,opacity:interpolate(f,[399,403,410,414],[0,.9,.9,0],clamp)}}/>}
  {f>=519&&f<=539&&<div style={{position:'absolute',left:tween(f,519,539,1200,-450),top:-120,width:280,height:2180,background:C.orange,transform:'skewX(-14deg)',boxShadow:'0 0 30px #ff791b55'}}/>}
 </>;
};

const VisualStage=()=>{
 const f=useCurrentFrame();const camera=cameraAt(f);
 const styles=interpolate(f,[169,184,337,350],[0,1,1,0],clamp);
 const gradient=f<350?.20:.06;
 return <AbsoluteFill style={{background:C.green,overflow:'hidden'}}>
  <div style={{...cameraStyle(f),overflow:'hidden',borderRadius:camera.cta*54,boxShadow:camera.cta>0?'0 24px 90px #002c2380':undefined}}>
   <OffthreadVideo src={staticFile('0.mp4')} muted style={{width:'100%',height:'100%',objectFit:'contain'}}/>
   <AbsoluteFill style={{background:`linear-gradient(180deg,rgba(0,35,15,${gradient}) 0%,transparent 40%,transparent 56%,rgba(0,25,12,.52) 100%)`}}/>
  </div>
  {styles>0&&<div style={{position:'absolute',left:-80,top:0,width:390,height:1920,background:C.green,opacity:styles,transform:`translateX(${tween(f,169,184,-470,0)}px) skewX(-4deg)`,borderRight:`9px solid ${C.orange}`}}/>}
  {camera.cta>0&&<>
   <div style={{position:'absolute',right:0,top:0,width:60,height:1920,background:C.orange,transform:`translateX(${(1-camera.cta)*80}px)`}}/>
   <div style={{position:'absolute',left:-220,top:1700,width:1490,height:320,background:C.orange,transform:`translateY(${(1-camera.cta)*400}px) rotate(-10deg)`}}/>
  </>}
  <DepthType/>
  <ForegroundPresenter/>
  <HookForeground/>
  <StylesForeground/>
  <Question/>
  <CTA/>
  <TransitionForeground/>
 </AbsoluteFill>;
};

const cues=[
 {f:0,file:'whip',v:.42}, {f:53,file:'punch',v:.40}, {f:64,file:'punch',v:.40}, {f:77,file:'type-pop',v:.40},
 {f:103,file:'punch',v:.52}, {f:168,file:'whip',v:.46}, {f:248,file:'whip',v:.36}, {f:260,file:'type-pop',v:.44},
 {f:399,file:'whip',v:.34}, {f:430,file:'punch',v:.38}, {f:501,file:'riser',v:.45},
 {f:519,file:'whip',v:.50}, {f:546,file:'type-pop',v:.37}, {f:557,file:'punch',v:.43}, {f:585,file:'resolve',v:.40},
];

export const OticaDescontaoV3=({motionBlurEnabled=true}:{motionBlurEnabled?:boolean})=>{
 const f=useCurrentFrame();const fast=hasFastMotion(f);
 return <AbsoluteFill style={{fontFamily:'Manrope,Arial,sans-serif',background:C.green}}>
  <style>{`@font-face {font-family:Manrope;src:url('${staticFile('assets/fonts/Manrope.ttf')}') format('truetype');font-weight:200 800;font-display:block;} *{box-sizing:border-box;}`}</style>
  <HtmlInCanvasMotionBlur width={1080} height={1920} samples={fast&&motionBlurEnabled?5:1} shutterAngle={240} disabled={!fast||!motionBlurEnabled}>
   <VisualStage/>
  </HtmlInCanvasMotionBlur>
  <CaptionsV3/>
  <Audio src={staticFile('assets/audio/voice-normalized.wav')} volume={.94}/>
  <Audio src={staticFile('assets/audio/original-bed.wav')} volume={1}/>
  {cues.map(({f:from,file,v})=><Sequence key={`${from}-${file}`} from={from} durationInFrames={file==='riser'?21:15}><Audio src={staticFile(`assets/v3/audio/${file}.wav`)} volume={v}/></Sequence>)}
 </AbsoluteFill>;
};
