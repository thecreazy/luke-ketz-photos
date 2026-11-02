import { APIError } from 'payload'
import type { CollectionBeforeDeleteHook, Payload, PayloadRequest, Where } from 'payload'

// Where each upload collection is referenced. Add an entry when a new collection or field
// starts pointing at photos, otherwise they can be deleted while still in use.
type Usage = {
  collection: 'projects' | 'pages' | 'posts' | 'portraits' | 'private-galleries'
  label: string
  where: (id: number | string) => Where
}

const seo = (collection: Usage['collection'], label: string): Usage => ({
  collection,
  label: `${label} (SEO image)`,
  where: (id) => ({ 'seo.image': { equals: id } }),
})

const PUBLIC_USAGES: Usage[] = [
  { collection: 'portraits', label: 'portrait', where: (id) => ({ image: { equals: id } }) },
  seo('portraits', 'portrait'),
  seo('projects', 'series'),
  seo('pages', 'page'),
  {
    collection: 'posts',
    label: 'article (main photo)',
    where: (id) => ({ cover: { equals: id } }),
  },
  {
    collection: 'posts',
    label: 'article (photo story)',
    where: (id) => ({ 'sections.photos.image': { equals: id } }),
  },
  {
    collection: 'posts',
    label: 'article (contact sheet)',
    where: (id) => ({ 'timeline.frames': { equals: id } }),
  },
  seo('posts', 'article'),
]

const PRIVATE_USAGES: Usage[] = [
  {
    collection: 'private-galleries',
    label: 'private gallery',
    where: (id) => ({ photos: { equals: id } }),
  },
]

const findUsages = async (
  payload: Payload,
  req: PayloadRequest,
  usages: Usage[],
  id: number | string,
): Promise<string[]> => {
  const found: string[] = []
  for (const u of usages) {
    // draft: true also looks at unpublished drafts, which live in the versions tables.
    const { docs } = await payload.find({
      collection: u.collection,
      where: u.where(id),
      depth: 0,
      limit: 5,
      draft: true,
      req,
    })
    for (const d of docs) {
      const named = d as { title?: string; question?: string }
      found.push(`${u.label}: "${named.title ?? named.question ?? d.id}"`)
    }
  }
  return found
}

const guard =
  (
    usages: Usage[],
    extra?: (payload: Payload, id: number | string) => Promise<string[]>,
  ): CollectionBeforeDeleteHook =>
  async ({ id, req }) => {
    const found = [
      ...(await findUsages(req.payload, req, usages, id)),
      ...((await extra?.(req.payload, id)) ?? []),
    ]
    if (found.length === 0) return
    // isPublic: the message reaches the admin instead of "Something went wrong".
    throw new APIError(
      `This photo is still in use (${[...new Set(found)].join('; ')}). Remove it from there first.`,
      409,
      undefined,
      true,
    )
  }

// Globals hold photos too: the default social image and the portrait on the About page.
const globalsUsage = async (payload: Payload, id: number | string) => {
  const [settings, about] = await Promise.all([
    payload.findGlobal({ slug: 'site-settings', depth: 0 }),
    payload.findGlobal({ slug: 'about', depth: 0 }),
  ])
  return [
    ...(settings.ogImage === id ? ['site settings (default social image)'] : []),
    ...(about.portrait === id ? ['Chi è page (portrait)'] : []),
  ]
}

export const protectPublicMedia = guard(PUBLIC_USAGES, globalsUsage)
export const protectPrivateMedia = guard(PRIVATE_USAGES)
