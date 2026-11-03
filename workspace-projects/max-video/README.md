# Max and the shared wall

Editable Three.js / Remotion animated short. Native **1440 × 2560, 30 fps, 2,887 frames** (96.2333 seconds). The supplied MP3 is preserved and plays at its original speed. `public/mix.wav` adds a new score and Foley.

## Source and style
The human drawing helpers, painted-world materials, ink, depth-of-field, grade and camera engine derive from the MIT-licensed [claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) snapshot `e3b817b6afc6cd413466d43f11ba31209e034bbf`. Its license is retained in `third_party/`. The user-supplied scene library provides Max, people, sets, rigging, and timed action data. This production creates new cameras for all 42 beats, changes opening staging and room colors, adds props, improves dialogue mouths, and renders every frame anew. No earlier rendered footage is used. Details: `PRODUCTION.md` and `docs/FRESH_SHOT_DESIGN.md`.

## Run
Uses Node.js, npm, FFmpeg/ffprobe, and Google Chrome on Windows. Dependencies are pinned by `package-lock.json`.

```powershell
npm ci --ignore-scripts
npm run typecheck
npm run studio
# Complete native 2K film, including the final sound mix:
npm run render
# Diagnostic stills, or selected frames:
npm run render:stills
node scripts/produce.mjs stills 0,64,2425,2886
# Full-resolution stills:
$env:MAX_NATIVE='1'
node scripts/produce.mjs stills 64
```

Select `MaxWall2K` in Studio for the 2K film and mixed audio. `MaxWall` is the compatibility 1080p composition with narration only. The renderer uses `C:/Program Files/Google/Chrome/Application/chrome.exe`; change `browserExecutable` in `scripts/produce.mjs` on another system. Optional environment variables: `MAX_CONCURRENCY` (default 2), `MAX_OUTPUT`, and `MAX_RANGE` (for example `0-89`).

## Editing
- `src/Scene.tsx`: action and contact staging.
- `src/Story.ts`: actual repository camera engine and shot cameras.
- `src/Characters.ts`, `src/DogMax.ts`: human adapters and Max's rig.
- `src/Worlds.ts`, `src/Props.ts`: room geometry and props.
- `src/Look.ts`, `src/Post.tsx`: derived lighting and preserved post stack.
- `src/captions.json`: word timing for dialogue animation; `docs/script.txt`: exact narration text. Captions are sidecars, not burned into the picture.
- `public/narration.mp3`: unchanged supplied voice; identity in `docs/audio_identity.json`.
- `docs/story_beats.json`: 42 timed story beats; `docs/captions.srt` / `.vtt`: sidecar captions.

The supplied voice was locally transcribed/aligned with two acoustic passes; no replacement narration or time-stretch was used. Caption timing and media integrity were checked separately from visual frame review.

## Fresh production
`scripts/produce.mjs` renders the entire film directly from the current source. There are no reused opening chunks. Current QA and renders are under `outputs/`; audio credits, cue timing, and mastering measurements are under `audio/`. The editable archive excludes historical production scripts and reports copied from the supplied library.

Only final videos and the compact editable source package are deliverables. Local caches, `node_modules`, alignment virtualenv/analysis WAV, large QA image sequences and private transfer helpers are intentionally excluded from the source archive. No public deployment is performed.
