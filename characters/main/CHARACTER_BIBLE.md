# Permanent main character — selected Option C

The user chose Option C from four original imagegen concepts. `concept.png` is the authoritative identity reference. This is the default recurring lead for future shorts made with this kit. The character has no user-selected name yet; use the production identifier `MainCharacter` without inventing biographical facts.

## Stable identity

- **Head:** very wide, softly rounded-square silhouette, warm peach skin, small simple curved nose and visible rounded ears. Preserve the broad lower cheek/jaw rather than turning the head into a sphere or a narrow oval.
- **Hair:** dark espresso with a large, asymmetric group of chunky spikes swept sideways. The top and side silhouette is a major recognition cue. Do not replace it with the courier's small curls or a generic smooth cap.
- **Glasses:** two large circular dark frames, a small bridge and clear lenses. They remain in every expression, including shock. Lenses do not become opaque white discs that erase the eyes. Preserve the circular shape rather than changing to square frames.
- **Face:** bold brows, simple pupils, flexible mouth drawings and a slightly skeptical half-lidded neutral expression. Deadpan is the default personality cue; the character can still show delight, fear, surprise and concern.
- **Body:** compact rounded cartoon proportions, broad hands and feet, short readable limbs. Preserve the head/body relationship in new outfits.
- **Volume:** a graphic matte face with a broad shadow region, plus a little side thickness on body/clothing. Default rig `bodyDepth=0.12`. Keep the body softly dimensional without glossy toy rendering.

## Default clothing

Mustard-yellow crewneck sweatshirt with a cream collar edge, deep plum trousers, off-white sneakers with dark soles. The user added the exact lowercase word **kai** in red (`#d92e35`) on the character's anatomical left chest (viewer-right in a front view). Keep this small, clean and legible on the default sweatshirt. The sweatshirt has no courier buttons, badge, diagonal neckerchief, backpack straps or uniform pocket.

Story-specific costumes may change, but hair, glasses, face proportions and body identity stay consistent. If the script requires removing glasses, show that as an intentional action and retain them as a prop; do not accidentally omit them in a new render.

## Expressions and acting

| Emotion | Recognition cues | Rig mood |
|---|---|---|
| Deadpan | Half-lidded eyes, level or slightly asymmetric brow, small controlled smile | `neutral` |
| Happy | Upturned mouth, raised cheeks, relaxed raised brow or curved closed eyes | `happy` |
| Worried | Inner brow lift, gaze shift, small tense mouth | `worried` |
| Shocked | Wide eyes within the same glasses, raised brows, open rounded mouth | `surprised` |
| Annoyed | Low angled brows, narrowed lids, flat or asymmetric mouth | `annoyed` |
| Thinking | Uneven brow, directed gaze, small quizzical mouth | `curious` |

Emotion and speech are separate inputs. Keep the glasses and hair stable while the face changes. Do not make the entire head bob continuously during a held reaction. Use open palms, a pointing hand, a shrug or a wave when the line calls for it.

## Sources and implementation

- `concept.png`: user-selected original imagegen design.
- `kai-chest.png`: the user's supplied character crop with the requested red lowercase chest mark, added with imagegen. The earlier concept/model sheets predate this wardrobe detail; the editable rig and identity JSON include it.
- `model-sheet-v2.png`: final front/three-quarter/side/back and expression reference, with a corrected straight-on front view. `model-sheet.png` retains the earlier draft.
- `GENERATION_PROMPT.md`: the exact identity-preserving model-sheet prompt.
- `../../templates/characters/MainCharacter.ts`: editable shallow-volume rig and pose API.
- `../../templates/characters/mainCharacterDrawing.ts`: editable face/clothing drawings and palette.
- `../../episodes/main-character/`: deterministic identity/acting test.

The imagegen sheets define the target design. The code rig is a practical animation interpretation and must be checked against them; do not claim a pixel-identical conversion. Its face is designed for frontal and restrained three-quarter views (roughly ±20°). A full side or back performance requires an authored view-specific face/hair treatment; a turnaround image alone does not create a fully rotatable 3D head.

The calibrated rig stands approximately 2.5 world units high. The head assembly is scaled to 0.88 of its authored drawing coordinates, centered near y=1.89, with a hair width around 1.37. This brings the visible head-and-hair fraction closer to the selected concept while leaving more trouser length. These are implementation settings; the concept remains the visual reference. Foot soles are separate rounded masks and the neutral pupils are clipped beneath the half-lids.

## Reuse checks

Before finishing a new episode, compare a neutral full-body and a close-up against `concept.png`. Confirm the glasses stay round, hair sweep stays consistent, sweatshirt/alternate outfit does not change body proportions, hand contacts work, and the subtle body depth remains restrained. Save new expressions and poses in editable form so later episodes retain the same lead.

The previous courier remains available as a technical example. It must not silently replace this selected permanent lead.
