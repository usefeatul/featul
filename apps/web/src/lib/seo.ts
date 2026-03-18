import type { Metadata } from 'next'
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/config/seo'

const TITLE_MIN_LENGTH = 50
const TITLE_MAX_LENGTH = 60
const DESCRIPTION_MIN_LENGTH = 150
const DESCRIPTION_MAX_LENGTH = 160

const TITLE_BRAND_SUFFIX = ' | featul'
const TITLE_EXTENSIONS = [
  ' app',
  ' for SaaS teams',
  ' - feedback platform',
  ' - customer feedback platform',
  ' - customer feedback and roadmap software',
]
const DESCRIPTION_EXTENSION =
  ' Built for SaaS teams to collect feedback, prioritize roadmaps, and publish changelogs with privacy-first EU hosting.'

function normalizePath(path?: string) {
  if (!path) return '/'
  return path.startsWith('/') ? path : `/${path}`
}

function normalizeText(input: string) {
  return input.replace(/\s+/g, ' ').trim()
}

function trimToWordBoundary(input: string, maxLength: number) {
  const value = normalizeText(input)
  if (value.length <= maxLength) return value

  const hardLimit = maxLength - 3
  const sliced = value.slice(0, hardLimit + 1)
  const breakAt = sliced.lastIndexOf(' ')

  if (breakAt > Math.floor(hardLimit * 0.6)) {
    return `${sliced.slice(0, breakAt).trimEnd()}...`
  }

  return `${value.slice(0, hardLimit).trimEnd()}...`
}

function normalizeTitle(title: string) {
  const base = normalizeText(title)
  const withBrand = /\bfeatul\b/i.test(base) ? base : `${base}${TITLE_BRAND_SUFFIX}`

  if (withBrand.length >= TITLE_MIN_LENGTH && withBrand.length <= TITLE_MAX_LENGTH) {
    return withBrand
  }

  if (withBrand.length < TITLE_MIN_LENGTH) {
    for (const extension of TITLE_EXTENSIONS) {
      const candidate = `${withBrand}${extension}`
      if (candidate.length >= TITLE_MIN_LENGTH && candidate.length <= TITLE_MAX_LENGTH) return candidate
    }
  }

  return trimToWordBoundary(withBrand, TITLE_MAX_LENGTH)
}

function normalizeDescription(description: string) {
  const base = normalizeText(description)

  if (base.length >= DESCRIPTION_MIN_LENGTH && base.length <= DESCRIPTION_MAX_LENGTH) {
    return base
  }

  if (base.length < DESCRIPTION_MIN_LENGTH) {
    const endPunctuation = /[.!?]$/.test(base) ? '' : '.'
    return trimToWordBoundary(`${base}${endPunctuation}${DESCRIPTION_EXTENSION}`, DESCRIPTION_MAX_LENGTH)
  }

  return trimToWordBoundary(base, DESCRIPTION_MAX_LENGTH)
}

export function createAlternates(path?: string): Metadata['alternates'] {
  const canonical = normalizePath(path)
  return {
    canonical,
    languages: {
      'en-US': canonical,
      'x-default': canonical,
    },
  }
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
}

export function createPageMetadata({ title, description, path, image }: BaseMetaArgs): Metadata {
  const img = image || DEFAULT_OG_IMAGE
  const canonicalPath = normalizePath(path || '/')
  const normalizedTitle = normalizeTitle(title)
  const normalizedDescription = normalizeDescription(description)
  const titleProp: Metadata['title'] = { absolute: normalizedTitle }
  return {
    title: titleProp,
    description: normalizedDescription,
    alternates: createAlternates(canonicalPath),
    openGraph: {
      url: pageUrl(path || '/'),
      type: 'website',
      title: normalizedTitle,
      description: normalizedDescription,
      images: [{ url: img, width: 1200, height: 630, alt: normalizedTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: normalizedTitle,
      description: normalizedDescription,
      images: [img],
    },
  }
}

export function createArticleMetadata({ title, description, path, image }: BaseMetaArgs): Metadata {
  const img = image || DEFAULT_OG_IMAGE
  const canonicalPath = normalizePath(path || '/')
  const normalizedTitle = normalizeTitle(title)
  const normalizedDescription = normalizeDescription(description)
  const titleProp: Metadata['title'] = { absolute: normalizedTitle }
  return {
    title: titleProp,
    description: normalizedDescription,
    alternates: createAlternates(canonicalPath),
    openGraph: {
      url: pageUrl(path || '/'),
      type: 'article',
      title: normalizedTitle,
      description: normalizedDescription,
      images: [{ url: img, width: 1200, height: 630, alt: normalizedTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: normalizedTitle,
      description: normalizedDescription,
      images: [img],
    },
  }
}
