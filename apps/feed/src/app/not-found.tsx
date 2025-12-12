import { getServerSession } from "@oreilla/auth/session"
import { findFirstAccessibleWorkspaceSlug } from "@/lib/workspace"
import NotFoundWorkspaceLink from "@/components/global/NotFoundWorkspaceLink"


export const revalidate = 30


export default async function NotFound() {
  const session = await getServerSession()
  let href = "/workspaces/new"
  if (session?.user) {
    const userId = session.user.id
    const slug = await findFirstAccessibleWorkspaceSlug(userId)
    if (slug) href = `/workspaces/${slug}`
  }
  return (
    <main className="min-h-screen grid place-items-center px-4 sm:px-0">
      <div className="mx-auto w-full max-w-md sm:max-w-lg text-center">
        <h1 className="text-2xl sm:text-3xl font-sans tracking-wider">Whoops…</h1>
        <p className="text-accent mt-2 text-xs sm:text-sm font-mono leading-relaxed">
          Sorry, there's no such page. Go to your
          <NotFoundWorkspaceLink
            defaultHref={href}
            className="ml-1 text-primary text-xs sm:text-sm font-normal hover:text-primary"
            ariaLabel="Go to workspace"
          />
          .
        </p>
      </div>
    </main>
  )
}