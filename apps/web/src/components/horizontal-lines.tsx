"use client";

import { useEffect, useState } from "react";

export function HorizontalLines() {
    const [lines, setLines] = useState<number[]>([]);

    useEffect(() => {
        const calculateLines = () => {
            const viewportHeight = window.innerHeight;
            const spacing = 400; // Spacing between horizontal lines in pixels
            const numLines = Math.ceil(viewportHeight / spacing);
            const positions: number[] = [];

            for (let i = 1; i <= numLines; i++) {
                positions.push(i * spacing);
            }
            setLines(positions);
        };

        calculateLines();
        window.addEventListener("resize", calculateLines);
        return () => window.removeEventListener("resize", calculateLines);
    }, []);

    return (
        <>
            {lines.map((top, index) => (
                <div
                    key={index}
                    className="fixed left-0 right-0 h-px z-[60] pointer-events-none mx-auto max-w-6xl text-foreground/20 px-2 md:px-0"
                    style={{
                        top: `${top}px`,
                        backgroundImage: "linear-gradient(to right, currentColor 6px, transparent 6px)",
                        backgroundSize: "13px 1px",
                        backgroundRepeat: "repeat-x",
                        backgroundOrigin: "content-box"
                    }}
                />
            ))}
        </>
    );
}
