import { cacheLife } from 'next/cache'

// `new Date()` is only allowed inside a cache scope when prerendering.
export async function Year() {
  'use cache'
  cacheLife('days')
  return <>{new Date().getFullYear()}</>
}
