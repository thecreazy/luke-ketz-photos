import type { CollectionConfig } from 'payload'

import { IMAGE_MIME_TYPES, IMAGE_SIZES } from '@/lib/upload'
import { protectPrivateMedia } from '@/lib/usage'

// Photos of password-protected galleries. Private bucket, readable only by admins:
// the site serves them through signed URLs after the password check.
export const PrivateMedia: CollectionConfig = {
  slug: 'private-media',
  labels: { singular: 'Private photo', plural: 'Private photos' },
  access: { read: ({ req }) => Boolean(req.user) },
  upload: {
    mimeTypes: IMAGE_MIME_TYPES,
    imageSizes: IMAGE_SIZES,
    adminThumbnail: 'sm',
    crop: false,
    focalPoint: false,
  },
  admin: { useAsTitle: 'filename', defaultColumns: ['alt', 'filename'] },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt text',
      admin: {
        description:
          'Describes the photo for people who cannot see it. Leave empty to use the gallery title.',
      },
    },
    { name: 'blurDataURL', type: 'textarea', admin: { readOnly: true, hidden: true } },
  ],
  hooks: { beforeDelete: [protectPrivateMedia] },
}
