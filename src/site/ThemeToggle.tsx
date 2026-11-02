'use client'

import { useSyncExternalStore } from 'react'

import { it } from './it'

const read = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
const subscribe = (notify: () => void) => {
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

// The inline script in the root layout sets data-theme before the first paint.
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => 'dark')

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      // private mode: the choice just does not persist
    }
  }

  return (
    <button type="button" className="mono" onClick={toggle} aria-label={it.theme.label}>
      <span suppressHydrationWarning>{theme === 'light' ? it.theme.toDark : it.theme.toLight}</span>
    </button>
  )
}
