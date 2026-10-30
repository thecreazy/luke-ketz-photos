import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { allowLogin, clientIp } from '@/lib/ratelimit'

// Payload already locks an account after 5 failed attempts; this also limits password
// guessing across usernames from a single address.
export async function proxy(request: NextRequest) {
  if (request.method === 'POST' && !(await allowLogin(clientIp(request.headers)))) {
    return NextResponse.json(
      { errors: [{ message: 'Too many login attempts. Try again in a few minutes.' }] },
      { status: 429 },
    )
  }
  return NextResponse.next()
}

export const config = { matcher: '/api/users/login' }
