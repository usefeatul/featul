import React from "react";
import {
  darkThemePreviewPalette,
  ThemePreviewScene,
} from "./theme-preview-scene";

export const DarkMode = () => {
  return (
    <svg
      width="282"
      height="193"
      viewBox="0 0 282 193"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ThemePreviewScene palette={darkThemePreviewPalette} />
    </svg>
  );
};
