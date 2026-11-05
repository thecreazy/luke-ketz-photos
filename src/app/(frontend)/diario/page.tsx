import type { Metadata } from 'next'
import Link from 'next/link'

import { getCopy, getPosts } from '@/lib/data'
import { systemMetadata } from '@/lib/metadata'
import { photoSources } from '@/lib/photo'
import { DiaryRoll } from '@/site/DiaryRoll'
import type { RollFrame } from '@/site/DiaryRoll'
import { formatDate } from '@/site/format'
import { fmt, themeLabels } from '@/site/copy'
import { SiteFooter } from '@/site/SiteFooter'
import { SiteHeader } from '@/site/SiteHeader'

export const generateMetadata = (): Promise<Metadata> => systemMetadata('diary')

export default async function Diary() {
  const [posts, copy] = await Promise.all([getPosts(), getCopy()])
  const it = copy.diary
  const themes = themeLabels(it)
  const latest = posts[0]
  const latestPhoto = latest ? photoSources(latest.cover) : null

  const frames: RollFrame[] = posts.map((p) => {
    const photo = photoSources(p.cover)
    return {
      slug: p.slug,
      title: p.title,
      theme: p.theme,
      themeLabel: themes[p.theme] ?? p.theme,
      meta: [
        themes[p.theme],
        formatDate(p.publishedAt),
        p.readTime ? fmt(it.minutes, { n: p.readTime }) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      src: photo ? (photo.srcSet.split(', ')[1]?.split(' ')[0] ?? photo.src) : null,
      alt: photo?.alt || p.title,
    }
  })

  return (
    <div className="page">
      <SiteHeader current="diario" />
      <main>
        <section className="wrap diary-intro">
          <h1 className="serif big">{copy.titles.diary}</h1>
          <span className="mono muted">{it.subtitle}</span>
        </section>

        {latest ? (
          <>
            <Link href={`/diario/${latest.slug}`} className="wrap latest">
              <div className="latest-photo">
                {latestPhoto && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={latestPhoto.src}
                    srcSet={latestPhoto.srcSet}
                    sizes="(max-width: 900px) 100vw, 55vw"
                    alt={latestPhoto.alt || latest.title}
                    width={latestPhoto.width}
                    height={latestPhoto.height}
                    fetchPriority="high"
                  />
                )}
                <span className="mono tag">{it.latest}</span>
              </div>
              <div className="latest-text">
                <span className="mono accent">
                  {[
                    themes[latest.theme],
                    formatDate(latest.publishedAt),
                    latest.readTime ? fmt(it.minutes, { n: latest.readTime }) : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span className="serif latest-title">{latest.title}</span>
                {latest.excerpt && <p className="body">{latest.excerpt}</p>}
                <span className="mono read">{it.read}</span>
              </div>
            </Link>
            <DiaryRoll frames={frames} copy={it} />
          </>
        ) : (
          <p className="wrap muted body">{it.empty}</p>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
