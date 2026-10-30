import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import React from 'react'

export const Rich = ({ data }: { data?: unknown }) =>
  data ? <RichText data={data as SerializedEditorState} /> : null
