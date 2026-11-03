/** Folder/entry name retained for compatibility with the user's requested repo shape.
 * The actual scene is a new original courier style proof, not the upstream bridge film. */
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import {
  AbsoluteFill,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { makeCharacter, CHARACTER_METRICS } from "./Character";
import { makeWorld } from "./World";
import { makeParcel } from "./Props";
import { LIGHTING, PALETTES } from "./Design";
import { cameraAt } from "./Camera";
import { shotAt } from "./Story";
import { interval, smooth, lerp, poseFrame, walkPhase } from "./Motion";
import { Atmosphere } from "./Post";

function Scene({ frame, bodyDepth }: { frame: number; bodyDepth: number }) {
  const { camera, gl, scene } = useThree(),
    shot = shotAt(frame),
    preset = shot.preset;
  const built = useMemo(() => {
    const root = new THREE.Group(),
      world = makeWorld(preset),
      character = makeCharacter({ bodyDepth, holdFrames: 2 }),
      parcel = makeParcel(PALETTES[preset]);
    root.add(world.root, character.root, parcel);
    const light = LIGHTING[preset];
    root.add(new THREE.AmbientLight(light.ambientColor, light.ambient));
    const key = new THREE.DirectionalLight(light.keyColor, light.key);
    key.position.set(...light.keyPosition);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5;
    key.shadow.camera.right = 5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -5;
    key.shadow.bias = -0.0004;
    root.add(key);
    const contact = new THREE.Mesh(
      new THREE.CircleGeometry(0.45, 32),
      new THREE.MeshBasicMaterial({
        color: "#14202a",
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
      }),
    );
    contact.rotation.x = -Math.PI / 2;
    contact.scale.set(1, 0.55, 1);
    contact.position.set(0.95, 0.008, 0.2);
    root.add(contact);
    return {
      root,
      world,
      character,
      parcel,
      dispose: () => {
        world.dispose();
        character.dispose();
        parcel.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.geometry.dispose();
            for (const m of Array.isArray(o.material)
              ? o.material
              : [o.material])
              m.dispose();
          }
        });
        contact.geometry.dispose();
        (contact.material as THREE.Material).dispose();
        key.dispose();
      },
    };
  }, [preset, bodyDepth]);
  useLayoutEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.NoToneMapping;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFShadowMap;
    scene.background = new THREE.Color(PALETTES[preset].background);
    return () => built.dispose();
  }, [built, gl, scene, preset]);
  useLayoutEffect(() => {
    const c = cameraAt(frame),
      cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...c.position);
    cam.up.set(0, 1, 0);
    cam.lookAt(...c.target);
    cam.rotateZ(c.roll);
    cam.fov = c.fov;
    cam.updateProjectionMatrix();
    const f = poseFrame(frame, 2),
      walking = frame < 56,
      travel = 1.05 * smooth(interval(f, 0, 56));
    built.character.root.position.set(
      shot.id === "arrival"
        ? lerp(-1.3, -0.25, smooth(interval(f, 0, 56)))
        : -0.25,
      0,
      0,
    );
    built.character.root.rotation.y = shot.id === "night-depth" ? 0.12 : 0;
    built.character.update({
      frame,
      mood:
        frame < 72
          ? "neutral"
          : frame < 132
            ? "curious"
            : frame < 156
              ? "surprised"
              : "happy",
      gesture:
        frame < 72
          ? "rest"
          : frame < 120
            ? "point"
            : frame < 156
              ? "shrug"
              : frame < 180
                ? "rest"
                : "wave",
      walk: walking ? 1 : 0,
      phase: walkPhase(travel, CHARACTER_METRICS.stride),
      talking: 0,
      gaze: [0.35, 0],
    });
    const bounce =
      frame >= 48 && frame < 60
        ? Math.sin(interval(f, 48, 60) * Math.PI) * 0.12
        : 0;
    built.parcel.position.set(0.95, 0.28 + bounce, 0.2);
    built.parcel.rotation.set(
      0,
      -0.16,
      frame >= 128 && frame < 136
        ? Math.sin(((f - 128) * Math.PI) / 2) * 0.025
        : 0,
    );
    built.world.update(frame);
    gl.shadowMap.needsUpdate = true;
  }, [frame, built, camera, gl, shot.id]);
  return <primitive object={built.root} />;
}
export const StyleProof: React.FC<{ bodyDepth?: number; audio?: string }> = ({
  bodyDepth = 0.12,
  audio,
}) => {
  const frame = useCurrentFrame(),
    { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#efb196" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows="percentage"
        gl={{
          antialias: true,
          stencil: false,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
        }}
        camera={{ near: 0.1, far: 100, fov: 46 }}
      >
        <Scene frame={frame} bodyDepth={bodyDepth} />
      </ThreeCanvas>
      <Atmosphere night={shotAt(frame).preset === "night"} />
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
