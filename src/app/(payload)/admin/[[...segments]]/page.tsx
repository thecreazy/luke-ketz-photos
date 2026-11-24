import type { Metadata } from 'next'
import { connection } from 'next/server'
import config from '@payload-config'
import { generatePageMetadata, RootPage } from '@payloadcms/next/views'

import { importMap } from '../importMap.js'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

// The admin is never prerendered: Payload's own components read the clock while rendering, which
// Cache Components flags as an error (seen in development). Waiting for the request avoids it.
const Page = async ({ params, searchParams }: Args) => {
  await connection()
  return RootPage({ config, params, searchParams, importMap })
}

export default Page
