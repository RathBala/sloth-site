import { initializePlannerSliders } from './home-planner-sliders.js'
import { initializePlanSheet } from './home-planner-sheet.js'
import {
  calculateHomePlan,
  calculateMortgageBalance,
  PROPERTY_TAX_UPDATED_AT,
} from './home-planner-calculator.mjs'

const stageNames = ['intro', 'savings', 'home', 'buying', 'budget', 'results']
const stageRoutes = {
  budget: 'budget',
  buying: 'route',
  home: 'home',
  intro: '',
  results: 'plan',
  savings: 'deposit',
}
const routeStages = new Map(
  Object.entries(stageRoutes).map(([stage, route]) => [route, stage])
)
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
const formatList = (items) => {
  if (items.length <= 1) return items[0] || ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
}
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

const homePriceIncrement = (rawPrice) =>
  rawPrice < 500000
    ? 5000
    : rawPrice < 2000000
      ? 10000
      : rawPrice < 5000000
        ? 25000
        : rawPrice < 10000000
          ? 50000
          : 100000

const sliderToHomePrice = (value, limits) => {
  const position = clampNumber(value, 0, limits.sliderMax)
  const scale = Math.log(limits.max / limits.min)
  const rawPrice = limits.min * Math.exp((position / limits.sliderMax) * scale)
  const rounding = homePriceIncrement(rawPrice)

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
  const savingStartMonth = byId('saving-start-month')
  const wizardHomePrice = byId('home-price')
  const exactHomePrice = byId('lever-home-price')
  const homePriceRange = byId('lever-home-price-range')
  const plannerContent = document.querySelector('.planner-content')
  const progress = document.querySelector('.planner-progress')
  const stages = new Map(
    stageNames.map((name) => [name, byId(`planner-${name}`)])
  )
  let plannerHistoryPosition = Number(history.state?.plannerPosition || 0)
  let pendingBackFocus = null
  const requiredElements = [
    form,
    savingStartMonth,
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

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  savingStartMonth.min = currentMonth
  savingStartMonth.value = currentMonth
  savingStartMonth.addEventListener('input', () => {
    const validMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(savingStartMonth.value)
    savingStartMonth.setCustomValidity(
      validMonth && savingStartMonth.value >= currentMonth
        ? ''
        : 'Choose this month or a future month.'
    )
  })

  exactHomePrice.min = wizardHomePrice.min
  exactHomePrice.max = wizardHomePrice.max
  const homePriceLimits = {
    max: Number(wizardHomePrice.max),
    min: Number(wizardHomePrice.min),
    sliderMax: Number(homePriceRange.max),
  }

  const readHomePrice = () => wizardHomePrice.value.replaceAll(',', '')

  const formatHomePrice = () => {
    const raw = wizardHomePrice.value
    const caret = wizardHomePrice.selectionStart ?? raw.length
    const digitsBeforeCaret = raw.slice(0, caret).replaceAll(',', '').length
    const digits = readHomePrice()
    const validDigits = /^\d*$/.test(digits)
    if (validDigits) {
      const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      wizardHomePrice.value = formatted
      let position = 0
      let seen = 0
      while (position < formatted.length && seen < digitsBeforeCaret) {
        if (formatted[position] !== ',') seen += 1
        position += 1
      }
      wizardHomePrice.setSelectionRange(position, position)
    }
    const value = Number(digits)
    wizardHomePrice.setCustomValidity(
      validDigits &&
        digits &&
        value >= homePriceLimits.min &&
        value <= homePriceLimits.max
        ? ''
        : 'Enter a whole-pound price between £25,000 and £20,000,000.'
    )
  }

  wizardHomePrice.addEventListener('input', formatHomePrice)
  wizardHomePrice.addEventListener('beforeinput', (event) => {
    const start = wizardHomePrice.selectionStart
    const end = wizardHomePrice.selectionEnd
    if (start !== end) return
    if (
      event.inputType === 'deleteContentBackward' &&
      wizardHomePrice.value[start - 1] === ','
    ) {
      event.preventDefault()
      wizardHomePrice.setRangeText('', start - 2, start, 'end')
      formatHomePrice()
    } else if (
      event.inputType === 'deleteContentForward' &&
      wizardHomePrice.value[start] === ','
    ) {
      event.preventDefault()
      wizardHomePrice.setRangeText('', start, start + 2, 'end')
      formatHomePrice()
    }
  })
  formatHomePrice()

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

  const stageFromLocation = () =>
    routeStages.get(location.hash.replace(/^#/, '')) || 'intro'

  const stageUrl = (name) => {
    const route = stageRoutes[name]
    return `${location.pathname}${location.search}${route ? `#${route}` : ''}`
  }

  const updateStageRoute = (name, mode = 'push') => {
    if (mode === 'push') plannerHistoryPosition += 1

    history[mode === 'push' ? 'pushState' : 'replaceState'](
      { plannerPosition: plannerHistoryPosition, plannerStage: name },
      '',
      stageUrl(name)
    )
  }

  const navigateToStage = (name, focusId, mode = 'push') => {
    showStage(name, focusId)
    updateStageRoute(name, mode)
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
    savingStartMonth: savingStartMonth.value,
    ownershipType: checkedValue('ownershipType'),
    partRepaymentPercent: inputNumber('part-repayment-percent'),
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

  let sheet
  const renderPlan = (event) => {
    const input = plannerInput()
    const plan = calculateHomePlan(input)
    syncHomePriceRange(input.homePrice)
    const ownershipType = checkedValue('ownershipType')
    const firstTimeBuyer = checkedValue('firstTimeBuyer')
    const region = checkedValue('region')
    const surprise = Math.max(
      0,
      plan.monthlyHomeCost - plan.monthlyMortgagePayment
    )
    const rateType = checkedValue('rateType')
    const trackerExampleRate = input.annualInterestRate + 1
    const trackerExamplePlan = calculateHomePlan({
      ...input,
      annualInterestRate: trackerExampleRate,
    })
    const isInterestOnly = plan.repaymentMethod === 'interest-only'
    const isPartAndPart = plan.repaymentMethod === 'part-and-part'
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
    const partAndPartBalanceOne =
      calculateMortgageBalance(
        plan.partRepaymentPrincipal,
        input.annualInterestRate,
        input.termYears,
        balanceYearOne
      ) + plan.partInterestOnlyPrincipal
    const partAndPartBalanceTwo =
      calculateMortgageBalance(
        plan.partRepaymentPrincipal,
        input.annualInterestRate,
        input.termYears,
        balanceYearTwo
      ) + plan.partInterestOnlyPrincipal

    byId('result-deposit-percent').textContent =
      `${Number(input.depositPercent.toFixed(2))}%`
    const depositAmount = byId('lever-deposit-amount')
    byId('lever-deposit').setAttribute(
      'aria-valuetext',
      formatMoney(plan.depositRequired)
    )
    depositAmount.max = String(plan.purchasedValue)
    if (event?.target !== depositAmount)
      depositAmount.value = String(Math.round(plan.depositRequired))
    document.querySelectorAll('[data-lever]').forEach((field) => {
      if (event?.target !== field) field.value = byId(field.dataset.lever).value
    })
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
    byId('part-and-part-option-payment').textContent = `${formatMoney(
      plan.monthlyPartAndPartPayment
    )}/mo`
    byId('repayment-option-balance').textContent = '£0 left at the end'
    byId('interest-only-option-balance').textContent = `${formatMoney(
      plan.mortgagePrincipal
    )} left at the end`
    byId('part-and-part-option-balance').textContent = `${formatMoney(
      plan.partInterestOnlyPrincipal
    )} left at the end`
    byId('part-repayment-percent-output').textContent =
      `${plan.partRepaymentPercent}%`
    byId('part-and-part-control').hidden = !isPartAndPart
    byId('rate-type-explanation').textContent =
      rateType === 'tracker'
        ? 'A tracker follows another rate, so your payment can rise or fall.'
        : 'A fixed rate usually stays set for the deal period.'

    document.querySelector('.shared-ownership-lever').hidden =
      ownershipType !== 'shared'
    if (sheet?.update(plan)) return

    byId('rate-impact-label').textContent =
      rateType === 'tracker'
        ? '+1 percentage point example'
        : 'Your current assumption'
    byId('rate-impact-value').textContent = `${formatMoney(
      rateType === 'tracker'
        ? trackerExamplePlan.monthlyMortgagePayment
        : plan.monthlyMortgagePayment
    )}/mo at ${
      rateType === 'tracker'
        ? trackerExampleRate.toFixed(1)
        : input.annualInterestRate.toFixed(1)
    }%`
    byId('balance-comparison-term').textContent =
      `${input.termYears}-year term at ${input.annualInterestRate.toFixed(1)}%`
    document.querySelectorAll('[data-balance-year]').forEach((label) => {
      label.textContent = `Year ${label.dataset.balanceYear === 'one' ? balanceYearOne : balanceYearTwo}`
    })
    byId('repayment-balance-one').textContent = formatMoney(repaymentBalanceOne)
    byId('repayment-balance-two').textContent = formatMoney(repaymentBalanceTwo)
    byId('part-and-part-balance-one').textContent = formatMoney(
      partAndPartBalanceOne
    )
    byId('part-and-part-balance-two').textContent = formatMoney(
      partAndPartBalanceTwo
    )
    byId('part-and-part-balance-end').textContent = formatMoney(
      plan.partInterestOnlyPrincipal
    )
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
    byId('result-assumptions').textContent =
      `${formatMoney(input.homePrice)} home · ${Number(input.depositPercent.toFixed(2))}% deposit`
    const extraCosts = ['bills and repairs']
    if (plan.monthlySharedRent) extraCosts.push('rent')
    if (plan.serviceCharge) extraCosts.push('service charges')
    byId('result-surprise').textContent = `${formatMoney(
      surprise
    )} sits beyond the mortgage for ${formatList(extraCosts)}.`

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
    byId('result-timeline-detail').textContent =
      `${formatMoney(
        plan.cashNeeded
      )} target, ${formatMoney(input.depositSaved)} saved` +
      (plan.cashShortfall > 0 && plan.monthsUntilSaving > 0
        ? `. Includes ${formatTimeline(plan.monthsUntilSaving)} before saving starts.`
        : '')
    byId('result-mortgage-payment').textContent = `${formatMoney(
      plan.monthlyMortgagePayment
    )}/mo`
    byId('result-loan').textContent = `${formatMoney(plan.mortgagePrincipal)} ${
      isInterestOnly
        ? 'interest-only'
        : isPartAndPart
          ? 'part-and-part'
          : 'repayment'
    } mortgage`
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
      : isPartAndPart
        ? 'Part-and-part payment'
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

    renderScenarios(input, input.depositPercent)
  }

  const prepareResults = () => {
    const propertyType = checkedValue('propertyType')
    const ownershipType = checkedValue('ownershipType')

    const homePrice = readHomePrice() || '300000'
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
    byId('part-repayment-percent').value = '50'
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

  const stageEntryFocus = {
    budget: 'budget-heading',
    buying: 'buying-heading',
    home: 'home-heading',
    intro: 'planner-start',
    results: 'results-heading',
    savings: 'savings-heading',
  }

  const navigateBack = (name, focusId) => {
    if (plannerHistoryPosition > 0) {
      pendingBackFocus = focusId
      history.back()
      return
    }

    navigateToStage(name, focusId, 'replace')
  }

  window.addEventListener('popstate', (event) => {
    const name = stageFromLocation()
    plannerHistoryPosition = Number(event.state?.plannerPosition || 0)
    if (name === 'results') prepareResults()
    showStage(name, pendingBackFocus || stageEntryFocus[name])
    pendingBackFocus = null
  })

  byId('planner-start').addEventListener('click', (event) => {
    event.preventDefault()
    navigateToStage('savings', 'deposit-saved')
  })

  byId('savings-next').addEventListener('click', () => {
    if (validateStep('savings')) navigateToStage('home', 'home-heading')
  })

  byId('home-next').addEventListener('click', () => {
    if (validateStep('home')) navigateToStage('buying', 'buying-heading')
  })

  byId('buying-next').addEventListener('click', () => {
    navigateToStage('budget', 'budget-heading')
  })

  byId('budget-next').addEventListener('click', () => {
    if (!validateStep('budget')) return

    prepareResults()
    captureCompletion()
    navigateToStage('results', 'results-heading')
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
      navigateBack(previous, focusId)
    })
  })

  byId('show-monthly-breakdown').addEventListener('click', () => {
    const heading = byId('monthly-breakdown-title')
    heading.focus({ preventScroll: true })
    heading.closest('.breakdown-card').scrollIntoView({ block: 'start' })
  })

  byId('results-back').addEventListener('click', () => {
    navigateBack('budget', 'budget-next')
  })

  byId('home-price-not-sure').addEventListener('change', (event) => {
    byId('home-price').readOnly = event.currentTarget.checked
    if (event.currentTarget.checked) wizardHomePrice.value = '300,000'
    formatHomePrice()
  })

  byId('income-not-sure').addEventListener('change', (event) => {
    byId('annual-income').readOnly = event.currentTarget.checked
    if (event.currentTarget.checked) byId('annual-income').value = ''
  })

  byId('mortgage-budget-not-sure').addEventListener('change', (event) => {
    byId('mortgage-budget').readOnly = event.currentTarget.checked
    if (event.currentTarget.checked) byId('mortgage-budget').value = '1500'
  })

  document
    .querySelectorAll(
      '.lever-panel input[type="range"]:not(#lever-home-price-range)'
    )
    .forEach((input) => input.addEventListener('input', renderPlan))

  document
    .querySelectorAll('[name="repaymentMethod"], [name="rateType"]')
    .forEach((input) => input.addEventListener('change', renderPlan))

  byId('part-repayment-percent').addEventListener('input', renderPlan)

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
      formatHomePrice()
      byId('annual-income').readOnly = false
      byId('mortgage-budget').readOnly = false
      navigateToStage('intro', 'planner-start', 'replace')
    })
  })

  document.querySelectorAll('[data-lever]').forEach((field) => {
    field.addEventListener('input', (event) => {
      if (!field.value || !field.checkValidity()) return
      byId(field.dataset.lever).value = field.value
      renderPlan(event)
    })
  })

  const depositRange = byId('lever-deposit')
  const setDepositCash = (cash, purchasedValue) => {
    const amount = clampNumber(cash, 0, purchasedValue)
    depositRange.value = String(
      purchasedValue ? (amount / purchasedValue) * 100 : 0
    )
  }
  initializePlannerSliders({
    'lever-deposit': {
      snap: () => {
        const plan = calculateHomePlan(plannerInput())
        // Preserve both endpoints, including a purchase share below £1,000.
        if (Number(depositRange.value) === 100) return
        setDepositCash(
          Math.round(plan.depositRequired / 1000) * 1000,
          plan.purchasedValue
        )
      },
      adjust: (direction) => {
        const plan = calculateHomePlan(plannerInput())
        const cash = Math.round(plan.depositRequired)
        const next =
          direction > 0
            ? Math.floor(cash / 1000) + 1
            : Math.ceil(cash / 1000) - 1
        setDepositCash(next * 1000, plan.purchasedValue)
        renderPlan()
      },
    },
    'lever-home-price-range': {
      adjust: (direction) => {
        const price = Number(exactHomePrice.value)
        const increment = homePriceIncrement(price - (direction < 0 ? 1 : 0))
        const next =
          direction > 0
            ? Math.floor(price / increment) + 1
            : Math.ceil(price / increment) - 1
        exactHomePrice.value = String(
          clampNumber(
            next * increment,
            homePriceLimits.min,
            homePriceLimits.max
          )
        )
        exactHomePrice.dispatchEvent(new Event('input', { bubbles: true }))
      },
    },
  })
  sheet = initializePlanSheet({ renderPlan, formatMoney })
  byId('lever-deposit-amount').addEventListener('input', (event) => {
    const field = event.currentTarget
    if (!field.value || !field.checkValidity()) return
    const purchasedValue = calculateHomePlan(plannerInput()).purchasedValue
    byId('lever-deposit').value = String(
      purchasedValue ? (Number(field.value) / purchasedValue) * 100 : 0
    )
    renderPlan(event)
  })

  updateIcons()
  const initialStage = stageFromLocation()
  if (initialStage === 'results') prepareResults()
  showStage(initialStage)
  updateStageRoute(initialStage, 'replace')
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePlanner)
} else {
  initializePlanner()
}
