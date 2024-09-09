console.log('Archetype selector script loaded')

const archetypeButtons = document.querySelectorAll('[id^="archetype-"]')

const archetypeImages = {
  'rainy-day': 'assets/images/Save for a rainy day.png',
  holiday: 'assets/images/holiday - after.png',
  home: 'assets/images/home deposit - after.png',
  wedding: 'assets/images/wedding - before.png',
}

const iconImages = {
  'rainy-day': {
    active: 'assets/images/umbrella white.png',
    inactive: 'assets/images/umbrella grey.png',
  },
  holiday: {
    active: 'assets/images/pina-colada white.png',
    inactive: 'assets/images/pina-colada grey.png',
  },
  home: {
    active: 'assets/images/house white.png',
    inactive: 'assets/images/house grey.png',
  },
  wedding: {
    active: 'assets/images/wedding white.png',
    inactive: 'assets/images/wedding grey.png',
  },
}

function updateButtonStyles(selectedButton) {
  console.log('Updating button styles for:', selectedButton.id)
  archetypeButtons.forEach((button) => {
    const isSelected = button === selectedButton
    const archetypeType = button.id.replace('archetype-', '')

    console.log(
      `Button ${button.id}: isSelected = ${isSelected}, archetypeType = ${archetypeType}`
    )

    const h3Element = button.querySelector('h3')
    const pElement = button.querySelector('p')
    const iconImg = button.querySelector('img')

    if (h3Element && pElement && iconImg) {
      h3Element.classList.toggle('text-white', isSelected)
      h3Element.classList.toggle('font-medium', isSelected)
      h3Element.classList.toggle('text-gray', !isSelected)
      h3Element.classList.toggle('font-normal', !isSelected)
      pElement.classList.toggle('text-white', isSelected)
      pElement.classList.toggle('text-gray', !isSelected)

      // Update icon image
      if (iconImages[archetypeType]) {
        iconImg.src = isSelected
          ? iconImages[archetypeType].active
          : iconImages[archetypeType].inactive
        console.log(`Updated icon for ${button.id}: ${iconImg.src}`)
      } else {
        console.error(`No icon images found for archetype: ${archetypeType}`)
      }
    } else {
      console.error(`Missing elements for button ${button.id}`)
    }
  })
}

function updateDisplayedImage(selectedArchetype) {
  console.log('Updating displayed image for:', selectedArchetype)
  const imageContainer = document.querySelector('.archetype-images')
  if (!imageContainer) {
    console.error('Image container not found')
    return
  }
  const images = imageContainer.querySelectorAll('img')
  console.log('Number of images found:', images.length)

  const selectedImagePath = archetypeImages[selectedArchetype]

  images.forEach((img) => {
    const imagePath = img.getAttribute('src')
    const shouldBeVisible = imagePath === selectedImagePath
    console.log(`Image ${imagePath}: shouldBeVisible = ${shouldBeVisible}`)
    img.classList.toggle('hidden', !shouldBeVisible)
    console.log(
      `Image ${imagePath} hidden class:`,
      img.classList.contains('hidden')
    )
  })
}

function initialiseImages() {
  const imageContainer = document.querySelector('.archetype-images')
  if (!imageContainer) {
    console.error('Image container not found during initialisation')
    return
  }
  const images = imageContainer.querySelectorAll('img')

  images.forEach((img, index) => {
    if (index === 0) {
      console.log('Removing hidden class from first image.')
      img.classList.remove('hidden')
    } else {
      img.classList.add('hidden')
    }
  })

  console.log('Images initialised')
}

function setupButtonListeners() {
  archetypeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const archetypeType = button.id.replace('archetype-', '')
      console.log(`Button clicked: ${archetypeType}`)
      updateButtonStyles(button)
      updateDisplayedImage(archetypeType)
    })
  })
  console.log('Button listeners set up')
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initialising')

  console.log('Archetype buttons:', archetypeButtons)

  const imageContainer = document.querySelector('.archetype-images')
  console.log('Image container:', imageContainer)

  if (imageContainer) {
    const images = imageContainer.querySelectorAll('img')
    console.log('Images in container:', images)
  }

  initialiseImages()
  setupButtonListeners()

  // Set initial state to rainy day
  const rainyDayButton = document.getElementById('archetype-rainy-day')
  if (rainyDayButton) {
    console.log('Setting initial state to rainy day.')
    updateButtonStyles(rainyDayButton)
    updateDisplayedImage('rainy-day')
  } else {
    console.error('Rainy day button not found')
  }
})
