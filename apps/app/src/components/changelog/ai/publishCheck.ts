import { isValidChangelogTitle } from "@featul/api/ai/title";

export function getPublishCheckIssues(input: {
  title: string;
  contentMarkdown?: string;
  coverImage?: string | null;
  attachedPostTitles: string[];
}) {
  const issues: string[] = [];
  const body = input.contentMarkdown?.trim() || "";

  if (!isValidChangelogTitle(input.title)) {
    issues.push("Title is too generic or too short");
  }
  if (!input.coverImage) {
    issues.push("No cover image");
  }
  if (body.length < 180) {
    issues.push("Body is still thin for a publish-ready entry");
  }
  if (
    body &&
    !/\b(you|users?|customers?|now|can)\b/i.test(body)
  ) {
    issues.push("Call out a user benefit more clearly");
  }
  if (
    input.attachedPostTitles.length > 0 &&
    !input.attachedPostTitles.some((title) => body.includes(title)) &&
    !/\/board\/p\//.test(body)
  ) {
    issues.push("Attached feedback is not linked in the entry");
  }

  return issues;
}
