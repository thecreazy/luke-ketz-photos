import { withPayload } from '@payloadcms/next/withPayload'

const isDev = process.env.NODE_ENV === 'development'

const origin = (url) => {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

// Photos come from the public bucket/CDN; private gallery photos from signed URLs on the
// storage endpoint (path-style or `bucket.host` style), so both are allowed for images.
const storageHost = origin(process.env.S3_ENDPOINT ?? '')?.replace('://', '://*.')
const imageSources = new Set(
  [
    "'self'",
    'data:',
    'blob:',
    origin(process.env.S3_PUBLIC_URL ?? ''),
    origin(process.env.S3_ENDPOINT ?? ''),
    storageHost,
  ].filter(Boolean),
)
const imageSrc = [...imageSources].join(' ')

// Public site only (not /admin or /api). No nonces: they would make every page dynamic and
// defeat the cache. Inline scripts stay allowed because Next injects them; everything else
// is locked down. If a client's design needs another origin (fonts, video, analytics), add it here.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src ${imageSrc}`,
  `media-src ${imageSrc}`,
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...((process.env.NEXT_PUBLIC_SITE_URL ?? '').startsWith('https:')
    ? ['upgrade-insecure-requests']
    : []),
].join('; ')

const baseHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
]

// Images are plain <img> tags with a srcset pointing at the bucket/CDN (see src/components/Photo.tsx),
// so next/image and its optimiser are not used.
/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  // Only used by `pnpm dev`: lets a phone on the same Wi-Fi open the dev server at http://<this IP>:3000.
  // Change it when the Mac's address changes (`ipconfig getifaddr en0`/`en1`).
  allowedDevOrigins: ['192.168.1.170'],
  partialPrefetching: true,
  async headers() {
    return [
      { source: '/:path*', headers: baseHeaders },
      {
        source: '/((?!admin|api|_next/static|_next/image).*)',
        headers: [{ key: 'Content-Security-Policy', value: csp }],
      },
    ]
  },
}

export default withPayload(nextConfig)
