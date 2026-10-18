import {
  cloudArtwork,
  contourArtwork,
  primaryContourArtwork,
} from "../lib/artwork";

/** The finished kit artwork is present on first paint, including without JS. */
export function DitherClouds({
  multicolor = false,
  primary = false,
  fit = "fill",
}: {
  multicolor?: boolean;
  /** Light purple contours over a transparent base; pair with a bg-primary container. */
  primary?: boolean;
  fit?: "fill" | "cover";
}) {
  const artwork = primary
    ? primaryContourArtwork
    : multicolor
      ? contourArtwork
      : cloudArtwork;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [contain:layout_paint] [image-rendering:pixelated]"
      style={{
        backgroundImage: `url("${artwork}")`,
        backgroundSize: fit === "cover" ? "cover" : "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
