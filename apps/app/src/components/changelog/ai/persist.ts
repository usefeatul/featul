const PREFIX = "featul:changelog-ai:";

type PersistedActivity = "ask" | "rewrite" | "patch" | "tags";

export type PersistedAiChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachedTitles?: string[];
  status?: "pending" | "streaming" | "error";
  activity?: PersistedActivity;
  durationMs?: number;
  suggestedTags?: string[];
  effect?: string;
};

type PersistedAiChat = {
  conversationId?: string;
  messages: PersistedAiChatMessage[];
  selectedPostIds: string[];
  pendingTagNames: string[];
};

function keyFor(slug: string, entryId?: string) {
  return `${PREFIX}${slug}:${entryId || "draft"}`;
}

export function loadChangelogAiChat(slug: string, entryId?: string) {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      window.localStorage.getItem(keyFor(slug, entryId)) ||
      (!entryId ? null : window.localStorage.getItem(keyFor(slug)));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedAiChat;
    if (!Array.isArray(parsed.messages)) return null;
    return {
      conversationId:
        typeof parsed.conversationId === "string"
          ? parsed.conversationId
          : undefined,
      messages: parsed.messages.filter(
        (message) =>
          message.status !== "pending" && message.status !== "streaming",
      ),
      selectedPostIds: Array.isArray(parsed.selectedPostIds)
        ? parsed.selectedPostIds
        : [],
      pendingTagNames: Array.isArray(parsed.pendingTagNames)
        ? parsed.pendingTagNames
        : [],
    } satisfies PersistedAiChat;
  } catch {
    return null;
  }
}

export function saveChangelogAiChat(
  slug: string,
  entryId: string | undefined,
  payload: PersistedAiChat,
) {
  if (typeof window === "undefined") return;
  const body: PersistedAiChat = {
    conversationId: payload.conversationId,
    messages: payload.messages
      .filter(
        (message) =>
          message.status !== "pending" && message.status !== "streaming",
      )
      .slice(-24),
    selectedPostIds: payload.selectedPostIds.slice(0, 20),
    pendingTagNames: payload.pendingTagNames.slice(0, 4),
  };
  window.localStorage.setItem(keyFor(slug, entryId), JSON.stringify(body));
  if (entryId) {
    window.localStorage.removeItem(keyFor(slug));
  }
}

export function clearChangelogAiChat(slug: string, entryId?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(keyFor(slug, entryId));
  window.localStorage.removeItem(keyFor(slug));
}
