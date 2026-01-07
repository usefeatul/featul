"use client";

import React from "react";
import { Input } from "@featul/ui/components/input";
import { Button } from "@featul/ui/components/button";
import { toast } from "sonner";
import { Copy } from "lucide-react";

type Props = {
  workspaceId?: string;
};

export default function WorkspaceIdSection({ workspaceId }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Workspace ID</h3>
        <p className="text-sm text-accent mt-1">
          Unique identifier for this workspace. Use this for API integrations.
        </p>
      </div>
      <div className="flex items-center gap-2 max-w-md">
        <Input
          readOnly
          value={workspaceId || ""}
          disabled
        />
        <Button
          variant="card"
          onClick={() => {
            if (!workspaceId) return;
            navigator.clipboard.writeText(workspaceId);
            toast.success("Copied to clipboard");
          }}

        >
          <Copy className="size-3.5" />
          Copy
        </Button>
      </div>
    </div>
  );
}
