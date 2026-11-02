'use cache'

// Cached readers for the public site. Every function is tagged so the hooks in
// src/lib/revalidate.ts can invalidate exactly what an edit touches. `cacheLife('max')` means
// "keep until invalidated": the database is only hit after a change in the admin.
//
// Drafts: with `versions.drafts` the main table also holds never-published documents, so every
// query filters on `_status: published`.
import { cacheLife, cacheTag } from 'next/cache'

import { payload } from './payload'

const published = { _status: { equals: 'published' } } as const

export async function getSettings() {
  cacheTag('settings', 'media')
  cacheLife('max')
  return (await payload()).findGlobal({ slug: 'site-settings', depth: 1 })
}

export async function getAbout() {
  cacheTag('about', 'media')
  cacheLife('max')
  return (await payload()).findGlobal({ slug: 'about', depth: 1 })
}

// Plain pages (privacy, cookies...): listed in the footer.
export async function getNavPages() {
  cacheTag('pages')
  cacheLife('max')
  const { docs } = await (
    await payload()
  ).find({
    collection: 'pages',
    depth: 0,
    pagination: false,
    sort: 'title',
    select: { title: true, slug: true },
    where: { ...published, slug: { not_equals: 'home' } },
  })
  return docs
}

export async function getPage(slug: string) {
  cacheTag(`page:${slug}`, 'media')
  cacheLife('max')
  const { docs } = await (
    await payload()
  ).find({
    collection: 'pages',
    depth: 1,
    limit: 1,
    where: { ...published, slug: { equals: slug } },
  })
  return docs[0] ?? null
}

export async function getPageSlugs() {
  cacheTag('pages')
  cacheLife('max')
  const { docs } = await (
    await payload()
  ).find({
    collection: 'pages',
    depth: 0,
    pagination: false,
    select: { slug: true },
    where: { ...published, slug: { not_equals: 'home' } },
  })
  return docs.map((d) => d.slug)
}

// All published portraits in site order. Position in this list is the "N°" shown on the site.
export async function getPortraits() {
  cacheTag('portraits', 'projects', 'media')
  cacheLife('max')
  const { docs } = await (
    await payload()
  ).find({
    collection: 'portraits',
    depth: 1,
    pagination: false,
    sort: ['order', 'createdAt'],
    where: published,
  })
  return docs.map((doc, i) => ({ doc, n: i + 1 }))
}

export async function getPortraitSlugs() {
  cacheTag('portraits')
  cacheLife('max')
  const { docs } = await (
    await payload()
  ).find({
    collection: 'portraits',
    depth: 0,
    pagination: false,
    select: { slug: true },
    where: published,
  })
  return docs.map((d) => d.slug)
}

export async function getSeries() {
  cacheTag('projects')
  cacheLife('max')
  const { docs } = await (
    await payload()
  ).find({
    collection: 'projects',
    depth: 0,
    pagination: false,
    sort: ['order', 'title'],
    where: published,
  })
  return docs
}

export async function getPosts() {
  cacheTag('posts', 'media')
  cacheLife('max')
  const { docs } = await (
    await payload()
  ).find({
    collection: 'posts',
    depth: 1,
    pagination: false,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      theme: true,
      layout: true,
      readTime: true,
      publishedAt: true,
      excerpt: true,
      cover: true,
    },
    where: published,
  })
  return docs
}

export async function getPost(slug: string) {
  cacheTag(`post:${slug}`, 'media')
  cacheLife('max')
  const { docs } = await (
    await payload()
  ).find({
    collection: 'posts',
    depth: 2,
    limit: 1,
    where: { ...published, slug: { equals: slug } },
  })
  return docs[0] ?? null
}

export async function getPostSlugs() {
  cacheTag('posts')
  cacheLife('max')
  const { docs } = await (
    await payload()
  ).find({
    collection: 'posts',
    depth: 0,
    pagination: false,
    select: { slug: true },
    where: published,
  })
  return docs.map((d) => d.slug)
}

// Every public URL with its last edit, for the sitemap.
export async function getSitemapEntries() {
  cacheTag('pages', 'portraits', 'posts')
  cacheLife('max')
  const p = await payload()
  const find = (collection: 'pages' | 'portraits' | 'posts', extra = {}) =>
    p.find({
      collection,
      depth: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
      where: { ...published, ...extra },
    })
  const [pages, portraits, posts] = await Promise.all([
    find('pages', { slug: { not_equals: 'home' } }),
    find('portraits'),
    find('posts'),
  ])
  return { pages: pages.docs, portraits: portraits.docs, posts: posts.docs }
}
