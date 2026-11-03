# Independent skill forward-test result

**Result: passed for the bounded reuse case.** The kit was sufficient to author and render a new worried-courier scene with a new notebook prop, new desk/set, new framing and new performance timing without modifying a shared module.

Test performed 2026-11-02. Request and shot plan are in [BRIEF.md](BRIEF.md). The test deliberately uses the existing courier identity because the request asks for a courier; it does not claim the character generator can automatically invent arbitrary new identities.

## What was read and used

- `SKILL.md` → `STYLE_BIBLE.md` → `CODE_CONTRACTS.md`, `NEW_VIDEO_TEMPLATE.md`, `QA.md`, and relevant code.
- `makeCharacter()` with `bodyDepth=.12`, `holdFrames=2`, `worried`, `gaze`, `lean`, `headTurn`, `rest` and `hold` gestures.
- Shared palette/lighting data, deterministic painted panels, `outlinedBox`, frame sampling and interval/easing helpers.
- A new Remotion entry/composition and original notebook geometry in this folder. No source-video imagery or existing proof scene was inserted.

The coordinate, frame timing, disposal, material, mood and gesture contracts matched the implementation. No TypeScript or runtime API mismatch blocked the scene. The scene explicitly owns its lights, consistent with `makeWorld`/prop guidance. The new set uses the lower-level panel/box primitives rather than the existing parcel room.

## Output and inspection

Composition `NotebookMoment`: 1440 × 2560, 24 fps, 48 frames. Requested test stills were rendered at 0.375 scale, producing 540 × 960 PNGs:

- [Frame 0](stills/f0000.png): readable worried face and relaxed hands; notebook is clearly on the desk.
- [Frame 12](stills/f0012.png): eyes shift down-right and head/body subtly orient toward the notebook; graphic face remains legible.
- [Frame 36](stills/f0036.png): concern holds with inward hands; notebook stays fixed on the tabletop.

The notebook reads through its plum covers, light page block, contrasting spine, blank paper label and yellow ribbon. Cover/page separation supplies modest actual thickness. It rests at y=.88 on the desk top, with its bottom-center pivot documented in `Notebook.ts`. No pickup or handoff was requested.

The initial camera used FOV38 and clipped the left edge of the head at frame 0. Following the skill's crop review instruction, it was widened to FOV42 and all three stills were rendered and inspected again. The final files show the full head, the whole notebook, and clear table/body overlap. The camera is locked and slightly elevated so the notebook's cover is visible.

The face is flat/matte, body thickness remains .12, and the outfit/skin/ink separates from the muted new room. The shared sleeve depth cleanup is present; no dotted sleeve seams were apparent in the final phone-size stills. This test does not establish native-resolution perfection or full-film motion/audio quality.

## Commands actually run

From repository root:

```powershell
npx tsc --noEmit --project outputs/forward-test/tsconfig.json

$env:ENTRY = 'outputs/forward-test/index.tsx'
$env:COMP = 'NotebookMoment'
$env:STILLS_DIR = 'outputs/forward-test/stills'
$env:STILL_SCALE = '.375'
node templates/scripts/render.mjs stills 0,12,36
```

Typecheck exited 0. The renderer exited 0 and reported all three requested stills. It emitted a webpack cache snapshot warning and a Three.js Clock deprecation warning; neither prevented bundling, scene evaluation or output. Those are dependency/cache advisories, not scene contract errors.

The local `tsconfig.json` extends the root compiler settings and includes the test's TypeScript files. It avoids relying on whether the repository-wide include pattern covers this test-only output folder.

## Documentation findings sent to the maintainer

1. **Separate entry command:** the initial README read did not list `ENTRY` and `STILLS_DIR`, although the renderer supported both. A future user needs these to keep a new scene isolated. The maintainer confirmed these variables were documented during the test.
2. **Typecheck scope:** at initial inspection the root `tsconfig.json` included only `examples` and `templates/bridge`. A user could put a new scene elsewhere and receive a passing `npm run typecheck` without checking it. The maintainer is adding an episodes pattern and a documented local-config recipe; this test already uses the explicit local command above.
3. **No additional blocking omission:** coordinate conventions, new prop construction, palette ownership, frame intervals, character API, graphic-face limitations and deterministic evaluation were sufficient for this case. This still requires authored code and staging decisions, as the skill states.

## Scope and retained limitations

This is a two-second silent scene authoring test with three inspected stills, not a finished narrated video. It does not test lip sync, handoff constraints, a new character identity, a long script, moving camera continuity or an audio mix. No movie, title or thumbnail is claimed. Source and results are kept together so the case can be rerun after changing shared modules.

Files in `outputs/` are normally Git-ignored by this repository. The maintainer should explicitly include this folder in a desired test-evidence package or move it to the documented episode/test area if the case should ship in the source repository.
