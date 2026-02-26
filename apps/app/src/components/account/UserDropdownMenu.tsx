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
import { SettingIcon } from "@featul/ui/icons/setting";
import { LogoutIcon } from "@featul/ui/icons/logout";
import { PlusIcon } from "@featul/ui/icons/plus";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { TickIcon } from "@featul/ui/icons/tick";
import { getInitials } from "@/utils/user";

export type UserDropdownAccount = {
  userId: string;
  name: string;
  image: string;
  isCurrent: boolean;
};

type UserDropdownMenuProps = {
  showAccounts: boolean;
  accounts: UserDropdownAccount[];
  switchingAccountUserId: string | null;
  loading: boolean;
  onAccount: () => void;
  onSettings: () => void;
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
  onSettings,
  onSignOut,
  onOpenAddAccount,
  onSwitchAccount,
}: UserDropdownMenuProps) {
  return (
    <DropdownMenuContent
      className="w-36 max-w-[40vw] p-2"
      side="bottom"
      align="center"
      sideOffset={8}
    >
      <DropdownMenuItem
        onSelect={onAccount}
        className="px-2 py-2 rounded-md flex items-center gap-2 group"
      >
        <AccountIcon className="size-4 text-foreground transition-colors group-hover:opacity-100 group-hover:text-primary " />
        <span className="transition-colors group-hover:text-foreground">
          Account
        </span>
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={onSettings}
        className="px-2 py-2 rounded-md flex items-center gap-2 group"
      >
        <SettingIcon className="size-4 text-foreground transition-colors group-hover:opacity-100 group-hover:text-primary" />
        <span className="transition-colors group-hover:text-foreground">
          Settings
        </span>
      </DropdownMenuItem>
      {showAccounts ? (
        <>
          <DropdownMenuSeparator />
          <div className="px-2 pb-1 pt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-accent">
            Accounts
          </div>
          <div className="max-h-48 overflow-y-auto">
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
                  className="px-2 py-2 rounded-md flex items-center gap-2 group"
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
            className="px-2 py-2 rounded-md flex items-center gap-2 group"
          >
            <PlusIcon className="size-4 text-foreground transition-colors group-hover:text-primary" />
            <span className="transition-colors group-hover:text-foreground">
              Add account
            </span>
          </DropdownMenuItem>
        </>
      ) : null}
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={onSignOut}
        className="px-2 py-2 rounded-md flex items-center gap-2 group"
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
