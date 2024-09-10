document.addEventListener('DOMContentLoaded', () => {
  // const gemsContainer = document.getElementById('gemsContainer')
  // const heroImage = document.getElementById('hero-image')
  // const emergencyPotCircle = heroImage.getElementById('emergencyPotLarge')
  // let cachedBottomBoundary = null
  // let resizeTimer = null
  // let gemGenerationInterval = null

  // function getBottomBoundary() {
  //   if (cachedBottomBoundary === null) {
  //     cachedBottomBoundary = heroImage.getBoundingClientRect().bottom
  //   }
  //   return cachedBottomBoundary
  // }

  // function updateBottomBoundary() {
  //   cachedBottomBoundary = heroImage.getBoundingClientRect().bottom
  // }

  // function logBoundaries() {
  //   console.log('Hero Bottom Boundary:', getBottomBoundary())
  //   console.log('Window Inner Height:', window.innerHeight)
  // }

  // function getEmergencyPotPosition() {
  //   const heroRect = heroImage.getBoundingClientRect()
  //   const circleBBox = emergencyPotCircle.getBBox()
  //   const circleBottom = circleBBox.y + circleBBox.height

  //   return {
  //     left: heroRect.left + circleBBox.x + circleBBox.width / 2,
  //     bottom: heroRect.top + circleBottom,
  //   }
  // }

  // function updateGemsContainerPosition() {
  //   const heroRect = heroImage.getBoundingClientRect()
  //   const potPosition = getEmergencyPotPosition()

  //   gemsContainer.style.position = 'absolute'
  //   gemsContainer.style.left = `${potPosition.left}px`
  //   gemsContainer.style.top = `${potPosition.bottom}px`
  //   gemsContainer.style.height = `${heroRect.bottom - potPosition.bottom}px`

  //   updateBottomBoundary()
  //   logBoundaries()
  // }

  // function createGem() {
  //   const imagePath = 'assets/images/gem.svg'
  //   const containerRect = gemsContainer.getBoundingClientRect()
  //   const containerHeight = containerRect.height

  //   const gem = document.createElement('img')
  //   gem.src = imagePath
  //   gem.classList.add('gem')
  //   gem.alt = 'Gem Icon'
  //   gem.style.position = 'absolute'
  //   gem.style.left = `${Math.random() * 80 - 40}%` // Spread gems around the center

  //   const keyframes = [
  //     { transform: 'translateY(0)', opacity: 1 },
  //     { transform: `translateY(${containerHeight - 10}px)`, opacity: 1 },
  //     { transform: `translateY(${containerHeight}px)`, opacity: 0 },
  //   ]

  //   gem.animate(keyframes, {
  //     duration: 5000,
  //     iterations: Infinity,
  //     easing: 'linear',
  //   })

  //   gemsContainer.appendChild(gem)
  // }

  // function generateGems() {
  //   // Clear existing gems
  //   while (gemsContainer.firstChild) {
  //     gemsContainer.removeChild(gemsContainer.firstChild)
  //   }

  //   // Clear any existing interval
  //   if (gemGenerationInterval) {
  //     clearInterval(gemGenerationInterval)
  //   }

  //   // Start generating gems at intervals
  //   let gemsCreated = 0
  //   gemGenerationInterval = setInterval(() => {
  //     if (gemsCreated < 20) {
  //       createGem()
  //       gemsCreated++
  //     } else {
  //       clearInterval(gemGenerationInterval)
  //     }
  //   }, 200)
  // }

  const scenarioFocusImage = document.getElementById('scenario-focus-image')
  let imageB

  function createImageB() {
    const imageA = scenarioFocusImage.querySelector('img')
    imageB = imageA.cloneNode(true)
    imageB.src = 'assets/images/Scenario focus - B.png'
    imageB.alt = 'sloth money map view with alternate scenarios B'
    imageB.classList.add(
      'absolute',
      'top-0',
      'left-0',
      'transition-opacity',
      'duration-2000',
      'opacity-0'
    )
    scenarioFocusImage.appendChild(imageB)
  }

  function fadeToImage(showImage, hideImage) {
    // Start fading in the image to show
    showImage.classList.remove('opacity-0')
    showImage.classList.add('opacity-100')

    // Start fading out the image to hide
    hideImage.classList.remove('opacity-100')
    hideImage.classList.add('opacity-0')
  }

  let animationTimeout
  let isAnimating = false

  function startTransition() {
    if (isAnimating) return // Prevent multiple animations from starting
    isAnimating = true

    const imageA = scenarioFocusImage.querySelector('img:first-child')
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

    // Ensure imageA starts fully visible
    imageA.classList.add('opacity-100')
    imageA.classList.add('transition-opacity', 'duration-2000')

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
          if (!imageB) {
            createImageB()
          }
          startTransition()
        } else {
          stopTransition()
        }
      })
    },
    { threshold: 0.1 }
  )

  if (scenarioFocusImage) {
    imageObserver.observe(scenarioFocusImage)
  }

  // function init() {
  //   updateGemsContainerPosition()
  //   gemsContainer.classList.remove('hidden')
  //   generateGems()
  // }

  // window.addEventListener('resize', () => {
  //   clearTimeout(resizeTimer)
  //   resizeTimer = setTimeout(() => {
  //     updateGemsContainerPosition()
  //     updateBottomBoundary()
  //     generateGems()
  //     logBoundaries()
  //   }, 250)
  // })

  // const observerOptions = {
  //   root: null,
  //   rootMargin: '0px',
  //   threshold: 0.7,
  // }

  // const observer = new IntersectionObserver((entries, observer) => {
  //   entries.forEach((entry) => {
  //     if (entry.isIntersecting) {
  //       gemsContainer.style.display = 'block'
  //       init()
  //       observer.unobserve(entry.target)
  //     }
  //   })
  // }, observerOptions)

  // observer.observe(heroImage)

  // updateBottomBoundary()
  // logBoundaries()
})
