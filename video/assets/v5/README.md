# Assets derivados V5

- `voice.wav`: montagem em quatro intervalos, sem acelerar a fala; fades de 5 ms nos limites fora das palavras. Final com 1,2 s sem voz para leitura do contato.
- `music.wav`: trilha original procedural a 120 BPM, com ducking pela voz e acentos nos cortes. Sem samples externos.
- `sfx/`: doze variações sintetizadas originalmente, distribuídas em treze eventos visuais; impactos, pops, whooshes, riser e resolução.
- `audio-manifest.json`: montagem e picos medidos dos arquivos de som.
- `cue-manifest.json`: eventos extraídos do código real, frames de pico visual/sonoro, limites da câmera e duração do contato. Gerado por `node scripts/audit-v5.mjs`.
- `logonova.png`: cópia binária integral da nova logo oficial, sem mudança de imagem, cor ou transparência.
- `whatsapp-official.svg`: cópia integral de `Digital_Glyph_Green_RGB_2026.svg`, do pacote oficial baixado em 1/10/2026 no [Brand Resource Center da Meta](https://www.meta.com/brand/resources/whatsapp/whatsapp-brand/). Desenho e cores originais preservados.

Gerador sonoro: `scripts/prepare-v5.py`. Todos os assets anteriores são somente lidos. A audição subjetiva não está disponível no ambiente; a revisão de áudio é técnica, conforme autorizado pelo usuário.
