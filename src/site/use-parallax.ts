'use client'

import { useEffect, useRef } from 'react'

/**
 * Sets --mx / --my (-1..1) on the element while the pointer moves over it, so faces drift at
 * different speeds (see .card in site.css). Skipped for reduced motion; on touch screens the
 * field follows the finger while it is dragged.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (calm.matches) return

    let raf = 0
    let x = 0
    let y = 0
    const apply = () => {
      raf = 0
      el.style.setProperty('--mx', x.toFixed(3))
      el.style.setProperty('--my', y.toFixed(3))
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      x = ((e.clientX - r.left) / r.width - 0.5) * 2
      y = ((e.clientY - r.top) / r.height - 0.5) * 2
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const leave = () => {
      x = 0
      y = 0
      if (!raf) raf = requestAnimationFrame(apply)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return ref
}
