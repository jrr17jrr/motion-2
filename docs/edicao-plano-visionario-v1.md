# Plano Visionário — V1

Composition `PlanoVisionarioV1` (1080×1920, 30 FPS, 1123 frames / 37,44 s).
Render: `npm run render:pv` → `out/plano-visionario-editado-v1.mp4` (H.264 High, CRF 17, BT.709, AAC 256 kbps 48 kHz).
O render final e a cópia de trabalho não são versionados.

## Fonte e cópia de trabalho

O original `videoParaEditar/Plano Visionário(2).mov` é HEVC 10-bit **HDR (HLG/BT.2020)**, 2160×3840, 30 FPS, 37,454 s, AAC estéreo 44,1 kHz.
O Chrome do Remotion não decodifica isso de forma confiável, então foi gerada uma única cópia SDR (gitignored):

```
ffmpeg -i "videoParaEditar/Plano Visionário(2).mov" -vf "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,scale=1080:1920:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 14 -c:a aac -b:a 256k video/plano-visionario-work/source-sdr.mp4
```

Hable foi escolhido após comparar hable/mobius/conversão direta (a direta estoura céu e pele). O original nunca é modificado.

## Sincronização

1. `scripts/transcribe-pv.mjs` (whisper.cpp 1.5.5, modelos `small` e `medium`, timestamps por palavra).
2. O `small` atrasava até ~450 ms entre 12 e 25 s. `scripts/probe-windows-pv.mjs` transcreve janelas isoladas do áudio e confirmou o `medium` (ex.: "você paga seiscentos…" inteiro antes de 23,95 s).
3. Legendas entram 2 frames antes da sílaba.

A fala real difere do roteiro e foi priorizada: "você **conta com o** site profissional a partir de R$ 250 **por mês**", "um vídeo Motion Design, **ou, se preferir,** com a nossa modelo", "Clique no **link** abaixo, acesse o nosso link na bio e chame no WhatsApp" (sem "agora").

## Preservação

Cortes/transições originais medidos por diferença de frames: 5,6 · 12,1 · 14,63 · 19,0 · 21,6 · 26,1 · 29,33 · 32,4 s.
O vídeo é uma única `OffthreadVideo` contínua, sem cortes, velocidade ou reordenação. `scripts/review-pv.py` confirma que todos os picos de transição continuam no render, sem frames pretos ou congelados, e com áudio alinhado ao original (lag 0 ms, correlação 0,998).

## Direção

- Uma hierarquia de texto por vez, no torso (y≈900–1290): abaixo do queixo (rosto em y≈380–780 em todas as tomadas) e acima da faixa inferior de UI do Reels.
- Manrope 800/700, branco; palavras-chave em ciano `#00E1FF`; entrada palavra a palavra (variações rise/blur/wipe/title para evitar repetição); saída curta com blur.
- Serviços: rótulo ciano + valor branco; animações diferentes para R$ 250 (sobe com escala), R$ 500 (emerge de máscara) e R$ 400 (pop com blur).
- Comparação: R$ 1.150 em `#FF555D` com contagem 0→1.150 durante "mil cento e cinquenta reais"; no "Mas" (frame 646, junto do corte original 648) uma linha vermelha corta o valor, que sai com blur em 22,3 s. R$ 697/mês em `#36E58D`, subindo, contando 0→697, com overshoot e glow; ele vira selo menor enquanto "E ainda ganha… primeiro mês" entra e sai em 27,7 s (~3,7 s visível).
- CTA: "CHAME NO WHATSAPP" em ciano com ícone oficial (asset da V6) e pulsação leve até o fim. Sem botão falso.
- Três zooms (1,04 / 1,03 / 1,045), todos zerados sob cortes originais: gancho, 1.150 e 697.

## SFX

`scripts/generate-sfx-pv.py` sintetiza todos os efeitos (sem samples de terceiros). São 15 eventos esparsos: pops, whooshes, price-hit, ticks de contagem, slash, impacto do 697 e chime.
A voz original permanece intacta. No pior pico de 100 ms, cada efeito fica pelo menos 3,3 dB abaixo da voz. O pico total (−3,95 dBFS) fica igual ao do original.
A avaliação foi feita por medição, sem audição.
