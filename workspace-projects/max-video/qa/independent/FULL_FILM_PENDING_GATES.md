# Full-film pending gates (read-only review during preview render)

2026-11-02 15:13UTC. These are source-level blockers/risks outside0–299. **Do not modify the frozen approved-preview source to fix these.** Update15:21UTC: root confirmed explicit user authorization for the full render; there is no remaining user-feedback gate. These source/pixel QA gates still apply. Source is provisional; none below is a claim that a final full-film clip was viewed.

1. **Steak contact:** `FLOORPLAN.steak=(.55,.08,-.22)` while scene eatdogroot=(1.1,0,-2.0), local lowered muzzle≈(.692,.196,.055), so muzzleworld≈(1.792,.196,-1.945). Planar gap>2m from plate. Need plate placement from actual muzzle or dog mark from actual plate, and confirm camera frames reward.
2. **Sunday side switch:** `buildSundayWorld` provides `setSide('narrator'|'harlan')` and defaults narrator. Current `Scene` does not call setSide. Harlan reverse shots must activate correct room/wall side and hide narrator-side set, then switch back for Max response.
3. **Exactly two knocks:** current hand y uses sin(local*10) over53frames (~1.77s), about2.8 cycles, not exactlytwo deliberate wall-contact strikes. Need two timestamped reach/contact/recover pulses aligned with phrase and a matching Max response.
4. **Collar/return gait:** collar dp.walk=.6 scales local compensation while root moves full .62m; z also moves .3m with no matching local-axis gait. Drag can intentionally have resistance, but must not be represented as planted non-slipping walk. Return mark still1.78 rather than revised safe barkroot; check wall muzzle/trim penetration when it arrives.
5. **Rescue entry:** dog moves mainly−Z while card front/muzzle/gait is+X; need yaw/profile/world travel agreement, not sideways skating. Paramedics also require planted entry motion or clear elision.
6. **Bathroom cameras:** establishingcam corrected to inside room. Latercam34/35 remain outside(z1.8/2.0) and aim towardx4.9/5.0,z−2.3; check rays against actual doorwayx5.84..7.76 atz0, not a full wall. Unreachable-phone insertcam33 atx5.4,z.2 is also outside doorway horizontal bound; must validate pixels.
7. **Fallen Harlan:** rotating an upright card−π/2 aroundroot atworldy.2 can put head/torso volume below floor. Need ground-plane bounds/contact, non-graphic readable breathing pose, not only object root metadata.
8. **Pounding/frontdoor:** verify actual hand-to-door-plane contact, then door swing pivots through wall safely. The current handR has small y sine but door is a z-plane; numerical contact should include worldz.

Remaining full-film QA includes narrative emotional turn, coherent hallway→bath route, no pre-discovery reveal, rescue warning pacing, steak/gratitude legibility and final Sunday payoff. These need representative rendered samples/temporal review after source completion and authorization, not code claims.

Update15:24UTC: main source now contains moved steak coordinates, Sunday setSide, two timestamped knocks, revised prone placement/horizontal shadow and profile gait/contact adapters. Their numeric/source repairs still require pixels. Shot33 front-wall occlusion risk was specifically sent to lead.
