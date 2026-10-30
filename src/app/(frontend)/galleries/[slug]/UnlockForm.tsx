'use client'

import React, { useActionState } from 'react'

import { unlock } from './actions'

export const UnlockForm = ({ slug }: { slug: string }) => {
  const [state, action, pending] = useActionState(unlock.bind(null, slug), undefined)
  return (
    <form className="unlock" action={action}>
      <input
        type="password"
        name="password"
        placeholder="Password"
        autoComplete="off"
        required
        autoFocus
      />
      <button disabled={pending}>Enter</button>
      {state?.error && <span role="alert">{state.error}</span>}
    </form>
  )
}
