"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { AlertDialogShell } from "@/components/global/AlertDialogShell"
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@featul/ui/components/alert-dialog"
import { Input } from "@featul/ui/components/input"
import { toast } from "sonner"
import { authClient } from "@featul/auth/client"
import { client } from "@featul/api/client"
import { TrashIcon } from "@featul/ui/icons/trash"

const CONFIRMATION_WORD = "DELETE"

export function DeleteAccountDialog({
  open,
  onOpenChange,
  redirectTo = "/auth/signin",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  redirectTo?: string
}) {
  const router = useRouter()
  const [confirmation, setConfirmation] = React.useState("")
  const [deleting, setDeleting] = React.useState(false)
  const canDelete = confirmation.trim() === CONFIRMATION_WORD

  const onDeleteAccount = React.useCallback(async () => {
    if (deleting || !canDelete) return
    setDeleting(true)
    const toastId = toast.loading("Deleting account...")
    try {
      const res = await client.account.delete.$post({ confirmation: "DELETE" })
      if (!res.ok) {
        throw new Error("Failed to delete account")
      }
      toast.success("Account deleted", { id: toastId })
      onOpenChange(false)
      await authClient.signOut()
      router.replace(redirectTo)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete account"
      toast.error(msg, { id: toastId })
    } finally {
      setDeleting(false)
    }
  }, [canDelete, deleting, onOpenChange, redirectTo, router])

  return (
    <AlertDialogShell
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) setConfirmation("")
      }}
      title="Delete account"
      description="This cannot be undone. Your account and any workspaces you own will be permanently deleted."
      icon={<TrashIcon className="size-3.5 text-destructive" />}
    >
      <div className="mb-2">
        <p className="mb-2 text-sm text-muted-foreground">
          Type{" "}
          <span className="font-mono font-semibold text-destructive">
            {CONFIRMATION_WORD}
          </span>{" "}
          to confirm:
        </p>
        <Input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder={`Type ${CONFIRMATION_WORD}`}
          className="font-mono text-accent placeholder:text-accent"
          autoComplete="off"
        />
      </div>
      <AlertDialogFooter className="mt-2 flex justify-end gap-2">
        <AlertDialogCancel disabled={deleting} className="h-8 px-3 text-sm">
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={(event) => {
            event.preventDefault()
            void onDeleteAccount()
          }}
          disabled={!canDelete || deleting}
          className="h-8 px-4 text-sm bg-red-500 text-white hover:bg-red-600"
        >
          {deleting ? "Deleting..." : "Delete account"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogShell>
  )
}
