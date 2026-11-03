/** Original shallow-volume courier rig. See references/reports/CHARACTERS.md for evidence. */
import * as THREE from "three";
import {
  CHARACTER_PALETTE,
  CharacterPalette,
  makeFaceTexture,
  makeTunicTexture,
  Mood,
} from "./characterDrawing";
export type { Mood, CharacterPalette } from "./characterDrawing";
export type Gesture = "rest" | "point" | "wave" | "shrug" | "hold";
export type CharacterPose = {
  frame: number;
  mood?: Mood;
  talking?: number;
  gesture?: Gesture;
  walk?: number;
  phase?: number;
  gaze?: [number, number];
  bodyDepth?: number;
  holdFrames?: number;
  lean?: number;
  headTurn?: number;
};
export type CharacterOptions = {
  bodyDepth?: number;
  palette?: Partial<CharacterPalette>;
  holdFrames?: number;
};
export const CHARACTER_METRICS = {
  height: 2.4,
  headCenter: 1.82,
  headWidth: 1.26,
  headHeight: 0.94,
  stride: 0.64,
  stanceFraction: 0.6,
};
const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const tau = Math.PI * 2;
const shape = (draw: (s: THREE.Shape) => void) => {
  const s = new THREE.Shape();
  draw(s);
  return s;
};
const oval = (rx: number, ry: number) =>
  shape((s) => {
    s.absellipse(0, 0, rx, ry, 0, tau, false, 0);
  });
const capsule = (width: number, length: number) =>
  shape((s) => {
    const r = width / 2;
    s.moveTo(-r, -r);
    s.quadraticCurveTo(-r, 0, 0, 0);
    s.quadraticCurveTo(r, 0, r, -r);
    s.lineTo(r, -length + r);
    s.quadraticCurveTo(r, -length, 0, -length);
    s.quadraticCurveTo(-r, -length, -r, -length + r);
    s.closePath();
  });
const headShape = () =>
  shape((s) => {
    s.moveTo(-0.62, 0);
    s.bezierCurveTo(-0.64, 0.26, -0.34, 0.47, 0.08, 0.46);
    s.bezierCurveTo(0.44, 0.46, 0.64, 0.26, 0.62, -0.05);
    s.bezierCurveTo(0.6, -0.32, 0.35, -0.47, -0.05, -0.46);
    s.bezierCurveTo(-0.42, -0.44, -0.63, -0.26, -0.62, 0);
    s.closePath();
  });
const torsoShape = () =>
  shape((s) => {
    s.moveTo(-0.2, 0.43);
    s.quadraticCurveTo(-0.33, 0.42, -0.37, 0.22);
    s.quadraticCurveTo(-0.44, -0.08, -0.35, -0.42);
    s.quadraticCurveTo(0, -0.49, 0.35, -0.42);
    s.quadraticCurveTo(0.43, -0.08, 0.35, 0.22);
    s.quadraticCurveTo(0.3, 0.42, 0.18, 0.43);
    s.closePath();
  });
const hairShape = () =>
  shape((s) => {
    s.moveTo(-0.28, 0.38);
    s.bezierCurveTo(-0.32, 0.51, -0.19, 0.57, -0.1, 0.52);
    s.bezierCurveTo(-0.14, 0.65, 0.07, 0.64, 0.11, 0.51);
    s.bezierCurveTo(0.22, 0.57, 0.32, 0.47, 0.28, 0.36);
    s.bezierCurveTo(0.18, 0.4, 0.09, 0.42, 0.035, 0.38);
    s.bezierCurveTo(-0.07, 0.44, -0.17, 0.42, -0.28, 0.38);
    s.closePath();
  });
// Purposeful hand swaps keep a pointing action readable even in a small portrait frame.
const pointingHand = () =>
  shape((s) => {
    s.moveTo(-0.1, 0.11);
    s.quadraticCurveTo(-0.16, 0.04, -0.11, -0.07);
    s.lineTo(-0.055, -0.1);
    s.lineTo(-0.055, -0.29);
    s.quadraticCurveTo(-0.055, -0.34, -0.015, -0.34);
    s.quadraticCurveTo(0.025, -0.34, 0.025, -0.29);
    s.lineTo(0.025, -0.11);
    s.quadraticCurveTo(0.11, -0.13, 0.12, -0.045);
    s.quadraticCurveTo(0.18, 0.04, 0.1, 0.09);
    s.quadraticCurveTo(0.02, 0.16, -0.1, 0.11);
    s.closePath();
  });
const openHand = () =>
  shape((s) => {
    s.moveTo(-0.08, 0.12);
    s.lineTo(-0.12, 0.04);
    s.lineTo(-0.2, 0.02);
    s.quadraticCurveTo(-0.25, -0.005, -0.21, -0.055);
    s.lineTo(-0.13, -0.025);
    s.lineTo(-0.14, -0.19);
    s.quadraticCurveTo(-0.13, -0.25, -0.09, -0.22);
    s.lineTo(-0.075, -0.08);
    s.lineTo(-0.07, -0.27);
    s.quadraticCurveTo(-0.035, -0.32, 0, -0.27);
    s.lineTo(0, -0.09);
    s.lineTo(0.015, -0.3);
    s.quadraticCurveTo(0.055, -0.34, 0.085, -0.29);
    s.lineTo(0.075, -0.08);
    s.lineTo(0.11, -0.23);
    s.quadraticCurveTo(0.15, -0.27, 0.17, -0.21);
    s.lineTo(0.15, 0.04);
    s.quadraticCurveTo(0.14, 0.12, 0.08, 0.13);
    s.closePath();
  });

export function makeCharacter(options: CharacterOptions = {}) {
  const palette = { ...CHARACTER_PALETTE, ...options.palette };
  const root = new THREE.Group();
  root.name = "Original courier / shallow cel volume";
  const poseRoot = new THREE.Group();
  root.add(poseRoot);
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const depthParts: { group: THREE.Group; ratio: number }[] = [];
  const ink = new THREE.MeshBasicMaterial({
    color: palette.ink,
    side: THREE.BackSide,
    toneMapped: false,
  });
  materials.push(ink);
  const front = (color: string) => {
    const m = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    materials.push(m);
    return m;
  };
  const side = (color: string) => {
    const m = new THREE.MeshLambertMaterial({
      color: new THREE.Color(color).multiplyScalar(0.82),
    });
    materials.push(m);
    return m;
  };
  function part(
    name: string,
    s: THREE.Shape,
    color: string,
    ratio = 1,
    outline = 1.045,
  ) {
    const group = new THREE.Group();
    group.name = name;
    const geometry = new THREE.ExtrudeGeometry(s, {
      depth: 1,
      bevelEnabled: false,
      curveSegments: 20,
      steps: 1,
    });
    geometry.translate(0, 0, -0.5);
    geometries.push(geometry);
    const border = new THREE.Mesh(geometry, ink);
    border.scale.set(outline, outline, 1.08);
    border.castShadow = true;
    group.add(border);
    const solid = new THREE.Mesh(geometry, [front(color), side(color)]);
    solid.castShadow = true;
    solid.receiveShadow = true;
    group.add(solid);
    depthParts.push({ group, ratio });
    return group;
  }
  const torso = part("Rounded teal tunic", torsoShape(), palette.shirt, 1.25);
  torso.position.y = 0.94;
  poseRoot.add(torso);
  const tunicTexture = makeTunicTexture(palette);
  textures.push(tunicTexture);
  const tunicGeo = new THREE.PlaneGeometry(1.1, 1.1);
  geometries.push(tunicGeo);
  const tunicMat = new THREE.MeshBasicMaterial({
    map: tunicTexture,
    transparent: true,
    depthWrite: false,
    alphaTest: 0.01,
    toneMapped: false,
  });
  materials.push(tunicMat);
  const tunicMarks = new THREE.Mesh(tunicGeo, tunicMat);
  tunicMarks.position.z = 0.56;
  torso.add(tunicMarks);

  const headPivot = new THREE.Group();
  headPivot.position.y = CHARACTER_METRICS.headCenter;
  poseRoot.add(headPivot);
  const head = part("Wide oval head", headShape(), palette.skin, 1.05);
  headPivot.add(head);
  const hair = part(
    "Distinctive charcoal double curl",
    hairShape(),
    palette.hair,
    0.65,
    1.055,
  );
  hair.position.z = 0.03;
  headPivot.add(hair);
  const face = makeFaceTexture(palette);
  textures.push(face.texture);
  const faceGeo = new THREE.PlaneGeometry(1.4, 1.05);
  geometries.push(faceGeo);
  const faceMat = new THREE.MeshBasicMaterial({
    map: face.texture,
    transparent: true,
    depthWrite: false,
    alphaTest: 0.01,
    toneMapped: false,
  });
  materials.push(faceMat);
  const facePlate = new THREE.Mesh(faceGeo, faceMat);
  facePlate.position.z = 0.565;
  head.add(facePlate);

  const legs = [-1, 1].map((sign) => {
    const leg = part(
      sign < 0 ? "Left trouser leg" : "Right trouser leg",
      capsule(0.25, 0.45),
      palette.trousers,
      0.9,
    );
    const foot = part(
      sign < 0 ? "Left rounded shoe" : "Right rounded shoe",
      oval(0.2, 0.11),
      palette.shoes,
      1.2,
    );
    poseRoot.add(leg, foot);
    return { sign, leg, foot };
  });
  const arms = [-1, 1].map((sign) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(sign * 0.34, 1.27, 0.005);
    poseRoot.add(shoulder);
    const upper = part(
      sign < 0 ? "Left upper sleeve" : "Right upper sleeve",
      capsule(0.26, 0.38),
      palette.shirt,
      0.95,
    );
    const elbow = new THREE.Group();
    elbow.position.y = -0.29;
    const lower = part(
      sign < 0 ? "Left lower sleeve" : "Right lower sleeve",
      capsule(0.24, 0.32),
      palette.shirt,
      0.95,
    );
    const hand = new THREE.Group();
    hand.name = sign < 0 ? "Left hand pose swaps" : "Right hand pose swaps";
    const handShapes = {
      rest: part("Mitten", oval(0.13, 0.145), palette.skin, 1.05),
      point: part("Index finger", pointingHand(), palette.skin, 1.05),
      open: part("Spread fingers", openHand(), palette.skin, 1.05),
    };
    hand.add(...Object.values(handShapes));
    hand.position.set(0, -0.31, 0.025);
    hand.scale.x = sign;
    elbow.add(lower, hand);
    shoulder.add(upper, elbow);
    const anchor = new THREE.Group();
    anchor.name = sign < 0 ? "Left hand attachment" : "Right hand attachment";
    anchor.position.set(0, -0.34, 0.08);
    elbow.add(anchor);
    return { sign, shoulder, elbow, anchor, hand, handShapes };
  });
  // A projected soft contact mark; caller may also use the world's shadow map.
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const sc = shadowCanvas.getContext("2d")!;
  const grad = sc.createRadialGradient(64, 64, 7, 64, 64, 60);
  grad.addColorStop(0, "rgba(18,20,33,0.28)");
  grad.addColorStop(1, "rgba(18,20,33,0)");
  sc.fillStyle = grad;
  sc.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  textures.push(shadowTex);
  const shadowGeo = new THREE.PlaneGeometry(1.0, 0.48);
  geometries.push(shadowGeo);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  materials.push(shadowMat);
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.009;
  root.add(shadow);

  function update(pose: CharacterPose) {
    const hold = Math.max(
      1,
      Math.round(pose.holdFrames ?? options.holdFrames ?? 2),
    );
    const f = Math.floor(pose.frame / hold) * hold;
    const walk = clamp(pose.walk ?? 0),
      phase = pose.phase ?? (f / 24) * tau,
      mood = pose.mood ?? "neutral",
      gesture = pose.gesture ?? "rest";
    const depth = clamp(
      pose.bodyDepth ?? options.bodyDepth ?? 0.12,
      0.025,
      0.36,
    );
    depthParts.forEach(({ group, ratio }) => (group.scale.z = depth * ratio));
    const bob = walk * 0.02 * (1 - Math.cos(phase * 2));
    poseRoot.position.y = bob;
    poseRoot.rotation.set(0, 0, clamp(pose.lean ?? 0, -0.22, 0.22));
    headPivot.rotation.set(
      0,
      clamp(pose.headTurn ?? 0, -0.45, 0.45),
      mood === "curious" ? 0.075 : mood === "worried" ? -0.035 : 0,
    );
    // The caller's root translation remains untouched. Pass phase=travel/stride*TAU for a planted gait.
    for (const { sign, leg, foot } of legs) {
      const cycle = (((phase / tau + (sign > 0 ? 0.5 : 0)) % 1) + 1) % 1;
      const stance = cycle < 0.6;
      const u = stance ? cycle / 0.6 : (cycle - 0.6) / 0.4;
      const offset = stance
        ? 0.192 - 0.384 * u
        : -0.192 + 0.384 * (u * u * (3 - 2 * u));
      const lift = stance ? 0 : 0.115 * Math.sin(Math.PI * u);
      const x = sign * 0.19 + walk * offset,
        y = 0.11 + walk * lift - bob;
      foot.position.set(x, y, 0.045);
      foot.rotation.set(0, 0, 0);
      leg.position.set(sign * 0.19, 0.55, 0);
      leg.rotation.set(0, 0, Math.atan2(x - sign * 0.19, 0.55 - y));
      leg.scale.y = Math.hypot(x - sign * 0.19, 0.55 - y) / 0.45;
    }
    for (const { sign, shoulder, elbow, anchor, hand, handShapes } of arms) {
      // Stagger caps in Z: coincident sleeve caps otherwise produce dotted z-fighting.
      // Upper sleeves sit behind the tunic; forearms and hands can cross in front.
      shoulder.position.z = -depth * 0.5;
      elbow.position.z = depth * 0.9;
      hand.position.z = depth * 0.22;
      anchor.position.z = depth * 0.8;
      shoulder.rotation.set(
        0,
        0,
        sign * 0.13 + walk * 0.25 * Math.sin(phase + (sign > 0 ? Math.PI : 0)),
      );
      elbow.rotation.set(0, 0, sign * 0.05);
      if (gesture === "hold") {
        shoulder.rotation.z = sign * 0.4;
        elbow.rotation.z = -sign * 1.08;
      }
      if (gesture === "shrug") {
        shoulder.rotation.z = sign * 0.93;
        elbow.rotation.z = sign * 0.58;
      }
      if (gesture === "point" && sign > 0) {
        shoulder.rotation.z = 1.43;
        elbow.rotation.z = -0.13;
      }
      if (gesture === "wave" && sign > 0) {
        shoulder.rotation.z = 2.28;
        elbow.rotation.z = -0.34 + 0.16 * Math.sin((f / 24) * tau * 1.6);
      }
      const handState =
        gesture === "point" && sign > 0
          ? "point"
          : gesture === "shrug" || (gesture === "wave" && sign > 0)
            ? "open"
            : "rest";
      for (const [name, mesh] of Object.entries(handShapes))
        mesh.visible = name === handState;
    }
    const blink = mood !== "surprised" && (f + 17) % 83 < 3;
    face.draw(mood, clamp(pose.talking ?? 0), pose.gaze ?? [0, 0], blink);
    root.updateMatrixWorld(true);
  }
  update({ frame: 0 });
  return {
    root,
    update,
    leftHand: arms[0].anchor,
    rightHand: arms[1].anchor,
    metrics: CHARACTER_METRICS,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
