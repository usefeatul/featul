"use client";

import React from "react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@featul/ui/components/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@featul/ui/components/avatar";
import { AccountIcon } from "@featul/ui/icons/account";
import { LogoutIcon } from "@featul/ui/icons/logout";
import { PlusIcon } from "@featul/ui/icons/plus";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { TickIcon } from "@featul/ui/icons/tick";
import { getInitials } from "@/utils/user";
import type { UserDropdownAccount } from "./types";

type UserDropdownMenuProps = {
  showAccounts: boolean;
  accounts: UserDropdownAccount[];
  switchingAccountUserId: string | null;
  loading: boolean;
  onAccount: () => void;
  onSignOut: () => void;
  onOpenAddAccount: () => void;
  onSwitchAccount: (userId: string) => void;
};

export default function UserDropdownMenu({
  showAccounts,
  accounts,
  switchingAccountUserId,
  loading,
  onAccount,
  onSignOut,
  onOpenAddAccount,
  onSwitchAccount,
}: UserDropdownMenuProps) {
  return (
    <DropdownMenuContent
      className="w-40 max-w-[85vw] p-1.5"
      side="bottom"
      align="center"
      sideOffset={8}
    >
      <DropdownMenuItem
        onSelect={onAccount}
        className="h-9 rounded-md px-2.5 flex items-center gap-2 group"
      >
        <AccountIcon className="size-4 text-foreground transition-colors group-hover:opacity-100 group-hover:text-primary " />
        <span className="transition-colors group-hover:text-foreground">
          Account
        </span>
      </DropdownMenuItem>
      {showAccounts ? (
        <>
          <DropdownMenuSeparator />
          <div className="mx-0.5 my-1 rounded-md bg-muted/25 p-1">
            <div className="max-h-44 space-y-0.5 overflow-y-auto">
              {accounts.length === 0 ? (
                <div className="px-2 py-2 text-xs text-accent">
                  No connected accounts yet.
                </div>
              ) : null}
              {accounts.map((account) => {
                const initials = getInitials(account.name || "A");
                const disabled =
                  account.isCurrent || Boolean(switchingAccountUserId);
                return (
                  <DropdownMenuItem
                    key={account.userId}
                    onSelect={(event) => {
                      event.preventDefault();
                      void onSwitchAccount(account.userId);
                    }}
                    disabled={disabled}
                    className="h-8 rounded-md px-2.5 flex items-center gap-2 group"
                  >
                    <Avatar className="size-4">
                      {account.image ? (
                        <AvatarImage src={account.image} alt={account.name} />
                      ) : null}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 truncate transition-colors group-hover:text-foreground">
                      {account.name}
                    </div>
                    {switchingAccountUserId === account.userId ? (
                      <LoaderIcon className="size-4 animate-spin text-accent" />
                    ) : account.isCurrent ? (
                      <TickIcon
                        className="size-4 shrink-0"
                        aria-label="Current account"
                      />
                    ) : null}
                  </DropdownMenuItem>
                );
              })}
            </div>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onOpenAddAccount();
              }}
              disabled={Boolean(switchingAccountUserId)}
              className="mt-1 h-8 rounded-md px-2.5 flex items-center gap-2 whitespace-nowrap group"
            >
              <PlusIcon className="size-4 text-foreground transition-colors group-hover:text-primary" />
              <span className="transition-colors group-hover:text-foreground">
                Add account
              </span>
            </DropdownMenuItem>
          </div>
        </>
      ) : null}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={onSignOut}
        className="h-9 rounded-md px-2.5 flex items-center gap-2 group"
        aria-disabled={loading || Boolean(switchingAccountUserId)}
      >
        <LogoutIcon className="size-4 text-foreground group-hover:opacity-100 group-hover:text-red-500 transition-colors" />
        <span className="transition-colors group-hover:text-foreground">
          Sign out
        </span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
