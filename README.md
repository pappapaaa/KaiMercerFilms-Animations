# Reference Shorts Style Kit

A separate working repository built from the four supplied TheOdd1sOut shorts. It follows the useful architecture of [claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts): a reusable skill, evidence-backed style bible, specialist reports, editable animation modules, audio tools and production scripts. Its style measurements come from these four videos, not from the upstream bridge film.

The included **12-second original courier proof** demonstrates expressive poses, held drawings, graphic ink, a painted room and the user's requested slight body volume. It has original Foley, no narration, and three technical demonstration shots. It is not a finished story or a promise that any script renders without new authoring.

## What is saved

| Evidence | Coverage |
|---|---:|
| Downloaded references | 4 local MP4s, 1080×1920, approximately 24 fps |
| Native presentation frames decoded and measured | 3,909 |
| Indexed reduced-resolution frame JPEGs | 3,909 |
| Dense contact sheets, all visually reviewed | 67 |
| Selected native-resolution PNGs in the extraction archive | 138 |
| Additional native measurement samples | Character boxes, palette regions and contour scans |

Every dense cell has its source frame/time. Native detail samples are selective. Machine cut proposals remain separate from reviewed edits. See [analysis method](references/reports/ANALYSIS_METHOD.md) and [source manifest](references/sources.json).

## Start here

The permanent lead is now **Character C**, selected by the user: spiky espresso hair, round glasses, mustard sweatshirt with a red lowercase **kai** mark on the left chest, plum trousers and cream sneakers. See [character bible](characters/main/CHARACTER_BIBLE.md) and [selected concept](characters/main/concept.png). Use `templates/characters/MainCharacter.ts` for this recurring lead. The courier remains a separate technical proof.

- Give Claude or Codex this folder and ask it to read [SKILL.md](SKILL.md), then provide your new script and audio.
- Read [STYLE_BIBLE.md](references/STYLE_BIBLE.md) for the visual rules and evidence.
- Use [NEW_VIDEO_TEMPLATE.md](references/NEW_VIDEO_TEMPLATE.md) to plan an episode and [CODE_CONTRACTS.md](references/CODE_CONTRACTS.md) to extend the renderer.
- Inspect `outputs/style-proof-preview.mp4`, `outputs/style-proof-2K.mp4`, and `outputs/stills/` in the complete local workspace.

Example instruction for a new episode:

> Use this repository's SKILL.md and STYLE_BIBLE.md for my attached script and narration. Create fresh characters, props, environments and shot compositions as needed. Keep the face graphic and the body only slightly dimensional. Time the acting to my recording. Save the editable project, a checked 2K vertical film, a preview, a title and a new thumbnail.

The skill is project-local. It has not been silently installed into a global Claude or Codex skills directory. Keeping the skill and its references together avoids broken relative paths.

## Run the example

Requirements: Node 22 or later, Chrome, and the pinned npm dependencies. Python 3.13 plus FFmpeg/FFprobe are used by the analysis/audio tools. The supplied `public/demo-mix.wav` lets you render the example before installing Python packages.

```text
npm ci
npm run typecheck
npm run studio
npm run stills
npm run render
npm run render:preview
```

The renderer looks for Chrome in common Windows/macOS/Linux locations. Set `CHROME_PATH` if necessary. Output is 1440×2560 at 24 fps; preview is 720×1280. `npm run stills` produces 540×960 inspection images. The committed lockfile records the tested dependencies.

PowerShell examples:

```powershell
$env:CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
$env:COMP = 'GraphicProfile'
node templates/scripts/render.mjs stills 84,132,207
Remove-Item Env:COMP
$env:STILL_SCALE = '1'
node templates/scripts/render.mjs stills 132
Remove-Item Env:STILL_SCALE
```

`GraphicProfile` uses a near-flat body depth of 0.025; `StyleProof` uses 0.12. These are shared world units, not recovered source dimensions. Optional renderer environment variables: `COMP`, `CHROME_PATH`, `STILL_SCALE`, `CONCURRENCY`, `FRAME_RANGE` (inclusive `start-end`), `OUTPUT`, `ENTRY` (a separate Remotion entry file), and `STILLS_DIR`.

Render the selected character's eight-second identity test separately:

```text
npm run character:stills
npm run character:render
npm run character:preview
```

The equivalent explicit entry configuration is:

```powershell
$env:ENTRY = 'episodes/main-character/index.tsx'
$env:COMP = 'MainCharacter'
$env:STILLS_DIR = 'outputs/main-character/stills'
node templates/scripts/render.mjs stills 0,48,72,96,120,144,180
$env:OUTPUT = 'outputs/main-character-2K.mp4'
node templates/scripts/render.mjs video
Remove-Item Env:ENTRY, Env:COMP, Env:STILLS_DIR, Env:OUTPUT
```

This is a silent character/acting test. It does not reuse the courier proof's audio. New episode source under `episodes/` and character source under `templates/characters/` are included in the root typecheck.

## Audio and analysis

```text
python -m pip install -r templates/scripts/requirements.txt
python templates/audio/mix.py
python templates/audio/mix.py --voice narration.mp3 --timeline episode-timeline.json --out public/episode-mix.wav
python templates/scripts/validate_kit.py
python templates/scripts/validate_kit.py --full-study
```

For an extracted **code package**, use `python templates/scripts/validate_kit.py --code-only`; reference images are intentionally absent. Standard validation fits the study package. `--full-study` additionally requires the complete local downloads and all-frame JPEG archive (or a reproduced download/analysis run).

For a new recording, extend the timeline before mixing; the mixer rejects narration that exceeds picture duration. It does not speed up speech. Music ducking is based on the supplied voice envelope, and the optional final loudness target is a production choice, not a measured common setting across the references.

Reproduce the reference study:

```text
python templates/scripts/download_references.py
python templates/scripts/download_references.py --captions
python templates/scripts/analyze_references.py
python templates/scripts/analyze_audio.py
```

Network availability and YouTube formats can change. The downloader uses public videos without account cookies. The initial build retained all four videos and original English automatic captions. Downloads, all-frame JPEGs, caches and renders are ignored by Git but remain in the complete local folder. A source hash in each summary identifies the studied encode.

## Layout

```text
SKILL.md                         Reusable agent workflow
examples/                        Remotion entry and proof compositions
characters/main/                 Chosen permanent character concept, bible and model sheet
characters/concepts/             Four original imagegen options and their prompts
episodes/main-character/         Selected character identity/acting render
templates/characters/            Editable permanent lead rig and drawings
templates/bridge/
  Bridge.tsx                     Scene assembly and timed proof performance
  Character.ts                   Shallow articulated character and hand anchors
  characterDrawing.ts            Editable face, hair, body and limb drawings
  Design.ts                      Palettes, ink hierarchy, lights and scale
  World.ts                       Original painted room and scene geography
  Paint.ts                       Deterministic texture generation
  Props.ts                       Outlined props and extension examples
  Story.ts                       Shots, duration and cue data
  Camera.ts                      Motivated locked views and a small reaction push
  Motion.ts                      Frame-based timing, exposure and walk helpers
  Post.tsx                       Optional restrained atmosphere
templates/audio/                 Mixer, original Foley, reusable DSP/instruments
templates/scripts/               Download, frame/audio analysis, render and QA
references/
  STYLE_BIBLE.md                  Cross-reference visual specification
  CODE_CONTRACTS.md               Module APIs and implementation rules
  NEW_VIDEO_TEMPLATE.md           Reusable production brief and shot plan
  QA.md                          Review procedure
  reports/                       Detailed specialist reports
  data/                          Per-frame CSV, metrics and reviewed boundaries
  frames/                        All frames locally plus selected native PNGs
  sheets/                        Exhaustive dense sheets and sampled overviews
  character-measurements/         Annotated body/head/ink measurements
  look-measurements/              Native palette/outline evidence
  videos/                        Original downloads, local study only
public/demo-mix.wav               Original proof Foley
outputs/                         Rendered proof, QA reports and previews
```

`templates/bridge/` retains the folder name requested for compatibility. It contains the new courier kit, not the upstream bridge story. Existing Max and Eiffel projects outside this repository are separate.

## Packaging

`python templates/scripts/package_kit.py` writes a compact **code package** and a **local study package** under `outputs/`. Both contain the usable code/docs and original proof preview; the study package additionally contains reference sheets, selected native images and analysis data. Raw videos, all-frame JPEGs, dependencies and caches stay in the complete local repository. The study material is not included in the code license; see [NOTICE.md](NOTICE.md).

The folder has its own Git repository and `codex/reference-style` branch. No GitHub repository or remote publication is created by this task.
