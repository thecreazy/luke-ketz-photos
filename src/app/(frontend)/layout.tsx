import type { Metadata } from 'next'
import { Hedvig_Letters_Serif, Martian_Mono, Nothing_You_Could_Do } from 'next/font/google'
import React, { Suspense } from 'react'

import { getSettings } from '@/lib/data'
import { env } from '@/lib/env'
import { defaultOgImage } from '@/lib/metadata'
import { NavTracker } from '@/site/BackLink'
import '@/site/site.css'

const script = Nothing_You_Could_Do({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
})
const body = Hedvig_Letters_Serif({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  variable: '--font-body',
  display: 'swap',
})
const mono = Martian_Mono({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-mono',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const ogImage = await defaultOgImage()
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: { default: s.siteName, template: `%s — ${s.siteName}` },
    description: s.description ?? undefined,
    openGraph: {
      siteName: s.siteName,
      type: 'website',
      locale: 'it_IT',
      images: [ogImage],
    },
  }
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${script.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <Suspense fallback={null}>
          <NavTracker />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
