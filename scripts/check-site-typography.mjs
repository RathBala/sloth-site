import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('../src/', import.meta.url))
const screenshots = process.env.SITE_TYPOGRAPHY_SCREENSHOT_DIR
const betaSpacingOnly = process.argv.includes('--beta-spacing')
const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
}
const server = createServer(async (request, response) => {
  try {
    let path = new URL(request.url, 'http://localhost').pathname
    if (path.endsWith('/')) path += 'index.html'
    const data = await readFile(join(root, decodeURIComponent(path)))
    response.writeHead(200, {
      'content-type': types[extname(path)] ?? 'application/octet-stream',
    })
    response.end(data)
  } catch {
    response.writeHead(404)
    response.end('Not found')
  }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const url = `http://127.0.0.1:${server.address().port}`
console.log(`[site-typography] ${root} at ${url}`)
const browser = await chromium.launch(
  existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' }
)
const deadline = setTimeout(() => {
  console.error('Typography check exceeded 120 seconds')
  browser.close()
  server.close()
  process.exitCode = 1
}, 120000)
try {
  if (screenshots) await mkdir(screenshots, { recursive: true })
  for (const width of [390, 768, 1440]) {
    for (const route of [
      '/',
      '/wedding-fund/',
      '/developers/',
      '/privacy/',
      '/home-planner/',
    ]) {
      if (betaSpacingOnly && !['/', '/wedding-fund/'].includes(route)) continue
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        reducedMotion: 'reduce',
      })
      page.setDefaultTimeout(15000)
      await page.goto(url + route, { waitUntil: 'networkidle' })
      await page.evaluate(() => document.fonts.ready)
      await page.addStyleTag({
        content:
          '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}',
      })
      const result = await page.evaluate(() => {
        const visible = (e) =>
          e.getBoundingClientRect().width > 0 &&
          e.getBoundingClientRect().height > 0
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          smallText: [...document.querySelectorAll('main *, #site-footer *')]
            .filter(visible)
            .filter(
              (e) =>
                !e.closest('script, style, svg') &&
                [...e.childNodes].some(
                  (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim()
                )
            )
            .filter((e) => parseFloat(getComputedStyle(e).fontSize) < 16)
            .map((e) => e.textContent.trim().slice(0, 60)),
          copy: [...document.querySelectorAll('main p, main li, main label')]
            .filter(visible)
            .filter((e) => !e.closest('pre, code, .sloth-feature-strip'))
            .map((e) => ({
              text: e.textContent.trim().slice(0, 60),
              size: parseFloat(getComputedStyle(e).fontSize),
            })),
        }
      })
      assert(!result.overflow, `${route} overflows at ${width}px`)
      if (route === '/' || route === '/wedding-fund/') {
        const promise = page.getByText(
          'Everyone who joins during the beta keeps full access.',
          { exact: true }
        )
        await promise.scrollIntoViewIfNeeded()
        const { accessGap, privacyGap } = await promise.evaluate((e) => {
          const access = e.getBoundingClientRect()
          const notes = e.nextElementSibling.querySelectorAll('p')
          const ads = notes[0].getBoundingClientRect()
          const privacy = notes[1].getBoundingClientRect()
          return {
            accessGap: ads.top - access.bottom,
            privacyGap: privacy.top - ads.bottom,
          }
        })
        assert(
          Math.abs(accessGap - privacyGap) <= 1 && accessGap <= 16,
          `${route} ${width}px: beta promise gaps should match and stay compact (${accessGap}px, ${privacyGap}px)`
        )
        if (screenshots) {
          await promise.locator('../..').evaluate((e) =>
            window.scrollTo({
              top: e.getBoundingClientRect().top + scrollY - 110,
              behavior: 'instant',
            })
          )
          await page.screenshot({
            path: join(
              screenshots,
              `${route === '/' ? 'home' : 'wedding'}-beta-card-${width}.png`
            ),
          })
        }
      }
      if (betaSpacingOnly) {
        await page.close()
        continue
      }
      if (route === '/wedding-fund/') {
        const art = await page.locator('.hero-image-container').boundingBox()
        const heading = await page
          .locator('#wedding-hero-heading')
          .boundingBox()
        assert(
          art.y + art.height <= heading.y,
          'wedding hero art must clear the heading'
        )
      }
      assert.deepEqual(
        result.smallText,
        [],
        `${route} ${width}px has text below 16px`
      )
      for (const item of result.copy)
        assert(
          item.size >=
            (route === '/home-planner/'
              ? 16
              : width < 1024
                ? 18
                : ['/developers/', '/privacy/'].includes(route)
                  ? 20
                  : 22),
          `${route} ${width}px: ${item.text} is ${item.size}px`
        )
      const toolsMenu = page.locator('[data-tools-menu] summary')
      if (await toolsMenu.isVisible()) {
        await toolsMenu.focus()
        await toolsMenu.press('Enter')
        assert(await page.locator('[data-tools-menu]').evaluate((e) => e.open))
        await toolsMenu.press('Escape')
        assert.equal(
          await page.locator('[data-tools-menu]').evaluate((e) => e.open),
          false
        )
      }
      const menuToggle = page.locator('#mobile-menu-toggle')
      if (await menuToggle.isVisible()) {
        await menuToggle.focus()
        await menuToggle.press('Enter')
        assert.equal(await menuToggle.getAttribute('aria-expanded'), 'true')
        await menuToggle.press('Enter')
        assert.equal(await menuToggle.getAttribute('aria-expanded'), 'false')
      }
      if (route === '/') {
        for (const item of await page.locator('.sloth-feature-item').all()) {
          const label = await item.evaluate((e) => ({
            size: getComputedStyle(e).fontSize,
            leading: parseFloat(getComputedStyle(e).lineHeight),
            weight: getComputedStyle(e).fontWeight,
          }))
          assert.equal(
            label.size,
            '16px',
            'feature summaries should use compact label type'
          )
          assert(label.leading <= 22)
          assert(Number(label.weight) <= 600)
          const icon = await item.locator('svg, i').boundingBox()
          assert(
            icon.width >= 20,
            'feature icons must not shrink beside long labels'
          )
        }
        if (width >= 1024) {
          assert(
            (await page.locator('.sloth-feature-strip').boundingBox()).height <=
              104,
            'desktop feature strip should remain a compact summary'
          )
        }
        assert(
          (await page
            .locator('#web-app-heading')
            .evaluate((e) => parseFloat(getComputedStyle(e).fontSize))) >=
            (width >= 1024 ? 48 : 32)
        )
        for (const [name, selector] of [
          ['entry', 'h1'],
          ['strip', '.sloth-feature-strip'],
          ['features', '.sloth-home-content'],
          ['app-couples', '#web-app-heading'],
          ['couples', '.sloth-home-content > section:nth-of-type(3)'],
          ['beta', '.sloth-home-content > section:nth-of-type(4)'],
          ['privacy', '.sloth-home-content > section:nth-of-type(5)'],
          ['closing', '.sloth-home-content > section:last-of-type'],
          ['footer', '#site-footer'],
        ]) {
          await page
            .locator(selector)
            .first()
            .evaluate((e) =>
              window.scrollTo({
                top: e.getBoundingClientRect().top + scrollY - 110,
                behavior: 'instant',
              })
            )
          if (screenshots)
            await page.screenshot({
              path: join(screenshots, `home-${name}-${width}.png`),
            })
        }
      } else if (screenshots)
        await page.screenshot({
          path: join(screenshots, `${route.split('/')[1]}-${width}.png`),
        })
      await page.close()
    }
  }
  console.log(
    betaSpacingOnly
      ? '[site-typography] Beta promise spacing matches on both pages at all three viewport widths.'
      : '[site-typography] All public routes meet the readable type floor without page overflow.'
  )
} finally {
  clearTimeout(deadline)
  await browser.close()
  await new Promise((resolve) => server.close(resolve))
}
