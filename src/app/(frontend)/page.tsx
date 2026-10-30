import type { Metadata } from 'next'
import Link from 'next/link'

import { JsonLd } from '@/components/JsonLd'
import { Photo } from '@/components/Photo'
import { Rich } from '@/components/Rich'
import { getPage, getProjects, getSettings } from '@/lib/data'
import { env } from '@/lib/env'
import { seoMetadata } from '@/lib/metadata'

export async function generateMetadata(): Promise<Metadata> {
  const home = await getPage('home')
  return {
    alternates: { canonical: '/' },
    ...(home?.seo ? seoMetadata(home.title, home.seo, undefined, '/') : {}),
  }
}

export default async function Home() {
  const [home, projects, s] = await Promise.all([getPage('home'), getProjects(), getSettings()])

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: s.siteName,
          url: env.NEXT_PUBLIC_SITE_URL,
          description: s.description ?? s.tagline ?? undefined,
          author: {
            '@type': 'Person',
            name: s.siteName,
            sameAs: s.instagram ? [s.instagram] : undefined,
          },
        }}
      />
      {home?.content && <Rich data={home.content} />}
      <section className="grid">
        {projects.map((p, i) => (
          <figure key={p.id}>
            <Link href={`/projects/${p.slug}`}>
              <Photo media={p.cover} sizes="(min-width: 900px) 33vw, 100vw" priority={i < 3} />
              <figcaption>{p.title}</figcaption>
            </Link>
          </figure>
        ))}
      </section>
    </>
  )
}
