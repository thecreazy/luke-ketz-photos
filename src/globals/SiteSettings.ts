import type { GlobalConfig } from 'payload'

import { revalidateSettings } from '@/lib/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  access: { read: () => true },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Photographer Name',
      label: 'Site name',
    },
    { name: 'description', type: 'textarea', label: 'Description (default SEO)' },
    { name: 'bio', type: 'textarea', label: 'Bio' },
    { name: 'email', type: 'email', label: 'Contact email' },
    { name: 'instagram', type: 'text', label: 'Instagram (URL)' },
    {
      name: 'footerNote',
      type: 'text',
      label: 'Footer text',
      defaultValue: 'Tutti i diritti riservati',
      admin: { description: 'Shown after "© year name" at the bottom of every page.' },
    },
    { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Default social image' },
  ],
  hooks: revalidateSettings,
}
