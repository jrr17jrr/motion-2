import React from 'react';
import {useCurrentFrame} from 'remotion';
import {words} from '../media/captions';
import {bounce,COLORS,frameAt,tween} from './motion';

const chunks=[
 [0,1],[2,3],[4,5],[6,7],[8,9],[10,12],[13,14],[15,16],[17,18],
 [19,20],[21,23],[24,24],[25,26],[27,28],[29,30],[31,33],[34,35],[36,37],[38,40],
];
const keys=new Set(['óculos','novos','menos','Descontão','estilos','necessidade.','quanto','WhatsApp','orçamento.']);

export const CaptionsV3=()=>{
 const f=useCurrentFrame(),t=f/30;
 const group=chunks.find(([a,b])=>t>=words[a].start&&t<words[b].end+.07);
 if(!group)return null;
 const [a,b]=group;
 const styleScene=t>=5.7&&t<11.7;
 const cta=tween(f,522,540,0,1);
 const left=(styleScene?310:90)*(1-cta)+440*cta;
 const width=(styleScene?590:810)*(1-cta)+450*cta;
 const top=1420*(1-cta)+1110*cta;
 return <div style={{position:'absolute',left,top,width,display:'flex',justifyContent:cta>.5?'flex-start':'center',alignItems:'baseline',gap:14,flexWrap:'wrap',lineHeight:1.05,filter:'drop-shadow(0 3px 4px #001b10)'}}>
  {words.slice(a,b+1).map((w,i)=>{
   const start=frameAt(w.start);if(f<start)return null;
   const p=bounce(f,start,18),key=keys.has(w.text),active=t<w.end;
   return <div key={`${a+i}`} style={{position:'relative',fontSize:cta>.5?45:key?74:54,fontWeight:key?800:600,color:active&&key?COLORS.orange:COLORS.white,transform:`translateY(${(1-p)*28}px) scale(${.86+.14*p})`,opacity:Math.min(1,p*3),filter:`blur(${Math.max(0,1-p)*2.5}px)`,letterSpacing:key?-2:-1}}>
    {key&&<span style={{position:'absolute',left:-4,right:-4,height:8,bottom:-10,background:active?COLORS.orange:COLORS.green,transform:`scaleX(${Math.min(1,p)}) rotate(-2deg)`,transformOrigin:'left'}}/>}
    <span style={{position:'relative'}}>{w.text}</span>
   </div>;
  })}
 </div>;
};
