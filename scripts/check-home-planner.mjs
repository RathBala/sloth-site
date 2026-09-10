import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium, webkit } from 'playwright'
import { checkPlannerSheet } from './home-planner-sheet-check.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const srcRoot = join(root, 'src')
const homePagePath = join(srcRoot, 'index.html')
const navPagePaths = [
  homePagePath,
  join(srcRoot, 'developers', 'index.html'),
  join(srcRoot, 'wedding-fund', 'index.html'),
]
const pagePath = join(srcRoot, 'home-planner', 'index.html')
const plannerStylesPath = join(srcRoot, 'assets', 'css', 'home-planner.css')

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

const assertStageFitsViewport = async (
  page,
  actionSelector,
  stageName,
  viewportHeight
) => {
  const measurements = await page.evaluate((selector) => {
    const action = document.querySelector(selector)

    return {
      documentOverflow: document.documentElement.scrollHeight - innerHeight,
      actionBottom: action?.getBoundingClientRect().bottom,
    }
  }, actionSelector)

  assert(
    measurements.documentOverflow <= 1,
    `the ${stageName} step must fit without vertical scrolling; overflow=${measurements.documentOverflow}`
  )
  assert(measurements.actionBottom <= viewportHeight)
}

const assertMonthlyBreakdownOrder = async (page) => {
  const order = await page.evaluate(() => {
    const summary = document.querySelector('.reality-card')
    const layout = document.querySelector('.results-layout')
    const breakdown = document
      .querySelector('#monthly-breakdown-title')
      .closest('section')
    return {
      first: layout.firstElementChild === breakdown,
      beforeSetup:
        Boolean(document.querySelector('#plan-sheet .mortgage-choice-card')) ||
        breakdown.getBoundingClientRect().bottom <=
          document
            .querySelector('.mortgage-choice-card')
            .getBoundingClientRect().top,
      fullWidth:
        Math.abs(
          breakdown.getBoundingClientRect().width -
            summary.getBoundingClientRect().width
        ) <= 1,
    }
  })
  assert(
    order.first && order.beforeSetup && order.fullWidth,
    'the monthly breakdown must be the full-width second results card, before mortgage setup'
  )
}

const measureIndependentPanelScroll = (page, targetScrollTop) =>
  page.evaluate((scrollTop) => {
    const content = document.querySelector('.planner-content')
    const visual = document.querySelector('.planner-visual')
    const visualTopBefore = visual.getBoundingClientRect().top
    content.scrollTo({ top: scrollTop })

    return {
      documentCanScroll: document.documentElement.scrollHeight > innerHeight,
      panelCanScroll: content.scrollHeight > content.clientHeight,
      panelOverflowY: getComputedStyle(content).overflowY,
      panelScrollTop: content.scrollTop,
      visualBottom: visual.getBoundingClientRect().bottom,
      visualTopAfter: visual.getBoundingClientRect().top,
      visualTopBefore,
      widthOverflow: document.documentElement.scrollWidth - innerWidth,
      windowScrollY: window.scrollY,
    }
  }, targetScrollTop)

const homeHtml = await readFile(homePagePath, 'utf8')
const navHtml = (
  await Promise.all(navPagePaths.map((path) => readFile(path, 'utf8')))
).join('\n')
const html = await readFile(pagePath, 'utf8')
const plannerStyles = await readFile(plannerStylesPath, 'utf8')
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

assert.match(
  plannerStyles,
  /@media \(min-width: 62\.01rem\)[\s\S]*?\.planner-page,\s*\.planner-shell \{\s*height: 100%;[\s\S]*?\.planner-visual \{[\s\S]*?height: 100%;[\s\S]*?\.planner-content,[\s\S]*?height: 100%;/,
  'desktop panels must inherit one root viewport height so the fixed artwork reaches the painted bottom edge'
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
  /id="mortgage-budget-not-sure"/,
  'future mortgage budget must offer a not-sure-yet choice'
)
assert.equal(
  navHtml.match(/Plan what it takes to afford your dream home\./g)?.length,
  navPagePaths.length * 2,
  'every desktop and mobile tools menu must use the agreed Home Planner description'
)
assert.doesNotMatch(
  navHtml,
  /Plan your deposit, mortgage(?:,| and)/,
  'the replaced Home Planner menu description must not remain on a nav-owning page'
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
assert.doesNotMatch(
  html,
  /Start with the money you have now\. We will look at future home costs later\.|A rough starting point is enough\. Every figure stays adjustable\.|Pick a route to explore\. This is a planning choice, not a commitment\.|We will start at £300,000\. You can move it later\./,
  'wizard steps should not repeat removable helper copy'
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
assert.match(
  html,
  /name="repaymentMethod"[\s\S]*?value="repayment"[\s\S]*?value="interest-only"[\s\S]*?value="part-and-part"/,
  'repayment, part-and-part and interest-only must be prominent, selectable scenarios'
)
assert.match(
  plannerStyles,
  /\.repayment-options\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/,
  'the three repayment methods must share one equal-width desktop row'
)
assert.doesNotMatch(
  html,
  /repayment-option-(?:warn|mixed)|repayment-option-note/,
  'repayment methods must share one concise card pattern without colour-coded variants'
)
assert.match(
  plannerStyles,
  /\.part-and-part-control\s*\{[\s\S]*?background:\s*var\(--planner-surface-soft\)/,
  'the part-and-part split control must use the planner design tokens'
)
assert.match(
  plannerStyles,
  /\.part-and-part-control input\s*\{[\s\S]*?accent-color:\s*var\(--planner-focus\)/,
  'the part-and-part slider must use the standard planner accent'
)
assert.match(
  html,
  /id="part-repayment-percent"[\s\S]*?min="5"[\s\S]*?max="95"/,
  'part-and-part must let the user adjust how much of the loan repays capital'
)
assert.doesNotMatch(
  html,
  /Change any assumption\. Your deposit, mortgage and real monthly[\s\S]*?move together\./,
  'the results heading must not repeat how the levers work'
)
assert.doesNotMatch(
  html,
  /See the monthly cost and what you would still owe\./,
  'the mortgage choice heading must stay concise'
)
assert.doesNotMatch(
  html,
  /class="balance-summary"|id="selected-end-balance"/,
  'the redundant selected end-balance panel must be removed'
)
assert.doesNotMatch(
  html,
  /<details class="cost-levers">/,
  'the missed-cost levers must stay expanded rather than use an accordion'
)
assert.match(
  html,
  /class="cost-levers"[\s\S]*?Adjust the costs people miss[\s\S]*?id="lever-maintenance"/,
  'the expanded missed-cost container must keep its heading and controls'
)
assert.match(
  html,
  /class="planner-signup-cta"[\s\S]*?href="https:\/\/budget\.slothmoney\.app\/\?intent=signup"[\s\S]*?data-analytics-cta="home-planner-results-cta"/,
  'the results must end with a tracked Sloth Money signup CTA'
)
assert.match(
  html,
  /id="rate-impact-label"[\s\S]*?id="rate-impact-value"/,
  'the rate choice must expose a prominent worked payment illustration'
)
assert.match(
  html,
  /name="rateType"[\s\S]*?value="fixed"[\s\S]*?value="tracker"/,
  'fixed and tracker must remain a separate rate choice'
)
assert.doesNotMatch(
  html,
  /class="mortgage-guide"/,
  'the old buried mortgage guide must be removed'
)

assert.match(
  html,
  /id="deposit-target"/,
  'the wizard must ask for a deposit target separately from savings'
)

let browser

try {
  const baseUrl = await listen()
  const browserType =
    process.env.HOME_PLANNER_BROWSER === 'webkit' ? webkit : chromium
  browser = await browserType.launch(
    browserType === chromium && !existsSync(chromium.executablePath())
      ? { channel: 'chrome' }
      : {}
  )
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
    await page.evaluate(() => location.hash),
    '#deposit',
    'the deposit step must have its own URL state'
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
  await assertStageFitsViewport(
    page,
    '#savings-next',
    'deposit',
    desktopViewport.height
  )
  await page.locator('.planner-privacy-note').scrollIntoViewIfNeeded()
  const privacyBox = await page.locator('.planner-privacy-note').boundingBox()
  assert(
    privacyBox && privacyBox.y + privacyBox.height <= desktopViewport.height
  )

  await page.locator('#deposit-saved').fill('5250')
  await page.locator('#monthly-saving').fill('123')
  const currentMonth = await page.evaluate(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const futureMonth = `${Number(currentMonth.slice(0, 4)) + 1}-${currentMonth.slice(5)}`
  assert.equal(
    await page.locator('#saving-start-month').inputValue(),
    currentMonth
  )
  await page.locator('#saving-start-month').fill('')
  await page.locator('#savings-next').click()
  assert.equal(await page.locator('#planner-savings').isVisible(), true)
  await page.locator('#saving-start-month').fill('2020-01')
  await page.locator('#savings-next').click()
  assert.equal(await page.locator('#planner-savings').isVisible(), true)
  await page.locator('#saving-start-month').fill(futureMonth)
  await page.locator('#savings-next').click()

  await assert.doesNotReject(() =>
    page.locator('#planner-home:not([hidden])').waitFor()
  )
  assert.equal(
    await page.evaluate(() => location.hash),
    '#home',
    'the home step must have its own URL state'
  )
  await page.goBack()
  await page.waitForFunction(() => location.hash === '#deposit')
  assert.equal(await page.locator('#planner-savings').isVisible(), true)
  assert.equal(
    await page.locator('#saving-start-month').inputValue(),
    futureMonth
  )
  await page.goForward()
  await page.waitForFunction(() => location.hash === '#home')
  assert.equal(await page.locator('#planner-home').isVisible(), true)

  const homeLayout = await page.evaluate(() => {
    const contentElement = document.querySelector('.planner-content-inner')
    const contentInner = contentElement.getBoundingClientRect()
    const contentStyle = getComputedStyle(contentElement)
    const progress = document
      .querySelector('.planner-progress')
      .getBoundingClientRect()
    const stage = document
      .querySelector('#planner-home')
      .getBoundingClientRect()
    const uncertainToggle = document
      .querySelector('#home-price-not-sure')
      .closest('.uncertain-toggle')
      .getBoundingClientRect()
    const nextQuestion = document
      .querySelector('#planner-home .choice-group:last-of-type')
      .getBoundingClientRect()
    const previousQuestion = document
      .querySelector('#planner-home .choice-group:first-of-type')
      .getBoundingClientRect()
    const questionBlock = document
      .querySelector('#planner-home .question-block')
      .getBoundingClientRect()
    const contentLeft =
      contentInner.left + Number.parseFloat(contentStyle.paddingLeft)
    const contentRight =
      contentInner.right - Number.parseFloat(contentStyle.paddingRight)

    return {
      choiceFontSize: Number.parseFloat(
        getComputedStyle(document.querySelector('#planner-home .choice-card'))
          .fontSize
      ),
      leftGap: stage.left - contentLeft,
      moneyLabelFontSize: Number.parseFloat(
        getComputedStyle(document.querySelector('#planner-home .money-field'))
          .fontSize
      ),
      progressFontSize: Number.parseFloat(
        getComputedStyle(document.querySelector('.planner-progress li'))
          .fontSize
      ),
      progressWidth: progress.width,
      previousQuestionGap: questionBlock.top - previousQuestion.bottom,
      questionGap: nextQuestion.top - uncertainToggle.bottom,
      rightGap: contentRight - stage.right,
      stageWidth: stage.width,
    }
  })
  assert(homeLayout.progressFontSize >= 12)
  assert(homeLayout.moneyLabelFontSize >= 15)
  assert(homeLayout.choiceFontSize >= 14)
  assert(Math.abs(homeLayout.progressWidth - homeLayout.stageWidth) <= 1)
  assert(homeLayout.rightGap <= homeLayout.leftGap + 16)
  assert(
    homeLayout.previousQuestionGap >= 24,
    `separate questions need a visible break; gap=${homeLayout.previousQuestionGap}`
  )
  assert(
    homeLayout.questionGap >= 24,
    `related question groups need a visible break; gap=${homeLayout.questionGap}`
  )
  await page.setViewportSize({ width: 2048, height: 1000 })
  const wideHomeAlignment = await page.evaluate(() => {
    const contentElement = document.querySelector('.planner-content-inner')
    const contentInner = contentElement.getBoundingClientRect()
    const contentStyle = getComputedStyle(contentElement)
    const stage = document
      .querySelector('#planner-home')
      .getBoundingClientRect()
    const contentLeft =
      contentInner.left + Number.parseFloat(contentStyle.paddingLeft)
    const contentRight =
      contentInner.right - Number.parseFloat(contentStyle.paddingRight)

    return {
      leftGap: stage.left - contentLeft,
      rightGap: contentRight - stage.right,
    }
  })
  assert(
    Math.abs(wideHomeAlignment.rightGap - wideHomeAlignment.leftGap) <= 16,
    `wide desktop content must use balanced horizontal space; left=${wideHomeAlignment.leftGap}, right=${wideHomeAlignment.rightGap}`
  )
  await page.setViewportSize(desktopViewport)
  await page.locator('[name="region"][value="england-ni"]').check()
  await page.locator('[name="propertyType"][value="house"]').check()
  await page
    .getByLabel('What home price are you thinking about?')
    .fill('287501')
  const priceInput = page.locator('#home-price')
  assert.equal(await priceInput.inputValue(), '287,501')
  await priceInput.fill('')
  await priceInput.pressSequentially('1000000')
  assert.equal(await priceInput.inputValue(), '1,000,000')
  await priceInput.evaluate((input) => input.setSelectionRange(3, 3))
  await priceInput.press('9')
  assert.equal(await priceInput.inputValue(), '10,900,000')
  assert.equal(await priceInput.evaluate((input) => input.selectionStart), 4)
  await priceInput.fill('')
  await priceInput.focus()
  await page.keyboard.insertText('1,000,000')
  assert.equal(await priceInput.inputValue(), '1,000,000')
  await priceInput.evaluate((input) => input.setSelectionRange(1, 1))
  await priceInput.press('Delete')
  assert.equal(await priceInput.inputValue(), '100,000')
  await priceInput.evaluate((input) => input.setSelectionRange(0, 3))
  await priceInput.press('2')
  assert.equal(await priceInput.inputValue(), '2,000')
  await priceInput.fill('1,000,000')
  await priceInput.evaluate((input) => input.setSelectionRange(2, 2))
  await priceInput.press('Backspace')
  assert.equal(await priceInput.inputValue(), '000,000')
  for (const invalid of ['', '24999', '20000001', '300000.5', '-300000']) {
    await priceInput.fill(invalid)
    assert.equal(
      await priceInput.evaluate((input) => input.checkValidity()),
      false
    )
  }
  await page.locator('#home-price-not-sure').check()
  assert.equal(await priceInput.inputValue(), '300,000')
  await page.locator('#home-price-not-sure').uncheck()
  await priceInput.fill('287,501')
  await page.locator('#home-next').click()
  assert.equal(await page.evaluate(() => location.hash), '#route')

  await page.locator('#planner-buying .education-card').evaluate((details) => {
    details.open = true
  })
  const buyingScrollCoverage = await measureIndependentPanelScroll(page, 200)
  assert.equal(buyingScrollCoverage.documentCanScroll, false)
  assert.equal(buyingScrollCoverage.panelCanScroll, true)
  assert.equal(buyingScrollCoverage.panelOverflowY, 'auto')
  assert(buyingScrollCoverage.panelScrollTop > 0)
  assert.equal(buyingScrollCoverage.windowScrollY, 0)
  assert.equal(
    buyingScrollCoverage.visualTopAfter,
    buyingScrollCoverage.visualTopBefore,
    'scrolling a wizard step must not move the illustrated panel'
  )
  assert.equal(buyingScrollCoverage.visualBottom, desktopViewport.height)
  await page.locator('#planner-buying .education-card').evaluate((details) => {
    details.open = false
  })

  await page.locator('[name="ownershipType"][value="whole"]').check()
  await page.locator('[name="firstTimeBuyer"][value="yes"]').check()
  await page.locator('#buying-next').click()

  await assert.doesNotReject(() =>
    page.locator('#planner-budget:not([hidden])').waitFor()
  )
  assert.equal(await page.evaluate(() => location.hash), '#budget')
  assert.equal(
    await page
      .locator('.planner-content')
      .evaluate((content) => content.scrollTop),
    0,
    'each stage should start at the top of the independently scrolling panel'
  )
  await page.locator('#mortgage-budget-not-sure').check()
  assert.equal(await page.locator('#mortgage-budget').isEditable(), false)
  assert.equal(await page.locator('#mortgage-budget').inputValue(), '1500')
  await page.locator('#annual-income').fill('5400')
  await page.locator('#budget-next').click()

  await assert.doesNotReject(() =>
    page.locator('#planner-results:not([hidden])').waitFor()
  )
  assert.equal(await page.evaluate(() => location.hash), '#plan')
  await page.goBack()
  await page.waitForFunction(() => location.hash === '#budget')
  assert.equal(await page.locator('#planner-budget').isVisible(), true)
  await page.goForward()
  await page.waitForFunction(() => location.hash === '#plan')
  assert.equal(await page.locator('#planner-results').isVisible(), true)
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
  assert.match(
    await page.locator('#result-timeline-detail').textContent(),
    /Includes 1 year before saving starts/
  )
  await assertMonthlyBreakdownOrder(page)
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

  const resultsType = await page.evaluate(() => ({
    balance: Number.parseFloat(
      getComputedStyle(document.querySelector('.balance-method dd')).fontSize
    ),
    disclaimer: Number.parseFloat(
      getComputedStyle(document.querySelector('.planner-disclaimer p')).fontSize
    ),
    lever: Number.parseFloat(
      getComputedStyle(document.querySelector('.lever-row')).fontSize
    ),
  }))
  assert(resultsType.balance >= 16)
  assert(resultsType.disclaimer >= 16)
  assert(resultsType.lever >= 16)

  await page.locator('#lever-home-price').fill('1000000')
  await page.locator('#lever-deposit').fill('40')
  await page.locator('#lever-rate').fill('4')
  await page.locator('#lever-term').fill('30')
  assert.equal(
    await page
      .locator('[name="repaymentMethod"][value="repayment"]')
      .isChecked(),
    true,
    'repayment should be the default comparison'
  )
  assert.equal(
    await page.locator('[name="rateType"][value="fixed"]').isChecked(),
    true,
    'fixed should be the default rate behaviour'
  )
  assert.equal(
    await page.locator('#repayment-option-payment').textContent(),
    '£2,864/mo'
  )
  assert.equal(
    await page.locator('#interest-only-option-payment').textContent(),
    '£2,000/mo'
  )
  assert.equal(
    await page.locator('#part-and-part-option-payment').textContent(),
    '£2,432/mo'
  )
  assert.equal(
    await page.locator('#repayment-option-balance').textContent(),
    '£0 left at the end'
  )
  assert.equal(
    await page.locator('#interest-only-option-balance').textContent(),
    '£600,000 left at the end'
  )

  const repaymentChoiceLayout = await page.evaluate(() => {
    const options = [...document.querySelectorAll('.repayment-option')]
    const container = document
      .querySelector('.repayment-options')
      .getBoundingClientRect()
    const cards = options.map((option) => {
      const bounds = option.getBoundingClientRect()

      return {
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
        width: bounds.width,
      }
    })

    return {
      cards,
      containerRight: container.right,
    }
  })
  assert.equal(repaymentChoiceLayout.cards.length, 3)
  assert(
    repaymentChoiceLayout.cards.every(
      (card) =>
        Math.abs(card.top - repaymentChoiceLayout.cards[0].top) <= 1 &&
        Math.abs(card.width - repaymentChoiceLayout.cards[0].width) <= 1 &&
        card.right <= repaymentChoiceLayout.containerRight + 1
    ),
    'all three repayment methods must align in an equal-width row without overflowing'
  )

  const selectedMethodStyles = []
  for (const method of ['repayment', 'interest-only', 'part-and-part']) {
    await page.locator(`[name="repaymentMethod"][value="${method}"]`).check()
    await page.waitForTimeout(180)
    selectedMethodStyles.push(
      await page
        .locator(`[name="repaymentMethod"][value="${method}"]`)
        .evaluate((input) => {
          const styles = getComputedStyle(input.closest('.repayment-option'))

          return {
            backgroundColor: styles.backgroundColor,
            borderColor: styles.borderColor,
            boxShadow: styles.boxShadow,
          }
        })
    )
  }
  assert.deepEqual(
    selectedMethodStyles.slice(1),
    [selectedMethodStyles[0], selectedMethodStyles[0]],
    'every selected repayment method must use the same visual treatment'
  )

  await page.locator('[name="repaymentMethod"][value="part-and-part"]').check()
  assert.equal(
    await page.locator('#result-mortgage-payment').textContent(),
    '£2,432/mo',
    'part-and-part should combine repayment and interest-only payments'
  )
  assert.equal(
    await page.locator('#result-total-monthly').textContent(),
    '£3,691 a month'
  )
  assert.equal(
    await page.locator('#result-loan').textContent(),
    '£600,000 part-and-part mortgage'
  )
  assert.equal(
    await page.locator('#part-and-part-option-balance').textContent(),
    '£300,000 left at the end'
  )
  assert.equal(await page.locator('#part-and-part-control').isVisible(), true)
  await page.locator('#part-repayment-percent').fill('75')
  assert.equal(
    await page.locator('#result-mortgage-payment').textContent(),
    '£2,648/mo',
    'adjusting the repayment share should update the mixed monthly payment'
  )
  assert.equal(
    await page.locator('#part-and-part-option-balance').textContent(),
    '£150,000 left at the end'
  )

  assert.equal(
    await page.locator('.cost-levers').evaluate((node) => node.tagName),
    'SECTION'
  )
  assert.equal(await page.locator('#lever-maintenance').isVisible(), true)
  assert.match(
    await page.locator('#result-surprise').textContent(),
    /bills and repairs/,
    'the surprise line should use natural list copy'
  )
  assert.equal(await page.locator('.planner-signup-cta').isVisible(), true)
  assert.equal(
    await page.locator('.planner-signup-cta a').getAttribute('href'),
    'https://budget.slothmoney.app/?intent=signup&entry_point=home-planner-results-cta&cta_id=home-planner-results-cta',
    'the signup CTA should open the Sloth Money account-creation flow'
  )

  await page.locator('.planner-disclaimer details').evaluate((details) => {
    details.open = true
  })
  const closingLayout = await page.evaluate(() => {
    const box = (selector) => {
      const bounds = document.querySelector(selector)?.getBoundingClientRect()
      return bounds
        ? {
            bottom: bounds.bottom,
            left: bounds.left,
            right: bounds.right,
            top: bounds.top,
          }
        : null
    }

    return {
      cta: box('.planner-signup-cta'),
      disclaimer: box('.planner-disclaimer'),
      layout: box('.results-layout'),
      lever: box('.lever-panel'),
      nestedInPlan: Boolean(
        document.querySelector('.plan-panel .planner-signup-cta')
      ),
    }
  })
  assert(closingLayout.cta)
  assert(closingLayout.disclaimer)
  assert(closingLayout.layout)
  assert(closingLayout.lever)
  assert.equal(
    closingLayout.nestedInPlan,
    false,
    'the signup CTA should follow the complete two-column results content'
  )
  assert(
    closingLayout.cta.top >=
      Math.max(closingLayout.disclaimer.bottom, closingLayout.lever.bottom) - 1,
    'the signup CTA should sit below both the levers and sources and assumptions'
  )
  assert(
    Math.abs(closingLayout.cta.left - closingLayout.layout.left) <= 1 &&
      Math.abs(closingLayout.cta.right - closingLayout.layout.right) <= 1,
    'the signup CTA should span the full results width to the right of the artwork'
  )

  await page.locator('[name="repaymentMethod"][value="interest-only"]').check()
  assert.equal(
    await page.locator('#result-mortgage-payment').textContent(),
    '£2,000/mo',
    'interest-only should update the headline mortgage payment'
  )
  assert.equal(
    await page.locator('#result-total-monthly').textContent(),
    '£3,258 a month',
    'interest-only should update the full monthly picture'
  )
  assert.equal(
    await page.locator('#result-loan').textContent(),
    '£600,000 interest-only mortgage'
  )

  await page.locator('[name="rateType"][value="tracker"]').check()
  assert.match(
    await page.locator('#rate-type-explanation').textContent(),
    /can rise or fall/i,
    'tracker should explain that the assumed payment can change'
  )
  assert.equal(
    await page.locator('#rate-impact-label').textContent(),
    '+1 percentage point example'
  )
  assert.equal(
    await page.locator('#rate-impact-value').textContent(),
    '£2,500/mo at 5.0%',
    'tracker should show a concrete higher-rate illustration for the selected mortgage method'
  )
  assert.equal(
    await page.locator('#result-mortgage-payment').textContent(),
    '£2,000/mo',
    'changing rate behaviour should not alter the current-rate calculation'
  )

  await page.locator('[name="repaymentMethod"][value="repayment"]').check()
  assert.equal(
    await page.locator('#result-mortgage-payment').textContent(),
    '£2,864/mo'
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

  const resultsScrolling = await measureIndependentPanelScroll(page, 500)
  assert.equal(resultsScrolling.documentCanScroll, false)
  assert.equal(resultsScrolling.panelCanScroll, true)
  assert.equal(resultsScrolling.panelOverflowY, 'auto')
  assert(resultsScrolling.panelScrollTop > 0)
  assert.equal(resultsScrolling.windowScrollY, 0)
  assert.equal(
    resultsScrolling.visualTopAfter,
    resultsScrolling.visualTopBefore,
    'scrolling the results panel must not move the illustrated panel'
  )
  assert(resultsScrolling.widthOverflow <= 1)

  await page.locator('.planner-content').evaluate((content) => {
    content.scrollTop = content.scrollHeight
  })
  await page.evaluate(() => new Promise(requestAnimationFrame))
  const ctaSeparation = await page.evaluate(() => {
    const levers = document
      .querySelector('.lever-panel')
      .getBoundingClientRect()
    const cta = document
      .querySelector('.planner-signup-cta')
      .getBoundingClientRect()
    return cta.top - levers.bottom
  })
  assert(
    ctaSeparation >= 16,
    `the results CTA must stay visually separate from the levers; gap=${ctaSeparation}`
  )

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

  await page.goto(`${baseUrl}/home-planner/`, {
    waitUntil: 'domcontentloaded',
  })
  await page.locator('#planner-start').click()
  assert.equal(
    await page.locator('#saving-start-month').inputValue(),
    currentMonth
  )
  assert.equal(
    await page.locator('#deposit-saved').inputValue(),
    '',
    'financial answers must not persist across a refresh'
  )

  for (const scenario of [
    {
      saved: '100000',
      ownership: 'whole',
      percent: '40',
      deposit: '£120,000',
      loan: '£180,000',
      shortfall: '£32,000',
    },
    {
      saved: '101000',
      ownership: 'whole',
      percent: '40',
      deposit: '£120,000',
      loan: '£180,000',
      shortfall: '£31,000',
    },
    {
      saved: '150000',
      ownership: 'whole',
      percent: '40',
      deposit: '£120,000',
      loan: '£180,000',
      shortfall: '£0',
    },
    {
      saved: '100000',
      ownership: 'shared',
      percent: '20',
      deposit: '£24,000',
      loan: '£96,000',
      shortfall: '£0',
    },
  ]) {
    await page.goto(`${baseUrl}/home-planner/`)
    await page.locator('#planner-start').click()
    await page.locator('#deposit-saved').fill(scenario.saved)
    await page.locator('#monthly-saving').fill('1000')
    await page.locator('#savings-next').click()
    await page.locator('#home-price').fill('300000')
    await page.locator('[name="region"][value="england-ni"]').check()
    await page.locator('[name="propertyType"][value="house"]').check()
    await page.locator('#home-next').click()
    await page
      .locator(`[name="ownershipType"][value="${scenario.ownership}"]`)
      .check()
    await page.locator('[name="firstTimeBuyer"][value="yes"]').check()
    await page.locator('#buying-next').click()
    assert.equal(await page.locator('#deposit-target').inputValue(), '10')
    await page.locator('#deposit-target').fill(scenario.percent)
    assert.equal(
      await page.locator('#deposit-target-amount').textContent(),
      `${scenario.deposit} deposit${scenario.ownership === 'shared' ? ' on a 40% share' : ''}`
    )
    await page.locator('#mortgage-budget').fill('1500')
    await page.locator('#budget-next').click()
    assert.equal(
      await page.locator('#lever-deposit').inputValue(),
      scenario.percent
    )
    assert.equal(
      await page.locator('#breakdown-deposit').textContent(),
      scenario.deposit
    )
    assert.equal(
      await page.locator('#result-loan').textContent(),
      `${scenario.loan} repayment mortgage`
    )
    assert.equal(
      await page.locator('#result-cash-shortfall').textContent(),
      `${scenario.shortfall} still to build`
    )
    if (scenario.saved === '100000' && scenario.ownership === 'whole') {
      assert.equal(
        await page.locator('#result-timeline').textContent(),
        '2y 8m'
      )
      await page.locator('#lever-deposit').fill('20')
      assert.equal(
        await page.locator('#result-loan').textContent(),
        '£240,000 repayment mortgage'
      )
      await page.locator('#results-back').click()
      await page.locator('#planner-budget:not([hidden])').waitFor()
      assert.equal(await page.locator('#deposit-target').inputValue(), '20')
      await page.locator('#deposit-target').fill('101')
      await page.locator('#budget-next').click()
      assert.equal(await page.locator('#planner-budget').isVisible(), true)
      await page.locator('#deposit-target').fill('-1')
      await page.locator('#budget-next').click()
      assert.equal(await page.locator('#planner-budget').isVisible(), true)
      await page.locator('#deposit-target').fill('')
      await page.locator('#budget-next').click()
      assert.equal(await page.locator('#planner-budget').isVisible(), true)
      await page.locator('#deposit-target').fill('30')
      await page.locator('#budget-next').click()
      assert.equal(
        await page.locator('#breakdown-deposit').textContent(),
        '£90,000'
      )
    }
  }

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

  // Bounds of both sloths in the source artwork, including their feet.
  // Check the painted subjects, not just the image element's box.
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
  ]) {
    await mobilePage.setViewportSize(viewport)
    const sloths = await mobilePage.evaluate(async () => {
      const image = document.querySelector('.planner-journey-image')
      await image.decode()
      const box = image.getBoundingClientRect()
      const panel = document
        .querySelector('.planner-content')
        .getBoundingClientRect()
      const scale = Math.max(
        box.width / image.naturalWidth,
        box.height / image.naturalHeight
      )
      const position = getComputedStyle(image)
        .objectPosition.split(' ')
        .map(parseFloat)
      const top =
        box.top +
        ((box.height - image.naturalHeight * scale) * position[1]) / 100
      return {
        head: top + 678 * scale,
        feet: top + 1155 * scale,
        frameTop: box.top,
        visibleBottom: Math.min(box.bottom, panel.top),
      }
    })
    assert(
      sloths.head >= sloths.frameTop,
      `sloth heads must remain inside the mobile crop at ${viewport.width}px`
    )
    assert(
      sloths.feet <= sloths.visibleBottom - 8,
      `both sloths must clear the rounded panel at ${viewport.width}px`
    )
  }
  await mobilePage.setViewportSize({ width: 390, height: 844 })

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
  await mobilePage.locator('#deposit-saved').fill('5000')
  await mobilePage.locator('#monthly-saving').fill('500')
  await mobilePage.locator('#savings-next').click()
  await mobilePage.locator('[name="region"][value="not-sure"]').check()
  await mobilePage.locator('#home-price').fill('300000')
  await mobilePage.locator('[name="propertyType"][value="house"]').check()
  await mobilePage.locator('#home-next').click()
  await mobilePage.locator('[name="ownershipType"][value="whole"]').check()
  await mobilePage.locator('[name="firstTimeBuyer"][value="yes"]').check()
  await mobilePage.locator('#buying-next').click()
  await mobilePage.locator('#deposit-target').fill('20')
  assert.equal(
    await mobilePage.locator('#deposit-target-amount').textContent(),
    '£60,000 deposit'
  )
  await mobilePage.locator('#mortgage-budget').fill('1500')
  await mobilePage.locator('#annual-income').fill('60000')
  await mobilePage.locator('#budget-next').click()
  assert.equal(await mobilePage.locator('#lever-deposit').inputValue(), '20')

  await mobilePage.locator('#open-plan-sheet').click()
  await mobilePage.locator('#lever-deposit-amount').fill('30000')
  await mobilePage.locator('#apply-plan-sheet').click()
  assert.equal(await mobilePage.locator('#deposit-target').inputValue(), '10')
  await checkPlannerSheet(mobilePage)
  await mobilePage.locator('#open-plan-sheet').click()

  for (const width of [320, 390, 430]) {
    await mobilePage.setViewportSize({ width, height: 844 })
    for (const price of ['1000000', '20000000']) {
      await mobilePage.locator('#lever-home-price').fill(price)
      await mobilePage.locator('#apply-plan-sheet').click()
      const paintedLayout = await mobilePage.evaluate(() => {
        const comparison = document.querySelector('.balance-comparison')
        const container = comparison.getBoundingClientRect()
        const walker = document.createTreeWalker(
          comparison,
          NodeFilter.SHOW_TEXT
        )
        const boxes = []
        while (walker.nextNode()) {
          if (!walker.currentNode.textContent.trim()) continue
          const range = document.createRange()
          range.selectNodeContents(walker.currentNode)
          boxes.push(
            ...[...range.getClientRects()].filter(
              (box) => box.width && box.height
            )
          )
        }
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          cardsContained: ['.reality-card', '.balance-comparison'].every(
            (selector) => {
              const box = document
                .querySelector(selector)
                .getBoundingClientRect()
              return box.left >= 0 && box.right <= innerWidth + 1
            }
          ),
          contained: boxes.every(
            (box) =>
              box.left >= container.left &&
              box.right <= Math.min(container.right, innerWidth) + 1
          ),
          overlapping: boxes.some((box, index) =>
            boxes
              .slice(index + 1)
              .some(
                (other) =>
                  Math.min(box.right, other.right) -
                    Math.max(box.left, other.left) >
                    1 &&
                  Math.min(box.bottom, other.bottom) -
                    Math.max(box.top, other.top) >
                    1
              )
          ),
        }
      })
      assert(paintedLayout.cardsContained, 'result cards must fit the viewport')
      assert(
        paintedLayout.contained,
        `balance text must fit its card at ${width}px for £${price}`
      )
      assert.equal(
        paintedLayout.overlapping,
        false,
        'painted balance labels and amounts must not collide'
      )
      assert(
        paintedLayout.overflow <= 1,
        'results must stay inside the mobile viewport'
      )
      await mobilePage.locator('#open-plan-sheet').click()
    }
  }
  await mobilePage.setViewportSize({ width: 390, height: 844 })
  await mobilePage.locator('#lever-home-price').fill('1000000')
  await mobilePage.locator('#lever-term').fill('15')
  await mobilePage.locator('#apply-plan-sheet').click()
  assert.deepEqual(
    await mobilePage.locator('[data-balance-year="one"]').allTextContents(),
    ['Year 5', 'Year 5', 'Year 5']
  )
  await mobilePage.locator('#open-plan-sheet').click()
  await mobilePage.locator('#lever-term').fill('30')

  await mobilePage.locator('#apply-plan-sheet').click()
  await assertMonthlyBreakdownOrder(mobilePage)
  const summaryOrder = await mobilePage.evaluate(() => ({
    summaryBottom: document
      .querySelector('.reality-card')
      .getBoundingClientRect().bottom,
    detailTop: document.querySelector('.results-layout').getBoundingClientRect()
      .top,
  }))
  assert(
    summaryOrder.summaryBottom <= summaryOrder.detailTop,
    'the monthly estimate must come before every results detail'
  )
  await mobilePage.locator('#show-monthly-breakdown').focus()
  await mobilePage.locator('#show-monthly-breakdown').press('Enter')
  assert.equal(
    await mobilePage.evaluate(() => document.activeElement?.id),
    'monthly-breakdown-title'
  )
  await mobilePage.emulateMedia({ reducedMotion: 'reduce' })
  assert.equal(
    await mobilePage
      .locator('.reality-card')
      .evaluate((node) => getComputedStyle(node).animationName),
    'none'
  )
  await mobilePage.emulateMedia({ reducedMotion: 'no-preference' })
  assert.equal(
    await mobilePage
      .locator('.reality-card')
      .evaluate((node) => getComputedStyle(node).animationIterationCount),
    '1'
  )
  await mobilePage.locator('#open-plan-sheet').click()
  await mobilePage.locator('#lever-home-price').fill('300000')

  const mobileResultOrder = await mobilePage.evaluate(() => ({
    choiceTop: document
      .querySelector('.mortgage-choice-card')
      .getBoundingClientRect().top,
    leverTop: document.querySelector('.lever-panel').getBoundingClientRect()
      .top,
    widthOverflow: document.documentElement.scrollWidth - innerWidth,
  }))
  assert(
    mobileResultOrder.choiceTop > mobileResultOrder.leverTop,
    'the sheet must put core assumptions before detailed mortgage choices'
  )
  assert(
    mobileResultOrder.widthOverflow <= 1,
    `mobile results must not overflow horizontally; overflow=${mobileResultOrder.widthOverflow}`
  )

  await mobilePage.locator('#repayment-method-repayment').focus()
  await mobilePage.locator('#repayment-method-repayment').press('ArrowRight')
  assert.equal(
    await mobilePage.locator('#repayment-method-interest-only').isChecked(),
    true,
    'the repayment choice should support native arrow-key selection'
  )
  await mobilePage
    .locator('#repayment-method-interest-only')
    .press('ArrowRight')
  assert.equal(
    await mobilePage.locator('#repayment-method-part-and-part').isChecked(),
    true,
    'all three repayment choices should support native arrow-key selection'
  )
  await mobilePage.locator('#apply-plan-sheet').click()
  assert.match(
    await mobilePage.locator('#result-loan').textContent(),
    /part-and-part mortgage/,
    'keyboard selection must update the visible result'
  )
  await mobilePage.locator('#open-plan-sheet').click()
  const mobileMixedCardLayout = await mobilePage.evaluate(() => {
    const payment = document
      .querySelector('#part-and-part-option-payment')
      .getBoundingClientRect()
    const balance = document
      .querySelector('#part-and-part-option-balance')
      .getBoundingClientRect()

    return {
      balanceTop: balance.top,
      paymentBottom: payment.bottom,
    }
  })
  assert(
    mobileMixedCardLayout.paymentBottom <= mobileMixedCardLayout.balanceTop,
    'the part-and-part payment and remaining balance must not overlap on mobile'
  )

  await mobilePage.locator('#apply-plan-sheet').click()

  await mobilePage.goto(`${baseUrl}/home-planner/#route`)
  await mobilePage.locator('[name="ownershipType"][value="shared"]').check()
  await mobilePage.locator('#buying-next').click()
  await mobilePage.locator('#mortgage-budget').fill('1500')
  await mobilePage.locator('#budget-next').click()
  await mobilePage.locator('#open-plan-sheet').click()
  await mobilePage.locator('#lever-deposit-amount').fill('24000')
  assert.equal(
    await mobilePage.locator('#result-deposit-percent').textContent(),
    '20%',
    'cash deposit is a percentage of the purchased share'
  )
  await mobilePage.locator('#apply-plan-sheet').click()
  assert.equal(
    await mobilePage.locator('#breakdown-deposit').textContent(),
    '£24,000'
  )

  await page.goto(`${baseUrl}/home-planner/#home`, {
    waitUntil: 'domcontentloaded',
  })
  assert.equal(
    await page.locator('#planner-home').isVisible(),
    true,
    'a Home Planner step URL must restore that step on reload'
  )

  await page.setViewportSize(desktopViewport)
  await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' })
  const toolsMenu = page.locator('[data-tools-menu]')
  await toolsMenu.locator('summary').click()
  assert.equal(await toolsMenu.getAttribute('open'), '')
  await page.locator('h1').first().click()
  assert.equal(
    await toolsMenu.getAttribute('open'),
    null,
    'clicking away must dismiss the desktop tools menu'
  )
  await toolsMenu.locator('summary').click()
  await toolsMenu.locator('summary').press('Escape')
  assert.equal(await toolsMenu.getAttribute('open'), null)
  assert.equal(
    await page.evaluate(
      () => document.activeElement?.closest('summary') !== null
    ),
    true,
    'Escape must dismiss the tools menu and retain focus on its trigger'
  )

  console.log('Home planner interaction checks passed.')
} finally {
  await browser?.close()
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
}
