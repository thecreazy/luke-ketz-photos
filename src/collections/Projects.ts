import type { CollectionConfig } from 'payload'

import { seoField } from '@/lib/seo'
import { revalidateOnChange } from '@/lib/revalidate'
import { slugField } from '@/lib/slug'

// Here a "project" is a series of portraits (the filter on the Portraits page). The portraits
// themselves are in the Portraits collection and point to their series.
export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Series', plural: 'Series' },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }) },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'order', '_status'] },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Title' },
    slugField,
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Order',
      admin: { position: 'sidebar', description: 'Lower = first' },
    },
    { name: 'year', type: 'number', label: 'Year' },
    { name: 'description', type: 'textarea', label: 'Description' },
    seoField,
  ],
  hooks: revalidateOnChange('project', 'projects'),
}
