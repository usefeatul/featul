import { ditherEngineScript } from "../lib/engine-script";

/**
 * Inline the dither engine in the document head so every DitherGradient and
 * DitherClouds animates from the first painted frame, before hydration.
 */
export function DitherEngineScript() {
  return (
    <script
      id="featul-dither-engine"
      dangerouslySetInnerHTML={{ __html: ditherEngineScript }}
    />
  );
}
