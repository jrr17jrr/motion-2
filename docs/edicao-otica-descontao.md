# Ótica Descontão — Motion V2

## Transcrição e marcações

Transcrição local em português conferida com Whisper small e medium;
marcações de palavra por DTW, quantizadas em frames a 30 FPS.
Grafia da marca corrigida conforme briefing. Nenhuma informação comercial acrescentada.

| Tempo de entrada | Fala / informação |
| --- | --- |
| 1,76 s | Seus óculos novos podem custar menos do que você imagina. |
| 5,74 s | Só que na Ótica Descontão você encontra diferentes estilos de acordo com a sua necessidade. |
| 13,38 s | Quer descobrir quanto ficaria o seu? |
| 17,76 s | Chama a gente no WhatsApp e faça o seu orçamento. |

Palavras principais: óculos 2,12 s; novos 2,56 s; menos 3,44 s;
Ótica 6,26 s; Descontão 6,58 s; diferentes 8,26 s; estilos 8,66 s;
necessidade 10,22 s; quanto 14,32 s; WhatsApp 18,56 s; orçamento 19,50 s.

O começo e as respirações existentes foram preservados. A voz começa depois
do primeiro segundo; não foi antecipada nem recortada para fabricar um gancho.

Observações de atuação: no primeiro bloco, a apresentadora gesticula e a própria
gravação se aproxima; em torno de 6 s, levanta os óculos de sol e muda o plano;
na explicação, gestos abertos e expositor de armações reforçam variedade;
no terceiro bloco, aparece sentada com espaço amplo sobre a cabeça; no CTA,
o plano já é mais próximo e o gesto da mão reforça o convite. Os planos de
11,6–13,38 s e 16,5–17,76 s respiram, sem novos textos principais ou SFX.

## Direção visual

- Primeiro frame: apresentadora presente, enquadramento começa uma aproximação
  discreta e desenho de armação atravessa o espaço superior. Sem introdução.
- Gancho: SEUS → ÓCULOS → NOVOS por máscaras de revelação, escala com spring,
  tracking e laranja/verde. Impactos entram com as palavras correspondentes.
- Economia: painel verde com MENOS em grande hierarquia e seta descendente.
- Marca: assinatura tipográfica branca/laranja, sem logo externo inventado.
- Variedade: três armações vetoriais desenhadas para a edição, cards em
  perspectiva, sombras e entradas em cascata. Ilustração relacionada à fala,
  sem B-roll externo ou mudança da timeline.
- Necessidade: composição mais limpa, destaque tipográfico e linha laranja.
- Pergunta: tipografia verde/laranja aproveita o espaço vazio acima da
  apresentadora sentada; interrogação em outro plano.
- CTA: card verde de WhatsApp, ícone de conversa, seta de ação e cartão
  de orçamento. Marca permanece na conclusão, com a apresentadora visível.

O upscale usa o vídeo integral com aproximação adicional máxima de 5,5%.
As mudanças aproveitam os enquadramentos já existentes e nunca alteram a
ordem da fala. Não há sharpening artificial.

Profundidade usa perspectiva, sombras e planos gráficos. Não foi aplicada
uma máscara de recorte da apresentadora, evitando bordas artificiais.
Máscaras de revelação são aplicadas à tipografia.

Legendas em grupos curtos, Manrope, fundo escuro translúcido, palavra corrente
em laranja claro. Área essencial horizontal entre x=82 e x=894; legendas
em y=1450 e assinatura final em y=1584, afastadas do rodapé e controles laterais.

## Áudio e preservação

Voz original completa em uma faixa derivada normalizada para -16 LUFS / -1,5 dBTP.
Música instrumental original sintetizada: 106 BPM, baixo suave, plucks e
pulsação discreta, reduzida sob a fala. SFX originais: hit suave, swipe de ar,
chime de CTA. Nenhum material musical de terceiros ou sample comercial.
Código de geração e WAVs estão no projeto.

`video/0.mp4` e `out/technical-test.mp4` são preservados.

SHA-256 do bruto:
`4EE8DFD4E7D59C21D066D5FE0E5677133ED31AA4FD315EAB81245E0674B8236A`.

SHA-256 do teste técnico:
`6B993B853C8B7340507033B1E43159DB42E375375350262D762F410800925AB3`.

## Render

Composition: `OticaDescontaoMotionV2`; 1080×1920; 30 FPS; 625 frames.
Original: 20,813106 s. Timeline final: 20,833333 s; pequeno arredondamento
para frame inteiro, sem novos cortes e sem nova montagem.
Comando: `npm run render:final`.
Saída: `out/otica-descontao-motion-v2.mp4`, H.264, CRF 18, AAC 192 kbps, BT.709.

O diretório `out` fica fora do Git; render final entregue localmente.
Scripts, assets necessários, fontes com licença OFL, configurações e
documentação são versionados. Modelos Whisper e análises temporárias ficam
em `.cache` e não são versionados.

## Revisão final realizada

Foram renderizadas duas versões completas. Na primeira revisão visual, o
painel MENOS invadia a região superior do rosto no close, e a pergunta
continuava após a mudança para o plano final. Correções: painel reduzido,
pergunta encerrada em 16,5 s e CTA reposicionado abaixo do rosto.

Após as correções, novo render completo e inspeção de 18 quadros representativos
em 0 / 0,8 / 1,9 / 2,35 / 2,85 / 3,8 / 4,7 / 6,8 / 8,9 / 9,55 / 10,7 /
12,2 / 14,5 / 15,6 / 17,2 / 18,7 / 19,9 / 20,7 s. Revisados textos,
ortografia, hierarquia, safe area, rosto livre, fechamento, cards e transições.

- MP4 final: 30.405.447 bytes (30,41 MB / 29,00 MiB).
- Vídeo: H.264, BT.709, 1080×1920, 30 FPS constantes, 625 frames.
- Duração do container: 20,843 s; imagem: 20,833333 s.
- Áudio final: AAC stereo 48000 Hz, aproximadamente 192 kbps.
- Decodificação integral de áudio e vídeo: aprovada.
- Varredura dos 625 frames: nenhum frame preto.
- Pico PCM: 0,8432; amostras clipadas: zero.
- Loudness final: aproximadamente -15,88 LUFS; true peak -1,48 dBTP.
- Comparação com a voz derivada integral: deslocamento detectado 0 ms,
  correlação 0,99915. Mantidos sequência, conteúdo e sincronismo da voz.
- Bruto e teste técnico: hashes SHA-256 originais confirmados.
- TypeScript: aprovado.

A primeira inicialização do Chrome teve timeout de 25 s. A tentativa
seguinte renderizou normalmente; não houve erro de decodificação do MP4.
O render corrigido também concluiu normalmente.

Prévia de revisão: `out/otica-descontao-review.png`.
Métricas detalhadas temporárias: `.cache/final-review/technical-report.json`.
O MP4 final não é versionado para evitar adicionar 30 MB de saída gerada;
todos os códigos e assets necessários para reproduzi-lo são versionados.
