import React from "react";
import { AbsoluteFill } from "remotion";
/** Selective drawn atmosphere. Deliberately no global bloom, grain or mandatory blur. */
export const Atmosphere: React.FC<{ night: boolean }> = ({ night }) =>
  night ? (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse at 45% 40%, transparent 38%, rgba(7,17,31,.22) 100%)",
      }}
    />
  ) : null;
