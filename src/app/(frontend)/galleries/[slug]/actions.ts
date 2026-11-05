'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { galleryToken, isExpired, verifyPassword } from '@/lib/password'
import { payload } from '@/lib/payload'
import { allowGalleryAttempt, clientIp } from '@/lib/ratelimit'
import { getCopy } from '@/lib/data'

type State = { error: string; n: number } | undefined

export async function unlock(slug: string, _prev: State, form: FormData): Promise<State> {
  const it = (await getCopy()).gate
  // `n` changes on every refusal, so the form can replay its "shake".
  const refuse = (error: string) => ({ error, n: Date.now() })

  if (!(await allowGalleryAttempt(clientIp(await headers()), slug))) {
    return refuse(it.tooMany)
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
    return refuse(it.wrong)
  }
  if (isExpired(gallery.expiresAt)) return refuse(it.expired)

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
