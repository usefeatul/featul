import { useState, useMemo, useRef } from "react"
import { toast } from "sonner"
import { client } from "@featul/api/client"
import { useSession } from "@featul/auth/client"

interface Member {
  id: string
  userId?: string
  name: string
  image?: string | null
  email?: string | null
}

export interface MentionCandidate {
  userId: string
  name: string
  email: string | null
  image: string | null
}

function memberNames(members: Member[]): string[] {
  return members.map((member) => (member.name || "").trim()).filter(Boolean)
}

/** True when `@Name ` is already inserted and no longer an in-progress query. */
function isCommittedMentionQuery(after: string, names: string[]): boolean {
  if (!after) return false

  const afterLower = after.toLowerCase()
  const sorted = [...names].sort((left, right) => right.length - left.length)

  for (const name of sorted) {
    const nameLower = name.toLowerCase()
    const committed =
      afterLower.startsWith(`${nameLower} `) ||
      afterLower.startsWith(`${nameLower}\n`)
    if (!committed) continue

    const stillTypingLongerName = names.some((other) => {
      if (other.length <= name.length) return false
      return other.toLowerCase().startsWith(afterLower)
    })
    if (!stillTypingLongerName) return true
  }

  return false
}

/** @-mention picker from workspace members. Inserts `@name` at the caret and tracks mention analytics. */
export function useMentions(
  workspaceSlug: string | undefined,
  content: string,
  setContent: (content: string) => void,
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
) {
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionIndex, setMentionIndex] = useState(0)
  const [members, setMembers] = useState<Member[]>([])
  const { data: session } = useSession()
  const skipMentionCheckRef = useRef(false)
  const names = useMemo(() => memberNames(members), [members]) 

  // Filter members based on query
  const filteredCandidates = useMemo(() => {
    const q = (mentionQuery || "").trim().toLowerCase()
    return members
      .map((m) => ({
        userId: m.userId || m.id,
        name: m.name || "",
        email: m.email || null,
        image: m.image || null,
      }))
      .filter((m) => (m.name || "").toLowerCase().includes(q))
  }, [members, mentionQuery])

  // Insert selected mention into text
  const insertMention = (name: string) => {
    skipMentionCheckRef.current = true
    setMentionOpen(false)
    setMentionQuery("")
    setMentionIndex(0)

    const el = textareaRef.current
    if (!el) {
      skipMentionCheckRef.current = false
      return
    }

    const caret = el.selectionStart || content.length
    const upto = content.slice(0, caret)
    const at = upto.lastIndexOf("@")
    if (at < 0) {
      skipMentionCheckRef.current = false
      return
    }

    const before = content.slice(0, at)
    const afterCaret = content.slice(caret)
    const nextContent = `${before}@${name} ${afterCaret}`

    setContent(nextContent)

    // Reset caret to after inserted mention
    setTimeout(() => {
      const pos = before.length + 1 + name.length + 1
      try {
        el.focus()
        el.setSelectionRange(pos, pos)
      } catch {
        el.focus()
      }
      skipMentionCheckRef.current = false
    }, 0)
  }

  // Check for mention trigger in text
  const checkForMention = (text: string, selectionStart: number) => {
    if (skipMentionCheckRef.current) return
    if (!workspaceSlug) return

    const upto = text.slice(0, selectionStart)
    const at = upto.lastIndexOf("@")

    if (at >= 0) {
      // Check if user is logged in
      if (!session?.user) {
        // Only show toast if they just typed the @
        if (text.slice(at).length === 1 && text[at] === "@") {
          toast.error("Please sign in to mention users")
        }
        setMentionOpen(false)
        return
      }

      const after = text.slice(at + 1, selectionStart)
      if (isCommittedMentionQuery(after, names)) {
        setMentionOpen(false)
        setMentionQuery("")
        return
      }

      const valid = /^[A-Za-z0-9._\-\s]*$/.test(after)
      const beforeChar = upto[at - 1]
      const boundaryChars = "().,;:!?[]{}"
      const boundary = !beforeChar || /\s/.test(beforeChar) || boundaryChars.includes(beforeChar)

      if (boundary && valid) {
        setMentionQuery(after)
        setMentionOpen(true)
        setMentionIndex(0)

        // Fetch members if not loaded
        if (members.length === 0) {
          client.team.membersByWorkspaceSlug
            .$get({ slug: workspaceSlug })
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json()
                setMembers((data as { members: Member[] })?.members || [])
              } else if (res.status === 403) {
                toast.error("You must be a member of this workspace to mention users")
                setMentionOpen(false)
              } else if (res.status === 401) {
                toast.error("Please sign in to mention users")
                setMentionOpen(false)
              }
            })
            .catch((err) => {
              if (err?.status === 403 || err?.response?.status === 403) {
                toast.error("You must be a member of this workspace to mention users")
                setMentionOpen(false)
              } else if (err?.status === 401 || err?.response?.status === 401) {
                toast.error("Please sign in to mention users")
                setMentionOpen(false)
              }
            })
        }
      } else {
        setMentionOpen(false)
      }
    } else {
      setMentionOpen(false)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!mentionOpen) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setMentionIndex((i) => Math.min(i + 1, filteredCandidates.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setMentionIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      const sel = filteredCandidates[mentionIndex]
      if (sel) insertMention(sel.name || "")
    } else if (e.key === "Escape") {
      setMentionOpen(false)
    }
  }

  return {
    mentionOpen,
    mentionIndex,
    filteredCandidates,
    members,
    setMentionOpen,
    checkForMention,
    handleKeyDown,
    insertMention,
  }
}
