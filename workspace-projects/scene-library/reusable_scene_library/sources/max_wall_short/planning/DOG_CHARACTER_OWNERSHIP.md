# Max / character performance ownership

Owner: `/root/design_max_performance`. Integration: `/root/build_max_story`.

Owned production files: `src/DogMax.ts`, `src/Characters.ts`.
Owned verification artifacts: `qa/test_max_contacts.cjs`, `qa/max-contact-tests.json`.
No files under `baseball_fancam_short` were changed. All approved source vendor helpers remain unchanged.

## Source reuse
Humans use the actual approved `bodyFront`, `headBlob`, face expression, `Pen`, `cardShade`, `fxContact`, and `fxShadow` pipeline. Added roles are palette/outfit/decor adapters only: narrator, girlfriend, harlan/Harlan, paramedic. Added costumes are casual, cardigan, medic; pajamas now give the narrator light cream socks. Legacy roles stay available for compatibility, not intended for this story. Fresh seeds: narrator17, girlfriend23, Harlan55, paramedics71/73.

Max is original canine artwork drawn using actual repo Pen, cardShade, fxContact, fxShadow. It is a four-pawed quadruped with canine hocks, broad pads, soft collar/tag, muzzle, dog nose, supple ears and a rooted tail. No human body or human hand geometry is used on Max.

## Coordinates and contact contract
Card local XY, front+Z. Default facing+1 has muzzle pointing+X; facing-1 mirrors artwork and all hooks. Root y=0 is paw floor. Approximate metrics: shoulder .78m; head top1.22m; bodylength1.38m; whole silhouette2.18m. The exact animated `head`, `muzzle`, `collar`, `pawFL`, `pawFR`, `pawBL`, `pawBR` hooks are authoritative. `frontPaw` aliases pawFL.

Max default muzzle approximately(+.89,.80,.055), collar(+.42,.67,.055). Scratch frontPaw is the leading outer paw edge at x+.91 and y~.59-.68; paw center lies .0984m inward from it, preventing the ellipse from penetrating the wall. Account for .01m drawn ink and actual inner wall face in scene placement. With rootx1.68, scratch edge2.59+ink touches wainscot face2.5975; plaster face is2.69, not the scratch target. The nose also intersects trim height, so barkrootx1.68 is recommended over1.70.

Human hands are drawn exactly on supplied XY targets; z is intentionally the card surface (.065m), never arbitrary floating prop depth. Convert collar world point to human root local before supplying the grip and align the character card plane in depth. Keep gentle collar movement small, with dog feet staying grounded.

## Dog actions
`makeMax(seed)` / `makeDog(seed)` returns rig.
`pose({time, action, phase?, facing?, energy?, ...})`:
- action: idle, alert, bark, howl, whine, scratch, sniff, walk, return, eat, happy.
- Scalar0..1 overrides: bark, howl, whine, scratch, sniff, eat, happy, walk.
- Other controls: earAlert, headTilt(radians), gaze, blink, tail, lean.
- Bark has phase-driven jaw opening, head recoil, asymmetric ear flutter, body compression; all four paws stay fixed.
- Howl raises muzzle/head; whine lowers ears/tail; sniff/eat lower nose toward a floor plate, with eat jaw cycles.
- Scratch raises near front paw only and follows the actual contact edge hook.
- Reward/happy loosens ears and tail.

For dog locomotion, pass `travel` equal to actual metres traveled by root, plus walk1. The stance span is .63 of a .62m stride; foot excursions are computed from that distance. The supporting foot cancels world translation exactly. Default inferred travel is time*.50; use explicit travel for shot continuity. The human walk/travel adapter calls unchanged bodyFront march/stroll, not the dog gait or new human art.

## Tests as of first integration
Run `node qa/test_max_contacts.cjs`. 990 dog frames across11 actions and90 human gait/contact frames pass. Idle/bark/howl/whine/sniff/eat/happy paws stay y0; scratch lifts exactly1paw; mirrored hooks match; anchors finite. Dog world-stance contact maxerror2.16e-16m; human grip XY maxerror4.97e-16m. Isolated strict TypeScript check passes.

These are numeric tests, **not visual approval**. Native1080 still/motion QA must verify dog silhouette, facial timing, pose-to-wall aim, scene depth contact, collar hand visibility, and human costume readability. Only lead coordinates rendering to prevent concurrent renders.

## Post-preview optional human performance adapters
After preview_v01 source freeze, added profileBody:true/+1/-1 calling the unchanged original bodySide. `travel` maps to native .86025m gait cycle; costume decor is clipped with the original Pen. Exact actual footStroke output is recorded in root.userData.footContacts. Added groundShadow:false for reclining/prone cards, plus named shadow meshes. All default canvas drawing operations match frozen preview hash; no opening behavior change. See qa/repo-profile-walk-tests.json and docs/fullfilm_performance_fixes.md.
