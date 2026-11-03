import { interval, smoother, lerp, impulse } from "./Motion";
import { shotAt } from "./Story";
export type V3 = [number, number, number];
export type CameraPose = {
  position: V3;
  target: V3;
  fov: number;
  roll: number;
};
/** Fixed framing is intentional. Only the reaction accent moves the camera. */
export function cameraAt(frame: number): CameraPose {
  const shot = shotAt(frame);
  if (shot.id === "arrival")
    return {
      position: [0, 1.8, 6.4],
      target: [0, 1.15, -0.1],
      fov: 46,
      roll: 0,
    };
  if (shot.id === "reaction") {
    const emphasis = smoother(interval(frame, 130, 138));
    return {
      position: [-0.12, 1.86, lerp(3.2, 3.0, emphasis)],
      target: [-0.25, 1.68, 0],
      fov: 36,
      roll: impulse(frame, 132, 4, 0.004),
    };
  }
  return {
    position: [1.3, 2.1, 6.3],
    target: [0, 1.15, -0.2],
    fov: 45,
    roll: 0,
  };
}
