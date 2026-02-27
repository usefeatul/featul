"use client";

import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import { Button } from "@featul/ui/components/button";
import { getInitials } from "@/utils/user";
import type { UserDropdownAccount } from "./types";

type UserDropdownQuickSwitchProps = {
  accounts: UserDropdownAccount[];
  switchingAccountUserId: string | null;
  onSwitchAccount: (userId: string) => void;
  onOpenMenu: () => void;
};

export default function UserDropdownQuickSwitch({
  accounts,
  switchingAccountUserId,
  onSwitchAccount,
  onOpenMenu,
}: UserDropdownQuickSwitchProps) {
  const quickAccounts = React.useMemo(
    () => accounts.filter((account) => !account.isCurrent),
    [accounts],
  );
  const visibleQuickAccounts = quickAccounts.slice(0, 2);

  if (quickAccounts.length === 0) return null;

  if (quickAccounts.length > 2) {
    return (
      <Button
        variant="plain"
        size="icon-sm"
        onClick={onOpenMenu}
        disabled={Boolean(switchingAccountUserId)}
        className="size-6 rounded-md bg-background px-1 text-[10px] font-medium text-accent ring-1 ring-border/70 transition-colors hover:bg-muted hover:text-foreground hover:ring-primary focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={`View ${quickAccounts.length} switchable accounts`}
        title={`View ${quickAccounts.length} switchable accounts`}
      >
        +{quickAccounts.length}
      </Button>
    );
  }

  return (
    <div className="flex shrink-0 items-center -space-x-1 pr-1">
      {visibleQuickAccounts.map((account) => {
        const quickInitials = getInitials(account.name || "A");
        return (
          <Button
            key={`quick-${account.userId}`}
            variant="plain"
            size="icon-sm"
            onClick={() => {
              void onSwitchAccount(account.userId);
            }}
            disabled={Boolean(switchingAccountUserId)}
            className="size-5.5 rounded-full p-0 bg-background ring-1 ring-border/70 transition-colors hover:ring-primary hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  );
}
