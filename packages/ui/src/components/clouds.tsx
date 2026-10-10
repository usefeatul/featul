import { cloudArtwork, contourArtwork } from "../lib/artwork";

/** The finished kit artwork is present on first paint, including without JS. */
export function DitherClouds({
  multicolor = false,
  fit = "fill",
}: {
  multicolor?: boolean;
  fit?: "fill" | "cover";
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [contain:layout_paint] [image-rendering:pixelated]"
      style={{
        backgroundImage: `url("${multicolor ? contourArtwork : cloudArtwork}")`,
        backgroundSize: fit === "cover" ? "cover" : "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
