'use client'

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { useActionState, useState } from 'react'

import { unlock } from '@/app/(frontend)/galleries/[slug]/actions'

import { it } from './it'

// The locked gallery: faces out of focus that sharpen as the password is typed.
export function GateRoom({
  slug,
  title,
  children,
}: {
  slug: string
  title: string
  children: ReactNode
}) {
  const [state, action, pending] = useActionState(unlock.bind(null, slug), undefined)
  const [length, setLength] = useState(0)

  return (
    <div
      className="field glow room"
      style={{ '--sharp': Math.min(length, 6) / 6 } as CSSProperties}
    >
      <div className="field-layer">{children}</div>
      <div className="room-veil" aria-hidden="true" />

      <div className="top over">
        <Link href="/" className="serif logo">
          Luke Ketz
        </Link>
        <span className="mono muted">
          {it.gallery.private} · {title}
        </span>
      </div>

      <div className="gate">
        <span className="mono muted">{it.gallery.kicker}</span>
        <h1 className="serif question">{it.gallery.title}</h1>
        <p className="serif hint">{it.gallery.hint}</p>
        <form action={action} key={state?.n} className={state?.error ? 'shake' : undefined}>
          <label htmlFor="pw" className="mono muted">
            {it.gallery.label}
          </label>
          <input
            id="pw"
            name="password"
            type="password"
            autoComplete="off"
            required
            autoFocus
            placeholder={it.gallery.placeholder}
            onChange={(e) => setLength(e.target.value.length)}
          />
          <button type="submit" className="mono" disabled={pending}>
            {it.gallery.submit}
          </button>
        </form>
        {state?.error && (
          <p role="alert" className="mono accent">
            {state.error}
          </p>
        )}
      </div>
    </div>
  )
}
