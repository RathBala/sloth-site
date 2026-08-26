import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { createRequire } from 'node:module'

const root = process.cwd()

const agentGuidance = fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8')
const landingPageDocs = fs.readFileSync(
  path.join(root, 'docs/landing-pages.md'),
  'utf8'
)

for (const [source, location] of [
  [agentGuidance, 'AGENTS.md'],
  [landingPageDocs, 'docs/landing-pages.md'],
]) {
  assert.equal(
    source.includes('https://slothmoney.app/mark-me.html'),
    true,
    `${location} should tell production testers how to suppress visit alerts`
  )
}

assert.equal(
  agentGuidance.includes('Use a local preview by default'),
  true,
  'agent guidance should keep routine browser testing off production'
)

const marketingPages = [
  'src/index.html',
  'src/wedding-fund/index.html',
  'src/developers/index.html',
]

for (const page of marketingPages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8')
  assert.equal(
    html.includes('googletagmanager.com') || html.includes('gtag('),
    false,
    `${page} should not load Google Analytics`
  )
  assert.equal(
    html.includes('meta-pixel-config.js') ||
      html.includes('meta-pixel-analytics.js'),
    false,
    `${page} should not load Meta Pixel`
  )
}

const privacyPage = fs.readFileSync(
  path.join(root, 'src/privacy/index.html'),
  'utf8'
)
const normalizedPrivacyPage = privacyPage.replace(/\s+/g, ' ')
assert.equal(
  /create,\s+update,\s+or\s+delete\s+goals/.test(normalizedPrivacyPage),
  true,
  'privacy policy should describe Agent API goal access'
)
assert.equal(
  /partner can see a shared Goal, but not the personal account assigned to fund it, its label, reference, or balance/.test(
    normalizedPrivacyPage
  ),
  true,
  'privacy policy should keep Goal-funding account details private from partners'
)
assert.equal(
  /manage\s+custom categories and\s+scoped budget line items/.test(
    normalizedPrivacyPage
  ),
  true,
  'privacy policy should describe Agent API category and line-item access'
)
assert.equal(
  /assignment instructions, ownership and progress state, and ordered results needed for recovery.*operation record expires after seven days and is then deleted/.test(
    normalizedPrivacyPage
  ),
  true,
  'privacy policy should describe assignment recovery data and retention'
)
assert.equal(
  /read your account inventory, investment holdings,\s+transaction data/.test(
    normalizedPrivacyPage
  ),
  true,
  'privacy policy should describe Agent API investment holdings access'
)
assert.equal(
  /manage\s+account details and archive\s+manual accounts/.test(
    normalizedPrivacyPage
  ),
  true,
  'privacy policy should describe Agent API account changes and archival'
)
assert.equal(
  /read your account inventory, investment holdings,\s+transaction data, categories, budgets, and goals/.test(
    normalizedPrivacyPage
  ),
  true,
  'privacy policy should describe Agent API budget reads'
)
assert.equal(
  /update\s+planned budget amounts/.test(normalizedPrivacyPage),
  true,
  'privacy policy should describe Agent API planned-budget updates'
)
assert.equal(
  /budget app uses privacy-masked\s+session replay/.test(privacyPage),
  true,
  'privacy policy should describe budget-app session replay'
)
assert.equal(
  /marketing website does not use session replay/.test(privacyPage),
  true,
  'privacy policy should exclude the marketing site from session replay'
)

const posthogSource = fs.readFileSync(
  path.join(root, 'src/assets/js/posthog-analytics.js'),
  'utf8'
)
assert.equal(
  posthogSource.includes('autocapture: true'),
  false,
  'marketing PostHog should not use autocapture'
)
assert.equal(
  posthogSource.includes('capture_pageview: true'),
  false,
  'marketing PostHog should not use automatic pageview capture'
)
assert.equal(
  posthogSource.includes('cross_subdomain_cookie'),
  false,
  'marketing PostHog should not use cross-domain cookie stitching'
)
assert.equal(
  posthogSource.includes('localStorage+cookie'),
  false,
  'marketing PostHog should not use cookie-backed persistence'
)
assert.equal(
  posthogSource.includes('disable_session_recording: true'),
  true,
  'marketing PostHog should explicitly disable session recording'
)

async function runVisitorTracker({
  cookie = '',
  globalPrivacyControl = false,
} = {}) {
  const source = fs.readFileSync(
    path.join(root, 'src/visitor-tracker.js'),
    'utf8'
  )
  const requests = []
  const context = {
    console,
    URL,
    fetch: async (url, options) => {
      requests.push({
        url,
        body: JSON.parse(options.body),
      })
      return { ok: true }
    },
    document: {
      cookie,
      referrer: 'https://example.com/path?token=secret',
    },
    navigator: {
      globalPrivacyControl,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    },
    window: {
      location: {
        href: 'https://slothmoney.app/wedding-fund?email=test@example.com&utm_source=secret',
        pathname: '/wedding-fund',
      },
    },
  }

  vm.runInNewContext(source, context)
  await new Promise((resolve) => setTimeout(resolve, 0))
  return requests
}

const trackerSource = fs.readFileSync(
  path.join(root, 'src/visitor-tracker.js'),
  'utf8'
)
assert.equal(
  trackerSource.includes('sm_alerted'),
  false,
  'visitor tracker should not set a repeat-visit cookie'
)

const trackerRequests = await runVisitorTracker()
assert.equal(trackerRequests.length, 1, 'visitor tracker should send one alert')
assert.deepEqual(
  trackerRequests[0].body,
  {
    pagePath: '/wedding-fund',
    referrerHost: 'example.com',
    device: 'mobile',
  },
  'visitor tracker should only send minimized visit details'
)

const optedOutRequests = await runVisitorTracker({ globalPrivacyControl: true })
assert.equal(
  optedOutRequests.length,
  0,
  'visitor tracker should respect Global Privacy Control'
)

const ownerRequests = await runVisitorTracker({ cookie: 'rath_visitor=true' })
assert.equal(
  ownerRequests.length,
  0,
  'visitor tracker should respect the owner alert opt-out cookie'
)

const require = createRequire(import.meta.url)
const { handler } = require('../netlify/functions/track-visit.js')

const previousEnv = { ...process.env }
process.env.TELEGRAM_BOT_TOKEN = 'test-token'
process.env.TELEGRAM_CHAT_ID = 'test-chat'

let telegramPayload
const originalFetch = globalThis.fetch
globalThis.fetch = async (_url, options) => {
  telegramPayload = JSON.parse(options.body)
  return { ok: true }
}

try {
  const response = await handler({
    httpMethod: 'POST',
    headers: {
      'x-nf-client-connection-ip': '203.0.113.10',
      'x-forwarded-for': '203.0.113.10',
    },
    body: JSON.stringify({
      pagePath: '/wedding-fund?email=test@example.com',
      referrerHost: 'https://example.com/private?token=secret',
      device: 'Mozilla/5.0 raw user agent',
      page: 'https://slothmoney.app/wedding-fund?email=test@example.com',
      userAgent: 'Mozilla/5.0 raw user agent',
      referrer: 'https://example.com/private?token=secret',
    }),
  })

  assert.equal(response.statusCode, 200)
  assert.ok(telegramPayload, 'track-visit should send a Telegram message')
  assert.equal(
    telegramPayload.text.includes('203.0.113.10'),
    false,
    'Telegram alert should not include IP address'
  )
  assert.equal(
    telegramPayload.text.includes('test@example.com') ||
      telegramPayload.text.includes('token=secret') ||
      telegramPayload.text.includes('Mozilla/5.0'),
    false,
    'Telegram alert should not include query strings or raw user agents'
  )
} finally {
  globalThis.fetch = originalFetch
  process.env = previousEnv
}

console.log('Tracking privacy checks passed.')
