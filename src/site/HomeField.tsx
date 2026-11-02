'use client'

import Link from 'next/link'
import { useState } from 'react'

import { it } from './it'
import { SiteNav } from './SiteNav'
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
}

type Props = {
  cards: FieldCard[]
  siteName: string
  defaultQuestion: string
  faces: number
  questions: number
}

export function HomeField({ cards, siteName, defaultQuestion, faces, questions }: Props) {
  const [active, setActive] = useState<number | null>(null)
  const ref = useParallax<HTMLDivElement>()
  const cur = active === null ? null : cards[active]

  return (
    <div
      ref={ref}
      className="field glow home"
      data-hover={cur ? '' : undefined}
      onMouseLeave={() => setActive(null)}
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
              onFocus={() => setActive(i)}
              style={
                {
                  '--x': c.x,
                  '--y': c.y,
                  '--w': c.w,
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
        <span className="count mono">{it.home.counter(faces, questions)}</span>
      </div>

      <div className="home-center">
        <span className="kicker mono">
          {cur ? (cur.about ? it.home.aboutCard : it.home.question) : it.home.kicker}
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
        <span>{it.home.near}</span>
        <div className="rail">
          <span className="dot" style={{ '--d': cur ? cur.z : 0.5 } as React.CSSProperties} />
        </div>
        <span>{it.home.far}</span>
      </div>

      <div className="home-bottom">
        <span className="hint mono">{it.home.hint}</span>
        <SiteNav />
      </div>
    </div>
  )
}
