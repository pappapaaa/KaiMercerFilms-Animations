# Independent skill forward test

Request: "Use this kit to make a new short scene where a worried courier notices a small notebook on a desk. Keep the face graphic and the body slightly dimensional."

- Story: original fictional silent moment; no factual claim or narration.
- Treatment: graphic conversation, 0.12 body depth, matte drawn face.
- Composition: 1440 × 2560, 24 fps, 48 frames (2 seconds).
- Purpose: exercise skill-to-code reuse, a new prop, a new set, new framing and a worried performance. Three stills are the requested test output, not a finished film.
- Owned files: this folder only. No shared module is changed.

| Asset | Scale / action | Implementation |
|---|---|---|
| Courier | Existing 2.4-unit actor; worry and a down-right eye shift | Shared `makeCharacter`, `worried`, `hold`, `lean`, `headTurn` |
| Notebook | New .56 × .09 × .74-unit prop; remains on desk | Original layered covers/pages/spine/label/ribbon in `Notebook.ts` |
| Desk | New 1.38-wide top at y=.88 | Shared `outlinedBox` construction, new dimensions and placement |
| Room | New muted writing-desk set; center-left actor, desk at right foreground | Shared static painted panels, new palette/geography |

| Frames [a,b) | Performance | Camera / prop |
|---|---|---|
| 0–6 | Worried, eyes slightly left, arms resting | Locked slightly elevated portrait; notebook stationary |
| 6–14 | Eyes shift down-right on twos; slight head turn and lean | Camera remains locked; top cover visible |
| 14–18 | Notice holds | Same geography |
| 18–48 | Concerned hands fold inward in the rig's hold gesture; worried face remains | Readable held result, no unnecessary camera drift |

No pickup is requested. The notebook stays on the desk and the actor does not pretend to grip it. No audio/thumbnail/master was requested for this bounded forward test.
