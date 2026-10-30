import type { Metadata } from 'next'

import type { Media } from '@/payload-types'

type Seo =
  | { title?: string | null; description?: string | null; image?: number | Media | null }
  | null
  | undefined

export const seoMetadata = (
  fallbackTitle: string,
  seo: Seo,
  fallbackDescription?: string | null,
  path?: string,
): Metadata => {
  const image = seo?.image && typeof seo.image !== 'number' ? seo.image.url : undefined
  const title = seo?.title || fallbackTitle
  const description = seo?.description || fallbackDescription || undefined
  return {
    title,
    description,
    alternates: path ? { canonical: path } : undefined,
    openGraph: { title, description, url: path, images: image ? [image] : undefined },
  }
}
