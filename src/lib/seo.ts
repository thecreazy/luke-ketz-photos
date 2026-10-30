import type { Field } from 'payload'

export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO',
  fields: [
    { name: 'title', type: 'text', admin: { description: 'Max ~60 characters' } },
    { name: 'description', type: 'textarea', admin: { description: 'Max ~160 characters' } },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Social image (OG)' },
  ],
}
