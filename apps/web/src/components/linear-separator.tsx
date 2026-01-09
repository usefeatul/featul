
import { cn } from "@featul/ui/lib/utils";

interface LinearSeparatorProps {
    className?: string;
}

export function LinearSeparator({ className }: LinearSeparatorProps) {
    return (
        <div
            className={cn("w-full h-px my-5 text-foreground/20 mx-4 md:mx-0", className)}
            style={{
                backgroundImage: "linear-gradient(to right, currentColor 6px, transparent 6px)",
                backgroundSize: "13px 1px",
                backgroundRepeat: "repeat-x"
            }}
        />
    );
}
