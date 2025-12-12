import type { Metadata } from 'next'
import { SITE_URL, DEFAULT_OG_IMAGE, DEFAULT_TITLE } from '@/config/seo'
import { getWorkspaceBySlug, getBoardByWorkspaceSlug } from '@/lib/workspace'
import { db, workspace, board, post } from "@oreilla/db"
import { eq, and } from "drizzle-orm"

function normalizePath(path?: string) {
  if (!path) return '/'
  return path.startsWith('/') ? path : `/${path}`
}

export function pageUrl(path?: string) {
  const p = normalizePath(path)
  return `${SITE_URL}${p}`
}

type BaseMetaArgs = {
  title: string
  description: string
  path?: string
  image?: string
  absoluteTitle?: boolean
  indexable?: boolean
  baseUrl?: string
  includeBrand?: boolean
}

export function createPageMetadata({ title, description, path, image, absoluteTitle, indexable, baseUrl, includeBrand }: BaseMetaArgs): Metadata {
  const img = image || DEFAULT_OG_IMAGE
  const canonical = normalizePath(path || '/')
  const brand = DEFAULT_TITLE || 'oreilla'
  const hasBrand = typeof title === 'string' && title.includes(brand)
  const withBrand = includeBrand ?? true
  const finalTitle = withBrand ? (hasBrand ? title : `${title} - ${brand}`) : title
  const base = baseUrl || SITE_URL
  const fullUrl = `${base}${canonical}`
  const useAbsolute = absoluteTitle !== false
  const titleProp: Metadata['title'] = useAbsolute ? { absolute: finalTitle } : finalTitle
  return {
    title: titleProp,
    description,
    alternates: { canonical: baseUrl ? fullUrl : canonical },
    ...(indexable === false ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      url: fullUrl,
      type: 'website',
      title: finalTitle,
      description,
      images: [{ url: img, width: 1200, height: 630, alt: finalTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description,
      images: [img],
    },
  }
}


export async function createWorkspaceMetadata(slug: string): Promise<Metadata> {
  const ws = await getWorkspaceBySlug(slug)
  const title = ws?.name || 'Workspace'
  const baseUrl = ws?.customDomain ? `https://${ws.customDomain}` : `https://${slug}.oreilla.com`
  const meta = createPageMetadata({
    title,
    description: ws?.domain ? `Feedback for ${ws.domain}` : title,
    path: '/',
    image: ws?.logo || undefined,
    absoluteTitle: true,
    baseUrl,
    includeBrand: false,
  })
  return {
    ...meta,
    ...(ws?.logo ? { icons: { icon: [ws.logo], shortcut: [ws.logo], apple: [ws.logo] } } : {}),
  }
}

export async function createPostMetadata(subdomain: string, postSlug: string, pathPrefix: string = '/p'): Promise<Metadata> {
  const ws = await getWorkspaceBySlug(subdomain)
  if (!ws) return {}

  const [p] = await db
    .select({ title: post.title, content: post.content, image: post.image })
    .from(post)
    .innerJoin(board, eq(post.boardId, board.id))
    .where(and(eq(board.workspaceId, ws.id), eq(post.slug, postSlug)))
    .limit(1)

  if (!p) return {}

  const title = `${p.title} - ${ws.name || subdomain}`
  // Simple strip tags
  const plainText = p.content ? p.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''
  const description = plainText.slice(0, 160) || title
  const baseUrl = ws.customDomain ? `https://${ws.customDomain}` : `https://${subdomain}.oreilla.com`
  const path = `${pathPrefix}/${postSlug}`

  const meta = createPageMetadata({
    title,
    description,
    path,
    image: p.image || ws.logo || undefined,
    absoluteTitle: true,
    baseUrl,
    includeBrand: false,
  })

  return {
    ...meta,
    ...(ws.logo ? { icons: { icon: [ws.logo], shortcut: [ws.logo], apple: [ws.logo] } } : {}),
  }
}

export async function createWorkspaceSectionMetadata(slug: string, section: 'feedback' | 'roadmap' | 'changelog', opts?: { boardSlug?: string }): Promise<Metadata> {
  const ws = await getWorkspaceBySlug(slug)
  const name = ws?.name || slug
  const baseUrl = ws?.customDomain ? `https://${ws.customDomain}` : `https://${slug}.oreilla.com`
  const path = section === 'feedback'
    ? (opts?.boardSlug ? `/board/${opts.boardSlug}` : '/')
    : section === 'roadmap'
    ? '/roadmap'
    : '/changelog'
  let label = section === 'feedback' ? 'All Feedback' : section === 'roadmap' ? 'Roadmap' : 'Changelog'
  if (section === 'feedback' && opts?.boardSlug) {
    const b = await getBoardByWorkspaceSlug(slug, opts.boardSlug)
    if (b?.name) label = b.name
  }
  const title = `${label} - ${name}`
  const description = title
  const meta = createPageMetadata({
    title,
    description,
    path,
    image: ws?.logo || undefined,
    absoluteTitle: true,
    baseUrl,
    includeBrand: false,
  })
  return {
    ...meta,
    ...(ws?.logo ? { icons: { icon: [ws.logo], shortcut: [ws.logo], apple: [ws.logo] } } : {}),
  }
}
