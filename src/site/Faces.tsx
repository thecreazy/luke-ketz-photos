import type { Media } from '@/payload-types'
import { photoSources } from '@/lib/photo'

type Slot = [x: number, y: number, w: number, z: number]

// Positions on the 1440x900 reference frame (see .card in site.css).
const SLOTS: Record<string, Slot[]> = {
  // Behind a portrait: big and very soft.
  detail: [
    [-40, 60, 300, 0.5],
    [1000, -60, 260, 0.6],
    [1240, 520, 230, 0.55],
    [660, 700, 160, 0.8],
    [520, 40, 110, 0.95],
    [1180, 300, 90, 1],
    [40, 620, 200, 0.7],
    [880, 520, 90, 1],
    [1340, 120, 80, 1],
  ],
  // Around text: small and far, kept to the margins.
  margin: [
    [40, 120, 120, 0.9],
    [700, 80, 90, 1],
    [1250, 160, 140, 0.8],
    [1300, 640, 90, 1],
    [680, 760, 110, 0.95],
    [90, 560, 240, 0.25],
    [1150, 400, 170, 0.6],
    [60, 760, 90, 1],
  ],
  // A locked gallery: big, grey and out of focus.
  room: [
    [80, 120, 320, 0.2],
    [470, 80, 220, 0.5],
    [760, 140, 300, 0.25],
    [1120, 90, 250, 0.4],
    [180, 520, 240, 0.45],
    [480, 440, 330, 0.1],
    [860, 500, 260, 0.35],
    [1160, 450, 220, 0.5],
    [1300, 760, 120, 0.8],
  ],
}

// The same faces on a 390x844 phone frame: x, y and width (depth stays the same).
const PHONE: Record<string, [x: number, y: number, w: number][]> = {
  detail: [
    [-40, 66, 170],
    [250, 33, 150],
    [260, 465, 140],
    [140, 581, 90],
    [170, 199, 70],
    [330, 274, 60],
    [-10, 498, 130],
    [40, 315, 56],
    [320, 100, 50],
  ],
  margin: [
    [8, 100, 60],
    [300, 83, 56],
    [316, 299, 60],
    [330, 531, 50],
    [160, 631, 70],
    [-20, 465, 120],
    [20, 249, 50],
    [300, 647, 50],
  ],
  room: [
    [-20, 58, 180],
    [170, 42, 170],
    [210, 249, 170],
    [-30, 274, 160],
    [20, 465, 190],
    [180, 432, 200],
    [110, 249, 150],
    [250, 581, 110],
    [60, 598, 100],
  ],
}

type Props = {
  images: (Media | number | null | undefined)[]
  slots: keyof typeof SLOTS
  /** Extra blur in px on top of the depth blur. */
  soften?: number
}

// Decorative floating faces: no links, hidden from assistive technology.
export function Faces({ images, slots, soften = 8 }: Props) {
  const usable = images.map((m) => photoSources(m)).filter((p) => p !== null)
  if (usable.length === 0) return null

  return SLOTS[slots].map(([x, y, w, z], i) => {
    const p = usable[i % usable.length]
    return (
      <div
        key={i}
        className="card deco"
        aria-hidden="true"
        style={
          {
            '--x': x,
            '--y': y,
            '--w': w,
            '--xm': PHONE[slots][i][0],
            '--ym': PHONE[slots][i][1],
            '--wm': PHONE[slots][i][2],
            '--z': z,
            '--zi': Math.round((1 - z) * 20),
            '--b': (soften + z * 14).toFixed(1),
            '--o': Math.max(0.12, 0.5 - z * 0.3).toFixed(2),
            '--delay': `-${(i * 1.7).toFixed(1)}s`,
          } as React.CSSProperties
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.srcSet.split(' ')[0]} alt="" loading="lazy" decoding="async" />
      </div>
    )
  })
}
