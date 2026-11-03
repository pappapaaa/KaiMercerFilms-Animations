# Fresh Max camera pass

Authored 2026-11-02 for the user's instruction to make new frames. This replaces every archived camera setup. The supplied narration, 42 action boundaries, 2,887-frame duration, world coordinates, and existing exported Story API remain intact. Repository easing math is retained; rendered footage and previous approved camera keys are not reused.

## Editorial design

The opening now establishes the exhausted owner seated on the bed and the dog at the shared wall together, before descending to Max. The action alternates low canine viewpoints with human reactions and motivated contact inserts. Morning phone shots are diagonal and elevated. The hallway run is tracked from ahead of the narrator rather than behind. Rescue is a low corridor wide, a foyer-level dog insert, and an inside-bathroom reveal from the head end. The warning starts with both people and moves onto the narrator's reaction. Gratitude returns to Max's eye level. Sunday uses a new reverse from Harlan's side and returns to a wider warm room before the final dog close.

## Camera continuity and floorplan

- Shots 11-12 share the low collar axis, then pull back for the release and wall return.
- Shots 14-15 retain the overhead phone position through the save action, then withdraw to the owner.
- Shots 16-17 descend from the second clock insert to Max and maintain one quiet dog frame.
- Shots 21-22 hold one diagonal ear/hand contact through all three thumps.
- Shots 34-35 preserve the medic/narrator axis, then favor the narrator's reaction.
- Shots 38-40 approach Harlan's two knocks from the correct neighbor side.
- Bedroom cameras stay left of the shared wall; the open-front cutaway supports positive-Z wide positions. The bed-roll camera is high because the reclining card faces upward.
- Interior bathroom cameras all use z<0 and x>2.8. The bathroom scratching insert stays outside, to the dog's +X-facing card side. Door-knock cameras view the narrator's -X-facing card from the left side of the hall.
- Punches are limited to the wall and forced-door impacts; no shake over medical or realization beats.

## New diagnostic frames

One per timed beat: `18,125,184,253,336,410,512,604,689,755,839,920,994,1071,1147,1256,1345,1393,1440,1497,1559,1615,1691,1760,1814,1871,1927,1970,2027,2089,2158,2213,2279,2352,2424,2520,2621,2700,2734,2778,2813,2878`.

Additional camera endpoints: `0,32,64,78,86,110,111,1193,1203,1238,1286,1287,1312,1365,1468,1472,1476,1480,1786,1843,2110,2138,2174,2452,2470,2502,2592,2605,2616,2648,2675,2716,2787,2797,2822,2839,2840,2854,2878,2886`.

Inspect complete silhouettes, lamp/bed foreground occlusion, legible phone surfaces, ear/paw/hand contact, the +X hallway travel and -Z rescue entry, the first Harlan reveal, and no wall penetration. Source design is not a pixel-verification pass: native frames and encoded movement still require review.

## Validation

`npm run typecheck` passed after this camera replacement. All shot IDs are explicitly assigned. Timing was left unchanged. No final render was started by the camera owner.

## First fresh-frame review and bounded corrections

Reviewed all 42 new midpoint PNGs in `outputs/fresh-stills` at 540 × 960 diagnostic resolution. The room, close reactions, bed roll, hallway run, bathroom reveal, and closing two-shot are newly rendered and readable. Corrected the girlfriend's left-frame crop in shot 10, Max's collar-shot nose margin, and phone insert borders. Moved listening and Sunday views toward the cards' front hemisphere so faces retain natural width. Lowered the door-pounding camera, widened door reactions and the medical two-shot, and recomposed the unreachable-phone insert from the +Z/head side to avoid showing Harlan edge-on.

Rerendered proof frames: `839,920,1147,1240,1615,1692,1871,1927,2027,2352,2425,2621,2734,2778,2797,2822`. The narrator's quiet/howl mark moved left; `1394,1441` verify his face no longer clips into those shots. Main reviewed the corrected frames plus opening/closing endpoints and phone updates at `1203,2606`. Frames `64,2425` were additionally rendered at native 1440 × 2560. The phone insert intentionally crops Harlan after the preceding wide reveal to emphasize the distance to his phone.
