# Max and the wall — editorial / timing contract

## Authoritative audio and captions
- Original supplied MP3 is played at **1.0×**, from composition frame 0. Container duration: **96.208938 s**. The 30 fps composition is **2,887 frames / 96.233333 s**; its final ~24 ms is merely frame rounding, not added narration or silence.
- `docs/script.txt` is the exact supplied script, 286 whitespace-delimited display words. `src/captions.json` contains 72 phrase cues and all 286 individually highlighted words; the concatenated cue text matches the script verbatim after whitespace normalization.
- The decoded 16 kHz WAV exists only for local analysis. Rendering uses the original MP3, not this derivative.
- `word_alignment.json` comes from local PocketSphinx 5.0.4 word alignment plus its phone/state refinement pass, 10 ms acoustic frame resolution. Independent unconstrained local ASR and quiet-gap analysis identified safe analysis-chunk boundaries. A wider beam was required for the compressed paramedic warning. All 12 chunks completed both passes.
- Display `84` merges “eighty four”; display `911` merges “nine one one.” `3`, `7`, `AM`, punctuation, quotation marks and contractions remain exactly as supplied onscreen.
- Forced alignment estimates timing; it is not human-certified listening or independent proof of the transcript. The raw independent ASR has errors and did not rewrite the supplied words.
- Official API reference: https://pocketsphinx.readthedocs.io/en/stable/pocketsphinx.html#pocketsphinx.Decoder.set_align_text

## Story and visual rhythm
The movie is a suspense rescue story with a warm reversal, **not a broad comedy**. Reuse the approved original repository ink, card characters, geometric apartment depth, lighting/grade/lens pipeline and its actual keyframed camera engine. Do not replace it with flat slideshow panels or generic full-shot camera interpolation.

1. **0.00–7.24 — hook and moral mistake.** Start with a readable Max/wall relation, cut to the actual 3:00 AM clock at 2.63, reveal the narrator’s sleepless frustration, then a reluctant/guilty close-up on “give him away.” No rehoming phone draft appears before the narration introduces it at 34.69.
2. **7.24–18.48 — first night.** Low sniff / mouse assumption; narrator moves toward the wall before the ear-contact cut. Listening holds briefly, interrupted by his order and Max’s urgent whine/claw. Max repeatedly returns to the **same** spot; do not let camera or set geography imply different walls.
3. **18.48–34.69 — escalating frustration.** Thursday weariness, girlfriend’s roll/scold, narrator’s neighbor excuse, a physically contacted collar pull, and Max’s motivated sprint back. Hands/paws contact their props/surfaces; body motion is planted and intentional rather than idle floating.
4. **34.69–42.90 — the regrettable draft.** Morning visual change, legible phone insert, “Save as draft,” angry withdrawal. Nothing is publicly posted. Phone content must not reveal the rescue or gratitude early.
5. **42.90–57.86 — behavior changes / suspense.** A return to 3 AM, conspicuous absence of barking, howl, body contact with the wall, interrupted yell, then stillness. Keep the three thumps as one restrained visual hold with distinct acoustic onsets **54.94 / 55.90 / 56.81**; do not put a “mystery victim” shot before the real reveal. A held frame can breathe; do not fill every pause with a cut, shake or sound gag.
6. **57.86–75.07 — narrator acts.** Realization → run in socks → hand contacts Harlan’s door → call out → empty/closed-door hold at “Nothing” → weak answer → 911 → paramedics force entry → dog scratches at bathroom. This is urgent, but geography remains coherent. No graphic injury or alarming gore.
7. **75.07–85.25 — rescue and consequence.** First Harlan-on-floor reveal begins with “Mr. Harlan was on the floor.” Show the hand–phone separation, caregiver attention, then a stable readable human two-shot for the paramedic warning. Let “Another hour” carry weight; no humorous reaction kick.
8. **85.25–96.23 — repair and recurring connection.** Delete the actual saved draft; whole steak reward; Harlan now standing and recovered. Warmth changes lighting/body language rather than global visual style. Exactly **two** deliberate knocks, then Max barks back. Finish on the bond, not on a blank wall or a phone screen.

## Proof and QA gates
- First proof is native **1080×1920, frames 0–299**, with original audio from time zero and these exact captions.
- Opening proof covers dog hook, readable clock, weary narrator, rehoming threat, first-night mouse assumption, and the beginning of ear listening. No subsequent rescue content is needed to judge this proof.
- Native still checks: 0, 42, 86, 120, 180, 240, 299. Verify complete clock text, meaningful camera targets, dog face/body framing, narrator head visibility, eye focus and safe caption region. Frame 299 must not be an empty future contact target.
- After the opening is approved, a representative second proof is **frames 1536–1775 (51.20–59.20 s)**: interrupted yell, auditory realization, all three thumps and stomach-drop reaction. This tests restraint and suspense rather than duplicating the opening.
- Representative later still groups: caller/door, first bathroom reveal, warning two-shot, phone deletion, steak, and both sides of final wall exchange.
- Keep captions below the principal facial/hand acting; important paws/phone/clock content must remain away from the bottom safe region.

## Reproducibility / packaging
Run `.alignment-venv/bin/python docs/align_narration.py`, then `python docs/build_captions.py` to reproduce caption data. The local alignment venv is a build dependency, **not** a deliverable asset; exclude `.alignment-venv`, temporary analysis WAV and caches from the editable ZIP unless specifically requested. Keep the compact timing JSON, source scripts, original MP3 and caption exports.

`docs/build_story_data.py` regenerates the 42-shot plan only; it deliberately does not touch captions. The authoritative delivered `src/captions.json` is the full 72-cue version.
