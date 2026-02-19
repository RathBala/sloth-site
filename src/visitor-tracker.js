;(function () {
  const getCookie = (name) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
  }

  const isRath = getCookie('rath_visitor') === 'true'
  const alreadyAlerted = sessionStorage.getItem('alerted') === '1'

  if (!isRath && !alreadyAlerted) {
    const data = {
      page: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      ip: '', // IP will be populated by Netlify on backend, or we can just leave it for now.
    }

    fetch('/.netlify/functions/track-visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          sessionStorage.setItem('alerted', '1')
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
