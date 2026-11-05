import { getMenu } from '@/lib/data'

import { SiteNav } from './SiteNav'

/** The menu for server components; client components receive the items as a prop. */
export async function SiteMenu({ current }: { current?: string }) {
  return <SiteNav items={await getMenu()} current={current} />
}
