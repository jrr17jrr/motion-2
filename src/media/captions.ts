export type CaptionWord = {text: string; start: number; end: number};
// Word onsets refined against Whisper medium DTW on the original audio.
export const words: CaptionWord[] = [
  ['Seus',1.76,2.12],['óculos',2.12,2.56],['novos',2.56,2.84],
  ['podem',2.84,3.06],['custar',3.06,3.44],['menos',3.44,3.62],
  ['do',3.62,3.68],['que',3.68,3.94],['você',3.94,4.42],['imagina.',4.42,5.03],
  ['Só',5.74,5.96],['que',5.96,6.06],['na',6.06,6.26],['Ótica',6.26,6.58],['Descontão',6.58,7.20],
  ['você',7.24,7.54],['encontra',7.54,8.26],['diferentes',8.26,8.66],['estilos',8.66,8.96],
  ['de',8.96,9.22],['acordo',9.22,9.48],['com',9.48,9.66],['a',9.66,9.82],['sua',9.82,10.22],['necessidade.',10.22,11.40],
  ['Quer',13.38,13.92],['descobrir',13.92,14.32],['quanto',14.32,14.62],['ficaria',14.62,14.96],['o',14.96,15.18],['seu?',15.18,15.72],
  ['Chama',17.76,17.98],['a',17.98,18.12],['gente',18.12,18.24],['no',18.24,18.56],['WhatsApp',18.56,18.96],
  ['e',18.96,19.10],['faça',19.10,19.24],['o',19.24,19.30],['seu',19.30,19.50],['orçamento.',19.50,20.08],
].map(([text,start,end])=>({text:text as string,start:start as number,end:end as number}));

export const captionGroups = [
 [0,2],[3,5],[6,9],[10,12],[13,14],[15,16],[17,18],[19,21],[22,24],
 [25,26],[27,30],[31,33],[34,35],[36,40],
].map(([first,last])=>({words:words.slice(first,last+1),start:words[first].start,end:words[last].end}));
