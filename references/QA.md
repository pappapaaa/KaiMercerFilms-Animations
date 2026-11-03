# Render and style review

Automated checks establish file integrity and timing. Visual/audio review establishes whether the scene works. A passing codec check cannot prove good acting or a faithful visual treatment.

## Before a full render

Run `npm run typecheck`. Render a full-body shot, reaction close-up, most oblique character view, each new environment, and each important prop interaction. Use `STILL_SCALE=1` for native-pixel inspection and the default reduced images for phone-size readability.

Inspect:

- Head/body proportions, face readability and recognizable new character identity.
- Hierarchical ink without doubled shoulder contours or depth-fighting seams.
- Rounded limbs and hands that communicate the intended action.
- Feet and props resting on believable surfaces; hand grips stay attached.
- New props and environments suited to the current script.
- Character/background value separation, including dark scenes.
- Clean crops: intentional close-ups are allowed; accidental missing hands or key objects are not.
- Restrained body volume and consistent graphic faces at the chosen angle.

## Motion review

Review adjacent frames around one walk, one hand action, one expression change and every edit. Rendering isolated beautiful poses is not enough. `contact_sheet.py` can assemble an indexed PNG sequence into labeled sheets.

Check preparation, decisive pose and result. Holds should last long enough to read and align with the narration. Do not reject a static frame simply because it is static: the studied style uses long intentional holds. Conversely, a held reaction should not silently persist after the line calls for a new action.

Check root travel against feet, shoulder/elbow continuity, prop handoffs and camera settling. A frame rendered by itself should match the same frame in sequence. Inspect motion both with and without sound; timing errors can be hidden by either presentation alone.

## Audio review

Measure recording duration before picture timing. Listen to the final mix for the first and last word, phrase pauses, cue alignment and music masking. The proof is Foley-only; its quiet sections are intentional. A new narrated film needs an actual narration review.

For a typical new narrated delivery, -16 LUFS and a true peak ceiling around -1.2 dBTP are configurable starting choices. They are not common recovered settings of the references. Meter the encoded deliverable as AAC encoding can change true peak. Keep voice speed at 1.0 unless the user specifically requests a speed change.

## File checks

```text
python templates/scripts/qa_video.py outputs/style-proof-2K.mp4 --frames 288 --fps 24 --width 1440 --height 2560 --require-audio
python templates/scripts/validate_kit.py --full-study
```

The full-study command requires all local source videos and indexed JPEGs. For a study ZIP use standard `validate_kit.py`; for a code ZIP use `validate_kit.py --code-only`. These modes check different available evidence rather than treating intentionally omitted reference media as a broken installation.

The QA report must distinguish failures from advisories. A failed decode, wrong dimensions/frame rate/count, missing required audio, or material timeline mismatch is a failure. An expected held pose or intentional black transition is a review item, not an automatic style failure.

Check the actual final frame and audio duration, not just a renderer progress message. Retain a QA JSON report with the delivery. If the proof or kit changes after review, rerun the affected check; do not repeatedly run unrelated tests once they have passed.

## New episode acceptance

The deliverable contains the requested master and preview, editable source, narration/mix timing, original assets or clear asset references, and any requested title/thumbnail. It uses a newly authored shot plan. Report remaining limitations plainly rather than calling a partially rendered film finished.
