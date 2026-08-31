import assert from 'node:assert/strict'
import test from 'node:test'

import {
  calculateHomePlan,
  calculateInterestOnlyPayment,
  calculateMortgageBalance,
  calculateMortgagePayment,
  calculatePropertyTax,
} from '../src/assets/js/home-planner-calculator.mjs'

test('calculates a repayment mortgage with monthly compounding', () => {
  assert.equal(Math.round(calculateMortgagePayment(240000, 5, 30)), 1288)
})

test('calculates the £600,000 worked example shown in the planner', () => {
  assert.equal(Math.round(calculateMortgagePayment(600000, 4, 30)), 2864)
})

test('compares repayment and interest-only costs for the same mortgage', () => {
  assert.equal(calculateInterestOnlyPayment(600000, 4), 2000)
  assert.equal(Math.round(calculateMortgageBalance(600000, 4, 30, 10)), 472704)
  assert.equal(Math.round(calculateMortgageBalance(600000, 4, 30, 20)), 282926)
  assert.equal(Math.round(calculateMortgageBalance(600000, 4, 30, 30)), 0)
})

test('uses current first-home property tax bands across the UK', () => {
  assert.equal(calculatePropertyTax(350000, 'england-ni', 'yes'), 2500)
  assert.equal(calculatePropertyTax(350000, 'england-ni', 'no'), 7500)
  assert.equal(calculatePropertyTax(200000, 'scotland', 'yes'), 500)
  assert.equal(calculatePropertyTax(200000, 'scotland', 'no'), 1100)
  assert.equal(calculatePropertyTax(300000, 'wales', 'yes'), 4500)
})

test('keeps current savings separate from future home costs', () => {
  const plan = calculateHomePlan({
    annualIncome: 60000,
    annualInterestRate: 5,
    buyingFees: 4000,
    depositPercent: 10,
    depositSaved: 10000,
    firstTimeBuyer: 'yes',
    furnishingBudget: 8000,
    homePrice: 300000,
    maintenancePercent: 1,
    monthlyBills: 425,
    monthlyMortgageBudget: 1500,
    monthlySaving: 500,
    ownershipType: 'whole',
    propertyType: 'house',
    region: 'england-ni',
    serviceCharge: 0,
    sharedOwnershipPercent: 40,
    termYears: 30,
  })

  assert.equal(plan.depositRequired, 30000)
  assert.equal(plan.propertyTax, 0)
  assert.equal(plan.cashNeeded, 42000)
  assert.equal(plan.monthsToCashNeeded, 64)
  assert.equal(Math.round(plan.mortgagePrincipal), 270000)
  assert.equal(Math.round(plan.monthlyMortgagePayment), 1449)
  assert.equal(Math.round(plan.monthlyMaintenance), 250)
  assert.equal(Math.round(plan.monthlyHomeCost), 2124)
  assert.equal(Math.round(plan.monthlyMortgageHeadroom), 51)
  assert.equal(plan.incomeBorrowingEstimate, 270000)
  assert.equal(plan.mortgageBalanceAtEnd, 0)
})

test('keeps the capital due at the end of an interest-only mortgage', () => {
  const plan = calculateHomePlan({
    annualIncome: 150000,
    annualInterestRate: 4,
    buyingFees: 4000,
    depositPercent: 40,
    depositSaved: 5000,
    firstTimeBuyer: 'no',
    furnishingBudget: 8000,
    homePrice: 1000000,
    maintenancePercent: 1,
    monthlyBills: 425,
    monthlyMortgageBudget: 3000,
    monthlySaving: 1000,
    ownershipType: 'whole',
    propertyType: 'house',
    region: 'england-ni',
    repaymentMethod: 'interest-only',
    serviceCharge: 0,
    sharedOwnershipPercent: 40,
    termYears: 30,
  })

  assert.equal(plan.mortgagePrincipal, 600000)
  assert.equal(plan.monthlyMortgagePayment, 2000)
  assert.equal(plan.monthlyRepaymentPayment.toFixed(2), '2864.49')
  assert.equal(plan.monthlyInterestOnlyPayment, 2000)
  assert.equal(plan.mortgageBalanceAtEnd, 600000)
  assert.equal(Math.round(plan.monthlyHomeCost), 3258)
  assert.equal(plan.monthlyMortgageHeadroom, 1000)
})

test('splits a part-and-part mortgage between repayment and interest-only', () => {
  const plan = calculateHomePlan({
    annualIncome: 150000,
    annualInterestRate: 4,
    buyingFees: 4000,
    depositPercent: 40,
    depositSaved: 5000,
    firstTimeBuyer: 'no',
    furnishingBudget: 8000,
    homePrice: 1000000,
    maintenancePercent: 1,
    monthlyBills: 425,
    monthlyMortgageBudget: 3000,
    monthlySaving: 1000,
    ownershipType: 'whole',
    partRepaymentPercent: 50,
    propertyType: 'house',
    region: 'england-ni',
    repaymentMethod: 'part-and-part',
    serviceCharge: 0,
    sharedOwnershipPercent: 40,
    termYears: 30,
  })

  assert.equal(plan.mortgagePrincipal, 600000)
  assert.equal(plan.partRepaymentPrincipal, 300000)
  assert.equal(plan.partInterestOnlyPrincipal, 300000)
  assert.equal(plan.monthlyPartAndPartPayment.toFixed(2), '2432.25')
  assert.equal(plan.monthlyMortgagePayment.toFixed(2), '2432.25')
  assert.equal(plan.mortgageBalanceAtEnd, 300000)
  assert.equal(Math.round(plan.monthlyHomeCost), 3691)
  assert.equal(Math.round(plan.monthlyMortgageHeadroom), 568)
})

test('shows rent on the unowned share for shared ownership', () => {
  const plan = calculateHomePlan({
    annualIncome: 50000,
    annualInterestRate: 5,
    buyingFees: 4000,
    depositPercent: 10,
    depositSaved: 10000,
    firstTimeBuyer: 'yes',
    furnishingBudget: 6000,
    homePrice: 400000,
    maintenancePercent: 1,
    monthlyBills: 425,
    monthlyMortgageBudget: 1000,
    monthlySaving: 500,
    ownershipType: 'shared',
    propertyType: 'flat',
    region: 'england-ni',
    serviceCharge: 200,
    sharedOwnershipPercent: 40,
    termYears: 30,
  })

  assert.equal(plan.purchasedValue, 160000)
  assert.equal(plan.depositRequired, 16000)
  assert.equal(plan.mortgagePrincipal, 144000)
  assert.equal(Math.round(plan.monthlySharedRent), 550)
  assert.equal(Math.round(plan.monthlyMortgagePayment), 773)
  assert.equal(Math.round(plan.monthlyHomeCost), 2281)
})

test('reports no finite savings timeline when monthly saving is zero', () => {
  const plan = calculateHomePlan({
    annualIncome: 0,
    annualInterestRate: 5,
    buyingFees: 4000,
    depositPercent: 10,
    depositSaved: 0,
    firstTimeBuyer: 'not-sure',
    furnishingBudget: 5000,
    homePrice: 250000,
    maintenancePercent: 1,
    monthlyBills: 425,
    monthlyMortgageBudget: 1200,
    monthlySaving: 0,
    ownershipType: 'whole',
    propertyType: 'not-sure',
    region: 'not-sure',
    serviceCharge: 0,
    sharedOwnershipPercent: 40,
    termYears: 30,
  })

  assert.equal(plan.monthsToCashNeeded, Number.POSITIVE_INFINITY)
  assert.equal(plan.incomeBorrowingEstimate, null)
})
