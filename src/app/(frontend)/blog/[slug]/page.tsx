import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { Photo } from '@/components/Photo'
import { Rich } from '@/components/Rich'
import { getPost, getPostSlugs, getSettings } from '@/lib/data'
import { env } from '@/lib/env'
import { seoMetadata } from '@/lib/metadata'
import { staticSlugParams } from '@/lib/static-params'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return staticSlugParams(await getPostSlugs())
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug)
  return p ? seoMetadata(p.title, p.seo, p.excerpt, `/blog/${p.slug}`) : {}
}

async function PostView({ params }: Props) {
  const [p, s] = await Promise.all([getPost((await params).slug), getSettings()])
  if (!p) notFound()

  const cover = typeof p.cover === 'object' && p.cover ? p.cover.url : undefined
  return (
    <article>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: p.title,
          description: p.excerpt ?? undefined,
          image: cover,
          datePublished: p.publishedAt ?? undefined,
          dateModified: p.updatedAt,
          mainEntityOfPage: `${env.NEXT_PUBLIC_SITE_URL}/blog/${p.slug}`,
          author: { '@type': 'Person', name: s.siteName },
        }}
      />
      <h1>{p.title}</h1>
      <Photo media={p.cover} />
      <Rich data={p.content} />
    </article>
  )
}

export default function PostPage(props: Props) {
  return (
    <Suspense fallback={null}>
      <PostView params={props.params} />
    </Suspense>
  )
}
