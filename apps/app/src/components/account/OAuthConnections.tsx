"use client"

import React from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { authClient } from "@featul/auth/client"
import { toast } from "sonner"
import SettingsCard from "@/components/global/SettingsCard"
import { GoogleIcon } from "@featul/ui/icons/google"
import { GitHubIcon } from "@featul/ui/icons/github"

type Account = {
    id: string
    accountId: string
    providerId: string
    userId?: string
    scopes?: string[]
    createdAt?: Date | string
    updatedAt?: Date | string
}

const PROVIDERS = [
    {
        id: "google",
        name: "Google",
        icon: <GoogleIcon className="w-5 h-5" />,
        description: "Sign in with your Google account for quick access.",
    },
    {
        id: "github",
        name: "GitHub",
        icon: <GitHubIcon className="w-5 h-5" />,
        description: "Connect your GitHub account for developer authentication.",
    },
] as const

export default function OAuthConnections({ initialAccounts }: { initialAccounts?: { id: string; accountId: string; providerId: string }[] }) {
    const queryClient = useQueryClient()
    const [connecting, setConnecting] = React.useState<string | null>(null)
    const [disconnecting, setDisconnecting] = React.useState<string | null>(null)

    const { data: accounts } = useQuery<Account[]>({
        queryKey: ["linked-accounts"],
        queryFn: async () => {
            const result = await authClient.listAccounts()
            const data = (result && typeof result === "object" && "data" in result)
                ? (result.data as Account[])
                : Array.isArray(result) ? result as Account[] : []
            return data.filter((a) => a.providerId !== "credential")
        },
        staleTime: 60_000,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        initialData: initialAccounts,
        placeholderData: (prev) => prev,
    })

    const getConnectedAccount = React.useCallback(
        (providerId: string) => {
            return accounts?.find((a) => a.providerId === providerId)
        },
        [accounts]
    )

    const handleConnect = React.useCallback(
        async (providerId: string) => {
            if (connecting) return
            setConnecting(providerId)
            try {
                await authClient.linkSocial({
                    provider: providerId as "google" | "github",
                    callbackURL: window.location.href,
                })
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : `Failed to connect ${providerId}`
                toast.error(msg)
                setConnecting(null)
            }
        },
        [connecting]
    )

    const handleDisconnect = React.useCallback(
        async (providerId: string) => {
            if (disconnecting) return
            const account = getConnectedAccount(providerId)
            if (!account) return

            setDisconnecting(providerId)
            try {
                await authClient.unlinkAccount({ providerId })

                toast.success(`Disconnected from ${providerId}`)
                queryClient.invalidateQueries({ queryKey: ["linked-accounts"] })
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : `Failed to disconnect ${providerId}`
                toast.error(msg)
            } finally {
                setDisconnecting(null)
            }
        },
        [disconnecting, getConnectedAccount, queryClient]
    )



    return (
        <>
            {PROVIDERS.map((provider) => {
                const connected = getConnectedAccount(provider.id)
                const isConnecting = connecting === provider.id
                const isDisconnecting = disconnecting === provider.id

                return (
                    <SettingsCard
                        key={provider.id}
                        icon={provider.icon}
                        title={provider.name}
                        description={provider.description}
                        isConnected={!!connected}
                        buttonLabel={connected ? "Disconnect" : "Connect"}
                        onAction={() =>
                            connected
                                ? handleDisconnect(provider.id)
                                : handleConnect(provider.id)
                        }
                        disabled={isConnecting || isDisconnecting}
                    />
                )
            })}
        </>
    )
}
