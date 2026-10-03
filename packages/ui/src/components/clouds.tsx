import { cloudArtwork, contourArtwork } from "../lib/artwork";

/** The finished kit artwork is present on first paint, including without JS. */
export function DitherClouds({ multicolor = false }: { multicolor?: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [contain:layout_paint] [image-rendering:pixelated]"
      style={{
        backgroundImage: `url("${multicolor ? contourArtwork : cloudArtwork}")`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
