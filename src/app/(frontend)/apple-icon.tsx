import { ImageResponse } from 'next/og'

// Home-screen icon on iPhone: the same focus frame as the favicon.
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

const corner = (pos: Record<string, number>, borders: Record<string, string>) => (
  <div
    style={{ position: 'absolute', width: 42, height: 42, display: 'flex', ...pos, ...borders }}
  />
)

export default function AppleIcon() {
  const line = '10px solid #d2694a'
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070606',
        position: 'relative',
      }}
    >
      {corner({ left: 36, top: 36 }, { borderLeft: line, borderTop: line })}
      {corner({ right: 36, top: 36 }, { borderRight: line, borderTop: line })}
      {corner({ left: 36, bottom: 36 }, { borderLeft: line, borderBottom: line })}
      {corner({ right: 36, bottom: 36 }, { borderRight: line, borderBottom: line })}
      <div style={{ width: 34, height: 34, borderRadius: 17, background: '#ede9e3' }} />
    </div>,
    size,
  )
}
