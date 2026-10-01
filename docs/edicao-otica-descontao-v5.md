# Ótica Descontão — V5

Render independente: `out/otica-descontao-motion-v5.mp4`. Composition `OticaDescontaoMotionV5`, 1080×1920, 30 FPS, 476 frames (15,8667 s), H.264/BT.709 com AAC estéreo a 48 kHz. Nenhum commit ou push realizado.

## Referência e direção visual

A referência inteira foi analisada em sequências cronológicas dos 893 frames. Foram observados agrupamentos curtos em itálico, hierarquia variável, protagonista em primeiro plano, alternância de enquadramento e entradas rápidas de texto. As transições mais fortes ocorrem aproximadamente em 5,6–5,9; 9,8–10; 19,3–19,6 e 25,2–25,5 s. Essa linguagem orientou a V5, adaptada à fala e às cenas da Ótica, sem reproduzir a identidade da referência.

A V5 possui um único sistema de texto: somente um grupo semântico ativo por vez. Não existe legenda inferior paralela. As palavras são reveladas conforme a fala, com slides, spring, escala, recorte e alterações de tracking. O texto de abertura passa parcialmente atrás do cabelo; o rosto permanece livre. Os demais grupos ocupam principalmente a região do torso. Foram removidos os grandes elementos gráficos verdes, mantendo as cores da marca e do ícone oficial.

A câmera varia de 1,04× a 1,1994×, com reframing lateral, aberturas e cinco punches principais. Motion blur temporal usa cinco amostras nos movimentos rápidos. Os cortes de fonte retiram as pausas entre tomadas; as mudanças de câmera acompanham as palavras e os gestos.

## Montagem e integridade da fala

Intervalos do bruto, com final exclusivo:

| Fonte, frames | Fonte, segundos | Entrada na V5 |
|---|---|---|
| 48–156 | 1,60–5,20 | 0,00 s |
| 162–321 | 5,40–10,70 | 3,60 s |
| 390–465 | 13,00–15,50 | 8,90 s |
| 525–623 | 17,50–20,7667 | 11,40 s |

A análise da forma de onda identificou que as antigas marcações automáticas estavam atrasadas nas entradas de “Só” e “Quer”. Os novos cortes preservam essas entradas. “Quer” começa aproximadamente em 13,09 s do bruto: a V5 conserva somente 0,09 s antes da fala, removendo a espera da cena de óculos. A apresentadora já está gesticulando na entrada.

Após 440 frames de footage há um hold intencional de 36 frames do último frame, com aproximação leve e encerramento da música. Esse hold mantém o CTA legível, sem repetir a fala. Logo oficial `logonova.png` e ícone do WhatsApp foram copiados integralmente. Telefone `(21) 99648-0818`, visível por 106 frames, aproximadamente 3,53 s.

## Música e sound design

Trilha procedural original a 120 BPM, com redução de volume durante a voz. Nas regiões de fala, a relação RMS música/voz é aproximadamente −21,26 dB. SFX originais e variados foram gerados para entradas, punches, mudanças de cena, logo e CTA. Há 13 eventos, sem efeito em cada palavra.

A auditoria calcula o pico da spring real: seis frames após a entrada. Os cinco punches principais possuem pico visual e pico do SFX nos mesmos frames: 18, 57, 208, 308 e 376. Os whooshes são antecipados para que o pico da própria forma de onda acompanhe a transição. O manifesto registra os arquivos, volumes, motivos e frames.

Ícone obtido do pacote oficial da Meta: https://www.meta.com/brand/resources/whatsapp/whatsapp-brand/ . SVG preservado sem redesenho ou alteração de cores.

## Revisão final

O áudio foi validado tecnicamente, sem audição, conforme autorização. Não se afirma ter ouvido a referência ou o resultado. Forma de onda, transcrição auxiliar, correlação, loudness, picos e decodificação foram usados para conferir a montagem e sincronização.

- Decodificação completa de vídeo e áudio: passou.
- 476 frames; zero frames pretos ou quase inteiramente pretos/brancos.
- Inspeção visual cronológica de toda a edição; todos os frames nas janelas dos três cortes; abertura, CTA e comparação com referência/V4 conferidos.
- Áudio final: −15,96 LUFS integrados, true peak −1,41 dBTP, zero amostras clipadas.
- Correlação com a voz montada: 0,9903; melhor deslocamento medido: 0 ms.
- TypeScript e verificação de whitespace do diff: passaram.
- 245 arquivos protegidos com SHA-256 inalterado, incluindo bruto, referência, assets anteriores e renders anteriores. Cópias de logo e ícone idênticas aos originais.

A revisão dos renders intermediários identificou frames brancos de uma captura com backdrop filter e frames pretos da camada RGBA dentro do canvas de motion blur. Foram corrigidos antes da entrega: blur aplicado diretamente à imagem e camada de cabelo renderizada fora do canvas, com máscara suave. Os dois renders intermediários ficaram na cache; o MP4 entregue passou novamente pela revisão completa.

Evidências: `out/otica-descontao-v5-technical-report.json`, `out/otica-descontao-v5-review.png`, `out/otica-descontao-v5-cuts.png`, `out/otica-descontao-v5-cta.png` e `out/otica-descontao-ref-v4-v5-comparison.png`.

Reprodução: `npm run render:v5`. Preparação de áudio: `scripts/prepare-v5.py`. Auditoria dos movimentos/SFX: `scripts/audit-v5.mjs`. Revisão: `scripts/review-v5.py`. A configuração não sobrescreve um render existente.
