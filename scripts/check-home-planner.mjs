import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright'

const root = fileURLToPath(new URL('..', import.meta.url))
const srcRoot = join(root, 'src')
const pagePath = join(srcRoot, 'home-planner', 'index.html')

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
])

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')
    let pathname = decodeURIComponent(requestUrl.pathname)

    if (pathname.endsWith('/')) pathname += 'index.html'

    const filePath = join(srcRoot, pathname)
    const fileStat = await stat(filePath)
    assert(fileStat.isFile())
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

const html = await readFile(pagePath, 'utf8')
const plannerImage = await stat(
  join(srcRoot, 'assets', 'images', 'home-planner-journey.webp')
)
const plannerFallbackImage = await stat(
  join(srcRoot, 'assets', 'images', 'home-planner-journey.jpg')
)

assert(
  plannerImage.size <= 200 * 1024,
  `the first-view WebP must stay within 200 KB; size=${plannerImage.size}`
)
assert(
  plannerFallbackImage.size <= 300 * 1024,
  `the first-view JPEG fallback must stay within 300 KB; size=${plannerFallbackImage.size}`
)

assert.doesNotMatch(
  html,
  /Free home ownership planner/i,
  'the removed eyebrow must not return'
)
assert.match(html, /Can you afford your dream home\?/, 'headline must remain')
assert.match(html, /Explore my home plan/, 'intro CTA must remain')
assert.match(
  html,
  /No signup\. Rough numbers are fine\. About 3 minutes\./,
  'trust copy must remain'
)
assert.match(html, /id="planner-intro"/, 'intro state must be present')
assert.match(
  html,
  /id="planner-savings"/,
  'current savings step must be present'
)
assert.match(html, /id="planner-home"/, 'dream home step must be present')
assert.match(html, /id="planner-buying"/, 'buying route step must be present')
assert.match(html, /id="planner-budget"/, 'future budget step must be present')
assert.match(html, /id="planner-results"/, 'results state must be present')
assert.match(html, /name="depositSaved"/, 'deposit input must be present')
assert.match(
  html,
  /name="monthlySaving"/,
  'monthly saving input must be present'
)
assert.match(
  html,
  /name="mortgageBudget"/,
  'future mortgage budget input must be present'
)
assert.match(
  html,
  /value="not-sure"/,
  'uncertain choices must include a not-sure option'
)
assert.match(
  html,
  /What would feel comfortable later\?/,
  'future mortgage spending must have its own step'
)
assert.match(
  html,
  /Nothing is saved\. Your answers clear when you leave\./,
  'the transient persistence contract must be clear'
)

let browser

try {
  const baseUrl = await listen()
  browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1024 },
  })

  await page.route('**/*', (route) => {
    if (route.request().url().startsWith(baseUrl)) {
      route.continue()
      return
    }

    route.abort()
  })

  await page.goto(`${baseUrl}/home-planner/`, {
    waitUntil: 'domcontentloaded',
  })

  const desktopFrame = await page.evaluate(() => {
    const shell = document
      .querySelector('.planner-shell')
      ?.getBoundingClientRect()

    return {
      bodyPadding: getComputedStyle(document.body).padding,
      heightOverflow:
        document.documentElement.scrollHeight - window.innerHeight,
      shell: shell ? { height: shell.height, width: shell.width } : null,
      widthOverflow: document.documentElement.scrollWidth - window.innerWidth,
    }
  })
  assert.equal(desktopFrame.bodyPadding, '0px')
  assert(desktopFrame.heightOverflow <= 1)
  assert(desktopFrame.widthOverflow <= 1)
  assert(desktopFrame.shell)
  assert.equal(Math.round(desktopFrame.shell.width), 1440)
  assert.equal(Math.round(desktopFrame.shell.height), 1024)

  await assert.doesNotReject(() =>
    page.locator('#planner-intro:not([hidden])').waitFor()
  )
  await page.evaluate(() => {
    window.__plannerCaptures = []
    window.posthog.capture = (event, properties) => {
      window.__plannerCaptures.push({ event, properties })
    }
  })
  await page.locator('#planner-start').focus()
  await page.locator('#planner-start').press('Enter')
  await assert.doesNotReject(() =>
    page.locator('#planner-savings:not([hidden])').waitFor()
  )
  assert.equal(
    await page.evaluate(() => document.activeElement?.id),
    'deposit-saved',
    'starting the planner should focus the first financial input'
  )
  assert.equal(
    await page.locator('[data-progress-step="1"]').getAttribute('aria-current'),
    'step',
    'the progress indicator should announce the current step'
  )
  assert.equal(
    await page.locator('#planner-savings [name="mortgageBudget"]').count(),
    0,
    'the current savings screen must not ask about a future mortgage budget'
  )

  await page.locator('#deposit-saved').fill('25000')
  await page.locator('#monthly-saving').fill('1000')
  await page.locator('#savings-next').click()

  await assert.doesNotReject(() =>
    page.locator('#planner-home:not([hidden])').waitFor()
  )
  await page.locator('[name="region"][value="england-ni"]').check()
  await page.locator('[name="propertyType"][value="house"]').check()
  await page.locator('#home-price').fill('350000')
  await page.locator('#home-next').click()

  await page.locator('[name="ownershipType"][value="whole"]').check()
  await page.locator('[name="firstTimeBuyer"][value="yes"]').check()
  await page.locator('#buying-next').click()

  await assert.doesNotReject(() =>
    page.locator('#planner-budget:not([hidden])').waitFor()
  )
  await page.locator('#mortgage-budget').fill('1600')
  await page.locator('#annual-income').fill('70000')
  await page.locator('#budget-next').click()

  await assert.doesNotReject(() =>
    page.locator('#planner-results:not([hidden])').waitFor()
  )
  assert.match(
    await page.locator('#result-home-price').textContent(),
    /350,000/
  )
  assert.match(
    await page.locator('#result-property-tax').textContent(),
    /2,500/
  )
  assert.equal(
    await page.locator('.shared-ownership-lever').isVisible(),
    false,
    'the shared-ownership share lever must stay hidden for a whole-home purchase'
  )
  assert.equal(
    await page.locator('#breakdown-rent-row').isVisible(),
    false,
    'rent on an unowned share must stay hidden for a whole-home purchase'
  )
  assert.equal(
    await page
      .locator('#results-heading')
      .evaluate((heading) => getComputedStyle(heading).outlineStyle),
    'none',
    'programmatically focused stage headings must not show a browser-default outline'
  )

  const mortgageBefore = await page
    .locator('#result-mortgage-payment')
    .textContent()
  await page.locator('#lever-deposit').fill('20')
  const mortgageAfter = await page
    .locator('#result-mortgage-payment')
    .textContent()
  assert.notEqual(mortgageAfter, mortgageBefore)

  const plannerCaptures = await page.evaluate(() => window.__plannerCaptures)
  const completion = plannerCaptures.find(
    ({ event }) => event === 'home_planner_completed'
  )
  assert(completion, 'finishing the wizard should record a completion event')
  assert.deepEqual(Object.keys(completion.properties).sort(), [
    'first_time_status',
    'location_status',
    'ownership_type',
    'property_type',
  ])

  await page.locator('#results-back').focus()
  await page.locator('#results-back').press('Enter')

  assert.equal(
    await page.evaluate(() => document.activeElement?.id),
    'budget-next',
    'returning from results should restore focus to the previous action'
  )

  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('#planner-start').click()
  assert.equal(
    await page.locator('#deposit-saved').inputValue(),
    '',
    'financial answers must not persist across a refresh'
  )

  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
  })
  await mobilePage.route('**/*', (route) => {
    if (route.request().url().startsWith(baseUrl)) {
      route.continue()
      return
    }

    route.abort()
  })
  await mobilePage.goto(`${baseUrl}/home-planner/`, {
    waitUntil: 'domcontentloaded',
  })

  const mobileOverflow = await mobilePage.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  )
  assert(
    mobileOverflow <= 1,
    `mobile layout must not overflow horizontally; overflow=${mobileOverflow}`
  )
  await assert.doesNotReject(() =>
    mobilePage.locator('#planner-start').waitFor({ state: 'visible' })
  )
  await mobilePage.locator('#planner-start').click()
  await assert.doesNotReject(() =>
    mobilePage.locator('#savings-next').waitFor({ state: 'visible' })
  )

  console.log('Home planner interaction checks passed.')
} finally {
  await browser?.close()
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
}
