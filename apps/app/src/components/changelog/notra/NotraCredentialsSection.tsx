"use client";

import React from "react";
import { Input } from "@featul/ui/components/input";

type NotraCredentialsSectionProps = {
  organizationId: string;
  onOrganizationIdChange: (value: string) => void;
  isPending: boolean;
  apiKeyInputRef: React.RefObject<HTMLInputElement | null>;
};

export function NotraCredentialsSection({
  organizationId,
  onOrganizationIdChange,
  isPending,
  apiKeyInputRef,
}: NotraCredentialsSectionProps) {
  return (
    <section className="overflow-hidden rounded-md border border-border/70 bg-background">
      <div className="space-y-2 px-3 py-3">
        <label
          htmlFor="notra-org-id"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          Organization ID
        </label>
        <Input
          id="notra-org-id"
          value={organizationId}
          onChange={(event) => onOrganizationIdChange(event.target.value)}
          placeholder="org_123"
          autoComplete="off"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2 border-t border-border/60 px-3 py-3">
        <label
          htmlFor="notra-api-key"
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          API Key
        </label>
        <Input
          id="notra-api-key"
          type="password"
          placeholder="notra_..."
          autoComplete="off"
          disabled={isPending}
          ref={apiKeyInputRef}
        />
        <p className="text-xs text-accent">Used for this sync unless saved.</p>
      </div>
    </section>
  );
}
