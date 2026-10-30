import type { CollectionConfig } from 'payload'

import { hashPassword } from '@/lib/password'
import { slugField } from '@/lib/slug'

export const PrivateGalleries: CollectionConfig = {
  slug: 'private-galleries',
  labels: { singular: 'Private gallery', plural: 'Private galleries' },
  // Never publicly readable: the site reads it through the local API after checking the password.
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'expiresAt', 'accessCount'],
    description: 'Link to share: /galleries/<slug>',
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Title' },
    slugField,
    { name: 'intro', type: 'textarea', label: 'Message for the client' },
    {
      name: 'newPassword',
      type: 'text',
      label: 'Password',
      virtual: true,
      admin: {
        description: 'Type to set or change the password. Leave empty to keep the current one.',
      },
    },
    {
      name: 'passwordHash',
      type: 'text',
      admin: { hidden: true },
      access: { read: () => false },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Expires on',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
        description:
          'Optional. After this day the link stops working (the photos stay in your library). Clear it to reopen.',
      },
    },
    {
      name: 'accessCount',
      type: 'number',
      defaultValue: 0,
      label: 'Times opened',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Counts successful password entries, not page views.',
      },
    },
    {
      name: 'lastAccessAt',
      type: 'date',
      label: 'Last opened',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'photos',
      type: 'relationship',
      relationTo: 'private-media',
      hasMany: true,
      label: 'Photos',
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        const next = typeof data.newPassword === 'string' ? data.newPassword.trim() : ''
        if (next) data.passwordHash = hashPassword(next)
        else if (operation === 'create') throw new Error('Set a password for the gallery')
        delete data.newPassword
        return data
      },
    ],
  },
}
