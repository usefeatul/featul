import { NodeViewWrapper, type NodeViewWrapperProps } from "@tiptap/react";
import { cn } from "@featul/ui/lib/utils";
import type { ReactNode } from "react";

interface EditorNodeViewWrapperProps extends NodeViewWrapperProps {
    children: ReactNode;
    className?: string;
}

export const EditorNodeViewWrapper = ({
    children,
    className,
    ...props
}: EditorNodeViewWrapperProps) => {
    return (
        <NodeViewWrapper className={cn("py-6", className)} {...props}>
            {children}
        </NodeViewWrapper>
    );
};
