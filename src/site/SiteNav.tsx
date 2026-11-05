import Link from 'next/link'

export type MenuItem = { key: string; href: string; label: string }

// The menu comes from the pages that have a menu label (see getMenu in src/lib/data.ts).
export function SiteNav({ items, current }: { items: MenuItem[]; current?: string }) {
  return (
    <nav className="nav" aria-label="Principale">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className="mono"
          aria-current={current === item.key ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
