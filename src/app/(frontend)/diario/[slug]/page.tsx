import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { getPortraits, getPost, getPosts, getPostSlugs, getSettings } from '@/lib/data'
import { env } from '@/lib/env'
import { seoMetadata } from '@/lib/metadata'
import { staticSlugParams } from '@/lib/static-params'
import { ArticleCampo, ArticleDietro, ArticleDomande, ArticleFotoracconto } from '@/site/articles'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return staticSlugParams(await getPostSlugs())
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug)
  return p ? seoMetadata(p.title, p.seo, p.excerpt, `/diario/${p.slug}`) : {}
}

async function ArticleView({ params }: Props) {
  const slug = (await params).slug
  const [post, posts, portraits, s] = await Promise.all([
    getPost(slug),
    getPosts(),
    getPortraits(),
    getSettings(),
  ])
  if (!post) notFound()

  // The page after this one; the newest wraps around to the oldest.
  const i = posts.findIndex((p) => p.slug === slug)
  const following = posts.length > 1 ? posts[(i + 1) % posts.length] : null
  const next = following
    ? { slug: following.slug, title: following.title, theme: following.theme }
    : null
  const faces = portraits.slice(0, 8).map((p) => p.doc.image)
  const cover = typeof post.cover === 'object' && post.cover ? post.cover.url : undefined

  const view = { post, next, faces }
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt ?? undefined,
          image: cover,
          datePublished: post.publishedAt ?? undefined,
          dateModified: post.updatedAt,
          mainEntityOfPage: `${env.NEXT_PUBLIC_SITE_URL}/diario/${post.slug}`,
          author: { '@type': 'Person', name: s.siteName },
        }}
      />
      {post.layout === 'fotoracconto' ? (
        <ArticleFotoracconto {...view} />
      ) : post.layout === 'domande' ? (
        <ArticleDomande {...view} />
      ) : post.layout === 'dietro' ? (
        <ArticleDietro {...view} />
      ) : (
        <ArticleCampo {...view} />
      )}
    </>
  )
}

export default function ArticlePage(props: Props) {
  return (
    <Suspense fallback={null}>
      <ArticleView params={props.params} />
    </Suspense>
  )
}
