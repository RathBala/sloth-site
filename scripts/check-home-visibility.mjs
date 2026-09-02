import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { mkdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const root = fileURLToPath(new URL('..', import.meta.url))
const srcRoot = join(root, 'src')
const screenshotDir = process.env.HOME_VISIBILITY_SCREENSHOT_DIR

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
])

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')
    const pathname =
      requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname
    const filePath = join(srcRoot, decodeURIComponent(pathname))
    const body = await readFile(filePath)
    response.writeHead(200, {
      'content-type':
        mimeTypes.get(extname(filePath)) ?? 'application/octet-stream',
    })
    response.end(body)
  } catch {
    response.writeHead(404)
    response.end('Not found')
  }
})

const baseUrl = await new Promise((resolve) => {
  server.listen(0, '127.0.0.1', () => {
    const address = server.address()
    assert(address && typeof address === 'object')
    resolve(`http://127.0.0.1:${address.port}`)
  })
})

let browser

try {
  browser = await chromium.launch(
    existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' }
  )

  if (screenshotDir) await mkdir(screenshotDir, { recursive: true })

  const viewports = [
    {
      name: 'mobile',
      viewport: { width: 390, height: 844 },
      checksAboveFold: true,
    },
    { name: 'desktop', viewport: { width: 1440, height: 1000 } },
    {
      name: 'desktop-fold',
      viewport: { width: 1438, height: 748 },
      checksAboveFold: true,
    },
  ]

  if (screenshotDir) {
    viewports.push({
      name: 'reference-size',
      viewport: { width: 1486, height: 1059 },
    })
  }

  for (const { name, viewport, checksAboveFold = false } of viewports) {
    const page = await browser.newPage({ viewport })
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })

    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(
        [...document.images].map((image) =>
          image.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                image.addEventListener('load', resolve, { once: true })
                image.addEventListener('error', resolve, { once: true })
              })
        )
      )
    })
    await page.addStyleTag({
      content:
        '*, *::before, *::after { animation: none !important; transition: none !important; }',
    })

    await assert.doesNotReject(() =>
      page
        .getByRole('heading', { name: 'Take the work out of money' })
        .waitFor()
    )
    await assert.doesNotReject(() =>
      page
        .getByText('Automated transaction categorisation', { exact: true })
        .waitFor()
    )
    await assert.doesNotReject(() =>
      page
        .getByRole('heading', {
          name: 'Map out your financial future from emergencies to nest eggs',
        })
        .waitFor()
    )

    assert.equal(await page.getByText('What kind of saver are you?').count(), 0)
    assert.equal(await page.locator('[data-archetype-lock]').count(), 0)
    assert.equal(
      await page.locator('[data-lucide="wallet-cards"]').count(),
      1,
      'budget suggestions should use the wallet-cards icon'
    )
    assert.equal(
      await page.locator('[data-lucide="sparkles"]').count(),
      0,
      'budget suggestions should not use the sparkles icon'
    )

    const heroSupport = page.locator('.sloth-hero-support')
    assert.equal(
      await heroSupport.count(),
      1,
      'hero should render one local contrast layer for its support copy'
    )
    const heroLegibility = await heroSupport.evaluate((support) => {
      const overlay = getComputedStyle(support, '::before')
      const signIn = getComputedStyle(
        support.querySelector('[data-analytics-cta="hero-sign-in"]')
      )

      return {
        overlayBackground: overlay.backgroundImage,
        overlayContent: overlay.content,
        signInBackground: signIn.backgroundColor,
      }
    })
    assert.notEqual(
      heroLegibility.overlayContent,
      'none',
      'hero support copy should render a local contrast layer'
    )
    assert.match(
      heroLegibility.overlayBackground,
      /gradient/,
      'hero support copy should use a feathered gradient rather than a solid panel'
    )
    assert.match(
      heroLegibility.signInBackground,
      /rgba?\(1, 38, 25(?:, 0\.[6-9][0-9]?)?\)/,
      'hero sign-in should use a strong dark-green surface over the artwork'
    )

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    assert.equal(
      dimensions.scrollWidth,
      dimensions.clientWidth,
      `homepage should not overflow horizontally at ${viewport.width}px`
    )

    if (checksAboveFold) {
      const featureStrip = await page
        .locator('.sloth-feature-strip')
        .boundingBox()
      assert(featureStrip, 'feature strip should have a rendered bounding box')
      const featureStripBottom = featureStrip.y + featureStrip.height
      assert(
        featureStripBottom <= viewport.height,
        `feature strip should be fully above the fold at ${viewport.width}x${viewport.height}; bottom was ${featureStripBottom}`
      )
    }

    const dashboard = await page
      .locator('.sloth-hero-dashboard-frame')
      .boundingBox()
    const dashboardImage = await page
      .locator('.sloth-hero-dashboard-frame img')
      .boundingBox()
    assert(dashboard && dashboardImage, 'dashboard preview should render')
    const dashboardBottom = dashboard.y + dashboard.height
    const dashboardImageBottom = dashboardImage.y + dashboardImage.height
    assert(
      dashboardImageBottom <= dashboardBottom + 1,
      `dashboard image should not be cropped at ${viewport.width}px`
    )

    if (viewport.width >= 640) {
      const gardenArt = await page.locator('.sloth-garden-art').boundingBox()
      assert(gardenArt, 'garden artwork should render')
      const gardenBottom = gardenArt.y + gardenArt.height
      assert(
        gardenBottom >= dashboardBottom + 64,
        `garden artwork should extend below the dashboard at ${viewport.width}px; garden bottom was ${gardenBottom} and dashboard bottom was ${dashboardBottom}`
      )

      const heroScene = await page.locator('.sloth-hero-scene').boundingBox()
      assert(heroScene, 'hero scene should render')
      const heroSceneBottom = heroScene.y + heroScene.height
      assert(
        heroSceneBottom >= dashboardBottom + 64,
        `hero scene should leave leafy breathing room below the dashboard at ${viewport.width}px`
      )
    }

    if (screenshotDir) {
      await page.screenshot({
        path: join(screenshotDir, `home-hero-${name}.png`),
      })
    }

    const lowerSection = page.getByRole('heading', {
      name: 'Map out your financial future from emergencies to nest eggs',
    })
    await lowerSection.scrollIntoViewIfNeeded()
    assert(
      await lowerSection.isVisible(),
      'lower homepage content should be visible without a choice'
    )

    if (screenshotDir) {
      await page.locator('.sloth-home-content').scrollIntoViewIfNeeded()
      await page.evaluate(() =>
        Promise.all(
          [...document.querySelectorAll('.sloth-home-content img')]
            .filter((image) => {
              const bounds = image.getBoundingClientRect()
              return bounds.top < window.innerHeight && bounds.bottom > 0
            })
            .map((image) => image.decode().catch(() => undefined))
        )
      )
      await page.screenshot({
        path: join(screenshotDir, `home-content-${name}.png`),
      })
    }

    await page.close()
  }
} finally {
  await browser?.close()
  await new Promise((resolve) => server.close(resolve))
}

console.log(
  '[home-visibility] Hero and lower homepage content are visible on mobile and desktop.'
)
