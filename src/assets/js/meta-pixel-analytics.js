;(function () {
  const BUDGET_APP_HOST = 'budget.slothmoney.app'

  const cfg = window.__SLOTH_META_PIXEL__ || {}
  const pixelId = typeof cfg.pixelId === 'string' ? cfg.pixelId.trim() : ''

  if (!pixelId || !/^\d{10,20}$/.test(pixelId)) {
    console.warn(
      '[meta-pixel-analytics] Meta Pixel disabled: set META_PIXEL_ID (numeric Pixel ID from Events Manager) in .env and run yarn meta:config.'
    )
    return
  }

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = !0
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = !0
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  )

  function paramValue(params, key) {
    const v = params.get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function buildAttribution() {
    const params = new URLSearchParams(window.location.search || '')
    return {
      utm_source: paramValue(params, 'utm_source'),
      utm_medium: paramValue(params, 'utm_medium'),
      utm_campaign: paramValue(params, 'utm_campaign'),
      utm_content: paramValue(params, 'utm_content'),
    }
  }

  fbq('init', pixelId)
  fbq('track', 'PageView')
  fbq('track', 'ViewContent', {
    content_name: 'sloth_landing',
    content_category: 'marketing_site',
  })

  document.addEventListener(
    'click',
    function (event) {
      const target = event.target
      if (!target || typeof target.closest !== 'function') return
      const anchor = target.closest('a[data-analytics-cta]')
      if (!anchor) return

      const href = anchor.getAttribute('href') || ''
      if (href.indexOf(BUDGET_APP_HOST) === -1) return

      const placement = anchor.getAttribute('data-analytics-cta') || ''
      const intent = placement.indexOf('sign-in') !== -1 ? 'signin' : 'signup'
      const attribution = buildAttribution()

      if (typeof fbq !== 'function') return

      if (intent === 'signup') {
        fbq(
          'track',
          'Lead',
          Object.assign(
            {
              content_name: placement,
              content_category: 'app_cta',
            },
            attribution
          )
        )
      } else {
        fbq(
          'trackCustom',
          'AppSignInClick',
          Object.assign(
            {
              cta_placement: placement,
            },
            attribution
          )
        )
      }
    },
    true
  )
})()
