
export function VerticalLines() {
    return (
        <div
            className="fixed inset-0 z-[60] mx-auto max-w-6xl pointer-events-none px-2 md:px-0"
            style={{
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.06) 100%), linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.06) 100%)`,
                backgroundSize: "1px 100%",
                backgroundPosition: "left top, right top",
                backgroundRepeat: "no-repeat",
                backgroundOrigin: "content-box"
            }}
        />
    );
}
