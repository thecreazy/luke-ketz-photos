import Link from 'next/link'

import { getPosts } from '@/lib/data'

export const metadata = { title: 'Blog', alternates: { canonical: '/blog' } }

export default async function Blog() {
  const posts = await getPosts()

  return (
    <section>
      <h1>Blog</h1>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>
            <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            {p.publishedAt && (
              <span className="muted">
                {' '}
                — {new Date(p.publishedAt).toLocaleDateString('en-GB')}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
