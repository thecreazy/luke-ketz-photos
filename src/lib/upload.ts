// No SVG on purpose: the public bucket serves files as-is and SVG can carry scripts.
export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

// Photos are resized in the browser first (~1-2 MB); this is a generous ceiling that
// stays under Vercel's request body limit.
export const MAX_UPLOAD_BYTES = 4_000_000

// Browser-side resize target for the full-size file (long edge, px).
export const FULL_EDGE = 2500

// Smaller variants generated from the already-resized file when it reaches the server,
// so the srcset is served straight from the bucket/CDN with no on-demand optimiser.
export const IMAGE_SIZES = [
  { name: 'sm', width: 640 },
  { name: 'md', width: 1280 },
].map((s) => ({
  ...s,
  withoutEnlargement: true,
  formatOptions: { format: 'webp' as const, options: { quality: 80 } },
}))
