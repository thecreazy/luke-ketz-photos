'use client'

import { useEffect, useRef } from 'react'

import { canRunEffects } from './capabilities'

/**
 * Progressive enhancement for a graphic effect. Render the plain markup (a normal <Photo>) inside the
 * element that gets `ref`; `setup` runs only when the effect is allowed (no reduced motion, WebGL
 * available) and returns its cleanup. If the visitor changes the reduced-motion setting while the
 * page is open, the effect is torn down or started accordingly.
 *
 *   const ref = useEnhance((root) => { const stop = startShader(root); return stop })
 *   return <div ref={ref}><Photo media={media} /></div>
 *
 * `setup` is read once per mount: define it outside the component or wrap it in useCallback.
 */
export function useEnhance<T extends HTMLElement = HTMLDivElement>(
  setup: (root: T) => void | (() => void),
) {
  const ref = useRef<T>(null)
  const latest = useRef(setup)

  // Declared before the effect below, so it always sees the latest `setup`.
  useEffect(() => {
    latest.current = setup
  })

  useEffect(() => {
    const root = ref.current
    if (!root) return
    let cleanup: void | (() => void)
    const sync = () => {
      cleanup?.()
      cleanup = canRunEffects() ? latest.current(root) : undefined
    }
    sync()
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    query.addEventListener('change', sync)
    return () => {
      query.removeEventListener('change', sync)
      cleanup?.()
    }
  }, [])

  return ref
}
