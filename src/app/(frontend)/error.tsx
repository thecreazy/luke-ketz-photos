'use client'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section>
      <h1>Something went wrong</h1>
      <p className="muted">Please try again in a moment.</p>
      <p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </p>
    </section>
  )
}
