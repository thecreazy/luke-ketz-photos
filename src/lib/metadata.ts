import type { Metadata } from 'next'

import type { Media } from '@/payload-types'
import { DEFAULT_SEO, fmt } from '@/site/copy'

import { getCopy, getPageSeo, getSettings } from './data'

type Seo =
  | { title?: string | null; description?: string | null; image?: number | Media | null }
  | null
  | undefined

// The preview image of a page without its own: the one chosen in the site settings, else /og.
export const defaultOgImage = async (): Promise<string> => {
  const { ogImage } = await getSettings()
  return (typeof ogImage === 'object' && ogImage?.url) || '/og'
}

type Extra = { article?: { publishedTime?: string | null; modifiedTime?: string | null } }

export const seoMetadata = (
  fallbackTitle: string,
  seo: Seo,
  fallbackDescription?: string | null,
  path?: string,
  fallbackImage?: string,
  extra?: Extra,
): Metadata => {
  const image =
    (seo?.image && typeof seo.image !== 'number' ? seo.image.url : undefined) ?? fallbackImage
  const title = seo?.title || fallbackTitle
  const description = seo?.description || fallbackDescription || undefined
  const images = image ? [image] : undefined
  return {
    title,
    description,
    alternates: path ? { canonical: path } : undefined,
    openGraph: {
      title,
      description,
      url: path,
      images,
      ...(extra?.article
        ? {
            type: 'article' as const,
            publishedTime: extra.article.publishedTime ?? undefined,
            modifiedTime: extra.article.modifiedTime ?? undefined,
          }
        : {}),
    },
    twitter: { card: 'summary_large_image', title, description, images },
  }
}

const PATH = { home: '/', portraits: '/ritratti', about: '/chi-e', diary: '/diario' } as const

/** Metadata of the main pages: their SEO fields in Pages, else sensible defaults. */
export async function systemMetadata(kind: keyof typeof PATH): Promise<Metadata> {
  const [settings, copy, seo, ogImage] = await Promise.all([
    getSettings(),
    getCopy(),
    getPageSeo(kind),
    defaultOgImage(),
  ])
  const values = { siteName: settings.siteName }
  const path = PATH[kind]
  if (kind === 'home') {
    const title = seo.title ?? fmt(DEFAULT_SEO.home.title, values)
    const description =
      seo.description ?? settings.description ?? fmt(DEFAULT_SEO.home.description, values)
    const meta = seoMetadata(title, { description }, undefined, path, seo.image ?? ogImage)
    // The home has no "— site name" suffix: its title already is the site's.
    return { ...meta, title: { absolute: title } }
  }
  return seoMetadata(
    seo.title ?? copy.titles[kind],
    { description: seo.description },
    fmt(DEFAULT_SEO[kind].description, values),
    path,
    seo.image ?? ogImage,
  )
}
