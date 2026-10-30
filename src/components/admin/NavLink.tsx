import Link from 'next/link'
import React from 'react'

export const NavLink = () => (
  <Link href="/admin/upload-photos" style={{ display: 'block', padding: '8px 0', fontWeight: 600 }}>
    Upload photos
  </Link>
)
