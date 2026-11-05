import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { getCopy, getPortraits, getSettings } from '@/lib/data'
import { galleryToken, isExpired, tokenMatches } from '@/lib/password'
import { payload } from '@/lib/payload'
import type { PhotoSources } from '@/lib/photo'
import { signedPhotoSources } from '@/lib/private-photo'
import { Faces } from '@/site/Faces'
import { GalleryViewer } from '@/site/GalleryViewer'
import { GateRoom } from '@/site/GateRoom'
import { SiteFooter } from '@/site/SiteFooter'
import { SiteHeader } from '@/site/SiteHeader'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getCopy()).gate.private, robots: { index: false, follow: false } }
}

// Reads cookies and the private bucket on every request: never cached.
async function GalleryView({ params }: Props) {
  const { slug } = await params
  const gallery = (
    await (
      await payload()
    ).find({
      collection: 'private-galleries',
      depth: 1,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
  ).docs[0]
  if (!gallery?.passwordHash) notFound()

  const [portraits, copy, settings] = await Promise.all([getPortraits(), getCopy(), getSettings()])
  const it = copy.gate
  const faces = (
    <Faces images={portraits.slice(0, 9).map((p) => p.doc.image)} slots="room" soften={0} />
  )

  if (isExpired(gallery.expiresAt)) {
    return (
      <div className="field glow room">
        <div className="field-layer">{faces}</div>
        <div className="room-veil" aria-hidden="true" />
        <main id="main" tabIndex={-1} className="gate">
          <span className="mono muted">{gallery.title}</span>
          <p className="serif question">{it.expired}</p>
        </main>
      </div>
    )
  }

  const token = (await cookies()).get(`gallery_${slug}`)?.value
  if (!token || !tokenMatches(token, galleryToken(slug, gallery.passwordHash))) {
    return (
      <GateRoom slug={slug} title={gallery.title} siteName={settings.siteName} copy={it}>
        {faces}
      </GateRoom>
    )
  }

  const photos = (
    await Promise.all(
      (gallery.photos ?? []).map((x) => (typeof x === 'number' ? null : signedPhotoSources(x))),
    )
  ).filter((p): p is PhotoSources => p !== null)

  return (
    <div className="page">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="wrap private-gallery">
        <span className="mono accent">{it.open}</span>
        <h1 className="serif big">{gallery.title}</h1>
        {gallery.intro && <p className="serif hint">{gallery.intro}</p>}
        <GalleryViewer
          copy={it}
          photos={photos.map((p) => ({
            src: p.src,
            srcSet: p.srcSet,
            width: p.width,
            height: p.height,
            alt: p.alt || gallery.title,
            blur: p.blurDataURL,
            download: p.download,
          }))}
        />
      </main>
      <SiteFooter />
    </div>
  )
}

export default function PrivateGallery(props: Props) {
  return (
    <Suspense fallback={null}>
      <GalleryView params={props.params} />
    </Suspense>
  )
}
