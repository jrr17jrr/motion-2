# Plano Visionário — V2 (edição sonora)

Composition `PlanoVisionarioV2`. Render: `npm run render:pv2` → `out/plano-visionario-edicao-sonora-v2.mp4`.
A V1 (`out/plano-visionario-editado-v1.mp4`, SHA-256 `6D511AC3…F56C4`) não foi re-renderizada nem alterada.

## Como a imagem fica idêntica

`PlanoVisionarioV2` renderiza o mesmo componente `PlanoVisionario` da V1, apenas passando outra camada de SFX pela prop `soundtrack`. Sem props, o componente produz a V1 como antes.
Verificação: o fluxo H.264 extraído dos dois MP4 (cópia bitexact, sem reencode) tem o **mesmo SHA-256**. Logo, cenas, cortes, legendas, preços, cores, zooms e duração são idênticos.

## Efeitos (kit `video/assets/pv/sfx-v2`, gerado por `scripts/generate-sfx-pv-v2.py`)

Todos os sons são sintetizados, sem samples de terceiros. Têm energia em 1–5 kHz para soar em alto-falante de celular. O pico de cada um cai no frame da animação correspondente; erro medido ≤ 26 ms (< 1 frame).

| Momento | Frame | Efeito |
|---|---|---|
| MAIS CLIENTES | 46 | `hook-hit` — impacto curto com presença em médios |
| PLANO VISIONÁRIO | 132 / 150 | `title-swoosh` na entrada + `title-pop` quando a linha ciano é desenhada |
| R$ 250 / 500 / 400 | 301 / 386 / 513 | `price-blip` (subida digital), `price-click` (clique duplo), `price-pop` (pop com brilho) |
| R$ 1.150 contando | 591–630 | `count-roll`: ticks que seguem a mesma curva ease-out do contador e sobem de tom |
| R$ 1.150 chega | 630 | `count-land` — impacto discreto |
| Risco | 647 | `strike-slash` — corte mais perceptível |
| 1.150 sai | 673 | `exit-swoosh` |
| R$ 697 entra | 716 / 718 | `offer-rise` + `offer-impact` |
| **R$ 697** | **736** | **`cash-register`**: clack mecânico + sino "ching" + moedas. O sino cai num respiro da narração, 2 frames antes de o contador fechar em 697 |
| PRIMEIRO MÊS / MOTION DESIGN / NOSSA MODELO | 811 / 852 / 919 | `bonus-sparkle`, `bonus-swoosh`, `bonus-pop` |
| CHAME / WHATSAPP | 1076 / 1088 | `cta-rise` (entrada suave) + `cta-hit` (impacto + chime) |

## Mixagem

- Ganho individual por evento em `src/pv/sfx-v2.ts`; o mix geral não foi aumentado.
- Ducking automático: `src/pv/voice-level.json` guarda o nível por frame da voz original. Cada efeito é reduzido 20–40 % enquanto a narração está forte (média de ±2 frames, sem "zíper").
- Auditoria (`scripts/audit-sfx-pv.py`, stems `PlanoVisionarioV1SfxStem`/`V2SfxStem`): na faixa de celular (> 700 Hz), os efeitos ficam entre −3 e −8 dB da voz. Antes, na V1, ficavam entre −9 e −32 dB. A caixa registradora é o mais marcante (+1,6 dB, transiente de ~0,1 s num respiro da fala). O pop de "NOSSA MODELO" fica em −13,7 dB por coincidir com a sílaba tônica.
- MP4 final: pico −3,15 dBFS, 0 amostras clipadas, áudio idêntico ao master (correlação 0,9999, lag 0). A voz original não foi alterada nem comprimida.

A avaliação foi feita por medição, sem audição.
