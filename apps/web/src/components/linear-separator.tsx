
import { cn } from "@featul/ui/lib/utils";

interface LinearSeparatorProps {
    className?: string;
}

export function LinearSeparator({ className }: LinearSeparatorProps) {
    return (
        <div
            className={cn(
                "w-full h-px my-5 px-2 md:px-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.06)_100%)] bg-[length:100%_1px] bg-no-repeat bg-origin-content",
                className
            )}
        />
    );
}
