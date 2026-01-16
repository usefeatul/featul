"use client"

import React from "react"
import { useRouter } from "next/navigation"
import SettingsCard from "@/components/global/SettingsCard"
import { AlertDialogShell } from "@/components/global/AlertDialogShell"
import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@featul/ui/components/alert-dialog"
import { Input } from "@featul/ui/components/input"
import { toast } from "sonner"
import { authClient } from "@featul/auth/client"
import { client } from "@featul/api/client"
import { TrashIcon } from "@featul/ui/icons/trash"

export default function DeleteAccount() {
    const router = useRouter()
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = React.useState("")
    const [deleting, setDeleting] = React.useState(false)

    const onDeleteAccount = React.useCallback(async () => {
        if (deleting || deleteConfirmation !== "DELETE") return
        setDeleting(true)
        const toastId = toast.loading("Deleting account...")
        try {
            const res = await client.account.delete.$post({ confirmation: "DELETE" })
            if (!res.ok) {
                throw new Error("Failed to delete account")
            }
            toast.success("Account deleted", { id: toastId })
            setDeleteDialogOpen(false)
            // Sign out and redirect
            await authClient.signOut()
            router.replace("/")
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to delete account"
            toast.error(msg, { id: toastId })
        } finally {
            setDeleting(false)
        }
    }, [deleting, deleteConfirmation, router])

    return (
        <>
            <SettingsCard
                title="Delete Account"
                description="Permanently delete your account and all data."
                icon={<TrashIcon className="size-5 text-destructive" />}
                buttonLabel="Delete Account"
                buttonVariant="destructive"
                onAction={() => setDeleteDialogOpen(true)}
            />
            <AlertDialogShell
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open)
                    if (!open) setDeleteConfirmation("")
                }}
                title="Delete Account"
                description="This action cannot be undone. This will permanently delete your account, all workspaces you own, and remove all associated data."
                icon={<TrashIcon className="size-3.5 text-destructive" />}
            >
                <div className="mb-2">
                    <p className="text-sm text-muted-foreground mb-2">
                        Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm:
                    </p>
                    <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Type DELETE"
                        className="font-mono"
                    />
                </div>
                <AlertDialogFooter className="flex justify-end gap-2 mt-2">
                    <AlertDialogCancel disabled={deleting} className="h-8 px-3 text-sm">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(event) => {
                            event.preventDefault()
                            onDeleteAccount()
                        }}
                        disabled={deleteConfirmation !== "DELETE" || deleting}
                        className="h-8 px-4 text-sm bg-red-500 hover:bg-red-600 text-white"
                    >
                        {deleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogShell>
        </>
    )
}
