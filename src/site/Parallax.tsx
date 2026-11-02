'use client'

import type { ReactNode } from 'react'

import { useParallax } from './use-parallax'

// Wraps decorative faces: the pointer makes them drift at different speeds.
export function Parallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useParallax()
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
