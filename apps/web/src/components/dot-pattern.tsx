import { cn } from "@featul/ui/lib/utils";

interface DotPatternProps {
    className?: string;
}

export function DotPattern({ className }: DotPatternProps) {
    return (
        <div
            className={cn(
                "absolute inset-0 pointer-events-none text-primary bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[length:24px_24px] bg-[position:0_0] opacity-35",
                className
            )}
        />
    );
}
