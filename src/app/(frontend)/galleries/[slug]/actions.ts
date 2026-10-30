'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { galleryToken, isExpired, verifyPassword } from '@/lib/password'
import { payload } from '@/lib/payload'
import { allowGalleryAttempt, clientIp } from '@/lib/ratelimit'

export async function unlock(slug: string, _prev: { error?: string } | undefined, form: FormData) {
  if (!(await allowGalleryAttempt(clientIp(await headers()), slug))) {
    return { error: 'Too many attempts. Try again in a few minutes.' }
  }
  const password = String(form.get('password') ?? '')
  const gallery = (
    await (
      await payload()
    ).find({
      collection: 'private-galleries',
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
  ).docs[0]

  if (!gallery?.passwordHash || !verifyPassword(password, gallery.passwordHash)) {
    return { error: 'Wrong password' }
  }
  if (isExpired(gallery.expiresAt)) return { error: 'This gallery is no longer available' }

  // Read-then-write: two simultaneous entries can count once, which is fine for a rough counter.
  await (
    await payload()
  ).update({
    collection: 'private-galleries',
    id: gallery.id,
    overrideAccess: true,
    data: { accessCount: (gallery.accessCount ?? 0) + 1, lastAccessAt: new Date().toISOString() },
  })

  ;(await cookies()).set(`gallery_${slug}`, galleryToken(slug, gallery.passwordHash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: `/galleries/${slug}`,
    maxAge: 60 * 60 * 24 * 7,
  })
  redirect(`/galleries/${slug}`)
}
