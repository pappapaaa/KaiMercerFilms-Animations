# Renderer and authoring contracts

The source is intentionally split into replaceable modules. The demo is one integration of those modules, not a universal script-to-film generator. Keep a new episode's content in its own composition and shot plan; improve a shared primitive only when the new behavior is reusable.

## Scene coordinates and rendering

Three.js coordinates are **Y up**, ground at **y=0**, actor front facing **+Z**, and camera generally in **+Z** looking back toward the room. The 2.4-unit courier stands near z=0. `World.ts` uses rear wall z=-1.5 and a clear central acting zone. These are implementation units; they are not measurements of the original creator's scene.

The proof renders 1440×2560 at 24 fps. `examples/Root.tsx` registers the two compositions. `Bridge.tsx` takes `bodyDepth?: number` and `audio?: string`; audio is a path inside Remotion's `public` directory. Its `ThreeCanvas` uses the active composition dimensions, avoiding a baked 1080-sized canvas inside a 2K output.

Keep new episode source under `episodes/<name>/` so the root typecheck includes it. For an isolated experiment under an ignored output directory, create a local tsconfig extending the root and including that experiment, then run `npx tsc --noEmit -p outputs/<experiment>/tsconfig.json`. The root typecheck does not automatically discover arbitrary files outside its include patterns. A separate entry can be rendered using `ENTRY=episodes/<name>/index.tsx`, `COMP=<composition-id>` and a distinct `STILLS_DIR`; register that entry with Remotion's `registerRoot`.

`gl.outputColorSpace` is sRGB and tone mapping is disabled. Graphic front surfaces retain authored colors. Side and prop materials can receive light. Changing color management changes the visible palette; review rendered evidence before compensating with arbitrary material colors.

## Module ownership

| Module | Responsibility | Change for a new story |
|---|---|---|
| `Design.ts` | Palette families, ink ratios, lighting presets, staging scale | New location/time-of-day palette; preserve the evidence/proposal distinction |
| `characterDrawing.ts` | Face texture, emotion drawings, tunic details and original palette | New identity, clothing and expressions |
| `Character.ts` | Articulated shallow geometry, pose application, contact shadow, attachment anchors | Required body design and meaningful new poses |
| `Props.ts` | Reusable outlined 3D objects | Script-specific readable objects with useful pivots |
| `Paint.ts` | Deterministic wall/floor/sky textures | New material motifs with subdued visual density |
| `World.ts` | Room geometry, background placement and cleanup | New locations and foreground layers |
| `Story.ts` | Frame rate, dimensions, duration, shot intervals and cues | New episode timing and shot IDs |
| `Motion.ts` | Pure easing, interval, exposure, impulse, gait and mouth helpers | Reusable motion math only |
| `Camera.ts` | Camera pose at an absolute frame | New framing/cuts/reveals, not just old shots retimed |
| `Bridge.tsx` | Object creation, per-frame acting and scene assembly | New episode orchestration; rename the component/file if useful |
| `Post.tsx` | Small optional atmosphere layer | Shot-motivated effects only |

## Timing

Use integer, zero-based output frames. Shot intervals are **start-inclusive, end-exclusive**: `{a:96,b:180}` displays frames 96–179. At 24 fps, seconds are `frame / 24`. FFmpeg source PTS belongs to the analysis archive; do not round the original study to a different delivery rate.

`shotAt(frame)` finds the containing interval. The fallback returns the final shot, so a new plan must validate that intervals cover the whole composition without gaps or overlaps. `DURATION` is a frame count, not the index of the last frame. The final displayed frame is `DURATION - 1`.

For narration, decode/measure its duration first and set at least `Math.ceil(seconds * FPS)` frames. A deliberate end hold extends picture, not speech speed. Keep audio cue frames and composition timing consistent. `templates/audio/timeline.json` is the example's shared audio/timing data; the code exports its FPS, duration and cues through `Story.ts`.

`poseFrame(frame,2)` samples a pose every second output frame. It should not quantize all independent clocks by accident. The demo intentionally steps its character entry and limb pose together; the small camera emphasis uses the output-frame clock. New episodes can choose other cadence per action.

## Character API

```ts
const actor = makeCharacter({
  bodyDepth: 0.12,
  holdFrames: 2,
  palette: {shirt: '#39878c'},
});
scene.add(actor.root);
actor.root.position.set(0, 0, 0);
actor.update({
  frame,
  mood: 'curious',
  gesture: 'point',
  talking: 0,
  walk: 0,
  gaze: [0.3, 0],
});
```

| Pose field | Meaning |
|---|---|
| `frame` | Absolute output frame; the rig samples it at its chosen exposure cadence |
| `mood` | `neutral`, `curious`, `happy`, `annoyed`, `surprised`, `worried` |
| `gesture` | `rest`, `point`, `wave`, `shrug`, `hold` |
| `talking` | 0–1 mouth-opening input; emotional face state remains separate |
| `gaze` | Two-component directional eye offset |
| `walk` | 0–1 walking amount |
| `phase` | Optional gait phase in radians, preferably derived from root travel |
| `bodyDepth` | Optional per-pose thickness, clamped to 0.025–0.36 |
| `holdFrames` | Optional pose exposure cadence override |
| `lean`, `headTurn` | Small authored body/head angles; inspect larger rotations |

`CHARACTER_METRICS` exposes head bounds, total height and stride. Pass `CHARACTER_METRICS.stride` explicitly into `walkPhase(travel,stride)` so travel and feet agree. A default mathematical gait is a starting point; review world-space foot contact when you change leg length, step length or camera angle.

`leftHand` and `rightHand` are attachment groups. Parent a held prop to the chosen anchor with a local grip offset, or query its world transform after updating the actor. During a handoff, preserve world transform when reparenting so the object does not jump. A gesture named `hold` does not automatically know the shape or center of mass of a new prop.

The rig uses explicit cap depth offsets at torso/sleeve/forearm/hand overlaps. Avoid placing two fill caps at the same z: the resulting dashed seam is z-fighting, not drawn ink. Change identity in `characterDrawing.ts` and geometry in `Character.ts`; do not solve every new character by recoloring the courier.

## Worlds and props

`makeWorld(preset)` returns `{root,palette,update,dispose}`. The current world's `update` is intentionally static; backgrounds do not need compulsory motion. The scene supplies lights from `LIGHTING[preset]`, so do not add duplicates inside every prop.

`makeParcel(palette)` creates a box of approximately 0.72×0.56×0.5 units centered on its own origin. Place it at y=0.28 to rest on the ground. The original tape and address shape are graphic details. `outlinedBox`, `lineBetween` and `makePlant` demonstrate editable construction patterns.

For a new prop:

1. List the story action it must support: hold, open, break, pour, press, roll or reveal.
2. Pick scale relative to actor hand/head, not arbitrary global numbers.
3. Put the pivot at the interaction point or document its offset.
4. Separate moving parts and collision/contact surfaces.
5. Keep a clean silhouette and reduce interior detail at small screen size.
6. Match ink and matte fill hierarchy, then render a close-up and in-hand view.

For a new set, sketch wall/floor/door geography in world coordinates before camera work. Keep the action space free, and add foreground framing only where it helps depth or a reveal. A new setting requires new geometry or painted surfaces; stretching the same room is not a finished scene design.

## Determinism and cleanup

Evaluate poses from frame numbers. Do not use `Math.random()`, wall-clock time, an accumulating `delta`, or a physics simulation that depends on previous render frames. Seed procedural textures. Rendering frame 132 alone must match frame 132 inside the film.

Create geometry and textures once per scene/preset, then update transforms/drawings as needed. Dispose geometries, materials, textures and lights on scene teardown. Do not dispose a shared material from one object while another still uses it. Avoid loading network assets during a frame render.

## Output and limitations

`render.mjs` bundles the entry, selects `COMP`, launches installed Chrome, and renders H.264/yuv420p/BT.709. Full render uses CRF17; preview uses half scale and CRF23. These are delivery choices. They do not measure the source's production pipeline.

The proof has no phoneme alignment, automated transcript-to-shots system, general IK solver or fully rotatable 3D face. Its helpers make new authoring easier but do not replace it. Add those capabilities only when a real episode needs them, and validate them in a representative rendered scene.
