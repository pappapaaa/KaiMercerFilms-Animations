/** Original graphic face and tunic marks. No source-video pixels are used. */
import * as THREE from "three";

export type Mood =
  | "neutral"
  | "curious"
  | "happy"
  | "annoyed"
  | "surprised"
  | "worried";
export type CharacterPalette = {
  skin: string;
  shadow: string;
  hair: string;
  shirt: string;
  shirtShadow: string;
  accent: string;
  trousers: string;
  shoes: string;
  ink: string;
};
export const CHARACTER_PALETTE: CharacterPalette = {
  skin: "#fff1d3",
  shadow: "#c4cbd5",
  hair: "#34313b",
  shirt: "#39878c",
  shirtShadow: "#28666e",
  accent: "#e6b64b",
  trousers: "#35485c",
  shoes: "#253342",
  ink: "#171820",
};
export const headPath = (c: CanvasRenderingContext2D) => {
  c.beginPath();
  c.moveTo(-0.62, 0);
  c.bezierCurveTo(-0.64, 0.26, -0.34, 0.47, 0.08, 0.46);
  c.bezierCurveTo(0.44, 0.46, 0.64, 0.26, 0.62, -0.05);
  c.bezierCurveTo(0.6, -0.32, 0.35, -0.47, -0.05, -0.46);
  c.bezierCurveTo(-0.42, -0.44, -0.63, -0.26, -0.62, 0);
  c.closePath();
};
const ellipse = (
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string,
  stroke?: string,
  width = 0.012,
) => {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke();
  }
};
const line = (
  c: CanvasRenderingContext2D,
  points: [number, number][],
  color: string,
  width = 0.018,
) => {
  c.beginPath();
  c.moveTo(...points[0]);
  for (const p of points.slice(1)) c.lineTo(...p);
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke();
};
const canvasTexture = (w: number, h: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas2D is required for the character face.");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return { canvas, ctx, texture };
};

export function makeFaceTexture(p: CharacterPalette) {
  const { canvas, ctx: c, texture } = canvasTexture(1024, 768);
  let previous = "";
  const draw = (
    mood: Mood,
    talking: number,
    gaze: [number, number],
    blink: boolean,
  ) => {
    const mouth = Math.round(Math.max(0, Math.min(1, talking)) * 8) / 8;
    const key = JSON.stringify([mood, mouth, gaze, blink]);
    if (key === previous) return;
    previous = key;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.setTransform(
      canvas.width / 1.4,
      0,
      0,
      -canvas.width / 1.4,
      canvas.width / 2,
      canvas.height / 2,
    );
    c.lineJoin = "round";
    c.lineCap = "round";
    c.save();
    headPath(c);
    c.clip();
    c.fillStyle = p.skin;
    c.fillRect(-0.7, -0.53, 1.4, 1.06);
    // One broad cool cel shadow; the geometry adds only restrained side volume.
    c.beginPath();
    c.moveTo(-0.7, 0.55);
    c.lineTo(-0.29, 0.55);
    c.bezierCurveTo(-0.58, 0.19, -0.56, -0.22, -0.22, -0.55);
    c.lineTo(-0.7, -0.55);
    c.closePath();
    c.fillStyle = p.shadow;
    c.fill();
    c.restore();
    const wide =
      mood === "surprised" || mood === "worried" || mood === "curious";
    const eyes: [number, number][] = [
      [-0.24, 0.035],
      [0.23, 0.055],
    ];
    for (let i = 0; i < eyes.length; i++) {
      const [x, y] = eyes[i];
      if (blink) {
        c.beginPath();
        c.moveTo(x - 0.085, y);
        c.quadraticCurveTo(x, y - 0.035, x + 0.085, y);
        c.strokeStyle = p.ink;
        c.lineWidth = 0.02;
        c.stroke();
        continue;
      }
      if (wide) {
        ellipse(
          c,
          x,
          y,
          0.123,
          mood === "surprised" ? 0.16 : 0.137,
          "#fffef8",
          p.ink,
          0.014,
        );
        ellipse(
          c,
          x + gaze[0] * 0.035,
          y + gaze[1] * 0.035,
          0.032,
          0.039,
          p.ink,
        );
      } else if (mood === "annoyed") {
        ellipse(c, x + gaze[0] * 0.018, y - 0.025, 0.031, 0.042, p.ink);
        line(
          c,
          [
            [x - 0.095, y + 0.02],
            [x + 0.085, y + 0.005],
          ],
          p.ink,
          0.022,
        );
      } else if (mood === "happy") {
        c.beginPath();
        c.moveTo(x - 0.075, y - 0.008);
        c.quadraticCurveTo(x, y + 0.09, x + 0.075, y - 0.008);
        c.strokeStyle = p.ink;
        c.lineWidth = 0.022;
        c.stroke();
      } else
        ellipse(
          c,
          x + gaze[0] * 0.035,
          y + gaze[1] * 0.03,
          0.036,
          0.047,
          p.ink,
        );
    }
    if (mood === "surprised" || mood === "worried" || mood === "curious") {
      for (const s of [-1, 1]) {
        c.beginPath();
        c.moveTo(s * 0.34, 0.25);
        c.quadraticCurveTo(
          s * 0.25,
          mood === "worried" ? 0.32 : 0.37,
          s * 0.15,
          0.27,
        );
        c.strokeStyle = p.ink;
        c.lineWidth = 0.019;
        c.stroke();
      }
    } else if (mood === "annoyed") {
      line(
        c,
        [
          [-0.34, 0.22],
          [-0.14, 0.14],
        ],
        p.ink,
        0.025,
      );
      line(
        c,
        [
          [0.13, 0.15],
          [0.32, 0.23],
        ],
        p.ink,
        0.025,
      );
    }
    // The tiny nose is an original offset wedge, distinct from the reference avatar.
    line(
      c,
      [
        [0.015, -0.055],
        [0.055, -0.105],
        [0.005, -0.112],
      ],
      p.ink,
      0.014,
    );
    if (mouth > 0.06 || mood === "surprised") {
      const opening =
        mood === "surprised"
          ? Math.max(0.115, 0.05 + 0.15 * mouth)
          : 0.035 + 0.13 * mouth;
      const width =
        mood === "happy" ? 0.16 : mood === "surprised" ? 0.092 : 0.125;
      ellipse(c, 0.005, -0.235, width, opening, "#251c2a", p.ink, 0.014);
      c.save();
      c.beginPath();
      c.ellipse(0.005, -0.235, width, opening, 0, 0, Math.PI * 2);
      c.clip();
      ellipse(
        c,
        0.045,
        -0.235 - opening * 0.72,
        width * 0.77,
        opening * 0.48,
        "#d46d69",
      );
      c.restore();
    } else {
      c.beginPath();
      c.moveTo(-0.13, -0.21);
      if (mood === "happy") c.quadraticCurveTo(0.005, -0.34, 0.15, -0.19);
      else if (mood === "worried")
        c.quadraticCurveTo(0.005, -0.13, 0.14, -0.22);
      else if (mood === "annoyed") c.quadraticCurveTo(0.01, -0.19, 0.15, -0.24);
      else c.quadraticCurveTo(0.02, -0.255, 0.15, -0.2);
      c.strokeStyle = p.ink;
      c.lineWidth = 0.019;
      c.stroke();
    }
    texture.needsUpdate = true;
  };
  draw("neutral", 0, [0, 0], false);
  return { texture, draw };
}

export function makeTunicTexture(p: CharacterPalette) {
  const { canvas, ctx: c, texture } = canvasTexture(640, 640);
  c.setTransform(
    canvas.width / 1.1,
    0,
    0,
    -canvas.width / 1.1,
    canvas.width / 2,
    canvas.height / 2,
  );
  // Transparent marks overlay the filled tunic cap; a small dark side panel implies form.
  c.beginPath();
  c.moveTo(-0.28, 0.38);
  c.bezierCurveTo(-0.4, 0.15, -0.4, -0.2, -0.29, -0.42);
  c.lineTo(-0.13, -0.42);
  c.bezierCurveTo(-0.26, -0.12, -0.22, 0.2, -0.16, 0.38);
  c.closePath();
  c.fillStyle = p.shirtShadow;
  c.fill();
  c.beginPath();
  c.moveTo(-0.18, 0.41);
  c.lineTo(0, 0.22);
  c.lineTo(0.18, 0.41);
  c.closePath();
  c.fillStyle = p.accent;
  c.fill();
  c.strokeStyle = p.ink;
  c.lineWidth = 0.012;
  c.beginPath();
  c.moveTo(0, 0.22);
  c.lineTo(0, -0.35);
  c.stroke();
  for (const y of [0.08, -0.1, -0.28])
    ellipse(c, 0.035, y, 0.02, 0.02, p.accent, p.ink, 0.007);
  c.fillStyle = p.accent;
  c.fillRect(0.15, 0.01, 0.12, 0.13);
  c.strokeStyle = p.ink;
  c.lineWidth = 0.01;
  c.strokeRect(0.15, 0.01, 0.12, 0.13);
  texture.needsUpdate = true;
  return texture;
}
