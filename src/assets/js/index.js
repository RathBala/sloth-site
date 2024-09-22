document.addEventListener('DOMContentLoaded', () => {
  const gemsContainer = document.getElementById('gemsContainer')
  const heroImage = document.getElementById('hero-image')
  const emergencyPotCircle = heroImage.querySelector('#emergencyPotLarge')
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
    const circleRect = emergencyPotCircle.getBoundingClientRect()
    const heroImageRect = heroImage.getBoundingClientRect()

    const scaleFactor = getScaleFactor()

    return {
      left:
        (circleRect.left - heroImageRect.left) / scaleFactor +
        heroImageRect.left +
        circleRect.width / (2 * scaleFactor),
      top:
        (circleRect.bottom - heroImageRect.top) / scaleFactor +
        heroImageRect.top,
    }
  }

  function getScaleFactor() {
    const style = window.getComputedStyle(heroImage)
    const transform = style.transform
    console.log('Computed transform:', transform)

    if (transform && transform !== 'none') {
      const match = transform.match(/matrix\\(([^)]+)\\)/)
      if (match) {
        const values = match[1].split(', ')
        const scaleX = parseFloat(values[0])
        console.log('Scale factor:', scaleX)
        return scaleX // Assuming uniform scaling
      }
    }
    console.log('No scaling detected, defaulting to 1')
    return 1 // No scaling applied
  }

  function updateGemsContainerPosition() {
    const potPosition = getEmergencyPotPosition()
    const heroRect = heroImage.getBoundingClientRect()
    const glowRect = document.querySelector('.glow').getBoundingClientRect()

    const gemHorizontalRange = 80 // Max horizontal movement in pixels

    gemsContainer.style.position = 'absolute'
    gemsContainer.style.left = `${potPosition.left - glowRect.left - gemHorizontalRange / 2}px`
    gemsContainer.style.top = `${potPosition.top - glowRect.top}px`
    gemsContainer.style.height = `${heroRect.bottom - potPosition.top}px`
    gemsContainer.style.width = `${gemHorizontalRange}px`

    // Apply Tailwind CSS classes for positioning
    gemsContainer.classList.add('absolute', 'overflow-visible')
  }

  function createGem() {
    const imagePath = 'assets/images/gem.svg'
    const containerHeight = gemsContainer.getBoundingClientRect().height

    const gem = document.createElement('img')
    gem.src = imagePath
    gem.alt = 'Gem Icon'
    gem.classList.add('gem')

    const randomOffsetX = (Math.random() - 0.5) * 80

    const keyframes = [
      {
        transform: `translateX(${randomOffsetX}px) translateY(0px)`,
        opacity: 1,
      },
      {
        transform: `translateX(${randomOffsetX}px) translateY(${containerHeight * 0.7}px)`,
        opacity: 0,
      },
    ]

    const animation = gem.animate(keyframes, {
      duration: 5000,
      iterations: 1, // Changed from Infinity to 1
      easing: 'linear',
    })

    // Remove the gem after the animation completes
    animation.onfinish = () => {
      gem.remove()
    }

    gemsContainer.appendChild(gem)
  }

  let gemGenerationTimeout = null

  function generateGems() {
    // Clear existing gems
    while (gemsContainer.firstChild) {
      gemsContainer.removeChild(gemsContainer.firstChild)
    }

    // Clear any existing timeout
    if (gemGenerationTimeout) {
      clearTimeout(gemGenerationTimeout)
    }

    // Start generating gems at random intervals
    scheduleNextGem()
  }

  function scheduleNextGem() {
    // Create a gem
    createGem()

    // Generate a random interval between minInterval and maxInterval
    const minInterval = 100 // Minimum interval in milliseconds
    const maxInterval = 500 // Maximum interval in milliseconds
    const randomInterval =
      Math.random() * (maxInterval - minInterval) + minInterval

    gemGenerationTimeout = setTimeout(() => {
      scheduleNextGem()
    }, randomInterval)
  }

  function setupImageTransition(
    containerId,
    imageASrc,
    imageBSrc,
    imageAAlt,
    imageBAlt
  ) {
    const container = document.getElementById(containerId)
    let imageA, imageB

    function createImages() {
      // Create or update imageA
      imageA = container.querySelector('img') || document.createElement('img')
      imageA.src = imageASrc
      imageA.alt = imageAAlt
      imageA.classList.add('w-full', 'transition-opacity', 'duration-2000')
      if (!container.contains(imageA)) {
        container.appendChild(imageA)
      }

      // Create imageB
      imageB = document.createElement('img')
      imageB.src = imageBSrc
      imageB.alt = imageBAlt
      imageB.classList.add(
        'absolute',
        'top-0',
        'left-0',
        'w-full',
        'transition-opacity',
        'duration-2000',
        'opacity-0'
      )
      container.appendChild(imageB)
    }

    let animationTimeout
    let isAnimating = false

    function startTransition() {
      if (isAnimating) return
      isAnimating = true

      let currentImage = 'A'

      function transitionCycle() {
        animationTimeout = setTimeout(() => {
          fadeToImage(
            currentImage === 'A' ? imageB : imageA,
            currentImage === 'A' ? imageA : imageB
          )

          animationTimeout = setTimeout(() => {
            currentImage = currentImage === 'A' ? 'B' : 'A'
            if (isAnimating) {
              transitionCycle()
            }
          }, 3000) // 2s fade + 1s display
        }, 1000) // Initial 1s display before starting fade
      }

      transitionCycle()
    }

    function stopTransition() {
      isAnimating = false
      clearTimeout(animationTimeout)
    }

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log(`Image container '${containerId}' is now visible`)
            if (!imageB) {
              console.log(`Creating images for '${containerId}'`)
              createImages()
            }
            console.log(`Starting transition for '${containerId}'`)
            startTransition()
          } else {
            console.log(`Image container '${containerId}' is no longer visible`)
            console.log(`Stopping transition for '${containerId}'`)
            stopTransition()
          }
        })
      },
      { threshold: 0.1 }
    )

    if (container) {
      imageObserver.observe(container)
    }
  }

  function fadeToImage(showImage, hideImage) {
    showImage.classList.remove('opacity-0')
    showImage.classList.add('opacity-100')
    hideImage.classList.remove('opacity-100')
    hideImage.classList.add('opacity-0')
  }

  // Set up transitions for both image sets
  setupImageTransition(
    'scenario-focus-image',
    'assets/images/Scenario focus - A.png',
    'assets/images/Scenario focus - B.png',
    'sloth money map view with alternate scenarios A',
    'sloth money map view with alternate scenarios B'
  )

  setupImageTransition(
    'table-view-image',
    'assets/images/Table view - before change.png',
    'assets/images/Table view - after change.png',
    'sloth money table view before changing deposits',
    'sloth money table view after changing deposits'
  )

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
        console.log('gems triggered')
        gemsContainer.classList.remove('hidden')
        init()
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  observer.observe(heroImage)

  updateBottomBoundary()
  logBoundaries()
})
