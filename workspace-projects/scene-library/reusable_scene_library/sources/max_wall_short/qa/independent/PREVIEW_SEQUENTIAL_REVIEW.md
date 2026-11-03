# Frozen preview — independent sequential-frame review

Frozen source SHA256: `5d3d413277a442da7168481852d693f8a41c5465a7fa1ff1620039f4427ce5b5`.

**Review mode:** actual video decoded into native1080×1920 JPEG frames (ffmpeg q2). Labeled comparison sheets downsample each frame to540×960 without altering content. This is sequential visual sampling, not a claim of real-time playback or subjective listening. Native still acceptance is documented separately.

## Frames0–103 (parts0/1), reviewed15:18UTC

- Extracted all104frames; directly inspected27opening samples0,3,…78 (every0.10s) in `motion_sheets/bark_sequence_1..5.jpg`, plus adjacent cut frames76–81 in `cut_078_079.jpg`.
- Max's jaw opens/closes in repeated distinct bark pulses; head/ears remain anatomically attached. Tail changes angle independently. Four paws remain at the same floor region relative to boards; no obvious slide/float seen in this sampling. This is stylized repetitive barking, not a walking test.
- Framing keeps full muzzle/tail/paws through sampled bark peaks; quiet push does not crop action. No blank frame or doubled render visible at sample points.
- Consecutive frames78→79 cleanly cut from Max to fully readable3:00AM at2.633s. Caption emphasis on '3' and clock reveal coincide in the timing metadata.
- No blocking issue in inspected coverage.

## Frames104–152 (part2), reviewed15:20UTC

- Extracted all49frames. Directly inspected104,113,122,131,140,152 in `exhaustion_sequence.jpg`, plus adjacent cut frames101–106 in `cut_103_104.jpg`.
- Clock→exhausted narrator cut occurs cleanly at104. Complete face remains framed. Hand is held at temple and pained expression is legible; modest camera push is visible but subject stays anchored.
- Captions carry 'every night for a week' through reaction with expected keyed-word changes, no clipped overlay.
- This49frame (~1.63s) reaction holds its pose rather than adding arbitrary full-body action. No obvious blank/flicker/crop in inspected sequence.
- No blocking issue in inspected coverage.

## Frames153–216 (part3), reviewed15:25UTC

- Extracted all64frames; directly inspected153,165,177,189,201,216 and adjacent150–155 cut strip.
- Cut resets framing slightly wider, switches pained face/temple hand to nervous face/lowered hand, then pushes closer. Actor remains clear and full face fits. Eye opening/blink and small head tilt keep reaction distinct from prior exhaustion.
- Caption phrase and keyed words progress through giving-away admission; sentence-ending pause leaves no caption at216, consistent with nextsentence at7.24s.
- No blocking crop/blank/temporal discontinuity beyond the intentional reaction cut in sampled coverage.

## Frames217–299 (parts4/5), reviewed15:28–15:29UTC

- Extracted all83frames. Directly inspected217,231,245,259,273,290; adjacent214–219 and288–293; plus291,292,294,296,298,299.
- First-night wide keeps narrator and all of Max visible. Feet stay anchored through the modest camera push; tail and blink provide small live action without arbitrary root bobbing.
- Cut216→217 moves from guilty close-up to the shared-wall two-shot as the story returns to the first night. Cut290→291 intentionally elides the approach and lands on the actor already in listening setup; no empty-wall frame. Head/hand remain visible to the end.
- Caption gaps correspond to measured narration pauses. Next phrase begins at9.74s; exact ten-second proof ends naturally during that sentence, without an added fade erasing the source.
- No blocking issue in inspected coverage.

## Final assembled media, verified15:29UTC

- Native1080×1920, H.264/yuv420p, constant30/1fps, exactly300 decoded video frames, duration10.000000s.
- AAC mono44.1kHz audio starts0.000000s and lasts10.000000s. Original source file SHA remains unchanged.
- Source-vs-mux decoded waveform correlation0.9999715178 at0ms measured lag. This is an integrity/alignment check, not subjective listening.
- Full ffmpeg decode succeeds. Every one of300 decoded frame MD5s in assembled video equals the corresponding source-chunk frame; no concat skips, insertions or pixel substitutions.
- Final file SHA256: `80a712b19afb4b5f5d64d121b1f19a0f94b4658ceb43577847994d8607ffb743`,4,974,777bytes.

**Scoped result: PASS for this ten-second preview.** Across the video,72unique decoded frames were directly inspected in labeled sequential sheets, including every cut's adjacent boundaries. This is not a claim to have perceptually watched all300frames at real-time playback or listened to audio; this environment explicitly does not support audio input. Full-film QA remains active and separate.
