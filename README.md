# Motion 2

Projeto de preparacao tecnica com Remotion, React e TypeScript.

## Original protegido

O video-base oficial e `video/0.mp4`. Nao modificar, recortar, renomear,
substituir ou sobrescrever este arquivo. A pasta `video` e servida como
diretorio de assets pelo Remotion, sem necessidade de copiar o bruto.
Saidas devem ser gravadas somente em `out/`.

Hash SHA-256 original:
`4EE8DFD4E7D59C21D066D5FE0E5677133ED31AA4FD315EAB81245E0674B8236A`.

## Comandos

- `npm ci`: instalar as versoes fixadas no lockfile.
- `npm run studio`: abrir o Remotion Studio.
- `npm run typecheck`: verificar TypeScript.
- `npm run probe`: analisar o original com FFprobe do Remotion.
- `npm run compositions`: validar e listar as compositions.
- `npm run render:test`: renderizar os primeiros 3 segundos em `out/technical-test.mp4`.
- `npm run render`: renderizar a baseline inteira em `out/video-base.mp4`.

Arquivos de saida existentes nao sao sobrescritos automaticamente.

## Estrutura

- `src/index.ts`: registro da raiz Remotion.
- `src/Root.tsx`: Composition `VideoBase`, 1080x1920, 30 FPS.
- `src/compositions/VideoBase.tsx`: imagem e audio originais, sem edicao criativa.
- `src/media/source-metadata.json`: metadados medidos com FFprobe.
- `remotion.config.ts`: codecs, assets e protecao das saidas.
- `out/`: renders tecnicos, ignorados pelo Git.

A duracao da baseline e arredondada para cima para frames inteiros: 625 frames.
O arquivo original tem 20.813106 s, video H.264 720x1280, FPS nominal 30
e media `311500000/10406553`. Audio AAC stereo, 44100 Hz.
O FFmpeg e o FFprobe sao fornecidos pelas dependencias locais do Remotion;
nao ha necessidade de instalacao global.

## Validacao tecnica realizada

- TypeScript: aprovado com `npm run typecheck`.
- Composition reconhecida: `VideoBase`, 1080x1920, 30 FPS, 625 frames.
- Original: FFprobe e decodificacao completa de imagem/audio com FFmpeg aprovados.
- Teste: `out/technical-test.mp4`, 90 frames H.264 a 30 FPS, 1080x1920.
- Audio do teste: AAC stereo a 48000 Hz, sinal nao silencioso confirmado por PCM.
- Container do teste: 3.008 s (3 s de imagem com padding do AAC), 4438550 bytes.
- Decodificacao completa do render de teste: aprovada; frame em 1 s inspecionado.
- Hash do bruto ao final: identico ao hash original acima.
- A primeira tentativa teve timeout de 25 s ao conectar ao Chrome Headless.
  A segunda tentativa concluiu com sucesso.

Nenhuma edicao criativa foi aplicada nesta etapa.

## Edicao Motion V2

Composition `OticaDescontaoMotionV2`, com a timeline-base integral preservada.
Use `npm run render:final` para gerar um novo render em
`out/otica-descontao-motion-v2.mp4`. A saida existente e protegida contra
sobrescrita automatica.

Direcao visual, transcricao e marcacoes: `docs/edicao-otica-descontao.md`.
Legendas: `src/media/captions.ts`. Trilha e SFX originais: `video/assets/audio/`.
Fonte Manrope e licenca OFL: `video/assets/fonts/`.
Transcricao local: scripts `transcribe.mjs` e `refine-transcript.mjs` (modelos
temporarios em `.cache`). Geracao sonora: `scripts/generate-audio.py`.
Revisao tecnica: `scripts/review-render.py` (usa Python com NumPy e Pillow).
