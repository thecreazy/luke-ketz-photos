import type { CollectionConfig } from 'payload'

import { seoField } from '@/lib/seo'
import { revalidateOnChange } from '@/lib/revalidate'
import { slugField } from '@/lib/slug'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'Project', plural: 'Projects' },
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
    { name: 'cover', type: 'upload', relationTo: 'media', required: true, label: 'Cover' },
    {
      name: 'photos',
      type: 'array',
      label: 'Photos',
      admin: {
        initCollapsed: true,
        description:
          'Drag rows to reorder. To add many photos at once use "Upload photos" in the menu and pick this project.',
        components: { RowLabel: '/components/admin/PhotoRowLabel#PhotoRowLabel' },
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', label: 'Caption' },
      ],
    },
    seoField,
  ],
  hooks: revalidateOnChange('project', 'projects'),
}
