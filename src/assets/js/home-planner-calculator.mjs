export const PROPERTY_TAX_UPDATED_AT = '30 August 2026'

const SHARED_OWNERSHIP_RENT_PERCENT = 2.75
const INCOME_MULTIPLE = 4.5

const numberOrZero = (value) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

const progressiveTax = (price, bands) => {
  let remaining = numberOrZero(price)
  let previousLimit = 0
  let tax = 0

  for (const [limit, rate] of bands) {
    if (remaining <= 0) break

    const bandSize = Number.isFinite(limit)
      ? Math.max(0, limit - previousLimit)
      : remaining
    const taxableAmount = Math.min(remaining, bandSize)

    tax += taxableAmount * rate
    remaining -= taxableAmount
    previousLimit = limit
  }

  return Math.floor(tax)
}

export function calculateMortgagePayment(principal, annualRate, termYears) {
  const loan = numberOrZero(principal)
  const months = Math.max(1, Math.round(numberOrZero(termYears) * 12))
  const monthlyRate = numberOrZero(annualRate) / 100 / 12

  if (loan === 0) return 0
  if (monthlyRate === 0) return loan / months

  const compound = (1 + monthlyRate) ** months
  return loan * ((monthlyRate * compound) / (compound - 1))
}

export function calculateInterestOnlyPayment(principal, annualRate) {
  return (numberOrZero(principal) * numberOrZero(annualRate)) / 1200
}

export function calculateMortgageBalance(
  principal,
  annualRate,
  termYears,
  elapsedYears
) {
  const loan = numberOrZero(principal)
  const totalMonths = Math.max(1, Math.round(numberOrZero(termYears) * 12))
  const elapsedMonths = Math.min(
    totalMonths,
    Math.max(0, Math.round(numberOrZero(elapsedYears) * 12))
  )

  if (loan === 0 || elapsedMonths === totalMonths) return 0

  const monthlyPayment = calculateMortgagePayment(loan, annualRate, termYears)
  const monthlyRate = numberOrZero(annualRate) / 100 / 12

  if (monthlyRate === 0) {
    return Math.max(0, loan - monthlyPayment * elapsedMonths)
  }

  const elapsedCompound = (1 + monthlyRate) ** elapsedMonths
  return Math.max(
    0,
    loan * elapsedCompound -
      monthlyPayment * ((elapsedCompound - 1) / monthlyRate)
  )
}

export function calculatePropertyTax(price, region, firstTimeBuyer) {
  const value = numberOrZero(price)
  const isFirstTimeBuyer = firstTimeBuyer === 'yes'

  if (region === 'scotland') {
    return progressiveTax(value, [
      [isFirstTimeBuyer ? 175000 : 145000, 0],
      [250000, 0.02],
      [325000, 0.05],
      [750000, 0.1],
      [Number.POSITIVE_INFINITY, 0.12],
    ])
  }

  if (region === 'wales') {
    return progressiveTax(value, [
      [225000, 0],
      [400000, 0.06],
      [750000, 0.075],
      [1500000, 0.1],
      [Number.POSITIVE_INFINITY, 0.12],
    ])
  }

  if (isFirstTimeBuyer && value <= 500000) {
    return progressiveTax(value, [
      [300000, 0],
      [500000, 0.05],
    ])
  }

  return progressiveTax(value, [
    [125000, 0],
    [250000, 0.02],
    [925000, 0.05],
    [1500000, 0.1],
    [Number.POSITIVE_INFINITY, 0.12],
  ])
}

export function calculateHomePlan(input) {
  const homePrice = numberOrZero(input.homePrice)
  const ownershipType = input.ownershipType === 'shared' ? 'shared' : 'whole'
  const sharedOwnershipPercent = Math.min(
    75,
    Math.max(10, numberOrZero(input.sharedOwnershipPercent) || 40)
  )
  const purchasedValue =
    ownershipType === 'shared'
      ? homePrice * (sharedOwnershipPercent / 100)
      : homePrice
  const depositPercent = Math.min(
    100,
    Math.max(0, numberOrZero(input.depositPercent))
  )
  const depositRequired = purchasedValue * (depositPercent / 100)
  const mortgagePrincipal = Math.max(0, purchasedValue - depositRequired)
  const repaymentMethod =
    input.repaymentMethod === 'interest-only' ? 'interest-only' : 'repayment'
  const monthlyRepaymentPayment = calculateMortgagePayment(
    mortgagePrincipal,
    input.annualInterestRate,
    input.termYears
  )
  const monthlyInterestOnlyPayment = calculateInterestOnlyPayment(
    mortgagePrincipal,
    input.annualInterestRate
  )
  const monthlyMortgagePayment =
    repaymentMethod === 'interest-only'
      ? monthlyInterestOnlyPayment
      : monthlyRepaymentPayment
  const mortgageBalanceAtEnd =
    repaymentMethod === 'interest-only' ? mortgagePrincipal : 0
  const monthlySharedRent =
    ownershipType === 'shared'
      ? (Math.max(0, homePrice - purchasedValue) *
          (SHARED_OWNERSHIP_RENT_PERCENT / 100)) /
        12
      : 0
  const monthlyMaintenance =
    (homePrice * (numberOrZero(input.maintenancePercent) / 100)) / 12
  const monthlyBills = numberOrZero(input.monthlyBills)
  const serviceCharge = numberOrZero(input.serviceCharge)
  const monthlyHomeCost =
    monthlyMortgagePayment +
    monthlySharedRent +
    monthlyMaintenance +
    monthlyBills +
    serviceCharge
  const propertyTax = calculatePropertyTax(
    purchasedValue,
    input.region,
    input.firstTimeBuyer
  )
  const cashNeeded =
    depositRequired +
    propertyTax +
    numberOrZero(input.buyingFees) +
    numberOrZero(input.furnishingBudget)
  const cashShortfall = Math.max(
    0,
    cashNeeded - numberOrZero(input.depositSaved)
  )
  const monthlySaving = numberOrZero(input.monthlySaving)
  const monthsToCashNeeded =
    cashShortfall === 0
      ? 0
      : monthlySaving > 0
        ? Math.ceil(cashShortfall / monthlySaving)
        : Number.POSITIVE_INFINITY
  const monthlyMortgageHeadroom =
    numberOrZero(input.monthlyMortgageBudget) - monthlyMortgagePayment
  const annualIncome = numberOrZero(input.annualIncome)
  const incomeBorrowingEstimate =
    annualIncome > 0 ? annualIncome * INCOME_MULTIPLE : null

  return {
    cashNeeded,
    cashShortfall,
    depositRequired,
    incomeBorrowingEstimate,
    monthsToCashNeeded,
    monthlyBills,
    monthlyHomeCost,
    monthlyInterestOnlyPayment,
    monthlyMaintenance,
    monthlyMortgageHeadroom,
    monthlyMortgagePayment,
    monthlyRepaymentPayment,
    monthlySharedRent,
    mortgageBalanceAtEnd,
    mortgagePrincipal,
    propertyTax,
    purchasedValue,
    repaymentMethod,
    serviceCharge,
    sharedOwnershipPercent,
  }
}
