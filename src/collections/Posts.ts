import type { CollectionConfig, Condition } from 'payload'

import { seoField } from '@/lib/seo'
import { revalidateOnChange } from '@/lib/revalidate'
import { slugField } from '@/lib/slug'

export const THEMES = [
  { label: 'Vita da fotografo', value: 'vita-da-fotografo' },
  { label: 'Mostre', value: 'mostre' },
  { label: 'Dietro il ritratto', value: 'dietro-il-ritratto' },
] as const

export const LAYOUTS = [
  { label: 'A · Campo (text, big quote, portrait)', value: 'campo' },
  { label: 'B · Fotoracconto (photos through the day)', value: 'fotoracconto' },
  { label: 'C · Domande e risposte (questions and answers)', value: 'domande' },
  { label: 'D · Dietro lo scatto (one photo, explained)', value: 'dietro' },
] as const

const only =
  (...layouts: string[]): Condition =>
  (data) =>
    layouts.includes(data?.layout)

// The Diary. The layout chosen for each article decides which fields below are shown.
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Article', plural: 'Diary' },
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }) },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'layout', 'theme', 'publishedAt', '_status'],
  },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Title' },
    slugField,
    {
      name: 'layout',
      type: 'select',
      required: true,
      defaultValue: 'campo',
      options: [...LAYOUTS],
      label: 'Layout',
      admin: {
        position: 'sidebar',
        description: 'Pick the page design that fits what you are writing.',
      },
    },
    {
      name: 'theme',
      type: 'select',
      required: true,
      defaultValue: 'dietro-il-ritratto',
      options: [...THEMES],
      label: 'Theme',
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'readTime',
      type: 'number',
      label: 'Minutes to read',
      admin: { position: 'sidebar' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Summary',
      admin: { description: 'Shown in the Diary list.' },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Main photo',
      admin: {
        description:
          'Top of the page (layouts B and D), end of the page (A) and in the Diary list.',
      },
    },

    // A · Campo
    { name: 'content', type: 'richText', label: 'Text', admin: { condition: only('campo') } },
    {
      name: 'pullQuote',
      type: 'text',
      label: 'Big quote',
      admin: {
        condition: only('campo'),
        description: 'Shown large in handwriting, e.g. «Cosa non hai mai detto ad alta voce?»',
      },
    },

    // B · Fotoracconto and D · Dietro lo scatto
    {
      name: 'intro',
      type: 'textarea',
      label: 'Introduction',
      admin: { condition: only('fotoracconto', 'dietro') },
    },

    // B · Fotoracconto
    {
      name: 'sections',
      type: 'array',
      label: 'Moments of the day',
      admin: { condition: only('fotoracconto'), initCollapsed: true },
      fields: [
        { name: 'time', type: 'text', label: 'Time', admin: { description: 'e.g. 05:12' } },
        {
          name: 'photos',
          type: 'array',
          label: 'Photos (1 to 3)',
          maxRows: 3,
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'caption', type: 'text', label: 'Caption' },
          ],
        },
        { name: 'quote', type: 'text', label: 'Line in handwriting' },
        { name: 'note', type: 'text', label: 'Small note' },
      ],
    },

    // C · Domande e risposte
    {
      name: 'qa',
      type: 'array',
      label: 'Questions and answers',
      admin: { condition: only('domande'), initCollapsed: true },
      fields: [
        { name: 'question', type: 'text', required: true, label: 'Question' },
        { name: 'answer', type: 'textarea', label: 'Answer' },
        { name: 'quote', type: 'text', label: 'Highlighted line (optional)' },
      ],
    },

    // D · Dietro lo scatto
    {
      name: 'exifLine',
      type: 'text',
      label: 'Shot details',
      admin: {
        condition: only('dietro'),
        description:
          'Separate with " · ", e.g. 85 mm · f/2 · 1/160 s · ISO 400 · Luce: finestra a nord',
      },
    },
    {
      name: 'timeline',
      type: 'array',
      label: 'Timeline',
      admin: { condition: only('dietro'), initCollapsed: true },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Label',
          admin: { description: 'e.g. 17:02 · La domanda' },
        },
        { name: 'highlight', type: 'checkbox', label: 'Highlight (accent colour)' },
        { name: 'quote', type: 'text', label: 'Line in handwriting' },
        { name: 'text', type: 'textarea', label: 'Text' },
        {
          name: 'frames',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          label: 'Contact sheet frames',
          admin: { description: 'Optional: up to 4 frames shown side by side.' },
        },
        {
          name: 'chosen',
          type: 'number',
          label: 'Chosen frame',
          min: 1,
          max: 4,
          admin: { description: 'Position (1-4) of the frame to circle.' },
        },
      ],
    },
    seoField,
  ],
  hooks: revalidateOnChange('post', 'posts'),
}
