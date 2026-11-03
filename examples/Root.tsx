import React from "react";
import { Composition } from "remotion";
import { StyleProof } from "../templates/bridge/Bridge";
import { FPS, WIDTH, HEIGHT, DURATION } from "../templates/bridge/Story";
export const Root: React.FC = () => (
  <>
    <Composition
      id="StyleProof"
      component={StyleProof}
      width={WIDTH}
      height={HEIGHT}
      fps={FPS}
      durationInFrames={DURATION}
      defaultProps={{ bodyDepth: 0.12, audio: "demo-mix.wav" }}
    />
    <Composition
      id="GraphicProfile"
      component={StyleProof}
      width={WIDTH}
      height={HEIGHT}
      fps={FPS}
      durationInFrames={DURATION}
      defaultProps={{ bodyDepth: 0.025 }}
    />
  </>
);
