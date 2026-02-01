import * as React from "react"
import { client } from "@featul/api/client"

export type Board = {
    id: string
    name: string
    slug: string
    postCount?: number
    type?: string | null
}

export function useBoards({ slug, initialBoards }: { slug: string; initialBoards?: Board[] }) {
    function sortBoards(list: Board[]) {
        return [...list].sort((a, b) => a.name.localeCompare(b.name))
    }

    const [boards, setBoards] = React.useState<Board[]>(() => {
        const list = Array.isArray(initialBoards) ? initialBoards : []
        const filtered = list.filter((b) => b.slug !== "roadmap" && b.slug !== "changelog")
        return sortBoards(filtered)
    })

    const [loading, setLoading] = React.useState(() => !(Array.isArray(initialBoards) && initialBoards.length > 0))

    React.useEffect(() => {
        let mounted = true
        const key = `boards:${slug}`

        // Try loading from cache first
        try {
            const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null
            if (raw) {
                const cached = JSON.parse(raw)
                // Handle potentially different cache structures if needed, but assuming simpler standard here
                const list = ((cached?.boards || cached?.data) || []) as Board[]
                const filtered = sortBoards(list.filter((b) => b.slug !== "roadmap" && b.slug !== "changelog"))

                if (mounted) {
                    // If we have cached data and no initial data, show it immediately
                    if (boards.length === 0) {
                        setBoards(filtered)
                        // Don't set loading to false yet if we want to refresh in bg, 
                        // BUT usually we want to show content fast. 
                        // BoardsDropdown sets loading=false here.
                        setLoading(false)
                    }
                }
            }
        } catch {
            // Ignore cache errors
        }

        // Fetch fresh data
        ; (async () => {
            try {
                const res = await client.board.byWorkspaceSlug.$get({ slug })
                const data = await res.json()
                const list = (data?.boards || []) as Board[]
                const filtered = sortBoards(list.filter((b) => b.slug !== "roadmap" && b.slug !== "changelog"))

                if (mounted) {
                    setBoards(filtered)
                    setLoading(false)
                }

                // Update cache
                try {
                    if (typeof window !== "undefined") {
                        localStorage.setItem(key, JSON.stringify({ boards: filtered, ts: Date.now() }))
                    }
                } catch {
                    // Ignore cache write errors
                }
            } catch {
                // If error and we have no boards, stop loading?
                if (mounted) setLoading(false)
            }
        })()

        return () => {
            mounted = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]) // Dependencies

    return { boards, loading }
}
