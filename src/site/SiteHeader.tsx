import Link from 'next/link'

import { getSettings } from '@/lib/data'

import { SiteNav } from './SiteNav'

export async function SiteHeader({ current }: { current?: 'about' | 'portraits' | 'diary' }) {
  const s = await getSettings()
  return (
    <header className="top">
      <Link href="/" className="serif logo">
        {s.siteName}
      </Link>
      <SiteNav current={current} />
    </header>
  )
}
