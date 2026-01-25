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
    btnYearly.classList.add('bg-white', 'text-gray-900', 'shadow-sm')
    btnYearly.classList.remove('text-gray-500', 'hover:text-gray-700')
    
    btnMonthly.classList.remove('bg-white', 'text-gray-900', 'shadow-sm')
    btnMonthly.classList.add('text-gray-500', 'hover:text-gray-700')
  } else {
    amount.textContent = '£4.99'
    period.textContent = '/ month'
    
    // Update button styles
    btnMonthly.classList.add('bg-white', 'text-gray-900', 'shadow-sm')
    btnMonthly.classList.remove('text-gray-500', 'hover:text-gray-700')
    
    btnYearly.classList.remove('bg-white', 'text-gray-900', 'shadow-sm')
    btnYearly.classList.add('text-gray-500', 'hover:text-gray-700')
  }
}

// Ensure the function is available globally for the onclick handlers
window.setPricing = setPricing

document.addEventListener('DOMContentLoaded', () => {
  // Initial state is monthly
  setPricing('monthly')
})
