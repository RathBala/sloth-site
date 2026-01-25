function setPricing(plan) {
  const amount = document.getElementById('pricing-amount')
  const period = document.getElementById('pricing-period')
  const btnMonthly = document.getElementById('btn-monthly')
  const btnYearly = document.getElementById('btn-yearly')

  if (!amount || !period || !btnMonthly || !btnYearly) return

  if (plan === 'yearly') {
    amount.textContent = '£39.99'
    period.textContent = '/ year'

    // Update button styles
    btnYearly.classList.add('bg-white', 'text-green', 'shadow-md', 'font-bold')
    btnYearly.classList.remove(
      'text-gray-600',
      'hover:text-gray-900',
      'font-medium'
    )

    btnMonthly.classList.remove(
      'bg-white',
      'text-green',
      'shadow-md',
      'font-bold'
    )
    btnMonthly.classList.add(
      'text-gray-600',
      'hover:text-gray-900',
      'font-medium'
    )
  } else {
    amount.textContent = '£4.99'
    period.textContent = '/ month'

    // Update button styles
    btnMonthly.classList.add('bg-white', 'text-green', 'shadow-md', 'font-bold')
    btnMonthly.classList.remove(
      'text-gray-600',
      'hover:text-gray-900',
      'font-medium'
    )

    btnYearly.classList.remove(
      'bg-white',
      'text-green',
      'shadow-md',
      'font-bold'
    )
    btnYearly.classList.add(
      'text-gray-600',
      'hover:text-gray-900',
      'font-medium'
    )
  }
}

// Ensure the function is available globally for the onclick handlers
window.setPricing = setPricing

document.addEventListener('DOMContentLoaded', () => {
  // Initial state is monthly
  setPricing('monthly')
})
