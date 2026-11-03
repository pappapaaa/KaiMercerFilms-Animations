# Reuse guide

## Safest starting point
1. Copy the relevant directory from `sources/` into a new project. Do not modify frozen production inputs or render checkpoints.
2. Keep `src/`, `docs/story_beats.json`, `src/captions.json`, `public/narration.mp3`, `package.json`, `package-lock.json`, `tsconfig.json`, scripts and third-party notices together. Retain exact dependencies with `npm ci --ignore-scripts`.
3. Install/locate the matching Remotion Chrome Headless Shell if necessary. `CHROMIUM_PATH` can point at a compatible browser. Node.js 24.22.1, npm and FFmpeg/ffprobe were the existing local production toolchain; no fresh install or render was performed for this archive.
4. Run `npm run typecheck`, then `npm run studio`. Render a single diagnostic frame before a larger range:

```sh
# Max, inside the copied project:
node scripts/render.mjs --comp MaxWall --still 689 --out outputs/check.png
# Baseball, inside its copied project:
node scripts/render.mjs --comp FanCamFresh --still 1362 --out outputs/check.png
```

Both native compositions are 1080 × 1920 at 30 fps. Max is 2,887 frames; baseball is 2,253 frames. Direct `scripts/render.mjs` rendering is portable. Preview/full-film resumable launchers refer to checkpoint output files deliberately excluded here; do not assume a copied package contains their previously rendered chunks. The baseball `render:film` package entry references a missing script in the original project: use its existing direct renderer instead. This caveat is documented rather than silently modifying approved source.

## Reuse a complete shot
Find the ID and `[startFrame, endFrameExclusive)` range in `SHOTS.json`. Keep its `Worlds.ts` set, `Scene.tsx` pose/contact branch, `Story.ts` camera keys and light mode together. Absolute frame/word timing also lives in captions and editorial cue data. Change those together; simply moving a shot start without retiming actions will not preserve its performance.

The 70 entries are timed definitions in two compositions, not 70 separately exported components. Frame coordinates in proof references are native timeline coordinates, not a new clip’s local zero.

## Reuse only a set
Use the existing exported world builder. Its result includes a `root` plus optional controls/references. Keep same-project `vendor/paint.ts`, `vendor/shade.ts` and utility imports. Max uses a shared global floorplan: retain `FLOORPLAN` and the later locked corrections in `docs/world_contract.md`. For Sunday use `setSide(...)`, not overlapping both rooms. Baseball `buildOffice(true/false)` is one builder with boss/employee variants.

## Reuse a character or prop
Use `makeCharacter(role, costume, seed)` or Max `makeMax(seed)` with their documented `pose(...)` controls and `dispose()` lifecycle. These are illustrated canvas/card rigs, not articulated GLB assets. Preserve contact metrics, axes and original material/layer conventions. Max and baseball have different adapter versions; do not mix them by filename alone.

Standalone props in `Props.ts` already have exported factories. Apartment clocks, steak plates, doors, dog bed and knock rings are embedded in `Worlds.ts`; copy/export a factory with its material/geometry dependencies only in a new working copy. Asset index entries explicitly mark these as extraction work, not finished standalone modules.

## Reuse the look and camera language
Preserve `Look.ts`, `Post.tsx`, same-project vendor modules and `Scene.tsx` renderer settings as a group. The post order is ink → lens pre/main → bloom → Neutral tone map → grade. World textures are procedural. Max’s night/hallway/bathroom palette is a derived adapter, not an unchanged upstream preset; day/Sunday and baseball use the original day configuration. Camera motion uses the original dolly/zoom/glide engine but each framing and cue is story-specific.

## Preview and validation
`PREVIEW_REFERENCES.json` points to existing local native stills and preview movies; they are not copied into this small archive. Diagnostic references do not imply every shot has had a new visual review. No new thumbnails or renders were generated. `python tools/verify_library.py` checks this unpacked archive against `CHECKSUMS.sha256`; it does not install, compile or render anything.

## Opening provenance
The production Max opening reused its previously approved 300 frames; its exact earlier source is in `checkpoints/max_approved_opening`. The current full-film source is separately preserved in `sources/max_wall_short`. Their fingerprints and original receipts are intentionally distinct; do not claim all final pixels came from one source version.
