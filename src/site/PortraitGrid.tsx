'use client'

import Link from 'next/link'
import { useState, ViewTransition } from 'react'

import type { Copy } from './copy'

export type GridItem = {
  slug: string
  n: number
  question: string
  src: string
  srcSet: string
  alt: string
  width: number
  height: number
  color: string
  series: number | null
}

type Props = {
  items: GridItem[]
  series: { id: number; title: string }[]
  copy: Copy['portraits']
}
type Key = 'all' | 'single' | number

const PAGE = 12

export function PortraitGrid({ items, series, copy: it }: Props) {
  const [filter, setFilter] = useState<Key>('all')
  const [hover, setHover] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE)

  const count = (f: Key) =>
    items.filter((i) => (f === 'all' ? true : f === 'single' ? i.series === null : i.series === f))
      .length

  const all: { key: Key; label: string }[] = [
    { key: 'all', label: it.all },
    ...series.map((s) => ({ key: s.id, label: s.title })),
    { key: 'single', label: it.single },
  ]
  const chips = all.filter((c) => c.key === 'all' || count(c.key) > 0)

  const list = items.filter((i) =>
    filter === 'all' ? true : filter === 'single' ? i.series === null : i.series === filter,
  )

  return (
    <>
      {chips.length > 2 && (
        <div className="chips" role="group" aria-label={it.series}>
          {chips.map((c) => (
            <button
              key={String(c.key)}
              type="button"
              className="serif chip"
              aria-pressed={filter === c.key}
              onClick={() => {
                setFilter(c.key)
                setShown(PAGE)
                setHover(null)
              }}
            >
              {c.label}
              <sup className="mono">{count(c.key)}</sup>
            </button>
          ))}
        </div>
      )}

      <section
        className="masonry"
        aria-label={it.aria}
        data-hover={hover ? '' : undefined}
        onMouseLeave={() => setHover(null)}
      >
        {list.slice(0, shown).map((t, i) => (
          <Link
            key={t.slug}
            href={`/ritratti/${t.slug}`}
            className="tile"
            data-on={hover === t.slug ? '' : undefined}
            onMouseEnter={() => setHover(t.slug)}
            onFocus={() => setHover(t.slug)}
          >
            <span
              className="tile-img"
              style={{ aspectRatio: `${t.width} / ${t.height}`, background: t.color }}
            >
              {/* The photo flies to the portrait page: same name on both sides. */}
              <ViewTransition name={`portrait-${t.slug}`} share="morph" default="none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.src}
                  srcSet={t.srcSet}
                  sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 30vw"
                  alt={t.alt}
                  width={t.width}
                  height={t.height}
                  // The first ones load at once; too many at once would slow the first of them down.
                  loading={i < 4 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : undefined}
                  decoding="async"
                />
              </ViewTransition>
            </span>
            <span className="cap">
              <span className="mono">N° {String(t.n).padStart(2, '0')}</span>
              {t.question && <span className="serif">{t.question}</span>}
            </span>
          </Link>
        ))}
      </section>

      {shown < list.length && (
        <div className="more">
          <button type="button" className="mono more-btn" onClick={() => setShown((n) => n + PAGE)}>
            {it.more}
          </button>
        </div>
      )}
    </>
  )
}
