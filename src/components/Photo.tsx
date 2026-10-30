import React from 'react'

import { photoSources } from '@/lib/photo'
import type { Media } from '@/payload-types'

type Props = {
  media: Media | number | null | undefined
  /** Same meaning as the `sizes` attribute: how wide the image is rendered. */
  sizes?: string
  /** Above-the-fold image: loads eagerly with high priority. */
  priority?: boolean
}

// Plain <img> with a srcset built from the variants stored in the bucket: no on-demand optimiser.
// width/height reserve the space (no layout shift); the blur/colour shows while the file loads.
export const Photo = ({ media, sizes = '100vw', priority }: Props) => {
  const p = photoSources(media)
  if (!p) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={p.src}
      srcSet={p.srcSet}
      sizes={sizes}
      width={p.width}
      height={p.height}
      alt={p.alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      style={{
        backgroundColor: p.dominantColor ?? undefined,
        backgroundImage: p.blurDataURL ? `url("${p.blurDataURL}")` : undefined,
        backgroundSize: 'cover',
      }}
    />
  )
}
