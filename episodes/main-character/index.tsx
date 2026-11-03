import React from "react";
import { Composition, registerRoot } from "remotion";
import { MainCharacterShowcase } from "./Showcase";
const Root: React.FC = () => (
  <Composition
    id="MainCharacter"
    component={MainCharacterShowcase}
    width={1440}
    height={2560}
    fps={24}
    durationInFrames={192}
  />
);
registerRoot(Root);
