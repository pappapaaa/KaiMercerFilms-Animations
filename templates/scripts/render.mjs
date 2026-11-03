import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  selectComposition,
  renderStill,
  renderMedia,
} from "@remotion/renderer";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
process.chdir(root);
const mode = process.argv[2] || "stills";
if (!["stills", "video", "preview"].includes(mode))
  throw Error("Mode must be stills, video, or preview.");
const candidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const browserExecutable = candidates.find((p) => fs.existsSync(p));
if (!browserExecutable)
  throw Error("Set CHROME_PATH to your Chrome executable.");
process.env.TEMP = process.env.TMP = path.join(root, ".render-tmp");
fs.mkdirSync(process.env.TEMP, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.resolve(root, process.env.ENTRY || "examples/index.tsx"),
  publicDir: path.join(root, "public"),
});
const chromiumOptions = { gl: "angle" };
const browser = await openBrowser("chrome", {
  browserExecutable,
  chromiumOptions,
});
const common = {
  serveUrl,
  browserExecutable,
  chromiumOptions,
  puppeteerInstance: browser,
  timeoutInMilliseconds: 180000,
};
const stillsDir = process.env.STILLS_DIR || "outputs/stills";
fs.mkdirSync(stillsDir, { recursive: true });
try {
  const composition = await selectComposition({
    ...common,
    id: process.env.COMP || "StyleProof",
  });
  if (mode === "stills") {
    const frames = (process.argv[3] || "0,48,84,96,132,156,180,207,252,287")
      .split(",")
      .map(Number);
    for (const frame of frames) {
      if (
        !Number.isInteger(frame) ||
        frame < 0 ||
        frame >= composition.durationInFrames
      )
        throw Error(`Frame outside composition: ${frame}`);
      await renderStill({
        ...common,
        composition,
        frame,
        scale: Number(process.env.STILL_SCALE || ".375"),
        output: path.join(stillsDir, `f${String(frame).padStart(4, "0")}.png`),
      });
      console.log(`Still ${frame}`);
    }
  } else {
    let last = -1;
    await renderMedia({
      ...common,
      composition,
      codec: "h264",
      pixelFormat: "yuv420p",
      colorSpace: "bt709",
      crf: mode === "preview" ? 23 : 17,
      scale: mode === "preview" ? 0.5 : 1,
      concurrency: Number(process.env.CONCURRENCY || "2"),
      ...(process.env.FRAME_RANGE
        ? { frameRange: process.env.FRAME_RANGE.split("-").map(Number) }
        : {}),
      outputLocation:
        process.env.OUTPUT ||
        `outputs/style-proof-${mode === "preview" ? "preview" : "2K"}.mp4`,
      onProgress: (p) => {
        const n = Math.floor(p.progress * 20) * 5;
        if (n > last) {
          last = n;
          console.log(`Render ${n}%`);
        }
      },
    });
  }
} finally {
  await browser.close({ silent: true });
}
