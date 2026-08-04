import { getServerSession } from "@featul/auth/session";
import { findFirstAccessibleWorkspaceSlug } from "@/lib/workspace";
import NotFoundScene from "@/components/global/NotFoundScene";

export const revalidate = 30;

export default async function NotFound() {
  const session = await getServerSession();
  let href = "/start";
  if (session?.user) {
    const userId = session.user.id!;
    const slug = await findFirstAccessibleWorkspaceSlug(userId);
    if (slug) href = `/workspaces/${slug}`;
  }

  return <NotFoundScene defaultHref={href} />;
}