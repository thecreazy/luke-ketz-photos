'use client'

import Link from 'next/link'
import { useState } from 'react'

import { it } from './it'

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

type Props = { items: GridItem[]; series: { id: number; title: string }[] }
type Key = 'all' | 'single' | number

const PAGE = 12

export function PortraitGrid({ items, series }: Props) {
  const [filter, setFilter] = useState<Key>('all')
  const [hover, setHover] = useState<string | null>(null)
  const [shown, setShown] = useState(PAGE)

  const count = (f: Key) =>
    items.filter((i) => (f === 'all' ? true : f === 'single' ? i.series === null : i.series === f))
      .length

  const all: { key: Key; label: string }[] = [
    { key: 'all', label: it.portraits.all },
    ...series.map((s) => ({ key: s.id, label: s.title })),
    { key: 'single', label: it.portraits.single },
  ]
  const chips = all.filter((c) => c.key === 'all' || count(c.key) > 0)

  const list = items.filter((i) =>
    filter === 'all' ? true : filter === 'single' ? i.series === null : i.series === filter,
  )

  return (
    <>
      {chips.length > 2 && (
        <div className="chips" role="group" aria-label={it.portraits.series}>
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
        aria-label={it.portraits.aria}
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.src}
                srcSet={t.srcSet}
                sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 30vw"
                alt={t.alt}
                width={t.width}
                height={t.height}
                loading={i < 6 ? 'eager' : 'lazy'}
                decoding="async"
              />
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
            {it.portraits.more}
          </button>
        </div>
      )}
    </>
  )
}
