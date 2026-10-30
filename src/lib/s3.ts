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

export const signPrivateUrl = (filename: string, expiresIn = 3600): Promise<string> =>
  getSignedUrl(
    s3Client(),
    new GetObjectCommand({
      Bucket: env.S3_PRIVATE_BUCKET,
      Key: `${PRIVATE_PREFIX}/${filename}`,
    }),
    { expiresIn },
  )
