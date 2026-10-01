import {words} from '../media/captions';
// Bounds are source frames. Whole words and short breaths are retained.
export const segments=[{start:48,end:156},{start:169,end:346},{start:398,end:480},{start:527,end:623}];
export const duration=segments.reduce((sum,s)=>sum+s.end-s.start,0);
export const sourceAt=(f:number)=>{let cursor=0;for(const s of segments){const n=s.end-s.start;if(f<cursor+n)return s.start+f-cursor;cursor+=n;}return 622;};
export const outputAt=(source:number)=>{let cursor=0;for(const s of segments){if(source>=s.start&&source<s.end)return cursor+source-s.start;cursor+=s.end-s.start;}return -1;};
export const mappedWords=words.map(w=>({...w,start:outputAt(w.start*30),end:outputAt(w.end*30)}));
