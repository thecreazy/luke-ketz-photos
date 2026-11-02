import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { getPortraits, getPortraitSlugs } from '@/lib/data'
import { photoSources } from '@/lib/photo'
import { staticSlugParams } from '@/lib/static-params'
import { seoMetadata } from '@/lib/metadata'
import { it } from '@/site/it'
import { Parallax } from '@/site/Parallax'
import { SiteNav } from '@/site/SiteNav'
import { Faces } from '@/site/Faces'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return staticSlugParams(await getPortraitSlugs())
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const found = (await getPortraits()).find((p) => p.doc.slug === slug)
  if (!found) return {}
  const { doc, n } = found
  const title = doc.question || `Ritratto N° ${String(n).padStart(2, '0')}`
  return seoMetadata(title, doc.seo, doc.note, `/ritratti/${doc.slug}`)
}

async function PortraitView({ params }: Props) {
  const { slug } = await params
  const all = await getPortraits()
  const index = all.findIndex((p) => p.doc.slug === slug)
  if (index < 0) notFound()

  const { doc, n } = all[index]
  const photo = photoSources(doc.image)
  if (!photo) notFound()

  const prev = all[(index + all.length - 1) % all.length].doc
  const next = all[(index + 1) % all.length].doc
  const series =
    typeof doc.series === 'object' && doc.series ? doc.series.title : it.portraits.single
  const meta = [doc.subject, series, doc.year].filter(Boolean).join(' · ')
  const num = String(n).padStart(2, '0')
  const others = all.filter((_, i) => i !== index).map((p) => p.doc.image)

  return (
    <div className="field glow portrait">
      <Parallax className="field-layer fixed">
        <Faces images={others} slots="detail" />
      </Parallax>
      <div className="vignette" aria-hidden="true" />

      <div className="top over">
        <Link href="/" className="serif logo">
          Luke Ketz
        </Link>
        <Link href="/" className="mono back">
          {it.portrait.back}
        </Link>
      </div>

      <main className="portrait-main">
        <figure className="hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            srcSet={photo.srcSet}
            sizes="(max-width: 900px) 90vw, 40vw"
            alt={photo.alt || it.portraits.alt(n)}
            width={photo.width}
            height={photo.height}
            fetchPriority="high"
            style={{ background: photo.dominantColor ?? undefined }}
          />
          <span className="corner tl" aria-hidden="true" />
          <span className="corner br" aria-hidden="true" />
        </figure>

        <div className="portrait-text">
          <span className="kicker mono">
            N° {num} · {it.home.question}
          </span>
          {doc.question && <h1 className="serif question big">{doc.question}</h1>}
          <svg className="stroke" aria-hidden="true" viewBox="0 0 420 26">
            <path
              d="M4 18 C 80 6, 170 22, 250 12 S 380 8, 416 16"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          {doc.note && <p className="serif note">{doc.note}</p>}
          {meta && <span className="mono meta">{meta}</span>}
        </div>
      </main>

      <div className="portrait-bottom">
        <div className="steps">
          <Link href={`/ritratti/${prev.slug}`} className="mono step" rel="prev">
            {it.portrait.prev}
          </Link>
          <span className="mono muted">
            {num} / {String(all.length).padStart(2, '0')}
          </span>
          <Link href={`/ritratti/${next.slug}`} className="mono step" rel="next">
            {it.portrait.next}
          </Link>
        </div>
        <SiteNav current="portraits" />
      </div>
    </div>
  )
}

export default function PortraitPage(props: Props) {
  return (
    <Suspense fallback={null}>
      <PortraitView params={props.params} />
    </Suspense>
  )
}
