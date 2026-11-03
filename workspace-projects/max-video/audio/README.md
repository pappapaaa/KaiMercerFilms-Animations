# Max and the wall — audio

The user's original `public/narration.mp3` plays at 1.0 speed and is retained unchanged. The delivered `public/mix.wav` combines that narration with an original suspense-to-warmth score and restrained Foley. Audio length is exactly 2,887 frames at 30 fps (96.233333 seconds). No narration cuts, silence trimming, time stretching, or pitch changes.

The score is authored in `scripts/audio-mix.py`: sparse modal piano and soft harmonic pads, an urgent low pulse during the hallway sequence, and a warm major resolution after the rescue. The bed is spectrally carved around speech and ducked by the actual voice envelope. It nearly disappears for the three drywall thumps and the paramedic's warning. No comic boings or dramatic screaming.

## Precise picture cues

- Dog/body impact: 49.20 s.
- Three drywall thumps: **54.94, 55.90, 56.81 s**.
- Door pounds: 61.59, 62.16, 62.74 s.
- Weak answering taps: 67.78, 68.18 s.
- Entry impact: 71.65 s.
- Saved-draft/deletion taps: frames 1202 and 2605.
- Exactly two Sunday knocks: **93.24 and 94.05 s**, followed by Max's answering bark at 95.43 s (the open-jaw peak during the narrated word “barks”).
- Hallway sock footfalls derive from the animation's 7.45 m travel and 2.775 m native gait cycle.

Full cue table: `cues.json`. Technical validation: `report.json`. Packaged editable stems: `voice-leveled.wav`, `music.wav`, `sfx.wav`. The untouched recording is `public/narration.mp3`; `voice.wav` is a locally rebuilt intermediate.

## Sound sources

- [Single Deep Dog Barking 25 — SFXMint](https://sfxmint.com/sounds/animal-dog-bark-25), [WAV](https://sfxmint.com/dl/animal-dog-bark-25.wav). CC0 1.0, AI-generated library sound. Trimmed silence, level adjusted, brief excerpt reused as Max's bark.
- [Lonely Dog Howl 02 — SFXMint](https://sfxmint.com/sounds/dog-howl-02), [WAV](https://sfxmint.com/dl/dog-howl-02.wav). CC0 1.0, AI-generated library sound. Trimmed silence and level adjusted for the short howl.
- [SFXMint license](https://sfxmint.com/license), checked 2026-11-02: published library files are CC0 and may be used and modified in commercial videos; attribution is optional. These were library downloads, not new generated requests.
- All remaining sound effects and music are original deterministic procedural synthesis authored for this project. The subtle whine is synthesized; no animal or human distress recording is used.

## Rebuild

The ready-to-render mix is included; rebuilding audio is optional. Run `python -m pip install numpy scipy soundfile`, then `python scripts/audio-mix.py` from the project directory. FFmpeg must be on PATH. Keep the two CC0 source WAVs in `audio/sources/`. The script also supports this workspace's optional dependency directory `../out/audio/pydeps`.
