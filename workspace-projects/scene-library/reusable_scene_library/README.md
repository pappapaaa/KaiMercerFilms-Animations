# Reusable Scene Library

Saved 2026-11-02T17:36:35.680705+00:00. **2 editable projects · 70 timed shot definitions (Max 42; baseball 28).**

Everything here is an exact source snapshot or a new index. No running-render inputs were changed. This is **source plus required original narration**, not rendered video, and not 70 standalone asset files.

## Start here
- `CATALOG.json`: searchable sets, characters, props, lighting, cameras and extraction points.
- `SHOTS.csv` / `SHOTS.json`: every timed shot with frame range, set, action and source location.
- `REUSE_GUIDE.md`: how to copy, render, retime and extract safely.
- `DEPENDENCIES.json` / `LICENSES.md`: exact dependency versions and provenance.
- `manifests/`: per-file byte hashes and snapshot fingerprints.
- `PREVIEW_REFERENCES.json`: existing proof stills / preview paths; no videos or image sequences are duplicated.

## Preserved projects
| Source | Purpose | Snapshot |
|---|---|---|
| Max | Current editable 2,887-frame film source | `sources/max_wall_short` |
| Baseball | Approved actual-repository style, 2,253-frame storyboard | `sources/baseball_fancam_fresh` |
| Max opening checkpoint | Exact earlier approved opening source | `checkpoints/max_approved_opening` |

Current Max render source matches the frozen production snapshot. Baseball render source matches its approved preview snapshot; two non-render-source differences are preserved under `checkpoints/baseball_preview_approved_differences/`. Original render fingerprints are recorded under `provenance/`. The original baseball README accurately retains its WIP notice; saving the source does not assert a completed full film.

## Reusable catalog
| ID | Type | Existing source / extraction point |
|---|---|---|
| `max.apartment` | set | `sources/max_wall_short/src/Worlds.ts` — `buildApartment` |
| `max.hallway` | set | `sources/max_wall_short/src/Worlds.ts` — `buildHallway` |
| `max.bathroom` | set | `sources/max_wall_short/src/Worlds.ts` — `buildHarlanApartment` |
| `max.sunday` | set-controller | `sources/max_wall_short/src/Worlds.ts` — `buildSundayWorld` |
| `max.human` | character | `sources/max_wall_short/src/Characters.ts` — `makeCharacter` |
| `max.dog` | character | `sources/max_wall_short/src/DogMax.ts` — `makeMax` |
| `max.phone` | prop | `sources/max_wall_short/src/Props.ts` — `makePhone` |
| `max.steak` | embedded-prop | `sources/max_wall_short/src/Worlds.ts` — `steakPlate` |
| `max.floorphone` | embedded-prop | `sources/max_wall_short/src/Worlds.ts` — `unreachableFloorPhone` |
| `max.clock` | embedded-prop | `sources/max_wall_short/src/Worlds.ts` — `clock` |
| `max.door` | embedded-prop | `sources/max_wall_short/src/Worlds.ts` — `door` |
| `max.dogbed` | embedded-prop | `sources/max_wall_short/src/Worlds.ts` — `dogBed` |
| `max.wallknock` | embedded-prop | `sources/max_wall_short/src/Worlds.ts` — `wallKnock` |
| `max.look` | lighting | `sources/max_wall_short/src/Look.ts` — `createLook` |
| `max.camera` | camera | `sources/max_wall_short/src/Story.ts` — `cameraAt` |
| `max.actions` | action-timeline | `sources/max_wall_short/src/Scene.tsx` — `function Layer` |
| `baseball.stadium` | set | `sources/baseball_fancam_fresh/src/Worlds.ts` — `buildStadium` |
| `baseball.bedroom` | set | `sources/baseball_fancam_fresh/src/Worlds.ts` — `buildBedroom` |
| `baseball.office` | set | `sources/baseball_fancam_fresh/src/Worlds.ts` — `buildOffice` |
| `baseball.meeting` | set | `sources/baseball_fancam_fresh/src/Worlds.ts` — `buildMeeting` |
| `baseball.human` | character | `sources/baseball_fancam_fresh/src/Characters.ts` — `makeCharacter` |
| `baseball.prop.phone` | prop | `sources/baseball_fancam_fresh/src/Props.ts` — `makePhone` |
| `baseball.prop.beer` | prop | `sources/baseball_fancam_fresh/src/Props.ts` — `makeBeer` |
| `baseball.prop.finger` | prop | `sources/baseball_fancam_fresh/src/Props.ts` — `makeFoamFinger` |
| `baseball.prop.note` | prop | `sources/baseball_fancam_fresh/src/Props.ts` — `makeNote` |
| `baseball.prop.sunglasses` | prop | `sources/baseball_fancam_fresh/src/Props.ts` — `makeSunglasses` |
| `baseball.prop.baseball` | prop | `sources/baseball_fancam_fresh/src/Props.ts` — `makeBaseball` |
| `baseball.prop.hotdog` | prop | `sources/baseball_fancam_fresh/src/Props.ts` — `makeHotDog` |
| `baseball.look` | lighting | `sources/baseball_fancam_fresh/src/Look.ts` — `createLook` |
| `baseball.camera` | camera | `sources/baseball_fancam_fresh/src/Story.ts` — `cameraAt` |
| `baseball.actions` | action-timeline | `sources/baseball_fancam_fresh/src/Scene.tsx` — `function Layer` |
| `max.post` | postprocessing | `sources/max_wall_short/src/Post.tsx` — `export function Post` |
| `baseball.post` | postprocessing | `sources/baseball_fancam_fresh/src/Post.tsx` — `export function Post` |

## Boundaries
- Keep each project’s vendor modules, helper imports and lockfile together; the two adapters are intentionally not identical.
- Internal factories in `Worlds.ts` and shot choreography in `Scene.tsx` still need extraction in a **new working copy** for independent reuse.
- No node_modules, caches, generated bundles, huge videos, WAV analysis files, private reference images, transfer helpers, credentials or Git metadata are packaged.
- Existing proof stills are references only. A shot without a saved still is marked `null`; it is not falsely presented as visually verified.
- Future new scenes are not saved automatically by this one-time archive. Repeat this explicit snapshot process when you want another version.
