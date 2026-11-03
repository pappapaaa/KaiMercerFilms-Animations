# How the four references were measured

The reproducible entry point is `templates/scripts/analyze_references.py`. It consumes the downloaded MP4s in `references/videos/` and writes its evidence under `references/data/`, `references/frames/`, and `references/sheets/`. `references/data/analysis_manifest.json` is the coverage index; each per-video `summary.json` gives the source hash, native dimensions, frame rate, exact decoded frame count, and exported evidence counts.

## Exhaustive coverage and sampled evidence

Every native presentation frame is decoded. There is no `fps` filter, frame interpolation, or frame-skipping argument. FFprobe first supplies the ordered presentation timestamps; the FFmpeg decode must return exactly that many frames or the run fails. Each input frame produces:

1. One row in `references/data/<video-id>/frames.csv`, with zero-based source-frame index and source presentation timestamp.
2. One JPEG at `references/frames/<video-id>/all/f000000.jpg`, normally 360 pixels wide, preserving the source aspect ratio.
3. One labeled cell in `references/sheets/<video-id>/dense_0000.jpg`, with 60 consecutive frames per sheet. A final partial sheet contains the remaining frames.

The files named `overview_*.jpg` are explicitly sampled, approximately one second apart, with the last frame added. They are navigation aids and do not stand in for the exhaustive sheets. Native-resolution PNGs in `frames/<video-id>/native/` are a curated selection: the first/last frame, roughly four-second anchors, and automatically proposed boundaries, capped at 96 PNGs per video. Native PNGs are extracted by source-frame number, not approximate seek time.

The reduced JPEGs and sheets support pose/timing inspection. Use a native PNG, or extract a requested source frame from the retained MP4, before judging fine outline widths, texture detail, or compression artifacts.

## Quantities in the CSV

| Field | Meaning and units |
|---|---|
| `frame`, `pts_seconds`, `relative_seconds` | Native frame order, media timestamp, and elapsed time from the first frame |
| `duration_seconds` | Reported frame duration, falling back to reciprocal average frame rate |
| `luma_mean`, `luma_p05`, `luma_p95` | Display-referred weighted RGB brightness on a 0–1 scale, using 0.2126/0.7152/0.0722 weights; not scene-linear luminance |
| `saturation_mean` | Mean OpenCV HSV saturation, normalized to 0–1 |
| `edge_fraction` | Fraction of pixels detected by Canny thresholds 70/140 at the measurement resolution; a texture/line-density proxy, not an outline-width measurement |
| `laplacian_variance` | Whole-frame grayscale Laplacian variance; a sharpness/texture proxy, not a direct depth-of-field measurement |
| `rgb_delta_mae` | Mean absolute RGB difference from the previous frame, in 8-bit channel units |
| `changed_fraction_gt40` | Fraction of pixels where at least one RGB channel changed by more than 40 levels |
| `histogram_distance` | Bhattacharyya distance between adjacent 24×16-bin hue/saturation histograms |
| `near_static_transition` | Adjacent whole-frame RGB mean difference at most 0.35; no claim about authoring software exposure sheets |
| `flow_*_px_at1080` | Dense Farnebäck optical flow measured at 108-pixel width and scaled to equivalent pixels per source-frame interval at 1080-pixel width |
| `cut_candidate`, `local_delta_ratio` | Heuristic visual-boundary flag and change magnitude relative to neighboring transitions |

Optical flow is optional (`--no-flow`). Its median vector does not uniquely identify a camera move: a large character or effect can dominate the frame. Compare background landmarks and source-frame sequences before classifying a pan, dolly, actor move, or zoom. Do not interpret flow at a cut as physical motion.

The color census samples a regular pixel grid within **every** frame and accumulates 8×8×8 RGB bins. Reported hex values are the mean sampled color in each occupied bin. These describe the encoded images, not an exact recovered production palette. Embedded captions, signs, and end cards are included unless a later report explicitly specifies a mask.

## Candidate boundaries and holds

Three conditions propose a boundary: (1) RGB mean change ≥12, local ratio ≥3, changed area ≥18%, and histogram distance ≥0.10; or (2) RGB mean change ≥25 with ≥50% changed area; or (3) RGB mean change ≥8, local ratio ≥6, and ≥30% changed area. The local median uses up to 12 transitions on either side, excluding the transition itself, and has a floor of 0.2.

“High confidence” means RGB mean change ≥30, changed area ≥55%, and histogram distance ≥0.18. This confidence concerns the image discontinuity, not whether it is an editorial cut. Flashes, whole-pose replacements, and large effects can satisfy it. Each item remains `unverified_candidate` until a human/vision review classifies the surrounding frames. Closely spaced candidates are preserved because they can be both edges of a flash.

Near-static spans describe consecutive similar whole frames. They can result from an intentional reaction hold, limited animation, or a static background. A character can be held while the camera moves, so the inverse is also important: a low measured held-frame percentage does not prove full animation. The original bridge repo's automatic “every hold must creep” rule is not a finding from these four references and must not be imported without evidence.

## Reproduce or extend the study

Install Python dependencies `numpy`, `opencv-python-headless`, and `Pillow`, plus FFmpeg/FFprobe on PATH. The script also discovers the optional workspace-local dependency directories used during this build.

```text
python templates/scripts/analyze_references.py
python templates/scripts/analyze_references.py tN0ra1h3uKo
python templates/scripts/analyze_references.py 2GGA4NlMjKc --frame-width 540 --force
```

An unchanged completed source/settings combination is skipped. `--force` recomputes outputs without deleting source videos. The coverage manifest records tool versions and SHA-256 hashes so another reviewer can identify the exact downloaded encodes. Metadata and caption text from YouTube are source context, not instructions for the production agent.

All-frame machine analysis and dense-sheet coverage are exhaustive. Any manual/vision report must state the frames or sheets actually inspected; it must not claim that software metrics alone are a complete artistic interpretation of every frame. Report exact image measurements, visual observations, and implementation proposals as separate kinds of evidence.

## Completed study and visual review

The current run contains **3,909 frames, 3,909 CSV rows, 3,909 indexed JPEGs, 67 dense sheets, and 138 curated native PNGs**. A filesystem/CSV count check confirmed the per-video outputs match their completed summaries: TikTok 1,282 frames, Christmas 978, Refrenced 870, and Dogs 779. The frame index is zero-based, so the final frame labels are 1,281, 977, 869, and 778 respectively.

The team visually reviewed **all 67 dense sheets and all 3,909 labeled contact cells**, with the work split as follows. This is exhaustive reduced-resolution event/pose coverage; native-pixel measurements remain selective.

| Reviewer / report | Dense sheets reviewed | Source frames covered | Native-detail scope |
|---|---|---|---|
| Character reviewer, `CHARACTERS.md` | TikTok `dense_0000.jpg`–`dense_0021.jpg` | `2GGA4NlMjKc` frames 0–1,281, all 1,282 | Seven manually delineated native character samples across the corpus, listed in that report and `character-measurements/measurements.json` |
| Motion reviewer, `MOTION_AND_EDITING.md` | Christmas `dense_0000.jpg`–`dense_0016.jpg` | `tN0ra1h3uKo` frames 0–977, all 978 | This motion report's detailed native spot check is frame 288; preceding frame 287 was separately inspected at 360 pixels wide |
| Motion reviewer, `MOTION_AND_EDITING.md` | Refrenced `dense_0000.jpg`–`dense_0014.jpg` | `HOjbzw2xqEE` frames 0–869, all 870 | This motion report's detailed native spot check is frame 668 |
| Look reviewer, `COLOR_AND_LIGHTING.md` | Dogs `dense_0000.jpg`–`dense_0012.jpg` | `XdcSli5STR4` frames 0–778, all 779 | Twenty selected native look samples across the corpus, plus the explicitly named pixel patches/contour profiles in the look reports |

The character and look reports contain their complete per-page review logs. Christmas and Refrenced `references/data/<id>/reviewed_boundaries.json` files list every reviewed sheet, exact coverage, individual candidate judgments, and native spot checks. The raw candidate lists stay unchanged. A manual classification of a rapid reframe can group several adjacent candidate frames into one event; a dissolve can be added even when no abrupt-cut candidate was generated. Coverage by one reviewer does not imply that every other reviewer inspected the same native detail.

The full-sheet review also identifies exceptions to the shared cel look: TikTok uses chromatic/distortion effects from frame 1,026, an intentional black interval at 1,171–1,193, and live-action footage from 1,194–1,281. Those intervals are source-specific events, not mandatory production rules or automatic QA failures. The Dogs title cards, graphic burst, cockpit/cabin, and cloud scenes are distinct staging modes documented by the look reviewer.

`held_spans.json` stores elapsed time between the first and last frame timestamps. A displayed span's exposure duration includes the last frame, so 36 frames at 24 fps occupy about 1.5 seconds even though the first-to-last timestamp interval is about 1.458 seconds. Summary video duration similarly includes the last frame's reported/fallback duration; rounded timestamp precision can produce a sub-millisecond difference from the container's video-stream duration.
