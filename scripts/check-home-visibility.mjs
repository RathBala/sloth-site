import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { mkdir, readFile, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const root = fileURLToPath(new URL('..', import.meta.url))
const srcRoot = join(root, 'src')
const screenshotDir = process.env.HOME_VISIBILITY_SCREENSHOT_DIR
const everydayAssets = ['tracking', 'budgeting', 'sharing', 'planning']
const everydaySizes = await Promise.all(
  everydayAssets.map(
    async (asset) =>
      (await stat(join(srcRoot, `assets/images/everyday-${asset}.webp`))).size
  )
)
assert(
  everydaySizes.reduce((total, bytes) => total + bytes, 0) <= 120000,
  'Everyday component captures should stay within a combined 120 KB delivery budget'
)

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
])

for (const [size, budget] of [
  ['desktop', 200000],
  ['mobile', 140000],
]) {
  const assets = ['auto-categorisation', 'budget-suggestions', 'scenarios']
  const sizes = await Promise.all(
    assets.map(
      async (asset) =>
        (
          await stat(
            join(srcRoot, `assets/images/feature-${asset}-${size}.webp`)
          )
        ).size
    )
  )
  assert(
    sizes.reduce((total, bytes) => total + bytes, 0) <= budget,
    `${size}: feature images exceed their delivery budget`
  )
}

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
console.log(`[home-visibility] Serving ${srcRoot} at ${baseUrl}`)

try {
  browser = await chromium.launch(
    existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' }
  )

  if (screenshotDir) await mkdir(screenshotDir, { recursive: true })

  const viewports = [
    {
      name: 'mobile',
      viewport: { width: 390, height: 844 },
      checksPrimaryActionAboveFold: true,
    },
    { name: 'desktop', viewport: { width: 1440, height: 1000 } },
    { name: 'tablet', viewport: { width: 640, height: 960 } },
    {
      name: 'review-comments',
      viewport: { width: 1200, height: 479 },
      featureOnly: true,
    },
    {
      name: 'tablet-wide',
      viewport: { width: 1023, height: 1000 },
      featureOnly: true,
    },
    {
      name: 'desktop-small',
      viewport: { width: 1024, height: 1000 },
      featureOnly: true,
    },
    {
      name: 'desktop-fold',
      viewport: { width: 1438, height: 748 },
      checksPrimaryActionAboveFold: true,
    },
    {
      name: 'wide-desktop',
      viewport: { width: 2048, height: 1200 },
      checksPrimaryActionAboveFold: true,
      checksFullBleedArt: true,
    },
  ]

  if (screenshotDir) {
    viewports.push({
      name: 'reference-size',
      viewport: { width: 1486, height: 1059 },
    })
  }

  for (const {
    name,
    viewport,
    checksPrimaryActionAboveFold = false,
    checksFullBleedArt = false,
    featureOnly = false,
  } of viewports) {
    const page = await browser.newPage({ viewport })
    page.setDefaultTimeout(15000)
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })

    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all(
        [...document.images]
          .filter((image) => image.loading !== 'lazy')
          .map((image) =>
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

    const categorisationPreview = await page
      .locator('img[src$="feature-auto-categorisation-mobile.webp"]')
      .evaluate((image) => {
        const bounds = image.getBoundingClientRect()
        return {
          width: bounds.width,
          height: bounds.height,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          source: image.currentSrc,
        }
      })
    assert(
      categorisationPreview.naturalWidth >= categorisationPreview.width * 2,
      `${name}: categorisation close-up should provide at least 2x image density`
    )
    if (viewport.width >= 1024) {
      assert(
        categorisationPreview.width >= 800 &&
          categorisationPreview.width / categorisationPreview.height > 3,
        `${name}: desktop suggestions should be a wide, compact row preview`
      )
    }
    assert(
      Math.abs(
        categorisationPreview.width / categorisationPreview.height -
          categorisationPreview.naturalWidth /
            categorisationPreview.naturalHeight
      ) < 0.01,
      `${name}: categorisation close-up should preserve the complete image without cropping`
    )
    assert(
      categorisationPreview.source.endsWith(
        viewport.width < 1024
          ? 'feature-auto-categorisation-mobile.webp'
          : 'feature-auto-categorisation-desktop.webp'
      ),
      `${name}: categorisation close-up should use the matching responsive capture`
    )

    assert.equal(
      await page
        .locator('[data-advanced-features]')
        .getByRole('heading')
        .count(),
      4,
      'The feature section should contain one heading per feature, without a second introduction'
    )
    const features = page.locator('[data-product-feature]')
    assert.equal(
      await page
        .locator('[data-product-feature="categorisation"] p')
        .evaluate((element) => getComputedStyle(element).color),
      'rgba(236, 255, 236, 0.94)',
      'The existing advanced section must keep readable light copy on its dark surface'
    )
    const everyday = page.locator('[data-everyday-feature]')
    assert.equal(await everyday.count(), 4)
    const everydayLayout = []
    for (const group of await everyday.all()) {
      await group.scrollIntoViewIfNeeded()
      await group.locator('img').evaluate((image) => image.decode())
      const layout = await group.evaluate((element) => {
        const image = element.querySelector('img')
        const bounds = image.getBoundingClientRect()
        const heading = element.querySelector('h3').getBoundingClientRect()
        const bullets = element.querySelector('ul').getBoundingClientRect()
        return {
          left: element.getBoundingClientRect().left,
          top: element.getBoundingClientRect().top + window.scrollY,
          imageBottom: bounds.bottom,
          headingTop: heading.top,
          headingDocumentTop: heading.top + window.scrollY,
          copySize: parseFloat(
            getComputedStyle(element.querySelector('li')).fontSize
          ),
          headingBottom: heading.bottom,
          bulletsTop: bullets.top,
          width: bounds.width,
          height: bounds.height,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
        }
      })
      assert(
        layout.imageBottom <= layout.headingTop &&
          layout.headingBottom <= layout.bulletsTop,
        `${name}: everyday images, headings and bullets must not overlap`
      )
      assert(
        layout.naturalWidth >= layout.width * 2,
        `${name}: everyday component captures need at least 2x density`
      )
      assert(
        Math.abs(
          layout.width / layout.height -
            layout.naturalWidth / layout.naturalHeight
        ) < 0.01,
        `${name}: everyday component captures must preserve their proportions`
      )
      everydayLayout.push(layout)
      assert(
        layout.copySize >= (viewport.width >= 1024 ? 22 : 18),
        `${name}: everyday benefits must preserve the site's readable body type`
      )
    }
    const companionHeights = everydayLayout
      .slice(0, 3)
      .map((item) => item.height)
    assert(
      everydayLayout[3].height >= Math.min(...companionHeights) * 0.95,
      `${name}: the goal capture must have comparable visible height to the other captures`
    )
    assert.equal(
      new Set(everydayLayout.map((item) => Math.round(item.left))).size,
      viewport.width >= 1280 ? 4 : viewport.width >= 640 ? 2 : 1,
      `${name}: everyday groups should adapt to readable four-, two- and one-column layouts`
    )
    if (viewport.width >= 1280) {
      assert.equal(
        new Set(
          everydayLayout.map((item) => Math.round(item.headingDocumentTop))
        ).size,
        1,
        `${name}: everyday group headings must share a baseline`
      )
    }
    assert.equal(
      await page
        .locator('#everyday-features')
        .evaluate((element) => getComputedStyle(element).backgroundColor),
      'rgb(243, 248, 245)',
      'The everyday overview must retain its light surface independently of the advanced feature section'
    )
    await page.evaluate(() => window.scrollTo(0, 0))
    assert.equal(
      await features.count(),
      4,
      'All four features use the shared presentation'
    )
    for (const feature of await features.all()) {
      const layout = await feature.evaluate((element) => {
        const title = element.querySelector('h3').getBoundingClientRect()
        const visual = element
          .querySelector('[data-feature-visual]')
          .getBoundingClientRect()
        const benefits = element.querySelector('ul').getBoundingClientRect()
        return {
          titleBottom: title.bottom,
          visualTop: visual.top,
          visualBottom: visual.bottom,
          benefitsTop: benefits.top,
        }
      })
      assert(
        layout.titleBottom <= layout.visualTop &&
          layout.visualBottom <= layout.benefitsTop,
        `${name}: feature order should be heading, visual, benefits`
      )
      for (const image of await feature.locator('img').all()) {
        const size = await image.evaluate((el) => ({
          width: el.clientWidth,
          height: el.clientHeight,
          nw: el.naturalWidth,
          nh: el.naturalHeight,
        }))
        assert(
          size.nw >= size.width * 2,
          `${name}: each feature raster needs 2x density`
        )
        assert(
          Math.abs(size.width / size.height - size.nw / size.nh) < 0.02,
          `${name}: each complete visual should retain its proportions`
        )
      }
    }
    assert(
      (await page.locator('[data-cli-example] code').count()) === 2,
      'CLI example should contain selectable command and output'
    )
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      ),
      `${name}: features must not cause horizontal overflow`
    )

    if (featureOnly) {
      await page.close()
      continue
    }

    await assert.doesNotReject(() =>
      page
        .getByRole('heading', { name: 'Take the work out of money' })
        .waitFor()
    )
    await assert.doesNotReject(() =>
      page
        .getByRole('heading', {
          name: 'Automated transaction categorisation',
          exact: true,
        })
        .waitFor()
    )
    await assert.doesNotReject(() =>
      page
        .getByRole('heading', {
          name: 'Use it like an app - without the App Store',
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

    if (checksPrimaryActionAboveFold) {
      const primaryAction = await page
        .locator('[data-analytics-cta="hero-start"]')
        .boundingBox()
      assert(primaryAction, 'the primary action should render')
      assert(
        primaryAction.y + primaryAction.height <= viewport.height,
        `the primary action should be above the fold at ${viewport.width}x${viewport.height}`
      )
    }

    const dashboard = await page
      .locator('.sloth-hero-dashboard-frame')
      .boundingBox()
    const dashboardImage = await page
      .locator('.sloth-hero-dashboard-frame img')
      .boundingBox()
    assert(dashboard && dashboardImage, 'dashboard preview should render')
    if (viewport.width >= 1440) {
      assert(
        dashboard.width >= 1248,
        `dashboard should use the wider desktop space at ${viewport.width}px`
      )
    }
    const dashboardBottom = dashboard.y + dashboard.height
    const dashboardImageBottom = dashboardImage.y + dashboardImage.height
    assert(
      dashboardImageBottom <= dashboardBottom + 1,
      `dashboard image should not be cropped at ${viewport.width}px`
    )

    if (viewport.width >= 1024) {
      const gardenArt = await page.locator('.sloth-garden-art').boundingBox()
      assert(gardenArt, 'garden artwork should render')
      if (checksFullBleedArt) {
        const gardenRight = gardenArt.x + gardenArt.width
        assert(
          gardenArt.x <= 1 && gardenRight >= viewport.width - 1,
          `garden artwork should cover the full ${viewport.width}px viewport; rendered from ${gardenArt.x}px to ${gardenRight}px`
        )
      }
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
      await page.locator('.sloth-feature-strip').evaluate((element) => {
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY - 96,
          behavior: 'instant',
        })
      })
      await page.screenshot({
        path: join(screenshotDir, `home-dashboard-${name}.png`),
      })
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.screenshot({
        path: join(screenshotDir, `home-hero-${name}.png`),
      })
    }

    const lowerSection = page.getByRole('heading', {
      name: 'Use it like an app - without the App Store',
    })
    await lowerSection.scrollIntoViewIfNeeded()
    assert(
      await lowerSection.isVisible(),
      'lower homepage content should be visible without a choice'
    )

    if (screenshotDir) {
      await page.locator('.sloth-home-content').evaluate((element) => {
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY,
          behavior: 'instant',
        })
      })
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
      for (const feature of await features.all()) {
        const slug = await feature.getAttribute('data-product-feature')
        await feature.evaluate((element) => {
          window.scrollTo({
            top: element.getBoundingClientRect().top + window.scrollY - 100,
            behavior: 'instant',
          })
        })
        await page.screenshot({
          path: join(screenshotDir, `feature-${slug}-${name}.png`),
        })
        const bounds = await feature.boundingBox()
        await page.setViewportSize({
          width: viewport.width,
          height: Math.max(viewport.height, Math.ceil(bounds.height) + 220),
        })
        await feature.evaluate((element) => {
          window.scrollTo({
            top: element.getBoundingClientRect().top + window.scrollY - 110,
            behavior: 'instant',
          })
        })
        await page.screenshot({
          path: join(screenshotDir, `feature-${slug}-${name}-complete.png`),
        })
        await page.setViewportSize(viewport)
      }
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
