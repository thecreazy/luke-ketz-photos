import { expect, test } from '@playwright/test'
import type { APIRequestContext } from '@playwright/test'
import sharp from 'sharp'

// One flow on an empty database: first admin → upload → publish → public site → private gallery.
test.describe.configure({ mode: 'serial' })

const ORIGIN = 'http://localhost:3100'
const USERNAME = 'e2e-admin'
const PASSWORD = 'e2e-password-123'

const jpeg = (color: string) =>
  sharp({ create: { width: 1600, height: 1000, channels: 3, background: color } })
    .jpeg()
    .toBuffer()

// Payload only accepts cookie-authenticated requests that come from the site origin.
const json = { headers: { origin: ORIGIN } }
const created = async (res: Awaited<ReturnType<APIRequestContext['post']>>) => {
  expect(res.ok(), await res.text()).toBeTruthy()
  return ((await res.json()) as { doc: { id: number } }).doc
}

test('the first visit to /admin creates the admin and logs in', async ({ page }) => {
  await page.goto('/admin', { waitUntil: 'networkidle' }) // the form must be hydrated before it is used
  await page.locator('input[name=username]').fill(USERNAME)
  await page.locator('input[name=password]').fill(PASSWORD)
  await page.locator('input[name=confirm-password]').fill(PASSWORD)
  await page.getByRole('button', { name: 'Create' }).click()
  await expect(page).toHaveURL(/\/admin(\/)?$/)
  await expect(page.getByRole('link', { name: 'Upload photos' }).first()).toBeVisible()
})

test('login rejects a wrong password and accepts the right one', async ({ page, request }) => {
  const bad = await request.post('/api/users/login', {
    ...json,
    data: { username: USERNAME, password: 'wrong' },
  })
  expect(bad.status()).toBe(401)

  await page.goto('/admin/login', { waitUntil: 'networkidle' })
  await page.locator('input[name=username]').fill(USERNAME)
  await page.locator('input[name=password]').fill(PASSWORD)
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(/\/admin(\/)?$/)
})

test.describe('with a logged-in admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'networkidle' })
    await page.locator('input[name=username]').fill(USERNAME)
    await page.locator('input[name=password]').fill(PASSWORD)
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/\/admin(\/)?$/)
  })

  test('uploading photos creates draft portraits, hidden until published', async ({
    page,
    request,
  }) => {
    await page.goto('/admin/upload-photos', { waitUntil: 'networkidle' })
    await page.locator('select').nth(1).selectOption('__single')
    await page.locator('input[type=file]').setInputFiles([
      { name: 'e2e-one.jpg', mimeType: 'image/jpeg', buffer: await jpeg('#c0392b') },
      { name: 'e2e-two.jpg', mimeType: 'image/jpeg', buffer: await jpeg('#27ae60') },
    ])
    await expect(page.getByText('Created 2 draft portraits')).toBeVisible()

    const list = await (
      await page.request.get('/api/portraits?draft=true&sort=order&limit=5', json)
    ).json()
    expect(list.totalDocs).toBe(2)
    expect(list.docs.map((d: { _status: string }) => d._status)).toEqual(['draft', 'draft'])

    // Nothing is public yet.
    const home = await request.get('/ritratti')
    expect(await home.text()).not.toContain('/ritratti/ritratto-')
    const media = await (await page.request.get('/api/media?limit=5')).json()
    expect(media.docs[0].sizes.sm.url).toBeTruthy()
    expect((await request.get(media.docs[0].sizes.sm.url)).ok()).toBeTruthy()
  })

  test('a published portrait shows up on the site, a draft does not', async ({ page, request }) => {
    const [first, second] = (
      await (await page.request.get('/api/portraits?draft=true&sort=order&limit=5', json)).json()
    ).docs
    await created(
      await page.request.patch(`/api/portraits/${first.id}`, {
        ...json,
        data: {
          question: 'Chi vedi, quando ti guardi?',
          note: 'Una riga di prova',
          featured: true,
          _status: 'published',
        },
      }),
    )

    // Publishing must invalidate the cached pages without a redeploy.
    await page.goto('/ritratti')
    await expect(page.locator('.tile')).toHaveCount(1)
    // The upload leaves the alt empty (a file name is no description): the site describes the portrait.
    await expect(page.locator('.tile img').first()).toHaveAttribute('alt', /^Ritratto N° \d+$/)
    await page.goto('/')
    await expect(page.getByText('1 volti · 1 domande')).toBeVisible()
    await expect(page.locator('a.card').first()).toBeVisible()

    await page.goto(`/ritratti/${first.slug}`)
    await expect(page.getByRole('heading', { name: 'Chi vedi, quando ti guardi?' })).toBeVisible()
    await expect(page.getByText('Una riga di prova')).toBeVisible()

    // The header links must be clickable on a portrait page, and "back" returns to the grid.
    await page.locator('a.logo').first().click()
    await expect(page).toHaveURL(/\/$/)
    await page.goto('/ritratti')
    await page.locator('.tile').first().click()
    await expect(page).toHaveURL(new RegExp(`/ritratti/${first.slug}$`))
    await page.getByRole('link', { name: /Indietro/ }).click()
    await expect(page).toHaveURL(/\/ritratti$/)

    const hidden = await request.get(`/ritratti/${second.slug}`)
    expect(await hidden.text()).toContain('Pagina non trovata')

    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain(`/ritratti/${first.slug}`)
    expect(sitemap).not.toContain(second.slug)
  })

  test('an article uses the layout chosen for it', async ({ page }) => {
    const media = (await (await page.request.get('/api/media?limit=1')).json()).docs[0]
    await created(
      await page.request.post('/api/posts', {
        ...json,
        data: {
          title: 'Domande di prova',
          layout: 'domande',
          theme: 'mostre',
          cover: media.id,
          qa: [
            { question: 'Perché i ritratti?', answer: 'Perché un volto cambia mentre lo guardi.' },
          ],
          _status: 'published',
        },
      }),
    )
    await created(
      await page.request.post('/api/posts', {
        ...json,
        data: {
          title: 'Una mano di prova',
          layout: 'dietro',
          theme: 'dietro-il-ritratto',
          cover: media.id,
          exifLine: '85 mm · f/2 · ISO 400',
          timeline: [{ label: '17:02 · La domanda', highlight: true, text: 'Non ha risposto.' }],
          _status: 'published',
        },
      }),
    )

    await page.goto('/diario')
    await expect(page.locator('.fr')).toHaveCount(2)

    await page.goto('/diario/domande-di-prova')
    await expect(page.locator('ol.qa li')).toHaveCount(1)
    await expect(page.getByText('Perché un volto cambia mentre lo guardi.')).toBeVisible()

    await page.goto('/diario/una-mano-di-prova')
    await expect(page.locator('ol.timeline li')).toHaveCount(1)
    await expect(page.getByText('85 mm')).toBeVisible()
  })

  test('the texts of each page are edited on that page and the menu follows the pages', async ({
    page,
    request,
  }) => {
    const { docs } = await (await page.request.get('/api/pages?limit=50&depth=0', json)).json()
    const bySlug = Object.fromEntries(docs.map((d: { slug: string }) => [d.slug, d]))
    for (const slug of ['home', 'chi-e', 'ritratti', 'diario', 'galleria-privata']) {
      expect(bySlug[slug], slug).toBeTruthy()
    }

    const edit = async (slug: string, data: object) =>
      page.request.patch(`/api/pages/${bySlug[slug].id}`, {
        ...json,
        data: { ...data, _status: 'published' },
      })
    expect(
      (await edit('diario', { diary: { subtitle: 'Sottotitolo di prova' } })).ok(),
    ).toBeTruthy()
    expect(
      (await edit('ritratti', { menuLabel: 'Volti', portraits: { empty: 'Nessun volto' } })).ok(),
    ).toBeTruthy()
    expect((await edit('galleria-privata', { gate: { submit: 'Entra' } })).ok()).toBeTruthy()

    // Published edits reach the public pages without a redeploy.
    await page.goto('/diario')
    await expect(page.getByText('Sottotitolo di prova')).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: 'Principale' }).getByText('Volti'),
    ).toBeVisible()
    expect(await (await request.get('/chi-e')).text()).toContain('Volti')

    // The pages the design is built around cannot be deleted, renamed or turned into another kind.
    expect((await page.request.delete(`/api/pages/${bySlug['diario'].id}`, json)).ok()).toBeFalsy()
    await edit('diario', { slug: 'altro', kind: 'text' })
    const again = await (await page.request.get(`/api/pages/${bySlug['diario'].id}`, json)).json()
    expect([again.slug, again.kind]).toEqual(['diario', 'diary'])
    // ...and they are not served as plain text pages.
    expect(await (await request.get('/galleria-privata')).text()).toContain('Pagina non trovata')
  })

  test('a photo that is still in use cannot be deleted', async ({ page }) => {
    const [first] = (
      await (
        await page.request.get('/api/portraits?draft=true&sort=order&limit=5&depth=0', json)
      ).json()
    ).docs
    const res = await page.request.delete(`/api/media/${first.image}`, json)
    expect(res.status()).toBe(409)
    expect(await res.text()).toContain('still in use')
  })

  test('a private gallery needs its password, then expires', async ({ page, browser }) => {
    const photo = await created(
      await page.request.post('/api/private-media', {
        ...json,
        multipart: {
          file: { name: 'secret.jpg', mimeType: 'image/jpeg', buffer: await jpeg('#2980b9') },
          _payload: JSON.stringify({ alt: 'Secret' }),
        },
      }),
    )
    const gallery = await created(
      await page.request.post('/api/private-galleries', {
        ...json,
        data: { title: 'Galleria di prova', newPassword: 'luce', photos: [photo.id] },
      }),
    )

    // A visitor, not an admin.
    const visitor = await (await browser.newContext({ baseURL: ORIGIN })).newPage()
    const open = async (password: string) => {
      await visitor.goto('/galleries/galleria-di-prova')
      if (await visitor.locator('input[name=password]').count()) {
        await visitor.locator('input[name=password]').fill(password)
        await visitor.keyboard.press('Enter')
      }
    }

    await open('sbagliata')
    await expect(visitor.getByText('Ancora sfocato. Riprova.')).toBeVisible()
    await expect(visitor.locator('main img')).toHaveCount(0)

    await open('luce')
    await expect(visitor.locator('main img')).toHaveCount(1)
    await expect
      .poll(() => visitor.locator('main img').evaluate((i: HTMLImageElement) => i.naturalWidth))
      .toBeGreaterThan(0)

    const after = await (
      await page.request.get(`/api/private-galleries/${gallery.id}`, json)
    ).json()
    expect(after.accessCount).toBe(1)

    await created(
      await page.request.patch(`/api/private-galleries/${gallery.id}`, {
        ...json,
        data: { expiresAt: '2020-01-01T00:00:00.000Z' },
      }),
    )
    await visitor.reload()
    await expect(visitor.getByText('non è più disponibile')).toBeVisible()
    await expect(visitor.locator('main img')).toHaveCount(0)

    // Private galleries are never advertised.
    const sitemap = await (await page.request.get('/sitemap.xml')).text()
    expect(sitemap).not.toContain('galleries')
    await visitor.context().close()
  })
})

test('on a phone the home is the same field: a tap focuses a face, a second tap opens it', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: ORIGIN,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })
  const page = await context.newPage()
  await page.goto('/')
  // Tilting the phone moves the faces.
  const field = page.locator('.field.home')
  // Browsers that ask for permission (iPhone, recent Chrome) get the request on the first tap.
  await expect(field).toBeVisible()
  await field.tap({ position: { x: 195, y: 430 } })
  // Sent again on every attempt: the listener only exists once the page has hydrated.
  await expect
    .poll(async () => {
      await page.evaluate(() => {
        const tilt = (gamma: number) =>
          window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { beta: 0, gamma }))
        tilt(0)
        tilt(15)
      })
      return Number(await field.evaluate((el) => el.style.getPropertyValue('--mx')))
    })
    .toBeGreaterThan(0.5)
  const card = page.locator('a.card').first()
  await card.tap()
  await expect(page.locator('h1.question')).toHaveText('Chi vedi, quando ti guardi?')
  await expect(page).toHaveURL(`${ORIGIN}/`)
  await card.tap()
  await expect(page).toHaveURL(/\/ritratti\/ritratto-/)
  // Nothing may scroll sideways.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await context.close()
})

test('shared links get a preview image, and the site has its icons', async ({ request }) => {
  for (const path of ['/', '/ritratti', '/chi-e', '/diario']) {
    const html = await (await request.get(path)).text()
    const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]
    expect(og, path).toBeTruthy()
    const img = await request.get(og!.replace(/^https?:\/\/[^/]+/, ''))
    expect(img.ok(), og).toBeTruthy()
    expect(img.headers()['content-type']).toBe('image/png')
    expect((await img.body()).length).toBeGreaterThan(5000)
  }
  const html = await (await request.get('/')).text()
  expect(html).toContain('rel="icon"')
  expect(html).toContain('rel="apple-touch-icon"')
  const apple = html.match(/<link rel="apple-touch-icon" href="([^"]+)"/)?.[1]
  expect(apple).toBeTruthy()
  expect((await request.get(apple!)).headers()['content-type']).toContain('image/png')
})

test('security headers: CSP on the public site only', async ({ request }) => {
  const site = await request.get('/')
  expect(site.headers()['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(site.headers()['x-content-type-options']).toBe('nosniff')

  const admin = await request.get('/admin/login')
  expect(admin.headers()['content-security-policy']).toBeUndefined()
  expect(admin.headers()['x-content-type-options']).toBe('nosniff')
})
