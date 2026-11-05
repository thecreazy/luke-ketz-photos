import Link from 'next/link'

import { getSettings } from '@/lib/data'

import { SiteMenu } from './SiteMenu'

export async function SiteHeader({ current }: { current?: string }) {
  const s = await getSettings()
  return (
    <header className="top">
      <Link href="/" className="serif logo">
        {s.siteName}
      </Link>
      <SiteMenu current={current} />
    </header>
  )
}
