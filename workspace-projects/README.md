# The Tower That Chases Shade

An original vertical science short, using the user's ElevenLabs Alex narration and code-rendered 2D characters in a painted 3D Paris setting.

## Deliverables

- `out/The-Tower-That-Chases-Shade-2K.mp4` — 1440 × 2560, 30 fps, 1,880 frames (62.667 seconds), H.264 + AAC.
- `out/The-Tower-That-Chases-Shade-preview.mp4` — smaller viewing copy.
- `public/audio/mix.wav` — final 48 kHz stereo mix.
- `SCRIPT.md` — original narration, factual sources, visual plan.
- `src/videos/eiffel/` — editable animation, characters, world, camera timing, and postprocessing.
- `out/qa/report.md` — final frame and audio checks.

## Open and render

Requires Node.js and FFmpeg. Chrome is currently configured at `C:/Program Files/Google/Chrome/Application/chrome.exe` in `scripts/render.mjs`; change this path if needed on another machine.

```powershell
npm install
npm run studio
npm run typecheck
npm run stills -- 30,220,800,1030,1250,1490,1790
npm run render
```

The render script creates a 2K picture render, then explicitly muxes the final sound mix into `out/The-Tower-That-Chases-Shade-2K.mp4`. Rendering is deterministic and requires no external assets or image-generation service. Temporary bundles stay inside this project's `.render-tmp` folder.

`src/videos/eiffel/story.ts` separates creative story time from the user's recorded timing. `VOICE_MAP` aligns the major visual beats without changing the supplied voice's speed or pauses. Word timestamps are model estimates and are identified as such in `public/audio/timing.json`.

## Sources and adaptation

The [mromidev/claude-animated-shorts repository](https://github.com/mromidev/claude-animated-shorts) supplied the MIT-licensed ink, lens blur, material shading, painted-texture and character drawing foundations. Its license is retained in `THIRD_PARTY_LICENSE.txt`. The tower, Paris scene, characters' outfits and props, story, camera staging, and music are original to this project. Study images are not used in the exported video.

The pasted tutorial was reviewed. This repository version contains 38 individual study frames and 20 contact sheets, rather than the 5,000 individual images mentioned in the transcript. It is a template/skill collection; this workspace adds the missing runnable Remotion project and a new story.

The [Eiffel Tower operator's explanation](https://www.toureiffel.paris/en/news/history-and-culture/why-does-eiffel-tower-change-size) supports the thermal expansion and sideways summit-motion facts. Fifteen centimeters refers to the approximate diameter of the summit's path, not a universal vertical height gain. Motion and atomic spacing are exaggerated for illustration; the narrator explains that actual tower movement is imperceptible to visitors.

The user supplied the final ElevenLabs recording on 2026-11-02. The waveform was resampled to 48 kHz without changing timing, delivery, or pauses. A previously generated draft voice is archived under `out/audio/previous-holden/` and is not used in the final export. Original instrumental and Foley stems, provenance and loudness measurements live in `out/audio/`.
