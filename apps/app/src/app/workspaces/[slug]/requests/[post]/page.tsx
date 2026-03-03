import { notFound } from "next/navigation"
import RequestDetail from "@/components/requests/RequestDetail"
import { resolveSearchParams } from "@/utils/search-params"
import { loadRequestDetailPageData, type RequestDetailSearchParams } from "./data"

export const revalidate = 0

import { createPageMetadata } from "@/lib/seo"

export const metadata = createPageMetadata({
  title: "Request",
  description: "Request details",
})

type Props = { params: Promise<{ slug: string; post: string }>; searchParams?: Promise<RequestDetailSearchParams> }

export default async function RequestDetailPage({ params, searchParams }: Props) {
  const { slug, post: postSlug } = await params

  const sp = await resolveSearchParams(searchParams)

  const data = await loadRequestDetailPageData({
    workspaceSlug: slug,
    postSlug,
    searchParams: sp,
  })

  if (!data) return notFound()

  return (
    <RequestDetail
      post={data.post}
      workspaceSlug={data.workspaceSlug}
      initialComments={data.initialComments}
      initialCollapsedIds={data.initialCollapsedIds}
      navigation={data.navigation}
    />
  )
}
