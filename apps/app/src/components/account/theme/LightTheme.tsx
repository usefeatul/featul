import React from "react";
import {
  lightThemePreviewPalette,
  ThemePreviewScene,
} from "./PreviewScene";

export const LightMode = () => {
  return (
    <svg
      viewBox="0 0 282 193"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="block h-auto w-full"
      aria-hidden
    >
      <ThemePreviewScene palette={lightThemePreviewPalette} />
    </svg>
  );
};
