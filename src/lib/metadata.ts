import type { Metadata } from 'next'

import type { Media } from '@/payload-types'

import { getSettings } from './data'

// The preview image of a page without its own: the one chosen in the site settings, else /og.
export const defaultOgImage = async (): Promise<string> => {
  const { ogImage } = await getSettings()
  return (typeof ogImage === 'object' && ogImage?.url) || '/og'
}

type Seo =
  | { title?: string | null; description?: string | null; image?: number | Media | null }
  | null
  | undefined

export const seoMetadata = (
  fallbackTitle: string,
  seo: Seo,
  fallbackDescription?: string | null,
  path?: string,
  fallbackImage?: string,
): Metadata => {
  const image =
    (seo?.image && typeof seo.image !== 'number' ? seo.image.url : undefined) ?? fallbackImage
  const title = seo?.title || fallbackTitle
  const description = seo?.description || fallbackDescription || undefined
  return {
    title,
    description,
    alternates: path ? { canonical: path } : undefined,
    openGraph: { title, description, url: path, images: image ? [image] : undefined },
  }
}
