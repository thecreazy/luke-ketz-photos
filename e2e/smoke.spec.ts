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

// Payload only accepts cookie-authenticated writes from the site origin.
const json = { headers: { origin: ORIGIN } }
const created = async (res: Awaited<ReturnType<APIRequestContext['post']>>) => {
  expect(res.ok(), await res.text()).toBeTruthy()
  return ((await res.json()) as { doc: { id: number } }).doc
}

test('the first visit to /admin creates the admin and logs in', async ({ page }) => {
  await page.goto('/admin')
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

  await page.goto('/admin/login')
  await page.locator('input[name=username]').fill(USERNAME)
  await page.locator('input[name=password]').fill(PASSWORD)
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(/\/admin(\/)?$/)
})

test.describe('with a logged-in admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('input[name=username]').fill(USERNAME)
    await page.locator('input[name=password]').fill(PASSWORD)
    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/\/admin(\/)?$/)
  })

  test('uploading a photo creates it in the library with its variants', async ({
    page,
    request,
  }) => {
    await page.goto('/admin/upload-photos')
    await page.locator('input[type=file]').setInputFiles({
      name: 'e2e-photo.jpg',
      mimeType: 'image/jpeg',
      buffer: await jpeg('#c0392b'),
    })
    await expect(page.getByText('1/1 uploaded')).toBeVisible()

    const list = await (await page.request.get('/api/media?limit=5')).json()
    expect(list.totalDocs).toBe(1)
    const photo = list.docs[0]
    expect(photo.sizes.sm.url).toBeTruthy()
    expect(photo.sizes.md.url).toBeTruthy()
    // Public bucket: the variants load without any login.
    expect((await request.get(photo.sizes.sm.url)).ok()).toBeTruthy()
  })

  test('a published project shows up on the site, a draft does not', async ({ page, request }) => {
    const media = (await (await page.request.get('/api/media?limit=1')).json()).docs[0]

    const draft = await page.request.post('/api/projects?draft=true', {
      ...json,
      data: { title: 'E2E Hidden', cover: media.id, _status: 'draft' },
    })
    await created(draft)
    await created(
      await page.request.post('/api/projects', {
        ...json,
        data: {
          title: 'E2E Project',
          cover: media.id,
          photos: [{ image: media.id, caption: 'First' }],
          _status: 'published',
        },
      }),
    )

    // Publishing must invalidate the cached home without a redeploy.
    await page.goto('/')
    await expect(page.getByRole('link', { name: /E2E Project/ })).toBeVisible()
    await expect(page.getByText('E2E Hidden')).toHaveCount(0)
    await expect(page.locator('main img').first()).toBeVisible()

    await page.goto('/projects/e2e-project')
    await expect(page.getByRole('heading', { name: 'E2E Project' })).toBeVisible()
    await expect(page.getByText('First')).toBeVisible()

    const hidden = await request.get('/projects/e2e-hidden')
    expect(await hidden.text()).toContain('Page not found')

    const sitemap = await (await request.get('/sitemap.xml')).text()
    expect(sitemap).toContain('/projects/e2e-project')
    expect(sitemap).not.toContain('e2e-hidden')
  })

  test('a photo that is still in use cannot be deleted', async ({ page }) => {
    const media = (await (await page.request.get('/api/media?limit=1')).json()).docs[0]
    const res = await page.request.delete(`/api/media/${media.id}`, json)
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
        data: { title: 'E2E Gallery', newPassword: 'open-sesame', photos: [photo.id] },
      }),
    )

    // A visitor, not an admin.
    const visitor = await (await browser.newContext({ baseURL: ORIGIN })).newPage()
    const open = async (password: string) => {
      await visitor.goto('/galleries/e2e-gallery')
      if (await visitor.locator('input[name=password]').count()) {
        await visitor.locator('input[name=password]').fill(password)
        await visitor.keyboard.press('Enter')
      }
    }

    await open('wrong')
    await expect(visitor.getByText('Wrong password')).toBeVisible()
    await expect(visitor.locator('main img')).toHaveCount(0)

    await open('open-sesame')
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
    await expect(visitor.getByText('no longer available')).toBeVisible()
    await expect(visitor.locator('main img')).toHaveCount(0)

    // Private galleries are never advertised.
    const sitemap = await (await page.request.get('/sitemap.xml')).text()
    expect(sitemap).not.toContain('galleries')
    await visitor.context().close()
  })
})

test('security headers: CSP on the public site only', async ({ request }) => {
  const site = await request.get('/')
  expect(site.headers()['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(site.headers()['x-content-type-options']).toBe('nosniff')

  const admin = await request.get('/admin/login')
  expect(admin.headers()['content-security-policy']).toBeUndefined()
  expect(admin.headers()['x-content-type-options']).toBe('nosniff')
})
