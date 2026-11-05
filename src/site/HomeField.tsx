'use client'

import Link from 'next/link'
import { useState } from 'react'

import type { Copy } from './copy'
import { fmt } from './copy'
import { SiteNav } from './SiteNav'
import type { MenuItem } from './SiteNav'
import { useParallax } from './use-parallax'

export type FieldCard = {
  key: string
  href: string
  src: string
  srcSet: string
  alt: string
  tag: string
  about: boolean
  question: string
  // Slot on the 1440x900 reference frame: x, y, width and depth (0 near, 1 far).
  x: number
  y: number
  w: number
  z: number
  // Same slot on the 390x844 phone frame.
  xm: number
  ym: number
  wm: number
}

type Props = {
  cards: FieldCard[]
  siteName: string
  defaultQuestion: string
  faces: number
  questions: number
  legal: { id: number; slug: string; title: string }[]
  copy: Copy['home']
  menu: MenuItem[]
}

export function HomeField({
  cards,
  siteName,
  defaultQuestion,
  faces,
  questions,
  legal,
  copy: it,
  menu,
}: Props) {
  const [active, setActive] = useState<number | null>(null)
  const ref = useParallax<HTMLDivElement>()
  const cur = active === null ? null : cards[active]

  return (
    <div
      ref={ref}
      className="field glow home"
      data-hover={cur ? '' : undefined}
      onMouseLeave={() => setActive(null)}
      onClick={(e) => {
        // Touch: a tap on the empty field lets go of the focused face.
        if (!(e.target as HTMLElement).closest('a')) setActive(null)
      }}
    >
      <div className="field-layer">
        {cards.map((c, i) => {
          const on = active === i
          const b = Math.abs(c.z - 0.08) * 10
          return (
            <Link
              key={c.key}
              href={c.href}
              className="card"
              data-on={on ? '' : undefined}
              onMouseEnter={() => setActive(i)}
              onFocus={(e) => {
                // Keyboard only: on touch the focus that comes with a tap must not count as the first tap.
                if (e.currentTarget.matches(':focus-visible')) setActive(i)
              }}
              onClick={(e) => {
                // No hover on touch screens: the first tap brings the face into focus and shows
                // its question, the second one opens it.
                if (!window.matchMedia('(hover: hover)').matches && active !== i) {
                  e.preventDefault()
                  setActive(i)
                }
              }}
              style={
                {
                  '--x': c.x,
                  '--y': c.y,
                  '--w': c.w,
                  '--xm': c.xm,
                  '--ym': c.ym,
                  '--wm': c.wm,
                  '--z': c.z,
                  '--zi': Math.round((1 - c.z) * 20),
                  '--b': b.toFixed(1),
                  '--o': (1 - c.z * 0.72).toFixed(2),
                  '--delay': `-${(i * 1.7).toFixed(1)}s`,
                } as React.CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.src}
                srcSet={c.srcSet}
                sizes={`(max-width: 760px) 50vw, ${(c.w / 14.4).toFixed(1)}vw`}
                alt={c.alt}
                loading={i < 4 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <span className="corner tl" aria-hidden="true" />
              <span className="corner br" aria-hidden="true" />
              <span className="tag mono" aria-hidden="true">
                {c.tag} →
              </span>
            </Link>
          )
        })}
      </div>

      <div className="vignette" aria-hidden="true" />

      <div className="home-top">
        <Link href="/" className="serif logo">
          {siteName}
        </Link>
        <span className="count mono">{fmt(it.counter, { faces, questions })}</span>
      </div>

      <div className="home-center">
        <span className="kicker mono">
          {cur ? (cur.about ? it.aboutCard : it.question) : it.kicker}
        </span>
        <h1 className="serif question" aria-live="polite">
          {cur ? cur.question : defaultQuestion}
        </h1>
        <svg className="stroke" aria-hidden="true" viewBox="0 0 420 26">
          <path
            d="M4 18 C 80 6, 170 22, 250 12 S 380 8, 416 16"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="depth mono" aria-hidden="true">
        <span>{it.near}</span>
        <div className="rail">
          <span className="dot" style={{ '--d': cur ? cur.z : 0.5 } as React.CSSProperties} />
        </div>
        <span>{it.far}</span>
      </div>

      <div className="home-bottom">
        <div className="home-left">
          <span className="hint mono">{it.hint}</span>
          {legal.length > 0 && (
            <nav className="legal mono" aria-label="Informazioni">
              {legal.map((l) => (
                <Link key={l.id} href={`/${l.slug}`}>
                  {l.title}
                </Link>
              ))}
            </nav>
          )}
        </div>
        <SiteNav items={menu} />
      </div>
    </div>
  )
}
