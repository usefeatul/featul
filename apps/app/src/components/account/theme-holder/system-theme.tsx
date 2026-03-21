import React from "react";
import {
  darkThemePreviewPalette,
  lightThemePreviewPalette,
  ThemePreviewScene,
} from "./theme-preview-scene";

export const SystemMode = () => {
  return (
    <svg
      width="282"
      height="193"
      viewBox="0 0 282 193"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id="theme-system-left-clip">
          <rect x="0" y="0" width="141" height="193" />
        </clipPath>
        <clipPath id="theme-system-right-clip">
          <rect x="141" y="0" width="141" height="193" />
        </clipPath>
      </defs>
      <ThemePreviewScene
        palette={lightThemePreviewPalette}
        clipPath="theme-system-left-clip"
      />
      <ThemePreviewScene
        palette={darkThemePreviewPalette}
        clipPath="theme-system-right-clip"
      />
    </svg>
  );
};
