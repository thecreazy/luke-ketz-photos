import type { Metadata } from 'next'

import { getPortraits, getSeries } from '@/lib/data'
import { photoSources } from '@/lib/photo'
import { it } from '@/site/it'
import { PortraitGrid } from '@/site/PortraitGrid'
import type { GridItem } from '@/site/PortraitGrid'
import { SiteFooter } from '@/site/SiteFooter'
import { SiteHeader } from '@/site/SiteHeader'

export const metadata: Metadata = {
  title: it.portraits.title,
  alternates: { canonical: '/ritratti' },
}

export default async function Portraits() {
  const [portraits, series] = await Promise.all([getPortraits(), getSeries()])

  const items: GridItem[] = portraits.flatMap(({ doc, n }) => {
    const p = photoSources(doc.image)
    if (!p) return []
    return {
      slug: doc.slug,
      n,
      question: doc.question ?? '',
      src: p.src,
      srcSet: p.srcSet,
      alt: p.alt || it.portraits.alt(n),
      width: p.width,
      height: p.height,
      color: p.dominantColor ?? 'var(--surface)',
      series: typeof doc.series === 'object' && doc.series ? doc.series.id : (doc.series ?? null),
    }
  })

  return (
    <div className="page">
      <SiteHeader current="portraits" />
      <main className="wrap">
        <h1 className="serif big">{it.portraits.title}</h1>
        {items.length === 0 ? (
          <p className="muted body">{it.portraits.empty}</p>
        ) : (
          <PortraitGrid items={items} series={series.map((s) => ({ id: s.id, title: s.title }))} />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
