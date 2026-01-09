import React from "react";
import { LinearSeparator } from "@/components/linear-separator";

interface SectionStackProps {
    children: React.ReactNode;
}

export function SectionStack({ children }: SectionStackProps) {
    const childrenArray = React.Children.toArray(children).filter((child) =>
        React.isValidElement(child)
    );

    return (
        <>
            {childrenArray.map((child, index) => (
                <React.Fragment key={index}>
                    {child}
                    {index < childrenArray.length - 1 && <LinearSeparator />}
                </React.Fragment>
            ))}
        </>
    );
}
