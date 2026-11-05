import { CREDIT } from './maker'

// A small handwritten signature that opens the maker's site in a new tab.
export function Credit() {
  return (
    <a href={CREDIT.url} target="_blank" rel="noopener" className="credit serif">
      <span className="credit-by">{CREDIT.prefix}</span>{' '}
      <span className="credit-name">{CREDIT.name}</span>
    </a>
  )
}
