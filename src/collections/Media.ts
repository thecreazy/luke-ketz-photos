import type { CollectionConfig } from 'payload'

import { revalidateMedia } from '@/lib/revalidate'
import { protectPublicMedia } from '@/lib/usage'
import { IMAGE_MIME_TYPES, IMAGE_SIZES } from '@/lib/upload'

// Images arrive already resized by the browser (see admin "Upload photos", long edge 2500px, ~1-2 MB),
// which keeps requests under Vercel's body limit. The server only derives the small variants.
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Photo', plural: 'Photos' },
  access: { read: () => true },
  upload: {
    mimeTypes: IMAGE_MIME_TYPES,
    imageSizes: IMAGE_SIZES,
    adminThumbnail: 'sm',
    crop: false,
    focalPoint: false,
  },
  admin: { useAsTitle: 'alt', defaultColumns: ['alt', 'filename', 'width', 'height'] },
  fields: [
    { name: 'alt', type: 'text', required: true, label: 'Alt text' },
    {
      name: 'blurDataURL',
      type: 'textarea',
      admin: { readOnly: true, description: 'Blurred placeholder, generated at upload' },
    },
    {
      name: 'dominantColor',
      type: 'text',
      admin: { readOnly: true, description: 'Average colour, used as placeholder background' },
    },
    {
      // Curated on purpose: no GPS or other identifying metadata is stored.
      name: 'exif',
      type: 'group',
      label: 'EXIF',
      admin: { description: 'Read from the original file in the browser at upload' },
      fields: [
        { name: 'takenAt', type: 'date', admin: { readOnly: true } },
        { name: 'camera', type: 'text', admin: { readOnly: true } },
        { name: 'lens', type: 'text', admin: { readOnly: true } },
        { name: 'focalLength', type: 'text', admin: { readOnly: true } },
        { name: 'aperture', type: 'text', admin: { readOnly: true } },
        { name: 'shutterSpeed', type: 'text', admin: { readOnly: true } },
        { name: 'iso', type: 'number', admin: { readOnly: true } },
      ],
    },
  ],
  hooks: { ...revalidateMedia, beforeDelete: [protectPublicMedia] },
}
