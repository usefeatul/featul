const PUBLIC_ERROR_MESSAGES = new Set([
  "Unauthorized",
  "Forbidden",
  "Invalid request",
  "Too Many Requests",
  "AI response was empty",
  "No valid shipped feedback items were found for generation",
  "Failed to generate AI response",
]);

export function sanitizeChangelogAiError(err: unknown): string {
  if (err instanceof Error) {
    const message = err.message.trim();
    if (PUBLIC_ERROR_MESSAGES.has(message)) {
      return message;
    }
  }

  return "Failed to generate AI response";
}
