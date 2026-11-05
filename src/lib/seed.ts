import type { Payload } from 'payload'

import { SYSTEM_PAGES } from '@/site/copy'

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

const ABOUT_START = {
  intro: [
    {
      style: 'paragraph' as const,
      text: "Cerco l'impatto: il contrasto tra una bellezza istintiva e qualcosa di più riflessivo, una lotta interiore. Voglio raccontare storie intime con una semplicità disarmante.",
    },
    { style: 'quote' as const, text: 'Non esistono persone non fotogeniche.' },
    {
      style: 'paragraph' as const,
      text: 'Esiste chi non sa far emergere la bellezza di chi ha davanti. Il mio lavoro è questo.',
    },
  ],
  steps: [
    {
      title: 'Il dialogo',
      text: "Parlo, e intanto osservo. Cerco l'anima che non si è ancora espressa.",
    },
    {
      title: 'La domanda scomoda',
      text: 'A volte serve una domanda che mette a disagio per entrare in sintonia con quello che una persona ha vissuto.',
    },
    {
      title: "L'alchimia",
      text: 'È il momento in cui riesco ad andare oltre lo sguardo e il corpo e l’anima finalmente coincidono. A quel punto la posa non conta più.',
    },
  ],
  exhibitions: [{ title: 'Oltre il Visibile', place: 'Piacenza', year: '2026' }],
}

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

// The pages the site is built around (home, about, portraits, diary, private gallery) must exist:
// they hold the site's texts. Created on start when missing, never overwritten once they exist.
// The legal drafts are only created on a brand new site, so a page deleted later does not return.
export const ensureSystemPages = async (payload: Payload) => {
  const lost = (error: unknown) => JSON.stringify(error).includes('Value must be unique')
  try {
    // Published pages live in the main table, never-published drafts only in the versions.
    const find = (draft: boolean) =>
      payload.find({
        collection: 'pages',
        draft,
        limit: 100,
        depth: 0,
        pagination: false,
        select: { slug: true, kind: true },
      })
    const [published, drafts] = await Promise.all([find(false), find(true)])
    const bySlug = new Map([...drafts.docs, ...published.docs].map((d) => [d.slug, d]))
    const brandNew = bySlug.size === 0

    for (const sp of SYSTEM_PAGES) {
      const found = bySlug.get(sp.slug)
      try {
        if (found) {
          // A page created before kinds existed (the old home): adopt it.
          if (found.kind !== sp.kind) {
            await payload.update({
              collection: 'pages',
              id: found.id,
              context: { disableRevalidate: true },
              data: { kind: sp.kind },
            })
          }
          continue
        }
        await payload.create({
          collection: 'pages',
          context: { disableRevalidate: true },
          data: {
            ...sp,
            _status: 'published',
            // About: the starting text, to be replaced by the photographer's own.
            ...(sp.kind === 'about' ? { about: ABOUT_START } : {}),
          },
        })
      } catch (error) {
        // Several workers/instances start at once (e.g. `next build`): losing the race is fine.
        if (!lost(error)) throw error
      }
    }

    if (brandNew) {
      for (const page of LEGAL_PAGES) {
        try {
          await payload.create({
            collection: 'pages',
            context: { disableRevalidate: true },
            data: { ...page, _status: 'draft' },
            draft: true,
          })
        } catch (error) {
          if (!lost(error)) throw error
        }
      }
    }
  } catch (error) {
    if (!JSON.stringify(error).includes('Value must be unique')) throw error
  }
}
