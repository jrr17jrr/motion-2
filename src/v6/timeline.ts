import {words} from '../media/captions';
// Audio waveform checked before choosing boundaries. Preserve all spoken onsets.
export const segments=[{start:48,end:144},{start:162,end:321},{start:390,end:465},{start:525,end:606}];
export const footageDuration=segments.reduce((sum,s)=>sum+s.end-s.start,0);
export const holdFrames=0;
// No frozen or replayed footage. The final 60 frames contain brand/CTA only.
export const outroFrames=60;
export const duration=footageDuration+outroFrames;
export const sourceAt=(f:number)=>{let cursor=0;for(const s of segments){if(f<cursor+s.end-s.start)return s.start+f-cursor;cursor+=s.end-s.start;}return 605;};
export const outputAt=(source:number)=>{let cursor=0;for(const s of segments){if(source>=s.start&&source<s.end)return cursor+source-s.start;cursor+=s.end-s.start;}return -1;};
// DTW token positions are estimates, not safe edit boundaries. Speech entries and
// endings below are refined against the waveform; previous versions stay intact.
const starts=[1.69,1.99,2.41,2.72,2.93,3.29,3.49,3.57,3.80,4.28,5.50,5.86,5.96,6.13,6.45,7.10,7.41,8.12,8.53,8.84,9.08,9.35,9.53,9.69,10.06,13.09,13.67,14.17,14.48,14.83,14.99,17.61,17.87,18.00,18.13,18.42,18.82,18.96,19.12,19.18,19.37];
const ends:Record<number,number>={9:4.69,14:7.05,24:10.59,30:15.27,40:19.97};
export const mappedWords=words.map((w,i)=>({...w,sourceStart:starts[i],start:Math.round(outputAt(starts[i]*30)),end:Math.round(outputAt((ends[i]??starts[i+1])*30))}));
export const wordFrame=(i:number)=>mappedWords[i].start;
