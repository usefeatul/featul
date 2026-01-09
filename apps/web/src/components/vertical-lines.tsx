
export function VerticalLines() {
    return (
        <div
            className="fixed inset-0 z-[60] mx-auto max-w-6xl pointer-events-none text-foreground/20 px-2 md:px-0"
            style={{
                backgroundImage: `linear-gradient(to bottom, currentColor 6px, transparent 6px), linear-gradient(to bottom, currentColor 6px, transparent 6px)`,
                backgroundSize: "1px 13px",
                backgroundPosition: "left top, right top",
                backgroundRepeat: "repeat-y",
                backgroundOrigin: "content-box"
            }}
        />
    );
}
