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
  /What home price are you thinking about\?/,
  'the home-price question should sound like the user is estimating a real home'
)
assert.match(
  html,
  /id="annual-income"[\s\S]*?step="1"/,
  'yearly income must accept any whole-pound amount'
)
assert.match(
  html,
  /id="lever-deposit"[\s\S]*?min="0"[\s\S]*?max="100"/,
  'the deposit lever must cover 0% through 100%'
)
assert.match(
  html,
  /id="home-price"[\s\S]*?min="25000"[\s\S]*?max="20000000"[\s\S]*?step="1"/,
  'the wizard home-price input must own the supported £25,000 through £20 million range'
)
assert.match(
  html,
  /id="lever-home-price-range"[\s\S]*?min="0"[\s\S]*?max="1000"/,
  'the home-price slider must use a broad, non-linear scale'
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
  const desktopViewport = { width: 1440, height: 748 }
  const page = await browser.newPage({
    viewport: desktopViewport,
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
  assert.equal(Math.round(desktopFrame.shell.height), 748)

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
  const savingsViewport = await page.evaluate(() => ({
    documentOverflow: document.documentElement.scrollHeight - innerHeight,
    nextBottom: document.querySelector('#savings-next')?.getBoundingClientRect()
      .bottom,
    privacyBottom: document
      .querySelector('.planner-privacy-note')
      ?.getBoundingClientRect().bottom,
  }))
  assert(
    savingsViewport.documentOverflow <= 1,
    `the deposit step must fit without vertical scrolling; overflow=${savingsViewport.documentOverflow}`
  )
  assert(savingsViewport.nextBottom <= desktopViewport.height)
  assert(savingsViewport.privacyBottom <= desktopViewport.height)

  await page.locator('#deposit-saved').fill('5250')
  await page.locator('#monthly-saving').fill('123')
  await page.locator('#savings-next').click()

  await assert.doesNotReject(() =>
    page.locator('#planner-home:not([hidden])').waitFor()
  )
  await page.locator('[name="region"][value="england-ni"]').check()
  await page.locator('[name="propertyType"][value="house"]').check()
  await page
    .getByLabel('What home price are you thinking about?')
    .fill('287501')
  await page.locator('#home-next').click()

  await page.locator('[name="ownershipType"][value="whole"]').check()
  await page.locator('[name="firstTimeBuyer"][value="yes"]').check()
  await page.locator('#buying-next').click()

  await assert.doesNotReject(() =>
    page.locator('#planner-budget:not([hidden])').waitFor()
  )
  await page.locator('#mortgage-budget').fill('1500')
  await page.locator('#annual-income').fill('5400')
  await page.locator('#budget-next').click()

  await assert.doesNotReject(() =>
    page.locator('#planner-results:not([hidden])').waitFor()
  )
  assert.equal(
    await page.locator('#lever-home-price').inputValue(),
    '287501',
    'the exact home-price control should preserve the amount entered in the wizard'
  )
  assert.deepEqual(
    await page.locator('#lever-home-price').evaluate((input) => ({
      max: input.max,
      min: input.min,
      step: input.step,
    })),
    { max: '20000000', min: '25000', step: '1' },
    'the result control should inherit the canonical wizard price range'
  )
  const startingPriceSlider = Number(
    await page.locator('#lever-home-price-range').inputValue()
  )
  assert(
    startingPriceSlider > 300 && startingPriceSlider < 500,
    'an ordinary home price should remain usable around the middle of the broad slider'
  )
  assert.equal(
    await page
      .locator('#annual-income')
      .evaluate((input) => input.checkValidity()),
    true,
    'an exact yearly income such as £5,400 must remain valid'
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
  await page.locator('#lever-deposit').fill('100')
  assert.equal(
    await page.locator('#result-mortgage-payment').textContent(),
    '£0/mo',
    'a 100% deposit should produce no mortgage repayment'
  )

  await page.locator('#lever-home-price').fill('20000000')
  assert.equal(
    await page.locator('#lever-home-price-range').inputValue(),
    '1000',
    'the exact home price and broad slider should stay synchronized'
  )
  assert.equal(
    await page
      .locator('#lever-home-price-range')
      .getAttribute('aria-valuetext'),
    '£20,000,000',
    'the broad slider should announce the real home price rather than its internal scale'
  )

  const resultsScrolling = await page.evaluate(() => {
    const inner = document.querySelector('.planner-content-inner')
    const visual = document.querySelector('.planner-visual')
    const visualTopBefore = visual.getBoundingClientRect().top
    window.scrollTo({ top: 500 })
    return {
      documentCanScroll: document.documentElement.scrollHeight > innerHeight,
      innerOverflowY: getComputedStyle(inner).overflowY,
      innerScrollTop: inner.scrollTop,
      visualTopAfter: visual.getBoundingClientRect().top,
      visualTopBefore,
      windowScrollY: window.scrollY,
      widthOverflow: document.documentElement.scrollWidth - innerWidth,
    }
  })
  assert.equal(resultsScrolling.documentCanScroll, true)
  assert.equal(resultsScrolling.innerOverflowY, 'visible')
  assert.equal(resultsScrolling.innerScrollTop, 0)
  assert(resultsScrolling.windowScrollY > 0)
  assert(
    resultsScrolling.visualTopAfter < resultsScrolling.visualTopBefore,
    'the illustrated and content panels should move together with the document'
  )
  assert(resultsScrolling.widthOverflow <= 1)

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
