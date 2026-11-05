import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Portraits } from './collections/Portraits'
import { Posts } from './collections/Posts'
import { PrivateGalleries } from './collections/PrivateGalleries'
import { PrivateMedia } from './collections/PrivateMedia'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { env } from './lib/env'
import { PRIVATE_PREFIX, PUBLIC_PREFIX } from './lib/s3'
import { ensureSystemPages } from './lib/seed'
import { MAX_UPLOAD_BYTES } from './lib/upload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const s3Base = {
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
}

export default buildConfig({
  serverURL: env.NEXT_PUBLIC_SITE_URL,
  // Cookie-authenticated requests are only accepted from this origin.
  cors: [env.NEXT_PUBLIC_SITE_URL],
  csrf: [env.NEXT_PUBLIC_SITE_URL],
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      views: {
        uploadPhotos: {
          Component: '/components/admin/UploadView#UploadView',
          path: '/upload-photos',
        },
      },
      afterNavLinks: ['/components/admin/NavLink#NavLink'],
    },
    meta: { titleSuffix: ' — Admin' },
  },
  collections: [Portraits, Projects, Posts, Pages, PrivateGalleries, Media, PrivateMedia, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: env.DATABASE_URL, max: 5 },
    // Never auto-sync the schema: in development this site points at the real database (Neon), so
    // every change goes through a migration (pnpm payload migrate:create, then migrate).
    push: false,
  }),
  sharp,
  upload: { limits: { fileSize: MAX_UPLOAD_BYTES } },
  onInit: async (payload) => {
    await ensureSystemPages(payload)
  },
  plugins: [
    // Public bucket: direct CDN URLs, no round trip through the server.
    s3Storage({
      collections: {
        media: {
          prefix: PUBLIC_PREFIX,
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) =>
            `${env.S3_PUBLIC_URL}/${prefix}/${encodeURIComponent(filename)}`,
        },
      },
      bucket: env.S3_PUBLIC_BUCKET,
      acl: 'public-read',
      config: s3Base,
    }),
    // Private bucket: no public access, the site signs the URLs.
    s3Storage({
      collections: { 'private-media': { prefix: PRIVATE_PREFIX } },
      bucket: env.S3_PRIVATE_BUCKET,
      config: s3Base,
    }),
  ],
})
