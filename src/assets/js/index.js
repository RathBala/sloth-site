document.addEventListener('DOMContentLoaded', () => {
  const gemsContainer = document.querySelector('.gems-container')
  const heroImage = document.getElementById('hero-image')
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

  function createGem() {
    const imagePath = 'assets/images/gem.svg'
    const bottomBoundary = getBottomBoundary()

    const gem = document.createElement('img')
    gem.src = imagePath
    gem.classList.add('gem')
    gem.alt = 'Gem Icon'
    gem.style.left = `${Math.random() * 100}%`

    const keyframes = [
      { transform: `translateY(-100px)`, opacity: 1 },
      { transform: `translateY(${bottomBoundary - 10}px)`, opacity: 1 },
      { transform: `translateY(${bottomBoundary}px)`, opacity: 0 },
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

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.7,
  }

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        gemsContainer.style.display = 'block'
        updateBottomBoundary()
        generateGems()
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  observer.observe(heroImage)

  // Debounced resize event handler
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      updateBottomBoundary()
      generateGems()
      logBoundaries()
    }, 250) // Adjust this delay as needed
  })

  updateBottomBoundary()
  logBoundaries()
})
