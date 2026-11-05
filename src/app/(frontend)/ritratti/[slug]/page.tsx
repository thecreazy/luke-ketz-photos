import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense, ViewTransition } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { getCopy, getPortraits, getPortraitSlugs, getSettings } from '@/lib/data'
import { photoSources } from '@/lib/photo'
import { staticSlugParams } from '@/lib/static-params'
import { absolute, breadcrumb, person } from '@/lib/jsonld'
import { defaultOgImage, seoMetadata } from '@/lib/metadata'
import { fmt } from '@/site/copy'
import { Parallax } from '@/site/Parallax'
import { SiteMenu } from '@/site/SiteMenu'
import { BackLink } from '@/site/BackLink'
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
  const [copy, settings] = await Promise.all([getCopy(), getSettings()])
  const title = doc.question || fmt(copy.portraits.alt, { n: String(n).padStart(2, '0') })
  const description =
    doc.note ||
    fmt(copy.portraits.metaDescription, {
      question: doc.question ?? '',
      n,
      siteName: settings.siteName,
    }).trim()
  return seoMetadata(title, doc.seo, description, `/ritratti/${doc.slug}`, await defaultOgImage())
}

async function PortraitView({ params }: Props) {
  const { slug } = await params
  const [all, copy, settings] = await Promise.all([getPortraits(), getCopy(), getSettings()])
  const it = copy.portraits
  const index = all.findIndex((p) => p.doc.slug === slug)
  if (index < 0) notFound()

  const { doc, n } = all[index]
  const photo = photoSources(doc.image)
  if (!photo) notFound()

  const prev = all[(index + all.length - 1) % all.length].doc
  const next = all[(index + 1) % all.length].doc
  const series = typeof doc.series === 'object' && doc.series ? doc.series.title : it.single
  const meta = [doc.subject, series, doc.year].filter(Boolean).join(' · ')
  const num = String(n).padStart(2, '0')
  const others = all.filter((_, i) => i !== index).map((p) => p.doc.image)

  return (
    <div className="field glow portrait">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'ImageObject',
            contentUrl: photo.src,
            thumbnailUrl: photo.srcSet.split(' ')[0],
            width: photo.width,
            height: photo.height,
            name: doc.question || fmt(it.alt, { n }),
            caption: doc.note || undefined,
            creator: person({ name: settings.siteName }),
            datePublished: doc.createdAt,
            url: absolute(`/ritratti/${doc.slug}`),
          },
          breadcrumb([
            ['Home', '/'],
            [copy.titles.portraits, '/ritratti'],
            [doc.question || fmt(it.alt, { n }), `/ritratti/${doc.slug}`],
          ]),
        ]}
      />
      <Parallax className="field-layer fixed">
        <Faces images={others} slots="detail" />
      </Parallax>
      <div className="vignette" aria-hidden="true" />

      <div className="top over">
        <Link href="/" className="serif logo">
          {settings.siteName}
        </Link>
        <BackLink label={it.back} backLabel={it.backPrev} />
      </div>

      <main className="portrait-main">
        <figure className="hero">
          <ViewTransition name={`portrait-${doc.slug}`} share="morph" default="none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              srcSet={photo.srcSet}
              sizes="(max-width: 900px) 90vw, 40vw"
              alt={photo.alt || fmt(it.alt, { n })}
              width={photo.width}
              height={photo.height}
              fetchPriority="high"
              style={{ background: photo.dominantColor ?? undefined }}
            />
          </ViewTransition>
          <span className="corner tl" aria-hidden="true" />
          <span className="corner br" aria-hidden="true" />
        </figure>

        <div className="portrait-text">
          <span className="kicker mono">
            N° {num} · {copy.home.question}
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
            {it.prev}
          </Link>
          <span className="mono muted">
            {num} / {String(all.length).padStart(2, '0')}
          </span>
          <Link href={`/ritratti/${next.slug}`} className="mono step" rel="next">
            {it.next}
          </Link>
        </div>
        <SiteMenu current="ritratti" />
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
