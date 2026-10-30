import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { Photo } from '@/components/Photo'
import { getProject, getProjectSlugs } from '@/lib/data'
import { env } from '@/lib/env'
import { seoMetadata } from '@/lib/metadata'
import { staticSlugParams } from '@/lib/static-params'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return staticSlugParams(await getProjectSlugs())
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProject((await params).slug)
  return p ? seoMetadata(p.title, p.seo, p.description, `/projects/${p.slug}`) : {}
}

async function ProjectView({ params }: Props) {
  const p = await getProject((await params).slug)
  if (!p) notFound()

  const cover = typeof p.cover === 'object' ? p.cover.url : undefined
  return (
    <article>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: p.title,
          description: p.description ?? undefined,
          url: `${env.NEXT_PUBLIC_SITE_URL}/projects/${p.slug}`,
          image: cover,
          dateModified: p.updatedAt,
        }}
      />
      <h1>{p.title}</h1>
      {p.description && <p className="muted">{p.description}</p>}
      <div className="stack">
        {p.photos?.map((ph) => (
          <figure key={ph.id} style={{ margin: 0 }}>
            <Photo media={ph.image} sizes="(min-width: 1200px) 1200px, 100vw" />
            {ph.caption && <figcaption className="muted">{ph.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </article>
  )
}

export default function ProjectPage(props: Props) {
  return (
    <Suspense fallback={null}>
      <ProjectView params={props.params} />
    </Suspense>
  )
}
