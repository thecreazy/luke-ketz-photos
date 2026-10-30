import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { galleryToken, isExpired, tokenMatches } from '@/lib/password'
import { payload } from '@/lib/payload'
import type { PhotoSources } from '@/lib/photo'
import { signedPhotoSources } from '@/lib/private-photo'

import { UnlockForm } from './UnlockForm'

type Props = { params: Promise<{ slug: string }> }

export const metadata: Metadata = {
  title: 'Private gallery',
  robots: { index: false, follow: false },
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
  if (isExpired(gallery.expiresAt)) {
    return (
      <section>
        <h1>{gallery.title}</h1>
        <p className="muted">
          This gallery is no longer available. Please contact the photographer.
        </p>
      </section>
    )
  }

  const token = (await cookies()).get(`gallery_${slug}`)?.value
  if (!token || !tokenMatches(token, galleryToken(slug, gallery.passwordHash))) {
    return (
      <section>
        <h1>{gallery.title}</h1>
        <UnlockForm slug={slug} />
      </section>
    )
  }

  const photos = (
    await Promise.all(
      (gallery.photos ?? []).map((x) => (typeof x === 'number' ? null : signedPhotoSources(x))),
    )
  ).filter((p): p is PhotoSources => p !== null)

  return (
    <section>
      <h1>{gallery.title}</h1>
      {gallery.intro && <p className="muted">{gallery.intro}</p>}
      <div className="stack">
        {photos.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p.src}
            src={p.src}
            srcSet={p.srcSet}
            sizes="(min-width: 1200px) 1200px, 100vw"
            width={p.width}
            height={p.height}
            alt={p.alt}
            loading="lazy"
            decoding="async"
            style={{
              backgroundImage: p.blurDataURL ? `url("${p.blurDataURL}")` : undefined,
              backgroundSize: 'cover',
            }}
          />
        ))}
      </div>
    </section>
  )
}

export default function PrivateGallery(props: Props) {
  return (
    <Suspense fallback={null}>
      <GalleryView params={props.params} />
    </Suspense>
  )
}
