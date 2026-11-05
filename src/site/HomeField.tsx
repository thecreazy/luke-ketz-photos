'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useSyncExternalStore, ViewTransition } from 'react'

import type { Copy } from './copy'
import { fmt } from './copy'
import { Credit } from './Credit'
import { SiteNav } from './SiteNav'
import type { MenuItem } from './SiteNav'
import { useParallax } from './use-parallax'

export type FieldCard = {
  key: string
  href: string
  src: string
  // The smallest variant: enough for the soft faces behind the list.
  small: string
  srcSet: string
  alt: string
  tag: string
  // Two-digit number of the portrait (the big handwritten numeral on phones).
  n?: string
  about: boolean
  question: string
  // Slot on the 1440x900 reference frame (computers): x, y, width and depth (0 near, 1 far).
  x: number
  y: number
  w: number
  z: number
  // Phones show a list instead: how deep the face sits, and which side it leans to (0 left,
  // 1 right, 2 centre).
  zl: number
  side: number
  // A computer slot that only repeats a face already shown: the phone list skips it.
  repeat?: boolean
  // A face only the phone list has room for: the computer frame skips it.
  listOnly?: boolean
  // Name of the photo for the page transition (unique on the page), when it opens a portrait.
  vt?: string
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

// Phone list: height of the fixed header and of the bottom panel with the menu (px).
const HEADER = 96
const PANEL = 270

// Phone list: each face leans a little, like prints dropped on a table (degrees).
const ROT = [-2.2, 1.6, -1, 2.4, -1.8, 0.8, -2.6, 1.2]

// Soft faces behind the phone list: x and y in % of the screen, width in vw, drift (0..1).
const BACKDROP: [number, number, number, number][] = [
  [-12, 6, 52, 0.6],
  [58, 20, 46, 0.9],
  [-6, 52, 44, 0.4],
  [60, 60, 54, 0.75],
  [28, 34, 36, 1],
  [66, 88, 40, 0.5],
]

const PHONE = '(max-width: 760px)'
const subscribePhone = (notify: () => void) => {
  const mq = window.matchMedia(PHONE)
  mq.addEventListener('change', notify)
  return () => mq.removeEventListener('change', notify)
}
const isPhone = () => window.matchMedia(PHONE).matches

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
  // The question only animates once it has changed: the first paint stays as it is.
  const [changed, setChanged] = useState(false)
  const choose = (i: number | null) => {
    setActive(i)
    if (i !== null) setChanged(true)
  }
  // On a phone the field is a list you scroll: the face in the middle of the screen is the one in
  // focus, so nothing depends on hovering.
  const phone = useSyncExternalStore(subscribePhone, isPhone, () => false)
  const ref = useParallax<HTMLElement>()
  const cur = active === null ? null : cards[active]
  const backdrop = cards.filter((c) => !c.about && !c.repeat).slice(0, BACKDROP.length)

  useEffect(() => {
    const field = ref.current
    if (!phone || !field) return
    let frame = 0
    const update = () => {
      frame = 0
      // The face is "in focus" in the middle of what the header and the bottom panel leave free
      // (the same numbers as the scroll snapping in the CSS).
      const free = window.innerHeight - PANEL - HEADER
      const focusLine = HEADER + free / 2
      const reach = free * 0.6
      let best: number | null = null
      let bestNear = 0
      field.querySelectorAll<HTMLElement>('.card').forEach((card) => {
        if (card.offsetParent === null) return // hidden slot
        const r = card.getBoundingClientRect()
        const near = Math.max(0, 1 - Math.abs(r.top + r.height / 2 - focusLine) / reach)
        card.style.setProperty('--near', near.toFixed(2))
        if (near > bestNear) {
          bestNear = near
          best = Number(card.dataset.i)
        }
      })
      // Until the visitor scrolls, the home shows its own question; after that always a face's.
      const started = window.scrollY > 24
      setActive(started ? best : null)
      if (started) setChanged(true)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      field.querySelectorAll<HTMLElement>('.card').forEach((c) => c.style.removeProperty('--near'))
    }
  }, [phone, ref])

  // The lens (computers): faces near the pointer come into focus, the others stay soft.
  const lensFrame = useRef(0)
  const lens = (e: React.PointerEvent<HTMLElement>) => {
    if (phone || e.pointerType === 'touch') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const field = e.currentTarget
    const { clientX, clientY } = e
    cancelAnimationFrame(lensFrame.current)
    lensFrame.current = requestAnimationFrame(() => {
      field.querySelectorAll<HTMLElement>('.card').forEach((card) => {
        const r = card.getBoundingClientRect()
        const d = Math.hypot(clientX - (r.left + r.width / 2), clientY - (r.top + r.height / 2))
        card.style.setProperty('--near', Math.max(0, 1 - d / 260).toFixed(2))
      })
    })
  }
  const lensOff = (e: React.PointerEvent<HTMLElement>) => {
    if (phone) return
    cancelAnimationFrame(lensFrame.current)
    e.currentTarget
      .querySelectorAll<HTMLElement>('.card')
      .forEach((card) => card.style.removeProperty('--near'))
  }

  return (
    <main
      id="main"
      tabIndex={-1}
      ref={ref}
      className="field glow home"
      data-hover={cur ? '' : undefined}
      onMouseLeave={() => !phone && choose(null)}
      onPointerMove={lens}
      onPointerLeave={lensOff}
      onClick={(e) => {
        // Touch tablets: a tap on the empty field lets go of the focused face.
        if (!phone && !(e.target as HTMLElement).closest('a')) choose(null)
      }}
    >
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
        <h1
          key={cur ? cur.question : defaultQuestion}
          className={`serif question${changed ? ' swap' : ''}`}
          aria-live={phone ? 'off' : 'polite'}
        >
          {cur ? cur.question : defaultQuestion}
        </h1>
        <svg
          // A different key than the heading's: siblings must not share one, or old questions pile up.
          key={phone ? `stroke-${cur ? cur.question : defaultQuestion}` : 'stroke'}
          className="stroke"
          aria-hidden="true"
          viewBox="0 0 420 26"
        >
          <path
            d="M4 18 C 80 6, 170 22, 250 12 S 380 8, 416 16"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        {/* Phones only (CSS): what to do, then how to open the face in focus. */}
        {cur ? (
          <Link href={cur.href} className="open mono">
            {it.open}
          </Link>
        ) : (
          <span className="phone-hint mono">{it.hintPhone}</span>
        )}
      </div>

      <div className="home-bottom">
        <SiteNav items={menu} />
      </div>

      {/* Phones: very soft faces drifting behind the list, like the field of the computer. */}
      <div className="backdrop" aria-hidden="true">
        {backdrop.map((c, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={c.key}
            src={c.small}
            alt=""
            loading="lazy"
            decoding="async"
            style={
              {
                '--bx': BACKDROP[k][0],
                '--by': BACKDROP[k][1],
                '--bw': BACKDROP[k][2],
                '--dz': BACKDROP[k][3],
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* The faces come after the logo and the menu in the reading and tab order. */}
      <div className="field-layer">
        {cards.map((c, i) => {
          const on = active === i
          const b = Math.abs(c.z - 0.08) * 10
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.src}
              srcSet={c.srcSet}
              sizes={`(max-width: 760px) 80vw, ${(c.w / 14.4).toFixed(1)}vw`}
              alt={c.alt}
              loading={i < 3 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : undefined}
              decoding="async"
            />
          )
          return (
            <Link
              key={c.key}
              href={c.href}
              className="card"
              data-i={i}
              data-first={i === 0 ? '' : undefined}
              data-side={c.side}
              data-repeat={c.repeat ? '' : undefined}
              data-list-only={c.listOnly ? '' : undefined}
              data-on={on ? '' : undefined}
              onMouseEnter={() => !phone && choose(i)}
              onFocus={(e) => {
                // Keyboard only: a tap's focus must not count as the first tap on tablets.
                if (e.currentTarget.matches(':focus-visible')) choose(i)
              }}
              onClick={(e) => {
                // Touch tablets (no hover, wider than a phone): the first tap brings the face into
                // focus and shows its question, the second one opens it. On a phone one tap opens.
                if (!phone && !window.matchMedia('(hover: hover)').matches && active !== i) {
                  e.preventDefault()
                  choose(i)
                }
              }}
              style={
                {
                  '--x': c.x,
                  '--y': c.y,
                  '--w': c.w,
                  '--i': i,
                  '--z': c.z,
                  '--zl': c.zl,
                  '--rot': `${ROT[i % ROT.length]}deg`,
                  '--zi': Math.round((1 - c.z) * 20),
                  '--b': b.toFixed(1),
                  '--o': (1 - c.z * 0.72).toFixed(2),
                  '--delay': `-${(i * 1.7).toFixed(1)}s`,
                } as React.CSSProperties
              }
            >
              {c.vt ? (
                <ViewTransition name={c.vt} share="morph" default="none">
                  {img}
                </ViewTransition>
              ) : (
                img
              )}
              <span className="corner tl" aria-hidden="true" />
              <span className="corner br" aria-hidden="true" />
              {/* Phones: the viewfinder that locks onto the face in focus, and its big numeral. */}
              <span className="box" aria-hidden="true" />
              {c.n && (
                <span className="num serif" aria-hidden="true">
                  {c.n}
                </span>
              )}
              <span className="tag mono" aria-hidden="true">
                {c.tag} →
              </span>
            </Link>
          )
        })}
      </div>

      <footer className="home-foot">
        <span className="hint mono">{it.hint}</span>
        <nav className="legal mono" aria-label="Informazioni">
          {legal.map((l) => (
            <Link key={l.id} href={`/${l.slug}`}>
              {l.title}
            </Link>
          ))}
          <Credit />
        </nav>
      </footer>

      <div className="vignette" aria-hidden="true" />

      <div className="depth mono" aria-hidden="true">
        <span>{it.near}</span>
        <div className="rail">
          <span className="dot" style={{ '--d': cur ? cur.z : 0.5 } as React.CSSProperties} />
        </div>
        <span>{it.far}</span>
      </div>
    </main>
  )
}
