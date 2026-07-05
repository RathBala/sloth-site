;(function () {
  function getCookie(name) {
    const value = `; ${document.cookie || ''}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return ''
  }

  function hasPrivacyOptOut() {
    return (
      navigator.globalPrivacyControl === true ||
      navigator.doNotTrack === '1' ||
      window.doNotTrack === '1' ||
      navigator.msDoNotTrack === '1'
    )
  }

  function deviceFromUserAgent() {
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

  function referrerHost() {
    if (!document.referrer) return ''
    try {
      return new URL(document.referrer).hostname
    } catch (error) {
      console.warn('[visitor-tracker] Invalid referrer URL:', error)
      return ''
    }
  }

  const isOwnerBrowser = getCookie('rath_visitor') === 'true'

  if (!hasPrivacyOptOut() && !isOwnerBrowser) {
    const data = {
      pagePath: window.location.pathname || '/',
      referrerHost: referrerHost(),
      device: deviceFromUserAgent(),
    }

    fetch('/.netlify/functions/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          console.warn(
            '[visitor-tracker] Visit notification failed:',
            response.status
          )
        }
      })
      .catch((error) => {
        console.warn(
          '[visitor-tracker] Error sending visit notification:',
          error
        )
      })
  }
})()
