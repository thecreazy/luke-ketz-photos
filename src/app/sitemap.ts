import type { MetadataRoute } from 'next'

import { getSitemapEntries } from '@/lib/data'
import { env } from '@/lib/env'

// Private galleries are intentionally absent.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { pages, projects, posts } = await getSitemapEntries()
  const url = (path: string) => `${env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}${path}`
  const entry = (path: string, d: { updatedAt: string }) => ({
    url: url(path),
    lastModified: d.updatedAt,
  })

  return [
    { url: url('/') },
    { url: url('/blog') },
    ...pages.map((d) => entry(`/${d.slug}`, d)),
    ...projects.map((d) => entry(`/projects/${d.slug}`, d)),
    ...posts.map((d) => entry(`/blog/${d.slug}`, d)),
  ]
}
