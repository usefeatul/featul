export type OnboardingPostKind = "welcome" | "ideas" | "bugs";

export type OnboardingPostMetadata = {
  customFields?: {
    onboarding?: boolean;
    onboardingKind?: OnboardingPostKind;
  };
};

/** True when metadata marks a seeded onboarding post. */
export function isOnboardingPost(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  if (!metadata || typeof metadata !== "object") return false;
  const customFields = (metadata as OnboardingPostMetadata).customFields;
  return Boolean(customFields?.onboarding);
}

/** welcome/ideas/bugs kind, or null if not an onboarding post. */
export function getOnboardingPostKind(
  metadata: Record<string, unknown> | null | undefined,
): OnboardingPostKind | null {
  if (!isOnboardingPost(metadata)) return null;
  const kind = (metadata as OnboardingPostMetadata).customFields?.onboardingKind;
  return kind === "welcome" || kind === "ideas" || kind === "bugs" ? kind : null;
}

export type OnboardingContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "section"; title: string; items: string[] };

/** Splits onboarding markdown into paragraphs and titled lists. */
export function parseOnboardingContent(content: string): OnboardingContentBlock[] {
  const blocks: OnboardingContentBlock[] = [];
  const sections = content.split(/\n\n+/).map((part) => part.trim()).filter(Boolean);

  for (const section of sections) {
    const lines = section.split("\n").map((line) => line.trim()).filter(Boolean);
    const listItems = lines.filter((line) => line.startsWith("- "));
    const nonListLines = lines.filter((line) => !line.startsWith("- "));

    if (listItems.length > 0 && nonListLines.length === 1) {
      blocks.push({
        type: "section",
        title: nonListLines[0] ?? "",
        items: listItems.map((line) => line.slice(2).trim()),
      });
      continue;
    }

    if (listItems.length > 0 && nonListLines.length === 0) {
      blocks.push({
        type: "section",
        title: "",
        items: listItems.map((line) => line.slice(2).trim()),
      });
      continue;
    }

    blocks.push({ type: "paragraph", text: section });
  }

  return blocks;
}

/** Metadata written onto seeded onboarding posts. */
export function onboardingMetadata(kind: OnboardingPostKind): OnboardingPostMetadata {
  return {
    customFields: {
      onboarding: true,
      onboardingKind: kind,
    },
  };
}
