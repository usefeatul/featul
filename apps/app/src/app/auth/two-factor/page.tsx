import type { Metadata } from "next";
import TwoFactorChallenge from "@/components/auth/TwoFactorChallenge";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Two-Factor Authentication",
  description: "Complete sign in with your authenticator app or a backup code.",
  path: "/auth/two-factor",
  indexable: false,
});

export default function TwoFactorPage() {
  return <TwoFactorChallenge />;
}
