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
    { name: 'tagline', type: 'text', label: 'Tagline' },
    { name: 'description', type: 'textarea', label: 'Description (default SEO)' },
    { name: 'bio', type: 'textarea', label: 'Bio' },
    { name: 'email', type: 'email', label: 'Contact email' },
    { name: 'instagram', type: 'text', label: 'Instagram (URL)' },
    { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Default social image' },
  ],
  hooks: revalidateSettings,
}
