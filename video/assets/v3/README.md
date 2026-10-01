# Assets derivados da V3

- `mattes/`: 217 frames RGBA derivados de `video/0.mp4` por Robust Video Matting; utilizados somente na região superior da apresentadora. Gerador: `scripts/matte-v3.py`. O bruto não é alterado.
- `matte-manifest.json`: índices e parâmetros da geração.
- `audio/`: cinco SFX originais sintetizados por `scripts/generate-sfx-v3.py`; sem samples externos.

Modelo oficial: https://github.com/PeterL1n/RobustVideoMatting (MobileNetV3 FP32 ONNX). Modelo e dependências Python foram mantidos em `.cache`, fora dos assets. O render usa os WebPs prontos e não depende de executar o modelo.

A logo é a cópia integral do arquivo oficial em `../brand/logo.png`. Os desenhos vetoriais de armações na composição são elementos gráficos e não substituem a logo.
