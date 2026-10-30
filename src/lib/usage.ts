import { APIError } from 'payload'
import type { CollectionBeforeDeleteHook, Payload, PayloadRequest, Where } from 'payload'

// Where each upload collection is referenced. Add an entry when a new collection or field
// starts pointing at photos, otherwise they can be deleted while still in use.
type Usage = {
  collection: 'projects' | 'pages' | 'posts' | 'private-galleries'
  label: string
  where: (id: number | string) => Where
}

const PUBLIC_USAGES: Usage[] = [
  { collection: 'projects', label: 'project (cover)', where: (id) => ({ cover: { equals: id } }) },
  {
    collection: 'projects',
    label: 'project (photos)',
    where: (id) => ({ 'photos.image': { equals: id } }),
  },
  {
    collection: 'projects',
    label: 'project (SEO image)',
    where: (id) => ({ 'seo.image': { equals: id } }),
  },
  {
    collection: 'pages',
    label: 'page (SEO image)',
    where: (id) => ({ 'seo.image': { equals: id } }),
  },
  { collection: 'posts', label: 'post (image)', where: (id) => ({ cover: { equals: id } }) },
  {
    collection: 'posts',
    label: 'post (SEO image)',
    where: (id) => ({ 'seo.image': { equals: id } }),
  },
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
    for (const d of docs) found.push(`${u.label}: "${(d as { title?: string }).title ?? d.id}"`)
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

// The site settings global holds the default social image.
const settingsUsage = async (payload: Payload, id: number | string) => {
  const s = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  return s.ogImage === id ? ['site settings (default social image)'] : []
}

export const protectPublicMedia = guard(PUBLIC_USAGES, settingsUsage)
export const protectPrivateMedia = guard(PRIVATE_USAGES)
