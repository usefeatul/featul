
import { cn } from "@featul/ui/lib/utils";

interface LinearSeparatorProps {
    className?: string;
}

export function LinearSeparator({ className }: LinearSeparatorProps) {
    return (
        <div
            className={cn("w-full h-px my-5 px-2 md:px-0", className)}
            style={{
                backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.06) 100%)",
                backgroundSize: "100% 1px",
                backgroundRepeat: "no-repeat",
                backgroundOrigin: "content-box"
            }}
        />
    );
}
