import React from 'react';
import {interpolate,useCurrentFrame} from 'remotion';
import {bounce,clamp,COLORS} from './motion';

type Props={children:React.ReactNode;start:number;end?:number;x:number;y:number;size:number;color?:string;width?:number;rotate?:number;direction?:'up'|'left'|'right';outline?:boolean;weight?:number;tracking?:number;scaleFrom?:number};

export const KineticText=({children,start,end=660,x,y,size,color=COLORS.white,width=900,rotate=0,direction='up',outline=false,weight=800,tracking=-4,scaleFrom=.78}:Props)=>{
 const f=useCurrentFrame();if(f<start||f>=end)return null;
 const p=bounce(f,start,14);
 const exit=interpolate(f,[end-8,end],[0,1],clamp);
 const dx=direction==='left'?-180*(1-p):direction==='right'?180*(1-p):0;
 const dy=direction==='up'?65*(1-p):0;
 return <div style={{position:'absolute',left:x,top:y,width,transform:`translate(${dx+exit*70}px,${dy-exit*28}px) rotate(${rotate}deg) scale(${scaleFrom+(1-scaleFrom)*p})`,transformOrigin:'left center',opacity:Math.min(1,p*2)*(1-exit),filter:`blur(${Math.max(0,1-p)*5+exit*3}px)`,clipPath:`inset(${Math.max(0,1-p)*95}% -8% -12% -8%)`,fontSize:size,lineHeight:1.04,fontWeight:weight,letterSpacing:interpolate(f,[start,start+14],[tracking+7,tracking],clamp),color:outline?'transparent':color,WebkitTextStroke:outline?`2.5px ${color}`:undefined,textShadow:outline?undefined:'0 3px 18px rgba(0,30,15,.16)',whiteSpace:'pre-line'}}>{children}</div>;
};
