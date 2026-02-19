exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { page, userAgent, referrer } = JSON.parse(event.body)
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('[track-visit] Missing environment variables')
      return { statusCode: 500, body: 'Configuration error' }
    }

    // Get real IP from Netlify headers
    const ip =
      event.headers['x-nf-client-connection-ip'] ||
      event.headers['x-forwarded-for'] ||
      'unknown'

    const message =
      `👀 *Visitor on slothmoney.app*\n` +
      `📄 Page: ${page}\n` +
      `🌍 IP: \`${ip}\`\n` +
      `📱 Device: ${userAgent}\n` +
      `🔗 Referrer: ${referrer || 'direct'}`

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.warn(`[track-visit] Telegram error: ${response.status} ${errorText}`)
      return { statusCode: 502, body: 'Bad Gateway' }
    }

    return { statusCode: 200, body: JSON.stringify({ sent: true }) }
  } catch (error) {
    console.warn('[track-visit] Error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) }
  }
}
