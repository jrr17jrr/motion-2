# Audio da edicao

- `voice-normalized.wav`: derivado integral do audio de `video/0.mp4`, sem cortes
  ou reordenacao, normalizado com FFmpeg loudnorm para -16 LUFS / -1.5 dBTP.
- `original-bed.wav`: trilha instrumental original sintetizada por
  `scripts/generate-audio.py`, 106 BPM, pulsacao suave e plucks.
- `soft-hit.wav`, `air-swipe.wav`, `cta-chime.wav`: SFX sintetizados pelo mesmo
  script. Nenhum sample, gravacao ou musica de terceiros foi utilizado.

A trilha e reduzida sob a fala; a voz tem prioridade. O original permanece
intacto. Arquivos gerados em WAV stereo 48000 Hz.
