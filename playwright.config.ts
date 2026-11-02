import { defineConfig } from '@playwright/test'

const PORT = 3100

// Run with `pnpm test:e2e`: scripts/e2e.sh prepares an empty database, builds and sets the environment.
export default defineConfig({
  testDir: './e2e',
  // One flow, one site: the tests share the data the earlier ones create.
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  // The first requests after a cold start (admin, first user) can take several seconds.
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Locally the installed Chrome is used; CI installs Playwright's own Chromium.
    channel: process.env.CI ? undefined : 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: {
    // Started directly (not through pnpm) so that stopping it really stops the server.
    command: `node node_modules/next/dist/bin/next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
