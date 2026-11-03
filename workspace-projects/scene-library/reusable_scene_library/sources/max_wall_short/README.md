# Max and the shared wall

Editable Three.js / Remotion animated short. Native **1080 × 1920, 30 fps, 2,887 frames** (96.2333 seconds). The supplied 96.208938-second MP3 is used at its original speed; the last video frame holds briefly after the voice ends.

## Source and style
The human drawing helpers, painted-world materials, ink, depth-of-field, grade and camera engine derive from the MIT-licensed [claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) snapshot `e3b817b6afc6cd413466d43f11ba31209e034bbf`. Its license is retained in `third_party/`. Max, the apartment sets, costumes, props, staging and story are new. The night look is an explicit derived lighting/color adapter, not an unchanged upstream preset. The prior approved baseball project was preserved separately and is not included here.

## Run
Tested with Node.js 24.22.1, npm, FFmpeg/ffprobe and Linux Chrome Headless Shell. Dependencies are exactly pinned by `package-lock.json`.

```sh
npm ci
npm run typecheck
npm run studio
# Native complete render from the editable sources:
npm run render -- --comp MaxWall --out outputs/Max_Wall_FullFilm_HD.mp4 --concurrency 3
# One native frame:
npm run render -- --comp MaxWall --still 689 --out outputs/check.png
```

The renderer expects Remotion's Chrome Headless Shell at `node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell`. Set `CHROMIUM_PATH` to a compatible local executable if your installation differs. The renderer binds its file server only to `127.0.0.1`. `scripts/setup-local.mjs` is an optional, pinned-dependency loopback workaround for restricted environments; do not run it against shared or symlinked dependencies.

## Editing
- `src/Scene.tsx`: action and contact staging.
- `src/Story.ts`: actual repository camera engine and shot cameras.
- `src/Characters.ts`, `src/DogMax.ts`: human adapters and Max's rig.
- `src/Worlds.ts`, `src/Props.ts`: room geometry and props.
- `src/Look.ts`, `src/Post.tsx`: derived lighting and preserved post stack.
- `src/captions.json`: word-highlight timing; `docs/script.txt`: exact narration text.
- `public/narration.mp3`: unchanged supplied voice; identity in `docs/audio_identity.json`.
- `docs/story_beats.json`: 42 timed story beats; `docs/captions.srt` / `.vtt`: sidecar captions.

The supplied voice was locally transcribed/aligned with two acoustic passes; no replacement narration or time-stretch was used. Caption timing and media integrity were checked separately from visual frame review.

## Checkpoints and production
`render_preview.mjs` and `render_film.mjs` create immutable source snapshots and verified, resumable native chunks. The production full-film path reuses the independently reviewed 300-frame opening; its source fingerprint is recorded separately from the remaining-film snapshot. Run the preview script first when using that production path. The direct render command above does not need prior output files.

Only final videos and the compact editable source package are deliverables. Local caches, `node_modules`, alignment virtualenv/analysis WAV, large QA image sequences and private transfer helpers are intentionally excluded from the source archive. No public deployment is performed.
