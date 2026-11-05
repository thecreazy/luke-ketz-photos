import Link from 'next/link'
import React from 'react'

import { Rich } from '@/components/Rich'
import { getCopy, getSettings } from '@/lib/data'
import { photoSources } from '@/lib/photo'
import type { Media, Post } from '@/payload-types'

import { Faces } from './Faces'
import type { Copy } from './copy'
import { fmt, themeLabels } from './copy'
import { formatDate } from './format'
import { Parallax } from './Parallax'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { SiteMenu } from './SiteMenu'

type Next = { slug: string; title: string; theme: string } | null
type Props = { post: Post; next: Next; faces: (Media | number | null | undefined)[] }

const kicker = (it: Copy['diary'], p: Post) =>
  [
    themeLabels(it)[p.theme],
    formatDate(p.publishedAt),
    p.readTime ? fmt(it.minutes, { n: p.readTime }) : null,
  ]
    .filter(Boolean)
    .join(' · ')

function Pic({
  media,
  sizes,
  priority,
  fallback,
}: {
  fallback: string
  media: Media | number | null | undefined
  sizes: string
  priority?: boolean
}) {
  const p = photoSources(media)
  if (!p) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={p.src}
      srcSet={p.srcSet}
      sizes={sizes}
      alt={p.alt || fallback}
      width={p.width}
      height={p.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      style={{ background: p.dominantColor ?? undefined }}
    />
  )
}

function NextPage({ next, it }: { next: Next; it: Copy['diary'] }) {
  if (!next) return null
  return (
    <Link href={`/diario/${next.slug}`} className="nx">
      <span className="mono muted">
        {it.nextPage} · {themeLabels(it)[next.theme]}
      </span>
      <span className="serif">{next.title} →</span>
    </Link>
  )
}

// A · Campo: text, a big handwritten question, the portrait at the end.
export async function ArticleCampo({ post, next, faces }: Props) {
  const it = (await getCopy()).diary
  return (
    <div className="field glow article page">
      <Parallax className="field-layer fixed">
        <Faces images={faces} slots="margin" soften={3} />
      </Parallax>
      <div className="vignette" aria-hidden="true" />
      <SiteHeader current="diario" />
      <main id="main" tabIndex={-1} className="col">
        <span className="mono accent">{kicker(it, post)}</span>
        <h1 className="serif big">{post.title}</h1>
        <div className="prose body">
          <Rich data={post.content} />
        </div>
        {post.pullQuote && <blockquote className="serif pullquote">«{post.pullQuote}»</blockquote>}
        {post.cover && (
          <figure className="end-photo">
            <Pic fallback={post.title} media={post.cover} sizes="(max-width: 700px) 90vw, 560px" />
            <span className="corner tl" aria-hidden="true" />
          </figure>
        )}
        <NextPage next={next} it={it} />
      </main>
      <SiteFooter />
    </div>
  )
}

// B · Fotoracconto: a hero photo, then the day hour by hour.
export async function ArticleFotoracconto({ post, next }: Props) {
  const it = (await getCopy()).diary
  const count =
    (post.cover ? 1 : 0) + (post.sections ?? []).reduce((n, s) => n + (s.photos?.length ?? 0), 0)
  return (
    <div className="article-b page">
      <header className="b-hero">
        {post.cover && <Pic fallback={post.title} media={post.cover} sizes="100vw" priority />}
        <div className="b-shade" aria-hidden="true" />
        <div className="top over">
          <Link href="/" className="serif logo">
            Luke Ketz
          </Link>
          <SiteMenu current="diario" />
        </div>
        <div className="b-title wrap">
          <div>
            <span className="mono accent">{kicker(it, post)}</span>
            <h1 className="serif big">{post.title}</h1>
          </div>
          <span className="mono muted">
            {[
              count ? fmt(it.photos, { n: count }) : null,
              post.readTime ? fmt(it.minutes, { n: post.readTime }) : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        {post.intro && <p className="col body lead">{post.intro}</p>}
        {post.sections?.map((s) => {
          const photos = s.photos ?? []
          return (
            <section key={s.id} className="b-sec wrap">
              {s.time && <span className="mono accent time">{s.time}</span>}
              {photos.length > 0 && (
                <div className="b-photos" data-n={photos.length}>
                  {photos.map((ph) => (
                    <figure key={ph.id}>
                      <Pic
                        fallback={post.title}
                        media={ph.image}
                        sizes={
                          photos.length === 1
                            ? '(max-width: 900px) 100vw, 60vw'
                            : '(max-width: 900px) 100vw, 30vw'
                        }
                      />
                      {ph.caption && <figcaption className="mono muted">{ph.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
              {s.quote && <p className="serif pull">{s.quote}</p>}
              {s.note && <p className="mono muted note-line">{s.note}</p>}
            </section>
          )
        })}
        <div className="wrap">
          <NextPage next={next} it={it} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

// C · Domande e risposte: numbered questions in handwriting, answers beside them.
export async function ArticleDomande({ post, next }: Props) {
  const it = (await getCopy()).diary
  return (
    <div className="page">
      <SiteHeader current="diario" />
      <main id="main" tabIndex={-1} className="wrap qa-page">
        <span className="mono accent">{kicker(it, post)}</span>
        <h1 className="serif big">{post.title}</h1>
        {post.intro && <p className="body lead">{post.intro}</p>}
        <ol className="qa">
          {post.qa?.map((row, i) => (
            <li key={row.id}>
              <span className="serif num">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="serif">{row.question}</h2>
              <div>
                {row.answer && <p className="body">{row.answer}</p>}
                {row.quote && <p className="serif quote">{row.quote}</p>}
              </div>
            </li>
          ))}
        </ol>
        <NextPage next={next} it={it} />
      </main>
      <SiteFooter />
    </div>
  )
}

// D · Dietro lo scatto: one photograph on the left, its story as a timeline on the right.
export async function ArticleDietro({ post, next }: Props) {
  const [copy, settings] = await Promise.all([getCopy(), getSettings()])
  const it = copy.diary
  const chips =
    post.exifLine
      ?.split('·')
      .map((c) => c.trim())
      .filter(Boolean) ?? []
  return (
    <div className="article-d">
      <aside className="d-photo">
        <Pic
          fallback={post.title}
          media={post.cover}
          sizes="(max-width: 900px) 100vw, 50vw"
          priority
        />
        <div className="b-shade" aria-hidden="true" />
        <Link href="/" className="serif logo">
          {settings.siteName}
        </Link>
        {chips.length > 0 && (
          <div className="chips-row">
            {chips.map((c) => (
              <span key={c} className="chipx">
                {c}
              </span>
            ))}
          </div>
        )}
      </aside>

      <main id="main" tabIndex={-1} className="d-col">
        <SiteMenu current="diario" />
        <span className="mono accent">{kicker(it, post)}</span>
        <h1 className="serif big">{post.title}</h1>
        {post.intro && <p className="body lead">{post.intro}</p>}
        <ol className="timeline">
          {post.timeline?.map((t) => {
            const frames = (t.frames ?? []).slice(0, 4)
            return (
              <li key={t.id} data-hot={t.highlight ? '' : undefined}>
                <span className="dot" aria-hidden="true" />
                <span className={`mono ${t.highlight ? 'accent' : 'muted'}`}>{t.label}</span>
                {t.quote && <p className="serif pull">«{t.quote}»</p>}
                {frames.length > 0 && (
                  <div className="sheet" data-n={frames.length}>
                    {frames.map((f, i) => (
                      <span
                        key={typeof f === 'number' ? f : f.id}
                        className="sheet-frame"
                        data-chosen={t.chosen === i + 1 ? '' : undefined}
                      >
                        <Pic
                          fallback={post.title}
                          media={f}
                          sizes="(max-width: 900px) 25vw, 12vw"
                        />
                      </span>
                    ))}
                  </div>
                )}
                {t.text && <p className="body">{t.text}</p>}
              </li>
            )
          })}
        </ol>
        <NextPage next={next} it={it} />
        <SiteFooter />
      </main>
    </div>
  )
}
