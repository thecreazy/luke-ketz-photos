import type { Metadata } from 'next'
import React from 'react'

import { JsonLd } from '@/components/JsonLd'

import { getAbout, getPortraits, getSettings } from '@/lib/data'
import { absolute, person } from '@/lib/jsonld'
import { systemMetadata } from '@/lib/metadata'
import { photoSources } from '@/lib/photo'
import { Faces } from '@/site/Faces'
import { Parallax } from '@/site/Parallax'
import { SiteFooter } from '@/site/SiteFooter'
import { SiteHeader } from '@/site/SiteHeader'

export const generateMetadata = (): Promise<Metadata> => systemMetadata('about')

// "*word*" in the title is shown in italic.
const emphasise = (text: string) =>
  text
    .split(/\*([^*]+)\*/g)
    .map((part, i) =>
      i % 2 === 1 ? <em key={i}>{part}</em> : <React.Fragment key={i}>{part}</React.Fragment>,
    )

export default async function About() {
  const [a, s, portraits] = await Promise.all([getAbout(), getSettings(), getPortraits()])
  const luke = photoSources(a.portrait)
  const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii']

  return (
    <div className="field glow about page">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          url: absolute('/chi-e'),
          mainEntity: person({
            name: s.siteName,
            jobTitle: s.jobTitle,
            instagram: s.instagram,
            description: a.intro?.find((b) => b.style !== 'quote')?.text ?? s.description,
            image: luke?.src,
          }),
        }}
      />
      <Parallax className="field-layer fixed">
        <Faces images={portraits.slice(0, 8).map((p) => p.doc.image)} slots="margin" soften={2} />
      </Parallax>
      <div className="vignette" aria-hidden="true" />
      <SiteHeader current="chi-e" />

      <main className="about-main" data-solo={luke ? undefined : ''}>
        {luke && (
          <figure className="emerge-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="emerge"
              src={luke.src}
              srcSet={luke.srcSet}
              sizes="(max-width: 900px) 90vw, 46vw"
              alt={luke.alt || `Ritratto di ${s.siteName}`}
              width={luke.width}
              height={luke.height}
              fetchPriority="high"
            />
          </figure>
        )}

        <div className="about-text">
          {a.kicker && <span className="mono kicker">{a.kicker}</span>}
          <h1 className="serif big">{emphasise(a.headline ?? '')}</h1>

          <div className="about-intro">
            {a.intro?.map((b) =>
              b.style === 'quote' ? (
                <p key={b.id} className="serif pull">
                  {b.text}
                </p>
              ) : (
                <p key={b.id} className="body">
                  {b.text}
                </p>
              ),
            )}
          </div>

          {a.steps && a.steps.length > 0 && (
            <section className="about-steps">
              <h2 className="mono muted">{a.stepsTitle}</h2>
              {a.steps.map((st, i) => (
                <div key={st.id} className="step-row">
                  <span className="serif num">{roman[i] ?? i + 1}.</span>
                  <div>
                    <h3 className="serif">{st.title}</h3>
                    {st.text && <p className="body">{st.text}</p>}
                  </div>
                </div>
              ))}
            </section>
          )}

          <div className="about-lists">
            {a.exhibitions && a.exhibitions.length > 0 && (
              <section>
                <h2 className="mono muted">{a.exhibitionsTitle}</h2>
                <ul className="plain">
                  {a.exhibitions.map((e) => (
                    <li key={e.id} className="serif">
                      {e.title}
                      {(e.place || e.year) && (
                        <span className="mono muted">
                          {' '}
                          {[e.place, e.year].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              {a.commissionNote && <h2 className="mono muted">{a.commissionNote}</h2>}
              <p className="links mono">
                {s.email && <a href={`mailto:${s.email}`}>{a.contactLabel}</a>}
                {s.instagram && <a href={s.instagram}>Instagram</a>}
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
