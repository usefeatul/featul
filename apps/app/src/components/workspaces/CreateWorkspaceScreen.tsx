"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@featul/ui/components/button";
import { PlusIcon } from "@featul/ui/icons/plus";
import OnboardingUserMenu from "@/components/account/OnboardingUserMenu";
import type { UserIdentity } from "@/components/account/types";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";

export function CreateWorkspaceScreen({
  initialUser,
  isFirstWorkspace = false,
}: {
  initialUser?: UserIdentity;
  isFirstWorkspace?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen && !isFirstWorkspace) {
        try {
          router.back();
        } catch {
          router.push("/");
        }
      }
    },
    [isFirstWorkspace, router],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="pointer-events-auto fixed top-0 right-0 z-[60] p-3 sm:p-4">
        <OnboardingUserMenu initialUser={initialUser} />
      </header>

      {isFirstWorkspace && !open ? (
        <section className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-sm text-center">
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Create a workspace
            </h1>
            <p className="mt-2 text-sm text-accent sm:text-base">
              You need a workspace to continue. You can also sign out from your
              profile menu.
            </p>
            <div className="mt-4 flex justify-center">
              <Button
                type="button"
                size="md"
                variant="quiet"
                onClick={() => setOpen(true)}
              >
                <PlusIcon className="size-3.5" />
                Create workspace
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <CreateWorkspaceDialog
        open={open}
        onOpenChange={handleOpenChange}
        isFirstWorkspace={isFirstWorkspace}
      />
    </div>
  );
}
