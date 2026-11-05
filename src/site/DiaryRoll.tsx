'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

import type { Copy } from './copy'

export type RollFrame = {
  slug: string
  title: string
  theme: string
  themeLabel: string
  meta: string
  src: string | null
  alt: string
}

export function DiaryRoll({ frames, copy: it }: { frames: RollFrame[]; copy: Copy['diary'] }) {
  const [theme, setTheme] = useState('all')
  const [first, setFirst] = useState(0)
  const track = useRef<HTMLDivElement>(null)

  const themes = [...new Set(frames.map((f) => f.theme))]
  const list = frames.filter((f) => theme === 'all' || f.theme === theme)
  const label = (t: string) => frames.find((f) => f.theme === t)?.themeLabel ?? t

  const step = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const frame = el.querySelector<HTMLElement>('.fr')
    el.scrollBy({ left: dir * ((frame?.offsetWidth ?? 320) + 4), behavior: 'smooth' })
  }

  const onScroll = () => {
    const el = track.current
    const frame = el?.querySelector<HTMLElement>('.fr')
    if (!el || !frame) return
    setFirst(Math.min(list.length - 1, Math.round(el.scrollLeft / (frame.offsetWidth + 4))))
  }

  const pick = (t: string) => {
    setTheme(t)
    setFirst(0)
    track.current?.scrollTo({ left: 0 })
  }

  return (
    <section aria-labelledby="rullino" className="roll">
      <div className="roll-head wrap">
        <div>
          <h2 id="rullino" className="mono muted">
            {it.roll}
          </h2>
          <div className="chips" role="group" aria-label={it.filter}>
            {['all', ...themes].map((t) => (
              <button
                key={t}
                type="button"
                className="serif chip"
                aria-pressed={theme === t}
                onClick={() => pick(t)}
              >
                {t === 'all' ? it.all : label(t)}
                <sup className="mono">
                  {t === 'all' ? frames.length : frames.filter((f) => f.theme === t).length}
                </sup>
              </button>
            ))}
          </div>
        </div>
        <div className="arrows">
          <button type="button" className="mono ar" aria-label={it.prev} onClick={() => step(-1)}>
            ←
          </button>
          <span className="mono muted">
            {String(Math.min(first + 1, list.length)).padStart(2, '0')} /{' '}
            {String(list.length).padStart(2, '0')}
          </span>
          <button type="button" className="mono ar" aria-label={it.next} onClick={() => step(1)}>
            →
          </button>
        </div>
      </div>

      <div className="track" ref={track} onScroll={onScroll} tabIndex={0} role="list">
        {list.map((f, i) => (
          <Link key={f.slug} href={`/diario/${f.slug}`} className="fr" role="listitem">
            <span className="holes" aria-hidden="true">
              {Array.from({ length: 8 }, (_, k) => (
                <span key={k} />
              ))}
            </span>
            <span className="frame">
              {f.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.src} alt={f.alt} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
              ) : (
                <span className="nophoto">
                  <span className="mono muted">{it.noPhoto}</span>
                  <span className="serif">{f.title.charAt(0)}</span>
                </span>
              )}
            </span>
            <span className="fr-code">
              <span className="mono accent">▸ {String(i + 1).padStart(2, '0')}A</span>
              <span className="mono muted">LK 400</span>
            </span>
            <span className="mono muted fr-meta">{f.meta}</span>
            <span className="serif fr-title">{f.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
