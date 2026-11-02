import type { Metadata } from 'next'
import Link from 'next/link'

import { getPosts } from '@/lib/data'
import { photoSources } from '@/lib/photo'
import { DiaryRoll } from '@/site/DiaryRoll'
import type { RollFrame } from '@/site/DiaryRoll'
import { formatDate } from '@/site/format'
import { it } from '@/site/it'
import { SiteFooter } from '@/site/SiteFooter'
import { SiteHeader } from '@/site/SiteHeader'

export const metadata: Metadata = { title: it.diary.title, alternates: { canonical: '/diario' } }

export default async function Diary() {
  const posts = await getPosts()
  const latest = posts[0]
  const latestPhoto = latest ? photoSources(latest.cover) : null

  const frames: RollFrame[] = posts.map((p) => {
    const photo = photoSources(p.cover)
    return {
      slug: p.slug,
      title: p.title,
      theme: p.theme,
      themeLabel: it.themes[p.theme] ?? p.theme,
      meta: [
        it.themes[p.theme],
        formatDate(p.publishedAt),
        p.readTime ? it.diary.minutes(p.readTime) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      src: photo ? (photo.srcSet.split(', ')[1]?.split(' ')[0] ?? photo.src) : null,
      alt: photo?.alt ?? '',
    }
  })

  return (
    <div className="page">
      <SiteHeader current="diary" />
      <main>
        <section className="wrap diary-intro">
          <h1 className="serif big">{it.diary.title}</h1>
          <span className="mono muted">{it.diary.subtitle}</span>
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
                    alt={latestPhoto.alt}
                    width={latestPhoto.width}
                    height={latestPhoto.height}
                    fetchPriority="high"
                  />
                )}
                <span className="mono tag">{it.diary.latest}</span>
              </div>
              <div className="latest-text">
                <span className="mono accent">
                  {[
                    it.themes[latest.theme],
                    formatDate(latest.publishedAt),
                    latest.readTime ? it.diary.minutes(latest.readTime) : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span className="serif latest-title">{latest.title}</span>
                {latest.excerpt && <p className="body">{latest.excerpt}</p>}
                <span className="mono read">{it.diary.read}</span>
              </div>
            </Link>
            <DiaryRoll frames={frames} />
          </>
        ) : (
          <p className="wrap muted body">{it.diary.empty}</p>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
