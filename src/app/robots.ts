import type { MetadataRoute } from 'next'

import { env } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const site = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/galleries/'] },
    sitemap: `${site}/sitemap.xml`,
  }
}
