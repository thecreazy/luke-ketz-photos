import type { Media, Post } from '@/payload-types'

type Ref = Media | number | null | undefined
const isRef = (m: Ref): m is Media | number => m !== null && m !== undefined

// The first photo placed in the text (an upload node of the rich text editor), depth first.
const firstInText = (node: unknown): Ref => {
  if (!node || typeof node !== 'object') return undefined
  const n = node as { type?: string; relationTo?: string; value?: Ref; children?: unknown[] }
  if (n.type === 'upload' && n.relationTo === 'media') return n.value
  for (const child of n.children ?? []) {
    const found = firstInText(child)
    if (isRef(found)) return found
  }
  const root = (node as { root?: unknown }).root
  return root ? firstInText(root) : undefined
}

/**
 * The first photo of an article: in the text, then the moments of the day, then the contact sheet
 * frames. Used when the article has no "Main photo" of its own.
 */
export const firstPhotoOf = (
  doc: Pick<Post, 'content' | 'sections' | 'timeline'> | Partial<Post>,
): Ref =>
  firstInText(doc.content) ??
  doc.sections?.find((s) => s.photos?.length)?.photos?.[0]?.image ??
  doc.timeline?.find((t) => t.frames?.length)?.frames?.[0]

/** The article's own "Main photo", or else its first photo. */
export const coverOf = (doc: Partial<Post>): Ref =>
  isRef(doc.cover) ? doc.cover : firstPhotoOf(doc)
