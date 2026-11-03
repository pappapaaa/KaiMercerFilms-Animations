/**
 * Permanent editable rig for the user's selected Character C.
 * Front and modest three-quarter views (about +/-20 degrees); not a full turnaround rig.
 * Caller owns root placement. Every pose is computed directly from the requested frame.
 */
import * as THREE from "three";
import {
  MAIN_CHARACTER_PALETTE,
  MainCharacterPalette,
  MainCharacterMood,
  traceMainHead,
  traceMainHair,
  traceMainSweater,
  makeMainFace,
  makeMainHairPaint,
  makeMainSweaterPaint,
  makeMainSneakerPaint,
  makeMainTrouserPaint,
} from "./mainCharacterDrawing";
export { MAIN_CHARACTER_PALETTE } from "./mainCharacterDrawing";
export type {
  MainCharacterPalette,
  MainCharacterMood,
} from "./mainCharacterDrawing";

export type MainCharacterGesture = "rest" | "point" | "wave" | "shrug" | "hold";
export type MainCharacterPose = {
  frame: number;
  mood?: MainCharacterMood;
  talking?: number;
  gesture?: MainCharacterGesture;
  walk?: number;
  phase?: number;
  gaze?: [number, number];
  bodyDepth?: number;
  holdFrames?: number;
  lean?: number;
  headTurn?: number;
};
export type MainCharacterOptions = {
  bodyDepth?: number;
  palette?: Partial<MainCharacterPalette>;
  holdFrames?: number;
};
export const MAIN_CHARACTER_METRICS = {
  height: 2.5,
  headCenter: 1.89,
  headWidth: 0.88,
  headHeight: 0.69,
  hairWidth: 1.37,
  headScale: 0.88,
  stride: 0.64,
  stanceFraction: 0.6,
  maxHeadTurn: Math.PI / 9,
};
const tau = Math.PI * 2;
const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const shape = (draw: (s: THREE.Shape) => void) => {
  const s = new THREE.Shape();
  draw(s);
  return s;
};
const oval = (rx: number, ry: number) =>
  shape((s) => {
    s.absellipse(0, 0, rx, ry, 0, tau, false, 0);
    s.closePath();
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
const trouserShape = () =>
  shape((s) => {
    s.moveTo(-0.14, 0.015);
    s.lineTo(0.145, 0.015);
    s.quadraticCurveTo(0.13, -0.3, 0.14, -0.56);
    s.quadraticCurveTo(0.18, -0.64, 0.12, -0.67);
    s.lineTo(-0.13, -0.67);
    s.quadraticCurveTo(-0.175, -0.64, -0.145, -0.58);
    s.lineTo(-0.14, 0.015);
    s.closePath();
  });
const sneakerShape = () =>
  shape((s) => {
    s.moveTo(-0.225, -0.083);
    s.quadraticCurveTo(-0.235, 0.055, -0.125, 0.112);
    s.quadraticCurveTo(-0.055, 0.145, 0.05, 0.105);
    s.quadraticCurveTo(0.19, 0.075, 0.225, -0.018);
    s.lineTo(0.225, -0.083);
    s.quadraticCurveTo(0.01, -0.112, -0.225, -0.083);
    s.closePath();
  });
const relaxedHand = () =>
  shape((s) => {
    s.moveTo(-0.075, 0.085);
    s.quadraticCurveTo(-0.14, 0.025, -0.15, -0.09);
    s.quadraticCurveTo(-0.15, -0.17, -0.085, -0.145);
    s.lineTo(-0.05, -0.08);
    s.quadraticCurveTo(-0.09, -0.25, 0.015, -0.235);
    s.quadraticCurveTo(0.12, -0.235, 0.15, -0.12);
    s.quadraticCurveTo(0.185, 0.0, 0.1, 0.085);
    s.closePath();
  });
const hipHand = () =>
  shape((s) => {
    s.moveTo(-0.085, 0.085);
    s.quadraticCurveTo(-0.16, 0.02, -0.14, -0.08);
    s.quadraticCurveTo(-0.13, -0.15, -0.04, -0.12);
    s.quadraticCurveTo(0.03, -0.23, 0.105, -0.17);
    s.quadraticCurveTo(0.15, -0.12, 0.07, -0.065);
    s.quadraticCurveTo(0.2, -0.1, 0.18, -0.025);
    s.quadraticCurveTo(0.16, 0.04, 0.1, 0.08);
    s.closePath();
  });
const pointingHand = () =>
  shape((s) => {
    s.moveTo(-0.09, 0.08);
    s.quadraticCurveTo(-0.15, 0.01, -0.1, -0.08);
    s.lineTo(-0.05, -0.105);
    s.lineTo(-0.05, -0.29);
    s.quadraticCurveTo(-0.05, -0.34, -0.01, -0.34);
    s.quadraticCurveTo(0.03, -0.34, 0.03, -0.29);
    s.lineTo(0.03, -0.1);
    s.quadraticCurveTo(0.12, -0.125, 0.135, -0.025);
    s.quadraticCurveTo(0.16, 0.06, 0.09, 0.09);
    s.closePath();
  });
const openHand = () =>
  shape((s) => {
    s.moveTo(-0.08, 0.1);
    s.lineTo(-0.12, 0.02);
    s.lineTo(-0.2, 0);
    s.quadraticCurveTo(-0.245, -0.03, -0.205, -0.07);
    s.lineTo(-0.125, -0.045);
    s.lineTo(-0.14, -0.2);
    s.quadraticCurveTo(-0.13, -0.25, -0.09, -0.22);
    s.lineTo(-0.075, -0.095);
    s.lineTo(-0.07, -0.27);
    s.quadraticCurveTo(-0.035, -0.32, 0, -0.27);
    s.lineTo(0, -0.1);
    s.lineTo(0.015, -0.3);
    s.quadraticCurveTo(0.055, -0.34, 0.085, -0.29);
    s.lineTo(0.075, -0.09);
    s.lineTo(0.11, -0.23);
    s.quadraticCurveTo(0.15, -0.27, 0.17, -0.21);
    s.lineTo(0.15, 0.02);
    s.quadraticCurveTo(0.14, 0.1, 0.08, 0.11);
    s.closePath();
  });

/** Offset a sampled vector contour to keep roughly constant ink width across head and sleeves. */
function expandedShape(original: THREE.Shape, margin: number) {
  const raw = original.getPoints(24),
    points: THREE.Vector2[] = [];
  for (const point of raw)
    if (
      !points.length ||
      point.distanceToSquared(points[points.length - 1]) > 1e-10
    )
      points.push(point);
  if (points[0].distanceToSquared(points[points.length - 1]) < 1e-10)
    points.pop();
  let signed = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    signed += a.x * b.y - b.x * a.y;
  }
  const orientation = signed >= 0 ? 1 : -1;
  const out = points.map((point, i) => {
    const a = point
      .clone()
      .sub(points[(i + points.length - 1) % points.length])
      .normalize();
    const b = points[(i + 1) % points.length].clone().sub(point).normalize();
    const n1 = new THREE.Vector2(a.y * orientation, -a.x * orientation),
      n2 = new THREE.Vector2(b.y * orientation, -b.x * orientation);
    const bisector = n1.clone().add(n2).normalize();
    const amount = Math.min(
      margin / Math.max(0.3, bisector.dot(n1)),
      margin * 2.1,
    );
    return point.clone().addScaledVector(bisector, amount);
  });
  return new THREE.Shape(out);
}

export function makeMainCharacter(options: MainCharacterOptions = {}) {
  const p = { ...MAIN_CHARACTER_PALETTE, ...options.palette };
  const root = new THREE.Group();
  root.name = "Main character C / approved identity";
  const poseRoot = new THREE.Group();
  root.add(poseRoot);
  const geometries: THREE.BufferGeometry[] = [],
    materials: THREE.Material[] = [],
    textures: THREE.Texture[] = [];
  const depthParts: { group: THREE.Group; ratio: number }[] = [];
  const ink = new THREE.MeshBasicMaterial({ color: p.ink, toneMapped: false });
  materials.push(ink);
  const frontMaterial = (color: string) => {
    const m = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    materials.push(m);
    return m;
  };
  const sideMaterial = (color: string) => {
    const m = new THREE.MeshLambertMaterial({
      color: new THREE.Color(color).multiplyScalar(0.83),
    });
    materials.push(m);
    return m;
  };
  function part(
    name: string,
    s: THREE.Shape,
    color: string,
    ratio = 1,
    margin = 0.01,
  ) {
    const group = new THREE.Group();
    group.name = name;
    const outline = new THREE.ExtrudeGeometry(expandedShape(s, margin), {
      depth: 1.08,
      bevelEnabled: false,
      curveSegments: 24,
      steps: 1,
    });
    outline.translate(0, 0, -0.58);
    geometries.push(outline);
    const outer = new THREE.Mesh(outline, ink);
    outer.castShadow = true;
    group.add(outer);
    // A real depth separation prevents the ink cap and the color cap from z-fighting.
    const geometry = new THREE.ExtrudeGeometry(s, {
      depth: 1,
      bevelEnabled: false,
      curveSegments: 24,
      steps: 1,
    });
    geometry.translate(0, 0, -0.46);
    geometries.push(geometry);
    const solid = new THREE.Mesh(geometry, [
      frontMaterial(color),
      sideMaterial(color),
    ]);
    solid.castShadow = true;
    group.add(solid);
    depthParts.push({ group, ratio });
    return group;
  }
  function decal(
    parent: THREE.Group,
    texture: THREE.Texture,
    width: number,
    height: number,
    y = 0,
    z = 0.565,
  ) {
    textures.push(texture);
    const geometry = new THREE.PlaneGeometry(width, height);
    geometries.push(geometry);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      alphaTest: 0.015,
      toneMapped: false,
    });
    materials.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, y, z);
    parent.add(mesh);
    return mesh;
  }

  const torso = part(
    "Mustard crewneck sweater",
    shape(traceMainSweater),
    p.sweater,
    1.25,
    0.011,
  );
  torso.position.y = 1.16;
  poseRoot.add(torso);
  decal(torso, makeMainSweaterPaint(p), 0.9, 0.9);
  const neck = part("Warm peach neck", capsule(0.18, 0.17), p.skin, 0.9, 0.009);
  neck.position.set(0, 1.63, -0.012);
  poseRoot.add(neck);

  const headPivot = new THREE.Group();
  headPivot.position.y = MAIN_CHARACTER_METRICS.headCenter;
  headPivot.scale.setScalar(MAIN_CHARACTER_METRICS.headScale);
  poseRoot.add(headPivot);
  const ears = [
    { x: -0.525, y: -0.13, rx: 0.145, ry: 0.135 },
    { x: 0.48, y: -0.11, rx: 0.1, ry: 0.125 },
  ].map((e, i) => {
    const ear = part(
      i === 0 ? "Near ear" : "Far ear",
      oval(e.rx, e.ry),
      p.skin,
      0.75,
      0.011,
    );
    ear.position.set(e.x, e.y, -0.012);
    headPivot.add(ear);
    return ear;
  });
  const head = part(
    "Broad rounded-square peach head",
    shape(traceMainHead),
    p.skin,
    1.0,
    0.012,
  );
  headPivot.add(head);
  const face = makeMainFace(p);
  decal(head, face.texture, 1.6, 1.2);
  const hair = part(
    "Asymmetric side-swept espresso spikes",
    shape(traceMainHair),
    p.hair,
    0.68,
    0.01,
  );
  headPivot.add(hair);
  decal(hair, makeMainHairPaint(p), 1.6, 1.0, 0.23);

  const legs = [-1, 1].map((sign) => {
    const leg = part(
      sign < 0 ? "Left plum trouser leg" : "Right plum trouser leg",
      trouserShape(),
      p.trousers,
      0.95,
      0.01,
    );
    decal(leg, makeMainTrouserPaint(p), 0.36, 0.76, -0.34);
    const foot = part(
      sign < 0 ? "Left cream sneaker" : "Right cream sneaker",
      sneakerShape(),
      p.shoes,
      1.3,
      0.01,
    );
    decal(foot, makeMainSneakerPaint(p), 0.5, 0.3);
    foot.scale.x = sign;
    poseRoot.add(leg, foot);
    return { sign, leg, foot };
  });
  const arms = [-1, 1].map((sign) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(sign * 0.285, 1.43, 0);
    poseRoot.add(shoulder);
    const upper = part(
      sign < 0 ? "Left sweater sleeve" : "Right sweater sleeve",
      capsule(0.275, 0.38),
      p.sweater,
      0.95,
      0.01,
    );
    const elbow = new THREE.Group();
    elbow.position.y = -0.29;
    const lower = part(
      "Forearm sleeve",
      capsule(0.25, 0.34),
      p.sweater,
      0.95,
      0.01,
    );
    const cuff = part(
      "Cream ribbed cuff",
      capsule(0.265, 0.105),
      p.trim,
      1.05,
      0.009,
    );
    cuff.position.y = -0.255;
    const hand = new THREE.Group();
    hand.name = sign < 0 ? "Left hand shapes" : "Right hand shapes";
    hand.position.y = -0.35;
    hand.scale.x = sign;
    const handShapes = {
      rest: part("Relaxed fingers", relaxedHand(), p.skin, 1, 0.009),
      hip: part("Hand on hip", hipHand(), p.skin, 1, 0.009),
      point: part("Pointing index", pointingHand(), p.skin, 1, 0.009),
      open: part("Open fingers", openHand(), p.skin, 1, 0.009),
    };
    hand.add(...Object.values(handShapes));
    elbow.add(lower, cuff, hand);
    shoulder.add(upper, elbow);
    const anchor = new THREE.Group();
    anchor.name = sign < 0 ? "Left hand attachment" : "Right hand attachment";
    anchor.position.y = -0.39;
    elbow.add(anchor);
    return { sign, shoulder, elbow, cuff, hand, handShapes, anchor };
  });

  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const sc = shadowCanvas.getContext("2d")!;
  const gradient = sc.createRadialGradient(64, 64, 7, 64, 64, 61);
  gradient.addColorStop(0, "rgba(34,27,24,.24)");
  gradient.addColorStop(1, "rgba(34,27,24,0)");
  sc.fillStyle = gradient;
  sc.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  textures.push(shadowTexture);
  const shadowGeometry = new THREE.PlaneGeometry(0.95, 0.43);
  geometries.push(shadowGeometry);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  materials.push(shadowMaterial);
  const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.007;
  root.add(shadow);

  function update(pose: MainCharacterPose) {
    const hold = Math.max(
        1,
        Math.round(pose.holdFrames ?? options.holdFrames ?? 2),
      ),
      frame = Math.floor(pose.frame / hold) * hold;
    const walk = clamp(pose.walk ?? 0),
      phase = pose.phase ?? (frame / 24) * tau,
      gesture = pose.gesture ?? "rest",
      mood = pose.mood ?? "neutral";
    const depth = clamp(
      pose.bodyDepth ?? options.bodyDepth ?? 0.12,
      0.025,
      0.28,
    );
    depthParts.forEach(({ group, ratio }) => (group.scale.z = depth * ratio));
    hair.position.z = depth * 0.6;
    ears.forEach((ear) => (ear.position.z = -depth * 0.1));
    neck.position.z = -depth * 0.1;
    const bob = walk * 0.018 * (1 - Math.cos(phase * 2));
    poseRoot.position.y = bob;
    poseRoot.rotation.set(0, 0, clamp(pose.lean ?? 0, -0.16, 0.16));
    headPivot.rotation.set(
      0,
      clamp(pose.headTurn ?? 0, -Math.PI / 9, Math.PI / 9),
      mood === "curious" ? -0.035 : mood === "worried" ? 0.025 : 0,
    );
    for (const { sign, leg, foot } of legs) {
      const cycle = (((phase / tau + (sign > 0 ? 0.5 : 0)) % 1) + 1) % 1,
        stance = cycle < 0.6;
      const u = stance ? cycle / 0.6 : (cycle - 0.6) / 0.4;
      const offset = stance
        ? 0.192 - 0.384 * u
        : -0.192 + 0.384 * (u * u * (3 - 2 * u));
      const lift = stance ? 0 : 0.12 * Math.sin(Math.PI * u),
        x = sign * 0.26 + walk * offset,
        y = 0.111 + walk * lift - bob;
      foot.position.set(x, y, depth * 0.55);
      foot.rotation.set(0, 0, 0);
      leg.position.set(sign * 0.175, 0.88, 0);
      leg.rotation.set(0, 0, Math.atan2(x - sign * 0.175, 0.88 - (y + 0.025)));
      leg.scale.y = Math.hypot(x - sign * 0.175, 0.88 - (y + 0.025)) / 0.67;
    }
    for (const {
      sign,
      shoulder,
      elbow,
      cuff,
      hand,
      handShapes,
      anchor,
    } of arms) {
      // Upper sleeves behind the sweater, forearms/cuffs/hands in front: no coincident caps.
      shoulder.position.z = -depth * 0.55;
      elbow.position.z = depth;
      hand.position.z = depth * 0.35;
      cuff.position.z = depth * 0.15;
      anchor.position.z = depth * 0.93;
      shoulder.rotation.set(
        0,
        0,
        sign * 0.12 + walk * 0.23 * Math.sin(phase + (sign > 0 ? Math.PI : 0)),
      );
      elbow.rotation.set(0, 0, sign * 0.1);
      let handState: keyof typeof handShapes = "rest";
      if (gesture === "rest" && sign < 0 && walk < 0.05) {
        shoulder.rotation.z = -0.88;
        elbow.rotation.z = 1.55;
        handState = "hip";
      }
      if (gesture === "hold") {
        shoulder.rotation.z = sign * 0.4;
        elbow.rotation.z = -sign * 1.08;
      }
      if (gesture === "shrug") {
        shoulder.rotation.z = sign * 1.02;
        elbow.rotation.z = sign * 0.67;
        handState = "open";
      }
      if (gesture === "point" && sign > 0) {
        shoulder.rotation.z = 1.43;
        elbow.rotation.z = -0.13;
        handState = "point";
      }
      if (gesture === "wave" && sign > 0) {
        shoulder.rotation.z = 2.25;
        elbow.rotation.z = -0.3 + 0.13 * Math.sin((frame / 24) * tau * 1.5);
        handState = "open";
      }
      for (const [name, partGroup] of Object.entries(handShapes))
        partGroup.visible = name === handState;
    }
    const blink = mood !== "surprised" && (frame + 17) % 97 < 3;
    face.draw(mood, clamp(pose.talking ?? 0), pose.gaze ?? [0, 0], blink);
    root.updateMatrixWorld(true);
  }
  update({ frame: 0 });
  return {
    root,
    update,
    leftHand: arms[0].anchor,
    rightHand: arms[1].anchor,
    metrics: MAIN_CHARACTER_METRICS,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}
