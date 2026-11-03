# Color and lighting study

Study date: 2026-11-02. Sources: the four user-supplied shorts, decoded locally at 1080 × 1920. This report describes their visible images; it does not claim access to the original project, lights, color-management settings, or materials.

## Main finding

The transferable look is a **hierarchy of broad colored backgrounds, white or pale actors, black expressive ink, and selective painted shading**. There is no common saturation target or universal warm grade. The same group of references contains an olive living room, a dark blue Christmas interior, a nearly flat peach dialogue backdrop, a navy cockpit, a yellow graphic burst, and a bright blue cloud realm. Select a palette for the story beat, then preserve the separation of actor, important prop, and background.

The source character shading is often a hard-edged colored shape. For example, the TikTok close-up at f240 contains a perfectly uniform white face patch and a perfectly uniform pale-blue shadow patch. A physically lit smooth white sphere would create a different image. A shallow 3D body is an optional adaptation requested by the user; it is not evidence that the reference bodies were modeled in 3D.

## Evidence and measurement method

- [measure_look.py](../look-measurements/measure_look.py) extracts 20 selected native frames and saves [samples.json](../look-measurements/samples.json). Those samples deliberately cover different settings; they are not a statistically random selection.
- [measure_profiles.py](../look-measurements/measure_profiles.py) measures native-pixel color patches and saves [profiles.json](../look-measurements/profiles.json). Coordinates are `(left, top, right, bottom)`, right/bottom exclusive, measured from the top-left of a 1080 × 1920 frame.
- Global frame statistics use an area-resized 216 × 384 RGB image. The reported `Y' = 0.2126R' + 0.7152G' + 0.0722B'` is a display-referred brightness proxy, **not scene-linear luminance or light intensity**. HSV saturation is a separate statistic. Neither number is an exposure setting.
- Six-color k-means summaries in the JSON mix actor, ink, background, text, and props. They are composition summaries, not recovered material albedos. Seed 31, three attempts, one pixel in eleven from the resized image.
- Exact native frame indices are the primary locator. Approximate seconds use 24 fps; decoded metadata is slightly different for some files. No temporal interpolation is used for these samples.
- All 779 contact cells of `XdcSli5STR4`, f0–778, were also visually inspected across all 13 dense sheets. The full coverage log below records that review. This is an all-frame review at contact-sheet resolution; the color values come from the separate native-pixel samples.

The other references were inspected through their overview sheets and selected native frames for this look report. The character and motion reports document the team's complementary dense-sheet review. Do not describe a 1 fps overview as a frame-by-frame inspection.

## Palette families in the supplied material

| Reference and locator | Observed organization | Reusable decision |
|---|---|---|
| `2GGA4NlMjKc`, f0–240 (0–10 s samples) | Muted olive/teal/brown room; white characters dominate closer shots; pale-blue cel shadows | Quiet background values make face and gesture readable; make the actionable screen/prop the accent |
| `2GGA4NlMjKc`, f528 (~22 s) | Green phone insert with cream and near-black areas | Insert shots can change the palette sharply when the subject changes |
| `tN0ra1h3uKo`, f96/f336 (~4/14 s) | Deep blue/gray interior, illuminated zones, dark ceiling and foreground | Build a few large light/dark shapes; preserve local actor contrast inside them |
| `tN0ra1h3uKo`, f912 (~38 s) | Warmer peach/red interior, blue-gray accents | Let the story's setting and resolution motivate the warm change |
| `HOjbzw2xqEE`, f48/f240 (~2/10 s) | Flat peach field, brown desk, white outlined figures | A simple background can carry dialogue; no need for gratuitous scenic movement |
| `HOjbzw2xqEE`, f576/f696 (~24/29 s) | Pale lavender/pink cloud realm | Change background family while retaining ink and figure vocabulary |
| `XdcSli5STR4`, f24–62 (~1–2.6 s) | Yellow radial burst behind white/blue figure | Use a graphic emphasis card as a shot, not as a permanent world treatment |
| `XdcSli5STR4`, f63–276 (~2.6–11.5 s) | Gray cockpit, navy chairs/uniforms, cyan window, gold/red small accents | Environment has more detail, but line weight and value keep actors in front |
| `XdcSli5STR4`, f302–778 (~12.6–32.4 s) | Blue gradient sky, pale cyan clouds, ochre/rose podium, white figure | Separate crisp subjects from soft-edged atmospheric shapes |

The black transition sampled at TikTok f1176 (~49 s) is excluded from cartoon palette targets. Its later live-action gag is a separate visual mode, not evidence for cel materials.

## Native-pixel color measurements

These values describe the decoded source pixels, including its compression and any baked grade. They are useful anchors, not colors to apply indiscriminately to every object.

| Image | Region | Native ROI | Median RGB hex | RGB standard deviation |
|---|---|---|---|---|
| [TikTok f240](../look-measurements/2GGA4NlMjKc_f0240.png) | White face interior | 450,450–570,550 | `#ffffff` | 0, 0, 0 |
| Same frame | Cool cel-shadow interior | 900,660–960,780 | `#b9d4fd` | 0, 0, 0 |
| Same frame | Olive background | 800,130–950,240 | `#89967d` | 0.57, 1.47, 1.94 |
| [Refrenced f48](../look-measurements/HOjbzw2xqEE_f0048.png) | Peach backdrop | 50,80–220,200 | `#f5b393` | 0, 0, 0 |
| Same frame | Brown desk | 40,1650–170,1780 | `#885144` | 1.05, 1.02, 0.99 |
| [Christmas f336](../look-measurements/tN0ra1h3uKo_f0336.png) | Lit wall gradient | 930,630–1030,810 | `#adbdd0` | 11.72, 11.02, 10.47 |
| Same frame | Dark ceiling | 70,40–210,150 | `#0c141d` | 0.84, 0.85, 0.84 |
| [Shotgun/Dogs f336](../look-measurements/XdcSli5STR4_f0336.png) | Upper sky | 100,100–350,250 | `#569cf9` | 2.47, 2.88, 0.70 |
| Same frame | Lower sky | 50,780–220,900 | `#7ccdfc` | 1.32, 1.32, 0.60 |

The two exactly uniform TikTok regions support a cel-paint interpretation at that frame. The higher variation in the Christmas wall patch supports a broad gradient in that region. These tests do not establish how either image was authored.

## Why one global numerical target would fail

Representative frame statistics below show the range. Dark coverage means fraction of resized pixels with `Y' < 0.10`. The full 20-frame table is in the JSON.

| Source/frame | Median Y' | P05 / P95 Y' | Mean HSV saturation | Dark coverage |
|---|---:|---:|---:|---:|
| TikTok f0 | .370 | .151 / 1.000 | .300 | 2.5% |
| TikTok f240 | .570 | .004 / 1.000 | .204 | 8.3% |
| TikTok f528 | .660 | .003 / .972 | .532 | 15.8% |
| Christmas f96 | .170 | .028 / .819 | .361 | 36.1% |
| Christmas f336 | .301 | .012 / .843 | .374 | 24.6% |
| Christmas f912 | .549 | .151 / .814 | .456 | 2.9% |
| Refrenced f48 | .748 | .111 / 1.000 | .299 | 4.9% |
| Refrenced f696 | .846 | .580 / 1.000 | .170 | 3.3% |
| Shotgun/Dogs f96 | .494 | .067 / 1.000 | .384 | 6.1% |
| Shotgun/Dogs f336 | .728 | .443 / 1.000 | .394 | 1.4% |
| Shotgun/Dogs f480 | .955 | .024 / 1.000 | .107 | 5.7% |

A close-up containing a large white face naturally raises the median and lowers mean saturation. That is a framing effect. Do not increase scene saturation or darken the actor to make unrelated shots share these aggregate values.

## Lighting: observable, inferred, and proposed

**Observable:** broad lit/dark background regions; cool colored shapes on white bodies; simple graphic highlights; a night scene with motivated pools of light; a foreground cloud edge with soft transition; generally clean black character ink. These are image-space properties.

**Reasonable inference:** a small number of painted layers can reproduce much of the look; character shading is designed for readability; a consistent shadow-side palette can provide volume without noisy physical shading. The smooth background softness could be painted, blurred, or composited. Its physical cause is not uniquely identifiable.

**Not recovered:** light count, watts/lumens, sun angle, camera focal length, real object dimensions, roughness, light bounces, 3D reconstruction, render engine, or exact blur radius. Avoid presenting those as measurements.

**Proposed implementation:** [Design.ts](../../templates/bridge/Design.ts) offers `studio`, `day`, and `night` palettes with a few broad fill/key settings. They are calibrated starting choices for an original test scene. The main bridge owns the lights; `makeWorld()` supplies geometry and color layers. MeshBasicMaterial backgrounds preserve the designed colors, while shallow MeshToonMaterial props can show mild volume. The actor can use flatter painted front surfaces and shallow sides.

| Preset | Purpose | Proposed ambient / key | Proposed key position | Contact-shadow opacity starting point |
|---|---|---:|---|---:|
| studio | Warm parcel-room conversation | 1.65 / 2.20 | -3, 6, 5 | .14 |
| day | Cool daylight with warm walls/props | 1.85 / 2.60 | -4, 7, 4 | .17 |
| night | Cool room plus warm motivated pool | .95 / 2.40 | -1, 4.4, 2 | .28 |

Those intensities are Three.js implementation parameters, not comparable to a video pixel value. Review the actual output under the bridge's color-management setup before tuning. Avoid stacking strong exposure changes, bloom, fog, vignette, and grain over an already designed flat palette.

## Original world implementation

[World.ts](../../templates/bridge/World.ts) builds an original open-front parcel room. It uses a painted wall/floor, a simple window, low side shelf, small parcel, paper-like plant, and a notice board. The floor is y=0, back wall z=-1.5, center actor z=0, clear acting area approximately x=-1.25 to 1.25. A 12-unit wall/floor span covers the intended portrait camera. These are staging choices, not source measurements.

[Paint.ts](../../templates/bridge/Paint.ts) uses seeded, static sparse marks and a broad gradient. No fresh random texture is generated as a function of time. [Props.ts](../../templates/bridge/Props.ts) uses reusable boxes, a blank parcel label, and original leaf shapes; it needs no external model or reference still. Props should serve the action: keep eye level and hand travel clear, and delete a decorative object if it weakens the silhouette.

## Complete dense-sheet inspection log: XdcSli5STR4

Every visible frame cell on these sheets was reviewed. Each normal page contains 60 consecutive decoded frames; the last contains 59. There are no gaps in this contact-sheet coverage. Native-frame measurements remain the limited set documented above.

| Sheet | Inclusive frames | Approx. time | Look and staging observations |
|---|---|---|---|
| [dense_0000](../sheets/XdcSli5STR4/dense_0000.jpg) | 0–59 | 0.00–2.46 s | Pale-blue/white title card to yellow burst at f24; blue shadow shapes remain inside crisp black body contour |
| [dense_0001](../sheets/XdcSli5STR4/dense_0001.jpg) | 60–119 | 2.50–4.96 s | Cockpit cut f63; close-up f88; pale sky, gray panels, navy suit/chair, gold trims; pose changes while room is stable |
| [dense_0002](../sheets/XdcSli5STR4/dense_0002.jpg) | 120–179 | 5.00–7.46 s | Categorical face/hand changes; cockpit widens at f153; colored background detail is finer than actor contour |
| [dense_0003](../sheets/XdcSli5STR4/dense_0003.jpg) | 180–239 | 7.50–9.96 s | Talking holds and hand shapes; cabin crowd cut f220; overlapping figures establish depth without a scene orbit |
| [dense_0004](../sheets/XdcSli5STR4/dense_0004.jpg) | 240–299 | 10.00–12.46 s | Crowded cabin hold, then second graphic title card at f277 |
| [dense_0005](../sheets/XdcSli5STR4/dense_0005.jpg) | 300–359 | 12.50–14.96 s | Cloud-realm wide at f302; blue vertical sky gradient; soft unoutlined clouds, warm podium; small white actor reaction changes |
| [dense_0006](../sheets/XdcSli5STR4/dense_0006.jpg) | 360–419 | 15.00–17.46 s | Same broad value structure; alternate actor poses and mouth shapes; halo tilts but scene palette stays steady |
| [dense_0007](../sheets/XdcSli5STR4/dense_0007.jpg) | 420–479 | 17.50–19.96 s | Close reaction cut f438; expressive eye redraw f460; white/cool-blue body on pale clouds retains a black contour |
| [dense_0008](../sheets/XdcSli5STR4/dense_0008.jpg) | 480–539 | 20.00–22.46 s | Low-angle podium cut f492; foreground warm panel uses thin colored seams; large expression change f515 |
| [dense_0009](../sheets/XdcSli5STR4/dense_0009.jpg) | 540–599 | 22.50–24.96 s | New two-figure composition f551; framed picture appears f568; same background hue across the new staging |
| [dense_0010](../sheets/XdcSli5STR4/dense_0010.jpg) | 600–659 | 25.00–27.46 s | Held exchange; very tight crop f629; contour thickness grows with subject scale; no separate global blur required |
| [dense_0011](../sheets/XdcSli5STR4/dense_0011.jpg) | 660–719 | 27.50–29.96 s | Tight reaction then group reveal f689; sky/cloud treatment remains consistent across scale changes |
| [dense_0012](../sheets/XdcSli5STR4/dense_0012.jpg) | 720–778 | 30.00–32.42 s | Group hold with small mouth/head/halo changes; no new lighting mode or continuous camera travel |

## Review criteria for a new short

1. Choose the palette per setting and emotional beat. Compare a new frame with a reference from the same kind of setting, not the numerical average of all four videos.
2. At phone size, identify actor, face, active hand, and story prop immediately. Reduce background contrast/detail if they compete.
3. Inspect native output for flat face regions, intact ink, and smooth gradients. Compression should not erase thin facial marks.
4. Use a hard shadow shape where the drawing needs it; keep actual body depth modest. A strong specular plastic finish will change the visual language.
5. Use soft foreground/background edges selectively. Preserve crisp eyes and mouth. Treat blur as a shot decision.
6. Check adjacent frames for texture crawl, changing exposure, and lighting jumps. The reference uses held drawings; a held image should remain stable.

## Limits

This is a four-video reference study, not a claim about every work by the source creator. The source colors are useful evidence; the new room, palette variations, and geometry are original adaptations. Dense sheets support exhaustive event/continuity inspection at reduced resolution, not exhaustive pixel-level material identification. Re-measure native crops when a new design decision depends on a precise edge or color.
