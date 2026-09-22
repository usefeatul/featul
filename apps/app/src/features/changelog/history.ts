import { client } from "@featul/api/client";

export type ChangelogAiHistoryMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachedTitles?: string[];
  status?: "error";
  activity?: "ask" | "rewrite" | "patch" | "tags";
  durationMs?: number;
  suggestedTags?: string[];
  effect?: string;
};

export type ChangelogAiConversationSummary = {
  id: string;
  entryId: string | null;
  title: string;
  messageCount: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type ChangelogAiConversation = {
  id: string;
  entryId: string | null;
  title: string;
  messages: ChangelogAiHistoryMessage[];
  selectedPostIds: string[];
  pendingTagNames: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
};

export async function listChangelogAiConversations(slug: string) {
  const response = await client.changelog.aiConversationsList.$get({
    slug,
    limit: 50,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || !data.ok || !Array.isArray(data.conversations)) {
    throw new Error("Failed to load conversation history");
  }
  return data.conversations as ChangelogAiConversationSummary[];
}

export async function getChangelogAiConversation(
  slug: string,
  conversationId: string,
) {
  const response = await client.changelog.aiConversationGet.$get({
    slug,
    conversationId,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || !data.ok || !data.conversation) {
    throw new Error("Failed to load conversation");
  }
  return data.conversation as ChangelogAiConversation;
}

export async function saveChangelogAiConversation(input: {
  slug: string;
  conversationId?: string;
  entryId?: string | null;
  title: string;
  messages: ChangelogAiHistoryMessage[];
  selectedPostIds: string[];
  pendingTagNames: string[];
}) {
  const response = await client.changelog.aiConversationSave.$post(input);
  const data = await response.json().catch(() => null);
  if (
    !response.ok ||
    !data ||
    !data.ok ||
    !data.conversation ||
    !data.summary
  ) {
    throw new Error("Failed to save conversation");
  }
  return {
    conversation: data.conversation as ChangelogAiConversation,
    summary: data.summary as ChangelogAiConversationSummary,
  };
}

export async function deleteChangelogAiConversation(
  slug: string,
  conversationId: string,
) {
  const response = await client.changelog.aiConversationDelete.$post({
    slug,
    conversationId,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || !data.ok) {
    throw new Error("Failed to delete conversation");
  }
}
