exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { pagePath, referrerHost, device } = JSON.parse(event.body || '{}')
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('[track-visit] Missing environment variables')
      return { statusCode: 500, body: 'Configuration error' }
    }

    const safePagePath = sanitizePath(pagePath)
    const safeReferrerHost = sanitizeHost(referrerHost)
    const safeDevice = sanitizeDevice(device)

    const message =
      `👀 Visitor on slothmoney.app\n` +
      `📄 Page: ${safePagePath}\n` +
      `📱 Device: ${safeDevice}\n` +
      `🔗 Referrer: ${safeReferrerHost || 'direct'}`

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          message_thread_id: 4,
          text: message,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.warn(
        `[track-visit] Telegram error: ${response.status} ${errorText}`
      )
      return { statusCode: 502, body: 'Bad Gateway' }
    }

    return { statusCode: 200, body: JSON.stringify({ sent: true }) }
  } catch (error) {
    console.warn('[track-visit] Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    }
  }
}

function sanitizePath(value) {
  if (typeof value !== 'string') return '/'
  const withoutQuery = value.split(/[?#]/)[0]
  if (!withoutQuery.startsWith('/')) return '/'
  return withoutQuery.slice(0, 120) || '/'
}

function sanitizeHost(value) {
  if (typeof value !== 'string' || !value.trim()) return ''
  const trimmed = value.trim().slice(0, 160)

  try {
    return new URL(trimmed).hostname.slice(0, 120)
  } catch (_error) {
    if (/^[a-z0-9.-]+$/i.test(trimmed)) {
      return trimmed.toLowerCase().slice(0, 120)
    }
    return ''
  }
}

function sanitizeDevice(value) {
  return ['desktop', 'mobile', 'tablet'].includes(value) ? value : 'unknown'
}
