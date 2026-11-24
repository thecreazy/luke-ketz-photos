import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { connection } from 'next/server'
import React from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

type Args = { children: React.ReactNode }

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

// Payload's components read the clock while rendering, which Cache Components flags as an error
// when the page is prerendered. The admin is never static: wait for the request first.
const Layout = async ({ children }: Args) => {
  await connection()
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}

export default Layout
