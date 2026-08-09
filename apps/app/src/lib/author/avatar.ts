import { createHash } from "crypto";
import { randomAvatarUrl } from "@/utils/avatar";

export function avatarUrlFromFingerprint(fingerprint: string): string {
  const seed = createHash("sha256")
    .update(String(fingerprint))
    .digest("hex");
  return randomAvatarUrl(seed);
}

export function resolvePostAuthorImage({
  isAnonymous,
  authorImage,
  fallbackSeed,
  fingerprint,
}: {
  isAnonymous: boolean;
  authorImage?: string | null;
  fallbackSeed: string;
  fingerprint?: string | null;
}): string {
  if (isAnonymous) {
    return fingerprint
      ? avatarUrlFromFingerprint(fingerprint)
      : randomAvatarUrl(fallbackSeed);
  }

  return authorImage || randomAvatarUrl(fallbackSeed);
}
