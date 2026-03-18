import { cn } from "@featul/ui/lib/utils";

interface DotPatternProps {
    className?: string;
}

export function DotPattern({ className }: DotPatternProps) {
    return (
        <div
            className={cn(
                "absolute inset-0 pointer-events-none text-primary/45 bg-[radial-gradient(circle,currentColor_1px,transparent_1px)] [background-size:22px_22px]",
                className
            )}
        />
    );
}
