type RetryMessage = { id: string; role: "user" | "assistant"; content: string };

export function getRetryPrompt(
  messages: RetryMessage[],
  failedMessageId: string,
) {
  const index = messages.findIndex((message) => message.id === failedMessageId);
  if (index < 0) return null;
  for (let previous = index - 1; previous >= 0; previous--) {
    const message = messages[previous]!;
    if (message.role === "user") return message.content;
  }
  return null;
}
