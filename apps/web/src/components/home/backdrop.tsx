import { DitherGradient } from "@/components/dither-kit/gradient";
import { cn } from "@featul/ui/lib/utils";

const palettes: Record<
  "blue" | "dark",
  { light: [number, number, number]; shade: [number, number, number] }
> = {
  blue: { light: [154, 211, 255], shade: [23, 72, 181] },
  dark: { light: [70, 70, 70], shade: [18, 18, 18] },
};

export function DitherBackdrop({
  className,
  tone = "blue",
}: {
  className?: string;
  tone?: keyof typeof palettes;
}) {
  const { light, shade } = palettes[tone];
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        tone === "dark" ? "bg-[var(--marketing-create-band)]" : "bg-primary",
        className,
      )}
    >
      <DitherGradient
        from={light}
        direction="down"
        cell={3}
        opacity={0.58}
        bloom="off"
        className="-inset-y-1/4"
      />
      <DitherGradient
        from={shade}
        direction="up"
        cell={3}
        opacity={0.65}
        bloom="off"
        className="-inset-y-1/4"
      />
    </div>
  );
}
