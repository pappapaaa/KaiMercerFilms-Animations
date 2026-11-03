# Opening v1 — independent native still review

Reviewed 2026-11-02 14:54–14:57 UTC. **Not yet acceptable for preview delivery.** This is a seven-still review, not playback or a listening review.

Files directly inspected via image tool at native1080×1920: `outputs/opening_v1-f0000.png`, `f0042`, `f0086`, `f0120`, `f0180`, `f0240`, `f0299`. Source provenance: `outputs/opening_v1.mp4.source.json`. Motion inferences below are explicitly limited to these discontinuous samples.

## Blocking corrections sent to lead

1. **Night does not read in opening dog/wall shots** (f0,42,240). Wall is almost uniformly bright cream, floor vivid orange, with no visible localized practical/cool-night separation. Later close-ups include a blue night window, but the opening visual itself reads daylight/fully lit room. Preserve readable warm dog/face while moving nonfocal architecture into cooler darker tones. Changing only sunI/hemiI will not fix actual twoTone output: shader overwrites Lambert diffuse and zeros indirect diffuse; adjust the real TONE lit/shade/direction or a documented localized night adapter.
2. **Clock is cropped at both sides** (f86). Left edge cuts the3, right edge cutsM; wide field is not visible. Pull back/widen so complete3:00AM fits cleanly.
3. **Last preview frame is empty-wall failure** (f299). Caption reads 'I pressed my ear' but neither narrator nor dog is visible. Camera cuts to future wall-contact target at291 before approaching narrator reaches it. Track current head, stay wider through approach, or delay insert to contact. This is not a suspense hold; it loses the named action.

## Composition improvements

- First dog shot places the head near vertical centre but leaves roughly top800px as undifferentiated wall, while hindquarters clip left. A lower aim/full-body three-quarter dog+wall framing or a tighter intentional face/wall composition would use portrait space more effectively.
- f240 is a readable full dog with four paws and owner relation, but narrator's face is cut by both top and left boundaries. Keep dog dominant, but let the owner crop read intentional rather than accidental if this angle persists.

## Positive findings / preserved style

- Actual approved repo human drawing, plum variable outlines, cloth/face gradients and sparse painted world surfaces are visibly present, not merely imports.
- Max reads coherently as an original illustrated quadruped. f240 separates four paws; f0→42 changes jaw/head into an open bark without visibly detached parts. This does not yet establish temporal naturalness or a full planted-foot cycle.
- Floor perspective, dado geometry, wall corner and framed picture make a real room rather than a flat backdrop. Max faces toward the right boundary wall.
- Caption scale/contrast is strong and visible sampled highlighted words agree with timing metadata. Full independent caption audit:72cues,286exact script tokens, no timing overlaps/out-of-range words, original MP3 hash retained (`caption_integrity.json`). Actual listening unavailable in this model environment; no audio-quality claim.

## Pending

Revised native stills; sequential bark samples; final10s motion extraction/decode/media-contract and waveform alignment. Source-level gait/contact corrections have separate evidence and are not a substitute for pixel review.
