# Plano Visionário — V3 (edição sonora reforçada)

Composition `PlanoVisionarioV3`. Render: `npm run render:pv3`, que roda `scripts/mix-pv-v3.py` e depois o Remotion. Saída: `out/plano-visionario-edicao-sonora-reforcada-v3.mp4`.
V1 e V2 não foram re-renderizadas: os hashes de `out/…-v1.mp4` (`6D511AC3…`) e `out/…-v2.mp4` (`12B330D4…`) continuam inalterados.

## Arquitetura

- **Imagem:** o mesmo componente `PlanoVisionario` da V1. O fluxo H.264 da V3 tem o mesmo SHA-256 do fluxo da V1 (`BAA7DFC5…`), ou seja, a imagem é idêntica.
- **Áudio:** mixado offline em `scripts/mix-pv-v3.py`, porque o Remotion soma camadas sem limitador.
  - Narração: PCM do `.mov` original, sem processamento.
  - Efeitos: normalizados a −1 dBFS, posicionados com precisão de amostra no frame de cada animação e com ganho individual.
  - Ducking de −3 dB nas sílabas fortes.
  - Limitador look-ahead em −1,5 dBFS. Não precisou atuar: redução de 0 dB.
- **Música:** o original não tem trilha musical; os respiros da fala ficam em −41 a −51 dBFS, só ruído de ambiente. Não havia música para abaixar.

## Som de dinheiro (R$ 697)

É uma caixa registradora real, de biblioteca, e não síntese:
- **Sample:** Freesound #209578 (Zott820, **CC0**), um "cha-ching" montado a partir de gravações reais. As moedas vêm do Freesound #154410 (lucaslara, CC0). Detalhes em `video/assets/pv/v3/README.md`.
- **Análise:** ruído mecânico de 0,05 a 0,35 s ("CHA"), golpe de sino aos 0,37 s com parciais inarmônicas de 1,5/4,4/5,5/7,1/8/10 kHz decaindo por cerca de 2 s ("CHING") e um segundo toque metálico aos 0,62 s. O som não foi ouvido; a análise é espectral.
- **Sincronia:** o "cha" começa com a subida do preço (frame 720). O "ching" cai no frame 725, no pico do pop da animação e num respiro da fala. As moedas entram no frame 731, outro respiro.
- **Mixagem:** o "cha" foi atenuado em 12 dB porque cobre o "seis-" de "seiscentos".
- **No MP4:** a correlação cruzada localiza o sino no frame 725,0 (NCC 0,916).

## Níveis (banda de celular > 700 Hz; pico de 50 ms do efeito vs. RMS da voz em ±0,5 s)

O ganho médio sobre a V2 é de +5,1 dB, considerando todos os eventos. Os valores medidos no MP4 decodificado batem com o master (±0,3 dB).

- **Maiores aumentos:**
  - MAIS CLIENTES: +7,3 dB
  - corte do 1.150: +7,0 dB
  - caixa registradora: +6,9 dB, a +8,4 dB acima da voz (o efeito mais forte do vídeo)
  - NOSSA MODELO: +7,8 dB
  - CHAME: +8,1 dB
  - WHATSAPP: +6,5 dB
- **Novos:**
  - swipe rápido somado ao corte do 1.150
  - whooshes leves nos rótulos dos serviços
  - moedas
  - pop em "escolhe!"
- **Contidos de propósito:** a subida e o impacto antes do 697 (+1,6 / +2,5 dB) e a saída do 1.150 (+2,1 dB). Eles caem sobre "seiscentos" e "Visionário", e o destaque desse momento fica com o cha-ching.

## Medições do MP4 (BS.1770, implementação própria)

| | LUFS integrado | True peak | Clipping |
|---|---|---|---|
| V1 | −18,04 | −3,88 dBTP | 0 |
| V2 | −17,96 | −3,08 dBTP | 0 |
| V3 | −17,79 | −3,81 dBTP | 0 |

A loudness integrada praticamente não muda porque os efeitos são curtos. A narração segue como o elemento dominante, e os efeitos aparecem nos ataques.

Scripts:
- `scripts/mix-pv-v3.py`: mix
- `scripts/audit-sfx-pv-v3.py`: níveis V2×V3 e no MP4
- `scripts/verify-mp4-audio-pv.py`: LUFS, true peak, master × MP4 e detecção do sino
