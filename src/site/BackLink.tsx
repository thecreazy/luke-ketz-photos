'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'

// document.referrer does not change on in-app navigations, so they are counted here.
let navigatedInApp = false
let lastPath: string | null = null
const listeners = new Set<() => void>()

/** Mounted once in the layout: remembers that the visitor has moved around the site. */
export function NavTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (lastPath !== null && lastPath !== pathname) {
      navigatedInApp = true
      listeners.forEach((l) => l())
    }
    lastPath = pathname
  }, [pathname])
  return null
}

const cameFromSite = () => {
  if (navigatedInApp) return true
  try {
    return !!document.referrer && new URL(document.referrer).origin === location.origin
  } catch {
    return false
  }
}
const subscribe = (notify: () => void) => {
  listeners.add(notify)
  return () => {
    listeners.delete(notify)
  }
}

// Goes back to wherever the visitor came from on this site (home field, grid, series filter);
// a direct visit or a shared link falls back to the home.
export function BackLink({ label, backLabel }: { label: string; backLabel: string }) {
  const router = useRouter()
  const internal = useSyncExternalStore(subscribe, cameFromSite, () => false)

  return (
    <Link
      href="/"
      className="mono back"
      onClick={(e) => {
        if (!internal || e.metaKey || e.ctrlKey || e.shiftKey) return
        e.preventDefault()
        router.back()
      }}
    >
      <span suppressHydrationWarning>{internal ? backLabel : label}</span>
    </Link>
  )
}
