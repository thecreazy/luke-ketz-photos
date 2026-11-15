import type { CollectionConfig } from 'payload'

import { revalidateOnChange } from '@/lib/revalidate'

export const NETWORKS = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'X', value: 'x' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Website', value: 'website' },
] as const

// What the people who worked with Luke (models, make-up artists, photographers) say about him.
// Each one has their own question. Saved as drafts like the portraits, so nothing goes public
// before the person agreed to it and someone published it.
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }) },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['photo', 'name', 'role', 'quote', 'order', '_status'],
    description:
      'The people who worked with Luke (models, make-up artists, photographers), shown on the "Dicono di me" page. Each one has their own question.',
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name or nickname',
    },
    {
      name: 'role',
      type: 'text',
      label: 'Role',
      admin: {
        description: 'Optional, shown by the name. For example: Modella, Modello, MUA, Fotografo.',
      },
    },
    { name: 'photo', type: 'upload', relationTo: 'media', required: true, label: 'Photo' },
    {
      name: 'question',
      type: 'textarea',
      label: 'Question for this person',
      admin: {
        description:
          'The question this person answers. If you leave it empty, the standard question of the page is used (Pages → Dicono di me).',
      },
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      label: 'What they say',
      admin: { description: 'The answer to their question, in their words.' },
    },
    {
      name: 'profiles',
      type: 'array',
      label: 'Social profiles',
      admin: { description: 'Optional. Shown under the answer, in this order.' },
      fields: [
        {
          name: 'network',
          type: 'select',
          required: true,
          defaultValue: 'instagram',
          options: [...NETWORKS],
        },
        {
          name: 'handle',
          type: 'text',
          required: true,
          label: 'Handle or link',
          admin: {
            description:
              'The handle (@name) or the full link of the profile. A website needs the full link.',
          },
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Order',
      admin: { position: 'sidebar', description: 'Lower = first.' },
    },
  ],
  hooks: revalidateOnChange('testimonial', 'testimonials'),
}
