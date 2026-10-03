import { DitherClouds } from "@/components/dither-kit/clouds";
import { cn } from "@featul/ui/lib/utils";

// Keep a soft blue fallback visible before the dither canvas paints.
const cloudFields = [
  "radial-gradient(ellipse at 8% 24%, #b1dfff 0%, transparent 40%)",
  "radial-gradient(ellipse at 65% 4%, #9acefc 0%, transparent 38%)",
  "radial-gradient(ellipse at 93% 78%, #b1dfff 0%, transparent 45%)",
  "radial-gradient(ellipse at 28% 90%, #9acefc 0%, transparent 38%)",
].join(", ");

const colorfulFields =
  "conic-gradient(from 45deg at 50% 50%, #4d96e8 0deg 90deg, #5cb4cb 90deg 180deg, #3671c0 180deg 270deg, #8b96d7 270deg 360deg)";

export function DitherBackdrop({
  className,
  multicolor = false,
}: {
  className?: string;
  multicolor?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-primary",
        className,
      )}
      style={{ backgroundImage: multicolor ? colorfulFields : cloudFields }}
    >
      <DitherClouds multicolor={multicolor} />
    </div>
  );
}
