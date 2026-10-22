"use client"

import React from "react"
import SettingsCard from "@/components/global/SettingsCard"
import { DeleteAccountDialog } from "@/components/account/DeleteAccountDialog"

export default function DeleteAccount() {
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

    return (
        <>
            <SettingsCard
                title="Delete Account"
                description="Permanently delete your account and all data."
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
