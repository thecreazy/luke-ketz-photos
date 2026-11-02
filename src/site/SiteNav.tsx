import Link from 'next/link'

import { it } from './it'
import { ThemeToggle } from './ThemeToggle'

export function SiteNav({ current }: { current?: 'about' | 'portraits' | 'diary' }) {
  const link = (href: string, label: string, key: string) => (
    <Link href={href} className="mono" aria-current={current === key ? 'page' : undefined}>
      {label}
    </Link>
  )
  return (
    <nav className="nav" aria-label="Principale">
      {link('/chi-e', it.nav.about, 'about')}
      {link('/ritratti', it.nav.portraits, 'portraits')}
      {link('/diario', it.nav.diary, 'diary')}
      <ThemeToggle />
    </nav>
  )
}
