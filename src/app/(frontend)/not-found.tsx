import Link from 'next/link'

import { it } from '@/site/it'

export default function NotFound() {
  return (
    <div className="gate-page">
      <span className="mono muted">404</span>
      <h1 className="serif question">{it.notFound.title}</h1>
      <p className="body muted">{it.notFound.text}</p>
      <Link href="/" className="mono accent">
        ← {it.notFound.home}
      </Link>
    </div>
  )
}
