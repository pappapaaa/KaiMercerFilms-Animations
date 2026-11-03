# Actual repository character integration

Repository source: `mromidev/claude-animated-shorts`, commit `e3b817b6afc6cd413466d43f11ba31209e034bbf`, MIT. Notice retained in `third_party/claude-animated-shorts-LICENSE`.

## Reuse, not a substitute design

`Characters.ts` invokes actual `vendor/toon.ts` `bodyFront`, `headBlob`, its built-in face expressions, original stroke/foot/bean-torso drawing, and `vendor/cardshade.ts` `cardShade`/`blobMaterial`. Repo skin color, plum ink, variable line width, shape seeds and proportions remain. `fxContact`, `fxShadow` and original seeded four-frame blink cadence are reused. The repo's day preset uses no real character shadow casting; cards receive light/shadow, with multiply contact/tail shadows underneath.

Changes to toon.ts are narrowly tagged “Fan Cam”: optional continuous `seated`/`seatedHipDesignY`; optional hand endpoints using the original curved stroke and ink-dot hand rendering; a callback exposing drawn head/hip/hands; a torso-clipped costume decorator. No existing silhouette, head formula, facial library or ink/shading function was replaced.

Baseball adaptations: existing hair/cap/stout/kid Outfit fields supply employee/boss/kid/grandma/fan roles; wardrobe colors/pinstripes/office tie/Hawaiian pattern; original local phone, beer, hot dog, foam finger and note props. No old animation cast implementation or reference-frame pixels are used.

## Contract

`makeCharacter(role, costume, seed)` returns root, head, leftHand/rightHand, handL/handR aliases, hip, pose, dispose. Root is floor between feet; +Z faces forward. Pose resets the entire card deterministically and does not modify root placement.

Pose: `{time,seated,expression,mouth,gaze:[x,y],headYaw,lean,handL:[x,y,z],handR:[x,y,z],blink?,light?}`.

- `seated`: 0–1; final seated body bottom Y=.79 rests above seat top .78. Actual anatomical hip is approximately .891 (the repo torso extends .12 head-heights below that point). Scale is .00375 world units per source design unit, retaining source proportions, roughly 2.9m standing adults.
- After native QA, seed1 employee seated eyes local Y=2.155; seed2 stout boss Y=2.178. At boss root Y=.66 the eyes are world Y=2.838 before any root rotation. `head.position` is actual drawn eye/head center, not an estimated proxy.
- Face features/eyes are the actual repo library. Mouth is approximately .177m below eyes for adults. `gaze.x` and `headYaw` map to original look/facing controls. No external facial skeleton is invented.
- `handL/R` x/y are exact local targets. Since characters are the repo's flat cards, the prop anchor z is fixed .065 in front of the card; arbitrary target z is deliberately not represented as a falsely detached arm. Native QA required a seated-card local Z offset .44 to clear the chair's .425 front edge, so seated grips are local Z=.505 and head anchor Z=.510. Attach grip-root props directly to the returned hand anchors. Root yaw rotates those offsets; use actual world anchors for camera focus.
- For coherent painted shadow direction, light is a canvas angle; same repo light2D calculation: `round(atan2(-sun.y, sun.dot(cameraRight))/(PI/4))*(PI/4)`. Day default −PI/4 matches upper-right light. All cards/effects use NOINK layer3.
- Whole-root position/rotation belongs to the scene owner. Character cards are not auto-rotated inside pose.

## Validation performed

- Actual Three0.187 Lambert outgoing-light line and directional shadow shader strings match the template patches exactly.
- Full project `tsc --noEmit` clean after character/prop and integration updates at 13:22 UTC.
- No account connections or uploads used. Official pinned npm dependencies installed by lead with install scripts disabled.
- Native rendered QA remains required for feet/seat/hand contact, costume readability, gaze, lighting and clipping. No claim of visual success is made solely from typechecks.

## Native QA corrections (13:41 UTC)

Reviewed first_native_1370.png and V2 native frames 1362, 1279, 1449. First pass revealed hidden gold beer (opaque outer ink cylinder), hot dog reading as two buns, torso intersecting the chair and a blink hiding the critical eye-lock. Corrections:

- Beer uses back-face-only ink silhouette shells, visible gold body and the actual repo twoTone Lambert lighting. Rim/handle no longer occlude the liquid/body.
- Hot dog is one sausage in one bun with a thin paper tray, raised above its grip so the actual ink-dot hand is visible.
- Seated body bottom now rests on the cushion; the forward card offset reveals feet/legs; foot spread reduced without replacing original curved strokes.
- Original eye() look amplitude is stronger for story gaze; lock beats suppress blinks. No replacement face artwork was introduced.

V2 two-shots show those changes successfully. f1279 beer insert still has an extreme camera crop, turning the prop into a tan rectangle with foam/handle clipped; the camera owner was asked to fit the complete beer and grip before production. This is a framing blocker, not a claim that the preview is accepted.

## Current gate

Produce and visually verify the requested native 1080×1920/30fps ten-second proof; pause full-film production for user feedback after delivery.
