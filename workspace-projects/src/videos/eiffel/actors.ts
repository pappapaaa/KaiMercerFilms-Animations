import * as THREE from "three";
import { Pen, bodyFront, headBlob, INK, type Expr, type Outfit } from "./toon";
import { cardShade, CARD_K } from "./cardshade";
import { NOINK } from "./ink";

export type ActorRole = "tourist" | "guide" | "friend";
export type ActorOptions = {
  expression?: Expr;
  walking?: boolean;
  linked?: "left" | "right";
  stride?: number;
  wave?: number;
  look?: number;
  headTilt?: number;
  prop?: "camera" | "parasol" | null;
  phase?: number;
};

// Original cast. These colours and accessories distinguish the cast at phone size.
const OUTFITS: Record<ActorRole, Outfit> = {
  tourist: { jacket: "#e7a332", pants: "#344773", boots: "#382739", hat: "cap", cap: "#dc4948", skin: "#ffe4c4", buttons: "#a75a29" },
  guide: { jacket: "#397fc0", pants: "#343d56", boots: "#382739", hat: "hair", hair: "#63452f", skin: "#f2c39d", buttons: "#f2d1a3" },
  friend: { jacket: "#f4d3a8", dress: "#df6c64", pants: "#535169", boots: "#4b3346", hat: "hair", hair: "#3c2836", skin: "#dca57d" },
};
const SEEDS: Record<ActorRole, number> = { tourist: 15, guide: 27, friend: 42 };
const TAU = Math.PI * 2;

function canvasTexture(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The character renderer requires a Canvas2D context.");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return { canvas, context, texture };
}

/** A lit ink drawing with a real alpha-cut silhouette in the sun's shadow map. */
function litCard(geometry: THREE.BufferGeometry, texture: THREE.Texture) {
  const material = cardShade(new THREE.MeshLambertMaterial({
    map: texture, alphaTest: 0.4, side: THREE.DoubleSide,
  }));
  const mesh = new THREE.Mesh(geometry, material);
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking, map: texture, alphaTest: 0.4, side: THREE.DoubleSide,
  });
  mesh.layers.set(NOINK);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.renderOrder = 1;
  mesh.onBeforeRender = (renderer) => {
    const target = renderer.getRenderTarget();
    CARD_K.uPx.value = (target ? target.height : renderer.domElement.height) / 1920;
  };
  return mesh;
}

function drawCamera(p: Pen, frame: number, seed: number) {
  // Neck strap and compact vintage camera. Keeping it below the chin preserves
  // the face and makes the shutter action readable without an obstructing arm.
  const y = 493 + 3 * Math.sin(frame / 24 + seed);
  p.stroke([[263, 412], [257, y + 9]], 7, "#45334b");
  p.stroke([[335, 412], [345, y + 9]], 7, "#45334b");
  p.poly([[236, y - 5], [264, y - 5], [272, y - 19], [315, y - 19], [327, y - 5], [359, y - 5], [363, y + 70], [236, y + 70]], "#4d6176", 8);
  p.poly([[242, y + 11], [356, y + 11], [356, y + 62], [242, y + 62]], "#314558", 0);
  p.ell(301, y + 34, 31, 31, "#b4c6cf", 7);
  p.ell(301, y + 34, 19, 19, "#203447", 5);
  p.ell(305, y + 29, 7, 7, "#759ca9", 0);
  p.poly([[329, y + 8], [349, y + 8], [349, y + 19], [329, y + 19]], "#f3dfa5", 3);
  p.stroke([[342, y - 10], [353, y - 10]], 9, "#d1514c");
}

function drawParasol(context: CanvasRenderingContext2D) {
  const p = new Pen(context);
  p.ol = 5;
  // A complete umbrella silhouette: finial, four alternating cloth panels,
  // rounded scallops, visible ribs, a shaft and hooked handle. No cropped dome.
  p.stroke([[300, 54], [300, 443]], 8, "#6e492f");
  p.arc(282, 443, 18, 21, 0, 180, 8, "#6e492f");
  const top: [number, number] = [300, 51];
  const edgeX = [46, 166, 300, 434, 554];
  for (let i = 0; i < 4; i++) {
    const x0 = edgeX[i], x1 = edgeX[i + 1];
    const g = context;
    g.beginPath(); g.moveTo(...top);
    g.quadraticCurveTo(x0 + (300 - x0) * 0.12, 86, x0, 229);
    g.quadraticCurveTo((x0 + x1) / 2, 202, x1, 229);
    g.quadraticCurveTo(x1 + (300 - x1) * 0.12, 86, 300, 51);
    g.closePath();
    g.fillStyle = i % 2 ? "#f7d9a3" : "#df6660"; g.fill();
    g.lineWidth = 6; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke();
  }
  p.stroke([[300, 34], [300, 52]], 7);
  p.dot(300, 33, 5, "#e7b468");
}

/**
 * One deterministic, upright camera-facing drawing. The root's origin is at
 * the soles; the root's translation, scale and rotation belong to the caller.
 * update() only turns the inner billboard and redraws its pose.
 */
export class Actor {
  readonly root = new THREE.Group();
  private readonly facing = new THREE.Group();
  private readonly body = canvasTexture(600, 1000);
  private readonly pen = new Pen(this.body.context);
  private readonly card: THREE.Mesh;
  private readonly umbrella: THREE.Mesh;
  private readonly shadow: THREE.Mesh;
  private readonly umbrellaTexture: THREE.CanvasTexture;
  private readonly shadowTexture: THREE.CanvasTexture;
  private readonly role: ActorRole;
  private readonly seed: number;
  private readonly worldPosition = new THREE.Vector3();
  private readonly cameraPosition = new THREE.Vector3();
  private readonly inverseRotation = new THREE.Quaternion();
  private lastDrawing = "";

  constructor(role: ActorRole, height = 2.4) {
    this.role = role; this.seed = SEEDS[role];
    this.root.name = `Actor-${role}`;
    // This is actual crown-to-sole height, rather than the height of the padded
    // source image. The source uses 3.5 head heights and soles at pixel 975.
    const sourceHeight = 2 * headBlob(this.seed).b * 3.5;
    const unit = height / sourceHeight;
    const geometry = new THREE.PlaneGeometry(600 * unit, 1000 * unit);
    geometry.translate(0, 475 * unit, 0);
    this.card = litCard(geometry, this.body.texture);
    this.facing.add(this.card);

    const parasol = canvasTexture(600, 500);
    drawParasol(parasol.context);
    parasol.texture.needsUpdate = true;
    this.umbrellaTexture = parasol.texture;
    this.umbrella = litCard(new THREE.PlaneGeometry(height * 0.92, height * 0.92 * 5 / 6), parasol.texture);
    this.umbrella.position.set(height * 0.24, height * 0.91, 0.014);
    this.umbrella.visible = false;
    this.facing.add(this.umbrella);
    this.root.add(this.facing);

    const blob = canvasTexture(128, 128);
    const gradient = blob.context.createRadialGradient(64, 64, 4, 64, 64, 61);
    gradient.addColorStop(0, "rgba(45, 31, 74, 0.36)");
    gradient.addColorStop(0.35, "rgba(45, 31, 74, 0.22)");
    gradient.addColorStop(1, "rgba(45, 31, 74, 0)");
    blob.context.fillStyle = gradient;
    blob.context.fillRect(0, 0, 128, 128);
    blob.texture.needsUpdate = true;
    blob.texture.generateMipmaps = false;
    blob.texture.minFilter = THREE.LinearFilter;
    this.shadowTexture = blob.texture;
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(height * 0.55, height * 0.35),
      new THREE.MeshBasicMaterial({ map: blob.texture, transparent: true, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 }));
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.012;
    this.shadow.layers.set(NOINK);
    this.shadow.renderOrder = 0.5;
    this.root.add(this.shadow);
  }

  update(frame: number, camera: THREE.Camera, opts: ActorOptions = {}) {
    this.root.updateWorldMatrix(true, false);
    this.root.getWorldPosition(this.worldPosition);
    camera.getWorldPosition(this.cameraPosition);
    this.cameraPosition.sub(this.worldPosition);
    this.root.getWorldQuaternion(this.inverseRotation).invert();
    this.cameraPosition.applyQuaternion(this.inverseRotation);
    this.facing.rotation.y = Math.atan2(this.cameraPosition.x, this.cameraPosition.z);

    const walking = opts.walking ?? false;
    const phase = opts.phase ?? (frame / 23 + this.seed * 0.17);
    // Four-frame blinks, with a different deterministic schedule for each actor.
    const blinkCycle = 53 + (this.seed % 17);
    const blinkAt = ((Math.floor(frame) + this.seed * 7) % blinkCycle + blinkCycle) % blinkCycle;
    const blink = blinkAt < 4 ? [0.45, 1, 1, 0.45][blinkAt] : 0;
    const microTilt = 0.65 * Math.sin(frame / 31 + this.seed) + 0.25 * Math.sin(frame / 13);
    const headTilt = (opts.headTilt ?? 0) + microTilt;
    const tilt = walking ? 2.5 : 0.3 * Math.sin(frame / 36 + this.seed);
    const look = opts.look ?? (0.2 * Math.sin(frame / 65 + this.seed));
    const expression = opts.expression ?? "neutral";
    const key = JSON.stringify([frame, expression, walking, phase, opts.wave, look, headTilt, opts.prop, opts.linked, opts.stride]);
    if (key !== this.lastDrawing) {
      const g = this.body.context;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, 600, 1000);
      this.pen.rot = null;
      bodyFront(this.pen, OUTFITS[this.role], {
        mode: walking ? "stroll" : "stand", phase,
        expr: expression, blink, look, tilt, headTilt,
        wave: opts.wave, linked: opts.linked, seed: this.seed, lift: opts.stride ?? 78,
        light: -Math.PI / 3,
      });
      if (opts.prop === "camera") drawCamera(this.pen, frame, this.seed);
      if (opts.prop === "parasol") {
        // A hand at the shaft visibly connects the umbrella to its holder.
        this.pen.stroke([[365, 447], [420, 492], [474, 480]], 12, "#67513e");
        this.pen.dot(474, 480, 12);
      }
      this.body.texture.needsUpdate = true;
      this.lastDrawing = key;
    }
    this.umbrella.visible = opts.prop === "parasol";
    this.umbrella.rotation.z = 0.025 * Math.sin(frame / 27 + this.seed);
    const shadowScale = walking ? 0.98 + 0.05 * Math.cos(TAU * 2 * phase) : 1;
    this.shadow.scale.set(shadowScale, shadowScale, 1);
  }

  dispose() {
    for (const mesh of [this.card, this.umbrella, this.shadow]) {
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((m) => m.dispose());
      mesh.customDepthMaterial?.dispose();
    }
    this.body.texture.dispose();
    this.umbrellaTexture.dispose();
    this.shadowTexture.dispose();
    this.root.clear();
  }
}
