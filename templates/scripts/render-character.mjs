// Portable dedicated entry for the selected permanent lead, separate from the courier proof.
const mode = process.argv[2] || "stills";
process.argv[2] = mode;
process.env.ENTRY = "episodes/main-character/index.tsx";
process.env.COMP = "MainCharacter";
process.env.STILLS_DIR ||= "outputs/main-character/stills";
if (mode === "stills") process.argv[3] ||= "0,48,72,96,120,144,180,191";
else
  process.env.OUTPUT ||= `outputs/main-character-${mode === "preview" ? "preview" : "2K"}.mp4`;
await import("./render.mjs");
