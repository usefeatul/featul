"use client";

import React from "react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@featul/ui/components/alert-dialog";
import { AccountIcon } from "@featul/ui/icons/account";
import { TrashIcon } from "@featul/ui/icons/trash";
import { AlertDialogShell } from "@/components/global/AlertDialogShell";
import type { UserDropdownAccount } from "./types";

type AccountActionsPopoverProps = {
  accounts: UserDropdownAccount[];
  isBusy: boolean;
  removingAccountUserId: string | null;
  onSwitchAccount: (userId: string) => Promise<void> | void;
  onRemoveAccount: (account: UserDropdownAccount) => Promise<void> | void;
};

export type AccountActionsPopoverHandle = {
  open: (
    event: React.MouseEvent<HTMLElement>,
    account: UserDropdownAccount,
  ) => void;
  close: () => void;
};

const AccountActionsPopover = React.forwardRef<
  AccountActionsPopoverHandle,
  AccountActionsPopoverProps
>(function AccountActionsPopover(
  { accounts, isBusy, removingAccountUserId, onSwitchAccount, onRemoveAccount },
  ref,
) {
  const [actionsPopover, setActionsPopover] = React.useState<{
    account: UserDropdownAccount;
    x: number;
    y: number;
  } | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = React.useState(false);
  const [pendingRemoveAccount, setPendingRemoveAccount] =
    React.useState<UserDropdownAccount | null>(null);

  const open = React.useCallback(
    (event: React.MouseEvent<HTMLElement>, account: UserDropdownAccount) => {
      event.preventDefault();
      event.stopPropagation();
      if (isBusy || account.isCurrent) return;
      setActionsPopover({
        account,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [isBusy],
  );

  const close = React.useCallback(() => {
    setActionsPopover(null);
  }, []);

  React.useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  React.useEffect(() => {
    if (!actionsPopover) return;
    if (
      !accounts.some(
        (account) => account.userId === actionsPopover.account.userId,
      )
    ) {
      setActionsPopover(null);
    }
  }, [accounts, actionsPopover]);

  const onSwitchFromActionsPopover = React.useCallback(() => {
    if (!actionsPopover?.account || isBusy) return;
    const selected = actionsPopover.account;
    setActionsPopover(null);
    void onSwitchAccount(selected.userId);
  }, [actionsPopover, isBusy, onSwitchAccount]);

  const onRequestRemoveFromActionsPopover = React.useCallback(() => {
    if (!actionsPopover?.account || isBusy) return;
    setPendingRemoveAccount(actionsPopover.account);
    setActionsPopover(null);
    setRemoveConfirmOpen(true);
  }, [actionsPopover, isBusy]);

  const onConfirmRemoveAccount = React.useCallback(() => {
    if (!pendingRemoveAccount || isBusy) return;
    void Promise.resolve(onRemoveAccount(pendingRemoveAccount)).finally(() => {
      setRemoveConfirmOpen(false);
      setPendingRemoveAccount(null);
    });
  }, [pendingRemoveAccount, isBusy, onRemoveAccount]);

  const selectedActionAccount = actionsPopover?.account || null;
  const canSwitchSelectedAccount = Boolean(
    selectedActionAccount && !selectedActionAccount.isCurrent && !isBusy,
  );
  const canRemoveSelectedAccount = Boolean(
    selectedActionAccount && !selectedActionAccount.isCurrent && !isBusy,
  );

  return (
    <>
      <Popover
        open={Boolean(actionsPopover)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setActionsPopover(null);
        }}
      >
        <PopoverAnchor asChild>
          <span
            aria-hidden
            className="fixed pointer-events-none size-0"
            style={{
              left: actionsPopover?.x ?? -9999,
              top: actionsPopover?.y ?? -9999,
            }}
          />
        </PopoverAnchor>
        <PopoverContent
          list
          align="start"
          side="top"
          sideOffset={6}
          collisionPadding={12}
          className="min-w-[132px] p-0"
        >
          <PopoverList>
            <PopoverListItem
              onClick={onSwitchFromActionsPopover}
              disabled={!canSwitchSelectedAccount}
            >
              <AccountIcon className="size-4 opacity-80" />
              <span>Switch</span>
            </PopoverListItem>
            <PopoverListItem
              onClick={onRequestRemoveFromActionsPopover}
              disabled={!canRemoveSelectedAccount}
              className="text-red-500 hover:text-red-500"
            >
              <TrashIcon className="size-4 opacity-80" />
              <span>Remove</span>
            </PopoverListItem>
          </PopoverList>
        </PopoverContent>
      </Popover>

      <AlertDialogShell
        open={removeConfirmOpen}
        onOpenChange={(nextOpen) => {
          setRemoveConfirmOpen(nextOpen);
          if (!nextOpen) setPendingRemoveAccount(null);
        }}
        title="Remove account from device?"
        description={`This will remove ${pendingRemoveAccount?.name || "this account"} from this device session.`}
      >
        <AlertDialogFooter className="flex justify-end gap-2 mt-2">
          <AlertDialogCancel
            disabled={Boolean(removingAccountUserId)}
            className="h-8 px-3 text-sm"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onConfirmRemoveAccount();
            }}
            disabled={Boolean(removingAccountUserId) || !pendingRemoveAccount}
            className="h-8 px-4 text-sm bg-red-500 hover:bg-red-600 text-white"
          >
            {removingAccountUserId ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogShell>
    </>
  );
});

AccountActionsPopover.displayName = "AccountActionsPopover";

export default AccountActionsPopover;
