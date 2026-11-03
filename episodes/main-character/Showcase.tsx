/** Identity/acting test for the user-selected permanent character C. */
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import {
  makeMainCharacter,
  MAIN_CHARACTER_METRICS,
} from "../../templates/characters/MainCharacter";
import {
  smooth,
  interval,
  walkPhase,
  poseFrame,
} from "../../templates/bridge/Motion";

const cues = [
  { a: 0, b: 48, mood: "neutral", label: "DEADPAN" },
  { a: 48, b: 72, mood: "happy", label: "HAPPY" },
  { a: 72, b: 96, mood: "worried", label: "WORRIED" },
  { a: 96, b: 120, mood: "surprised", label: "SHOCKED" },
  { a: 120, b: 144, mood: "annoyed", label: "ANNOYED" },
  { a: 144, b: 168, mood: "curious", label: "THINKING" },
  { a: 168, b: 192, mood: "happy", label: "READY FOR YOUR STORIES" },
] as const;

function ActorScene({ frame }: { frame: number }) {
  const { camera, gl, scene } = useThree();
  const built = useMemo(() => {
    const root = new THREE.Group(),
      actor = makeMainCharacter({ bodyDepth: 0.12, holdFrames: 2 });
    root.add(actor.root);
    root.add(new THREE.AmbientLight("#f4f4ff", 1.4));
    const light = new THREE.DirectionalLight("#fff0db", 2);
    light.position.set(-3, 5, 6);
    root.add(light);
    return {
      root,
      actor,
      dispose: () => {
        actor.dispose();
        light.dispose();
      },
    };
  }, []);
  useLayoutEffect(() => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.NoToneMapping;
    scene.background = new THREE.Color("#fff4e3");
    return () => built.dispose();
  }, [built, gl, scene]);
  useLayoutEffect(() => {
    const cue = cues.find((c) => frame >= c.a && frame < c.b) ?? cues[6],
      close = frame >= 48 && frame < 144;
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(
      close ? 0.02 : 0.25,
      close ? 1.92 : 1.45,
      close ? 3.7 : 4.9,
    );
    cam.lookAt(frame >= 144 ? 0.18 : 0, close ? 1.9 : 1.26, 0);
    cam.fov = close ? 44 : frame >= 144 ? 50 : 38;
    cam.updateProjectionMatrix();
    const stepped = poseFrame(frame, 2),
      travel = 0.35 * smooth(interval(stepped, 144, 168));
    built.actor.root.position.set(frame >= 144 ? travel - 0.2 : 0, 0, 0);
    built.actor.root.rotation.y =
      frame < 48
        ? 0.12 * Math.sin((frame / 48) * Math.PI)
        : frame >= 144
          ? -0.16
          : 0;
    built.actor.update({
      frame,
      mood: cue.mood,
      gesture: frame >= 168 ? "wave" : frame >= 144 ? "point" : "rest",
      walk: frame >= 144 && frame < 168 ? 0.7 : 0,
      phase: walkPhase(travel, MAIN_CHARACTER_METRICS.stride),
      gaze: frame >= 144 ? [0.25, 0] : [0, 0],
      talking: 0,
    });
  }, [frame, built, camera]);
  return <primitive object={built.root} />;
}
export const MainCharacterShowcase: React.FC = () => {
  const frame = useCurrentFrame(),
    { width, height } = useVideoConfig(),
    cue = cues.find((c) => frame >= c.a && frame < c.b) ?? cues[6];
  return (
    <AbsoluteFill style={{ background: "#fff4e3" }}>
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ near: 0.1, far: 30 }}
      >
        <ActorScene frame={frame} />
      </ThreeCanvas>
      <div
        style={{
          position: "absolute",
          top: 115,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#392c31",
          fontFamily: "Arial,sans-serif",
          fontSize: 33,
          fontWeight: 700,
          letterSpacing: 7,
        }}
      >
        CHARACTER C
      </div>
      <div
        style={{
          position: "absolute",
          top: 185,
          left: 0,
          right: 0,
          textAlign: "center",
          color: "#705d60",
          fontFamily: "Arial,sans-serif",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 5,
        }}
      >
        {cue.label}
      </div>
    </AbsoluteFill>
  );
};
