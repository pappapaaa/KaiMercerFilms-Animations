import * as THREE from "three";
import { Palette } from "./Design";
/** Seeded sparse brush marks. Pattern changes only when the authored seed changes. */
const random = (seed: number) => () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
  return (seed >>> 0) / 4294967296;
};
export function paintedPanel(
  p: Palette,
  kind: "wall" | "floor" = "wall",
  seed = 37,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const c = canvas.getContext("2d")!;
  const rnd = random(seed);
  const g = c.createLinearGradient(0, 0, 0, 1024);
  g.addColorStop(0, kind === "wall" ? p.wall : p.floor);
  g.addColorStop(1, kind === "wall" ? p.wallShade : p.floorShade);
  c.fillStyle = g;
  c.fillRect(0, 0, 1024, 1024);
  c.lineCap = "round";
  if (kind === "floor") {
    c.strokeStyle = p.softInk;
    c.globalAlpha = 0.42;
    c.lineWidth = 3;
    for (let y = 100; y < 1024; y += 170) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(1024, y + 4);
      c.stroke();
    }
    for (let row = 0; row < 6; row++) {
      const x = 150 + ((row * 277) % 750),
        y = 100 + row * 170;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x, y + 170);
      c.stroke();
    }
  }
  c.strokeStyle = p.softInk;
  for (let i = 0; i < (kind === "wall" ? 24 : 44); i++) {
    const x = rnd() * 1024,
      y = rnd() * 1024;
    c.globalAlpha = 0.07 + rnd() * 0.09;
    c.lineWidth = 1 + rnd() * 2;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(
      x + (kind === "wall" ? rnd() * 3 - 1 : 10 + rnd() * 15),
      y + 6 + rnd() * 13,
    );
    c.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
export function skyTexture(p: Palette) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const c = canvas.getContext("2d")!;
  const g = c.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, p.skyTop);
  g.addColorStop(1, p.skyBottom);
  c.fillStyle = g;
  c.fillRect(0, 0, 256, 512);
  c.fillStyle = p.paper;
  c.globalAlpha = 0.5;
  for (const [x, y, r] of [
    [80, 210, 42],
    [120, 205, 51],
    [165, 225, 33],
    [30, 385, 36],
    [70, 375, 45],
  ]) {
    c.beginPath();
    c.ellipse(x, y, r, r * 0.28, 0, 0, Math.PI * 2);
    c.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
