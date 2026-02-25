"use client";

import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import { Button } from "@featul/ui/components/button";
import { getInitials } from "@/utils/user";
import type { UserDropdownAccount } from "./UserDropdownMenu";

type UserDropdownQuickSwitchProps = {
  accounts: UserDropdownAccount[];
  switchingToken: string | null;
  onSwitchAccount: (sessionToken: string) => void;
};

export default function UserDropdownQuickSwitch({
  accounts,
  switchingToken,
  onSwitchAccount,
}: UserDropdownQuickSwitchProps) {
  const quickAccounts = React.useMemo(
    () => accounts.filter((account) => !account.isCurrent),
    [accounts],
  );
  const visibleQuickAccounts = quickAccounts.slice(0, 2);
  const remainingQuickAccounts = Math.max(quickAccounts.length - 2, 0);

  if (visibleQuickAccounts.length === 0) return null;

  return (
    <div className="absolute left-3 top-1.5 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center -space-x-0.5">
      {visibleQuickAccounts.map((account) => {
        const quickInitials = getInitials(account.name || account.email || "A");
        return (
          <Button
            key={`quick-${account.sessionToken}`}
            variant="plain"
            size="icon-sm"
            onClick={() => {
              void onSwitchAccount(account.sessionToken);
            }}
            disabled={Boolean(switchingToken)}
            className="size-5 rounded-full p-0 bg-background ring-1 ring-border/80 transition-colors hover:ring-primary hover:bg-background focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Switch to ${account.name}`}
            title={account.name}
          >
            <Avatar className="size-4">
              {account.image ? (
                <AvatarImage src={account.image} alt={account.name} />
              ) : null}
              <AvatarFallback>{quickInitials}</AvatarFallback>
            </Avatar>
          </Button>
        );
      })}
      {remainingQuickAccounts > 0 ? (
        <div className="inline-flex size-5 items-center justify-center rounded-full bg-card text-[9px] font-medium text-accent ring-1 ring-border/80">
          +{remainingQuickAccounts}
        </div>
      ) : null}
    </div>
  );
}
