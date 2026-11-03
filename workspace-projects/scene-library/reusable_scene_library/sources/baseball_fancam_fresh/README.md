# Fan Cam — fresh repository-based remake

Fresh baseball world, actual MIT `claude-animated-shorts` character/render methods, original supplied narration.

**Work in progress.** The first native diagnostic was deliberately rejected for contact/gaze/composition issues. No full-film production has begun. First delivery is a ten-second native-HD preview for feedback.

## Start
```sh
npm ci --ignore-scripts
node --input-type=module -e "import {ensureBrowser} from '@remotion/renderer'; await ensureBrowser({chromeMode:'headless-shell'});"
# In the restricted cloud runtime only, keep the media proxy loopback-only:
node scripts/setup-local.mjs
npm run typecheck
node scripts/render.mjs --comp FanCamFresh --still 1362 --out outputs/check.png
node scripts/render.mjs --comp FanCamFresh --frames 1162-1461 --concurrency 1 --out outputs/FanCam_RepoRemake_10s_HD.mp4
```

No dependency lifecycle scripts are required. Rendering is local. `CHROMIUM_PATH` optionally overrides the official project-local Headless Shell path. Public assets contain only the supplied narration. Private style-study references are outside this project and must not be packaged or delivered.

## Sources and minimal adaptations
- Upstream pinned commit: `e3b817b6afc6cd413466d43f11ba31209e034bbf`.
- `src/vendor/`: actual upstream drawing, lighting, material, painted textures, ink, lens and grade code, with MIT license retained. `toon.ts` has narrowly scoped optional baseball outfit, seat-contact and grip hooks; its head/face/limb drawing remains the repository's implementation.
- `Characters.ts`: role/outfit/action adapter around repo `bodyFront`, `headBlob`, face library and `cardShade`.
- `Worlds.ts`: new baseball stadium, bedroom, office and meeting geography using repo `paint`/`twoTone` utilities.
- `Look.ts`, `Post.tsx`: actual repository day light/sky/shading and ink→lens→bloom→Neutral→grade pipeline; no unrelated render pipeline.
- `Story.ts`: actual repository camera engine with baseball framing and word-synced action cues.
- Only supplied narration, captions and word/beat timing were carried from the old project; no old animation implementation was reused.

The original finished movie, ZIP and audio are preserved read-only next to the project under `../checkpoint_originals/` and remain separate Library records.
