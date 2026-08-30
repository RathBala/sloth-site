import {
  calculateHomePlan,
  calculateMortgageBalance,
  PROPERTY_TAX_UPDATED_AT,
} from './home-planner-calculator.mjs'

const stageNames = ['intro', 'savings', 'home', 'buying', 'budget', 'results']
const stepNumbers = {
  budget: 4,
  buying: 3,
  home: 2,
  savings: 1,
}

const moneyFormatter = new Intl.NumberFormat('en-GB', {
  currency: 'GBP',
  maximumFractionDigits: 0,
  style: 'currency',
})

const byId = (id) => document.getElementById(id)
const formatMoney = (value) => moneyFormatter.format(Math.round(value || 0))
const inputNumber = (id) => Number(byId(id)?.value || 0)
const checkedValue = (name) =>
  document.querySelector(`input[name="${name}"]:checked`)?.value || 'not-sure'
const clampNumber = (value, min, max) =>
  Math.min(max, Math.max(min, Number(value) || 0))

const homePriceToSlider = (value, limits) => {
  const clampedValue = clampNumber(value, limits.min, limits.max)
  const scale = Math.log(limits.max / limits.min)

  return Math.round(
    (Math.log(clampedValue / limits.min) / scale) * limits.sliderMax
  )
}

const sliderToHomePrice = (value, limits) => {
  const position = clampNumber(value, 0, limits.sliderMax)
  const scale = Math.log(limits.max / limits.min)
  const rawPrice = limits.min * Math.exp((position / limits.sliderMax) * scale)
  const rounding =
    rawPrice < 500000
      ? 5000
      : rawPrice < 2000000
        ? 10000
        : rawPrice < 5000000
          ? 25000
          : rawPrice < 10000000
            ? 50000
            : 100000

  return clampNumber(
    Math.round(rawPrice / rounding) * rounding,
    limits.min,
    limits.max
  )
}

const formatTimeline = (months) => {
  if (!Number.isFinite(months)) return 'No timeline yet'
  if (months === 0) return 'Ready now'
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  return remainingMonths === 0
    ? `${years} year${years === 1 ? '' : 's'}`
    : `${years}y ${remainingMonths}m`
}

function initializePlanner() {
  const form = byId('home-planner-form')
  const wizardHomePrice = byId('home-price')
  const exactHomePrice = byId('lever-home-price')
  const homePriceRange = byId('lever-home-price-range')
  const plannerContent = document.querySelector('.planner-content')
  const progress = document.querySelector('.planner-progress')
  const stages = new Map(
    stageNames.map((name) => [name, byId(`planner-${name}`)])
  )
  const requiredElements = [
    form,
    wizardHomePrice,
    exactHomePrice,
    homePriceRange,
    plannerContent,
    progress,
    byId('planner-start'),
    ...stages.values(),
  ]

  if (requiredElements.some((element) => !element)) {
    console.warn('[home-planner] Required planner elements are missing.')
    return
  }

  exactHomePrice.min = wizardHomePrice.min
  exactHomePrice.max = wizardHomePrice.max
  const homePriceLimits = {
    max: Number(wizardHomePrice.max),
    min: Number(wizardHomePrice.min),
    sliderMax: Number(homePriceRange.max),
  }

  const updateIcons = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons()
  }

  const updateProgress = (name) => {
    const currentStep = stepNumbers[name]
    progress.hidden = name === 'intro' || name === 'results'

    progress.querySelectorAll('[data-progress-step]').forEach((item) => {
      const itemStep = Number(item.dataset.progressStep)
      item.classList.toggle('is-active', itemStep === currentStep)
      item.classList.toggle(
        'is-complete',
        Boolean(currentStep && itemStep < currentStep)
      )
      if (itemStep === currentStep) {
        item.setAttribute('aria-current', 'step')
      } else {
        item.removeAttribute('aria-current')
      }
    })
  }

  const showStage = (name, focusId) => {
    stages.forEach((stage, stageName) => {
      stage.hidden = stageName !== name
    })
    document.body.dataset.plannerStage = name
    updateProgress(name)

    window.scrollTo({ top: 0 })
    plannerContent.scrollTop = 0

    const focusTarget = focusId ? byId(focusId) : null
    focusTarget?.focus({ preventScroll: true })
  }

  const validateStep = (name) => {
    const stage = stages.get(name)
    const invalidInput = [...stage.querySelectorAll('input')].find(
      (input) => !input.checkValidity()
    )

    if (!invalidInput) return true

    invalidInput.reportValidity()
    invalidInput.focus()
    return false
  }

  const plannerInput = () => ({
    annualIncome: inputNumber('annual-income'),
    annualInterestRate: inputNumber('lever-rate'),
    buyingFees: inputNumber('lever-buying-fees'),
    depositPercent: inputNumber('lever-deposit'),
    depositSaved: inputNumber('deposit-saved'),
    firstTimeBuyer: checkedValue('firstTimeBuyer'),
    furnishingBudget: inputNumber('lever-furnishings'),
    homePrice: inputNumber('lever-home-price'),
    maintenancePercent: inputNumber('lever-maintenance'),
    monthlyBills: inputNumber('lever-bills'),
    monthlyMortgageBudget: inputNumber('mortgage-budget'),
    monthlySaving: inputNumber('monthly-saving'),
    ownershipType: checkedValue('ownershipType'),
    propertyType: checkedValue('propertyType'),
    region: checkedValue('region'),
    repaymentMethod: checkedValue('repaymentMethod'),
    serviceCharge: inputNumber('lever-service'),
    sharedOwnershipPercent: inputNumber('lever-shared-percent'),
    termYears: inputNumber('lever-term'),
  })

  const taxNote = (region, firstTimeBuyer, ownershipType) => {
    if (ownershipType === 'shared') {
      return 'Estimate on the share you buy. Shared ownership tax rules can differ.'
    }
    if (region === 'scotland') {
      return firstTimeBuyer === 'yes'
        ? 'Includes Scottish first-time buyer relief.'
        : 'Using Scottish residential rates.'
    }
    if (region === 'wales') return 'Using Welsh residential rates.'
    if (region === 'england-ni') {
      return firstTimeBuyer === 'yes'
        ? 'Includes first-time buyer relief where eligible.'
        : 'Using standard England and Northern Ireland rates.'
    }
    return 'Using standard England and Northern Ireland rates until you choose.'
  }

  const renderScenarios = (input, currentDeposit) => {
    const container = byId('deposit-scenarios')
    container.replaceChildren(
      ...[5, 10, 20].map((depositPercent) => {
        const scenario = calculateHomePlan({ ...input, depositPercent })
        const card = document.createElement('article')
        card.className = `scenario-option${
          depositPercent === currentDeposit ? ' is-current' : ''
        }`

        const title = document.createElement('strong')
        title.textContent = `${depositPercent}% deposit`
        const payment = document.createElement('span')
        payment.textContent = `${formatMoney(
          scenario.monthlyMortgagePayment
        )}/month mortgage`
        const timeline = document.createElement('small')
        timeline.textContent = `${formatMoney(
          scenario.cashNeeded
        )} cash, ${formatTimeline(scenario.monthsToCashNeeded)}`
        card.append(title, payment, timeline)
        return card
      })
    )
  }

  const renderPlan = () => {
    const input = plannerInput()
    const plan = calculateHomePlan(input)
    const ownershipType = checkedValue('ownershipType')
    const firstTimeBuyer = checkedValue('firstTimeBuyer')
    const region = checkedValue('region')
    const surprise = Math.max(
      0,
      plan.monthlyHomeCost - plan.monthlyMortgagePayment
    )
    const rateType = checkedValue('rateType')
    const isInterestOnly = plan.repaymentMethod === 'interest-only'
    const balanceYearOne = Math.round(input.termYears / 3)
    const balanceYearTwo = Math.round((input.termYears * 2) / 3)
    const repaymentBalanceOne = calculateMortgageBalance(
      plan.mortgagePrincipal,
      input.annualInterestRate,
      input.termYears,
      balanceYearOne
    )
    const repaymentBalanceTwo = calculateMortgageBalance(
      plan.mortgagePrincipal,
      input.annualInterestRate,
      input.termYears,
      balanceYearTwo
    )

    byId('result-deposit-percent').textContent = `${input.depositPercent}%`
    byId('result-rate').textContent = `${input.annualInterestRate.toFixed(1)}%`
    byId('result-term').textContent = `${input.termYears} years`
    byId('result-shared-percent').textContent = `${
      input.sharedOwnershipPercent
    }%`
    byId('result-maintenance-percent').textContent = `${
      input.maintenancePercent
    }%`
    byId('result-bills').textContent = `${formatMoney(input.monthlyBills)}/mo`
    byId('result-service').textContent = `${formatMoney(
      input.serviceCharge
    )}/mo`
    byId('result-furnishings').textContent = formatMoney(input.furnishingBudget)
    byId('result-buying-fees').textContent = formatMoney(input.buyingFees)

    byId('repayment-option-payment').textContent = `${formatMoney(
      plan.monthlyRepaymentPayment
    )}/mo`
    byId('interest-only-option-payment').textContent = `${formatMoney(
      plan.monthlyInterestOnlyPayment
    )}/mo`
    byId('repayment-option-balance').textContent =
      `£0 left after ${input.termYears} years`
    byId('interest-only-option-balance').textContent = `${formatMoney(
      plan.mortgagePrincipal
    )} left after ${input.termYears} years`
    byId('selected-end-balance').textContent = isInterestOnly
      ? `${formatMoney(plan.mortgageBalanceAtEnd)} left at the end`
      : '£0 left at the end'
    byId('rate-type-explanation').textContent =
      rateType === 'tracker'
        ? 'Follows another rate, so this payment can rise or fall.'
        : 'Keeps this rate for an agreed deal period, then usually changes.'
    byId('balance-comparison-term').textContent =
      `${input.termYears}-year term at ${input.annualInterestRate.toFixed(1)}%`
    byId('balance-year-one').textContent = `Year ${balanceYearOne}`
    byId('balance-year-two').textContent = `Year ${balanceYearTwo}`
    byId('repayment-balance-one').textContent = formatMoney(repaymentBalanceOne)
    byId('repayment-balance-two').textContent = formatMoney(repaymentBalanceTwo)
    byId('interest-only-balance-one').textContent = formatMoney(
      plan.mortgagePrincipal
    )
    byId('interest-only-balance-two').textContent = formatMoney(
      plan.mortgagePrincipal
    )
    byId('interest-only-balance-end').textContent = formatMoney(
      plan.mortgagePrincipal
    )

    byId('result-total-monthly').textContent = `${formatMoney(
      plan.monthlyHomeCost
    )} a month`
    byId('result-surprise').textContent = `${formatMoney(
      surprise
    )} sits beyond the mortgage for bills, repairs${
      plan.monthlySharedRent ? ', rent' : ''
    }${plan.serviceCharge ? ' and service charges' : ''}.`

    const status = byId('plan-status')
    const isOverBudget = plan.monthlyMortgageHeadroom < 0
    status.classList.toggle('is-over', isOverBudget)
    status.textContent = isOverBudget
      ? `${formatMoney(
          Math.abs(plan.monthlyMortgageHeadroom)
        )} over your mortgage comfort figure`
      : `${formatMoney(
          plan.monthlyMortgageHeadroom
        )} inside your mortgage comfort figure`

    byId('result-timeline').textContent = formatTimeline(
      plan.monthsToCashNeeded
    )
    byId('result-timeline-detail').textContent = `${formatMoney(
      plan.cashNeeded
    )} target, ${formatMoney(input.depositSaved)} saved`
    byId('result-mortgage-payment').textContent = `${formatMoney(
      plan.monthlyMortgagePayment
    )}/mo`
    byId('result-loan').textContent = `${formatMoney(
      plan.mortgagePrincipal
    )} ${isInterestOnly ? 'interest-only' : 'repayment'} mortgage`
    byId('result-cash-needed').textContent = formatMoney(plan.cashNeeded)
    byId('result-cash-shortfall').textContent = `${formatMoney(
      plan.cashShortfall
    )} still to build`
    byId('result-property-tax').textContent = formatMoney(plan.propertyTax)
    byId('result-tax-note').textContent = taxNote(
      region,
      firstTimeBuyer,
      ownershipType
    )

    byId('breakdown-mortgage').textContent = formatMoney(
      plan.monthlyMortgagePayment
    )
    byId('breakdown-mortgage-label').textContent = isInterestOnly
      ? 'Interest-only payment'
      : 'Mortgage repayment'
    byId('breakdown-rent-row').hidden = plan.monthlySharedRent === 0
    byId('breakdown-rent').textContent = formatMoney(plan.monthlySharedRent)
    byId('breakdown-maintenance').textContent = formatMoney(
      plan.monthlyMaintenance
    )
    byId('breakdown-bills').textContent = formatMoney(plan.monthlyBills)
    byId('breakdown-service').textContent = formatMoney(plan.serviceCharge)
    byId('breakdown-deposit').textContent = formatMoney(plan.depositRequired)
    byId('breakdown-tax').textContent = formatMoney(plan.propertyTax)
    byId('breakdown-buying-fees').textContent = formatMoney(input.buyingFees)
    byId('breakdown-furnishings').textContent = formatMoney(
      input.furnishingBudget
    )
    byId('breakdown-cash-total').textContent = formatMoney(plan.cashNeeded)

    const borrowingCopy = byId('borrowing-copy')
    if (plan.incomeBorrowingEstimate === null) {
      borrowingCopy.textContent =
        'You skipped income, so this plan does not estimate a lender-style borrowing ceiling.'
    } else {
      const difference = plan.incomeBorrowingEstimate - plan.mortgagePrincipal
      borrowingCopy.textContent =
        difference >= 0
          ? `The mortgage is ${formatMoney(
              difference
            )} below a rough 4.5× income estimate. Lenders still check spending, debts and circumstances.`
          : `The mortgage is ${formatMoney(
              Math.abs(difference)
            )} above a rough 4.5× income estimate. A lender may offer less than this plan needs.`
    }

    document.querySelector('.shared-ownership-lever').hidden =
      ownershipType !== 'shared'
    renderScenarios(input, input.depositPercent)
  }

  const prepareResults = () => {
    const propertyType = checkedValue('propertyType')
    const ownershipType = checkedValue('ownershipType')

    const homePrice = byId('home-price').value || '300000'
    byId('lever-home-price').value = homePrice
    syncHomePriceRange(homePrice)
    byId('lever-deposit').value = '10'
    byId('lever-rate').value = '5'
    byId('lever-term').value = '30'
    byId('lever-shared-percent').value = '40'
    byId('lever-maintenance').value = '1'
    byId('lever-bills').value = '425'
    byId('lever-service').value =
      propertyType === 'flat' || ownershipType === 'shared' ? '200' : '0'
    byId('lever-furnishings').value =
      propertyType === 'house'
        ? '8000'
        : propertyType === 'flat'
          ? '6000'
          : '7000'
    byId('lever-buying-fees').value = '4000'
    byId('repayment-method-repayment').checked = true
    byId('rate-type-fixed').checked = true
    byId('tax-rates-date').textContent =
      `Property tax assumptions checked ${PROPERTY_TAX_UPDATED_AT}.`
    renderPlan()
  }

  const captureCompletion = () => {
    if (!window.posthog || typeof window.posthog.capture !== 'function') return

    const region = checkedValue('region')
    window.posthog.capture('home_planner_completed', {
      first_time_status: checkedValue('firstTimeBuyer'),
      location_status: region === 'not-sure' ? 'not_sure' : 'known',
      ownership_type: checkedValue('ownershipType'),
      property_type: checkedValue('propertyType'),
    })
  }

  byId('planner-start').addEventListener('click', (event) => {
    event.preventDefault()
    showStage('savings', 'deposit-saved')
  })

  byId('savings-next').addEventListener('click', () => {
    if (validateStep('savings')) showStage('home', 'home-heading')
  })

  byId('home-next').addEventListener('click', () => {
    if (validateStep('home')) showStage('buying', 'buying-heading')
  })

  byId('buying-next').addEventListener('click', () => {
    showStage('budget', 'budget-heading')
  })

  byId('budget-next').addEventListener('click', () => {
    if (!validateStep('budget')) return

    prepareResults()
    captureCompletion()
    showStage('results', 'results-heading')
  })

  document.querySelectorAll('[data-back]').forEach((button) => {
    button.addEventListener('click', () => {
      const previous = button.dataset.back
      const focusId =
        previous === 'intro'
          ? 'planner-start'
          : previous === 'savings'
            ? 'savings-next'
            : previous === 'home'
              ? 'home-next'
              : 'buying-next'
      showStage(previous, focusId)
    })
  })

  byId('results-back').addEventListener('click', () => {
    showStage('budget', 'budget-next')
  })

  byId('home-price-not-sure').addEventListener('change', (event) => {
    byId('home-price').readOnly = event.currentTarget.checked
    if (event.currentTarget.checked) byId('home-price').value = '300000'
  })

  byId('income-not-sure').addEventListener('change', (event) => {
    byId('annual-income').readOnly = event.currentTarget.checked
    if (event.currentTarget.checked) byId('annual-income').value = ''
  })

  document
    .querySelectorAll(
      '.lever-panel input[type="range"]:not(#lever-home-price-range)'
    )
    .forEach((input) => input.addEventListener('input', renderPlan))

  document
    .querySelectorAll('[name="repaymentMethod"], [name="rateType"]')
    .forEach((input) => input.addEventListener('change', renderPlan))

  const syncHomePriceRange = (homePrice) => {
    homePriceRange.value = String(homePriceToSlider(homePrice, homePriceLimits))
    homePriceRange.setAttribute('aria-valuetext', formatMoney(homePrice))
  }

  exactHomePrice.addEventListener('input', () => {
    if (!exactHomePrice.value || !exactHomePrice.checkValidity()) return

    syncHomePriceRange(exactHomePrice.value)
    renderPlan()
  })

  exactHomePrice.addEventListener('change', () => {
    const homePrice = clampNumber(
      exactHomePrice.value,
      homePriceLimits.min,
      homePriceLimits.max
    )
    exactHomePrice.value = String(homePrice)
    syncHomePriceRange(homePrice)
    renderPlan()
  })

  homePriceRange.addEventListener('input', () => {
    const homePrice = sliderToHomePrice(homePriceRange.value, homePriceLimits)
    exactHomePrice.value = String(homePrice)
    homePriceRange.setAttribute('aria-valuetext', formatMoney(homePrice))
    renderPlan()
  })

  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      byId('home-price').readOnly = false
      byId('annual-income').readOnly = false
      showStage('intro', 'planner-start')
    })
  })

  updateIcons()
  showStage('intro')
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePlanner)
} else {
  initializePlanner()
}
