import { DitherClouds } from "@/components/dither-kit/clouds";
import { cn } from "@featul/ui/lib/utils";

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
    >
      <DitherClouds multicolor={multicolor} />
    </div>
  );
}
