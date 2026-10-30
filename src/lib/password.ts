import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

import { env } from './env'

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

// The cookie token depends on the hash: changing the password invalidates open sessions.
export const galleryToken = (slug: string, passwordHash: string): string =>
  createHmac('sha256', env.PAYLOAD_SECRET).update(`${slug}:${passwordHash}`).digest('hex')

export const tokenMatches = (a: string, b: string): boolean => {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

/** A gallery is open until the end of its expiry day; no date means it never expires. */
export const isExpired = (expiresAt: string | null | undefined): boolean => {
  if (!expiresAt) return false
  const end = new Date(expiresAt)
  end.setUTCHours(23, 59, 59, 999)
  return end.getTime() < Date.now()
}
