# Motion and editing: observed rhythm and reusable controls

These references use limited character animation, deliberate held poses, and changes of framing to carry dialogue and jokes. Continuous camera drift is not a universal rule. A locked composition can remain readable for several seconds while the face, hand, or one foreground element changes. The more cinematic Christmas short also uses a sustained dissolve, a moving insert, dramatic foreground/background separation, and abrupt close-up cuts.

This report separates **measured** encoded-frame properties, **observed** image behavior, and **proposed** implementation controls. The original bridge repository's camera and motion numbers were not reused as measurements of these four videos.

## Evidence and coverage

The exhaustive pipeline decoded all **3,909 presentation frames**, preserved their source indices and FFprobe timestamps, and generated one CSV row, one reduced JPEG, and one dense-sheet cell for each frame. The 67 dense sheets are not interval samples. The source videos are all 1080×1920, approximately 24 fps; two encodes have average rates fractionally different from 24 because of container timing. Always use the recorded timestamp when exact media time matters.

| Reference | Frames | Approx. duration | Dense sheets | Near-static transitions | Longest near-static span | Candidate boundaries |
|---|---:|---:|---:|---:|---:|---:|
| `2GGA4NlMjKc` — The End of TikTok | 1,282 | 53.417 s | 22 | 62.45% | 45 frames | 41 |
| `tN0ra1h3uKo` — Christmas / two front teeth | 978 | 40.751 s | 17 | 52.71% | 36 frames | 20 |
| `HOjbzw2xqEE` — Refrenced | 870 | 36.251 s | 15 | 72.50% | 50 frames | 11 |
| `XdcSli5STR4` — All Dogs Go To Heaven? | 779 | 32.458 s | 13 | 75.19% | 44 frames | 19 |

Durations above are last-frame timestamp plus reported/fallback frame duration, rounded to milliseconds; container video-stream duration can differ by less than a millisecond. “Near-static” means adjacent whole-frame RGB mean difference ≤0.35 in 8-bit levels at 360×640. It is neither an exact duplicate count nor proof of an authoring exposure sheet. A small mouth change can pass this threshold. Candidate counts are **not shot counts**.

This motion reviewer visually inspected every labeled contact cell in:

- `references/sheets/tN0ra1h3uKo/dense_0000.jpg` through `dense_0016.jpg`: frames **0–977**, all 978 frames.
- `references/sheets/HOjbzw2xqEE/dense_0000.jpg` through `dense_0014.jpg`: frames **0–869**, all 870 frames.
- Both corresponding sampled `overview_00.jpg` files for sequence navigation only.

The exact per-sheet first/last indices and reviewed candidate classifications are recorded in `references/data/<id>/reviewed_boundaries.json`. This is a complete contact-cell review of these two videos at 126-pixel cell width, not a claim of full native-pixel inspection. Detailed native spot checks for this report were Christmas `native/f000288.png` and Refrenced `native/f000668.png`; the preceding Christmas frame287 was also inspected separately at 360-pixel width. Other reports own the detailed visual review of TikTok and Dogs. The corpus table above uses machine measurements for all four.

## What the held frames actually tell us

**Measured:** The Christmas short has 180 near-static spans of exactly two frames; Refrenced has 106. Adjacent drawings on the dense sheets visibly repeat in pairs during many character actions. This supports a limited-animation approach in which many poses change about every second output frame, while holds last longer and occasional sharp actions change every frame. It does not establish one uniform 12-drawing-per-second production rule across the entire collection. Dogs has only seven measured two-frame spans and eleven six-frame spans, demonstrating why the cadence must remain configurable.

| Observed example | Source frames | Timing meaning | Production implication |
|---|---|---|---|
| Christmas grin under the lamp | 420–455 | 36 frames, about **1.5 s** of exposure; first-to-last PTS interval 1.458 s | A held expression is an intentional reaction beat. Preserve the silence/voice timing instead of adding compulsory sway. |
| Christmas Santa pause before reverse cut | 576–603 | 28 frames, about **1.167 s** exposure | A simple composition can hold until the next speaker or reveal. |
| Christmas final gift reaction | 910–943 and 950–977 | 34-frame and 28-frame near-static spans | End a joke on a readable expression rather than a perpetual camera move. |
| Refrenced dialogue gesture | 304–353 | 50 frames, about **2.083 s** exposure; PTS interval 2.042 s | Keep the foreground silhouette stable while the spoken argument develops. |
| Refrenced folded-arm reaction | 395–433 | 39 frames, about **1.625 s** exposure | Stillness contrasts with the other actor's gesture and later scene change. |
| Refrenced anticipation to declaration | 704–709 | Brief compressed pose at 704–705, then open gesture and text reveal | Put a small preparation before the larger readable action. |

The exposure duration includes the last displayed frame; `held_spans.json` also records the elapsed timestamp interval between the first and last frame. These differ by approximately one frame. Do not call the 50-frame span “2.042 seconds of footage” without explaining this distinction.

**Inference:** Much of the energy comes from contrast: quiet hold → sudden pose replacement → held reaction, or stable dialogue → strong size/angle change. Making all parts move continuously would weaken this contrast. Optical-flow averages alone cannot recover the intended acting beats.

## Christmas: verified edit map

Frame numbers are zero-based. A listed hard cut is the first frame of the new view. Times come from the source CSV rather than a new 30 fps timeline.

| Frame / time | Visual change | Review classification |
|---|---|---|
| 78 / 3.250 s | Mailbox medium-wide to high-angle snowy street with large soft foreground figure | Hard cut |
| Approximately 160–185 / 6.67–7.71 s | Snowy street blends into a tray of tools | Dissolve, roughly one second; approximate bounds from cell review |
| 258,260 / 10.750,10.834 s | Large glove reaches over the same tool tray | Action poses, not cuts |
| 277 / 11.542 s | Tray insert to Santa foreground and captive fairy in background | Hard cut |
| 288 / 12.000 s | Santa turns/shifts, revealing more of the fairy behind him | Action/reveal within continuing wall, lamp, and table geography |
| 335 / 13.958 s | Closer fairy angle under hanging lamp | Hard cut |
| 474 / 19.750 s | Fairy snaps to open-mouth shock in same framing | Expression/pose replacement |
| 499 / 20.792 s | Elf foreground with Santa behind | Hard cut |
| 509 / 21.209 s | Elf stands and begins leaving left | Action pose; continuing background |
| 604 / 25.167 s | Closer fairy/table reaction | Hard cut |
| 713–714 / 29.708–29.750 s | Glove arrives and forces the head down | Action/deformation frames |
| 715 / 29.792 s | Reverse view of elf holding the back of the fairy's head | Hard cut |
| 730 / 30.417 s | Extreme close-up of Santa's shushing finger | Hard cut |
| 754 / 31.417 s | Finger/eye pose changes within Santa close-up | Pose replacement |
| 793 / 33.042 s | Side close-up of the fairy and restraining hand | Hard cut |
| 801,803,805 / 33.375,33.459,33.542 s | Head/hair motion and sequential startled poses | Action poses within same setup |
| 862 / 35.917 s | Bright warm Christmas room and present | Hard cut and location/palette change |

The 20 heuristic candidates contain **nine verified hard cuts and eleven action/pose changes**. The dissolve is an additional manually observed transition that the abrupt-change detector did not propose. Treating the candidates as twenty editorial cuts would overstate the cutting rate.

Two long views illustrate the actual pacing: the lamp close-up from 335–498 lasts about 6.833 seconds, and the elf/Santa setup from 499–603 lasts 4.375 seconds. A reverse insert from 715–729 lasts just 0.625 seconds. The rhythm is intentionally uneven; a rigid “cut every two seconds” template would lose the dramatic contrast.

The tool insert visibly moves vertically around 186–257. Call this an **apparent pan or composited plate move**: the frames do not prove whether a physical 3D camera, a 2D image layer, or another authoring method produced it. The foreground Santa framing around 277–334 uses overlap, scale, and softened foreground edges to guide attention to the small background figure. This is depth staging even though the figure drawings are largely graphic.

## Refrenced: verified edit and reframe map

| Frame / time | Visual change | Review classification |
|---|---|---|
| 66–73 / about 2.750–3.042 s | Camera/composite pulls back to reveal document-headed partner | Rapid reframe with visible intermediate scales; candidates 66 and 67 are not hard cuts |
| 193 / 8.042 s | Two-shot switches to close view of document-headed character and laptop | Hard cut / digital punch-in |
| Approximately 236–242 / 9.834–10.084 s | Blurred lead-in and intermediate scaled views restore two-shot | Rapid pull-out; candidates 238, 239, 240 belong to this one move |
| 537 / 22.375 s | Office table changes to lavender cloud world; giant cropped left, protagonist tiny right | Hard cut and location/scale reveal |
| 609 / 25.375 s | Low-angle giant-logo figure | Hard cut |
| 668 / 27.833 s | High-angle protagonist with large head and oval contact shadow | Hard cut |
| 742 / 30.917 s | Return to giant's low angle | Hard cut |
| 824 / 34.334 s | Very wide view of giant and two small characters | Hard cut |

The eleven candidates contain **six verified hard cuts and five samples from two rapid reframes**. Group each reframe into a single event before computing an editing rhythm. The desk scene occupies the first 22.375 seconds, so a location change is a major escalation rather than a recurring background swap.

Within that stable desk setup, the actors change silhouettes: casual typing, startled look, open hand, folded arms, emphatic gesture, and an exit. Many intervening frames simply hold. The important hand/eye changes remain visible because the wall and table do not also drift. In the cloud scene, the contrast between the giant cropped foreground and a tiny walking figure conveys scale before the reverse angles explain the exchange.

The initial typed sentence and later spelling suggestion are timed visual jokes. The suggestion label arrives at frame 768 (32.000 s), and the correction word appears around frame 798 (33.250 s). This is not evidence for mandatory bottom captions on every narration. In a new script, text should follow a story function: label, written message, correction, or emphasis. Generic subtitles are an optional production requirement.

## Camera, actor, prop, and text need separate clocks

The following are **implementation proposals**, derived from the observed contrast between held drawings and selective motion. They are starting points for the reusable template, not claimed recovered source settings.

1. **Output clock:** use 24 fps for a faithful first pass. Keep exact audio duration and derive the final frame count with `ceil(audioSeconds * fps)`. Preserve the reference timestamps in the analysis data even if a later delivery uses another frame rate.
2. **Pose clock:** store explicit pose/expression keyframes. Allow `holdFrames:1`, `2`, `3`, or longer per action. A two-frame exposure is a useful default for many actions in Christmas and Refrenced, with longer explicit holds for reactions.
3. **Transform clock:** moving a character across the frame, a rapid reframe, and a background pan can have their own interpolation. Do not quantize the entire world just because a mouth or hand uses held drawings.
4. **Face clock:** trigger eyebrows, eyes, and mouth from the spoken beat and performance state. Do not oscillate a generic mouth forever during silence. Preserve a closed or deliberately held final expression.
5. **Text clock:** reveal a line or word at the exact gag/reading cue. If subtitles are requested, align them to word timing independently of prop labels and written dialogue.

A simple hold selector is `poseFrame = Math.floor(localFrame / holdFrames) * holdFrames`; evaluate only the selected pose at that frame. That formula is useful for exposure cadence, but it does not replace authored poses, anticipation, or phrase timing. For a rapid pull-out, interpolate the camera/composite scale on its own output-frame clock and settle to a stable composition. For a reaction hold, keep position and camera stable unless the beat calls for a move.

Suggested starting budgets for an original scene, to adjust against the actual recording:

| Beat component | Starting range | Purpose |
|---|---|---|
| Small anticipation | 2–6 output frames at 24 fps | Let the audience register preparation |
| Main gesture | 4–12 frames, with authored key poses | Make the change legible without floating motion |
| Reaction hold | 12–48 frames, or longer if dialogue requires it | Let the expression or joke read |
| Rapid reframe | 4–10 frames with clear start/end composition | Reveal the second actor or punch up an exchange |
| Location-establishing hold | At least the time needed to read the prop/actor relation | Explain the new space before another cut |

These ranges are proposed workflow defaults. They are not statistical confidence intervals or universal constraints extracted from four shorts.

## Reusable shot logic

Build shot types around narrative information rather than a fixed zoom schedule:

- **Dialogue two-shot:** stable horizon/table line; one actor can hold while the other speaks. Keep hand gestures clear of the face and critical prop.
- **Reaction close-up:** change crop or angle when the audience needs the expression. Allow a held face to carry the pause.
- **Prop insert:** isolate the tool, message, or evidence; one deliberate pan can reveal a row of objects.
- **Scale reveal:** overlap a large cropped foreground figure with a small distant actor. Preserve their ground relationship and shadow contact.
- **Reverse angle:** maintain readable actor orientation and spatial continuity; swap only when the new view adds information.
- **Payoff wide:** return to a simpler readable view after intense close-ups. The Christmas room and cloud-world wide ending demonstrate different versions of this release.

The user's requested slight body volume can be an optional design layer: shallow body thickness, a restrained edge shadow, and contact shadows while retaining graphic silhouettes and pose holds. This is an adaptation for new work, not proof that the references used the same 3D rig. Do not let added depth automatically introduce constant orbiting, realistic lens effects, or smooth floating limbs.

## Checks before calling a new render style-matched

Check actual motion over time, not just a thumbnail. Compare a dense strip around one gesture, one hold, and one edit. Confirm that the decisive poses read at phone size, hands keep contact with props, and a held expression survives long enough to be understood. Check the whole narrative once with audio because a visually correct pause can still be mistimed to the line.

Classify transitions before counting shots. A large face replacement can have more pixel difference than a real cut. Conversely, the Christmas dissolve spreads its change across enough frames to evade this abrupt-cut heuristic. Retain the raw candidate list and the separate reviewed list so later reviewers can trace the judgment.

Use the per-frame CSV to find anomalies, then inspect context. High optical flow at a cut is not camera speed. Near-zero whole-frame motion is not automatically a freeze bug. The appropriate test is whether the stillness, action, or cut serves the current beat and matches the chosen reference variant.

## Files to use

- [Analysis method](ANALYSIS_METHOD.md): units, thresholds, extraction, limitations, and reproduction commands.
- `references/data/analysis_manifest.json`: source hashes, measured coverage, and tool versions.
- `references/data/<id>/frames.csv`: every source frame, timestamp, brightness/saturation, difference, and optional flow measurements.
- `references/data/<id>/held_spans.json`: threshold-based near-static intervals.
- `references/data/<id>/cut_candidates.json`: untouched machine proposals.
- `references/data/tN0ra1h3uKo/reviewed_boundaries.json` and `references/data/HOjbzw2xqEE/reviewed_boundaries.json`: exact visual-review coverage and classifications supporting this report.

