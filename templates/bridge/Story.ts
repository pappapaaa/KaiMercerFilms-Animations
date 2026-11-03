/** Original style proof. These beats do not recreate a reference video's story or shots. */
import timeline from "../audio/timeline.json";
export const FPS = timeline.fps,
  WIDTH = 1440,
  HEIGHT = 2560,
  DURATION = timeline.frames;
export type StoryShot = {
  id: string;
  a: number;
  b: number;
  preset: "studio" | "day" | "night";
  description: string;
};
export const SHOTS: StoryShot[] = [
  {
    id: "arrival",
    a: 0,
    b: 96,
    preset: "studio",
    description:
      "Original courier enters an illustrated parcel room; settles into a held pose.",
  },
  {
    id: "reaction",
    a: 96,
    b: 180,
    preset: "studio",
    description: "Locked close-up; expression swaps, point, then shrug.",
  },
  {
    id: "night-depth",
    a: 180,
    b: 288,
    preset: "night",
    description:
      "Same original design in a blue night palette; shallow body volume and foreground depth.",
  },
];
export const shotAt = (f: number) =>
  SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const SOUND_CUES = timeline.cues;
