import type { Media } from '@/payload-types'

export type PhotoSources = {
  src: string
  srcSet: string
  width: number
  height: number
  alt: string
  blurDataURL?: string | null
  dominantColor?: string | null
  /** Private photos: a link that saves the full-size file. */
  download?: string
}

// Builds the responsive sources of a Media doc from its stored variants (sm 640, md 1280, full).
export const photoSources = (media: Media | number | null | undefined): PhotoSources | null => {
  if (!media || typeof media === 'number' || !media.url || !media.width || !media.height)
    return null

  const candidates = [
    { url: media.sizes?.sm?.url, width: media.sizes?.sm?.width },
    { url: media.sizes?.md?.url, width: media.sizes?.md?.width },
    { url: media.url, width: media.width },
  ].filter((c): c is { url: string; width: number } => Boolean(c.url && c.width))

  return {
    src: media.sizes?.md?.url ?? media.url,
    srcSet: candidates.map((c) => `${c.url} ${c.width}w`).join(', '),
    width: media.width,
    height: media.height,
    alt: media.alt ?? '',
    blurDataURL: media.blurDataURL,
    dominantColor: media.dominantColor,
  }
}
