import React from 'react';
import {AbsoluteFill,Audio,Img,OffthreadVideo,Sequence,interpolate,spring,staticFile,useCurrentFrame} from 'remotion';
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {KineticText} from '../v3/KineticText';
import {segments,sourceAt,outputAt,mappedWords,duration} from '../v4/timeline';

const orange='#FF791B',white='#FFFDF6',green='#075532';
const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const at=(s:number)=>Math.round(outputAt(s*30));
const ease=(f:number,a:number,b:number,x:number,y:number)=>interpolate(f,[a,b],[x,y],clamp);
const keys=[
 [0,1.04,0,0],[4,1.10,-10,28],[15,1.10,-10,28],
 [16,1.17,-18,65],[26,1.15,-18,58],[29,1.08,8,25],
 [42,1.08,8,25],[55,1.20,-30,90],[65,1.18,-24,82],[108,1.12,0,52],
 [109,1.04,0,0],[131,1.08,10,28],[162,1.12,25,45],
 [176,1.18,70,88],[191,1.16,65,78],[223,1.07,-25,24],
 [249,1.13,-36,55],[275,1.17,-36,70],[284,1.17,-36,70],
 [285,1.035,0,0],[302,1.07,-18,20],[317,1.17,-30,70],
 [333,1.15,-25,60],[359,1.18,-25,72],[366,1.18,-25,72],
 [367,1.04,0,0],[377,1.12,22,30],[395,1.10,18,25],
 [409,1.14,25,40],[427,1.08,0,16],[441,1.11,0,30],[463,1.13,0,42],
];
const camera=(f:number)=>{
 const a=keys.map(k=>k[0]);
 return {scale:interpolate(f,a,keys.map(k=>k[1]),clamp),x:interpolate(f,a,keys.map(k=>k[2]),clamp),y:interpolate(f,a,keys.map(k=>k[3]),clamp)};
};
const cameraCSS=(f:number)=>{const c=camera(f);return {position:'absolute' as const,inset:0,transform:`translate(${c.x}px,${c.y}px) scale(${c.scale})`,transformOrigin:'50% 32%'};};
const fast=(f:number)=>[[0,6],[15,24],[28,35],[53,61],[105,114],[175,183],[219,227],[282,291],[314,322],[365,380],[407,415],[425,434]].some(([a,b])=>f>=a&&f<b);

const Source=()=>{let cursor=0;return <>{segments.map((s,i)=>{const from=cursor;cursor+=s.end-s.start;return <Sequence key={i} from={from} durationInFrames={s.end-s.start}><OffthreadVideo src={staticFile('0.mp4')} trimBefore={s.start} muted style={{width:'100%',height:'100%',objectFit:'cover'}}/></Sequence>;})}</>;};
const Depth=()=>{
 const f=useCurrentFrame(),s=Math.round(sourceAt(f));
 const valid=(s>=64&&s<=150)||(s>=260&&s<=292);
 if(!valid)return null;
 return <div style={{...cameraCSS(f),maskImage:'linear-gradient(to bottom,black 0%,black 36%,transparent 53%)',pointerEvents:'none',filter:'brightness(.97)'}}><Img src={staticFile(`assets/v3/mattes/presenter-${String(s).padStart(4,'0')}.webp`)} style={{width:'100%',height:'100%'}}/></div>;
};
const Type=({children,start,end,x=80,y=320,size=140,color=white,width=940,direction='up',tracking=-5}:{children:React.ReactNode;start:number;end:number;x?:number;y?:number;size?:number;color?:string;width?:number;direction?:'up'|'left'|'right';tracking?:number})=><KineticText start={start} end={end} x={x} y={y} size={size} color={color} width={width} tracking={tracking} direction={direction} scaleFrom={.8}>{children}</KineticText>;

const Behind=()=> <>
 <Type start={at(2.12)} end={at(3.42)} x={65} y={275} size={178}>ÓCULOS</Type>
 <Type start={at(3.44)} end={at(5.03)} x={90} y={290} size={205} color={orange}>MENOS</Type>
 <Type start={at(8.66)} end={at(9.76)} x={70} y={290} size={174} color={orange}>ESTILOS</Type>
</>;

const Foreground=()=>{
 const f=useCurrentFrame();
 const logoStart=at(18.12),p=spring({frame:f-logoStart,fps:30,config:{damping:17,stiffness:180}});
 return <>
 <Type start={at(1.76)} end={at(2.8)} x={75} y={220} size={36} color={white} tracking={6}>SEUS</Type>
 <Type start={at(2.56)} end={at(3.40)} x={610} y={1070} size={104} color={orange} width={400} direction="right">novos.</Type>
 <Type start={at(3.06)} end={at(5.03)} x={96} y={1110} size={38} tracking={4}>PODEM CUSTAR</Type>
 <Type start={at(6.26)} end={at(7.21)} x={80} y={1125} size={38} color={white} tracking={2}>NA ÓTICA DESCONTÃO</Type>
 <Type start={at(8.26)} end={at(9.76)} x={75} y={235} size={43} tracking={4}>DIFERENTES</Type>
 <Type start={at(10.22)} end={284} x={75} y={1120} size={77} color={orange} tracking={-3}>necessidade.</Type>
 <Type start={at(13.38)} end={367} x={90} y={1110} size={40} tracking={1}>QUER DESCOBRIR</Type>
 <Type start={at(14.32)} end={367} x={80} y={280} size={165}>QUANTO</Type>
 <Type start={at(14.62)} end={367} x={95} y={475} size={58} color={orange} tracking={-2}>ficaria o seu?</Type>
 {f>=logoStart&&<div style={{position:'absolute',left:255,top:55,width:570,height:285,opacity:Math.min(1,p*2),transform:`translateY(${(1-p)*-35}px) scale(${.9+.1*p})`,clipPath:`inset(${Math.max(0,1-p)*100}% 0 0 0)`,filter:'drop-shadow(0 3px 4px #ffffffcc)'}}><Img src={staticFile('assets/v4/logonova.png')} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>}
 <Type start={at(17.76)} end={duration+20} x={80} y={1160} size={49} tracking={2}>CHAMA A GENTE</Type>
 <Type start={at(18.56)} end={duration+20} x={75} y={1240} size={125} color={orange}>WhatsApp ↗</Type>
 <Type start={at(19.10)} end={duration+20} x={84} y={1400} size={38} tracking={5}>FAÇA O SEU</Type>
 <Type start={at(19.50)} end={duration+20} x={80} y={1470} size={85} color={white} tracking={-3}>ORÇAMENTO.</Type>
 {f>=at(19.5)&&<div style={{position:'absolute',left:84,top:1582,width:ease(f,at(19.5),at(19.5)+12,0,650),height:5,background:orange}}/>}
 </>;
};

const chunks=[[0,2],[3,5],[6,9],[10,14],[15,16],[17,18],[19,21],[22,24],[25,26],[27,30],[31,33],[34,35],[36,40]];
const impact=new Set(['óculos','novos','menos','Descontão','estilos','necessidade.','quanto','WhatsApp','orçamento.']);
const Captions=()=>{
 const f=useCurrentFrame();const chunk=chunks.find(([a,b])=>f>=mappedWords[a].start&&f<mappedWords[b].end+2);
 if(!chunk)return null;const [a,b]=chunk;
 const cta=f>=367;
 return <div style={{position:'absolute',left:100,top:cta?1660:1430,width:850,textAlign:'center',color:white,fontStyle:'italic',fontWeight:650,lineHeight:1.04,filter:'drop-shadow(0 3px 3px #000a)'}}>
 {mappedWords.slice(a,b+1).map((w,i)=>{if(f<w.start)return null;const p=spring({frame:f-Math.ceil(w.start),fps:30,config:{damping:19,stiffness:240}});const key=impact.has(w.text);return <span key={i} style={{display:'inline-block',margin:'0 8px',fontSize:cta?47:key?78:57,fontWeight:key?800:650,letterSpacing:key?-2:-1,color:key&&f<w.end?orange:white,opacity:Math.min(1,p*3),transform:`translate(${a%3===0?(1-p)*-20:0}px,${(1-p)*(a%2?24:0)}px) scale(${.91+.09*p})`,filter:`blur(${Math.max(0,1-p)*3}px)`}}>{w.text}</span>;})}
 </div>;
};

const Visual=()=>{
 const f=useCurrentFrame();
 const cut=[108,285,367].find(n=>Math.abs(f-n)<4);
 return <AbsoluteFill style={{overflow:'hidden',background:'#26342d'}}>
 <div style={cameraCSS(f)}><Source/></div>
 <AbsoluteFill style={{background:'linear-gradient(180deg,#001a1218 0%,transparent 40%,transparent 52%,#00140bbb 100%)'}}/>
 <Behind/><Depth/><Foreground/>
 {cut!==undefined&&<AbsoluteFill style={{backdropFilter:`blur(${Math.max(0,4-Math.abs(f-cut))*1.3}px)`,transform:`translateX(${Math.sin((f-cut)*.9)*10}px)`,background:`rgba(255,253,246,${Math.max(0,1-Math.abs(f-cut)/3)*.12})`}}/>}
 </AbsoluteFill>;
};
const cues=[{f:0,s:'punch',v:.32},{f:at(2.12),s:'punch',v:.36},{f:at(2.56),s:'type-pop',v:.28},{f:at(3.44),s:'punch',v:.40},{f:106,s:'whip',v:.32},{f:at(8.66),s:'type-pop',v:.30},{f:283,s:'whip',v:.27},{f:at(14.32),s:'punch',v:.35},{f:365,s:'whip',v:.32},{f:at(18.12),s:'type-pop',v:.28},{f:at(18.56),s:'punch',v:.34},{f:at(19.5),s:'resolve',v:.30}];
export const OticaDescontaoV4=()=>{
 const f=useCurrentFrame();return <AbsoluteFill style={{fontFamily:'Manrope,Arial,sans-serif'}}>
 <style>{`@font-face{font-family:Manrope;src:url('${staticFile('assets/fonts/Manrope.ttf')}') format('truetype');font-weight:200 800;font-display:block;}*{box-sizing:border-box;}`}</style>
 <HtmlInCanvasMotionBlur width={1080} height={1920} samples={fast(f)?5:1} shutterAngle={180} disabled={!fast(f)}><Visual/></HtmlInCanvasMotionBlur>
 <Captions/>
 <Audio src={staticFile('assets/v4/voice.wav')}/><Audio src={staticFile('assets/v4/music.wav')}/>
 {cues.map(({f:from,s,v})=><Sequence key={`${from}-${s}`} from={from} durationInFrames={15}><Audio src={staticFile(`assets/v3/audio/${s}.wav`)} volume={v}/></Sequence>)}
 </AbsoluteFill>;
};
