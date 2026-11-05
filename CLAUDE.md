@AGENTS.md

# Luke Ketz site: rules for working in this repo

Client site built from `thecreazy.template.photographers`, live at https://luke-ketz-photos.vercel.app. The site is in
Italian, the admin in English. `README.md` explains how it works; this file is what must not be forgotten.

## Never, unless asked in that very message

- **No `git commit`, `git tag`, amend or history rewrite.** The owner commits. Suggest a commit message in chat.
- **No writes to production**: `payload migrate` on Neon, scripts that create or change content in Neon or the Spaces
  bucket. In development the `.env` _is_ production (see below). The owner applies migrations.
- **No secrets** in output, files or commits; do not ask for them. Checking that a variable exists is fine.
- **Never kill a process on port 3000**: it is the owner's `pnpm dev`. Do not run `pnpm test:e2e` or `pnpm build` while
  it is running (they rebuild `.next`).

## Data and migrations

- `pnpm dev` points at **Neon and the real Spaces bucket**; the Docker values are parked in `.env.local.docker`.
  Editing content in dev edits the live content.
- `push` is off. A change to a collection or global needs a migration: `NODE_ENV=production pnpm payload migrate:create
<name>` (it asks "created or renamed?": the answer is almost always "create"), then `pnpm generate:types`, then tell
  the owner to apply it (`NODE_ENV=production pnpm payload migrate`) before restarting the dev server. Until then every
  page fails in dev with a missing column.
- **Migrations are additive.** Never edit, delete or regenerate one that has been applied; a rename is a new migration.
- The 29 test photos in `~/Downloads/wetransfer_foto-prova-per-sito_*` include nudes. They are already on the live
  bucket by the owner's decision; do not copy them anywhere else.

## Content and design rules

- **No visible text in code.** A text of the site is a field of a page in admin → Pages: add it to `PAGE_COPY` in
  `src/site/copy.ts` (it generates the field and the default) and create a migration. Exceptions: the 404 and error
  pages, the skip link (`SYSTEM_TEXT`).
- Dark theme only. No gyroscope, no events/bookings (all decided out). The signature "fatto a mano da thecreazy"
  stays in `src/site/maker.ts`, out of the admin and out of the template.
- Motion is decoration: respect `prefers-reduced-motion`, never start the main image of a page at opacity 0, and use
  `overflow: clip` (not `hidden`) on a container whose children use scroll-driven animations.
- Public data goes through the cached readers in `src/lib/data.ts` (`'use cache'` + `cacheTag`); a new collection needs
  its reader there and the `revalidateOnChange` hooks.

## Pitfalls already hit

- macOS is case-insensitive: do not create two files that differ only in case (`credit.ts` vs `Credit.tsx`).
- React siblings need different keys: a heading and an SVG with the same `key` made old questions pile up.
- A removed `.env.local` is not enough to switch database for e2e: `scripts/e2e.sh` sets its own environment.

## Before saying "done"

`pnpm check` (lint, format, types), then `pnpm test:e2e` when the dev server is off. For UI work look at it: Playwright
with Chrome and WebKit (`iPhone 14`) screenshots, axe-core for accessibility. Lighthouse mobile on the live URL moves by
about 5 points between runs and simulates a slow phone: trust a real Chrome measurement (LCP) before "fixing" a score.
