'use client'

import { useEffect, useRef } from 'react'

// Degrees of tilt that move the faces all the way (the scene follows changes of tilt, see below).
const TILT_RANGE = 18
// How fast the resting angle follows the phone: holding it tilted slowly becomes the new "centre".
const RECENTRE = 0.02

type IOSOrientationEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v))

/**
 * Sets --mx / --my (-1..1) on the element so faces drift at different speeds (see .card in
 * site.css). The pointer drives it with a mouse; on a touch screen the field follows the finger
 * while it is dragged and the tilt of the phone otherwise. iPhones ask for permission to read
 * the motion sensors: it is requested on the first tap, the only moment Safari allows it.
 * Skipped for reduced motion.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let x = 0
    let y = 0
    const apply = () => {
      raf = 0
      el.style.setProperty('--mx', x.toFixed(3))
      el.style.setProperty('--my', y.toFixed(3))
    }
    const set = (nx: number, ny: number) => {
      x = nx
      y = ny
      if (!raf) raf = requestAnimationFrame(apply)
    }

    // Tilt (touch screens only)
    let tiltX = 0
    let tiltY = 0
    let base: { beta: number; gamma: number } | null = null
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return
      if (!base) base = { beta: e.beta, gamma: e.gamma }
      base.beta += (e.beta - base.beta) * RECENTRE
      base.gamma += (e.gamma - base.gamma) * RECENTRE
      const db = e.beta - base.beta
      const dg = e.gamma - base.gamma
      // Phone turned sideways: the axes swap.
      const angle = ((screen.orientation?.angle ?? 0) + 360) % 360
      const [h, v] =
        angle === 90 ? [db, -dg] : angle === 270 ? [-db, dg] : angle === 180 ? [-dg, -db] : [dg, db]
      tiltX = clamp(h / TILT_RANGE)
      tiltY = clamp(v / TILT_RANGE)
      set(tiltX, tiltY)
    }
    let listening = false
    const listen = () => {
      if (listening) return
      listening = true
      window.addEventListener('deviceorientation', onTilt)
    }

    const touch = window.matchMedia('(pointer: coarse)').matches
    const ios = (window.DeviceOrientationEvent as IOSOrientationEvent | undefined)
      ?.requestPermission
    const askOnTap = () => {
      if (!ios) return
      void ios
        .call(window.DeviceOrientationEvent)
        .then((state) => state === 'granted' && listen())
        .catch(() => {
          // Refused or unavailable: the faces simply stay still.
        })
    }
    if (touch) {
      if (ios) el.addEventListener('click', askOnTap, { once: true })
      else if ('DeviceOrientationEvent' in window) listen()
    }

    const move = (e: PointerEvent) => {
      // A finger scrolls the page: on a touch screen only the tilt of the phone moves the faces.
      if (e.pointerType === 'touch') return
      const r = el.getBoundingClientRect()
      set(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2)
    }
    const leave = () => set(tiltX, tiltY)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('pointerup', leave)
    el.addEventListener('pointercancel', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('pointerup', leave)
      el.removeEventListener('pointercancel', leave)
      el.removeEventListener('click', askOnTap)
      window.removeEventListener('deviceorientation', onTilt)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return ref
}
