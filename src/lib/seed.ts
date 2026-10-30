import type { Payload } from 'payload'

const paragraph = (text: string) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  children: [{ type: 'text', version: 1, text, detail: 0, format: 0, mode: 'normal', style: '' }],
})

const richText = (...paragraphs: string[]) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    children: paragraphs.map(paragraph),
  },
})

// Starting points only, NOT legal advice: the photographer (or their lawyer) must review and
// complete them. They are created as drafts so nothing goes public until someone publishes them.
const LEGAL_PAGES = [
  {
    title: 'Privacy policy',
    slug: 'privacy-policy',
    content: richText(
      'DRAFT — replace the bracketed parts, have it reviewed, then publish.',
      'Who we are: [Name / business name], [address], [contact email].',
      'What we collect: this website does not use analytics or advertising and has no contact form. Hosting providers process technical data (IP address, browser, date and time of the request) in server logs, which is needed to deliver and protect the site.',
      'Private galleries: to open a private gallery the visitor enters a password. We store how many times a gallery was opened and when it was last opened, without any personal data.',
      'Your rights: you can ask us for access to, correction or deletion of your data, and complain to the data protection authority, by writing to [contact email].',
    ),
  },
  {
    title: 'Cookie policy',
    slug: 'cookie-policy',
    content: richText(
      'DRAFT — review and publish. If you add analytics, a map, a video player or any other third-party service, update this page and add a consent banner.',
      'This website only uses one technical cookie, set when a visitor unlocks a private gallery. It remembers that the password was entered, expires after 7 days and is not used for tracking.',
      'Technical cookies do not require consent. Visitors can delete cookies at any time from their browser settings.',
    ),
  },
]

// Creates the "home" page on first start if it is missing. Never touches an existing one.
export const ensureHomePage = async (payload: Payload) => {
  const existing = await payload.find({
    collection: 'pages',
    limit: 1,
    where: { slug: { equals: 'home' } },
  })
  if (existing.totalDocs > 0) return

  try {
    await payload.create({
      collection: 'pages',
      context: { disableRevalidate: true },
      data: {
        title: 'Home',
        slug: 'home',
        _status: 'published',
        content: {
          root: {
            type: 'root',
            version: 1,
            direction: 'ltr',
            format: '',
            indent: 0,
            children: [paragraph('Welcome. Edit this text from the "Home" page in the admin.')],
          },
        },
      },
    })
    // Only on a brand new site, so a page the photographer deleted never comes back.
    for (const page of LEGAL_PAGES) {
      await payload.create({
        collection: 'pages',
        context: { disableRevalidate: true },
        data: { ...page, _status: 'draft' },
        draft: true,
      })
    }
  } catch (error) {
    // Several workers/instances start at once (e.g. `next build`): losing the race is fine.
    const lost = JSON.stringify(error).includes('Value must be unique')
    if (!lost) throw error
  }
}
