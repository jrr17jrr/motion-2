# Ótica Descontão — V6

Versão separada de V4/V5: `out/otica-descontao-motion-v6.mp4`, Composition `OticaDescontaoMotionV6`, 1080×1920, 30 FPS, 471 frames / 15,70 s. Nenhum commit/push faz parte desta entrega.

## Nova análise da referência

Os 893 frames foram decodificados novamente e representados individualmente em dez páginas cronológicas na cache. A análise visual completa foi complementada por diferenças entre frames e RMS do áudio em janelas de um frame. Picos do áudio misturado não permitem atribuir sons a whooshes ou hits específicos; não houve audição da referência nem afirmação de reconhecer seus SFX.

| Trecho da referência | Linguagem observada e adaptação |
|---|---|
| 0–5,6 s | Plano médio, closes e alterações laterais; grupos curtos em itálico, palavras de maior peso e entradas com blur. V6 usa crops por grupo e punches coordenados, inclusive na abertura. |
| 5,6–5,9 s | Transição breve com passagem luminosa e mudança de plano. V6 usa whip/blur curto na troca após “imagina”, sem reproduzir os grafismos da referência. |
| 5,9–9,8 s | Alternância de escala e ambiente em torno de 8,2 s; texto compacto sobre torso e entradas/saídas rápidas. V6 alterna plano mais aberto, reframing lateral e escala na fala de estilos/necessidade. |
| 9,8–14,37 s | Transição maior, nova composição, aproximações e palavras empilhadas; blur durante substituição dos grupos. V6 usa zoom transition na entrada dos óculos e câmera/texto reagindo juntos em “quanto”. |
| 14,37–19,57 s | Corte seco seguido de movimentos de aproximação e novas entradas de tipografia. V6 combina cortes de crop deliberados com pushes leves e impactos selecionados. |
| 19,57–25,47 s | Abertura para plano sentado, corte para posição lateral aos 22,77 s e transição maior ao fim do bloco. V6 usa mudança de escala, whip curto e tomada final com contraste entre movimento e estabilidade. |
| 25,47–29,77 s | CTA com composição clara, entradas de palavras e contato. V6 encerra uma única vez com logo e telefone, preservando a identidade da Ótica. |

Os principais picos de diferença visual confirmam as regiões de 5,7–5,9; 9,9–10,03; 14,37; 19,43–19,57; 22,77 e 25,33–25,47 s. Esses números são auxiliares à inspeção, não detecção infalível de cortes.

## Correções de montagem

| Frames do bruto, final exclusivo | Entrada na V6 | Observação |
|---|---|---|
| 48–144 | 0,00 s | Termina em 4,80 s do bruto, após o fim de “imagina” em aproximadamente 4,69 s. |
| 162–321 | 3,20 s | Próxima ação entra 0,40 s antes da V5. “Só” começa aproximadamente 0,10 s após a entrada. |
| 390–465 | 8,50 s | Cena dos óculos começa em 13,00 s do bruto; “Quer” começa em aproximadamente 13,09 s. |
| 525–606 | 11,00 s | Última fala completa; footage termina em 13,70 s da composição. |

As fronteiras foram escolhidas usando as entradas e saídas de fala já refinadas por forma de onda. Não há alteração de velocidade, pitch, bruto ou referência. Microcortes de enquadramento ocorrem nas mudanças dos grupos sem suprimir sílabas do interior da fala.

### Causa do final da V5

A V5 acrescentava uma segunda `Sequence` após seus 440 frames de footage, com 36 frames de `Freeze` e outra instância de `OffthreadVideo`. A comparação do MP4 antes/depois dessa entrada mostrou o salto da expressão de encerramento para outra expressão da apresentadora. A evidência foi salva em `.cache/v6-analysis/v5-ending-cause.png`.

A V6 remove completamente essa sequência e o `Freeze`. Existem quatro intervalos de vídeo, sempre avançando na fonte. Aos 13,70 s o vídeo sai uma única vez. Os últimos 60 frames são somente a composição gráfica contínua de logo/CTA; nenhum frame da apresentadora é congelado, reaberto ou reproduzido novamente. A composição acaba no frame 470.

## Câmera, texto e transições

Há 16 estados de enquadramento, pushes discretos entre eles e sete punches principais. Escala calculada: 1,025×–1,2426×, incluindo overshoot. O deslocamento é limitado pela margem real do crop para evitar bordas vazias. Transições dos frames 96, 255 e 330 possuem movimentos de whip/zoom, blur direto e motion blur temporal de cinco amostras. Cortes menores permanecem secos quando isso favorece o contraste.

Uma única hierarquia de texto é montada por vez. Não existe legenda inferior paralela. A primeira palavra de impacto fica no torso, em vez de saltar para o topo. Em “estilos”, apresentadora à direita e texto à esquerda; em “necessidade”, apresentadora à esquerda e texto à direita. Os grupos da pergunta ficam abaixo do queixo. Sem cards, barras ou blocos verdes grandes.

## Música e SFX

Música original a 120 BPM com envelope dinâmico: redução durante a voz, aumento nos intervalos, reforços nas transições e crescimento no CTA. Relação RMS música/voz durante fala: aproximadamente −15,22 dB, cerca de 6 dB acima da V5. Acentos musicais acompanham os frames de impacto escolhidos, além do pulso regular.

São 16 eventos sonoros, ligados a movimentos específicos; movimentos menores ficam sem efeitos. Whooshes/swipes têm variações de duração e espectro. Pops/hits acompanham overshoot, com ataques mais definidos. Os impactos incluem componente de 900 Hz e ataque curto de ruído para reduzir a dependência de graves na reprodução por celular.

O pico da spring real ocorre seis frames após a entrada. Os sete punches têm pico visual e pico de áudio nos mesmos frames: 18, 57, 134, 196, 296, 364 e 392. O pico do arquivo de whoosh, e não apenas seu início, acompanha cada transição. Ícone do WhatsApp tem spring e o telefone tem slide/fade, com pop no frame 402.

`master.wav` combina voz, música e efeitos com offsets em amostras exatos. A mixagem mede margem de pico antes da exportação. Não houve audição; presença percebida dos SFX, gosto musical e inteligibilidade subjetiva não são tratados como verificados por escuta.

## CTA e preservação

Logo copiada integralmente de `logonova.png`, sem recriar, alterar proporção, cores ou alpha. Ícone oficial do WhatsApp preservado do asset usado na V5. Contato: **(21) 99648-0818**. Visível por 75 frames / 2,50 s. Durante a passagem para o fundo claro, o telefone muda para escuro para manter contraste. A apresentadora não retorna depois dessa passagem.

265 arquivos protegidos são comparados por SHA-256, incluindo bruto, referência, renders V2–V5, logo e todos os assets anteriores. Relatório final: `out/otica-descontao-v6-technical-report.json`. Pranchas de revisão e CTA são salvas em `out/`.

Reprodução: preparar áudio com `scripts/prepare-v6.py`, auditar com `node scripts/audit-v6.mjs`, montar o master com `scripts/mix-v6.py`, renderizar com `npm run render:v6`, revisar com `scripts/review-v6.py`. O render não sobrescreve arquivos existentes.

## Resultado da revisão do MP4 entregue

- 471 frames decodificados integralmente; zero frames pretos, quase inteiramente pretos ou brancos indevidos.
- Decodificação completa de H.264 e AAC passou. Áudio estéreo, 48 kHz, zero amostras clipadas, −16,54 LUFS integrados e true peak −1,32 dBTP.
- Correlação entre o master e o áudio decodificado: 0,999869; melhor deslocamento: 0 ms.
- Inspeção cronológica de toda a edição, todas as janelas dos cortes, saída final, enquadramentos de impacto e CTA em resolução final. A pergunta foi reposicionada abaixo do queixo e o telefone passou a escuro durante a saída para o fundo claro; o MP4 foi renderizado novamente e revisado após esses ajustes.
- Fonte percorre somente intervalos crescentes e sai no frame 411. Zero frames congelados ou trechos reabertos da apresentadora. CTA gráfico permanece até o término, sem um segundo encerramento.
- 265 hashes protegidos inalterados; cópia da logo e do ícone idêntica aos assets oficiais existentes.
- TypeScript e whitespace do diff passaram.
- Níveis, espectro e sincronização dos efeitos foram medidos; a avaliação subjetiva por audição permanece fora do que este ambiente consegue verificar.

Evidências entregues: `out/otica-descontao-v6-review.png`, `out/otica-descontao-v6-cuts.png`, `out/otica-descontao-v6-cta.png`, `out/otica-descontao-ref-v4-v6-comparison.png` e o relatório JSON indicado acima.
