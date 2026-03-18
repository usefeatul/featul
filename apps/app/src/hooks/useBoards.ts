import * as React from "react"
import { client } from "@featul/api/client"

export type Board = {
    id: string
    name: string
    slug: string
    postCount?: number
    type?: string | null
}

function sortBoards(list: Board[]) {
    return [...list].sort((a, b) => a.name.localeCompare(b.name))
}

function normalizeBoards(list: Board[]): Board[] {
    return sortBoards(list.filter((b) => b.slug !== "roadmap" && b.slug !== "changelog"))
}

function readCachedBoards(raw: string | null): Board[] {
    if (!raw) return []
    const parsed = JSON.parse(raw) as { boards?: Board[]; data?: Board[] } | null
    if (!parsed || typeof parsed !== "object") return []
    const maybeBoards = Array.isArray(parsed.boards)
        ? parsed.boards
        : Array.isArray(parsed.data)
            ? parsed.data
            : []
    return normalizeBoards(maybeBoards)
}

export function useBoards({ slug, initialBoards }: { slug: string; initialBoards?: Board[] }) {

    const [boards, setBoards] = React.useState<Board[]>(() => normalizeBoards(Array.isArray(initialBoards) ? initialBoards : []))
    const [loading, setLoading] = React.useState(() => !(Array.isArray(initialBoards) && initialBoards.length > 0))

    React.useEffect(() => {
        let mounted = true
        const key = `boards:${slug}`
        const initialList = normalizeBoards(Array.isArray(initialBoards) ? initialBoards : [])

        setBoards(initialList)
        setLoading(initialList.length === 0)

        if (initialList.length === 0) {
            try {
                const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null
                const cachedBoards = readCachedBoards(raw)
                if (mounted && cachedBoards.length > 0) {
                    setBoards(cachedBoards)
                    setLoading(false)
                }
            } catch {
                // Ignore cache errors
            }
        }

        ; (async () => {
            try {
                const res = await client.board.byWorkspaceSlug.$get({ slug })
                const data = (await res.json().catch(() => null)) as { boards?: Board[] } | null
                const fetchedBoards = normalizeBoards(Array.isArray(data?.boards) ? data.boards : [])

                if (mounted) {
                    setBoards(fetchedBoards)
                    setLoading(false)
                }

                try {
                    if (typeof window !== "undefined") {
                        localStorage.setItem(key, JSON.stringify({ boards: fetchedBoards, ts: Date.now() }))
                    }
                } catch {
                    // Ignore cache write errors
                }
            } catch {
                if (mounted) setLoading(false)
            }
        })()

        return () => {
            mounted = false
        }
    }, [slug, initialBoards])

    return { boards, loading }
}
