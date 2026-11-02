import Link from 'next/link'

import { getNavPages, getSettings } from '@/lib/data'

import { it } from './it'
import { Year } from './Year'

export async function SiteFooter() {
  const [s, pages] = await Promise.all([getSettings(), getNavPages()])
  return (
    <footer className="foot mono">
      <span>
        © <Year /> {s.siteName} · {it.footer.rights}
      </span>
      <nav aria-label="Informazioni">
        {pages.map((p) => (
          <Link key={p.id} href={`/${p.slug}`}>
            {p.title}
          </Link>
        ))}
        {s.instagram && <a href={s.instagram}>Instagram</a>}
      </nav>
    </footer>
  )
}
