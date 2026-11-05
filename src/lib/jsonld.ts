import { env } from './env'

const site = () => env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')

/** Absolute address of a path of the site. */
export const absolute = (path: string) => `${site()}${path === '/' ? '' : path}`

/** The breadcrumb trail of a page: [name, path] from the home down to the page. */
export const breadcrumb = (trail: [name: string, path: string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: absolute(path),
  })),
})

type PersonInput = {
  name: string
  jobTitle?: string | null
  instagram?: string | null
  description?: string | null
  image?: string | null
}

/** The photographer, as a Person. */
export const person = (p: PersonInput) => ({
  '@type': 'Person',
  name: p.name,
  url: site(),
  jobTitle: p.jobTitle || undefined,
  description: p.description || undefined,
  image: p.image || undefined,
  sameAs: p.instagram ? [p.instagram] : undefined,
})
