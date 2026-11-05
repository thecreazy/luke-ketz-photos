import type { Metadata } from 'next'

import { JsonLd } from '@/components/JsonLd'
import { getAbout, getCopy, getMenu, getNavPages, getPortraits, getSettings } from '@/lib/data'
import { env } from '@/lib/env'
import { person } from '@/lib/jsonld'
import { systemMetadata } from '@/lib/metadata'
import { photoSources } from '@/lib/photo'
import { HomeField } from '@/site/HomeField'
import type { FieldCard } from '@/site/HomeField'
import { fmt } from '@/site/copy'

export const generateMetadata = (): Promise<Metadata> => systemMetadata('home')

// x, y, width and depth on the 1440x900 reference frame (0 near … 1 far).
const SLOTS: [number, number, number, number][] = [
  [70, 110, 330, 0.12],
  [500, 60, 140, 0.75],
  [1030, 70, 250, 0.35],
  [1250, 420, 150, 0.7],
  [930, 520, 340, 0.05],
  [200, 560, 170, 0.6],
  [660, 640, 190, 0.5],
  [380, 330, 100, 0.92],
  [1300, 690, 100, 0.9],
  [780, 210, 90, 1],
  [20, 400, 80, 0.95],
  [600, 390, 70, 1],
  [1140, 300, 80, 0.95],
]

// On a phone the faces are a vertical list instead of a frame: this is how deep each one sits
// (0 near … 1 far) and on which side it leans, in turns.
const LIST_DEPTH = [0.15, 0.5, 0.3, 0.65, 0.1, 0.45, 0.25]
const LIST_SIDE = [0, 1, 2, 1] // left, right, centre, right
// How many faces the phone list shows at most.
const LIST_MAX = 24

export default async function Home() {
  const [portraits, s, about, legal, it, menu] = await Promise.all([
    getPortraits(),
    getSettings(),
    getAbout(),
    getNavPages(),
    getCopy(),
    getMenu(),
  ])

  const withQuestion = portraits.filter((p) => p.doc.question)
  const featured = withQuestion.filter((p) => p.doc.featured)
  const pool = featured.length > 0 ? featured : withQuestion.length > 0 ? withQuestion : portraits
  const aboutSrc = photoSources(about.portrait)

  const cards: FieldCard[] = []
  const named = new Set<string>()
  const shown = { n: 0 } // faces the phone list shows, to alternate their sides

  type Slot = [number, number, number, number]
  const add = (
    key: string,
    p: (typeof pool)[number],
    about: boolean,
    slot: Slot,
    opts: { repeat?: boolean; listOnly?: boolean },
  ) => {
    const src = about ? aboutSrc : photoSources(p.doc.image)
    if (!src) return
    // The same portrait can fill several slots; a transition name must be unique.
    const vt = !about && !named.has(p.doc.slug) ? `portrait-${p.doc.slug}` : undefined
    if (vt) named.add(p.doc.slug)
    const visible = !opts.repeat
    cards.push({
      key,
      vt,
      href: about ? '/chi-e' : `/ritratti/${p.doc.slug}`,
      src: src.src,
      small: src.srcSet.split(' ')[0],
      srcSet: src.srcSet,
      alt: about ? `Ritratto di ${s.siteName}` : fmt(it.portraits.alt, { n: p.n }),
      tag: about ? it.home.aboutCard : `N° ${String(p.n).padStart(2, '0')}`,
      about,
      n: about ? undefined : String(p.n).padStart(2, '0'),
      question: about ? it.home.aboutQuestion : (p.doc.question ?? ''),
      x: slot[0],
      y: slot[1],
      w: slot[2],
      z: slot[3],
      zl: LIST_DEPTH[cards.length % LIST_DEPTH.length],
      side: visible ? LIST_SIDE[shown.n++ % LIST_SIDE.length] : 0,
      repeat: opts.repeat,
      listOnly: opts.listOnly,
    })
  }

  if (pool.length > 0) {
    const last = SLOTS.length - 1
    // The computer field: one face per slot (a short pool repeats; the phone list skips repeats).
    SLOTS.forEach((slot, i) => {
      if (i === last && aboutSrc) return
      add(`${i}`, pool[i % pool.length], false, slot, { repeat: i >= pool.length })
    })
    // More faces for the phone list only: it can show more than the frame has room for.
    // (When the photographer takes the last slot, the face that slot would have had goes here too.)
    pool.slice(aboutSrc ? SLOTS.length - 1 : SLOTS.length, LIST_MAX).forEach((p, k) => {
      add(`more-${k}`, p, false, [0, 0, 0, 1], { listOnly: true })
    })
    // The photographer comes last in the list, and takes the last slot of the field.
    if (aboutSrc) add('about', pool[0], true, SLOTS[last], {})
  }

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: s.siteName,
          url: env.NEXT_PUBLIC_SITE_URL,
          inLanguage: 'it',
          description: s.description ?? undefined,
          author: person({
            name: s.siteName,
            jobTitle: s.jobTitle,
            instagram: s.instagram,
            description: s.description,
            image: aboutSrc?.src,
          }),
        }}
      />
      <HomeField
        cards={cards}
        siteName={s.siteName}
        defaultQuestion={it.home.defaultQuestion}
        copy={it.home}
        menu={menu}
        faces={portraits.length}
        questions={withQuestion.length}
        legal={legal}
      />
    </>
  )
}
