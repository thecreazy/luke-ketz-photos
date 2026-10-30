import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'
import React from 'react'

import { PhotoUploader } from './PhotoUploader'

export const UploadView = ({ initPageResult, params, searchParams }: AdminViewServerProps) => (
  <DefaultTemplate
    i18n={initPageResult.req.i18n}
    locale={initPageResult.locale}
    params={params}
    payload={initPageResult.req.payload}
    permissions={initPageResult.permissions}
    searchParams={searchParams}
    user={initPageResult.req.user || undefined}
    visibleEntities={initPageResult.visibleEntities}
  >
    <Gutter>
      <h1>Upload photos</h1>
      <p>
        Photos are resized in the browser before uploading. Once uploaded you will find them under
        Photos (or Private photos) and can pick them in projects and galleries.
      </p>
      <PhotoUploader />
    </Gutter>
  </DefaultTemplate>
)
