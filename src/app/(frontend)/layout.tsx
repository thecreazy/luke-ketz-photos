import type { Metadata } from 'next'
import { Hedvig_Letters_Serif, Martian_Mono, Nothing_You_Could_Do } from 'next/font/google'
import React from 'react'

import { getSettings } from '@/lib/data'
import { env } from '@/lib/env'
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
  const ogImage = typeof s.ogImage === 'object' && s.ogImage ? s.ogImage.url : undefined
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: { default: s.siteName, template: `%s — ${s.siteName}` },
    description: s.description ?? s.tagline ?? undefined,
    openGraph: {
      siteName: s.siteName,
      type: 'website',
      locale: 'it_IT',
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

// Runs before the first paint: the saved choice, else the system preference. Without it the
// page would flash dark before switching to light.
const themeScript = `try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){}`

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="it"
      className={`${script.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
