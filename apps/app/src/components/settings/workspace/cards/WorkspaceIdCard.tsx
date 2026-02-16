"use client";

import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { ClipboardIcon as Clipboard } from "@featul/ui/icons/clipboard";
import { toast } from "sonner";

type Props = {
    workspaceId?: string;
};

export default function WorkspaceIdCard({ workspaceId }: Props) {
    const handleCopy = () => {
        if (!workspaceId) return;
        navigator.clipboard.writeText(workspaceId);
        toast.success("Copied to clipboard");
    };

    return (
        <SettingsCard
            icon={<Clipboard className="size-5 text-primary" />}
            title="Workspace ID"
            description={
                <span className="break-words">
                    ID: <span className="font-semibold text-foreground break-all">{workspaceId || "N/A"}</span>. Use this unique identifier for API integrations.
                </span>
            }
            buttonLabel="Copy"
            onAction={handleCopy}
            disabled={!workspaceId}
        />
    );
}
