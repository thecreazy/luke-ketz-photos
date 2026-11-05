import type { Metadata } from 'next'

import { JsonLd } from '@/components/JsonLd'
import { getCopy, getPortraits, getSeries } from '@/lib/data'
import { absolute, breadcrumb } from '@/lib/jsonld'
import { systemMetadata } from '@/lib/metadata'
import { photoSources } from '@/lib/photo'
import { fmt } from '@/site/copy'
import { PortraitGrid } from '@/site/PortraitGrid'
import type { GridItem } from '@/site/PortraitGrid'
import { SiteFooter } from '@/site/SiteFooter'
import { SiteHeader } from '@/site/SiteHeader'

export const generateMetadata = (): Promise<Metadata> => systemMetadata('portraits')

export default async function Portraits() {
  const [portraits, series, copy] = await Promise.all([getPortraits(), getSeries(), getCopy()])
  const it = copy.portraits

  const items: GridItem[] = portraits.flatMap(({ doc, n }) => {
    const p = photoSources(doc.image)
    if (!p) return []
    return {
      slug: doc.slug,
      n,
      question: doc.question ?? '',
      src: p.src,
      srcSet: p.srcSet,
      alt: p.alt || fmt(it.alt, { n }),
      width: p.width,
      height: p.height,
      color: p.dominantColor ?? 'var(--surface)',
      series: typeof doc.series === 'object' && doc.series ? doc.series.id : (doc.series ?? null),
    }
  })

  return (
    <div className="page">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'ImageGallery',
            name: copy.titles.portraits,
            url: absolute('/ritratti'),
            associatedMedia: items.slice(0, 24).map((i) => ({
              '@type': 'ImageObject',
              contentUrl: i.src,
              name: i.question || i.alt,
              url: absolute(`/ritratti/${i.slug}`),
            })),
          },
          breadcrumb([
            ['Home', '/'],
            [copy.titles.portraits, '/ritratti'],
          ]),
        ]}
      />
      <SiteHeader current="ritratti" />
      <main id="main" tabIndex={-1} className="wrap">
        <h1 className="serif big">{copy.titles.portraits}</h1>
        {items.length === 0 ? (
          <p className="muted body">{it.empty}</p>
        ) : (
          <PortraitGrid
            items={items}
            series={series.map((s) => ({ id: s.id, title: s.title }))}
            copy={it}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
