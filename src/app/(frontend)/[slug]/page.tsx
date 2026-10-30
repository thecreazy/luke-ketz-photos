import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'

import { Rich } from '@/components/Rich'
import { getPage, getPageSlugs } from '@/lib/data'
import { seoMetadata } from '@/lib/metadata'
import { staticSlugParams } from '@/lib/static-params'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return staticSlugParams(await getPageSlugs())
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pg = await getPage((await params).slug)
  return pg ? seoMetadata(pg.title, pg.seo, undefined, `/${pg.slug}`) : {}
}

async function PageView({ params }: Props) {
  const { slug } = await params
  if (slug === 'home') redirect('/')
  const pg = await getPage(slug)
  if (!pg) notFound()

  return (
    <article>
      <h1>{pg.title}</h1>
      <Rich data={pg.content} />
    </article>
  )
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={null}>
      <PageView params={props.params} />
    </Suspense>
  )
}
