import type { MetadataRoute } from 'next'

import { getSitemapEntries } from '@/lib/data'
import { env } from '@/lib/env'

// Private galleries are intentionally absent.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { pages, portraits, posts } = await getSitemapEntries()
  const url = (path: string) => `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}${path}`
  const entry = (path: string, d: { updatedAt: string }) => ({
    url: url(path),
    lastModified: d.updatedAt,
  })

  return [
    { url: url('/') },
    { url: url('/chi-e') },
    { url: url('/ritratti') },
    { url: url('/diario') },
    ...pages.map((d) => entry(`/${d.slug}`, d)),
    ...portraits.map((d) => entry(`/ritratti/${d.slug}`, d)),
    ...posts.map((d) => entry(`/diario/${d.slug}`, d)),
  ]
}
