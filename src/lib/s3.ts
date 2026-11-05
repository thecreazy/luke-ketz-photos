import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { env } from './env'

export const PRIVATE_PREFIX = 'private'
export const PUBLIC_PREFIX = 'media'

let client: S3Client | undefined

export const s3Client = (): S3Client =>
  (client ??= new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  }))

/** A time-limited link to a private file. With `downloadAs` the browser saves it instead of showing it. */
export const signPrivateUrl = (
  filename: string,
  expiresIn = 3600,
  downloadAs?: string,
): Promise<string> =>
  getSignedUrl(
    s3Client(),
    new GetObjectCommand({
      Bucket: env.S3_PRIVATE_BUCKET,
      Key: `${PRIVATE_PREFIX}/${filename}`,
      ResponseContentDisposition: downloadAs
        ? `attachment; filename*=UTF-8''${encodeURIComponent(downloadAs)}`
        : undefined,
    }),
    { expiresIn },
  )
