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

const wheelTowardContent = async (page, contentTop) => {
  await page.mouse.move(200, 500)

  for (let attempt = 0; attempt < 8; attempt += 1) {
    await page.mouse.wheel(0, 900)
    await page.waitForTimeout(120)

    const scrollY = await page.evaluate(() => window.scrollY)

    if (scrollY > contentTop - 80) {
      return scrollY
    }
  }

  return page.evaluate(() => window.scrollY)
}

const assertLockSticksAboveViewportBottom = async (page, message) => {
  const lockBox = await page.locator('[data-archetype-lock]').boundingBox()
  const viewport = page.viewportSize()

  assert(lockBox, `${message}: lock should be visible`)
  assert(viewport, `${message}: viewport should be available`)

  const bottomGap = viewport.height - (lockBox.y + lockBox.height)
  const choiceBoundaryBottom = await page.evaluate(() => {
    const activeBranchGroup = document.querySelector(
      '[data-archetype-branch-group].is-active'
    )
    const archetypeFlow = activeBranchGroup?.closest('.sloth-archetype-flow')
    const choiceBoundary = activeBranchGroup?.classList.contains('is-revealed')
      ? activeBranchGroup
      : archetypeFlow

    return choiceBoundary?.getBoundingClientRect().bottom ?? 0
  })

  assert(
    bottomGap >= 12 && bottomGap <= 48,
    `${message}: lock should stick near the viewport bottom with breathing room; bottomGap=${bottomGap}`
  )
  assert(
    choiceBoundaryBottom <= lockBox.y - 8,
    `${message}: lock should not overlap the active choice area; choiceBoundaryBottom=${choiceBoundaryBottom}, lockTop=${lockBox.y}`
  )
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
assert.match(
  staticHtml,
  /id="solo-planner-content"/,
  'solo planner result anchor should remain in the static HTML'
)
assert.match(
  staticHtml,
  /id="solo-free-spirit-content"/,
  'solo free spirit result anchor should remain in the static HTML'
)
assert.match(
  staticHtml,
  /Planner with a roadmap/,
  'solo planner result copy should remain in the static HTML'
)
assert.match(
  staticHtml,
  /Free spirit with guardrails/,
  'solo free spirit result copy should remain in the static HTML'
)
assert.match(
  staticHtml,
  /One of you tracks the numbers/,
  'planner plus free spirit result copy should remain in the static HTML'
)
assert.match(
  staticHtml,
  /You both want the deets/,
  'planner plus planner result copy should remain in the static HTML'
)
assert.match(
  staticHtml,
  /Neither of you wants a second job/,
  'free spirit plus free spirit result copy should remain in the static HTML'
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
    const originalScrollIntoView = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function scrollIntoView(options) {
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
  const unselectedScrollY = await wheelTowardContent(page, contentTop)
  assert(
    unselectedScrollY > contentTop - 80,
    `native scroll should continue into locked result content before choosing Solo or Couple; scrollY=${unselectedScrollY}, contentTop=${contentTop}`
  )
  await assert.doesNotReject(() =>
    page
      .locator('[data-archetype-lock]')
      .waitFor({ state: 'visible', timeout: 1000 })
  )
  await assertLockSticksAboveViewportBottom(page, 'first locked choice prompt')
  await assert.doesNotReject(() =>
    page
      .locator('[data-archetype-branch-group="couple"].is-active')
      .waitFor({ state: 'visible', timeout: 1000 })
  )
  await assert.rejects(
    () =>
      page
        .locator('[data-archetype-branch-group="solo"].is-active')
        .waitFor({ state: 'visible', timeout: 300 }),
    'solo branch should not be visible before choosing Solo'
  )
  assert.equal(
    await page
      .locator('.sloth-couple-connector [data-archetype-connector="solo"]')
      .evaluate((element) => getComputedStyle(element).display),
    'block',
    'unselected preview should show the dimmed solo connector'
  )
  assert.equal(
    await page
      .locator('.sloth-couple-connector [data-archetype-connector="couple"]')
      .evaluate((element) => getComputedStyle(element).display),
    'block',
    'unselected preview should show the dimmed couple connector'
  )
  assert.equal(
    await page
      .locator('.sloth-couple-connector [data-archetype-connector="solo"]')
      .evaluate((element) => getComputedStyle(element).opacity),
    '0.3',
    'unselected solo connector should be dimmed'
  )
  assert.equal(
    await page
      .locator('.sloth-couple-connector [data-archetype-connector="couple"]')
      .evaluate((element) => getComputedStyle(element).opacity),
    '0.3',
    'unselected couple connector should be dimmed'
  )
  assert.match(
    await page.locator('[data-archetype-lock-copy]').innerText(),
    /Pick Solo or Couple/,
    'locked preview should explain the first required choice'
  )
  assert.equal(
    await page
      .locator('[data-archetype-content] > section')
      .first()
      .getAttribute('inert'),
    '',
    'locked result sections should be inert before a selection'
  )

  const beforeUpwardScrollY = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, -500)
  await page.waitForTimeout(500)

  const afterUpwardScrollY = await page.evaluate(() => window.scrollY)
  assert(
    afterUpwardScrollY < beforeUpwardScrollY - 100,
    `native upward scroll should remain clean in the locked preview; before=${beforeUpwardScrollY}, after=${afterUpwardScrollY}`
  )

  await page.locator('[data-archetype-reveal="solo"]').click()
  await waitForScroll(page)

  await assert.doesNotReject(() =>
    page
      .locator('[data-archetype-branch-group="solo"].is-active.is-revealed')
      .waitFor({ state: 'visible', timeout: 1000 })
  )
  await assert.rejects(
    () =>
      page
        .locator('[data-archetype-branch-group="couple"].is-active')
        .waitFor({ state: 'visible', timeout: 300 }),
    'solo branch should replace the couple branch after choosing Solo'
  )
  assert.equal(
    await page
      .locator('.sloth-couple-connector [data-archetype-connector="solo"]')
      .evaluate((element) => getComputedStyle(element).stroke),
    'rgb(255, 241, 118)',
    'solo branch connector should use the solo path color'
  )
  assert.equal(
    await page
      .locator('.sloth-archetype-path.solo')
      .evaluate((element) => getComputedStyle(element, '::after').display),
    'none',
    'solo branch line should not show a yellow gem'
  )
  assert.equal(
    await page
      .locator('.sloth-archetype-path.solo')
      .evaluate((element) => getComputedStyle(element, '::before').display),
    'none',
    'solo branch should not show a separate straight line before the connector'
  )
  assert.match(
    await page.locator('[data-archetype-lock-copy]').innerText(),
    /Pick a solo style/,
    'locked preview should explain the solo archetype choice'
  )

  await page.locator('[data-archetype-trigger="solo-planner"]').click()
  await waitForScroll(page)
  assert.match(
    await page.locator('[data-archetype-path-heading]').innerText(),
    /Planner with a roadmap/,
    'solo planner should adapt the path heading'
  )
  assert.match(
    await page.locator('[data-archetype-feature-heading="budget"]').innerText(),
    /Budget detail without the drag/,
    'solo planner should adapt feature copy'
  )

  await page.locator('[data-archetype-reveal="solo"]').click()
  await waitForScroll(page)
  await page.locator('[data-archetype-trigger="solo-free-spirit"]').click()
  await waitForScroll(page)
  assert.match(
    await page.locator('[data-archetype-path-heading]').innerText(),
    /Free spirit with guardrails/,
    'solo free spirit should adapt the path heading'
  )

  await page.locator('[data-archetype-reveal="couple"]').click()
  await waitForScroll(page)
  await assert.doesNotReject(() =>
    page
      .locator('[data-archetype-branch-group="couple"].is-active.is-revealed')
      .waitFor({ state: 'visible', timeout: 1000 })
  )
  await assert.rejects(
    () =>
      page
        .locator('[data-archetype-branch-group="solo"].is-active')
        .waitFor({ state: 'visible', timeout: 300 }),
    'couple branch should replace the solo branch after choosing Couple'
  )

  await scrollToContentEdge(page)
  const gatedScrollY = await wheelTowardContent(page, contentTop)
  assert(
    gatedScrollY > contentTop - 80,
    `native scroll should continue into locked result content before choosing a couple dynamic; scrollY=${gatedScrollY}, contentTop=${contentTop}`
  )
  await assert.doesNotReject(() =>
    page
      .locator('[data-archetype-lock]')
      .waitFor({ state: 'visible', timeout: 1000 })
  )
  await assertLockSticksAboveViewportBottom(
    page,
    'couple dynamic locked choice prompt'
  )
  assert.match(
    await page.locator('[data-archetype-lock-copy]').innerText(),
    /Pick a couple dynamic/,
    'locked preview should explain the second required choice'
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
  assert.equal(
    await page
      .locator('[data-archetype-content] > section')
      .first()
      .getAttribute('inert'),
    null,
    'result sections should be interactive after selecting a couple archetype'
  )
  assert.match(
    await page.locator('[data-archetype-path-heading]').innerText(),
    /One person holds the plan/,
    'planner plus free spirit should adapt the path heading'
  )
  assert.match(
    await page.locator('[data-archetype-feature-heading="budget"]').innerText(),
    /Everyday choices, visible/,
    'planner plus free spirit should adapt feature copy'
  )

  await page.mouse.wheel(0, 2800)
  await page.waitForTimeout(500)

  const selectedScrollY = await page.evaluate(() => window.scrollY)
  assert(
    selectedScrollY > contentTop - 80,
    `selected couple users should be able to continue into result content; scrollY=${selectedScrollY}, contentTop=${contentTop}`
  )

  await page
    .locator('[data-couple-archetype-trigger="planner-planner"]')
    .click()
  await waitForScroll(page)
  assert.match(
    await page.locator('[data-archetype-path-heading]').innerText(),
    /Two planners, one truth/,
    'planner plus planner should adapt the path heading'
  )

  await page
    .locator('[data-couple-archetype-trigger="free-spirit-free-spirit"]')
    .click()
  await waitForScroll(page)
  assert.match(
    await page.locator('[data-archetype-path-heading]').innerText(),
    /No money manager required/,
    'free spirit plus free spirit should adapt the path heading'
  )
} finally {
  await browser?.close()
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
}
