# Fan Cam remake: word-synced editorial/camera handoff

**Authoritative timing:** existing unsped narration,30 fps,2253 frames/75.1 s. Major28-shot boundaries retained. Camera refinements and acting beats are inside these boundaries, not changes to narration. JSON companion `editorial_cues.json` contains exact word timings and the plan for all28-shots.

**Current picture lock for native batch:** `Story.ts` SHA-256 `56781cfb35872d2473eea171e779c28076ee5ce702729a0a7a184dcd3847a908`. Final camera uses a real diagonal stadium view from (7.799445, 3.198, 4.960133) toward (.669445, 1.95, −.387867), FOV 46. This supersedes the first diagnostic frontal/deep-focus composition, which was correctly rejected as visually flat.

**Implemented:** `src/Story.ts` ports the actual repository `run`, `glide`, `pushK`, `dolly`, `zoom`, `rolled`, impact kick, DOF and focus machinery. It retains required original exports, and adds `CAMS`, `camAt`, `keyEnd`, `dofAt`, `focusAt`, `actorBeatAt`, `ACTION_TIMES`, `PROP_ANCHORS`. Baseball camera/beat coordinates are new adaptations, not an independent pipeline. MIT notice preserved through vendor license.

## Editorial rule

Show **anticipation → action → consequence**, not a long uniform drift. Differentiate the energetic crowd from the sudden discomfort. Most reframes use18–24 frames symmetric repo glides, big composition changes cut on a meaningful word, and quiet pushes use0.15–0.18%/frame. Moving the camera is not a substitute for readable acting. The two faces remain sharp together during recognition; no impact shake on the joke. The narrated “ten whole seconds” remains the existing3.5s editorial beat, without ten seconds of added dead air.

## Approved-size proof: 1162–1461 inclusive

300 frames,10 seconds,1080×1920,30 fps. Stop production after delivering this preview for user feedback.

| Frames | Narrative / acting | Camera / proof requirement |
|---|---|---|
|1162–1169|Employee face/shoulder near-left; anonymous seated man rear-right|High/down camera reveals the nearer employee face and rear shirt/seat while boss mouth/eyes remain above the upper edge|
|1170–1225|Chest-height wave; obliviously happy|Cut on “waving” to the anonymous LEFT hand, with the face outside the right edge. Quiet push, readable hand motion.|
|1226–1262|Hawaiian shirt; shirt word1238–1254|Wider patterned torso insert reveals the actual shirt silhouette; eyes and mouth stay above the crop|
|1263–1309|Giant beer; beer word1279–1296|Whole cup plus right-hand grip insert at approximately 72–78% of frame height; camera target world (1.70, 2.04, −1.395)|
|1310–1330|“My boss.” Face becomes readable1310; smile drains1313–1327; wave stops1317|Cut to familiar repo boss face;18f restrained roll, not shake|
|1331–1347|Recognition aftermath, beer settles|Allow audience to recognise him before the reverse|
|1348–1388|Both gaze toward each other1349–1359; eyes word1362|Three-quarter two-shot with actual repo cInf 12 and midpoint eye focus. Both eyes distinct and unobscured|
|1389–1412|Finger still high; shoulders freeze|Camera continuous from previous shot, then1406–1430 slight downward/open reframe|
|1413–1447|Finger descends before slowly1416, completes before dropped ends1449|Hand+foam move together; face reaction continues; seated feet/hip do not drift|
|1448–1461|Fourteen-frame readable aftermath|No premature cut; camera retains both faces and low finger|

## Rig contract

Actual repository bodyFront metrics from character owner: employee seated eyes 2.155 local; boss 2.178 local + row .66 = 2.838 world. Seated card z = .44, eye anchor z = .51, prop contact z = .505. Reaction root yaw is employee +1.05 rad and boss +.78 rad; midpoint focus is computed from the rotated eye anchors. Stadium roots: employee(0,0,0),boss(1.35,.66,−1.9).

- Beer is **RIGHT hand** local (.55, 1.40, .505),prop scale1.65. Cup center becomes world (1.685, 2.075, −1.395). Raising hand to1.72 puts cup into face and breaks the reveal; do not use previous provisional grip.
- Foam LEFT hand goes (−.58, 1.96, .505) → (−.58, .94, .505),driven by `employee.foamLower`.
- `actorBeatAt(frame)` is pure deterministic semantic data. Character owner maps channels to actual repository face/pose options. It does not change rig placement or invent a second animation system.
- `boss.seated` decreases only during stand1967–1986; `standAnticipate` supplies lean1955–1967. Root/feet stay fixed. Hand props are children of exact hand anchors.

## Other priority proofs

**Stadium675:** board center is(0,10.4,−18.2),not old aim(0,6.55,−9.8). Full board shot uses camera roughly(−2,10.5,18),fov44; board remains sharp. Screen lights635–642,then cut684 to crowd reacting on crowd685. Inspect the field establishing456 and seat foreground490 separately.

**Stand-up1957–1989:** establish seated chair contact before my boss1957–1971; anticipation1955–1967; deliberate rise1967–1986; settle1986–1997 before Great1998. Verify chair/table sightline and feet/hip contact in rendered scene; table geometry may require a side sightline so the action does not read as a disappearing lower body. Never simply switch seated flag at a shot boundary.

**Readability:** note stays readable1812–1880 before relief1881; final callback cuts to employee2223 ahead of Fan2226. Do not fade out or truncate before audio ends.

## Local static validation completed

- TypeScript compiler emitted no Story.ts errors. Final coordinated typecheck passes after world owner fixes.
- Evaluated every camera frame0–2252: all positions,aims,fov,blur,roll finite.
- Three.js projection audit, including actual character eye metrics: boss mouth/eyes outside crop1162–1309; identity centered1310; updated three-quarter camera and full rotated head/foam bounding rectangles were tested through frame 1388, retaining approximately 3% horizontal edge margin. Equalized view-axis eye depths support cInf 12 while keeping both faces sharp.
- This is a mathematical/source check, **not** rendered visual approval. Lead owns render and must verify cup size,normal-speed acting,character facing,seat contact,caption clearance and actual shader outcome.

## Handback

Story camera ownership remains with editorial agent until lead takes over. Do not overwrite via regenerated old timing formulas. Contact/lighting/world/render ownership remains with respective agents. No render was launched by editorial agent.

## V2 visual check and V3 corrections

The native V2 images establish that the diagonal reaction shot reads materially better than the frontal diagnostic: mutual pupil direction, clear foam-hand contact, actual tier depth, and soft backgrounds. V2 was not accepted unchanged: the beer insert was a near-full-frame tan rectangle, the shirt was overcropped, and the wave shot excluded the actual hand. V3 (hash above) fixes these with a wider shirt, pulled-back whole-cup shot, and a word-synced cut to the waving hand at 1170. The reaction frame is 2° wider and shifted 0.10 m screen-right to preserve the giant cup handle/grip. These are framing changes only, not slower timing. Lead must approve the fresh native samples and normal-speed motion before final preview delivery.

## World-forward seated-offset correction

After V3 framing, the character owner kept the .44 m seated card translation world-forward via inverse-root rotation, avoiding hips sliding into rotated armrests. The reaction focus now uses `root + yaw × (0, eyeY, .070) + (0, 0, .44)`. Cameras and aims moved by the corresponding eye-midpoint delta (−.345555, 0, +.174133), preserving framing. Prop hooks use .065 rather than .070. Initial shirt/beer/hand inserts use zero body yaw and are unchanged.

## First-eight-frame context improvement

At 1136–1169, camera (−.60, 3.30, 5.0) toward (.40, .90, −.70), FOV 32, now establishes the near-left employee face/shoulder and rear-right shirt/seat. Projection at framing start: employee eyes (−.25, .51), hair top .88, face left −.88; boss shirt (.75, .71), boss mouth/eyes y 1.07/1.17 outside the top edge. The existing 1170 hand cut remains. This avoids opening the preview on eight frames of isolated giant legs.

## Native V3 editorial review

Inspected native frames 1162, 1180, 1238, 1279, 1362, and 1449. First-frame employee/rear-boss context, readable shirt silhouette, whole mug, opposing head profiles, and changing facial response now communicate the sequence substantially better than the first diagnostic. Cleared editorial framing to proceed to the 300-frame normal-speed motion check, **not** final delivery approval. The lead is handling the remaining bounded beer-prop geometry issue and preserving open eyes throughout the eye-lock cue.

One non-blocking observation: frame 1180 has a large foreground employee forehead around the visible waving hand. An optional single-coordinate camera x change .30→.85 would remove this obstruction without changing timing; it was proposed to the lead but deliberately not applied after the requested picture freeze.

Source/camera ownership is handed back to the scene lead at hash `56781cfb35872d2473eea171e779c28076ee5ce702729a0a7a184dcd3847a908`. No editorial source changes or renders are in progress. Motion QA and the user-feedback hold remain with the lead/root team.
