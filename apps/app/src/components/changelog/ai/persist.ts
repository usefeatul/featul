const PREFIX = "featul:changelog-ai:";

export type PersistedAiChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachedTitles?: string[];
  status?: "pending" | "error";
};

type PersistedAiChat = {
  messages: PersistedAiChatMessage[];
  selectedPostIds: string[];
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
      messages: parsed.messages.filter(
        (message) => message.status !== "pending",
      ),
      selectedPostIds: Array.isArray(parsed.selectedPostIds)
        ? parsed.selectedPostIds
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
    messages: payload.messages
      .filter((message) => message.status !== "pending")
      .slice(-24),
    selectedPostIds: payload.selectedPostIds.slice(0, 20),
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
