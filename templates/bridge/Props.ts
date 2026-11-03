import * as THREE from "three";
import { Palette, PALETTES } from "./Design";
export function lineBetween(
  a: THREE.Vector3,
  b: THREE.Vector3,
  radius: number,
  color: string,
) {
  const direction = b.clone().sub(a),
    mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, direction.length(), 5),
      new THREE.MeshBasicMaterial({ color }),
    );
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  return mesh;
}
export function outlinedBox(
  w: number,
  h: number,
  d: number,
  color: string,
  ink: string,
  r = 0.008,
) {
  const g = new THREE.Group(),
    m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshToonMaterial({ color }),
    );
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  const v: [number, number, number][] = [
    [-w / 2, -h / 2, -d / 2],
    [w / 2, -h / 2, -d / 2],
    [w / 2, h / 2, -d / 2],
    [-w / 2, h / 2, -d / 2],
    [-w / 2, -h / 2, d / 2],
    [w / 2, -h / 2, d / 2],
    [w / 2, h / 2, d / 2],
    [-w / 2, h / 2, d / 2],
  ];
  for (const [a, b] of [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ])
    g.add(
      lineBetween(
        new THREE.Vector3(...v[a]),
        new THREE.Vector3(...v[b]),
        r,
        ink,
      ),
    );
  return g;
}
export function makeParcel(p: Palette = PALETTES.studio) {
  const root = outlinedBox(0.72, 0.56, 0.5, p.secondary, p.ink, 0.01);
  root.name = "Original parcel";
  const tape = new THREE.Mesh(
    new THREE.BoxGeometry(0.095, 0.565, 0.505),
    new THREE.MeshBasicMaterial({ color: p.paper }),
  );
  root.add(tape);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.23, 0.13),
    new THREE.MeshBasicMaterial({ color: p.paper }),
  );
  label.position.set(0.17, 0.02, 0.256);
  root.add(label);
  return root;
}
export function makePlant(p: Palette) {
  const root = new THREE.Group();
  root.name = "Paper plant";
  const pot = outlinedBox(0.38, 0.4, 0.32, p.accent, p.softInk, 0.007);
  pot.position.y = 0.2;
  root.add(pot);
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.016, 0.6, 6),
    new THREE.MeshBasicMaterial({ color: p.trim }),
  );
  stem.position.y = 0.68;
  root.add(stem);
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.3, 0.03, 0.33, 0.23);
    s.quadraticCurveTo(0.08, 0.32, 0, 0);
    const geometry = new THREE.ExtrudeGeometry(s, {
      depth: 0.018,
      bevelEnabled: false,
      curveSegments: 10,
    });
    const leaf = new THREE.Mesh(
      geometry,
      new THREE.MeshToonMaterial({
        color: i % 2 ? p.accent : p.trim,
        side: THREE.DoubleSide,
      }),
    );
    leaf.position.set(0, 0.45 + i * 0.12, 0);
    leaf.rotation.z = i % 2 ? -0.3 : 1.7;
    root.add(leaf);
  }
  return root;
}
