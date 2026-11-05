import type { MetadataRoute } from 'next'

import { getSitemapEntries } from '@/lib/data'
import { absolute } from '@/lib/jsonld'

// Private galleries are intentionally absent. Photos are listed with their pages so that search
// engines can show them in image results.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { pages, system, portraits, posts } = await getSitemapEntries()
  const entry = (path: string, lastModified?: string, image?: string | null) => ({
    url: absolute(path),
    lastModified,
    images: image ? [image] : undefined,
  })

  return [
    entry('/', system['home']),
    entry('/chi-e', system['chi-e']),
    entry('/ritratti', system['ritratti']),
    entry('/diario', system['diario']),
    ...pages.map((d) => entry(`/${d.slug}`, d.updatedAt)),
    ...portraits.map((d) => entry(`/ritratti/${d.slug}`, d.updatedAt, d.imageUrl)),
    ...posts.map((d) => entry(`/diario/${d.slug}`, d.updatedAt, d.imageUrl)),
  ]
}
