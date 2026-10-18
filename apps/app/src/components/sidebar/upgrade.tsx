"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useCanInvite } from "@/hooks/useWorkspaceAccess";
import { fetchWorkspaceBySlug, workspaceQueryKeys } from "@/lib/workspace/client";
import { useCardDismissal } from "./dismissal";
import Pricing from "./pricing";
import Stack, { type StackCard } from "./stack";

const actionClass = "mt-1 inline-flex min-h-6 items-center rounded-lg text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function Upgrade({ slug, collapsed, initialPlan, userKey }: {
  slug: string;
  userKey: string;
  collapsed: boolean;
  initialPlan?: "free" | "starter" | "professional" | null;
}) {
  const scope = `${encodeURIComponent(userKey)}:${slug}`;
  const upgrade = useCardDismissal(`featul:upgrade-dismissed:${scope}`);
  const invite = useCardDismissal(`featul:invite-dismissed:${scope}`);
  const share = useCardDismissal(`featul:share-dismissed:${scope}`);
  const { canInvite, loading: accessLoading } = useCanInvite(slug);
  const { data: workspace } = useQuery({
    queryKey: workspaceQueryKeys.bySlug(slug),
    queryFn: () => fetchWorkspaceBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
    refetchOnMount: false,
  });
  const plan = workspace?.plan ?? initialPlan;
  if (!slug || !plan || !upgrade.ready || !invite.ready || !share.ready || accessLoading) return null;

  const canUpgrade = plan !== "professional";
  const pricing = <Pricing key={slug} slug={slug} collapsed={collapsed} plan={plan} />;
  // Preserve the compact plan shortcut; the expanded sidebar owns the card stack.
  if (collapsed) {
    return canUpgrade && upgrade.visible ? (
      <div className="flex shrink-0 justify-center px-1.5 py-3">{pricing}</div>
    ) : null;
  }

  const cards: StackCard[] = [];
  if (canUpgrade && upgrade.visible) cards.push({
    id: "upgrade",
    title: "Need more room?",
    description: "Higher limits as your team grows.",
    action: pricing,
    dismiss: upgrade.dismiss,
  });
  if (canInvite && invite.visible) cards.push({
    id: "invite",
    title: "Better feedback, together",
    description: "Invite your team to review and prioritize requests.",
    action: <Link className={actionClass} href={`/workspaces/${slug}/settings/team`}>Invite teammates</Link>,
    dismiss: invite.dismiss,
  });
  if (share.visible) cards.push({
    id: "share",
    title: "Let your users weigh in",
    description: "Share your board and discover what matters most.",
    action: <Link className={actionClass} href={`/workspaces/${slug}/share`}>Share board</Link>,
    dismiss: share.dismiss,
  });

  return <Stack key={scope} cards={cards} total={Number(canUpgrade) + Number(canInvite) + 1} />;
}
