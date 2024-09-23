document.addEventListener('DOMContentLoaded', () => {
  const gemsContainerLarge = document.getElementById('gemsContainerLarge')
  const gemsContainerSmall = document.getElementById('gemsContainerSmall')
  const heroImage = document.getElementById('hero-image')
  const emergencyPotCircleLarge = heroImage.querySelector('#emergencyPotLarge')
  const emergencyPotCircleSmall = heroImage.querySelector('#emergencyPotSmall')
  let cachedBottomBoundary = null
  let resizeTimer = null

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

  function getEmergencyPotPosition(potElement) {
    const circleRect = potElement.getBoundingClientRect()
    return {
      left: circleRect.left + circleRect.width / 2,
      top: circleRect.bottom,
    }
  }

  function updateGemsContainerPosition() {
    const potPositionLarge = getEmergencyPotPosition(emergencyPotCircleLarge)
    const potPositionSmall = getEmergencyPotPosition(emergencyPotCircleSmall)
    const glowRect = document.querySelector('.glow').getBoundingClientRect()
    const heroRect = heroImage.getBoundingClientRect()

    // Get the width and height of the pots
    const potRectLarge = emergencyPotCircleLarge.getBoundingClientRect()
    const potRectSmall = emergencyPotCircleSmall.getBoundingClientRect()

    // Calculate the height from the pot to the bottom of the hero image
    const containerHeightLarge = heroRect.bottom - potPositionLarge.top
    const containerHeightSmall = heroRect.bottom - potPositionSmall.top

    // Update gemsContainerLarge
    gemsContainerLarge.style.position = 'absolute'
    gemsContainerLarge.style.left = `${potPositionLarge.left - glowRect.left - potRectLarge.width / 2}px`
    gemsContainerLarge.style.top = `${potPositionLarge.top - glowRect.top}px`
    gemsContainerLarge.style.height = `${containerHeightLarge}px`
    gemsContainerLarge.style.width = `${potRectLarge.width}px` // Set width to pot's width
    gemsContainerLarge.classList.add('absolute', 'overflow-visible')

    // Update gemsContainerSmall
    gemsContainerSmall.style.position = 'absolute'
    gemsContainerSmall.style.left = `${potPositionSmall.left - glowRect.left - potRectSmall.width / 2}px`
    gemsContainerSmall.style.top = `${potPositionSmall.top - glowRect.top}px`
    gemsContainerSmall.style.height = `${containerHeightSmall}px`
    gemsContainerSmall.style.width = `${potRectSmall.width}px` // Set width to pot's width
    gemsContainerSmall.classList.add('absolute', 'overflow-visible')
  }

  function createGem(container) {
    const imagePath = 'assets/images/gem.svg'
    const containerHeight = container.getBoundingClientRect().height
    const containerWidth = container.getBoundingClientRect().width

    const gem = document.createElement('img')
    gem.src = imagePath
    gem.alt = 'Gem Icon'

    // Determine gem size based on container
    let gemSize = 15 // Default size for large gems
    if (container === gemsContainerSmall) {
      gemSize = 7.5 // Half size for small gems
    }

    // Apply size and positioning styles to the gem
    gem.style.width = `${gemSize}px`
    gem.style.height = `${gemSize}px`
    gem.style.position = 'absolute'
    gem.style.top = '0'
    gem.style.left = '0'
    gem.style.zIndex = '30'

    // Remove the 'gem' class if it sets size properties
    // gem.classList.add('gem') // Remove or comment out if necessary

    // Calculate random horizontal offset within the container
    const randomOffsetX = Math.random() * containerWidth

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
      iterations: 1,
      easing: 'linear',
    })

    // Remove the gem after the animation completes
    animation.onfinish = () => {
      gem.remove()
    }

    container.appendChild(gem)
  }

  // Add these variables for separate timeouts
  let gemGenerationTimeoutLarge = null
  let gemGenerationTimeoutSmall = null

  // Modify generateGems to handle both containers
  function generateGems() {
    // For Large Container
    while (gemsContainerLarge.firstChild) {
      gemsContainerLarge.removeChild(gemsContainerLarge.firstChild)
    }
    if (gemGenerationTimeoutLarge) {
      clearTimeout(gemGenerationTimeoutLarge)
    }
    scheduleNextGemLarge()

    // For Small Container
    while (gemsContainerSmall.firstChild) {
      gemsContainerSmall.removeChild(gemsContainerSmall.firstChild)
    }
    if (gemGenerationTimeoutSmall) {
      clearTimeout(gemGenerationTimeoutSmall)
    }
    scheduleNextGemSmall()
  }

  // Add separate scheduling functions
  function scheduleNextGemLarge() {
    createGem(gemsContainerLarge)
    const minInterval = 300
    const maxInterval = 600
    const randomInterval =
      Math.random() * (maxInterval - minInterval) + minInterval

    gemGenerationTimeoutLarge = setTimeout(() => {
      scheduleNextGemLarge()
    }, randomInterval)
  }

  function scheduleNextGemSmall() {
    createGem(gemsContainerSmall)
    const minInterval = 400
    const maxInterval = 700
    const randomInterval =
      Math.random() * (maxInterval - minInterval) + minInterval

    gemGenerationTimeoutSmall = setTimeout(() => {
      scheduleNextGemSmall()
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
    gemsContainerLarge.classList.remove('hidden')
    gemsContainerSmall.classList.remove('hidden')
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
        gemsContainerLarge.classList.remove('hidden')
        gemsContainerSmall.classList.remove('hidden')
        init()
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  observer.observe(heroImage)

  updateBottomBoundary()
  logBoundaries()
})
