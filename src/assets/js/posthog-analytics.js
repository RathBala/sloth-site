;(function () {
  const BUDGET_APP_HOST = 'budget.slothmoney.app'

  /** Forward landing-page attribution and CTA context onto app URLs (runs even if PostHog is disabled). */
  function augmentBudgetAppCtaLinks() {
    const keysToForward = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'creative_id',
      'pain_angle',
      'audience',
      'landing_variant',
    ]

    function intentFromPlacement(placement) {
      if (!placement) return 'signup'
      return placement.indexOf('sign-in') !== -1 ? 'signin' : 'signup'
    }

    try {
      const pageParams = new URLSearchParams(window.location.search || '')
      const anchors = document.querySelectorAll(
        'a[data-analytics-cta][href*="' + BUDGET_APP_HOST + '"]'
      )

      anchors.forEach(function (a) {
        if (!a || !a.getAttribute) return
        var href = a.getAttribute('href')
        if (!href) return

        var url
        try {
          url = new URL(href, window.location.origin)
        } catch (e) {
          return
        }

        if (url.hostname !== BUDGET_APP_HOST) return

        keysToForward.forEach(function (key) {
          var v = pageParams.get(key)
          if (v && !url.searchParams.get(key)) {
            url.searchParams.set(key, v)
          }
        })

        var placement = a.getAttribute('data-analytics-cta') || ''
        var intent = intentFromPlacement(placement)
        if (!url.searchParams.get('entry_point')) {
          url.searchParams.set('entry_point', placement)
        }
        if (!url.searchParams.get('intent')) {
          url.searchParams.set('intent', intent)
        }
        if (!url.searchParams.get('cta_id')) {
          url.searchParams.set('cta_id', placement)
        }

        a.setAttribute('href', url.toString())
      })
    } catch (err) {
      console.warn('[posthog-analytics] augmentBudgetAppCtaLinks failed:', err)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', augmentBudgetAppCtaLinks)
  } else {
    augmentBudgetAppCtaLinks()
  }

  const cfg = window.__SLOTH_POSTHOG__ || {}
  const apiKey = typeof cfg.apiKey === 'string' ? cfg.apiKey : ''
  const apiHost =
    typeof cfg.apiHost === 'string' && cfg.apiHost
      ? cfg.apiHost
      : 'https://eu.i.posthog.com'

  if (!apiKey || !apiKey.startsWith('phc_')) {
    console.warn(
      '[posthog-analytics] PostHog disabled: set window.__SLOTH_POSTHOG__.apiKey to your project API key (phc_...) in index.html.'
    )
    return
  }

  if (typeof window.posthog === 'undefined' || !window.posthog.init) {
    console.warn(
      '[posthog-analytics] PostHog stub missing: include the PostHog loader snippet in the page head before this script.'
    )
    return
  }

  function paramValue(params, key) {
    const v = params.get(key)
    return v === null || v === undefined ? '' : String(v)
  }

  function buildSharedProperties() {
    const params = new URLSearchParams(window.location.search)
    return {
      utm_source: paramValue(params, 'utm_source'),
      utm_medium: paramValue(params, 'utm_medium'),
      utm_campaign: paramValue(params, 'utm_campaign'),
      utm_content: paramValue(params, 'utm_content'),
      creative_id: paramValue(params, 'creative_id'),
      pain_angle: paramValue(params, 'pain_angle'),
      audience: paramValue(params, 'audience'),
      landing_variant: paramValue(params, 'landing_variant'),
      device_type: getDeviceType(),
    }
  }

  function getDeviceType() {
    const ua = navigator.userAgent || ''
    if (
      /tablet|ipad/i.test(ua) ||
      (/\bAndroid\b/i.test(ua) && !/Mobile/i.test(ua))
    ) {
      return 'tablet'
    }
    if (/Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile/i.test(ua)) {
      return 'mobile'
    }
    return 'desktop'
  }

  const shared = buildSharedProperties()

  window.posthog.init(apiKey, {
    api_host: apiHost,
    defaults: '2026-01-30',
    autocapture: false,
    capture_pageview: false,
    persistence: 'memory',
    disable_session_recording: true,
    loaded: function (ph) {
      ph.register(shared)
      ph.capture('landing_view')
    },
    before_send: function (event) {
      if (!event || typeof event !== 'object') return event
      event.properties = event.properties || {}
      Object.assign(event.properties, shared)
      return event
    },
  })

  window.posthog.register(shared)

  document.addEventListener(
    'click',
    function (event) {
      const target = event.target
      if (!target || typeof target.closest !== 'function') return
      const anchor = target.closest('a[data-analytics-cta]')
      if (
        !anchor ||
        !window.posthog ||
        typeof window.posthog.capture !== 'function'
      )
        return
      const placement = anchor.getAttribute('data-analytics-cta') || ''
      const label = (anchor.textContent || '').trim().replace(/\s+/g, ' ')
      window.posthog.capture('cta_clicked', {
        cta_placement: placement,
        cta_label: label.slice(0, 200),
      })
    },
    true
  )
})()
