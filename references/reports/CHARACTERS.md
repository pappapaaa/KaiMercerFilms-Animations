# Character construction and acting

Study of the four supplied files, at their decoded native 1080 × 1920 resolution. Numbers below come from the downloaded source frames, not from the older bridge repository. Source IDs resolve to `https://www.youtube.com/shorts/<id>`.

## Evidence and measurement method

The seven native samples and annotated bounding boxes are in `../character-measurements/`. Reproduce their measurements with `measure_characters.py`; machine-readable results are in `measurements.json`. Boxes are manually delineated image-space estimates, with ±8 px uncertainty for large heads and ±3 px for the small distant figure. They are not original model dimensions. Headgear, camera angle, cropping, and limb poses affect the silhouette; the table explicitly identifies those cases.

| Video / frame / time | Head width × height | Head h/w | Visible figure / head height | Interpretation boundary |
|---|---:|---:|---:|---|
| `2GGA4NlMjKc` f240 / 10.00 s | 907 × 666 px | 0.734 | unavailable | Seated figure cropped by frame; head-only measurement |
| `tN0ra1h3uKo` f12 / 0.50 s | 484 × 343 px | 0.709 | 2.99 | Total includes hat; head box includes hair perimeter |
| `tN0ra1h3uKo` f504 / 21.00 s | 709 × 494 px | 0.697 | 3.39 | Total includes tall hat; head excludes hat/ears |
| `HOjbzw2xqEE` f360 / 15.00 s | 442 × 335 px | 0.758 | unavailable | Desk hides lower body |
| `HOjbzw2xqEE` f600 / 25.00 s | 117 × 92 px | 0.786 | 2.33 | Small figure viewed from above; foreshortened body |
| `XdcSli5STR4` f312 / 13.00 s | 354 × 258 px | 0.729 | 2.75 | Useful neutral standing reference |
| `XdcSli5STR4` f408 / 17.00 s | 340 × 251 px | 0.738 | 2.82 | Same character with bent arms; brow accents excluded |

The two standing samples support a compact ~2.8-head figure, with a wide oval head. The clothed/hat samples should not be treated as the same rig measurement. A 3.5-head figure with long stick limbs is not supported by these examples.

## Outlines

Threshold scans (`max(R,G,B)<65`) across the upper head contour give these near-normal vertical black runs:

| Sample | Column / search rows | Dark run | Run / head width |
|---|---|---:|---:|
| TikTok f240 | x600 / y385–450 | 22 px | 2.43% |
| Christmas f504 | x600 / y300–360 | 17 px | 2.40% |
| Refrenced f360 | x250 / y745–800 | 10 px | 2.26% |
| Dogs f312 | x250 / y905–950 | 6 px | 1.69% |
| Dogs f408 | x250 / y912–955 | 6 px | 1.76% |

These are local contour samples, not a global stroke-width estimator. They show that the character outline scales with the drawn character, rather than being a fixed 3 px screen overlay. Interior eye and mouth lines are thinner. Hair, sleeves, and fingers use overlaps that intentionally interrupt or hide lines. The old repository's plum-ink convention is not a measurement of this set: these samples use near-black contour cores.

## Face and pose language

- **Eye design changes with acting.** The standing figure at Dogs f312 uses small black dots. The Christmas child at f12 uses enormous white eye shapes, dark pupils, multiple white highlights, lashes, and blush. TikTok f240 has large white eye shapes with very small offset pupils. Do not force one fixed eye size or a universal “no highlights/no blush” rule.
- **The mouth is a drawn shape, not just jaw scale.** Smile, gritted teeth, small closed curves, open red-tongued shapes, and asymmetric mouth corners appear across TikTok 10–30 s and Christmas 14–32 s. Treat dialogue mouth state separately from the brow/eye emotion.
- **Brows and cheeks carry timing.** The Dogs f312/f408 pair keeps the head silhouette almost unchanged while brow arcs, mouth shape, shoulders, and hands change the meaning. Small floating brow strokes can extend beyond the head silhouette.
- **Limbs have area.** Forearms, mittens, boots, and sleeves are broad rounded forms. Fingers are introduced for meaningful actions: the phone grip at TikTok f240 and the elf's clasped hands at Christmas f504. A dot at the end of a thin stick would lose that action.
- **Silhouettes are rebuilt for poses.** The bent forearm at Refrenced f360 changes the outer body contour. Drawn overlaps and hand swaps can communicate the pose better than rotating a single rigid stock hand.
- **Holds are useful.** The overview sequences show stable body silhouettes with local mouth/eye changes. Use the exhaustive motion report for exact held-frame statistics. Continuous body bobbing is not a requirement established by these references.

## Shading and volume

Observed: a light base fill plus a broad cool shadow shape, with occasional secondary clothing tones. TikTok f240 has a clearly separated blue shadow band on the right of the head and body. Refrenced f360 and Dogs f312 use a cool band on the left. Christmas f504 shifts the skin shadow toward muted mauve under its darker setting. These shadow shapes imply rounded volume but do not prove that the source was rendered from 3D geometry.

Implementation interpretation: preserve the graphic face and clean shape boundaries. Use restrained form shading and visible thickness only at oblique angles. A physically realistic skin shader, glossy specular reflection, or detailed skeletal anatomy would add information absent from the measured look.

## Original reusable character in this kit

`templates/bridge/Character.ts` and `characterDrawing.ts` implement an original courier with a cream face, charcoal curl, teal tunic, mustard accents, and short rounded limbs. It is not the source creator's exact avatar or costume.

Proposed values (implementation choices, not recovered source parameters):

| Parameter | Starting point | Reason |
|---|---:|---|
| Full height | 2.40 world units | Convenient shared scene scale |
| Head center | y1.82 | Leaves room for broad torso and short legs |
| Head front bounds | ~1.26 × 0.94 | Wide oval, h/w~0.75 |
| Body thickness | 0.12 units, configurable | User-requested subtle 2.5D adaptation |
| Front outline | ~2% of head width | Within the sampled contour-width range |
| Pose hold | 2 source frames at 24 fps, configurable | Supports cel-like cadence; not a claim that all source actions are on twos |
| Walk stride | 0.64 units per cycle | Template parameter; match root travel to phase to avoid sliding |

The `bodyDepth` option is the user's preference for upcoming videos. It must not be described as a measured thickness from the original videos. Face colors remain matte and graphic; shallow side surfaces receive scene light. Mouth changes do not replace the current emotional expression.

### Using the original rig

```ts
const actor = makeCharacter({bodyDepth: 0.12, holdFrames: 2});
scene.add(actor.root);
actor.root.position.set(-0.3, 0, 0); // Caller owns stage placement.
actor.update({frame: 84, mood: 'curious', gesture: 'point', talking: 0.4});
// On scene teardown, remove the root and dispose its GPU resources.
scene.remove(actor.root);
actor.dispose();
```

| Control | Supported values / behavior |
|---|---|
| `mood` | `neutral`, `curious`, `happy`, `annoyed`, `surprised`, `worried`; changes eyes, brows, mouth attitude, and a restrained head tilt |
| `gesture` | `rest`, `point`, `wave`, `shrug`, `hold`; point/open hand silhouettes swap with the action |
| `talking` | 0–1, quantized to eight mouth-opening steps; an amplitude-driven approximation, not phoneme/viseme alignment |
| `walk` | 0–1 gait strength; zero gives planted feet and no automatic body bob |
| `phase` | Optional radians; use `distanceTravelled / 0.64 * 2π` to synchronize gait with root translation |
| `gaze` | `[horizontal, vertical]`; small values offset pupils within the graphic eye shapes |
| `lean`, `headTurn` | Radians; restricted to modest ranges because the face is a shallow graphic surface |
| `bodyDepth` | 0.025–0.36 units after clamping, default 0.12; may be set per actor or per update |
| `holdFrames` | Quantizes internally generated gait/wave/blink time; caller-authored expressions, talking values, and explicit gait phase remain under caller control |

`leftHand` and `rightHand` are attachment groups. They move with the arm pose and expose world transforms for a separately staged prop. A prop can also be parented to an anchor. Inspect the grip before final rendering: an anchor supplies a repeatable contact location, while the prop geometry still needs the right size and offset.

Every update assigns local pose from its inputs, so frame seeking does not accumulate movement. The frame clock uses the starter's 24 fps convention. `dispose()` releases the rig's geometry, materials, and generated textures; no source-video pixels or external character assets are loaded.

## Review checks for a new character

Inspect front, three-quarter, full-body, and close-up views. At phone size, the emotion and the object interaction should be identifiable before reading dialogue. Check the feet against the ground, finger/prop overlap, silhouette under bent arms, and face readability after a camera turn. Save any new gesture as an editable pose rather than baking it into a finished reference frame.

## Review coverage

Native-resolution manual measurements: seven named frames above. Overview inspection: all four videos at 2 s sampling. Every decoded thumbnail cell of `2GGA4NlMjKc` was then visually reviewed in the 22 dense sheets listed below: 1,282 frames, zero skipped intervals. The other videos' dense coverage is recorded in the motion and look reports. This is exhaustive contact-sheet coverage, not a claim that each frame received native-resolution pixel measurement. Contact-sheet cells reveal composition, pose, overlap, cuts, and coarse expression changes; small contour details require the native samples.

All filenames below are under `references/sheets/2GGA4NlMjKc/`. Times are rounded from sheet labels; the decoded stream reports approximately 24.0003 fps.

| Reviewed sheet | Decoded frames, inclusive | Time interval | Character/depth observation |
|---|---|---|---|
| `dense_0000.jpg` | 0–59 | 0.000–2.458 s | Reclined whole-body pose; cut at f45 to phone insert with foreground thumb occlusion |
| `dense_0001.jpg` | 60–119 | 2.500–4.958 s | In-phone dog replaced by clothed figure; rounded sleeves and broad hand silhouettes |
| `dense_0002.jpg` | 120–179 | 5.000–7.458 s | Held torso, mouth swaps, hand-to-chest and finger-up poses; hand passes in front of phone screen |
| `dense_0003.jpg` | 180–239 | 7.500–9.958 s | Cut at f210 to seated reaction; f219–225 eye closure/opening and hand change alter attitude |
| `dense_0004.jpg` | 240–299 | 10.000–12.458 s | Raised finger becomes a low pointing gesture; cut at f276 back to the phone |
| `dense_0005.jpg` | 300–359 | 12.500–14.958 s | Hat removal f308–314 changes silhouette quickly; hat and kicked boot held beside body |
| `dense_0006.jpg` | 360–419 | 15.000–17.458 s | Cut f371; dot eyes replace large eye whites; f396 returns hands around phone and squeezes eyelids |
| `dense_0007.jpg` | 420–479 | 17.500–19.958 s | Phone crop grows; hat held in front of lower torso; facial changes occur within otherwise stable pose |
| `dense_0008.jpg` | 480–539 | 20.000–22.459 s | Hat rises back onto head; curled-finger explaining gesture; increasing screen occupancy |
| `dense_0009.jpg` | 540–599 | 22.500–24.959 s | Tightening crop emphasizes hands and mouth; cut f567 to broad-eyed seated smile; half-lids at f592 |
| `dense_0010.jpg` | 600–659 | 25.000–27.459 s | Hand held over abdomen, eyebrow/mouth changes; return to phone f647 |
| `dense_0011.jpg` | 660–719 | 27.500–29.958 s | Reaction cut f671; held seated silhouette with a hand rising toward mouth f715–719 |
| `dense_0012.jpg` | 720–779 | 30.000–32.458 s | Open palm and bent fingers cross in front of face/torso; pinched eyes accompany lifted fist; phone cut f766 |
| `dense_0013.jpg` | 780–839 | 32.500–34.959 s | Small figure with finger-up pose, followed by seated one-handed shrug at f814 |
| `dense_0014.jpg` | 840–899 | 35.000–37.459 s | In-phone figure switches between eye whites and half-lids while arms remain crossed; reaction f898 |
| `dense_0015.jpg` | 900–959 | 37.500–39.959 s | Hands settle around phone f926–930; face shifts from sleepy half-lids to open eyes without relocating body |
| `dense_0016.jpg` | 960–1019 | 40.000–42.459 s | Close phone character holds crossed arms; broad arms-out pose at f1018 |
| `dense_0017.jpg` | 1020–1079 | 42.500–44.958 s | RGB offset and horizontal tears start f1026; seated reaction at f1054, sweat accent by f1077 |
| `dense_0018.jpg` | 1080–1139 | 45.000–47.458 s | Phone becomes nearly full-frame; glitch returns f1117, temporarily distorting face/hat/sleeve contours |
| `dense_0019.jpg` | 1140–1199 | 47.500–49.959 s | Frontal distorted reaction f1148; black from f1171; live-action insert begins f1194 |
| `dense_0020.jpg` | 1200–1259 | 50.000–52.459 s | Live-action bathroom footage; excluded from cel character proportion/outline measurements |
| `dense_0021.jpg` | 1260–1281 | 52.500–53.375 s | Live-action insert, including side-angle cut f1261; final populated cell f1281 |

### What the dense pass changes

The pose library must support **hand silhouettes**, not only arm rotations: f225/9.375 s uses a raised index, f252/10.500 s points downward, f715–725/29.791–30.208 s moves a spread hand across the face, and f733/30.541 s lands on a clenched bent-hand pose. The starter provides mitten, raised-index, and spread-finger silhouette swaps plus attachment anchors. They are original simplified shapes; a precise phone grip or clenched bent hand still needs a per-action drawing swap.

The eyes are deliberately nonuniform. In the same seated character, f240/10.000 s has large white eye shapes, f371/15.458 s has black dots, f396/16.500 s has squeezed eyelids, and f592/24.667 s has half-lids. Keeping an immutable pair of “brand eyes” would miss a major acting tool. The template's mood states implement this principle using an original face design.

The chromatic split and horizontal stretches at f1026/42.750 s and f1117/46.542 s are an explicit interruption gag. They should be shot-specific post effects. The black interval f1171–1193 and live-action f1194–1281 are also specific to this short; neither establishes a mandatory visual rule for new animated stories.
