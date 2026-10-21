import { redirect } from "next/navigation"

type Props = { params: Promise<{ slug: string; section: string }> }

/** Legacy account URLs now live on the single settings account page. */
export default async function AccountSectionPage({ params }: Props) {
  const { slug } = await params
  redirect(`/workspaces/${slug}/settings/account`)
}
