# Ótica Descontão — V3

Entrega: `out/otica-descontao-motion-v3.mp4`. Composition `OticaDescontaoMotionV3`, 1080×1920, 30 FPS, 625 frames. Render H.264/AAC, BT.709, CRF 18, áudio 192 kbps. Container: 20,843 s; imagem: 20,833 s; tamanho: 23.080.484 bytes.

## Direção e comprovação no render

| Trecho | Movimento e composição |
| --- | --- |
| 0–1 s | Pull-out inicial, desenho de armação atravessando a imagem e whoosh, mantendo o início original. |
| 1,76–5,5 s | Punches em SEUS/ÓCULOS/NOVOS/MENOS, aproximação progressiva, escala e reenquadramento. ÓCULOS e MENOS parcialmente atrás da cabeça; NOVOS em primeiro plano com overshoot. |
| 5,6–6,2 s | Wipe diagonal verde/laranja atravessando o primeiro plano, deslocamento de câmera e whoosh. |
| 6,2–11,7 s | Composição lateral, faixa verde, logo oficial temporária, armações vetoriais em transformação e DIFERENTES/ESTILOS em profundidade. |
| 13,3–16,5 s | Transição circular de lente, push-in e punch em QUANTO, texto cinético e interrogação em primeiro plano. |
| 17,3–20,83 s | Swipe laranja e redução animada do vídeo para uma janela lateral. Logo original revelada com máscara/spring; CHAMA A GENTE, WhatsApp e ORÇAMENTO construídos por etapas, com impactos e fechamento sonoro. |

O vídeo-base roda continuamente a 1×. Não foram adicionados cortes estruturais, removidos intervalos nem reorganizadas falas. As mudanças visuais decorrem de transformações, máscaras e camadas. Não foram inventadas informações comerciais.

Motion blur temporal real: `HtmlInCanvasMotionBlur`, cinco amostras e obturador de 240 graus nas janelas rápidas; desligado nos momentos estáveis. Uma comparação com o blur desativado também foi renderizada para verificar o efeito. Spring, overshoot, tracking, blur de entrada e máscaras complementam a tipografia.

Legendas funcionais separadas da tipografia de destaque: blocos curtos, palavras reveladas somente a partir das marcações da fala, cor/tamanho/peso variáveis, sem caixa fixa. A posição muda com a câmera e com a cena final. Marcações reutilizam a transcrição local conferida na V2.

## Profundidade e logo

Matte temporal derivado com [Robust Video Matting](https://github.com/PeterL1n/RobustVideoMatting), modelo MobileNetV3 ONNX oficial. Foram gerados 217 WebPs RGBA. A máscara foi limitada à região superior para colocar texto atrás de cabelo/cabeça; as mãos apresentaram bordas menos limpas e não foram isoladas. O vídeo original permanece por baixo, preservando ambiente e gestos.

Logo oficial encontrada em `logo.png` (1254×1254). Cópia integral em `video/assets/brand/logo.png`, exibida sem recorte ou distorção; não foi redesenhada. Ambas têm SHA-256 `83B483B8BCECA229930C3CFE91EE094CDA63B771513058A40153169A7FD0A561`.

## Som

Voz integral normalizada derivada do original; trilha original existente e cinco SFX sintetizados localmente (whip, punch, type-pop, riser, resolve), distribuídos em 15 eventos sincronizados com os frames das animações. Não há amostras comerciais externas. A voz permanece em primeiro plano.

## Revisão final

Comparação visual V2/V3 nos mesmos seis instantes, inspeção de 24 frames representativos, 12 frames de abertura e 18 das transições. Após o primeiro render, ESTILOS foi elevado para reduzir a ocultação e o CTA foi corrigido para manter todo o texto até o último frame. Um segundo render completo incorporou as correções, seguido de nova inspeção.

- TypeScript e `git diff --check`: aprovados.
- Decodificação completa de áudio/vídeo com FFmpeg: aprovada.
- 625 frames decodificados; nenhum frame preto pelo limiar de média inferior a 8/255.
- Áudio estéreo a 48 kHz, sem amostras clipadas; loudness -16,41 LUFS e true peak -2,03 dBTP.
- Alinhamento da voz com a referência: deslocamento detectado 0 ms; correlação 0,9975.
- Punches, zooms progressivos, mudanças laterais, transições, motion blur, profundidade, legendas individuais, logo e CTA conferidos nas sequências extraídas do próprio MP4.
- `video/0.mp4`, `out/technical-test.mp4`, V2 e logo preservados: hashes SHA-256 idênticos, verificados por `scripts/verify-preservation.mjs`.

Evidências: `out/otica-descontao-v2-v3-comparison.png`, `out/otica-descontao-v3-review.png`, `out/otica-descontao-v3-motion-blur.png` e `out/otica-descontao-v3-technical-report.json`. Arquivos de saída e caches estão ignorados pelo Git. Nenhum commit ou push foi feito nesta etapa.
