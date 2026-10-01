import React from 'react';
import {AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {captionGroups} from '../media/captions';

const C={orange:'#F57928',green:'#185A3C',white:'#FFF9EF',ink:'#153C2B'};
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const at=(seconds:number)=>Math.round(seconds*30);
const ease=(f:number,a:number,b:number,x:number,y:number)=>interpolate(f,[a,b],[x,y],{...clamp,easing:Easing.inOut(Easing.cubic)});

const Glasses=({variant=0,color=C.green}:{variant?:number;color?:string})=>(
  <svg viewBox="0 0 440 180" width="100%" height="100%" fill="none" aria-hidden>
    <g stroke={color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
      {variant===1?<><circle cx="110" cy="96" r="67"/><circle cx="330" cy="96" r="67"/></>:<><rect x="35" y="37" width="151" height="119" rx={variant===2?25:49}/><rect x="254" y="37" width="151" height="119" rx={variant===2?25:49}/></>}
      <path d="M186 78 Q220 55 254 78 M35 59 L15 46 M405 59 L425 46"/>
    </g>
  </svg>
);

const Reveal=({children,delay=0}:{children:React.ReactNode;delay?:number})=>{
  const f=useCurrentFrame();const {fps}=useVideoConfig();
  const p=spring({frame:f-delay,fps,config:{damping:17,stiffness:150,mass:.8}});
  return <div style={{overflow:'hidden',padding:'7px 0'}}><div style={{transform:`translateY(${(1-p)*115}%)`,opacity:Math.min(1,p*2),filter:`blur(${Math.max(0,1-p)*4}px)`}}>{children}</div></div>;
};

const Scene=({children,from,to}:{children:React.ReactNode;from:number;to:number})=>{
  const f=useCurrentFrame();const end=at(to)-at(from);
  return <div style={{opacity:interpolate(f,[0,5,end-7,end],[0,1,1,0],clamp)}}>{children}</div>;
};

const Hook=()=>{
 const f=useCurrentFrame();const p=spring({frame:f,fps:30,config:{damping:16}});
 return <div style={{position:'absolute',left:82,top:212,width:812}}>
  <Reveal><div style={{fontSize:34,fontWeight:650,letterSpacing:8,color:C.green}}>SEUS</div></Reveal>
  {f>=at(.36)&&<Reveal delay={at(.36)}><div style={{fontSize:137,lineHeight:1,fontWeight:850,letterSpacing:-8,color:C.green}}>ÓCULOS</div></Reveal>}
  {f>=at(.8)&&<div style={{display:'inline-block',marginTop:6,background:C.orange,color:C.white,padding:'7px 29px 14px',borderRadius:15,fontSize:61,fontWeight:800,transform:`rotate(-3deg) scale(${Math.min(1.04,p)})`,boxShadow:'0 15px 35px #583d2225'}}>NOVOS</div>}
 </div>;
};

const PriceHook=()=>{
 const f=useCurrentFrame();const p=spring({frame:f,fps:30,config:{damping:16,stiffness:140}});
 return <div style={{position:'absolute',left:82,top:208,width:812,perspective:1200}}>
  <div style={{background:C.green,color:C.white,borderRadius:28,padding:'16px 30px 20px',transform:`translateY(${(1-p)*40}px) rotateX(${(1-p)*12}deg)`,boxShadow:'0 22px 50px #153c2b30'}}>
   <div style={{fontSize:24,letterSpacing:6,fontWeight:600}}>PODEM CUSTAR</div>
   <Reveal><div style={{fontSize:112,lineHeight:1,fontWeight:850,letterSpacing:interpolate(f,[0,18],[4,-5],clamp)}}>MENOS<span style={{color:C.orange}}>↘</span></div></Reveal>
   {f>=30&&<Reveal delay={30}><div style={{fontSize:28,fontWeight:650}}>do que você imagina.</div></Reveal>}
  </div>
 </div>;
};

const BrandMoment=()=> <div style={{position:'absolute',left:82,top:207,width:812,color:C.white}}>
 <Reveal><div style={{display:'inline-block',background:C.orange,borderRadius:14,padding:'12px 23px',fontSize:31,fontWeight:750,letterSpacing:6}}>ÓTICA</div></Reveal>
 <Reveal delay={9}><div style={{fontSize:96,fontWeight:850,letterSpacing:-5,lineHeight:1.1,textShadow:'0 5px 24px #0005'}}>DESCONTÃO</div></Reveal>
 <div style={{width:130,height:7,background:C.orange,borderRadius:10,marginTop:14}}/>
</div>;

const StylesMoment=()=>{
 const f=useCurrentFrame();
 return <div style={{position:'absolute',left:82,top:224,width:812}}>
   <Reveal><div style={{color:C.white,fontSize:33,fontWeight:650,letterSpacing:5,textShadow:'0 2px 14px #0007'}}>DIFERENTES</div></Reveal>
   {f>=12&&<Reveal delay={12}><div style={{color:C.white,fontSize:103,fontWeight:850,letterSpacing:-4,lineHeight:1.1,textShadow:'0 4px 24px #0008'}}>ESTILOS<span style={{color:C.orange}}>↗</span></div></Reveal>}
   <div style={{display:'flex',gap:16,position:'absolute',top:878,width:'100%',perspective:1200}}>
    {[0,1,2].map((n)=>{
      const p=spring({frame:f-15-n*4,fps:30,config:{damping:19,stiffness:140}});
      return <div key={n} style={{width:260,height:148,padding:16,borderRadius:22,background:n===1?C.orange:C.white,boxShadow:'0 18px 34px #0003',transform:`translateY(${(1-p)*80}px) rotateY(${(1-p)*25+(n-1)*8}deg)`,opacity:p}}><Glasses variant={n} color={n===1?C.white:C.green}/></div>;
    })}
   </div>
 </div>;
};

const NeedMoment=()=>{
 const f=useCurrentFrame();return <div style={{position:'absolute',top:235,left:82,width:812}}>
  <Reveal><div style={{color:C.white,fontSize:29,fontWeight:650,letterSpacing:5,textShadow:'0 3px 20px #0008'}}>DE ACORDO COM A SUA</div></Reveal>
  <Reveal delay={5}><div style={{color:C.white,fontSize:72,fontWeight:850,letterSpacing:-3,textShadow:'0 4px 24px #0008'}}>NECESSIDADE.</div></Reveal>
  <div style={{width:ease(f,8,35,0,760),height:6,background:C.orange,marginTop:12,borderRadius:5}}/>
 </div>;
};

const QuestionMoment=()=>{
 const f=useCurrentFrame();
 return <div style={{position:'absolute',left:82,top:235,width:812,perspective:1200}}>
  <Reveal><div style={{fontSize:34,fontWeight:650,color:C.green,letterSpacing:4}}>QUER DESCOBRIR</div></Reveal>
  {f>=28&&<Reveal delay={28}><div style={{fontSize:125,fontWeight:850,color:C.green,lineHeight:1,letterSpacing:-6}}>QUANTO</div></Reveal>}
  {f>=37&&<Reveal delay={37}><div style={{fontSize:82,fontWeight:750,color:C.orange,letterSpacing:-4}}>ficaria o seu?</div></Reveal>}
  <div style={{position:'absolute',right:18,top:350,fontSize:150,fontWeight:800,color:C.orange,transform:`translateY(${Math.sin(f/14)*8}px) rotate(8deg)`,opacity:ease(f,50,65,0,1)}}>?</div>
 </div>;
};

const ChatIcon=()=> <svg width="59" height="59" viewBox="0 0 64 64" fill="none"><path d="M51 30c0 12-9 21-21 21-4 0-8-1-11-3L9 52l3-12c-2-3-3-6-3-10C9 18 18 9 30 9s21 9 21 21Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="M20 24h20M20 32h16" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>;
const CtaMoment=()=>{
 const f=useCurrentFrame();const p=spring({frame:f-24,fps:30,config:{damping:18,stiffness:145}});
 return <>
  <div style={{position:'absolute',left:82,top:1030,width:812}}>
   <Reveal><div style={{fontSize:36,fontWeight:750,color:C.white,textShadow:'0 3px 15px #0008'}}>Chama a gente</div></Reveal>
   {f>=24&&<div style={{display:'flex',alignItems:'center',gap:22,background:C.green,color:C.white,padding:'16px 26px',borderRadius:24,marginTop:6,boxShadow:'0 18px 45px #153c2b35',transform:`translateY(${(1-p)*55}px) scale(${.96+.04*p})`,opacity:p}}><ChatIcon/><span style={{fontSize:70,fontWeight:800,letterSpacing:-3}}>WhatsApp</span><span style={{fontSize:49,marginLeft:'auto'}}>↗</span></div>}
  </div>
  {f>=at(1.74)&&<div style={{position:'absolute',left:82,top:1245,width:812,background:C.white,color:C.green,padding:'14px 30px 16px',borderRadius:24,boxShadow:'0 22px 55px #0003'}}>
   <Reveal delay={at(1.74)}><div style={{fontSize:22,fontWeight:700,letterSpacing:5}}>FAÇA O SEU</div></Reveal>
   <Reveal delay={at(1.82)}><div style={{fontSize:65,fontWeight:850,letterSpacing:-3}}>ORÇAMENTO<span style={{color:C.orange}}> ↗</span></div></Reveal>
  </div>}
  {f>=at(2.4)&&<div style={{position:'absolute',left:82,top:1584,color:C.white,fontSize:27,fontWeight:800,letterSpacing:2,textShadow:'0 2px 8px #0008'}}>ÓTICA <span style={{color:C.orange}}>DESCONTÃO</span></div>}
 </>;
};

const Captions=()=>{
 const f=useCurrentFrame(),t=f/30;const group=captionGroups.find(g=>t>=g.start&&t<g.end+.06);
 if(!group)return null;
 return <div style={{position:'absolute',left:82,top:1450,width:812,display:'flex',justifyContent:'center'}}>
  <div style={{background:'rgba(18,38,28,.88)',border:'1px solid #ffffff26',borderRadius:20,padding:'15px 24px 18px',color:C.white,fontSize:44,fontWeight:700,lineHeight:1.25,textAlign:'center',boxShadow:'0 10px 26px #0002',maxWidth:812}}>
   {group.words.map((w,i)=><React.Fragment key={i}><span style={{color:t>=w.start&&t<w.end? '#FFAA61':C.white}}>{w.text}</span>{i<group.words.length-1?' ':''}</React.Fragment>)}
  </div>
 </div>;
};

export const OticaDescontao=()=>{
 const f=useCurrentFrame();
 // The original source plays continuously at 1x: no trims, retiming or reordering.
 const scale=interpolate(f,[0,52,63,83,103,156,168,239,259,336,351,390,460,517,534,624],[1,1.025,1.04,1.04,1.055,1.055,1,1,1.025,1.025,1,1,1.035,1.035,1,1.012],clamp);
 const stage=f>=at(5.7)&&f<at(11.7);
 return <AbsoluteFill style={{fontFamily:'Manrope, Arial, sans-serif',background:C.ink}}>
  <style>{`@font-face {font-family:Manrope;src:url('${staticFile('assets/fonts/Manrope.ttf')}') format('truetype');font-weight:200 800;font-display:block;} *{box-sizing:border-box;}`}</style>
  <AbsoluteFill style={{transform:`scale(${scale})`,transformOrigin:f<168?'50% 43%':f<351?'50% 40%':f<534?'50% 57%':'50% 48%'}}>
   <OffthreadVideo src={staticFile('0.mp4')} muted style={{width:'100%',height:'100%',objectFit:'contain'}}/>
  </AbsoluteFill>
  <Audio src={staticFile('assets/audio/voice-normalized.wav')} volume={1}/>
  <Audio src={staticFile('assets/audio/original-bed.wav')} volume={1}/>
  <AbsoluteFill style={{background:`linear-gradient(180deg, rgba(15,35,23,${stage?.43:.06}) 0%, rgba(15,35,23,0) 35%, rgba(15,35,23,0) 60%, rgba(15,35,23,.35) 100%)`,pointerEvents:'none'}}/>
  <div style={{position:'absolute',top:154,left:82,width:812,display:'flex',alignItems:'center',gap:12,opacity:.9}}><span style={{width:38,height:5,borderRadius:8,background:C.orange}}/><span style={{fontSize:21,letterSpacing:4,fontWeight:750,color:stage?C.white:C.green}}>ÓTICA DESCONTÃO</span></div>
  {f<at(1.75)&&<div style={{position:'absolute',left:640,top:260,width:390,height:150,opacity:.28*interpolate(f,[0,15,45,53],[0,1,1,0],clamp),transform:`translateX(${ease(f,0,53,50,-15)}px) rotate(-12deg)`}}><Glasses color={C.orange}/></div>}
  <Sequence from={at(1.76)} durationInFrames={at(3.44)-at(1.76)}><Scene from={1.76} to={3.44}><Hook/></Scene></Sequence>
  <Sequence from={at(3.44)} durationInFrames={at(5.65)-at(3.44)}><Scene from={3.44} to={5.65}><PriceHook/></Scene></Sequence>
  <Sequence from={at(6.26)} durationInFrames={at(8.18)-at(6.26)}><Scene from={6.26} to={8.18}><BrandMoment/></Scene></Sequence>
  <Sequence from={at(8.26)} durationInFrames={at(10.15)-at(8.26)}><Scene from={8.26} to={10.15}><StylesMoment/></Scene></Sequence>
  <Sequence from={at(10.22)} durationInFrames={at(11.6)-at(10.22)}><Scene from={10.22} to={11.6}><NeedMoment/></Scene></Sequence>
  <Sequence from={at(13.38)} durationInFrames={at(16.5)-at(13.38)}><Scene from={13.38} to={16.5}><QuestionMoment/></Scene></Sequence>
  <Sequence from={at(17.76)}><CtaMoment/></Sequence>
  <Captions/>
  {[2.12,3.44,8.66,14.32].map(t=><Sequence key={t} from={at(t)} durationInFrames={12}><Audio src={staticFile('assets/audio/soft-hit.wav')} volume={.38}/></Sequence>)}
  {[6.26,8.26,13.38].map(t=><Sequence key={t} from={at(t)} durationInFrames={13}><Audio src={staticFile('assets/audio/air-swipe.wav')} volume={.33}/></Sequence>)}
  {[18.56,19.5].map(t=><Sequence key={t} from={at(t)} durationInFrames={13}><Audio src={staticFile('assets/audio/cta-chime.wav')} volume={.42}/></Sequence>)}
 </AbsoluteFill>;
};
