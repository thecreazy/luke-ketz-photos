import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'

import { Rich } from '@/components/Rich'
import { SiteFooter } from '@/site/SiteFooter'
import { SiteHeader } from '@/site/SiteHeader'
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
    <div className="page">
      <SiteHeader />
      <main className="col">
        <h1 className="serif big">{pg.title}</h1>
        <div className="prose body">
          <Rich data={pg.content} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

export default function Page(props: Props) {
  return (
    <Suspense fallback={null}>
      <PageView params={props.params} />
    </Suspense>
  )
}
