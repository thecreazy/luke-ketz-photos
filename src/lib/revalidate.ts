import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  GlobalAfterChangeHook,
  GlobalConfig,
} from 'payload'

// Tags used by the cached readers in src/lib/data.ts:
//   settings · about · media · pages / page:<slug> · projects / project:<slug> · portraits /
//   portrait:<slug> · posts / post:<slug>

// `{ expire: 0 }`: stale content is never served, so the first visit after an edit gets fresh data.
const invalidate = (tags: (string | null | undefined)[]) => {
  for (const tag of new Set(tags.filter(Boolean) as string[])) {
    try {
      revalidateTag(tag, { expire: 0 })
    } catch {
      // Called outside a request (seed, scripts, migrations): nothing is cached there anyway.
    }
  }
}

type Doc = { slug?: string | null; _status?: string | null }

/** Hooks for a collection whose documents are read through `<single>:<slug>` and `<list>` tags. */
export const revalidateOnChange = (
  single: string,
  list: string,
): Pick<NonNullable<CollectionConfig['hooks']>, 'afterChange' | 'afterDelete'> => {
  const afterChange: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
    if (req.context.disableRevalidate) return doc
    const d = doc as Doc
    const prev = previousDoc as Doc | undefined
    // A draft save of a document that was never published changes nothing public.
    if (d._status !== 'published' && prev?._status !== 'published') return doc
    invalidate([list, `${single}:${d.slug}`, prev?.slug && `${single}:${prev.slug}`])
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
    if (req.context.disableRevalidate) return doc
    invalidate([list, `${single}:${(doc as Doc).slug}`])
    return doc
  }

  return { afterChange: [afterChange], afterDelete: [afterDelete] }
}

// A photo edit (alt text, replaced file) shows up in every cached read that populates media.
export const revalidateMedia: Pick<
  NonNullable<CollectionConfig['hooks']>,
  'afterChange' | 'afterDelete'
> = {
  afterChange: [
    ({ doc, req }) => (req.context.disableRevalidate ? doc : (invalidate(['media']), doc)),
  ],
  afterDelete: [
    ({ doc, req }) => (req.context.disableRevalidate ? doc : (invalidate(['media']), doc)),
  ],
}

export const revalidateGlobal = (tag: string): GlobalConfig['hooks'] => {
  const afterChange: GlobalAfterChangeHook = ({ doc, req }) => {
    if (!req.context.disableRevalidate) invalidate([tag])
    return doc
  }
  return { afterChange: [afterChange] }
}

export const revalidateSettings = revalidateGlobal('settings')
