import { DitherClouds } from "@/components/dither-kit/clouds";
import { cn } from "@featul/ui/lib/utils";

// Keep a soft blue fallback visible before the dither canvas paints.
const cloudFields = [
  "radial-gradient(ellipse at 8% 24%, #b1dfff 0%, transparent 40%)",
  "radial-gradient(ellipse at 65% 4%, #9acefc 0%, transparent 38%)",
  "radial-gradient(ellipse at 93% 78%, #b1dfff 0%, transparent 45%)",
  "radial-gradient(ellipse at 28% 90%, #9acefc 0%, transparent 38%)",
].join(", ");

export function DitherBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-primary",
        className,
      )}
      style={{ backgroundImage: cloudFields }}
    >
      <DitherClouds />
    </div>
  );
}
