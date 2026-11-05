import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'
import sharp from 'sharp'

import { getCopy, getPortraits, getSettings } from '@/lib/data'
import { photoSources } from '@/lib/photo'

// The picture shown when a link to the site is shared (WhatsApp, Instagram, iMessage...), unless a
// page has its own SEO image or the site settings have a default social image. It lives at a
// fixed address (/og) because a file-based opengraph-image is not inherited by the other pages.
const size = { width: 1200, height: 630 }

// A few portraits, small and as data: a slow or missing image must never break the build.
async function faces(urls: string[]) {
  const loaded = await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
        if (!res.ok) return null
        const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
          .resize(360, 460, { fit: 'cover', position: 'attention' })
          .grayscale()
          .jpeg({ quality: 78 })
          .toBuffer()
        return `data:image/jpeg;base64,${jpeg.toString('base64')}`
      } catch {
        return null
      }
    }),
  )
  return loaded.filter((x): x is string => x !== null)
}

export async function GET() {
  const [settings, copy, portraits, font] = await Promise.all([
    getSettings(),
    getCopy(),
    getPortraits(),
    readFile(join(process.cwd(), 'src/site/fonts/NothingYouCouldDo-Regular.ttf')),
  ])
  const urls = portraits
    .slice(0, 3)
    .map((p) => photoSources(p.doc.image))
    .filter((p) => p !== null)
    .map((p) => p.srcSet.split(' ')[0])
  const images = await faces(urls)

  const tilt = [-6, 3, -2]
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(ellipse 70% 80% at 30% 50%, #161412 0%, #070606 100%)',
        color: '#ede9e3',
        fontFamily: 'Script',
        padding: '0 72px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingRight: 40 }}>
        <div style={{ fontSize: images.length ? 104 : 148, lineHeight: 1.05 }}>
          {settings.siteName}
        </div>
        <div style={{ width: 280, height: 5, background: '#d2694a', margin: '26px 0 30px' }} />
        <div style={{ fontSize: 46, lineHeight: 1.25, color: '#c9c3ba', maxWidth: 560 }}>
          {copy.home.defaultQuestion}
        </div>
      </div>
      {images.length > 0 && (
        <div style={{ display: 'flex', width: 480, height: '100%', position: 'relative' }}>
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              alt=""
              width={200}
              height={256}
              style={{
                position: 'absolute',
                left: i * 130,
                top: [210, 120, 250][i % 3],
                objectFit: 'cover',
                transform: `rotate(${tilt[i]}deg)`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                opacity: 1 - i * 0.12,
              }}
            />
          ))}
        </div>
      )}
    </div>,
    { ...size, fonts: [{ name: 'Script', data: font, style: 'normal', weight: 400 }] },
  )
}
