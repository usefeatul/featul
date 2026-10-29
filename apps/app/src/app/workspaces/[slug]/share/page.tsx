import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { board, db } from "@featul/db";
import Share from "@/components/share/share";
import { requireSignedInUser } from "@/lib/auth/server";
import { createPageMetadata } from "@/lib/seo";
import { isHelpCenterPublic } from "@featul/api/help/queries";
import { buildShareLinks } from "@/lib/share";
import { publicBoardUrlForWorkspace } from "@/config/nav";
import {
  getWorkspaceBySlug,
  getWorkspaceDomainInfoBySlug,
  getWorkspacePosts,
  listUserWorkspaces,
} from "@/lib/workspace";
import { toRequestItemData } from "@/lib/request/item";
import { loadSubdomainLayoutData } from "@/app/[subdomain]/data";

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
  const [domainInfo, publicSections, topPosts, helpIsPublic, portal] =
    await Promise.all([
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
      // Same rows and portal shell data the public board renders.
      getWorkspacePosts(slug, { order: "likes", limit: 3, publicOnly: true }),
      // Same rule as the portal's Help tab: turned on and at least one published article.
      isHelpCenterPublic(db, workspace.id),
      loadSubdomainLayoutData(slug),
    ]);
  const customDomain =
    domainInfo?.domain?.status === "verified"
      ? workspace.customDomain || domainInfo.domain.host
      : null;
  const boardUrl = publicBoardUrlForWorkspace(slug, customDomain);
  const links = buildShareLinks(boardUrl, {
    roadmap: publicSections.some((section) => section.type === "roadmap"),
    changelog: publicSections.some((section) => section.type === "changelog"),
    help: helpIsPublic,
  });
  return (
    <Share
      workspaceId={workspace.id}
      name={workspace.name}
      slug={slug}
      boardUrl={boardUrl}
      userName={user.name || workspace.name}
      userImage={user.image}
      logo={workspace.logo}
      posts={topPosts.map((row) => toRequestItemData(row))}
      portal={portal}
      links={links}
    />
  );
}
