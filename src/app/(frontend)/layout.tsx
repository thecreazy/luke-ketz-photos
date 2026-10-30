import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import Link from 'next/link'
import React from 'react'

import { getNavPages, getSettings } from '@/lib/data'
import { env } from '@/lib/env'

import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const ogImage = typeof s.ogImage === 'object' && s.ogImage ? s.ogImage.url : undefined
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: { default: s.siteName, template: `%s — ${s.siteName}` },
    description: s.description ?? s.tagline ?? undefined,
    openGraph: { siteName: s.siteName, type: 'website', images: ogImage ? [ogImage] : undefined },
  }
}

// `new Date()` is only allowed inside a cache scope when prerendering.
async function Year() {
  'use cache'
  cacheLife('days')
  return <>{new Date().getFullYear()}</>
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [s, pages] = await Promise.all([getSettings(), getNavPages()])

  return (
    <html lang="en">
      <body>
        <div className="wrap">
          <header className="site">
            <Link href="/">
              <strong>{s.siteName}</strong>
            </Link>
            <nav>
              <Link href="/">Projects</Link>
              <Link href="/blog">Blog</Link>
              {pages.map((pg) => (
                <Link key={pg.id} href={`/${pg.slug}`}>
                  {pg.title}
                </Link>
              ))}
            </nav>
          </header>
          <main>{children}</main>
          <footer className="site muted">
            <span>
              © <Year /> {s.siteName}
            </span>
            {s.instagram && <a href={s.instagram}>Instagram</a>}
          </footer>
        </div>
      </body>
    </html>
  )
}
