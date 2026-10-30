import { z } from 'zod'

// `.env.example` ships these empty: treat "" as not set.
const emptyAsUndefined = <T extends z.ZodType>(type: T) =>
  z.preprocess((v) => (v === '' ? undefined : v), type)

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  PAYLOAD_SECRET: z.string().min(16, 'PAYLOAD_SECRET must be at least 16 characters'),
  NEXT_PUBLIC_SITE_URL: z.url(),
  S3_ENDPOINT: z.url(),
  S3_REGION: z.string().default('us-east-1'),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_PUBLIC_BUCKET: z.string().min(1),
  S3_PUBLIC_URL: z.url().refine((u) => !u.endsWith('/'), 'must not end with a slash'),
  S3_PRIVATE_BUCKET: z.string().min(1),
  S3_FORCE_PATH_STYLE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  // Optional: without them attempt limits are off (fine for local development).
  UPSTASH_REDIS_REST_URL: emptyAsUndefined(z.url().optional()),
  UPSTASH_REDIS_REST_TOKEN: emptyAsUndefined(z.string().optional()),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const lines = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`)
  throw new Error(`Invalid environment variables:\n${lines.join('\n')}\nSee .env.example.`)
}

export const env = parsed.data
