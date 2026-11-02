// Dates are shown in Italian, in the Rome time zone: "12 ott 2026".
export const formatDate = (value: string | null | undefined): string | null =>
  value
    ? new Intl.DateTimeFormat('it-IT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Europe/Rome',
      }).format(new Date(value))
    : null
