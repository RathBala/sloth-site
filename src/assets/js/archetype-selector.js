// Get all archetype buttons
const archetypeButtons = document.querySelectorAll('[id^="archetype-"]')
const archetypeImages = {
  'rainy-day': 'assets/images/rainy day - before.png',
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
    // Fix: Use the correct archetype identifier
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

// Function to update displayed image
function updateDisplayedImage(selectedArchetype) {
  console.log('Updating displayed image for:', selectedArchetype)
  const imageContainer = document.querySelector('.archetype-images')
  if (!imageContainer) {
    console.error('Image container not found')
    return
  }
  const images = imageContainer.querySelectorAll('img')

  images.forEach((img) => {
    const shouldBeVisible = img.src.includes(archetypeImages[selectedArchetype])
    console.log(`Image ${img.src}: shouldBeVisible = ${shouldBeVisible}`)
    img.classList.toggle('hidden', !shouldBeVisible)
  })
}

// Add click event listeners to buttons
archetypeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    console.log('Button clicked:', button.id)
    // Fix: Use the correct archetype identifier
    const selectedArchetype = button.id.replace('archetype-', '')
    updateButtonStyles(button)
    updateDisplayedImage(selectedArchetype)
  })
})

// Initialize with 'rainy day' selected
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing rainy day selection')
  const rainyDayButton = document.getElementById('archetype-rainy-day')
  if (rainyDayButton) {
    updateButtonStyles(rainyDayButton)
    updateDisplayedImage('rainy-day')
  } else {
    console.error('Rainy day button not found')
  }
})

console.log('Archetype selector script loaded')
