// Links typed by the editors (a sponsor's website, social profiles): only http(s) ever reaches an
// href, whatever was written in the field.

/** A web address from what was typed ("example.com" works too), or null if it is not http(s). */
export const httpUrl = (raw: string | null | undefined): string | null => {
  const value = raw?.trim()
  if (!value) return null
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

const BASE: Record<string, string> = {
  instagram: 'https://www.instagram.com/',
  tiktok: 'https://www.tiktok.com/@',
  facebook: 'https://www.facebook.com/',
  x: 'https://x.com/',
  youtube: 'https://www.youtube.com/@',
}

export const NETWORK_NAMES: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  x: 'X',
  youtube: 'YouTube',
  website: 'Sito',
}

/** The link and the text to show for a social profile written as a handle or as a full link. */
export const profileLink = (
  network: string,
  raw: string | null | undefined,
): { href: string; label: string } | null => {
  const value = raw?.trim()
  if (!value) return null
  if (network === 'website') {
    const href = httpUrl(value)
    return href ? { href, label: new URL(href).hostname.replace(/^www\./, '') } : null
  }
  if (/^https?:\/\//i.test(value)) {
    const href = httpUrl(value)
    if (!href) return null
    const last = new URL(href).pathname.split('/').filter(Boolean).pop() ?? ''
    const handle = last.replace(/^@/, '')
    return { href, label: handle ? `@${handle}` : new URL(href).hostname }
  }
  const handle = value.replace(/^@/, '')
  if (!/^[\w.-]{1,64}$/.test(handle) || !BASE[network]) return null
  return { href: `${BASE[network]}${handle}`, label: `@${handle}` }
}
