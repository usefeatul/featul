"use client"

import React from "react"
import SettingsCard from "@/components/global/SettingsCard"
import { authClient } from "@featul/auth/client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { FingerprintIcon } from "lucide-react"

export type PasskeyItem = {
    id: string
    name?: string | null
    createdAt?: string | Date | null
    deviceType?: string | null
}

export default function Passkeys({ initialPasskeys }: { initialPasskeys?: PasskeyItem[] }) {
    const queryClient = useQueryClient()
    const [loading, setLoading] = React.useState(false)

    const { data: passkeys } = useQuery<PasskeyItem[] | null>({
        queryKey: ["passkeys"],
        queryFn: async () => {
            const result = await authClient.passkey.listUserPasskeys()
            if (result && typeof result === "object" && "data" in result) {
                return (result as { data: PasskeyItem[] }).data
            }
            return Array.isArray(result) ? result : []
        },
        initialData: initialPasskeys,
        placeholderData: (prev) => prev,
        staleTime: 60_000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    })

    const hasPasskeys = Array.isArray(passkeys) && passkeys.length > 0

    const onAddPasskey = React.useCallback(async () => {
        if (loading) return
        setLoading(true)
        const toastId = toast.loading("Setting up passkey...")
        try {
            const result = await authClient.passkey.addPasskey({
                authenticatorAttachment: "platform", // Prefer fingerprint/Face ID
            })
            if (result?.error) {
                toast.error(result.error.message || "Failed to add passkey", { id: toastId })
            } else {
                toast.success("Passkey added successfully", { id: toastId })
                queryClient.invalidateQueries({ queryKey: ["passkeys"] })
            }
        } catch {
            toast.error("Failed to add passkey", { id: toastId })
        } finally {
            setLoading(false)
        }
    }, [loading, queryClient])

    // Disconnect = delete all passkeys
    const onDisconnect = React.useCallback(async () => {
        if (loading || !passkeys) return
        setLoading(true)
        const toastId = toast.loading("Removing passkeys...")
        try {
            // Delete all passkeys sequentially
            await Promise.all(passkeys.map(pk => authClient.passkey.deletePasskey({ id: pk.id })));
            toast.success("Passkeys disconnected", { id: toastId })
            queryClient.invalidateQueries({ queryKey: ["passkeys"] })
        } catch {
            toast.error("Failed to disconnect passkeys", { id: toastId })
        } finally {
            setLoading(false)
        }
    }, [loading, passkeys, queryClient])

    return (
        <SettingsCard
            title="Passkey"
            description="WebAuthn for passwordless authentication."
            icon={<FingerprintIcon className="size-5 text-primary" />}
            onAction={hasPasskeys ? onDisconnect : onAddPasskey}
            buttonLabel={hasPasskeys ? "Disconnect" : "Connect"}
            isConnected={!!hasPasskeys}
            isLoading={loading}
            disabled={loading}
        />
    )
}
