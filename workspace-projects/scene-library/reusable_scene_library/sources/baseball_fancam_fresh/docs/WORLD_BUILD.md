# New Fan Cam world: source and placement contract

The world in `src/Worlds.ts` is new baseball/room geometry. Its lighting and rendering are not substitutes for the repository system: world materials call `vendor/shade.ts` `twoTone()`, background fans call the actual `vendor/toon.ts` `bodyFront()` and `vendor/cardshade.ts` `cardShade()`, and painted surfaces use `vendor/paint.ts` (`planksHD`, `beamHD`, `stoneHD`, `roofHD`, `grassHD`, `cloudHD`, `ctex`, `rep`). The MIT notice remains in `third_party/claude-animated-shorts-LICENSE`. Private reference frames are not production assets and must not be included in the deliverable.

## Main placement contract

- Employee: `(0, 0, 0)`; boss: `(1.35, .66, -1.9)`.
- Kid: `(-2.7, .66, -1.9)`; grandma: `(4.05, .66, -1.9)`.
- Seat cushion top: `.78` above each row floor. Row rise `.66`, pitch `1.9`.
- Background cards retain original repository design space `600×1000`, soles at `975`. A `1.65×2.75` plane maps soles to its row floor; the seated hook fixes hips to `.78`.
- Row 0, column 1 has neither extra fan nor seat, keeping the boss reveal unobstructed. The reserved cast positions are excluded from the crowd, and row 2, column 1 is also kept clear.
- Sparse deterministic back-row gaps and seeded costume variants break the former uniform face grid. No unseeded randomness or generated external asset is used.
- The screen group is at `(0, 10.2, -18.2)`. Exports `root`, `board`, `screen`, `crowdUpdate`, `note`, `announce` remain unchanged.

## World layers

The playing field has a textured clay/grass diamond, raised bases, a pentagonal home plate, batting boxes, converging foul lines, and mound/rubber. Low-chroma warm glazing is applied to the original grass paint so the final grade does not turn the turf neon.

Seating tiers lead toward a painted masonry concourse with real recessed arches, piers, cornices, and pitched tiled canopies. Angled side wings add depth. Peripheral low stone/wood/metal rails stay outside the central hero sightline (`x ≤ -3.25` or `x ≥ 5.2`). A screen frame, pennants and light-bank geometry establish the stadium setting; no scene light was added or altered by this module.

Static geometry is normalized to non-indexed position/normal/UV attributes before merging by material, following the repository `Batch` pattern. This prevents incompatible `BoxGeometry`/`RoundedBoxGeometry`/cylinder/extrusion batches, reduces draw calls, and throws rather than silently dropping a failed batch.

## Validation

- TypeScript `tsc --noEmit` passed after architecture implementation and first-frame QA changes.
- First native still `outputs/first_native_1370.png` verified intact geometry, real cast shadows, and seat contact. It exposed the competing foreground crowd member and neon turf; those were corrected in source for the next proof.
- Camera, depth-of-field, lights, grading, main cast and props are owned by their respective modules, not this world file.

The source-fidelity check also confirmed byte-identical SHA-256 hashes against the inspected repository snapshot for `paint.ts`, `shade.ts`, and `cardshade.ts`. These are reused unchanged; only the new world invokes them with new geometry and world-surface parameters.

A restrained matte seat-enamel surface was added after first-frame review using the same `ctex` → `twoTone` material path: broad low-opacity brush drift, fine inset seams, slight underside shading, and sparse tiny lip wear. It adds material richness to the seat backs/cushions actually visible in the reaction shots without global grain or a glossy plastic/clearcoat shader.
