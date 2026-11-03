# Completed repository checks

The separate repository contains the four-video study, editable animation/audio code, reusable skill and an original 12-second courier proof. The proof is a technical demonstration, not a finished narrated episode or the selected permanent channel character.

## Reference study

- Four source MP4s downloaded locally at 1080×1920, approximately 24 fps.
- All 3,909 native presentation frames decoded, timestamped, measured and archived as reduced JPEGs.
- All 67 dense contact sheets visually reviewed across character, motion and look reviews.
- 138 selected native-resolution archive frames, plus additional named character/ink/color measurement samples.
- Raw candidate boundaries separated from reviewed Christmas/Refrenced edit classifications.

## Renderer and assets

- `npm run typecheck` passed for the registered examples and shared source.
- Final proof rendered at 1440×2560, 24 fps, 288 frames, 12.000 seconds.
- Complete FFmpeg video/audio decode and all 14 delivery checks passed.
- Audio: stereo AAC, 48 kHz; encoded duration 12.011 seconds includes codec padding.
- Five near-static intervals are intentional review advisories; no black intervals detected.
- Original full-body, close-up and night shots were inspected. Sleeve depth seams were corrected and the film rerendered. Pointing and open-hand silhouette swaps are included.

## Reuse and audio

- Independent forward test built a worried-courier/notebook scene with a new notebook prop and different framing under `outputs/forward-test/`. Local typecheck and inspected renders passed. The test prompted documentation of isolated entries and new-episode typechecking.
- Audio integration check passed: 12-second output, original voice timing retained within PCM quantization, music duck ratio approximately 0.280 during voice versus silence, and overlength voice correctly rejected.
- The supplied proof audio contains only original tap/pop Foley; no reference voice or music is reused.

## Kit validation

- Full study: 43/43 checks passed, including all JPEG decodes, CSV indices/timestamps, source hashes, sheet counts and timeline registration.
- Code-only mode, including the selected permanent character assets: 14/14 checks passed.
- Skill-creator frontmatter/scaffold validation passed.
- An intentionally incorrect expected video count of 289 frames was correctly rejected; that negative test is not a failure of the delivered 288-frame proof.

See the adjacent QA JSON files and `forward-test/RESULTS.md` for exact details. Curated third-party visual evidence remains separate from the code package; raw downloads and all-frame JPEGs stay in the complete local folder.

## Selected permanent character

The user selected original imagegen Option C. `characters/main/concept.png` preserves the chosen image, `model-sheet-v2.png` provides the corrected front/three-quarter/side/back and six-expression sheet, and the character bible/identity JSON records the stable design. The earlier model-sheet draft and all four candidate images/prompts are retained. Generation and the front-view correction used the built-in imagegen tool.

The editable C rig lives in `templates/characters/`; the independent eight-second identity test lives in `episodes/main-character/`. It uses the selected hair/glasses/clothing and six expressions, with configurable shallow body depth. It is a practical front/three-quarter animation interpretation, not a recovered or fully rotatable source 3D model. The courier demonstration remains separate.

The user subsequently requested the exact lowercase word **kai** in red on the character's left chest. This is saved in the imagegen edit, sweater drawing code, identity JSON and character bible. The final identity test shows this mark and leaves room for the full waving hand. The 2K character test passes all 12 applicable video checks (192 frames, 24 fps, 1440×2560, 8 seconds, clean full decode); it is intentionally silent.
