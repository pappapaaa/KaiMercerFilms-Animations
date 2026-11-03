# Max — The Wall at 3 AM

User-requested fresh production, 2026-11-02. Full supplied script and ElevenLabs Alex recording are preserved. Duration: 2,887 frames at 30 fps (96.233 seconds), 1440 × 2560 native output.

## Current direction

The user explicitly requested new frames. The scene library provides character rigs, geometry, painted texture functions, and word-aligned action data. This production replaces the archived camera design with a fresh shot sequence, changes opening staging, adds new calendar/coffee/slipper props, redesigns room colors and the phone screen, and renders every frame locally. No old rendered frames or video segments are used.

Dialogue uses a new mouth-only animation adapter while retaining facial expressions. Hallway door state resets before each pose so out-of-order rendering is deterministic. The original recording is not sped up or trimmed. A new suspense-to-warmth score and Foley mix accompany it.

## Commands

Run in this folder with Node.js and Chrome installed:

```powershell
npm ci --ignore-scripts
npm run typecheck
node scripts/produce.mjs stills
node scripts/produce.mjs video
npm run studio
```

Select `MaxWall2K` in Studio for the final mixed audio. The compatibility compositions retain the supplied narration alone. Current renderer uses `C:/Program Files/Google/Chrome/Application/chrome.exe`; edit `scripts/produce.mjs` if Chrome is elsewhere.

Original source is preserved separately under `../scene-library/`. Historical QA copied with the library is background context, not verification of this version. Fresh production checks and deliverables are written under `outputs/`.

The user supplied the dramatic story; this project does not assert that it documents a verified real incident. Asset and code licenses remain in `third_party/` and `src/vendor/`; audio credits are in `audio/README.md`.

## Completed delivery

The final 2K film and 720p preview are in the parent workspace's `out/` directory, with the editable ZIP. All 2,887 frames passed the decoded-frame scan. Final color encoding is limited-range BT.709/yuv420p, with stereo AAC. Final review, measured specs, and audio results are in `outputs/qa/`. The render script now selects that color format directly; a native three-frame render verified the setting.
