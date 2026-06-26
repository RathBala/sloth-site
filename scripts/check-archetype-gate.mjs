import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const root = fileURLToPath(new URL('..', import.meta.url))
const srcRoot = join(root, 'src')
const indexPath = join(srcRoot, 'index.html')

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
      requestUrl.pathname === '/'
        ? '/index.html'
        : decodeURIComponent(requestUrl.pathname)
    const filePath = join(srcRoot, pathname)
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

const listen = () =>
  new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      assert(address && typeof address === 'object')
      resolve(`http://127.0.0.1:${address.port}`)
    })
  })

const waitForScroll = (page) =>
  page.waitForFunction(() => window.__archetypeGateScrollSettled === true, {
    timeout: 2000,
  })

const scrollToContentEdge = async (page) => {
  await page.evaluate(() => {
    const content = document.querySelector('[data-archetype-content]')
    const contentTop = content.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, contentTop - window.innerHeight + 24)
  })
  await page.waitForTimeout(100)
}

const staticHtml = await readFile(indexPath, 'utf8')
assert.match(
  staticHtml,
  /Map out your financial future from emergencies to nest eggs/,
  'below-the-gate content should remain in the static HTML for crawlers'
)
assert.match(
  staticHtml,
  /id="planner-free-spirit-content"/,
  'couple archetype result anchors should remain in the static HTML'
)

let browser

try {
  const baseUrl = await listen()
  browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

  await page.route('**/*', (route) => {
    const url = route.request().url()

    if (url.startsWith(baseUrl)) {
      route.continue()
      return
    }

    route.abort()
  })

  await page.addInitScript(() => {
    window.__archetypeGateScrollSettled = true
    window.__archetypeGateScrollIntoViewCount = 0
    const originalScrollIntoView = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function scrollIntoView(options) {
      window.__archetypeGateScrollIntoViewCount += 1
      window.__archetypeGateScrollSettled = false
      originalScrollIntoView.call(this, { ...options, behavior: 'auto' })
      requestAnimationFrame(() => {
        window.__archetypeGateScrollSettled = true
      })
    }
  })

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })

  const contentTop = await page
    .locator('[data-archetype-content]')
    .evaluate((element) => element.getBoundingClientRect().top + window.scrollY)

  await scrollToContentEdge(page)
  await page.mouse.wheel(0, 900)
  await page.waitForTimeout(500)

  const unselectedScrollY = await page.evaluate(() => window.scrollY)
  assert(
    unselectedScrollY < contentTop - 80,
    `users should not scroll into result content before choosing Solo or Couple; scrollY=${unselectedScrollY}, contentTop=${contentTop}`
  )
  await assert.doesNotReject(() =>
    page
      .locator('[data-saver-selection-gate]')
      .waitFor({ state: 'visible', timeout: 1000 })
  )

  await page.evaluate(() => {
    window.__archetypeGateScrollIntoViewCount = 0
  })
  await page.mouse.wheel(0, 900)
  await page.waitForTimeout(500)

  const repeatedGateSnapCount = await page.evaluate(
    () => window.__archetypeGateScrollIntoViewCount
  )
  assert.equal(
    repeatedGateSnapCount,
    0,
    `visible gate should block repeated downward scroll without re-snapping; scrollIntoView calls=${repeatedGateSnapCount}`
  )

  await page.evaluate(() => {
    window.__archetypeGateScrollIntoViewCount = 0
  })
  const beforeUpwardScrollY = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, -500)
  await page.waitForTimeout(500)

  const upwardGateSnapCount = await page.evaluate(
    () => window.__archetypeGateScrollIntoViewCount
  )
  assert.equal(
    upwardGateSnapCount,
    0,
    `upward scroll after hitting the gate should not re-snap; scrollIntoView calls=${upwardGateSnapCount}`
  )

  const afterUpwardScrollY = await page.evaluate(() => window.scrollY)
  assert(
    afterUpwardScrollY < beforeUpwardScrollY - 100,
    `users should be able to scroll up cleanly after hitting the gate; before=${beforeUpwardScrollY}, after=${afterUpwardScrollY}`
  )

  await page.locator('[data-archetype-reveal="couple"]').click()
  await waitForScroll(page)

  await scrollToContentEdge(page)
  await page.mouse.wheel(0, 900)
  await page.waitForTimeout(500)

  const gatedScrollY = await page.evaluate(() => window.scrollY)
  assert(
    gatedScrollY < contentTop - 80,
    `unselected couple users should not scroll into result content; scrollY=${gatedScrollY}, contentTop=${contentTop}`
  )
  await assert.doesNotReject(() =>
    page
      .locator('[data-couple-selection-gate]')
      .waitFor({ state: 'visible', timeout: 1000 })
  )

  await page
    .locator('[data-couple-archetype-trigger="planner-free-spirit"]')
    .click()
  await waitForScroll(page)

  await assert.doesNotReject(() =>
    page
      .locator('[data-archetype-content].is-revealed')
      .waitFor({ state: 'visible', timeout: 1000 })
  )

  await page.mouse.wheel(0, 2800)
  await page.waitForTimeout(500)

  const selectedScrollY = await page.evaluate(() => window.scrollY)
  assert(
    selectedScrollY > contentTop - 80,
    `selected couple users should be able to continue into result content; scrollY=${selectedScrollY}, contentTop=${contentTop}`
  )
} finally {
  await browser?.close()
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
}
