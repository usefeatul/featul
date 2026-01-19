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
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
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
                const result = await authClient.linkSocial({
                    provider: providerId as "google" | "github",
                    callbackURL: window.location.href,
                })

                // Check for error
                if (result && typeof result === "object" && "error" in result && result.error) {
                    const error = result.error as { message?: string }
                    toast.error(error.message || `Failed to connect ${providerId}`)
                    setConnecting(null)
                    return
                }

                // Redirect to OAuth URL
                if (result && typeof result === "object" && "data" in result && result.data) {
                    const data = result.data as { url?: string }
                    if (data.url) {
                        window.location.href = data.url
                        return
                    }
                }

                // Fallback: check if url is directly on result
                if (result && typeof result === "object" && "url" in result) {
                    const url = (result as { url?: string }).url
                    if (url) {
                        window.location.href = url
                        return
                    }
                }

                toast.error(`Failed to get OAuth URL for ${providerId}`)
                setConnecting(null)
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
                const { error } = await authClient.unlinkAccount({
                    providerId,
                    accountId: account.accountId
                })

                if (error) {
                    toast.error(error.message || `Failed to disconnect ${providerId}`)
                    return
                }

                toast.success(`Disconnected from ${providerId}`)
                await queryClient.invalidateQueries({ queryKey: ["linked-accounts"] })
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
                        isLoading={isConnecting || isDisconnecting}
                        disabled={isConnecting || isDisconnecting}
                    />
                )
            })}
        </>
    )
}
