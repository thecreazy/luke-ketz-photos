import type { GlobalConfig } from 'payload'

import { revalidateGlobal } from '@/lib/revalidate'

// "Chi è": the About page. Fields instead of free text because the page has a fixed design.
export const About: GlobalConfig = {
  slug: 'about',
  label: 'Chi è (About)',
  access: { read: () => true },
  fields: [
    {
      name: 'kicker',
      type: 'text',
      label: 'Small line above the title',
      defaultValue: 'Chi è Luke · Ritrattista concettuale · Piacenza',
    },
    {
      name: 'headline',
      type: 'text',
      required: true,
      label: 'Title',
      defaultValue: 'Raccontare è semplice. *Emozionare* è un altro discorso.',
      admin: { description: 'Put *asterisks* around the word to show in italic.' },
    },
    { name: 'portrait', type: 'upload', relationTo: 'media', label: 'Portrait of Luke' },
    {
      name: 'intro',
      type: 'array',
      label: 'Opening text',
      admin: { description: 'Paragraphs, or a line in handwriting. Shown in this order.' },
      fields: [
        {
          name: 'style',
          type: 'select',
          defaultValue: 'paragraph',
          options: [
            { label: 'Paragraph', value: 'paragraph' },
            { label: 'Handwritten line', value: 'quote' },
          ],
        },
        { name: 'text', type: 'textarea', required: true },
      ],
    },
    {
      name: 'stepsTitle',
      type: 'text',
      label: 'Steps title',
      defaultValue: 'Come nasce un ritratto',
    },
    {
      name: 'steps',
      type: 'array',
      label: 'Steps',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'text', type: 'textarea' },
      ],
    },
    {
      name: 'exhibitions',
      type: 'array',
      label: 'Exhibitions',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'place', type: 'text', label: 'Place' },
        { name: 'year', type: 'text', label: 'Year' },
      ],
    },
    {
      name: 'commissionNote',
      type: 'text',
      label: 'Commissions line',
      defaultValue: 'Su commissione · matrimoni e ritratti privati',
    },
  ],
  hooks: revalidateGlobal('about'),
}
