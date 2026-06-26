;(() => {
  const coupleBranches = document.getElementById('couple-archetypes')
  const coupleReveal = document.querySelector(
    '[data-archetype-reveal="couple"]'
  )
  const archetypeContent = document.querySelector('[data-archetype-content]')
  const archetypeTriggers = Array.from(
    document.querySelectorAll('[data-couple-archetype-trigger]')
  )

  if (!coupleBranches) {
    return
  }

  const branchGrid = coupleBranches.querySelector('[data-couple-branch-grid]')
  const selectionGate = coupleBranches.querySelector(
    '[data-couple-selection-gate]'
  )
  const gatedKeys = new Set([' ', 'ArrowDown', 'End', 'PageDown'])
  let touchStartY = 0
  let isEnforcingGate = false

  const hasSelectedArchetype = () =>
    Boolean(archetypeContent?.dataset.currentArchetype)

  const hideSelectionGate = () => {
    coupleBranches.classList.remove('is-gated')
    selectionGate?.setAttribute('hidden', '')
  }

  const showSelectionGate = ({ focus = false } = {}) => {
    if (!selectionGate) {
      return
    }

    selectionGate.removeAttribute('hidden')
    coupleBranches.classList.add('is-gated')

    selectionGate.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })

    if (focus) {
      selectionGate.focus({ preventScroll: true })
    }
  }

  const isGateActive = () =>
    coupleBranches.classList.contains('is-revealed') && !hasSelectedArchetype()

  const getGateBoundary = () => {
    if (!archetypeContent) {
      return Number.POSITIVE_INFINITY
    }

    const contentTop =
      archetypeContent.getBoundingClientRect().top + window.scrollY

    return Math.max(0, contentTop - Math.min(window.innerHeight * 0.28, 180))
  }

  const shouldGateForwardScroll = () =>
    isGateActive() && window.scrollY + window.innerHeight >= getGateBoundary()

  const enforceSelectionGate = ({ focus = false } = {}) => {
    if (!isGateActive() || isEnforcingGate) {
      return
    }

    isEnforcingGate = true
    showSelectionGate({ focus })

    window.requestAnimationFrame(() => {
      isEnforcingGate = false
    })
  }

  const revealBranches = () => {
    coupleBranches.classList.add('is-revealed')
    branchGrid?.removeAttribute('inert')
  }

  const previewArchetypeContent = () => {
    if (!archetypeContent) {
      return
    }

    archetypeContent.classList.remove('is-revealed')
    archetypeContent.classList.add('is-preview')
    archetypeContent.removeAttribute('data-current-archetype')
    archetypeContent.setAttribute('inert', '')
    hideSelectionGate()

    archetypeTriggers.forEach((trigger) => {
      trigger.setAttribute('aria-expanded', 'false')
      trigger.removeAttribute('aria-current')
    })
  }

  const lockBranches = () => {
    coupleBranches.classList.remove('is-revealed')
    branchGrid?.setAttribute('inert', '')
    previewArchetypeContent()
  }

  const getArchetypeFromHash = () => {
    const hash = window.location.hash.replace(/^#/, '')
    const suffix = '-content'

    if (!hash.endsWith(suffix)) {
      return ''
    }

    const archetype = hash.slice(0, -suffix.length)

    return archetypeTriggers.some(
      (trigger) => trigger.dataset.coupleArchetypeTrigger === archetype
    )
      ? archetype
      : ''
  }

  const showArchetypeContent = (
    archetype,
    { scroll = true, updateHistory = false } = {}
  ) => {
    if (!archetypeContent || !archetype) {
      return
    }

    revealBranches()
    hideSelectionGate()
    archetypeContent.classList.remove('is-preview')
    archetypeContent.classList.add('is-revealed')
    archetypeContent.removeAttribute('inert')
    archetypeContent.dataset.currentArchetype = archetype

    archetypeTriggers.forEach((trigger) => {
      const isCurrent = trigger.dataset.coupleArchetypeTrigger === archetype
      trigger.setAttribute('aria-expanded', String(isCurrent))

      if (isCurrent) {
        trigger.setAttribute('aria-current', 'true')
      } else {
        trigger.removeAttribute('aria-current')
      }
    })

    const nextHash = `#${archetype}-content`

    if (updateHistory && window.location.hash !== nextHash) {
      window.history.pushState({ currentArchetype: archetype }, '', nextHash)
    }

    if (scroll) {
      archetypeContent.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  const syncBranchesWithHash = () => {
    const archetype = getArchetypeFromHash()

    if (archetype) {
      showArchetypeContent(archetype, { scroll: false })
      return
    }

    if (window.location.hash === '#couple-archetypes') {
      revealBranches()
      previewArchetypeContent()
      return
    }

    lockBranches()
  }

  const revealAndScrollBranches = (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    revealBranches()
    previewArchetypeContent()

    if (window.location.hash !== '#couple-archetypes') {
      window.history.pushState(null, '', '#couple-archetypes')
    }

    coupleBranches.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const selectArchetype = (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    const archetype = event.currentTarget.dataset.coupleArchetypeTrigger

    event.preventDefault()
    showArchetypeContent(archetype, {
      scroll: true,
      updateHistory: true,
    })
  }

  const handleWheel = (event) => {
    if (event.deltaY <= 0 || !shouldGateForwardScroll()) {
      return
    }

    event.preventDefault()
    enforceSelectionGate()
  }

  const handleScroll = () => {
    if (!isGateActive() || window.scrollY < getGateBoundary()) {
      return
    }

    enforceSelectionGate()
  }

  const handleKeydown = (event) => {
    if (!gatedKeys.has(event.key) || !shouldGateForwardScroll()) {
      return
    }

    event.preventDefault()
    enforceSelectionGate({ focus: true })
  }

  const handleTouchStart = (event) => {
    touchStartY = event.touches[0]?.clientY ?? 0
  }

  const handleTouchMove = (event) => {
    const touchY = event.touches[0]?.clientY ?? touchStartY
    const isMovingForward = touchStartY - touchY > 0

    if (!isMovingForward || !shouldGateForwardScroll()) {
      return
    }

    event.preventDefault()
    enforceSelectionGate()
  }

  const keepFocusInBranches = (event) => {
    if (!isGateActive() || !archetypeContent?.contains(event.target)) {
      return
    }

    event.preventDefault()
    enforceSelectionGate({ focus: true })
  }

  coupleReveal?.addEventListener('click', revealAndScrollBranches)
  archetypeTriggers.forEach((trigger) => {
    trigger.addEventListener('click', selectArchetype)
  })
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('focusin', keepFocusInBranches)
  window.addEventListener('hashchange', syncBranchesWithHash)
  window.addEventListener('popstate', syncBranchesWithHash)
  syncBranchesWithHash()
})()
