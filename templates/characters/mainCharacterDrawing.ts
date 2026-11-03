/** Editable vector drawing for the user's chosen Character C. No concept pixels are embedded. */
import * as THREE from "three";

export type MainCharacterMood =
  | "neutral"
  | "curious"
  | "happy"
  | "annoyed"
  | "surprised"
  | "worried";
export type MainCharacterPalette = {
  skin: string;
  skinShadow: string;
  hair: string;
  hairLight: string;
  hairShadow: string;
  sweater: string;
  sweaterShadow: string;
  trim: string;
  trousers: string;
  trouserShadow: string;
  shoes: string;
  soles: string;
  ink: string;
};
export const MAIN_CHARACTER_PALETTE: MainCharacterPalette = {
  skin: "#ffc18b",
  skinShadow: "#c48f85",
  hair: "#402729",
  hairLight: "#553035",
  hairShadow: "#291c1d",
  sweater: "#efad2e",
  sweaterShadow: "#b77b26",
  trim: "#ffebc9",
  trousers: "#58354a",
  trouserShadow: "#3b2737",
  shoes: "#ffebc9",
  soles: "#493a40",
  ink: "#221b18",
};

type DrawingPath = Pick<
  CanvasRenderingContext2D,
  "moveTo" | "lineTo" | "quadraticCurveTo" | "bezierCurveTo" | "closePath"
>;

/** Broad cheek and almost horizontal chin; intentionally not the proof courier's oval. */
export function traceMainHead(p: DrawingPath) {
  p.moveTo(-0.39, 0.32);
  p.bezierCurveTo(-0.2, 0.43, 0.19, 0.42, 0.36, 0.28);
  p.bezierCurveTo(0.46, 0.19, 0.51, 0.01, 0.48, -0.18);
  p.bezierCurveTo(0.455, -0.335, 0.3, -0.375, 0.06, -0.38);
  p.bezierCurveTo(-0.21, -0.39, -0.4, -0.36, -0.455, -0.25);
  p.bezierCurveTo(-0.51, -0.14, -0.49, 0.16, -0.39, 0.32);
  p.closePath();
}

/** The large asymmetrical spikes, long side sweep, and pointed fringe are identity features. */
export function traceMainHair(p: DrawingPath) {
  p.moveTo(-0.36, -0.14);
  p.bezierCurveTo(-0.47, -0.1, -0.57, -0.13, -0.62, -0.025);
  p.bezierCurveTo(-0.7, -0.055, -0.7, 0.09, -0.53, 0.24);
  p.bezierCurveTo(-0.59, 0.29, -0.68, 0.285, -0.75, 0.26);
  p.bezierCurveTo(-0.69, 0.35, -0.58, 0.37, -0.48, 0.34);
  p.bezierCurveTo(-0.57, 0.39, -0.58, 0.43, -0.53, 0.48);
  p.bezierCurveTo(-0.54, 0.42, -0.49, 0.37, -0.45, 0.35);
  p.bezierCurveTo(-0.51, 0.48, -0.38, 0.6, -0.24, 0.655);
  p.bezierCurveTo(-0.29, 0.58, -0.32, 0.5, -0.33, 0.425);
  p.bezierCurveTo(-0.08, 0.67, 0.24, 0.72, 0.42, 0.59);
  p.bezierCurveTo(0.34, 0.565, 0.25, 0.52, 0.21, 0.48);
  p.bezierCurveTo(0.49, 0.56, 0.69, 0.48, 0.755, 0.29);
  p.bezierCurveTo(0.62, 0.33, 0.49, 0.32, 0.43, 0.29);
  p.bezierCurveTo(0.61, 0.22, 0.66, 0.09, 0.6, -0.015);
  p.bezierCurveTo(0.52, 0.04, 0.45, 0.09, 0.41, 0.155);
  p.bezierCurveTo(0.45, 0.045, 0.425, -0.03, 0.375, -0.08);
  p.bezierCurveTo(0.365, 0.19, 0.25, 0.31, 0.1, 0.4);
  p.bezierCurveTo(0.16, 0.265, 0.16, 0.23, 0.115, 0.185);
  p.bezierCurveTo(0.02, 0.25, -0.06, 0.3, -0.14, 0.355);
  p.bezierCurveTo(-0.18, 0.35, -0.22, 0.34, -0.255, 0.315);
  p.bezierCurveTo(-0.25, 0.22, -0.29, 0.17, -0.35, 0.12);
  p.lineTo(-0.37, 0.18);
  p.bezierCurveTo(-0.4, 0.075, -0.38, -0.05, -0.36, -0.14);
  p.closePath();
}

export function traceMainSweater(p: DrawingPath) {
  p.moveTo(-0.13, 0.335);
  p.bezierCurveTo(-0.23, 0.35, -0.32, 0.31, -0.35, 0.22);
  p.bezierCurveTo(-0.37, 0.06, -0.34, -0.12, -0.37, -0.27);
  p.quadraticCurveTo(-0.36, -0.355, -0.27, -0.36);
  p.quadraticCurveTo(0.08, -0.39, 0.33, -0.34);
  p.quadraticCurveTo(0.4, -0.315, 0.365, -0.23);
  p.bezierCurveTo(0.32, -0.06, 0.34, 0.17, 0.28, 0.25);
  p.quadraticCurveTo(0.22, 0.32, 0.11, 0.335);
  p.closePath();
}

const ellipse = (
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill?: string,
  stroke?: string,
  width = 0.015,
) => {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke();
  }
};
const curve = (
  c: CanvasRenderingContext2D,
  points: [number, number, number, number, number, number],
  color: string,
  width = 0.015,
) => {
  c.beginPath();
  c.moveTo(points[0], points[1]);
  c.quadraticCurveTo(points[2], points[3], points[4], points[5]);
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke();
};
function canvasFor(
  width: number,
  height: number,
  worldWidth: number,
  worldHeight: number,
  centerY = 0,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Canvas2D is required for Character C.");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  const reset = () => {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, width, height);
    c.setTransform(
      width / worldWidth,
      0,
      0,
      -height / worldHeight,
      width / 2,
      height / 2 + (centerY * height) / worldHeight,
    );
    c.lineCap = "round";
    c.lineJoin = "round";
  };
  reset();
  return { canvas, c, texture, reset };
}

export function makeMainFace(p: MainCharacterPalette) {
  const { c, texture, reset } = canvasFor(1280, 960, 1.6, 1.2);
  let previous = "";
  const draw = (
    mood: MainCharacterMood,
    talking: number,
    gaze: [number, number],
    blink: boolean,
  ) => {
    const mouth = Math.round(Math.max(0, Math.min(1, talking)) * 8) / 8;
    const gx = Math.max(-1, Math.min(1, gaze[0])),
      gy = Math.max(-1, Math.min(1, gaze[1]));
    const key = JSON.stringify([mood, mouth, gx, gy, blink]);
    if (key === previous) return;
    previous = key;
    reset();
    c.save();
    c.beginPath();
    traceMainHead(c);
    c.clip();
    const skin = c.createLinearGradient(-0.4, 0.2, 0.45, -0.15);
    skin.addColorStop(0, "#ffcb96");
    skin.addColorStop(1, p.skin);
    c.fillStyle = skin;
    c.fillRect(-0.8, -0.6, 1.6, 1.2);
    c.beginPath();
    c.moveTo(0.34, 0.41);
    c.bezierCurveTo(0.43, 0.18, 0.425, -0.16, 0.22, -0.39);
    c.lineTo(0.6, -0.45);
    c.lineTo(0.6, 0.45);
    c.closePath();
    c.fillStyle = p.skinShadow;
    c.fill();
    c.restore();
    // Ear folds belong to the stable design, outside the face's base-fill mask.
    curve(c, [-0.62, -0.12, -0.56, -0.045, -0.515, -0.15], p.ink, 0.015);
    curve(c, [0.495, -0.055, 0.55, -0.095, 0.515, -0.16], p.ink, 0.012);
    // Dark temples and bridge remain visible and identical in every expression.
    curve(c, [-0.56, -0.005, -0.46, 0.025, -0.36, 0.055], p.ink, 0.028);
    curve(c, [0.35, 0.095, 0.41, 0.105, 0.465, 0.045], p.ink, 0.023);
    const lenses = [
      { x: -0.18, y: 0.028, rx: 0.19, ry: 0.205 },
      { x: 0.2, y: 0.062, rx: 0.17, ry: 0.187 },
    ];
    for (const { x, y, rx, ry } of lenses) {
      c.save();
      c.beginPath();
      c.ellipse(x, y, rx - 0.01, ry - 0.01, 0, 0, Math.PI * 2);
      c.clip();
      c.fillStyle = "rgba(255,246,218,0.14)";
      c.fillRect(x - rx, y - ry, rx * 2, ry * 2);
      if (blink) {
        curve(
          c,
          [x - rx * 0.66, y - 0.018, x, y - 0.06, x + rx * 0.68, y - 0.006],
          p.ink,
          0.021,
        );
      } else if (mood === "happy") {
        curve(
          c,
          [x - rx * 0.59, y - 0.005, x, y + 0.16, x + rx * 0.62, y - 0.005],
          p.ink,
          0.028,
        );
      } else if (mood === "neutral" || mood === "annoyed") {
        // Half-lidded deadpan eyes sit behind clear circular frames, not sunglasses.
        const lid = y + (mood === "annoyed" ? 0.014 : 0.025);
        c.save();
        c.beginPath();
        c.moveTo(x - rx, lid - 0.015);
        c.quadraticCurveTo(x, lid + 0.002, x + rx, lid + 0.015);
        c.lineTo(x + rx, y - ry);
        c.lineTo(x - rx, y - ry);
        c.closePath();
        c.clip();
        c.fillStyle = "#fff0d5";
        c.fillRect(x - rx, y - ry, rx * 2, ry * 2);
        ellipse(
          c,
          x - 0.035 + gx * 0.045,
          y - 0.022 + gy * 0.025,
          0.045,
          0.066,
          p.ink,
        );
        c.restore();
        curve(
          c,
          [x - rx, lid - 0.015, x, lid + 0.002, x + rx, lid + 0.015],
          p.ink,
          0.014,
        );
      } else {
        ellipse(c, x, y, 0.88 * rx, 0.89 * ry, "#fff2d9");
        const lookX =
          mood === "worried" ? 0.045 : mood === "curious" ? 0.035 : 0;
        const lookY =
          mood === "worried" ? 0.025 : mood === "curious" ? 0.035 : 0;
        ellipse(
          c,
          x + lookX + gx * 0.045,
          y + lookY + gy * 0.035,
          mood === "surprised" ? 0.032 : 0.038,
          mood === "surprised" ? 0.045 : 0.053,
          p.ink,
        );
      }
      c.restore();
      ellipse(c, x, y, rx, ry, undefined, p.ink, 0.02);
    }
    curve(c, [0.003, 0.083, 0.02, 0.1, 0.048, 0.091], p.ink, 0.022);
    // Thick expressive eyebrows. Hairline and glasses geometry never change with mood.
    if (mood === "worried") {
      curve(c, [-0.29, 0.25, -0.2, 0.23, -0.11, 0.31], p.ink, 0.03);
      curve(c, [0.12, 0.31, 0.2, 0.24, 0.29, 0.25], p.ink, 0.03);
    } else if (mood === "annoyed") {
      curve(c, [-0.32, 0.29, -0.22, 0.255, -0.12, 0.24], p.ink, 0.03);
      curve(c, [0.1, 0.25, 0.21, 0.28, 0.29, 0.32], p.ink, 0.03);
    } else {
      curve(
        c,
        [-0.29, 0.25, -0.22, mood === "curious" ? 0.36 : 0.35, -0.12, 0.29],
        p.ink,
        0.03,
      );
      curve(
        c,
        [0.14, 0.26, 0.22, mood === "curious" ? 0.285 : 0.32, 0.29, 0.265],
        p.ink,
        0.027,
      );
    }
    // The small hooked nose is part of C's chosen face construction.
    c.beginPath();
    c.moveTo(0.06, -0.057);
    c.bezierCurveTo(0.115, -0.035, 0.135, -0.112, 0.076, -0.147);
    c.strokeStyle = p.ink;
    c.lineWidth = 0.014;
    c.stroke();
    const open =
      mood === "happy" ||
      mood === "surprised" ||
      mood === "worried" ||
      mouth > 0.04;
    if (open) {
      c.beginPath();
      if (mood === "happy") {
        c.moveTo(-0.13, -0.16);
        c.lineTo(0.14, -0.155);
        c.bezierCurveTo(0.115, -0.34, -0.08, -0.4, -0.13, -0.16);
      } else if (mood === "surprised") {
        c.moveTo(-0.15, -0.315);
        c.bezierCurveTo(-0.11, -0.09, 0.13, -0.09, 0.14, -0.315);
        c.quadraticCurveTo(0.015, -0.245, -0.15, -0.315);
      } else if (mood === "worried" && mouth < 0.5) {
        c.moveTo(-0.1, -0.285);
        c.bezierCurveTo(-0.09, -0.18, 0.06, -0.18, 0.09, -0.285);
        c.quadraticCurveTo(0, -0.255, -0.1, -0.285);
      } else {
        c.ellipse(-0.005, -0.25, 0.11, 0.035 + 0.08 * mouth, 0, 0, Math.PI * 2);
      }
      c.closePath();
      c.fillStyle = "#55282a";
      c.fill();
      c.strokeStyle = p.ink;
      c.lineWidth = 0.014;
      c.stroke();
      c.save();
      c.clip();
      ellipse(c, 0.015, -0.327, 0.125, 0.09, "#d67479");
      c.restore();
    } else if (mood === "annoyed")
      curve(c, [-0.1, -0.26, 0, -0.19, 0.095, -0.26], p.ink, 0.015);
    else curve(c, [-0.15, -0.225, -0.11, -0.273, 0.075, -0.25], p.ink, 0.014);
    if (mood === "worried") {
      c.beginPath();
      c.moveTo(-0.39, -0.13);
      c.bezierCurveTo(-0.45, -0.25, -0.35, -0.26, -0.39, -0.13);
      c.fillStyle = "#fff2d9";
      c.fill();
      c.strokeStyle = p.ink;
      c.lineWidth = 0.009;
      c.stroke();
    }
    texture.needsUpdate = true;
  };
  draw("neutral", 0, [0, 0], false);
  return { texture, draw };
}

export function makeMainHairPaint(p: MainCharacterPalette) {
  const { c, texture } = canvasFor(1280, 800, 1.6, 1.0, 0.23);
  c.save();
  c.beginPath();
  traceMainHair(c);
  c.clip();
  const fill = c.createLinearGradient(-0.3, 0.65, 0.35, -0.15);
  fill.addColorStop(0, p.hairLight);
  fill.addColorStop(0.6, p.hair);
  fill.addColorStop(1, p.hairShadow);
  c.fillStyle = fill;
  c.fillRect(-0.8, -0.27, 1.6, 1.0);
  c.beginPath();
  c.moveTo(-0.63, 0.02);
  c.bezierCurveTo(-0.48, 0.04, -0.46, 0.2, -0.4, 0.28);
  c.bezierCurveTo(-0.5, 0.08, -0.4, -0.02, -0.36, -0.15);
  c.lineTo(-0.65, -0.16);
  c.closePath();
  c.fillStyle = p.hairShadow;
  c.fill();
  c.restore();
  texture.needsUpdate = true;
  return texture;
}

export function makeMainSweaterPaint(p: MainCharacterPalette) {
  const { c, texture } = canvasFor(800, 800, 0.9, 0.9);
  c.save();
  c.beginPath();
  traceMainSweater(c);
  c.clip();
  const fill = c.createLinearGradient(-0.3, 0.24, 0.34, -0.25);
  fill.addColorStop(0, "#f8ba3b");
  fill.addColorStop(0.6, p.sweater);
  fill.addColorStop(1, "#e7a02a");
  c.fillStyle = fill;
  c.fillRect(-0.45, -0.45, 0.9, 0.9);
  c.beginPath();
  c.moveTo(0.265, 0.23);
  c.bezierCurveTo(0.29, -0.01, 0.24, -0.2, 0.08, -0.25);
  c.bezierCurveTo(0.19, -0.265, 0.28, -0.23, 0.36, -0.2);
  c.lineTo(0.38, -0.32);
  c.lineTo(0.38, 0.28);
  c.closePath();
  c.fillStyle = p.sweaterShadow;
  c.fill();
  c.beginPath();
  c.moveTo(-0.32, -0.18);
  c.quadraticCurveTo(-0.2, -0.15, -0.12, -0.05);
  c.quadraticCurveTo(-0.16, -0.19, -0.31, -0.24);
  c.closePath();
  c.fillStyle = p.sweaterShadow;
  c.fill();
  // A crewneck ring and ribbed hem, not a uniform collar, buttons, or chest badge.
  ellipse(c, 0, 0.326, 0.158, 0.084, p.trim, p.ink, 0.01);
  ellipse(c, 0, 0.363, 0.112, 0.052, p.skin, p.ink, 0.008);
  c.beginPath();
  c.moveTo(-0.37, -0.285);
  c.quadraticCurveTo(0.02, -0.33, 0.355, -0.29);
  c.strokeStyle = p.ink;
  c.lineWidth = 0.012;
  c.stroke();
  // User-selected lowercase red mark on the character's anatomical left chest
  // (positive image X / viewer's right when front-facing). Flip the text's local
  // Y because the drawing canvas uses the scene's upward-positive coordinates.
  c.save();
  c.translate(0.17, 0.15);
  c.scale(1, -1);
  c.font = "700 0.09px Arial, sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = "#d92e35";
  c.fillText("kai", 0, 0);
  c.restore();
  c.restore();
  texture.needsUpdate = true;
  return texture;
}

export function makeMainSneakerPaint(p: MainCharacterPalette) {
  const { c, texture } = canvasFor(640, 384, 0.5, 0.3);
  c.save();
  c.beginPath();
  c.moveTo(-0.225, -0.083);
  c.quadraticCurveTo(-0.235, 0.055, -0.125, 0.112);
  c.quadraticCurveTo(-0.055, 0.145, 0.05, 0.105);
  c.quadraticCurveTo(0.19, 0.075, 0.225, -0.018);
  c.lineTo(0.225, -0.083);
  c.quadraticCurveTo(0.01, -0.112, -0.225, -0.083);
  c.closePath();
  c.clip();
  c.beginPath();
  c.moveTo(-0.24, -0.043);
  c.quadraticCurveTo(0, -0.075, 0.24, -0.043);
  c.lineTo(0.24, -0.15);
  c.lineTo(-0.24, -0.15);
  c.closePath();
  c.fillStyle = p.soles;
  c.fill();
  curve(c, [-0.225, -0.045, 0, -0.075, 0.235, -0.045], p.ink, 0.01);
  curve(c, [0.065, -0.05, 0.08, 0.025, 0.16, 0.057], p.ink, 0.008);
  curve(c, [-0.14, 0.078, -0.035, 0.065, 0.07, 0.018], p.ink, 0.008);
  curve(c, [-0.11, 0.104, -0.015, 0.09, 0.09, 0.043], p.ink, 0.008);
  c.restore();
  texture.needsUpdate = true;
  return texture;
}

export function makeMainTrouserPaint(p: MainCharacterPalette) {
  const { c, texture } = canvasFor(256, 640, 0.36, 0.76, -0.34);
  c.save();
  c.beginPath();
  c.moveTo(-0.14, 0.015);
  c.lineTo(0.145, 0.015);
  c.quadraticCurveTo(0.13, -0.3, 0.14, -0.56);
  c.quadraticCurveTo(0.18, -0.64, 0.12, -0.67);
  c.lineTo(-0.13, -0.67);
  c.quadraticCurveTo(-0.175, -0.64, -0.145, -0.58);
  c.closePath();
  c.clip();
  c.beginPath();
  c.moveTo(0.12, 0.01);
  c.lineTo(0.16, -0.64);
  c.lineTo(0.085, -0.67);
  c.lineTo(0.055, -0.1);
  c.closePath();
  c.fillStyle = p.trouserShadow;
  c.fill();
  curve(c, [-0.12, -0.57, -0.025, -0.64, 0.105, -0.6], p.ink, 0.009);
  c.restore();
  texture.needsUpdate = true;
  return texture;
}
