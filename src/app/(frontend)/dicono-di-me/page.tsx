import type { Metadata } from 'next'

import { JsonLd } from '@/components/JsonLd'
import { getCopy, getTestimonials } from '@/lib/data'
import { absolute, breadcrumb } from '@/lib/jsonld'
import { NETWORK_NAMES, profileLink } from '@/lib/links'
import { systemMetadata } from '@/lib/metadata'
import { photoSources } from '@/lib/photo'
import { fmt } from '@/site/copy'
import { SiteFooter } from '@/site/SiteFooter'
import { SiteHeader } from '@/site/SiteHeader'

export async function generateMetadata(): Promise<Metadata> {
  const [meta, voices] = await Promise.all([systemMetadata('say'), getTestimonials()])
  // Until the first answer is published the page has nothing to show: keep it out of search.
  return voices.length > 0 ? meta : { ...meta, robots: { index: false, follow: true } }
}

export default async function Say() {
  const [voices, copy] = await Promise.all([getTestimonials(), getCopy()])
  const it = copy.say

  return (
    <div className="page say">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: copy.titles.say,
            url: absolute('/dicono-di-me'),
          },
          breadcrumb([
            ['Home', '/'],
            [copy.titles.say, '/dicono-di-me'],
          ]),
        ]}
      />
      <SiteHeader current="dicono-di-me" />
      <main id="main" tabIndex={-1} className="wrap">
        <span className="mono accent say-kicker">{it.kicker}</span>
        <h1 className="serif big">{copy.titles.say}</h1>

        {voices.length === 0 ? (
          <p className="muted body say-empty">{it.empty}</p>
        ) : (
          <ol className="voices">
            {voices.map((v, i) => {
              const photo = photoSources(v.photo)
              const links = (v.profiles ?? []).flatMap((p) => {
                const link = profileLink(p.network, p.handle)
                return link ? [{ id: p.id, network: p.network, ...link }] : []
              })
              return (
                <li key={v.id}>
                  <article className="voice">
                    {photo && (
                      <figure className="voice-photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.src}
                          srcSet={photo.srcSet}
                          sizes="(max-width: 760px) 100vw, 46vw"
                          alt={photo.alt || fmt(it.alt, { name: v.name })}
                          width={photo.width}
                          height={photo.height}
                          loading={i < 2 ? 'eager' : 'lazy'}
                          fetchPriority={i === 0 ? 'high' : undefined}
                          decoding="async"
                          style={{ background: photo.dominantColor ?? undefined }}
                        />
                      </figure>
                    )}
                    <div className="voice-text">
                      <span className="mono voice-ask">{it.questionLabel}</span>
                      <h2 className="serif voice-question">{v.question?.trim() || it.question}</h2>
                      <blockquote className="serif voice-quote">
                        <p>«{v.quote}»</p>
                      </blockquote>
                      <h3 className="mono voice-name">
                        {v.name}
                        {v.role?.trim() && <span className="voice-role">{v.role.trim()}</span>}
                      </h3>
                      {links.length > 0 && (
                        <ul className="voice-links mono" aria-label={`${it.profiles} · ${v.name}`}>
                          {links.map((l) => (
                            <li key={l.id}>
                              <a href={l.href} target="_blank" rel="noopener noreferrer">
                                <span className="net">{NETWORK_NAMES[l.network]}</span> {l.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                </li>
              )
            })}
          </ol>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
