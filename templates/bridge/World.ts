/** An original parcel-room stage, derived from general cel-art principles in the four references.
 * No video still, traced setting, branded prop or external model is used by this template. */
import * as THREE from "three";
import { LookPreset, PALETTES, STAGING } from "./Design";
import { paintedPanel, skyTexture } from "./Paint";
import { outlinedBox, makeParcel, makePlant, lineBetween } from "./Props";
export function makeWorld(preset: LookPreset = "studio") {
  const p = PALETTES[preset],
    root = new THREE.Group();
  root.name = `Original parcel room / ${preset}`;
  const wallTex = paintedPanel(p, "wall"),
    floorTex = paintedPanel(p, "floor"),
    skyTex = skyTexture(p);
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 6),
    new THREE.MeshBasicMaterial({ map: wallTex }),
  );
  wall.position.set(0, 3, STAGING.backWallZ);
  root.add(wall);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 9),
    new THREE.MeshBasicMaterial({ map: floorTex }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.012, 1.5);
  floor.receiveShadow = true;
  root.add(floor);
  const baseboard = outlinedBox(12, 0.11, 0.045, p.trim, p.softInk, 0.004);
  baseboard.position.set(0, 0.055, STAGING.backWallZ + 0.03);
  root.add(baseboard);
  // Window is offset from the actor; its broad shapes supply depth without crossing the face.
  const frame = outlinedBox(1.45, 1.8, 0.1, p.trim, p.softInk, 0.006);
  frame.position.set(-1.95, 2.5, -1.42);
  root.add(frame);
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(1.25, 1.58),
    new THREE.MeshBasicMaterial({ map: skyTex }),
  );
  sky.position.set(-1.95, 2.5, -1.355);
  root.add(sky);
  for (const [w, h, x, y] of [
    [0.055, 1.58, -1.95, 2.5],
    [1.25, 0.055, -1.95, 2.5],
  ]) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.015),
      new THREE.MeshBasicMaterial({ color: p.trim }),
    );
    bar.position.set(x, y, -1.33);
    root.add(bar);
  }
  const sill = outlinedBox(1.65, 0.1, 0.24, p.trim, p.softInk, 0.006);
  sill.position.set(-1.95, 1.56, -1.3);
  root.add(sill);
  // Low side shelf has a deliberately clear center stage.
  const shelf = new THREE.Group();
  shelf.name = "Low parcel shelf";
  shelf.position.set(2.05, 0, -1.02);
  root.add(shelf);
  for (const y of [0.18, 0.83]) {
    const board = outlinedBox(1.35, 0.09, 0.58, p.trim, p.softInk, 0.006);
    board.position.y = y;
    shelf.add(board);
  }
  for (const x of [-0.56, 0.56]) {
    const leg = outlinedBox(0.08, 0.9, 0.08, p.trim, p.softInk, 0.005);
    leg.position.set(x, 0.45, 0);
    shelf.add(leg);
  }
  const parcel = makeParcel(p);
  parcel.scale.setScalar(0.8);
  parcel.position.set(0.2, 0.83 + 0.09 / 2 + 0.56 * 0.4, 0);
  shelf.add(parcel);
  const lower = outlinedBox(0.48, 0.43, 0.4, p.accent, p.softInk, 0.005);
  lower.position.set(-0.26, 0.44, 0);
  shelf.add(lower);
  const plant = makePlant(p);
  plant.scale.setScalar(0.85);
  plant.position.set(-2.8, 0, -0.6);
  root.add(plant);
  // A graphic notice board with simple strips, not legibility-dependent tiny text.
  const notice = outlinedBox(0.66, 0.83, 0.035, p.secondary, p.softInk, 0.004);
  notice.position.set(2.2, 2.2, -1.45);
  root.add(notice);
  for (let i = 0; i < 3; i++) {
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, 0.025),
      new THREE.MeshBasicMaterial({ color: p.paper }),
    );
    strip.position.set(2.2, 2.39 - i * 0.13, -1.422);
    root.add(strip);
  }
  // Soft painted window-light polygon. Does not claim physical reconstruction of the reference light.
  const lightShape = new THREE.Shape();
  lightShape.moveTo(-2.5, -0.6);
  lightShape.lineTo(-0.9, -0.6);
  lightShape.lineTo(1.1, 2.5);
  lightShape.lineTo(-1.8, 2.5);
  lightShape.closePath();
  const patch = new THREE.Mesh(
    new THREE.ShapeGeometry(lightShape),
    new THREE.MeshBasicMaterial({
      color: p.paper,
      transparent: true,
      opacity: preset === "night" ? 0.045 : 0.085,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  patch.rotation.x = -Math.PI / 2;
  patch.position.y = 0.003;
  root.add(patch);
  // A few thin paint scratches, with no frame-to-frame noise or time-based material randomness.
  for (let i = 0; i < 4; i++) {
    root.add(
      lineBetween(
        new THREE.Vector3(-3 + i * 2.0, 3.8 + (i % 2) * 0.25, -1.488),
        new THREE.Vector3(-2.99 + i * 2, 3.87 + (i % 2) * 0.25, -1.488),
        0.0025,
        p.softInk,
      ),
    );
  }
  return {
    root,
    palette: p,
    update: (_frame: number) => {},
    dispose: () => {
      const seen = new Set<unknown>();
      root.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          if (!seen.has(o.geometry)) {
            o.geometry.dispose();
            seen.add(o.geometry);
          }
          for (const m of Array.isArray(o.material) ? o.material : [o.material])
            if (!seen.has(m)) {
              m.dispose();
              seen.add(m);
            }
        }
      });
      wallTex.dispose();
      floorTex.dispose();
      skyTex.dispose();
    },
  };
}
