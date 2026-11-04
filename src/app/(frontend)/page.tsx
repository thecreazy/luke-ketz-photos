import type { Metadata } from 'next'

import { JsonLd } from '@/components/JsonLd'
import { getAbout, getNavPages, getPortraits, getSettings } from '@/lib/data'
import { env } from '@/lib/env'
import { photoSources } from '@/lib/photo'
import { HomeField } from '@/site/HomeField'
import type { FieldCard } from '@/site/HomeField'
import { it } from '@/site/it'

export const metadata: Metadata = { alternates: { canonical: '/' } }

// x, y, width and depth on the 1440x900 reference frame (0 near … 1 far).
const SLOTS: [number, number, number, number][] = [
  [70, 110, 330, 0.12],
  [500, 60, 140, 0.75],
  [1030, 70, 250, 0.35],
  [1250, 420, 150, 0.7],
  [930, 520, 340, 0.05],
  [200, 560, 170, 0.6],
  [660, 640, 190, 0.5],
  [380, 330, 100, 0.92],
  [1300, 690, 100, 0.9],
  [780, 210, 90, 1],
  [20, 400, 80, 0.95],
  [600, 390, 70, 1],
  [1140, 300, 80, 0.95],
]

// Same faces and depths on a phone-shaped frame (390x700, what Safari leaves visible): x, y and width. Index i matches SLOTS[i].
const MOBILE_SLOTS: [number, number, number][] = [
  [14, 92, 110],
  [268, 110, 80],
  [236, 450, 120],
  [170, 250, 60],
  [24, 450, 130],
  [8, 270, 70],
  [306, 330, 70],
  [190, 230, 44],
  [332, 250, 40],
  [110, 380, 36],
  [16, 372, 42],
  [210, 400, 36],
  [166, 600, 50],
]

export default async function Home() {
  const [portraits, s, about, legal] = await Promise.all([
    getPortraits(),
    getSettings(),
    getAbout(),
    getNavPages(),
  ])

  const withQuestion = portraits.filter((p) => p.doc.question)
  const featured = withQuestion.filter((p) => p.doc.featured)
  const pool = featured.length > 0 ? featured : withQuestion.length > 0 ? withQuestion : portraits
  const aboutSrc = photoSources(about.portrait)

  const cards: FieldCard[] = []
  if (pool.length > 0) {
    SLOTS.forEach(([x, y, w, z], i) => {
      const isAbout = i === SLOTS.length - 1 && aboutSrc !== null
      const p = pool[i % pool.length]
      const src = isAbout ? aboutSrc : photoSources(p.doc.image)
      if (!src) return
      cards.push({
        key: `${i}`,
        href: isAbout ? '/chi-e' : `/ritratti/${p.doc.slug}`,
        src: src.src,
        srcSet: src.srcSet,
        alt: isAbout ? 'Ritratto di Luke Ketz' : it.portraits.alt(p.n),
        tag: isAbout ? it.home.aboutCard : `N° ${String(p.n).padStart(2, '0')}`,
        about: isAbout,
        question: isAbout ? it.home.aboutQuestion : (p.doc.question ?? ''),
        x,
        y,
        w,
        z,
        xm: MOBILE_SLOTS[i][0],
        ym: MOBILE_SLOTS[i][1],
        wm: MOBILE_SLOTS[i][2],
      })
    })
  }

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: s.siteName,
          url: env.NEXT_PUBLIC_SITE_URL,
          inLanguage: 'it',
          author: {
            '@type': 'Person',
            name: s.siteName,
            sameAs: s.instagram ? [s.instagram] : undefined,
          },
        }}
      />
      <HomeField
        cards={cards}
        siteName={s.siteName}
        defaultQuestion={s.tagline || it.home.fallbackQuestion}
        faces={portraits.length}
        questions={withQuestion.length}
        legal={legal}
      />
    </>
  )
}
