# thecreazy.template.photographers

Template for photographer websites: public site + management portal in the **same Next.js project**,
a single deploy on Vercel.

- **Next.js 16** + **Payload CMS 3** (admin at `/admin`)
- **Postgres** (Neon): one database per client
- **DigitalOcean Spaces** (S3-compatible): one public + one private bucket per client
- Minimal frontend in `src/app/(frontend)`: replace it for each client (this is where the design lives, Three.js included)

## New client

```bash
pnpm new-client mario-rossi          # creates ../mario-rossi, independent from the template
```

Copies the template (without `node_modules`, `.git`, `.env`), renames the package, generates a `.env` with a
fresh `PAYLOAD_SECRET`, runs `git init` plus a first commit and removes the clone script. After the copy there
is no link to the template: fixes do not propagate on their own.

## Local development

```bash
docker compose up -d     # Postgres (port 5433) + MinIO (S3 on 9100, console on 9101), buckets already created
cp .env.example .env     # then uncomment the "Local development" block and generate PAYLOAD_SECRET
pnpm dev                 # /admin -> create the first user
```

## Setting up a client

1. **Neon**: create the database → `DATABASE_URL`.
2. **Spaces**: create two buckets in the same region.
   - public (`S3_PUBLIC_BUCKET`): enable the CDN and set `S3_PUBLIC_URL`. Objects are uploaded `public-read`.
   - private (`S3_PRIVATE_BUCKET`): no public access, URLs are signed by the site.
3. **Upstash**: create a free Redis database → `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (attempt limits, see
   [Security](#security-and-seo)). Skip it locally.
4. Fill in `.env` (see `.env.example`), then `pnpm install && pnpm dev`.
5. Open `/admin`: the first visit creates the user (username + password).
6. Deploy: Vercel project with the same environment variables. **Hobby is not allowed for commercial use: you need Pro.**
7. Production: schema `push` is disabled and `vercel-build` runs `payload migrate` before `next build`, so the
   database must be reachable at build time (Neon is).

## Database migrations

In development the schema syncs automatically (`push`). Whenever you change a collection or global, create a
migration before deploying:

```bash
pnpm payload migrate:create <name>   # review the generated file in src/migrations, then commit it
pnpm payload migrate                 # apply (production does this in vercel-build)
```

## Caching and drafts

The public site is cached with Next.js Cache Components (`cacheComponents: true`): all reads go through
`src/lib/data.ts` (`'use cache'`, one tag per document/list). The database is only hit after an edit: the Payload
hooks in `src/lib/revalidate.ts` invalidate exactly the tags a change touches, and the first visit afterwards
gets fresh content. Saving a draft of an already published document changes nothing public.

- Pages, Projects and Posts use Payload drafts/versions (no "published" checkbox): publish, unpublish, restore an
  older version from the admin. Reads filter on `_status: published`.
- Add a new collection → add its readers to `data.ts` with `cacheTag`, and `revalidateOnChange` hooks to it.
- The footer year makes pages revalidate once a day; that is expected.
- The build reads the database (migrations run first in `vercel-build`). With an empty one, dynamic routes prerender a
  `/_` placeholder (`src/lib/static-params.ts`), because Cache Components needs at least one static param.
- First visit to a URL that does not exist is served as `200` with `noindex` (Next serves the app shell first);
  from the second visit it is a real `404`.
- In `pnpm dev`, Next shows a red "Issue" badge on admin pages (`new Date()` while prerendering, read by Payload's
  layout). It is a dev-only validation: the production build and runtime are not affected.
- Use Neon's **pooled** connection string (`-pooler` host) as `DATABASE_URL`; the pool is capped at 5 connections
  per instance (`src/payload.config.ts`).

## Quality checks

`pnpm check` runs ESLint, Prettier and the typecheck; CI (`.github/workflows/ci.yml`) runs them plus a build against
an empty Postgres service, and a second job runs the smoke tests below (dummy values for the rest). Environment variables are validated at startup (`src/lib/env.ts`): a missing or
malformed one fails immediately with a readable list instead of a cryptic error later.

### Smoke tests

`pnpm test:e2e` (needs Docker and Chrome) starts Postgres + MinIO from `docker-compose.yml`, creates an empty `e2e`
database, builds the site and runs Playwright against it (`e2e/smoke.spec.ts`, about 15 seconds): first admin and
login, photo upload, a published project showing on the site and a draft not, the in-use delete guard, a private
gallery (wrong/right password, access counter, expiry), sitemap and security headers. CI runs the same job. Run it
before copying changes from the template to existing clients. The attempt limits are not covered (they need Upstash).

Uploads accept JPEG, PNG, WebP and AVIF only (no SVG, which can carry scripts) and are capped at 4 MB
(`src/lib/upload.ts`).

## What is included

| Area                                    | Where                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| Projects (photos, cover, SEO)           | `src/collections/Projects.ts`                                                   |
| Pages and blog (rich text)              | `Pages.ts`, `Posts.ts`: sample structure, adapt it to the client                |
| Home page                               | page with slug `home`, created on first start (`src/lib/seed.ts`)               |
| Password-protected galleries            | `PrivateGalleries.ts`, `PrivateMedia.ts`, `src/app/(frontend)/galleries/[slug]` |
| Site settings (name, bio, contacts, OG) | `src/globals/SiteSettings.ts`                                                   |
| Photo upload                            | admin → **Upload photos** (`src/components/admin/`)                             |

### Photo upload and images

In the browser, before uploading: EXIF is read from the original (camera, lens, focal length, aperture, shutter, ISO,
date; GPS is never stored), the photo is resized (long edge 2500px, JPEG 0.86) and a blur placeholder plus an average
colour are computed. The upload is one ~1-2 MB request per photo, so Vercel's body limit is never hit.

On the server, Payload derives two WebP variants from that file (`sm` 640px, `md` 1280px, see `IMAGE_SIZES` in
`src/lib/upload.ts`). `<Photo>` renders a plain `<img>` with a `srcset` of the three files straight from the
bucket/CDN: `next/image` and Vercel's image optimiser are not used (no per-image billing). Originals are not kept.
Private galleries use the same variants, each signed separately.

Known quirk: EXIF dates carry no timezone, so `takenAt` is stored as the browser's local time converted to UTC.

### Private galleries

Passwords are stored as scrypt hashes. After a successful check the site sets an HttpOnly cookie tied to the hash
(changing the password invalidates existing cookies) and serves photos through 1-hour signed URLs.
Attempts are limited to 5 per 10 minutes per address and gallery (Upstash, see [Security](#security-and-seo)).
Link to share: `/galleries/<slug>`.

- **Expiry**: the optional "Expires on" date closes the gallery at the end of that day, also for visitors who already
  entered the password. They see "no longer available" and the photos stay in the library. Clear the date to reopen.
- **Access counter**: "Times opened" and "Last opened" (admin sidebar) increase on each successful password entry,
  not on every page view, and store no visitor data.

### Admin login

Payload `users` collection, username + password, no email. The first visit to `/admin` on an empty database creates
the first user. The session is a JWT in an HttpOnly cookie (2 hours). After 5 failed attempts the account is locked
for 10 minutes; on top of that `src/proxy.ts` allows 10 login requests per 10 minutes per address (Upstash). There is no "forgot password": reset it from the admin.

### Security and SEO

- **Attempt limits** (`src/lib/ratelimit.ts`, `src/proxy.ts`): admin login 10 per 10 minutes per address, gallery
  password 5 per 10 minutes per address and gallery. They need the two `UPSTASH_*` variables; without them the
  limits are off (a warning is logged in production). If Upstash is unreachable the check lets the request through,
  so an outage never locks the client out.
- **Headers** (`next.config.mjs`): `nosniff`, `Referrer-Policy`, HSTS, `Permissions-Policy`, `X-Frame-Options` on
  every route. A Content-Security-Policy is added on the **public site only** (not `/admin` or `/api`). It has no
  nonces because those would make every page dynamic and defeat the cache, so inline scripts are allowed
  (`'unsafe-inline'`) and the rest is closed: images only from the site and the storage, no framing, no plugins.
  **If a client's design loads something from another origin (fonts, video, analytics), add it in `next.config.mjs`**,
  otherwise the browser blocks it.
- **SEO**: `/sitemap.xml` (published pages, projects and posts with their last edit; private galleries are left out)
  and `/robots.txt` (blocks `/admin`, `/api/` and `/galleries/`) are generated and follow edits in the admin.
  Pages set a canonical URL and Open Graph tags (default image: "Default social image" in the site settings), the
  home, projects and posts carry JSON-LD, and private galleries are `noindex`.
- `not-found.tsx` and `error.tsx` give the public site its 404 and error pages; `icon.svg` is a placeholder favicon.

### Legal pages

On a brand new site the first start also creates **Privacy policy** and **Cookie policy** as drafts, so they are not
public and not in the menu. They are starting points, not legal advice: fill in the bracketed parts, have them
reviewed and publish them. They assume no analytics, no contact form and only the technical gallery cookie: if a
client's design adds a third-party service, update them and add a consent banner. A page deleted later is not
recreated.

### Design and effects: `src/site/`

The client's design (components, styles, WebGL/shader effects) lives in `src/site/`, so the rest of the template does
not change from one client to the next. `useEnhance` runs an effect only when the visitor has not asked for reduced
motion and WebGL is available, and the page keeps working with a plain `<Photo>` otherwise. See `src/site/README.md`.

### Backups

- **Database (Neon)**: point-in-time restore is the safety net. Check the retention window of the client's plan
  (shorter on Free, up to 7 days or more on paid plans) and restore into a new branch, then switch `DATABASE_URL`.
  Also run `pg_dump "$DATABASE_URL" > backup.sql` before risky changes.
- **Photos (Spaces)**: there is no versioning or recycle bin, and the originals are not kept (the 2500px file is the
  original). A deleted object is gone. The admin refuses to delete photos that are still in use, but emptying a
  bucket by hand or a script cannot be undone. Keep a copy of each client's photos on your side (e.g.
  `rclone sync` of both buckets to local storage, now and then), and use a separate Spaces key per client with access
  only to that client's buckets.
- **Secrets**: keep each client's `.env` values (and `PAYLOAD_SECRET`) in your password manager. Changing
  `PAYLOAD_SECRET` logs everyone out and closes open private galleries.

## Not included (on purpose)

Payments (e.g. workshops → Stripe Checkout + webhook), contact form, multi-language, analytics, user roles,
original-file storage.
