import assert from 'node:assert/strict'

export async function checkPlannerSheet(page) {
  const open = page.locator('#open-plan-sheet')
  const sheet = page.locator('#plan-sheet')
  const total = page.locator('#result-total-monthly')
  const original = await total.textContent()
  const originalDeposit = await page.locator('#deposit-target').inputValue()
  const balance = page.locator('.balance-comparison')
  const originalBalance = await balance.textContent()
  assert(await open.isVisible(), 'adjust action must be visible on arrival')
  const dock = await page.locator('.plan-dock').boundingBox()
  assert(dock.y >= 0 && dock.y + dock.height <= 845)
  await page.evaluate(() => scrollTo(0, 550))
  const scroll = await page.evaluate(() => scrollY)
  await open.click()
  assert(await sheet.isVisible())
  assert.equal(
    await sheet.locator('.balance-comparison, .rate-impact').count(),
    0,
    'detailed projections belong to results, not the control sheet'
  )
  assert.equal(
    await page.locator('#planner-results .balance-comparison').count(),
    1,
    'keep one canonical projection on the results page'
  )
  await sheet.evaluate((dialog) => {
    dialog.scrollTop = 48
  })
  assert.equal(
    await sheet.evaluate((dialog) => dialog.scrollTop),
    0,
    'only the controls region may scroll; header and Apply must stay pinned'
  )
  await page.evaluate(() => {
    Object.defineProperty(visualViewport, 'height', {
      configurable: true,
      value: 420,
    })
    Object.defineProperty(visualViewport, 'offsetTop', {
      configurable: true,
      value: 80,
    })
    visualViewport.dispatchEvent(new Event('resize'))
  })
  const keyboardFooter = await page.locator('.plan-sheet-footer').boundingBox()
  assert(
    keyboardFooter.y + keyboardFooter.height <= 501,
    'Apply must remain above the on-screen keyboard'
  )
  await page.evaluate(() => {
    delete visualViewport.height
    delete visualViewport.offsetTop
    visualViewport.dispatchEvent(new Event('resize'))
  })
  await page.locator('#lever-deposit').fill('12.3456')
  assert.equal(
    await page.locator('#lever-deposit-amount').inputValue(),
    '37000',
    'dragging the deposit snaps to whole £1,000 amounts'
  )
  await page
    .getByRole('button', { name: 'Increase Deposit target', exact: true })
    .click()
  assert.equal(
    await page.locator('#lever-deposit-amount').inputValue(),
    '38000'
  )
  await page.locator('#lever-deposit').press('ArrowLeft')
  assert.equal(
    await page.locator('#lever-deposit-amount').inputValue(),
    '37000',
    'keyboard uses the same £1,000 increment'
  )
  await page.locator('#lever-deposit-amount').fill('12345')
  assert.equal(
    await page.locator('#sheet-deposit').textContent(),
    '£12,345',
    'exact entry must not be rounded to slider steps'
  )
  await page
    .getByRole('button', { name: 'Increase Home price', exact: true })
    .click()
  assert.equal(
    await page.locator('#lever-home-price').inputValue(),
    '305000',
    'home price advances one meaningful band step'
  )
  await page
    .getByRole('button', { name: 'Decrease Home price', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Increase Interest rate', exact: true })
    .click()
  assert.equal(await page.locator('#exact-rate').inputValue(), '5.1')
  await page
    .getByRole('button', { name: 'Decrease Interest rate', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Increase Mortgage term', exact: true })
    .click()
  assert.equal(await page.locator('#exact-term').inputValue(), '31')
  await page
    .getByRole('button', { name: 'Decrease Mortgage term', exact: true })
    .click()
  const depositButtons = await page
    .locator('#lever-deposit')
    .evaluate((range) => {
      const [minus, , plus] = range.parentElement.children
      const boxes = [minus, range, plus].map((node) =>
        node.getBoundingClientRect()
      )
      return boxes.map(({ x, y, width, height }) => ({ x, y, width, height }))
    })
  assert(depositButtons[0].width >= 44 && depositButtons[2].width >= 44)
  assert(depositButtons[0].x + depositButtons[0].width < depositButtons[1].x)
  assert(depositButtons[1].x + depositButtons[1].width < depositButtons[2].x)
  assert.equal(depositButtons[0].y, depositButtons[2].y)
  for (const [id, label, increment] of [
    ['lever-maintenance', 'Yearly repair cushion', 0.25],
    ['lever-bills', 'Bills and insurance', 25],
    ['lever-service', 'Service charge', 25],
    ['lever-furnishings', 'Furnishings', 500],
    ['lever-buying-fees', 'Legal, survey and moving', 500],
  ]) {
    const before = Number(await page.locator(`#${id}`).inputValue())
    await page
      .getByRole('button', { name: `Increase ${label}`, exact: true })
      .click()
    assert.equal(
      Number(await page.locator(`#${id}`).inputValue()),
      before + increment
    )
    await page
      .getByRole('button', { name: `Decrease ${label}`, exact: true })
      .click()
  }
  await page.locator('#lever-home-price').fill('1000000')
  await page
    .getByRole('button', { name: 'Increase Home price', exact: true })
    .click()
  assert.equal(await page.locator('#lever-home-price').inputValue(), '1010000')
  await page.locator('#lever-home-price').fill('300005')
  await page.locator('#lever-deposit').fill('100')
  assert.equal(
    await page.locator('#lever-deposit-amount').inputValue(),
    '300005',
    '100% remains reachable between cash steps'
  )
  await page
    .getByRole('button', { name: 'Increase Deposit target', exact: true })
    .click()
  assert.equal(
    await page.locator('#lever-deposit-amount').inputValue(),
    '300005',
    'cannot exceed the purchase price'
  )
  await page
    .getByRole('button', { name: 'Decrease Deposit target', exact: true })
    .click()
  assert.equal(
    await page.locator('#lever-deposit-amount').inputValue(),
    '300000'
  )
  await page.locator('#lever-deposit').fill('0')
  await page
    .getByRole('button', { name: 'Decrease Deposit target', exact: true })
    .click()
  assert.equal(
    await page.locator('#lever-deposit-amount').inputValue(),
    '0',
    'cannot go below zero'
  )
  await page.locator('#lever-home-price').fill('300000')
  await page.locator('#lever-deposit-amount').fill('60000')
  assert.equal(
    await page.locator('#result-deposit-percent').textContent(),
    '20%'
  )
  assert.notEqual(
    await page.locator('#sheet-monthly').textContent(),
    original.replace(' a month', '')
  )
  assert.equal(
    await balance.textContent(),
    originalBalance,
    'draft edits must not update applied projections'
  )
  assert.equal(
    await total.textContent(),
    original,
    'draft must not change applied results'
  )
  const bodyTop = await page.evaluate(
    () => document.body.getBoundingClientRect().top
  )
  await page.mouse.move(4, 4)
  await page.mouse.wheel(0, 500)
  await page.evaluate(() => new Promise(requestAnimationFrame))
  assert.equal(
    await page.evaluate(() => document.body.getBoundingClientRect().top),
    bodyTop,
    'wheel input cannot move the background'
  )
  await page.locator('#apply-plan-sheet').focus()
  await page.keyboard.press('Tab')
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    'cancel-plan-sheet',
    'Tab stays inside the modal'
  )
  await page.keyboard.press('Escape')
  assert.equal(await sheet.isVisible(), false)
  assert.equal(
    await page.evaluate(() => scrollY),
    scroll,
    'closing restores page scroll'
  )
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    'open-plan-sheet'
  )
  await open.click()
  assert.equal(
    await page.locator('#lever-deposit').inputValue(),
    originalDeposit,
    'Escape discards draft'
  )
  assert.equal(
    await page.locator('#deposit-target').inputValue(),
    originalDeposit,
    'cancelled drafts must not change the wizard target'
  )
  await page.locator('#lever-deposit-amount').fill('60000')
  await page.locator('#exact-rate').fill('4')
  assert.equal(await page.locator('#lever-rate').inputValue(), '4')
  await page.locator('#exact-term').fill('25')
  assert.equal(await page.locator('#lever-term').inputValue(), '25')
  await page.locator('#apply-plan-sheet').click()
  assert.equal(
    Number(await page.locator('#deposit-target').inputValue()),
    Number(await page.locator('#lever-deposit').inputValue()),
    'Apply must carry the target back to the wizard'
  )
  assert(
    await page
      .locator('#deposit-target')
      .evaluate((input) => input.checkValidity())
  )
  assert.notEqual(await total.textContent(), original)
  assert.notEqual(
    await balance.textContent(),
    originalBalance,
    'Apply updates the results projections'
  )
  assert.equal(
    await page.locator('#balance-comparison-term').textContent(),
    '25-year term at 4.0%'
  )
  assert.equal(
    await page.locator('#breakdown-deposit').textContent(),
    '£60,000'
  )
  await open.click()
  assert.equal(
    await page.locator('#lever-deposit-amount').inputValue(),
    '60000'
  )
  await page.locator('#lever-deposit-amount').fill('99999999')
  await page.locator('#apply-plan-sheet').click()
  assert(await sheet.isVisible(), 'invalid deposit cannot be applied')
  await page.locator('#cancel-plan-sheet').click()
  await open.click()
  await page.locator('#lever-deposit').fill('10')
  await page.locator('#exact-rate').fill('5')
  await page.locator('#exact-term').fill('30')
  await page.locator('#apply-plan-sheet').click()
  await open.click()
  await page.locator('#lever-deposit').fill('30')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.waitForFunction(() => !document.querySelector('#plan-sheet').open)
  assert.equal(
    await sheet.isVisible(),
    false,
    'desktop transition closes the mobile sheet'
  )
  assert.equal(
    await page.locator('#lever-deposit').inputValue(),
    '10',
    'resize cancels draft'
  )
  assert(
    await page.locator('#lever-deposit').isVisible(),
    'desktop keeps inline controls'
  )
  await page.setViewportSize({ width: 390, height: 844 })
}
