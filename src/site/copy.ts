// Every piece of text on the public site that is not a document (portrait, article...) lives on a
// page in the admin, in a group of fields named after the page. This file is the single source:
// it defines the fields (label, default text, hint) and the defaults used when a field is empty.

type Spec = Record<string, readonly [label: string, value: string, hint?: string]>

export const PAGE_COPY = {
  home: {
    defaultQuestion: ['Question shown at rest', 'Chi eri prima che te lo dicessero gli altri?'],
    kicker: ['Line above the question at rest', 'Una domanda'],
    question: ['Line above a face’s question', 'La domanda'],
    hint: ['Hint (bottom left)', 'Muovi lo sguardo · scorri per entrare nel campo'],
    near: ['Depth scale: near', 'Vicino'],
    far: ['Depth scale: far', 'Lontano'],
    counter: [
      'Counter (top right)',
      '{faces} volti · {questions} domande',
      'Use {faces} and {questions} where the numbers go.',
    ],
    aboutCard: ['Label of the "about" face', 'Chi è Luke'],
    aboutQuestion: ['Question of the "about" face', 'Chi c’è dietro l’obiettivo?'],
  },
  portraits: {
    all: ['Filter: all', 'Tutti'],
    single: ['Filter and label: portraits without a series', 'Ritratti singoli'],
    series: ['Label: series', 'Serie'],
    more: ['"Show more" button', 'Altri ritratti ↓'],
    aria: ['Screen reader label of the grid', 'Tutti i ritratti'],
    alt: [
      'Fallback photo description',
      'Ritratto N° {n}',
      'Used when a photo has no description of its own. {n} is the portrait number.',
    ],
    empty: ['Text when there are no portraits', 'I primi ritratti arrivano presto.'],
    metaDescription: [
      'Search result text of a portrait without a note',
      '{question} Ritratto N° {n} di {siteName}.',
      'Shown by search engines under the title. {question}, {n} and {siteName} are filled in.',
    ],
    back: ['Portrait page: back link when opened directly', '← Torna nel campo'],
    backPrev: ['Portrait page: back link when coming from the site', '← Indietro'],
    prev: ['Portrait page: previous', '← Volto precedente'],
    next: ['Portrait page: next', 'Volto successivo →'],
  },
  diary: {
    subtitle: ['Subtitle', 'Quello che succede prima e dopo lo scatto'],
    latest: ['Badge on the latest page', 'Ultima pagina'],
    read: ['"Read" link', 'Leggi →'],
    roll: ['Title of the film roll', 'Il rullino · tutte le pagine'],
    filter: ['Screen reader label of the topic filter', 'Filtra per tema'],
    all: ['Filter: all', 'Tutti'],
    prev: ['Screen reader label: previous frames', 'Fotogrammi precedenti'],
    next: ['Screen reader label: next frames', 'Fotogrammi successivi'],
    noPhoto: ['Frame of a page without photo', 'Pagina senza foto'],
    nextPage: ['Label before the next article', 'Pagina successiva'],
    minutes: ['Reading time', '{n} min', 'Use {n} for the number of minutes.'],
    photos: ['Number of photos', '{n} fotografie', 'Use {n} for the number of photos.'],
    empty: ['Text when there are no pages', 'Le prime pagine del diario arrivano presto.'],
    themeVita: ['Topic: "Vita da fotografo"', 'Vita da fotografo'],
    themeMostre: ['Topic: "Mostre"', 'Mostre'],
    themeDietro: ['Topic: "Dietro il ritratto"', 'Dietro il ritratto'],
  },
  gate: {
    kicker: ['Small line above the title', 'Fuori fuoco'],
    title: ['Title', 'Questa stanza si mette a fuoco con una parola.'],
    hint: ['Hint under the title', 'Te l’ha data Luke. Se non la ricordi, scrivigli.'],
    label: ['Password field label', 'Parola d’accesso'],
    placeholder: ['Password field placeholder', 'La parola'],
    submit: ['Button', 'Metti a fuoco'],
    wrong: ['Message: wrong password', 'Ancora sfocato. Riprova.'],
    tooMany: ['Message: too many attempts', 'Troppi tentativi. Riprova tra qualche minuto.'],
    private: ['Label in the top bar', 'Galleria privata'],
    open: ['Label when the gallery is open', 'A fuoco'],
    close: ['Photo viewer: close button', 'Chiudi'],
    openPhoto: ['Photo viewer: label of a photo you can open', 'Ingrandisci la foto'],
    prevPhoto: ['Photo viewer: previous photo', 'Foto precedente'],
    nextPhoto: ['Photo viewer: next photo', 'Foto successiva'],
    download: ['Photo viewer: download button', 'Scarica'],
    counter: [
      'Photo viewer: counter',
      '{n} / {total}',
      'Use {n} for the photo number and {total} for how many there are.',
    ],
    expired: ['Message: gallery expired', 'Questa galleria non è più disponibile. Scrivi a Luke.'],
  },
} as const satisfies Record<string, Spec>

export type CopyKind = keyof typeof PAGE_COPY

type Defaults<K extends CopyKind> = { [F in keyof (typeof PAGE_COPY)[K]]: string }
export type Copy = { [K in CopyKind]: Defaults<K> }

export const DEFAULT_COPY = Object.fromEntries(
  Object.entries(PAGE_COPY).map(([kind, spec]) => [
    kind,
    Object.fromEntries(Object.entries(spec).map(([name, [, value]]) => [name, value])),
  ]),
) as unknown as Copy

// Technical pages: shown when something breaks, so they stay in the code.
export const SYSTEM_TEXT = {
  skip: 'Vai al contenuto',
  notFound: {
    title: 'Pagina non trovata',
    text: 'Questa pagina non esiste o è stata spostata.',
    home: 'Torna nel campo',
  },
  error: { title: 'Qualcosa è andato storto', text: 'Riprova tra un momento.', retry: 'Riprova' },
}

// What search engines show for the main pages when their SEO fields (Pages → SEO) are empty.
export const DEFAULT_SEO = {
  home: {
    title: '{siteName} — ritrattista concettuale · Piacenza',
    description:
      '{siteName}, ritrattista concettuale a Piacenza. Un campo di volti, ognuno con la sua domanda.',
  },
  portraits: {
    description: 'I ritratti di {siteName}: ogni volto con la sua domanda. Filtra per serie.',
  },
  about: {
    description:
      '{siteName} racconta storie intime con una semplicità disarmante. Come nasce un ritratto, mostre e contatti.',
  },
  diary: { description: 'Il diario di {siteName}: quello che succede prima e dopo lo scatto.' },
}

/** Fills the placeholders of a template: fmt('{n} min', { n: 5 }) → "5 min". */
export const fmt = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m))

/** The text of each group from the saved pages, with the default wherever a field is empty. */
export const mergeCopy = (
  groups: Partial<Record<CopyKind, Record<string, unknown> | null>>,
): Copy => {
  const out: Record<string, Record<string, string>> = {}
  for (const kind of Object.keys(DEFAULT_COPY) as CopyKind[]) {
    const saved = groups[kind] ?? {}
    out[kind] = Object.fromEntries(
      Object.entries(DEFAULT_COPY[kind]).map(([name, def]) => {
        const v = saved[name]
        return [name, typeof v === 'string' && v.trim() ? v : def]
      }),
    )
  }
  return out as unknown as Copy
}

/** The label of each topic of the diary, keyed by the value stored on the article. */
export const themeLabels = (d: Copy['diary']): Record<string, string> => ({
  'vita-da-fotografo': d.themeVita,
  mostre: d.themeMostre,
  'dietro-il-ritratto': d.themeDietro,
})

/** The page "kinds" the site needs to exist, with their fixed slug (it is also the route). */
export const SYSTEM_PAGES = [
  { kind: 'home', slug: 'home', title: 'Home' },
  { kind: 'about', slug: 'chi-e', title: 'Chi è', menuLabel: 'Chi è', menuOrder: 1 },
  { kind: 'portraits', slug: 'ritratti', title: 'Ritratti', menuLabel: 'Ritratti', menuOrder: 2 },
  { kind: 'diary', slug: 'diario', title: 'Diario', menuLabel: 'Diario', menuOrder: 3 },
  { kind: 'gate', slug: 'galleria-privata', title: 'Galleria privata' },
] as const
