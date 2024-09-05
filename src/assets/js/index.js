document.addEventListener('DOMContentLoaded', () => {
  const gemsContainer = document.getElementById('gemsContainer')
  const heroImage = document.getElementById('hero-image')
  const emergencyPotCircle = heroImage.getElementById('emergencyPotLarge')
  let cachedBottomBoundary = null
  let resizeTimer = null
  let gemGenerationInterval = null

  function getBottomBoundary() {
    if (cachedBottomBoundary === null) {
      cachedBottomBoundary = heroImage.getBoundingClientRect().bottom
    }
    return cachedBottomBoundary
  }

  function updateBottomBoundary() {
    cachedBottomBoundary = heroImage.getBoundingClientRect().bottom
  }

  function logBoundaries() {
    console.log('Hero Bottom Boundary:', getBottomBoundary())
    console.log('Window Inner Height:', window.innerHeight)
  }

  function getEmergencyPotPosition() {
    const heroRect = heroImage.getBoundingClientRect()
    const circleBBox = emergencyPotCircle.getBBox()
    const circleBottom = circleBBox.y + circleBBox.height

    return {
      left: heroRect.left + circleBBox.x + circleBBox.width / 2,
      bottom: heroRect.top + circleBottom,
    }
  }

  function updateGemsContainerPosition() {
    const heroRect = heroImage.getBoundingClientRect()
    const potPosition = getEmergencyPotPosition()

    gemsContainer.style.position = 'absolute'
    gemsContainer.style.left = `${potPosition.left}px`
    gemsContainer.style.top = `${potPosition.bottom}px`
    gemsContainer.style.height = `${heroRect.bottom - potPosition.bottom}px`

    updateBottomBoundary()
    logBoundaries()
  }

  function createGem() {
    const imagePath = 'assets/images/gem.svg'
    const containerRect = gemsContainer.getBoundingClientRect()
    const containerHeight = containerRect.height

    const gem = document.createElement('img')
    gem.src = imagePath
    gem.classList.add('gem')
    gem.alt = 'Gem Icon'
    gem.style.position = 'absolute'
    gem.style.left = `${Math.random() * 80 - 40}%` // Spread gems around the center

    const keyframes = [
      { transform: 'translateY(0)', opacity: 1 },
      { transform: `translateY(${containerHeight - 10}px)`, opacity: 1 },
      { transform: `translateY(${containerHeight}px)`, opacity: 0 },
    ]

    gem.animate(keyframes, {
      duration: 5000,
      iterations: Infinity,
      easing: 'linear',
    })

    gemsContainer.appendChild(gem)
  }

  function generateGems() {
    // Clear existing gems
    while (gemsContainer.firstChild) {
      gemsContainer.removeChild(gemsContainer.firstChild)
    }

    // Clear any existing interval
    if (gemGenerationInterval) {
      clearInterval(gemGenerationInterval)
    }

    // Start generating gems at intervals
    let gemsCreated = 0
    gemGenerationInterval = setInterval(() => {
      if (gemsCreated < 20) {
        createGem()
        gemsCreated++
      } else {
        clearInterval(gemGenerationInterval)
      }
    }, 200)
  }

  function init() {
    updateGemsContainerPosition()
    gemsContainer.classList.remove('hidden')
    generateGems()
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      updateGemsContainerPosition()
      updateBottomBoundary()
      generateGems()
      logBoundaries()
    }, 250)
  })

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.7,
  }

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        gemsContainer.style.display = 'block'
        init()
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  observer.observe(heroImage)

  updateBottomBoundary()
  logBoundaries()
})
