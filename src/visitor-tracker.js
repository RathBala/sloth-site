;(function () {
  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
  }

  const isRath = getCookie('rath_visitor') === 'true'
  const alreadyAlerted = getCookie('sm_alerted') === '1'

  if (!isRath && !alreadyAlerted) {
    const data = {
      page: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      ip: '',
    }

    fetch('/.netlify/functions/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          // Set 24h cookie so repeat visits don't re-alert
          const expires = new Date(Date.now() + 86400000).toUTCString()
          document.cookie = `sm_alerted=1; expires=${expires}; path=/; SameSite=Lax`
        }
      })
      .catch((error) => {
        console.warn('[visitor-tracker] Error sending visit notification:', error)
      })
  }
})()
