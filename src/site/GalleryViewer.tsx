'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { Copy } from './copy'
import { fmt } from './copy'

export type ViewerPhoto = {
  src: string
  srcSet: string
  width: number
  height: number
  alt: string
  blur?: string | null
  download?: string
}

const SWIPE = 50

// The photos of an opened private gallery: a column of photos; one tap opens it full screen with
// arrows, keyboard and swipe, and a button that saves the full-size file.
export function GalleryViewer({ photos, copy }: { photos: ViewerPhoto[]; copy: Copy['gate'] }) {
  const [open, setOpen] = useState<number | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const start = useRef<number | null>(null)
  const count = photos.length

  const close = useCallback(() => setOpen(null), [])
  const go = useCallback(
    (step: 1 | -1) => setOpen((i) => (i === null ? i : (i + step + count) % count)),
    [count],
  )

  useEffect(() => {
    if (open === null) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.querySelector<HTMLElement>('button')?.focus()
    // The neighbours are fetched ahead so that moving along feels instant.
    for (const n of [1, -1]) {
      const img = new Image()
      const p = photos[(open + n + count) % count]
      img.srcset = p.srcSet
      img.sizes = '100vw'
      img.src = p.src
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab') {
        // Keep the focus inside the viewer while it is open.
        const items = [...(dialog.current?.querySelectorAll<HTMLElement>('button, a[href]') ?? [])]
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open, count, photos, close, go])

  // Back to the photo that was opened, so keyboard users do not lose their place.
  useEffect(() => {
    if (open === null) opener.current?.focus()
  }, [open])

  const current = open === null ? null : photos[open]

  return (
    <>
      <div className="stack">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            className="shot"
            aria-label={`${copy.openPhoto} ${i + 1} / ${count}`}
            onClick={(e) => {
              opener.current = e.currentTarget
              setOpen(i)
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              srcSet={p.srcSet}
              sizes="(min-width: 1200px) 1200px, 100vw"
              width={p.width}
              height={p.height}
              alt={p.alt}
              loading="lazy"
              decoding="async"
              style={{
                backgroundImage: p.blur ? `url("${p.blur}")` : undefined,
                backgroundSize: 'cover',
              }}
            />
          </button>
        ))}
      </div>

      {current && open !== null && (
        <div
          ref={dialog}
          className="viewer"
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          onPointerDown={(e) => {
            start.current = e.clientX
          }}
          onPointerUp={(e) => {
            if (start.current === null) return
            const dx = e.clientX - start.current
            start.current = null
            if (Math.abs(dx) > SWIPE) go(dx < 0 ? 1 : -1)
          }}
          onPointerCancel={() => {
            start.current = null
          }}
        >
          <div className="viewer-bar mono">
            <span aria-live="polite">{fmt(copy.counter, { n: open + 1, total: count })}</span>
            <span className="viewer-actions">
              {current.download && (
                <a href={current.download} download>
                  {copy.download}
                </a>
              )}
              <button type="button" onClick={close}>
                {copy.close}
              </button>
            </span>
          </div>
          <div className="viewer-stage" onClick={(e) => e.target === e.currentTarget && close()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.src}
              src={current.src}
              srcSet={current.srcSet}
              sizes="100vw"
              alt={current.alt}
              draggable={false}
            />
          </div>
          {count > 1 && (
            <>
              <button
                type="button"
                className="viewer-nav prev"
                onClick={() => go(-1)}
                aria-label={copy.prevPhoto}
              >
                ←
              </button>
              <button
                type="button"
                className="viewer-nav next"
                onClick={() => go(1)}
                aria-label={copy.nextPhoto}
              >
                →
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
