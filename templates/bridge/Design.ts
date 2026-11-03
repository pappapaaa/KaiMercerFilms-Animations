/** Original style-adaptation settings. Measured evidence lives in COLOR_AND_LIGHTING.md;
 * light intensities/world units below are implementation choices, not recovered source settings. */
export type LookPreset = "studio" | "day" | "night";
export type Palette = {
  background: string;
  wall: string;
  wallShade: string;
  floor: string;
  floorShade: string;
  ink: string;
  softInk: string;
  trim: string;
  accent: string;
  secondary: string;
  skyTop: string;
  skyBottom: string;
  paper: string;
};
export const PALETTES: Record<LookPreset, Palette> = {
  studio: {
    background: "#efb196",
    wall: "#efb196",
    wallShade: "#d88f7d",
    floor: "#ab715d",
    floorShade: "#8b564a",
    ink: "#101318",
    softInk: "#765448",
    trim: "#7a5150",
    accent: "#4b8087",
    secondary: "#d7ad53",
    skyTop: "#a7dbe8",
    skyBottom: "#e5f2ed",
    paper: "#fff7e7",
  },
  day: {
    background: "#83c9ee",
    wall: "#e9d5b5",
    wallShade: "#c3b9b2",
    floor: "#d9bd90",
    floorShade: "#b5a584",
    ink: "#101318",
    softInk: "#867c70",
    trim: "#50727a",
    accent: "#3f7988",
    secondary: "#d7ab53",
    skyTop: "#5b9eea",
    skyBottom: "#9cdef5",
    paper: "#fff9ee",
  },
  night: {
    background: "#1b2a3a",
    wall: "#354a61",
    wallShade: "#203246",
    floor: "#344454",
    floorShade: "#263645",
    ink: "#0a101a",
    softInk: "#1c2c40",
    trim: "#263c50",
    accent: "#7c939e",
    secondary: "#d4b77b",
    skyTop: "#17263e",
    skyBottom: "#415d77",
    paper: "#dce6ed",
  },
};
export const LIGHTING: Record<
  LookPreset,
  {
    ambient: number;
    ambientColor: string;
    key: number;
    keyColor: string;
    keyPosition: [number, number, number];
    shadowOpacity: number;
  }
> = {
  studio: {
    ambient: 1.65,
    ambientColor: "#eff5ff",
    key: 2.2,
    keyColor: "#fff0d8",
    keyPosition: [-3, 6, 5],
    shadowOpacity: 0.14,
  },
  day: {
    ambient: 1.85,
    ambientColor: "#e4f0ff",
    key: 2.6,
    keyColor: "#fff6df",
    keyPosition: [-4, 7, 4],
    shadowOpacity: 0.17,
  },
  night: {
    ambient: 0.95,
    ambientColor: "#abc4ec",
    key: 2.4,
    keyColor: "#fff2c9",
    keyPosition: [-1, 4.4, 2],
    shadowOpacity: 0.28,
  },
};
/** Ink is hierarchical. Pixels here are starting targets at1080 width, not universal measurements. */
export const INK = {
  color: "#101318",
  characterOuterToHeadWidth: 0.022,
  characterInnerToOuter: 0.44,
  backgroundPx: 2.5,
  propPx: 3.5,
};
export const DEPTH = {
  bodyDepth: 0.12,
  headDepth: 0.1,
  roundedBevel: 0.035,
  contactShadowOpacity: 0.18,
  roomFog: false,
  defaultBlurPx: 0,
};
export const STAGING = {
  floorY: 0,
  backWallZ: -1.5,
  actorZ: 0,
  actorHeight: 2.4,
  clearActingZoneX: [-1.25, 1.25] as const,
};
export const REFERENCE_EVIDENCE = {
  faceWhite: {
    value: "#ffffff",
    source: "2GGA4NlMjKc",
    frame: 240,
    roi: [450, 450, 570, 550],
  },
  celShadow: {
    value: "#b9d4fd",
    source: "2GGA4NlMjKc",
    frame: 240,
    roi: [900, 660, 960, 780],
  },
  peachWall: {
    value: "#f5b393",
    source: "HOjbzw2xqEE",
    frame: 48,
    roi: [50, 80, 220, 200],
  },
  nightWall: {
    value: "#adbdd0",
    source: "tN0ra1h3uKo",
    frame: 336,
    roi: [930, 630, 1030, 810],
  },
};
