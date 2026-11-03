# Full proof v1 — character/contact review

Reviewed native 1080×1920 stills in `outputs/full_proof_v1-f####.png`. This is a still/contact review, not an encoded full-motion approval. No production source edits were made during the locked batch.

## Blocking fixes, sent to lead
1. **689, girlfriend rollover:** pillow intersects the right side of face/hair. Preferred bounded fix: root rotation X `-pi/2 + .04`, retaining the roll-edge pivot. Raises the head ~.092 m with soles unchanged and torso only ~.05 m higher. Recheck 656/689/723.
2. **1475/1476/1497, body-wall bump:** vertical batten passes through the torso; wall ink crosses torso and legs. Batten near face is x2.565, not the broad panel's x2.5975. Original ink's behind-character suppression requires roughly .015×depth+.03 m separation. Put the illustrated front surface at x~2.42–2.43 (implied ~.26 m body thickness places far shoulder at wall), with hop start/end ~2.385→2.43. Do not change the immutable vendor shader to fix a staging problem.
3. **2213, bathroom scratch:** corrected door target reads, but nose/paw are cut flush by closed panel. Increase dog root Z by .03–.05 m, then compensate paw reach separately if needed; preserve closed door in scratch shot and open on reveal cut.
4. **2279, Harlan reveal:** foreground medic hides nearly all of Harlan; only a face sliver remains. Keep medics out of this explanatory reveal or move them outside the camera-to-Harlan sightline.
5. **2352, unreachable-phone insert:** entire image is medic torso. Neither Harlan nor phone is visible. Hide/reposition medics for this insert; show actual hand-to-phone gap.
6. **2503 (and reviewer-reported2424), warning:** open door blocks medic speaker. Narrator reaction is clear, but use a reverse shot or relocate medic for the spoken warning.

## Readability polish / recommended
- **907/920/938, collar grip:** body motion is gentle and attachment math is correct, but the hand dot is hidden behind Max's ear/neck in every sample. Actual human card is .01 m behind dog card because hook Z offsets differ. A small plum ink-dot contact accent on the existing hand hook, in front of visible collar, would make the grip legible without fingers, collar deformation, or moving the entire human card ahead of the dog's legs.
- **496 and collar shots, worried tail:** crossed polyline control points create an acute zigzag. Optional bounded smooth curve only when whine>.25 preserves the opening bark artwork.
- Reviewer reports clipped draft/save/delete phone screens at1071/1147/1239/2601. Suggested same-rig fix: yaw narrator toward insert camera (~-.48 rad), phone local yaw near0. This keeps phone on its actual hand rather than floating it forward.

## Passed in these sampled native stills
- **410/604:** clear repo-style narrator facial expression and gesture.
- **496:** one canine forepaw raised to wall; three supporting paws grounded; no human-hand dog anatomy.
- **755:** girlfriend's scolding face and hand gesture read.
- **960/994/1018:** release/return progression is clear; Max goes back toward the same wall.
- **1814:** original bodySide stride and light socks read correctly; body does not look like a front-facing sliding card.
- **1858/1871:** hand-at-door knock composition and target read.
- **2682:** muzzle visibly meets steak; eating posture and reward read.
- **2813/2863:** Harlan's white hair/moustache/cardigan and knock, then Max's bark-back, read clearly in warmer Sunday lighting.

Opening encoded-motion review remains in `character_performance_status.md`. Full-film contacts require corrected stills and representative sequential-frame checks before final approval.
