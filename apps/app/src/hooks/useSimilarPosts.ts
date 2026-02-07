"use client"

import { useEffect, useState } from "react"
import { client } from "@featul/api/client"
import { useDebounce } from "@/hooks/useDebounce"
import type { SimilarPost } from "@/types/post"

interface UseSimilarPostsProps {
  title: string
  boardSlug: string | null | undefined
  workspaceSlug: string
  enabled?: boolean
  debounceMs?: number
  minTitleLength?: number
}

interface UseSimilarPostsResult {
  posts: SimilarPost[]
  isSearching: boolean
}

export function useSimilarPosts({
  title,
  boardSlug,
  workspaceSlug,
  enabled = true,
  debounceMs = 1000,
  minTitleLength = 3,
}: UseSimilarPostsProps): UseSimilarPostsResult {
  const [posts, setPosts] = useState<SimilarPost[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedTitle = useDebounce(title, debounceMs)

  useEffect(() => {
    if (!enabled || !boardSlug || debouncedTitle.trim().length < minTitleLength) {
      setPosts([])
      setIsSearching(false)
      return
    }

    let canceled = false
    setIsSearching(true)

    const fetchSimilar = async () => {
      const searchTitle = debouncedTitle.trim()
      try {
        const res = await client.post.getSimilar.$get({
          title: searchTitle,
          boardSlug,
          workspaceSlug,
        })

        if (!res.ok) {
          if (!canceled) {
            setPosts([])
          }
          return
        }

        const data = (await res.json()) as { posts?: SimilarPost[] } | null
        const nextPosts = Array.isArray(data?.posts) ? data.posts : []
        if (!canceled) {
          setPosts(nextPosts)
        }
      } catch (e) {
        console.error("Failed to fetch similar posts", e)
        if (!canceled) {
          setPosts([])
        }
      } finally {
        if (!canceled) {
          setIsSearching(false)
        }
      }
    }

    fetchSimilar()

    return () => {
      canceled = true
    }
  }, [enabled, debouncedTitle, boardSlug, workspaceSlug, minTitleLength])

  return { posts, isSearching }
}
