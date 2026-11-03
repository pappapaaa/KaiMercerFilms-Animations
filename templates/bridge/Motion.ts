/** Authoring helpers. Pose sampling is independent of the render frame rate. */
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};
export const smoother = (t: number) => {
  t = clamp(t);
  return t * t * t * (t * (6 * t - 15) + 10);
};
export const poseFrame = (frame: number, hold = 2) =>
  Math.floor(frame / Math.max(1, hold)) * Math.max(1, hold);
export const interval = (f: number, a: number, b: number) =>
  clamp((f - a) / Math.max(1, b - a));
export const impulse = (
  frame: number,
  start: number,
  duration = 5,
  amount = 1,
) => {
  const age = frame - start;
  if (age < 0 || age >= duration) return 0;
  return amount * (age % 2 ? -1 : 1) * Math.pow(1 - age / duration, 2);
};
/** A travel-derived walk phase can be reused after any seek; never integrate delta-time. */
export const walkPhase = (travel: number, stride = 0.72) =>
  (travel / stride) * Math.PI * 2;
export const mouthAt = (f: number, words: { a: number; b: number }[]) => {
  const word = words.find((w) => f >= w.a && f < w.b);
  if (!word) return 0;
  return [0.25, 0.7, 0.4][Math.floor((f - word.a) / 2) % 3];
};
