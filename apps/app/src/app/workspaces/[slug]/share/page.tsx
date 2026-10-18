import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { board, db } from "@featul/db";
import Share from "@/components/share/share";
import { requireSignedInUser } from "@/lib/auth/server";
import { createPageMetadata } from "@/lib/seo";
import { buildShareLinks } from "@/lib/share";
import { publicBoardUrlForWorkspace } from "@/config/nav";
import {
  getWorkspaceBySlug,
  getWorkspaceDomainInfoBySlug,
  listUserWorkspaces,
} from "@/lib/workspace";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return createPageMetadata({
    title: "Share",
    description: "Bring your users into the conversation.",
    path: `/workspaces/${slug}/share`,
    indexable: false,
  });
}

export default async function SharePage({ params }: Props) {
  const { slug } = await params;
  const user = await requireSignedInUser(`/workspaces/${slug}/share`);
  const workspaces = await listUserWorkspaces(user.id);
  if (!workspaces.some((workspace) => workspace.slug === slug)) notFound();
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();
  const [domainInfo, publicSections] = await Promise.all([
    getWorkspaceDomainInfoBySlug(slug),
    db
      .select({ type: board.systemType })
      .from(board)
      .where(
        and(
          eq(board.workspaceId, workspace.id),
          eq(board.isSystem, true),
          eq(board.isPublic, true),
          eq(board.isVisible, true),
          eq(board.isActive, true),
        ),
      ),
  ]);
  const customDomain =
    domainInfo?.domain?.status === "verified"
      ? workspace.customDomain || domainInfo.domain.host
      : null;
  const boardUrl = publicBoardUrlForWorkspace(slug, customDomain);
  const links = buildShareLinks(boardUrl, {
    roadmap: publicSections.some((section) => section.type === "roadmap"),
    changelog: publicSections.some((section) => section.type === "changelog"),
  });
  return (
    <Share
      workspaceId={workspace.id}
      name={workspace.name}
      slug={slug}
      boardUrl={boardUrl}
      userName={user.name || workspace.name}
      userImage={user.image}
      links={links}
    />
  );
}
