# Audio measurement and production timing

All four downloaded mixed tracks have 48 kHz source audio. FFmpeg loudness metering measures the original mixed tracks; a separate 16 kHz mono decode supplies duration and the 10 ms RMS envelope. `templates/scripts/analyze_audio.py` writes `references/data/audio_summary.json`, per-video `audio.json`, and `audio_envelope.csv`. These are complete mixed tracks, not isolated voice, music or effects stems.

## Measured tracks

| Source ID | Decoded audio duration | Integrated loudness | True peak | Loudness range | 10 ms windows below -40 dBFS RMS |
|---|---:|---:|---:|---:|---:|
| `2GGA4NlMjKc` | 53.4335 s | -15.37 LUFS | +0.09 dBTP | 8.5 LU | 16.47% |
| `tN0ra1h3uKo` | 40.7735 s | -21.63 LUFS | -0.48 dBTP | 6.9 LU | 5.69% |
| `HOjbzw2xqEE` | 36.2735 s | -23.65 LUFS | -7.73 dBTP | 4.9 LU | 20.79% |
| `XdcSli5STR4` | 32.4735 s | -18.45 LUFS | -3.67 dBTP | 4.9 LU | 41.64% |

Audio and video endpoint durations differ by small codec/container timing amounts. Preserve their original timings in the evidence. Quiet mixed-track windows do not prove that the speaker is silent: a quiet voice, music tail or effect can occupy that interval. Integrated loudness does not establish a voice-to-music gain ratio.

The range across these tracks is substantial. There is no measured basis for a universal instruction such as “music +3 dB, SFX -6 dB.” That recipe belonged to a different project. A peak above 0 dBTP in the encoded TikTok track is an observed measurement, not a target to reproduce.

## Narration determines picture

Use the actual supplied recording and preserve its speed. Obtain word or phrase timestamps and verify the key cue words by listening. Automatic captions can help locate lines but may combine repeated text, miss words or have coarse timing. They should not be treated as a finished lip-sync track.

At 24 fps, one frame is about 41.67 ms. Convert a cue time to an integer frame deliberately, then review the result. The performance can prepare before a line and land its decisive pose on the meaningful word; do not enforce an arbitrary global lead offset. A new reaction often needs its own hold after the spoken phrase.

Use separate clocks for narration, mouth drawing, gesture, root movement, camera and text. A stationary body can continue speaking. A word-timed mouth should stop cycling outside the word interval, while the emotional face may hold. `Motion.ts` contains `mouthAt(frame, [{a,b}, ...])` as a simple fallback, not phoneme recognition.

Set picture frame count to at least `ceil(decodedVoiceSeconds * fps)`. Extend picture for an intentional final reaction or ending. Do not trim a word merely to fit an old demo duration. The 288-frame proof timeline is only an example.

## Mixer contract

`templates/audio/mix.py` takes a timeline, optional voice and optional music. It:

1. Decodes inputs to 48 kHz stereo without changing playback speed.
2. Rejects voice that exceeds the planned picture duration.
3. Places original synthesized cues at exact timeline frame positions.
4. Ducks optional music based on a look-ahead envelope of the actual voice input.
5. Applies protective premix gain if needed, then optional two-pass loudness normalization.
6. Writes a WAV, component stems and JSON metadata with the exact target sample count.

The default no-input run creates the proof's three small Foley events. It intentionally avoids normalizing sparse taps to a speech loudness target. The example cue types are `tap` and `pop`; new sound sources need their own synthesis or authorized files.

```text
python templates/audio/mix.py
python templates/audio/mix.py --voice narration.mp3 --music score.wav --timeline episode-timeline.json --out public/episode-mix.wav --music-gain 0.15 --lufs -16
```

`music-gain` is a linear amplitude multiplier. The defaults are proposed starting settings. Adjust against the actual voice, music arrangement and speaker level. Music is not automatically looped; the current helper pads shorter inputs with silence and truncates music to picture. Author a musical ending instead of relying on a hard final crop.

The generic DSP/instrument helpers retain the upstream MIT notice. No upstream bridge music arrangement or source creator soundtrack is used in the proof.

## Final listening checks

Listen at a modest phone-speaker level. Dialogue should remain clear through each cue. Check that emotional silence is not filled unnecessarily, impact effects land on visible contact, the last syllable survives the end, and the ending does not click. Meter the encoded video after muxing; its true peak may differ from the WAV.

The completed study provides objective mixed-track measurements and visual timing anchors. It does not recover the source's separate recording chain, compressor settings, score, voice model or sound library.
