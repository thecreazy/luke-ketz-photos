import type { CollectionConfig } from 'payload'

import { seoField } from '@/lib/seo'
import { revalidateOnChange } from '@/lib/revalidate'
import { slugField } from '@/lib/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }) },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
    description:
      'The page with slug "home" is the site home (/): its text is shown above the projects.',
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Title' },
    slugField,
    { name: 'content', type: 'richText', label: 'Content' },
    seoField,
  ],
  hooks: revalidateOnChange('page', 'pages'),
}
