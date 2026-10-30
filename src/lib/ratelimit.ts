import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

import { env } from './env'

// Attempt limits backed by Upstash Redis. Without credentials every check passes, so local
// development needs no setup; in production a missing configuration is logged once.
const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
    : null

if (
  !redis &&
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE !== 'phase-production-build'
) {
  console.warn(
    'UPSTASH_REDIS_REST_URL/TOKEN not set: login and gallery password attempts are NOT limited.',
  )
}

const limiter = (name: string, attempts: number, window: `${number} m`) =>
  redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(attempts, window),
        prefix: `rl:${name}`,
      })
    : null

const login = limiter('login', 10, '10 m')
const gallery = limiter('gallery', 5, '10 m')

// On Vercel the first x-forwarded-for entry is the client address.
export const clientIp = (headers: Headers): string =>
  headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown'

/** True when the caller may proceed. If Redis is unreachable we fail open: a down limiter must not lock out the client. */
const allow = async (rl: Ratelimit | null, key: string): Promise<boolean> => {
  if (!rl) return true
  try {
    return (await rl.limit(key)).success
  } catch (error) {
    console.error('Rate limiter unavailable', error)
    return true
  }
}

export const allowLogin = (ip: string) => allow(login, ip)
export const allowGalleryAttempt = (ip: string, slug: string) => allow(gallery, `${ip}:${slug}`)
