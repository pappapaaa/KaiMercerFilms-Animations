# Full-film performance/contact fixes

Owner: `/root/design_max_performance`. Scene owner: `/root/build_max_story`.
Do not treat this document as a visual pass: native sequential frames still required for each contact. No Scene edits were made by this owner. Opening sources remain frozen while the lead renders.

## Absolute contact geometry
- Ground actor root y=0. Actual floor surface is about y=-.02; the .01m drawn ink cushion is acceptable, not root bob.
- Narrator-side wall centerx2.8; **plaster nearface2.69**, wainscot face2.5975 belowy.77; trim nearface2.61 at y.765–.855.
- Dog barkrootx1.68; nose extends~.91m. Do not let a body-thrust increase rootx beyond1.68 at trim height. Animate shoulders/neck, not root penetration.
- Scratch `MAX_METRICS.scratchWallX=.91` is the actual leading paw edge (paw ellipse center is .0984m inward). At root1.68 its edge2.59 +~.01 ink reaches wainscot2.5975. Use scratch1 for exact contact; scratch.9 stops short because it blends toward the rest paw.
- Max's hooks update after `d.pose(dp)` and `root.updateMatrixWorld(true)`. They are definitive; approximate metrics are not attachment targets.
- Humans' exact drawn hand hooks are localz.065; their supplied target z is intentionally ignored. Dog collarhook is localz.055. With no root rotation, set humanrootz=dogrootz-.010-.44*seated for exact contact plane (the original seated adapter adds world+Z .44*seated).

## 1. Ear to wall / three thumps
Use **front head** rather than profile nose to signify ear contact:
```ts
n.root.position.set(2.14,0,-2.6);
np.headView=0; np.headTilt=6; np.lean=0;
np.expression='neutral'; np.gaze=[.2,0]; np.blink=.35;
np.handR=[.49,1.95,.065]; np.mouth=0;
```
Actual repo `blobPts(headBlob(14,118,0))`, rotated6degrees plus ink, has rightedge local+.542m: world2.682, just shy of plaster2.69. The hand dot center2.63+radius.049 also meets plaster without entering it. Root2.23 with tilt8 would penetrate about.095m. Ease into the contact then hold the root and wrist; listen through eye changes and an extremely small breath, not sliding against the wall.

## 2. Gentle collar guidance / withdrawal
**Keep Max facing+X toward the wall during the initial backstep.** This avoids a cut-induced180-degree head flip and makes the stubborn return legible. Never lift rooty or stretch the collar.

Suggested shot-space staging:
```ts
const pull=smooth(clamp((p-.18)/.60));
const distance=.58*pull;
d.root.position.set(1.68-distance,0,-2.6);
dp.facing=1; dp.action='walk';
dp.travel=-distance; // negative because he backs away while facing+X
// Use walk1 through moving portion, brief eased start/settle only.
dp.walk=(p>.16 && p<.82)?1:0;
dp.whine=.30; dp.happy=0; dp.earAlert=.35;
n.root.position.set(1.18-distance,0,-2.962); // compensates .44*.80 seat world+Z offset
np.seated=.80; np.lean=.24; np.expression='nervous';
```
This is a low bend/squat using the actual repo seated interpolation with feet still on the floor, not a rigid upright arm stretched1.5m. The drawing should show a **loose flat hand on the soft collar**, not a fist at the throat. Make right-hand contact only after the reach has visibly arrived.

Exact grip, with depth assertion:
```ts
d.pose(dp); n.root.updateMatrixWorld(true);
const collarWorld=d.collar.getWorldPosition(new THREE.Vector3());
const collarLocal=n.root.worldToLocal(collarWorld.clone());
np.handR=[collarLocal.x,collarLocal.y,.065];
n.pose(np);
const handWorld=n.handR.getWorldPosition(new THREE.Vector3());
const gripError=handWorld.distanceTo(collarWorld); // target <.015m
```
If the arm silhouette is still too long, move narratorrootx closer to Max; do not alter the dog collar or fake a second hand. The rootz relation above gives exact depth with zero yaw, including the original seated world+Z offset. With yaw, solve the plane before drawing; discarding targetz otherwise creates a hidden miss.

**Current Scene bug:** Max faces-1 while collar travel is positive and narrator remains far left. That changes which side the collar occupies and can overstretch the arm. It is not necessary to flip the dog to guide him back.

## 3. Release and return to the same wall
At the end of collar guidance dogroot is1.10 (1.68-.58), still facing+X. Release the narrator's hand over6–8frames before moving Max. Return from that exact location, not from current Scene's unrelated.95 or1.78:
```ts
const u=smooth(clamp((p-.14)/.70));
d.root.position.set(1.10+.58*u,0,-2.6);
dp.facing=1; dp.action='return'; dp.travel=.58*u;
dp.walk=(p>.12&&p<.86)?1:0;
dp.earAlert=1;
// Final root stops at1.68; then switch to alert, then bark.
```
No dog teleport in z. Narrator retracts hand toward [.55,1.15,.065], eyebrows lift once, then eyes follow Max. The return should precede the renewed bark by4–8frames. Keep at least one explicit beat with all paws settled.

For strict dog stance cancellation, `walk=1` while root translates and `travel` must equal signed root distance along facing+X. `walk=.6` shrinks stride by40% while the root still moves100%, producing slip. Blends are only for a short onset/settle, not the middle of travel.

## 4. Hallway travel
The actual repo `bodyFront` march/stroll is an **in-place/front-view** gait. Sideways translating it looks like skating. The approved repo also exports `bodySide`: it already has planted stance, IK knees, asymmetrical arms and a one-eye profile. The optional `profileBody` adapter (now implemented after preview freeze) must call this unchanged source rather than introduce new human art.

Implemented API:
```ts
np.profileBody=true; np.walk=1; np.travel=travel;
np.headView=1; np.expression='worried';
```
For `bodySide`, S=370*stride designunits and stance is half a cycle. Worldstride distance/cycle=2*S*.00375. Choose stride~.31 for a.86025m cycle and `phase=travel/.86025`. Actual side-gait stance then cancels root travel exactly. Keep phone hidden and do not supply exact handgrips during this unencumbered run. Return to bodyFront at the doorway on a motivated cut/settle.

Max uses `dp.travel=travel` independently (.62m canine cycle), which naturally prevents synchronized dog/human footsteps. Max should lead by.5–.9m, rather than trail while the narrator discovers the door first. End hallwayroot positions on the door side, not through the facade.

## 5. Door pounding and listening: real contact normal
Harlan's door faces+Z; the narrator approaches from hall+Z. With yaw0 the hand cannot extend toward-Z because all hand geometry stays on one card plane. Rotate the human card to make its horizontal axis reach into the door:
```ts
n.root.position.set(7.05,0,4.25);
n.root.rotation.y=-Math.PI/2;
np.headView=-1; np.gaze=[-1,0];
np.handL=[-.61,2.00,.065]; // exact world≈(6.985,2.00,3.64)
np.handR=[.40,1.20,.065];
```
Door panel/label front is aroundz3.63–3.64. Animate the left hand between localx-.50 (lift off) and-.61(contact), not oscillating through the panel. Give three irregular controlled knocks, then hold still and listen; no shakes over the distant answering tap. Recompute exact contact with the actual door leaf world matrix if it is partly open.

For911, switch back to a camera-readable3/4 card and use exact rightHand attachment. Hold phone near the actual ear, not floating in front of the face. Keep screen911 visible briefly, then prioritize narrator's listening face.

## 6. Fallen84-year-old Harlan: safe, readable prone pose
**Current Scene wrong:** root(4.4,.2,-2.7), rotationZ=-pi/2 sends the head towardx~6.9 into the vanity and puts half the card below the floor.

Recommended actual repo-card placement:
```ts
h.root.scale.setScalar(.82);
h.root.rotation.set(0,0,Math.PI/2);
h.root.position.set(6.35,.43,-2.62);
hp.expression='pained'; hp.blink=.35;
hp.handR=[-.28,1.24,.065];
hp.handL=[-.35,1.80,.065];
hp.lean=.02; hp.headTilt=-2; hp.groundShadow=false;
```
This puts the head aroundx4.3 and feetx6.35, within clear floor, away from the vanity atx7.06. The rotated adult side extent is~.40m afterscale, leaving the lower face/shoulder about.03m above tiles. Ensure render confirms no body part enters floor or tub.

Rotating a characterroot by90deg also rotates its child floor shadows upright. Hide them with the optional groundShadow flag, and place a separate **horizontal** repo `fxContact` plane under the torso/head: center(4.95,.025,-2.60), width2.35, depth.78. Use the existing repo blobMaterial, not a new dark opaque oval. No bloody injury, broken limbs, violent collapse, pulsing wound effects, or theatrical shaking. Small breathing only; he is alive and weak.

Unreachable phone can lie at(5.87,.08,-2.56), screenup; right-handworld is around(5.33,.20,-2.57), leaving~.54m horizontal gap. Do not attach it to the hand. The backstory should read as unable to reach his phone, not unconscious permanent injury.

## 7. Paramedic support
One medic kneels near the head/shoulder at(4.05,0,-1.96), the other prepares by(5.75,0,-1.85), leaving Harlan's face visible to camera from+Z. Use real repo seated interpolation on the kneeling medic (seated.8–1), not a torso sunken belowfloor. A supporting hand may rest near Harlan's shoulder after converting worldtarget into mediclocal; check card-depth alignment explicitly. If exact skin contact requires an edge-on unreadable card, use a clear near-contact gesture rather than fake a floating hand. No neck manipulation or medical procedures are needed; the visual story is rescue arrival, reassurance, then a gentle assessment.

A hard-cut to medic upright for the warning line is fine. Give the narrator shock→relief, not simultaneous grins during emergency care.

## 8. Steak: actual muzzle/plate contact
**Current Scene wrong:** dogroot(1.1,0,-2.0) while plate is at(.55,.08,-.22), almost2m apart. Max's eat pose has muzzlelocal≈(.692,.196,.055).

Either move the plate to the dog or dog to plate, not both independently. For the existing plate:
```ts
d.root.position.set(-.142,0,-.275); // nose≈(.55,.196,-.22)
dp.action='eat'; dp.eat=1; dp.happy=.7; dp.facing=1;
```
Plate has food atworldy~.20–.28; the muzzle reaches the food surface while the dog remains grounded. Verify nose versus meat, not just center versus center. An alternative is put the plate at(1.792,.08,-1.945) while keeping the existing dogroot. Set narratorroot away from the muzzle and eyes toward plate; hold a relieved smile and small loose tail wag, not a human chewing pose.

## 9. Sunday callback
Do not place Harlan inside the solid sharedwall or show him through it without a motivated reverse-shot/cutaway. Prefer: warm apartment angle, two visible small wall knocks from an already established reverse side; cut back to Max alert→one bark, narrator smiles. Maintain wall geography and Max's floorcontact. If Harlan is visiting inside narrator's apartment, establish an open door/newposition first rather than silently teleporting him to x3.65 beyond an opaque wall.

## Required pixel/motion checks
Freeze sources and render sequential8–15frame contact windows around: collar firsttouch, release, firstreturn footfall, scratch fullreach, last hallway footfall, doorimpact, proneHarlan reveal, medic handapproach, steak firstbite. Check source hash matched each render. Strict isolated TS and numeric hook tests are necessary but do not replace these actualpixels.

## 10. Girlfriend actually rolls over on the bed

Use the original bodyFront card laid face-up, not a standing/seated card with only a head tilt. Bed quilt top is~1.055; pillow top~1.135. Initial feet towardbedfoot, head towardheadboard:
```ts
const roll=.04+.48*smooth(p);
g.root.scale.setScalar(.96);
g.root.rotation.set(-Math.PI/2,roll,0);
// Roll about the RIGHT contact edge so the opposite side lifts, not through mattress.
const halfWidth=.49*.96;
g.root.position.set(-2.91-halfWidth*Math.cos(roll),
  1.08+halfWidth*Math.sin(roll), -1.42);
gp.seated=0; gp.groundShadow=false;
gp.expression='pained'; gp.blink=p<.2?1:.3;
gp.headView=0; gp.headTilt=0;
gp.handL=[-.28,1.75,.065]; gp.handR=[.28,1.68,.065];
```
Atstart the head is nearz-3.74 and the crownnear-4.18, onthepillow, with feetz-1.42. +Ylocalroll tilts her face towardnarrator(+Xworld) while preserving the rightedge bed contact. No floor shadow follows her onto the bedding. The slight bodyrotation is the rollover; eyesopening and tired expression provide the reaction.

Camera contract: use a sufficiently high3/4 bed view, e.gpos(-.7,4.9,-.1), aim(-3.3,1.17,-2.9), fov40. A low hallwayview makes the horizontal card almostedge-on and obscures the face. Keep the whole face and at leastshoulders/onebentarm visible.

Cut, do not morph, to her seated-on-bededge scolding shot. The actual helper seatedbodybottom is .79+rootY, and its card movesworld+Z .44. To sit atquilt~1.055, use rootY~.265 and choose rootZ so the drawn card lands atbededge. Example root(-2.55,.265,-2.38), seated1 gives drawnz-1.94; this reads as bedinterior rather than frontedge. Better side-edge camera can show her perched atx-2.1 with feetbelow mattress. Do not claim floorfeet contact atrootY.265: feet then hang abovefloor, which is correct for sitting on this high bed. Use an editorial framing that shows the supported seat/pillow, not floating legs.

## Implementation/test update
`CharacterPose.profileBody` accepts true/+1/-1; `walk` activates nativebodySide; `travel` is metres. `groundShadow:false` suppresses named `Human contact shadow` / `Human directional floor shadow`. `qa/test_repo_profile_walk.cjs` intercepts real sourcePen.footStroke output:624stance samples, maxworldslip3.61e-16m, solesy-.0022125m (ink allowance). Default20pose canvasoperation hash matches frozenpreview exactly. Pixel verification of profilewalk and recliningbed remains required.

## 11. Broadside urgent body-to-wall bump (bounded staging)
A head-first profile atrootx1.68 cannot put the dog's whole shoulder/flank against the wall; the head is the leading geometry. Do not stretch the rig's chest through its neck. Use a motivated cut to a broadside pose parallel to the shared wall:
```ts
d.root.rotation.y=-Math.PI/2; // body runs alongworldZ; cardfrontnormal-X
const u=clamp(local/ (8/30));
d.root.position.set(2.54+.045*smooth(u), .045*4*u*(1-u), -2.55);
dp.action='howl'; dp.howl=.6; dp.earAlert=1; dp.walk=0;
```
Only one tiny lateralhop,8frames,4.5cm high/travel, then the dog lands and stays planted at(2.585,0,-2.55). Roottranslation occurs while paws are briefly airborne, not sliding onfloor. The broad card is just beforewainscot2.5975; x2.65 would clip its entire lowerbody. Camera pos(-1.2,1.8,-.4), aim(2.58,.72,-2.55), fov42 keepsbody/paws visible and camera faces the lit card. One restrained thud atlanding, then heldbody/alerthead; no repeated violent blows. Recheck adjacentcut geography so the dog doesn't appear to teleport acrossroom.

## Final stable movement options (15:35 UTC)
- `CharacterPose.profileStride` is the **original bodySide stride parameter**. Default .31 keeps a .86025 m cycle. For the 7.45 m / 1.93 s hallway run, set 1.0 to use a 2.775 m cycle and avoid excessively rapid footfalls.
- `MaxPose.strideLength` is the dog's full stride distance in metres. Default .62 preserves all existing actions. Hallway run may use 1.0; legs keep the same canine construction, with stance excursion derived from distance.
- Both options were tested at default and run values. The human test measures 1,248 actual-source stance samples (maximum world slip 7.8e-16 m); the dog test maximum is 3.2e-16 m.
- Default human **and dog** Canvas operation traces match the frozen opening exactly. No opening visual changes. Production sources are locked pending the lead's native pixel batch.
