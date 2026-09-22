"use client"

import React from "react"
import SettingsCard from "@/components/global/SettingsCard"
import { DeleteAccountDialog } from "@/components/account/DeleteAccountDialog"
import { TrashIcon } from "@featul/ui/icons/trash"

export default function DeleteAccount() {
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

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
            <DeleteAccountDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                redirectTo="/"
            />
        </>
    )
}
