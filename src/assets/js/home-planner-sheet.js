// The existing controls move between the desktop layout and the mobile dialog.
// Draft values live only while the dialog is open; no financial data is stored.
export function initializePlanSheet({ renderPlan, formatMoney }) {
  const byId = (id) => document.getElementById(id)
  const dialog = byId('plan-sheet')
  const trigger = byId('open-plan-sheet')
  const content = byId('plan-sheet-controls')
  const mobile = matchMedia('(max-width: 62rem)')
  const sections = ['.lever-panel', '.mortgage-choice-card'].map((selector) => {
    const element = document.querySelector(selector)
    const anchor = document.createComment('Desktop controls position')
    element.before(anchor)
    return { element, anchor }
  })
  let draft = null
  let restoreScroll = null
  const syncViewport = () => {
    if (!dialog.open || !window.visualViewport) return
    // Phone keyboards shrink the visible viewport without resizing the layout.
    dialog.style.setProperty(
      '--sheet-visible-height',
      `${visualViewport.height}px`
    )
    dialog.style.setProperty(
      '--sheet-visible-top',
      `${visualViewport.offsetTop}px`
    )
  }
  window.visualViewport?.addEventListener('resize', syncViewport)
  window.visualViewport?.addEventListener('scroll', syncViewport)

  const close = (apply = false) => {
    if (!draft) return
    if (!apply) {
      draft.forEach(({ input, value, checked }) => {
        input.value = value
        input.checked = checked
      })
    }
    draft = null
    dialog.close()
    restoreScroll?.()
    restoreScroll = null
    renderPlan()
    trigger.focus({ preventScroll: true })
  }

  const placeControls = () => {
    close()
    sections.forEach(({ element, anchor }) => {
      if (mobile.matches) content.append(element)
      else anchor.after(element)
    })
  }
  mobile.addEventListener('change', placeControls)
  placeControls()

  trigger.addEventListener('click', () => {
    if (!mobile.matches || draft) return
    draft = [...content.querySelectorAll('input')].map((input) => ({
      input,
      value: input.value,
      checked: input.checked,
    }))
    const top = scrollY
    const left = scrollX
    const properties = ['position', 'top', 'left', 'width', 'overflow']
    const saved = properties.map((property) => [
      property,
      document.body.style.getPropertyValue(property),
      document.body.style.getPropertyPriority(property),
    ])
    const htmlOverflow = document.documentElement.style.overflow
    const htmlOverflowPriority =
      document.documentElement.style.getPropertyPriority('overflow')
    Object.assign(document.body.style, {
      position: 'fixed',
      top: `-${top}px`,
      left: `-${left}px`,
      width: '100%',
      overflow: 'hidden',
    })
    document.documentElement.style.overflow = 'hidden'
    restoreScroll = () => {
      saved.forEach(([property, value, priority]) => {
        if (value) document.body.style.setProperty(property, value, priority)
        else document.body.style.removeProperty(property)
      })
      if (htmlOverflow)
        document.documentElement.style.setProperty(
          'overflow',
          htmlOverflow,
          htmlOverflowPriority
        )
      else document.documentElement.style.removeProperty('overflow')
      window.scrollTo({ top, left, behavior: 'instant' })
    }
    dialog.showModal()
    syncViewport()
    content.scrollTop = 0
    byId('plan-sheet-heading').focus()
    renderPlan()
  })
  byId('cancel-plan-sheet').addEventListener('click', () => close())
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return
    const first = byId('cancel-plan-sheet')
    const last = byId('apply-plan-sheet')
    if (
      event.shiftKey &&
      [first, byId('plan-sheet-heading')].includes(document.activeElement)
    ) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  })
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault()
    close()
  })
  byId('apply-plan-sheet').addEventListener('click', () => {
    const invalid = [...content.querySelectorAll('input')].find(
      (input) => !input.checkValidity()
    )
    if (invalid) {
      invalid.reportValidity()
      return
    }
    close(true)
  })
  window.addEventListener('popstate', () => close(), { capture: true })

  return {
    update(plan) {
      byId('sheet-monthly').textContent = formatMoney(plan.monthlyHomeCost)
      byId('sheet-deposit').textContent = formatMoney(plan.depositRequired)
      if (!draft)
        byId('dock-monthly').textContent = formatMoney(plan.monthlyHomeCost)
      return Boolean(draft)
    },
  }
}
