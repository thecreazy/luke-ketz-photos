'use client'

import { SYSTEM_TEXT as it } from '@/site/copy'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="gate-page">
      <h1 className="serif question">{it.error.title}</h1>
      <p className="body muted">{it.error.text}</p>
      <button type="button" className="mono accent" onClick={reset}>
        {it.error.retry}
      </button>
    </div>
  )
}
