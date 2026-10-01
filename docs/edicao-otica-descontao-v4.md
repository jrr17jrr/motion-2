# Ótica Descontão — refinamento V4

## Análise da referência antes da edição

Arquivo encontrado: `referencias/ref.mp4` (720×1280, 30 FPS, 893 frames de imagem, aproximadamente 29,8 segundos). Decodificação e análise temporal de todos os frames; sequência cronológica de toda a duração, com amostras a cada 0,267 s; extração integral do áudio e transcrição local auxiliar. As marcações automáticas de fala têm erros e não foram usadas para copiar conteúdo.

A abertura já começa falando, com enquadramento médio que se aproxima; o texto nasce em pequenas unidades, empilhado, com palavras-chave maiores e variações de escala, slide e desfoque. O rosto fica livre, enquanto a tipografia se concentra no torso. Há retornos a planos abertos e closes, mudanças laterais e cortes discretos entre gestos. Momentos de câmera e palavras fortes alternam com trechos visualmente limpos.

Blocos observados: abertura/oferta 0–5,6 s; serviços 5,9–9,8 s; argumento 10–19,3 s; estrutura 19,6–22,7 s; demonstração 22,8–25,2 s; CTA 25,5–29,4 s. As passagens maiores são muito breves, com exposição/film burn, textura e desfoque em torno de 5,6–5,9, 9,8–10,0, 19,3–19,6 e 25,2–25,5 s. Há cortes mais diretos perto de 1,6, 14,37 e 22,77 s. No CTA a pessoa permanece em tela cheia: palavras, ícone de contato e pequeno indicador conduzem a ação, sem virar uma interface.

Aplicação à Ótica: preservar a pessoa, usar câmera e timing como movimento principal, reduzir formas de fundo, manter tipografia livre em blocos e um CTA integrado à gravação. Não foram copiados textos, identidade, pessoa, cores ou música da referência. A V3 foi evoluída pela reutilização da transcrição, fonte, motor de tipografia, SFX e mattes, com nova montagem e câmera.

## Montagem autorizada

| Fonte original | Saída V4 | Motivo |
| --- | --- | --- |
| 1,600–5,200 s | 0–3,600 s | Remove a espera inicial, preserva o gancho e o respiro final. |
| 5,633–11,533 s | 3,600–9,500 s | Aproxima o segundo bloco, mantendo início e término das palavras. |
| 13,267–16,000 s | 9,500–12,233 s | Encurta a pausa após necessidade; mantém a pergunta inteira. |
| 17,567–20,767 s | 12,233–15,433 s | Encurta a espera antes do CTA e mantém o fechamento. |

Redução total: 162 frames, 5,4 s em relação aos 625 frames da V3. Não há aceleração de fala. Fades de 5 ms somente nos limites do áudio evitam clicks; limites fora das palavras, com margem de entrada e respiração. Os cortes são acompanhados por mudança de crop e breve blur/punch, sem grandes wipes.

## Linguagem visual e sonora

- Imagem em tela cheia durante toda a edição; sem faixas verdes, divisões ou janela de aplicativo no final.
- Câmera com scale de 1,035 a 1,20, mudanças X/Y, punches nas palavras, aproximações progressivas e retornos ao plano aberto. Zoom máximo moderado pela fonte 720×1280.
- Motion blur temporal de cinco amostras, obturador 180°, restrito aos movimentos rápidos. Breve desfoque nas junções; sem interromper a fala para mostrar transição.
- Tipografia ÓCULOS/MENOS/ESTILOS com profundidade, usando os mattes superiores da V3 remapeados à nova timeline. Cabeça/cabelo sobre o texto, sem recortar mãos.
- Legendas funcionais por palavras/grupos, itálico, hierarquia e entradas variadas; tipografia cinética independente para destaques.
- Som: trilha original procedural a 120 BPM, baixo/pluck/percussão/acordes, sem samples externos, ducking guiado pela voz. RMS musical 17,62 dB abaixo da voz. Doze eventos sonoros nos movimentos principais, reutilizando SFX originais da V3.
- Única logo da V4: `logonova.png`, 1774×887, RGBA com transparência. Cópia idêntica em `video/assets/v4/logonova.png`; entrada no CTA com máscara, scale e spring. Proporção 2:1 e cores preservadas.
- CTA sobre a gravação: CHAMA A GENTE → WhatsApp → FAÇA O SEU ORÇAMENTO, sem telefone, preço ou endereço inventados.

## Reprodução e revisão

`npm run render:v4` gera `out/otica-descontao-motion-v4.mp4`; configuração não sobrescreve saídas existentes. Composition `OticaDescontaoMotionV4`, 1080×1920, 30 FPS, 463 frames. Preparação derivada: `scripts/prepare-v4.py`; revisão: `scripts/review-v4.py`. O render usa os assets prontos, sem depender de Python.

Preservação por SHA-256 registrada antes da edição em `.cache/v4-analysis/preservation.json`: bruto, teste técnico, V2, V3, referência, nova logo e logo anterior usada pela V3. Os originais não são editados. Nenhum commit, push ou alteração do histórico Git nesta etapa.

Revisão do primeiro render: sequência cronológica de toda a V4 em 116 amostras, mais 20 momentos representativos, frames ampliados e todas as junções. Foram encontrados dois problemas: diferença de luminosidade no limite do matte e logo muito próxima do cabelo. Correções aplicadas: máscara com saída suave, uso do matte restrito aos destaques, ajuste leve de luminosidade e logo reduzida para 570×285, no espaço superior livre. O segundo render completo incorporou as correções; nova inspeção conferiu a máscara, logo/rosto, textos e comparação referência/V3/V4.

## Resultado da validação final

- 463 frames H.264, 1080×1920, 30 FPS, yuv420p, BT.709; duração da imagem 15,433 s.
- Decodificação integral FFmpeg de áudio e vídeo aprovada; zero frames pretos pelo limiar de brilho médio inferior a 8/255.
- Áudio AAC estéreo 48 kHz; zero amostras clipadas; -16,17 LUFS, true peak -1,44 dBTP.
- Voz alinhada à montagem: deslocamento detectado 0 ms, correlação 0,9907 com a voz derivada.
- TypeScript e verificação de whitespace aprovados. SHA-256 de todos os arquivos protegidos idênticos à captura inicial; cópia da nova logo também idêntica.
- Não foram encontrados textos cortados nas inspeções de entradas, momentos estáveis e junções; rosto livre no CTA corrigido.
- Evidências: `out/otica-descontao-ref-v3-v4-comparison.png`, `out/otica-descontao-v4-review.png`, `out/otica-descontao-v4-cuts.png`, `out/otica-descontao-v4-cta.png`, `out/otica-descontao-v4-technical-report.json`.

Limite de comparação: a referência contém locações e planos de câmera distintos; a V4 cria variação com o material disponível e câmera digital moderada, preservando a qualidade da fonte e a identidade da Ótica. A mixagem foi medida e a revisão visual foi feita por sequências extraídas do MP4; a transcrição automática é uma checagem auxiliar, não substitui as marcações da fala verificadas anteriormente.
