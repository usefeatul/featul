import React from "react";

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
                <React.Fragment key={index}>{child}</React.Fragment>
            ))}
        </>
    );
}
