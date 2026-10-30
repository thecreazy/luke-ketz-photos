import type { CollectionConfig } from 'payload'

import { seoField } from '@/lib/seo'
import { revalidateOnChange } from '@/lib/revalidate'
import { slugField } from '@/lib/slug'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Post', plural: 'Blog' },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }) },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'publishedAt', '_status'] },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Title' },
    slugField,
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'excerpt', type: 'textarea', label: 'Excerpt' },
    { name: 'cover', type: 'upload', relationTo: 'media', label: 'Image' },
    { name: 'content', type: 'richText', label: 'Content' },
    seoField,
  ],
  hooks: revalidateOnChange('post', 'posts'),
}
