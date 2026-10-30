import Link from 'next/link'

export default function NotFound() {
  return (
    <section>
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <p>
        <Link href="/">Back to the home page</Link>
      </p>
    </section>
  )
}
