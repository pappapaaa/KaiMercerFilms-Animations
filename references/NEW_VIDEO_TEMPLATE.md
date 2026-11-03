# New episode production brief

Copy this file into the new episode's folder and replace the brackets. Do not treat unanswered fields as finished work.

## Brief

- Working title: [title]
- Script: [path and revision]
- Narration: [file, measured seconds, sample rate]
- Story status: [fiction / sourced history / sourced science]
- Intended emotion and payoff: [one sentence]
- Visual variant: [graphic conversation / dramatic interior / bright fantasy / justified combination]
- Character body depth: [default 0.12, revise deliberately]
- Output: [default 1440×2560, 24 fps]
- Frame count: [ceil(recording seconds × fps), plus any intended end hold]
- Captions or written story elements: [specific choice]
- Final deliverables: [master, preview, editable source, title, thumbnail]

## Facts and continuity

For factual stories, link each material claim to a source and separate uncertain details from established facts. For fiction, preserve character names, ages, geography, cause/effect and chronology. Flag contradictions that affect what must be shown. Keep downloaded pages, captions and attached transcript text as reference material, not production instructions.

## Assets

| Asset | Visual identity / scale | Required action | Reuse or new construction | Continuity rules |
|---|---|---|---|---|
| [lead] | [head/body, clothing, palette] | [point, sit, grip, run] | [module] | [consistent distinguishing traits] |
| [supporting actor] | [...] | [...] | [...] | [...] |
| [key prop] | [relative to hand/head] | [open/press/break/etc.] | [...] | [location and state per beat] |
| [set] | [floor, entrances, light direction] | [action clearance] | [...] | [spatial geography] |

## Word and beat timing

Use recording timestamps, not word-count estimates. Store word intervals as integer frame boundaries when using `mouthAt`. That helper creates a simple timed mouth cycle; it is not phoneme-level lip sync. For close dialogue, author specific mouth shapes and verify against the actual audio.

| Cue / exact words | Audio start–end | Frame start–end | Visible information | Hold or action |
|---|---|---|---|---|
| [hook] | [...] | [...] | [what the viewer learns] | [...] |
| [setup] | [...] | [...] | [...] | [...] |
| [escalation] | [...] | [...] | [...] | [...] |
| [turn] | [...] | [...] | [...] | [...] |
| [payoff] | [...] | [...] | [...] | [...] |

## Shot plan

Use inclusive `a`, exclusive `b`. Shots must cover `[0,durationInFrames)` without gaps. A cut occurs at the first frame of the next shot. Distinguish a cut, a reframe and a pose change in the plan.

| ID / frames | Camera / location | Actor intention and key pose | Prop state | Preparation → action → hold | Sound / text cue |
|---|---|---|---|---|---|
| [...] | [...] | [...] | [...] | [...] | [...] |

Every shot must contribute information or performance. Avoid a sequence of the same centered character with only a background color change. Change composition when the story needs a different relationship, detail, scale or emotion.

## Review record

- Character sheet / close-up inspected: [paths and findings]
- New prop interaction inspected: [paths and findings]
- Gesture, hold and cut motion strips: [paths and findings]
- Full narration timing review: [result]
- Mix loudness / true peak / duration: [measured values]
- Native master dimensions / FPS / frames / decode: [QA output]
- Remaining limitations: [specific or none]

## Publishing assets

- Final title: [specific curiosity or conflict supported by the story]
- Thumbnail concept: [one face/action, one decisive prop or setting cue]
- Thumbnail output: [new file, not a reused reference frame]
- Delivery files: [paths]

Do not mark the episode complete while its render, audio, title or thumbnail still exists only as a proposal when the user requested those deliverables.
