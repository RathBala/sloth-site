// Native ranges own their steps; money ranges supply cash-based adjustments.
export function initializePlannerSliders(custom = {}) {
  document
    .querySelectorAll('#planner-results input[type="range"]')
    .forEach((range) => {
      const row = range.closest('.lever-row, .part-and-part-control')
      const name = row.querySelector('label').textContent.trim()
      const control = document.createElement('div')
      control.className = 'planner-slider-control'
      range.before(control)

      const adjust = (direction) => {
        if (custom[range.id]?.adjust) {
          custom[range.id].adjust(direction)
        } else {
          if (direction > 0) range.stepUp()
          else range.stepDown()
          range.dispatchEvent(new Event('input', { bubbles: true }))
        }
      }

      for (const direction of [-1, 1]) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'planner-slider-step'
        button.setAttribute(
          'aria-label',
          `${direction > 0 ? 'Increase' : 'Decrease'} ${name}`
        )
        const icon = document.createElement('i')
        icon.dataset.lucide = direction > 0 ? 'plus' : 'minus'
        icon.setAttribute('aria-hidden', 'true')
        button.append(icon)
        button.addEventListener('click', () => adjust(direction))
        control.append(button)
        if (direction < 0) control.append(range)
      }

      if (custom[range.id]?.snap) {
        range.addEventListener('input', custom[range.id].snap, {
          capture: true,
        })
      }
      if (custom[range.id]?.adjust) {
        range.addEventListener('keydown', (event) => {
          const direction = {
            ArrowLeft: -1,
            ArrowDown: -1,
            ArrowRight: 1,
            ArrowUp: 1,
          }[event.key]
          if (!direction) return
          event.preventDefault()
          adjust(direction)
        })
      }
    })
}
