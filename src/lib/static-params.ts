// With Cache Components, generateStaticParams must return at least one entry, but a fresh
// site has no content yet. '_' can never be a real slug (slugs only contain a-z, 0-9 and
// dashes), so it prerenders a harmless 404 until real content exists.
export const staticSlugParams = (slugs: string[]) =>
  (slugs.length > 0 ? slugs : ['_']).map((slug) => ({ slug }))
