import type { PrivateMedia } from '@/payload-types'

import type { PhotoSources } from './photo'
import { signPrivateUrl } from './s3'

// Same as photoSources(), but every variant URL is signed for the private bucket.
export const signedPhotoSources = async (media: PrivateMedia): Promise<PhotoSources | null> => {
  if (!media.filename || !media.width || !media.height) return null

  const variants = [
    { filename: media.sizes?.sm?.filename, width: media.sizes?.sm?.width },
    { filename: media.sizes?.md?.filename, width: media.sizes?.md?.width },
    { filename: media.filename, width: media.width },
  ].filter((v): v is { filename: string; width: number } => Boolean(v.filename && v.width))

  const signed = await Promise.all(
    variants.map(async (v) => ({ url: await signPrivateUrl(v.filename), width: v.width })),
  )

  return {
    src:
      signed.find((v) => v.width === media.sizes?.md?.width)?.url ?? signed[signed.length - 1].url,
    srcSet: signed.map((v) => `${v.url} ${v.width}w`).join(', '),
    width: media.width,
    height: media.height,
    alt: media.alt ?? '',
    blurDataURL: media.blurDataURL,
  }
}
