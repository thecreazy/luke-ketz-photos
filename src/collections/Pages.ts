import type { CollectionConfig, Field } from 'payload'

import { revalidateOnChange } from '@/lib/revalidate'
import { seoField } from '@/lib/seo'
import { slugField } from '@/lib/slug'
import { PAGE_COPY } from '@/site/copy'
import type { CopyKind } from '@/site/copy'

// Pages are every page of the site. Most are plain text pages (privacy...), but the pages the
// design is built around (home, about, portraits, diary, private gallery) are always there and
// hold their own texts in a group of fields, so nothing visible is written in the code.
type Kind = 'text' | CopyKind | 'about'

const only =
  (...kinds: Kind[]) =>
  (data: Record<string, unknown> | undefined) =>
    kinds.includes(((data?.kind as Kind | undefined) ?? 'text') as Kind)

const copyGroup = (kind: CopyKind, label: string, description: string): Field => ({
  name: kind,
  type: 'group',
  label,
  admin: { condition: only(kind), description },
  fields: Object.entries(PAGE_COPY[kind]).map(([name, [fieldLabel, value, hint]]) => ({
    name,
    type: 'text',
    label: fieldLabel,
    defaultValue: value,
    admin: hint ? { description: hint } : undefined,
  })),
})

const aboutGroup: Field = {
  name: 'about',
  type: 'group',
  label: 'Page content',
  admin: { condition: only('about') },
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
      name: 'exhibitionsTitle',
      type: 'text',
      label: 'Exhibitions title',
      defaultValue: 'Mostre',
    },
    {
      name: 'contactLabel',
      type: 'text',
      label: 'Contact link text',
      defaultValue: 'Scrivimi →',
      admin: { description: 'Opens an email to the contact address in the site settings.' },
    },
    {
      name: 'commissionNote',
      type: 'text',
      label: 'Commissions line',
      defaultValue: 'Su commissione · matrimoni e ritratti privati',
    },
  ],
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    // The pages the site is built around cannot be deleted, only edited.
    delete: ({ req }) =>
      req.user ? { or: [{ kind: { equals: 'text' } }, { kind: { exists: false } }] } : false,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'menuOrder', '_status'],
    description:
      'Every page of the site. Home, Chi è, Ritratti, Diario and Galleria privata hold the texts of their page and cannot be deleted. Add your own text pages (e.g. contacts) with "Create new".',
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      defaultValue: 'text',
      options: ['text', 'home', 'about', 'portraits', 'diary', 'gate'],
      admin: { hidden: true },
    },
    { name: 'title', type: 'text', required: true, label: 'Title' },
    slugField,
    {
      name: 'menuLabel',
      type: 'text',
      label: 'Menu label',
      admin: { position: 'sidebar', description: 'Leave empty to keep the page out of the menu.' },
    },
    {
      name: 'menuOrder',
      type: 'number',
      label: 'Menu order',
      admin: { position: 'sidebar', description: 'Lower = first' },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Content',
      admin: { condition: only('text') },
    },
    copyGroup(
      'home',
      'Texts of the home',
      'The home shows the faces; these are the words around them.',
    ),
    aboutGroup,
    copyGroup('portraits', 'Texts of the portraits pages', 'The grid and each portrait page.'),
    copyGroup('diary', 'Texts of the diary', 'The diary list and its article pages.'),
    copyGroup(
      'gate',
      'Texts of the private gallery',
      'The screen where a client types the password. The page itself is not public.',
    ),
    seoField,
  ],
  hooks: {
    ...revalidateOnChange('page', 'pages'),
    // The slug is the route of these pages and the kind says what they are: neither can change.
    beforeChange: [
      ({ data, originalDoc }) => {
        if (originalDoc && originalDoc.kind && originalDoc.kind !== 'text') {
          data.kind = originalDoc.kind
          data.slug = originalDoc.slug
        }
        return data
      },
    ],
  },
}
