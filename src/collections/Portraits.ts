import type { CollectionConfig, FieldHook } from 'payload'

import { revalidateOnChange } from '@/lib/revalidate'
import { slugify } from '@/lib/slug'
import { seoField } from '@/lib/seo'

// A random suffix keeps the address stable when the question is edited later and unique when
// two portraits share the same question.
const fromQuestion: FieldHook = ({ value, data }) => {
  if (typeof value === 'string' && value.trim()) return slugify(value)
  const base = typeof data?.question === 'string' ? slugify(data.question).slice(0, 40) : ''
  return `${base || 'ritratto'}-${Math.random().toString(36).slice(2, 7)}`
}

// One photograph with the question it answers. The number shown on the site (N° 01) is its
// position in the list sorted by "Order", so reordering renumbers them.
export const Portraits: CollectionConfig = {
  slug: 'portraits',
  labels: { singular: 'Portrait', plural: 'Portraits' },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }) },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['image', 'question', 'series', 'featured', '_status'],
    description:
      'Add many at once from "Upload photos" (Destination: Photos, then "Create portraits"). Each portrait is saved as a draft: write its question and publish it.',
  },
  defaultSort: 'order',
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Photo' },
    {
      name: 'question',
      type: 'text',
      label: 'Question',
      admin: {
        description: 'The question this portrait answers, e.g. "Chi vedi, quando ti guardi?"',
      },
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'A line from Luke',
      admin: {
        description: 'One line on the moment of the shot: what happened after the question.',
      },
    },
    {
      name: 'subject',
      type: 'text',
      label: 'Name or initials',
      admin: { description: 'Shown under the note. Leave empty to show nothing.' },
    },
    { name: 'year', type: 'number', label: 'Year' },
    {
      name: 'series',
      type: 'relationship',
      relationTo: 'projects',
      label: 'Series',
      admin: { description: 'Leave empty for a single portrait ("Ritratti singoli").' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Generated automatically' },
      hooks: { beforeValidate: [fromQuestion] },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      label: 'Order',
      admin: { position: 'sidebar', description: 'Lower = first. Sets the N° shown on the site.' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show in the home field',
      admin: {
        position: 'sidebar',
        description:
          'The home floats about 13 portraits; tick the ones to use (it needs a question).',
      },
    },
    seoField,
  ],
  hooks: revalidateOnChange('portrait', 'portraits'),
}
