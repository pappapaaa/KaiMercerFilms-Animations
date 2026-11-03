# Measured cel-animation style bible

This is the reusable specification for the four supplied shorts. It combines exhaustive frame indexing with visual review, native image measurements and an original working implementation. The goal is to reproduce visible design and animation principles in new work, while building fresh characters, shots and environments for each story.

## 1. Evidence and confidence

Use three labels when extending this document:

- **Measured:** a value extracted from a named source frame, mask, audio track or indexed frame series.
- **Observed:** a visual interpretation with a frame/sequence anchor. It may not uniquely reveal how the source was made.
- **Proposed:** an implementation choice that achieves similar visible behavior. World units, Three.js lights, camera FOV and mesh thickness belong here.

The source set is deliberately small and contains multiple production treatments. Do not convert every exception into a universal rule.

| Source | Native frames | Duration from frame timing | Dense sheets | Whole-frame near-static transitions |
|---|---:|---:|---:|---:|
| [The End of TikTok](https://www.youtube.com/shorts/2GGA4NlMjKc) | 1,282 | 53.417 s | 22 | 62.45% |
| [Two Front Teeth](https://www.youtube.com/shorts/tN0ra1h3uKo) | 978 | 40.751 s | 17 | 52.71% |
| [Refrenced](https://www.youtube.com/shorts/HOjbzw2xqEE) | 870 | 36.251 s | 15 | 72.50% |
| [All Dogs Go To Heaven?](https://www.youtube.com/shorts/XdcSli5STR4) | 779 | 32.458 s | 13 | 75.19% |

All are encoded at 1080×1920, approximately 24 fps. Every presentation frame was decoded and indexed. All **67 dense sheets** received reduced-cell visual review: TikTok in the character report, Christmas and Refrenced in the motion report, Dogs in the color report. The 138 native archive frames and additional measurement crops are selective detail evidence.

Near-static means adjacent RGB MAE ≤0.35 at the analysis resolution. It does not mean a frozen production file, and a small mouth movement can still pass. See [ANALYSIS_METHOD.md](reports/ANALYSIS_METHOD.md) for exact definitions, hashes, sampling and limitations.

## 2. Visual identity

**Observed:** the recurring grammar is graphic animation with expressive outlines, wide heads, compact rounded bodies and readable silhouette changes. Faces dominate the information hierarchy. Broad shadow bands add a sense of rounded form without realistic surface detail. Backgrounds use larger value/color regions and quieter lines than the characters.

**Observed:** motion is selective. A body may hold while the mouth changes; a camera/composite may reframe while a drawing stays constant. A sudden pose or size change is often more important than a long interpolated motion. The visual system supports both dry dialogue and much more dramatic lighting.

**Proposed:** use simple shallow geometry for controlled parallax and reusable staging, with graphic face drawings and restrained cel shading. This is a practical renderer choice, not proof that the references were made in 3D.

## 3. Character shape and scale

Measurements from the two standing Dogs samples give approximately **2.75–2.82 head heights** for the visible character. Sampled head height/width is approximately **0.73–0.79**, with hat, crop and perspective exceptions documented separately. Do not force all characters into one numerical mold: the clothed Christmas figures and foreshortened cloud scene have different visible proportions.

The reusable courier proposes a 2.4-unit figure with a 1.26×0.94 head front. The torso is broad, limbs are short, and hands have enough area to show action. A single long stick limb with a round dot hand is insufficient for gripping, pointing or covering the face.

**Build rules:**

1. Establish head, torso, hands and feet as clear silhouette masses.
2. Give the new character distinguishing hair, clothing, color and proportions.
3. Draw expressive eye and mouth variants rather than scaling one neutral face forever.
4. Let shoulders and hands change the silhouette at important beats.
5. Preserve an intentional overlap order at shoulders, elbows, wrists and held props.
6. Review front, three-quarter, full-body and extreme close-up views.

The user requested a little body dimension. Default `bodyDepth=0.12`; `GraphicProfile` uses 0.025. This setting changes mesh thickness, not the camera or emotional performance. It should be visible at an angle without turning the character into a glossy toy. See [CHARACTERS.md](reports/CHARACTERS.md).

## 4. Ink hierarchy

**Measured:** native contour scans include 22–23 px outer ink on the large TikTok head, 16 px on a Refrenced head sample, and about 6 px on a small Dogs head. Interior eye cores are thinner, such as 9 px against the TikTok outer contour and 8 px against the Refrenced sample. These are local native scans, not universal screen widths.

**Observed:** contour thickness scales with the subject. Character boundaries command more attention than background panel seams. Near-black contour cores are common; the previous repository's particular plum ink is not a measured rule here.

**Proposed:** begin near 2% of head width for the outer contour and around 40–50% of that for interior facial lines. Tune by shot scale. Environment detail uses softer value and thinner line. Check at phone size before adding more texture.

Avoid doubled boundaries where a sleeve overlaps the torso, tiny black cracks from coplanar geometry, and black boxes around every background surface. Use intentional occlusion and separate depth layers. See [OUTLINES_AND_MATERIALS.md](reports/OUTLINES_AND_MATERIALS.md).

## 5. Color, material and lighting variants

Native image samples establish local color relationships:

| Sample | Measured encoded-image colors | Meaning |
|---|---|---|
| TikTok f240 | face `#ffffff`, cool shadow `#b9d4fd`, olive background `#89967d` | A bright character separated from muted surroundings by fill, shadow and ink |
| Refrenced f48 | peach wall `#f5b393`, desk `#885144` | Warm simple office planes with strong foreground silhouettes |
| Christmas f336 | lit wall `#adbdd0`, dark ceiling `#0c141d` | Large light/dark groups create dramatic interior depth |
| Dogs f336 | upper sky `#569cf9`, lower sky `#7ccdfc` | Clear blue gradient behind light cloud/character forms |

These numbers are image-region measurements from compressed source media. They are not recovered paint swatches or physical light intensities. Use the report's ROI coordinates to reproduce them.

Choose a scene treatment before building:

| Treatment | Background | Character | Motion/camera use |
|---|---|---|---|
| Graphic conversation | Warm or muted flat planes; table and wall establish place | High contrast face, broad cool shadow, readable hands | Locked two-shots, selective close-ups, pose changes |
| Dramatic interior | Dark enclosing shapes, selective lit zones, overlapping foreground | Expression remains readable despite darker local treatment | Inserts, reverse angles, purposeful pan/reveal and longer tension holds |
| Bright fantasy | Blue/lavender space, large clouds, simplified horizon | Light rounded forms; scale contrast carries staging | Very wide scale reveals and extreme angle contrasts |

The proof's studio/night palettes are original interpretations. Front drawings use unlit color; shallow side surfaces can receive light. Background textures are deterministic. Keep roughness/specular detail restrained. Do not add bloom, grain or blur globally merely because those effects are available.

## 6. Depth and composition

**Observed:** overlap, scale, floor relationships and foreground framing create depth. Refrenced f537 introduces a giant cropped foreground figure and a small distant actor; f609 and f668 reverse low/high angles. Christmas around f277–334 layers a large softened foreground Santa against a smaller figure in the lit room.

**Proposed:** establish background, acting plane and occasional foreground occluder. Keep the face and important hand action clear. Use contact shadows for feet and props. The proof uses Y-up, ground y=0, acting plane z≈0 and rear wall z=-1.5. These units are an implementation convention.

Perspective does not justify constant orbiting. A front-focused graphic face needs a three-quarter variant or deliberate head-turn drawing for larger angles. Do not rotate a flat face to profile and expect volume to solve it. Use camera views to reveal information and preserve spatial continuity. See [DEPTH_AND_STAGING.md](reports/DEPTH_AND_STAGING.md).

## 7. Motion and performance

**Measured:** whole-frame near-static transitions cover roughly 53–75% of these encodes. Christmas has 180 measured two-frame spans; Refrenced has 106, while Dogs has a different distribution. This supports configurable limited animation, not a single universal exposure rate.

**Observed anchors:** Christmas f420–455 holds for about 1.5 seconds of exposure. Refrenced f304–353 holds for about 2.083 seconds. These are intentional readable beats. Motion should contrast with stillness.

**Proposed clocks:**

- Output: 24 frames per second.
- Pose: often sampled on twos, with explicit longer holds and occasional on-ones actions.
- Transform: independent camera/root/prop timing where a smooth move is needed.
- Face: emotional state plus timed mouth/eye drawings.
- Text: story-specific reading or emphasis cue, independent from generic subtitles.

Build an action as preparation → decisive change → readable result. Starting ranges are 2–6 frames preparation, 4–12 frames action and 12–48 frames reaction hold, adjusted to the actual voice. These are authoring suggestions, not statistical source measurements.

Never accumulate render-time delta into pose state. Evaluate from absolute frame number so frame 200 looks the same when rendered alone or after frame 199. Keep a planted foot stable in world space; use travel-derived gait phase and authored hand/prop constraints. A subtle depth rig does not require perpetual body bobbing.

## 8. Cuts, reframes and transitions

Heuristic frame changes can be pose replacements. Reviewed Christmas candidates contain **9 hard cuts and 11 action changes**, plus an additional approximately one-second dissolve around f160–185. Reviewed Refrenced candidates contain **6 hard cuts** and samples of **2 rapid pull-outs**.

The Christmas lamp close-up f335–498 lasts about 6.833 seconds; its reverse insert f715–729 lasts 0.625 seconds. Refrenced stays in the desk setting for 22.375 seconds before a location reveal. Do not impose a rigid cut-every-two-seconds schedule.

Choose a cut when a new expression, speaker, object, scale or location adds information. Use a rapid reframe if the motion itself creates a reveal. Reserve dissolves for a clear temporal/location transition. Treat flashes and distortion as optional story effects, not constant styling.

TikTok's late distortion, black interval and live-action bathroom insert are specific comic choices: distortion begins around f1026, black f1171–1193, live action f1194–1281. Dogs includes title intervals f0–23 and f277–301. Exclude these segments when defining the default cartoon palette or character rendering.

## 9. Text, narration and sound

The set contains written jokes and title cards, so a universal no-text rule is unsupported. Use text when the new story needs a message, label, correction or deliberate emphasis. Add captions only when requested or chosen for the new production; do not overlay them mechanically on the face.

The four mixed tracks range from **-23.65 to -15.37 LUFS**. Their separate voice/music/SFX gains cannot be recovered from mixed-track metering. The old bridge mix recipe is not source evidence. Preserve supplied voice speed; derive shot duration from it. Add music and Foley around the performance, and check the final integrated level/true peak. See [AUDIO_AND_TIMING.md](reports/AUDIO_AND_TIMING.md).

## 10. Map evidence to code

| Concern | Evidence | Implementation |
|---|---|---|
| Compact head/body and broad limbs | Character boxes and native crops | `Character.ts`, `characterDrawing.ts` |
| Graphic eyes, mouth and expression swaps | Character report and dense action cells | `characterDrawing.ts`, pose fields |
| Hierarchical ink | Native contour scans | `Design.ts`, outline materials, drawing strokes |
| Simple painted stage and palette variants | Color/lighting report | `Design.ts`, `Paint.ts`, `World.ts` |
| Original props and hand interaction | Depth/character reports | `Props.ts`, hand anchors |
| Holds and abrupt pose changes | Near-static measurements plus visual review | `Motion.ts`, `Story.ts`, per-shot acting |
| Stable framing and motivated reframes | Reviewed boundary maps | `Camera.ts` |
| Optional shallow volume | User preference, explicitly an adaptation | `bodyDepth`, side surfaces, contact shadows |
| Original timed sound | Audio measurement limits and new cue plan | `templates/audio/` |
| Deterministic delivery | New implementation requirement | `Bridge.tsx`, `render.mjs`, QA scripts |

## 11. Style acceptance

Judge a new shot on phone-size readability, silhouette clarity, face acting, hand/prop contact, ink hierarchy, palette separation, purposeful timing and scene geography. Compare one comparable reference sequence, not a collage of incompatible variants.

The proof checks the renderer and reusable modules. A new script still needs a new character/prop inventory, authored shot plan, narration timing, performance review and final sound pass. Save improvements back into reusable modules only after they work in an actual rendered shot.
