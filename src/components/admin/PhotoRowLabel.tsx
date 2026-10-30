'use client'

import { useRowLabel } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'

type Row = { image?: number | { id: number }; caption?: string }
type Info = { filename: string; thumb?: string }

// One request per photo id, shared between rows and re-renders.
const cache = new Map<number, Promise<Info>>()

const load = (id: number): Promise<Info> => {
  let hit = cache.get(id)
  if (!hit) {
    hit = fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
      .then((r) => r.json())
      .then((m) => ({ filename: m.filename ?? `#${id}`, thumb: m.sizes?.sm?.url ?? m.url }))
    cache.set(id, hit)
  }
  return hit
}

// Row label of a project's photo list: thumbnail + file name (+ caption) instead of "Photo 17".
export const PhotoRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<Row>()
  const id = typeof data.image === 'object' ? data.image?.id : data.image
  const [info, setInfo] = useState<Info | null>(null)

  useEffect(() => {
    let live = true
    if (id) load(id).then((i) => live && setInfo(i))
    return () => {
      live = false
    }
  }, [id])

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={{ opacity: 0.6, minWidth: '2ch' }}>{(rowNumber ?? 0) + 1}</span>
      {info?.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={info.thumb} alt="" width={36} height={36} style={{ objectFit: 'cover' }} />
      ) : (
        <span style={{ width: 36, height: 36, background: 'rgba(128,128,128,.25)' }} />
      )}
      <span>
        {info?.filename ?? '…'}
        {data.caption ? ` — ${data.caption}` : ''}
      </span>
    </span>
  )
}
