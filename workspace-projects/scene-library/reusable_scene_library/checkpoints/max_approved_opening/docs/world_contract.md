# Max world / locked coordinate contract

`src/Worlds.ts` is a new, self-contained set module. It only imports the audited local repository `paint.ts` and `shade.ts`, uses the existing world-ink pipeline, and creates **no lights, shader-uniform overrides, or postprocessing**. Lead owns `Look.ts`. Original baseball project remains untouched.

## APIs
- `buildApartmentWorld('bedroom'|'hallway'|'bathroom'|'sunday')`
- `buildApartment('night'|'morning'|'sunday')`
- `buildHallway()`
- `buildHarlanApartment()`

Every result has `{root, wallContact, doorContact, bathroomContact, anchors, update(time)}`. `anchors` is the exported `FLOORPLAN`. Available optional references: apartment `clock`, `wallKnock` (initially hidden), `door`, `doorFrame` (initially hidden cinematic cutaway), `steak` (Sunday only visible), `dogBed`; hallway `door` / `harlanDoor` + `apartmentDoor`; bathroom `door` / `bathroomDoor` + `harlanDoor`, `fallenMark`. Phone/draft is **not duplicated**: lead owns handheld phone.

## Geography (all sets use global coordinates; no root translation)
- Narrator apartment x −5.5…2.8, z −5…3.5.
- Shared wall center x **2.8**, thickness .22, narrator-facing plaster x **2.69**. Bark focus z **−2.6**. Low wood dado tops at .85, leaving dog's head and narrator's ear on the actual plaster.
- Max root **(1.78,0,−2.6)**; +X-facing muzzle reaches x≈2.68, just shy of plaster. His mark is not the wall itself.
- Narrator starting mark **(.3,0,−2.6)**. Ear contact is **(2.685,2.35,−2.6)**, subject to character pose matching.
- Harlan apartment x 2.8…10.5. Bathroom occupies x **2.8…7.7**, z **−5…0**: exactly the other side of the bark wall. Fallen Harlan mark **(4.5,0,−2.6)**. No furniture in his body area (tub is z−4.0, vanity x7.06).
- Shared public hallway z **3.5…6.5**; apartment entrances face +Z. 4A door **(−1.3,0,3.5)**, 4B door **(7,0,3.5)**. Travel from 4A to 4B is +X along corridor, then through 4B toward −Z; bathroom entry is **(6.8,0,0)**.
- Main interior view is an **open-front cinematic cutaway**, not a fake hole between apartments. Its front door mesh is hidden to avoid camera occlusion; matching physical door and frame are shown in hallway. Main right/shared wall remains solid.

## Camera / staging
- Opening suggested camera (−3,3,5), aim (1.2,1.5,−2.6): real shared wall recedes on RIGHT; bed at left supplies near/mid depth; clock at (−1.31,1.56,−3.78) reads `3:00 AM`; warm practical is at (−1.27,2.30,−4.04), blue city window behind.
- Hall camera starts positive z looking toward doors. 4A and4B are on **same** side, not opposite sides.
- Bathroom camera must be **inside** doorway or use its opening: e.g (6.4,3.4,−.30) aimed (4.5,.8,−2.6). A camera at y2.8,z+2 aimed through x6.8 doorway may have wall occlusion; do not silently move the neighbor to another floorplan.
- Sunday steak plate (browned, non-graphic) at (.55,.08,−.22). Max mark (.55,0,−.55); people may use (−1.5,0,−.65), (1.25,0,−1.4).

## Style / performance
Walls: deterministic broad brushed plaster; wainscot bevel/panel geometry, cornices and piers; real window mullions/sill and curtains. Wood uses exact repo `beamHD`/`planksHD`. Set-specific cloth, tiles and illustrated pictures use repo `ctex`. All world surfaces use exact `twoTone`. Digital labels/picture/window planes only use unlit layer3 to preserve legibility and avoid double ink. Static geometry is merged by material; controls/referenced moving groups remain separate. Lamp shade has modest emissive albedo only, not an independent light. World updates currently no-op; doors and knock FX are controlled by lead.

## First native-pixel QA (opening_v1 stills)
Inspected `outputs/opening_v1-f0000.png`, `-f0086.png`, `-f0240.png` at native 1080×1920 on 2026-11-02. World plaster brushwork, dimensional trim, floor plank detail, shadow contacts and world ink all render. Main improvement requests sent to owners: night currently reads too brightly gold/daylit (Look owner); clock is cropped at both horizontal edges (camera owner); first-night narrator is cut off and room depth omitted (camera owner). No independent lighting or camera replacement was made here. Ground surface audit lowered rug/tile tops below the repository contact-shadow cards at y=.022 (rugs .003, tile .005, bathmat .0185). New geometry remains source-controlled only inside Max project.

## Deferred after opening-proof freeze: Sunday reverse-side proposal (not yet implemented)
Preferred API: `buildSundayWorld()` returns a root with **two mutually exclusive set groups**, narrator `buildApartment('sunday')` and neighbor `buildHarlanApartment()`, plus `setSide('narrator'|'harlan')`. Both retain identical global coordinates but only one group is visible, so shared-wall duplicates cannot z-fight or occlude the intended reverse shot. No lighting logic is added. Lead's existing Sunday `Look` lights both consistently.

- Shots 38–40 call `setSide('harlan')`, camera remains inside / through bathroom opening and Harlan stands at x3.65,z−2.6 on the actual neighbor side. He knocks against x2.91 (neighbor-facing plaster/cladding), direction −X. Existing bathroom is reused, not a new apartment layout. Hide narrator / Max in these shots or let the real wall occlude them.
- Shot 41 calls `setSide('narrator')`, same wall viewed from narrator side, Max faces +X and responds. Restore narrator / Max, hide Harlan. This preserves the matched geographic screen direction without pretending the wall is transparent.
- Keep `buildApartmentWorld('sunday')` as a thin entry point to this controller after approval, or let lead explicitly import `buildSundayWorld`.
- Steak reward shot 37: current plate anchor (.55,.08,−.22) does **not** match current Max eat root (1.1,0,−2). Align plate to the precise Max muzzle target, preferably move `env.steak.position` in Scene using the rig's eat/muzzle hook. Alternatively agree a fixed root plus plate pair; do not move the plate independently in world coordinates while claiming exact contact. Warm daylight apartment geometry is already supported by `buildApartment('morning')`.

No Sunday code or scene edits will be made until lead confirms the opening-proof source freeze.

V2 native still follow-through: `opening_v2-f0000`, `-f0042`, `-f0086`, `-f0240`, `-f0299` inspected. Cool 3AM architecture now reads clearly, floor is naturally brown rather than hot orange, clock fully readable, and first-night full pair/window depth fits. Remaining items belong to camera/pose owners: barking muzzle cut at right frame edge in f0/f42, possible face-wall clipping / unclear ear contact in f299. Lamp shade reads unlit gray despite warm characters; a small emissive material adjustment can be considered only after lead's source freeze, without new lights. Worlds held unchanged pending freeze.
