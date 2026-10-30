'use client'

import exifr from 'exifr'
import React, { useEffect, useRef, useState } from 'react'

import { FULL_EDGE } from '@/lib/upload'

const JPEG_QUALITY = 0.86
const BLUR_EDGE = 16
const CONCURRENCY = 3

type Target = 'media' | 'private-media'
type Item = {
  name: string
  status: 'queued' | 'resizing' | 'uploading' | 'done' | 'error'
  error?: string
}

const toBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      quality,
    ),
  )

const draw = (bitmap: ImageBitmap, maxEdge: number): HTMLCanvasElement => {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas not available')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return canvas
}

const averageColor = (bitmap: ImageBitmap): string => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) return '#888888'
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

// Curated subset only: GPS and everything else is deliberately left out.
const readExif = async (file: File) => {
  try {
    const t = await exifr.parse(file, {
      gps: false,
      pick: [
        'DateTimeOriginal',
        'Make',
        'Model',
        'LensModel',
        'FocalLength',
        'FNumber',
        'ExposureTime',
        'ISO',
      ],
    })
    if (!t) return undefined
    const make = typeof t.Make === 'string' ? t.Make.trim() : ''
    const model = typeof t.Model === 'string' ? t.Model.trim() : ''
    return {
      takenAt: t.DateTimeOriginal instanceof Date ? t.DateTimeOriginal.toISOString() : undefined,
      camera: model.startsWith(make) ? model : `${make} ${model}`.trim() || undefined,
      lens: typeof t.LensModel === 'string' ? t.LensModel : undefined,
      focalLength: t.FocalLength ? `${Math.round(t.FocalLength)}mm` : undefined,
      aperture: t.FNumber ? `f/${Number(t.FNumber.toFixed(1))}` : undefined,
      shutterSpeed: t.ExposureTime
        ? t.ExposureTime < 1
          ? `1/${Math.round(1 / t.ExposureTime)}`
          : `${t.ExposureTime}s`
        : undefined,
      iso: typeof t.ISO === 'number' ? t.ISO : undefined,
    }
  } catch {
    return undefined // unreadable EXIF must never block an upload
  }
}

const prepare = async (file: File) => {
  // Read EXIF from the original: the canvas re-encode below drops all metadata.
  const exif = await readExif(file)
  // imageOrientation: 'from-image' applies the EXIF orientation before the metadata is lost.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const blob = await toBlob(draw(bitmap, FULL_EDGE), JPEG_QUALITY)
  const blurDataURL = draw(bitmap, BLUR_EDGE).toDataURL('image/jpeg', 0.5)
  const dominantColor = averageColor(bitmap)
  bitmap.close()
  const base = file.name.replace(/\.[^.]+$/, '')
  return {
    file: new File([blob], `${base}.jpg`, { type: 'image/jpeg' }),
    blurDataURL,
    dominantColor,
    exif,
    alt: base,
  }
}

type Parent = { id: number; title: string; draft?: boolean }

const PARENT = {
  media: { collection: 'projects', label: 'project', drafts: true },
  'private-media': { collection: 'private-galleries', label: 'private gallery', drafts: false },
} as const

const api = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, { credentials: 'include', ...init })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const PhotoUploader: React.FC = () => {
  const [target, setTarget] = useState<Target>('media')
  const [items, setItems] = useState<Item[]>([])
  const [busy, setBusy] = useState(false)
  const [parents, setParents] = useState<Parent[]>([])
  const [parentId, setParentId] = useState('')
  const [note, setNote] = useState<{ text: string; href?: string; error?: boolean } | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const config = PARENT[target]

  // The list of projects / galleries the new photos can be added to.
  useEffect(() => {
    let cancelled = false
    const query = `limit=200&depth=0&sort=title${config.drafts ? '&draft=true' : ''}`
    api(`/api/${config.collection}?${query}`)
      .then((r) => {
        if (cancelled) return
        setParents(
          r.docs.map((d: { id: number; title: string; _status?: string }) => ({
            id: d.id,
            title: d.title,
            draft: d._status === 'draft',
          })),
        )
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [config.collection, config.drafts])

  const patch = (i: number, p: Partial<Item>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...p } : it)))

  // Appends the uploaded photos, in selection order, to the chosen project / gallery.
  // Projects are saved as a draft: the photographer reviews and publishes.
  const attach = async (ids: number[]) => {
    const base = `/api/${config.collection}/${parentId}`
    const draft = config.drafts ? '?draft=true' : ''
    const current = await api(`${base}${draft ? `${draft}&depth=0` : '?depth=0'}`)
    const photos =
      target === 'media'
        ? [...(current.photos ?? []), ...ids.map((image) => ({ image }))]
        : [...(current.photos ?? []), ...ids]
    await api(`${base}${draft}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ photos }),
    })
  }

  const upload = async (files: File[]) => {
    setBusy(true)
    setNote(null)
    setItems(files.map((f) => ({ name: f.name, status: 'queued' })))
    const ids: (number | undefined)[] = new Array(files.length)
    let next = 0
    const worker = async () => {
      while (next < files.length) {
        const i = next++
        try {
          patch(i, { status: 'resizing' })
          const { file, alt, blurDataURL, dominantColor, exif } = await prepare(files[i])
          patch(i, { status: 'uploading' })
          const body = new FormData()
          body.append('file', file)
          // private-media has neither EXIF nor dominant colour: private photos carry no extra metadata.
          const meta =
            target === 'media' ? { alt, blurDataURL, dominantColor, exif } : { alt, blurDataURL }
          body.append('_payload', JSON.stringify(meta))
          const created = await api(`/api/${target}`, { method: 'POST', body })
          ids[i] = created.doc.id
          patch(i, { status: 'done' })
        } catch (e) {
          patch(i, { status: 'error', error: e instanceof Error ? e.message : String(e) })
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker))

    const uploaded = ids.filter((id): id is number => id !== undefined)
    if (parentId && uploaded.length > 0) {
      const parent = parents.find((p) => String(p.id) === parentId)
      try {
        await attach(uploaded)
        setNote({
          text: `Added ${uploaded.length} photo${uploaded.length === 1 ? '' : 's'} to "${parent?.title}"${
            config.drafts ? ' as a draft: open it to review and publish.' : '.'
          }`,
          href: `/admin/collections/${config.collection}/${parentId}`,
        })
      } catch (e) {
        setNote({
          text: `Photos uploaded, but adding them to the ${config.label} failed (${
            e instanceof Error ? e.message : e
          }). Add them from its page.`,
          error: true,
        })
      }
    }
    setBusy(false)
    if (input.current) input.current.value = ''
  }

  const done = items.filter((i) => i.status === 'done').length

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
      <label>
        Destination{' '}
        <select
          value={target}
          onChange={(e) => {
            setTarget(e.target.value as Target)
            setParentId('')
            setParents([])
          }}
          disabled={busy}
        >
          <option value="media">Photos (public portfolio)</option>
          <option value="private-media">Private photos (password galleries)</option>
        </select>
      </label>
      <label>
        Add to {config.label}{' '}
        <select value={parentId} onChange={(e) => setParentId(e.target.value)} disabled={busy}>
          <option value="">Don&apos;t add to any (library only)</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
              {p.draft ? ' (draft)' : ''}
            </option>
          ))}
        </select>
      </label>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        disabled={busy}
        onChange={(e) => e.target.files?.length && upload(Array.from(e.target.files))}
      />
      {items.length > 0 && (
        <>
          <strong>
            {done}/{items.length} uploaded
          </strong>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {items.map((it, i) => (
              <li key={i}>
                {it.name} — {it.status}
                {it.error ? ` (${it.error})` : ''}
              </li>
            ))}
          </ul>
        </>
      )}
      {note && (
        <p role="status" style={{ margin: 0, color: note.error ? 'crimson' : undefined }}>
          {note.text} {note.href && <a href={note.href}>Open</a>}
        </p>
      )}
    </div>
  )
}
